import { Fn, cross, float, vec3, vec4 } from 'three/tsl'

import type { Vec4Node } from '../index'; 
import { simplexNoise4d } from './simplex_noise_4d'; 

/**
 * 4D curl noise using simplex noise (XYZ curl, W as animated parameter).
 */
export const curlNoise4d = Fn<readonly [Vec4Node]>(
  ([input]) => {
    const point = vec4(input).toVar()
    const delta = float(1e-4)
    const doubleDelta = delta.mul(2.0)

    const axPos = simplexNoise4d(point.add(vec4(delta, 0, 0, 0)))
    const axNeg = simplexNoise4d(point.sub(vec4(delta, 0, 0, 0)))
    const ayPos = simplexNoise4d(point.add(vec4(0, delta, 0, 0)))
    const ayNeg = simplexNoise4d(point.sub(vec4(0, delta, 0, 0)))
    const azPos = simplexNoise4d(point.add(vec4(0, 0, delta, 0)))
    const azNeg = simplexNoise4d(point.sub(vec4(0, 0, delta, 0)))

    const gradA = vec3(
      axPos.sub(axNeg).div(doubleDelta),
      ayPos.sub(ayNeg).div(doubleDelta),
      azPos.sub(azNeg).div(doubleDelta),
    ).normalize()

    const offsetPoint = point.add(3.5)
    const bxPos = simplexNoise4d(offsetPoint.add(vec4(delta, 0, 0, 0)))
    const bxNeg = simplexNoise4d(offsetPoint.sub(vec4(delta, 0, 0, 0)))
    const byPos = simplexNoise4d(offsetPoint.add(vec4(0, delta, 0, 0)))
    const byNeg = simplexNoise4d(offsetPoint.sub(vec4(0, delta, 0, 0)))
    const bzPos = simplexNoise4d(offsetPoint.add(vec4(0, 0, delta, 0)))
    const bzNeg = simplexNoise4d(offsetPoint.sub(vec4(0, 0, delta, 0)))

    const gradB = vec3(
      bxPos.sub(bxNeg).div(doubleDelta),
      byPos.sub(byNeg).div(doubleDelta),
      bzPos.sub(bzNeg).div(doubleDelta),
    ).normalize()

    return cross(gradA, gradB).normalize()
  },
).setLayout({
  name: 'curlNoise4d',
  type: 'vec3',
  inputs: [{ name: 'point', type: 'vec4' }],
})


