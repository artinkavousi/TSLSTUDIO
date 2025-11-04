import { float, time, uv, vec2, vec3 } from 'three/tsl'

import type { PostEffect } from '../types'; 
import { grainNode } from '../nodes/grain'; 

export interface FilmGrainOptions {
  amount?: number
  monochrome?: boolean
  timeFactor?: number
}

export function createFilmGrainEffect({ amount = 0.035, monochrome = true, timeFactor = 0.25 }: FilmGrainOptions = {}): PostEffect {
  return ({ color }) => {
    const t = time.mul(timeFactor)
    const noiseUV = uv().add(vec2(t, t.mul(1.37)))
    const noise = grainNode(noiseUV)
    const colored = monochrome
      ? vec3(noise)
      : vec3(
          noise,
          grainNode(noiseUV.add(vec2(0.5, 0.25))),
          grainNode(noiseUV.add(vec2(-0.25, 0.75))),
        )
    return color.add(colored.mul(float(amount)))
  }
}

