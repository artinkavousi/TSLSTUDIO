import { describe, expect, it } from 'vitest'
import { float, vec3 } from 'three/tsl'

import { applyTerrainErosion } from '../terrain/erosion'; 
import { createTerrainHeight } from '../terrain/heightMap'; 
import { createTerrainMultiOctave } from '../terrain/multiOctave';


