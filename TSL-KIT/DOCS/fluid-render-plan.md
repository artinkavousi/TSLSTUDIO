# Fluid Renderer Integration Plan

## 1. Current Simulation Outputs

- `velocityField` (`vec4`): xyz = velocity, w = fuel density.
- `smokeField` (`vec4`): rgb = albedo/tint, w = smoke density (opacity term).
- `temperatureField` (`float`): absolute temperature used for black-body shading.
- `pressureField` (`float`): scalar pressure, useful for debug visualisations.
- `divergenceField` (`float`): single-buffer divergence, used during solver (debug only).

All buffers share the same 3D grid resolution with double-buffered read/write where needed.

## 2. Rendering Requirements

### 2.1 Volume Lighting Pre-pass

To emulate the reference pipeline (Roquefort):
- **Lighting buffer (`lightingField`)**: A `vec4` storage buffer storing lit color + density.
- Two stages:
  1. Directional light transmittance (march along axis, accumulate absorption through smoke/fuel).
  2. Optional black-body emission term derived from temperature.

### 2.2 Ray March Pass

Render pass should raymarch through the volume per pixel, sampling:
- smoke density & albedo (for diffuse volumetric scattering).
- fuel density & temperature (for emissive flame rendering).
- lighting buffer (for precomputed transmittance).

Target output is a RGBA texture attached to the scene pass (or a dedicated post-processing input) to blend over the opaque scene.

### 2.3 Debug Views

Provide optional modes for pressure & divergence visualisation (slab/slice overlays) for tuning.

## 3. Proposed Framegraph Wiring

1. **Lighting Pass** (compute): consumes `smokeField`, `temperatureField`; writes `lightingField`.
2. **Raymarch Pass** (compute): consumes `lightingField`, `smokeField`, `temperatureField`, `velocityField`; writes to a 2D render target (`RenderTargetColor`).
3. **Composite**: blend the raymarched target over the main scene (either inside the scene pass using a fullscreen material, or via post-processing pass).

Resources required:
- 3D storage buffers (already present) exposed to renderer
- 2D UAV render target (half-res variant recommended for performance)
- Optional blue-noise / jitter texture for stochastic sampling

## 4. Visualisation Strategy

### Smoke (Density)
- Use `smokeField.rgb` for coloration, `smokeField.a` for extinction.
- Apply exponential extinction: `transparency *= exp(-density * stepLength * opticalDensity)`.
- Accumulate colored light via Beer-Lambert.

### Fire (Temperature/Fuel)
- Use `velocityField.w` as emissive strength gate.
- Map `temperatureField` to color via black-body lookup.
- Blend emission with smoke using the accumulated transparency from the smoke pass.

### Blending Order
1. March smoke & emission simultaneously (single pass) updating both color and alpha.
2. Apply tone mapping/gamma in post chain.

## 5. Implementation Notes

- Start with full-resolution raymarch; add downsampled option controlled via preset once stable.
- Keep step count configurable (scene-level controls): default `stepLength` derived from grid resolution, user override via `uniforms.stepLength`.
- Expose lighting colours/intensity, optical density, and black-body brightness via `FluidSimulationHandle.updateUniforms`.
- For integration with FX presets, register fluid render target in framegraph attachments (e.g. `FX_RESOURCE_KEYS.fluid` for post-composite).

## 6. Next Steps

1. **Buffer Exposure**: extend `createFluidSimulation` to return a `lighting` storage node (or compute internally each frame).
2. **Lighting Compute Pass**: port/adapt `lighting.js` & `bakeLighting` logic into engine compute module.
3. **Raymarch Pass**: port `renderDefault`/`renderFuelTemperature` into a dedicated engine pass producing a `WebGPURenderTarget`.
4. **Composite**: create a lightweight fullscreen material or post effect that blends the fluid render target into the scene.
5. **Controls**: add scenario/intensity toggles in forthcoming demo UI work.

### Usage Sketch

```ts
import { Framegraph } from '@tslstudio/engine/core/framegraph'
import { createFluidSimulation, createFluidSimulationPass, applyFluidPreset } from '@tslstudio/engine/compute'

const simulation = createFluidSimulation({ dimensions: { width: 96, height: 96, depth: 96 } })
applyFluidPreset(simulation, 'fireJet')

const framegraph = new Framegraph(renderer)
framegraph.addPass(createFluidSimulationPass({ simulation, resourcePrefix: 'fluidDemo' }))

// TODO: add lighting + raymarch passes to consume the exposed resources.
```

This plan clarifies the rendering pipeline and the density/temperature strategy so the remaining tasks (implementation, demos, documentation/tests) can proceed sequentially.

