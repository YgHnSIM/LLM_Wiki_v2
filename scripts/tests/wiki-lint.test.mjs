import assert from 'node:assert/strict';
import test from 'node:test';
import {
  brenndoerferSourceUrlsForArtifacts,
  duplicateArtifactPaths,
  extractNormalizedHttpUrls,
  missingBrenndoerferSourceUrls,
  missingExpectedArtifactPaths,
  pageRequiresStagedStructure,
  sourceNumberRequiresStagedStructure,
  STAGED_PAGE_H2_HEADINGS,
  strictStagedStructureEnabled,
  unexpectedArtifactPaths,
  validateStagedPageStructure,
  verificationEnvironmentForSource,
} from '../lib/wiki-lint.mjs';

function stagedPage(headings = STAGED_PAGE_H2_HEADINGS) {
  return [
    '# 단계형 문서',
    '',
    '> [!note] 학습 안내',
    '> **난이도:** 입문',
    '> **선수 지식:** 없음',
    '> **읽고 나면:** 핵심 원리와 근거의 한계를 구분할 수 있다.',
    '',
    ...headings.flatMap((heading) => [`## ${heading}`, '', `${heading} 본문`, '']),
  ].join('\n');
}

test('legacy pages remain warnings unless policy requires the staged structure', () => {
  const legacy = '# 기존 문서\n\n## 배경\n\n설명\n\n## 출처\n\n근거\n\n## 관련 항목\n';

  assert.deepEqual(validateStagedPageStructure(legacy), { staged: false, errors: [] });
  const required = validateStagedPageStructure(legacy, { requireAll: true });
  assert.equal(required.staged, false);
  assert.ok(required.errors.some((error) => error.includes('학습 안내')));
  assert.ok(required.errors.some((error) => error.includes('1단계 — 먼저 잡을 핵심')));
  assert.ok(required.errors.some((error) => error.includes('unexpected: ## 배경')));
});

test('a migration signal makes the entire staged structure mandatory', () => {
  const partial = '# 일부 전환\n\n> [!note] 학습 안내\n> **난이도:** 입문\n> **선수 지식:** 없음\n> **읽고 나면:** 설명할 수 있다.\n\n## 출처\n\n근거\n\n## 관련 항목\n';
  const result = validateStagedPageStructure(partial);

  assert.equal(result.staged, true);
  assert.ok(result.errors.some((error) => error.includes('1단계 — 먼저 잡을 핵심')));
  assert.ok(result.errors.some((error) => error.includes('학습 확인')));

  const headingOnly = '# 일부 전환\n\n## 학습 확인\n\n질문\n\n## 출처\n\n근거\n\n## 관련 항목\n';
  const headingResult = validateStagedPageStructure(headingOnly);
  assert.equal(headingResult.staged, true);
  assert.ok(headingResult.errors.some((error) => error.includes('학습 안내')));
});

test('staged pages allow exactly the seven fixed ordered H2 sections', () => {
  assert.deepEqual(validateStagedPageStructure(stagedPage()), { staged: true, errors: [] });

  const misplacedCallout = stagedPage().replace(
    '# 단계형 문서\n\n> [!note] 학습 안내',
    '# 단계형 문서\n\n도입 문장\n\n> [!note] 학습 안내',
  );
  assert.ok(validateStagedPageStructure(misplacedCallout).errors.some((error) => error.includes('first non-blank line')));

  const codeBeforeCallout = stagedPage().replace(
    '# 단계형 문서\n\n> [!note] 학습 안내',
    '# 단계형 문서\n\n```text\n도입 코드\n```\n\n> [!note] 학습 안내',
  );
  assert.ok(validateStagedPageStructure(codeBeforeCallout).errors.some((error) => error.includes('first non-blank line')));

  const reordered = stagedPage([
    STAGED_PAGE_H2_HEADINGS[1],
    STAGED_PAGE_H2_HEADINGS[0],
    ...STAGED_PAGE_H2_HEADINGS.slice(2),
  ]);
  assert.ok(validateStagedPageStructure(reordered).errors.some((error) => error.includes('must follow this order')));

  const duplicated = stagedPage([...STAGED_PAGE_H2_HEADINGS, '학습 확인']);
  assert.ok(validateStagedPageStructure(duplicated).errors.some((error) => error.includes('found 2')));

  const extra = stagedPage().replace('## 검증과 한계', '## 추가 설명\n\n추가 본문\n\n## 검증과 한계');
  assert.ok(validateStagedPageStructure(extra).errors.some((error) => error.includes('unexpected: ## 추가 설명')));

  const indentedExtra = stagedPage().replace('## 검증과 한계', '  ## 들여쓴 추가 설명\n\n추가 본문\n\n## 검증과 한계');
  assert.ok(validateStagedPageStructure(indentedExtra).errors.some((error) => error.includes('unexpected: ## 들여쓴 추가 설명')));

  const setextExtra = stagedPage().replace('## 검증과 한계', 'Setext 추가 설명\n---\n\n추가 본문\n\n## 검증과 한계');
  assert.ok(validateStagedPageStructure(setextExtra).errors.some((error) => error.includes('unexpected: ## Setext 추가 설명')));
});

test('the learning guide has one marker and one non-empty line for each required label', () => {
  const duplicateMarker = stagedPage().replace(
    '> **난이도:** 입문',
    '> [!note] 학습 안내\n> **난이도:** 입문',
  );
  assert.ok(validateStagedPageStructure(duplicateMarker).errors.some((error) => error.includes('marker, found 2')));

  const blankDifficulty = stagedPage().replace('> **난이도:** 입문', '> **난이도:**');
  assert.ok(validateStagedPageStructure(blankDifficulty).errors.some((error) => error.includes('난이도') && error.includes('non-empty value')));

  const duplicatePrerequisite = stagedPage().replace(
    '> **선수 지식:** 없음',
    '> **선수 지식:** 없음\n> **선수 지식:** [[선행 문서]]',
  );
  assert.ok(validateStagedPageStructure(duplicatePrerequisite).errors.some((error) => error.includes('선수 지식') && error.includes('found 2')));

  const detachedOutcome = stagedPage().replace(
    '> **읽고 나면:** 핵심 원리와 근거의 한계를 구분할 수 있다.',
    '\n> **읽고 나면:** 핵심 원리와 근거의 한계를 구분할 수 있다.',
  );
  assert.ok(validateStagedPageStructure(detachedOutcome).errors.some((error) => error.includes('must be inside')));
});

test('creation date, source number, and strict environment close the progressive migration window', () => {
  assert.equal(pageRequiresStagedStructure({ created: '2026-07-20', pageType: 'concept', id: 'concept.old' }), false);
  assert.equal(pageRequiresStagedStructure({ created: '2026-07-21', pageType: 'concept', id: 'concept.new' }), true);
  assert.equal(pageRequiresStagedStructure({ created: '2026-07-20', pageType: 'source', id: 'source.059' }), false);
  assert.equal(pageRequiresStagedStructure({ created: '2026-07-20', pageType: 'source', id: 'source.060' }), true);
  assert.equal(pageRequiresStagedStructure({ created: '2026-07-20', pageType: 'reference', id: 'reference.060' }), false);
  assert.equal(pageRequiresStagedStructure({ created: '2026-07-20' }, { strict: true }), true);
  assert.equal(sourceNumberRequiresStagedStructure('059'), false);
  assert.equal(sourceNumberRequiresStagedStructure('source.060'), true);
  assert.equal(strictStagedStructureEnabled({ LLM_WIKI_REQUIRE_STAGED_STRUCTURE: '1' }), true);
  assert.equal(strictStagedStructureEnabled({ LLM_WIKI_REQUIRE_STAGED_STRUCTURE: 'true' }), false);

  const existingEnvironment = { TEST_VALUE: 'kept' };
  assert.equal(verificationEnvironmentForSource('059', existingEnvironment), existingEnvironment);
  assert.deepEqual(verificationEnvironmentForSource('060', existingEnvironment), {
    TEST_VALUE: 'kept',
    LLM_WIKI_REQUIRE_STAGED_STRUCTURE: '1',
  });
});

test('source provenance URLs use normalized exact URL tokens outside comments and code', () => {
  const originalUrl = 'https://mbrenndoerfer.com/writing/example-source';
  const secondUrl = 'https://www.mbrenndoerfer.com/writing/second-source';
  const records = new Map([
    ['raw/example.ko.md', { source_url: originalUrl }],
    ['raw/example.commentary.ko.md', { source_url: originalUrl }],
    ['raw/second.md', { source_url: secondUrl }],
    ['raw/other.md', { source_url: 'https://example.com/not-required' }],
  ]);
  const artifacts = [...records.keys()];
  const hiddenBody = [
    '# 소스',
    '',
    secondUrl,
    '',
    '## 출처',
    '',
    `<!-- ${originalUrl} -->`,
    '',
    '```text',
    originalUrl,
    '```',
    '',
    `\`inline ${secondUrl}\``,
    '',
    `- [비슷하지만 다른 URL](${originalUrl}-appendix)`,
    '',
    '## 관련 항목',
    '',
  ].join('\n');

  assert.deepEqual(brenndoerferSourceUrlsForArtifacts(artifacts, records), [originalUrl, secondUrl]);
  assert.deepEqual(missingBrenndoerferSourceUrls(hiddenBody, artifacts, records), [originalUrl, secondUrl]);
  assert.equal(extractNormalizedHttpUrls(hiddenBody).includes(originalUrl), false);

  const visibleBody = hiddenBody.replace(
    '<!-- https://mbrenndoerfer.com/writing/example-source -->',
    `- [원문](${originalUrl})\n- [보조 원문](${secondUrl})`,
  );
  assert.deepEqual(missingBrenndoerferSourceUrls(visibleBody, artifacts, records), []);

  const nestedListBody = `# 소스\n\n## 출처\n\n- 원문 묶음\n    - [원문](${originalUrl})\n    - [보조 원문](${secondUrl})\n\n## 관련 항목\n`;
  assert.deepEqual(missingBrenndoerferSourceUrls(nestedListBody, artifacts, records), []);
  assert.deepEqual(extractNormalizedHttpUrls(`    ${originalUrl}`), []);
  assert.deepEqual(brenndoerferSourceUrlsForArtifacts(['raw/other.md'], records), []);
});

test('public source artifact checks require both exact expected raw paths', () => {
  const expected = ['raw/060_example.ko.md', 'raw/060_example.commentary.ko.md'];
  assert.deepEqual(missingExpectedArtifactPaths([...expected, 'raw/extra.md'], expected), []);
  assert.deepEqual(unexpectedArtifactPaths([...expected, 'raw/extra.md'], expected), ['raw/extra.md']);
  assert.deepEqual(duplicateArtifactPaths([...expected, expected[0]]), [expected[0]]);
  assert.deepEqual(missingExpectedArtifactPaths(['raw/060_example.ko.md'], expected), ['raw/060_example.commentary.ko.md']);
  assert.deepEqual(missingExpectedArtifactPaths(['raw/060_example.commentary.ko.md.bak'], expected), expected);
});
