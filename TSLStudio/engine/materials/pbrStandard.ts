// @ts-nocheck
import type { ColorRepresentation } from 'three'
import { MeshPhysicalNodeMaterial } from 'three/webgpu'
import type { NodeRepresentation } from 'three/tsl'

import { type ClearcoatOptions, type ClearcoatPatch, applyClearcoat } from './clearcoat'
import { type SheenOptions, type SheenPatch, applySheen } from './sheen'
import { type AnisotropyOptions, type AnisotropyPatch, applyAnisotropy } from './anisotropy'
import { type TransmissionOptions, type TransmissionPatch, applyTransmission } from './transmission'
import { toColorNode, toFloatNode } from './utils'

type NodeOrNumber = number | NodeRepresentation

export type PBRStandardOptions = {
  baseColor?: ColorRepresentation | NodeRepresentation
  metalness?: NodeOrNumber
  roughness?: NodeOrNumber
  normal?: NodeRepresentation
  emissive?: ColorRepresentation | NodeRepresentation
  emissiveStrength?: NodeOrNumber
  ao?: NodeRepresentation
  opacity?: NodeOrNumber
  clearcoat?: NodeOrNumber | ClearcoatOptions
  sheen?: NodeOrNumber | SheenOptions
  anisotropy?: NodeOrNumber | AnisotropyOptions
  transmission?: NodeOrNumber | TransmissionOptions
  ior?: NodeOrNumber
  specularColor?: ColorRepresentation | NodeRepresentation
  specularIntensity?: NodeOrNumber
}

export type PBRMaterialNodes = {
  baseColor: NodeRepresentation
  metalness: NodeRepresentation
  roughness: NodeRepresentation
  emissive?: NodeRepresentation
  ao?: NodeRepresentation
  opacity?: NodeRepresentation
  normal?: NodeRepresentation
  clearcoat?: ClearcoatPatch
  sheen?: SheenPatch
  anisotropy?: AnisotropyPatch
  transmission?: TransmissionPatch
  specularColor?: NodeRepresentation
  specularIntensity?: NodeRepresentation
  ior?: NodeRepresentation
}

export type PBRMaterialHandle = {
  material: MeshPhysicalNodeMaterial
  nodes: PBRMaterialNodes
}

function isOptionsObject<T>(value: unknown, keys: (keyof T)[]): value is T {
  if (!value || typeof value !== 'object') return false
  return keys.some((key) => key in (value as object))
}

export function createPBRStandard(options: PBRStandardOptions = {}): PBRMaterialHandle {
  const material = new MeshPhysicalNodeMaterial({ transparent: options.opacity !== undefined })

  const baseColor = toColorNode(options.baseColor, '#ffffff')
  const metalness = toFloatNode(options.metalness, 0.1)
  const roughness = toFloatNode(options.roughness, 0.4)

  material.colorNode = baseColor
  material.metalnessNode = metalness
  material.roughnessNode = roughness

  if (options.normal) {
    material.normalNode = options.normal
  }

  const nodes: PBRMaterialNodes = {
    baseColor,
    metalness,
    roughness,
  }

  if (options.emissive !== undefined) {
    const emissiveNode = toColorNode(options.emissive, '#ffffff')
    if (options.emissiveStrength !== undefined) {
      const strength = toFloatNode(options.emissiveStrength, 1)
      material.emissiveNode = emissiveNode.mul(strength)
      nodes.emissive = material.emissiveNode
    } else {
      material.emissiveNode = emissiveNode
      nodes.emissive = emissiveNode
    }
  }

  if (options.ao !== undefined) {
    material.aoNode = options.ao
    nodes.ao = options.ao
  }

  if (options.opacity !== undefined) {
    const opacityNode = toFloatNode(options.opacity, 1)
    material.opacityNode = opacityNode
    material.transparent = true
    nodes.opacity = opacityNode
  }

  if (options.specularColor !== undefined) {
    const specColor = toColorNode(options.specularColor, '#ffffff')
    material.specularColorNode = specColor
    nodes.specularColor = specColor
  }

  if (options.specularIntensity !== undefined) {
    const specIntensity = toFloatNode(options.specularIntensity, 1)
    material.specularIntensityNode = specIntensity
    nodes.specularIntensity = specIntensity
  }

  if (options.ior !== undefined) {
    const iorNode = toFloatNode(options.ior, 1.5)
    material.iorNode = iorNode
    nodes.ior = iorNode
  }

  if (options.clearcoat !== undefined) {
    const clearcoatOpts = isOptionsObject<ClearcoatOptions>(options.clearcoat, ['strength', 'roughness', 'normal'])
      ? (options.clearcoat as ClearcoatOptions)
      : { strength: options.clearcoat as NodeOrNumber }
    nodes.clearcoat = applyClearcoat(material, clearcoatOpts)
  }

  if (options.sheen !== undefined) {
    const sheenOpts = isOptionsObject<SheenOptions>(options.sheen, ['strength', 'color', 'roughness'])
      ? (options.sheen as SheenOptions)
      : { strength: options.sheen as NodeOrNumber }
    nodes.sheen = applySheen(material, sheenOpts)
  }

  if (options.anisotropy !== undefined) {
    const anisotropyOpts = isOptionsObject<AnisotropyOptions>(options.anisotropy, ['strength', 'rotation'])
      ? (options.anisotropy as AnisotropyOptions)
      : { strength: options.anisotropy as NodeOrNumber }
    nodes.anisotropy = applyAnisotropy(material, anisotropyOpts)
  }

  if (options.transmission !== undefined) {
    const transmissionOpts = isOptionsObject<TransmissionOptions>(options.transmission, [
      'strength',
      'thickness',
      'attenuationColor',
      'attenuationDistance',
      'ior',
      'dispersion',
    ])
      ? (options.transmission as TransmissionOptions)
      : { strength: options.transmission as NodeOrNumber }
    nodes.transmission = applyTransmission(material, transmissionOpts)
  }

  return { material, nodes }
}


