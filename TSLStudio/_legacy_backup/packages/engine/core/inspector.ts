import type { WebGPURenderer } from 'three/webgpu'
import type { Framegraph, FramegraphProfile } from './framegraph'

export type InspectorOptions = {
  parent?: HTMLElement
  historySize?: number
  targetFps?: number
  framegraph?: Framegraph
  precision?: number
}

type RendererInfo = {
  fps: number
  ms: number
  calls: number
  triangles: number
  points: number
  lines: number
  geometries: number
  textures: number
}

const DEFAULT_HISTORY = 180
const DEFAULT_TARGET_FPS = 120

export class EngineInspector {
  private readonly renderer: WebGPURenderer
  private readonly historySize: number
  private readonly targetFps: number
  private readonly precision: number

  private enabled = true
  private readonly fpsHistory: Float32Array
  private historyIndex = 0

  private readonly container?: HTMLDivElement
  private readonly statsLine?: HTMLDivElement
  private readonly graphCanvas?: HTMLCanvasElement
  private readonly graphCtx?: CanvasRenderingContext2D | null
  private readonly passesBlock?: HTMLPreElement

  private framegraph?: Framegraph
  private profilerListener?: (profile: FramegraphProfile) => void

  constructor(renderer: WebGPURenderer, options: InspectorOptions = {}) {
    this.renderer = renderer
    this.historySize = options.historySize ?? DEFAULT_HISTORY
    this.targetFps = options.targetFps ?? DEFAULT_TARGET_FPS
    this.precision = options.precision ?? 1
    this.fpsHistory = new Float32Array(this.historySize)

    if (typeof document !== 'undefined') {
      const container = document.createElement('div')
      container.setAttribute('data-tsl-inspector', 'true')
      container.style.position = 'fixed'
      container.style.left = '16px'
      container.style.bottom = '16px'
      container.style.padding = '12px 16px'
      container.style.borderRadius = '12px'
      container.style.backdropFilter = 'blur(18px)'
      container.style.background = 'rgba(10, 12, 16, 0.72)'
      container.style.color = '#f5f9ff'
      container.style.fontFamily = 'system-ui, sans-serif'
      container.style.fontSize = '12px'
      container.style.lineHeight = '18px'
      container.style.letterSpacing = '0.03em'
      container.style.pointerEvents = 'none'
      container.style.zIndex = '9999'
      container.style.boxShadow = '0 12px 32px rgba(10, 12, 16, 0.35)'

      const statsLine = document.createElement('div')
      statsLine.style.whiteSpace = 'pre'
      statsLine.style.fontWeight = '500'
      statsLine.textContent = 'fps —'

      const graphCanvas = document.createElement('canvas')
      graphCanvas.width = this.historySize
      graphCanvas.height = 40
      graphCanvas.style.width = '180px'
      graphCanvas.style.height = '40px'
      graphCanvas.style.display = 'block'
      graphCanvas.style.marginTop = '8px'
      graphCanvas.style.filter = 'drop-shadow(0 4px 12px rgba(8, 10, 14, 0.35))'

      const graphCtx = graphCanvas.getContext('2d', { alpha: true })

      const passesBlock = document.createElement('pre')
      passesBlock.style.margin = '8px 0 0'
      passesBlock.style.whiteSpace = 'pre-wrap'
      passesBlock.style.opacity = '0.75'
      passesBlock.style.fontFamily = 'ui-monospace, SFMono-Regular, SFMono, Menlo, Consolas, monospace'
      passesBlock.style.maxWidth = '220px'

      container.appendChild(statsLine)
      container.appendChild(graphCanvas)
      container.appendChild(passesBlock)

      ;(options.parent ?? document.body).appendChild(container)

      this.container = container
      this.statsLine = statsLine
      this.graphCanvas = graphCanvas
      this.graphCtx = graphCtx
      this.passesBlock = passesBlock
    }

    if (options.framegraph) {
      this.attachFramegraph(options.framegraph)
    }
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled
    if (this.container) {
      this.container.style.display = enabled ? 'block' : 'none'
    }
  }

  attachFramegraph(framegraph: Framegraph): void {
    if (this.framegraph === framegraph) return
    this.detachFramegraph()
    this.framegraph = framegraph
    const listener = (profile: FramegraphProfile) => this.updatePasses(profile)
    this.profilerListener = listener
    framegraph.setProfilingEnabled(true)
    framegraph.addProfilerListener(listener)
  }

  detachFramegraph(): void {
    if (this.framegraph && this.profilerListener) {
      this.framegraph.removeProfilerListener(this.profilerListener)
    }
    this.framegraph = undefined
    this.profilerListener = undefined
    if (this.passesBlock) {
      this.passesBlock.textContent = ''
    }
  }

  update(delta: number): void {
    if (!this.enabled) return

    const fps = delta > 0 ? 1 / delta : 0
    this.fpsHistory[this.historyIndex] = fps
    this.historyIndex = (this.historyIndex + 1) % this.historySize

    this.drawGraph()
    this.updateStats(delta, fps)
  }

  dispose(): void {
    this.detachFramegraph()
    if (this.container && this.container.parentElement) {
      this.container.parentElement.removeChild(this.container)
    }
  }

  private updateStats(delta: number, fps: number): void {
    if (!this.statsLine) return
    const info = extractRendererInfo(this.renderer)
    info.fps = fps
    info.ms = delta * 1000
    const { precision } = this

    const text = `fps ${info.fps.toFixed(precision)} | ${info.ms.toFixed(precision + 1)} ms  ·  calls ${info.calls}  ·  tris ${info.triangles}  ·  pts ${info.points}  ·  lines ${info.lines}  ·  geo ${info.geometries}  ·  tex ${info.textures}`

    this.statsLine.textContent = text
  }

  private drawGraph(): void {
    if (!this.graphCtx || !this.graphCanvas) return

    const ctx = this.graphCtx
    const width = this.graphCanvas.width
    const height = this.graphCanvas.height
    const target = this.targetFps

    ctx.clearRect(0, 0, width, height)

    ctx.strokeStyle = 'rgba(120, 178, 255, 0.35)'
    ctx.beginPath()
    const baseline = height - (Math.min(60, target) / target) * height
    ctx.moveTo(0, baseline)
    ctx.lineTo(width, baseline)
    ctx.stroke()

    ctx.strokeStyle = 'rgba(120, 194, 255, 0.95)'
    ctx.lineWidth = 1.5
    ctx.beginPath()

    for (let i = 0; i < this.historySize; i++) {
      const idx = (this.historyIndex + i) % this.historySize
      const value = this.fpsHistory[idx]
      const normalized = target > 0 ? Math.min(value / target, 1) : 0
      const x = i
      const y = height - normalized * height
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }
    ctx.stroke()
  }

  private updatePasses(profile: FramegraphProfile): void {
    if (!this.passesBlock) return
    const rows = profile.passes
      .map((pass) => `${pass.name.padEnd(16, ' ')} ${pass.duration.toFixed(2)}ms`)
      .join('\n')
    this.passesBlock.textContent = rows
  }
}

function extractRendererInfo(renderer: WebGPURenderer): RendererInfo {
  const info = renderer.info
  const renderInfo = info.render
  const memory = info.memory

  return {
    fps: 0,
    ms: 0,
    calls: renderInfo.calls,
    triangles: renderInfo.triangles,
    points: renderInfo.points,
    lines: renderInfo.lines,
    geometries: memory.geometries,
    textures: memory.textures,
  }
}



