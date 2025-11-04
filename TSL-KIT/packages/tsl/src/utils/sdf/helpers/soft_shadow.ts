import { Fn, clamp, float, max, min, normalize, vec3 } from 'three/tsl'

import type { FloatNode, Vec3Node } from '../../../index'; 
import type { DistanceEstimator } from './types'; 

export interface SoftShadowOptions {
  steps?: number
  minStep?: number
  maxStep?: number
  k?: number
  epsilon?: number
  maxDistance?: number
}

export const createSoftShadowFn = (
  distanceFn: DistanceEstimator,
  options: SoftShadowOptions = {},
) => {
  const {
    steps = 32,
    minStep = 0.02,
    maxStep = 0.1,
    k = 16,
    epsilon = 0.001,
    maxDistance = 20,
  } = options

  const minStepNode = float(minStep)
  const maxStepNode = float(maxStep)
  const kNode = float(k)
  const epsilonNode = float(epsilon)
  const maxDistanceNode = float(maxDistance)

  return Fn<readonly [Vec3Node, Vec3Node]>(
    ([originInput, directionInput]) => {
      const origin = vec3(originInput)
      const direction = normalize(vec3(directionInput))

      let shadow: FloatNode = float(1)
      let travel: FloatNode = minStepNode

      for (let i = 0; i < steps; i += 1) {
        const samplePoint = origin.add(direction.mul(travel))
        const distanceSample = distanceFn(samplePoint)
        const denom = max(travel, epsilonNode)
        const penumbra = clamp(kNode.mul(distanceSample).div(denom), 0.0, 1.0)
        shadow = min(shadow, penumbra)

        const step = clamp(distanceSample, minStepNode, maxStepNode)
        travel = min(travel.add(step), maxDistanceNode)
      }

      return clamp(shadow, 0.0, 1.0)
    },
  )
}

