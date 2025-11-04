import { storage } from 'three/tsl'
import { StorageInstancedBufferAttribute, type WebGPURenderer } from 'three/webgpu'

import type { GridDimensions } from '@tslstudio/tsl/index'; 
import type { FluidUniforms } from '@tslstudio/tsl/compute/simulation/fluid/types'; 
import {
  advectShader,
  divergenceShader,
  gradientSubtractShader,
  jacobiShader,
  vorticityConfinementShader,
  vorticityMagnitudeShader,
  rotatingSmokeEmitterShader,
  rotatingFireEmitterShader,
  fiveSpheresEmitterShader,
  vortexEmitterShader,
} from 

type StorageNode = ReturnType<typeof storage>

interface StorageFieldConfig {
  total: number
  itemSize: number
  type: 'float' | 'vec4'
}

class DoubleStorageField {
  private readonly attributes: StorageInstancedBufferAttribute[]
  private readonly nodes: StorageNode[]
  private index = 0

  constructor({ total, itemSize, type }: StorageFieldConfig) {
    this.attributes = [new StorageInstancedBufferAttribute(total, itemSize), new StorageInstancedBufferAttribute(total, itemSize)]
    this.nodes = this.attributes.map((attribute) => storage(attribute, type, total))
  }

  get read(): StorageNode {
    return this.nodes[this.index]
  }

  get write(): StorageNode {
    return this.nodes[1 - this.index]
  }

  swap(): void {
    this.index = 1 - this.index
  }

  dispose(): void {
    // Storage attributes currently do not expose explicit disposal hooks.
    // Kept for API symmetry and future cleanup needs.
  }
}

class SingleStorageField {
  private readonly attribute: StorageInstancedBufferAttribute
  private readonly node: StorageNode

  constructor({ total, itemSize, type }: StorageFieldConfig) {
    this.attribute = new StorageInstancedBufferAttribute(total, itemSize)
    this.node = storage(this.attribute, type, total)
  }

  get read(): StorageNode {
    return this.node
  }

  dispose(): void {
    // Placeholder for symmetry. No-op until three.js exposes disposal.
  }
}

export type FluidScenario = 'smoke' | 'fire' | 'spheres' | 'vortex' | 'none'

export interface FluidSimulationConfig {
  dimensions: GridDimensions
  scenario?: FluidScenario
  pressureIterations?: number
  enableVorticity?: boolean
}

export interface FluidStepOptions {
  emitters?: boolean
}

export interface FluidSimulationHandle {
  readonly uniforms: FluidUniforms
  readonly velocity: StorageNode
  readonly smoke: StorageNode
  readonly temperature: StorageNode
  readonly pressure: StorageNode
  setScenario(scenario: FluidScenario): void
  updateUniforms(partial: Partial<FluidUniforms>): void
  step(renderer: WebGPURenderer, deltaSeconds: number, options?: FluidStepOptions): void
  dispose(): void
}

const DEFAULT_SCENARIO: FluidScenario = 'smoke'
const DEFAULT_ITERATIONS = 16

function createUniforms(dimensions: GridDimensions): FluidUniforms {
  const { width, height, depth } = dimensions
  const gridScale = Math.max(width, height, depth)
  const rdx = gridScale * 4
  const dx = 1 / rdx

  return {
    x: width,
    y: height,
    z: depth,
    ux: width,
    uy: height,
    uz: depth,
    dx,
    rdx,
    pressureDecay: 1.5,
    vorticity: 1.0,
    dt: 0.016,
    t: 0,
    mouseStartX: 0,
    mouseStartY: 0,
    mouseEndX: 0,
    mouseEndY: 0,
    brushSmokeAmount: 0,
    brushFuelAmount: 0,
    smokeDecay: 0.5,
    temperatureDecay: 1.0,
    ignitionTemperature: 400,
    burnRate: 0.8,
    burnHeatEmit: 20000,
    burnSmokeEmit: 1,
    smokeR: 0.3,
    smokeG: 0.3,
    smokeB: 0.3,
    boyancy: 0.5,
    brushVelocityAmount: 2.0,
    brushSize: 0.15,
    velocityDecay: 0.015,
    canvasX: width,
    canvasY: height,
    canvasiX: width,
    canvasiY: height,
    camPosX: 0,
    camPosY: 0,
    camPosZ: 2.5,
    stepLength: 0.01,
    enclosed: 1,
    emitterR: 1,
    emitterG: 0.65,
    emitterB: 0.35,
    blackbodyBrightness: 1,
    brushTemperatureAmount: 1,
    orthoBlend: 0,
    glowRadius: 12,
    glowStrength: 0.2,
    glowGamma: 1.75,
  }
}

export function createFluidSimulation(config: FluidSimulationConfig): FluidSimulationHandle {
  const { dimensions } = config
  const scenario: { current: FluidScenario } = { current: config.scenario ?? DEFAULT_SCENARIO }
  const iterations = config.pressureIterations ?? DEFAULT_ITERATIONS
  const enableVorticity = config.enableVorticity ?? true

  const totalCells = dimensions.width * dimensions.height * dimensions.depth

  const velocityField = new DoubleStorageField({ total: totalCells, itemSize: 4, type: 'vec4' })
  const smokeField = new DoubleStorageField({ total: totalCells, itemSize: 4, type: 'vec4' })
  const temperatureField = new DoubleStorageField({ total: totalCells, itemSize: 1, type: 'float' })
  const pressureField = new DoubleStorageField({ total: totalCells, itemSize: 1, type: 'float' })
  const divergenceField = new SingleStorageField({ total: totalCells, itemSize: 1, type: 'float' })
  const vorticityField = new SingleStorageField({ total: totalCells, itemSize: 1, type: 'float' })

  const uniforms = createUniforms(dimensions)

  const ensurePositiveDelta = (delta: number) => Math.max(0.0001, Math.min(delta, 0.1))

  const runEmitter = (renderer: WebGPURenderer) => {
    switch (scenario.current) {
      case 'smoke': {
        renderer.compute(
          rotatingSmokeEmitterShader({
            dimensions,
            velocity: velocityField.read,
            smoke: smokeField.read,
            config: uniforms,
          })(),
        )
        break
      }
      case 'fire': {
        renderer.compute(
          rotatingFireEmitterShader({
            dimensions,
            velocity: velocityField.read,
            temperature: temperatureField.read,
            config: uniforms,
          })(),
        )
        break
      }
      case 'spheres': {
        renderer.compute(
          fiveSpheresEmitterShader({
            dimensions,
            velocity: velocityField.read,
            smoke: smokeField.read,
            temperature: temperatureField.read,
            config: uniforms,
          })(),
        )
        break
      }
      case 'vortex': {
        renderer.compute(
          vortexEmitterShader({
            dimensions,
            velocity: velocityField.read,
            smoke: smokeField.read,
            temperature: temperatureField.read,
            config: uniforms,
          })(),
        )
        break
      }
      case 'none':
      default:
        break
    }
  }

  const step = (renderer: WebGPURenderer, deltaSeconds: number, options?: FluidStepOptions) => {
    const dt = ensurePositiveDelta(deltaSeconds)
    uniforms.dt = dt
    uniforms.t += dt

    if (options?.emitters !== false) {
      runEmitter(renderer)
    }

    renderer.compute(
      advectShader({
        dimensions,
        velocityIn: velocityField.read,
        smokeIn: smokeField.read,
        temperatureIn: temperatureField.read,
        velocityOut: velocityField.write,
        smokeOut: smokeField.write,
        temperatureOut: temperatureField.write,
        pressure: pressureField.read,
        config: uniforms,
      })(),
    )

    velocityField.swap()
    smokeField.swap()
    temperatureField.swap()

    renderer.compute(
      divergenceShader({
        dimensions,
        velocity: velocityField.read,
        divergence: divergenceField.read,
        config: uniforms,
      })(),
    )

    for (let i = 0; i < iterations; i += 1) {
      renderer.compute(
        jacobiShader({
          dimensions,
          pressureIn: pressureField.read,
          divergence: divergenceField.read,
          pressureOut: pressureField.write,
          config: uniforms,
        })(),
      )
      pressureField.swap()
    }

    renderer.compute(
      gradientSubtractShader({
        dimensions,
        pressure: pressureField.read,
        velocity: velocityField.read,
        config: uniforms,
      })(),
    )

    if (enableVorticity) {
      renderer.compute(
        vorticityMagnitudeShader({
          dimensions,
          velocity: velocityField.read,
          vorticity: vorticityField.read,
          config: uniforms,
        })(),
      )

      renderer.compute(
        vorticityConfinementShader({
          dimensions,
          velocity: velocityField.read,
          vorticity: vorticityField.read,
          config: uniforms,
        })(),
      )
    }
  }

  return {
    uniforms,
    get velocity() {
      return velocityField.read
    },
    get smoke() {
      return smokeField.read
    },
    get temperature() {
      return temperatureField.read
    },
    get pressure() {
      return pressureField.read
    },
    setScenario(next: FluidScenario) {
      scenario.current = next
    },
    updateUniforms(partial: Partial<FluidUniforms>) {
      Object.assign(uniforms, partial)
    },
    step,
    dispose() {
      velocityField.dispose()
      smokeField.dispose()
      temperatureField.dispose()
      pressureField.dispose()
      divergenceField.dispose()
      vorticityField.dispose()
    },
  }
}

