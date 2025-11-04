// @ts-nocheck
import { Fn, mul, reflect, texture, vec2, normalView, positionViewDirection } from 'three/tsl'
import type { NodeRepresentation } from 'three/tsl'
import type { ColorRepresentation } from 'three'
import { toColorNode, toFloatNode } from './utils'

export type MatcapOptions = {
  normal?: NodeRepresentation
  tint?: ColorRepresentation | NodeRepresentation
  intensity?: number | NodeRepresentation
}

/**
 * Generates a matcap shading node from a texture.
 */
export function matcapShading(mapNode: NodeRepresentation, options: MatcapOptions = {}) {
  const normalNode = options.normal ?? normalView()
  const tintNode = options.tint !== undefined ? toColorNode(options.tint, '#ffffff') : undefined
  const intensityNode = options.intensity !== undefined ? toFloatNode(options.intensity, 1) : undefined

  return Fn(() => {
    const n = normalize(normalNode)
    const v = positionViewDirection
    const r = reflect(v.mul(-1), n)
    const uv = r.xy.mul(0.5).add(vec2(0.5))
    let colorNode = texture(mapNode, uv).xyz
    if (tintNode) {
      colorNode = colorNode.mul(tintNode)
    }
    if (intensityNode) {
      colorNode = colorNode.mul(intensityNode)
    }
    return colorNode
  })()
}


