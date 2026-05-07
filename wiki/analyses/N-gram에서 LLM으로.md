---
title: N-gram에서 LLM으로
aliases: [n-gram to LLM, 언어 모델링 계보, 다음 토큰 예측의 역사]
tags: [type/analysis, domain/ai, status/active]
created: 2026-05-07
updated: 2026-05-07
sources: ["001_Shannon's N-gram Model - The Foundation of Statistical Language Processing..md", "001_Shannon's N-gram Model - The Foundation of Statistical Language Processing.commentary.md"]
status: active
---

# N-gram에서 LLM으로

[[N-gram에서 LLM으로]] 이어지는 핵심 연속성은 "앞의 문맥이 주어졌을 때 다음 항목의 확률 분포를 예측한다"는 문제 설정이다. [[N-gram 모델]]은 이 문제를 짧은 표면 문맥의 빈도표로 풀었고, 현대 대규모 언어 모델(Large Language Model, LLM)은 긴 문맥과 신경망 표현을 통해 푼다.

## 같은 점

두 접근 모두 언어를 예측 가능한 확률 과정으로 본다. n-gram은 [[조건부 확률]]을 명시적인 빈도표로 계산하고, LLM은 신경망 내부 상태를 통해 다음 토큰 분포를 산출한다. 소스는 오늘날 GPT 계열 모델에서도 n-gram적 사고의 흔적을 찾을 수 있다고 설명한다 [[001_섀넌의 N-gram 모델]].

## 다른 점

N-gram 모델은 [[마르코프 가정]]에 따라 제한된 최근 문맥만 사용한다. 반면 LLM은 훨씬 긴 문맥 창과 attention 메커니즘을 통해 더 넓은 정보를 반영한다. 또한 n-gram은 단어를 표면 토큰으로 취급하지만, 신경망 모델은 단어와 토큰의 의미적 유사성을 벡터 표현에 담을 수 있다.

## 역사적 압력

N-gram 모델의 한계는 이후 연구 방향을 밀어냈다. [[데이터 희소성]]은 [[Smoothing]] 연구를 낳았고, 의미 유사성을 표현하지 못하는 문제는 분산 표현과 word2vec, GloVe 같은 접근으로 이어졌다. 장거리 의존성을 포착하지 못하는 문제는 순환 신경망과 트랜스포머 연구의 배경이 되었다.

## 해석

N-gram은 현대 LLM의 축소판이라기보다, 언어 모델링의 문제 설정을 선명하게 만든 초기 형식이다. 오늘날의 모델은 빈도표를 그대로 조회하지 않지만, 관찰된 문맥에서 가능한 이어짐의 확률을 추정한다는 점에서 [[클로드 섀넌]]의 정보 이론적 관점과 이어져 있다.

## 관련 항목

- [[001_섀넌의 N-gram 모델]]
- [[N-gram 모델]]
- [[마르코프 가정]]
- [[데이터 희소성]]
- [[Smoothing]]
- [[Perplexity]]
