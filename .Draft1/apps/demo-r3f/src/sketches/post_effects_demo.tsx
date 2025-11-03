import { Fn, uv, time, vec3, sin, cos } from 'three/tsl'
import { 
  grainTextureEffect,
  vignetteEffect,
  cosinePalette 
} from '@aurora/tsl-kit'

/**
 * Post-processing effects demo
 * This demonstrates combining base rendering with post effects
 */
export const postEffectsDemoSketch = Fn(() => {
  const _uv = uv()
  
  // Create animated gradient
  const t = _uv.x.add(_uv.y).add(time.mul(0.2))
  const a = vec3(0.5, 0.5, 0.5)
  const b = vec3(0.5, 0.5, 0.5)
  const c = vec3(2.0, 1.0, 0.5)
  const d = vec3(0.5, 0.2, 0.25)
  const col = cosinePalette(t, a, b, c, d)
  
  // Add animated pattern
  const pattern = sin(_uv.x.mul(20.0).add(time.mul(2.0)))
    .mul(cos(_uv.y.mul(20.0).add(time.mul(1.5))))
    .mul(0.1)
    .add(1.0)
  
  const baseCol = col.mul(pattern)
  
  // Apply post effects
  const grain = grainTextureEffect(_uv.add(time.mul(0.1))).mul(0.05)
  const vignette = vignetteEffect(_uv.sub(0.5), 0.4, 1.5)
  
  return baseCol.mul(vignette).add(grain)
})



