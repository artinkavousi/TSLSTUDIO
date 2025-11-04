import { type ShaderNodeObject } from 'three/tsl'
import type { Node } from 'three/webgpu'

import {
  createOceanCaustics as createOceanCausticsNode,
  type OceanCausticsOptions,
} from '@tslstudio/tsl/procedural/ocean/caustics'

export function createOceanCaustics(position: ShaderNodeObject<Node>, options: OceanCausticsOptions = {}) {
  return createOceanCausticsNode(position as any, options)
}


