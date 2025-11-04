import { float, length, texture, uv, vec2, vec3 } from 'three/tsl'

import type { PostEffect } from '../types'; 

export interface ChromaticAberrationOptions {
  offset?: number
  radialIntensity?: number
}

export function createChromaticAberrationEffect({ offset = 0.0015, radialIntensity = 1.0 }: ChromaticAberrationOptions = {}): PostEffect {
  return ({ color, input }) => {
    const center = uv().sub(vec2(0.5))
    const radius = length(center)
    const strength = float(offset).mul(float(radialIntensity).mul(radius))
    const direction = center.normalize().mul(strength)

    const sampleR = texture(input, uv().add(direction)).xyz
    const sampleB = texture(input, uv().sub(direction)).xyz

    const aberrated = vec3(sampleR.x, color.y, sampleB.z)
    const blend = strength.mul(180).clamp(0, 1)
    return color.mix(aberrated, blend)
  }
}

