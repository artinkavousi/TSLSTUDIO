import type { Data3DTexture } from 'three'
import { clamp, float, mix, pow, texture, vec3 } from 'three/tsl'
import type { ShaderNodeObject } from 'three/tsl'
import type { Node } from 'three/webgpu'

import { acesTonemap, reinhardTonemap, uncharted2Tonemap } from '../../utils/color/tonemapping';
import type { PostEffect } from '../types'; 

export interface ColorGradingOptions {
  lut?: Data3DTexture | ShaderNodeObject<Node>
  exposure?: number
  intensity?: number
  gamma?: number
  tonemapCurve?: 'ACES' | 'Reinhard' | 'Uncharted2' | false
}

export function createColorGradingEffect({
  lut,
  exposure = 0,
  intensity = 1,
  gamma = 1,
  tonemapCurve = 'ACES',
}: ColorGradingOptions = {}): PostEffect {
  const exposureScalar = Math.pow(2, exposure)
  const intensityNode = float(intensity).clamp(0, 1)
  const gammaNode = float(gamma).max(0.0001)
  const gammaInv = float(1).div(gammaNode)

  return ({ color }) => {
    const exposed = color.mul(float(exposureScalar))
    const tonemapped = (() => {
      if (tonemapCurve === false) return exposed
      if (tonemapCurve === 'Reinhard') return reinhardTonemap(exposed)
      if (tonemapCurve === 'Uncharted2') return uncharted2Tonemap(exposed)
      return acesTonemap(exposed)
    })()
    const graded = pow(clamp(tonemapped, 0, 1), vec3(gammaInv))

    let target = graded
    if (lut) {
      const lutNode = lut as ShaderNodeObject<Node>
      const lutSample = texture(lutNode, clamp(graded, 0, 1)).xyz
      target = mix(graded, lutSample, intensityNode)
    }

    return mix(color, target, intensityNode)
  }
}

