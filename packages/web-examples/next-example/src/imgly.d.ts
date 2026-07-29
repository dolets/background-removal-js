// src/imgly.d.ts
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

  export interface Config {
    debug?: boolean;
    progress?: (key: string, current: number, total: number) => void;
    rescale?: boolean;
    device?: 'cpu' | 'gpu';
    output?: {
      quality?: number;
      format?: 'image/png' | 'image/jpeg' | 'image/webp' | 'image/x-rgba8' | 'image/x-alpha8';
    };
    // 其他配置项...
  }
}

// 或者使用更简单的方式（推荐，快速解决构建问题）：
// declare module '@imgly/background-removal' {
//   const value: any;
//   export = value;
// }
