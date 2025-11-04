import { createParticleSimulation } from '@tslstudio/tsl'
import type { TurbulenceField } from '@tslstudio/tsl/compute/particles/emitter'; 

export interface TurbulenceParticlesConfig {
  count: number
  spawnRadius?: number
  spawnJitter?: number
  maxDelta?: number
  amplitude?: number
  drag?: number
}

type BaseSimulation = ReturnType<typeof createParticleSimulation>

export interface TurbulenceParticleSystem extends BaseSimulation {
  setAmplitude(value: number): void
  setDrag(value: number): void
}

export function createTurbulenceParticles(config: TurbulenceParticlesConfig): TurbulenceParticleSystem {
  const turbulenceField: TurbulenceField = {
    type: 'turbulence',
    amplitude: config.amplitude,
    drag: config.drag,
  }

  const simulation = createParticleSimulation({
    count: config.count,
    spawnRadius: config.spawnRadius,
    spawnJitter: config.spawnJitter,
    maxDelta: config.maxDelta,
    fields: [turbulenceField],
  })

  return {
    ...simulation,
    setAmplitude(value: number) {
      turbulenceField.amplitude = value
    },
    setDrag(value: number) {
      turbulenceField.drag = value
    },
  }
}

