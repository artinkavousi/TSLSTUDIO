import {
  Fn,
  abs,
  float,
  mix,
  normalWorld,
  positionWorld,
  pow,
  texture,
  vec2,
  vec3,
} from 'three/tsl'

import { toFloatNode, type NodeRepresentation } from '../utils'; 

export interface TriplanarSampleOptions {
  scale?: number | NodeRepresentation
  sharpness?: number | NodeRepresentation
  normal?: NodeRepresentation
  position?: NodeRepresentation
  bias?: number | NodeRepresentation
}

export function triplanarSample(mapNode: NodeRepresentation, options: TriplanarSampleOptions = {}) {
  const scaleNode = toFloatNode(options.scale, 1)
  const sharpnessNode = toFloatNode(options.sharpness, 4)
  const biasNode = toFloatNode(options.bias, 0)

  const normalNode = options.normal ?? normalWorld()
  const positionNode = options.position ?? positionWorld()

  return Fn(() => {
    const scaledPos = positionNode.mul(scaleNode).add(biasNode)
    const absNormal = pow(abs(normalNode), sharpnessNode)
    const denom = absNormal.x.add(absNormal.y).add(absNormal.z).max(float(0.0001))
    const weights = vec3(
      absNormal.x.div(denom),
      absNormal.y.div(denom),
      absNormal.z.div(denom),
    )

    const sampleX = texture(mapNode, vec2(scaledPos.z, scaledPos.y))
    const sampleY = texture(mapNode, vec2(scaledPos.x, scaledPos.z))
    const sampleZ = texture(mapNode, vec2(scaledPos.x, scaledPos.y))

    const colorXY = mix(sampleX, sampleY, weights.y)
    return mix(colorXY, sampleZ, weights.z)
  })()
}

export function triplanarNormal(normalMap: NodeRepresentation, options: TriplanarSampleOptions = {}) {
  const scaleNode = toFloatNode(options.scale, 1)
  const sharpnessNode = toFloatNode(options.sharpness, 4)
  const biasNode = toFloatNode(options.bias, 0)

  const normalNode = options.normal ?? normalWorld()
  const positionNode = options.position ?? positionWorld()

  return Fn(() => {
    const scaledPos = positionNode.mul(scaleNode).add(biasNode)
    const absNormal = pow(abs(normalNode), sharpnessNode)
    const denom = absNormal.x.add(absNormal.y).add(absNormal.z).max(float(0.0001))
    const weights = vec3(
      absNormal.x.div(denom),
      absNormal.y.div(denom),
      absNormal.z.div(denom),
    )

    const nX = texture(normalMap, vec2(scaledPos.z, scaledPos.y)).xyz.mul(vec3(weights.x))
    const nY = texture(normalMap, vec2(scaledPos.x, scaledPos.z)).xyz.mul(vec3(weights.y))
    const nZ = texture(normalMap, vec2(scaledPos.x, scaledPos.y)).xyz.mul(vec3(weights.z))

    return nX.add(nY).add(nZ).normalize()
  })()
}

