import { execFile as execFileCallback } from 'node:child_process';
import { promises as fs } from 'node:fs';
import { promisify } from 'node:util';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';
import yaml from 'js-yaml';
import { rootDir } from './lib/project-paths.mjs';

const execFile = promisify(execFileCallback);

export const DEFAULT_LEDGER_PATH = 'docs/llm-system-boundary-network.yml';
export const STAGES = Object.freeze(['planned', 'in_progress', 'complete']);
export const PAGE_TYPES = Object.freeze(['concept', 'analysis', 'meta']);
export const ACTIONS = Object.freeze(['create', 'extend']);
export const BOUNDARY_SLOTS = Object.freeze([
  '입력·대상',
  '변환 경로',
  '시간·상태·자원',
  '결과 계약',
  '지표·평가 기준',
  '실패·복구 경계',
  '권한·책임·출처 추적',
]);

const stageSet = new Set(STAGES);
const pageTypeSet = new Set(PAGE_TYPES);
const actionSet = new Set(ACTIONS);
const requiredLearningHeadings = Object.freeze([
  '## 1단계 — 먼저 잡을 핵심',
  '## 2단계 — 작동 원리',
  '## 3단계 — 기술과 근거',
  '## 검증과 한계',
  '## 학습 확인',
  '## 출처',
  '## 관련 항목',
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
    if (allowed && !allowed.has(item)) errors.push(`${label}[${index}] has unsupported value '${item}'.`);
  });
  for (const duplicate of duplicateValues(strings)) errors.push(`${label} repeats '${duplicate}'.`);
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

function validatePageRecord(record, label, errors, { allowMeta = false } = {}) {
  if (!isRecord(record)) {
    errors.push(`${label} must be an object.`);
    return;
  }
  for (const field of ['title', 'page_id']) {
    if (!nonemptyString(record[field])) errors.push(`${label}.${field} must be a nonempty string.`);
  }
  validatePath(record.path, `${label}.path`, errors);
  validateStage(record.stage, `${label}.stage`, errors);
  if (record.page_type !== undefined) {
    if (!pageTypeSet.has(record.page_type)) errors.push(`${label}.page_type must be a known page type.`);
    if (!allowMeta && record.page_type === 'meta') errors.push(`${label}.page_type may not be meta.`);
  }
}

function validatePageCollection(items, label, errors) {
  if (!Array.isArray(items)) {
    errors.push(`${label} must be an array.`);
    return [];
  }
  items.forEach((item, index) => {
    validatePageRecord(item, `${label}[${index}]`, errors);
    if (!isRecord(item)) return;
    if (!actionSet.has(item.action)) errors.push(`${label}[${index}].action must be one of: ${ACTIONS.join(', ')}.`);
    validateStringArray(item.required_by, `${label}[${index}].required_by`, errors);
  });
  for (const field of ['id', 'title', 'path', 'page_id']) {
    for (const duplicate of duplicateValues(items.map((item) => item?.[field]).filter(nonemptyString))) {
      errors.push(`${label} has duplicate ${field} '${duplicate}'.`);
    }
  }
  return items;
}

function validateHandoff(handoff, errors) {
  if (!isRecord(handoff)) {
    errors.push('initiative.handoff must be an object.');
    return;
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(handoff.updated ?? '')) {
    errors.push('initiative.handoff.updated must be a YYYY-MM-DD string.');
  }
  if (!/^[0-9a-f]{40}$/i.test(handoff.baseline_commit ?? '')) {
    errors.push('initiative.handoff.baseline_commit must be a 40-character hexadecimal commit.');
  }
  if (!nonemptyString(handoff.last_completed_batch)) {
    errors.push('initiative.handoff.last_completed_batch must be a nonempty string.');
  }
  if (!nonemptyString(handoff.last_completed_gate)) {
    errors.push('initiative.handoff.last_completed_gate must be a nonempty string.');
  }
  validateStringArray(handoff.validation, 'initiative.handoff.validation', errors);
  validateStringArray(handoff.recovery, 'initiative.handoff.recovery', errors);
  if (!nonemptyString(handoff.notes)) errors.push('initiative.handoff.notes must be a nonempty string.');
}

export function validateBoundaryLedgerStructure(ledger) {
  const errors = [];
  if (!isRecord(ledger)) return ['ledger must be an object.'];
  if (ledger.schema_version !== 1) errors.push('schema_version must be 1.');

  const initiative = ledger.initiative;
  if (!isRecord(initiative)) {
    errors.push('initiative must be an object.');
  } else {
    for (const field of ['id', 'title', 'next_action']) {
      if (!nonemptyString(initiative[field])) errors.push(`initiative.${field} must be a nonempty string.`);
    }
    if (initiative.current_batch !== null && !nonemptyString(initiative.current_batch)) {
      errors.push('initiative.current_batch must be null or a nonempty string.');
    }
    validateStringArray(initiative.blockers, 'initiative.blockers', errors);
    validatePageRecord(initiative.hub, 'initiative.hub', errors, { allowMeta: true });
    if (initiative.hub?.page_type !== undefined && initiative.hub.page_type !== 'meta') {
      errors.push('initiative.hub.page_type must be meta.');
    }
    validateHandoff(initiative.handoff, errors);
  }

  const slots = validateStringArray(ledger.boundary_slots, 'boundary_slots', errors);
  if (slots.length !== BOUNDARY_SLOTS.length || BOUNDARY_SLOTS.some((slot) => !slots.includes(slot))) {
    errors.push('boundary_slots must contain the seven required boundary labels exactly once.');
  }

  const owners = validatePageCollection(ledger.owners, 'owners', errors);
  const bridges = validatePageCollection(ledger.bridges, 'bridges', errors);
  const pageRecords = [...owners, ...bridges];
  const pageRecordIds = new Set(pageRecords.map((record) => record?.id).filter(nonemptyString));

  const tracks = Array.isArray(ledger.tracks) ? ledger.tracks : [];
  if (!Array.isArray(ledger.tracks)) errors.push('tracks must be an array.');
  if (tracks.length !== 6) errors.push(`tracks must contain exactly 6 entries; found ${tracks.length}.`);
  tracks.forEach((track, index) => {
    const label = `tracks[${index}]`;
    if (!isRecord(track)) {
      errors.push(`${label} must be an object.`);
      return;
    }
    if (track.priority !== index + 1) errors.push(`${label}.priority must be ${index + 1}.`);
    for (const field of ['id', 'title', 'primary_title', 'primary_page_id']) {
      if (!nonemptyString(track[field])) errors.push(`${label}.${field} must be a nonempty string.`);
    }
    validateStage(track.stage, `${label}.stage`, errors);
    validatePath(track.primary_path, `${label}.primary_path`, errors);
    if (!pageTypeSet.has(track.primary_page_type) || track.primary_page_type === 'meta') {
      errors.push(`${label}.primary_page_type must be concept or analysis.`);
    }
    const ownerIds = validateStringArray(track.owners, `${label}.owners`, errors);
    const bridgeIds = validateStringArray(track.bridges, `${label}.bridges`, errors);
    [...ownerIds, ...bridgeIds].forEach((id) => {
      if (!pageRecordIds.has(id)) errors.push(`${label} references unknown page record '${id}'.`);
    });
    validateStringArray(track.batches, `${label}.batches`, errors);
  });
  for (const field of ['id', 'title', 'priority']) {
    for (const duplicate of duplicateValues(tracks.map((track) => track?.[field]).filter((value) => value !== undefined && value !== null))) {
      errors.push(`tracks has duplicate ${field} '${duplicate}'.`);
    }
  }

  const batches = Array.isArray(ledger.batches) ? ledger.batches : [];
  if (!Array.isArray(ledger.batches)) errors.push('batches must be an array.');
  if (batches.length !== 12) errors.push(`batches must contain exactly 12 entries; found ${batches.length}.`);
  batches.forEach((batch, index) => {
    const label = `batches[${index}]`;
    if (!isRecord(batch)) {
      errors.push(`${label} must be an object.`);
      return;
    }
    if (batch.order !== index) errors.push(`${label}.order must be ${index}.`);
    for (const field of ['id', 'title', 'commit_message']) {
      if (!nonemptyString(batch[field])) errors.push(`${label}.${field} must be a nonempty string.`);
    }
    if (!/^(docs|content): [a-z0-9_]+$/.test(batch.commit_message ?? '')) {
      errors.push(`${label}.commit_message must use a docs: or content: snake_case message.`);
    }
    validateStage(batch.stage, `${label}.stage`, errors);
    const dependencies = validateStringArray(batch.depends_on, `${label}.depends_on`, errors);
    const expectedDependency = index === 0 ? [] : [batches[index - 1]?.id];
    if (dependencies.length !== expectedDependency.length || dependencies.some((item, depIndex) => item !== expectedDependency[depIndex])) {
      errors.push(`${label}.depends_on must be the immediately preceding batch.`);
    }
    for (const field of ['deliverables', 'expected_paths']) {
      const paths = validateStringArray(batch[field], `${label}.${field}`, errors);
      paths.forEach((entry, entryIndex) => validatePath(entry, `${label}.${field}[${entryIndex}]`, errors));
    }
  });
  const batchIds = batches.map((batch) => batch?.id).filter(nonemptyString);
  for (const duplicate of duplicateValues(batchIds)) errors.push(`batches has duplicate id '${duplicate}'.`);
  const batchIdSet = new Set(batchIds);

  pageRecords.forEach((record, index) => {
    for (const batchId of record?.required_by ?? []) {
      if (!batchIdSet.has(batchId)) errors.push(`page record ${index} references unknown batch '${batchId}'.`);
    }
  });
  tracks.forEach((track, index) => {
    for (const batchId of track?.batches ?? []) {
      if (!batchIdSet.has(batchId)) errors.push(`tracks[${index}].batches references unknown batch '${batchId}'.`);
    }
  });

  const firstIncompleteIndex = batches.findIndex((batch) => batch?.stage !== 'complete');
  if (firstIncompleteIndex >= 0) {
    batches.forEach((batch, index) => {
      if (index < firstIncompleteIndex && batch.stage !== 'complete') {
        errors.push('complete batches must form a prefix.');
      }
      if (index > firstIncompleteIndex && batch.stage === 'complete') {
        errors.push('complete batches must form a prefix.');
      }
    });
    const expectedCurrent = batches[firstIncompleteIndex]?.id;
    if (initiative?.current_batch !== expectedCurrent) {
      errors.push(`initiative.current_batch must be the first incomplete batch '${expectedCurrent}'.`);
    }
  } else if (initiative?.current_batch !== null) {
    errors.push('initiative.current_batch must be null after all batches complete.');
  }
  const inProgress = batches.filter((batch) => batch?.stage === 'in_progress');
  if (inProgress.length > 1) errors.push('at most one batch may be in_progress.');
  if (inProgress.length === 1 && inProgress[0]?.id !== initiative?.current_batch) {
    errors.push('only initiative.current_batch may be in_progress.');
  }

  const completedBatchIds = new Set(batches.filter((batch) => batch.stage === 'complete').map((batch) => batch.id));
  for (const [index, batch] of batches.entries()) {
    if (batch.stage !== 'complete') continue;
    for (const dependency of batch.depends_on ?? []) {
      if (!completedBatchIds.has(dependency)) errors.push(`batches[${index}] is complete before dependency '${dependency}'.`);
    }
  }
  if (initiative?.handoff?.last_completed_batch && !completedBatchIds.has(initiative.handoff.last_completed_batch)) {
    errors.push('initiative.handoff.last_completed_batch must be complete.');
  }

  return errors;
}

function requiredHeadingErrors(markdown, label) {
  const errors = [];
  const positions = requiredLearningHeadings.map((heading) => markdown.indexOf(heading));
  requiredLearningHeadings.forEach((heading, index) => {
    if (positions[index] < 0) errors.push(`${label} is missing '${heading}'.`);
  });
  for (let index = 1; index < positions.length; index += 1) {
    if (positions[index - 1] >= 0 && positions[index] >= 0 && positions[index - 1] >= positions[index]) {
      errors.push(`${label} has learning headings out of order.`);
      break;
    }
  }
  if (positions.at(-1) >= 0) {
    const laterH2 = markdown.slice(positions.at(-1) + requiredLearningHeadings.at(-1).length).match(/^##\s+/m);
    if (laterH2) errors.push(`${label} must keep '## 관련 항목' as the final H2.`);
  }
  return errors;
}

async function readPage(absolutePath, readFile) {
  const markdown = await readFile(absolutePath, 'utf8');
  const parsed = matter(markdown);
  return { markdown, data: parsed.data };
}

async function validateCompletePage(record, label, errors, { projectRoot, fileExists, readFile, requireBoundarySlots = false }) {
  if (record.stage !== 'complete') return;
  const normalized = normalizeRepoRelativePath(record.path);
  const absolutePath = path.join(projectRoot, ...normalized.split('/'));
  if (!(await fileExists(absolutePath))) {
    errors.push(`${label} is complete but '${normalized}' does not exist.`);
    return;
  }
  const { markdown, data } = await readPage(absolutePath, readFile);
  if (data.id !== record.page_id) errors.push(`${label} expected id '${record.page_id}' but found '${data.id ?? ''}'.`);
  if (data.title !== record.title) errors.push(`${label} expected title '${record.title}' but found '${data.title ?? ''}'.`);
  if (data.page_type !== record.page_type) errors.push(`${label} expected page_type '${record.page_type}' but found '${data.page_type ?? ''}'.`);
  if (record.page_type !== 'meta') errors.push(...requiredHeadingErrors(markdown, label));
  if (requireBoundarySlots) {
    for (const slot of BOUNDARY_SLOTS) {
      if (!markdown.includes(slot)) errors.push(`${label} is missing boundary slot '${slot}'.`);
    }
  }
}

export async function validateBoundaryLedger(
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
  const errors = validateBoundaryLedgerStructure(ledger);
  if (errors.length > 0) return errors;

  for (const [index, owner] of ledger.owners.entries()) {
    await validateCompletePage(owner, `owners[${index}]`, errors, { projectRoot, fileExists, readFile });
  }
  for (const [index, bridge] of ledger.bridges.entries()) {
    await validateCompletePage(bridge, `bridges[${index}]`, errors, { projectRoot, fileExists, readFile });
  }
  await validateCompletePage(ledger.initiative.hub, 'initiative.hub', errors, { projectRoot, fileExists, readFile });

  for (const [index, track] of ledger.tracks.entries()) {
    if (track.stage !== 'complete') continue;
    const primary = {
      title: track.primary_title,
      path: track.primary_path,
      page_id: track.primary_page_id,
      page_type: track.primary_page_type,
      stage: 'complete',
    };
    await validateCompletePage(primary, `tracks[${index}].primary`, errors, {
      projectRoot,
      fileExists,
      readFile,
      requireBoundarySlots: true,
    });
    for (const batchId of track.batches) {
      const batch = ledger.batches.find((entry) => entry.id === batchId);
      if (batch?.stage !== 'complete') errors.push(`tracks[${index}] is complete before batch '${batchId}'.`);
    }
  }

  for (const [index, batch] of ledger.batches.entries()) {
    if (batch.stage !== 'complete') continue;
    for (const [deliverableIndex, deliverable] of batch.deliverables.entries()) {
      const normalized = normalizeRepoRelativePath(deliverable);
      const absolutePath = path.join(projectRoot, ...normalized.split('/'));
      if (!(await fileExists(absolutePath))) {
        errors.push(`batches[${index}].deliverables[${deliverableIndex}] is missing complete file '${normalized}'.`);
      }
    }
  }

  return errors;
}

function stageCounts(items) {
  return Object.fromEntries(STAGES.map((stage) => [stage, items.filter((item) => item.stage === stage).length]));
}

export function buildBoundaryStatus(ledger) {
  const currentBatch = ledger.batches.find((batch) => batch.id === ledger.initiative.current_batch) ?? null;
  return {
    initiative: ledger.initiative.title,
    current_batch: currentBatch,
    next_action: ledger.initiative.next_action,
    blockers: ledger.initiative.blockers,
    progress: {
      batches: stageCounts(ledger.batches),
      tracks: stageCounts(ledger.tracks),
      owners: stageCounts(ledger.owners),
      bridges: stageCounts(ledger.bridges),
    },
    handoff: ledger.initiative.handoff,
  };
}

export function renderBoundaryStatus(status) {
  const summarize = (counts) => STAGES.map((stage) => `${stage}=${counts[stage]}`).join(', ');
  return [
    `Initiative: ${status.initiative}`,
    `Current batch: ${status.current_batch ? `${status.current_batch.id} — ${status.current_batch.title}` : 'none'}`,
    `Next action: ${status.next_action}`,
    `Blockers: ${status.blockers.length > 0 ? status.blockers.join('; ') : 'none'}`,
    `Batches: ${summarize(status.progress.batches)}`,
    `Tracks: ${summarize(status.progress.tracks)}`,
    `Owners: ${summarize(status.progress.owners)}`,
    `Bridges: ${summarize(status.progress.bridges)}`,
    `Handoff: ${status.handoff.updated} · baseline ${status.handoff.baseline_commit.slice(0, 8)} · completed ${status.handoff.last_completed_batch}`,
  ].join('\n');
}

async function runGit(args, cwd) {
  const { stdout } = await execFile('git', args, { cwd, windowsHide: true });
  return stdout.trim();
}

export async function inspectResumeState(ledger, { projectRoot = rootDir } = {}) {
  const current = ledger.batches.find((batch) => batch.id === ledger.initiative.current_batch) ?? null;
  const [branch, changes, untracked, counts] = await Promise.all([
    runGit(['branch', '--show-current'], projectRoot),
    runGit(['diff', '--name-only'], projectRoot),
    runGit(['ls-files', '--others', '--exclude-standard'], projectRoot),
    runGit(['rev-list', '--left-right', '--count', 'HEAD...origin/main'], projectRoot),
  ]);
  const changedPaths = [...changes.split(/\r?\n/), ...untracked.split(/\r?\n/)]
    .map((entry) => entry.trim().replaceAll('\\', '/'))
    .filter(Boolean);
  const expectedPaths = new Set((current?.expected_paths ?? []).map((entry) => entry.replaceAll('\\', '/')));
  const matchingChanges = changedPaths.filter((entry) => expectedPaths.has(entry));
  const unrelatedChanges = changedPaths.filter((entry) => !expectedPaths.has(entry));
  const [aheadRaw = '0', behindRaw = '0'] = counts.split(/\s+/);
  const ahead = Number(aheadRaw);
  const behind = Number(behindRaw);

  let action;
  if (branch !== 'main') {
    action = `Stop: expected main but current branch is '${branch || 'detached'}'.`;
  } else if (ahead > 0 && behind === 0) {
    action = 'Push pending: push origin main before starting another batch.';
  } else if (behind > 0) {
    action = 'Stop: origin/main is ahead or diverged; fetch and inspect before editing.';
  } else if (!current) {
    action = 'All batches are complete; run the final verification and inspect the handoff.';
  } else if (matchingChanges.length > 0) {
    action = `Resume '${current.id}' using only its expected paths, then run its validation gate.`;
  } else {
    action = `Begin '${current.id}' only after reading its expected paths and next action.`;
  }

  return {
    branch,
    ahead,
    behind,
    current,
    matchingChanges,
    unrelatedChanges,
    action,
  };
}

export function renderResumeState(resume) {
  const expected = resume.current?.expected_paths ?? [];
  return [
    `Branch: ${resume.branch || 'detached'}`,
    `Remote delta: ahead=${resume.ahead}, behind=${resume.behind}`,
    `Current batch: ${resume.current ? `${resume.current.id} — ${resume.current.title}` : 'none'}`,
    `Expected paths: ${expected.length > 0 ? expected.join(', ') : 'none'}`,
    `Matching local changes: ${resume.matchingChanges.length > 0 ? resume.matchingChanges.join(', ') : 'none'}`,
    `Unrelated local changes: ${resume.unrelatedChanges.length > 0 ? resume.unrelatedChanges.join(', ') : 'none'}`,
    `Action: ${resume.action}`,
  ].join('\n');
}

export function parseBoundaryStatusArguments(argv) {
  const options = { check: false, resume: false, ledgerPath: DEFAULT_LEDGER_PATH };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--check') {
      options.check = true;
    } else if (arg === '--resume') {
      options.resume = true;
    } else if (arg === '--ledger') {
      const next = argv[index + 1];
      if (!nonemptyString(next)) throw new Error('--ledger requires a path.');
      options.ledgerPath = next;
      index += 1;
    } else {
      throw new Error(`Unknown argument '${arg}'.`);
    }
  }
  if (options.check && options.resume) throw new Error('--check and --resume cannot be used together.');
  return options;
}

export async function runBoundaryStatus(
  argv = process.argv.slice(2),
  { projectRoot = rootDir, readFile = fs.readFile, fileExists, inspectGit = inspectResumeState } = {},
) {
  const options = parseBoundaryStatusArguments(argv);
  const normalizedLedgerPath = normalizeRepoRelativePath(options.ledgerPath);
  if (normalizedLedgerPath === null) throw new Error('Ledger path must be repository-relative.');
  const ledgerPath = path.join(projectRoot, ...normalizedLedgerPath.split('/'));
  const ledger = yaml.load(await readFile(ledgerPath, 'utf8'));
  const errors = await validateBoundaryLedger(ledger, { projectRoot, readFile, fileExists });
  if (errors.length > 0) throw new Error(`LLM system boundary ledger validation failed:\n- ${errors.join('\n- ')}`);
  const status = buildBoundaryStatus(ledger);
  const resume = options.resume ? await inspectGit(ledger, { projectRoot }) : null;
  return {
    options,
    ledger,
    status,
    resume,
    output: options.resume ? renderResumeState(resume) : renderBoundaryStatus(status),
  };
}

const isCli = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isCli) {
  runBoundaryStatus()
    .then(({ options, output }) => {
      if (!options.check) process.stdout.write(`${output}\n`);
    })
    .catch((error) => {
      process.stderr.write(`${error.message}\n`);
      process.exitCode = 1;
    });
}
