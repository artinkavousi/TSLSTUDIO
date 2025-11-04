declare module 'tsl-textures' {
  export type ExternalTextureDefaults = Record<string, unknown> & {
    $name?: string
  }

  export interface ExternalTextureNodeFactory<Defaults extends ExternalTextureDefaults = ExternalTextureDefaults> {
    (params?: Partial<Defaults>): unknown
    defaults: Defaults
    normal?: ExternalTextureNodeFactory<Defaults>
    roughness?: ExternalTextureNodeFactory<Defaults>
    opacity?: ExternalTextureNodeFactory<Defaults>
    fn?: (...args: unknown[]) => AnyNode
  }

  export const brain: ExternalTextureNodeFactory
  export const camouflage: ExternalTextureNodeFactory
  export const caveArt: ExternalTextureNodeFactory
  export const circles: ExternalTextureNodeFactory
  export const clouds: ExternalTextureNodeFactory
  export const concrete: ExternalTextureNodeFactory
  export const cork: ExternalTextureNodeFactory
  export const dalmatianSpots: ExternalTextureNodeFactory
  export const darthMaul: ExternalTextureNodeFactory
  export const dysonSphere: ExternalTextureNodeFactory
  export const entangled: ExternalTextureNodeFactory
  export const fordite: ExternalTextureNodeFactory
  export const gasGiant: ExternalTextureNodeFactory
  export const grid: ExternalTextureNodeFactory
  export const isolines: ExternalTextureNodeFactory
  export const karstRock: ExternalTextureNodeFactory
  export const marble: ExternalTextureNodeFactory
  export const neonLights: ExternalTextureNodeFactory
  export const photosphere: ExternalTextureNodeFactory
  export const planet: ExternalTextureNodeFactory
  export const polkaDots: ExternalTextureNodeFactory
  export const processedWood: ExternalTextureNodeFactory
  export const protozoa: ExternalTextureNodeFactory
  export const rotator: ExternalTextureNodeFactory
  export const roughClay: ExternalTextureNodeFactory
  export const runnyEggs: ExternalTextureNodeFactory
  export const rust: ExternalTextureNodeFactory
  export const satin: ExternalTextureNodeFactory
  export const scaler: ExternalTextureNodeFactory
  export const scepterHead: ExternalTextureNodeFactory
  export const scream: ExternalTextureNodeFactory
  export const simplexNoise: ExternalTextureNodeFactory
  export const stars: ExternalTextureNodeFactory
  export const staticNoise: ExternalTextureNodeFactory
  export const supersphere: ExternalTextureNodeFactory
  export const tigerFur: ExternalTextureNodeFactory
  export const translator: ExternalTextureNodeFactory
  export const voronoiCells: ExternalTextureNodeFactory
  export const waterDrops: ExternalTextureNodeFactory
  export const watermelon: ExternalTextureNodeFactory
  export const wood: ExternalTextureNodeFactory
  export const zebraLines: ExternalTextureNodeFactory
  export const circleDecor: ExternalTextureNodeFactory
  export const reticularVeins: ExternalTextureNodeFactory
  export const romanPaving: ExternalTextureNodeFactory
  export const crumpledFabric: ExternalTextureNodeFactory
  export const isolayers: ExternalTextureNodeFactory
  export const turbulentSmoke: ExternalTextureNodeFactory
  export const caustics: ExternalTextureNodeFactory
  export const bricks: ExternalTextureNodeFactory

  export const noise: (...args: unknown[]) => unknown
  export const noised: (...args: unknown[]) => unknown
  export const vnoise: (...args: unknown[]) => unknown
  export const hsl: (...args: unknown[]) => unknown
  export const toHsl: (...args: unknown[]) => unknown
  export const dynamic: (...args: unknown[]) => Record<string, unknown>
  export const spherical: (...args: unknown[]) => unknown
  export const applyEuler: (...args: unknown[]) => unknown
  export const remapExp: (...args: unknown[]) => unknown
  export const matRotX: (...args: unknown[]) => unknown
  export const matRotY: (...args: unknown[]) => unknown
  export const matRotZ: (...args: unknown[]) => unknown
  export const matRotYXZ: (...args: unknown[]) => unknown
  export const matTrans: (...args: unknown[]) => unknown
  export const matScale: (...args: unknown[]) => unknown
  export const selectPlanar: (...args: unknown[]) => unknown
  export const overlayPlanar: (...args: unknown[]) => unknown
  export const showFallbackWarning: (...args: unknown[]) => Promise<void>
  export const hideFallbackWarning: (...args: unknown[]) => void
  export const normalVector: (...args: unknown[]) => unknown
  export const prepare: <TDefaults extends ExternalTextureDefaults>(params: unknown, defaults: TDefaults) => TDefaults
  export const TSLFn: (
    jsFunc: (...args: unknown[]) => unknown,
    defaults: ExternalTextureDefaults,
    layout?: unknown
  ) => ExternalTextureNodeFactory
}

