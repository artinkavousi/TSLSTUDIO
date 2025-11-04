import {
  Fn,
  abs,
  clamp,
  float,
  length,
  max,
  min,
  sqrt,
  step,
  vec2,
  vec3,
} from 'three/tsl'

import type { FloatNode, Vec3Node } from '../../../index'; 

/**
 * Signed distance to a square pyramid with the base on the XZ plane.
 *
 * This implementation is adapted from Inigo Quilez' analytical SDFs and supports
 * configurable height and base half-extent.
 */
export const sdPyramid = Fn<readonly [Vec3Node, FloatNode?, FloatNode?]>(
  ([pointInput, heightInput, baseHalfInput]) => {
    const baseHalf = baseHalfInput ?? float(0.5)
    const safeBase = max(baseHalf, float(1e-4))
    const height = heightInput ?? float(1)

    const scale = float(0.5).div(safeBase)
    const invScale = float(1).div(scale)

    const p = vec3(pointInput).mul(scale).toVar()
    const h = height.mul(scale)

    const absX = abs(p.x)
    const absZ = abs(p.z)

    const px = max(absX, absZ)
    const pz = min(absX, absZ)

    const pxShifted = px.sub(float(0.5)).toVar()
    const pzShifted = pz.sub(float(0.5)).toVar()

    const m2 = h.mul(h).add(float(0.25))

    const qx = pzShifted
    const qy = h.mul(p.y).sub(float(0.5).mul(pxShifted))
    const qz = h.mul(p.y).add(float(0.5).mul(pxShifted))

    const s = max(float(0).sub(qx), float(0))
    const kx = qx.add(s).toVar()
    const t = clamp(qy.sub(float(0.5).mul(qx)).div(m2), float(0), h)
    const ky = qy.sub(m2.mul(t)).toVar()
    const yz = qz.sub(h.mul(t)).toVar()

    const kMax = max(kx, ky).toVar()
    const kClamped = vec2(max(kx, float(0)), max(ky, float(0)))
    const d = length(kClamped).add(min(kMax, float(0)))
    const e = length(vec2(yz, kx))

    const signYz = float(2).mul(step(float(0), yz)).sub(float(1))
    const resultScaled = min(kMax, float(0)).add(signYz.mul(sqrt(d.mul(d).add(e.mul(e)))))

    return resultScaled.mul(invScale)
  },
).setLayout({
  name: 'sdPyramid',
  type: 'float',
  inputs: [
    { name: 'point', type: 'vec3' },
    { name: 'height', type: 'float', default: 1 },
    { name: 'baseHalf', type: 'float', default: 0.5 },
  ],
}) satisfies FloatNode


