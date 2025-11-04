import type { ColorRepresentation } from 'three'
import type { MeshPhysicalNodeMaterial } from 'three/webgpu'

import { toColorNode, toFloatNode, type NodeRepresentation } from '../utils'; 

export interface SheenOptions {
  strength?: number | NodeRepresentation
  color?: ColorRepresentation | NodeRepresentation
  roughness?: number | NodeRepresentation
}

export interface SheenPatch {
  sheenNode?: NodeRepresentation
  sheenColorNode?: NodeRepresentation
  sheenRoughnessNode?: NodeRepresentation
}

type MaterialWithSheen = MeshPhysicalNodeMaterial & {
  sheenNode?: NodeRepresentation
  sheenColorNode?: NodeRepresentation
  sheenRoughnessNode?: NodeRepresentation
}

export function createSheenPatch(options: SheenOptions = {}): SheenPatch {
  const patch: SheenPatch = {}

  if (options.strength !== undefined) {
    patch.sheenNode = toFloatNode(options.strength, 0)
  }

  if (options.color !== undefined) {
    patch.sheenColorNode = toColorNode(options.color, '#ffffff')
  }

  if (options.roughness !== undefined) {
    patch.sheenRoughnessNode = toFloatNode(options.roughness, 0.3)
  }

  return patch
}

export function applySheen(material: MeshPhysicalNodeMaterial, options: SheenOptions = {}): SheenPatch {
  const patch = createSheenPatch(options)
  const target = material as MaterialWithSheen

  if (patch.sheenNode !== undefined) {
    target.sheenNode = patch.sheenNode
  }

  if (patch.sheenColorNode !== undefined) {
    target.sheenColorNode = patch.sheenColorNode
  }

  if (patch.sheenRoughnessNode !== undefined) {
    target.sheenRoughnessNode = patch.sheenRoughnessNode
  }

  return patch
}

