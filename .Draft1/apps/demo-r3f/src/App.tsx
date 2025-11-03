import { Suspense } from 'react'
import { Leva, useControls } from 'leva'
import WebGPUScene from '@aurora/tsl-kit/components/canvas/webgpu_scene'
import { WebGPUSketch } from '@aurora/tsl-kit'
import {
  noiseGradientSketch,
  sdfShapesSketch,
  fbmTerrainSketch,
  curlFlowSketch,
  postEffectsDemoSketch,
  complexMathSketch,
} from './sketches'

const sketches = {
  'Noise Gradient': noiseGradientSketch,
  'SDF Shapes': sdfShapesSketch,
  'FBM Terrain': fbmTerrainSketch,
  'Curl Flow': curlFlowSketch,
  'Post Effects': postEffectsDemoSketch,
  'Complex Math': complexMathSketch,
}

export default function App() {
  const controls = useControls('Scene', {
    sketch: {
      value: 'Noise Gradient',
      options: Object.keys(sketches),
    },
    debug: { value: true },
  })

  const selectedSketch = sketches[controls.sketch as keyof typeof sketches]

  return (
    <>
      <Leva collapsed={false} />
      <WebGPUScene debug={controls.debug}>
        <color attach="background" args={[0x000000]} />
        <Suspense fallback={null}>
          <WebGPUSketch key={controls.sketch} colorNode={selectedSketch} />
        </Suspense>
      </WebGPUScene>
    </>
  )
}
