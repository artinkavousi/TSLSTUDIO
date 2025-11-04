import type { FloatNode, Vec3Node } from '../types/nodes';

import { accumulateOctaves, type OctaveOptions } from './helpers/octaves';
import { simplexNoise3d } from './simplex_noise_3d';

export type FBMOptions = OctaveOptions;

export function fbm(coords: Vec3Node, options: FBMOptions = {}): FloatNode {
  return accumulateOctaves(simplexNoise3d, coords, options);
}


