import type { Vector2 } from 'three'
import { Fn, texture, uv, vec4 } from 'three/tsl'

import type { EffectResources, PostEffect } from '../types'; 

export interface EffectComposeContext {
  resources: EffectResources
  frame: number
  size: Vector2
}

export function composeEffects(effects: PostEffect[], context: EffectComposeContext) {
  return Fn(([input]) => {
    const sample = texture(input, uv()).toVar()
    const color = sample.xyz.toVar()

    let current = color
    for (const effect of effects) {
      current = effect({
        color: current,
        input,
        resources: context.resources,
        frame: context.frame,
        size: context.size,
      })
    }

    return vec4(current, sample.w)
  })
}

