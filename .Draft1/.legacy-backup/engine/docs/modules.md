# TSLStudio Engine Toolkit — Module Overview

## Core Runtime

- `core/renderer.ts` — `createRenderer(opts)` bootstraps a WebGPURenderer with tone mapping, DPR control, auto-resize, and lifecycle helpers.
- `core/framegraph.ts` — `Framegraph` orchestrates render and post-processing passes, exposes profiling hooks, and ships with `createScenePass`.
- `core/assets.ts` — `AssetManager` loads textures (standard, KTX2, HDR/EXR, LUT cubes) with caching + PMREM integration.
- `core/inspector.ts` — `EngineInspector` overlays FPS/memory charts and optional pass timings.

## Materials

- `materials/pbrStandard.ts` — `createPBRStandard(opts)` builds a `MeshPhysicalNodeMaterial` with node slots for clearcoat, sheen, anisotropy, and transmission.
- Utility mixins: `clearcoat.ts`, `sheen.ts`, `anisotropy.ts`, `transmission.ts`, `triplanar.ts`, `matcap.ts`, `utils.ts`.

## Post Processing

- Stateless effects: `bloom.ts`, `vignette.ts`, `filmgrain.ts`, `chromaticAberration.ts`, `colorgrading.ts`, `dof.ts`.
- Temporal AA pipeline: `taa.ts` offers jitter + history blending with adaptive clamp.
- Composition helpers: `chain.ts` + `postPass.ts` convert effect stacks into framegraph passes; `pipeline.ts` wires scene → TAA → post via `buildFXPipeline`.

## Compute

- `compute/particles.ts` — GPU particle simulation with Verlet/Euler integrators and modular force fields.
- `compute/curlNoise.ts` — Curl-noise sampler factory for particle flows or shader graph injection.
- `compute/sdf.ts` — Node-friendly SDF primitives and a raymarch helper for custom fields.
- `compute/fluid2d.ts` — Toy 2D fluid solver (semi-Lagrangian advection, pressure projection, impulse injection).

## Scenes

- `scenes/demoPBR.ts` — Builds a PBR showcase scene with adaptive bloom/grade chain and TAA-enabled framegraph.
- `scenes/demoParticles.ts` — GPU particle flow demo using the compute module and cinematic post stack.
- `scenes/types.ts` — `DemoSceneHandle` contract (`render`, `dispose`) for host integrations.

### Quick Start

```ts
import { core, fx, scenes } from '@engine'

const rendererHandle = await core.createRenderer({ autoResize: true })
const demo = await scenes.createPBRDemoScene(rendererHandle.renderer)

function tick(delta: number) {
  demo.render(delta)
}

// later
demo.dispose()
rendererHandle.dispose()
```



