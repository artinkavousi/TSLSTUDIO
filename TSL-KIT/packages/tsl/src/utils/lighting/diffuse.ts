import { Fn, dot, float, max, normalize } from 'three/tsl'

import type { FloatNode, Vec3Node } from '../../index'; 

/**
 * Computes a Lambertian diffuse light contribution.
 *
 * Ported from Maxime Heckel's WebGPU lighting helpers and enhanced with layout metadata.
 * @param lightColor - RGB colour of the diffuse light.
 * @param normal - Surface normal (assumed normalised).
 * @param lightDirection - Vector pointing from the surface towards the light.
 * @param intensity - Optional scalar multiplier for the light.
 */
export const diffuseLight = Fn<
  readonly [Vec3Node, Vec3Node, Vec3Node, FloatNode?]
>(
  ([lightColor, normal, lightDirection, intensity]) => {
    const n = normalize(normal)
    const l = normalize(lightDirection)
    const i = intensity ?? float(1)
    const ndotl = max(0, dot(n, l))

    return lightColor.mul(ndotl.mul(i))
  },
).setLayout({
  name: 'diffuseLight',
  type: 'vec3',
  inputs: [
    { name: 'lightColor', type: 'vec3' },
    { name: 'normal', type: 'vec3' },
    { name: 'lightDirection', type: 'vec3' },
    { name: 'intensity', type: 'float', default: 1 },
  ],
})


