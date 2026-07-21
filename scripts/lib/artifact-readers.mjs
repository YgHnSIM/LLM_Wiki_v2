import path from 'node:path';

const roleMetadata = Object.freeze({
  translation: Object.freeze({
    routeRole: 'translation',
    label: '원문 번역본',
    directory: true,
    hideSourceMarker: true,
    description: '원문의 흐름을 따라 새로 옮긴 한국어 번역입니다.',
  }),
  'translated-essay': Object.freeze({
    routeRole: 'translation',
    label: '원문 번역본',
    directory: true,
    hideSourceMarker: true,
    description: '초기 수집 과정에서 번역과 정리를 함께 거친 한국어 자료입니다.',
  }),
  'source-essay': Object.freeze({
    routeRole: 'source-essay',
    label: '원문 번역본',
    directory: false,
    hideSourceMarker: true,
    description: '수집 당시 형태를 그대로 보존한 한국어 원문 번역 자료입니다.',
  }),
  commentary: Object.freeze({
    routeRole: 'commentary',
    label: '해설',
    directory: false,
    hideSourceMarker: false,
    description: '번역의 맥락, 용어, 검증 쟁점과 추가 읽을거리를 정리한 해설입니다.',
  }),
});

export function artifactRoleMetadata(role) {
  return roleMetadata[String(role ?? '').trim()] ?? null;
}

export function normalizeArtifactPath(value) {
  return String(value ?? '').trim().replaceAll('\\', '/').replace(/^\.\//, '');
}

export function resolveRawArtifactPath({ rootDir, rawDir, artifactPath }) {
  const normalized = normalizeArtifactPath(artifactPath);
  const segments = normalized.split('/').filter(Boolean);
  if (segments[0] !== 'raw' || segments.length < 2 || segments.some((segment) => segment === '.' || segment === '..')) {
    throw new Error(`Artifact reader path must stay inside raw/: ${artifactPath}`);
  }

  const rawRoot = path.resolve(rawDir);
  const absolutePath = path.resolve(rootDir, ...segments);
  if (!absolutePath.startsWith(`${rawRoot}${path.sep}`)) {
    throw new Error(`Artifact reader path escapes raw/: ${artifactPath}`);
  }
  return absolutePath;
}

export function sourceUrlForArtifact(markdown, recordedSourceUrl = '') {
  const candidates = [
    String(recordedSourceUrl).trim(),
    String(markdown).match(/(?:^|\n)(?:원본\s+출처|출처|Source):\s*(https?:\/\/[^\s]+)/i)?.[1] ?? '',
  ];
  for (const candidate of candidates) {
    try {
      const parsed = new URL(candidate);
      if (parsed.protocol === 'https:' || parsed.protocol === 'http:') return parsed.href;
    } catch {
      // Try the next provenance source.
    }
  }
  return '';
}

export function sourceOriginForArtifact(markdown, fallback = 'https://mbrenndoerfer.com', recordedSourceUrl = '') {
  const sourceUrl = sourceUrlForArtifact(markdown, recordedSourceUrl);
  try {
    return new URL(sourceUrl || fallback).origin;
  } catch {
    return fallback;
  }
}

export function normalizeArtifactMarkdown(markdown, { sourceOrigin, hideSourceMarker = false } = {}) {
  let removedTitle = false;
  const origin = String(sourceOrigin || sourceOriginForArtifact(markdown)).replace(/\/$/, '');
  let fence = null;
  let hiddenComment = false;
  return String(markdown)
    .split(/\r?\n/)
    .flatMap((line) => {
      const fenceMatch = line.match(/^\s*(`{3,}|~{3,})/);
      if (fenceMatch) {
        const marker = fenceMatch[1];
        if (!fence) fence = { character: marker[0], length: marker.length };
        else if (marker[0] === fence.character && marker.length >= fence.length) fence = null;
        return [line];
      }
      if (fence) return [line];
      if (hiddenComment) {
        if (line.includes('-->')) hiddenComment = false;
        return [];
      }
      if (/^\s*<!--/.test(line)) {
        if (!line.includes('-->')) hiddenComment = true;
        return [];
      }
      if (hideSourceMarker && /^\s*(?:원본\s+출처|출처|Source)\s*:\s*<?https?:\/\/\S+>?\s*$/i.test(line)) {
        return [];
      }
      if (/^#\s+/.test(line)) {
        if (!removedTitle) {
          removedTitle = true;
          return [];
        }
        return [`#${line}`];
      }
      return [line.replace(/(\]\()\/(?!\/)([^)\s]+)/g, `$1${origin}/$2`)];
    })
    .join('\n')
    .trim();
}
