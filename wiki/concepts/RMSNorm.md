---
schema_version: 2
id: concept.rmsnorm
page_type: concept
title: RMSNorm
aliases: [Root Mean Square Layer Normalization, RMS Normalization]
tags:
  - type/concept
  - domain/ai
  - domain/nlp
  - domain/machine-learning
  - domain/optimization
created: '2026-07-18'
updated: '2026-07-22'
lifecycle: active
verification: verified
artifacts:
  - 'raw/049_Layer Normalization Feature-Wise Normalization for Sequence Models.ko.md'
  - 'raw/049_Layer Normalization Feature-Wise Normalization for Sequence Models.commentary.ko.md'
  - "raw/089_LLaMA Meta's Open Foundation Models That Democratized Language AI Research.ko.md"
  - "raw/089_LLaMA Meta's Open Foundation Models That Democratized Language AI Research.commentary.ko.md"
evidence:
  - source_id: zhang-sennrich-2019-rmsnorm
    locator: '초록과 §§3–5의 re-centering 제거, RMS 식, pRMSNorm과 속도·성능 평가'
    relation: supports
  - source_id: ba-kiros-hinton-2016-layer-normalization
    locator: '§§2–3의 mean·variance LayerNorm 정의'
    relation: contextualizes
  - source_id: touvron-et-al-2023-llama
    locator: '§2.2의 “Pre-normalization” 단락: 각 Transformer sub-layer 입력의 pre-normalization과 RMSNorm 채택'
    relation: contextualizes
related:
  - source.049
  - source.089
  - concept.layer-normalization
  - concept.llama-1
---
# RMSNorm

> [!note] 학습 안내
> **난이도:** 중급<br>
> **선수 지식:** [[Layer Normalization]]<br>
> **읽고 나면:** RMSNorm이 mean centering 없이 feature 벡터의 크기를 조정하는 방식과 LayerNorm variance와의 차이를 설명할 수 있다.

## 1단계 — 먼저 잡을 핵심

[[RMSNorm]]은 [[Layer Normalization]]에서 mean centering을 제거하고 feature 벡터의 root mean square로 scale만 정규화하는 변형이다.

## 2단계 — 작동 원리

feature 값을 제곱해 평균낸 뒤 제곱근을 구하고, 각 feature를 이 RMS로 나눈 다음 학습 가능한 scale을 적용한다. 평균을 먼저 빼지 않는다는 점이 LayerNorm과의 핵심 차이다.

## 3단계 — 기술과 근거

### 정식 표현

$$
\operatorname{RMS}(h)=\sqrt{\frac1d\sum_i h_i^2},\qquad
\operatorname{RMSNorm}(h)=\gamma\odot\frac{h}{\operatorname{RMS}(h)+\epsilon}
$$

### 분산과의 차이

RMS의 제곱은 중심화하지 않은 2차 moment (d^{-1}\sum_i h_i^2)다. LayerNorm의 variance (d^{-1}\sum_i(h_i-\mu)^2)와는 평균이 0일 때만 같다. 따라서 RMSNorm을 “평균을 뺀 뒤 variance만 사용하는 LayerNorm”이라고 설명하면 틀리다.

### LLaMA 1의 pre-norm 채택

[[089_LLaMA 1과 제한적 공개 가중치 연구 배포|LLaMA 1]]은 각 Transformer sub-layer의 **입력**을 정규화하는 pre-normalization 구조에 RMSNorm을 사용했다. Touvron 등은 이 선택을 설명하면서 RMSNorm을 제안한 Zhang·Sennrich를 명시적으로 인용했다. 따라서 RMSNorm을 현대 decoder-only LLM 조합에 넣어 규모 있게 검증한 채택은 LLaMA의 설계 일부이지만, 기법 자체를 LLaMA가 발명한 것은 아니다.

## 검증과 한계

### 주장과 범위

Zhang·Sennrich는 re-centering invariance가 필수적이지 않고 re-scaling invariance만으로 충분할 수 있다는 가설을 제시했다. 여러 RNN·Transformer 등에서 LayerNorm과 비슷한 성능, 구현별 7–64% 실행 시간 감소를 보고했다. 이는 모든 모델에서 같은 속도 향상이나 보편적 우월성을 보장하지 않는다.

LLaMA 1의 성능은 RMSNorm 하나만의 ablation 결과가 아니다. Pre-norm, SwiGLU, RoPE, 데이터 혼합, 모델 크기와 학습 token 수가 함께 달라졌으므로 LLaMA의 benchmark 결과를 RMSNorm의 인과적 우월성으로 돌리지 않는다.

## 학습 확인

### 확인 질문

1. RMSNorm은 LayerNorm에서 어떤 계산을 제거하는가?
2. RMS의 제곱과 중심화한 variance는 언제 같은가?
3. LLaMA 1의 RMSNorm 채택을 RMSNorm의 발명이나 단독 성능 ablation으로 부를 수 없는 이유는 무엇인가?

### 다음 문서

- [[Batch Normalization]] — 사례 안 feature가 아니라 mini-batch 사례 사이에서 통계를 공유하는 방법과 대조한다.
- [[LLaMA 1]] — pre-norm RMSNorm을 SwiGLU·RoPE와 함께 채택한 대규모 decoder-only 모델 사례를 본다.

## 출처

- [[049_층 정규화와 시퀀스 모델의 배치 독립성]]
- Biao Zhang·Rico Sennrich, [Root Mean Square Layer Normalization](https://proceedings.neurips.cc/paper/2019/hash/1e8a19426224ca89e83cef47f1e7f53b-Abstract.html), 2019.
- Jimmy Lei Ba·Jamie Ryan Kiros·Geoffrey E. Hinton, [Layer Normalization](https://arxiv.org/abs/1607.06450), 2016.
- [[089_LLaMA 1과 제한적 공개 가중치 연구 배포]]
- Hugo Touvron 외, [LLaMA: Open and Efficient Foundation Language Models](https://arxiv.org/abs/2302.13971), 2023, §2.2의 “Pre-normalization” 단락.
- 프로젝트 보존 자료: `raw/089_LLaMA Meta's Open Foundation Models That Democratized Language AI Research.ko.md`, `raw/089_LLaMA Meta's Open Foundation Models That Democratized Language AI Research.commentary.ko.md`.

## 관련 항목

- [[049_층 정규화와 시퀀스 모델의 배치 독립성]]
- [[Layer Normalization]]
- [[089_LLaMA 1과 제한적 공개 가중치 연구 배포]]
- [[LLaMA 1]]
