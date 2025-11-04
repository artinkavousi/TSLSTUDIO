// @ts-nocheck
import {
  BufferGeometry,
  Float32BufferAttribute,
  PerspectiveCamera,
  Points,
  Scene,
  Color,
  Clock,
} from 'three'
import type { WebGPURenderer } from 'three/webgpu'
import { PointsNodeMaterial } from 'three/webgpu'
import { Fn, float, screenSize, uv, vec2, vec3, time, length, sin } from 'three/tsl'
import { Framegraph } from '../core/framegraph'
import { createFilmGrainEffect, createChromaticAberrationEffect, buildFXPipeline, createBloomEffect } from '../fx'
import { createParticleSimulation } from '../compute/particles'
import type { DemoSceneHandle } from './types'

export type ParticleDemoOptions = {
  count?: number
  bounds?: number
  curlFrequency?: number
  curlAmplitude?: number
  pointSize?: number
}

export async function createParticleDemoScene(
  renderer: WebGPURenderer,
  options: ParticleDemoOptions = {},
): Promise<DemoSceneHandle> {
  const scene = new Scene()
  scene.background = new Color('#06070a')

  const camera = new PerspectiveCamera(55, 1, 0.1, 100)
  camera.position.set(0, 0, 8)

  const framegraph = new Framegraph(renderer)

  const count = options.count ?? 256 * 256
  const bounds = options.bounds ?? 3.5

  const simulation = createParticleSimulation({
    count,
    spawnRadius: bounds * 0.5,
    spawnJitter: 0.35,
    integrator: 'verlet',
    fields: [
      { type: 'gravity', direction: [0, -0.15, 0], strength: 0.12 },
      { type: 'curlNoise', amplitude: 0.6, frequency: options.curlFrequency ?? 0.6, timeFactor: 0.2 },
      { type: 'turbulence', amplitude: 0.15, drag: 0.05 },
    ],
  })

  simulation.init(renderer)

  const geometry = new BufferGeometry()
  const positions = new Float32Array(simulation.count * 3)
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3))
  geometry.setDrawRange(0, simulation.count)

  const material = new PointsNodeMaterial({
    transparent: true,
    depthWrite: false,
  })

  material.positionNode = simulation.positionAttribute

  const pointSize = float(options.pointSize ?? 1.9)
  material.scaleNode = Fn(() => {
    const viewSize = screenSize.y
    return pointSize.mul(0.0018).mul(viewSize)
  })()

  material.colorNode = Fn(([position]) => {
    const d = length(vec3(position)).div(float(bounds)).clamp(0.0, 1.0)
    const hue = d.mul(0.75)
    const glow = vec3(
      hue.mul(0.8).add(0.15),
      hue.mul(0.5).add(0.35),
      float(1).sub(d.mul(0.6)),
    )
    const pulse = float(0.85).add(sin(time.mul(0.6)).mul(0.15))
    return glow.mul(pulse.clamp(0.65, 1.35))
  })(simulation.positionAttribute)

  material.opacityNode = Fn(() => {
    const vUv = uv().sub(0.5)
    const mask = float(1).sub(length(vUv).mul(2.2))
    return mask.clamp(0.0, 1.0)
  })()

  const points = new Points(geometry, material)
  scene.add(points)

  const effects = [
    createBloomEffect({ threshold: 0.75, strength: 1.2, radius: 1.1 }),
    createChromaticAberrationEffect({ offset: 0.0018, radialIntensity: 1.6 }),
    createFilmGrainEffect({ amount: 0.045, monochrome: false, timeFactor: 0.8 }),
  ]

  buildFXPipeline(framegraph, effects, {
    taa: {
      response: 0.88,
      clampDiff: 0.01,
      sampleCount: 16,
    },
    post: { name: 'particles-post' },
  })

  const clock = new Clock()

  return {
    scene,
    camera,
    framegraph,
    renderer,
    async render(deltaSeconds?: number) {
      const dt = deltaSeconds ?? clock.getDelta()
      simulation.update(renderer, dt)
      points.rotation.y += dt * 0.25
      points.rotation.x += dt * 0.1
      await framegraph.render(scene, camera, dt)
    },
    dispose() {
      framegraph.dispose()
      simulation.dispose()
      geometry.dispose()
      material.dispose()
      scene.clear()
    },
  }
}


