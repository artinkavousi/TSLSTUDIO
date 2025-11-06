# TSLStudio Testing & Validation TODO

> Owner: Engine & TSL core team  
> Scope: Ensure every exported API matches source material, all pipelines execute end-to-end, and regressions are caught automatically.

## 1. Immediate code fixes (blocking)
- [ ] Restore every barrel export (`packages/*/src/**/index.ts`) with explicit module paths.
- [ ] Replace missing module specifiers (e.g. `fx/screenspace.ts`, `fx/taa.ts`, `compute/fluid.ts`, `tsl/.../FluidSimulation.ts`) with correct relative imports.
- [ ] Fix incorrect re-exports in engine stylized materials (`dissolve.ts`, `halftone.ts`, `hologram.ts`, `toon.ts`) to point at TSL sources.
- [ ] Correct `@tslstudio/tsl/index` import usage to `@tslstudio/tsl` and ensure type exports exist.
- [ ] Update tests importing from `dist/*.d` to target source modules.
- [ ] Verify FX preset imports pull from `@tslstudio/tsl/post/effects` (once barrel restored) instead of a single file.

## 2. Source parity verification
- [ ] Map each engine/tsl module to its origin in:
  - `RESOURCES/REPOSITORIES/TSLwebgpuExamples/roquefort-main`
  - `RESOURCES/REPOSITORIES/TSLwebgpuExamples/ssr-gtao-keio`
  - `RESOURCES/REPOSITORIES/TSLwebgpuExamples/ssgi-ssr-painter`
  - `RESOURCES/REPOSITORIES/TSLwebgpuExamples/three.js-tsl-sandbox-master`
  - `RESOURCES/REPOSITORIES/portfolio examples/*`
  - `RESOURCES/THREEJS_TSL_knowladge_DOCS/*`
- [ ] Document deviations (intentional tweaks, TypeScript adaptations) in `TSL-KIT/DOCS/PORT_DIFFERENCES.md`.
- [ ] Add automated diff script comparing shader strings (WGSL) against originals.

## 3. Unit test coverage
- [ ] Stabilize existing Vitest suites under `packages/**/__tests__`.
- [ ] Add unit tests for:
  - Framegraph resource lifecycle (`core/framegraph.ts`)
  - Temporal accumulation settings (`fx/temporalAccumulation.ts`)
  - Fluid operator bindings (`tsl/compute/simulation/fluid/operators/*`)
  - Material node helpers (`tsl/materials/pbr/*`)
- [ ] Track coverage thresholds (target ≥ 70% statements per package) in `vitest.config.ts`.

## 4. Integration & scenario tests
- [ ] Spin up minimal scenes validating:
  - Renderer init + auto-resize (`engine/core/renderer.ts`)
  - Full FX pipeline with TAA + SSR + GTAO + post presets
  - Particle system presets (flow field, turbulence, morphing)
  - Fluid simulation scenarios (`smoke`, `fire`, `spheres`, `vortex`)
- [ ] Create reproducible scripts under `packages/engine/examples/` with automated assertions (render targets, node graph state).
- [ ] Port reference demos from `portfolio examples` and `fragments-boilerplate` into regression scenes.

## 5. Visual & performance validation
- [ ] Capture GPU snapshots (via WebGPU capture or RenderDoc) for baseline demos.
- [ ] Implement screenshot regression harness (Playwright or Puppeteer) with threshold diffing.
- [ ] Record frame time budgets and memory metrics; fail CI if thresholds exceeded (60 FPS @ 1080p target).
- [ ] Add automated color buffer checks for tone mapping and LUT pipelines.

## 6. Tooling & CI pipeline
- [ ] Configure PNPM workspaces + `pnpm build` to emit usable `dist/` for both packages.
- [ ] Add linting/formatting (ESLint + Prettier) with CI enforcement.
- [ ] Wire Vitest, build, and visual regression jobs into GitHub Actions (or chosen runner).
- [ ] Publish canary package builds to local verdaccio for smoke testing.

## 7. Documentation & developer UX
- [ ] Update `TSLStudio — Comprehensive Development Plan v1.0.md` with real current-state section.
- [ ] Produce module reference sheets (inputs/outputs, shader layout) in `TSL-KIT/DOCS/api/`.
- [ ] Author “porting checklist” appendix covering validation steps after copying code from resources.
- [ ] Ensure README highlights new testing pipeline commands and acceptance criteria.

## 8. Outstanding feature gaps (cross-team follow-up)
- [ ] Expand material library beyond PBR + stylized (import remaining presets from resource repos).
- [ ] Flesh out compute modules (fluids, particles) with UI/inspector hooks.
- [ ] Implement missing screen-space effects (SSAO, motion blur) noted in project plan.
- [ ] Add website/studio package scaffolding or update docs to reflect current monorepo reality.

## 9. Tracking & reporting
- [ ] Maintain progress board (Notion/Jira) referencing checklist items above.
- [ ] Schedule weekly review comparing implementation vs resource parity.
- [ ] Capture QA runs (logs, screenshots, performance data) under `TSL-KIT/reports/`.

## References
- Project repo root: `/TSL-KIT`
- External resources: `/RESOURCES/REPOSITORIES/*`
- Three.js r181 docs: `/RESOURCES/THREEJS_TSL_knowladge_DOCS`
- Existing plans: `/TSL-KIT/DOCS/*.md`
