import { Fn, abs, fract, length, max, pow, screenSize, smoothstep, uniform, vec2 } from 'three/tsl'

import { screenAspectUV } from 

export interface LcdEffectProps {
  resolution?: ReturnType<typeof vec2>
  scalar?: number
  zoom?: number
  exponent?: number
  edge?: number
}

export const lcdEffect = Fn((props?: LcdEffectProps) => {
  const {
    resolution = screenSize,
    scalar = 10,
    zoom = 2.1,
    exponent = 1.8,
    edge = 0.2,
  } = props ?? {}

  const uv = screenAspectUV(resolution).toVar()

  const zoomUniform = uniform(zoom)
  const exponentUniform = uniform(exponent)
  const edgeUniform = uniform(edge)
  const scaledRes = resolution.div(scalar)

  uv.assign(fract(uv.mul(scaledRes)).sub(0.5))

  const pattern = length(uv.mul(zoomUniform)).oneMinus().toVar()
  pattern.assign(smoothstep(edgeUniform, 1, pattern))
  pattern.assign(pow(pattern, exponentUniform))

  return pattern
})

