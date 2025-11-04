import { color, float } from 'three/tsl'

import { createPBRStandard, type PBRMaterialHandle } from '@tslstudio/tsl/materials/pbr/standard'; 

export interface MetalMaterialOptions {
  color?: string
  roughness?: number
  anisotropy?: number
  clearcoat?: number
}

export function createBrushedMetalMaterial(options: MetalMaterialOptions = {}): PBRMaterialHandle {
  return createPBRStandard({
    baseColor: options.color ?? '#c1ccd6',
    metalness: float(1),
    roughness: float(options.roughness ?? 0.18),
    anisotropy: {
      strength: float(options.anisotropy ?? 0.6),
      rotation: color('#ffcc88'),
    },
    clearcoat: {
      strength: float(options.clearcoat ?? 0.2),
      roughness: 0.1,
    },
  })
}

