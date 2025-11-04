# Three.js TSL & WebGPU - Complete Knowledge Base

> 📚 **Comprehensive reference documentation** compiled from analysis of 18+ production-ready Three.js TSL and WebGPU projects.

---

## 🎯 What's Inside

This documentation provides a **complete, single source of truth** for Three.js TSL (Three.js Shading Language) and WebGPU development, extracted from real production projects including:

- **Portfolio projects** (Fragments Boilerplate, Maxime Heckel's Blog)
- **Advanced demos** (Raymarching, Particle Systems, Fluid Simulations)
- **TSL utilities** (Noise, SDFs, Post-processing, Lighting)
- **Production patterns** from working projects

---

## 📖 Documentation Structure

### 🚀 Getting Started
1. **[Main Reference](./TSL-WebGPU-Complete-Reference.md)** - Start here! Complete introduction, setup, and core concepts

### 🎨 Core Techniques
2. **[Noise Functions](./01-Noise-Functions.md)** - Simplex, Perlin, Curl, FBM, Turbulence
3. **[SDF Shapes](./03-SDF-Shapes.md)** - Signed Distance Functions for 2D/3D shapes
4. **[Particle Systems](./04-Particle-Systems.md)** - GPU-accelerated particles with compute shaders
5. **[Compute Shaders](./05-Compute-Shaders.md)** ⭐NEW! - GPU parallel processing, storage textures
6. **[Post-Processing](./06-Post-Processing.md)** - Grain, vignette, DOF, bloom, and more
7. **[Utility Functions](./10-Utility-Functions.md)** - Colors, coordinates, math, lighting

### 💡 Advanced Examples
8. **[Complete Examples](./11-Complete-Examples.md)** - Full implementations:
   - Procedural Terrain
   - Raging Sea
   - Particle Flow Fields
   - Animated Galaxy
   - Hologram Effects

### ⚡ Best Practices
9. **[Best Practices](./12-Best-Practices.md)** - Performance, debugging, patterns, workflows

---

## 🔥 Quick Start

```typescript
// 1. Install Three.js r170+
npm install three@latest

// 2. Import and setup
import * as THREE from 'three'
import { WebGPURenderer } from 'three/webgpu'
import { Fn, uv, vec3, MeshBasicNodeMaterial } from 'three/tsl'

// 3. Create material with TSL
const material = new MeshBasicNodeMaterial()

material.colorNode = Fn(() => {
  return vec3(uv(), 0.5)  // Simple gradient
})()

// 4. Setup scene and render
const renderer = new WebGPURenderer()
renderer.renderAsync(scene, camera)
```

---

## 📚 What You'll Learn

### Foundational Concepts
- ✅ TSL syntax and function creation
- ✅ WebGPU renderer setup
- ✅ Node materials (Basic, Standard, Sprite)
- ✅ Uniforms, varyings, storage buffers
- ✅ Conditionals and loops in TSL

### Procedural Generation
- ✅ All noise types (Simplex, Perlin, Curl, FBM)
- ✅ SDF shapes and boolean operations
- ✅ Domain warping and repetition
- ✅ Procedural terrain and textures

### Advanced Rendering
- ✅ Compute shader particles (100k+ particles)
- ✅ Raymarching techniques
- ✅ Post-processing pipelines
- ✅ Custom lighting models
- ✅ Depth-based effects

### Production Techniques
- ✅ Performance optimization
- ✅ Code organization patterns
- ✅ Debugging strategies
- ✅ Project structure
- ✅ Testing approaches

---

## 🎓 Documentation Features

### Complete Code Examples
Every technique includes **full, copy-paste ready code** extracted from working projects:

```typescript
// Real production code from analyzed projects
export const simplexNoise3d = Fn(([v]) => {
  // Complete implementation with comments
  // Ready to use in your project
})
```

### Progressive Complexity
Start simple, build up to advanced:
1. Basic concepts
2. Individual techniques
3. Combined examples
4. Full implementations

### Best Practices Built In
Learn the **right way** from the start:
- ✅ Performance-optimized patterns
- ✅ Proper code organization
- ✅ Type safety
- ✅ Debugging techniques

---

## 🚀 Key Technologies Covered

- **Three.js r170+** (TSL/WebGPU era)
- **WebGPU Renderer** (compute shaders, storage buffers)
- **TSL (Three.js Shading Language)** (node-based shaders)
- **React Three Fiber** (R3F integration)
- **Compute Shaders** (GPU parallelism)
- **Node Materials** (MeshBasicNodeMaterial, MeshStandardNodeMaterial, etc.)

---

## 📊 Source Projects Analyzed

### Portfolio & Boilerplates
- **Fragments Boilerplate** - React, Vite, TSL library
- **Portfolio Main** - Next.js, advanced demos
- **Maxime Heckel's Blog** - TSL examples, MDX widgets

### TSL Examples
- **TSL Sandbox** (18 examples) - Particles, terrain, waves, VFX
- **Particle Systems** - Compute-based particles
- **Raymarching** - SDF raymarching tutorial
- **Procedural Generation** - Terrain, noise, patterns

### Advanced Techniques
- **Roquefort** - Fluid simulation
- **Fluid Glass** - Advanced fluid rendering
- **InteractWave** - Wave propagation
- **SSR/GTAO** - Screen-space effects

---

## 💡 How to Use This Documentation

### For Beginners
1. Start with **[Main Reference](./TSL-WebGPU-Complete-Reference.md)**
2. Follow the **Quick Start Checklist**
3. Build simple examples from **[Noise Functions](./01-Noise-Functions.md)**
4. Study **[Complete Examples](./11-Complete-Examples.md)**

### For Intermediate Developers
1. Browse specific techniques you need
2. Copy code patterns that fit your project
3. Study **[Best Practices](./12-Best-Practices.md)**
4. Optimize using performance tips

### For Advanced Users
1. Use as quick reference
2. Adapt production patterns
3. Combine techniques for custom effects
4. Contribute improvements

---

## 🎯 Common Use Cases

### I want to create...

**Procedural Terrain**
→ See [Complete Examples](./11-Complete-Examples.md#procedural-terrain) + [Noise Functions](./01-Noise-Functions.md)

**Particle Effects**
→ See [Particle Systems](./04-Particle-Systems.md) + [Complete Examples](./11-Complete-Examples.md#particle-flow-field)

**Water/Ocean**
→ See [Complete Examples](./11-Complete-Examples.md#raging-sea) + [Noise Functions](./01-Noise-Functions.md)

**Post-Processing Effects**
→ See [Post-Processing](./06-Post-Processing.md)

**Custom Shapes**
→ See [SDF Shapes](./03-SDF-Shapes.md)

**Color Gradients**
→ See [Utility Functions](./10-Utility-Functions.md#color-utilities)

---

## 🔧 Requirements

- **Three.js** r170 or higher (TSL in core)
- **Node.js** 18+ (for development)
- **Modern browser** with WebGPU support
  - Chrome 113+
  - Edge 113+
  - Firefox Nightly (flag enabled)

---

## 📝 Documentation Standards

All examples follow these principles:

✅ **Production-Ready** - Real code from working projects  
✅ **Copy-Paste Ready** - Complete, runnable examples  
✅ **Well-Commented** - Clear explanations inline  
✅ **Type-Safe** - TypeScript-compatible  
✅ **Performance-Focused** - Optimized patterns  
✅ **Best Practices** - Industry standards  

---

## 🌟 Highlights

### Most Useful Sections

1. **[Noise Functions](./01-Noise-Functions.md)** - Foundation for 90% of effects
2. **[Particle Systems](./04-Particle-Systems.md)** - Full GPU particle implementation
3. **[Complete Examples](./11-Complete-Examples.md)** - Copy entire working projects
4. **[Best Practices](./12-Best-Practices.md)** - Avoid common mistakes

### Must-Read for Everyone

- **[Core Concepts](./TSL-WebGPU-Complete-Reference.md#core-concepts)** - TSL fundamentals
- **[Import Paths](./TSL-WebGPU-Complete-Reference.md#import-paths-important)** - Critical for r170+
- **[Common Pitfalls](./12-Best-Practices.md#common-pitfalls)** - Save hours of debugging

---

## 🤝 Contributing

Found an error? Have improvements? This documentation is based on analysis of real projects. Suggestions welcome!

---

## 📜 License

Documentation compiled from open-source projects. Original code licenses apply.

---

## 🔗 External Resources

### Official
- [Three.js Docs](https://threejs.org/docs/)
- [Three.js TSL Announcement](https://github.com/mrdoob/three.js/wiki/Three.js-Shading-Language)
- [WebGPU Spec](https://www.w3.org/TR/webgpu/)
- [WebGPU Fundamentals](https://webgpufundamentals.org/)

### Tools
- [TSL Editor](https://threejs.org/examples/?q=webgpu#webgpu_tsl_editor)
- [TSL Transpiler](https://threejs.org/examples/?q=webgpu#webgpu_tsl_transpiler)
- [Shader Toy](https://www.shadertoy.com/)

### Essential Reading ⭐
- **[Field Guide to TSL and WebGPU](https://blog.maximeheckel.com/posts/field-guide-to-tsl-and-webgpu/)** - Maxime Heckel
- [The Book of Shaders](https://thebookofshaders.com/)
- [Inigo Quilez Articles](https://iquilezles.org/articles/)

### Community & Alternatives
- [Maxime Heckel's Blog](https://blog.maximeheckel.com/) - Excellent tutorials
- [TypeGPU](https://github.com/software-mansion/TypeGPU) - Alternative WebGPU framework
- [Three.js Discourse](https://discourse.threejs.org/)

---

## 🎉 Ready to Start?

**[Begin with the Main Reference →](./TSL-WebGPU-Complete-Reference.md)**

Or jump to a specific topic:
- [Noise Functions →](./01-Noise-Functions.md)
- [Particle Systems →](./04-Particle-Systems.md)
- [Complete Examples →](./11-Complete-Examples.md)

---

**Version**: 1.0  
**Last Updated**: October 2025  
**Based on**: Three.js r170-r178+  
**Projects Analyzed**: 18+  
**Total Examples**: 50+  

---

*"From analyzed production code to your next masterpiece"* ✨

