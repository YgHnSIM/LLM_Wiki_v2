import { promises as fs } from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import yaml from 'js-yaml';
import { createHash } from 'node:crypto';
import { rootDir, wikiDir } from './lib/project-paths.mjs';

const writeMode = process.argv.includes('--write');
const reportFlag = process.argv.indexOf('--report');
const reportPath = reportFlag >= 0 ? process.argv[reportFlag + 1] : 'docs/page-v3-migration-report.json';

const pageTypeByDirectory = {
  sources: ['source', 'reference'],
  concepts: ['concept'],
  entities: ['entity'],
  analyses: ['analysis'],
};
const levelOrder = ['foundation', 'introductory', 'intermediate', 'advanced', 'preprofessional'];
const levelMap = {
  '입문': ['introductory', 'introductory'],
  '중급': ['intermediate', 'intermediate'],
  '심화': ['advanced', 'advanced'],
  '기초 → 중급': ['foundation', 'intermediate'],
  '기초 → 심화': ['foundation', 'advanced'],
  '입문–중급': ['introductory', 'intermediate'],
  '입문 → 중급': ['introductory', 'intermediate'],
  '입문 → 준전문가': ['introductory', 'preprofessional'],
  '중급 → 준전문가 입문': ['intermediate', 'preprofessional'],
  '중급 → 심화': ['intermediate', 'advanced'],
};

function normalize(value) {
  return String(value ?? '').normalize('NFKC').trim().replace(/\s+/g, ' ').toLocaleLowerCase('ko');
}

function titleFromFilename(filename) {
  return filename.replace(/\.md$/i, '');
}

function linksIn(value) {
  return [...String(value ?? '').matchAll(/\[\[([^\]\n]+)\]\]/g)].map((match) => match[1]);
}

function parseLink(value) {
  const raw = String(value ?? '');
  const pipe = raw.indexOf('|');
  const target = (pipe >= 0 ? raw.slice(0, pipe) : raw).trim();
  const label = pipe >= 0 ? raw.slice(pipe + 1).trim() : '';
  const hash = target.indexOf('#');
  return {
    target: (hash >= 0 ? target.slice(0, hash) : target).trim(),
    label,
  };
}

function stripLinks(value) {
  return String(value ?? '')
    .replace(/\[\[([^\]|#]+)(?:\|([^\]]+))?\]\]/g, (_match, target, label) => label || target)
    .replace(/<br\s*\/?>(?=\s|$)/gi, ' ')
    .replace(/[*_`]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function blockquoteLines(value) {
  return String(value ?? '').split(/\r?\n/).map((line) => line.replace(/^\s*>\s?/, ''));
}

function readLearningGuide(body) {
  const match = String(body).match(/>\s*\[!note\]\s*학습 안내([\s\S]*?)(?=\n\n##\s)/);
  const lines = blockquoteLines(match?.[0] ?? '');
  const values = {};
  for (const line of lines) {
    const field = line.match(/\*\*([^*]+):\*\*\s*(.*)$/);
    if (!field) continue;
    const key = field[1].trim();
    const value = field[2].replace(/<br\s*\/?>(?:\s*)$/i, '').trim();
    if (key.includes('난이도')) values.difficulty = value;
    else if (key.includes('선수')) values.prerequisitesText = value;
    else if (key.includes('읽고')) values.outcome = stripLinks(value);
  }
  return values;
}

function parseDifficulty(value, id) {
  const normalized = String(value ?? '').replace(/\s+/g, ' ').trim();
  const mapped = levelMap[normalized];
  if (mapped) return { entry: mapped[0], target: mapped[1] };
  throw new Error(`${id}: unsupported difficulty value '${normalized}'.`);
}

function cleanAssumedKnowledge(value, linkCount) {
  if (linkCount) {
    const remainder = String(value ?? '').replace(/\[\[[^\]]+\]\]/g, '').replace(/[,:;·]/g, ' ');
    const cleaned = stripLinks(remainder).replace(/^없음\s*[—-]?\s*/u, '').trim();
    return cleaned === '없음' ? '' : cleaned;
  }
  const cleaned = stripLinks(value).replace(/^없음\s*[—-]?\s*/u, '').trim();
  return cleaned === '없음' ? '' : cleaned;
}

function prerequisiteLinks(value) {
  const text = String(value ?? '').trim();
  if (/^없음\b/u.test(text)) return [];
  const beforeReason = text.split(/\s+[—–-]\s+/u)[0];
  return linksIn(beforeReason);
}

function reasonAfterLink(line, linkEnd) {
  const tail = String(line).slice(linkEnd).replace(/^\s*[-–—:]\s*/, '').trim();
  return stripLinks(tail);
}

function parseNextBlock(body) {
  const heading = String(body).match(/\n### 다음 문서\s*\n/);
  if (!heading) return [];
  const start = heading.index + heading[0].length;
  const tail = String(body).slice(start);
  const end = tail.search(/\n##\s|\n###\s/);
  const block = end >= 0 ? tail.slice(0, end) : tail;
  const results = [];
  for (const line of block.split(/\r?\n/)) {
    const link = linksIn(line)[0];
    if (!link) continue;
    const match = line.match(/\[\[[^\]]+\]\]/);
    results.push({ raw: parseLink(link), reason: reasonAfterLink(line, match?.index ?? line.length) });
  }
  return results;
}

function parseFallbackNext(body) {
  const section = String(body).match(/## 학습 확인([\s\S]*?)(?=\n## 출처\s*$)/m)?.[1] ?? '';
  const sentences = section.split(/(?<=[.!?。])\s+|\n+/);
  const results = [];
  for (const sentence of sentences) {
    if (!/(다음|이어|뒤에|읽어)/u.test(sentence)) continue;
    for (const link of linksIn(sentence)) results.push({ raw: parseLink(link), reason: stripLinks(sentence).replace(/\s+/g, ' ') });
  }
  if (!results.length) {
    for (const link of linksIn(section)) results.push({ raw: parseLink(link), reason: '학습 확인 뒤의 후속 문서 연결.' });
  }
  return results;
}

function getTargetResolver(documents) {
  const byId = new Map();
  const byName = new Map();
  const addName = (name, document) => {
    const key = normalize(name);
    if (!key) return;
    const list = byName.get(key) ?? [];
    if (!list.includes(document)) list.push(document);
    byName.set(key, list);
  };
  for (const document of documents) {
    byId.set(normalize(document.data.id), document);
    addName(document.filename, document);
    addName(document.data.title, document);
    for (const alias of document.data.aliases ?? []) addName(alias, document);
  }
  return (value) => {
    const parsed = parseLink(value);
    const idMatch = byId.get(normalize(parsed.target));
    if (idMatch) return idMatch;
    const matches = byName.get(normalize(parsed.target)) ?? [];
    if (matches.length === 1) return matches[0];
    return matches[0] ?? null;
  };
}

function pageTitle(document) {
  return String(document.data.title ?? document.filename);
}

function targetObject(document, reason = '') {
  if (!document) return null;
  const item = { target: String(document.data.id) };
  if (reason) item.reason = reason;
  return item;
}

function addUnique(list, item) {
  if (!item || list.some((existing) => existing.target === item.target)) return;
  list.push(item);
}

function reviewFor(data) {
  if (data.page_type === 'meta') return { evidence_coverage: 'not-applicable', content_mode: 'descriptive' };
  if (data.verification === 'disputed') return { evidence_coverage: 'verified', content_mode: 'contested' };
  if (data.verification === 'partial') {
    return { evidence_coverage: 'partial', content_mode: data.page_type === 'analysis' ? 'synthesis' : 'descriptive' };
  }
  if (data.verification === 'unverified') return { evidence_coverage: 'unverified', content_mode: 'descriptive' };
  return { evidence_coverage: 'verified', content_mode: 'descriptive' };
}

function renderedGuide(learning, resolve) {
  const difficultyLabels = {
    foundation: '기초', introductory: '입문', intermediate: '중급', advanced: '심화', preprofessional: '준전문가',
  };
  const difficulty = learning.difficulty.entry === learning.difficulty.target
    ? difficultyLabels[learning.difficulty.entry]
    : `${difficultyLabels[learning.difficulty.entry]} → ${difficultyLabels[learning.difficulty.target]}`;
  const prereq = learning.prerequisites.map((item) => {
    const document = resolve(item.target);
    return document ? `[[${document.data.id}|${pageTitle(document)}]]` : item.target;
  });
  const prereqText = prereq.length ? prereq.join(', ') : (learning.assumed_knowledge ? `없음 — ${learning.assumed_knowledge}` : '없음');
  return [
    '> [!note] 학습 안내',
    `> **난이도:** ${difficulty}<br>`,
    `> **선수 지식:** ${prereqText}<br>`,
    `> **읽고 나면:** ${learning.outcomes[0]}`,
  ].join('\n');
}

function renderNext(learning, resolve) {
  const lines = learning.next.map((item) => {
    const document = resolve(item.target);
    const link = document ? `[[${document.data.id}|${pageTitle(document)}]]` : `[[${item.target}]]`;
    const label = document ? pageTitle(document) : '';
    const rawReason = String(item.reason ?? '').trim();
    const reason = label && rawReason.startsWith(`${label} — `) ? rawReason.slice(label.length + 3).trim() : rawReason;
    return `- ${link}${reason ? ` — ${reason}` : ''}`;
  });
  return `### 다음 문서\n\n${lines.join('\n')}`;
}

function renderRelated(data, resolve) {
  const targets = [];
  for (const item of data.learning?.next ?? []) addUnique(targets, item);
  for (const item of data.learning?.prerequisites ?? []) addUnique(targets, item);
  for (const item of data.relations ?? []) addUnique(targets, item);
  const lines = targets.map((item) => {
    const document = resolve(item.target);
    const link = document ? `[[${document.data.id}|${pageTitle(document)}]]` : `[[${item.target}]]`;
    return `- ${link}`;
  });
  return `## 관련 항목\n\n${lines.join('\n')}`;
}

function projectBody(body, data, resolve) {
  let projected = String(body).trim();
  const guide = renderedGuide(data.learning, resolve);
  if (/^>\s*\[!note\]\s*학습 안내/m.test(projected)) {
    projected = projected.replace(/^>\s*\[!note\]\s*학습 안내[\s\S]*?(?=\n\n##\s)/m, guide);
  }
  const next = renderNext(data.learning, resolve);
  if (/\n### 다음 문서\s*\n/.test(projected)) {
    projected = projected.replace(/\n### 다음 문서\s*\n[\s\S]*?(?=\n##\s)/, `\n${next}\n`);
  } else {
    projected = projected.replace(/\n## 출처\s*\n/, `\n${next}\n\n## 출처\n`);
  }
  projected = projected.replace(/\n## 관련 항목[\s\S]*$/, `\n${renderRelated(data, resolve)}`);
  return `${projected.trim()}\n`;
}

function migrateDocument(document, resolve, allDocuments) {
  const old = document.data;
  const guide = readLearningGuide(document.body);
  const prerequisiteCandidates = prerequisiteLinks(guide.prerequisitesText ?? '').map(resolve).filter(Boolean);
  const prerequisites = [];
  for (const candidate of prerequisiteCandidates.slice(0, 2)) addUnique(prerequisites, targetObject(candidate));
  const assumedKnowledge = cleanAssumedKnowledge(guide.prerequisitesText ?? '', prerequisiteCandidates.length);

  let nextCandidates = [...parseNextBlock(document.body), ...parseFallbackNext(document.body)];
  const next = [];
  for (const candidate of nextCandidates) {
    const target = resolve(candidate.raw.target);
    if (!target || target.data.id === old.id || prerequisites.some((item) => item.target === target.data.id)) continue;
    addUnique(next, targetObject(target, candidate.reason));
  }

  const title = pageTitle(document);
  const overrideTitle = title.includes('데이터의 양에서 권리와 책임까지')
    ? '문맥은 저장소인가'
    : title.includes('학습 데이터 생애주기와 출처 추적')
      ? '데이터의 양에서 권리와 책임까지'
      : title.includes('LLM 추론 에너지 지표')
        ? '전력에서 서비스 결과 계약까지'
        : '';
  if (!next.length && overrideTitle) {
    const override = allDocuments.find((candidate) => pageTitle(candidate).includes(overrideTitle));
    if (override) addUnique(next, targetObject(override, '학습 경로의 다음 질문으로 이어진다.'));
  }
  if (old.page_type !== 'meta' && !next.length) throw new Error(`${old.id}: could not determine a next document.`);

  const relations = [];
  for (const related of old.related ?? []) {
    const target = resolve(related);
    if (!target || target.data.id === old.id) continue;
    if (prerequisites.some((item) => item.target === target.data.id) || next.some((item) => item.target === target.data.id)) continue;
    if (!relations.some((item) => item.target === target.data.id)) relations.push({ target: target.data.id, kind: 'related' });
  }
  const overflowPrerequisites = prerequisiteCandidates.slice(2);
  for (const target of overflowPrerequisites) {
    if (!target || relations.some((item) => item.target === target.data.id)) continue;
    relations.push({ target: target.data.id, kind: 'background' });
  }
  for (const candidate of nextCandidates) {
    const target = resolve(candidate.raw.target);
    if (!target || next.some((item) => item.target === target.data.id) || prerequisites.some((item) => item.target === target.data.id)) continue;
    if (!relations.some((item) => item.target === target.data.id)) relations.push({ target: target.data.id, kind: 'further-reading', ...(candidate.reason ? { note: candidate.reason } : {}) });
  }

  const evidence = (old.evidence ?? []).map((item) => ({
    source_id: String(item.source_id).trim(),
    locator: String(item.locator).trim(),
    relation: String(item.relation).trim(),
    ...(item.scope ? { scope: item.scope } : {}),
  }));
  const data = {
    schema_version: 3,
    id: old.id,
    page_type: old.page_type,
    title: old.title,
    aliases: [...new Set((old.aliases ?? []).map(String).map((item) => item.trim()).filter(Boolean))],
    tags: [...new Set((old.tags ?? []).map(String).map((item) => item.trim()).filter(Boolean))],
    created: old.created,
    updated: old.updated,
    editorial_status: old.lifecycle,
    review: reviewFor(old),
    artifacts: [...new Set((old.artifacts ?? []).map(String))],
    evidence,
    relations,
  };
  if (old.page_type !== 'meta') {
    data.learning = {
      difficulty: parseDifficulty(guide.difficulty, old.id),
      prerequisites: prerequisites.slice(0, 2),
      assumed_knowledge: assumedKnowledge || '없음',
      outcomes: [guide.outcome || '본문의 핵심 개념과 근거를 설명할 수 있다.'],
      next: next.slice(0, 2),
    };
    for (const target of prerequisiteCandidates.slice(2)) {
      if (!target || data.relations.some((item) => item.target === target.data.id)) continue;
      data.relations.push({ target: target.data.id, kind: 'background' });
    }
  }
  const content = old.page_type === 'meta' ? document.body : projectBody(document.body, data, resolve);
  return { data, content };
}

async function markdownFiles(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map(async (entry) => {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) return markdownFiles(absolute);
    return entry.isFile() && entry.name.endsWith('.md') ? [absolute] : [];
  }));
  return nested.flat();
}
const files = await markdownFiles(wikiDir);

const documents = (await Promise.all(files.map(async (absolutePath) => {
  const raw = await fs.readFile(absolutePath, 'utf8');
  const parsed = matter(raw);
  return {
    absolutePath,
    relativePath: path.relative(wikiDir, absolutePath).replaceAll('\\', '/'),
    filename: titleFromFilename(path.basename(absolutePath)),
    raw,
    body: parsed.content,
    data: parsed.data,
  };
}))).sort((left, right) => left.relativePath.localeCompare(right.relativePath, 'ko'));
const alreadyMigrated = documents.filter((document) => document.data.schema_version === 3);
if (alreadyMigrated.length === documents.length) {
  const report = {
    schema_version: 1,
    mode: writeMode ? 'write' : 'check',
    documents: documents.length,
    converted: [],
    skipped: documents.map((document) => ({ path: document.relativePath, id: document.data.id })),
    unresolved: [],
    source_hashes: Object.fromEntries(documents.map((document) => [
      document.relativePath,
      createHash('sha256').update(document.raw).digest('hex'),
    ])),
  };
  await fs.mkdir(path.dirname(path.join(rootDir, reportPath)), { recursive: true });
  await fs.writeFile(path.join(rootDir, reportPath), `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  console.log(`Page v3 migration is already complete for ${documents.length} page(s); no files changed.`);
  process.exit(0);
}
if (alreadyMigrated.length) {
  throw new Error(`Mixed schema versions detected: ${alreadyMigrated.length}/${documents.length} page(s) are already v3.`);
}
const resolve = getTargetResolver(documents);
const report = {
  schema_version: 1,
  mode: writeMode ? 'write' : 'check',
  documents: documents.length,
  converted: [],
  unresolved: [],
  source_hashes: {},
};

const outputs = [];
for (const document of documents) {
  try {
    const migrated = migrateDocument(document, resolve, documents);
    const serialized = matter.stringify(migrated.content, migrated.data, { lineWidth: -1, noRefs: true });
    outputs.push({ document, serialized, data: migrated.data });
    report.converted.push({ path: document.relativePath, id: migrated.data.id, evidence: migrated.data.evidence.length });
    report.source_hashes[document.relativePath] = createHash('sha256').update(document.raw).digest('hex');
  } catch (error) {
    report.unresolved.push({ path: document.relativePath, error: error.message });
  }
}

await fs.mkdir(path.dirname(path.join(rootDir, reportPath)), { recursive: true });
await fs.writeFile(path.join(rootDir, reportPath), `${JSON.stringify(report, null, 2)}\n`, 'utf8');
if (report.unresolved.length) {
  console.error(`Page v3 migration has ${report.unresolved.length} unresolved document(s).`);
  for (const item of report.unresolved) console.error(`- ${item.path}: ${item.error}`);
  process.exitCode = 1;
} else if (writeMode) {
  for (const output of outputs) await fs.writeFile(output.document.absolutePath, output.serialized, 'utf8');
  console.log(`Migrated ${outputs.length} page(s) to schema v3.`);
} else {
  console.log(`Page v3 migration check passed for ${outputs.length} page(s). Run with --write to apply.`);
}
