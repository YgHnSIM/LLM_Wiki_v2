import assert from 'node:assert/strict';
import test from 'node:test';
import {
  duplicateValues,
  isIsoDate,
  isRecord,
  nonemptyString,
  normalizeRepoRelativePath,
} from '../lib/initiative-ledger.mjs';

test('record and string primitives reject arrays, null, and blank strings', () => {
  assert.equal(isRecord({}), true);
  assert.equal(isRecord(Object.create(null)), true);
  assert.equal(isRecord([]), false);
  assert.equal(isRecord(null), false);

  assert.equal(nonemptyString(' value '), true);
  assert.equal(nonemptyString(' \t\n'), false);
  assert.equal(nonemptyString(42), false);
});

test('duplicateValues returns each repeated value once in encounter order', () => {
  assert.deepEqual(duplicateValues(['alpha', 'beta', 'alpha', 'beta', 'alpha']), ['alpha', 'beta']);
  assert.deepEqual(duplicateValues(), []);
});

test('normalizeRepoRelativePath normalizes separators and rejects unsafe paths', () => {
  assert.equal(normalizeRepoRelativePath(' docs\\initiative.yml '), 'docs/initiative.yml');
  assert.equal(normalizeRepoRelativePath('wiki/개념.md'), 'wiki/개념.md');
  assert.equal(normalizeRepoRelativePath('./docs/initiative.yml'), 'docs/initiative.yml');

  for (const unsafe of [
    '',
    '.',
    '..',
    '../outside.yml',
    'docs/../outside.yml',
    '/absolute.yml',
    '\\\\server\\share\\ledger.yml',
    'C:\\ledger.yml',
    'https://example.com/ledger.yml',
    'docs/\0ledger.yml',
  ]) {
    assert.equal(normalizeRepoRelativePath(unsafe), null, unsafe);
  }
});

test('isIsoDate validates real Gregorian calendar dates', () => {
  assert.equal(isIsoDate('2024-02-29'), true);
  assert.equal(isIsoDate('2000-02-29'), true);
  assert.equal(isIsoDate('1900-02-29'), false);
  assert.equal(isIsoDate('2026-02-29'), false);
  assert.equal(isIsoDate('2026-04-31'), false);
  assert.equal(isIsoDate('2026-13-01'), false);
  assert.equal(isIsoDate('0000-01-01'), false);
  assert.equal(isIsoDate('2026-7-26'), false);
  assert.equal(isIsoDate(new Date('2026-07-26')), false);
});
