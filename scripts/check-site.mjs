import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(scriptDir, '..');
const distDir = path.join(rootDir, 'dist');
const report = JSON.parse(await fs.readFile(path.join(distDir, 'build-report.json'), 'utf8'));
const basePath = report.basePath ?? '';

async function walk(directory, extension = '') {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const files = await Promise.all(entries.map(async (entry) => {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) return walk(absolute, extension);
    if (!extension || entry.name.endsWith(extension)) return [absolute];
    return [];
  }));
  return files.flat();
}

function withoutBasePath(urlPath) {
  if (!basePath) return urlPath;
  if (urlPath === basePath) return '/';
  if (urlPath.startsWith(`${basePath}/`)) return urlPath.slice(basePath.length);
  return null;
}

function safeDecode(value) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function fileForUrl(rawUrl) {
  const [rawPath] = rawUrl.split(/[?#]/);
  const stripped = withoutBasePath(rawPath);
  if (stripped === null) return null;
  const decoded = safeDecode(stripped || '/').replace(/^\/+/, '');
  if (!decoded) return path.join(distDir, 'index.html');
  if (path.posix.extname(decoded)) return path.join(distDir, ...decoded.split('/'));
  return path.join(distDir, ...decoded.replace(/\/$/, '').split('/'), 'index.html');
}

const htmlFiles = await walk(distDir, '.html');
const htmlCache = new Map();
const errors = [];
let checkedReferences = 0;

for (const htmlFile of htmlFiles) {
  const html = await fs.readFile(htmlFile, 'utf8');
  htmlCache.set(htmlFile, html);
  if (html.includes('\uFFFD')) errors.push(`${path.relative(distDir, htmlFile)} contains a replacement character.`);

  for (const match of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    const value = match[1];
    if (/^(?:https?:|mailto:|tel:|data:|javascript:)/i.test(value)) continue;
    checkedReferences += 1;

    if (value.startsWith('#')) {
      const fragment = safeDecode(value.slice(1));
      if (fragment && !html.includes(`id="${fragment}"`)) {
        errors.push(`${path.relative(distDir, htmlFile)} has a missing local fragment: ${value}`);
      }
      continue;
    }

    const targetFile = fileForUrl(value);
    if (!targetFile) {
      errors.push(`${path.relative(distDir, htmlFile)} escapes the configured base path: ${value}`);
      continue;
    }

    try {
      await fs.access(targetFile);
    } catch {
      errors.push(`${path.relative(distDir, htmlFile)} points to a missing file: ${value}`);
      continue;
    }

    const fragment = value.includes('#') ? safeDecode(value.split('#')[1].split('?')[0]) : '';
    if (fragment && targetFile.endsWith('.html')) {
      const targetHtml = htmlCache.get(targetFile) ?? await fs.readFile(targetFile, 'utf8');
      htmlCache.set(targetFile, targetHtml);
      if (!targetHtml.includes(`id="${fragment}"`)) {
        errors.push(`${path.relative(distDir, htmlFile)} points to a missing fragment: ${value}`);
      }
    }
  }
}

const searchIndex = JSON.parse(await fs.readFile(path.join(distDir, 'search-index.json'), 'utf8'));
for (const entry of searchIndex) {
  const targetFile = fileForUrl(entry.url);
  try {
    await fs.access(targetFile);
  } catch {
    errors.push(`Search index points to a missing page: ${entry.url}`);
  }
}

if (errors.length) {
  console.error(`Site check failed with ${errors.length} error(s):`);
  for (const error of errors.slice(0, 40)) console.error(`- ${error}`);
  if (errors.length > 40) console.error(`- ...and ${errors.length - 40} more`);
  process.exitCode = 1;
} else {
  console.log(`Checked ${htmlFiles.length} HTML files and ${checkedReferences} local references.`);
  console.log(`Search index contains ${searchIndex.length} entries.`);
  console.log(`Unresolved wiki targets retained as non-clickable labels: ${report.unresolvedLinks.length}.`);
}
