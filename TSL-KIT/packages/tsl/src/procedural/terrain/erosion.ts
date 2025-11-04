import { Fn, clamp, float } from 'three/tsl'

import type { FloatNode } from '../../index'; 

export interface ErosionOptions {
  strength?: number
  minimum?: number
  maximum?: number
}

export const applyErosion = Fn<readonly [FloatNode, FloatNode, FloatNode, FloatNode]>(
  ([height, strength, minClamp, maxClamp]) => {
    const clampedStrength = clamp(strength, float(0), float(1))
    const erosion = height.mul(clampedStrength).mul(float(0.5))
    return height.sub(erosion).clamp(minClamp, maxClamp)
  },
).setLayout({
  name: 'terrainErosion',
  type: 'float',
  inputs: [
    { name: 'height', type: 'float' },
    { name: 'strength', type: 'float' },
    { name: 'minimum', type: 'float' },
    { name: 'maximum', type: 'float' },
  ],
})

export function createErosionNode(height: FloatNode, options: ErosionOptions = {}): FloatNode {
  const strength = float(options.strength ?? 0.3)
  const minimum = float(options.minimum ?? -1)
  const maximum = float(options.maximum ?? 1000)
  return applyErosion(height, strength, minimum, maximum)
}


