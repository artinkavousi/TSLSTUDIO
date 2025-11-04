// @ts-nocheck
import type { MeshPhysicalNodeMaterial } from 'three/webgpu'
import type { ColorRepresentation } from 'three'
import type { NodeRepresentation } from 'three/tsl'
import { toColorNode, toFloatNode } from '../utils'

export type SheenOptions = {
  strength?: number | NodeRepresentation
  color?: ColorRepresentation | NodeRepresentation
  roughness?: number | NodeRepresentation
}

export type SheenPatch = {
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
  if (patch.sheenNode !== undefined) material.sheenNode = patch.sheenNode
  if (patch.sheenColorNode !== undefined) material.sheenColorNode = patch.sheenColorNode
  if (patch.sheenRoughnessNode !== undefined) material.sheenRoughnessNode = patch.sheenRoughnessNode
  return patch
}



