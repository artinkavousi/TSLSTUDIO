import {
  Fn,
  abs,
  float,
  max,
  min,
  normalize,
  select,
  vec3,
} from 'three/tsl'

import type { FloatNode, Vec3Node } from '../../../index'; 
import type { DistanceEstimator } from './types'; 

export interface RaymarchOptions {
  steps?: number
  epsilon?: number
  maxDistance?: number
  minDistance?: number
  stepScale?: number
}

export const createRaymarchFn = (
  distanceFn: DistanceEstimator,
  options: RaymarchOptions = {},
) => {
  const {
    steps = 128,
    epsilon = 0.001,
    maxDistance = 100,
    minDistance = 0,
    stepScale = 1,
  } = options

  const epsilonNode = float(epsilon)
  const maxDistanceNode = float(maxDistance)
  const minDistanceNode = float(minDistance)
  const stepScaleNode = float(stepScale)

  return Fn<readonly [Vec3Node, Vec3Node, FloatNode?]>(
    ([originInput, directionInput, startDistance]) => {
      const origin = vec3(originInput)
      const direction = normalize(vec3(directionInput))

      let travel = startDistance ?? minDistanceNode
      let hitDistance = maxDistanceNode as FloatNode
      let hitMask = float(0) as FloatNode

      for (let i = 0; i < steps; i += 1) {
        const samplePoint = origin.add(direction.mul(travel))
        const distanceToSurface = distanceFn(samplePoint)
        const reached = abs(distanceToSurface).lessThan(epsilonNode)

        hitDistance = select(reached, min(hitDistance, travel), hitDistance)
        hitMask = select(reached, float(1), hitMask)

        const step = max(distanceToSurface.mul(stepScaleNode), epsilonNode)
        travel = select(reached, travel, min(travel.add(step), maxDistanceNode))
      }

      return select(hitMask.greaterThan(float(0.5)), hitDistance, maxDistanceNode)
    },
  )
}

