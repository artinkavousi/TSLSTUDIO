import {
  createGlassMaterial,
  createBrushedMetalMaterial,
  createFabricMaterial,
  createSkinMaterial,
  createWaterMaterial,
} from '../physical/glass'; 

export function createMaterials() {
  return {
    glass: createGlassMaterial,
    metal: createBrushedMetalMaterial,
    fabric: createFabricMaterial,
    skin: createSkinMaterial,
    water: createWaterMaterial,
  }
}

