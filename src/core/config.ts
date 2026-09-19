import { ModelConfig, ServerConfig, DetectionOptions } from '../types';

export { ModelConfig, ServerConfig, DetectionOptions };

export const defaultModelConfig: ModelConfig = {
  base: {
    classes: [
      'exposed belly',
      'exposed buttocks',
      'exposed breasts',
      'exposed vagina',
      'exposed penis',
      'male breast',
    ],
    composite: {
      person: [],
      sexy: [],
      nude: [2, 3, 4],
    },
  },
  default: {
    classes: [
      'exposed anus',
      'exposed armpits',
      'belly',
      'exposed belly',
      'buttocks',
      'exposed buttocks',
      'female face',
      'male face',
      'feet',
      'exposed feet',
      'breast',
      'exposed breast',
      'vagina',
      'exposed vagina',
      'male breast',
      'exposed penis',
    ],
    composite: {
      person: [6, 7],
      sexy: [1, 2, 3, 4, 8, 9, 10, 15],
      nude: [0, 5, 11, 12, 13],
    },
  },
};

export const defaultOptions: DetectionOptions = {
  modelPath: 'file://models/default-f16/model.json',
  minScore: 0.38,
  maxResults: 50,
  iouThreshold: 0.5,
  outputNodes: ['output1', 'output2', 'output3'],
  blurNude: true,
  blurRadius: 25,
  debug: false,
};

export const defaultServerConfig: ServerConfig = {
  port: 3000,
  host: '0.0.0.0',
  maxFileSize: 50 * 1024 * 1024,
  minScore: 0.38,
  blurRadius: 25,
  defaultModel: 'default',
};

export function resolveModelPath(basePath: string, modelVersion?: 'base' | 'default'): string {
  const version = modelVersion || 'default';
  return `${basePath}/${version}-f16/model.json`;
}

export function getCompositeForModel(config: ModelConfig, version: string): { person: number[]; sexy: number[]; nude: number[] } {
  return config[version as keyof ModelConfig].composite;
}

export function getClassesForModel(config: ModelConfig, version: string): string[] {
  return config[version as keyof ModelConfig].classes;
}
