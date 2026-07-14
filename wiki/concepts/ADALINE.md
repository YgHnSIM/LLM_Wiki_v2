---
title: ADALINE
aliases: [ADAptive LINear Element, 적응형 선형 소자, 적응 선형 유닛]
tags: [type/concept, domain/ai, domain/machine-learning, domain/signal-processing, status/active]
created: 2026-07-14
updated: 2026-07-14
sources: ["006_1962_위드로-호프_MADALINE.md", "006_1962_위드로-호프_MADALINE_해설.md"]
status: active
---

# ADALINE

[[ADALINE]](ADAptive LINear Element)은 입력의 가중합을 계산하는 적응형 선형 유닛이다. 최종 판단에서는 임계값을 적용할 수 있지만, 학습 과정에서는 임계값 이전의 연속 선형 출력을 사용한다.

## 퍼셉트론과의 차이

[[퍼셉트론]]은 임계값을 통과한 이진 결과를 기준으로 오분류를 수정한다. ADALINE은 목표값과 연속 출력 사이의 차이를 이용하므로, 출력이 목표에서 얼마나 벗어났는지를 더 세밀하게 반영할 수 있다. 현재 소스는 이 차이가 [[LMS 알고리즘]]의 안정적인 오류 갱신을 가능하게 했다고 설명한다.

## 계산

단일 유닛의 선형 출력은 다음과 같이 표현된다.

$$
y_i = \sum_{j=1}^{n} w_{ij}x_j + b_i
$$

여기서 입력 $x_j$와 가중치 $w_{ij}$의 곱을 합하고 편향 $b_i$를 더한다. 학습에는 $y_i$가 사용되고, 실제 이진 결정이 필요할 때 임계값을 적용한다.

## 한계

ADALINE 하나가 학습하는 것은 입력의 선형 결합이다. 복잡한 비선형 표현이나 계층적 특징을 스스로 만들 수 없으며, 입력 특징을 정하는 [[특징 공학]]도 사람이 수행해야 했다.

## 출처

- [[006_위드로-호프의 MADALINE]]

## 관련 항목

- [[MADALINE]]
- [[LMS 알고리즘]]
- [[퍼셉트론]]
- [[선형 분류기]]
- [[경사하강법]]
