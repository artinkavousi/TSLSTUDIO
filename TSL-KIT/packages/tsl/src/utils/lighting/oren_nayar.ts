import {
  Fn,
  clamp,
  dot,
  float,
  length,
  max,
  min,
  normalize,
  sqrt,
} from 'three/tsl'

import type { FloatNode, Vec3Node } from '../../index'; 

/**
 * Computes the Oren–Nayar diffuse reflection model for rough surfaces.
 *
 * @param albedo - Base diffuse colour.
 * @param normal - Surface normal (assumed normalised).
 * @param lightDirection - Vector pointing towards the light.
 * @param viewDirection - Vector pointing towards the viewer.
 * @param roughness - Surface roughness in [0, 1].
 */
export const orenNayarDiffuse = Fn<
  readonly [Vec3Node, Vec3Node, Vec3Node, Vec3Node, FloatNode]
>(
  ([albedo, normal, lightDirection, viewDirection, roughness]) => {
    const n = normalize(normal)
    const l = normalize(lightDirection)
    const v = normalize(viewDirection)

    const sigma = clamp(roughness, 0, 1)
    const sigma2 = sigma.mul(sigma)

    const nDotL = max(0, dot(n, l)).toVar()
    const nDotV = max(0, dot(n, v)).toVar()

    const one = float(1)
    const eps = float(1e-4)

    const sinThetaL = sqrt(max(0, one.sub(nDotL.mul(nDotL))))
    const sinThetaV = sqrt(max(0, one.sub(nDotV.mul(nDotV))))

    const viewProj = v.sub(n.mul(nDotV))
    const lightProj = l.sub(n.mul(nDotL))
    const denom = max(eps, length(viewProj).mul(length(lightProj)))
    const cosPhi = clamp(dot(viewProj, lightProj).div(denom), -1, 1)

    const sinAlpha = max(sinThetaL, sinThetaV)
    const tanBeta = min(
      sinThetaL.div(max(eps, nDotL)),
      sinThetaV.div(max(eps, nDotV)),
    )

    const A = one.sub(float(0.5).mul(sigma2.div(sigma2.add(float(0.33)))))
    const B = float(0.45).mul(sigma2.div(sigma2.add(float(0.09))))

    const oren = A.add(B.mul(cosPhi).mul(sinAlpha).mul(tanBeta))

    return albedo.mul(nDotL.mul(oren))
  },
).setLayout({
  name: 'orenNayarDiffuse',
  type: 'vec3',
  inputs: [
    { name: 'albedo', type: 'vec3' },
    { name: 'normal', type: 'vec3' },
    { name: 'lightDirection', type: 'vec3' },
    { name: 'viewDirection', type: 'vec3' },
    { name: 'roughness', type: 'float' },
  ],
})


