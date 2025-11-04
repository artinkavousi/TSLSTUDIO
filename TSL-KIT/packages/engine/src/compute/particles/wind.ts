import { createParticleSimulation } from '@tslstudio/tsl'

export interface WindParticlesConfig {
  count: number
  spawnRadius?: number
  spawnJitter?: number
  maxDelta?: number
  direction?: [number, number, number]
  strength?: number
  variance?: number
  frequency?: number
}

type BaseSimulation = ReturnType<typeof createParticleSimulation>

export interface WindParticleSystem extends BaseSimulation {
  setDirection(direction: [number, number, number]): void
  setStrength(value: number): void
  setVariance(value: number): void
  setFrequency(value: number): void
}

export function createWindParticles(config: WindParticlesConfig): WindParticleSystem {
  const windField = {
    type: 'wind',
    direction: config.direction,
    strength: config.strength,
    variance: config.variance,
    frequency: config.frequency,
  } as any

  const simulation = createParticleSimulation({
    count: config.count,
    spawnRadius: config.spawnRadius,
    spawnJitter: config.spawnJitter,
    maxDelta: config.maxDelta,
    fields: [windField],
  })

  return {
    ...simulation,
    setDirection(direction: [number, number, number]) {
      windField.direction = direction
    },
    setStrength(value: number) {
      windField.strength = value
    },
    setVariance(value: number) {
      windField.variance = value
    },
    setFrequency(value: number) {
      windField.frequency = value
    },
  }
}

