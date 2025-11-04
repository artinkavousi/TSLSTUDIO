import { Fn } from 'three/tsl'

import type { FloatNode, Vec3Node } from '../../index'; 

/**
 * Computes ambient lighting by scaling a light colour with a given intensity.
 *
 * Ported from Maxime Heckel's portfolio lighting utilities.
 * @param lightColor - RGB colour of the ambient light.
 * @param intensity - Scalar intensity multiplier.
 * @returns The resulting ambient light contribution.
 */
export const ambientLight = Fn<readonly [Vec3Node, FloatNode]>(
  ([lightColor, intensity]) => lightColor.mul(intensity),
).setLayout({
  name: 'ambientLight',
  type: 'vec3',
  inputs: [
    { name: 'lightColor', type: 'vec3' },
    { name: 'intensity', type: 'float', default: 1 },
  ],
})

