import { cross, dot, float, sin, cos, vec3 } from 'three/tsl'

import type { Vec3Node } from '../../index'; 
import { toFloatNode, toVec3Node, type FloatInput, type Vec3Input } from './utils'; 

export interface TwistOptions {
  /** Axis used for the twist (defaults to the positive Y axis). */
  axis?: Vec3Input
  /** Origin of the twist deformation. */
  origin?: Vec3Input
  /** Additional profile multiplier applied to the twist angle. */
  profile?: FloatInput
}

/**
 * Twists a position around an axis by an amount proportional to the distance along that axis.
 */
export function applyTwist(position: Vec3Node, amount: FloatInput, options: TwistOptions = {}): Vec3Node {
  const axisNode = toVec3Node(options.axis, [0, 1, 0]).normalize()
  const originNode = toVec3Node(options.origin, [0, 0, 0])
  const amountNode = toFloatNode(amount, 0)
  const profileNode = toFloatNode(options.profile, 1)

  const local = position.sub(originNode)
  const axialDistance = dot(local, axisNode)
  const axialComponent = axisNode.mul(axialDistance)
  const radial = local.sub(axialComponent)

  const angle = axialDistance.mul(amountNode).mul(profileNode)
  const sinAngle = sin(angle)
  const cosAngle = cos(angle)

  const rotatedRadial = radial.mul(cosAngle).add(cross(axisNode, radial).mul(sinAngle))

  return rotatedRadial.add(axialComponent).add(originNode)
}


