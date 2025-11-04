import { describe, expect, it, vi } from 'vitest'

import { createFluidSimulation } from '../fluid'; 

const createRenderer = () => ({
  compute: vi.fn(),
}) as any

describe('fluid simulation', () => {
  it('runs compute pipeline and swaps scenarios', () => {
    const sim = createFluidSimulation({ dimensions: { width: 8, height: 8, depth: 8 } })
    const renderer = createRenderer()

    sim.step(renderer, 1 / 60)
    expect(renderer.compute).toHaveBeenCalled()

    renderer.compute.mockClear()
    sim.setScenario('fire')
    sim.step(renderer, 1 / 120)
    expect(renderer.compute).toHaveBeenCalled()

    sim.dispose()
  })
})

