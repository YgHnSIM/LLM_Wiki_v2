import { constants as fsConstants, promises as fs } from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import yaml from 'js-yaml';
import matter from 'gray-matter';
import { metaDir, rawDir, rootDir, wikiDir } from './lib/project-paths.mjs';
import {
  createArtifactRecords,
  derivePairFilenames,
  formatArtifactRecords,
  normalizeSourceSelection,
  requireSourceUrl,
  sha256,
  sourceUrlFromMarkdown,
  validateArtifactRecord,
  validateTranslationPair,
} from './lib/source-workflow.mjs';
import {
  duplicateArtifactPaths,
  missingExpectedArtifactPaths,
  unexpectedArtifactPaths,
  verificationEnvironmentForSource,
} from './lib/wiki-lint.mjs';

const sourceDir = process.env.LLM_SOURCE_DIR || 'C:\\Vault\\ObsidianVault\\Assets\\LLM_sources';
const translationDir = process.env.LLM_TRANSLATION_DIR || 'C:\\Vault\\ObsidianVault\\LLM_ko';
const registryPath = path.join(metaDir, 'raw-artifacts.yml');

function fail(message) {
  throw new Error(message);
}

async function exists(absolutePath) {
  try {
    await fs.access(absolutePath);
    return true;
  } catch {
    return false;
  }
}

async function readSourceInventory(prefix) {
  const entries = await fs.readdir(sourceDir, { withFileTypes: true });
  const pattern = new RegExp(`^${prefix}[_-].*\\.md$`, 'i');
  const matches = entries.filter((entry) => entry.isFile() && pattern.test(entry.name)).map((entry) => entry.name);
  if (matches.length === 0) fail(`No source Markdown file starts with ${prefix}_ or ${prefix}- in ${sourceDir}.`);
  if (matches.length > 1) fail(`Source prefix ${prefix} is ambiguous: ${matches.join(', ')}`);
  return matches[0];
}

async function loadContext(selection, { requireOriginalUrl = false } = {}) {
  const prefix = normalizeSourceSelection(selection);
  const sourceFilename = await readSourceInventory(prefix);
  const filenames = derivePairFilenames(sourceFilename);
  const sourcePath = path.join(sourceDir, sourceFilename);
  const detectedSourceUrl = sourceUrlFromMarkdown(await fs.readFile(sourcePath, 'utf8'));
  const sourceUrl = requireOriginalUrl
    ? requireSourceUrl(detectedSourceUrl, `Source Markdown ${sourceFilename}`)
    : detectedSourceUrl;
  return {
    prefix,
    sourceFilename,
    sourcePath,
    sourceUrl,
    translationFilename: filenames.translation,
    commentaryFilename: filenames.commentary,
    translationPath: path.join(translationDir, filenames.translation),
    commentaryPath: path.join(translationDir, filenames.commentary),
    rawTranslationPath: path.join(rawDir, filenames.translation),
    rawCommentaryPath: path.join(rawDir, filenames.commentary),
  };
}

async function loadRegistry() {
  const raw = await fs.readFile(registryPath, 'utf8');
  const parsed = yaml.safeLoad(raw);
  if (!parsed || parsed.schema_version !== 1 || !Array.isArray(parsed.artifacts)) {
    fail('wiki/meta/raw-artifacts.yml does not match the expected registry structure.');
  }
  return { raw, parsed };
}

async function loadPair(context) {
  if (!(await exists(context.translationPath)) || !(await exists(context.commentaryPath))) {
    fail(`Translation pair is incomplete in ${translationDir}. Run /lt ${context.prefix} first.`);
  }
  const [translation, commentary] = await Promise.all([
    fs.readFile(context.translationPath),
    fs.readFile(context.commentaryPath),
  ]);
  try {
    matter(translation.toString('utf8'));
    matter(commentary.toString('utf8'));
  } catch (error) {
    fail(`Translation pair has invalid YAML frontmatter: ${error.message}`);
  }
  const pairErrors = validateTranslationPair({
    translation: translation.toString('utf8'),
    commentary: commentary.toString('utf8'),
  });
  if (pairErrors.length) fail(`Translation pair validation failed:\n- ${pairErrors.join('\n- ')}`);
  return { translation, commentary };
}

function expectedRecords(context, pair) {
  return createArtifactRecords({
    prefix: context.prefix,
    translationFilename: context.translationFilename,
    commentaryFilename: context.commentaryFilename,
    translationHash: sha256(pair.translation),
    commentaryHash: sha256(pair.commentary),
    sourceUrl: context.sourceUrl,
  });
}

async function findPublicSourcePage(prefix) {
  const sourcePagesDir = path.join(wikiDir, 'sources');
  const filenames = (await fs.readdir(sourcePagesDir)).filter((name) => name.endsWith('.md'));
  for (const filename of filenames) {
    const content = await fs.readFile(path.join(sourcePagesDir, filename), 'utf8');
    const parsed = matter(content);
    if (String(parsed.data.id) === `source.${prefix}`) return path.join(sourcePagesDir, filename);
  }
  return null;
}

async function inspect(context, { requireRaw = false, requirePage = false } = {}) {
  const pair = await loadPair(context);
  const records = expectedRecords(context, pair);
  const { parsed } = await loadRegistry();
  const rawPaths = [context.rawTranslationPath, context.rawCommentaryPath];
  const problems = [];

  for (let index = 0; index < records.length; index += 1) {
    const expected = records[index];
    const rawPath = rawPaths[index];
    const rawExists = await exists(rawPath);
    const registered = parsed.artifacts.find((record) => record.path === expected.path);

    if (requireRaw && !rawExists) problems.push(`${expected.path} is missing.`);
    if (rawExists) {
      const actualHash = sha256(await fs.readFile(rawPath));
      if (actualHash !== expected.sha256) problems.push(`${expected.path} differs from the validated translation output.`);
    }
    if (requireRaw && !registered) problems.push(`${expected.path} is not registered in raw-artifacts.yml.`);
    if (registered) {
      const mismatched = validateArtifactRecord(registered, expected);
      if (mismatched.length) problems.push(`${expected.path} registry fields differ: ${mismatched.join(', ')}.`);
    }
  }

  const publicSourcePage = await findPublicSourcePage(context.prefix);
  if (requirePage && !publicSourcePage) problems.push(`No wiki source page has id source.${context.prefix}.`);
  if (requirePage && publicSourcePage) {
    const publicPage = matter(await fs.readFile(publicSourcePage, 'utf8'));
    const pageArtifacts = Array.isArray(publicPage.data.artifacts) ? publicPage.data.artifacts.map(String) : [];
    const expectedPageArtifacts = records.map((record) => record.path);
    const missingPageArtifacts = missingExpectedArtifactPaths(pageArtifacts, expectedPageArtifacts);
    for (const artifactPath of missingPageArtifacts) {
      problems.push(`Public source page source.${context.prefix} frontmatter is missing expected artifact '${artifactPath}'.`);
    }
    for (const artifactPath of unexpectedArtifactPaths(pageArtifacts, expectedPageArtifacts)) {
      problems.push(`Public source page source.${context.prefix} frontmatter has unexpected artifact '${artifactPath}'; expected exactly the translation/commentary pair.`);
    }
    for (const artifactPath of duplicateArtifactPaths(pageArtifacts)) {
      problems.push(`Public source page source.${context.prefix} frontmatter repeats artifact '${artifactPath}'.`);
    }
  }
  return { pair, records, publicSourcePage, problems };
}

async function copyRaw(context) {
  const inspection = await inspect(context);
  if (inspection.problems.length) fail(inspection.problems.join('\n'));

  const { raw: registryRaw, parsed } = await loadRegistry();
  const sources = [context.translationPath, context.commentaryPath];
  const destinations = [context.rawTranslationPath, context.rawCommentaryPath];
  const missingRecords = [];

  for (let index = 0; index < inspection.records.length; index += 1) {
    const expected = inspection.records[index];
    const destination = destinations[index];
    const registered = parsed.artifacts.find((record) => record.path === expected.path);
    const destinationExists = await exists(destination);

    if (registered && !destinationExists) {
      fail(`${expected.path} is registered but missing. Restore the immutable artifact from Git instead of recreating it.`);
    }
    if (destinationExists) {
      const actualHash = sha256(await fs.readFile(destination));
      if (actualHash !== expected.sha256) fail(`Refusing to overwrite immutable artifact ${expected.path}.`);
    }
    if (!registered) missingRecords.push(expected);
  }

  for (let index = 0; index < destinations.length; index += 1) {
    if (!(await exists(destinations[index]))) {
      await fs.copyFile(sources[index], destinations[index], fsConstants.COPYFILE_EXCL);
    }
  }

  if (missingRecords.length) {
    const separator = registryRaw.endsWith('\n') ? '' : '\n';
    await fs.appendFile(registryPath, `${separator}${formatArtifactRecords(missingRecords)}\n`, 'utf8');
  }

  const verified = await inspect(context, { requireRaw: true });
  if (verified.problems.length) fail(`Post-copy validation failed:\n${verified.problems.join('\n')}`);

  console.log(`Raw pair verified and registered for source ${context.prefix}:`);
  for (const record of verified.records) console.log(`- ${record.path} (${record.sha256})`);
  console.log('Git commit/push: not run. Continue with public wiki source processing.');
}

function run(command, args, options = {}) {
  const defaults = { cwd: rootDir };
  if (!options.stdio) defaults.encoding = 'utf8';
  const result = spawnSync(command, args, { ...defaults, ...options });
  if (result.error) throw result.error;
  return result;
}

async function ready(context) {
  const inspection = await inspect(context, { requireRaw: true, requirePage: true });
  if (inspection.problems.length) fail(inspection.problems.join('\n'));

  const branch = run('git', ['branch', '--show-current']).stdout.trim();
  if (branch !== 'main') fail(`Source finalization is allowed only on main; current branch is ${branch || '(detached)'}.`);

  const verificationEnvironment = verificationEnvironmentForSource(context.prefix, process.env);
  const verification = process.env.npm_execpath
    ? run(process.execPath, [process.env.npm_execpath, 'run', 'verify'], { stdio: 'inherit', env: verificationEnvironment })
    : run('npm', ['run', 'verify'], { stdio: 'inherit', env: verificationEnvironment, shell: process.platform === 'win32' });
  if (verification.status !== 0) process.exit(verification.status || 1);

  console.log(`Source ${context.prefix} is ready for reviewed staging on main.`);
  console.log(`Suggested commit prefix: ingest: ${context.prefix}_short_title`);
  console.log('This command did not stage, commit, or push anything.');
}

async function status(context) {
  const translationExists = await exists(context.translationPath);
  const commentaryExists = await exists(context.commentaryPath);
  const rawTranslationExists = await exists(context.rawTranslationPath);
  const rawCommentaryExists = await exists(context.rawCommentaryPath);
  const publicSourcePage = await findPublicSourcePage(context.prefix);

  console.log(`Source ${context.prefix}: ${context.sourceFilename}`);
  console.log(`- translation: ${translationExists ? 'ready' : 'missing'} (${context.translationPath})`);
  console.log(`- commentary: ${commentaryExists ? 'ready' : 'missing'} (${context.commentaryPath})`);
  console.log(`- raw translation: ${rawTranslationExists ? 'present' : 'missing'}`);
  console.log(`- raw commentary: ${rawCommentaryExists ? 'present' : 'missing'}`);
  console.log(`- public source page: ${publicSourcePage ? path.relative(rootDir, publicSourcePage) : 'missing'}`);
  console.log(`- source_url: ${context.sourceUrl || 'missing (source:copy and source:ready will fail)'}`);

  if (translationExists && commentaryExists) {
    if (!context.sourceUrl) {
      console.log('- validation problems:');
      console.log('  - Source Markdown must provide source_url as an absolute HTTP(S) URL on a Source: or 출처: line.');
      return;
    }
    const inspection = await inspect(context);
    if (inspection.problems.length) {
      console.log('- validation problems:');
      for (const problem of inspection.problems) console.log(`  - ${problem}`);
    } else {
      console.log('- translation pair and any existing raw/registry records are consistent');
    }
  }
}

function printHelp() {
  console.log(`Usage:
  npm run source:status -- NNN
  npm run source:copy -- NNN
  npm run source:ready -- NNN

Commands:
  status  Read-only view of translation, raw, and public-wiki state.
  copy    Validate the Korean pair, copy it into raw/, and append SHA-256 records. Never runs Git.
  ready   Require raw registration and source.NNN, then run npm verify on main. Never runs Git writes.`);
}

const [command, selection] = process.argv.slice(2);
if (!command || !selection || !['status', 'copy', 'ready'].includes(command)) {
  printHelp();
  process.exitCode = 1;
} else {
  try {
    const context = await loadContext(selection, { requireOriginalUrl: command !== 'status' });
    if (command === 'status') await status(context);
    if (command === 'copy') await copyRaw(context);
    if (command === 'ready') await ready(context);
  } catch (error) {
    console.error(`Source workflow failed: ${error.message}`);
    process.exitCode = 1;
  }
}
