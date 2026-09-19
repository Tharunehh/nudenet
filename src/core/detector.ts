import * as tf from '@tensorflow/tfjs';
import * as tfn from '@tensorflow/tfjs-node';
import pilogger from '@vladmandic/pilogger';
import { readFileSync, existsSync } from 'fs';
import { DetectionResult, DetectionOptions, ModelConfig, DetectionBox } from '../types';
import { defaultModelConfig, defaultOptions, resolveModelPath, getCompositeForModel, getClassesForModel } from './config';

export class NudeNetDetector {
  private model: tf.GraphModel | null = null;
  private modelPath: string;
  private modelVersion: string;
  public options: DetectionOptions;
  private modelConfig: ModelConfig;
  private loaded: boolean = false;

  constructor(options: DetectionOptions = {}) {
    this.options = { ...defaultOptions, ...options };
    this.modelConfig = defaultModelConfig;
    this.modelPath = this.options.modelPath || resolveModelPath('file://models', this.options.labels || 'default');
    this.modelVersion = this.options.labels || 'default';
  }

  async loadModel(modelPath?: string): Promise<void> {
    const path = modelPath || this.modelPath;
    try {
      if (this.model) {
        this.model.dispose();
        this.model = null;
      }
      this.model = await tf.loadGraphModel(path);
      this.modelPath = path;
      this.loaded = true;
      this.modelVersion = (this.model as any).version || 'unknown';

      if (this.modelVersion === 'v2.base') {
        this.modelVersion = 'base';
        this.options.labels = 'base';
      } else {
        this.modelVersion = 'default';
        this.options.labels = 'default';
      }

      if (this.options.debug) pilogger.state('Loaded graph model:', path, 'version:', this.modelVersion);
    } catch (err) {
      pilogger.error('Error loading graph model:', path, err);
      throw err;
    }
  }

  getVersion(): string {
    return this.modelVersion;
  }

  isLoaded(): boolean {
    return this.loaded;
  }

  async detect(imagePath: string): Promise<DetectionResult> {
    if (!this.loaded) await this.loadModel();

    const t0 = Date.now();
    const inputTensor = this.getTensorFromImage(imagePath);
    if (!inputTensor) throw new Error(`Could not load image: ${imagePath}`);

    const results = await this.model!.executeAsync(inputTensor, this.options.outputNodes);
    const boxesTensor = results[0] as tf.Tensor;
    const scoresTensor = results[1] as tf.Tensor;
    const classesTensor = results[2] as tf.Tensor;
    const result = await this.processPrediction(boxesTensor, scoresTensor, classesTensor, inputTensor, imagePath);
    result.processingTimeMs = Date.now() - t0;

    tf.dispose([boxesTensor, scoresTensor, classesTensor, inputTensor]);
    return result;
  }

  async detectBuffer(buffer: Buffer, mimeType?: string): Promise<DetectionResult> {
    if (!this.loaded) await this.loadModel();

    const t0 = Date.now();
    const inputTensor = this.getTensorFromBuffer(buffer, mimeType);
    if (!inputTensor) throw new Error('Could not decode image buffer');

    const results = await this.model!.executeAsync(inputTensor, this.options.outputNodes);
    const boxesTensor = results[0] as tf.Tensor;
    const scoresTensor = results[1] as tf.Tensor;
    const classesTensor = results[2] as tf.Tensor;
    const result = await this.processPrediction(boxesTensor, scoresTensor, classesTensor, inputTensor);
    result.processingTimeMs = Date.now() - t0;

    tf.dispose([boxesTensor, scoresTensor, classesTensor, inputTensor]);
    return result;
  }

  private getTensorFromImage(imageFile: string) {
    if (!existsSync(imageFile)) {
      pilogger.error('Not found:', imageFile);
      return null;
    }
    const data = readFileSync(imageFile);
    const bufferT = tfn.node.decodeImage(data, 3);
    const expandedT = tf.expandDims(bufferT, 0);
    const imageT = tf.cast(expandedT, 'float32');
    (imageT as any)['file'] = imageFile;
    tf.dispose([expandedT, bufferT]);
    if (this.options.debug) pilogger.info('Loaded image:', imageFile, 'width:', imageT.shape[2], 'height:', imageT.shape[1]);
    return imageT;
  }

  private getTensorFromBuffer(buffer: Buffer, mimeType?: string): tf.Tensor4D {
    const decoded = tfn.node.decodeJpeg(buffer, 3);
    const expanded = tf.expandDims(decoded, 0);
    return tf.cast(expanded, 'float32') as tf.Tensor4D;
  }

  private async processPrediction(
    boxesTensor: tf.Tensor,
    scoresTensor: tf.Tensor,
    classesTensor: tf.Tensor,
    inputTensor: tf.Tensor,
    imageFile?: string
  ): Promise<DetectionResult> {
    const boxes = boxesTensor.arraySync();
    const scores = scoresTensor.dataSync();
    const classes = classesTensor.dataSync();

    const version = this.modelVersion;
    const classesList = getClassesForModel(this.modelConfig, version);
    const composite = getCompositeForModel(this.modelConfig, version);

    const labels = classesList;

    return tf.image.nonMaxSuppressionAsync(boxes[0], scores, this.options.maxResults!, this.options.iouThreshold!, this.options.minScore!).then((nmsT) => {
      const nms = nmsT.dataSync();
      tf.dispose(nmsT);

      const parts: DetectionBox[] = [];
      for (let i = 0; i < nms.length; i++) {
        const id = nms[i];
        parts.push({
          score: scores[i],
          id: id as unknown as number,
          class: classes[id] ? labels[classes[id]] : 'unknown',
          box: [
            Math.trunc(boxes[0][id][0]),
            Math.trunc(boxes[0][id][1]),
            Math.trunc((boxes[0][id][3] - boxes[0][id][1])),
            Math.trunc((boxes[0][id][2] - boxes[0][id][0])),
          ],
        });
      }

      const result: DetectionResult = {
        input: {
          file: imageFile,
          width: inputTensor.shape[2],
          height: inputTensor.shape[1],
        },
        person: parts.filter((a) => composite.person.includes(a.id)).length > 0,
        sexy: parts.filter((a) => composite.sexy.includes(a.id)).length > 0,
        nude: parts.filter((a) => composite.nude.includes(a.id)).length > 0,
        parts,
        modelVersion: version,
      };

      if (this.options.debug) pilogger.data('Result:', result);
      return result;
    });
  }

  dispose(): void {
    if (this.model) {
      this.model.dispose();
      this.model = null;
    }
    this.loaded = false;
  }
}
