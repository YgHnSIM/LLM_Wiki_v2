import { promises as fs } from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import matter from 'gray-matter';
import yaml from 'js-yaml';
import katex from 'katex';
import { marked, Renderer } from 'marked';
import sanitizeHtml from 'sanitize-html';
import {
  artifactRoleMetadata,
  normalizeArtifactMarkdown,
  normalizeArtifactPath,
  resolveRawArtifactPath,
  sourceOriginForArtifact,
  sourceUrlForArtifact,
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
  slugify,
} from './lib/wiki-utils.mjs';
import { DIRECTORY_PAGE_SIZE, cleanDisplayAliases, normalizeText, primaryEvidence } from '../site/assets/ui-state.js';
import { isSubtitleDashPart, splitTitleAtSubtitleDash } from '../site/assets/title-format.js';

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

const commonSanitizeTags = [
  'a', 'abbr', 'article', 'b', 'blockquote', 'br', 'code', 'del', 'div', 'em',
  'figcaption', 'figure', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'hr', 'i', 'img',
  'kbd', 'li', 'ol', 'p', 'pre', 'small', 'span', 'strong', 'sub', 'sup', 'table',
  'tbody', 'td', 'tfoot', 'th', 'thead', 'tr', 'u', 'ul',
];
const learningGuideSanitizeTags = [
  ...commonSanitizeTags, 'button', 'fieldset', 'form', 'input', 'label', 'legend',
  'option', 'select', 'section',
];
const commonSanitizeAttributes = {
  a: ['href', 'title', 'target', 'rel', 'class', 'id', 'aria-label'],
  img: ['src', 'alt', 'title', 'loading', 'class', 'id'],
  '*': ['class', 'id', 'role', 'tabindex', 'aria-*', 'data-*'],
};
const learningGuideSanitizeAttributes = {
  ...commonSanitizeAttributes,
  button: ['type', 'name', 'value', 'class', 'id', 'aria-*', 'data-*'],
  form: ['action', 'method', 'class', 'id', 'novalidate', 'aria-*', 'data-*'],
  input: ['type', 'name', 'value', 'checked', 'disabled', 'class', 'id', 'for', 'aria-*', 'data-*'],
  label: ['for', 'class', 'id', 'aria-*', 'data-*'],
  option: ['value', 'selected', 'disabled', 'class', 'id', 'aria-*', 'data-*'],
  select: ['name', 'value', 'class', 'id', 'aria-*', 'data-*'],
};

function sanitizeRenderedHtml(html, { learningGuide = false, trustedFragments = [] } = {}) {
  const nonce = randomUUID();
  let protectedHtml = String(html);
  const replacements = trustedFragments.map((fragment, index) => {
    const token = `LLMWIKI_TRUSTED_${nonce}_${index}`;
    protectedHtml = protectedHtml.replace(fragment, token);
    return { fragment, token };
  });
  const cleaned = sanitizeHtml(protectedHtml, {
    allowedTags: learningGuide ? learningGuideSanitizeTags : commonSanitizeTags,
    allowedAttributes: learningGuide ? learningGuideSanitizeAttributes : commonSanitizeAttributes,
    allowedSchemes: ['http', 'https', 'mailto', 'tel'],
    allowedSchemesByTag: { img: ['http', 'https'] },
    allowProtocolRelative: false,
    disallowedTagsMode: 'escape',
    enforceHtmlBoundary: true,
  });
  return replacements.reduce((output, { fragment, token }) => output.replaceAll(token, fragment), cleaned);
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

const safeRenderer = new Renderer();
safeRenderer.link = function renderSafeLink({ href, title, tokens }) {
  const label = this.parser.parseInline(tokens);
  const safeHref = safeArtifactUrl(href);
  if (!safeHref) return `<span class="unsafe-link">${label}</span>`;
  const titleAttribute = title ? ` title="${escapeHtml(title)}"` : '';
  const external = /^https?:\/\//i.test(safeHref);
  return `<a href="${escapeHtml(safeHref)}"${titleAttribute}${external ? ' target="_blank" rel="noopener noreferrer"' : ''}>${label}</a>`;
};
safeRenderer.image = artifactRenderer.image;

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


function routeFor(relativePath, category, filename, id = '') {
  const normalized = relativePath.replaceAll('\\', '/');
  if (normalized === 'index.md') return '/';
  if (normalized === 'overview.md') return '/about/';
  if (normalized === 'log.md') return '/log/';
  if (id === 'meta.learning-guide') return '/guide/';
  const suffix = String(id).includes('.') ? String(id).slice(String(id).indexOf('.') + 1) : filename;
  return `/${category}/${suffix}/`;
}

function legacyRouteFor(relativePath, category, filename) {
  const normalized = relativePath.replaceAll('\\', '/');
  if (normalized === 'index.md') return '/';
  if (normalized === 'overview.md') return '/about/';
  if (normalized === 'log.md') return '/log/';
  if (normalized === 'meta/LLM 학습 가이드.md') return '/guide/';
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
  const id = String(data.id ?? relativePath.replace(/\.md$/i, ''));

  const review = data.review ?? {};
  const evidenceCoverage = String(review.evidence_coverage ?? data.verification ?? 'unverified');
  const contentMode = String(review.content_mode ?? 'descriptive');
  const legacyVerification = evidenceCoverage === 'not-applicable'
    ? 'not-applicable'
    : evidenceCoverage === 'unverified'
    ? 'unverified'
    : contentMode === 'contested'
      ? 'disputed'
      : evidenceCoverage === 'partial' || contentMode === 'synthesis'
        ? 'partial'
        : 'verified';
  const learningTargets = [
    ...(Array.isArray(data.learning?.prerequisites) ? data.learning.prerequisites : []),
    ...(Array.isArray(data.learning?.next) ? data.learning.next : []),
  ].map((item) => String(item?.target ?? '').trim()).filter(Boolean);
  const relationTargets = (Array.isArray(data.relations) ? data.relations : [])
    .map((item) => String(item?.target ?? '').trim()).filter(Boolean);
  return {
    id,
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
    related: [...new Set([...learningTargets, ...relationTargets])],
    relations: Array.isArray(data.relations) ? data.relations : [],
    learning: data.learning ?? null,
    lifecycle: String(data.editorial_status ?? data.lifecycle ?? 'active'),
    editorialStatus: String(data.editorial_status ?? data.lifecycle ?? 'active'),
    verification: legacyVerification,
    evidenceCoverage,
    contentMode,
    created: formatDate(data.created),
    updated: formatDate(data.updated),
    body: content.trim(),
    // The guide is an intentional top-level learning entry point rather than
    // another item in the meta-document directory. Resolve its canonical URL
    // from the durable page id so wiki links and search entries agree.
    url: routeFor(relativePath, category, filename, id),
    sourceNumber: id.match(/^source\.(\d{3})$/)?.[1] ?? '',
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
    if (a.category === 'sources' && b.category === 'sources') {
      if (a.sourceNumber && b.sourceNumber) return collator.compare(a.sourceNumber, b.sourceNumber);
      if (a.sourceNumber) return -1;
      if (b.sourceNumber) return 1;
    }
    return collator.compare(a.title, b.title);
  });
}

const sourceDocuments = grouped.sources.filter((document) => document.pageType === 'source');
const referenceDocuments = grouped.sources.filter((document) => document.pageType === 'reference');
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
    const sourceUrl = sourceUrlForArtifact(parsed.content, record.source_url);
    const body = normalizeArtifactMarkdown(parsed.content, {
      sourceOrigin: sourceOriginForArtifact(parsed.content, 'https://mbrenndoerfer.com', sourceUrl),
      hideSourceMarker: role.hideSourceMarker,
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
      sourceUrl,
      routeRole: role.routeRole,
      label: role.label,
      switcherLabel: role.switcherLabel ?? role.label,
      description: role.description,
      directory: role.directory,
    };
    routeRoles.add(role.routeRole);
    document.artifactReaders.push(reader);
    artifactReaders.push(reader);
  }
}
const translationReaders = artifactReaders.filter((reader) => reader.directory);

const legacySourceCompatibility = new Map([
  ['source.048', { legacyPrefix: '047' }],
  ['source.049', { legacyPrefix: '048' }],
  ['source.050', { legacyPrefix: '049' }],
  ['source.051', { legacyPrefix: '050' }],
  ['source.052', { legacyPrefix: '051' }],
  ['source.053', { legacyPrefix: '052' }],
  ['source.054', { legacyPrefix: '053' }],
  ['source.055', { legacyPrefix: '054' }],
  ['source.056', { legacyPrefix: '055' }],
  ['source.057', { legacyPrefix: '056' }],
  ['source.058', { legacyPrefix: '057' }],
  ['source.059', { legacyPrefix: '058' }],
  ['source.060', { legacyPrefix: '059' }],
  ['source.061', { legacyPrefix: '060' }],
  ['source.062', { legacyPrefix: '061' }],
  ['source.063', { legacyPrefix: '062' }],
  ['source.064', { legacyPrefix: '063' }],
  ['source.065', { legacyPrefix: '064' }],
  ['source.066', { legacyPrefix: '065' }],
  ['source.067', { legacyPrefix: '066' }],
  ['source.068', { legacyPrefix: '067' }],
  ['source.069', { legacyPrefix: '068' }],
  ['source.070', { legacyPrefix: '069' }],
  ['source.071', { legacyPrefix: '070' }],
  ['source.072', { legacyPrefix: '071' }],
  ['source.073', { legacyPrefix: '072' }],
  ['source.074', { legacyPrefix: '073' }],
  ['source.075', { legacyPrefix: '074' }],
  ['source.076', { legacyPrefix: '075' }],
  ['source.077', { legacyPrefix: '076' }],
  ['source.078', { legacyPrefix: '077' }],
  ['source.079', { legacyPrefix: '078' }],
  ['source.103', {
    legacyPrefix: '102',
    sourceRoute: '/sources/glam에서-mixtral까지의-희소-moe-확장/',
  }],
]);

function legacySourceRoute(document, { legacyPrefix, sourceRoute = '' }) {
  if (sourceRoute) return sourceRoute;
  if (!/^\d{3}/.test(document.filename)) return '';
  const legacyFilename = document.filename.replace(/^\d{3}/, legacyPrefix);
  return legacyRouteFor(`sources/${legacyFilename}.md`, 'sources', legacyFilename);
}

const canonicalRoutes = new Map();
function registerCanonicalRoute(url, owner) {
  const existing = canonicalRoutes.get(url);
  if (existing) throw new Error(`Canonical site route collision at ${url}: ${existing} / ${owner}`);
  canonicalRoutes.set(url, owner);
}

for (const route of ['/', '/sources/', '/concepts/', '/entities/', '/analyses/', '/translations/', '/search/']) {
  registerCanonicalRoute(route, `site page ${route}`);
}
for (const document of documents) {
  if (document.url !== '/') registerCanonicalRoute(document.url, `document ${document.id}`);
}
for (const reader of artifactReaders) registerCanonicalRoute(reader.url, `artifact reader ${reader.id}`);

const legacyRedirects = [];
const legacyRoutes = new Map();
function addLegacyRedirect({ kind, sourceDocument, legacyPrefix, from, to }) {
  const canonicalOwner = canonicalRoutes.get(from);
  if (canonicalOwner) {
    throw new Error(`Legacy redirect route ${from} collides with ${canonicalOwner}.`);
  }
  const existing = legacyRoutes.get(from);
  if (existing) {
    throw new Error(`Duplicate legacy redirect route ${from}: ${existing.sourceId} / ${sourceDocument.id}`);
  }
  if (!canonicalRoutes.has(to)) {
    throw new Error(`Legacy redirect target is not a canonical page: ${from} -> ${to}`);
  }

  const redirect = {
    kind,
    sourceId: sourceDocument.id,
    canonicalNumber: sourceDocument.sourceNumber,
    legacyPrefix,
    from,
    to,
  };
  legacyRoutes.set(from, redirect);
  legacyRedirects.push(redirect);
}

const sourceDocumentsById = new Map(grouped.sources.map((document) => [document.id, document]));

for (const document of documents) {
  const legacyBaseUrl = legacyRouteFor(document.relativePath, document.category, document.filename);
  if (!legacyBaseUrl || legacyBaseUrl === document.url || document.url === '/') continue;
  addLegacyRedirect({
    kind: document.pageType === 'source' ? 'source' : 'page',
    sourceDocument: document,
    legacyPrefix: '',
    from: legacyBaseUrl,
    to: document.url,
  });
  for (const reader of document.artifactReaders) {
    addLegacyRedirect({
      kind: reader.routeRole,
      sourceDocument: document,
      legacyPrefix: '',
      from: `${legacyBaseUrl}${reader.routeRole}/`,
      to: reader.url,
    });
  }
}

for (const [sourceId, compatibility] of legacySourceCompatibility) {
  const document = sourceDocumentsById.get(sourceId);
  if (!document) throw new Error(`Legacy source compatibility entry has no source document: ${sourceId}`);
  if (!/^\d{3}$/.test(compatibility.legacyPrefix)) {
    throw new Error(`Legacy source compatibility entry has an invalid prefix: ${sourceId}`);
  }

  const legacyBaseUrl = legacySourceRoute(document, compatibility);
  if (!legacyBaseUrl || legacyBaseUrl === document.url) continue;
  addLegacyRedirect({
    kind: 'source',
    sourceDocument: document,
    legacyPrefix: compatibility.legacyPrefix,
    from: legacyBaseUrl,
    to: document.url,
  });

  for (const reader of document.artifactReaders) {
    if (!['translation', 'commentary'].includes(reader.routeRole)) continue;
    addLegacyRedirect({
      kind: reader.routeRole,
      sourceDocument: document,
      legacyPrefix: compatibility.legacyPrefix,
      from: `${legacyBaseUrl}${reader.routeRole}/`,
      to: reader.url,
    });
  }
}

const redirectRegistryFile = path.join(wikiDir, 'meta', 'site-redirects.yml');
const redirectRegistry = yaml.safeLoad(await fs.readFile(redirectRegistryFile, 'utf8')) ?? {};
if (redirectRegistry.schema_version !== 1 || !Array.isArray(redirectRegistry.redirects)) {
  throw new Error('site-redirects.yml must use schema_version 1 and a redirects array.');
}
const computedRedirectKey = (item) => `${item.kind}|${item.sourceId}|${item.from}|${item.to}`;
const registryRedirectKeys = new Set(redirectRegistry.redirects.map((item) => `${item.kind}|${item.target_id}|${item.from}|${item.to}`));
const computedRedirectKeys = new Set(legacyRedirects.map(computedRedirectKey));
if (registryRedirectKeys.size !== redirectRegistry.redirects.length || registryRedirectKeys.size !== computedRedirectKeys.size
  || [...computedRedirectKeys].some((key) => !registryRedirectKeys.has(key))) {
  throw new Error('site-redirects.yml does not match the computed canonical redirect ledger. Run generate-site-redirects.mjs.');
}

function lifecycleLabel(lifecycle) {
  return lifecycle === 'draft' ? '초안' : lifecycle === 'archived' ? '보관됨' : '공개';
}

function verificationLabel(verification) {
  return {
    verified: '검증됨',
    partial: '부분 검증',
    disputed: '논쟁 중',
    unverified: '미검증',
    'not-applicable': '해당 없음',
  }[verification] ?? verification;
}

function verificationBadge(documentOrStatus) {
  const status = typeof documentOrStatus === 'string' ? documentOrStatus : documentOrStatus.verification;
  return `<span class="verification-badge verification-badge--${escapeHtml(status)}" data-verification="${escapeHtml(status)}">${escapeHtml(verificationLabel(status))}</span>`;
}

function publicationMeta(document) {
  const evidence = primaryEvidence(document.evidence);
  const source = evidence?.source;
  const published = String(source?.published ?? '').trim();
  const year = published.match(/\b(?:1[5-9]\d{2}|20\d{2})\b/)?.[0] ?? '';
  const title = String(source?.title ?? '').trim();
  const firstAuthor = asStringArray(source?.authors)[0] ?? '';
  return {
    year,
    kind: String(source?.kind ?? '').trim(),
    title,
    firstAuthor,
    label: [firstAuthor, year].filter(Boolean).join(' · ') || title,
    evidenceId: evidence?.sourceId ?? '',
  };
}

function articleTitleClass(title) {
  const length = String(title ?? '').trim().length;
  if (length >= 52) return 'article-title-block--very-long';
  if (length >= 30) return 'article-title-block--long';
  return '';
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
  const safeHref = safeArtifactUrl(href);
  if (!safeHref || !/^https?:\/\//i.test(safeHref)) throw new Error(`Unsafe external link: ${href}`);
  const classAttribute = className ? ` class="${escapeHtml(className)}"` : '';
  return `<a${classAttribute} href="${escapeHtml(safeHref)}" target="_blank" rel="noopener noreferrer">${escapeHtml(label)}<span class="sr-only"> (새 창)</span></a>`;
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

function renderDisplayTitle(title) {
  return splitTitleAtSubtitleDash(title).map((part) => (
    isSubtitleDashPart(part)
      ? ': '
      : escapeHtml(part)
  )).join('');
}

function renderMarkdown(document, { artifact = false } = {}) {
  const markdown = markdownWithoutTitle(document.body);
  const headings = headingPlan(markdown);
  const protectedFragments = [];
  const trustedFragments = [];
  const protect = (fragment) => {
    const token = `@@LLMWIKI_FRAGMENT_${protectedFragments.length}@@`;
    protectedFragments.push(fragment);
    return token;
  };
  const protectTrusted = (fragment) => {
    trustedFragments.push(fragment);
    return protect(fragment);
  };

  let prepared = markdown.replace(/```[\s\S]*?```|~~~[\s\S]*?~~~|`[^`\n]+`/g, (fragment) => protect(fragment));
  prepared = prepared.replace(/\$\$([\s\S]+?)\$\$/g, (_match, expression) => protectTrusted(renderMath(expression, true)));
  prepared = prepared.replace(/\\\[([\s\S]+?)\\\]/g, (_match, expression) => protectTrusted(renderMath(expression, true)));
  prepared = prepared.replace(/\\\((.+?)\\\)/g, (_match, expression) => protectTrusted(renderMath(expression, false)));
  prepared = prepared.replace(/(^|[^\\$])\$([^$\n]+?)\$/g, (_match, prefix, expression) => `${prefix}${protectTrusted(renderMath(expression, false))}`);
  // Marked's GFM mode treats a single tilde as strikethrough. Preserve Korean
  // numeric ranges such as 1964~1966 without changing the source Markdown.
  prepared = prepared.replace(/(\d)~(?=\d)/g, '$1\\~');
  if (artifact) prepared = prepared.replaceAll('<', '&lt;').replaceAll('>', '&gt;');
  prepared = renderWikiLinks(prepared, document);
  prepared = prepared.replace(/@@LLMWIKI_FRAGMENT_(\d+)@@/g, (_match, index) => protectedFragments[Number(index)]);

  let html = marked.parse(prepared, { renderer: artifact ? artifactRenderer : safeRenderer });
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

  html = sanitizeRenderedHtml(html, {
    learningGuide: document.id === 'meta.learning-guide',
    trustedFragments,
  });

  return { html, headings };
}

function renderSearch(id, { large = false, label = '위키 검색', mode = 'quick' } = {}) {
  const isQuickSearch = mode === 'quick';
  const scopeHint = isQuickSearch ? '제목·별칭·태그 빠른 검색' : '전체 문서 검색';
  return `
    <form class="site-search${large ? ' site-search--large' : ''}" data-site-search data-search-mode="${escapeHtml(mode)}" data-search-scope="${isQuickSearch ? 'title-alias-tag' : 'full'}" data-suggestion-limit="5" data-index-url="${sitePath('/search-suggestions.json')}" data-search-page-url="${sitePath('/search/')}" role="search" aria-label="${escapeHtml(`${label} · ${scopeHint}`)}" action="${sitePath('/search/')}" method="get">
      <label class="sr-only" for="${id}">${escapeHtml(label)}</label>
      <div class="search-control">
        <input id="${id}" name="q" type="search" autocomplete="off" placeholder="${escapeHtml(scopeHint)}" data-quick-search-input role="combobox" aria-autocomplete="list" aria-expanded="false" aria-controls="${id}-results" aria-describedby="${id}-status ${id}-scope">
        <button type="submit">찾기</button>
      </div>
      <div class="search-results" id="${id}-results" data-search-results role="listbox" aria-label="검색 자동완성 결과" hidden></div>
      <p class="sr-only" id="${id}-status" data-search-status role="status" aria-live="polite"></p>
      <p class="sr-only" id="${id}-scope" data-search-scope-hint>${escapeHtml(scopeHint)}. Enter를 누르면 본문까지 검색합니다.</p>
    </form>`;
}

function navLink(url, label, current, { className = '' } = {}) {
  const active = current === url;
  const classAttribute = className ? ` class="${escapeHtml(className)}"` : '';
  return `<a${classAttribute} href="${sitePath(url)}"${active ? ' aria-current="page"' : ''}>${label}</a>`;
}

function renderPrimaryNavLinks(current) {
  return [
    navLink('/', '홈', current),
    navLink('/guide/', '학습 가이드', current),
    navLink('/sources/', '원문 노트', current),
    navLink('/concepts/', '개념', current),
    navLink('/entities/', '인물·기관', current),
    navLink('/analyses/', '비교 읽기', current),
    navLink('/search/', '전체 검색', current),
  ].join('');
}

function renderMobileNavigation(current) {
  return `<dialog class="mobile-nav-dialog" id="mobile-nav-dialog" data-mobile-nav-dialog data-mobile-nav-backdrop aria-labelledby="mobile-nav-title">
    <div class="mobile-nav-dialog__panel" data-mobile-nav-panel>
      <header class="mobile-nav-dialog__header">
        <strong id="mobile-nav-title">메뉴</strong>
        <button class="mobile-nav-dialog__close" type="button" data-menu-close>닫기</button>
      </header>
      <nav class="primary-nav primary-nav--mobile mobile-nav-dialog__nav" id="primary-nav" data-mobile-nav-links aria-label="주요 메뉴">
        ${renderPrimaryNavLinks(current)}
      </nav>
      <div class="mobile-nav-search">${renderSearch('mobile-nav-search', { label: '모바일 빠른 검색' })}</div>
    </div>
  </dialog>`;
}

function renderNoScriptMobileNavigation(current) {
  return `<noscript>
    <style>@media (max-width: 820px) { .nav-toggle { display: none !important; } }</style>
    <nav class="primary-nav primary-nav--noscript" aria-label="주요 메뉴">
      ${renderPrimaryNavLinks(current)}
      <div class="mobile-nav-search">${renderSearch('noscript-mobile-search', { label: '모바일 빠른 검색' })}</div>
    </nav>
  </noscript>`;
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
  <script src="${sitePath('/assets/app.js')}" type="module"></script>
  ${pageScripts}
</head>
<body class="${pageClass}" data-base-path="${escapeHtml(basePath)}">
  <a class="skip-link" href="#main-content">본문으로 건너뛰기</a>
  <header class="site-header">
    <div class="header-rule" aria-hidden="true"></div>
    <div class="header-inner">
      <a class="wordmark" href="${sitePath('/')}"><span>LLM</span><span>Wiki</span></a>
       <button class="nav-toggle" type="button" data-menu-toggle aria-controls="mobile-nav-dialog" aria-expanded="false" aria-haspopup="dialog">메뉴</button>
       <nav class="primary-nav primary-nav--desktop" data-desktop-nav aria-label="주요 메뉴">
         ${renderPrimaryNavLinks(current)}
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
  ${renderMobileNavigation(current)}
  ${renderNoScriptMobileNavigation(current)}
  ${body}
  <footer class="site-footer">
    <div class="footer-identity">
      <a class="footer-mark" href="${sitePath('/')}">LLM Wiki</a>
      <p><strong>공개 콘텐츠 ${publishedDocuments.length}개</strong> + <strong>안내 ${grouped.meta.length}개</strong>로 구성한 LLM 역사 아카이브.</p>
    </div>
    <nav class="footer-meta" aria-label="보조 메뉴">
      <span>최근 문서 갱신 ${escapeHtml(latestUpdate)}</span>
      <a href="${sitePath('/guide/')}">학습 가이드</a>
      <a href="${sitePath('/search/')}">전체 검색</a>
      <a href="${sitePath('/translations/')}">원문 번역본 모아보기</a>
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

function sourceDisplayNumber(document) {
  if (document.sourceNumber) return document.sourceNumber;
  if (document.pageType === 'reference') return '참고';
  throw new Error(`Source document ${document.id} has no official chapter number.`);
}

function cardDataAttributes(document) {
  const publication = publicationMeta(document);
  const tags = publicTags(document);
  const aliases = cleanDisplayAliases(document.title, document.aliases);
  const searchKey = [document.title, ...aliases, ...tags, ...tags.map(tagLabel)].join(' ').replace(/\s+/g, ' ').trim();
  return `data-card data-category="${escapeHtml(document.category)}" data-verification="${escapeHtml(document.verification)}" data-coverage="${escapeHtml(document.evidenceCoverage)}" data-mode="${escapeHtml(document.contentMode)}" data-editorial-status="${escapeHtml(document.editorialStatus)}" data-title="${escapeHtml(document.title)}" data-sort-title="${escapeHtml(document.title)}" data-card-title="${escapeHtml(document.title)}" data-card-aliases="${escapeHtml(aliases.join(' '))}" data-card-tags="${escapeHtml(tags.map(tagLabel).join(' '))}" data-search-key="${escapeHtml(searchKey)}" data-updated="${escapeHtml(document.updated)}" data-evidence="${document.evidence.length}" data-connections="${meaningfulConnectionCount(document)}" data-publication-year="${escapeHtml(publication.year)}" data-source-number="${escapeHtml(document.sourceNumber)}" data-filter-value="${escapeHtml(searchKey)}"`;
}

function sourceCard(document, index, { headingLevel = 3, hidden = false } = {}) {
  const number = sourceDisplayNumber(document);
  const numberClass = document.pageType === 'reference' ? ' source-number--reference' : '';
  const publication = publicationMeta(document);
  return `<article class="source-card source-card--${(index % 4) + 1}" ${cardDataAttributes(document)}${hidden ? ' hidden' : ''}>
    <span class="source-number${numberClass}" aria-hidden="true">${escapeHtml(number)}</span>
    <div class="source-card-body">
      <div class="card-meta">${verificationBadge(document)}${publication.label ? `<span class="card-publication">${escapeHtml(publication.label)}</span>` : ''}<span>연결 ${meaningfulConnectionCount(document)}</span><span class="card-sort-metric" data-sort-metric hidden></span></div>
      <h${headingLevel}><a href="${sitePath(document.url)}">${renderDisplayTitle(document.title)}</a></h${headingLevel}>
      <p>${escapeHtml(document.excerpt)}</p>
      <p class="source-card-compact-meta">${publication.label ? `${escapeHtml(publication.label)} · ` : ''}연결 ${meaningfulConnectionCount(document)}</p>
      ${renderTags(document)}
    </div>
  </article>`;
}

function noteCard(document, { headingLevel = 3, hidden = false } = {}) {
  return `<article class="note-card" ${cardDataAttributes(document)}${hidden ? ' hidden' : ''}>
    <div class="card-meta"><span>${escapeHtml(categoryMeta[document.category].singular)}</span>${verificationBadge(document)}<span>${document.minutes}분 읽기</span><span class="card-sort-metric" data-sort-metric hidden></span></div>
    <h${headingLevel}><a href="${sitePath(document.url)}">${renderDisplayTitle(document.title)}</a></h${headingLevel}>
    <p>${escapeHtml(document.excerpt)}</p>
    <div class="note-card-footer">
      ${renderTags(document)}
      <span>역링크 ${document.meaningfulBacklinks.length}</span>
    </div>
  </article>`;
}

function renderHome() {
  const overview = documents.find((document) => document.filename === 'overview');
  const learningGuide = documents.find((document) => document.id === 'meta.learning-guide');
  const intro = truncate(firstParagraph(overview?.body ?? ''), 130);
  const sourceCollectionLabel = [
    `원문 노트 ${sourceDocuments.length}개`,
    ...(referenceDocuments.length ? [`참고 자료 ${referenceDocuments.length}개`] : []),
  ].join(' · ');
  const homeCollectionLabel = [sourceCollectionLabel, `비교 읽기 ${grouped.analyses.length}개`].join(' · ');
  const sourcePreview = sourceDocuments.slice(0, 3);
  const heroSourcePreview = sourceDocuments.slice(-6).reverse();
  const analysisPreview = grouped.analyses.slice(0, 3);
  const topConcepts = [...grouped.concepts]
    .sort((a, b) => b.meaningfulBacklinks.length - a.meaningfulBacklinks.length || collator.compare(a.title, b.title))
    .slice(0, 8);

  const body = `<main id="main-content">
    <section class="home-hero">
      <div class="hero-copy">
        <p class="eyebrow">${homeCollectionLabel}</p>
        <h1>언어 모델의<br><span>역사를 함께 읽다</span></h1>
        <p class="hero-intro">${escapeHtml(intro)}</p>
        ${learningGuide ? `<a class="hero-guide-cta" data-learning-guide-cta href="${sitePath(`${learningGuide.url}#3분-출발-진단`)}"><span>새 학습 경로</span><strong>3분 진단으로 시작하기</strong><i aria-hidden="true">→</i></a>` : ''}
        ${renderSearch('hero-search', { large: true, label: '홈 주요 검색' })}
      </div>
      <nav class="hero-collage hero-source-strip" aria-label="최신 번호 원문 노트 빠른 이동">
        <p class="collage-label">최신 번호 원문 노트</p>
        <ul class="hero-source-list">${heroSourcePreview.map((document) => `<li class="hero-source-item"><a href="${sitePath(document.url)}"><span>${escapeHtml(sourceDisplayNumber(document))}</span><strong>${renderDisplayTitle(document.title)}</strong></a></li>`).join('')}</ul>
        <a class="hero-source-all" href="${sitePath('/sources/')}"><strong>${sourceCollectionLabel} 보기</strong><span aria-hidden="true">→</span></a>
      </nav>
    </section>

    <section class="stats-strip" aria-label="위키 문서 현황">
      ${['sources', 'concepts', 'entities', 'analyses'].map((key) => `<a href="${sitePath(`/${key}/`)}"><strong>${key === 'sources' ? sourceDocuments.length : grouped[key].length}</strong><span>${categoryMeta[key].label}</span></a>`).join('')}
    </section>

    <section class="home-section source-section">
      <div class="section-heading">
        <div><p class="eyebrow">원문 기반 노트</p><h2>첫 번째 자료부터 읽기</h2></div>
        <p>통계적 언어 처리에서 대화형 AI까지, 핵심 자료를 번호순으로 읽습니다.</p>
      </div>
      <div class="source-timeline">${sourcePreview.map((document, index) => sourceCard(document, index)).join('')}</div>
      <a class="text-link" href="${sitePath('/sources/')}">${sourceCollectionLabel} 전체 보기 <span aria-hidden="true">→</span></a>
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
      <ol class="concept-index">${topConcepts.map((document, index) => `<li><a class="concept-index-link" href="${sitePath(document.url)}"><span class="concept-index__rank">${String(index + 1).padStart(2, '0')}</span><strong class="concept-index__title">${renderDisplayTitle(document.title)}</strong><small class="concept-index__metric">역링크 ${document.meaningfulBacklinks.length}</small></a></li>`).join('')}</ol>
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
  const sourceCollectionLabel = [
    `원문 노트 ${sourceDocuments.length}개`,
    ...(referenceDocuments.length ? [`참고 자료 ${referenceDocuments.length}개`] : []),
  ].join(' · ');
  const defaultSortLabel = key === 'sources' ? '공식 번호순' : '가나다·ABC순';
  const cards = key === 'sources'
    ? list.map((document, index) => sourceCard(document, index, { headingLevel: 2, hidden: index >= DIRECTORY_PAGE_SIZE })).join('')
    : list.map((document, index) => noteCard(document, { headingLevel: 2, hidden: index >= DIRECTORY_PAGE_SIZE })).join('');
  const initialRemaining = Math.max(0, list.length - DIRECTORY_PAGE_SIZE);
  const body = `<main id="main-content" class="listing-main">
    <header class="listing-hero">
      <p class="eyebrow">${key === 'sources' ? sourceCollectionLabel : `${list.length}개 문서`}</p>
      <div><h1>${escapeHtml(meta.label)}</h1><span class="listing-count">${list.length}</span></div>
      ${key === 'sources' && sourceDocuments.length ? `<a class="translation-directory-link translation-directory-link--compact" href="#directory-sources"><span>전체 목록으로 이동</span><strong>원문 노트 ${sourceDocuments.length}개</strong><span aria-hidden="true">→</span></a>` : ''}
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
          <option value="disputed">논쟁 중</option>
          <option value="unverified">미검증</option>
        </select>
      </div>
      <div class="directory-select-control">
        <label for="sort-${key}">정렬</label>
        <select id="sort-${key}" data-filter-sort>
          <option value="default">${defaultSortLabel}</option>
          ${key === 'sources' ? '<option value="chronological">연대순</option>' : ''}
          ${key === 'sources' ? '<option value="title">제목순</option>' : ''}
          <option value="updated">최근 갱신순</option>
          <option value="evidence">근거 많은순</option>
          <option value="connections">연결 많은순</option>
        </select>
      </div>
      <div class="directory-view-toggle" role="group" aria-label="목록 보기 방식">
        <span>보기</span>
        <button type="button" data-directory-view="compact" aria-pressed="true">간략</button>
        <button type="button" data-directory-view="cards" aria-pressed="false">카드</button>
      </div>
      <button class="directory-filter-reset" type="button" data-filter-reset>조건 초기화</button>
    </section>
    <p class="directory-filter-status" data-filter-status role="status" aria-live="polite" aria-atomic="true"></p>
    <section id="directory-${key}" class="${key === 'sources' ? 'source-timeline directory-source-list' : 'note-grid directory-grid'}" data-filter-grid data-directory-key="${key}" data-directory-default-sort="${key === 'sources' ? 'official-number' : 'title'}" data-directory-total="${list.length}" data-view="compact">
      ${cards}
      <p class="empty-filter" data-filter-empty hidden>일치하는 문서가 없습니다.</p>
    </section>
    <button class="directory-load-more" type="button" data-filter-more${initialRemaining ? '' : ' hidden'}>${initialRemaining ? `더 보기 · ${Math.min(DIRECTORY_PAGE_SIZE, initialRemaining)}개` : '더 보기'}</button>
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
      <span class="translation-number">${escapeHtml(sourceDisplayNumber(reader.sourceDocument))}</span>
      <span class="translation-card-copy"><small>${escapeHtml(reader.label)}</small><strong>${renderDisplayTitle(reader.sourceDocument.title)}</strong></span>
      <span class="translation-reading-time">${reader.minutes}분 읽기 <span aria-hidden="true">→</span></span>
    </a>
  </li>`).join('');
  const body = `<main id="main-content" class="listing-main translations-main">
    <header class="listing-hero translations-hero">
      <p class="eyebrow">한국어 보존 자료</p>
      <div><h1>원문 번역본</h1><span class="listing-count">${translationReaders.length}</span></div>
      <p>검증·정정을 반영한 원문 노트와 나란히 읽을 수 있도록, 수집 당시의 한국어 번역 자료를 별도 독서 화면으로 제공합니다.</p>
    </header>
    <div class="translation-directory-heading"><div><p class="eyebrow">번호순 읽기</p><h2>원문 번역본 목록</h2></div><a class="text-link" href="${sitePath('/sources/')}">원문 노트로 돌아가기</a></div>
    <ol class="translation-directory">${cards}</ol>
  </main>`;

  return layout({
    title: '원문 번역본',
    description: 'LLM Wiki 원문 노트와 함께 읽는 한국어 번역 자료 모음',
    current: '/sources/',
    body,
    pageClass: 'listing-page translations-page',
  });
}

function renderSearchPage() {
  const searchableDocuments = documents.filter((document) => document.filename !== 'index');
  const searchableMetaCount = searchableDocuments.filter((document) => document.category === 'meta').length;
  const searchableCount = searchableDocuments.length;
  const searchableTags = [...new Set(searchableDocuments.flatMap((document) => publicTags(document)))]
    .sort((a, b) => collator.compare(tagLabel(a), tagLabel(b)));
  const body = `<main id="main-content" class="search-main">
    <header class="listing-hero search-hero">
      <p class="eyebrow">검색 가능 문서 ${searchableCount}개 · 공개 콘텐츠 ${publishedDocuments.length}개 · 안내 ${searchableMetaCount}개</p>
      <div><h1>전체 검색</h1><span class="listing-count" aria-label="검색 가능 문서 ${searchableCount}개">${searchableCount}</span></div>
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
      <details class="search-page-filters-panel" data-search-filter-panel data-search-filter-default="desktop-open" data-search-mobile-default="collapsed" open>
        <summary>상세 필터 <span data-search-filter-count></span></summary>
        <div class="search-page-filters">
          <label for="search-category">문서 유형</label>
          <select id="search-category" name="category" data-search-filter-category>
            <option value="">모든 문서 유형</option>
            ${['sources', 'concepts', 'entities', 'analyses', 'meta'].map((key) => `<option value="${key}">${escapeHtml(categoryMeta[key].label)}</option>`).join('')}
          </select>
          <label for="search-verification">검증 상태</label>
          <select id="search-verification" name="verification" data-search-filter-verification>
            <option value="">모든 검증 상태</option>
            <option value="verified">검증됨</option>
            <option value="partial">부분 검증</option>
            <option value="disputed">논쟁 중</option>
            <option value="unverified">미검증</option>
          </select>
          <label for="search-coverage">근거 범위</label>
          <select id="search-coverage" name="coverage" data-search-filter-coverage>
            <option value="">모든 근거 범위</option>
            <option value="verified">확인됨</option>
            <option value="partial">부분 확인</option>
            <option value="disputed">논쟁 중</option>
            <option value="not-applicable">해당 없음</option>
          </select>
          <label for="search-mode">콘텐츠 성격</label>
          <select id="search-mode" name="mode" data-search-filter-mode>
            <option value="">모든 콘텐츠 성격</option>
            <option value="descriptive">기술·서술</option>
            <option value="synthesis">종합·분석</option>
            <option value="contested">논쟁·비교</option>
          </select>
          <label for="search-editorial">편집 상태</label>
          <select id="search-editorial" name="editorial" data-search-filter-editorial>
            <option value="">모든 편집 상태</option>
            <option value="active">공개</option>
            <option value="draft">초안</option>
            <option value="archived">보관</option>
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
          <button class="search-filter-button" type="button" data-search-clear>검색 조건 초기화</button>
        </div>
      </details>
    </form>
    <p class="search-page-status" data-search-page-status data-search-page-visual-status>검색어나 필터를 입력하면 결과가 표시됩니다.</p>
    <p class="sr-only" data-search-page-live-status role="status" aria-live="polite" aria-atomic="true"></p>
    <section class="search-page-results" data-search-page-results aria-label="검색 결과"></section>
    <button class="search-load-more" type="button" data-search-load-more hidden>더 보기</button>
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
  items.push(`<li class="breadcrumb-current"><span aria-current="page" title="${escapeHtml(document.title)}">${renderDisplayTitle(document.title)}</span></li>`);
  return `<ol>${items.join('')}</ol>`;
}

function breadcrumbForArtifact(reader) {
  const document = reader.sourceDocument;
  return `<ol>
    <li><a href="${sitePath('/')}">홈</a></li>
    <li><a href="${sitePath('/sources/')}">${escapeHtml(categoryMeta.sources.label)}</a></li>
    <li><a href="${sitePath(document.url)}">${renderDisplayTitle(document.title)}</a></li>
    <li class="breadcrumb-current"><span aria-current="page" title="${escapeHtml(reader.label)}">${escapeHtml(reader.label)}</span></li>
  </ol>`;
}

function sourceSwitcherLabel(destination) {
  if (destination.registryRole === 'editorial-commentary') return '재구성 해설';
  return {
    note: '검증 노트',
    translation: '한국어 번역',
    commentary: '번역 해설',
    'source-essay': '원문',
    reconstruction: '편집부 재구성',
  }[destination.routeRole] ?? destination.switcherLabel ?? destination.label;
}

function renderArtifactSwitcher(document, activeRole = 'note') {
  if (!document.artifactReaders.length) return '';
  const destinations = [
    { routeRole: 'note', label: '원문 노트', url: document.url },
    ...document.artifactReaders,
  ];
  return `<nav class="reading-switcher reading-switcher--compact" data-reading-switcher aria-label="이 소스의 자료 보기">
    <span class="reading-switcher-label">자료 보기</span>
    <div class="reading-switcher-links">${destinations.map((destination, index) => {
      const active = destination.routeRole === activeRole;
      return `<a class="reading-switcher-link reading-switcher-link--${index + 1}" data-reader-role="${escapeHtml(destination.routeRole)}" href="${sitePath(destination.url)}"${active ? ' aria-current="page"' : ''}><span>${String(index + 1).padStart(2, '0')}</span><strong>${escapeHtml(sourceSwitcherLabel(destination))}</strong></a>`;
    }).join('')}</div>
  </nav>`;
}

function renderRepresentativeEvidenceFact(publication) {
  const title = publication.title || publication.label;
  if (!title) return '';
  const details = [publication.firstAuthor, publication.year].filter(Boolean).join(' · ');
  return `<div class="article-facts__evidence"><dt>대표 근거</dt><dd title="${escapeHtml(publication.evidenceId)}"><span class="article-facts__evidence-title">${escapeHtml(title)}</span>${details ? `<span class="article-facts__evidence-meta">${escapeHtml(details)}</span>` : ''}</dd></div>`;
}

function renderToc(headings) {
  if (!headings.length) return '<p class="toc-empty">하위 목차 없음</p>';
  const visible = headings.filter((heading) => heading.depth <= 3);
  if (!visible.length) return '<p class="toc-empty">하위 목차 없음</p>';
  const items = [];
  let currentSection = null;
  for (const heading of visible) {
    if (heading.depth === 2 || !currentSection) {
      currentSection = { heading, children: [] };
      items.push(currentSection);
    } else {
      currentSection.children.push(heading);
    }
  }
  return `<ol class="toc-list">${items.map((section) => `<li class="toc-depth-2" data-toc-depth="2">
    <a href="#${section.heading.id}">${escapeHtml(section.heading.label)}</a>
    ${section.children.length ? `<ol class="toc-sublist">${section.children.map((heading) => `<li class="toc-depth-3" data-toc-depth="3"><a href="#${heading.id}">${escapeHtml(heading.label)}</a></li>`).join('')}</ol>` : ''}
  </li>`).join('')}</ol>`;
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
      <strong>${renderDisplayTitle(item.title)}</strong>
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
    ? groups.map(([key, items]) => `<div class="backlink-group backlink-group--${key}"><h3>${escapeHtml(categoryMeta[key].label)} <span>${items.length}</span></h3><ul>${items.map((item) => `<li><a href="${sitePath(item.url)}">${renderDisplayTitle(item.title)}</a>${verificationBadge(item)}</li>`).join('')}</ul></div>`).join('')
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
        <strong>${renderDisplayTitle(item.title)}</strong>
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
    <noscript><p class="relationship-preview__noscript"><a href="${sitePath('/search/')}">전체 검색에서 문서 찾기</a></p></noscript>
  </section>
  <dialog class="relationship-dialog" id="relationship-explorer-dialog" data-relationship-dialog aria-labelledby="relationship-dialog-title">
    <div class="relationship-dialog__frame">
      <header class="relationship-dialog__toolbar">
        <strong id="relationship-dialog-title">연결 탐색</strong>
        <button type="button" data-close-relationship-dialog>닫기</button>
      </header>
      <section class="relationship-explorer relationship-explorer--article" data-relationship-explorer data-relationship-context="article" data-focus-id="${escapeHtml(document.id)}" data-relationship-url="${sitePath('/relationship-data.json')}" aria-label="${escapeHtml(document.title)} 연결 탐색기">
        <p class="relationship-explorer__loading" role="status">연결 데이터를 불러오는 중입니다.</p>
      </section>
    </div>
  </dialog>`;
}

function renderArticle(document) {
  const isLearningGuide = document.id === 'meta.learning-guide';
  const rendered = renderMarkdown(document);
  const siblings = grouped[document.category];
  const position = siblings.indexOf(document);
  const previous = position > 0 ? siblings[position - 1] : null;
  const next = position >= 0 && position < siblings.length - 1 ? siblings[position + 1] : null;
  const aliases = cleanDisplayAliases(document.title, document.aliases);
  const publication = publicationMeta(document);
  const titleClass = articleTitleClass(document.title);

  const reviewNote = document.verification !== 'verified'
    ? `<div class="review-banner article-utility-review">${verificationBadge(document)}<span>사실, 해석 또는 논쟁 상태는 문서의 근거와 설명을 함께 확인하세요.</span></div>`
    : '';

  const body = `<main id="main-content" class="article-main${isLearningGuide ? ' learning-guide-main' : ''}"${isLearningGuide ? ' data-learning-guide-page' : ''}>
    <nav class="breadcrumbs" aria-label="현재 위치">${breadcrumbFor(document)}</nav>
    <div class="reading-progress" data-reading-progress aria-hidden="true"><span></span></div>
    <header class="article-hero" data-article-hero>
      <div class="article-title-block ${titleClass}">
        <div class="article-kicker"><span>${escapeHtml(document.pageType === 'reference' ? '참고 자료' : categoryMeta[document.category].singular)}</span>${document.sourceNumber ? `<span>No. ${document.sourceNumber}</span>` : ''}</div>
        <h1 id="article-title">${renderDisplayTitle(document.title)}</h1>
        <p class="article-summary">${escapeHtml(truncate(document.excerpt, 180))}</p>
        ${renderTags(document)}
        ${aliases.length || document.lifecycle !== 'active' || document.updated ? `<details class="article-details">
          <summary>문서 정보${aliases.length ? ` · 별칭 ${aliases.length}개` : ''}</summary>
          ${aliases.length ? `<p class="aliases">${aliases.map(escapeHtml).join(' · ')}</p>` : ''}
          <dl class="article-secondary-facts">
            <div><dt>문서 상태</dt><dd>${escapeHtml(lifecycleLabel(document.lifecycle))}</dd></div>
            ${document.updated ? `<div><dt>최근 갱신</dt><dd>${escapeHtml(document.updated)}</dd></div>` : ''}
          </dl>
        </details>` : ''}
      </div>
      <dl class="article-facts">
        ${renderRepresentativeEvidenceFact(publication)}
        <div><dt>근거 상태</dt><dd>${verificationBadge(document)}</dd></div>
        <div><dt>읽기</dt><dd>약 ${document.minutes}분</dd></div>
        <div><dt>연결</dt><dd><a class="article-connection-link" href="#relationship-preview" data-open-relationship-dialog aria-controls="relationship-explorer-dialog">직접 연결 ${meaningfulConnectionCount(document)}개</a></dd></div>
      </dl>
    </header>
    ${reviewNote}
    ${['source', 'reference'].includes(document.pageType) ? renderArtifactSwitcher(document) : ''}
    <div class="article-layout">
      <aside class="article-sidebar">
        <details class="toc-card" data-toc-details open>
          <summary>이 문서의 목차 <span data-toc-current>${escapeHtml(rendered.headings.find((heading) => heading.depth === 2)?.label ?? '')}</span></summary>
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
      ${previous ? `<a class="previous" href="${sitePath(previous.url)}"><span>이전</span><strong>${renderDisplayTitle(previous.title)}</strong></a>` : '<span></span>'}
      ${next ? `<a class="next" href="${sitePath(next.url)}"><span>다음</span><strong>${renderDisplayTitle(next.title)}</strong></a>` : '<span></span>'}
    </nav>
    <button class="back-to-top back-to-top--in-flow" type="button" data-back-to-top data-back-to-top-flow hidden>맨 위로</button>
  </main>`;

  return layout({
    title: document.title,
    description: document.excerpt,
    current: isLearningGuide ? '/guide/' : document.category === 'meta' ? '' : `/${document.category}/`,
    body,
    pageClass: `article-page article-page--${document.category}${isLearningGuide ? ' learning-guide-page' : ''}`,
    scripts: [
      { src: '/assets/relationship-explorer.js', type: 'module' },
      ...(isLearningGuide ? [{ src: '/assets/learning-guide.js', type: 'module' }] : []),
    ],
  });
}

function renderArtifactReader(reader) {
  const document = reader.sourceDocument;
  const sourceLabel = document.pageType === 'reference' ? '참고 자료' : `No. ${sourceDisplayNumber(document)}`;
  const rendered = renderMarkdown(reader, { artifact: true });
  const body = `<main id="main-content" class="article-main artifact-main">
    <nav class="breadcrumbs" aria-label="현재 위치">${breadcrumbForArtifact(reader)}</nav>
    <div class="reading-progress" data-reading-progress aria-hidden="true"><span></span></div>
    <header class="article-hero artifact-hero">
      <div class="article-title-block ${articleTitleClass(document.title)}">
        <div class="article-kicker"><span>${escapeHtml(reader.label)}</span><span>${escapeHtml(sourceLabel)}</span></div>
        <h1 id="article-title">${renderDisplayTitle(document.title)}</h1>
        <p class="article-summary">${escapeHtml(reader.description)}</p>
      </div>
      <dl class="article-facts">
        <div><dt>자료 유형</dt><dd>${escapeHtml(reader.label)}</dd></div>
        <div><dt>보존 역할</dt><dd>${escapeHtml(reader.registryRole)}</dd></div>
        <div><dt>읽기</dt><dd>약 ${reader.minutes}분</dd></div>
        <div><dt>기준 문서</dt><dd>${escapeHtml(sourceLabel)}</dd></div>
      </dl>
    </header>
    ${renderArtifactSwitcher(document, reader.routeRole)}
    <div class="artifact-preservation-banner"><strong>보존 자료</strong><span>수집 당시의 번역·해설을 그대로 보여 줍니다. 사실 검증과 정정은 원문 노트를 기준으로 확인하세요.</span></div>
    <div class="article-layout artifact-layout">
      <aside class="article-sidebar">
        <details class="toc-card" data-toc-details open>
          <summary>이 자료의 목차 <span data-toc-current>${escapeHtml(rendered.headings.find((heading) => heading.depth === 2)?.label ?? '')}</span></summary>
          <nav aria-label="자료 목차">${renderToc(rendered.headings)}</nav>
        </details>
      </aside>
      <div class="article-reading">
        <article class="article-body artifact-body" aria-labelledby="article-title">${rendered.html}</article>
        <div class="source-note article-source-note artifact-source-note">
          <span>보존 파일</span>
          <code>${escapeHtml(reader.artifactPath)}</code>
          ${reader.sourceUrl ? externalLink(reader.sourceUrl, '원문 출처') : ''}
          ${externalLink(githubArtifactUrl(reader), 'GitHub에서 보기')}
        </div>
      </div>
    </div>
    <section class="artifact-return" aria-labelledby="artifact-return-heading">
      <div><p class="eyebrow">검증된 설명</p><h2 id="artifact-return-heading">정정과 근거는 원문 노트에서</h2><p>원문 번역본은 원문의 흐름을 읽기 위한 자료입니다. 역사적 사실, 과장된 계보와 후대 평가는 근거 장부가 있는 공개 노트에서 확인할 수 있습니다.</p></div>
      <a class="button-link" href="${sitePath(document.url)}">원문 노트 읽기 <span aria-hidden="true">→</span></a>
    </section>
    <button class="back-to-top back-to-top--in-flow" type="button" data-back-to-top data-back-to-top-flow hidden>맨 위로</button>
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

function renderLegacyRedirect(redirect) {
  const destination = sitePath(redirect.to);
  return `<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex, follow">
  <meta http-equiv="refresh" content="0; url=${escapeHtml(destination)}">
  <link rel="canonical" href="${escapeHtml(destination)}">
  <title>문서 주소가 변경되었습니다 · LLM Wiki</title>
</head>
<body data-legacy-redirect="${escapeHtml(redirect.kind)}">
  <main id="main-content">
    <h1>문서 주소가 변경되었습니다.</h1>
    <p>공식 장 번호에 맞춘 새 주소로 이동합니다.</p>
    <p><a href="${escapeHtml(destination)}">새 주소에서 문서 읽기</a></p>
  </main>
</body>
</html>`;
}

async function writeHtml(outputDir, url, html) {
  const outputPath = outputFileForUrl(url, { outputDir });
  if (!outputPath) throw new Error(`Cannot map site URL to the build directory: ${url}`);
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, html, 'utf8');
}

const searchIndex = documents
  .filter((document) => document.filename !== 'index')
  .map((document) => {
    const publication = publicationMeta(document);
    return {
      id: document.id,
      type: document.pageType,
      title: document.title,
      aliases: document.aliases,
      category: categoryMeta[document.category].singular,
      categoryKey: document.category,
      verification: document.verification,
      verificationLabel: verificationLabel(document.verification),
      lifecycle: document.lifecycle,
      editorialStatus: document.editorialStatus,
      evidenceCoverage: document.evidenceCoverage,
      contentMode: document.contentMode,
      created: document.created,
      updated: document.updated,
      publicationYear: publication.year,
      publicationKind: publication.kind,
      publicationLabel: publication.label,
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
    };
  });

const searchSuggestions = searchIndex.map(({ text: _text, excerpt: _excerpt, ...entry }) => ({
  ...entry,
  suggestionText: normalizeText([entry.title, ...entry.aliases, ...entry.tagLabels].join(' ')),
}));

const buildReport = {
  generatedAt: new Date().toISOString(),
  basePath,
  pages: documents.length + artifactReaders.length + legacyRedirects.length + 7,
  documents: documents.length,
  publishedDocuments: publishedDocuments.length,
  relationships: graphData.stats,
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
  redirectCount: legacyRedirects.length,
  redirects: legacyRedirects,
  resolvedLinks: resolvedLinkCount,
  unresolvedLinks: [...unresolved.values()]
    .map((record) => ({ target: record.target, count: record.count, from: [...record.from].sort(collator.compare) }))
    .sort((a, b) => b.count - a.count || collator.compare(a.target, b.target)),
};

async function buildInto(outputDir) {
  await fs.rm(outputDir, { recursive: true, force: true });
  await fs.mkdir(outputDir, { recursive: true });
  await fs.cp(path.join(siteDir, 'assets'), path.join(outputDir, 'assets'), { recursive: true });
  await fs.copyFile(path.join(rootDir, 'node_modules', 'katex', 'dist', 'katex.min.css'), path.join(outputDir, 'assets', 'katex.min.css'));
  await fs.cp(path.join(rootDir, 'node_modules', 'katex', 'dist', 'fonts'), path.join(outputDir, 'assets', 'fonts'), { recursive: true });

  await writeHtml(outputDir, '/', renderHome());
  for (const key of ['sources', 'concepts', 'entities', 'analyses']) {
    await writeHtml(outputDir, `/${key}/`, renderCategoryPage(key));
  }
  await writeHtml(outputDir, '/translations/', renderTranslationsPage());
  await writeHtml(outputDir, '/search/', renderSearchPage());
  for (const document of documents) {
    if (document.url !== '/') await writeHtml(outputDir, document.url, renderArticle(document));
  }
  for (const reader of artifactReaders) {
    await writeHtml(outputDir, reader.url, renderArtifactReader(reader));
  }
  for (const redirect of legacyRedirects) {
    await writeHtml(outputDir, redirect.from, renderLegacyRedirect(redirect));
  }
  await fs.writeFile(path.join(outputDir, '404.html'), renderNotFound(), 'utf8');
  await fs.writeFile(path.join(outputDir, '.nojekyll'), '', 'utf8');
  await fs.writeFile(path.join(outputDir, 'relationship-data.json'), JSON.stringify(graphData), 'utf8');
  await fs.writeFile(path.join(outputDir, 'search-index.json'), JSON.stringify(searchIndex), 'utf8');
  await fs.writeFile(path.join(outputDir, 'search-suggestions.json'), JSON.stringify(searchSuggestions), 'utf8');
  await fs.writeFile(path.join(outputDir, 'build-report.json'), JSON.stringify(buildReport, null, 2), 'utf8');
}

await buildDirectoryAtomically(distDir, buildInto);

console.log(`Built ${buildReport.pages} pages from ${documents.length} wiki documents, ${artifactReaders.length} artifact readers, and ${legacyRedirects.length} legacy redirects.`);
console.log(`Resolved ${resolvedLinkCount} wiki links; ${buildReport.unresolvedLinks.length} unresolved target(s).`);
