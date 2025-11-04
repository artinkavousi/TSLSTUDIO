import { type ShaderNodeObject } from 'three/tsl'
import type { Node } from 'three/webgpu'

import {
  createRaymarchedCloudMask as createRaymarchedCloudMaskNode,
  type RaymarchedCloudOptions,
} from '@tslstudio/tsl/procedural/clouds/raymarched'

export function createRaymarchedCloudMask(
  origin: ShaderNodeObject<Node>,
  direction: ShaderNodeObject<Node>,
  options: RaymarchedCloudOptions = {},
) {
  return createRaymarchedCloudMaskNode(origin as any, direction as any, options)
}


