---
schema_version: 2
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
updated: '2026-07-15'
lifecycle: active
verification: verified
artifacts:
  - raw/004_The Perceptron.md
  - raw/004_The Perceptron.commentary.md
evidence:
  - source_id: rosenblatt-1958
    locator: pp. 386–408
    relation: supports
  - source_id: minsky-papert-1969
    locator: chapters 1 and 13
    relation: supports
related:
  - concept.퍼셉트론
  - concept.선형-분리-가능성
  - concept.선형-분류기
  - concept.지도-학습
---
# XOR 문제

[[XOR 문제]]는 두 이진 입력이 서로 다를 때 1을 출력하고, 같을 때 0을 출력하는 배타적 논리합(exclusive-or)을 학습하는 문제다. [[004_퍼셉트론]]은 이 문제가 단층 [[퍼셉트론]]의 한계를 보여주는 대표 사례라고 설명한다.

## 왜 어려운가

XOR의 네 입력 조합을 2차원 평면에 놓으면, 출력 1인 두 점과 출력 0인 두 점이 서로 대각선 방향에 위치한다. 하나의 직선으로 두 클래스를 완전히 나눌 수 없기 때문에 XOR은 [[선형 분리 가능성|선형 분리 가능]]하지 않다.

## 역사적 의미

Marvin Minsky와 Seymour Papert의 1969년 *Perceptrons*는 단층 퍼셉트론이 표현할 수 없는 여러 성질을 체계적으로 분석했다. XOR은 그 한계를 설명하기 쉬운 교육 사례지만, 책의 논의를 XOR 하나로 축소하거나 이 책이 신경망 연구의 침체를 단독으로 일으켰다고 설명해서는 안 된다. 다층 비선형 네트워크는 XOR을 표현할 수 있지만, 당시에는 여러 층을 안정적으로 학습할 방법과 계산 자원이 충분하지 않았다.

## 출처

- [[004_퍼셉트론]]
- Marvin Minsky·Seymour Papert, [Perceptrons](https://mitpress.mit.edu/9780262631112/perceptrons-expanded-edition/), 1969/1988, chapters 1·13.

## 관련 항목

- [[퍼셉트론]]
- [[선형 분리 가능성]]
- [[선형 분류기]]
- [[지도 학습]]
