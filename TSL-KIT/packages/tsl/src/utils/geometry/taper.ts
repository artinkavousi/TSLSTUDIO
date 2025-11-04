import { clamp, dot, mix } from 'three/tsl'

import type { Vec3Node } from '../../index'; 
import { toFloatNode, toVec3Node, type FloatInput, type Vec3Input } from './utils'; 

export interface TaperOptions {
  /** Axis used to measure the taper progression (defaults to +Y). */
  axis?: Vec3Input
  /** Taper origin in object space. */
  origin?: Vec3Input
  /** Total length used to normalize the taper factor. */
  length?: FloatInput
  /** Scale at the start of the taper. */
  start?: FloatInput
  /** Scale at the end of the taper. */
  end?: FloatInput
}

/**
 * Scales the components perpendicular to the given axis, producing a taper effect along its length.
 */
export function applyTaper(position: Vec3Node, options: TaperOptions = {}): Vec3Node {
  const axisDir = toVec3Node(options.axis, [0, 1, 0]).normalize()
  const originNode = toVec3Node(options.origin, [0, 0, 0])
  const lengthNode = toFloatNode(options.length, 1)
  const startScale = toFloatNode(options.start, 1)
  const endScale = toFloatNode(options.end, 0.5)

  const local = position.sub(originNode)
  const axialDistance = dot(local, axisDir)
  const axialComponent = axisDir.mul(axialDistance)
  const radialComponent = local.sub(axialComponent)

  const t = clamp(axialDistance.div(lengthNode), 0, 1)
  const scale = mix(startScale, endScale, t)

  return axialComponent.add(radialComponent.mul(scale)).add(originNode)
}


