import { type ShaderNodeObject } from 'three/tsl'
import type { Node } from 'three/webgpu'

import {
  createTerrainMultiOctave as createTerrainMultiOctaveNode,
  type TerrainMultiOctaveOptions,
} from '@tslstudio/tsl/procedural/terrain/multiOctave'

export function createTerrainMultiOctave(positionXY: ShaderNodeObject<Node>, options: TerrainMultiOctaveOptions = {}) {
  return createTerrainMultiOctaveNode(positionXY as any, options)
}


