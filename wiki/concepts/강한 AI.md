---
schema_version: 3
id: concept.강한-ai
page_type: concept
title: 강한 AI
aliases:
  - strong AI
  - Strong Artificial Intelligence
  - 강한 인공지능
tags:
  - type/concept
  - domain/ai
  - domain/cognitive-science
created: '2026-07-16'
updated: '2026-07-21'
editorial_status: active
review:
  evidence_coverage: verified
  content_mode: contested
artifacts:
  - 'raw/016_Chinese Room Argument - Syntax, Semantics, and the Limits of Computation.ko.md'
  - 'raw/016_Chinese Room Argument - Syntax, Semantics, and the Limits of Computation.commentary.ko.md'
evidence:
  - source_id: searle-1980
    locator: 'pp. 417–424, 특히 pp. 417–418, 422와 p. 424 n. 1'
    relation: supports
  - source_id: fodor-1980-searle
    locator: pp. 431–432
    relation: contextualizes
  - source_id: searle-1980-response
    locator: 'pp. 450–457, 특히 pp. 451–455'
    relation: supplements
relations:
  - target: entity.존-설
    kind: related
  - target: concept.튜링-테스트
    kind: related
  - target: concept.행동-기반-지능-기준
    kind: related
  - target: concept.대규모-언어-모델
    kind: related
learning:
  difficulty:
    entry: intermediate
    target: intermediate
  prerequisites: []
  assumed_knowledge: 없음
  outcomes:
    - 설이 비판한 강한 AI의 두 주장과 오늘날의 AGI·협소 AI 구분을 혼동하지 않고 설명할 수 있다.
  next:
    - target: source.016
      reason: 016중국어 방 논증과 강한 AI 논쟁 — 목표 논문과 반론의 정확한 범위를 근거별로 확인한다.
    - target: concept.중국어-방-논증
      reason: 중국어 방 논증 — 프로그램 실행과 이해 사이의 간극을 제시한 사고실험의 구조를 살핀다.
---
# 강한 AI

> [!note] 학습 안내
> **난이도:** 중급<br>
> **선수 지식:** 없음<br>
> **읽고 나면:** 설이 비판한 강한 AI의 두 주장과 오늘날의 AGI·협소 AI 구분을 혼동하지 않고 설명할 수 있다.

## 1단계 — 먼저 잡을 핵심

### 한 문장 정의

[[강한 AI]](strong AI)는 [[존 설]]이 1980년 「Minds, Brains, and Programs」에서 비판 대상으로 규정한 철학적 입장이다. 적절히 프로그램된 컴퓨터가 단순한 연구 도구가 아니라 문자 그대로 인지 상태를 가지며, 프로그램이 인간 인지를 설명한다고 본다.

### 설의 두 주장

설의 정의에는 구분되는 두 주장이 있다.

1. 적절한 프로그램을 실행하는 컴퓨터는 이해와 다른 인지 상태를 실제로 가진다.
2. 프로그램은 인간의 인지 과정을 설명하는 이론을 제공한다.

목표 논문은 [[로저 섕크]] 계열의 이야기 질의응답 프로그램을 구체적인 사례로 사용하지만, p. 424의 주 1은 섕크 자신이 두 주장 모두에 헌신한다고 단정하지 않는다. 구현된 프로그램의 기능과 개발자가 받아들인 철학적 입장을 분리해야 한다.

### 약한 AI와의 구분

설이 말한 약한 AI는 컴퓨터를 사용해 마음에 관한 가설을 세우고 시험하는 연구 도구의 역할을 가리킨다. 강한 AI와 약한 AI의 차이는 시스템이 처리하는 과제의 수나 범위가 아니다. 오늘날의 협소 AI 대 범용 AI 구분이나 AGI의 동의어로 설의 용어를 바꾸어 쓰지 않는다.

## 2단계 — 작동 원리

### 중국어 방이 겨냥한 범위

[[중국어 방 논증]]은 프로그램 구현만으로 이해와 지향성에 충분하다는 첫 주장에 반례를 제시하고, 그 결과 프로그램만으로 인간의 이해를 설명한다는 두 번째 주장도 비판한다. 그러나 이 논증은 기계 또는 인공 지능 일반이 원리상 이해할 수 없다고 주장하지 않는다. 목표 논문 p. 422는 두뇌와 동등한 내적 인과 능력을 가진 기계가 사고할 가능성을 열어 둔다.

설은 두뇌의 인과적 특징이 지향성을 낳는다고 가정하지만 어떤 물리적 특징이 충분한지는 제시하지 않는다. 이 전제가 입증됐는지, 기능적 조직과 환경 상호작용만으로 이해를 설명할 수 있는지, 전체 시스템에 이해를 귀속할 수 있는지를 두고 논쟁이 계속된다. 따라서 이 개념의 검증 상태는 `disputed`다.

## 3단계 — 기술과 근거

### 포더의 논평

raw는 제리 포더를 강한 AI의 대표 표명자로 제시하지만, Fodor의 1980년 공개 논평은 프로그램만으로 이해에 충분하지 않다는 설의 중심 명제에 동의한다. 그의 비판은 설이 두뇌만의 인과 능력이라고 부르는 것이 무엇인지 설명해야 한다는 데 초점을 둔다. 기능주의의 역사적 배경과 이 목표 논문에 대한 포더의 실제 입장을 구분한다.

### 현대 AI 용어와의 관계

이 위키에서는 설의 1980년 정의를 우선하며 강한 AI를 협소 AI·범용 AI·AGI와 동일시하지 않는다. 현대 신경 [[대규모 언어 모델]]이 이 정의의 두 주장을 충족하는지는 중국어 방만으로 판정되지 않으며, 행동·체계 수준의 기능·접지·지향성·의식을 구분해 별도로 논증해야 한다.

## 검증과 한계

### 논쟁 상태와 적용 범위

설의 용어 정의와 목표 논문의 주장은 문헌에서 확인되지만, 프로그램·기능적 조직·물리적 인과 능력 가운데 무엇이 이해에 충분한지에 관한 결론은 합의되지 않았다. 따라서 이 페이지는 용어의 역사적 범위를 고정하면서도 철학적 결론은 논쟁 상태로 남긴다.

## 학습 확인

### 확인 질문

1. 설이 강한 AI라는 이름으로 묶은 두 주장은 무엇인가?
2. 중국어 방 논증은 그 두 주장 중 무엇을 어떤 방식으로 비판하는가?
3. 설의 강한 AI를 오늘날의 AGI와 같은 뜻으로 사용하면 안 되는 이유는 무엇인가?

### 다음 문서

- [[source.016|중국어 방 논증과 강한 AI 논쟁]] — 016중국어 방 논증과 강한 AI 논쟁 — 목표 논문과 반론의 정확한 범위를 근거별로 확인한다.
- [[concept.중국어-방-논증|중국어 방 논증]] — 프로그램 실행과 이해 사이의 간극을 제시한 사고실험의 구조를 살핀다.

## 출처

- [[016_중국어 방 논증과 강한 AI 논쟁]]
- John R. Searle, [Minds, Brains, and Programs](https://doi.org/10.1017/S0140525X00005756), 1980, pp. 417–424, 특히 pp. 417–418, 422와 p. 424 n. 1.
- J. A. Fodor, [Searle on What Only Brains Can Do](https://doi.org/10.1017/S0140525X00005823), 1980, pp. 431–432.
- John R. Searle, [Intrinsic Intentionality](https://doi.org/10.1017/S0140525X00006038), 1980, pp. 450–457, 특히 pp. 451–455.

## 관련 항목

- [[source.016|중국어 방 논증과 강한 AI 논쟁]]
- [[concept.중국어-방-논증|중국어 방 논증]]
- [[entity.존-설|존 설]]
- [[concept.튜링-테스트|튜링 테스트]]
- [[concept.행동-기반-지능-기준|행동 기반 지능 기준]]
- [[concept.대규모-언어-모델|대규모 언어 모델]]
