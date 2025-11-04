import type { Scene, PerspectiveCamera } from 'three'
import type { WebGPURenderer } from 'three/webgpu'
import type { Framegraph } from '@engine/core/framegraph'

export interface DemoSceneHandle {
  scene: Scene
  camera: PerspectiveCamera
  framegraph: Framegraph
  renderer: WebGPURenderer
  render: (deltaSeconds?: number) => Promise<void>
  dispose: () => void
}

