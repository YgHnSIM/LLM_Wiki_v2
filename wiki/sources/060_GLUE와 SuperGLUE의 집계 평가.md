---
schema_version: 2
id: source.060
page_type: source
title: GLUE와 SuperGLUE의 집계 평가
aliases:
  - 059_GLUE and SuperGLUE Standardized Evaluation for Language Understanding
  - SuperGLUE A Stickier Benchmark
tags:
  - type/source
  - domain/ai
  - domain/nlp
  - domain/machine-learning
created: '2026-07-20'
updated: '2026-07-21'
lifecycle: active
verification: verified
artifacts:
  - 'raw/059_GLUE and SuperGLUE Standardized Evaluation for Language Understanding.ko.md'
  - 'raw/059_GLUE and SuperGLUE Standardized Evaluation for Language Understanding.commentary.ko.md'
evidence:
  - source_id: wang-et-al-2018-glue
    locator: '초록과 pp. 353–355의 아홉 과제·자료량·domain·private test·diagnostic set·baseline 설계'
    relation: supports
  - source_id: nangia-bowman-2019-human-glue
    locator: '초록과 §§1–4의 GLUE 비전문가 인간 성능 추정 절차·87.1 aggregate와 과제별 결과'
    relation: contextualizes
  - source_id: wang-et-al-2019-superglue
    locator: '초록과 §§1–3, Tables 1–3의 여덟 과제·metric·human baseline·leaderboard 설계와 GLUE 포화 근거'
    relation: supports
related:
  - concept.glue-superglue
  - concept.helm
  - concept.bert
  - source.051
  - source.079
  - analysis.평가-지표와-모델-유인
  - analysis.튜링-테스트와-llm-평가
---
# GLUE와 SuperGLUE의 집계 평가

> [!note] 학습 안내
> **난이도:** 중급<br>
> **선수 지식:** [[BERT]]와 분류·회귀 평가 지표의 기초<br>
> **읽고 나면:** GLUE와 SuperGLUE가 여러 과제를 한 집계 점수로 비교하는 방식과 그 점수가 숨기는 조건을 설명할 수 있다.

## 1단계 — 먼저 잡을 핵심

059 raw는 GLUE와 SuperGLUE가 표준화된 종합 평가로 언어 AI 모델 비교를 바꿨다고 설명한다. 이 평가는 중요했지만 원문은 GLUE score의 가중 방식, multi-task model 요구, 인간 기준선의 출처, SuperGLUE의 출력 형식과 선행 benchmark 계보를 부정확하게 넓힌다. 공개 문서는 [[GLUE와 SuperGLUE]]가 실제로 표준화한 것과 한 숫자가 숨기는 것을 함께 검증한다.

### 핵심 문장

- GLUE는 아홉 기존 영어 NLU task, diagnostic set, 중앙 평가와 leaderboard를 결합했다.
- aggregate는 난이도 가중값이 아니라 서로 다른 task metric의 평균이다.
- human 87.1은 2019년 별도 비전문가 추정이며 전 task 인간 초월을 뜻하지 않는다.
- SuperGLUE는 여덟 더 어려운 task와 형식을 제시했지만 일반 이해 전체의 완전한 시험은 아니다.
- 표준화는 비교 가능성을 높이지만 training 조건·contamination·shortcut·aggregate masking을 제거하지 않는다.

## 2단계 — 작동 원리

### 제출에서 집계까지

연구자는 각 과제의 정해진 입력과 metric에 맞춰 예측을 제출하고 중앙 server에서 test 결과를 받는다. 복수 metric이 있는 과제는 먼저 그 값을 평균하고, 이어 과제별 점수를 다시 평균해 aggregate를 만든다. 전체 점수는 공통 비교 좌표를 주지만 과제별 약점과 서로 다른 훈련 조건은 별도로 읽어야 한다.

## 3단계 — 기술과 근거

### GLUE가 묶은 것

GLUE는 새 dataset 하나가 아니라 기존 영어 NLU dataset 아홉 개, expert diagnostic set, data format·evaluation server·leaderboard를 묶은 suite다.

| 범주 | 과제 | 입력·목표 | 주 metric |
|---|---|---|---|
| 단일 문장 | CoLA | 문법 수용성 이진 분류 | Matthews correlation coefficient |
| 단일 문장 | SST-2 | 영화 review 감성 이진 분류 | accuracy |
| 유사도·paraphrase | MRPC | news 문장쌍 paraphrase | accuracy·F1 |
| 유사도·paraphrase | STS-B | 문장쌍 의미 유사도 회귀 | Pearson·Spearman correlation |
| 유사도·paraphrase | QQP | Quora 질문쌍 중복 | accuracy·F1 |
| 추론 | MNLI | 여러 genre의 entailment·contradiction·neutral | matched·mismatched accuracy |
| 추론 | QNLI | SQuAD 질문–문장의 answer 포함 관계를 이진 NLI로 재구성 | accuracy |
| 추론 | RTE | 여러 textual entailment 자료의 이진 분류 | accuracy |
| 추론 | WNLI | Winograd 자료를 NLI 형식으로 재구성 | accuracy |

QNLI는 자유 답 생성 [[추출형 질의응답]]이 아니다. 질문에 대한 답이 특정 문장에 포함되는지를 분류하도록 SQuAD를 다시 만들었다. WNLI는 원 자료의 train/test label 구성 문제로 모델이 majority baseline을 넘기 어려워 해석에 특히 주의가 필요했다.

### 표준화가 보장하는 범위

모든 제출은 같은 task 정의와 test metric을 사용한다. 네 과제는 private test data를 사용해 정답 label을 직접 보고 조정하기 어렵게 했다. 중앙 server와 leaderboard는 서로 다른 논문의 결과를 공통 좌표에 놓았다.

그러나 GLUE는 하나의 shared multi-task model을 강제하지 않았다. task마다 별도 모델을 fine-tune해도 제출할 수 있었다. 추가 pretraining corpus, ensemble, 모델 크기, compute와 hyperparameter search도 동일하게 제한하지 않았다. 따라서 점수 차이는 architecture 하나만의 통제 실험이 아니다.

private test label은 직접 test tuning을 줄이지만 사전 학습 corpus의 test text 노출, 유사 예시 contamination, 반복 submission을 통한 leaderboard overfitting까지 막지 못한다.

### GLUE score는 난이도 가중 점수가 아니다

복수 metric이 있는 과제는 해당 metric을 먼저 평균하고, 아홉 task score를 다시 평균한다. MNLI의 matched·mismatched도 함께 반영한다. raw의 ‘난이도와 중요도로 가중’이라는 설명과 달리 task importance·dataset size·human gap에 따른 별도 weight를 주지 않는다.

이 단순 평균은 접근하기 쉽지만 서로 다른 통계량을 한 scale처럼 더한다. CoLA MCC 1점 변화와 SST accuracy 1점 변화가 같은 의미인지 보장되지 않고, 634개 train example의 WNLI와 393k MNLI가 aggregate에서 비슷한 task weight를 얻는다.

따라서 전체 순위와 함께 per-task score, metric uncertainty, model size·ensemble·추가 자료를 봐야 한다. aggregate가 높아도 특정 능력의 큰 약점이 숨을 수 있다.

### diagnostic set은 별도 분석이다

GLUE의 expert-constructed diagnostic set은 NLI 형식의 예시를 lexical semantics, predicate–argument structure, logic, world knowledge 현상으로 나눴다. 주 GLUE score에 들어가는 열 번째 task가 아니라 fine-grained failure를 보는 보조 자료다.

원 baseline은 ELMo와 sentence representation model이 여러 현상에서 낮은 점수를 보였다. diagnostic 결과를 모델 내부에 해당 언어 지식이 존재하거나 부재한다는 직접 해부 결과로 읽지는 않는다. 정해진 NLI 예시의 출력 행동을 측정한다.

### 인간 기준선과 포화

GLUE 원 발표는 인간 aggregate를 suite의 고정 상한으로 제공한 연구가 아니다. 2019년 Nangia와 Bowman은 비전문가 annotator를 이용해 보수적 인간 성능을 별도로 추정했고 GLUE 87.1을 보고했다.

SuperGLUE 논문이 작성될 때 XLNet-large의 GLUE 88.4가 이 추정치를 1.3점 넘었다. 하지만 모델이 모든 task에서 인간을 넘은 것은 아니며 네 task에서만 해당 human estimate보다 높았다. 일부 task와 diagnostic phenomenon에는 headroom이 남았다.

인간 87.1도 절대 인간 능력이 아니라 task 지침·표본·crowdworker selection·합의 방법에 묶인 측정치다. 기계 aggregate가 이를 넘었다는 사실을 인간의 일반 언어 이해를 넘었다는 결론으로 확대하지 않는다.

### SuperGLUE가 바꾼 것

SuperGLUE는 여덟 task를 포함했다.

| 과제 | 핵심 형식 | 주 metric |
|---|---|---|
| BoolQ | passage 기반 yes/no QA | accuracy |
| CB | embedded clause의 entailment·commitment | accuracy·macro F1 |
| COPA | 원인/결과 두 후보 선택 | accuracy |
| MultiRC | 여러 문장 passage의 질문–복수 answer 판정 | answer F1·exact match |
| ReCoRD | passage에서 query 빈칸의 entity 선택 | token F1·exact match |
| RTE | 이진 entailment | accuracy |
| WiC | 두 문맥의 같은 단어 sense 동일 여부 | accuracy |
| WSC | pronoun coreference 두 후보 판단 | accuracy |

GLUE의 문장·문장쌍 분류 위주 형식에서 QA·coreference·multiple choice·span/entity 선택으로 넓어졌다. 자유 형식 장문 text generation을 추가했다는 raw 설명은 과하다.

SuperGLUE는 모든 task에 human performance estimate를 제공하고 강한 BERT 기반 baseline과의 gap을 확인했다. modular toolkit, 더 엄격한 leaderboard usage rule과 task creator credit도 포함했다.

### benchmark가 연구를 움직이는 방식

GLUE는 ELMo·GPT·[[BERT]] 같은 전이 학습 모델을 같은 suite에서 비교하는 무대가 됐다. 특히 BERT의 GLUE 80.5와 여러 task 향상은 MLM encoder 전체 fine-tuning의 폭넓은 효과를 보여 주는 핵심 근거였다.

leaderboard는 model·training recipe 개선을 빠르게 드러냈지만 평가 대상 자체가 최적화 목표가 됐다. 수많은 연구가 같은 development set과 task collection을 반복 사용하면 public benchmark에 특화된 선택이 누적된다. 이는 train example의 overfitting과 다른 benchmark-level overfitting이다.

GLUE가 SQuAD 평가 원칙을 만들었다거나 ImageNet·COCO가 GLUE 방식을 채택했다는 raw 계보는 연대가 거꾸로다. SQuAD는 2016년, ImageNet·COCO도 GLUE보다 앞섰다. GLUE의 기여는 선행 benchmark 관행을 영어 NLU 전이 학습 suite에 효과적으로 결합한 데 있다.

후대 [[079_HELM과 다차원 언어 모델 평가|HELM]]은 이 공통 비교 좌표를 범용 생성 모델에 맞춰 넓혔다. GLUE가 과제별 metric을 aggregate로 압축했다면, HELM은 scenario·adaptation·metric을 분리하고 정확도·보정·강건성·공정성·편향·독성·효율성의 절충을 하나의 보편 순위로 자동 합치지 않았다.

## 검증과 한계

### 검증 정정

- **GLUE 연구진은 Google Research 중심이었다**: 저자 소속은 NYU·University of Washington·DeepMind였다.
- **GLUE는 질의응답·생성까지 아홉 형식으로 평가했다**: 문장·문장쌍 분류와 STS 회귀 중심이며 QNLI는 SQuAD의 NLI 재구성이다.
- **한 unified multi-task model을 제출해야 했다**: task별 별도 fine-tuned model도 허용됐다.
- **GLUE score는 task 난이도·중요도로 가중된다**: 복수 metric과 task score의 단순 평균이다.
- **중앙 server가 모든 훈련 조건을 같게 만든다**: test·metric은 공유하지만 추가 자료·compute·ensemble은 다를 수 있다.
- **GLUE 원 발표가 human baseline을 확립했다**: 87.1 추정은 2019년 별도 연구다.
- **기계가 GLUE의 모든 task에서 인간을 넘었다**: 2019년 aggregate와 네 task에서 해당 비전문가 추정치를 넘었다.
- **SuperGLUE는 open-ended 생성 task를 포함했다**: QA·coreference 등 형식을 넓혔지만 출력은 선택·분류·span/entity 중심이다.
- **GLUE가 SQuAD·ImageNet·COCO 평가 설계에 영향을 주었다**: 이 benchmark들은 GLUE보다 먼저 존재했다.
- **한 aggregate가 일반 언어 이해를 객관적으로 측정한다**: 선택된 영어 dataset·metric·평균 방식에 조건화된 proxy다.
- **private test면 contamination과 leaderboard overfitting이 해결된다**: label 은닉과 pretraining 노출·반복 개발은 다른 문제다.
- **오늘날 모든 주요 LLM의 필수 평가다**: 역사적 영향은 크지만 생성·안전·다언어·agent 능력에는 다른 suite가 필요하다.

## 학습 확인

### 확인 질문

1. GLUE는 새 단일 dataset이 아니라 무엇을 묶은 평가 suite인가?
2. 여러 metric과 과제에서 GLUE aggregate가 만들어지는 순서는 무엇인가?
3. 모델 점수가 인간 추정치를 넘더라도 일반 언어 이해의 인간 초월을 뜻하지 않는 이유는 무엇인가?

### 다음 문서

- [[GLUE와 SuperGLUE]] — 과제 구성·집계·인간 비교를 개념 지도에서 다시 정리한다.
- [[079_HELM과 다차원 언어 모델 평가]] — 집계 점수에서 시나리오×메트릭 행렬로 평가 단위가 확장된 방식을 비교한다.
- [[자동 평가 지표는 무엇을 보상하는가]] — 집계 지표가 연구와 모델 선택에 주는 유인을 더 넓게 비교한다.

## 출처

- Alex Wang 외, [GLUE: A Multi-Task Benchmark and Analysis Platform for Natural Language Understanding](https://aclanthology.org/W18-5446/), BlackboxNLP 2018, pp. 353–355.
- Nikita Nangia·Samuel R. Bowman, [Human vs. Muppet: A Conservative Estimate of Human Performance on the GLUE Benchmark](https://aclanthology.org/P19-1449/), ACL 2019.
- Alex Wang 외, [SuperGLUE: A Stickier Benchmark for General-Purpose Language Understanding Systems](https://proceedings.neurips.cc/paper/2019/hash/4496bf24afe7fab6f046bf4923da8de6-Abstract.html), NeurIPS 2019.
- [[079_HELM과 다차원 언어 모델 평가]]
- 프로젝트 번역·검토 출발 자료: [GLUE and SuperGLUE Standardized Evaluation for Language Understanding](https://mbrenndoerfer.com/writing/glue-superglue-standardized-evaluation-language-understanding)
- 프로젝트 보존 자료: `raw/059_GLUE and SuperGLUE Standardized Evaluation for Language Understanding.ko.md`, `raw/059_GLUE and SuperGLUE Standardized Evaluation for Language Understanding.commentary.ko.md`.

## 관련 항목

- [[GLUE와 SuperGLUE]]
- [[HELM]]
- [[079_HELM과 다차원 언어 모델 평가]]
- [[BERT]]
- [[051_SQuAD와 추출형 독해 평가]]
- [[자동 평가 지표는 무엇을 보상하는가]]
- [[튜링 테스트와 LLM 평가]]
