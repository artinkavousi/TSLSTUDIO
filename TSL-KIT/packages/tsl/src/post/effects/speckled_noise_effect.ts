import { fbm } from '../../noise/fbm';
import { simplexNoise3d } from '../../noise/simplex_noise_3d'; 
import { Fn, step, vec2, vec3 } from 'three/tsl'

export const speckledNoiseEffect = Fn(([uv, density = 0.75, warpAmount = vec2(80, 120)]) => {
  const warpX = fbm(vec3(uv.mul(3), 0))
  const warpY = fbm(vec3(uv.mul(3).add(100), 0))
  const warp = vec2(warpX, warpY).sub(0.5).mul(0.1)

  const warpedUV = uv.add(warp)

  const noise1 = simplexNoise3d(vec3(warpedUV.mul(warpAmount.x), 0))
  const noise2 = simplexNoise3d(vec3(warpedUV.mul(warpAmount.y).add(50), 0))

  return step(density, noise1).mul(step(density, noise2))
})

