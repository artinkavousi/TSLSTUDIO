import { Fn, time, screenSize, vec2, vec3, length } from 'three/tsl'
import { 
  screenAspectUV,
  complexMul,
  complexPow,
  complexSin,
  asPolar,
  cosinePalette
} from '@aurora/tsl-kit'

/**
 * Complex number mathematics visualization
 * Creates fractal-like patterns using complex operations
 */
export const complexMathSketch = Fn(() => {
  const uv = screenAspectUV(screenSize)
  
  // Start with UV as complex number
  let z = vec2(uv).toVar()
  
  // Animate with time
  const c = vec2(time.mul(0.2).sin().mul(0.5), time.mul(0.3).cos().mul(0.5))
  
  // Apply complex operations
  z.assign(complexMul(z, vec2(1.2, 0.3)))
  z.assign(complexPow(z, 2.0))
  z.assign(complexSin(z))
  z.assign(z.add(c))
  
  // Get polar form for coloring
  const polar = asPolar(z)
  const r = polar.x
  const theta = polar.y
  
  // Create color from angle and radius
  const t = theta.div(6.28318).add(time.mul(0.1))
  const a = vec3(0.5, 0.5, 0.5)
  const b = vec3(0.5, 0.5, 0.5)
  const c1 = vec3(1.0, 1.0, 0.5)
  const d = vec3(0.3, 0.2, 0.2)
  const col = cosinePalette(t, a, b, c1, d)
  
  // Modulate by radius
  const modulated = col.mul(r.mul(0.5).add(0.5).clamp(0.0, 1.0))
  
  return modulated
})



