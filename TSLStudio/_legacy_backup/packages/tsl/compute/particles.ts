// @ts-nocheck
import { StorageInstancedBufferAttribute } from 'three/webgpu'
import {
  Fn as tslFn,
  storage,
  instanceIndex,
  vec3,
  float,
  uniform,
  hash,
  time,
} from 'three/tsl'
import type { WebGPURenderer } from 'three/webgpu'
import { curlNoise3d } from '@tsl/noise/curl_noise_3d'

export type GravityField = { type: 'gravity'; direction?: [number, number, number]; strength?: number }
export type CurlNoiseField = { type: 'curlNoise'; amplitude?: number; frequency?: number; timeFactor?: number }
export type ParticleField = GravityField | CurlNoiseField

export type ParticleSimConfig = {
  count: number
  spawnRadius?: number
  fields?: ParticleField[]
}

export type ParticleSimulation = {
  readonly count: number
  readonly positionBuffer: any
  readonly velocityBuffer: any
  readonly positionAttribute: any
  init(renderer: WebGPURenderer): void
  update(renderer: WebGPURenderer, deltaSeconds: number): void
}

export function createParticleSim(config: ParticleSimConfig): ParticleSimulation {
  const count = Math.max(1, config.count | 0)
  const spawnRadius = config.spawnRadius ?? 1.0
  const fields = config.fields ?? []

  const positionBuffer = storage(new StorageInstancedBufferAttribute(count, 3), 'vec3', count)
  const velocityBuffer = storage(new StorageInstancedBufferAttribute(count, 3), 'vec3', count)

  const positionAttribute = positionBuffer.toAttribute()

  const uDelta = uniform(0.016)
  const uSpawnR = uniform(spawnRadius)

  // Initialization compute: random sphere spawn, zero velocity
  const initCompute = tslFn(() => {
    const pos = positionBuffer.element(instanceIndex)
    const vel = velocityBuffer.element(instanceIndex)

    // Simple hash-based spherical distribution
    const rx = hash(instanceIndex)
    const ry = hash(instanceIndex.add(17))
    const rz = hash(instanceIndex.add(43))

    const px = rx.sub(0.5).mul(2.0)
    const py = ry.sub(0.5).mul(2.0)
    const pz = rz.sub(0.5).mul(2.0)
    const dir = vec3(px, py, pz).normalize().mul(uSpawnR)

    pos.assign(dir)
    vel.assign(vec3(0))
  })().compute(count)

  // Update compute: integrate velocity with optional fields
  const updateCompute = tslFn(() => {
    const pos = positionBuffer.element(instanceIndex)
    const vel = velocityBuffer.element(instanceIndex)

    // Accumulate forces
    let force = vec3(0).toVar()

    // Gravity
    {
      const g = fields.find((f): f is GravityField => f.type === 'gravity')
      if (g) {
        const dir = vec3(
          (g.direction?.[0] ?? 0),
          (g.direction?.[1] ?? -1),
          (g.direction?.[2] ?? 0),
        ).normalize()
        const s = float(g.strength ?? 0.4)
        force.addAssign(dir.mul(s))
      }
    }

    // Curl noise field
    {
      const c = fields.find((f): f is CurlNoiseField => f.type === 'curlNoise')
      if (c) {
        const amp = float(c.amplitude ?? 0.6)
        const freq = float(c.frequency ?? 1.0)
        const t = time.mul(c.timeFactor ?? 0.3)
        const flow = curlNoise3d(pos.mul(freq).add(t))
        force.addAssign(flow.mul(amp))
      }
    }

    // Integrate
    vel.addAssign(force.mul(uDelta))
    // Mild damping
    vel.mulAssign(0.999)
    pos.addAssign(vel.mul(uDelta))
  })().compute(count)

  let initialized = false

  return {
    count,
    positionBuffer,
    velocityBuffer,
    positionAttribute,
    init(renderer: WebGPURenderer) {
      if (initialized) return
      // @ts-ignore — renderer.compute is WebGPU-specific
      renderer.compute(initCompute)
      initialized = true
    },
    update(renderer: WebGPURenderer, deltaSeconds: number) {
      uDelta.value = Math.max(0.0001, Math.min(deltaSeconds, 0.05))
      // @ts-ignore — renderer.compute is WebGPU-specific
      renderer.compute(updateCompute)
    },
  }
}



