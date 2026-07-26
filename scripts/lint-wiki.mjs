import { createHash } from 'node:crypto';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';
import { createFrontmatterValidator, schemaErrorMessage } from './lib/frontmatter-schema.mjs';
import { registryErrorMessage, validateRegistry } from './lib/registry-schema.mjs';
import { metaDir, rootDir, wikiDir } from './lib/project-paths.mjs';
import {
  rawArtifactRecordNumberingErrors,
  sourcePageNumberingErrors,
} from './lib/source-numbering.mjs';
import {
  asArray,
  asStringArray,
  collator,
  createWikiLookup,
  extractWikiLinks,
  formatDate,
  loadMarkdownDocuments,
  normalizeWikiName,
  walkFiles,
} from './lib/wiki-utils.mjs';
import {
  brenndoerferSourceUrlsForArtifacts,
  missingBrenndoerferSourceUrls,
  pageRequiresStagedStructure,
  REQUIRE_STAGED_STRUCTURE_FOR_ALL_NON_META,
  strictStagedStructureEnabled,
  terminalDisplayMathPeriodLines,
  validateStagedPageStructure,
} from './lib/wiki-lint.mjs';

function expectedPageTypes(relativePath) {
  const parts = relativePath.split('/');
  if (parts.length === 1) return ['meta'];
  if (parts[0] === 'sources') return ['source', 'reference'];
  return [{ entities: 'entity', concepts: 'concept', analyses: 'analysis' }[parts[0]] ?? 'meta'];
}

function sourceSections(body) {
  return [...body.matchAll(/^## 출처\s*$/gm)].length;
}

function lastH2(body) {
  return [...body.matchAll(/^## (.+?)\s*$/gm)].at(-1)?.[1]?.trim() ?? '';
}

function relatedBodyLinks(body) {
  const matches = [...String(body).matchAll(/^##\s+.+?\s*$/gm)];
  const final = matches.at(-1);
  return final ? extractWikiLinks(String(body).slice(final.index)) : [];
}

async function loadYaml(filename) {
  return yaml.safeLoad(await fs.readFile(path.join(metaDir, filename), 'utf8'));
}

const [pageSchema, tagRegistry, evidenceRegistry, artifactRegistry, redLinkRegistry] = await Promise.all([
  fs.readFile(path.join(metaDir, 'page.schema.json'), 'utf8').then(JSON.parse),
  loadYaml('tags.yml'),
  loadYaml('evidence.yml'),
  loadYaml('raw-artifacts.yml'),
  loadYaml('red-links.yml'),
]);
const registrySchemaFiles = {
  'tags.yml': 'tags-v1.schema.json',
  'evidence.yml': 'evidence-v1.schema.json',
  'raw-artifacts.yml': 'raw-artifacts-v1.schema.json',
  'red-links.yml': 'red-links-v1.schema.json',
  'source-gaps.yml': 'source-gaps-v1.schema.json',
  'site-redirects.yml': 'site-redirects-v1.schema.json',
  'source-catalog.yml': 'source-catalog-v1.schema.json',
  'evidence-scope-baseline.yml': 'evidence-scope-baseline-v1.schema.json',
};
const registrySchemas = new Map(await Promise.all(Object.entries(registrySchemaFiles).map(async ([name, filename]) => (
  [name, JSON.parse(await fs.readFile(path.join(metaDir, 'schemas', filename), 'utf8'))]
))));
const [sourceGapRegistry, siteRedirectRegistry, sourceCatalogRegistry, evidenceScopeBaseline] = await Promise.all([
  loadYaml('source-gaps.yml'),
  loadYaml('site-redirects.yml'),
  loadYaml('source-catalog.yml'),
  loadYaml('evidence-scope-baseline.yml'),
]);
const allowedTags = new Set(Object.keys(tagRegistry.tags ?? {}));
const evidenceSources = evidenceRegistry.sources ?? {};
const artifactRecords = new Map((artifactRegistry.artifacts ?? []).map((item) => [String(item.path).replaceAll('\\', '/'), item]));
const allowedRedLinks = new Set(asArray(redLinkRegistry.allowed).map(normalizeWikiName));
const errors = [];
const warnings = [];
const strictStagedStructure = strictStagedStructureEnabled();
let legacyStructureCount = 0;

for (const [name, registry] of [
  ['tags.yml', tagRegistry],
  ['evidence.yml', evidenceRegistry],
  ['raw-artifacts.yml', artifactRegistry],
  ['red-links.yml', redLinkRegistry],
  ['source-gaps.yml', sourceGapRegistry],
  ['site-redirects.yml', siteRedirectRegistry],
  ['source-catalog.yml', sourceCatalogRegistry],
  ['evidence-scope-baseline.yml', evidenceScopeBaseline],
]) {
  if (registry?.schema_version !== 1) errors.push(`${name}: schema_version must be 1.`);
  const schema = registrySchemas.get(name);
  if (schema) {
    const result = validateRegistry(registry, schema);
    for (const error of result.errors) errors.push(`${name}: ${registryErrorMessage(error)}.`);
  }
}

const validateFrontmatter = createFrontmatterValidator(pageSchema);
const documents = await loadMarkdownDocuments(wikiDir);

const ids = new Map();
const categoryRank = ['concept', 'source', 'reference', 'analysis', 'entity', 'meta'];
const lookup = createWikiLookup(documents, {
  titleOf: (document) => document.data.title,
  aliasesOf: (document) => document.data.aliases,
  idOf: (document) => document.data.id,
  rankOf: (document) => categoryRank.indexOf(document.data.page_type),
});

for (const document of documents) {
  const data = document.data;
  const schemaResult = validateFrontmatter(data);
  if (!schemaResult.valid) {
    for (const error of schemaResult.errors) {
      errors.push(`${document.relativePath}: frontmatter ${schemaErrorMessage(error)}.`);
    }
  }
  if ('sources' in data || 'status' in data) errors.push(`${document.relativePath}: legacy sources/status field remains.`);
  const expected = expectedPageTypes(document.relativePath);
  if (!expected.includes(data.page_type)) errors.push(`${document.relativePath}: page_type '${data.page_type}' does not match '${expected.join(' or ')}'.`);
  if (typeof data.id === 'string' && typeof data.page_type === 'string' && !data.id.startsWith(`${data.page_type}.`)) {
    errors.push(`${document.relativePath}: id '${data.id}' must use the page_type namespace.`);
  }
  if (typeof data.id === 'string') {
    if (ids.has(data.id)) errors.push(`${document.relativePath}: duplicate id '${data.id}' also used by ${ids.get(data.id)}.`);
    else ids.set(data.id, document.relativePath);
  }
  const h1 = document.body.match(/^#\s+(.+)$/m)?.[1]?.trim();
  if (h1 !== String(data.title ?? '')) errors.push(`${document.relativePath}: H1 '${h1}' does not match title '${data.title}'.`);
  const created = formatDate(data.created);
  const updated = formatDate(data.updated);
  if (created > updated) errors.push(`${document.relativePath}: created date is after updated date.`);

  const tags = asStringArray(data.tags);
  for (const tag of tags) if (!allowedTags.has(tag)) errors.push(`${document.relativePath}: unregistered tag '${tag}'.`);
  if (tags.some((tag) => tag.startsWith('status/'))) errors.push(`${document.relativePath}: status tags are not allowed in schema v3.`);
  const typeTags = tags.filter((tag) => tag.startsWith('type/'));
  if (typeTags.length !== 1 || typeTags[0] !== `type/${data.page_type}`) errors.push(`${document.relativePath}: expected exactly one type/${data.page_type} tag.`);

  const artifacts = asStringArray(data.artifacts);
  for (const artifact of artifacts) {
    if (!artifactRecords.has(artifact)) errors.push(`${document.relativePath}: artifact '${artifact}' is not registered.`);
  }
  if (data.page_type === 'source') {
    for (const numberingError of sourcePageNumberingErrors({
      id: data.id,
      filename: document.filename,
      artifacts,
    })) {
      errors.push(`${document.relativePath}: ${numberingError}`);
    }
  }

  const evidence = Array.isArray(data.evidence) ? data.evidence : [];
  for (const item of evidence.filter((entry) => entry && typeof entry === 'object' && !Array.isArray(entry))) {
    if (!evidenceSources[item.source_id]) errors.push(`${document.relativePath}: unknown evidence source '${item.source_id}'.`);
  }

  const sections = sourceSections(document.body);
  if (data.page_type !== 'meta' && sections !== 1) errors.push(`${document.relativePath}: expected one ## 출처 section, found ${sections}.`);
  if (data.page_type !== 'meta') {
    const requireStagedStructure = REQUIRE_STAGED_STRUCTURE_FOR_ALL_NON_META || pageRequiresStagedStructure({
      created: data.created,
      pageType: data.page_type,
      id: data.id,
    }, { strict: strictStagedStructure });
    const structure = validateStagedPageStructure(document.body, {
      requireAll: requireStagedStructure,
    });
    if (!structure.staged && !requireStagedStructure) legacyStructureCount += 1;
    for (const error of structure.errors) errors.push(`${document.relativePath}: ${error}`);
  }
  if (data.page_type === 'source' || data.page_type === 'reference') {
    const provenanceUrls = brenndoerferSourceUrlsForArtifacts(artifacts, artifactRecords);
    if (data.page_type === 'source' && provenanceUrls.length === 0) {
      errors.push(`${document.relativePath}: source page must reference a raw artifact with Brenndoerfer source_url provenance.`);
    }
    const missingSourceUrls = missingBrenndoerferSourceUrls(document.body, artifacts, artifactRecords);
    for (const sourceUrl of missingSourceUrls) {
      errors.push(`${document.relativePath}: ## 출처 must directly include raw artifact source_url '${sourceUrl}'.`);
    }
  }
  if (lastH2(document.body) !== '관련 항목') errors.push(`${document.relativePath}: ## 관련 항목 must be the final H2.`);
  if (data.review?.evidence_coverage === 'verified' && /\[!WARNING\]/i.test(document.body)) errors.push(`${document.relativePath}: verified page contains an unresolved WARNING callout.`);
  if (/^## 인용할 만한 구절\s*$/m.test(document.body)) errors.push(`${document.relativePath}: generated quote section must be converted to 핵심 문장 or sourced quotes.`);
  if (data.page_type !== 'meta' && /^>\s*[“"']/m.test(document.body)) errors.push(`${document.relativePath}: quote block lacks the structured citation format.`);
  for (const lineNumber of terminalDisplayMathPeriodLines(document.body)) {
    errors.push(`${document.relativePath}: display math block ends with a period at line ${lineNumber}; move sentence punctuation outside the formula.`);
  }

}

const catalogById = new Map((sourceCatalogRegistry.sources ?? []).map((item) => [item.id, item]));
for (const document of documents) {
  if (!['source', 'reference'].includes(document.data.page_type)) continue;
  const record = catalogById.get(document.data.id);
  if (!record) errors.push(`source-catalog.yml: missing record for ${document.data.id}.`);
  else {
    if (record.path !== `wiki/${document.relativePath}`) errors.push(`source-catalog.yml: path mismatch for ${document.data.id}.`);
    if (record.title !== document.data.title) errors.push(`source-catalog.yml: title mismatch for ${document.data.id}.`);
  }
}
for (const record of sourceCatalogRegistry.sources ?? []) {
  if (!ids.has(record.id)) errors.push(`source-catalog.yml: unknown page id '${record.id}'.`);
}

const evidenceBaselineByFingerprint = new Map((evidenceScopeBaseline.entries ?? [])
  .map((entry) => [entry.fingerprint, entry]));
const currentEvidenceFingerprints = new Set();
for (const document of documents) {
  for (const evidence of Array.isArray(document.data.evidence) ? document.data.evidence : []) {
    const pageId = String(document.data.id ?? '').trim();
    const sourceId = String(evidence?.source_id ?? '').trim();
    const locator = String(evidence?.locator ?? '').trim();
    const relation = String(evidence?.relation ?? '').trim();
    const fingerprint = createHash('sha256')
      .update([pageId, sourceId, locator, relation].join('\u0000'))
      .digest('hex');
    currentEvidenceFingerprints.add(fingerprint);
    const baseline = evidenceBaselineByFingerprint.get(fingerprint);
    const scope = Array.isArray(evidence?.scope) ? evidence.scope : [];
    if (!baseline) {
      if (!scope.length) errors.push(`${document.relativePath}: new or changed evidence '${sourceId}' must declare scope.`);
      continue;
    }
    if (JSON.stringify(scope) !== JSON.stringify(baseline.scope ?? [])) {
      errors.push(`${document.relativePath}: evidence scope baseline is stale for '${sourceId}'. Run generate-evidence-scope-baseline.mjs.`);
    }
  }
}
for (const fingerprint of evidenceBaselineByFingerprint.keys()) {
  if (!currentEvidenceFingerprints.has(fingerprint)) {
    errors.push(`evidence-scope-baseline.yml: stale fingerprint '${fingerprint}'. Run generate-evidence-scope-baseline.mjs.`);
  }
}

if (legacyStructureCount) {
  warnings.push(`${legacyStructureCount} non-meta page(s) still use the legacy section structure.`);
}

function resolveLink(rawLink) {
  return lookup.resolve(rawLink).document;
}

for (const document of documents) {
  for (const rawLink of extractWikiLinks(document.body)) {
    const target = String(rawLink).split('|')[0].split('#')[0].trim();
    if (!resolveLink(rawLink) && !allowedRedLinks.has(normalizeWikiName(target))) errors.push(`${document.relativePath}: unresolved wiki link '${target}'.`);
  }
  const bodyRelated = [...new Set(relatedBodyLinks(document.body).map(resolveLink).filter(Boolean).map((item) => item.data.id))];
  const learning = document.data.learning ?? {};
  const learningTargets = [
    ...(Array.isArray(learning.prerequisites) ? learning.prerequisites : []),
    ...(Array.isArray(learning.next) ? learning.next : []),
  ].map((item) => String(item?.target ?? '').trim()).filter(Boolean);
  const relationTargets = (Array.isArray(document.data.relations) ? document.data.relations : [])
    .map((item) => String(item?.target ?? '').trim()).filter(Boolean);
  const expectedRelated = [...new Set([...learningTargets, ...relationTargets])];
  const missingInMetadata = bodyRelated.filter((id) => !expectedRelated.includes(id));
  const missingInBody = expectedRelated.filter((id) => !bodyRelated.includes(id));
  if (missingInMetadata.length || missingInBody.length) {
    errors.push(`${document.relativePath}: related projection mismatch (metadata missing: ${missingInMetadata.join(', ') || '-'}; body missing: ${missingInBody.join(', ') || '-'}).`);
  }
  const allRelationTargets = [...learningTargets, ...relationTargets];
  if (new Set(allRelationTargets).size !== allRelationTargets.length) errors.push(`${document.relativePath}: learning and relations contain duplicate targets.`);
  for (const id of allRelationTargets) {
    if (!ids.has(id)) errors.push(`${document.relativePath}: relation target '${id}' does not exist.`);
    if (id === document.data.id) errors.push(`${document.relativePath}: relation target must not point to itself.`);
  }
  if (document.data.page_type !== 'meta') {
    if (typeof learning.assumed_knowledge !== 'string') errors.push(`${document.relativePath}: learning.assumed_knowledge must be a string.`);
    if (!Array.isArray(learning.next) || learning.next.length < 1 || learning.next.length > 2) errors.push(`${document.relativePath}: learning.next must contain 1–2 documents.`);
    if (Array.isArray(learning.prerequisites) && learning.prerequisites.length > 2) errors.push(`${document.relativePath}: learning.prerequisites must contain at most 2 documents.`);
  }
}

const indexDocument = documents.find((document) => document.relativePath === 'index.md');
if (!indexDocument) errors.push('index.md is missing.');
else {
  const indexedCounts = new Map();
  for (const line of indexDocument.body.split(/\r?\n/)) {
    const rawLink = extractWikiLinks(line)[0];
    if (!rawLink) continue;
    const target = resolveLink(rawLink);
    if (!target || target.data.page_type === 'meta') continue;

    indexedCounts.set(target.data.id, (indexedCounts.get(target.data.id) ?? 0) + 1);
    const countMatch = line.match(/\(근거\s+(\d+)개\)\s*$/);
    const evidenceCount = Array.isArray(target.data.evidence) ? target.data.evidence.length : 0;
    if (!countMatch) errors.push(`index.md: '${target.data.title}' is missing its evidence count.`);
    else if (Number(countMatch[1]) !== evidenceCount) {
      errors.push(`index.md: '${target.data.title}' shows ${countMatch[1]} evidence record(s), expected ${evidenceCount}.`);
    }
  }

  for (const document of documents.filter((item) => item.data.page_type !== 'meta')) {
    const count = indexedCounts.get(document.data.id) ?? 0;
    if (count !== 1) errors.push(`index.md: expected page '${document.data.title}' (${document.data.id}) exactly once, found ${count}.`);
  }
}

const rawMarkdown = (await walkFiles(path.join(rootDir, 'raw'), '.md'))
  .map((absolute) => path.relative(rootDir, absolute).replaceAll('\\', '/'))
  .filter((relative) => relative !== 'raw/README.md')
  .sort(collator.compare);
for (const relative of rawMarkdown) if (!artifactRecords.has(relative)) errors.push(`${relative}: raw artifact is not registered.`);
for (const [relative, record] of artifactRecords) {
  for (const numberingError of rawArtifactRecordNumberingErrors(record)) {
    errors.push(`${relative}: ${numberingError}`);
  }
  const sourceUrl = String(record.source_url ?? '').trim();
  try {
    const parsed = new URL(sourceUrl);
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') throw new Error('unsupported protocol');
  } catch {
    errors.push(`${relative}: raw artifact source_url must be an absolute HTTP(S) URL.`);
  }
  const absolute = path.join(rootDir, ...relative.split('/'));
  try {
    const content = await fs.readFile(absolute);
    const hash = createHash('sha256').update(content).digest('hex');
    if (hash !== String(record.sha256)) errors.push(`${relative}: SHA-256 differs from raw-artifacts.yml.`);
  } catch {
    errors.push(`${relative}: registered raw artifact does not exist.`);
  }
}

for (const [name, matches] of lookup.named) {
  const unique = [...new Set(matches.map((item) => item.data.id))];
  if (unique.length > 1 && !lookup.exact.has(name)) warnings.push(`Ambiguous alias/title '${name}' maps to ${unique.join(', ')}.`);
}

if (warnings.length) {
  console.warn(`Wiki lint warnings (${warnings.length}):`);
  for (const warning of warnings.slice(0, 20)) console.warn(`- ${warning}`);
}

if (errors.length) {
  console.error(`Wiki lint failed with ${errors.length} error(s):`);
  for (const error of errors.slice(0, 80)) console.error(`- ${error}`);
  if (errors.length > 80) console.error(`- ...and ${errors.length - 80} more`);
  process.exitCode = 1;
} else {
  console.log(`Wiki lint passed for ${documents.length} Markdown documents.`);
  console.log(`Validated ${Object.keys(evidenceSources).length} evidence records and ${artifactRecords.size} immutable raw artifacts.`);
}
