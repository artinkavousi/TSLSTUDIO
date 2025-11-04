// @ts-nocheck
import { Fn, texture, uv, vec3 } from 'three/tsl'
import { acesTonemap, reinhardTonemap, uncharted2Tonemap } from '@/tsl/utils/color/tonemapping'

export type TonemapCurve = 'ACES' | 'Reinhard' | 'Uncharted2'

/**
 * Returns a node that tonemaps an input color node according to the selected curve.
 */
export function tonemap(curve: TonemapCurve = 'ACES') {
  return Fn(([colorNode]) => {
    const c = vec3(colorNode)
    if (curve === 'Reinhard') return reinhardTonemap(c)
    if (curve === 'Uncharted2') return uncharted2Tonemap(c)
    return acesTonemap(c)
  })
}



