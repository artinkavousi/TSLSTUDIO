// @ts-nocheck
import { Fn, texture, uv, vec4 } from 'three/tsl'
import type { FramegraphExecutionContext } from '@engine/core/framegraph'
import type { PostEffect } from './types'

export function composeEffects(effects: PostEffect[], context: FramegraphExecutionContext) {
  return Fn(([input]) => {
    const sample = texture(input, uv()).toVar()
    let color = sample.xyz.toVar()

    for (const effect of effects) {
      color = effect({
        color,
        input,
        resources: context.resources,
        frame: context.frame,
        size: context.size,
      })
    }

    return vec4(color, sample.w)
  })
}



