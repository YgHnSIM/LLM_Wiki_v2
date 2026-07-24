import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';
import yaml from 'js-yaml';
import { rootDir } from './lib/project-paths.mjs';

export const DEFAULT_LEDGER_PATH = 'docs/llm-computing-history.yml';
export const STAGES = Object.freeze(['planned', 'in_progress', 'complete', 'deferred']);
export const CAPABILITY_LAYERS = Object.freeze([
  'computability',
  'complexity',
  'programmability',
  'realized-performance',
  'scalability',
  'resource-efficiency',
  'reliable-results',
]);
export const CAUSAL_RELATIONS = Object.freeze([
  'direct-influence',
  'enabling-condition',
  'parallel-context',
  'retrospective-analogy',
]);

const stageSet = new Set(STAGES);
const capabilityLayerSet = new Set(CAPABILITY_LAYERS);
const requiredAnalysisHeadings = Object.freeze([
  '## 1단계 — 먼저 잡을 핵심',
  '## 2단계 — 작동 원리',
  '## 3단계 — 기술과 근거',
  '## 검증과 한계',
  '## 학습 확인',
  '## 출처',
  '## 관련 항목',
]);
const measurementLedgerLabels = Object.freeze([
  '작업',
  '규모',
  '결과 계약',
  '시스템 경계',
  '고정 조건',
  '지표',
]);
const causalRelationLabels = Object.freeze([
  '직접 영향',
  '가능 조건',
  '병행 맥락',
  '후대 유추',
]);

function isRecord(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function nonemptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function duplicateValues(values) {
  const seen = new Set();
  const duplicates = new Set();
  for (const value of values) {
    if (seen.has(value)) duplicates.add(value);
    seen.add(value);
  }
  return [...duplicates];
}

export function normalizeRepoRelativePath(value) {
  if (!nonemptyString(value)) return null;
  const source = value.trim().replaceAll('\\', '/');
  if (
    source.includes('\0')
    || source.startsWith('/')
    || source.startsWith('//')
    || /^[A-Za-z][A-Za-z0-9+.-]*:/.test(source)
  ) {
    return null;
  }
  const segments = source.split('/');
  if (segments.some((segment) => segment === '..')) return null;
  const normalized = path.posix.normalize(source);
  if (normalized === '.' || normalized === '..' || normalized.startsWith('../')) return null;
  return normalized;
}

function validateStringArray(value, label, errors, { allowed = null } = {}) {
  if (!Array.isArray(value)) {
    errors.push(`${label} must be an array.`);
    return [];
  }
  const strings = [];
  value.forEach((entry, index) => {
    if (!nonemptyString(entry)) {
      errors.push(`${label}[${index}] must be a nonempty string.`);
      return;
    }
    const item = entry.trim();
    strings.push(item);
    if (allowed && !allowed.has(item)) {
      errors.push(`${label}[${index}] has unsupported value '${item}'.`);
    }
  });
  for (const duplicate of duplicateValues(strings)) {
    errors.push(`${label} repeats '${duplicate}'.`);
  }
  return strings;
}

function validatePath(value, label, errors) {
  const normalized = normalizeRepoRelativePath(value);
  if (normalized === null) errors.push(`${label} must be a safe repo-relative path.`);
  return normalized;
}

function validateStage(value, label, errors) {
  if (!nonemptyString(value) || !stageSet.has(value)) {
    errors.push(`${label} must be one of: ${STAGES.join(', ')}.`);
    return false;
  }
  return true;
}

function validatePublicRecord(record, label, errors) {
  if (!isRecord(record)) {
    errors.push(`${label} must be an object.`);
    return;
  }
  validatePath(record.path, `${label}.path`, errors);
  if (!nonemptyString(record.id)) errors.push(`${label}.id must be a nonempty string.`);
  validateStage(record.stage, `${label}.stage`, errors);
}

export function validateHistoryLedgerStructure(ledger) {
  const errors = [];
  if (!isRecord(ledger)) return ['ledger must be an object.'];
  if (ledger.schema_version !== 2) errors.push('schema_version must be 2.');

  const initiative = ledger.initiative;
  if (!isRecord(initiative)) {
    errors.push('initiative must be an object.');
  } else {
    if (!nonemptyString(initiative.id)) errors.push('initiative.id must be a nonempty string.');
    if (!nonemptyString(initiative.title)) errors.push('initiative.title must be a nonempty string.');
    if (initiative.current_batch !== null && !nonemptyString(initiative.current_batch)) {
      errors.push('initiative.current_batch must be null or a nonempty string.');
    }
    if (!nonemptyString(initiative.next_action)) {
      errors.push('initiative.next_action must be a nonempty string.');
    }
    validateStringArray(initiative.blockers, 'initiative.blockers', errors);
    validatePublicRecord(initiative.hub, 'initiative.hub', errors);
    validatePublicRecord(initiative.synthesis, 'initiative.synthesis', errors);

    if (!isRecord(initiative.handoff)) {
      errors.push('initiative.handoff must be an object.');
    } else {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(initiative.handoff.updated ?? '')) {
        errors.push('initiative.handoff.updated must be a YYYY-MM-DD string.');
      }
      if (!/^[0-9a-f]{40}$/i.test(initiative.handoff.baseline_commit ?? '')) {
        errors.push('initiative.handoff.baseline_commit must be a 40-character hexadecimal commit.');
      }
      if (
        initiative.handoff.last_completed_gate !== null
        && !nonemptyString(initiative.handoff.last_completed_gate)
      ) {
        errors.push('initiative.handoff.last_completed_gate must be null or a nonempty string.');
      }
      if (!Array.isArray(initiative.handoff.validation)) {
        errors.push('initiative.handoff.validation must be an array.');
      }
      if (!nonemptyString(initiative.handoff.notes)) {
        errors.push('initiative.handoff.notes must be a nonempty string.');
      }
    }
  }

  const layers = validateStringArray(
    ledger.capability_layers,
    'capability_layers',
    errors,
    { allowed: capabilityLayerSet },
  );
  for (const required of CAPABILITY_LAYERS) {
    if (!layers.includes(required)) errors.push(`capability_layers is missing '${required}'.`);
  }

  const relations = validateStringArray(
    ledger.causal_relations,
    'causal_relations',
    errors,
    { allowed: new Set(CAUSAL_RELATIONS) },
  );
  for (const required of CAUSAL_RELATIONS) {
    if (!relations.includes(required)) errors.push(`causal_relations is missing '${required}'.`);
  }

  const owners = Array.isArray(ledger.owners) ? ledger.owners : [];
  if (!Array.isArray(ledger.owners)) errors.push('owners must be an array.');
  owners.forEach((owner, index) => {
    const label = `owners[${index}]`;
    if (!isRecord(owner)) {
      errors.push(`${label} must be an object.`);
      return;
    }
    for (const field of ['id', 'title', 'page_id']) {
      if (!nonemptyString(owner[field])) errors.push(`${label}.${field} must be a nonempty string.`);
    }
    validatePath(owner.path, `${label}.path`, errors);
    validateStage(owner.stage, `${label}.stage`, errors);
    validateStringArray(owner.required_by, `${label}.required_by`, errors);
  });
  for (const duplicate of duplicateValues(owners.map((owner) => owner?.id).filter(nonemptyString))) {
    errors.push(`owners has duplicate id '${duplicate}'.`);
  }

  const chapters = Array.isArray(ledger.chapters) ? ledger.chapters : [];
  if (!Array.isArray(ledger.chapters)) errors.push('chapters must be an array.');
  if (chapters.length !== 9) errors.push(`chapters must contain exactly 9 entries; found ${chapters.length}.`);
  chapters.forEach((chapter, index) => {
    const label = `chapters[${index}]`;
    if (!isRecord(chapter)) {
      errors.push(`${label} must be an object.`);
      return;
    }
    if (chapter.order !== index + 1) {
      errors.push(`${label}.order must be ${index + 1}.`);
    }
    for (const field of ['batch', 'title', 'page_id']) {
      if (!nonemptyString(chapter[field])) errors.push(`${label}.${field} must be a nonempty string.`);
    }
    validatePath(chapter.path, `${label}.path`, errors);
    validateStage(chapter.stage, `${label}.stage`, errors);
    validateStringArray(
      chapter.capability_layers,
      `${label}.capability_layers`,
      errors,
      { allowed: capabilityLayerSet },
    );
  });
  for (const field of ['batch', 'title', 'path', 'page_id']) {
    for (const duplicate of duplicateValues(chapters.map((chapter) => chapter?.[field]).filter(nonemptyString))) {
      errors.push(`chapters has duplicate ${field} '${duplicate}'.`);
    }
  }

  const chapterBatchSet = new Set(chapters.map((chapter) => chapter?.batch).filter(nonemptyString));
  const bridges = Array.isArray(ledger.bridges) ? ledger.bridges : [];
  if (!Array.isArray(ledger.bridges)) errors.push('bridges must be an array.');
  bridges.forEach((bridge, index) => {
    const label = `bridges[${index}]`;
    if (!isRecord(bridge)) {
      errors.push(`${label} must be an object.`);
      return;
    }
    for (const field of ['id', 'title', 'page_id']) {
      if (!nonemptyString(bridge[field])) errors.push(`${label}.${field} must be a nonempty string.`);
    }
    validatePath(bridge.path, `${label}.path`, errors);
    validateStage(bridge.stage, `${label}.stage`, errors);
    const connects = validateStringArray(bridge.connects, `${label}.connects`, errors);
    if (connects.length < 2) errors.push(`${label}.connects must contain at least 2 chapter batch ids.`);
    connects.forEach((chapterBatch) => {
      if (!chapterBatchSet.has(chapterBatch)) {
        errors.push(`${label}.connects references unknown chapter batch '${chapterBatch}'.`);
      }
    });
    validateStringArray(
      bridge.capability_layers,
      `${label}.capability_layers`,
      errors,
      { allowed: capabilityLayerSet },
    );
  });
  for (const field of ['id', 'title', 'path', 'page_id']) {
    for (const duplicate of duplicateValues(bridges.map((bridge) => bridge?.[field]).filter(nonemptyString))) {
      errors.push(`bridges has duplicate ${field} '${duplicate}'.`);
    }
  }

  const batches = Array.isArray(ledger.batches) ? ledger.batches : [];
  if (!Array.isArray(ledger.batches)) errors.push('batches must be an array.');
  batches.forEach((batch, index) => {
    const label = `batches[${index}]`;
    if (!isRecord(batch)) {
      errors.push(`${label} must be an object.`);
      return;
    }
    for (const field of ['id', 'title']) {
      if (!nonemptyString(batch[field])) errors.push(`${label}.${field} must be a nonempty string.`);
    }
    validateStage(batch.stage, `${label}.stage`, errors);
    const deliverables = validateStringArray(batch.deliverables, `${label}.deliverables`, errors);
    deliverables.forEach((deliverable, deliverableIndex) => {
      validatePath(deliverable, `${label}.deliverables[${deliverableIndex}]`, errors);
    });
  });
  const batchIds = batches.map((batch) => batch?.id).filter(nonemptyString);
  for (const duplicate of duplicateValues(batchIds)) errors.push(`batches has duplicate id '${duplicate}'.`);

  const batchIdSet = new Set(batchIds);
  chapters.forEach((chapter, index) => {
    if (nonemptyString(chapter?.batch) && !batchIdSet.has(chapter.batch)) {
      errors.push(`chapters[${index}].batch references unknown batch '${chapter.batch}'.`);
    }
  });
  owners.forEach((owner, index) => {
    for (const batchId of owner?.required_by ?? []) {
      if (!batchIdSet.has(batchId)) {
        errors.push(`owners[${index}].required_by references unknown batch '${batchId}'.`);
      }
    }
  });

  const inProgress = batches.filter((batch) => batch?.stage === 'in_progress');
  if (initiative?.current_batch === null) {
    if (inProgress.length !== 0) {
      errors.push('no batch may be in_progress when initiative.current_batch is null.');
    }
  } else if (nonemptyString(initiative?.current_batch)) {
    if (!batchIdSet.has(initiative.current_batch)) {
      errors.push(`initiative.current_batch references unknown batch '${initiative.current_batch}'.`);
    }
    if (inProgress.length !== 1 || inProgress[0]?.id !== initiative.current_batch) {
      errors.push('exactly initiative.current_batch must have stage in_progress.');
    }
  }

  return errors;
}

function headingPositions(markdown) {
  return requiredAnalysisHeadings.map((heading) => markdown.indexOf(heading));
}

function validateAnalysisContent(markdown, label, errors, { requireSeriesLedger = false } = {}) {
  const positions = headingPositions(markdown);
  requiredAnalysisHeadings.forEach((heading, index) => {
    if (positions[index] < 0) errors.push(`${label} is missing '${heading}'.`);
  });
  for (let index = 1; index < positions.length; index += 1) {
    if (positions[index - 1] >= 0 && positions[index] >= 0 && positions[index - 1] >= positions[index]) {
      errors.push(`${label} has analysis headings out of order.`);
      break;
    }
  }
  if (positions.at(-1) >= 0) {
    const laterH2 = markdown.slice(positions.at(-1) + requiredAnalysisHeadings.at(-1).length).match(/^##\s+/m);
    if (laterH2) errors.push(`${label} must keep '## 관련 항목' as the final H2.`);
  }
  if (requireSeriesLedger) {
    for (const item of measurementLedgerLabels) {
      if (!markdown.includes(item)) errors.push(`${label} is missing measurement ledger label '${item}'.`);
    }
    for (const item of causalRelationLabels) {
      if (!markdown.includes(item)) errors.push(`${label} is missing causal relation label '${item}'.`);
    }
  }
}

async function readFrontmatterAndMarkdown(absolutePath, readFile) {
  const markdown = await readFile(absolutePath, 'utf8');
  const parsed = matter(markdown);
  return { markdown, data: parsed.data };
}

export async function validateHistoryLedger(
  ledger,
  {
    projectRoot = rootDir,
    fileExists = async (absolutePath) => {
      try {
        await fs.access(absolutePath);
        return true;
      } catch {
        return false;
      }
    },
    readFile = fs.readFile,
  } = {},
) {
  const errors = validateHistoryLedgerStructure(ledger);
  if (errors.length > 0) return errors;

  const validateCompletePage = async ({ path: relativePath, page_id: pageId, id, title, stage }, label, type) => {
    if (stage !== 'complete') return;
    const normalized = normalizeRepoRelativePath(relativePath);
    const absolutePath = path.join(projectRoot, ...normalized.split('/'));
    if (!(await fileExists(absolutePath))) {
      errors.push(`${label} is complete but '${normalized}' does not exist.`);
      return;
    }
    const { markdown, data } = await readFrontmatterAndMarkdown(absolutePath, readFile);
    const expectedId = pageId ?? id;
    if (data.id !== expectedId) errors.push(`${label} expected id '${expectedId}' but found '${data.id ?? ''}'.`);
    if (data.title !== title) errors.push(`${label} expected title '${title}' but found '${data.title ?? ''}'.`);
    if (data.page_type !== type) errors.push(`${label} expected page_type '${type}' but found '${data.page_type ?? ''}'.`);
    if (type === 'analysis') {
      validateAnalysisContent(markdown, label, errors, { requireSeriesLedger: true });
    }
  };

  await Promise.all(
    ledger.owners.map((owner, index) =>
      validateCompletePage(owner, `owners[${index}]`, 'concept')),
  );
  await Promise.all(
    ledger.chapters.map((chapter, index) =>
      validateCompletePage(chapter, `chapters[${index}]`, 'analysis')),
  );
  await Promise.all(
    ledger.bridges.map((bridge, index) =>
      validateCompletePage(bridge, `bridges[${index}]`, 'analysis')),
  );
  await validateCompletePage(
    { ...ledger.initiative.hub, title: ledger.initiative.title },
    'initiative.hub',
    'meta',
  );
  await validateCompletePage(
    {
      ...ledger.initiative.synthesis,
      title: 'LLM 능력은 모델의 속성인가 시스템의 속성인가',
    },
    'initiative.synthesis',
    'analysis',
  );

  const completeBatchIds = new Set(
    ledger.batches.filter((batch) => batch.stage === 'complete').map((batch) => batch.id),
  );
  for (const [index, batch] of ledger.batches.entries()) {
    if (!completeBatchIds.has(batch.id)) continue;
    for (const [deliverableIndex, deliverable] of batch.deliverables.entries()) {
      const normalized = normalizeRepoRelativePath(deliverable);
      const absolutePath = path.join(projectRoot, ...normalized.split('/'));
      if (!(await fileExists(absolutePath))) {
        errors.push(
          `batches[${index}].deliverables[${deliverableIndex}] is missing complete file '${normalized}'.`,
        );
      }
    }
  }

  return errors;
}

export function buildHistoryStatus(ledger) {
  const countStages = (items) =>
    Object.fromEntries(STAGES.map((stage) => [stage, items.filter((item) => item.stage === stage).length]));
  const current = ledger.batches.find((batch) => batch.id === ledger.initiative.current_batch) ?? null;
  return {
    initiative: ledger.initiative.title,
    current_batch: current,
    next_action: ledger.initiative.next_action,
    blockers: ledger.initiative.blockers,
    progress: {
      batches: countStages(ledger.batches),
      chapters: countStages(ledger.chapters),
      bridges: countStages(ledger.bridges),
      owners: countStages(ledger.owners),
    },
    handoff: ledger.initiative.handoff,
  };
}

export function renderHistoryStatus(status) {
  const summarize = (counts) => STAGES.map((stage) => `${stage}=${counts[stage]}`).join(', ');
  const lines = [
    `Initiative: ${status.initiative}`,
    `Current batch: ${status.current_batch ? `${status.current_batch.id} — ${status.current_batch.title}` : 'none'}`,
    `Next action: ${status.next_action}`,
    `Blockers: ${status.blockers.length > 0 ? status.blockers.join('; ') : 'none'}`,
    `Batches: ${summarize(status.progress.batches)}`,
    `Chapters: ${summarize(status.progress.chapters)}`,
    `Bridges: ${summarize(status.progress.bridges)}`,
    `Owners: ${summarize(status.progress.owners)}`,
    `Handoff: ${status.handoff.updated} · baseline ${status.handoff.baseline_commit.slice(0, 8)} · last gate ${status.handoff.last_completed_gate ?? 'none'}`,
  ];
  return lines.join('\n');
}

export function parseHistoryStatusArguments(argv) {
  const options = { check: false, ledgerPath: DEFAULT_LEDGER_PATH };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--check') {
      options.check = true;
    } else if (arg === '--ledger') {
      const next = argv[index + 1];
      if (!nonemptyString(next)) throw new Error('--ledger requires a path.');
      options.ledgerPath = next;
      index += 1;
    } else {
      throw new Error(`Unknown argument '${arg}'.`);
    }
  }
  return options;
}

export async function runHistoryStatus(
  argv = process.argv.slice(2),
  { projectRoot = rootDir, readFile = fs.readFile, fileExists } = {},
) {
  const options = parseHistoryStatusArguments(argv);
  const normalizedLedgerPath = normalizeRepoRelativePath(options.ledgerPath);
  if (normalizedLedgerPath === null) throw new Error('Ledger path must be repository-relative.');
  const ledgerAbsolutePath = path.join(projectRoot, ...normalizedLedgerPath.split('/'));
  const ledgerText = await readFile(ledgerAbsolutePath, 'utf8');
  const ledger = yaml.load(ledgerText);
  const errors = await validateHistoryLedger(ledger, { projectRoot, readFile, fileExists });
  if (errors.length > 0) {
    throw new Error(`LLM computing history ledger validation failed:\n- ${errors.join('\n- ')}`);
  }
  const status = buildHistoryStatus(ledger);
  return { options, ledger, status, output: renderHistoryStatus(status) };
}

const isCli = process.argv[1]
  && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isCli) {
  runHistoryStatus()
    .then(({ options, output }) => {
      if (!options.check) process.stdout.write(`${output}\n`);
    })
    .catch((error) => {
      process.stderr.write(`${error.message}\n`);
      process.exitCode = 1;
    });
}
