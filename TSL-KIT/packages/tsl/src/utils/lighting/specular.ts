import { Fn, dot, float, max, normalize, pow } from 'three/tsl'

import type { FloatNode, Vec3Node } from '../../index'; 

/**
 * Computes a Blinn-Phong style specular highlight.
 *
 * Derived from the directional lighting helper and exposed as a standalone utility.
 * @param lightColor - RGB colour of the light.
 * @param normal - Shaded surface normal (assumed normalised).
 * @param lightDirection - Vector pointing towards the light.
 * @param viewDirection - Vector pointing towards the viewer.
 * @param shininess - Specular exponent controlling highlight sharpness.
 * @param intensity - Optional scalar multiplier for the light strength.
 */
export const specularLight = Fn<
  readonly [Vec3Node, Vec3Node, Vec3Node, Vec3Node, FloatNode?, FloatNode?]
>(
  ([lightColor, normal, lightDirection, viewDirection, shininess, intensity]) => {
    const n = normalize(normal)
    const l = normalize(lightDirection)
    const v = normalize(viewDirection)
    const s = shininess ?? float(32)
    const i = intensity ?? float(1)

    const halfVector = normalize(l.add(v))
    const specAngle = max(0, dot(n, halfVector))
    const specularTerm = pow(specAngle, s)

    return lightColor.mul(specularTerm.mul(i))
  },
).setLayout({
  name: 'specularLight',
  type: 'vec3',
  inputs: [
    { name: 'lightColor', type: 'vec3' },
    { name: 'normal', type: 'vec3' },
    { name: 'lightDirection', type: 'vec3' },
    { name: 'viewDirection', type: 'vec3' },
    { name: 'shininess', type: 'float', default: 32 },
    { name: 'intensity', type: 'float', default: 1 },
  ],
})


