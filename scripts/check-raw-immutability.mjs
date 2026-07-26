import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import path from 'node:path';
import { rootDir } from './lib/project-paths.mjs';

const exec = promisify(execFile);
const rawPath = path.relative(rootDir, path.join(rootDir, 'raw')).replaceAll('\\', '/');
const changed = new Set();

async function collect(args) {
  try {
    const { stdout } = await exec('git', args, { cwd: rootDir, windowsHide: true });
    for (const line of stdout.split(/\r?\n/).map((item) => item.trim()).filter(Boolean)) changed.add(line.replaceAll('\\', '/'));
  } catch (error) {
    if (error.code !== 1) throw error;
  }
}

await collect(['diff', '--name-only', '--', rawPath]);
await collect(['diff', '--cached', '--name-only', '--', rawPath]);
await collect(['status', '--short', '--untracked-files=all', '--', rawPath]);
const comparisonBase = process.env.GITHUB_BASE_SHA || process.env.BASE_SHA;
if (comparisonBase) await collect(['diff', '--name-only', `${comparisonBase}...HEAD`, '--', rawPath]);

const rawChanges = [...changed]
  .map((line) => line.replace(/^..\s+/, '').trim())
  .filter((line) => line === rawPath || line.startsWith(`${rawPath}/`));
if (rawChanges.length) {
  console.error(`Raw artifacts are immutable; revert or move these changes out of scope: ${rawChanges.join(', ')}`);
  process.exitCode = 1;
} else {
  console.log('Raw immutability check passed.');
}
