---
schema_version: 2
id: analysis.eliza에서-llm으로
page_type: analysis
title: ELIZA에서 LLM으로
aliases:
  - ELIZA to LLM
  - ELIZA와 대규모 언어 모델
  - 대화형 AI의 이해 문제
tags:
  - type/analysis
  - domain/ai
  - domain/nlp
  - domain/conversational-ai
created: '2026-07-14'
updated: '2026-07-21'
lifecycle: active
verification: partial
artifacts:
  - raw/002_The Turing Test.md
  - raw/002_The Turing Test.commentary.md
  - raw/007_ELIZA - The First Conversational AI Program.ko.md
  - raw/007_ELIZA - The First Conversational AI Program.commentary.ko.md
  - raw/009_SHRDLU - Understanding Language Through Action.ko.md
  - raw/009_SHRDLU - Understanding Language Through Action.commentary.ko.md
evidence:
  - source_id: turing-1950
    locator: 'pp. 433–460, §§1–7'
    relation: supports
  - source_id: weizenbaum-1966
    locator: pp. 36–45
    relation: supports
  - source_id: mit-eliza-1965
    locator: ELIZA source and DOCTOR script records
    relation: supplements
  - source_id: winograd-1971
    locator: chapters 1–3, especially pp. 1–39
    relation: supports
  - source_id: winograd-1980
    locator: pp. 212–218
    relation: contextualizes
related:
  - concept.eliza
  - concept.eliza-효과
  - concept.doctor-스크립트
  - concept.튜링-테스트
  - concept.행동-기반-지능-기준
  - concept.대규모-언어-모델
  - concept.shrdlu
  - concept.블록-세계
  - concept.마이크로월드
  - analysis.ai-시연과-실제-성능
---
# ELIZA에서 LLM으로

> [!note] 학습 안내
> **난이도:** 입문<br>
> **선수 지식:** [[ELIZA]], [[대규모 언어 모델]]<br>
> **읽고 나면:** 규칙 기반 대화 시스템과 현대 언어 모델을 작동 방식·평가 기준·사용자 기대의 세 축으로 구분할 수 있다.

## 1단계 — 먼저 잡을 핵심

### 비교 질문과 잠정 결론

[[ELIZA]]와 현대 [[대규모 언어 모델]]은 모두 인간에게 자연스럽게 느껴지는 언어 상호작용을 만들지만, 그 작동 방식과 범위는 크게 다르다. 두 계보를 비교하면 유창성, 이해, 사용자 기대, 신뢰성을 별도로 평가해야 하는 이유가 선명해진다.

## 2단계 — 작동 원리

### 작동 방식의 차이

ELIZA는 대화 규칙을 실행하는 프레임워크였고 [[DOCTOR 스크립트]]는 그 위에서 치료사 역할을 구현했다. 어떤 키워드를 중요하게 볼지, 어떤 [[패턴 매칭]]과 응답 템플릿을 사용할지, 실패 시 어떤 [[대화 복구|fallback]]을 쓸지 설계자가 직접 정했다. 현대 LLM은 대규모 데이터에서 토큰 간 패턴과 표현을 학습해 훨씬 넓은 문맥에서 새 문장을 생성한다.

[[SHRDLU]]는 이 둘 사이의 단순한 중간 단계가 아니라 다른 설계 축을 보여준다. [[블록 세계]]의 구조화된 상태에 언어를 연결하고, 통사·의미·추론·계획을 통합했다. 자연어의 범위는 좁았지만 출력의 자연스러움만이 아니라 명령 실행과 상태 질의로 해석을 시험할 수 있었다.

### 역할 설정의 연속성

작동 방식은 다르지만 대화 역할이 사용자 해석을 바꾼다는 점은 이어진다. [[DOCTOR 스크립트]]의 “심리치료사” 프레임은 모호한 응답을 공감과 절제로 보이게 했다. 현대 시스템에서도 역할과 지시가 응답의 어조와 사용자의 기대를 바꾼다. 따라서 모델 성능뿐 아니라 인터페이스가 어떤 능력을 암시하는지도 평가해야 한다.

## 3단계 — 기술과 근거

### ELIZA 효과의 확장

[[ELIZA 효과]]는 시스템의 실제 능력보다 더 많은 이해와 공감을 사용자가 귀속할 때 발생한다. 현대 대화형 AI의 높은 유창성은 이 효과를 약화시키기보다 더 강하게 만들 수 있다. 특히 정서적 조언, 의료·법률·재정처럼 잘못된 신뢰의 비용이 큰 상황에서는 시스템의 한계와 인간 감독을 분명히 해야 한다.

### 평가 원칙

- 대화 자연스러움과 사실 정확성을 분리한다.
- 역할 연기와 실제 전문 능력을 구분한다.
- fallback이 실패를 숨기는지, 한계를 적절히 알리는지 확인한다.
- 단기적 인상뿐 아니라 긴 대화의 일관성과 실제 과업 성능을 평가한다.
- 사용자가 시스템을 어떻게 의인화하고 신뢰하는지 측정한다.

## 검증과 한계

### 확인된 사실

ELIZA의 규칙·스크립트 구조와 SHRDLU의 폐쇄된 세계 연결은 각 시스템의 1차 자료로 확인된다. 현대 LLM과의 기술적 동일성을 주장하는 근거는 아니며, 여기서는 대화 출력과 평가에서 반복되는 문제를 비교한다.

### 유창성과 이해

ELIZA는 제한된 규칙만으로도 이해하는 듯 보일 수 있음을 보여주었다. LLM은 ELIZA보다 훨씬 복잡하므로 두 시스템을 기술적으로 동일시하면 안 된다. 그럼에도 자연스러운 출력만으로 이해·의식·신뢰 가능한 추론을 확정할 수 없다는 평가 문제는 남아 있다. ELIZA를 [[튜링 테스트]]의 최초 구현으로 보는 대신 후대의 비교 대상으로 다룬다.

SHRDLU 역시 폐쇄된 [[마이크로월드]] 안에서 기능적 이해를 보여줬지만, 그 성공을 열린 세계의 일반 이해로 확대할 수는 없었다. 세 시스템을 비교할 때는 규칙·학습 여부만 아니라 세계 상태와의 연결, 행동 검증, 영역 확장 비용을 함께 봐야 한다.

### 비교를 통한 해석

자연스러운 문장, 역할 프레임, 기능적 과업 성공은 서로 다른 평가 층위다. 이 구분을 현대 대화형 AI에 적용하는 것은 여러 자료를 함께 읽은 합성 해석이다.

### 아직 입증되지 않은 계보

ELIZA나 SHRDLU가 현대 LLM으로 직접 이어졌다는 단선적 계보는 이 문서의 근거가 입증하지 않는다. 비교가 보여주는 것은 공통 질문과 설계 차이다.

## 학습 확인

### 확인 질문

1. ELIZA와 현대 LLM의 응답 생성 방식은 어떻게 다른가?
2. 유창성, 세계 상태와의 연결, 행동 검증을 분리하면 세 시스템의 성공 범위가 어떻게 달라지는가?
3. ELIZA 효과가 현대 대화형 AI 평가에서 특히 중요한 이유는 무엇인가?

### 다음 문서

- [[AI 시연과 실제 성능]] — 대화의 인상을 넘어 서로 다른 AI 시연을 같은 평가 층위에서 비교한다.

## 출처

- [[002_튜링 테스트]]
- [[007_ELIZA]]
- [[009_SHRDLU]]

## 관련 항목

- [[ELIZA]]
- [[ELIZA 효과]]
- [[DOCTOR 스크립트]]
- [[튜링 테스트]]
- [[행동주의적 지능 기준]]
- [[대규모 언어 모델]]
- [[SHRDLU]]
- [[블록 세계]]
- [[마이크로월드]]
- [[AI 시연과 실제 성능]]
