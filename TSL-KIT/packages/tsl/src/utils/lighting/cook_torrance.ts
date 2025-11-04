import { Fn, clamp, dot, float, max, normalize, pow, vec3 } from 'three/tsl'

import type { FloatNode, Vec3Node } from '../../index'; 

/**
 * Implements the Cook–Torrance microfacet specular BRDF using the GGX distribution.
 *
 * @param lightColor - Incident light colour.
 * @param normal - Surface normal (assumed normalised).
 * @param lightDirection - Vector pointing towards the light.
 * @param viewDirection - Vector pointing towards the viewer.
 * @param roughness - Surface roughness in [0, 1].
 * @param fresnel0 - Base reflectance (F0).
 * @param intensity - Optional scalar multiplier for light strength.
 */
export const cookTorranceSpecular = Fn<
  readonly [Vec3Node, Vec3Node, Vec3Node, Vec3Node, FloatNode, Vec3Node, FloatNode?]
>(
  ([lightColor, normal, lightDirection, viewDirection, roughness, fresnel0, intensity]) => {
    const n = normalize(normal)
    const l = normalize(lightDirection)
    const v = normalize(viewDirection)
    const h = normalize(l.add(v))

    const nDotL = max(0, dot(n, l)).toVar()
    const nDotV = max(0, dot(n, v)).toVar()
    const nDotH = max(0, dot(n, h))
    const vDotH = max(0, dot(v, h))

    const r = clamp(roughness, 0.001, 1)
    const alpha = r.mul(r)
    const alpha2 = alpha.mul(alpha)

    const denomTerm = nDotH.mul(nDotH).mul(alpha2.sub(float(1))).add(float(1))
    const D = alpha2.div(float(Math.PI).mul(denomTerm.mul(denomTerm)))

    const k = r.add(float(1)).mul(r.add(float(1))).div(float(8))
    const Gv = nDotV.div(nDotV.mul(float(1).sub(k)).add(k))
    const Gl = nDotL.div(nDotL.mul(float(1).sub(k)).add(k))
    const G = Gv.mul(Gl)

    const one = float(1)
    const fresnelTerm = fresnel0.add(vec3(1).sub(fresnel0).mul(pow(one.sub(vDotH), float(5))))

    const numerator = fresnelTerm.mul(D.mul(G))
    const denominator = max(float(1e-4), float(4).mul(nDotL).mul(nDotV))

    const specular = numerator.div(denominator)
    const i = intensity ?? float(1)

    return lightColor.mul(specular).mul(i)
  },
).setLayout({
  name: 'cookTorranceSpecular',
  type: 'vec3',
  inputs: [
    { name: 'lightColor', type: 'vec3' },
    { name: 'normal', type: 'vec3' },
    { name: 'lightDirection', type: 'vec3' },
    { name: 'viewDirection', type: 'vec3' },
    { name: 'roughness', type: 'float' },
    { name: 'fresnel0', type: 'vec3' },
    { name: 'intensity', type: 'float', default: 1 },
  ],
})


