export type ImageSize = '1K' | '2K' | '4K';

export interface Mockup {
  id: string;
  name: string;
  url: string;
  logoArea: {
    x: number; // 0-1 percentage
    y: number; // 0-1 percentage
    width: number; // 0-1 percentage
    height: number; // 0-1 percentage
    rotation?: number; // degrees
  };
}

export interface GenerationConfig {
  prompt: string;
  size: ImageSize;
}
