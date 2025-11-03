import { float } from 'three/tsl';
import { makeMaterial } from '../index.js';

export interface DisneyMaterialOptions {
  baseColor?: string;
  roughness?: number;
  clearcoat?: number;
  sheen?: number;
  iridescence?: number;
}

export function createDisneyMaterial(options: DisneyMaterialOptions = {}) {
  const spec = {
    kind: 'material',
    model: 'pbr',
    layers: [
      {
        type: 'baseColor',
        hex: options.baseColor ?? '#222226',
        exposure: 0,
      },
      {
        type: 'noise',
        variant: 'fbm',
        scale: 6,
        octaves: 4,
        weight: 0.12,
      },
      {
        type: 'clearcoat',
        amount: options.clearcoat ?? 0.85,
        gloss: 0.08,
      },
      {
        type: 'sheen',
        color: '#fdf3ff',
        intensity: options.sheen ?? 0.4,
      },
      {
        type: 'iridescence',
        ior: 1.6,
        thickness: [220, 760],
        fresnelStrength: options.iridescence ?? 0.75,
      },
    ],
  } as const;

  const material = makeMaterial(spec as any);
  if (options.roughness !== undefined && material) {
    (material as any).roughnessNode = float(options.roughness);
  }
  return material;
}

