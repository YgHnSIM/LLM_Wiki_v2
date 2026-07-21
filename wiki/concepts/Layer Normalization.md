---
schema_version: 2
id: concept.layer-normalization
page_type: concept
title: Layer Normalization
aliases: [LayerNorm, 층 정규화, 레이어 정규화]
tags:
  - type/concept
  - domain/ai
  - domain/nlp
  - domain/machine-learning
  - domain/optimization
created: '2026-07-18'
updated: '2026-07-21'
lifecycle: active
verification: verified
artifacts:
  - 'raw/048_Layer Normalization Feature-Wise Normalization for Sequence Models.ko.md'
  - 'raw/048_Layer Normalization Feature-Wise Normalization for Sequence Models.commentary.ko.md'
evidence:
  - source_id: ba-kiros-hinton-2016-layer-normalization
    locator: '초록과 §§2–3의 layer mean·variance·gain/bias와 recurrent formulation, §§4–5의 실험'
    relation: supports
  - source_id: vaswani-et-al-2017-attention
    locator: '§3.1의 post-LN Add & Norm'
    relation: contextualizes
  - source_id: xiong-et-al-2020-transformer-layernorm
    locator: '초록과 §§2–4의 Post-LN·Pre-LN 정의와 초기 gradient 분석'
    relation: supplements
related:
  - source.049
  - concept.batch-normalization
  - concept.rmsnorm
  - concept.잔차-연결
---
# Layer Normalization

> [!note] 학습 안내
> **난이도:** 중급<br>
> **선수 지식:** [[Batch Normalization]]<br>
> **읽고 나면:** LayerNorm이 사례별 feature 축에서 통계를 계산하는 방식과 RNN·Transformer에서의 배치를 설명할 수 있다.

## 1단계 — 먼저 잡을 핵심

[[Layer Normalization]]은 한 사례의 정해진 feature axes에서 평균·분산을 계산해 활성화를 표준화하고 feature별 gain·bias를 적용하는 정규화다. mini-batch의 다른 사례를 통계에 쓰지 않아 훈련과 추론에서 같은 계산을 사용한다.

## 2단계 — 작동 원리

### 처리 흐름

한 사례의 현재 hidden vector에서 정해진 feature 축의 평균·분산을 계산하고, 각 값을 표준화한 뒤 학습 가능한 scale과 offset을 적용한다. 다른 batch 사례의 통계를 기다리지 않으므로 훈련과 추론에서 같은 절차를 쓴다.

## 3단계 — 기술과 근거

### 수식과 축

(h\in\mathbb R^d)에 대해 다음을 계산한다.

$$
\operatorname{LN}(h)=\gamma\odot
\frac{h-\mu(h)}{\sqrt{\sigma^2(h)+\epsilon}}+\beta
$$

RNN에서는 각 time step의 hidden units, 표준 Transformer에서는 보통 각 token의 hidden dimension이 (d)가 된다. 정규화 축은 구현의 tensor shape로 확인해야 하며 한 문장 전체를 항상 하나의 평균·분산으로 묶는 것은 아니다.

affine 전 값은 feature 축에서 평균 0·분산 1에 가깝다. 최종 출력은 (gamma,eta) 때문에 이 성질을 그대로 갖지 않을 수 있다. 공통 affine parameter는 정규화로 사라진 사례별 원래 평균·분산을 일반적으로 복원하지 않는다.

### RNN과 Transformer

원 논문은 RNN·LSTM에서 time step별 통계를 계산해 hidden dynamics를 안정화하고 여러 시퀀스 과제에서 수렴을 평가했다. Transformer 원 구조는 residual addition 뒤 LayerNorm을 둔 Post-LN이었다. 후대 Pre-LN은 sublayer 입력을 먼저 정규화해 residual path를 더 직접적으로 유지한다.

LayerNorm은 batch size·구성에 독립적이지만 정규화 축 안의 feature들은 서로의 통계에 영향을 준다. 외부 분포 이동·과적합·사실성을 해결하는 기법도 아니다.

## 검증과 한계

LayerNorm이 batch 사례 사이의 의존성을 없앤다는 사실과 feature 사이의 의존성까지 없앤다는 주장은 다르다. 정규화 축과 residual branch의 pre/post 위치는 구현마다 확인해야 하며, LayerNorm 하나가 대규모 학습의 안정성을 보장하지는 않는다.

## 학습 확인

### 확인 질문

1. LayerNorm은 평균·분산을 어떤 축에서 계산하는가?
2. batch size가 달라져도 훈련과 추론 계산이 같은 이유는 무엇인가?
3. Post-LN과 Pre-LN은 잔차 경로에서 정규화 위치가 어떻게 다른가?

### 다음 문서

- [[RMSNorm]] — mean centering을 제거하고 RMS만으로 scale을 조정하는 변형을 비교한다.

## 출처

- [[049_층 정규화와 시퀀스 모델의 배치 독립성]]
- Jimmy Lei Ba·Jamie Ryan Kiros·Geoffrey E. Hinton, [Layer Normalization](https://arxiv.org/abs/1607.06450), 2016.
- Ashish Vaswani 외, [Attention Is All You Need](https://proceedings.neurips.cc/paper_files/paper/2017/hash/3f5ee243547dee91fbd053c1c4a845aa-Abstract.html), 2017.
- Ruibin Xiong 외, [On Layer Normalization in the Transformer Architecture](https://arxiv.org/abs/2002.04745), 2020.

## 관련 항목

- [[049_층 정규화와 시퀀스 모델의 배치 독립성]]
- [[Batch Normalization]]
- [[RMSNorm]]
- [[잔차 연결]]
