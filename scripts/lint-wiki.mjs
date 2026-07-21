import { createHash } from 'node:crypto';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';
import { createFrontmatterValidator, schemaErrorMessage } from './lib/frontmatter-schema.mjs';
import { metaDir, rootDir, wikiDir } from './lib/project-paths.mjs';
import { sourcePageNumberingErrors } from './lib/source-numbering.mjs';
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
  const marker = '\n## 관련 항목';
  const index = body.lastIndexOf(marker);
  return index < 0 ? [] : extractWikiLinks(body.slice(index + marker.length));
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
]) {
  if (registry?.schema_version !== 1) errors.push(`${name}: schema_version must be 1.`);
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
  if (tags.some((tag) => tag.startsWith('status/'))) errors.push(`${document.relativePath}: status tags are not allowed in schema v2.`);
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
  if (data.verification === 'verified' && /\[!WARNING\]/i.test(document.body)) errors.push(`${document.relativePath}: verified page contains an unresolved WARNING callout.`);
  if (/^## 인용할 만한 구절\s*$/m.test(document.body)) errors.push(`${document.relativePath}: generated quote section must be converted to 핵심 문장 or sourced quotes.`);
  if (data.page_type !== 'meta' && /^>\s*[“"']/m.test(document.body)) errors.push(`${document.relativePath}: quote block lacks the structured citation format.`);

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
  const frontmatterRelated = asStringArray(document.data.related);
  const missingInFrontmatter = bodyRelated.filter((id) => !frontmatterRelated.includes(id));
  const missingInBody = frontmatterRelated.filter((id) => !bodyRelated.includes(id));
  if (missingInFrontmatter.length || missingInBody.length) {
    errors.push(`${document.relativePath}: related frontmatter/body mismatch (frontmatter missing: ${missingInFrontmatter.join(', ') || '-'}; body missing: ${missingInBody.join(', ') || '-'}).`);
  }
  for (const id of frontmatterRelated) if (!ids.has(id)) errors.push(`${document.relativePath}: related id '${id}' does not exist.`);
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
