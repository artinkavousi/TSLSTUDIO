import {
  Fn,
  abs,
  dot,
  float,
  floor,
  fract,
  lessThan,
  mod,
  mul,
  overloadingFn,
  sub,
  vec3,
  vec4,
} from 'three/tsl'

import type { FloatNode, Vec3Node, Vec4Node } from '../index'; 

const MOD_VALUE = 289.0

/**
 * Modulo helper used by multiple noise implementations (vec3 overload).
 */
export const mod289Vec3 = Fn<readonly [Vec3Node]>(
  ([x]) => {
    const value = vec3(x).toVar()

    return value.sub(floor(value.mul(1.0 / MOD_VALUE)).mul(MOD_VALUE))
  },
).setLayout({
  name: 'mod289Vec3',
  type: 'vec3',
  inputs: [{ name: 'x', type: 'vec3' }],
})

/**
 * Modulo helper used by multiple noise implementations (vec4 overload).
 */
export const mod289Vec4 = Fn<readonly [Vec4Node]>(
  ([x]) => {
    const value = vec4(x).toVar()

    return value.sub(floor(value.mul(1.0 / MOD_VALUE)).mul(MOD_VALUE))
  },
).setLayout({
  name: 'mod289Vec4',
  type: 'vec4',
  inputs: [{ name: 'x', type: 'vec4' }],
})

export const mod289 = overloadingFn([mod289Vec3, mod289Vec4])

/**
 * Permutes a three-component vector using the classic 34x + 1 polynomial.
 */
export const permuteVec3 = Fn<readonly [Vec3Node]>(
  ([x]) => {
    const v = vec3(x).toVar()

    return mod(v.mul(34.0).add(1.0).mul(v), MOD_VALUE)
  },
).setLayout({
  name: 'permuteVec3',
  type: 'vec3',
  inputs: [{ name: 'x', type: 'vec3' }],
})

/**
 * Permutes a four-component vector using the classic 34x + 1 polynomial.
 */
export const permuteVec4 = Fn<readonly [Vec4Node]>(
  ([x]) => {
    const v = vec4(x).toVar()

    return mod(v.mul(34.0).add(1.0).mul(v), MOD_VALUE)
  },
).setLayout({
  name: 'permuteVec4',
  type: 'vec4',
  inputs: [{ name: 'x', type: 'vec4' }],
})

/**
 * Permutes scalar or vector inputs.
 */
export const permute = overloadingFn([permuteVec3, permuteVec4])

/**
 * 3D fade curve used by Perlin noise.
 */
export const fadeVec3 = Fn<readonly [Vec3Node]>(
  ([t]) => {
    const value = vec3(t).toVar()

    return value.mul(value).mul(value).mul(value.mul(value.mul(6.0).sub(15.0)).add(10.0))
  },
).setLayout({
  name: 'fadeVec3',
  type: 'vec3',
  inputs: [{ name: 't', type: 'vec3' }],
})

/**
 * Taylor inverse square root approximation for vec4 inputs.
 */
export const taylorInvSqrtVec4 = Fn<readonly [Vec4Node]>(
  ([r]) => vec4(1.79284291400159).sub(vec4(r).mul(0.85373472095314)),
).setLayout({
  name: 'taylorInvSqrtVec4',
  type: 'vec4',
  inputs: [{ name: 'r', type: 'vec4' }],
})

/**
 * 1D Taylor inverse square root helper.
 */
export const taylorInvSqrtFloat = Fn<readonly [FloatNode]>(
  ([r]) => float(1.79284291400159).sub(float(r).mul(0.85373472095314)),
).setLayout({
  name: 'taylorInvSqrtFloat',
  type: 'float',
  inputs: [{ name: 'r', type: 'float' }],
})

export const taylorInvSqrt = taylorInvSqrtVec4
export const taylorInvSqrtScalar = taylorInvSqrtFloat
export const fade = fadeVec3

/**
 * 4D gradient helper used by simplex noise.
 */
export const grad4 = Fn<readonly [FloatNode, Vec4Node]>(
  ([jInput, ipInput]) => {
    const ip = vec4(ipInput).toVar()
    const j = float(jInput).toVar()
    const ones = vec4(1.0, 1.0, 1.0, -1.0)
    const p = vec4().toVar()
    const s = vec4().toVar()

    const g = fract(vec3(j).mul(ip.xyz))
    p.xyz.assign(floor(g.mul(7.0)).mul(ip.z).sub(1.0))
    p.w.assign(1.5 - dot(abs(p.xyz), ones.xyz))
    s.assign(vec4(lessThan(p, vec4(0.0))))
    p.xyz.assign(p.xyz.add(s.xyz.mul(2.0).sub(1.0).mul(s.www)))

    return p
  },
).setLayout({
  name: 'grad4',
  type: 'vec4',
  inputs: [
    { name: 'j', type: 'float' },
    { name: 'ip', type: 'vec4' },
  ],
})

