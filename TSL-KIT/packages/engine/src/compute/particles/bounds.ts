import {
  createParticleSimulation,
  type BoundingSphereField,
  type ParticleSimulation,
} from '@tslstudio/tsl/compute/particles/emitter'; 

export interface BoundingSphereParticlesConfig {
  count: number
  radius?: number
  center?: [number, number, number]
  restitution?: number
  spawnRadius?: number
  spawnJitter?: number
  maxDelta?: number
}

export interface BoundingSphereParticleSystem extends ParticleSimulation {
  setRadius(value: number): void
  setCenter(value: [number, number, number]): void
  setRestitution(value: number): void
}

export function createBoundingSphereParticles(config: BoundingSphereParticlesConfig): BoundingSphereParticleSystem {
  const boundsField: BoundingSphereField = {
    type: 'boundingSphere',
    radius: config.radius,
    center: config.center,
    restitution: config.restitution,
  }

  const simulation = createParticleSimulation({
    count: config.count,
    spawnRadius: config.spawnRadius,
    spawnJitter: config.spawnJitter,
    maxDelta: config.maxDelta,
    fields: [boundsField],
  })

  return {
    ...simulation,
    setRadius(value: number) {
      boundsField.radius = value
    },
    setCenter(value: [number, number, number]) {
      boundsField.center = value
    },
    setRestitution(value: number) {
      boundsField.restitution = value
    },
  }
}

