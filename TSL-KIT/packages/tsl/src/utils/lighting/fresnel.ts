import { Fn, dot, float, max } from 'three/tsl'

import type { FloatNode, Vec3Node } from '../../index'; 

/**
 * Computes a Fresnel term based on the viewing direction and surface normal.
 *
 * Ported from Maxime Heckel's WebGPU lighting helpers.
 * @param viewDirection - Normalised vector pointing towards the viewer.
 * @param normal - Surface normal vector.
 * @param power - Exponent controlling the falloff of the Fresnel term.
 */
export const fresnel = Fn<readonly [Vec3Node, Vec3Node, FloatNode?]>(
  ([viewDirection, normal, power]) =>
    float(1)
      .sub(max(0, dot(viewDirection, normal)))
      .pow(power ?? float(1)),
).setLayout({
  name: 'fresnel',
  type: 'float',
  inputs: [
    { name: 'viewDirection', type: 'vec3' },
    { name: 'normal', type: 'vec3' },
    { name: 'power', type: 'float', default: 1 },
  ],
})

