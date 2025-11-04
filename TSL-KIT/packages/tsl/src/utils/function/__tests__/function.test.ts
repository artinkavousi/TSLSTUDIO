import { describe, expect, it } from 'vitest'
import { float, vec3 } from 'three/tsl'

import {
  compose,
  remap,
  rotate3dY,
  smoothMin,
  smoothMod,
} from '../../../../dist/utils/function/compose.d';

