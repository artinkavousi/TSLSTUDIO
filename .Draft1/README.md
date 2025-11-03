# Aurora TSL Toolkit

A WebGPU-first rendering toolkit built on Three.js r180+ with composable TSL/Node-based materials, post-processing chains, and compute-driven simulations.

## 🚀 Quick Start

```bash
pnpm install
pnpm build
pnpm --filter demo-r3f dev
```

## 📦 Packages

- **`@aurora/tsl-kit`** – Core TypeScript library with TSL utilities, materials, post-processing, and compute modules
- **`demo-r3f`** – React Three Fiber playground with live controls and example sketches

## ✨ Features

### TSL Utilities (Phase 1 ✅)
- **Noise Functions**: Simplex 3D/4D, Perlin 3D, Curl 3D/4D, FBM, Turbulence
- **Color Utilities**: Cosine palettes, Multiple tonemapping algorithms (ACES, Reinhard, Cinematic, etc.)
- **Math Utilities**: Complex number operations, Coordinate transformations
- **Function Utilities**: Bloom, Domain indexing, Repeating patterns, Aspect-corrected UVs
- **SDF Primitives**: 2D/3D shapes (sphere, box, hexagon, triangle, etc.) with smooth operations
- **Lighting**: Fresnel, Hemispheric, Diffuse, Phong specular

### Post-Processing (Phase 2 ✅)
- **Effects**: Film grain, Vignette, LCD/CRT, Pixellation, Canvas weave, Speckled noise
- **PostProcessing Component**: React component using Three.js PostProcessing with MRT

### WebGPU Components (Phase 3 ✅)
- **WebGPUScene**: Canvas wrapper with async renderer initialization
- **WebGPUSketch**: Reusable fullscreen sketch component
- **ColorSpaceCorrection**: Automatic color space handling

## 🎨 Example Usage

```tsx
import { Fn, time, screenSize, vec3 } from 'three/tsl'
import { 
  WebGPUScene, 
  WebGPUSketch, 
  simplexNoise3d, 
  screenAspectUV, 
  cosinePalette 
} from '@aurora/tsl-kit'

// Create a TSL shader node
const mySketch = Fn(() => {
  const uv = screenAspectUV(screenSize)
  const noise = simplexNoise3d(vec3(uv.mul(4.0), time.mul(0.3)))
  const col = cosinePalette(noise, a, b, c, d)
  return col
})

// Render it
function App() {
  return (
    <WebGPUScene debug>
      <WebGPUSketch colorNode={mySketch()} />
    </WebGPUScene>
  )
}
```

## 🏗️ Architecture

### Direct TSL Composition
No JSON schemas or DSL compilation. Write TSL nodes directly in TypeScript with full type safety.

```typescript
// ✅ Direct TSL - Type-safe and composable
const noise = simplexNoise3d(vec3(uv, time))
const color = cosinePalette(noise, a, b, c, d)

// ❌ Old approach - JSON DSL with runtime validation
// const spec = { type: 'noise', variant: 'simplex', ... }
```

### Proven Patterns
Ported from working fragments-boilerplate architecture with production-tested patterns.

### GPU-First
WebGPU always available. No WebGL fallbacks or capability checks needed.

## 📚 Documentation

- [Architecture Overview](docs/tsl-toolkit-architecture.md)
- [Implementation Summary](IMPLEMENTATION_SUMMARY.md)

## 🔧 Development

```bash
# Install dependencies
pnpm install

# Build packages
pnpm build

# Run demo
pnpm --filter demo-r3f dev

# Build specific package
pnpm --filter @aurora/tsl-kit build
```

## ✅ Completed

- ✅ All TSL noise utilities (8 modules)
- ✅ All TSL utility functions (color, math, function, SDF, lighting)
- ✅ All post-processing effects (6 effects + component)
- ✅ WebGPU scene architecture (3 components)
- ✅ Removed obsolete DSL compiler (~1000 lines)
- ✅ Example sketches

## 🚧 In Progress

- ⏳ Compute system (particles, force fields)
- ⏳ Simplified material builders
- ⏳ Additional example sketches
- ⏳ Testing & validation

## 📄 License

MIT
