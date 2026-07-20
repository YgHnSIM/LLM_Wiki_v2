import { promises as fs } from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import yaml from 'js-yaml';
import katex from 'katex';
import { marked, Renderer } from 'marked';
import { build as bundle } from 'esbuild';
import {
  artifactRoleMetadata,
  normalizeArtifactMarkdown,
  normalizeArtifactPath,
  resolveRawArtifactPath,
  sourceOriginForArtifact,
} from './lib/artifact-readers.mjs';
import { buildDirectoryAtomically } from './lib/atomic-directory.mjs';
import { escapeHtml, firstParagraph, protectRenderedMath, readingMinutes, stripMarkdown, truncate } from './lib/content-format.mjs';
import { buildKnowledgeGraph } from './lib/knowledge-graph.mjs';
import { distDir, rawDir, rootDir, siteDir, wikiDir } from './lib/project-paths.mjs';
import { normalizeBasePath, outputFileForUrl, withBasePath } from './lib/site-paths.mjs';
import {
  asStringArray,
  collator,
  createWikiLookup,
  extractWikiLinks,
  formatDate,
  loadMarkdownDocuments,
  markdownBeforeFinalH2,
  normalizeWikiName,
  slugify,
} from './lib/wiki-utils.mjs';

const repositoryUrl = 'https://github.com/YgHnSIM/LLM_Wiki_v2';
const basePath = normalizeBasePath(process.env.BASE_PATH ?? '');
const sitePath = (pathname = '/') => withBasePath(basePath, pathname);

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

function safeArtifactUrl(value, { image = false } = {}) {
  const candidate = String(value ?? '').trim();
  if (!candidate) return null;
  if (!image && candidate.startsWith('#')) return candidate;
  try {
    const protocol = new URL(candidate).protocol;
    const allowed = image ? ['http:', 'https:'] : ['http:', 'https:', 'mailto:', 'tel:'];
    return allowed.includes(protocol) ? candidate : null;
  } catch {
    return null;
  }
}

const artifactRenderer = new Renderer();
artifactRenderer.link = function renderArtifactLink({ href, title, tokens }) {
  const label = this.parser.parseInline(tokens);
  const safeHref = safeArtifactUrl(href);
  if (!safeHref) return `<span class="artifact-disabled-link">${label}</span>`;
  const titleAttribute = title ? ` title="${escapeHtml(title)}"` : '';
  return `<a href="${escapeHtml(safeHref)}"${titleAttribute}>${label}</a>`;
};
artifactRenderer.image = function renderArtifactImage({ href, title, text, tokens }) {
  const safeHref = safeArtifactUrl(href, { image: true });
  const alt = tokens ? this.parser.parseInline(tokens, this.parser.textRenderer) : String(text ?? '');
  if (!safeHref) return escapeHtml(alt);
  const titleAttribute = title ? ` title="${escapeHtml(title)}"` : '';
  return `<img src="${escapeHtml(safeHref)}" alt="${escapeHtml(alt)}"${titleAttribute} loading="lazy">`;
};

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
const rawArtifactRegistryFile = path.join(wikiDir, 'meta', 'raw-artifacts.yml');
const rawArtifactRegistryData = yaml.safeLoad(await fs.readFile(rawArtifactRegistryFile, 'utf8')) ?? {};
const rawArtifactRegistry = new Map();
for (const record of rawArtifactRegistryData.artifacts ?? []) {
  const artifactPath = normalizeArtifactPath(record?.path);
  if (!artifactPath) continue;
  if (rawArtifactRegistry.has(artifactPath)) throw new Error(`Duplicate raw artifact registry path: ${artifactPath}`);
  rawArtifactRegistry.set(artifactPath, { ...record, path: artifactPath });
}
const loadedDocuments = await loadMarkdownDocuments(wikiDir);
const documents = loadedDocuments.map((loadedDocument) => {
  const { absolutePath, relativePath, filename, content, data } = loadedDocument;
  const parts = relativePath.split('/');
  const category = parts.length > 1 && categoryMeta[parts[0]] ? parts[0] : 'meta';
  const firstHeading = content.match(/^#\s+(.+)$/m)?.[1]?.trim();
  const title = String(data.title ?? firstHeading ?? filename);

  return {
    id: String(data.id ?? relativePath.replace(/\.md$/i, '')),
    absolutePath,
    relativePath,
    filename,
    category,
    pageType: String(data.page_type ?? ({
      sources: 'source',
      concepts: 'concept',
      entities: 'entity',
      analyses: 'analysis',
      meta: 'meta',
    }[category] ?? 'meta')),
    title,
    aliases: asStringArray(data.aliases),
    tags: asStringArray(data.tags),
    artifacts: asStringArray(data.artifacts),
    evidence: asObjectArray(data.evidence),
    related: asStringArray(data.related),
    lifecycle: String(data.lifecycle ?? 'active'),
    verification: String(data.verification ?? 'unverified'),
    created: formatDate(data.created),
    updated: formatDate(data.updated),
    body: content.trim(),
    url: routeFor(relativePath, category, filename),
    sourceNumber: category === 'sources' ? filename.match(/^(\d{3})/)?.[1] ?? '' : '',
    excerpt: truncate(firstParagraph(content), 210),
    minutes: readingMinutes(content),
    outgoing: [],
    graphOutgoing: [],
    backlinks: [],
    relatedDocuments: [],
    relatedBacklinks: [],
    meaningfulOutgoing: [],
    meaningfulBacklinks: [],
    artifactReaders: [],
  };
});

documents.sort((a, b) => collator.compare(a.relativePath, b.relativePath));

const categoryRank = ['concepts', 'sources', 'analyses', 'entities', 'meta'];
const wikiLookup = createWikiLookup(documents, {
  rankOf: (document) => categoryRank.indexOf(document.category),
});
const resolveWikiTarget = (value) => wikiLookup.resolve(value);

for (const document of documents) {
  document.evidence = document.evidence.map((entry) => ({
    ...entry,
    source: evidenceRegistry.get(entry.sourceId) ?? null,
  }));
  document.relatedDocuments = document.related
    .map(wikiLookup.resolveId)
    .filter((item) => item && item !== document && item.category !== 'meta');
}

for (const document of documents) {
  for (const relatedDocument of document.relatedDocuments) {
    relatedDocument.relatedBacklinks.push(document);
  }
}

const unresolved = new Map();
let resolvedLinkCount = 0;

for (const document of documents) {
  const outgoing = new Set();
  const graphOutgoing = new Set();
  const narrativeBody = markdownBeforeFinalH2(document.body, '관련 항목');
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
  for (const rawLink of extractWikiLinks(narrativeBody)) {
    const resolved = resolveWikiTarget(rawLink);
    if (resolved.document && resolved.document !== document) graphOutgoing.add(resolved.document);
  }
  document.graphOutgoing = [...graphOutgoing];
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

for (const document of documents) document.graphIncoming = [];
for (const document of documents) {
  for (const target of document.graphOutgoing) target.graphIncoming.push(document);
}
for (const document of documents) {
  document.graphNeighbors = [...new Set([
    ...document.graphOutgoing,
    ...document.relatedDocuments,
    ...document.graphIncoming,
    ...document.relatedBacklinks,
  ])]
    .filter((item) => item !== document && item.category !== 'meta')
    .sort((a, b) => collator.compare(a.title, b.title));
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
const graphData = buildKnowledgeGraph(publishedDocuments, {
  urlFor: (document) => sitePath(document.url),
  tagLabel,
});

const artifactReaders = [];
for (const document of grouped.sources) {
  const routeRoles = new Set();
  for (const declaredPath of document.artifacts) {
    const artifactPath = normalizeArtifactPath(declaredPath);
    const record = rawArtifactRegistry.get(artifactPath);
    const role = artifactRoleMetadata(record?.role);
    if (!record || !role) continue;
    if (routeRoles.has(role.routeRole)) {
      throw new Error(`Source ${document.id} declares more than one ${role.routeRole} artifact reader.`);
    }

    const absolutePath = resolveRawArtifactPath({ rootDir, rawDir, artifactPath });
    const rawMarkdown = await fs.readFile(absolutePath, 'utf8');
    const parsed = matter(rawMarkdown);
    const body = normalizeArtifactMarkdown(parsed.content, {
      sourceOrigin: sourceOriginForArtifact(parsed.content),
    });
    const reader = {
      id: `${document.id}.${role.routeRole}`,
      title: `${document.title} — ${role.label}`,
      body,
      excerpt: truncate(firstParagraph(body), 210),
      minutes: readingMinutes(body),
      url: `${document.url}${role.routeRole}/`,
      sourceDocument: document,
      sourceNumber: document.sourceNumber,
      artifactPath,
      registryRole: String(record.role),
      routeRole: role.routeRole,
      label: role.label,
      description: role.description,
      directory: role.directory,
    };
    routeRoles.add(role.routeRole);
    document.artifactReaders.push(reader);
    artifactReaders.push(reader);
  }
}
const translationReaders = artifactReaders.filter((reader) => reader.directory);

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
    'domain/academia': '학술 제도',
    'domain/ai': 'AI',
    'domain/cognitive-science': '인지과학',
    'domain/computer-science': '컴퓨터과학',
    'domain/computer-vision': '컴퓨터 비전',
    'domain/nlp': 'NLP',
    'domain/conversational-ai': '대화형 AI',
    'domain/human-computer-interaction': '인간-컴퓨터 상호작용',
    'domain/linguistics': '언어학',
    'domain/machine-learning': '기계 학습',
    'domain/optimization': '최적화',
    'domain/psychology': '심리학',
    'domain/signal-processing': '신호 처리',
    'domain/speech-processing': '음성 처리',
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
  const rendered = protectRenderedMath(katex.renderToString(expression.trim(), {
    displayMode,
    throwOnError: false,
    strict: false,
    output: 'htmlAndMathml',
  }));
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

function renderMarkdown(document, { artifact = false } = {}) {
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
  if (artifact) prepared = prepared.replaceAll('<', '&lt;').replaceAll('>', '&gt;');
  prepared = renderWikiLinks(prepared, document);
  prepared = prepared.replace(/@@LLMWIKI_FRAGMENT_(\d+)@@/g, (_match, index) => protectedFragments[Number(index)]);

  let html = marked.parse(prepared, artifact ? { renderer: artifactRenderer } : undefined);
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

function layout({ title, description, current = '', body, pageClass = '', scripts = [] }) {
  const fullTitle = title === 'LLM Wiki' ? title : `${title} · LLM Wiki`;
  const pageScripts = scripts.map((script) => {
    const record = typeof script === 'string' ? { src: script } : script;
    const loadingAttribute = record.type === 'module' ? ' type="module"' : ' defer';
    return `<script src="${sitePath(record.src)}"${loadingAttribute}></script>`;
  }).join('\n  ');
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
  ${pageScripts}
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
        ${navLink('/graph/', '그래프', current)}
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
    <div class="footer-identity">
      <a class="footer-mark" href="${sitePath('/')}">LLM Wiki</a>
      <p><strong>공개 콘텐츠 ${publishedDocuments.length}개</strong> + <strong>안내 ${grouped.meta.length}개</strong>로 구성한 LLM 역사 아카이브.</p>
    </div>
    <nav class="footer-meta" aria-label="보조 메뉴">
      <span>최근 문서 갱신 ${escapeHtml(latestUpdate)}</span>
      <a href="${sitePath('/search/')}">전체 검색</a>
      <a href="${sitePath('/graph/')}">지식 그래프</a>
      <a href="${sitePath('/translations/')}">번역본 모아보기</a>
      <a href="${sitePath('/about/')}">위키 안내</a>
      <a href="${sitePath('/log/')}">변경 기록</a>
      ${externalLink(repositoryUrl, 'GitHub 저장소')}
    </nav>
  </footer>
</body>
</html>`;
}

function meaningfulConnectionCount(document) {
  return document.graphNeighbors?.length ?? document.meaningfulOutgoing.length;
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
  const heroSourcePreview = grouped.sources.slice(-6).reverse();
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
        <a class="button-link graph-home-link" href="${sitePath('/graph/')}">문서 ${graphData.stats.nodes}개의 연결 지도 열기 <span aria-hidden="true">→</span></a>
      </div>
      <nav class="hero-collage hero-source-strip" aria-label="최근 원문 노트 빠른 이동">
        <p class="collage-label">최근 원문 노트</p>
        <ul class="hero-source-list">${heroSourcePreview.map((document) => `<li class="hero-source-item"><a href="${sitePath(document.url)}"><span>${escapeHtml(document.sourceNumber || String(grouped.sources.indexOf(document) + 1).padStart(3, '0'))}</span><strong>${escapeHtml(document.title)}</strong></a></li>`).join('')}</ul>
        <a class="hero-source-all" href="${sitePath('/sources/')}"><strong>전체 원문 노트 ${grouped.sources.length}개 보기</strong><span aria-hidden="true">→</span></a>
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

function renderGraphPage() {
  const typeLabels = {
    source: '원문 노트',
    reference: '참고 자료',
    concept: '개념',
    entity: '인물·기관',
    analysis: '비교 읽기',
  };
  const verificationOptions = [
    ['verified', '검증됨'],
    ['partial', '부분 검증'],
    ['disputed', '논쟁 중'],
    ['unverified', '미검증'],
  ];
  const nodesByCommunity = new Map(graphData.communities.map((community) => [
    community.id,
    graphData.nodes
      .filter((node) => node.community === community.id)
      .sort((a, b) => collator.compare(a.title, b.title)),
  ]));

  const body = `<main class="graph-main" id="main-content">
    <section class="graph-workbench" data-knowledge-graph data-graph-url="${sitePath('/graph-data.json')}">
      <div class="graph-fullscreen-root" id="knowledge-world" data-graph-fullscreen-root>
        <div class="graph-stage" data-graph-stage>
          <p class="sr-only" id="knowledge-graph-description">문서 ${graphData.stats.nodes}개와 방향 관계 ${graphData.stats.edges}개를 연결 집단, 관계 중심, 중심-주변 배치로 전환해 보는 WebGL 3D 지식 세계입니다. 노드 높이는 다른 집단에 속한 고유 이웃 수를 로그 눈금으로 나타냅니다. 궤도 카메라로 조망하거나 1인칭 비행으로 지식 세계 안을 이동할 수 있으며, 도움말에서 전체 조작법을 확인할 수 있습니다.</p>
          <canvas class="knowledge-graph" data-graph-canvas width="${graphData.dimensions.width}" height="${graphData.dimensions.height}" role="img" tabindex="0" aria-label="3D 지식 세계 조작 화면" aria-describedby="knowledge-graph-description">그래프를 지원하지 않는 환경에서는 아래 텍스트 목록으로 문서를 탐색할 수 있습니다.</canvas>
          <section class="relationship-explorer relationship-explorer--graph" data-relationship-explorer data-relationship-context="graph" data-graph-url="${sitePath('/graph-data.json')}" aria-label="모바일 연결 탐색기">
            <p class="relationship-explorer__loading" role="status">연결 데이터를 불러오는 중입니다.</p>
          </section>
          <p class="graph-static-message" data-graph-static-message>지식 세계를 불러오는 중입니다.</p>

          <header class="graph-game-header" data-graph-hud>
            <div class="graph-world-title">
              <p class="eyebrow">LLM Wiki · 3D 탐험</p>
              <h1>지식 세계</h1>
              <p><strong data-graph-visible-count>${graphData.stats.nodes}</strong>개 문서 · <strong>${graphData.stats.communities}</strong>개 연결 집단</p>
            </div>

            <form class="graph-controls" data-graph-controls>
              <div class="graph-control graph-control--search">
                <label for="graph-search">문서 찾기</label>
                <div class="graph-search-row">
                  <input id="graph-search" type="search" list="graph-node-options" autocomplete="off" placeholder="제목 또는 별칭" data-graph-search>
                  <button type="submit" data-graph-select>이동</button>
                </div>
                <datalist id="graph-node-options">${graphData.nodes.map((node) => `<option value="${escapeHtml(node.title)}"></option>`).join('')}</datalist>
              </div>

              <section class="graph-settings-panel" id="graph-world-settings" data-graph-settings hidden role="dialog" aria-modal="true" aria-label="지식 세계 설정">
                <div class="graph-panel-heading">
                  <div><span>세계 설정</span><strong>표시와 움직임</strong></div>
                  <button type="button" data-graph-settings-close>닫기</button>
                </div>
                <div class="graph-filter-grid">
                  <div class="graph-control graph-control--layout">
                    <label for="graph-layout">노드 배치</label>
                    <select id="graph-layout" data-graph-layout aria-describedby="graph-layout-description">
                      ${graphData.layouts.map((layout) => `<option value="${escapeHtml(layout.id)}"${layout.id === graphData.defaultLayout ? ' selected' : ''}>${escapeHtml(layout.label)}</option>`).join('')}
                    </select>
                    <p id="graph-layout-description" data-graph-layout-description>${escapeHtml(graphData.layouts.find((layout) => layout.id === graphData.defaultLayout)?.description ?? '')}</p>
                  </div>
                  <div class="graph-control">
                    <label for="graph-type">문서 유형</label>
                    <select id="graph-type" data-graph-type>
                      <option value="">전체 유형</option>
                      ${Object.entries(typeLabels).map(([value, label]) => `<option value="${value}">${label}</option>`).join('')}
                    </select>
                  </div>
                  <div class="graph-control">
                    <label for="graph-verification">검증 상태</label>
                    <select id="graph-verification" data-graph-verification>
                      <option value="">전체 상태</option>
                      ${verificationOptions.map(([value, label]) => `<option value="${value}">${label}</option>`).join('')}
                    </select>
                  </div>
                  <div class="graph-control">
                    <label for="graph-relation">관계 근거</label>
                    <select id="graph-relation" data-graph-relation>
                      <option value="related">편집자가 고른 관계</option>
                      <option value="all">모든 명시 관계</option>
                      <option value="body">서술 본문 링크</option>
                    </select>
                  </div>
                  <div class="graph-control">
                    <label for="graph-community">연결 집단</label>
                    <select id="graph-community" data-graph-community>
                      <option value="">모든 집단</option>
                      ${graphData.communities.map((community) => `<option value="${community.id}">${String(community.id + 1).padStart(2, '0')} · ${escapeHtml(community.label)} (${community.size})</option>`).join('')}
                    </select>
                  </div>
                  <div class="graph-control graph-desktop-settings-only">
                    <label for="graph-density">연결 밀도</label>
                    <select id="graph-density" data-graph-density>
                      <option value="backbone">핵심 구조</option>
                      <option value="balanced">균형</option>
                      <option value="all">전체 관계</option>
                    </select>
                  </div>
                  <div class="graph-control">
                    <label for="graph-local-depth">선택 주변</label>
                    <select id="graph-local-depth" data-graph-local-depth>
                      <option value="0">전체 세계</option>
                      <option value="1">1단계 이웃</option>
                      <option value="2">2단계 이웃</option>
                      <option value="3">3단계 이웃</option>
                    </select>
                  </div>
                </div>
                <div class="graph-range-grid graph-desktop-settings-only">
                  <div><label for="graph-label-density">라벨 <output for="graph-label-density" data-graph-label-output>핵심</output></label><input id="graph-label-density" type="range" min="0" max="3" step="1" value="2" data-graph-label-density></div>
                  <div><label for="graph-node-scale">노드 크기 <output for="graph-node-scale" data-graph-node-output>125%</output></label><input id="graph-node-scale" type="range" min="0.8" max="2.2" step="0.05" value="1.25" data-graph-node-scale></div>
                  <div><label for="graph-edge-opacity">연결 선명도 <output for="graph-edge-opacity" data-graph-edge-output>48%</output></label><input id="graph-edge-opacity" type="range" min="0.15" max="1.2" step="0.05" value="0.48" data-graph-edge-opacity></div>
                  <div><label for="graph-edge-width">강조 선 굵기 <output for="graph-edge-width" data-graph-width-output>72%</output></label><input id="graph-edge-width" type="range" min="0.45" max="1.6" step="0.05" value="0.72" data-graph-edge-width></div>
                  <div><label for="graph-focus-gravity">선택 중력 <output for="graph-focus-gravity" data-graph-focus-gravity-output>100%</output></label><input id="graph-focus-gravity" type="range" min="0.45" max="1.4" step="0.05" value="1" data-graph-focus-gravity></div>
                  <div><label for="graph-height-scale">3D 높이 <output for="graph-height-scale" data-graph-height-output>100%</output></label><input id="graph-height-scale" type="range" min="0" max="1.6" step="0.1" value="1" data-graph-height-scale></div>
                  <div><label for="graph-flight-speed">비행 속도 <output for="graph-flight-speed" data-graph-flight-output>보통</output></label><input id="graph-flight-speed" type="range" min="0.5" max="2" step="0.1" value="1" data-graph-flight-speed></div>
                  <div><label for="graph-fov">시야각 <output for="graph-fov" data-graph-fov-output>56°</output></label><input id="graph-fov" type="range" min="42" max="78" step="2" value="56" data-graph-fov></div>
                </div>
                <div class="graph-switch-grid">
                  <label class="graph-desktop-settings-only"><input type="checkbox" checked data-graph-show-arrows> 방향 화살표</label>
                  <label class="graph-desktop-settings-only"><input type="checkbox" checked data-graph-show-grid> 바닥 격자</label>
                  <label class="graph-desktop-settings-only"><input type="checkbox" checked data-graph-show-communities> 집단 영역</label>
                  <label><input type="checkbox" checked data-graph-show-orphans> 고립 문서</label>
                  <label class="graph-desktop-settings-only"><input type="checkbox" data-graph-auto-rotate> 자동 회전</label>
                </div>
                <button class="graph-reset" type="reset" data-graph-reset>모든 설정 초기화</button>
              </section>
            </form>

            <div class="graph-hud-actions" aria-label="지식 세계 메뉴">
              <button type="button" data-graph-settings-toggle aria-expanded="false" aria-controls="graph-world-settings">설정</button>
              <button type="button" data-graph-help-open>조작법</button>
              <button type="button" data-graph-fullscreen aria-pressed="false" aria-controls="knowledge-world">전체 화면</button>
            </div>
          </header>

          <div class="graph-depth-badge" role="note" aria-label="노드 높이는 다른 집단에 속한 고유 이웃 수를 로그 눈금으로 나타냅니다."><span>노드 높이</span><strong>다른 집단 이웃 수</strong><small>높을수록 집단 사이를 많이 잇습니다 · 로그 눈금</small></div>
          <div class="graph-engine-badge" data-graph-renderer aria-hidden="true">3D 엔진 준비 중</div>
          <div class="graph-hover-card" data-graph-hover-card hidden></div>

          <section class="graph-fps-layer" data-graph-fps-layer hidden aria-label="1인칭 비행 조작">
            <div class="graph-reticle" data-graph-reticle aria-hidden="true"><i></i><i></i><i></i><i></i><b></b></div>
            <p class="graph-fps-target" data-graph-fps-target>중앙의 노드를 조준하세요.</p>
            <button class="graph-pointer-lock" type="button" data-graph-pointer-lock aria-pressed="false">화면을 클릭해 비행 시작</button>
            <div class="graph-fps-pad" data-graph-fps-pad aria-label="터치 비행 조작">
              <button type="button" data-graph-fps-move="forward" aria-label="앞으로 이동">W</button>
              <button type="button" data-graph-fps-move="left" aria-label="왼쪽 이동">A</button>
              <button type="button" data-graph-fps-move="backward" aria-label="뒤로 이동">S</button>
              <button type="button" data-graph-fps-move="right" aria-label="오른쪽 이동">D</button>
              <button type="button" data-graph-fps-move="up" aria-label="위로 이동">↑</button>
              <button type="button" data-graph-fps-move="down" aria-label="아래로 이동">↓</button>
              <button type="button" data-graph-fps-select aria-label="조준한 문서 선택">선택</button>
            </div>
          </section>

          <details class="graph-view-controls">
            <summary>카메라</summary>
            <div class="graph-camera-controls" aria-label="3D 그래프 카메라">
              <button type="button" data-graph-orbit="left">왼쪽 회전</button>
              <button type="button" data-graph-orbit="right">오른쪽 회전</button>
              <button type="button" data-graph-orbit="higher">위에서 보기</button>
              <button type="button" data-graph-orbit="lower">낮게 보기</button>
              <button type="button" data-graph-pan="left">왼쪽 이동</button>
              <button type="button" data-graph-pan="right">오른쪽 이동</button>
              <button type="button" data-graph-pan="up">위로 이동</button>
              <button type="button" data-graph-pan="down">아래로 이동</button>
              <button type="button" data-graph-zoom="in">확대</button>
              <button type="button" data-graph-zoom="out">축소</button>
              <button type="button" data-graph-focus-selection>선택에 초점</button>
              <button type="button" data-graph-view="flat" aria-pressed="false">2D 평면</button>
              <button type="button" data-graph-view="reset">전체 맞춤</button>
            </div>
          </details>

          <div class="graph-utility-dock" data-graph-utility-dock role="toolbar" aria-label="그래프 보조 도구">
            <button type="button" data-graph-inspector-toggle aria-pressed="false" aria-controls="graph-inspector" disabled>현장 카드</button>
            <button type="button" data-graph-minimap-toggle aria-expanded="false" aria-controls="graph-minimap">지도</button>
            <button type="button" data-graph-fit-visible>전체 맞춤</button>
          </div>

          <figure class="graph-minimap" id="graph-minimap" data-graph-minimap-panel hidden>
            <figcaption><span>원형 세계 지도</span><button type="button" data-graph-minimap-close>숨기기</button></figcaption>
            <canvas width="160" height="160" data-graph-minimap role="img" aria-label="현재 배치와 문서의 원형 세계 지도. 문서 선택은 주 그래프나 텍스트 목록에서도 할 수 있습니다."></canvas>
          </figure>

          <aside class="graph-inspector" id="graph-inspector" data-graph-inspector aria-label="선택한 문서 정보" aria-hidden="true">
            <div class="graph-inspector-toolbar">
              <span>현장 카드</span>
              <div>
                <button type="button" data-graph-clear-selection>선택 해제</button>
                <button type="button" data-graph-inspector-close>숨기기</button>
              </div>
            </div>
            <div data-graph-inspector-content>
              <h2>문서를 선택하세요</h2>
              <p>노드를 선택하면 실제 문서 링크와 연결 방향을 확인하고, 경로의 출발점이나 표식으로 남길 수 있습니다.</p>
            </div>
          </aside>

          <div class="graph-route-hud" data-graph-route-hud hidden>
            <span data-graph-route-summary></span>
            <button type="button" data-graph-route-clear>경로 지우기</button>
          </div>

          <nav class="graph-travel-hud" aria-label="지식 세계 이동">
            <div class="graph-mode-switch" aria-label="탐험 모드">
              <button type="button" data-graph-mode="orbit" aria-pressed="true">궤도 탐색</button>
              <button type="button" data-graph-mode="travel" aria-pressed="false">연결 여행</button>
              <button type="button" data-graph-mode="first-person" aria-pressed="false">1인칭 비행</button>
            </div>
            <div class="graph-history-controls">
              <button type="button" data-graph-history="back" disabled>이전</button>
              <span data-graph-history-label>방문 기록 없음</span>
              <button type="button" data-graph-history="forward" disabled>다음</button>
            </div>
            <button type="button" data-graph-bookmarks disabled>표식 0</button>
            <span class="graph-travel-target" data-graph-travel-target>노드를 선택해 탐험을 시작하세요.</span>
          </nav>

          <div class="graph-camera-readout" data-graph-camera-readout>궤도 · 확대 100%</div>
          <p class="graph-live-status" data-graph-status role="status" aria-live="polite" aria-atomic="true"></p>

          <dialog class="graph-help-dialog" data-graph-help>
            <form method="dialog">
              <div class="graph-panel-heading">
                <div><span>조작법</span><strong>지식 세계 탐험</strong></div>
                <button type="submit">닫기</button>
              </div>
              <dl class="graph-help-grid">
                <div><dt>회전</dt><dd>왼쪽 버튼을 누른 채 드래그</dd></div>
                <div><dt>이동</dt><dd>Shift+드래그, 가운데 또는 오른쪽 버튼 드래그</dd></div>
                <div><dt>확대</dt><dd>휠 또는 두 손가락 오므리기</dd></div>
                <div><dt>초점</dt><dd>노드를 두 번 클릭하거나 선택 후 C</dd></div>
                <div><dt>노드 형태</dt><dd>구체는 개념, 큐브는 원문, 팔면체는 인물·기관, 육각기둥은 비교 읽기</dd></div>
                <div><dt>노드 색</dt><dd>외피는 연결 집단, 내부 핵은 문서 유형, 외곽 셸은 검증 상태</dd></div>
                <div><dt>선택 중력</dt><dd>직접 연결 노드는 간격을 유지하며 가까워지고, 나머지는 어두워집니다. 선택 해제 시 원래 위치로 돌아갑니다.</dd></div>
                <div><dt>궤도 키보드</dt><dd>WASD 이동, Q/E 회전, +/− 확대, Home 전체 맞춤</dd></div>
                <div><dt>연결 여행</dt><dd>방향키로 이웃을 고르고 Enter로 이동</dd></div>
                <div><dt>1인칭 이동</dt><dd>WASD 비행, Space 상승, Ctrl 하강, Shift 가속</dd></div>
                <div><dt>1인칭 시선</dt><dd>화면 클릭 후 마우스로 시점 전환. 클릭 또는 Enter로 중앙 문서 선택</dd></div>
                <div><dt>모드</dt><dd>V로 궤도와 1인칭 전환, Esc로 마우스 시점 해제</dd></div>
                <div><dt>화면</dt><dd>F 전체 화면, Home 전체 조망, 탭 전환 시 이동 자동 정지</dd></div>
              </dl>
            </form>
          </dialog>
        </div>
      </div>

      <section class="graph-afterworld" aria-label="그래프 안내와 대체 탐색">
      <details class="graph-legend">
        <summary id="graph-legend-heading">그래프 읽는 법</summary>
        <div class="graph-legend-body" aria-labelledby="graph-legend-heading">
          <dl class="graph-visual-key">
            <div><dt><span class="graph-key-shape graph-key-shape--concept" aria-hidden="true"></span>구체</dt><dd>개념</dd></div>
            <div><dt><span class="graph-key-shape graph-key-shape--source" aria-hidden="true"></span>큐브</dt><dd>원문 노트</dd></div>
            <div><dt><span class="graph-key-shape graph-key-shape--entity" aria-hidden="true"></span>팔면체</dt><dd>인물·기관</dd></div>
            <div><dt><span class="graph-key-shape graph-key-shape--analysis" aria-hidden="true"></span>육각기둥</dt><dd>비교 읽기</dd></div>
            <div><dt><span class="graph-key-outline graph-key-outline--verified" aria-hidden="true"></span>실선 외곽</dt><dd>검증됨</dd></div>
            <div><dt><span class="graph-key-outline graph-key-outline--partial" aria-hidden="true"></span>점선 외곽</dt><dd>부분 검증</dd></div>
            <div><dt><span class="graph-key-line graph-key-line--related" aria-hidden="true"></span>연한 연결선</dt><dd>현재 보이는 문서 관계</dd></div>
            <div><dt><span class="graph-key-line graph-key-line--body" aria-hidden="true"></span>분홍·청록 이중 강조</dt><dd>선택 문서에서 나가는 관계·들어오는 관계</dd></div>
          </dl>
          <div class="graph-depth-key" data-graph-depth-legend>
            <strong>노드 높이 = 다른 집단의 고유 이웃 수 · 로그 눈금</strong>
            <div aria-label="다른 집단의 고유 이웃 수 로그 눈금: 0, 연결 노드 중앙값 ${graphData.stats.medianBridgeConnections}, 최대 ${graphData.stats.maxBridgeConnections}">
              <span>바닥 0</span><i aria-hidden="true"></i><span>연결 노드 중앙값 ${graphData.stats.medianBridgeConnections}</span><i aria-hidden="true"></i><span>최대 ${graphData.stats.maxBridgeConnections}</span>
            </div>
          </div>
        </div>
      </details>

      <details class="graph-text-index" data-graph-text-index>
        <summary>텍스트 목록으로 문서 탐색</summary>
        <p>그래프와 같은 문서를 연결 집단별 목록으로 제공합니다.</p>
        <div class="graph-text-communities">${graphData.communities.map((community) => `<section class="graph-text-community graph-community-${community.colorIndex % 14}"><h2>${escapeHtml(community.label)} <span>${community.size}</span></h2><ul>${nodesByCommunity.get(community.id).map((node) => `<li><a href="${node.url}">${escapeHtml(node.title)}</a><small>${escapeHtml(typeLabels[node.type] ?? node.type)} · 다른 집단의 고유 이웃 ${node.bridgeConnections}</small></li>`).join('')}</ul></section>`).join('')}</div>
      </details>
      </section>
    </section>
  </main>`;

  return layout({
    title: '지식 그래프',
    description: 'LLM Wiki 문서의 본문 링크와 관련 읽기를 연결 집단, 관계 중심, 중심-주변 배치와 다른 집단의 고유 이웃 수에 따른 높이로 탐색하는 3D 지식 그래프',
    current: '/graph/',
    body,
    pageClass: 'graph-page',
    scripts: [
      { src: '/assets/relationship-explorer.js', type: 'module' },
      { src: '/assets/graph-3d.js', type: 'module' },
    ],
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
      ${key === 'sources' && translationReaders.length ? `<a class="translation-directory-link" href="${sitePath('/translations/')}"><span>별도 읽기</span><strong>번역본 ${translationReaders.length}개 모아보기</strong><span aria-hidden="true">→</span></a>` : ''}
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

function renderTranslationsPage() {
  const cards = translationReaders.map((reader) => `<li class="translation-card">
    <a href="${sitePath(reader.url)}">
      <span class="translation-number">${escapeHtml(reader.sourceNumber)}</span>
      <span class="translation-card-copy"><small>${escapeHtml(reader.label)}</small><strong>${escapeHtml(reader.sourceDocument.title)}</strong></span>
      <span class="translation-reading-time">${reader.minutes}분 읽기 <span aria-hidden="true">→</span></span>
    </a>
  </li>`).join('');
  const body = `<main id="main-content" class="listing-main translations-main">
    <header class="listing-hero translations-hero">
      <p class="eyebrow">한국어 보존 자료</p>
      <div><h1>번역본</h1><span class="listing-count">${translationReaders.length}</span></div>
      <p>검증·정정을 반영한 원문 노트와 나란히 읽을 수 있도록, 수집 당시의 한국어 번역 자료를 별도 독서 화면으로 제공합니다.</p>
    </header>
    <div class="translation-directory-heading"><div><p class="eyebrow">번호순 읽기</p><h2>번역 자료 목록</h2></div><a class="text-link" href="${sitePath('/sources/')}">원문 노트로 돌아가기</a></div>
    <ol class="translation-directory">${cards}</ol>
  </main>`;

  return layout({
    title: '번역본',
    description: 'LLM Wiki 원문 노트와 함께 읽는 한국어 번역 자료 모음',
    current: '/sources/',
    body,
    pageClass: 'listing-page translations-page',
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

function githubArtifactUrl(reader) {
  const encodedPath = reader.artifactPath.split('/').map(encodeURIComponent).join('/');
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

function breadcrumbForArtifact(reader) {
  const document = reader.sourceDocument;
  return `<ol>
    <li><a href="${sitePath('/')}">홈</a></li>
    <li><a href="${sitePath('/sources/')}">${escapeHtml(categoryMeta.sources.label)}</a></li>
    <li><a href="${sitePath(document.url)}">${escapeHtml(document.title)}</a></li>
    <li><span aria-current="page">${escapeHtml(reader.label)}</span></li>
  </ol>`;
}

function renderArtifactSwitcher(document, activeRole = 'note') {
  if (!document.artifactReaders.length) return '';
  const destinations = [
    { routeRole: 'note', label: '원문 노트', url: document.url },
    ...document.artifactReaders,
  ];
  return `<nav class="reading-switcher" aria-label="이 소스의 자료 보기">
    <span class="reading-switcher-label">자료 보기</span>
    <div class="reading-switcher-links">${destinations.map((destination, index) => {
      const active = destination.routeRole === activeRole;
      return `<a class="reading-switcher-link reading-switcher-link--${index + 1}" href="${sitePath(destination.url)}"${active ? ' aria-current="page"' : ''}><span>${String(index + 1).padStart(2, '0')}</span><strong>${escapeHtml(destination.label)}</strong></a>`;
    }).join('')}</div>
  </nav>`;
}

function renderToc(headings) {
  if (!headings.length) return '<p class="toc-empty">하위 목차 없음</p>';
  return `<ol>${headings.map((heading) => `<li class="toc-depth-${heading.depth}"><a href="#${heading.id}">${escapeHtml(heading.label)}</a></li>`).join('')}</ol>`;
}

function renderEvidenceLedger(document) {
  const entries = document.evidence.map((entry, index) => {
    const source = entry.source ?? {};
    const sourceTitle = source.title || entry.sourceId;
    const authors = asStringArray(source.authors).join(', ');
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

function relationshipDirection(document, target) {
  const outgoing = document.graphOutgoing.includes(target) || document.relatedDocuments.includes(target);
  const incoming = document.graphIncoming.includes(target) || document.relatedBacklinks.includes(target);
  if (outgoing && incoming) return '서로 가리킴';
  return outgoing ? '이 문서에서 가리킴' : '이 문서를 가리킴';
}

function relationshipBasis(document, target) {
  const curated = document.relatedDocuments.includes(target) || document.relatedBacklinks.includes(target);
  const body = document.graphOutgoing.includes(target) || document.graphIncoming.includes(target);
  if (curated && body) return '편집 관계 + 본문 링크';
  return curated ? '편집 관계' : '본문 링크';
}

function renderRelationshipPreview(document) {
  const preview = [...new Set([
    ...document.relatedDocuments,
    ...document.relatedBacklinks,
    ...document.graphOutgoing,
    ...document.graphIncoming,
  ])]
    .filter((item) => item !== document && item.category !== 'meta')
    .slice(0, 3);
  const items = preview.map((item, index) => `<li>
    <a href="${sitePath(item.url)}">
      <span class="relationship-preview__index" aria-hidden="true">${String(index + 1).padStart(2, '0')}</span>
      <span class="relationship-preview__copy">
        <span>${escapeHtml(categoryMeta[item.category].singular)} · ${escapeHtml(relationshipBasis(document, item))} · ${escapeHtml(relationshipDirection(document, item))}</span>
        <strong>${escapeHtml(item.title)}</strong>
      </span>
      ${verificationBadge(item)}
    </a>
  </li>`).join('');
  const count = meaningfulConnectionCount(document);
  return `<section class="relationship-preview" id="relationship-preview" aria-labelledby="relationship-preview-heading">
    <header class="relationship-preview__header">
      <div><p>연결 탐색</p><h2 id="relationship-preview-heading">관련 문서</h2></div>
      <span>직접 연결 ${count}개</span>
    </header>
    ${items ? `<ol class="relationship-preview__list">${items}</ol>` : '<p class="relationship-preview__empty">직접 연결된 공개 문서가 없습니다.</p>'}
    <a class="relationship-preview__open" href="#relationship-explorer-dialog" data-open-relationship-dialog aria-controls="relationship-explorer-dialog">연결 모두 보기</a>
    <noscript><p class="relationship-preview__noscript"><a href="${sitePath('/graph/')}">지식 그래프에서 문서 찾기</a></p></noscript>
  </section>
  <dialog class="relationship-dialog" id="relationship-explorer-dialog" data-relationship-dialog aria-labelledby="relationship-dialog-title">
    <div class="relationship-dialog__frame">
      <header class="relationship-dialog__toolbar">
        <strong id="relationship-dialog-title">연결 탐색</strong>
        <button type="button" data-close-relationship-dialog>닫기</button>
      </header>
      <section class="relationship-explorer relationship-explorer--article" data-relationship-explorer data-relationship-context="article" data-focus-id="${escapeHtml(document.id)}" data-graph-url="${sitePath('/graph-data.json')}" aria-label="${escapeHtml(document.title)} 연결 탐색기">
        <p class="relationship-explorer__loading" role="status">연결 데이터를 불러오는 중입니다.</p>
      </section>
    </div>
  </dialog>`;
}

function renderArticle(document) {
  const rendered = renderMarkdown(document);
  const siblings = grouped[document.category];
  const position = siblings.indexOf(document);
  const previous = position > 0 ? siblings[position - 1] : null;
  const next = position >= 0 && position < siblings.length - 1 ? siblings[position + 1] : null;
  const aliases = document.aliases.filter((alias) => normalizeWikiName(alias) !== normalizeWikiName(document.title));

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
        <div><dt>연결</dt><dd><a class="article-connection-link" href="#relationship-preview" data-open-relationship-dialog aria-controls="relationship-explorer-dialog">직접 연결 ${meaningfulConnectionCount(document)}개</a></dd></div>
      </dl>
    </header>
    ${reviewNote}
    ${document.pageType === 'source' ? renderArtifactSwitcher(document) : ''}
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
    ${renderRelationshipPreview(document)}
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
    scripts: [{ src: '/assets/relationship-explorer.js', type: 'module' }],
  });
}

function renderArtifactReader(reader) {
  const document = reader.sourceDocument;
  const rendered = renderMarkdown(reader, { artifact: true });
  const body = `<main id="main-content" class="article-main artifact-main">
    <nav class="breadcrumbs" aria-label="현재 위치">${breadcrumbForArtifact(reader)}</nav>
    <header class="article-hero artifact-hero">
      <div class="article-title-block">
        <div class="article-kicker"><span>${escapeHtml(reader.label)}</span><span>No. ${escapeHtml(document.sourceNumber)}</span></div>
        <h1 id="article-title">${escapeHtml(document.title)}</h1>
        <p class="article-summary">${escapeHtml(reader.description)}</p>
      </div>
      <dl class="article-facts">
        <div><dt>자료 유형</dt><dd>${escapeHtml(reader.label)}</dd></div>
        <div><dt>보존 역할</dt><dd>${escapeHtml(reader.registryRole)}</dd></div>
        <div><dt>읽기</dt><dd>약 ${reader.minutes}분</dd></div>
        <div><dt>기준 문서</dt><dd>No. ${escapeHtml(document.sourceNumber)}</dd></div>
      </dl>
    </header>
    ${renderArtifactSwitcher(document, reader.routeRole)}
    <div class="artifact-preservation-banner"><strong>보존 자료</strong><span>수집 당시의 번역·해설을 그대로 보여 줍니다. 사실 검증과 정정은 원문 노트를 기준으로 확인하세요.</span></div>
    <div class="article-layout artifact-layout">
      <aside class="article-sidebar">
        <details class="toc-card" data-toc-details open>
          <summary>이 자료의 목차</summary>
          <nav aria-label="자료 목차">${renderToc(rendered.headings)}</nav>
        </details>
      </aside>
      <div class="article-reading">
        <article class="article-body artifact-body" aria-labelledby="article-title">${rendered.html}</article>
        <div class="source-note article-source-note artifact-source-note">
          <span>보존 파일</span>
          <code>${escapeHtml(reader.artifactPath)}</code>
          ${externalLink(githubArtifactUrl(reader), 'GitHub에서 보기')}
        </div>
      </div>
    </div>
    <section class="artifact-return" aria-labelledby="artifact-return-heading">
      <div><p class="eyebrow">검증된 설명</p><h2 id="artifact-return-heading">정정과 근거는 원문 노트에서</h2><p>번역본은 원문의 흐름을 읽기 위한 자료입니다. 역사적 사실, 과장된 계보와 후대 평가는 근거 장부가 있는 공개 노트에서 확인할 수 있습니다.</p></div>
      <a class="button-link" href="${sitePath(document.url)}">원문 노트 읽기 <span aria-hidden="true">→</span></a>
    </section>
  </main>`;

  return layout({
    title: reader.title,
    description: reader.description,
    current: '/sources/',
    body,
    pageClass: `article-page artifact-page artifact-page--${reader.routeRole}`,
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

async function writeHtml(outputDir, url, html) {
  const outputPath = outputFileForUrl(url, { outputDir });
  if (!outputPath) throw new Error(`Cannot map site URL to the build directory: ${url}`);
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, html, 'utf8');
}

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

const buildReport = {
  generatedAt: new Date().toISOString(),
  basePath,
  pages: documents.length + artifactReaders.length + 8,
  documents: documents.length,
  publishedDocuments: publishedDocuments.length,
  graph: graphData.stats,
  counts: Object.fromEntries(Object.keys(categoryMeta).map((key) => [key, grouped[key].length])),
  artifactCounts: {
    readers: artifactReaders.length,
    translations: translationReaders.length,
  },
  artifactReaders: artifactReaders.map((reader) => ({
    role: reader.routeRole,
    label: reader.label,
    url: reader.url,
    sourceUrl: reader.sourceDocument.url,
    listedAsTranslation: reader.directory,
  })),
  resolvedLinks: resolvedLinkCount,
  unresolvedLinks: [...unresolved.values()]
    .map((record) => ({ target: record.target, count: record.count, from: [...record.from].sort(collator.compare) }))
    .sort((a, b) => b.count - a.count || collator.compare(a.target, b.target)),
};

async function buildInto(outputDir) {
  await fs.rm(outputDir, { recursive: true, force: true });
  await fs.mkdir(outputDir, { recursive: true });
  await fs.cp(path.join(siteDir, 'assets'), path.join(outputDir, 'assets'), { recursive: true });
  await bundle({
    entryPoints: [path.join(siteDir, 'assets', 'graph-webgl-world.js')],
    outfile: path.join(outputDir, 'assets', 'graph-world.js'),
    bundle: true,
    format: 'esm',
    minify: true,
    sourcemap: false,
    target: ['es2022'],
    logLevel: 'silent',
  });
  await fs.copyFile(path.join(rootDir, 'node_modules', 'katex', 'dist', 'katex.min.css'), path.join(outputDir, 'assets', 'katex.min.css'));
  await fs.cp(path.join(rootDir, 'node_modules', 'katex', 'dist', 'fonts'), path.join(outputDir, 'assets', 'fonts'), { recursive: true });

  await writeHtml(outputDir, '/', renderHome());
  for (const key of ['sources', 'concepts', 'entities', 'analyses']) {
    await writeHtml(outputDir, `/${key}/`, renderCategoryPage(key));
  }
  await writeHtml(outputDir, '/translations/', renderTranslationsPage());
  await writeHtml(outputDir, '/graph/', renderGraphPage());
  await writeHtml(outputDir, '/search/', renderSearchPage());
  for (const document of documents) {
    if (document.url !== '/') await writeHtml(outputDir, document.url, renderArticle(document));
  }
  for (const reader of artifactReaders) {
    await writeHtml(outputDir, reader.url, renderArtifactReader(reader));
  }
  await fs.writeFile(path.join(outputDir, '404.html'), renderNotFound(), 'utf8');
  await fs.writeFile(path.join(outputDir, '.nojekyll'), '', 'utf8');
  await fs.writeFile(path.join(outputDir, 'graph-data.json'), JSON.stringify(graphData), 'utf8');
  await fs.writeFile(path.join(outputDir, 'search-index.json'), JSON.stringify(searchIndex), 'utf8');
  await fs.writeFile(path.join(outputDir, 'build-report.json'), JSON.stringify(buildReport, null, 2), 'utf8');
}

await buildDirectoryAtomically(distDir, buildInto);

console.log(`Built ${buildReport.pages} pages from ${documents.length} wiki documents and ${artifactReaders.length} artifact readers.`);
console.log(`Resolved ${resolvedLinkCount} wiki links; ${buildReport.unresolvedLinks.length} unresolved target(s).`);
