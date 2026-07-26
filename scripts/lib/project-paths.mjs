import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const libraryDir = path.dirname(fileURLToPath(import.meta.url));

export const rootDir = path.resolve(libraryDir, '..', '..');

function samePath(left, right) {
  const normalize = (value) => (
    process.platform === 'win32' ? String(value).toLowerCase() : String(value)
  );
  return normalize(left) === normalize(right);
}

function isInside(candidate, parent) {
  const relative = path.relative(parent, candidate);
  return relative !== ''
    && relative !== '..'
    && !relative.startsWith(`..${path.sep}`)
    && !path.isAbsolute(relative);
}

export function resolveDistDir(projectRoot, overrideValue = '') {
  const resolvedRoot = path.resolve(projectRoot);
  const defaultDistDir = path.join(resolvedRoot, 'dist');
  const candidate = String(overrideValue ?? '').trim();
  if (!candidate) return defaultDistDir;
  if (candidate.includes('\0')) throw new TypeError('LLM_DIST_DIR must not contain a null byte.');
  if (!path.isAbsolute(candidate) && /^[A-Za-z][A-Za-z0-9+.-]*:/.test(candidate)) {
    throw new TypeError('LLM_DIST_DIR must be a filesystem path, not a URI or drive-relative path.');
  }

  const resolvedOverride = path.isAbsolute(candidate)
    ? path.resolve(candidate)
    : path.resolve(resolvedRoot, candidate);
  const filesystemRoot = path.parse(resolvedOverride).root;
  if (samePath(resolvedOverride, filesystemRoot) || samePath(resolvedOverride, resolvedRoot)) {
    throw new Error('LLM_DIST_DIR must identify a dedicated output directory.');
  }

  const temporaryRoot = path.resolve(os.tmpdir());
  if (samePath(resolvedOverride, temporaryRoot)) {
    throw new Error('LLM_DIST_DIR must identify a dedicated output directory.');
  }
  const isSiteOutput = samePath(resolvedOverride, defaultDistDir)
    || isInside(resolvedOverride, defaultDistDir)
    || isInside(resolvedOverride, temporaryRoot);
  if (!isSiteOutput) {
    throw new Error('LLM_DIST_DIR must stay inside the project dist directory or system temporary directory.');
  }

  return resolvedOverride;
}

export const rawDir = path.join(rootDir, 'raw');
export const wikiDir = path.join(rootDir, 'wiki');
export const metaDir = path.join(wikiDir, 'meta');
export const siteDir = path.join(rootDir, 'site');
export const distDir = resolveDistDir(rootDir, process.env.LLM_DIST_DIR);
