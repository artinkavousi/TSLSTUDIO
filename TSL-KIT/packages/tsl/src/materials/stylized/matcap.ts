import type { ColorRepresentation } from 'three'
import { Fn, normalView, positionViewDirection, reflect, texture, vec2 } from 'three/tsl'

import { toColorNode, toFloatNode, type NodeRepresentation } from '../utils'; 

export interface MatcapOptions {
  normal?: NodeRepresentation
  tint?: ColorRepresentation | NodeRepresentation
  intensity?: number | NodeRepresentation
}

export function matcapShading(mapNode: NodeRepresentation, options: MatcapOptions = {}) {
  const normalNode = options.normal ?? normalView()
  const tintNode = options.tint !== undefined ? toColorNode(options.tint, '#ffffff') : undefined
  const intensityNode = options.intensity !== undefined ? toFloatNode(options.intensity, 1) : undefined

  return Fn(() => {
    const n = normalNode.normalize()
    const v = positionViewDirection
    const r = reflect(v.mul(-1), n)
    const matcapUv = r.xy.mul(0.5).add(vec2(0.5))
    let shaded = texture(mapNode, matcapUv).xyz

    if (tintNode) {
      shaded = shaded.mul(tintNode)
    }

    if (intensityNode) {
      shaded = shaded.mul(intensityNode)
    }

    return shaded
  })()
}

