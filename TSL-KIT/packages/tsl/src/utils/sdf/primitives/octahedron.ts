import { Fn, abs, float, vec3 } from 'three/tsl'

import type { FloatNode, Vec3Node } from '../../../index'; 

/**
 * Signed distance to a regular octahedron centred at the origin.
 */
export const sdOctahedron = Fn<readonly [Vec3Node, FloatNode?]>(
  ([pointInput, size]) => {
    const point = vec3(pointInput)
    const s = size ?? float(1)
    const absPoint = abs(point)

    return absPoint.x.add(absPoint.y).add(absPoint.z).sub(s).mul(float(0.5773502691896257))
  },
).setLayout({
  name: 'sdOctahedron',
  type: 'float',
  inputs: [
    { name: 'point', type: 'vec3' },
    { name: 'size', type: 'float', default: 1 },
  ],
}) satisfies FloatNode


