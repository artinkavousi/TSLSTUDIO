# 📋 TSLStudio Development TODO List

> **Last Updated**: November 4, 2025  
> **Current Sprint**: Foundation Enhancement (Weeks 1-4)

---

## 🎯 Current Sprint: Foundation Enhancement

### Week 1-2: Foundation & Audit ✅

- [x] Complete project structure audit
- [x] Analyze available resources
- [x] Create comprehensive development plan
- [x] Document architecture vision
- [ ] **Setup testing infrastructure**
  - [ ] Install Vitest
  - [ ] Configure test environment
  - [ ] Create test utilities
  - [ ] Write example tests
- [ ] **Create module templates**
  - [ ] TSL module template
  - [ ] Engine module template
  - [ ] Component template
  - [ ] Documentation template

### Week 3-4: Essential Utilities Port

#### Priority 1A: Lighting Utilities 🔴 HIGH PRIORITY
**Source**: `portfolio-main/src/utils/webgpu/nodes/lighting/`

- [ ] **Port lighting nodes**
  - [ ] `diffuse.ts` → `@tsl/utils/lighting/diffuse.ts` ✅ (verify compatibility)
  - [ ] `ambient.ts` → `@tsl/utils/lighting/ambient.ts`
  - [ ] `directional.ts` → `@tsl/utils/lighting/directional.ts`
  - [ ] `fresnel.ts` → `@tsl/utils/lighting/fresnel.ts`
  - [ ] `hemisphere.ts` → `@tsl/utils/lighting/hemisphere.ts`
- [ ] **Add new lighting models**
  - [ ] `rimLight.ts` (extract from examples)
  - [ ] `oren-nayar.ts` (diffuse model)
  - [ ] `cook-torrance.ts` (specular model)
- [ ] **Create lighting demo scene**
- [ ] **Document lighting API**

#### Priority 1B: Noise Functions 🔴 HIGH PRIORITY
**Source**: `portfolio-main/src/utils/webgpu/nodes/noise/`

- [ ] **Port missing noise functions**
  - [ ] `simplex_noise_2d.ts`
  - [ ] `voronoi.ts`
  - [ ] `classicNoise3d.ts`
- [ ] **Verify existing noise**
  - [x] `simplex_noise_3d.ts` (already exists)
  - [x] `simplex_noise_4d.ts` (already exists)
  - [x] `curl_noise_3d.ts` (already exists)
  - [x] `curl_noise_4d.ts` (already exists)
- [ ] **Create noise utility helpers**
  - [ ] Noise octaves/layers helper
  - [ ] Noise domain warping
  - [ ] Noise animation helpers
- [ ] **Create noise demo scene**
- [ ] **Document noise API**

#### Priority 1C: SDF Library 🟡 MEDIUM PRIORITY
**Source**: `fragments-boilerplate-vanilla/src/tsl/utils/sdf/` + portfolio examples

- [ ] **Expand SDF primitives**
  - [x] `sphere.ts` (verify existing)
  - [ ] `box.ts`
  - [ ] `roundBox.ts`
  - [ ] `torus.ts`
  - [ ] `cylinder.ts`
  - [ ] `cone.ts`
  - [ ] `capsule.ts`
  - [ ] `plane.ts`
  - [ ] `octahedron.ts`
  - [ ] `pyramid.ts`
- [ ] **SDF operations**
  - [x] Basic operations (verify existing)
  - [ ] `smoothUnion.ts` (enhance existing)
  - [ ] `smoothSubtraction.ts`
  - [ ] `smoothIntersection.ts`
  - [ ] `displacement.ts`
  - [ ] `twist.ts`
  - [ ] `bend.ts`
- [ ] **SDF utilities**
  - [ ] `raymarch.ts` helper
  - [ ] `calcNormal.ts` helper
  - [ ] `calcAO.ts` helper
  - [ ] `softShadow.ts` helper
- [ ] **Create SDF demo scene** (raymarching)
- [ ] **Document SDF API**

#### Priority 1D: Helper Functions 🟡 MEDIUM PRIORITY
**Source**: `portfolio-main/src/utils/webgpu/nodes/`

- [ ] **Port utility functions**
  - [ ] `smooth-min.ts` (verify existing)
  - [ ] `smooth-mod.ts` (verify existing)
  - [ ] `remap.ts`
  - [ ] `rotate-3d-y.ts`
  - [ ] `compose.ts`
- [ ] **Document helpers**

---

## 📦 Sprint 2: Core Systems (Weeks 5-8)

### Priority 2A: Post-Processing Effects 🔴 HIGH PRIORITY
**Source**: `fragments-boilerplate-vanilla/src/tsl/post_processing/`

- [ ] **Verify existing effects**
  - [x] `grain_texture_effect.ts`
  - [x] `lcd_effect.ts`
  - [x] `vignette_effect.ts`
  - [x] `canvas_weave_effect.ts`
  - [x] `pixellation_effect.ts`
  - [x] `speckled_noise_effect.ts`
- [ ] **Port new effects from examples**
  - [ ] `halftone.ts` (from tsl-sandbox)
  - [ ] `ascii.ts` (create based on examples)
  - [ ] `crt.ts` (from examples)
  - [ ] `glitch.ts`
  - [ ] `datamosh.ts`
- [ ] **Organize effect categories**
  - [ ] Stylized effects
  - [ ] Blur effects
  - [ ] Color grading
  - [ ] Distortion effects
- [ ] **Create effect chain system**
- [ ] **Create post-processing showcase**
- [ ] **Document post-processing API**

### Priority 2B: Fluid Simulation 🔴 HIGH PRIORITY
**Source**: `roquefort-main/src/simulation/`

- [ ] **Port fluid operators**
  - [ ] `advection.ts` (semi-Lagrangian)
  - [ ] `divergence.ts`
  - [ ] `pressure.ts` (Jacobi iteration)
  - [ ] `gradient_subtract.ts`
  - [ ] `vorticity.ts` (vorticity confinement)
  - [ ] `boundary.ts` (boundary conditions)
- [ ] **Create emitter system**
  - [ ] Point emitters
  - [ ] Line emitters
  - [ ] Circle emitters
  - [ ] Custom shape emitters
- [ ] **Rendering integration**
  - [ ] Particle-based rendering
  - [ ] Velocity field visualization
  - [ ] Dye injection system
- [ ] **Enhance existing fluid2d.ts**
  - [ ] Integrate new operators
  - [ ] Add emitter support
  - [ ] Optimize performance
- [ ] **Create 3D fluid solver** (fluid3d.ts)
- [ ] **Create fluid demos**
  - [ ] 2D fluid demo
  - [ ] 3D smoke simulation
  - [ ] Interactive fluid painting
- [ ] **Document fluid API**

### Priority 2C: Material Library Phase 1 🟡 MEDIUM PRIORITY

- [ ] **Physical materials**
  - [ ] `glass.ts` (transmission, roughness, IOR)
  - [ ] `metal.ts` (metalness presets)
  - [ ] `fabric.ts` (sheen, subsurface)
  - [ ] `ceramic.ts` (clearcoat)
- [ ] **Procedural materials**
  - [ ] `hologram.ts` (from tsl-sandbox)
  - [ ] `fresnel.ts` (fresnel-based)
  - [ ] `iridescent.ts` (from car paint, generalize)
  - [ ] Enhance `triplanar.ts` (verify existing)
- [ ] **Material builder system**
  - [ ] Material preset manager
  - [ ] Material serialization
  - [ ] Material library browser
- [ ] **Create material showcase**
- [ ] **Document material system**

### Priority 2D: Advanced Particles 🟡 MEDIUM PRIORITY
**Source**: Portfolio examples, tsl-sandbox

- [ ] **Morphing system** (particles-morphing-2)
  - [ ] Shape morphing compute shader
  - [ ] Target shape management
  - [ ] Smooth transitions
- [ ] **Flow field system** (flow-field)
  - [ ] Flow field generation
  - [ ] Particle following behavior
  - [ ] 3D flow fields
- [ ] **GPGPU enhancements** (fbo-particles)
  - [ ] Multi-buffer system
  - [ ] Ping-pong rendering
  - [ ] Custom shader injection
- [ ] **Collision detection**
  - [ ] Sphere collision
  - [ ] Plane collision
  - [ ] Mesh collision (SDF-based)
- [ ] **Emitter enhancements**
  - [ ] Mesh surface emission
  - [ ] Volume emission
  - [ ] Curve-based emission
- [ ] **Create particle demos**
  - [ ] Morphing demo
  - [ ] Flow field demo
  - [ ] Collision demo
- [ ] **Document particle API**

---

## 🎨 Sprint 3: Advanced Effects (Weeks 9-12)

### Priority 3A: Screen-Space Effects 🔴 CRITICAL
**Source**: `ssr-gtao-keio/`, `ssgi-ssr-painter/`

- [ ] **SSR (Screen-Space Reflections)**
  - [ ] Port SSR shader
  - [ ] Integration with framegraph
  - [ ] Adaptive quality settings
  - [ ] Performance optimization
- [ ] **GTAO (Ground Truth Ambient Occlusion)**
  - [ ] Port GTAO shader
  - [ ] Multi-bounce implementation
  - [ ] Spatial filtering
  - [ ] Temporal filtering
- [ ] **SSGI (Screen-Space Global Illumination)**
  - [ ] Port SSGI shader
  - [ ] Light bleeding
  - [ ] Indirect lighting
  - [ ] Temporal accumulation
- [ ] **Combined pipeline**
  - [ ] SSR + GTAO pipeline
  - [ ] Quality presets
  - [ ] Performance modes
- [ ] **Create showcase scene**
- [ ] **Document screen-space API**

### Priority 3B: Advanced Blur & DOF 🟡 MEDIUM PRIORITY

- [ ] **Gaussian blur**
  - [ ] Separable blur implementation
  - [ ] Variable kernel size
  - [ ] Optimized compute shader
- [ ] **Bokeh DOF**
  - [ ] Circular bokeh
  - [ ] Hexagonal bokeh
  - [ ] Realistic lens simulation
- [ ] **Radial blur**
- [ ] **Directional blur**
- [ ] **Create blur showcase**
- [ ] **Document blur API**

### Priority 3C: Color Grading 🟢 LOW PRIORITY

- [ ] **LUT-based grading**
  - [ ] 3D LUT support
  - [ ] LUT interpolation
  - [ ] LUT library
- [ ] **Advanced tonemapping**
  - [ ] Filmic tonemapping
  - [ ] ACES tonemapping
  - [ ] Custom curve support
- [ ] **Color manipulation**
  - [ ] Hue shift
  - [ ] Saturation control
  - [ ] Contrast enhancement
  - [ ] Color temperature
- [ ] **Preset system**
  - [ ] Cinematic presets
  - [ ] Game-style presets
  - [ ] Retro presets
- [ ] **Create color grading demo**
- [ ] **Document color grading API**

---

## 🔧 Sprint 4: Geometry & Animation (Weeks 13-16)

### Priority 4A: Geometry Modifiers 🟡 MEDIUM PRIORITY

- [ ] **Deformation modifiers**
  - [ ] `displacement.ts`
  - [ ] `twist.ts`
  - [ ] `bend.ts`
  - [ ] `taper.ts`
  - [ ] `wave.ts`
- [ ] **Apply to mesh geometry**
- [ ] **Apply to SDF**
- [ ] **Create geometry demo**
- [ ] **Document geometry API**

### Priority 4B: Procedural Generation 🟢 LOW PRIORITY
**Source**: `tsl-sandbox/procedural-terrain/`

- [ ] **Terrain generation**
  - [ ] Height map generation
  - [ ] Multi-octave noise
  - [ ] Erosion simulation
- [ ] **Cloud generation**
  - [ ] 3D noise-based clouds
  - [ ] Ray marching clouds
  - [ ] Animated clouds
- [ ] **Other generators**
  - [ ] Rock formations
  - [ ] Tree generation (basic)
- [ ] **Create procedural demo**
- [ ] **Document procedural API**

### Priority 4C: Animation Helpers 🟢 LOW PRIORITY

- [ ] **Morphing utilities**
  - [ ] Position morphing
  - [ ] Shape morphing
  - [ ] Texture morphing
- [ ] **Procedural animation**
  - [ ] Noise-based animation
  - [ ] Wave animation
  - [ ] Flow animation
- [ ] **Easing & interpolation**
  - [ ] Easing functions (in TSL)
  - [ ] Spring physics
  - [ ] Advanced interpolation
- [ ] **Create animation demo**
- [ ] **Document animation API**

---

## 🎨 Sprint 5: Integration & Polish (Weeks 17-20)

### Priority 5A: Scene Compositions 🔴 HIGH PRIORITY

- [ ] **Showcase scenes**
  - [ ] Material showcase
  - [ ] Particle showcase
  - [ ] Fluid showcase
  - [ ] Post-processing showcase
- [ ] **Preset scenes**
  - [ ] Product viewer template
  - [ ] Art gallery template
  - [ ] Particle art template
  - [ ] Abstract visuals template
- [ ] **Template system**
  - [ ] Minimal template
  - [ ] Complete template
  - [ ] Interactive template
- [ ] **Scene browser UI**
- [ ] **Document scene system**

### Priority 5B: Documentation 🔴 CRITICAL

- [ ] **API Reference**
  - [ ] Core API
  - [ ] Materials API
  - [ ] FX API
  - [ ] Compute API
  - [ ] TSL Utilities API
- [ ] **Tutorials**
  - [ ] Getting Started
  - [ ] Material System
  - [ ] Particle Systems
  - [ ] Post-Processing
  - [ ] Compute Shaders
  - [ ] SDF & Raymarching
  - [ ] Fluid Simulation
- [ ] **Examples**
  - [ ] Basic examples (10+)
  - [ ] Intermediate examples (10+)
  - [ ] Advanced examples (10+)
- [ ] **Recipes**
  - [x] Material recipes (exists)
  - [ ] Post-processing recipes
  - [ ] Particle recipes
  - [ ] Optimization recipes
  - [ ] Performance recipes
- [ ] **Launch documentation site**

### Priority 5C: Performance Optimization 🔴 HIGH PRIORITY

- [ ] **Profile all modules**
  - [ ] CPU profiling
  - [ ] GPU profiling
  - [ ] Memory profiling
- [ ] **Optimize bottlenecks**
  - [ ] Shader optimization
  - [ ] Compute shader optimization
  - [ ] Buffer management
  - [ ] Texture management
- [ ] **Implement adaptive quality**
  - [ ] Auto-scaling effects
  - [ ] LOD system
  - [ ] Dynamic resolution
- [ ] **Performance targets**
  - [ ] 60fps @ 1080p
  - [ ] 30fps @ 4K
  - [ ] 30fps on mobile
- [ ] **Document optimization**

### Priority 5D: Testing & QA 🔴 CRITICAL

- [ ] **Unit tests**
  - [ ] Core module tests
  - [ ] Material tests
  - [ ] FX tests
  - [ ] Compute tests
  - [ ] Utility tests
- [ ] **Integration tests**
  - [ ] Pipeline tests
  - [ ] Scene tests
  - [ ] Cross-module tests
- [ ] **Visual regression tests**
  - [ ] Screenshot comparison
  - [ ] Reference renders
  - [ ] Effect validation
- [ ] **Performance benchmarks**
  - [ ] Automated benchmarks
  - [ ] Regression detection
  - [ ] Performance tracking
- [ ] **Cross-browser testing**
  - [ ] Chrome
  - [ ] Firefox
  - [ ] Edge
  - [ ] Safari (WebGPU support)

---

## 🚀 Launch Preparation

### Pre-Launch Checklist

- [ ] **Code Quality**
  - [ ] All modules TypeScript strict mode
  - [ ] No console errors/warnings
  - [ ] Code review completed
  - [ ] Linting passing
- [ ] **Documentation**
  - [ ] API reference complete
  - [ ] Tutorials complete
  - [ ] Examples complete
  - [ ] README updated
- [ ] **Performance**
  - [ ] All performance targets met
  - [ ] Optimizations complete
  - [ ] Memory leaks fixed
  - [ ] Load times acceptable
- [ ] **Testing**
  - [ ] All tests passing
  - [ ] Coverage > 80%
  - [ ] Cross-browser tested
  - [ ] Mobile tested
- [ ] **Showcase**
  - [ ] Demo website deployed
  - [ ] All showcases working
  - [ ] Video demos created
  - [ ] Screenshots prepared

### Launch Deliverables

- [ ] **Website**
  - [ ] Landing page
  - [ ] Documentation site
  - [ ] Interactive demos
  - [ ] Example gallery
- [ ] **GitHub**
  - [ ] Repository organized
  - [ ] README complete
  - [ ] Contributing guidelines
  - [ ] License file
  - [ ] Issue templates
- [ ] **NPM Package** (if applicable)
  - [ ] Package published
  - [ ] Version 1.0.0
  - [ ] Changelog
  - [ ] TypeScript declarations
- [ ] **Marketing**
  - [ ] Announcement post
  - [ ] Social media
  - [ ] Dev.to article
  - [ ] Twitter thread

---

## 🎯 Success Metrics Tracking

### Module Count Progress
- **Current**: ~40 modules
- **Target**: 100+ modules
- **Progress**: 40%

### Material Presets
- **Current**: ~5 presets
- **Target**: 50+ presets
- **Progress**: 10%

### Post-Processing Effects
- **Current**: ~10 effects
- **Target**: 30+ effects
- **Progress**: 33%

### Compute Utilities
- **Current**: ~5 utilities
- **Target**: 20+ utilities
- **Progress**: 25%

### Documentation
- **Current**: Basic docs
- **Target**: Comprehensive docs
- **Progress**: 20%

---

## 📝 Notes & Decisions

### Architecture Decisions
- ✅ Use TSL for all shader code (no GLSL/WGSL strings)
- ✅ Separate engine (@engine) from utilities (@tsl)
- ✅ React integration via R3F
- ✅ TypeScript strict mode
- ✅ Modular, tree-shakeable exports

### Porting Guidelines
- Maintain original functionality
- Add TypeScript types
- Follow TSLStudio conventions
- Add JSDoc documentation
- Create usage examples
- Write tests

### Performance Priorities
1. WebGPU compute efficiency
2. Minimal texture reads
3. Efficient buffer management
4. Adaptive quality settings
5. Lazy loading

---

**Last Updated**: November 4, 2025  
**Next Review**: Weekly  
**Sprint**: Foundation Enhancement (Weeks 1-4)

