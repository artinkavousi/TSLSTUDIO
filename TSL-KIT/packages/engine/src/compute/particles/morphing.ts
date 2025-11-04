import { storage } from 'three/tsl'
import { StorageInstancedBufferAttribute } from 'three/webgpu'

import {
  createParticleSimulation,
  type MorphTargetField,
  type ParticleSimulation,
} from '@tslstudio/tsl/compute/particles/emitter'; 

export interface MorphTargetParticlesConfig {
  targets: Float32Array[]
  spawnRadius?: number
  spawnJitter?: number
  attraction?: number
  damping?: number
  maxDelta?: number
}

export interface MorphTargetParticleSystem extends ParticleSimulation {
  setTarget(index: number): void
  setTargetFromArray(data: Float32Array): void
  setAttraction(value: number): void
  setDamping(value: number): void
}

export function createMorphTargetParticles(config: MorphTargetParticlesConfig): MorphTargetParticleSystem {
  if (!config.targets.length) {
    throw new Error('createMorphTargetParticles: at least one target is required')
  }

  const first = config.targets[0]
  if (first.length % 3 !== 0) {
    throw new Error('createMorphTargetParticles: target array length must be divisible by 3')
  }

  const count = first.length / 3

  for (const target of config.targets) {
    if (target.length !== first.length) {
      throw new Error('createMorphTargetParticles: all targets must have the same length')
    }
  }

  const targetAttribute = new StorageInstancedBufferAttribute(count, 3)
  targetAttribute.array.set(first)
  targetAttribute.needsUpdate = true

  const targetStorage = storage(targetAttribute, 'vec3', count)

  const morphField: MorphTargetField = {
    type: 'morphTarget',
    target: targetStorage,
    attraction: config.attraction,
    damping: config.damping,
  }

  const simulation = createParticleSimulation({
    count,
    spawnRadius: config.spawnRadius,
    spawnJitter: config.spawnJitter,
    maxDelta: config.maxDelta,
    fields: [morphField],
  })

  let currentIndex = 0

  const applyTarget = (data: Float32Array) => {
    if (data.length !== first.length) {
      throw new Error('createMorphTargetParticles: target length mismatch')
    }
    targetAttribute.array.set(data)
    targetAttribute.needsUpdate = true
  }

  return {
    ...simulation,
    setTarget(index: number) {
      if (index < 0 || index >= config.targets.length) {
        throw new Error('createMorphTargetParticles: target index out of range')
      }
      if (index === currentIndex) return
      currentIndex = index
      applyTarget(config.targets[index])
    },
    setTargetFromArray(data: Float32Array) {
      applyTarget(data)
    },
    setAttraction(value: number) {
      morphField.attraction = value
    },
    setDamping(value: number) {
      morphField.damping = value
    },
  }
}

