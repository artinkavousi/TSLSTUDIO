import { vec3, type ShaderNodeObject } from 'three/tsl'
import type { Node } from 'three/webgpu'

import { createOceanSurface, type OceanSurfaceOptions } from '@tslstudio/tsl/procedural/ocean/surface'

export function createOceanHeight(position: ShaderNodeObject<Node>, options: OceanSurfaceOptions = {}) {
  return createOceanSurface(position as any, options)
}


