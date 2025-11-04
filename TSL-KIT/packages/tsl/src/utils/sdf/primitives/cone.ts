import { Fn, cos, float, length, max, min, sin, vec2, vec3, dot } from 'three/tsl'

import type { FloatNode, Vec3Node } from '../../../index'; 

/**
 * Signed distance to a cone defined by an axis (origin + direction) and apex angle in radians.
 */
export const sdCone = Fn<readonly [Vec3Node, Vec3Node, Vec3Node, FloatNode]>(
  ([pointInput, axisOriginInput, axisDirectionInput, angle]) => {
    const point = vec3(pointInput).toVar()
    const axisOrigin = vec3(axisOriginInput).toVar()
    const axisDirection = vec3(axisDirectionInput).toVar()
    const pToOrigin = point.sub(axisOrigin)
    const height = dot(pToOrigin, axisDirection)
    const radial = pToOrigin.sub(axisDirection.mul(height))
    const radiusAtHeight = length(radial)
    const c = cos(angle)
    const s = sin(angle)
    const boundary = vec2(radiusAtHeight.mul(c).sub(height.mul(s)), height.negate())

    return length(max(boundary, float(0))).add(min(max(boundary.x, boundary.y), float(0)))
  },
).setLayout({
  name: 'sdCone',
  type: 'float',
  inputs: [
    { name: 'point', type: 'vec3' },
    { name: 'axisOrigin', type: 'vec3' },
    { name: 'axisDirection', type: 'vec3' },
    { name: 'angle', type: 'float' },
  ],
}) satisfies FloatNode

