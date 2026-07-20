---
schema_version: 2
id: concept.madaline
page_type: concept
title: MADALINE
aliases:
  - many ADALINEs
  - Multiple ADALINE
  - 매덜라인
tags:
  - type/concept
  - domain/ai
  - domain/machine-learning
  - domain/signal-processing
created: '2026-07-14'
updated: '2026-07-21'
lifecycle: active
verification: verified
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
  - source_id: widrow-winter-1988
    locator: pp. 1-401–1-408
    relation: supports
related:
  - concept.adaline
  - concept.lms-알고리즘
  - concept.퍼셉트론
  - concept.적응-필터
  - analysis.퍼셉트론에서-madaline으로
---
# MADALINE

> [!note] 학습 안내
> **난이도:** 중급<br>
> **선수 지식:** [[ADALINE]]<br>
> **읽고 나면:** 여러 ADALINE과 고정 논리층을 결합한 MADALINE의 구조와 학습 범위를 설명할 수 있다.

## 1단계 — 먼저 잡을 핵심

### 핵심 정의

[[MADALINE]]은 여러 [[ADALINE]] 유닛을 결합한 초기 신경망 계열이다. 1988년 1차 문헌은 이름을 “many ADALINEs”라고 명시한다. 프로젝트 raw에 있는 “Multiple Adaptive Linear Neural Networks”와 “Multiple ADAptive LINear Elements”는 대표 풀이로 사용하지 않는다.

## 2단계 — 작동 원리

### 구조

Madaline I에서는 여러 ADALINE이 같은 입력으로 서로 다른 분리 경계를 학습한다. 각 유닛의 이진 출력은 AND·OR·다수결 같은 고정 논리 요소로 전달된다. 학습 가능한 첫 층과 고정 출력층을 결합한 구조였으며, 1962년의 Madaline Rule I은 오분류를 고치기 위해 출력 전환에 필요한 변화가 작은 유닛을 선택했다.

## 3단계 — 기술과 근거

### 응용과 연구 계보

초기 ADALINE·MADALINE 연구의 응용에는 음성·패턴 인식, 기상 예측, 적응 제어가 포함됐다. 이후 연구진은 [[LMS 알고리즘]]을 이용한 [[적응 필터]]와 적응 신호 처리로 연구 중심을 옮겼다. 잡음 제거·적응 등화·에코 제거는 이 후대 계보의 성과이며, MADALINE 자체나 [[음성 활동 감지]]의 검증된 대표 사례로 합쳐 서술하지 않는다.

## 검증과 한계

### 한계

- 논리층은 학습되지 않는다.
- 각 ADALINE은 선형 결합만 학습한다.
- 입력 [[특징 공학]]과 전체 구조를 엔지니어가 정해야 한다.
- 모든 층을 함께 훈련하는 현대적 종단 간 학습과 다르다.

## 학습 확인

### 확인 질문

1. MADALINE은 어떤 유닛들을 결합한 구조인가?
2. Madaline I에서 학습 가능한 첫 층과 고정 출력층은 각각 어떤 역할을 하는가?
3. 후대 적응 필터 성과를 MADALINE 자체의 배치 사례로 합치면 안 되는 이유는 무엇인가?

### 다음 문서

- [[006_위드로-호프의 MADALINE]] — 구조와 학습 규칙의 문헌 근거와 역사적 범위를 확인한다.
- [[퍼셉트론에서 MADALINE으로]] — 퍼셉트론과 MADALINE의 학습 신호와 구조 차이를 비교한다.

## 출처

- [[006_위드로-호프의 MADALINE]]
- Rodney Winter·Bernard Widrow, [MADALINE Rule II](https://isl.stanford.edu/~widrow/papers/c1988madalinerule.pdf), 1988, p. 1-403.
- Bernard Widrow·Michael A. Lehr, [30 Years of Adaptive Neural Networks](https://isl.stanford.edu/people/widrow/papers/j199030years.pdf), 1990, pp. 1415·1419·1432.

## 관련 항목

- [[ADALINE]]
- [[LMS 알고리즘]]
- [[퍼셉트론]]
- [[적응 필터]]
- [[퍼셉트론에서 MADALINE으로]]
