import assert from 'node:assert/strict';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { resolveDistDir } from '../lib/project-paths.mjs';

test('dist directory defaults to the project-local dist path', () => {
  const projectRoot = path.resolve('fixture-project');

  assert.equal(resolveDistDir(projectRoot), path.join(projectRoot, 'dist'));
  assert.equal(resolveDistDir(projectRoot, '   '), path.join(projectRoot, 'dist'));
});

test('dist directory overrides resolve relative paths from the project root and accept absolute paths', () => {
  const projectRoot = path.resolve('fixture-project');
  const absoluteOutput = path.join(os.tmpdir(), 'llm-wiki-site-output');

  assert.equal(
    resolveDistDir(projectRoot, path.join('dist', 'site-output')),
    path.join(projectRoot, 'dist', 'site-output'),
  );
  assert.equal(resolveDistDir(projectRoot, absoluteOutput), path.resolve(absoluteOutput));
});

test('dist directory overrides reject broad or escaping targets', () => {
  const projectRoot = path.resolve('fixture-project');

  assert.throws(
    () => resolveDistDir(projectRoot, projectRoot),
    /dedicated output directory/,
  );
  assert.throws(
    () => resolveDistDir(projectRoot, path.parse(projectRoot).root),
    /dedicated output directory/,
  );
  assert.throws(
    () => resolveDistDir(projectRoot, os.tmpdir()),
    /dedicated output directory/,
  );
  assert.throws(
    () => resolveDistDir(projectRoot, '..'),
    /must stay inside the project dist directory or system temporary directory/,
  );
  assert.throws(
    () => resolveDistDir(projectRoot, path.join(path.dirname(projectRoot), 'unrelated-output')),
    /must stay inside the project dist directory or system temporary directory/,
  );
  for (const protectedDirectory of ['.git', 'raw', 'wiki', 'scripts', 'site', 'docs']) {
    assert.throws(
      () => resolveDistDir(projectRoot, protectedDirectory),
      /must stay inside the project dist directory or system temporary directory/,
      protectedDirectory,
    );
  }
  assert.throws(
    () => resolveDistDir(projectRoot, 'bad\0path'),
    /must not contain a null byte/,
  );
  assert.throws(
    () => resolveDistDir(projectRoot, 'file:///tmp/site-output'),
    /must be a filesystem path/,
  );
  if (process.platform === 'win32') {
    assert.throws(
      () => resolveDistDir(projectRoot, 'C:drive-relative-output'),
      /must be a filesystem path/,
    );
  }
});
