import path from 'node:path';

export function normalizeBasePath(value = '') {
  const cleaned = String(value).trim().replace(/^\/+|\/+$/g, '');
  return cleaned ? `/${cleaned}` : '';
}

export function withBasePath(basePath, pathname = '/') {
  const normalizedPath = String(pathname).startsWith('/') ? String(pathname) : `/${pathname}`;
  return `${normalizeBasePath(basePath)}${normalizedPath}`;
}

export function withoutBasePath(basePath, pathname) {
  const normalizedBasePath = normalizeBasePath(basePath);
  if (!normalizedBasePath) return pathname;
  if (pathname === normalizedBasePath) return '/';
  if (pathname.startsWith(`${normalizedBasePath}/`)) return pathname.slice(normalizedBasePath.length);
  return null;
}

export function safeDecode(value) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export function outputFileForUrl(rawUrl, { outputDir, basePath = '' }) {
  const [rawPath] = String(rawUrl).split(/[?#]/);
  const strippedPath = withoutBasePath(basePath, rawPath);
  if (strippedPath === null) return null;

  const decodedPath = safeDecode(strippedPath || '/').replaceAll('\\', '/');
  if (decodedPath.includes('\0')) return null;
  const segments = decodedPath.replace(/^\/+|\/+$/g, '').split('/').filter(Boolean);
  if (segments.some((segment) => segment === '..')) return null;

  const outputRoot = path.resolve(outputDir);
  const relativeOutput = segments.length === 0
    ? ['index.html']
    : path.posix.extname(segments.at(-1))
      ? segments
      : [...segments, 'index.html'];
  const outputFile = path.resolve(outputRoot, ...relativeOutput);
  if (outputFile !== outputRoot && !outputFile.startsWith(`${outputRoot}${path.sep}`)) return null;
  return outputFile;
}
