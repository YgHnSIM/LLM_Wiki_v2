import { createServer } from 'node:http';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { distDir } from './lib/project-paths.mjs';
import { normalizeBasePath, outputFileForUrl } from './lib/site-paths.mjs';

const contentTypes = new Map([
  ['.css', 'text/css; charset=utf-8'],
  ['.html', 'text/html; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.svg', 'image/svg+xml'],
  ['.woff2', 'font/woff2'],
]);

export function createSiteServer({ host = '127.0.0.1', port = 4173, basePath = '' } = {}) {
  const normalizedBasePath = normalizeBasePath(basePath);
  return createServer(async (request, response) => {
    const requestUrl = new URL(request.url ?? '/', `http://${host}:${port}`);
    const outputFile = outputFileForUrl(requestUrl.pathname, { outputDir: distDir, basePath: normalizedBasePath });
    if (!outputFile) {
      response.writeHead(404).end('Not found');
      return;
    }

    try {
      const body = await fs.readFile(outputFile);
      response.writeHead(200, {
        'Content-Type': contentTypes.get(path.extname(outputFile)) ?? 'application/octet-stream',
        'Cache-Control': 'no-store',
      });
      response.end(request.method === 'HEAD' ? undefined : body);
    } catch {
      response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      response.end('Not found');
    }
  });
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const host = '127.0.0.1';
  const port = Number.parseInt(process.env.SITE_SERVER_PORT ?? '4173', 10);
  const basePath = normalizeBasePath(process.env.SITE_SERVER_BASE_PATH ?? '');
  const server = createSiteServer({ host, port, basePath });
  server.listen(port, host, () => {
    console.log(`Serving ${distDir} at http://${host}:${port}${basePath}/`);
  });
}
