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
updated: '2026-07-15'
lifecycle: active
verification: verified
artifacts:
  - >-
    raw/001_Shannon's N-gram Model - The Foundation of Statistical Language
    Processing..md
evidence:
  - source_id: shannon-1948
    locator: 'Part I, §§2–3 and §6'
    relation: supports
related:
  - concept.n-gram-모델
  - concept.조건부-확률
  - analysis.n-gram에서-llm으로
  - entity.클로드-섀넌
---
# Perplexity

[[Perplexity]]는 언어 모델이 평가 토큰열에 부여한 평균 음의 로그확률을 지수화한 지표다. 토큰열 (w_1,\dots,w_N)에 대해 대표적으로 다음과 같이 쓴다.

$$
\operatorname{PPL}(w_{1:N})=\exp\left(-\frac{1}{N}\sum_{i=1}^{N}\log p(w_i\mid w_{<i})\right)
$$

같은 데이터와 토큰화 조건에서는 값이 낮을수록 실제 텍스트에 더 높은 확률을 부여했다는 뜻이다.

이 지표는 교차 엔트로피의 지수와 같아 [[클로드 섀넌]]의 정보 이론과 수학적으로 연결된다. 그러나 Shannon이 1948년 논문에서 오늘날의 표준 perplexity 평가 관행을 n-gram과 함께 완성했다고 서술하면 안 된다.

## 역할

Perplexity는 [[N-gram 모델]]과 신경망 언어 모델의 확률 예측을 비교하는 데 유용하다. 다만 서로 다른 토큰화, 어휘, 평가 말뭉치를 사용한 값은 직접 비교하기 어렵고, 낮은 perplexity가 사실성·안전성·과업 성공을 자동으로 보장하지 않는다.

## 출처

- [[001_섀넌의 N-gram 모델]]
- Claude E. Shannon, [A Mathematical Theory of Communication](https://people.math.harvard.edu/~ctm/home/text/others/shannon/entropy/entropy.pdf), 1948, Part I §6.

## 관련 항목

- [[N-gram 모델]]
- [[조건부 확률]]
- [[N-gram에서 LLM으로]]
- [[클로드 섀넌]]
