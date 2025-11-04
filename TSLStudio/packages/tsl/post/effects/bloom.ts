// @ts-nocheck
import { Fn, uv, vec2, vec3, float, texture, max, screenSize } from 'three/tsl'
import type { PostEffect } from '../types'

export type BloomOptions = {
  threshold?: number
  strength?: number
  radius?: number
}

export function createBloomEffect({ threshold = 1.0, strength = 0.5, radius = 1.5 }: BloomOptions = {}): PostEffect {
  const kernel = Fn(([input]) => {
    const baseUV = uv()
    const texel = vec2(1).div(screenSize)
    const r = texel.mul(float(radius))

    const offsets = [
      vec2(0, 0),
      vec2(1, 0),
      vec2(-1, 0),
      vec2(0, 1),
      vec2(0, -1),
      vec2(1, 1),
      vec2(-1, 1),
      vec2(1, -1),
      vec2(-1, -1),
    ] as const

    let sum = vec3(0).toVar()
    for (let i = 0; i < offsets.length; i++) {
      const sample = texture(input, baseUV.add(offsets[i].mul(r))).xyz
      const bright = max(sample.sub(float(threshold)), 0.0)
      sum.addAssign(bright)
    }

    const avg = sum.div(offsets.length)
    return avg.mul(float(strength))
  })

  return ({ color, input }) => color.add(kernel(input))
}


