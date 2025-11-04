import type { ScenePassOptions } from '../core/framegraph'; 
import { createScenePass, type Framegraph } from '../core/framegraph'; 

import type { PostEffect } from '@tslstudio/tsl/post/types'; 

import { createPostProcessingPass, type PostProcessingAttachments, type PostProcessingPassOptions } from './pass'; 
import {
  createGTAOEffect,
  createSSGIEffect,
  createSSREffect,
  resolveScreenSpaceConfig,
  type ScreenSpaceEffectsConfig,
} from './screenspace'; 
import {
  createTemporalAAPasses,
  getTemporalAAPreset,
  type TemporalAAOptions,
  type TemporalAAPreset,
} from './taa'; 
import { createPresetEffects, type FXPresetName, type FXPresetOptions } from './presets'; 
import { createAdvancedDOF, type AdvancedDOFOptions } from './dof'; 
import {
  createColorGradingPipeline,
  type ColorGradingPipelineOptions,
} from './colorGrading'; 

export interface FXPipelineOptions {
  taa?: TemporalAAOptions | TemporalAAPreset | false
  scene?: ScenePassOptions
  post?: PostProcessingPassOptions
  screenSpace?: ScreenSpaceEffectsConfig
  presets?: {
    names: FXPresetName[]
    options?: FXPresetOptions
  }
  depthOfField?: AdvancedDOFOptions | false
  colorGrading?: ColorGradingPipelineOptions | false
}

export interface FXPipelineHandle {
  scenePass: ReturnType<typeof createScenePass>
  postPass: ReturnType<typeof createPostProcessingPass>
  taa?: {
    currentTargetKey: string
    resolvedTargetKey: string
  }
}

export function buildFXPipeline(framegraph: Framegraph, effects: PostEffect[], options: FXPipelineOptions = {}): FXPipelineHandle {
  const taaOptions = resolveTaaOptions(options.taa)
  const taa = taaOptions ? createTemporalAAPasses(taaOptions) : null

  if (taa) {
    framegraph.addPass(taa.passes[0])
  }

  const scenePass = createScenePass({
    ...(options.scene ?? {}),
    target: taa ? taa.currentTargetKey : options.scene?.target,
  })
  framegraph.addPass(scenePass)

  if (taa) {
    framegraph.addPass(taa.passes[1])
  }

  const screenSpaceEffects: PostEffect[] = []
  const dofEffects: PostEffect[] = []
  const colorGradingEffects: PostEffect[] = []
  const attachments: PostProcessingAttachments = { ...(options.post?.attachments ?? {}) }

  const resolvedScreenSpace = resolveScreenSpaceConfig(options.screenSpace)
  if (resolvedScreenSpace.gtao) {
    attachments.normal = true
    screenSpaceEffects.push(createGTAOEffect(resolvedScreenSpace.gtao))
  }

  if (resolvedScreenSpace.ssgi) {
    attachments.normal = true
    attachments.diffuse = true
    attachments.metalRough = true
    screenSpaceEffects.push(createSSGIEffect(resolvedScreenSpace.ssgi))
  }

  if (resolvedScreenSpace.ssr) {
    attachments.normal = true
    attachments.metalRough = true
    screenSpaceEffects.push(createSSREffect(resolvedScreenSpace.ssr))
  }

  const presetEffects: PostEffect[] = []
  if (options.presets?.names.length) {
    for (const name of options.presets.names) {
      presetEffects.push(...createPresetEffects(name, options.presets.options))
    }
  }

  let resolvedDOF: AdvancedDOFOptions | undefined
  if (options.depthOfField === false) {
    resolvedDOF = undefined
  } else if (options.depthOfField) {
    resolvedDOF = options.depthOfField
  } else if (options.presets?.options?.dof === false) {
    resolvedDOF = undefined
  } else {
    resolvedDOF = options.presets?.options?.dof ?? resolvePresetDOF(options.presets?.names)
  }

  if (resolvedDOF) {
    dofEffects.push(createAdvancedDOF(resolvedDOF))
  }

  let resolvedColorGrading: ColorGradingPipelineOptions | undefined
  if (options.colorGrading === false) {
    resolvedColorGrading = undefined
  } else if (options.colorGrading) {
    resolvedColorGrading = options.colorGrading
  } else if (options.presets?.options?.colorGrading === false) {
    resolvedColorGrading = undefined
  } else {
    resolvedColorGrading = options.presets?.options?.colorGrading ?? resolvePresetColorGrading(options.presets?.names)
  }

  if (resolvedColorGrading) {
    colorGradingEffects.push(...createColorGradingPipeline(resolvedColorGrading))
  }

  const combinedEffects = [...screenSpaceEffects, ...dofEffects, ...colorGradingEffects, ...presetEffects, ...effects]

  const postPass = createPostProcessingPass(combinedEffects, {
    ...(options.post ?? {}),
    inputKey: taa ? taa.resolvedTargetKey : options.post?.inputKey,
    attachments,
  })
  framegraph.addPass(postPass)

  return {
    scenePass,
    postPass,
    taa: taa ? { currentTargetKey: taa.currentTargetKey, resolvedTargetKey: taa.resolvedTargetKey } : undefined,
  }
}

const PRESET_DOF_DEFAULTS: Partial<Record<FXPresetName, AdvancedDOFOptions>> = {
  retro: { focusDistance: 2.4, focusRange: 0.9, maxBlur: 9, aperture: 1.2, highlightBoost: 0.7, blades: 7 },
  noir: { focusDistance: 3.1, focusRange: 1.5, maxBlur: 6, aperture: 0.85, highlightBoost: 0.45, blades: 9 },
  arcade: { focusDistance: 1.8, focusRange: 0.6, maxBlur: 7, aperture: 1.05, highlightBoost: 0.5, blades: 6 },
}

const PRESET_COLOR_GRADING_DEFAULTS: Partial<Record<FXPresetName, ColorGradingPipelineOptions>> = {
  retro: {
    exposure: -0.1,
    gamma: 1.05,
    tonemapCurve: 'Uncharted2',
    intensity: 0.85,
    curves: {
      slope: [0.98, 0.98, 0.95],
      lift: [0.03, 0.02, 0.01],
      gain: [1.04, 1.0, 0.96],
      saturation: 0.9,
      contrast: 0.95,
    },
  },
  noir: {
    exposure: -0.05,
    gamma: 1.1,
    tonemapCurve: 'Reinhard',
    intensity: 1,
    curves: {
      slope: [0.95, 0.95, 0.95],
      gain: [1.05, 1.05, 1.05],
      saturation: 0.35,
      contrast: 1.15,
    },
  },
  arcade: {
    exposure: 0.25,
    gamma: 0.9,
    tonemapCurve: 'ACES',
    intensity: 1.1,
    curves: {
      slope: [1.1, 1.05, 1.2],
      gain: [1.12, 1.08, 1.05],
      saturation: 1.3,
      contrast: 1.1,
    },
  },
}

function resolvePresetDOF(names?: FXPresetName[]): AdvancedDOFOptions | undefined {
  if (!names) return undefined
  for (const name of names) {
    const preset = PRESET_DOF_DEFAULTS[name]
    if (preset) {
      return preset
    }
  }
  return undefined
}

function resolvePresetColorGrading(names?: FXPresetName[]): ColorGradingPipelineOptions | undefined {
  if (!names) return undefined
  for (const name of names) {
    const preset = PRESET_COLOR_GRADING_DEFAULTS[name]
    if (preset) {
      return preset
    }
  }
  return undefined
}

function resolveTaaOptions(input: FXPipelineOptions['taa']): TemporalAAOptions | undefined {
  if (input === false) return undefined
  if (typeof input === 'string') {
    const preset = getTemporalAAPreset(input)
    return { ...preset }
  }
  if (input) {
    return { ...input }
  }
  return {}
}

