import { float } from 'three/tsl'

import type { FloatNode, Vec3Node } from '../index'; 

const EPSILON = float(1e-5)

export function blendMorphTargets(targets: Vec3Node[], weights: FloatNode[]): Vec3Node {
  if (!targets.length || targets.length !== weights.length) {
    throw new Error('[morph] targets and weights must be non-empty and share the same length')
  }

  const totalWeight = weights[0].toVar()
  for (let i = 1; i < weights.length; i += 1) {
    totalWeight.addAssign(weights[i])
  }

  const blended = targets[0].mul(weights[0]).toVar()
  for (let i = 1; i < targets.length; i += 1) {
    blended.addAssign(targets[i].mul(weights[i]))
  }

  const safeWeight = totalWeight.max(EPSILON)
  return blended.div(safeWeight)
}

export function createTwoWayMorphNode(from: Vec3Node, to: Vec3Node, progress: FloatNode): Vec3Node {
  const t = progress.clamp(float(0), float(1))
  const inverse = float(1).sub(t)
  return from.mul(inverse).add(to.mul(t))
}

export function applyShapeMorph(base: Vec3Node, deltas: Vec3Node[], weights: FloatNode[]): Vec3Node {
  if (deltas.length !== weights.length) {
    throw new Error('[morph] deltas and weights must share the same length')
  }

  const morphed = base.toVar()
  for (let i = 0; i < deltas.length; i += 1) {
    morphed.addAssign(deltas[i].mul(weights[i]))
  }

  return morphed
}


