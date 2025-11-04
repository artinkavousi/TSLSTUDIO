# Fluid Simulation API

The engine now exposes helpers for creating, driving, and demoing fluid simulations using the WebGPU compute pipeline.

## Exports

```ts
import {
  createFluidSimulation,
  createFluidSimulationPass,
  fluidPresets,
  applyFluidPreset,
  fluidControlSchema,
} from '@tslstudio/engine/compute'
```

### `createFluidSimulation(config)`
- Creates the core simulation handle with access to density, temperature, velocity, and pressure buffers.
- Returns storage nodes suitable for compute/render passes.
- Key options: `dimensions`, `scenario`, `pressureIterations`, `enableVorticity`.

### `createFluidSimulationPass({ simulation, resourcePrefix, autoStep, emitters })`
- Registers the simulation with a `Framegraph` and automatically steps it each frame.
- Exposes resources under `${prefix}.uniforms`, `${prefix}.smoke`, `${prefix}.temperature`, `${prefix}.velocity`, `${prefix}.pressure` for subsequent passes (lighting/ray-march/post).

### Presets & Controls
- `fluidPresets` enumerates built-in demo configurations (`Smoke Column`, `Fire Jet`, `Five Spheres`, `Vortex Chamber`).
- `applyFluidPreset(sim, name)` applies scenario + uniform overrides.
- `fluidControlSchema` lists numeric controls (min/max/step/default) for UI binding.

## Basic Usage

```ts
import { Framegraph } from '@tslstudio/engine/core/framegraph'
import {
  createFluidSimulation,
  createFluidSimulationPass,
  applyFluidPreset,
} from '@tslstudio/engine/compute'

const simulation = createFluidSimulation({ dimensions: { width: 96, height: 96, depth: 96 } })
applyFluidPreset(simulation, 'fireJet')

const framegraph = new Framegraph(renderer)
framegraph.addPass(createFluidSimulationPass({ simulation, resourcePrefix: 'fluid' }))

// Additional passes (lighting, raymarch, composite) can now consume:
// - 'fluid.smoke'
// - 'fluid.temperature'
// - 'fluid.velocity'
// - 'fluid.uniforms'
```

## Testing & Regression Plan

- Unit tests cover preset application, framegraph resource exposure, and simulation stepping (`fluid.test.ts`, `fluidPasses.test.ts`, `fluidPresets.test.ts`).
- Once CLI access returns, run:

```bash
pnpm vitest run --filter fluid
```

- Visual regression: capture reference renders for each preset after the ray-march/composite stages are implemented.

## Follow-up Work

- Port the lighting + ray-march passes (`lighting.js`, `render.js`) to compute shaders feeding the scene.
- Build a studio panel using `fluidControlSchema` for live parameter editing and preset switching.
- Add snapshot + replay utilities for deterministic regression coverage.

