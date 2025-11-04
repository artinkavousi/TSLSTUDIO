# Signed Distance Functions (SDF) in TSL

## Overview

Signed Distance Functions represent shapes mathematically, returning the distance from any point to the nearest surface. Negative values mean inside the shape, positive values outside. SDFs are perfect for:

- **Procedural modeling**
- **Raymarching**
- **CSG operations** (boolean operations)
- **Soft shadows**
- **Ambient occlusion**

---

## Table of Contents

1. [Basic 2D Shapes](#basic-2d-shapes)
2. [3D Shapes](#3d-shapes)
3. [SDF Operations](#sdf-operations)
4. [Advanced Techniques](#advanced-techniques)
5. [Complete Examples](#complete-examples)

---

## Basic 2D Shapes

### Sphere/Circle

```typescript
import { Fn, length, float } from 'three/tsl'

/**
 * Sphere SDF
 * @param {vec2|vec3} p - Point to test
 * @param {float} r - Radius
 * @returns {float} Signed distance
 */
export const sdSphere = Fn(([p, r = float(0.5)]) => {
  return length(p).sub(r)
})

// Usage
const distance = sdSphere(uv(), 0.3)
const circle = step(distance, 0)  // Solid circle
const ring = abs(distance).sub(0.05)  // Ring
```

### Box (2D)

```typescript
import { Fn, abs, max, float } from 'three/tsl'

/**
 * 2D Box SDF
 * @param {vec2} p - Point to test
 * @param {float} size - Half-size
 * @returns {float} Signed distance
 */
export const sdBox2d = Fn(([p, size = float(0.5)]) => {
  return max(abs(p.x), abs(p.y)).sub(size)
})
```

### Diamond

```typescript
/**
 * Diamond SDF
 * @param {vec2} p - Point to test
 * @param {float} r - Size
 * @returns {float} Signed distance
 */
export const sdDiamond = Fn(([p, r = float(0.5)]) => {
  return abs(p.x).add(abs(p.y)).sub(r)
})
```

### Hexagon

```typescript
import { Fn, vec2, vec3, abs, dot, min, clamp, length, sign } from 'three/tsl'

/**
 * Hexagon SDF
 * @param {vec2} p - Point to test
 * @param {float} r - Radius
 * @returns {float} Signed distance
 */
export const sdHexagon = Fn(([p = vec2(0), r = float(0.5)]) => {
  const k = vec3(-0.866025404, 0.5, 0.577350269)
  
  const _p = abs(p).toVar()
  _p.subAssign(float(2.0).mul(min(dot(k.xy, _p), 0.0).mul(k.xy)))
  _p.subAssign(vec2(
    clamp(_p.x, k.z.negate().mul(r), k.z.mul(r)),
    r
  ))
  
  return length(_p).mul(sign(_p.y))
})
```

### Equilateral Triangle

```typescript
import { Fn, vec2, abs, sqrt, clamp, length, If, float } from 'three/tsl'

/**
 * Equilateral Triangle SDF
 * @param {vec2} p - Point to test
 * @param {float} r - Radius
 * @returns {float} Signed distance
 */
export const sdEquilateralTriangle = Fn(([p = vec2(0), r = float(0.5)]) => {
  const k = sqrt(3.0)
  const _p = p.toVar()
  
  _p.x = abs(_p.x).sub(r).toVar()
  _p.y = _p.y.add(r.div(k)).toVar()
  
  If(_p.x.add(k.mul(_p.y)).greaterThan(0), () => {
    _p.assign(
      vec2(_p.x.sub(k.mul(_p.y)), k.negate().mul(_p.x).sub(_p.y))
        .div(2)
    )
  })
  
  _p.x.subAssign(clamp(_p.x, r.mul(-2), 0.0))
  return length(_p).negate().mul(sign(_p.y))
})
```

### Ring

```typescript
/**
 * Ring SDF
 * @param {vec2} p - Point to test
 * @param {float} r - Radius
 * @param {float} thickness - Ring thickness
 * @returns {float} Signed distance
 */
export const sdRing = Fn(([p, r = float(0.4), thickness = float(0.05)]) => {
  return abs(length(p).sub(r)).sub(thickness)
})
```

### Rhombus

```typescript
import { Fn, vec2, abs, dot, clamp, length, sign, mul, sub, add } from 'three/tsl'

const ndot = Fn(([a, b]) => {
  return a.x.mul(b.x).sub(a.y.mul(b.y))
})

/**
 * Rhombus SDF
 * @param {vec2} p - Point to test
 * @param {vec2} b - Size parameters
 * @returns {float} Signed distance
 */
export const sdRhombus = Fn(([p, b]) => {
  const _p = abs(p).toVar()
  const h = clamp(
    ndot(b.sub(mul(2.0, _p)), b).div(dot(b, b)),
    -1.0,
    1.0
  )
  const d = length(
    _p.sub(mul(0.5, b).mul(vec2(sub(1.0, h), add(1.0, h))))
  )
  
  return d.mul(sign(_p.x.mul(b.y).add(_p.y.mul(b.x).sub(b.x.mul(b.y)))))
})
```

---

## 3D Shapes

### Sphere (3D)

```typescript
/**
 * 3D Sphere SDF
 * @param {vec3} p - Point to test
 * @param {float} r - Radius
 * @returns {float} Signed distance
 */
export const sdSphere3d = Fn(([p, r = float(0.5)]) => {
  return length(p).sub(r)
})
```

### Box (3D)

```typescript
import { Fn, vec3, abs, length, max, min, float } from 'three/tsl'

/**
 * 3D Box SDF
 * @param {vec3} p - Point to test
 * @param {vec3} b - Half-extents
 * @returns {float} Signed distance
 */
export const sdBox3d = Fn(([p, b]) => {
  const q = abs(p).sub(b)
  return length(max(q, 0.0)).add(min(max(q.x, max(q.y, q.z)), 0.0))
})

// Example usage
const box = sdBox3d(position, vec3(0.5, 0.3, 0.2))
```

### Torus

```typescript
/**
 * Torus SDF
 * @param {vec3} p - Point to test
 * @param {vec2} t - (major radius, minor radius)
 * @returns {float} Signed distance
 */
export const sdTorus = Fn(([p, t]) => {
  const q = vec2(length(p.xz).sub(t.x), p.y)
  return length(q).sub(t.y)
})
```

### Capsule/Line

```typescript
/**
 * Capsule SDF (rounded line)
 * @param {vec3} p - Point to test
 * @param {vec3} a - Start point
 * @param {vec3} b - End point
 * @param {float} r - Radius
 * @returns {float} Signed distance
 */
export const sdCapsule = Fn(([p, a, b, r]) => {
  const pa = p.sub(a)
  const ba = b.sub(a)
  const h = clamp(dot(pa, ba).div(dot(ba, ba)), 0.0, 1.0)
  return length(pa.sub(ba.mul(h))).sub(r)
})
```

### Cylinder

```typescript
/**
 * Cylinder SDF
 * @param {vec3} p - Point to test
 * @param {float} h - Height
 * @param {float} r - Radius
 * @returns {float} Signed distance
 */
export const sdCylinder = Fn(([p, h, r]) => {
  const d = abs(vec2(length(p.xz), p.y)).sub(vec2(r, h))
  return min(max(d.x, d.y), 0.0).add(length(max(d, 0.0)))
})
```

---

## SDF Operations

### Union (OR)

```typescript
/**
 * Union of two SDFs (closest surface)
 */
export const opUnion = Fn(([d1, d2]) => {
  return min(d1, d2)
})

// Usage
const shape = opUnion(
  sdSphere(p, 0.5),
  sdBox3d(p, vec3(0.3))
)
```

### Subtraction (Difference)

```typescript
/**
 * Subtract d2 from d1
 */
export const opSubtraction = Fn(([d1, d2]) => {
  return max(d1, d2.negate())
})

// Usage: Sphere with box carved out
const hollowSphere = opSubtraction(
  sdSphere(p, 0.5),
  sdBox3d(p, vec3(0.3))
)
```

### Intersection (AND)

```typescript
/**
 * Intersection of two SDFs
 */
export const opIntersection = Fn(([d1, d2]) => {
  return max(d1, d2)
})
```

### Smooth Union (Blend)

```typescript
import { Fn, max, abs, min, float } from 'three/tsl'

/**
 * Smooth minimum for blending SDFs
 * @param {float} a - First SDF
 * @param {float} b - Second SDF
 * @param {float} k - Smoothing factor (0 = sharp, higher = smoother)
 * @returns {float} Blended distance
 */
export const smin = Fn(([a, b, k = float(0.3)]) => {
  const h = max(k.sub(abs(a.sub(b))), 0.0).div(k)
  return min(a, b).sub(h.mul(h).mul(k).mul(0.25))
})

// Usage: Smooth blob
const blob = smin(
  sdSphere(p.sub(vec3(0.3, 0, 0)), 0.5),
  sdSphere(p.add(vec3(0.3, 0, 0)), 0.5),
  0.5  // smoothness
)
```

### Smooth Subtraction

```typescript
/**
 * Smooth subtraction
 */
export const sminSub = Fn(([a, b, k = float(0.3)]) => {
  const h = max(k.sub(abs(a.add(b))), 0.0).div(k)
  return max(a, b.negate()).add(h.mul(h).mul(k).mul(0.25))
})
```

---

## Advanced Techniques

### Domain Repetition

```typescript
import { Fn, mod } from 'three/tsl'

/**
 * Repeat SDF in grid
 * @param {vec3} p - Position
 * @param {vec3} c - Cell size
 * @returns {vec3} Repeated position
 */
export const opRepeat = Fn(([p, c]) => {
  return mod(p.add(c.mul(0.5)), c).sub(c.mul(0.5))
})

// Usage: Grid of spheres
const repeatedPos = opRepeat(position, vec3(2, 2, 2))
const grid = sdSphere(repeatedPos, 0.3)
```

### Domain Twisting

```typescript
/**
 * Twist transformation
 * @param {vec3} p - Position
 * @param {float} k - Twist amount
 * @returns {vec3} Twisted position
 */
export const opTwist = Fn(([p, k]) => {
  const c = cos(k.mul(p.y))
  const s = sin(k.mul(p.y))
  const m = mat2(c, s, s.negate(), c)
  return vec3(m.mul(p.xz), p.y)
})
```

### Domain Bending

```typescript
/**
 * Bend transformation
 * @param {vec3} p - Position
 * @param {float} k - Bend amount
 * @returns {vec3} Bent position
 */
export const opBend = Fn(([p, k]) => {
  const c = cos(k.mul(p.x))
  const s = sin(k.mul(p.x))
  const m = mat2(c, s, s.negate(), c)
  return vec3(m.mul(p.xy), p.z)
})
```

### Onion (Shell/Hollow)

```typescript
/**
 * Make hollow version of shape
 * @param {float} d - SDF distance
 * @param {float} thickness - Shell thickness
 * @returns {float} Hollowed distance
 */
export const opOnion = Fn(([d, thickness = float(0.1)]) => {
  return abs(d).sub(thickness)
})

// Usage: Hollow sphere
const hollowSphere = opOnion(sdSphere(p, 0.5), 0.05)
```

### Elongation

```typescript
/**
 * Elongate shape along axis
 * @param {vec3} p - Position
 * @param {vec3} h - Elongation amount
 * @returns {vec3} Elongated position
 */
export const opElongate = Fn(([p, h]) => {
  return p.sub(clamp(p, h.negate(), h))
})
```

---

## Complete Examples

### Example 1: Raymarching Scene

```typescript
import { Fn, vec3, float, Loop, If, Break } from 'three/tsl'

// Define scene SDF
const sceneSDF = Fn(([pos]) => {
  // Ground plane
  const ground = pos.y.add(0.5)
  
  // Sphere
  const sphere = sdSphere3d(pos.sub(vec3(0, 0.5, 0)), 0.5)
  
  // Box
  const box = sdBox3d(pos.sub(vec3(1, 0.3, 0)), vec3(0.3))
  
  // Combine with smooth union
  const shapes = smin(sphere, box, 0.3)
  
  return min(shapes, ground)
})

// Raymarching function
const raymarch = Fn(() => {
  const rayOrigin = cameraPosition
  const rayDirection = normalize(/* calculate based on UV */)
  
  const t = float(0).toVar()
  const ray = rayOrigin.toVar()
  
  Loop({ start: 0, end: 100 }, () => {
    const d = sceneSDF(ray)
    
    If(d.lessThan(0.001), () => {
      Break()
    })
    
    t.addAssign(d)
    ray.assign(rayOrigin.add(rayDirection.mul(t)))
    
    If(t.greaterThan(100), () => {
      Break()
    })
  })
  
  return ray
})
```

### Example 2: Animated Morphing Shapes

```typescript
import { Fn, timerLocal, sin, mix } from 'three/tsl'

const morphingShape = Fn(([pos]) => {
  const time = timerLocal()
  
  // Animate between sphere and box
  const t = sin(time).mul(0.5).add(0.5)
  
  const sphere = sdSphere3d(pos, 0.5)
  const box = sdBox3d(pos, vec3(0.4))
  
  return mix(sphere, box, t)
})
```

### Example 3: SDF to Normal

```typescript
/**
 * Calculate normal from SDF
 * @param {vec3} p - Position
 * @param {Function} sdf - SDF function
 * @returns {vec3} Normal vector
 */
const calcNormal = Fn(([p, sdf]) => {
  const eps = float(0.0001)
  const h = vec2(eps, 0)
  
  return normalize(vec3(
    sdf(p.add(h.xyy)).sub(sdf(p.sub(h.xyy))),
    sdf(p.add(h.yxy)).sub(sdf(p.sub(h.yxy))),
    sdf(p.add(h.yyx)).sub(sdf(p.sub(h.yyx)))
  ))
})
```

### Example 4: SDF-based Particles

```typescript
const particleShape = Fn(() => {
  const _uv = uv().sub(0.5)
  const dist = sdSphere(_uv, 0.4)
  
  // Soft edge
  const alpha = smoothstep(0.0, 0.1, dist.negate())
  
  // Glow
  const glow = float(0.05).div(dist.add(0.05))
  
  return vec4(vec3(1), alpha.add(glow).clamp(0, 1))
})
```

---

## Performance Tips

1. **Keep SDFs Simple**: Complex shapes are expensive
2. **Limit Raymarching Steps**: 50-100 is usually enough
3. **Use Bounding Volumes**: Skip expensive SDFs when possible
4. **Cache Calculations**: Store intermediate results
5. **Use 2D when possible**: 2D SDFs are faster than 3D

---

## Common Issues & Solutions

### Issue: Jaggy Edges

**Solution**: Increase raymarching precision or use smaller epsilon

```typescript
const HIT_THRESHOLD = 0.001  // Smaller = smoother but slower
```

### Issue: Missing Surfaces

**Solution**: Increase max raymarching distance

```typescript
const MAX_DISTANCE = 100  // Increase if objects disappear
```

### Issue: Performance

**Solution**: Use simpler SDFs or reduce iterations

```typescript
// Instead of smooth union everywhere
const fastUnion = min(shape1, shape2)  // Sharp but fast
```

---

## Reference Table

| Shape | Dimensions | Parameters | Complexity |
|-------|-----------|------------|------------|
| `sdSphere` | 2D/3D | radius | ★☆☆☆☆ |
| `sdBox2d` | 2D | size | ★☆☆☆☆ |
| `sdBox3d` | 3D | extents | ★★☆☆☆ |
| `sdHexagon` | 2D | radius | ★★★☆☆ |
| `sdTorus` | 3D | radii | ★★☆☆☆ |
| `smin` | Any | smoothness | ★★☆☆☆ |
| `opRepeat` | Any | spacing | ★☆☆☆☆ |
| `opTwist` | 3D | amount | ★★☆☆☆ |

---

## Resources

- [Inigo Quilez SDF Guide](https://iquilezles.org/articles/distfunctions/)
- [SDF Modeling Tool](https://iquilezles.org/articles/sdfmodeling/)
- [Raymarching Workshop](https://www.shadertoy.com/view/4dSfRc)

---

**Next**: [Particle Systems](./04-Particle-Systems.md)

