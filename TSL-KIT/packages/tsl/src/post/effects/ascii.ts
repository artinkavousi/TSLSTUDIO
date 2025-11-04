import {
  PI,
  abs,
  color,
  dot,
  float,
  floor,
  fract,
  mix,
  screenSize,
  sin,
  texture,
  uv,
  vec2,
  vec3,
} from 'three/tsl'

import type { PostEffect } from '../types'; 

export interface AsciiEffectOptions {
  cellSize?: number
  contrast?: number
  intensity?: number
  tint?: string
}

export function createAsciiEffect({
  cellSize = 8,
  contrast = 1.35,
  intensity = 1,
  tint = '#45ff9a',
}: AsciiEffectOptions = {}): PostEffect {
  const cell = float(Math.max(1, Math.floor(cellSize)))
  const contrastNode = float(Math.max(0.1, contrast))
  const intensityNode = float(Math.max(0, Math.min(intensity, 1)))
  const tintNode = color(tint)

  return ({ color, input }) => {
    const texel = cell.div(screenSize)
    const baseUV = uv()
    const gridUV = baseUV.div(texel)
    const snappedUV = floor(gridUV).mul(texel).add(texel.mul(0.5))

    const sample = texture(input, snappedUV).xyz
    const luma = dot(sample, vec3(0.299, 0.587, 0.114)).clamp(0, 1)

    const levels = float(8)
    const quantized = floor(luma.mul(levels)).div(levels.sub(1)).clamp(0, 1)

    const local = fract(gridUV)
    const stripeX = abs(sin(local.x.mul(PI.mul(4))))
    const stripeY = abs(sin(local.y.mul(PI.mul(8))))
    const stroke = float(1).sub(stripeX.mul(stripeY)).mul(quantized.mul(contrastNode)).clamp(0, 1)

    const asciiColor = mix(vec3(0.04), tintNode.rgb, stroke)
    const shaded = asciiColor.mul(quantized.mul(contrastNode).clamp(0, 1))

    return mix(color, shaded, intensityNode)
  }
}

