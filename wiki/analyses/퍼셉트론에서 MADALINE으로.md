---
schema_version: 2
id: analysis.퍼셉트론에서-madaline으로
page_type: analysis
title: 퍼셉트론에서 MADALINE으로
aliases:
  - Perceptron to MADALINE
  - 퍼셉트론과 ADALINE 비교
  - 초기 신경망의 공학화
tags:
  - type/analysis
  - domain/ai
  - domain/machine-learning
  - domain/signal-processing
created: '2026-07-14'
updated: '2026-07-15'
lifecycle: active
verification: partial
artifacts:
  - raw/004_The Perceptron.md
  - raw/004_The Perceptron.commentary.md
  - raw/006_1962_위드로-호프_MADALINE.md
  - raw/006_1962_위드로-호프_MADALINE_해설.md
evidence:
  - source_id: rosenblatt-1958
    locator: pp. 386–408
    relation: supports
  - source_id: widrow-lehr-1990
    locator: pp. 1415–1433
    relation: supports
  - source_id: novikoff-1963
    locator: pp. 91–104
    relation: supplements
  - source_id: widrow-hoff-1960
    locator: Adaptive Switching Circuits
    relation: supports
  - source_id: widrow-winter-1988
    locator: pp. 1-401–1-408
    relation: supports
related:
  - concept.퍼셉트론
  - concept.adaline
  - concept.madaline
  - concept.lms-알고리즘
  - concept.경사하강법
  - concept.특징-공학
  - analysis.규칙-기반-ai에서-데이터-기반-학습으로
  - analysis.ai-시연과-실제-성능
---
# 퍼셉트론에서 MADALINE으로

[[004_퍼셉트론]]과 [[006_위드로-호프의 MADALINE]]은 1960년 전후의 서로 다른 신경망 학습 규칙을 비교하게 한다. 전자를 순수한 이론 시연, 후자를 즉시 완성된 산업 시스템으로 대립시키기보다 오류 신호, 표현 범위, 하드웨어 구현의 차이를 살펴보는 편이 정확하다.

## 학습 신호의 변화

[[퍼셉트론]]은 임계값을 지난 이진 출력이 정답과 다른지를 기준으로 가중치를 수정한다. [[ADALINE]]은 임계값 전의 연속 선형 출력과 목표값 사이의 차이를 사용한다. 이 차이는 오류의 크기를 가중치 갱신에 반영할 수 있게 하며, [[LMS 알고리즘]]을 통한 점진적 최적화로 이어진다.

## 단일 유닛에서 혼합 구조로

[[MADALINE]]은 여러 ADALINE을 병렬로 놓아 단일 유닛보다 다양한 패턴에 반응하게 했다. 그러나 최종 논리층은 고정되어 있었고 사람이 결합 규칙을 정했다. 따라서 MADALINE은 완전히 학습되는 다층 신경망이 아니라, 학습 가능한 부분과 수작업 구조가 공존하는 혼합 시스템이다.

## 구현과 응용의 차이

퍼셉트론과 Madaline I은 모두 실제 하드웨어 연구 대상이었다. 초기 ADALINE·MADALINE 응용에는 패턴·음성 인식, 기상 예측, 적응 제어가 포함됐다. 잡음 제거와 에코 제거는 이후 [[LMS 알고리즘]] 기반 [[적응 필터]] 연구의 성과이며 MADALINE 자체의 대표 배치 사례로 분류하지 않는다.

## 남은 병목

데이터에서 가중치를 학습한다고 해서 수작업 설계가 사라진 것은 아니다. MADALINE은 입력 [[특징 공학]], 유닛 수, 논리 게이트 연결을 전문가가 정해야 했다. 이는 [[지식 공학 병목]]이 규칙 작성에서 특징과 구조 설계의 문제로 형태를 바꾸어 남을 수 있음을 보여준다.

## 현대적 해석

현대 [[대규모 언어 모델]]은 미분 가능한 다층 네트워크에서 대량의 매개변수를 학습한다. 퍼셉트론의 오류 수정, 선형 LMS의 그래디언트 추정, Madaline I의 최소 교란 규칙, 역전파는 관련된 역사 안에 있지만 동일한 알고리즘은 아니다. 직접 선조라는 단선적 표현보다 차이와 재사용된 수학적 모티프를 함께 기록해야 한다.

## 출처

- [[004_퍼셉트론]]
- [[006_위드로-호프의 MADALINE]]

## 관련 항목

- [[퍼셉트론]]
- [[ADALINE]]
- [[MADALINE]]
- [[LMS 알고리즘]]
- [[경사하강법]]
- [[특징 공학]]
- [[규칙 기반 AI에서 데이터 기반 학습으로]]
- [[AI 시연과 실제 성능]]
