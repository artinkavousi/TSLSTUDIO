# Utility Functions Library

## Overview

Essential utility functions for TSL development, covering colors, coordinates, math, lighting, and common shader patterns.

---

## Table of Contents

1. [Color Utilities](#color-utilities)
2. [Coordinate Systems](#coordinate-systems)
3. [Math Utilities](#math-utilities)
4. [UV Transformations](#uv-transformations)
5. [Lighting Helpers](#lighting-helpers)

---

## Color Utilities

### Cosine Palette

Generate smooth color gradients using cosine functions.

```typescript
// tsl/utils/color/cosine_palette.ts
import { Fn, float, cos, PI } from 'three/tsl'

/**
 * Generates palette using cosine-based function
 * @param {float} t - Time/position (0-1)
 * @param {vec3} a - Base offset
 * @param {vec3} b - Amplitude
 * @param {vec3} c - Frequency
 * @param {vec3} d - Phase
 * @param {vec3} e - Cosine scalar (default: 2π)
 * @returns {vec3} RGB color
 */
export const cosinePalette = Fn(([t, a, b, c, d, e = float(6.28318)]) => {
  return a.add(b.mul(cos(e.mul(c.mul(t).add(d)))))
})

// Usage examples
const shader = Fn(() => {
  const t = uv().x  // Use X coordinate
  
  // Warm sunset palette
  const sunset = cosinePalette(
    t,
    vec3(0.5, 0.5, 0.5),   // Base
    vec3(0.5, 0.5, 0.5),   // Amplitude
    vec3(1.0, 1.0, 0.5),   // Frequency
    vec3(0.8, 0.9, 0.3)    // Phase
  )
  
  // Cool blue palette
  const ocean = cosinePalette(
    t,
    vec3(0.5, 0.5, 0.5),
    vec3(0.5, 0.5, 0.5),
    vec3(2.0, 1.0, 0.0),
    vec3(0.5, 0.2, 0.25)
  )
  
  return sunset
})
```

### Popular Palette Presets

```typescript
export const palettes = {
  sunset: {
    a: vec3(0.5, 0.5, 0.5),
    b: vec3(0.5, 0.5, 0.5),
    c: vec3(2.0, 1.0, 0.0),
    d: vec3(0.5, 0.2, 0.25)
  },
  rainbow: {
    a: vec3(0.5, 0.5, 0.5),
    b: vec3(0.5, 0.5, 0.5),
    c: vec3(1.0, 1.0, 1.0),
    d: vec3(0.0, 0.333, 0.667)
  },
  neon: {
    a: vec3(0.5, 0.5, 0.5),
    b: vec3(0.5, 0.5, 0.5),
    c: vec3(1.0, 0.7, 0.4),
    d: vec3(0.0, 0.15, 0.20)
  }
}
```

### RGB/HSV Conversion

```typescript
/**
 * Convert RGB to HSV
 * @param {vec3} rgb - RGB color (0-1)
 * @returns {vec3} HSV color (H: 0-1, S: 0-1, V: 0-1)
 */
export const rgbToHsv = Fn(([rgb]) => {
  const K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0)
  const p = mix(vec4(rgb.bg, K.wz), vec4(rgb.gb, K.xy), step(rgb.b, rgb.g))
  const q = mix(vec4(p.xyw, rgb.r), vec4(rgb.r, p.yzx), step(p.x, rgb.r))
  
  const d = q.x.sub(min(q.w, q.y))
  const e = 1.0e-10
  return vec3(
    abs(q.z.add(q.w.sub(q.y).div(d.mul(6.0).add(e)))),
    d.div(q.x.add(e)),
    q.x
  )
})

/**
 * Convert HSV to RGB
 * @param {vec3} hsv - HSV color
 * @returns {vec3} RGB color
 */
export const hsvToRgb = Fn(([hsv]) => {
  const K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0)
  const p = abs(fract(hsv.xxx.add(K.xyz)).mul(6.0).sub(K.www))
  return hsv.z.mul(mix(K.xxx, clamp(p.sub(K.xxx), 0.0, 1.0), hsv.y))
})
```

---

## Coordinate Systems

### Cartesian ↔ Polar

```typescript
// tsl/utils/math/coordinates.ts
import { Fn, length, atan, cos, sin, vec2, float } from 'three/tsl'

/**
 * Convert Cartesian to Polar coordinates
 * @param {vec2} p - Cartesian (x, y)
 * @returns {vec2} Polar (radius, angle in radians)
 */
export const cartesianToPolar = Fn(([p]) => {
  const r = length(p)
  const theta = atan(p.y, p.x)
  return vec2(r, theta)
})

/**
 * Convert Polar to Cartesian coordinates
 * @param {vec2} p - Polar (radius, angle)
 * @returns {vec2} Cartesian (x, y)
 */
export const polarToCartesian = Fn(([p]) => {
  const r = float(p.x).toVar()
  const theta = float(p.y).toVar()
  return vec2(r.mul(cos(theta)), r.mul(sin(theta)))
})
```

### Spherical Coordinates

```typescript
/**
 * Random position on sphere surface
 * @param {float} radius - Sphere radius
 * @returns {vec3} Position on sphere
 */
export const positionSphereRand = Fn(({ radius }) => {
  const seed = hash(instanceIndex.add(1))
  const seed2 = hash(instanceIndex.add(2))
  const seed3 = hash(instanceIndex.add(3))
  
  const distanceFactor = seed.pow(1 / 3)
  
  const theta = seed2.mul(PI2)
  const phi = seed3.acos().mul(2).sub(1)
  
  const x = distanceFactor.mul(phi.sin().mul(theta.cos())).mul(radius)
  const y = distanceFactor.mul(phi.sin().mul(theta.sin())).mul(radius)
  const z = distanceFactor.mul(phi.cos()).mul(radius)
  
  return vec3(x, y, z)
})
```

### Bilinear Gradient

```typescript
/**
 * Bilinear gradient between four colors
 * @param {vec2} st - UV coordinates
 * @param {vec3} color1 - Top-left
 * @param {vec3} color2 - Top-right
 * @param {vec3} color3 - Bottom-left
 * @param {vec3} color4 - Bottom-right
 * @returns {vec4} Interpolated color
 */
export const grad = Fn(([st, color1, color2, color3, color4]) => {
  const _uv = vec2(st).toVar()
  const _color0 = vec4(color1, 1.0).toVar()
  const _color1 = vec4(color2, 1.0).toVar()
  const _color2 = vec4(color3, 1.0).toVar()
  const _color3 = vec4(color4, 1.0).toVar()
  
  // Define quad corners
  const P0 = vec2(0.31, 0.3).toVar()
  const P1 = vec2(0.7, 0.32).toVar()
  const P2 = vec2(0.28, 0.71).toVar()
  const P3 = vec2(0.72, 0.75).toVar()
  
  // Bilinear interpolation math
  const Q = vec2(P0.sub(P2)).toVar()
  const R = vec2(P1.sub(P0)).toVar()
  const S = vec2(R.add(P2.sub(P3))).toVar()
  const T = vec2(P0.sub(_uv)).toVar()
  const u = float().toVar()
  const t = float().toVar()
  
  // Solve for u and t
  If(Q.x.equal(0.0).and(S.x.equal(0.0)), () => {
    u.assign(T.x.negate().div(R.x))
    t.assign(T.y.add(u.mul(R.y)).div(Q.y.add(u.mul(S.y))))
  })
  .ElseIf(Q.y.equal(0.0).and(S.y.equal(0.0)), () => {
    u.assign(T.y.negate().div(R.y))
    t.assign(T.x.add(u.mul(R.x)).div(Q.x.add(u.mul(S.x))))
  })
  .Else(() => {
    const A = float(S.x.mul(R.y).sub(R.x.mul(S.y))).toVar()
    const B = float(
      S.x.mul(T.y).sub(T.x.mul(S.y)).add(Q.x.mul(R.y).sub(R.x.mul(Q.y)))
    ).toVar()
    const C = float(Q.x.mul(T.y).sub(T.x.mul(Q.y))).toVar()
    
    If(abs(A).lessThan(0.0001), () => {
      u.assign(C.negate().div(B))
    }).Else(() => {
      u.assign(
        B.negate().add(sqrt(B.mul(B).sub(mul(4.0, A).mul(C)))).div(mul(2.0, A))
      )
    })
    
    t.assign(T.y.add(u.mul(R.y)).div(Q.y.add(u.mul(S.y))))
  })
  
  u.assign(clamp(u, 0.0, 1.0))
  t.assign(clamp(t, 0.0, 1.0))
  t.assign(smoothstep(0.0, 1.0, t))
  u.assign(smoothstep(0.0, 1.0, u))
  
  const colorA = vec4(mix(_color0, _color1, u)).toVar()
  const colorB = vec4(mix(_color2, _color3, u)).toVar()
  
  return mix(colorA, colorB, t)
})
```

---

## Math Utilities

### Complex Numbers

```typescript
// tsl/utils/math/complex.ts
import { Fn, vec2, dot } from 'three/tsl'

/**
 * Complex multiplication
 * @param {vec2} a - Complex number (real, imag)
 * @param {vec2} b - Complex number (real, imag)
 * @returns {vec2} Result
 */
export const complexMul = Fn(([a, b]) => {
  return vec2(
    a.x.mul(b.x).sub(a.y.mul(b.y)),
    a.x.mul(b.y).add(a.y.mul(b.x))
  )
})

/**
 * Complex division
 */
export const complexDiv = Fn(([a, b]) => {
  const denom = dot(b, b)
  return vec2(
    a.x.mul(b.x).add(a.y.mul(b.y)).div(denom),
    a.y.mul(b.x).sub(a.x.mul(b.y)).div(denom)
  )
})

/**
 * Complex power
 */
export const complexPow = Fn(([z, n]) => {
  let result = z.toVar()
  Loop({ start: 1, end: n }, () => {
    result.assign(complexMul(result, z))
  })
  return result
})
```

### Rotation (2D)

```typescript
/**
 * 2D rotation matrix
 * @param {float} angle - Rotation angle in radians
 * @returns {mat2} Rotation matrix
 */
export const rotation2D = Fn(([angle]) => {
  const c = cos(angle)
  const s = sin(angle)
  return mat2(c, s, s.negate(), c)
})

// Usage
const rotated = Fn(() => {
  const _uv = uv().sub(0.5)
  const rotationMatrix = rotation2D(time)
  const rotatedUV = rotationMatrix.mul(_uv)
  return texture(tex, rotatedUV.add(0.5))
})
```

### Rotation (3D)

```typescript
/**
 * Rotation around X axis
 */
export const rotationX = Fn(([angle]) => {
  const c = cos(angle)
  const s = sin(angle)
  return mat3(
    1, 0, 0,
    0, c, s.negate(),
    0, s, c
  )
})

/**
 * Rotation around Y axis
 */
export const rotationY = Fn(([angle]) => {
  const c = cos(angle)
  const s = sin(angle)
  return mat3(
    c, 0, s,
    0, 1, 0,
    s.negate(), 0, c
  )
})

/**
 * Rotation around Z axis
 */
export const rotationZ = Fn(([angle]) => {
  const c = cos(angle)
  const s = sin(angle)
  return mat3(
    c, s.negate(), 0,
    s, c, 0,
    0, 0, 1
  )
})
```

---

## UV Transformations

### Screen Aspect UV

```typescript
// tsl/utils/function/screen_aspect_uv.ts
import { Fn, div, cond } from 'three/tsl'

/**
 * Aspect-corrected UV coordinates
 * @param {vec2} screenSize - Screen dimensions
 * @returns {vec2} Corrected UV
 */
export const screenAspectUV = Fn(([screenSize]) => {
  const aspect = div(screenSize.x, screenSize.y)
  const _uv = uv().sub(0.5).toVar()
  
  _uv.x.assign(cond(
    aspect.greaterThan(1),
    _uv.x.mul(aspect),
    _uv.x
  ))
  
  _uv.y.assign(cond(
    aspect.lessThan(1),
    _uv.y.div(aspect),
    _uv.y
  ))
  
  return _uv
})
```

### Domain Repetition

```typescript
/**
 * Repeat pattern in grid
 * @param {vec2} p - Position
 * @param {vec2} cellSize - Size of each cell
 * @returns {vec2} Repeated position
 */
export const repeatPattern = Fn(([p, cellSize]) => {
  return fract(p.div(cellSize)).mul(cellSize)
})

// With index tracking
export const repeatPatternWithIndex = Fn(([p, cellSize]) => {
  const cellIndex = floor(p.div(cellSize))
  const cellPos = fract(p.div(cellSize)).mul(cellSize)
  return { cellIndex, cellPos }
})
```

### UV Kaleidoscope

```typescript
/**
 * Kaleidoscope effect
 * @param {vec2} uv - UV coordinates
 * @param {float} segments - Number of segments
 * @returns {vec2} Kaleidoscope UV
 */
export const kaleidoscope = Fn(([_uv, segments = float(6)]) => {
  const uv = _uv.sub(0.5)
  const polar = cartesianToPolar(uv)
  
  // Mirror across segments
  const angle = polar.y
  const segmentAngle = PI2.div(segments)
  const mirroredAngle = abs(mod(angle, segmentAngle.mul(2)).sub(segmentAngle))
  
  const newPolar = vec2(polar.x, mirroredAngle)
  return polarToCartesian(newPolar).add(0.5)
})
```

---

## Lighting Helpers

### Phong Lighting

```typescript
// tsl/utils/lighting.ts
import { Fn, max, dot, pow, normalize, reflect } from 'three/tsl'

/**
 * Phong lighting model
 * @param {vec3} normal - Surface normal
 * @param {vec3} lightDir - Direction to light
 * @param {vec3} viewDir - Direction to camera
 * @param {vec3} lightColor - Light color
 * @param {float} shininess - Specular exponent
 * @returns {vec3} Lighting contribution
 */
export const phongLighting = Fn(([normal, lightDir, viewDir, lightColor, shininess = float(32)]) => {
  // Ambient
  const ambient = lightColor.mul(0.1)
  
  // Diffuse
  const diff = max(0, dot(normal, lightDir))
  const diffuse = lightColor.mul(diff)
  
  // Specular
  const reflectDir = reflect(lightDir.negate(), normal)
  const spec = pow(max(0, dot(viewDir, reflectDir)), shininess)
  const specular = lightColor.mul(spec)
  
  return ambient.add(diffuse).add(specular)
})
```

### Fresnel

```typescript
/**
 * Fresnel effect
 * @param {vec3} normal - Surface normal
 * @param {vec3} viewDir - View direction
 * @param {float} power - Fresnel power
 * @returns {float} Fresnel factor
 */
export const fresnel = Fn(([normal, viewDir, power = float(2)]) => {
  return float(1).sub(max(0, dot(normal, viewDir))).pow(power)
})
```

### Hemisphere Lighting

```typescript
/**
 * Hemisphere lighting (sky + ground)
 * @param {vec3} normal - Surface normal
 * @param {vec3} skyColor - Sky color
 * @param {vec3} groundColor - Ground color
 * @returns {vec3} Hemisphere light contribution
 */
export const hemisphereLight = Fn(([normal, skyColor, groundColor]) => {
  const hemiMix = normal.y.mul(0.5).add(0.5)
  return mix(groundColor, skyColor, hemiMix)
})
```

---

## Common Patterns

### Pattern 1: Bloom Edge Detection

```typescript
// tsl/utils/function/bloom.ts
import { Fn, pow } from 'three/tsl'

/**
 * Bloom edge pattern
 * @param {float} pattern - Input pattern
 * @param {float} edge - Edge threshold
 * @param {float} exponent - Bloom intensity
 * @returns {float} Bloomed pattern
 */
export const bloom = Fn(([pattern, edge, exponent]) => {
  pattern.assign(pow(edge.div(pattern), exponent))
  return pattern
})
```

### Pattern 2: Smooth Edge

```typescript
/**
 * Anti-aliased edge
 * @param {float} d - Distance field
 * @param {float} width - Edge width
 * @returns {float} Smooth step
 */
export const smoothEdge = Fn(([d, width = float(0.01)]) => {
  return smoothstep(0, width, d.negate())
})
```

### Pattern 3: Remap/Normalize

```typescript
/**
 * Remap value from one range to another
 * @param {float} value - Input value
 * @param {float} inMin - Input min
 * @param {float} inMax - Input max
 * @param {float} outMin - Output min
 * @param {float} outMax - Output max
 * @returns {float} Remapped value
 */
export const remap = Fn(([value, inMin, inMax, outMin, outMax]) => {
  const t = value.sub(inMin).div(inMax.sub(inMin))
  return mix(outMin, outMax, t)
})

// Built-in version
const remapped = value.remap(0, 1, -1, 1)
```

---

## Performance Helpers

### Early Exit Pattern

```typescript
const optimizedShader = Fn(() => {
  // Quick rejection
  If(condition, () => {
    return vec4(0)
  })
  
  // Expensive computation only if needed
  const expensive = computeExpensiveValue()
  return expensive
})
```

### LOD Helper

```typescript
/**
 * Level of detail based on distance
 * @param {float} distance - Distance to camera
 * @param {float} near - Near LOD distance
 * @param {float} far - Far LOD distance
 * @returns {float} LOD factor (0-1)
 */
export const lodFactor = Fn(([distance, near, far]) => {
  return smoothstep(near, far, distance)
})
```

---

## Quick Reference

| Category | Functions |
|----------|-----------|
| **Color** | `cosinePalette`, `rgbToHsv`, `hsvToRgb` |
| **Coordinates** | `cartesianToPolar`, `polarToCartesian`, `positionSphereRand` |
| **Math** | `complexMul`, `rotation2D`, `rotation3D` |
| **UV** | `screenAspectUV`, `repeatPattern`, `kaleidoscope` |
| **Lighting** | `phongLighting`, `fresnel`, `hemisphereLight` |
| **Utility** | `bloom`, `smoothEdge`, `remap` |

---

**Next**: [Complete Examples](./11-Complete-Examples.md)

