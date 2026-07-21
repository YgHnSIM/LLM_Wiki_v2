---
schema_version: 2
id: concept.wikibase-데이터-모델
page_type: concept
title: Wikibase 데이터 모델
aliases:
  - Wikibase data model
  - Wikidata statement model
  - 위키베이스 데이터 모델
tags:
  - type/concept
  - domain/computer-science
  - domain/ai
created: '2026-07-18'
updated: '2026-07-21'
lifecycle: active
verification: verified
artifacts:
  - 'raw/042_Wikidata Collaborative Knowledge Base for Language AI.ko.md'
  - 'raw/042_Wikidata Collaborative Knowledge Base for Language AI.commentary.ko.md'
evidence:
  - source_id: wikidata-help-data-model
    locator: 'item·property·statement group·snak·qualifier·reference·rank·unknown/no value·적용 범위 전체'
    relation: supports
  - source_id: wikidata-help-about-data
    locator: '단순 triple 근사와 qualifier·reference가 있는 Wikibase statement의 RDF 표현 차이'
    relation: supports
  - source_id: wikidata-help-references-ranking
    locator: 'rank와 reference가 수행하는 서로 다른 선택·provenance 역할'
    relation: supports
related:
  - source.042
  - concept.wikidata
  - concept.sparql
---
# Wikibase 데이터 모델

> [!note] 학습 안내
> **난이도:** 중급<br>
> **선수 지식:** [[지식 그래프]]<br>
> **읽고 나면:** Wikibase statement의 main snak·qualifier·reference·rank를 구분하고, unknown·no value와 RDF 표현의 정보 경계를 설명할 수 있다.

## 1단계 — 먼저 잡을 핵심

Wikibase 데이터 모델은 [[Wikidata]] item과 property, statement를 표현하는 구조다. 자연어 설명에서 흔히 주어–속성–목적어 triple로 단순화하지만 실제 statement는 qualifier·reference·rank와 값의 상태를 함께 가질 수 있다.

## 2단계 — 작동 원리

### 핵심 단위

- **item**: Q ID를 가진 대상과 label·description·alias·sitelink·statement 묶음
- **property**: P ID와 datatype·관례를 가진 관계·특성
- **snak**: property와 value, unknown value 또는 no value의 결합
- **statement**: main snak에 qualifier·reference·rank가 붙은 주장 단위
- **statement group**: 한 item에서 같은 property를 사용하는 statement 묶음

## 3단계 — 기술과 근거

### qualifier

Qualifier는 main value가 성립하는 시점·장소·방법·역할·순서 같은 문맥을 붙인다. `population`에 `point in time`, `position held`에 `start time`·`end time`을 붙이는 식이다.

Qualifier는 무시해도 되는 부가 설명일 수도 있지만 statement의 적용 범위를 제한하는 핵심 조건일 수도 있다. 데이터 소비자는 property별 의미를 확인해야 한다.

### reference와 rank

Reference는 값을 어느 자료에서 가져왔는지 기록하는 provenance다. 출처가 있다고 값이 참이라는 보장은 아니며 출처 자체의 질과 statement 해석을 검토해야 한다.

Rank는 `preferred`, `normal`, `deprecated` 세 단계다. Preferred는 현재값이나 기본 선택값, deprecated는 폐기된 값을 표시할 수 있다. Rank는 확률·신뢰 점수나 논리적 참/거짓이 아니다.

### unknown·no value

값을 모른다는 사실과 해당 값이 존재하지 않는다는 사실은 다르다. Wikibase는 `unknown value`와 `no value`를 구분할 수 있다. 빈칸·누락과도 다르므로 질의와 export에서 별도 처리해야 한다.

## 검증과 한계

### RDF 표현의 경계

Main value만 보면 item–property–value triple로 근사할 수 있다. 그러나 qualifier·reference·rank를 RDF에 보존하려면 statement node와 여러 namespace·predicate가 필요하다. `wdt:` direct property는 편리한 축약 view이지만 전체 provenance와 조건을 담지 않는다.

따라서 Wikidata를 일반 triple table처럼 읽으면 시간·출처·다중 값과 deprecated 상태를 잃는다. 구조 지식을 LLM 문맥이나 다른 데이터베이스로 옮길 때에도 이 층을 보존할지 명시해야 한다.

## 학습 확인

1. Wikibase의 item·property·statement는 각각 어떤 단위를 나타내는가?
2. main snak에 qualifier·reference·rank가 붙으면 값의 범위와 출처·선택 상태는 어떻게 달라지는가?
3. unknown value와 no value를 같은 결측값으로 보거나 RDF direct property만 읽으면 안 되는 이유는 무엇인가?

다음에는 [[SPARQL]]에서 이 자료 모델을 그래프 패턴으로 조회하는 법을 보고, [[구조화된 의미 자원은 무엇을 노드로 삼는가]]에서 다른 의미 자원과 구조를 비교한다.

## 출처

- Wikidata community, [Help:Data model](https://www.wikidata.org/wiki/Help:Data_model).
- Wikidata community, [Help:About data](https://www.wikidata.org/wiki/Help:About_data).
- Wikidata community, [Help:Ranking](https://www.wikidata.org/wiki/Help:Ranking).
- [[042_Wikidata와 다언어 협업 지식 베이스]]
- 프로젝트 보존 자료: `raw/042_Wikidata Collaborative Knowledge Base for Language AI.ko.md`, `raw/042_Wikidata Collaborative Knowledge Base for Language AI.commentary.ko.md`.

## 관련 항목

- [[042_Wikidata와 다언어 협업 지식 베이스]]
- [[Wikidata]]
- [[SPARQL]]
