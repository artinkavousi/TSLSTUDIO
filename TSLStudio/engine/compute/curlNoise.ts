// @ts-nocheck
import { Fn, vec3, float, time } from 'three/tsl'
import type { NodeRepresentation } from 'three/tsl'
import { curlNoise3d } from '@/tsl/noise/curl_noise_3d'

export type CurlNoiseParams = {
  amplitude?: number | NodeRepresentation
  frequency?: number | NodeRepresentation
  timeScale?: number | NodeRepresentation
  offset?: NodeRepresentation
}

function resolveNode(value: number | NodeRepresentation | undefined, fallback: number): NodeRepresentation {
  if (value === undefined) return float(fallback)
  if (typeof value === 'number') return float(value)
  return value
}

export function createCurlNoiseSampler(params: CurlNoiseParams = {}) {
  const amplitude = resolveNode(params.amplitude, 1)
  const frequency = resolveNode(params.frequency, 1)
  const timeScale = resolveNode(params.timeScale, 0.35)
  const offset = params.offset ?? vec3(0)

  return Fn(([position]) => {
    const p = vec3(position).mul(frequency).add(offset).add(time.mul(timeScale))
    return curlNoise3d(p).mul(amplitude)
  })
}

export function sampleCurlNoise(position: NodeRepresentation, params: CurlNoiseParams = {}) {
  return createCurlNoiseSampler(params)(position)
}


