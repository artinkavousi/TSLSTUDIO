import type { ColorRepresentation } from 'three'
import type { MeshPhysicalNodeMaterial } from 'three/webgpu'

import { toColorNode, toFloatNode, type NodeRepresentation } from '../utils'; 

export interface TransmissionOptions {
  strength?: number | NodeRepresentation
  thickness?: number | NodeRepresentation
  attenuationColor?: ColorRepresentation | NodeRepresentation
  attenuationDistance?: number | NodeRepresentation
  ior?: number | NodeRepresentation
  dispersion?: number | NodeRepresentation
}

export interface TransmissionPatch {
  transmissionNode?: NodeRepresentation
  thicknessNode?: NodeRepresentation
  attenuationColorNode?: NodeRepresentation
  attenuationDistanceNode?: NodeRepresentation
  iorNode?: NodeRepresentation
  dispersionNode?: NodeRepresentation
}

type MaterialWithTransmission = MeshPhysicalNodeMaterial & {
  transmissionNode?: NodeRepresentation
  thicknessNode?: NodeRepresentation
  attenuationColorNode?: NodeRepresentation
  attenuationDistanceNode?: NodeRepresentation
  iorNode?: NodeRepresentation
  dispersionNode?: NodeRepresentation
}

export function createTransmissionPatch(options: TransmissionOptions = {}): TransmissionPatch {
  const patch: TransmissionPatch = {}

  if (options.strength !== undefined) {
    patch.transmissionNode = toFloatNode(options.strength, 0)
  }

  if (options.thickness !== undefined) {
    patch.thicknessNode = toFloatNode(options.thickness, 0.1)
  }

  if (options.attenuationColor !== undefined) {
    patch.attenuationColorNode = toColorNode(options.attenuationColor, '#ffffff')
  }

  if (options.attenuationDistance !== undefined) {
    patch.attenuationDistanceNode = toFloatNode(options.attenuationDistance, 1)
  }

  if (options.ior !== undefined) {
    patch.iorNode = toFloatNode(options.ior, 1.5)
  }

  if (options.dispersion !== undefined) {
    patch.dispersionNode = toFloatNode(options.dispersion, 0)
  }

  return patch
}

export function applyTransmission(material: MeshPhysicalNodeMaterial, options: TransmissionOptions = {}): TransmissionPatch {
  const patch = createTransmissionPatch(options)
  const target = material as MaterialWithTransmission

  if (patch.transmissionNode !== undefined) {
    target.transmissionNode = patch.transmissionNode
  }

  if (patch.thicknessNode !== undefined) {
    target.thicknessNode = patch.thicknessNode
  }

  if (patch.attenuationColorNode !== undefined) {
    target.attenuationColorNode = patch.attenuationColorNode
  }

  if (patch.attenuationDistanceNode !== undefined) {
    target.attenuationDistanceNode = patch.attenuationDistanceNode
  }

  if (patch.iorNode !== undefined) {
    target.iorNode = patch.iorNode
  }

  if (patch.dispersionNode !== undefined) {
    target.dispersionNode = patch.dispersionNode
  }

  return patch
}

