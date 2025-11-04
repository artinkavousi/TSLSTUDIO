import { color, dot, float, mix, texture, uv, vec3 } from 'three/tsl'

import type { PostEffect } from '../types'; 

export interface DuotoneEffectOptions {
  shadows?: string
  highlights?: string
  midpoint?: number
  softness?: number
  intensity?: number
}

export function createDuotoneEffect({
  shadows = '#0a0a1a',
  highlights = '#ffb347',
  midpoint = 0.45,
  softness = 0.25,
  intensity = 1,
}: DuotoneEffectOptions = {}): PostEffect {
  const shadowColor = color(shadows)
  const highlightColor = color(highlights)
  const midpointNode = float(midpoint)
  const softnessNode = float(Math.max(0.001, softness))
  const intensityNode = float(Math.max(0, Math.min(intensity, 1)))

  return ({ color, input }) => {
    const sample = texture(input, uv()).xyz
    const luma = dot(sample, vec3(0.299, 0.587, 0.114))
    const ramp = luma.sub(midpointNode).div(softnessNode).clamp(-1, 1)
    const weight = ramp.mul(0.5).add(0.5)
    const toned = mix(shadowColor, highlightColor, weight)
    return mix(color, toned, intensityNode)
  }
}

