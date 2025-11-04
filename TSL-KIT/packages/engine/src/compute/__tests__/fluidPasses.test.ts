import { describe, expect, it, vi } from 'vitest'

import { Framegraph } from '../../core/framegraph'; 
import type { FluidSimulationHandle } from '../fluid'; 
import { createFluidSimulationPass } from '../fluidPasses'; 

const createRenderer = () => ({
  compute: vi.fn(),
  getSize: (target: import('three').Vector2) => target.set(800, 600),
}) as any

describe('fluid passes', () => {
  it('registers simulation resources and steps automatically', async () => {
    const simulation: FluidSimulationHandle = {
      uniforms: { canvasX: 0, canvasY: 0, canvasiX: 0, canvasiY: 0 } as any,
      velocity: {} as any,
      smoke: {} as any,
      temperature: {} as any,
      pressure: {} as any,
      setScenario: vi.fn(),
      updateUniforms: vi.fn(),
      step: vi.fn(),
      dispose: vi.fn(),
    }

    const framegraph = new Framegraph(createRenderer(), { profile: false })
    framegraph.addPass(createFluidSimulationPass({ simulation, resourcePrefix: 'testFluid' }))

    // Execute once to ensure resources are populated.
    const mockCamera = {
      isPerspectiveCamera: true,
      setViewOffset: vi.fn(),
      clearViewOffset: vi.fn(),
      updateProjectionMatrix: vi.fn(),
    }

    await framegraph.render({ traverse: () => {} } as any, mockCamera as any, 1 / 60)

    expect(simulation.updateUniforms).toHaveBeenCalled()
    expect(simulation.step).toHaveBeenCalled()
    expect(framegraph.getResource('testFluid.simulation')).toBe(simulation)
    expect(framegraph.getResource('testFluid.uniforms')).toBe(simulation.uniforms)
    expect(framegraph.getResource('testFluid.smoke')).toBe(simulation.smoke)
    expect(framegraph.getResource('testFluid.temperature')).toBe(simulation.temperature)
  })
})

