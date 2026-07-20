import assert from 'node:assert/strict';
import path from 'node:path';
import test from 'node:test';
import {
  artifactRoleMetadata,
  normalizeArtifactMarkdown,
  normalizeArtifactPath,
  resolveRawArtifactPath,
  sourceOriginForArtifact,
  sourceUrlForArtifact,
} from '../lib/artifact-readers.mjs';

test('artifact reader roles preserve legacy distinctions', () => {
  assert.equal(artifactRoleMetadata('translation').label, '번역본');
  assert.equal(artifactRoleMetadata('translated-essay').routeRole, 'translation');
  assert.equal(artifactRoleMetadata('source-essay').label, '한국어 소스 글');
  assert.equal(artifactRoleMetadata('source-essay').directory, false);
  assert.equal(artifactRoleMetadata('unknown'), null);
});

test('artifact paths are normalized and confined to raw', () => {
  const rootDir = path.resolve('C:/example/wiki');
  const rawDir = path.join(rootDir, 'raw');
  assert.equal(normalizeArtifactPath('.\\raw\\007 Example.ko.md'), 'raw/007 Example.ko.md');
  assert.equal(
    resolveRawArtifactPath({ rootDir, rawDir, artifactPath: 'raw/007 Example.ko.md' }),
    path.join(rawDir, '007 Example.ko.md'),
  );
  assert.throws(
    () => resolveRawArtifactPath({ rootDir, rawDir, artifactPath: 'raw/../wiki/index.md' }),
    /must stay inside raw/,
  );
});

test('artifact markdown removes one embedded title and demotes later H1 headings', () => {
  const markdown = '도입\n\n<!-- Obsidian note: 독자 화면에서는 숨긴다. -->\n\n# 문서 제목\n\n본문\n\n```sh\n# 코드 주석\n<!-- 코드 안 주석은 보존한다. -->\n[예시](/writing/in-code)\n```\n\n# 부록\n\n[관련 글](/writing/example)';
  const normalized = normalizeArtifactMarkdown(markdown, { sourceOrigin: 'https://example.com' });
  assert.doesNotMatch(normalized, /Obsidian note/);
  assert.doesNotMatch(normalized, /^# 문서 제목$/m);
  assert.match(normalized, /^## 부록$/m);
  assert.match(normalized, /^# 코드 주석$/m);
  assert.match(normalized, /<!-- 코드 안 주석은 보존한다\. -->/);
  assert.match(normalized, /\[예시\]\(\/writing\/in-code\)/);
  assert.match(normalized, /\(https:\/\/example\.com\/writing\/example\)/);
});

test('artifact markdown removes multiline hidden comments outside code fences', () => {
  const normalized = normalizeArtifactMarkdown('앞\n<!-- 내부 메모\n계속되는 메모\n-->\n뒤');
  assert.equal(normalized, '앞\n뒤');
});

test('artifact source origin prefers the recorded source URL', () => {
  assert.equal(
    sourceOriginForArtifact('출처: https://example.org/writing/item\n\n본문'),
    'https://example.org',
  );
  assert.equal(
    sourceOriginForArtifact('Source: https://example.net/writing/item\n\nBody'),
    'https://example.net',
  );
  assert.equal(
    sourceUrlForArtifact('출처: https://inline.example/item', 'https://recorded.example/article'),
    'https://recorded.example/article',
  );
});
