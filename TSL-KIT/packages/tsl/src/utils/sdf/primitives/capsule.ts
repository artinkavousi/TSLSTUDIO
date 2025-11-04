import { Fn, clamp, dot, float, length, vec3 } from 'three/tsl'

import type { FloatNode, Vec3Node } from '../../../index'; 

/**
 * Signed distance to a capsule segment defined by endpoints `a` and `b`.
 */
export const sdCapsule = Fn<readonly [Vec3Node, Vec3Node, Vec3Node, FloatNode]>(
  ([pointInput, startInput, endInput, radius]) => {
    const point = vec3(pointInput).toVar()
    const start = vec3(startInput).toVar()
    const end = vec3(endInput).toVar()
    const segment = end.sub(start)
    const toPoint = point.sub(start)
    const h = clamp(dot(toPoint, segment).div(dot(segment, segment)), float(0), float(1))
    const closest = start.add(segment.mul(h))

    return length(point.sub(closest)).sub(radius)
  },
).setLayout({
  name: 'sdCapsule',
  type: 'float',
  inputs: [
    { name: 'point', type: 'vec3' },
    { name: 'start', type: 'vec3' },
    { name: 'end', type: 'vec3' },
    { name: 'radius', type: 'float' },
  ],
}) satisfies FloatNode

