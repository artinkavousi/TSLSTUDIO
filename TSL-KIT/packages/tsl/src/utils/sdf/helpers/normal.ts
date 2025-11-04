import { Fn, float, normalize, vec3 } from 'three/tsl'

import type { Vec3Node } from '../../../index'; 
import type { DistanceEstimator } from './types'; 

export interface NormalOptions {
  epsilon?: number
}

export const createNormalFn = (
  distanceFn: DistanceEstimator,
  options: NormalOptions = {},
) => {
  const { epsilon = 0.001 } = options
  const eps = float(epsilon)

  return Fn<readonly [Vec3Node]>(
    ([pointInput]) => {
      const point = vec3(pointInput)

      const offsetX = vec3(eps, float(0), float(0))
      const offsetY = vec3(float(0), eps, float(0))
      const offsetZ = vec3(float(0), float(0), eps)

      const x = distanceFn(point.add(offsetX)).sub(distanceFn(point.sub(offsetX)))
      const y = distanceFn(point.add(offsetY)).sub(distanceFn(point.sub(offsetY)))
      const z = distanceFn(point.add(offsetZ)).sub(distanceFn(point.sub(offsetZ)))

      return normalize(vec3(x, y, z))
    },
  )
}

