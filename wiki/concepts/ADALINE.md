---
schema_version: 3
id: concept.adaline
page_type: concept
title: ADALINE
aliases:
  - ADAptive LINear Element
  - 적응형 선형 소자
  - 적응 선형 유닛
tags:
  - type/concept
  - domain/ai
  - domain/machine-learning
  - domain/signal-processing
created: '2026-07-14'
updated: '2026-07-21'
editorial_status: active
review:
  evidence_coverage: verified
  content_mode: descriptive
artifacts:
  - raw/006_1962_위드로-호프_MADALINE.md
  - raw/006_1962_위드로-호프_MADALINE_해설.md
evidence:
  - source_id: widrow-lehr-1990
    locator: pp. 1415–1433
    relation: supports
  - source_id: widrow-hoff-1960
    locator: Adaptive Switching Circuits
    relation: supports
relations:
  - target: concept.퍼셉트론
    kind: related
  - target: concept.경사하강법
    kind: related
learning:
  difficulty:
    entry: intermediate
    target: intermediate
  prerequisites:
    - target: concept.선형-분류기
  assumed_knowledge: 없음
  outcomes:
    - ADALINE이 연속 선형 출력의 오차로 학습하며 퍼셉트론과 어떻게 다른지 설명할 수 있다.
  next:
    - target: concept.lms-알고리즘
      reason: LMS 알고리즘 — 연속 출력 오차로 가중치를 갱신하는 규칙을 자세히 본다.
    - target: concept.madaline
      reason: MADALINE — 여러 ADALINE을 결합한 초기 다요소 구조로 확장한다.
---
# ADALINE

> [!note] 학습 안내
> **난이도:** 중급<br>
> **선수 지식:** [[concept.선형-분류기|선형 분류기]]<br>
> **읽고 나면:** ADALINE이 연속 선형 출력의 오차로 학습하며 퍼셉트론과 어떻게 다른지 설명할 수 있다.

## 1단계 — 먼저 잡을 핵심

### 핵심 정의

[[ADALINE]]은 입력의 가중합을 계산하는 적응형 선형 유닛이다. 초기 문헌은 이름을 adaptive linear element와 adaptive linear neuron 두 방식으로 풀어 썼다. 최종 판단에는 임계값을 적용할 수 있지만, [[LMS 알고리즘]]으로 학습할 때는 임계값 이전의 연속 선형 출력을 사용한다.

## 2단계 — 작동 원리

### 입력에서 학습 신호까지

ADALINE은 각 입력에 가중치를 곱해 더하고 편향을 더해 연속 출력을 만든다. 학습할 때는 이 출력과 목표값의 차이로 가중치를 조정하고, 이진 결정이 필요할 때만 마지막에 임계값을 적용한다.

## 3단계 — 기술과 근거

### 퍼셉트론과의 차이

[[퍼셉트론]] 규칙은 임계값을 통과한 이진 결과의 오분류를 수정한다. ADALINE의 LMS 학습은 목표값과 연속 선형 출력 사이의 차이를 이용한다. 이 차이 덕분에 평균제곱오차를 가중치에 대해 미분할 수 있으며, 선형 결합기의 오차 표면은 볼록 이차 함수가 된다.

### 계산

단일 유닛의 선형 출력은 다음과 같이 표현된다.

$$
y_i = \sum_{j=1}^{n} w_{ij}x_j + b_i
$$

여기서 입력 $x_j$와 가중치 $w_{ij}$의 곱을 합하고 편향 $b_i$를 더한다. 학습에는 $y_i$가 사용되고, 실제 이진 결정이 필요할 때 임계값을 적용한다.

## 검증과 한계

### 한계

ADALINE 하나가 학습하는 것은 입력의 선형 결합이다. 복잡한 비선형 표현이나 계층적 특징을 스스로 만들 수 없으며, 입력 특징을 정하는 [[특징 공학]]도 사람이 수행해야 했다.

## 학습 확인

### 확인 질문

1. ADALINE은 학습할 때 임계값 전과 후 중 어느 출력을 사용하는가?
2. 입력에서 연속 출력과 이진 결정까지의 흐름은 어떻게 이어지는가?
3. ADALINE의 LMS 학습은 퍼셉트론의 오분류 수정과 어떻게 다른가?

### 다음 문서

- [[concept.lms-알고리즘|LMS 알고리즘]] — 연속 출력 오차로 가중치를 갱신하는 규칙을 자세히 본다.
- [[concept.madaline|MADALINE]] — 여러 ADALINE을 결합한 초기 다요소 구조로 확장한다.

## 출처

- [[006_위드로-호프의 MADALINE]]
- Bernard Widrow·Michael A. Lehr, [30 Years of Adaptive Neural Networks](https://isl.stanford.edu/people/widrow/papers/j199030years.pdf), 1990, pp. 1417·1428–1429.
- Rodney Winter·Bernard Widrow, [MADALINE Rule II](https://isl.stanford.edu/~widrow/papers/c1988madalinerule.pdf), 1988, pp. 1-401–1-403.

## 관련 항목

- [[concept.lms-알고리즘|LMS 알고리즘]]
- [[concept.madaline|MADALINE]]
- [[concept.선형-분류기|선형 분류기]]
- [[concept.퍼셉트론|퍼셉트론]]
- [[concept.경사하강법|경사하강법]]
