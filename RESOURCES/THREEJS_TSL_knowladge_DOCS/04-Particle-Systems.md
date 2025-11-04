# Particle Systems in TSL & WebGPU

## Overview

This guide covers particle system implementations from GPU-accelerated compute shaders to traditional instanced rendering. All examples are based on production-ready code from analyzed projects.

---

## Table of Contents

1. [Compute-Based Particles](#compute-based-particles)
2. [Storage Buffers](#storage-buffers)
3. [Particle Material Setup](#particle-material-setup)
4. [Advanced Particle Techniques](#advanced-particle-techniques)
5. [Complete Examples](#complete-examples)

---

## Compute-Based Particles

### Basic Architecture

Compute shaders run on the GPU to update particle positions, velocities, and other properties in parallel.

```typescript
import { 
  storage, instanceIndex, tslFn, uniform,
  vec3, vec4, timerDelta, timerGlobal
} from 'three/tsl'
import { StorageInstancedBufferAttribute } from 'three/webgpu'

class ParticleSystem {
  constructor(renderer, count = 10000) {
    this.renderer = renderer
    this.count = count
    
    // Create storage buffers
    this.setupBuffers()
    
    // Create compute shaders
    this.setupCompute()
    
    // Create material and mesh
    this.setupRendering()
  }
  
  setupBuffers() {
    // Position buffer (vec3)
    this.positionBuffer = storage(
      new StorageInstancedBufferAttribute(this.count, 3),
      'vec3',
      this.count
    )
    
    // Velocity buffer (vec3)
    this.velocityBuffer = storage(
      new StorageInstancedBufferAttribute(this.count, 3),
      'vec3',
      this.count
    )
    
    // Life buffer (float)
    this.lifeBuffer = storage(
      new StorageInstancedBufferAttribute(this.count, 1),
      'float',
      this.count
    )
  }
}
```

---

## Storage Buffers

### Buffer Types

```typescript
// vec3 buffer (3 floats per particle)
const positionBuffer = storage(
  new StorageInstancedBufferAttribute(count, 3),
  'vec3',
  count
)

// vec4 buffer (4 floats per particle)
const colorBuffer = storage(
  new StorageInstancedBufferAttribute(count, 4),
  'vec4',
  count
)

// float buffer (1 float per particle)
const lifeBuffer = storage(
  new StorageInstancedBufferAttribute(count, 1),
  'float',
  count
)
```

### Accessing Storage Elements

```typescript
// Inside compute shader
const particleUpdate = tslFn(() => {
  // Get current particle's data
  const position = positionBuffer.element(instanceIndex)
  const velocity = velocityBuffer.element(instanceIndex)
  const life = lifeBuffer.element(instanceIndex)
  
  // Modify data
  position.addAssign(velocity.mul(deltaTime))
  life.addAssign(deltaTime.mul(0.1))
})
```

---

## Particle Material Setup

### Sprite Material (Billboard Particles)

```typescript
import { SpriteNodeMaterial } from 'three/webgpu'
import { THREE } from 'three'

const material = new SpriteNodeMaterial({
  transparent: true,
  blending: THREE.AdditiveBlending,
  depthWrite: false
})

// Color and alpha
material.colorNode = tslFn(() => {
  const dist = uv().sub(0.5).length()
  const alpha = float(0.05).div(dist)
  return vec4(vec3(1, 0.5, 0.2), alpha)
})()

// Scale based on life
material.scaleNode = life.smoothstep(0, 0.1).mul(particleSize)

// Position from buffer
material.positionNode = positionBuffer.toAttribute()
```

### Points Material

```typescript
import { PointsNodeMaterial } from 'three/webgpu'

const material = new PointsNodeMaterial({
  transparent: true,
  blending: THREE.AdditiveBlending
})

// Use buffers as attributes
material.positionNode = positionBuffer.toAttribute()
material.colorNode = colorBuffer.toAttribute()
```

---

## Complete Particle System Example

### Full Implementation

```typescript
import {
  If, min, SpriteNodeMaterial, color, range, sin, 
  instanceIndex, timerDelta, step, timerGlobal, 
  tslFn, uniform, uv, vec3, vec4, mix, max, 
  uint, cond, varying, storage
} from 'three/tsl'
import { StorageInstancedBufferAttribute } from 'three/webgpu'
import { curlNoise4d } from './tsl/curlNoise4d'
import * as THREE from 'three'

export default class ParticleSystem {
  initialized = false
  
  constructor(renderer, count = 10000) {
    this.renderer = renderer
    this.emitterPosition = new THREE.Vector3()
    this.count = count
    
    // Uniforms
    this.uniforms = {
      colorIn: uniform(color('#ff7300')),
      colorOut: uniform(color('#006eff')),
      emitterPosition: uniform(vec3()),
      emitterPreviousPosition: uniform(vec3()),
      emitterVelocity: uniform(vec3()),
      emitterRadius: uniform(0.01),
      emitterVelocityStrength: uniform(0.4),
      initialVelocity: uniform(vec3(0, 0, 0)),
      initialRandomVelocity: uniform(0),
      velocityDamping: uniform(0.01),
      turbulenceStrength: uniform(0.01),
      turbulenceTimeFrequency: uniform(0.1),
      turbulencePositionFrequency: uniform(3),
      decayFrequency: uniform(0.2),
      gravity: uniform(vec3(0, -0.5, 0)),
      floorY: uniform(-0.95),
      floorDamping: uniform(0.1),
      size: uniform(0.075),
      solidRatio: uniform(0.05),
      solidAlpha: uniform(5),
      glowSpread: uniform(0.02),
      fadeIn: uniform(0.2),
      fadeOut: uniform(0.2),
      opacity: uniform(1),
      sparklingAlpha: uniform(4),
      sparklingFrequency: uniform(1),
      sparklingDuration: uniform(0.01)
    }
    
    this.initialize()
  }
  
  initialize() {
    // Material
    this.material = new SpriteNodeMaterial({
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    })
    
    // Storage Buffers
    this.positionBuffer = storage(
      new StorageInstancedBufferAttribute(this.count, 3),
      'vec3',
      this.count
    )
    this.velocityBuffer = storage(
      new StorageInstancedBufferAttribute(this.count, 3),
      'vec3',
      this.count
    )
    this.lifeBuffer = storage(
      new StorageInstancedBufferAttribute(this.count, 1),
      'float',
      this.count
    )
    
    // Varyings
    const sparkling = varying(0)
    
    // Compute Init
    const particlesInit = tslFn(() => {
      // Initialize position far away
      const position = this.positionBuffer.element(instanceIndex)
      position.assign(vec3(99999))
      
      // Initialize life with random offset
      const life = this.lifeBuffer.element(instanceIndex)
      life.assign(instanceIndex.hash())
    })
    
    this.particlesInitCompute = particlesInit().compute(this.count)
    this.renderer.compute(this.particlesInitCompute)
    
    // Compute Update
    const particlesUpdate = tslFn(() => {
      const position = this.positionBuffer.element(instanceIndex)
      const velocity = this.velocityBuffer.element(instanceIndex)
      const life = this.lifeBuffer.element(instanceIndex)
      
      const delta = timerDelta()
      const time = timerGlobal()
      
      // Turbulence
      const turbulenceInput = position
        .mul(this.uniforms.turbulencePositionFrequency)
        .add(12.34)
      const turbulence = curlNoise4d(
        vec4(turbulenceInput, time.mul(this.uniforms.turbulenceTimeFrequency))
      ).mul(this.uniforms.turbulenceStrength)
      
      // Update velocity
      velocity.addAssign(turbulence)
      velocity.addAssign(this.uniforms.gravity.mul(delta))
      velocity.mulAssign(this.uniforms.velocityDamping.oneMinus())
      
      // Update position
      position.addAssign(velocity.mul(delta))
      
      // Floor bounce
      If(position.y.lessThan(this.uniforms.floorY), () => {
        position.y.assign(this.uniforms.floorY)
        velocity.y.mulAssign(
          this.uniforms.floorDamping.oneMinus().negate()
        )
      })
      
      // Life
      const newLife = life.add(delta.mul(this.uniforms.decayFrequency))
      
      // Reset particle
      If(newLife.greaterThan(1), () => {
        // Random direction
        const randomDirection = vec3(
          instanceIndex.add(uint(Math.random() * 0xffffff)).hash().sub(0.5),
          instanceIndex.add(uint(Math.random() * 0xffffff)).hash().sub(0.5),
          instanceIndex.add(uint(Math.random() * 0xffffff)).hash().sub(0.5)
        ).normalize()
        
        const mixStrength = instanceIndex
          .add(uint(Math.random() * 0xffffff))
          .hash()
        
        // New position at emitter
        const newPosition = mix(
          this.uniforms.emitterPosition,
          this.uniforms.emitterPreviousPosition,
          mixStrength
        )
        newPosition.addAssign(
          randomDirection.mul(this.uniforms.emitterRadius)
        )
        position.assign(newPosition)
        
        // New velocity
        const newVelocity = mix(
          this.uniforms.emitterVelocity,
          this.uniforms.emitterPreviousVelocity,
          mixStrength
        )
        velocity.assign(
          newVelocity
            .mul(this.uniforms.emitterVelocityStrength)
            .add(randomDirection.mul(this.uniforms.initialRandomVelocity))
            .add(this.uniforms.initialVelocity)
        )
      })
      
      life.assign(newLife.mod(1))
    })
    
    this.particlesUpdateCompute = particlesUpdate().compute(this.count)
    
    // Scale Node
    const life = this.lifeBuffer.toAttribute()
    const scaleIn = life.remap(0, this.uniforms.fadeIn, 0, 1)
    const scaleOut = life.remap(
      this.uniforms.fadeOut.oneMinus(),
      1,
      1,
      0
    )
    const scaleFinal = min(scaleIn, scaleOut)
      .smoothstep(0, 1)
      .mul(this.uniforms.size)
      .mul(range(0, 1))
    
    this.material.scaleNode = scaleFinal
    
    // Position Node
    this.material.positionNode = tslFn(() => {
      const sparklingTime = instanceIndex
        .add(uint(Math.random() * 0xffffff))
        .hash()
      
      const sparklingLife = life
        .mul(this.uniforms.sparklingFrequency)
        .mod(1)
      
      sparkling.assign(
        cond(
          sparklingLife.lessThan(sparklingTime)
            .and(sparklingLife.greaterThan(
              sparklingTime.sub(
                this.uniforms.sparklingDuration
                  .mul(this.uniforms.sparklingFrequency)
              )
            )),
          1,
          0
        )
      )
      
      return this.positionBuffer.toAttribute()
    })()
    
    // Color Node
    this.material.colorNode = tslFn(() => {
      const distanceToCenter = uv().sub(0.5).length()
      
      // Solid core
      const alphaSolid = step(
        this.uniforms.solidRatio.div(2),
        distanceToCenter
      )
        .oneMinus()
        .mul(this.uniforms.solidAlpha)
      
      // Glow
      const alphaGlow = this.uniforms.glowSpread
        .div(distanceToCenter)
        .sub(this.uniforms.glowSpread.mul(2))
      alphaGlow.mulAssign(alphaSolid.oneMinus())
      
      // Final alpha
      const alphaFinal = max(alphaGlow, alphaSolid)
        .mul(this.uniforms.opacity)
      
      // Sparkling effect
      alphaFinal.mulAssign(
        sparkling.mul(this.uniforms.sparklingAlpha).add(1)
      )
      
      // Color gradient based on life
      const finalColor = mix(
        this.uniforms.colorIn,
        this.uniforms.colorOut,
        life
      )
      
      return vec4(finalColor, alphaFinal)
    })()
    
    // Mesh
    this.geometry = new THREE.PlaneGeometry(1, 1)
    this.mesh = new THREE.InstancedMesh(
      this.geometry,
      this.material,
      this.count
    )
    
    this.initialized = true
  }
  
  update(deltaTime) {
    // Update velocity
    const velocity = this.emitterPosition
      .clone()
      .sub(this.uniforms.emitterPreviousPosition.value)
      .divideScalar(deltaTime)
    
    this.uniforms.emitterVelocity.value.copy(velocity)
    
    // Update position
    this.uniforms.emitterPosition.value.copy(this.emitterPosition)
    
    // Run compute shader
    this.renderer.compute(this.particlesUpdateCompute)
    
    // Update previous values
    this.uniforms.emitterPreviousPosition.value.copy(
      this.uniforms.emitterPosition.value
    )
    this.uniforms.emitterPreviousVelocity.value.copy(
      this.uniforms.emitterVelocity.value
    )
  }
  
  dispose() {
    this.geometry.dispose()
    this.positionBuffer.dispose()
    this.velocityBuffer.dispose()
    this.lifeBuffer.dispose()
    this.particlesInitCompute.dispose()
    this.particlesUpdateCompute.dispose()
    this.mesh.removeFromParent()
  }
}
```

---

## Advanced Particle Techniques

### 1. Attraction/Repulsion

```typescript
const attractionForce = tslFn(() => {
  const position = positionBuffer.element(instanceIndex)
  const velocity = velocityBuffer.element(instanceIndex)
  
  // Direction to attractor
  const toAttractor = attractorPosition.sub(position)
  const distance = length(toAttractor)
  
  // Smooth falloff
  const strength = smoothstep(attractionRadius1, attractionRadius2, distance)
  
  // Apply force
  velocity.addAssign(
    toAttractor.normalize().mul(strength).mul(attractionStrength)
  )
})
```

### 2. Velocity Limiting

```typescript
// Clamp velocity magnitude
velocity.assign(
  clamp(velocity, maxVelocity.negate(), maxVelocity)
)

// Or normalize and scale
const speed = length(velocity)
If(speed.greaterThan(maxSpeed), () => {
  velocity.assign(velocity.normalize().mul(maxSpeed))
})
```

### 3. Particle Recycling

```typescript
// When life exceeds 1, reset particle
If(life.greaterThan(1), () => {
  // Reset to emitter
  position.assign(emitterPosition.add(randomOffset))
  velocity.assign(initialVelocity)
  life.assign(0)
})
```

### 4. Multi-Color Gradient

```typescript
const particleColor = tslFn(() => {
  const life = lifeBuffer.toAttribute()
  
  // Multi-stop gradient
  let color = vec3(1, 0, 0).toVar()  // Red at birth
  
  // Transition to yellow
  If(life.greaterThan(0.3), () => {
    color.assign(mix(
      vec3(1, 0, 0),
      vec3(1, 1, 0),
      life.remap(0.3, 0.5, 0, 1)
    ))
  })
  
  // Transition to white
  If(life.greaterThan(0.5), () => {
    color.assign(mix(
      vec3(1, 1, 0),
      vec3(1, 1, 1),
      life.remap(0.5, 1, 0, 1)
    ))
  })
  
  return color
})
```

### 5. Sprite Sheet Animation

```typescript
const animatedTexture = tslFn(() => {
  const life = lifeBuffer.toAttribute()
  
  // Calculate frame
  const totalFrames = 16
  const frame = floor(life.mul(totalFrames))
  
  // Grid position
  const cols = 4
  const rows = 4
  const col = frame.mod(cols)
  const row = floor(frame.div(cols))
  
  // Offset UVs
  const uvScale = vec2(1.0 / cols, 1.0 / rows)
  const uvOffset = vec2(col, row).mul(uvScale)
  const animatedUV = uv().mul(uvScale).add(uvOffset)
  
  return texture(spriteSheet, animatedUV)
})
```

---

## Fireworks Example

```typescript
const createFirework = () => {
  const material = new SpriteNodeMaterial({
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  })
  
  const count = 400
  const duration = 4
  
  // Buffers
  const positionBuffer = storage(
    new StorageInstancedBufferAttribute(count, 3),
    'vec3',
    count
  )
  const velocityBuffer = storage(
    new StorageInstancedBufferAttribute(count, 3),
    'vec3',
    count
  )
  const damperBuffer = storage(
    new StorageInstancedBufferAttribute(count, 1),
    'float',
    count
  )
  
  // Init compute
  const particlesInit = tslFn(() => {
    // Random explosion velocity
    const velocity = velocityBuffer.element(instanceIndex)
    velocity.assign(
      vec3(
        instanceIndex.hash(),
        instanceIndex.add(uint(Math.random() * 0xffffff)).hash(),
        instanceIndex.add(uint(Math.random() * 0xffffff)).hash()
      )
        .sub(0.5)
        .mul(20)
    )
    
    // Random damping
    const damper = damperBuffer.element(instanceIndex)
    damper.assign(
      instanceIndex
        .add(uint(Math.random() * 0xffffff))
        .hash()
        .remap(0, 1, 0.05, 0.2)
    )
  })
  
  // Update compute
  const particlesUpdate = tslFn(() => {
    const position = positionBuffer.element(instanceIndex)
    const velocity = velocityBuffer.element(instanceIndex)
    const damper = damperBuffer.element(instanceIndex)
    
    const gravity = vec3(0, -0.015, 0)
    
    // Physics
    velocity.addAssign(gravity)
    velocity.mulAssign(damper.oneMinus())
    position.addAssign(velocity.mul(timerDelta()))
  })
  
  return {
    particlesInitCompute: particlesInit().compute(count),
    particlesUpdateCompute: particlesUpdate().compute(count),
    material,
    mesh: new THREE.InstancedMesh(geometry, material, count)
  }
}
```

---

## Performance Optimization

### 1. Particle Count

```typescript
// Start conservative
const count = 5000

// Increase based on performance
if (fps > 50) {
  count = 10000
}
```

### 2. Update Frequency

```typescript
// Update every N frames
if (frame % 2 === 0) {
  renderer.compute(particlesUpdateCompute)
}
```

### 3. Distance Culling

```typescript
const shouldUpdate = tslFn(() => {
  const position = positionBuffer.element(instanceIndex)
  const distanceToCamera = length(cameraPosition.sub(position))
  
  // Only update close particles
  return cond(
    distanceToCamera.lessThan(updateRadius),
    1,
    0
  )
})
```

### 4. LOD Particles

```typescript
// Fewer particles at distance
const lodCount = distance > 10 ? count * 0.5 : count
```

---

## Common Patterns

### Pattern 1: Emitter Following Object

```typescript
// In your update loop
particleSystem.emitterPosition.copy(mesh.position)
particleSystem.update(deltaTime)
```

### Pattern 2: Burst Emission

```typescript
const burst = () => {
  // Reset all particles at once
  const resetCompute = tslFn(() => {
    const life = lifeBuffer.element(instanceIndex)
    life.assign(0)  // Trigger all resets
  })
  
  renderer.compute(resetCompute().compute(count))
}
```

### Pattern 3: Particle Trails

```typescript
// Use previous positions
const trailPositionBuffer = storage(
  new StorageInstancedBufferAttribute(count * trailLength, 3),
  'vec3',
  count * trailLength
)

// Each particle has multiple trail points
const trailIndex = instanceIndex.mul(trailLength).add(trailOffset)
```

---

## Debugging Tips

1. **Visualize Velocities**: Draw velocity as color
2. **Slow Motion**: Multiply delta time by 0.1
3. **Single Particle**: Set count to 1
4. **Position Markers**: Add debug spheres at key positions

---

**Next**: [Compute Shaders](./05-Compute-Shaders.md)

