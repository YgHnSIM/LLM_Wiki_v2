import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import {
  classifyRawChanges,
  collectRawGitChanges,
  commitRawArtifactPlan,
  parseNameStatusZ,
  parseUntrackedPathsZ,
  validateRegisteredAdditions,
} from '../lib/raw-integrity.mjs';

function sha256(content) {
  return createHash('sha256').update(content).digest('hex');
}

function runGit(cwd, args) {
  const result = spawnSync('git', args, { cwd, encoding: 'utf8', windowsHide: true });
  assert.equal(result.status, 0, result.stderr || result.stdout);
  return result.stdout.trim();
}

test('NUL-delimited git output preserves Korean, spaces, and rename paths', () => {
  const changes = parseNameStatusZ(Buffer.from([
    'M',
    'raw/006_위드로 호프.md',
    'R100',
    'raw/old name.md',
    'raw/새 이름.md',
    'A',
    'raw/111_new artifact.md',
    'M',
    'raw/README.md',
    'D',
    'raw/README.md',
    '',
  ].join('\0')));
  changes.push(...parseUntrackedPathsZ(Buffer.from('raw/112_새 자료.md\0')));

  assert.deepEqual(changes, [
    { status: 'M', paths: ['raw/006_위드로 호프.md'] },
    { status: 'R100', paths: ['raw/old name.md', 'raw/새 이름.md'] },
    { status: 'A', paths: ['raw/111_new artifact.md'] },
    { status: 'M', paths: ['raw/README.md'] },
    { status: 'D', paths: ['raw/README.md'] },
    { status: 'A', paths: ['raw/112_새 자료.md'] },
  ]);
  assert.deepEqual(classifyRawChanges(changes), {
    additions: ['raw/111_new artifact.md', 'raw/112_새 자료.md'],
    violations: [
      'D raw/README.md',
      'M raw/006_위드로 호프.md',
      'R100 raw/old name.md -> raw/새 이름.md',
    ],
  });
});

test('raw change collection propagates git failures instead of treating them as clean', async () => {
  const failure = Object.assign(new Error('bad revision'), { code: 1 });
  await assert.rejects(
    collectRawGitChanges({
      projectRoot: 'fixture',
      runGit: async () => {
        throw failure;
      },
    }),
    /bad revision/,
  );
  await assert.rejects(
    collectRawGitChanges({
      projectRoot: 'fixture',
      comparisonBase: '--no-index',
      runGit: async () => Buffer.alloc(0),
    }),
    /Git object ID or an unambiguous safe ref/,
  );
});

test('raw change collection reads quoted-path-safe changes from a real repository', async () => {
  const projectRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'llm-wiki-raw-git-'));
  const rawDir = path.join(projectRoot, 'raw');
  const trackedPath = path.join(rawDir, '006_한글 파일.md');
  const addedPath = path.join(rawDir, '111_새 자료.md');

  try {
    await fs.mkdir(rawDir);
    runGit(projectRoot, ['init', '--quiet']);
    runGit(projectRoot, ['config', 'user.email', 'tests@example.com']);
    runGit(projectRoot, ['config', 'user.name', 'Tests']);
    await fs.writeFile(trackedPath, 'original');
    runGit(projectRoot, ['add', '--', 'raw/006_한글 파일.md']);
    runGit(projectRoot, ['commit', '--quiet', '-m', 'fixture']);

    await fs.writeFile(trackedPath, 'modified');
    await fs.writeFile(addedPath, 'new');
    const changes = await collectRawGitChanges({ projectRoot });

    assert.deepEqual(classifyRawChanges(changes), {
      additions: ['raw/111_새 자료.md'],
      violations: ['M raw/006_한글 파일.md'],
    });
  } finally {
    await fs.rm(projectRoot, { recursive: true, force: true });
  }
});

test('comparison-base collection allows additions but reports later mutation', async () => {
  const projectRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'llm-wiki-raw-base-'));
  const rawDir = path.join(projectRoot, 'raw');
  const trackedPath = path.join(rawDir, '006_한글 파일.md');
  const addedPath = path.join(rawDir, '111_새 자료.md');

  try {
    await fs.mkdir(rawDir);
    runGit(projectRoot, ['init', '--quiet']);
    runGit(projectRoot, ['config', 'user.email', 'tests@example.com']);
    runGit(projectRoot, ['config', 'user.name', 'Tests']);
    await fs.writeFile(trackedPath, 'original');
    runGit(projectRoot, ['add', '--', 'raw/006_한글 파일.md']);
    runGit(projectRoot, ['commit', '--quiet', '-m', 'fixture']);
    const comparisonBase = runGit(projectRoot, ['rev-parse', 'HEAD']);
    assert.deepEqual(
      classifyRawChanges(await collectRawGitChanges({
        projectRoot,
        comparisonBase: '0000000000000000000000000000000000000000',
      })),
      { additions: ['raw/006_한글 파일.md'], violations: [] },
    );

    await fs.writeFile(addedPath, 'new');
    runGit(projectRoot, ['add', '--', 'raw/111_새 자료.md']);
    runGit(projectRoot, ['commit', '--quiet', '-m', 'add artifact']);
    assert.deepEqual(
      classifyRawChanges(await collectRawGitChanges({ projectRoot, comparisonBase })),
      { additions: ['raw/111_새 자료.md'], violations: [] },
    );
    assert.deepEqual(
      classifyRawChanges(await collectRawGitChanges({ projectRoot, comparisonBase: 'HEAD~1' })),
      { additions: ['raw/111_새 자료.md'], violations: [] },
    );

    await fs.writeFile(trackedPath, 'mutated');
    runGit(projectRoot, ['add', '--', 'raw/006_한글 파일.md']);
    runGit(projectRoot, ['commit', '--quiet', '-m', 'mutate artifact']);
    assert.deepEqual(
      classifyRawChanges(await collectRawGitChanges({ projectRoot, comparisonBase })),
      {
        additions: ['raw/111_새 자료.md'],
        violations: ['M raw/006_한글 파일.md'],
      },
    );
  } finally {
    await fs.rm(projectRoot, { recursive: true, force: true });
  }
});

test('comparison-base collection compares force-pushed trees directly', async () => {
  const projectRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'llm-wiki-raw-force-push-'));
  const rawDir = path.join(projectRoot, 'raw');
  const artifactPath = path.join(rawDir, '006_artifact.md');

  try {
    runGit(projectRoot, ['init', '--quiet']);
    runGit(projectRoot, ['config', 'user.email', 'tests@example.com']);
    runGit(projectRoot, ['config', 'user.name', 'Tests']);
    await fs.writeFile(path.join(projectRoot, 'seed.txt'), 'seed');
    runGit(projectRoot, ['add', '--', 'seed.txt']);
    runGit(projectRoot, ['commit', '--quiet', '-m', 'seed']);
    const seedCommit = runGit(projectRoot, ['rev-parse', 'HEAD']);

    await fs.mkdir(rawDir);
    await fs.writeFile(artifactPath, 'old artifact');
    runGit(projectRoot, ['add', '--', 'raw/006_artifact.md']);
    runGit(projectRoot, ['commit', '--quiet', '-m', 'old main']);
    const comparisonBase = runGit(projectRoot, ['rev-parse', 'HEAD']);

    runGit(projectRoot, ['checkout', '--quiet', seedCommit]);
    runGit(projectRoot, ['switch', '--quiet', '-c', 'rewritten-main']);
    await fs.mkdir(rawDir);
    await fs.writeFile(artifactPath, 'replacement artifact');
    runGit(projectRoot, ['add', '--', 'raw/006_artifact.md']);
    runGit(projectRoot, ['commit', '--quiet', '-m', 'rewritten main']);

    assert.deepEqual(
      classifyRawChanges(await collectRawGitChanges({ projectRoot, comparisonBase })),
      { additions: [], violations: ['M raw/006_artifact.md'] },
    );
  } finally {
    await fs.rm(projectRoot, { recursive: true, force: true });
  }
});

test('new raw artifacts must be registered with their current hash', async () => {
  const projectRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'llm-wiki-raw-addition-'));
  const artifactPath = 'raw/111_한글 artifact.md';
  const content = Buffer.from('# immutable\n', 'utf8');

  try {
    await fs.mkdir(path.join(projectRoot, 'raw'));
    await fs.writeFile(path.join(projectRoot, ...artifactPath.split('/')), content);

    assert.deepEqual(await validateRegisteredAdditions([artifactPath], {
      projectRoot,
      artifactRecords: [{ path: artifactPath, sha256: sha256(content) }],
    }), []);
    assert.deepEqual(await validateRegisteredAdditions([artifactPath], {
      projectRoot,
      artifactRecords: [{ path: artifactPath, sha256: 'wrong' }],
    }), [`New raw artifact hash does not match its registry record: ${artifactPath}`]);
    assert.deepEqual(await validateRegisteredAdditions([artifactPath], {
      projectRoot,
      artifactRecords: [],
    }), [`New raw artifact is not registered: ${artifactPath}`]);
  } finally {
    await fs.rm(projectRoot, { recursive: true, force: true });
  }
});

test('raw artifact commit writes the pair and registry together', async () => {
  const fixtureRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'llm-wiki-raw-commit-'));
  const sourceDir = path.join(fixtureRoot, 'source');
  const rawDir = path.join(fixtureRoot, 'raw');
  const registryPath = path.join(fixtureRoot, 'raw-artifacts.yml');
  const registryBefore = 'schema_version: 1\nartifacts: []\n';
  const registryAfter = 'schema_version: 1\nartifacts:\n  - path: raw/111_translation.md\n';

  try {
    await fs.mkdir(sourceDir);
    await fs.mkdir(rawDir);
    await fs.writeFile(path.join(sourceDir, 'translation.md'), 'translation');
    await fs.writeFile(path.join(sourceDir, 'commentary.md'), 'commentary');
    await fs.writeFile(registryPath, registryBefore);

    const result = await commitRawArtifactPlan({
      copies: [
        {
          source: path.join(sourceDir, 'translation.md'),
          destination: path.join(rawDir, '111_translation.md'),
        },
        {
          source: path.join(sourceDir, 'commentary.md'),
          destination: path.join(rawDir, '111_commentary.md'),
        },
      ],
      registryPath,
      registryBefore,
      registryAfter,
      validate: async () => {
        assert.equal(await fs.readFile(path.join(rawDir, '111_translation.md'), 'utf8'), 'translation');
        assert.equal(await fs.readFile(path.join(rawDir, '111_commentary.md'), 'utf8'), 'commentary');
        assert.equal(await fs.readFile(registryPath, 'utf8'), registryAfter);
      },
    });

    assert.equal(result.registryReplaced, true);
    assert.equal(result.createdPaths.length, 2);
  } finally {
    await fs.rm(fixtureRoot, { recursive: true, force: true });
  }
});

test('raw artifact commit rolls back partial copies and registry changes', async () => {
  const fixtureRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'llm-wiki-raw-rollback-'));
  const sourceDir = path.join(fixtureRoot, 'source');
  const rawDir = path.join(fixtureRoot, 'raw');
  const registryPath = path.join(fixtureRoot, 'raw-artifacts.yml');
  const registryBefore = 'schema_version: 1\nartifacts: []\n';
  const registryAfter = 'schema_version: 1\nartifacts:\n  - path: raw/111_translation.md\n';
  const firstDestination = path.join(rawDir, '111_translation.md');

  try {
    await fs.mkdir(sourceDir);
    await fs.mkdir(rawDir);
    await fs.writeFile(path.join(sourceDir, 'translation.md'), 'translation');
    await fs.writeFile(registryPath, registryBefore);

    await assert.rejects(
      commitRawArtifactPlan({
        copies: [
          {
            source: path.join(sourceDir, 'translation.md'),
            destination: firstDestination,
          },
          {
            source: path.join(sourceDir, 'missing.md'),
            destination: path.join(rawDir, '111_commentary.md'),
          },
        ],
        registryPath,
        registryBefore,
        registryAfter,
      }),
      /ENOENT/,
    );
    await assert.rejects(fs.access(firstDestination));
    assert.equal(await fs.readFile(registryPath, 'utf8'), registryBefore);

    await assert.rejects(
      commitRawArtifactPlan({
        copies: [{
          source: path.join(sourceDir, 'translation.md'),
          destination: firstDestination,
        }],
        registryPath,
        registryBefore,
        registryAfter,
        validate: async () => {
          throw new Error('post-copy validation failed');
        },
      }),
      /post-copy validation failed/,
    );
    await assert.rejects(fs.access(firstDestination));
    assert.equal(await fs.readFile(registryPath, 'utf8'), registryBefore);
  } finally {
    await fs.rm(fixtureRoot, { recursive: true, force: true });
  }
});

test('raw artifact commit rejects a stale registry plan before copying', async () => {
  const fixtureRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'llm-wiki-raw-stale-'));
  const sourceDir = path.join(fixtureRoot, 'source');
  const rawDir = path.join(fixtureRoot, 'raw');
  const registryPath = path.join(fixtureRoot, 'raw-artifacts.yml');
  const destination = path.join(rawDir, '111_translation.md');
  const registryBefore = 'schema_version: 1\nartifacts: []\n';
  const registryChanged = 'schema_version: 1\nartifacts:\n  - path: raw/other.md\n';
  const registryAfter = 'schema_version: 1\nartifacts:\n  - path: raw/111_translation.md\n';

  try {
    await fs.mkdir(sourceDir);
    await fs.mkdir(rawDir);
    await fs.writeFile(path.join(sourceDir, 'translation.md'), 'translation');
    await fs.writeFile(registryPath, registryChanged);

    await assert.rejects(
      commitRawArtifactPlan({
        copies: [{ source: path.join(sourceDir, 'translation.md'), destination }],
        registryPath,
        registryBefore,
        registryAfter,
      }),
      /registry changed after the copy plan was prepared/,
    );
    await assert.rejects(fs.access(destination));
    await assert.rejects(fs.access(`${registryPath}.lock`));
    assert.equal(await fs.readFile(registryPath, 'utf8'), registryChanged);
  } finally {
    await fs.rm(fixtureRoot, { recursive: true, force: true });
  }
});

test('raw artifact commit preserves referenced files if registry restoration fails', async () => {
  const fixtureRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'llm-wiki-raw-restore-'));
  const sourceDir = path.join(fixtureRoot, 'source');
  const rawDir = path.join(fixtureRoot, 'raw');
  const registryPath = path.join(fixtureRoot, 'raw-artifacts.yml');
  const destination = path.join(rawDir, '111_translation.md');
  const registryBefore = 'schema_version: 1\nartifacts: []\n';
  const registryAfter = 'schema_version: 1\nartifacts:\n  - path: raw/111_translation.md\n';
  let registryRenameCount = 0;

  try {
    await fs.mkdir(sourceDir);
    await fs.mkdir(rawDir);
    await fs.writeFile(path.join(sourceDir, 'translation.md'), 'translation');
    await fs.writeFile(registryPath, registryBefore);

    const fileSystem = {
      copyFile: fs.copyFile.bind(fs),
      link: fs.link.bind(fs),
      open: fs.open.bind(fs),
      readFile: fs.readFile.bind(fs),
      rm: fs.rm.bind(fs),
      writeFile: fs.writeFile.bind(fs),
      rename: async (source, target) => {
        if (target === registryPath) {
          registryRenameCount += 1;
          if (registryRenameCount === 2) {
            throw Object.assign(new Error('simulated restore failure'), { code: 'EACCES' });
          }
        }
        return fs.rename(source, target);
      },
    };

    await assert.rejects(
      commitRawArtifactPlan({
        copies: [{ source: path.join(sourceDir, 'translation.md'), destination }],
        registryPath,
        registryBefore,
        registryAfter,
        fileSystem,
        validate: async () => {
          throw new Error('post-copy validation failed');
        },
      }),
      /created raw files were preserved because the registry still references them/,
    );
    assert.equal(await fs.readFile(destination, 'utf8'), 'translation');
    assert.equal(await fs.readFile(registryPath, 'utf8'), registryAfter);
    await assert.rejects(fs.access(`${registryPath}.lock`));
  } finally {
    await fs.rm(fixtureRoot, { recursive: true, force: true });
  }
});
