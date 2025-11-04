// @ts-nocheck
import type { RenderTarget, Texture } from 'three'
import { vec2, vec3, uv, texture, float } from 'three/tsl'
import TextureNode from 'three/src/nodes/accessors/TextureNode.js'
import type { PostEffect } from '../types'

export type DepthOfFieldOptions = {
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

export function createDepthOfFieldEffect(options: DepthOfFieldOptions = {}): PostEffect {
  const depthKey = options.depthKey ?? 'scene.depth'
  const focusDistance = options.focusDistance ?? 1.5
  const focusRange = Math.max(0.0001, options.focusRange ?? 0.75)
  const maxBlurRadius = options.maxBlurRadius ?? 6.0
  const taps = options.tapPattern ?? DEFAULT_TAPS

  return ({ color, input, resources, size }) => {
    const resource = resources.get(depthKey) as RenderTarget | Texture | undefined
    if (!resource) {
      return color
    }

    const textureResource = (resource as RenderTarget).isRenderTarget ? (resource as RenderTarget).texture : (resource as Texture)
    const depthNode = texture(new TextureNode(textureResource), uv())
    const depth = depthNode.x

    const focus = float(focusDistance)
    const range = float(focusRange)
    const maxBlur = float(maxBlurRadius)
    const coc = depth.sub(focus).abs().div(range).clamp(0.0, 1.0)
    const blurRadius = maxBlur.mul(coc)

    const texel = vec2(1 / size.x, 1 / size.y)

    let accum = color.mul(1.0)
    let weight = float(1.0)

    for (let i = 0; i < taps.length; i++) {
      const [ox, oy] = taps[i]
      const offset = vec2(ox, oy)
      const sampleUV = uv().add(offset.mul(blurRadius).mul(texel))
      const sampleColor = texture(input, sampleUV).xyz
      accum = accum.add(sampleColor)
      weight = weight.add(1.0)
    }

    return accum.div(weight)
  }
}


