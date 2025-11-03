import { makeMaterial } from '../../materials/index.js';

export function carPaintIridescentMaterial() {
  const spec = {
    kind: 'material',
    model: 'pbr',
    layers: [
      { type: 'baseColor', hex: '#1b1f73', exposure: 0 },
      { type: 'noise', variant: 'fbm', scale: 120, octaves: 5, weight: 0.25 },
      { type: 'anisotropy', strength: 0.7, direction: [1, 0], roughness: 0.15 },
      { type: 'clearcoat', amount: 0.9, gloss: 0.06 },
      { type: 'sheen', color: '#d8d8ff', intensity: 0.4 },
      { type: 'iridescence', ior: 1.6, thickness: [220, 780], fresnelStrength: 1 },
    ],
    mapping: { type: 'triplanar', scale: 2, sharpness: 3 },
    ibl: { type: 'envLUT', intensity: 1.2 },
  } as const;
  return makeMaterial(spec as any);
}

export function satinClothMaterial() {
  const spec = {
    kind: 'material',
    model: 'pbr',
    layers: [
      { type: 'baseColor', hex: '#6f5267', exposure: 0 },
      { type: 'noise', variant: 'curl', scale: 5, octaves: 3, weight: 0.18 },
      { type: 'sheen', color: '#fef0ff', intensity: 0.8 },
      { type: 'anisotropy', strength: 0.45, direction: [0.5, 0.5], roughness: 0.25 },
    ],
    mapping: { type: 'triplanar', scale: 3.5, sharpness: 2.5 },
  } as const;
  return makeMaterial(spec as any);
}

export function stylizedSkinMaterial() {
  const spec = {
    kind: 'material',
    model: 'pbr',
    layers: [
      { type: 'baseColor', hex: '#f2c9b7', exposure: 0 },
      { type: 'subsurface', thickness: 0.35, color: '#ffddcc', scatter: 0.55 },
      { type: 'noise', variant: 'fbm', scale: 14, octaves: 5, weight: 0.12 },
    ],
    mapping: { type: 'uv', scale: [1.2, 1.2], offset: [0, 0] },
  } as const;
  return makeMaterial(spec as any);
}

