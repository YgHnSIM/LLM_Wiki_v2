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
  - domain/mathematics
created: '2026-07-18'
updated: '2026-07-24'
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
  - source_id: mit-ocw-6-012-lecture-6-2018
    locator: '§6.2의 평균·분산 정의; 중심화한 분산과 raw second moment의 구분을 위한 맥락'
    relation: contextualizes
related:
  - source.049
  - source.089
  - concept.확률변수-확률분포-기대값-분산
  - concept.layer-normalization
  - concept.llama-1
---
# RMSNorm

> [!note] 학습 안내
> **난이도:** 중급<br>
> **선수 지식:** [[Layer Normalization]], [[확률변수·확률분포·기대값·분산]]의 평균·분산·raw second moment 구분<br>
> **읽고 나면:** RMSNorm이 한 feature 축의 root mean square로 scale을 조정하는 정확한 shape와 $\epsilon$·$\gamma$의 역할, LayerNorm variance와 다른 이유, LLaMA 1의 pre-normalization 채택 범위를 설명할 수 있다.

## 1단계 — 먼저 잡을 핵심

[[RMSNorm]]은 [[Layer Normalization]]에서 mean centering을 제거하고, 한 사례의 feature 벡터 root mean square(RMS)로 scale만 정규화하는 변형이다. Transformer hidden state의 shape가 $(B,T,D)$이면 보통 각 $(b,t,:)$의 마지막 feature 축 $D$에서 계산한다. batch·token 위치를 섞어 하나의 RMS를 만드는 연산이 아니다.

RMSNorm이 쓰는 제곱 평균은 현재 벡터의 크기를 요약하는 산술 연산이다. feature를 확률적으로 표본화한다는 가정 없이 정의되며, 확률변수의 분산이나 Adam의 time-weighted $v_t$와 같은 대상으로 읽지 않는다.

## 2단계 — 작동 원리

### 가장 작은 구체적 예

$h=(2,4,6)\in\mathbb R^3$이고 $\epsilon=0$이라고 하자. RMS의 제곱과 RMS는

$$
\frac{2^2+4^2+6^2}{3}=\frac{56}{3}\approx18.667,
\qquad
\operatorname{RMS}(h)=\sqrt{\frac{56}{3}}\approx4.320
$$

이다. 따라서 gain을 적용하기 전 출력은

$$
\frac{h}{\operatorname{RMS}(h)}
\approx(0.463,0.926,1.389)
$$

이다. 같은 입력의 LayerNorm은 먼저 평균 4를 빼므로 $(-1.225,0,1.225)$가 된다. RMSNorm은 입력 평균 4를 0으로 옮기지 않는다. 둘은 단지 구현의 한 줄이 다른 동일한 정규화가 아니다.

### 입력에서 출력까지

1. 현재 사례의 feature 축 $D$를 정한다.
2. 각 feature를 제곱해 $D$개 값의 평균을 구한다.
3. $\epsilon$을 더한 뒤 제곱근을 취해 양의 scale을 만든다.
4. 원래 feature를 이 scale로 나누고, feature별 gain $\gamma$를 곱한다.

## 3단계 — 기술과 근거

### 정의, shape, 기호

$h\in\mathbb R^D$인 한 사례에 대한 이상적인 RMS와, 구현에서 $\epsilon>0$을 둔 RMSNorm은 다음처럼 쓴다.

$$
\operatorname{RMS}(h)=\sqrt{\frac1D\sum_{j=1}^{D}h_j^2},
$$

$$
\operatorname{RMSNorm}_{\epsilon}(h)_i
=\gamma_i\frac{h_i}
{\sqrt{\frac1D\sum_{j=1}^{D}h_j^2+\epsilon}}
\qquad(i=1,\ldots,D)
$$

| 기호 | 현재 식에서의 의미 | 종류·shape | 값의 범위·출처 |
| --- | --- | --- | --- |
| $h$ | 정규화 전 한 token·사례의 hidden vector | 실수 벡터, $(D)$ | sublayer 입력 또는 출력 |
| $D$ | 정규화 feature 수 | 양의 정수 | hidden dimension·정규화 축 |
| $h_i$ | $i$번째 feature | 실수 스칼라 | $h$의 성분 |
| $\epsilon$ | 분모의 0·극단 scale을 완화하는 상수 | 0보다 큰 스칼라 | 구현 hyperparameter |
| $\gamma$ | feature별 gain | 실수 벡터, $(D)$ | 학습 매개변수 |
| $\operatorname{RMSNorm}_{\epsilon}(h)$ | RMSNorm 출력 | 실수 벡터, $(D)$ | 다음 sublayer 입력 |

원 논문은 re-scaling invariance를 핵심 동기로 제시했다. 위에서 $\epsilon=0$이면 $h$를 양의 상수로 키워도 나눈 뒤 값은 같다. 실제 $\epsilon$은 0으로 나눔과 과도한 scale을 줄이기 위해 넣는 공학적 선택이므로, 매우 작은 벡터에서는 그 정확한 불변성을 완화한다.

### LayerNorm variance와의 차이

RMS의 제곱은 중심화하지 않은 raw second moment $D^{-1}\sum_i h_i^2$다. LayerNorm의 feature 분산은

$$
\frac1D\sum_i(h_i-\mu)^2
=\frac1D\sum_i h_i^2-\mu^2
$$

이며 $\mu=D^{-1}\sum_i h_i$다. 따라서 $\mu=0$일 때만 RMS의 제곱과 variance가 같다. 이 식은 [[확률변수·확률분포·기대값·분산]]에서 다루는 $\mathbb E[X^2]-(\mathbb E[X])^2$와 같은 대수 구조를 가지지만, 여기서는 현재 feature 축의 산술 평균을 쓴다. RMSNorm을 “평균을 뺀 뒤 variance만 쓰는 LayerNorm”이라고 설명하면 틀리다.

### LLaMA 1의 pre-norm 채택

[[089_LLaMA 1과 제한적 공개 가중치 연구 배포|LLaMA 1]]은 각 Transformer sub-layer의 **입력**을 정규화하는 pre-normalization 구조에 RMSNorm을 사용했다. Touvron 등은 이 선택을 설명하면서 RMSNorm을 제안한 Zhang·Sennrich를 명시적으로 인용했다. 따라서 RMSNorm을 현대 decoder-only LLM 조합에 넣어 규모 있게 검증한 채택은 LLaMA의 설계 일부이지만, 기법 자체를 LLaMA가 발명한 것은 아니다. Pre-norm 위치의 residual·gradient 경계는 [[Layer Normalization]]과 [[Transformer]]가 맡는다.

## 검증과 한계

### 주장과 범위

### 확인된 사실과 한계

Zhang·Sennrich는 re-centering invariance가 필수적이지 않고 re-scaling invariance만으로 충분할 수 있다는 가설을 제시했다. 여러 RNN·Transformer 등에서 LayerNorm과 비슷한 성능, 구현별 7–64% 실행 시간 감소를 보고했다. 이는 모든 모델·hardware·kernel에서 같은 속도 향상이나 보편적 우월성을 보장하지 않는다.

LLaMA 1의 성능은 RMSNorm 하나만의 ablation 결과가 아니다. Pre-norm, SwiGLU, RoPE, 데이터 혼합, 모델 크기와 학습 token 수가 함께 달라졌으므로 LLaMA의 benchmark 결과를 RMSNorm의 인과적 우월성으로 돌리지 않는다. RMSNorm은 확률분포 보정, attention mask 오류, optimizer 안정성 전체를 대신 해결하지도 않는다.

## 학습 확인

### 확인 질문과 답

1. RMSNorm은 LayerNorm에서 어떤 계산을 제거하는가?

   **답:** feature 평균을 빼는 mean centering과 그 평균 주위의 variance 계산을 제거하고, 중심화하지 않은 제곱 평균의 제곱근만 쓴다.

2. RMS의 제곱과 중심화한 variance는 언제 같은가?

   **답:** 현재 feature 축의 평균 $\mu$가 0일 때만 $D^{-1}\sum_i h_i^2=D^{-1}\sum_i(h_i-\mu)^2$가 된다.

3. LLaMA 1의 RMSNorm 채택을 RMSNorm의 발명이나 단독 성능 ablation으로 부를 수 없는 이유는 무엇인가?

   **답:** RMSNorm은 Zhang·Sennrich가 제안했고, LLaMA 1의 결과에는 pre-norm·SwiGLU·RoPE·자료·규모가 함께 작용했기 때문이다.

### 다음 문서

- [[Batch Normalization]] — 사례 안 feature가 아니라 mini-batch 사례 사이에서 통계를 공유하는 방법과 대조한다.
- [[LLaMA 1]] — pre-norm RMSNorm을 SwiGLU·RoPE와 함께 채택한 대규모 decoder-only 모델 사례를 본다.

## 출처

- [[049_층 정규화와 시퀀스 모델의 배치 독립성]]
- Biao Zhang·Rico Sennrich, [Root Mean Square Layer Normalization](https://proceedings.neurips.cc/paper/2019/hash/1e8a19426224ca89e83cef47f1e7f53b-Abstract.html), 2019.
- Jimmy Lei Ba·Jamie Ryan Kiros·Geoffrey E. Hinton, [Layer Normalization](https://arxiv.org/abs/1607.06450), 2016.
- John Tsitsiklis·Patrick Jaillet, [Introduction to Probability: Lecture 6](https://ocw.mit.edu/courses/res-6-012-introduction-to-probability-spring-2018/resources/lecture-6-discrete-random-variables-part-ii/), 2018, §6.2.
- [[089_LLaMA 1과 제한적 공개 가중치 연구 배포]]
- Hugo Touvron 외, [LLaMA: Open and Efficient Foundation Language Models](https://arxiv.org/abs/2302.13971), 2023, §2.2의 “Pre-normalization” 단락.
- 프로젝트 보존 자료: `raw/089_LLaMA Meta's Open Foundation Models That Democratized Language AI Research.ko.md`, `raw/089_LLaMA Meta's Open Foundation Models That Democratized Language AI Research.commentary.ko.md`.

## 관련 항목

- [[049_층 정규화와 시퀀스 모델의 배치 독립성]]
- [[확률변수·확률분포·기대값·분산]]
- [[Layer Normalization]]
- [[089_LLaMA 1과 제한적 공개 가중치 연구 배포]]
- [[LLaMA 1]]
