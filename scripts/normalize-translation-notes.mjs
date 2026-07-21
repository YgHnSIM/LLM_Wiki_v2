import { constants as fsConstants, promises as fs } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { TextDecoder } from 'node:util';
import { fileURLToPath } from 'node:url';
import yaml from 'js-yaml';
import { officialSourcePrefix } from './lib/source-numbering.mjs';

const scriptPath = fileURLToPath(import.meta.url);
const projectRoot = path.resolve(path.dirname(scriptPath), '..');

export const DEFAULT_TRANSLATION_DIR = 'C:\\Vault\\ObsidianVault\\LLM_ko';
export const DEFAULT_REGISTRY_PATH = path.join(projectRoot, 'wiki', 'meta', 'raw-artifacts.yml');
export const CANONICAL_SOURCE_LABEL = '원본 출처';

const sourceMarkerPattern = /^\s*(Source|출처|원문 출처|원본 출처):\s*(.*?)\s*$/;
const translationRoles = new Set(['translation', 'translated-essay']);

export class TranslationNormalizationError extends Error {
  constructor(errors) {
    const messages = Array.isArray(errors) ? errors : [String(errors)];
    super(`Translation normalization refused:\n- ${messages.join('\n- ')}`);
    this.name = 'TranslationNormalizationError';
    this.errors = messages;
  }
}

function isAbsoluteHttpUrl(value) {
  try {
    const parsed = new URL(value);
    return (parsed.protocol === 'http:' || parsed.protocol === 'https:') && parsed.href === value;
  } catch {
    return false;
  }
}

export function isTranslationFilename(filename) {
  if (/\.commentary(?:\.ko)?\.md$/i.test(filename)) return false;
  if (/\.ko\.md$/i.test(filename)) return true;
  return /^00[1-5][_-].*\.md$/i.test(filename);
}

function sourcePrefixFromFilename(filename) {
  return filename.match(/^(\d{3})(?:[_-])/)?.[1] ?? '';
}

function decodeTranslation(buffer, filename) {
  const errors = [];
  if (buffer.length >= 3 && buffer[0] === 0xef && buffer[1] === 0xbb && buffer[2] === 0xbf) {
    errors.push(`${filename}: UTF-8 BOM is not allowed.`);
  }

  let text = '';
  try {
    text = new TextDecoder('utf-8', { fatal: true }).decode(buffer);
  } catch {
    errors.push(`${filename}: file is not valid UTF-8.`);
  }
  if (text.includes('\r')) errors.push(`${filename}: CR or CRLF line endings are not allowed; use LF.`);
  if (text && !text.endsWith('\n')) errors.push(`${filename}: file must end with a trailing LF newline.`);
  return { text, errors };
}

function frontmatterEnd(lines) {
  if (lines[0] !== '---') return 0;
  const closing = lines.indexOf('---', 1);
  return closing === -1 ? 0 : closing + 1;
}

function firstMarkdownHeading(lines) {
  let inFence = false;
  for (let index = frontmatterEnd(lines); index < lines.length; index += 1) {
    if (/^\s*(```|~~~)/.test(lines[index])) {
      inFence = !inFence;
      continue;
    }
    if (!inFence && /^#{1,6}\s+\S/.test(lines[index])) return index;
  }
  return -1;
}

function isReadingUiInstruction(line) {
  return line.includes('용어')
    && line.includes('밑줄')
    && line.includes('정의')
    && line.includes('마우스')
    && /(툴팁|도구\s*설명|도움말)/.test(line);
}

function findReadingBlocks(lines, filename) {
  const blocks = [];
  const errors = [];
  for (let index = 0; index < lines.length; index += 1) {
    if (lines[index].trim() !== '읽기 수준') continue;
    const valid = lines[index + 1]?.trim() === ''
      && typeof lines[index + 2] === 'string'
      && isReadingUiInstruction(lines[index + 2])
      && lines[index + 3]?.trim() === '';
    if (!valid) {
      errors.push(`${filename}:${index + 1}: unrecognized '읽기 수준' block; no content was removed.`);
      continue;
    }
    blocks.push({ start: index, end: index + 3 });
    index += 3;
  }
  return { blocks, errors };
}

function findSourceMarkers(lines) {
  return lines.flatMap((line, index) => {
    const match = line.match(sourceMarkerPattern);
    return match ? [{ index, label: match[1], value: match[2] }] : [];
  });
}

function registryRecordsByPrefix(registryText) {
  let registry;
  try {
    registry = yaml.safeLoad(registryText) ?? {};
  } catch (error) {
    throw new TranslationNormalizationError(`raw artifact registry is invalid YAML: ${error.message}`);
  }
  if (!Array.isArray(registry.artifacts)) {
    throw new TranslationNormalizationError('raw artifact registry must contain an artifacts array.');
  }

  const records = new Map();
  for (const artifact of registry.artifacts) {
    if (!translationRoles.has(String(artifact?.role ?? ''))) continue;
    const prefix = String(artifact?.order_prefix ?? '').trim();
    try {
      officialSourcePrefix(prefix);
    } catch (error) {
      throw new TranslationNormalizationError(`translation registry record '${artifact?.path ?? ''}': ${error.message}`);
    }
    const existing = records.get(prefix) ?? [];
    existing.push(artifact);
    records.set(prefix, existing);
  }
  return records;
}

function registrySourceForNote(records, prefix, filename) {
  const candidates = records.get(prefix) ?? [];
  if (candidates.length !== 1) {
    return {
      error: `${filename}: expected exactly one translation registry record for ${prefix}, found ${candidates.length}.`,
    };
  }
  const sourceUrl = String(candidates[0].source_url ?? '').trim();
  if (!isAbsoluteHttpUrl(sourceUrl)) {
    return { error: `${filename}: registry translation record has no valid absolute HTTP(S) source_url.` };
  }
  return { sourceUrl };
}

function insertSourceAfterHeading(lines, headingIndex, canonicalLine) {
  let bodyStart = headingIndex + 1;
  while (bodyStart < lines.length && lines[bodyStart].trim() === '') bodyStart += 1;
  return [
    ...lines.slice(0, headingIndex + 1),
    '',
    canonicalLine,
    '',
    ...lines.slice(bodyStart),
  ];
}

function planTextNormalization({ text, filename, sourceUrl }) {
  const errors = [];
  let lines = text.split('\n');
  const headingIndex = firstMarkdownHeading(lines);
  if (headingIndex === -1) errors.push(`${filename}: no Markdown heading was found.`);

  const sourceMarkers = findSourceMarkers(lines);
  if (sourceMarkers.length > 1) {
    errors.push(`${filename}: duplicate source markers found (${sourceMarkers.length}).`);
  }

  let sourceStatus = 'missing';
  if (sourceMarkers.length === 1) {
    const marker = sourceMarkers[0];
    if (!isAbsoluteHttpUrl(marker.value)) {
      errors.push(`${filename}:${marker.index + 1}: source marker has no valid absolute HTTP(S) URL.`);
    } else if (marker.value !== sourceUrl) {
      errors.push(`${filename}:${marker.index + 1}: source URL does not match registry (${marker.value} != ${sourceUrl}).`);
    }
    sourceStatus = marker.label === CANONICAL_SOURCE_LABEL ? 'canonical' : 'noncanonical';
  }

  const reading = findReadingBlocks(lines, filename);
  errors.push(...reading.errors);
  if (errors.length > 0) return { errors, sourceStatus, readingBlocks: reading.blocks.length };

  const canonicalLine = `${CANONICAL_SOURCE_LABEL}: ${sourceUrl}`;
  if (sourceMarkers.length === 1) {
    lines[sourceMarkers[0].index] = canonicalLine;
  } else {
    lines = insertSourceAfterHeading(lines, headingIndex, canonicalLine);
  }

  const removable = findReadingBlocks(lines, filename);
  for (const block of [...removable.blocks].reverse()) {
    lines.splice(block.start, block.end - block.start + 1);
  }

  let output = lines.join('\n');
  if (!output.endsWith('\n')) output += '\n';
  return {
    errors: [],
    output,
    sourceStatus,
    readingBlocks: reading.blocks.length,
  };
}

async function pathExists(targetPath) {
  try {
    await fs.access(targetPath, fsConstants.F_OK);
    return true;
  } catch (error) {
    if (error.code === 'ENOENT') return false;
    throw error;
  }
}

export async function planTranslationNormalization({
  translationDir = process.env.LLM_TRANSLATION_DIR || DEFAULT_TRANSLATION_DIR,
  registryPath = process.env.LLM_RAW_ARTIFACTS_REGISTRY || DEFAULT_REGISTRY_PATH,
  expectedCount,
} = {}) {
  const entries = await fs.readdir(translationDir, { withFileTypes: true });
  const filenames = entries
    .filter((entry) => entry.isFile() && isTranslationFilename(entry.name))
    .map((entry) => entry.name)
    .sort((left, right) => left.localeCompare(right, 'en'));

  const errors = [];
  if (expectedCount !== undefined && filenames.length !== expectedCount) {
    errors.push(`expected ${expectedCount} translation notes, found ${filenames.length} in ${translationDir}.`);
  }

  const prefixes = new Map();
  for (const filename of filenames) {
    const prefix = sourcePrefixFromFilename(filename);
    if (!prefix) {
      errors.push(`${filename}: filename has no three-digit source prefix.`);
      continue;
    }
    try {
      officialSourcePrefix(prefix);
    } catch (error) {
      errors.push(`${filename}: ${error.message}`);
      continue;
    }
    const prior = prefixes.get(prefix);
    if (prior) errors.push(`${filename}: source prefix ${prefix} is already used by ${prior}.`);
    prefixes.set(prefix, filename);
  }

  const registryText = await fs.readFile(registryPath, 'utf8');
  const records = registryRecordsByPrefix(registryText);
  const notePrefixes = new Set(prefixes.keys());
  const registryPrefixes = new Set(records.keys());
  const registryOnlyPrefixes = [...registryPrefixes].filter((prefix) => !notePrefixes.has(prefix)).sort();
  const extraPrefixes = [...notePrefixes].filter((prefix) => !registryPrefixes.has(prefix)).sort();
  if (extraPrefixes.length > 0) {
    errors.push(`translation notes contain prefixes absent from the registry: ${extraPrefixes.join(', ')}.`);
  }
  const notes = [];

  for (const filename of filenames) {
    const notePath = path.join(translationDir, filename);
    const original = await fs.readFile(notePath);
    const decoded = decodeTranslation(original, filename);
    errors.push(...decoded.errors);

    const prefix = sourcePrefixFromFilename(filename);
    const registrySource = registrySourceForNote(records, prefix, filename);
    if (registrySource.error) {
      errors.push(registrySource.error);
      continue;
    }
    if (decoded.errors.length > 0) continue;

    const planned = planTextNormalization({
      text: decoded.text,
      filename,
      sourceUrl: registrySource.sourceUrl,
    });
    errors.push(...planned.errors);
    notes.push({
      filename,
      path: notePath,
      prefix,
      sourceUrl: registrySource.sourceUrl,
      original,
      originalText: decoded.text,
      output: planned.output,
      changed: planned.output !== decoded.text,
      sourceStatus: planned.sourceStatus,
      readingBlocks: planned.readingBlocks,
    });
  }

  if (errors.length > 0) throw new TranslationNormalizationError(errors);

  const report = {
    translationDir,
    registryPath,
    expectedCount,
    registryPrefixCount: registryPrefixes.size,
    registryOnlyPrefixes,
    totalFiles: notes.length,
    changedFiles: notes.filter((note) => note.changed).length,
    readingBlocks: notes.reduce((total, note) => total + note.readingBlocks, 0),
    sourceMarkers: {
      canonical: notes.filter((note) => note.sourceStatus === 'canonical').length,
      noncanonical: notes.filter((note) => note.sourceStatus === 'noncanonical').length,
      missing: notes.filter((note) => note.sourceStatus === 'missing').length,
    },
    pendingFiles: notes.filter((note) => note.changed).map((note) => note.filename),
  };
  return { notes, report };
}

async function validateBackupTargets(backupDir, notes) {
  const resolvedBackup = path.resolve(backupDir);
  const resolvedTranslation = path.resolve(path.dirname(notes[0]?.path ?? ''));
  if (resolvedBackup === resolvedTranslation) {
    throw new TranslationNormalizationError('backup directory must differ from the translation directory.');
  }

  if (await pathExists(resolvedBackup)) {
    const stat = await fs.stat(resolvedBackup);
    if (!stat.isDirectory()) throw new TranslationNormalizationError(`backup path is not a directory: ${resolvedBackup}`);
  }

  const collisions = [];
  for (const note of notes) {
    const destination = path.join(resolvedBackup, note.filename);
    if (await pathExists(destination)) collisions.push(destination);
  }
  if (collisions.length > 0) {
    throw new TranslationNormalizationError(collisions.map((item) => `backup file already exists: ${item}`));
  }
  return resolvedBackup;
}

async function verifyNormalizedState(options) {
  const verified = await planTranslationNormalization(options);
  const errors = [];
  if (verified.report.changedFiles !== 0) errors.push(`${verified.report.changedFiles} files still require normalization.`);
  if (verified.report.readingBlocks !== 0) errors.push(`${verified.report.readingBlocks} reading-level blocks remain.`);
  if (verified.report.sourceMarkers.canonical !== verified.report.totalFiles) {
    errors.push('not every translation has exactly one canonical source marker.');
  }
  if (verified.report.sourceMarkers.noncanonical !== 0 || verified.report.sourceMarkers.missing !== 0) {
    errors.push('noncanonical or missing source markers remain.');
  }
  if (errors.length > 0) throw new TranslationNormalizationError(errors);
  return verified.report;
}

export async function writeTranslationNormalization({ backupDir, ...options } = {}) {
  if (!backupDir) {
    throw new TranslationNormalizationError('--backup-dir is required with --write.');
  }
  const planned = await planTranslationNormalization(options);
  if (planned.report.changedFiles === 0) {
    return { ...planned.report, backupDir: null, writtenFiles: 0 };
  }

  const resolvedBackup = await validateBackupTargets(backupDir, planned.notes);
  await fs.mkdir(resolvedBackup, { recursive: true });
  for (const note of planned.notes) {
    await fs.copyFile(note.path, path.join(resolvedBackup, note.filename), fsConstants.COPYFILE_EXCL);
  }

  try {
    for (const note of planned.notes.filter((item) => item.changed)) {
      await fs.writeFile(note.path, note.output, { encoding: 'utf8' });
    }
    await verifyNormalizedState(options);
  } catch (error) {
    for (const note of planned.notes) {
      await fs.copyFile(path.join(resolvedBackup, note.filename), note.path);
    }
    throw new TranslationNormalizationError(`write verification failed and originals were restored: ${error.message}`);
  }

  return {
    ...planned.report,
    backupDir: resolvedBackup,
    writtenFiles: planned.report.changedFiles,
  };
}

function parsePositiveInteger(value, optionName) {
  if (!/^\d+$/.test(String(value)) || Number(value) < 1) {
    throw new TranslationNormalizationError(`${optionName} must be a positive integer.`);
  }
  return Number(value);
}

export function parseArguments(argv, env = process.env) {
  const options = {
    translationDir: env.LLM_TRANSLATION_DIR || DEFAULT_TRANSLATION_DIR,
    registryPath: env.LLM_RAW_ARTIFACTS_REGISTRY || DEFAULT_REGISTRY_PATH,
    expectedCount: env.LLM_TRANSLATION_EXPECTED_COUNT
      ? parsePositiveInteger(env.LLM_TRANSLATION_EXPECTED_COUNT, 'expected count')
      : undefined,
    backupDir: '',
    mode: '',
  };

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === '--check' || argument === '--write') {
      if (options.mode) throw new TranslationNormalizationError('choose exactly one of --check or --write.');
      options.mode = argument.slice(2);
      continue;
    }
    const optionNames = new Set(['--translation-dir', '--registry', '--backup-dir', '--expected-count']);
    if (!optionNames.has(argument)) throw new TranslationNormalizationError(`unknown argument: ${argument}`);
    const value = argv[index + 1];
    if (!value || value.startsWith('--')) throw new TranslationNormalizationError(`${argument} requires a value.`);
    index += 1;
    if (argument === '--translation-dir') options.translationDir = value;
    if (argument === '--registry') options.registryPath = value;
    if (argument === '--backup-dir') options.backupDir = value;
    if (argument === '--expected-count') options.expectedCount = parsePositiveInteger(value, argument);
  }

  if (!options.mode) throw new TranslationNormalizationError('choose exactly one of --check or --write.');
  if (options.mode === 'write' && !options.backupDir) {
    throw new TranslationNormalizationError('--backup-dir is required with --write.');
  }
  return options;
}

function printReport(report, mode) {
  console.log(`Translation notes: ${report.totalFiles}`);
  console.log(`Registry translation prefixes: ${report.registryPrefixCount}`);
  console.log(`Registry-only prefixes: ${report.registryOnlyPrefixes.length > 0 ? report.registryOnlyPrefixes.join(', ') : 'none'}`);
  console.log(`Pending files: ${report.changedFiles}`);
  console.log(`Reading-level blocks: ${report.readingBlocks}`);
  console.log(`Source markers: canonical=${report.sourceMarkers.canonical}, noncanonical=${report.sourceMarkers.noncanonical}, missing=${report.sourceMarkers.missing}`);
  if (mode === 'write') {
    console.log(`Written files: ${report.writtenFiles}`);
    if (report.backupDir) console.log(`Backup directory: ${report.backupDir}`);
  }
  if (report.pendingFiles.length > 0) {
    console.log('Files requiring normalization:');
    for (const filename of report.pendingFiles) console.log(`- ${filename}`);
  }
}

async function main() {
  try {
    const options = parseArguments(process.argv.slice(2));
    if (options.mode === 'write') {
      const report = await writeTranslationNormalization(options);
      printReport(report, options.mode);
      console.log('Status: normalized and verified');
      return;
    }

    const { report } = await planTranslationNormalization(options);
    printReport(report, options.mode);
    if (report.changedFiles > 0) {
      console.log('Status: pending normalization');
      process.exitCode = 2;
    } else {
      console.log('Status: clean');
    }
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}

if (path.resolve(process.argv[1] ?? '').toLowerCase() === path.resolve(scriptPath).toLowerCase()) {
  await main();
}
