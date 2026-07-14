---
schema_version: 2
id: analysis.n-gram에서-llm으로
page_type: analysis
title: N-gram에서 LLM으로
aliases:
  - n-gram to LLM
  - 언어 모델링 계보
  - 다음 토큰 예측의 역사
tags:
  - type/analysis
  - domain/ai
created: '2026-05-07'
updated: '2026-07-15'
lifecycle: active
verification: partial
artifacts:
  - >-
    raw/001_Shannon's N-gram Model - The Foundation of Statistical Language
    Processing..md
  - >-
    raw/001_Shannon's N-gram Model - The Foundation of Statistical Language
    Processing.commentary.md
  - raw/002_The Turing Test.md
  - raw/003_Georgetown-IBM Machine.md
  - raw/004_The Perceptron.md
  - raw/005_Chomsky's Syntactic Structures.md
evidence:
  - source_id: shannon-1948
    locator: 'Part I, §§2–3 and §6'
    relation: supports
  - source_id: turing-1950
    locator: 'pp. 433–460, §§1–7'
    relation: supports
  - source_id: macdonald-1963
    locator: pp. 1–4
    relation: supports
  - source_id: rosenblatt-1958
    locator: pp. 386–408
    relation: supports
  - source_id: chomsky-1957
    locator: chapters 2–10
    relation: supports
  - source_id: gpt-2018
    locator: §§2–3
    relation: contextualizes
  - source_id: bert-2019
    locator: §3
    relation: contextualizes
related:
  - source.001
  - source.002
  - concept.n-gram-모델
  - concept.마르코프-가정
  - concept.데이터-희소성
  - concept.smoothing
  - concept.perplexity
  - analysis.튜링-테스트와-llm-평가
  - concept.기계-번역
  - analysis.ai-시연과-실제-성능
  - concept.퍼셉트론
  - analysis.규칙-기반-ai에서-데이터-기반-학습으로
  - concept.통사-구조
  - analysis.촘스키에서-llm으로
---
# N-gram에서 LLM으로

[[N-gram에서 LLM으로]]는 단선적인 발명 계보가 아니라 공통 문제와 중요한 단절을 비교하는 분석이다. [[N-gram 모델]]과 자기회귀 대규모 언어 모델(Large Language Model, LLM)은 앞의 문맥에서 다음 항목의 확률 분포를 예측하지만, 표현과 학습 방식은 크게 다르다.

## 같은 점

두 접근 모두 언어열에 [[조건부 확률]]을 부여할 수 있다. n-gram은 명시적인 빈도표를 사용하고, 자기회귀 LLM은 신경망 내부 상태로 다음 토큰 분포를 산출한다. 이 공통점은 과업 수준의 연속성이며 GPT가 n-gram 계산을 그대로 확장한다는 뜻은 아니다.

## 다른 점

N-gram 모델은 [[마르코프 가정]]에 따라 제한된 최근 문맥만 사용한다. 반면 LLM은 훨씬 긴 문맥 창과 attention 메커니즘을 통해 더 넓은 정보를 반영한다. 또한 n-gram은 단어를 표면 토큰으로 취급하지만, 신경망 모델은 단어와 토큰의 의미적 유사성을 벡터 표현에 담을 수 있다.

## 역사적 압력

N-gram의 [[데이터 희소성]]은 [[Smoothing]]과 back-off 연구의 직접 동기였다. 분산 표현, 순환 신경망과 트랜스포머는 장거리 문맥과 일반화 문제를 다른 방식으로 다뤘지만, 이 발전을 n-gram 한계가 각 기술을 직접 낳았다는 단일 인과 사슬로 표현하지 않는다.

## 해석

N-gram은 현대 LLM의 축소판이 아니다. Shannon의 1948년 논문은 확률적 통신원과 연속 근사를 다뤘고, 현대 n-gram 용어·smoothing·신경망 언어 모델은 후대에 각각 발전했다. 연결은 문제 설정과 수학적 어휘의 공유로 한정한다.

## 평가 축과의 접점

[[튜링 테스트]]는 같은 언어 AI 역사를 다른 질문으로 비춘다. 섀넌 계보가 언어를 예측 가능한 확률 과정으로 다루었다면, [[앨런 튜링]]의 계보는 언어 행동이 어느 정도 지능의 증거가 되는지를 묻는다. 현대 LLM은 두 흐름이 만나는 지점에 있다. 다음 토큰 예측으로 학습되지만, 실제 평가는 인간과 자연스럽게 대화하고 신뢰할 만한 답을 제공하는지까지 포함한다.

## 규칙 기반 NLP와의 대비

[[003_Georgetown-IBM 기계 번역 시연]]은 n-gram 계보와 다른 초기 NLP 흐름을 보여준다. 여기서 언어 처리는 확률적 예측보다 사전 조회와 통사 규칙 적용에 가까웠다. 이 접근은 제한된 문장에서는 작동했지만, 확장 과정에서 [[지식 공학 병목]]과 실제 성능 평가 문제를 드러냈다. 현대 LLM은 통계적 예측, 대규모 학습, 다과업 생성 능력을 결합하면서 이 두 계보의 일부를 흡수한다.

## 신경망 학습 계보

[[004_퍼셉트론]]은 오류 수정으로 선형 분류기의 가중치를 학습했다. 현대 LLM도 학습 가능한 가중치를 사용하지만 자기지도 사전학습과 미분 가능한 다층 구조를 이용한다. 두 모델을 동일한 지도학습 방식으로 묶지 않고 넓은 신경망 학습사 안의 서로 다른 지점으로 본다.

## 구조적 언어관과의 접점

[[005_촘스키의 통사 구조]]는 n-gram 계보와 긴장 관계에 있는 구조적 언어관을 추가한다. n-gram은 제한된 표면 문맥의 확률로 언어를 모델링하지만, 촘스키는 자연어가 [[유한상태 모델]]보다 강한 형식 체계와 [[통사 구조]]를 요구한다고 보았다. 현대 LLM은 표면 확률 예측으로 학습되지만, 내부적으로 위계 구조를 어느 정도 학습하는지라는 질문에서 두 계보가 다시 만난다.

## 출처

- [[001_섀넌의 N-gram 모델]]
- [[002_튜링 테스트]]
- [[003_Georgetown-IBM 기계 번역 시연]]
- [[004_퍼셉트론]]
- [[005_촘스키의 통사 구조]]

## 관련 항목

- [[001_섀넌의 N-gram 모델]]
- [[002_튜링 테스트]]
- [[N-gram 모델]]
- [[마르코프 가정]]
- [[데이터 희소성]]
- [[Smoothing]]
- [[Perplexity]]
- [[튜링 테스트와 LLM 평가]]
- [[기계 번역]]
- [[AI 시연과 실제 성능]]
- [[퍼셉트론]]
- [[규칙 기반 AI에서 데이터 기반 학습으로]]
- [[통사 구조]]
- [[촘스키에서 LLM으로]]
