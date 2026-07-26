import { promises as fs } from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';
import { rootDir, metaDir, distDir } from './lib/project-paths.mjs';

const report = JSON.parse(await fs.readFile(path.join(distDir, 'build-report.json'), 'utf8'));
const redirects = report.redirects.map((item) => ({
  kind: item.kind,
  target_id: item.sourceId,
  ...(item.canonicalNumber ? { canonical_number: item.canonicalNumber } : {}),
  ...(item.legacyPrefix ? { legacy_prefix: item.legacyPrefix } : {}),
  from: item.from,
  to: item.to,
}));
const output = yaml.safeDump({ schema_version: 1, redirects }, { noRefs: true, lineWidth: -1, sortKeys: false });
await fs.writeFile(path.join(metaDir, 'site-redirects.yml'), output, 'utf8');
console.log(`Wrote ${redirects.length} site redirects.`);
