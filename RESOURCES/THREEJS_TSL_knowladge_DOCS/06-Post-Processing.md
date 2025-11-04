# Post-Processing Effects in TSL

## Overview

Post-processing effects transform the rendered image after the main render pass. This guide covers implementation patterns from grain, vignette, LCD effects, to advanced techniques like depth-of-field and SSAO.

---

## Table of Contents

1. [Post-Processing Setup](#post-processing-setup)
2. [Basic Effects](#basic-effects)
3. [Depth-Based Effects](#depth-based-effects)
4. [Advanced Techniques](#advanced-techniques)
5. [Complete Examples](#complete-examples)

---

## Post-Processing Setup

### Basic Post-Processing Pipeline

```typescript
import { PostProcessing } from 'three/webgpu'
import { pass, Fn, vec4 } from 'three/tsl'

// Setup post-processing
const postProcessing = new PostProcessing(renderer)

// Color pass (main scene render)
const colorPass = pass(scene, camera)
const colorNode = colorPass.getTextureNode()

// Apply effects
const finalOutput = applyEffects(colorNode)

// Set output
postProcessing.outputNode = finalOutput

// Render
postProcessing.renderAsync()
```

### Multiple Passes

```typescript
// Pass 1: Scene
const scenePass = pass(scene, camera)

// Pass 2: Bloom
const bloomPass = scenePass.getTextureNode().bloom(intensity)

// Pass 3: Tone mapping
const toneMappedPass = bloomPass.toneMapping()

// Output
postProcessing.outputNode = toneMappedPass
```

---

## Basic Effects

### Grain/Film Grain

```typescript
// tsl/post_processing/grain_texture_effect.ts
import { vec2, Fn, fract, sin, dot } from 'three/tsl'

/**
 * Grain texture effect
 * @param {vec2} uv - UV coordinates
 * @returns {float} Grain value
 */
export const grainTextureEffect = Fn(([_uv]) => {
  return fract(
    sin(dot(_uv, vec2(12.9898, 78.233))).mul(43758.5453123)
  )
})

// Usage
const withGrain = Fn(() => {
  const color = texture(sceneTexture, uv())
  const grain = grainTextureEffect(uv()).mul(grainStrength)
  return color.add(grain)
})
```

### Vignette

```typescript
// tsl/post_processing/vignette_effect.ts
import { Fn, length, uv, smoothstep, pow } from 'three/tsl'

/**
 * Vignette effect
 * @param {vec2} uv - UV coordinates
 * @param {float} intensity - Effect strength (0-1)
 * @param {float} smoothness - Edge softness
 * @returns {float} Vignette mask
 */
export const vignetteEffect = Fn(([_uv, intensity = float(0.5), smoothness = float(0.5)]) => {
  const dist = length(_uv.sub(0.5))
  const vignette = smoothstep(intensity, intensity.sub(smoothness), dist)
  return vignette
})

// Usage
const withVignette = Fn(() => {
  const color = texture(sceneTexture, uv())
  const vignette = vignetteEffect(uv(), 0.8, 0.3)
  return color.mul(vignette)
})
```

### Pixelation/LCD Effect

```typescript
// tsl/post_processing/pixellation_effect.ts
import { Fn, floor } from 'three/tsl'

/**
 * Pixelation effect
 * @param {vec2} uv - UV coordinates
 * @param {vec2} resolution - Screen resolution
 * @param {float} pixelSize - Size of pixels
 * @returns {vec2} Pixelated UV
 */
export const pixellationEffect = Fn(([_uv, resolution, pixelSize]) => {
  const pixelCount = resolution.div(pixelSize)
  return floor(_uv.mul(pixelCount)).div(pixelCount)
})

// LCD Effect
export const lcdEffect = Fn(([_uv, resolution]) => {
  const pixelSize = 4
  const pixelatedUV = pixellationEffect(_uv, resolution, pixelSize)
  
  // Sub-pixel pattern
  const subPixel = fract(_uv.mul(resolution).div(pixelSize))
  const r = step(0.33, subPixel.x)
  const g = step(0.33, abs(subPixel.x.sub(0.5)))
  const b = step(0.67, subPixel.x)
  
  const color = texture(sceneTexture, pixelatedUV)
  return color.mul(vec3(r, g, b))
})
```

### Canvas Weave Effect

```typescript
// tsl/post_processing/canvas_weave_effect.ts
import { Fn, sin, PI } from 'three/tsl'

/**
 * Canvas weave pattern
 * @param {vec2} uv - UV coordinates
 * @param {vec2} resolution - Screen resolution
 * @param {float} weaveSize - Size of weave pattern
 * @returns {float} Weave pattern value
 */
export const canvasWeaveEffect = Fn(([_uv, resolution, weaveSize = float(20)]) => {
  const coord = _uv.mul(resolution)
  
  const horizontalWeave = sin(coord.y.mul(weaveSize).mul(PI)).mul(0.5).add(0.5)
  const verticalWeave = sin(coord.x.mul(weaveSize).mul(PI)).mul(0.5).add(0.5)
  
  return horizontalWeave.mul(0.1).add(verticalWeave.mul(0.1)).add(0.9)
})
```

### Speckled Noise

```typescript
// tsl/post_processing/speckled_noise_effect.ts
import { Fn, hash, instanceIndex, fract } from 'three/tsl'

/**
 * Speckled noise effect
 * @param {vec2} uv - UV coordinates
 * @param {float} amount - Noise amount
 * @returns {float} Noise value
 */
export const speckledNoiseEffect = Fn(([_uv, amount = float(0.1)]) => {
  const noise = hash(floor(_uv.mul(1000)))
  return noise.mul(amount)
})
```

---

## Depth-Based Effects

### Depth of Field (Focus Blur)

```typescript
import { pass, uniform, float } from 'three/tsl'

// Get depth pass
const colorPass = pass(scene, camera)
const depthPass = colorPass.getDepthNode()

// Convert to absolute depth
const absoluteDepth = depthPass.mul(camera.far - camera.near)

// Focus parameters
const focusDistance = uniform(5.0)
const focusAmplitude = uniform(5.0)
const focusStart = uniform(1.0)
const blurMax = uniform(3.0)
const blurMultiplier = uniform(1.5)

// Calculate blur amount
const focus = absoluteDepth
  .sub(focusDistance)
  .abs()
  .smoothstep(focusStart, focusStart.add(focusAmplitude))

const blur = focus.mul(blurMultiplier).min(blurMax)

// Apply gaussian blur
const colorPassNode = colorPass.getTextureNode()
const focusBlurPass = colorPassNode.gaussianBlur(4)
focusBlurPass.directionNode = blur

postProcessing.outputNode = focusBlurPass
```

### Fog (Depth-Based)

```typescript
import { rangeFog, densityFog, color } from 'three/tsl'

// Range fog (linear)
scene.fogNode = rangeFog(
  color('#1b191f'),  // Fog color
  20,                // Near
  30                 // Far
)

// Density fog (exponential)
scene.fogNode = densityFog(
  color('#1b191f'),
  0.05               // Density
)
```

---

## Advanced Techniques

### Bloom

```typescript
// Built-in bloom
const bloomPass = colorNode.bloom(intensity)

// Custom bloom with threshold
const customBloom = Fn(() => {
  const color = texture(sceneTexture, uv())
  
  // Extract bright areas
  const brightness = dot(color.rgb, vec3(0.2126, 0.7152, 0.0722))
  const brightColor = cond(
    brightness.greaterThan(bloomThreshold),
    color,
    vec4(0)
  )
  
  // Blur bright areas
  const blurred = brightColor.gaussianBlur(5)
  
  // Combine with original
  return color.add(blurred.mul(bloomIntensity))
})
```

### Chromatic Aberration

```typescript
const chromaticAberration = Fn(() => {
  const offset = aberrationStrength
  const center = vec2(0.5)
  const dir = uv().sub(center).normalize()
  
  // Sample RGB separately with offset
  const r = texture(sceneTexture, uv().add(dir.mul(offset))).r
  const g = texture(sceneTexture, uv()).g
  const b = texture(sceneTexture, uv().sub(dir.mul(offset))).b
  
  return vec4(r, g, b, 1)
})
```

### Color Grading

```typescript
const colorGrading = Fn(() => {
  const color = texture(sceneTexture, uv())
  
  // Contrast
  const contrasted = color.sub(0.5).mul(contrast).add(0.5)
  
  // Saturation
  const gray = dot(contrasted.rgb, vec3(0.299, 0.587, 0.114))
  const saturated = mix(vec3(gray), contrasted.rgb, saturation)
  
  // Brightness
  const final = saturated.mul(brightness)
  
  return vec4(final, color.a)
})
```

### Tone Mapping

```typescript
// tsl/utils/color/tonemapping.ts
import { Fn, vec3, pow } from 'three/tsl'

/**
 * ACES Filmic tone mapping
 * @param {vec3} color - HDR color
 * @returns {vec3} Tone mapped color
 */
export const acesToneMapping = Fn(([color]) => {
  const a = 2.51
  const b = 0.03
  const c = 2.43
  const d = 0.59
  const e = 0.14
  
  return color
    .mul(color.mul(a).add(b))
    .div(color.mul(color.mul(c).add(d)).add(e))
    .clamp(0, 1)
})

/**
 * Reinhard tone mapping
 */
export const reinhardToneMapping = Fn(([color]) => {
  return color.div(color.add(1))
})

/**
 * Uncharted 2 tone mapping
 */
export const uncharted2ToneMapping = Fn(([color]) => {
  const A = 0.15
  const B = 0.50
  const C = 0.10
  const D = 0.20
  const E = 0.02
  const F = 0.30
  
  const curr = color.mul(A).add(color.mul(B).mul(C)).add(D.mul(E))
    .div(color.mul(A.mul(color)).add(B).add(D.mul(F)))
    .sub(E.div(F))
  
  return curr
})
```

### Edge Detection (Sobel)

```typescript
const sobelEdgeDetection = Fn(() => {
  const texelSize = vec2(1).div(resolution)
  
  // Sample 3x3 grid
  const tl = texture(sceneTexture, uv().add(vec2(-1, -1).mul(texelSize)))
  const tm = texture(sceneTexture, uv().add(vec2(0, -1).mul(texelSize)))
  const tr = texture(sceneTexture, uv().add(vec2(1, -1).mul(texelSize)))
  const ml = texture(sceneTexture, uv().add(vec2(-1, 0).mul(texelSize)))
  const mr = texture(sceneTexture, uv().add(vec2(1, 0).mul(texelSize)))
  const bl = texture(sceneTexture, uv().add(vec2(-1, 1).mul(texelSize)))
  const bm = texture(sceneTexture, uv().add(vec2(0, 1).mul(texelSize)))
  const br = texture(sceneTexture, uv().add(vec2(1, 1).mul(texelSize)))
  
  // Sobel kernels
  const gx = tl.mul(-1).add(tr).add(ml.mul(-2)).add(mr.mul(2)).add(bl.mul(-1)).add(br)
  const gy = tl.mul(-1).add(tm.mul(-2)).add(tr.mul(-1)).add(bl).add(bm.mul(2)).add(br)
  
  const edge = sqrt(gx.mul(gx).add(gy.mul(gy)))
  
  return edge
})
```

---

## Complete Examples

### Example 1: Full Post-Processing Stack

```typescript
import { PostProcessing } from 'three/webgpu'
import { pass, Fn, vec4, uniform } from 'three/tsl'
import { grainTextureEffect } from './effects/grain'
import { vignetteEffect } from './effects/vignette'
import { acesToneMapping } from './effects/tonemapping'

// Setup
const postProcessing = new PostProcessing(renderer)
const scenePass = pass(scene, camera)
const colorNode = scenePass.getTextureNode()

// Parameters
const grainStrength = uniform(0.05)
const vignetteIntensity = uniform(0.8)
const vignetteSmoothness = uniform(0.3)

// Combined effects
const finalOutput = Fn(() => {
  const _uv = uv()
  
  // 1. Sample scene
  let color = texture(colorNode, _uv)
  
  // 2. Tone mapping
  color.rgb = acesToneMapping(color.rgb)
  
  // 3. Vignette
  const vignette = vignetteEffect(_uv, vignetteIntensity, vignetteSmoothness)
  color.rgb.mulAssign(vignette)
  
  // 4. Grain
  const grain = grainTextureEffect(_uv).mul(grainStrength)
  color.rgb.addAssign(grain)
  
  return color
})()

postProcessing.outputNode = finalOutput
```

### Example 2: Cinematic Effect

```typescript
const cinematicEffect = Fn(() => {
  const _uv = uv()
  let color = texture(sceneTexture, _uv)
  
  // 1. Desaturate slightly
  const gray = dot(color.rgb, vec3(0.299, 0.587, 0.114))
  color.rgb = mix(vec3(gray), color.rgb, 0.8)
  
  // 2. Tint (add color grading)
  color.rgb.mulAssign(vec3(1.1, 1.0, 0.9))  // Warm tint
  
  // 3. Vignette
  const dist = length(_uv.sub(0.5))
  const vignette = smoothstep(1.0, 0.5, dist)
  color.rgb.mulAssign(vignette.mul(0.5).add(0.5))
  
  // 4. Letterbox
  const letterbox = smoothstep(0.0, 0.05, _uv.y)
    .mul(smoothstep(1.0, 0.95, _uv.y))
  color.rgb.mulAssign(letterbox)
  
  return color
})
```

### Example 3: Retro CRT Effect

```typescript
const crtEffect = Fn(() => {
  const _uv = uv()
  
  // 1. Barrel distortion
  const center = _uv.sub(0.5).mul(2)
  const distorted = center.mul(1.0.add(center.length().pow(2).mul(0.1)))
  const newUV = distorted.mul(0.5).add(0.5)
  
  // Check bounds
  If(newUV.x.lessThan(0).or(newUV.x.greaterThan(1))
    .or(newUV.y.lessThan(0)).or(newUV.y.greaterThan(1)), () => {
    return vec4(0)
  })
  
  // 2. Scanlines
  const scanline = sin(newUV.y.mul(resolution.y).mul(PI)).mul(0.5).add(0.5)
  const scanlineStrength = 0.2
  
  // 3. RGB shift
  const offset = 0.002
  const r = texture(sceneTexture, newUV.add(vec2(offset, 0))).r
  const g = texture(sceneTexture, newUV).g
  const b = texture(sceneTexture, newUV.sub(vec2(offset, 0))).b
  
  let color = vec3(r, g, b)
  
  // Apply scanlines
  color.mulAssign(mix(1.0, scanline, scanlineStrength))
  
  // 4. Vignette
  const vignette = pow(16.0.mul(newUV.x).mul(newUV.y).mul(newUV.x.oneMinus()).mul(newUV.y.oneMinus()), 0.3)
  color.mulAssign(vignette)
  
  return vec4(color, 1)
})
```

---

## Performance Tips

1. **Combine Effects**: Apply multiple effects in one shader pass
2. **Use Lower Resolution**: Apply heavy effects at 0.5x resolution
3. **Avoid Excessive Sampling**: Limit texture lookups
4. **Cache Computations**: Store intermediate results

```typescript
// Good: Combined pass
const combined = Fn(() => {
  const color = texture(sceneTexture, uv())
  const grain = grainTextureEffect(uv())
  const vignette = vignetteEffect(uv())
  return color.add(grain).mul(vignette)
})

// Bad: Separate passes (slower)
const pass1 = applyGrain()
const pass2 = applyVignette(pass1)
```

---

## Common Patterns

### Pattern 1: Toggle Effects

```typescript
const effectEnabled = uniform(1)  // 1 = on, 0 = off

const conditionalEffect = Fn(() => {
  const color = texture(sceneTexture, uv())
  const processed = applyEffect(color)
  return mix(color, processed, effectEnabled)
})
```

### Pattern 2: Animated Parameters

```typescript
const time = timerLocal()
const animatedGrain = Fn(() => {
  // Change grain over time
  const grainAmount = sin(time.mul(2)).mul(0.5).add(0.5).mul(0.1)
  return grainTextureEffect(uv(), grainAmount)
})
```

### Pattern 3: Screen-Space Effects with Depth

```typescript
const depthAwareEffect = Fn(() => {
  const depth = texture(depthTexture, uv()).r
  const linearDepth = depth.remap(0, 1, cameraNear, cameraFar)
  
  // Fade effect based on depth
  const effectStrength = smoothstep(10, 20, linearDepth)
  
  const color = texture(sceneTexture, uv())
  const processed = applyEffect(color)
  
  return mix(color, processed, effectStrength)
})
```

---

## Debugging

```typescript
// Visualize passes
postProcessing.outputNode = depthPass  // Show depth
postProcessing.outputNode = normalPass  // Show normals
postProcessing.outputNode = colorNode.grayscale()  // Show grayscale
```

---

**Next**: [Raymarching](./07-Raymarching.md)

