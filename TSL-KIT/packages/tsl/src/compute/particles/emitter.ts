import { StorageInstancedBufferAttribute, type WebGPURenderer } from 'three/webgpu'
import { Fn, If, float, hash, instanceIndex, storage, time, uniform, vec3, length, normalize, dot } from 'three/tsl'

import { curlNoise3d } from '../../noise/curl_noise_3d'; 

export interface GravityField {
  type: 'gravity'
  direction?: [number, number, number]
  strength?: number
}

export interface CurlNoiseField {
  type: 'curlNoise'
  amplitude?: number
  frequency?: number
  timeFactor?: number
}

export interface WindField {
  type: 'wind'
  direction?: [number, number, number]
  strength?: number
  variance?: number
  frequency?: number
}

export interface AttractionField {
  type: 'attractor'
  position?: [number, number, number]
  strength?: number
}

export interface TurbulenceField {
  type: 'turbulence'
  amplitude?: number
  scale?: number
  drag?: number
}

export interface FlowField {
  type: 'flowField'
  amplitude?: number
  frequency?: number
  timeFactor?: number
}

export interface MorphTargetField {
  type: 'morphTarget'
  target: ReturnType<typeof storage>
  attraction?: number
  damping?: number
}

export interface BoundingSphereField {
  type: 'boundingSphere'
  center?: [number, number, number]
  radius?: number
  restitution?: number
}

export type ParticleField =
  | GravityField
  | CurlNoiseField
  | AttractionField
  | TurbulenceField
  | FlowField
  | MorphTargetField
  | BoundingSphereField
  | WindField

export type IntegratorType = 'euler' | 'verlet'

export interface ParticleSimConfig {
  count: number
  spawnRadius?: number
  spawnJitter?: number
  integrator?: IntegratorType
  maxDelta?: number
  fields?: ParticleField[]
}

type StorageNode = ReturnType<typeof storage>
type StorageAttribute = StorageNode extends { toAttribute: (...args: any[]) => infer R } ? R : unknown

export interface ParticleBuffers {
  position: StorageNode
  previous: StorageNode | null
  velocity: StorageNode
}

export interface ParticleSimulation {
  readonly count: number
  readonly buffers: ParticleBuffers
  readonly positionAttribute: StorageAttribute
  readonly velocityAttribute: StorageAttribute
  init(renderer: WebGPURenderer): void
  update(renderer: WebGPURenderer, deltaSeconds: number): void
  dispose(): void
}

const toVec3 = (values?: [number, number, number], fallback = vec3(0)) => {
  if (!values) return fallback
  return vec3(values[0], values[1], values[2])
}

const applyGravity = (force: ReturnType<typeof vec3>, field: GravityField) => {
  const dir = toVec3(field.direction, vec3(0, -1, 0)).normalize()
  const strength = float(field.strength ?? 0.5)
  force.addAssign(dir.mul(strength))
}

const applyCurl = (force: ReturnType<typeof vec3>, field: CurlNoiseField, position: ReturnType<typeof vec3>) => {
  const amplitude = float(field.amplitude ?? 0.6)
  const frequency = float(field.frequency ?? 1.0)
  const flow = curlNoise3d(position.mul(frequency).add(time.mul(field.timeFactor ?? 0.3)))
  force.addAssign(flow.mul(amplitude))
}

const applyAttractor = (
  force: ReturnType<typeof vec3>,
  field: AttractionField,
  position: ReturnType<typeof vec3>,
) => {
  const target = toVec3(field.position, vec3(0))
  const dir = target.sub(position).normalize()
  const strength = float(field.strength ?? 0.9)
  force.addAssign(dir.mul(strength))
}

const applyTurbulence = (
  force: ReturnType<typeof vec3>,
  field: TurbulenceField,
  velocity: ReturnType<typeof vec3>,
) => {
  const amplitude = float(field.amplitude ?? 0.4)
  const drag = float(field.drag ?? 0.2)
  const turbulence = vec3(
    hash(instanceIndex.mul(13.1)),
    hash(instanceIndex.mul(31.7)),
    hash(instanceIndex.mul(47.3)),
  ).mul(amplitude)

  force.addAssign(turbulence)
  force.subAssign(velocity.mul(drag))
}

const applyFlowField = (force: ReturnType<typeof vec3>, field: FlowField, position: ReturnType<typeof vec3>) => {
  const amplitude = float(field.amplitude ?? 0.8)
  const frequency = float(field.frequency ?? 0.75)
  const flow = curlNoise3d(position.mul(frequency).add(time.mul(field.timeFactor ?? 0.2)))
  force.addAssign(flow.mul(amplitude))
}

const applyWind = (force: ReturnType<typeof vec3>, field: WindField) => {
  const dir = toVec3(field.direction, vec3(1, 0, 0)).normalize()
  const strength = float(field.strength ?? 0.3)
  const base = dir.mul(strength)

  const variance = field.variance ?? 0
  if (variance <= 0) {
    force.addAssign(base)
    return
  }

  const frequency = float(field.frequency ?? 0.35)
  const jitter = hash(instanceIndex.add(time.mul(frequency))).sub(0.5).mul(float(variance))
  const gust = dir.mul(jitter)
  force.addAssign(base.add(gust))
}

const createBuffers = (count: number, integrator: IntegratorType): ParticleBuffers => {
  const position = storage(new StorageInstancedBufferAttribute(count, 3), 'vec3', count)
  const velocity = storage(new StorageInstancedBufferAttribute(count, 3), 'vec3', count)
  const previous = integrator === 'verlet' ? storage(new StorageInstancedBufferAttribute(count, 3), 'vec3', count) : null

  return { position, velocity, previous }
}

export function createParticleSimulation(config: ParticleSimConfig): ParticleSimulation {
  const count = Math.max(1, config.count | 0)
  const spawnRadius = config.spawnRadius ?? 1.0
  const spawnJitter = config.spawnJitter ?? 0.25
  const integrator: IntegratorType = config.integrator ?? 'verlet'
  const maxDelta = config.maxDelta ?? 0.033
  const fields = config.fields ?? []

  const buffers = createBuffers(count, integrator)
  const getAttribute = (node: StorageNode): StorageAttribute =>
    (node as unknown as { toAttribute: () => StorageAttribute }).toAttribute()

  const positionAttribute = getAttribute(buffers.position)
  const velocityAttribute = getAttribute(buffers.velocity)

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
    const direction = vec3(rx.mul(2).sub(1), ry.mul(2).sub(1), rz.mul(2).sub(1)).normalize().mul(uSpawnRadius)

    pos.assign(direction.add(jitter))
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
      if (field.type === 'flowField') applyFlowField(force, field, pos)
      if (field.type === 'wind') applyWind(force, field)
      if (field.type === 'morphTarget') {
        const targetElement = field.target.element(instanceIndex)
        const attraction = float(field.attraction ?? 4)
        force.addAssign(targetElement.sub(pos).mul(attraction))
        if (field.damping !== undefined) {
          const damping = float(field.damping).clamp(0, 1)
          vel.mulAssign(float(1).sub(damping))
        }
      }
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

    for (const field of fields) {
      if (field.type === 'boundingSphere') {
        const center = toVec3(field.center, vec3(0))
        const radius = float(field.radius ?? 5)
        const restitution = float(field.restitution ?? 0.6)
        const toCenter = pos.sub(center)
        const dist = length(toCenter)

        If(dist.greaterThan(radius), () => {
          const normal = normalize(toCenter)
          pos.assign(center.add(normal.mul(radius)))
          const vn = normal.mul(dot(vel, normal))
          const vt = vel.sub(vn)
          vel.assign(vt.sub(vn.mul(restitution)))
        })
      }
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
      const disposeNode = (node: StorageNode | null | undefined) => {
        if (!node) return
        const buffer = (node as unknown as { array?: { dispose?: () => void } }).array
        buffer?.dispose?.()
      }

      disposeNode(buffers.position)
      disposeNode(buffers.velocity)
      disposeNode(buffers.previous)
    },
  }
}

