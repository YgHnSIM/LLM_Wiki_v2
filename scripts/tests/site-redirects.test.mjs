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
  // Canonical ID routes retain both filename compatibility routes and the
  // historical source-number routes (including their artifact readers).
  assert.equal(report.redirectCount, 469);

  const sourceDirectoryHtml = await fs.readFile(path.join(distDir, 'sources', 'index.html'), 'utf8');
  const sourceLabels = [...sourceDirectoryHtml.matchAll(/<span class="source-number(?: source-number--reference)?" aria-hidden="true">([^<]+)<\/span>/g)]
    .map((match) => match[1]);
  const officialNumbers = sourceLabels.filter((label) => /^\d{3}$/.test(label));
  assert.equal(new Set(officialNumbers).size, officialNumbers.length, 'Official source numbers must appear only once.');
  assert.equal(officialNumbers.filter((label) => label === '001').length, 1);
  assert.equal(officialNumbers.filter((label) => label === '103').length, 1);
  assert.equal(sourceLabels.filter((label) => label === '참고').length, report.counts.sources - officialNumbers.length);
  assert.ok(sourceLabels.every((label) => /^\d{3}$/.test(label) || label === '참고'));

  const translationsHtml = await fs.readFile(path.join(distDir, 'translations', 'index.html'), 'utf8');
  const translationLabels = [...translationsHtml.matchAll(/<span class="translation-number">([^<]+)<\/span>/g)]
    .map((match) => match[1]);
  assert.equal(translationLabels.filter((label) => label === '001').length, 1);
  assert.equal(translationLabels.filter((label) => label === '103').length, 1);
  assert.ok(translationLabels.every((label) => /^\d{3}$/.test(label) || label === '참고'));

  const expectedNumberedLegacyPrefixes = new Map([
    ['source.048', '047'],
    ['source.049', '048'],
    ['source.050', '049'],
    ['source.051', '050'],
    ['source.052', '051'],
    ['source.053', '052'],
    ['source.054', '053'],
    ['source.055', '054'],
    ['source.056', '055'],
    ['source.057', '056'],
    ['source.058', '057'],
    ['source.059', '058'],
    ['source.060', '059'],
    ['source.061', '060'],
    ['source.062', '061'],
    ['source.063', '062'],
    ['source.064', '063'],
    ['source.065', '064'],
    ['source.066', '065'],
    ['source.067', '066'],
    ['source.068', '067'],
    ['source.069', '068'],
    ['source.070', '069'],
    ['source.071', '070'],
    ['source.072', '071'],
    ['source.073', '072'],
    ['source.074', '073'],
    ['source.075', '074'],
    ['source.076', '075'],
    ['source.077', '076'],
    ['source.078', '077'],
    ['source.079', '078'],
  ]);
  const sourceRedirects = report.redirects.filter((redirect) => redirect.kind === 'source' && redirect.legacyPrefix);
  assert.deepEqual(
    sourceRedirects.map((redirect) => redirect.sourceId).sort(),
    [...expectedNumberedLegacyPrefixes.keys(), 'source.103'].sort(),
  );
  assert.deepEqual(
    sourceRedirects.filter((redirect) => (
      Number(redirect.canonicalNumber) >= 80 && redirect.sourceId !== 'source.103'
    )),
    [],
    'Sources 080 and later must not acquire redirects unless they are explicitly listed.',
  );

  for (const [sourceId, legacyPrefix] of expectedNumberedLegacyPrefixes) {
    const canonicalPrefix = sourceId.slice('source.'.length);
    const entries = report.redirects.filter((redirect) => redirect.sourceId === sourceId && redirect.legacyPrefix === legacyPrefix);
    assert.deepEqual(entries.map((redirect) => redirect.kind).sort(), ['commentary', 'source', 'translation']);

    const sourceRedirect = entries.find((redirect) => redirect.kind === 'source');
    assert.equal(sourceRedirect.canonicalNumber, canonicalPrefix);
    assert.equal(sourceRedirect.legacyPrefix, legacyPrefix);
    assert.match(sourceRedirect.from, new RegExp(`^/sources/${legacyPrefix}-`));
    assert.equal(sourceRedirect.to, `/sources/${canonicalPrefix}/`);

    for (const kind of ['translation', 'commentary']) {
      const readerRedirect = entries.find((redirect) => redirect.kind === kind);
      assert.equal(readerRedirect.from, `${sourceRedirect.from}${kind}/`);
      assert.equal(readerRedirect.to, `${sourceRedirect.to}${kind}/`);
    }
  }

  const source103Redirects = report.redirects.filter((redirect) => (
    redirect.canonicalNumber === '103' && redirect.legacyPrefix === '102'
  ));
  assert.deepEqual(source103Redirects.map((redirect) => redirect.kind).sort(), ['commentary', 'source', 'translation']);
  const source103Redirect = source103Redirects.find((redirect) => redirect.kind === 'source');
  assert.equal(source103Redirect.legacyPrefix, '102');
  assert.equal(source103Redirect.from, '/sources/glam에서-mixtral까지의-희소-moe-확장/');
  assert.equal(source103Redirect.to, '/sources/103/');
  for (const kind of ['translation', 'commentary']) {
    const readerRedirect = source103Redirects.find((redirect) => redirect.kind === kind);
    assert.equal(readerRedirect.from, `${source103Redirect.from}${kind}/`);
    assert.equal(readerRedirect.to, `${source103Redirect.to}${kind}/`);
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
