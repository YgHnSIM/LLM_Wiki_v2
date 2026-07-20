---
schema_version: 2
id: source.039
page_type: source
title: Freebase와 협업형 지식 그래프
aliases:
  - 039_Freebase Collaborative Knowledge Graph for Structured Information
  - Freebase Collaborative Knowledge Graph
  - 프리베이스와 구조화된 정보
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
  - 'raw/039_Freebase Collaborative Knowledge Graph for Structured Information.ko.md'
  - 'raw/039_Freebase Collaborative Knowledge Graph for Structured Information.commentary.ko.md'
evidence:
  - source_id: bollacker-et-al-2008-freebase
    locator: 'pp. 1247–1250, 특히 초록과 §§1–4의 튜플 데이터 모델·협업 편집·MQL·2008년 규모'
    relation: supports
  - source_id: google-freebase-basic-concepts
    locator: 'Types and properties, Domains and namespaces, Compound Value Types, MIDs 절의 토픽·다중 타입·비계층 타입·다중 값·CVT·식별자 설명'
    relation: supports
  - source_id: google-2010-metaweb-acquisition
    locator: '2010-07-16 전체 발표, 특히 Metaweb 인수·Freebase의 1,200만 개 이상 항목·공개 유지 계획 문단'
    relation: supports
  - source_id: google-2012-knowledge-graph
    locator: '2012-05-16 전체 발표, 특히 Freebase·Wikipedia·CIA World Factbook에 뿌리를 둔 5억 개 객체·35억 개 사실 설명'
    relation: contextualizes
  - source_id: google-freebase-data-dumps
    locator: 'Freebase history와 Data dumps 절의 2007–2015 운영·API 종료·최종 19억 트리플 덤프·라이선스·비갱신 상태'
    relation: supports
  - source_id: pellissier-tanon-et-al-2016-freebase-wikidata
    locator: 'pp. 1419–1428, 특히 §§1–3의 종료 연표·거의 5천만 개체·30억 개 이상 사실·CVT와 §§4–6의 스키마·개체·속성 매핑'
    relation: supports
related:
  - concept.freebase
  - concept.지식-그래프
  - concept.대규모-언어-모델
---
# Freebase와 협업형 지식 그래프

039 raw는 [[Freebase]]를 2007년에 등장해 “스키마 없는” 계층형 타입과 자동 추론을 구현하고 현대 검색·질의응답·추천·언어 모델을 직접 가능하게 한 혁명으로 서술한다. 이 공개 문서는 **편집 가능한 스키마와 스키마 부재**, **네임스페이스 경로와 타입 상속**, **그래프 패턴 질의와 논리 추론**, **Freebase·Google Knowledge Graph·Wikidata의 서로 다른 수명주기**를 분리한다.

Freebase의 검증 가능한 핵심 성과는 개체·타입·속성·식별자를 웹 규모의 튜플 저장소에 넣고, 외부 자료 적재와 공동체 편집, 공개 API와 MQL 질의를 결합한 데 있다. 이는 [[지식 그래프]]를 실용적인 데이터·응용 기반으로 널리 보여 준 중요한 사례다. 그러나 RDF·시맨틱 웹·그래프 데이터베이스·DBpedia 같은 선행·동시대 흐름을 지우거나, 현대 지식 기반 AI 전체를 Freebase 하나의 직접 후손으로 만들지는 않는다.

## 공개·인수·종료 연대

| 시기 | 확인되는 사건 | 구분할 점 |
| --- | --- | --- |
| 2007 | Metaweb이 Freebase를 공개했다. | 2008년 SIGMOD 논문 출판과 구분한다. |
| 2008 | Bollacker 등이 Freebase의 설계와 당시 운영 규모를 보고했다. | 1억 2,500만 개 이상 튜플, 4,000개 이상 타입, 7,000개 이상 속성은 이 시점의 수치다. |
| 2010-07 | Google이 Metaweb을 인수했다. | 발표 당시 Freebase는 1,200만 개가 넘는 대상을 담았고 Google은 공개 유지 계획을 밝혔다. |
| 2012-05 | Google이 Knowledge Graph를 공개했다. | Freebase는 Wikipedia·CIA World Factbook 등과 함께 뿌리가 된 자료 중 하나였고, Google의 더 큰 비공개 자료로 보강됐다. |
| 2014–2015 | 종료 계획 발표 뒤 2015년 3월 말 읽기 전용으로 전환되고 API가 종료됐다. | Google Knowledge Graph와 Freebase 공개 서비스의 수명주기는 같지 않다. |
| 2016 | Freebase–Wikidata 이전 논문이 스키마·개체·속성 매핑과 공동체 검토를 보고했다. | 단순 덤프 복사가 아니라 서로 다른 모델 사이의 변환이었다. |

Google의 현재 보존 페이지는 Freebase 자료 공유 프로젝트가 2007년부터 2015년까지 운영됐다고 설명한다. 최종 공개 덤프는 약 19억 개 트리플을 담지만 더 이상 갱신되지 않는다. 반면 2016년 이전 논문이 언급한 30억 개 이상의 사실은 종료 무렵 Freebase 전체의 별도 집계다. 두 수치를 같은 시점·같은 단위의 규모로 섞으면 안 된다.

## 토픽·타입·속성

Freebase에서 **토픽(topic)**은 한 대상에 관한 정보를 모으는 중심 개체다. 토픽은 여러 **타입(type)**을 동시에 가질 수 있고, 타입은 그 종류의 토픽에 적용되는 **속성(property)**을 묶는다. 관련 타입은 관리 단위인 **도메인(domain)**으로 모인다. 속성 값은 문자열·수·날짜일 수도 있고 다른 토픽일 수도 있다.

공식 기본 개념 문서는 속성이 기본적으로 다중 값을 허용한다고 설명한다. 한 사람에게 여러 직업·수상·소속이 있을 수 있기 때문이다. 사람–작품–배역–날짜처럼 둘 이상의 값이 한 관계에 붙는 경우에는 **CVT(Compound Value Type)**라는 중간 노드를 사용한다. 따라서 Freebase의 모든 노드가 독립적인 현실 세계 토픽인 것은 아니다.

### 타입 계층이 아니라 다중 타입

raw는 Freebase가 상위 타입의 속성을 하위 타입에 상속하는 계층적 타입 시스템이라고 설명한다. 공식 문서는 반대로 **Freebase 타입은 계층으로 배열되지 않는다**고 명시한다. `/film/director` 같은 ID가 경로처럼 보이는 것은 네임스페이스가 계층적으로 조직됐기 때문이다. 타입 자체의 상속 계층과 ID 경로의 조직을 혼동하면 안 된다.

한 토픽이 `person`과 `actor`처럼 여러 타입을 동시에 가져 필요한 속성 묶음을 결합한다. 새 타입과 속성을 그래프 안에 추가할 수 있다는 유연성은 있었지만, 아무 구조 없이 사실을 넣은 것은 아니다.

## “스키마 없음”의 실제 뜻

Freebase의 스키마는 도메인·타입·속성이라는 객체로 같은 그래프 안에 저장되고 편집됐다. 따라서 `schema-free`는 고정 테이블 정의와 별개로 스키마가 데이터와 함께 진화할 수 있다는 운영상의 표현에 가깝다. **스키마가 존재하지 않는다**는 뜻으로 읽으면 타입 제약과 속성 정의가 실제로 있었다는 사실을 놓친다.

raw가 전통적 데이터베이스를 새 사실 종류마다 전체 스키마를 바꿔야 하는 경직된 체계로만 묘사하는 것도 과도한 대조다. 관계형 시스템도 정규화된 범용 관계 테이블이나 메타데이터 설계로 확장성을 얻을 수 있다. Freebase의 차별점은 유연한 튜플 모델과 스키마 편집을 웹 공개 협업·고유 식별자·그래프 API와 하나의 서비스로 결합한 데 있다.

스키마 유연성은 비용도 만들었다. 비슷한 타입·속성의 중복, 서로 다른 도메인의 모델링 관행, 누락과 충돌을 지속적으로 정리해야 했다. 2016년 이전 연구가 스키마 매핑 자체를 별도 과제로 다룬 것은 이 차이가 단순 이름 대응으로 해결되지 않았음을 보여 준다.

## MID와 개체 동일성

표시 이름은 중복되거나 바뀔 수 있으므로 Freebase는 토픽에 **MID(Machine ID)**를 부여했다. 응용 프로그램은 사람이 읽는 이름이나 네임스페이스 키보다 MID를 사용하도록 권장됐다. 이 분리는 `Washington` 같은 문자열을 사람·도시·주 가운데 특정 대상으로 연결하는 개체 수준 중의성 해소와 외부 데이터 통합에 중요했다.

다만 고유 식별자가 현실의 동일성 문제를 자동으로 해결하지는 않는다. Freebase 내부 GUID와 MID의 관계는 토픽 병합·분할 과정에서 달라질 수 있었다. 안정적 식별자는 편집 이력을 추적하고 이름과 대상을 분리하는 장치이지, 논쟁적 개체 동일성을 영원히 확정하는 논리적 보증이 아니다.

## MQL: 그래프 질의와 추론의 경계

MQL(Metaweb Query Language)은 JSON과 비슷한 구조로 원하는 그래프 패턴과 제약을 기술했다. 특정 감독과 연결된 영화, 두 감독의 작품에 모두 출연한 배우, 조건을 만족하는 값의 집계를 찾을 수 있었다. 2008년 논문은 이를 HTTP 기반 graph-query API로 제공했다고 보고했다.

이 기능은 문서에서 매번 관계를 추출하는 것보다 명시적이고 재사용 가능하다. 그러나 raw가 “여러 단계 추론”이라 부르는 사례 대부분은 경로 탐색, 필터, 교집합, 집계다. 그래프를 여러 단계 따라간다는 사실만으로 온톨로지 공리에서 새로운 명제를 연역하는 형식 추론 엔진이 되지는 않는다. **질의 가능한 관계**와 **논리적으로 도출된 새 사실**을 구분해야 한다.

“양방향 링크”도 같은 주의가 필요하다. 관계를 역방향으로 조회할 수 있다는 인터페이스 성질과 서로 반대인 두 사실을 항상 중복 저장한다는 데이터 모델은 다르다. 역탐색을 별도 사실의 존재로 일반화하지 않는다.

## 협업 편집과 데이터 적재

Freebase는 Wikipedia식 공동체 편집을 구조적 데이터에 적용했지만 순수한 크라우드소싱 자원은 아니었다. 2008년 논문은 사용자 기여와 함께 여러 데이터 원천을 적재하고 조정하는 과정을 설명한다. 사용자는 토픽·타입·속성을 추가·수정했고 변경 이력과 조정 장치가 이를 뒷받침했다.

이 혼합 방식은 빠른 범위 확대를 가능하게 했지만 출처별 충돌, 영역별 불균형, 중복 개체, 스키마 일관성 문제를 남겼다. 인기 있는 영화·인물 영역의 밀도와 전문 영역의 밀도가 같다는 보장은 없었다. 구조화된 값이라는 사실만으로 정확성·최신성·출처가 자동 보장되지 않는다.

## 응용과 실제로 확인되는 영향

개체와 관계를 고유 ID로 질의할 수 있으므로 Freebase는 질의응답, 개체 연결, 데이터 통합, 지식 베이스 완성 연구에 유용한 기반이었다. 텍스트의 이름을 MID와 연결하면 동명이인을 구분하고 관련 속성을 조회할 수 있다. 외부 응용은 같은 ID를 중심으로 서로 다른 자료를 연결할 수 있었다.

그러나 가능성과 실제 채택을 분리해야 한다.

- 구조적 수도 관계에서 `Paris`를 조회할 수 있다는 것은 직접 답변의 **가능성**을 보여 주지만 특정 검색 제품의 답변이 Freebase만으로 생성됐다는 증거는 아니다.
- 공유 배우·감독·장르를 질의할 수 있다는 것은 추천 특징을 제공하지만 추천 품질 향상을 입증한 비교 실험과 다르다.
- Google은 2012년 Knowledge Graph가 Freebase 등 여러 공개 자료에 뿌리를 두었다고 밝혔다. 이는 직접 활용 근거지만 지식 패널·추천 스니펫·음성 비서 전체를 Freebase의 단일 효과로 만들지는 않는다.
- 연구 데이터가 Freebase MID와 관계를 사용했다는 사실과 현대 NLP·LLM의 모든 개체 지식이 Freebase에서 유래했다는 주장은 다르다.

## Google Knowledge Graph와 Wikidata

Google Knowledge Graph는 Freebase의 단순한 이름 변경이 아니다. 2012년 공식 발표는 Freebase·Wikipedia·CIA World Factbook 같은 공개 자료에 뿌리를 두면서 훨씬 큰 자체 자료로 보강한 시스템이라고 설명했다. 당시 보고된 5억 개 객체와 35억 개 사실은 Google Knowledge Graph 수치이지 2012년 공개 Freebase 덤프 수치가 아니다.

Freebase 공개 서비스 종료 뒤에는 Wikidata로 지식을 옮기는 별도 작업이 진행됐다. 2016년 논문은 Freebase 타입·속성과 Wikidata 항목·속성의 대응, CVT 변환, 중복과 라이선스, 공동체 검토를 다룬다. “Freebase가 Google Knowledge Graph로 이관됐다”와 “Freebase 공개 자료가 Wikidata로 매핑됐다”는 서로 다른 관계다.

## 어휘·문장 의미 자원과 무엇이 다른가

WordNet의 중심 단위는 영어 단어 형태와 어휘화된 의미의 synset이다. FrameNet은 상황 프레임·어휘 단위·프레임 요소와 말뭉치 용례를 연결한다. PropBank는 구문 트리 위의 술어 감각과 문장 논항 역할을 주석한다. Freebase의 중심 단위는 현실 세계의 사람·장소·작품·사건 같은 식별 가능한 토픽과 그 사실 관계다.

네 자원은 모두 노드·관계·식별자를 사용한다는 넓은 공통점이 있지만, 같은 종류의 의미 그래프는 아니다. `dog`의 어휘 의미, `Commerce_buy`가 불러오는 상황, `buy.01`의 Arg0·Arg1, 특정 영화의 감독이라는 사실은 각각 다른 질문에 답한다. 서로 연결해 사용할 수 있다는 사실과 역사적·이론적으로 하나에서 나머지가 직접 파생됐다는 주장을 구분해야 한다.

## 현대 언어 모델과의 연결

현대 시스템은 [[대규모 언어 모델]]의 입력에 지식 그래프 검색 결과를 제공하거나, 생성된 개체·관계를 구조화된 자료와 대조하거나, 텍스트에서 그래프 후보를 추출할 수 있다. 이런 결합은 출처가 있는 명시적 관계와 비정형 표현 처리의 장점을 함께 쓰려는 시도다.

그러나 LLM은 기본적으로 토큰 문맥의 분포를 학습하며 Freebase처럼 MID·타입·속성 그래프를 명시적 내부 저장소로 갖는다고 볼 수 없다. 특정 모델이 Freebase나 파생 벤치마크를 학습했는지, 지식 그래프 결합이 사실 정확도·최신성·추론에 어떤 효과를 냈는지는 개별 자료로 검증해야 한다. 원문의 “Freebase에서 현대 지식 강화 LLM으로”라는 계보는 연구 질문이지 확정된 단일 계통이 아니다.

## 검증 정정

- **스키마 없는 데이터베이스**: 도메인·타입·속성이라는 스키마가 같은 그래프 안에서 편집·진화했다. 스키마 부재가 아니라 스키마 유연성이다.
- **계층적 타입과 속성 상속**: 공식 문서는 타입이 계층으로 배열되지 않는다고 명시한다. 네임스페이스 ID 경로와 타입 상속을 혼동한 설명이다.
- **모든 노드는 현실 세계 개체**: CVT처럼 복합 관계를 묶는 중간 노드도 있었다.
- **양방향 관계 저장**: 역방향 탐색 가능성과 두 개의 독립 트리플 저장을 동일시하지 않는다.
- **그래프 탐색이 곧 추론**: 원문의 사례는 주로 패턴 질의·교집합·집계이며 형식 논리의 연역과 구분한다.
- **순수 공동체 구축**: 외부 데이터 적재와 사용자 편집을 결합한 혼합형 구축이었다.
- **Google Knowledge Graph로 단순 이관**: Google의 시스템은 여러 원천으로 보강된 더 큰 체계였고, 공개 자료의 Wikidata 이전은 별도 과정이었다.
- **지식 그래프 패러다임의 단독 창시**: 선행·동시대 지식 표현과 RDF·DBpedia 흐름이 있었다. Freebase의 공헌은 웹 규모의 실용적 결합과 확산에 둔다.
- **검색 패널·추천·LLM의 직접 원인**: 구체 제품·모델의 채택과 효과를 별도 근거 없이 일괄 귀속하지 않는다.

## 핵심 문장

- Freebase는 편집 가능한 스키마, 고유 식별자, 공개 질의 API와 협업 큐레이션을 결합한 웹 규모의 튜플 지식 베이스였다.
- Freebase 타입은 공식 문서상 계층으로 배열되지 않으며, 경로형 ID의 네임스페이스 구조를 타입 상속으로 읽으면 안 된다.
- MQL의 관계 탐색·필터·집계는 강력한 그래프 질의지만 그 자체가 형식 논리 추론을 뜻하지 않는다.
- Google Knowledge Graph는 Freebase를 포함한 여러 자료에 뿌리를 둔 별도 시스템이고, Wikidata 이전은 스키마와 개체를 변환한 별도 공개 작업이었다.
- WordNet·FrameNet·PropBank·Freebase는 모두 구조화 자원이지만 synset·frame·roleset·topic이라는 서로 다른 의미 단위를 조직한다.

## 출처

- Kurt Bollacker 외, [Freebase: A Collaboratively Created Graph Database for Structuring Human Knowledge](https://research.google/pubs/freebase-a-collaboratively-created-graph-database-for-structuring-human-knowledge/), 2008, pp. 1247–1250.
- Google, [Freebase Documentation Archive — Basic Concepts](https://developers.google.com/freebase/guide/basic_concepts), Types and properties·Domains and namespaces·CVT·MIDs 절.
- Jack Menzel, [Deeper understanding with Metaweb](https://googleblog.blogspot.com/2010/07/deeper-understanding-with-metaweb.html), 2010-07-16.
- Amit Singhal, [Introducing the Knowledge Graph — Things, not strings](https://blog.google/products-and-platforms/products/search/introducing-knowledge-graph-things-not/), 2012-05-16.
- Google, [Freebase Data Dumps](https://developers.google.com/freebase), Freebase history·Data dumps 절.
- Thomas Pellissier Tanon 외, [From Freebase to Wikidata — The Great Migration](https://thomas.pellissier-tanon.fr/papers/2016-WWW-freebase.pdf), 2016, pp. 1419–1428.
- 프로젝트 번역·검토 출발 자료: [Freebase Collaborative Knowledge Graph for Structured Information](https://mbrenndoerfer.com/writing/history-freebase-knowledge-graph)
- 프로젝트 보존 자료: `raw/039_Freebase Collaborative Knowledge Graph for Structured Information.ko.md`, `raw/039_Freebase Collaborative Knowledge Graph for Structured Information.commentary.ko.md`.

## 관련 항목

- [[Freebase]]
- [[지식 그래프]]
- [[대규모 언어 모델]]
