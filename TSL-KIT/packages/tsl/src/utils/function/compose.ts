import { Fn, int, mat3, mat4, vec3 } from 'three/tsl'

import type { Mat3Node, Mat4Node, Vec3Node } from '../../index'; 

/**
 * Composes a transform matrix using position, rotation matrix, and scale.
 *
 * Ported from Maxime Heckel's WebGPU helper utilities.
 * @param position - Translation vector.
 * @param rotation - 3×3 rotation matrix.
 * @param scale - Per-axis scale factors.
 */
export const compose = Fn<readonly [Vec3Node, Mat3Node, Vec3Node]>(
  ([positionInput, rotationInput, scaleInput]) => {
    const position = vec3(positionInput).toVar()
    const rotation = mat3(rotationInput).toVar()
    const scale = vec3(scaleInput).toVar()

    return mat4(
      rotation.element(int(0)).element(int(0)).mul(scale.x),
      rotation.element(int(0)).element(int(1)).mul(scale.x),
      rotation.element(int(0)).element(int(2)).mul(scale.x),
      0.0,
      rotation.element(int(1)).element(int(0)).mul(scale.y),
      rotation.element(int(1)).element(int(1)).mul(scale.y),
      rotation.element(int(1)).element(int(2)).mul(scale.y),
      0.0,
      rotation.element(int(2)).element(int(0)).mul(scale.z),
      rotation.element(int(2)).element(int(1)).mul(scale.z),
      rotation.element(int(2)).element(int(2)).mul(scale.z),
      0.0,
      position.x,
      position.y,
      position.z,
      1.0,
    )
  },
).setLayout({
  name: 'compose',
  type: 'mat4',
  inputs: [
    { name: 'position', type: 'vec3' },
    { name: 'rotation', type: 'mat3' },
    { name: 'scale', type: 'vec3' },
  ],
}) satisfies Mat4Node

