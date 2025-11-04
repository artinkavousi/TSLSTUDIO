import { Fn, cos, float, sin, time, vec2, vec3 } from 'three/tsl'

import type { FloatNode, Vec2Node, Vec3Node } from '../../index'; 

export interface OceanSurfaceOptions {
  largeFrequency?: Vec2Node
  largeSpeed?: FloatNode
  largeAmplitude?: FloatNode
  smallIterations?: FloatNode
  smallFrequency?: FloatNode
  smallSpeed?: FloatNode
  smallAmplitude?: FloatNode
}

export const oceanElevation = Fn<readonly [Vec3Node, Vec2Node, FloatNode, FloatNode, FloatNode, FloatNode, FloatNode]>(
  ([position, largeFrequency, largeSpeed, largeAmplitude, smallIterations, smallFrequency, smallAmplitude]) => {
    const base = position.xz.mul(largeFrequency)
    const t = time.mul(largeSpeed)
    const largeWave = sin(base.x.add(t)).mul(cos(base.y.add(t)))
    const elevation = largeWave.mul(largeAmplitude).toVar()

    const iterations = smallIterations.max(float(1))
    let i = float(1)
    elevation.addAssign(
      sin(position.xz.add(1).mul(smallFrequency).add(vec2(0, t)).length()).mul(smallAmplitude.div(i)),
    )

    whileStatement: while (true) {
      if (i.greaterThan(iterations)) break whileStatement
      const noiseInput = position.xz.add(1).mul(smallFrequency).mul(i).add(vec2(t, t))
      const smallWave = sin(noiseInput.x).mul(cos(noiseInput.y)).mul(smallAmplitude.div(i))
      elevation.subAssign(smallWave.abs())
      i = i.add(float(1))
    }

    return elevation
  },
).setLayout({
  name: 'oceanElevation',
  type: 'float',
  inputs: [
    { name: 'position', type: 'vec3' },
    { name: 'largeFrequency', type: 'vec2' },
    { name: 'largeSpeed', type: 'float' },
    { name: 'largeAmplitude', type: 'float' },
    { name: 'smallIterations', type: 'float' },
    { name: 'smallFrequency', type: 'float' },
    { name: 'smallAmplitude', type: 'float' },
  ],
})

const toVec2 = (value: Vec2Node | [number, number] | undefined, fallback: [number, number]): Vec2Node => {
  if (!value) return vec2(fallback[0], fallback[1])
  return value
}

export function createOceanSurface(position: Vec3Node, options: OceanSurfaceOptions = {}): FloatNode {
  const largeFrequency = toVec2(options.largeFrequency, [3, 1])
  const largeSpeed = options.largeSpeed ?? float(1.25)
  const largeAmplitude = options.largeAmplitude ?? float(0.15)
  const smallIterations = options.smallIterations ?? float(4)
  const smallFrequency = options.smallFrequency ?? float(2)
  const smallAmplitude = options.smallAmplitude ?? float(0.18)
  const smallSpeed = options.smallSpeed ?? float(0.2)

  const elevation = oceanElevation(
    position,
    largeFrequency,
    largeSpeed,
    largeAmplitude,
    smallIterations,
    smallFrequency,
    smallAmplitude,
  )

  return elevation
}


