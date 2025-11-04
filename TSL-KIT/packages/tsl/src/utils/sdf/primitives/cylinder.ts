import { Fn, dot, length, vec3 } from 'three/tsl'

import type { FloatNode, Vec3Node } from '../../../index'; 

/**
 * Signed distance to an infinite cylinder defined by an axis and radius.
 */
export const sdCylinder = Fn<readonly [Vec3Node, Vec3Node, Vec3Node, FloatNode]>(
  ([pointInput, axisOriginInput, axisDirectionInput, radius]) => {
    const point = vec3(pointInput).toVar()
    const axisOrigin = vec3(axisOriginInput).toVar()
    const axisDirection = vec3(axisDirectionInput).toVar()
    const pToOrigin = point.sub(axisOrigin)
    const projectionLength = dot(pToOrigin, axisDirection)
    const closestPoint = axisOrigin.add(axisDirection.mul(projectionLength))

    return length(point.sub(closestPoint)).sub(radius)
  },
).setLayout({
  name: 'sdCylinder',
  type: 'float',
  inputs: [
    { name: 'point', type: 'vec3' },
    { name: 'axisOrigin', type: 'vec3' },
    { name: 'axisDirection', type: 'vec3' },
    { name: 'radius', type: 'float' },
  ],
}) satisfies FloatNode

