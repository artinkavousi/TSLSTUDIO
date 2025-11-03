import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import { mrt, pass, emissive, output, screenSize, uv, texture, vec4, vec3 } from 'three/tsl'
import * as THREE from 'three/webgpu'

export const PostProcessing = ({ effect }: { effect: (inputColorNode?: any) => any }) => {
  const { gl: renderer, scene, camera } = useThree()
  const postProcessingRef = useRef<any>(null)

  useEffect(() => {
    if (!renderer || !scene || !camera) {
      return
    }

    const scenePass = pass(scene, camera)

    scenePass.setMRT(mrt({ output, emissive }))

    // Get texture nodes
    const outputPass = scenePass.getTextureNode('output')

    // Setup post-processing
    const postProcessing = new THREE.PostProcessing(renderer as any)

    const outputNode = effect(outputPass)
    postProcessing.outputNode = outputPass.mul(outputNode)

    postProcessingRef.current = postProcessing

    return () => {
      try {
        postProcessing.dispose?.()
      } catch {}
      postProcessingRef.current = null
    }
  }, [renderer, scene, camera])

  useFrame(() => {
    if (postProcessingRef.current) {
      postProcessingRef.current.render()
    }
  }, 1)

  return null
}
