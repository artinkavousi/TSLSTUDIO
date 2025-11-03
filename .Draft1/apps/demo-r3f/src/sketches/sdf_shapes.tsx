import { Fn, time, screenSize, vec3, float, mix, smoothstep } from 'three/tsl'
import { 
  screenAspectUV, 
  sdSphere, 
  sdBox2d, 
  sdHexagon,
  smin,
  cosinePalette 
} from '@aurora/tsl-kit'

/**
 * SDF shapes demo with smooth blending
 */
export const sdfShapesSketch = Fn(() => {
  const uv = screenAspectUV(screenSize)
  
  // Animate positions
  const offset1 = vec3(time.mul(0.5).sin().mul(0.3), time.mul(0.3).cos().mul(0.2), 0)
  const offset2 = vec3(time.mul(0.4).cos().mul(0.25), time.mul(0.5).sin().mul(0.25), 0)
  
  // Create multiple shapes
  const sphere = sdSphere(uv.add(offset1.xy), float(0.2))
  const box = sdBox2d(uv.sub(offset2.xy), float(0.15))
  const hex = sdHexagon(uv, float(0.3))
  
  // Smooth blend shapes
  const blended = smin(smin(sphere, box, float(0.1)), hex, float(0.15))
  
  // Create colored result
  const edge = smoothstep(float(0.02), float(0.0), blended)
  const glow = smoothstep(float(0.1), float(0.0), blended).mul(0.5)
  
  // Color palette based on distance
  const t = blended.mul(5.0).add(time.mul(0.2))
  const a = vec3(0.5, 0.5, 0.5)
  const b = vec3(0.5, 0.5, 0.5)
  const c = vec3(1.0, 1.0, 0.5)
  const d = vec3(0.0, 0.1, 0.2)
  const col = cosinePalette(t, a, b, c, d)
  
  return mix(col.mul(glow), vec3(1.0), edge)
})



