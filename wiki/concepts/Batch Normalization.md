---
schema_version: 2
id: concept.batch-normalization
page_type: concept
title: Batch Normalization
aliases: [BatchNorm, 배치 정규화]
tags:
  - type/concept
  - domain/ai
  - domain/machine-learning
  - domain/optimization
created: '2026-07-18'
updated: '2026-07-18'
lifecycle: active
verification: verified
artifacts:
  - 'raw/049_Layer Normalization Feature-Wise Normalization for Sequence Models.ko.md'
  - 'raw/049_Layer Normalization Feature-Wise Normalization for Sequence Models.commentary.ko.md'
evidence:
  - source_id: ioffe-szegedy-2015-batch-normalization
    locator: '초록과 §§2–3의 mini-batch mean·variance, learned scale/shift와 train/inference 차이'
    relation: supports
  - source_id: santurkar-et-al-2018-batchnorm-optimization
    locator: '초록과 §§1–3·6의 internal covariate shift 반례와 loss/gradient smoothness'
    relation: contextualizes
related:
  - source.049
  - concept.layer-normalization
---
# Batch Normalization

[[Batch Normalization]]은 같은 feature/neuron의 활성화를 mini-batch의 여러 훈련 사례에서 계산한 평균·분산으로 표준화하고 학습 가능한 scale·shift를 적용하는 기법이다. 2015년 Ioffe·Szegedy가 깊은 feed-forward·convolutional network의 더 빠르고 안정적인 훈련을 위해 제안했다.

## 훈련과 추론

훈련 중 한 사례의 출력은 같은 mini-batch에 포함된 다른 사례에 의존한다. 추론에서는 일반적으로 훈련에서 누적한 population mean·variance 추정치를 사용하므로 train/eval mode가 다르다. 작은 batch, 분포 변화, 시퀀스 time step별 통계에서는 이 차이가 중요할 수 있다.

## 작동 원리의 논쟁

원 논문은 이전 층 변화에 따른 internal covariate shift 감소를 동기로 제시했다. Santurkar 등의 후속 연구는 분포 안정성이 성능 향상의 좋은 설명이 아니며 BatchNorm이 loss와 gradient를 더 smooth하게 만드는 효과를 제시했다. BatchNorm의 성공을 하나의 확정된 원인으로 환원하지 않는다.

BatchNorm은 batch noise가 regularization처럼 작동할 수 있고 CNN에서 널리 쓰이지만 모든 구조에 최적은 아니다. [[Layer Normalization]]은 사례 안 feature 통계를 사용해 batch 의존성을 피한다.

## 출처

- [[049_층 정규화와 시퀀스 모델의 배치 독립성]]
- Sergey Ioffe·Christian Szegedy, [Batch Normalization](https://proceedings.mlr.press/v37/ioffe15.html), 2015.
- Shibani Santurkar 외, [How Does Batch Normalization Help Optimization?](https://proceedings.neurips.cc/paper/2018/hash/905056c1ac1dad141560467e0a99e1cf-Abstract.html), 2018.

## 관련 항목

- [[049_층 정규화와 시퀀스 모델의 배치 독립성]]
- [[Layer Normalization]]
