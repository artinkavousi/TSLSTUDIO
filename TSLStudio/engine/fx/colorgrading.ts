// @ts-nocheck
import { clamp, mix, pow, texture, vec3, float } from 'three/tsl'
import type { Data3DTexture } from 'three'
import type { NodeRepresentation } from 'three/tsl'
import type { PostEffect } from './types'
import { acesTonemap } from '@/tsl/utils/color/tonemapping'

export type ColorGradingOptions = {
  lut?: Data3DTexture | NodeRepresentation
  exposure?: number
  intensity?: number
  gamma?: number
}

export function createColorGradingEffect({
  lut,
  exposure = 0,
  intensity = 1,
  gamma = 1,
}: ColorGradingOptions = {}): PostEffect {
  const exposureScalar = Math.pow(2, exposure)
  const intensityNode = float(intensity)
  const gammaNode = float(gamma)
  const gammaInv = float(1).div(gammaNode.max(float(0.0001)))

  return ({ color }) => {
    let graded = color.mul(float(exposureScalar))
    graded = acesTonemap(graded)
    graded = pow(clamp(graded, 0.0, 1.0), vec3(gammaInv))

    let target = graded
    if (lut) {
      const lutSample = texture(lut as unknown as NodeRepresentation, clamp(graded, 0.0, 1.0)).xyz
      target = mix(graded, lutSample, intensityNode.clamp(0.0, 1.0))
    }

    return mix(color, target, intensityNode.clamp(0.0, 1.0))
  }
}


