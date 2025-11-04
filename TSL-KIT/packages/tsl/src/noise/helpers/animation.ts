import { add, float, mul, vec3 } from 'three/tsl'

import type { FloatNode, Vec3Node } from '../../index'; 
import type { NoiseSampleFn } from './octaves'; 

export interface NoiseAnimationOptions {
  speed?: number | FloatNode
  direction?: Vec3Node
  phase?: number | FloatNode
}

/**
 * Animates a noise function by offsetting coordinates over time.
 */
export const animateNoise = (
  sample: NoiseSampleFn,
  coords: Vec3Node,
  time: FloatNode,
  options: NoiseAnimationOptions = {},
): FloatNode => {
  const speedRaw = options.speed ?? 1.0
  const speed = typeof speedRaw === 'number' ? float(speedRaw) : speedRaw
  const direction = options.direction ?? vec3(0.0, 0.0, 1.0)
  const phaseRaw = options.phase ?? 0.0
  const phase = typeof phaseRaw === 'number' ? float(phaseRaw) : phaseRaw

  const offset = mul(direction, add(mul(time, speed), phase))

  return sample(add(coords, offset))
}

