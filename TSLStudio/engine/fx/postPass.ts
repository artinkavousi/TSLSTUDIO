// @ts-nocheck
import { pass, mrt, output, emissive } from 'three/tsl'
import { WebGPURenderer } from 'three/webgpu'
import type { Camera, Scene, Texture } from 'three'
import { RenderTarget } from 'three/src/core/RenderTarget.js'
import PostProcessing from 'three/src/renderers/common/PostProcessing.js'
import TextureNode from 'three/src/nodes/accessors/TextureNode.js'
import type { FramePass } from '@engine/core/framegraph'
import { composeEffects } from './chain'
import type { PostEffect } from './types'

export type PostProcessingPassOptions = {
  name?: string
  priority?: number
  inputKey?: string
  useScenePass?: boolean
}

export function createPostProcessingPass(effects: PostEffect[], options: PostProcessingPassOptions = {}): FramePass {
  let postProcessing: PostProcessing | null = null
  let currentScene: Scene | null = null
  let currentCamera: Camera | null = null
  let scenePass: ReturnType<typeof pass> | null = null
  let resourceNode: TextureNode | null = null

  const cleanup = () => {
    if (postProcessing) {
      try {
        postProcessing.dispose?.()
      } catch (error) {
        console.warn('[fx] Failed to dispose post-processing pipeline', error)
      }
      postProcessing = null
    }
    currentScene = null
    currentCamera = null
    scenePass = null
    resourceNode = null
  }

  const ensurePostProcessing = (renderer: WebGPURenderer) => {
    if (!postProcessing) {
      postProcessing = new PostProcessing(renderer as any)
      postProcessing.outputColorTransform = false
    }
    return postProcessing
  }

  const ensureScenePass = (scene: Scene, camera: Camera) => {
    if (!scenePass || scene !== currentScene || camera !== currentCamera) {
      scenePass = pass(scene, camera)
      scenePass.setMRT(mrt({ output, emissive }))
      currentScene = scene
      currentCamera = camera
    }
    return scenePass
  }

  return {
    name: options.name ?? 'postprocessing',
    priority: options.priority ?? 100,
    setup: () => cleanup,
    exec: (context) => {
      const { scene, camera, renderer } = context
      const post = ensurePostProcessing(renderer as WebGPURenderer)

      let inputTextureNode: TextureNode | null = null

      if (options.inputKey) {
        const resource = context.resources.get(options.inputKey) as RenderTarget | Texture | undefined
        if (resource) {
          const texture = (resource as RenderTarget).isRenderTarget ? (resource as RenderTarget).texture : (resource as Texture)
          if (!resourceNode) {
            resourceNode = new TextureNode(texture)
          } else {
            resourceNode.value = texture
          }
          inputTextureNode = resourceNode
        }
      }

      if (!inputTextureNode) {
        if (options.useScenePass === false) {
          return
        }
        const passNode = ensureScenePass(scene, camera)
        inputTextureNode = passNode.getTextureNode('output')
      }

      const chain = composeEffects(effects, context)
      post.outputNode = chain(inputTextureNode)
      post.needsUpdate = true
      post.render()
    },
  }
}


