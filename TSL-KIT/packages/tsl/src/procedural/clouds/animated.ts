import { Fn, clamp, float, sin, time, vec3 } from 'three/tsl'

import type { FloatNode, Vec3Node } from '../../index'; 
import { cloudDensity } from './volumetric'; 

export interface AnimatedCloudOptions {
  radius?: number
  noiseScale?: number
  density?: number
  windDirection?: Vec3Node | [number, number, number]
  windSpeed?: number | FloatNode
  timeScale?: number | FloatNode
  swirlFrequency?: number | FloatNode
  swirlAmplitude?: number | FloatNode
  turbulence?: number | FloatNode
}

const toFloatNode = (value: number | FloatNode | undefined, fallback: number): FloatNode => {
  if (value === undefined) return float(fallback)
  return typeof value === 'number' ? float(value) : value
}

const toVec3Node = (value: Vec3Node | [number, number, number] | undefined, fallback: [number, number, number]): Vec3Node => {
  if (value === undefined) return vec3(fallback[0], fallback[1], fallback[2])
  if (Array.isArray(value)) {
    const [x = fallback[0], y = fallback[1], z = fallback[2]] = value
    return vec3(x, y, z)
  }
  return value
}

export const animatedCloudDensity = Fn<
  readonly [Vec3Node, Vec3Node, FloatNode, FloatNode, FloatNode, FloatNode, FloatNode, FloatNode, FloatNode, FloatNode]
>(
  ([
    position,
    windDirection,
    radius,
    noiseScale,
    density,
    windSpeed,
    timeScale,
    swirlFrequency,
    swirlAmplitude,
    turbulence,
  ]) => {
    const windNormalized = windDirection.normalize()
    const advect = windNormalized.mul(time.mul(timeScale).mul(windSpeed))

    const swirlInput = position.mul(swirlFrequency).add(vec3(time.mul(timeScale)))
    const swirl = sin(swirlInput).mul(swirlAmplitude)

    const samplePosition = position.add(advect).add(swirl)
    const baseDensity = cloudDensity(samplePosition, radius, noiseScale, density)
    const animated = baseDensity.mul(float(1).add(turbulence)).clamp(float(0), float(1))

    return animated
  },
).setLayout({
  name: 'animatedCloudDensity',
  type: 'float',
  inputs: [
    { name: 'position', type: 'vec3' },
    { name: 'windDirection', type: 'vec3' },
    { name: 'radius', type: 'float' },
    { name: 'noiseScale', type: 'float' },
    { name: 'density', type: 'float' },
    { name: 'windSpeed', type: 'float' },
    { name: 'timeScale', type: 'float' },
    { name: 'swirlFrequency', type: 'float' },
    { name: 'swirlAmplitude', type: 'float' },
    { name: 'turbulence', type: 'float' },
  ],
})

export function createAnimatedCloudDensity(position: Vec3Node, options: AnimatedCloudOptions = {}): FloatNode {
  const radius = toFloatNode(options.radius, 100)
  const noiseScale = toFloatNode(options.noiseScale, 0.05)
  const density = toFloatNode(options.density, 0.7)
  const windDirection = toVec3Node(options.windDirection, [0.25, 0.05, 0.15])
  const windSpeed = toFloatNode(options.windSpeed, 5)
  const timeScale = toFloatNode(options.timeScale, 0.25)
  const swirlFrequency = toFloatNode(options.swirlFrequency, 0.6)
  const swirlAmplitude = toFloatNode(options.swirlAmplitude, 3)
  const turbulence = toFloatNode(options.turbulence, 0.2)

  return animatedCloudDensity(
    position,
    windDirection,
    radius,
    noiseScale,
    density,
    windSpeed,
    timeScale,
    swirlFrequency,
    swirlAmplitude,
    turbulence,
  )
}


