---
schema_version: 3
id: concept.xor-문제
page_type: concept
title: XOR 문제
aliases:
  - XOR Problem
  - exclusive-or problem
  - 배타적 논리합 문제
tags:
  - type/concept
  - domain/ai
  - domain/machine-learning
created: '2026-05-14'
updated: '2026-07-21'
editorial_status: active
review:
  evidence_coverage: verified
  content_mode: descriptive
artifacts:
  - raw/004_The Perceptron.md
  - raw/004_The Perceptron.commentary.md
  - raw/018_Backpropagation - Training Deep Neural Networks.ko.md
  - raw/018_Backpropagation - Training Deep Neural Networks.commentary.ko.md
evidence:
  - source_id: rosenblatt-1958
    locator: pp. 386–408
    relation: supports
  - source_id: minsky-papert-1969
    locator: chapters 1 and 13
    relation: supports
  - source_id: rumelhart-hinton-williams-1986-pdp
    locator: p. 319 and pp. 331–333
    relation: supports
relations:
  - target: concept.퍼셉트론
    kind: related
  - target: concept.선형-분류기
    kind: related
  - target: concept.지도-학습
    kind: related
learning:
  difficulty:
    entry: introductory
    target: introductory
  prerequisites:
    - target: concept.선형-분리-가능성
  assumed_knowledge: 없음
  outcomes:
    - 'XOR의 네 입력을 하나의 직선으로 나눌 수 없는 이유와, 은닉층이 이 문제를 풀 수 있는 방식을 설명할 수 있다.'
  next:
    - target: concept.다층-퍼셉트론
      reason: 다층 퍼셉트론 — 비선형 은닉층이 입력을 다시 표현하는 구조를 살핀다.
    - target: concept.역전파
      reason: 역전파 — 은닉층의 가중치를 출력 오차에서 함께 학습하는 절차를 이어서 본다.
---
# XOR 문제

> [!note] 학습 안내
> **난이도:** 입문<br>
> **선수 지식:** [[concept.선형-분리-가능성|선형 분리 가능성]]<br>
> **읽고 나면:** XOR의 네 입력을 하나의 직선으로 나눌 수 없는 이유와, 은닉층이 이 문제를 풀 수 있는 방식을 설명할 수 있다.

## 1단계 — 먼저 잡을 핵심

### 핵심 정의

[[XOR 문제]]는 두 이진 입력이 서로 다를 때 1을 출력하고, 같을 때 0을 출력하는 배타적 논리합(exclusive-or)을 학습하는 문제다. [[004_퍼셉트론]]은 이 문제가 단층 [[퍼셉트론]]의 한계를 보여주는 대표 사례라고 설명한다.

입력은 00, 01, 10, 11 네 가지이며, 가운데 두 경우만 출력이 1이다. 이 작은 표가 선형 모델과 비선형 모델의 차이를 보여주는 교육 사례가 된다.

## 2단계 — 작동 원리

### 왜 어려운가

XOR의 네 입력 조합을 2차원 평면에 놓으면, 출력 1인 두 점과 출력 0인 두 점이 서로 대각선 방향에 위치한다. 하나의 직선으로 두 클래스를 완전히 나눌 수 없기 때문에 XOR은 [[선형 분리 가능성|선형 분리 가능]]하지 않다.

은닉층은 입력을 새로운 내부 특징으로 바꾸어, 원래 평면에서는 하나의 직선으로 나뉘지 않던 점들을 다음 층에서 구분할 수 있게 한다.

## 3단계 — 기술과 근거

### 역사적 의미

Marvin Minsky와 Seymour Papert의 1969년 *Perceptrons*는 단층 퍼셉트론이 표현할 수 없는 여러 성질을 체계적으로 분석했다. XOR은 그 한계를 설명하기 쉬운 교육 사례지만, 책의 논의를 XOR 하나로 축소하거나 이 책이 신경망 연구의 침체를 단독으로 일으켰다고 설명해서는 안 된다.

[[다층 퍼셉트론]]은 비선형 은닉 유닛으로 입력을 다시 표현해 XOR을 계산할 수 있다. Rumelhart·Hinton·Williams의 1986년 장은 [[역전파]]로 이 내부 표현을 학습하는 작은 실험을 제시했다. 이는 은닉층 공동 학습의 중요한 시연이지만, 많은 층의 현대적 심층망이 곧바로 안정적으로 훈련됐다는 증거는 아니다.

## 검증과 한계

### 역사 해석의 범위

XOR은 단층 선형 모델의 표현 한계를 분명하게 보여주지만, 신경망 연구의 흥망 전체를 하나의 과제나 한 권의 책으로 설명하는 근거는 아니다. 1986년의 작은 실험 역시 현대적 대규모 심층망의 훈련 가능성까지 보장하지 않는다.

## 학습 확인

### 확인 질문

1. XOR은 두 입력이 어떤 관계일 때 1을 출력하는가?
2. 네 입력 점을 평면에 놓았을 때 하나의 직선으로 분리할 수 없는 이유는 무엇인가?
3. 은닉층이 XOR을 풀 수 있다는 사실이 현대 심층망의 안정적 훈련까지 보장하지 않는 이유는 무엇인가?

### 다음 문서

- [[concept.다층-퍼셉트론|다층 퍼셉트론]] — 비선형 은닉층이 입력을 다시 표현하는 구조를 살핀다.
- [[concept.역전파|역전파]] — 은닉층의 가중치를 출력 오차에서 함께 학습하는 절차를 이어서 본다.

## 출처

- [[004_퍼셉트론]]
- [[018_역전파와 다층 신경망 학습]]
- Marvin Minsky·Seymour Papert, [Perceptrons](https://mitpress.mit.edu/9780262631112/perceptrons-expanded-edition/), 1969/1988, chapters 1·13.
- David E. Rumelhart·Geoffrey E. Hinton·Ronald J. Williams, [Learning Internal Representations by Error Propagation](https://doi.org/10.7551/mitpress/5236.003.0012), 1986, p. 319과 pp. 331–333.

## 관련 항목

- [[concept.다층-퍼셉트론|다층 퍼셉트론]]
- [[concept.역전파|역전파]]
- [[concept.선형-분리-가능성|선형 분리 가능성]]
- [[concept.퍼셉트론|퍼셉트론]]
- [[concept.선형-분류기|선형 분류기]]
- [[concept.지도-학습|지도 학습]]
