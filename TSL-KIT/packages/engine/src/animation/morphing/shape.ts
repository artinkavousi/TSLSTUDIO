import { uniform, type ShaderNodeObject } from 'three/tsl'
import type { Node } from 'three/webgpu'

import { applyShapeMorph } from '@tslstudio/tsl/animation/morph'

export interface ShapeMorphConfig {
  base: ShaderNodeObject<Node>
  deltas: ShaderNodeObject<Node>[]
  weights?: ShaderNodeObject<Node>[]
  initialWeights?: number[]
  clamp?: boolean
}

export interface ShapeMorphHandle {
  positionNode: ShaderNodeObject<Node>
  weights: ShaderNodeObject<Node>[]
  setWeight(index: number, value: number): void
}

const ensureWeights = (
  deltas: ShaderNodeObject<Node>[],
  weights: ShaderNodeObject<Node>[] | undefined,
  initial: number[] | undefined,
): { nodes: ShaderNodeObject<Node>[]; uniforms: ShaderNodeObject<Node>[] } => {
  if (weights && weights.length !== deltas.length) {
    throw new Error('[animation] Provided weights must match delta count')
  }

  if (weights) {
    return { nodes: weights, uniforms: [] }
  }

  const uniforms = deltas.map((_, index) => uniform(initial?.[index] ?? 0))
  return { nodes: uniforms, uniforms }
}

export function createShapeMorph(config: ShapeMorphConfig): ShapeMorphHandle {
  const { base, deltas, initialWeights, clamp = false } = config

  if (!deltas.length) {
    throw new Error('[animation] Shape morph requires at least one delta target')
  }

  const { nodes: weightNodes, uniforms } = ensureWeights(deltas, config.weights, initialWeights)

  const weights = clamp ? weightNodes.map((node) => node.clamp(0, 1)) : weightNodes
  const positionNode = applyShapeMorph(base as any, deltas as any, weights as any)

  const setWeight = (index: number, value: number) => {
    const uniformNode = uniforms[index]
    if (!uniformNode) {
      throw new Error('[animation] Weight is externally provided and cannot be set via handle')
    }
    uniformNode.value = clamp ? Math.max(0, Math.min(1, value)) : value
  }

  return {
    positionNode,
    weights: weightNodes,
    setWeight,
  }
}


