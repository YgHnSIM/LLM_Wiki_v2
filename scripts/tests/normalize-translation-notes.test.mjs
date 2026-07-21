import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {
  isTranslationFilename,
  planTranslationNormalization,
  TranslationNormalizationError,
  writeTranslationNormalization,
} from '../normalize-translation-notes.mjs';

const scriptPath = path.resolve('scripts', 'normalize-translation-notes.mjs');

async function makeFixture({ notes, commentary = {}, registryRecords } = {}) {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'translation-normalize-'));
  const translationDir = path.join(root, 'translations');
  const registryPath = path.join(root, 'raw-artifacts.yml');
  await fs.mkdir(translationDir);
  for (const [filename, content] of Object.entries(notes ?? {})) {
    await fs.writeFile(path.join(translationDir, filename), content);
  }
  for (const [filename, content] of Object.entries(commentary)) {
    await fs.writeFile(path.join(translationDir, filename), content);
  }

  const records = registryRecords ?? Object.keys(notes ?? {}).map((filename) => {
    const prefix = filename.slice(0, 3);
    return {
      path: `raw/${filename}`,
      role: Number(prefix) <= 5 ? 'translated-essay' : 'translation',
      order_prefix: prefix,
      language: 'ko',
      source_url: `https://example.com/source-${prefix}`,
      sha256: 'fixture',
    };
  });
  const yaml = [
    'schema_version: 1',
    'artifacts:',
    ...records.flatMap((record) => [
      `  - path: ${record.path}`,
      `    role: ${record.role}`,
      `    order_prefix: "${record.order_prefix}"`,
      '    language: ko',
      ...(record.source_url === undefined ? [] : [`    source_url: ${record.source_url}`]),
      '    sha256: fixture',
    ]),
    '',
  ].join('\n');
  await fs.writeFile(registryPath, yaml, 'utf8');
  return {
    root,
    translationDir,
    registryPath,
    cleanup: () => fs.rm(root, { recursive: true, force: true }),
  };
}

test('translation discovery includes current and 001-005 legacy notes but excludes commentary', () => {
  assert.equal(isTranslationFilename('001_legacy.md'), true);
  assert.equal(isTranslationFilename('005_legacy.md'), true);
  assert.equal(isTranslationFilename('006_current.ko.md'), true);
  assert.equal(isTranslationFilename('103_current.ko.md'), true);
  assert.equal(isTranslationFilename('001_legacy.commentary.md'), false);
  assert.equal(isTranslationFilename('008_current.commentary.ko.md'), false);
  assert.equal(isTranslationFilename('006_not-legacy.md'), false);
});

test('write removes safe reading blocks, canonicalizes source labels, inserts missing sources, and never reads commentary', async () => {
  const currentOriginal = [
    '---',
    'translation_type: "번역"',
    '---',
    '',
    '# 현재 번역',
    '',
    'Source: https://example.com/source-008',
    '',
    '읽기 수준',
    '',
    '전문 지식 수준을 선택하면 용어 설명이 달라진다. 초급자는 도구 설명을 더 보고, 밑줄 친 용어에 마우스를 올리면 정의를 확인한다.',
    '',
    '## 본문',
    '',
    '일반 본문은 유지한다.',
    '',
  ].join('\n');
  const legacyOriginal = [
    '도입 문단',
    '',
    '## 첫 번째 절',
    '',
    '읽기 수준',
    '',
    '용어 설명 수준에 따라 도움말이 달라진다. 밑줄 친 용어 위에 마우스를 올리면 정의를 확인한다.',
    '',
    '보존할 본문',
    '',
  ].join('\n');
  const ignoredCommentary = Buffer.from([0xff, 0xfe, 0x00, 0x0d, 0x0a]);
  const fixture = await makeFixture({
    notes: {
      '001_legacy.md': legacyOriginal,
      '008_current.ko.md': currentOriginal,
    },
    commentary: {
      '001_legacy.commentary.md': ignoredCommentary,
      '008_current.commentary.ko.md': ignoredCommentary,
    },
  });
  const backupDir = path.join(fixture.root, 'backup');

  try {
    const before = await planTranslationNormalization({
      translationDir: fixture.translationDir,
      registryPath: fixture.registryPath,
      expectedCount: 2,
    });
    assert.equal(before.report.totalFiles, 2);
    assert.equal(before.report.changedFiles, 2);
    assert.equal(before.report.readingBlocks, 2);
    assert.deepEqual(before.report.sourceMarkers, { canonical: 0, noncanonical: 1, missing: 1 });

    const written = await writeTranslationNormalization({
      translationDir: fixture.translationDir,
      registryPath: fixture.registryPath,
      expectedCount: 2,
      backupDir,
    });
    assert.equal(written.writtenFiles, 2);

    const current = await fs.readFile(path.join(fixture.translationDir, '008_current.ko.md'), 'utf8');
    const legacy = await fs.readFile(path.join(fixture.translationDir, '001_legacy.md'), 'utf8');
    assert.match(current, /# 현재 번역\n\n원본 출처: https:\/\/example\.com\/source-008\n/);
    assert.match(legacy, /## 첫 번째 절\n\n원본 출처: https:\/\/example\.com\/source-001\n\n보존할 본문/);
    assert.doesNotMatch(current + legacy, /읽기 수준|도구 설명|도움말/);
    assert.match(current, /일반 본문은 유지한다\./);
    assert.equal(current.includes('\r'), false);
    assert.equal(current.endsWith('\n'), true);
    assert.equal(await fs.readFile(path.join(backupDir, '008_current.ko.md'), 'utf8'), currentOriginal);
    assert.equal(await fs.readFile(path.join(backupDir, '001_legacy.md'), 'utf8'), legacyOriginal);
    assert.deepEqual(
      await fs.readFile(path.join(fixture.translationDir, '008_current.commentary.ko.md')),
      ignoredCommentary,
    );

    const after = await planTranslationNormalization({
      translationDir: fixture.translationDir,
      registryPath: fixture.registryPath,
      expectedCount: 2,
    });
    assert.equal(after.report.changedFiles, 0);
    assert.equal(after.report.readingBlocks, 0);
    assert.deepEqual(after.report.sourceMarkers, { canonical: 2, noncanonical: 0, missing: 0 });
  } finally {
    await fixture.cleanup();
  }
});

test('ordinary prose mentioning reading or definitions is preserved', async () => {
  const prose = [
    '# 안전한 문서',
    '',
    '원본 출처: https://example.com/source-008',
    '',
    '이 절은 읽기 수준과 용어 정의를 일반적인 문맥에서 논의한다.',
    '',
  ].join('\n');
  const fixture = await makeFixture({ notes: { '008_safe.ko.md': prose } });
  try {
    const plan = await planTranslationNormalization({
      translationDir: fixture.translationDir,
      registryPath: fixture.registryPath,
      expectedCount: 1,
    });
    assert.equal(plan.report.changedFiles, 0);
    assert.equal(plan.report.readingBlocks, 0);
  } finally {
    await fixture.cleanup();
  }
});

test('unsafe source and structure conditions refuse all writes', async (t) => {
  const cases = [
    {
      name: 'duplicate source markers',
      text: '# 제목\n\nSource: https://example.com/source-008\n\n출처: https://example.com/source-008\n',
      match: /duplicate source markers/,
    },
    {
      name: 'registry mismatch',
      text: '# 제목\n\n출처: https://example.com/wrong\n',
      match: /does not match registry/,
    },
    {
      name: 'source marker without URL',
      text: '# 제목\n\n원문 출처:\n',
      match: /no valid absolute HTTP\(S\) URL/,
    },
    {
      name: 'heading missing',
      text: '본문만 있다.\n',
      match: /no Markdown heading/,
    },
    {
      name: 'unrecognized reading block',
      text: '# 제목\n\n원본 출처: https://example.com/source-008\n\n읽기 수준\n\n일반 문단\n\n',
      match: /unrecognized '읽기 수준' block/,
    },
    {
      name: 'CRLF',
      text: '# 제목\r\n\r\n원본 출처: https://example.com/source-008\r\n',
      match: /CR or CRLF/,
    },
    {
      name: 'missing trailing newline',
      text: '# 제목\n\n원본 출처: https://example.com/source-008',
      match: /trailing LF newline/,
    },
  ];

  for (const item of cases) {
    await t.test(item.name, async () => {
      const fixture = await makeFixture({ notes: { '008_risky.ko.md': item.text } });
      const before = await fs.readFile(path.join(fixture.translationDir, '008_risky.ko.md'));
      try {
        await assert.rejects(
          planTranslationNormalization({
            translationDir: fixture.translationDir,
            registryPath: fixture.registryPath,
            expectedCount: 1,
          }),
          item.match,
        );
        assert.deepEqual(await fs.readFile(path.join(fixture.translationDir, '008_risky.ko.md')), before);
      } finally {
        await fixture.cleanup();
      }
    });
  }
});

test('BOM, missing registry URL, duplicate registry records, and count mismatch are refused', async (t) => {
  await t.test('BOM', async () => {
    const fixture = await makeFixture({ notes: { '008_bom.ko.md': Buffer.concat([
      Buffer.from([0xef, 0xbb, 0xbf]),
      Buffer.from('# 제목\n\n원본 출처: https://example.com/source-008\n'),
    ]) } });
    try {
      await assert.rejects(planTranslationNormalization({
        translationDir: fixture.translationDir,
        registryPath: fixture.registryPath,
        expectedCount: 1,
      }), /UTF-8 BOM/);
    } finally {
      await fixture.cleanup();
    }
  });

  await t.test('missing registry URL', async () => {
    const fixture = await makeFixture({
      notes: { '008_missing.ko.md': '# 제목\n' },
      registryRecords: [{ path: 'raw/008_missing.ko.md', role: 'translation', order_prefix: '008' }],
    });
    try {
      await assert.rejects(planTranslationNormalization({
        translationDir: fixture.translationDir,
        registryPath: fixture.registryPath,
        expectedCount: 1,
      }), /registry translation record has no valid/);
    } finally {
      await fixture.cleanup();
    }
  });

  await t.test('duplicate registry records', async () => {
    const record = {
      path: 'raw/008_duplicate.ko.md', role: 'translation', order_prefix: '008', source_url: 'https://example.com/source-008',
    };
    const fixture = await makeFixture({
      notes: { '008_duplicate.ko.md': '# 제목\n' },
      registryRecords: [record, { ...record, path: 'raw/008_other.ko.md' }],
    });
    try {
      await assert.rejects(planTranslationNormalization({
        translationDir: fixture.translationDir,
        registryPath: fixture.registryPath,
        expectedCount: 1,
      }), /expected exactly one translation registry record/);
    } finally {
      await fixture.cleanup();
    }
  });

  await t.test('count mismatch', async () => {
    const fixture = await makeFixture({ notes: { '008_only.ko.md': '# 제목\n' } });
    try {
      await assert.rejects(planTranslationNormalization({
        translationDir: fixture.translationDir,
        registryPath: fixture.registryPath,
        expectedCount: 78,
      }), /expected 78 translation notes, found 1/);
    } finally {
      await fixture.cleanup();
    }
  });
});

test('registry prefixes dynamically define the complete translation set', async (t) => {
  const record = (prefix) => ({
    path: `raw/${prefix}_note.ko.md`,
    role: 'translation',
    order_prefix: prefix,
    source_url: `https://example.com/source-${prefix}`,
  });

  await t.test('registry-only historical artifact is reported but does not block existing notes', async () => {
    const fixture = await makeFixture({
      notes: {
        '008_note.ko.md': '# 제목\n\n원본 출처: https://example.com/source-008\n',
      },
      registryRecords: [record('008'), record('009')],
    });
    try {
      const plan = await planTranslationNormalization({
        translationDir: fixture.translationDir,
        registryPath: fixture.registryPath,
      });
      assert.deepEqual(plan.report.registryOnlyPrefixes, ['009']);
      assert.equal(plan.report.totalFiles, 1);
    } finally {
      await fixture.cleanup();
    }
  });

  await t.test('external prefix absent from registry', async () => {
    const fixture = await makeFixture({
      notes: {
        '008_note.ko.md': '# 제목\n\n원본 출처: https://example.com/source-008\n',
        '009_note.ko.md': '# 제목\n\n원본 출처: https://example.com/source-009\n',
      },
      registryRecords: [record('008')],
    });
    try {
      await assert.rejects(planTranslationNormalization({
        translationDir: fixture.translationDir,
        registryPath: fixture.registryPath,
      }), /translation notes contain prefixes absent from the registry: 009/);
    } finally {
      await fixture.cleanup();
    }
  });

  await t.test('matching dynamic set needs no fixed expected count', async () => {
    const fixture = await makeFixture({
      notes: {
        '008_note.ko.md': '# 제목\n\n원본 출처: https://example.com/source-008\n',
        '009_note.ko.md': '# 제목\n\n원본 출처: https://example.com/source-009\n',
      },
      registryRecords: [record('008'), record('009')],
    });
    try {
      const plan = await planTranslationNormalization({
        translationDir: fixture.translationDir,
        registryPath: fixture.registryPath,
      });
      assert.equal(plan.report.totalFiles, 2);
      assert.equal(plan.report.registryPrefixCount, 2);
      assert.deepEqual(plan.report.registryOnlyPrefixes, []);
      assert.equal(plan.report.expectedCount, undefined);
    } finally {
      await fixture.cleanup();
    }
  });

  await t.test('known missing official chapter cannot enter either set', async () => {
    const fixture = await makeFixture({
      notes: {
        '047_gap.ko.md': '# 제목\n\n원본 출처: https://example.com/source-047\n',
      },
      registryRecords: [record('047')],
    });
    try {
      await assert.rejects(planTranslationNormalization({
        translationDir: fixture.translationDir,
        registryPath: fixture.registryPath,
      }), /Official source 047 is unavailable/);
    } finally {
      await fixture.cleanup();
    }
  });
});

test('write requires a backup directory and refuses an existing backup basename', async () => {
  const original = '# 제목\n\nSource: https://example.com/source-008\n';
  const fixture = await makeFixture({ notes: { '008_note.ko.md': original } });
  const backupDir = path.join(fixture.root, 'backup');
  try {
    await assert.rejects(writeTranslationNormalization({
      translationDir: fixture.translationDir,
      registryPath: fixture.registryPath,
      expectedCount: 1,
    }), /--backup-dir is required/);

    await fs.mkdir(backupDir);
    await fs.writeFile(path.join(backupDir, '008_note.ko.md'), 'collision', 'utf8');
    await assert.rejects(writeTranslationNormalization({
      translationDir: fixture.translationDir,
      registryPath: fixture.registryPath,
      expectedCount: 1,
      backupDir,
    }), /backup file already exists/);
    assert.equal(await fs.readFile(path.join(fixture.translationDir, '008_note.ko.md'), 'utf8'), original);
  } finally {
    await fixture.cleanup();
  }
});

test('CLI check reports pending with exit 2, write verifies, and a second check is clean', async () => {
  const fixture = await makeFixture({
    notes: { '008_cli.ko.md': '# 제목\n\nSource: https://example.com/source-008\n' },
  });
  const backupDir = path.join(fixture.root, 'backup');
  const common = [
    '--translation-dir', fixture.translationDir,
    '--registry', fixture.registryPath,
    '--expected-count', '1',
  ];
  try {
    const pending = spawnSync(process.execPath, [scriptPath, '--check', ...common], { encoding: 'utf8' });
    assert.equal(pending.status, 2, pending.stderr);
    assert.match(pending.stdout, /Pending files: 1/);
    assert.match(pending.stdout, /Status: pending normalization/);

    const written = spawnSync(process.execPath, [
      scriptPath, '--write', ...common, '--backup-dir', backupDir,
    ], { encoding: 'utf8' });
    assert.equal(written.status, 0, written.stderr);
    assert.match(written.stdout, /Status: normalized and verified/);

    const clean = spawnSync(process.execPath, [scriptPath, '--check', ...common], { encoding: 'utf8' });
    assert.equal(clean.status, 0, clean.stderr);
    assert.match(clean.stdout, /Pending files: 0/);
    assert.match(clean.stdout, /Status: clean/);
  } finally {
    await fixture.cleanup();
  }
});

test('normalization errors use a stable error type', () => {
  const error = new TranslationNormalizationError('example');
  assert.equal(error.name, 'TranslationNormalizationError');
  assert.match(error.message, /Translation normalization refused/);
});
