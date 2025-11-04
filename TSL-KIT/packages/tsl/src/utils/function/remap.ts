import { Fn, clamp } from 'three/tsl'

import type { FloatNode } from '../../index'; 

/**
 * Remaps a value from one range into another with clamping at the target bounds.
 *
 * Ported from Maxime Heckel's WebGPU helper utilities.
 * @param value - Value to remap.
 * @param inMin - Source range minimum.
 * @param inMax - Source range maximum.
 * @param outMin - Target range minimum.
 * @param outMax - Target range maximum.
 */
export const remap = Fn<readonly [FloatNode, FloatNode, FloatNode, FloatNode, FloatNode]>(
  ([value, inMin, inMax, outMin, outMax]) => {
    const mapped = value.sub(inMin).mul(outMax.sub(outMin)).div(inMax.sub(inMin)).add(outMin)
    return clamp(mapped, outMin, outMax)
  },
).setLayout({
  name: 'remap',
  type: 'float',
  inputs: [
    { name: 'value', type: 'float' },
    { name: 'inMin', type: 'float' },
    { name: 'inMax', type: 'float' },
    { name: 'outMin', type: 'float' },
    { name: 'outMax', type: 'float' },
  ],
})

