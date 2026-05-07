---
title: Perplexity
aliases: [퍼플렉시티, PPL]
tags: [type/concept, domain/ai, status/active]
created: 2026-05-07
updated: 2026-05-07
sources: ["001_Shannon's N-gram Model - The Foundation of Statistical Language Processing..md"]
status: active
---

# Perplexity

[[Perplexity]]는 언어 모델이 다음 토큰을 얼마나 잘 예측하는지 평가하는 지표다. 일반적으로 값이 낮을수록 모델이 실제 텍스트에 더 높은 확률을 부여한다는 뜻이다.

이 지표는 [[클로드 섀넌]]의 정보 이론적 관점과 연결된다. 소스는 언어 모델 평가에 널리 쓰이는 perplexity가 섀넌이 n-gram과 함께 발전시킨 정보 이론적 틀에 뿌리를 둔다고 설명한다 [[001_섀넌의 N-gram 모델]].

## 역할

Perplexity는 [[N-gram 모델]]과 더 복잡한 신경망 언어 모델을 비교하는 기준으로 쓰일 수 있다. 새 모델이 단순한 n-gram 기준선보다 실제로 더 나은 예측을 하는지 확인하는 데 유용하다.

## 관련 항목

- [[N-gram 모델]]
- [[조건부 확률]]
- [[N-gram에서 LLM으로]]
- [[클로드 섀넌]]
