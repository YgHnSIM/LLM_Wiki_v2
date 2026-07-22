import assert from 'node:assert/strict';
import { promises as fs } from 'node:fs';
import test from 'node:test';
import yaml from 'js-yaml';
import { metaDir } from '../lib/project-paths.mjs';
import {
  EDITORIALLY_RECONSTRUCTED_SOURCE_PREFIX,
  officialSourcePrefix,
  rawArtifactRecordNumberingErrors,
  sourcePageNumberingErrors,
  sourcePrefixesFromArtifacts,
} from '../lib/source-numbering.mjs';

test('selectors use every official source number directly, including reconstructed chapter 047', () => {
  for (const prefix of ['001', '046', '047', '048', '078', '079', '103', '109', '110']) {
    assert.equal(officialSourcePrefix(prefix), prefix);
  }
  assert.throws(() => officialSourcePrefix('000'), /between 001 and 110/);
  assert.throws(() => officialSourcePrefix('111'), /between 001 and 110/);
});

test('the source gap registry preserves upstream absence while recording the public reconstruction', async () => {
  const registry = yaml.safeLoad(await fs.readFile(`${metaDir}/source-gaps.yml`, 'utf8'));
  assert.equal(registry.schema_version, 1);
  assert.deepEqual(registry.gaps.map((gap) => String(gap.source_number)), [EDITORIALLY_RECONSTRUCTED_SOURCE_PREFIX]);
  assert.equal(registry.gaps[0].status, 'editorial-reconstruction-published');
  assert.equal(registry.gaps[0].upstream_status, 'unavailable');
  assert.equal(officialSourcePrefix(registry.gaps[0].source_number), '047');
});

test('raw artifact paths expose their official source prefixes', () => {
  assert.deepEqual(sourcePrefixesFromArtifacts([
    'raw/078_Chinchilla.ko.md',
    'raw/078_Chinchilla.commentary.ko.md',
    'raw/not-numbered.md',
  ]), ['078']);
  assert.deepEqual(sourcePrefixesFromArtifacts([
    'raw/049_second.md',
    'raw/048-first.md',
  ]), ['048', '049']);
});

test('raw registry order_prefix must equal the official path prefix', () => {
  assert.deepEqual(rawArtifactRecordNumberingErrors({
    path: 'raw/103_Mixture of Experts at Scale.ko.md',
    order_prefix: '103',
  }), []);
  assert.deepEqual(rawArtifactRecordNumberingErrors({
    path: 'raw/103_Mixture of Experts at Scale.ko.md',
    order_prefix: '102',
  }), ["order_prefix '102' must match raw path prefix 103."]);
  assert.deepEqual(rawArtifactRecordNumberingErrors({
    path: 'raw/unnumbered.md',
    order_prefix: '103',
  }), ["raw artifact path 'raw/unnumbered.md' must start with a three-digit official source prefix."]);
  assert.deepEqual(rawArtifactRecordNumberingErrors({
    path: 'raw/047_missing.md',
    order_prefix: '047',
  }), []);
});

test('public source IDs, filenames, and raw artifacts use the same official prefix', () => {
  const artifacts = [
    'raw/078_Chinchilla.ko.md',
    'raw/078_Chinchilla.commentary.ko.md',
  ];
  assert.deepEqual(sourcePageNumberingErrors({
    id: 'source.078',
    filename: '078_Chinchilla와 계산 최적 언어 모델 학습',
    artifacts,
  }), []);

  assert.deepEqual(sourcePageNumberingErrors({
    id: 'source.103',
    filename: '103_GLaM에서 Mixtral까지의 희소 MoE 확장',
    artifacts: [
      'raw/103_Mixture of Experts at Scale.ko.md',
      'raw/103_Mixture of Experts at Scale.commentary.ko.md',
    ],
  }), []);

  const errors = sourcePageNumberingErrors({
    id: 'source.079',
    filename: '079_Chinchilla와 계산 최적 언어 모델 학습',
    artifacts,
  });
  assert.ok(errors.some((error) => error.includes("must be 'source.078'")));
  assert.ok(errors.some((error) => error.includes('must start with official prefix 078')));

  assert.deepEqual(sourcePageNumberingErrors({
    id: 'source.048',
    filename: '048_잔차 학습',
    artifacts: ['raw/048_a.md', 'raw/049_b.md'],
  }), ['source page artifacts use multiple official source prefixes: 048, 049.']);
  assert.deepEqual(sourcePageNumberingErrors({
    id: 'source.048',
    filename: '048_잔차 학습',
    artifacts: ['raw/unnumbered.md'],
  }), ['source page must reference at least one raw artifact with a three-digit official source prefix.']);
  assert.deepEqual(sourcePageNumberingErrors({
    id: 'source.047',
    filename: '047_Attention Mechanism',
    artifacts: ['raw/047_Attention Mechanism.ko.md'],
  }), []);
});
