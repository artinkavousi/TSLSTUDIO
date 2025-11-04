import { describe, expect, it } from 'vitest'

import { FLUID_COMMON_SOURCE, PRESSURE_HELPER_SOURCE } from '../common.ts'
import { FluidSimulation } from '../FluidSimulation.ts'
import {
  advectShader,
  divergenceShader,
  gradientSubtractShader,
  jacobiShader,
  pressureSolveShader,
  rotatingSmokeEmitterShader,
} from '../operators/index.ts'
import { FLUID_UNIFORM_STRUCT } from '../uniform.ts'
import { ITERATION_UNIFORM_STRUCT } from '../iterationUniform.ts'

describe('fluid WGSL sources', () => {
  it('includes expected helper functions', () => {
    expect(FLUID_COMMON_SOURCE).toContain('computeCameraRay')
    expect(FLUID_COMMON_SOURCE).toContain('trilerp4')
    expect(PRESSURE_HELPER_SOURCE).toContain('to_index_dim')
  })

  it('exports uniform structs', () => {
    expect(FLUID_UNIFORM_STRUCT).toContain('struct U')
    expect(ITERATION_UNIFORM_STRUCT).toContain('struct Iter')
  })
})

describe('fluid shader builders', () => {
  const dimensions = { width: 4, height: 4, depth: 4 }
  const uniforms = {} as any
  const storage = {} as any

  it('exposes compute factory functions', () => {
    expect(typeof advectShader).toBe('function')
    expect(typeof divergenceShader).toBe('function')
    expect(typeof gradientSubtractShader).toBe('function')
    expect(typeof jacobiShader).toBe('function')
    expect(typeof pressureSolveShader).toBe('function')
    expect(typeof rotatingSmokeEmitterShader).toBe('function')
  })

  it('allows orchestrator construction without runtime dependencies', () => {
    const fluid = new FluidSimulation({
      dimensions,
      uniforms,
      iterationUniforms: storage,
      fields: {
        velocity: storage,
        smoke: storage,
        temperature: storage,
        pressure: storage,
        divergence: storage,
        vorticity: storage,
      },
    })

    expect(typeof fluid.advect).toBe('function')
    expect(typeof fluid.computeDivergence).toBe('function')
    expect(typeof fluid.solvePressure).toBe('function')
    expect(typeof fluid.applyVorticity).toBe('function')
    expect(typeof fluid.emitRotatingSmoke).toBe('function')
  })
})

