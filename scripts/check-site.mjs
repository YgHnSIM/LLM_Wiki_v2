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

const requiredOutputFiles = [
  'search/index.html',
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

  if (/\brole="(?:listbox|option)"/i.test(html)) {
    errors.push(`${relativeHtmlPath} uses listbox semantics without a complete combobox contract.`);
  }

  if (/<del\b/i.test(html)) {
    errors.push(`${relativeHtmlPath} contains an unexpected strikethrough; check numeric ranges using "~".`);
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
