import { Fn, abs, float, max, min } from 'three/tsl'

import type { FloatNode } from '../../index'; 

/**
 * Smoothly blends between two distance values using a configurable smoothing factor.
 *
 * Ported from Maxime Heckel's WebGPU helper utilities.
 * @param a - First distance field value.
 * @param b - Second distance field value.
 * @param k - Controls the width of the blending range.
 */
export const smoothMin = Fn<readonly [FloatNode, FloatNode, FloatNode]>(
  ([a, b, k]) => {
    const h = max(k.sub(abs(a.sub(b))), float(0)).div(k)
    return min(a, b).sub(h.mul(h).mul(k).mul(0.25))
  },
).setLayout({
  name: 'smoothMin',
  type: 'float',
  inputs: [
    { name: 'a', type: 'float' },
    { name: 'b', type: 'float' },
    { name: 'k', type: 'float', default: 0.1 },
  ],
})

