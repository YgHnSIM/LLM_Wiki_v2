---
schema_version: 3
id: concept.doctor-스크립트
page_type: concept
title: DOCTOR 스크립트
aliases:
  - DOCTOR
  - ELIZA DOCTOR
  - 닥터 스크립트
tags:
  - type/concept
  - domain/ai
  - domain/nlp
  - domain/conversational-ai
created: '2026-07-14'
updated: '2026-07-21'
editorial_status: active
review:
  evidence_coverage: verified
  content_mode: descriptive
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
relations:
  - target: entity.칼-로저스
    kind: related
  - target: concept.로저스식-심리치료
    kind: related
  - target: concept.패턴-매칭
    kind: related
learning:
  difficulty:
    entry: introductory
    target: introductory
  prerequisites:
    - target: concept.eliza
  assumed_knowledge: 없음
  outcomes:
    - DOCTOR가 특정 대화 역할을 키워드·우선순위·응답 템플릿으로 구성한 방식을 설명할 수 있다.
  next:
    - target: concept.템플릿-기반-응답-생성
      reason: 템플릿 기반 응답 생성 — DOCTOR의 키워드·변환·응답 규칙을 더 넓은 규칙 기반 생성 방식으로 확장해 본다.
    - target: concept.eliza-효과
      reason: ELIZA 효과 — 치료적 역할이 이해와 공감의 과대 귀속을 부르는 문제를 살펴본다.
---
# DOCTOR 스크립트

> [!note] 학습 안내
> **난이도:** 입문<br>
> **선수 지식:** [[concept.eliza|ELIZA]]<br>
> **읽고 나면:** DOCTOR가 특정 대화 역할을 키워드·우선순위·응답 템플릿으로 구성한 방식을 설명할 수 있다.

## 1단계 — 먼저 잡을 핵심

### 핵심 정의

[[DOCTOR 스크립트]]는 [[ELIZA]]가 [[로저스식 심리치료]]를 모사하도록 만든 대표적인 대화 규칙 모음이다. ELIZA 자체가 여러 영역의 스크립트를 사용할 수 있는 틀이었다면, DOCTOR는 심리치료라는 특정 역할에 맞춘 키워드·우선순위·응답 템플릿의 집합이었다.

## 2단계 — 작동 원리

### 설계의 적합성

로저스식 치료는 진단이나 구체적 조언보다 반사, 개방형 질문, 최소 응답을 강조한다. 이 특성은 의미 이해와 세계 지식이 없는 ELIZA의 제약과 잘 맞았다. 모호한 답변은 전문적 절제로, 되묻기는 적극적 경청으로 해석될 수 있었다.

## 3단계 — 기술과 근거

### 스크립트의 역할 범위

DOCTOR는 ELIZA 전체와 같은 이름이 아니라, ELIZA가 실행할 수 있는 여러 영역별 스크립트 가운데 하나다. 심리치료 역할에 맞춘 규칙 집합이라는 범위를 지켜야 시스템 틀과 적용 사례를 구분할 수 있다.

## 검증과 한계

### 한계

DOCTOR의 치료적 인상은 심리 상태를 실제로 이해하거나 안전한 치료 판단을 내린 결과가 아니다. 사용자가 프로그램에 공감과 전문성을 과도하게 귀속하면 [[ELIZA 효과]]가 발생할 수 있다.

## 학습 확인

### 확인 질문

1. ELIZA와 DOCTOR 스크립트의 관계는 무엇인가?
2. 반사와 개방형 질문이 규칙 기반 시스템의 제약과 잘 맞았던 이유는 무엇인가?
3. DOCTOR의 치료적 인상이 안전한 치료 판단 능력을 보장하지 않는 이유는 무엇인가?

### 다음 문서

- [[concept.템플릿-기반-응답-생성|템플릿 기반 응답 생성]] — DOCTOR의 키워드·변환·응답 규칙을 더 넓은 규칙 기반 생성 방식으로 확장해 본다.
- [[concept.eliza-효과|ELIZA 효과]] — 치료적 역할이 이해와 공감의 과대 귀속을 부르는 문제를 살펴본다.

## 출처

- [[007_ELIZA]]

## 관련 항목

- [[concept.템플릿-기반-응답-생성|템플릿 기반 응답 생성]]
- [[concept.eliza-효과|ELIZA 효과]]
- [[concept.eliza|ELIZA]]
- [[entity.칼-로저스|칼 로저스]]
- [[concept.로저스식-심리치료|로저스식 심리치료]]
- [[concept.패턴-매칭|패턴 매칭]]
