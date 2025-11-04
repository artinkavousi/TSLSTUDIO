import type { ColorRepresentation } from 'three'
import { MeshPhysicalNodeMaterial } from 'three/webgpu'

import {
  applyAnisotropy,
  type AnisotropyOptions,
  type AnisotropyPatch,
} from './anisotropy'; 
import { applyClearcoat, type ClearcoatOptions, type ClearcoatPatch } from './clearcoat'; 
import { applySheen, type SheenOptions, type SheenPatch } from './sheen'; 
import {
  applyTransmission,
  type TransmissionOptions,
  type TransmissionPatch,
} from './transmission'; 
import { toColorNode, toFloatNode, type NodeRepresentation } from '../utils';

type NodeOrNumber = number | NodeRepresentation

export interface PBRStandardOptions {
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

export interface PBRMaterialNodes {
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

export interface PBRMaterialHandle {
  material: MeshPhysicalNodeMaterial
  nodes: PBRMaterialNodes
}

type PhysicalMaterialNodes = MeshPhysicalNodeMaterial & {
  colorNode?: NodeRepresentation
  metalnessNode?: NodeRepresentation
  roughnessNode?: NodeRepresentation
  normalNode?: NodeRepresentation
  emissiveNode?: NodeRepresentation
  aoNode?: NodeRepresentation
  opacityNode?: NodeRepresentation
  specularColorNode?: NodeRepresentation
  specularIntensityNode?: NodeRepresentation
  iorNode?: NodeRepresentation
}

const isOptionsObject = <T extends object>(value: unknown, keys: (keyof T)[]): value is T => {
  if (!value || typeof value !== 'object') {
    return false
  }

  return keys.some((key) => key in (value as object))
}

export function createPBRStandard(options: PBRStandardOptions = {}): PBRMaterialHandle {
  const material = new MeshPhysicalNodeMaterial({ transparent: options.opacity !== undefined })
  const target = material as PhysicalMaterialNodes

  const baseColor = toColorNode(options.baseColor, '#ffffff')
  const metalness = toFloatNode(options.metalness, 0.1)
  const roughness = toFloatNode(options.roughness, 0.4)

  target.colorNode = baseColor
  target.metalnessNode = metalness
  target.roughnessNode = roughness

  if (options.normal) {
    target.normalNode = options.normal
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
      target.emissiveNode = emissiveNode.mul(strength)
      nodes.emissive = target.emissiveNode
    } else {
      target.emissiveNode = emissiveNode
      nodes.emissive = emissiveNode
    }
  }

  if (options.ao !== undefined) {
    target.aoNode = options.ao
    nodes.ao = options.ao
  }

  if (options.opacity !== undefined) {
    const opacityNode = toFloatNode(options.opacity, 1)
    target.opacityNode = opacityNode
    material.transparent = true
    nodes.opacity = opacityNode
  }

  if (options.specularColor !== undefined) {
    const specColor = toColorNode(options.specularColor, '#ffffff')
    target.specularColorNode = specColor
    nodes.specularColor = specColor
  }

  if (options.specularIntensity !== undefined) {
    const specIntensity = toFloatNode(options.specularIntensity, 1)
    target.specularIntensityNode = specIntensity
    nodes.specularIntensity = specIntensity
  }

  if (options.ior !== undefined) {
    const iorNode = toFloatNode(options.ior, 1.5)
    target.iorNode = iorNode
    nodes.ior = iorNode
  }

  if (options.clearcoat !== undefined) {
    const clearcoatOptions = isOptionsObject<ClearcoatOptions>(options.clearcoat, ['strength', 'roughness', 'normal'])
      ? (options.clearcoat as ClearcoatOptions)
      : { strength: options.clearcoat as NodeOrNumber }
    nodes.clearcoat = applyClearcoat(material, clearcoatOptions)
  }

  if (options.sheen !== undefined) {
    const sheenOptions = isOptionsObject<SheenOptions>(options.sheen, ['strength', 'color', 'roughness'])
      ? (options.sheen as SheenOptions)
      : { strength: options.sheen as NodeOrNumber }
    nodes.sheen = applySheen(material, sheenOptions)
  }

  if (options.anisotropy !== undefined) {
    const anisotropyOptions = isOptionsObject<AnisotropyOptions>(options.anisotropy, ['strength', 'rotation'])
      ? (options.anisotropy as AnisotropyOptions)
      : { strength: options.anisotropy as NodeOrNumber }
    nodes.anisotropy = applyAnisotropy(material, anisotropyOptions)
  }

  if (options.transmission !== undefined) {
    const transmissionOptions = isOptionsObject<TransmissionOptions>(options.transmission, [
      'strength',
      'thickness',
      'attenuationColor',
      'attenuationDistance',
      'ior',
      'dispersion',
    ])
      ? (options.transmission as TransmissionOptions)
      : { strength: options.transmission as NodeOrNumber }
    nodes.transmission = applyTransmission(material, transmissionOptions)
  }

  return { material, nodes }
}

