import { promises as fs } from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { wikiDir } from './lib/project-paths.mjs';
import { createWikiLookup, loadMarkdownDocuments } from './lib/wiki-utils.mjs';

const indexPath = path.join(wikiDir, 'index.md');
const documents = (await loadMarkdownDocuments(wikiDir)).map((document) => ({
  ...document,
  id: document.data.id,
  title: document.data.title,
  aliases: document.data.aliases,
}));
const categoryRank = ['concept', 'source', 'reference', 'analysis', 'entity', 'meta'];
const lookup = createWikiLookup(documents, {
  rankOf: (document) => categoryRank.indexOf(document.data.page_type),
});

const raw = await fs.readFile(indexPath, 'utf8');
const parsed = matter(raw);
const lines = parsed.content.split(/\r?\n/).map((line) => {
  const match = line.match(/^(\s*-\s+\[\[([^\]|#]+)(?:\|[^\]]+)?\]\]\s+—\s+.*?)(?:\s+\((?:소스|근거)\s+\d+개\))\s*$/);
  if (!match) return line;
  const document = lookup.resolve(match[2]).document;
  if (!document || document.data.page_type === 'meta') return line;
  const count = Array.isArray(document.data.evidence) ? document.data.evidence.length : 0;
  return `${match[1]} (근거 ${count}개)`;
});

const output = `${matter.stringify(lines.join('\n').trimStart(), parsed.data).trimEnd()}\n`;
await fs.writeFile(indexPath, output, 'utf8');
console.log('Synchronized index evidence counts.');
