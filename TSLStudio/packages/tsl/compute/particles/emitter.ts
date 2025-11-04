// @ts-nocheck
import { StorageInstancedBufferAttribute } from 'three/webgpu'
import type { WebGPURenderer } from 'three/webgpu'
import {
  storage,
  instanceIndex,
  vec3,
  float,
  uniform,
  hash,
  time,
  Fn,
} from 'three/tsl'
import { curlNoise3d } from '@tsl/noise/curl_noise_3d'

export type GravityField = { type: 'gravity'; direction?: [number, number, number]; strength?: number }
export type CurlNoiseField = { type: 'curlNoise'; amplitude?: number; frequency?: number; timeFactor?: number }
export type AttractionField = { type: 'attractor'; position?: [number, number, number]; strength?: number }
export type TurbulenceField = { type: 'turbulence'; amplitude?: number; scale?: number; drag?: number }

export type ParticleField = GravityField | CurlNoiseField | AttractionField | TurbulenceField

export type Integrator = 'euler' | 'verlet'

export type ParticleSimConfig = {
  count: number
  spawnRadius?: number
  spawnJitter?: number
  integrator?: Integrator
  maxDelta?: number
  fields?: ParticleField[]
}

export type ParticleBuffers = {
  position: ReturnType<typeof storage>
  previous: ReturnType<typeof storage> | null
  velocity: ReturnType<typeof storage>
}

export type ParticleSimulation = {
  readonly count: number
  readonly buffers: ParticleBuffers
  readonly positionAttribute: ReturnType<typeof storage>['toAttribute']
  readonly velocityAttribute: ReturnType<typeof storage>['toAttribute']
  init(renderer: WebGPURenderer): void
  update(renderer: WebGPURenderer, deltaSeconds: number): void
  dispose(): void
}

function toVec3(arr?: [number, number, number], fallback: ReturnType<typeof vec3> = vec3(0)) {
  if (!arr) return fallback
  return vec3(arr[0], arr[1], arr[2])
}

function applyGravity(force: ReturnType<typeof vec3>, field: GravityField) {
  const dir = toVec3(field.direction, vec3(0, -1, 0)).normalize()
  const strength = float(field.strength ?? 0.5)
  force.addAssign(dir.mul(strength))
}

function applyCurl(force: ReturnType<typeof vec3>, field: CurlNoiseField, position: ReturnType<typeof vec3>) {
  const amp = float(field.amplitude ?? 0.6)
  const freq = float(field.frequency ?? 1.0)
  const flow = curlNoise3d(position.mul(freq).add(time.mul(field.timeFactor ?? 0.3)))
  force.addAssign(flow.mul(amp))
}

function applyAttractor(
  force: ReturnType<typeof vec3>,
  field: AttractionField,
  position: ReturnType<typeof vec3>,
) {
  const target = toVec3(field.position, vec3(0))
  const dir = target.sub(position).normalize()
  const strength = float(field.strength ?? 0.9)
  force.addAssign(dir.mul(strength))
}

function applyTurbulence(force: ReturnType<typeof vec3>, field: TurbulenceField, velocity: ReturnType<typeof vec3>) {
  const amp = float(field.amplitude ?? 0.4)
  const drag = float(field.drag ?? 0.2)
  const turbulence = vec3(hash(instanceIndex.mul(13.1)), hash(instanceIndex.mul(31.7)), hash(instanceIndex.mul(47.3))).mul(amp)
  force.addAssign(turbulence)
  force.subAssign(velocity.mul(drag))
}

function createBuffers(count: number, integrator: Integrator): ParticleBuffers {
  const position = storage(new StorageInstancedBufferAttribute(count, 3), 'vec3', count)
  const velocity = storage(new StorageInstancedBufferAttribute(count, 3), 'vec3', count)
  const previous = integrator === 'verlet' ? storage(new StorageInstancedBufferAttribute(count, 3), 'vec3', count) : null
  return { position, previous, velocity }
}

export function createParticleSimulation(config: ParticleSimConfig): ParticleSimulation {
  const count = Math.max(1, config.count | 0)
  const spawnRadius = config.spawnRadius ?? 1.0
  const spawnJitter = config.spawnJitter ?? 0.25
  const integrator = config.integrator ?? 'verlet'
  const maxDelta = config.maxDelta ?? 0.033
  const fields = config.fields ?? []

  const buffers = createBuffers(count, integrator)

  const positionAttribute = buffers.position.toAttribute()
  const velocityAttribute = buffers.velocity.toAttribute()

  const uDelta = uniform(0.016)
  const uMaxDelta = uniform(maxDelta)
  const uSpawnRadius = uniform(spawnRadius)
  const uSpawnJitter = uniform(spawnJitter)

  const initCompute = Fn(() => {
    const pos = buffers.position.element(instanceIndex)
    const vel = buffers.velocity.element(instanceIndex)
    const prev = buffers.previous ? buffers.previous.element(instanceIndex) : null

    const rx = hash(instanceIndex.mul(17.23))
    const ry = hash(instanceIndex.mul(47.71))
    const rz = hash(instanceIndex.mul(91.17))

    const jitter = vec3(rx, ry, rz).sub(vec3(0.5)).mul(uSpawnJitter)
    const dir = vec3(rx.mul(2).sub(1), ry.mul(2).sub(1), rz.mul(2).sub(1)).normalize().mul(uSpawnRadius)

    pos.assign(dir.add(jitter))
    vel.assign(vec3(0))
    prev?.assign(pos)
  })().compute(count)

  const updateCompute = Fn(() => {
    const pos = buffers.position.element(instanceIndex)
    const vel = buffers.velocity.element(instanceIndex)
    const prev = buffers.previous ? buffers.previous.element(instanceIndex) : null

    let force = vec3(0).toVar()

    for (const field of fields) {
      if (field.type === 'gravity') applyGravity(force, field)
      if (field.type === 'curlNoise') applyCurl(force, field, pos)
      if (field.type === 'attractor') applyAttractor(force, field, pos)
      if (field.type === 'turbulence') applyTurbulence(force, field, vel)
    }

    const delta = uDelta.min(uMaxDelta)

    if (buffers.previous) {
      const current = pos.toVar()
      const previous = prev!.toVar()
      const next = current.add(current.sub(previous)).add(force.mul(delta.mul(delta)))
      prev!.assign(current)
      pos.assign(next)
      vel.assign(next.sub(current).div(delta))
    } else {
      vel.addAssign(force.mul(delta))
      pos.addAssign(vel.mul(delta))
    }
  })().compute(count)

  let initialized = false

  return {
    count,
    buffers,
    positionAttribute,
    velocityAttribute,
    init(renderer: WebGPURenderer) {
      if (initialized) return
      renderer.compute(initCompute)
      initialized = true
    },
    update(renderer: WebGPURenderer, deltaSeconds: number) {
      uDelta.value = Math.max(0.0001, Math.min(deltaSeconds, maxDelta))
      renderer.compute(updateCompute)
    },
    dispose() {
      buffers.position.array?.dispose?.()
      buffers.velocity.array?.dispose?.()
      buffers.previous?.array?.dispose?.()
    },
  }
}


