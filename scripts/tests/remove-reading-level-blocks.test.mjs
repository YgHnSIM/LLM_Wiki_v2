import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {
  analyzeMarkdownBuffer,
  ENGLISH_READING_INSTRUCTION,
  planReadingLevelCleanup,
  ReadingLevelCleanupError,
  restoreReadingLevelBackup,
  writeReadingLevelCleanup,
} from '../remove-reading-level-blocks.mjs';

const scriptPath = path.resolve('scripts', 'remove-reading-level-blocks.mjs');
const koreanInstruction = '자신의 전문 지식 수준을 선택해 설명되는 용어의 수를 조정할 수 있다. 초보자에게는 더 많은 툴팁이 표시되고, 전문가는 읽기 흐름을 유지할 수 있도록 더 적은 툴팁을 보게 된다. 밑줄 친 용어 위에 마우스를 올리면 정의를 바로 확인할 수 있다.';

function hash(buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

function englishBlock(eol = '\n') {
  return ['Reading Level', '', ENGLISH_READING_INSTRUCTION, ''].join(eol) + eol;
}

function koreanBlock(eol = '\n') {
  return ['읽기 수준', '', koreanInstruction, ''].join(eol) + eol;
}

async function makeFixture() {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'reading-level-cleanup-'));
  const sourceDir = path.join(root, 'sources');
  const translationDir = path.join(root, 'translations');
  const rawDir = path.join(root, 'raw');
  const wikiDir = path.join(root, 'wiki');
  const registryPath = path.join(wikiDir, 'meta', 'raw-artifacts.yml');
  await Promise.all([
    fs.mkdir(sourceDir),
    fs.mkdir(translationDir),
    fs.mkdir(rawDir),
    fs.mkdir(path.dirname(registryPath), { recursive: true }),
  ]);

  const sourceOriginal = Buffer.from(`# Source\r\n\r\nIntro\r\n\r\n${englishBlock('\r\n')}## Body\r\n\r\nKeep me.\r\n`, 'utf8');
  const rawOriginal = Buffer.from(`# 번역\n\n소개\n\n${koreanBlock()}## 본문\n\n보존한다.\n`, 'utf8');
  const commentary = Buffer.from('# 해설\n\n보존한다.\n', 'utf8');
  await Promise.all([
    fs.writeFile(path.join(sourceDir, '001_source.md'), sourceOriginal),
    fs.writeFile(path.join(sourceDir, '002_clean.md'), '# Clean\n\nBody.\n'),
    fs.writeFile(path.join(translationDir, '001_source.ko.md'), '# 번역본\n\n본문.\n'),
    fs.writeFile(path.join(translationDir, '001_source.commentary.ko.md'), commentary),
    fs.writeFile(path.join(rawDir, 'README.md'), '# Raw\n'),
    fs.writeFile(path.join(rawDir, '001_source.ko.md'), rawOriginal),
    fs.writeFile(path.join(rawDir, '001_source.commentary.ko.md'), commentary),
    fs.writeFile(path.join(wikiDir, 'index.md'), '# Wiki\n\n일반적인 읽기 수준 설명은 보존한다.\n'),
  ]);
  const registryText = [
    'schema_version: 1',
    'artifacts:',
    '  - path: "raw/001_source.ko.md"',
    '    role: translation',
    '    order_prefix: "001"',
    '    language: ko',
    `    sha256: ${hash(rawOriginal)}`,
    '  - path: "raw/001_source.commentary.ko.md"',
    '    role: commentary',
    '    order_prefix: "001"',
    '    language: ko',
    `    sha256: ${hash(commentary)}`,
    '',
  ].join('\n');
  await fs.writeFile(registryPath, registryText, 'utf8');
  const expectations = {
    sourceFiles: 2,
    translationFiles: 2,
    rawFiles: 3,
    sourceBlocks: 1,
    rawBlocks: 1,
  };
  return {
    root,
    sourceDir,
    translationDir,
    rawDir,
    wikiDir,
    registryPath,
    registryText,
    sourceOriginal,
    rawOriginal,
    commentary,
    expectations,
    options: { sourceDir, translationDir, rawDir, wikiDir, registryPath, expectations },
    cleanup: () => fs.rm(root, { recursive: true, force: true }),
  };
}

test('exact English CRLF and Korean LF blocks are removed without changing other bytes', () => {
  const english = Buffer.from(`before\r\n\r\n${englishBlock('\r\n')}after\r\n`, 'utf8');
  const englishResult = analyzeMarkdownBuffer(english, 'english.md');
  assert.equal(englishResult.blocks.length, 1);
  assert.equal(englishResult.blocks[0].kind, 'english');
  assert.equal(englishResult.newline, 'CRLF');
  assert.deepEqual(englishResult.output, Buffer.from('before\r\n\r\nafter\r\n'));
  assert.equal(englishResult.output.toString('utf8').includes('\n'), true);
  assert.equal(englishResult.output.toString('utf8').replaceAll('\r\n', '').includes('\n'), false);

  const korean = Buffer.from(`앞\n\n${koreanBlock()}뒤\n`, 'utf8');
  const koreanResult = analyzeMarkdownBuffer(korean, 'korean.md');
  assert.equal(koreanResult.blocks.length, 1);
  assert.equal(koreanResult.blocks[0].kind, 'korean');
  assert.equal(koreanResult.newline, 'LF');
  assert.deepEqual(koreanResult.output, Buffer.from('앞\n\n뒤\n'));
});

test('ordinary prose and complete UI examples inside code fences are preserved', () => {
  const text = [
    '# 문서',
    '',
    '이 문장은 읽기 수준과 용어 정의를 일반적인 편집 원칙으로 논의한다.',
    '',
    '```text',
    'Reading Level',
    '',
    ENGLISH_READING_INSTRUCTION,
    '',
    '```',
    '',
  ].join('\n');
  const result = analyzeMarkdownBuffer(Buffer.from(text), 'safe.md');
  assert.equal(result.blocks.length, 0);
  assert.deepEqual(result.output, Buffer.from(text));

  const longFence = [
    '````text',
    '```',
    '```not-close',
    'Reading Level',
    '',
    ENGLISH_READING_INSTRUCTION,
    '',
    '````',
    '',
  ].join('\n');
  const longFenceResult = analyzeMarkdownBuffer(Buffer.from(longFence), 'long-fence.md');
  assert.equal(longFenceResult.blocks.length, 0);
  assert.deepEqual(longFenceResult.output, Buffer.from(longFence));

  const indented = `    \`\`\`\nReading Level\n\n${ENGLISH_READING_INSTRUCTION}\n\nafter\n`;
  const indentedResult = analyzeMarkdownBuffer(Buffer.from(indented), 'indented.md');
  assert.equal(indentedResult.blocks.length, 1);
});

test('unrecognized markers, orphan instructions, BOM, and invalid UTF-8 are refused', () => {
  assert.throws(
    () => analyzeMarkdownBuffer(Buffer.from('# T\n\nReading Level\n\nordinary paragraph\n\n'), 'marker.md'),
    /unrecognized 'Reading Level' block/,
  );
  assert.throws(
    () => analyzeMarkdownBuffer(Buffer.from(`# T\n\n${ENGLISH_READING_INSTRUCTION}\n`), 'orphan.md'),
    /orphan english reading-level UI instruction/,
  );
  assert.throws(
    () => analyzeMarkdownBuffer(Buffer.concat([Buffer.from([0xef, 0xbb, 0xbf]), Buffer.from('# T\n')]), 'bom.md'),
    /BOM is not allowed/,
  );
  assert.throws(
    () => analyzeMarkdownBuffer(Buffer.from([0xff, 0xfe]), 'invalid.md'),
    /not valid UTF-8/,
  );
});

test('plan validates exact counts and every registered raw hash before any write', async () => {
  const fixture = await makeFixture();
  try {
    const planned = await planReadingLevelCleanup({ ...fixture.options, state: 'pending' });
    assert.deepEqual(planned.report, {
      sourceFiles: 2,
      translationFiles: 2,
      rawFiles: 3,
      wikiFiles: 1,
      registryArtifacts: 2,
      sourceBlocks: 1,
      rawBlocks: 1,
      translationBlocks: 0,
      wikiBlocks: 0,
      changedSourceFiles: 1,
      changedRawFiles: 1,
    });
    await assert.rejects(
      planReadingLevelCleanup({
        ...fixture.options,
        state: 'pending',
        expectations: { ...fixture.expectations, sourceBlocks: 2 },
      }),
      /expected 2, found 1/,
    );
    await fs.writeFile(path.join(fixture.rawDir, '001_source.commentary.ko.md'), 'tampered\n');
    await assert.rejects(
      planReadingLevelCleanup({ ...fixture.options, state: 'pending' }),
      /differs from registry/,
    );
  } finally {
    await fixture.cleanup();
  }
});

test('write backs up every changed file, preserves CRLF, and changes only the intended registry hash scalar', async () => {
  const fixture = await makeFixture();
  const backupDir = path.join(fixture.root, 'backup');
  try {
    const report = await writeReadingLevelCleanup({ ...fixture.options, backupDir, allowCustomPaths: true });
    assert.equal(report.writtenFiles, 2);
    assert.equal(report.changedSourceFiles, 1);
    assert.equal(report.changedRawFiles, 1);
    const sourceAfter = await fs.readFile(path.join(fixture.sourceDir, '001_source.md'));
    const rawAfter = await fs.readFile(path.join(fixture.rawDir, '001_source.ko.md'));
    assert.doesNotMatch(sourceAfter.toString('utf8'), /Reading Level|tooltips/);
    assert.doesNotMatch(rawAfter.toString('utf8'), /읽기 수준|툴팁/);
    assert.equal(sourceAfter.toString('utf8').replaceAll('\r\n', '').includes('\n'), false);
    assert.match(sourceAfter.toString('utf8'), /## Body\r\n\r\nKeep me\./);
    assert.match(rawAfter.toString('utf8'), /## 본문\n\n보존한다\./);

    assert.deepEqual(
      await fs.readFile(path.join(backupDir, 'sources', '001_source.md')),
      fixture.sourceOriginal,
    );
    assert.deepEqual(
      await fs.readFile(path.join(backupDir, 'raw', '001_source.ko.md')),
      fixture.rawOriginal,
    );
    assert.equal(
      await fs.readFile(path.join(backupDir, 'registry', 'raw-artifacts.yml'), 'utf8'),
      fixture.registryText,
    );
    const manifest = JSON.parse(await fs.readFile(path.join(backupDir, 'manifest.json'), 'utf8'));
    assert.equal(manifest.files.length, 2);
    assert.deepEqual(manifest.files.map((item) => item.newline).sort(), ['CRLF', 'LF']);

    const expectedRegistry = fixture.registryText.replace(hash(fixture.rawOriginal), hash(rawAfter));
    assert.equal(await fs.readFile(fixture.registryPath, 'utf8'), expectedRegistry);
    const clean = await planReadingLevelCleanup({ ...fixture.options, state: 'clean' });
    assert.equal(clean.report.sourceBlocks, 0);
    assert.equal(clean.report.rawBlocks, 0);

    const restored = await restoreReadingLevelBackup({ backupDir });
    assert.equal(restored.restoredFiles, 3);
    assert.deepEqual(await fs.readFile(path.join(fixture.sourceDir, '001_source.md')), fixture.sourceOriginal);
    assert.deepEqual(await fs.readFile(path.join(fixture.rawDir, '001_source.ko.md')), fixture.rawOriginal);
    assert.equal(await fs.readFile(fixture.registryPath, 'utf8'), fixture.registryText);
    const pendingAgain = await planReadingLevelCleanup({ ...fixture.options, state: 'pending' });
    assert.equal(pendingAgain.report.sourceBlocks, 1);
    assert.equal(pendingAgain.report.rawBlocks, 1);
  } finally {
    await fixture.cleanup();
  }
});

test('an existing backup directory is refused before writes', async () => {
  const fixture = await makeFixture();
  const backupDir = path.join(fixture.root, 'backup');
  try {
    await fs.mkdir(backupDir);
    await assert.rejects(
      writeReadingLevelCleanup({ ...fixture.options, backupDir, allowCustomPaths: true }),
      /backup directory already exists/,
    );
    assert.deepEqual(await fs.readFile(path.join(fixture.sourceDir, '001_source.md')), fixture.sourceOriginal);
    assert.deepEqual(await fs.readFile(path.join(fixture.rawDir, '001_source.ko.md')), fixture.rawOriginal);
    assert.equal(await fs.readFile(fixture.registryPath, 'utf8'), fixture.registryText);
  } finally {
    await fixture.cleanup();
  }
});

test('post-write failure restores sources, raw, and registry from the backup', async () => {
  const fixture = await makeFixture();
  const backupDir = path.join(fixture.root, 'backup');
  try {
    await assert.rejects(
      writeReadingLevelCleanup({
        ...fixture.options,
        backupDir,
        allowCustomPaths: true,
        postWriteHook: async () => { throw new Error('injected failure'); },
      }),
      /originals were restored/,
    );
    assert.deepEqual(await fs.readFile(path.join(fixture.sourceDir, '001_source.md')), fixture.sourceOriginal);
    assert.deepEqual(await fs.readFile(path.join(fixture.rawDir, '001_source.ko.md')), fixture.rawOriginal);
    assert.equal(await fs.readFile(fixture.registryPath, 'utf8'), fixture.registryText);
    const pending = await planReadingLevelCleanup({ ...fixture.options, state: 'pending' });
    assert.equal(pending.report.sourceBlocks, 1);
    assert.equal(pending.report.rawBlocks, 1);
  } finally {
    await fixture.cleanup();
  }
});

test('CLI audits and verifies fixtures but refuses configurable production writes', async () => {
  const fixture = await makeFixture();
  const backupDir = path.join(fixture.root, 'backup');
  const common = [
    '--sources', fixture.sourceDir,
    '--translations', fixture.translationDir,
    '--raw', fixture.rawDir,
    '--wiki', fixture.wikiDir,
    '--registry', fixture.registryPath,
    '--expected-source-files', '2',
    '--expected-translation-files', '2',
    '--expected-raw-files', '3',
    '--expected-source-blocks', '1',
    '--expected-raw-blocks', '1',
  ];
  try {
    const audit = spawnSync(process.execPath, [scriptPath, '--audit', ...common], { encoding: 'utf8' });
    assert.equal(audit.status, 0, audit.stderr);
    assert.match(audit.stdout, /Status: pending blocks verified/);
    assert.match(audit.stdout, /reading blocks: 1/);

    const refusedWrite = spawnSync(process.execPath, [
      scriptPath, '--write', ...common, '--backup-dir', backupDir,
    ], { encoding: 'utf8' });
    assert.equal(refusedWrite.status, 1);
    assert.match(refusedWrite.stderr, /does not accept custom roots/);

    await writeReadingLevelCleanup({
      ...fixture.options,
      backupDir,
      allowCustomPaths: true,
    });

    const clean = spawnSync(process.execPath, [scriptPath, '--check-clean', ...common], { encoding: 'utf8' });
    assert.equal(clean.status, 0, clean.stderr);
    assert.match(clean.stdout, /Status: clean/);
    assert.match(clean.stdout, /reading blocks: 0/);
  } finally {
    await fixture.cleanup();
  }
});

test('cleanup errors use a stable error type', () => {
  const error = new ReadingLevelCleanupError('example');
  assert.equal(error.name, 'ReadingLevelCleanupError');
  assert.match(error.message, /cleanup refused/);
});
