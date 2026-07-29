declare module '@imgly/background-removal' {
  export function removeBackground(
    image: string | Blob | ArrayBuffer | Uint8Array | ImageData | URL,
    config?: any
  ): Promise<Blob>;
  export function segmentForeground(
    image: string | Blob | ArrayBuffer | Uint8Array | ImageData | URL,
    config?: any
  ): Promise<Blob>;
  export function applySegmentationMask(
    image: string | Blob | ArrayBuffer | Uint8Array | ImageData | URL,
    mask: Blob,
    config?: any
  ): Promise<Blob>;
  export function preload(config?: any): Promise<void>;
}
