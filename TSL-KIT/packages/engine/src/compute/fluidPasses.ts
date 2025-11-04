import type { FramePass, FramegraphExecutionContext, FramegraphSetupContext } from '../core/framegraph'; 

import type { FluidSimulationHandle } from './fluid'; 

export interface FluidSimulationPassOptions {
  simulation: FluidSimulationHandle
  resourcePrefix?: string
  autoStep?: boolean
  emitters?: boolean
}

const defaultOutputs = (prefix: string) => [
  `${prefix}.simulation`,
  `${prefix}.uniforms`,
  `${prefix}.velocity`,
  `${prefix}.smoke`,
  `${prefix}.temperature`,
  `${prefix}.pressure`,
]

export function createFluidSimulationPass(options: FluidSimulationPassOptions): FramePass {
  const { simulation } = options
  const prefix = options.resourcePrefix ?? 'fluid'
  const autoStep = options.autoStep !== false
  const outputs = defaultOutputs(prefix)

  const setCanvasSize = (context: FramegraphExecutionContext) => {
    const width = context.size.x
    const height = context.size.y

    simulation.updateUniforms({
      canvasX: width,
      canvasY: height,
      canvasiX: width,
      canvasiY: height,
    })
  }

  return {
    name: `${prefix}:simulation`,
    outputs,
    setup: ({ resources }: FramegraphSetupContext) => {
      resources.set(`${prefix}.simulation`, simulation)
      resources.set(`${prefix}.uniforms`, simulation.uniforms)
      resources.set(`${prefix}.velocity`, simulation.velocity)
      resources.set(`${prefix}.smoke`, simulation.smoke)
      resources.set(`${prefix}.temperature`, simulation.temperature)
      resources.set(`${prefix}.pressure`, simulation.pressure)
    },
    exec: (context: FramegraphExecutionContext) => {
      setCanvasSize(context)

      if (autoStep) {
        simulation.step(context.renderer as import('three/webgpu').WebGPURenderer, context.delta, {
          emitters: options.emitters !== false,
        })
      }

      return {
        [`${prefix}.simulation`]: simulation,
        [`${prefix}.uniforms`]: simulation.uniforms,
        [`${prefix}.velocity`]: simulation.velocity,
        [`${prefix}.smoke`]: simulation.smoke,
        [`${prefix}.temperature`]: simulation.temperature,
        [`${prefix}.pressure`]: simulation.pressure,
      }
    },
  }
}

