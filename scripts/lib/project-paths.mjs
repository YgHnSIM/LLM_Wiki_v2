import path from 'node:path';
import { fileURLToPath } from 'node:url';

const libraryDir = path.dirname(fileURLToPath(import.meta.url));

export const rootDir = path.resolve(libraryDir, '..', '..');
export const rawDir = path.join(rootDir, 'raw');
export const wikiDir = path.join(rootDir, 'wiki');
export const metaDir = path.join(wikiDir, 'meta');
export const siteDir = path.join(rootDir, 'site');
export const distDir = path.join(rootDir, 'dist');
