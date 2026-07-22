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

function validTranslation(label) {
  return `---\ntitle: ${label}\n---\n# ${label}\n\n번역 본문\n`;
}

function validCommentary(label) {
  const sections = Array.from(
    { length: 12 },
    (_, index) => `## ${index + 1}. 절 ${index + 1}\n\n해설 본문`,
  ).join('\n\n');
  return `---\ntitle: ${label}\n---\n# ${label}\n\n${sections}\n`;
}

async function createWorkflowFixture({
  prefix = '081',
  completed = true,
  externalDiffers = false,
  registryHashMismatch = false,
  omitCommentaryRecord = false,
} = {}) {
  const fixtureRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'llm-wiki-source-workflow-'));
  const sourceDirectory = path.join(fixtureRoot, 'sources');
  const translationDirectory = path.join(fixtureRoot, 'translations');
  const rawDirectory = path.join(fixtureRoot, 'raw');
  const wikiDirectory = path.join(fixtureRoot, 'wiki');
  const sourcePagesDirectory = path.join(wikiDirectory, 'sources');
  const registryFile = path.join(fixtureRoot, 'raw-artifacts.yml');
  const fakeNpmPath = path.join(fixtureRoot, 'fake-npm.mjs');
  const stem = `${prefix}_workflow-example`;
  const sourceUrl = 'https://example.com/writing/workflow-example';
  const filenames = derivePairFilenames(`${stem}.md`);
  const externalTranslation = validTranslation('현재 번역');
  const externalCommentary = validCommentary('현재 해설');
  const immutableTranslation = externalDiffers ? validTranslation('보존 번역') : externalTranslation;
  const immutableCommentary = externalDiffers ? validCommentary('보존 해설') : externalCommentary;

  await Promise.all([
    fs.mkdir(sourceDirectory),
    fs.mkdir(translationDirectory),
    fs.mkdir(rawDirectory),
    fs.mkdir(sourcePagesDirectory, { recursive: true }),
  ]);
  await Promise.all([
    fs.writeFile(path.join(sourceDirectory, `${stem}.md`), `# Workflow example\n\nSource: ${sourceUrl}\n`, 'utf8'),
    fs.writeFile(path.join(translationDirectory, filenames.translation), externalTranslation, 'utf8'),
    fs.writeFile(path.join(translationDirectory, filenames.commentary), externalCommentary, 'utf8'),
    fs.writeFile(fakeNpmPath, "console.log('fixture verify passed');\n", 'utf8'),
  ]);

  let records = createArtifactRecords({
    prefix,
    translationFilename: filenames.translation,
    commentaryFilename: filenames.commentary,
    translationHash: sha256(immutableTranslation),
    commentaryHash: sha256(immutableCommentary),
    sourceUrl,
  });
  if (registryHashMismatch) records[0] = { ...records[0], sha256: sha256('incorrect registry hash') };
  if (omitCommentaryRecord) records = records.slice(0, 1);

  if (completed) {
    await Promise.all([
      fs.writeFile(path.join(rawDirectory, filenames.translation), immutableTranslation, 'utf8'),
      fs.writeFile(path.join(rawDirectory, filenames.commentary), immutableCommentary, 'utf8'),
      fs.writeFile(
        path.join(sourcePagesDirectory, `${stem}.md`),
        `---\nid: source.${prefix}\nartifacts:\n  - raw/${filenames.translation}\n  - raw/${filenames.commentary}\n---\n# Workflow example\n`,
        'utf8',
      ),
    ]);
  }

  const initialRecords = completed ? records : createArtifactRecords({
    prefix: '001',
    translationFilename: '001_existing.ko.md',
    commentaryFilename: '001_existing.commentary.ko.md',
    translationHash: sha256('existing translation'),
    commentaryHash: sha256('existing commentary'),
    sourceUrl: 'https://example.com/writing/existing',
  });
  await fs.writeFile(
    registryFile,
    `schema_version: 1\nartifacts:\n${formatArtifactRecords(initialRecords)}\n`,
    'utf8',
  );

  const env = {
    ...process.env,
    LLM_SOURCE_DIR: sourceDirectory,
    LLM_TRANSLATION_DIR: translationDirectory,
    LLM_RAW_DIR: rawDirectory,
    LLM_WIKI_DIR: wikiDirectory,
    LLM_RAW_REGISTRY_PATH: registryFile,
    npm_execpath: fakeNpmPath,
  };
  return {
    fixtureRoot,
    env,
    filenames,
    rawDirectory,
    registryFile,
    externalTranslation,
    externalCommentary,
  };
}

function runWorkflow(command, prefix, env) {
  return spawnSync(process.execPath, ['scripts/source-workflow.mjs', command, prefix], {
    cwd: process.cwd(),
    encoding: 'utf8',
    env,
  });
}

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
  assert.deepEqual(validateArtifactRecord({
    ...records[0],
    order_prefix: '011',
    source_url: 'https://example.com/writing/other',
  }, records[0]), ['order_prefix', 'source_url']);
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

test('source:status uses the official selector unchanged and accepts chapter 110', async () => {
  const fixtureRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'llm-wiki-source-numbering-'));
  const sourceDir = path.join(fixtureRoot, 'sources');
  const translationDir = path.join(fixtureRoot, 'translations');
  await fs.mkdir(sourceDir);
  await fs.mkdir(translationDir);
  await fs.writeFile(
    path.join(sourceDir, '110_numbering-example.md'),
    '# Numbering example\n\nSource: https://example.com/writing/numbering-example\n',
    'utf8',
  );

  try {
    const result = spawnSync(process.execPath, ['scripts/source-workflow.mjs', 'status', '110'], {
      cwd: process.cwd(),
      encoding: 'utf8',
      env: {
        ...process.env,
        LLM_SOURCE_DIR: sourceDir,
        LLM_TRANSLATION_DIR: translationDir,
      },
    });
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /Official source 110: 110_numbering-example\.md/);
    assert.match(result.stdout, /public source page \(source\.110\):/);
  } finally {
    await fs.rm(fixtureRoot, { recursive: true, force: true });
  }
});

test('the translation workflow excludes the editorial reconstruction for official chapter 047', () => {
  for (const command of ['status', 'copy', 'ready']) {
    const result = spawnSync(process.execPath, ['scripts/source-workflow.mjs', command, '047'], {
      cwd: process.cwd(),
      encoding: 'utf8',
    });
    assert.notEqual(result.status, 0, `${command} unexpectedly accepted official source 047`);
    assert.match(
      result.stderr,
      /Official source 047 has no upstream original.*editorial reconstruction/s,
    );
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

test('completed post-ingest presentation edits are non-fatal warnings for status and ready', async () => {
  const fixture = await createWorkflowFixture({ externalDiffers: true });
  try {
    const statusResult = runWorkflow('status', '081', fixture.env);
    assert.equal(statusResult.status, 0, statusResult.stderr);
    assert.match(statusResult.stdout, /non-fatal preservation warnings/);
    assert.match(statusResult.stdout, /differs from the current external translation output/);
    assert.match(statusResult.stdout, /immutable raw\/registry records are internally consistent/);

    const readyResult = runWorkflow('ready', '081', fixture.env);
    assert.equal(readyResult.status, 0, readyResult.stderr);
    assert.match(readyResult.stdout, /non-fatal preservation warnings/);
    assert.match(readyResult.stdout, /fixture verify passed/);
    assert.match(readyResult.stdout, /Official source 081 is ready for reviewed staging on main/);
  } finally {
    await fs.rm(fixture.fixtureRoot, { recursive: true, force: true });
  }
});

test('source:copy refuses to overwrite immutable raw after external presentation edits', async () => {
  const fixture = await createWorkflowFixture({ externalDiffers: true });
  const rawTranslationPath = path.join(fixture.rawDirectory, fixture.filenames.translation);
  const rawCommentaryPath = path.join(fixture.rawDirectory, fixture.filenames.commentary);
  const before = await Promise.all([
    fs.readFile(rawTranslationPath),
    fs.readFile(rawCommentaryPath),
    fs.readFile(fixture.registryFile, 'utf8'),
  ]);
  try {
    const result = runWorkflow('copy', '081', fixture.env);
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /Refusing to overwrite immutable artifact raw\/081_workflow-example\.ko\.md/);
    const after = await Promise.all([
      fs.readFile(rawTranslationPath),
      fs.readFile(rawCommentaryPath),
      fs.readFile(fixture.registryFile, 'utf8'),
    ]);
    assert.deepEqual(after, before);
  } finally {
    await fs.rm(fixture.fixtureRoot, { recursive: true, force: true });
  }
});

test('source:copy still creates and registers raw for a new source', async () => {
  const fixture = await createWorkflowFixture({ completed: false });
  try {
    const result = runWorkflow('copy', '081', fixture.env);
    assert.equal(result.status, 0, result.stderr);
    assert.equal(
      await fs.readFile(path.join(fixture.rawDirectory, fixture.filenames.translation), 'utf8'),
      fixture.externalTranslation,
    );
    assert.equal(
      await fs.readFile(path.join(fixture.rawDirectory, fixture.filenames.commentary), 'utf8'),
      fixture.externalCommentary,
    );
    const registry = await fs.readFile(fixture.registryFile, 'utf8');
    assert.match(registry, /raw\/081_workflow-example\.ko\.md/);
    assert.match(registry, /raw\/081_workflow-example\.commentary\.ko\.md/);
  } finally {
    await fs.rm(fixture.fixtureRoot, { recursive: true, force: true });
  }
});

test('source:ready fails when immutable raw SHA-256 differs from its registry record', async () => {
  const fixture = await createWorkflowFixture({ registryHashMismatch: true });
  try {
    const statusResult = runWorkflow('status', '081', fixture.env);
    assert.equal(statusResult.status, 0, statusResult.stderr);
    assert.match(statusResult.stdout, /validation problems/);
    assert.match(statusResult.stdout, /SHA-256 does not match its raw-artifacts\.yml record/);

    const result = runWorkflow('ready', '081', fixture.env);
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /raw\/081_workflow-example\.ko\.md SHA-256 does not match its raw-artifacts\.yml record/);
    assert.doesNotMatch(result.stdout, /fixture verify passed/);
  } finally {
    await fs.rm(fixture.fixtureRoot, { recursive: true, force: true });
  }
});

test('source:ready still fails when a required raw artifact has no registry record', async () => {
  const fixture = await createWorkflowFixture({ omitCommentaryRecord: true });
  try {
    const result = runWorkflow('ready', '081', fixture.env);
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /raw\/081_workflow-example\.commentary\.ko\.md is not registered in raw-artifacts\.yml/);
    assert.doesNotMatch(result.stdout, /fixture verify passed/);
  } finally {
    await fs.rm(fixture.fixtureRoot, { recursive: true, force: true });
  }
});
