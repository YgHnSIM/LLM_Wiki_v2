---
schema_version: 2
id: concept.eliza-효과
page_type: concept
title: ELIZA 효과
aliases:
  - ELIZA Effect
  - Eliza effect
  - 엘리자 효과
tags:
  - type/concept
  - domain/ai
  - domain/human-computer-interaction
created: '2026-07-14'
updated: '2026-07-21'
lifecycle: active
verification: partial
artifacts:
  - raw/007_ELIZA - The First Conversational AI Program.ko.md
  - raw/007_ELIZA - The First Conversational AI Program.commentary.ko.md
evidence:
  - source_id: weizenbaum-1966
    locator: pp. 36–45
    relation: supports
  - source_id: mit-eliza-1965
    locator: ELIZA source and DOCTOR script records
    relation: supplements
related:
  - concept.eliza
  - concept.doctor-스크립트
  - concept.튜링-테스트
  - concept.행동-기반-지능-기준
  - analysis.튜링-테스트와-llm-평가
  - analysis.eliza에서-llm으로
---
# ELIZA 효과

> [!note] 학습 안내
> **난이도:** 입문<br>
> **선수 지식:** [[ELIZA]]<br>
> **읽고 나면:** 자연스러운 대화 행동과 실제 이해·신뢰성을 분리해 평가해야 하는 이유를 설명할 수 있다.

## 1단계 — 먼저 잡을 핵심

### 핵심 정의와 용어 범위

[[ELIZA 효과]](ELIZA Effect)는 컴퓨터의 표면 행동에 인간과 같은 이해, 의도, 공감, 통찰을 과도하게 귀속하는 경향을 가리키는 후대의 용어다. 1966년 Weizenbaum 논문은 사용자가 프로그램에 예상보다 강하게 관여한 현상을 기록했지만, 당시 관찰과 나중에 정착한 명칭을 구분해야 한다.

## 2단계 — 작동 원리

### ELIZA 사례

[[ELIZA]]의 [[패턴 매칭]], 문법적 반사, [[템플릿 기반 응답 생성|응답 템플릿]]은 실제 의미 이해 없이도 적극적으로 듣는 인상을 만들었다. 특히 [[DOCTOR 스크립트]]의 치료 역할은 사용자가 기계적 질문을 공감과 전문적 통찰로 해석하게 했다.

## 3단계 — 기술과 근거

### 평가상의 의미

ELIZA 효과는 자연스럽거나 인간다운 대화가 시스템의 실제 이해와 신뢰성을 자동으로 증명하지 않는다는 점을 보여준다. 이는 [[행동주의적 지능 기준|행동 기반 지능 기준]], [[튜링 테스트]], 현대 [[대규모 언어 모델]] 평가의 공통 문제다.

## 검증과 한계

### 실용적 위험

정서적으로 민감한 상황에서는 사용자가 시스템에 과도한 신뢰를 줄 수 있다. 따라서 대화 품질과 별도로 한계 공개, 사실성, 안전성, 인간 감독을 평가해야 한다.

### 역사적 명칭의 경계

1966년 논문이 기록한 사용자 반응과 후대에 정착한 “ELIZA 효과”라는 명칭을 같은 시기의 용어처럼 합치지 않는다.

## 학습 확인

### 확인 질문

1. ELIZA 효과는 컴퓨터의 표면 행동에 무엇을 과도하게 귀속하는 경향인가?
2. 패턴 매칭과 치료 역할은 실제 이해 없이도 어떻게 공감의 인상을 만들었는가?
3. 자연스러운 대화 품질과 별도로 평가해야 할 항목에는 무엇이 있는가?

### 다음 문서

- [[튜링 테스트와 LLM 평가]] — 관찰 가능한 행동과 실제 능력을 평가할 때 생기는 공통 문제를 비교한다.
- [[ELIZA에서 LLM으로]] — ELIZA와 현대 언어 모델 사이의 연속성과 차이를 함께 본다.

## 출처

- [[007_ELIZA]]
- Joseph Weizenbaum, [ELIZA](https://doi.org/10.1145/365153.365168), 1966, pp. 42–43.

## 관련 항목

- [[ELIZA]]
- [[DOCTOR 스크립트]]
- [[튜링 테스트]]
- [[행동주의적 지능 기준]]
- [[튜링 테스트와 LLM 평가]]
- [[ELIZA에서 LLM으로]]
