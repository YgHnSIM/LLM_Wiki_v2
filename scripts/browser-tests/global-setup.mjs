import { createSiteServer } from '../serve-site.mjs';
import { normalizeBasePath } from '../lib/site-paths.mjs';

export default async function globalSetup() {
  const host = '127.0.0.1';
  const port = Number.parseInt(process.env.SITE_SERVER_PORT ?? '4173', 10);
  const basePath = normalizeBasePath(process.env.BASE_PATH ?? '');
  const server = createSiteServer({ host, port, basePath });

  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(port, host, resolve);
  });

  return async () => {
    server.closeAllConnections();
    await new Promise((resolve) => server.close(resolve));
  };
}
