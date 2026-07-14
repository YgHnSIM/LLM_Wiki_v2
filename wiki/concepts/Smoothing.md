---
schema_version: 2
id: concept.smoothing
page_type: concept
title: Smoothing
aliases:
  - 스무딩
  - 확률 평활화
  - smoothing techniques
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
  - source_id: katz-1987
    locator: pp. 400–401
    relation: supports
  - source_id: chen-goodman-1998
    locator: chapters 2–4
    relation: supplements
related:
  - concept.n-gram-모델
  - concept.데이터-희소성
  - entity.슬라바-카츠
  - analysis.n-gram에서-llm으로
---
# Smoothing

[[Smoothing]]은 관찰되지 않은 사건에도 합리적인 확률을 부여하도록 확률 추정치를 조정하는 기법이다. [[N-gram 모델]]에서는 학습 말뭉치에 나타나지 않은 n-gram을 실제 입력에서 마주칠 수 있으므로, 미관측 조합을 0 확률로 처리하지 않는 것이 중요하다.

## 대표 기법

Katz back-off는 관측된 빈도를 할인해 미관측 사건에 쓸 확률 질량을 남기고, 특정 n-gram을 신뢰성 있게 추정할 수 없을 때 더 짧은 문맥의 정규화된 분포로 후퇴한다. 이 접근은 [[슬라바 카츠]]가 1987년에 제안했다.

Good-Turing smoothing은 한 번 관찰된 사건의 정보를 이용해 한 번도 관찰되지 않은 사건의 확률을 추정한다. Kneser-Ney smoothing은 단어가 얼마나 자주 등장하는지뿐 아니라 얼마나 다양한 문맥에서 등장하는지도 고려한다.

## 한계

Smoothing은 [[데이터 희소성]]을 완화하지만 [[마르코프 가정]]이 만드는 짧은 문맥의 한계와 의미 표현의 부재를 해결하지는 못한다. 여러 smoothing 방법은 말뭉치 크기, n-gram 차수와 구현 조건에 따라 성능이 달라지므로 하나의 기법을 모든 상황의 최선으로 단정하지 않는다.

## 출처

- [[001_섀넌의 N-gram 모델]]
- Slava M. Katz, [Estimation of Probabilities from Sparse Data](https://doi.org/10.1109/TASSP.1987.1165125), 1987, pp. 400–401.
- Stanley F. Chen·Joshua Goodman, [An Empirical Study of Smoothing Techniques for Language Modeling](https://dash.harvard.edu/handle/1/25104739), 1998, chapters 2–4.

## 관련 항목

- [[N-gram 모델]]
- [[데이터 희소성]]
- [[슬라바 카츠]]
- [[N-gram에서 LLM으로]]
