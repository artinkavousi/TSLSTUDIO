import { Fn, time, screenSize, vec3, vec4, length } from 'three/tsl'
import { 
  screenAspectUV, 
  curlNoise4d,
  cosinePalette 
} from '@aurora/tsl-kit'

/**
 * Curl noise flow field visualization
 */
export const curlFlowSketch = Fn(() => {
  const uv = screenAspectUV(screenSize)
  
  // Sample 4D curl noise for animated flow
  const pos4d = vec4(uv.mul(2.0), time.mul(0.3), 0.0)
  const curl = curlNoise4d(pos4d)
  
  // Visualize flow direction and magnitude
  const flowMag = length(curl)
  const flowDir = curl.normalize()
  
  // Create color based on flow direction
  const t = flowDir.x.mul(0.5).add(0.5).add(time.mul(0.1))
  const a = vec3(0.5, 0.5, 0.5)
  const b = vec3(0.5, 0.5, 0.5)
  const c = vec3(1.0, 0.7, 0.4)
  const d = vec3(0.0, 0.15, 0.2)
  const baseCol = cosinePalette(t, a, b, c, d)
  
  // Modulate by flow magnitude
  const col = baseCol.mul(flowMag.mul(2.0).add(0.5))
  
  return col
})



