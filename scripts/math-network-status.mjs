import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';
import yaml from 'js-yaml';
import {
  duplicateValues,
  isIsoDate,
  isRecord,
  nonemptyString,
  normalizeRepoRelativePath,
} from './lib/initiative-ledger.mjs';
import { rootDir } from './lib/project-paths.mjs';

export { normalizeRepoRelativePath };

export const BATCH_STAGES = Object.freeze(['planned', 'in_progress', 'complete', 'deferred']);
export const FAMILY_COVERAGE = Object.freeze(['established', 'planned', 'needs_upgrade', 'ready', 'deferred']);
export const REQUIRED_OWNER_COVERAGE = Object.freeze(['established', 'needs_upgrade', 'ready']);
export const DEFAULT_LEDGER_PATH = 'docs/llm-math-network.yml';

const batchStageSet = new Set(BATCH_STAGES);
const familyCoverageSet = new Set(FAMILY_COVERAGE);
const requiredOwnerCoverageSet = new Set(REQUIRED_OWNER_COVERAGE);
const dependencyReadyCoverageSet = new Set(['established', 'ready']);
const completedBatchCoverageSet = new Set(['ready', 'deferred']);
const baselineAuditLabels = Object.freeze({
  wiki_documents: '전체 Markdown 문서',
  non_meta_documents: '비메타 문서',
  formula_documents: '블록 수식이 있는 문서',
  formula_blocks: '블록 수식 총수',
});

function escapeRegularExpression(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Parse only the generated report's first audit-scope section. Exact labels keep
 * similarly worded prose or later tables from silently becoming the baseline.
 */
export function parseFoundationalLearningAuditScope(markdown) {
  const lines = String(markdown).replaceAll('\r\n', '\n').split('\n');
  const headingIndex = lines.findIndex((line) => line.trim() === '## 1. 감사 범위');
  if (headingIndex < 0) {
    throw new Error("is missing the exact '## 1. 감사 범위' heading.");
  }
  let sectionEnd = lines.length;
  for (let index = headingIndex + 1; index < lines.length; index += 1) {
    if (/^##\s+/.test(lines[index])) {
      sectionEnd = index;
      break;
    }
  }
  const sectionLines = lines.slice(headingIndex + 1, sectionEnd);
  const values = {};

  for (const [field, label] of Object.entries(baselineAuditLabels)) {
    const pattern = new RegExp(`^-\\s+${escapeRegularExpression(label)}:\\s+(\\d+)개\\s*$`);
    const matches = sectionLines.map((line) => line.match(pattern)).filter(Boolean);
    if (matches.length !== 1) {
      throw new Error(
        `must contain exactly one '- ${label}: N개' line in '## 1. 감사 범위'; found ${matches.length}.`,
      );
    }
    const value = Number(matches[0][1]);
    if (!Number.isSafeInteger(value)) {
      throw new Error(`contains an unsafe integer for '${label}'.`);
    }
    values[field] = value;
  }
  return values;
}

function requireRecord(value, label, errors) {
  if (isRecord(value)) return true;
  errors.push(`${label} must be an object.`);
  return false;
}

function requireString(value, label, errors) {
  if (nonemptyString(value)) return true;
  errors.push(`${label} must be a nonempty string.`);
  return false;
}

function validateStringArray(value, label, errors, { paths = false } = {}) {
  if (!Array.isArray(value)) {
    errors.push(`${label} must be an array.`);
    return [];
  }

  const strings = [];
  value.forEach((entry, index) => {
    const entryLabel = `${label}[${index}]`;
    if (!requireString(entry, entryLabel, errors)) return;
    const trimmed = entry.trim();
    strings.push(trimmed);
    if (paths && normalizeRepoRelativePath(trimmed) === null) {
      errors.push(`${entryLabel} must be a safe repo-relative path.`);
    }
  });

  for (const duplicate of duplicateValues(strings)) {
    errors.push(`${label} repeats '${duplicate}'.`);
  }
  return strings;
}

function validateRepoPath(value, label, errors) {
  if (!requireString(value, label, errors)) return null;
  const normalized = normalizeRepoRelativePath(value);
  if (normalized === null) errors.push(`${label} must be a safe repo-relative path.`);
  return normalized;
}

function validateHandoff(handoff, errors) {
  if (handoff === undefined) return;
  if (!requireRecord(handoff, 'initiative.handoff', errors)) return;

  if (!isIsoDate(handoff.updated)) {
    errors.push('initiative.handoff.updated must be a valid YYYY-MM-DD string.');
  }
  if (typeof handoff.baseline_commit !== 'string' || !/^[0-9a-f]{40}$/i.test(handoff.baseline_commit)) {
    errors.push('initiative.handoff.baseline_commit must be a 40-character hexadecimal commit.');
  }
  if (handoff.last_completed_gate !== null && !nonemptyString(handoff.last_completed_gate)) {
    errors.push('initiative.handoff.last_completed_gate must be null or a nonempty string.');
  }
  requireString(handoff.notes, 'initiative.handoff.notes', errors);

  if (!Array.isArray(handoff.validation)) {
    errors.push('initiative.handoff.validation must be an array.');
    return;
  }
  handoff.validation.forEach((entry, index) => {
    const label = `initiative.handoff.validation[${index}]`;
    if (!requireRecord(entry, label, errors)) return;
    requireString(entry.command, `${label}.command`, errors);
    requireString(entry.result, `${label}.result`, errors);
  });
}

function validateBaseline(baseline, errors) {
  if (!requireRecord(baseline, 'baseline', errors)) return;
  if (!isIsoDate(baseline.recorded_on)) {
    errors.push('baseline.recorded_on must be a valid YYYY-MM-DD string.');
  }
  validateRepoPath(baseline.source, 'baseline.source', errors);
  for (const field of ['wiki_documents', 'non_meta_documents', 'formula_documents', 'formula_blocks']) {
    if (!Number.isInteger(baseline[field]) || baseline[field] < 0) {
      errors.push(`baseline.${field} must be a nonnegative integer.`);
    }
  }
}

function validateInitiative(initiative, errors) {
  if (!requireRecord(initiative, 'initiative', errors)) return;

  requireString(initiative.id, 'initiative.id', errors);
  requireString(initiative.title, 'initiative.title', errors);
  if (initiative.current_batch !== null) {
    requireString(initiative.current_batch, 'initiative.current_batch', errors);
  }
  requireString(initiative.next_action, 'initiative.next_action', errors);
  validateStringArray(initiative.blockers, 'initiative.blockers', errors);
  validateHandoff(initiative.handoff, errors);

  if (!requireRecord(initiative.hub, 'initiative.hub', errors)) return;
  validateRepoPath(initiative.hub.path, 'initiative.hub.path', errors);
  requireString(initiative.hub.id, 'initiative.hub.id', errors);
  requireString(initiative.hub.batch, 'initiative.hub.batch', errors);
  if (!requireString(initiative.hub.stage, 'initiative.hub.stage', errors)) return;
  if (!batchStageSet.has(initiative.hub.stage)) {
    errors.push(`initiative.hub.stage must be one of: ${BATCH_STAGES.join(', ')}.`);
  }
}

function validateBatches(batches, errors) {
  if (!Array.isArray(batches)) {
    errors.push('batches must be an array.');
    return [];
  }

  const validRecords = [];
  batches.forEach((batch, index) => {
    const label = `batches[${index}]`;
    if (!requireRecord(batch, label, errors)) return;
    validRecords.push(batch);

    requireString(batch.id, `${label}.id`, errors);
    requireString(batch.title, `${label}.title`, errors);
    if (requireString(batch.stage, `${label}.stage`, errors) && !batchStageSet.has(batch.stage)) {
      errors.push(`${label}.stage must be one of: ${BATCH_STAGES.join(', ')}.`);
    }
    validateStringArray(batch.families, `${label}.families`, errors);
    validateStringArray(batch.deliverables, `${label}.deliverables`, errors, { paths: true });
  });

  const ids = validRecords.filter((batch) => nonemptyString(batch.id)).map((batch) => batch.id.trim());
  for (const duplicate of duplicateValues(ids)) errors.push(`batches has duplicate id '${duplicate}'.`);
  return validRecords;
}

function validateFamilies(families, errors) {
  if (!Array.isArray(families)) {
    errors.push('families must be an array.');
    return [];
  }

  const validRecords = [];
  families.forEach((family, index) => {
    const label = `families[${index}]`;
    if (!requireRecord(family, label, errors)) return;
    validRecords.push(family);

    requireString(family.id, `${label}.id`, errors);
    requireString(family.title, `${label}.title`, errors);
    requireString(family.domain, `${label}.domain`, errors);
    if (requireString(family.coverage, `${label}.coverage`, errors) && !familyCoverageSet.has(family.coverage)) {
      errors.push(`${label}.coverage must be one of: ${FAMILY_COVERAGE.join(', ')}.`);
    }

    if (requireRecord(family.owner, `${label}.owner`, errors)) {
      const ownerPath = validateRepoPath(family.owner.path, `${label}.owner.path`, errors);
      if (ownerPath !== null && !/^wiki\/concepts\/[^/]+\.md$/u.test(ownerPath)) {
        errors.push(`${label}.owner.path must match 'wiki/concepts/*.md'.`);
      }
      if (
        requireString(family.owner.id, `${label}.owner.id`, errors)
        && (
          !family.owner.id.trim().startsWith('concept.')
          || family.owner.id.trim().length === 'concept.'.length
        )
      ) {
        errors.push(`${label}.owner.id must match 'concept.*'.`);
      }
    }
    validateStringArray(family.prerequisites, `${label}.prerequisites`, errors);
    validateStringArray(family.downstream, `${label}.downstream`, errors, { paths: true });
    requireString(family.notes, `${label}.notes`, errors);
  });

  const ids = validRecords.filter((family) => nonemptyString(family.id)).map((family) => family.id.trim());
  for (const duplicate of duplicateValues(ids)) errors.push(`families has duplicate id '${duplicate}'.`);

  const ownerPaths = new Map();
  const ownerIds = new Map();
  validRecords.forEach((family, index) => {
    if (!isRecord(family.owner)) return;
    const familyId = nonemptyString(family.id) ? family.id.trim() : `families[${index}]`;
    const normalizedPath = normalizeRepoRelativePath(family.owner.path);
    if (normalizedPath !== null) {
      const pathKey = normalizedPath.toLocaleLowerCase('en-US');
      const previous = ownerPaths.get(pathKey);
      if (previous) {
        errors.push(
          `owner.path '${normalizedPath}' is assigned to multiple families: '${previous}', '${familyId}'.`,
        );
      } else {
        ownerPaths.set(pathKey, familyId);
      }
    }
    if (nonemptyString(family.owner.id)) {
      const ownerId = family.owner.id.trim();
      const previous = ownerIds.get(ownerId);
      if (previous) {
        errors.push(`owner.id '${ownerId}' is assigned to multiple families: '${previous}', '${familyId}'.`);
      } else {
        ownerIds.set(ownerId, familyId);
      }
    }
  });
  return validRecords;
}

function prerequisiteCycleErrors(families) {
  const graph = new Map();
  for (const family of families) {
    if (!nonemptyString(family?.id) || graph.has(family.id.trim())) continue;
    const id = family.id.trim();
    const prerequisites = Array.isArray(family.prerequisites)
      ? family.prerequisites.filter(nonemptyString).map((value) => value.trim())
      : [];
    graph.set(id, prerequisites);
  }

  const state = new Map();
  const stack = [];
  const stackIndexes = new Map();
  const reportedCycles = new Set();
  const errors = [];

  function visit(id) {
    state.set(id, 'visiting');
    stackIndexes.set(id, stack.length);
    stack.push(id);

    for (const prerequisiteId of graph.get(id) ?? []) {
      if (!graph.has(prerequisiteId) || prerequisiteId === id) continue;
      if (!state.has(prerequisiteId)) {
        visit(prerequisiteId);
        continue;
      }
      if (state.get(prerequisiteId) !== 'visiting') continue;

      const cycleStart = stackIndexes.get(prerequisiteId);
      const cycle = [...stack.slice(cycleStart), prerequisiteId];
      const signature = [...new Set(cycle.slice(0, -1))].sort().join('\0');
      if (reportedCycles.has(signature)) continue;
      reportedCycles.add(signature);
      errors.push(`family prerequisite cycle: ${cycle.join(' -> ')}.`);
    }

    stack.pop();
    stackIndexes.delete(id);
    state.set(id, 'visited');
  }

  for (const id of graph.keys()) {
    if (!state.has(id)) visit(id);
  }
  return errors;
}

function batchMemberships(batches) {
  const memberships = new Map();
  batches.forEach((batch, batchIndex) => {
    if (!Array.isArray(batch.families)) return;
    batch.families.forEach((familyId) => {
      if (!nonemptyString(familyId)) return;
      const id = familyId.trim();
      const entries = memberships.get(id) ?? [];
      entries.push({
        batch,
        batchId: nonemptyString(batch.id) ? batch.id.trim() : `batches[${batchIndex}]`,
        batchIndex,
      });
      memberships.set(id, entries);
    });
  });
  return memberships;
}

function containsFamilyId(text, familyIds) {
  const identifierCharacter = /[A-Za-z0-9._-]/;
  for (const id of familyIds) {
    let offset = String(text).indexOf(id);
    while (offset >= 0) {
      const before = offset === 0 ? '' : text[offset - 1];
      const afterOffset = offset + id.length;
      const after = afterOffset >= text.length ? '' : text[afterOffset];
      if (
        (!before || !identifierCharacter.test(before))
        && (!after || !identifierCharacter.test(after))
      ) {
        return true;
      }
      offset = String(text).indexOf(id, offset + 1);
    }
  }
  return false;
}

function validateNextAction(nextAction, familyIds, errors) {
  if (!nonemptyString(nextAction)) return;
  const text = nextAction.trim();
  if (!/(?:^|[\s`"'(])(?:npm\s+run|node|git)(?=\s|$|[`"')])/m.test(text)) {
    errors.push("initiative.next_action must include a first command beginning with 'npm run', 'node', or 'git'.");
  }
  if (!text.includes('wiki/')) {
    errors.push("initiative.next_action must include a 'wiki/' repo path.");
  }
  if (!containsFamilyId(text, familyIds)) {
    errors.push('initiative.next_action must include at least one known family id.');
  }
}

function validateBatchLifecycle(initiative, batches, familiesById, errors) {
  const currentBatchIsNull = isRecord(initiative) && initiative.current_batch === null;
  const currentBatchId = isRecord(initiative) && nonemptyString(initiative.current_batch)
    ? initiative.current_batch.trim()
    : '';
  const currentBatch = batches.find((batch) => nonemptyString(batch.id) && batch.id.trim() === currentBatchId);
  const inProgressBatches = batches.filter((batch) => batch.stage === 'in_progress');

  if (inProgressBatches.length > 1) {
    const ids = inProgressBatches.map((batch) => `'${batch.id}'`).join(', ');
    errors.push(`at most one batch may be in_progress; found ${ids}.`);
  }
  if (currentBatchIsNull && inProgressBatches.length > 0) {
    const ids = inProgressBatches.map((batch) => `'${batch.id}'`).join(', ');
    errors.push(`initiative.current_batch is null, but in_progress batch remains: ${ids}.`);
  } else if (
    inProgressBatches.length > 0
    && !inProgressBatches.some((batch) => nonemptyString(batch.id) && batch.id.trim() === currentBatchId)
  ) {
    errors.push(
      `in_progress batch '${inProgressBatches[0].id}' must equal initiative.current_batch '${currentBatchId}'.`,
    );
  }
  if (currentBatch && (currentBatch.stage === 'complete' || currentBatch.stage === 'deferred')) {
    errors.push(
      `initiative.current_batch '${currentBatchId}' cannot have stage '${currentBatch.stage}'.`,
    );
  }
  if (
    currentBatchIsNull
    && batches.some((batch) => batch.stage === 'planned')
    && !(
      Array.isArray(initiative.blockers)
      && initiative.blockers.some((blocker) => nonemptyString(blocker))
    )
  ) {
    errors.push(
      'initiative.current_batch may be null while planned batches remain only when '
      + 'initiative.blockers contains an explicit pause or blocker.',
    );
  }

  batches.forEach((batch, batchIndex) => {
    if (batch.stage !== 'complete' || !Array.isArray(batch.families)) return;
    batch.families.forEach((familyId, familyIndex) => {
      if (!nonemptyString(familyId)) return;
      const normalizedId = familyId.trim();
      const family = familiesById.get(normalizedId);
      if (family && !completedBatchCoverageSet.has(family.coverage)) {
        errors.push(
          `batches[${batchIndex}].families[${familyIndex}] '${normalizedId}' must have coverage `
          + `'ready' or 'deferred' because batch '${batch.id}' is complete.`,
        );
      }
    });
  });

  return currentBatch;
}

function validateDependencySchedule({
  batches,
  families,
  familiesById,
  memberships,
  currentBatch,
  errors,
}) {
  for (const family of families) {
    if (!nonemptyString(family.id)) continue;
    const familyId = family.id.trim();
    const familyMemberships = memberships.get(familyId) ?? [];
    if (familyMemberships.length === 0) {
      errors.push(`family '${familyId}' must belong to at least one batch.`);
      continue;
    }
    if (!Array.isArray(family.prerequisites)) continue;
    const firstMembership = familyMemberships[0];

    for (const rawPrerequisiteId of family.prerequisites) {
      if (!nonemptyString(rawPrerequisiteId)) continue;
      const prerequisiteId = rawPrerequisiteId.trim();
      const prerequisite = familiesById.get(prerequisiteId);
      if (!prerequisite || prerequisiteId === familyId) continue;
      if (dependencyReadyCoverageSet.has(prerequisite.coverage)) continue;

      const prerequisiteMemberships = memberships.get(prerequisiteId) ?? [];
      const scheduled = prerequisiteMemberships.some((membership) => (
        membership.batchIndex === firstMembership.batchIndex
        || (
          membership.batchIndex < firstMembership.batchIndex
          && membership.batch.stage !== 'deferred'
        )
      ));
      if (!scheduled) {
        const locations = prerequisiteMemberships.length > 0
          ? prerequisiteMemberships.map((membership) => membership.batchId).join(', ')
          : 'none';
        errors.push(
          `family '${familyId}' prerequisite '${prerequisiteId}' is not scheduled in the same batch `
          + `or an earlier non-deferred batch than '${firstMembership.batchId}' (memberships: ${locations}).`,
        );
      }
    }
  }

  if (!currentBatch || !Array.isArray(currentBatch.families)) return;
  if (currentBatch.stage === 'complete' || currentBatch.stage === 'deferred') return;
  const currentFamilyIds = new Set(
    currentBatch.families.filter(nonemptyString).map((familyId) => familyId.trim()),
  );
  for (const familyId of currentFamilyIds) {
    const family = familiesById.get(familyId);
    if (!family || !Array.isArray(family.prerequisites)) continue;
    for (const rawPrerequisiteId of family.prerequisites) {
      if (!nonemptyString(rawPrerequisiteId)) continue;
      const prerequisiteId = rawPrerequisiteId.trim();
      const prerequisite = familiesById.get(prerequisiteId);
      if (!prerequisite || prerequisiteId === familyId) continue;
      if (
        dependencyReadyCoverageSet.has(prerequisite.coverage)
        || currentFamilyIds.has(prerequisiteId)
      ) {
        continue;
      }
      errors.push(
        `initiative.current_batch '${currentBatch.id}' is not dependency-ready: family '${familyId}' `
        + `requires '${prerequisiteId}' with coverage '${prerequisite.coverage}', and that prerequisite `
        + 'is not included in the current batch.',
      );
    }
  }
}

/**
 * Pure structural/reference validation. File-system owner checks are deliberately
 * handled by validateMathNetworkLedger so callers can inject their own readers.
 */
export function validateMathNetworkLedgerStructure(ledger) {
  const errors = [];
  if (!requireRecord(ledger, 'ledger', errors)) return errors;

  if (ledger.schema_version !== 1) errors.push('schema_version must equal 1.');
  validateBaseline(ledger.baseline, errors);
  validateInitiative(ledger.initiative, errors);
  const batches = validateBatches(ledger.batches, errors);
  const families = validateFamilies(ledger.families, errors);

  const batchIds = new Set(
    batches.filter((batch) => nonemptyString(batch.id)).map((batch) => batch.id.trim()),
  );
  const familyIds = new Set(
    families.filter((family) => nonemptyString(family.id)).map((family) => family.id.trim()),
  );
  const familiesById = new Map();
  for (const family of families) {
    if (nonemptyString(family.id) && !familiesById.has(family.id.trim())) {
      familiesById.set(family.id.trim(), family);
    }
  }
  const memberships = batchMemberships(batches);

  if (
    isRecord(ledger.initiative)
    && nonemptyString(ledger.initiative.current_batch)
    && !batchIds.has(ledger.initiative.current_batch.trim())
  ) {
    errors.push(`initiative.current_batch references unknown batch '${ledger.initiative.current_batch.trim()}'.`);
  }
  if (isRecord(ledger.initiative?.hub) && nonemptyString(ledger.initiative.hub.batch)) {
    const hubBatchId = ledger.initiative.hub.batch.trim();
    const hubBatch = batches.find((batch) => nonemptyString(batch.id) && batch.id.trim() === hubBatchId);
    if (!hubBatch) {
      errors.push(`initiative.hub.batch references unknown batch '${hubBatchId}'.`);
    } else if (
      batchStageSet.has(ledger.initiative.hub.stage)
      && batchStageSet.has(hubBatch.stage)
      && ledger.initiative.hub.stage !== hubBatch.stage
    ) {
      errors.push(
        `initiative.hub.stage '${ledger.initiative.hub.stage}' must match linked batch `
        + `'${hubBatchId}' stage '${hubBatch.stage}'.`,
      );
    }
  }

  batches.forEach((batch, batchIndex) => {
    if (!Array.isArray(batch.families)) return;
    batch.families.forEach((familyId, familyIndex) => {
      if (nonemptyString(familyId) && !familyIds.has(familyId.trim())) {
        errors.push(
          `batches[${batchIndex}].families[${familyIndex}] references unknown family '${familyId.trim()}'.`,
        );
      }
    });
  });

  families.forEach((family, familyIndex) => {
    if (!Array.isArray(family.prerequisites)) return;
    family.prerequisites.forEach((familyId, prerequisiteIndex) => {
      if (!nonemptyString(familyId)) return;
      const normalizedId = familyId.trim();
      if (!familyIds.has(normalizedId)) {
        errors.push(
          `families[${familyIndex}].prerequisites[${prerequisiteIndex}] references unknown family '${normalizedId}'.`,
        );
      } else if (nonemptyString(family.id) && normalizedId === family.id.trim()) {
        errors.push(`families[${familyIndex}].prerequisites cannot reference itself ('${normalizedId}').`);
      }
    });
  });

  validateNextAction(ledger.initiative?.next_action, familyIds, errors);
  const currentBatch = validateBatchLifecycle(ledger.initiative, batches, familiesById, errors);
  validateDependencySchedule({
    batches,
    families,
    familiesById,
    memberships,
    currentBatch,
    errors,
  });
  errors.push(...prerequisiteCycleErrors(families));
  return errors;
}

async function defaultFileExists(filePath) {
  try {
    return (await fs.stat(filePath)).isFile();
  } catch (error) {
    if (error.code === 'ENOENT' || error.code === 'ENOTDIR') return false;
    throw error;
  }
}

function absoluteRepoPath(projectRoot, repoPath) {
  const normalized = normalizeRepoRelativePath(repoPath);
  if (normalized === null) return null;
  return path.resolve(projectRoot, ...normalized.split('/'));
}

async function validateBaselineSource(ledger, {
  projectRoot,
  fileExists,
  readFile,
}) {
  const errors = [];
  const baseline = ledger?.baseline;
  if (!isRecord(baseline) || !nonemptyString(baseline.source)) return errors;
  const normalizedPath = normalizeRepoRelativePath(baseline.source);
  if (normalizedPath === null) return errors;
  const absolutePath = absoluteRepoPath(projectRoot, normalizedPath);

  let exists;
  try {
    exists = Boolean(await fileExists(absolutePath));
  } catch (error) {
    errors.push(`baseline.source '${normalizedPath}' could not be checked: ${error.message}`);
    return errors;
  }
  if (!exists) {
    errors.push(`baseline.source '${normalizedPath}' must exist.`);
    return errors;
  }

  let auditValues;
  try {
    const raw = await readFile(absolutePath, 'utf8');
    auditValues = parseFoundationalLearningAuditScope(
      Buffer.isBuffer(raw) ? raw.toString('utf8') : String(raw),
    );
  } catch (error) {
    errors.push(`baseline.source '${normalizedPath}' ${error.message}`);
    return errors;
  }

  for (const [field, label] of Object.entries(baselineAuditLabels)) {
    if (baseline[field] !== auditValues[field]) {
      errors.push(
        `baseline.${field} is ${baseline[field]}, but baseline.source '${normalizedPath}' `
        + `reports ${auditValues[field]} for '${label}'.`,
      );
    }
  }
  return errors;
}

async function validateOwnerFiles(ledger, {
  projectRoot,
  fileExists,
  readFile,
}) {
  const errors = [];
  if (!Array.isArray(ledger?.families)) return errors;

  for (const [index, family] of ledger.families.entries()) {
    if (!isRecord(family) || !isRecord(family.owner)) continue;
    if (!familyCoverageSet.has(family.coverage)) continue;
    if (!nonemptyString(family.owner.path) || !nonemptyString(family.owner.id)) continue;

    const normalizedPath = normalizeRepoRelativePath(family.owner.path);
    if (normalizedPath === null) continue;
    const absolutePath = absoluteRepoPath(projectRoot, normalizedPath);
    const required = requiredOwnerCoverageSet.has(family.coverage);

    let exists;
    try {
      exists = Boolean(await fileExists(absolutePath));
    } catch (error) {
      errors.push(`families[${index}].owner.path '${normalizedPath}' could not be checked: ${error.message}`);
      continue;
    }

    if (!exists) {
      if (required) {
        errors.push(
          `families[${index}].owner.path '${normalizedPath}' must exist for coverage '${family.coverage}'.`,
        );
      }
      continue;
    }

    let parsed;
    try {
      const raw = await readFile(absolutePath, 'utf8');
      parsed = matter(Buffer.isBuffer(raw) ? raw.toString('utf8') : String(raw));
    } catch (error) {
      errors.push(`families[${index}].owner.path '${normalizedPath}' could not be read: ${error.message}`);
      continue;
    }

    const expectedId = family.owner.id.trim();
    const actualId = parsed.data?.id;
    if (actualId !== expectedId) {
      errors.push(
        `families[${index}].owner.path '${normalizedPath}' has frontmatter id `
        + `'${actualId ?? ''}', expected '${expectedId}'.`,
      );
    }
    if (parsed.data?.page_type !== 'concept') {
      errors.push(
        `families[${index}].owner.path '${normalizedPath}' has frontmatter page_type `
        + `'${parsed.data?.page_type ?? ''}', expected 'concept'.`,
      );
    }
  }

  return errors;
}

async function validateCompleteHub(ledger, {
  projectRoot,
  fileExists,
  readFile,
}) {
  const errors = [];
  const hub = ledger?.initiative?.hub;
  if (!isRecord(hub) || hub.stage !== 'complete') return errors;
  if (!nonemptyString(hub.path) || !nonemptyString(hub.id)) return errors;
  const normalizedPath = normalizeRepoRelativePath(hub.path);
  if (normalizedPath === null) return errors;
  const absolutePath = absoluteRepoPath(projectRoot, normalizedPath);

  let exists;
  try {
    exists = Boolean(await fileExists(absolutePath));
  } catch (error) {
    errors.push(`initiative.hub.path '${normalizedPath}' could not be checked: ${error.message}`);
    return errors;
  }
  if (!exists) {
    errors.push(`initiative.hub.path '${normalizedPath}' must exist when hub.stage is 'complete'.`);
    return errors;
  }

  let parsed;
  try {
    const raw = await readFile(absolutePath, 'utf8');
    parsed = matter(Buffer.isBuffer(raw) ? raw.toString('utf8') : String(raw));
  } catch (error) {
    errors.push(`initiative.hub.path '${normalizedPath}' could not be read: ${error.message}`);
    return errors;
  }
  if (parsed.data?.id !== hub.id.trim()) {
    errors.push(
      `initiative.hub.path '${normalizedPath}' has frontmatter id `
      + `'${parsed.data?.id ?? ''}', expected '${hub.id.trim()}'.`,
    );
  }
  if (parsed.data?.page_type !== 'analysis') {
    errors.push(
      `initiative.hub.path '${normalizedPath}' has frontmatter page_type `
      + `'${parsed.data?.page_type ?? ''}', expected 'analysis'.`,
    );
  }
  return errors;
}

async function validateCompletedDeliverablesAndReadyDownstream(ledger, {
  projectRoot,
  fileExists,
}) {
  const errors = [];

  if (Array.isArray(ledger?.batches)) {
    for (const [batchIndex, batch] of ledger.batches.entries()) {
      if (!isRecord(batch) || batch.stage !== 'complete' || !Array.isArray(batch.deliverables)) continue;
      for (const [deliverableIndex, deliverable] of batch.deliverables.entries()) {
        const normalizedPath = normalizeRepoRelativePath(deliverable);
        if (normalizedPath === null) continue;
        try {
          if (!await fileExists(absoluteRepoPath(projectRoot, normalizedPath))) {
            errors.push(
              `batches[${batchIndex}].deliverables[${deliverableIndex}] '${normalizedPath}' `
              + `must exist because batch '${batch.id}' is complete.`,
            );
          }
        } catch (error) {
          errors.push(
            `batches[${batchIndex}].deliverables[${deliverableIndex}] '${normalizedPath}' `
            + `could not be checked: ${error.message}`,
          );
        }
      }
    }
  }

  if (Array.isArray(ledger?.families)) {
    for (const [familyIndex, family] of ledger.families.entries()) {
      if (!isRecord(family) || family.coverage !== 'ready' || !Array.isArray(family.downstream)) continue;
      for (const [downstreamIndex, downstream] of family.downstream.entries()) {
        const normalizedPath = normalizeRepoRelativePath(downstream);
        if (normalizedPath === null) continue;
        try {
          if (!await fileExists(absoluteRepoPath(projectRoot, normalizedPath))) {
            errors.push(
              `families[${familyIndex}].downstream[${downstreamIndex}] '${normalizedPath}' `
              + `must exist because family '${family.id}' is ready.`,
            );
          }
        } catch (error) {
          errors.push(
            `families[${familyIndex}].downstream[${downstreamIndex}] '${normalizedPath}' `
            + `could not be checked: ${error.message}`,
          );
        }
      }
    }
  }
  return errors;
}

/**
 * Validate a parsed ledger, including owner documents. The callbacks receive
 * absolute native paths so tests and other tools can inject a virtual file set.
 */
export async function validateMathNetworkLedger(ledger, {
  projectRoot = rootDir,
  fileExists = defaultFileExists,
  readFile = fs.readFile,
} = {}) {
  const structuralErrors = validateMathNetworkLedgerStructure(ledger);
  const resolvedProjectRoot = path.resolve(projectRoot);
  const baselineErrors = await validateBaselineSource(ledger, {
    projectRoot: resolvedProjectRoot,
    fileExists,
    readFile,
  });
  const ownerErrors = await validateOwnerFiles(ledger, {
    projectRoot: resolvedProjectRoot,
    fileExists,
    readFile,
  });
  const hubErrors = await validateCompleteHub(ledger, {
    projectRoot: resolvedProjectRoot,
    fileExists,
    readFile,
  });
  const completionErrors = await validateCompletedDeliverablesAndReadyDownstream(ledger, {
    projectRoot: resolvedProjectRoot,
    fileExists,
  });
  return [
    ...structuralErrors,
    ...baselineErrors,
    ...ownerErrors,
    ...hubErrors,
    ...completionErrors,
  ];
}

export function parseMathNetworkLedger(source, sourceLabel = DEFAULT_LEDGER_PATH) {
  let ledger;
  try {
    ledger = yaml.safeLoad(String(source));
  } catch (error) {
    throw new Error(`${sourceLabel}: invalid YAML: ${error.message}`);
  }
  if (!isRecord(ledger)) throw new Error(`${sourceLabel}: ledger root must be an object.`);
  return ledger;
}

function countValues(values, allowedValues) {
  const counts = Object.fromEntries(allowedValues.map((value) => [value, 0]));
  for (const value of values) {
    if (Object.hasOwn(counts, value)) counts[value] += 1;
  }
  return counts;
}

function compactInline(value) {
  return String(value ?? '').replace(/\s+/g, ' ').trim();
}

function buildHandoffStatus(handoff) {
  if (!isRecord(handoff)) return null;
  const validation = Array.isArray(handoff.validation)
    ? handoff.validation.map((entry) => ({
      command: entry.command,
      result: entry.result,
    }))
    : [];
  const validationSummary = validation.length === 0
    ? 'none recorded'
    : `${validation.length} recorded — ${validation
      .map((entry) => `${compactInline(entry.command)}: ${compactInline(entry.result)}`)
      .join(' | ')}`;

  return {
    updated: handoff.updated,
    baseline_commit: handoff.baseline_commit,
    last_completed_gate: handoff.last_completed_gate,
    notes: handoff.notes,
    validation,
    validation_summary: validationSummary,
  };
}

/** Build a small serializable snapshot suitable for another session or tool. */
export function buildMathNetworkStatus(ledger) {
  const batches = Array.isArray(ledger?.batches) ? ledger.batches : [];
  const families = Array.isArray(ledger?.families) ? ledger.families : [];
  const initiative = isRecord(ledger?.initiative) ? ledger.initiative : {};
  const currentBatch = batches.find((batch) => batch?.id === initiative.current_batch);
  const familiesById = new Map(families.map((family) => [family?.id, family]));
  const currentFamilies = Array.isArray(currentBatch?.families)
    ? currentBatch.families
      .map((id) => familiesById.get(id))
      .filter(Boolean)
      .map((family) => ({
        id: family.id,
        title: family.title,
        domain: family.domain,
        coverage: family.coverage,
        owner: family.owner,
      }))
    : [];

  return {
    schema_version: ledger?.schema_version,
    initiative: {
      id: initiative.id,
      title: initiative.title,
      hub: initiative.hub,
    },
    progress: {
      batches: {
        total: batches.length,
        ...countValues(batches.map((batch) => batch?.stage), BATCH_STAGES),
      },
      families: {
        total: families.length,
        ...countValues(families.map((family) => family?.coverage), FAMILY_COVERAGE),
      },
    },
    current_batch: currentBatch
      ? {
        id: currentBatch.id,
        title: currentBatch.title,
        stage: currentBatch.stage,
        families: currentFamilies,
        deliverables: currentBatch.deliverables,
      }
      : null,
    handoff: buildHandoffStatus(initiative.handoff),
    next_action: initiative.next_action,
    blockers: Array.isArray(initiative.blockers) ? initiative.blockers : [],
  };
}

function countSummary(counts, order) {
  return order
    .filter((key) => counts[key] > 0)
    .map((key) => `${key} ${counts[key]}`)
    .join(' · ') || 'none';
}

/** Render the cross-session snapshot as concise human-readable text. */
export function renderMathNetworkStatus(ledgerOrStatus) {
  const status = Object.hasOwn(ledgerOrStatus ?? {}, 'progress')
    ? ledgerOrStatus
    : buildMathNetworkStatus(ledgerOrStatus);
  const current = status.current_batch;
  const hub = status.initiative?.hub ?? {};
  const lines = [
    `${status.initiative?.title ?? 'LLM math network'} (${status.initiative?.id ?? '-'})`,
    `Hub: ${hub.path ?? '-'} [${hub.stage ?? '-'}]`,
  ];
  if (status.handoff) {
    const validations = Array.isArray(status.handoff.validation) ? status.handoff.validation : [];
    const latestValidation = validations.at(-1);
    const validationLine = latestValidation
      ? `${validations.length} recorded · latest ${compactInline(latestValidation.command)}: `
        + compactInline(latestValidation.result)
      : 'none recorded';
    lines.push(
      `Handoff: ${status.handoff.updated} · baseline ${status.handoff.baseline_commit} · `
      + `last gate ${status.handoff.last_completed_gate ?? 'none'}`,
      `Validation: ${validationLine}`,
      `Handoff notes: ${compactInline(status.handoff.notes)}`,
    );
  }
  lines.push(
    `Batches: ${countSummary(status.progress?.batches ?? {}, BATCH_STAGES)}`,
    `Families: ${countSummary(status.progress?.families ?? {}, FAMILY_COVERAGE)}`,
    `Current batch: ${current ? `${current.id} — ${current.title} [${current.stage}]` : 'none'}`,
  );

  if (current?.families?.length) {
    lines.push('Current families:');
    for (const family of current.families) {
      lines.push(`- ${family.id} — ${family.title} [${family.coverage}] → ${family.owner?.path ?? '-'}`);
    }
  }
  if (current?.deliverables?.length) {
    lines.push(`Deliverables: ${current.deliverables.join(', ')}`);
  }
  lines.push(`Next action: ${status.next_action ?? '-'}`);
  lines.push(`Blockers: ${status.blockers?.length ? status.blockers.join(' | ') : 'none'}`);
  return `${lines.join('\n')}\n`;
}

export function parseMathNetworkStatusArguments(argumentsList = []) {
  if (argumentsList.length === 0) return 'human';
  if (argumentsList.length === 1 && argumentsList[0] === '--check') return 'check';
  if (argumentsList.length === 1 && argumentsList[0] === '--json') return 'json';
  throw new Error('usage: node scripts/math-network-status.mjs [--check|--json]');
}

function resolveLedgerPath(projectRoot, ledgerPath) {
  if (path.isAbsolute(ledgerPath)) return ledgerPath;
  const normalized = normalizeRepoRelativePath(ledgerPath);
  if (normalized === null) throw new Error(`ledger path must be repo-relative: ${ledgerPath}`);
  return absoluteRepoPath(projectRoot, normalized);
}

export async function runMathNetworkStatus({
  mode = 'human',
  projectRoot = rootDir,
  ledgerPath = DEFAULT_LEDGER_PATH,
  fileExists = defaultFileExists,
  readFile = fs.readFile,
} = {}) {
  const resolvedRoot = path.resolve(projectRoot);
  const resolvedLedgerPath = resolveLedgerPath(resolvedRoot, ledgerPath);
  const source = await readFile(resolvedLedgerPath, 'utf8');
  const displayPath = path.relative(resolvedRoot, resolvedLedgerPath).replaceAll('\\', '/');
  const ledger = parseMathNetworkLedger(
    Buffer.isBuffer(source) ? source.toString('utf8') : String(source),
    displayPath,
  );
  const errors = await validateMathNetworkLedger(ledger, {
    projectRoot: resolvedRoot,
    fileExists,
    readFile,
  });
  if (errors.length > 0) {
    throw new Error(`${displayPath}: invalid math network ledger:\n${errors.map((error) => `- ${error}`).join('\n')}`);
  }

  const status = buildMathNetworkStatus(ledger);
  if (mode === 'check') {
    return {
      ledger,
      status,
      output: `${displayPath}: valid (${status.progress.batches.total} batches, ${status.progress.families.total} families)\n`,
    };
  }
  if (mode === 'json') return { ledger, status, output: `${JSON.stringify(status, null, 2)}\n` };
  if (mode === 'human') return { ledger, status, output: renderMathNetworkStatus(status) };
  throw new Error(`unknown mode: ${mode}`);
}

const scriptPath = fileURLToPath(import.meta.url);
const invokedPath = process.argv[1] ? path.resolve(process.argv[1]) : '';

if (invokedPath && path.normalize(invokedPath).toLowerCase() === path.normalize(scriptPath).toLowerCase()) {
  try {
    const mode = parseMathNetworkStatusArguments(process.argv.slice(2));
    const result = await runMathNetworkStatus({ mode });
    process.stdout.write(result.output);
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
