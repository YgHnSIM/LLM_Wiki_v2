import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(scriptDir, '..');
const wikiDir = path.join(rootDir, 'wiki');
const today = '2026-07-15';
const collator = new Intl.Collator('ko', { numeric: true, sensitivity: 'base' });

async function walkMarkdown(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const files = await Promise.all(entries.map(async (entry) => {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) return walkMarkdown(absolute);
    return entry.isFile() && entry.name.endsWith('.md') ? [absolute] : [];
  }));
  return files.flat();
}

function asArray(value) {
  if (Array.isArray(value)) return value;
  if (value === undefined || value === null || value === '') return [];
  return [value];
}

function normalizeDate(value, fallback) {
  if (value instanceof Date && !Number.isNaN(value.valueOf())) return value.toISOString().slice(0, 10);
  const text = String(value ?? '').slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(text) ? text : fallback;
}

function normalizeName(value = '') {
  return String(value)
    .replace(/\.md$/i, '')
    .normalize('NFKC')
    .trim()
    .replace(/\s+/g, ' ')
    .toLocaleLowerCase('ko');
}

function slugify(value = '') {
  return String(value)
    .normalize('NFKC')
    .toLocaleLowerCase('ko')
    .replace(/[’']/g, '')
    .replace(/[^\p{Letter}\p{Number}]+/gu, '-')
    .replace(/^-+|-+$/g, '') || 'page';
}

function pageTypeFor(relativePath, data = {}) {
  const parts = relativePath.split('/');
  if (parts.length === 1) return 'meta';
  if (parts[0] === 'sources') {
    const tags = asArray(data.tags).map(String);
    return data.page_type === 'reference' || tags.includes('type/reference') ? 'reference' : 'source';
  }
  return {
    entities: 'entity',
    concepts: 'concept',
    analyses: 'analysis',
  }[parts[0]] ?? 'meta';
}

function idFor(document) {
  if (document.data.id) return String(document.data.id);
  if (document.pageType === 'source') {
    const number = document.filename.match(/^(\d{3})/)?.[1];
    if (number) return `source.${number}`;
  }
  return `${document.pageType}.${slugify(document.title)}`;
}

function artifactPath(value) {
  const normalized = String(value).replaceAll('\\', '/').replace(/^\.\//, '');
  return normalized.startsWith('raw/') ? normalized : `raw/${normalized}`;
}

const baseEvidence = {
  '001': [{ source_id: 'shannon-1948', locator: 'Part I, §§2–3 and §6', relation: 'supports' }],
  '002': [{ source_id: 'turing-1950', locator: 'pp. 433–460, §§1–7', relation: 'supports' }],
  '003': [{ source_id: 'macdonald-1963', locator: 'pp. 1–4', relation: 'supports' }],
  '004': [{ source_id: 'rosenblatt-1958', locator: 'pp. 386–408', relation: 'supports' }],
  '005': [{ source_id: 'chomsky-1957', locator: 'chapters 2–10', relation: 'supports' }],
  '006': [{ source_id: 'widrow-lehr-1990', locator: 'pp. 1415–1433', relation: 'supports' }],
  '007': [{ source_id: 'weizenbaum-1966', locator: 'pp. 36–45', relation: 'supports' }],
};

function addEvidence(target, item) {
  if (!target.some((entry) => entry.source_id === item.source_id && entry.locator === item.locator)) {
    target.push(item);
  }
}

function derivedEvidence(document, artifacts) {
  if (document.pageType === 'meta') return [];
  const result = [];
  for (const artifact of artifacts) {
    const prefix = path.posix.basename(artifact).match(/^(\d{3})/)?.[1];
    for (const entry of baseEvidence[prefix] ?? []) addEvidence(result, { ...entry });
  }

  const title = document.title;
  if (/Smoothing|데이터 희소성|슬라바 카츠/.test(title)) {
    addEvidence(result, { source_id: 'katz-1987', locator: 'pp. 400–401', relation: 'supports' });
    addEvidence(result, { source_id: 'chen-goodman-1998', locator: 'chapters 2–4', relation: 'supplements' });
  }
  if (/튜링|모방 게임|행동 기반 지능 기준/.test(title)) {
    addEvidence(result, { source_id: 'jones-2026', locator: 'Methods and Results', relation: 'contextualizes' });
  }
  if (/퍼셉트론|프랭크 로젠블랫/.test(title)) {
    addEvidence(result, { source_id: 'novikoff-1963', locator: 'pp. 91–104', relation: 'supplements' });
  }
  if (/XOR/.test(title)) {
    addEvidence(result, { source_id: 'minsky-papert-1969', locator: 'chapters 1 and 13', relation: 'supports' });
  }
  if (/대규모 언어 모델|N-gram에서 LLM|규칙 기반 AI에서 데이터 기반 학습/.test(title)) {
    addEvidence(result, { source_id: 'gpt-2018', locator: '§§2–3', relation: 'contextualizes' });
    addEvidence(result, { source_id: 'bert-2019', locator: '§3', relation: 'contextualizes' });
  }
  if (/행동주의 언어관|B\.F\. 스키너|인지 혁명/.test(title)) {
    addEvidence(result, { source_id: 'chomsky-1959', locator: 'pp. 26–58', relation: 'supports' });
  }
  if (/변형생성문법|심층 구조|표층 구조|노엄 촘스키|촘스키에서 LLM/.test(title)) {
    addEvidence(result, { source_id: 'chomsky-1965', locator: 'chapters 1–2', relation: 'supports' });
  }
  if (/보편문법|자극의 빈곤/.test(title)) {
    addEvidence(result, { source_id: 'chomsky-1965', locator: 'chapter 1', relation: 'supports' });
    addEvidence(result, { source_id: 'chomsky-1981', locator: 'chapters 1–2', relation: 'contextualizes' });
  }
  if (/촘스키 위계|문맥자유문법|유한상태 모델/.test(title)) {
    addEvidence(result, { source_id: 'chomsky-1956', locator: 'pp. 113–124', relation: 'supports' });
  }
  if (/파싱/.test(title)) {
    addEvidence(result, { source_id: 'earley-1970', locator: 'pp. 94–102', relation: 'supplements' });
  }
  if (/ADALINE|LMS 알고리즘|경사하강법|버나드 위드로|마션 호프/.test(title)) {
    addEvidence(result, { source_id: 'widrow-hoff-1960', locator: 'Adaptive Switching Circuits', relation: 'supports' });
  }
  if (/MADALINE|퍼셉트론에서 MADALINE/.test(title)) {
    addEvidence(result, { source_id: 'widrow-winter-1988', locator: 'pp. 1-401–1-408', relation: 'supports' });
  }
  if (/적응 필터/.test(title)) {
    addEvidence(result, { source_id: 'widrow-1975', locator: 'pp. 1692–1716', relation: 'supports' });
  }
  if (title === '음성 활동 감지') {
    result.length = 0;
    addEvidence(result, { source_id: 'sohn-1999', locator: 'pp. 1–3', relation: 'supports' });
  }
  if (/ELIZA|DOCTOR|패턴 매칭|템플릿 기반 응답 생성|대화 복구|조지프 바이젠바움/.test(title)) {
    addEvidence(result, { source_id: 'mit-eliza-1965', locator: 'ELIZA source and DOCTOR script records', relation: 'supplements' });
  }
  if (title === '중국어 방 논증') {
    result.length = 0;
    addEvidence(result, { source_id: 'searle-1980', locator: 'pp. 417–457, 특히 pp. 417–424', relation: 'supports' });
  }
  return result;
}

function verificationFor(document) {
  if (document.data.verification) return String(document.data.verification);
  if (document.pageType === 'analysis') return 'partial';
  if (document.pageType === 'meta') return 'verified';
  if (/보편문법|자극의 빈곤|인지 혁명|행동 기반 지능 기준|ELIZA 효과/.test(document.title)) return 'partial';
  return 'verified';
}

function relatedLinks(body) {
  const marker = '\n## 관련 항목';
  const index = body.lastIndexOf(marker);
  if (index < 0) return [];
  const section = body.slice(index + marker.length);
  return [...section.matchAll(/\[\[([^\]\n]+)\]\]/g)].map((match) => match[1]);
}

const markdownFiles = (await walkMarkdown(wikiDir)).sort(collator.compare);
const documents = await Promise.all(markdownFiles.map(async (absolutePath) => {
  const raw = await fs.readFile(absolutePath, 'utf8');
  const parsed = matter(raw);
  const relativePath = path.relative(wikiDir, absolutePath).replaceAll('\\', '/');
  const filename = path.basename(relativePath, '.md');
  const firstHeading = parsed.content.match(/^#\s+(.+)$/m)?.[1]?.trim();
  const title = String(parsed.data.title ?? firstHeading ?? filename);
  const pageType = pageTypeFor(relativePath, parsed.data);
  return { absolutePath, relativePath, filename, parsed, data: parsed.data, title, pageType };
}));

for (const document of documents) document.id = idFor(document);

const exactLookup = new Map();
const namedLookup = new Map();
const categoryRank = ['concept', 'source', 'reference', 'analysis', 'entity', 'meta'];

function addLookup(name, document) {
  const key = normalizeName(name);
  if (!key) return;
  const list = namedLookup.get(key) ?? [];
  if (!list.includes(document)) list.push(document);
  namedLookup.set(key, list);
}

for (const document of documents) {
  exactLookup.set(normalizeName(document.filename), document);
  addLookup(document.filename, document);
  addLookup(document.title, document);
  for (const alias of asArray(document.data.aliases)) addLookup(alias, document);
}

function resolveLink(rawLink) {
  const target = String(rawLink).split('|')[0].split('#')[0].trim();
  const basename = path.posix.basename(target.replaceAll('\\', '/')).replace(/\.md$/i, '');
  const key = normalizeName(basename);
  if (exactLookup.has(key)) return exactLookup.get(key);
  const candidates = [...(namedLookup.get(key) ?? [])].sort(
    (a, b) => categoryRank.indexOf(a.pageType) - categoryRank.indexOf(b.pageType),
  );
  return candidates[0] ?? null;
}

let changed = 0;
for (const document of documents) {
  const aliases = [...new Set(asArray(document.data.aliases).map(String))]
    .filter((alias) => normalizeName(alias) !== normalizeName(document.title));
  const rawTags = asArray(document.data.tags).map(String).filter((tag) => !tag.startsWith('status/'));
  const typeTag = `type/${document.pageType}`;
  const tags = [typeTag, ...rawTags.filter((tag) => !tag.startsWith('type/'))];
  const artifacts = [...new Set(asArray(document.data.artifacts ?? document.data.sources).map(artifactPath))];
  const existingEvidence = asArray(document.data.evidence).filter((entry) => entry && typeof entry === 'object');
  const evidence = existingEvidence.length ? existingEvidence : derivedEvidence(document, artifacts);
  const related = [...new Set(relatedLinks(document.parsed.content)
    .map(resolveLink)
    .filter((target) => target && target !== document)
    .map((target) => target.id))];

  const data = {
    schema_version: 2,
    id: document.id,
    page_type: document.pageType,
    title: document.title,
    aliases,
    tags,
    created: normalizeDate(document.data.created, today),
    updated: today,
    lifecycle: document.data.lifecycle ?? (document.data.status === 'archived' ? 'archived' : 'active'),
    verification: verificationFor(document),
    artifacts,
    evidence,
    related,
  };

  const output = `${matter.stringify(document.parsed.content.trimStart(), data).trimEnd()}\n`;
  const current = await fs.readFile(document.absolutePath, 'utf8');
  if (current !== output) {
    await fs.writeFile(document.absolutePath, output, 'utf8');
    changed += 1;
  }
}

console.log(`Migrated ${changed} of ${documents.length} Markdown documents to schema v2.`);
