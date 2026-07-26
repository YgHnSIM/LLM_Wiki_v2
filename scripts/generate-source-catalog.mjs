import { promises as fs } from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';
import { metaDir, wikiDir } from './lib/project-paths.mjs';
import { loadMarkdownDocuments } from './lib/wiki-utils.mjs';

const outputFile = path.join(metaDir, 'source-catalog.yml');
const documents = await loadMarkdownDocuments(wikiDir);
const sources = documents
  .filter((document) => ['source', 'reference'].includes(document.data.page_type))
  .map((document) => {
    const numberMatch = String(document.data.id ?? '').match(/^source\.(\d{3})$/);
    return {
      id: document.data.id,
      source_number: numberMatch?.[1] ?? null,
      title: document.data.title,
      page_type: document.data.page_type,
      path: `wiki/${document.relativePath}`,
      artifacts: Array.isArray(document.data.artifacts) ? document.data.artifacts : [],
      editorial_status: document.data.editorial_status,
      evidence_coverage: document.data.review?.evidence_coverage,
    };
  })
  .sort((left, right) => String(left.id).localeCompare(String(right.id), 'en'));

const output = {
  schema_version: 1,
  generated_on: new Date().toISOString().slice(0, 10),
  sources,
};
await fs.writeFile(outputFile, yaml.dump(output, { noRefs: true, lineWidth: 120 }), 'utf8');
console.log(`Wrote ${sources.length} source catalog records to ${path.relative(process.cwd(), outputFile)}.`);
