# Best Practices & Patterns

## Overview

Guidelines, patterns, and best practices learned from production TSL/WebGPU projects.

---

## Table of Contents

1. [Code Organization](#code-organization)
2. [Performance](#performance)
3. [Debugging](#debugging)
4. [Common Pitfalls](#common-pitfalls)
5. [Project Structure](#project-structure)

---

## Code Organization

### 1. Modular TSL Functions

**✅ Good**: Reusable, testable functions

```typescript
// tsl/utils/patterns/circles.ts
export const circlePattern = Fn(([uv, radius, smoothness]) => {
  const dist = length(uv.sub(0.5))
  return smoothstep(radius, radius.sub(smoothness), dist)
})

// Usage
import { circlePattern } from './utils/patterns/circles'

const shader = Fn(() => {
  return circlePattern(uv(), 0.3, 0.05)
})
```

**❌ Bad**: Monolithic, hard to reuse

```typescript
const shader = Fn(() => {
  const dist = length(uv().sub(0.5))
  const circle1 = smoothstep(0.3, 0.25, dist)
  const dist2 = length(uv().sub(vec2(0.3, 0.5)))
  const circle2 = smoothstep(0.2, 0.15, dist2)
  // ... more duplicated code
})
```

### 2. Uniform Management

**✅ Good**: Organized uniform object

```typescript
class EffectManager {
  constructor() {
    this.uniforms = {
      time: uniform(0),
      intensity: uniform(1.0),
      color: uniform(color('#ff0000')),
      resolution: uniform(vec2(1920, 1080))
    }
  }
  
  update(delta) {
    this.uniforms.time.value += delta
  }
}
```

**❌ Bad**: Scattered uniforms

```typescript
const time = uniform(0)
const intensity = uniform(1.0)
// ... uniforms spread across files
```

### 3. Type Annotations

**✅ Good**: Clear types and JSDoc

```typescript
/**
 * Apply bloom effect
 * @param {vec3} color - Input color
 * @param {float} threshold - Bloom threshold
 * @param {float} intensity - Effect intensity
 * @returns {vec3} Bloomed color
 */
export const bloom = Fn(([color, threshold = float(0.8), intensity = float(1.0)]) => {
  const brightness = dot(color, vec3(0.2126, 0.7152, 0.0722))
  const bloomMask = step(threshold, brightness)
  return color.add(color.mul(bloomMask).mul(intensity))
})
```

### 4. Naming Conventions

```typescript
// Constants: UPPER_SNAKE_CASE
const MAX_PARTICLES = 10000
const DEFAULT_COLOR = '#ff0000'

// Uniforms: camelCase with descriptive names
const particleSize = uniform(0.05)
const emitterPosition = uniform(vec3())

// Functions: camelCase, verb-based
const calculateNormal = Fn(...)
const applyBloom = Fn(...)

// Components: PascalCase
class ParticleSystem {...}
```

---

## Performance

### 1. Minimize Texture Lookups

**✅ Good**: Single lookup, reuse

```typescript
const shader = Fn(() => {
  const texColor = texture(tex, uv())  // Sample once
  const r = texColor.r
  const g = texColor.g
  const b = texColor.b
  return process(r, g, b)
})
```

**❌ Bad**: Multiple redundant lookups

```typescript
const shader = Fn(() => {
  const r = texture(tex, uv()).r
  const g = texture(tex, uv()).g  // Duplicate sample!
  const b = texture(tex, uv()).b  // Duplicate sample!
  return process(r, g, b)
})
```

### 2. Early Exit

**✅ Good**: Exit early when possible

```typescript
const expensiveShader = Fn(() => {
  // Quick checks first
  If(condition, () => {
    return vec4(0)  // Early exit
  })
  
  // Expensive computation only if needed
  const result = complexCalculation()
  return result
})
```

### 3. Loop Optimization

**✅ Good**: Necessary iterations only

```typescript
const octaves = uniform(4)  // Adjustable

loop({ start: 1, end: octaves }, ({ i }) => {
  // Only run what's needed
})
```

**❌ Bad**: Hardcoded high iteration count

```typescript
loop({ start: 1, end: 10 }, ({ i }) => {
  // Always 10 iterations, even if unnecessary
})
```

### 4. Variable Reuse

**✅ Good**: Store intermediate results

```typescript
const shader = Fn(() => {
  const dist = length(uv().sub(0.5))  // Calculate once
  const circle = smoothstep(0.5, 0.4, dist)
  const glow = smoothstep(0.8, 0.1, dist)
  return circle.add(glow)
})
```

**❌ Bad**: Recalculate repeatedly

```typescript
const shader = Fn(() => {
  const circle = smoothstep(0.5, 0.4, length(uv().sub(0.5)))
  const glow = smoothstep(0.8, 0.1, length(uv().sub(0.5)))  // Recalculated!
  return circle.add(glow)
})
```

### 5. Particle Count Management

```typescript
class AdaptiveParticles {
  constructor(renderer) {
    this.targetFPS = 60
    this.minParticles = 1000
    this.maxParticles = 50000
    this.currentCount = 10000
  }
  
  update(fps) {
    if (fps < this.targetFPS && this.currentCount > this.minParticles) {
      this.currentCount = Math.max(
        this.minParticles,
        this.currentCount * 0.9
      )
      this.rebuild()
    } else if (fps > this.targetFPS + 10 && this.currentCount < this.maxParticles) {
      this.currentCount = Math.min(
        this.maxParticles,
        this.currentCount * 1.1
      )
      this.rebuild()
    }
  }
}
```

---

## Debugging

### 1. Visualize Intermediate Values

```typescript
// Debug mode
const debugMode = uniform(0)  // 0 = normal, 1 = debug

const shader = Fn(() => {
  const value = complexCalculation()
  
  // Visualize value in debug mode
  return cond(
    debugMode.equal(1),
    vec4(vec3(value), 1),  // Show as grayscale
    finalColor             // Normal output
  )
})
```

### 2. Color-Code Ranges

```typescript
const debugRanges = Fn(([value]) => {
  return cond(
    value.lessThan(0), vec3(1, 0, 0),        // Red = negative
    cond(
      value.greaterThan(1), vec3(0, 0, 1),  // Blue = > 1
      vec3(0, 1, 0)                          // Green = 0-1 (correct)
    )
  )
})
```

### 3. Step-by-Step Building

```typescript
// Build shader incrementally
const shader = Fn(() => {
  // Step 1: Just UVs
  // return vec3(uv(), 0)
  
  // Step 2: Add pattern
  // const pattern = circlePattern(uv())
  // return vec3(pattern)
  
  // Step 3: Add colors
  const pattern = circlePattern(uv())
  const colored = pattern.mul(baseColor)
  return colored
  
  // Step 4: Add effects...
})
```

### 4. Isolate Components

```typescript
// Test individual parts
const testNoise = Fn(() => {
  const noise = simplexNoise3d(vec3(uv().mul(5), time))
  return vec3(noise.mul(0.5).add(0.5))  // Remap to visible range
})

const testCurl = Fn(() => {
  const curl = curlNoise3d(vec3(uv().mul(2), time))
  return curl.mul(0.5).add(0.5)  // Visualize vector field
})
```

### 5. Console Logging (JavaScript Side)

```typescript
// Monitor uniforms
console.log('Particle count:', particleSystem.count)
console.log('Time:', timeUniform.value)

// Performance metrics
const stats = new Stats()
document.body.appendChild(stats.dom)

function animate() {
  stats.begin()
  renderer.renderAsync(scene, camera)
  stats.end()
}
```

---

## Common Pitfalls

### 1. Forgetting `.toVar()`

**❌ Problem**: Immutable assignment fails

```typescript
const value = float(0)
value.assign(1)  // Error! Can't assign to immutable
```

**✅ Solution**: Use `.toVar()` for mutable variables

```typescript
const value = float(0).toVar()
value.assign(1)  // Works!
```

### 2. Wrong Import Paths

**❌ Problem**: Old imports

```typescript
// ❌ Pre r170
import { Fn } from 'three/examples/jsm/nodes/Nodes.js'
```

**✅ Solution**: Modern imports

```typescript
// ✅ r170+
import { Fn } from 'three/tsl'
```

### 3. Missing Parentheses on Fn() Call

**❌ Problem**: Function not invoked

```typescript
material.colorNode = myShader  // Wrong! Just the function reference
```

**✅ Solution**: Call the function

```typescript
material.colorNode = myShader()  // Correct! Invokes and returns node
```

### 4. Type Mismatches

**❌ Problem**: Wrong types in operations

```typescript
const result = float(5).add(vec3(1, 2, 3))  // Type error!
```

**✅ Solution**: Match types

```typescript
const result = vec3(5).add(vec3(1, 2, 3))  // OK
// or
const result = float(5).add(1)  // OK
```

### 5. Compute Shader Not Running

**❌ Problem**: Forgot to call compute

```typescript
const updateCompute = particleUpdate().compute(count)
// Compute never runs!
```

**✅ Solution**: Execute compute each frame

```typescript
const updateCompute = particleUpdate().compute(count)

function animate() {
  renderer.compute(updateCompute)  // Execute!
  renderer.renderAsync(scene, camera)
}
```

---

## Project Structure

### Recommended Organization

```
project/
├── src/
│   ├── main.ts                 # Entry point
│   │
│   ├── scene/                  # Scene setup
│   │   ├── scene.ts
│   │   ├── camera.ts
│   │   ├── lights.ts
│   │   └── renderer.ts
│   │
│   ├── tsl/                    # TSL library
│   │   ├── noise/              # Noise functions
│   │   ├── sdf/                # SDF shapes
│   │   ├── post-processing/    # Effects
│   │   ├── particles/          # Particle systems
│   │   └── utils/              # Utilities
│   │
│   ├── materials/              # Custom materials
│   │   ├── TerrainMaterial.ts
│   │   └── WaterMaterial.ts
│   │
│   ├── systems/                # Game systems
│   │   ├── ParticleManager.ts
│   │   └── EffectsManager.ts
│   │
│   └── utils/                  # General utilities
│       ├── math.ts
│       └── helpers.ts
│
├── public/                     # Static assets
│   ├── textures/
│   └── models/
│
└── docs/                       # Documentation
    └── README.md
```

### File Naming

- **TSL Functions**: `snake_case.ts` (e.g., `simplex_noise_3d.ts`)
- **Classes**: `PascalCase.ts` (e.g., `ParticleSystem.ts`)
- **Utilities**: `camelCase.ts` (e.g., `mathUtils.ts`)
- **Components**: `PascalCase.tsx` (e.g., `WebGPUSketch.tsx`)

---

## Development Workflow

### 1. Prototype Phase

```typescript
// Quick and dirty for testing
const prototype = Fn(() => {
  return vec3(uv(), sin(time))
})
```

### 2. Refactor Phase

```typescript
// Extract reusable parts
const timeWave = Fn(([t]) => sin(t))
const uvColor = Fn(([_uv]) => vec3(_uv, 0))

const refined = Fn(() => {
  return uvColor(uv()).add(timeWave(time))
})
```

### 3. Optimize Phase

```typescript
// Add performance optimizations
const optimized = Fn(() => {
  const _uv = uv()  // Calculate once
  return uvColor(_uv).add(timeWave(time))
})
```

### 4. Polish Phase

```typescript
// Add controls, documentation
/**
 * Wave effect shader
 * @param {vec2} uv - UV coordinates
 * @param {float} time - Time value
 * @param {float} speed - Animation speed
 * @returns {vec3} Final color
 */
const polished = Fn(([_uv, time, speed = float(1.0)]) => {
  const wave = sin(time.mul(speed))
  return vec3(_uv, wave)
})
```

---

## Testing Strategies

### 1. Unit Testing TSL Functions

```typescript
// Test with known inputs
const testCircle = () => {
  const center = vec2(0.5, 0.5)
  const radius = 0.3
  
  // Test center point
  const centerDist = circlePattern(center, radius, 0.01)
  console.assert(centerDist > 0.9, 'Center should be filled')
  
  // Test outside
  const outsideDist = circlePattern(vec2(0, 0), radius, 0.01)
  console.assert(outsideDist < 0.1, 'Outside should be empty')
}
```

### 2. Visual Regression Testing

```typescript
// Take screenshot, compare
async function visualTest(name) {
  renderer.renderAsync(scene, camera)
  const screenshot = await captureScreenshot()
  await compareWithBaseline(name, screenshot)
}
```

### 3. Performance Benchmarking

```typescript
class PerformanceTest {
  run() {
    const samples = []
    
    for (let i = 0; i < 100; i++) {
      const start = performance.now()
      renderer.renderAsync(scene, camera)
      const end = performance.now()
      samples.push(end - start)
    }
    
    const avg = samples.reduce((a, b) => a + b) / samples.length
    console.log(`Average frame time: ${avg.toFixed(2)}ms`)
  }
}
```

---

## Documentation Best Practices

### 1. JSDoc for Functions

```typescript
/**
 * Apply vignette effect
 * @param {vec2} uv - UV coordinates (0-1)
 * @param {float} intensity - Effect strength (0-1)
 * @param {float} smoothness - Edge softness (0-1)
 * @returns {float} Vignette mask (0-1)
 * @example
 * const mask = vignette(uv(), 0.8, 0.3)
 * color.mulAssign(mask)
 */
export const vignette = Fn(([uv, intensity, smoothness]) => {
  // Implementation
})
```

### 2. README for Each Module

```markdown
# Noise Functions

Collection of noise functions for procedural generation.

## Usage

\`\`\`typescript
import { simplexNoise3d } from './noise/simplex_noise_3d'

const noise = simplexNoise3d(vec3(position, time))
\`\`\`

## Functions

- `simplexNoise3d` - 3D simplex noise
- `curlNoise3d` - 3D curl noise
- `fbm` - Fractal Brownian Motion

## Performance

- 3D noise: ~0.1ms per call
- 4D noise: ~0.2ms per call
```

---

## Version Control

### Commit Messages

```bash
# Good
git commit -m "feat: Add curl noise 4D function"
git commit -m "fix: Correct normal calculation in terrain shader"
git commit -m "perf: Optimize particle update loop"

# Bad
git commit -m "Update stuff"
git commit -m "Fix"
```

### Branch Strategy

```bash
main          # Stable, production-ready
develop       # Integration branch
feature/...   # New features
fix/...       # Bug fixes
perf/...      # Performance improvements
```

---

## Important Gotchas & Known Issues

### React Three Fiber Issues

When using TSL with React Three Fiber, be aware of these current issues (as of October 2025):

1. **`extend` function issues** - May require workarounds
2. **Material naming** - Classic materials (e.g., `meshStandardMaterial`) may actually point to node materials (`meshStandardNodeMaterial`)
3. **Light components** - `ambientLight` and `directionalLight` may need to be added via `scene.add()` instead of JSX

### TSL Development State

**TSL is still Work In Progress**[^1]. Key challenges:

- Many features are **loosely or not documented**
- Often requires **inferring usage** from Three.js repository examples
- Best practices are still being established
- Breaking changes may occur between versions

**Recommendations:**
- Check Three.js repository for latest examples
- Join Three.js Discourse for community support
- Expect to do some detective work
- Keep dependencies updated

### WebGPU Support

While WebGPU support is expanding (including iOS/Safari as of October 2025), remember:

- **Chrome 113+** - Full support
- **Edge 113+** - Full support
- **Safari 18+/iOS 18+** - New support
- **Firefox** - Nightly only (flag required)

Always have a WebGL fallback strategy.

---

## Final Checklist

Before considering your TSL project complete:

- [ ] All functions documented with JSDoc
- [ ] Performance tested (60fps on target hardware)
- [ ] Responsive (handles window resize)
- [ ] No console errors or warnings
- [ ] Uniforms exposed for tweaking
- [ ] WebGL fallback if needed
- [ ] Code organized and modular
- [ ] README with setup instructions
- [ ] Examples/demos included
- [ ] Optimized for production (minified, tree-shaken)
- [ ] Tested on target devices/browsers

---

## Alternative Approaches

If TSL's abstractions feel too limiting for your use case, consider:

### TypeGPU

[TypeGPU](https://github.com/software-mansion/TypeGPU) provides a more direct WebGPU API while maintaining TypeScript benefits:

```typescript
// TypeGPU example - more control, less abstraction
const buffer = root.createBuffer(new Float32Array([1, 2, 3]))
const kernel = root.makeComputePipeline({
  compute: wgsl`
    @compute @workgroup_size(64)
    fn main(@builtin(global_invocation_id) id: vec3<u32>) {
      // Direct WGSL access
    }
  `
})
```

**When to use:**
- Need fine-grained WebGPU control
- TSL abstractions too limiting
- Building compute-heavy applications
- Direct WGSL preferred over TSL

### Raw WebGPU

For maximum control, use WebGPU API directly (without Three.js).

---

## Resources

### Essential Reading
- **[Field Guide to TSL and WebGPU - Maxime Heckel](https://blog.maximeheckel.com/posts/field-guide-to-tsl-and-webgpu/)**[^1] ⭐
- [Three.js Documentation](https://threejs.org/docs/)
- [Three.js Examples](https://threejs.org/examples/)

### WebGPU
- [WebGPU Specification](https://www.w3.org/TR/webgpu/)
- [WebGPU Fundamentals](https://webgpufundamentals.org/)

### Learning
- [Shader Toy](https://www.shadertoy.com/)
- [The Book of Shaders](https://thebookofshaders.com/)
- [Inigo Quilez Articles](https://iquilezles.org/articles/)

---

[^1]: [Field Guide to TSL and WebGPU - Maxime Heckel](https://blog.maximeheckel.com/posts/field-guide-to-tsl-and-webgpu/)

---

**End of Documentation** 🎉

For more specific topics, refer to individual documentation files in this collection.

