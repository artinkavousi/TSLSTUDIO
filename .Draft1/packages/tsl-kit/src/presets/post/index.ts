import { makePostChain } from '../../post/index.js';

export function cinematicBloomChain() {
  const spec = {
    kind: 'post',
    passes: [
      ['bloom', { threshold: 1.05, strength: 0.6, radius: 0.9 }],
      ['glare', { streaks: 5, intensity: 0.32, angle: Math.PI / 5 }],
      ['film', { grain: 0.02, temperature: 0.12, tint: '#ffd8b0' }],
      ['tonemap', { curve: 'ACES', exposure: 0.35 }],
    ],
  } as const;

  return makePostChain(spec as any);
}

export function depthFocusChain() {
  const spec = {
    kind: 'post',
    passes: [
      ['dof', { aperture: 0.025, focus: 0.42, maxBlur: 0.85 }],
      ['fog', { density: 0.04, heightFalloff: 0.15, color: '#3a425a' }],
      ['film', { grain: 0.018, temperature: -0.05 }],
      ['tonemap', { curve: 'Filmic', exposure: 0.1 }],
    ],
  } as const;
  return makePostChain(spec as any);
}

