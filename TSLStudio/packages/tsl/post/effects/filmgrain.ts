// @ts-nocheck
import { uv, vec2, vec3, time, float } from 'three/tsl'
import type { PostEffect } from '../types'
import { grainNode } from '../nodes/grain'

export type FilmGrainOptions = {
  amount?: number
  monochrome?: boolean
  timeFactor?: number
}

export function createFilmGrainEffect({ amount = 0.035, monochrome = true, timeFactor = 0.25 }: FilmGrainOptions = {}): PostEffect {
  const grain = grainNode
  return ({ color }) => {
    const t = time.mul(timeFactor)
    const noiseUV = uv().add(vec2(t, t.mul(1.37)))
    const noise = grain(noiseUV)
    const grainVec = monochrome ? vec3(noise) : vec3(noise, grain(noiseUV.add(vec2(0.5, 0.25))), grain(noiseUV.add(vec2(-0.25, 0.75))))
    return color.add(grainVec.mul(float(amount)))
  }
}



