import assert from 'node:assert/strict';
import test from 'node:test';
import {
  canonicalSourcePrefix,
  localInventoryPrefixForCanonical,
  localInventoryPrefixesFromArtifacts,
  sourcePageNumberingErrors,
} from '../lib/source-numbering.mjs';

test('local inventory prefixes map to the official book numbering around the missing chapter', () => {
  assert.equal(canonicalSourcePrefix('001'), '001');
  assert.equal(canonicalSourcePrefix('046'), '046');
  assert.equal(canonicalSourcePrefix('047'), '048');
  assert.equal(canonicalSourcePrefix('077'), '078');
  assert.equal(canonicalSourcePrefix('078'), '079');
  assert.equal(canonicalSourcePrefix('109'), '110');
});

test('official numbering maps back to local inventory while chapter 047 remains absent', () => {
  assert.equal(localInventoryPrefixForCanonical('001'), '001');
  assert.equal(localInventoryPrefixForCanonical('046'), '046');
  assert.equal(localInventoryPrefixForCanonical('047'), null);
  assert.equal(localInventoryPrefixForCanonical('048'), '047');
  assert.equal(localInventoryPrefixForCanonical('078'), '077');
  assert.equal(localInventoryPrefixForCanonical('110'), '109');
  assert.throws(() => canonicalSourcePrefix('110'), /between 001 and 109/);
  assert.throws(() => localInventoryPrefixForCanonical('111'), /between 001 and 110/);
});

test('raw artifact prefixes remain physical local inventory identifiers', () => {
  assert.deepEqual(localInventoryPrefixesFromArtifacts([
    'raw/077_Chinchilla.ko.md',
    'raw/077_Chinchilla.commentary.ko.md',
    'raw/not-numbered.md',
  ]), ['077']);
  assert.deepEqual(localInventoryPrefixesFromArtifacts([
    'raw/048_second.md',
    'raw/047-first.md',
  ]), ['047', '048']);
});

test('public source pages must use the canonical ID and filename derived from raw provenance', () => {
  const artifacts = [
    'raw/077_Chinchilla.ko.md',
    'raw/077_Chinchilla.commentary.ko.md',
  ];
  assert.deepEqual(sourcePageNumberingErrors({
    id: 'source.078',
    filename: '078_Chinchilla와 계산 최적 언어 모델 학습',
    artifacts,
  }), []);

  const errors = sourcePageNumberingErrors({
    id: 'source.077',
    filename: '077_Chinchilla와 계산 최적 언어 모델 학습',
    artifacts,
  });
  assert.ok(errors.some((error) => error.includes("must be 'source.078'")));
  assert.ok(errors.some((error) => error.includes('must start with official prefix 078')));

  assert.deepEqual(sourcePageNumberingErrors({
    id: 'source.048',
    filename: '048_잔차 학습',
    artifacts: ['raw/047_a.md', 'raw/048_b.md'],
  }), ['source page artifacts use multiple local inventory prefixes: 047, 048.']);
  assert.deepEqual(sourcePageNumberingErrors({
    id: 'source.048',
    filename: '048_잔차 학습',
    artifacts: ['raw/unnumbered.md'],
  }), ['source page must reference at least one raw artifact with a three-digit local inventory prefix.']);
});
