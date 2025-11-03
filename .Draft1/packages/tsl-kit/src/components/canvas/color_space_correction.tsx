import { useThree } from '@react-three/fiber'
import { useEffect } from 'react'
import { SRGBColorSpace, NoToneMapping } from 'three'

/**
 * ColorSpaceCorrection
 *
 * Applies proper color space and tone mapping settings for WebGPU rendering.
 * Sets the output color space to sRGB and disables tone mapping.
 */
export const ColorSpaceCorrection = () => {
  const { gl } = useThree()

  useEffect(() => {
    if (gl) {
      gl.outputColorSpace = SRGBColorSpace
      gl.toneMapping = NoToneMapping
    }
  }, [gl])

  return null
}



