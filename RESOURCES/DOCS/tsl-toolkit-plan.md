# Aurora TSL/WebGPU Toolkit Architecture

## 1. Stack Reality Check

- Runtime targets **Three.js r180+** with the `WebGPURenderer` as the primary backend; all materials use **NodeMaterials** authored through **TSL**.
- Import split: `three/webgpu` provides renderer, node-capable materials, and post infrastructure; `three/tsl` exposes graph primitives (`color`, `vec3`, `mix`, noise nodes, etc.).
- React Three Fiber (`@react-three/fiber` v9+) supports async renderer factories. Always return a Promise that resolves after `await renderer.init()` to avoid “render() before backend initialized” warnings.
- NodeMaterials run WebGPU-first. Offer minimal non-node fallbacks (e.g., `MeshPhysicalMaterial`) for environments without `navigator.gpu`, but do not regress feature fidelity when WebGPU is available.
- Structure shader logic as composable TSL node graphs so they can target WGSL automatically and remain serializable for the agent DSL.

```tsx
import { Canvas } from '@react-three/fiber'

<Canvas
  gl={async () => {
    const { WebGPURenderer } = await import('three/webgpu')
    const renderer = new WebGPURenderer({ antialias: true })
    await renderer.init()
    return renderer
  }}
/>
```

## 2. Package Layout & Module Taxonomy

```
/packages
  /tsl-kit
    index.ts
    /materials
      index.ts
      /core          # Fresnel, BRDF lobes, triplanar, normal utilities, IBL helpers
      /pbr           # Disney layers: sheen, clearcoat, anisotropy, iridescence, sss approx
      /surfaces      # Preset builders: skin, car paint, cloth, plastics, coated metals
      /noise         # Perlin, simplex, worley, fbm, curl noise nodes
      /decals        # Projection masks, scratches, dirt accumulation nodes
      /fog           # Height, exponential, noise-driven volumetric fog nodes
    /post
      index.ts
      tonemap/       # ACES, filmic, gamma helpers
      bloom/         # Dual/Kawase bloom, dirt lens mix, mip chain reuse
      glare/         # Anamorphic streaks and starburst kernels
      dof/           # Circle-of-confusion prepass, bokeh gather composer
      colorfx/       # Lift/gamma/gain, hue-sat, LUT support, vignette, film grain
      motion/        # Camera velocity reprojection, optional per-pixel velocity
      ssao-ssgi/     # Stylized ambient occlusion & GI (experimental)
    /compute
      index.ts
      pingpong/      # Storage texture ping-pong management, barriers, workgroup helpers
      particles/     # Position/velocity updates, force fields, spawn/kill logic
      fluids/        # 2D fluids core: advect, divergence, Jacobi, pressure solve (feature gated)
    /util
      deviceCaps.ts  # Adapter limits, feature detection, float16/timestamp gates
      budget.ts      # Frame timing, pass instrumentation, perf caps
      fallback.ts    # Minimal WebGL/standard material fallbacks and warnings
      schema.ts      # Zod schemas for agent JSON DSL and runtime validation
      graph.ts       # Compile JSON DSL into TSL graphs and NodeMaterials/post passes
    /presets
      materials/     # Named material looks (CarPaintIridescent, SatinCloth, StylizedSkin)
      post/          # CinematicBloom, GameHDR, DepthFocus, StylizedFilm
      compute/       # Particle swarms, curl field presets
    /inspector       # Optional UI helpers for debugging node graphs (tree view, uniforms)
/apps
  /demo-r3f          # R3F playground, Leva/Tweakpane controls, screenshot harness
```

Dependencies:

- `materials/*` feeds presets and exports NodeMaterial builders consumed by app code.
- `post/*` composes passes through `makePostChain` (see below), relying on `util/deviceCaps` for feature gating.
- `compute/*` modules depend on `util/deviceCaps` and `util/budget` to size storage textures and instrument GPU time.
- `util/schema` is shared by CLI tooling, runtime validation, and the agent interface.

## 3. Ergonomic APIs & Agent Schema

### TypeScript API Surface

- `makeMaterial(spec: MaterialGraphSpec, opts?: CompileOptions): MeshPhysicalNodeMaterial`
- `makeMaterialLayers(layers: LayerSpec[]): NodeBuilder` for manual composition.
- `makePostChain(passes: PostPassDescriptor[], opts?: PostChainOptions): PostComposer`
- `createParticleSim(config: ParticleSimConfig): ParticleSimulation`
- `loadPreset('materials', name)` / `loadPreset('post', name)` / `loadPreset('compute', name)` for tree-shakeable preset bundles.
- All APIs return objects exposing `update(params)`, `dispose()`, and structured typing to ease automation.

```ts
import { makeMaterial } from '@aurora/tsl-kit/materials'
import { makePostChain } from '@aurora/tsl-kit/post'
import { createParticleSim } from '@aurora/tsl-kit/compute'

const carPaint = makeMaterial({
  model: 'pbr',
  layers: [
    { type: 'baseColor', hex: '#1b1f73' },
    { type: 'anisotropy', strength: 0.7, direction: [1, 0], roughness: 0.2 },
    { type: 'clearcoat', amount: 0.85, gloss: 0.45 },
    { type: 'sheen', color: '#d8d8ff', intensity: 0.5 },
    { type: 'iridescence', ior: 1.6, thickness: [250, 900] }
  ],
  mapping: { type: 'triplanar', scale: 2 }
})

const postChain = makePostChain([
  ['tonemap', { curve: 'ACES' }],
  ['bloom', { threshold: 1.0, strength: 0.5, radius: 0.85 }],
  ['glare', { streaks: 4, intensity: 0.25 }],
  ['dof', { aperture: 0.018, focus: 2.8, maxBlur: 7.5 }]
])

const particles = createParticleSim({
  count: 512 * 512,
  fields: [
    { type: 'curlNoise', amplitude: 0.6, frequency: 0.8 },
    { type: 'gravity', direction: [0, -1, 0], strength: 0.25 }
  ],
  spawn: { rate: 1000, lifetime: [1.5, 3.5] }
})
```

### Agent-Facing JSON DSL

- Schemas live in `util/schema.ts` (zod). All numeric parameters have bounds derived from `util/budget` caps.
- DSL supports `kind: 'material' | 'post' | 'compute'`. Additional `kind: 'pipeline'` may wrap combined material + post setups.
- Graph compiler (`util/graph.ts`) converts JSON to TSL node graphs and validates referenced blocks/presets.

```json
{
  "kind": "material",
  "model": "pbr",
  "layers": [
    { "type": "baseColor", "hex": "#5a6cff" },
    { "type": "normalMix", "sources": ["flake", "macro"], "weights": [0.6, 0.4] },
    { "type": "clearcoat", "amount": 0.8, "gloss": 0.45 },
    { "type": "sheen", "color": "#d8d8ff", "intensity": 0.5 }
  ],
  "mapping": { "type": "triplanar", "scale": 2.0 },
  "ibl": { "type": "envLUT", "intensity": 1.2 }
}
```

```json
{
  "kind": "post",
  "passes": [
    ["tonemap", { "curve": "ACES" }],
    ["bloom", { "threshold": 1.0, "strength": 0.45, "radius": 0.85 }],
    ["glare", { "streaks": 4, "intensity": 0.25 }],
    ["film", { "grain": 0.035, "temperature": 0.0 }],
    ["dof", { "aperture": 0.018, "focus": 2.8, "maxBlur": 7.0 }]
  ]
}
```

## 4. Flagship Module Design

### 4.1 PBR Material Stack

- Base BRDF: GGX microfacet distribution with Smith masking-shadowing, energy conservation, and `f90` sheen control.
- Layer blocks:
  - **Clearcoat**: second specular lobe with fixed IOR (~1.5), adjustable roughness, optionally tinted F0; uses separate normal input for dual normal map blending.
  - **Sheen**: fabric response using Charlie distribution; exposes color/intensity and integrates with albedo for energy compensation.
  - **Anisotropy**: directional roughness with rotation node; relies on tangent frame derived via TSL or triplanar projection.
  - **Iridescence**: thin-film interference via thickness range and view-dependent Fresnel.
  - **Subsurface approx**: wrap diffuse + screen-space color bleed, optional thickness map sampling.
- Utility nodes: Fresnel (Schlick + dielectric override), triplanar sampler (with mip bias), reoriented normal map blend, multi-octave noise for breakup.

```ts
import { color, uv, time, mix, smoothstep, vec3 } from 'three/tsl'
import { MeshPhysicalNodeMaterial } from 'three/webgpu'
import { fresnelDielectric, triplanarNormal } from '@aurora/tsl-kit/materials/core'

export function carPaintIridescent(): MeshPhysicalNodeMaterial {
  const baseUV = uv()
  const flakeNoise = smoothstep(0.4, 0.95, baseUV.mul(200).hash())
  const dynamicHue = mix(color('#1528a3'), color('#7f5afd'), flakeNoise)
  const coatNormal = triplanarNormal(baseUV.mul(6))

  return new MeshPhysicalNodeMaterial({
    colorNode: dynamicHue,
    roughnessNode: mix(0.08, 0.2, flakeNoise),
    clearcoatNode: vec3(0.8),
    clearcoatRoughnessNode: 0.05,
    anisotropyNode: 0.65,
    anisotropyRotationNode: vec3(1, 0, 0),
    iridescenceNode: fresnelDielectric(1.6),
    iridescenceIORNode: 1.6,
    iridescenceThicknessRange: vec3(250, 900, 1),
    normalNode: coatNormal
  })
}
```

### 4.2 Post-Processing Chain

- Composer wraps WebGPU render pass encoder creation and tracks color buffers.
- Core passes:
  - **Tonemap**: linear → ACES/Filmic; optional exposure control. Pre-pass ensures correct color space conversions.
  - **Bloom**: dual-filtered mip chain with adaptive radius; optional lens dirt texture combine.
  - **Glare**: anisotropic separable blur for streaks plus starburst kernel overlay; intensity normalized.
  - **Depth of Field**: Circle of Confusion (CoC) pass writes near/far blur radius; gather pass uses hexagonal bokeh kernel.
  - **Color FX**: film grain (blue-noise driven), vignette, lift/gamma/gain, channel mixer.
  - **Motion blur**: optional pass requiring velocity buffers; gated by device limits.
- Pass descriptors stored as composable nodes so the agent can toggle them at runtime.

```ts
postChain.render(({ scene, camera, renderer, target }) => {
  composer.begin({ renderer, target })
  composer.renderScene({ scene, camera })
  composer.apply('bloom')
  composer.apply('glare')
  composer.apply('dof', { focus: 2.8 })
  composer.apply('tonemap')
  composer.end()
})
```

### 4.3 Volumetrics & Fog

- **Height fog**: distance-based falloff combining height density curve and view ray march (4–8 steps) with blue-noise jitter.
- **Exponential fog**: straightforward density parameter, integrates with volumetric lighting for god rays.
- **Procedural media**: Worley + Perlin combo for volumetric clouds; uses low-resolution 3D textures (feature gated by storage limits).
- Outputs participate in post pipeline via dedicated fog pass before tonemapping.

### 4.4 Compute Modules

- **Ping-Pong Utilities**: manage storage texture double buffers, command encoder barriers, and workgroup sizing using adapter limits.
- **Particle simulation**:
  - Position/velocity textures (RGBA16F by default, fall back to RGBA32F if float16 unsupported).
  - Force fields include curl noise, gravity, turbulence textures, attractors; fields defined as TSL nodes compiled to WGSL compute shaders.
  - Spawn/kill buffers keep particle counts stable; simulation exposes `update(delta)` for frame stepping.
- **2D Fluid solver** (optional/feature gated):
  - Standard Stable Fluids steps (advect → diffuse via Jacobi iterations → project).
  - Uses shared ping-pong utilities and clamps iteration counts via perf caps.
- Compute modules emit profiling hooks for GPU timestamp queries where supported.

```ts
const particleSim = createParticleSim({
  count: 256 * 256,
  workgroupSize: [8, 8, 1],
  fields: [
    { type: 'curlNoise', amplitude: 0.4, frequency: 1.2 },
    { type: 'attractor', position: [0, 0.5, 0], strength: 0.8, falloff: 1.5 }
  ]
})

function useParticles() {
  useFrame((_, delta) => particleSim.update(delta))
  return particleSim.getBindings()
}
```

## 5. Safety, Performance, and Fallback Strategy

- **Device caps**: Query adapter limits once; expose capabilities (`maxTextureDimension2D`, `supportsFloat16`, `supportsTimestamp`). Auto-scale particle counts, blur radii, and volumetric resolution to respect limits.
- **Perf budgets**: `util/budget` stores global targets (e.g., post ≤5 ms at 1080p). Each pass records GPU/CPU time; warn when thresholds exceeded and suggest parameter reduction.
- **Feature gates**: Heavy modules (fluid solver, per-pixel velocity, SSAO/SSGI) require explicit opt-in and check capabilities before enabling.
- **Fallbacks**: When WebGPU unavailable, use standard Three materials with basic tonemap or skip passes silently; log structured warning for the agent. Never remove advanced features on WebGPU path.
- **Resource lifecycle**: All builders return handles with `dispose()` methods that release GPUBuffer/Texture, remove event listeners, and unregister from the composer. Post chain tracks ownership to avoid leaks.
- **Error surfaces**: Zod validation errors provide actionable messages; runtime asserts guard against NaN/Inf in shader parameters.

## 6. QA, Examples, and Next Steps

- **Golden visuals**: Capture baseline screenshots (car paint, skin, cloth, volumetric god rays) at 1080p. Compare ΔE < 2 using perceptual diff tooling during CI.
- **Performance regression tests**: Run automated scenes on representative GPUs (RTX 2070, RTX 3060, M2). Fail CI when frame time or GPU pass duration exceeds budgets by >10%.
- **Demo app**: `apps/demo-r3f` with async WebGPU init, orbit controls, preset browser, Leva dashboard for layer/post tuning, compute inspector (particle counts, timings).
- **Agent integration tests**: Feed DSL JSON fixtures through `compileMaterialGraph` and `makePostChain`; ensure deterministic material/post outputs and schema validation errors for invalid graphs.
- **Experimental flags**: Mark SSR/SSGI, per-pixel velocity motion blur, and 3D volumetric clouds as `beta`. Provide stylistic alternatives (screen-space ambient pass, simple camera-based blur) as default safe presets.
- **Roadmap**: Add spectral rendering hooks, environment importance sampling cache, meshlet-based culling, and GPU-driven impostor baking in future iterations.

## 7. Implementation Snapshot (Oct 2025)

- Workspace bootstrapped with PNPM monorepo, shared `tsconfig`, linting, and documentation (`README.md`).
- `packages/tsl-kit` implements:
  - `util/schema` zod validators for material/post/compute JSON DSL.
  - `util/graph` runtime compilers generating `MeshPhysicalNodeMaterial`, Post chains, and WebGPU compute pipelines (particles WGSL prototype).
  - `materials`, `post`, `compute`, and `presets` modules with Disney-style materials, cinematic post chain, and curl-noise particle spec.
  - `util/deviceCaps`, `budget`, `fallback` helpers for adapter limits, perf tracking, and WebGL fallback material.
- `apps/demo-r3f` Vite/R3F playground using async WebGPU renderer init, Leva controls, particle simulation, and tonemapped bloom chain.
- Next steps: deepen post-processing implementations (true bloom/glare kernels), extend compute presets, add CI golden capture harness, and wire agent integration tests.


