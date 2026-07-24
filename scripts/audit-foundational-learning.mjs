import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { rootDir, wikiDir } from './lib/project-paths.mjs';
import {
  collator,
  createWikiLookup,
  extractWikiLinks,
  loadMarkdownDocuments,
  markdownBeforeFinalH2,
} from './lib/wiki-utils.mjs';

const reportPath = path.join(rootDir, 'docs', 'foundational-learning-audit.md');
const pageTypeOrder = ['concept', 'source', 'reference', 'entity', 'analysis', 'meta'];
const difficultyOrder = ['입문', '중급', '심화', '미지정'];

function pageTypeOf(document) {
  return String(document.data?.page_type ?? '');
}

function titleOf(document) {
  return String(document.data?.title ?? document.filename ?? '');
}

function idOf(document) {
  return String(document.data?.id ?? '');
}

function learningGuideValue(body = '', label = '') {
  const escapedLabel = String(label).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = String(body).match(new RegExp(`^>\\s*\\*\\*${escapedLabel}:\\*\\*\\s*(.*?)\\s*$`, 'm'));
  return String(match?.[1] ?? '').replace(/<br>\s*$/, '').trim();
}

export function countFormulaBlocks(markdown = '') {
  const text = String(markdown);
  const dollarBlocks = [...text.matchAll(/\$\$[\s\S]*?\$\$/g)].length;
  const bracketBlocks = [...text.matchAll(/\\\[[\s\S]*?\\\]/g)].length;
  return dollarBlocks + bracketBlocks;
}

function narrativeBody(body = '') {
  return markdownBeforeFinalH2(markdownBeforeFinalH2(String(body), '관련 항목'), '출처');
}

function countBy(items, keyOf) {
  const counts = new Map();
  for (const item of items) {
    const key = keyOf(item);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return counts;
}

function compareMetrics(left, right) {
  if (right.incomingNarrativeLinks !== left.incomingNarrativeLinks) {
    return right.incomingNarrativeLinks - left.incomingNarrativeLinks;
  }
  if (right.formulaBlocks !== left.formulaBlocks) return right.formulaBlocks - left.formulaBlocks;
  return collator.compare(titleOf(left.document), titleOf(right.document));
}

export function auditFoundationalLearning(documents = []) {
  const allDocuments = [...documents];
  const nonMetaDocuments = allDocuments.filter((document) => pageTypeOf(document) !== 'meta');
  const categoryRank = ['concept', 'source', 'reference', 'analysis', 'entity', 'meta'];
  const lookup = createWikiLookup(allDocuments, {
    titleOf,
    aliasesOf: (document) => document.data?.aliases,
    idOf,
    rankOf: (document) => categoryRank.indexOf(pageTypeOf(document)),
  });

  const incomingNarrativeLinks = new Map(nonMetaDocuments.map((document) => [document, 0]));
  const outgoingNarrativeLinks = new Map(nonMetaDocuments.map((document) => [document, 0]));

  for (const document of nonMetaDocuments) {
    const targets = new Set();
    for (const rawLink of extractWikiLinks(narrativeBody(document.body))) {
      const target = lookup.resolve(rawLink).document;
      if (!target || target === document || !incomingNarrativeLinks.has(target)) continue;
      targets.add(target);
    }
    outgoingNarrativeLinks.set(document, targets.size);
    for (const target of targets) {
      incomingNarrativeLinks.set(target, (incomingNarrativeLinks.get(target) ?? 0) + 1);
    }
  }

  const metrics = nonMetaDocuments.map((document) => {
    const body = String(document.body ?? '');
    return {
      document,
      pageType: pageTypeOf(document),
      difficulty: learningGuideValue(body, '난이도') || '미지정',
      prerequisites: learningGuideValue(body, '선수 지식'),
      formulaBlocks: countFormulaBlocks(body),
      incomingNarrativeLinks: incomingNarrativeLinks.get(document) ?? 0,
      outgoingNarrativeLinks: outgoingNarrativeLinks.get(document) ?? 0,
      hasFoundationHeading: /^### 먼저 알아야 할 기초 개념\s*$/m.test(body),
      hasMinimumExampleHeading: /^### 가장 작은 구체적 예\s*$/m.test(body),
      hasFormulaProtocolHeading: /^#### 수식이 답하려는 질문\s*$/m.test(body),
      hasMasteryPracticeHeading: /^### 마스터리 연습\s*$/m.test(body),
      hasFadedPracticeHeading: /^#### 부분 완성(?:\s|$)/m.test(body),
      hasTransferPracticeHeading: /^#### 새 수치 전이(?:\s|$)/m.test(body),
      hasErrorDiagnosisHeading: /^#### 오류 진단(?:\s|$)/m.test(body),
      hasSolutionRubricHeading: /^### 해설과 채점 기준\s*$/m.test(body),
    };
  });

  const formulaMetrics = metrics.filter((metric) => metric.formulaBlocks > 0);
  const pageTypeCounts = countBy(nonMetaDocuments, pageTypeOf);
  const difficultyCounts = countBy(metrics, (metric) => metric.difficulty);

  return {
    allDocumentCount: allDocuments.length,
    nonMetaDocumentCount: nonMetaDocuments.length,
    pageTypeCounts,
    difficultyCounts,
    learningGuideCount: metrics.filter((metric) => metric.difficulty !== '미지정' && metric.prerequisites).length,
    formulaDocumentCount: formulaMetrics.length,
    formulaBlockCount: formulaMetrics.reduce((total, metric) => total + metric.formulaBlocks, 0),
    foundationHeadingCount: metrics.filter((metric) => metric.hasFoundationHeading).length,
    minimumExampleHeadingCount: metrics.filter((metric) => metric.hasMinimumExampleHeading).length,
    formulaProtocolHeadingCount: metrics.filter((metric) => metric.hasFormulaProtocolHeading).length,
    masteryPracticeHeadingCount: metrics.filter((metric) => metric.hasMasteryPracticeHeading).length,
    fadedPracticeHeadingCount: metrics.filter((metric) => metric.hasFadedPracticeHeading).length,
    transferPracticeHeadingCount: metrics.filter((metric) => metric.hasTransferPracticeHeading).length,
    errorDiagnosisHeadingCount: metrics.filter((metric) => metric.hasErrorDiagnosisHeading).length,
    solutionRubricHeadingCount: metrics.filter((metric) => metric.hasSolutionRubricHeading).length,
    metrics,
    foundationCandidates: metrics
      .filter((metric) => metric.pageType === 'concept')
      .sort(compareMetrics)
      .slice(0, 20),
    formulaCandidates: formulaMetrics
      .sort((left, right) => {
        if (right.formulaBlocks !== left.formulaBlocks) return right.formulaBlocks - left.formulaBlocks;
        return compareMetrics(left, right);
      })
      .slice(0, 25),
  };
}

function tableCell(value = '') {
  return String(value).replaceAll('|', '\\|').replace(/\s+/g, ' ').trim();
}

function shortText(value = '', maximumLength = 72) {
  const text = tableCell(value);
  return text.length <= maximumLength ? text : `${text.slice(0, maximumLength - 1).trimEnd()}…`;
}

function wikiLink(metric) {
  return `[[${metric.document.filename}]]`;
}

function renderCountTable(order, counts, label) {
  const rows = order
    .filter((key) => (counts.get(key) ?? 0) > 0)
    .map((key) => `| ${label === '유형' ? `\`${key}\`` : key} | ${counts.get(key) ?? 0} |`);
  return [`| ${label} | 문서 수 |`, '| --- | ---: |', ...rows].join('\n');
}

function renderCandidateTable(candidates, { includeType = false, includePrerequisites = false } = {}) {
  const header = [
    '순위',
    '문서',
    ...(includeType ? ['유형'] : []),
    '서술 본문 유입 링크',
    '블록 수식',
    '난이도',
    ...(includePrerequisites ? ['선수 지식'] : []),
  ];
  const rows = candidates.map((metric, index) => [
    index + 1,
    wikiLink(metric),
    ...(includeType ? [`\`${metric.pageType}\``] : []),
    metric.incomingNarrativeLinks,
    metric.formulaBlocks,
    metric.difficulty,
    ...(includePrerequisites ? [shortText(metric.prerequisites || '미지정')] : []),
  ]);
  return [
    `| ${header.join(' | ')} |`,
    `| ${header.map(() => '---').join(' | ')} |`,
    ...rows.map((row) => `| ${row.map(tableCell).join(' | ')} |`),
  ].join('\n');
}

export function renderFoundationalLearningAudit(audit) {
  return [
    '# 비전공자 기초 학습 감사',
    '',
    '이 보고서는 `npm run learning:audit`가 현재 `wiki/` 문서에서 기계적으로 추출한 기준선이다. 유입 링크와 블록 수식 수는 우선 검토 후보를 찾는 신호일 뿐, 숨은 선수 지식·수식 유도·역사적 정확성의 수동 판정을 대신하지 않는다. 전체 판단 절차는 `docs/foundational-learning-workflow.md`를 따른다.',
    '',
    '## 1. 감사 범위',
    '',
    `- 전체 Markdown 문서: ${audit.allDocumentCount}개`,
    `- 비메타 문서: ${audit.nonMetaDocumentCount}개`,
    `- \`학습 안내\`에서 난이도와 선수 지식 문장을 모두 찾은 문서: ${audit.learningGuideCount}개`,
    `- 블록 수식이 있는 문서: ${audit.formulaDocumentCount}개`,
    `- 블록 수식 총수: ${audit.formulaBlockCount}개`,
    '',
    renderCountTable(pageTypeOrder, audit.pageTypeCounts, '유형'),
    '',
    renderCountTable(difficultyOrder, audit.difficultyCounts, '난이도'),
    '',
    '## 2. 새 학습 구조의 기준선',
    '',
    '| 확인 항목 | 문서 수 |',
    '| --- | ---: |',
    `| \`### 먼저 알아야 할 기초 개념\` H3가 있는 비메타 문서 | ${audit.foundationHeadingCount} |`,
    `| \`### 가장 작은 구체적 예\` H3가 있는 비메타 문서 | ${audit.minimumExampleHeadingCount} |`,
    `| \`#### 수식이 답하려는 질문\` H4가 있는 비메타 문서 | ${audit.formulaProtocolHeadingCount} |`,
    `| \`### 마스터리 연습\` H3가 있는 비메타 문서 | ${audit.masteryPracticeHeadingCount} |`,
    `| \`#### 부분 완성\` H4가 있는 비메타 문서 | ${audit.fadedPracticeHeadingCount} |`,
    `| \`#### 새 수치 전이\` H4가 있는 비메타 문서 | ${audit.transferPracticeHeadingCount} |`,
    `| \`#### 오류 진단\` H4가 있는 비메타 문서 | ${audit.errorDiagnosisHeadingCount} |`,
    `| \`### 해설과 채점 기준\` H3가 있는 비메타 문서 | ${audit.solutionRubricHeadingCount} |`,
    '',
    '0이라는 값은 기존 문서가 설명이나 문제가 없다는 뜻이 아니다. 새 종합 워크플로가 요구하는 명시적 선수 지식·최소 예·수식 해설·전이 연습·오답 교정 표지가 아직 전면 적용되지 않았다는 뜻이다.',
    '',
    '## 3. 우선 검토할 기준 개념 후보',
    '',
    '아래 표는 서술 본문에서 많이 참조되고 수식을 포함한 concept를 우선 배치한다. 실제 개편 전에는 해당 문서와 원 근거, 선수 관계를 읽어 독립 기초 문서로서의 가치와 범위를 수동 판정한다.',
    '',
    renderCandidateTable(audit.foundationCandidates, { includePrerequisites: true }),
    '',
    '## 4. 수식 해설 우선 후보',
    '',
    '블록 수식 수가 많고 다른 서술 문서에서 참조되는 문서를 먼저 확인한다. 수가 많다는 이유만으로 문서 전체를 재작성하지 않으며, 핵심 수식과 보조식을 먼저 구분한다.',
    '',
    renderCandidateTable(audit.formulaCandidates, { includeType: true, includePrerequisites: true }),
    '',
    '## 5. 수동 감사 순서',
    '',
    '1. 3장의 기준 개념 후보에서 하나의 의존 경로를 선택한다.',
    '2. 후보 문서와 연결된 source·entity·analysis를 처음부터 끝까지 읽는다.',
    '3. 최초 전문용어, 기호, 수식과 필요한 배경을 `필수·국소`, `필수·독립`, `선택·심화`로 나눈다.',
    '4. 가장 기초적인 concept부터 문제의 배경, 최소 예, 핵심 수식, 한계와 다음 경로를 보강한다.',
    '5. 연결 문서를 의존 관계순으로 개편하고, 마지막에 index·overview·log와 사이트를 검증한다.',
    '',
    '## 6. 자동 감사의 한계',
    '',
    '- 위키 링크 유입 수는 중요도나 교육적 필요를 증명하지 않는다.',
    '- 문서에 없는 숨은 선수 지식, 순환 정의, 비유의 과장과 수식 유도의 누락은 사람이 읽어 판정한다.',
    '- 마스터리 표지는 연습·해설 절의 존재만 확인한다. 새 문제의 난이도, 정답의 정확성, 실제 전이 능력은 수동으로 검토한다.',
    '- 블록 수식 수에는 인라인 수식과 표 안의 표현이 포함되지 않는다.',
    '- 제목이 같은 문서, 표시명 링크와 alias는 기존 위키 해석 규칙으로 해소하지만, 실제 학습 순서는 수동으로 검토한다.',
    '- 새 사실, 새 역사 해석 또는 수식 오류 정정은 기존 evidence가 아니라 원 근거와 locator로 재확인한다.',
    '',
  ].join('\n');
}

function parseMode(argumentsList) {
  if (argumentsList.length === 0) return 'stdout';
  if (argumentsList.length === 1 && argumentsList[0] === '--write') return 'write';
  if (argumentsList.length === 1 && argumentsList[0] === '--check') return 'check';
  throw new Error('usage: node scripts/audit-foundational-learning.mjs [--write|--check]');
}

export async function runFoundationalLearningAudit({ mode = 'stdout' } = {}) {
  const documents = await loadMarkdownDocuments(wikiDir);
  const report = renderFoundationalLearningAudit(auditFoundationalLearning(documents));

  if (mode === 'stdout') return { report, reportPath, changed: false };
  if (mode === 'write') {
    await fs.writeFile(reportPath, report, 'utf8');
    return { report, reportPath, changed: true };
  }
  if (mode === 'check') {
    const existing = await fs.readFile(reportPath, 'utf8').catch((error) => {
      if (error.code === 'ENOENT') return '';
      throw error;
    });
    if (existing !== report) throw new Error(`${path.relative(rootDir, reportPath)} is stale; run npm run learning:audit.`);
    return { report, reportPath, changed: false };
  }
  throw new Error(`unknown mode: ${mode}`);
}

const currentPath = fileURLToPath(import.meta.url);
const invokedPath = process.argv[1] ? path.resolve(process.argv[1]) : '';

if (currentPath === invokedPath) {
  try {
    const mode = parseMode(process.argv.slice(2));
    const result = await runFoundationalLearningAudit({ mode });
    if (mode === 'stdout') process.stdout.write(result.report);
    else console.log(`${path.relative(rootDir, result.reportPath)}: ${mode === 'write' ? 'written' : 'current'}`);
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
