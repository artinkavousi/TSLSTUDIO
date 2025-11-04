import { Fn, clamp, float, sin, time } from 'three/tsl'

import type { FloatNode, Vec3Node } from '../../index'; 
import { cloudDensity } from './volumetric'; 

export interface RaymarchedCloudOptions {
  radius?: number
  noiseScale?: number
  density?: number
  coverage?: number
  stepCount?: number
  stepSize?: number
  jitter?: number
  timeScale?: number
}

const toFloatNode = (value: number | FloatNode | undefined, fallback: number): FloatNode => {
  if (value === undefined) return float(fallback)
  return typeof value === 'number' ? float(value) : value
}

export const raymarchedCloudMask = Fn<
  readonly [Vec3Node, Vec3Node, FloatNode, FloatNode, FloatNode, FloatNode, FloatNode, FloatNode, FloatNode, FloatNode]
>(
  ([origin, direction, radius, noiseScale, density, coverage, stepCount, stepSize, jitter, timeScale]) => {
    const steps = clamp(stepCount, float(1), float(256)).toVar()
    const stride = stepSize.max(float(0.05))

    const accum = float(0).toVar()
    const transmittance = float(1).toVar()
    let i = float(0)

    marching: while (true) {
      if (i.greaterThanEqual(steps)) break marching
      if (transmittance.lessThan(float(0.01))) break marching

      const jitterOffset = sin(i.add(time.mul(timeScale))).mul(jitter)
      const travel = i.mul(stride).add(jitterOffset)
      const samplePos = origin.add(direction.mul(travel))
      const sample = cloudDensity(samplePos, radius, noiseScale, density).mul(coverage)

      const attenuation = clamp(sample.mul(stride), float(0), float(1))
      accum.addAssign(transmittance.mul(sample))
      transmittance.mulAssign(float(1).sub(attenuation))

      i = i.add(float(1))
    }

    return clamp(accum, float(0), float(1))
  },
).setLayout({
  name: 'raymarchedCloudMask',
  type: 'float',
  inputs: [
    { name: 'origin', type: 'vec3' },
    { name: 'direction', type: 'vec3' },
    { name: 'radius', type: 'float' },
    { name: 'noiseScale', type: 'float' },
    { name: 'density', type: 'float' },
    { name: 'coverage', type: 'float' },
    { name: 'stepCount', type: 'float' },
    { name: 'stepSize', type: 'float' },
    { name: 'jitter', type: 'float' },
    { name: 'timeScale', type: 'float' },
  ],
})

export function createRaymarchedCloudMask(origin: Vec3Node, direction: Vec3Node, options: RaymarchedCloudOptions = {}): FloatNode {
  const radius = toFloatNode(options.radius, 100)
  const noiseScale = toFloatNode(options.noiseScale, 0.05)
  const density = toFloatNode(options.density, 0.7)
  const coverage = toFloatNode(options.coverage, 1)
  const stepCount = toFloatNode(options.stepCount, 48)
  const stepSize = toFloatNode(options.stepSize, 2)
  const jitter = toFloatNode(options.jitter, 0.5)
  const timeScale = toFloatNode(options.timeScale, 0.35)

  const dir = direction.normalize()

  return raymarchedCloudMask(origin, dir, radius, noiseScale, density, coverage, stepCount, stepSize, jitter, timeScale)
}


