import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createArtifactRecords,
  derivePairFilenames,
  formatArtifactRecords,
  normalizeSourceSelection,
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
