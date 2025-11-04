import type { Camera } from 'three'
import { blendColor, vec3, uv } from 'three/tsl'
import type { ShaderNodeObject } from 'three/tsl'
import type { Node } from 'three/webgpu'
import { ao } from 'three/examples/jsm/tsl/display/GTAONode.js'
import { ssr } from 'three/examples/jsm/tsl/display/SSRNode.js'
import { ssgi } from 'three/examples/jsm/tsl/display/SSGINode.js'

import type { PostEffect } from '@tslstudio/tsl/post/types'; 

import { FX_RESOURCE_KEYS } from './pass'; 
import { TemporalAccumulationNode, type TemporalAccumulationSettings } from 

type NodeLike = ShaderNodeObject<Node>

const TEMPORAL_SSR_KEY = 'fx.state.ssr'
const TEMPORAL_GTAO_KEY = 'fx.state.gtao'
const TEMPORAL_SSGI_KEY = 'fx.state.ssgi'

interface TemporalFilterOptions extends TemporalAccumulationSettings {
  enabled?: boolean
}

interface SSREffectState {
  ssrNode: ReturnType<typeof ssr>
  temporal: TemporalAccumulationNode
}

interface GTAOEffectState {
  aoNode: ReturnType<typeof ao>
  temporal: TemporalAccumulationNode
}

interface SSGIEffectState {
  giNode: ReturnType<typeof ssgi>
  temporal: TemporalAccumulationNode
}

export type ScreenSpaceQualityPreset = 'performance' | 'balanced' | 'high'

interface ScreenSpacePresetOptions {
  ssr?: SSREffectOptions
  gtao?: GTAOEffectOptions
  ssgi?: SSGIEffectOptions
}

const SCREEN_SPACE_QUALITY_PRESETS: Record<ScreenSpaceQualityPreset, ScreenSpacePresetOptions> = {
  performance: {
    ssr: {
      quality: 0.4,
      resolutionScale: 0.6,
      blurQuality: 1,
      temporal: { historyWeight: 0.78, clampStrength: 0.14 },
    },
    gtao: {
      samples: 8,
      resolutionScale: 0.75,
      temporal: { historyWeight: 0.8, clampStrength: 0.1 },
    },
    ssgi: {
      sliceCount: 1,
      stepCount: 8,
      giIntensity: 8,
      aoIntensity: 1.1,
      temporal: { historyWeight: 0.82, clampStrength: 0.18 },
    },
  },
  balanced: {
    ssr: {
      quality: 0.65,
      resolutionScale: 0.8,
      blurQuality: 2,
      temporal: { historyWeight: 0.86, clampStrength: 0.1 },
    },
    gtao: {
      samples: 12,
      resolutionScale: 0.9,
      temporal: { historyWeight: 0.86, clampStrength: 0.08 },
    },
    ssgi: {
      sliceCount: 2,
      stepCount: 10,
      giIntensity: 10,
      aoIntensity: 1.2,
      temporal: { historyWeight: 0.88, clampStrength: 0.14 },
    },
  },
  high: {
    ssr: {
      quality: 1,
      resolutionScale: 1,
      blurQuality: 3,
      temporal: { historyWeight: 0.92, clampStrength: 0.06 },
    },
    gtao: {
      samples: 16,
      resolutionScale: 1,
      temporal: { historyWeight: 0.9, clampStrength: 0.06 },
    },
    ssgi: {
      sliceCount: 3,
      stepCount: 14,
      giIntensity: 12,
      aoIntensity: 1.3,
      temporal: { historyWeight: 0.92, clampStrength: 0.1 },
    },
  },
}

function getNode(resources: Map<string, unknown>, key: string): NodeLike | undefined {
  const value = resources.get(key)
  return value as NodeLike | undefined
}

function getCamera(resources: Map<string, unknown>): Camera | undefined {
  return resources.get(FX_RESOURCE_KEYS.camera) as Camera | undefined
}

function resolveTemporal(options?: TemporalFilterOptions): {
  enabled: boolean
  settings: TemporalAccumulationSettings
} {
  return {
    enabled: options?.enabled !== false,
    settings: {
      historyWeight: options?.historyWeight,
      clampRadius: options?.clampRadius,
      clampStrength: options?.clampStrength,
    },
  }
}

function cloneTemporal(options?: TemporalFilterOptions): TemporalFilterOptions | undefined {
  if (!options) return undefined
  return { ...options }
}

function mergeEffectOptions<T extends { temporal?: TemporalFilterOptions }>(
  preset: T | undefined,
  value: boolean | T | undefined,
): T | undefined {
  if (value === undefined || value === false) {
    return undefined
  }

  const base = (preset ? { ...preset } : ({} as T))
  if (preset?.temporal) {
    base.temporal = cloneTemporal(preset.temporal)
  }

  if (value !== true) {
    const override = value as T
    if (override.temporal) {
      base.temporal = { ...base.temporal, ...override.temporal }
    }
    const record = base as Record<string, unknown>
    const source = override as Record<string, unknown>
    for (const key of Object.keys(source)) {
      if (key === 'temporal') continue
      record[key] = source[key]
    }
  }

  return base
}

export interface ScreenSpaceEffectsConfig {
  quality?: ScreenSpaceQualityPreset
  ssr?: boolean | SSREffectOptions
  gtao?: boolean | GTAOEffectOptions
  ssgi?: boolean | SSGIEffectOptions
}

export interface ResolvedScreenSpaceConfig {
  ssr?: SSREffectOptions
  gtao?: GTAOEffectOptions
  ssgi?: SSGIEffectOptions
}

export function resolveScreenSpaceConfig(config?: ScreenSpaceEffectsConfig): ResolvedScreenSpaceConfig {
  if (!config) return {}

  const preset = config.quality ? SCREEN_SPACE_QUALITY_PRESETS[config.quality] : undefined

  return {
    ssr: mergeEffectOptions(preset?.ssr, config.ssr),
    gtao: mergeEffectOptions(preset?.gtao, config.gtao),
    ssgi: mergeEffectOptions(preset?.ssgi, config.ssgi),
  }
}

export interface SSREffectOptions {
  maxDistance?: number
  thickness?: number
  opacity?: number
  quality?: number
  blurQuality?: number
  resolutionScale?: number
  temporal?: TemporalFilterOptions
}

export interface GTAOEffectOptions {
  radius?: number
  thickness?: number
  distanceExponent?: number
  distanceFallOff?: number
  scale?: number
  samples?: number
  resolutionScale?: number
  temporal?: TemporalFilterOptions
}

export interface SSGIEffectOptions {
  sliceCount?: number
  stepCount?: number
  aoIntensity?: number
  giIntensity?: number
  radius?: number
  expFactor?: number
  thickness?: number
  backfaceLighting?: number
  useScreenSpaceSampling?: boolean
  temporal?: TemporalFilterOptions
}

export function createSSREffect(options: SSREffectOptions = {}): PostEffect {
  const temporalConfig = resolveTemporal(options.temporal)
  return ({ color, resources }) => {
    const map = resources as Map<string, unknown>
    const colorNode = getNode(map, FX_RESOURCE_KEYS.color)
    const depthNode = getNode(map, FX_RESOURCE_KEYS.depth)
    const normalNode = getNode(map, FX_RESOURCE_KEYS.normal)
    const metalnessNode = getNode(map, FX_RESOURCE_KEYS.metalness)
    const roughnessNode = getNode(map, FX_RESOURCE_KEYS.roughness)
    const camera = getCamera(map)

    if (!colorNode || !depthNode || !normalNode || !metalnessNode || !camera) {
      const state = map.get(TEMPORAL_SSR_KEY) as SSREffectState | undefined
      state?.temporal.reset()
      return color
    }

    let state = map.get(TEMPORAL_SSR_KEY) as SSREffectState | undefined
    if (!state) {
      const ssrNode = ssr(colorNode, depthNode, normalNode, metalnessNode, roughnessNode ?? null, camera)
      const temporal = new TemporalAccumulationNode(ssrNode.getTextureNode(), temporalConfig.settings)
      state = { ssrNode, temporal }
      map.set(TEMPORAL_SSR_KEY, state)
    } else {
      state.ssrNode.colorNode = colorNode
      state.ssrNode.depthNode = depthNode
      state.ssrNode.normalNode = normalNode
      state.ssrNode.metalnessNode = metalnessNode
      state.ssrNode.roughnessNode = roughnessNode ?? null
      state.ssrNode.camera = camera
    }

    const ssrNode = state.ssrNode
    state.temporal.updateSettings(temporalConfig.settings)

    if (options.maxDistance !== undefined) ssrNode.maxDistance.value = options.maxDistance
    if (options.thickness !== undefined) ssrNode.thickness.value = options.thickness
    if (options.opacity !== undefined) ssrNode.opacity.value = options.opacity
    if (options.quality !== undefined) ssrNode.quality.value = options.quality
    if (options.blurQuality !== undefined) ssrNode.blurQuality.value = options.blurQuality
    if (options.resolutionScale !== undefined) ssrNode.resolutionScale = options.resolutionScale

    const textureNode = temporalConfig.enabled ? state.temporal.getTextureNode() : ssrNode.getTextureNode()
    if (!temporalConfig.enabled) {
      state.temporal.reset()
    }

    const reflection = textureNode.sample(uv()).xyz
    return blendColor(color, reflection)
  }
}

export function createGTAOEffect(options: GTAOEffectOptions = {}): PostEffect {
  const temporalConfig = resolveTemporal(options.temporal)
  return ({ color, resources }) => {
    const map = resources as Map<string, unknown>
    const depthNode = getNode(map, FX_RESOURCE_KEYS.depth)
    const normalNode = getNode(map, FX_RESOURCE_KEYS.normal)
    const camera = getCamera(map)

    if (!depthNode || !camera) {
      const state = map.get(TEMPORAL_GTAO_KEY) as GTAOEffectState | undefined
      state?.temporal.reset()
      return color
    }

    let state = map.get(TEMPORAL_GTAO_KEY) as GTAOEffectState | undefined
    if (!state) {
      const aoNode = ao(depthNode, normalNode ?? null, camera)
      const temporal = new TemporalAccumulationNode(aoNode.getTextureNode(), temporalConfig.settings)
      state = { aoNode, temporal }
      map.set(TEMPORAL_GTAO_KEY, state)
    } else {
      state.aoNode.depthNode = depthNode
      state.aoNode.normalNode = normalNode ?? null
      state.aoNode.camera = camera
    }

    const aoNode = state.aoNode
    state.temporal.updateSettings(temporalConfig.settings)

    if (options.radius !== undefined) aoNode.radius.value = options.radius
    if (options.thickness !== undefined) aoNode.thickness.value = options.thickness
    if (options.distanceExponent !== undefined) aoNode.distanceExponent.value = options.distanceExponent
    if (options.distanceFallOff !== undefined) aoNode.distanceFallOff.value = options.distanceFallOff
    if (options.scale !== undefined) aoNode.scale.value = options.scale
    if (options.samples !== undefined) aoNode.samples.value = options.samples
    if (options.resolutionScale !== undefined) aoNode.resolutionScale = options.resolutionScale

    const aoTexture = temporalConfig.enabled ? state.temporal.getTextureNode() : aoNode.getTextureNode()
    if (!temporalConfig.enabled) {
      state.temporal.reset()
    }

    return color.mul(aoTexture)
  }
}

export function createSSGIEffect(options: SSGIEffectOptions = {}): PostEffect {
  const temporalConfig = resolveTemporal(options.temporal)
  return ({ color, resources }) => {
    const map = resources as Map<string, unknown>
    const colorNode = getNode(map, FX_RESOURCE_KEYS.color)
    const depthNode = getNode(map, FX_RESOURCE_KEYS.depth)
    const normalNode = getNode(map, FX_RESOURCE_KEYS.normal)
    const diffuseNode = getNode(map, FX_RESOURCE_KEYS.diffuse)
    const camera = getCamera(map)

    if (!colorNode || !depthNode || !camera) {
      const state = map.get(TEMPORAL_SSGI_KEY) as SSGIEffectState | undefined
      state?.temporal.reset()
      return color
    }

    let state = map.get(TEMPORAL_SSGI_KEY) as SSGIEffectState | undefined
    if (!state) {
      const giNode = ssgi(colorNode, depthNode, normalNode ?? null, camera)
      giNode.useTemporalFiltering = false
      const temporal = new TemporalAccumulationNode(giNode.getTextureNode(), temporalConfig.settings)
      state = { giNode, temporal }
      map.set(TEMPORAL_SSGI_KEY, state)
    } else {
      state.giNode.beautyNode = colorNode
      state.giNode.depthNode = depthNode
      state.giNode.normalNode = normalNode ?? null
      state.giNode.camera = camera
    }

    const giNode = state.giNode
    giNode.useTemporalFiltering = false
    state.temporal.updateSettings(temporalConfig.settings)

    if (options.sliceCount !== undefined) giNode.sliceCount.value = options.sliceCount
    if (options.stepCount !== undefined) giNode.stepCount.value = options.stepCount
    if (options.aoIntensity !== undefined) giNode.aoIntensity.value = options.aoIntensity
    if (options.giIntensity !== undefined) giNode.giIntensity.value = options.giIntensity
    if (options.radius !== undefined) giNode.radius.value = options.radius
    if (options.expFactor !== undefined) giNode.expFactor.value = options.expFactor
    if (options.thickness !== undefined) giNode.thickness.value = options.thickness
    if (options.backfaceLighting !== undefined) giNode.backfaceLighting.value = options.backfaceLighting
    if (options.useScreenSpaceSampling !== undefined) giNode.useScreenSpaceSampling.value = options.useScreenSpaceSampling

    const giTexture = temporalConfig.enabled ? state.temporal.getTextureNode() : giNode.getTextureNode()
    if (!temporalConfig.enabled) {
      state.temporal.reset()
    }

    const giSample = giTexture.sample(uv())
    const gi = giSample.xyz
    const ao = giSample.a
    const diffuse = diffuseNode ?? colorNode

    const combined = color.mul(ao).add(diffuse.rgb.mul(gi))
    return combined
  }
}

export const SCREEN_SPACE_DEFAULTS: ScreenSpaceEffectsConfig = {}

