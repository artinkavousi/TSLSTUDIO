import type { MeshPhysicalNodeMaterial } from 'three/webgpu'

import { toFloatNode, type NodeRepresentation } from '../utils'; 

export interface ClearcoatOptions {
  strength?: number | NodeRepresentation
  roughness?: number | NodeRepresentation
  normal?: NodeRepresentation
}

export interface ClearcoatPatch {
  clearcoatNode?: NodeRepresentation
  clearcoatRoughnessNode?: NodeRepresentation
  clearcoatNormalNode?: NodeRepresentation
}

type MaterialWithClearcoat = MeshPhysicalNodeMaterial & {
  clearcoatNode?: NodeRepresentation
  clearcoatRoughnessNode?: NodeRepresentation
  clearcoatNormalNode?: NodeRepresentation
}

export function createClearcoatPatch(options: ClearcoatOptions = {}): ClearcoatPatch {
  const patch: ClearcoatPatch = {
    clearcoatNode: toFloatNode(options.strength, 1),
  }

  if (options.roughness !== undefined) {
    patch.clearcoatRoughnessNode = toFloatNode(options.roughness, 0.1)
  }

  if (options.normal !== undefined) {
    patch.clearcoatNormalNode = options.normal
  }

  return patch
}

export function applyClearcoat(material: MeshPhysicalNodeMaterial, options: ClearcoatOptions = {}): ClearcoatPatch {
  const patch = createClearcoatPatch(options)
  const target = material as MaterialWithClearcoat

  if (patch.clearcoatNode !== undefined) {
    target.clearcoatNode = patch.clearcoatNode
  }

  if (patch.clearcoatRoughnessNode !== undefined) {
    target.clearcoatRoughnessNode = patch.clearcoatRoughnessNode
  }

  if (patch.clearcoatNormalNode !== undefined) {
    target.clearcoatNormalNode = patch.clearcoatNormalNode
  }

  return patch
}

