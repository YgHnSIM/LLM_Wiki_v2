import { promises as fs } from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

export const collator = new Intl.Collator('ko', { numeric: true, sensitivity: 'base' });

export async function walkFiles(directory, extension = '') {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const files = await Promise.all(entries.map(async (entry) => {
    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) return walkFiles(absolutePath, extension);
    return entry.isFile() && (!extension || entry.name.endsWith(extension)) ? [absolutePath] : [];
  }));
  return files.flat().sort(collator.compare);
}

export async function loadMarkdownDocuments(directory) {
  const markdownFiles = await walkFiles(directory, '.md');
  return Promise.all(markdownFiles.map(async (absolutePath) => {
    const raw = await fs.readFile(absolutePath, 'utf8');
    const parsed = matter(raw);
    const relativePath = path.relative(directory, absolutePath).replaceAll('\\', '/');
    return {
      absolutePath,
      relativePath,
      filename: path.basename(relativePath, '.md'),
      raw,
      parsed,
      content: parsed.content,
      body: parsed.content.trim(),
      data: parsed.data,
    };
  }));
}

export function asArray(value) {
  if (Array.isArray(value)) return value;
  if (value === undefined || value === null || value === '') return [];
  return [value];
}

export function asStringArray(value) {
  return asArray(value).map(String);
}

export function normalizeWikiName(value = '') {
  return String(value)
    .normalize('NFKC')
    .trim()
    .replace(/\.md$/i, '')
    .replace(/\s+/g, ' ')
    .toLocaleLowerCase('ko');
}

export function slugify(value = '') {
  return String(value)
    .normalize('NFKC')
    .toLocaleLowerCase('ko')
    .replace(/[’']/g, '')
    .replace(/[^\p{Letter}\p{Number}]+/gu, '-')
    .replace(/^-+|-+$/g, '') || 'page';
}

export function parseWikiLink(value = '') {
  const raw = String(value);
  const separatorIndex = raw.indexOf('|');
  const target = (separatorIndex >= 0 ? raw.slice(0, separatorIndex) : raw).trim();
  const explicitLabel = separatorIndex >= 0 ? raw.slice(separatorIndex + 1).trim() : '';
  const headingIndex = target.indexOf('#');
  const targetPath = (headingIndex >= 0 ? target.slice(0, headingIndex) : target).trim();
  const heading = headingIndex >= 0 ? target.slice(headingIndex + 1).trim() : '';
  const basename = path.posix.basename(targetPath.replaceAll('\\', '/')).replace(/\.md$/i, '');

  return {
    raw,
    target,
    targetPath,
    basename,
    heading,
    label: explicitLabel || basename,
  };
}

export function extractWikiLinks(markdown = '') {
  return [...String(markdown).matchAll(/\[\[([^\]\n]+)\]\]/g)].map((match) => match[1]);
}

export function markdownBeforeFinalH2(markdown = '', heading = '') {
  const source = String(markdown);
  const expectedHeading = String(heading).trim();
  if (!expectedHeading) return source;

  const matches = [...source.matchAll(/^##[ \t]+(.+?)[ \t]*\r?$/gm)]
    .filter((match) => match[1].trim() === expectedHeading);
  const finalMatch = matches.at(-1);
  return finalMatch ? source.slice(0, finalMatch.index) : source;
}

export function createWikiLookup(documents, {
  filenameOf = (document) => document.filename,
  titleOf = (document) => document.title,
  aliasesOf = (document) => document.aliases,
  idOf = (document) => document.id,
  rankOf = () => 0,
} = {}) {
  const exact = new Map();
  const named = new Map();
  const ids = new Map();

  function addNamed(value, document) {
    const key = normalizeWikiName(value);
    if (!key) return;
    const matches = named.get(key) ?? [];
    if (!matches.includes(document)) matches.push(document);
    named.set(key, matches);
  }

  for (const document of documents) {
    const filename = filenameOf(document);
    const exactKey = normalizeWikiName(filename);
    if (exactKey && !exact.has(exactKey)) exact.set(exactKey, document);
    addNamed(filename, document);
    addNamed(titleOf(document), document);
    for (const alias of asArray(aliasesOf(document))) addNamed(alias, document);

    const idKey = normalizeWikiName(idOf(document));
    if (idKey && !ids.has(idKey)) ids.set(idKey, document);
  }

  function resolve(value) {
    const parsed = parseWikiLink(value);
    const key = normalizeWikiName(parsed.basename);
    const exactMatch = exact.get(key);
    if (exactMatch) return { ...parsed, document: exactMatch };

    const candidates = [...(named.get(key) ?? [])].sort((left, right) => {
      const rankDifference = rankOf(left) - rankOf(right);
      if (rankDifference) return rankDifference;
      return collator.compare(String(filenameOf(left)), String(filenameOf(right)));
    });
    return { ...parsed, document: candidates[0] ?? null };
  }

  function resolveId(value) {
    return ids.get(normalizeWikiName(value)) ?? null;
  }

  return { exact, named, ids, resolve, resolveId };
}

export function formatDate(value) {
  if (!value) return '';
  if (value instanceof Date && !Number.isNaN(value.valueOf())) return value.toISOString().slice(0, 10);
  return String(value).slice(0, 10);
}
