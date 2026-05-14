---
title: XOR 문제
aliases: [XOR Problem, exclusive-or problem, 배타적 논리합 문제]
tags: [type/concept, domain/ai, domain/machine-learning, status/active]
created: 2026-05-14
updated: 2026-05-14
sources: ["004_The Perceptron.md", "004_The Perceptron.commentary.md"]
status: active
---

# XOR 문제

[[XOR 문제]]는 두 이진 입력이 서로 다를 때 1을 출력하고, 같을 때 0을 출력하는 배타적 논리합(exclusive-or)을 학습하는 문제다. [[004_퍼셉트론]]은 이 문제가 단층 [[퍼셉트론]]의 한계를 보여주는 대표 사례라고 설명한다.

## 왜 어려운가

XOR의 네 입력 조합을 2차원 평면에 놓으면, 출력 1인 두 점과 출력 0인 두 점이 서로 대각선 방향에 위치한다. 하나의 직선으로 두 클래스를 완전히 나눌 수 없기 때문에 XOR은 [[선형 분리 가능성|선형 분리 가능]]하지 않다.

## 역사적 의미

Marvin Minsky와 Seymour Papert가 1969년 *Perceptrons*에서 퍼셉트론의 한계를 분석하면서 XOR 문제는 신경망 연구의 중요한 경고 사례가 되었다. 이 한계는 단층 모델의 약점을 드러냈고, 이후 다층 신경망과 역전파가 필요한 이유를 설명하는 출발점이 되었다.

## 출처

- [[004_퍼셉트론]]

## 관련 항목

- [[퍼셉트론]]
- [[선형 분리 가능성]]
- [[선형 분류기]]
- [[지도 학습]]
