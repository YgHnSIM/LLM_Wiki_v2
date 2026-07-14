---
title: LMS 알고리즘
aliases: [Least Mean Squares, LMS, 최소 평균 제곱 알고리즘, Widrow-Hoff rule, 위드로-호프 규칙]
tags: [type/concept, domain/ai, domain/machine-learning, domain/signal-processing, status/active]
created: 2026-07-14
updated: 2026-07-14
sources: ["006_1962_위드로-호프_MADALINE.md", "006_1962_위드로-호프_MADALINE_해설.md"]
status: active
---

# LMS 알고리즘

[[LMS 알고리즘]](Least Mean Squares)은 목표 출력과 실제 선형 출력 사이의 제곱 오차를 줄이도록 가중치를 반복 조정하는 적응 학습 규칙이다. [[ADALINE]]과 [[MADALINE]]의 학습을 설명하는 핵심 알고리즘이며 Widrow-Hoff 규칙으로도 불린다.

## 가중치 갱신

현재 소스는 가중치 변화량을 다음과 같이 나타낸다.

$$
\Delta w_{ij} = \alpha \cdot (d-y_i) \cdot x_j
$$

$d-y_i$는 목표값과 실제 출력의 차이, $x_j$는 입력, $\alpha$는 학습률이다. 오차가 크고 해당 입력이 강하게 활성화될수록 가중치가 더 크게 바뀐다.

## 의미

LMS는 계산이 단순해 제한된 하드웨어에서도 구현하기 쉽고, 연속 출력의 오류를 이용해 점진적으로 갱신할 수 있다. 이 때문에 [[적응 필터]]와 신호 처리 문제에 적합했다. 현재 소스는 이를 현대 신경망의 [[경사하강법]] 기반 학습으로 이어지는 초기 공학적 계보로 본다.

## 한계

학습률이 너무 크면 진동하거나 발산할 수 있고, 너무 작으면 수렴이 느리다. 또한 MADALINE의 고정 논리층까지 함께 학습시키지는 못하므로, 전체 다층 구조를 종단 간으로 최적화하는 방법은 아니었다.

## 출처

- [[006_위드로-호프의 MADALINE]]

## 관련 항목

- [[ADALINE]]
- [[MADALINE]]
- [[경사하강법]]
- [[적응 필터]]
- [[지도 학습]]
