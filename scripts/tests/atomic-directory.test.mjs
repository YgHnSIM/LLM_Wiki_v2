import assert from 'node:assert/strict';
import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { buildDirectoryAtomically } from '../lib/atomic-directory.mjs';

test('an atomic directory build replaces the previous output only after success', async () => {
  const parentDir = await fs.mkdtemp(path.join(os.tmpdir(), 'llm-wiki-atomic-'));
  const targetDir = path.join(parentDir, 'dist');

  try {
    await fs.mkdir(targetDir);
    await fs.writeFile(path.join(targetDir, 'old.txt'), 'old', 'utf8');

    await buildDirectoryAtomically(targetDir, async (temporaryDir) => {
      await fs.mkdir(temporaryDir, { recursive: true });
      await fs.writeFile(path.join(temporaryDir, 'new.txt'), 'new', 'utf8');
    });

    assert.equal(await fs.readFile(path.join(targetDir, 'new.txt'), 'utf8'), 'new');
    await assert.rejects(fs.access(path.join(targetDir, 'old.txt')));
  } finally {
    await fs.rm(parentDir, { recursive: true, force: true });
  }
});

test('a failed atomic directory build preserves the previous output', async () => {
  const parentDir = await fs.mkdtemp(path.join(os.tmpdir(), 'llm-wiki-atomic-'));
  const targetDir = path.join(parentDir, 'dist');

  try {
    await fs.mkdir(targetDir);
    await fs.writeFile(path.join(targetDir, 'stable.txt'), 'stable', 'utf8');

    await assert.rejects(
      buildDirectoryAtomically(targetDir, async (temporaryDir) => {
        await fs.mkdir(temporaryDir, { recursive: true });
        await fs.writeFile(path.join(temporaryDir, 'partial.txt'), 'partial', 'utf8');
        throw new Error('simulated build failure');
      }),
      /simulated build failure/,
    );

    assert.equal(await fs.readFile(path.join(targetDir, 'stable.txt'), 'utf8'), 'stable');
    assert.deepEqual((await fs.readdir(parentDir)).sort(), ['dist']);
  } finally {
    await fs.rm(parentDir, { recursive: true, force: true });
  }
});
