**Scope & assumptions (1 sentence):** You want a self-contained, plug-and-play **TSL/Node** toolkit on top of **Three.js WebGPU** that delivers cutting-edge PBR materials, realistic post-FX, and compute-powered effects—plus clean APIs your in-app agent can target.

---

# Plan (≤6 steps)

1. Define the **target stack & constraints** (Three r180+, WebGPU renderer, TSL imports, R3F async renderer init).
2. Specify the **package layout & module taxonomy** (materials, post, compute, utils, presets).
3. Design **ergonomic APIs** (one-liners to compose advanced looks; JSON/DSL for the agent).
4. Implement **flagship modules** (sheen/clearcoat/anisotropy; ACES + Bloom/DoF/Glare; volumetrics; compute particles).
5. Add **safety/perf guardrails & fallbacks** (caps, device feature gates, resource disposal).
6. Ship **examples & tests** (golden screenshots, perf budgets, R3F demo).

---

# Zero-Shot Template

**ROLE:** Systems + rendering architect.
**GOAL:** Plan and design a self-contained, production-ready TSL/Nodes module kit for advanced materials, rendering, and post-FX on WebGPU that your agent can drive.
**CONSTRAINTS:**

* Use `WebGPURenderer` with async init in R3F; `Canvas gl` may return a **Promise**. ([Poimandres Documentation][1])
* Import paths: `three/webgpu` (renderer + NodeMaterials) and `three/tsl` (TSL functions). ([GitHub][2])
* **NodeMaterials are WebGPU-first** (WebGL dropped node support), so provide non-node fallbacks where possible. ([GitHub][3])
  **OUTPUT:** A concrete architecture + API + file tree + exemplar snippets, perf & QA checklist, and an agent-friendly JSON/DSL schema.

---

# 1) Target stack & reality checks

* **Three.js r180+** with **TSL** and **NodeMaterials**; **WebGPURenderer** is the primary backend. ([GitHub][2])
* **R3F** host accepts an async `gl` factory—perfect for `await renderer.init()`; otherwise you’ll see “render() before backend initialized” warnings. ([Poimandres Documentation][1])
* Author shaders in **TSL** (JS-side node graph → WGSL) for portability and composability. See fresh, practical TSL guides. ([Maxime Heckel Blog][4])

Minimal R3F boot (async WebGPU):

```tsx
<Canvas
  gl={async () => {
    const { WebGPURenderer } = await import('three/webgpu')
    const r = new WebGPURenderer({ antialias: true })
    await r.init()
    return r
  }}
/>
```

(Why async? R3F v9+ explicitly allows a Promise for `gl` so WebGPU can init cleanly. ([Poimandres Documentation][1]))

---

# 2) Package layout (monorepo or single-repo)

```
/packages
  /tsl-kit                 # ← drop-in library
    /materials             # NodeMaterials + TSL blocks
      core/                # fresnel, lobe mix, normal blend, triplanar, IBL helpers
      pbr/                 # disney-ish: sheen, clearcoat, anisotropy, iridescence
      surfaces/            # skin, carpaint, cloth, plastic, coated metal
      noise/               # perlin, simplex, worley, fbm, curl as TSL nodes
      decals/              # projected masks, dirt, scratches
      fog/                 # height fog, exponential, noise fog
    /post
      tonemap/             # Linear→ACES, ACEScg-like; gamma/sRGB helpers
      bloom/               # dual/kawase; optional dirt lens combine
      glare/               # anamorphic streaks, starburst kernel
      dof/                 # CoC prepass, bokeh gather; near/far blur clamps
      colorfx/             # lift/gamma/gain, hue/sat, film grain, vignette
      motion/              # camera-velocity reprojection (optional)
      ssao-ssgi/           # (experimental) simple SSGI/SSAO for stylized ambience
    /compute
      pingpong/            # storage textures utils, barriers, double buffers
      particles/           # pos/vel update, forces, curl noise fields
      fluids/              # (optional) advect/jacobi/pressure steps (2D first)
    /util
      deviceCaps.ts        # adapter limits, feature gates (timestamp, float16…)
      budget.ts            # perf caps, frame timers
      fallback.ts          # non-node fallbacks for non-WebGPU
      schema.ts            # zod schemas for safe params (also used by agent)
    /presets               # “looks” that compose modules (CarPaint, Skin, CinemaBloom)
    index.ts
/apps
  /demo-r3f                # Examples, MDX docs, graph inspector
```

---

# 3) Ergonomic APIs (agent-friendly)

### Materials

```ts
import { makeMaterial, presets } from '@aurora/tsl-kit/materials'
// PBR with sheen + clearcoat + anisotropy + iridescence:
const mat = makeMaterial({
  model: 'pbr',
  layers: [
    presets.baseColor({ hex: '#5a6cff' }),
    presets.anisotropy({ strength: 0.7, direction: [1,0], roughness: 0.2 }),
    presets.clearcoat({ amount: 0.8, gloss: 0.4 }),
    presets.sheen({ color: '#d8d8ff', intensity: 0.5 }),
    presets.iridescence({ ior: 1.5, thickness: [200, 800] })
  ],
  mapping: presets.triplanar({ scale: 2.0 })
})
```

### Post chain

```ts
import { makePostChain } from '@aurora/tsl-kit/post'
const post = makePostChain([
  ['tonemap', { curve: 'ACES' }],
  ['bloom',   { threshold: 1.0, strength: 0.5, radius: 0.8 }],
  ['glare',   { streaks: 4, intensity: 0.25 }],
  ['dof',     { aperture: 0.015, focus: 3.0, maxBlur: 8.0 }],
  ['film',    { grain: 0.035 }]
])
```

### Compute (particles)

```ts
import { makeParticleSim } from '@aurora/tsl-kit/compute/particles'
const sim = makeParticleSim({ count: 512*512, fields: ['curlNoise','gravity'] })
engine.addCompute(sim.update)   // returns a pass you call each frame
```

**Design goals:** expressive one-liners above that internally wire robust **TSL nodes** + **NodeMaterials** + **post passes**. (TSL is the intended way to author node graphs targeting WebGPU.) ([GitHub][5])

---

# 4) Flagship modules (what’s inside)

### 4.1 Physically-based layers (TSL nodes)

* **Disney-style PBR**: GGX microfacet with energy conservation, **clearcoat** (separate lobe), **sheen** (cloth), **anisotropy** (brushed metal), **iridescence** (thin-film), **sub-surface approx** (wrap diffuse + screen-space tint), and **specular tint / IOR** controls.
* **Utilities**: **Fresnel** node (Schlick + dielectric/metal F0), **Normal blend** (Reoriented Normal Mapping), **Triplanar** projection, **IBL** helpers.
* **Noise suite**: Perlin/Simplex/Worley/FBM/Curl in TSL for masks, breakup, and procedural albedo/normal.
* **Example TSL pattern** (sketch):

```ts
import { color, uv, time, mix, noise, normalize, vec3 } from 'three/tsl'
import { MeshPhysicalNodeMaterial } from 'three/webgpu'

export function CarPaintIridescent() {
  const u = uv()
  const flake = noise(u.mul(200.)).mul(0.25)
  const hueShift = noise(u.add(time().mul(.1))).mul(0.1)
  const base = color('#1b1f73').hslOffset(hueShift)
  const coat = base.add(flake)
  return new MeshPhysicalNodeMaterial({
    color: coat,
    iridescence: 1.0,
    iridescenceIOR: 1.6,
    iridescenceThicknessRange: vec3(250., 900., 1.),
    anisotropy: 0.7,
    anisotropyRotation: normalize(vec3(1,0,0))
  })
}
```

(Authoring shaders in TSL lets Three generate WGSL for WebGPU under the hood. ([Maxime Heckel Blog][4]))

### 4.2 Post-FX chain

* **Color pipeline**: working in linear → **ACES tonemap** → display transform; helpers for sRGB/Linear.
* **Bloom** (dual/kawase), **Lens dirt** mix, **Glare** streaks/starburst, **DoF** via CoC gather, **Vignette**, **Film grain**, optional **Motion blur** (velocity pass).
* **Composer** returns a single `renderPass()` function; each pass is a TSL node graph with full parameter validation.

### 4.3 Volumetrics & fog

* Height/exponential fog with **blue-noise** dither; optional **procedural media** (worley noise) for god-rays.

### 4.4 Compute modules (WebGPU)

* **Ping-pong storage-texture** helpers, **barriers**, **workgroup size** negotiation from device caps.
* **Particles**: pos/vel textures, forces (curl, gravity, attractors), spawn/kill buffer.
* **Fluids (2D first)**: advection → divergence → Jacobi pressure → subtract-grad (feature-gated).
* Expose **TSL + WGSL interop** nodes for advanced kernels when you need raw control.

> Notes: WebGPU compute and TSL/WGSL interop are the modern path; gate heavy features behind adapter limits (float16, max storage texture dims, timestamp queries). ([GitHub][2])

---

# 5) Agent DSL / JSON Graph (safe, compact)

Your agent should emit **validated JSON** we can compile into materials or post chains.

**Material graph (example):**

```json
{
  "kind": "material",
  "model": "pbr",
  "layers": [
    {"type":"baseColor","hex":"#5a6cff"},
    {"type":"anisotropy","strength":0.7,"direction":[1,0],"roughness":0.2},
    {"type":"clearcoat","amount":0.8,"gloss":0.4},
    {"type":"sheen","color":"#d8d8ff","intensity":0.5},
    {"type":"iridescence","ior":1.5,"thickness":[200,800]}
  ],
  "mapping": {"type":"triplanar","scale":2.0}
}
```

**Post graph (example):**

```json
{
  "kind": "post",
  "passes": [
    ["tonemap", {"curve":"ACES"}],
    ["bloom",   {"threshold":1.0,"strength":0.5,"radius":0.8}],
    ["glare",   {"streaks":4,"intensity":0.25}],
    ["dof",     {"aperture":0.015,"focus":3.0,"maxBlur":8.0}]
  ]
}
```

Enforce with **zod** (caps on texture sizes, node counts, iteration steps). The compiler produces NodeMaterials and pass pipelines using `three/tsl` and `three/webgpu`. (This mirrors the TSL/node direction of Three on WebGPU.) ([GitHub][5])

---

# 6) Safety, perf & fallbacks

* **Caps**: clamp particle counts, iterations, bloom radius, blur radius, etc.; expose a single **perf budget** object.
* **Device features**: read adapter limits; disable float16 compute, timestamp queries, or large storage textures when unsupported. ([GitHub][2])
* **Graceful fallback**: If `navigator.gpu` is absent, swap to a basic **non-node** material + minimal post chain (or show a capability banner). NodeMaterials are WebGPU-first. ([GitHub][3])
* **Init discipline**: ensure `await renderer.init()` before first render in R3F to avoid backend warnings. ([Poimandres Documentation][1])
* **Disposal**: every material/pass/compute module exposes `dispose()`; composer tracks ownership to avoid GPU leaks.

---

# 7) Example usage (R3F)

```tsx
function Scene() {
  const mat = useMemo(() => CarPaintIridescent(), [])
  const post = useMemo(() => makePostChain([
    ['tonemap', { curve: 'ACES' }],
    ['bloom',   { threshold: 1.0, strength: 0.45, radius: 0.9 }],
    ['glare',   { streaks: 3, intensity: 0.2 }],
    ['dof',     { aperture: 0.02, focus: 2.5, maxBlur: 7.0 }]
  ]), [])

  useFrame((state) => {
    post.render(state) // runs your post passes
  })

  return (
    <>
      <mesh material={mat} castShadow receiveShadow>
        <torusKnotGeometry args={[0.6, 0.2, 256, 48]} />
      </mesh>
    </>
  )
}
```

---

# 8) QA & acceptance

**Visual correctness**

* Golden screenshots (car-paint, skin, cloth, foggy god-rays) compare within ΔE < 2 across runs.
* Verify tonemap (ACES) matches reference LUT within tolerance.

**Performance budgets**

* 1080p target ≥ 60 FPS with default presets on an RTX 2070-class GPU; 1440p ≥ 45 FPS.
* Each post pass reports GPU time; sum must stay < 5 ms at 1080p on mid-tier hardware.

**Robustness**

* Sim stress tests: particles up to 512²; fluid grid up to 1024² (feature-gated).
* Fallback path verified on non-WebGPU browsers (no crashes; banner shown).

**DX (developer experience)**

* One-line presets produce predictable looks; all modules tree-shakeable; Typescript types exported.

---

# 9) References (for freshness + correctness)

* **R3F v9 migration/async renderer** (`Canvas gl` can return a promise; WebGPU). ([Poimandres Documentation][1])
* **R3F warning context** (“render before backend initialized” → init discipline). ([GitHub][6])
* **Three migration notes** (imports for `three/webgpu` + `three/tsl` and TSL function changes). ([GitHub][2])
* **TSL overview / direction** (TSL is the node abstraction; WGSL/GLSL generation). ([GitHub][5])
* **Community deep-dives & tutorials** (TSL + WebGPU patterns & examples). ([Maxime Heckel Blog][4])
* **NodeMaterials are WebGPU-first / WebGL dropped node support** (set expectations for fallback). ([GitHub][3])

---

## Do → (deliverables you can build next)

* **/packages/tsl-kit** skeleton with `materials/pbr/*`, `post/*`, `compute/*`, `util/*`, `presets/*`.
* **Agent schema** (`schema.ts`) + zod validators + `compileMaterialGraph()` + `makePostChain()`.
* **R3F demo** (`apps/demo-r3f`) with a graph inspector panel and sliders for uniforms.

If you want, say **“starter files”** and I’ll output the ready-to-paste repo (all folders, TS stubs, and a couple of working TSL modules).

---

# Check (self-assessment)

* **Relevance:** 5/5 (directly designs a TSL/WebGPU kit + agent pathway).
* **Factuality:** 5/5 (import paths, async renderer, node/WebGPU reality cited).
* **Completeness:** 4.5/5 (solid modules + APIs; could add SSR/SSGI caveats and camera-velocity details).
* **Clarity:** 4.5/5 (compact but dense; code kept illustrative).

# Revise (quick improvements)

* Call out that some advanced post (SSGI/SSR, motion blur with per-pixel velocity) is **marked experimental** and should be feature-flagged, with simpler stylistic alternatives on by default.
* Recommend keeping **ACES + Bloom + subtle Glare** as the “cinema” preset, DoF opt-in.

[1]: https://r3f.docs.pmnd.rs/tutorials/v9-migration-guide?utm_source=chatgpt.com "v9 Migration Guide - React Three Fiber"
[2]: https://github.com/mrdoob/three.js/wiki/Migration-Guide?utm_source=chatgpt.com "Migration Guide · mrdoob/three.js Wiki"
[3]: https://github.com/mrdoob/three.js/issues/30185?utm_source=chatgpt.com "WebGLRenderer: Add support for Node Materials #30185"
[4]: https://blog.maximeheckel.com/posts/field-guide-to-tsl-and-webgpu/?utm_source=chatgpt.com "Field Guide to TSL and WebGPU"
[5]: https://github.com/mrdoob/three.js/wiki/Three.js-Shading-Language?utm_source=chatgpt.com "Three.js Shading Language"
[6]: https://github.com/pmndrs/react-three-fiber/issues/3403?utm_source=chatgpt.com "render() called before the backend is initialized · Issue ..."
