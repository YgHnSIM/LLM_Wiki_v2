---
schema_version: 3
id: concept.glue-superglue
page_type: concept
title: GLUE와 SuperGLUE
aliases:
  - GLUE
  - SuperGLUE
  - General Language Understanding Evaluation
  - 언어 이해 평가 벤치마크
tags:
  - type/concept
  - domain/ai
  - domain/nlp
  - domain/machine-learning
created: '2026-07-20'
updated: '2026-07-22'
editorial_status: active
review:
  evidence_coverage: verified
  content_mode: descriptive
artifacts:
  - raw/060_GLUE and SuperGLUE Standardized Evaluation for Language Understanding.ko.md
  - raw/060_GLUE and SuperGLUE Standardized Evaluation for Language Understanding.commentary.ko.md
  - raw/095_BIG-bench and MMLU Comprehensive Evaluation Benchmarks for Large Language Models.ko.md
  - raw/095_BIG-bench and MMLU Comprehensive Evaluation Benchmarks for Large Language Models.commentary.ko.md
evidence:
  - source_id: wang-et-al-2018-glue
    locator: pp. 353–355와 Table 1의 아홉 task·metric·domain·자료량·private test와 diagnostic platform
    relation: supports
  - source_id: nangia-bowman-2019-human-glue
    locator: §§1–4와 Tables 1–2의 비전문가 인간 성능 추정·aggregate 87.1과 task별 차이
    relation: contextualizes
  - source_id: wang-et-al-2019-superglue
    locator: §§1–3과 Tables 1–3의 여덟 task·metric·human baseline·toolkit·leaderboard rule
    relation: supports
  - source_id: hendrycks-et-al-2021-mmlu
    locator: '§§1·3–5와 Table 1·Appendices A–B의 GLUE·SuperGLUE 포화 문제, 57개 학술·전문 과목·5-shot·객관식 집계와 prompt·오염 한계'
    relation: contextualizes
  - source_id: big-bench-authors-2023
    locator: '§§1–3·6의 204개 JSON/programmatic task, task별 preferred metric 정규화, BBL 24개와 prompt·coverage·오염 한계'
    relation: contextualizes
relations:
  - target: source.060
    kind: related
  - target: concept.helm
    kind: related
  - target: concept.big-bench-mmlu
    kind: related
  - target: source.051
    kind: related
learning:
  difficulty:
    entry: intermediate
    target: intermediate
  prerequisites:
    - target: concept.bert
  assumed_knowledge: 와 기본 분류 평가 지표
  outcomes:
    - 여러 과제의 서로 다른 metric이 aggregate로 묶이는 과정과 benchmark 점수의 해석 한계를 설명할 수 있다.
  next:
    - target: source.079
      reason: 079HELM과 다차원 언어 모델 평가 — 공통 평가 좌표를 시나리오·적응·다중 메트릭으로 확장한 설계를 살핀다.
    - target: source.095
      reason: 095BIG-bench와 MMLU의 평가 범위·집계 경계 — 과목 수를 늘린 MMLU와 task·metric 형식을 넓힌 BIG-bench의 서로 다른 확장을 비교한다.
---
# GLUE와 SuperGLUE

> [!note] 학습 안내
> **난이도:** 중급<br>
> **선수 지식:** [[concept.bert|BERT]]<br>
> **읽고 나면:** 여러 과제의 서로 다른 metric이 aggregate로 묶이는 과정과 benchmark 점수의 해석 한계를 설명할 수 있다.

## 1단계 — 먼저 잡을 핵심

[[GLUE와 SuperGLUE]]는 여러 영어 자연어 이해 dataset을 공통 data format·metric·test server·leaderboard로 묶은 benchmark suite다. GLUE는 2018년 아홉 task, SuperGLUE는 2019년 더 어려운 여덟 task를 제시했다.

## 2단계 — 작동 원리

### 과제별 평가에서 공통 순위까지

각 과제는 목적에 맞는 metric으로 예측을 채점한다. 복수 metric이 있는 과제는 먼저 평균하고, 과제별 점수를 다시 평균해 aggregate를 만든다. 중앙 test server와 leaderboard는 이 값을 공통 비교 좌표로 제공하지만 세부 능력은 per-task 결과에서 확인해야 한다.

## 3단계 — 기술과 근거

### GLUE 구성

GLUE는 CoLA·SST-2·MRPC·STS-B·QQP·MNLI·QNLI·RTE·WNLI를 포함한다. train 자료는 WNLI 634개부터 MNLI 약 393k까지 크게 달랐다. 적은 자료와 domain mismatch를 포함해 사전 학습 표현의 sample-efficient transfer를 평가하려 했다.

네 task에는 private test data가 있었고 evaluation server가 결과를 계산했다. diagnostic set은 별도의 NLI 예시에서 lexical semantics·predicate–argument·logic·world knowledge 현상을 분석했다.

### aggregate 계산

각 task는 목적에 맞는 metric을 쓴다. 복수 metric task의 평균과 task 사이 평균으로 GLUE score를 만든다. 이는 다음을 뜻한다.

- 모든 task가 거의 같은 비중을 갖는다.
- dataset size나 human gap이 weight가 되지 않는다.
- MCC·accuracy·F1·correlation의 1점이 같은 측정 단위라는 보장은 없다.
- aggregate만으로는 어느 능력이 강하거나 약한지 알 수 없다.

per-task 결과와 model·data·compute 조건을 함께 보고해야 한다.

### SuperGLUE 구성

SuperGLUE는 BoolQ·CB·COPA·MultiRC·ReCoRD·RTE·WiC·WSC를 포함한다. GLUE에서 어려웠던 RTE와 Winograd 계열을 유지·개선하고, yes/no QA·causal multiple choice·multi-sentence QA·reading comprehension·word sense·coreference로 형식을 넓혔다.

모든 task에 human baseline을 추정했고 strong BERT baseline과 상당한 gap을 확인했다. modular toolkit과 leaderboard usage rule도 개선했다.

## 검증과 한계

### 인간 비교의 해석

GLUE human 87.1은 2019년 비전문가 annotator로 얻은 보수적 추정이다. 같은 시기 model aggregate가 88.4에 도달했지만 모든 task와 현상에서 인간을 넘은 것은 아니다.

human baseline은 annotator expertise, instruction, adjudication, sample에 조건화된다. 모델과 사람의 자료 접근·반복 가능성·시간도 다를 수 있다. 하나의 평균 교차를 일반 지능의 문턱으로 보지 않는다.

### benchmark의 효용과 위험

효용:

- 다른 연구진이 같은 test·metric으로 결과를 비교할 수 있다.
- 여러 task의 전이 성능을 한 표에서 본다.
- private label과 중앙 server가 직접 test tuning을 줄인다.
- per-task·diagnostic 결과가 약한 현상을 드러낸다.

위험:

- aggregate가 task별 약점과 uncertainty를 숨긴다.
- annotation artifact·shortcut이 높은 점수를 만들 수 있다.
- repeated benchmark development가 suite 수준 overfitting을 낳는다.
- pretraining corpus contamination을 private label만으로 막지 못한다.
- 영어·분류 중심 coverage가 실제 다언어·생성·대화 능력을 대표하지 않는다.

### 포화 이후

SuperGLUE는 GLUE 포화에 대한 직접 대응이었다. 후대 [[BIG-bench와 MMLU]]·[[HELM]]·다언어·domain suite는 서로 다른 방식으로 범위를 넓혔다. MMLU는 57개 학술·전문 과목을 같은 사지선다 형식과 최대 5-shot prompt에 놓았고, BIG-bench는 204개 이상의 JSON·programmatic task에 서로 다른 preferred metric을 허용한 뒤 low/high 정규화 평균을 만들었다. `더 많은 과목`과 `더 다양한 task API`는 같은 확장이 아니다.

HELM은 다시 prompt와 few-shot 조건을 adaptation으로 분리하고 정확도 밖의 보정·강건성·공정성·편향·독성·효율성을 병렬로 남겼다. 이 계보는 GLUE→SuperGLUE→MMLU/BIG-bench→HELM이라는 단일 교체 순서가 아니다. Benchmark를 늘리거나 평가 열을 늘리는 것만으로 측정 validity가 자동 개선되지는 않으며 task construction, subset, human baseline, contamination audit, prompt·scoring와 deployment 조건을 계속 공개해야 한다.

## 학습 확인

### 확인 질문

1. GLUE와 SuperGLUE는 어떤 평가 요소를 하나의 suite로 묶는가?
2. 복수 metric과 여러 과제의 점수는 어떤 순서로 aggregate가 되는가?
3. 인간 baseline이나 높은 aggregate를 일반 언어 이해의 완전한 측정으로 볼 수 없는 이유는 무엇인가?

### 다음 문서

- [[source.079|HELM과 다차원 언어 모델 평가]] — 079HELM과 다차원 언어 모델 평가 — 공통 평가 좌표를 시나리오·적응·다중 메트릭으로 확장한 설계를 살핀다.
- [[source.095|BIG-bench와 MMLU의 평가 범위·집계 경계]] — 095BIG-bench와 MMLU의 평가 범위·집계 경계 — 과목 수를 늘린 MMLU와 task·metric 형식을 넓힌 BIG-bench의 서로 다른 확장을 비교한다.

## 출처

- [[060_GLUE와 SuperGLUE의 집계 평가]]
- [[079_HELM과 다차원 언어 모델 평가]]
- [[095_BIG-bench와 MMLU의 평가 범위·집계 경계]]
- Alex Wang 외, [GLUE: A Multi-Task Benchmark and Analysis Platform for Natural Language Understanding](https://aclanthology.org/W18-5446/), BlackboxNLP 2018.
- Nikita Nangia·Samuel R. Bowman, [Human vs. Muppet](https://aclanthology.org/P19-1449/), ACL 2019.
- Alex Wang 외, [SuperGLUE: A Stickier Benchmark for General-Purpose Language Understanding Systems](https://proceedings.neurips.cc/paper/2019/hash/4496bf24afe7fab6f046bf4923da8de6-Abstract.html), NeurIPS 2019.
- Dan Hendrycks 외, [Measuring Massive Multitask Language Understanding](https://arxiv.org/abs/2009.03300), arXiv 2020; ICLR 2021, §§1·3–5.
- BIG-bench authors, [Beyond the Imitation Game](https://arxiv.org/abs/2206.04615), arXiv 2022; TMLR 2023, §§1–3·6.

## 관련 항목

- [[source.079|HELM과 다차원 언어 모델 평가]]
- [[source.095|BIG-bench와 MMLU의 평가 범위·집계 경계]]
- [[concept.bert|BERT]]
- [[source.060|GLUE와 SuperGLUE의 집계 평가]]
- [[concept.helm|HELM]]
- [[concept.big-bench-mmlu|BIG-bench와 MMLU]]
- [[source.051|SQuAD와 추출형 독해 평가]]
