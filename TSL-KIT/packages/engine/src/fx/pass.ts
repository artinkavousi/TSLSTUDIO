import type { Camera, Scene, Texture } from 'three'
import { RenderTarget } from 'three/src/core/RenderTarget.js'
import TextureNode from 'three/src/nodes/accessors/TextureNode.js'
import PostProcessing from 'three/src/renderers/common/PostProcessing.js'
import {
  colorToDirection,
  diffuseColor,
  directionToColor,
  emissive,
  metalness,
  mrt,
  normalView,
  output,
  pass,
  roughness,
  sample,
  vec2,
  velocity,
} from 'three/tsl'
import type { ShaderNodeObject } from 'three/tsl'
import type { Node } from 'three/webgpu'
import type { WebGPURenderer } from 'three/webgpu'

import { composeEffects } from '@tslstudio/tsl/post/core/chain'; 
import type { EffectResources, PostEffect } from '@tslstudio/tsl/post/types'; 

import type { FramePass } from '../core/framegraph'; 

export interface PostProcessingAttachments {
  normal?: boolean
  metalRough?: boolean
  diffuse?: boolean
  velocity?: boolean
}

export interface PostProcessingPassOptions {
  name?: string
  priority?: number
  inputKey?: string
  useScenePass?: boolean
  attachments?: PostProcessingAttachments
}

export const FX_RESOURCE_KEYS = {
  color: 'fx.scene.color',
  depth: 'fx.scene.depth',
  normal: 'fx.scene.normal',
  metalness: 'fx.scene.metalness',
  roughness: 'fx.scene.roughness',
  diffuse: 'fx.scene.diffuse',
  velocity: 'fx.scene.velocity',
  camera: 'fx.scene.camera',
} as const

type SceneResourceValue = ShaderNodeObject<Node> | TextureNode | Camera | undefined

const setResource = (resources: EffectResources, key: string, value: SceneResourceValue) => {
  resources.set?.(key, value ?? undefined)
}

export function createPostProcessingPass(effects: PostEffect[], options: PostProcessingPassOptions = {}): FramePass {
  let postProcessing: PostProcessing | null = null
  let currentScene: Scene | null = null
  let currentCamera: Camera | null = null
  let scenePassNode: ReturnType<typeof pass> | null = null
  let resourceNode: TextureNode | null = null
  let cachedNormalSample: ShaderNodeObject<Node> | null = null

  const attachments = options.attachments ?? {}

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
    scenePassNode = null
    resourceNode = null
    cachedNormalSample = null
  }

  const ensurePostProcessing = (renderer: WebGPURenderer): PostProcessing => {
    if (!postProcessing) {
      postProcessing = new PostProcessing(renderer as unknown as any)
      postProcessing.outputColorTransform = false
    }
    return postProcessing
  }

  const ensureScenePass = (scene: Scene, camera: Camera) => {
    if (!scenePassNode || scene !== currentScene || camera !== currentCamera) {
      scenePassNode = pass(scene, camera)
      const mrtTargets: Record<string, ShaderNodeObject<Node>> = { output }

      if (attachments.normal || attachments.metalRough || attachments.diffuse || attachments.velocity) {
        mrtTargets.emissive = emissive
      }

      if (attachments.diffuse) {
        mrtTargets.diffuse = diffuseColor
      }

      if (attachments.normal) {
        mrtTargets.normal = directionToColor(normalView)
      }

      if (attachments.metalRough) {
        mrtTargets.metalrough = vec2(metalness, roughness)
      }

      if (attachments.velocity) {
        mrtTargets.velocity = velocity
      }

      scenePassNode.setMRT(mrt(mrtTargets))
      currentScene = scene
      currentCamera = camera
      cachedNormalSample = null
    }
    return scenePassNode
  }

  return {
    name: options.name ?? 'postprocessing',
    priority: options.priority ?? 100,
    setup: () => cleanup,
    exec: (context) => {
      const { scene, camera, renderer, resources, frame, size } = context
      const webgpuRenderer = renderer as WebGPURenderer
      const post = ensurePostProcessing(webgpuRenderer)

      let inputTextureNode: TextureNode | null = null

      if (options.inputKey) {
        const resource = resources.get(options.inputKey) as RenderTarget | Texture | undefined
        if (resource) {
          const textureResource = (resource as RenderTarget).isRenderTarget ? (resource as RenderTarget).texture : (resource as Texture)
          if (!resourceNode) {
            resourceNode = new TextureNode(textureResource)
          } else {
            resourceNode.value = textureResource
          }
          inputTextureNode = resourceNode
        }
      }

      if (!inputTextureNode) {
        if (options.useScenePass === false) {
          return
        }
        const scenePass = ensureScenePass(scene, camera)
        inputTextureNode = scenePass.getTextureNode('output')

        setResource(resources, FX_RESOURCE_KEYS.color, inputTextureNode)
        setResource(resources, FX_RESOURCE_KEYS.depth, scenePass.getTextureNode('depth'))
        setResource(resources, FX_RESOURCE_KEYS.camera, camera)

        if (attachments.normal) {
          const normalTexture = scenePass.getTextureNode('normal')
          if (!cachedNormalSample) {
            cachedNormalSample = sample((uvNode) => colorToDirection(normalTexture.sample(uvNode)))
          }
          setResource(resources, FX_RESOURCE_KEYS.normal, cachedNormalSample)
        } else {
          setResource(resources, FX_RESOURCE_KEYS.normal, undefined)
        }

        if (attachments.metalRough) {
          const metalRough = scenePass.getTextureNode('metalrough')
          setResource(resources, FX_RESOURCE_KEYS.metalness, metalRough.r)
          setResource(resources, FX_RESOURCE_KEYS.roughness, metalRough.g)
        } else {
          setResource(resources, FX_RESOURCE_KEYS.metalness, undefined)
          setResource(resources, FX_RESOURCE_KEYS.roughness, undefined)
        }

        if (attachments.diffuse) {
          setResource(resources, FX_RESOURCE_KEYS.diffuse, scenePass.getTextureNode('diffuse'))
        } else {
          setResource(resources, FX_RESOURCE_KEYS.diffuse, undefined)
        }

        if (attachments.velocity) {
          setResource(resources, FX_RESOURCE_KEYS.velocity, scenePass.getTextureNode('velocity'))
        } else {
          setResource(resources, FX_RESOURCE_KEYS.velocity, undefined)
        }
      }

      const chain = composeEffects(effects, { resources, frame, size })
      post.outputNode = chain(inputTextureNode)
      post.needsUpdate = true
      post.render()
    },
  }
}

