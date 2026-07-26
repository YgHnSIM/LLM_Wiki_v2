import { promises as fs } from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { wikiDir } from './lib/project-paths.mjs';

async function files(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map(async (entry) => {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) return files(absolute);
    return entry.isFile() && entry.name.endsWith('.md') ? [absolute] : [];
  }));
  return nested.flat();
}

const changed = [];
function normalizeNextBody(content) {
  return String(content).replace(/(### 다음 문서\s*\n\n)([\s\S]*?)(?=\n##\s|$)/g, (_section, heading, block) => {
    const normalized = block.split(/\r?\n/).map((line) => {
      const match = line.match(/^(\s*-\s+\[\[[^\]|#]+(?:\|([^\]]+))?\]\])\s+—\s+(.+)\s*$/);
      if (!match) return line;
      const label = String(match[2] ?? '').trim();
      const rawReason = String(match[3] ?? '').trim();
      const reason = label && rawReason.startsWith(`${label} — `) ? rawReason.slice(label.length + 3).trim() : rawReason;
      return `${match[1]}${reason ? ` — ${reason}` : ''}`;
    }).join('\n');
    return `${heading}${normalized}`;
  });
}

for (const absolutePath of await files(wikiDir)) {
  const raw = await fs.readFile(absolutePath, 'utf8');
  const parsed = matter(raw);
  if (parsed.data.schema_version !== 3) continue;
  const content = normalizeNextBody(parsed.content);
  let dataChanged = false;
  if (parsed.data.page_type !== 'meta' && !String(parsed.data.learning?.assumed_knowledge ?? '').trim()) {
    parsed.data.learning.assumed_knowledge = '없음';
    dataChanged = true;
  }
  const learningTargets = new Set([
    ...(parsed.data.learning?.prerequisites ?? []),
    ...(parsed.data.learning?.next ?? []),
  ].map((item) => item.target));
  const relations = parsed.data.relations ?? [];
  const filtered = relations.filter((item) => !learningTargets.has(item.target));
  parsed.data.relations = filtered;
  if (filtered.length === relations.length && content === parsed.content && !dataChanged) continue;
  await fs.writeFile(absolutePath, matter.stringify(content, parsed.data, { lineWidth: -1, noRefs: true }), 'utf8');
  changed.push(path.relative(wikiDir, absolutePath).replaceAll('\\', '/'));
}
console.log(`Normalized ${changed.length} page(s).`);
