import { ComputeShader, Fn, ShaderNode, ShaderNodeUniform } from 'three/tsl'

import type { GridDimensions } from '../../../../index'; 
import type { FluidUniforms } from '../types'; 
import { FLUID_COMMON_SOURCE } from '../common'; 
import { FLUID_UNIFORM_STRUCT } from 

interface BaseEmitterParams {
  dimensions: GridDimensions
  config: FluidUniforms
}

interface SmokeEmitterParams extends BaseEmitterParams {
  velocity: ShaderNode
  smoke: ShaderNode
}

interface FireEmitterParams extends BaseEmitterParams {
  velocity: ShaderNode
  temperature: ShaderNode
}

interface ThreeFieldEmitterParams extends BaseEmitterParams {
  velocity: ShaderNode
  smoke: ShaderNode
  temperature: ShaderNode
}

export const rotatingSmokeEmitterShader = ({ dimensions, velocity, smoke, config }: SmokeEmitterParams) =>
  Fn(() => {
    const shader = new ComputeShader('fluidRotatingSmokeEmitter')
    shader.workgroupSize = [4, 4, 4]

    shader.setBindings([
      ShaderNodeUniform(config),
      { resource: 'storage', node: velocity },
      { resource: 'storage', node: smoke },
    ])

    shader.source = /* wgsl */ `
${FLUID_UNIFORM_STRUCT}
${FLUID_COMMON_SOURCE}

@group(0) @binding(0) var<uniform> u : U;
@group(0) @binding(1) var<storage, read_write> velocity : array<vec4f>;
@group(0) @binding(2) var<storage, read_write> smoke : array<vec4f>;

@compute @workgroup_size(4,4,4)
fn main(@builtin(global_invocation_id) global_id : vec3<u32>) {
    if (global_id.x == 0u || global_id.y == 0u || global_id.z == 0u
        || global_id.x == u32(u.x - 1) || global_id.y == u32(u.y - 1) || global_id.z == u32(u.z - 1)) {
        return;
    }
    let index = to_index(global_id);
    let worldPos = (vec3f(global_id) / vec3f(u.x, u.y, u.z)) - 0.5;
    let spherePos = vec3(
        sin(u.t * .75) * .2,
        cos(u.t * .75) * .2,
        -.2 + .1 * sin(u.t * 1.127)
    );
    let dist = length(worldPos - spherePos);
    let color = vec3f(u.emitterR, u.emitterG, u.emitterB);
    let spot = max(0., (1. - dist * 10.)) * (.2 + .8 * sin(u.t * .5) * sin(u.t * .5));
    velocity[index] += vec4(0, 0, 0.00001, 0);
    let old = smoke[index];
    let added = vec4f(color, spot * 6. * u.dt);
    smoke[index] = add_smoke(old, added);
}
    `

    shader.dispatch(dimensions.width, dimensions.height, dimensions.depth)
    shader.compile()

    return shader
  })

export const rotatingFireEmitterShader = ({ dimensions, velocity, temperature, config }: FireEmitterParams) =>
  Fn(() => {
    const shader = new ComputeShader('fluidRotatingFireEmitter')
    shader.workgroupSize = [4, 4, 4]

    shader.setBindings([
      ShaderNodeUniform(config),
      { resource: 'storage', node: velocity },
      { resource: 'storage', node: temperature },
    ])

    shader.source = /* wgsl */ `
${FLUID_UNIFORM_STRUCT}
${FLUID_COMMON_SOURCE}

@group(0) @binding(0) var<uniform> u : U;
@group(0) @binding(1) var<storage, read_write> velocity : array<vec4f>;
@group(0) @binding(2) var<storage, read_write> temperature : array<f32>;

@compute @workgroup_size(4,4,4)
fn main(@builtin(global_invocation_id) global_id : vec3<u32>) {
    if (global_id.x == 0u || global_id.y == 0u || global_id.z == 0u
        || global_id.x == u32(u.x - 1) || global_id.y == u32(u.y - 1) || global_id.z == u32(u.z - 1)) {
        return;
    }
    let index = to_index(global_id);
    let worldPos = (vec3f(global_id) / vec3f(u.x, u.y, u.z)) - 0.5;
    let spherePos = vec3(
        sin(u.t * .75) * .2,
        cos(u.t * .75) * .2,
        -.35 + .05 * sin(u.t * 1.127));
    let dist = length(worldPos - spherePos);
    let asf = sin(u.t * 2.3) * (.5 + .5 * sin(u.t * 5.3));
    let spot = max(0., sqrt(1. - dist * 10.)) * (.6 + .4 * asf * asf);
    let direction = vec3(
        sin(u.t * 1.33),
        cos(u.t * 1.33),
        sin(u.t * 1.127));
    velocity[index] += vec4(direction * spot * 1., spot * 5.) * u.dt;
    temperature[index] += 5000. * spot * u.dt;
}
    `

    shader.dispatch(dimensions.width, dimensions.height, dimensions.depth)
    shader.compile()

    return shader
  })

export const fiveSpheresEmitterShader = ({ dimensions, velocity, smoke, temperature, config }: ThreeFieldEmitterParams) =>
  Fn(() => {
    const shader = new ComputeShader('fluidFiveSpheresEmitter')
    shader.workgroupSize = [4, 4, 4]

    shader.setBindings([
      ShaderNodeUniform(config),
      { resource: 'storage', node: velocity },
      { resource: 'storage', node: smoke },
      { resource: 'storage', node: temperature },
    ])

    shader.source = /* wgsl */ `
${FLUID_UNIFORM_STRUCT}
${FLUID_COMMON_SOURCE}

fn hue_to_rgb(h: f32) -> vec3<f32> {
    return 0.5 + 0.5 * cos(h + vec3f(0,2,4));
}

@group(0) @binding(0) var<uniform> u : U;
@group(0) @binding(1) var<storage, read_write> velocity : array<vec4f>;
@group(0) @binding(2) var<storage, read_write> smoke : array<vec4f>;
@group(0) @binding(3) var<storage, read_write> temperature : array<f32>;

@compute @workgroup_size(4,4,4)
fn main(@builtin(global_invocation_id) global_id : vec3<u32>) {
    if (global_id.x == 0u || global_id.y == 0u || global_id.z == 0u
        || global_id.x == u32(u.x - 1) || global_id.y == u32(u.y - 1) || global_id.z == u32(u.z - 1)) {
        return;
    }
    let index = to_index(global_id);
    let worldPos = (vec3f(global_id) / vec3f(u.x, u.y, u.z)) * 2. - 1.;
    var newSmoke = smoke[index];
    var newVelocity = velocity[index];
    var newTemperature = temperature[index];
    for (var i = 0; i < 5; i++) {
        let phase = f32(i) / 5.0 * PI * 2.0;
        let phaseZ = f32(i) * PI / 2.5 * 3.0;
        let radius = .5 + sin(u.t * 0.3) * .3;
        let spherePos = vec3(
            sin(u.t * .5 + phase) * radius,
            cos(u.t * .5 + phase) * radius,
            .6 * sin(u.t * 1.5 + phaseZ));
        let prevSpherePos = vec3(
            sin(u.t * .5 - u.dt + phase) * radius,
            cos(u.t * .5 - u.dt + phase) * radius,
            .6 * sin(u.t * 1.5 + phaseZ));
        let dist = length(worldPos - spherePos);
        let spot = sqrt(max(0., u.brushSize * 2. - dist)) * u.dt;
        let color = hue_to_rgb(u.t * .2 + f32(i) * 1.);
        let added = vec4f(color, spot * 2. * u.brushSmokeAmount);
        newSmoke = add_smoke(newSmoke, added);
        newVelocity += vec4f((spherePos - prevSpherePos) * u.brushVelocityAmount * 5., u.dt * 60. * u.brushFuelAmount) * spot * 60.;
        newTemperature += 500. * u.brushTemperatureAmount * spot * 60.;
    }
    smoke[index] = newSmoke;
    velocity[index] = newVelocity;
    temperature[index] = newTemperature;
}
    `

    shader.dispatch(dimensions.width, dimensions.height, dimensions.depth)
    shader.compile()

    return shader
  })

export const vortexEmitterShader = ({ dimensions, velocity, smoke, temperature, config }: ThreeFieldEmitterParams) =>
  Fn(() => {
    const shader = new ComputeShader('fluidVortexEmitter')
    shader.workgroupSize = [4, 4, 4]

    shader.setBindings([
      ShaderNodeUniform(config),
      { resource: 'storage', node: velocity },
      { resource: 'storage', node: smoke },
      { resource: 'storage', node: temperature },
    ])

    shader.source = /* wgsl */ `
${FLUID_UNIFORM_STRUCT}
${FLUID_COMMON_SOURCE}

fn hue_to_rgb(h: f32) -> vec3<f32> {
    return 0.5 + 0.5 * cos(h + vec3f(0,2,4));
}

@group(0) @binding(0) var<uniform> u : U;
@group(0) @binding(1) var<storage, read_write> velocity : array<vec4f>;
@group(0) @binding(2) var<storage, read_write> smoke : array<vec4f>;
@group(0) @binding(3) var<storage, read_write> temperature : array<f32>;

@compute @workgroup_size(4,4,4)
fn main(@builtin(global_invocation_id) global_id : vec3<u32>) {
    if (global_id.x == 0u || global_id.y == 0u || global_id.z == 0u
        || global_id.x == u32(u.x - 1) || global_id.y == u32(u.y - 1) || global_id.z == u32(u.z - 1)) {
        return;
    }
    let index = to_index(global_id);
    let worldPos = (vec3f(global_id) / vec3f(u.x, u.y, u.z)) * 2. - 1.;
    var vortexCenter = vec2f(sin(u.t * 0.1 + worldPos.z), cos(u.t * 0.1 + worldPos.z)) * sin(u.t * 0.3) * .3;
    var toCenter = worldPos.xy - vortexCenter;
    var clockwise = vec2f(toCenter.y, -toCenter.x);

    var newSmoke = smoke[index];
    var newTemp = temperature[index];
    var newVel = velocity[index];

    newVel += vec4f(clockwise * 0.1, .8 * length(toCenter), 0) * u.dt;

    smoke[index] = newSmoke;
    temperature[index] = newTemp;
    velocity[index] = newVel;
}
    `

    shader.dispatch(dimensions.width, dimensions.height, dimensions.depth)
    shader.compile()

    return shader
  })

interface UpdateMouseParams extends ThreeFieldEmitterParams {}

export const updateMouseShader = ({ dimensions, velocity, smoke, temperature, config }: UpdateMouseParams) =>
  Fn(() => {
    const shader = new ComputeShader('fluidUpdateMouse')
    shader.workgroupSize = [4, 4, 4]

    shader.setBindings([
      ShaderNodeUniform(config),
      { resource: 'storage', node: velocity },
      { resource: 'storage', node: smoke },
      { resource: 'storage', node: temperature },
    ])

    shader.source = /* wgsl */ `
${FLUID_UNIFORM_STRUCT}
${FLUID_COMMON_SOURCE}

fn palette(t : f32, a : vec3<f32>, b : vec3<f32>, c : vec3<f32>, d : vec3<f32> ) -> vec3<f32> {
    return a + b * cos(6.28318 * (c * t + d));
}

fn distanceToLine(a: vec3f, b: vec3f, pos: vec3f) -> f32 {
    let pa = pos - a;
    let ba = b - a;
    let h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
    return length(pa - ba * h);
}

@group(0) @binding(0) var<uniform> u : U;
@group(0) @binding(1) var<storage, read_write> velocity : array<vec4f>;
@group(0) @binding(2) var<storage, read_write> smoke : array<vec4f>;
@group(0) @binding(3) var<storage, read_write> temperature : array<f32>;

@compute @workgroup_size(4,4,4)
fn main(@builtin(global_invocation_id) global_id : vec3<u32>) {
    if (global_id.x == 0u || global_id.y == 0u || global_id.z == 0u
        || global_id.x == u32(u.x - 1) || global_id.y == u32(u.y - 1) || global_id.z == u32(u.z - 1)) {
        return;
    }

    let index = to_index(global_id);
    let worldPos = (vec3f(global_id) / vec3f(u.x, u.y, u.z)) - 0.5;

    let rayA = computeCameraRay(vec3u(vec3f(u.mouseStartX * u.canvasX, u.mouseStartY * u.canvasY, 0)));
    let rayB = computeCameraRay(vec3u(vec3f(u.mouseEndX * u.canvasX, u.mouseEndY * u.canvasY, 0)));

    let boxMin = vec3f(-.5);
    let boxMax = vec3f(.5);

    let aIntersections = rayBoxIntersect(rayA.pos, rayA.dir, boxMin, boxMax);
    let bIntersections = rayBoxIntersect(rayB.pos, rayB.dir, boxMin, boxMax);

    let aDist = (aIntersections.x + aIntersections.y) * 0.5;
    let bDist = (bIntersections.x + bIntersections.y) * 0.5;

    if (aDist < 0.0 || bDist < 0.0) { return; }

    let aPos = rayA.pos + rayA.dir * aDist;
    let bPos = rayB.pos + rayB.dir * bDist;

    let dist = distanceToLine(aPos, bPos, worldPos);

    let spot = sqrt(max(0., u.brushSize - dist)) * u.dt;

    let color = vec3f(.9,.1,.1);
    let old = smoke[index];
    let added = vec4f(color, spot * 2. * u.brushSmokeAmount);
    smoke[index] = add_smoke(old, added);
    velocity[index] += vec4f((bPos - aPos) * u.brushVelocityAmount * 5., u.brushFuelAmount) * spot * 60.;
    temperature[index] += 500. * u.brushTemperatureAmount * spot * 60.;
}
    `

    shader.dispatch(dimensions.width, dimensions.height, dimensions.depth)
    shader.compile()

    return shader
  })

