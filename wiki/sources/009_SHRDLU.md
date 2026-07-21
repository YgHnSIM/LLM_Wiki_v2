---
schema_version: 2
id: source.009
page_type: source
title: SHRDLU
aliases:
  - 009_SHRDLU
  - 행동을 통한 언어 이해
tags:
  - type/source
  - domain/ai
  - domain/nlp
  - domain/conversational-ai
  - domain/human-computer-interaction
created: '2026-07-16'
updated: '2026-07-21'
lifecycle: active
verification: verified
artifacts:
  - raw/009_SHRDLU - Understanding Language Through Action.ko.md
  - raw/009_SHRDLU - Understanding Language Through Action.commentary.ko.md
evidence:
  - source_id: winograd-1971
    locator: chapters 1–3, especially pp. 1–39
    relation: supports
  - source_id: winograd-1972
    locator: pp. 1–191
    relation: supports
  - source_id: winograd-1980
    locator: pp. 212–218
    relation: contextualizes
  - source_id: minsky-papert-1971
    locator: §5.2, Micro-worlds and Understanding
    relation: contextualizes
related:
  - entity.테리-위노그래드
  - entity.mit
  - concept.shrdlu
  - concept.블록-세계
  - concept.마이크로월드
  - concept.파싱
  - concept.지식-공학-병목
  - concept.eliza
  - analysis.eliza에서-llm으로
  - analysis.ai-시연과-실제-성능
---
# SHRDLU

> [!note] 학습 안내
> **난이도:** 입문<br>
> **선수 지식:** 없음<br>
> **읽고 나면:** SHRDLU가 언어·세계 상태·추론·행동을 어떻게 연결했는지와 블록 세계 시연을 일반 언어 이해로 확대할 수 없는 이유를 설명할 수 있다.

## 1단계 — 먼저 잡을 핵심

### 핵심 요약

SHRDLU는 사용자가 영어로 명령하거나 질문하면 시뮬레이션된 로봇 팔이 [[블록 세계]]의 물체를 옮기고, 현재 상태와 과거 행동을 바탕으로 답하도록 설계됐다. 문법 분석, 의미 해석, 담화 문맥, 세계 지식, 추론, 행동 계획을 하나의 제한된 영역에서 결합한 점이 핵심이다. 위노그래드의 1972년 논문은 언어 이해를 통사·의미·추론의 통합 문제로 규정하고, 시스템이 이해할 대상을 상세히 모델링해야 한다고 설명한다.

### 대표 대화로 보는 범위

대표 대화에서 시스템은 모호한 `the pyramid`를 임의로 선택하지 않고 명료화를 요구한다. 또한 현재 들고 있는 물체보다 큰 블록을 찾고, 대명사 `it`의 지시 대상을 설명한 뒤 상자에 넣으며, 이후 상자의 내용과 물체의 지지 관계를 답한다. 이는 단순한 입력-응답 패턴보다 넓은 기능을 보여주지만, 모두 설계자가 구축한 폐쇄적 세계 모델 안에서 수행됐다.

### 핵심 문장

- SHRDLU는 자연어를 폐쇄된 세계의 상태·추론·행동과 연결한 통합 시스템이었다.
- 인상적인 대화는 폭넓은 일반 지능보다 잘 정의된 마이크로월드와 수작업 지식 표현의 힘을 보여준다.
- SHRDLU의 역사적 가치에는 성공한 기능뿐 아니라 좁은 영역의 성공을 일반화할 때 생기는 평가 문제가 함께 포함된다.

## 2단계 — 작동 원리

### 문제와 입력

입력은 블록 세계에 관한 영어 명령이나 질문이다. 시스템은 문장을 분석하는 데서 멈추지 않고 어떤 물체를 가리키는지, 현재 행동이 가능한지, 실행 뒤 세계가 어떻게 달라졌는지를 함께 계산해야 한다.

### 성과와 범위

SHRDLU의 성과는 일반 언어 이해를 완성한 데 있지 않다. 제한된 [[마이크로월드]] 안에서 다음 기능들이 공통 표현을 사용하도록 통합됐다는 데 있다.

- 통사·의미·문맥 정보를 함께 사용하는 문장 [[파싱]]
- 사물의 색·모양·크기·위치·지지 관계를 유지하는 세계 모델
- 대명사와 명사구가 가리키는 대상을 담화 문맥에서 결정하는 지시 대상 해석
- 행동의 전제 조건을 검사하고 중간 단계를 구성하는 계획
- 실행한 행동과 그 이유를 기억해 질문에 답하는 대화 관리

### 결과와 읽는 법

이 통합은 당시 서로 분리되어 있던 복잡한 통사 분석과 일반 추론을 같은 시스템에서 시험할 수 있게 했다. 1980년 위노그래드의 회고도 SHRDLU의 영향력과 포괄성을 강조하면서, 프로그램의 세계 연결이 설계자가 만든 표현을 통해 매개됐다는 한계를 함께 지적한다.

## 3단계 — 기술과 근거

### 개발과 출판 시점

[[테리 위노그래드]]는 1968~1970년 [[MIT]] 인공지능 연구소에서 자연어 대화 시스템 [[SHRDLU]]를 개발했다. 연구는 1971년 기술 보고서로 제출됐고, 1972년 학술지 논문과 책으로 출판됐다. 따라서 `1968`은 대표 출판 연도가 아니라 개발 시기의 시작을 가리킨다.

### 통합 시스템이 시험한 기술

통사·의미·문맥·세계 모델·계획을 하나의 프로그램에서 연결한 구성은 각 모듈의 출력을 다음 모듈이 실제 행동과 답변에 사용하게 했다. 이 기술적 성과는 자유로운 일상 세계가 아니라 상세히 정의된 블록 세계에서 확인됐다.

## 검증과 한계

### 검증 정정

#### 확인된 사실과 원문 상태

- SHRDLU는 물리 로봇이 아니라 시뮬레이션된 탁상 세계와 로봇 팔을 다뤘다.
- 이름은 라이노타이프 자판 배열의 관용구 `ETAOIN SHRDLU`에서 왔다. raw의 `SHRDLU ETAOIN`은 통상 순서가 뒤집혀 있다.
- raw에서 대화가 들어갈 자리는 `구성 요소 불러오는 중...`으로 비어 있다. 공개 문서의 대화 설명은 Winograd 보고서의 실제 기록을 기준으로 작성했다.

#### 후대 평가 틀

- `프레임 문제`, `기호 접지`, `체화된 인지`는 SHRDLU의 한계를 설명하는 후대의 분석 틀이다. 이 용어들을 프로그램이 당시 직접 해결하거나 정식화한 개념처럼 쓰지 않는다.

#### 합성 해석과 계보의 경계

- 제한된 영역에서 명령·질문·추론을 연결한 기능적 성공은 확인되지만, 철학적 의미의 “진정한 이해”를 달성했다는 결론은 문헌만으로 확정할 수 없다.
- 규칙 기반 SHRDLU에서 현대 통계 학습으로 곧바로 전환됐다는 단선적 계보도 피해야 한다. 두 접근은 오랫동안 공존했고 현대 시스템에서도 학습 모델과 구조화된 상태·도구가 결합된다.

### 적용 범위와 남은 한계

인상적인 대표 대화는 여러 기능의 통합을 보여 주지만, 설계자가 미리 정의하지 않은 물체·행동·상식으로 확장되는 성능을 측정하지 않는다. 따라서 시연의 복잡성과 적용 영역의 넓이를 별개의 평가 축으로 읽어야 한다.

## 학습 확인

### 확인 질문

1. SHRDLU는 영어 문장을 어떤 세계 상태와 행동에 연결했는가?
2. 모호한 명사구를 포함한 명령이 들어오면 어떤 처리 요소들이 함께 작동하는가?
3. 블록 세계의 성공을 일반 언어 이해의 달성으로 볼 수 없는 이유는 무엇인가?

### 다음 문서

- [[지식 공학 병목]] — 수작업 세계 모델과 규칙이 넓은 영역으로 확장될 때 생기는 한계를 정리한다.
- [[AI 시연과 실제 성능]] — 인상적인 데모와 실제 적용 범위를 구분하는 평가 관점을 확장한다.

## 출처

- Terry Winograd, [Procedures as a Representation for Data in a Computer Program for Understanding Natural Language](https://hdl.handle.net/1721.1/7095), MIT AI Technical Report 235, 1971, 특히 pp. 1–39.
- Terry Winograd, [Understanding Natural Language](https://doi.org/10.1016/0010-0285(72)90002-3), *Cognitive Psychology* 3(1), 1972, pp. 1–191.
- Terry Winograd, [What Does It Mean to Understand Language?](https://doi.org/10.1207/s15516709cog0403_1), *Cognitive Science* 4(3), 1980, pp. 212–218.
- Marvin Minsky·Seymour Papert, [Progress Report on Artificial Intelligence](https://www.mit.edu/~dxh/marvin/web.media.mit.edu/~minsky/papers/PR1971.html), 1971, §5.2.
- 프로젝트 번역·검토 출발 자료: [SHRDLU - Understanding Language Through Action](https://mbrenndoerfer.com/writing/history-shrdlu-language-understanding-blocks-world)
- 프로젝트 보존 자료: `raw/009_SHRDLU - Understanding Language Through Action.ko.md`, `raw/009_SHRDLU - Understanding Language Through Action.commentary.ko.md`.

## 관련 항목

- [[테리 위노그래드]]
- [[MIT]]
- [[SHRDLU|SHRDLU 개념]]
- [[블록 세계]]
- [[마이크로월드]]
- [[파싱]]
- [[지식 공학 병목]]
- [[ELIZA]]
- [[ELIZA에서 LLM으로]]
- [[AI 시연과 실제 성능]]
