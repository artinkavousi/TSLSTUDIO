import { type ShaderNodeObject } from 'three/tsl'
import type { Node } from 'three/webgpu'

import { createOceanFoam as createOceanFoamNode, type OceanFoamOptions } from '@tslstudio/tsl/procedural/ocean/foam'

export function createOceanFoam(position: ShaderNodeObject<Node>, options: OceanFoamOptions = {}) {
  return createOceanFoamNode(position as any, options)
}


