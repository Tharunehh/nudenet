# NudeNet v0.4.0

NudeNet: NSFW Object Detection for TFJS and NodeJS - Enhanced Library

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D16.0.0-brightgreen)](https://nodejs.org/)

## Features

- **NSFW Detection** - Detect nude, sexy, and person content in images using ML models
- **REST API** - Full-featured Express.js API server with JSON responses
- **Web Dashboard** - Beautiful drag-and-drop web UI with real-time results
- **Batch Processing** - Process multiple images in a single request
- **Image Blurring** - Automatic blurring of detected NSFW body parts
- **Browser Support** - Works in browsers with WebGL/WebGPU acceleration
- **Node.js Support** - Full Node.js integration with TensorFlow.js

## Quick Start

### Install

```bash
npm install
```

### Build

```bash
npm run build
```

### Start API Server

```bash
npm start
# or
npm run api
```

### Web UI

Open [http://localhost:3000](http://localhost:3000) in your browser.

## API Usage

### Detect Image

```bash
curl -X POST http://localhost:3000/api/detect \
  -F "image=@/path/to/image.jpg" \
  -H "minScore: 0.38"
```

### Batch Detection

```bash
curl -X POST http://localhost:3000/api/detect/batch \
  -F "images[0][imagePath]=@image1.jpg" \
  -F "images[1][imagePath]=@image2.jpg"
```

### Health Check

```bash
curl http://localhost:3000/api/health
```

### Programmatic Usage

```javascript
import { nudeNet } from 'nudenet';

// Load model and detect
await nudeNet.loadModel('file://models/default-f16/model.json');
const result = await nudeNet.detect({ imagePath: 'photo.jpg' });

console.log(result.person);  // true/false
console.log(result.sexy);    // true/false
console.log(result.nude);    // true/false
console.log(result.parts);   // Array of detected body parts
```

## Output Format

```json
{
  "input": { "file": "photo.jpg", "width": 800, "height": 600 },
  "person": true,
  "sexy": true,
  "nude": false,
  "parts": [
    { "score": 0.95, "id": 3, "class": "exposed belly", "box": [100, 200, 150, 200] }
  ]
}
```

## Detection Classes

### Default Model
- `exposed anus`, `exposed armpits`, `belly`, `exposed belly`, `buttocks`, `exposed buttocks`
- `female face`, `male face`, `feet`, `exposed feet`, `breast`, `exposed breast`
- `vagina`, `exposed vagina`, `male breast`, `exposed penis`

### Base Model
- `exposed belly`, `exposed buttocks`, `exposed breasts`, `exposed vagina`, `exposed penis`, `male breast`

## Configuration

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `modelPath` | string | `file://models/default-f16/model.json` | Path to TFJS model |
| `minScore` | number | `0.38` | Minimum confidence score |
| `maxResults` | number | `50` | Maximum detection results |
| `iouThreshold` | number | `0.5` | Non-max suppression threshold |
| `blurRadius` | number | `25` | Blur radius for NSFW regions |
| `blurNude` | boolean | `true` | Auto-blur nude regions |

## Docker Deployment

```bash
docker build -t nudenet .
docker run -p 3000:3000 nudenet
```

Or with Docker Compose:

```bash
docker-compose up -d
```

## Project Structure

```
nudenet/
├── src/
│   ├── core/           # Core detection engine
│   │   ├── detector.ts # NudeNetDetector class
│   │   ├── config.ts   # Configuration and model data
│   │   └── index.ts    # Core exports
│   ├── api/            # Express.js REST API
│   │   ├── server.ts   # Server setup
│   │   ├── routes/     # API routes
│   │   └── index.ts    # API exports
│   ├── utils/          # Image processing utilities
│   │   └── image.ts    # Canvas, blur, draw utilities
│   ├── types/          # TypeScript type definitions
│   │   └── index.ts    # All interfaces and types
│   └── index.ts        # Main library entry point
├── models/             # TFJS model files
├── public/             # Web dashboard UI
├── samples/            # Sample images and videos
├── tests/              # Test files
├── Dockerfile          # Docker configuration
├── docker-compose.yml  # Docker Compose configuration
├── package.json        # Project dependencies
├── tsconfig.json       # TypeScript configuration
├── jest.config.js      # Test configuration
└── README.md           # This file
```

## Future Roadmap

- [ ] Video stream processing with real-time FPS
- [ ] Mobile SDK (React Native, Capacitor)
- [ ] Browser extension for content filtering
- [ ] CI/CD pipeline scanner
- [ ] Age-gate verification
- [ ] Model fine-tuning service
- [ ] Analytics dashboard
- [ ] Plugin system for custom classifiers

## Credits

- Original implementation: [notAI-tech/NudeNet](https://github.com/notAI-tech/NudeNet)
- Model checkpoints: [notAI-tech/NudeNet/releases](https://github.com/notAI-tech/NudeNet/releases/tag/v0)
- Forked from: [vladmandic/nudenet](https://github.com/vladmandic/nudenet)

## License

MIT
