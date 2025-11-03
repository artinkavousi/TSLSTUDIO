// Compute system - deferred to future implementation
// Export placeholder to prevent build errors
export const placeholder = true;

export type ParticleSimulation = {
  count: number
  update: (delta?: number) => void
  dispose: () => void
}

export const createParticleSim = (_spec?: unknown): ParticleSimulation => {
  console.warn('[tsl-kit] createParticleSim placeholder invoked. Returning no-op simulation.')
  return {
    count: 0,
    update: () => {
      /* noop */
    },
    dispose: () => {
      /* noop */
    },
  }
}

