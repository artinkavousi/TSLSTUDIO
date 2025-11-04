import { describe, expect, it } from 'vitest'
import { float, vec3 } from 'three/tsl'

import {
  ambientLight,
  cookTorranceSpecular,
  diffuseLight,
  directionalLight,
  fresnel,
  hemisphereLight,
  orenNayarDiffuse,
  rimLight,
  specularLight,
} from '../../../../dist/utils/lighting/ambient.d';

