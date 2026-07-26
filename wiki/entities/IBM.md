---
schema_version: 3
id: entity.ibm
page_type: entity
title: IBM
aliases:
  - International Business Machines
  - IBM 701
tags:
  - type/entity
  - domain/ai
created: '2026-05-08'
updated: '2026-07-21'
editorial_status: active
review:
  evidence_coverage: verified
  content_mode: descriptive
artifacts:
  - raw/003_Georgetown-IBM Machine.md
  - raw/022_IBM Statistical Machine Translation - From Rules to Data.ko.md
  - raw/022_IBM Statistical Machine Translation - From Rules to Data.commentary.ko.md
  - raw/040_IBM Watson on Jeopardy! - Historic AI Victory That Demonstrated Open-Domain Question Answering.ko.md
  - raw/040_IBM Watson on Jeopardy! - Historic AI Victory That Demonstrated Open-Domain Question Answering.commentary.ko.md
evidence:
  - source_id: macdonald-1963
    locator: pp. 1–4
    relation: supports
  - source_id: brown-et-al-1988
    locator: pp. 71–76
    relation: supports
  - source_id: brown-et-al-1990
    locator: pp. 79–85
    relation: supports
  - source_id: brown-et-al-1993-smt-parameter-estimation
    locator: pp. 263–311
    relation: supports
  - source_id: ferrucci-et-al-2010-building-watson
    locator: 'AI Magazine 31(3), pp. 59–79의 IBM Research Watson·DeepQA 개발과 성능 보고'
    relation: supports
  - source_id: lewis-2012-watson-jeopardy-interface
    locator: Watson과 Jeopardy 경기 시스템 사이의 전자·물리 인터페이스 설명
    relation: supports
  - source_id: ibm-watson-jeopardy-history
    locator: 2011년 특별 경기·최종 점수·하드웨어·인터넷 조건에 대한 IBM 역사 기록
    relation: contextualizes
relations:
  - target: entity.georgetown-university
    kind: related
  - target: concept.통계적-기계-번역
    kind: related
  - target: concept.규칙-기반-기계-번역
    kind: related
  - target: concept.ibm-watson
    kind: related
learning:
  difficulty:
    entry: intermediate
    target: intermediate
  prerequisites:
    - target: concept.기계-번역
  assumed_knowledge: 없음
  outcomes:
    - 'IBM의 세 시기 언어·질의응답 프로젝트를 구분하고, 같은 기업의 연구를 하나의 연속 시스템으로 오해하면 안 되는 이유를 설명할 수 있다.'
  next:
    - target: source.022
      reason: 022IBM 통계적 기계 번역과 데이터 기반 전환 — Hansard 병렬 자료와 확률 모델을 사용한 별도 연구 흐름을 자세히 본다.
    - target: source.040
      reason: 040IBM Watson과 Jeopardy 질의응답 — DeepQA의 후보 생성·근거 점수화와 경기 조건을 살핀다.
---
# IBM

> [!note] 학습 안내
> **난이도:** 중급<br>
> **선수 지식:** [[concept.기계-번역|기계 번역]]<br>
> **읽고 나면:** IBM의 세 시기 언어·질의응답 프로젝트를 구분하고, 같은 기업의 연구를 하나의 연속 시스템으로 오해하면 안 되는 이유를 설명할 수 있다.

## 1단계 — 먼저 잡을 핵심

### 이 위키에서의 정체성

[[IBM]]은 1954년 [[Georgetown University]]와 함께 Georgetown-IBM 기계 번역 시연을 수행한 컴퓨팅 기업이다. 이 시연에는 IBM 701 컴퓨터가 사용되었고, 러시아어 문장 60개를 영어로 자동 번역하는 공개 행사가 뉴욕 IBM Technical Computing Bureau에서 열렸다.

## 2단계 — 작동 원리

### 역할

IBM은 초기 전자식 컴퓨터의 계산 능력을 언어 처리 과업에 적용할 수 있음을 보여주는 기술적 기반을 제공했다. 이 사건은 컴퓨터가 수치 계산뿐 아니라 [[기계 번역]] 같은 지적 과업에도 쓰일 수 있다는 대중적 인식을 강화했다.

## 3단계 — 기술과 근거

### 후대의 별도 연구

수십 년 뒤 Thomas J. Watson Research Center의 별도 연구진은 Canadian Hansard의 영어–프랑스어 병렬 자료로 [[통계적 기계 번역]]을 전개했다. 1988년 연구 구상, 1990년 예비 시스템과 실험, 1993년 IBM Models 1–5의 매개변수 추정은 1954년 규칙·사전 기반 시연과 같은 시스템의 연속 버전이 아니라, 같은 기업 안에서 이루어진 서로 다른 시기의 접근이다.

또 다른 시기의 IBM Research 연구진은 여러 문서·구조 지식 자원에서 후보 답을 만들고 근거를 점수화하는 [[DeepQA]]를 개발했다. 이를 구현한 [[IBM Watson]]은 2011년 *Jeopardy!* 특별 경기에서 우승했다. 전자 텍스트 clue, 로컬 corpus, 90대 서버와 2,880개 프로세서 코어를 사용한 이 시스템은 1954년 기계 번역 시연이나 1980–1990년대 통계 번역 연구의 후속 버전이 아니라 별도 과업·구조·연구진을 가진 프로젝트다.

## 검증과 한계

### 연속성 해석의 한계

세 사례는 IBM이라는 기관명을 공유하지만 과제, 자료, 시스템 구조와 연구진이 다르다. 기업 단위의 연속성을 곧바로 단일 기술 계보나 같은 시스템의 개선 과정으로 해석하지 않는다.

## 학습 확인

### 확인 질문

1. 1954년 Georgetown-IBM 시연에서 IBM은 어떤 기술적 기반을 제공했는가?
2. 1954년 규칙 기반 시연과 1988–1993년 통계 번역 연구는 자료와 접근이 어떻게 다른가?
3. IBM Watson을 앞선 두 기계 번역 프로젝트의 후속 버전으로 보면 안 되는 이유는 무엇인가?

### 다음 문서

- [[source.022|IBM 통계적 기계 번역과 데이터 기반 전환]] — 022IBM 통계적 기계 번역과 데이터 기반 전환 — Hansard 병렬 자료와 확률 모델을 사용한 별도 연구 흐름을 자세히 본다.
- [[source.040|IBM Watson과 Jeopardy 질의응답]] — 040IBM Watson과 Jeopardy 질의응답 — DeepQA의 후보 생성·근거 점수화와 경기 조건을 살핀다.

## 출처

- [[003_Georgetown-IBM 기계 번역 시연]]
- [[022_IBM 통계적 기계 번역과 데이터 기반 전환]]
- Peter F. Brown 외, [A Statistical Approach to Language Translation](https://aclanthology.org/C88-1016/), 1988, pp. 71–76.
- Peter F. Brown 외, [A Statistical Approach to Machine Translation](https://aclanthology.org/J90-2002/), 1990, pp. 79–85.
- Peter F. Brown 외, [The Mathematics of Statistical Machine Translation: Parameter Estimation](https://aclanthology.org/J93-2003/), 1993, pp. 263–311.
- David Ferrucci 외, [Building Watson: An Overview of the DeepQA Project](https://aaai.org/ai-magazine/the-ai-behind-watson-the-technical-article/), 2010, pp. 59–79.
- B. L. Lewis, [In the Game: The Interface between Watson and Jeopardy!](https://research.ibm.com/publications/in-the-game-the-interface-between-watson-and-jeopardy), 2012.
- IBM, [Watson on Jeopardy!](https://www.ibm.com/history/watson-jeopardy), 2011년 경기·하드웨어 기록.
- [[040_IBM Watson과 Jeopardy 질의응답]]

## 관련 항목

- [[source.022|IBM 통계적 기계 번역과 데이터 기반 전환]]
- [[source.040|IBM Watson과 Jeopardy 질의응답]]
- [[concept.기계-번역|기계 번역]]
- [[entity.georgetown-university|Georgetown University]]
- [[concept.통계적-기계-번역|통계적 기계 번역]]
- [[concept.규칙-기반-기계-번역|규칙 기반 기계 번역]]
- [[concept.ibm-watson|IBM Watson]]
