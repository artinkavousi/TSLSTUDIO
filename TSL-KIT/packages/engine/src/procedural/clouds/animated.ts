import { type ShaderNodeObject } from 'three/tsl'
import type { Node } from 'three/webgpu'

import {
  createAnimatedCloudDensity as createAnimatedCloudDensityNode,
  type AnimatedCloudOptions,
} from '@tslstudio/tsl/procedural/clouds/animated'

export function createAnimatedCloudDensity(position: ShaderNodeObject<Node>, options: AnimatedCloudOptions = {}) {
  return createAnimatedCloudDensityNode(position as any, options)
}


