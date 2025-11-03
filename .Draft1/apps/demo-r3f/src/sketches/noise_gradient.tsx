import { Fn, time, screenSize, vec3 } from 'three/tsl'
import { simplexNoise3d, screenAspectUV, cosinePalette } from '@aurora/tsl-kit'

/**
 * Simple noise gradient sketch demonstrating TSL utilities
 */
export const noiseGradientSketch = Fn(() => {
  const _uv = screenAspectUV(screenSize)
  
  // Sample noise with time animation
  const noise = simplexNoise3d(vec3(_uv.mul(4.0), time.mul(0.3)))
  
  // Create color palette
  const a = vec3(0.5, 0.5, 0.5)
  const b = vec3(0.5, 0.5, 0.5)
  const c = vec3(2.0, 1.0, 0.0)
  const d = vec3(0.5, 0.2, 0.25)
  
  // Apply color palette to noise
  const col = cosinePalette(noise.mul(0.5).add(0.5), a, b, c, d)
  
  return col
})



