import { Fn, PI, atan, cos, float, pow, sin } from 'three/tsl'

import type { FloatNode } from '../../index'; 

/**
 * Smooth modulo operation that avoids hard discontinuities when wrapping values.
 *
 * Ported from Maxime Heckel's WebGPU helper utilities.
 * @param axis - Value to wrap.
 * @param amplitude - Range for the modulo operation.
 * @param radius - Smoothness factor controlling the transition width.
 */
export const smoothMod = Fn<readonly [FloatNode, FloatNode, FloatNode]>(
  ([axis, amplitude, radius]) => {
    const normalized = axis.div(amplitude)
    const top = cos(PI.mul(normalized)).mul(sin(PI.mul(normalized)))
    const bottom = pow(sin(PI.mul(normalized)), 2).add(pow(radius, 2))
    const angle = atan(top.div(bottom))

    return amplitude.mul(0.5).sub(float(1).div(PI).mul(angle))
  },
).setLayout({
  name: 'smoothMod',
  type: 'float',
  inputs: [
    { name: 'axis', type: 'float' },
    { name: 'amplitude', type: 'float', default: 1 },
    { name: 'radius', type: 'float', default: 0.1 },
  ],
})

