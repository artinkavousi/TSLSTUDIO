import { Fn, mix } from 'three/tsl'

import type { Vec3Node } from '../../index'; 

/**
 * Blends between ground and sky colours based on the surface normal's Y component.
 *
 * Ported from Maxime Heckel's hemisphere lighting helper.
 * @param normal - Surface normal vector used to evaluate the mix factor.
 * @param groundColor - Colour sampled for downward-facing normals.
 * @param skyColor - Colour sampled for upward-facing normals.
 */
export const hemisphereLight = Fn<readonly [Vec3Node, Vec3Node, Vec3Node]>(
  ([normal, groundColor, skyColor]) => {
    const blend = normal.y.mul(0.5).add(0.5)
    return mix(groundColor, skyColor, blend)
  },
).setLayout({
  name: 'hemisphereLight',
  type: 'vec3',
  inputs: [
    { name: 'normal', type: 'vec3' },
    { name: 'groundColor', type: 'vec3' },
    { name: 'skyColor', type: 'vec3' },
  ],
})

