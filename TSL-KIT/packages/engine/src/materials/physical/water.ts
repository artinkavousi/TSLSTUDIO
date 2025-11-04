import { color, float } from 'three/tsl'

import { createPBRStandard, type PBRMaterialHandle } from '@tslstudio/tsl/materials/pbr/standard'; 

export interface WaterMaterialOptions {
  color?: string
  roughness?: number
  thickness?: number
  attenuationDistance?: number
  ior?: number
}

export function createWaterMaterial(options: WaterMaterialOptions = {}): PBRMaterialHandle {
  return createPBRStandard({
    baseColor: color(options.color ?? '#6bc5ff'),
    metalness: 0,
    roughness: float(options.roughness ?? 0.05),
    transmission: {
      strength: 1,
      thickness: options.thickness ?? 0.1,
      attenuationColor: color(options.color ?? '#6bc5ff'),
      attenuationDistance: options.attenuationDistance ?? 5,
      ior: options.ior ?? 1.33,
    },
    clearcoat: {
      strength: 0.9,
      roughness: 0.03,
    },
  })
}

