// @ts-nocheck
import { Fn, uv, vec2, vec3, float, texture, max, screenSize } from 'three/tsl'

export type BloomParams = {
  threshold?: number
  strength?: number
  radius?: number
}

/**
 * Simple single-pass bloom approximation sampling neighbors.
 * Input is expected to be a texture node; output is the additive bloom color.
 */
export function bloom({ threshold = 1.0, strength = 0.5, radius = 1.5 }: BloomParams = {}) {
  const uThresh = float(threshold)
  const uStrength = float(strength)
  const uRadius = float(radius)

  return Fn(([input]) => {
    const baseUV = uv()
    const texel = vec2(1).div(screenSize)
    const r = texel.mul(uRadius)

    // 9-tap kernel around current uv
    const offsets = [
      vec2(0, 0),
      vec2(1, 0), vec2(-1, 0), vec2(0, 1), vec2(0, -1),
      vec2(1, 1), vec2(-1, 1), vec2(1, -1), vec2(-1, -1),
    ] as const

    let sum = vec3(0).toVar()
    for (let i = 0; i < offsets.length; i++) {
      const sample = texture(input, baseUV.add(offsets[i].mul(r))).xyz
      const bright = max(sample.sub(uThresh), 0.0)
      sum.addAssign(bright)
    }

    const avg = sum.div(offsets.length)
    return avg.mul(uStrength)
  })
}



