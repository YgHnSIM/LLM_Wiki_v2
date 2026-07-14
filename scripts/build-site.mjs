import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';
import yaml from 'js-yaml';
import katex from 'katex';
import { marked } from 'marked';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(scriptDir, '..');
const wikiDir = path.join(rootDir, 'wiki');
const siteDir = path.join(rootDir, 'site');
const distDir = path.join(rootDir, 'dist');
const repositoryUrl = 'https://github.com/YgHnSIM/LLM_Wiki_v2';
const basePath = normalizeBasePath(process.env.BASE_PATH ?? '');
const collator = new Intl.Collator('ko', { numeric: true, sensitivity: 'base' });

const categoryMeta = {
  sources: {
    label: '원문 노트',
    singular: '원문 노트',
    description: 'AI와 언어 기술의 초기 논문·시연·프로그램을 한국어로 정리한 원문 기반 노트입니다.',
  },
  concepts: {
    label: '개념',
    singular: '개념',
    description: '소스에서 등장한 모델, 알고리즘, 평가 기준과 언어학 개념을 서로 연결합니다.',
  },
  entities: {
    label: '인물·기관',
    singular: '인물·기관',
    description: '연구의 방향을 만든 연구자와 대학, 연구기관, 기업을 모았습니다.',
  },
  analyses: {
    label: '비교 읽기',
    singular: '비교 읽기',
    description: '서로 다른 시기의 아이디어를 현대 LLM의 질문과 나란히 읽는 비교 문서입니다.',
  },
  meta: {
    label: '안내',
    singular: '안내',
    description: '위키의 범위와 작업 기록입니다.',
  },
};

marked.setOptions({ gfm: true, breaks: false });

function normalizeBasePath(value) {
  const cleaned = String(value).trim().replace(/^\/+|\/+$/g, '');
  return cleaned ? `/${cleaned}` : '';
}

function sitePath(pathname = '/') {
  const normalized = pathname.startsWith('/') ? pathname : `/${pathname}`;
  return `${basePath}${normalized}`;
}

function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function slugify(value = '') {
  return String(value)
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[’']/g, '')
    .replace(/[^\p{Letter}\p{Number}]+/gu, '-')
    .replace(/^-+|-+$/g, '') || 'page';
}

function normalizeLookup(value = '') {
  return String(value)
    .replace(/\.md$/i, '')
    .normalize('NFKC')
    .trim()
    .replace(/\s+/g, ' ')
    .toLocaleLowerCase('ko');
}

function asArray(value) {
  if (Array.isArray(value)) return value.map(String);
  if (value === undefined || value === null || value === '') return [];
  return [String(value)];
}

function asObjectArray(value) {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item) => item && typeof item === 'object' && !Array.isArray(item))
    .map((item) => ({
      sourceId: String(item.source_id ?? '').trim(),
      locator: String(item.locator ?? '').trim(),
      relation: String(item.relation ?? '').trim(),
    }))
    .filter((item) => item.sourceId);
}

function formatDate(value) {
  if (!value) return '';
  if (value instanceof Date && !Number.isNaN(value.valueOf())) {
    return value.toISOString().slice(0, 10);
  }
  return String(value).slice(0, 10);
}

function stripMarkdown(markdown = '') {
  return String(markdown)
    .replace(/```[\s\S]*?```|~~~[\s\S]*?~~~/g, ' ')
    .replace(/\[\[([^\]]+)\]\]/g, (_match, inside) => {
      const [target, label] = inside.split('|');
      return label?.trim() || target.split('#')[0].trim();
    })
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/^\s*#{1,6}\s*/gm, '')
    .replace(/^\s*>\s?/gm, '')
    .replace(/^\s*[-*+]\s+/gm, '')
    .replace(/^\s*\d+\.\s+/gm, '')
    .replace(/_/g, ' ')
    .replace(/(\d)~(?=\d)/g, '$1–')
    .replace(/[~*]/g, '')
    .replace(/\$+/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function firstParagraph(markdown = '') {
  const blocks = String(markdown)
    .replace(/^#\s+.*(?:\r?\n)+/, '')
    .split(/\r?\n\s*\r?\n/)
    .map((block) => block.trim())
    .filter(Boolean);

  const candidate = blocks.find((block) => {
    const plain = stripMarkdown(block);
    return !/^(#{1,6}|```|~~~|>|[-*+]\s|\d+\.\s)/.test(block) && plain.length >= 30;
  });

  return stripMarkdown(candidate ?? markdown);
}

function truncate(value, maxLength = 190) {
  const text = String(value).trim();
  if (text.length <= maxLength) return text;
  const clipped = text.slice(0, maxLength + 1);
  const boundary = Math.max(clipped.lastIndexOf(' '), clipped.lastIndexOf('.'), clipped.lastIndexOf('다.'));
  return `${clipped.slice(0, boundary > maxLength * 0.65 ? boundary + 1 : maxLength).trim()}…`;
}

function readingMinutes(markdown = '') {
  return Math.max(1, Math.ceil(stripMarkdown(markdown).length / 700));
}

async function walkMarkdown(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const files = await Promise.all(entries.map(async (entry) => {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) return walkMarkdown(absolute);
    return entry.isFile() && entry.name.endsWith('.md') ? [absolute] : [];
  }));
  return files.flat();
}

function routeFor(relativePath, category, filename) {
  const normalized = relativePath.replaceAll('\\', '/');
  if (normalized === 'index.md') return '/';
  if (normalized === 'overview.md') return '/about/';
  if (normalized === 'log.md') return '/log/';
  return `/${category}/${slugify(filename)}/`;
}

const evidenceRegistryFile = path.join(wikiDir, 'meta', 'evidence.yml');
const evidenceRegistryData = yaml.safeLoad(await fs.readFile(evidenceRegistryFile, 'utf8')) ?? {};
const evidenceRegistry = new Map(Object.entries(evidenceRegistryData.sources ?? {}));
const markdownFiles = await walkMarkdown(wikiDir);
const documents = await Promise.all(markdownFiles.map(async (absolutePath) => {
  const raw = await fs.readFile(absolutePath, 'utf8');
  const parsed = matter(raw);
  const relativePath = path.relative(wikiDir, absolutePath).replaceAll('\\', '/');
  const parts = relativePath.split('/');
  const filename = path.basename(parts.at(-1), '.md');
  const category = parts.length > 1 && categoryMeta[parts[0]] ? parts[0] : 'meta';
  const firstHeading = parsed.content.match(/^#\s+(.+)$/m)?.[1]?.trim();
  const title = String(parsed.data.title ?? firstHeading ?? filename);

  return {
    id: String(parsed.data.id ?? relativePath.replace(/\.md$/i, '')),
    absolutePath,
    relativePath,
    filename,
    category,
    pageType: String(parsed.data.page_type ?? ({
      sources: 'source',
      concepts: 'concept',
      entities: 'entity',
      analyses: 'analysis',
      meta: 'meta',
    }[category] ?? 'meta')),
    title,
    aliases: asArray(parsed.data.aliases),
    tags: asArray(parsed.data.tags),
    artifacts: asArray(parsed.data.artifacts),
    evidence: asObjectArray(parsed.data.evidence),
    related: asArray(parsed.data.related),
    lifecycle: String(parsed.data.lifecycle ?? 'active'),
    verification: String(parsed.data.verification ?? 'unverified'),
    created: formatDate(parsed.data.created),
    updated: formatDate(parsed.data.updated),
    body: parsed.content.trim(),
    url: routeFor(relativePath, category, filename),
    sourceNumber: category === 'sources' ? filename.match(/^(\d{3})/)?.[1] ?? '' : '',
    excerpt: truncate(firstParagraph(parsed.content), 210),
    minutes: readingMinutes(parsed.content),
    outgoing: [],
    backlinks: [],
    relatedDocuments: [],
    relatedBacklinks: [],
    meaningfulOutgoing: [],
    meaningfulBacklinks: [],
  };
}));

documents.sort((a, b) => collator.compare(a.relativePath, b.relativePath));

const exactLookup = new Map();
const namedLookup = new Map();
const idLookup = new Map();

function addNamedLookup(name, document) {
  const key = normalizeLookup(name);
  if (!key) return;
  const existing = namedLookup.get(key) ?? [];
  if (!existing.includes(document)) existing.push(document);
  namedLookup.set(key, existing);
}

for (const document of documents) {
  idLookup.set(normalizeLookup(document.id), document);
  exactLookup.set(normalizeLookup(document.filename), document);
  addNamedLookup(document.filename, document);
  addNamedLookup(document.title, document);
  for (const alias of document.aliases) addNamedLookup(alias, document);
}

for (const document of documents) {
  document.evidence = document.evidence.map((entry) => ({
    ...entry,
    source: evidenceRegistry.get(entry.sourceId) ?? null,
  }));
  document.relatedDocuments = document.related
    .map((id) => idLookup.get(normalizeLookup(id)))
    .filter((item) => item && item !== document && item.category !== 'meta');
}

for (const document of documents) {
  for (const relatedDocument of document.relatedDocuments) {
    relatedDocument.relatedBacklinks.push(document);
  }
}

const categoryRank = ['concepts', 'sources', 'analyses', 'entities', 'meta'];

function resolveWikiTarget(value) {
  const rawTarget = String(value).split('|')[0].trim();
  const hashIndex = rawTarget.indexOf('#');
  const targetWithPath = hashIndex >= 0 ? rawTarget.slice(0, hashIndex) : rawTarget;
  const heading = hashIndex >= 0 ? rawTarget.slice(hashIndex + 1).trim() : '';
  const basename = path.posix.basename(targetWithPath.replaceAll('\\', '/')).replace(/\.md$/i, '');
  const key = normalizeLookup(basename);
  const exact = exactLookup.get(key);
  if (exact) return { document: exact, heading };

  const candidates = [...(namedLookup.get(key) ?? [])].sort(
    (a, b) => categoryRank.indexOf(a.category) - categoryRank.indexOf(b.category),
  );
  return { document: candidates[0] ?? null, heading };
}

function extractWikiLinks(markdown) {
  return [...String(markdown).matchAll(/\[\[([^\]\n]+)\]\]/g)].map((match) => match[1]);
}

const unresolved = new Map();
let resolvedLinkCount = 0;

for (const document of documents) {
  const outgoing = new Set();
  for (const rawLink of extractWikiLinks(document.body)) {
    const targetName = rawLink.split('|')[0].split('#')[0].trim();
    const resolved = resolveWikiTarget(rawLink);
    if (resolved.document) {
      resolvedLinkCount += 1;
      if (resolved.document !== document) outgoing.add(resolved.document);
    } else {
      const record = unresolved.get(targetName) ?? { target: targetName, count: 0, from: new Set() };
      record.count += 1;
      record.from.add(document.relativePath);
      unresolved.set(targetName, record);
    }
  }
  document.outgoing = [...outgoing];
}

for (const document of documents) {
  for (const target of document.outgoing) target.backlinks.push(document);
}

for (const document of documents) {
  document.backlinks.sort((a, b) => collator.compare(a.title, b.title));
  document.meaningfulOutgoing = [...new Set([
    ...document.outgoing.filter((item) => item !== document && item.category !== 'meta'),
    ...document.relatedDocuments,
  ])];
  document.meaningfulBacklinks = [...new Set([
    ...document.backlinks.filter((item) => item !== document && item.category !== 'meta'),
    ...document.relatedBacklinks.filter((item) => item !== document && item.category !== 'meta'),
  ])].sort((a, b) => collator.compare(a.title, b.title));
}

const grouped = Object.fromEntries(Object.keys(categoryMeta).map((key) => [key, []]));
for (const document of documents) grouped[document.category].push(document);
for (const list of Object.values(grouped)) {
  list.sort((a, b) => {
    if (a.sourceNumber || b.sourceNumber) return collator.compare(a.sourceNumber, b.sourceNumber);
    return collator.compare(a.title, b.title);
  });
}

const publishedDocuments = ['sources', 'concepts', 'entities', 'analyses'].flatMap((key) => grouped[key]);
const latestUpdate = documents.map((document) => document.updated).filter(Boolean).sort().at(-1) ?? '';

function lifecycleLabel(lifecycle) {
  return lifecycle === 'draft' ? '초안' : lifecycle === 'archived' ? '보관됨' : '공개';
}

function verificationLabel(verification) {
  return {
    verified: '검증됨',
    partial: '부분 검증',
    disputed: '논쟁 중',
    unverified: '미검증',
  }[verification] ?? verification;
}

function verificationBadge(documentOrStatus) {
  const status = typeof documentOrStatus === 'string' ? documentOrStatus : documentOrStatus.verification;
  return `<span class="verification-badge verification-badge--${escapeHtml(status)}" data-verification="${escapeHtml(status)}">${escapeHtml(verificationLabel(status))}</span>`;
}

function relationLabel(relation) {
  return {
    supports: '지지',
    supplements: '보완',
    contextualizes: '맥락',
    disputes: '반박',
  }[relation] ?? relation;
}

function externalLink(href, label, className = '') {
  const classAttribute = className ? ` class="${escapeHtml(className)}"` : '';
  return `<a${classAttribute} href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer">${escapeHtml(label)}<span class="sr-only"> (새 창)</span></a>`;
}

function tagLabel(tag) {
  const labels = {
    'domain/ai': 'AI',
    'domain/nlp': 'NLP',
    'domain/conversational-ai': '대화형 AI',
  };
  return labels[tag] ?? tag.replace(/^domain\//, '').replaceAll('-', ' ');
}

function publicTags(document) {
  return document.tags.filter((tag) => !/^(type|status)\//.test(tag)).slice(0, 4);
}

function renderTags(document) {
  const tags = publicTags(document);
  if (!tags.length) return '';
  return `<ul class="tag-list" aria-label="태그">${tags.map((tag) => `<li><a class="tag-chip" href="${sitePath(`/search/?tag=${encodeURIComponent(tag)}`)}" data-tag="${escapeHtml(tag)}">${escapeHtml(tagLabel(tag))}</a></li>`).join('')}</ul>`;
}

function markdownWithoutTitle(markdown) {
  return String(markdown).replace(/^#\s+.*(?:\r?\n)+/, '').trim();
}

function headingPlan(markdown) {
  const used = new Map();
  return String(markdown).split(/\r?\n/).flatMap((line) => {
    const match = line.match(/^(#{2,4})\s+(.+?)\s*#*$/);
    if (!match) return [];
    const label = stripMarkdown(match[2]);
    const base = slugify(label);
    const seen = used.get(base) ?? 0;
    used.set(base, seen + 1);
    return [{ depth: match[1].length, label, id: seen ? `${base}-${seen + 1}` : base }];
  });
}

function renderMath(expression, displayMode) {
  const rendered = katex.renderToString(expression.trim(), {
    displayMode,
    throwOnError: false,
    strict: false,
    output: 'htmlAndMathml',
  });
  return displayMode ? `<div class="math-display">${rendered}</div>` : `<span class="math-inline">${rendered}</span>`;
}

function renderWikiLinks(markdown, currentDocument) {
  return String(markdown).replace(/\[\[([^\]\n]+)\]\]/g, (_match, inside) => {
    const [targetPart, explicitLabel] = inside.split('|');
    const cleanTarget = targetPart.trim();
    const targetWithoutHeading = cleanTarget.split('#')[0].trim();
    const label = explicitLabel?.trim() || targetWithoutHeading;
    const resolved = resolveWikiTarget(inside);

    if (!resolved.document) {
      return `<span class="wiki-link wiki-link--missing" title="아직 작성되지 않은 문서">${escapeHtml(label)}</span>`;
    }

    if (resolved.document === currentDocument) {
      return `<strong class="wiki-link wiki-link--self">${escapeHtml(label)}</strong>`;
    }

    const hash = resolved.heading ? `#${slugify(resolved.heading)}` : '';
    return `<a class="wiki-link" href="${sitePath(resolved.document.url)}${hash}">${escapeHtml(label)}</a>`;
  });
}

function renderMarkdown(document) {
  const markdown = markdownWithoutTitle(document.body);
  const headings = headingPlan(markdown);
  const protectedFragments = [];
  const protect = (fragment) => {
    const token = `@@LLMWIKI_FRAGMENT_${protectedFragments.length}@@`;
    protectedFragments.push(fragment);
    return token;
  };

  let prepared = markdown.replace(/```[\s\S]*?```|~~~[\s\S]*?~~~|`[^`\n]+`/g, (fragment) => protect(fragment));
  prepared = prepared.replace(/\$\$([\s\S]+?)\$\$/g, (_match, expression) => protect(renderMath(expression, true)));
  prepared = prepared.replace(/\\\[([\s\S]+?)\\\]/g, (_match, expression) => protect(renderMath(expression, true)));
  prepared = prepared.replace(/\\\((.+?)\\\)/g, (_match, expression) => protect(renderMath(expression, false)));
  prepared = prepared.replace(/(^|[^\\$])\$([^$\n]+?)\$/g, (_match, prefix, expression) => `${prefix}${protect(renderMath(expression, false))}`);
  // Marked's GFM mode treats a single tilde as strikethrough. Preserve Korean
  // numeric ranges such as 1964~1966 without changing the source Markdown.
  prepared = prepared.replace(/(\d)~(?=\d)/g, '$1\\~');
  prepared = renderWikiLinks(prepared, document);
  prepared = prepared.replace(/@@LLMWIKI_FRAGMENT_(\d+)@@/g, (_match, index) => protectedFragments[Number(index)]);

  let html = marked.parse(prepared);
  let headingIndex = 0;
  html = html.replace(/<h([2-4])>([\s\S]*?)<\/h\1>/g, (_match, depth, inner) => {
    const planned = headings[headingIndex] ?? { id: slugify(stripMarkdown(inner)), label: stripMarkdown(inner) };
    headingIndex += 1;
    return `<h${depth} id="${planned.id}">${inner}<a class="heading-anchor" href="#${planned.id}" aria-label="${escapeHtml(planned.label)} 바로가기">#</a></h${depth}>`;
  });
  html = html.replace(/<a href="(https?:\/\/[^\"]+)"([^>]*)>([\s\S]*?)<\/a>/g, (_match, href, attributes, label) => (
    `<a class="external-link" href="${escapeHtml(href)}"${attributes} target="_blank" rel="noopener noreferrer">${label}<span class="sr-only"> (새 창)</span></a>`
  ));
  html = html.replace(/<table>/g, '<div class="table-wrap"><table>').replace(/<\/table>/g, '</table></div>');
  html = html.replace(/<blockquote>\s*<p>\[!(WARNING|CAUTION|NOTE|TIP|IMPORTANT)\]\s*/gi, (_match, type) => {
    const label = ['WARNING', 'CAUTION'].includes(type.toUpperCase()) ? '검토 메모' : '참고';
    return `<blockquote class="callout callout--${type.toLowerCase()}"><p><span class="callout-label">${label}</span>`;
  });

  return { html, headings };
}

function renderSearch(id, { large = false, label = '위키 검색' } = {}) {
  return `
    <form class="site-search${large ? ' site-search--large' : ''}" data-site-search data-index-url="${sitePath('/search-index.json')}" data-search-page-url="${sitePath('/search/')}" role="search" aria-label="${escapeHtml(label)}" action="${sitePath('/search/')}" method="get">
      <label class="sr-only" for="${id}">${escapeHtml(label)}</label>
      <div class="search-control">
        <input id="${id}" name="q" type="search" autocomplete="off" placeholder="위키 검색" aria-controls="${id}-results" aria-describedby="${id}-status">
        <button type="submit">찾기</button>
      </div>
      <div class="search-results" id="${id}-results" data-search-results hidden></div>
      <p class="sr-only" id="${id}-status" data-search-status role="status" aria-live="polite"></p>
    </form>`;
}

function navLink(url, label, current) {
  const active = current === url;
  return `<a href="${sitePath(url)}"${active ? ' aria-current="page"' : ''}>${label}</a>`;
}

function layout({ title, description, current = '', body, pageClass = '' }) {
  const fullTitle = title === 'LLM Wiki' ? title : `${title} · LLM Wiki`;
  return `<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="${escapeHtml(description)}">
  <meta name="theme-color" content="#e8e0c0">
  <title>${escapeHtml(fullTitle)}</title>
  <link rel="icon" href="${sitePath('/assets/favicon.svg')}" type="image/svg+xml">
  <link rel="stylesheet" href="${sitePath('/assets/katex.min.css')}">
  <link rel="stylesheet" href="${sitePath('/assets/styles.css')}">
  <script src="${sitePath('/assets/app.js')}" defer></script>
</head>
<body class="${pageClass}" data-base-path="${escapeHtml(basePath)}">
  <a class="skip-link" href="#main-content">본문으로 건너뛰기</a>
  <header class="site-header">
    <div class="header-rule" aria-hidden="true"></div>
    <div class="header-inner">
      <a class="wordmark" href="${sitePath('/')}"><span>LLM</span><span>Wiki</span></a>
      <button class="nav-toggle" type="button" data-menu-toggle aria-controls="primary-nav" aria-expanded="false">메뉴</button>
      <nav class="primary-nav" id="primary-nav" aria-label="주요 메뉴">
        ${navLink('/', '홈', current)}
        ${navLink('/sources/', '원문 노트', current)}
        ${navLink('/concepts/', '개념', current)}
        ${navLink('/entities/', '인물·기관', current)}
        ${navLink('/analyses/', '비교 읽기', current)}
        ${navLink('/search/', '전체 검색', current)}
        <div class="mobile-nav-search">${renderSearch('mobile-search', { label: '모바일 사이트 검색' })}</div>
      </nav>
      <div class="header-search">${renderSearch('header-search', { label: '헤더 사이트 검색' })}</div>
      <div class="body-font-picker">
        <label for="body-font-select">본문 글꼴</label>
        <select id="body-font-select" data-font-select data-reading-font>
          <option value="system">기본 글꼴</option>
          <option value="ridi">리디바탕</option>
          <option value="d2">D2Coding</option>
        </select>
      </div>
    </div>
  </header>
  ${body}
  <footer class="site-footer">
    <div>
      <a class="footer-mark" href="${sitePath('/')}">LLM Wiki</a>
      <p><strong>공개 콘텐츠 ${publishedDocuments.length}</strong> + <strong>안내 ${grouped.meta.length}</strong>로 구성한 LLM 역사 아카이브.</p>
    </div>
    <nav class="footer-meta" aria-label="보조 메뉴">
      <span>최근 문서 갱신 ${escapeHtml(latestUpdate)}</span>
      <a href="${sitePath('/search/')}">전체 검색</a>
      <a href="${sitePath('/about/')}">위키 안내</a>
      <a href="${sitePath('/log/')}">변경 기록</a>
      ${externalLink(repositoryUrl, 'GitHub 저장소')}
    </nav>
  </footer>
</body>
</html>`;
}

function meaningfulConnectionCount(document) {
  return document.meaningfulOutgoing.length;
}

function cardDataAttributes(document) {
  return `data-card data-category="${escapeHtml(document.category)}" data-verification="${escapeHtml(document.verification)}" data-tags="${escapeHtml(publicTags(document).join(' '))}" data-title="${escapeHtml(document.title)}" data-sort-title="${escapeHtml(document.title)}" data-updated="${escapeHtml(document.updated)}" data-connections="${meaningfulConnectionCount(document)}" data-filter-value="${escapeHtml([document.title, ...document.aliases, ...document.tags, document.excerpt].join(' '))}"`;
}

function sourceCard(document, index, { headingLevel = 3 } = {}) {
  const number = document.sourceNumber || String(index + 1).padStart(3, '0');
  return `<article class="source-card source-card--${(index % 4) + 1}" ${cardDataAttributes(document)}>
    <span class="source-number" aria-hidden="true">${escapeHtml(number)}</span>
    <div class="source-card-body">
      <div class="card-meta">${verificationBadge(document)}<span>연결 ${meaningfulConnectionCount(document)}</span></div>
      <h${headingLevel}><a href="${sitePath(document.url)}">${escapeHtml(document.title)}</a></h${headingLevel}>
      <p>${escapeHtml(document.excerpt)}</p>
      ${renderTags(document)}
    </div>
  </article>`;
}

function noteCard(document, { headingLevel = 3 } = {}) {
  return `<article class="note-card" ${cardDataAttributes(document)}>
    <div class="card-meta"><span>${escapeHtml(categoryMeta[document.category].singular)}</span>${verificationBadge(document)}<span>${document.minutes}분 읽기</span></div>
    <h${headingLevel}><a href="${sitePath(document.url)}">${escapeHtml(document.title)}</a></h${headingLevel}>
    <p>${escapeHtml(document.excerpt)}</p>
    <div class="note-card-footer">
      ${renderTags(document)}
      <span>역링크 ${document.meaningfulBacklinks.length}</span>
    </div>
  </article>`;
}

function renderHome() {
  const overview = documents.find((document) => document.filename === 'overview');
  const intro = truncate(firstParagraph(overview?.body ?? ''), 130);
  const sourcePreview = grouped.sources.slice(0, 3);
  const analysisPreview = grouped.analyses.slice(0, 3);
  const topConcepts = [...grouped.concepts]
    .sort((a, b) => b.meaningfulBacklinks.length - a.meaningfulBacklinks.length || collator.compare(a.title, b.title))
    .slice(0, 8);

  const body = `<main id="main-content">
    <section class="home-hero">
      <div class="hero-copy">
        <p class="eyebrow">원문 노트 ${grouped.sources.length}개·비교 읽기 ${grouped.analyses.length}개</p>
        <h1>언어 모델의<br><span>역사를 함께 읽다</span></h1>
        <p class="hero-intro">${escapeHtml(intro)}</p>
        ${renderSearch('hero-search', { large: true, label: '홈 주요 검색' })}
      </div>
      <nav class="hero-collage hero-source-strip" aria-label="원문 노트 빠른 이동">
        <p class="collage-label">원문 노트 ${grouped.sources.length}개</p>
        <ol>${grouped.sources.map((document, index) => `<li><a href="${sitePath(document.url)}"><span>${escapeHtml(document.sourceNumber || String(index + 1).padStart(3, '0'))}</span><strong>${escapeHtml(document.title)}</strong></a></li>`).join('')}</ol>
      </nav>
    </section>

    <section class="stats-strip" aria-label="위키 문서 현황">
      ${['sources', 'concepts', 'entities', 'analyses'].map((key) => `<a href="${sitePath(`/${key}/`)}"><strong>${grouped[key].length}</strong><span>${categoryMeta[key].label}</span></a>`).join('')}
    </section>

    <section class="home-section source-section">
      <div class="section-heading">
        <div><p class="eyebrow">원문 기반 노트</p><h2>첫 번째 자료부터 읽기</h2></div>
        <p>통계적 언어 처리에서 대화형 AI까지, 핵심 자료를 번호순으로 읽습니다.</p>
      </div>
      <div class="source-timeline">${sourcePreview.map((document, index) => sourceCard(document, index)).join('')}</div>
      <a class="text-link" href="${sitePath('/sources/')}">원문 노트 ${grouped.sources.length}개 전체 보기 <span aria-hidden="true">→</span></a>
    </section>

    <section class="home-section analysis-section">
      <div class="section-heading">
        <div><p class="eyebrow">자료를 나란히 읽기</p><h2>과거와 LLM 사이</h2></div>
        <p>작동 방식, 평가, 사용자 기대의 연속성과 차이를 자료에 근거해 비교합니다.</p>
      </div>
      <div class="note-grid note-grid--analysis">${analysisPreview.map((document) => noteCard(document)).join('')}</div>
      <a class="text-link" href="${sitePath('/analyses/')}">비교 읽기 ${grouped.analyses.length}개 전체 보기 <span aria-hidden="true">→</span></a>
    </section>

    <section class="home-section concept-section">
      <div class="section-heading">
        <div><p class="eyebrow">역링크 기준</p><h2>많이 연결된 개념</h2></div>
        <p>현재 문서의 역링크 수를 기준으로, 다른 글에서 자주 참조되는 개념을 모았습니다.</p>
      </div>
      <ol class="concept-index">${topConcepts.map((document, index) => `<li><span>${String(index + 1).padStart(2, '0')}</span><a href="${sitePath(document.url)}">${escapeHtml(document.title)}</a><small>역링크 ${document.meaningfulBacklinks.length}</small></li>`).join('')}</ol>
      <a class="text-link" href="${sitePath('/concepts/')}">개념 전체 보기 <span aria-hidden="true">→</span></a>
    </section>
  </main>`;

  return layout({
    title: 'LLM Wiki',
    description: '초기 언어 모델과 AI의 역사를 현대 LLM의 질문과 연결해서 읽는 한국어 지식 아카이브',
    current: '/',
    body,
    pageClass: 'home-page',
  });
}

function renderCategoryPage(key) {
  const meta = categoryMeta[key];
  const list = grouped[key];
  const cards = key === 'sources'
    ? list.map((document, index) => sourceCard(document, index, { headingLevel: 2 })).join('')
    : list.map((document) => noteCard(document, { headingLevel: 2 })).join('');
  const body = `<main id="main-content" class="listing-main">
    <header class="listing-hero">
      <p class="eyebrow">${list.length}개 문서</p>
      <div><h1>${escapeHtml(meta.label)}</h1><span class="listing-count">${list.length}</span></div>
      <p>${escapeHtml(meta.description)}</p>
    </header>
    <section class="directory-tools" aria-label="목록 필터">
      <div class="directory-search-control">
        <label for="filter-${key}">${escapeHtml(meta.label)} 안에서 찾기</label>
        <input id="filter-${key}" type="search" placeholder="제목, 별칭, 태그 검색" data-filter-input aria-controls="directory-${key}">
      </div>
      <div class="directory-select-control">
        <label for="verification-${key}">검증 상태</label>
        <select id="verification-${key}" data-filter-verification>
          <option value="">모든 검증 상태</option>
          <option value="verified">검증됨</option>
          <option value="partial">부분 검증</option>
          <option value="disputed">이견 중</option>
          <option value="unverified">미검증</option>
        </select>
      </div>
      <div class="directory-select-control">
        <label for="sort-${key}">정렬</label>
        <select id="sort-${key}" data-filter-sort>
          <option value="default">기본순</option>
          <option value="title">제목순</option>
          <option value="updated">최근 갱신순</option>
          <option value="connections">연결 많은순</option>
        </select>
      </div>
      <span class="directory-result-count" data-filter-count role="status" aria-live="polite">${list.length}개 문서</span>
    </section>
    <section id="directory-${key}" class="${key === 'sources' ? 'source-timeline directory-source-list' : 'note-grid directory-grid'}" data-filter-grid>
      ${cards}
      <p class="empty-filter" data-filter-empty hidden>일치하는 문서가 없습니다.</p>
    </section>
  </main>`;

  return layout({
    title: meta.label,
    description: meta.description,
    current: `/${key}/`,
    body,
    pageClass: `listing-page listing-page--${key}`,
  });
}

function renderSearchPage() {
  const searchableMetaCount = grouped.meta.filter((document) => document.filename !== 'index').length;
  const searchableCount = publishedDocuments.length + searchableMetaCount;
  const searchableTags = [...new Set(publishedDocuments.flatMap((document) => publicTags(document)))]
    .sort((a, b) => collator.compare(tagLabel(a), tagLabel(b)));
  const body = `<main id="main-content" class="search-main">
    <header class="listing-hero search-hero">
      <p class="eyebrow">공개 콘텐츠 ${publishedDocuments.length}개 · 안내 ${searchableMetaCount}개</p>
      <div><h1>전체 검색</h1><span class="listing-count">${searchableCount}</span></div>
      <p>제목·별칭·본문을 검색하고 유형, 검증 상태, 태그로 결과를 좁힙니다.</p>
    </header>
    <form class="search-page-tools" data-search-page data-index-url="${sitePath('/search-index.json')}" role="search" aria-label="전체 문서 검색" action="${sitePath('/search/')}" method="get">
      <div class="search-page-query">
        <label for="search-page-input">검색어</label>
        <div class="search-control">
          <input id="search-page-input" name="q" type="search" autocomplete="off" placeholder="제목, 별칭, 본문 검색" data-search-page-input>
          <button type="submit">검색</button>
        </div>
      </div>
      <div class="search-page-filters">
        <label for="search-category">문서 유형</label>
        <select id="search-category" name="category" data-search-filter-category>
          <option value="">모든 문서 유형</option>
          ${['sources', 'concepts', 'entities', 'analyses'].map((key) => `<option value="${key}">${escapeHtml(categoryMeta[key].label)}</option>`).join('')}
        </select>
        <label for="search-verification">검증 상태</label>
        <select id="search-verification" name="verification" data-search-filter-verification>
          <option value="">모든 검증 상태</option>
          <option value="verified">검증됨</option>
          <option value="partial">부분 검증</option>
          <option value="disputed">이견 중</option>
          <option value="unverified">미검증</option>
        </select>
        <label for="search-tag">태그</label>
        <select id="search-tag" name="tag" data-search-filter-tag>
          <option value="">모든 태그</option>
          ${searchableTags.map((tag) => `<option value="${escapeHtml(tag)}">${escapeHtml(tagLabel(tag))}</option>`).join('')}
        </select>
        <label for="search-sort">정렬</label>
        <select id="search-sort" name="sort" data-search-sort>
          <option value="relevance">관련도순</option>
          <option value="title">제목순</option>
          <option value="updated">최근 갱신순</option>
          <option value="evidence">근거 많은순</option>
        </select>
      </div>
    </form>
    <p class="search-page-status" data-search-page-status role="status" aria-live="polite">검색어나 필터를 입력하면 결과가 표시됩니다.</p>
    <section class="search-page-results" data-search-page-results aria-label="검색 결과"></section>
  </main>`;

  return layout({
    title: '전체 검색',
    description: 'LLM Wiki 공개 콘텐츠를 유형, 검증 상태, 태그로 필터링하는 전체 검색',
    current: '/search/',
    body,
    pageClass: 'search-page',
  });
}

function githubFileUrl(document) {
  const encodedPath = ['wiki', ...document.relativePath.split('/')].map(encodeURIComponent).join('/');
  return `${repositoryUrl}/blob/main/${encodedPath}`;
}

function breadcrumbFor(document) {
  const items = [`<li><a href="${sitePath('/')}">홈</a></li>`];
  if (document.category !== 'meta') {
    items.push(`<li><a href="${sitePath(`/${document.category}/`)}">${escapeHtml(categoryMeta[document.category].label)}</a></li>`);
  }
  items.push(`<li><span aria-current="page">${escapeHtml(document.title)}</span></li>`);
  return `<ol>${items.join('')}</ol>`;
}

function renderToc(headings) {
  if (!headings.length) return '<p class="toc-empty">하위 목차 없음</p>';
  return `<ol>${headings.map((heading) => `<li class="toc-depth-${heading.depth}"><a href="#${heading.id}">${escapeHtml(heading.label)}</a></li>`).join('')}</ol>`;
}

function renderEvidenceLedger(document) {
  const entries = document.evidence.map((entry, index) => {
    const source = entry.source ?? {};
    const sourceTitle = source.title || entry.sourceId;
    const authors = asArray(source.authors).join(', ');
    const publication = [source.published, source.kind].filter(Boolean).join(' · ');
    const sourceLink = source.url
      ? externalLink(source.url, '출처 열기', 'evidence-link')
      : source.doi
        ? externalLink(`https://doi.org/${source.doi}`, 'DOI 열기', 'evidence-link')
        : '';
    return `<li class="evidence-entry" data-evidence-id="${escapeHtml(entry.sourceId)}" data-evidence-relation="${escapeHtml(entry.relation)}">
      <div class="evidence-entry-head"><code>${escapeHtml(entry.sourceId)}</code><span class="evidence-relation evidence-relation--${escapeHtml(entry.relation)}">${escapeHtml(relationLabel(entry.relation))}</span></div>
      <h3><span class="evidence-index">${String(index + 1).padStart(2, '0')}</span>${escapeHtml(sourceTitle)}</h3>
      ${authors ? `<p class="evidence-authors">${escapeHtml(authors)}</p>` : ''}
      <dl>
        <div><dt>근거 위치</dt><dd>${escapeHtml(entry.locator || '위치 기록 없음')}</dd></div>
        ${publication ? `<div><dt>발행·유형</dt><dd>${escapeHtml(publication)}</dd></div>` : ''}
      </dl>
      ${sourceLink}
    </li>`;
  }).join('');

  return `<section class="evidence-section" aria-labelledby="evidence-heading">
    <div class="section-heading compact"><div><p class="eyebrow">검증 정보</p><h2 id="evidence-heading">근거 장부</h2></div><span>${document.evidence.length}</span></div>
    ${entries ? `<ol class="evidence-ledger">${entries}</ol>` : '<p class="evidence-empty">이 안내 문서에는 별도의 근거 등록이 없습니다.</p>'}
  </section>`;
}

function renderRelatedReading(document) {
  const related = document.relatedDocuments.slice(0, 12);
  const items = related.map((item) => `<li>
    <a href="${sitePath(item.url)}">
      <span class="related-category">${escapeHtml(categoryMeta[item.category].singular)}</span>
      <strong>${escapeHtml(item.title)}</strong>
      <span class="related-excerpt">${escapeHtml(truncate(item.excerpt, 100))}</span>
    </a>
    ${verificationBadge(item)}
  </li>`).join('');
  return `<section class="related-section" aria-labelledby="related-heading">
    <div class="section-heading compact"><div><p class="eyebrow">명시적 관계</p><h2 id="related-heading">관련 읽기</h2></div><span>${document.relatedDocuments.length}</span></div>
    ${items ? `<ul class="related-reading-list">${items}</ul>` : '<p class="related-empty">등록된 관련 문서가 없습니다.</p>'}
    ${document.relatedDocuments.length > related.length ? `<a class="text-link" href="${sitePath('/search/')}">관련 문서 더 찾기</a>` : ''}
  </section>`;
}

function renderBacklinks(document) {
  const limit = 12;
  const visible = document.meaningfulBacklinks.slice(0, limit);
  const groups = categoryRank
    .filter((key) => key !== 'meta')
    .map((key) => [key, visible.filter((item) => item.category === key)])
    .filter(([, items]) => items.length);
  const content = groups.length
    ? groups.map(([key, items]) => `<div class="backlink-group backlink-group--${key}"><h3>${escapeHtml(categoryMeta[key].label)} <span>${items.length}</span></h3><ul>${items.map((item) => `<li><a href="${sitePath(item.url)}">${escapeHtml(item.title)}</a>${verificationBadge(item)}</li>`).join('')}</ul></div>`).join('')
    : '<p class="no-backlinks">아직 이 문서를 가리키는 공개 글이 없습니다.</p>';
  const remaining = document.meaningfulBacklinks.length - visible.length;
  return `<section class="backlinks-section" aria-labelledby="backlinks-heading">
    <div class="section-heading compact"><div><p class="eyebrow">역방향 연결</p><h2 id="backlinks-heading">이 문서를 가리키는 글</h2></div><span>${document.meaningfulBacklinks.length}</span></div>
    <div class="backlink-groups">${content}</div>
    ${remaining > 0 ? `<p class="backlink-limit-note">연결 ${remaining}개는 생략했습니다. <a href="${sitePath(`/search/?q=${encodeURIComponent(document.title)}`)}">전체 검색에서 찾기</a></p>` : ''}
  </section>`;
}

function renderArticle(document) {
  const rendered = renderMarkdown(document);
  const siblings = grouped[document.category];
  const position = siblings.indexOf(document);
  const previous = position > 0 ? siblings[position - 1] : null;
  const next = position >= 0 && position < siblings.length - 1 ? siblings[position + 1] : null;
  const aliases = document.aliases.filter((alias) => normalizeLookup(alias) !== normalizeLookup(document.title));

  const reviewNote = document.verification !== 'verified'
    ? `<div class="review-banner">${verificationBadge(document)}<span>사실, 해석 또는 논쟁 상태는 문서의 근거와 설명을 함께 확인하세요.</span></div>`
    : '';

  const body = `<main id="main-content" class="article-main">
    <nav class="breadcrumbs" aria-label="현재 위치">${breadcrumbFor(document)}</nav>
    <header class="article-hero">
      <div class="article-title-block">
        <div class="article-kicker"><span>${escapeHtml(categoryMeta[document.category].singular)}</span>${document.sourceNumber ? `<span>No. ${document.sourceNumber}</span>` : ''}</div>
        <h1 id="article-title">${escapeHtml(document.title)}</h1>
        ${aliases.length ? `<p class="aliases">${aliases.map(escapeHtml).join(' · ')}</p>` : ''}
        <p class="article-summary">${escapeHtml(truncate(document.excerpt, 180))}</p>
        ${renderTags(document)}
      </div>
      <dl class="article-facts">
        <div><dt>문서 상태</dt><dd>${escapeHtml(lifecycleLabel(document.lifecycle))}</dd></div>
        <div><dt>근거 상태</dt><dd>${verificationBadge(document)}</dd></div>
        <div><dt>최근 갱신</dt><dd>${escapeHtml(document.updated || '기록 없음')}</dd></div>
        <div><dt>읽기</dt><dd>약 ${document.minutes}분</dd></div>
        <div><dt>연결</dt><dd>${meaningfulConnectionCount(document)}개 문서</dd></div>
      </dl>
    </header>
    ${reviewNote}
    <div class="article-layout">
      <aside class="article-sidebar">
        <details class="toc-card" data-toc-details open>
          <summary>이 문서의 목차</summary>
          <nav aria-label="문서 목차">${renderToc(rendered.headings)}</nav>
        </details>
      </aside>
      <div class="article-reading">
        <article class="article-body" aria-labelledby="article-title">${rendered.html}</article>
        <div class="source-note article-source-note">
          <span>Markdown 원본</span>
          <code>${escapeHtml(`wiki/${document.relativePath}`)}</code>
          ${externalLink(githubFileUrl(document), 'GitHub에서 보기')}
        </div>
      </div>
    </div>
    ${renderEvidenceLedger(document)}
    ${renderRelatedReading(document)}
    ${renderBacklinks(document)}
    <nav class="article-pagination" aria-label="이전 및 다음 문서">
      ${previous ? `<a class="previous" href="${sitePath(previous.url)}"><span>이전</span><strong>${escapeHtml(previous.title)}</strong></a>` : '<span></span>'}
      ${next ? `<a class="next" href="${sitePath(next.url)}"><span>다음</span><strong>${escapeHtml(next.title)}</strong></a>` : '<span></span>'}
    </nav>
  </main>`;

  return layout({
    title: document.title,
    description: document.excerpt,
    current: document.category === 'meta' ? '' : `/${document.category}/`,
    body,
    pageClass: `article-page article-page--${document.category}`,
  });
}

function renderNotFound() {
  const body = `<main id="main-content" class="not-found">
    <p class="error-code">404</p>
    <h1>이 문서는 아직 연결되지 않았습니다.</h1>
    <p>주소가 바뀌었거나, 위키에 아직 작성되지 않은 항목일 수 있습니다.</p>
    <div><a class="button-link" href="${sitePath('/')}">홈으로 돌아가기</a><a class="text-link" href="${sitePath('/concepts/')}">개념 찾아보기</a></div>
  </main>`;
  return layout({ title: '페이지를 찾을 수 없음', description: '요청한 LLM Wiki 문서를 찾을 수 없습니다.', body, pageClass: 'error-page' });
}

function outputPathForUrl(url) {
  if (url === '/') return path.join(distDir, 'index.html');
  return path.join(distDir, url.replace(/^\/+|\/+$/g, ''), 'index.html');
}

async function writeHtml(url, html) {
  const outputPath = outputPathForUrl(url);
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, html, 'utf8');
}

await fs.rm(distDir, { recursive: true, force: true });
await fs.mkdir(distDir, { recursive: true });
await fs.cp(path.join(siteDir, 'assets'), path.join(distDir, 'assets'), { recursive: true });
await fs.copyFile(path.join(rootDir, 'node_modules', 'katex', 'dist', 'katex.min.css'), path.join(distDir, 'assets', 'katex.min.css'));
await fs.cp(path.join(rootDir, 'node_modules', 'katex', 'dist', 'fonts'), path.join(distDir, 'assets', 'fonts'), { recursive: true });

await writeHtml('/', renderHome());
for (const key of ['sources', 'concepts', 'entities', 'analyses']) {
  await writeHtml(`/${key}/`, renderCategoryPage(key));
}
await writeHtml('/search/', renderSearchPage());
for (const document of documents) {
  if (document.url !== '/') await writeHtml(document.url, renderArticle(document));
}
await fs.writeFile(path.join(distDir, '404.html'), renderNotFound(), 'utf8');
await fs.writeFile(path.join(distDir, '.nojekyll'), '', 'utf8');

const searchIndex = documents
  .filter((document) => document.filename !== 'index')
  .map((document) => ({
    id: document.id,
    type: document.pageType,
    title: document.title,
    aliases: document.aliases,
    category: categoryMeta[document.category].singular,
    categoryKey: document.category,
    verification: document.verification,
    verificationLabel: verificationLabel(document.verification),
    lifecycle: document.lifecycle,
    created: document.created,
    updated: document.updated,
    tags: publicTags(document).map(tagLabel),
    tagKeys: publicTags(document),
    tagLabels: publicTags(document).map(tagLabel),
    evidenceCount: document.evidence.length,
    relatedCount: document.relatedDocuments.length,
    connectionCount: meaningfulConnectionCount(document),
    connections: meaningfulConnectionCount(document),
    backlinkCount: document.meaningfulBacklinks.length,
    minutes: document.minutes,
    sourceNumber: document.sourceNumber,
    excerpt: document.excerpt,
    text: stripMarkdown(document.body).slice(0, 6000),
    url: sitePath(document.url),
  }));
await fs.writeFile(path.join(distDir, 'search-index.json'), JSON.stringify(searchIndex), 'utf8');

const buildReport = {
  generatedAt: new Date().toISOString(),
  basePath,
  pages: documents.length + 6,
  documents: documents.length,
  publishedDocuments: publishedDocuments.length,
  counts: Object.fromEntries(Object.keys(categoryMeta).map((key) => [key, grouped[key].length])),
  resolvedLinks: resolvedLinkCount,
  unresolvedLinks: [...unresolved.values()]
    .map((record) => ({ target: record.target, count: record.count, from: [...record.from].sort(collator.compare) }))
    .sort((a, b) => b.count - a.count || collator.compare(a.target, b.target)),
};
await fs.writeFile(path.join(distDir, 'build-report.json'), JSON.stringify(buildReport, null, 2), 'utf8');

console.log(`Built ${buildReport.pages} pages from ${documents.length} Markdown documents.`);
console.log(`Resolved ${resolvedLinkCount} wiki links; ${buildReport.unresolvedLinks.length} unresolved target(s).`);
