
# TSLStudio — TSL/WebGPU Toolkit Development Plan (v0.1)
Target repo: `artinkavousi/TSLSTUDIO/TSLStudio` (keep existing WebGPU pipeline; **do not** rewrite).

## 0) Core Principles
- **Don’t break the working base**: extend the existing fragments‑boilerplate‑derived setup with opt‑in packages.
- **TSL‑first**: use Three’s Node/TSL everywhere (materials, post‑FX, compute). WebGL fallback is out‑of‑scope for v0.
- **Plug‑and‑play**: every feature is a module with a tiny, composable API (`createX(opts) → { material | pass | node }`).
- **Agent‑friendly**: stable, declarative configs so a coding agent can mutate JSON and regenerate scenes safely.
- **R3F‑friendly** : thin React wrappers that only map props → options; logic lives in core TS modules.

## 1) Package Layout (proposed)
```
/TSLStudio
  /engine
    /core
      renderer.ts           # WebGPURenderer bootstrap, tone mapping, color spaces
      framegraph.ts         # Pass orchestration (post chain), ping-pong targets
      assets.ts             # Texture/HDRI loader helpers
      inspector.ts          # Minimal on-screen stats+graph debug
    /materials
      pbrStandard.ts        # baseline NodeMaterial with PBR knobs (metalness/roughness/ior)
      pbrClearcoat.ts       # addClearcoat(node) helper
      pbrSheen.ts           # addSheen(node)
      triplanar.ts          # tri-planar texture/splat utilities
      matcap.ts             # matcap node utils
      anisotropy.ts         # tangent-space anisotropy helper
      transmission.ts       # thin/thick transmission & dispersion
    /fx
      bloom.ts              # Kawase/dual-filter bloom
      dof.ts                # circle of confusion DOF
      taa.ts                # TAA jitter + history blend
      vignette.ts           # cheap vignette
      chromab.ts            # chromatic aberration
      filmgrain.ts          # noise/grain node
      colorgrading.ts       # 3D LUT + curves (ACES, sRGB, logC helpers)
      ssr.ts                # screen-space reflections (experimental)
    /compute
      particles.ts          # position/velocity compute step (verlet/euler)
      curlNoise.ts          # 3D curl field sampler
      sdf.ts                # signed-distance field ops, raymarch helper
      fluid2d.ts            # simple advection + pressure (toy scale; perf-guarded)
    /utils
      nodes.ts              # common node snippets: wsNormal, triPlanar, remap, saturate, safeNormalize, etc.
      env.ts                # PMREM/HDRI setup, exposure pipeline
      gui.ts                # Tweakpane/Leva bindings (optional)
    /r3f (later)
      <wrappers>.tsx
  /scenes
    demo-pbr.ts             # demo scene using pbrStandard + bloom + colorgrade
    demo-particles.ts       # compute particles + post
    demo-ssr.ts             # stress-test scene
  /schemas
    material.schema.json
    fxchain.schema.json
    compute.schema.json
  /types
  /docs
  /tests
```

## 2) Milestones & Checklist

### M0 — Repo Hygiene (1–2 days)
- [ ] Keep current `TSLStudio` structure; only **add** `engine/*` folder.
- [ ] Pin Three.js to r180± (same as your base). Add `three-ts-types` for better Node/TSL typing.
- [ ] Add `examples/*` scenes, a `playground` route, and a `Docs` route scaffold.
- [ ] Add ESLint+Prettier, tsconfig paths (`@engine/*`).

### M1 — Core Bootstrap
- [x] `renderer.ts`: WebGPURenderer init, color spaces, tone mapping, resize, msaa flag, HDR toggle.
- [x] `framegraph.ts`: define `Pass` interface `{ name, inputs, outputs, exec(ctx) }` and linear post chain with NodePass.
- [x] `assets.ts`: loaders (KTX2, EXR/HDR, LUT), cache, async progress signals.
- [x] `inspector.ts`: FPS, pass timings (if available), toggle to dump graph to console.

### M2 — Material Foundation
- [x] `pbrStandard.ts`: NodeMaterial with slots: `baseColor`, `normal`, `metalness`, `roughness`, `emissive`, `ao`, `opacity`, `clearcoat`, `sheen`, `anisotropy`, `transmission`.
- [x] `triplanar.ts` & `matcap.ts` util nodes.
- [x] `anisotropy.ts`, `clearcoat.ts`, `sheen.ts`, `transmission.ts` as additive helpers that return node patches.

### M3 — Post‑FX Stack
- [x] `bloom.ts`, `vignette.ts`, `filmgrain.ts`, `chromab.ts` (simple, stateless nodes/passes).
- [x] `colorgrading.ts` with 3D LUT support; include ACES→sRGB mapping utility.
- [x] `taa.ts` (temporal AA with Halton jitter + history blend node).
- [x] `dof.ts` (CoC + gather).

### M4 — Compute Modules
- [x] `particles.ts` with structured buffers; adapters for R3F instanced mesh.
- [x] `curlNoise.ts` and fields; feed particles.
- [x] `sdf.ts` basic ops + raymarch material.
- [x] (optional) `fluid2d.ts` toy grid (advection→pressure solve), behind feature flag.

### M5 — R3F Wrappers (thin)
- [ ] `<PBRStandard />`, `<Bloom />`, `<ColorGrading />`, `<Particles />` mapping props→core options.
- [ ] Keep logic in `engine/*` to allow vanilla usage.

### M6 — Agent API & Schemas
- [ ] JSON schemas for materials, post chains, and compute graphs.
- [ ] `applyConfig(scene, json)` to build a scene from declarative config safely.

### M7 — Docs & Demos
- [ ] `docs/` with recipes: triplanar, anisotropy, SSR caveats, TAA toggles.
- [x] `scenes/` demo pages + “Reset/Randomize” controls.

### M8 — QA & CI
- [ ] GPU feature detection (WebGPU fallback message).
- [ ] Perf budgets: frame time targets; quick toggles for FX off.
- [ ] Playwright screenshots for visual regressions (hashable seeds).

## 3) APIs (sketch)

```ts
// materials/pbrStandard.ts
export type PBRStandardOpts = {
  color?: Color | Node; metalness?: number | Node; roughness?: number | Node;
  normal?: Node; ao?: Node; emissive?: Node; ior?: number; transmission?: number | Node;
  clearcoat?: number | Node; sheen?: number | Node; anisotropy?: { strength: number, direction?: Node };
};
export function createPBRStandard(opts: PBRStandardOpts) {
  // returns { material: NodeMaterial, nodes: {...} }
}
```

```ts
// fx/bloom.ts
export function createBloom(opts: { threshold?: number; intensity?: number; radius?: number }) {
  // returns { pass, node }
}
```

```ts
// compute/particles.ts
export type ParticlesOpts = { count: number; spawn?: "grid" | "sphere"; bounds?: number; integrator?: "euler"|"verlet" };
export function createParticles(opts: ParticlesOpts) {
  // returns { buffers, step: (dt)=>void, mesh? }
}
```

## 4) Port/Extract Targets from RESOURCES
(Identify and adapt, keeping licenses and credits)
- **Fragments boilerplate bits**: Node/TSL patterns, post chains, utility nodes.
- **Codrops demos**: BatchedMesh + TSL post; WebGPU/TSL text destruction techniques.
- **Community snippets**: vertex/positionNode usage, SSR examples, TSL DOF/Bloom nodes.
- **Maxime Heckel’s field guide ideas**: compute uses, tone mapping tips.
- **three.js r180 WebGPU examples**: render targets, history buffers, Nodes conventions.

## 5) Known Pitfalls / Guardrails
- NodeMaterial/TSL APIs shift across r17x–r18x; pin version and wrap unstable bits.
- SSR + WebGPU is finicky (precision, normals); treat as experimental.
- TAA adds history lag—expose `strength`, `clamp`, `reset()` on camera cuts.
- Keep all compute buffer sizes power‑of‑two; add caps for low‑end GPUs.

## 6) Definition of Done (v0)
- `createPBRStandard`, `createBloom`, `createColorGrading`, `createParticles`, basic docs, and 2 demo scenes.
- All modules work in the existing `TSLStudio` project without refactors.
- R3F wrappers optional; vanilla TS works end‑to‑end.
