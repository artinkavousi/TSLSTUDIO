import { ShaderNode, ShaderNodeObject } from 'three/tsl'
import { ComputeShaderPass } from 'three/webgpu'

import type { GridDimensions } from '../../../index'; 
import type { FluidUniforms } from './types'; 
import type { PressureIterationUniform } from './iterationUniform'; 
import {
  advectShader,
  divergenceShader,
  gradientSubtractShader,
  jacobiShader,
  jacobiRedBlackShader,
  restrictShader,
  relaxShader,
  pressureSolveShader,
  pressureSolveShaderDim442,
  rotatingSmokeEmitterShader,
  rotatingFireEmitterShader,
  fiveSpheresEmitterShader,
  vortexEmitterShader,
  updateMouseShader,
  vorticityConfinementShader,
  vorticityMagnitudeShader,
} from 

interface FluidFieldNodes {
  velocity: ShaderNodeObject
  smoke: ShaderNodeObject
  temperature: ShaderNodeObject
  pressure: ShaderNodeObject
  divergence: ShaderNodeObject
  vorticity: ShaderNodeObject
}

interface FluidSimulationOptions {
  dimensions: GridDimensions
  uniforms: FluidUniforms | ShaderNodeObject
  iterationUniforms?: PressureIterationUniform | ShaderNodeObject
  fields: FluidFieldNodes
  iterations?: number
  jacobiIterations?: number
}

export class FluidSimulation {
  private readonly dimensions: GridDimensions
  private readonly uniforms: FluidUniforms | ShaderNodeObject
  private readonly iterationUniforms?: PressureIterationUniform | ShaderNodeObject
  private readonly fields: FluidFieldNodes
  private readonly jacobiIterations: number

  constructor(options: FluidSimulationOptions) {
    this.dimensions = options.dimensions
    this.uniforms = options.uniforms
    this.iterationUniforms = options.iterationUniforms
    this.fields = options.fields
    this.jacobiIterations = options.jacobiIterations ?? 20
  }

  emitRotatingSmoke(): ComputeShaderPass {
    return rotatingSmokeEmitterShader({
      dimensions: this.dimensions,
      velocity: this.fields.velocity,
      smoke: this.fields.smoke,
      config: this.uniforms,
    })()
  }

  emitRotatingFire(): ComputeShaderPass {
    return rotatingFireEmitterShader({
      dimensions: this.dimensions,
      velocity: this.fields.velocity,
      temperature: this.fields.temperature,
      config: this.uniforms,
    })()
  }

  emitFiveSpheres(): ComputeShaderPass {
    return fiveSpheresEmitterShader({
      dimensions: this.dimensions,
      velocity: this.fields.velocity,
      smoke: this.fields.smoke,
      temperature: this.fields.temperature,
      config: this.uniforms,
    })()
  }

  emitVortex(): ComputeShaderPass {
    return vortexEmitterShader({
      dimensions: this.dimensions,
      velocity: this.fields.velocity,
      smoke: this.fields.smoke,
      temperature: this.fields.temperature,
      config: this.uniforms,
    })()
  }

  updateFromMouse(): ComputeShaderPass {
    return updateMouseShader({
      dimensions: this.dimensions,
      velocity: this.fields.velocity,
      smoke: this.fields.smoke,
      temperature: this.fields.temperature,
      config: this.uniforms,
    })()
  }

  advect(): ComputeShaderPass {
    return advectShader({
      dimensions: this.dimensions,
      velocityIn: this.fields.velocity,
      smokeIn: this.fields.smoke,
      temperatureIn: this.fields.temperature,
      velocityOut: this.fields.velocity,
      smokeOut: this.fields.smoke,
      temperatureOut: this.fields.temperature,
      pressure: this.fields.pressure,
      config: this.uniforms,
    })()
  }

  computeDivergence(): ComputeShaderPass {
    return divergenceShader({
      dimensions: this.dimensions,
      velocity: this.fields.velocity,
      divergence: this.fields.divergence,
      config: this.uniforms,
    })()
  }

  solvePressure(): ComputeShaderPass[] {
    const passes: ComputeShaderPass[] = []

    if (!this.iterationUniforms) throw new Error('Iteration uniforms required for pressure solve')

    passes.push(jacobiShader({
      dimensions: this.dimensions,
      pressureIn: this.fields.pressure,
      divergence: this.fields.divergence,
      pressureOut: this.fields.pressure,
      config: this.uniforms,
    })())

    passes.push(jacobiRedBlackShader({
      dimensions: this.dimensions,
      pressure: this.fields.pressure,
      divergence: this.fields.divergence,
      iteration: this.iterationUniforms,
      config: this.uniforms,
    })())

    passes.push(restrictShader({ dimensions: this.dimensions, buffer: this.fields.pressure, iteration: this.iterationUniforms })())
    passes.push(relaxShader({ dimensions: this.dimensions, buffer: this.fields.pressure, iteration: this.iterationUniforms })())

    passes.push(
      pressureSolveShader({
        dimensions: this.dimensions,
        pressure: this.fields.pressure,
        divergence: this.fields.divergence,
        iteration: this.iterationUniforms,
      })(),
    )

    passes.push(
      pressureSolveShaderDim442({
        dimensions: this.dimensions,
        pressure: this.fields.pressure,
        divergence: this.fields.divergence,
        iteration: this.iterationUniforms,
      })(),
    )

    return passes
  }

  subtractGradient(): ComputeShaderPass {
    return gradientSubtractShader({
      dimensions: this.dimensions,
      pressure: this.fields.pressure,
      velocity: this.fields.velocity,
      config: this.uniforms,
    })()
  }

  applyVorticity(): ComputeShaderPass[] {
    return [
      vorticityMagnitudeShader({
        dimensions: this.dimensions,
        velocity: this.fields.velocity,
        vorticity: this.fields.vorticity,
        config: this.uniforms,
      })(),
      vorticityConfinementShader({
        dimensions: this.dimensions,
        velocity: this.fields.velocity,
        vorticity: this.fields.vorticity,
        config: this.uniforms,
      })(),
    ]
  }
}

