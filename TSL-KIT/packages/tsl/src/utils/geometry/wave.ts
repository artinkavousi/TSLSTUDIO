import { dot, sin, time, vec3 } from 'three/tsl'

import type { Vec3Node } from '../../index'; 
import { toFloatNode, toVec3Node, type FloatInput, type Vec3Input } from './utils'; 

export interface WaveOptions {
  /** Axis used to evaluate the wave phase (defaults to +X). */
  axis?: Vec3Input
  /** Origin for the wave evaluation. */
  origin?: Vec3Input
  /** Direction of the displacement (defaults to +Y). */
  direction?: Vec3Input
  /** Additional phase offset. */
  phase?: FloatInput
  /** Wave speed multiplier applied to global time. */
  speed?: FloatInput
}

/**
 * Applies a sinusoidal displacement along a direction using the projection on a given axis.
 */
export function applyWave(
  position: Vec3Node,
  amplitude: FloatInput,
  frequency: FloatInput,
  options: WaveOptions = {},
): Vec3Node {
  const axisDir = toVec3Node(options.axis, [1, 0, 0]).normalize()
  const originNode = toVec3Node(options.origin, [0, 0, 0])
  const directionNode = toVec3Node(options.direction, [0, 1, 0]).normalize()
  const amplitudeNode = toFloatNode(amplitude, 0.2)
  const frequencyNode = toFloatNode(frequency, 1)
  const phaseNode = toFloatNode(options.phase, 0)
  const speedNode = toFloatNode(options.speed, 0)

  const local = position.sub(originNode)
  const projection = dot(local, axisDir)
  const wavePhase = projection.mul(frequencyNode).add(phaseNode).add(time.mul(speedNode))
  const offset = directionNode.mul(sin(wavePhase).mul(amplitudeNode))

  return position.add(offset)
}


