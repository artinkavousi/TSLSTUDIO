import {
  createToonMaterial,
  createHalftoneMaterial,
  createHologramMaterial,
  createDissolveMaterial,
} from '../stylized/toon'; 

export function createStylized() {
  return {
    toon: createToonMaterial,
    halftone: createHalftoneMaterial,
    hologram: createHologramMaterial,
    dissolve: createDissolveMaterial,
  }
}

