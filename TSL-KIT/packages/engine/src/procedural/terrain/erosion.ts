import { type ShaderNodeObject } from 'three/tsl'
import type { Node } from 'three/webgpu'

import { createErosionNode, type ErosionOptions } from '@tslstudio/tsl/procedural/terrain/erosion'

export function applyTerrainErosion(height: ShaderNodeObject<Node>, options: ErosionOptions = {}) {
  return createErosionNode(height as any, options)
}


