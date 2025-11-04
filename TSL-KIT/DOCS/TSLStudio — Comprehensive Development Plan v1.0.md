# 🚀 TSLStudio — Comprehensive Development Plan v1.0

> **Date**: November 4, 2025  
> **Status**: Foundation Phase  
> **Mission**: Build a complete, production-ready TSL/WebGPU engine with pre-built modules, effects, and agent-addressable APIs

---

## 📋 Table of Contents

1. [Executive Summary](#executive-summary)
2. [Vision & Goals](#vision--goals)
3. [Current State Analysis](#current-state-analysis)
4. [Resource Inventory](#resource-inventory)
5. [Architecture Blueprint](#architecture-blueprint)
6. [Development Roadmap](#development-roadmap)
7. [Module Catalog](#module-catalog)
8. [Porting Strategy](#porting-strategy)
9. [Implementation Phases](#implementation-phases)
10. [Quality Assurance](#quality-assurance)

---

## 🎯 Executive Summary

### Project Mission
Build a **self-contained, plug-and-play TSL/WebGPU toolkit** on top of Three.js WebGPU that delivers:
- **Cutting-edge materials** (PBR, clearcoat, anisotropy, iridescence, sheen, transmission)
- **Advanced post-FX** (TAA, DOF, SSAO, SSR, SSGI, motion blur, cinematic bloom)
- **GPU compute systems** (particles, fluids, flow fields, growth patterns)
- **Pre-designed node libraries** (noise, SDF, lighting, color grading)
- **Clean, agent-ready APIs** for programmatic control

### Strategic Approach
**Direct-port working examples** from proven repositories rather than reinventing:
- ✅ Maintain original functionality
- ✅ Add TypeScript types and JSDoc
- ✅ Follow TSLStudio conventions
- ✅ Create comprehensive documentation
- ✅ Optimize for WebGPU

### Key Differentiators
1. **Complete out-of-the-box** — 100+ pre-built modules ready to use
2. **Agent-addressable** — JSON schemas, typed parameters, safe controls
3. **Performance-first** — WebGPU compute, adaptive quality, frame budgets
4. **Canvas-first website** — Persistent 3D stage powering all pages
5. **Reproducible creativity** — Seeds, snapshots, shareable state bundles

---

## 🌟 Vision & Goals

### Core Tenets
1. **Canvas-first** — Engine always live; pages orchestrate scenes
2. **Expressive by default** — Gorgeous results quickly; mastery over time
3. **Deterministic creativity** — Seeds, snapshots, diffable state
4. **Performance with taste** — Filmic quality without stutter
5. **Small, stable surface** — Predictable API, versioned schemas
6. **Agent-addressable** — Every control typed, clamped, documented
7. **Observability everywhere** — Time budgets, warnings, metrics
8. **Accessibility is a feature** — Keyboard flows, reduced motion

### Target Users
- **Explorers**: Visitors experiencing preset cycling and camera tours
- **Learners**: Readers following interactive articles
- **Creators**: Power users composing looks, saving presets, exporting
- **Agents**: UX assistants and builder agents using typed parameter bridges

### Success Metrics
- 60 FPS @ 1080p on mid-range devices
- < 2.5s initial interactive load
- 100+ ready-to-use modules
- 50+ material presets
- 30+ post-processing effects
- < 0.1% error rate with soft fallbacks

---

## 📊 Current State Analysis

### Existing Structure

```
TSLStudio/
├── packages/
│   ├── engine/                    ✅ Core engine infrastructure
│   │   └── core/
│   │       ├── renderer.ts        ✅ WebGPU renderer (async init)
│   │       ├── framegraph.ts      ✅ Post-FX composition
│   │       ├── assets.ts          ✅ Asset loading
│   │       └── inspector.ts       ✅ Debug tools
│   │
│   ├── tsl/                       ✅ TSL library
│   │   ├── noise/                 ✅ 8 noise functions
│   │   ├── materials/             🟡 Limited (PBR only)
│   │   │   ├── pbr/               ✅ Clearcoat, sheen, anisotropy, etc.
│   │   │   └── stylized/          🟡 Matcap, triplanar only
│   │   ├── post/                  🟡 Basic effects
│   │   │   ├── effects/           ✅ Bloom, TAA, vignette, grain
│   │   │   └── passes/            🟡 Limited pass types
│   │   ├── compute/               🟡 Particles only
│   │   │   ├── particles/         ✅ Basic particle system
│   │   │   └── simulation/        ✅ Curl noise, fluid2d, SDF
│   │   └── utils/                 ✅ Good foundation
│   │       ├── lighting.ts        🟡 Single function only
│   │       ├── color/             ✅ Palette, tonemapping
│   │       ├── function/          ✅ Bloom helpers, patterns
│   │       ├── math/              ✅ Complex, coordinates
│   │       └── sdf/               🟡 Basic operations, shapes
│   │
│   └── studio/                    ✅ React application
│       ├── components/            ✅ Canvas, compute, debug
│       ├── routes/                ✅ Demo routes
│       └── demos/                 ✅ Particle, PBR showcases
│
└── RESOURCES/                     ✅ External resources
    ├── REPOSITORIES/
    │   ├── portfolio examples/    ⭐ Maxime Heckel's examples
    │   │   ├── portfolio-main/    ⭐ 30+ WebGPU experiments
    │   │   └── fragments-boilerplate-main/  ⭐ TSL boilerplate
    │   └── TSLwebgpuExamples/     ⭐ Multiple example repos
    │       ├── roquefort-main/    ⭐ Fluid simulation
    │       ├── ssr-gtao-keio/     ⭐ SSR, GTAO
    │       ├── ssgi-ssr-painter/  ⭐ SSGI
    │       └── three.js-tsl-sandbox-master/  ⭐ 30+ projects
    ├── three.js-r181/             ⭐ Official Three.js r181
    │   ├── examples/              ⭐ WebGPU examples
    │   └── src/                   ⭐ Source code
    └── TSL DOCS/                  ⭐ TSL documentation
```

### Strengths ✅
- Solid WebGPU renderer foundation with async init
- Working framegraph and post-processing pipeline
- Comprehensive PBR material system
- Basic GPU particle system
- Noise utilities (Simplex, Curl, FBM)
- React integration via R3F
- Good TypeScript typing

### Gaps & Opportunities 🔴
- **Materials**: Limited pre-built library (only PBR and 2 stylized)
- **Lighting**: Only single diffuse function, missing fresnel/hemisphere/ambient
- **Post-FX**: Missing SSR, SSAO, GTAO, SSGI, advanced DOF, motion blur
- **Compute**: No advanced particle features (morphing, flow fields, collision)
- **Compute**: No fluid simulation integration (roquefort ready to port)
- **SDF**: Limited primitives (only sphere), missing operations library
- **Animation**: No morphing/deformation helpers
- **Procedural**: No terrain/cloud generation
- **Screen Space**: No SSR/GTAO/SSGI implementations
- **Documentation**: Limited tutorials and recipes
- **Testing**: No visual regression or performance benchmarks
- **Website**: No canvas-first architecture yet

---

## 📦 Resource Inventory

### Available Source Repositories

#### 1. Portfolio Examples (Maxime Heckel) ⭐⭐⭐⭐⭐
**Path**: `RESOURCES/REPOSITORIES/portfolio examples/portfolio-main/`

**Assets**:
```
src/utils/webgpu/nodes/
├── lighting/
│   ├── diffuse.ts              → Lambertian diffuse
│   ├── ambient.ts              → Ambient lighting
│   ├── directional.ts          → Directional lights
│   ├── fresnel.ts              → Fresnel effect
│   └── hemisphere.ts           → Hemisphere lighting
├── noise/
│   ├── simplexNoise2d.ts       → 2D Simplex
│   ├── simplexNoise3d.ts       → 3D Simplex
│   ├── simplexNoise4d.ts       → 4D Simplex
│   ├── curlNoise3d.ts          → 3D Curl
│   ├── curlNoise4d.ts          → 4D Curl
│   ├── classicNoise3d.ts       → Classic Perlin
│   └── voronoi.ts              → Voronoi cells
└── helpers/
    ├── smooth-min.ts           → Smooth minimum
    ├── smooth-mod.ts           → Smooth modulo
    ├── remap.ts                → Value remapping
    ├── rotate-3d-y.ts          → 3D Y rotation
    └── compose.ts              → Function composition

src/app/lab/ (30+ experiments)
├── fbo-particles/              → GPGPU particles
├── particles-morphing-2/       → Shape morphing
├── flow-field/                 → Flow field forces
├── attractor-collisions/       → Physics simulation
├── particles-twist/            → Curl forces
├── infinite-water/             → Water simulation
├── sdf-basic-tsl/              → Raymarching
├── tsl-custom-node-material/   → Custom materials
├── refraction-and-dispersion/  → Glass effects
└── [20+ more examples]
```

**Priority**: ⭐⭐⭐⭐⭐ (Highest)
- Modern TSL patterns
- Production-tested code
- Excellent WebGPU practices

#### 2. Fragments Boilerplate ⭐⭐⭐⭐⭐
**Path**: `RESOURCES/REPOSITORIES/TSLwebgpuExamples/fragments-boilerplate-vanilla-main/`

**Assets**:
```
src/tsl/
├── noise/                      → 8 complete implementations
│   ├── curl_noise_3d.js
│   ├── curl_noise_4d.js
│   ├── fbm.js
│   ├── perlin_noise_3d.js
│   ├── simplex_noise_3d.js
│   ├── simplex_noise_4d.js
│   └── turbulence.js
├── post_processing/            → 6 ready effects
│   ├── canvas_weave_effect.js
│   ├── grain_texture_effect.js
│   ├── lcd_effect.js
│   ├── pixellation_effect.js
│   ├── speckled_noise_effect.js
│   └── vignette_effect.js
└── utils/
    ├── color/                  → Palette, tonemapping
    ├── function/               → Bloom, patterns
    ├── math/                   → Complex, coordinates
    └── sdf/                    → Operations, shapes
```

**Priority**: ⭐⭐⭐⭐⭐
- Already partially ported
- Clean, modular structure

#### 3. Roquefort Fluid Simulation ⭐⭐⭐⭐
**Path**: `RESOURCES/REPOSITORIES/TSLwebgpuExamples/roquefort-main/`

**Assets**:
```
src/
├── simulation/                 → Complete fluid solver
│   ├── advect.js              → Semi-Lagrangian advection
│   ├── divergence.js          → Divergence calculation
│   ├── pressure.js            → Pressure solver (Jacobi)
│   ├── gradient_subtract.js   → Gradient subtraction
│   ├── vorticity.js           → Vorticity confinement
│   └── emitters.js            → Fluid impulse injection
└── rendering/
    ├── blur.js                → Gaussian blur
    └── lighting.js            → Fluid lighting
```

**Priority**: ⭐⭐⭐⭐
- Complete 2D fluid system
- WebGPU compute shaders
- Production-ready

#### 4. SSR/GTAO/SSGI Examples ⭐⭐⭐⭐⭐
**Paths**: 
- `RESOURCES/REPOSITORIES/TSLwebgpuExamples/ssr-gtao-keio/`
- `RESOURCES/REPOSITORIES/TSLwebgpuExamples/ssgi-ssr-painter/`

**Assets**:
- SSR (Screen Space Reflections)
- GTAO (Ground Truth Ambient Occlusion)
- SSGI (Screen Space Global Illumination)

**Priority**: ⭐⭐⭐⭐⭐ (Critical)
- High-impact visual quality
- Production techniques

#### 5. Three.js TSL Sandbox ⭐⭐⭐⭐
**Path**: `RESOURCES/REPOSITORIES/TSLwebgpuExamples/three.js-tsl-sandbox-master/`

**Assets**: 30+ complete projects
```
├── particles-flow-field/       → Flow field behaviors
├── particles-morphing/         → Shape morphing
├── post-processing/            → Effect chains
├── procedural-terrain/         → Terrain generation
├── raging-sea/                 → Ocean simulation
├── hologram/                   → Holographic materials
├── halftone/                   → Halftone effects
├── coffee-smoke/               → Smoke simulation
├── fireworks/                  → Particle fireworks
└── [20+ more projects]
```

**Priority**: ⭐⭐⭐⭐

#### 6. Three.js r181 Official ⭐⭐⭐
**Path**: `RESOURCES/three.js-r181/`

**Assets**:
- 100+ WebGPU examples
- Official TSL node implementations
- Shader library
- Best practices reference

**Priority**: ⭐⭐⭐

### Module Count Summary

| Category | Available | Currently Ported | Remaining | Priority |
|----------|-----------|------------------|-----------|----------|
| **Lighting Models** | 10 | 1 | 9 | 🔴 High |
| **Noise Functions** | 12 | 8 | 4 | 🟡 Medium |
| **SDF Primitives** | 15+ | 1 | 14+ | 🟡 Medium |
| **SDF Operations** | 12 | 2 | 10 | 🟡 Medium |
| **Post Effects** | 30+ | 10 | 20+ | 🔴 High |
| **Materials** | 25+ | 7 | 18+ | 🟡 Medium |
| **Particles** | 15+ | 1 | 14+ | 🔴 High |
| **Fluid Systems** | 8 | 1 | 7 | 🔴 High |
| **Screen Space** | 5 | 0 | 5 | 🔴 Critical |
| **Geometry Utils** | 10+ | 0 | 10+ | 🟢 Low |
| **Animation** | 10+ | 0 | 10+ | 🟢 Low |
| **Procedural** | 8+ | 0 | 8+ | 🟢 Low |

**Total**: 
- **Available**: 150+ modules
- **Currently Ported**: ~30 (20%)
- **Remaining**: ~120 (80%)

---

## 🏗️ Architecture Blueprint

### Layered Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                       Application Layer                          │
│            (React, Routes, UI, Agent Bridge)                     │
└─────────────────────────────────────────────────────────────────┘
                               │
┌─────────────────────────────────────────────────────────────────┐
│                        Engine Layer                              │
│   ┌──────────┬──────────┬──────────┬──────────┬──────────┐     │
│   │   Core   │Materials │    FX    │ Compute  │  Scenes  │     │
│   │Renderer  │   PBR    │  Bloom   │Particles │   Demo   │     │
│   │Framegraph│Clearcoat │   TAA    │  Fluid   │   PBR    │     │
│   │  Assets  │  Sheen   │Vignette  │   SDF    │Particles │     │
│   │Inspector │Iridescent│   SSR    │  Physics │  Fluid   │     │
│   │          │Anisotropy│  GTAO    │ FlowField│          │     │
│   │          │Transmission│ SSGI   │ Morphing │          │     │
│   └──────────┴──────────┴──────────┴──────────┴──────────┘     │
└─────────────────────────────────────────────────────────────────┘
                               │
┌─────────────────────────────────────────────────────────────────┐
│                      TSL Library Layer                           │
│   ┌──────────┬──────────┬──────────┬──────────┬──────────┐     │
│   │  Noise   │  Utils   │Materials │   Post   │  Compute │     │
│   │ Simplex  │ Lighting │  Custom  │  Effects │  Kernels │     │
│   │  Curl    │   SDF    │  Shaders │  Passes  │  Storage │     │
│   │Perlin/FBM│   Math   │   Nodes  │  Chains  │  Buffers │     │
│   │ Voronoi  │  Color   │          │          │          │     │
│   └──────────┴──────────┴──────────┴──────────┴──────────┘     │
└─────────────────────────────────────────────────────────────────┘
                               │
┌─────────────────────────────────────────────────────────────────┐
│                   Three.js WebGPU Core (r181+)                   │
└─────────────────────────────────────────────────────────────────┘
```

### Module Organization

```
TSLStudio/
└── packages/
    ├── engine/                      # High-level engine systems
    │   ├── core/
    │   │   ├── renderer.ts          # WebGPU renderer (async init)
    │   │   ├── framegraph.ts        # Post-FX composition
    │   │   ├── assets.ts            # Asset management
    │   │   ├── inspector.ts         # Debug/profiling
    │   │   └── state.ts             # NEW: Engine state management
    │   │
    │   ├── materials/               # Material presets & builders
    │   │   ├── physical/            # NEW: Physical materials
    │   │   ├── procedural/          # NEW: Procedural materials
    │   │   ├── stylized/            # NEW: Stylized materials
    │   │   └── special/             # NEW: Special effects materials
    │   │
    │   ├── fx/                      # Post-processing effects
    │   │   ├── bloom.ts
    │   │   ├── taa.ts
    │   │   ├── dof.ts               # NEW: Depth of field
    │   │   ├── ssr.ts               # NEW: Screen space reflections
    │   │   ├── gtao.ts              # NEW: Ground truth AO
    │   │   ├── ssgi.ts              # NEW: Screen space GI
    │   │   ├── motionBlur.ts        # NEW: Motion blur
    │   │   └── [more effects]
    │   │
    │   ├── compute/                 # GPU compute systems
    │   │   ├── particles/           # NEW: Advanced particles
    │   │   ├── fluid/               # NEW: Fluid simulation
    │   │   ├── physics/             # NEW: Physics simulation
    │   │   └── procedural/          # NEW: Procedural generation
    │   │
    │   └── scenes/                  # Complete scene compositions
    │       ├── demos/
    │       └── presets/
    │
    ├── tsl/                         # TSL node library
    │   ├── noise/                   # Noise functions
    │   │   ├── simplex2d.ts         # NEW
    │   │   ├── simplex3d.ts         # ✅
    │   │   ├── simplex4d.ts         # ✅
    │   │   ├── curl3d.ts            # ✅
    │   │   ├── curl4d.ts            # ✅
    │   │   ├── classicNoise.ts      # NEW
    │   │   ├── voronoi.ts           # NEW
    │   │   ├── fbm.ts               # ✅
    │   │   └── turbulence.ts        # ✅
    │   │
    │   ├── materials/               # Material node builders
    │   │   ├── pbr/                 # ✅ PBR materials
    │   │   ├── stylized/            # ✅ Stylized materials
    │   │   └── nodes/               # NEW: Custom material nodes
    │   │
    │   ├── post/                    # Post-processing nodes
    │   │   ├── core/                # ✅ Core infrastructure
    │   │   ├── effects/             # ✅ Effect implementations
    │   │   ├── passes/              # ✅ Pass types
    │   │   └── nodes/               # NEW: Custom post nodes
    │   │
    │   ├── compute/                 # Compute shader helpers
    │   │   ├── particles/           # ✅ Particle system
    │   │   ├── simulation/          # ✅ Simulation helpers
    │   │   ├── storage/             # NEW: Storage buffer helpers
    │   │   └── kernels/             # NEW: Compute kernels
    │   │
    │   └── utils/                   # General TSL utilities
    │       ├── lighting/            # Lighting models (EXPAND)
    │       │   ├── diffuse.ts       # ✅
    │       │   ├── ambient.ts       # NEW
    │       │   ├── fresnel.ts       # NEW
    │       │   ├── hemisphere.ts    # NEW
    │       │   ├── specular.ts      # NEW
    │       │   └── [more models]
    │       │
    │       ├── sdf/                 # Signed distance functions
    │       │   ├── primitives/      # NEW: More primitives
    │       │   ├── operations.ts    # ✅ (EXPAND)
    │       │   └── shapes.ts        # ✅ (EXPAND)
    │       │
    │       ├── color/               # Color utilities
    │       ├── function/            # Function utilities
    │       ├── math/                # Math utilities
    │       └── [new categories]
    │
    └── studio/                      # React application
        ├── components/              # React components
        ├── routes/                  # Application routes
        ├── demos/                   # Demo scenes
        └── utils/                   # UI utilities
```

---

## 🗓️ Development Roadmap

### Overview
Total development time: **20 weeks (5 months)**
- Phase 1: Foundation (Weeks 1-4)
- Phase 2: Core Systems (Weeks 5-8)
- Phase 3: Advanced Effects (Weeks 9-12)
- Phase 4: Compute & Animation (Weeks 13-16)
- Phase 5: Polish & Launch (Weeks 17-20)

---

*[Continue to Part 2: Module Catalog & Implementation Details]*

# 🚀 TSLStudio — Development Plan Part 2: Implementation Phases

> **Part 2 of Comprehensive Development Plan v1.0**

---

## 📅 Phase 1: Foundation Enhancement (Weeks 1-4)

### 🎯 Objectives
- Port essential utilities from example repositories
- Establish comprehensive testing framework
- Create module templates and documentation standards
- Enhance existing TSL library with missing functions

### 📦 Deliverables

#### 1.1 Enhanced Lighting Library
**Target**: `packages/tsl/utils/lighting/`

**Modules to Port** (from `portfolio-main/src/utils/webgpu/nodes/lighting/`):

```typescript
// packages/tsl/utils/lighting/

├── diffuse.ts              ✅ EXISTS → Verify and enhance
├── ambient.ts              ⭕ PORT
├── directional.ts          ⭕ PORT  
├── fresnel.ts              ⭕ PORT
├── hemisphere.ts           ⭕ PORT
├── specular.ts             ⭕ NEW (create from PBR)
├── rimLight.ts             ⭕ NEW (extract from examples)
├── oren-nayar.ts           ⭕ NEW (diffuse model)
└── cook-torrance.ts        ⭕ NEW (specular model)
```

**Acceptance Criteria**:
- [ ] All lighting functions properly typed with JSDoc
- [ ] Examples render with visual parity to originals
- [ ] Unit tests for each function
- [ ] Integrated into demo scene
- [ ] Documentation with usage examples

**Estimated Time**: 3-4 days

---

#### 1.2 Complete Noise Library
**Target**: `packages/tsl/noise/`

**Modules to Port/Verify**:

```typescript
// packages/tsl/noise/

├── common.ts               ✅ EXISTS
├── simplex_noise_2d.ts     ⭕ PORT from portfolio
├── simplex_noise_3d.ts     ✅ EXISTS → Verify
├── simplex_noise_4d.ts     ✅ EXISTS → Verify
├── curl_noise_3d.ts        ✅ EXISTS → Verify
├── curl_noise_4d.ts        ✅ EXISTS → Verify
├── perlin_noise_3d.ts      ✅ EXISTS → Verify
├── classic_noise_3d.ts     ⭕ PORT from portfolio
├── voronoi.ts              ⭕ PORT from portfolio
├── fbm.ts                  ✅ EXISTS → Verify
├── turbulence.ts           ✅ EXISTS → Verify
└── helpers/
    ├── octaves.ts          ⭕ NEW (noise layering)
    ├── domainWarp.ts       ⭕ NEW (domain warping)
    └── animation.ts        ⭕ NEW (animated noise)
```

**Acceptance Criteria**:
- [ ] All noise functions verified for correctness
- [ ] Consistent API across all noise types
- [ ] Performance benchmarks (< 1ms for typical usage)
- [ ] Visual tests with reference images
- [ ] Demo scene showing all noise types

**Estimated Time**: 2-3 days

---

#### 1.3 Extended SDF Library
**Target**: `packages/tsl/utils/sdf/`

**Modules to Port/Create**:

```typescript
// packages/tsl/utils/sdf/

├── primitives/
│   ├── sphere.ts           ✅ EXISTS → Verify
│   ├── box.ts              ⭕ NEW
│   ├── roundBox.ts         ⭕ NEW
│   ├── torus.ts            ⭕ NEW
│   ├── cylinder.ts         ⭕ NEW
│   ├── cone.ts             ⭕ NEW
│   ├── capsule.ts          ⭕ NEW
│   ├── plane.ts            ⭕ NEW
│   ├── octahedron.ts       ⭕ NEW
│   └── pyramid.ts          ⭕ NEW
│
├── operations.ts           ✅ EXISTS → EXPAND
│   ├── union              ✅ EXISTS
│   ├── subtraction        ✅ EXISTS
│   ├── intersection       ✅ EXISTS
│   ├── smoothUnion        ⭕ ENHANCE
│   ├── smoothSubtraction  ⭕ NEW
│   ├── smoothIntersection ⭕ NEW
│   ├── displacement       ⭕ NEW
│   ├── twist              ⭕ NEW
│   └── bend               ⭕ NEW
│
├── shapes.ts               ✅ EXISTS → EXPAND
│
└── helpers/
    ├── raymarch.ts         ⭕ NEW (raymarching helper)
    ├── calcNormal.ts       ⭕ NEW (normal calculation)
    ├── calcAO.ts           ⭕ NEW (ambient occlusion)
    └── softShadow.ts       ⭕ NEW (soft shadows)
```

**Acceptance Criteria**:
- [ ] All SDF primitives working correctly
- [ ] Smooth operations produce good results
- [ ] Raymarch helper integrated with primitives
- [ ] Demo scene with complex SDF compositions
- [ ] Performance optimized (max 60 FPS at 1080p)

**Estimated Time**: 4-5 days

---

#### 1.4 Helper Functions & Utilities
**Target**: `packages/tsl/utils/function/`

**Modules to Port**:

```typescript
// packages/tsl/utils/function/

├── bloom.ts                ✅ EXISTS
├── bloom_edge_pattern.ts   ✅ EXISTS
├── domain_index.ts         ✅ EXISTS
├── median3.ts              ✅ EXISTS
├── repeating_pattern.ts    ✅ EXISTS
├── screen_aspect_uv.ts     ✅ EXISTS
├── smooth_min.ts           ⭕ PORT from portfolio
├── smooth_mod.ts           ⭕ PORT from portfolio
├── remap.ts                ⭕ PORT from portfolio
├── rotate_3d_y.ts          ⭕ PORT from portfolio
├── compose.ts              ⭕ PORT from portfolio
└── [verify existing]
```

**Estimated Time**: 1-2 days

---

#### 1.5 Testing Infrastructure
**Target**: `packages/*/tests/` and CI configuration

**Tasks**:
- [ ] Install and configure Vitest
- [ ] Create test utilities for WebGPU
- [ ] Write example tests for each module type
- [ ] Set up visual regression testing
- [ ] Configure CI/CD pipeline
- [ ] Create performance benchmarks

**Test Structure**:
```typescript
packages/
├── tsl/
│   ├── __tests__/
│   │   ├── setup.ts
│   │   └── utils.ts
│   ├── noise/__tests__/
│   │   ├── simplex.test.ts
│   │   └── curl.test.ts
│   ├── materials/__tests__/
│   └── [other __tests__ dirs]
│
└── engine/
    ├── __tests__/
    └── [other __tests__ dirs]
```

**Estimated Time**: 3-4 days

---

#### 1.6 Documentation Framework
**Target**: Documentation structure and templates

**Deliverables**:
- [ ] JSDoc templates for all module types
- [ ] README templates
- [ ] Example/recipe templates
- [ ] API documentation generator setup
- [ ] Tutorial structure

**Documentation Structure**:
```
TSLStudio/docs_proposals/
├── api/                    # Auto-generated API docs
├── tutorials/              # Step-by-step guides
├── examples/               # Complete examples
├── recipes/                # Quick recipes
└── guides/                 # Conceptual guides
```

**Estimated Time**: 2-3 days

---

### Phase 1 Sprint Breakdown

**Week 1-2**:
- ✅ Day 1-2: Lighting utilities port + tests
- ✅ Day 3-4: Noise library completion + verification
- ✅ Day 5-6: Testing infrastructure setup
- ✅ Day 7-10: Helper functions + initial tests

**Week 3-4**:
- ✅ Day 11-13: SDF library expansion
- ✅ Day 14-16: Documentation framework
- ✅ Day 17-18: Integration testing
- ✅ Day 19-20: Phase 1 review and polish

**Phase 1 Acceptance**:
- [ ] All core utilities ported and tested
- [ ] 80%+ test coverage
- [ ] Documentation framework operational
- [ ] Demo scenes for each utility category
- [ ] Performance benchmarks passing

---

## 📅 Phase 2: Core Systems Expansion (Weeks 5-8)

### 🎯 Objectives
- Integrate fluid simulation system
- Expand material library significantly
- Build advanced particle systems
- Add comprehensive post-processing effects

### 📦 Deliverables

#### 2.1 Fluid Simulation System ⭐ HIGH PRIORITY
**Target**: `packages/tsl/compute/simulation/` and `packages/engine/compute/fluid/`

**Source**: `roquefort-main/src/simulation/`

**Modules to Port**:

```typescript
// packages/tsl/compute/simulation/fluid/

├── operators/
│   ├── advection.ts        ⭕ PORT (semi-Lagrangian)
│   ├── diffusion.ts        ⭕ PORT
│   ├── divergence.ts       ⭕ PORT
│   ├── pressure.ts         ⭕ PORT (Jacobi iteration)
│   ├── gradientSubtract.ts ⭕ PORT
│   ├── vorticity.ts        ⭕ PORT (vorticity confinement)
│   └── boundary.ts         ⭕ PORT (boundary conditions)
│
├── emitters/
│   ├── point.ts            ⭕ NEW
│   ├── line.ts             ⭕ NEW
│   ├── circle.ts           ⭕ NEW
│   └── custom.ts           ⭕ NEW
│
└── rendering/
    ├── particles.ts        ⭕ PORT
    ├── splatting.ts        ⭕ NEW
    └── volumetric.ts       ⭕ NEW

// packages/engine/compute/fluid/

├── fluid2d.ts              ✅ EXISTS → ENHANCE
├── fluid3d.ts              ⭕ NEW (3D fluid solver)
└── fluidManager.ts         ⭕ NEW (high-level API)
```

**Key Features**:
- Complete 2D Navier-Stokes solver
- Vorticity confinement for turbulence
- Multiple emitter types
- Particle-based visualization
- Dye injection system
- Interactive forces

**Acceptance Criteria**:
- [ ] 2D fluid solver working at 60 FPS (512x512 grid)
- [ ] Multiple emitters functional
- [ ] Visual quality matches roquefort
- [ ] Interactive mouse/touch forces
- [ ] Demo scene: interactive fluid painting
- [ ] Demo scene: smoke simulation
- [ ] Performance profiled and optimized

**Estimated Time**: 6-8 days

---

#### 2.2 Advanced Particle Systems
**Target**: `packages/engine/compute/particles/`

**Sources**: 
- `portfolio-main/src/app/lab/` (particle examples)
- `three.js-tsl-sandbox/particles-*`

**Modules to Create**:

```typescript
// packages/engine/compute/particles/

├── systems/
│   ├── basic.ts            ✅ EXISTS → Enhance
│   ├── morphing.ts         ⭕ PORT from particles-morphing-2
│   ├── flowField.ts        ⭕ PORT from flow-field
│   ├── collision.ts        ⭕ PORT from attractor-collisions
│   └── gpgpu.ts            ⭕ PORT from fbo-particles
│
├── forces/
│   ├── gravity.ts          ⭕ NEW
│   ├── wind.ts             ⭕ NEW
│   ├── turbulence.ts       ⭕ NEW
│   ├── curl.ts             ✅ EXISTS (curlNoise.ts) → Integrate
│   └── attractor.ts        ⭕ NEW
│
├── emitters/
│   ├── point.ts            ⭕ NEW
│   ├── mesh.ts             ⭕ PORT from particles-model-shape
│   ├── volume.ts           ⭕ NEW
│   └── curve.ts            ⭕ NEW
│
└── rendering/
    ├── points.ts           ✅ EXISTS
    ├── sprites.ts          ⭕ NEW
    ├── trails.ts           ⭕ NEW
    └── instanced.ts        ⭕ NEW (from tsl-particle-waves)
```

**Key Features**:
- Shape morphing between geometries
- Flow field following
- Collision detection and response
- GPGPU simulation (FBO ping-pong)
- Mesh surface emission
- Trail rendering

**Acceptance Criteria**:
- [ ] 500k+ particles at 60 FPS
- [ ] Morphing system working smoothly
- [ ] Flow field system integrated
- [ ] Collision detection accurate
- [ ] Demo: morphing shapes
- [ ] Demo: flow field art
- [ ] Demo: particle fireworks

**Estimated Time**: 7-10 days

---

#### 2.3 Material Library Phase 1
**Target**: `packages/engine/materials/` and `packages/tsl/materials/`

**Modules to Create**:

```typescript
// packages/engine/materials/

├── physical/
│   ├── glass.ts            ⭕ NEW (transmission + roughness)
│   ├── metal.ts            ⭕ NEW (metalness presets)
│   ├── fabric.ts           ⭕ NEW (sheen + subsurface)
│   ├── skin.ts             ⭕ NEW (SSS approximation)
│   ├── ceramic.ts          ⭕ NEW (clearcoat)
│   └── water.ts            ⭕ PORT from infinite-water
│
├── procedural/
│   ├── hologram.ts         ⭕ PORT from tsl-sandbox
│   ├── fresnel.ts          ⭕ NEW
│   ├── iridescent.ts       ✅ EXISTS → Enhance
│   ├── triplanar.ts        ✅ EXISTS → Enhance
│   └── noise.ts            ⭕ NEW (noise-driven materials)
│
├── stylized/
│   ├── toon.ts             ⭕ NEW (cel shading)
│   ├── halftone.ts         ⭕ PORT from tsl-sandbox
│   ├── sketch.ts           ⭕ NEW
│   └── pixelArt.ts         ⭕ NEW
│
└── special/
    ├── portal.ts           ⭕ PORT from portal-scene
    ├── dissolve.ts         ⭕ PORT from dissolve example
    ├── glitch.ts           ⭕ NEW
    └── force_field.ts      ⭕ NEW
```

**Material Presets Target**: 50+ presets

**Acceptance Criteria**:
- [ ] All physical materials photo-realistic
- [ ] Procedural materials animatable
- [ ] Stylized materials art-directable
- [ ] Material showcase demo working
- [ ] Material builder system implemented
- [ ] Preset manager functional

**Estimated Time**: 6-8 days

---

#### 2.4 Post-Processing Expansion
**Target**: `packages/tsl/post/effects/`

**Modules to Port/Create**:

```typescript
// packages/tsl/post/effects/

├── [Existing] ✅
│   ├── bloom.ts
│   ├── taa.ts
│   ├── vignette.ts
│   ├── filmgrain.ts
│   ├── chromaticAberration.ts
│   └── [other existing]
│
└── [New/Enhanced] ⭕
    ├── halftone.ts         ⭕ PORT from tsl-sandbox
    ├── ascii.ts            ⭕ NEW (ASCII art effect)
    ├── crt.ts              ⭕ NEW (CRT screen effect)
    ├── glitch.ts           ⭕ NEW (glitch effect)
    ├── datamosh.ts         ⭕ NEW (datamosh effect)
    ├── edgeDetection.ts    ⭕ NEW (edge detection)
    ├── posterize.ts        ⭕ NEW (posterization)
    └── duotone.ts          ⭕ NEW (duotone effect)
```

**Effect Chain System**:
```typescript
// packages/engine/fx/chain.ts

- Enhance existing chain system
- Add preset chains (Cinema, Tech, Retro, etc.)
- GPU timing per pass
- Quality presets (Low/Med/High/Ultra)
```

**Acceptance Criteria**:
- [ ] All effects working in chain
- [ ] Performance optimized (< 5ms total)
- [ ] Preset chains implemented
- [ ] Post-processing showcase demo
- [ ] GPU timing integrated
- [ ] Quality scaling functional

**Estimated Time**: 4-6 days

---

### Phase 2 Sprint Breakdown

**Week 5-6**:
- ✅ Day 1-3: Fluid simulation operators port
- ✅ Day 4-6: Fluid emitters and rendering
- ✅ Day 7-10: Advanced particle systems setup

**Week 7-8**:
- ✅ Day 11-13: Material library phase 1
- ✅ Day 14-16: Post-processing expansion
- ✅ Day 17-18: Integration and testing
- ✅ Day 19-20: Phase 2 review and demos

**Phase 2 Acceptance**:
- [ ] Fluid simulation fully functional
- [ ] Advanced particles working
- [ ] 20+ new materials
- [ ] 10+ new post effects
- [ ] Comprehensive demo scenes
- [ ] Performance targets met

---

## 📅 Phase 3: Advanced Effects (Weeks 9-12)

### 🎯 Objectives
- Implement screen-space effects (SSR, GTAO, SSGI)
- Add advanced blur and DOF
- Create color grading system
- Enhance framegraph for MRT and history buffers

### 📦 Deliverables

#### 3.1 Screen-Space Effects ⭐ CRITICAL
**Target**: `packages/engine/fx/`

**Sources**: 
- `ssr-gtao-keio/src/script.js`
- `ssgi-ssr-painter/src/script.js`
- `three.js-r181/examples/jsm/nodes/display/`

**Modules to Create**:

```typescript
// packages/engine/fx/

├── ssr.ts                  ⭕ PORT (Screen Space Reflections)
├── gtao.ts                 ⭕ PORT (Ground Truth AO)
├── ssgi.ts                 ⭕ PORT (Screen Space GI)
└── ssao.ts                 ⭕ NEW (Screen Space AO - simpler)
```

**Key Features**:
- **SSR**: Ray-traced reflections in screen space
- **GTAO**: High-quality ambient occlusion
- **SSGI**: Indirect lighting approximation
- All with temporal accumulation and spatial filtering

_Progress (Nov 4): Temporal accumulation + screen-space quality presets implemented via `TemporalAccumulationNode` and `ScreenSpaceQualityPreset` (see `packages/engine/src/fx/screenspace.ts`)._

**Framegraph Enhancements Required**:
```typescript
// packages/engine/core/framegraph.ts

- Add MRT (Multiple Render Targets) support
- Add history buffer management
- Add G-buffer pass
- Add depth reconstruction
- Add normal reconstruction
```

**Acceptance Criteria**:
- [ ] SSR working with realistic reflections
- [ ] GTAO producing smooth AO
- [ ] SSGI providing convincing indirect lighting
- [ ] Temporal accumulation stable
- [ ] Spatial filtering smooth
- [ ] Performance acceptable (30+ FPS @ 1080p)
- [ ] Quality presets (Low/Med/High)
- [ ] Demo scene showcasing all effects

**Estimated Time**: 8-10 days

---

#### 3.2 Advanced Blur & DOF
**Target**: `packages/engine/fx/`

**Modules to Create**:

```typescript
// packages/engine/fx/

├── blur/
│   ├── gaussian.ts         ✅ IMPLEMENTED (separable gaussian)
│   ├── radial.ts           ✅ IMPLEMENTED (radial blur)
│   ├── directional.ts      ✅ IMPLEMENTED (directional blur)
│   └── bokeh.ts            ✅ IMPLEMENTED (bokeh DOF routing)
│
└── dof/
    ├── advanced.ts         ✅ IMPLEMENTED (advanced DOF)
    ├── bokeh_circular.ts   ✅ IMPLEMENTED
    └── bokeh_hexagonal.ts  ✅ IMPLEMENTED
```

**Acceptance Criteria**:
- [x] Gaussian blur optimized (compute shader)
- [x] DOF with realistic bokeh shapes
- [x] Focus distance and aperture controls
- [x] Smooth transitions
- [ ] Demo with camera rack focus

**Estimated Time**: 3-4 days

---

#### 3.3 Color Grading System
**Target**: `packages/engine/fx/colorGrading/`

**Modules to Create**:

```typescript
// packages/engine/fx/colorGrading/

├── lut3d.ts                ✅ IMPLEMENTED (3D LUT support)
├── curves.ts               ✅ IMPLEMENTED (curves adjustment)
├── tonemapping/
│   ├── aces.ts             ✅ IMPLEMENTED
│   ├── filmic.ts           ✅ IMPLEMENTED
│   ├── reinhard.ts         ✅ IMPLEMENTED
│   └── custom.ts           ✅ IMPLEMENTED
│
└── presets/
    ├── cinematic.ts        ✅ IMPLEMENTED
    ├── game.ts             ✅ IMPLEMENTED
    ├── retro.ts            ✅ IMPLEMENTED
    └── vibrant.ts          ✅ IMPLEMENTED
```

**Acceptance Criteria**:
- [x] 3D LUT loading and application
- [x] Custom curve support
- [x] Multiple tonemapping operators
- [x] 10+ presets
- [x] Real-time adjustment
- [ ] Demo with before/after comparison

**Estimated Time**: 3-4 days

---

### Phase 3 Sprint Breakdown

**Week 9-10**:
- ✅ Day 1-3: Framegraph MRT enhancements
- ✅ Day 4-6: SSR implementation
- ✅ Day 7-10: GTAO implementation

**Week 11-12**:
- ✅ Day 11-13: SSGI implementation
- ✅ Day 14-16: Advanced blur & DOF
- ✅ Day 17-18: Color grading system
- ✅ Day 19-20: Phase 3 integration and polish

---

*[Continue to Part 3: Phase 4-5 & Implementation Details]*

# 🚀 TSLStudio — Development Plan Part 3: Final Phases & Website Integration

> **Part 3 of Comprehensive Development Plan v1.0**

---

## 📅 Phase 4: Geometry, Animation & Procedural (Weeks 13-16)

### 🎯 Objectives
- Add geometry modifiers and deformation
- Build animation and morphing systems
- Create procedural generation utilities
- Expand scene composition tools

### 📦 Deliverables

#### 4.1 Geometry Modifiers
**Target**: `packages/tsl/utils/geometry/`

**Modules to Create**:

```typescript
// packages/tsl/utils/geometry/

├── modifiers/
│   ├── displacement.ts     ⭕ NEW
│   ├── twist.ts            ⭕ NEW
│   ├── bend.ts             ⭕ NEW
│   ├── taper.ts            ⭕ NEW
│   ├── wave.ts             ⭕ NEW
│   └── ripple.ts           ⭕ NEW
│
└── helpers/
    ├── applyToMesh.ts      ⭕ NEW
    ├── applyToSDF.ts       ⭕ NEW
    └── normalize.ts        ⭕ NEW
```

**Source audit (Nov 4)**:

| Target | Primary source | Notes |
| --- | --- | --- |
| `displacement.ts` | `portfolio-main/src/app/lab/displaced-sphere/shaders/vertex.glsl` | Simple normal-based displacement; also see `tsl-custom-node-material.ts` for uniform-driven strength. |
| `twist.ts` | `TSLwebgpuExamples/three.js-tsl-sandbox-master/coffee-smoke/src/script.js` | Uses `positionLocal.xz.rotateUV` driven by noise—port as axial twist helper with optional profile mask. |
| `bend.ts` | `three.js-r181/examples/jsm/modifiers/CurveModifier.js` + `CurveModifierGPU.js` | Provides curve-space transform and basis construction for bending meshes along splines. |
| `taper.ts` | `three.js-r181/examples/jsm/modifiers/CurveModifier.js` (spine weighting) | Derive taper from curve modifier x-weight controls; add linear/curve-based scale falloff. |
| `wave.ts` | `portfolio-main/src/app/lab/plane-wave/shaders/vertex.glsl`, `vertex-wave-animation/shaders/vertex.glsl` | Sinusoidal displacement along configurable axis/radius. |
| `ripple.ts` | `three.js-tsl-sandbox-master/procedural-terrain/src/script.js` (elevation sampling) + `THREEJSr181-WEBGPU_EXAMPLES` ripple section | ✅ Implemented radial ripple with distance falloff & temporal phase. |
| `helpers/applyToMesh.ts` | Existing engine patterns (`createPostProcessingPass` resource wiring) | Provide ergonomic wrapper to apply modifier nodes to mesh geometries. |
| `helpers/applyToSDF.ts` | Current SDF utils in `packages/tsl/utils/sdf/operations.ts` | Mirror mesh modifier APIs for SDF compositions. |

_Progress (Nov 4): Core helpers `applyDisplacement`, `applyTwist`, `applyBend`, `applyTaper`, `applyWave`, and `applyRipple` implemented under `packages/tsl/utils/geometry/` with unit coverage. Helper wrappers for mesh/SDF integration remain outstanding._

**Acceptance Criteria**:
- [ ] All modifiers work on meshes
- [ ] All modifiers work with SDFs
- [ ] Smooth, artifact-free deformations
- [ ] Demo scene with interactive controls
- [ ] Performance optimized

**Estimated Time**: 3-4 days

---

#### 4.2 Animation & Morphing
**Target**: `packages/engine/animation/`

**Modules to Create**:

```typescript
// packages/engine/animation/

├── morphing/
│   ├── position.ts         ✅ PORT from particles-morphing-2
│   ├── shape.ts            ✅ IMPLEMENTED
│   ├── texture.ts          ⭕ NEW
│   └── manager.ts          ⭕ NEW (high-level API)
│
├── procedural/
│   ├── noise.ts            ⭕ NEW (noise-based animation)
│   ├── wave.ts             ✅ INITIAL IMPLEMENTATION (wave track helper)
│   ├── flow.ts             ⭕ NEW (flow animation)
│   └── spring.ts           ⭕ NEW (spring physics)
│
└── easing/
    ├── functions.ts        ✅ IMPLEMENTED (ease helpers)
    ├── interpolation.ts    ⭕ NEW
    └── curves.ts           ⭕ NEW
```

**Source audit (Nov 4)**:

| Target | Primary source | Notes |
| --- | --- | --- |
| `morphing/position.ts` | `portfolio-main/src/app/lab/fbo-particles-morphing/` + `particles-morphing-2/SimulationMaterial.tsx` | GPU morph target blending via dual position textures; informs particle morph API and compute helpers. |
| `morphing/shape.ts` | `three.js/src/nodes/accessors/MorphNode.js` | Native morph node utilities for mesh targets; adapt to engine wrapper. |
| `morphing/texture.ts` | `portfolio-main/src/app/lab/particles-model-shape/` | Texture-driven morph targets for particle systems. |
| `procedural/noise.ts` | `TSLwebgpuExamples/three.js-tsl-sandbox-master/coffee-smoke/src/script.js` | Uses `timerGlobal` + noise to drive positionNode; serves as base procedural modifier set. |
| `procedural/flow.ts` | `three.js-tsl-sandbox-master/particles-flow-field/src/script.js` | Flow-field animation using buffer sampling; template for vector-field driven motion. |
| `procedural/wave.ts` | `portfolio-main/src/app/lab/vertex-wave-animation/` & `plane-wave/` | Vertex wave deformation patterns for reusable oscillation nodes. |
| `procedural/spring.ts` | `portfolio-main/src/app/glsl-utils/cubic-bezier.glsl` + GSAP-inspired easing usages (`distorted-scroller`) | Define spring/easing helpers for timeline-style animation curves. |
| `easing/functions.ts` | `portfolio-main/src/app/glsl-utils/cubic-bezier.glsl` | Provides bezier evaluation utility for easing curves; port into reusable TSL nodes. |
| `easing/interpolation.ts` | `three.js/examples/jsm/math/CubicBezierCurve3.js` & animation docs | Reference for interpolation across control points. |
| `manager.ts` | Existing engine state system (`packages/engine/src/core/framegraph.ts`) + preset controllers | Plan: animation registry managing tick/update, integrates with framegraph delta. |

_Progress (Nov 4): `animation/morphing/position.ts`, `animation/morphing/shape.ts`, easing helpers, `AnimationManager`, and initial wave procedural helper implemented. Textured morphing, flow/spring tracks, and advanced interpolation remain._

**Acceptance Criteria**:
- [ ] Smooth morphing between shapes
- [ ] Procedural animation working
- [ ] Easing functions in TSL
- [ ] Demo: morphing objects
- [ ] Demo: procedural motion

**Estimated Time**: 4-5 days

---

#### 4.3 Procedural Generation
**Target**: `packages/engine/procedural/`

**Sources**: 
- `tsl-sandbox/procedural-terrain/`
- `tsl-sandbox/raging-sea/`

**Modules to Port/Create**:

```typescript
// packages/engine/procedural/

├── terrain/
│   ├── heightMap.ts        ✅ IMPLEMENTED
│   ├── erosion.ts          ✅ IMPLEMENTED
│   ├── multiOctave.ts      ✅ IMPLEMENTED
│   └── generator.ts        ⭕ PORT
│
├── clouds/
│   ├── volumetric.ts       ⭕ NEW (3D noise clouds)
│   ├── raymarched.ts       ✅ IMPLEMENTED
│   └── animated.ts         ✅ IMPLEMENTED
│
├── ocean/
│   ├── surface.ts          ⭕ PORT from raging-sea
│   ├── foam.ts             ✅ IMPLEMENTED
│   └── caustics.ts         ✅ IMPLEMENTED
│
└── other/
    ├── rocks.ts            ⭕ NEW (rock formations)
    └── vegetation.ts       ⭕ NEW (basic vegetation)
```

**Source audit (Nov 4)**:

| Target | Primary source | Notes |
| --- | --- | --- |
| `terrain/heightMap.ts` & `multiOctave.ts` | `three.js-tsl-sandbox-master/procedural-terrain/src/script.js` | Height map + new multi-octave layering helper normalize stacked noise for consistent elevation. |
| `ocean/surface.ts` | `three.js-tsl-sandbox-master/raging-sea/src/script.js` | Multi-layer wave system with large/small wave controls (surface implemented). |
| `terrain/erosion.ts` | Same procedural terrain demo | Implemented initial erosion smoothing node with strength/min/max clamps; future compute-based iteration possible. |
| `clouds/volumetric.ts` | `three.js docs/webgpu_compute_texture_3d` (cloud example in knowledge docs) | Raymarched 3D noise texture updated via compute shader; forms basis for volumetric cloud node + compute pass. |
| `clouds/raymarched.ts` | `three.js` Raymarching utilities (`RaymarchingBox`) | Implemented lightweight ray-marched mask accumulating density for silhouettes. |
| `clouds/animated.ts` | `coffee-smoke/src/script.js`, `procedural-terrain` wind offset logic | Implemented wind-advected, noise-swirled density helper for evolving cloud formations. |
| `ocean/surface.ts` | `three.js-tsl-sandbox-master/raging-sea/src/script.js` | Combines large/small wave layers, normal recompute, emissive modulation. |
| `ocean/foam.ts` | Raging sea emissive & mix controls | Implemented slope + noise driven foam mask helper with engine wrapper for crest highlights. |
| `ocean/caustics.ts` | `portfolio-main` water/caustics demos (e.g. `infinite-water`) | Implemented animated caustic mask with depth-aware attenuation for emissive highlights. |
| `other/rocks.ts` | `procedural-terrain` brush/evaluator usage | Use CSG / noise-based shaping for rock formations. |
| `other/vegetation.ts` | `portfolio-main` vegetation/palette utilities | Combine noise scatter with color remap for procedural vegetation. |

_Progress (Nov 4): Terrain height & erosion nodes implemented with engine wrappers; ocean surface + foam + caustic masks + volumetric, raymarched, and animated cloud helpers live. Next: integrate procedural demos & polish._

**Acceptance Criteria**:
- [ ] Terrain generation working
- [ ] Cloud system functional
- [ ] Ocean surface realistic
- [ ] Demo: procedural landscape
- [ ] Performance acceptable

**Estimated Time**: 5-6 days

---

### Phase 4 Sprint Breakdown

**Week 13-14**:
- ✅ Day 1-4: Geometry modifiers
- ✅ Day 5-9: Animation & morphing systems
- ✅ Day 10: Integration testing

**Week 15-16**:
- ✅ Day 11-16: Procedural generation
- ✅ Day 17-18: Scene composition tools
- ✅ Day 19-20: Phase 4 review and demos

---

## 📅 Phase 5: Polish, Website & Launch (Weeks 17-20)

### 🎯 Objectives
- Complete documentation
- Build canvas-first website
- Create showcase galleries
- Performance optimization
- Testing and QA
- Launch preparation

### 📦 Deliverables

#### 5.1 Complete Documentation
**Target**: `TSLStudio/docs/` and documentation site

**Documentation Structure**:

```
docs/
├── api/                        # Auto-generated API reference
│   ├── engine/
│   ├── tsl/
│   └── studio/
│
├── tutorials/                  # Step-by-step tutorials
│   ├── getting-started.md
│   ├── materials/
│   ├── post-processing/
│   ├── particles/
│   ├── fluids/
│   └── advanced/
│
├── examples/                   # Complete examples
│   ├── basic/
│   ├── intermediate/
│   └── advanced/
│
├── recipes/                    # Quick recipes
│   ├── materials.md
│   ├── effects.md
│   ├── compute.md
│   └── optimization.md
│
└── guides/                     # Conceptual guides
    ├── architecture.md
    ├── performance.md
    ├── best-practices.md
    └── troubleshooting.md
```

**Content Goals**:
- [ ] 100% API coverage
- [ ] 30+ tutorials
- [ ] 50+ examples
- [ ] 100+ recipes
- [ ] 10+ guides

**Estimated Time**: 5-6 days

---

#### 5.2 Canvas-First Website Architecture
**Target**: `packages/studio/` routes and components

**Website Structure** (from vision documents):

```typescript
// Route structure

packages/studio/routes/
├── __root.tsx              ✅ EXISTS
├── index.tsx               ✅ EXISTS → ENHANCE (home)
├── labs/                   ⭕ NEW
│   ├── index.tsx           → Labs landing
│   ├── materials.tsx       → Material lab
│   ├── post-fx.tsx         → Post-FX lab
│   ├── particles.tsx       → Particle lab
│   ├── fluids.tsx          → Fluid lab
│   └── compute.tsx         → Compute lab
│
├── gallery/                ⭕ NEW
│   ├── index.tsx           → Gallery landing
│   ├── stills.tsx          → Still images
│   └── animations.tsx      → Animated clips
│
├── articles/               ⭕ NEW
│   ├── index.tsx           → Articles list
│   └── [slug].tsx          → Individual article
│
├── playlists/              ⭕ NEW
│   └── [id].tsx            → Playlist viewer
│
├── about.tsx               ⭕ NEW
└── admin/                  ⭕ NEW (guarded)
    ├── presets.tsx         → Preset management
    └── content.tsx         → Content management
```

**Key Features**:
- **Persistent Canvas**: Scene morphs across routes
- **State Management**: Single source of truth (EngineState)
- **Presets System**: Versioned scene recipes
- **Snapshots**: Full state + capture
- **Agent Bridge**: Parameter registry + intent mapping
- **Performance HUD**: Frame time, GPU metrics
- **Export/Share**: State bundles, images, videos

**Components to Build**:

```typescript
// packages/studio/components/

├── engine/                 ⭕ NEW
│   ├── EngineState.tsx     → State provider
│   ├── PresetManager.tsx   → Preset controls
│   ├── SnapshotCapture.tsx → Capture tool
│   └── ParameterPanel.tsx  → Parameter controls
│
├── ui/                     ⭕ NEW
│   ├── HUD.tsx             → Performance HUD
│   ├── CommandPalette.tsx  → Command palette (/)
│   ├── PresetBar.tsx       → Preset selector
│   └── ExportDialog.tsx    → Export options
│
├── content/                ⭕ NEW
│   ├── ArticleOverlay.tsx  → Article reader
│   ├── GlossaryChip.tsx    → Inline glossary
│   └── StateBinding.tsx    → Content↔State binding
│
└── labs/                   ⭕ NEW
    ├── MaterialLab.tsx     → Material explorer
    ├── PostFXLab.tsx       → Post-FX explorer
    ├── ParticleLab.tsx     → Particle playground
    └── FluidLab.tsx        → Fluid playground
```

**Estimated Time**: 8-10 days

---

#### 5.3 Showcase Galleries & Demos
**Target**: Comprehensive demo scenes

**Demo Categories**:

```typescript
// packages/studio/demos/

├── materials/
│   ├── pbr-showcase.ts     ✅ EXISTS → Enhance
│   ├── physical-materials.ts ⭕ NEW
│   ├── procedural-materials.ts ⭕ NEW
│   ├── stylized-materials.ts ⭕ NEW
│   └── special-fx-materials.ts ⭕ NEW
│
├── postfx/
│   ├── cinema-preset.ts    ⭕ NEW
│   ├── screen-space-gi.ts  ⭕ NEW
│   ├── dof-showcase.ts     ⭕ NEW
│   └── color-grading.ts    ⭕ NEW
│
├── particles/
│   ├── basic-particles.ts  ✅ EXISTS
│   ├── morphing-demo.ts    ⭕ NEW
│   ├── flow-field-art.ts   ⭕ NEW
│   └── particle-physics.ts ⭕ NEW
│
├── fluids/
│   ├── fluid-painting.ts   ⭕ NEW
│   ├── smoke-sim.ts        ⭕ NEW
│   └── interactive-fluid.ts ⭕ NEW
│
├── compute/
│   ├── sdf-raymarching.ts  ⭕ NEW
│   ├── procedural-terrain.ts ⭕ NEW
│   └── gpu-simulation.ts   ⭕ NEW
│
└── complete/
    ├── peacock-alloy.ts    ⭕ NEW (from vision)
    ├── starry-flow.ts      ⭕ NEW (from vision)
    ├── ghost-particles.ts  ⭕ NEW (from vision)
    └── tone-mapping-101.ts ⭕ NEW (from vision)
```

**North-Star Demos** (from vision documents):
1. **Peacock Alloy**: Anisotropic metal + thin-film + moody grade + bloom
2. **Starry Flow**: Flow-field growth lines + DOF + rack focus
3. **Ghost Particles**: Surface particles + curl lift + seed replay
4. **Tone-Mapping 101**: Interactive article driving presets

**Estimated Time**: 6-8 days

---

#### 5.4 Performance Optimization
**Target**: System-wide performance improvements

**Optimization Tasks**:

**CPU Optimization**:
- [ ] Profile all modules (Chrome DevTools)
- [ ] Optimize hot paths
- [ ] Reduce allocations
- [ ] Cache expensive calculations
- [ ] Lazy initialization

**GPU Optimization**:
- [ ] Profile GPU passes (WebGPU profiling)
- [ ] Optimize shader complexity
- [ ] Reduce texture reads
- [ ] Optimize buffer management
- [ ] Implement adaptive quality

**Memory Optimization**:
- [ ] Track GPU allocations
- [ ] Implement disposal patterns
- [ ] Pool buffers/textures
- [ ] Lazy loading
- [ ] Streaming for large assets

**Adaptive Quality System**:
```typescript
// packages/engine/core/adaptiveQuality.ts

class AdaptiveQuality {
  // Auto-scale based on frame time
  - Dynamic resolution scaling
  - LOD system
  - Effect quality presets
  - Graceful degradation
}
```

**Performance Targets**:
- [ ] 60 FPS @ 1080p (mid-range GPU)
- [ ] 30 FPS @ 4K (high-end GPU)
- [ ] 30 FPS @ 720p (mobile/integrated)
- [ ] < 2.5s initial load
- [ ] < 8ms frame time spikes
- [ ] < 500ms TAA restabilization

**Estimated Time**: 4-5 days

---

#### 5.5 Testing & QA
**Target**: Comprehensive test coverage

**Test Categories**:

**Unit Tests**:
```typescript
// Target: 80%+ coverage

packages/tsl/__tests__/
├── noise.test.ts
├── materials.test.ts
├── post.test.ts
├── compute.test.ts
└── utils.test.ts

packages/engine/__tests__/
├── core.test.ts
├── materials.test.ts
├── fx.test.ts
└── compute.test.ts
```

**Integration Tests**:
```typescript
// Test complete pipelines

__tests__/integration/
├── renderer-pipeline.test.ts
├── post-fx-chain.test.ts
├── particle-system.test.ts
└── material-builder.test.ts
```

**Visual Regression Tests**:
```typescript
// Screenshot comparison with tolerance

__tests__/visual/
├── materials/
│   └── [material-name].test.ts
├── effects/
│   └── [effect-name].test.ts
└── scenes/
    └── [scene-name].test.ts
```

**Performance Benchmarks**:
```typescript
// Automated performance tracking

__tests__/benchmarks/
├── render-performance.bench.ts
├── compute-performance.bench.ts
├── memory-usage.bench.ts
└── load-time.bench.ts
```

**Cross-Browser Testing**:
- [ ] Chrome (primary)
- [ ] Firefox (WebGPU support)
- [ ] Edge (WebGPU support)
- [ ] Safari (future WebGPU support)

**Estimated Time**: 6-8 days

---

### Phase 5 Sprint Breakdown

**Week 17-18**:
- ✅ Day 1-3: Documentation completion
- ✅ Day 4-8: Canvas-first website build
- ✅ Day 9-10: Integration testing

**Week 19-20**:
- ✅ Day 11-14: Showcase galleries & demos
- ✅ Day 15-17: Performance optimization
- ✅ Day 18-19: Final QA & testing
- ✅ Day 20: Launch preparation

**Phase 5 Acceptance**:
- [ ] All documentation complete
- [ ] Website fully functional
- [ ] All demos working
- [ ] Performance targets met
- [ ] All tests passing
- [ ] Ready for public launch

---

## 🔄 Porting Strategy & Guidelines

### Direct-Port Policy

**Philosophy**: Keep working code working
- Copy original files **verbatim** initially
- Only adapt imports, paths, and types
- Maintain original logic unchanged
- Add TypeScript types and JSDoc
- Create thin adapter layers only

### Porting Workflow

**Step 1: Identify Source**
```bash
# Example: Porting lighting utilities
SOURCE: RESOURCES/REPOSITORIES/portfolio examples/portfolio-main/
        src/utils/webgpu/nodes/lighting/fresnel.ts

TARGET: TSLStudio/packages/tsl/utils/lighting/fresnel.ts
```

**Step 2: Copy & Adapt**
```typescript
// Source (portfolio-main)
import { Fn, dot } from 'three/tsl'

export const fresnelNode = Fn(([...]) => {
  // original logic
})

// Target (TSLStudio) - Add types, JSDoc, layout
import { Fn, type ShaderNodeObject, dot } from 'three/tsl'
import type { Node } from 'three/webgpu'

/**
 * Fresnel effect calculation
 * 
 * @param viewDir - View direction (normalized vec3)
 * @param normal - Surface normal (normalized vec3)
 * @param power - Fresnel power (float)
 * @returns Fresnel value (float)
 * 
 * @example
 * ```typescript
 * const fresnel = fresnelFn(viewDir, normal, float(5.0))
 * ```
 */
export const fresnelFn = Fn<[
  ShaderNodeObject<Node>,
  ShaderNodeObject<Node>, 
  ShaderNodeObject<Node>
]>(([viewDir, normal, power]) => {
  // original logic (unchanged)
  const ndotv = max(0, dot(viewDir, normal))
  return pow(sub(1, ndotv), power)
}).setLayout({
  name: 'fresnel',
  type: 'float',
  inputs: [
    { name: 'viewDir', type: 'vec3' },
    { name: 'normal', type: 'vec3' },
    { name: 'power', type: 'float' }
  ]
})
```

**Step 3: Test**
```typescript
// packages/tsl/utils/lighting/__tests__/fresnel.test.ts

import { describe, it, expect } from 'vitest'
import { fresnelFn } from '../fresnel'
import { vec3, float } from 'three/tsl'

describe('fresnelFn', () => {
  it('should return 0 for parallel vectors', () => {
    // test implementation
  })
  
  it('should return 1 for perpendicular vectors', () => {
    // test implementation
  })
})
```

**Step 4: Document**
```typescript
// Add to index.ts
export * from './fresnel'

// Add usage example to docs/recipes/lighting.md
```

### Code Quality Standards

**TypeScript**:
- ✅ Strict mode enabled
- ✅ Explicit types for all exports
- ✅ No `any` types (use `unknown` if necessary)
- ✅ Proper type imports (`type` keyword)

**Documentation**:
- ✅ JSDoc for all exports
- ✅ Parameter descriptions
- ✅ Return value descriptions
- ✅ Usage examples
- ✅ Links to related functions

**Testing**:
- ✅ Unit tests for all functions
- ✅ Visual tests for effects
- ✅ Performance benchmarks for compute
- ✅ Integration tests for systems

**Attribution**:
```typescript
/**
 * Ported from: [source repository]
 * Original author: [author name]
 * License: [license type]
 * 
 * Adaptations:
 * - Added TypeScript types
 * - Enhanced with [feature]
 * - Optimized for [aspect]
 */
```

---

## 📊 Success Metrics & KPIs

### Technical Metrics

**Performance**:
- ✅ 60 FPS @ 1080p (RTX 2070 class)
- ✅ 30 FPS @ 4K (RTX 3080 class)
- ✅ < 16.7ms frame time
- ✅ < 5ms post-FX chain
- ✅ < 2.5s initial load

**Quality**:
- ✅ < 0.1% error rate
- ✅ 100% graceful fallbacks
- ✅ 80%+ test coverage
- ✅ Visual parity with sources

**Completeness**:
- ✅ 100+ modules
- ✅ 50+ material presets
- ✅ 30+ post effects
- ✅ 20+ compute utilities
- ✅ 50+ examples

### User Metrics

**Engagement**:
- Time on site
- Preset interactions per session
- Lab dwell time
- Export/share rate

**Creation Velocity**:
- Median time to publish-worthy visual < 5 minutes
- Average presets used per session
- Custom modifications rate

**Education**:
- Tutorial completion rate ≥ 90%
- Cookbook task success rate ≥ 90%
- Documentation search success rate

---

## 🎯 Launch Readiness Checklist

### Code Quality ✅
- [ ] All modules TypeScript strict mode
- [ ] No console errors/warnings
- [ ] Code review completed
- [ ] Linting passing (100%)
- [ ] Formatting consistent

### Documentation ✅
- [ ] API reference complete (100%)
- [ ] Tutorials complete (30+)
- [ ] Examples complete (50+)
- [ ] Recipes complete (100+)
- [ ] README updated

### Performance ✅
- [ ] All targets met
- [ ] Optimizations complete
- [ ] Memory leaks fixed
- [ ] Load times acceptable
- [ ] Adaptive quality working

### Testing ✅
- [ ] Unit tests passing (100%)
- [ ] Integration tests passing (100%)
- [ ] Visual tests passing (100%)
- [ ] Performance benchmarks passing
- [ ] Coverage > 80%
- [ ] Cross-browser tested

### Features ✅
- [ ] All planned modules implemented
- [ ] All demos working
- [ ] Website fully functional
- [ ] Agent bridge operational
- [ ] Export/share working

### Content ✅
- [ ] North-star demos complete
- [ ] Showcase gallery complete
- [ ] Article system working
- [ ] Preset library complete (50+)
- [ ] Video demos created

### Infrastructure ✅
- [ ] CI/CD operational
- [ ] Deployment automated
- [ ] Monitoring setup
- [ ] Error tracking
- [ ] Analytics (opt-in)

---

## 📝 Next Actions (Immediate)

### Sprint 0: Setup (This Week)
1. ✅ Review this comprehensive plan
2. ⭕ Setup development environment
3. ⭕ Configure testing infrastructure
4. ⭕ Create module templates
5. ⭕ Begin Phase 1 execution

### Phase 1 Kickoff (Next Week)
1. Port lighting utilities (ambient, fresnel, hemisphere, directional)
2. Complete noise library (simplex2d, voronoi, classic)
3. Expand SDF primitives (box, torus, cylinder, etc.)
4. Write first batch of tests

---

## 🎓 Learning Resources

### Three.js WebGPU & TSL
- Three.js r181 documentation
- TSL wiki on GitHub
- WebGPU specification
- Official examples

### Source Repositories
- Maxime Heckel's blog and portfolio
- Fragments boilerplate
- Roquefort fluid simulation
- TSL sandbox projects

### Community
- Three.js Discourse forum
- WebGPU community
- TSL discussions

---

*End of Comprehensive Development Plan v1.0*

**Document Version**: 1.0  
**Last Updated**: November 4, 2025  
**Status**: Foundation Phase  
**Next Review**: Weekly during active development

---

## 📚 Related Documents

1. **COMPREHENSIVE_DEVELOPMENT_PLAN_V1.md** (Part 1) - Overview & Architecture
2. **COMPREHENSIVE_DEVELOPMENT_PLAN_V1_PART2.md** (Part 2) - Phase 1-3
3. **COMPREHENSIVE_DEVELOPMENT_PLAN_V1_PART3.md** (Part 3) - Phase 4-5 & Website (This document)
4. **RESOURCE_INVENTORY.md** - Detailed resource catalog
5. **PORTING_GUIDE.md** - Step-by-step porting instructions
6. **TODO.md** - Task tracking and progress
7. **vision_blueprint_visual_md_edition_v_3.md** - Visual architecture
8. **vision_system_blueprint_engine_website_v_2_ppgo.md** - System blueprint

