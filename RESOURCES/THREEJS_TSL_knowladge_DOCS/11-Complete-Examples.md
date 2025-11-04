# Complete Examples

## Overview

Full, production-ready examples extracted from analyzed projects. Each example is complete and can be adapted for your own projects.

---

## Table of Contents

1. [Procedural Terrain](#procedural-terrain)
2. [Raging Sea](#raging-sea)
3. [Particle Flow Field](#particle-flow-field)
4. [Animated Galaxy](#animated-galaxy)
5. [Flare Gradient Effect](#flare-gradient-effect)
6. [Hologram Effect](#hologram-effect)

---

## Procedural Terrain

Interactive terrain with noise-based elevation, color layers, and smooth normals.

```typescript
import * as THREE from 'three/webgpu'
import { 
  max, mx_noise_float, color, cross, dot, 
  float, modelNormalMatrix, positionLocal, sign, 
  smoothstep, step, tslFn, uniform, varyingProperty, 
  vec2, vec3, loop 
} from 'three/tsl'

// Material
const material = new THREE.MeshStandardNodeMaterial({
  metalness: 0,
  roughness: 0.5,
  color: '#85d534'
})

// Uniforms
const noiseIterations = uniform(3)
const positionFrequency = uniform(0.15)
const warpFrequency = uniform(9)
const warpStrength = uniform(1)
const strength = uniform(10)
const offset = uniform(vec2(0, 0))
const neighboursShift = uniform(0.01)

const colorWaterDeep = uniform(color('#002b3d'))
const colorWaterSurface = uniform(color('#66a8ff'))
const colorSand = uniform(color('#ffe894'))
const colorGrass = uniform(color('#85d534'))
const colorSnow = uniform(color('#ffffff'))
const colorRock = uniform(color('#bfbd8d'))

// Varyings
const vNormal = varyingProperty('vec3')
const vPosition = varyingProperty('vec3')

// Get elevation function
const getElevation = tslFn(([position]) => {
  // Warp domain
  const warpedPosition = position.add(offset)
  warpedPosition.addAssign(
    mx_noise_float(
      warpedPosition.mul(positionFrequency).mul(warpFrequency),
      1,
      0
    ).mul(warpStrength)
  )
  
  // FBM-style layered noise
  const elevation = float(0).toVar()
  loop({ type: 'float', start: 1, end: noiseIterations, condition: '<=' }, ({ i }) => {
    const noiseInput = warpedPosition
      .mul(positionFrequency)
      .mul(i.mul(2))
      .add(i.mul(987))
    const noise = mx_noise_float(noiseInput, 1, 0)
      .div(i.add(1).mul(2))
    elevation.addAssign(noise)
  })
  
  // Shape elevation curve
  const elevationSign = sign(elevation)
  elevation.assign(
    elevation.abs().pow(2).mul(elevationSign).mul(strength)
  )
  
  return elevation
})

// Position node
material.positionNode = tslFn(() => {
  // Calculate positions for normal computation
  const neighbourA = positionLocal.xyz.add(vec3(neighboursShift, 0.0, 0.0))
  const neighbourB = positionLocal.xyz.add(vec3(0.0, 0.0, neighboursShift.negate()))
  
  // Apply elevation
  const position = positionLocal.xyz.toVar()
  const elevation = getElevation(positionLocal.xz)
  position.y.addAssign(elevation)
  
  neighbourA.y.addAssign(getElevation(neighbourA.xz))
  neighbourB.y.addAssign(getElevation(neighbourB.xz))
  
  // Compute normal from neighbours
  const toA = neighbourA.sub(position).normalize()
  const toB = neighbourB.sub(position).normalize()
  vNormal.assign(cross(toA, toB))
  
  // Store world position
  vPosition.assign(position.add(vec3(offset.x, 0, offset.y)))
  
  return position
})()

// Normal node
material.normalNode = modelNormalMatrix.mul(vNormal)

// Color node (layered terrain colors)
material.colorNode = tslFn(() => {
  const finalColor = colorWaterDeep.toVar()
  
  // Deep to surface water
  const surfaceWaterMix = smoothstep(-1.0, -0.1, vPosition.y)
  finalColor.assign(surfaceWaterMix.mix(finalColor, colorWaterSurface))
  
  // Water to sand
  const sandMix = step(-0.1, vPosition.y)
  finalColor.assign(sandMix.mix(finalColor, colorSand))
  
  // Sand to grass
  const grassMix = step(-0.06, vPosition.y)
  finalColor.assign(grassMix.mix(finalColor, colorGrass))
  
  // Rock on steep slopes
  const rockMix = step(0.5, dot(vNormal, vec3(0, 1, 0))).oneMinus()
  rockMix.mulAssign(step(-0.06, vPosition.y))
  finalColor.assign(rockMix.mix(finalColor, colorRock))
  
  // Snow on peaks
  const snowThreshold = mx_noise_float(vPosition.xz.mul(25), 1, 0)
    .mul(0.1)
    .add(0.45)
  const snowMix = step(snowThreshold, vPosition.y)
  finalColor.assign(snowMix.mix(finalColor, colorSnow))
  
  return finalColor
})()

// Geometry
const geometry = new THREE.PlaneGeometry(10, 10, 500, 500)
geometry.deleteAttribute('uv')
geometry.deleteAttribute('normal')
geometry.rotateX(-Math.PI * 0.5)

// Mesh
const terrain = new THREE.Mesh(geometry, material)
scene.add(terrain)
```

---

## Raging Sea

Animated water surface with wave elevation and dynamic normals.

```typescript
import * as THREE from 'three/webgpu'
import { 
  float, mx_noise_float, loop, color, positionLocal, 
  sin, vec2, vec3, vec4, mul, timerLocal, uniform, 
  tslFn, modelNormalMatrix 
} from 'three/tsl'

const material = new THREE.MeshStandardNodeMaterial({ roughness: 0.15 })

// Wave parameters
const colorDepth = uniform(color('#ff0a81'))
const colorSurface = uniform(color('#271442'))
const mixLow = uniform(-0.35)
const mixHigh = uniform(0.2)
const mixPower = uniform(5)
const largeWavesFrequency = uniform(vec2(3, 1))
const largeWavesSpeed = uniform(1.25)
const largeWavesMultiplier = uniform(0.15)
const smallWavesIterations = uniform(4)
const smallWavesFrequency = uniform(2)
const smallWavesSpeed = uniform(0.2)
const smallWavesMultiplier = uniform(0.18)
const normalComputeShift = uniform(0.01)

// Waves elevation function
const wavesElevation = tslFn(([position]) => {
  const time = timerLocal()
  
  // Large waves (sine-based)
  const elevation = mul(
    sin(position.x.mul(largeWavesFrequency.x).add(time.mul(largeWavesSpeed))),
    sin(position.z.mul(largeWavesFrequency.y).add(time.mul(largeWavesSpeed)))
  )
  
  elevation.mulAssign(largeWavesMultiplier)
  
  // Small waves (noise-based)
  loop({ start: float(1), end: smallWavesIterations }, ({ i }) => {
    const noiseInput = vec3(
      position.xz.add(1).mul(smallWavesFrequency).mul(i),
      time.mul(smallWavesSpeed)
    )
    const wave = mx_noise_float(noiseInput, 1, 0)
      .mul(smallWavesMultiplier)
      .div(i)
      .abs()
    elevation.subAssign(wave)
  })
  
  return elevation
})

// Position with elevation
const elevation = wavesElevation(positionLocal)
const position = positionLocal.add(vec3(0, elevation, 0))
material.positionNode = position

// Calculate normal from neighbours
let positionA = positionLocal.add(vec3(normalComputeShift, 0, 0))
let positionB = positionLocal.add(vec3(0, 0, normalComputeShift.negate()))

positionA = positionA.add(vec3(0, wavesElevation(positionA), 0))
positionB = positionB.add(vec3(0, wavesElevation(positionB), 0))

const toA = positionA.sub(position).normalize()
const toB = positionB.sub(position).normalize()
const normal = toA.cross(toB)

material.normalNode = modelNormalMatrix.mul(normal)

// Color gradient based on elevation
material.colorNode = vec4(colorSurface, 1)

const emissive = elevation.remap(mixHigh, mixLow).pow(mixPower)
material.emissiveNode = colorDepth.mul(emissive)

// Geometry and mesh
const geometry = new THREE.PlaneGeometry(2, 2, 512, 512)
geometry.rotateX(-Math.PI * 0.5)
const mesh = new THREE.Mesh(geometry, material)
scene.add(mesh)
```

---

## Particle Flow Field

Particles following curl noise flow field with compute shaders.

```typescript
import {
  storage, instanceIndex, tslFn, uniform, vec3, vec4,
  timerDelta, timerGlobal, clamp, smoothstep, length
} from 'three/tsl'
import { StorageInstancedBufferAttribute } from 'three/webgpu'
import { curlNoise4d } from './noise/curl_noise_4d'

class ParticleFlowField {
  constructor(renderer, count = 10000) {
    this.renderer = renderer
    this.count = count
    
    // Uniforms
    const timeDelta = uniform(0.0)
    const timeNoise = uniform(0.0)
    const noiseCoordScale = uniform(0.5)
    const noiseIntensity = uniform(0.01)
    const attractionRadius1 = uniform(5.0)
    const attractionRadius2 = uniform(10.0)
    const maxVelocity = uniform(0.1)
    
    this.uniforms = {
      timeDelta,
      timeNoise,
      noiseCoordScale,
      noiseIntensity,
      attractionRadius1,
      attractionRadius2,
      maxVelocity
    }
    
    // Storage buffers
    const positionBuffer = storage(
      new StorageInstancedBufferAttribute(count, 4),
      'vec4',
      count
    )
    const velocityBuffer = storage(
      new StorageInstancedBufferAttribute(count, 4),
      'vec4',
      count
    )
    
    // Initialize positions
    const initCompute = tslFn(() => {
      const position = positionBuffer.element(instanceIndex)
      const velocity = velocityBuffer.element(instanceIndex)
      
      // Random position on sphere
      const theta = instanceIndex.hash().mul(6.28318)
      const phi = instanceIndex.add(1).hash().mul(3.14159)
      const radius = instanceIndex.add(2).hash().mul(attractionRadius1)
      
      position.xyz.assign(vec3(
        radius.mul(phi.sin().mul(theta.cos())),
        radius.mul(phi.sin().mul(theta.sin())),
        radius.mul(phi.cos())
      ))
      
      position.w.assign(instanceIndex.hash().mul(0.9).add(0.1))  // Scale
      velocity.assign(vec4(0))
    })
    
    this.initCompute = initCompute().compute(count)
    renderer.compute(this.initCompute)
    
    // Update particles
    this.updateCompute = tslFn(() => {
      const position = positionBuffer.element(instanceIndex)
      const velocity = velocityBuffer.element(instanceIndex)
      
      // Curl noise for flow field
      const noiseInput = vec4(
        position.xyz.mul(noiseCoordScale),
        timeNoise
      )
      const force = curlNoise4d(noiseInput).mul(noiseIntensity)
      velocity.xyz.addAssign(force.mul(position.w))  // Scale by particle
      
      // Attraction to center
      const toCenter = position.xyz.mul(-1)
      const dist = length(toCenter)
      const attractionStrength = smoothstep(
        attractionRadius1,
        attractionRadius2,
        dist
      )
      velocity.xyz.addAssign(
        toCenter.normalize().mul(attractionStrength).mul(0.01)
      )
      
      // Limit velocity
      velocity.xyz.assign(
        clamp(velocity.xyz, maxVelocity.negate(), maxVelocity)
      )
      
      // Update position
      position.xyz.addAssign(velocity.xyz.mul(timeDelta))
    }).compute(count)
    
    // Store buffers
    this.positionBuffer = positionBuffer
    this.velocityBuffer = velocityBuffer
  }
  
  update(delta) {
    this.uniforms.timeDelta.value = delta
    this.uniforms.timeNoise.value += delta * 0.1
    this.renderer.compute(this.updateCompute)
  }
}
```

---

## Animated Galaxy

Rotating galaxy with spiral arms using polar coordinates.

```typescript
import { Fn, timerLocal, sin, cos, vec3, vec2, length } from 'three/tsl'
import { cartesianToPolar, polarToCartesian } from './utils/coordinates'

const galaxyShader = Fn(() => {
  const time = timerLocal()
  const _uv = uv().sub(0.5).mul(2)  // Center and scale
  
  // Convert to polar
  const polar = cartesianToPolar(_uv)
  const radius = polar.x
  const angle = polar.y
  
  // Spiral arms
  const armCount = 3
  const spiralTightness = 5
  const spiralAngle = angle.add(radius.mul(spiralTightness))
  const armPattern = sin(spiralAngle.mul(armCount)).mul(0.5).add(0.5)
  
  // Rotation
  const rotationSpeed = 0.5
  const rotatedAngle = angle.add(time.mul(rotationSpeed))
  
  // Density falloff
  const density = float(1).sub(radius).pow(2)
  
  // Stars
  const starNoise = mx_noise_float(vec3(_uv.mul(50), time.mul(0.1)), 1, 0)
  const stars = step(0.98, starNoise).mul(0.5)
  
  // Color gradient
  const coreColor = vec3(1, 0.8, 0.4)  // Yellow core
  const armColor = vec3(0.4, 0.6, 1)    // Blue arms
  const spaceColor = vec3(0.05, 0.05, 0.1)  // Dark space
  
  // Combine
  const galaxyColor = mix(spaceColor, armColor, armPattern.mul(density))
  const finalColor = mix(galaxyColor, coreColor, density.pow(4))
  
  return finalColor.add(stars)
})
```

---

## Flare Gradient Effect

Multi-band gradient effect with sine wave distortion.

```typescript
import { 
  abs, Fn, oneMinus, screenSize, uv, vec3, 
  floor, sin, PI, mul, Loop, vec2 
} from 'three/tsl'
import { cosinePalette } from './utils/color/cosine_palette'
import { screenAspectUV } from './utils/function/screen_aspect_uv'
import { grainTextureEffect } from './post_processing/grain_texture_effect'

const flare = Fn(() => {
  // Aspect-corrected UVs
  const _uv = screenAspectUV(screenSize)
  const uv0 = uv().toVar()
  
  // Color accumulator
  const finalColor = vec3(0).toVar()
  
  // Palette
  const a = vec3(0.5, 0.5, 0.5)
  const b = vec3(0.5, 0.5, 0.5)
  const c = vec3(2.0, 1.0, 0.0)
  const d = vec3(0.5, 0.2, 0.25)
  
  // Y-repeated pattern
  const repetitions = 12
  const uvR = floor(_uv.y.mul(repetitions))
  
  // Sine wave distortion
  const s = sin(uv0.y.mul(PI))
  
  // Loop over bands
  Loop({ start: 0, end: repetitions }, ({ i: _i }) => {
    const f = mul(uvR.mul(_i), 0.005)
    const offsetUv = vec2(_uv.x, _uv.y.add(f).add(mul(s, 0.05)))
    
    // Radial gradient
    const r = oneMinus(abs(offsetUv.x.mul(1.5)))
      .add(abs(offsetUv.y.mul(1.5)))
    
    // Apply palette
    const col = cosinePalette(uv0.y.mul(0.25), a, b, c, d)
    
    finalColor.assign(col.mul(r))
  })
  
  // Add grain texture
  const g = grainTextureEffect(uv0).mul(0.1)
  finalColor.addAssign(g)
  
  return finalColor
})

export default flare
```

---

## Hologram Effect

Sci-fi hologram with scanlines and glitch effects.

```typescript
const hologramShader = Fn(() => {
  const time = timerLocal()
  const _uv = uv()
  
  // Base color
  const baseColor = vec3(0.2, 0.8, 1.0)  // Cyan
  
  // Scanlines
  const scanlineFreq = 200
  const scanline = sin(_uv.y.mul(scanlineFreq).add(time.mul(5)))
    .mul(0.5).add(0.5)
  const scanlineEffect = scanline.mul(0.3).add(0.7)
  
  // Flicker
  const flicker = sin(time.mul(30).add(sin(time.mul(17)))).mul(0.5).add(0.5)
  const flickerEffect = flicker.mul(0.2).add(0.8)
  
  // Vertical stripes/data
  const stripes = step(0.5, fract(_uv.x.mul(50).add(time)))
  const stripesEffect = stripes.mul(0.1)
  
  // Glitch offset
  const glitchTime = floor(time.mul(5))
  const glitchAmount = hash(glitchTime).sub(0.5).mul(0.1)
  const glitchedUV = _uv.add(vec2(glitchAmount, 0))
  
  // Edge glow
  const edgeDist = min(
    min(_uv.x, _uv.x.oneMinus()),
    min(_uv.y, _uv.y.oneMinus())
  )
  const edgeGlow = smoothstep(0.0, 0.1, edgeDist).oneMinus()
  
  // Sample model texture with glitch
  const modelColor = texture(modelTexture, glitchedUV)
  
  // Combine effects
  let color = baseColor.mul(modelColor.rgb)
  color.mulAssign(scanlineEffect)
  color.mulAssign(flickerEffect)
  color.addAssign(stripesEffect)
  color.addAssign(edgeGlow.mul(baseColor).mul(0.5))
  
  // Alpha based on model
  const alpha = modelColor.a.mul(flickerEffect)
  
  return vec4(color, alpha)
})
```

---

## Integration Example

Complete scene setup with all components:

```typescript
import * as THREE from 'three'
import { WebGPURenderer } from 'three/webgpu'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'

// Scene
const scene = new THREE.Scene()

// Camera
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
)
camera.position.set(5, 3, 5)

// Renderer
const renderer = new WebGPURenderer({ antialias: true })
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
document.body.appendChild(renderer.domElement)

// Controls
const controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping = true

// Lights
const directionalLight = new THREE.DirectionalLight('#ffffff', 3)
directionalLight.position.set(3, 2, 1)
scene.add(directionalLight)

const ambientLight = new THREE.AmbientLight('#ffffff', 0.5)
scene.add(ambientLight)

// Add your content here
// const terrain = createTerrain()
// scene.add(terrain)

// Animation loop
const clock = new THREE.Clock()

function animate() {
  const delta = clock.getDelta()
  
  // Update
  controls.update()
  
  // Render
  renderer.renderAsync(scene, camera)
  
  requestAnimationFrame(animate)
}

animate()

// Responsive
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
})
```

---

## Tips for Adapting Examples

1. **Start Simple**: Begin with basic version, add complexity gradually
2. **Adjust Parameters**: Tweak uniforms to match your needs
3. **Combine Techniques**: Mix different examples
4. **Profile Performance**: Monitor FPS, adjust quality settings
5. **Add Controls**: Use lil-gui or Leva for real-time tweaking

---

**Next**: [Best Practices](./12-Best-Practices.md)

