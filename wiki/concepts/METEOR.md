---
schema_version: 3
id: concept.meteor
page_type: concept
title: METEOR
aliases:
  - Metric for Evaluation of Translation with Explicit ORdering
  - METEOR 평가
  - METEOR 지표
tags:
  - type/concept
  - domain/ai
  - domain/nlp
  - domain/machine-learning
  - domain/linguistics
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
  - source_id: lavie-sagae-jayaraman-2004-recall
    locator: pp. 134–143의 recall 가중 조화평균·stemming 선행 실험과 시스템 수준 인간 상관
    relation: contextualizes
  - source_id: banerjee-lavie-2005-meteor
    locator: 'pp. 65–72의 단계별 unigram 정렬·Fmean·chunk 벌점, TIDES 2003 문장별 상관과 mapping module 절제 실험'
    relation: supports
relations:
  - target: source.037
    kind: related
  - target: concept.rouge
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
    - 'METEOR의 우선순위 단어 정렬, recall 가중 점수와 chunk 벌점이 무엇을 측정하고 놓치는지 설명할 수 있다.'
  next:
    - target: concept.wordnet
      reason: WordNet — METEOR의 synonym 모듈이 사용하는 synset 관계와 문맥 의미 판별의 차이를 살핀다.
    - target: concept.최소-오류율-훈련
      reason: 최소 오류율 훈련 — 자동 평가 지표를 개발 집합 최적화 목표로 사용할 때 생기는 유인과 한계를 살핀다.
---
# METEOR

> [!note] 학습 안내
> **난이도:** 중급<br>
> **선수 지식:** [[concept.bleu|BLEU]]<br>
> **읽고 나면:** METEOR의 우선순위 단어 정렬, recall 가중 점수와 chunk 벌점이 무엇을 측정하고 놓치는지 설명할 수 있다.

## 1단계 — 먼저 잡을 핵심

METEOR(Metric for Evaluation of Translation with Explicit ORdering)는 후보 번역과 인간 참조 번역의 unigram을 명시적으로 정렬하고 precision·recall과 어순 단편화 벌점을 결합하는 자동 기계 번역 평가 지표다. 2004년 recall·stemming 선행 연구를 바탕으로 Banerjee·Lavie가 2005년 정식 구조와 평가를 발표했다.

## 2단계 — 작동 원리

### 단계별 정렬

2005년 기본 구성은 아직 연결되지 않은 단어에 다음 모듈을 순서대로 적용했다.

1. 표면형이 같은 **exact** 대응
2. Porter stem이 같은 **stem** 대응
3. 가능한 sense 하나라도 [[WordNet]]의 같은 synset에 속하는 **synonymy** 대응

각 단어는 상대 문장의 단어 최대 하나와만 연결된다. 각 단계에서 최대 수의 대응을 만들고, 같은 크기라면 정렬선 crossing이 가장 적은 것을 고른다. 단계 순서는 exact를 stem과 synonym보다 우선하는 효과를 낸다.

WordNet 모듈은 문맥 속 단어 의미를 disambiguation하지 않는다. 가능한 sense 하나의 synset이 겹치면 대응하므로 문맥상 다른 뜻을 연결할 수 있고, WordNet coverage가 낮은 언어·도메인에서는 사용할 수 있는 정보가 줄어든다.

점수를 낼 때는 이 정렬에서 일치한 단어 수로 precision과 recall을 구하고, 같은 순서로 이어진 대응이 얼마나 잘게 끊겼는지를 벌점으로 반영한다.

## 3단계 — 기술과 근거

### 점수

후보 길이를 $|h|$, 참조 길이를 $|r|$, 정렬된 unigram 수를 $m$이라 하면 다음과 같다.

$$
P=\frac{m}{|h|},\qquad R=\frac{m}{|r|}
$$

2005년 $F_{mean}$은 recall을 더 강하게 반영한다.

$$
F_{mean}=\frac{10PR}{R+9P}
$$

정렬된 단어가 후보와 참조에서 같은 순서로 연속하는 최소 청크 수를 $ch$라 하면 다음을 적용한다.

$$
Penalty=0.5\left(\frac{ch}{m}\right)^3,
\qquad
METEOR=(1-Penalty)F_{mean}
$$

청크 벌점은 대응 단어가 얼마나 흩어지고 재배열됐는지를 근사한다. 문법성·유창성 전체를 직접 측정하지 않는다. 참조가 여러 개면 각각 독립적으로 점수를 계산한 뒤 가장 높은 참조를 고른다.

### 원 평가의 범위

TIDES 2003의 아랍어→영어 664문장과 중국어→영어 920문장, 문장별 영어 참조 네 개를 사용했다. 두 평가자의 adequacy·fluency 평균과 METEOR의 문장별 Pearson 상관을 시스템마다 구해 평균하면 아랍어 0.347, 중국어 0.331이었다. 인간 점수를 정규화하면 0.403과 0.365였다.

exact만 쓴 상관보다 Porter stem과 WordNet synonym을 차례로 추가한 상관이 높았지만 개선 폭은 이 두 자료와 당시 시스템에 조건부다. 시스템 수준 0.964 상관은 중국어 시스템 일곱 점을 집계한 결과이므로 문장 수준이나 다른 언어쌍에 그대로 적용하지 않는다.

## 검증과 한계

### 한계

- 후보·참조만 비교하므로 원문 의미 보존과 사실성을 직접 확인하지 않는다.
- 가능한 WordNet sense의 겹침은 문맥 의미 동등성을 보장하지 않는다.
- 형태·동의어 자원의 언어·도메인 coverage에 의존한다.
- 어휘 대응을 넘어선 긴 문맥, 담화, 문체와 사용자 효용을 충분히 측정하지 않는다.
- 2005년 벌점·조합 식은 개발 자료의 경험적 선택이며 당시 최적 학습된 보편값이 아니다.
- 지표와 인간 판단의 상관은 평가 자료, 시스템 범위, 집계 단위와 인간 평가 신뢰도에 따라 달라진다.

후대 METEOR 버전은 모듈 가중치·매개변수·언어 지원을 확장했으므로 버전이 다른 점수를 같은 정의로 취급하지 않는다.

## 학습 확인

### 확인 질문

1. 2005년 METEOR가 exact, stem, WordNet synonym 대응을 이 순서로 적용하는 이유는 무엇인가?
2. 정렬된 unigram 수에서 precision·recall, $F_{mean}$과 chunk 벌점으로 이어지는 계산은 어떻게 구성되는가?
3. WordNet 대응과 높은 시스템 수준 상관이 문맥 의미나 다른 언어·자료의 인간 판단을 보장하지 않는 이유는 무엇인가?

### 다음 문서

- [[concept.wordnet|WordNet]] — METEOR의 synonym 모듈이 사용하는 synset 관계와 문맥 의미 판별의 차이를 살핀다.
- [[concept.최소-오류율-훈련|최소 오류율 훈련]] — 자동 평가 지표를 개발 집합 최적화 목표로 사용할 때 생기는 유인과 한계를 살핀다.

## 출처

- Alon Lavie·Kenji Sagae·Shyamsundar Jayaraman, [The Significance of Recall in Automatic Metrics for MT Evaluation](https://aclanthology.org/2004.amta-papers.16/), 2004, pp. 134–143.
- Satanjeev Banerjee·Alon Lavie, [METEOR: An Automatic Metric for MT Evaluation with Improved Correlation with Human Judgments](https://aclanthology.org/W05-0909/), 2005, pp. 65–72.
- [[037_ROUGE와 METEOR의 과제별 생성 텍스트 평가]]
- 프로젝트 보존 자료: `raw/037_ROUGE and METEOR Task-Specific and Semantically-Aware Evaluation Metrics.ko.md`, `raw/037_ROUGE and METEOR Task-Specific and Semantically-Aware Evaluation Metrics.commentary.ko.md`.

## 관련 항목

- [[concept.wordnet|WordNet]]
- [[concept.최소-오류율-훈련|최소 오류율 훈련]]
- [[concept.bleu|BLEU]]
- [[source.037|ROUGE와 METEOR의 과제별 생성 텍스트 평가]]
- [[concept.rouge|ROUGE]]
- [[source.033|BLEU와 기계 번역 자동 평가]]
