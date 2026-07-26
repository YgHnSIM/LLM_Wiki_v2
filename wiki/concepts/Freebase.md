---
schema_version: 2
id: concept.freebase
page_type: concept
title: Freebase
aliases:
  - 프리베이스
  - Metaweb Freebase
  - Freebase knowledge base
tags:
  - type/concept
  - domain/ai
  - domain/computer-science
  - domain/nlp
created: '2026-07-18'
updated: '2026-07-21'
lifecycle: active
verification: verified
artifacts:
  - 'raw/039_Freebase Collaborative Knowledge Graph for Structured Information.ko.md'
  - 'raw/039_Freebase Collaborative Knowledge Graph for Structured Information.commentary.ko.md'
evidence:
  - source_id: bollacker-et-al-2008-freebase
    locator: 'pp. 1247–1250의 튜플 데이터베이스·협업 구조·MQL과 1억 2,500만 개 이상 튜플 규모'
    relation: supports
  - source_id: google-freebase-basic-concepts
    locator: 'Types and properties, Domains and namespaces, Compound Value Types, MIDs 절'
    relation: supports
  - source_id: google-freebase-data-dumps
    locator: 'Freebase history와 Data dumps 절의 2007–2015 운영·API 종료·최종 덤프 상태'
    relation: supports
  - source_id: pellissier-tanon-et-al-2016-freebase-wikidata
    locator: 'pp. 1419–1428의 종료 시점 규모·CVT·스키마·개체·속성 이전'
    relation: supports
related:
  - source.039
  - concept.지식-그래프
  - concept.wikidata
---
# Freebase

> [!note] 학습 안내
> **난이도:** 중급<br>
> **선수 지식:** [[지식 그래프]]<br>
> **읽고 나면:** Freebase의 topic·type·property·MID·CVT와 MQL·협업 운영을 설명하고 후속 체계와 구분할 수 있다.

## 1단계 — 먼저 잡을 핵심

Freebase는 현실 세계의 대상을 고유한 토픽으로 식별하고, 타입과 속성으로 관계를 정리한 협업형 지식 베이스다. 외부 자료와 사용자 편집을 함께 받아 구조화된 정보를 질의할 수 있도록 했다.

## 2단계 — 작동 원리

### 데이터 모델

Freebase의 기본 단위는 다음과 같다.

- **topic**: 한 대상에 관한 값을 모으는 식별된 개체
- **type**: 해당 종류의 토픽에 적용되는 속성 묶음
- **property**: 토픽을 리터럴 값이나 다른 토픽과 연결하는 관계 정의
- **domain**: 관련 타입을 묶는 관리 범주
- **MID**: 이름 문자열과 분리된 응용 프로그램용 식별자
- **CVT**: 여러 값이 붙은 복합 관계를 표현하는 중간 노드

한 토픽은 여러 타입을 가질 수 있고 속성은 기본적으로 여러 값을 허용했다. 타입·속성도 그래프 안에서 편집할 수 있어 스키마가 서비스와 함께 진화했다.

### 비계층적 타입과 편집 가능한 스키마

공식 문서는 Freebase 타입이 계층으로 배열되지 않는다고 명시한다. `/film/director`처럼 경로 모양인 ID는 네임스페이스 조직을 나타내며 부모 타입의 속성 상속을 뜻하지 않는다. 토픽이 여러 타입을 동시에 갖는 방식으로 속성 묶음을 결합했다.

따라서 Freebase를 `schema-free`라고 부를 때는 **고정 테이블과 분리된 편집 가능한 스키마**라는 뜻으로 제한해야 한다. 타입과 속성 정의가 없었던 것이 아니다. 유연성은 새 영역을 추가하기 쉽게 했지만 중복·충돌·일관성 관리 비용도 만들었다.

### 동일성과 복합 관계

MID는 같은 이름을 가진 여러 대상을 구분하고 외부 자료를 하나의 개체에 연결하는 기준이 됐다. 표시 이름·키·MID·내부 GUID는 같은 역할이 아니며, 토픽 병합과 분할에서는 이력 추적이 필요했다.

사람이 작품에 특정 배역으로 일정 기간 참여했다는 사실처럼 둘 이상의 값이 한 관계에 붙으면 CVT를 사용했다. CVT는 독립적인 현실 세계 개체라기보다 n항 관계를 Freebase 그래프에 담는 구조적 노드다.

### MQL과 협업 운영

MQL은 JSON 유사 패턴으로 토픽·속성 경로와 제약을 기술하는 질의 언어였다. 관계를 여러 단계 따라가고 결과를 필터링·집계할 수 있었지만, 경로 질의 자체를 형식 논리 추론과 동일시하면 안 된다.

Freebase는 순수한 공동체 입력만으로 만들어지지 않았다. 여러 자료를 적재하고 사용자가 토픽·값·스키마를 정리·확장하는 혼합 모델이었다. 이 방식은 범위를 빠르게 넓혔지만 영역별 품질 격차와 출처·중복·스키마 조정 문제를 남겼다.

## 3단계 — 기술과 근거

### 공개 시점과 2008년 보고 규모

Freebase는 Metaweb이 2007년 공개한 협업형 구조 지식 베이스다. 현실 세계의 대상을 토픽으로 식별하고 타입·속성으로 연결했으며, 여러 외부 데이터의 적재와 사용자 편집, 변경 관리, MQL 질의 API를 결합했다. 2008년 보고 시점에는 1억 2,500만 개가 넘는 튜플, 4,000개가 넘는 타입, 7,000개가 넘는 속성을 보유했다.

### 수명주기와 유산

Google은 2010년 Metaweb을 인수했고, 2012년 공개한 Knowledge Graph가 Freebase를 포함한 여러 공개 원천에 뿌리를 두었다고 밝혔다. Freebase 공개 서비스는 2015년에 종료됐고 최종 덤프가 남았다. 종료 전후에는 Freebase 스키마와 개체를 Wikidata에 대응시키는 이전 작업이 진행됐다.

Google Knowledge Graph, Freebase, Wikidata는 동일한 시스템의 연속 이름이 아니다. Google Knowledge Graph는 여러 원천으로 보강된 별도 비공개 체계였고, Wikidata 이전은 서로 다른 공개 모델 사이의 매핑·검토 과정이었다.

## 검증과 한계

### 표현 범위

Freebase는 특정 인물·장소·작품·사건과 그 사실 관계를 폭넓게 기술한다. WordNet의 synset, FrameNet의 의미 frame, PropBank의 문장별 predicate roleset과는 중심 단위가 다르다. 연결하거나 함께 사용할 수 있지만 모두 같은 “의미망”의 직접 계보로 묶지 않는다.

Freebase 데이터가 구조화됐다는 사실은 값의 참됨·최신성·완전성을 보장하지 않는다. 공개 덤프는 서비스 종료 당시의 역사적 자료이며 현재 지식의 기준으로 그대로 사용하면 안 된다.

## 학습 확인

### 확인 질문

1. Freebase의 topic, type, property, domain, MID와 CVT는 각각 어떤 문제를 맡는가?
2. 외부 데이터 적재와 공동체 편집으로 만든 그래프를 MQL이 질의하는 흐름은 어떻게 작동하는가?
3. 비계층적 타입, 편집 가능한 스키마와 역사적 덤프가 정확성·최신성을 보장하지 않는 이유는 무엇인가?

### 다음 문서

- [[Wikidata]] — 공개 서비스 종료 뒤 서로 다른 데이터 모델로 지식을 옮긴 협업형 체계를 비교한다.

## 출처

- Kurt Bollacker 외, [Freebase: A Collaboratively Created Graph Database for Structuring Human Knowledge](https://research.google/pubs/freebase-a-collaboratively-created-graph-database-for-structuring-human-knowledge/), 2008, pp. 1247–1250.
- Google, [Freebase Documentation Archive — Basic Concepts](https://developers.google.com/freebase/guide/basic_concepts), Types and properties·Domains and namespaces·CVT·MIDs 절.
- Google, [Freebase Data Dumps](https://developers.google.com/freebase), Freebase history·Data dumps 절.
- Thomas Pellissier Tanon 외, [From Freebase to Wikidata — The Great Migration](https://thomas.pellissier-tanon.fr/papers/2016-WWW-freebase.pdf), 2016, pp. 1419–1428.
- [[039_Freebase와 협업형 지식 그래프]]
- 프로젝트 보존 자료: `raw/039_Freebase Collaborative Knowledge Graph for Structured Information.ko.md`, `raw/039_Freebase Collaborative Knowledge Graph for Structured Information.commentary.ko.md`.

## 관련 항목

- [[039_Freebase와 협업형 지식 그래프]]
- [[지식 그래프]]
- [[Wikidata]]
