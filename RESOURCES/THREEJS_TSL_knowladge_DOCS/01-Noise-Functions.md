# Noise Functions in TSL

## Overview

Noise functions are fundamental to procedural generation, creating natural-looking randomness for textures, terrain, particles, and effects. This guide covers all noise implementations found across the analyzed projects.

---

## Table of Contents

1. [Simplex Noise (3D & 4D)](#simplex-noise)
2. [Perlin Noise](#perlin-noise)
3. [Curl Noise (3D & 4D)](#curl-noise)
4. [FBM (Fractal Brownian Motion)](#fbm)
5. [Turbulence](#turbulence)
6. [MaterialX Noise (mx_noise)](#materialx-noise)
7. [Usage Examples](#usage-examples)

---

## Simplex Noise

### 3D Simplex Noise

**Purpose**: Fast, GPU-friendly noise with better visual properties than Perlin noise.

```typescript
// tsl/noise/simplex_noise_3d.ts
import { 
  vec4, mod, Fn, mul, sub, vec3, vec2, dot, 
  floor, step, min, max, float, abs 
} from 'three/tsl'
import { permute, taylorInvSqrt } from './common'

/**
 * 3D simplex noise function.
 * @param {vec3} v - Input 3D vector.
 * @returns {float} Noise value.
 */
export const simplexNoise3d = Fn(([v_immutable]) => {
  const v = vec3(v_immutable).toVar()
  const C = vec2(1.0 / 6.0, 1.0 / 3.0)
  const D = vec4(0.0, 0.5, 1.0, 2.0)
  
  const i = vec3(floor(v.add(dot(v, C.yyy)))).toVar()
  const x0 = vec3(v.sub(i).add(dot(i, C.xxx))).toVar()
  
  const g = vec3(step(x0.yzx, x0.xyz)).toVar()
  const l = vec3(sub(1.0, g)).toVar()
  const i1 = vec3(min(g.xyz, l.zxy)).toVar()
  const i2 = vec3(max(g.xyz, l.zxy)).toVar()
  
  const x1 = vec3(x0.sub(i1).add(mul(1.0, C.xxx))).toVar()
  const x2 = vec3(x0.sub(i2).add(mul(2.0, C.xxx))).toVar()
  const x3 = vec3(x0.sub(1).add(mul(3.0, C.xxx))).toVar()
  
  i.assign(mod(i, 289.0))
  
  const p = vec4(
    permute(
      permute(permute(i.z.add(vec4(0.0, i1.z, i2.z, 1.0)))
        .add(i.y.add(vec4(0.0, i1.y, i2.y, 1.0))))
        .add(i.x.add(vec4(0.0, i1.x, i2.x, 1.0))),
    ),
  ).toVar()
  
  const n_ = float(1.0 / 7.0).toVar()
  const ns = vec3(n_.mul(D.wyz).sub(D.xzx)).toVar()
  const j = vec4(p.sub(mul(49.0, floor(p.mul(ns.z.mul(ns.z)))))).toVar()
  
  const x_ = vec4(floor(j.mul(ns.z))).toVar()
  const y_ = vec4(floor(j.sub(mul(7.0, x_)))).toVar()
  
  const x = vec4(x_.mul(ns.x).add(ns.yyyy)).toVar()
  const y = vec4(y_.mul(ns.x).add(ns.yyyy)).toVar()
  const h = vec4(sub(1.0, abs(x).sub(abs(y)))).toVar()
  
  const b0 = vec4(x.xy, y.xy).toVar()
  const b1 = vec4(x.zw, y.zw).toVar()
  
  const s0 = vec4(floor(b0).mul(2.0).add(1.0)).toVar()
  const s1 = vec4(floor(b1).mul(2.0).add(1.0)).toVar()
  const sh = vec4(step(h, vec4(0.0)).negate()).toVar()
  
  const a0 = vec4(b0.xzyw.add(s0.xzyw.mul(sh.xxyy))).toVar()
  const a1 = vec4(b1.xzyw.add(s1.xzyw.mul(sh.zzww))).toVar()
  
  const p0 = vec3(a0.xy, h.x).toVar()
  const p1 = vec3(a0.zw, h.y).toVar()
  const p2 = vec3(a1.xy, h.z).toVar()
  const p3 = vec3(a1.zw, h.w).toVar()
  
  const norm = vec4(
    taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)))
  ).toVar()
  
  p0.mulAssign(norm.x)
  p1.mulAssign(norm.y)
  p2.mulAssign(norm.z)
  p3.mulAssign(norm.w)
  
  const m = vec4(
    max(sub(0.6, vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3))), 0.0)
  ).toVar()
  
  m.assign(m.mul(m))
  
  return mul(42.0, dot(m.mul(m), vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3))))
})
```

### 4D Simplex Noise

```typescript
// tsl/noise/simplex_noise_4d.ts
import { Fn, vec4, vec3, float } from 'three/tsl'

/**
 * 4D simplex noise function.
 * @param {vec4} v - Input 4D vector (xyz + time).
 * @returns {float} Noise value.
 */
export const simplexNoise4d = Fn(([v]) => {
  // Implementation similar to 3D but with 4D coordinates
  // Used for animated noise patterns
  // Full implementation available in source files
})
```

### Common Helper Functions

```typescript
// tsl/noise/common.ts
import { Fn, mod, floor } from 'three/tsl'

/**
 * Permutation function for noise generation
 */
export const permute = Fn(([x]) => {
  return mod(x.mul(34.0).add(1.0).mul(x), 289.0)
})

/**
 * Taylor inverse square root approximation
 */
export const taylorInvSqrt = Fn(([r]) => {
  return float(1.79284291400159).sub(r.mul(0.85373472095314))
})
```

---

## Curl Noise

Curl noise creates divergence-free vector fields, perfect for fluid-like motion and particle systems.

### 3D Curl Noise

```typescript
// tsl/noise/curl_noise_3d.ts
import { EPSILON, cross, Fn, vec3 } from 'three/tsl'
import { simplexNoise3d } from './simplex_noise_3d'

/**
 * 3D curl noise function using simplex noise.
 * @param {vec3} inputA - Input 3D vector.
 * @returns {vec3} Curl noise vector.
 */
export const curlNoise3d = Fn(([inputA]) => {
  // Calculate gradient in X direction
  const aXPos = simplexNoise3d(inputA.add(vec3(EPSILON, 0, 0)))
  const aXNeg = simplexNoise3d(inputA.sub(vec3(EPSILON, 0, 0)))
  const aXAverage = aXPos.sub(aXNeg).div(EPSILON.mul(2))

  // Calculate gradient in Y direction
  const aYPos = simplexNoise3d(inputA.add(vec3(0, EPSILON, 0)))
  const aYNeg = simplexNoise3d(inputA.sub(vec3(0, EPSILON, 0)))
  const aYAverage = aYPos.sub(aYNeg).div(EPSILON.mul(2))

  // Calculate gradient in Z direction
  const aZPos = simplexNoise3d(inputA.add(vec3(0, 0, EPSILON)))
  const aZNeg = simplexNoise3d(inputA.sub(vec3(0, 0, EPSILON)))
  const aZAverage = aZPos.sub(aZNeg).div(EPSILON.mul(2))

  const aGrabNoise = vec3(aXAverage, aYAverage, aZAverage).normalize()

  // Offset for second noise read
  const inputB = inputA.add(3.5)

  // Repeat for second gradient
  const bXPos = simplexNoise3d(inputB.add(vec3(EPSILON, 0, 0)))
  const bXNeg = simplexNoise3d(inputB.sub(vec3(EPSILON, 0, 0)))
  const bXAverage = bXPos.sub(bXNeg).div(EPSILON.mul(2))

  const bYPos = simplexNoise3d(inputB.add(vec3(0, EPSILON, 0)))
  const bYNeg = simplexNoise3d(inputB.sub(vec3(0, EPSILON, 0)))
  const bYAverage = bYPos.sub(bYNeg).div(EPSILON.mul(2))

  const bZPos = simplexNoise3d(inputB.add(vec3(0, 0, EPSILON)))
  const bZNeg = simplexNoise3d(inputB.sub(vec3(0, 0, EPSILON)))
  const bZAverage = bZPos.sub(bZNeg).div(EPSILON.mul(2))

  const bGrabNoise = vec3(bXAverage, bYAverage, bZAverage).normalize()

  // Return cross product for divergence-free field
  return cross(aGrabNoise, bGrabNoise).normalize()
})
```

### 4D Curl Noise

```typescript
// tsl/noise/curl_noise_4d.ts
import { Fn, vec3, vec4 } from 'three/tsl'
import { simplexNoise4d } from './simplex_noise_4d'

/**
 * 4D curl noise (xyz + time).
 * @param {vec4} p - Input 4D vector.
 * @returns {vec3} Curl noise vector.
 */
export const curlNoise4d = Fn(([p]) => {
  const EPSILON = 0.001
  
  // Sample noise at offset positions
  const dx = simplexNoise4d(p.add(vec4(EPSILON, 0, 0, 0)))
    .sub(simplexNoise4d(p.sub(vec4(EPSILON, 0, 0, 0))))
  const dy = simplexNoise4d(p.add(vec4(0, EPSILON, 0, 0)))
    .sub(simplexNoise4d(p.sub(vec4(0, EPSILON, 0, 0))))
  const dz = simplexNoise4d(p.add(vec4(0, 0, EPSILON, 0)))
    .sub(simplexNoise4d(p.sub(vec4(0, 0, EPSILON, 0))))
  
  return vec3(dy.sub(dz), dz.sub(dx), dx.sub(dy)).normalize()
})
```

---

## FBM (Fractal Brownian Motion)

FBM creates detailed, natural-looking noise by layering multiple octaves of noise.

```typescript
// tsl/noise/fbm.ts
import { Fn, float, Loop } from 'three/tsl'
import { simplexNoise3d } from './simplex_noise_3d'

/**
 * Fractal Brownian Motion using simplex noise.
 * @param {vec3} position - Input position.
 * @param {float} octaves - Number of noise layers (default: 4).
 * @param {float} lacunarity - Frequency multiplier (default: 2.0).
 * @param {float} gain - Amplitude multiplier (default: 0.5).
 * @returns {float} FBM noise value.
 */
export const fbm = Fn(([position, octaves = float(4), lacunarity = float(2.0), gain = float(0.5)]) => {
  let value = float(0).toVar()
  let amplitude = float(1).toVar()
  let frequency = float(1).toVar()
  
  Loop({ start: 0, end: octaves }, () => {
    value.addAssign(amplitude.mul(simplexNoise3d(position.mul(frequency))))
    frequency.mulAssign(lacunarity)
    amplitude.mulAssign(gain)
  })
  
  return value
})
```

---

## Turbulence

Turbulence uses absolute values of noise for sharp, irregular patterns.

```typescript
// tsl/noise/turbulence.ts
import { Fn, float, abs, Loop } from 'three/tsl'
import { simplexNoise3d } from './simplex_noise_3d'

/**
 * Turbulence noise using absolute values.
 * @param {vec3} position - Input position.
 * @param {float} octaves - Number of octaves.
 * @returns {float} Turbulence value.
 */
export const turbulence = Fn(([position, octaves = float(4)]) => {
  let value = float(0).toVar()
  let amplitude = float(1).toVar()
  let frequency = float(1).toVar()
  
  Loop({ start: 0, end: octaves }, () => {
    value.addAssign(
      amplitude.mul(abs(simplexNoise3d(position.mul(frequency))))
    )
    frequency.mulAssign(2)
    amplitude.mulAssign(0.5)
  })
  
  return value
})
```

---

## MaterialX Noise

Three.js includes built-in MaterialX noise functions:

```typescript
import { mx_noise_float, mx_noise_vec3 } from 'three/tsl'

// Float noise
const noiseValue = mx_noise_float(
  position.mul(frequency),  // Position
  1,                         // Amplitude
  0                          // Pivot (offset)
)

// Vector noise
const noiseVector = mx_noise_vec3(
  position.mul(frequency),
  1,
  0
)
```

---

## Usage Examples

### Example 1: Animated Terrain

```typescript
import { Fn, positionLocal, timerLocal, vec3 } from 'three/tsl'
import { fbm } from './noise/fbm'

const terrainShader = Fn(() => {
  const time = timerLocal()
  const pos = positionLocal
  
  // Add time to create animation
  const noiseInput = vec3(pos.xz, time.mul(0.1))
  const elevation = fbm(noiseInput, 5, 2.0, 0.5)
  
  // Apply elevation
  return pos.add(vec3(0, elevation.mul(2), 0))
})
```

### Example 2: Particle Turbulence

```typescript
import { Fn, vec4, timerGlobal } from 'three/tsl'
import { curlNoise4d } from './noise/curl_noise_4d'

const particleForce = Fn(([position]) => {
  const time = timerGlobal()
  const noiseInput = vec4(
    position.mul(0.5),  // Spatial frequency
    time.mul(0.1)       // Time frequency
  )
  
  const force = curlNoise4d(noiseInput)
  return force.mul(0.01)  // Force strength
})
```

### Example 3: Procedural Texture

```typescript
import { Fn, uv, vec3 } from 'three/tsl'
import { simplexNoise3d } from './noise/simplex_noise_3d'

const textureShader = Fn(() => {
  const _uv = uv()
  
  // Multiple layers of noise
  const noise1 = simplexNoise3d(vec3(_uv.mul(5), 0))
  const noise2 = simplexNoise3d(vec3(_uv.mul(10), 100))
  const noise3 = simplexNoise3d(vec3(_uv.mul(20), 200))
  
  // Combine layers
  const finalNoise = noise1.mul(0.5)
    .add(noise2.mul(0.3))
    .add(noise3.mul(0.2))
  
  return vec3(finalNoise)
})
```

### Example 4: Warped Domain

```typescript
import { Fn, positionLocal } from 'three/tsl'
import { simplexNoise3d } from './noise/simplex_noise_3d'

const warpedNoise = Fn(([position]) => {
  // Create warped coordinates
  const warp = vec3(
    simplexNoise3d(position.mul(0.5)),
    simplexNoise3d(position.mul(0.5).add(vec3(100, 0, 0))),
    simplexNoise3d(position.mul(0.5).add(vec3(0, 100, 0)))
  )
  
  // Apply warp and sample noise again
  const warpedPos = position.add(warp.mul(0.5))
  return simplexNoise3d(warpedPos)
})
```

---

## Performance Tips

1. **Reduce Octaves**: Start with 3-4 octaves, only increase if needed
2. **Adjust Frequency**: Lower frequency = fewer calculations
3. **Use 3D when possible**: 4D is slower, use only for animation
4. **Cache Results**: Store noise values in textures when possible
5. **LOD**: Use simpler noise at distance

---

## Common Patterns

### Pattern 1: Time-animated Noise

```typescript
const time = timerLocal()
const animatedNoise = simplexNoise3d(
  vec3(position.xy, time.mul(speed))
)
```

### Pattern 2: Multi-octave with Scale

```typescript
let detail = float(0).toVar()
let scale = float(1).toVar()

Loop({ start: 0, end: 5 }, () => {
  detail.addAssign(
    simplexNoise3d(position.mul(scale)).div(scale)
  )
  scale.mulAssign(2)
})
```

### Pattern 3: Ridged Noise

```typescript
const ridged = abs(simplexNoise3d(position))
  .mul(-1)
  .add(1)
  .pow(2)
```

---

## Reference Summary

| Function | Dimensions | Use Case | Speed |
|----------|-----------|----------|-------|
| `simplexNoise3d` | 3D | General purpose | Fast |
| `simplexNoise4d` | 4D | Animated | Medium |
| `curlNoise3d` | 3D → vec3 | Particle flow | Medium |
| `curlNoise4d` | 4D → vec3 | Animated flow | Slow |
| `fbm` | 3D | Detailed terrain | Slow |
| `turbulence` | 3D | Sharp details | Slow |
| `mx_noise_float` | 3D | Built-in option | Fast |

---

**Next**: [Procedural Patterns](./02-Procedural-Patterns.md)

