import { Fn, dot, fract, sin, vec2 } from 'three/tsl'

export const grainNode = Fn(([uv]) => fract(sin(dot(uv, vec2(12.9898, 78.233))).mul(43758.5453123)))

