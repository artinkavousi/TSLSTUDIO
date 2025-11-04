// @ts-nocheck
import type { Vector2 } from 'three'
import type { NodeRepresentation } from 'three/tsl'
import type { FramegraphResourceMap } from '@engine/core/framegraph'

export type EffectContext = {
  color: NodeRepresentation
  input: NodeRepresentation
  resources: FramegraphResourceMap
  frame: number
  size: Vector2
}

export type PostEffect = (context: EffectContext) => NodeRepresentation


