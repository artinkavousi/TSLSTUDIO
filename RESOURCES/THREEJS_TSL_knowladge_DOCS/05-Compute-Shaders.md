# Compute Shaders in TSL & WebGPU

## Overview

Compute shaders are one of the most exciting features introduced by WebGPU. They allow you to run general-purpose computations on the GPU, separate from the rendering pipeline. This opens up possibilities for physics simulations, data processing, post-processing effects, and much more[^1].

---

## Table of Contents

1. [What are Compute Shaders?](#what-are-compute-shaders)
2. [Basic Setup](#basic-setup)
3. [Storage Textures](#storage-textures)
4. [Workgroups and Threads](#workgroups-and-threads)
5. [Common Patterns](#common-patterns)
6. [Advanced Examples](#advanced-examples)

---

## What are Compute Shaders?

### Traditional Rendering Pipeline

```
Vertex Shader → Fragment Shader → Output
(per vertex)    (per pixel)       (image)
```

### With Compute Shaders

```
Compute Shader → Storage Buffer/Texture
(general purpose calculations, parallel processing)
```

### Key Differences

| Feature | Fragment Shader | Compute Shader |
|---------|----------------|----------------|
| **Purpose** | Render pixels | General computation |
| **Output** | Color/depth | Storage buffers/textures |
| **When runs** | During render | On demand via `compute()` |
| **Input** | Screen position | Thread/workgroup ID |
| **Use cases** | Rendering | Physics, data processing, effects prep |

---

## Basic Setup

### 1. Simple Compute Shader

```typescript
import { tslFn, instanceIndex, uniform, storage } from 'three/tsl'
import { StorageInstancedBufferAttribute } from 'three/webgpu'

// Create storage buffer
const count = 1000
const dataBuffer = storage(
  new StorageInstancedBufferAttribute(count, 1),
  'float',
  count
)

// Create compute function
const computeFn = tslFn(() => {
  // Get current thread's data
  const data = dataBuffer.element(instanceIndex)
  
  // Process data
  data.assign(data.mul(2))  // Example: double the value
})

// Create compute node
const compute = computeFn().compute(count)

// Execute compute shader
renderer.compute(compute)
```

### 2. Compute Shader Lifecycle

```typescript
class ComputeExample {
  constructor(renderer, count) {
    this.renderer = renderer
    
    // 1. Setup buffers
    this.setupBuffers(count)
    
    // 2. Create compute shader
    this.createCompute()
    
    // 3. Initialize data (optional)
    this.initialize()
  }
  
  setupBuffers(count) {
    this.positionBuffer = storage(
      new StorageInstancedBufferAttribute(count, 3),
      'vec3',
      count
    )
  }
  
  createCompute() {
    const updateFn = tslFn(() => {
      const position = this.positionBuffer.element(instanceIndex)
      // Update logic here
      position.y.addAssign(0.01)
    })
    
    this.computeUpdate = updateFn().compute(count)
  }
  
  initialize() {
    // Initialize buffers if needed
    const initFn = tslFn(() => {
      const position = this.positionBuffer.element(instanceIndex)
      position.assign(vec3(0, 0, 0))
    })
    
    this.renderer.compute(initFn().compute(count))
  }
  
  update() {
    // Call every frame
    this.renderer.compute(this.computeUpdate)
  }
}
```

---

## Storage Textures

Storage textures allow compute shaders to write directly to texture data, perfect for post-processing and image effects.

### Basic Storage Texture

```typescript
import { StorageTexture } from 'three'

// Create storage texture
const storageTexture = new StorageTexture(
  window.innerWidth * window.devicePixelRatio,
  window.innerHeight * window.devicePixelRatio
)

// Use in compute shader
const computeFn = tslFn(() => {
  // Calculate 2D coordinates from thread index
  const posX = instanceIndex.mod(
    int(window.innerWidth * window.devicePixelRatio)
  )
  const posY = instanceIndex.div(
    window.innerWidth * window.devicePixelRatio
  )
  
  const fragCoord = uvec2(posX, posY)
  
  // Calculate UV coordinates
  const uvCoord = vec2(
    float(fragCoord.x).div(float(window.innerWidth * window.devicePixelRatio)),
    float(fragCoord.y).div(float(window.innerHeight * window.devicePixelRatio))
  )
  
  // Compute color
  const color = vec4(uvCoord, 0.0, 1.0)
  
  // Write to storage texture
  textureStore(storageTexture, fragCoord, color)
})

// Create compute with one thread per pixel
const pixelCount = 
  window.innerWidth * window.devicePixelRatio * 
  window.innerHeight * window.devicePixelRatio

const compute = computeFn().compute(pixelCount)

// Execute
renderer.compute(compute)

// Use texture in render pass
material.map = storageTexture
```

### Storage Texture for Post-Processing

Here's a pattern from Maxime Heckel's work for edge detection using compute shaders[^1]:

```typescript
/**
 * Sobel edge detection using compute shader
 * 1. Compute shader fills storage texture with edge magnitudes
 * 2. Fragment shader uses that data to draw outlines
 */

class EdgeDetectionCompute {
  constructor(renderer, scenePass) {
    this.renderer = renderer
    this.scenePass = scenePass
    
    // Create storage texture for edge data
    this.storageTexture = new StorageTexture(
      window.innerWidth * window.devicePixelRatio,
      window.innerHeight * window.devicePixelRatio
    )
    
    this.setupCompute()
  }
  
  setupCompute() {
    const computeFn = tslFn(() => {
      // Convert 1D thread index to 2D coordinates
      const posX = instanceIndex.mod(
        int(window.innerWidth * window.devicePixelRatio)
      )
      const posY = instanceIndex.div(
        window.innerWidth * window.devicePixelRatio
      )
      
      const fragCoord = uvec2(posX, posY)
      const uvCoord = vec2(
        float(fragCoord.x).div(float(window.innerWidth * window.devicePixelRatio)),
        float(fragCoord.y).div(float(window.innerHeight * window.devicePixelRatio))
      )
      
      // Sample depth and normal textures
      const depthTexture = this.scenePass.getDepthNode()
      const normalTexture = this.scenePass.getNormalNode()
      
      // Sobel filter for depth
      const texelSize = vec2(1).div(vec2(
        window.innerWidth * window.devicePixelRatio,
        window.innerHeight * window.devicePixelRatio
      ))
      
      // Sample 3x3 neighborhood
      const d00 = texture(depthTexture, uvCoord.add(vec2(-1, -1).mul(texelSize))).r
      const d01 = texture(depthTexture, uvCoord.add(vec2(0, -1).mul(texelSize))).r
      const d02 = texture(depthTexture, uvCoord.add(vec2(1, -1).mul(texelSize))).r
      const d10 = texture(depthTexture, uvCoord.add(vec2(-1, 0).mul(texelSize))).r
      const d12 = texture(depthTexture, uvCoord.add(vec2(1, 0).mul(texelSize))).r
      const d20 = texture(depthTexture, uvCoord.add(vec2(-1, 1).mul(texelSize))).r
      const d21 = texture(depthTexture, uvCoord.add(vec2(0, 1).mul(texelSize))).r
      const d22 = texture(depthTexture, uvCoord.add(vec2(1, 1).mul(texelSize))).r
      
      // Sobel kernels
      const gx = d00.mul(-1).add(d02).add(d10.mul(-2)).add(d12.mul(2))
        .add(d20.mul(-1)).add(d22)
      const gy = d00.mul(-1).add(d01.mul(-2)).add(d02.mul(-1))
        .add(d20).add(d21.mul(2)).add(d22)
      
      const depthMagnitude = sqrt(gx.mul(gx).add(gy.mul(gy)))
      
      // Repeat for normals
      // ... (similar process)
      
      const totalMagnitude = depthMagnitude.add(normalMagnitude)
      
      // Store in texture
      textureStore(
        this.storageTexture,
        fragCoord,
        vec4(totalMagnitude, 0.0, 0.0, 1.0)
      )
    })
    
    const pixelCount = 
      window.innerWidth * window.devicePixelRatio * 
      window.innerHeight * window.devicePixelRatio
    
    this.compute = computeFn().compute(pixelCount)
  }
  
  update() {
    // Run every frame
    this.renderer.compute(this.compute)
  }
}

// Use in final effect
const outlineEffect = Fn(() => {
  const magnitude = texture(edgeDetection.storageTexture, uv()).r
  
  // Draw outline based on magnitude
  const outlineColor = vec3(1, 0, 0)
  const threshold = 0.1
  
  const outline = step(threshold, magnitude)
  
  return mix(sceneColor, outlineColor, outline)
})
```

**Benefits of this approach:**
- Compute shader runs once per frame, processes all pixels in parallel
- Fragment shader only needs to read the precomputed data
- Separates computation from rendering for better organization
- Can be toggled on/off without affecting render pipeline[^1]

---

## Workgroups and Threads

### Understanding Thread Organization

```typescript
// Total threads = count parameter
const count = 1000
const compute = computeFn().compute(count)

// In compute shader:
// - instanceIndex goes from 0 to 999
// - Each thread processes one element
```

### Workgroup Size

WebGPU organizes threads into **workgroups** for efficiency:

```wgsl
@compute @workgroup_size(8, 8, 1)
fn main(@builtin(global_invocation_id) global_id: vec3<u32>) {
  // global_id gives you the thread's position
}
```

In TSL, workgroup size is managed internally, but you can think of threads as:

```
Total threads = workgroups × workgroup_size
```

### 2D Compute Example

```typescript
// Image processing: one thread per pixel
const width = 1920
const height = 1080
const totalPixels = width * height

const imageProcess = tslFn(() => {
  // Convert 1D index to 2D coordinates
  const x = instanceIndex.mod(width)
  const y = instanceIndex.div(width)
  
  const uv = vec2(
    float(x).div(float(width)),
    float(y).div(float(height))
  )
  
  // Process pixel at (x, y)
  const color = someCalculation(uv)
  textureStore(outputTexture, uvec2(x, y), color)
})

const compute = imageProcess().compute(totalPixels)
```

---

## Common Patterns

### Pattern 1: Particle Update

```typescript
const particleUpdate = tslFn(() => {
  const position = positionBuffer.element(instanceIndex)
  const velocity = velocityBuffer.element(instanceIndex)
  
  // Physics
  velocity.y.subAssign(gravity.mul(deltaTime))
  position.addAssign(velocity.mul(deltaTime))
  
  // Bounds check
  If(position.y.lessThan(0), () => {
    position.y.assign(0)
    velocity.y.mulAssign(-0.8)  // Bounce
  })
})

const compute = particleUpdate().compute(particleCount)
renderer.compute(compute)
```

### Pattern 2: Data Transformation

```typescript
// Transform array of data
const transformData = tslFn(() => {
  const input = inputBuffer.element(instanceIndex)
  const output = outputBuffer.element(instanceIndex)
  
  // Transform
  output.assign(input.mul(2).add(1))
})
```

### Pattern 3: Reduction/Aggregation

```typescript
// Sum all values (simplified, real impl needs atomic operations)
const sumShared = uniform(0)

const reduceSum = tslFn(() => {
  const value = dataBuffer.element(instanceIndex)
  
  // In real implementation, use atomic operations
  // This is pseudocode
  atomicAdd(sumShared, value)
})
```

### Pattern 4: Image Filter

```typescript
const gaussianBlur = tslFn(() => {
  const x = instanceIndex.mod(width)
  const y = instanceIndex.div(width)
  const uv = vec2(float(x).div(width), float(y).div(height))
  
  const texelSize = vec2(1).div(vec2(width, height))
  
  // Sample surrounding pixels
  let sum = vec4(0).toVar()
  
  Loop({ start: -2, end: 2 }, ({ i }) => {
    Loop({ start: -2, end: 2 }, ({ j }) => {
      const offset = vec2(i, j).mul(texelSize)
      const sample = texture(inputTexture, uv.add(offset))
      const weight = gaussianWeight(i, j)
      sum.addAssign(sample.mul(weight))
    })
  })
  
  textureStore(outputTexture, uvec2(x, y), sum)
})
```

---

## Advanced Examples

### Example 1: Flocking Simulation

```typescript
class FlockingSimulation {
  constructor(renderer, boidCount) {
    this.renderer = renderer
    this.boidCount = boidCount
    
    // Buffers
    this.positionBuffer = storage(
      new StorageInstancedBufferAttribute(boidCount, 3),
      'vec3',
      boidCount
    )
    this.velocityBuffer = storage(
      new StorageInstancedBufferAttribute(boidCount, 3),
      'vec3',
      boidCount
    )
    
    // Parameters
    this.separationDistance = uniform(0.5)
    this.alignmentDistance = uniform(1.0)
    this.cohesionDistance = uniform(1.5)
    this.maxSpeed = uniform(0.1)
    
    this.setupCompute()
  }
  
  setupCompute() {
    const flockingFn = tslFn(() => {
      const myIndex = instanceIndex
      const myPosition = this.positionBuffer.element(myIndex)
      const myVelocity = this.velocityBuffer.element(myIndex)
      
      // Accumulate forces
      let separation = vec3(0).toVar()
      let alignment = vec3(0).toVar()
      let cohesion = vec3(0).toVar()
      let nearbyCount = float(0).toVar()
      
      // Check all other boids
      Loop({ start: 0, end: this.boidCount }, ({ i }) => {
        If(i.notEqual(myIndex), () => {
          const otherPos = this.positionBuffer.element(i)
          const otherVel = this.velocityBuffer.element(i)
          
          const diff = myPosition.sub(otherPos)
          const dist = length(diff)
          
          // Separation: avoid crowding
          If(dist.lessThan(this.separationDistance), () => {
            separation.addAssign(diff.div(dist))
          })
          
          // Alignment & Cohesion: align with nearby boids
          If(dist.lessThan(this.alignmentDistance), () => {
            alignment.addAssign(otherVel)
            cohesion.addAssign(otherPos)
            nearbyCount.addAssign(1)
          })
        })
      })
      
      // Average and normalize
      If(nearbyCount.greaterThan(0), () => {
        alignment.divAssign(nearbyCount)
        cohesion.divAssign(nearbyCount)
        cohesion.assign(cohesion.sub(myPosition))
      })
      
      // Apply forces
      myVelocity.addAssign(separation.mul(0.05))
      myVelocity.addAssign(alignment.mul(0.05))
      myVelocity.addAssign(cohesion.mul(0.01))
      
      // Limit speed
      const speed = length(myVelocity)
      If(speed.greaterThan(this.maxSpeed), () => {
        myVelocity.assign(
          myVelocity.div(speed).mul(this.maxSpeed)
        )
      })
      
      // Update position
      myPosition.addAssign(myVelocity)
    })
    
    this.compute = flockingFn().compute(this.boidCount)
  }
  
  update() {
    this.renderer.compute(this.compute)
  }
}
```

### Example 2: Reaction-Diffusion

```typescript
const reactionDiffusion = tslFn(() => {
  const x = instanceIndex.mod(width)
  const y = instanceIndex.div(width)
  
  // Sample current state
  const current = textureLoad(stateTexture, uvec2(x, y))
  const a = current.r
  const b = current.g
  
  // Sample neighbors for Laplacian
  const texelSize = vec2(1).div(vec2(width, height))
  const uv = vec2(float(x).div(width), float(y).div(height))
  
  let laplaceA = float(0).toVar()
  let laplaceB = float(0).toVar()
  
  // 3x3 kernel
  const kernel = [
    vec2(-1, -1), vec2(0, -1), vec2(1, -1),
    vec2(-1,  0), vec2(0,  0), vec2(1,  0),
    vec2(-1,  1), vec2(0,  1), vec2(1,  1)
  ]
  const weights = [0.05, 0.2, 0.05, 0.2, -1.0, 0.2, 0.05, 0.2, 0.05]
  
  Loop({ start: 0, end: 9 }, ({ i }) => {
    const sample = textureLoad(
      stateTexture,
      uvec2(x.add(kernel[i].x), y.add(kernel[i].y))
    )
    laplaceA.addAssign(sample.r.mul(weights[i]))
    laplaceB.addAssign(sample.g.mul(weights[i]))
  })
  
  // Reaction-diffusion equations
  const dA = uniform(1.0)  // Diffusion rate A
  const dB = uniform(0.5)  // Diffusion rate B
  const feed = uniform(0.055)
  const kill = uniform(0.062)
  
  const abb = a.mul(b).mul(b)
  const newA = a.add(dA.mul(laplaceA).sub(abb).add(feed.mul(a.oneMinus())))
  const newB = b.add(dB.mul(laplaceB).add(abb).sub(b.mul(kill.add(feed))))
  
  textureStore(
    outputTexture,
    uvec2(x, y),
    vec4(newA, newB, 0, 1)
  )
})
```

---

## Performance Tips

### 1. Minimize Memory Access

**❌ Bad**: Multiple reads

```typescript
const value1 = dataBuffer.element(instanceIndex)
const value2 = dataBuffer.element(instanceIndex)  // Duplicate read!
```

**✅ Good**: Read once, reuse

```typescript
const value = dataBuffer.element(instanceIndex)
// Use 'value' multiple times
```

### 2. Use Local Variables

```typescript
const computeFn = tslFn(() => {
  // Read from storage
  const data = dataBuffer.element(instanceIndex)
  
  // Work with local copy
  let result = data.toVar()
  result.mulAssign(2)
  result.addAssign(1)
  
  // Write back once
  data.assign(result)
})
```

### 3. Avoid Divergent Branching

**❌ Bad**: Different threads take different paths

```typescript
If(complexCondition, () => {
  // Expensive operation
  doLotsOfWork()
}).Else(() => {
  // Quick operation
  doQuickThing()
})
```

**✅ Better**: Uniform execution when possible

```typescript
// Calculate for all threads
const result = calculateResult()

// Apply conditionally
const factor = cond(condition, 1.0, 0.0)
output.assign(result.mul(factor))
```

### 4. Batch Compute Calls

```typescript
// Update loop
function update() {
  // ❌ Bad: Multiple compute calls per frame
  renderer.compute(compute1)
  renderer.compute(compute2)
  renderer.compute(compute3)
  
  // ✅ Better: Combine into single compute when possible
  renderer.compute(combinedCompute)
}
```

---

## Debugging Compute Shaders

### 1. Output to Storage Texture

```typescript
// Visualize compute output
const debugTexture = new StorageTexture(width, height)

const computeFn = tslFn(() => {
  const value = calculation()
  
  // Output debug visualization
  const color = vec4(vec3(value), 1)
  textureStore(debugTexture, fragCoord, color)
})

// Display in scene
debugMesh.material.map = debugTexture
```

### 2. Buffer Readback (Slow, for debugging only)

```typescript
// Read back buffer to CPU (async)
const data = await renderer.backend.getArrayBufferAsync(dataBuffer.buffer)
console.log('Buffer contents:', new Float32Array(data))
```

### 3. Limit Thread Count

```typescript
// Debug with fewer threads
const debugCount = 10  // Instead of 10000
const compute = computeFn().compute(debugCount)
```

---

## Resources

- [WebGPU Compute Fundamentals](https://webgpufundamentals.org/webgpu/lessons/webgpu-compute-shaders.html)
- [Maxime Heckel's Field Guide to TSL and WebGPU](https://blog.maximeheckel.com/posts/field-guide-to-tsl-and-webgpu/)[^1]
- [Three.js WebGPU Examples](https://threejs.org/examples/?q=webgpu)

---

[^1]: [Field Guide to TSL and WebGPU - Maxime Heckel](https://blog.maximeheckel.com/posts/field-guide-to-tsl-and-webgpu/)

**Next**: [Post-Processing](./06-Post-Processing.md)

