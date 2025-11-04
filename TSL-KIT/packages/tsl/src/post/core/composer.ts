import { Fn, mix, texture, uv, vec3, vec4 } from 'three/tsl'

import type { PostEffect } from '../types'; 
import { bloom as bloomPass } from '../passes/bloom';
import { grainTextureEffect } from '../effects/grain_texture_effect'; 
import { vignetteEffect } from '../effects/vignette_effect'; 
import { tonemap, type TonemapCurve } from '../passes/tonemap'; 

export type PostPassDescriptor =
  | ['tonemap', { curve?: TonemapCurve }?]
  | ['vignette', { smoothing?: number; exponent?: number; intensity?: number }?]
  | ['grain', { amount?: number }?]
  | ['bloom', { threshold?: number; strength?: number; radius?: number }?]

export function makePostChain(passes: PostPassDescriptor[]): PostEffect {
  return ({ color, input }) => {
    const sample4 = texture(input, uv()).toVar()
    let current = color ?? sample4.xyz.toVar()

    for (const [name, params] of passes) {
      if (name === 'tonemap') {
        const curve = params?.curve ?? 'ACES'
        current = tonemap(curve)(current)
      }

      if (name === 'vignette') {
        const smoothing = params?.smoothing ?? 0.45
        const exponent = params?.exponent ?? 1.2
        const intensity = params?.intensity ?? 1
        const vignette = vignetteEffect([uv(), smoothing, exponent])
        current = current.mul(mix(1, vignette, intensity))
      }

      if (name === 'grain') {
        const amount = params?.amount ?? 0.04
        current = current.add(vec3(grainTextureEffect([uv()])).mul(amount))
      }

      if (name === 'bloom') {
        const bloom = bloomPass({
          threshold: params?.threshold ?? 1,
          strength: params?.strength ?? 0.5,
          radius: params?.radius ?? 1.5,
        })(input)
        current = current.add(bloom)
      }
    }

    return vec4(current, sample4.w)
  }
}

