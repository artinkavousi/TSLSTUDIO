export function curlSwarmSpec() {
  return {
    kind: 'compute',
    sim: 'particles',
    count: 256 * 256,
    workgroupSize: [8, 8, 1] as const,
    fields: [
      { type: 'curlNoise', amplitude: 0.6, frequency: 0.9, timeScale: 0.6 },
      { type: 'gravity', direction: [0, -0.15, 0], strength: 0.25 },
      { type: 'attractor', position: [0, 0.5, 0], strength: 0.85, falloff: 1.4 },
    ] as const,
    spawn: { rate: 1200, lifetime: [1.8, 4.2], shape: 'sphere', radius: 1.8 } as const,
  } as const;
}

