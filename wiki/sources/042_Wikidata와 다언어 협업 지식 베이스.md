---
schema_version: 2
id: source.042
page_type: source
title: Wikidata와 다언어 협업 지식 베이스
aliases:
  - 042_Wikidata Collaborative Knowledge Base for Language AI
  - Wikidata collaborative knowledge base
  - 언어 AI를 위한 Wikidata
tags:
  - type/source
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
    locator: 'Communications of the ACM 57(10), pp. 78–85의 2012년 프로젝트 출범·다언어 item·statement·공동체·Wikipedia 통합·개방 데이터 설명'
    relation: supports
  - source_id: wikidata-help-data-model
    locator: 'item·property·statement·qualifier·reference·rank·unknown/no value·제한적 상속과 적용 범위 절'
    relation: supports
  - source_id: wikidata-help-about-data
    locator: 'item–property–value와 triple 근사, qualifier·reference를 포함한 statement 차이, RDF export·CC0 재사용 절'
    relation: supports
  - source_id: wikidata-help-references-ranking
    locator: 'normal·preferred·deprecated rank와 reference의 서로 다른 역할 및 다중 값 선택 설명'
    relation: supports
  - source_id: wikidata-query-service-limits
    locator: 'Wikidata Query Service의 응답 시간·결과 규모·timeout 예시와 live SPARQL 자원 제한'
    relation: disputes
related:
  - concept.wikidata
  - concept.wikibase-데이터-모델
  - concept.sparql
  - concept.지식-그래프
---
# Wikidata와 다언어 협업 지식 베이스

042 raw는 2012년 Wikidata가 “사실을 텍스트가 아니라 데이터로” 저장해 기계가 마침내 사실을 이해·추론하게 했고, Wikipedia·검색·가상 비서·번역·추천·RAG의 핵심 인프라가 됐다고 서술한다. 이 공개 문서는 **단순 triple과 실제 [[Wikibase 데이터 모델]]**, **공통 식별자와 모든 언어의 완전한 coverage**, **[[SPARQL]] 패턴 질의와 자동 논리 추론**, **개방 접근과 무제한 live service**, **활용 가능성과 제품별 실제 채택**을 분리한다.

Wikidata의 핵심 성과는 구조 사실을 완전한 진리로 바꾼 데 있지 않다. 언어 중립 Q/P 식별자, 다언어 label·description·alias·sitelink, qualifier·reference·rank가 있는 공동 편집 statement를 Wikimedia 규모에서 운영하고 CC0로 재사용할 수 있게 한 데 있다.

## 2012년 출범과 초기 목적

Denny Vrandečić와 Markus Krötzsch의 2014년 회고에 따르면 Wikidata 프로젝트는 2012년에 시작됐다. 초기 개발은 다음 단계를 목표로 했다.

1. Wikipedia 언어판 사이 interlanguage link를 item의 sitelink로 중앙 관리한다.
2. infobox 같은 문서 구성요소가 재사용할 수 있는 구조 데이터를 제공한다.
3. 구조 데이터에서 목록·문서를 생성할 기반을 마련한다.

이는 처음부터 모든 인간 지식과 AI 추론을 완성한 단일 공개가 아니라 Wikimedia 프로젝트의 중복 데이터 유지 문제에서 출발해 범용 지식 베이스로 확장한 과정이다.

Wikidata 이전에도 [[WordNet]], DBpedia, [[Freebase]]와 semantic web가 존재했다. WordNet은 어휘화된 의미와 lexical/semantic relation, DBpedia는 Wikipedia 구조 정보의 추출·매핑, Freebase는 topic·property·공동 편집과 MQL을 제공했다. Wikidata는 구조 지식의 최초 발명이 아니라 Wikimedia 공동체·다언어 sitelink·개방 statement 편집을 결합한 별도 설계다.

## item·property·label·sitelink

[[Wikidata]] item은 Q ID를 가진 식별 대상이다. item에는 다음 정보가 붙는다.

- 언어별 **label**: 대표 표시 이름
- 언어별 **description**: 같은 이름의 item을 구분하는 짧은 설명
- 언어별 **alias**: 검색 가능한 다른 이름
- **sitelink**: Wikipedia 등 Wikimedia 프로젝트의 해당 문서 연결
- **statement**: property–value 주장과 qualifier·reference·rank

Q90은 Paris, Q142는 France를 나타내지만 `Paris`라는 label 자체가 식별자는 아니다. 여러 대상이 같은 이름을 가질 수 있고 한 item은 여러 언어의 label을 가질 수 있다. 공통 ID는 언어 간 개체 연결을 돕지만 모든 item에 모든 언어 label이 있다는 보장은 없다.

Property는 P ID를 가지며 값의 datatype과 사용 관례를 정의한다. 값은 다른 item, 시간, 수량, 좌표, 문자열, 외부 식별자 등이 될 수 있다. Property도 공동체가 만들고 토론·제약을 통해 유지하므로 고정된 완전 온톨로지가 아니다.

## 원문의 P36 방향 오류

042 raw는 “Paris가 France의 수도”라는 사실을 다음 triple로 적는다.

```text
(Q90 Paris, P36 capital of, Q142 France)
```

그러나 Wikidata의 P36 label은 `capital`이고 국가·행정 단위 item에서 수도 item으로 향한다. 올바른 방향은 다음과 같다.

```text
France (Q142) → capital (P36) → Paris (Q90)
```

Paris에서 France로 가는 별도 사실은 `country` P17을 사용한다.

```text
Paris (Q90) → country (P17) → France (Q142)
```

자연어의 “Paris is the capital of France”를 기계 관계로 바꿀 때에는 property label의 문법 표면이 아니라 정의역·공역과 실제 방향을 확인해야 한다. 역방향 질의가 가능하다는 사실과 반대 방향 property를 저장한다는 것은 다르다.

## triple보다 풍부한 statement

Wikidata 자료는 RDF triple로 내보낼 수 있지만 원래 [[Wikibase 데이터 모델]]의 statement를 주어–속성–목적어 하나로만 줄이면 중요한 정보가 사라진다. Statement는 대체로 다음 층을 가진다.

| 층 | 역할 | 예 |
| --- | --- | --- |
| main snak | property와 핵심 value | population → 2,102,650 |
| qualifier | 값이 성립하는 범위·문맥 | point in time → 2023-01-01 |
| reference | 값을 가져온 출처 | stated in·reference URL·retrieved |
| rank | 같은 property의 여러 statement 선택 상태 | preferred·normal·deprecated |

인구 수치는 시점·경계·측정 방법 없이 숫자 하나만 저장하면 모호하다. 직위·배우자·국적·국경처럼 시간에 따라 달라지는 관계도 시작·종료·적용 범위가 필요하다. Qualifier는 부가 장식이 아니라 statement의 적용 범위를 바꿀 수 있다.

Reference는 “이 값이 어느 출처에 실려 있다”는 provenance다. Reference가 붙었다고 값이 자동으로 참이 되지 않으며, Wikidata 자체도 statement의 진리를 보증하지 않는다. 042 raw가 “값을 추가하려면 출처가 필요하다”고 쓰지만 모든 statement에 reference가 필수로 강제되는 것도 아니다.

Rank도 신뢰 점수가 아니다. Preferred는 현재값·공동체가 기본 표시하기로 한 값 등에, normal은 보통 값에, deprecated는 폐기됐지만 역사·오류 추적상 남길 값에 사용한다. 여러 값과 출처·qualifier를 함께 읽어야 한다.

## 다언어 설계와 Wikipedia 재사용

Q ID와 P ID는 언어 중립적이고 label·description·alias는 언어별이다. 이 구조는 영어 `cat`, 프랑스어 `chat`, 독일어 `Katze`를 Q146에 연결할 수 있게 한다. 다언어 응용은 공통 ID로 statement를 조회하고 사용자 언어 label을 선택할 수 있다.

그러나 언어 중립 식별자가 언어별 정보 격차를 자동 제거하지는 않는다. 어떤 item은 수십 언어 label을 갖지만 다른 item은 한두 언어에만 이름이 있다. Description·alias·reference coverage도 언어와 지역·주제에 따라 다르다.

Wikipedia 문서와 template도 Wikidata 값을 **선택적으로** 사용할 수 있다. 각 언어판 공동체가 어떤 property를 infobox에 표시하고 지역 값을 우선할지 결정한다. Wikidata 값 하나를 바꾸면 그것을 조회하는 문서에는 반영될 수 있지만 300개가 넘는 모든 언어판의 모든 중복 문장이 자동 갱신되는 것은 아니다. 서술 본문과 지역 template 정책은 별도로 남는다.

## SPARQL 질의와 추론의 경계

Wikidata Query Service는 RDF 표현 위에서 [[SPARQL]] 그래프 패턴을 실행한다. 여러 property를 join하고 filter·집계·property path를 사용해 “19세기에 태어나 Nobel Prize를 받은 여성 과학자” 같은 조건을 표현할 수 있다.

이 능력은 저장된 관계를 조합하는 **질의**다. 다음을 자동으로 보장하지 않는다.

- property 경로가 인과·설명을 뜻한다.
- class의 모든 statement가 instance에 자동 상속된다.
- qualifier·rank·부정·시간 범위를 무시해도 명제가 참이다.
- 누락된 사실을 논리적으로 완전하게 도출할 수 있다.

공식 데이터 모델 도움말도 일반적인 class statement 상속을 가정하지 말고, 제한적 상속 가능 property와 restrictive qualifier·negation·rank를 함께 고려하라고 설명한다. Raw의 “multi-hop reasoning이 trivial”이라는 표현은 패턴 질의 가능성과 논리 추론의 난도를 혼동한다.

`wdt:` direct property는 편리한 truthy view를 제공하지만 qualifier와 reference를 직접 담지 않는다. 시간이 있는 값이나 충돌하는 statement를 정확히 해석하려면 statement node·qualifier·reference 경로를 질의해야 한다.

## 개방 데이터와 서비스 한계

Wikidata 구조 데이터는 CC0 Public Domain Dedication 아래 재사용할 수 있다. 전체 dump, MediaWiki·Wikibase API, recent changes와 SPARQL endpoint 등 여러 접근 경로가 있다. 연구·상업 응용이 별도 사용 허가 없이 자료를 복제·변형할 수 있다는 점은 중요한 기반이다.

하지만 개방 라이선스와 무제한 서비스는 다르다. Live API와 Query Service는 공유 인프라이므로 요청·시간·결과 크기·동시 실행 제한과 timeout이 있다. 대규모 분석은 dump·부분 그래프·자체 색인·cache를 사용해야 한다. 원문의 “API를 usage limit 없이 사용”하고 복잡한 질의를 언제나 milliseconds에 처리한다는 설명은 공식 운영 조건과 맞지 않는다.

## 공동 편집과 품질

사용자와 bot은 item·statement·label·reference를 추가·수정할 수 있고, 변경 이력과 토론·되돌리기·property constraint·WikiProject가 품질 관리를 돕는다. 외부 dataset import도 규모 확장의 중요한 방식이다. 따라서 Wikidata는 순수 수작업 입력이나 자동 추출 한 방식으로만 만들어지지 않는다.

협업이 정확성을 자동 보장하지는 않는다.

- vandalism·실수·낡은 값이 일정 시간 남을 수 있다.
- reference가 없거나 약한 statement가 존재한다.
- 같은 대상을 중복 item으로 만들거나 잘못 병합할 수 있다.
- property 사용 관례와 모델이 영역별로 다를 수 있다.
- 편집자 관심·bot·외부 자료의 분포가 coverage 편향을 만든다.
- 영토·정치·역사·분류 자체가 논쟁적인 대상을 하나의 현재값으로 축약하기 어렵다.

## Freebase와의 관계

[[Freebase]]와 Wikidata는 공통 식별자·다중 타입·property·공동 편집·외부 자료 적재라는 유사점이 있지만 같은 데이터 모델은 아니다. Freebase의 MID·CVT·domain·비계층 타입과 Wikidata의 Q/P item·qualifier·reference·rank·sitelink를 구분해야 한다.

Freebase 종료 전후에는 개체·property·스키마를 Wikidata에 대응시키는 별도 이전 작업이 진행됐다. 이는 Freebase 전체가 단순 복사됐거나 Wikidata가 2012년에 Freebase를 대체하려고 처음 설계됐다는 뜻이 아니다.

## 언어 AI에서 가능한 사용

Wikidata는 다음 과업의 자원이나 기준이 될 수 있다.

- **개체 연결**: 텍스트 언급을 Q ID에 대응하고 동명이인을 구분
- **질의응답**: 질문 관계를 P ID와 맞춰 저장된 value를 조회
- **관계 추출·검증**: 텍스트 후보 관계를 기존 statement와 대조
- **다언어 처리**: 같은 item의 언어별 label·alias를 연결
- **지식 그래프 완성**: 누락 관계 후보를 예측하고 평가
- **언어 모델 도구 사용**: API·SPARQL 결과를 생성 문맥으로 제공

이 목록은 **가능한 사용 방식**이지 raw가 열거한 모든 상용 검색 엔진·Siri·Alexa·Google Assistant·추천 제품이 Wikidata를 직접 채택했다는 증거가 아니다. 제품별 내부 자료와 시기를 확인하지 않고 채택 사실을 확정하지 않는다.

기계 번역도 item label을 이용해 고유명사를 일관되게 옮기거나 개체 의미를 구분할 수 있지만, `bank` 같은 일반 다의어가 항상 Wikidata item으로 해소되는 것은 아니다. 번역 성능 향상은 개체 연결 정확도·언어별 label coverage·번역 시스템 결합 방식의 별도 실험이 필요하다.

## LLM grounding과 hallucination

[[대규모 언어 모델]]이 Wikidata를 조회하면 매개변수 기억만 사용할 때보다 최신·출처 있는 구조 사실을 제공할 수 있다. 그러나 다음 오류 경로가 남는다.

1. 질문에서 잘못된 item을 선택한다.
2. 관계 방향이나 property를 잘못 매핑한다.
3. qualifier·rank·시점을 누락한다.
4. Wikidata 자체의 누락·오류·낡은 값을 가져온다.
5. 검색 결과를 자연어로 옮기며 다른 주장을 덧붙인다.

따라서 “Wikidata를 조회하면 hallucination이 해결된다”거나 “언어 모델은 사실 기억에 형편없고 지식 베이스는 사실을 안다”는 이분법은 지나치다. 외부 검색은 오류를 옮기고 추적할 수 있는 새 경로를 제공하지만 질문 해석·검색·근거 충실성·출처 품질을 함께 평가해야 한다.

Raw는 구조 지식 조회를 검색 증강 생성 전체와 곧바로 동일시한다. RAG는 문서 passage·database·API 등 다양한 원천을 사용할 수 있으며 Wikidata는 선택 가능한 한 원천이다. 실제 시스템이 Wikidata를 사용했는지는 해당 구현의 근거로 확인해야 한다.

## 검증 정정

- Wikidata는 구조 지식·triple·semantic web를 처음 발명하지 않았다. Wikipedia 공동체·다언어 sitelink·개방 statement 편집을 결합한 별도 프로젝트다.
- P36은 `capital`이며 France(Q142)에서 Paris(Q90)로 향한다. Paris→France는 P17 `country`다.
- Wikidata statement는 단순 triple보다 qualifier·reference·rank·unknown/no value를 포함하는 풍부한 구조다.
- Reference는 출처를 기록하지만 값의 참됨을 자동 보장하지 않고 모든 statement에 강제되지 않는다.
- Rank는 신뢰도나 참/거짓 표시가 아니라 여러 statement의 기본 선택 상태다.
- 모든 Wikipedia 언어판의 모든 본문·infobox가 Wikidata 값을 자동 사용하는 것은 아니다. 언어판별 선택과 template 정책이 있다.
- SPARQL의 다중 관계 join·property path는 강력한 질의지만 자동적인 형식 추론·인과 이해와 같지 않다.
- CC0 재사용은 무료 live endpoint의 무제한·무지연 사용을 뜻하지 않는다. Query Service에는 timeout과 공유 자원 한계가 있다.
- 언어 중립 ID는 다언어 연결을 돕지만 label·description·reference coverage의 언어 불균형을 제거하지 않는다.
- 질의응답·번역·검색·비서·추천·RAG에 사용할 수 있다는 가능성과 특정 제품의 실제 채택·성능 개선을 구분한다.
- Wikidata 조회는 LLM hallucination을 자동 제거하지 않는다. 개체·property 매핑, qualifier·시점, 원자료 품질과 생성 충실성 오류가 남는다.

## 핵심 문장

- Wikidata의 재사용 단위는 단순 triple이 아니라 item의 property–value 주장에 qualifier·reference·rank가 붙는 statement다.
- Q/P 식별자는 언어 중립적이지만 label과 coverage는 공동체 기여에 따라 언어별로 다르다.
- SPARQL은 관계 패턴을 질의하며, 저장된 경로 탐색을 논리 추론이나 사실 검증과 동일시하면 안 된다.
- CC0 개방 데이터와 live Query Service의 운영 한계는 별개의 문제다.
- LLM과의 결합은 사실 검색 경로를 제공하지만 검색·자료·생성의 새로운 오류를 함께 평가해야 한다.

## 출처

- Denny Vrandečić·Markus Krötzsch, [Wikidata: A Free Collaborative Knowledgebase](https://dl.acm.org/doi/pdf/10.1145/2629489), *Communications of the ACM* 57(10), 2014, pp. 78–85.
- Wikidata community, [Help:Data model](https://www.wikidata.org/wiki/Help:Data_model), item·statement·rank·qualifier·reference 절.
- Wikidata community, [Help:About data](https://www.wikidata.org/wiki/Help:About_data), Wikibase model·RDF·CC0 절.
- Wikidata community, [Help:Ranking](https://www.wikidata.org/wiki/Help:Ranking), normal·preferred·deprecated와 reference 구분.
- Wikidata community, [Wikidata SPARQL Query Service — Query limits](https://www.wikidata.org/wiki/Wikidata:SPARQL_query_service/query_limits), 결과 규모·timeout 예시.
- 프로젝트 번역·검토 출발 자료: [Wikidata Collaborative Knowledge Base for Language AI](https://mbrenndoerfer.com/writing/wikidata-collaborative-knowledge-base-language-ai)
- 프로젝트 보존 자료: `raw/042_Wikidata Collaborative Knowledge Base for Language AI.ko.md`, `raw/042_Wikidata Collaborative Knowledge Base for Language AI.commentary.ko.md`.

## 관련 항목

- [[Wikidata]]
- [[Wikibase 데이터 모델]]
- [[SPARQL]]
- [[지식 그래프]]
