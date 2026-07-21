---
schema_version: 2
id: concept.perplexity
page_type: concept
title: Perplexity
aliases:
  - 퍼플렉시티
  - PPL
tags:
  - type/concept
  - domain/ai
created: '2026-05-07'
updated: '2026-07-21'
lifecycle: active
verification: verified
artifacts:
  - >-
    raw/001_Shannon's N-gram Model - The Foundation of Statistical Language
    Processing..md
  - raw/019_Katz Back-off - Handling Sparse Data in Language Models.ko.md
  - raw/019_Katz Back-off - Handling Sparse Data in Language Models.commentary.ko.md
  - raw/065_Scaling Laws for Neural Language Models Predicting Performance from Scale.ko.md
  - raw/065_Scaling Laws for Neural Language Models Predicting Performance from Scale.commentary.ko.md
evidence:
  - source_id: shannon-1948
    locator: 'Part I, §§2–3 and §6'
    relation: supports
  - source_id: katz-1987
    locator: 'p. 401, Table I and the accompanying paragraph'
    relation: supports
  - source_id: chen-goodman-1998
    locator: '§1.1, cross-entropy and perplexity definitions'
    relation: supports
  - source_id: kaplan-et-al-2020-scaling-laws
    locator: '§§1.3·2·8, 특히 token 평균 cross-entropy 정의와 관련 언어 과제로의 전이를 남은 문제로 둔 논의'
    relation: supports
related:
  - source.019
  - source.066
  - concept.언어-모델-스케일링-법칙
  - concept.n-gram-모델
  - concept.조건부-확률
  - concept.데이터-희소성
  - concept.smoothing
  - analysis.n-gram에서-llm으로
  - entity.클로드-섀넌
---
# Perplexity

> [!note] 학습 안내
> **난이도:** 중급<br>
> **선수 지식:** [[조건부 확률]]<br>
> **읽고 나면:** 토큰열의 평균 음의 로그확률에서 perplexity를 계산하고 서로 다른 평가 조건의 값을 비교하면 안 되는 이유를 설명할 수 있다.

## 1단계 — 먼저 잡을 핵심

### 핵심 정의

[[Perplexity]]는 언어 모델이 평가 토큰열에 부여한 평균 음의 로그확률을 지수화한 지표다. 토큰열 (w_1,\dots,w_N)에 대해 대표적으로 다음과 같이 쓴다.

평활화하지 않은 [[N-gram 모델]]이 평가열의 조건부 확률 하나에 0을 부여하면 합산 로그확률에 `log 0`이 들어가므로 음의 로그우도와 perplexity가 무한대로 발산한다. [[019_Katz 백오프와 희소 데이터 확률 추정|Katz back-off]] 같은 [[Smoothing]]은 미관측 조합에도 확률을 배분해 이 문제를 피한다.

이 지표는 교차 엔트로피의 지수와 같아 [[클로드 섀넌]]의 정보 이론과 수학적으로 연결된다. 그러나 Shannon이 1948년 논문에서 오늘날의 표준 perplexity 평가 관행을 n-gram과 함께 완성했다고 서술하면 안 된다.

## 2단계 — 작동 원리

### 계산 순서

$$
\operatorname{PPL}(w_{1:N})=\exp\left(-\frac{1}{N}\sum_{i=1}^{N}\log p(w_i\mid w_{<i})\right)
$$

같은 데이터와 토큰화 조건에서는 값이 낮을수록 실제 텍스트에 더 높은 확률을 부여했다는 뜻이다.

평가열의 각 토큰 확률에 로그를 취해 평균하고 부호를 바꾼 뒤 지수화한다. 확률이 낮은 실제 토큰이 많을수록 평균 손실과 perplexity가 커진다.

## 3단계 — 기술과 근거

### 역할

Perplexity는 [[N-gram 모델]]과 신경망 언어 모델의 확률 예측을 비교하는 데 유용하다. 다만 서로 다른 토큰화, 어휘, 평가 말뭉치를 사용한 값은 직접 비교하기 어렵고, 낮은 perplexity가 사실성·안전성·과업 성공을 자동으로 보장하지 않는다.

Katz는 약 75만 단어의 사무 서신 데이터로 학습하고 100문장으로 시험한 제한된 설정에서 제안한 추정법의 bigram perplexity 117과 trigram perplexity 88을 보고했다. 비교 추정법들의 값은 각각 118·119와 89·91이었다. 이는 한 작은 실험에서의 상대 비교이지 모든 말뭉치와 과제에 대한 보편적 우위를 뜻하지 않는다.

### 스케일링 곡선이 측정한 것

Kaplan 등의 [[066_신경 언어 모델의 스케일링 법칙|2020년 스케일링 연구]]가 맞춘 값은 WebText2 계열 token의 평균 교차 엔트로피 손실이었다. 같은 tokenization과 자연로그 조건이면 perplexity는 이 손실을 지수화한 값이므로 두 지표는 같은 평균 예측 오차를 다른 척도로 나타낸다. 그러나 논문은 손실 감소가 관련 언어 과제의 향상으로 이어지는지를 후속 조사 문제로 남겼다. 따라서 매끄러운 loss·perplexity 곡선을 downstream 정확도, 사실성, 안전성이나 특정 능력의 직접 예측으로 바꿔 읽을 수 없다.

## 검증과 한계

### 비교 조건과 해석 범위

Perplexity는 같은 평가열·토큰화·어휘와 확률 정의 아래에서 비교해야 한다. 낮은 값은 평가 텍스트에 더 높은 확률을 주었다는 뜻이지만 사실성, 안전성, 인간 선호나 실제 과업 성공을 단독으로 보장하지 않는다.

## 학습 확인

1. Perplexity는 토큰별 어떤 값을 평균하고 어떤 변환을 적용한 지표인가?
2. 평가열의 한 조건부 확률이 0이면 평활화되지 않은 모델의 perplexity에는 어떤 일이 생기는가?
3. 서로 다른 토큰화나 평가 말뭉치에서 얻은 값을 직접 비교하기 어려운 이유는 무엇인가?

다음에는 [[Smoothing]]에서 확률 0을 피하는 추정법을 본다. 평가량과 모델 계보를 더 넓게 비교하려면 [[N-gram에서 LLM으로]] 이어 간다.

## 출처

- [[001_섀넌의 N-gram 모델]]
- [[019_Katz 백오프와 희소 데이터 확률 추정]]
- [[066_신경 언어 모델의 스케일링 법칙]]
- Claude E. Shannon, [A Mathematical Theory of Communication](https://people.math.harvard.edu/~ctm/home/text/others/shannon/entropy/entropy.pdf), 1948, Part I §6.
- Slava M. Katz, [Estimation of Probabilities from Sparse Data for the Language Model Component of a Speech Recognizer](https://doi.org/10.1109/TASSP.1987.1165125), 1987, p. 401, Table I.
- Stanley F. Chen·Joshua Goodman, [An Empirical Study of Smoothing Techniques for Language Modeling](https://dash.harvard.edu/handle/1/25104739), 1998, §1.1.
- Jared Kaplan 외, [Scaling Laws for Neural Language Models](https://arxiv.org/abs/2001.08361), 2020, §§1.3·2·8.

## 관련 항목

- [[N-gram 모델]]
- [[066_신경 언어 모델의 스케일링 법칙]]
- [[언어 모델 스케일링 법칙]]
- [[조건부 확률]]
- [[데이터 희소성]]
- [[Smoothing]]
- [[N-gram에서 LLM으로]]
- [[클로드 섀넌]]
- [[019_Katz 백오프와 희소 데이터 확률 추정]]
