import { Fn, length, vec2, vec3 } from 'three/tsl'

import type { FloatNode, Vec2Node, Vec3Node } from '../../../index'; 

/**
 * Signed distance to a torus oriented around the Y axis.
 * @param point - Sample position.
 * @param radii - Major radius (x) and minor radius (y).
 */
export const sdTorus = Fn<readonly [Vec3Node, Vec2Node]>(
  ([pointInput, radiiInput]) => {
    const point = vec3(pointInput).toVar()
    const radii = vec2(radiiInput).toVar()
    const q = vec2(length(point.xz).sub(radii.x), point.y)

    return length(q).sub(radii.y)
  },
).setLayout({
  name: 'sdTorus',
  type: 'float',
  inputs: [
    { name: 'point', type: 'vec3' },
    { name: 'radii', type: 'vec2' },
  ],
}) satisfies FloatNode

