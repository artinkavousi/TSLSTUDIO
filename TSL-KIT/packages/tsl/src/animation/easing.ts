import { Fn, float, smoothstep, step } from 'three/tsl'

import type { FloatNode } from '../index'; 

const clamp01 = (value: FloatNode) => value.clamp(float(0), float(1))

export const easeInQuad = Fn<readonly [FloatNode]>(
  ([t]) => clamp01(t).mul(clamp01(t)),
).setLayout({
  name: 'easeInQuad',
  type: 'float',
  inputs: [{ name: 't', type: 'float' }],
})

export const easeOutQuad = Fn<readonly [FloatNode]>(
  ([t]) => {
    const x = clamp01(t)
    const inv = float(1).sub(x)
    return float(1).sub(inv.mul(inv))
  },
).setLayout({
  name: 'easeOutQuad',
  type: 'float',
  inputs: [{ name: 't', type: 'float' }],
})

export const easeInOutCubic = Fn<readonly [FloatNode]>(
  ([t]) => {
    const x = clamp01(t).toVar()
    const first = float(4).mul(x.mul(x).mul(x))
    const second = float(1)
      .sub(float(-2).mul(x).add(float(2)).pow(float(3)).div(float(2)))
    const mask = step(float(0.5), x)
    return first.mul(float(1).sub(mask)).add(second.mul(mask))
  },
).setLayout({
  name: 'easeInOutCubic',
  type: 'float',
  inputs: [{ name: 't', type: 'float' }],
})

export const smootherStep = Fn<readonly [FloatNode]>(
  ([t]) => {
    const x = clamp01(t)
    return x.mul(x).mul(x.mul(x.mul(float(6)).sub(float(15))).add(float(10)))
  },
).setLayout({
  name: 'smootherStep',
  type: 'float',
  inputs: [{ name: 't', type: 'float' }],
})

export const smoothStep01 = Fn<readonly [FloatNode]>(
  ([t]) => smoothstep(float(0), float(1), clamp01(t)),
).setLayout({
  name: 'smoothStep01',
  type: 'float',
  inputs: [{ name: 't', type: 'float' }],
})


