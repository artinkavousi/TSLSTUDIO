# 👨‍💻 TSLStudio Developer Guide

> Quick reference for working with the new unified architecture

## 🚀 Quick Start

### Project Structure Overview

```
packages/
├── engine/     → Layer 1: WebGPU rendering engine
├── tsl/        → Layer 2: Shader library (TSL)
└── studio/     → Layer 3: React application
```

### Layer Rules

```
✅ Studio can import from: Engine, TSL
✅ TSL can import from: Engine
✅ Engine can import from: Nothing (standalone)

❌ Engine cannot import from TSL or Studio
❌ TSL cannot import from Studio
```

---

## 📦 Package Reference

### 🔧 Engine (`@engine`)

**Purpose:** Low-level WebGPU rendering infrastructure

**When to use:**
- Creating or managing WebGPU renderer
- Setting up render pipelines
- Managing framegraphs
- Loading assets

**Common imports:**
```typescript
import { createRenderer } from '@engine/core'
import type { RendererHandle, RendererInitOptions } from '@engine/core'
```

**Available modules:**
- `@engine/core` - Renderer, pipeline, framegraph
- `@engine/assets` - Asset loading and caching
- `@engine/scene` - Scene graph management

---

### 🎨 TSL (`@tsl`)

**Purpose:** Three.js Shading Language components library

**When to use:**
- Creating custom shaders
- Using materials (PBR, stylized)
- Adding post-processing effects
- Working with compute shaders
- Using noise functions
- Shader utilities

#### Materials (`@tsl/materials`)

```typescript
// PBR Materials
import { standard, anisotropy, clearcoat, sheen, transmission, iridescent } from '@tsl/materials/pbr'

// Stylized Materials
import { matcap, triplanar } from '@tsl/materials/stylized'

// Individual imports
import { standard } from '@tsl/materials/pbr/standard'
```

**When to add new material:**
- PBR material → `packages/tsl/materials/pbr/`
- Stylized material → `packages/tsl/materials/stylized/`

#### Post-Processing (`@tsl/post`)

```typescript
// Core compositor
import { Composer, Pass, Chain } from '@tsl/post/core'

// Effects
import { 
  bloom, 
  taa, 
  dof, 
  chromaticAberration,
  colorGrading,
  filmGrain,
  vignette,
  lcdEffect,
  canvasWeave,
  pixellation,
  speckledNoise
} from '@tsl/post/effects'

// Individual imports
import { bloom } from '@tsl/post/effects/bloom'
```

**When to add new effect:**
- Add to `packages/tsl/post/effects/your-effect.ts`
- Export from `packages/tsl/post/effects/index.ts`

#### Compute Shaders (`@tsl/compute`)

```typescript
// Particles
import { ParticleEmitter, ParticleForces } from '@tsl/compute/particles'

// Simulation
import { Fluid2D, CurlNoise, SDF } from '@tsl/compute/simulation'

// Individual imports
import { ParticleEmitter } from '@tsl/compute/particles/emitter'
```

**When to add new compute:**
- Particle-related → `packages/tsl/compute/particles/`
- Simulation → `packages/tsl/compute/simulation/`

#### Noise (`@tsl/noise`)

```typescript
// Common imports
import { 
  simplexNoise3d, 
  simplexNoise4d, 
  perlinNoise3d, 
  curlNoise3d,
  curlNoise4d,
  fbm,
  turbulence 
} from '@tsl/noise'

// Individual import
import { simplexNoise3d } from '@tsl/noise/simplex-3d'
```

#### Utilities (`@tsl/utils`)

```typescript
// Color utilities
import { cosinePalette, tonemapping } from '@tsl/utils/color'

// Math utilities
import { complex, coordinates } from '@tsl/utils/math'

// SDF utilities
import { shapes, operations } from '@tsl/utils/sdf'

// Function utilities
import { 
  bloom, 
  bloomEdgePattern, 
  domainIndex,
  median3,
  repeatingPattern,
  screenAspectUV 
} from '@tsl/utils/function'

// Lighting
import { lighting } from '@tsl/utils/lighting'
```

---

### 🎬 Studio (`@studio`)

**Purpose:** React application layer

**When to use:**
- Creating React components
- Building UI
- Managing routes
- Creating demos
- User sketches
- App-level utilities

#### Components (`@studio/components`)

```typescript
// Canvas components
import { WebGPUScene, WebGPUSketch, ColorSpaceCorrection } from '@studio/components/canvas'

// UI components
import { SketchesDropdown, DebugPanel } from '@studio/components/ui'

// Layout components
import { MainLayout } from '@studio/components/layout'
```

**When to add new component:**
- Canvas-related → `packages/studio/components/canvas/`
- UI widget → `packages/studio/components/ui/`
- Layout → `packages/studio/components/layout/`

#### Demos (`@studio/demos`)

```typescript
// Import a demo
import { PBRShowcaseScene } from '@studio/demos/pbr-showcase'
import { ParticlesScene } from '@studio/demos/particles'
```

**When to add new demo:**
1. Create folder: `packages/studio/demos/my-demo/`
2. Add `scene.ts` for Three.js scene
3. Add `canvas.tsx` for React wrapper
4. Add `index.ts` for exports
5. Update `packages/studio/demos/index.ts`

#### Sketches (`@studio/sketches`)

User-created TSL sketches live here.

**Creating a sketch:**

```typescript
// packages/studio/sketches/examples/my-sketch.ts
import { Fn, vec3, uv, time, oscSine } from 'three/tsl'
import { screenAspectUV } from '@tsl/utils/function'
import { simplexNoise3d } from '@tsl/noise'

const sketch = Fn(() => {
  const _uv = screenAspectUV()
  const noise = simplexNoise3d(vec3(_uv, time))
  
  return vec3(noise, _uv.x, oscSine(time))
})

export default sketch
```

**Sketch organization:**
- Simple sketches → `packages/studio/sketches/examples/`
- Categorized → `packages/studio/sketches/effects/` or `/experiments/`

#### Routes (`@studio/routes`)

TanStack Router pages.

```typescript
// packages/studio/routes/my-route.tsx
import { createFileRoute } from '@tanstack/react-router'
import { WebGPUScene } from '@studio/components/canvas'

export const Route = createFileRoute('/my-route')({
  component: MyRoute,
})

function MyRoute() {
  return <WebGPUScene>{/* ... */}</WebGPUScene>
}
```

#### Utils (`@studio/utils`)

```typescript
import { cn, wait, math } from '@studio/utils'
import { ErrorBoundary } from '@studio/utils/error-boundary'
```

**When to add new utility:**
- Add to `packages/studio/utils/your-util.ts`
- Export from `packages/studio/utils/index.ts`

---

## 🎯 Common Tasks

### Task 1: Add a New PBR Material

**Steps:**
1. Create file: `packages/tsl/materials/pbr/holographic.ts`
2. Implement material:
   ```typescript
   import { Fn, vec3, float } from 'three/tsl'
   
   export const holographic = Fn((params) => {
     // Material implementation
     return { color: vec3(), metalness: float(), roughness: float() }
   })
   ```
3. Export: `packages/tsl/materials/pbr/index.ts`
   ```typescript
   export * from './holographic'
   ```
4. Use:
   ```typescript
   import { holographic } from '@tsl/materials/pbr'
   ```

---

### Task 2: Add a New Post-Processing Effect

**Steps:**
1. Create file: `packages/tsl/post/effects/glitch.ts`
2. Implement effect:
   ```typescript
   import { Fn, vec3, uv } from 'three/tsl'
   
   export const glitch = Fn((scene, params) => {
     const _uv = uv()
     // Effect implementation
     return vec3(scene.sample(_uv))
   })
   ```
3. Export: `packages/tsl/post/effects/index.ts`
   ```typescript
   export * from './glitch'
   ```
4. Use:
   ```typescript
   import { glitch } from '@tsl/post/effects'
   ```

---

### Task 3: Create a New Demo

**Steps:**
1. Create folder: `packages/studio/demos/gltf-showcase/`
2. Create scene: `scene.ts`
   ```typescript
   import { Scene, PerspectiveCamera } from 'three'
   import { createRenderer } from '@engine/core'
   import { standard } from '@tsl/materials/pbr'
   
   export async function createGLTFShowcase(renderer) {
     const scene = new Scene()
     const camera = new PerspectiveCamera()
     // Setup scene
     
     return {
       scene,
       camera,
       render: () => renderer.render(scene, camera),
       dispose: () => {
         // Cleanup
       }
     }
   }
   ```
3. Create canvas: `canvas.tsx`
   ```typescript
   import { useEffect, useRef } from 'react'
   import { createRenderer } from '@engine/core'
   import { createGLTFShowcase } from './scene'
   
   export function GLTFShowcaseCanvas() {
     const containerRef = useRef<HTMLDivElement>(null)
     
     useEffect(() => {
       // Setup and render loop
     }, [])
     
     return <div ref={containerRef} />
   }
   ```
4. Create index: `index.ts`
   ```typescript
   export * from './scene'
   export * from './canvas'
   ```
5. Add route: `packages/studio/routes/demos.$demoId.tsx`

---

### Task 4: Create a User Sketch

**Steps:**
1. Create file: `packages/studio/sketches/examples/waves.ts`
2. Write sketch:
   ```typescript
   import { Fn, vec3, uv, time, sin } from 'three/tsl'
   import { screenAspectUV } from '@tsl/utils/function'
   
   const sketch = Fn(() => {
     const _uv = screenAspectUV()
     const wave = sin(_uv.y.mul(10).add(time))
     
     return vec3(wave, _uv.x, 0.5)
   })
   
   export default sketch
   ```
3. Access at: `http://localhost:5173/sketches/examples/waves`

---

### Task 5: Add a Compute Shader

**Steps:**
1. Create file: `packages/tsl/compute/simulation/physics.ts`
2. Implement:
   ```typescript
   import { Fn, vec3, float } from 'three/tsl'
   
   export const physics = Fn((position, velocity, dt) => {
     // Physics simulation
     return { position: vec3(), velocity: vec3() }
   })
   ```
3. Export: `packages/tsl/compute/simulation/index.ts`
4. Use:
   ```typescript
   import { physics } from '@tsl/compute/simulation'
   ```

---

## 📝 File Naming Conventions

### Files

```typescript
// ✅ TSL files: kebab-case
screen-aspect-uv.ts
chromatic-aberration.ts
curl-noise-3d.ts

// ✅ React components: PascalCase
WebGPUScene.tsx
SketchesDropdown.tsx
MainLayout.tsx

// ✅ Utilities: camelCase
cosinePalette.ts
domainIndex.ts

// ✅ Demos: kebab-case folders, PascalCase files
pbr-showcase/
  scene.ts
  canvas.tsx
```

### Exports

```typescript
// ✅ Named exports for functions/classes
export const simplexNoise3d = Fn(...)
export class ParticleEmitter { ... }

// ✅ Default export for sketches
export default Fn(() => { ... })

// ✅ Type exports
export type { RendererHandle, RendererInitOptions }
```

---

## 🔍 Finding Code

### "Where do I find...?"

| Looking for | Location |
|-------------|----------|
| Renderer setup | `@engine/core/renderer` |
| PBR materials | `@tsl/materials/pbr` |
| Stylized materials | `@tsl/materials/stylized` |
| Post effects | `@tsl/post/effects` |
| Compute shaders | `@tsl/compute` |
| Noise functions | `@tsl/noise` |
| Shader utilities | `@tsl/utils` |
| React components | `@studio/components` |
| Demos | `@studio/demos` |
| User sketches | `@studio/sketches` |
| Routes | `@studio/routes` |
| App utils | `@studio/utils` |

---

## 🐛 Debugging

### TypeScript Errors

```bash
# Check specific package
cd packages/engine && tsc --noEmit
cd packages/tsl && tsc --noEmit
cd packages/studio && tsc --noEmit

# Check all
tsc -b
```

### Import Errors

**Problem:** `Cannot find module '@tsl/noise'`

**Solution:**
1. Check `tsconfig.json` paths
2. Check `vite.config.ts` aliases
3. Run `pnpm install`
4. Restart dev server

### Circular Dependencies

**Problem:** "Circular dependency detected"

**Check:**
- Engine doesn't import from TSL or Studio
- TSL doesn't import from Studio
- Use type imports when possible: `import type { ... }`

---

## 🎨 Best Practices

### Imports

```typescript
// ✅ Good: Use package aliases
import { createRenderer } from '@engine/core'
import { bloom } from '@tsl/post/effects'
import { WebGPUScene } from '@studio/components'

// ❌ Bad: Relative imports across packages
import { createRenderer } from '../../../engine/core/renderer'
```

### Layer Respect

```typescript
// ✅ Good: Studio imports from Engine
// packages/studio/components/canvas/Canvas.tsx
import { createRenderer } from '@engine/core'

// ❌ Bad: Engine imports from Studio
// packages/engine/core/renderer.ts
import { WebGPUScene } from '@studio/components' // NO!
```

### Type Safety

```typescript
// ✅ Good: Use types
import type { RendererHandle } from '@engine/core'

const renderer: RendererHandle = await createRenderer()

// ❌ Bad: Any types
const renderer: any = await createRenderer()
```

### Exports

```typescript
// ✅ Good: Organized exports
// packages/tsl/materials/pbr/index.ts
export * from './standard'
export * from './anisotropy'
export * from './clearcoat'

// ❌ Bad: Individual file exports only
// (makes imports verbose)
```

---

## 🚀 Performance Tips

### Tree Shaking

```typescript
// ✅ Good: Import only what you need
import { bloom } from '@tsl/post/effects/bloom'

// 🟡 OK: Named imports (tree-shakeable)
import { bloom, taa } from '@tsl/post/effects'

// ❌ Bad: Import everything
import * as effects from '@tsl/post/effects'
const myBloom = effects.bloom
```

### Lazy Loading

```typescript
// ✅ Good: Lazy load demos
const PBRShowcase = lazy(() => import('@studio/demos/pbr-showcase'))

// ❌ Bad: Load everything upfront
import { PBRShowcase } from '@studio/demos/pbr-showcase'
```

---

## 📚 Additional Resources

### Documentation
- [Architecture Overview](./ARCHITECTURE_PROPOSAL.md)
- [Migration Guide](./MIGRATION_GUIDE.md)
- [Structure Comparison](./STRUCTURE_COMPARISON.md)

### Learning
- [Three.js TSL Documentation](https://threejs.org/docs/#api/en/nodes/Nodes)
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber)
- [WebGPU Fundamentals](https://webgpufundamentals.org/)

---

## 🆘 Getting Help

### Common Issues

1. **"Module not found"**
   - Check import path matches folder structure
   - Verify `tsconfig.json` paths
   - Restart dev server

2. **"Type errors after migration"**
   - Run `pnpm install`
   - Delete `node_modules` and reinstall
   - Check TypeScript version

3. **"Circular dependency"**
   - Use `import type` for types
   - Check layer dependencies
   - Refactor to break cycle

---

## ✅ Checklist for New Features

### Before Starting
- [ ] Understand which layer the feature belongs to
- [ ] Check if similar code exists
- [ ] Plan import dependencies

### During Development
- [ ] Follow naming conventions
- [ ] Respect layer boundaries
- [ ] Add TypeScript types
- [ ] Export from index files

### Before Committing
- [ ] Run `tsc -b` (no errors)
- [ ] Run `pnpm build` (builds successfully)
- [ ] Test in browser
- [ ] Update documentation if needed

---

*Happy coding! 🎉*

