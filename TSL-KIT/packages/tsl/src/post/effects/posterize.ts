import { float, floor, mix, pow, texture, uv, vec3 } from 'three/tsl'

import type { PostEffect } from '../types'; 

export interface PosterizeEffectOptions {
  levels?: number
  gamma?: number
  intensity?: number
}

export function createPosterizeEffect({ levels = 5, gamma = 1.0, intensity = 1.0 }: PosterizeEffectOptions = {}): PostEffect {
  const levelNode = float(Math.max(2, Math.round(levels)))
  const gammaNode = float(Math.max(0.001, gamma))
  const intensityNode = float(Math.max(0, Math.min(intensity, 1)))

  return ({ color, input }) => {
    const sample = texture(input, uv()).xyz
    const corrected = pow(sample, vec3(gammaNode))
    const quantized = floor(corrected.mul(levelNode)).div(levelNode.sub(1)).clamp(0, 1)
    const posterized = pow(quantized, vec3(1).div(gammaNode))
    return mix(color, posterized, intensityNode)
  }
}

