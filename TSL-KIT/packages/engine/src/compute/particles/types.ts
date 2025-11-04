import type { ParticleBuffers, ParticleSimulation } from './types'; 

export type { ParticleBuffers, ParticleSimulation }

export interface ParticleSystem extends ParticleSimulation {
  readonly buffers: ParticleBuffers
}

