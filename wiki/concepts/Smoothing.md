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
updated: '2026-07-16'
lifecycle: active
verification: verified
artifacts:
  - >-
    raw/001_Shannon's N-gram Model - The Foundation of Statistical Language
    Processing..md
  - raw/019_Katz Back-off - Handling Sparse Data in Language Models.ko.md
  - raw/019_Katz Back-off - Handling Sparse Data in Language Models.commentary.ko.md
evidence:
  - source_id: katz-1987
    locator: 'p. 400, eqs. (1)–(7); pp. 400–401, eqs. (13)–(23)'
    relation: supports
  - source_id: chen-goodman-1998
    locator: '§§2.2–2.4 and §§5–6'
    relation: supplements
related:
  - source.019
  - concept.n-gram-모델
  - concept.데이터-희소성
  - entity.슬라바-카츠
  - analysis.n-gram에서-llm으로
---
# Smoothing

[[Smoothing]]은 관찰되지 않은 사건에도 합리적인 확률을 부여하도록 확률 추정치를 조정하는 기법이다. [[N-gram 모델]]에서는 학습 말뭉치에 나타나지 않은 n-gram을 실제 입력에서 마주칠 수 있으므로, 미관측 조합을 0 확률로 처리하지 않는 것이 중요하다.

## 대표 기법

[[019_Katz 백오프와 희소 데이터 확률 추정|Katz back-off]]는 관측된 빈도의 일부를 할인해 미관측 사건에 쓸 확률 질량을 남기고, 미관측 n-gram에만 더 짧은 문맥의 분포를 사용한다. 문맥을 `h`, 다음 단어를 `w`, 관측 횟수를 `r=c(hw)`라 하면 `r>k`에는 최대우도 추정치를, `1≤r≤k`에는 할인된 관측 확률을 쓴다. `r=0`이고 `c(h)>0`일 때 `α(h)P(w|h')`로 후퇴하며, 문맥 `h` 자체가 없으면 짧은 문맥 `h'`의 분포를 바로 쓴다. 따라서 낮은 빈도나 막연한 신뢰도 부족이 후퇴 분기를 작동시키는 것은 아니다.

`α(h)`는 관측 사건을 할인하는 계수나 두 분포를 섞는 보간 가중치가 아니다. 관측 사건에서 남긴 확률 질량을 미관측 후속 단어들에 배분하도록 짧은 문맥 분포를 정규화하는 계수이므로 1보다 클 수도 있다. 반면 보간은 관측 여부와 관계없이 상위·하위 분포를 `λ∈[0,1]` 같은 가중치로 항상 결합한다. 이 접근은 [[슬라바 카츠]]가 1987년에 제안했다.

Good–Turing 추정은 정확히 `r`번 관측된 유형의 수를 `n_r`라 할 때 조정 빈도 `r*=(r+1)n_{r+1}/n_r`를 사용하고, `n_1`을 통해 미관측 사건에 남길 전체 질량을 추정한다. Katz는 이 아이디어를 그대로 발명한 것이 아니라 낮은 양의 빈도에 맞게 수정해 재귀 백오프와 결합했다. Kneser–Ney smoothing은 단어가 얼마나 자주 등장하는지뿐 아니라 얼마나 다양한 문맥에서 등장하는지도 고려한다.

## 한계

Smoothing은 [[데이터 희소성]]을 완화하지만 [[마르코프 가정]]이 만드는 짧은 문맥의 한계와 의미 표현의 부재를 해결하지는 못한다. 여러 smoothing 방법은 말뭉치 크기, n-gram 차수와 구현 조건에 따라 성능이 달라지므로 하나의 기법을 모든 상황의 최선으로 단정하지 않는다.

## 출처

- [[019_Katz 백오프와 희소 데이터 확률 추정]]
- Slava M. Katz, [Estimation of Probabilities from Sparse Data](https://doi.org/10.1109/TASSP.1987.1165125), 1987, pp. 400–401.
- Stanley F. Chen·Joshua Goodman, [An Empirical Study of Smoothing Techniques for Language Modeling](https://dash.harvard.edu/handle/1/25104739), 1998, §§2.2–2.4·5–6.

## 관련 항목

- [[N-gram 모델]]
- [[데이터 희소성]]
- [[슬라바 카츠]]
- [[N-gram에서 LLM으로]]
- [[019_Katz 백오프와 희소 데이터 확률 추정]]
