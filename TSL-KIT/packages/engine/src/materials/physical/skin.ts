import { color, float } from 'three/tsl'

import { createPBRStandard, type PBRMaterialHandle } from '@tslstudio/tsl/materials/pbr/standard'; 

export interface SkinMaterialOptions {
  baseColor?: string
  subsurface?: number
  sheen?: number
  roughness?: number
}

export function createSkinMaterial(options: SkinMaterialOptions = {}): PBRMaterialHandle {
  return createPBRStandard({
    baseColor: options.baseColor ?? '#f2c7a5',
    metalness: 0,
    roughness: float(options.roughness ?? 0.42),
    sheen: {
      strength: float(options.sheen ?? 0.35),
      color: color('#ffdfcf'),
      roughness: float(0.55),
    },
    transmission: {
      strength: float(options.subsurface ?? 0.15),
      thickness: 0.35,
      attenuationColor: '#ffbd9e',
      attenuationDistance: 0.6,
      ior: 1.4,
    },
  })
}

