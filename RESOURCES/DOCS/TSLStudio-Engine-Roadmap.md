## TSLStudio WebGPU + TSL Engine Roadmap (r180+)

### Goal
Self‑contained, plug‑and‑play TSL/Node toolkit on top of Three.js WebGPU delivering advanced PBR materials, realistic post‑FX, and compute effects, with clean, agent‑friendly APIs.

### Current Baseline
- WebGPU Canvas and init present: `TSLStudio/src/components/canvas/webgpu_scene.tsx`
- TSL utilities present: `TSLStudio/src/tsl/{noise,utils,post_processing}`
- Basic post component present: `TSLStudio/src/tsl/post_processing/post_processing.tsx`

### Phase 1 — Materials + Post Foundations
1) Materials module (node PBR)
- Add `src/tsl/materials/core` (fresnel, triplanar, normal blend)
- Add `src/tsl/materials/pbr/car_paint_iridescent.ts` (sheen/clearcoat/anisotropy/iridescence)
- Export via `src/tsl/materials/index.ts`

2) Post‑processing composer
- Add `src/tsl/post_processing/composer.ts` (`makePostChain(passes)`)
- Add `src/tsl/post_processing/passes/tonemap.ts` (ACES/Filmic/Reinhard)
- Reuse existing effects: `vignette`, `grain`, `pixellation`, `lcd`, `canvas_weave`

3) Package surface
- Add `src/tsl/index.ts` to re‑export `materials`, `post_processing`, and `utils`

Deliverable: Demo sketch using composer + one flagship material.

### Phase 2 — Compute Foundations (WebGPU)
4) Compute scaffolding
- Add `src/tsl/compute/{pingpong,particles}`
- `createParticleSim(config)` with pos/vel storage textures, curl/gravity fields
- Workgroup negotiation from device caps (float16 fallback)

5) Instrumentation & caps
- `util/deviceCaps.ts`: adapter limits, features (timestamp, float16)
- `util/budget.ts`: frame timing, pass timings

Deliverable: Particle demo with timings overlay.

### Phase 3 — Presets, Inspector, QA
6) Presets
- `presets/materials`: CarPaint, SatinCloth, StylizedSkin
- `presets/post`: CinematicBloom, DepthFocus
- `presets/compute`: CurlSwarm

7) Inspector & DSL
- Minimal graph inspector (node uniforms view)
- Zod schemas for JSON DSL; `compileMaterialGraph`, `makePostChain`

8) QA harness
- Golden screenshots (+ perceptual diff) and perf budgets at 1080p

### API Sketch
- Materials: `makeMaterial(spec) -> MeshPhysicalNodeMaterial`
- Post: `makePostChain([['tonemap',{curve:'ACES'}], ['bloom',{...}], ...])`
- Compute: `createParticleSim({count, fields}) -> { update, dispose }`

### Priority Backlog (short)
- [ ] Implement `materials/pbr/car_paint_iridescent`
- [ ] Implement `post_processing/composer` + `passes/tonemap`
- [ ] Add `src/tsl/index.ts` exports
- [ ] Demo wire: scene with composer (vignette + aces + grain)
- [ ] Compute scaffold: ping‑pong + simple curl field

### References
- Three r180+ TSL/WebGPU; NodeMaterials for WebGPU
- Internal docs: `RESOURCES/DOCS/tsl-toolkit-plan.md`, `tsl-toolkit-architecture.md`


