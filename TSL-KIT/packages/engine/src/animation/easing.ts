import { float, uniform, type ShaderNodeObject } from 'three/tsl'
import type { Node } from 'three/webgpu'

import type { FloatNode } from '@tslstudio/tsl/index'; 

export type EasingFunction = (input: FloatNode) => FloatNode

export interface EasingHandle {
  progressNode: ShaderNodeObject<Node>
  valueNode: ShaderNodeObject<Node>
  setProgress(value: number): void
}

export function createEasingHandle(
  easing: EasingFunction,
  initialProgress = 0,
  clamp = true,
): EasingHandle {
  const progress = uniform(initialProgress)
  const progressNode = clamp ? progress.clamp(float(0), float(1)) : progress
  const valueNode = easing(progressNode)

  return {
    progressNode,
    valueNode,
    setProgress(value: number) {
      progress.value = clamp ? Math.max(0, Math.min(1, value)) : value
    },
  }
}


