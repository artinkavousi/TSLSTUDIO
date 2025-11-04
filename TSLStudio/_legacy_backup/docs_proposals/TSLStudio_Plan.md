
# TSLStudio v1 — Plan, Architecture & TODOs
**Date:** 2025‑11‑03 (America/Toronto)  
**Repo:** `artinkavousi/TSLSTUDIO`  C:\Users\ARTDESKTOP\Desktop\CODE\.website\TSLStudio\TSLStudio
**Base:** `TSLStudio     // (its a modified copy of RESOURCES/portfolio examples/fragments-boilerplate-main)//

## 0) Vision (TL;DR)
Build a **self‑contained, plug‑and‑play TSL/Node toolkit on top of Three.js WebGPU** that ships:
- Production‑ready PBR node materials & layered shading presets.
- A minimal **Post‑FX graph** (bloom, tonemap, DOF, vignette, film grain) written in TSL.
- **Compute helpers** (ping‑pong buffers, prefix‑sum, particle kernels, SDF ops).
- Clean, stable **Engine APIs** that your in‑app agent can target (create scene, add material by id, wire post stack, run compute step).
- **R3F & vanilla** entrypoints with identical features (no lock‑in).
- **Examples & golden tests** that render screenshots on CI to catch regressions.

> Sources informing this plan: Fragments boilerplate tech stack (Vite, R3F, Drei, Leva, Zustand, Maath), official TSL docs and editor examples, and recent TSL/WebGPU guides.


## 1) Architecture Overview
```
TSLStudio/
├─ packages/
│  ├─ core/                       # Renderer bootstrap + device caps + fallbacks
│  │  ├─ renderer.ts              # WebGPU renderer w/ graceful WebGL fallback
│  │  ├─ deviceCaps.ts            # feature flags (float textures, storage, etc.)
│  │  └─ frameLoop.ts             # fixed/variable timestep, raf controls
│  ├─ tsl-kit/                    # Reusable TSL nodes, materials, FX, computes
│  │  ├─ materials/
│  │  │  ├─ LayeredPBR.ts         # clearcoat, sheen, iridescence nodes
│  │  │  ├─ SkinPBR.ts            # subsurface-ish approximation in TSL
│  │  │  └─ ToonPBR.ts            # artists’ toon PBR hybrid
│  │  ├─ fx/
│  │  │  ├─ TonemapACES.ts
│  │  │  ├─ Bloom.ts              # multi-pass separable blur, threshold node
│  │  │  ├─ DOF.ts
│  │  │  └─ VignetteFilm.ts
│  │  ├─ compute/
│  │  │  ├─ PingPong.ts           # abstraction over two storage textures
│  │  │  ├─ Particles.ts          # advect + collide (grid/SDF hooks)
│  │  │  └─ SDFOps.ts             # union/intersect/smooth ops in TSL compute
│  │  ├─ utils/
│  │  │  ├─ TextureUtils.ts       # storage/float formats, mip gen
│  │  │  └─ Graph.ts              # framegraph-style pass orchestration
│  │  └─ index.ts                 # single import surface for the kit
│  ├─ r3f-adapter/
│  │  ├─ <TSLCanvas>.tsx          # createRenderer(WebGPU) example + fallback
│  │  ├─ hooks.ts                 # usePostGraph, useKitMaterial, useComputeStep
│  │  └─ components.tsx           # <PostGraph>, <Particles>, preset <Material/>
│  └─ vanilla-adapter/
│     ├─ init.ts                  # minimal non-React bootstrap
│     └─ components.ts            # JS helpers mirroring R3F components
├─ apps/
│  ├─ studio/                     # your Fragments-derived playground app
│  │  ├─ scenes/
│  │  │  ├─ ShowcaseBasic.tsx     # spheres + PBR presets + post stack
│  │  │  └─ ParticlesFlow.tsx     # compute demo
│  │  └─ ui/ (Leva/Tweakpane)     # parameter panels
│  └─ examples/                   # tiny, single-purpose demos (TSX/JS)
└─ tests/
   ├─ render/                     # headless snapshots (puppeteer + pixel diff)
   └─ unit/                       # node-level unit tests
```

### Renderer strategy
- Prefer **WebGPURenderer** when available; **fallback to WebGL** seamlessly.
- Normalize formats (RGBA16F/32F) & caps detection; configure nodes accordingly.
- Deterministic frame loop (fixed step for compute; variable for rendering).

### Post‑FX graph
- Declarative **Graph** that manages intermediate storage textures and pass ordering.
- Each pass is a TSL node/Material with `.inputs` / `.outputs` and a `render()`.
- Ship a compact default stack: `LinearizeDepth → Bloom → DOF → TonemapACES → VignetteFilm`.

### Compute helpers
- Ping‑pong & barriers abstracted; easy `update(dt)` API.
- Particle kernel (advect/orbit/flow) + room for SDF collisions later.
- Reusable **SDFOps** for future field effects.

### API surface (agent-friendly)
```ts
Engine.create({ canvas, antialias?: boolean });
Engine.addMaterial('layeredPBR', params);
Engine.setPostStack(['bloom','dof','aces','vignette'], params);
Engine.addParticles({ count, kernel: 'flow' }, params);
Engine.on('frame', (ctx) => { /* custom TSL uniforms updates */ });
```
Stable IDs, plain JSON params, no TS types required by the caller.

## 2) Versioning & Compatibility
- Target **three@r180+** (TSL stabilized vs earlier r17x).  
- Respect WebGPU status across browsers; auto‑fallback to WebGL where missing.  
- Keep **R3F & vanilla** in parity (identical features, shared core).

## 3) Initial Implementation (Milestone M1)
**Goal:** Bootable skeleton with one material, one post‑pass, one compute demo.

**Deliverables**
1. `packages/core/renderer.ts` — WebGPU bootstrap + fallback; exports `createRenderer`.
2. `packages/tsl-kit/materials/LayeredPBR.ts` — base metallic/roughness + clearcoat.
3. `packages/tsl-kit/fx/TonemapACES.ts` — filmic tonemap as TSL node material.
4. `packages/tsl-kit/compute/PingPong.ts` — storage-texture ping‑pong helper.
5. R3F demo scene `ShowcaseBasic.tsx` using the above (+ Leva panel).
6. CI: build + lint + **visual snapshot** (one golden PNG).

**Stretch**: simple **Bloom** pass.

## 4) Detailed TODOs
### A) Core
- [ ] `createRenderer(canvas, { antialias })` with WebGPU→WebGL fallback
- [ ] `deviceCaps` detect: float formats, storage textures, bgra vs rgba, limits
- [ ] `frameLoop` with fixed Δt for compute (e.g., 1/120) and accumulator

### B) TSL Materials
- [ ] `LayeredPBR`: base + clearcoat (ior, thickness, roughness), normal strength
- [ ] `SkinPBR`: SSS approx (wrap diffuse + tinted transmission)
- [ ] `ToonPBR`: step diff + rim node + matcap blend

### C) Post‑FX (TSL)
- [ ] `TonemapACES`
- [ ] `Bloom`: threshold + two-pass separable blur + composite
- [ ] `DOF`: coc calc + gather
- [ ] `VignetteFilm`: vignette + film grain noise

### D) Compute
- [ ] `PingPong` helper
- [ ] `Particles` kernel (flow/advection)
- [ ] `SDFOps` (placeholders for M2)

### E) Adapters
- [ ] R3F `<TSLCanvas>` with `createRenderer`
- [ ] Hooks: `usePostGraph`, `useComputeStep`
- [ ] Vanilla `init(canvas)` mirror

### F) Examples
- [ ] `ShowcaseBasic` (PBR + post)
- [ ] `ParticlesFlow` (compute demo)
- [ ] Minimal vanilla example

### G) Tooling & CI
- [ ] ESLint/Prettier/TypeCheck
- [ ] Playwright/Puppeteer render test → PNG compare
- [ ] GitHub Actions workflow

## 5) Code Stubs (copy‑paste starting points)

### `packages/core/renderer.ts`
```ts
import { WebGPURenderer, WebGLRenderer } from 'three';
export type Renderer = WebGPURenderer | WebGLRenderer;

export function createRenderer(canvas: HTMLCanvasElement, opts: { antialias?: boolean } = {}): Renderer {
  const hasWebGPU = (globalThis as any).navigator?.gpu;
  if (hasWebGPU) {
    const r = new WebGPURenderer({ canvas, antialias: opts.antialias ?? true });
    // @ts-ignore — init required for WebGPU
    if (r.init) { /* await not needed here; caller may .init() if exposed */ }
    return r;
  }
  const r = new WebGLRenderer({ canvas, antialias: opts.antialias ?? true });
  r.outputColorSpace = (r as any).outputColorSpace || (window as any).THREE?.SRGBColorSpace;
  return r;
}
```

### `packages/tsl-kit/fx/TonemapACES.ts`
```ts
import { tslFn, vec3, float, mul, clamp } from 'three/tsl';
// Simple ACES-ish curve (approx)
export const tonemapACES = tslFn((c = vec3()) => {
  const a = float(2.51), b = float(0.03), d = float(2.43), e = float(0.59), f = float(0.14);
  const num = c.mul(a).add(b);
  const den = c.mul(d).add(e).add(f);
  return num.div(den).clamp(0.0, 1.0);
});
export default tonemapACES;
```

### `packages/tsl-kit/compute/PingPong.ts`
```ts
export class PingPong<T extends { texture: any }> {
  read: T; write: T;
  constructor(a: T, b: T) { this.read = a; this.write = b; }
  swap() { const t = this.read; this.read = this.write; this.write = t; }
}
```

### R3F Canvas helper (adapter)
```tsx
import { Canvas } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import { createRenderer } from '@tslstudio/core/renderer';

export function TSLCanvas({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => { if (ref.current) createRenderer(ref.current); }, []);
  return <Canvas frameloop="always" gl={(canvas) => createRenderer(canvas as HTMLCanvasElement)}>{children}</Canvas>;
}
```

## 6) Integration with Fragments Boilerplate
- Keep the Fragments base (Vite, R3F, Drei, Leva, Zustand, Maath).  
- Add `packages/` workspace and path aliases; expose `@tslstudio/*` imports.  
- Replace app scene with `ShowcaseBasic` to validate materials + post stack.

## 7) Risk Notes
- **WebGPU churn**: breaking changes likely; keep a WebGL fallback.  
- **TSL API drift**: lock to `three@r180+` and keep a renovate bot for updates.  
- **Headless CI** on WebGPU is limited; prefer WebGL snapshots for now.

## 8) References
- Fragments boilerplate tech stack and purpose.  
- Three.js TSL docs + TSL editor example.  
- Maxime Heckel — Field Guide to TSL & WebGPU (2025‑10‑14).  
- Threlte note on WebGPU maturity & fallback guidance.

---

### Milestone Checklist (copy into GitHub Projects)
- [ ] M1: Boot skeleton (renderer, ACES, demo, CI PNG)
- [ ] M2: Bloom + Particles kernel + Params UI
- [ ] M3: DOF + SDFOps + SkinPBR
- [ ] M4: Agent API surface & tests + Docs site

