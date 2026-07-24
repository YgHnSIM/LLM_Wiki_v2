import assert from 'node:assert/strict';
import path from 'node:path';
import test from 'node:test';
import yaml from 'js-yaml';
import {
  BOUNDARY_SLOTS,
  buildBoundaryStatus,
  normalizeRepoRelativePath,
  parseBoundaryStatusArguments,
  renderBoundaryStatus,
  runBoundaryStatus,
  validateBoundaryLedger,
  validateBoundaryLedgerStructure,
} from '../llm-system-boundary-status.mjs';

function validLedger() {
  const batches = Array.from({ length: 12 }, (_, index) => ({
    id: `batch-${index}`,
    order: index,
    title: `배치 ${index}`,
    stage: index === 0 ? 'complete' : 'planned',
    depends_on: index === 0 ? [] : [`batch-${index - 1}`],
    commit_message: index === 0 ? 'docs: framework' : `content: batch_${index}`,
    deliverables: [],
    expected_paths: [`wiki/analyses/배치 ${index}.md`],
  }));
  const owners = Array.from({ length: 6 }, (_, index) => ({
    id: `owner-${index + 1}`,
    title: `Owner ${index + 1}`,
    path: `wiki/concepts/Owner ${index + 1}.md`,
    page_id: `concept.owner-${index + 1}`,
    page_type: 'concept',
    action: 'create',
    stage: 'planned',
    required_by: [`batch-${index + 1}`],
  }));
  const bridges = Array.from({ length: 6 }, (_, index) => ({
    id: `bridge-${index + 1}`,
    title: `Bridge ${index + 1}`,
    path: `wiki/analyses/Bridge ${index + 1}.md`,
    page_id: `analysis.bridge-${index + 1}`,
    page_type: 'analysis',
    action: 'create',
    stage: 'planned',
    required_by: [`batch-${index + 1}`],
  }));
  return {
    schema_version: 1,
    initiative: {
      id: 'llm-system-boundary-network',
      title: 'LLM 시스템 경계 확장',
      current_batch: 'batch-1',
      next_action: '다음 배치를 시작한다.',
      blockers: [],
      hub: {
        path: 'wiki/meta/LLM 시스템 경계 확장 지도.md',
        page_id: 'meta.llm-system-boundary-map',
        title: 'LLM 시스템 경계 확장 지도',
        page_type: 'meta',
        stage: 'planned',
      },
      handoff: {
        updated: '2026-07-25',
        baseline_commit: 'c6d66c057120099b5f0ce98b77d175bff6ea2a7c',
        last_completed_batch: 'batch-0',
        last_completed_gate: 'framework-verified',
        validation: [],
        recovery: ['npm run boundary:resume'],
        notes: '테스트 원장이다.',
      },
    },
    boundary_slots: [...BOUNDARY_SLOTS],
    owners,
    bridges,
    tracks: Array.from({ length: 6 }, (_, index) => ({
      id: `track-${index + 1}`,
      priority: index + 1,
      title: `Track ${index + 1}`,
      primary_title: owners[index].title,
      stage: 'planned',
      owners: [`owner-${index + 1}`],
      bridges: [`bridge-${index + 1}`],
      primary_path: owners[index].path,
      primary_page_id: owners[index].page_id,
      primary_page_type: 'concept',
      batches: [`batch-${index + 1}`],
    })),
    batches,
  };
}

function virtualFiles(projectRoot, documents) {
  const files = new Map(Object.entries(documents));
  const relativePath = (absolutePath) => path.relative(projectRoot, absolutePath).replaceAll('\\', '/');
  return {
    fileExists: async (absolutePath) => files.has(relativePath(absolutePath)),
    readFile: async (absolutePath) => {
      const key = relativePath(absolutePath);
      if (!files.has(key)) {
        const error = new Error(`ENOENT: ${key}`);
        error.code = 'ENOENT';
        throw error;
      }
      return files.get(key);
    },
  };
}

function completeConcept({ id, title }) {
  return [
    '---',
    `id: ${id}`,
    'page_type: concept',
    `title: ${title}`,
    '---',
    `# ${title}`,
    '',
    '> [!note] 학습 안내',
    '> **난이도:** 입문',
    '',
    '## 1단계 — 먼저 잡을 핵심',
    '',
    '핵심',
    '',
    '## 2단계 — 작동 원리',
    '',
    '원리',
    '',
    '## 3단계 — 기술과 근거',
    '',
    BOUNDARY_SLOTS.join(' | '),
    '',
    '## 검증과 한계',
    '',
    '한계',
    '',
    '## 학습 확인',
    '',
    '질문',
    '',
    '## 출처',
    '',
    '근거',
    '',
    '## 관련 항목',
    '',
    '항목',
  ].join('\n');
}

test('planned ledger identifies the first incomplete batch as the only resume target', () => {
  const ledger = validLedger();
  assert.deepEqual(validateBoundaryLedgerStructure(ledger), []);
  const status = buildBoundaryStatus(ledger);
  assert.equal(status.current_batch.id, 'batch-1');
  assert.equal(status.progress.batches.complete, 1);
  assert.match(renderBoundaryStatus(status), /Current batch: batch-1/);
});

test('schema, slots, order, dependency, and current batch cannot drift', () => {
  const ledger = validLedger();
  ledger.schema_version = 2;
  ledger.boundary_slots.pop();
  ledger.batches[2].depends_on = ['batch-0'];
  ledger.initiative.current_batch = 'batch-2';
  ledger.owners[0].path = '../outside.md';
  const errors = validateBoundaryLedgerStructure(ledger);
  assert.ok(errors.some((error) => error.includes('schema_version must be 1')));
  assert.ok(errors.some((error) => error.includes('seven required boundary labels')));
  assert.ok(errors.some((error) => error.includes('depends_on must be the immediately preceding batch')));
  assert.ok(errors.some((error) => error.includes("first incomplete batch 'batch-1'")));
  assert.ok(errors.some((error) => error.includes('safe repo-relative path')));
});

test('completed track requires a real primary page with all seven boundary slots', async () => {
  const ledger = validLedger();
  ledger.batches[1].stage = 'complete';
  ledger.initiative.current_batch = 'batch-2';
  ledger.tracks[0].stage = 'complete';
  ledger.owners[0].stage = 'complete';
  const projectRoot = path.resolve('virtual-boundary-project');
  const page = completeConcept({ id: ledger.owners[0].page_id, title: ledger.owners[0].title });
  const files = virtualFiles(projectRoot, { [ledger.owners[0].path]: page });
  assert.deepEqual(await validateBoundaryLedger(ledger, { projectRoot, ...files }), []);

  const broken = virtualFiles(projectRoot, {
    [ledger.owners[0].path]: page.replace('권한·책임·출처 추적', '권한'),
  });
  const errors = await validateBoundaryLedger(ledger, { projectRoot, ...broken });
  assert.ok(errors.some((error) => error.includes("boundary slot '권한·책임·출처 추적'")));
});

test('CLI arguments and resume output work with a custom ledger and injected git state', async () => {
  assert.deepEqual(parseBoundaryStatusArguments(['--check']), {
    check: true,
    resume: false,
    ledgerPath: 'docs/llm-system-boundary-network.yml',
  });
  assert.deepEqual(parseBoundaryStatusArguments(['--resume', '--ledger', 'docs/custom.yml']), {
    check: false,
    resume: true,
    ledgerPath: 'docs/custom.yml',
  });
  assert.equal(normalizeRepoRelativePath('docs\\custom.yml'), 'docs/custom.yml');
  assert.equal(normalizeRepoRelativePath('C:\\outside.yml'), null);
  assert.throws(() => parseBoundaryStatusArguments(['--resume', '--check']), /cannot be used together/);

  const ledger = validLedger();
  const projectRoot = path.resolve('virtual-boundary-cli-project');
  const files = virtualFiles(projectRoot, { 'docs/custom.yml': yaml.dump(ledger) });
  const result = await runBoundaryStatus(['--resume', '--ledger', 'docs/custom.yml'], {
    projectRoot,
    ...files,
    inspectGit: async (loadedLedger) => ({
      branch: 'main',
      ahead: 0,
      behind: 0,
      current: loadedLedger.batches[1],
      matchingChanges: ['wiki/analyses/배치 1.md'],
      unrelatedChanges: ['user-note.md'],
      action: "Resume 'batch-1' using only its expected paths, then run its validation gate.",
    }),
  });
  assert.match(result.output, /Matching local changes: wiki\/analyses\/배치 1.md/);
  assert.match(result.output, /Unrelated local changes: user-note.md/);
});
