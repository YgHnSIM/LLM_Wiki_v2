---
schema_version: 2
id: concept.xlnet-roberta-albert
page_type: concept
title: XLNet·RoBERTa·ALBERT
aliases:
  - XLNet
  - RoBERTa
  - ALBERT
  - BERT 개선 모델
tags:
  - type/concept
  - domain/ai
  - domain/nlp
  - domain/machine-learning
created: '2026-07-21'
updated: '2026-07-21'
lifecycle: active
verification: verified
artifacts:
  - 'raw/060_XLNet, RoBERTa, ALBERT Refining BERT with Permutation Modeling, Training Optimization, and Parameter Efficiency.ko.md'
  - 'raw/060_XLNet, RoBERTa, ALBERT Refining BERT with Permutation Modeling, Training Optimization, and Parameter Efficiency.commentary.ko.md'
evidence:
  - source_id: yang-et-al-2019-xlnet
    locator: '§§2.1–2.6의 generalized autoregressive objective·two-stream attention·Transformer-XL 결합과 §3의 ablation'
    relation: supports
  - source_id: liu-et-al-2019-roberta
    locator: '§§3–5의 data·masking·NSP·batch·training duration 통제 비교와 최종 결과'
    relation: supports
  - source_id: lan-et-al-2020-albert
    locator: '§§3–5와 Tables 1–5의 factorization·layer sharing·SOP·parameter/compute 비교'
    relation: supports
related:
  - source.060
  - concept.bert
  - concept.마스크드-언어-모델링
  - concept.transformer
  - concept.transformer-xl
  - concept.glue-superglue
---
# XLNet·RoBERTa·ALBERT

> [!note] 학습 안내
> **난이도:** 중급<br>
> **선수 지식:** [[BERT]], [[마스크드 언어 모델링]]<br>
> **읽고 나면:** 세 모델을 하나의 후속 버전 계보로 보지 않고 objective·training recipe·parameterization의 세 비교축으로 설명할 수 있다.

## 1단계 — 먼저 잡을 핵심

XLNet·RoBERTa·ALBERT는 2019년 전후에 BERT의 서로 다른 병목을 겨냥한 세 연구다. XLNet은 `[MASK]` 없는 generalized autoregressive objective를, RoBERTa는 BERT의 훈련 recipe 재평가를, ALBERT는 parameter 저장 효율을 중심에 놓았다. 이름을 한 묶음으로 쓰더라도 같은 architecture 계열의 순차 버전이라는 뜻은 아니다.

## 2단계 — 작동 원리

### 병목을 먼저 고르고 바꾸는 축을 제한한다

1. **XLNet:** target을 예측하는 factorization order를 바꿔 여러 방향의 문맥을 경험하게 한다.
2. **RoBERTa:** BERT encoder와 MLM을 유지하고 data·batch·mask·NSP·sequence 구성을 다시 실험한다.
3. **ALBERT:** 작은 vocabulary embedding을 hidden space로 projection하고 같은 block parameter를 여러 layer에서 재사용한다.

이 분해는 성능 향상을 읽는 순서이기도 하다. objective를 평가할 때는 backbone과 data를, recipe를 평가할 때는 총 token·compute를, parameterization을 평가할 때는 성능뿐 아니라 FLOPs·처리량을 함께 맞춰야 한다.

## 3단계 — 기술과 근거

### 세 설계의 최소 비교

| 모델 | 핵심 변경 | 얻으려 한 것 | 함께 봐야 할 비용·조건 |
|---|---|---|---|
| XLNet | permutation factorization, two-stream attention | `[MASK]` 없이 양방향 문맥을 활용하는 자기회귀 사전 학습 | Transformer-XL 구성, objective 구현 복잡성, 이해 과제 중심 평가 |
| RoBERTa | 추가 corpus, 큰 batch, dynamic masking, NSP 제거 | 같은 BERT 계열의 충분한 훈련과 강한 baseline | 더 많은 data·총 sequence·compute, 여러 변경의 누적 효과 |
| ALBERT | $O(VH)\to O(VE+EH)$ embedding, cross-layer sharing, SOP | 적은 parameter로 큰 hidden 구조 탐색 | 반복 계산량, 공유에 따른 capacity 변화, xxlarge의 처리 속도 |

### XLNet은 무엇을 순열하는가

XLNet은 문장 안 단어 위치를 섞지 않는다. 가능한 factorization order를 표본 추출하고, 각 target을 그 순서에서 먼저 공개된 token 내용에 조건화한다. query stream은 target 위치를 알지만 target 내용은 보지 않고, content stream은 공개된 내용을 전달한다. fine-tuning에서는 content stream만 사용한다.

### Transformer-XL과 XLNet을 구분하기

[[Transformer-XL]]은 segment-level recurrence와 상대 위치 attention으로 고정 길이 segment 경계를 넘어 문맥을 재사용하는 자기회귀 언어 모델 구조다. XLNet은 이 backbone을 사용하면서 generalized autoregressive objective와 target 누설을 막는 two-stream attention을 추가한 사전 학습 방법이다. 따라서 Transformer-XL 자체가 permutation objective를 쓰는 것은 아니며, XLNet을 Transformer-XL의 단순한 이름 변경으로 볼 수도 없다.

### RoBERTa에서 ‘더 오래’의 뜻

RoBERTa의 최종 500K step은 BERT의 1M보다 작다. 대신 batch가 훨씬 커서 총 처리 sequence가 많고 corpus도 약 열 배 규모였다. dynamic masking과 NSP 제거는 중요한 구성 요소지만 통제 실험에서 각각이 전체 향상을 단독으로 설명하지 않는다.

### ALBERT에서 ‘가볍다’의 뜻

ALBERT의 lite는 주로 parameter count와 저장 memory를 가리킨다. layer sharing은 같은 계산 block을 깊이에 따라 반복하므로 parameter가 10분의 1이 됐다고 FLOPs나 latency도 10분의 1이 되는 것은 아니다. 12M·18M 모델의 같은 조건 평균은 대응 BERT보다 낮았고, 강한 최종 결과는 235M ALBERT-xxlarge에서 나왔다.

### 공통점과 구조적 차이

세 모델 모두 self-supervised pretraining 뒤 후속 과제에 적응하며 입력 문맥에 따른 contextual representation을 만든다. RoBERTa와 ALBERT는 [[BERT]] encoder 계열이다. XLNet은 Transformer-XL의 recurrence·상대 위치 표현과 generalized autoregressive objective를 결합하므로 동일한 encoder-only 변형으로 분류하지 않는다.

## 검증과 한계

### 비교할 때 흔한 오류

- permutation language modeling을 입력 token shuffle로 설명하지 않는다.
- RoBERTa의 향상을 dynamic masking 하나의 효과로 돌리지 않는다.
- ALBERT의 parameter 효율을 mobile 속도나 전체 계산 효율과 동일시하지 않는다.
- 서로 다른 data·tokenizer·compute·모델 크기의 최고 benchmark 점수를 직접 인과 비교하지 않는다.
- 세 원 논문이 입증하지 않은 production 채택이나 후대 모델의 직접 계보를 덧붙이지 않는다.

세 모델의 공통 가치는 특정 하나가 최종 승자라는 데 있지 않다. 강한 baseline을 만들려면 objective·data·training·parameter·compute를 구분하고, 바꾼 축의 효과를 ablation으로 확인해야 한다는 비교 방법을 제공한다.

## 학습 확인

### 확인 질문

1. XLNet·RoBERTa·ALBERT가 각각 주로 바꾼 축은 무엇인가?
2. RoBERTa의 500K step을 BERT의 1M step보다 짧은 훈련이라고만 말할 수 없는 이유는 무엇인가?
3. ALBERT의 parameter 수와 실제 계산량이 다른 축인 이유는 무엇인가?

### 다음 문서

- [[GLUE와 SuperGLUE]] — 서로 다른 모델의 전이 성능을 집계 점수로 비교할 때 숨는 조건을 살핀다.
- [[사전 학습 지식은 과제에 어떻게 도착하는가]] — 사전 학습 결과가 특징·미세조정·prompting을 통해 후속 과제로 전달되는 방식을 비교한다.

## 출처

- [[060_XLNet·RoBERTa·ALBERT의 BERT 개선 경로]]
- Zhilin Yang 외, [XLNet: Generalized Autoregressive Pretraining for Language Understanding](https://proceedings.neurips.cc/paper_files/paper/2019/hash/dc6a7e655d7e5840e66733e9ee67cc69-Abstract.html), NeurIPS 2019, 특히 §§2–3.
- Yinhan Liu 외, [RoBERTa: A Robustly Optimized BERT Pretraining Approach](https://arxiv.org/abs/1907.11692), 2019, 특히 §§3–5.
- Zhenzhong Lan 외, [ALBERT: A Lite BERT for Self-supervised Learning of Language Representations](https://openreview.net/forum?id=H1eA7AEtvS), ICLR 2020, 특히 §§3–5.

## 관련 항목

- [[060_XLNet·RoBERTa·ALBERT의 BERT 개선 경로]]
- [[BERT]]
- [[마스크드 언어 모델링]]
- [[Transformer]]
- [[Transformer-XL]]
- [[GLUE와 SuperGLUE]]
