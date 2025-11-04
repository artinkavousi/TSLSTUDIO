import { Clock, Scene, Camera, Vector2, RenderTarget } from 'three'
import type { WebGPURenderer } from 'three/webgpu'

export type FramegraphResourceMap = Map<string, unknown>

export type FramegraphExecutionContext = {
  renderer: WebGPURenderer
  scene: Scene
  camera: Camera
  delta: number
  /** Accumulated time since the framegraph started running (seconds). */
  elapsed: number
  /** High-resolution timestamp captured before executing passes (milliseconds). */
  timestamp: number
  frame: number
  size: Vector2
  resources: FramegraphResourceMap
  userData: Record<string, unknown>
}

export type FramegraphSetupContext = {
  renderer: WebGPURenderer
  resources: FramegraphResourceMap
  userData: Record<string, unknown>
}

export type FramePassResult = Record<string, unknown> | void

export interface FramePass {
  name: string
  /** Optional list of resource keys required before executing the pass. */
  inputs?: string[]
  /** Optional list of resource keys produced by the pass. */
  outputs?: string[]
  /** Lower values execute first; defaults to `0`. */
  priority?: number
  /** Toggle execution without removing the pass. */
  enabled?: boolean
  /** Optional setup hook executed once when the pass is added. */
  setup?: (context: FramegraphSetupContext) => void | (() => void)
  /** Main execution body, called every frame. */
  exec: (context: FramegraphExecutionContext) => Promise<FramePassResult> | FramePassResult
}

export type FramegraphProfile = {
  frame: number
  delta: number
  timestamp: number
  passes: Array<{
    name: string
    duration: number
  }>
}

export type FramegraphOptions = {
  /** Pre-populate the resource map; useful for shared buffers between graphs. */
  resources?: FramegraphResourceMap
  /** Enable per-pass profiling (default: true). */
  profile?: boolean
}

type PassCleanup = (() => void) | void

const performanceNow = () => {
  if (typeof performance !== 'undefined' && performance.now) {
    return performance.now()
  }
  return Date.now()
}

export class Framegraph {
  private readonly renderer: WebGPURenderer
  private readonly passes: FramePass[] = []
  private readonly passCleanups = new Map<FramePass, PassCleanup>()
  private readonly resources: FramegraphResourceMap
  private readonly clock = new Clock()
  private readonly size = new Vector2()
  private readonly profilerListeners = new Set<(profile: FramegraphProfile) => void>()
  private profilingEnabled: boolean
  private frame = 0
  private elapsed = 0
  private readonly userData: Record<string, unknown> = Object.create(null)

  constructor(renderer: WebGPURenderer, options: FramegraphOptions = {}) {
    this.renderer = renderer
    this.resources = options.resources ?? new Map()
    this.profilingEnabled = options.profile ?? true
    this.clock.start()
  }

  addPass(pass: FramePass): FramePass {
    this.passes.push(pass)
    this.sortPasses()

    if (pass.setup) {
      const cleanup = pass.setup({ renderer: this.renderer, resources: this.resources, userData: this.userData })
      this.passCleanups.set(pass, cleanup)
    }

    return pass
  }

  removePass(passOrName: FramePass | string): void {
    const index = this.passes.findIndex((pass) => pass === passOrName || pass.name === passOrName)
    if (index === -1) return

    const [pass] = this.passes.splice(index, 1)
    const cleanup = this.passCleanups.get(pass)
    if (typeof cleanup === 'function') {
      try {
        cleanup()
      } catch (error) {
        console.warn(`[Framegraph] Failed to cleanup pass "${pass.name}"`, error)
      }
    }
    this.passCleanups.delete(pass)
  }

  hasPass(name: string): boolean {
    return this.passes.some((pass) => pass.name === name)
  }

  setEnabled(name: string, enabled: boolean): void {
    const pass = this.passes.find((p) => p.name === name)
    if (pass) {
      pass.enabled = enabled
    }
  }

  setProfilingEnabled(enabled: boolean): void {
    this.profilingEnabled = enabled
  }

  isProfilingEnabled(): boolean {
    return this.profilingEnabled
  }

  addProfilerListener(listener: (profile: FramegraphProfile) => void): void {
    this.profilerListeners.add(listener)
  }

  removeProfilerListener(listener: (profile: FramegraphProfile) => void): void {
    this.profilerListeners.delete(listener)
  }

  setResource(key: string, value: unknown): void {
    this.resources.set(key, value)
  }

  getResource<T = unknown>(key: string): T | undefined {
    return this.resources.get(key) as T | undefined
  }

  deleteResource(key: string): void {
    this.resources.delete(key)
  }

  getUserData<T = unknown>(key: string): T | undefined {
    return this.userData[key] as T | undefined
  }

  setUserData(key: string, value: unknown): void {
    this.userData[key] = value
  }

  clear(): void {
    while (this.passes.length) {
      this.removePass(this.passes[0])
    }
    this.resources.clear()
    for (const key of Object.keys(this.userData)) {
      delete this.userData[key]
    }
  }

  async render(scene: Scene, camera: Camera, delta?: number): Promise<void> {
    const dt = delta !== undefined ? delta : this.clock.getDelta()
    if (delta === undefined) {
      this.elapsed = this.clock.elapsedTime
    } else {
      this.elapsed += dt
    }

    this.renderer.getSize(this.size)
    const timestamp = performanceNow()

    const profile: FramegraphProfile | null = this.profilingEnabled
      ? { frame: this.frame, delta: dt, timestamp, passes: [] }
      : null

    const context: FramegraphExecutionContext = {
      renderer: this.renderer,
      scene,
      camera,
      delta: dt,
      elapsed: this.elapsed,
      timestamp,
      frame: this.frame,
      size: this.size,
      resources: this.resources,
      userData: this.userData,
    }

    for (const pass of this.passes) {
      if (pass.enabled === false) continue

      if (pass.inputs) {
        for (const key of pass.inputs) {
          if (!this.resources.has(key)) {
            throw new Error(`Framegraph pass "${pass.name}" is missing required resource "${key}"`)
          }
        }
      }

      const start = this.profilingEnabled ? performanceNow() : 0

      try {
        const result = await pass.exec(context)
        if (result && typeof result === 'object') {
          for (const [key, value] of Object.entries(result)) {
            this.resources.set(key, value)
          }
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        const failure = new Error(`Framegraph pass "${pass.name}" failed: ${message}`)
        if (error instanceof Error) {
          ;(failure as Error & { cause?: unknown }).cause = error
        }
        throw failure
      }

      if (profile) {
        profile.passes.push({
          name: pass.name,
          duration: performanceNow() - start,
        })
      }
    }

    if (profile) {
      for (const listener of this.profilerListeners) {
        try {
          listener(profile)
        } catch (error) {
          console.warn('[Framegraph] Profiler listener error', error)
        }
      }
    }

    this.frame += 1
  }

  dispose(): void {
    this.clear()
  }

  private sortPasses(): void {
    this.passes.sort((a, b) => (a.priority ?? 0) - (b.priority ?? 0))
  }
}

export type ScenePassOptions = {
  /** Render target or resource key to render into. Defaults to the backbuffer. */
  target?: RenderTarget | string | null
  /** Resource key bound to the render target texture after rendering. */
  output?: string
  /** Overrides renderer.autoClear during this pass. */
  clear?: boolean
  /** Optional callback invoked before rendering the scene. */
  onBeforeRender?: (context: FramegraphExecutionContext) => void
  /** Optional callback invoked after rendering the scene. */
  onAfterRender?: (context: FramegraphExecutionContext) => void
}

export function createScenePass(options: ScenePassOptions = {}): FramePass {
  const { target, output, clear, onBeforeRender, onAfterRender } = options
  return {
    name: 'scene',
    outputs: output ? [output] : undefined,
    exec: (context) => {
      onBeforeRender?.(context)
      if (import.meta.env?.DEV) {
        let warned = false
        context.scene.traverse((object: any) => {
          if (warned) return
          if (object?.isMesh && object.geometry) {
            if (!object.geometry.getAttribute('uv')) {
              console.warn('[framegraph] missing uv attribute on mesh', object.name || object.type)
              warned = true
            }
          }
        })
      }
      const renderTarget = selectRenderTarget(context, target)
      const previousTarget = context.renderer.getRenderTarget()
      const previousAutoClear = context.renderer.autoClear

      context.renderer.setRenderTarget(renderTarget)
      if (clear !== undefined) {
        context.renderer.autoClear = clear
      }

      context.renderer.render(context.scene, context.camera)

      context.renderer.setRenderTarget(previousTarget)
      context.renderer.autoClear = previousAutoClear

      onAfterRender?.(context)

      if (output && renderTarget) {
        return { [output]: renderTarget.texture }
      }

      return undefined
    },
  }
}

function selectRenderTarget(
  context: FramegraphExecutionContext,
  target: ScenePassOptions['target'],
): RenderTarget | null {
  if (target === null || target === undefined) {
    return null
  }

  if (typeof target === 'string') {
    const value = context.resources.get(target)
    return (value as RenderTarget | undefined) ?? null
  }

  return target
}


