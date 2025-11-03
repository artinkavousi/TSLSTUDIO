import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import { mrt, pass, emissive, output } from 'three/tsl'
import * as THREE from 'three/webgpu'

export const PostProcessing = ({ effect }: { effect: () => any }) => {
  const { gl: renderer, scene, camera } = useThree()
  const postProcessingRef = useRef<any>(null)

  useEffect(() => {
    if (!renderer || !scene || !camera) {
      return
    }

    const scenePass = pass(scene as any, camera as any)

    scenePass.setMRT(mrt({ output, emissive }))

    // Get texture nodes
    const outputPass = scenePass.getTextureNode('output')

    // Setup post-processing
    const postProcessing = new THREE.PostProcessing(renderer as any)

    const outputNode = effect()
    postProcessing.outputNode = outputPass.mul(outputNode)

    postProcessingRef.current = postProcessing

    return () => {
      postProcessingRef.current = null
    }
  }, [renderer, scene, camera, effect])

  useFrame(() => {
    if (postProcessingRef.current) {
      postProcessingRef.current.render()
    }
  }, 1)

  return null
}



