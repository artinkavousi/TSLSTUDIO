import { describe, expect, it, vi } from 'vitest'

import type { ParticleSimulation } from '../particles/types'; 

import { createFlowFieldParticles } from '../particles/flowField'; 
import { createMorphTargetParticles } from '../particles/morphing'; 
import { createBoundingSphereParticles } from '../particles/bounds'; 
import { createSpriteParticleRenderer } from '../particles/renderer'; 
import { createWindParticles } from '../particles/wind'; 
import { createTurbulenceParticles } from '../particles/turbulence'; 

const createRenderer = () => ({
  compute: vi.fn(),
}) as unknown as Parameters<ParticleSimulation['init']>[0]

describe('particle systems', () => {
  it('creates flow field simulation', () => {
    const system = createFlowFieldParticles({ count: 128 })
    const renderer = createRenderer()
    system.init(renderer)
    system.update(renderer, 1 / 60)
    expect(renderer.compute).toHaveBeenCalled()
    system.setAmplitude(2)
    system.setFrequency(0.5)
    system.setTimeFactor(0.3)
  })

  it('creates morph target simulation and swaps target', () => {
    const positionsA = new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0])
    const positionsB = new Float32Array([0, 0, 1, 1, 0, 1, 0, 1, 1])
    const system = createMorphTargetParticles({ targets: [positionsA, positionsB], attraction: 3 })
    const renderer = createRenderer()
    system.init(renderer)
    system.update(renderer, 1 / 60)
    system.setTarget(1)
    system.setAttraction(4)
    system.setDamping(0.1)
    expect(renderer.compute).toHaveBeenCalled()
  })

  it('creates bounding sphere simulation and updates params', () => {
    const system = createBoundingSphereParticles({ count: 64, radius: 5 })
    const renderer = createRenderer()
    system.init(renderer)
    system.update(renderer, 1 / 60)
    system.setRadius(6)
    system.setCenter([1, 2, 3])
    system.setRestitution(0.8)
    expect(renderer.compute).toHaveBeenCalled()
    const spriteRenderer = createSpriteParticleRenderer(system)
    const meshCount = (spriteRenderer.mesh as any).count ?? (spriteRenderer.mesh as any).instanceCount
    expect(meshCount).toBe(system.count)
    spriteRenderer.dispose()
  })

  it('creates wind-driven particle simulation', () => {
    const system = createWindParticles({ count: 32, strength: 0.5 })
    const renderer = createRenderer()
    system.init(renderer)
    system.update(renderer, 1 / 30)
    system.setDirection([0, 1, 0])
    system.setStrength(1.2)
    system.setVariance(0.3)
    system.setFrequency(0.6)
    expect(renderer.compute).toHaveBeenCalled()
  })

  it('creates turbulence-driven particle simulation', () => {
    const system = createTurbulenceParticles({ count: 48, amplitude: 0.8 })
    const renderer = createRenderer()
    system.init(renderer)
    system.update(renderer, 1 / 120)
    system.setAmplitude(1.1)
    system.setDrag(0.05)
    expect(renderer.compute).toHaveBeenCalled()
  })
})

