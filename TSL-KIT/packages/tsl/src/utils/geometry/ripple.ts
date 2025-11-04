import { clamp, dot, float, sin, time, vec3 } from 'three/tsl'

import type { Vec3Node } from '../../index'; 
import { toFloatNode, toVec3Node, type FloatInput, type Vec3Input } from './utils'; 

export interface RippleOptions {
  /** Axis perpendicular to the ripple plane (defaults to +Y). */
  axis?: Vec3Input
  /** Ripple origin. */
  origin?: Vec3Input
  /** Direction of the displacement (defaults to +Y). */
  direction?: Vec3Input
  /** Temporal phase offset. */
  phase?: FloatInput
  /** Propagation speed multiplier. */
  speed?: FloatInput
  /** Falloff strength; larger values dampen faster. */
  decay?: FloatInput
}

/**
 * Applies a radial ripple displacement that decays with distance from the origin.
 */
export function applyRipple(
  position: Vec3Node,
  amplitude: FloatInput,
  frequency: FloatInput,
  options: RippleOptions = {},
): Vec3Node {
  const axisDir = toVec3Node(options.axis, [0, 1, 0]).normalize()
  const originNode = toVec3Node(options.origin, [0, 0, 0])
  const directionNode = toVec3Node(options.direction, [0, 1, 0]).normalize()
  const amplitudeNode = toFloatNode(amplitude, 0.15)
  const frequencyNode = toFloatNode(frequency, 8)
  const phaseNode = toFloatNode(options.phase, 0)
  const speedNode = toFloatNode(options.speed, 0.5)
  const decayNode = toFloatNode(options.decay, 3)

  const local = position.sub(originNode)
  const axialDistance = dot(local, axisDir)
  const axialComponent = axisDir.mul(axialDistance)
  const radial = local.sub(axialComponent)
  const distance = radial.length()

  const ripplePhase = distance.mul(frequencyNode).add(phaseNode).sub(time.mul(speedNode))
  const attenuation = clamp(float(1).div(decayNode.mul(distance).add(1)), 0, 1)
  const displacement = directionNode.mul(sin(ripplePhase).mul(amplitudeNode).mul(attenuation))

  return position.add(displacement)
}


