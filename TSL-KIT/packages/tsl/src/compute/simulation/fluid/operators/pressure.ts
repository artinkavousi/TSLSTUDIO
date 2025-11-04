import { ComputeShader, Fn, ShaderNode, ShaderNodeUniform } from 'three/tsl'

import type { GridDimensions } from '../../../../index'; 
import type { FluidUniforms } from '../types'; 
import type { PressureIterationUniform } from '../iterationUniform'; 
import { FLUID_COMMON_SOURCE, PRESSURE_HELPER_SOURCE } from '../common'; 
import { FLUID_UNIFORM_STRUCT } from '../uniform'; 
import { ITERATION_UNIFORM_STRUCT } from 

interface JacobiParams {
  dimensions: GridDimensions
  pressureIn: ShaderNode
  divergence: ShaderNode
  pressureOut: ShaderNode
  config: FluidUniforms
}

export const jacobiShader = ({ dimensions, pressureIn, divergence, pressureOut, config }: JacobiParams) =>
  Fn(() => {
    const shader = new ComputeShader('fluidJacobi')
    shader.workgroupSize = [4, 4, 4]

    shader.setBindings([
      ShaderNodeUniform(config),
      { resource: 'storage', node: pressureIn },
      { resource: 'storage', node: divergence },
      { resource: 'storage', node: pressureOut },
    ])

    shader.source = /* wgsl */ `
${FLUID_UNIFORM_STRUCT}
${FLUID_COMMON_SOURCE}

@group(0) @binding(0) var<uniform> u : U;
@group(0) @binding(1) var<storage, read> pressure_in : array<f32>;
@group(0) @binding(2) var<storage, read> divergence : array<f32>;
@group(0) @binding(3) var<storage, read_write> pressure_out : array<f32>;

@compute @workgroup_size(4,4,4)
fn main(@builtin(global_invocation_id) global_id : vec3<u32>) {
    let index = to_index(global_id);
    let base = vec3i(global_id);
    let le = pressure_in[clamp_to_edge(base - vec3(1,0,0))];
    let ri = pressure_in[clamp_to_edge(base + vec3(1,0,0))];
    let fr = pressure_in[clamp_to_edge(base - vec3(0,1,0))];
    let ba = pressure_in[clamp_to_edge(base + vec3(0,1,0))];
    let to = pressure_in[clamp_to_edge(base - vec3(0,0,1))];
    let bo = pressure_in[clamp_to_edge(base + vec3(0,0,1))];
    let alpha = -(u.dx * u.dx);
    const rBeta = 1. / 6.0;
    pressure_out[index] = (le + ri + fr + ba + to + bo + alpha * divergence[index]) * rBeta;
}
    `

    shader.dispatch(dimensions.width, dimensions.height, dimensions.depth)
    shader.compile()

    return shader
  })

interface JacobiRedBlackParams {
  dimensions: GridDimensions
  pressure: ShaderNode
  divergence: ShaderNode
  iteration: ShaderNode
  config: FluidUniforms
}

export const jacobiRedBlackShader = ({ dimensions, pressure, divergence, iteration, config }: JacobiRedBlackParams) =>
  Fn(() => {
    const shader = new ComputeShader('fluidJacobiRedBlack')
    shader.workgroupSize = [4, 4, 4]

    shader.setBindings([
      ShaderNodeUniform(config),
      { resource: 'storage', node: pressure },
      { resource: 'storage', node: divergence },
      iteration,
    ])

    shader.source = /* wgsl */ `
${ITERATION_UNIFORM_STRUCT}
${FLUID_UNIFORM_STRUCT}
${FLUID_COMMON_SOURCE}

@group(0) @binding(0) var<uniform> u : U;
@group(0) @binding(1) var<storage, read_write> pressure : array<f32>;
@group(0) @binding(2) var<storage, read> divergence : array<f32>;
@group(0) @binding(3) var<uniform> iter : Iter;

@compute @workgroup_size(4,4,4)
fn main(@builtin(global_invocation_id) global_id : vec3<u32>) {
    let offset = (global_id.x + global_id.y + global_id.z + iter.i) % 2u;
    let global_id_w_offset = vec3(global_id.x, global_id.y, global_id.z * 2u + offset);
    let index = to_index(global_id_w_offset);
    let base = vec3i(global_id_w_offset);
    let le = pressure[clamp_to_edge(base - vec3(1,0,0))];
    let ri = pressure[clamp_to_edge(base + vec3(1,0,0))];
    let fr = pressure[clamp_to_edge(base - vec3(0,1,0))];
    let ba = pressure[clamp_to_edge(base + vec3(0,1,0))];
    let to = pressure[clamp_to_edge(base - vec3(0,0,1))];
    let bo = pressure[clamp_to_edge(base + vec3(0,0,1))];
    let alpha = -(u.dx * u.dx);
    const rBeta = 1. / 6.0;
    pressure[index] = (le + ri + fr + ba + to + bo + alpha * divergence[index]) * rBeta;
}
    `

    shader.dispatch(dimensions.width, dimensions.height, dimensions.depth)
    shader.compile()

    return shader
  })

interface PressureBufferParams {
  dimensions: GridDimensions
  buffer: ShaderNode
  iteration: ShaderNode
}

export const restrictShader = ({ dimensions, buffer, iteration }: PressureBufferParams) =>
  Fn(() => {
    const shader = new ComputeShader('fluidRestrict')
    shader.workgroupSize = [4, 4, 4]

    shader.setBindings([
      { resource: 'storage', node: buffer },
      iteration,
    ])

    shader.source = /* wgsl */ `
${ITERATION_UNIFORM_STRUCT}
${PRESSURE_HELPER_SOURCE}

@group(0) @binding(0) var<storage, read_write> buffer : array<f32>;
@group(0) @binding(1) var<uniform> iter : Iter;

@compute @workgroup_size(4,4,4)
fn main(@builtin(global_invocation_id) global_id : vec3<u32>) {
    let base = global_id * 2u;
    buffer[iter.offsetNext + to_index_dim(global_id, iter.next)] = 0.125 * (
        buffer[iter.offsetCurrent + to_index_dim(base, iter.current)] +
        buffer[iter.offsetCurrent + to_index_dim(base + vec3u(1,0,0), iter.current)] +
        buffer[iter.offsetCurrent + to_index_dim(base + vec3u(0,1,0), iter.current)] +
        buffer[iter.offsetCurrent + to_index_dim(base + vec3u(1,1,0), iter.current)] +
        buffer[iter.offsetCurrent + to_index_dim(base + vec3u(0,0,1), iter.current)] +
        buffer[iter.offsetCurrent + to_index_dim(base + vec3u(1,0,1), iter.current)] +
        buffer[iter.offsetCurrent + to_index_dim(base + vec3u(0,1,1), iter.current)] +
        buffer[iter.offsetCurrent + to_index_dim(base + vec3u(1,1,1), iter.current)]
    );
}
    `

    shader.dispatch(dimensions.width, dimensions.height, dimensions.depth)
    shader.compile()

    return shader
  })

export const relaxShader = ({ dimensions, buffer, iteration }: PressureBufferParams) =>
  Fn(() => {
    const shader = new ComputeShader('fluidRelax')
    shader.workgroupSize = [4, 4, 4]

    shader.setBindings([
      { resource: 'storage', node: buffer },
      iteration,
    ])

    shader.source = /* wgsl */ `
${ITERATION_UNIFORM_STRUCT}
${PRESSURE_HELPER_SOURCE}

@group(0) @binding(0) var<storage, read_write> buffer : array<f32>;
@group(0) @binding(1) var<uniform> iter : Iter;

@compute @workgroup_size(4,4,4)
fn main(@builtin(global_invocation_id) global_id : vec3<u32>) {
    let base = global_id * 2u;
    let coarse = buffer[iter.offsetNext + to_index_dim(global_id, iter.next)];
    buffer[iter.offsetCurrent + to_index_dim(base, iter.current)] = coarse;
    buffer[iter.offsetCurrent + to_index_dim(base + vec3u(1,0,0), iter.current)] = coarse;
    buffer[iter.offsetCurrent + to_index_dim(base + vec3u(0,1,0), iter.current)] = coarse;
    buffer[iter.offsetCurrent + to_index_dim(base + vec3u(1,1,0), iter.current)] = coarse;
    buffer[iter.offsetCurrent + to_index_dim(base + vec3u(0,0,1), iter.current)] = coarse;
    buffer[iter.offsetCurrent + to_index_dim(base + vec3u(1,0,1), iter.current)] = coarse;
    buffer[iter.offsetCurrent + to_index_dim(base + vec3u(0,1,1), iter.current)] = coarse;
    buffer[iter.offsetCurrent + to_index_dim(base + vec3u(1,1,1), iter.current)] = coarse;
}
    `

    shader.dispatch(dimensions.width, dimensions.height, dimensions.depth)
    shader.compile()

    return shader
  })

interface PressureSolveParams {
  dimensions: GridDimensions
  pressure: ShaderNode
  divergence: ShaderNode
  iteration: ShaderNode
  workgroupSize?: [number, number, number]
}

export const pressureSolveShader = ({ dimensions, pressure, divergence, iteration, workgroupSize = [4, 4, 4] }: PressureSolveParams) =>
  Fn(() => {
    const shader = new ComputeShader('fluidPressureSolve')
    shader.workgroupSize = workgroupSize

    shader.setBindings([
      { resource: 'storage', node: pressure },
      { resource: 'storage', node: divergence },
      iteration,
    ])

    shader.source = /* wgsl */ `
${ITERATION_UNIFORM_STRUCT}
${PRESSURE_HELPER_SOURCE}

@group(0) @binding(0) var<storage, read_write> pressure : array<f32>;
@group(0) @binding(1) var<storage, read> divergence : array<f32>;
@group(0) @binding(2) var<uniform> iter : Iter;

@compute @workgroup_size(4,4,4)
fn main(@builtin(global_invocation_id) global_id : vec3<u32>) {
    let offset = (global_id.x + global_id.y + global_id.z + iter.i) % 2u;
    let global_id_w_offset = vec3(global_id.x, global_id.y, global_id.z * 2u + offset);
    let index = iter.offsetCurrent + to_index_dim(global_id_w_offset, iter.current);
    let base = vec3i(global_id_w_offset);
    let le = pressure[iter.offsetCurrent + clamp_to_edge_dim(base - vec3(1,0,0), iter.current)];
    let ri = pressure[iter.offsetCurrent + clamp_to_edge_dim(base + vec3(1,0,0), iter.current)];
    let fr = pressure[iter.offsetCurrent + clamp_to_edge_dim(base - vec3(0,1,0), iter.current)];
    let ba = pressure[iter.offsetCurrent + clamp_to_edge_dim(base + vec3(0,1,0), iter.current)];
    let to = pressure[iter.offsetCurrent + clamp_to_edge_dim(base - vec3(0,0,1), iter.current)];
    let bo = pressure[iter.offsetCurrent + clamp_to_edge_dim(base + vec3(0,0,1), iter.current)];
    let alpha = -(iter.dx * iter.dx);
    const rBeta = 1. / 6.0;
    pressure[index] = (le + ri + fr + ba + to + bo + alpha * divergence[index]) * rBeta;
}
    `

    shader.dispatch(dimensions.width, dimensions.height, dimensions.depth)
    shader.compile()

    return shader
  })
export const pressureSolveShaderDim442 = (params: PressureSolveParams) => pressureSolveShader({ ...params, workgroupSize: [4, 4, 2] })

