import { abs, color, dot, float, screenSize, texture, uv, vec2, vec3 } from 'three/tsl'

import type { PostEffect } from '../types'; 

export interface EdgeDetectionOptions {
  strength?: number
  threshold?: number
  outlineColor?: string
  backgroundBlend?: number
}

export function createEdgeDetectionEffect({
  strength = 1.0,
  threshold = 0.1,
  outlineColor = '#ffffff',
  backgroundBlend = 0.25,
}: EdgeDetectionOptions = {}): PostEffect {
  const strengthNode = float(Math.max(0, strength))
  const thresholdNode = float(Math.max(0, threshold))
  const texel = vec2(1).div(screenSize)
  const outline = color(outlineColor)
  const backgroundMix = float(Math.max(0, Math.min(backgroundBlend, 1)))

  return ({ color, input }) => {
    const offsets = [
      vec2(-1, -1),
      vec2(0, -1),
      vec2(1, -1),
      vec2(-1, 0),
      vec2(0, 0),
      vec2(1, 0),
      vec2(-1, 1),
      vec2(0, 1),
      vec2(1, 1),
    ] as const

    const kernelX = [-1, 0, 1, -2, 0, 2, -1, 0, 1] as const
    const kernelY = [-1, -2, -1, 0, 0, 0, 1, 2, 1] as const

    const gx = float(0).toVar()
    const gy = float(0).toVar()

    for (let i = 0; i < offsets.length; i += 1) {
      const offset = offsets[i]
      const sample = texture(input, uv().add(offset.mul(texel))).xyz
      const luminance = dot(sample, vec3(0.299, 0.587, 0.114))
      gx.addAssign(float(kernelX[i]).mul(luminance))
      gy.addAssign(float(kernelY[i]).mul(luminance))
    }

    const gradient = abs(gx).add(abs(gy)).mul(strengthNode)
    const outlineMask = gradient.greaterThan(thresholdNode).select(float(1), gradient.div(thresholdNode).clamp(0, 1))
    const edgeColor = outline.mul(outlineMask)
    const background = color.mul(float(1).sub(outlineMask.mul(backgroundMix)))
    return background.add(edgeColor)
  }
}

