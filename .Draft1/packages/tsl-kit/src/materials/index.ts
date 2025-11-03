export type Material = {
  dispose: () => void
}

export const makeMaterial = (_spec?: unknown): Material => {
  console.warn('[tsl-kit] makeMaterial placeholder invoked. Returning dummy material.')
  return {
    dispose: () => {
      /* noop */
    },
  }
}

export const makeMaterialLayers = () => {
  console.warn('[tsl-kit] makeMaterialLayers placeholder invoked.')
  return []
}

export * from './core/index.js'
export * from './pbr/disney.js'

