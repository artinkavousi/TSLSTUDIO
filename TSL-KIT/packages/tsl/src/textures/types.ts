import type { AnyNode } from '../index'; 

export type TextureDefaults = Record<string, unknown> & {
  $name?: string
}

export interface TextureNodeFactory<Defaults extends TextureDefaults = TextureDefaults> {
  (params?: Partial<Defaults>): AnyNode
  defaults: Defaults
  normal?: TextureNodeFactory<Defaults>
  roughness?: TextureNodeFactory<Defaults>
  opacity?: TextureNodeFactory<Defaults>
  fn?: (...args: unknown[]) => AnyNode
}

export interface TextureCatalogEntry<Defaults extends TextureDefaults = TextureDefaults> {
  name: string
  factory: TextureNodeFactory<Defaults>
  defaults: Defaults
  hasNormal: boolean
  hasOpacity: boolean
  hasRoughness: boolean
}

