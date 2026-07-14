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
updated: '2026-07-15'
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

## 핵심 요약

[[조지프 바이젠바움]]은 1964~1966년 [[MIT]]에서 자연어 대화 프레임워크 [[ELIZA]]를 개발했고 1966년 논문으로 구조를 설명했다. MIT 기록에는 1965년 프로그램과 [[DOCTOR 스크립트]] 자료가 남아 있다. 따라서 “1966년에 처음 만들어졌다”보다 “1964~1966년 개발되고 1966년 발표됐다”는 연표가 정확하다.

ELIZA는 특정 대화 역할을 구현하는 스크립트와 이를 실행하는 처리 프레임워크를 구분했다. 키워드 우선순위, 분해 규칙, 재조립 규칙, 대명사 변환, 기억 규칙을 이용해 입력을 [[패턴 매칭]]하고 [[템플릿 기반 응답 생성|응답 템플릿]]을 선택했다. 프로그램 자체와 로저스식 치료사를 모사한 DOCTOR를 같은 이름으로 취급하면 구조가 흐려진다.

DOCTOR의 비지시적 질문 방식은 지식 부족을 드러내지 않고 사용자가 더 말하도록 유도했다. 이는 의미를 깊이 이해했다는 증거가 아니라 역할 설정, 대화 관습, 사용자의 해석이 함께 만든 상호작용 효과였다. 바이젠바움의 1966년 논문도 프로그램의 제한된 이해와 사용자가 부여하는 신뢰 사이의 간극을 관찰했다.

ELIZA를 [[튜링 테스트]]의 “최초 구현” 또는 튜링이 구상한 과제를 직접 수행하려고 만든 프로그램이라고 단정할 근거는 부족하다. 두 작업은 후대의 관점에서 언어 행동과 지능 평가라는 문제로 비교할 수 있지만, 개발 목적과 역사적 인과를 분리해야 한다.

[[ELIZA 효과]]라는 명칭은 후대에 정착한 용어다. 1966년 논문에서 확인되는 사용자 반응과, 그 현상에 나중에 붙은 이름을 구분해야 한다. 현대 [[대규모 언어 모델]]과 ELIZA도 기술적으로는 크게 다르지만, 유창한 출력과 실제 이해·신뢰성을 구분해야 한다는 평가 문제는 공유한다.

## 원문 상태

프로젝트 raw 번역에는 두 대화 예시 자리에 `Loading component...`와 단독 문자 `u`가 남아 있다. 이 결손은 프로젝트 보존 자료의 품질 문제로 기록하되, 1966년 논문과 MIT 코드 아카이브로 ELIZA의 구조와 예시를 검증한다. 결손 부분을 추정해 복원하지 않는다.

## 주요 인사이트

- ELIZA 프레임워크와 DOCTOR 스크립트는 서로 다른 층위다.
- 설득력은 의미 이해뿐 아니라 역할, 패턴, 템플릿, 사용자의 기대에서도 생길 수 있다.
- ELIZA와 튜링 테스트의 관계는 후대의 비교이지 확인된 직접 개발 계보가 아니다.
- 1966년의 사용자 반응과 후대 용어인 ELIZA 효과를 구분해야 한다.
- 대화 유창성은 정확성·의도·공감·안전성을 자동으로 입증하지 않는다.

## 핵심 문장

- ELIZA는 스크립트가 정의한 대화 규칙을 실행하는 범용 처리 프레임워크였다.
- DOCTOR의 설득력은 제한된 기술과 비지시적 치료 역할이 잘 맞아떨어진 결과였다.
- ELIZA의 역사적 의미는 이해를 달성했다는 데보다 이해처럼 보이는 행동의 평가 문제를 드러낸 데 있다.

## 출처

- Joseph Weizenbaum, [ELIZA—A Computer Program for the Study of Natural Language Communication Between Man and Machine](https://doi.org/10.1145/365153.365168), 1966, pp. 36–45.
- MIT Libraries, [ELIZA source code and DOCTOR script records](https://dome.mit.edu/handle/1721.3/201699?show=full), 1965.
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
