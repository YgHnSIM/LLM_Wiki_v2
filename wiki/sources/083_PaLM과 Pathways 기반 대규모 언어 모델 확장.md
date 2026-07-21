---
schema_version: 2
id: source.083
page_type: source
title: PaLM과 Pathways 기반 대규모 언어 모델 확장
aliases:
  - 083_PaLM Pathways Language Model - Large-Scale Training, Reasoning, and Multilingual Capabilities
tags:
  - type/source
  - domain/ai
  - domain/computer-science
  - domain/nlp
  - domain/machine-learning
created: '2026-07-21'
updated: '2026-07-21'
lifecycle: active
verification: verified
artifacts:
  - 'raw/083_PaLM Pathways Language Model - Large-Scale Training, Reasoning, and Multilingual Capabilities.ko.md'
  - 'raw/083_PaLM Pathways Language Model - Large-Scale Training, Reasoning, and Multilingual Capabilities.commentary.ko.md'
evidence:
  - source_id: chowdhery-et-al-2022-palm
    locator: '초록, §§2–4와 Tables 1–3의 dense architecture·780B-token corpus·6,144 TPU v4/두 Pod 병렬화·효율; §§6.1–6.8와 Tables 4–5·10–11·14·17의 조건별 평가와 62B checkpoint 예외; §§7–8·10·Appendix E의 memorization·contamination·bias/toxicity·model 사용 한계'
    relation: supports
related:
  - concept.palm
  - source.078
  - source.079
  - source.080
  - concept.대규모-언어-모델
  - concept.transformer
  - concept.언어-모델-스케일링-법칙
  - concept.사고-연쇄-프롬프팅
  - analysis.손실-곡선과-능력-곡선-사이
---
# PaLM과 Pathways 기반 대규모 언어 모델 확장

> [!note] 학습 안내
> **난이도:** 중급<br>
> **선수 지식:** [[대규모 언어 모델]], [[Transformer]], [[사고 연쇄 프롬프팅]]<br>
> **읽고 나면:** PaLM의 540B 규모를 구조·자료·분산 학습의 구체적 수치로 설명하고, few-shot·CoT·다국어·code 성능을 각각의 평가 조건과 한계 안에서 읽을 수 있다.

## 1단계 — 먼저 잡을 핵심

### 핵심 문장

2022년 발표된 **PaLM(Pathways Language Model)**은 540.35B 매개변수의 dense decoder-only Transformer다. Google 연구진은 780B token의 한 차례 학습을 두 개의 TPU v4 Pod, 총 6,144개 chip에 걸쳐 실행했다. 이 작업의 핵심은 단순히 model을 크게 만든 데 있지 않다. Pathways를 이용해 pipeline parallelism 없이 두 Pod를 data-parallel하게 묶고, 같은 model family와 task별 fine-tuned variant를 English NLP·BIG-bench·수학·상식 추론·code·다국어 benchmark에서 서로 다른 조건으로 평가했다.

PaLM의 성과를 ‘540B라서 일반적으로 추론한다’는 한 문장으로 줄일 수 없다. 예를 들어 GSM8K의 강한 결과는 **8-shot chain-of-thought(CoT) prompt**와 경우에 따라 외부 calculator를 함께 쓴 결과다. BIG-bench의 평균 human score 초과도 전체 150개 text task의 평균에 관한 말이며, 개별 task의 35%에서는 평균 human 성능이 더 높았다. 이 문서는 raw 보존 자료의 서사를 이러한 조건으로 되돌려 읽는다.

### 무엇이 새로웠는가

PaLM 논문은 8B·62B·540B라는 세 model 크기를 같은 shuffled data mixture와 vocabulary로 비교했다. 다만 §6.8이 밝히듯 8B·540B 평가는 780B-token checkpoint, 62B 평가는 선택 실수로 795B-token checkpoint를 사용했다. 대다수 task에서는 scale에 따른 개선이 대체로 log-linear했지만, BIG-bench text task 중 일부는 62B에서 540B로 갈 때 더 큰 폭으로 상승했다. 저자들은 이를 충분한 scale에서 나타나는 `discontinuous improvement`로 기술했지만, 모든 task가 같은 양상을 보인다고 주장하지는 않았다.

여기서 **Pathways**는 PaLM 내부의 attention mechanism 이름이 아니라, accelerator 작업을 조율하는 분산 ML system이다. PaLM은 Pathways vision 전체를 실현한 범용 다중모달 system이 아니라, 그 system을 대규모 dense language model 학습에 적용한 사례다.

### 이 문서의 범위

이 페이지는 PaLM 논문이 직접 확인하는 model·학습·평가·위험을 다룬다. PaLM weight가 공개되어 외부 개발자가 널리 사용했다는 주장, 후속 모든 LLM의 직접적 계보, 일반적 교육·개발 도구로의 배포는 이 논문의 근거가 아니다. Appendix E는 PaLM이 연구 목적으로 설계됐고 연구 외 환경에서는 시험되지 않았으며, downstream application 전에 별도 분석이 필요하다고 명시한다.

## 2단계 — 작동 원리

### Dense decoder-only Transformer

PaLM은 앞선 token만 보고 다음 token을 예측하는 causal decoder-only Transformer다. 540B variant의 정확한 수치는 540.35B parameter, 118 layer, 48 attention head, 18,432차원 model state다. Attention head dimension은 256이고 feed-forward dimension은 model dimension의 네 배다.

| 항목 | PaLM 540B |
| --- | ---: |
| Parameter | 540.35B |
| Layer / attention head | 118 / 48 |
| `d_model` / head dimension | 18,432 / 256 |
| Vocabulary | 256,000 SentencePiece token |
| 최종 batch size | 2,048 |
| 학습 token | 780B |

Raw 자료의 `sparse attention` 설명은 정정해야 한다. PaLM은 **dense** Transformer이며, 논문이 명시한 변경은 SwiGLU MLP, MLP와 attention을 병렬로 계산하는 Transformer block, multi-query attention, RoPE position embedding, 입력·출력 embedding 공유, dense kernel과 layer norm의 bias 제거다. Multi-query attention은 key/value projection을 head 사이에서 공유해 autoregressive decoding 비용을 낮추지만 sparse attention과 같은 말이 아니다.

### 780B-token 말뭉치와 tokenizer

학습 corpus는 780B token으로, multilingual social-media conversation 50%, multilingual filtered web page 27%, English book 13%, GitHub code 5%, multilingual Wikipedia 4%, English news 1%의 비율이다. Multilingual 부분에는 100개가 넘는 언어가 들어가지만, 논문이 말하는 non-English 비중은 약 22%다. 따라서 ‘100개 언어를 지원한다’보다 **100개 이상 언어의 text를 포함한 corpus에서 학습했고 특정 translation·generation·QA benchmark로 성능을 측정했다**고 쓰는 편이 정확하다.

256k SentencePiece vocabulary는 whitespace를 보존하고, 어휘 밖 Unicode 문자를 UTF-8 byte로 나누며, 숫자는 digit 단위로 나눈다. 이 설계는 code와 많은 언어를 함께 다루기 위한 tokenizer 선택이지 언어별 품질의 동등성을 보장하는 장치는 아니다.

### 두 TPU Pod를 하나의 학습으로 묶기

PaLM 540B은 data-center network로 연결된 TPU v4 Pod 두 개에서 학습됐다. Pod 하나는 TPU v4 chip 3,072개와 host 768개로 이뤄졌고, 전체는 chip 6,144개·host 1,536개다. 각 Pod에서는 12-way model parallelism과 256-way fully sharded data parallelism을 쓰며, Pod 사이에서는 각 Pod가 batch의 절반을 처리한 뒤 gradient를 교환하는 **two-way pod-level data parallelism**을 쓴다.

이 방식은 pipeline parallelism을 쓰지 않았다. 논문은 2,048 batch에서 238.3k token/s, model FLOPs utilization 46.2%, rematerialization을 포함한 hardware FLOPs utilization 57.8%를 보고한다. ‘여러 Pod를 효율적으로 조율했다’는 설명은 이 수치와 병렬화 전략으로 뒷받침할 수 있지만, raw의 fault tolerance·mixed precision·sparse attention 서술은 이 논문에서 확인되지 않는다.

## 3단계 — 기술과 근거

### English NLP와 BIG-bench: 평균은 범위를 지우지 않는다

29개 English NLP benchmark의 1-shot aggregate에서 PaLM 540B은 NLG 63.9, NLU 74.7을 기록했다(Table 5). 이와 별도로 Table 4의 task별 few-shot 비교에서는 당시 prior large LM의 best few-shot result를 28/29 task에서 넘었다. 두 집계는 모두 prompt 기반 평가이며, task-specific fine-tuning result와 같은 조건이 아니다.

BIG-bench에서는 공통 58개 task에서 PaLM 540B 5-shot이 prior SOTA를 44개 task에서 넘었고, 그 집합의 평균 human score보다 높았다. 그러나 전체 150개 text task 비교에서는 평균 human score가 PaLM보다 높은 task가 35%였다. 사람이 도구를 쓸 수 있었던 human evaluation과 task별 metric의 평균이라는 조건도 함께 밝혀야 한다.

### CoT가 붙은 추론 결과

CoT prompting에서는 few-shot exemplar에 사람이 쓴 intermediate step을 넣고, model이 test item에서 자체 chain을 생성한다. 평가는 최종 답만으로 한다. PaLM 논문은 arithmetic GSM8K·SVAMP·MAWPS·AQuA와 CommonsenseQA·StrategyQA를 8-shot CoT로 평가했다.

GSM8K에서 PaLM 540B의 정확도는 CoT+calculator 58%, CoT만 사용 54%, CoT 없이 17%였다(Table 10). 62B+CoT는 33%였다. 이 결과는 model scale과 prompt 형식의 결합이 중요했음을 보이며, generated chain이 model 내부의 충실한 reasoning trace라는 증거는 아니다. Calculator는 post-hoc 보조 도구였고 어떤 dataset에서도 5%p보다 큰 향상을 주지 않았다고 보고됐다.

### Code와 PaLM-Coder를 구분한다

Base PaLM의 pretraining에는 GitHub code가 5%, 총 39B code token과 2.7B Python token이 포함됐다(Table 11). 논문은 base PaLM의 code benchmark도 보이지만, Python-only 추가 data로 fine-tuning한 **PaLM-Coder**를 별도 model로 평가한다. DeepFix에서 82.1% compile rate라는 수치는 PaLM-Coder 540B의 결과이며, base PaLM이 그대로 code repair system이었다는 뜻이 아니다.

### 다국어 결과의 정확한 읽기

PaLM은 translation, GEM multilingual generation, TyDiQA-GoldP를 평가했다. 전통 WMT pair에서 English→French는 PaLM 540B이 0-shot 38.5, 1-shot 37.5, 5-shot 44.0 BLEU였고 fine-tuned SOTA 45.6과는 다르다(Table 14). TyDiQA에서 fine-tuned PaLM 540B average는 80.0으로 ByT5-XXL 81.4보다 낮고 mT5-XXL 79.1보다 높았다(Table 17).

특히 multilingual summarization의 few-shot 성능은 fine-tuning과 여전히 큰 차이가 있었다. 따라서 ‘다국어 task 전반에서 전문 architecture 없이 SOTA를 달성했다’는 raw의 표현은 과장이다. 언어쌍, shot 수, fine-tuning 여부, metric을 함께 적어야 한다.

## 검증과 한계

### raw 설명의 검증 정정

- **PaLM은 sparse attention을 사용했다:** 아니다. 논문은 dense decoder-only Transformer와 multi-query attention을 설명한다.
- **gradient checkpointing·mixed precision·safety prompt가 핵심 학습 장치였다:** 논문은 rematerialization과 병렬화는 명시하지만, 이 묶음의 서술을 뒷받침하지 않는다. safety prompt나 일반 배포 안전장치로 확대해서도 안 된다.
- **PaLM weight가 공개되어 연구자·개발자가 구축했다:** PaLM 논문은 weight release를 보고하지 않는다. 논문 공개와 model weight 공개는 다르며, Appendix E는 연구 외 환경에서 시험되지 않았고 downstream use 전 추가 분석이 필요하다고 적는다.
- **540B scale만으로 복잡한 추론을 획득했다:** GSM8K의 강한 값은 8-shot CoT, 때로 calculator와 결합된 조건의 결과다.
- **100개 이상 언어를 효과적으로 지원한다:** 100개 이상 언어는 training corpus의 구성이다. 평가된 language·task·shot·metric을 별도로 말해야 한다.
- **PaLM은 functionally correct code를 일반적으로 생성했다:** code 결과는 task별이며, DeepFix 82.1%는 fine-tuned PaLM-Coder의 compile rate다.
- **모든 후속 LLM의 기반이 됐다:** 현재 1차 자료는 PaLM의 기술적 결과를 지지할 뿐, 광범위한 직접 계보를 입증하지 않는다.

### Memorization과 contamination

저자들은 training data의 100-token span에 첫 50 token을 prompt로 주고 다음 50 token을 exact match로 재생하는 비율을 측정했다. 8B의 1.6%에 비해 540B은 2.4%였고, 540B은 training 중 500회 넘게 본 example에서는 40% 이상을 재생했다. 이는 larger model이 일부 data를 실제로 memorize한다는 분석이다.

Evaluation contamination 점검도 했다. 10개의 부분 오염 English NLP benchmark에서는 clean subset과 full set을 비교했지만, 이것은 가능한 모든 contamination을 배제하는 증명이 아니다. Translation에서는 wholesale contamination은 발견하지 못했으나, target reference sentence 일부가 training에 나타났다. 성능을 읽을 때 benchmark overlap과 memorization 위험을 함께 남겨야 한다.

### Bias, toxicity, 적용 한계

Fairness 분석은 영어 data에만 한정됐다. Winogender에서는 stereotypical example이 gotcha example보다 높고, female gotcha subset이 가장 낮았다. Religious identity continuation에서는 Islam을 terrorism·extremism·violence와 연결하는 stereotype을 잘못 확언할 가능성이 관찰됐다. Perspective API 자체의 social bias와 prompt wording에 대한 민감성도 논문이 인정한다.

RealToxicityPrompts 분석에서 540B은 non-toxic prompt에 대해 25개 continuation 중 독성으로 판정될 문장이 하나 이상 나올 확률이 first-sentence 기준 0.46, 128 decoding step 기준 0.56이었다(Table 20). 이 숫자는 Perspective API와 해당 sampling 설정의 결과이지 보편적 실제 위해 확률은 아니다. 논문은 fairness/toxicity 평가가 application·language·culture별 위험을 포괄하지 못한다고 명시한다.

## 학습 확인

### 확인 질문

1. PaLM의 multi-query attention과 raw 자료가 주장한 sparse attention은 왜 다른가?
2. GSM8K의 58%를 PaLM 자체의 일반 reasoning 능력으로 단정할 수 없는 평가 조건은 무엇인가?
3. 100개 이상 언어가 corpus에 있다는 사실과 다국어 benchmark의 성능은 어떤 검증 단계를 거쳐 연결해야 하는가?

### 다음 문서

- [[PaLM]] — model 구조·학습 시스템·평가와 위험을 개념 단위로 다시 정리한다.
- [[080_사고 연쇄 프롬프팅과 추론 행동 유도]] — CoT exemplar가 추론 benchmark 결과를 어떻게 바꾸는지 비교한다.

## 출처

- Aakanksha Chowdhery 외, [*PaLM: Scaling Language Modeling with Pathways*](https://research.google/pubs/palm-scaling-language-modeling-with-pathways/), 2022; 초록, §§2–4, Tables 1–3, §§6.1–6.8, Tables 4–5·10–11·14·17, §§7–8·10, Appendix E.
- Aakanksha Chowdhery 외, [논문 PDF](https://arxiv.org/pdf/2204.02311), 2022; architecture·data·평가 표의 수치와 model card 원문 위치.
- 프로젝트 번역·검토 출발 자료: [PaLM: Pathways Language Model—Large-Scale Training, Reasoning, and Multilingual Capabilities](https://mbrenndoerfer.com/writing/palm-pathways-language-model-large-scale-training-reasoning).
- 프로젝트 보존 자료: `raw/083_PaLM Pathways Language Model - Large-Scale Training, Reasoning, and Multilingual Capabilities.ko.md`, `raw/083_PaLM Pathways Language Model - Large-Scale Training, Reasoning, and Multilingual Capabilities.commentary.ko.md`.

## 관련 항목

- [[PaLM]]
- [[078_Chinchilla와 계산 최적 언어 모델 학습]]
- [[079_HELM과 다차원 언어 모델 평가]]
- [[080_사고 연쇄 프롬프팅과 추론 행동 유도]]
- [[대규모 언어 모델]]
- [[Transformer]]
- [[언어 모델 스케일링 법칙]]
- [[사고 연쇄 프롬프팅]]
- [[손실 곡선과 능력 곡선 사이]]
