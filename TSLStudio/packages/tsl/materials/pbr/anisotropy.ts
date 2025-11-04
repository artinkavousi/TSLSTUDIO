// @ts-nocheck
import type { MeshPhysicalNodeMaterial } from 'three/webgpu'
import type { NodeRepresentation } from 'three/tsl'
import { toFloatNode, toVec3Node } from '../utils'

export type AnisotropyOptions = {
  strength?: number | NodeRepresentation
  rotation?: NodeRepresentation | [number, number, number] | number
}

export type AnisotropyPatch = {
  anisotropyNode?: NodeRepresentation
  anisotropyRotationNode?: NodeRepresentation
}

export function createAnisotropyPatch(options: AnisotropyOptions = {}): AnisotropyPatch {
  const patch: AnisotropyPatch = {}

  if (options.strength !== undefined) {
    patch.anisotropyNode = toFloatNode(options.strength, 0)
  }

  if (options.rotation !== undefined) {
    patch.anisotropyRotationNode = toVec3Node(options.rotation, [1, 0, 0])
  }

  return patch
}

export function applyAnisotropy(material: MeshPhysicalNodeMaterial, options: AnisotropyOptions = {}): AnisotropyPatch {
  const patch = createAnisotropyPatch(options)
  if (patch.anisotropyNode !== undefined) material.anisotropyNode = patch.anisotropyNode
  if (patch.anisotropyRotationNode !== undefined) material.anisotropyRotationNode = patch.anisotropyRotationNode
  return patch
}



