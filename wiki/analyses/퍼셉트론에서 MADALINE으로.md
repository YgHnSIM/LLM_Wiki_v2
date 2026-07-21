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
updated: '2026-07-21'
lifecycle: active
verification: partial
artifacts:
  - raw/004_The Perceptron.md
  - raw/004_The Perceptron.commentary.md
  - raw/006_1962_위드로-호프_MADALINE.md
  - raw/006_1962_위드로-호프_MADALINE_해설.md
  - raw/018_Backpropagation - Training Deep Neural Networks.ko.md
  - raw/018_Backpropagation - Training Deep Neural Networks.commentary.ko.md
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
  - source_id: rumelhart-hinton-williams-1986-nature
    locator: pp. 533–536
    relation: supplements
  - source_id: rumelhart-hinton-williams-1986-pdp
    locator: pp. 318–328
    relation: supplements
related:
  - concept.퍼셉트론
  - concept.adaline
  - concept.madaline
  - concept.lms-알고리즘
  - concept.경사하강법
  - concept.역전파
  - concept.다층-퍼셉트론
  - concept.특징-공학
  - analysis.규칙-기반-ai에서-데이터-기반-학습으로
  - analysis.ai-시연과-실제-성능
---
# 퍼셉트론에서 MADALINE으로

> [!note] 학습 안내
> **난이도:** 중급<br>
> **선수 지식:** [[퍼셉트론]], [[ADALINE]]<br>
> **읽고 나면:** 초기 신경망을 학습 신호·구조·구현 범위로 비교하고 역전파와의 차이를 설명할 수 있다.

## 1단계 — 먼저 잡을 핵심

### 비교 질문과 잠정 결론

[[004_퍼셉트론]]과 [[006_위드로-호프의 MADALINE]]은 1960년 전후의 서로 다른 신경망 학습 규칙을 비교하게 한다. 전자를 순수한 이론 시연, 후자를 즉시 완성된 산업 시스템으로 대립시키기보다 오류 신호, 표현 범위, 하드웨어 구현의 차이를 살펴보는 편이 정확하다.

## 2단계 — 작동 원리

### 학습 신호의 변화

[[퍼셉트론]]은 임계값을 지난 이진 출력이 정답과 다른지를 기준으로 가중치를 수정한다. [[ADALINE]]은 임계값 전의 연속 선형 출력과 목표값 사이의 차이를 사용한다. 이 차이는 오류의 크기를 가중치 갱신에 반영할 수 있게 하며, [[LMS 알고리즘]]을 통한 점진적 최적화로 이어진다.

### 단일 유닛에서 혼합 구조로

[[MADALINE]]은 여러 ADALINE을 병렬로 놓아 단일 유닛보다 다양한 패턴에 반응하게 했다. 그러나 최종 논리층은 고정되어 있었고 사람이 결합 규칙을 정했다. 따라서 MADALINE은 완전히 학습되는 다층 신경망이 아니라, 학습 가능한 부분과 수작업 구조가 공존하는 혼합 시스템이다.

### 남은 병목

데이터에서 가중치를 학습한다고 해서 수작업 설계가 사라진 것은 아니다. MADALINE은 입력 [[특징 공학]], 유닛 수, 논리 게이트 연결을 전문가가 정해야 했다. 이는 [[지식 공학 병목]]이 규칙 작성에서 특징과 구조 설계의 문제로 형태를 바꾸어 남을 수 있음을 보여준다.

## 3단계 — 기술과 근거

### 구현과 응용의 차이

퍼셉트론과 Madaline I은 모두 실제 하드웨어 연구 대상이었다. 초기 ADALINE·MADALINE 응용에는 패턴·음성 인식, 기상 예측, 적응 제어가 포함됐다. 잡음 제거와 에코 제거는 이후 [[LMS 알고리즘]] 기반 [[적응 필터]] 연구의 성과이며 MADALINE 자체의 대표 배치 사례로 분류하지 않는다.

### 역전파가 추가한 경계

[[018_역전파와 다층 신경망 학습]]에서 검증한 [[역전파]]는 합성 함수의 각 학습 가능 매개변수에 대한 손실 그래디언트를 역방향으로 계산한다. 이로써 고정 논리층과 국소 규칙에 의존한 초기 혼합 구조와 달리, [[다층 퍼셉트론]]의 은닉층을 하나의 목적 함수에 맞춰 공동 학습할 수 있다. 다만 역전파는 그래디언트 계산이고 [[경사하강법]]은 그 값을 이용한 갱신이므로 두 알고리즘을 같은 것으로 쓰지 않는다.

## 검증과 한계

### 확인된 사실

퍼셉트론, ADALINE·MADALINE, 역전파는 서로 다른 오류 신호와 학습 가능 범위를 가진다. 초기 시스템의 하드웨어 구현과 적응 필터의 후대 응용도 같은 배치 사례로 합치지 않는다.

### 현대적 해석

현대 [[대규모 언어 모델]]은 미분 가능한 다층 네트워크에서 대량의 매개변수를 학습한다. 퍼셉트론의 오류 수정, 선형 LMS의 그래디언트 추정, Madaline I의 최소 교란 규칙, 역전파는 관련된 역사 안에 있지만 동일한 알고리즘은 아니다. 직접 선조라는 단선적 표현보다 차이와 재사용된 수학적 모티프를 함께 기록해야 한다.

### 비교를 통한 해석

학습이 도입되어도 특징과 구조 설계의 병목이 남는다는 결론은 여러 시스템을 함께 놓아 얻은 합성 해석이다. 알고리즘 사이의 차이를 유지할 때만 이 비교가 유효하다.

### 아직 입증되지 않은 계보

초기 오류 수정 규칙에서 현대 대규모 언어 모델까지 하나의 알고리즘이 그대로 이어졌다는 계보는 입증되지 않는다. 확인할 수 있는 것은 일부 수학적 모티프의 재사용과 학습 가능 범위의 변화다.

## 학습 확인

### 확인 질문

1. 퍼셉트론과 ADALINE은 어떤 오류 신호를 이용해 가중치를 바꾸는가?
2. MADALINE에서 학습되는 부분과 사람이 정하는 부분은 각각 무엇인가?
3. 역전파를 경사하강법이나 초기 국소 학습 규칙과 동일시하면 안 되는 이유는 무엇인가?

### 다음 문서

- [[규칙 기반 AI에서 데이터 기반 학습으로]] — 초기 신경망에서 확인한 학습과 수작업 설계의 공존을 더 넓은 AI 역사에서 비교한다.

## 출처

- [[004_퍼셉트론]]
- [[006_위드로-호프의 MADALINE]]
- [[018_역전파와 다층 신경망 학습]]
- David E. Rumelhart·Geoffrey E. Hinton·Ronald J. Williams, [Learning representations by back-propagating errors](https://doi.org/10.1038/323533a0), 1986, pp. 533–536.

## 관련 항목

- [[퍼셉트론]]
- [[ADALINE]]
- [[MADALINE]]
- [[LMS 알고리즘]]
- [[경사하강법]]
- [[역전파]]
- [[다층 퍼셉트론]]
- [[특징 공학]]
- [[규칙 기반 AI에서 데이터 기반 학습으로]]
- [[AI 시연과 실제 성능]]
