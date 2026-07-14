---
title: MADALINE
aliases: [Multiple ADALINE, Multiple ADAptive LINear Elements, 매덜라인]
tags: [type/concept, domain/ai, domain/machine-learning, domain/signal-processing, status/review]
created: 2026-07-14
updated: 2026-07-14
sources: ["006_1962_위드로-호프_MADALINE.md", "006_1962_위드로-호프_MADALINE_해설.md"]
status: review
---

# MADALINE

[[MADALINE]]은 여러 [[ADALINE]] 유닛을 병렬로 배치하고 그 출력을 고정 논리 게이트로 결합한 초기 신경망 구조다. 현재 소스는 이 구조를 신경망이 통신과 신호 처리의 실제 문제에 배치될 수 있음을 보여준 사례로 설명한다.

> [!WARNING] 모순 발견
> 현재 `006` 본문은 MADALINE의 약자를 첫 문장에서는 “Multiple Adaptive Linear Neural Networks”, 뒤에서는 “Multiple ADAptive LINear Elements”로 다르게 풀어 쓴다. 이 페이지는 후자의 표현을 대표 별칭으로 사용하되 최종 확정 전까지 `review` 상태로 둔다.

## 구조

여러 ADALINE은 같은 입력을 받아 서로 다른 가중치를 학습할 수 있다. 각 유닛의 이진 출력은 AND·OR 같은 고정 논리 게이트로 전달되며, 이 게이트가 최종 분류 규칙을 구현한다. 학습 가능한 선형 유닛과 사람이 설계한 논리층을 결합한 혼합 구조다.

## 응용

현재 소스는 [[음성 활동 감지]], 잡음 감소, 에코 제거를 대표 사례로 든다. 변화하는 통신 환경에서 [[적응 필터]]가 계수를 조정함으로써 고정 필터보다 유연하게 대응할 수 있었다는 설명이다.

## 한계

- 논리층은 학습되지 않는다.
- 각 ADALINE은 선형 결합만 학습한다.
- 입력 [[특징 공학]]과 전체 구조를 엔지니어가 정해야 한다.
- 모든 층을 함께 훈련하는 현대적 종단 간 학습과 다르다.

## 출처

- [[006_위드로-호프의 MADALINE]]

## 관련 항목

- [[ADALINE]]
- [[LMS 알고리즘]]
- [[퍼셉트론]]
- [[음성 활동 감지]]
- [[퍼셉트론에서 MADALINE으로]]
