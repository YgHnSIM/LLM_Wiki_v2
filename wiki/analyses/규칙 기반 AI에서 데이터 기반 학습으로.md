---
schema_version: 2
id: analysis.규칙-기반-ai에서-데이터-기반-학습으로
page_type: analysis
title: 규칙 기반 AI에서 데이터 기반 학습으로
aliases:
  - rules to data-driven learning
  - 규칙에서 학습으로
  - 데이터 기반 AI 전환
tags:
  - type/analysis
  - domain/ai
created: '2026-05-14'
updated: '2026-07-15'
lifecycle: active
verification: partial
artifacts:
  - raw/003_Georgetown-IBM Machine.md
  - raw/004_The Perceptron.md
  - raw/004_The Perceptron.commentary.md
  - raw/005_Chomsky's Syntactic Structures.md
  - raw/006_1962_위드로-호프_MADALINE.md
  - raw/006_1962_위드로-호프_MADALINE_해설.md
  - raw/007_ELIZA - The First Conversational AI Program.ko.md
  - raw/007_ELIZA - The First Conversational AI Program.commentary.ko.md
evidence:
  - source_id: macdonald-1963
    locator: pp. 1–4
    relation: supports
  - source_id: rosenblatt-1958
    locator: pp. 386–408
    relation: supports
  - source_id: chomsky-1957
    locator: chapters 2–10
    relation: supports
  - source_id: widrow-lehr-1990
    locator: pp. 1415–1433
    relation: supports
  - source_id: weizenbaum-1966
    locator: pp. 36–45
    relation: supports
  - source_id: gpt-2018
    locator: §§2–3
    relation: contextualizes
  - source_id: bert-2019
    locator: §3
    relation: contextualizes
related:
  - concept.규칙-기반-기계-번역
  - concept.지식-공학-병목
  - concept.퍼셉트론
  - concept.지도-학습
  - concept.adaline
  - concept.madaline
  - concept.특징-공학
  - concept.eliza
  - concept.패턴-매칭
  - concept.템플릿-기반-응답-생성
  - concept.통사-구조
  - concept.대규모-언어-모델
---
# 규칙 기반 AI에서 데이터 기반 학습으로

[[규칙 기반 AI에서 데이터 기반 학습으로]]의 전환은 AI 시스템을 사람이 직접 규칙으로 작성하는 방식에서, 데이터로부터 매개변수와 패턴을 학습하는 방식으로 옮긴 흐름을 가리킨다. [[003_Georgetown-IBM 기계 번역 시연]]과 [[004_퍼셉트론]]은 이 전환의 두 축을 보여준다.

## 규칙 기반 접근의 장점과 병목

Georgetown-IBM 시연은 사전 조회와 통사 규칙을 결합해 번역을 계산 절차로 만들었다. 이 방식은 제한된 문장과 좁은 영역에서는 설명 가능하고 구현 가능했지만, 언어쌍, 전문 영역, 관용 표현, 복잡한 구문이 늘어날수록 사람이 규칙과 사전을 계속 추가해야 했다. 이 문제가 [[지식 공학 병목]]이다.

[[005_촘스키의 통사 구조]]는 규칙 기반 접근의 이론적 매력을 보여준다. 언어가 실제로 위계적 [[통사 구조]]와 [[재귀]]를 가진다면, 문법 규칙과 [[파싱]]으로 언어를 분석하려는 시도는 단순한 수작업 편의가 아니라 언어의 구조를 모델링하려는 시도였다.

## 퍼셉트론의 전환

[[퍼셉트론]]은 다른 방향을 제안했다. 사람이 분류 규칙을 직접 쓰는 대신, 라벨이 붙은 예시를 제공하고 시스템이 가중치를 조정하게 했다. 이는 AI가 특정 규칙을 실행하는 기계에서, 경험을 통해 성능을 개선하는 학습 시스템으로 바뀔 수 있음을 보여주었다.

## 한계가 만든 다음 단계

퍼셉트론은 [[선형 분리 가능성|선형 분리 가능]]한 문제만 표현했다. [[XOR 문제]]는 단층 모델이 비선형 경계를 표현하지 못한다는 간단한 사례다. Minsky와 Papert의 분석, 계산 자원, 다층 학습법의 부재, 연구비와 기대 변화가 함께 이후의 연구 흐름에 영향을 주었으므로 XOR 하나를 신경망 침체의 원인으로 만들지 않는다.

## MADALINE의 혼합 전략

[[006_위드로-호프의 MADALINE]]은 규칙과 학습이 공존하는 과도기적 해법을 보여준다. 여러 [[ADALINE]]은 [[LMS 알고리즘]]으로 데이터에서 가중치를 학습하지만, 입력 [[특징 공학]]과 최종 논리 게이트는 엔지니어가 설계한다. 이는 데이터 기반 학습으로의 전환이 한 번에 완성된 것이 아니라, 학습 가능한 부분을 점차 넓혀온 과정임을 보여준다.

## ELIZA의 규칙 기반 대화

[[007_ELIZA]]의 [[ELIZA]]는 사람이 키워드 우선순위, [[패턴 매칭]] 규칙, 응답 템플릿, 대명사 변환을 직접 작성한 시스템이다. 제한된 역할 안에서는 매우 설득력 있게 작동했지만, 새로운 영역으로 확장하려면 별도의 스크립트와 규칙이 필요했다. 이는 규칙 기반 접근의 통제 가능성과 [[지식 공학 병목]]을 동시에 보여준다.

## 현대 LLM으로의 연결

현대 [[대규모 언어 모델]]은 대규모 텍스트에서 표현과 패턴을 학습하며 많은 수작업 언어 규칙을 대체한다. 퍼셉트론과는 학습 목표와 구조가 다르지만 학습 가능한 매개변수를 사용한다는 넓은 신경망 계보를 공유한다. 데이터 선택, 토큰화, 평가 기준, 안전 정책, 도구 사용 규칙과 지식 갱신은 여전히 사람이 설계한다.

## 해석

AI 역사는 규칙 기반 접근이 단순히 실패하고 데이터 기반 학습이 승리한 이야기가 아니다. 규칙 기반 시스템은 명시성과 통제 가능성을 제공했고, 학습 기반 시스템은 확장성과 적응성을 제공했다. 현대 AI의 실용적 과제는 두 흐름을 결합해, 데이터에서 학습하되 필요한 곳에서는 구조와 검증 절차를 명시적으로 부여하는 데 있다.

## 출처

- [[003_Georgetown-IBM 기계 번역 시연]]
- [[004_퍼셉트론]]
- [[005_촘스키의 통사 구조]]
- [[006_위드로-호프의 MADALINE]]
- [[007_ELIZA]]

## 관련 항목

- [[규칙 기반 기계 번역]]
- [[지식 공학 병목]]
- [[퍼셉트론]]
- [[지도 학습]]
- [[ADALINE]]
- [[MADALINE]]
- [[특징 공학]]
- [[ELIZA]]
- [[패턴 매칭]]
- [[템플릿 기반 응답 생성]]
- [[통사 구조]]
- [[대규모 언어 모델]]
