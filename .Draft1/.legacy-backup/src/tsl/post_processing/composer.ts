// @ts-nocheck
import { Fn, mix, uv, texture, vec3, vec4 } from 'three/tsl'
import { tonemap, TonemapCurve } from '@/tsl/post_processing/passes/tonemap'
import { vignetteEffect } from '@/tsl/post_processing/vignette_effect'
import { grainTextureEffect } from '@/tsl/post_processing/grain_texture_effect'
import { bloom as bloomPass } from '@/tsl/post_processing/passes/bloom'

export type PostPassDescriptor =
  | ['tonemap', { curve?: TonemapCurve }?]
  | ['vignette', { smoothing?: number; exponent?: number; intensity?: number }?]
  | ['grain', { amount?: number }?]
  | ['bloom', { threshold?: number; strength?: number; radius?: number }?]

/**
 * Builds a post chain effect function compatible with <PostProcessing effect={...}/>.
 */
export function makePostChain(passes: PostPassDescriptor[]) {
  return Fn(([input]) => {
    // sample the input texture once to start and preserve alpha
    const sample4 = texture(input, uv()).toVar()
    let color = sample4.xyz.toVar()
    for (const [name, params] of passes) {
      if (name === 'tonemap') {
        const curve = params?.curve ?? 'ACES'
        color = tonemap(curve)(color)
      }
      if (name === 'vignette') {
        const smoothing = params?.smoothing ?? 0.45
        const exponent = params?.exponent ?? 1.2
        const intensity = params?.intensity ?? 1.0
        const v = vignetteEffect(uv(), smoothing, exponent)
        color = color.mul(mix(1.0, v, intensity))
      }
      if (name === 'grain') {
        const amount = params?.amount ?? 0.04
        color = color.add(grainTextureEffect(uv()).mul(amount))
      }
      if (name === 'bloom') {
        const bloom = bloomPass({
          threshold: params?.threshold ?? 1.0,
          strength: params?.strength ?? 0.5,
          radius: params?.radius ?? 1.5,
        })(input)
        color = color.add(bloom)
      }
    }
    return vec4(color, sample4.w)
  })
}


