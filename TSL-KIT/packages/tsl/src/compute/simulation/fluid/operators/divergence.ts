import { ComputeShader, Fn, ShaderNode, ShaderNodeUniform } from 'three/tsl'

import type { GridDimensions } from '../../../../index'; 
import type { FluidUniforms } from '../types'; 
import { FLUID_COMMON_SOURCE } from '../common'; 
import { FLUID_UNIFORM_STRUCT } from 

interface DivergenceParams {
  dimensions: GridDimensions
  velocity: ShaderNode
  divergence: ShaderNode
  config: FluidUniforms
}

export const divergenceShader = ({ dimensions, velocity, divergence, config }: DivergenceParams) =>
  Fn(() => {
    const shader = new ComputeShader('fluidDivergence')
    shader.workgroupSize = [4, 4, 4]

    shader.setBindings([
      ShaderNodeUniform(config),
      { resource: 'storage', node: velocity },
      { resource: 'storage', node: divergence },
    ])

    shader.source = /* wgsl */ `
${FLUID_UNIFORM_STRUCT}
${FLUID_COMMON_SOURCE}

@group(0) @binding(0) var<uniform> u : U;
@group(0) @binding(1) var<storage, read> velocity_in : array<vec4f>;
@group(0) @binding(2) var<storage, read_write> div : array<f32>;

@compute @workgroup_size(4,4,4)
fn main(@builtin(global_invocation_id) global_id : vec3<u32>) {
    let base = vec3i(global_id);
    let le = velocity_in[clamp_to_edge(base - vec3(1,0,0))].x;
    let ri = velocity_in[clamp_to_edge(base + vec3(1,0,0))].x;
    let fr = velocity_in[clamp_to_edge(base - vec3(0,1,0))].y;
    let ba = velocity_in[clamp_to_edge(base + vec3(0,1,0))].y;
    let to = velocity_in[clamp_to_edge(base - vec3(0,0,1))].z;
    let bo = velocity_in[clamp_to_edge(base + vec3(0,0,1))].z;
    if (u.enclosed != 0u) {
        if (global_id.x == 0u) { le *= -1.; }
        if (global_id.y == 0u) { fr *= -1.; }
        if (global_id.z == 0u) { to *= -1.; }
        if (global_id.x == u32(u.x - 1)) { ri *= -1.; }
        if (global_id.y == u32(u.y - 1)) { ba *= -1.; }
        if (global_id.z == u32(u.z - 1)) { bo *= -1.; }
    }
    div[to_index(global_id)] = 0.5 * u.rdx * ((ri - le) + (ba - fr) + (bo - to));
}
    `

    shader.dispatch(dimensions.width, dimensions.height, dimensions.depth)
    shader.compile()

    return shader
  })

