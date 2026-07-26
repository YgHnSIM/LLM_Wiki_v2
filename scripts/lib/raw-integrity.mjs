import { execFile as execFileCallback } from 'node:child_process';
import { createHash, randomUUID } from 'node:crypto';
import { constants as fsConstants, promises as fs } from 'node:fs';
import path from 'node:path';
import { promisify } from 'node:util';

const execFile = promisify(execFileCallback);

function bufferText(value) {
  return Buffer.isBuffer(value) ? value.toString('utf8') : String(value ?? '');
}

function nulFields(value) {
  const fields = bufferText(value).split('\0');
  if (fields.at(-1) === '') fields.pop();
  return fields;
}

function normalizeGitPath(value) {
  return String(value).replaceAll('\\', '/');
}

/**
 * Parse `git diff --name-status -z` output without relying on quoted paths.
 * Rename and copy records own two paths; every other record owns one.
 */
export function parseNameStatusZ(value) {
  const fields = nulFields(value);
  const changes = [];

  for (let index = 0; index < fields.length;) {
    const status = fields[index];
    index += 1;
    if (!/^[ACDMRTUXB][0-9]*$/.test(status)) {
      throw new Error(`Unexpected git name-status token '${status}'.`);
    }

    const pathCount = /^[RC]/.test(status) ? 2 : 1;
    if (index + pathCount > fields.length) {
      throw new Error(`Git name-status record '${status}' is missing a path.`);
    }
    const paths = fields.slice(index, index + pathCount).map(normalizeGitPath);
    index += pathCount;
    changes.push({ status, paths });
  }

  return changes;
}

export function parseUntrackedPathsZ(value) {
  return nulFields(value)
    .filter(Boolean)
    .map((filename) => ({ status: 'A', paths: [normalizeGitPath(filename)] }));
}

function pathIsInside(candidate, directory) {
  return candidate === directory || candidate.startsWith(`${directory}/`);
}

function rawPathsForChange(change, rawPath) {
  return change.paths.filter((candidate) => pathIsInside(candidate, rawPath));
}

export function classifyRawChanges(changes, { rawPath = 'raw' } = {}) {
  const normalizedRawPath = normalizeGitPath(rawPath).replace(/^\/+|\/+$/g, '');
  const mutableReadmePath = `${normalizedRawPath}/README.md`;
  const additions = new Set();
  const violations = new Set();

  for (const change of changes) {
    const paths = rawPathsForChange(change, normalizedRawPath);
    if (paths.length === 0) continue;
    const artifactPaths = paths.filter((filename) => filename !== mutableReadmePath);

    if (artifactPaths.length === 0 && ['A', 'M'].includes(change.status)) {
      continue;
    }

    if (change.status === 'A') {
      artifactPaths.forEach((filename) => additions.add(filename));
      continue;
    }

    const pathLabel = change.paths.length === 2
      ? change.paths.join(' -> ')
      : change.paths[0];
    violations.add(`${change.status} ${pathLabel}`);
  }

  return {
    additions: [...additions].sort(),
    violations: [...violations].sort(),
  };
}

export async function collectRawGitChanges({
  projectRoot,
  rawPath = 'raw',
  comparisonBase = '',
  runGit = async (args) => {
    const { stdout } = await execFile('git', args, {
      cwd: projectRoot,
      windowsHide: true,
      maxBuffer: 16 * 1024 * 1024,
    });
    return stdout;
  },
} = {}) {
  if (!projectRoot) throw new Error('projectRoot is required.');
  const requestedBase = String(comparisonBase ?? '').trim();
  if (
    requestedBase
    && !/^0{40,64}$/.test(requestedBase)
    && !/^[A-Za-z0-9][A-Za-z0-9._/@~^+-]*$/.test(requestedBase)
  ) {
    throw new Error('comparisonBase must be a Git object ID or an unambiguous safe ref.');
  }

  const diffCommands = [
    ['diff', '--name-status', '-z', '--', rawPath],
    ['diff', '--cached', '--name-status', '-z', '--', rawPath],
  ];
  const firstComparison = /^0{40,64}$/.test(requestedBase);
  if (requestedBase && !firstComparison) {
    let resolvedBase;
    try {
      resolvedBase = bufferText(await runGit([
        'rev-parse',
        '--verify',
        `${requestedBase}^{commit}`,
      ])).trim();
    } catch (error) {
      throw new Error(`Could not resolve raw comparison base '${requestedBase}': ${error.message}`, { cause: error });
    }
    if (!/^[0-9a-f]{40,64}$/i.test(resolvedBase)) {
      throw new Error(`Git resolved raw comparison base '${requestedBase}' to an invalid object ID.`);
    }
    diffCommands.push(['diff', '--name-status', '-z', resolvedBase, 'HEAD', '--', rawPath]);
  }

  const changes = [];
  for (const args of diffCommands) {
    changes.push(...parseNameStatusZ(await runGit(args)));
  }
  if (firstComparison) {
    changes.push(...parseUntrackedPathsZ(await runGit([
      'ls-files',
      '-z',
      '--',
      rawPath,
    ])));
  }
  changes.push(...parseUntrackedPathsZ(await runGit([
    'ls-files',
    '--others',
    '--exclude-standard',
    '-z',
    '--',
    rawPath,
  ])));
  return changes;
}

function sha256(content) {
  return createHash('sha256').update(content).digest('hex');
}

export async function validateRegisteredAdditions(additions, {
  projectRoot,
  artifactRecords = [],
  readFile = fs.readFile,
} = {}) {
  const problems = [];
  const recordsByPath = new Map();

  for (const record of artifactRecords) {
    const artifactPath = normalizeGitPath(record?.path ?? '');
    if (!artifactPath) continue;
    if (recordsByPath.has(artifactPath)) {
      problems.push(`Raw artifact registry repeats '${artifactPath}'.`);
      continue;
    }
    recordsByPath.set(artifactPath, record);
  }

  for (const artifactPath of additions) {
    const record = recordsByPath.get(artifactPath);
    if (!record) {
      problems.push(`New raw artifact is not registered: ${artifactPath}`);
      continue;
    }

    let content;
    try {
      content = await readFile(path.join(projectRoot, ...artifactPath.split('/')));
    } catch (error) {
      problems.push(`New raw artifact cannot be read: ${artifactPath} (${error.code ?? error.message})`);
      continue;
    }
    const actualHash = sha256(content);
    if (actualHash !== String(record.sha256 ?? '')) {
      problems.push(`New raw artifact hash does not match its registry record: ${artifactPath}`);
    }
  }

  return problems;
}

async function writeFileAtomically(filename, content, { fileSystem = fs } = {}) {
  const temporaryPath = path.join(
    path.dirname(filename),
    `.${path.basename(filename)}.tmp-${process.pid}-${randomUUID()}`,
  );
  try {
    await fileSystem.writeFile(temporaryPath, content, { encoding: 'utf8', flag: 'wx' });
    await fileSystem.rename(temporaryPath, filename);
  } finally {
    await fileSystem.rm(temporaryPath, { force: true }).catch(() => {});
  }
}

async function copyFileAtomically(source, destination, { fileSystem = fs } = {}) {
  const temporaryPath = path.join(
    path.dirname(destination),
    `.${path.basename(destination)}.copy-${process.pid}-${randomUUID()}`,
  );
  let destinationCreated = false;
  try {
    await fileSystem.copyFile(source, temporaryPath, fsConstants.COPYFILE_EXCL);
    await fileSystem.link(temporaryPath, destination);
    destinationCreated = true;
    await fileSystem.rm(temporaryPath, { force: true });
  } catch (error) {
    const cleanupErrors = [];
    if (destinationCreated) {
      try {
        await fileSystem.rm(destination, { force: true });
      } catch (cleanupError) {
        cleanupErrors.push(`could not remove ${destination}: ${cleanupError.message}`);
      }
    }
    try {
      await fileSystem.rm(temporaryPath, { force: true });
    } catch (cleanupError) {
      cleanupErrors.push(`could not remove ${temporaryPath}: ${cleanupError.message}`);
    }
    if (cleanupErrors.length > 0) {
      throw new Error(`${error.message}\nCopy cleanup failed:\n- ${cleanupErrors.join('\n- ')}`, { cause: error });
    }
    throw error;
  }
}

async function acquireRegistryLock(registryPath, { fileSystem = fs } = {}) {
  const lockPath = `${registryPath}.lock`;
  let handle;
  try {
    handle = await fileSystem.open(lockPath, 'wx');
  } catch (error) {
    if (error.code === 'EEXIST') {
      throw new Error(
        `Raw artifact registry is locked by another transaction: ${lockPath}. `
        + 'Wait for it to finish; remove a stale lock only after confirming no source:copy process is running.',
        { cause: error },
      );
    }
    throw error;
  }

  return async () => {
    try {
      await handle.close();
    } finally {
      await fileSystem.rm(lockPath, { force: true });
    }
  };
}

/**
 * Commit new raw files and their registry update as one recoverable operation.
 * Existing destinations are never overwritten. Any later failure restores the
 * original registry and removes only files created by this call.
 */
export async function commitRawArtifactPlan({
  copies = [],
  registryPath,
  registryBefore,
  registryAfter = registryBefore,
  validate = async () => {},
  fileSystem = fs,
} = {}) {
  if (!registryPath) throw new Error('registryPath is required.');

  const createdPaths = [];
  let registryReplaced = false;
  const registryChanged = bufferText(registryAfter) !== bufferText(registryBefore);
  const releaseLock = registryChanged
    ? await acquireRegistryLock(registryPath, { fileSystem })
    : async () => {};

  try {
    if (registryChanged) {
      const currentRegistry = bufferText(await fileSystem.readFile(registryPath));
      if (currentRegistry !== bufferText(registryBefore)) {
        throw new Error('Raw artifact registry changed after the copy plan was prepared; reload and retry.');
      }
    }

    for (const copy of copies) {
      await copyFileAtomically(copy.source, copy.destination, { fileSystem });
      createdPaths.push(copy.destination);
    }

    if (registryChanged) {
      await writeFileAtomically(registryPath, registryAfter, { fileSystem });
      registryReplaced = true;
    }

    await validate();
    return { createdPaths: [...createdPaths], registryReplaced };
  } catch (error) {
    const rollbackErrors = [];
    let registryRestored = !registryReplaced;

    if (registryReplaced) {
      try {
        await writeFileAtomically(registryPath, registryBefore, { fileSystem });
        registryRestored = true;
      } catch (rollbackError) {
        rollbackErrors.push(`registry restore failed: ${rollbackError.message}`);
      }
    }

    if (registryRestored) {
      for (const createdPath of [...createdPaths].reverse()) {
        try {
          await fileSystem.rm(createdPath, { force: true });
        } catch (rollbackError) {
          rollbackErrors.push(`could not remove ${createdPath}: ${rollbackError.message}`);
        }
      }
    } else if (createdPaths.length > 0) {
      rollbackErrors.push(
        `created raw files were preserved because the registry still references them: ${createdPaths.join(', ')}`,
      );
    }

    if (rollbackErrors.length > 0) {
      throw new Error(`${error.message}\nRollback failed:\n- ${rollbackErrors.join('\n- ')}`, { cause: error });
    }
    throw error;
  } finally {
    await releaseLock();
  }
}
