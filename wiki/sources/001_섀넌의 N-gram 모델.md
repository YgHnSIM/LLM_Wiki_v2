---
schema_version: 2
id: source.001
page_type: source
title: 섀넌의 N-gram 모델
aliases:
  - Shannon's N-gram Model
  - Shannon N-gram
  - 1948 N-gram
tags:
  - type/source
  - domain/ai
  - domain/nlp
created: '2026-05-07'
updated: '2026-07-15'
lifecycle: active
verification: verified
artifacts:
  - >-
    raw/001_Shannon's N-gram Model - The Foundation of Statistical Language
    Processing..md
  - >-
    raw/001_Shannon's N-gram Model - The Foundation of Statistical Language
    Processing.commentary.md
evidence:
  - source_id: shannon-1948
    locator: 'Part I, §§2–3 and §6'
    relation: supports
  - source_id: katz-1987
    locator: pp. 400–401
    relation: supplements
  - source_id: chen-goodman-1998
    locator: chapters 2–4
    relation: supplements
related:
  - concept.n-gram-모델
  - concept.마르코프-가정
  - concept.조건부-확률
  - concept.데이터-희소성
  - concept.smoothing
  - concept.perplexity
  - entity.클로드-섀넌
  - entity.안드레이-마르코프
  - entity.슬라바-카츠
  - analysis.n-gram에서-llm으로
  - meta.overview
  - meta.index
---
# 섀넌의 N-gram 모델

## 핵심 요약

[[클로드 섀넌]]의 1948년 논문은 통신원이 만들어 내는 기호열의 불확실성과 예측 가능성을 수학적으로 다룬다. 논문은 문자와 단어를 독립적으로 뽑는 근사에서 출발해 앞선 문자나 단어에 조건을 둔 digram·trigram·단어 수준 근사를 제시했다. 오늘날 이 계열을 n-gram 언어 모델의 선구적 형태로 읽을 수 있지만, 섀넌이 현대 자연어 처리의 n-gram 도구 전체를 완성한 것은 아니다.

[[N-gram 모델]]은 연속된 n개 언어 단위의 빈도로 제한된 문맥에서 다음 항목의 [[조건부 확률]]을 추정한다. 계산 가능한 짧은 문맥만 사용한다는 점은 흔히 [[마르코프 가정]]으로 설명된다. 이 모델은 장거리 구조와 의미를 직접 표현하지 못하지만 오랫동안 음성 인식, 입력 예측, 기계 번역의 실용적 구성 요소와 기준선으로 사용됐다.

n이 커질수록 가능한 조합이 급격히 늘어 [[데이터 희소성]]이 심해진다. 미관측 n-gram에 확률 0을 주지 않기 위한 [[Smoothing]], back-off, 보간법은 Shannon의 1948년 논문보다 훨씬 뒤에 발전했다. Katz back-off, Kneser–Ney, 현대적인 smoothing 비교를 섀넌의 직접 업적으로 귀속해서는 안 된다.

[[Perplexity]]는 언어 모델이 실제 토큰열에 부여한 평균 로그확률을 지수화한 평가 지표다. 엔트로피와의 수학적 관계는 Shannon의 정보 이론에 뿌리를 두지만, 오늘날의 표준적인 언어 모델 평가 관행은 후대 연구에서 정착했다.

현대 [[대규모 언어 모델]]도 문맥에서 다음 토큰 분포를 예측할 수 있지만, 고정 길이 빈도표 대신 학습된 신경망 표현과 긴 문맥을 사용한다. 따라서 둘은 문제 설정의 일부를 공유하는 서로 다른 모델 계열이며, LLM을 n-gram의 단순한 확장이나 직접적인 후손으로 단정하는 것은 부정확하다.

## 주요 인사이트

- Shannon의 논문은 언어를 확률적 통신원으로 분석하고 여러 차수의 연속 근사를 실험했다.
- 현대적 n-gram 용어와 smoothing 기법은 1948년 논문 이후에 정립됐다.
- 제한된 문맥은 계산 가능성을 높이지만 장거리 의존성과 의미 정보를 잃는다.
- 데이터 희소성은 n-gram의 구조적 문제이며 smoothing과 back-off의 직접적인 동기다.
- n-gram과 LLM은 다음 항목의 조건부 분포를 예측한다는 과업을 공유하지만 표현 방식과 학습 규모가 다르다.

## 핵심 문장

- Shannon은 자연어의 통계적 제약을 통신원 모델 안에서 다뤘고, 후대 n-gram 언어 모델이 발전할 수 있는 문제 틀을 제공했다.
- n-gram의 smoothing과 현대적 평가 체계는 Shannon의 원 논문과 구분해야 한다.
- LLM과 n-gram의 관계는 직접 계승보다 공통된 예측 과업을 중심으로 설명하는 편이 정확하다.

## 출처

- Claude E. Shannon, [A Mathematical Theory of Communication](https://people.math.harvard.edu/~ctm/home/text/others/shannon/entropy/entropy.pdf), 1948, Part I §§2–3·§6.
- Slava M. Katz, [Estimation of Probabilities from Sparse Data for the Language Model Component of a Speech Recognizer](https://doi.org/10.1109/TASSP.1987.1165125), 1987, pp. 400–401.
- Stanley F. Chen·Joshua Goodman, [An Empirical Study of Smoothing Techniques for Language Modeling](https://dash.harvard.edu/handle/1/25104739), 1998, chapters 2–4.
- 프로젝트 보존 자료: `raw/001_Shannon's N-gram Model - The Foundation of Statistical Language Processing..md`, `raw/001_Shannon's N-gram Model - The Foundation of Statistical Language Processing.commentary.md`.

## 관련 항목

- [[N-gram 모델]]
- [[마르코프 가정]]
- [[조건부 확률]]
- [[데이터 희소성]]
- [[Smoothing]]
- [[Perplexity]]
- [[클로드 섀넌]]
- [[안드레이 마르코프]]
- [[슬라바 카츠]]
- [[N-gram에서 LLM으로]]
- [[overview]]
- [[index]]
