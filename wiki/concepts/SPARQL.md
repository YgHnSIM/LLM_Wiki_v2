---
schema_version: 2
id: concept.sparql
page_type: concept
title: SPARQL
aliases:
  - SPARQL Protocol and RDF Query Language
  - 스파클
  - RDF query language
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
  - source_id: vrandecic-krotzsch-2014-wikidata
    locator: 'pp. 82–84의 Wikidata API·RDF·query와 외부 재사용 설명'
    relation: contextualizes
  - source_id: wikidata-query-service-limits
    locator: 'Wikidata Query Service의 복합 질의 실행 시간·결과 규모·timeout 사례'
    relation: supports
related:
  - source.042
  - concept.wikidata
  - concept.wikibase-데이터-모델
  - concept.지식-그래프
---
# SPARQL

> [!note] 학습 안내
> **난이도:** 중급<br>
> **선수 지식:** [[지식 그래프]]<br>
> **읽고 나면:** SPARQL의 그래프 패턴이 여러 관계를 맞춰 결과를 만드는 방식을 설명하고, 저장된 관계 조회와 논리 추론의 경계를 구분할 수 있다.

## 1단계 — 먼저 잡을 핵심

SPARQL은 RDF 그래프에서 triple pattern을 맞추고 join·filter·집계·property path로 결과를 만드는 질의 언어다. Wikidata Query Service는 Wikidata의 RDF 표현을 [[SPARQL]] endpoint로 제공한다.

## 2단계 — 작동 원리

### 그래프 패턴

SQL이 표의 행을 결합하듯 SPARQL은 주어·predicate·목적어 위치의 변수와 상수를 맞춘다. 같은 변수를 여러 패턴에서 공유하면 관계를 여러 단계 연결할 수 있다.

```sparql
SELECT ?country ?capital WHERE {
  ?country wdt:P31 wd:Q3624078 .
  ?country wdt:P36 ?capital .
}
```

이 예는 특정 class에 속한 국가와 P36 `capital` 값을 찾는다. 결과의 타당성은 class·property 모델링, rank·qualifier·coverage에 의존한다.

## 3단계 — 기술과 근거

### 질의와 추론

저장된 두 관계를 join하거나 property path를 따라가는 일은 그래프 질의다. Class 공리·규칙으로 저장되지 않은 새 사실을 도출하는 형식 추론과는 다르다. 경로가 존재한다고 인과·설명·상속이 자동 성립하지도 않는다.

Wikidata의 `wdt:` 경로는 사용하기 쉬운 direct statement view다. Qualifier·reference·rank 전체를 분석하려면 `p:`, `ps:`, `pq:`, `prov:` 등 statement 구조를 명시적으로 따라가야 한다.

### 언어 AI와의 연결

언어 모델은 자연어 질문을 SPARQL로 변환하거나 도구로 endpoint를 호출할 수 있다. 하지만 item·property 선택, 관계 방향, qualifier와 시점, 결과 직렬화에서 오류가 생길 수 있다. 생성된 질의의 실행 성공과 질문 의미의 충실성은 별도로 평가해야 한다.

## 검증과 한계

### 운영 한계

Live Query Service는 공유 자원이다. Join 수, 중간 결과 규모, label service, 정렬·집계와 property path에 따라 느려지거나 timeout이 발생할 수 있다. 복잡한 분석은 질의 단순화, 부분 결과 분할, dump와 자체 triple store·색인을 고려해야 한다.

“질의가 가능하다”는 사실을 모든 복합 질문이 milliseconds에 답하거나, endpoint가 usage limit 없이 제공된다는 뜻으로 확대하지 않는다.

## 학습 확인

1. SPARQL은 triple 그래프에서 어떤 패턴을 결과 변수와 맞추는가?
2. 여러 그래프 패턴의 join·filter·property path는 질의 결과를 어떻게 좁히거나 연결하는가?
3. SPARQL 질의가 저장되지 않은 사실의 완전한 논리 추론이나 무제한 서비스 사용을 보장하지 않는 이유는 무엇인가?

다음에는 [[구조화된 의미 자원은 무엇을 노드로 삼는가]]에서 그래프 자원별 노드 설계를 비교하고, [[검색은 근거를 찾고 독해는 답을 찾는다]]에서 조회 결과가 답으로 이어지는 조건을 본다.

## 출처

- Denny Vrandečić·Markus Krötzsch, [Wikidata: A Free Collaborative Knowledgebase](https://dl.acm.org/doi/pdf/10.1145/2629489), 2014, pp. 82–84.
- Wikidata community, [Wikidata SPARQL Query Service — Query limits](https://www.wikidata.org/wiki/Wikidata:SPARQL_query_service/query_limits).
- [[042_Wikidata와 다언어 협업 지식 베이스]]
- 프로젝트 보존 자료: `raw/042_Wikidata Collaborative Knowledge Base for Language AI.ko.md`, `raw/042_Wikidata Collaborative Knowledge Base for Language AI.commentary.ko.md`.

## 관련 항목

- [[042_Wikidata와 다언어 협업 지식 베이스]]
- [[Wikidata]]
- [[Wikibase 데이터 모델]]
- [[지식 그래프]]
