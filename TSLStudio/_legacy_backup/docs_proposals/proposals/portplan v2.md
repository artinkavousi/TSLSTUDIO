 # TSLStudio — Consolidated Development Plan & TODO Roadmap
 **Date:** 2025-11-04 (America/Toronto)

 This document consolidates and operationalizes the existing plans (`TSLStudio_Plan.md`, `TSLStudio_TSL_Toolkit_DevPlan_v0.1.md`, `TSLStudio_Module_Port_Roadmap_2025-11-04.md`) and maps concrete port tasks from the attached repositories into `TSLStudio` with acceptance criteria and phased execution.

 ---

 ## 1) Current State Snapshot
 - Renderer: WebGPU-first bootstrap with resize/tone mapping in `engine/core/renderer.ts` (async `init`, DPR, color space, exposure, clear color, auto-resize).
 - Framegraph/Post: Minimal composition (`engine/fx/chain.ts`) and post nodes in `src/tsl/post_processing/*` (tonemap, vignette, grain, bloom pass wrapper).
 - Materials: `engine/materials/*` PBR helpers (clearcoat, sheen, anisotropy, transmission, triplanar, matcap).
 - Compute: `engine/compute/particles.ts` (verlet/euler, fields), `curlNoise.ts`, `sdf.ts` (SDF ops + raymarch helper), `fluid2d.ts` (toy grid).
 - TSL Library: `src/tsl/noise/*`, `src/tsl/utils/*`, `src/tsl/post_processing/*` provide reusable nodes.
 - R3F Surface: `src/components/canvas/*` (WebGPURenderer integration, sketch helpers, color space correction), demo routes/sketches.

 ### Gaps
 - Lighting nodes (fresnel/hemisphere/diffuse variants) not bundled in `src/tsl/utils/lighting.ts`.
 - No instancedArray-based compute helpers (only storage buffers in compute/particles).
 - Framegraph lacks MRT/history bindings required for SSR/GTAO/SSGI/motion blur.
 - SDF toolkit lacks packaged recipes (only primitives and a basic raymarcher).
 - Debug/UI panels are ad hoc; no standard Leva/Tweakpane bridge.

 ---

 ## 2) External Sources (Port Candidates)
 - `RESOURCES/REPOSITORIES/portfolio examples/portfolio-main/src/utils/webgpu/nodes/`
   - lighting: `ambient.ts`, `diffuse.ts`, `fresnel.ts`, `hemisphere.ts`
   - noise: `classicNoise3d.ts`, `simplexNoise[2d|3d|4d].ts`, `curlNoise[3d|4d].ts`, `voronoi.ts`
   - sdf/ops: `smooth-min.ts`, `smooth-mod.ts`, `compose.ts`, `sdf/sphere.ts`
   - transforms: `remap.ts`, `rotate-3d-y.ts`
 - `RESOURCES/REPOSITORIES/TSLwebgpuExamples`
   - `tsl-particle-waves/src/script.js` (instancedArray compute → SpriteNodeMaterial)
   - `tsl-compute-particles`, `raymarching-tsl-main` (Fn patterns, staged raymarch)
   - `tsl-webgpu-companion/examples` (minimal bootstraps + computeAsync)
 - `RESOURCES/three.js-r181/examples/jsm/tsl`
   - display: `DepthOfFieldNode`, `GaussianBlurNode`, `GTAONode`, `SSGINode`, `SSRNode`, `MotionBlur`, `AfterImageNode`, `PixelationPassNode`, `Lut3DNode`, `ChromaticAberrationNode`
   - utils: `utils/Raymarching.js`, math: `math/Bayer.js`

 ---

 ## 3) Prioritized Top 10 (Immediate)
 1. Port lighting nodes: fresnel, hemisphere, diffuse → `src/tsl/utils/lighting.ts`
 2. Merge noise suite: classic, simplex 2/3/4D, curl 3/4D, voronoi → `src/tsl/noise/*`
 3. Add transform helpers: `smoothMod`, `smoothMin`, `compose`, `remap` → `src/tsl/utils/function/*`
 4. Instanced particles: instancedArray + Sprite/Points NodeMaterial → `engine/compute/instancedParticles.ts`
 5. Advanced DOF: wrap `DepthOfFieldNode` + `GaussianBlurNode` → `engine/fx/dofAdvanced.ts`
 6. GTAO/SSGI/SSR passes (opt-in) → `engine/fx/gtao.ts`, `ssgi.ts`, `ssr.ts`
 7. Motion blur / AfterImage → `engine/fx/motionBlur.ts`
 8. Raymarch toolkit (recipes + domain repetition) → `src/tsl/utils/sdf/*` + `engine/compute/raymarch.ts`
 9. Water surface material (infinite-water demo) → `engine/materials/waterSurface.ts`
 10. Debug/UI bridge (Leva/Tweakpane) → `src/components/debug/*` + example bindings

 ---

 ## 4) Phased Plan
 - Phase A (1–2 days): lighting + noise + transforms; instanced particles (skeleton) + example route.
 - Phase B (3–5 days): materials (water, substance/fresnel) + DOF integration; docs/recipes.
 - Phase C (5–7 days): GI passes (GTAO/SSGI/SSR), motion blur; extend framegraph for MRT/history.
 - Phase D (4–6 days): raymarch toolkit and fluid upgrades; new sketch gallery with control panels.
 - Phase E (ongoing): docs, visual regression, performance budgets, licensing credits.

 ---

 ## 5) Source → Destination Mapping (with Acceptance Criteria)

 - Noise (portfolio-main → `src/tsl/noise`)
   - Include: `classicNoise3d`, `simplexNoise{2d,3d,4d}`, `curlNoise{3d,4d}`, `voronoi`.
   - AC: typed Fn exports, unit snapshot for output ranges, consistent naming, docs entry.
 - Lighting (portfolio-main → `src/tsl/utils/lighting.ts`)
   - Include: fresnel, hemisphere, diffuse variants.
   - AC: examples render parity with original demos; parameters validated (ranges/clamping).
 - Transforms/SDF ops (portfolio-main → `src/tsl/utils/function` + `src/tsl/utils/sdf`)
   - Include: `smoothMod`, `smoothMin`, `compose`, SDF sphere baseline.
   - AC: raymarch example shows smooth unions/mod repetitions without artifacts.
 - Instanced particles (tsl-particle-waves → `engine/compute/instancedParticles.ts`)
   - AC: runs 200k sprites with `computeAsync`, exposes `{ positions, sizes }` attributes.
 - DOF (three.js-r181 → `engine/fx/dofAdvanced.ts`)
   - AC: builder returns TSL node/pass; integrates into post chain; focus distance/aperture configurable.
 - GI (GTAO/SSGI/SSR) → `engine/fx/*`
   - AC: optional passes with history buffers; framegraph updated to support MRT inputs.
 - Motion Blur / AfterImage → `engine/fx/motionBlur.ts`
   - AC: shutter, samples configurable; works with TAA reset.
 - Raymarch toolkit → `engine/compute/raymarch.ts`
   - AC: Fn-based stepper compatible with SDF nodes; example scenes provided.
 - Water Surface → `engine/materials/waterSurface.ts`
   - AC: displacement + normal derivation; performance-guarded params; demo scene.
 - Debug/UI bridge → `src/components/debug/*`
   - AC: Leva panels wired to scene params without affecting core modules.

 ---

 ## 6) Epics & TODOs (Checklist)

 ### A) TSL Core Library
 - [ ] Add fresnel/hemisphere/diffuse helpers to `src/tsl/utils/lighting.ts`
 - [ ] Merge noise nodes (classic/simplex/curl/voronoi) into `src/tsl/noise/*`
 - [ ] Add `smoothMod`, `smoothMin`, `compose`, `remap` helpers
 - [ ] Expand SDF set (torus, box, plane) + smooth ops + domain repeat

 ### B) Materials & Shading
 - [ ] `engine/materials/substance.ts` (fresnel glow, rim)
 - [ ] `engine/materials/waterSurface.ts` (infinite-water)
 - [ ] Extend `pbrStandard` with SSSNode toggle (r181)

 ### C) Compute & Simulation
 - [ ] `engine/compute/instancedParticles.ts` (instancedArray + Sprite/Points)
 - [ ] Upgrade `fluid2d` with forces/boundaries + caps
 - [ ] `engine/compute/raymarch.ts` orchestrator

 ### D) Post-Processing & Framegraph
 - [ ] `engine/fx/dofAdvanced.ts` using DOF + Gaussian blur nodes
 - [ ] `engine/fx/{gtao,ssgi,ssr}.ts` + MRT/history in framegraph
 - [ ] `engine/fx/motionBlur.ts` + `AfterImageNode` wrapper

 ### E) Scenes, UI & Docs
 - [ ] Port lab demos to `src/sketches/*` (materials, compute, raymarch categories)
 - [ ] Build `src/components/debug/*` Leva/Tweakpane bridge
 - [ ] Add `engine/docs/recipes/*` with attribution to sources

 ### F) QA & Tooling
 - [ ] Playwright headless scenes using `renderer.computeAsync`
 - [ ] Visual regression PNGs (deterministic seeds)
 - [ ] Inspector: track GPU allocations & pass timings

 ---

 ## 7) Testing Protocol
 - Visual regression: deterministic seeds; compare deltas within tolerance per pass.
 - Performance budgets: FPS/frame-time targets per demo; CI fails if exceeded.
 - Stability: 60s compute runs without NaNs/overflows; buffer size guardrails.
 - Shader/node API: type/unit tests asserting node output shapes and value ranges.

 ---

 ## 8) Risks & Mitigations
 - Three/TSL API drift (r181+): wrap unstable bits; pin `three` and test on update.
 - GPU memory pressure from GI/MRT: expose quality presets; monitor allocations.
 - Licensing: include credits in recipes; maintain source headers where applicable.
 - UI bloat: lazy-load panels; make debug UI optional.

 ---

 ## 9) Next Actions (This Sprint)
 1) Import lighting + noise from portfolio, write snapshots.
 2) Add `instancedParticles` and a demo route page.
 3) Draft DOF builder and framegraph extension points for MRT/history.

 When these land, proceed with GI passes and material ports.

