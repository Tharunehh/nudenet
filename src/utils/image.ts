import { Canvas, loadImage } from 'canvas';
import { DetectionBox, CompositeConfig } from '../types';

export function makeCanvas(width: number, height: number): Canvas {
  return new Canvas(width, height);
}

export function blurRegion(
  canvas: Canvas,
  left: number,
  top: number,
  width: number,
  height: number,
  radius: number
): void {
  const blurCanvas = new Canvas(width / radius, height / radius);
  const blurCtx = blurCanvas.getContext('2d');
  if (!blurCtx) return;
  blurCtx.imageSmoothingEnabled = true;
  blurCtx.drawImage(canvas, left, top, width, height, 0, 0, width / radius, height / radius);
  const ctx = canvas.getContext('2d');
  if (ctx) ctx.drawImage(blurCanvas, left, top, width, height);
}

export function drawBoundingBox(
  canvas: Canvas,
  x: number,
  y: number,
  width: number,
  height: number,
  label: string,
  color: string = 'white',
  lineWidth: number = 2,
  fontSize: string = '16px "Segoe UI"'
): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  ctx.lineWidth = lineWidth;
  ctx.beginPath();
  ctx.moveTo(x + 8, y);
  ctx.lineTo(x + width - 8, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + 8);
  ctx.lineTo(x + width, y + height - 8);
  ctx.quadraticCurveTo(x + width, y + height, x + width - 8, y + height);
  ctx.lineTo(x + 8, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - 8);
  ctx.lineTo(x, y + 8);
  ctx.quadraticCurveTo(x, y, x + 8, y);
  ctx.closePath();
  ctx.strokeStyle = color;
  ctx.stroke();
  ctx.lineWidth = 2;
  ctx.fillStyle = color;
  ctx.font = fontSize;
  ctx.fillText(label, x + 4, y - 4);
}

export async function processImage(
  imagePath: string,
  parts: DetectionBox[],
  composite: CompositeConfig,
  blurNude: boolean,
  blurSexy: boolean,
  blurRadius: number,
  markRegions: boolean
): Promise<Canvas> {
  const original = await loadImage(imagePath);
  const canvas = new Canvas(original.width, original.height);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(original, 0, 0, canvas.width, canvas.height);

  for (const obj of parts) {
    const isNude = composite.nude.includes(obj.id);
    const isSexy = composite.sexy.includes(obj.id);
    const label = `${Math.round(100 * obj.score)}% ${obj.class}`;

    if (isNude && blurNude) blurRegion(canvas, obj.box[0], obj.box[1], obj.box[2], obj.box[3], blurRadius);
    if (isSexy && blurSexy) blurRegion(canvas, obj.box[0], obj.box[1], obj.box[2], obj.box[3], blurRadius);
    if (markRegions) drawBoundingBox(canvas, obj.box[0], obj.box[1], obj.box[2], obj.box[3], label);
  }

  return canvas;
}

export function saveCanvasToFile(canvas: Canvas, outputPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const out = canvas.createJPEGStream({ quality: 0.6, progressive: true, chromaSubsampling: true });
    const fs = require('fs');
    const stream = fs.createWriteStream(outputPath);
    out.pipe(stream);
    stream.on('finish', () => resolve());
    stream.on('error', (err: Error) => reject(err));
  });
}
