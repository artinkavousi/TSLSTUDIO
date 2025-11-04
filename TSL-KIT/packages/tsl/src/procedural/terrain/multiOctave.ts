import { Fn, clamp, float, vec2 } from 'three/tsl'

import type { FloatNode, Vec2Node } from '../../index'; 
import { terrainHeight } from './heightMap'; 

export interface TerrainMultiOctaveOptions {
  octaves?: number | FloatNode
  frequency?: number | FloatNode
  amplitude?: number | FloatNode
  detail?: number | FloatNode
  gain?: number | FloatNode
  lacunarity?: number | FloatNode
  offset?: [number, number]
}

const toFloatNode = (value: number | FloatNode | undefined, fallback: number): FloatNode => {
  if (value === undefined) return float(fallback)
  return typeof value === 'number' ? float(value) : value
}

export const terrainMultiOctave = Fn<readonly [Vec2Node, FloatNode, FloatNode, FloatNode, FloatNode, FloatNode, FloatNode, Vec2Node]>(
  ([position, octaves, baseFrequency, baseAmplitude, detail, gain, lacunarity, offset]) => {
    const total = float(0).toVar()
    const amplitudeAccum = float(0).toVar()

    let octaveIndex = float(0)
    const frequency = baseFrequency.toVar()
    const amplitude = baseAmplitude.toVar()

    const maxOctaves = clamp(octaves, float(1), float(12))

    loop: while (true) {
      if (octaveIndex.greaterThanEqual(maxOctaves)) break loop

      const sample = terrainHeight(position, frequency, amplitude, detail, offset)
      total.addAssign(sample)
      amplitudeAccum.addAssign(amplitude)

      frequency.mulAssign(lacunarity)
      amplitude.mulAssign(gain)
      octaveIndex = octaveIndex.add(float(1))
    }

    const denominator = amplitudeAccum.max(float(0.0001))
    return total.div(denominator)
  },
).setLayout({
  name: 'terrainMultiOctave',
  type: 'float',
  inputs: [
    { name: 'position', type: 'vec2' },
    { name: 'octaves', type: 'float' },
    { name: 'frequency', type: 'float' },
    { name: 'amplitude', type: 'float' },
    { name: 'detail', type: 'float' },
    { name: 'gain', type: 'float' },
    { name: 'lacunarity', type: 'float' },
    { name: 'offset', type: 'vec2' },
  ],
})

export function createTerrainMultiOctave(position: Vec2Node, options: TerrainMultiOctaveOptions = {}): FloatNode {
  const octaves = toFloatNode(options.octaves, 4)
  const frequency = toFloatNode(options.frequency, 1.2)
  const amplitude = toFloatNode(options.amplitude, 1.5)
  const detail = toFloatNode(options.detail, 0.3)
  const gain = toFloatNode(options.gain, 0.55)
  const lacunarity = toFloatNode(options.lacunarity, 2)
  const offset = vec2(options.offset?.[0] ?? 0, options.offset?.[1] ?? 0)

  return terrainMultiOctave(position, octaves, frequency, amplitude, detail, gain, lacunarity, offset)
}


