import { Fn, dot, float, max, normalize, pow } from 'three/tsl'

import type { FloatNode, Vec3Node } from '../../index'; 

/**
 * Computes a rim lighting contribution accentuating silhouettes.
 *
 * @param rimColor - RGB colour applied to the rim highlight.
 * @param normal - Surface normal (assumed normalised).
 * @param viewDirection - Vector pointing towards the viewer.
 * @param power - Controls the falloff curve of the rim highlight.
 * @param intensity - Optional scalar multiplier for the rim contribution.
 */
export const rimLight = Fn<
  readonly [Vec3Node, Vec3Node, Vec3Node, FloatNode?, FloatNode?]
>(
  ([rimColor, normal, viewDirection, power, intensity]) => {
    const n = normalize(normal)
    const v = normalize(viewDirection)
    const p = power ?? float(2)
    const i = intensity ?? float(1)

    const rimFactor = float(1).sub(max(0, dot(n, v)))
    const rim = pow(rimFactor, p)

    return rimColor.mul(rim.mul(i))
  },
).setLayout({
  name: 'rimLight',
  type: 'vec3',
  inputs: [
    { name: 'rimColor', type: 'vec3' },
    { name: 'normal', type: 'vec3' },
    { name: 'viewDirection', type: 'vec3' },
    { name: 'power', type: 'float', default: 2 },
    { name: 'intensity', type: 'float', default: 1 },
  ],
})


