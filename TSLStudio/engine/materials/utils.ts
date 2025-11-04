// @ts-nocheck
import { Color } from 'three'
import type { ColorRepresentation } from 'three'
import { color, float, vec3 } from 'three/tsl'
import type { NodeRepresentation } from 'three/tsl'

function isNode(value: unknown): value is NodeRepresentation {
  return Boolean(value && typeof value === 'object' && (value as any).isNode)
}

function isColorObject(value: unknown): value is Color {
  return Boolean(value && typeof value === 'object' && (value as Color).isColor)
}

export function toFloatNode(value: number | NodeRepresentation | undefined, fallback: number): NodeRepresentation {
  if (value === undefined) return float(fallback)
  if (typeof value === 'number') return float(value)
  if (isNode(value)) return value
  return float(Number(value))
}

export function toVec3Node(
  value: NodeRepresentation | ColorRepresentation | [number, number, number] | number | undefined,
  fallback: [number, number, number],
): NodeRepresentation {
  if (value === undefined) {
    return vec3(fallback[0], fallback[1], fallback[2])
  }

  if (isNode(value)) return value

  if (Array.isArray(value)) {
    const [x = fallback[0], y = fallback[1], z = fallback[2]] = value
    return vec3(x, y, z)
  }

  if (typeof value === 'number') {
    return vec3(value)
  }

  if (typeof value === 'string') {
    const c = new Color(value)
    return vec3(c.r, c.g, c.b)
  }

  if (isColorObject(value)) {
    return vec3(value.r, value.g, value.b)
  }

  return vec3(value as any)
}

export function toColorNode(
  value: NodeRepresentation | ColorRepresentation | undefined,
  fallback: ColorRepresentation | NodeRepresentation,
): NodeRepresentation {
  if (value === undefined) {
    if (isNode(fallback)) return fallback
    return color(fallback as ColorRepresentation)
  }

  if (isNode(value)) return value
  if (isColorObject(value)) return color(value as unknown as Color)
  return color(value as ColorRepresentation)
}


