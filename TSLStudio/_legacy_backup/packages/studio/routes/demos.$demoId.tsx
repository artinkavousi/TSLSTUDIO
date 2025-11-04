import { createFileRoute, notFound } from '@tanstack/react-router'
import { Suspense } from 'react'
import { EngineDemoCanvas } from '@studio/components/canvas/engine_demo_canvas'
import { SketchesDropdown } from '@studio/components/sketches_dropdown'

const DEMOS = {
  pbr: {
    title: 'PBR Showcase',
    description:
      'MeshPhysicalNodeMaterial with layered clearcoat, sheen, anisotropy, and thin-film transmission rendered through the bloom + grading stack.',
  },
  particles: {
    title: 'GPU Particle Flow',
    description:
      'Verlet-integrated particle field driven by curl noise, turbulence and gravity, composited with chromatic bloom.',
  },
} satisfies Record<string, { title: string; description: string }>

type DemoKey = keyof typeof DEMOS

export const Route = createFileRoute('/demos/$demoId')({
  component: DemoRoute,
  loader: ({ params }) => {
    if (!(params.demoId in DEMOS)) {
      throw notFound()
    }
    return params.demoId as DemoKey
  },
})

function DemoRoute() {
  const { demoId } = Route.useParams()
  const demoKey = demoId as DemoKey
  const demo = DEMOS[demoKey]

  return (
    <section className='fragments-boilerplate__main__canvas engine-demo-wrapper'>
      <Suspense fallback={null}>
        <EngineDemoCanvas demo={demoKey} />
      </Suspense>

      <SketchesDropdown />

      <div className='engine-demo-overlay'>
        <div className='engine-demo-chip'>Engine Demo</div>
        <h1>{demo.title}</h1>
        <p>{demo.description}</p>
        <div className='engine-demo-meta'>Use the Sketches menu to jump between sketches and engine demos.</div>
      </div>
    </section>
  )
}

