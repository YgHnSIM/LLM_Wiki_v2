import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { metaDir, rawDir } from '../lib/project-paths.mjs';
import {
  createArtifactRecords,
  derivePairFilenames,
  formatArtifactRecords,
  normalizeSourceSelection,
  requireSourceUrl,
  sha256,
  sourceUrlFromMarkdown,
  validateArtifactRecord,
  validateTranslationPair,
} from '../lib/source-workflow.mjs';

test('source selections accept numeric prefixes and /lt commands', () => {
  assert.equal(normalizeSourceSelection('010'), '010');
  assert.equal(normalizeSourceSelection('/lt 010'), '010');
  assert.throws(() => normalizeSourceSelection('10'), /three-digit prefix/);
});

test('translation and commentary filenames share the source stem', () => {
  assert.deepEqual(derivePairFilenames('010_Example Source.md'), {
    translation: '010_Example Source.ko.md',
    commentary: '010_Example Source.commentary.ko.md',
  });
});

test('translation pair validation catches placeholders and malformed Markdown', () => {
  const requiredSections = Array.from({ length: 12 }, (_, index) => `## ${index + 1}. 절 ${index + 1}\n\n설명`).join('\n\n');
  assert.deepEqual(validateTranslationPair({
    translation: '---\ntitle: Example\n---\n# 번역\n\n본문',
    commentary: `---\ntitle: Commentary\n---\n# 해설\n\n${requiredSections}`,
  }), []);

  const errors = validateTranslationPair({
    translation: '# 번역\n\n```js\nconst value = 1;',
    commentary: '# 해설\n\n{{placeholder}}',
  });
  assert.ok(errors.some((error) => error.includes('unbalanced code fences')));
  assert.ok(errors.some((error) => error.includes('placeholder')));
});

test('artifact records use stable roles, paths, and hashes', () => {
  const translationHash = sha256(Buffer.from('translation'));
  const commentaryHash = sha256(Buffer.from('commentary'));
  const records = createArtifactRecords({
    prefix: '010',
    translationFilename: '010_Example.ko.md',
    commentaryFilename: '010_Example.commentary.ko.md',
    translationHash,
    commentaryHash,
    sourceUrl: 'https://example.com/writing/example',
  });

  assert.equal(records[0].role, 'translation');
  assert.equal(records[1].role, 'commentary');
  assert.equal(records[0].path, 'raw/010_Example.ko.md');
  assert.match(formatArtifactRecords(records), /order_prefix: "010"/);
  assert.equal(records[0].source_url, 'https://example.com/writing/example');
  assert.match(formatArtifactRecords(records), /source_url: https:\/\/example\.com\/writing\/example/);
  assert.deepEqual(validateArtifactRecord(records[0], { ...records[0] }), []);
  assert.deepEqual(validateArtifactRecord({ ...records[0], sha256: 'wrong' }, records[0]), ['sha256']);
});

test('source URLs are extracted from English and Korean source markers', () => {
  assert.equal(sourceUrlFromMarkdown('Source: https://example.com/a\n'), 'https://example.com/a');
  assert.equal(sourceUrlFromMarkdown('출처: https://example.com/b\n'), 'https://example.com/b');
  assert.equal(sourceUrlFromMarkdown('# no source'), '');
});

test('artifact creation rejects a missing or non-HTTP source_url before copy can write', () => {
  assert.equal(requireSourceUrl('https://example.com/source', 'Source Markdown 060_example.md'), 'https://example.com/source');
  assert.throws(
    () => requireSourceUrl('', 'Source Markdown 060_example.md'),
    /Source Markdown 060_example\.md must provide source_url as an absolute HTTP\(S\) URL/,
  );
  assert.throws(
    () => createArtifactRecords({
      prefix: '060',
      translationFilename: '060_example.ko.md',
      commentaryFilename: '060_example.commentary.ko.md',
      translationHash: sha256('translation'),
      commentaryHash: sha256('commentary'),
    }),
    /Raw artifact records must provide source_url/,
  );
});

test('source:status keeps the local selector but reports the mapped official chapter', async () => {
  const fixtureRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'llm-wiki-source-numbering-'));
  const sourceDir = path.join(fixtureRoot, 'sources');
  const translationDir = path.join(fixtureRoot, 'translations');
  await fs.mkdir(sourceDir);
  await fs.mkdir(translationDir);
  await fs.writeFile(
    path.join(sourceDir, '077_numbering-example.md'),
    '# Numbering example\n\nSource: https://example.com/writing/numbering-example\n',
    'utf8',
  );

  try {
    const result = spawnSync(process.execPath, ['scripts/source-workflow.mjs', 'status', '077'], {
      cwd: process.cwd(),
      encoding: 'utf8',
      env: {
        ...process.env,
        LLM_SOURCE_DIR: sourceDir,
        LLM_TRANSLATION_DIR: translationDir,
      },
    });
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /Local inventory 077 -> official chapter 078/);
    assert.match(result.stdout, /public source page \(source\.078\):/);
  } finally {
    await fs.rm(fixtureRoot, { recursive: true, force: true });
  }
});

test('source:copy and source:ready fail clearly when the source Markdown has no source_url', async () => {
  const fixtureRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'llm-wiki-source-url-'));
  const sourceDir = path.join(fixtureRoot, 'sources');
  const translationDir = path.join(fixtureRoot, 'translations');
  await fs.mkdir(sourceDir);
  await fs.mkdir(translationDir);
  await fs.writeFile(path.join(sourceDir, '060_missing-url.md'), '# Missing URL\n\nBody\n', 'utf8');
  const registryPath = path.join(metaDir, 'raw-artifacts.yml');
  const expectedRawPaths = [
    path.join(rawDir, '060_missing-url.ko.md'),
    path.join(rawDir, '060_missing-url.commentary.ko.md'),
  ];
  const rawSnapshot = () => Promise.all(expectedRawPaths.map(async (rawPath) => {
    try {
      const content = await fs.readFile(rawPath);
      return { exists: true, sha256: sha256(content) };
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
      return { exists: false, sha256: null };
    }
  }));
  const registryBefore = await fs.readFile(registryPath, 'utf8');
  const rawSnapshotBefore = await rawSnapshot();

  try {
    const statusResult = spawnSync(process.execPath, ['scripts/source-workflow.mjs', 'status', '060'], {
      cwd: process.cwd(),
      encoding: 'utf8',
      env: {
        ...process.env,
        LLM_SOURCE_DIR: sourceDir,
        LLM_TRANSLATION_DIR: translationDir,
      },
    });
    assert.equal(statusResult.status, 0);
    assert.match(statusResult.stdout, /source_url: missing \(source:copy and source:ready will fail\)/);
    assert.equal(await fs.readFile(registryPath, 'utf8'), registryBefore);
    assert.deepEqual(await rawSnapshot(), rawSnapshotBefore);

    for (const command of ['copy', 'ready']) {
      const result = spawnSync(process.execPath, ['scripts/source-workflow.mjs', command, '060'], {
        cwd: process.cwd(),
        encoding: 'utf8',
        env: {
          ...process.env,
          LLM_SOURCE_DIR: sourceDir,
          LLM_TRANSLATION_DIR: translationDir,
        },
      });
      assert.notEqual(result.status, 0, `${command} unexpectedly succeeded`);
      assert.match(result.stderr, /Source Markdown 060_missing-url\.md must provide source_url as an absolute HTTP\(S\) URL/);
      assert.equal(await fs.readFile(registryPath, 'utf8'), registryBefore);
      assert.deepEqual(await rawSnapshot(), rawSnapshotBefore);
    }
    assert.deepEqual(await fs.readdir(translationDir), []);
  } finally {
    await fs.rm(fixtureRoot, { recursive: true, force: true });
  }
});
