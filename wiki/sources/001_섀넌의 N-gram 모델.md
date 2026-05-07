---
title: 섀넌의 N-gram 모델
aliases: [Shannon's N-gram Model, Shannon N-gram, 1948 N-gram]
tags: [type/source, domain/ai, status/active]
created: 2026-05-07
updated: 2026-05-07
sources: ["001_Shannon's N-gram Model - The Foundation of Statistical Language Processing..md", "001_Shannon's N-gram Model - The Foundation of Statistical Language Processing.commentary.md"]
status: active
---

# 섀넌의 N-gram 모델

## 핵심 요약

이 소스는 [[클로드 섀넌]]의 1948년 정보 이론 연구가 자연어 처리(Natural Language Processing, NLP)의 핵심 문제인 언어 모델링(language modeling)으로 어떻게 이어졌는지 설명한다. 섀넌은 언어를 문법 규칙의 집합으로만 보지 않고, 관찰 가능한 텍스트에서 반복되는 통계적 패턴으로 다루었다.

[[N-gram 모델]]은 텍스트에서 연속된 n개의 항목을 세고, 앞선 문맥이 주어졌을 때 다음 단어 또는 문자가 나올 확률을 추정한다. 이 접근은 의미를 이해하지는 못하지만, 자동완성, 기계 번역, 음성 인식 같은 초기 언어 기술에서 실용적인 기준선으로 작동했다.

소스는 n-gram이 [[마르코프 가정]]에 기대어 계산 가능해진다고 설명한다. 다음 단어의 확률을 전체 과거가 아니라 제한된 최근 문맥으로 근사하면 모델을 단순하게 만들 수 있다. 이 단순화는 실용성을 제공하지만, 장거리 의존성과 의미 관계를 포착하지 못하는 한계도 만든다.

또한 소스는 n이 커질수록 가능한 조합 수가 지수적으로 늘어나는 [[데이터 희소성]] 문제를 강조한다. Katz back-off, Good-Turing, Kneser-Ney 같은 [[Smoothing]] 기법은 미관측 n-gram에도 확률을 부여하려는 해결책으로 등장했다.

마지막으로 이 소스는 n-gram의 한계가 분산 표현(distributed representations), word2vec, GloVe, 순환 신경망, 트랜스포머(transformer)로 이어지는 연구 흐름을 촉진했다고 본다. 현대 대규모 언어 모델(Large Language Model, LLM)은 메커니즘은 다르지만, 관찰된 문맥에서 다음 토큰 분포를 예측한다는 문제 설정에서는 n-gram의 지적 후손으로 이해될 수 있다.

## 주요 인사이트

- 섀넌의 핵심 전환은 언어를 규칙 기반 기호 체계가 아니라 확률적 예측 대상으로 본 데 있다.
- n-gram은 단순한 빈도 계산과 [[조건부 확률]]만으로 언어 기술의 초기 실용 시스템을 가능하게 했다.
- [[마르코프 가정]]은 계산 가능성을 주지만, 장거리 문맥과 담화 수준 정보를 잘라낸다.
- [[데이터 희소성]]은 n-gram 모델의 실용적 병목이며, [[Smoothing]] 연구의 직접적 동기였다.
- [[Perplexity]] 같은 언어 모델 평가 지표는 섀넌의 정보 이론적 관점과 연결된다.

## 인용할 만한 구절

> 언어를 통계적으로 모델링할 수 있으며, 관찰된 데이터의 패턴이 보지 못한 텍스트에 대한 예측을 이끌 수 있다는 섀넌의 통찰은 관점의 깊은 전환을 의미했다.

> 오늘날 GPT-4 같은 대규모 언어 모델에서도 n-gram적 사고의 흔적을 발견할 수 있다.

## 관련 위키 페이지

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

## 관련 항목

- [[overview]]
- [[index]]
