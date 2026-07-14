import { createHash } from 'node:crypto';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';
import yaml from 'js-yaml';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(scriptDir, '..');
const wikiDir = path.join(rootDir, 'wiki');
const metaDir = path.join(wikiDir, 'meta');
const collator = new Intl.Collator('ko', { numeric: true, sensitivity: 'base' });
const requiredFields = ['schema_version', 'id', 'page_type', 'title', 'aliases', 'tags', 'created', 'updated', 'lifecycle', 'verification', 'artifacts', 'evidence', 'related'];
const lifecycleValues = new Set(['draft', 'active', 'archived']);
const verificationValues = new Set(['unverified', 'partial', 'verified', 'disputed']);
const relationValues = new Set(['supports', 'supplements', 'contextualizes', 'disputes']);

async function walk(directory, extension = '') {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const files = await Promise.all(entries.map(async (entry) => {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) return walk(absolute, extension);
    return entry.isFile() && (!extension || entry.name.endsWith(extension)) ? [absolute] : [];
  }));
  return files.flat();
}

function asArray(value) {
  if (Array.isArray(value)) return value;
  if (value === undefined || value === null || value === '') return [];
  return [value];
}

function normalizeName(value = '') {
  return String(value)
    .replace(/\.md$/i, '')
    .normalize('NFKC')
    .trim()
    .replace(/\s+/g, ' ')
    .toLocaleLowerCase('ko');
}

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

function extractWikiLinks(body) {
  return [...body.matchAll(/\[\[([^\]\n]+)\]\]/g)].map((match) => match[1]);
}

function relatedBodyLinks(body) {
  const marker = '\n## 관련 항목';
  const index = body.lastIndexOf(marker);
  return index < 0 ? [] : extractWikiLinks(body.slice(index + marker.length));
}

function dateString(value) {
  if (value instanceof Date && !Number.isNaN(value.valueOf())) return value.toISOString().slice(0, 10);
  return String(value ?? '');
}

async function loadYaml(filename) {
  return yaml.safeLoad(await fs.readFile(path.join(metaDir, filename), 'utf8'));
}

const [tagRegistry, evidenceRegistry, artifactRegistry, redLinkRegistry] = await Promise.all([
  loadYaml('tags.yml'),
  loadYaml('evidence.yml'),
  loadYaml('raw-artifacts.yml'),
  loadYaml('red-links.yml'),
]);
const allowedTags = new Set(Object.keys(tagRegistry.tags ?? {}));
const evidenceSources = evidenceRegistry.sources ?? {};
const artifactRecords = new Map((artifactRegistry.artifacts ?? []).map((item) => [String(item.path).replaceAll('\\', '/'), item]));
const allowedRedLinks = new Set(asArray(redLinkRegistry.allowed).map(normalizeName));
const errors = [];
const warnings = [];

const markdownFiles = (await walk(wikiDir, '.md')).sort(collator.compare);
const documents = await Promise.all(markdownFiles.map(async (absolutePath) => {
  const raw = await fs.readFile(absolutePath, 'utf8');
  const parsed = matter(raw);
  const relativePath = path.relative(wikiDir, absolutePath).replaceAll('\\', '/');
  const filename = path.basename(relativePath, '.md');
  return { absolutePath, relativePath, filename, raw, body: parsed.content.trim(), data: parsed.data };
}));

const ids = new Map();
const exactLookup = new Map();
const namedLookup = new Map();
const categoryRank = ['concept', 'source', 'reference', 'analysis', 'entity', 'meta'];

function addNamed(name, document) {
  const key = normalizeName(name);
  if (!key) return;
  const list = namedLookup.get(key) ?? [];
  if (!list.includes(document)) list.push(document);
  namedLookup.set(key, list);
}

for (const document of documents) {
  const data = document.data;
  for (const field of requiredFields) {
    if (!(field in data)) errors.push(`${document.relativePath}: missing frontmatter field '${field}'.`);
  }
  if ('sources' in data || 'status' in data) errors.push(`${document.relativePath}: legacy sources/status field remains.`);
  if (data.schema_version !== 2) errors.push(`${document.relativePath}: schema_version must be 2.`);
  const expected = expectedPageTypes(document.relativePath);
  if (!expected.includes(data.page_type)) errors.push(`${document.relativePath}: page_type '${data.page_type}' does not match '${expected.join(' or ')}'.`);
  if (!String(data.id ?? '').startsWith(`${data.page_type}.`) && data.page_type !== 'source') {
    errors.push(`${document.relativePath}: id '${data.id}' must use the page_type namespace.`);
  }
  if (data.page_type === 'source' && !String(data.id ?? '').startsWith('source.')) errors.push(`${document.relativePath}: source id must use source.*.`);
  if (ids.has(data.id)) errors.push(`${document.relativePath}: duplicate id '${data.id}' also used by ${ids.get(data.id)}.`);
  else ids.set(data.id, document.relativePath);
  const h1 = document.body.match(/^#\s+(.+)$/m)?.[1]?.trim();
  if (h1 !== String(data.title ?? '')) errors.push(`${document.relativePath}: H1 '${h1}' does not match title '${data.title}'.`);
  const created = dateString(data.created);
  const updated = dateString(data.updated);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(created) || !/^\d{4}-\d{2}-\d{2}$/.test(updated)) errors.push(`${document.relativePath}: dates must use YYYY-MM-DD.`);
  if (created > updated) errors.push(`${document.relativePath}: created date is after updated date.`);
  if (!lifecycleValues.has(data.lifecycle)) errors.push(`${document.relativePath}: invalid lifecycle '${data.lifecycle}'.`);
  if (!verificationValues.has(data.verification)) errors.push(`${document.relativePath}: invalid verification '${data.verification}'.`);

  const tags = asArray(data.tags).map(String);
  for (const tag of tags) if (!allowedTags.has(tag)) errors.push(`${document.relativePath}: unregistered tag '${tag}'.`);
  if (tags.some((tag) => tag.startsWith('status/'))) errors.push(`${document.relativePath}: status tags are not allowed in schema v2.`);
  const typeTags = tags.filter((tag) => tag.startsWith('type/'));
  if (typeTags.length !== 1 || typeTags[0] !== `type/${data.page_type}`) errors.push(`${document.relativePath}: expected exactly one type/${data.page_type} tag.`);

  const artifacts = asArray(data.artifacts).map(String);
  for (const artifact of artifacts) {
    if (!artifact.startsWith('raw/')) errors.push(`${document.relativePath}: artifact '${artifact}' must start with raw/.`);
    if (!artifactRecords.has(artifact)) errors.push(`${document.relativePath}: artifact '${artifact}' is not registered.`);
  }

  const evidence = asArray(data.evidence);
  if (data.page_type !== 'meta' && evidence.length === 0) errors.push(`${document.relativePath}: non-meta page requires evidence.`);
  for (const [index, item] of evidence.entries()) {
    if (!item || typeof item !== 'object') {
      errors.push(`${document.relativePath}: evidence[${index}] must be an object.`);
      continue;
    }
    if (!evidenceSources[item.source_id]) errors.push(`${document.relativePath}: unknown evidence source '${item.source_id}'.`);
    if (!String(item.locator ?? '').trim()) errors.push(`${document.relativePath}: evidence '${item.source_id}' has an empty locator.`);
    if (!relationValues.has(item.relation)) errors.push(`${document.relativePath}: evidence '${item.source_id}' has invalid relation '${item.relation}'.`);
  }

  const sections = sourceSections(document.body);
  if (data.page_type !== 'meta' && sections !== 1) errors.push(`${document.relativePath}: expected one ## 출처 section, found ${sections}.`);
  if (lastH2(document.body) !== '관련 항목') errors.push(`${document.relativePath}: ## 관련 항목 must be the final H2.`);
  if (data.verification === 'verified' && /\[!WARNING\]/i.test(document.body)) errors.push(`${document.relativePath}: verified page contains an unresolved WARNING callout.`);
  if (/^## 인용할 만한 구절\s*$/m.test(document.body)) errors.push(`${document.relativePath}: generated quote section must be converted to 핵심 문장 or sourced quotes.`);
  if (data.page_type !== 'meta' && /^>\s*[“"']/m.test(document.body)) errors.push(`${document.relativePath}: quote block lacks the structured citation format.`);

  exactLookup.set(normalizeName(document.filename), document);
  addNamed(document.filename, document);
  addNamed(data.title, document);
  for (const alias of asArray(data.aliases)) addNamed(alias, document);
}

function resolveLink(rawLink) {
  const targetPart = String(rawLink).split('|')[0].split('#')[0].trim();
  const basename = path.posix.basename(targetPart.replaceAll('\\', '/')).replace(/\.md$/i, '');
  const key = normalizeName(basename);
  if (exactLookup.has(key)) return exactLookup.get(key);
  const candidates = [...(namedLookup.get(key) ?? [])].sort(
    (a, b) => categoryRank.indexOf(a.data.page_type) - categoryRank.indexOf(b.data.page_type),
  );
  return candidates[0] ?? null;
}

for (const document of documents) {
  for (const rawLink of extractWikiLinks(document.body)) {
    const target = String(rawLink).split('|')[0].split('#')[0].trim();
    if (!resolveLink(rawLink) && !allowedRedLinks.has(normalizeName(target))) errors.push(`${document.relativePath}: unresolved wiki link '${target}'.`);
  }
  const bodyRelated = [...new Set(relatedBodyLinks(document.body).map(resolveLink).filter(Boolean).map((item) => item.data.id))];
  const frontmatterRelated = asArray(document.data.related).map(String);
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
  const indexed = new Set(extractWikiLinks(indexDocument.body).map(resolveLink).filter(Boolean).map((item) => item.data.id));
  for (const document of documents.filter((item) => item.data.page_type !== 'meta')) {
    if (!indexed.has(document.data.id)) errors.push(`index.md: missing page '${document.data.title}' (${document.data.id}).`);
  }
}

const rawMarkdown = (await walk(path.join(rootDir, 'raw'), '.md'))
  .map((absolute) => path.relative(rootDir, absolute).replaceAll('\\', '/'))
  .filter((relative) => relative !== 'raw/README.md')
  .sort(collator.compare);
for (const relative of rawMarkdown) if (!artifactRecords.has(relative)) errors.push(`${relative}: raw artifact is not registered.`);
for (const [relative, record] of artifactRecords) {
  const absolute = path.join(rootDir, ...relative.split('/'));
  try {
    const content = await fs.readFile(absolute);
    const hash = createHash('sha256').update(content).digest('hex');
    if (hash !== String(record.sha256)) errors.push(`${relative}: SHA-256 differs from raw-artifacts.yml.`);
  } catch {
    errors.push(`${relative}: registered raw artifact does not exist.`);
  }
}

for (const [name, matches] of namedLookup) {
  const unique = [...new Set(matches.map((item) => item.data.id))];
  if (unique.length > 1 && !exactLookup.has(name)) warnings.push(`Ambiguous alias/title '${name}' maps to ${unique.join(', ')}.`);
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
