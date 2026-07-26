---
schema_version: 3
id: entity.mit
page_type: entity
title: MIT
aliases:
  - Massachusetts Institute of Technology
  - 매사추세츠 공과대학교
  - 매사추세츠 공과대학
tags:
  - type/entity
  - domain/ai
  - domain/academia
created: '2026-07-14'
updated: '2026-07-21'
editorial_status: active
review:
  evidence_coverage: verified
  content_mode: descriptive
artifacts:
  - raw/007_ELIZA - The First Conversational AI Program.ko.md
  - raw/007_ELIZA - The First Conversational AI Program.commentary.ko.md
  - raw/009_SHRDLU - Understanding Language Through Action.ko.md
  - raw/009_SHRDLU - Understanding Language Through Action.commentary.ko.md
evidence:
  - source_id: weizenbaum-1966
    locator: pp. 36–45
    relation: supports
  - source_id: winograd-1971
    locator: title page and chapters 1–3
    relation: supports
relations:
  - target: entity.조지프-바이젠바움
    kind: related
  - target: entity.테리-위노그래드
    kind: related
  - target: concept.튜링-테스트
    kind: related
learning:
  difficulty:
    entry: introductory
    target: introductory
  prerequisites: []
  assumed_knowledge: 없음
  outcomes:
    - 현재 위키에서 MIT가 ELIZA와 SHRDLU라는 서로 다른 자연어 시스템의 연구 환경으로 어떤 의미를 갖는지 설명할 수 있다.
  next:
    - target: concept.eliza
      reason: ELIZA — 제한된 패턴과 역할 설정으로 대화를 이어 간 시스템을 먼저 본다.
    - target: concept.shrdlu
      reason: SHRDLU — 폐쇄된 세계에서 언어·추론·행동을 통합한 다음 사례를 살펴본다.
---
# MIT

> [!note] 학습 안내
> **난이도:** 입문<br>
> **선수 지식:** 없음<br>
> **읽고 나면:** 현재 위키에서 MIT가 ELIZA와 SHRDLU라는 서로 다른 자연어 시스템의 연구 환경으로 어떤 의미를 갖는지 설명할 수 있다.

## 1단계 — 먼저 잡을 핵심

### 이 위키에서의 역할

[[MIT]](Massachusetts Institute of Technology)는 [[조지프 바이젠바움]]의 [[ELIZA]]와 [[테리 위노그래드]]의 [[SHRDLU]]가 개발된 연구 기관이다.

## 2단계 — 작동 원리

### 두 시스템이 바꾼 문제 범위

ELIZA는 제한된 대화 규칙으로 자연스러운 상호작용을 만드는 문제를 다뤘다. SHRDLU는 폐쇄된 세계 안에서 언어를 추론과 행동에 연결하는 문제로 범위를 넓혔다.

## 3단계 — 기술과 근거

### 소스에서의 의미

ELIZA 사례에서 MIT는 제한된 패턴과 대화 역할만으로도 자연스러운 상호작용이 가능함을 보여준 연구 환경이다. SHRDLU는 여기서 더 나아가 통사·의미·추론·행동을 시뮬레이션된 [[블록 세계]] 안에서 통합했다. 두 시스템은 모두 자연어 상호작용의 가능성을 넓혔지만, 전자는 대화 스크립트에, 후자는 폐쇄된 세계 모델과 수작업 지식에 범위가 제한됐다.

## 검증과 한계

### 기관과 시스템 범위의 경계

현재 문서는 `007`과 `009` 소스가 다루는 두 시스템의 연구 기관 맥락에 한정된다. MIT의 전체 AI 연구사를 대표하지 않으며, 각 시스템의 기여와 한계는 개발자와 원 문헌에 맞춰 귀속해야 한다.

## 학습 확인

### 확인 질문

1. 현재 위키에서 MIT와 연결되는 두 자연어 시스템은 무엇인가?
2. ELIZA에서 SHRDLU로 갈 때 다루는 문제 범위는 어떻게 넓어지는가?
3. 두 시스템이 각각 대화 스크립트와 블록 세계에 제한됐다는 말은 무엇을 뜻하는가?

### 다음 문서

- [[concept.eliza|ELIZA]] — 제한된 패턴과 역할 설정으로 대화를 이어 간 시스템을 먼저 본다.
- [[concept.shrdlu|SHRDLU]] — 폐쇄된 세계에서 언어·추론·행동을 통합한 다음 사례를 살펴본다.

## 출처

- [[007_ELIZA]]
- [[009_SHRDLU]]
- Terry Winograd, [Procedures as a Representation for Data in a Computer Program for Understanding Natural Language](https://hdl.handle.net/1721.1/7095), 1971.

## 관련 항목

- [[concept.eliza|ELIZA]]
- [[concept.shrdlu|SHRDLU]]
- [[entity.조지프-바이젠바움|조지프 바이젠바움]]
- [[entity.테리-위노그래드|테리 위노그래드]]
- [[concept.튜링-테스트|튜링 테스트]]
