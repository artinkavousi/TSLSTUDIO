import { Fn, vec3 } from 'three/tsl'

import { acesTonemap, reinhardTonemap, uncharted2Tonemap } from '../../utils/color/tonemapping';

export type TonemapCurve = 'ACES' | 'Reinhard' | 'Uncharted2'

export function tonemap(curve: TonemapCurve = 'ACES') {
  return Fn(([colorNode]) => {
    const color = vec3(colorNode)
    if (curve === 'Reinhard') return reinhardTonemap(color)
    if (curve === 'Uncharted2') return uncharted2Tonemap(color)
    return acesTonemap(color)
  })
}

