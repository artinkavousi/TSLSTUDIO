import { Fn, dot, max, normalize, pow, reflect } from 'three/tsl'

import type { FloatNode, Vec3Node } from '../../index'; 

/**
 * Evaluates a simple directional light with Blinn-Phong style specular highlights.
 *
 * Ported from Maxime Heckel's WebGPU lighting helpers.
 * @param lightColor - Directional light colour.
 * @param lightIntensity - Scalar intensity multiplier.
 * @param normal - Shaded surface normal (assumed normalised).
 * @param lightDirection - Vector pointing from the surface towards the light.
 * @param viewDirection - Viewer direction vector.
 * @param specularPower - Specular shininess exponent.
 */
export const directionalLight = Fn<
  readonly [Vec3Node, FloatNode, Vec3Node, Vec3Node, Vec3Node, FloatNode]
>(
  ([lightColor, lightIntensity, normal, lightDirection, viewDirection, specularPower]) => {
    const direction = normalize(lightDirection)
    const reflection = reflect(direction.negate(), normal)

    const diffuseTerm = dot(normal, direction).toVar()
    diffuseTerm.assign(max(0, diffuseTerm))

    const specularTerm = dot(reflection, viewDirection).negate().toVar()
    specularTerm.assign(max(0, specularTerm))
    specularTerm.assign(pow(specularTerm, specularPower))

    return lightColor.mul(lightIntensity).mul(diffuseTerm.add(specularTerm))
  },
).setLayout({
  name: 'directionalLight',
  type: 'vec3',
  inputs: [
    { name: 'lightColor', type: 'vec3' },
    { name: 'lightIntensity', type: 'float', default: 1 },
    { name: 'normal', type: 'vec3' },
    { name: 'lightDirection', type: 'vec3' },
    { name: 'viewDirection', type: 'vec3' },
    { name: 'specularPower', type: 'float', default: 16 },
  ],
})

