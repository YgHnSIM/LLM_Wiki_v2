import { constants as fsConstants, promises as fs } from 'node:fs';
import crypto from 'node:crypto';
import path from 'node:path';
import process from 'node:process';
import { TextDecoder } from 'node:util';
import { fileURLToPath } from 'node:url';
import yaml from 'js-yaml';

const scriptPath = fileURLToPath(import.meta.url);
const projectRoot = path.resolve(path.dirname(scriptPath), '..');

export const DEFAULT_PATHS = Object.freeze({
  sourceDir: 'C:\\Vault\\ObsidianVault\\Assets\\LLM_sources',
  translationDir: 'C:\\Vault\\ObsidianVault\\LLM_ko',
  rawDir: path.join(projectRoot, 'raw'),
  wikiDir: path.join(projectRoot, 'wiki'),
  registryPath: path.join(projectRoot, 'wiki', 'meta', 'raw-artifacts.yml'),
});

export const PRODUCTION_COUNTS = Object.freeze({
  sourceFiles: 109,
  translationFiles: 202,
  rawFiles: 207,
  sourceBlocks: 98,
  rawBlocks: 51,
});

export const ENGLISH_READING_INSTRUCTION = 'Choose your expertise level to adjust how many terms are explained. Beginners see more tooltips, experts see fewer to maintain reading flow. Hover over underlined terms for instant definitions.';

export class ReadingLevelCleanupError extends Error {
  constructor(errors) {
    const items = Array.isArray(errors) ? errors.map(String) : [String(errors)];
    super(`Reading-level cleanup refused:\n- ${items.join('\n- ')}`);
    this.name = 'ReadingLevelCleanupError';
    this.errors = items;
  }
}

function sha256(buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

function decodeUtf8(buffer, label) {
  const errors = [];
  if (buffer.length >= 3 && buffer[0] === 0xef && buffer[1] === 0xbb && buffer[2] === 0xbf) {
    errors.push(`${label}: UTF-8 BOM is not allowed.`);
  }
  let text = '';
  try {
    text = new TextDecoder('utf-8', { fatal: true }).decode(buffer);
  } catch {
    errors.push(`${label}: file is not valid UTF-8.`);
  }
  if (errors.length > 0) throw new ReadingLevelCleanupError(errors);
  return text;
}

function splitLines(text) {
  const lines = [];
  let start = 0;
  let index = 0;
  while (index < text.length) {
    if (text[index] !== '\r' && text[index] !== '\n') {
      index += 1;
      continue;
    }
    const contentEnd = index;
    let ending = text[index];
    index += 1;
    if (ending === '\r' && text[index] === '\n') {
      ending = '\r\n';
      index += 1;
    }
    lines.push({ content: text.slice(start, contentEnd), ending, start, end: index });
    start = index;
  }
  if (start < text.length || text.length === 0) {
    lines.push({ content: text.slice(start), ending: '', start, end: text.length });
  }
  return lines;
}

function newlineStyle(text) {
  const crlf = (text.match(/\r\n/g) ?? []).length;
  const bareLf = (text.match(/(?<!\r)\n/g) ?? []).length;
  const bareCr = (text.match(/\r(?!\n)/g) ?? []).length;
  const kinds = [crlf > 0 && 'CRLF', bareLf > 0 && 'LF', bareCr > 0 && 'CR'].filter(Boolean);
  return kinds.length === 0 ? 'none' : kinds.length === 1 ? kinds[0] : `mixed:${kinds.join('+')}`;
}

function fenceState(lines) {
  const inside = [];
  let fence = null;
  for (const line of lines) {
    if (fence) {
      inside.push(true);
      const closing = line.content.match(/^ {0,3}(`+|~+)[\t ]*$/);
      if (closing && closing[1][0] === fence.character && closing[1].length >= fence.length) fence = null;
      continue;
    }
    inside.push(false);
    const opening = line.content.match(/^ {0,3}(`{3,}|~{3,})(.*)$/);
    if (!opening) continue;
    if (opening[1][0] === '`' && opening[2].includes('`')) continue;
    fence = { character: opening[1][0], length: opening[1].length };
  }
  return inside;
}

export function isKoreanReadingInstruction(value) {
  const line = String(value).trim();
  return line.includes('용어')
    && /(툴팁|도구\s*설명|도움말)/.test(line)
    && line.includes('밑줄')
    && line.includes('마우스')
    && line.includes('정의')
    && /(전문|전문가|전문성)/.test(line)
    && /(초급|초보)/.test(line)
    && line.includes('흐름');
}

function isEnglishReadingInstruction(value) {
  return String(value).trim() === ENGLISH_READING_INSTRUCTION;
}

function instructionKind(value) {
  if (isEnglishReadingInstruction(value)) return 'english';
  if (isKoreanReadingInstruction(value)) return 'korean';
  return '';
}

function bufferWithoutRanges(buffer, text, ranges) {
  if (ranges.length === 0) return buffer;
  const byteRanges = ranges.map(({ start, end }) => ({
    start: Buffer.byteLength(text.slice(0, start), 'utf8'),
    end: Buffer.byteLength(text.slice(0, end), 'utf8'),
  }));
  const parts = [];
  let cursor = 0;
  for (const range of byteRanges) {
    parts.push(buffer.subarray(cursor, range.start));
    cursor = range.end;
  }
  parts.push(buffer.subarray(cursor));
  return Buffer.concat(parts);
}

export function analyzeMarkdownBuffer(buffer, label = '<buffer>') {
  const text = decodeUtf8(buffer, label);
  const lines = splitLines(text);
  const inFence = fenceState(lines);
  const blocks = [];
  const instructionLines = new Set();
  const errors = [];

  for (let index = 0; index < lines.length; index += 1) {
    if (inFence[index]) continue;
    const marker = lines[index].content.trim();
    if (marker !== 'Reading Level' && marker !== '읽기 수준') continue;
    const expectedKind = marker === 'Reading Level' ? 'english' : 'korean';
    const kind = instructionKind(lines[index + 2]?.content ?? '');
    const valid = lines[index + 1]?.content.trim() === ''
      && kind === expectedKind
      && lines[index + 3]?.content.trim() === ''
      && !inFence[index + 1]
      && !inFence[index + 2]
      && !inFence[index + 3];
    if (!valid) {
      errors.push(`${label}:${index + 1}: unrecognized '${marker}' block.`);
      continue;
    }
    blocks.push({
      kind,
      line: index + 1,
      start: lines[index].start,
      end: lines[index + 3].end,
    });
    instructionLines.add(index + 2);
    index += 3;
  }

  for (let index = 0; index < lines.length; index += 1) {
    if (inFence[index] || instructionLines.has(index)) continue;
    const kind = instructionKind(lines[index].content);
    if (kind) errors.push(`${label}:${index + 1}: orphan ${kind} reading-level UI instruction.`);
  }

  if (errors.length > 0) throw new ReadingLevelCleanupError(errors);
  return {
    label,
    blocks,
    output: bufferWithoutRanges(buffer, text, blocks),
    newline: newlineStyle(text),
    beforeHash: sha256(buffer),
  };
}

async function listMarkdownFiles(root, { recursive = false } = {}) {
  const files = [];
  async function visit(directory) {
    const entries = await fs.readdir(directory, { withFileTypes: true });
    for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name, 'en'))) {
      const target = path.join(directory, entry.name);
      if (entry.isDirectory() && recursive) await visit(target);
      else if (entry.isFile() && entry.name.toLowerCase().endsWith('.md')) files.push(target);
    }
  }
  await visit(root);
  return files;
}

async function analyzeFiles(root, options = {}) {
  const paths = await listMarkdownFiles(root, options);
  const files = [];
  const errors = [];
  for (const filePath of paths) {
    const buffer = await fs.readFile(filePath);
    try {
      files.push({
        path: filePath,
        relativePath: path.relative(root, filePath),
        original: buffer,
        ...analyzeMarkdownBuffer(buffer, filePath),
      });
    } catch (error) {
      if (error instanceof ReadingLevelCleanupError) errors.push(...error.errors);
      else throw error;
    }
  }
  if (errors.length > 0) throw new ReadingLevelCleanupError(errors);
  return files;
}

function parseRegistry(registryBuffer, registryPath) {
  const text = decodeUtf8(registryBuffer, registryPath);
  let parsed;
  try {
    parsed = yaml.safeLoad(text) ?? {};
  } catch (error) {
    throw new ReadingLevelCleanupError(`${registryPath}: invalid YAML: ${error.message}`);
  }
  if (!Array.isArray(parsed.artifacts)) {
    throw new ReadingLevelCleanupError(`${registryPath}: artifacts must be an array.`);
  }

  const lines = splitLines(text);
  const starts = [];
  for (let index = 0; index < lines.length; index += 1) {
    const match = lines[index].content.match(/^  - path:\s+(.+?)\s*$/);
    if (!match) continue;
    let artifactPath;
    try {
      artifactPath = yaml.safeLoad(`value: ${match[1]}`).value;
    } catch (error) {
      throw new ReadingLevelCleanupError(`${registryPath}:${index + 1}: invalid path scalar: ${error.message}`);
    }
    starts.push({ artifactPath: String(artifactPath), lineIndex: index });
  }

  const locations = new Map();
  for (let item = 0; item < starts.length; item += 1) {
    const current = starts[item];
    const endIndex = starts[item + 1]?.lineIndex ?? lines.length;
    const hashLines = [];
    for (let index = current.lineIndex + 1; index < endIndex; index += 1) {
      const match = lines[index].content.match(/^(\s+sha256:\s+)([a-f0-9]{64})(\s*)$/i);
      if (match) hashLines.push({ index, match });
    }
    if (hashLines.length !== 1) {
      throw new ReadingLevelCleanupError(`${registryPath}:${current.lineIndex + 1}: ${current.artifactPath} must have exactly one sha256 line.`);
    }
    if (locations.has(current.artifactPath)) {
      throw new ReadingLevelCleanupError(`${registryPath}: duplicate artifact path ${current.artifactPath}.`);
    }
    const hashLine = hashLines[0];
    const prefixLength = hashLine.match[1].length;
    locations.set(current.artifactPath, {
      hash: hashLine.match[2].toLowerCase(),
      start: lines[hashLine.index].start + prefixLength,
      end: lines[hashLine.index].start + prefixLength + hashLine.match[2].length,
    });
  }

  const records = new Map();
  for (const artifact of parsed.artifacts) {
    const artifactPath = String(artifact?.path ?? '');
    if (!artifactPath || records.has(artifactPath)) {
      throw new ReadingLevelCleanupError(`${registryPath}: invalid or duplicate parsed artifact path '${artifactPath}'.`);
    }
    records.set(artifactPath, artifact);
  }
  if (records.size !== locations.size) {
    throw new ReadingLevelCleanupError(`${registryPath}: parsed artifact count ${records.size} differs from textual record count ${locations.size}.`);
  }
  return { text, records, locations };
}

async function validateRawRegistry(rawDir, registryPath, rawFiles, registryBuffer) {
  const registry = parseRegistry(registryBuffer, registryPath);
  const rawByPath = new Map(rawFiles.map((file) => [
    `raw/${file.relativePath.replaceAll('\\', '/')}`,
    file,
  ]));
  const errors = [];
  for (const [artifactPath, artifact] of registry.records) {
    const location = registry.locations.get(artifactPath);
    const declared = String(artifact?.sha256 ?? '').toLowerCase();
    if (!location || declared !== location.hash) {
      errors.push(`${artifactPath}: parsed and textual registry hashes differ.`);
      continue;
    }
    const file = rawByPath.get(artifactPath);
    if (!file) {
      errors.push(`${artifactPath}: registered raw file is missing from ${rawDir}.`);
      continue;
    }
    if (file.beforeHash !== declared) {
      errors.push(`${artifactPath}: disk SHA-256 ${file.beforeHash} differs from registry ${declared}.`);
    }
  }
  if (errors.length > 0) throw new ReadingLevelCleanupError(errors);
  return registry;
}

function replaceTextRanges(buffer, text, replacements) {
  const sorted = [...replacements].sort((a, b) => a.start - b.start);
  const parts = [];
  let cursor = 0;
  for (const replacement of sorted) {
    const start = Buffer.byteLength(text.slice(0, replacement.start), 'utf8');
    const end = Buffer.byteLength(text.slice(0, replacement.end), 'utf8');
    parts.push(buffer.subarray(cursor, start), Buffer.from(replacement.value, 'utf8'));
    cursor = end;
  }
  parts.push(buffer.subarray(cursor));
  return Buffer.concat(parts);
}

function countBlocks(files, kind) {
  return files.reduce((total, file) => total + file.blocks.filter((block) => !kind || block.kind === kind).length, 0);
}

function exactCount(errors, label, actual, expected) {
  if (expected !== undefined && actual !== expected) errors.push(`${label}: expected ${expected}, found ${actual}.`);
}

function resolvedContains(parent, candidate) {
  const relative = path.relative(path.resolve(parent), path.resolve(candidate));
  return relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative));
}

function validateDistinctRoots(roots) {
  const entries = Object.entries(roots).map(([label, value]) => [label, path.resolve(value)]);
  const errors = [];
  for (let left = 0; left < entries.length; left += 1) {
    for (let right = left + 1; right < entries.length; right += 1) {
      const [leftLabel, leftPath] = entries[left];
      const [rightLabel, rightPath] = entries[right];
      if (resolvedContains(leftPath, rightPath) || resolvedContains(rightPath, leftPath)) {
        errors.push(`${leftLabel} and ${rightLabel} scan roots overlap: ${leftPath} <> ${rightPath}.`);
      }
    }
  }
  if (errors.length > 0) throw new ReadingLevelCleanupError(errors);
}

export async function planReadingLevelCleanup({
  sourceDir = DEFAULT_PATHS.sourceDir,
  translationDir = DEFAULT_PATHS.translationDir,
  rawDir = DEFAULT_PATHS.rawDir,
  wikiDir = DEFAULT_PATHS.wikiDir,
  registryPath = DEFAULT_PATHS.registryPath,
  state = 'pending',
  expectations = PRODUCTION_COUNTS,
} = {}) {
  if (!['pending', 'clean'].includes(state)) throw new ReadingLevelCleanupError(`unknown state '${state}'.`);
  validateDistinctRoots({ sourceDir, translationDir, rawDir, wikiDir });
  const [sourceFiles, translationFiles, rawFiles, wikiFiles, registryBuffer] = await Promise.all([
    analyzeFiles(sourceDir),
    analyzeFiles(translationDir),
    analyzeFiles(rawDir),
    analyzeFiles(wikiDir, { recursive: true }),
    fs.readFile(registryPath),
  ]);
  const registry = await validateRawRegistry(rawDir, registryPath, rawFiles, registryBuffer);
  const errors = [];
  const sourceEnglishBlocks = countBlocks(sourceFiles, 'english');
  const sourceKoreanBlocks = countBlocks(sourceFiles, 'korean');
  const translationBlocks = countBlocks(translationFiles);
  const rawEnglishBlocks = countBlocks(rawFiles, 'english');
  const rawKoreanBlocks = countBlocks(rawFiles, 'korean');
  const wikiBlocks = countBlocks(wikiFiles);

  exactCount(errors, 'source Markdown files', sourceFiles.length, expectations.sourceFiles);
  exactCount(errors, 'translation/commentary Markdown files', translationFiles.length, expectations.translationFiles);
  exactCount(errors, 'raw Markdown files', rawFiles.length, expectations.rawFiles);
  if (state === 'pending') {
    exactCount(errors, 'source English reading blocks', sourceEnglishBlocks, expectations.sourceBlocks);
    exactCount(errors, 'raw Korean reading blocks', rawKoreanBlocks, expectations.rawBlocks);
  } else {
    exactCount(errors, 'source English reading blocks', sourceEnglishBlocks, 0);
    exactCount(errors, 'raw Korean reading blocks', rawKoreanBlocks, 0);
  }
  exactCount(errors, 'source Korean reading blocks', sourceKoreanBlocks, 0);
  exactCount(errors, 'translation/commentary reading blocks', translationBlocks, 0);
  exactCount(errors, 'raw English reading blocks', rawEnglishBlocks, 0);
  exactCount(errors, 'wiki reading blocks', wikiBlocks, 0);
  const changedSources = sourceFiles.filter((file) => file.blocks.length > 0);
  const changedRaw = rawFiles.filter((file) => file.blocks.length > 0);
  if (state === 'pending') {
    exactCount(errors, 'source files with reading blocks', changedSources.length, expectations.sourceBlocks);
    exactCount(errors, 'raw files with reading blocks', changedRaw.length, expectations.rawBlocks);
    for (const file of [...changedSources, ...changedRaw]) {
      if (file.blocks.length !== 1) errors.push(`${file.path}: expected exactly one reading block, found ${file.blocks.length}.`);
    }
  }
  if (errors.length > 0) throw new ReadingLevelCleanupError(errors);

  const replacements = [];
  for (const file of changedRaw) {
    const artifactPath = `raw/${file.relativePath.replaceAll('\\', '/')}`;
    const record = registry.records.get(artifactPath);
    const location = registry.locations.get(artifactPath);
    if (!record || !location) throw new ReadingLevelCleanupError(`${artifactPath}: no unique registry record.`);
    if (record.role !== 'translation' || record.language !== 'ko') {
      throw new ReadingLevelCleanupError(`${artifactPath}: reading block is outside a Korean translation artifact.`);
    }
    replacements.push({ start: location.start, end: location.end, value: sha256(file.output) });
  }
  const registryOutput = replaceTextRanges(registryBuffer, registry.text, replacements);
  const allFiles = [...sourceFiles, ...translationFiles, ...rawFiles, ...wikiFiles];
  return {
    paths: { sourceDir, translationDir, rawDir, wikiDir, registryPath },
    expectations,
    state,
    sourceFiles,
    translationFiles,
    rawFiles,
    wikiFiles,
    changedSources,
    changedRaw,
    registryBuffer,
    registryOutput,
    allFiles,
    report: {
      sourceFiles: sourceFiles.length,
      translationFiles: translationFiles.length,
      rawFiles: rawFiles.length,
      wikiFiles: wikiFiles.length,
      registryArtifacts: registry.records.size,
      sourceBlocks: sourceEnglishBlocks,
      rawBlocks: rawKoreanBlocks,
      translationBlocks,
      wikiBlocks,
      changedSourceFiles: changedSources.length,
      changedRawFiles: changedRaw.length,
    },
  };
}

async function pathExists(target) {
  try {
    await fs.access(target, fsConstants.F_OK);
    return true;
  } catch (error) {
    if (error.code === 'ENOENT') return false;
    throw error;
  }
}

function backupRelative(category, relativePath) {
  return path.join(category, ...relativePath.replaceAll('\\', '/').split('/'));
}

async function restoreFromBackup(backupDir, entries, registryEntry = null) {
  const errors = [];
  for (const entry of entries) {
    try {
      const backup = await fs.readFile(path.join(backupDir, entry.backupRelative));
      if (sha256(backup) !== entry.beforeHash) throw new Error('backup SHA-256 differs from manifest');
      await atomicWriteFile(entry.path, backup);
      if (sha256(await fs.readFile(entry.path)) !== entry.beforeHash) throw new Error('restored SHA-256 mismatch');
    } catch (error) {
      errors.push(`${entry.path}: ${error.message}`);
    }
  }
  if (registryEntry) {
    try {
      const backup = await fs.readFile(path.join(backupDir, registryEntry.backupRelative));
      if (sha256(backup) !== registryEntry.beforeHash) throw new Error('backup SHA-256 differs from manifest');
      await atomicWriteFile(registryEntry.path, backup);
      if (sha256(await fs.readFile(registryEntry.path)) !== registryEntry.beforeHash) throw new Error('restored SHA-256 mismatch');
    } catch (error) {
      errors.push(`${registryEntry.path}: ${error.message}`);
    }
  }
  if (errors.length > 0) throw new ReadingLevelCleanupError(errors);
}

async function assertFileHash(targetPath, expectedHash, phase) {
  const actual = sha256(await fs.readFile(targetPath));
  if (actual !== expectedHash) {
    throw new ReadingLevelCleanupError(`${targetPath}: ${phase} SHA-256 ${actual} differs from planned ${expectedHash}.`);
  }
}

async function atomicWriteFile(targetPath, buffer) {
  const directory = path.dirname(targetPath);
  const temporary = path.join(
    directory,
    `.${path.basename(targetPath)}.reading-level-${process.pid}-${crypto.randomBytes(8).toString('hex')}.tmp`,
  );
  let handle;
  try {
    handle = await fs.open(temporary, 'wx');
    await handle.writeFile(buffer);
    await handle.sync();
    await handle.close();
    handle = null;
    await fs.rename(temporary, targetPath);
  } catch (error) {
    if (handle) await handle.close().catch(() => {});
    await fs.rm(temporary, { force: true }).catch(() => {});
    throw error;
  }
}

function canonicalProductionOptions(options) {
  const pathsMatch = Object.entries(DEFAULT_PATHS).every(([key, value]) => path.resolve(options[key] ?? value) === path.resolve(value));
  const countsMatch = Object.entries(PRODUCTION_COUNTS).every(([key, value]) => (options.expectations ?? PRODUCTION_COUNTS)[key] === value);
  return pathsMatch && countsMatch;
}

export async function writeReadingLevelCleanup({ backupDir, postWriteHook, allowCustomPaths = false, ...options } = {}) {
  if (!backupDir) throw new ReadingLevelCleanupError('--backup-dir is required with --write.');
  if (!allowCustomPaths && !canonicalProductionOptions(options)) {
    throw new ReadingLevelCleanupError('write mode requires the canonical production roots and audited counts.');
  }
  const resolvedBackup = path.resolve(backupDir);
  const scanRoots = {
    sourceDir: options.sourceDir ?? DEFAULT_PATHS.sourceDir,
    translationDir: options.translationDir ?? DEFAULT_PATHS.translationDir,
    rawDir: options.rawDir ?? DEFAULT_PATHS.rawDir,
    wikiDir: options.wikiDir ?? DEFAULT_PATHS.wikiDir,
  };
  for (const [label, root] of Object.entries(scanRoots)) {
    if (resolvedContains(root, resolvedBackup) || resolvedContains(resolvedBackup, root)) {
      throw new ReadingLevelCleanupError(`backup directory must not overlap ${label}: ${resolvedBackup} <> ${path.resolve(root)}.`);
    }
  }
  if (await pathExists(resolvedBackup)) {
    throw new ReadingLevelCleanupError(`backup directory already exists: ${resolvedBackup}`);
  }
  const planned = await planReadingLevelCleanup({ ...options, state: 'pending' });
  const entries = [
    ...planned.changedSources.map((file) => ({ file, category: 'sources' })),
    ...planned.changedRaw.map((file) => ({ file, category: 'raw' })),
  ].map(({ file, category }) => ({
    category,
    path: file.path,
    relativePath: file.relativePath,
    backupRelative: backupRelative(category, file.relativePath),
    beforeHash: file.beforeHash,
    afterHash: sha256(file.output),
    newline: file.newline,
    blocks: file.blocks.map(({ kind, line }) => ({ kind, line })),
    output: file.output,
  }));
  const registryEntry = {
    path: planned.paths.registryPath,
    backupRelative: path.join('registry', path.basename(planned.paths.registryPath)),
    beforeHash: sha256(planned.registryBuffer),
    afterHash: sha256(planned.registryOutput),
  };
  await fs.mkdir(resolvedBackup);
  for (const entry of entries) {
    const destination = path.join(resolvedBackup, entry.backupRelative);
    await fs.mkdir(path.dirname(destination), { recursive: true });
    await fs.copyFile(entry.path, destination, fsConstants.COPYFILE_EXCL);
  }
  const registryBackup = path.join(resolvedBackup, registryEntry.backupRelative);
  await fs.mkdir(path.dirname(registryBackup), { recursive: true });
  await fs.copyFile(registryEntry.path, registryBackup, fsConstants.COPYFILE_EXCL);
  const manifest = {
    createdAt: new Date().toISOString(),
    operation: 'remove-reading-level-ui-blocks',
    registry: registryEntry,
    files: entries.map(({ output: _output, ...entry }) => entry),
  };
  await fs.writeFile(path.join(resolvedBackup, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`, { flag: 'wx' });

  for (const entry of entries) {
    await assertFileHash(path.join(resolvedBackup, entry.backupRelative), entry.beforeHash, 'backup');
    await assertFileHash(entry.path, entry.beforeHash, 'pre-write live');
  }
  await assertFileHash(registryBackup, registryEntry.beforeHash, 'backup');
  await assertFileHash(registryEntry.path, registryEntry.beforeHash, 'pre-write live');

  const writtenEntries = [];
  let registryWritten = false;
  try {
    for (const entry of entries) {
      await assertFileHash(entry.path, entry.beforeHash, 'immediate pre-write live');
      await atomicWriteFile(entry.path, entry.output);
      writtenEntries.push(entry);
    }
    await assertFileHash(registryEntry.path, registryEntry.beforeHash, 'immediate pre-write live');
    await atomicWriteFile(registryEntry.path, planned.registryOutput);
    registryWritten = true;
    if (postWriteHook) await postWriteHook();

    const clean = await planReadingLevelCleanup({
      ...options,
      state: 'clean',
      expectations: planned.expectations,
    });
    const currentHashes = new Map(clean.allFiles.map((file) => [path.resolve(file.path), file.beforeHash]));
    const changed = new Map(entries.map((entry) => [path.resolve(entry.path), entry.afterHash]));
    const errors = [];
    for (const file of planned.allFiles) {
      const expected = changed.get(path.resolve(file.path)) ?? file.beforeHash;
      const actual = currentHashes.get(path.resolve(file.path));
      if (actual !== expected) errors.push(`${file.path}: post-write SHA-256 ${actual} differs from expected ${expected}.`);
    }
    if (sha256(await fs.readFile(registryEntry.path)) !== registryEntry.afterHash) {
      errors.push(`${registryEntry.path}: registry bytes differ from the planned hash-only update.`);
    }
    if (errors.length > 0) throw new ReadingLevelCleanupError(errors);
  } catch (error) {
    if (writtenEntries.length > 0 || registryWritten) {
      try {
        await restoreFromBackup(resolvedBackup, writtenEntries, registryWritten ? registryEntry : null);
      } catch (restoreError) {
        throw new ReadingLevelCleanupError(`write failed and rollback also failed: ${error.message}; ${restoreError.message}`);
      }
    }
    throw new ReadingLevelCleanupError(`write verification failed; originals were restored from ${resolvedBackup}: ${error.message}`);
  }
  return { ...planned.report, backupDir: resolvedBackup, writtenFiles: entries.length };
}

export async function restoreReadingLevelBackup({ backupDir } = {}) {
  if (!backupDir) throw new ReadingLevelCleanupError('--backup-dir is required with --restore.');
  const resolvedBackup = path.resolve(backupDir);
  const manifestPath = path.join(resolvedBackup, 'manifest.json');
  let manifest;
  try {
    manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
  } catch (error) {
    throw new ReadingLevelCleanupError(`${manifestPath}: cannot read valid manifest: ${error.message}`);
  }
  if (manifest?.operation !== 'remove-reading-level-ui-blocks' || !Array.isArray(manifest.files) || !manifest.registry) {
    throw new ReadingLevelCleanupError(`${manifestPath}: invalid cleanup backup manifest.`);
  }
  const entries = manifest.files;
  const registryEntry = manifest.registry;
  const all = [...entries, registryEntry];
  for (const entry of all) {
    const backupPath = path.join(resolvedBackup, entry.backupRelative);
    await assertFileHash(backupPath, entry.beforeHash, 'restore backup');
    const currentHash = sha256(await fs.readFile(entry.path));
    if (![entry.beforeHash, entry.afterHash].includes(currentHash)) {
      throw new ReadingLevelCleanupError(`${entry.path}: current SHA-256 is neither the pre-cleanup nor planned cleaned value.`);
    }
  }
  let restored = 0;
  for (const entry of all) {
    const currentHash = sha256(await fs.readFile(entry.path));
    if (currentHash === entry.beforeHash) continue;
    const backup = await fs.readFile(path.join(resolvedBackup, entry.backupRelative));
    await atomicWriteFile(entry.path, backup);
    await assertFileHash(entry.path, entry.beforeHash, 'restored');
    restored += 1;
  }
  return { backupDir: resolvedBackup, restoredFiles: restored };
}

function parseNonNegativeInteger(value, option) {
  if (!/^\d+$/.test(String(value))) throw new ReadingLevelCleanupError(`${option} must be a non-negative integer.`);
  return Number(value);
}

export function parseArguments(argv) {
  const options = {
    ...DEFAULT_PATHS,
    expectations: { ...PRODUCTION_COUNTS },
    mode: '',
    backupDir: '',
    customSafetyOptions: false,
  };
  const pathOptions = new Map([
    ['--sources', 'sourceDir'],
    ['--translations', 'translationDir'],
    ['--raw', 'rawDir'],
    ['--wiki', 'wikiDir'],
    ['--registry', 'registryPath'],
    ['--backup-dir', 'backupDir'],
  ]);
  const countOptions = new Map([
    ['--expected-source-files', 'sourceFiles'],
    ['--expected-translation-files', 'translationFiles'],
    ['--expected-raw-files', 'rawFiles'],
    ['--expected-source-blocks', 'sourceBlocks'],
    ['--expected-raw-blocks', 'rawBlocks'],
  ]);
  const seen = new Set();
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (['--audit', '--write', '--check-clean', '--restore'].includes(argument)) {
      if (options.mode) throw new ReadingLevelCleanupError('choose exactly one mode.');
      options.mode = argument.slice(2);
      continue;
    }
    if (!pathOptions.has(argument) && !countOptions.has(argument)) {
      throw new ReadingLevelCleanupError(`unknown argument: ${argument}`);
    }
    if (seen.has(argument)) throw new ReadingLevelCleanupError(`duplicate option: ${argument}`);
    seen.add(argument);
    const value = argv[index + 1];
    if (!value || value.startsWith('--')) throw new ReadingLevelCleanupError(`${argument} requires a value.`);
    index += 1;
    if (pathOptions.has(argument)) options[pathOptions.get(argument)] = value;
    else options.expectations[countOptions.get(argument)] = parseNonNegativeInteger(value, argument);
    if (argument !== '--backup-dir') options.customSafetyOptions = true;
  }
  if (!options.mode) throw new ReadingLevelCleanupError('choose exactly one of --audit, --write, --check-clean, or --restore.');
  if (['write', 'restore'].includes(options.mode) && !options.backupDir) throw new ReadingLevelCleanupError(`--backup-dir is required with --${options.mode}.`);
  if (options.mode === 'write' && options.customSafetyOptions) {
    throw new ReadingLevelCleanupError('CLI write mode does not accept custom roots or expected counts.');
  }
  return options;
}

function printReport(report, status, backupDir = '') {
  console.log(`Source Markdown: ${report.sourceFiles}; reading blocks: ${report.sourceBlocks}`);
  console.log(`Translation/commentary Markdown: ${report.translationFiles}; reading blocks: ${report.translationBlocks}`);
  console.log(`Raw Markdown: ${report.rawFiles}; reading blocks: ${report.rawBlocks}`);
  console.log(`Wiki Markdown: ${report.wikiFiles}; reading blocks: ${report.wikiBlocks}`);
  console.log(`Registry artifacts: ${report.registryArtifacts}`);
  console.log(`Changed source files: ${report.changedSourceFiles}; changed raw files: ${report.changedRawFiles}`);
  if (backupDir) console.log(`Backup directory: ${backupDir}`);
  console.log(`Status: ${status}`);
}

async function main() {
  try {
    const options = parseArguments(process.argv.slice(2));
    if (options.mode === 'restore') {
      const report = await restoreReadingLevelBackup(options);
      console.log(`Backup directory: ${report.backupDir}`);
      console.log(`Restored files: ${report.restoredFiles}`);
      console.log('Status: restored and verified');
      return;
    }
    if (options.mode === 'write') {
      const report = await writeReadingLevelCleanup(options);
      printReport(report, 'cleaned and verified', report.backupDir);
      return;
    }
    const state = options.mode === 'audit' ? 'pending' : 'clean';
    const planned = await planReadingLevelCleanup({ ...options, state });
    printReport(planned.report, state === 'pending' ? 'pending blocks verified' : 'clean');
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}

if (path.resolve(process.argv[1] ?? '').toLowerCase() === path.resolve(scriptPath).toLowerCase()) {
  await main();
}
