import { Fn, float, length, vec3 } from 'three/tsl'

import type { FloatNode, Vec3Node } from '../../../index'; 

/**
 * Signed distance to a sphere centered at the origin.
 */
export const sdSphere = Fn<readonly [Vec3Node, FloatNode?]>(
  ([pointInput, radius]) => {
    const point = vec3(pointInput)
    const r = radius ?? float(0.5)

    return length(point).sub(r)
  },
).setLayout({
  name: 'sdSphere',
  type: 'float',
  inputs: [
    { name: 'point', type: 'vec3' },
    { name: 'radius', type: 'float', default: 0.5 },
  ],
}) satisfies FloatNode


