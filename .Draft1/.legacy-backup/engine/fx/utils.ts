// @ts-nocheck
import type { RenderTarget, Texture } from 'three'
import TextureNode from 'three/src/nodes/accessors/TextureNode.js'

export function textureNodeFromResource(resource: RenderTarget | Texture): TextureNode {
  if ((resource as RenderTarget).isRenderTarget) {
    const target = resource as RenderTarget
    return new TextureNode(target.texture)
  }

  return new TextureNode(resource as Texture)
}


