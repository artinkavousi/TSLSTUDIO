import { clamp, dot, float, mix, vec3 } from 'three/tsl'

import type { PostEffect } from 

type Vec3Tuple = [number, number, number]

const LUMA_WEIGHTS = vec3(0.299, 0.587, 0.114)

const toVec3 = (values: Vec3Tuple | number | undefined, fallback: Vec3Tuple = [0, 0, 0]) => {
  if (values === undefined) return vec3(...fallback)
  if (typeof values === 'number') {
    return vec3(values)
  }
  return vec3(values[0], values[1], values[2])
}

export interface ColorCurvesOptions {
  /** Slope multiplies the incoming color before applying power (ASC CDL). */
  slope?: Vec3Tuple | number
  /** Offset adds a bias before the power stage (ASC CDL). */
  offset?: Vec3Tuple | number
  /** Power applies a per-channel exponent (ASC CDL). */
  power?: Vec3Tuple | number
  /** Lift applies an additive lift after CDL processing. */
  lift?: Vec3Tuple | number
  /** Gamma adjusts midtone response after lift. Values > 1 darken midtones. */
  gamma?: Vec3Tuple | number
  /** Gain scales the result after gamma, affecting highlights primarily. */
  gain?: Vec3Tuple | number
  /** Contrast multiplier around a pivot (0.5 by default). */
  contrast?: number
  /** Pivot value for contrast (0.0-1.0 range). */
  pivot?: number
  /** Saturation multiplier (1 = original, 0 = monochrome). */
  saturation?: number
}

export function createColorCurvesEffect(options: ColorCurvesOptions = {}): PostEffect {
  const slope = toVec3(options.slope, [1, 1, 1])
  const offset = toVec3(options.offset)
  const power = toVec3(options.power, [1, 1, 1]).max(vec3(0.0001))
  const lift = toVec3(options.lift)
  const gamma = toVec3(options.gamma, [1, 1, 1]).max(vec3(0.0001))
  const gain = toVec3(options.gain, [1, 1, 1])
  const contrast = float(options.contrast ?? 1)
  const pivot = float(options.pivot ?? 0.5)
  const saturation = float(options.saturation ?? 1)

  return ({ color }) => {
    const base = color.xyz
    const graded = base.mul(slope).add(offset).clamp(0, 1).pow(vec3(1).div(power))
    const lifted = graded.add(lift)
    const gammaCorrected = clamp(lifted, 0, 1).pow(vec3(1).div(gamma))
    const gained = gammaCorrected.mul(gain)

    const contrasted = mix(pivot, gained.sub(pivot).mul(contrast).add(pivot), float(1))
    const luminance = dot(contrasted, LUMA_WEIGHTS)
    const saturated = mix(vec3(luminance), contrasted, saturation)

    return saturated.clamp(0, 1)
  }
}

