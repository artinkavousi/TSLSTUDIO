# API Reference

## TSL Noise Functions

### simplexNoise3d(v: vec3): float
3D simplex noise function.
- **v**: Input 3D vector
- **Returns**: Noise value in range [-1, 1]

### simplexNoise4d(v: vec4): float
4D simplex noise function.
- **v**: Input 4D vector
- **Returns**: Noise value in range [-1, 1]

### perlinNoise3d(P: vec3): float
3D Perlin noise function.
- **P**: Input 3D vector
- **Returns**: Noise value (normalized)

### curlNoise3d(input: vec3): vec3
3D curl noise for divergence-free vector fields.
- **input**: Input 3D position
- **Returns**: 3D curl noise vector

### curlNoise4d(input: vec4): vec3
4D curl noise with time dimension.
- **input**: Input 4D vector (xyz + time)
- **Returns**: 3D curl noise vector

### fbm(p: vec3, octaves?: float, frequency?: float, amplitude?: float, lacunarity?: float, gain?: float): float
Fractional Brownian Motion.
- **p**: Input position
- **octaves**: Number of noise octaves (default: 4.0)
- **frequency**: Base frequency (default: 1.0)
- **amplitude**: Base amplitude (default: 1.0)
- **lacunarity**: Frequency multiplier (default: 2.0)
- **gain**: Amplitude multiplier (default: 0.5)
- **Returns**: Combined noise value

### ridgedFbm(...): float
Ridged variant of FBM with sharp ridges.
Same parameters as `fbm`.

### domainWarpedFbm(..., warpStrength?: float): float
Domain-warped FBM that uses noise to warp input coordinates.
- **warpStrength**: Strength of warping (default: 0.1)
- Other parameters same as `fbm`

### turbulence(p: vec2, time: float, num?: float, amp?: float, speed?: float, freq?: float, exp?: float): vec2
Turbulence distortion function.
- **p**: Input 2D position
- **time**: Animation time
- **num**: Number of octaves (default: 10.0)
- **amp**: Amplitude (default: 0.7)
- **speed**: Animation speed (default: 0.3)
- **freq**: Frequency (default: 2.0)
- **exp**: Exponent (default: 1.4)
- **Returns**: Distorted position

## SDF Functions

### sdSphere(uv: vec2, r?: float): float
Sphere signed distance field.
- **uv**: UV coordinates
- **r**: Radius (default: 0.0)
- **Returns**: Signed distance

### sdBox2d(uv: vec2, size?: float): float
2D box SDF.
- **uv**: UV coordinates
- **size**: Half-size (default: 0.0)
- **Returns**: Signed distance

### sdBox3d(p: vec3, b: vec3): float
3D box SDF.
- **p**: 3D position
- **b**: Box half-extents
- **Returns**: Signed distance

### sdHexagon(p?: vec2, r?: float): float
Regular hexagon SDF.
- **p**: Position (default: vec2(0))
- **r**: Radius (default: 0.5)
- **Returns**: Signed distance

### sdDiamond(uv: vec2, r?: float): float
Diamond/rhombus SDF.
- **uv**: UV coordinates
- **r**: Radius (default: 0.0)
- **Returns**: Signed distance

### sdRing(uv: vec2, s?: float): float
Ring/circle outline SDF.
- **uv**: UV coordinates
- **s**: Radius (default: 0.4)
- **Returns**: Signed distance

### smin(a: float, b: float, factor: float): float
Smooth minimum for blending SDFs.
- **a**: First distance
- **b**: Second distance
- **factor**: Smoothing factor
- **Returns**: Blended distance

### smax(a: float, b: float, k?: float): float
Smooth maximum for blending SDFs.
- **a**: First distance
- **b**: Second distance
- **k**: Smoothing factor (default: 0.0)
- **Returns**: Blended distance

## Color Functions

### cosinePalette(t: float, a: vec3, b: vec3, c: vec3, d: vec3, e?: float): vec3
Procedural color palette using cosine function.
- **t**: Input parameter (typically 0-1)
- **a**: Base color offset
- **b**: Color amplitude
- **c**: Color frequency
- **d**: Phase offset
- **e**: Cosine scalar (default: 6.28318)
- **Returns**: RGB color

### acesTonemap(color: vec3): vec3
ACES filmic tonemapping.
- **color**: Input HDR color
- **Returns**: Tonemapped LDR color

### reinhardTonemap(color: vec3): vec3
Reinhard tonemapping.
- **color**: Input HDR color
- **Returns**: Tonemapped LDR color

### uncharted2Tonemap(color: vec3): vec3
Uncharted 2 filmic tonemapping.
- **color**: Input HDR color
- **Returns**: Tonemapped LDR color

### cinematicTonemap(color: vec3): vec3
Cinematic S-curve tonemapping.
- **color**: Input color
- **Returns**: Tonemapped color

## Math Functions

### complexMul(a: vec2, b: vec2): vec2
Complex number multiplication.
- **a, b**: Complex numbers as vec2
- **Returns**: Product

### complexDiv(a: vec2, b: vec2): vec2
Complex number division.
- **a, b**: Complex numbers as vec2
- **Returns**: Quotient

### complexPow(v: vec2, p: float): vec2
Complex number power.
- **v**: Base complex number
- **p**: Real exponent
- **Returns**: Result

### complexSin(a: vec2): vec2
Complex sine function.
- **a**: Complex number
- **Returns**: sin(a)

### complexCos(a: vec2): vec2
Complex cosine function.
- **a**: Complex number
- **Returns**: cos(a)

### asPolar(z: vec2): vec2
Convert complex number to polar form.
- **z**: Complex number (x, y)
- **Returns**: Polar form (radius, angle)

### cartesianToPolar(p: vec2): vec2
Convert Cartesian to polar coordinates.
- **p**: Cartesian coordinates
- **Returns**: Polar coordinates (radius, angle)

### polarToCartesian(p: vec2): vec2
Convert polar to Cartesian coordinates.
- **p**: Polar coordinates (radius, angle)
- **Returns**: Cartesian coordinates

## Screen/UV Functions

### screenAspectUV(r: vec2, range?: float): vec2
Aspect-corrected UV coordinates.
- **r**: Screen size (typically screenSize)
- **range**: UV range (default: 0.5)
- **Returns**: Aspect-corrected UVs centered at origin

## Post-Processing Effects

### grainTextureEffect(uv: vec2): float
Film grain effect.
- **uv**: UV coordinates (animate for variation)
- **Returns**: Grain value

### vignetteEffect(uv: vec2, smoothing?: float, exponent?: float): float
Vignette darkening effect.
- **uv**: UV coordinates (centered)
- **smoothing**: Edge smoothing (default: 0.45)
- **exponent**: Falloff exponent (default: 1.2)
- **Returns**: Vignette multiplier

### lcdEffect(props): float
LCD/CRT screen effect.
- **props.resolution**: Render resolution (default: screenSize)
- **props.scalar**: Pattern density (default: 10)
- **props.zoom**: Element size (default: 2.1)
- **props.exponent**: Edge sharpness (default: 1.8)
- **props.edge**: Pattern threshold (default: 0.2)
- **Returns**: LCD pattern value

### pixellationEffect(uv: vec2, size?: float): vec2
Pixellation effect.
- **uv**: UV coordinates
- **size**: Pixel size (default: 20.0)
- **Returns**: Pixellated UV

## Lighting Functions

### fresnel(viewDir: vec3, normal: vec3, p?: float): float
Fresnel effect.
- **viewDir**: View direction
- **normal**: Surface normal
- **p**: Exponent (default: 2)
- **Returns**: Fresnel term

### hemi(normal: vec3, groundColor: vec3, skyColor: vec3): vec3
Hemispheric lighting.
- **normal**: Surface normal
- **groundColor**: Ground hemisphere color
- **skyColor**: Sky hemisphere color
- **Returns**: Mixed color

### diffuse(lightDir: vec3, normal: vec3, lightColor: vec3): vec3
Diffuse lighting (Lambert).
- **lightDir**: Light direction
- **normal**: Surface normal
- **lightColor**: Light color
- **Returns**: Diffuse color

### phongSpecular(viewDir: vec3, normal: vec3, lightDir: vec3, p?: float): vec3
Phong specular lighting.
- **viewDir**: View direction
- **normal**: Surface normal
- **lightDir**: Light direction
- **p**: Phong exponent (default: 32)
- **Returns**: Specular color

## React Components

### WebGPUScene
Canvas wrapper with WebGPU renderer.

**Props:**
- `debug?: boolean` - Show stats overlay
- `frameloop?: 'always' | 'demand' | 'never'` - Render loop mode
- `children: ReactNode` - Scene content

### WebGPUSketch
Fullscreen sketch component for TSL shaders.

**Props:**
- `colorNode?: NodeRepresentation` - TSL color node
- `onFrame?: (material, state) => void` - Frame callback
- `children?: ReactNode` - Custom children

### PostProcessing
Post-processing effect wrapper.

**Props:**
- `effect: () => any` - Post-processing effect function

**Usage:**
```typescript
<PostProcessing effect={() => vignetteEffect(uv().sub(0.5))} />
```

## Constants

From `three/tsl`:
- `time` - Current time in seconds
- `uv()` - Current fragment UV coordinates  
- `screenSize` - Current viewport size
- `EPSILON` - Small value for numerical operations
- `PI` - Pi constant


