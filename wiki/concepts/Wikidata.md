---
schema_version: 2
id: concept.wikidata
page_type: concept
title: Wikidata
aliases:
  - 위키데이터
  - Wikimedia Wikidata
  - Wikidata knowledge base
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
  - 'raw/042_Wikidata Collaborative Knowledge Base for Language AI.ko.md'
  - 'raw/042_Wikidata Collaborative Knowledge Base for Language AI.commentary.ko.md'
evidence:
  - source_id: vrandecic-krotzsch-2014-wikidata
    locator: 'pp. 78–85의 2012년 시작·Wikimedia 통합·다언어 item·공동체 편집·개방 라이선스'
    relation: supports
  - source_id: wikidata-help-data-model
    locator: 'item·property·statement·label·sitelink·qualifier·reference·rank 데이터 모델'
    relation: supports
  - source_id: wikidata-help-about-data
    locator: 'RDF export·CC0 재사용·data access 설명'
    relation: supports
  - source_id: wikidata-help-references-ranking
    locator: 'reference와 preferred·normal·deprecated rank의 역할 구분'
    relation: supports
  - source_id: wikidata-query-service-limits
    locator: '공개 SPARQL endpoint의 실행 시간·결과 규모·timeout 제한'
    relation: contextualizes
related:
  - source.042
  - concept.wikibase-데이터-모델
  - concept.sparql
  - concept.지식-그래프
  - concept.freebase
---
# Wikidata

> [!note] 학습 안내
> **난이도:** 입문<br>
> **선수 지식:** 없음<br>
> **읽고 나면:** Wikidata가 언어 중립 식별자와 출처 있는 statement를 공동 편집·재사용하는 방식을 설명하고, 품질·최신성·AI 활용의 경계를 구분할 수 있다.

## 1단계 — 먼저 잡을 핵심

Wikidata는 Wikimedia 프로젝트와 외부 응용이 함께 재사용할 수 있도록 item·property·statement를 공동 편집하는 다언어 개방 지식 베이스다. 2012년 시작됐으며 언어 중립 Q/P 식별자, 언어별 label·description·alias, Wikimedia sitelink와 [[Wikibase 데이터 모델]]을 결합한다.

## 2단계 — 작동 원리

### 식별과 다언어 표시

Item의 Q ID는 이름 문자열과 분리된다. 같은 이름의 여러 대상을 다른 ID로 구분하고, 같은 item에 여러 언어 label과 alias를 붙일 수 있다. Sitelink는 해당 item과 Wikipedia·Wikivoyage 등 Wikimedia 문서를 연결한다.

이 구조는 언어 간 개체 연결을 돕지만 모든 언어의 정보가 자동으로 같아지는 것은 아니다. Label·description·reference·statement coverage는 언어와 주제별 기여에 따라 다르다.

### statement와 provenance

Item의 사실 주장은 property–value main snak에 qualifier·reference·rank를 붙일 수 있는 statement로 저장된다. 인구의 시점, 직위의 시작·종료, 값의 출처와 현재 기본값을 함께 나타낼 수 있다.

Reference는 출처를 기록할 뿐 값의 진리를 보증하지 않는다. Rank도 신뢰 점수가 아니며 여러 statement의 표시·질의 기본 선택을 조절한다. 구조화됐다는 이유만으로 정확성·최신성·완전성이 자동 보장되지 않는다.

## 3단계 — 기술과 근거

### Wikimedia와 외부 재사용

Wikipedia template·infobox는 공동체 정책에 따라 Wikidata 값을 선택적으로 사용할 수 있다. 하나의 중앙 값을 재사용하면 중복 갱신을 줄일 수 있지만 모든 문서 본문이 자동으로 바뀌는 것은 아니다.

데이터는 CC0로 제공되고 dump·API·recent changes·[[SPARQL]] endpoint로 접근할 수 있다. 개방 라이선스는 live service의 무제한 사용을 뜻하지 않으며 대규모 질의에는 timeout·공유 자원 한계가 있다.

### AI에서의 사용 범위

Wikidata는 개체 연결, 구조 질의응답, 관계 추출 검증, 다언어 label 연결, 지식 그래프 완성·평가와 언어 모델의 도구 호출에 사용할 수 있다. 그러나 특정 제품이 실제로 사용했는지와 성능 효과는 구현별 근거가 필요하다.

LLM이 Wikidata를 조회해도 잘못된 item·property 선택, qualifier 누락, 낡은 statement와 검색 결과를 넘어선 생성이 발생할 수 있다. 외부 지식은 오류를 자동 제거하는 진리 장치가 아니라 출처와 시점을 확인할 수 있는 추가 구성요소다.

## 검증과 한계

### 품질과 변화

공동 편집, bot import, 변경 이력, 되돌리기, 토론, property constraint와 WikiProject가 품질을 관리한다. 동시에 다음 문제가 남는다.

- reference가 없거나 낡은 statement
- 중복 item·잘못된 merge와 redirect
- 영역·언어·지역별 coverage 격차
- 논쟁적 분류와 서로 충돌하는 출처
- property 관례·스키마 변화에 따른 응용 유지 비용

## 학습 확인

1. Wikidata는 Q ID와 언어별 label을 어떻게 나눠 다언어 대상을 식별하는가?
2. Statement의 qualifier·reference·rank는 핵심 value에 어떤 문맥을 더하는가?
3. 공동 편집과 reference가 정확성·완전성·최신성을 자동 보장하지 않는 이유는 무엇인가?

다음에는 [[SPARQL]]에서 Wikidata 관계를 조회하는 방식을 보고, [[구조화된 의미 자원은 무엇을 노드로 삼는가]]에서 Wikidata와 다른 자원의 노드 선택을 비교한다.

## 출처

- Denny Vrandečić·Markus Krötzsch, [Wikidata: A Free Collaborative Knowledgebase](https://dl.acm.org/doi/pdf/10.1145/2629489), 2014, pp. 78–85.
- Wikidata community, [Help:Data model](https://www.wikidata.org/wiki/Help:Data_model).
- Wikidata community, [Help:About data](https://www.wikidata.org/wiki/Help:About_data).
- Wikidata community, [Help:Ranking](https://www.wikidata.org/wiki/Help:Ranking).
- Wikidata community, [Wikidata SPARQL Query Service — Query limits](https://www.wikidata.org/wiki/Wikidata:SPARQL_query_service/query_limits).
- [[042_Wikidata와 다언어 협업 지식 베이스]]
- 프로젝트 보존 자료: `raw/042_Wikidata Collaborative Knowledge Base for Language AI.ko.md`, `raw/042_Wikidata Collaborative Knowledge Base for Language AI.commentary.ko.md`.

## 관련 항목

- [[042_Wikidata와 다언어 협업 지식 베이스]]
- [[Wikibase 데이터 모델]]
- [[SPARQL]]
- [[지식 그래프]]
- [[Freebase]]
