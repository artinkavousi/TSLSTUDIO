import { fbm } from '../../noise/fbm';
import { Fn, PI, fract, mix, sin, smoothstep, vec3 } from 'three/tsl'

export const canvasWeaveEffect = Fn(([uv]) => {
  const grid = fract(uv.mul(200))

  const noiseOffset = fbm(vec3(uv.mul(30), 0), 3).mul(0.1)
  const warpedGrid = grid.add(noiseOffset)

  const weaveX = sin(warpedGrid.x.mul(PI).add(fbm(vec3(uv.mul(100), 0), 2).mul(0.5)))
  const weaveY = sin(warpedGrid.y.mul(PI).add(fbm(vec3(uv.mul(100).add(0.5), 0), 2).mul(0.5)))

  const weave = weaveX.mul(weaveY)
  const smoothed = smoothstep(-0.3, 0.3, weave)

  return mix(0.9, 1.0, smoothed)
})

