import assert from 'node:assert/strict';
import path from 'node:path';
import test from 'node:test';
import {
  normalizeBasePath,
  outputFileForUrl,
  withBasePath,
  withoutBasePath,
} from '../lib/site-paths.mjs';

const outputDir = path.resolve('dist-test');

test('base paths are normalized consistently', () => {
  assert.equal(normalizeBasePath('/LLM_Wiki_v2/'), '/LLM_Wiki_v2');
  assert.equal(withBasePath('/LLM_Wiki_v2/', '/search/'), '/LLM_Wiki_v2/search/');
  assert.equal(withoutBasePath('/LLM_Wiki_v2', '/LLM_Wiki_v2/search/'), '/search/');
  assert.equal(withoutBasePath('/LLM_Wiki_v2', '/another/search/'), null);
});

test('site URLs resolve to files inside the output directory', () => {
  assert.equal(outputFileForUrl('/', { outputDir }), path.join(outputDir, 'index.html'));
  assert.equal(outputFileForUrl('/search/?q=ELIZA#results', { outputDir }), path.join(outputDir, 'search', 'index.html'));
  assert.equal(outputFileForUrl('/assets/app.js', { outputDir }), path.join(outputDir, 'assets', 'app.js'));
  assert.equal(outputFileForUrl('/LLM_Wiki_v2/', { outputDir, basePath: '/LLM_Wiki_v2' }), path.join(outputDir, 'index.html'));
});

test('site URL resolution rejects base-path and traversal escapes', () => {
  assert.equal(outputFileForUrl('/outside/', { outputDir, basePath: '/LLM_Wiki_v2' }), null);
  assert.equal(outputFileForUrl('/%2e%2e/secrets.txt', { outputDir }), null);
  assert.equal(outputFileForUrl('/..\\secrets.txt', { outputDir }), null);
});
