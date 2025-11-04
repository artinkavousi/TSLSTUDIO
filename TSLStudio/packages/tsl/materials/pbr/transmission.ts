// @ts-nocheck
import type { MeshPhysicalNodeMaterial } from 'three/webgpu'
import type { ColorRepresentation } from 'three'
import type { NodeRepresentation } from 'three/tsl'
import { toColorNode, toFloatNode } from '../utils'

export type TransmissionOptions = {
  strength?: number | NodeRepresentation
  thickness?: number | NodeRepresentation
  attenuationColor?: ColorRepresentation | NodeRepresentation
  attenuationDistance?: number | NodeRepresentation
  ior?: number | NodeRepresentation
  dispersion?: number | NodeRepresentation
}

export type TransmissionPatch = {
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
  if (patch.transmissionNode !== undefined) material.transmissionNode = patch.transmissionNode
  if (patch.thicknessNode !== undefined) material.thicknessNode = patch.thicknessNode
  if (patch.attenuationColorNode !== undefined) material.attenuationColorNode = patch.attenuationColorNode
  if (patch.attenuationDistanceNode !== undefined) material.attenuationDistanceNode = patch.attenuationDistanceNode
  if (patch.iorNode !== undefined) material.iorNode = patch.iorNode
  if (patch.dispersionNode !== undefined) material.dispersionNode = patch.dispersionNode
  return patch
}



