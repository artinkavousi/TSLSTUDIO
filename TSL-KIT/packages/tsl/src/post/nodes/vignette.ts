import { Fn, pow, smoothstep } from 'three/tsl'

import { sdSphere } from '../../utils/sdf/primitives/sphere'; 

export function vignetteNode() {
  return Fn(([uv, smoothing = 0.45, exponent = 1.2]) => {
    const vignette = smoothstep(smoothing, 1, sdSphere(uv)).oneMinus()
    return pow(vignette, exponent)
  })
}

