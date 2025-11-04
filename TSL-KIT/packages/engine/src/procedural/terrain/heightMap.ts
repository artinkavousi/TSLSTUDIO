import { vec2, type ShaderNodeObject } from 'three/tsl'
import type { Node } from 'three/webgpu'

import { createTerrainHeightNode, type TerrainHeightOptions } from '@tslstudio/tsl/procedural/terrain/heightMap'

export interface EngineTerrainOptions extends TerrainHeightOptions {
  positionXY?: ShaderNodeObject<Node>
}

export function createTerrainHeight(position: ShaderNodeObject<Node>, options: EngineTerrainOptions = {}) {
  const xy = options.positionXY ?? position.xy
  return createTerrainHeightNode(xy as any, options)
}


