// @ts-nocheck
import type { Camera, Scene } from 'three'
import type { WebGPURenderer } from 'three/webgpu'
import type { Framegraph } from '../core/framegraph'

export type DemoSceneHandle = {
  readonly scene: Scene
  readonly camera: Camera
  readonly framegraph: Framegraph
  readonly renderer: WebGPURenderer
  render(deltaSeconds?: number): Promise<void> | void
  dispose(): void
}



