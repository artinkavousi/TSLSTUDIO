import { Fn, cross, float, vec3 } from 'three/tsl'

import type { Vec3Node } from '../index'; 
import { simplexNoise3d } from './simplex_noise_3d'; 

/**
 * 3D curl noise derived from simplex noise, following Alastair Aiken's implementation.
 */
export const curlNoise3d = Fn<readonly [Vec3Node]>(
  ([input]) => {
    const point = vec3(input).toVar()
    const delta = float(1e-4)
    const doubleDelta = delta.mul(2.0)

    // First noise sample
    const axPos = simplexNoise3d(point.add(vec3(delta, 0, 0)))
    const axNeg = simplexNoise3d(point.sub(vec3(delta, 0, 0)))
    const ayPos = simplexNoise3d(point.add(vec3(0, delta, 0)))
    const ayNeg = simplexNoise3d(point.sub(vec3(0, delta, 0)))
    const azPos = simplexNoise3d(point.add(vec3(0, 0, delta)))
    const azNeg = simplexNoise3d(point.sub(vec3(0, 0, delta)))

    const gradA = vec3(
      axPos.sub(axNeg).div(doubleDelta),
      ayPos.sub(ayNeg).div(doubleDelta),
      azPos.sub(azNeg).div(doubleDelta),
    ).normalize()

    // Offset second sample to decorrelate
    const offsetPoint = point.add(3.5)
    const bxPos = simplexNoise3d(offsetPoint.add(vec3(delta, 0, 0)))
    const bxNeg = simplexNoise3d(offsetPoint.sub(vec3(delta, 0, 0)))
    const byPos = simplexNoise3d(offsetPoint.add(vec3(0, delta, 0)))
    const byNeg = simplexNoise3d(offsetPoint.sub(vec3(0, delta, 0)))
    const bzPos = simplexNoise3d(offsetPoint.add(vec3(0, 0, delta)))
    const bzNeg = simplexNoise3d(offsetPoint.sub(vec3(0, 0, delta)))

    const gradB = vec3(
      bxPos.sub(bxNeg).div(doubleDelta),
      byPos.sub(byNeg).div(doubleDelta),
      bzPos.sub(bzNeg).div(doubleDelta),
    ).normalize()

    return cross(gradA, gradB).normalize()
  },
).setLayout({
  name: 'curlNoise3d',
  type: 'vec3',
  inputs: [{ name: 'point', type: 'vec3' }],
})


