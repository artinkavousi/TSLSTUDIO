import { Color, type ColorRepresentation } from 'three'
import { color, float, vec3, type ShaderNodeObject } from 'three/tsl'
import type { Node } from 'three/webgpu'

export type NodeRepresentation = ShaderNodeObject<Node>

const isNodeRepresentation = (value: unknown): value is NodeRepresentation =>
  Boolean(value && typeof value === 'object' && 'isNode' in (value as { isNode?: unknown }))

const isColorObject = (value: unknown): value is Color =>
  value instanceof Color || Boolean(value && typeof value === 'object' && 'isColor' in (value as { isColor?: unknown }))

/**
 * Normalizes an input into a float node.
 */
export function toFloatNode(value: number | NodeRepresentation | undefined, fallback: number): NodeRepresentation {
  if (value === undefined) {
    return float(fallback) as NodeRepresentation
  }

  if (typeof value === 'number') {
    return float(value) as NodeRepresentation
  }

  if (isNodeRepresentation(value)) {
    return value
  }

  return float(Number(value)) as NodeRepresentation
}

/**
 * Normalizes an input into a vec3 node.
 */
export function toVec3Node(
  value: NodeRepresentation | ColorRepresentation | [number, number, number] | number | undefined,
  fallback: [number, number, number],
): NodeRepresentation {
  if (value === undefined) {
    return vec3(fallback[0], fallback[1], fallback[2]) as NodeRepresentation
  }

  if (isNodeRepresentation(value)) {
    return value
  }

  if (Array.isArray(value)) {
    const [x = fallback[0], y = fallback[1], z = fallback[2]] = value
    return vec3(x, y, z) as NodeRepresentation
  }

  if (typeof value === 'number') {
    return vec3(value) as NodeRepresentation
  }

  if (isColorObject(value)) {
    return vec3(value.r, value.g, value.b) as NodeRepresentation
  }

  if (typeof value === 'string') {
    const parsed = new Color(value)
    return vec3(parsed.r, parsed.g, parsed.b) as NodeRepresentation
  }

  return vec3(fallback[0], fallback[1], fallback[2]) as NodeRepresentation
}

/**
 * Normalizes an input into a color node.
 */
export function toColorNode(
  value: NodeRepresentation | ColorRepresentation | undefined,
  fallback: ColorRepresentation | NodeRepresentation,
): NodeRepresentation {
  if (value === undefined) {
    if (isNodeRepresentation(fallback)) {
      return fallback
    }

    return color(fallback) as NodeRepresentation
  }

  if (isNodeRepresentation(value)) {
    return value
  }

  if (isColorObject(value)) {
    return color(value) as NodeRepresentation
  }

  return color(value) as NodeRepresentation
}

