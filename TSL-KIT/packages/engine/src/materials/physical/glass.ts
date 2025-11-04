import { color, float, vec3 } from 'three/tsl'

import { createPBRStandard, type PBRMaterialHandle } from '@tslstudio/tsl/materials/pbr/standard'; 

export interface GlassMaterialOptions {
  tint?: string
  thickness?: number
  ior?: number
  dispersion?: number
  roughness?: number
}

export function createGlassMaterial(options: GlassMaterialOptions = {}): PBRMaterialHandle {
  return createPBRStandard({
    baseColor: options.tint ?? '#e6f5ff',
    roughness: options.roughness ?? 0.02,
    metalness: 0,
    transmission: {
      strength: 1,
      thickness: options.thickness ?? 0.25,
      attenuationColor: options.tint ?? '#e6f5ff',
      attenuationDistance: 4,
      ior: options.ior ?? 1.52,
      dispersion: options.dispersion ?? 0.0,
    },
    clearcoat: {
      strength: 0.8,
      roughness: 0.05,
    },
    opacity: 0.95,
    specularColor: color('#ffffff'),
    specularIntensity: float(1),
  })
}

