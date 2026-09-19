export interface DetectionBox {
  score: number;
  id: number;
  class: string;
  box: [number, number, number, number];
}

export interface DetectionResult {
  input: {
    file?: string;
    width: number;
    height: number;
  };
  person: boolean;
  sexy: boolean;
  nude: boolean;
  parts: DetectionBox[];
  modelVersion?: string;
  processingTimeMs?: number;
}

export interface DetectionOptions {
  modelPath?: string;
  minScore?: number;
  maxResults?: number;
  iouThreshold?: number;
  outputNodes?: string[];
  blurNude?: boolean;
  blurRadius?: number;
  labels?: 'base' | 'default';
  debug?: boolean;
}

export interface CompositeConfig {
  person: number[];
  sexy: number[];
  nude: number[];
}

export interface ModelConfig {
  base: {
    classes: string[];
    composite: CompositeConfig;
  };
  default: {
    classes: string[];
    composite: CompositeConfig;
  };
}

export interface DetectionRequest {
  imagePath?: string;
  imageBuffer?: Buffer;
  outputPath?: string;
  blurNude?: boolean;
  blurSexy?: boolean;
  markRegions?: boolean;
  minScore?: number;
  modelVersion?: 'base' | 'default';
  blurRadius?: number;
}

export interface DetectionResponse {
  success: boolean;
  result?: DetectionResult;
  error?: string;
  outputPath?: string;
}

export interface BatchDetectionRequest {
  images: Array<{
    id: string;
    imagePath?: string;
    imageBuffer?: Buffer;
    outputPath?: string;
  }>;
  options?: DetectionOptions;
}

export interface BatchDetectionResponse {
  results: Array<{
    id: string;
    success: boolean;
    result?: DetectionResult;
    error?: string;
  }>;
  summary: {
    total: number;
    succeeded: number;
    failed: number;
  };
}

export interface ServerConfig {
  port: number;
  host: string;
  modelPath?: string;
  defaultModel?: 'base' | 'default';
  maxFileSize?: number;
  minScore?: number;
  blurRadius?: number;
}

export interface NudeNet {
  detect: (options: DetectionRequest) => Promise<DetectionResponse>;
  detectBatch: (request: BatchDetectionRequest) => Promise<BatchDetectionResponse>;
  blurRegion: (canvas: unknown, left: number, top: number, width: number, height: number, radius: number) => void;
  drawBoundingBox: (canvas: unknown, x: number, y: number, width: number, height: number, label: string) => void;
  loadModel: (modelPath?: string) => Promise<void>;
  dispose: () => void;
}
