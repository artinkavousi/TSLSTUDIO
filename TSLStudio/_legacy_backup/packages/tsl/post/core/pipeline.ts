// @ts-nocheck
import type { Framegraph } from '@engine/core/framegraph'
import { createScenePass, type ScenePassOptions } from '@engine/core/framegraph'
import type { PostEffect } from './types'
import { createTemporalAAPasses, type TemporalAAOptions } from '../effects/taa'
import { createPostProcessingPass, type PostProcessingPassOptions } from './pass'

export type FXPipelineOptions = {
  taa?: TemporalAAOptions | false
  scene?: ScenePassOptions
  post?: PostProcessingPassOptions
}

export type FXPipelineHandle = {
  scenePass: ReturnType<typeof createScenePass>
  postPass: ReturnType<typeof createPostProcessingPass>
  taa?: {
    currentTargetKey: string
    resolvedTargetKey: string
  }
}

export function buildFXPipeline(framegraph: Framegraph, effects: PostEffect[], options: FXPipelineOptions = {}): FXPipelineHandle {
  const taa = options.taa === false ? null : createTemporalAAPasses(options.taa ?? {})

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

  const postPass = createPostProcessingPass(effects, {
    ...(options.post ?? {}),
    inputKey: taa ? taa.resolvedTargetKey : options.post?.inputKey,
  })
  framegraph.addPass(postPass)

  return {
    scenePass,
    postPass,
    taa: taa ? { currentTargetKey: taa.currentTargetKey, resolvedTargetKey: taa.resolvedTargetKey } : undefined,
  }
}



