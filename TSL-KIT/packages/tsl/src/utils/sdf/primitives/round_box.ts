import { Fn, abs, float, length, max, min, vec3 } from 'three/tsl'

import type { FloatNode, Vec3Node } from '../../../index'; 

/**
 * Signed distance to a box with rounded edges.
 */
export const sdRoundBox = Fn<readonly [Vec3Node, Vec3Node, FloatNode?]>(
  ([pointInput, halfExtentsInput, radius]) => {
    const point = vec3(pointInput).toVar()
    const halfExtents = vec3(halfExtentsInput).toVar()
    const r = radius ?? float(0.1)

    const q = abs(point).sub(halfExtents)
    const outside = length(max(q, float(0)))
    const inside = min(max(q.x, max(q.y, q.z)), float(0))

    return outside.add(inside).sub(r)
  },
).setLayout({
  name: 'sdRoundBox',
  type: 'float',
  inputs: [
    { name: 'point', type: 'vec3' },
    { name: 'halfExtents', type: 'vec3' },
    { name: 'radius', type: 'float', default: 0.1 },
  ],
}) satisfies FloatNode


