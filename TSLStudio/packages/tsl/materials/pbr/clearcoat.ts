// @ts-nocheck
import type { MeshPhysicalNodeMaterial } from 'three/webgpu'
import type { NodeRepresentation } from 'three/tsl'
import { toFloatNode } from '../utils'

export type ClearcoatOptions = {
  strength?: number | NodeRepresentation
  roughness?: number | NodeRepresentation
  normal?: NodeRepresentation
}

export type ClearcoatPatch = {
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
  if (patch.clearcoatNode !== undefined) material.clearcoatNode = patch.clearcoatNode
  if (patch.clearcoatRoughnessNode !== undefined) material.clearcoatRoughnessNode = patch.clearcoatRoughnessNode
  if (patch.clearcoatNormalNode !== undefined) material.clearcoatNormalNode = patch.clearcoatNormalNode
  return patch
}


