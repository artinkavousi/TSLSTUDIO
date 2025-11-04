import { float, vec3, type ShaderNodeObject } from 'three/tsl'
import type { Node } from 'three/webgpu'

export type FloatInput = number | ShaderNodeObject<Node> | undefined
export type Vec3Input = [number, number, number] | number | ShaderNodeObject<Node> | undefined

const isNode = (value: unknown): value is ShaderNodeObject<Node> =>
  Boolean(value && typeof value === 'object' && 'isNode' in (value as { isNode?: unknown }))

export const toFloatNode = (value: FloatInput, fallback: number): ShaderNodeObject<Node> => {
  if (value === undefined) {
    return float(fallback)
  }

  if (isNode(value)) {
    return value
  }

  return float(value)
}

export const toVec3Node = (
  value: Vec3Input,
  fallback: [number, number, number],
): ShaderNodeObject<Node> => {
  if (value === undefined) {
    return vec3(fallback[0], fallback[1], fallback[2])
  }

  if (isNode(value)) {
    return value
  }

  if (Array.isArray(value)) {
    const [x = fallback[0], y = fallback[1], z = fallback[2]] = value
    return vec3(x, y, z)
  }

  if (typeof value === 'number') {
    return vec3(value)
  }

  return vec3(fallback[0], fallback[1], fallback[2])
}


