import { describe, expect, it, vi } from 'vitest'
import { Camera, Scene, Vector2, WebGLRenderTarget } from 'three'

import { createScenePass, Framegraph } from '../framegraph';

describe('Framegraph', () => {
  it('executes passes and exposes resources', async () => {
    const renderer = new StubRenderer() as unknown as Parameters<typeof createScenePass>[0]['renderer']
    const framegraph = new Framegraph(renderer, { profile: false })

    const scene = new Scene()
    const camera = new Camera()

    framegraph.addPass({
      name: 'populate',
      exec: () => ({ buffer: { value: 42 } }),
    })

    framegraph.addPass({
      name: 'check',
      inputs: ['buffer'],
      exec: (context) => {
        const buffer = context.resources.get('buffer') as { value: number } | undefined
        expect(buffer?.value).toBe(42)
      },
    })

    framegraph.addPass(createScenePass())

    await framegraph.render(scene, camera, 1 / 60)

    expect(renderer.render).toHaveBeenCalledWith(scene, camera)
  })
})

