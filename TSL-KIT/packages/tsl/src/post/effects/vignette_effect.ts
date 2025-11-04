import { Fn, pow, smoothstep, vec2 } from 'three/tsl'

import { sdSphere } from '../../utils/sdf/primitives/sphere'; 

export const vignetteEffect = Fn(([uv, smoothing = 0.45, exponent = 1.2]) => {
  const vignette = smoothstep(smoothing, 1, sdSphere(vec2(uv))).oneMinus()
  return pow(vignette, exponent)
})

