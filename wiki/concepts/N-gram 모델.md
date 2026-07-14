---
schema_version: 2
id: concept.n-gram-모델
page_type: concept
title: N-gram 모델
aliases:
  - n-gram
  - N-gram language model
  - 엔그램 모델
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
  - source.001
  - concept.마르코프-가정
  - concept.조건부-확률
  - concept.데이터-희소성
  - concept.smoothing
  - concept.perplexity
---
# N-gram 모델

[[N-gram 모델]]은 텍스트에서 연속적으로 등장하는 n개의 언어 단위를 세고, 그 빈도를 바탕으로 다음 항목의 확률을 추정하는 언어 모델이다. 단위는 단어, 문자, 음절, 토큰이 될 수 있다. 단어 기준으로 unigram은 한 단어, bigram은 두 단어, trigram은 세 단어의 연속을 뜻한다.

이 모델의 기본 아이디어는 언어가 완전한 무작위 배열이 아니라 강한 통계적 규칙성을 가진다는 것이다. 예를 들어 영어에서 "peanut" 뒤에는 "butter"가 다른 많은 단어보다 훨씬 자연스럽게 이어진다. 이는 문법 규칙만으로 설명되는 현상이 아니라 실제 사용 빈도와 공기(co-occurrence) 패턴이 반영된 결과다 [[001_섀넌의 N-gram 모델]].

## 작동 방식

N-gram 모델은 앞선 n-1개 항목을 문맥으로 삼아 다음 항목의 확률을 추정한다. trigram 모델이라면 앞의 두 단어를 보고 다음 단어 분포를 계산한다. 이때 사용되는 핵심 수학은 [[조건부 확률]]이며, 전체 과거 대신 제한된 최근 문맥만 본다는 점에서 [[마르코프 가정]]에 의존한다.

## 강점

- 구조가 단순하고 구현이 쉽다.
- 사람이 만든 문법 규칙 없이 말뭉치(corpus)에서 직접 패턴을 학습한다.
- 자동완성, 음성 인식, 기계 번역, 문법 검사 같은 초기 NLP 시스템에서 실용적이었다.
- 해석 가능하고 디버깅하기 쉬워 기준선(baseline)으로 유용하다.

## 한계

- 문맥 창 밖의 장거리 의존성을 포착하기 어렵다.
- "car"와 "automobile"처럼 의미적으로 가까운 단어를 별개의 표면 토큰으로 취급한다.
- n이 커질수록 가능한 조합 수가 지수적으로 증가해 [[데이터 희소성]] 문제가 심해진다.
- 큰 모델은 많은 n-gram 빈도표를 저장해야 하므로 저장 비용이 커질 수 있다.

## 역사적 위치

Shannon의 1948년 논문은 문자·단어 연속 근사와 조건부 확률을 통신원 모델 안에서 다뤘다. 오늘날 이를 n-gram 언어 모델의 선구적 형태로 읽을 수 있지만, 현대 n-gram 용어와 [[Smoothing]] 기법은 후대에 정립됐다. 현대 [[대규모 언어 모델]]과는 조건부 예측 과업을 공유할 뿐, 같은 기술의 단순한 규모 확장은 아니다.

## 출처

- [[001_섀넌의 N-gram 모델]]
- Claude E. Shannon, [A Mathematical Theory of Communication](https://people.math.harvard.edu/~ctm/home/text/others/shannon/entropy/entropy.pdf), 1948, Part I §§2–3·§6.

## 관련 항목

- [[001_섀넌의 N-gram 모델]]
- [[마르코프 가정]]
- [[조건부 확률]]
- [[데이터 희소성]]
- [[Smoothing]]
- [[Perplexity]]
