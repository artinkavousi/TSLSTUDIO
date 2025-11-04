// @ts-nocheck
import { useEffect, useRef } from 'react'
<<<<<<< HEAD:TSLStudio/packages/studio/components/canvas/engine_demo_canvas.tsx
import type { DemoSceneHandle } from '@studio/demos'
import { core } from '@engine'
import * as demos from '@studio/demos'
=======
import type { DemoSceneHandle } from '@engine/scenes'
import { core, scenes } from '@engine'
>>>>>>> f4523c07f6932061c6b020b30ee72d3c55e3fcd3:TSLStudio/src/components/canvas/engine_demo_canvas.tsx

type DemoKey = 'pbr' | 'particles'

const sceneFactories: Record<DemoKey, (renderer: import('three/webgpu').WebGPURenderer) => Promise<DemoSceneHandle>> = {
<<<<<<< HEAD:TSLStudio/packages/studio/components/canvas/engine_demo_canvas.tsx
  pbr: demos.createPBRDemoScene,
  particles: demos.createParticleDemoScene,
=======
  pbr: scenes.createPBRDemoScene,
  particles: scenes.createParticleDemoScene,
>>>>>>> f4523c07f6932061c6b020b30ee72d3c55e3fcd3:TSLStudio/src/components/canvas/engine_demo_canvas.tsx
}

type EngineDemoCanvasProps = {
  demo: DemoKey
}

export function EngineDemoCanvas({ demo }: EngineDemoCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let disposed = false
    let frameId: number | null = null
    let sceneHandle: DemoSceneHandle | null = null
    let rendererHandle: Awaited<ReturnType<typeof core.createRenderer>> | null = null

    async function setup() {
      const container = containerRef.current
      if (!container) return

      const nextRenderer = await core.createRenderer({
        autoResize: { target: container },
      })

      rendererHandle = nextRenderer
      const canvas = nextRenderer.renderer.domElement
      canvas.style.width = '100%'
      canvas.style.height = '100%'
      canvas.style.display = 'block'
      container.appendChild(canvas)

      const factory = sceneFactories[demo]
      sceneHandle = await factory(nextRenderer.renderer)

      const renderLoop = () => {
        if (disposed) return
        try {
          const result = sceneHandle?.render()
          if (result && typeof (result as Promise<void>).then === 'function') {
            ;(result as Promise<void>).catch((error) => console.error('[engine-demo] render error', error))
          }
        } catch (error) {
          console.error('[engine-demo] render error', error)
        }
        frameId = requestAnimationFrame(renderLoop)
      }

      frameId = requestAnimationFrame(renderLoop)
    }

    setup()

    return () => {
      disposed = true
      if (frameId !== null) cancelAnimationFrame(frameId)
      if (sceneHandle) {
        try {
          sceneHandle.dispose()
        } catch (error) {
          console.warn('[engine-demo] dispose scene error', error)
        }
      }
      if (rendererHandle) {
        try {
          rendererHandle.dispose()
        } catch (error) {
          console.warn('[engine-demo] dispose renderer error', error)
        }
      }
      const container = containerRef.current
      if (container && rendererHandle) {
        const canvas = rendererHandle.renderer.domElement
        if (canvas.parentElement === container) {
          container.removeChild(canvas)
        }
      }
    }
  }, [demo])

  return <div ref={containerRef} className='engine-demo-canvas' />
}



