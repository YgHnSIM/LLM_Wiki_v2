import assert from 'node:assert/strict';
import test from 'node:test';
import {
  escapeHtml,
  firstParagraph,
  readingMinutes,
  stripMarkdown,
  truncate,
} from '../lib/content-format.mjs';

test('HTML escaping covers text and attribute delimiters', () => {
  assert.equal(escapeHtml(`<a title="x">Tom & Jerry's</a>`), '&lt;a title=&quot;x&quot;&gt;Tom &amp; Jerry&#039;s&lt;/a&gt;');
});

test('Markdown summaries retain wiki labels and numeric ranges', () => {
  assert.equal(stripMarkdown('**[[MADALINE|다중 ADALINE]]**은 1960~1962년에 등장했다.'), '다중 ADALINE은 1960–1962년에 등장했다.');
});

test('the first prose paragraph skips headings and callouts', () => {
  const markdown = `# 제목\n\n> [!NOTE]\n> 짧은 안내\n\n이 문장은 카드 요약으로 쓰일 만큼 충분히 긴 첫 번째 본문 문단입니다.`;
  assert.equal(firstParagraph(markdown), '이 문장은 카드 요약으로 쓰일 만큼 충분히 긴 첫 번째 본문 문단입니다.');
});

test('summary length and reading-time helpers stay bounded', () => {
  assert.equal(truncate('짧은 문장', 20), '짧은 문장');
  assert.equal(truncate('a'.repeat(30), 10), 'aaaaaaaaaa…');
  assert.equal(readingMinutes('a'.repeat(701)), 2);
});
