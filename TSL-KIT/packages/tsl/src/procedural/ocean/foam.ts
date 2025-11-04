import { Fn, abs, clamp, float, sin, smoothstep, time, vec2, vec3 } from 'three/tsl'

import type { FloatNode, Vec2Node, Vec3Node } from '../../index'; 
import { oceanElevation, type OceanSurfaceOptions } from './surface'; 

export interface OceanFoamOptions extends OceanSurfaceOptions {
  threshold?: number | FloatNode
  intensity?: number | FloatNode
  sampleDistance?: number | FloatNode
  noiseFrequency?: number | FloatNode
  timeScale?: number | FloatNode
  noiseAmplitude?: number | FloatNode
}

const toFloatNode = (value: number | FloatNode | undefined, fallback: number): FloatNode => {
  if (value === undefined) return float(fallback)
  return typeof value === 'number' ? float(value) : value
}

export const oceanFoamMask = Fn<
  readonly [
    Vec3Node,
    Vec2Node,
    FloatNode,
    FloatNode,
    FloatNode,
    FloatNode,
    FloatNode,
    FloatNode,
    FloatNode,
    FloatNode,
    FloatNode,
    FloatNode,
    FloatNode,
  ]
>(
  ([
    position,
    largeFrequency,
    largeSpeed,
    largeAmplitude,
    smallIterations,
    smallFrequency,
    smallAmplitude,
    threshold,
    intensity,
    sampleDistance,
    noiseFrequency,
    timeScale,
    noiseAmplitude,
  ]) => {
    const sampleElev = (pos: Vec3Node) =>
      oceanElevation(pos, largeFrequency, largeSpeed, largeAmplitude, smallIterations, smallFrequency, smallAmplitude)

    const baseHeight = sampleElev(position).toVar()

    const safeSample = sampleDistance.max(float(0.001))
    const offsetX = vec3(safeSample, float(0), float(0))
    const offsetZ = vec3(float(0), float(0), safeSample)

    const slopeX = sampleElev(position.add(offsetX)).sub(baseHeight).abs()
    const slopeZ = sampleElev(position.add(offsetZ)).sub(baseHeight).abs()

    const slopeIntensity = slopeX.add(slopeZ).mul(intensity)
    const slopeMask = clamp(slopeIntensity, float(0), float(1))

    const noiseCoord = position.xz.mul(noiseFrequency)
    const foamNoise = sin(noiseCoord.length().add(time.mul(timeScale)))
    const foamBase = slopeMask.add(foamNoise.mul(noiseAmplitude))

    const foam = smoothstep(threshold, float(1), foamBase)
    return clamp(foam, float(0), float(1))
  },
).setLayout({
  name: 'oceanFoamMask',
  type: 'float',
  inputs: [
    { name: 'position', type: 'vec3' },
    { name: 'largeFrequency', type: 'vec2' },
    { name: 'largeSpeed', type: 'float' },
    { name: 'largeAmplitude', type: 'float' },
    { name: 'smallIterations', type: 'float' },
    { name: 'smallFrequency', type: 'float' },
    { name: 'smallAmplitude', type: 'float' },
    { name: 'threshold', type: 'float' },
    { name: 'intensity', type: 'float' },
    { name: 'sampleDistance', type: 'float' },
    { name: 'noiseFrequency', type: 'float' },
    { name: 'timeScale', type: 'float' },
    { name: 'noiseAmplitude', type: 'float' },
  ],
})

export function createOceanFoam(position: Vec3Node, options: OceanFoamOptions = {}): FloatNode {
  const largeFrequency = options.largeFrequency ?? vec2(3, 1)
  const largeSpeed = options.largeSpeed ?? float(1.25)
  const largeAmplitude = options.largeAmplitude ?? float(0.15)
  const smallIterations = options.smallIterations ?? float(4)
  const smallFrequency = options.smallFrequency ?? float(2)
  const smallAmplitude = options.smallAmplitude ?? float(0.18)

  const threshold = toFloatNode(options.threshold, 0.55)
  const intensity = toFloatNode(options.intensity, 2.4)
  const sampleDistance = toFloatNode(options.sampleDistance, 0.12)
  const noiseFrequency = toFloatNode(options.noiseFrequency, 1.5)
  const timeScale = toFloatNode(options.timeScale, 0.9)
  const noiseAmplitude = toFloatNode(options.noiseAmplitude, 0.35)

  return oceanFoamMask(
    position,
    largeFrequency,
    largeSpeed,
    largeAmplitude,
    smallIterations,
    smallFrequency,
    smallAmplitude,
    threshold,
    intensity,
    sampleDistance,
    noiseFrequency,
    timeScale,
    noiseAmplitude,
  )
}


