import { Fn, hash, instanceIndex, mix, uv, vec2, vec3, type ShaderNodeObject } from 'three/tsl'
import {
  InstancedMesh,
  PlaneGeometry,
  SpriteNodeMaterial,
  type Mesh,
  type NodeRepresentation,
} from 'three/webgpu'
import type { Texture } from 'three'

import type { ParticleSimulation } from './types'; 

export interface SpriteParticleRendererOptions {
  texture?: Texture
  color?: ShaderNodeObject<NodeRepresentation>
  size?: number
  minSize?: number
  maxSize?: number
}

export interface SpriteParticleRenderer {
  readonly mesh: Mesh
  readonly material: SpriteNodeMaterial
  dispose(): void
}

export function createSpriteParticleRenderer(
  simulation: ParticleSimulation,
  { texture, color, size = 0.4, minSize = 0.2, maxSize = 1.2 }: SpriteParticleRendererOptions = {},
): SpriteParticleRenderer {
  const geometry = new PlaneGeometry()
  const material = new SpriteNodeMaterial({ depthWrite: false, sizeAttenuation: true })

  if (texture) {
    material.map = texture
  }

  const positionNode = simulation.buffers.position.element(instanceIndex)
  material.positionNode = positionNode

  material.scaleNode = Fn(() => {
    const rand = hash(instanceIndex)
    const base = mix(minSize, maxSize, rand)
    return vec2(base * size, base * size)
  })()

  material.colorNode = color ?? vec3(hash(instanceIndex), hash(instanceIndex.add(1)), hash(instanceIndex.add(2)))

  material.opacityNode = Fn(() => {
    const distanceFade = positionNode.length().div(100).clamp(0, 1)
    return mix(1, 0.25, distanceFade)
  })()

  material.uvNode = uv().mul(vec2(1))

  const mesh = new InstancedMesh(geometry, material, simulation.count)
  mesh.frustumCulled = false
  mesh.instanceMatrix.setUsage(35048)

  return {
    mesh,
    material,
    dispose() {
      geometry.dispose()
      material.dispose()
    },
  }
}

