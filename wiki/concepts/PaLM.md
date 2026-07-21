---
schema_version: 2
id: concept.palm
page_type: concept
title: PaLM
aliases:
  - Pathways Language Model
  - PaLM 540B
tags:
  - type/concept
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
    locator: '초록, §§2–4·6–8·10과 Tables 1–5·10–11·14·17·20, Appendix B Table 22와 Appendix E의 PaLM 540B 정의·Pathways 학습·평가 조건·compute·memorization·risk·사용 제한'
    relation: supports
related:
  - source.083
  - source.078
  - source.079
  - source.080
  - concept.대규모-언어-모델
  - concept.transformer
  - concept.언어-모델-스케일링-법칙
  - concept.사고-연쇄-프롬프팅
  - analysis.손실-곡선과-능력-곡선-사이
---
# PaLM

> [!note] 학습 안내
> **난이도:** 중급<br>
> **선수 지식:** [[Transformer]], [[대규모 언어 모델]], [[사고 연쇄 프롬프팅]]<br>
> **읽고 나면:** PaLM을 540B dense Transformer와 Pathways 분산 학습의 결합으로 설명하고, benchmark의 큰 수치를 prompt·fine-tuning·언어·위험 조건에서 해석할 수 있다.

## 1단계 — 먼저 잡을 핵심

### 한 문장 정의

**PaLM(Pathways Language Model)**은 2022년에 보고된 540.35B parameter의 dense decoder-only Transformer와 그 model family(8B·62B·540B)를 가리킨다. 이름의 Pathways는 model이 sparse하거나 범용 task router라는 뜻이 아니라, 두 TPU v4 Pod에서 model 학습을 조율한 distributed ML system과의 관계를 가리킨다.

### 왜 중요한가

PaLM은 대규모 model의 성능 논의를 parameter 수 하나에서 끝내기 어렵게 만든 사례다. 같은 shuffled data mixture·vocabulary로 8B, 62B, 540B을 비교하면서, architecture 변경, two-Pod parallelism, few-shot prompt와 benchmark 설계를 함께 공개했다. 8B·540B 평가는 780B-token checkpoint지만 62B는 선택 실수로 795B-token checkpoint를 사용했다는 예외도 §6.8에 기록돼 있다. 특히 CoT prompt와 scale을 결합한 추론 결과는 `model 크기`와 `입력 형식`을 분리해 평가해야 한다는 문제를 선명하게 보여 준다.

### 구분해야 할 이름

- **PaLM 540B:** 540.35B parameter의 base pretrained model이다.
- **PaLM-Coder 540B:** PaLM에 Python-only code data를 추가해 fine-tuning한 별도 variant다. DeepFix 82.1% compile rate는 이 variant의 결과다.
- **Pathways:** accelerator를 위한 distributed orchestration system이다. PaLM의 Transformer layer나 attention 유형의 명칭이 아니다.

이 구분이 없으면 base PaLM의 code 능력, PaLM-Coder의 fine-tuned 결과, 분산 학습 infrastructure의 성질을 한 model 능력으로 오해하게 된다.

## 2단계 — 작동 원리

### Model 구조

PaLM은 causal self-attention으로 이전 token을 보고 다음 token을 예측하는 dense decoder-only Transformer다. 540B model은 118 layer, 48 attention head, `d_model = 18,432`, head dimension 256, `d_ff = 4 × d_model`을 사용한다. Vocabulary는 whitespace를 보존하는 256k SentencePiece이고, input·output embedding을 공유한다.

| 설계 | 역할 | 흔한 오해 |
| --- | --- | --- |
| SwiGLU | MLP intermediate activation | generic ReLU Transformer와 완전히 같다고 봄 |
| Parallel layer | MLP와 attention input matmul을 병렬 계산 | attention 자체가 sparse해졌다고 봄 |
| Multi-query attention | head 사이에 key/value projection을 공유해 decoding 비용을 절감 | sparse attention과 혼동 |
| RoPE | 위치 정보를 회전 embedding으로 표현 | 무한 context를 보장한다고 해석 |
| Rematerialization | activation 일부를 다시 계산해 큰 batch를 가능하게 함 | model architecture 또는 mixed precision과 혼동 |

PaLM은 sparse-attention model이 아니다. 논문은 standard dense Transformer의 FLOPs를 바탕으로 scaling과 utilization을 설명한다.

### Data와 계산의 결합

540B model은 780B token을 한 번 학습했다. Mixture에는 multilingual conversation·web page, English book·news, Wikipedia와 GitHub code가 들어간다. 100개 넘는 언어의 text가 포함됐지만 non-English data의 비율은 약 22%이고 language별 양은 다르다. `많은 언어`는 coverage의 출발점이지 품질의 결론이 아니다.

학습은 TPU v4 chip 6,144개로 구성된 두 Pod에서 이뤄졌다. Pod 안에서는 12-way model parallelism과 256-way fully sharded data parallelism, Pod 사이에서는 two-way data parallelism을 사용했다. 각 Pod는 model의 같은 parameter 상태를 유지하고 batch 반쪽의 gradient를 교환했으며, 이 구성은 pipeline parallelism을 사용하지 않았다.

### 왜 CoT prompt가 결과를 바꾸는가

일반 few-shot prompt는 input과 answer example을 보여 준다. CoT prompt는 exemplar에 answer에 이르는 intermediate natural-language step을 더한다. PaLM의 test output도 chain을 만들지만 score는 final answer로 계산한다. 따라서 benchmark 점수 상승은 model weight만의 성질이 아니라 **model size + exemplar 형식 + decoding/보조 도구**의 합성 결과다.

GSM8K에서 540B은 CoT 없이 17%, CoT 54%, CoT와 calculator 58%를 기록했다. 58%라는 값은 reasoning task 전반의 보편 성능도, 계산기 없이 나온 base completion 성능도 아니다.

## 3단계 — 기술과 근거

### Scale의 결과는 task별이다

PaLM 540B의 29개 English NLP task 1-shot aggregate는 NLG/NLU 63.9/74.7이었다(Table 5). 이와 별도로 task별 few-shot 비교에서는 prior large LM의 best few-shot result를 28/29 task에서 넘었다(Table 4). BIG-bench 공통 58 task에서는 5-shot 결과가 prior SOTA를 44개에서 넘었고 aggregate average human score보다 높았다.

그러나 전체 150개 text task 중 평균 human score가 더 높은 task는 35%였다. Navigate와 mathematical induction 같은 task에서는 540B이 62B보다 약간만 높았고 best human performance와도 거리가 있었다. 더 큰 model이 모든 문제의 같은 종류의 능력을 단조롭게 높인다는 결론은 이 표에서 나오지 않는다.

### 다국어와 code 성능의 범위

PaLM은 WMT translation, GEM generation, TyDiQA를 평가했다. 5-shot English→French translation은 BLEU 44.0이지만, 해당 fine-tuned SOTA는 45.6이었다. Fine-tuned TyDiQA average 80.0도 ByT5-XXL 81.4보다 낮다. 다국어 결과는 task·language pair·shot 수·fine-tuning 여부에 따라 달라진다.

Base PaLM은 total 39B code token을 봤지만, Python 추가 학습 뒤의 PaLM-Coder는 별도다. Code synthesis·translation·repair benchmark에서 `PaLM`이 어느 variant를 가리키는지 밝히지 않으면 base model의 사전학습 성능을 과대평가하게 된다.

### Training efficiency도 결과의 일부다

PaLM의 2,048 batch throughput은 238.3k token/s였고 model FLOPs utilization은 46.2%, rematerialization을 포함한 hardware FLOPs utilization은 57.8%였다. Appendix B Table 22의 **rematerialization 제외 model FLOPs**는 2.56×10^24 FLOPs(29,600 PF-days)이며, rematerialization을 포함해 실제로 실행한 hardware FLOPs는 token당 4.10 TFLOP, 약 3.20×10^24 FLOPs다. 이 수치는 540B 결과가 large parameter count만이 아니라 network, compiler, parallel formulation, sharding·rematerialization과 함께 얻어진 결과임을 보여 준다.

하지만 57.8%는 그 hardware·workload에 대해 정의된 utilization이다. 이를 모든 distributed training의 efficiency 또는 모든 PaLM deployment의 비용으로 일반화할 수는 없다.

## 검증과 한계

### 성능 주장의 경계

PaLM 논문은 few-shot performance와 fine-tuned result를 모두 포함한다. 28/29 English task 주장은 당시 prior **few-shot** large LM 결과와의 비교이고, CoT reasoning은 8-shot exemplar 조건이다. Human 비교는 BIG-bench의 normalized preferred metric 평균이지 사람과 같은 일반 능력의 판정이 아니다.

Checkpoint와 shot 수도 영향을 준다. 일부 task에서는 example을 더 주어도 좋아지지 않았고, WebQuestions에서는 final 780B-token checkpoint보다 770B checkpoint가 더 좋은 SOTA 결과를 보였다. 이는 scale·training duration·prompt의 효과가 매 task에서 단순 단조 관계가 아님을 보여 준다.

### Data leakage와 memorization

540B model은 training example의 exact 50-token continuation을 2.4% 재현해 8B의 1.6%보다 높았다. Training에서 500회 이상 반복된 sequence의 재현률은 40% 이상이었다. Deduplication이 document level이었다는 점과 code corpus의 boilerplate·중복 snippet이 중요한 요인이었다.

저자들은 partially contaminated English benchmark clean subset과 translation overlap도 분석했지만, `오염이 없었다`고 결론 내리지 않는다. 평가 결과는 data overlap 검사와 memorization 측정의 범위 안에서만 읽어야 한다.

### Bias, toxicity, model access

Bias와 toxicity 분석은 영어 prompt와 특정 benchmark·Perspective API를 사용한 측정이다. Religion prompt에서는 Islam을 terrorism·extremism·violence와 잘못 연결하는 stereotype의 위험이 나타났고, fairness analysis는 비영어권·비서구 맥락을 포괄하지 못한다고 저자들이 명시한다. 540B은 non-toxic prompt의 25개 sample 중 독성 판정 output이 하나 이상 있을 확률이 first-sentence 0.46, 128 step 0.56이었다.

PaLM 논문은 model weight release를 보고하지 않는다. Appendix E는 PaLM이 연구 목적으로 설계됐고 연구 외 환경에서는 시험되지 않았으며 application-specific risk analysis가 필요하다고 밝힌다. 따라서 논문 결과를 근거로 PaLM weight가 공개됐거나 안전한 일반 제품으로 검증됐다고 쓸 수 없다.

## 학습 확인

### 확인 질문

1. Multi-query attention이 decoding resource를 줄이는 방식은 sparse attention과 어떻게 다른가?
2. PaLM 540B의 GSM8K 58%를 인용할 때 CoT와 calculator 조건을 함께 써야 하는 이유는 무엇인가?
3. PaLM-Coder와 base PaLM을 구분하지 않으면 code 성능에 어떤 오류가 생기는가?

### 다음 문서

- [[083_PaLM과 Pathways 기반 대규모 언어 모델 확장]] — PaLM raw 서사를 수치·평가 조건·위험으로 검증한다.
- [[080_사고 연쇄 프롬프팅과 추론 행동 유도]] — prompt가 reasoning benchmark에 끼치는 효과를 살핀다.

## 출처

- [[083_PaLM과 Pathways 기반 대규모 언어 모델 확장]]
- Aakanksha Chowdhery 외, [*PaLM: Scaling Language Modeling with Pathways*](https://research.google/pubs/palm-scaling-language-modeling-with-pathways/), 2022; 초록, §§2–4·6–8·10, Tables 1–5·10–11·14·17·20, Appendix B Table 22, Appendix E.
- Aakanksha Chowdhery 외, [논문 PDF](https://arxiv.org/pdf/2204.02311), 2022; model architecture, distributed training, benchmark·risk 결과의 1차 표와 절.
- 프로젝트 보존 자료: `raw/083_PaLM Pathways Language Model - Large-Scale Training, Reasoning, and Multilingual Capabilities.ko.md`, `raw/083_PaLM Pathways Language Model - Large-Scale Training, Reasoning, and Multilingual Capabilities.commentary.ko.md`.

## 관련 항목

- [[083_PaLM과 Pathways 기반 대규모 언어 모델 확장]]
- [[078_Chinchilla와 계산 최적 언어 모델 학습]]
- [[079_HELM과 다차원 언어 모델 평가]]
- [[080_사고 연쇄 프롬프팅과 추론 행동 유도]]
- [[대규모 언어 모델]]
- [[Transformer]]
- [[언어 모델 스케일링 법칙]]
- [[사고 연쇄 프롬프팅]]
- [[손실 곡선과 능력 곡선 사이]]
