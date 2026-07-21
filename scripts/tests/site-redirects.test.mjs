import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { distDir, rootDir } from '../lib/project-paths.mjs';
import { outputFileForUrl, withBasePath } from '../lib/site-paths.mjs';
import { walkFiles } from '../lib/wiki-utils.mjs';

test('renumbered source and artifact-reader URLs retain static legacy redirects', async () => {
  const testBasePath = '/LLM_Wiki_v2';
  const build = spawnSync(process.execPath, ['scripts/build-site.mjs'], {
    cwd: rootDir,
    env: { ...process.env, BASE_PATH: testBasePath },
    encoding: 'utf8',
  });
  assert.equal(build.status, 0, build.stderr || build.stdout);

  const report = JSON.parse(await fs.readFile(path.join(distDir, 'build-report.json'), 'utf8'));
  assert.equal(report.redirectCount, report.redirects.length);

  for (let canonicalNumber = 48; canonicalNumber <= 78; canonicalNumber += 1) {
    const canonicalPrefix = String(canonicalNumber).padStart(3, '0');
    const artifactPrefix = String(canonicalNumber - 1).padStart(3, '0');
    const entries = report.redirects.filter((redirect) => redirect.canonicalNumber === canonicalPrefix);
    assert.deepEqual(entries.map((redirect) => redirect.kind).sort(), ['commentary', 'source', 'translation']);

    const sourceRedirect = entries.find((redirect) => redirect.kind === 'source');
    assert.equal(sourceRedirect.artifactPrefix, artifactPrefix);
    assert.match(sourceRedirect.from, new RegExp(`^/sources/${artifactPrefix}-`));
    assert.match(sourceRedirect.to, new RegExp(`^/sources/${canonicalPrefix}-`));

    for (const kind of ['translation', 'commentary']) {
      const readerRedirect = entries.find((redirect) => redirect.kind === kind);
      assert.equal(readerRedirect.from, `${sourceRedirect.from}${kind}/`);
      assert.equal(readerRedirect.to, `${sourceRedirect.to}${kind}/`);
    }
  }

  const fromRoutes = report.redirects.map((redirect) => redirect.from);
  assert.equal(new Set(fromRoutes).size, fromRoutes.length);
  assert.equal(report.redirects.some((redirect) => fromRoutes.includes(redirect.to)), false);

  for (const redirect of report.redirects) {
    const fromUrl = withBasePath(testBasePath, redirect.from);
    const toUrl = withBasePath(testBasePath, redirect.to);
    const redirectFile = outputFileForUrl(fromUrl, { outputDir: distDir, basePath: testBasePath });
    const html = await fs.readFile(redirectFile, 'utf8');
    assert.match(html, /<meta http-equiv="refresh"/);
    assert.ok(html.includes(`<link rel="canonical" href="${toUrl}">`));
    assert.ok(html.includes(`href="${toUrl}"`));
  }

  const htmlFiles = await walkFiles(distDir, '.html');
  assert.equal(htmlFiles.length, report.pages);

  const check = spawnSync(process.execPath, ['scripts/check-site.mjs'], {
    cwd: rootDir,
    encoding: 'utf8',
  });
  assert.equal(check.status, 0, check.stderr || check.stdout);
});
