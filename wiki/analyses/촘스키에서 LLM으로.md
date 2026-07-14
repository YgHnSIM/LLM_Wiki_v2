---
schema_version: 2
id: analysis.촘스키에서-llm으로
page_type: analysis
title: 촘스키에서 LLM으로
aliases:
  - From Chomsky to LLMs
  - 촘스키와 LLM
  - 규칙과 통계의 언어 AI
tags:
  - type/analysis
  - domain/ai
  - domain/nlp
  - domain/linguistics
created: '2026-05-14'
updated: '2026-07-15'
lifecycle: active
verification: partial
artifacts:
  - raw/005_Chomsky's Syntactic Structures.md
  - raw/005_Chomsky's Syntactic Structures.commentary.md
evidence:
  - source_id: chomsky-1957
    locator: chapters 2–10
    relation: supports
  - source_id: chomsky-1965
    locator: chapters 1–2
    relation: supports
related:
  - concept.통사론
  - concept.변형생성문법
  - concept.문맥자유문법
  - analysis.n-gram에서-llm으로
  - analysis.규칙-기반-ai에서-데이터-기반-학습으로
  - concept.대규모-언어-모델
---
# 촘스키에서 LLM으로

[[노엄 촘스키]]의 1950년대 연구는 문법을 문장을 생성하는 형식 체계로 분석하고, 표면 단어열만으로 설명하기 어려운 [[통사 구조]]를 강조했다. 이후의 [[심층 구조]], [[보편문법]], 원리와 매개변수는 서로 다른 시기의 이론이므로 “촘스키의 단일 이론”으로 합치지 않는다.

## 규칙과 구조의 흐름

형식언어 연구는 [[문맥자유문법]]과 [[촘스키 위계]]를 통해 문법의 생성력을 비교하는 틀을 제공했다. CYK와 Earley 같은 [[파싱]] 알고리즘은 이 틀을 처리한 후대의 독립적 계산 연구다. 촘스키의 1957년 책이 이 알고리즘들을 직접 구현했다고 설명하지 않는다.

## 확장성의 문제

그러나 규칙 기반 접근은 곧 확장성 문제와 마주했다. 실제 언어에는 예외, 관용 표현, 모호성, 화용론, 세계 지식이 개입한다. 모든 규칙을 사람이 작성하는 방식은 [[지식 공학 병목]]을 피하기 어렵다.

## 통계와 신경망의 흐름

통계적 접근과 신경망 접근은 이 병목을 다른 방식으로 풀었다. [[N-gram 모델]]은 언어를 관찰 빈도와 확률로 다루었고, [[퍼셉트론]] 이후의 신경망 계보는 데이터에서 가중치를 학습하는 방향을 열었다. 현대 [[대규모 언어 모델]]은 이 두 흐름을 결합해, 대규모 텍스트에서 다음 토큰 분포와 내부 표현을 함께 학습한다.

## 해석

현대 LLM은 촘스키식 문법 규칙을 명시적으로 입력받지 않아도 문법적으로 유창한 출력을 만든다. 그러나 인간보다 훨씬 큰 텍스트와 다른 학습 목표를 사용하므로 이 결과만으로 [[보편문법]]이나 [[자극의 빈곤]] 논증을 바로 반박할 수는 없다. 비교 가능한 질문은 모델이 위계 구조와 구조적 일반화를 어떤 조건에서 학습하는가다.

따라서 이 전환은 "규칙이 패배하고 통계가 승리했다"는 단순한 이야기로 정리하기 어렵다. 언어 AI의 역사는 구조를 명시적으로 설계하려는 흐름과, 데이터에서 구조를 학습하려는 흐름이 서로의 한계를 드러내며 결합해 온 과정이다.

## 출처

- [[005_촘스키의 통사 구조]]

## 관련 항목

- [[통사론]]
- [[변형생성문법]]
- [[문맥자유문법]]
- [[N-gram에서 LLM으로]]
- [[규칙 기반 AI에서 데이터 기반 학습으로]]
- [[대규모 언어 모델]]
