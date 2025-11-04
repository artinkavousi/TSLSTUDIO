import { HalfFloatType, RenderTarget, Vector2 } from 'three'
import { QuadMesh, RendererUtils, TempNode, NodeMaterial, NodeUpdateType } from 'three/webgpu'
import {
  clamp,
  convertToTexture,
  float,
  max,
  min,
  passTexture,
  texture,
  uniform,
  uv,
  vec2,
  vec4,
  type ShaderNodeObject,
} from 'three/tsl'
import type { PassTextureNode } from 'three/tsl'
import type { Node } from 'three/webgpu'

const _quad = /* @__PURE__ */ new QuadMesh()
const _size = /* @__PURE__ */ new Vector2()

export interface TemporalAccumulationSettings {
  historyWeight?: number
  clampRadius?: number
  clampStrength?: number
}

const DEFAULT_HISTORY_WEIGHT = 0.875
const DEFAULT_CLAMP_RADIUS = 1
const DEFAULT_CLAMP_STRENGTH = 0.08

const OFFSETS = [
  vec2(0, 0),
  vec2(1, 0),
  vec2(-1, 0),
  vec2(0, 1),
  vec2(0, -1),
  vec2(1, 1),
  vec2(-1, -1),
  vec2(1, -1),
  vec2(-1, 1),
]

let _rendererState: unknown

export class TemporalAccumulationNode extends TempNode {
  static get type() {
    return 'TemporalAccumulationNode'
  }

  readonly inputNode: ShaderNodeObject<Node>
  private readonly historyRT: RenderTarget
  private readonly resolveRT: RenderTarget
  private readonly invSize = uniform(new Vector2())
  private readonly historyWeightNode = uniform(DEFAULT_HISTORY_WEIGHT)
  private readonly clampStrengthNode = uniform(DEFAULT_CLAMP_STRENGTH)
  private readonly clampRadiusNode = uniform(DEFAULT_CLAMP_RADIUS)
  private readonly historyTexture: ReturnType<typeof texture>
  private readonly material: NodeMaterial
  private readonly outputNode: PassTextureNode
  private initialized = false

  constructor(input: ShaderNodeObject<Node>, settings: TemporalAccumulationSettings = {}) {
    super('vec4')

    this.inputNode = input
    this.historyRT = new RenderTarget(1, 1, { depthBuffer: false, type: HalfFloatType })
    this.historyRT.texture.name = 'TemporalAccumulation.history'

    this.resolveRT = new RenderTarget(1, 1, { depthBuffer: false, type: HalfFloatType })
    this.resolveRT.texture.name = 'TemporalAccumulation.resolve'

    this.historyTexture = texture(this.historyRT.texture)

    this.material = new NodeMaterial()
    this.material.name = 'TemporalAccumulation.material'

    this.outputNode = passTexture(this, this.resolveRT.texture)

    this.updateSettings(settings)

    this.updateBeforeType = NodeUpdateType.FRAME
  }

  updateSettings(settings: TemporalAccumulationSettings = {}) {
    if (settings.historyWeight !== undefined) {
      const clamped = Math.max(0, Math.min(settings.historyWeight, 0.995))
      this.historyWeightNode.value = clamped
    }

    if (settings.clampStrength !== undefined) {
      const clamped = Math.max(0.001, Math.min(settings.clampStrength, 1))
      this.clampStrengthNode.value = clamped
    }

    if (settings.clampRadius !== undefined) {
      const clamped = Math.max(0, Math.min(settings.clampRadius, 2))
      this.clampRadiusNode.value = clamped
    }
  }

  getTextureNode(): PassTextureNode {
    return this.outputNode
  }

  setSize(width: number, height: number) {
    this.historyRT.setSize(width, height)
    this.resolveRT.setSize(width, height)
    this.invSize.value.set(1 / Math.max(width, 1), 1 / Math.max(height, 1))
  }

  /**
   * Reset history so the current frame becomes the new baseline.
   */
  reset() {
    this.initialized = false
  }

  override setup() {
    const uvNode = uv()
    const inputTexture = convertToTexture(this.inputNode)
    const currentSample = inputTexture.sample(uvNode).toVar()
    const historySample = this.historyTexture.sample(uvNode).toVar()

    const neighborColors: ShaderNodeObject<Node>[] = OFFSETS.map((offset) =>
      this.historyTexture.sample(uvNode.add(offset.mul(this.invSize))).xyz,
    )

    let neighborhoodMin = neighborColors[0]
    let neighborhoodMax = neighborColors[0]
    for (let i = 1; i < neighborColors.length; i += 1) {
      neighborhoodMin = min(neighborhoodMin, neighborColors[i])
      neighborhoodMax = max(neighborhoodMax, neighborColors[i])
    }

    const clampStrength = float(this.clampStrengthNode).mul(float(1).add(float(this.clampRadiusNode).mul(0.5)))
    const clampMin = neighborhoodMin.sub(clampStrength)
    const clampMax = neighborhoodMax.add(clampStrength)
    const clamped = clamp(currentSample.xyz, clampMin, clampMax)

    const historyWeight = float(this.historyWeightNode)
    const resultColor = historySample.xyz.mul(historyWeight).add(clamped.mul(float(1).sub(historyWeight)))

    this.material.fragmentNode = vec4(resultColor, currentSample.w)

    return this.outputNode
  }

  override updateBefore(frame: any) {
    const { renderer } = frame

    const textureNode = convertToTexture(this.inputNode)
    const sourceRT = textureNode.renderTarget ?? textureNode.passNode?.renderTarget
    if (!sourceRT) {
      return
    }

    const width = sourceRT.texture.width || 1
    const height = sourceRT.texture.height || 1

    const needsResize = this.historyRT.width !== width || this.historyRT.height !== height
    if (needsResize) {
      this.setSize(width, height)
      this.initialized = false
    }

    _rendererState = RendererUtils.resetRendererState(renderer, _rendererState)

    if (!this.initialized) {
      renderer.copyTextureToTexture(sourceRT.texture, this.historyRT.texture)
      this.initialized = true
    }

    renderer.setRenderTarget(this.resolveRT)
    _quad.material = this.material
    _quad.name = 'TemporalAccumulation'
    _quad.render(renderer)
    renderer.setRenderTarget(null)

    renderer.copyTextureToTexture(this.resolveRT.texture, this.historyRT.texture)

    RendererUtils.restoreRendererState(renderer, _rendererState)
  }

  dispose() {
    this.historyRT.dispose()
    this.resolveRT.dispose()
  }
}


