import { type ShaderNodeObject } from 'three/tsl'
import type { Node } from 'three/webgpu'

import { createCloudDensity, type CloudOptions } from '@tslstudio/tsl/procedural/clouds/volumetric'

export function createCloudVolume(position: ShaderNodeObject<Node>, options: CloudOptions = {}) {
  return createCloudDensity(position as any, options)
}


