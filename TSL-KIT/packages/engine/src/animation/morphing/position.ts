import { float, uniform, type ShaderNodeObject } from 'three/tsl'
import type { Node } from 'three/webgpu'

import { createTwoWayMorphNode } from '@tslstudio/tsl/animation/morph'

export interface TwoWayPositionMorphConfig {
  from: ShaderNodeObject<Node>
  to: ShaderNodeObject<Node>
  /** Initial progress value when using an internal uniform (defaults to 0). */
  progress?: number | ShaderNodeObject<Node>
  /** Disable clamping if progress is managed externally. */
  clamp?: boolean
}

export interface TwoWayPositionMorphHandle {
  /** Resulting position node blending the provided targets. */
  positionNode: ShaderNodeObject<Node>
  /** Node representing the morph progress. */
  progressNode: ShaderNodeObject<Node>
  /** Updates the progress uniform (throws if progress is externally provided). */
  setProgress(value: number): void
}

const isNode = (value: unknown): value is ShaderNodeObject<Node> =>
  Boolean(value && typeof value === 'object' && 'isNode' in (value as { isNode?: unknown }))

export function createTwoWayPositionMorph(config: TwoWayPositionMorphConfig): TwoWayPositionMorphHandle {
  const progressInput = config.progress ?? 0

  let progressNode: ShaderNodeObject<Node>
  let progressUniform: ShaderNodeObject<Node> | null = null

  if (isNode(progressInput)) {
    progressNode = progressInput
  } else {
    progressUniform = uniform(progressInput)
    progressNode = progressUniform
  }

  const useClamp = config.clamp !== false
  const blended = useClamp
    ? createTwoWayMorphNode(config.from as any, config.to as any, progressNode as any)
    : config.from
        .mul(float(1).sub(progressNode as any))
        .add(config.to.mul(progressNode as any))

  const setProgress = (value: number) => {
    if (!progressUniform) {
      throw new Error('[animation] Progress is externally provided and cannot be set via handle')
    }
    progressUniform.value = value
  }

  return {
    positionNode: blended,
    progressNode,
    setProgress,
  }
}


