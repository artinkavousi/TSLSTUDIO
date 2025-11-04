// @ts-nocheck
import { mix, uv, float } from 'three/tsl'
import type { PostEffect } from '../types'
import { vignetteNode } from '../nodes/vignette'

export type VignetteOptions = {
  smoothing?: number
  exponent?: number
  intensity?: number
}

export function createVignetteEffect({ smoothing = 0.45, exponent = 1.2, intensity = 1 }: VignetteOptions = {}): PostEffect {
  const vignette = vignetteNode()
  return ({ color }) => {
    const v = vignette(uv(), smoothing, exponent)
    return color.mul(mix(1.0, v, float(intensity)))
  }
}



