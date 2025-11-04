import {
  Fn,
  clamp,
  float,
  max,
  pow,
  vec3,
} from 'three/tsl'

import type { FloatNode, Vec3Node } from '../../../index'; 
import type { DistanceEstimator } from './types'; 

export interface AmbientOcclusionOptions {
  steps?: number
  stepSize?: number
  falloff?: number
  strength?: number
}

export const createAmbientOcclusionFn = (
  distanceFn: DistanceEstimator,
  options: AmbientOcclusionOptions = {},
) => {
  const {
    steps = 5,
    stepSize = 0.02,
    falloff = 0.5,
    strength = 1,
  } = options

  const stepSizeNode = float(stepSize)
  const falloffNode = float(falloff)
  const strengthNode = float(strength)

  return Fn<readonly [Vec3Node, Vec3Node]>(
    ([pointInput, normalInput]) => {
      const point = vec3(pointInput)
      const normal = vec3(normalInput)

      let occlusion: FloatNode = float(0)

      for (let i = 1; i <= steps; i += 1) {
        const sampleDistance = stepSizeNode.mul(float(i))
        const samplePoint = point.add(normal.mul(sampleDistance))
        const distanceSample = distanceFn(samplePoint)
        const delta = max(sampleDistance.sub(distanceSample), float(0))
        const weight = pow(falloffNode, float(i - 1))
        occlusion = occlusion.add(delta.mul(weight))
      }

      const normalized = occlusion.mul(strengthNode).div(float(steps))
      return clamp(float(1).sub(normalized), 0.0, 1.0)
    },
  )
}

