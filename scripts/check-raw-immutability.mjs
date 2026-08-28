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

const unverifiedViolations = [];
const verifiedUpdates = [];

for (const violation of violations) {
  const match = violation.match(/^M\s+(.+)$/);
  if (match) {
    const rawFilePath = match[1];
    const record = registry.artifacts.find((a) => a.path === rawFilePath);
    if (record) {
      try {
        const content = await fs.readFile(path.join(rootDir, ...rawFilePath.split('/')));
        const crypto = await import('node:crypto');
        const actualHash = crypto.createHash('sha256').update(content).digest('hex');
        if (actualHash === record.sha256) {
          verifiedUpdates.push(rawFilePath);
          continue;
        }
      } catch {}
    }
  }
  unverifiedViolations.push(violation);
}

const additionProblems = await validateRegisteredAdditions(additions, {
  projectRoot: rootDir,
  artifactRecords: registry.artifacts,
});
const problems = [
  ...unverifiedViolations.map((change) => `Immutable raw artifact changed: ${change}`),
  ...additionProblems,
];

if (problems.length) {
  console.error(`Raw integrity check failed:\n- ${problems.join('\n- ')}`);
  process.exitCode = 1;
} else {
  const verifiedCount = additions.length + verifiedUpdates.length;
  const verifiedSummary = verifiedCount > 0
    ? `; ${verifiedCount} registered artifact change(s) verified`
    : '';
  console.log(`Raw integrity check passed${verifiedSummary}.`);
}
