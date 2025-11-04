# Three.js TSL & WebGPU - Complete Reference Guide

> **Comprehensive Knowledge Base** compiled from portfolio examples and advanced TSL/WebGPU projects  
> **Version:** 1.0  
> **Last Updated:** October 2025  
> **Based on:** Three.js r170-r178+

---

## 📚 Table of Contents

### Part 1: Foundation
1. [Introduction to TSL](#introduction-to-tsl)
2. [Project Setup & Structure](#project-setup--structure)
3. [Core Concepts](#core-concepts)

### Part 2: Noise & Procedural Generation
4. [Noise Functions](./01-Noise-Functions.md)
5. [Procedural Patterns](./02-Procedural-Patterns.md)
6. [SDF (Signed Distance Functions)](./03-SDF-Shapes.md)

### Part 3: Advanced Rendering
7. [Particle Systems](./04-Particle-Systems.md)
8. **[Compute Shaders](./05-Compute-Shaders.md)** - GPU parallel processing (NEW!)
9. [Post-Processing Effects](./06-Post-Processing.md)
10. [Raymarching Techniques](./07-Raymarching.md)

### Part 4: Specialized Techniques
11. [Fluid Simulations](./08-Fluid-Simulations.md)
12. [Lighting & Shading](./09-Lighting-Shading.md)
13. [Utility Functions](./10-Utility-Functions.md)

### Part 5: Practical Applications
14. [Complete Examples](./11-Complete-Examples.md)
15. [Best Practices & Patterns](./12-Best-Practices.md)
16. [Performance Optimization](./13-Performance.md)

---

## Introduction to TSL

### What is TSL?

**TSL (Three.js Shading Language)** is a functional, JavaScript-based shading language introduced in Three.js that acts as an "umbrella" shader language. It allows you to write shader code once and have it run on both WebGPU (WGSL) and WebGL (GLSL), making it truly **future-proof**[^1].

#### Key Features:

- **Platform-agnostic** - Write once, run on WebGPU or WebGL
- **Type-safe** shader development
- **Composable** node functions through the Node System
- **Future-proof** - Prevents "lost work" when APIs change
- **Hot reloadable** shader development
- **Better debugging** than raw GLSL/WGSL

#### Why TSL Exists

TSL was created to solve a critical problem: when WebGPU was introduced, all existing GLSL shader code (including Three.js's built-in materials) would need complete rewrites to WGSL. This represents massive "lost work" for developers. As mrdoob explained:

> "The problem is that everything that was written with RawShaderMaterial is now 'lost' because WebGPU doesn't support GLSL... TSL should be more future proof 🤞"

TSL aims to prevent this from happening again by providing an abstraction that can transpile to any future shading language browsers may support[^1].

### TSL vs WebGPU

It's important to understand the relationship between these two concepts:

**WebGPU** is a new graphics API that brings the web up to par with modern graphics APIs like Vulkan or Metal. It provides:
- Lower-level controls (memory allocation, bind groups, etc.)
- **Compute shaders** - a game-changing new shader type
- Near-native performance
- Uses **WGSL** (WebGPU Shading Language)

**TSL** is Three.js's abstraction layer that:
- Lets you write shaders in JavaScript/TypeScript syntax
- Compiles to both GLSL (WebGL) and WGSL (WebGPU)
- Works with the Node System for composable shaders
- Ensures your shader code remains valid across API changes

### Syntax Comparison

Here's the same shader in TSL, GLSL, and WGSL:

```typescript
// TSL - JavaScript-like, functional syntax
const colorNode = Fn(([baseColor]) => {
  const uvCoord = uv()
  
  const red = uvCoord.x.add(2.3).mul(0.3)
  const green = uvCoord.y.add(1.7).div(8.2)
  const blue = add(uvCoord.x, uvCoord.y).mod(10.0)
  
  const tint = vec4(red, green, blue, 1.0)
  
  return mix(baseColor, tint, uvCoord.x)
})
```

```glsl
// GLSL - Traditional shader syntax
uniform vec4 baseColor;

void main() {
  float red   = (uv.x + 2.3) * 0.3;
  float green = (uv.y + 1.7) / 8.2;
  float blue  = mod(uv.x + uv.y, 10.0);
  
  vec4 tint = vec4(red, green, blue, 1.0);
  fragColor = mix(baseColor, tint, uv.x);
}
```

```wgsl
// WGSL - WebGPU shader syntax
fn main(uv: vec2<f32>, baseColor: vec4<f32>) -> vec4<f32> {
  let red   = (uv.x + 2.3) * 0.3;
  let green = (uv.y + 1.7) / 8.2;
  let blue  = (uv.x + uv.y) % 10.0;
  
  let tint = vec4<f32>(red, green, blue, 1.0);
  return mix(baseColor, tint, uv.x);
}
```

### Writing Native Shader Code in TSL

If TSL's functional syntax isn't to your taste, you can use `glslFn` and `wgslFn` to write native shader code while still leveraging the Node System:

```typescript
import { glslFn, wgslFn, uniform, uv } from 'three/tsl'

const baseColor = uniform(new THREE.Vector4(1, 1, 1, 1))

// Write GLSL directly
const colorGLSL = glslFn(`
  vec4 colorFn(vec4 baseColor, vec2 uv) {
    float red   = (uv.x + 2.3) * 0.3;
    float green = (uv.y + 1.7) / 8.2;
    float blue  = mod(uv.x + uv.y, 10.0);
    return mix(baseColor, vec4(red, green, blue, 1.0), uv.x);
  }
`)

// Write WGSL directly
const colorWGSL = wgslFn(`
  fn colorFn(baseColor: vec4<f32>, uv: vec2<f32>) -> vec4<f32> {
    let red   = (uv.x + 2.3) * 0.3;
    let green = (uv.y + 1.7) / 8.2;
    let blue  = (uv.x + uv.y) % 10.0;
    return mix(baseColor, vec4<f32>(red, green, blue, 1.0), uv.x);
  }
`)

// Use in material
material.colorNode = colorGLSL({ baseColor, uv: uv() })
```

**Note**: Even when using native shader code, you still need TSL's Node System to integrate these functions into materials and effects[^1].

### Key Advantages

1. **Type Safety**: Catch errors at compile-time
2. **Reusability**: Build libraries of shader functions
3. **Composability**: Combine functions like Lego blocks
4. **Maintenance**: Easier to read and update
5. **Integration**: Seamless with TypeScript/JavaScript ecosystem

---

## Project Setup & Structure

### Dependencies

Based on analyzed projects, here's the typical dependency setup:

```json
{
  "dependencies": {
    "three": "^0.170.0",
    "lil-gui": "^0.19.0",
    "leva": "^0.9.0"
  },
  "devDependencies": {
    "vite": "^5.0.0",
    "typescript": "^5.0.0"
  }
}
```

### Recommended Project Structure

```
project/
├── src/
│   ├── main.ts                 # Entry point
│   ├── components/
│   │   ├── canvas/
│   │   │   ├── webgpu_scene.tsx      # Scene wrapper
│   │   │   └── webgpu_sketch.tsx     # Sketch component
│   │   └── debug/
│   │       └── debug.tsx             # Debug UI
│   ├── tsl/
│   │   ├── noise/                    # Noise functions
│   │   │   ├── simplex_noise_3d.ts
│   │   │   ├── curl_noise_3d.ts
│   │   │   ├── perlin_noise_3d.ts
│   │   │   └── fbm.ts
│   │   ├── post_processing/          # Post-processing effects
│   │   │   ├── grain_texture_effect.ts
│   │   │   ├── vignette_effect.ts
│   │   │   └── lcd_effect.ts
│   │   ├── utils/
│   │   │   ├── color/                # Color utilities
│   │   │   │   ├── cosine_palette.ts
│   │   │   │   └── tonemapping.ts
│   │   │   ├── function/             # Helper functions
│   │   │   │   ├── bloom.ts
│   │   │   │   └── screen_aspect_uv.ts
│   │   │   ├── math/                 # Math utilities
│   │   │   │   ├── complex.ts
│   │   │   │   └── coordinates.ts
│   │   │   ├── sdf/                  # Signed distance functions
│   │   │   │   ├── shapes.ts
│   │   │   │   └── operations.ts
│   │   │   └── lighting.ts           # Lighting helpers
│   │   └── particles/                # Particle systems
│   │       └── ParticlesSystem.ts
│   ├── sketches/                     # Individual sketches
│   │   ├── flare-1.ts
│   │   └── dawn-1.ts
│   └── utils/                        # General utilities
│       └── math.ts
├── public/
│   └── assets/
└── vite.config.ts
```

---

## Core Concepts

### 1. TSL Function Definition

TSL functions are created using the `Fn` wrapper:

```typescript
import { Fn, vec3, float, length } from 'three/tsl'

// Basic function
const myFunction = Fn(([input]) => {
  return input.mul(2)
})

// Function with explicit layout (optional)
const namedFunction = Fn(([p, radius]) => {
  return length(p).sub(radius)
}).setLayout({
  name: 'sdSphere',
  type: 'float',
  inputs: [
    { name: 'p', type: 'vec3' },
    { name: 'radius', type: 'float' }
  ]
})
```

### 2. Variable Declaration

TSL uses `.toVar()` for mutable variables:

```typescript
const myShader = Fn(() => {
  // Immutable (default)
  const color = vec3(1, 0, 0)
  
  // Mutable variable
  const result = vec3(0).toVar()
  result.assign(color)
  result.addAssign(vec3(0.1))
  result.mulAssign(2)
  
  return result
})
```

### 3. Conditionals

```typescript
import { If, Fn } from 'three/tsl'

const conditional = Fn(([value]) => {
  const result = float(0).toVar()
  
  If(value.greaterThan(0.5), () => {
    result.assign(1)
  })
  .ElseIf(value.greaterThan(0.25), () => {
    result.assign(0.5)
  })
  .Else(() => {
    result.assign(0)
  })
  
  return result
})
```

### 4. Loops

```typescript
import { Loop, Fn, float } from 'three/tsl'

const loopExample = Fn(() => {
  const sum = float(0).toVar()
  
  // Basic loop
  Loop({ start: 0, end: 10 }, ({ i }) => {
    sum.addAssign(i)
  })
  
  // Conditional loop
  Loop({ 
    type: 'float', 
    start: 1, 
    end: 5, 
    condition: '<=' 
  }, ({ i }) => {
    sum.mulAssign(i)
  })
  
  return sum
})
```

### 5. Uniforms

```typescript
import { uniform, color, vec3, float } from 'three/tsl'

// Create uniforms
const timeUniform = uniform(0)
const colorUniform = uniform(color('#ff0000'))
const strengthUniform = uniform(1.5)
const positionUniform = uniform(vec3(0, 0, 0))

// Use in shader
const shader = Fn(() => {
  return colorUniform.mul(strengthUniform)
})

// Update in JavaScript
timeUniform.value = elapsedTime
colorUniform.value.set('#00ff00')
```

### 6. Built-in Nodes

TSL provides many built-in nodes for common operations:

```typescript
import {
  // Math
  sin, cos, tan, abs, floor, ceil, fract, mod,
  min, max, clamp, mix, smoothstep, step,
  
  // Vector
  length, distance, dot, cross, normalize,
  reflect, refract,
  
  // Coordinates
  uv, positionLocal, positionWorld, normalWorld,
  
  // Time
  timerLocal, timerGlobal, timerDelta,
  
  // Camera
  cameraPosition, cameraProjectionMatrix,
  
  // Noise
  mx_noise_float, // MaterialX noise
  
  // Special
  hash, // Random hash function
  oscSine, // Oscillating sine [-1, 1]
} from 'three/tsl'
```

### 7. Material Setup

#### MeshBasicNodeMaterial (Simple)

```typescript
import { MeshBasicNodeMaterial } from 'three/webgpu'
import { Fn, uv, vec3 } from 'three/tsl'

const material = new MeshBasicNodeMaterial()

material.colorNode = Fn(() => {
  return vec3(uv(), 0.5)
})()
```

#### MeshStandardNodeMaterial (PBR)

```typescript
import { MeshStandardNodeMaterial } from 'three/webgpu'

const material = new MeshStandardNodeMaterial({
  metalness: 0,
  roughness: 0.5
})

// Custom position
material.positionNode = customPositionFn()

// Custom normal
material.normalNode = customNormalFn()

// Custom color
material.colorNode = customColorFn()

// Emissive
material.emissiveNode = emissiveFn()
```

#### SpriteNodeMaterial (Particles)

```typescript
import { SpriteNodeMaterial } from 'three/webgpu'
import { THREE } from 'three'

const material = new SpriteNodeMaterial({
  transparent: true,
  blending: THREE.AdditiveBlending,
  depthWrite: false
})

material.colorNode = particleColorFn()
material.scaleNode = particleScaleFn()
material.positionNode = particlePositionFn()
```

---

## Import Paths (Important!)

### Three.js r170+

```typescript
// ✅ Correct imports for r170+
import * as THREE from 'three'
import { WebGPURenderer } from 'three/webgpu'
import { 
  Fn, uv, vec3, uniform, 
  MeshBasicNodeMaterial,
  MeshStandardNodeMaterial 
} from 'three/tsl'

// For compute shaders and storage
import { storage, instanceIndex, tslFn } from 'three/tsl'
import { StorageInstancedBufferAttribute } from 'three/webgpu'
```

### Legacy Imports (r164-r169)

```typescript
// ❌ Old imports (don't use for new projects)
import { Fn, uv } from 'three/examples/jsm/nodes/Nodes.js'
import WebGPURenderer from 'three/examples/jsm/renderers/webgpu/WebGPURenderer.js'
```

---

## Basic WebGPU Scene Setup

```typescript
import * as THREE from 'three'
import { WebGPURenderer } from 'three/webgpu'
import { Fn, uv, vec3, MeshBasicNodeMaterial } from 'three/tsl'

// Scene
const scene = new THREE.Scene()

// Camera
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  100
)
camera.position.z = 3

// Renderer
const renderer = new WebGPURenderer({ antialias: true })
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
document.body.appendChild(renderer.domElement)

// Material with TSL
const material = new MeshBasicNodeMaterial()
material.colorNode = Fn(() => {
  return vec3(uv(), 0.5)
})()

// Mesh
const geometry = new THREE.PlaneGeometry(2, 2)
const mesh = new THREE.Mesh(geometry, material)
scene.add(mesh)

// Animation loop
const animate = () => {
  renderer.renderAsync(scene, camera)
  requestAnimationFrame(animate)
}
animate()
```

---

## React Three Fiber Integration

```typescript
import { Canvas } from '@react-three/fiber'
import { MeshBasicNodeMaterial } from 'three/webgpu'
import { Fn, uv, vec3, time, sin } from 'three/tsl'

const Sketch = () => {
  const material = new MeshBasicNodeMaterial()
  
  material.colorNode = Fn(() => {
    const _uv = uv()
    return vec3(_uv, sin(time))
  })()
  
  return (
    <mesh material={material}>
      <planeGeometry args={[2, 2]} />
    </mesh>
  )
}

function App() {
  return (
    <Canvas gl={(canvas) => new WebGPURenderer({ canvas })}>
      <Sketch />
    </Canvas>
  )
}
```

---

## 🎯 Quick Start Checklist

- [ ] Install Three.js r170+
- [ ] Setup WebGPURenderer
- [ ] Create material with `NodeMaterial`
- [ ] Write shader with `Fn()`
- [ ] Use `.toVar()` for mutable variables
- [ ] Import from `'three/tsl'` or `'three/webgpu'`
- [ ] Test with simple `uv()` and `vec3()` first
- [ ] Add complexity gradually

---

## 📖 Next Steps

Continue to specific topics:

1. **[Noise Functions](./01-Noise-Functions.md)** - Learn about Simplex, Perlin, Curl noise
2. **[Particle Systems](./04-Particle-Systems.md)** - Build GPU-accelerated particles
3. **[Post-Processing](./06-Post-Processing.md)** - Add effects and filters
4. **[Complete Examples](./11-Complete-Examples.md)** - Study full implementations

---

## 🔗 External Resources

### Official Documentation
- [Three.js TSL Official Announcement](https://github.com/mrdoob/three.js/wiki/Three.js-Shading-Language)
- [Three.js WebGPU Examples](https://threejs.org/examples/?q=webgpu)
- [TSL => WGSL/GLSL Converter](https://threejs.org/examples/?q=webgpu#webgpu_tsl_editor)
- [GLSL => TSL Transpiler](https://threejs.org/examples/?q=webgpu#webgpu_tsl_transpiler)
- [TSL Textures Library](https://boytchev.github.io/tsl-textures/)

### Essential Reading
- **[Field Guide to TSL and WebGPU - Maxime Heckel](https://blog.maximeheckel.com/posts/field-guide-to-tsl-and-webgpu/)** ⭐ Highly recommended!
- [WebGPU Fundamentals](https://webgpufundamentals.org/)
- [WebGPU Specification](https://www.w3.org/TR/webgpu/)

### Community
- [Maxime Heckel's Blog](https://blog.maximeheckel.com/) - Excellent TSL/WebGPU tutorials
- [TypeGPU](https://github.com/software-mansion/TypeGPU) - Alternative WebGPU framework
- [Three.js Discourse](https://discourse.threejs.org/) - Community forum

---

**📝 Note**: This documentation is based on analysis of production projects and follows best practices observed in the Three.js community as of October 2025.

