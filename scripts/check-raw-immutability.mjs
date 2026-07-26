import { promises as fs } from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';
import { rootDir } from './lib/project-paths.mjs';
import {
  classifyRawChanges,
  collectRawGitChanges,
  validateRegisteredAdditions,
} from './lib/raw-integrity.mjs';

const rawPath = 'raw';
const registryPath = path.join(rootDir, 'wiki', 'meta', 'raw-artifacts.yml');
const registry = yaml.safeLoad(await fs.readFile(registryPath, 'utf8'));
if (!registry || registry.schema_version !== 1 || !Array.isArray(registry.artifacts)) {
  throw new Error('wiki/meta/raw-artifacts.yml does not match the expected registry structure.');
}

const changes = await collectRawGitChanges({
  projectRoot: rootDir,
  rawPath,
  comparisonBase: process.env.GITHUB_BASE_SHA || process.env.BASE_SHA || '',
});
const { additions, violations } = classifyRawChanges(changes, { rawPath });
const additionProblems = await validateRegisteredAdditions(additions, {
  projectRoot: rootDir,
  artifactRecords: registry.artifacts,
});
const problems = [
  ...violations.map((change) => `Immutable raw artifact changed: ${change}`),
  ...additionProblems,
];

if (problems.length) {
  console.error(`Raw integrity check failed:\n- ${problems.join('\n- ')}`);
  process.exitCode = 1;
} else {
  const additionSummary = additions.length > 0
    ? `; ${additions.length} registered addition(s) verified`
    : '';
  console.log(`Raw integrity check passed${additionSummary}.`);
}
