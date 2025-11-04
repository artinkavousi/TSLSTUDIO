# 📦 TSLStudio Resource Inventory

> **Last Updated**: November 4, 2025  
> **Purpose**: Complete catalog of available modules across all source repositories

This document provides a detailed inventory of all modules, utilities, and systems available for porting from example repositories.

---

## 📑 Table of Contents

1. [Inventory Summary](#inventory-summary)
2. [Portfolio Examples Inventory](#portfolio-examples-inventory)
3. [Fragments Boilerplate Inventory](#fragments-boilerplate-inventory)
4. [TSL Sandbox Inventory](#tsl-sandbox-inventory)
5. [Roquefort Fluid Inventory](#roquefort-fluid-inventory)
6. [SSR/GTAO/SSGI Inventory](#ssr-gtao-ssgi-inventory)
7. [Three.js Official Examples](#threejs-official-examples)
8. [Porting Status Matrix](#porting-status-matrix)

---

## 📊 Inventory Summary

### By Category

| Category | Available | Ported | Remaining | Priority |
|----------|-----------|--------|-----------|----------|
| **Lighting Models** | 10 | 1 | 9 | 🔴 High |
| **Noise Functions** | 12 | 6 | 6 | 🔴 High |
| **SDF Primitives** | 15+ | 1 | 14+ | 🟡 Medium |
| **SDF Operations** | 12 | 2 | 10 | 🟡 Medium |
| **Post Effects** | 25+ | 6 | 19+ | 🔴 High |
| **Materials** | 20+ | 2 | 18+ | 🟡 Medium |
| **Particles** | 15+ | 1 | 14+ | 🔴 High |
| **Fluid Systems** | 8 | 1 | 7 | 🔴 High |
| **Screen Space** | 5 | 0 | 5 | 🔴 Critical |
| **Geometry Utils** | 10+ | 0 | 10+ | 🟢 Low |

### Total Modules
- **Available**: 130+
- **Ported**: 20
- **Remaining**: 110+
- **Progress**: 15%

---

## 🎨 Portfolio Examples Inventory

**Source**: `RESOURCES/REPOSITORIES/portfolio examples/portfolio-main/`

### Lighting Models (`src/utils/webgpu/nodes/lighting/`)

| Module | Type | Status | Priority | Effort | Source File |
|--------|------|--------|----------|--------|-------------|
| **diffuse** | TSL Fn | ✅ Exists | High | Low | lighting/diffuse.ts |
| **ambient** | TSL Fn | ⭕ Port | High | Low | lighting/ambient.ts |
| **directional** | TSL Fn | ⭕ Port | High | Low | lighting/directional.ts |
| **fresnel** | TSL Fn | ⭕ Port | High | Low | lighting/fresnel.ts |
| **hemisphere** | TSL Fn | ⭕ Port | High | Low | lighting/hemisphere.ts |

**Estimated Porting Time**: 1-2 days  
**Dependencies**: None  
**Impact**: High - Essential for lighting

---

### Noise Functions (`src/utils/webgpu/nodes/noise/`)

| Module | Type | Status | Priority | Effort | Source File |
|--------|------|--------|----------|--------|-------------|
| **simplex2d** | TSL Fn | ⭕ Port | High | Low | noise/simplexNoise2d.ts |
| **simplex3d** | TSL Fn | ✅ Exists | - | - | noise/simplexNoise3d.ts |
| **simplex4d** | TSL Fn | ✅ Exists | - | - | noise/simplexNoise4d.ts |
| **curlNoise3d** | TSL Fn | ✅ Exists | - | - | noise/curlNoise3d.ts |
| **curlNoise4d** | TSL Fn | ✅ Exists | - | - | noise/curlNoise4d.ts |
| **classicNoise3d** | TSL Fn | ⭕ Port | Medium | Low | noise/classicNoise3d.ts |
| **voronoi** | TSL Fn | ⭕ Port | Medium | Medium | noise/voronoi.ts |

**Estimated Porting Time**: 1 day  
**Dependencies**: None  
**Impact**: Medium - Additional noise options

---

### SDF & Helpers (`src/utils/webgpu/nodes/`)

| Module | Type | Status | Priority | Effort | Source File |
|--------|------|--------|----------|--------|-------------|
| **sdSphere** | TSL Fn | ✅ Verify | Medium | Low | sdf/sphere.ts |
| **smoothMin** | TSL Fn | ✅ Verify | Medium | Low | smooth-min.ts |
| **smoothMod** | TSL Fn | ✅ Verify | Low | Low | smooth-mod.ts |
| **remap** | TSL Fn | ⭕ Port | Medium | Low | remap.ts |
| **rotate3dY** | TSL Fn | ⭕ Port | Low | Low | rotate-3d-y.ts |
| **compose** | TSL Fn | ⭕ Port | Low | Low | compose.ts |

**Estimated Porting Time**: 0.5 days  
**Dependencies**: None  
**Impact**: Low-Medium - Helper utilities

---

### WebGPU Examples (`src/app/lab/`)

#### Particle Systems (10+ examples)

| Example | Features | Status | Priority | Complexity | Path |
|---------|----------|--------|----------|------------|------|
| **fbo-particles** | GPGPU, FBO ping-pong | ⭕ Extract | High | High | lab/fbo-particles/ |
| **particles-morphing-2** | Shape morphing | ⭕ Extract | High | High | lab/particles-morphing-2/ |
| **flow-field** | Flow field forces | ⭕ Extract | High | Medium | lab/flow-field/ |
| **attractor-collisions** | Physics, collision | ⭕ Extract | Medium | High | lab/attractor-collisions/ |
| **particles-twist** | Curl forces | ⭕ Extract | Medium | Medium | lab/particles-twist/ |
| **magic-wand-cursor** | Interactive cursor | ⭕ Extract | Low | Medium | lab/magic-wand-cursor/ |
| **particles-model-shape** | Mesh emission | ⭕ Extract | Medium | High | lab/particles-model-shape/ |
| **particles-black-hole** | Attraction field | ⭕ Extract | Medium | Medium | lab/particles-black-hole/ |
| **particles-substance** | Particle substance | ⭕ Extract | Low | Medium | lab/particles-substance/ |
| **smoke-particles** | Smoke simulation | ⭕ Extract | Medium | Medium | lab/smoke-particles/ |

**Estimated Extraction Time**: 3-4 weeks  
**Dependencies**: Compute shader utilities  
**Impact**: Very High - Advanced particle features

---

#### Materials & Effects (8+ examples)

| Example | Features | Status | Priority | Complexity | Path |
|---------|----------|--------|----------|------------|------|
| **tsl-custom-node-material** | Custom materials | ⭕ Extract | High | Medium | lab/tsl-custom-node-material/ |
| **infinite-water** | Water simulation | ⭕ Extract | High | High | lab/infinite-water/ |
| **animated-blob** | Noise displacement | ⭕ Extract | Medium | Medium | lab/animated-blob/ |
| **hologram** | Holographic effect | ⭕ Extract | Medium | Medium | - |
| **nightingale-hover** | Hover effects | ⭕ Extract | Low | Medium | lab/nightingale-hover/ |
| **refraction-dispersion** | Glass refraction | ⭕ Extract | Medium | High | lab/refraction-and-dispersion/ |
| **dissolve** | Dissolve transition | ⭕ Extract | Low | Low | lab/dissolve/ |
| **text-distortion** | Text effects | ⭕ Extract | Low | Low | lab/text-distortion/ |

**Estimated Extraction Time**: 2-3 weeks  
**Dependencies**: Material system, SDF  
**Impact**: High - Visual variety

---

#### Raymarching & SDF (3+ examples)

| Example | Features | Status | Priority | Complexity | Path |
|---------|----------|--------|----------|------------|------|
| **sdf-basic-tsl** | Basic raymarching | ✅ Reference | High | Low | lab/sdf-basic-tsl/ |
| **displaced-sphere** | SDF displacement | ⭕ Extract | Medium | Medium | lab/displaced-sphere/ |
| **displaced-sphere-2** | Advanced SDF | ⭕ Extract | Medium | Medium | lab/displaced-sphere-2/ |

**Estimated Extraction Time**: 1 week  
**Dependencies**: SDF library  
**Impact**: Medium - Raymarching examples

---

## 🔷 Fragments Boilerplate Inventory

**Source**: `RESOURCES/REPOSITORIES/TSLwebgpuExamples/fragments-boilerplate-vanilla-main/`

### Noise Functions (`src/tsl/noise/`)

| Module | Status | Notes | Source File |
|--------|--------|-------|-------------|
| **common** | ⭕ Port | Shared utilities | noise/common.js |
| **curl_noise_3d** | ✅ Exists | - | noise/curl_noise_3d.js |
| **curl_noise_4d** | ✅ Exists | - | noise/curl_noise_4d.js |
| **fbm** | ✅ Exists | Fractional Brownian Motion | noise/fbm.js |
| **perlin_noise_3d** | ✅ Exists | - | noise/perlin_noise_3d.js |
| **simplex_noise_3d** | ✅ Exists | - | noise/simplex_noise_3d.js |
| **simplex_noise_4d** | ✅ Exists | - | noise/simplex_noise_4d.js |
| **turbulence** | ✅ Exists | - | noise/turbulence.js |

**Status**: Mostly complete ✅

---

### Post-Processing Effects (`src/tsl/post_processing/`)

| Module | Status | Priority | Effort | Source File |
|--------|--------|----------|--------|-------------|
| **canvas_weave_effect** | ✅ Exists | Medium | - | post_processing/canvas_weave_effect.js |
| **grain_texture_effect** | ✅ Exists | High | - | post_processing/grain_texture_effect.js |
| **lcd_effect** | ✅ Exists | Low | - | post_processing/lcd_effect.js |
| **pixellation_effect** | ✅ Exists | Low | - | post_processing/pixellation_effect.js |
| **speckled_noise_effect** | ✅ Exists | Low | - | post_processing/speckled_noise_effect.js |
| **vignette_effect** | ✅ Exists | High | - | post_processing/vignette_effect.js |

**Status**: Complete ✅  
**Note**: Already ported, verify compatibility

---

### Color Utilities (`src/tsl/utils/color/`)

| Module | Status | Priority | Effort | Source File |
|--------|--------|----------|--------|-------------|
| **cosine_palette** | ✅ Exists | Medium | - | utils/color/cosine_palette.js |
| **tonemapping** | ✅ Exists | High | - | utils/color/tonemapping.js |

**Status**: Complete ✅

---

### Function Utilities (`src/tsl/utils/function/`)

| Module | Status | Priority | Effort | Source File |
|--------|--------|----------|--------|-------------|
| **bloom** | ✅ Exists | High | - | utils/function/bloom.js |
| **bloom_edge_pattern** | ✅ Exists | Low | - | utils/function/bloom_edge_pattern.js |
| **domain_index** | ✅ Exists | Low | - | utils/function/domain_index.js |
| **median3** | ✅ Exists | Low | - | utils/function/median3.js |
| **repeating_pattern** | ✅ Exists | Low | - | utils/function/repeating_pattern.js |
| **screen_aspect_uv** | ✅ Exists | High | - | utils/function/screen_aspect_uv.js |

**Status**: Complete ✅

---

### Math Utilities (`src/tsl/utils/math/`)

| Module | Status | Priority | Effort | Source File |
|--------|--------|----------|--------|-------------|
| **complex** | ✅ Exists | Low | - | utils/math/complex.js |
| **coordinates** | ✅ Exists | Medium | - | utils/math/coordinates.js |

**Status**: Complete ✅

---

### SDF Utilities (`src/tsl/utils/sdf/`)

| Module | Status | Priority | Effort | Source File |
|--------|--------|----------|--------|-------------|
| **operations** | ✅ Partial | High | Low | utils/sdf/operations.js |
| **shapes** | ✅ Partial | High | Medium | utils/sdf/shapes.js |

**Status**: Need expansion ⭕  
**Todo**: Add more primitives and operations

---

## 🎮 TSL Sandbox Inventory

**Source**: `RESOURCES/REPOSITORIES/TSLwebgpuExamples/three.js-tsl-sandbox-master/`

### Complete Projects (30+)

#### Particle Systems

| Project | Features | Status | Priority | Effort | Path |
|---------|----------|--------|----------|--------|------|
| **particles-flow-field** | Flow field | ⭕ Extract | High | High | particles-flow-field/ |
| **particles-morphing** | Morphing | ⭕ Extract | High | High | particles-morphing/ |
| **particles-cursor-animation** | Cursor interaction | ⭕ Extract | Medium | Medium | particles-cursor-animation/ |
| **particles-cursor-animation-compute** | Compute version | ⭕ Extract | Medium | High | particles-cursor-animation-compute/ |
| **animated-galaxy** | Galaxy effect | ⭕ Extract | Low | High | animated-galaxy/ |
| **attractors** | Attractor field | ⭕ Extract | Medium | Medium | attractors/ |
| **fireworks** | Fireworks effect | ⭕ Extract | Low | Medium | fireworks/ |

**Estimated Time**: 4-5 weeks total

---

#### Visual Effects

| Project | Features | Status | Priority | Effort | Path |
|---------|----------|--------|----------|--------|------|
| **halftone** | Halftone shader | ⭕ Extract | High | Low | halftone/ |
| **hologram** | Holographic effect | ⭕ Extract | High | Medium | hologram/ |
| **coffee-smoke** | Smoke particles | ⭕ Extract | Medium | Medium | coffee-smoke/ |
| **vfx-1, vfx-2, vfx-tornado** | VFX systems | ⭕ Extract | Medium | High | vfx-*/ |
| **portal-scene** | Portal effect | ⭕ Extract | Low | Medium | portal-scene/ |
| **glitch** | Glitch effect | ⭕ Extract | Medium | Low | - |

**Estimated Time**: 2-3 weeks total

---

#### Materials & Shading

| Project | Features | Status | Priority | Effort | Path |
|---------|----------|--------|----------|--------|------|
| **sliced-material** | Slice effect | ⭕ Extract | Medium | Medium | sliced-material/ |
| **wobby-material** | Wobbly distortion | ⭕ Extract | Low | Medium | wobby-material/ |
| **parallaxUv** | Parallax mapping | ⭕ Extract | Medium | Medium | parallaxUv/ |

**Estimated Time**: 2 weeks total

---

#### Procedural & Terrain

| Project | Features | Status | Priority | Effort | Path |
|---------|----------|--------|----------|--------|------|
| **procedural-terrain** | Terrain gen | ⭕ Extract | Medium | High | procedural-terrain/ |
| **raging-sea** | Ocean simulation | ⭕ Extract | High | High | raging-sea/ |
| **background** | Procedural BG | ⭕ Extract | Low | Low | background/ |

**Estimated Time**: 2 weeks total

---

#### Post-Processing

| Project | Features | Status | Priority | Effort | Path |
|---------|----------|--------|----------|--------|------|
| **post-processing** | Effect chain | ⭕ Extract | High | Medium | post-processing/ |
| **grid** | Grid overlay | ⭕ Extract | Low | Low | grid/ |

**Estimated Time**: 1 week total

---

## 🌊 Roquefort Fluid Inventory

**Source**: `RESOURCES/REPOSITORIES/TSLwebgpuExamples/roquefort-main/`

### Simulation Operators (`src/simulation/`)

| Module | Function | Status | Priority | Effort | Source File |
|--------|----------|--------|----------|--------|-------------|
| **common** | Shared utilities | ⭕ Port | High | Low | simulation/common.js |
| **advect** | Semi-Lagrangian advection | ⭕ Port | High | Medium | simulation/advect.js |
| **divergence** | Divergence calculation | ⭕ Port | High | Low | simulation/divergence.js |
| **pressure** | Pressure solver (Jacobi) | ⭕ Port | High | High | simulation/pressure.js |
| **gradient_subtract** | Gradient subtraction | ⭕ Port | High | Low | simulation/gradient_subtract.js |
| **vorticity** | Vorticity confinement | ⭕ Port | High | Medium | simulation/vorticity.js |
| **emitters** | Impulse injection | ⭕ Port | High | Medium | simulation/emitters.js |

**Estimated Porting Time**: 2-3 weeks  
**Dependencies**: Compute shader framework, storage buffers  
**Impact**: Very High - Complete fluid system

---

### Rendering (`src/rendering/`)

| Module | Function | Status | Priority | Effort | Source File |
|--------|----------|--------|----------|--------|-------------|
| **render** | Main rendering | ⭕ Port | High | Medium | rendering/render.js |
| **blur** | Gaussian blur | ⭕ Port | Medium | Low | rendering/blur.js |
| **lighting** | Fluid lighting | ⭕ Port | Medium | Medium | rendering/lighting.js |

**Estimated Porting Time**: 1 week  
**Dependencies**: Fluid operators  
**Impact**: High - Visualization

---

## 🎬 SSR/GTAO/SSGI Inventory

**Source**: `RESOURCES/REPOSITORIES/TSLwebgpuExamples/ssr-gtao-keio/`, `ssgi-ssr-painter/`

### Screen-Space Effects

| Effect | Features | Status | Priority | Effort | Source |
|--------|----------|--------|----------|--------|--------|
| **SSR** | Screen-space reflections | ⭕ Port | Critical | Very High | ssr-gtao-keio/src/script.js |
| **GTAO** | Ground truth AO | ⭕ Port | Critical | Very High | ssr-gtao-keio/src/script.js |
| **SSGI** | Screen-space GI | ⭕ Port | Critical | Very High | ssgi-ssr-painter/src/script.js |

**Estimated Porting Time**: 3-4 weeks  
**Dependencies**: Framegraph, G-buffer, TAA  
**Impact**: Critical - Major visual quality upgrade

**Technical Requirements**:
- G-buffer implementation
- Temporal accumulation
- Spatial filtering
- Depth reconstruction
- Normal reconstruction
- Performance optimization

---

## 📚 Three.js Official Examples

**Source**: `RESOURCES/three.js-r181/examples/`

### Relevant Examples (Selected)

#### WebGPU Compute

| Example | Features | Status | Use As | File |
|---------|----------|--------|--------|------|
| **webgpu_compute_particles** | Compute particles | ⭕ Reference | Reference | webgpu_compute_particles.html |
| **webgpu_compute_texture** | Texture compute | ⭕ Reference | Reference | webgpu_compute_texture.html |

**Use**: Reference implementation patterns

---

#### Node Materials

| Example | Features | Status | Use As | File |
|---------|----------|--------|--------|------|
| **webgpu_materials** | Material showcase | ⭕ Reference | Reference | webgpu_materials*.html |
| **webgpu_tsl_*** | TSL examples | ⭕ Reference | Pattern guide | webgpu_tsl_*.html |

**Use**: Best practices reference

---

## 📊 Porting Status Matrix

### Priority 1: Immediate (Weeks 1-4)

| Module | Category | Source | Status | Assignee | ETA |
|--------|----------|--------|--------|----------|-----|
| Lighting utilities | TSL | Portfolio | ⭕ Ready | TBD | Week 2 |
| Missing noise functions | TSL | Portfolio | ⭕ Ready | TBD | Week 2 |
| SDF primitives expansion | TSL | Multiple | ⭕ Ready | TBD | Week 3 |
| Helper functions | TSL | Portfolio | ⭕ Ready | TBD | Week 3 |

---

### Priority 2: Near-term (Weeks 5-8)

| Module | Category | Source | Status | Assignee | ETA |
|--------|----------|--------|--------|----------|-----|
| Fluid simulation | Engine | Roquefort | ⭕ Ready | TBD | Week 6-8 |
| Advanced particles | Engine | Portfolio/Sandbox | ⭕ Ready | TBD | Week 5-8 |
| Material library Phase 1 | Engine | Multiple | ⭕ Ready | TBD | Week 7-8 |
| Post-effects expansion | TSL | Sandbox | ⭕ Ready | TBD | Week 5-6 |

---

### Priority 3: Mid-term (Weeks 9-12)

| Module | Category | Source | Status | Assignee | ETA |
|--------|----------|--------|--------|----------|-----|
| SSR/GTAO/SSGI | Engine | SSR Examples | ⭕ Ready | TBD | Week 9-12 |
| Advanced blur/DOF | Engine | Multiple | ⭕ Ready | TBD | Week 10-11 |
| Color grading | Engine | Multiple | ⭕ Ready | TBD | Week 11-12 |

---

### Priority 4: Long-term (Weeks 13-20)

| Module | Category | Source | Status | Assignee | ETA |
|--------|----------|--------|--------|----------|-----|
| Geometry utilities | TSL | Multiple | ⭕ Ready | TBD | Week 13-16 |
| Material library Phase 2 | Engine | Multiple | ⭕ Ready | TBD | Week 13-16 |
| Scene compositions | Engine | Original | ⭕ Plan | TBD | Week 17-20 |
| Documentation | Docs | N/A | ⭕ Plan | TBD | Week 17-20 |

---

## 📝 Notes

### License Compliance
- All source examples use MIT or compatible licenses
- Maintain attribution in ported code
- Update LICENSE file with acknowledgments

### Version Compatibility
- Target Three.js r180+
- WebGPU renderer required
- Test across Chrome, Firefox, Edge

### Quality Standards
- All ports must include TypeScript types
- Comprehensive JSDoc required
- Unit tests for critical modules
- Visual tests for effects/materials
- Performance benchmarks

---

**Last Updated**: November 4, 2025  
**Next Review**: Weekly during active porting  
**Maintainer**: Development Team

