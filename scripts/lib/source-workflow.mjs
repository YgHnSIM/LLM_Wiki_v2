import { createHash } from 'node:crypto';
import path from 'node:path';

const MOJIBAKE_PATTERN = /\uFFFD|Ã|Â|â€|ðŸ/;
const PLACEHOLDER_PATTERN = /\{\{[^}\n]+\}\}/;

export function normalizeSourceSelection(value = '') {
  const match = String(value).trim().match(/^(?:\/lt\s+)?(\d{3})$/i);
  if (!match) throw new Error('Source selection must be a three-digit prefix such as 010 or "/lt 010".');
  return match[1];
}

export function sourceStemFromFilename(filename) {
  const basename = path.basename(String(filename));
  if (!basename.toLowerCase().endsWith('.md')) throw new Error(`Source is not a Markdown file: ${basename}`);
  return basename.slice(0, -3);
}

export function derivePairFilenames(sourceFilename) {
  const stem = sourceStemFromFilename(sourceFilename);
  return {
    translation: `${stem}.ko.md`,
    commentary: `${stem}.commentary.ko.md`,
  };
}

export function sha256(content) {
  return createHash('sha256').update(content).digest('hex');
}

function countFrontmatterDelimiters(content) {
  return String(content).match(/^---\s*$/gm)?.length ?? 0;
}

function countCodeFences(content) {
  return String(content).match(/^\s*```/gm)?.length ?? 0;
}

export function validateTranslationPair({ translation, commentary }) {
  const errors = [];
  const documents = [
    ['translation', translation],
    ['commentary', commentary],
  ];

  for (const [label, content] of documents) {
    if (!String(content).trim()) errors.push(`${label} is empty.`);
    if (MOJIBAKE_PATTERN.test(String(content))) errors.push(`${label} contains a mojibake marker.`);
    if (countCodeFences(content) % 2 !== 0) errors.push(`${label} has unbalanced code fences.`);
    if (!/^#\s+\S/m.test(String(content))) errors.push(`${label} has no H1 heading.`);

    if (String(content).startsWith('---')) {
      const delimiterCount = countFrontmatterDelimiters(content);
      if (delimiterCount < 2) errors.push(`${label} has unclosed YAML frontmatter.`);
    }
  }

  if (PLACEHOLDER_PATTERN.test(String(commentary))) errors.push('commentary contains an unresolved {{...}} placeholder.');
  for (let section = 1; section <= 12; section += 1) {
    const headingPattern = new RegExp(`^##\\s+${section}\\.\\s+\\S`, 'm');
    if (!headingPattern.test(String(commentary))) errors.push(`commentary is missing required section ${section}.`);
  }
  return errors;
}

export function createArtifactRecords({ prefix, translationFilename, commentaryFilename, translationHash, commentaryHash }) {
  return [
    {
      path: `raw/${translationFilename}`,
      role: 'translation',
      order_prefix: prefix,
      language: 'ko',
      source_type: 'derivative',
      provenance: 'external-original-used',
      original_in_repository: false,
      sha256: translationHash,
    },
    {
      path: `raw/${commentaryFilename}`,
      role: 'commentary',
      order_prefix: prefix,
      language: 'ko',
      source_type: 'derivative',
      provenance: 'external-original-used',
      original_in_repository: false,
      sha256: commentaryHash,
    },
  ];
}

export function formatArtifactRecords(records) {
  return records.map((record) => [
    `  - path: ${JSON.stringify(record.path)}`,
    `    role: ${record.role}`,
    `    order_prefix: ${JSON.stringify(record.order_prefix)}`,
    `    language: ${record.language}`,
    `    source_type: ${record.source_type}`,
    `    provenance: ${record.provenance}`,
    `    original_in_repository: ${record.original_in_repository}`,
    `    sha256: ${record.sha256}`,
  ].join('\n')).join('\n');
}

export function validateArtifactRecord(actual, expected) {
  const keys = [
    'path',
    'role',
    'order_prefix',
    'language',
    'source_type',
    'provenance',
    'original_in_repository',
    'sha256',
  ];
  return keys.filter((key) => String(actual?.[key]) !== String(expected?.[key]));
}
