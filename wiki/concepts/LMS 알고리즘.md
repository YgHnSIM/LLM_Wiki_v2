---
schema_version: 3
id: concept.lms-알고리즘
page_type: concept
title: LMS 알고리즘
aliases:
  - Least Mean Squares
  - LMS
  - 최소 평균 제곱 알고리즘
  - Widrow-Hoff rule
  - 위드로-호프 규칙
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
  - target: concept.madaline
    kind: related
  - target: concept.지도-학습
    kind: related
learning:
  difficulty:
    entry: intermediate
    target: intermediate
  prerequisites:
    - target: concept.adaline
  assumed_knowledge: 없음
  outcomes:
    - LMS가 목표와 선형 출력의 오차를 이용해 가중치를 갱신하는 방식을 설명할 수 있다.
  next:
    - target: concept.경사하강법
      reason: 경사하강법 — LMS를 더 넓은 그래디언트 기반 최적화 계열에서 위치시킨다.
    - target: concept.적응-필터
      reason: 적응 필터 — 같은 선형 갱신 구조가 신호 처리에서 어떻게 쓰이는지 살펴본다.
---
# LMS 알고리즘

> [!note] 학습 안내
> **난이도:** 중급<br>
> **선수 지식:** [[concept.adaline|ADALINE]]<br>
> **읽고 나면:** LMS가 목표와 선형 출력의 오차를 이용해 가중치를 갱신하는 방식을 설명할 수 있다.

## 1단계 — 먼저 잡을 핵심

### 핵심 정의

[[LMS 알고리즘]](Least Mean Squares)은 목표 출력과 실제 선형 출력 사이의 평균제곱오차를 줄이도록 가중치를 반복 조정하는 적응 학습 규칙이며 Widrow–Hoff 규칙으로도 불린다. 기본 적용 대상은 [[ADALINE]]의 임계값 이전 선형 결합기다. 이를 MADALINE 전체의 고정 논리층까지 직접 학습시키는 규칙으로 설명해서는 안 된다.

## 2단계 — 작동 원리

### 오차에서 갱신까지

한 표본을 입력해 연속 출력을 계산하고, 목표값과의 차이를 구한다. 이 오차에 입력과 학습률을 곱해 각 가중치를 바꾸며 같은 과정을 다음 표본에서 반복한다.

## 3단계 — 기술과 근거

### 가중치 갱신

한 표본에서 사용하는 대표적인 가중치 변화량은 다음과 같다.

$$
\Delta w_{ij} = \alpha \cdot (d-y_i) \cdot x_j
$$

$d-y_i$는 목표값과 실제 출력의 차이, $x_j$는 입력, $\alpha$는 학습률이다. 오차가 크고 해당 입력이 강하게 활성화될수록 가중치가 더 크게 바뀐다.

### 의미

LMS는 순간 제곱오차의 그래디언트를 평균제곱오차 그래디언트의 추정치로 사용한다. 계산이 단순해 제한된 하드웨어에서도 구현하기 쉬웠고 [[적응 필터]]와 신호 처리 문제에 널리 쓰였다. 선형 결합기의 평균제곱오차는 가중치에 대한 볼록 이차 함수이므로, 입력 상관행렬이 가역일 때 하나의 전역 최솟값을 갖는다.

## 검증과 한계

### 한계

학습률이 너무 크면 진동하거나 발산할 수 있고, 너무 작으면 수렴이 느리다. 확률적 입력에서는 최솟값 주변에 잔류 오차가 생길 수 있다. 그러나 이를 여러 국소 최솟값에 갇히는 문제와 혼동하면 안 된다. 국소 최적점은 signum 오차나 비선형 다층 구조에서 별도로 나타날 수 있다.

## 학습 확인

### 확인 질문

1. LMS 알고리즘이 줄이려는 오차는 어떤 두 출력 사이에서 계산되는가?
2. 오차, 입력, 학습률은 한 표본의 가중치 변화량에 어떻게 함께 작용하는가?
3. 선형 결합기의 잔류 오차를 여러 국소 최솟값 문제와 구분해야 하는 이유는 무엇인가?

### 다음 문서

- [[concept.경사하강법|경사하강법]] — LMS를 더 넓은 그래디언트 기반 최적화 계열에서 위치시킨다.
- [[concept.적응-필터|적응 필터]] — 같은 선형 갱신 구조가 신호 처리에서 어떻게 쓰이는지 살펴본다.

## 출처

- [[006_위드로-호프의 MADALINE]]
- Bernard Widrow·Michael A. Lehr, [30 Years of Adaptive Neural Networks](https://isl.stanford.edu/people/widrow/papers/j199030years.pdf), 1990, pp. 1428–1429·1432.

## 관련 항목

- [[concept.경사하강법|경사하강법]]
- [[concept.적응-필터|적응 필터]]
- [[concept.adaline|ADALINE]]
- [[concept.madaline|MADALINE]]
- [[concept.지도-학습|지도 학습]]
