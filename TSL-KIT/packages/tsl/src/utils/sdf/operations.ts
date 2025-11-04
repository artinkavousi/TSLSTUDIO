import { Fn, clamp, cos, float, max, min, mix, sin, vec3 } from 'three/tsl'

import type { FloatNode, Vec3Node } from '../../index'; 

/**
 * Hard union between two distance fields.
 */
export const union = Fn<readonly [FloatNode, FloatNode]>(
  ([a, b]) => min(a, b),
).setLayout({
  name: 'union',
  type: 'float',
  inputs: [
    { name: 'a', type: 'float' },
    { name: 'b', type: 'float' },
  ],
})

/**
 * Hard subtraction (difference) between two distance fields.
 */
export const subtraction = Fn<readonly [FloatNode, FloatNode]>(
  ([a, b]) => max(a, b.negate()),
).setLayout({
  name: 'subtraction',
  type: 'float',
  inputs: [
    { name: 'a', type: 'float' },
    { name: 'b', type: 'float' },
  ],
})

/**
 * Hard intersection between two distance fields.
 */
export const intersection = Fn<readonly [FloatNode, FloatNode]>(
  ([a, b]) => max(a, b),
).setLayout({
  name: 'intersection',
  type: 'float',
  inputs: [
    { name: 'a', type: 'float' },
    { name: 'b', type: 'float' },
  ],
})

/**
 * Smooth union blend between two distance fields.
 */
export const smoothUnion = Fn<readonly [FloatNode, FloatNode, FloatNode]>(
  ([a, b, k]) => {
    const h = clamp(float(0.5).add(float(0.5).mul(b.sub(a).div(k))), 0.0, 1.0)
    return mix(b, a, h).sub(k.mul(h).mul(float(1).sub(h)))
  },
).setLayout({
  name: 'smoothUnion',
  type: 'float',
  inputs: [
    { name: 'a', type: 'float' },
    { name: 'b', type: 'float' },
    { name: 'k', type: 'float', default: 0.1 },
  ],
})

/**
 * Smooth subtraction (a \ b) blend between two distance fields.
 */
export const smoothSubtraction = Fn<readonly [FloatNode, FloatNode, FloatNode]>(
  ([a, b, k]) => {
    const h = clamp(float(0.5).sub(float(0.5).mul(b.add(a).div(k))), 0.0, 1.0)
    return mix(a, b.negate(), h).add(k.mul(h).mul(float(1).sub(h)))
  },
).setLayout({
  name: 'smoothSubtraction',
  type: 'float',
  inputs: [
    { name: 'a', type: 'float' },
    { name: 'b', type: 'float' },
    { name: 'k', type: 'float', default: 0.1 },
  ],
})

/**
 * Smooth intersection blend between two distance fields.
 */
export const smoothIntersection = Fn<readonly [FloatNode, FloatNode, FloatNode]>(
  ([a, b, k]) => {
    const h = clamp(float(0.5).sub(float(0.5).mul(b.sub(a).div(k))), 0.0, 1.0)
    return mix(b, a, h).add(k.mul(h).mul(float(1).sub(h)))
  },
).setLayout({
  name: 'smoothIntersection',
  type: 'float',
  inputs: [
    { name: 'a', type: 'float' },
    { name: 'b', type: 'float' },
    { name: 'k', type: 'float', default: 0.1 },
  ],
})

/**
 * Applies a displacement amount to a distance field.
 */
export const displace = Fn<readonly [FloatNode, FloatNode]>(
  ([distance, amount]) => distance.add(amount),
).setLayout({
  name: 'displace',
  type: 'float',
  inputs: [
    { name: 'distance', type: 'float' },
    { name: 'amount', type: 'float' },
  ],
})

/**
 * Twists a point around the Y axis by a strength factor.
 */
export const twist = Fn<readonly [Vec3Node, FloatNode]>(
  ([pointInput, strength]) => {
    const point = vec3(pointInput).toVar()
    const angle = strength.mul(point.y)
    const c = cos(angle)
    const s = sin(angle)

    return vec3(
      point.x.mul(c).sub(point.z.mul(s)),
      point.y,
      point.x.mul(s).add(point.z.mul(c)),
    )
  },
).setLayout({
  name: 'twist',
  type: 'vec3',
  inputs: [
    { name: 'point', type: 'vec3' },
    { name: 'strength', type: 'float' },
  ],
})

/**
 * Bends geometry around the Z axis with a configurable radius.
 */
export const bend = Fn<readonly [Vec3Node, FloatNode]>(
  ([pointInput, radiusInput]) => {
    const point = vec3(pointInput).toVar()
    const radius = float(radiusInput).toVar()
    const theta = point.x.div(radius)
    const c = cos(theta)
    const s = sin(theta)

    return vec3(
      radius.mul(s),
      point.y,
      radius.mul(float(1).sub(c)).add(point.z),
    )
  },
).setLayout({
  name: 'bend',
  type: 'vec3',
  inputs: [
    { name: 'point', type: 'vec3' },
    { name: 'radius', type: 'float' },
  ],
})

