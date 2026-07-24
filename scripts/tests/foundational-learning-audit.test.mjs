import assert from 'node:assert/strict';
import test from 'node:test';
import {
  auditFoundationalLearning,
  countFormulaBlocks,
  renderFoundationalLearningAudit,
} from '../audit-foundational-learning.mjs';

function document({ filename, pageType, title = filename, body = '', aliases = [] }) {
  return {
    filename,
    body,
    data: {
      id: `${pageType}.${filename}`,
      page_type: pageType,
      title,
      aliases,
    },
  };
}

test('formula audit counts display math blocks without counting inline math', () => {
  assert.equal(countFormulaBlocks('인라인 $x+y$와 $$x+y$$ 그리고 \\[z\\]'), 2);
});

test('foundational audit resolves narrative links and excludes sources and related links', () => {
  const concept = document({
    filename: '확률',
    pageType: 'concept',
    body: [
      '# 확률',
      '',
      '> **난이도:** 입문',
      '> **선수 지식:** 없음',
      '',
      '## 1단계 — 먼저 잡을 핵심',
      '',
      '$$P(A)=0.5$$',
      '',
      '## 학습 확인',
      '',
      '### 마스터리 연습',
      '',
      '#### 부분 완성',
      '',
      '#### 새 수치 전이',
      '',
      '#### 오류 진단',
      '',
      '### 해설과 채점 기준',
      '',
      '## 출처',
      '',
      '[[출처에만 있는 링크]]',
      '',
      '## 관련 항목',
      '',
      '[[관련 링크]]',
      '',
    ].join('\n'),
  });
  const source = document({
    filename: '확률을 사용하는 소스',
    pageType: 'source',
    body: [
      '# 확률을 사용하는 소스',
      '',
      '> **난이도:** 중급',
      '> **선수 지식:** [[확률]]',
      '',
      '## 1단계 — 먼저 잡을 핵심',
      '',
      '본문에서 [[확률]]을 사용한다.',
      '',
      '## 출처',
      '',
      '근거',
      '',
      '## 관련 항목',
      '',
      '[[확률]]',
      '',
    ].join('\n'),
  });
  const meta = document({ filename: 'overview', pageType: 'meta', body: '# overview\n' });

  const audit = auditFoundationalLearning([concept, source, meta]);
  const probability = audit.metrics.find((metric) => metric.document === concept);

  assert.equal(audit.nonMetaDocumentCount, 2);
  assert.equal(audit.formulaDocumentCount, 1);
  assert.equal(probability.incomingNarrativeLinks, 1);
  assert.equal(probability.formulaBlocks, 1);
  assert.equal(audit.masteryPracticeHeadingCount, 1);
  assert.equal(audit.fadedPracticeHeadingCount, 1);
  assert.equal(audit.transferPracticeHeadingCount, 1);
  assert.equal(audit.errorDiagnosisHeadingCount, 1);
  assert.equal(audit.solutionRubricHeadingCount, 1);
  assert.match(renderFoundationalLearningAudit(audit), /\[\[확률\]\]/);
  assert.match(renderFoundationalLearningAudit(audit), /마스터리 연습/);
});
