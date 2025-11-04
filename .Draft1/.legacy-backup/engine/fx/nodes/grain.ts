// @ts-nocheck
import { Fn, vec2, fract, sin, dot } from 'three/tsl'

export const grainNode = Fn(([_uv]) => {
  return fract(sin(dot(_uv, vec2(12.9898, 78.233))).mul(43758.5453123))
})



