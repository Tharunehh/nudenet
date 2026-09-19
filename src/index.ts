import { NudeNetDetector } from './core/detector';
import { NudeNet, DetectionRequest, DetectionResponse, BatchDetectionRequest, BatchDetectionResponse } from './types';
import { defaultOptions } from './core/config';
import { processImage, blurRegion, drawBoundingBox, saveCanvasToFile } from './utils';

const detector = new NudeNetDetector(defaultOptions);

const nudeNet: NudeNet = {
  detect: async (options: DetectionRequest): Promise<DetectionResponse> => {
    if (options.imagePath) {
      const result = await detector.detect(options.imagePath);
      if (options.outputPath) {
        const composite = { person: [], sexy: [], nude: [] };
        const canvas = await processImage(
          options.imagePath,
          result.parts,
          composite as any,
          options.blurNude || true,
          options.blurSexy || false,
          options.blurRadius || 25,
          options.markRegions || false
        );
        await saveCanvasToFile(canvas, options.outputPath);
        return { success: true, result, outputPath: options.outputPath };
      }
      return { success: true, result };
    }
    if (options.imageBuffer) {
      const result = await detector.detectBuffer(options.imageBuffer);
      return { success: true, result };
    }
    return { success: false, error: 'imagePath or imageBuffer is required' };
  },

  detectBatch: async (request: BatchDetectionRequest): Promise<BatchDetectionResponse> => {
    const results: BatchDetectionResponse['results'] = [];
    for (const item of request.images) {
      try {
        let result;
        if (item.imageBuffer) {
          result = await detector.detectBuffer(item.imageBuffer);
        } else if (item.imagePath) {
          result = await detector.detect(item.imagePath);
        } else {
          results.push({ id: item.id, success: false, error: 'No image provided' });
          continue;
        }
        results.push({ id: item.id, success: true, result });
      } catch (err: any) {
        results.push({ id: item.id, success: false, error: err.message });
      }
    }
    return {
      results,
      summary: {
        total: request.images.length,
        succeeded: results.filter((r) => r.success).length,
        failed: results.filter((r) => !r.success).length,
      },
    };
  },

  blurRegion: (canvas: any, left: number, top: number, width: number, height: number, radius: number) => blurRegion(canvas, left, top, width, height, radius),
  drawBoundingBox: (canvas: any, x: number, y: number, width: number, height: number, label: string) => drawBoundingBox(canvas, x, y, width, height, label),

  loadModel: async (modelPath?: string) => {
    await detector.loadModel(modelPath);
  },

  dispose: () => detector.dispose(),
};

export { nudeNet, NudeNetDetector, detector };
export * from './types';
export * from './core';
export * from './utils';
export * from './api';
