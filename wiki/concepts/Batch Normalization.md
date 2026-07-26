---
schema_version: 3
id: concept.batch-normalization
page_type: concept
title: Batch Normalization
aliases:
  - BatchNorm
  - 배치 정규화
tags:
  - type/concept
  - domain/ai
  - domain/machine-learning
  - domain/optimization
created: '2026-07-18'
updated: '2026-07-21'
editorial_status: active
review:
  evidence_coverage: verified
  content_mode: descriptive
artifacts:
  - raw/049_Layer Normalization Feature-Wise Normalization for Sequence Models.ko.md
  - raw/049_Layer Normalization Feature-Wise Normalization for Sequence Models.commentary.ko.md
evidence:
  - source_id: ioffe-szegedy-2015-batch-normalization
    locator: '초록과 §§2–3의 mini-batch mean·variance, learned scale/shift와 train/inference 차이'
    relation: supports
  - source_id: santurkar-et-al-2018-batchnorm-optimization
    locator: 초록과 §§1–3·6의 internal covariate shift 반례와 loss/gradient smoothness
    relation: contextualizes
relations:
  - target: source.049
    kind: related
learning:
  difficulty:
    entry: introductory
    target: introductory
  prerequisites: []
  assumed_knowledge: 없음
  outcomes:
    - BatchNorm이 mini-batch 통계를 쓰는 방식과 훈련·추론 계산이 달라지는 이유를 설명할 수 있다.
  next:
    - target: concept.layer-normalization
      reason: Layer Normalization — batch의 다른 사례를 쓰지 않는 정규화가 통계 축을 어떻게 바꾸는지 비교한다.
---
# Batch Normalization

> [!note] 학습 안내
> **난이도:** 입문<br>
> **선수 지식:** 없음<br>
> **읽고 나면:** BatchNorm이 mini-batch 통계를 쓰는 방식과 훈련·추론 계산이 달라지는 이유를 설명할 수 있다.

## 1단계 — 먼저 잡을 핵심

[[Batch Normalization]]은 같은 feature/neuron의 활성화를 mini-batch의 여러 훈련 사례에서 계산한 평균·분산으로 표준화하고 학습 가능한 scale·shift를 적용하는 기법이다. 2015년 Ioffe·Szegedy가 깊은 feed-forward·convolutional network의 더 빠르고 안정적인 훈련을 위해 제안했다.

## 2단계 — 작동 원리

### 훈련과 추론

훈련 중 한 사례의 출력은 같은 mini-batch에 포함된 다른 사례에 의존한다. 추론에서는 일반적으로 훈련에서 누적한 population mean·variance 추정치를 사용하므로 train/eval mode가 다르다. 작은 batch, 분포 변화, 시퀀스 time step별 통계에서는 이 차이가 중요할 수 있다.

## 3단계 — 기술과 근거

### 작동 원리의 논쟁

원 논문은 이전 층 변화에 따른 internal covariate shift 감소를 동기로 제시했다. Santurkar 등의 후속 연구는 분포 안정성이 성능 향상의 좋은 설명이 아니며 BatchNorm이 loss와 gradient를 더 smooth하게 만드는 효과를 제시했다. BatchNorm의 성공을 하나의 확정된 원인으로 환원하지 않는다.

BatchNorm은 batch noise가 regularization처럼 작동할 수 있고 CNN에서 널리 쓰이지만 모든 구조에 최적은 아니다. [[Layer Normalization]]은 사례 안 feature 통계를 사용해 batch 의존성을 피한다.

## 검증과 한계

BatchNorm의 효과를 internal covariate shift 하나로 확정하지 않는다. 작은 batch나 바뀐 입력 분포에서는 통계 추정과 train/eval 차이가 중요하며, 시퀀스 구조에서는 batch와 time step에 걸친 통계 관리가 별도 설계를 요구한다.

## 학습 확인

### 확인 질문

1. BatchNorm은 평균·분산을 어떤 사례들 사이에서 계산하는가?
2. 훈련과 추론에서 사용하는 통계가 왜 달라지는가?
3. internal covariate shift만으로 BatchNorm의 효과를 확정할 수 없는 이유는 무엇인가?

### 다음 문서

- [[concept.layer-normalization|Layer Normalization]] — batch의 다른 사례를 쓰지 않는 정규화가 통계 축을 어떻게 바꾸는지 비교한다.

## 출처

- [[049_층 정규화와 시퀀스 모델의 배치 독립성]]
- Sergey Ioffe·Christian Szegedy, [Batch Normalization](https://proceedings.mlr.press/v37/ioffe15.html), 2015.
- Shibani Santurkar 외, [How Does Batch Normalization Help Optimization?](https://proceedings.neurips.cc/paper/2018/hash/905056c1ac1dad141560467e0a99e1cf-Abstract.html), 2018.

## 관련 항목

- [[concept.layer-normalization|Layer Normalization]]
- [[source.049|층 정규화와 시퀀스 모델의 배치 독립성]]
