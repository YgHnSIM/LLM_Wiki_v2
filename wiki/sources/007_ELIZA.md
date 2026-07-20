---
schema_version: 2
id: source.007
page_type: source
title: ELIZA
aliases:
  - 007_ELIZA
  - ELIZA program
  - Weizenbaum ELIZA
tags:
  - type/source
  - domain/ai
  - domain/nlp
  - domain/conversational-ai
created: '2026-07-14'
updated: '2026-07-21'
lifecycle: active
verification: verified
artifacts:
  - raw/007_ELIZA - The First Conversational AI Program.ko.md
  - raw/007_ELIZA - The First Conversational AI Program.commentary.ko.md
evidence:
  - source_id: weizenbaum-1966
    locator: pp. 36–45
    relation: supports
  - source_id: mit-eliza-1965
    locator: ELIZA source and DOCTOR script records
    relation: supports
related:
  - entity.조지프-바이젠바움
  - entity.mit
  - entity.칼-로저스
  - concept.eliza
  - concept.doctor-스크립트
  - concept.패턴-매칭
  - concept.템플릿-기반-응답-생성
  - concept.대화-복구
  - concept.로저스식-심리치료
  - concept.eliza-효과
  - concept.튜링-테스트
  - concept.행동-기반-지능-기준
  - analysis.eliza에서-llm으로
  - analysis.ai-시연과-실제-성능
  - concept.대규모-언어-모델
---
# ELIZA

> [!note] 학습 안내
> **난이도:** 입문<br>
> **선수 지식:** 없음.<br>
> **읽고 나면:** ELIZA 프레임워크와 DOCTOR 스크립트를 구분하고, 규칙 기반 대화가 설득력 있는 응답을 만드는 과정과 그 평가 한계를 설명할 수 있다.

## 1단계 — 먼저 잡을 핵심

### 핵심 요약

ELIZA는 사용자의 문장을 깊이 이해해 답을 새로 지어내는 시스템이 아니라, 입력에서 패턴을 찾고 스크립트에 적힌 응답 규칙을 적용하는 대화 프레임워크다. 가장 유명한 DOCTOR는 그 프레임워크 위에서 비지시적 치료사 역할을 구현한 하나의 스크립트다.

역사적 중요성은 의미 이해를 완성한 데 있지 않다. 제한된 규칙과 역할 설정만으로도 사용자가 대화 상대에게 이해와 의도를 부여할 수 있다는 평가 문제를 선명하게 드러냈다는 데 있다.

### 주요 인사이트

- ELIZA 프레임워크와 DOCTOR 스크립트는 서로 다른 층위다.
- 설득력은 의미 이해뿐 아니라 역할, 패턴, 템플릿, 사용자의 기대에서도 생길 수 있다.
- ELIZA와 튜링 테스트의 관계는 후대의 비교이지 확인된 직접 개발 계보가 아니다.
- 1966년의 사용자 반응과 후대 용어인 ELIZA 효과를 구분해야 한다.
- 대화 유창성은 정확성·의도·공감·안전성을 자동으로 입증하지 않는다.

### 핵심 문장

- ELIZA는 스크립트가 정의한 대화 규칙을 실행하는 범용 처리 프레임워크였다.
- DOCTOR의 설득력은 제한된 기술과 비지시적 치료 역할이 잘 맞아떨어진 결과였다.
- ELIZA의 역사적 의미는 이해를 달성했다는 데보다 이해처럼 보이는 행동의 평가 문제를 드러낸 데 있다.

## 2단계 — 작동 원리

### 문제와 가상 예시

대화 시스템은 사용자가 어떤 표현을 했는지 찾고, 그 표현에 맞는 다음 응답을 골라야 한다. 가령 사용자가 걱정을 말하면 특정 핵심어를 찾아 그 말을 다시 질문 형태로 돌려주는 장면을 생각할 수 있다. 이것은 결손된 원문 대화를 추정해 복원한 것이 아니라, 패턴과 템플릿의 관계를 설명하기 위한 가상 예시다.

### 스크립트와 처리 흐름

처리 프레임워크는 입력 규칙을 실행하고, 별도의 스크립트는 어떤 역할로 어떤 응답을 할지 정한다. 따라서 DOCTOR는 ELIZA 전체와 같은 이름의 단일 프로그램이라기보다, ELIZA가 실행하는 대표적인 역할 스크립트로 읽어야 한다.

처리 흐름을 단순화하면 다음과 같다.

1. 입력에서 스크립트가 아는 키워드를 찾고 우선순위를 적용한다.
2. 분해 규칙으로 입력의 일부를 패턴 변수에 대응시킨다.
3. 대명사 같은 표현을 대화 상대에 맞게 바꾼다.
4. 재조립 규칙의 템플릿에 대응된 표현을 넣어 응답을 만든다.
5. 직접 맞는 규칙이 없을 때는 기억 규칙이나 복구용 응답으로 대화를 이어 간다.

### 결과와 읽는 법

DOCTOR의 비지시적 질문 방식은 지식 부족을 드러내지 않고 사용자가 더 말하도록 유도했다. 이는 의미를 깊이 이해했다는 증거가 아니라 역할 설정, 대화 관습, 사용자의 해석이 함께 만든 상호작용 효과였다. 바이젠바움의 1966년 논문도 프로그램의 제한된 이해와 사용자가 부여하는 신뢰 사이의 간극을 관찰했다.

## 3단계 — 기술과 근거

### 개발과 발표 연표

[[조지프 바이젠바움]]은 1964~1966년 [[MIT]]에서 자연어 대화 프레임워크 [[ELIZA]]를 개발했고 1966년 논문으로 구조를 설명했다. MIT 기록에는 1965년 프로그램과 [[DOCTOR 스크립트]] 자료가 남아 있다. 따라서 “1966년에 처음 만들어졌다”보다 “1964~1966년 개발되고 1966년 발표됐다”는 연표가 정확하다.

### 기술 구성 요소

ELIZA는 특정 대화 역할을 구현하는 스크립트와 이를 실행하는 처리 프레임워크를 구분했다. 키워드 우선순위, 분해 규칙, 재조립 규칙, 대명사 변환, 기억 규칙을 이용해 입력을 [[패턴 매칭]]하고 [[템플릿 기반 응답 생성|응답 템플릿]]을 선택했다. 프로그램 자체와 로저스식 치료사를 모사한 DOCTOR를 같은 이름으로 취급하면 구조가 흐려진다.

## 검증과 한계

### 원문 상태

프로젝트 raw 번역에는 두 대화 예시 자리에 `Loading component...`와 단독 문자 `u`가 남아 있다. 이 결손은 프로젝트 보존 자료의 품질 문제로 기록하되, 1966년 논문과 MIT 코드 아카이브로 ELIZA의 구조와 예시를 검증한다. 결손 부분을 추정해 복원하지 않는다.

### 확인된 사실

1964~1966년의 개발 연표, 1965년 프로그램·DOCTOR 기록, 1966년 논문에 기술된 프레임워크와 규칙은 1차 자료로 확인된다. 사용자가 제한된 프로그램에 신뢰와 이해를 부여하는 반응도 1966년 논문에서 관찰된다.

### 프로젝트 해석

ELIZA를 [[튜링 테스트]]의 “최초 구현” 또는 튜링이 구상한 과제를 직접 수행하려고 만든 프로그램이라고 단정할 근거는 부족하다. 두 작업은 후대의 관점에서 언어 행동과 지능 평가라는 문제로 비교할 수 있지만, 개발 목적과 역사적 인과를 분리해야 한다.

### 후대 평가와 계보의 한계

[[ELIZA 효과]]라는 명칭은 후대에 정착한 용어다. 1966년 논문에서 확인되는 사용자 반응과, 그 현상에 나중에 붙은 이름을 구분해야 한다. 현대 [[대규모 언어 모델]]과 ELIZA도 기술적으로는 크게 다르지만, 유창한 출력과 실제 이해·신뢰성을 구분해야 한다는 평가 문제는 공유한다.

## 학습 확인

1. ELIZA 프레임워크와 DOCTOR 스크립트는 어떻게 다른가?
2. 키워드 탐색에서 응답 템플릿 선택까지 ELIZA의 처리 흐름은 어떻게 이어지는가?
3. 설득력 있는 응답이 의미 이해나 튜링 테스트와의 직접 계보를 보장하지 않는 이유는 무엇인가?

다음에는 [[패턴 매칭]]에서 입력 규칙이 작동하는 방식을 자세히 본다. 규칙 기반 대화와 현대 모델의 평가 문제를 비교하려면 [[ELIZA에서 LLM으로]]을 읽는다.

## 출처

- Joseph Weizenbaum, [ELIZA—A Computer Program for the Study of Natural Language Communication Between Man and Machine](https://doi.org/10.1145/365153.365168), 1966, pp. 36–45.
- MIT Libraries, [ELIZA source code and DOCTOR script records](https://dome.mit.edu/handle/1721.3/201699?show=full), 1965.
- 프로젝트 번역·검토 출발 자료: [ELIZA - The First Conversational AI Program](https://mbrenndoerfer.com/writing/history-eliza-conversational-ai)
- 프로젝트 보존 자료: `raw/007_ELIZA - The First Conversational AI Program.ko.md`, `raw/007_ELIZA - The First Conversational AI Program.commentary.ko.md`.

## 관련 항목

- [[조지프 바이젠바움]]
- [[MIT]]
- [[칼 로저스]]
- [[ELIZA]]
- [[DOCTOR 스크립트]]
- [[패턴 매칭]]
- [[템플릿 기반 응답 생성]]
- [[대화 복구]]
- [[로저스식 심리치료]]
- [[ELIZA 효과]]
- [[튜링 테스트]]
- [[행동주의적 지능 기준]]
- [[ELIZA에서 LLM으로]]
- [[AI 시연과 실제 성능]]
- [[대규모 언어 모델]]
