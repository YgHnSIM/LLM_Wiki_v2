import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const wikiDir = path.join(rootDir, 'wiki');
const indexPath = path.join(wikiDir, 'index.md');

async function walkMarkdown(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const files = await Promise.all(entries.map(async (entry) => {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) return walkMarkdown(absolute);
    return entry.isFile() && entry.name.endsWith('.md') ? [absolute] : [];
  }));
  return files.flat();
}

function normalize(value = '') {
  return String(value).replace(/\.md$/i, '').normalize('NFKC').trim().replace(/\s+/g, ' ').toLocaleLowerCase('ko');
}

const lookup = new Map();
for (const absolute of await walkMarkdown(wikiDir)) {
  const parsed = matter(await fs.readFile(absolute, 'utf8'));
  const filename = path.basename(absolute, '.md');
  const document = { data: parsed.data, filename };
  lookup.set(normalize(filename), document);
  lookup.set(normalize(parsed.data.title), document);
  for (const alias of parsed.data.aliases ?? []) if (!lookup.has(normalize(alias))) lookup.set(normalize(alias), document);
}

const raw = await fs.readFile(indexPath, 'utf8');
const parsed = matter(raw);
const lines = parsed.content.split(/\r?\n/).map((line) => {
  const match = line.match(/^(\s*-\s+\[\[([^\]|#]+)(?:\|[^\]]+)?\]\]\s+—\s+.*?)(?:\s+\((?:소스|근거)\s+\d+개\))\s*$/);
  if (!match) return line;
  const document = lookup.get(normalize(match[2]));
  if (!document || document.data.page_type === 'meta') return line;
  const count = Array.isArray(document.data.evidence) ? document.data.evidence.length : 0;
  return `${match[1]} (근거 ${count}개)`;
});

const output = `${matter.stringify(lines.join('\n').trimStart(), parsed.data).trimEnd()}\n`;
await fs.writeFile(indexPath, output, 'utf8');
console.log('Synchronized index evidence counts.');
