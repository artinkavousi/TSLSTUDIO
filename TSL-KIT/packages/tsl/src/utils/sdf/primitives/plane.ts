import { Fn, dot, float, vec3 } from 'three/tsl'

import type { FloatNode, Vec3Node } from '../../../index'; 

/**
 * Signed distance to a plane defined by a normal and offset from the origin.
 */
export const sdPlane = Fn<readonly [Vec3Node, Vec3Node, FloatNode?]>(
  ([pointInput, normalInput, offset]) => {
    const point = vec3(pointInput)
    const normal = vec3(normalInput)
    const planeOffset = offset ?? float(0)

    return dot(point, normal).add(planeOffset)
  },
).setLayout({
  name: 'sdPlane',
  type: 'float',
  inputs: [
    { name: 'point', type: 'vec3' },
    { name: 'normal', type: 'vec3' },
    { name: 'offset', type: 'float' },
  ],
})

