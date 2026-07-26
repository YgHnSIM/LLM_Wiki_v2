import assert from 'node:assert/strict';
import path from 'node:path';
import test from 'node:test';
import yaml from 'js-yaml';
import {
  buildHistoryStatus,
  normalizeRepoRelativePath,
  parseHistoryStatusArguments,
  renderHistoryStatus,
  runHistoryStatus,
  validateHistoryLedger,
  validateHistoryLedgerStructure,
} from '../llm-computing-history-status.mjs';

function validLedger() {
  const chapters = Array.from({ length: 9 }, (_, index) => ({
    order: index + 1,
    batch: `chapter-${index + 1}`,
    title: `본편 ${index + 1}`,
    path: `wiki/analyses/본편 ${index + 1}.md`,
    page_id: `analysis.chapter-${index + 1}`,
    stage: 'planned',
    capability_layers: ['computability'],
  }));
  return {
    schema_version: 2,
    initiative: {
      id: 'llm-computing-history',
      title: 'LLM과 컴퓨팅 능력의 공진화',
      current_batch: 'framework',
      next_action: '검사기를 검증한다.',
      blockers: [],
      hub: {
        path: 'wiki/meta/LLM과 컴퓨팅 능력의 공진화.md',
        id: 'meta.llm-computing-coevolution',
        stage: 'planned',
      },
      synthesis: {
        path: 'wiki/analyses/LLM 능력은 모델의 속성인가 시스템의 속성인가.md',
        id: 'analysis.llm-capability-model-or-system',
        stage: 'planned',
      },
      handoff: {
        updated: '2026-07-24',
        baseline_commit: 'f7a635fa608fc456e0b0be41f49910e443b203ca',
        last_completed_gate: null,
        validation: [],
        notes: '테스트 원장이다.',
      },
    },
    capability_layers: [
      'computability',
      'complexity',
      'programmability',
      'realized-performance',
      'scalability',
      'resource-efficiency',
      'reliable-results',
    ],
    causal_relations: [
      'direct-influence',
      'enabling-condition',
      'parallel-context',
      'retrospective-analogy',
    ],
    owners: [
      {
        id: 'owner',
        title: 'Owner',
        path: 'wiki/concepts/Owner.md',
        page_id: 'concept.owner',
        stage: 'planned',
        required_by: ['chapter-1'],
      },
    ],
    chapters,
    bridges: [
      {
        id: 'bridge',
        title: '연결고리',
        path: 'wiki/analyses/연결고리.md',
        page_id: 'analysis.bridge',
        stage: 'planned',
        connects: ['chapter-1', 'chapter-2'],
        capability_layers: ['programmability', 'realized-performance'],
      },
    ],
    batches: [
      {
        id: 'framework',
        title: '틀',
        stage: 'in_progress',
        deliverables: ['docs/plan.md'],
      },
      ...chapters.map((chapter) => ({
        id: chapter.batch,
        title: chapter.title,
        stage: 'planned',
        deliverables: [chapter.path],
      })),
    ],
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

function completeAnalysis({ id, title }) {
  return [
    '---',
    `id: ${id}`,
    'page_type: analysis',
    `title: ${title}`,
    '---',
    `# ${title}`,
    '',
    '## 1단계 — 먼저 잡을 핵심',
    '',
    '직접 영향, 가능 조건, 병행 맥락, 후대 유추를 구분한다.',
    '',
    '## 2단계 — 작동 원리',
    '',
    '설명',
    '',
    '## 3단계 — 기술과 근거',
    '',
    '작업, 규모, 결과 계약, 시스템 경계, 고정 조건, 지표를 기록한다.',
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

test('valid planned ledger produces a concise status', () => {
  const ledger = validLedger();
  assert.deepEqual(validateHistoryLedgerStructure(ledger), []);
  const status = buildHistoryStatus(ledger);
  assert.equal(status.current_batch.id, 'framework');
  assert.equal(status.progress.chapters.planned, 9);
  assert.equal(status.progress.bridges.planned, 1);
  assert.match(renderHistoryStatus(status), /Current batch: framework/);
  assert.match(renderHistoryStatus(status), /Blockers: none/);
  assert.match(renderHistoryStatus(status), /Bridges: planned=1/);
});

test('handoff date must be a real calendar date', () => {
  const ledger = validLedger();
  ledger.initiative.handoff.updated = '2026-02-30';
  assert.ok(
    validateHistoryLedgerStructure(ledger)
      .includes('initiative.handoff.updated must be a YYYY-MM-DD string.'),
  );
});

test('schema, chapter order, capability vocabulary, current batch, and safe paths are enforced', () => {
  const ledger = validLedger();
  ledger.schema_version = 1;
  ledger.chapters[0].order = 2;
  ledger.chapters[1].capability_layers = ['speed'];
  ledger.initiative.current_batch = 'chapter-1';
  ledger.owners[0].path = '../outside.md';
  const errors = validateHistoryLedgerStructure(ledger);
  assert.ok(errors.some((error) => error.includes('schema_version must be 2')));
  assert.ok(errors.some((error) => error.includes('chapters[0].order must be 1')));
  assert.ok(errors.some((error) => error.includes("unsupported value 'speed'")));
  assert.ok(errors.some((error) => error.includes('exactly initiative.current_batch')));
  assert.ok(errors.some((error) => error.includes('safe repo-relative path')));
});

test('bridge connections must name at least two known chapter batches', () => {
  const ledger = validLedger();
  ledger.bridges[0].connects = ['chapter-1'];
  let errors = validateHistoryLedgerStructure(ledger);
  assert.ok(errors.some((error) => error.includes('must contain at least 2 chapter batch ids')));

  ledger.bridges[0].connects = ['chapter-1', 'unknown-chapter'];
  errors = validateHistoryLedgerStructure(ledger);
  assert.ok(errors.some((error) => error.includes("unknown chapter batch 'unknown-chapter'")));
});

test('bridge ids, titles, paths, and page ids are unique and paths stay inside the repository', () => {
  const ledger = validLedger();
  ledger.bridges.push({
    ...ledger.bridges[0],
    path: '../outside.md',
  });
  const errors = validateHistoryLedgerStructure(ledger);
  assert.ok(errors.some((error) => error.includes('bridges has duplicate id')));
  assert.ok(errors.some((error) => error.includes('bridges has duplicate title')));
  assert.ok(errors.some((error) => error.includes('bridges has duplicate page_id')));
  assert.ok(errors.some((error) => error.includes('safe repo-relative path')));
});

test('completed chapter must exist and contain the learning, measurement, and causality contract', async () => {
  const ledger = validLedger();
  ledger.chapters[0].stage = 'complete';
  const projectRoot = path.resolve('virtual-history-project');
  const good = completeAnalysis({
    id: ledger.chapters[0].page_id,
    title: ledger.chapters[0].title,
  });
  const files = virtualFiles(projectRoot, {
    [ledger.chapters[0].path]: good,
  });
  assert.deepEqual(await validateHistoryLedger(ledger, { projectRoot, ...files }), []);

  const brokenFiles = virtualFiles(projectRoot, {
    [ledger.chapters[0].path]: good.replace('결과 계약', '결과'),
  });
  const errors = await validateHistoryLedger(ledger, { projectRoot, ...brokenFiles });
  assert.ok(errors.some((error) => error.includes("measurement ledger label '결과 계약'")));
});

test('completed bridge must exist and contain the same analysis contract as a chapter', async () => {
  const ledger = validLedger();
  ledger.bridges[0].stage = 'complete';
  const projectRoot = path.resolve('virtual-history-bridge-project');
  const good = completeAnalysis({
    id: ledger.bridges[0].page_id,
    title: ledger.bridges[0].title,
  });
  const goodFiles = virtualFiles(projectRoot, {
    [ledger.bridges[0].path]: good,
  });
  assert.deepEqual(await validateHistoryLedger(ledger, { projectRoot, ...goodFiles }), []);

  const missingErrors = await validateHistoryLedger(ledger, {
    projectRoot,
    ...virtualFiles(projectRoot, {}),
  });
  assert.ok(missingErrors.some((error) => error.includes('bridges[0] is complete')));

  const brokenFiles = virtualFiles(projectRoot, {
    [ledger.bridges[0].path]: good
      .replace('page_type: analysis', 'page_type: concept')
      .replace('직접 영향', '영향'),
  });
  const brokenErrors = await validateHistoryLedger(ledger, { projectRoot, ...brokenFiles });
  assert.ok(brokenErrors.some((error) => error.includes("expected page_type 'analysis'")));
  assert.ok(brokenErrors.some((error) => error.includes("causal relation label '직접 영향'")));
});

test('completed batch requires every declared deliverable', async () => {
  const ledger = validLedger();
  ledger.batches[0].stage = 'complete';
  ledger.batches[1].stage = 'in_progress';
  ledger.initiative.current_batch = 'chapter-1';
  const errors = await validateHistoryLedger(ledger, {
    projectRoot: path.resolve('virtual-missing-deliverable'),
    ...virtualFiles(path.resolve('virtual-missing-deliverable'), {}),
  });
  assert.ok(errors.some((error) => error.includes("missing complete file 'docs/plan.md'")));
});

test('CLI arguments and a custom ledger path are supported', async () => {
  assert.deepEqual(parseHistoryStatusArguments(['--check']), {
    check: true,
    ledgerPath: 'docs/llm-computing-history.yml',
  });
  assert.deepEqual(parseHistoryStatusArguments(['--ledger', 'docs/custom.yml']), {
    check: false,
    ledgerPath: 'docs/custom.yml',
  });
  assert.equal(normalizeRepoRelativePath('docs\\custom.yml'), 'docs/custom.yml');
  assert.equal(normalizeRepoRelativePath('C:\\outside.yml'), null);
  assert.throws(() => parseHistoryStatusArguments(['--unknown']), /Unknown argument/);

  const ledger = validLedger();
  const projectRoot = path.resolve('virtual-cli-project');
  const files = virtualFiles(projectRoot, {
    'docs/custom.yml': yaml.dump(ledger),
  });
  const result = await runHistoryStatus(['--ledger', 'docs/custom.yml'], {
    projectRoot,
    ...files,
  });
  assert.match(result.output, /Initiative: LLM과 컴퓨팅 능력의 공진화/);
});
