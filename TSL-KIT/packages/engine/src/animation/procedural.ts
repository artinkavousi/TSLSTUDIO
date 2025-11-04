import { uniform, vec3, type ShaderNodeObject } from 'three/tsl'
import type { Node } from 'three/webgpu'

import { waveMotion } from '@tslstudio/tsl/animation/procedural'

export interface WaveTrackConfig {
  direction?: ShaderNodeObject<Node>
  amplitude?: number
  frequency?: number
  phase?: number
}

export function createWaveTrack({
  direction = vec3(0, 1, 0),
  amplitude = 0.5,
  frequency = 1,
  phase = 0,
}: WaveTrackConfig = {}) {
  const amplitudeUniform = uniform(amplitude)
  const frequencyUniform = uniform(frequency)
  const phaseUniform = uniform(phase)

  return waveMotion(direction, amplitudeUniform, frequencyUniform, phaseUniform)
}


