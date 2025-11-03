# WebGPU + TSL Ecosystem (JavaScript / TypeScript, Three.js r180+)

## 1. Overview
This document is a curated, JS-only map of the **WebGPU + Three.js + TSL** landscape as of **Oct 31, 2025**.  
Focus:
- Three.js **r180+** (with `three/webgpu` and TSL)
- **TSL / NodeMaterial** modules
- **Post-processing** on WebGPU
- **Compute / GPGPU** in TSL
- **React / Svelte** integrations (R3F, Threlte)
- **Open source first**, but includes notable **commercial / cloud** tools

> Why this matters: TSL is now the main way to author shaders in Three.js, and WebGPU is the target renderer. A lot of older WebGL-only libs either don’t work or only partially work — so this list highlights what is either working today or clearly moving toward WebGPU.

---

## 2. Core Stack (What to use right now)

- **Three.js r180+**  
  - Renderer: `WebGPURenderer`  
  - Shading: **TSL (Three Shading Language)**  
  - Materials: `MeshStandardNodeMaterial`, `MeshPhysicalNodeMaterial`  
  - Notes:
    - NodeMaterials are **WebGPU-first**; WebGL node support was removed in earlier releases.
    - TSL auto-outputs WGSL (for WebGPU) or GLSL (for WebGL) under the hood.
    - Many official examples now live under `examples/webgpu_*`.

- **React Three Fiber (R3F) v9+**  
  - Supports **async `gl`**: you can return a Promise that resolves to a `WebGPURenderer`
  - Pattern:
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
  - This avoids the classic “render before backend initialized” issue.

- **Threlte 8+ (Svelte + Three)**  
  - Similar pattern: pass a factory that creates a WebGPU renderer
  - Good for SvelteKit-based dashboards or editors.

---

## 3. TSL Modules & Shader Helpers

### 3.1 Official / Built-In (Three.js)
- **TSL core**: math, vector/matrix ops, textures, UV transforms
- **Lighting / PBR nodes**: environment, normal, view, fresnel, clearcoat
- **Renderflow-aware nodes**: MRT, depth, normals
- **Custom code**: TSL lets you embed small functions and reuse them

### 3.2 Community / Open Source

#### A. TSL Textures
- **Repo:** `boytchev/tsl-textures`
- **What it is:** procedural textures generated fully on GPU using TSL
- **Why it’s useful:** instant library of patterns/masks you can plug into NodeMaterials
- **Status:** active, JS/TS, works with recent Three
- **Use cases:** dirt masks, camouflage, marble, clouds, animated textures

#### B. TSLFX
- **Repo:** `verekia/tslfx`
- **What it is:** a *shader FX kit* for TSL — SDF shapes, shockwaves, VFX primitives
- **Why it’s useful:** gives you ready-made TSL building blocks to “punch up” materials
- **Extras:** exported nodes + uniforms, so easy to integrate into an agent / JSON-graph
- **License:** MIT

#### C. Visual / Node Editors for TSL
1. **tsl-editor (bhushan6/tsl-editor)**
   - Browser-based, open source
   - Builds TSL graphs visually
   - Exports JS (TSL code) with node layout comments
2. **three.js-visual-node-editor (bandinopla/three.js-visual-node-editor)**
   - Similar idea, alpha-quality
   - Goal: ready-made shaders + export
   - Good as a base if you want to embed a visual editor in *your* WebGPU app

---

## 4. Post-Processing on WebGPU

### 4.1 Use First: Three.js WebGPU Postprocessing (official examples)
- Chained passes using TSL
- Supports MRT + depth/normal taps
- Has working **Bloom**, **Tone mapping**, **DOF**, **simple AO**
- All authored in TSL → ideal for an *agent* to generate

### 4.2 R3F WebGPU PostFX Starters
- Example: R3F + WebGPURenderer + Bloom demo
- Shows the correct async-init pattern
- Good for copying project structure

### 4.3 pmndrs/postprocessing (current status)
- Still mostly WebGL
- Watch for WebGPU updates
- For now: use official Three + TSL passes if you want guaranteed WebGPU

---

## 5. Compute & GPGPU (WebGPU + TSL)

### 5.1 Core pattern
1. Create storage buffers / storage textures
2. Write a TSL `compute(...)` kernel
3. Run it every frame (or N frames)
4. Feed the output into a NodeMaterial or instanced mesh

### 5.2 Good references
- **Codrops “Interactive Text Destruction” (TSL + WebGPU)**  
  - Shows storage buffers + compute + animation fully in JS
  - Excellent template for particle / vertex animation

- **GPGPU Particles (TSL)**  
  - TSL compute updates a texture of particle positions
  - Render with Points + NodeMaterial

- **WebGPU fluid / particles repos**  
  - 2D fluid solver examples (JS, pure WebGPU)
  - Can be ported to TSL to get automatic bindings

---

## 6. Scene / Framework Integrations

### 6.1 React
- R3F v9+ recommended
- Drei can be used but some helpers are still WebGL-first
- Best pattern: **your engine is headless (TSL + compute + materials)** and R3F is just the host

### 6.2 Svelte
- Threlte 8+ supports WebGPU
- Good if you want SvelteKit + editor UI

---

## 7. Commercial / Cloud (still useful)

### 7.1 NodeToy
- Visual shader editor for Three/R3F
- Exports materials via NPM package
- Not TSL-first (yet) but easy to prototype looks
- Good to *train your agent* on patterns

### 7.2 Polygonjs
- Three-based visual editor
- Mostly GLSL / WebGL today
- Can be used as a “design/previs” tool and then hand-ported to TSL

---

## 8. Agent-Friendly JSON / DSL (pattern)
Your agent should emit something like:

```json
{
  "kind": "material",
  "model": "pbr",
  "layers": [
    { "type": "baseColor", "hex": "#5a6cff" },
    { "type": "clearcoat", "amount": 0.8 },
    { "type": "sheen", "color": "#d8d8ff", "intensity": 0.5 },
    { "type": "iridescence", "ior": 1.5, "thickness": [200, 800] }
  ],
  "mapping": { "type": "triplanar", "scale": 2.0 }
}
```

Then a JS/TS “compiler” turns this into real TSL+NodeMaterial.

---

## 9. What to Watch / Evolving
- Three.js examples under `webgpu_...` (they add more every release)
- pmndrs/postprocessing for WebGPU parity
- TSLFX / TSLTextures for new nodes
- R3F + WebGPU blog posts (for correct async init)
