# TSLStudio — External Module Port & Development Roadmap
**Date:** 2025-11-04 (America/Toronto)

This document captures the actionable plan for folding the attached WebGPU/TSL codebases into `TSLStudio` so the engine ships with a production-ready catalogue of nodes, materials, compute kernels, and FX presets. It builds on the existing docs (`TSLStudio_Plan.md`, `TSLStudio_TSL_Toolkit_DevPlan_v0.1.md`) and aligns with our WebGPU-only mandate.

---

## 1. Current State Snapshot (`TSLStudio/TSLStudio`)
- **Renderer & Framegraph:** `engine/core/renderer.ts`, `engine/core/framegraph.ts`, `engine/core/pipeline.ts` already abstract WebGPURenderer init, resize, and pass orchestration.
- **Materials:** `engine/materials/*` expose `createPBRStandard`, anisotropy/clearcoat/sheen utilities, and a triplanar helper that plug straight into MeshPhysicalNodeMaterial.
- **FX Stack:** `engine/fx` ships bloom, chromatic aberration, film grain, color grading, DOF, TAA, and a pipeline builder (`fx/pipeline.ts`).
- **Compute:** `engine/compute/particles.ts`, `engine/compute/curlNoise.ts`, `engine/compute/fluid2d.ts`, `engine/compute/sdf.ts` provide Verlet particles, curl fields, toy fluid advection, and SDF helpers.
- **TSL Library:** `src/tsl` covers color palettes, tonemapping, noise (Perlin/Simplex/FBM), post-processing effects (grain, weave, LCD, passes), and math utilities.
- **App Surface:** R3F-based canvas wrappers (`src/components/canvas/*`), compute demo components, and a sketch registry feeding the router-driven demo pages.

### Immediate Gaps
- Missing higher-order lighting nodes (hemisphere, fresnel, physically-based diffuse variants) in `src/tsl/utils/lighting` despite being used ad hoc in external examples.
- No packaged instanced-array compute helpers (only storage buffers) for sprite-driven particle surfaces.
- Framegraph lacks bindings for complex multi-target passes like SSR, GTAO, SSGI, or multi-stage DOF.
- No declarative library of SDF/field recipes beyond primitives; raymarch demos are one-off.
- UI layer has dropdowns only; no modular control panels for per-module tweaking.

---

## 2. External Source Inventory (Highlights)

### A. `RESOURCES/REPOSITORIES/portfolio examples/portfolio-main`
- `src/utils/webgpu/nodes/lighting/*` — `diffuseNode`, `fresnel`, `hemisphere` helpers that complement our lighting toolkit.
- `src/utils/webgpu/nodes/noise/*` — classic, simplex, curl, voronoi noise variants with consistent Fn signatures.
- `src/utils/webgpu/nodes/sdf/*`, `smooth-min.ts`, `smooth-mod.ts`, `compose.ts` — composable SDF and transform utilities.
- Lab scenes (`lab/sdf-basic-tsl/Experiment.tsx`, `lab/infinite-water/webgpu/demo.ts`, `lab/particles-substance/Substance.ts`) for raymarching, water simulation, and GPU particles referencing those nodes.
- WebGPU-only experiments provide Leva/Tweakpane integration patterns via `lab/LevaWrapper.tsx` and `lab/BaseExperience.ts`.

### B. `RESOURCES/REPOSITORIES/TSLwebgpuExamples`
- `tsl-particle-waves/src/script.js` — instancedArray compute pipeline feeding `SpriteNodeMaterial` with dynamic scale/position.
- `tsl-compute-particles` & `tsl-particle-waves` — patterns for using `computeAsync`, Halton-based jitter, and GPU-driven instancing.
- `raymarching-tsl-main/src/components/raymarching` — staged raymarch tutorial (step1–step6) with reusable Fn snippets and lighting recipes.
- `tsl-webgpu-companion/examples` — minimal HTML examples demonstrating TSL gradients and instancing bootstraps without React.

### C. `RESOURCES/three.js-r181/examples/jsm/tsl`
- Advanced post nodes (`display/DepthOfFieldNode.js`, `display/GTAONode.js`, `display/SSGINode.js`, `display/SSRNode.js`, `display/MotionBlur.js`, `display/AfterImageNode.js`).
- Utility nodes (`display/GaussianBlurNode.js`, `display/Tonemap`, `display/TransitionNode.js`) that align with our framegraph pass model.
- `utils/Raymarching.js` and `math/Bayer.js` (dither masks) for SDF and post dithering support.
- `lighting/TiledLightsNode.js` for clustered/tiled lighting patterns.

---

## 3. Integration Pillars & Opportunities

### 3.1 TSL Core Node Library
- **Lighting Expansion:** Port `diffuseNode`, `createHemisphereLight`, `createFresnelNode` into `src/tsl/utils/lighting.ts`, expose typed factories, and align naming conventions (`createXNode`).
- **Noise Suite:** Merge `classicNoise3d`, `voronoi`, `curlNoise3d/4d` from portfolio utils into `src/tsl/noise` with consistent exports; add multi-octave wrappers.
- **Transform Helpers:** Introduce `compose` and `smoothMod` under `src/tsl/utils/function` for instancing and modular repetition.
- **Raymarch Toolkit:** Promote SDF combinators (smooth union/subtract, domain repetition) into `src/tsl/utils/sdf`, referencing `smoothmin`/`smoothmod` and `utils/Raymarching.js`.

### 3.2 Materials & Shading
- **Layered Presets:** Extract `particles-substance` shading stack (glow, fresnel rim) and encapsulate as `engine/materials/substance.ts` for reuse.
- **Water/Iridescence:** Port the `lab/infinite-water/webgpu` displacement material into a new `engine/materials/waterSurface.ts` using our noise suite.
- **Skin/Translucency:** Adopt `SSSNode` references from `three.js-r181` to extend `createPBRStandard` with subsurface toggles.

### 3.3 Compute & Simulation
- **Instanced Arrays:** Add `engine/compute/instancedParticles.ts` mirroring `tsl-particle-waves` (instancedArray, SpriteNodeMaterial). Provide bridging to `PointsNodeMaterial` and sprite materials.
- **Fluid & Wave Systems:** Bring over `lab/infinite-water/webgpu/demo.ts` logic to enhance `engine/compute/fluid2d` (introduce force fields, boundary conditions) and create a `water2d` kernel for height fields.
- **Field Driven Particles:** Integrate `particles-substance` compute loops into `engine/compute/particles.ts` as optional field modules (e.g., density map attraction).
- **Raymarch Compute:** Leverage `raymarching-tsl` Fn steps to add `engine/compute/raymarch.ts`, providing CPU orchestrated parameters for SDF scenes.

### 3.4 Post-Processing & Framegraph
- **Multi-Pass DOF:** Wrap `DepthOfFieldNode` as a framegraph pass builder (`fx/dofAdvanced.ts`) with parameter bridging to our pipeline.
- **Global Illumination:** Integrate `GTAONode`, `SSGINode`, `SSRNode` into optional passes with history buffers; update framegraph to support multi-render-target (MRT) inputs.
- **Temporal FX:** Add `MotionBlur` and `AfterImageNode` as optional passes; tie into TAA history control.
- **Utility Passes:** Offer `TransitionNode`, `PixelationPassNode`, `Raymarching` utilities inside `fx/utils.ts` for compositing.

### 3.5 Scenes, Sketches & UI
- **Sketch Library:** Convert notable lab demos (`sdf-basic-tsl`, `particles-substance`, `nightingale-hover-effect`) into `src/sketches` modules with parameterized exports.
- **Control Panels:** Wrap Leva/Tweakpane patterns from `portfolio-main` into `src/components/debug` (e.g., `LevaPanel`, `usePanelStore`) to attach to scenes.
- **Route Enhancements:** Add categorized pages (Materials, PostFX, Compute, Raymarch) referencing the new modules with documentation overlays.

### 3.6 Tooling & Docs
- **Docs Integration:** Each imported module gets a recipe entry under `engine/docs/recipes` (materials, compute, fx, sdf) referencing original source credit/licence.
- **Testing Harness:** Mirror `tsl-webgpu-companion` minimal setups for headless tests; incorporate `renderer.computeAsync` patterns into Playwright-based regression runs.

---

## 4. Implementation Phases

### Phase A — Foundation Sync (1–2 days)
1. Sync three.js to `r181` (if not already) and validate against existing engine builds.
2. Import noise/lighting helpers from portfolio into `src/tsl` with unit snapshots.
3. Add instanced compute helper skeleton (`engine/compute/instancedParticles.ts`) and basic example route.

### Phase B — Materials & Post (3–5 days)
1. Port water and substance materials; expose via `engine/materials` and create demo scenes.
2. Integrate `DepthOfFieldNode` and `GaussianBlurNode` into framegraph; ensure compatibility with TAA pipeline.
3. Document new modules in `engine/docs/recipes` with code samples.

### Phase C — Advanced FX & GI (5–7 days)
1. Wrap `GTAONode`, `SSGINode`, `SSRNode`, `MotionBlur` into `engine/fx` presets.
2. Extend framegraph to support multi-target resources and history textures.
3. Craft regression tests (Playwright/PNG diff) for at least one GI-heavy scene.

### Phase D — Raymarch & Field Systems (4–6 days)
1. Build `engine/compute/raymarch.ts` using `raymarching-tsl` Fn chain; expose SDF library with examples.
2. Augment `engine/compute/fluid2d` with forces/boundaries inspired by `infinite-water` pipeline.
3. Add `Sketches` for raymarch and fluid demos with Leva control panels.

### Phase E — Polish & Docs (ongoing)
1. Cross-link docs (`DOCS/`) with new module references, crediting original sources.
2. Build gallery UI upgrades (categorized routes, search/filter, screenshot thumbnails).
3. Finalize automated QA matrix: visual regression, performance budgets, radius/stability thresholds for compute.

---

## 5. Backlog Breakdown (Actionable TODOs)

| Category | Task | Source | Destination |
| --- | --- | --- | --- |
| Noise | Port `classicNoise3d`, `curlNoise4d`, `voronoi` | `portfolio-main/src/utils/webgpu/nodes/noise` | `src/tsl/noise` |
| Lighting | Add `diffuseNode`, `createHemisphereLight`, `createFresnelNode` | `portfolio-main/src/utils/webgpu/nodes/lighting` | `src/tsl/utils/lighting.ts` |
| SDF | Integrate `smoothMin`, `smoothMod`, `compose` | `portfolio-main/src/utils/webgpu/nodes` | `src/tsl/utils/sdf` / `function` |
| Compute | Implement instanced sprite particles | `tsl-particle-waves/src/script.js` | `engine/compute/instancedParticles.ts` |
| Compute | Expand fluid solver with impulses/boundary control | `infinite-water/webgpu/demo.ts` | `engine/compute/fluid2d.ts` |
| Materials | Create `waterSurface` material | `infinite-water/webgpu/material.ts` | `engine/materials/waterSurface.ts` |
| Materials | Abstract substance/fresnel glow | `particles-substance/Substance.ts` | `engine/materials/substance.ts` |
| FX | Wrap advanced DOF | `examples/jsm/tsl/display/DepthOfFieldNode.js` | `engine/fx/dofAdvanced.ts` |
| FX | Add GTAO/SSGI/SSR passes | `examples/jsm/tsl/display` | `engine/fx/gtao.ts`, `ssgi.ts`, `ssr.ts` |
| FX | Integrate Motion Blur, AfterImage | `examples/jsm/tsl/display/MotionBlur.js` | `engine/fx/motionBlur.ts` |
| Framegraph | Support MRT + history textures | `examples/jsm/tsl` patterns | `engine/core/framegraph.ts` |
| UI | Build Leva control bridge | `portfolio-main/src/app/lab/LevaWrapper.tsx` | `src/components/debug` |
| Docs | Write recipes for each imported module | All above | `engine/docs/recipes/*` |
| QA | Create Playwright scenes using `renderer.computeAsync` | `tsl-webgpu-companion/examples` | `tests/render` |

---

## 6. Testing & Validation Strategy
- **Visual Regression:** Capture golden PNGs per showcase (PBR, particles, GI) via headless Chromium + WebGPU (Playwright) with deterministic seeds.
- **Performance Budgets:** Track frame time, compute dispatch counts via `engine/core/inspector.ts`; set thresholds per demo.
- **Stability Checks:** Automated scripts to run compute kernels for >60 seconds ensuring no NaNs or buffer overflows.
- **Shader API Guardrails:** Unit tests for node factories ensuring consistent output types (vec3, float) and no side effects.

---

## 7. Risks & Dependencies
- **Three.js API Drift:** Verify each imported node against r181; wrap unstable APIs behind our helpers.
- **Licensing:** Respect CC BY-NC-SA (e.g., `src/sketches/flare-1.ts`) and other licenses when porting; document attribution in recipes.
- **GPU Resource Pressure:** GI and motion blur nodes increase texture/memory footprint—update inspector to monitor WebGPU allocations.
- **UI Complexity:** Adding Leva/Tweakpane must remain optional to avoid inflated bundle size; lazy-load panels.

---

## 8. Immediate Next Steps
1. **Noise & Lighting Merge:** Begin by porting portfolio noise/lighting helpers and writing unit tests (`draft-plan` sprint kickoff).
2. **Instanced Particles Prototype:** Implement sprite-based compute demo using `tsl-particle-waves` patterns to validate instancedArray integration.
3. **Framegraph Audit:** Review current post pipeline to define extension points for advanced nodes (MRT bindings).

Once Phase A deliverables land, revisit this roadmap to unlock Phase B tasks and expand the public module catalogue.



