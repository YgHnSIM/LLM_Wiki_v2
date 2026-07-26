---
schema_version: 3
id: concept.rouge
page_type: concept
title: ROUGE
aliases:
  - Recall-Oriented Understudy for Gisting Evaluation
  - ROUGE 평가
  - ROUGE 지표
tags:
  - type/concept
  - domain/ai
  - domain/nlp
  - domain/machine-learning
created: '2026-07-18'
updated: '2026-07-21'
editorial_status: active
review:
  evidence_coverage: verified
  content_mode: descriptive
artifacts:
  - raw/037_ROUGE and METEOR Task-Specific and Semantically-Aware Evaluation Metrics.ko.md
  - raw/037_ROUGE and METEOR Task-Specific and Semantically-Aware Evaluation Metrics.commentary.ko.md
evidence:
  - source_id: lin-2004-rouge
    locator: 'pp. 74–81의 ROUGE-N·L·W·S/SU 정의, DUC 2001–2003 상관·bootstrap 평가와 과제별 결론'
    relation: supports
relations:
  - target: source.037
    kind: related
  - target: source.033
    kind: related
learning:
  difficulty:
    entry: intermediate
    target: intermediate
  prerequisites:
    - target: concept.bleu
  assumed_knowledge: 없음
  outcomes:
    - ROUGE-N과 L·W·S·SU가 참조 요약의 서로 다른 표면 대응을 세는 방식과 적용 한계를 설명할 수 있다.
  next:
    - target: concept.meteor
      reason: METEOR — n-gram 재현율과 달리 단어를 일대일 정렬하고 어순 벌점을 주는 평가를 비교한다.
---
# ROUGE

> [!note] 학습 안내
> **난이도:** 중급<br>
> **선수 지식:** [[concept.bleu|BLEU]]<br>
> **읽고 나면:** ROUGE-N과 L·W·S·SU가 참조 요약의 서로 다른 표면 대응을 세는 방식과 적용 한계를 설명할 수 있다.

## 1단계 — 먼저 잡을 핵심

ROUGE(Recall-Oriented Understudy for Gisting Evaluation)는 자동 요약과 인간 참조 요약의 n-gram·부분수열·순서 보존 단어 쌍 중첩을 측정하는 자동 평가 지표군이다. Chin-Yew Lin이 2004년 ROUGE-N·L·W·S를 함께 기술하고 DUC 2001–2003 인간 content coverage와의 상관을 평가했다.

## 2단계 — 작동 원리

### ROUGE-N

ROUGE-N은 참조 쪽 n-gram을 분모로 삼는 recall 관련 지표다.

$$
\operatorname{ROUGE\text{-}N}
=\frac{
\sum_{S\in References}\sum_{g\in S}Count_{match}(g)
}{
\sum_{S\in References}\sum_{g\in S}Count(g)
}
$$

ROUGE-1은 unigram, ROUGE-2는 bigram의 참조 포괄을 본다. [[BLEU]]의 중심 통계가 후보 쪽 수정 n-gram precision인 것과 정규화 방향이 다르다. 그렇다고 ROUGE가 원문 중요도를 직접 판별하는 것은 아니다. 사람이 만든 참조에 포함된 표현을 중요 내용의 대리물로 사용한다.

### 다른 변형

- **ROUGE-L**: 최장 공통 부분수열(LCS)의 recall과 precision을 F-measure로 결합한다. 연속하지 않아도 순서가 같아야 한다.
- **ROUGE-W**: 길게 연속한 일치를 더 높게 평가하는 weighted LCS다.
- **ROUGE-S**: 떨어져 있어도 순서를 지키는 skip-bigram의 recall·precision을 센다.
- **ROUGE-SU**: skip-bigram에 unigram을 더해 단어 쌍 일치가 없을 때 모두 0이 되는 문제를 완화한다.

따라서 ROUGE 전체를 “참조 길이로 나눈 단일 recall 점수”라고 부르지 않는다. 지표 이름과 함께 $N$, 최대 skip 거리, stemming·불용어·참조 집계와 precision·recall·F1 중 무엇을 보고했는지 밝혀야 한다.

## 3단계 — 기술과 근거

### 평가 범위

원 논문은 10–400단어의 단일·다중 문서 DUC 과제에서 시스템 평균 ROUGE와 인간 content coverage의 Pearson·Spearman·Kendall 상관을 분석하고 bootstrap 신뢰구간을 계산했다. 단일 문서 100단어 요약에서는 ROUGE-2·L·W·S, 매우 짧은 요약에서는 ROUGE-1·L·W·SU 일부가 잘 작동했다. 다중 문서 자료에서는 상관이 더 불안정했고 특정 100단어 설정에서 L·W가 잘 작동하지 않았다.

이 결과는 어떤 ROUGE 변형도 모든 요약 과제에서 인간 판단을 대체하지 않음을 보여 준다. 출력 길이, 참조 수, 토큰화, 불용어·stemming과 표본 수가 점수와 상관에 영향을 준다.

## 검증과 한계

### 한계

- 참조에 없는 정당한 바꿔쓰기와 핵심 정보를 놓칠 수 있다.
- 참조와 많이 겹쳐도 원문과 모순되거나 사실이 틀린 요약을 직접 판별하지 못한다.
- recall만 보고 길이를 제한하지 않으면 장황한 출력이 유리할 수 있다.
- 국소 중첩·순서가 담화 일관성, 가독성, 유용성을 보장하지 않는다.
- 서로 다른 구현·전처리·집계 방식의 점수는 직접 비교할 수 없다.

빠르고 재현 가능한 표면 중첩 기준선으로는 유용하지만, 요약 사실성·정보 선택·문장 품질과 인간 효용은 별도 지표와 평가로 보완한다.

## 학습 확인

### 확인 질문

1. ROUGE-N이 BLEU의 중심 통계와 다른 방향으로 n-gram을 정규화하는 방식은 무엇인가?
2. ROUGE-L·W·S·SU는 연속성, 순서와 unigram 보완을 어떻게 다르게 계산하는가?
3. 높은 ROUGE 중첩이 원문 사실성, 담화 일관성이나 인간 효용을 보장하지 않는 이유는 무엇인가?

### 다음 문서

- [[concept.meteor|METEOR]] — n-gram 재현율과 달리 단어를 일대일 정렬하고 어순 벌점을 주는 평가를 비교한다.

## 출처

- Chin-Yew Lin, [ROUGE: A Package for Automatic Evaluation of Summaries](https://aclanthology.org/W04-1013/), 2004, pp. 74–81.
- [[037_ROUGE와 METEOR의 과제별 생성 텍스트 평가]]
- 프로젝트 보존 자료: `raw/037_ROUGE and METEOR Task-Specific and Semantically-Aware Evaluation Metrics.ko.md`, `raw/037_ROUGE and METEOR Task-Specific and Semantically-Aware Evaluation Metrics.commentary.ko.md`.

## 관련 항목

- [[concept.meteor|METEOR]]
- [[concept.bleu|BLEU]]
- [[source.037|ROUGE와 METEOR의 과제별 생성 텍스트 평가]]
- [[source.033|BLEU와 기계 번역 자동 평가]]
