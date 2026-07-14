import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';
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
    label: '소스',
    singular: '소스',
    description: 'AI와 언어 기술의 초기 논문·시연·프로그램을 한국어로 정리한 핵심 자료입니다.',
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
    label: '연결 분석',
    singular: '분석',
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
    id: relativePath.replace(/\.md$/i, ''),
    absolutePath,
    relativePath,
    filename,
    category,
    title,
    aliases: asArray(parsed.data.aliases),
    tags: asArray(parsed.data.tags),
    sources: asArray(parsed.data.sources),
    status: String(parsed.data.status ?? 'active'),
    created: formatDate(parsed.data.created),
    updated: formatDate(parsed.data.updated),
    body: parsed.content.trim(),
    url: routeFor(relativePath, category, filename),
    sourceNumber: category === 'sources' ? filename.match(/^(\d{3})/)?.[1] ?? '' : '',
    excerpt: truncate(firstParagraph(parsed.content), 210),
    minutes: readingMinutes(parsed.content),
    outgoing: [],
    backlinks: [],
  };
}));

documents.sort((a, b) => collator.compare(a.relativePath, b.relativePath));

const exactLookup = new Map();
const namedLookup = new Map();

function addNamedLookup(name, document) {
  const key = normalizeLookup(name);
  if (!key) return;
  const existing = namedLookup.get(key) ?? [];
  if (!existing.includes(document)) existing.push(document);
  namedLookup.set(key, existing);
}

for (const document of documents) {
  exactLookup.set(normalizeLookup(document.filename), document);
  addNamedLookup(document.filename, document);
  addNamedLookup(document.title, document);
  for (const alias of document.aliases) addNamedLookup(alias, document);
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

function statusLabel(status) {
  return status === 'review' ? '검토 중' : status === 'draft' ? '초안' : '정리됨';
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
  return `<ul class="tag-list" aria-label="태그">${tags.map((tag) => `<li>${escapeHtml(tagLabel(tag))}</li>`).join('')}</ul>`;
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

function renderWikiLinks(markdown) {
  return String(markdown).replace(/\[\[([^\]\n]+)\]\]/g, (_match, inside) => {
    const [targetPart, explicitLabel] = inside.split('|');
    const cleanTarget = targetPart.trim();
    const targetWithoutHeading = cleanTarget.split('#')[0].trim();
    const label = explicitLabel?.trim() || targetWithoutHeading;
    const resolved = resolveWikiTarget(inside);

    if (!resolved.document) {
      return `<span class="wiki-link wiki-link--missing" title="아직 작성되지 않은 문서">${escapeHtml(label)}</span>`;
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
  prepared = renderWikiLinks(prepared);
  prepared = prepared.replace(/@@LLMWIKI_FRAGMENT_(\d+)@@/g, (_match, index) => protectedFragments[Number(index)]);

  let html = marked.parse(prepared);
  let headingIndex = 0;
  html = html.replace(/<h([2-4])>([\s\S]*?)<\/h\1>/g, (_match, depth, inner) => {
    const planned = headings[headingIndex] ?? { id: slugify(stripMarkdown(inner)), label: stripMarkdown(inner) };
    headingIndex += 1;
    return `<h${depth} id="${planned.id}">${inner}<a class="heading-anchor" href="#${planned.id}" aria-label="${escapeHtml(planned.label)} 바로가기">#</a></h${depth}>`;
  });
  html = html.replace(/<a href="(https?:\/\/[^\"]+)"/g, '<a class="external-link" href="$1" target="_blank" rel="noreferrer"');
  html = html.replace(/<table>/g, '<div class="table-wrap"><table>').replace(/<\/table>/g, '</table></div>');
  html = html.replace(/<blockquote>\s*<p>\[!(WARNING|CAUTION|NOTE|TIP|IMPORTANT)\]\s*/gi, (_match, type) => {
    const label = ['WARNING', 'CAUTION'].includes(type.toUpperCase()) ? '검토 메모' : '참고';
    return `<blockquote class="callout callout--${type.toLowerCase()}"><p><span class="callout-label">${label}</span>`;
  });

  return { html, headings };
}

function renderSearch(id, large = false) {
  return `
    <form class="site-search${large ? ' site-search--large' : ''}" data-site-search data-index-url="${sitePath('/search-index.json')}" role="search">
      <label class="sr-only" for="${id}">위키 검색</label>
      <div class="search-control">
        <input id="${id}" name="q" type="search" autocomplete="off" placeholder="위키 검색" aria-controls="${id}-results" aria-expanded="false">
        <button type="submit">찾기</button>
      </div>
      <div class="search-results" id="${id}-results" role="listbox" hidden></div>
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
        ${navLink('/sources/', '소스', current)}
        ${navLink('/concepts/', '개념', current)}
        ${navLink('/entities/', '인물·기관', current)}
        ${navLink('/analyses/', '연결 분석', current)}
      </nav>
      <div class="header-search">${renderSearch('header-search')}</div>
    </div>
  </header>
  ${body}
  <footer class="site-footer">
    <div>
      <a class="footer-mark" href="${sitePath('/')}">LLM Wiki</a>
      <p>현재 프로젝트의 Markdown ${publishedDocuments.length}개를 연결해 만든 공개 지식 아카이브.</p>
    </div>
    <div class="footer-meta">
      <span>최근 문서 갱신 ${escapeHtml(latestUpdate)}</span>
      <a href="${repositoryUrl}" target="_blank" rel="noreferrer">GitHub 저장소</a>
      <a href="${sitePath('/about/')}">위키 안내</a>
    </div>
  </footer>
</body>
</html>`;
}

function sourceCard(document, index) {
  return `<article class="source-card source-card--${(index % 4) + 1}" data-card data-filter-value="${escapeHtml([document.title, ...document.aliases, ...document.tags, document.excerpt].join(' '))}">
    <a class="source-number" href="${sitePath(document.url)}" aria-label="${escapeHtml(document.title)}">${escapeHtml(document.sourceNumber)}</a>
    <div class="source-card-body">
      <div class="card-meta"><span>${escapeHtml(statusLabel(document.status))}</span><span>연결 ${document.outgoing.length}</span></div>
      <h3><a href="${sitePath(document.url)}">${escapeHtml(document.title)}</a></h3>
      <p>${escapeHtml(document.excerpt)}</p>
      ${renderTags(document)}
    </div>
  </article>`;
}

function noteCard(document) {
  return `<article class="note-card" data-card data-filter-value="${escapeHtml([document.title, ...document.aliases, ...document.tags, document.excerpt].join(' '))}">
    <div class="card-meta"><span>${escapeHtml(categoryMeta[document.category].singular)}</span><span>${document.minutes}분 읽기</span></div>
    <h3><a href="${sitePath(document.url)}">${escapeHtml(document.title)}</a></h3>
    <p>${escapeHtml(document.excerpt)}</p>
    <div class="note-card-footer">
      ${renderTags(document)}
      <span>역링크 ${document.backlinks.length}</span>
    </div>
  </article>`;
}

function renderHome() {
  const overview = documents.find((document) => document.filename === 'overview');
  const intro = truncate(firstParagraph(overview?.body ?? ''), 190);
  const topConcepts = [...grouped.concepts]
    .sort((a, b) => b.backlinks.length - a.backlinks.length || collator.compare(a.title, b.title))
    .slice(0, 12);

  const body = `<main id="main-content">
    <section class="home-hero">
      <div class="hero-copy">
        <p class="eyebrow">AI 언어 기술 아카이브 · 001—007</p>
        <h1>언어 모델의<br><span>과거와 지금을</span><br>함께 읽다</h1>
        <p class="hero-intro">${escapeHtml(intro)}</p>
        ${renderSearch('hero-search', true)}
      </div>
      <div class="hero-collage" aria-hidden="true">
        <span class="collage-label">SOURCE NOTES</span>
        <span class="collage-number collage-number--one">001</span>
        <span class="collage-number collage-number--two">007</span>
        <span class="collage-stamp">N-GRAM<br>TO ELIZA</span>
        <span class="collage-tape"></span>
      </div>
    </section>

    <section class="stats-strip" aria-label="위키 문서 현황">
      ${['sources', 'concepts', 'entities', 'analyses'].map((key) => `<a href="${sitePath(`/${key}/`)}"><strong>${grouped[key].length}</strong><span>${categoryMeta[key].label}</span></a>`).join('')}
    </section>

    <section class="home-section source-section">
      <div class="section-heading">
        <div><p class="eyebrow">Chronology / 01</p><h2>일곱 개의 시작점</h2></div>
        <p>통계적 언어 처리에서 대화형 AI까지, 현재 위키가 다루는 소스를 번호순으로 읽습니다.</p>
      </div>
      <div class="source-timeline">${grouped.sources.map(sourceCard).join('')}</div>
      <a class="text-link" href="${sitePath('/sources/')}">소스 전체 보기 <span aria-hidden="true">→</span></a>
    </section>

    <section class="home-section analysis-section">
      <div class="section-heading">
        <div><p class="eyebrow">Connections / 02</p><h2>과거와 LLM 사이</h2></div>
        <p>작동 방식, 평가, 사용자 기대의 연속성과 차이를 자료에 근거해 비교합니다.</p>
      </div>
      <div class="note-grid note-grid--analysis">${grouped.analyses.map(noteCard).join('')}</div>
      <a class="text-link" href="${sitePath('/analyses/')}">연결 분석 전체 보기 <span aria-hidden="true">→</span></a>
    </section>

    <section class="home-section concept-section">
      <div class="section-heading">
        <div><p class="eyebrow">Index / 03</p><h2>많이 연결된 개념</h2></div>
        <p>현재 문서의 역링크 수를 기준으로, 다른 글에서 자주 참조되는 개념을 모았습니다.</p>
      </div>
      <ol class="concept-index">${topConcepts.map((document, index) => `<li><span>${String(index + 1).padStart(2, '0')}</span><a href="${sitePath(document.url)}">${escapeHtml(document.title)}</a><small>역링크 ${document.backlinks.length}</small></li>`).join('')}</ol>
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
  const cards = key === 'sources' ? list.map(sourceCard).join('') : list.map(noteCard).join('');
  const body = `<main id="main-content" class="listing-main">
    <header class="listing-hero">
      <p class="eyebrow">Directory / ${escapeHtml(key)}</p>
      <div><h1>${escapeHtml(meta.label)}</h1><span class="listing-count">${list.length}</span></div>
      <p>${escapeHtml(meta.description)}</p>
    </header>
    <section class="directory-tools" aria-label="목록 필터">
      <label for="filter-${key}">${escapeHtml(meta.label)} 안에서 찾기</label>
      <div>
        <input id="filter-${key}" type="search" placeholder="제목, 별칭, 태그 검색" data-filter-input aria-controls="directory-${key}">
        <span data-filter-count>${list.length}개 문서</span>
      </div>
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

function githubFileUrl(document) {
  const encodedPath = ['wiki', ...document.relativePath.split('/')].map(encodeURIComponent).join('/');
  return `${repositoryUrl}/blob/main/${encodedPath}`;
}

function breadcrumbFor(document) {
  if (document.category === 'meta') return `<a href="${sitePath('/')}">홈</a><span>/</span><span>${escapeHtml(document.title)}</span>`;
  return `<a href="${sitePath('/')}">홈</a><span>/</span><a href="${sitePath(`/${document.category}/`)}">${escapeHtml(categoryMeta[document.category].label)}</a><span>/</span><span>${escapeHtml(document.title)}</span>`;
}

function renderToc(headings) {
  if (!headings.length) return '<p class="toc-empty">하위 목차 없음</p>';
  return `<ol>${headings.map((heading) => `<li class="toc-depth-${heading.depth}"><a href="#${heading.id}">${escapeHtml(heading.label)}</a></li>`).join('')}</ol>`;
}

function renderArticle(document) {
  const rendered = renderMarkdown(document);
  const siblings = grouped[document.category];
  const position = siblings.indexOf(document);
  const previous = position > 0 ? siblings[position - 1] : null;
  const next = position >= 0 && position < siblings.length - 1 ? siblings[position + 1] : null;
  const aliases = document.aliases.filter((alias) => normalizeLookup(alias) !== normalizeLookup(document.title));
  const backlinkCards = document.backlinks.length
    ? document.backlinks.map((item) => `<li><a href="${sitePath(item.url)}"><span>${escapeHtml(categoryMeta[item.category].singular)}</span>${escapeHtml(item.title)}</a></li>`).join('')
    : '<li class="no-backlinks">아직 이 문서를 가리키는 글이 없습니다.</li>';

  const reviewNote = document.status === 'review'
    ? `<div class="review-banner"><strong>검토 중</strong><span>원문 품질이나 연결 근거를 추가로 확인하는 문서입니다.</span></div>`
    : '';

  const body = `<main id="main-content" class="article-main">
    <nav class="breadcrumbs" aria-label="현재 위치">${breadcrumbFor(document)}</nav>
    <header class="article-hero">
      <div class="article-title-block">
        <div class="article-kicker"><span>${escapeHtml(categoryMeta[document.category].singular)}</span>${document.sourceNumber ? `<span>No. ${document.sourceNumber}</span>` : ''}</div>
        <h1>${escapeHtml(document.title)}</h1>
        ${aliases.length ? `<p class="aliases">${aliases.map(escapeHtml).join(' · ')}</p>` : ''}
        ${renderTags(document)}
      </div>
      <dl class="article-facts">
        <div><dt>상태</dt><dd>${escapeHtml(statusLabel(document.status))}</dd></div>
        <div><dt>최근 갱신</dt><dd>${escapeHtml(document.updated || '기록 없음')}</dd></div>
        <div><dt>읽기</dt><dd>약 ${document.minutes}분</dd></div>
        <div><dt>연결</dt><dd>${document.outgoing.length}개 문서</dd></div>
      </dl>
    </header>
    ${reviewNote}
    <div class="article-layout">
      <aside class="article-sidebar">
        <div class="toc-card">
          <p>이 문서의 목차</p>
          <nav aria-label="문서 목차">${renderToc(rendered.headings)}</nav>
        </div>
        <div class="source-note">
          <span>Markdown 원본</span>
          <code>${escapeHtml(`wiki/${document.relativePath}`)}</code>
          <a href="${githubFileUrl(document)}" target="_blank" rel="noreferrer">GitHub에서 보기</a>
        </div>
      </aside>
      <article class="article-body">${rendered.html}</article>
    </div>
    <section class="backlinks-section">
      <div class="section-heading compact"><div><p class="eyebrow">Backlinks</p><h2>이 문서를 가리키는 글</h2></div><span>${document.backlinks.length}</span></div>
      <ul>${backlinkCards}</ul>
    </section>
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
for (const document of documents) {
  if (document.url !== '/') await writeHtml(document.url, renderArticle(document));
}
await fs.writeFile(path.join(distDir, '404.html'), renderNotFound(), 'utf8');
await fs.writeFile(path.join(distDir, '.nojekyll'), '', 'utf8');

const searchIndex = documents
  .filter((document) => document.filename !== 'index')
  .map((document) => ({
    title: document.title,
    aliases: document.aliases,
    category: categoryMeta[document.category].singular,
    categoryKey: document.category,
    tags: publicTags(document).map(tagLabel),
    excerpt: document.excerpt,
    text: stripMarkdown(document.body).slice(0, 6000),
    url: sitePath(document.url),
  }));
await fs.writeFile(path.join(distDir, 'search-index.json'), JSON.stringify(searchIndex), 'utf8');

const buildReport = {
  generatedAt: new Date().toISOString(),
  basePath,
  pages: documents.length + 5,
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
