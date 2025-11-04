import { color, float } from 'three/tsl'

import { createPBRStandard, type PBRMaterialHandle } from '@tslstudio/tsl/materials/pbr/standard'; 

export interface FabricMaterialOptions {
  baseColor?: string
  sheenColor?: string
  sheenStrength?: number
  roughness?: number
}

export function createFabricMaterial(options: FabricMaterialOptions = {}): PBRMaterialHandle {
  return createPBRStandard({
    baseColor: options.baseColor ?? '#3f4a7b',
    roughness: float(options.roughness ?? 0.45),
    metalness: 0,
    sheen: {
      strength: float(options.sheenStrength ?? 0.9),
      color: color(options.sheenColor ?? '#5773c4'),
      roughness: float(0.4),
    },
  })
}

