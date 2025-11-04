import { describe, expect, it } from 'vitest'
import { float, length, vec2, vec3 } from 'three/tsl'

import type { FloatNode, Vec3Node } from '../../../index'; 

import {
  bend,
  intersection,
  displace,
  sdBox,
  sdCapsule,
  sdCone,
  sdCylinder,
  sdOctahedron,
  sdPlane,
  sdPyramid,
  sdRoundBox,
  sdSphere,
  sdTorus,
  smoothIntersection,
  smoothSubtraction,
  smoothUnion,
  subtraction,
  union,
  twist,
  createAmbientOcclusionFn,
  createNormalFn,
  createRaymarchFn,
  createSoftShadowFn,
} from '../../../../dist/utils/sdf/primitives/box.d';

describe('sdf operations', () => {
  it('provides boolean helpers', () => {
    expect(union).toBeDefined()
    expect(subtraction).toBeDefined()
    expect(intersection).toBeDefined()
    expect(smoothUnion).toBeDefined()
    expect(smoothSubtraction).toBeDefined()
    expect(smoothIntersection).toBeDefined()
  })

  it('transforms points with twist and bend helpers', () => {
    expect(() => displace(float(1), float(0.1))).not.toThrow()
    expect(() => twist(vec3(1, 2, 3), float(0.5))).not.toThrow()
    expect(() => bend(vec3(1, 2, 3), float(4))).not.toThrow()
  })
})

describe('sdf helper generators', () => {
  const sphereDistance = (point: Vec3Node): FloatNode => length(point).sub(float(1))

  it('creates reusable helper nodes', () => {
    const raymarch = createRaymarchFn(sphereDistance)
    expect(() => raymarch(vec3(0, 0, -3), vec3(0, 0, 1), float(0))).not.toThrow()

    const calcNormal = createNormalFn(sphereDistance)
    expect(() => calcNormal(vec3(1, 0, 0))).not.toThrow()

    const ambientOcclusion = createAmbientOcclusionFn(sphereDistance)
    expect(() => ambientOcclusion(vec3(1, 0, 0), vec3(1, 0, 0))).not.toThrow()

    const softShadow = createSoftShadowFn(sphereDistance)
    expect(() => softShadow(vec3(0, 0, -3), vec3(0, 0, 1))).not.toThrow()
  })
})

