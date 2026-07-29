declare module '@imgly/background-removal' {
  export interface Config {
    debug?: boolean;
    progress?: (key: string, current: number, total: number) => void;
    output?: {
      quality?: number;
      format?: 'image/png' | 'image/jpeg' | 'image/webp';
    };
    device?: 'cpu' | 'gpu';
    rescale?: boolean;
    publicPath?: string;
    proxyToWorker?: boolean;
    model?: 'small' | 'medium' | 'large';
  }

  export function removeBackground(
    image: string | Blob,
    config?: Config
  ): Promise<Blob>;

  export function segmentForeground(
    image: string | Blob,
    config?: Config
  ): Promise<Blob>;

  export function applySegmentationMask(
    image: string | Blob,
    mask: Blob,
    config?: Config
  ): Promise<Blob>;

  export function preload(config?: Config): Promise<void>;
}