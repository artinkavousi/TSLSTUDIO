# Complete WebGPU & TSL Ecosystem Guide
## Three.js r180+ — Libraries, Tools, Architecture & Implementation

**Version:** 1.0  
**Last Updated:** October 31, 2025  
**Scope:** JavaScript / TypeScript ecosystem for WebGPU + TSL (Three.js Shading Language)

---

## Table of Contents

1. [Overview & Introduction](#1-overview--introduction)
2. [Core Stack & Setup](#2-core-stack--setup)
3. [Library Catalog](#3-library-catalog)
   - [TSL Modules & Shader Helpers](#31-tsl-modules--shader-helpers)
   - [Post-Processing Libraries](#32-post-processing-libraries)
   - [Compute & GPGPU](#33-compute--gpgpu)
   - [Scene Frameworks & Templates](#34-scene-frameworks--templates)
   - [Visual Editors & Tools](#35-visual-editors--tools)
4. [Architecture & Design Patterns](#4-architecture--design-patterns)
5. [Agent-Friendly JSON/DSL](#5-agent-friendly-jsondsl)
6. [Implementation Guide](#6-implementation-guide)
7. [Best Practices & Performance](#7-best-practices--performance)
8. [Resources & References](#8-resources--references)

---

## 1. Overview & Introduction

### 1.1 What This Document Covers

This is a **comprehensive, curated catalog** of the WebGPU + Three.js + TSL landscape as of October 2025. It serves as:

- **Library Index**: All active OSS libraries, tools, and commercial solutions
- **Architecture Guide**: Proven patterns for building WebGPU engines
- **Implementation Reference**: Code examples, setup patterns, and integration guides
- **Agent/Automation Playbook**: JSON schemas and DSLs for programmatic material/effect generation

### 1.2 Why This Matters

**Three.js Shading Language (TSL)** is now the primary way to author shaders in Three.js r180+:
- **Renderer-agnostic**: TSL automatically generates WGSL (WebGPU) or GLSL (WebGL)
- **Composable**: Build materials as node graphs instead of string-based shaders
- **Type-safe**: Write shaders in JavaScript/TypeScript with full IDE support
- **GPU-first**: NodeMaterials are designed for WebGPURenderer

**WebGPU** brings:
- Native compute shaders for particles, physics, simulations
- Better performance and lower overhead
- Modern graphics features (storage textures, indirect draw, etc.)

**The Shift**: Many older WebGL-only libraries don't work or only partially work with WebGPU. This guide highlights what's **working today** or **clearly moving toward WebGPU**.

### 1.3 Target Audience

- Developers building advanced 3D web apps with Three.js r180+
- Teams integrating WebGPU rendering into React/Svelte/Vue
- Engineers building material/effect authoring tools
- AI/Agent developers needing structured 3D graphics APIs

---

## 2. Core Stack & Setup

### 2.1 Essential Stack (Use Right Now)

#### Three.js r180+
```bash
npm install three@latest
```

**Key modules:**
- `three/webgpu` - WebGPURenderer, NodeMaterials, PostProcessing
- `three/tsl` - TSL functions (color, vec3, mix, noise, etc.)

**Import pattern:**
```typescript
import { WebGPURenderer } from 'three/webgpu'
import { color, uv, texture, mix } from 'three/tsl'
import { MeshPhysicalNodeMaterial } from 'three/webgpu'
```

**Critical Notes:**
- NodeMaterials are **WebGPU-first** (WebGL node support was removed in r172)
- Always use `await renderer.init()` before first render
- Most official examples now live under `examples/webgpu_*`

#### React Three Fiber v9+ (Optional)

For React integration:
```bash
npm install @react-three/fiber@latest
```

**Async WebGPU pattern:**
```tsx
import { Canvas } from '@react-three/fiber'

<Canvas
  gl={async () => {
    const { WebGPURenderer } = await import('three/webgpu')
    const renderer = new WebGPURenderer({ antialias: true })
    await renderer.init()
    return renderer
  }}
>
  {/* Your scene */}
</Canvas>
```

**Why async?** R3F v9+ allows returning a Promise from `gl`, which prevents the "render() before backend initialized" warning.

#### Alternative Frameworks

**Threlte 8+ (Svelte):**
```svelte
<script>
import { Canvas } from '@threlte/core'
import { WebGPURenderer } from 'three/webgpu'

async function createRenderer() {
  const renderer = new WebGPURenderer({ antialias: true })
  await renderer.init()
  return renderer
}
</script>

<Canvas createRenderer={createRenderer}>
  <!-- scene -->
</Canvas>
```

**TresJS (Vue 3):**
```vue
<template>
  <TresCanvas :renderer-options="{ gl: webgpuRenderer }">
    <!-- scene -->
  </TresCanvas>
</template>
```

### 2.2 Version Compatibility Matrix

| Package | Minimum Version | Notes |
|---------|----------------|-------|
| three.js | r180 | TSL + WebGPU stable |
| @react-three/fiber | v9.0 | Async `gl` support |
| @threlte/core | v8.0 | WebGPU renderer support |
| @tresjs/core | Latest | WebGPU compatible |

### 2.3 Device Requirements

**Browser Support (Oct 2025):**
- Chrome/Edge 113+: ✅ Stable
- Firefox: 🟡 Beta (behind flag)
- Safari: 🟡 Limited (macOS/iOS)

**Feature Detection:**
```typescript
async function checkWebGPU() {
  if (!navigator.gpu) {
    console.warn('WebGPU not supported')
    return false
  }
  
  try {
    const adapter = await navigator.gpu.requestAdapter()
    return !!adapter
  } catch (e) {
    return false
  }
}
```

---

## 3. Library Catalog

### 3.1 TSL Modules & Shader Helpers

#### A. TSL Textures (boytchev/tsl-textures)

**★ 210 | Last Updated: Oct 2025**

Collection of real-time **procedural 3D textures** using TSL.

**Features:**
- Procedural texture generators as reusable TSL nodes
- Patterns: polka dots, bricks, camouflage, clouds, marble, wood
- Easy integration with WebGPURenderer
- Works with both WebGPU and WebGL backends
- Published on NPM: `tsl-textures`
- MIT License

**Installation:**
```bash
npm install tsl-textures
```

**Usage Example:**
```typescript
import { camouflage } from 'tsl-textures'
import { MeshPhysicalNodeMaterial } from 'three/webgpu'

const material = new MeshPhysicalNodeMaterial({
  colorNode: camouflage()
})
```

**Links:**
- GitHub: https://github.com/boytchev/tsl-textures
- Demo: https://boytchev.github.io/tsl-textures/
- NPM: https://www.npmjs.com/package/tsl-textures

---

#### B. TSLFX (verekia/tslfx)

**★ 94 | Last Updated: Oct 2025**

Growing TSL shader toolkit offering **VFX primitives, SDFs, and utilities** for NodeMaterials.

**Features:**
- VFX Primitives: `impact()` shockwave, energy fields, distortions
- SDF Library: Signed Distance Functions (circle, heart, etc.) ported from Inigo Quilez
- Math utilities and noise helpers
- Works with WebGPURenderer (falls back to WebGL via WGSL→GLSL transpilation)
- MIT Licensed
- 100+ commits, actively maintained
- Vanilla JS and React examples included

**Installation:**
```bash
npm install tslfx
```

**Usage Example:**
```typescript
import { impact, sdCircle } from 'tslfx'
import { uv, time, mix } from 'three/tsl'

// Create shockwave effect
const shockwave = impact({
  center: uv(),
  time: time(),
  strength: 0.5
})

// Use SDF for masking
const circleMask = sdCircle(uv().sub(0.5), 0.3)
```

**Links:**
- GitHub: https://github.com/verekia/tslfx
- Examples: https://github.com/verekia/tslfx/tree/main/examples

---

#### C. Three.js Built-in TSL (Core)

**Version: r180+ | Official**

Three.js's native TSL API and node helper functions.

**Features:**
- Complete shader graph API integrated with WebGPU
- GLSL-inspired functions: `uv()`, `texture()`, `mix()`, `smoothstep()`
- Math operations: vector/matrix ops, noise, hash
- Automatic WGSL/GLSL code generation
- Common sub-expression elimination (shared computations)
- MaterialX loader support (experimental)
- All standard PBR materials have node equivalents

**Key Node Types:**
- **Input Nodes**: position, normal, uv, color, time
- **Math Nodes**: add, mul, mix, clamp, smoothstep
- **Texture Nodes**: texture, cubeTexture, normalMap
- **Lighting Nodes**: lights, BRDF, clearcoat, sheen
- **Utility Nodes**: code(), fn() for custom GLSL/WGSL

**Example:**
```typescript
import { color, texture, mix, uv } from 'three/tsl'

const colorMap = texture(colorTexture)
const detailMap = texture(detailTexture)
const uvCoord = uv()

// Simple TSL expression
material.colorNode = colorMap.mul(detailMap).mul(color('#ff6b35'))
```

**Documentation:**
- https://threejs.org/docs/#manual/en/introduction/TSL
- https://github.com/mrdoob/three.js/wiki/Three.js-Shading-Language

---

### 3.2 Post-Processing Libraries

#### A. Three.js WebGPU PostProcessing (Core)

**Version: r180+ | Official**

Built-in post-processing system using NodeMaterials and TSL.

**Features:**
- Declarative post-processing pipeline via TSL nodes
- Multiple render targets (MRT) and passes
- Effects as nodes: `DepthOfFieldNode`, `BloomNode`, `FXAANode`
- Single-pass chain composition (replaces old EffectComposer)
- Automatic WebGL2 fallback via multi-render targets
- Integrated with WebGPURenderer

**Available Effects (r180+):**
- Tone Mapping (ACES, Filmic, Reinhard)
- Bloom / Glow
- Depth of Field (Bokeh)
- FXAA / TAA
- Ground Truth Ambient Occlusion (GTAO)
- Color Grading
- Film Grain / Vignette

**Usage Pattern:**
```typescript
import { PostProcessing } from 'three/webgpu'
import { bloom, tonemap } from 'three/tsl'

const postProcessing = new PostProcessing(renderer)
postProcessing.outputColorTransform = false

// Chain passes
const bloomPass = bloom({ threshold: 1.0, strength: 0.5 })
const tonemapPass = tonemap({ exposure: 1.0 })
```

**Examples:**
- https://threejs.org/examples/?q=webgpu#webgpu_postprocessing_dof
- https://threejs.org/examples/?q=webgpu#webgpu_postprocessing_bloom

**Forum Reference:**
- https://discourse.threejs.org/t/how-to-utilize-webgpu-is-nodes-the-best-option/50162

---

#### B. PostProcessing (pmndrs)

**★ 2.6k | Last Updated: Aug 2023**

Popular post-processing library (originally by Vanruesc, now pmndrs).

**Features:**
- Wide range of effects: glitch, bloom, SSAO, god rays, bokeh
- `EffectComposer` with modular passes
- `EffectPass` merges multiple effects for performance
- Configurable blend modes, auto HDR handling
- Frame buffer type control (HalfFloatType, FloatType)

**Current Status:**
- **Primarily targets WebGL**
- WebGPU support is in progress (not production-ready as of Oct 2025)
- Some effects (like N8AO) note "not yet compatible with WebGPU"

**Recommendation:** For WebGPU projects, use Three.js native PostProcessing. Watch this library for future WebGPU updates.

**Links:**
- GitHub: https://github.com/pmndrs/postprocessing
- Docs: https://pmndrs.github.io/postprocessing/

---

#### C. R3F WebGPU Post-Processing Starters

**Various repositories | 2025**

Community examples showing Three.js WebGPU post-processing in React.

**Notable Example: ektogamat/r3f-webgpu-starter**
- ★ 185
- Demonstrates WebGPU + R3F + PostProcessing
- Includes bloom and other effects
- Shows async renderer init pattern
- Good boilerplate for new projects

**Usage:**
```tsx
import { Canvas } from '@react-three/fiber'
import { PostProcessing } from 'three/webgpu'

function Scene() {
  useFrame((state) => {
    // Render with post-processing
    postProcessing.render(state.scene, state.camera)
  })
  
  return <mesh>...</mesh>
}
```

**Links:**
- https://github.com/ektogamat/r3f-webgpu-starter

---

### 3.3 Compute & GPGPU

#### A. Three.js Compute Nodes (Core)

**Version: r180+ | Official**

Built-in GPU compute support via TSL and WebGPURenderer.

**Features:**
- Write compute shaders in TSL (no raw WGSL needed)
- `storage()` node for GPU buffers
- `compute()` for kernel execution
- Automatic binding and uniform management
- Particle systems, physics, data transforms
- Replaces old `GPUComputationRenderer` hacks
- WebGL fallback via transform feedback

**Example - Particle Update:**
```typescript
import { storage, compute, uniform } from 'three/tsl'

const positionBuffer = storage(new Float32Array(count * 3), 'vec3', count)
const velocityBuffer = storage(new Float32Array(count * 3), 'vec3', count)
const deltaTime = uniform(0.016)

const computeKernel = compute(() => {
  const id = instanceIndex
  const pos = positionBuffer.element(id)
  const vel = velocityBuffer.element(id)
  
  // Simple physics
  vel.y = vel.y.sub(deltaTime.mul(9.8)) // gravity
  const newPos = pos.add(vel.mul(deltaTime))
  
  positionBuffer.element(id).assign(newPos)
  velocityBuffer.element(id).assign(vel)
}, count)
```

**Examples:**
- https://threejs.org/examples/?q=webgpu#webgpu_compute_particles
- https://threejs.org/examples/?q=webgpu#webgpu_compute_particles_rain

**Tutorial:**
- https://discourse.threejs.org/t/how-to-utilize-webgpu-is-nodes-the-best-option/50162

---

#### B. Roquefort (WebGPU Fluid Simulator)

**★ 65 | Last Updated: Apr 2025**

Real-time **fluid dynamics simulation** using WebGPU compute shaders.

**Features:**
- 2D/3D fluid simulation fully on GPU
- Pressure solve, advection, vorticity
- Multigrid solver for performance
- Interactive demo with Three.js + WebGPU
- Pure compute pipeline (good reference architecture)
- AGPL-3.0 license (requires open-sourcing derivatives)

**Technical Details:**
- Uses compute shaders for all fluid steps
- Storage textures for velocity/pressure fields
- Ping-pong buffers for stable iteration
- No Three.js dependency (pure WebGPU)

**Use Case:** Study this for advanced GPGPU patterns, then adapt to TSL for Three.js integration.

**Links:**
- GitHub: https://github.com/Bercon/roquefort
- Demo: https://bercon.github.io/roquefort/

---

#### C. GPGPU Tutorials & Examples

**Interactive Text Destruction (Codrops, Jul 2025)**

TSL compute shader animating thousands of text vertices.

**Key Techniques:**
- `storage(geometry.attributes.position, "vec3", count)` for vertex data
- TSL `compute()` function with spring physics
- Frame-by-frame GPU updates
- Explosion/destruction effect

**Links:**
- https://tympanus.net/codrops/2025/07/22/interactive-text-destruction-with-three-js-webgpu-and-tsl/

**GPGPU Particles with TSL (WawaSensei)**

Tutorial: hundreds of thousands of particles forming 3D shapes.

**Approach:**
- Float texture or storage buffer for state
- NodeMaterial for point rendering
- Compute node for position updates

**Links:**
- https://wawasensei.dev/courses/react-three-fiber/lessons/tsl-gpgpu

**Particle Life Simulation (WebGPU)**

Pure WebGPU example (not Three.js) showing compute-driven particle interactions.

**Links:**
- https://lisyarus.github.io/blog/posts/particle-life-simulation-in-browser-using-webgpu.html

---

### 3.4 Scene Frameworks & Templates

#### A. React Three Fiber (R3F)

**★ 29.7k | Last Updated: Oct 2025**

React renderer for Three.js with full WebGPU support.

**Features:**
- Declarative scene creation in JSX
- Full Three.js r180+ compatibility
- WebGPU via async `gl` prop
- Hooks for animation, events, state
- No performance penalty (renders outside React)
- Supports concurrent React features
- Huge ecosystem (drei, postprocessing, etc.)

**Basic Setup:**
```tsx
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'

function App() {
  return (
    <Canvas
      gl={async () => {
        const { WebGPURenderer } = await import('three/webgpu')
        const r = new WebGPURenderer({ antialias: true })
        await r.init()
        return r
      }}
    >
      <ambientLight intensity={0.5} />
      <mesh>
        <boxGeometry />
        <meshStandardNodeMaterial color="orange" />
      </mesh>
      <OrbitControls />
    </Canvas>
  )
}
```

**NodeMaterial in JSX:**
```tsx
<meshStandardNodeMaterial colorNode={customColorNode} />
```

**Links:**
- GitHub: https://github.com/pmndrs/react-three-fiber
- Docs: https://docs.pmnd.rs/react-three-fiber
- v9 Migration Guide: https://r3f.docs.pmnd.rs/tutorials/v9-migration-guide

---

#### B. Threlte (Svelte 3D)

**★ 3.1k | Last Updated: Oct 2025**

Svelte framework for Three.js with declarative, reactive API.

**Features:**
- Three.js objects as Svelte components (`<T.Mesh>`)
- Reactive Svelte stores for parameters
- WebGPU support via renderer factory
- Extensions for physics (Rapier), animation (Theatre.js)
- Clean Svelte DX with auto-updates

**Setup:**
```svelte
<script>
import { Canvas } from '@threlte/core'
import { WebGPURenderer } from 'three/webgpu'
import * as THREE from 'three'
import { extend } from '@threlte/core'

extend(THREE)

async function createWebGPURenderer() {
  const renderer = new WebGPURenderer()
  await renderer.init()
  return renderer
}
</script>

<Canvas createRenderer={createWebGPURenderer}>
  <T.Mesh>
    <T.BoxGeometry />
    <T.MeshStandardNodeMaterial color="hotpink" />
  </T.Mesh>
</Canvas>
```

**Note:** WebGPU in Three is still experimental, so Threlte marks it as not production-ready yet.

**Links:**
- GitHub: https://github.com/threlte/threlte
- Docs: https://threlte.xyz
- WebGPU Guide: https://threlte.xyz/docs/learn/advanced/webgpu

---

#### C. TresJS (Vue 3)

**★ 3.3k | Last Updated: Oct 2025**

Vue 3 integration for Three.js (inspired by R3F).

**Features:**
- Declarative Three.js in Vue SFCs
- Components: `<TresCanvas>`, `<TresMesh>`, `<TresPointLight>`
- Reactive props update Three objects automatically
- Official plugins for post-processing and Nuxt
- Full Three.js feature support (WebGPU, TSL)

**Setup:**
```vue
<template>
  <TresCanvas>
    <TresPerspectiveCamera :position="[3, 3, 3]" />
    <TresMesh>
      <TresBoxGeometry />
      <TresMeshStandardNodeMaterial color="#ff6b35" />
    </TresMesh>
    <TresAmbientLight :intensity="0.5" />
  </TresCanvas>
</template>

<script setup lang="ts">
import { TresCanvas } from '@tresjs/core'
</script>
```

**Links:**
- GitHub: https://github.com/Tresjs/tres
- Docs: https://docs.tresjs.org
- Website: https://tresjs.org

---

#### D. Three.js TSL Starter (Bruno Simon)

**★ 76 | Last Updated: Jun 2023**

Minimalist boilerplate for learning TSL.

**Features:**
- Pre-configured Vite + Three r18x
- WebGPURenderer setup
- NodeMaterial examples
- Reference links for GLSL→TSL conversion
- Clean project structure focused on shader code

**Use Case:** Perfect starting point for TSL experiments.

**Links:**
- GitHub: https://github.com/brunosimon/three.js-tsl-template

---

### 3.5 Visual Editors & Tools

#### A. NodeToy (Commercial/Beta)

**Status: Free Beta (Closed Source)**

Cloud-based visual shader editor for Three.js and R3F.

**Features:**
- Web-based node graph interface
- 150+ nodes for material creation
- Share and fork shader graphs
- Export via `@nodetoy/three-nodetoy` runtime
- Collaborative editing
- Hosted shaders (server-based)

**Integration:**
```bash
npm install @nodetoy/three-nodetoy
```

```typescript
import { NodeToyMaterial } from '@nodetoy/three-nodetoy'

const material = new NodeToyMaterial({
  url: 'https://nodetoy.co/api/graph/YOUR_GRAPH_ID'
})

// Update dynamic uniforms
material.tick(deltaTime)
```

**Current Limitations:**
- Closed source (no self-hosting)
- Requires internet connection
- Outputs GLSL (not native TSL yet)
- Shader graphs stored on NodeToy servers

**Pricing:** Free in beta; commercial model TBD.

**Links:**
- Website: https://nodetoy.co
- Integration: https://github.com/NodeToy/three-nodetoy
- Forum: https://discourse.threejs.org/t/nodetoy-the-ultimate-web-shader-graph-editor-for-threejs-and-react-three-fiber/38844

---

#### B. TSL Editor (bhushan6)

**★ 25 | Last Updated: Mar 2025**

Experimental **browser-based node editor** for TSL materials.

**Features:**
- Visual TSL graph creation
- Live preview
- Basic node support
- Code export (in progress)
- Node layout stored in generated code comments
- Built on NODL framework
- Open source (MIT)

**Status:** Alpha—only fundamental nodes, lacks code export.

**Links:**
- GitHub: https://github.com/bhushan6/tsl-editor
- Demo: https://tsl-editor.vercel.app
- Forum: https://discourse.threejs.org/t/node-editor-for-tsl/76355

---

#### C. Three.js Visual Node Editor (bandinopla)

**★ 48 | Last Updated: Mar 2025**

Open-source graph editor for Three TSL.

**Features:**
- Visual node graph creation
- Export as JavaScript/TypeScript files
- Node layout embedded in comments (re-importable)
- Similar to ComfyUI's graph storage approach
- MIT licensed
- Alpha release, seeking community contributions

**Innovation:** Stores graph metadata inside generated code for round-trip editing.

**Links:**
- GitHub: https://github.com/bandinopla/three.js-visual-node-editor
- Forum: https://discourse.threejs.org/t/tsl-visual-node-editor-alpha-release/80387

---

#### D. Polygonjs (Open Source Editor)

**★ 759 | Last Updated: Jul 2025**

Node-based **3D content creation tool** (like Houdini for the browser).

**Features:**
- Visual editor for materials, geometry, particles, scenes
- Node contexts: MAT (materials), SOP (geometry), COP (compositing)
- Exports projects as Three.js code
- Extensible via plugins (physics, face tracking)
- Community and commercial tiers
- MIT licensed (core)

**WebGPU Status:** Currently uses GLSL/WebGL; WebGPU planned.

**Use Case:** Great for prototyping workflows, then hand-port to TSL.

**Links:**
- GitHub: https://github.com/polygonjs/polygonjs
- Editor: https://polygonjs.com

---

#### E. Three.js Plus (Utsubo)

**Status: Waitlist (Commercial)**

Upcoming commercial library targeting WebGPU.

**Promised Features:**
- Advanced effects bundle (fluids, boids, PBR materials)
- Custom geometry, compute shaders
- Material nodes, post-process nodes
- Regular updates with cutting-edge visuals
- Subscription-based

**Status:** In development; join waitlist for access.

**Links:**
- Website: https://www.threejs-plus.com

---

## 4. Architecture & Design Patterns

### 4.1 Production Engine Structure

Recommended modular layout for a TSL/WebGPU engine:

```
/engine
  /core
    renderer.webgpu.ts        # WebGPURenderer init, caps
    resources.ts              # Texture/buffer management
    frame.ts                  # RAF loop, delta time
  /materials
    /core                     # Fresnel, BRDF, triplanar, normals
    /pbr                      # Disney layers: sheen, clearcoat, anisotropy
    /surfaces                 # Presets: skin, car paint, cloth
    /noise                    # Perlin, simplex, worley, FBM
    /decals                   # Projection masks, dirt, scratches
    /fog                      # Height fog, exponential, volumetric
  /post
    chain.ts                  # Post-processing pipeline
    /passes
      tonemap.tsl.ts
      bloom.tsl.ts
      dof.tsl.ts
      glare.tsl.ts
      colorfx.tsl.ts
  /compute
    pingpong.ts               # Storage buffer utilities
    particles.ts              # Particle simulation
    fluids2d.ts               # 2D fluid solver
  /util
    deviceCaps.ts             # Adapter limits, feature detection
    budget.ts                 # Performance tracking
    fallback.ts               # WebGL fallback materials
    schema.ts                 # Zod schemas for validation
    graph.ts                  # JSON→TSL compiler
  /presets
    materials/                # Named looks
    post/                     # Effect chains
    compute/                  # Simulation configs
  /inspector                  # Debug UI (optional)
```

### 4.2 Core TSL Patterns

#### Material Composition

```typescript
import { color, uv, texture, mix, smoothstep, vec3 } from 'three/tsl'
import { MeshPhysicalNodeMaterial } from 'three/webgpu'

export function createCarPaint() {
  const baseUV = uv()
  
  // Procedural flakes
  const flakeNoise = smoothstep(0.4, 0.95, baseUV.mul(200).hash())
  
  // Color variation
  const baseColor = color('#1b1f73')
  const flakeColor = color('#7f5afd')
  const finalColor = mix(baseColor, flakeColor, flakeNoise)
  
  // Triplanar normal (helper function)
  const normal = triplanarNormal(baseUV.mul(6))
  
  return new MeshPhysicalNodeMaterial({
    colorNode: finalColor,
    roughnessNode: mix(0.08, 0.2, flakeNoise),
    clearcoatNode: vec3(0.8),
    clearcoatRoughnessNode: 0.05,
    anisotropyNode: 0.65,
    iridescenceNode: 1.0,
    iridescenceIORNode: 1.6,
    iridescenceThicknessRange: vec3(250, 900, 1),
    normalNode: normal
  })
}
```

#### Post-Processing Chain

```typescript
import { PostProcessing } from 'three/webgpu'
import { bloom, tonemap, vignette } from 'three/tsl'

export function createPostChain(renderer) {
  const post = new PostProcessing(renderer)
  
  // Build chain
  post.add(bloom({ threshold: 1.0, strength: 0.5, radius: 0.85 }))
  post.add(tonemap({ curve: 'ACES', exposure: 1.0 }))
  post.add(vignette({ offset: 0.5, darkness: 0.8 }))
  
  return post
}
```

#### Compute Particles

```typescript
import { storage, compute, uniform, instanceIndex } from 'three/tsl'

export function createParticleSystem(count) {
  // Storage buffers
  const positions = storage(new Float32Array(count * 3), 'vec3', count)
  const velocities = storage(new Float32Array(count * 3), 'vec3', count)
  
  // Uniforms
  const deltaTime = uniform(0.016)
  const curlScale = uniform(3.5)
  const gravity = uniform(-0.3)
  
  // Compute kernel
  const updateParticles = compute(() => {
    const id = instanceIndex
    const pos = positions.element(id)
    const vel = velocities.element(id)
    
    // Curl noise force
    const curl = curlNoise3D(pos.mul(curlScale))
    
    // Physics
    const newVel = vel.add(curl).add(vec3(0, gravity, 0).mul(deltaTime))
    const newPos = pos.add(newVel.mul(deltaTime))
    
    // Update storage
    positions.element(id).assign(newPos)
    velocities.element(id).assign(newVel)
  }, count)
  
  return { updateParticles, positions, velocities }
}
```

### 4.3 PBR Material Layers

**Disney-Style PBR Stack:**

- **Base BRDF**: GGX microfacet, Smith masking-shadowing, energy conservation
- **Clearcoat**: Second specular lobe, separate normal, adjustable roughness
- **Sheen**: Fabric response (Charlie distribution), color/intensity control
- **Anisotropy**: Directional roughness, rotation control, tangent frame
- **Iridescence**: Thin-film interference, thickness range, view-dependent
- **Subsurface**: Wrap diffuse, screen-space blur, thickness map

**Helper Utilities:**
- Fresnel (Schlick + dielectric/metal overrides)
- Triplanar sampling with mip bias
- Reoriented Normal Map blending
- Multi-octave noise for breakup

### 4.4 Post-Processing Passes

**Core Passes:**

1. **Tone Mapping**
   - Linear → ACES / Filmic
   - Exposure control
   - Color space conversions

2. **Bloom**
   - Dual-filtered mip chain
   - Adaptive radius
   - Lens dirt combine

3. **Glare**
   - Anisotropic separable blur (streaks)
   - Starburst kernel overlay

4. **Depth of Field**
   - Circle of Confusion (CoC) pass
   - Hexagonal bokeh gather
   - Near/far blur control

5. **Color FX**
   - Film grain (blue-noise)
   - Vignette
   - Lift/Gamma/Gain
   - LUT support

6. **Motion Blur** (optional)
   - Velocity buffer pass
   - Camera motion reprojection

### 4.5 Volumetrics & Fog

**Height Fog:**
```typescript
import { positionWorld, cameraPosition, distance } from 'three/tsl'

const fogDensity = uniform(0.05)
const fogHeight = uniform(10.0)

const worldPos = positionWorld
const camPos = cameraPosition
const dist = distance(worldPos, camPos)
const heightFactor = smoothstep(0, fogHeight, worldPos.y)

const fogAmount = exp(dist.mul(fogDensity).mul(heightFactor).negate())
```

**Exponential Fog:**
```typescript
const fogColor = color('#a0c0d0')
const fogFactor = exp(distance(positionWorld, cameraPosition).mul(density).negate())
const finalColor = mix(fogColor, sceneColor, fogFactor)
```

---

## 5. Agent-Friendly JSON/DSL

### 5.1 Material Schema

**Base Structure:**
```json
{
  "kind": "material",
  "model": "pbr",
  "layers": [
    { "type": "baseColor", "hex": "#5a6cff" },
    { "type": "normalMix", "sources": ["flake", "macro"], "weights": [0.6, 0.4] },
    { "type": "anisotropy", "strength": 0.7, "direction": [1, 0], "roughness": 0.2 },
    { "type": "clearcoat", "amount": 0.8, "gloss": 0.45 },
    { "type": "sheen", "color": "#d8d8ff", "intensity": 0.5 },
    { "type": "iridescence", "ior": 1.6, "thickness": [250, 900] }
  ],
  "mapping": { "type": "triplanar", "scale": 2.0 },
  "ibl": { "type": "envLUT", "intensity": 1.2 }
}
```

**Layer Types:**
- `baseColor`: color, hex, texture
- `roughness`: value, texture, noise
- `metalness`: value, texture
- `normal`: texture, proceduralNoise, triplanar
- `clearcoat`: amount, gloss, normal
- `sheen`: color, intensity, roughness
- `anisotropy`: strength, direction, rotation
- `iridescence`: ior, thickness, intensity
- `subsurface`: color, thickness, scatter
- `emissive`: color, intensity, texture

### 5.2 Post-Processing Schema

```json
{
  "kind": "post",
  "passes": [
    ["tonemap", { "curve": "ACES", "exposure": 1.0 }],
    ["bloom", { "threshold": 1.0, "strength": 0.45, "radius": 0.85 }],
    ["glare", { "streaks": 4, "intensity": 0.25, "angle": 45 }],
    ["dof", { "aperture": 0.018, "focus": 2.8, "maxBlur": 7.0 }],
    ["film", { "grain": 0.035, "temperature": 0.0 }],
    ["vignette", { "offset": 0.5, "darkness": 0.8 }]
  ]
}
```

**Pass Types:**
- `tonemap`: ACES, Filmic, Reinhard, Linear
- `bloom`: threshold, strength, radius, dirt
- `glare`: streaks, intensity, angle, color
- `dof`: aperture, focus, maxBlur, bokehShape
- `film`: grain, scratches, temperature
- `vignette`: offset, darkness, smoothness
- `colorGrade`: lift, gamma, gain, saturation
- `motionBlur`: samples, intensity
- `ssao`: radius, intensity, bias

### 5.3 Compute Schema

```json
{
  "kind": "compute",
  "kernel": "particles.curl",
  "size": [512, 512],
  "params": {
    "curlScale": 3.5,
    "gravity": -0.3,
    "damping": 0.98,
    "noiseOctaves": 3
  },
  "output": "particlesBuffer"
}
```

**Kernel Types:**
- `particles.curl`: Curl noise field
- `particles.gravity`: Gravity + attractors
- `particles.swarm`: Boid-like behavior
- `fluids.advect`: Fluid advection
- `fluids.pressure`: Jacobi pressure solve
- `sdf.march`: SDF ray marching

### 5.4 TypeScript Schema (Zod)

```typescript
import { z } from 'zod'

const MaterialLayerSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('baseColor'),
    hex: z.string().regex(/^#[0-9a-f]{6}$/i).optional(),
    color: z.array(z.number().min(0).max(1)).length(3).optional()
  }),
  z.object({
    type: z.literal('clearcoat'),
    amount: z.number().min(0).max(1),
    gloss: z.number().min(0).max(1),
    normal: z.string().optional()
  }),
  // ... more layer types
])

const MaterialSchema = z.object({
  kind: z.literal('material'),
  model: z.enum(['pbr', 'standard', 'basic', 'toon']),
  layers: z.array(MaterialLayerSchema),
  mapping: z.object({
    type: z.enum(['uv', 'triplanar', 'cubeMap']),
    scale: z.number().positive().optional()
  }).optional()
})

const PostPassSchema = z.tuple([
  z.string(), // pass name
  z.record(z.unknown()) // params
])

const PostSchema = z.object({
  kind: z.literal('post'),
  passes: z.array(PostPassSchema)
})
```

### 5.5 Graph Compiler

```typescript
import { MaterialSchema, PostSchema } from './schema'
import { MeshPhysicalNodeMaterial } from 'three/webgpu'
import { color, vec3 } from 'three/tsl'

export function compileMaterial(spec: unknown) {
  const validated = MaterialSchema.parse(spec)
  const material = new MeshPhysicalNodeMaterial()
  
  for (const layer of validated.layers) {
    switch (layer.type) {
      case 'baseColor':
        if (layer.hex) {
          material.colorNode = color(layer.hex)
        }
        break
      case 'clearcoat':
        material.clearcoatNode = vec3(layer.amount)
        material.clearcoatRoughnessNode = 1.0 - layer.gloss
        break
      // ... handle other layers
    }
  }
  
  return material
}

export function compilePostChain(spec: unknown, renderer) {
  const validated = PostSchema.parse(spec)
  const post = new PostProcessing(renderer)
  
  for (const [passName, params] of validated.passes) {
    const passFactory = POST_PASS_REGISTRY[passName]
    if (!passFactory) throw new Error(`Unknown pass: ${passName}`)
    post.add(passFactory(params))
  }
  
  return post
}
```

---

## 6. Implementation Guide

### 6.1 Quick Start Checklist

**1. Install Dependencies**
```bash
npm install three@latest
npm install @react-three/fiber@latest  # if using React
npm install tsl-textures tslfx         # community libraries
```

**2. Setup WebGPU Renderer**
```typescript
import { WebGPURenderer } from 'three/webgpu'

async function initRenderer() {
  const renderer = new WebGPURenderer({ 
    antialias: true,
    powerPreference: 'high-performance'
  })
  await renderer.init()
  
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  
  return renderer
}
```

**3. Create TSL Material**
```typescript
import { MeshPhysicalNodeMaterial } from 'three/webgpu'
import { color, uv } from 'three/tsl'

const material = new MeshPhysicalNodeMaterial({
  colorNode: color('#ff6b35'),
  roughnessNode: 0.3,
  metalnessNode: 0.0
})
```

**4. Setup Post-Processing**
```typescript
import { PostProcessing } from 'three/webgpu'

const postProcessing = new PostProcessing(renderer)
// Add passes...
```

**5. Render Loop**
```typescript
function animate() {
  requestAnimationFrame(animate)
  
  // Update compute
  particleSystem.update(deltaTime)
  
  // Render with post
  postProcessing.render(scene, camera)
}
```

### 6.2 React Three Fiber Setup

**Complete App:**
```tsx
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Environment } from '@react-three/drei'
import { WebGPURenderer } from 'three/webgpu'
import { MeshPhysicalNodeMaterial } from 'three/webgpu'

// Async WebGPU init
const createWebGPURenderer = async () => {
  const renderer = new WebGPURenderer({ antialias: true })
  await renderer.init()
  return renderer
}

function Scene() {
  const materialRef = useRef()
  
  useFrame((state, delta) => {
    // Animate uniforms
    if (materialRef.current) {
      materialRef.current.timeNode.value += delta
    }
  })
  
  return (
    <>
      <mesh>
        <torusKnotGeometry args={[1, 0.3, 128, 32]} />
        <meshPhysicalNodeMaterial
          ref={materialRef}
          color="orange"
          roughness={0.2}
          clearcoat={0.8}
          clearcoatRoughness={0.1}
        />
      </mesh>
      <Environment preset="sunset" />
      <OrbitControls />
    </>
  )
}

export default function App() {
  return (
    <Canvas gl={createWebGPURenderer}>
      <Scene />
    </Canvas>
  )
}
```

### 6.3 Device Capabilities Check

```typescript
export async function getDeviceCaps() {
  if (!navigator.gpu) {
    return { supported: false }
  }
  
  const adapter = await navigator.gpu.requestAdapter()
  if (!adapter) {
    return { supported: false }
  }
  
  const device = await adapter.requestDevice()
  const limits = device.limits
  
  return {
    supported: true,
    maxTextureDimension2D: limits.maxTextureDimension2D,
    maxStorageTexturesPerShaderStage: limits.maxStorageTexturesPerShaderStage,
    maxComputeWorkgroupSizeX: limits.maxComputeWorkgroupSizeX,
    supportsFloat16: adapter.features.has('shader-f16'),
    supportsTimestamp: adapter.features.has('timestamp-query')
  }
}
```

### 6.4 Performance Budget System

```typescript
export class PerformanceBudget {
  private frameTimeTarget = 16.67 // 60 FPS
  private gpuTimeTarget = 5.0     // 5ms for post at 1080p
  
  private frameTimes: number[] = []
  private gpuTimes: Map<string, number> = new Map()
  
  recordFrameTime(dt: number) {
    this.frameTimes.push(dt)
    if (this.frameTimes.length > 60) this.frameTimes.shift()
  }
  
  recordGPUPass(name: string, time: number) {
    this.gpuTimes.set(name, time)
  }
  
  getAverageFrameTime() {
    return this.frameTimes.reduce((a, b) => a + b, 0) / this.frameTimes.length
  }
  
  isOverBudget() {
    const avgFrame = this.getAverageFrameTime()
    const totalGPU = Array.from(this.gpuTimes.values()).reduce((a, b) => a + b, 0)
    
    return {
      frame: avgFrame > this.frameTimeTarget,
      gpu: totalGPU > this.gpuTimeTarget,
      avgFrame,
      totalGPU
    }
  }
}
```

### 6.5 Fallback Strategy

```typescript
export async function createRenderer() {
  // Try WebGPU first
  if (navigator.gpu) {
    try {
      const { WebGPURenderer } = await import('three/webgpu')
      const renderer = new WebGPURenderer({ antialias: true })
      await renderer.init()
      console.log('✅ Using WebGPU')
      return { renderer, backend: 'webgpu' }
    } catch (e) {
      console.warn('WebGPU init failed, falling back to WebGL', e)
    }
  }
  
  // Fallback to WebGL
  const { WebGLRenderer } = await import('three')
  const renderer = new WebGLRenderer({ antialias: true })
  console.log('⚠️ Using WebGL fallback')
  return { renderer, backend: 'webgl' }
}

export function createMaterial(backend: 'webgpu' | 'webgl') {
  if (backend === 'webgpu') {
    return new MeshPhysicalNodeMaterial({ color: 'orange' })
  } else {
    return new MeshPhysicalMaterial({ color: 'orange' })
  }
}
```

---

## 7. Best Practices & Performance

### 7.1 WebGPU Best Practices

**1. Always Async Init**
```typescript
// ✅ Good
const renderer = new WebGPURenderer()
await renderer.init()

// ❌ Bad - will cause "backend not initialized" errors
const renderer = new WebGPURenderer()
renderer.render(scene, camera)
```

**2. Resource Disposal**
```typescript
// Always clean up
material.dispose()
geometry.dispose()
texture.dispose()

// For compute
computeKernel.dispose()
storageBuffer.dispose()
```

**3. Batch Similar Materials**
```typescript
// Share NodeMaterials when possible
const sharedMaterial = new MeshPhysicalNodeMaterial()
mesh1.material = sharedMaterial
mesh2.material = sharedMaterial
```

**4. Use Storage Textures Wisely**
```typescript
// Size to device limits
const caps = await getDeviceCaps()
const size = Math.min(2048, caps.maxTextureDimension2D)
```

### 7.2 TSL Performance Tips

**1. Minimize Node Duplication**
```typescript
// ✅ Good - reuse nodes
const uvNode = uv()
const pattern1 = texture(tex1, uvNode)
const pattern2 = texture(tex2, uvNode)

// ❌ Bad - creates multiple UV nodes
const pattern1 = texture(tex1, uv())
const pattern2 = texture(tex2, uv())
```

**2. Use Built-in Nodes**
```typescript
// ✅ Good - optimized built-ins
import { positionWorld, normalWorld } from 'three/tsl'

// ❌ Bad - custom code() for standard things
const pos = code('vec3 pos = (modelMatrix * vec4(position, 1.0)).xyz')
```

**3. Leverage Common Sub-expression Elimination**
TSL automatically deduplicates identical expressions:
```typescript
// These will share computation
const worldPos1 = positionWorld
const worldPos2 = positionWorld
// Only computed once in shader!
```

### 7.3 Compute Shader Guidelines

**1. Workgroup Size**
```typescript
// Match hardware (typically 8x8 or 16x16)
const workgroupSize = [8, 8, 1]
const dispatchSize = [
  Math.ceil(width / workgroupSize[0]),
  Math.ceil(height / workgroupSize[1]),
  1
]
```

**2. Ping-Pong Pattern**
```typescript
class PingPongBuffers {
  private read: StorageBuffer
  private write: StorageBuffer
  
  swap() {
    [this.read, this.write] = [this.write, this.read]
  }
  
  getRead() { return this.read }
  getWrite() { return this.write }
}
```

**3. Barrier Synchronization**
```typescript
// Ensure compute finishes before render
encoder.dispatch(computePass)
encoder.barrier()
encoder.render(renderPass)
```

### 7.4 Post-Processing Performance

**1. Resolution Scaling**
```typescript
// Run post at lower resolution
const renderScale = 1.0
const postScale = 0.75

renderer.setSize(width * renderScale, height * renderScale)
postProcessing.setSize(width * postScale, height * postScale)
```

**2. Mip Chain Reuse**
```typescript
// Reuse bloom mips for DOF blur
const bloomMips = bloomPass.getMipChain()
dofPass.setBlurSource(bloomMips)
```

**3. Pass Merging**
```typescript
// Combine compatible passes
const combinedPass = merge([
  tonemap(),
  vignette(),
  filmGrain()
])
```

### 7.5 Memory Management

**1. Texture Budget**
```typescript
class TexturePool {
  private pool = new Map<string, Texture>()
  
  acquire(key: string, creator: () => Texture) {
    if (!this.pool.has(key)) {
      this.pool.set(key, creator())
    }
    return this.pool.get(key)!
  }
  
  dispose() {
    this.pool.forEach(tex => tex.dispose())
    this.pool.clear()
  }
}
```

**2. Streaming Assets**
```typescript
// Load textures progressively
const loader = new TextureLoader()
loader.load('texture.jpg', 
  (texture) => {
    material.map = texture
    material.needsUpdate = true
  },
  (progress) => console.log(`${progress.loaded / progress.total * 100}%`)
)
```

### 7.6 Testing & Validation

**Golden Visual Tests:**
```typescript
async function captureGoldenImage(scene, camera) {
  renderer.render(scene, camera)
  const canvas = renderer.domElement
  const blob = await new Promise(resolve => 
    canvas.toBlob(resolve, 'image/png')
  )
  return blob
}

// Compare with baseline
const current = await captureGoldenImage(scene, camera)
const baseline = await fetch('/golden/baseline.png').then(r => r.blob())
const deltaE = compareImages(current, baseline)
assert(deltaE < 2, 'Visual regression detected')
```

**Performance Tests:**
```typescript
const budget = new PerformanceBudget()

function testPerformance() {
  const start = performance.now()
  
  for (let i = 0; i < 60; i++) {
    renderer.render(scene, camera)
    const frameTime = performance.now() - start
    budget.recordFrameTime(frameTime)
  }
  
  const status = budget.isOverBudget()
  assert(!status.frame, `Frame time ${status.avgFrame}ms exceeds ${budget.frameTimeTarget}ms`)
}
```

---

## 8. Resources & References

### 8.1 Official Documentation

**Three.js Core:**
- Main Docs: https://threejs.org/docs/
- TSL Introduction: https://threejs.org/docs/#manual/en/introduction/TSL
- TSL Wiki: https://github.com/mrdoob/three.js/wiki/Three.js-Shading-Language
- Migration Guide: https://github.com/mrdoob/three.js/wiki/Migration-Guide
- WebGPU Examples: https://threejs.org/examples/?q=webgpu

**React Three Fiber:**
- Docs: https://docs.pmnd.rs/react-three-fiber
- v9 Migration Guide: https://r3f.docs.pmnd.rs/tutorials/v9-migration-guide
- Canvas API: https://r3f.docs.pmnd.rs/api/canvas

**Threlte:**
- Main Site: https://threlte.xyz
- WebGPU Guide: https://threlte.xyz/docs/learn/advanced/webgpu

**TresJS:**
- Docs: https://docs.tresjs.org
- Website: https://tresjs.org

### 8.2 Community Resources

**Tutorials & Guides:**
- Field Guide to TSL and WebGPU: https://blog.maximeheckel.com/posts/field-guide-to-tsl-and-webgpu/
- Interactive Text Destruction with TSL: https://tympanus.net/codrops/2025/07/22/interactive-text-destruction-with-three-js-webgpu-and-tsl/
- GPGPU Particles with TSL: https://wawasensei.dev/courses/react-three-fiber/lessons/tsl-gpgpu
- WebGPU Fluid Simulations: https://tympanus.net/codrops/2025/02/26/webgpu-fluid-simulations-high-performance-real-time-rendering/
- WebGPU Storage Textures: https://webgpufundamentals.org/webgpu/lessons/webgpu-storage-textures.html

**Forums & Discussion:**
- Three.js Forum: https://discourse.threejs.org/
- WebGPU Nodes Discussion: https://discourse.threejs.org/t/how-to-utilize-webgpu-is-nodes-the-best-option/50162
- NodeMaterial Status: https://discourse.threejs.org/t/what-is-going-on-with-nodematerials-all-the-examples-are-gone/66451

### 8.3 GitHub Repositories

**Core Libraries:**
- Three.js: https://github.com/mrdoob/three.js
- R3F: https://github.com/pmndrs/react-three-fiber
- Threlte: https://github.com/threlte/threlte
- TresJS: https://github.com/Tresjs/tres

**TSL/Shader Libraries:**
- TSL Textures: https://github.com/boytchev/tsl-textures
- TSLFX: https://github.com/verekia/tslfx
- Bruno's TSL Template: https://github.com/brunosimon/three.js-tsl-template
- Bruno's TSL Sandbox: https://github.com/brunosimon/three.js-tsl-sandbox

**Compute & Simulation:**
- Roquefort (Fluid): https://github.com/Bercon/roquefort
- Kishimisu Fluid: https://github.com/kishimisu/WebGPU-Fluid-Simulation
- Particles WebGPU: https://github.com/piellardj/particles-webgpu

**Post-Processing:**
- pmndrs/postprocessing: https://github.com/pmndrs/postprocessing
- R3F WebGPU Starter: https://github.com/ektogamat/r3f-webgpu-starter
- Another R3F Starter: https://github.com/wass08/r3f-webgpu-starter

**Visual Editors:**
- TSL Editor: https://github.com/bhushan6/tsl-editor
- Visual Node Editor: https://github.com/bandinopla/three.js-visual-node-editor
- Polygonjs: https://github.com/polygonjs/polygonjs
- NodeToy Integration: https://github.com/NodeToy/three-nodetoy

**Testing & Ecosystem:**
- Ecosystem Tests: https://github.com/verekia/three-gpu-ecosystem-tests

### 8.4 Articles & Case Studies

- R3F + WebGPU + TypeScript: https://blog.loopspeed.co.uk/react-three-fiber-webgpu-typescript
- Interactive 3D with BatchedMesh: https://tympanus.net/codrops/2024/10/30/interactive-3d-with-three-js-batchedmesh-and-webgpurenderer/
- Dynamic Batching using WebGPU: https://discourse.threejs.org/t/dynamic-batching-using-webgpu/55146
- Particle Life Simulation: https://lisyarus.github.io/blog/posts/particle-life-simulation-in-browser-using-webgpu.html

### 8.5 Specifications & Standards

- WebGPU Spec: https://www.w3.org/TR/webgpu/
- WGSL Spec: https://www.w3.org/TR/WGSL/
- MaterialX: https://materialx.org/

---

## Appendix A: Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | Oct 31, 2025 | Initial comprehensive merge |

## Appendix B: Contributing

This document is maintained as a living reference. To suggest updates:

1. Check if libraries are actively maintained (GitHub activity)
2. Verify compatibility with Three.js r180+
3. Test with WebGPU before adding
4. Include working code examples
5. Add proper attribution and links

## Appendix C: License

This documentation is provided as-is for educational purposes. Individual libraries and tools maintain their own licenses (see respective repositories).

---

**Document compiled from:**
- _MConverter.eu_WebGPU & TSL Libraries and Tools (Three.js r180+ Ecosystem)
- Three.js WebGPU & TSL Ecosystem (JS/TS, r180+ and above)
- TSL Toolkit Architecture
- TSL Toolkit Design
- WebGPU + Three.js + TSL Engine Guide
- WebGPU-TSL Ecosystem Overview
- WebGPU-TSL Libraries Reference

**Maintained by:** Community Contributors  
**Last Updated:** October 31, 2025


