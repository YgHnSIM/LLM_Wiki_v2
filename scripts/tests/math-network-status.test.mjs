import assert from 'node:assert/strict';
import path from 'node:path';
import test from 'node:test';
import yaml from 'js-yaml';
import {
  buildMathNetworkStatus,
  normalizeRepoRelativePath,
  parseFoundationalLearningAuditScope,
  parseMathNetworkStatusArguments,
  renderMathNetworkStatus,
  runMathNetworkStatus,
  validateMathNetworkLedger,
  validateMathNetworkLedgerStructure,
} from '../math-network-status.mjs';

function validLedger() {
  return {
    schema_version: 1,
    initiative: {
      id: 'initiative.llm-math-network',
      title: 'LLM을 만든 수학',
      hub: {
        path: 'wiki/analyses/LLM을 만든 수학.md',
        id: 'analysis.llm-math-network',
        batch: 'batch.linear-algebra',
        stage: 'in_progress',
      },
      current_batch: 'batch.linear-algebra',
      next_action:
        'npm run math:check 후 wiki/concepts/벡터·행렬·텐서와 shape.md에서 '
        + 'family.vector-shape의 수식 소유권을 감사한다.',
      blockers: [],
    },
    baseline: {
      recorded_on: '2026-07-23',
      source: 'docs/foundational-learning-audit.md',
      wiki_documents: 2,
      non_meta_documents: 2,
      formula_documents: 1,
      formula_blocks: 1,
    },
    batches: [
      {
        id: 'batch.linear-algebra',
        title: '선형대수 기반',
        stage: 'in_progress',
        families: ['family.vector-shape', 'family.inner-product'],
        deliverables: [
          'wiki/concepts/벡터·행렬·텐서와 shape.md',
          'wiki/concepts/내적과 행렬곱.md',
        ],
      },
    ],
    families: [
      {
        id: 'family.vector-shape',
        title: '벡터·행렬·텐서와 shape',
        domain: 'linear-algebra',
        coverage: 'established',
        owner: {
          path: 'wiki/concepts/벡터·행렬·텐서와 shape.md',
          id: 'concept.vector-shape',
        },
        prerequisites: [],
        downstream: ['wiki/concepts/단어 임베딩.md'],
        notes: '모든 후속 수식의 자료형과 shape를 소유한다.',
      },
      {
        id: 'family.inner-product',
        title: '내적과 행렬곱',
        domain: 'linear-algebra',
        coverage: 'planned',
        owner: {
          path: 'wiki/concepts/내적과 행렬곱.md',
          id: 'concept.inner-product',
        },
        prerequisites: ['family.vector-shape'],
        downstream: ['wiki/concepts/어텐션 메커니즘.md'],
        notes: '계획 상태이므로 owner 파일은 아직 없어도 된다.',
      },
    ],
  };
}

function baselineAuditDocument({
  wikiDocuments = 2,
  nonMetaDocuments = 2,
  formulaDocuments = 1,
  formulaBlocks = 1,
} = {}) {
  return [
    '# 비전공자 기초 학습 감사',
    '',
    '## 1. 감사 범위',
    '',
    `- 전체 Markdown 문서: ${wikiDocuments}개`,
    `- 비메타 문서: ${nonMetaDocuments}개`,
    '- `학습 안내`에서 난이도와 선수 지식 문장을 모두 찾은 문서: 2개',
    `- 블록 수식이 있는 문서: ${formulaDocuments}개`,
    `- 블록 수식 총수: ${formulaBlocks}개`,
    '',
    '## 2. 새 학습 구조의 기준선',
    '',
    '- 전체 Markdown 문서: 이 절의 유사 문구는 파싱하지 않는다.',
  ].join('\n');
}

function virtualFiles(projectRoot, documents, { includeBaseline = true } = {}) {
  const normalizedDocuments = new Map();
  if (includeBaseline) {
    normalizedDocuments.set(
      'docs/foundational-learning-audit.md',
      baselineAuditDocument(),
    );
  }
  for (const [relativePath, content] of Object.entries(documents)) {
    normalizedDocuments.set(relativePath, content);
  }
  const relativePath = (absolutePath) => path
    .relative(projectRoot, absolutePath)
    .replaceAll('\\', '/');
  return {
    fileExists: async (absolutePath) => normalizedDocuments.has(relativePath(absolutePath)),
    readFile: async (absolutePath) => {
      const key = relativePath(absolutePath);
      if (!normalizedDocuments.has(key)) {
        const error = new Error(`ENOENT: ${key}`);
        error.code = 'ENOENT';
        throw error;
      }
      return normalizedDocuments.get(key);
    },
  };
}

test('a valid ledger produces a concise reusable status snapshot', async () => {
  const ledger = validLedger();
  const projectRoot = path.resolve('virtual-math-network-project');
  const files = virtualFiles(projectRoot, {
    'wiki/concepts/벡터·행렬·텐서와 shape.md': [
      '---',
      'id: concept.vector-shape',
      'page_type: concept',
      'title: 벡터·행렬·텐서와 shape',
      '---',
      '',
      '# 벡터·행렬·텐서와 shape',
    ].join('\n'),
  });

  assert.deepEqual(await validateMathNetworkLedger(ledger, { projectRoot, ...files }), []);

  const status = buildMathNetworkStatus(ledger);
  assert.equal(status.current_batch.id, 'batch.linear-algebra');
  assert.equal(status.progress.batches.in_progress, 1);
  assert.equal(status.progress.families.established, 1);
  assert.equal(status.progress.families.planned, 1);

  const rendered = renderMathNetworkStatus(status);
  assert.match(rendered, /Current batch: batch\.linear-algebra/);
  assert.match(rendered, /Next action: npm run math:check/);
  assert.match(rendered, /Blockers: none/);
});

test('an optional handoff is validated and summarized for cross-session recovery', async () => {
  const ledger = validLedger();
  ledger.initiative.handoff = {
    updated: '2026-07-23',
    baseline_commit: '68d68d8edfc9544b0d5441c697b634708345bb15',
    last_completed_gate: 'framework-materialized',
    validation: [
      {
        command: 'npm run math:check',
        result: '원장 검증 통과',
      },
      {
        command: 'node --test scripts/tests/math-network-status.test.mjs',
        result: '상태 CLI 회귀 테스트 통과',
      },
    ],
    notes: '공개 문서 배치는 아직 시작하지 않았다.',
  };
  const projectRoot = path.resolve('virtual-handoff-project');
  const files = virtualFiles(projectRoot, {
    'wiki/concepts/벡터·행렬·텐서와 shape.md': [
      '---',
      'id: concept.vector-shape',
      'page_type: concept',
      '---',
      '',
      '# 벡터·행렬·텐서와 shape',
    ].join('\n'),
  });

  assert.deepEqual(await validateMathNetworkLedger(ledger, { projectRoot, ...files }), []);

  const status = buildMathNetworkStatus(ledger);
  assert.equal(status.handoff.baseline_commit, ledger.initiative.handoff.baseline_commit);
  assert.equal(status.handoff.validation.length, 2);
  assert.match(status.handoff.validation_summary, /2 recorded — npm run math:check: 원장 검증 통과/);

  const rendered = renderMathNetworkStatus(status);
  assert.match(rendered, /Handoff: 2026-07-23 · baseline 68d68d8e/);
  assert.match(rendered, /last gate framework-materialized/);
  assert.match(rendered, /Validation: 2 recorded/);
  assert.match(rendered, /Handoff notes: 공개 문서 배치는 아직 시작하지 않았다/);
});

test('an incomplete handoff reports its field-level validation errors', () => {
  const ledger = validLedger();
  ledger.initiative.handoff = {
    updated: '',
    baseline_commit: '',
    last_completed_gate: 7,
    validation: [
      { command: '', result: '' },
      'not-an-object',
    ],
    notes: '',
  };

  const errors = validateMathNetworkLedgerStructure(ledger);
  assert.ok(errors.includes('initiative.handoff.updated must be a valid YYYY-MM-DD string.'));
  assert.ok(errors.includes(
    'initiative.handoff.baseline_commit must be a 40-character hexadecimal commit.',
  ));
  assert.ok(errors.includes(
    'initiative.handoff.last_completed_gate must be null or a nonempty string.',
  ));
  assert.ok(errors.includes('initiative.handoff.validation[0].command must be a nonempty string.'));
  assert.ok(errors.includes('initiative.handoff.validation[0].result must be a nonempty string.'));
  assert.ok(errors.includes('initiative.handoff.validation[1] must be an object.'));
  assert.ok(errors.includes('initiative.handoff.notes must be a nonempty string.'));
});

test('check and JSON modes read the default ledger through injected file callbacks', async () => {
  const ledger = validLedger();
  const projectRoot = path.resolve('virtual-cli-project');
  const files = virtualFiles(projectRoot, {
    'docs/llm-math-network.yml': yaml.safeDump(ledger),
    'wiki/concepts/벡터·행렬·텐서와 shape.md': [
      '---',
      'id: concept.vector-shape',
      'page_type: concept',
      '---',
      '',
      '# 벡터·행렬·텐서와 shape',
    ].join('\n'),
  });

  assert.equal(parseMathNetworkStatusArguments([]), 'human');
  assert.equal(parseMathNetworkStatusArguments(['--check']), 'check');
  assert.equal(parseMathNetworkStatusArguments(['--json']), 'json');
  assert.throws(() => parseMathNetworkStatusArguments(['--check', '--json']), /usage:/);

  const checked = await runMathNetworkStatus({ mode: 'check', projectRoot, ...files });
  assert.match(checked.output, /docs\/llm-math-network\.yml: valid \(1 batches, 2 families\)/);

  const json = await runMathNetworkStatus({ mode: 'json', projectRoot, ...files });
  assert.equal(JSON.parse(json.output).current_batch.id, 'batch.linear-algebra');
});

test('baseline, hub linkage, and next action use the resumable ledger contract', () => {
  const ledger = validLedger();
  ledger.baseline.recorded_on = '2026-02-30';
  ledger.baseline.source = 'C:\\outside\\audit.md';
  ledger.baseline.wiki_documents = -1;
  ledger.baseline.formula_blocks = 1.5;
  ledger.initiative.hub.batch = 'batch.unknown';
  ledger.initiative.next_action = '다음 작업을 계속한다.';

  const errors = validateMathNetworkLedgerStructure(ledger);
  assert.ok(errors.includes('baseline.recorded_on must be a valid YYYY-MM-DD string.'));
  assert.ok(errors.includes('baseline.source must be a safe repo-relative path.'));
  assert.ok(errors.includes('baseline.wiki_documents must be a nonnegative integer.'));
  assert.ok(errors.includes('baseline.formula_blocks must be a nonnegative integer.'));
  assert.ok(errors.includes("initiative.hub.batch references unknown batch 'batch.unknown'."));
  assert.ok(errors.some((error) => error.includes("first command beginning with 'npm run'")));
  assert.ok(errors.includes("initiative.next_action must include a 'wiki/' repo path."));
  assert.ok(errors.includes('initiative.next_action must include at least one known family id.'));

  const mismatchedHub = validLedger();
  mismatchedHub.initiative.hub.stage = 'planned';
  assert.ok(validateMathNetworkLedgerStructure(mismatchedHub).includes(
    "initiative.hub.stage 'planned' must match linked batch "
    + "'batch.linear-algebra' stage 'in_progress'.",
  ));
});

test('baseline values are parsed from the exact first audit-scope labels', async () => {
  assert.deepEqual(parseFoundationalLearningAuditScope(baselineAuditDocument()), {
    wiki_documents: 2,
    non_meta_documents: 2,
    formula_documents: 1,
    formula_blocks: 1,
  });

  const projectRoot = path.resolve('virtual-baseline-audit-project');
  const ownerDocument = [
    '---',
    'id: concept.vector-shape',
    'page_type: concept',
    '---',
    '',
    '# 벡터·행렬·텐서와 shape',
  ].join('\n');
  const documents = {
    'wiki/concepts/벡터·행렬·텐서와 shape.md': ownerDocument,
  };

  const mismatch = validLedger();
  mismatch.baseline.formula_blocks = 2;
  const mismatchErrors = await validateMathNetworkLedger(mismatch, {
    projectRoot,
    ...virtualFiles(projectRoot, documents),
  });
  assert.ok(mismatchErrors.includes(
    "baseline.formula_blocks is 2, but baseline.source "
    + "'docs/foundational-learning-audit.md' reports 1 for '블록 수식 총수'.",
  ));

  const malformedErrors = await validateMathNetworkLedger(validLedger(), {
    projectRoot,
    ...virtualFiles(projectRoot, {
      ...documents,
      'docs/foundational-learning-audit.md': baselineAuditDocument()
        .replace('- 블록 수식 총수: 1개', '- 블록 수식 총합: 1개'),
    }),
  });
  assert.ok(malformedErrors.some((error) => (
    error.includes("baseline.source 'docs/foundational-learning-audit.md'")
    && error.includes("'- 블록 수식 총수: N개'")
    && error.includes('found 0')
  )));

  const missingErrors = await validateMathNetworkLedger(validLedger(), {
    projectRoot,
    ...virtualFiles(projectRoot, documents, { includeBaseline: false }),
  });
  assert.ok(missingErrors.includes(
    "baseline.source 'docs/foundational-learning-audit.md' must exist.",
  ));
});

test('owner assignments stay unique and point only to concept pages', () => {
  const invalidOwner = validLedger();
  invalidOwner.families[1].owner.path = 'wiki/concepts/nested/내적.md';
  invalidOwner.families[1].owner.id = 'analysis.inner-product';
  const invalidErrors = validateMathNetworkLedgerStructure(invalidOwner);
  assert.ok(invalidErrors.includes(
    "families[1].owner.path must match 'wiki/concepts/*.md'.",
  ));
  assert.ok(invalidErrors.includes(
    "families[1].owner.id must match 'concept.*'.",
  ));

  const duplicateOwner = validLedger();
  duplicateOwner.families[1].owner = { ...duplicateOwner.families[0].owner };
  const duplicateErrors = validateMathNetworkLedgerStructure(duplicateOwner);
  assert.ok(duplicateErrors.some((error) => error.includes(
    "owner.path 'wiki/concepts/벡터·행렬·텐서와 shape.md' is assigned to multiple families",
  )));
  assert.ok(duplicateErrors.some((error) => error.includes(
    "owner.id 'concept.vector-shape' is assigned to multiple families",
  )));
});

test('an established prerequisite may be assigned only to a later batch', () => {
  const ledger = validLedger();
  ledger.batches[0].families = ['family.inner-product'];
  ledger.batches.push({
    id: 'batch.later-foundation',
    title: '이미 사용 가능한 기준 문서의 후속 감사',
    stage: 'planned',
    families: ['family.vector-shape'],
    deliverables: ['wiki/concepts/벡터·행렬·텐서와 shape.md'],
  });

  assert.deepEqual(validateMathNetworkLedgerStructure(ledger), []);
});

test('planned prerequisites follow roadmap order without prematurely blocking future batches', () => {
  const futureLedger = validLedger();
  futureLedger.families[0].coverage = 'planned';
  futureLedger.batches[0].families = ['family.vector-shape'];
  futureLedger.batches.push({
    id: 'batch.future-consumer',
    title: '미래 소비 배치',
    stage: 'planned',
    families: ['family.inner-product'],
    deliverables: ['wiki/concepts/내적과 행렬곱.md'],
  });
  assert.deepEqual(validateMathNetworkLedgerStructure(futureLedger), []);

  futureLedger.batches[0].stage = 'planned';
  futureLedger.initiative.hub.stage = 'planned';
  futureLedger.initiative.current_batch = 'batch.future-consumer';
  const currentErrors = validateMathNetworkLedgerStructure(futureLedger);
  assert.ok(currentErrors.some((error) => (
    error.includes("initiative.current_batch 'batch.future-consumer' is not dependency-ready")
    && error.includes("requires 'family.vector-shape' with coverage 'planned'")
  )));

  const laterLedger = validLedger();
  laterLedger.families[0].coverage = 'planned';
  laterLedger.batches[0].families = ['family.inner-product'];
  laterLedger.batches.push({
    id: 'batch.too-late',
    title: '늦은 선수 배치',
    stage: 'planned',
    families: ['family.vector-shape'],
    deliverables: ['wiki/concepts/벡터·행렬·텐서와 shape.md'],
  });
  const laterErrors = validateMathNetworkLedgerStructure(laterLedger);
  assert.ok(laterErrors.some((error) => (
    error.includes("family 'family.inner-product' prerequisite 'family.vector-shape'")
    && error.includes("earlier non-deferred batch than 'batch.linear-algebra'")
  )));
});

test('family membership, complete batches, and in-progress state are consistent', () => {
  const unassigned = validLedger();
  unassigned.batches[0].families = ['family.vector-shape'];
  assert.ok(validateMathNetworkLedgerStructure(unassigned).includes(
    "family 'family.inner-product' must belong to at least one batch.",
  ));

  const complete = validLedger();
  complete.batches[0].stage = 'complete';
  complete.initiative.hub.stage = 'complete';
  const completeErrors = validateMathNetworkLedgerStructure(complete);
  assert.ok(completeErrors.some((error) => (
    error.includes("'family.vector-shape' must have coverage 'ready' or 'deferred'")
  )));
  assert.ok(completeErrors.some((error) => (
    error.includes("initiative.current_batch 'batch.linear-algebra' cannot have stage 'complete'")
  )));

  const multiple = validLedger();
  multiple.batches.push({
    id: 'batch.second-active',
    title: '두 번째 활성 배치',
    stage: 'in_progress',
    families: [],
    deliverables: [],
  });
  assert.ok(validateMathNetworkLedgerStructure(multiple).some((error) => (
    error.includes('at most one batch may be in_progress')
  )));

  const mismatched = validLedger();
  mismatched.batches.push({
    id: 'batch.next',
    title: '다음 배치',
    stage: 'planned',
    families: [],
    deliverables: [],
  });
  mismatched.initiative.current_batch = 'batch.next';
  assert.ok(validateMathNetworkLedgerStructure(mismatched).some((error) => (
    error.includes("in_progress batch 'batch.linear-algebra' must equal initiative.current_batch 'batch.next'")
  )));
});

test('a null current batch represents an explicit pause or a finished milestone', () => {
  const paused = validLedger();
  paused.initiative.current_batch = null;
  paused.batches[0].stage = 'planned';
  paused.initiative.hub.stage = 'planned';
  paused.initiative.blockers = ['owner 범위를 확정할 사용자 결정을 기다린다.'];
  assert.deepEqual(validateMathNetworkLedgerStructure(paused), []);

  const pausedStatus = buildMathNetworkStatus(paused);
  assert.equal(pausedStatus.current_batch, null);
  assert.equal(JSON.parse(JSON.stringify(pausedStatus)).current_batch, null);
  assert.match(renderMathNetworkStatus(pausedStatus), /Current batch: none/);

  const unmarkedPause = structuredClone(paused);
  unmarkedPause.initiative.blockers = [];
  assert.ok(validateMathNetworkLedgerStructure(unmarkedPause).includes(
    'initiative.current_batch may be null while planned batches remain only when '
    + 'initiative.blockers contains an explicit pause or blocker.',
  ));

  const activeWithoutCurrent = validLedger();
  activeWithoutCurrent.initiative.current_batch = null;
  activeWithoutCurrent.initiative.blockers = ['잘못 남은 활성 배치'];
  assert.ok(validateMathNetworkLedgerStructure(activeWithoutCurrent).some((error) => (
    error.includes('initiative.current_batch is null')
    && error.includes("in_progress batch remains: 'batch.linear-algebra'")
  )));

  const finished = validLedger();
  finished.initiative.current_batch = null;
  finished.initiative.blockers = [];
  finished.batches[0].stage = 'complete';
  finished.initiative.hub.stage = 'complete';
  finished.families[0].coverage = 'ready';
  finished.families[1].coverage = 'deferred';
  assert.deepEqual(validateMathNetworkLedgerStructure(finished), []);
});

test('duplicate IDs, unknown references, and unsafe paths are reported together', () => {
  const ledger = validLedger();
  ledger.batches.push({
    id: 'batch.linear-algebra',
    title: '중복 배치',
    stage: 'planned',
    families: ['family.unknown'],
    deliverables: ['../outside.md'],
  });
  ledger.families[1].id = 'family.vector-shape';
  ledger.families[1].prerequisites = ['family.missing'];
  ledger.families[1].downstream = ['C:\\outside\\page.md'];
  ledger.initiative.current_batch = 'batch.unknown';

  const errors = validateMathNetworkLedgerStructure(ledger);
  assert.ok(errors.some((error) => error.includes("duplicate id 'batch.linear-algebra'")));
  assert.ok(errors.some((error) => error.includes("duplicate id 'family.vector-shape'")));
  assert.ok(errors.some((error) => error.includes("unknown batch 'batch.unknown'")));
  assert.ok(errors.some((error) => error.includes("unknown family 'family.unknown'")));
  assert.ok(errors.some((error) => error.includes("unknown family 'family.missing'")));
  assert.ok(errors.some((error) => error.includes('safe repo-relative path')));
  assert.equal(normalizeRepoRelativePath('wiki\\concepts\\확률.md'), 'wiki/concepts/확률.md');
  assert.equal(normalizeRepoRelativePath('..\\outside.md'), null);
});

test('indirect prerequisite cycles report the complete family ID path', () => {
  const ledger = validLedger();
  ledger.families[0].prerequisites = ['family.loss'];
  ledger.batches[0].families.push('family.loss');
  ledger.families.push({
    id: 'family.loss',
    title: '손실 함수',
    domain: 'optimization',
    coverage: 'planned',
    owner: {
      path: 'wiki/concepts/손실 함수.md',
      id: 'concept.loss',
    },
    prerequisites: ['family.inner-product'],
    downstream: [],
    notes: '간접 순환 검증용 family다.',
  });

  const errors = validateMathNetworkLedgerStructure(ledger);
  assert.ok(errors.includes(
    'family prerequisite cycle: '
    + 'family.vector-shape -> family.loss -> family.inner-product -> family.vector-shape.',
  ));
});

test('required owner files must exist and their frontmatter IDs must match', async () => {
  const ledger = validLedger();
  const projectRoot = path.resolve('virtual-owner-validation-project');

  const missingErrors = await validateMathNetworkLedger(ledger, {
    projectRoot,
    ...virtualFiles(projectRoot, {}),
  });
  assert.ok(missingErrors.some((error) => (
    error.includes('must exist') && error.includes("coverage 'established'")
  )));
  assert.ok(!missingErrors.some((error) => error.includes('내적과 행렬곱.md')));

  const mismatchErrors = await validateMathNetworkLedger(ledger, {
    projectRoot,
    ...virtualFiles(projectRoot, {
      'wiki/concepts/벡터·행렬·텐서와 shape.md': [
        '---',
        'id: concept.wrong-id',
        'page_type: concept',
        '---',
        '',
        '# 잘못된 문서',
      ].join('\n'),
    }),
  });
  assert.ok(mismatchErrors.some((error) => (
    error.includes("frontmatter id 'concept.wrong-id'")
    && error.includes("expected 'concept.vector-shape'")
  )));

  const wrongTypeErrors = await validateMathNetworkLedger(ledger, {
    projectRoot,
    ...virtualFiles(projectRoot, {
      'wiki/concepts/벡터·행렬·텐서와 shape.md': [
        '---',
        'id: concept.vector-shape',
        'page_type: analysis',
        '---',
        '',
        '# 잘못된 유형',
      ].join('\n'),
    }),
  });
  assert.ok(wrongTypeErrors.some((error) => (
    error.includes("frontmatter page_type 'analysis'")
    && error.includes("expected 'concept'")
  )));
});

test('a complete hub and batch deliverable must exist with analysis frontmatter', async () => {
  const ledger = validLedger();
  ledger.batches.push({
    id: 'batch.hub-publication',
    title: '허브 공개',
    stage: 'complete',
    families: [],
    deliverables: ['wiki/analyses/LLM을 만든 수학.md'],
  });
  ledger.initiative.hub.batch = 'batch.hub-publication';
  ledger.initiative.hub.stage = 'complete';
  const projectRoot = path.resolve('virtual-complete-hub-project');
  const ownerDocument = [
    '---',
    'id: concept.vector-shape',
    'page_type: concept',
    '---',
    '',
    '# 벡터·행렬·텐서와 shape',
  ].join('\n');

  const validErrors = await validateMathNetworkLedger(ledger, {
    projectRoot,
    ...virtualFiles(projectRoot, {
      'wiki/concepts/벡터·행렬·텐서와 shape.md': ownerDocument,
      'wiki/analyses/LLM을 만든 수학.md': [
        '---',
        'id: analysis.llm-math-network',
        'page_type: analysis',
        '---',
        '',
        '# LLM을 만든 수학',
      ].join('\n'),
    }),
  });
  assert.deepEqual(validErrors, []);

  const missingErrors = await validateMathNetworkLedger(ledger, {
    projectRoot,
    ...virtualFiles(projectRoot, {
      'wiki/concepts/벡터·행렬·텐서와 shape.md': ownerDocument,
    }),
  });
  assert.ok(missingErrors.some((error) => error.includes(
    "initiative.hub.path 'wiki/analyses/LLM을 만든 수학.md' must exist",
  )));
  assert.ok(missingErrors.some((error) => (
    error.includes("deliverables[0] 'wiki/analyses/LLM을 만든 수학.md'")
    && error.includes('must exist')
  )));

  const wrongFrontmatterErrors = await validateMathNetworkLedger(ledger, {
    projectRoot,
    ...virtualFiles(projectRoot, {
      'wiki/concepts/벡터·행렬·텐서와 shape.md': ownerDocument,
      'wiki/analyses/LLM을 만든 수학.md': [
        '---',
        'id: analysis.wrong',
        'page_type: concept',
        '---',
        '',
        '# 잘못된 허브',
      ].join('\n'),
    }),
  });
  assert.ok(wrongFrontmatterErrors.some((error) => (
    error.includes("frontmatter id 'analysis.wrong'")
    && error.includes("expected 'analysis.llm-math-network'")
  )));
  assert.ok(wrongFrontmatterErrors.some((error) => (
    error.includes("frontmatter page_type 'concept'")
    && error.includes("expected 'analysis'")
  )));
});

test('ready family downstream files must exist', async () => {
  const ledger = validLedger();
  ledger.families[0].coverage = 'ready';
  const projectRoot = path.resolve('virtual-ready-downstream-project');
  const ownerDocument = [
    '---',
    'id: concept.vector-shape',
    'page_type: concept',
    '---',
    '',
    '# 벡터·행렬·텐서와 shape',
  ].join('\n');

  const missingErrors = await validateMathNetworkLedger(ledger, {
    projectRoot,
    ...virtualFiles(projectRoot, {
      'wiki/concepts/벡터·행렬·텐서와 shape.md': ownerDocument,
    }),
  });
  assert.ok(missingErrors.some((error) => (
    error.includes("downstream[0] 'wiki/concepts/단어 임베딩.md'")
    && error.includes("family 'family.vector-shape' is ready")
  )));

  const validErrors = await validateMathNetworkLedger(ledger, {
    projectRoot,
    ...virtualFiles(projectRoot, {
      'wiki/concepts/벡터·행렬·텐서와 shape.md': ownerDocument,
      'wiki/concepts/단어 임베딩.md': '# 단어 임베딩\n',
    }),
  });
  assert.deepEqual(validErrors, []);
});
