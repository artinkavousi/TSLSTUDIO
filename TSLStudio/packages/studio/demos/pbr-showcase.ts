// @ts-nocheck
import {
  AmbientLight,
  Color,
  DirectionalLight,
  Mesh,
  PerspectiveCamera,
  Scene,
  SphereGeometry,
  Clock,
} from 'three'
import type { WebGPURenderer } from 'three/webgpu'
import { Framegraph } from '@engine/core/framegraph'
import { createPBRStandard } from '@tsl/materials/pbr/standard'
import { createBloomEffect, createColorGradingEffect, createFilmGrainEffect, buildFXPipeline } from '@tsl/post'
import type { DemoSceneHandle } from './types'

export type PBRDemoOptions = {
  exposure?: number
  bloom?: { threshold?: number; strength?: number; radius?: number }
  colorGrading?: { exposure?: number; intensity?: number; gamma?: number }
  rotationSpeed?: number
}

export async function createPBRDemoScene(
  renderer: WebGPURenderer,
  options: PBRDemoOptions = {},
): Promise<DemoSceneHandle> {
  const scene = new Scene()
  scene.background = new Color('#0e1014')

  const camera = new PerspectiveCamera(45, 1, 0.1, 50)
  camera.position.set(4, 2.5, 6)
  camera.lookAt(0, 0.5, 0)

  const framegraph = new Framegraph(renderer)

  const pbr = createPBRStandard({
    baseColor: '#e9eef9',
    metalness: 0.25,
    roughness: 0.32,
    clearcoat: { strength: 0.9, roughness: 0.08 },
    sheen: { strength: 0.35, color: '#8baeff', roughness: 0.5 },
    transmission: { strength: 0.15, thickness: 0.4, attenuationColor: '#d0e5ff', attenuationDistance: 4 },
    anisotropy: { strength: 0.45, rotation: [1, 0.1, 0] },
  })

  const geometry = new SphereGeometry(1.25, 128, 64)
  const mesh = new Mesh(geometry, pbr.material)
  mesh.castShadow = true
  mesh.receiveShadow = true
  scene.add(mesh)

  const groundMaterial = createPBRStandard({ baseColor: '#141721', roughness: 0.85, metalness: 0.0 }).material
  const ground = new Mesh(new SphereGeometry(20, 64, 32), groundMaterial)
  ground.position.set(0, -20.75, 0)
  ground.scale.set(1, 0.05, 1)
  scene.add(ground)

  const fill = new AmbientLight('#5c6f9b', 0.35)
  scene.add(fill)

  const key = new DirectionalLight('#f1f5ff', 2.4)
  key.position.set(6, 8, 4)
  key.castShadow = true
  key.shadow.mapSize.set(2048, 2048)
  scene.add(key)

  const rim = new DirectionalLight('#88aaff', 1.1)
  rim.position.set(-5, 3, -6)
  scene.add(rim)

  const bloom = createBloomEffect({
    threshold: options.bloom?.threshold ?? 1.0,
    strength: options.bloom?.strength ?? 0.9,
    radius: options.bloom?.radius ?? 1.6,
  })

  const grading = createColorGradingEffect({
    exposure: options.colorGrading?.exposure ?? 0.25,
    intensity: options.colorGrading?.intensity ?? 0.85,
    gamma: options.colorGrading?.gamma ?? 1.0,
  })

  const grain = createFilmGrainEffect({ amount: 0.024, monochrome: true, timeFactor: 0.35 })

  buildFXPipeline(framegraph, [bloom, grading, grain], {
    taa: {
      response: 0.92,
      clampDiff: 0.004,
      sampleCount: 8,
    },
    post: { name: 'pbr-post' },
  })

  const clock = new Clock()
  const rotationSpeed = options.rotationSpeed ?? 0.35

  return {
    scene,
    camera,
    framegraph,
    renderer,
    async render(deltaSeconds?: number) {
      const dt = deltaSeconds ?? clock.getDelta()
      mesh.rotation.y += dt * rotationSpeed
      mesh.rotation.x += dt * rotationSpeed * 0.25
      await framegraph.render(scene, camera, dt)
    },
    dispose() {
      framegraph.dispose()
      geometry.dispose()
      mesh.material.dispose()
      ;(ground.geometry as SphereGeometry).dispose()
      ground.material.dispose()
      scene.clear()
    },
  }
}


