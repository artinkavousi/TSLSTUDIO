import { Fn, add, float, sin, time, vec3 } from 'three/tsl'

import type { FloatNode, Vec3Node } from '../index'; 

export interface NoiseParams {
  offset?: Vec3Node
  scale?: FloatNode
}

export const timeOffset = Fn<readonly [FloatNode, FloatNode]>(
  ([base, speed]) => base.add(time.mul(speed)),
).setLayout({
  name: 'timeOffset',
  type: 'float',
  inputs: [
    { name: 'base', type: 'float' },
    { name: 'speed', type: 'float' },
  ],
})

export const waveMotion = Fn<readonly [Vec3Node, FloatNode, FloatNode, FloatNode]>(
  ([direction, amplitude, frequency, phase]) => {
    const t = time.mul(frequency).add(phase)
    return direction.normalize().mul(sin(t).mul(amplitude))
  },
).setLayout({
  name: 'waveMotion',
  type: 'vec3',
  inputs: [
    { name: 'direction', type: 'vec3' },
    { name: 'amplitude', type: 'float' },
    { name: 'frequency', type: 'float' },
    { name: 'phase', type: 'float' },
  ],
})


