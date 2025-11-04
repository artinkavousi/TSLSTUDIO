import type { WebGPURenderer } from 'three/webgpu'

import {
  createParticleSimulation,
  type FlowField,
  type ParticleSimulation,
} from '@tslstudio/tsl/compute/particles/emitter'; 

export interface FlowFieldParticlesConfig {
  count: number
  spawnRadius?: number
  spawnJitter?: number
  amplitude?: number
  frequency?: number
  timeFactor?: number
  maxDelta?: number
}

export interface FlowFieldParticleSystem extends ParticleSimulation {
  setAmplitude(value: number): void
  setFrequency(value: number): void
  setTimeFactor(value: number): void
  update(renderer: WebGPURenderer, deltaSeconds: number): void
}

export function createFlowFieldParticles(config: FlowFieldParticlesConfig): FlowFieldParticleSystem {
  const flowField: FlowField = {
    type: 'flowField',
    amplitude: config.amplitude,
    frequency: config.frequency,
    timeFactor: config.timeFactor,
  }

  const simulation = createParticleSimulation({
    count: config.count,
    spawnRadius: config.spawnRadius,
    spawnJitter: config.spawnJitter,
    maxDelta: config.maxDelta,
    fields: [flowField],
  })

  return {
    ...simulation,
    setAmplitude(value: number) {
      flowField.amplitude = value
    },
    setFrequency(value: number) {
      flowField.frequency = value
    },
    setTimeFactor(value: number) {
      flowField.timeFactor = value
    },
  }
}

