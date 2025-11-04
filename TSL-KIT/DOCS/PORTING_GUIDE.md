# 🔄 TSLStudio Module Porting Guide

> **Version**: 1.0.0  
> **Last Updated**: November 4, 2025

This guide provides step-by-step instructions for porting modules from example repositories into TSLStudio while maintaining quality, consistency, and best practices.

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Porting Process](#porting-process)
3. [Source Repository Guide](#source-repository-guide)
4. [Module Types](#module-types)
5. [Code Conventions](#code-conventions)
6. [Testing Requirements](#testing-requirements)
7. [Documentation Standards](#documentation-standards)
8. [Common Patterns](#common-patterns)
9. [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

### Goals
- ✅ Maintain original functionality
- ✅ Improve code quality and types
- ✅ Follow TSLStudio conventions
- ✅ Add comprehensive documentation
- ✅ Ensure optimal performance

### Prerequisites
- Understanding of Three.js WebGPU and TSL
- TypeScript knowledge
- Familiarity with compute shaders
- Git workflow knowledge

---

## 🔄 Porting Process

### Step 1: Identify Source Module

**Action**: Locate the module in example repositories

**Checklist**:
- [ ] Find source file location
- [ ] Identify dependencies
- [ ] Check for similar existing modules
- [ ] Verify Three.js version compatibility
- [ ] Review license requirements

**Example**:
```bash
# Source location
RESOURCES/REPOSITORIES/portfolio examples/portfolio-main/src/utils/webgpu/nodes/lighting/diffuse.ts

# Check for existing
TSLStudio/src/tsl/utils/lighting/diffuse.ts  # (may already exist)
```

---

### Step 2: Analyze Module

**Action**: Understand the module's purpose and implementation

**Questions to Answer**:
- What does this module do?
- What are the inputs and outputs?
- What are the dependencies?
- Are there any performance considerations?
- How is it typically used?

**Analysis Template**:
```markdown
## Module Analysis: [Module Name]

**Purpose**: [Brief description]

**Inputs**:
- input1: type - description
- input2: type - description

**Outputs**:
- return: type - description

**Dependencies**:
- three/tsl imports
- other module dependencies

**Performance Notes**:
- Any considerations

**Usage Pattern**:
```typescript
// Example usage
```
```

---

### Step 3: Create Target File

**Action**: Create the new module file in the appropriate location

**Location Mapping**:

#### TSL Utilities
```
Source: portfolio-main/src/utils/webgpu/nodes/[category]/[module].ts
Target: TSLStudio/src/tsl/utils/[category]/[module].ts

Examples:
- lighting/diffuse.ts → src/tsl/utils/lighting/diffuse.ts
- noise/voronoi.ts → src/tsl/noise/voronoi.ts
- sdf/box.ts → src/tsl/utils/sdf/shapes/box.ts
```

#### Engine Modules
```
Source: various
Target: TSLStudio/engine/[category]/[module].ts

Examples:
- Fluid simulation → engine/compute/fluid/[module].ts
- Post effects → engine/fx/[effect].ts
- Materials → engine/materials/[material].ts
```

---

### Step 4: Port & Adapt Code

**Action**: Copy and adapt the source code

**Adaptation Checklist**:
- [ ] Add TypeScript types
- [ ] Update import paths
- [ ] Add JSDoc comments
- [ ] Follow naming conventions
- [ ] Add `.setLayout()` if missing
- [ ] Use `@ts-nocheck` only if absolutely necessary
- [ ] Add error handling
- [ ] Optimize if possible

**Example Port**:

**Source** (portfolio-main):
```typescript
import { Fn, ShaderNodeObject, dot, max } from 'three/tsl';
import { Node } from 'three/webgpu';

export const diffuseNode = Fn<[ShaderNodeObject<Node>, ShaderNodeObject<Node>, ShaderNodeObject<Node>]>(
    ([lightColor, lightDir, normal]) => {
        const dp = max(0, dot(lightDir, normal));
        return dp.mul(lightColor);
    },
);
```

**Target** (TSLStudio):
```typescript
// src/tsl/utils/lighting/diffuse.ts
import { Fn, type ShaderNodeObject, dot, max, type Vec3 } from 'three/tsl'
import type { Node } from 'three/webgpu'

/**
 * Lambertian diffuse lighting calculation
 * 
 * Calculates diffuse lighting using the Lambert cosine law.
 * Returns light color modulated by the angle between light and surface normal.
 * 
 * @param lightColor - The color/intensity of the light source (vec3)
 * @param lightDir - Direction vector from surface to light (normalized vec3)
 * @param normal - Surface normal vector (normalized vec3)
 * @returns Diffuse lighting contribution (vec3)
 * 
 * @example
 * ```typescript
 * import { diffuse } from '@tsl/utils/lighting'
 * 
 * const material = new MeshBasicNodeMaterial()
 * 
 * material.colorNode = Fn(() => {
 *   const normal = normalWorld
 *   const lightDir = normalize(vec3(1, 1, 0))
 *   const lightColor = vec3(1, 1, 0.9)
 *   
 *   return diffuse(lightColor, lightDir, normal)
 * })()
 * ```
 */
export const diffuse = Fn<[ShaderNodeObject<Node>, ShaderNodeObject<Node>, ShaderNodeObject<Node>]>(
  ([lightColor, lightDir, normal]) => {
    // Compute dot product, clamped to [0, 1]
    const ndotl = max(0, dot(lightDir, normal))
    
    // Modulate light color by angle
    return ndotl.mul(lightColor)
  }
).setLayout({
  name: 'diffuse',
  type: 'vec3',
  inputs: [
    { name: 'lightColor', type: 'vec3' },
    { name: 'lightDir', type: 'vec3' },
    { name: 'normal', type: 'vec3' }
  ]
})
```

**Key Changes**:
1. ✅ Added comprehensive JSDoc
2. ✅ Used `type` imports for types
3. ✅ Renamed to match TSLStudio conventions
4. ✅ Added `.setLayout()` for clarity
5. ✅ Added usage example
6. ✅ Added inline comments

---

### Step 5: Update Index Exports

**Action**: Add module to appropriate index files

**Example**:
```typescript
// src/tsl/utils/lighting/index.ts
export * from './diffuse'
export * from './ambient'
export * from './specular'
export * from './fresnel'
// ... other lighting utilities
```

```typescript
// src/tsl/utils/index.ts
export * as lighting from './lighting'
export * as sdf from './sdf'
export * as color from './color'
// ... other utility categories
```

---

### Step 6: Create Tests

**Action**: Write unit tests for the module

**Test Template**:
```typescript
// src/tsl/utils/lighting/__tests__/diffuse.test.ts
import { describe, it, expect, beforeAll } from 'vitest'
import { diffuse } from '../diffuse'
import { vec3, normalize } from 'three/tsl'
import { WebGPURenderer } from 'three/webgpu'

describe('diffuse', () => {
  let renderer: WebGPURenderer

  beforeAll(async () => {
    // Setup test renderer
    renderer = new WebGPURenderer()
    await renderer.init()
  })

  it('should return zero for perpendicular light', () => {
    // Test perpendicular case
    const lightColor = vec3(1, 1, 1)
    const lightDir = vec3(1, 0, 0)
    const normal = vec3(0, 1, 0)
    
    const result = diffuse(lightColor, lightDir, normal)
    // Add assertions
  })

  it('should return full light for parallel light', () => {
    // Test parallel case
    const lightColor = vec3(1, 1, 1)
    const lightDir = vec3(0, 1, 0)
    const normal = vec3(0, 1, 0)
    
    const result = diffuse(lightColor, lightDir, normal)
    // Add assertions
  })

  it('should handle negative dot products correctly', () => {
    // Test backface case
    const lightColor = vec3(1, 1, 1)
    const lightDir = vec3(0, 1, 0)
    const normal = vec3(0, -1, 0)
    
    const result = diffuse(lightColor, lightDir, normal)
    // Should return zero or close to it
  })
})
```

---

### Step 7: Create Demo/Example

**Action**: Create a visual demonstration

**Demo Location**: `src/sketches/demos/[module-name].ts`

**Example**:
```typescript
// src/sketches/demos/diffuse-lighting.ts
import { Fn, vec3, normalize, time, oscSine, normalWorld } from 'three/tsl'
import { diffuse } from '@/tsl/utils/lighting'

/**
 * Demo: Diffuse Lighting
 * 
 * Demonstrates the diffuse lighting utility with an animated light direction.
 */
export default Fn(() => {
  const normal = normalWorld
  
  // Animated light direction
  const lightDir = normalize(
    vec3(
      oscSine(time.mul(0.5)),
      1,
      oscSine(time.mul(0.3))
    )
  )
  
  const lightColor = vec3(1, 0.95, 0.9) // Warm white light
  
  return diffuse(lightColor, lightDir, normal)
})
```

---

### Step 8: Document

**Action**: Create/update documentation

**Documentation Files**:
1. **Module JSDoc** (in source file) ✅
2. **API Reference** (auto-generated from JSDoc)
3. **Tutorial/Guide** (if complex module)
4. **README updates** (if new category)

**Example Tutorial**:
```markdown
# Lighting Utilities Guide

## Diffuse Lighting

The `diffuse` utility implements Lambertian diffuse lighting...

### Basic Usage

```typescript
import { diffuse } from '@tsl/utils/lighting'

material.colorNode = Fn(() => {
  return diffuse(lightColor, lightDir, normal)
})()
```

### Advanced Usage

[More examples]
```

---

### Step 9: Performance Test

**Action**: Profile and optimize

**Performance Checklist**:
- [ ] Run Chrome DevTools profiler
- [ ] Check for unnecessary calculations
- [ ] Verify node caching
- [ ] Test with large datasets
- [ ] Compare with original performance
- [ ] Document any trade-offs

**Optimization Tips**:
```typescript
// ❌ BAD: Recalculating every frame
material.colorNode = Fn(() => {
  const expensive = complexCalculation()
  return expensive.mul(input)
})()

// ✅ GOOD: Cache expensive calculations
const expensive = complexCalculation() // Outside Fn
material.colorNode = Fn(() => {
  return expensive.mul(input)
})()

// ✅ BETTER: Use .toVar() for reused values
const result = Fn(() => {
  const cached = expensiveOp().toVar()
  return cached.add(cached.mul(2))
})
```

---

### Step 10: Code Review & Integration

**Action**: Submit for review

**Pre-submission Checklist**:
- [ ] All tests passing
- [ ] Documentation complete
- [ ] Demo working
- [ ] Performance acceptable
- [ ] No linter errors
- [ ] TypeScript strict mode
- [ ] Code reviewed by peer

**Git Workflow**:
```bash
# Create feature branch
git checkout -b port/lighting-diffuse

# Add files
git add src/tsl/utils/lighting/diffuse.ts
git add src/tsl/utils/lighting/__tests__/diffuse.test.ts
git add src/sketches/demos/diffuse-lighting.ts

# Commit with descriptive message
git commit -m "feat(tsl): port diffuse lighting utility

- Port diffuse lighting from portfolio examples
- Add comprehensive JSDoc and TypeScript types
- Include unit tests and demo sketch
- Add to lighting utilities index

Source: portfolio-main/src/utils/webgpu/nodes/lighting/diffuse.ts"

# Push and create PR
git push origin port/lighting-diffuse
```

---

## 📚 Source Repository Guide

### Portfolio Examples (Maxime Heckel)
**Path**: `RESOURCES/REPOSITORIES/portfolio examples/portfolio-main/`

**Key Areas**:
- `src/utils/webgpu/nodes/` - TSL utility nodes
  - `lighting/` - Lighting models
  - `noise/` - Noise functions
  - `sdf/` - SDF primitives
  - Root - Helper functions

**Porting Notes**:
- Modern TSL patterns
- Well-structured and typed
- Production-tested
- May need minor adaptations

**Example Ports**:
```
Source → Target
---------------------------------------
lighting/diffuse.ts → tsl/utils/lighting/diffuse.ts
noise/voronoi.ts → tsl/noise/voronoi.ts
sdf/sphere.ts → tsl/utils/sdf/shapes/sphere.ts
smooth-min.ts → tsl/utils/function/smooth-min.ts
```

---

### Fragments Boilerplate Vanilla
**Path**: `RESOURCES/REPOSITORIES/TSLwebgpuExamples/fragments-boilerplate-vanilla-main/`

**Key Areas**:
- `src/tsl/noise/` - Noise implementations
- `src/tsl/post_processing/` - Post effects
- `src/tsl/utils/` - Various utilities

**Porting Notes**:
- JavaScript, needs TypeScript conversion
- Well-organized by category
- Ready-to-use post effects
- Minimal dependencies

**Example Ports**:
```
Source → Target
---------------------------------------
tsl/post_processing/halftone.js → tsl/post_processing/halftone_effect.ts
tsl/utils/color/cosine_palette.js → tsl/utils/color/cosine_palette.ts
tsl/utils/sdf/operations.js → tsl/utils/sdf/operations.ts
```

---

### Three.js TSL Sandbox
**Path**: `RESOURCES/REPOSITORIES/TSLwebgpuExamples/three.js-tsl-sandbox-master/`

**Key Areas**:
- Individual project folders with complete examples
- `[project]/src/` - Source files
- Particle systems, effects, materials

**Porting Notes**:
- Complete working examples
- May need extraction/refactoring
- Good reference for integration patterns
- Mix of complexities

**Example Ports**:
```
Source → Target
---------------------------------------
halftone/src/HalftoneEffect.js → engine/fx/halftone.ts
particles-flow-field/src/FlowField.js → engine/compute/particles/flowField.ts
hologram/src/HologramMaterial.js → engine/materials/hologram.ts
```

---

### Roquefort (Fluid Simulation)
**Path**: `RESOURCES/REPOSITORIES/TSLwebgpuExamples/roquefort-main/`

**Key Areas**:
- `src/simulation/` - Fluid operators
- `src/rendering/` - Rendering utilities

**Porting Notes**:
- Complete fluid system
- WebGPU compute shaders
- May need significant adaptation
- Complex dependencies

**Example Ports**:
```
Source → Target
---------------------------------------
simulation/advect.js → engine/compute/fluid/operators/advection.ts
simulation/pressure.js → engine/compute/fluid/operators/pressure.ts
simulation/vorticity.js → engine/compute/fluid/operators/vorticity.ts
```

---

### SSR/GTAO Examples
**Path**: `RESOURCES/REPOSITORIES/TSLwebgpuExamples/ssr-gtao-keio/`, `ssgi-ssr-painter/`

**Key Areas**:
- `src/script.js` - Main implementation

**Porting Notes**:
- Advanced shader techniques
- High complexity
- May need significant refactoring
- Performance critical

**Example Ports**:
```
Source → Target
---------------------------------------
ssr-gtao/src/script.js → engine/fx/screenSpace/ssr.ts + gtao.ts
ssgi-ssr/src/script.js → engine/fx/screenSpace/ssgi.ts
```

---

## 🎨 Module Types

### Type 1: TSL Utility Function
**Characteristics**:
- Pure function, no state
- Returns shader node
- Typically short (<50 lines)

**Template**:
```typescript
import { Fn, type ShaderNodeObject } from 'three/tsl'
import type { Node } from 'three/webgpu'

/**
 * [Description]
 */
export const utilityName = Fn<[ShaderNodeObject<Node>]>(([input]) => {
  // Implementation
  return output
}).setLayout({
  name: 'utilityName',
  type: 'vec3',
  inputs: [{ name: 'input', type: 'vec3' }]
})
```

---

### Type 2: Engine Module (Stateful)
**Characteristics**:
- Manages state
- Has configuration
- Lifecycle methods (init, update, dispose)

**Template**:
```typescript
import type { WebGPURenderer } from 'three/webgpu'

export type ModuleConfig = {
  // Configuration
}

export type ModuleHandle = {
  update(delta: number): void
  dispose(): void
  // Other methods
}

/**
 * [Description]
 */
export function createModule(config: ModuleConfig): ModuleHandle {
  // State
  
  return {
    update(delta) {
      // Update logic
    },
    dispose() {
      // Cleanup
    }
  }
}
```

---

### Type 3: Post-Processing Effect
**Characteristics**:
- Implements PostEffect interface
- Returns color modification function

**Template**:
```typescript
import { Fn, type ShaderNodeObject } from 'three/tsl'
import type { PostEffect } from '@engine/fx/types'

export type EffectOptions = {
  strength?: number
  // Other options
}

/**
 * [Description]
 */
export function createEffect(options: EffectOptions = {}): PostEffect {
  const { strength = 1.0 } = options
  
  return ({ color, input }) => {
    // Effect implementation
    return modifiedColor
  }
}
```

---

### Type 4: Material System
**Characteristics**:
- Creates or modifies materials
- Integrates with PBR or custom materials

**Template**:
```typescript
import { MeshPhysicalNodeMaterial, type MeshPhysicalNodeMaterialParameters } from 'three/webgpu'

export type MaterialConfig = MeshPhysicalNodeMaterialParameters & {
  // Additional options
}

/**
 * [Description]
 */
export function createMaterial(config: MaterialConfig = {}) {
  const material = new MeshPhysicalNodeMaterial({
    ...config
  })
  
  // Custom node assignments
  
  return {
    material,
    // Utility methods
  }
}
```

---

### Type 5: Compute System
**Characteristics**:
- GPU compute shaders
- Buffer management
- Simulation logic

**Template**:
```typescript
import { storage, Fn, instanceIndex } from 'three/tsl'
import { StorageInstancedBufferAttribute } from 'three/webgpu'
import type { WebGPURenderer } from 'three/webgpu'

export type ComputeConfig = {
  count: number
  // Other config
}

export type ComputeHandle = {
  readonly buffers: {
    // Buffer definitions
  }
  init(renderer: WebGPURenderer): void
  update(renderer: WebGPURenderer, delta: number): void
  dispose(): void
}

/**
 * [Description]
 */
export function createComputeSystem(config: ComputeConfig): ComputeHandle {
  // Buffer creation
  // Compute shader definition
  
  return {
    buffers: {},
    init(renderer) {
      // Initialization
    },
    update(renderer, delta) {
      // Update
    },
    dispose() {
      // Cleanup
    }
  }
}
```

---

## 📐 Code Conventions

### Naming Conventions

**Files**:
```
✅ kebab-case.ts
✅ camel-case.ts
❌ PascalCase.ts
❌ snake_case.ts
```

**Exports**:
```typescript
// ✅ Utilities: camelCase
export const diffuse = Fn(...)
export const simplexNoise3d = Fn(...)

// ✅ Factories: camelCase with 'create' prefix
export function createBloomEffect(...)
export function createFluidSystem(...)

// ✅ Types: PascalCase
export type MaterialConfig = {...}
export type PostEffect = {...}

// ✅ Constants: UPPER_SNAKE_CASE
export const MAX_PARTICLES = 1000000
```

**Variables**:
```typescript
// ✅ Local variables: camelCase
const lightDirection = vec3(1, 0, 0)
const normalizedValue = normalize(input)

// ✅ Shader variables: camelCase
const uTime = uniform(0)
const vPosition = varying(vec3())

// ✅ TSL temp vars: camelCase with descriptive names
const nDotL = dot(normal, lightDir).toVar()
const fresnel = pow(oneMinusF, 5).toVar()
```

---

### Import Organization

**Order**:
1. Three.js core imports
2. Three.js WebGPU imports
3. Three.js TSL imports
4. External libraries
5. Internal engine imports
6. Internal TSL imports
7. Relative imports
8. Type imports (using `type` keyword)

**Example**:
```typescript
// Three.js core
import { Vector3, Color } from 'three'

// Three.js WebGPU
import { WebGPURenderer, MeshBasicNodeMaterial } from 'three/webgpu'
import type { Node } from 'three/webgpu'

// Three.js TSL
import { 
  Fn, 
  vec3, 
  float, 
  uniform, 
  texture,
  type ShaderNodeObject 
} from 'three/tsl'

// External libraries
import { useFrame } from '@react-three/fiber'

// Internal engine
import { createRenderer } from '@engine/core'

// Internal TSL
import { simplexNoise3d } from '@tsl/noise'

// Relative imports
import { helperFunction } from './utils'

// Type imports
import type { CustomType } from './types'
```

---

### TypeScript Guidelines

**Use Strict Mode**:
```typescript
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true
  }
}
```

**Type Everything**:
```typescript
// ❌ Implicit any
export const helper = (input) => {...}

// ✅ Explicit types
export const helper = (input: ShaderNodeObject<Node>): ShaderNodeObject<Node> => {...}

// ✅ Type parameters for Fn
export const shader = Fn<[ShaderNodeObject<Node>, ShaderNodeObject<Node>]>(
  ([input1, input2]) => {...}
)
```

**Use Type Imports**:
```typescript
// ✅ Import only types as types
import type { Node } from 'three/webgpu'
import type { ShaderNodeObject } from 'three/tsl'

// ✅ Mixed imports
import { Fn, type ShaderNodeObject } from 'three/tsl'
```

---

### JSDoc Standards

**Required Sections**:
1. Description
2. Parameters (`@param`)
3. Returns (`@returns`)
4. Example (`@example`)
5. Optional: `@see`, `@deprecated`, `@since`

**Template**:
```typescript
/**
 * Brief one-line description
 * 
 * Longer description if needed. Can span multiple lines.
 * Explain the purpose, behavior, and any important notes.
 * 
 * @param param1 - Description of parameter 1
 * @param param2 - Description of parameter 2
 * @param options - Optional configuration object
 * @param options.strength - Strength of the effect (default: 1.0)
 * @returns Description of return value
 * 
 * @example
 * ```typescript
 * // Basic usage
 * const result = utilityName(input1, input2)
 * 
 * // With options
 * const result = utilityName(input1, input2, { strength: 0.5 })
 * ```
 * 
 * @see {@link relatedFunction} for related functionality
 * @since 1.0.0
 */
```

---

## 🧪 Testing Requirements

### Unit Tests

**Required Tests**:
1. Basic functionality test
2. Edge case tests
3. Error handling tests
4. Performance test (if applicable)

**Coverage Target**: >80%

**Example**:
```typescript
describe('ModuleName', () => {
  describe('basic functionality', () => {
    it('should return expected output for typical input', () => {
      // Test
    })
  })

  describe('edge cases', () => {
    it('should handle zero input', () => {
      // Test
    })

    it('should handle very large input', () => {
      // Test
    })

    it('should handle negative input', () => {
      // Test
    })
  })

  describe('error handling', () => {
    it('should throw error for invalid input', () => {
      expect(() => {
        // Invalid operation
      }).toThrow()
    })
  })
})
```

---

### Integration Tests

**When Needed**:
- Module depends on other modules
- Module integrates with framegraph
- Module has complex lifecycle

**Example**:
```typescript
describe('Integration: FluidSimulation', () => {
  it('should integrate with particle system', async () => {
    const renderer = await createTestRenderer()
    const fluid = createFluidSystem({ ... })
    const particles = createParticleSystem({ ... })
    
    // Test integration
  })
})
```

---

### Visual Tests

**When Needed**:
- Visual effects
- Materials
- Post-processing

**Method**:
- Screenshot comparison
- Reference images
- Visual regression testing

---

## 📖 Documentation Standards

### README Updates

**When to Update**:
- New module category
- Significant features
- Breaking changes

**Sections to Update**:
- Features list
- Quick start examples
- API overview

---

### API Reference

**Auto-generated from JSDoc**:
- Use typedoc or similar tool
- Keep JSDoc up-to-date
- Include all public APIs

---

### Tutorials

**When to Create**:
- Complex module
- New paradigm
- Common use case

**Structure**:
1. Introduction
2. Prerequisites
3. Step-by-step guide
4. Advanced usage
5. Tips & tricks
6. Troubleshooting

---

## 🔍 Common Patterns

### Pattern 1: Reusable TSL Function

```typescript
import { Fn } from 'three/tsl'

export const reusableFunction = Fn(([input]) => {
  // Calculation
  return result
}).setLayout({
  name: 'reusableFunction',
  type: 'vec3',
  inputs: [{ name: 'input', type: 'vec3' }]
})
```

---

### Pattern 2: Configurable Effect

```typescript
export type EffectConfig = {
  strength?: number
  quality?: 'low' | 'medium' | 'high'
}

export function createEffect(config: EffectConfig = {}): PostEffect {
  const { 
    strength = 1.0,
    quality = 'medium' 
  } = config
  
  // Effect implementation
  
  return ({ color }) => modifiedColor
}
```

---

### Pattern 3: Storage Buffer System

```typescript
import { storage, Fn, instanceIndex } from 'three/tsl'
import { StorageInstancedBufferAttribute } from 'three/webgpu'

export function createBufferSystem(count: number) {
  const positionBuffer = storage(
    new StorageInstancedBufferAttribute(count, 3),
    'vec3',
    count
  )
  
  const computeShader = Fn(() => {
    const pos = positionBuffer.element(instanceIndex)
    // Modify position
    pos.assign(newPosition)
  })().compute(count)
  
  return {
    positionAttribute: positionBuffer.toAttribute(),
    update: (renderer) => renderer.compute(computeShader)
  }
}
```

---

### Pattern 4: Material Extension

```typescript
import { MeshPhysicalNodeMaterial } from 'three/webgpu'
import { Fn, uv, texture } from 'three/tsl'

export function createCustomMaterial(baseConfig = {}) {
  const material = new MeshPhysicalNodeMaterial({
    ...baseConfig
  })
  
  // Add custom nodes
  material.colorNode = Fn(() => {
    // Custom color calculation
    return finalColor
  })()
  
  return material
}
```

---

## 🐛 Troubleshooting

### Common Issues

#### Issue: "Cannot find module"
**Cause**: Import path incorrect  
**Solution**: Check path aliases in `tsconfig.json` and `vite.config.ts`

```typescript
// ❌ Wrong
import { helper } from '@/tsl/utils/helper'

// ✅ Correct (if using @ alias)
import { helper } from '@tsl/utils/helper'
```

---

#### Issue: "Type 'X' is not assignable to type 'Y'"
**Cause**: Type mismatch in TSL nodes  
**Solution**: Use proper type assertions or conversions

```typescript
// ❌ Wrong
const value: Float = vec3(1)

// ✅ Correct
const value = float(1)
```

---

#### Issue: "Compute shader not executing"
**Cause**: Not calling `renderer.compute()`  
**Solution**: Ensure compute is called in render loop

```typescript
// ✅ Correct
function animate() {
  renderer.compute(computeNode)
  renderer.render(scene, camera)
  requestAnimationFrame(animate)
}
```

---

#### Issue: "Performance degradation"
**Cause**: Creating nodes in render loop  
**Solution**: Create nodes outside, use uniforms for animation

```typescript
// ❌ Wrong
useFrame(() => {
  material.colorNode = Fn(() => {
    // Recreated every frame!
    return calculation()
  })()
})

// ✅ Correct
const colorNode = Fn(() => {
  return calculation()
})()
material.colorNode = colorNode

useFrame(() => {
  // Only update uniforms
  timeUniform.value += delta
})
```

---

#### Issue: "Module not tree-shakeable"
**Cause**: Side effects or improper exports  
**Solution**: Use proper ESM exports, avoid side effects

```typescript
// ❌ Wrong
export default {
  utility1,
  utility2
}

// ✅ Correct
export { utility1 }
export { utility2 }
```

---

## 📋 Checklist Template

Use this checklist for each port:

```markdown
## Port: [Module Name]

### Analysis
- [ ] Source identified
- [ ] Purpose understood
- [ ] Dependencies mapped
- [ ] Similar modules checked
- [ ] License verified

### Implementation
- [ ] File created in correct location
- [ ] Code ported and adapted
- [ ] TypeScript types added
- [ ] Naming conventions followed
- [ ] JSDoc comments added
- [ ] Index exports updated

### Testing
- [ ] Unit tests created
- [ ] Tests passing
- [ ] Edge cases covered
- [ ] Performance tested
- [ ] Visual test (if applicable)

### Documentation
- [ ] JSDoc complete
- [ ] Usage example added
- [ ] Demo/sketch created
- [ ] API reference updated
- [ ] Tutorial (if needed)

### Quality
- [ ] Linter passing
- [ ] TypeScript strict mode
- [ ] No console warnings
- [ ] Performance acceptable
- [ ] Code reviewed

### Integration
- [ ] Branch created
- [ ] Committed with message
- [ ] PR created
- [ ] Review requested
- [ ] Tests passing in CI
```

---

**Last Updated**: November 4, 2025  
**Version**: 1.0.0

For questions or clarifications, refer to the [Development Plan](./DEVELOPMENT_PLAN.md) or [TODO List](./TODO.md).

