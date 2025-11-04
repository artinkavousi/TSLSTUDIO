import {
  Fn,
  abs,
  dot,
  floor,
  fract,
  max,
  mod,
  mul,
  select,
  sub,
  vec2,
  vec3,
  vec4,
} from 'three/tsl'

import type { Vec2Node } from '../index'; 
import { permuteVec3 } from './common'; 

/**
 * 2D simplex noise implementation adapted for TSL.
 */
export const simplexNoise2d = Fn<readonly [Vec2Node]>(
  ([vInput]) => {
    const v = vec2(vInput).toVar()
    const C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439)
    const i = vec2(floor(v.add(dot(v, C.yy)))).toVar()
    const x0 = vec2(v.sub(i).add(dot(i, C.xx))).toVar()
    const i1 = vec2().toVar()
    i1.assign(select(x0.x.greaterThan(x0.y), vec2(1.0, 0.0), vec2(0.0, 1.0)))
    const x12 = vec4(x0.xyxy.add(C.xxzz)).toVar()
    x12.xy.subAssign(i1)
    i.assign(mod(i, 289.0))
    const permuted = vec3(
      permuteVec3(
        vec3(i.y).add(vec3(0.0, i1.y, 1.0)),
      )
        .add(i.x)
        .add(vec3(0.0, i1.x, 1.0)),
    ).toVar()
    const p = vec3(permuteVec3(permuted)).toVar()
    const m = vec3(
      max(
        sub(
          0.5,
          vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)),
        ),
        0.0,
      ),
    ).toVar()
    m.assign(m.mul(m))
    m.assign(m.mul(m))
    const x = vec3(mul(2.0, fract(p.mul(C.www))).sub(1.0)).toVar()
    const h = vec3(abs(x).sub(0.5)).toVar()
    const ox = vec3(floor(x.add(0.5))).toVar()
    const a0 = vec3(x.sub(ox)).toVar()
    m.mulAssign(sub(1.79284291400159, mul(0.85373472095314, a0.mul(a0).add(h.mul(h)))))
    const g = vec3().toVar()
    g.x.assign(a0.x.mul(x0.x).add(h.x.mul(x0.y)))
    g.yz.assign(a0.yz.mul(x12.xz).add(h.yz.mul(x12.yw)))

    return mul(130.0, dot(m, g))
  },
).setLayout({
  name: 'simplexNoise2d',
  type: 'float',
  inputs: [{ name: 'v', type: 'vec2' }],
})

