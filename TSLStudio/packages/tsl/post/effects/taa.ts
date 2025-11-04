// @ts-nocheck
import { Vector2 } from 'three'
import type { Camera } from 'three'
import { RenderTarget } from 'three/src/core/RenderTarget.js'
import PostProcessing from 'three/src/renderers/common/PostProcessing.js'
import { uv, texture, mix, float, vec4, uniform } from 'three/tsl'
import TextureNode from 'three/src/nodes/accessors/TextureNode.js'
import type { FramePass, FramegraphSetupContext, FramegraphExecutionContext } from '@engine/core/framegraph'

type HaltonPair = [number, number]

const DEFAULT_SAMPLES = 8
const DEFAULT_RESPONSE = 0.9
const DEFAULT_CLAMP = 0.008

function halton(index: number, base: number) {
  let f = 1
  let result = 0
  let i = index
  while (i > 0) {
    f /= base
    result += f * (i % base)
    i = Math.floor(i / base)
  }
  return result
}

function halton23Sequence(count: number): HaltonPair[] {
  const seq: HaltonPair[] = []
  for (let i = 1; i <= count; i++) {
    seq.push([halton(i, 2), halton(i, 3)])
  }
  return seq
}

type TAATargets = {
  current: RenderTarget
  historyA: RenderTarget
  historyB: RenderTarget
}

type TemporalAAState = {
  targets: TAATargets | null
  size: Vector2
  halton: HaltonPair[]
  jitterIndex: number
  historyParity: 0 | 1
  undoJitter: (() => void) | null
  resolver: {
    post: PostProcessing
    currentNode: TextureNode
    historyNode: TextureNode
    blendUniform: ReturnType<typeof uniform>
  } | null
  historyValid: boolean
}

export type TemporalAAOptions = {
  baseKey?: string
  sampleCount?: number
  response?: number
  clampDiff?: number
  jitterSpread?: number
  priorityOffset?: number
  resolvePriority?: number
}

export type TemporalAAPasses = {
  passes: [FramePass, FramePass]
  currentTargetKey: string
  resolvedTargetKey: string
}

function createRenderTarget(width: number, height: number) {
const target = new RenderTarget(width, height)
  target.texture.name = 'taa-target'
  return target
}

function ensureTargets(state: TemporalAAState, size: Vector2) {
  if (!state.targets) {
    state.targets = {
      current: createRenderTarget(size.x, size.y),
      historyA: createRenderTarget(size.x, size.y),
      historyB: createRenderTarget(size.x, size.y),
    }
    state.size.copy(size)
    return
  }

  if (!state.size.equals(size)) {
    for (const target of Object.values(state.targets)) {
      target.setSize(size.x, size.y)
    }
    state.size.copy(size)
    state.historyValid = false
  }
}

function applyCameraJitter(camera: Camera, size: Vector2, jitter: Vector2): () => void {
  if ((camera as any).isPerspectiveCamera && typeof (camera as any).setViewOffset === 'function') {
    const width = size.x
    const height = size.y
    const offsetX = jitter.x
    const offsetY = jitter.y
    ;(camera as any).setViewOffset(width, height, offsetX, offsetY, width, height)
    ;(camera as any).updateProjectionMatrix()

    return () => {
      ;(camera as any).clearViewOffset()
      ;(camera as any).updateProjectionMatrix()
    }
  }

  if ((camera as any).isOrthographicCamera) {
    const ortho = camera as any
    const width = size.x
    const height = size.y
    const dx = (jitter.x / width) * (ortho.right - ortho.left)
    const dy = (jitter.y / height) * (ortho.top - ortho.bottom)

    ortho.left += dx
    ortho.right += dx
    ortho.top += dy
    ortho.bottom += dy
    ortho.updateProjectionMatrix()

    return () => {
      ortho.left -= dx
      ortho.right -= dx
      ortho.top -= dy
      ortho.bottom -= dy
      ortho.updateProjectionMatrix()
    }
  }

  return () => {}
}

function ensureResolver(
  state: TemporalAAState,
  renderer: import('three/webgpu').WebGPURenderer,
  clampDiff: number,
) {
  if (!state.resolver) {
    const post = new PostProcessing(renderer)
    post.outputColorTransform = false
    const currentNode = new TextureNode()
    const historyNode = new TextureNode()
    const blendUniform = uniform(0)

    const currentSample = texture(currentNode, uv()).toVar()
    const historySample = texture(historyNode, uv()).toVar()

    let historyColor = historySample.xyz

    if (clampDiff > 0) {
      const delta = currentSample.xyz.sub(historySample.xyz)
      const clampNode = float(clampDiff)
      const clampedDelta = delta.clamp(clampNode.mul(-1), clampNode)
      historyColor = historySample.xyz.add(clampedDelta)
    }

    const blended = mix(currentSample.xyz, historyColor, blendUniform)
    post.outputNode = vec4(blended, currentSample.w)

    state.resolver = { post, currentNode, historyNode, blendUniform }
  }

  return state.resolver
}

export function createTemporalAAPasses(options: TemporalAAOptions = {}): TemporalAAPasses {
  const baseKey = options.baseKey ?? 'taa'
  const currentKey = `${baseKey}.current`
  const historyReadKey = `${baseKey}.history.read`
  const historyWriteKey = `${baseKey}.history.write`
  const resolvedKey = `${baseKey}.resolved`

  const sampleCount = Math.max(1, options.sampleCount ?? DEFAULT_SAMPLES)
  const haltonSequence = halton23Sequence(sampleCount)
  const jitterSpread = options.jitterSpread ?? 0.75
  const response = Math.max(0, Math.min(options.response ?? DEFAULT_RESPONSE, 0.999))
  const clampDiff = Math.max(0, options.clampDiff ?? DEFAULT_CLAMP)

  const state: TemporalAAState = {
    targets: null,
    size: new Vector2(1, 1),
    halton: haltonSequence,
    jitterIndex: 0,
    historyParity: 0,
    undoJitter: null,
    resolver: null,
    historyValid: false,
  }

  const jitterPass: FramePass = {
    name: `${baseKey}:jitter`,
    priority: (options.priorityOffset ?? -50),
    setup: ({ renderer, resources }: FramegraphSetupContext) => {
      const tempSize = new Vector2()
      ;(renderer as import('three/webgpu').WebGPURenderer).getDrawingBufferSize(tempSize)
      ensureTargets(state, tempSize)
      if (state.targets) {
        resources.set(currentKey, state.targets.current)
        resources.set(resolvedKey, state.targets.historyA)
      }
      return () => {
        state.resolver?.post.dispose()
        state.resolver = null
        if (state.targets) {
          state.targets.current.dispose()
          state.targets.historyA.dispose()
          state.targets.historyB.dispose()
          state.targets = null
        }
      }
    },
    exec: (context: FramegraphExecutionContext) => {
      const renderer = context.renderer as import('three/webgpu').WebGPURenderer
      const size = context.size
      ensureTargets(state, size)
      const targets = state.targets!

      const sample = state.halton[state.jitterIndex % state.halton.length]
      state.jitterIndex += 1
      const jitter = new Vector2((sample[0] - 0.5) * jitterSpread, (sample[1] - 0.5) * jitterSpread)

      state.undoJitter = applyCameraJitter(context.camera, size, jitter)

      const historyRead = state.historyParity === 0 ? targets.historyA : targets.historyB
      const historyWrite = state.historyParity === 0 ? targets.historyB : targets.historyA

      context.resources.set(currentKey, targets.current)
      context.resources.set(historyReadKey, historyRead)
      context.resources.set(historyWriteKey, historyWrite)
    },
  }

  const resolvePass: FramePass = {
    name: `${baseKey}:resolve`,
    priority: options.resolvePriority ?? 20,
    inputs: [currentKey, historyReadKey],
    outputs: [resolvedKey],
    exec: (context: FramegraphExecutionContext) => {
      const renderer = context.renderer as import('three/webgpu').WebGPURenderer
      const currentTarget = context.resources.get(currentKey) as RenderTarget | undefined
      const historyRead = context.resources.get(historyReadKey) as RenderTarget | undefined
      const historyWrite = context.resources.get(historyWriteKey) as RenderTarget | undefined

      if (!currentTarget || !historyRead || !historyWrite) {
        return
      }

      const resolver = ensureResolver(state, renderer, clampDiff)
      resolver.currentNode.value = currentTarget.texture
      resolver.historyNode.value = historyRead.texture
      resolver.blendUniform.value = state.historyValid ? response : 0
      resolver.post.needsUpdate = true

      const prevTarget = renderer.getRenderTarget()
      renderer.setRenderTarget(historyWrite)
      resolver.post.render()
      renderer.setRenderTarget(prevTarget)

      context.resources.set(resolvedKey, historyWrite)
      state.historyParity = state.historyParity === 0 ? 1 : 0
      state.historyValid = true

      state.undoJitter?.()
      state.undoJitter = null
    },
  }

  return {
    passes: [jitterPass, resolvePass],
    currentTargetKey: currentKey,
    resolvedTargetKey: resolvedKey,
  }
}


