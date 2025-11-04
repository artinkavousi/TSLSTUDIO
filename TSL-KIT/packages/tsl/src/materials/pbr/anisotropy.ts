import type { MeshPhysicalNodeMaterial } from 'three/webgpu'

import { toFloatNode, toVec3Node, type NodeRepresentation } from '../utils'; 

export interface AnisotropyOptions {
  strength?: number | NodeRepresentation
  rotation?: NodeRepresentation | [number, number, number] | number
}

export interface AnisotropyPatch {
  anisotropyNode?: NodeRepresentation
  anisotropyRotationNode?: NodeRepresentation
}

type MaterialWithAnisotropy = MeshPhysicalNodeMaterial & {
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
  const target = material as MaterialWithAnisotropy

  if (patch.anisotropyNode !== undefined) {
    target.anisotropyNode = patch.anisotropyNode
  }

  if (patch.anisotropyRotationNode !== undefined) {
    target.anisotropyRotationNode = patch.anisotropyRotationNode
  }

  return patch
}

