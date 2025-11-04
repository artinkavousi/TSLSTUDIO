import * as TSLTextures from 'tsl-textures';

import type { TextureCatalogEntry, TextureDefaults, TextureNodeFactory } from './types';

const factoryEntries = Object.entries(TSLTextures).filter(([, value]) =>
  typeof value === 'function' && value && 'defaults' in (value as object),
) as Array<[string, TextureNodeFactory]>;

export const textureRegistry = Object.freeze(
  factoryEntries.reduce<Record<string, TextureNodeFactory>>((acc, [name, factory]) => {
    acc[name] = factory;
    return acc;
  }, {}),
) as Readonly<Record<string, TextureNodeFactory>>;

export const TEXTURE_NAMES = Object.freeze(factoryEntries.map(([name]) => name)) as ReadonlyArray<
  keyof typeof textureRegistry
>;

export const textureCatalog = Object.freeze(
  TEXTURE_NAMES.map((name) => {
    const factory = textureRegistry[name];
    const defaults = factory.defaults as TextureDefaults;
    return {
      name,
      factory,
      defaults,
      hasNormal: typeof factory.normal === 'function',
      hasOpacity: typeof factory.opacity === 'function',
      hasRoughness: typeof factory.roughness === 'function',
    } satisfies TextureCatalogEntry;
  }),
) as ReadonlyArray<TextureCatalogEntry>;

export function getTexture(name: keyof typeof textureRegistry): TextureNodeFactory | undefined {
  return textureRegistry[name];
}

export * from 'tsl-textures';
export * from './types';
export * from './utils';
