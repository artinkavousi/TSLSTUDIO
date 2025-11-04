import { Fn, add, cos, float, sin, vec2 } from 'three/tsl'

import type { FloatNode, Vec2Node } from '../../index'; 

export interface TerrainHeightOptions {
  frequency?: number
  amplitude?: number
  detail?: number
  offset?: [number, number]
}

export const terrainHeight = Fn<readonly [Vec2Node, FloatNode, FloatNode, FloatNode, Vec2Node]>(
  ([position, frequency, amplitude, detail, offset]) => {
    const base = position.add(offset)
    const wavePrimary = sin(base.x.mul(frequency)).add(cos(base.y.mul(frequency))).mul(amplitude)

    const waveDetail = sin(base.x.mul(frequency.mul(float(2)))).add(cos(base.y.mul(frequency.mul(float(3)))))
    const detailContribution = waveDetail.mul(amplitude.mul(detail))

    const ridge = sin(base.x.add(base.y).mul(frequency.mul(float(0.5)))).mul(amplitude.mul(float(0.35)))

    const elevation = wavePrimary.add(detailContribution).add(ridge)
    return elevation
  },
).setLayout({
  name: 'terrainHeight',
  type: 'float',
  inputs: [
    { name: 'position', type: 'vec2' },
    { name: 'frequency', type: 'float' },
    { name: 'amplitude', type: 'float' },
    { name: 'detail', type: 'float' },
    { name: 'offset', type: 'vec2' },
  ],
})

export function createTerrainHeightNode(position: Vec2Node, options: TerrainHeightOptions = {}): FloatNode {
  const frequency = float(options.frequency ?? 1.2)
  const amplitude = float(options.amplitude ?? 1.5)
  const detail = float(options.detail ?? 0.25)
  const offset = vec2(options.offset?.[0] ?? 0, options.offset?.[1] ?? 0)
  return terrainHeight(position, frequency, amplitude, detail, offset)
}


