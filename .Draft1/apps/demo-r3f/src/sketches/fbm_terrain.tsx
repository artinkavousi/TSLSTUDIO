import { Fn, time, screenSize, vec3, mix } from 'three/tsl'
import { 
  screenAspectUV, 
  fbm,
  ridgedFbm,
  domainWarpedFbm 
} from '@aurora/tsl-kit'

/**
 * FBM terrain demo with multiple noise variations
 */
export const fbmTerrainSketch = Fn(() => {
  const uv = screenAspectUV(screenSize)
  
  // Animated position
  const pos = vec3(uv.mul(3.0), time.mul(0.1))
  
  // Sample different FBM variations
  const noise1 = fbm(pos, 5, 1.0, 1.0, 2.0, 0.5)
  const noise2 = ridgedFbm(pos.add(vec3(100.0)), 4, 1.0, 1.0, 2.0, 0.5)
  const noise3 = domainWarpedFbm(pos.add(vec3(200.0)), 3, 1.0, 1.0, 2.0, 0.5, 0.5)
  
  // Combine noises for terrain-like appearance
  const terrain = noise1.mul(0.5).add(noise2.mul(0.3)).add(noise3.mul(0.2))
  
  // Color based on height
  const low = vec3(0.1, 0.2, 0.4)    // Deep blue
  const mid = vec3(0.2, 0.5, 0.3)    // Green
  const high = vec3(0.8, 0.8, 0.9)   // Snow white
  
  const col1 = mix(low, mid, terrain.mul(0.5).add(0.5).smoothstep(0.3, 0.5))
  const col2 = mix(col1, high, terrain.mul(0.5).add(0.5).smoothstep(0.6, 0.8))
  
  return col2
})



