// @ts-nocheck
import { uv, vec2, texture, float, vec3, length } from 'three/tsl'
import type { PostEffect } from './types'

export type ChromaticAberrationOptions = {
  offset?: number
  radialIntensity?: number
}

export function createChromaticAberrationEffect({ offset = 0.0015, radialIntensity = 1.0 }: ChromaticAberrationOptions = {}): PostEffect {
  return ({ color, input }) => {
    const center = uv().sub(vec2(0.5))
    const radius = length(center)
    const strength = float(offset).mul(float(radialIntensity).mul(radius))

    const dir = center.normalize().mul(strength)

    const sampleR = texture(input, uv().add(dir)).xyz
    const sampleB = texture(input, uv().sub(dir)).xyz

    const aberrated = vec3(sampleR.x, color.y, sampleB.z)
    const blend = strength.mul(180).clamp(0.0, 1.0)
    return color.mix(aberrated, blend)
  }
}


