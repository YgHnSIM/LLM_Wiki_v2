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
updated: '2026-07-18'
lifecycle: active
verification: verified
artifacts:
  - 'raw/048_Layer Normalization Feature-Wise Normalization for Sequence Models.ko.md'
  - 'raw/048_Layer Normalization Feature-Wise Normalization for Sequence Models.commentary.ko.md'
evidence:
  - source_id: zhang-sennrich-2019-rmsnorm
    locator: '초록과 §§3–5의 re-centering 제거, RMS 식, pRMSNorm과 속도·성능 평가'
    relation: supports
  - source_id: ba-kiros-hinton-2016-layer-normalization
    locator: '§§2–3의 mean·variance LayerNorm 정의'
    relation: contextualizes
related:
  - source.048
  - concept.layer-normalization
---
# RMSNorm

[[RMSNorm]]은 [[Layer Normalization]]에서 mean centering을 제거하고 feature 벡터의 root mean square로 scale만 정규화하는 변형이다.

$$
\operatorname{RMS}(h)=\sqrt{\frac1d\sum_i h_i^2},\qquad
\operatorname{RMSNorm}(h)=\gamma\odot\frac{h}{\operatorname{RMS}(h)+\epsilon}
$$

## 분산과의 차이

RMS의 제곱은 중심화하지 않은 2차 moment (d^{-1}\sum_i h_i^2)다. LayerNorm의 variance (d^{-1}\sum_i(h_i-\mu)^2)와는 평균이 0일 때만 같다. 따라서 RMSNorm을 “평균을 뺀 뒤 variance만 사용하는 LayerNorm”이라고 설명하면 틀리다.

## 주장과 범위

Zhang·Sennrich는 re-centering invariance가 필수적이지 않고 re-scaling invariance만으로 충분할 수 있다는 가설을 제시했다. 여러 RNN·Transformer 등에서 LayerNorm과 비슷한 성능, 구현별 7–64% 실행 시간 감소를 보고했다. 이는 모든 모델에서 같은 속도 향상이나 보편적 우월성을 보장하지 않는다.

## 출처

- [[048_층 정규화와 시퀀스 모델의 배치 독립성]]
- Biao Zhang·Rico Sennrich, [Root Mean Square Layer Normalization](https://proceedings.neurips.cc/paper/2019/hash/1e8a19426224ca89e83cef47f1e7f53b-Abstract.html), 2019.
- Jimmy Lei Ba·Jamie Ryan Kiros·Geoffrey E. Hinton, [Layer Normalization](https://arxiv.org/abs/1607.06450), 2016.

## 관련 항목

- [[048_층 정규화와 시퀀스 모델의 배치 독립성]]
- [[Layer Normalization]]
