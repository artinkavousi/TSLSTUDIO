import { describe, expect, it } from 'vitest'
import { float, vec2, vec3, vec4 } from 'three/tsl'

import {
  animateNoise,
  accumulateOctaves,
  classicNoise3d,
  curlNoise3d,
  curlNoise4d,
  domainWarp,
  perlinNoise3d,
  simplexNoise2d,
  simplexNoise3d,
  simplexNoise4d,
  voronoi,
  voronoiFromVec2,
} from '../../../dist/noise/helpers/animation.d';

