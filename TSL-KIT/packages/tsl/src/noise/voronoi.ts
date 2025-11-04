import {
  Fn,
  If,
  Loop,
  add,
  dot,
  float,
  floor,
  fract,
  int,
  length,
  mul,
  overloadingFn,
  sin,
  vec2,
  vec3,
  vec4,
} from 'three/tsl'

import type { FloatNode, Vec2Node, Vec3Node } from '../index'; 

const TAU = float(6.283185307179586476925286766559).toVar()
const RANDOM_SCALE = vec4(0.1031, 0.103, 0.0973, 0.1099).toVar()

const random2 = Fn<readonly [Vec2Node]>(
  ([pInput]) => {
    const p = vec2(pInput).toVar()
    const p3 = vec3(fract(p.xyx.mul(RANDOM_SCALE.xyz))).toVar()
    p3.addAssign(dot(p3, p3.yzx.add(19.19)))

    return fract(p3.xx.add(p3.yz).mul(p3.zy))
  },
).setLayout({
  name: 'random2',
  type: 'vec2',
  inputs: [{ name: 'p', type: 'vec2' }],
})

export const voronoiWithTime = Fn<readonly [Vec2Node, FloatNode]>(
  ([uvInput, timeInput]) => {
    const time = float(timeInput).toVar()
    const uv = vec2(uvInput).toVar()
    const iUV = vec2(floor(uv)).toVar()
    const fUV = vec2(fract(uv)).toVar()
    const result = vec3(0.0, 0.0, 10.0).toVar()

    Loop({ start: int(-1), end: int(1), name: 'j', condition: '<=' }, ({ j }) => {
      Loop({ start: int(-1), end: int(1), condition: '<=' }, ({ i }) => {
        const neighbor = vec2(float(i), float(j)).toVar()
        const point = vec2(random2(iUV.add(neighbor))).toVar()
        point.assign(vec2(add(0.5, mul(0.5, sin(time.add(TAU.mul(point)))))))
        const diff = vec2(neighbor.add(point.sub(fUV))).toVar()
        const dist = float(length(diff)).toVar()

        If(dist.lessThan(result.z), () => {
          result.xy.assign(point)
          result.z.assign(dist)
        })
      })
    })

    return result
  },
).setLayout({
  name: 'voronoiWithTime',
  type: 'vec3',
  inputs: [
    { name: 'uv', type: 'vec2' },
    { name: 'time', type: 'float' },
  ],
})

export const voronoiFromVec2 = Fn<readonly [Vec2Node]>(
  ([p]) => voronoiWithTime(p, float(0.0)),
).setLayout({
  name: 'voronoiFromVec2',
  type: 'vec3',
  inputs: [{ name: 'p', type: 'vec2' }],
})

export const voronoiFromVec3 = Fn<readonly [Vec3Node]>(
  ([p]) => voronoiWithTime(vec2(p.xy), float(p.z)),
).setLayout({
  name: 'voronoiFromVec3',
  type: 'vec3',
  inputs: [{ name: 'p', type: 'vec3' }],
})

export const voronoi = overloadingFn([voronoiFromVec2, voronoiFromVec3])

