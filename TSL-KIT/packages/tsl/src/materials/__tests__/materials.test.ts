import { describe, expect, it } from 'vitest'
import { MeshPhysicalNodeMaterial } from 'three/webgpu'

import { createPBRStandard, carPaintIridescent } from '../pbr/standard'; 
import {
  matcapShading,
  triplanarSample,
  createToonMaterial,
  createHalftoneMaterial,
  createHologramMaterial,
  createDissolveMaterial,
} from '../../../dist/materials/stylized/matcap.d';

