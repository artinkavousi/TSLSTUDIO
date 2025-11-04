import { abs, dot, float, floor, fract, mix, sin, texture, time, uv, vec2, vec3 } from 'three/tsl'

import type { PostEffect } from '../types'; 

export interface GlitchEffectOptions {
  amount?: number
  speed?: number
  slices?: number
}

export function createGlitchEffect({ amount = 0.035, speed = 2.5, slices = 24 }: GlitchEffectOptions = {}): PostEffect {
  const strength = float(Math.max(0, amount))
  const speedNode = float(Math.max(0.01, speed))
  const sliceCount = float(Math.max(1, Math.round(slices)))

  return ({ color, input }) => {
    const baseUV = uv()
    const t = time.mul(speedNode)
    const sliceIndex = floor(baseUV.y.mul(sliceCount))
    const slicePhase = fract(sin(sliceIndex.mul(12.9898).add(t)).mul(43758.5453))
    const direction = sin(sliceIndex.mul(3.14159265).add(t))
    const offset = strength.mul(slicePhase.sub(0.5)).mul(direction)

    const chroma = strength.mul(1.5)
    const offsetVec = vec2(offset, 0)

    const r = texture(input, baseUV.add(offsetVec.add(vec2(0, 0.001).mul(chroma)))).x
    const g = texture(input, baseUV.add(offsetVec)).y
    const b = texture(input, baseUV.sub(offsetVec.add(vec2(0, 0.001).mul(chroma)))).z

    const noise = abs(fract(sin(dot(vec2(sliceIndex, slicePhase), vec2(12.9898, 78.233))).mul(43758.5453)).sub(0.5))
    const jitter = float(1).sub(noise.mul(strength.mul(6))).clamp(0.7, 1.0)

    const glitchColor = vec3(r, g, b).mul(jitter)

    return mix(glitchColor, color, float(0.4))
  }
}

