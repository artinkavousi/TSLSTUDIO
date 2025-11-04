import { Fn } from 'three/tsl'

import type { FloatNode, Vec3Node } from '../../index'; 

/**
 * Applies a normal-based displacement to a position vector.
 */
export const applyDisplacement = Fn<readonly [Vec3Node, Vec3Node, FloatNode]>(
  ([position, normal, amount]) => position.add(normal.normalize().mul(amount)),
).setLayout({
  name: 'geometryDisplacement',
  type: 'vec3',
  inputs: [
    { name: 'position', type: 'vec3' },
    { name: 'normal', type: 'vec3' },
    { name: 'amount', type: 'float' },
  ],
})


