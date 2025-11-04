import { add, div, float, mul } from 'three/tsl'

import type { FloatNode, Vec3Node } from '../../index'; 

export type NoiseSampleFn = (coords: Vec3Node) => FloatNode

export interface OctaveOptions {
  octaves?: number
  frequency?: number
  amplitude?: number
  lacunarity?: number
  gain?: number
}

/**
 * Accumulates a noise function over multiple octaves using standard FBM parameters.
 */
export const accumulateOctaves = (
  sample: NoiseSampleFn,
  coords: Vec3Node,
  options: OctaveOptions = {},
): FloatNode => {
  const octaveCount = options.octaves ?? 4
  if (octaveCount <= 0) {
    return float(0.0)
  }

  let frequency = options.frequency ?? 1.0
  let amplitude = options.amplitude ?? 1.0
  const lacunarity = options.lacunarity ?? 2.0
  const gain = options.gain ?? 0.5

  let value: FloatNode = float(0.0)
  let normalization: FloatNode = float(0.0)

  for (let i = 0; i < octaveCount; i += 1) {
    const sampled = sample(mul(coords, frequency))
    value = add(value, mul(sampled, amplitude))
    normalization = add(normalization, amplitude)
    frequency *= lacunarity
    amplitude *= gain
  }

  return div(value, normalization)
}

