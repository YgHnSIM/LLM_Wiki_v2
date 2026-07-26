import { createHash } from 'node:crypto';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';
import { metaDir, wikiDir } from './lib/project-paths.mjs';
import { loadMarkdownDocuments } from './lib/wiki-utils.mjs';

const outputFile = path.join(metaDir, 'evidence-scope-baseline.yml');
const documents = await loadMarkdownDocuments(wikiDir);
const entries = [];
for (const document of documents) {
  for (const evidence of Array.isArray(document.data.evidence) ? document.data.evidence : []) {
    const pageId = String(document.data.id ?? '').trim();
    const sourceId = String(evidence?.source_id ?? '').trim();
    const locator = String(evidence?.locator ?? '').trim();
    const relation = String(evidence?.relation ?? '').trim();
    const key = [pageId, sourceId, locator, relation].join('\u0000');
    entries.push({
      fingerprint: createHash('sha256').update(key).digest('hex'),
      scope: Array.isArray(evidence?.scope) ? evidence.scope : [],
    });
  }
}
entries.sort((left, right) => left.fingerprint.localeCompare(right.fingerprint));

const output = {
  schema_version: 1,
  generated_on: new Date().toISOString().slice(0, 10),
  entries,
};
await fs.writeFile(outputFile, yaml.dump(output, { noRefs: true, lineWidth: 120 }), 'utf8');
console.log(`Wrote ${entries.length} evidence scope baseline records to ${path.relative(process.cwd(), outputFile)}.`);
