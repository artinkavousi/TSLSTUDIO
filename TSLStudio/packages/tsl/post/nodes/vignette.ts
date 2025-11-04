// @ts-nocheck
import { Fn, smoothstep, pow } from 'three/tsl'
import { sdSphere } from '@tsl/utils/sdf/shapes'

export function vignetteNode() {
  return Fn(([_uv, smoothing = 0.45, exponent = 1.2]) => {
    const vignette = smoothstep(smoothing, 1, sdSphere(_uv)).oneMinus()
    return pow(vignette, exponent)
  })
}



