import { Lexer } from 'marked';

export const REQUIRE_STAGED_STRUCTURE_FOR_ALL_NON_META = false;
export const STRICT_STAGED_STRUCTURE_ENV = 'LLM_WIKI_REQUIRE_STAGED_STRUCTURE';

export const STAGED_PAGE_H2_HEADINGS = Object.freeze([
  '1단계 — 먼저 잡을 핵심',
  '2단계 — 작동 원리',
  '3단계 — 기술과 근거',
  '검증과 한계',
  '학습 확인',
  '출처',
  '관련 항목',
]);

export const LEARNING_GUIDE_CALLOUT = '> [!note] 학습 안내';

const STAGED_PAGE_H2_SET = new Set(STAGED_PAGE_H2_HEADINGS);
const MIGRATION_SIGNAL_H2_HEADINGS = new Set(STAGED_PAGE_H2_HEADINGS.slice(0, 5));
const LEARNING_GUIDE_LABELS = Object.freeze(['난이도', '선수 지식', '읽고 나면']);
const STAGED_STRUCTURE_START_DATE = '2026-07-21';
const STAGED_SOURCE_START_NUMBER = 60;

function linesOf(markdown = '') {
  return String(markdown).split(/\r?\n/);
}

function withoutHtmlComments(markdown = '') {
  return String(markdown).replace(/<!--[\s\S]*?(?:-->|$)/g, (comment) => comment.replace(/[^\r\n]/g, ' '));
}

function visibleMarkdownLines(markdown = '') {
  let fence = null;
  return linesOf(withoutHtmlComments(markdown)).map((line) => {
    const fenceMatch = line.match(/^\s*(`{3,}|~{3,})/);
    if (fenceMatch) {
      const marker = fenceMatch[1];
      if (!fence) fence = { character: marker[0], length: marker.length };
      else if (marker[0] === fence.character && marker.length >= fence.length) fence = null;
      return '';
    }
    if (fence) return '';
    return line;
  });
}

function h2Records(markdown = '') {
  const lines = visibleMarkdownLines(markdown);
  const records = [];
  for (let lineIndex = 0; lineIndex < lines.length; lineIndex += 1) {
    const line = lines[lineIndex];
    const canonicalMatch = line.match(/^##[ \t]+(.+?)[ \t]*$/);
    if (canonicalMatch) {
      records.push({ heading: canonicalMatch[1].trim(), lineIndex, canonical: true });
      continue;
    }

    const atxMatch = line.match(/^ {0,3}##(?!#)(?:[ \t]+(.*?)[ \t]*|[ \t]*)$/);
    if (atxMatch) {
      const heading = String(atxMatch[1] ?? '').replace(/[ \t]+#+[ \t]*$/, '').trim();
      records.push({ heading, lineIndex, canonical: false });
      continue;
    }

    if (/^ {0,3}-{2,}[ \t]*$/.test(line) && lines[lineIndex - 1]?.trim()) {
      records.push({ heading: lines[lineIndex - 1].trim(), lineIndex, canonical: false });
    }
  }
  return records;
}

function hasMigrationSignal(markdown = '') {
  const lines = visibleMarkdownLines(markdown);
  if (lines.some((line) => /^>\s*\[!note\]\s+학습 안내\s*$/i.test(line))) return true;
  return h2Records(markdown).some(({ heading }) => MIGRATION_SIGNAL_H2_HEADINGS.has(heading));
}

function learningGuideErrors(markdown = '') {
  const errors = [];
  const lines = visibleMarkdownLines(markdown);
  const positionLines = linesOf(withoutHtmlComments(markdown));
  const markerIndexes = lines.flatMap((line, index) => line === LEARNING_GUIDE_CALLOUT ? [index] : []);
  if (markerIndexes.length !== 1) {
    errors.push(`expected exactly one ${LEARNING_GUIDE_CALLOUT} marker, found ${markerIndexes.length}.`);
  }

  if (markerIndexes.length === 1) {
    const h1Index = lines.findIndex((line) => /^#[ \t]+\S/.test(line));
    let nextContentIndex = h1Index + 1;
    while (nextContentIndex < positionLines.length && !positionLines[nextContentIndex].trim()) nextContentIndex += 1;
    if (h1Index < 0 || nextContentIndex !== markerIndexes[0]) {
      errors.push(`${LEARNING_GUIDE_CALLOUT} must be the first non-blank line after H1.`);
    }
  }

  const markerIndex = markerIndexes.length === 1 ? markerIndexes[0] : -1;
  let calloutEnd = markerIndex + 1;
  while (markerIndex >= 0 && calloutEnd < lines.length && /^>/.test(lines[calloutEnd])) calloutEnd += 1;

  for (const label of LEARNING_GUIDE_LABELS) {
    const pattern = new RegExp(`^>[ \\t]*\\*\\*${label}:\\*\\*[ \\t]*(.*?)[ \\t]*$`);
    const matches = lines.flatMap((line, lineIndex) => {
      const match = line.match(pattern);
      return match ? [{ lineIndex, value: match[1].trim() }] : [];
    });
    if (matches.length !== 1) {
      errors.push(`expected exactly one non-empty > **${label}:** label line, found ${matches.length}.`);
      continue;
    }
    if (!matches[0].value) errors.push(`> **${label}:** must have a non-empty value.`);
    if (markerIndex >= 0 && !(matches[0].lineIndex > markerIndex && matches[0].lineIndex < calloutEnd)) {
      errors.push(`> **${label}:** must be inside the 학습 안내 callout.`);
    }
  }

  return errors;
}

function frontmatterDate(value) {
  if (value instanceof Date && !Number.isNaN(value.valueOf())) return value.toISOString().slice(0, 10);
  return String(value ?? '').slice(0, 10);
}

export function sourceNumberRequiresStagedStructure(value = '') {
  const match = String(value).trim().match(/^(?:source\.)?(\d{3,})$/i);
  return Boolean(match && Number(match[1]) >= STAGED_SOURCE_START_NUMBER);
}

export function strictStagedStructureEnabled(environment = process.env) {
  return String(environment?.[STRICT_STAGED_STRUCTURE_ENV] ?? '') === '1';
}

export function pageRequiresStagedStructure({ created, pageType, id } = {}, { strict = false } = {}) {
  if (strict || frontmatterDate(created) >= STAGED_STRUCTURE_START_DATE) return true;
  return pageType === 'source' && sourceNumberRequiresStagedStructure(id);
}

export function verificationEnvironmentForSource(prefix, environment = process.env) {
  if (!sourceNumberRequiresStagedStructure(prefix)) return environment;
  return { ...environment, [STRICT_STAGED_STRUCTURE_ENV]: '1' };
}

export function validateStagedPageStructure(markdown = '', {
  requireAll = REQUIRE_STAGED_STRUCTURE_FOR_ALL_NON_META,
} = {}) {
  const staged = hasMigrationSignal(markdown);
  if (!staged && !requireAll) return { staged: false, errors: [] };

  const errors = learningGuideErrors(markdown);
  const records = h2Records(markdown);
  const unexpectedHeadings = records.filter(({ heading, canonical }) => !canonical || !STAGED_PAGE_H2_SET.has(heading));
  if (unexpectedHeadings.length) {
    errors.push(`staged pages may contain only the seven fixed H2 sections; unexpected: ${unexpectedHeadings.map(({ heading }) => `## ${heading}`).join(', ')}.`);
  }

  const positions = [];
  for (const heading of STAGED_PAGE_H2_HEADINGS) {
    const matches = records.filter((record) => record.canonical && record.heading === heading);
    if (matches.length !== 1) {
      errors.push(`expected exactly one ## ${heading} section, found ${matches.length}.`);
    }
    positions.push(matches[0]?.lineIndex ?? null);
  }

  const presentPositions = positions.filter((position) => position !== null);
  if (presentPositions.some((position, index) => index > 0 && position <= presentPositions[index - 1])) {
    errors.push(`required H2 sections must follow this order: ${STAGED_PAGE_H2_HEADINGS.map((heading) => `## ${heading}`).join(' → ')}.`);
  }

  return { staged, errors };
}

function h2Section(markdown = '', heading = '') {
  const sourceLines = linesOf(markdown);
  const records = h2Records(markdown);
  const startRecord = records.find((record) => record.canonical && record.heading === heading);
  if (!startRecord) return '';
  const nextRecord = records.find((record) => record.lineIndex > startRecord.lineIndex);
  return sourceLines.slice(startRecord.lineIndex + 1, nextRecord?.lineIndex ?? sourceLines.length).join('\n');
}

function normalizedHttpUrl(value = '') {
  try {
    const parsed = new URL(String(value).trim());
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return '';
    return parsed.href;
  } catch {
    return '';
  }
}

function isBrenndoerferUrl(value = '') {
  try {
    const hostname = new URL(value).hostname.toLowerCase().replace(/^www\./, '');
    return hostname === 'mbrenndoerfer.com';
  } catch {
    return false;
  }
}

export function extractNormalizedHttpUrls(markdown = '') {
  const sourceUrls = new Set();
  const visit = (tokens) => {
    for (const token of tokens ?? []) {
      if (!token || ['code', 'codespan', 'html'].includes(token.type)) continue;
      if (token.type === 'link') {
        const sourceUrl = normalizedHttpUrl(token.href);
        if (sourceUrl) sourceUrls.add(sourceUrl);
      }
      visit(token.tokens);
      visit(token.items);
      visit(token.header);
      for (const row of token.rows ?? []) visit(row);
    }
  };
  visit(Lexer.lex(String(markdown), { gfm: true }));
  return [...sourceUrls];
}

export function brenndoerferSourceUrlsForArtifacts(artifactPaths = [], artifactRecords = new Map()) {
  const sourceUrls = new Set();
  for (const artifactPath of artifactPaths) {
    const sourceUrl = normalizedHttpUrl(artifactRecords.get(String(artifactPath))?.source_url);
    if (isBrenndoerferUrl(sourceUrl)) sourceUrls.add(sourceUrl);
  }
  return [...sourceUrls];
}

export function missingBrenndoerferSourceUrls(markdown = '', artifactPaths = [], artifactRecords = new Map()) {
  const requiredUrls = brenndoerferSourceUrlsForArtifacts(artifactPaths, artifactRecords);
  const sourceUrls = new Set(extractNormalizedHttpUrls(h2Section(markdown, '출처')));
  return requiredUrls.filter((sourceUrl) => !sourceUrls.has(sourceUrl));
}

export function missingExpectedArtifactPaths(actualPaths = [], expectedPaths = []) {
  const actual = new Set(actualPaths.map(String));
  return expectedPaths.map(String).filter((expectedPath) => !actual.has(expectedPath));
}

export function unexpectedArtifactPaths(actualPaths = [], expectedPaths = []) {
  const expected = new Set(expectedPaths.map(String));
  return actualPaths.map(String).filter((actualPath) => !expected.has(actualPath));
}

export function duplicateArtifactPaths(actualPaths = []) {
  const seen = new Set();
  const duplicates = new Set();
  for (const actualPath of actualPaths.map(String)) {
    if (seen.has(actualPath)) duplicates.add(actualPath);
    seen.add(actualPath);
  }
  return [...duplicates];
}
