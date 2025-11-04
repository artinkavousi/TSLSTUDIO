import { describe, expect, it, vi } from 'vitest'
import { Camera, Scene, Vector2, WebGLRenderTarget } from 'three'

import { Framegraph } from '../../core/framegraph'; 
import { buildFXPipeline } from '../pipeline';

describe('fx pipeline', () => {
  it('registers passes onto the framegraph', () => {
    const renderer = new StubRenderer() as unknown as Parameters<typeof Framegraph>[0]
    const framegraph = new Framegraph(renderer, { profile: false })

    const noopEffect = vi.fn(({ color }) => color)

    const handle = buildFXPipeline(framegraph, [noopEffect], { taa: false })

    expect(handle.scenePass.name).toBe('scene')
    expect(handle.postPass.name).toBe('postprocessing')
  })

  it('injects preset effects into pipeline composition', () => {
    const renderer = new StubRenderer() as unknown as Parameters<typeof Framegraph>[0]
    const framegraph = new Framegraph(renderer, { profile: false })

    const handle = buildFXPipeline(framegraph, [], {
      taa: false,
      presets: { names: ['retro', 'noir'] },
    })

    expect(handle.scenePass.name).toBe('scene')
    expect(handle.postPass.name).toBe('postprocessing')
  })

  it('supports advanced depth of field', () => {
    const renderer = new StubRenderer() as unknown as Parameters<typeof Framegraph>[0]
    const framegraph = new Framegraph(renderer, { profile: false })

    const handle = buildFXPipeline(framegraph, [], {
      taa: false,
      depthOfField: { focusDistance: 2.0, focusRange: 0.8, maxBlur: 8 },
    })

    expect(handle.scenePass.name).toBe('scene')
    expect(handle.postPass.name).toBe('postprocessing')
  })

  it('supports color grading pipeline', () => {
    const renderer = new StubRenderer() as unknown as Parameters<typeof Framegraph>[0]
    const framegraph = new Framegraph(renderer, { profile: false })

    const handle = buildFXPipeline(framegraph, [], {
      taa: false,
      colorGrading: { exposure: 0.2, curves: { saturation: 1.1 } },
    })

    expect(handle.scenePass.name).toBe('scene')
    expect(handle.postPass.name).toBe('postprocessing')
  })

  it('passes TAA options through pipeline', () => {
    const renderer = new StubRenderer() as unknown as Parameters<typeof Framegraph>[0]
    const framegraph = new Framegraph(renderer, { profile: false })

    const handle = buildFXPipeline(framegraph, [], {
      taa: {
        sampleCount: 2,
        jitterSpread: 0.5,
        jitterOffset: { x: 0.1, y: -0.05 },
        customSequence: [
          [0.25, 0.75],
          [0.75, 0.25],
        ],
      },
    })

    expect(handle.scenePass.name).toBe('scene')
    expect(handle.taa?.currentTargetKey).toBeDefined()
  })

  it('accepts TAA preset strings', () => {
    const renderer = new StubRenderer() as unknown as Parameters<typeof Framegraph>[0]
    const framegraph = new Framegraph(renderer, { profile: false })

    const handle = buildFXPipeline(framegraph, [], { taa: 'medium' })

    expect(handle.taa?.currentTargetKey).toBeDefined()
  })
})

