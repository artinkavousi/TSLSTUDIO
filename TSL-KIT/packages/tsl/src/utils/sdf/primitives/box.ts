import { Fn, abs, float, length, max, min, vec3 } from 'three/tsl'

import type { FloatNode, Vec3Node } from '../../../index'; 

/**
 * Signed distance to an axis-aligned box defined by its half-extents.
 */
export const sdBox = Fn<readonly [Vec3Node, Vec3Node]>(
  ([pointInput, halfExtentsInput]) => {
    const point = vec3(pointInput).toVar()
    const halfExtents = vec3(halfExtentsInput).toVar()
    const q = abs(point).sub(halfExtents)

    return length(max(q, float(0))).add(min(max(q.x, max(q.y, q.z)), float(0)))
  },
).setLayout({
  name: 'sdBox',
  type: 'float',
  inputs: [
    { name: 'point', type: 'vec3' },
    { name: 'halfExtents', type: 'vec3' },
  ],
}) satisfies FloatNode

