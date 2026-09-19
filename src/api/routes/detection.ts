import { Router, Request, Response } from 'express';
import multer from 'multer';
import { NudeNetDetector } from '../../core/detector';
import { DetectionRequest, DetectionResponse, BatchDetectionRequest, BatchDetectionResponse } from '../../types';
import { defaultOptions } from '../../core/config';

const detector = new NudeNetDetector({ ...defaultOptions, debug: false });
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } });

export function createDetectionRouter(detectorInstance?: NudeNetDetector): Router {
  const router = Router();
  const det = detectorInstance || detector;

  router.post('/detect', upload.single('image'), async (req: Request, res: Response) => {
    try {
      if (!req.file && !req.body.imagePath && !req.body.imageBuffer) {
        res.status(400).json({ success: false, error: 'imagePath or imageBuffer is required' });
        return;
      }

      const { imagePath, outputPath, blurNude, blurSexy, markRegions, minScore, modelVersion } = req.body;

      if (minScore !== undefined) det.options.minScore = parseFloat(minScore);
      if (modelVersion) {
        await det.loadModel(`file://models/${modelVersion}-f16/model.json`);
      }

      let result;
      if (req.file) {
        result = await det.detectBuffer(req.file.buffer);
      } else if (imagePath) {
        result = await det.detect(imagePath);
      } else {
        res.status(400).json({ success: false, error: 'imagePath or imageBuffer is required' });
        return;
      }

      const response: DetectionResponse = { success: true, result };
      res.json(response);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  router.post('/detect/batch', async (req: Request, res: Response) => {
    try {
      const body = req.body as BatchDetectionRequest;
      const results: BatchDetectionResponse['results'] = [];

      for (const item of body.images) {
        try {
          let result;
          if (item.imageBuffer) {
            result = await det.detectBuffer(item.imageBuffer);
          } else if (item.imagePath) {
            result = await det.detect(item.imagePath);
          } else {
            results.push({ id: item.id, success: false, error: 'No imagePath or imageBuffer provided' });
            continue;
          }
          results.push({ id: item.id, success: true, result });
        } catch (err: any) {
          results.push({ id: item.id, success: false, error: err.message });
        }
      }

      const response: BatchDetectionResponse = {
        results,
        summary: {
          total: body.images.length,
          succeeded: results.filter((r) => r.success).length,
          failed: results.filter((r) => !r.success).length,
        },
      };
      res.json(response);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  router.get('/health', (_req: Request, res: Response) => {
    res.json({
      status: 'ok',
      modelLoaded: det.isLoaded(),
      modelVersion: det.getVersion(),
    });
  });

  return router;
}
