import { promises as fs } from 'node:fs';
import path from 'node:path';
import { distDir } from './lib/project-paths.mjs';
import { outputFileForUrl, safeDecode, withBasePath } from './lib/site-paths.mjs';
import { walkFiles } from './lib/wiki-utils.mjs';

const report = JSON.parse(await fs.readFile(path.join(distDir, 'build-report.json'), 'utf8'));
const basePath = report.basePath ?? '';
const siteUrl = (pathname = '/') => withBasePath(basePath, pathname);
const fileForUrl = (rawUrl) => outputFileForUrl(rawUrl, { outputDir: distDir, basePath });
const htmlFiles = await walkFiles(distDir, '.html');
const htmlCache = new Map();
const errors = [];
let checkedReferences = 0;

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function attributeValue(tag, name) {
  return tag.match(new RegExp(`\\b${escapeRegExp(name)}="([^"]*)"`, 'i'))?.[1] ?? null;
}

function elementMarkupForHook(html, hook) {
  const startPattern = new RegExp(`<([a-z][\\w:-]*)\\b[^>]*\\b${escapeRegExp(hook)}(?=\\s|=|>)[^>]*>`, 'i');
  const start = startPattern.exec(html);
  if (!start) return '';
  const tagName = start[1];
  const tagPattern = new RegExp(`</?${escapeRegExp(tagName)}\\b[^>]*>`, 'gi');
  tagPattern.lastIndex = start.index;
  let depth = 0;
  for (let match = tagPattern.exec(html); match; match = tagPattern.exec(html)) {
    const closing = /^<\//.test(match[0]);
    const selfClosing = /\/>$/.test(match[0]);
    if (closing) depth -= 1;
    else if (!selfClosing) depth += 1;
    if (depth === 0) return html.slice(start.index, tagPattern.lastIndex);
  }
  return '';
}

const requiredOutputFiles = [
  'graph/index.html',
  'graph-data.json',
  'search/index.html',
  'translations/index.html',
  'assets/graph-map-loader.js',
  'assets/graph-map.js',
  'assets/graph-map-model.js',
  'assets/relationship-explorer.js',
  'assets/fonts/D2Coding.woff2',
  'assets/fonts/RIDIBatang.woff2',
  'assets/fonts/OFL-1.1.txt',
  'assets/fonts/NOTICE.md',
];

for (const relativePath of requiredOutputFiles) {
  try {
    await fs.access(path.join(distDir, ...relativePath.split('/')));
  } catch {
    errors.push(`Required build output is missing: ${relativePath}`);
  }
}

try {
  await fs.access(path.join(distDir, 'assets', 'graph-mobile-model.js'));
  errors.push('Removed mobile graph model must not be present in the build output.');
} catch {
  // Expected: the desktop graph no longer ships a mobile graph implementation.
}

for (const htmlFile of htmlFiles) {
  const html = await fs.readFile(htmlFile, 'utf8');
  const relativeHtmlPath = path.relative(distDir, htmlFile);
  htmlCache.set(htmlFile, html);
  if (html.includes('\uFFFD')) errors.push(`${relativeHtmlPath} contains a replacement character.`);

  const mainCount = [...html.matchAll(/<main\b/gi)].length;
  if (mainCount !== 1 || !/<main\b[^>]*\bid="main-content"/i.test(html)) {
    errors.push(`${relativeHtmlPath} must contain exactly one <main id="main-content">.`);
  }

  const h1Count = [...html.matchAll(/<h1\b/gi)].length;
  if (h1Count !== 1) errors.push(`${relativeHtmlPath} must contain exactly one H1 (found ${h1Count}).`);

  const ids = [...html.matchAll(/\bid="([^"]+)"/gi)].map((match) => match[1]);
  const duplicateIds = [...new Set(ids.filter((id, index) => ids.indexOf(id) !== index))];
  if (duplicateIds.length) {
    errors.push(`${relativeHtmlPath} contains duplicate IDs: ${duplicateIds.join(', ')}`);
  }

  const primaryNav = html.match(/<nav class="primary-nav"[\s\S]*?<\/nav>/i)?.[0] ?? '';
  const graphNavUrl = siteUrl('/graph/');
  const graphNavLinks = [...primaryNav.matchAll(/<a\b[^>]*>그래프<\/a>/g)]
    .map((match) => match[0])
    .filter((markup) => attributeValue(markup, 'href') === graphNavUrl);
  if (graphNavLinks.length !== 1) {
    errors.push(`${relativeHtmlPath} must include one primary navigation link to the knowledge graph.`);
  } else {
    const active = attributeValue(graphNavLinks[0], 'aria-current') === 'page';
    const graphPage = relativeHtmlPath.replaceAll('\\', '/') === 'graph/index.html';
    if (active !== graphPage) errors.push(`${relativeHtmlPath} has an incorrect active state for the graph navigation link.`);
    if (!/\bdesktop-graph-link\b/.test(attributeValue(graphNavLinks[0], 'class') ?? '')) {
      errors.push(`${relativeHtmlPath} must mark the graph navigation entry as desktop-only.`);
    }
  }

  if (/\brole="(?:listbox|option)"/i.test(html)) {
    errors.push(`${relativeHtmlPath} uses listbox semantics without a complete combobox contract.`);
  }

  if (/<del\b/i.test(html)) {
    errors.push(`${relativeHtmlPath} contains an unexpected strikethrough; check numeric ranges using "~".`);
  }

  if (/<body class="[^"]*\bartifact-page\b/i.test(html)) {
    const artifactBody = html.match(/<article class="article-body artifact-body"[^>]*>([\s\S]*?)<\/article>/i)?.[1] ?? '';
    if (/<(?:script|iframe|object|embed)\b/i.test(artifactBody)) {
      errors.push(`${relativeHtmlPath} contains executable or embedded raw HTML on an artifact page.`);
    }
    if (/(?:href|src)="(?:javascript:|data:text\/html)/i.test(artifactBody)) {
      errors.push(`${relativeHtmlPath} contains an unsafe artifact URL.`);
    }
    if (/&lt;!--\s*Obsidian note:/i.test(artifactBody)) {
      errors.push(`${relativeHtmlPath} exposes an internal Obsidian note comment.`);
    }
    if (artifactBody.includes('href="/writing/') || artifactBody.includes(`href="${siteUrl('/writing/')}`)) {
      errors.push(`${relativeHtmlPath} retains an upstream /writing/ link as a local site URL.`);
    }
  }

  for (const link of html.matchAll(/<a\b[^>]*\btarget="_blank"[^>]*>/gi)) {
    if (!/\brel="[^"]*\bnoopener\b[^"]*"/i.test(link[0])) {
      errors.push(`${relativeHtmlPath} has a target="_blank" link without rel="noopener".`);
    }
  }

  for (const match of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    const value = match[1];
    if (/^(?:https?:|mailto:|tel:|data:|javascript:)/i.test(value)) continue;
    checkedReferences += 1;

    if (value.startsWith('#')) {
      const fragment = safeDecode(value.slice(1));
      if (fragment && !html.includes(`id="${fragment}"`)) {
        errors.push(`${relativeHtmlPath} has a missing local fragment: ${value}`);
      }
      continue;
    }

    const targetFile = fileForUrl(value);
    if (!targetFile) {
      errors.push(`${relativeHtmlPath} escapes the configured base path: ${value}`);
      continue;
    }

    try {
      await fs.access(targetFile);
    } catch {
      errors.push(`${relativeHtmlPath} points to a missing file: ${value}`);
      continue;
    }

    const fragment = value.includes('#') ? safeDecode(value.split('#')[1].split('?')[0]) : '';
    if (fragment && targetFile.endsWith('.html')) {
      const targetHtml = htmlCache.get(targetFile) ?? await fs.readFile(targetFile, 'utf8');
      htmlCache.set(targetFile, targetHtml);
      if (!targetHtml.includes(`id="${fragment}"`)) {
        errors.push(`${relativeHtmlPath} points to a missing fragment: ${value}`);
      }
    }
  }
}

if (htmlFiles.length !== report.pages) {
  errors.push(`Build report declares ${report.pages} pages, but ${htmlFiles.length} HTML files were found.`);
}

const homeFile = fileForUrl(siteUrl('/'));
const homeHtml = htmlCache.get(homeFile) ?? await fs.readFile(homeFile, 'utf8');
const heroSourceItems = [...homeHtml.matchAll(/class="hero-source-item"/g)].length;
const heroSourceNumbers = [...homeHtml.matchAll(/<li class="hero-source-item"><a href="[^"]+"><span>([^<]+)<\/span><strong>/g)]
  .map((match) => match[1]);
const expectedHeroSourceItems = Math.min(6, report.counts?.sources ?? 0);
if (heroSourceItems !== expectedHeroSourceItems) {
  errors.push(`Home hero must show ${expectedHeroSourceItems} recent source item(s), found ${heroSourceItems}.`);
}

const heroSourceAllLink = homeHtml.match(/<a class="hero-source-all" href="([^"]+)"/i)?.[1];
if (!heroSourceAllLink || fileForUrl(heroSourceAllLink) !== fileForUrl(siteUrl('/sources/'))) {
  errors.push('Home hero must include an all-sources link to /sources/.');
}

const searchIndex = JSON.parse(await fs.readFile(path.join(distDir, 'search-index.json'), 'utf8'));
const expectedHeroSourceNumbers = searchIndex
  .filter((entry) => entry.sourceNumber)
  .sort((a, b) => String(a.sourceNumber).localeCompare(String(b.sourceNumber)))
  .slice(-6)
  .reverse()
  .map((entry) => String(entry.sourceNumber));
if (JSON.stringify(heroSourceNumbers) !== JSON.stringify(expectedHeroSourceNumbers)) {
  errors.push(`Home hero source order must be newest first: expected ${expectedHeroSourceNumbers.join(', ')}, found ${heroSourceNumbers.join(', ')}.`);
}

const artifactReaders = Array.isArray(report.artifactReaders) ? report.artifactReaders : [];
const translationsFile = fileForUrl(siteUrl('/translations/'));
const translationsHtml = htmlCache.get(translationsFile) ?? await fs.readFile(translationsFile, 'utf8');
const listedTranslationCount = [...translationsHtml.matchAll(/class="translation-card"/g)].length;
const expectedTranslationCount = artifactReaders.filter((reader) => reader.listedAsTranslation).length;
if (listedTranslationCount !== expectedTranslationCount) {
  errors.push(`Translation directory must list ${expectedTranslationCount} reader(s), found ${listedTranslationCount}.`);
}
if (report.artifactCounts?.readers !== artifactReaders.length || report.artifactCounts?.translations !== expectedTranslationCount) {
  errors.push('Build report artifact counts do not match the artifact reader ledger.');
}

for (const reader of artifactReaders) {
  if (!reader.url || !reader.sourceUrl || !reader.role) {
    errors.push(`Artifact reader metadata is incomplete: ${JSON.stringify(reader)}`);
    continue;
  }
  const readerUrl = siteUrl(reader.url);
  const sourceUrl = siteUrl(reader.sourceUrl);
  const readerFile = fileForUrl(readerUrl);
  const sourceFile = fileForUrl(sourceUrl);
  const readerHtml = htmlCache.get(readerFile) ?? await fs.readFile(readerFile, 'utf8');
  const sourceHtml = htmlCache.get(sourceFile) ?? await fs.readFile(sourceFile, 'utf8');
  htmlCache.set(readerFile, readerHtml);
  htmlCache.set(sourceFile, sourceHtml);

  if (!sourceHtml.includes(`href="${readerUrl}"`)) {
    errors.push(`Source page ${reader.sourceUrl} does not link to artifact reader ${reader.url}.`);
  }
  if (!readerHtml.includes('class="article-page artifact-page') || !readerHtml.includes(`href="${sourceUrl}"`)) {
    errors.push(`Artifact reader ${reader.url} must render as an artifact page with a source-note link.`);
  }
  if (reader.listedAsTranslation && !translationsHtml.includes(`href="${readerUrl}"`)) {
    errors.push(`Translation directory does not link to ${reader.url}.`);
  }
}

const requiredSearchFields = [
  'title',
  'url',
  'type',
  'category',
  'verification',
  'verificationLabel',
  'tagKeys',
  'tags',
  'evidenceCount',
  'relatedCount',
  'connectionCount',
  'sourceNumber',
];
const indexedUrls = new Set();
for (const entry of searchIndex) {
  const missingFields = requiredSearchFields.filter((field) => !(field in entry));
  if (missingFields.length) {
    errors.push(`Search index entry ${entry.url ?? entry.title ?? '(unknown)'} is missing: ${missingFields.join(', ')}`);
  }
  if (indexedUrls.has(entry.url)) errors.push(`Search index contains a duplicate URL: ${entry.url}`);
  indexedUrls.add(entry.url);

  const targetFile = fileForUrl(entry.url);
  try {
    await fs.access(targetFile);
  } catch {
    errors.push(`Search index points to a missing page: ${entry.url}`);
  }
}

let graphData;
try {
  graphData = JSON.parse(await fs.readFile(path.join(distDir, 'graph-data.json'), 'utf8'));
} catch (error) {
  errors.push(`Knowledge graph data is not valid JSON: ${error.message}`);
}

const graphPageFile = fileForUrl(siteUrl('/graph/'));
const graphPageHtml = htmlCache.get(graphPageFile) ?? await fs.readFile(graphPageFile, 'utf8');
htmlCache.set(graphPageFile, graphPageHtml);
const compiledMapStyles = await fs.readFile(path.join(distDir, 'assets', 'styles.css'), 'utf8');
const mapLoaderSource = await fs.readFile(path.join(distDir, 'assets', 'graph-map-loader.js'), 'utf8');
const expectedMapScriptUrl = siteUrl('/assets/graph-map-loader.js');
const expectedRelationshipScriptUrlForMap = siteUrl('/assets/relationship-explorer.js');
const mapScriptTags = [...graphPageHtml.matchAll(/<script\b[^>]*\bsrc="([^"]+)"[^>]*>\s*<\/script>/gi)];
const matchingMapScripts = mapScriptTags.filter((match) => match[1] === expectedMapScriptUrl);
if (matchingMapScripts.length !== 1) {
  errors.push(`Knowledge map page must load exactly one map script from ${expectedMapScriptUrl}.`);
} else if (!/\btype="module"/i.test(matchingMapScripts[0][0])) {
  errors.push('Knowledge map script must load as an ES module.');
}
if (mapScriptTags.some((match) => match[1] === expectedRelationshipScriptUrlForMap)) {
  errors.push(`Knowledge map page must not load the article relationship script ${expectedRelationshipScriptUrlForMap}.`);
}
if (mapScriptTags.some((match) => match[1] === siteUrl('/assets/graph-map.js'))) {
  errors.push('Knowledge map page must defer the full map runtime to the responsive loader.');
}
if (
  !/matchMedia\(['"]\(min-width:\s*1025px\)['"]\)/.test(mapLoaderSource)
  || !/import\(['"]\.\/graph-map\.js['"]\)/.test(mapLoaderSource)
  || /\bfetch\s*\(|graph-data\.json/.test(mapLoaderSource)
) {
  errors.push('Knowledge map loader must use the width-only 1025px desktop boundary and dynamically import the map without fetching graph data itself.');
}
const mapMain = graphPageHtml.match(/<main\b[^>]*\bclass="[^"]*\bmap-main\b[^"]*"[^>]*>/i)?.[0] ?? '';
if (!mapMain || attributeValue(mapMain, 'data-mobile-fallback') !== siteUrl('/')) {
  errors.push('Knowledge map main region must expose the configured mobile fallback URL.');
}
for (const hook of [
  'data-knowledge-map',
  'data-map-command-bar',
  'data-map-search-form',
  'data-map-search',
  'data-map-layout',
  'data-map-filters-open',
  'data-map-filters',
  'data-map-viewport',
  'data-map-svg',
  'data-map-node-actions',
  'data-map-fit',
  'data-map-details-toggle',
  'data-map-details',
  'data-map-details-content',
  'data-map-status',
  'data-map-text-index',
]) {
  if (!new RegExp(`<[^>]+\\b${hook}(?:\\s|=|>)`, 'i').test(graphPageHtml)) {
    errors.push(`Knowledge map page is missing the ${hook} hook.`);
  }
}
const layoutButtons = [...graphPageHtml.matchAll(/<button\b[^>]*\bdata-map-layout="([^"]+)"[^>]*>/gi)];
const layoutButtonIds = new Set(layoutButtons.map((match) => match[1]));
if (layoutButtons.length !== 3 || !['community', 'network', 'radial'].every((id) => layoutButtonIds.has(id))) {
  errors.push('Knowledge map must expose exactly the community, network, and radial layout buttons.');
}
if (layoutButtons.filter((match) => attributeValue(match[0], 'aria-pressed') === 'true').length !== 1) {
  errors.push('Knowledge map must start with exactly one active layout button.');
}
const mapSvg = graphPageHtml.match(/<svg\b[^>]*\bdata-map-svg(?=\s|=|>)[^>]*>/i)?.[0] ?? '';
if (!mapSvg || attributeValue(mapSvg, 'aria-hidden') !== 'true' || attributeValue(mapSvg, 'focusable') !== 'false') {
  errors.push('Knowledge map SVG must be a hidden, non-focusable visual layer.');
}
const mapDetailsToggle = graphPageHtml.match(/<button\b[^>]*\bdata-map-details-toggle(?=\s|=|>)[^>]*>/i)?.[0] ?? '';
if (
  !mapDetailsToggle
  || attributeValue(mapDetailsToggle, 'aria-expanded') !== 'false'
  || !/\bdisabled(?=\s|=|>)/i.test(mapDetailsToggle)
) {
  errors.push('Knowledge map details toggle must start disabled and collapsed.');
}
const mapDetails = graphPageHtml.match(/<aside\b[^>]*\bdata-map-details(?=\s|=|>)[^>]*>/i)?.[0] ?? '';
if (!mapDetails || attributeValue(mapDetails, 'aria-hidden') !== 'true' || !/\bhidden(?=\s|=|>)/i.test(mapDetails)) {
  errors.push('Knowledge map details panel must start hidden from view and assistive technology.');
}
const mapStatusTags = [...graphPageHtml.matchAll(/<[a-z][\w:-]*\b[^>]*\bdata-map-status(?=\s|=|>)[^>]*>/gi)].map((match) => match[0]);
if (
  mapStatusTags.length !== 1
  || attributeValue(mapStatusTags[0], 'role') !== 'status'
  || attributeValue(mapStatusTags[0], 'aria-live') !== 'polite'
  || attributeValue(mapStatusTags[0], 'aria-atomic') !== 'true'
) {
  errors.push('Knowledge map must contain one polite, atomic live status region.');
}
if (/<canvas\b|data-graph-mode="first-person"|data-graph-minimap|data-graph-pointer-lock/i.test(graphPageHtml)) {
  errors.push('Knowledge map page must not retain canvas, first-person, pointer-lock, or minimap UI.');
}
if (!graphPageHtml.includes(`data-graph-url="${siteUrl('/graph-data.json')}"`)) {
  errors.push('Knowledge map page does not reference graph-data.json through the configured base path.');
}
const mapTextIndex = elementMarkupForHook(graphPageHtml, 'data-map-text-index');
if (!mapTextIndex || !/<a\b[^>]*\bhref="[^"]+"/i.test(mapTextIndex)) {
  errors.push('Knowledge map must retain a linked text index fallback.');
}
if (!compiledMapStyles.includes('.knowledge-map') || !compiledMapStyles.includes('.map-viewport')) {
  errors.push('Knowledge map stylesheet is missing its core 2D map surfaces.');
}
if (
  !compiledMapStyles.includes('.desktop-graph-link,')
  || !compiledMapStyles.includes('.graph-map-page .map-main {')
  || !compiledMapStyles.includes('display: none !important;')
) {
  errors.push('Mobile layouts must remove graph entry points and the complete knowledge map section.');
}
if (/data-relationship-context="graph"|relationship-explorer--graph|data-graph-mobile/.test(graphPageHtml)) {
  errors.push('Knowledge map page must not retain a mobile or relationship-explorer graph surface.');
}

const graphDataIsObject = graphData !== null && typeof graphData === 'object' && !Array.isArray(graphData);
if (graphData !== undefined && !graphDataIsObject) {
  errors.push('Knowledge graph data must be a non-null JSON object.');
}

if (graphDataIsObject) {
  if (graphData.schemaVersion !== 2) errors.push(`Knowledge graph schema version must be 2, found ${graphData.schemaVersion}.`);
  if (graphData.layoutVersion !== 6) errors.push(`Knowledge graph layout version must be 6, found ${graphData.layoutVersion}.`);
  if (![graphData.dimensions?.width, graphData.dimensions?.height].every((value) => Number.isFinite(value) && value > 0)) {
    errors.push('Knowledge graph dimensions must contain positive finite width and height values.');
  }
  const graphNodes = Array.isArray(graphData.nodes) ? graphData.nodes : [];
  const graphEdges = Array.isArray(graphData.edges) ? graphData.edges : [];
  const graphCommunities = Array.isArray(graphData.communities) ? graphData.communities : [];
  const graphLayouts = Array.isArray(graphData.layouts) ? graphData.layouts : [];
  if (!Array.isArray(graphData.nodes)) errors.push('Knowledge graph nodes must be an array.');
  if (!Array.isArray(graphData.edges)) errors.push('Knowledge graph edges must be an array.');
  if (!Array.isArray(graphData.communities)) errors.push('Knowledge graph communities must be an array.');
  if (!Array.isArray(graphData.layouts)) errors.push('Knowledge graph layouts must be an array.');
  const layoutIds = new Set(graphLayouts.map((layout) => layout?.id).filter(Boolean));
  if (!layoutIds.has(graphData.defaultLayout)) errors.push(`Knowledge graph default layout '${graphData.defaultLayout}' is not registered.`);
  for (const requiredLayout of ['community', 'network', 'radial']) {
    if (!layoutIds.has(requiredLayout)) errors.push(`Knowledge graph is missing required layout '${requiredLayout}'.`);
  }

  const nodeIds = new Set();
  const nodeUrls = new Set();
  const communityIds = new Set(graphCommunities
    .filter((community) => community !== null && typeof community === 'object' && !Array.isArray(community))
    .map((community) => community.id));
  for (let leftIndex = 0; leftIndex < graphCommunities.length; leftIndex += 1) {
    const left = graphCommunities[leftIndex];
    if (!left || ![left.x, left.y, left.radius].every(Number.isFinite)) continue;
    for (let rightIndex = leftIndex + 1; rightIndex < graphCommunities.length; rightIndex += 1) {
      const right = graphCommunities[rightIndex];
      if (!right || ![right.x, right.y, right.radius].every(Number.isFinite)) continue;
      const separatedHorizontally = Math.abs(left.x - right.x) >= (left.radius + right.radius) * 1.22;
      const separatedVertically = Math.abs(left.y - right.y) >= (left.radius + right.radius) * 0.92;
      if (!separatedHorizontally && !separatedVertically) {
        errors.push(`Knowledge graph communities ${left.id} and ${right.id} overlap in the community layout.`);
      }
    }
  }
  const allowedTypes = new Set(['source', 'reference', 'concept', 'entity', 'analysis']);
  const allowedVerification = new Set(['verified', 'partial', 'disputed', 'unverified']);
  for (const node of graphNodes) {
    if (node === null || typeof node !== 'object' || Array.isArray(node)) {
      errors.push(`Knowledge graph contains a non-object node: ${JSON.stringify(node)}`);
      continue;
    }
    const missing = ['id', 'title', 'url', 'type', 'category', 'verification', 'community', 'bridgeConnections', 'x', 'y', 'radius', 'layouts']
      .filter((field) => !(field in node));
    if (missing.length) errors.push(`Knowledge graph node ${node.id ?? '(unknown)'} is missing: ${missing.join(', ')}`);
    if (nodeIds.has(node.id)) errors.push(`Knowledge graph contains a duplicate node ID: ${node.id}`);
    nodeIds.add(node.id);
    if (nodeUrls.has(node.url)) errors.push(`Knowledge graph contains a duplicate node URL: ${node.url}`);
    nodeUrls.add(node.url);
    if (!allowedTypes.has(node.type)) errors.push(`Knowledge graph node ${node.id} has invalid type '${node.type}'.`);
    if (!allowedVerification.has(node.verification)) errors.push(`Knowledge graph node ${node.id} has invalid verification '${node.verification}'.`);
    if (!communityIds.has(node.community)) errors.push(`Knowledge graph node ${node.id} references missing community ${node.community}.`);
    if (![node.x, node.y, node.radius].every(Number.isFinite)) errors.push(`Knowledge graph node ${node.id} has invalid map coordinates.`);
    for (const layoutId of layoutIds) {
      const position = node.layouts?.[layoutId];
      if (![position?.x, position?.y].every(Number.isFinite)) {
        errors.push(`Knowledge graph node ${node.id} has invalid '${layoutId}' layout coordinates.`);
      }
    }
    const targetFile = fileForUrl(node.url);
    try {
      if (!targetFile) throw new Error('invalid URL');
      await fs.access(targetFile);
    } catch {
      errors.push(`Knowledge graph node ${node.id} points to a missing page: ${node.url}`);
    }
  }

  const validBridgeNodes = graphNodes.filter((node) => (
    node !== null
    && typeof node === 'object'
    && !Array.isArray(node)
    && Number.isFinite(node.bridgeConnections)
  ));
  const maximumBridgeConnections = Math.max(0, ...validBridgeNodes.map((node) => node.bridgeConnections));
  const positiveBridgeCounts = validBridgeNodes
    .map((node) => node.bridgeConnections)
    .filter((count) => count > 0)
    .sort((left, right) => left - right);
  const medianBridgeConnections = positiveBridgeCounts.length
    ? positiveBridgeCounts[Math.floor((positiveBridgeCounts.length - 1) / 2)]
    : 0;
  if (graphData.stats?.maxBridgeConnections !== maximumBridgeConnections) {
    errors.push('Knowledge graph maximum bridge statistic does not match its nodes.');
  }
  if (graphData.stats?.medianBridgeConnections !== medianBridgeConnections) {
    errors.push('Knowledge graph median bridge statistic does not match its nodes.');
  }
  const expectedGraphIds = new Set(searchIndex.filter((entry) => entry.type !== 'meta').map((entry) => entry.id));
  const searchEntriesById = new Map(searchIndex
    .filter((entry) => entry.type !== 'meta')
    .map((entry) => [entry.id, entry]));
  const missingGraphIds = [...expectedGraphIds].filter((id) => !nodeIds.has(id));
  const extraGraphIds = [...nodeIds].filter((id) => !expectedGraphIds.has(id));
  if (missingGraphIds.length || extraGraphIds.length) {
    errors.push(`Knowledge graph node set differs from published search entries (missing: ${missingGraphIds.join(', ') || '-'}; extra: ${extraGraphIds.join(', ') || '-'}).`);
  }
  if (graphNodes.length !== report.publishedDocuments) {
    errors.push(`Knowledge graph has ${graphNodes.length} nodes, expected ${report.publishedDocuments}.`);
  }

  for (const node of graphNodes) {
    if (node === null || typeof node !== 'object' || Array.isArray(node)) continue;
    const searchEntry = searchEntriesById.get(node.id);
    if (!searchEntry) continue;
    const comparisons = [
      ['title', node.title, searchEntry.title],
      ['url', node.url, searchEntry.url],
      ['type', node.type, searchEntry.type],
      ['verification', node.verification, searchEntry.verification],
      ['category/categoryKey', node.category, searchEntry.categoryKey],
    ];
    for (const [field, actual, expected] of comparisons) {
      if (actual !== expected) {
        errors.push(`Knowledge graph node ${node.id} ${field} does not match the search index (graph: ${JSON.stringify(actual)}; search: ${JSON.stringify(expected)}).`);
      }
    }
  }

  const collisions = [];
  for (let leftIndex = 0; leftIndex < graphNodes.length; leftIndex += 1) {
    const left = graphNodes[leftIndex];
    if (left === null || typeof left !== 'object' || Array.isArray(left)) continue;
    if (![left.x, left.y, left.radius].every(Number.isFinite)) continue;
    for (let rightIndex = leftIndex + 1; rightIndex < graphNodes.length; rightIndex += 1) {
      const right = graphNodes[rightIndex];
      if (right === null || typeof right !== 'object' || Array.isArray(right)) continue;
      if (left.community !== right.community || ![right.x, right.y, right.radius].every(Number.isFinite)) continue;
      const distance = Math.hypot(right.x - left.x, right.y - left.y);
      const minimumDistance = left.radius + right.radius + 28;
      // Graph coordinates are serialized to 0.1px, so allow the same 0.2px
      // rounding tolerance used by the layout regression test.
      if (distance + 0.2 < minimumDistance) {
        collisions.push(`${left.id} / ${right.id} (${distance.toFixed(1)} < ${minimumDistance.toFixed(1)})`);
      }
    }
  }
  if (collisions.length) {
    const preview = collisions.slice(0, 8).join('; ');
    const remainder = collisions.length > 8 ? `; ...and ${collisions.length - 8} more` : '';
    errors.push(`Knowledge graph contains ${collisions.length} same-community node collision(s): ${preview}${remainder}.`);
  }

  const edgeIds = new Set();
  const directedPairs = new Set();
  const allowedKinds = new Set(['body', 'related']);
  const representedKinds = new Set();
  if (!graphEdges.length) errors.push('Knowledge graph must contain at least one edge.');
  for (const edge of graphEdges) {
    if (edge === null || typeof edge !== 'object' || Array.isArray(edge)) {
      errors.push(`Knowledge graph contains a non-object edge: ${JSON.stringify(edge)}`);
      continue;
    }
    if (edgeIds.has(edge.id)) errors.push(`Knowledge graph contains a duplicate edge ID: ${edge.id}`);
    edgeIds.add(edge.id);
    const pair = `${edge.source}\u0000${edge.target}`;
    if (directedPairs.has(pair)) errors.push(`Knowledge graph contains a duplicate directed edge: ${edge.source} -> ${edge.target}`);
    directedPairs.add(pair);
    if (!nodeIds.has(edge.source) || !nodeIds.has(edge.target)) errors.push(`Knowledge graph edge ${edge.id} has a missing endpoint.`);
    if (edge.source === edge.target) errors.push(`Knowledge graph edge ${edge.id} is a self edge.`);
    const relationKinds = Array.isArray(edge.kinds)
      ? edge.kinds
      : edge.kind === 'both'
        ? ['body', 'related']
        : [edge.kind].filter(Boolean);
    if (!relationKinds.length || relationKinds.some((kind) => !allowedKinds.has(kind)) || new Set(relationKinds).size !== relationKinds.length) {
      errors.push(`Knowledge graph edge ${edge.id} has invalid relation kinds.`);
    }
    for (const kind of relationKinds) {
      if (allowedKinds.has(kind)) representedKinds.add(kind);
    }
    const expectedKind = relationKinds.includes('body') && relationKinds.includes('related')
      ? 'both'
      : relationKinds[0];
    if ('kind' in edge && edge.kind !== expectedKind) errors.push(`Knowledge graph edge ${edge.id} kind '${edge.kind}' does not match its relation kinds.`);
    if (edge.confidence !== 'EXTRACTED' || edge.confidenceScore !== 1) errors.push(`Knowledge graph edge ${edge.id} must retain explicit-source confidence.`);
  }
  for (const requiredKind of allowedKinds) {
    if (!representedKinds.has(requiredKind)) {
      errors.push(`Knowledge graph edges must include at least one ${requiredKind} relation.`);
    }
  }

  if (graphData.stats?.nodes !== graphNodes.length || graphData.stats?.edges !== graphEdges.length || graphData.stats?.communities !== graphCommunities.length) {
    errors.push('Knowledge graph statistics do not match its arrays.');
  }
  if (report.graph?.nodes !== graphNodes.length || report.graph?.edges !== graphEdges.length) {
    errors.push('Build report graph statistics do not match graph-data.json.');
  }

  if (!graphPageHtml.includes(`data-graph-url="${siteUrl('/graph-data.json')}"`)) {
    errors.push('Knowledge graph page does not reference graph-data.json through the configured base path.');
  }
}

if (errors.length) {
  console.error(`Site check failed with ${errors.length} error(s):`);
  for (const error of errors.slice(0, 40)) console.error(`- ${error}`);
  if (errors.length > 40) console.error(`- ...and ${errors.length - 40} more`);
  process.exitCode = 1;
} else {
  console.log(`Checked ${htmlFiles.length} HTML files and ${checkedReferences} local references.`);
  console.log(`Search index contains ${searchIndex.length} entries.`);
  console.log(`Unresolved wiki targets retained as non-clickable labels: ${report.unresolvedLinks.length}.`);
}
