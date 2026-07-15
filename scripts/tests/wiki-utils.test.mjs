import assert from 'node:assert/strict';
import test from 'node:test';
import {
  createWikiLookup,
  extractWikiLinks,
  normalizeWikiName,
  parseWikiLink,
  slugify,
} from '../lib/wiki-utils.mjs';

test('wiki names use one normalization rule', () => {
  assert.equal(normalizeWikiName('  MADALINE.MD  '), 'madaline');
  assert.equal(normalizeWikiName('ＡＤＡＬＩＮＥ'), 'adaline');
  assert.equal(normalizeWikiName('대규모   언어 모델'), '대규모 언어 모델');
});

test('wiki links preserve headings and display labels', () => {
  assert.deepEqual(parseWikiLink('concepts/ELIZA.md#구조|ELIZA 구조'), {
    raw: 'concepts/ELIZA.md#구조|ELIZA 구조',
    target: 'concepts/ELIZA.md#구조',
    targetPath: 'concepts/ELIZA.md',
    basename: 'ELIZA',
    heading: '구조',
    label: 'ELIZA 구조',
  });
  assert.deepEqual(extractWikiLinks('[[ELIZA]]와 [[MADALINE|다중 ADALINE]]'), ['ELIZA', 'MADALINE|다중 ADALINE']);
});

test('exact filenames win and aliases use the configured category rank', () => {
  const concept = { id: 'concept.eliza', filename: 'ELIZA', title: 'ELIZA', aliases: ['대화 프로그램'], rank: 0 };
  const source = { id: 'source.007', filename: '007_ELIZA', title: 'ELIZA', aliases: ['대화 프로그램'], rank: 1 };
  const lookup = createWikiLookup([source, concept], { rankOf: (document) => document.rank });

  assert.equal(lookup.resolve('007_ELIZA').document, source);
  assert.equal(lookup.resolve('ELIZA').document, concept);
  assert.equal(lookup.resolve('대화 프로그램').document, concept);
  assert.equal(lookup.resolveId('source.007'), source);
});

test('slugs are stable for Korean and Latin headings', () => {
  assert.equal(slugify('MADALINE Rule II'), 'madaline-rule-ii');
  assert.equal(slugify('관련 항목'), '관련-항목');
  assert.equal(slugify('---'), 'page');
});
