import type { Texture, Vector2 } from 'three'
import { RenderTarget } from 'three/src/core/RenderTarget.js'
import TextureNode from 'three/src/nodes/accessors/TextureNode.js'
import { float, texture, uv, vec2 } from 'three/tsl'

import type { PostEffect } from '../types'; 

export interface DepthOfFieldOptions {
  depthKey?: string
  focusDistance?: number
  focusRange?: number
  maxBlurRadius?: number
  tapPattern?: Array<[number, number]>
}

const DEFAULT_TAPS: Array<[number, number]> = [
  [0, 0],
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
  [1, 1],
  [-1, 1],
  [1, -1],
  [-1, -1],
]

const isRenderTarget = (value: RenderTarget | Texture): value is RenderTarget => (value as RenderTarget).isRenderTarget === true

const getTexel = (size: Vector2) => vec2(1 / Math.max(size.x, 1), 1 / Math.max(size.y, 1))

export function createDepthOfFieldEffect(options: DepthOfFieldOptions = {}): PostEffect {
  const depthKey = options.depthKey ?? 'scene.depth'
  const focusDistance = options.focusDistance ?? 1.5
  const focusRange = Math.max(0.0001, options.focusRange ?? 0.75)
  const maxBlurRadius = options.maxBlurRadius ?? 6
  const taps = options.tapPattern ?? DEFAULT_TAPS

  return ({ color, input, resources, size }) => {
    const resource = resources.get(depthKey) as RenderTarget | Texture | undefined
    if (!resource) {
      return color
    }

    const depthTexture = isRenderTarget(resource) ? resource.texture : resource
    const depthNode = texture(new TextureNode(depthTexture), uv())
    const depth = depthNode.x

    const focus = float(focusDistance)
    const range = float(focusRange)
    const maxBlur = float(maxBlurRadius)
    const coc = depth.sub(focus).abs().div(range).clamp(0, 1)
    const blurRadius = maxBlur.mul(coc)

    const texel = getTexel(size as Vector2)

    const accum = color.mul(1)
    const weight = float(1)

    for (const [ox, oy] of taps) {
      const offset = vec2(ox, oy)
      const sampleUV = uv().add(offset.mul(blurRadius).mul(texel))
      const sampleColor = texture(input, sampleUV).xyz
      accum.addAssign(sampleColor)
      weight.addAssign(1)
    }

    return accum.div(weight)
  }
}

