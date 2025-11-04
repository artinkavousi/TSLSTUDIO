import { Fn, dot, fract, sin, vec2 } from 'three/tsl'

/**
 * Scalar grain texture function adapted from classic noise hash.
 */
export const grainTextureEffect = Fn(([uv]) => {
  const hash = dot(uv, vec2(12.9898, 78.233))
  return fract(sin(hash).mul(43758.5453123))
})

