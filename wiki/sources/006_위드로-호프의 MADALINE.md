---
schema_version: 2
id: source.006
page_type: source
title: 위드로-호프의 MADALINE
aliases:
  - 006_위드로-호프의 MADALINE
  - MADALINE I
  - 위드로-호프 MADALINE
tags:
  - type/source
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
  - source_id: widrow-hoff-1960
    locator: Adaptive Switching Circuits
    relation: supports
  - source_id: widrow-winter-1988
    locator: 'pp. 1-401–1-408, 특히 p. 1-403'
    relation: supports
  - source_id: widrow-lehr-1990
    locator: pp. 1415–1419 and 1428–1432
    relation: supports
  - source_id: widrow-1975
    locator: pp. 1692–1716
    relation: contextualizes
related:
  - entity.버나드-위드로
  - entity.마션-호프
  - entity.스탠퍼드-대학교
  - concept.adaline
  - concept.madaline
  - concept.lms-알고리즘
  - concept.경사하강법
  - concept.적응-필터
  - concept.음성-활동-감지
  - concept.특징-공학
  - concept.퍼셉트론
  - concept.선형-분류기
  - analysis.퍼셉트론에서-madaline으로
  - analysis.ai-시연과-실제-성능
  - concept.대규모-언어-모델
---
# 위드로-호프의 MADALINE

> [!note] 학습 안내
> **난이도:** 중급<br>
> **선수 지식:** [[퍼셉트론]]의 선형 결정 방식과 [[경사하강법]]이 오차를 줄이는 방향으로 매개변수를 바꾼다는 직관이 필요하다.<br>
> **읽고 나면:** 1960년 ADALINE·LMS와 1962년 MADALINE I 규칙을 구분하고, 여러 ADALINE을 결합한 구조와 후대 계보의 한계를 설명할 수 있다.

## 1단계 — 먼저 잡을 핵심

### 핵심 요약

[[MADALINE]] I은 여러 ADALINE의 이진 출력을 OR·AND·다수결 같은 고정 논리 요소로 결합한 초기 다요소 신경망이다. Widrow와 Lehr의 회고는 이 구조가 1960년대 초 하드웨어로 만들어져 패턴 인식 연구에 쓰였다고 기록하며, 원래 Madaline I 규칙을 1962년의 오류 수정 규칙으로 분류한다. ADALINE/LMS의 1960년 발표와 MADALINE I 학습 규칙의 1962년을 구분해야 한다.

쉽게 말하면 ADALINE 하나가 입력에 대해 하나의 이진 판단을 내리고, MADALINE I은 이런 판단 여러 개를 정해진 논리로 합친다. 여러 학습 요소와 결합 규칙을 한 시스템에 넣었다는 점이 중요하지만, 각 층을 모두 같은 방식으로 학습하는 현대 다층 신경망과는 구분해야 한다.

MADALINE은 여러 학습 요소를 결합했다는 점에서 역사적으로 중요하지만, 현대 딥러닝이나 LLM의 직접 선조라고 단정할 수는 없다. 고정 논리층과 불연속 signum을 사용한 초기 구조, 선형 LMS, 후대 역전파는 서로 연관되면서도 다른 학습 문제를 푼다.

### 핵심 문장

- MADALINE은 many ADALINEs로 구성된 초기 다요소 신경망이다.
- 선형 LMS의 볼록 오차 표면과 비선형 MADALINE 학습의 복잡한 오차 표면을 구분해야 한다.
- 초기 MADALINE 응용과 후대 적응 필터의 상용 응용은 연결된 연구사이지만 같은 시스템의 성과는 아니다.

## 2단계 — 작동 원리

### 문제와 간단한 예시

하나의 선형 경계만으로는 여러 부분 판정을 비선형적으로 조합해야 하는 패턴을 표현하기 어렵다. 작동 직관만 보기 위해 세 ADALINE이 각각 0 또는 1을 출력하고, 그중 둘 이상이 1이면 최종 출력도 1이 되는 다수결 결합을 생각할 수 있다. 이것은 실제 MADALINE I의 전체 회로와 학습 규칙을 복원한 예가 아니라, “many ADALINEs”와 고정 논리 결합의 뜻을 보여 주는 단순화다.

### 단일 요소에서 결합 출력까지

이 문서는 단일 ADALINE의 학습과 여러 ADALINE의 결합을 다음 순서로 나누어 읽는다.

1. 같은 입력이 여러 ADALINE 요소에 들어간다.
2. 각 요소는 가중 선형 결합을 만들고 임계값을 거쳐 이진 출력을 낸다.
3. OR·AND·다수결 같은 고정 논리 요소가 여러 이진 출력을 하나로 결합한다.
4. 단일 ADALINE의 1960년 LMS와 MADALINE I의 1962년 오류 수정 규칙을 같은 알고리즘으로 합치지 않는다.

### 결과와 읽는 법

최종 결과는 여러 선형 요소의 판단을 결합한 분류다. 요소 수가 늘었다는 사실만으로 현대적인 종단간 다층 학습이 성립하는 것은 아니며, 어떤 출력에서 어떤 오차를 정의해 어느 가중치를 바꾸는지까지 구분해야 한다.

## 3단계 — 기술과 근거

### ADALINE과 MADALINE의 시기와 명칭

[[버나드 위드로]]와 [[마션 호프]]는 1960년에 [[ADALINE]]과 Widrow–Hoff [[LMS 알고리즘]]을 발표했다. 초기 문헌에서 ADALINE은 adaptive linear element 또는 adaptive linear neuron으로 불렸으며, 1988년 MADALINE Rule II 논문은 MADALINE을 “many ADALINEs”라고 명시한다. 프로젝트 raw의 “Multiple Adaptive Linear Neural Networks”와 “Multiple ADAptive LINear Elements”는 표준 풀이라는 근거가 없어 채택하지 않는다.

### 선형 LMS의 오차 표면

ADALINE의 선형 결합기는 목표값과 임계값 이전의 선형 출력 차이로 평균제곱오차를 줄인다. 이 오차 표면은 가중치에 대한 볼록 이차 함수이며, 입력 상관행렬이 가역이라는 조건에서 하나의 전역 최솟값을 갖는다. 따라서 기본 선형 LMS가 여러 국소 최솟값에 갇힌다는 프로젝트 raw의 설명은 틀리다. 국소 최적점은 signum 오차나 비선형 다요소 네트워크의 오차 표면에서 생길 수 있다.

### 초기 응용과 적응 필터 연구

초기 ADALINE·MADALINE의 응용에는 음성·패턴 인식, 기상 예측, 적응 제어가 포함됐다. 이후 Stanford 연구는 다층 학습 규칙 개발의 어려움 때문에 [[적응 필터]]와 적응 신호 처리로 방향을 옮겼고, 잡음 제거·적응 등화·에코 제거가 이 별도의 계보에서 발전했다. [[음성 활동 감지]]를 MADALINE의 대표 배치 사례로 제시하거나, 후대 적응 필터의 성과를 MADALINE 자체의 성과로 합쳐서는 안 된다.

## 검증과 한계

### 검증 정정

- MADALINE의 표기는 1차 문헌의 “many ADALINEs”를 따른다.
- ADALINE/LMS의 1960년과 Madaline I 규칙의 1962년을 분리한다.
- 선형 LMS의 평균제곱오차 표면에는 조건부로 유일한 전역 최솟값이 있다.
- 잡음 제거·에코 제거는 후대 LMS 적응 필터 계보로 분리한다.
- MADALINE 기반 VAD 사례는 확인되지 않아 본 위키의 역사적 사례에서 제외한다.

### 확인된 사실

1960년 ADALINE·LMS 발표, 1962년 Madaline I 오류 수정 규칙, 여러 ADALINE 출력의 고정 논리 결합은 1차 문헌과 후대 회고에서 확인되는 범위다. 선형 LMS의 전역 최솟값 설명에는 입력 상관행렬이 가역이라는 조건이 붙는다.

### 프로젝트 해석

여러 학습 요소를 결합한 역사적 중요성은 인정하되, 이를 곧바로 현대 다층 신경망의 동일한 학습 구조로 해석하지 않는다.

### 후대 평가와 계보의 한계

직접 근거가 확인되지 않은 VAD 배치 사례와 후대 적응 필터의 성과는 MADALINE 자체의 성능 평가에서 제외한다.

초기 구조와 후대 역전파 사이에는 넓은 신경망 연구사가 있지만, 동일한 목적함수와 학습 절차가 이어졌다는 직접 계보로 평가하지 않는다.

## 학습 확인

1. ADALINE 하나와 MADALINE I의 결합 구조는 어떻게 다른가?
2. ADALINE/LMS의 1960년과 Madaline I 규칙의 1962년을 왜 구분해야 하는가?
3. 후대 적응 필터의 성과나 현대 역전파를 MADALINE 자체의 성과로 합치면 안 되는 이유는 무엇인가?

다음에는 [[MADALINE]]에서 구조와 용어를 더 자세히 정리한다. 퍼셉트론과의 차이를 역사적으로 비교하려면 [[퍼셉트론에서 MADALINE으로]]을 읽는다.

## 출처

- Bernard Widrow·Marcian E. Hoff, [Adaptive Switching Circuits](https://isl.stanford.edu/~widrow/papers/c1960adaptiveswitching.pdf), 1960.
- Rodney Winter·Bernard Widrow, [MADALINE Rule II: A Training Algorithm for Neural Networks](https://isl.stanford.edu/~widrow/papers/c1988madalinerule.pdf), 1988, 특히 pp. 1-401–1-403.
- Bernard Widrow·Michael A. Lehr, [30 Years of Adaptive Neural Networks: Perceptron, Madaline, and Backpropagation](https://isl.stanford.edu/people/widrow/papers/j199030years.pdf), 1990, pp. 1415–1419·1428–1432.
- Bernard Widrow 외, [Adaptive Noise Cancelling: Principles and Applications](https://isl.stanford.edu/~widrow/papers/j1975adaptivenoise.pdf), 1975, pp. 1692–1716.
- 프로젝트 번역·검토 출발 자료: [MADALINE - Multiple Adaptive Linear Neural Networks](https://mbrenndoerfer.com/writing/history-madaline-neural-network-adaptive-learning)
- 프로젝트 보존 자료: `raw/006_1962_위드로-호프_MADALINE.md`, `raw/006_1962_위드로-호프_MADALINE_해설.md`.

## 관련 항목

- [[버나드 위드로]]
- [[마션 호프]]
- [[스탠퍼드 대학교]]
- [[ADALINE]]
- [[MADALINE]]
- [[LMS 알고리즘]]
- [[경사하강법]]
- [[적응 필터]]
- [[음성 활동 감지]]
- [[특징 공학]]
- [[퍼셉트론]]
- [[선형 분류기]]
- [[퍼셉트론에서 MADALINE으로]]
- [[AI 시연과 실제 성능]]
- [[대규모 언어 모델]]
