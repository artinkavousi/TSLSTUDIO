import { add, float, mul, vec3 } from 'three/tsl'

import type { FloatNode, Vec3Node } from '../../index'; 
import type { NoiseSampleFn } from './octaves'; 

export interface DomainWarpOptions {
  strength?: number | FloatNode
  offsets?: [number, number, number]
}

/**
 * Applies domain warping by offsetting the input coordinates using additional noise samples.
 */
export const domainWarp = (
  sample: NoiseSampleFn,
  coords: Vec3Node,
  options: DomainWarpOptions = {},
): Vec3Node => {
  const strengthRaw = options.strength ?? 0.1
  const strength = typeof strengthRaw === 'number' ? float(strengthRaw) : strengthRaw
  const offsets = options.offsets ?? [0, 100, 200]

  const warpOffsets = vec3(
    sample(add(coords, vec3(offsets[0]))),
    sample(add(coords, vec3(offsets[1]))),
    sample(add(coords, vec3(offsets[2]))),
  )

  return add(coords, mul(warpOffsets, strength))
}

