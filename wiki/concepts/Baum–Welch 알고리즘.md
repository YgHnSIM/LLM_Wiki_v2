---
schema_version: 2
id: concept.baum-welch-알고리즘
page_type: concept
title: Baum–Welch 알고리즘
aliases:
  - Baum-Welch algorithm
  - Baum Welch re-estimation
  - 바움-웰치 알고리즘
tags:
  - type/concept
  - domain/computer-science
  - domain/machine-learning
  - domain/nlp
  - domain/speech-processing
created: '2026-07-16'
updated: '2026-07-16'
lifecycle: active
verification: verified
artifacts:
  - raw/013_Hidden Markov Models - Statistical Speech Recognition.ko.md
  - raw/013_Hidden Markov Models - Statistical Speech Recognition.commentary.ko.md
evidence:
  - source_id: baum-petrie-1966
    locator: pp. 1554–1563
    relation: contextualizes
  - source_id: baum-et-al-1970
    locator: pp. 164–171
    relation: supports
  - source_id: rabiner-1989
    locator: pp. 264–267
    relation: supplements
related:
  - source.013
  - entity.레너드-바움
  - concept.은닉-마르코프-모델
  - concept.동적-계획법
  - concept.비터비-알고리즘
---
# Baum–Welch 알고리즘

[[Baum–Welch 알고리즘]](Baum–Welch algorithm)은 상태열을 직접 관측하지 못한 자료에서 [[은닉 마르코프 모델]]의 초기 상태·전이·방출 매개변수를 반복 재추정하는 방법이다. 가능한 상태 경로 하나를 정답처럼 고정하지 않고, 순방향-역방향 계산으로 상태 점유와 상태 전이의 기대 횟수를 구해 매개변수를 갱신한다.

## 계산 절차

현재 매개변수에서 순방향 값은 관측열의 앞부분과 현재 상태가 함께 나타날 확률을, 역방향 값은 현재 상태에서 남은 관측열이 나타날 확률을 요약한다. 두 값을 결합하면 시간별 상태 점유 확률과 상태 사이 전이의 기대 횟수를 계산할 수 있다. 이 기대 통계를 정규화하여 초기 상태 확률, 전이 확률, 방출 분포를 다시 추정하고 같은 과정을 반복한다.

상태 수가 $N$, 관측열 길이가 $T$인 조밀한 모델에서 한 차례 순방향-역방향 계산의 대표적 시간 복잡도는 $O(TN^2)$이다. 여러 훈련열을 사용할 때는 각 열의 기대 통계를 합산한 뒤 매개변수를 갱신한다. 연속 관측을 쓰는 HMM에서는 상태별 확률 밀도의 매개변수에 맞는 충분통계량을 계산한다.

## 보장과 한계

Baum·Petrie·George Soules·Norman Weiss의 1970년 재추정 변환은 관측 가능도를 감소시키지 않는다. 그러나 이는 전역 최댓값을 찾는다는 뜻이 아니다. 모델 구조와 초기값에 따라 정지점이나 서로 다른 국소해에 도달할 수 있으며, 상태의 의미가 사람이 기대한 언어 단위와 일치한다는 보장도 없다.

Baum–Welch는 오늘날 잠재 변수가 있는 모형을 위한 기댓값 최대화 계열의 한 사례로 설명할 수 있다. 이때 기대 단계가 계산하는 것은 “가장 가능성 높은 상태열 하나”가 아니라 가능한 경로에 걸친 기대 통계다. 단일 최고 상태열을 찾는 [[비터비 알고리즘]]과 목적을 구분해야 한다.

## 음성 인식에서의 역할

음성 HMM에서는 전사·음향 관측과 미리 정한 상태 구조를 바탕으로 전이와 방출 매개변수를 조정하는 데 재추정을 사용할 수 있다. 알고리즘이 음소, 발음 사전, 상태 토폴로지, 음향 특징을 모두 자동으로 발명하는 것은 아니다. [[013_은닉 마르코프 모델과 통계적 음성 인식]]은 이러한 확률 추정과 사람이 설계한 구성 요소가 함께 작동한 역사적 시스템을 구분한다.

## 출처

- Leonard E. Baum·Ted Petrie, [Statistical Inference for Probabilistic Functions of Finite State Markov Chains](https://doi.org/10.1214/aoms/1177699147), 1966, pp. 1554–1563.
- Leonard E. Baum·Ted Petrie·George Soules·Norman Weiss, [A Maximization Technique Occurring in the Statistical Analysis of Probabilistic Functions of Markov Chains](https://doi.org/10.1214/aoms/1177697196), 1970, pp. 164–171.
- Lawrence R. Rabiner, [A Tutorial on Hidden Markov Models and Selected Applications in Speech Recognition](https://doi.org/10.1109/5.18626), 1989, pp. 264–267.
- [[013_은닉 마르코프 모델과 통계적 음성 인식]]

## 관련 항목

- [[013_은닉 마르코프 모델과 통계적 음성 인식]]
- [[레너드 바움]]
- [[은닉 마르코프 모델]]
- [[동적 계획법]]
- [[비터비 알고리즘]]
