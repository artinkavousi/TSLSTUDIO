import type { ShaderNodeObject } from 'three/tsl'
import type { Node } from 'three/webgpu'

/**
 * Represents any shader node object returned by TSL helpers.
 */
export type AnyNode = ShaderNodeObject<Node>

/**
 * Scalar shader node wrapper.
 */
export type FloatNode = ShaderNodeObject<Node>

/**
 * Two-component vector shader node wrapper.
 */
export type Vec2Node = ShaderNodeObject<Node>

/**
 * Three-component vector shader node wrapper.
 */
export type Vec3Node = ShaderNodeObject<Node>

/**
 * Four-component vector shader node wrapper.
 */
export type Vec4Node = ShaderNodeObject<Node>

/**
 * 3×3 matrix shader node wrapper.
 */
export type Mat3Node = ShaderNodeObject<Node>

/**
 * 4×4 matrix shader node wrapper.
 */
export type Mat4Node = ShaderNodeObject<Node>

