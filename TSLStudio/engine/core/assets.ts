import {
  Data3DTexture,
  DataTexture,
  DefaultLoadingManager,
  FloatType,
  HalfFloatType,
  LinearFilter,
  LoadingManager,
  RGBFormat,
  Texture,
  TextureLoader,
  CubeTexture,
  CubeTextureLoader,
  RepeatWrapping,
  TextureDataType,
  LinearSRGBColorSpace,
} from 'three'
import type {
  Wrapping,
  MagnificationTextureFilter,
  MinificationTextureFilter,
} from 'three'
import PMREMGenerator from 'three/src/renderers/common/extras/PMREMGenerator.js'
import { WebGPURenderer } from 'three/webgpu'
import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader.js'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js'
import { EXRLoader } from 'three/examples/jsm/loaders/EXRLoader.js'

export type TextureLoadOptions = {
  colorSpace?: string
  flipY?: boolean
  wrapS?: Wrapping
  wrapT?: Wrapping
  magFilter?: MagnificationTextureFilter
  minFilter?: MinificationTextureFilter
  generateMipmaps?: boolean
  onProgress?: (event: ProgressEvent<EventTarget>) => void
  signal?: AbortSignal
  cacheKey?: string
}

export type HDRTextureOptions = {
  onProgress?: (event: ProgressEvent<EventTarget>) => void
  signal?: AbortSignal
  /** Convert equirectangular map into a PMREM cube map (env/light probe). */
  pmrem?: boolean
  /** Dispose the original HDR texture after PMREM conversion (default: true). */
  disposeSource?: boolean
  /** Output texture color space. Defaults to LinearSRGB. */
  colorSpace?: string
  /** Use HalfFloatType (default) or FloatType. */
  type?: TextureDataType
  cacheKey?: string
}

export type EXRTextureOptions = {
  onProgress?: (event: ProgressEvent<EventTarget>) => void
  signal?: AbortSignal
  type?: TextureDataType
  cacheKey?: string
}

export type CubeTextureOptions = {
  onProgress?: (event: ProgressEvent<EventTarget>) => void
  signal?: AbortSignal
  colorSpace?: string
  cacheKey?: string
}

export type KTX2TextureOptions = TextureLoadOptions & {
  transcoderPath?: string
}

export type LUT3D = {
  size: number
  domainMin: [number, number, number]
  domainMax: [number, number, number]
  data: Float32Array
  texture: Data3DTexture
}

export type LUTLoadOptions = {
  signal?: AbortSignal
  cacheKey?: string
}

const DEFAULT_COLOR_SPACE = LinearSRGBColorSpace

function abortable<T>(signal: AbortSignal | undefined, executor: () => Promise<T>): Promise<T> {
  if (!signal) return executor()
  if (signal.aborted) {
    return Promise.reject(new DOMException('Aborted', 'AbortError'))
  }
  return new Promise<T>((resolve, reject) => {
    const onAbort = () => {
      signal.removeEventListener('abort', onAbort)
      reject(new DOMException('Aborted', 'AbortError'))
    }
    signal.addEventListener('abort', onAbort, { once: true })
    executor()
      .then((value) => {
        signal.removeEventListener('abort', onAbort)
        resolve(value)
      })
      .catch((error) => {
        signal.removeEventListener('abort', onAbort)
        reject(error)
      })
  })
}

function ensureColorSpace(colorSpace?: string): string {
  return colorSpace ?? DEFAULT_COLOR_SPACE
}

function cacheKey(key: string, custom?: string) {
  return custom ? `${key}:${custom}` : key
}

function createData3DTexture(size: number, data: Float32Array): Data3DTexture {
  const texture = new Data3DTexture(data, size, size, size)
  texture.type = FloatType
  texture.format = RGBFormat
  texture.colorSpace = DEFAULT_COLOR_SPACE
  texture.minFilter = LinearFilter
  texture.magFilter = LinearFilter
  texture.wrapS = RepeatWrapping
  texture.wrapT = RepeatWrapping
  texture.wrapR = RepeatWrapping
  texture.generateMipmaps = false
  texture.needsUpdate = true
  return texture
}

function parseCubeLUT(raw: string): LUT3D {
  const lines = raw.split(/\r?\n/)
  let size = 0
  let domainMin: [number, number, number] = [0, 0, 0]
  let domainMax: [number, number, number] = [1, 1, 1]
  const values: number[] = []

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue

    const tokens = trimmed.split(/\s+/)
    if (tokens[0] === 'LUT_3D_SIZE') {
      size = parseInt(tokens[1], 10)
      continue
    }
    if (tokens[0] === 'DOMAIN_MIN') {
      domainMin = [Number(tokens[1]), Number(tokens[2]), Number(tokens[3])] as [number, number, number]
      continue
    }
    if (tokens[0] === 'DOMAIN_MAX') {
      domainMax = [Number(tokens[1]), Number(tokens[2]), Number(tokens[3])] as [number, number, number]
      continue
    }

    if (tokens.length >= 3) {
      values.push(Number(tokens[0]), Number(tokens[1]), Number(tokens[2]))
    }
  }

  if (!size || size <= 1) {
    throw new Error('Invalid LUT file: missing LUT_3D_SIZE header')
  }

  const expected = size * size * size * 3
  if (values.length !== expected) {
    throw new Error(`Invalid LUT data length: expected ${expected}, received ${values.length}`)
  }

  const data = Float32Array.from(values)
  const texture = createData3DTexture(size, data)
  texture.userData.domainMin = domainMin
  texture.userData.domainMax = domainMax

  return {
    size,
    domainMin,
    domainMax,
    data,
    texture,
  }
}

export type AssetManagerOptions = {
  loadingManager?: LoadingManager
  ktx2TranscoderPath?: string
  /** Automatically convert HDR textures to PMREM by default. */
  defaultPMREM?: boolean
}

export class AssetManager {
  readonly renderer: WebGPURenderer
  readonly loadingManager: LoadingManager

  private readonly pmrem: PMREMGenerator
  private ktx2Loader: KTX2Loader | null = null

  private readonly textureCache = new Map<string, Promise<Texture>>()
  private readonly hdrCache = new Map<string, Promise<Texture>>()
  private readonly exrCache = new Map<string, Promise<DataTexture>>()
  private readonly cubeCache = new Map<string, Promise<CubeTexture>>()
  private readonly lutCache = new Map<string, Promise<LUT3D>>()

  private readonly defaultPMREM: boolean

  constructor(renderer: WebGPURenderer, options: AssetManagerOptions = {}) {
    this.renderer = renderer
    this.loadingManager = options.loadingManager ?? DefaultLoadingManager
    this.defaultPMREM = options.defaultPMREM ?? false
    this.pmrem = new PMREMGenerator(renderer)

    if (options.ktx2TranscoderPath) {
      this.configureKTX2(options.ktx2TranscoderPath)
    }
  }

  configureKTX2(transcoderPath: string): void {
    const loader = new KTX2Loader(this.loadingManager)
    loader.setTranscoderPath(transcoderPath)
    loader.detectSupport(this.renderer)
    this.ktx2Loader = loader
  }

  async loadTexture(url: string, options: TextureLoadOptions = {}): Promise<Texture> {
    const key = cacheKey(url, options.cacheKey)
    if (!this.textureCache.has(key)) {
      const request = abortable(options.signal, async () => {
        const loader = new TextureLoader(this.loadingManager)
        const texture = await loader.loadAsync(url, options.onProgress)
        texture.colorSpace = ensureColorSpace(options.colorSpace)
        if (options.flipY !== undefined) texture.flipY = options.flipY
        if (options.wrapS !== undefined) texture.wrapS = options.wrapS
        if (options.wrapT !== undefined) texture.wrapT = options.wrapT
        if (options.magFilter !== undefined) texture.magFilter = options.magFilter
        if (options.minFilter !== undefined) texture.minFilter = options.minFilter
        if (options.generateMipmaps !== undefined) texture.generateMipmaps = options.generateMipmaps
        texture.needsUpdate = true
        return texture
      })
      this.textureCache.set(key, request)
    }
    return this.textureCache.get(key)!
  }

  async loadKTX2Texture(url: string, options: KTX2TextureOptions = {}): Promise<Texture> {
    const key = cacheKey(url, options.cacheKey)
    if (!this.textureCache.has(key)) {
      const request = abortable(options.signal, async () => {
        if (!this.ktx2Loader) {
          const transcoderPath = options.transcoderPath ?? 'jsm/libs/basis/'
          this.configureKTX2(transcoderPath)
        }

        const loader = this.ktx2Loader!
        const texture = await loader.loadAsync(url, options.onProgress)
        texture.colorSpace = ensureColorSpace(options.colorSpace)
        if (options.wrapS !== undefined) texture.wrapS = options.wrapS
        if (options.wrapT !== undefined) texture.wrapT = options.wrapT
        if (options.magFilter !== undefined) texture.magFilter = options.magFilter
        if (options.minFilter !== undefined) texture.minFilter = options.minFilter
        texture.needsUpdate = true
        return texture
      })

      this.textureCache.set(key, request)
    }
    return this.textureCache.get(key)!
  }

  async loadHDRTexture(url: string, options: HDRTextureOptions = {}): Promise<Texture> {
    const key = cacheKey(url, options.cacheKey)
    if (!this.hdrCache.has(key)) {
      const request = abortable(options.signal, async () => {
        const loader = new RGBELoader(this.loadingManager)
        const dataType: TextureDataType = options.type ?? HalfFloatType
        loader.setDataType(dataType)
        const texture = await loader.loadAsync(url, options.onProgress)
        texture.colorSpace = ensureColorSpace(options.colorSpace)
        texture.needsUpdate = true

        const shouldPMREM = options.pmrem ?? this.defaultPMREM
        if (!shouldPMREM) {
          return texture
        }

        const target = await (this.pmrem as any).fromEquirectangularAsync(texture)
        if (options.disposeSource ?? true) {
          texture.dispose()
        }
        return target.texture
      })
      this.hdrCache.set(key, request)
    }
    return this.hdrCache.get(key)!
  }

  async loadEXRTexture(url: string, options: EXRTextureOptions = {}): Promise<DataTexture> {
    const key = cacheKey(url, options.cacheKey)
    if (!this.exrCache.has(key)) {
      const request = abortable(options.signal, async () => {
        const loader = new EXRLoader(this.loadingManager)
        const dataType = (options.type ?? FloatType) as typeof HalfFloatType | typeof FloatType
        loader.setDataType(dataType)
        const texture = await loader.loadAsync(url, options.onProgress)
        texture.colorSpace = DEFAULT_COLOR_SPACE
        texture.needsUpdate = true
        return texture
      })
      this.exrCache.set(key, request)
    }
    return this.exrCache.get(key)!
  }

  async loadCubeTexture(urls: string[], options: CubeTextureOptions = {}): Promise<CubeTexture> {
    const key = cacheKey(urls.join('|'), options.cacheKey)
    if (!this.cubeCache.has(key)) {
      const request = abortable(options.signal, async () => {
        const loader = new CubeTextureLoader(this.loadingManager)
        const texture = await loader.loadAsync(urls, options.onProgress)
        texture.colorSpace = ensureColorSpace(options.colorSpace)
        texture.needsUpdate = true
        return texture
      })
      this.cubeCache.set(key, request)
    }
    return this.cubeCache.get(key)!
  }

  async loadLUTCube(url: string, options: LUTLoadOptions = {}): Promise<LUT3D> {
    const key = cacheKey(url, options.cacheKey)
    if (!this.lutCache.has(key)) {
      const request = abortable(options.signal, async () => {
        const response = await fetch(url, { signal: options.signal })
        if (!response.ok) {
          throw new Error(`Failed to load LUT cube: ${response.status} ${response.statusText}`)
        }
        const text = await response.text()
        return parseCubeLUT(text)
      })
      this.lutCache.set(key, request)
    }
    return this.lutCache.get(key)!
  }

  dispose(): void {
    this.pmrem.dispose()
    for (const promise of this.textureCache.values()) {
      void promise.then((texture) => texture.dispose()).catch(() => {})
    }
    for (const promise of this.hdrCache.values()) {
      void promise.then((texture) => texture.dispose()).catch(() => {})
    }
    for (const promise of this.exrCache.values()) {
      void promise.then((texture) => texture.dispose()).catch(() => {})
    }
    for (const promise of this.cubeCache.values()) {
      void promise.then((texture) => texture.dispose()).catch(() => {})
    }
    this.textureCache.clear()
    this.hdrCache.clear()
    this.exrCache.clear()
    this.cubeCache.clear()
    this.lutCache.clear()
  }
}


