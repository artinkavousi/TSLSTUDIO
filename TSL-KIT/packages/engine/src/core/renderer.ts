import type { ColorRepresentation, ColorSpace, ToneMapping } from 'three'
import { Vector2 } from 'three'
import { LinearSRGBColorSpace, NoToneMapping, WebGPURenderer } from 'three/webgpu'
import type { WebGPURendererParameters } from 'three/src/renderers/webgpu/WebGPURenderer.js'

export interface RendererSize {
  width: number
  height: number
  pixelRatio: number
}

type ResizeTarget = HTMLElement | Window

export type AutoResizeOption =
  | boolean
  | {
      target?: ResizeTarget
      /** Debounce interval in milliseconds (default: 24ms). */
      debounce?: number
    }

export interface RendererInitOptions extends Partial<WebGPURendererParameters> {
  /** Desired device pixel ratio. Defaults to `window.devicePixelRatio` if available. */
  pixelRatio?: number
  /** Tone mapping operator to apply. Defaults to `NoToneMapping`. */
  toneMapping?: ToneMapping
  /** Exposure multiplier applied when tone mapping is enabled. Defaults to `1`. */
  exposure?: number
  /** Output color space; defaults to `LinearSRGBColorSpace`. */
  outputColorSpace?: ColorSpace
  /** Set to `null` to disable automatic clear, omit to keep renderer default. */
  clearColor?: ColorRepresentation | null
  /** Automatically resize the renderer whenever the target changes size. */
  autoResize?: AutoResizeOption
  /** Optional callback invoked after the renderer size changes. */
  onResize?: (size: RendererSize) => void
}

export interface RendererHandle {
  readonly renderer: WebGPURenderer
  /** Returns the latest cached renderer size state. */
  getSize(): RendererSize
  /** Forces the renderer to a specific size (CSS pixels). */
  setSize(width: number, height: number, updateStyle?: boolean): void
  /** Updates the device pixel ratio and re-computes the drawing buffer size. */
  setPixelRatio(pixelRatio: number): void
  /** Updates tone mapping exposure. */
  setExposure(exposure: number): void
  /** Updates tone mapping operator. */
  setToneMapping(toneMapping: ToneMapping): void
  /** Updates renderer output color space. */
  setOutputColorSpace(colorSpace: ColorSpace): void
  /** Updates the clear colour or disables it when `null` is provided. */
  setClearColor(color: ColorRepresentation | null, alpha?: number): void
  /** Measures the target element and reapplies size + DPR. */
  refresh(): void
  /** Tears down resize observers and disposes of the renderer. */
  dispose(): void
}

const DEFAULT_DEBOUNCE_MS = 24

const isHTMLElement = (target: ResizeTarget | undefined): target is HTMLElement =>
  typeof window !== 'undefined' && target instanceof HTMLElement

function resolveResizeTarget(renderer: WebGPURenderer, option: AutoResizeOption | undefined): ResizeTarget | undefined {
  if (option === false) return undefined
  if (typeof option === 'object' && option.target) return option.target

  const canvas = renderer.domElement
  if (canvas && canvas.parentElement) return canvas.parentElement
  if (canvas) return canvas as unknown as HTMLElement
  if (typeof window !== 'undefined') return window
  return undefined
}

function measureSize(renderer: WebGPURenderer, target?: ResizeTarget): { width: number; height: number } {
  if (isHTMLElement(target)) {
    const { clientWidth, clientHeight } = target
    if (clientWidth > 0 && clientHeight > 0) {
      return { width: clientWidth, height: clientHeight }
    }

    const rect = target.getBoundingClientRect()
    if (rect.width > 0 && rect.height > 0) {
      return { width: rect.width, height: rect.height }
    }
  }

  const canvas = renderer.domElement as HTMLCanvasElement | undefined
  if (canvas) {
    const width = canvas.clientWidth || canvas.width
    const height = canvas.clientHeight || canvas.height
    if (width > 0 && height > 0) {
      return { width, height }
    }
  }

  if (typeof window !== 'undefined') {
    return { width: window.innerWidth, height: window.innerHeight }
  }

  return { width: 1, height: 1 }
}

function createResizeScheduler(callback: () => void, debounceMs: number) {
  let timer = -1
  let frame = -1

  const clearPending = () => {
    if (timer !== -1) {
      window.clearTimeout(timer)
      timer = -1
    }
    if (frame !== -1) {
      window.cancelAnimationFrame(frame)
      frame = -1
    }
  }

  const schedule = () => {
    if (typeof window === 'undefined') {
      callback()
      return
    }

    if (debounceMs <= 0) {
      frame = window.requestAnimationFrame(() => {
        frame = -1
        callback()
      })
      return
    }

    if (timer !== -1) {
      window.clearTimeout(timer)
      timer = -1
    }

    timer = window.setTimeout(() => {
      timer = -1
      frame = window.requestAnimationFrame(() => {
        frame = -1
        callback()
      })
    }, debounceMs)
  }

  return { schedule, clearPending }
}

export async function createRenderer(options: RendererInitOptions = {}): Promise<RendererHandle> {
  const {
    pixelRatio = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1,
    toneMapping = NoToneMapping,
    exposure = 1,
    outputColorSpace = LinearSRGBColorSpace,
    clearColor,
    autoResize = { debounce: DEFAULT_DEBOUNCE_MS },
    onResize,
    ...rendererParams
  } = options

  const renderer = new WebGPURenderer(rendererParams)
  await renderer.init()

  renderer.outputColorSpace = outputColorSpace
  renderer.toneMapping = toneMapping
  renderer.toneMappingExposure = exposure
  renderer.setPixelRatio(pixelRatio)

  if (clearColor !== undefined) {
    if (clearColor === null) {
      renderer.autoClearColor = false
    } else {
      renderer.autoClearColor = true
      renderer.setClearColor(clearColor)
    }
  }

  const resizeTarget = resolveResizeTarget(renderer, autoResize)
  const sizeState: RendererSize = { width: 0, height: 0, pixelRatio }
  const tempSize = new Vector2()

  const notifyResize = () => {
    onResize?.({ ...sizeState })
  }

  const applySize = (width: number, height: number, updateStyle = false) => {
    if (width <= 0 || height <= 0) return

    renderer.setSize(width, height, updateStyle)
    renderer.getSize(tempSize)
    sizeState.width = tempSize.x
    sizeState.height = tempSize.y
    notifyResize()
  }

  const refresh = () => {
    const { width, height } = measureSize(renderer, resizeTarget)
    if (width === sizeState.width && height === sizeState.height) {
      return
    }
    applySize(width, height, false)
  }

  let resizeObserver: ResizeObserver | null = null
  let resizeListener: (() => void) | null = null
  let schedulerCleanup = () => {}

  const setupAutoResize = () => {
    if (!autoResize) return
    if (typeof window === 'undefined') return

    const debounceMs = typeof autoResize === 'object' ? autoResize.debounce ?? DEFAULT_DEBOUNCE_MS : DEFAULT_DEBOUNCE_MS
    const { schedule, clearPending } = createResizeScheduler(refresh, debounceMs)
    schedulerCleanup = clearPending

    if (resizeTarget && isHTMLElement(resizeTarget) && 'ResizeObserver' in window) {
      resizeObserver = new ResizeObserver(() => {
        schedule()
      })
      resizeObserver.observe(resizeTarget)
    } else {
      resizeListener = () => schedule()
      window.addEventListener('resize', resizeListener)
    }
  }

  setupAutoResize()
  refresh()

  const handle: RendererHandle = {
    renderer,
    getSize: () => ({ ...sizeState }),
    setSize: (width: number, height: number, updateStyle = false) => {
      applySize(width, height, updateStyle)
    },
    setPixelRatio: (nextPixelRatio: number) => {
      const clamped = Math.max(0.1, nextPixelRatio)
      sizeState.pixelRatio = clamped
      renderer.setPixelRatio(clamped)
      refresh()
    },
    setExposure: (value: number) => {
      renderer.toneMappingExposure = value
    },
    setToneMapping: (value: ToneMapping) => {
      renderer.toneMapping = value
    },
    setOutputColorSpace: (value: ColorSpace) => {
      renderer.outputColorSpace = value
    },
    setClearColor: (color: ColorRepresentation | null, alpha?: number) => {
      if (color === null) {
        renderer.autoClearColor = false
        return
      }
      renderer.autoClearColor = true
      if (alpha !== undefined) {
        renderer.setClearColor(color, alpha)
      } else {
        renderer.setClearColor(color)
      }
    },
    refresh,
    dispose: () => {
      if (resizeObserver) {
        resizeObserver.disconnect()
        resizeObserver = null
      }
      if (resizeListener) {
        window.removeEventListener('resize', resizeListener)
        resizeListener = null
      }
      schedulerCleanup()
      renderer.dispose()
    },
  }

  return handle
}

