import type { WebGPURenderer } from 'three/webgpu';

export interface DeviceCaps {
  readonly adapterName: string;
  readonly maxTextureDimension2D: number;
  readonly maxStorageBufferBindingSize: number;
  readonly maxComputeWorkgroupSizeX: number;
  readonly maxComputeWorkgroupSizeY: number;
  readonly maxComputeWorkgroupSizeZ: number;
  readonly maxComputeInvocationsPerWorkgroup: number;
  readonly supportsTimestampQuery: boolean;
  readonly supportsFloat16: boolean;
  readonly supportsIndirectFirstInstance: boolean;
}

const defaultCaps: DeviceCaps = {
  adapterName: 'unknown',
  maxTextureDimension2D: 4096,
  maxStorageBufferBindingSize: 1 << 20,
  maxComputeWorkgroupSizeX: 256,
  maxComputeWorkgroupSizeY: 256,
  maxComputeWorkgroupSizeZ: 64,
  maxComputeInvocationsPerWorkgroup: 256,
  supportsTimestampQuery: false,
  supportsFloat16: false,
  supportsIndirectFirstInstance: false
};

function inferRendererBackend(renderer?: WebGPURenderer) {
  return (renderer as unknown as { backend?: { adapter?: GPUAdapter; device?: GPUDevice } })?.backend;
}

export async function detectDeviceCaps(renderer?: WebGPURenderer): Promise<DeviceCaps> {
  const backend = inferRendererBackend(renderer);
  const adapter = backend?.adapter ?? (await navigator.gpu?.requestAdapter?.());

  if (!adapter) {
    return defaultCaps;
  }

  const adapterAny = adapter as any;
  const info = await adapterAny.requestAdapterInfo?.().catch(() => ({ name: adapterAny.name ?? 'webgpu-adapter' }));
  const limits = adapter.limits;
  const features = adapter.features;

  return {
    adapterName: info?.name ?? adapterAny.name ?? 'webgpu-adapter',
    maxTextureDimension2D: limits.maxTextureDimension2D ?? defaultCaps.maxTextureDimension2D,
    maxStorageBufferBindingSize: Number(limits.maxStorageBufferBindingSize ?? defaultCaps.maxStorageBufferBindingSize),
    maxComputeWorkgroupSizeX: limits.maxComputeWorkgroupSizeX ?? defaultCaps.maxComputeWorkgroupSizeX,
    maxComputeWorkgroupSizeY: limits.maxComputeWorkgroupSizeY ?? defaultCaps.maxComputeWorkgroupSizeY,
    maxComputeWorkgroupSizeZ: limits.maxComputeWorkgroupSizeZ ?? defaultCaps.maxComputeWorkgroupSizeZ,
    maxComputeInvocationsPerWorkgroup:
      limits.maxComputeInvocationsPerWorkgroup ?? defaultCaps.maxComputeInvocationsPerWorkgroup,
    supportsTimestampQuery: features?.has?.('timestamp-query') ?? false,
    supportsFloat16: features?.has?.('shader-f16') ?? false,
    supportsIndirectFirstInstance: features?.has?.('indirect-first-instance') ?? false
  } satisfies DeviceCaps;
}

export function clampByCaps(value: number, limit: number): number {
  return Math.min(value, limit);
}

export function ensureFeature(feature: keyof Pick<DeviceCaps, 'supportsFloat16' | 'supportsTimestampQuery'>, caps: DeviceCaps) {
  if (!caps[feature]) {
    throw new Error(`Required WebGPU feature ${feature} is not supported on adapter ${caps.adapterName}`);
  }
}

