import { Fn, cos, float, mat3, sin } from 'three/tsl'

import type { FloatNode, Mat3Node } from '../../index'; 

/**
 * Builds a rotation matrix for rotations around the Y axis.
 *
 * Ported from Maxime Heckel's WebGPU helper utilities.
 * @param angle - Rotation angle in radians.
 */
export const rotate3dY = Fn<readonly [FloatNode]>(
  ([angle]) => {
    const s = float(sin(angle)).toVar()
    const c = float(cos(angle)).toVar()

    return mat3(
      c,
      float(0),
      s.negate(),
      float(0),
      float(1),
      float(0),
      s,
      float(0),
      c,
    )
  },
).setLayout({
  name: 'rotate3dY',
  type: 'mat3',
  inputs: [{ name: 'angle', type: 'float' }],
}) satisfies Mat3Node

