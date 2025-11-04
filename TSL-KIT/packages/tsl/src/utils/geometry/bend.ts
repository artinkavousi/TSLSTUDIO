import { cross, dot, sin, cos, vec3, clamp } from 'three/tsl'

import type { Vec3Node } from '../../index'; 
import { toFloatNode, toVec3Node, type FloatInput, type Vec3Input } from './utils'; 

export interface BendOptions {
  /** Axis describing the direction of the bend (defaults to +Y). */
  axis?: Vec3Input
  /** Auxiliary reference vector used to derive the perpendicular basis. Must not be parallel to the axis. */
  reference?: Vec3Input
  /** Bend origin in object space. */
  origin?: Vec3Input
  /** Base radius of curvature. */
  radius?: FloatInput
  /** Optional clamp range for the arc length (in object units). */
  clampLength?: FloatInput
}

const DEFAULT_REFERENCE = vec3(1, 0, 0)

/**
 * Bends a position around a cylindrical arc whose angle is driven by the distance along the bend axis.
 */
export function applyBend(position: Vec3Node, curvature: FloatInput, options: BendOptions = {}): Vec3Node {
  const axisDir = toVec3Node(options.axis, [0, 1, 0]).normalize()
  const originNode = toVec3Node(options.origin, [0, 0, 0])
  const referenceNode = toVec3Node(options.reference, [1, 0, 0]).normalize()
  const radiusNode = toFloatNode(options.radius, 1)
  const curvatureNode = toFloatNode(curvature, 0)
  const clampNode = options.clampLength ? toFloatNode(options.clampLength, 0) : null

  const tangentDir = axisDir.cross(referenceNode).normalize()
  const binormalDir = axisDir.cross(tangentDir).normalize()

  const local = position.sub(originNode)
  let axialDistance = dot(local, axisDir)
  if (clampNode) {
    axialDistance = clamp(axialDistance, clampNode.mul(-1), clampNode)
  }
  const radialOffset = dot(local, tangentDir)
  const binormalOffset = dot(local, binormalDir)

  const arcRadius = radiusNode.add(radialOffset)
  const angle = axialDistance.mul(curvatureNode)
  const sinAngle = sin(angle)
  const cosAngle = cos(angle)

  const bentAxis = axisDir.mul(sinAngle.mul(arcRadius))
  const bentTangent = tangentDir.mul(cosAngle.mul(arcRadius).sub(radiusNode))
  const preservedBinormal = binormalDir.mul(binormalOffset)

  return bentAxis.add(bentTangent).add(preservedBinormal).add(originNode)
}


