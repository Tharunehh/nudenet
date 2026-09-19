import express, { Express, Request, Response } from 'express';
import { json, urlencoded } from 'body-parser';
import { join } from 'path';
import { ServerConfig, defaultServerConfig } from '../core/config';
import { createDetectionRouter } from './routes/detection';

export function createApp(config: Partial<ServerConfig> = {}): Express {
  const settings: ServerConfig = { ...defaultServerConfig, ...config };
  const app = express();

  app.use(json({ limit: settings.maxFileSize }));
  app.use(urlencoded({ extended: true, limit: settings.maxFileSize }));
  app.use(express.static(join(__dirname, '../../public')));

  app.use('/api', createDetectionRouter());

  app.get('/', (_req: Request, res: Response) => {
    res.sendFile(join(__dirname, '../../public/index.html'));
  });

  app.use((err: any, _req: Request, res: Response, _next: any) => {
    res.status(500).json({ error: err.message });
  });

  return app;
}

export function startServer(config: Partial<ServerConfig> = {}): void {
  const settings: ServerConfig = { ...defaultServerConfig, ...config };
  const app = createApp(settings);
  const server = app.listen(settings.port, settings.host, () => {
    console.log(`NudeNet API server running at http://${settings.host}:${settings.port}`);
    console.log(`Web UI available at http://${settings.host}:${settings.port}`);
  });
}

if (require.main === module) {
  startServer();
}
