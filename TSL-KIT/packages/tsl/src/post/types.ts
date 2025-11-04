import type { Vector2 } from 'three'
import type { ShaderNodeObject } from 'three/tsl'
import type { Node } from 'three/webgpu'

export interface EffectResources {
  get(key: string): unknown
  set?(key: string, value: unknown): void
}

export interface EffectContext {
  color: ShaderNodeObject<Node>
  input: ShaderNodeObject<Node>
  resources: EffectResources
  frame: number
  size: Vector2
}

export type PostEffect = (context: EffectContext) => ShaderNodeObject<Node>

