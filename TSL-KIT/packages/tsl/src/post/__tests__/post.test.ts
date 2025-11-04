import { describe, expect, it } from 'vitest'
import { vec2 } from 'three/tsl'

import {
  createAsciiEffect,
  createGaussianBlurEffect,
  createDirectionalBlurEffect,
  createRadialBlurEffect,
  createCRTEffect,
  createAdvancedDOFEffect,
  createColorCurvesEffect,
  createDuotoneEffect,
  createEdgeDetectionEffect,
  createGlitchEffect,
  createPosterizeEffect,
  grainTextureEffect,
} from '../../../dist/post/effects/ascii.d';

