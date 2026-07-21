---
schema_version: 2
id: concept.deepqa
page_type: concept
title: DeepQA
aliases:
  - Deep QA
  - Watson DeepQA architecture
  - 딥QA
tags:
  - type/concept
  - domain/ai
  - domain/computer-science
  - domain/nlp
  - domain/machine-learning
created: '2026-07-18'
updated: '2026-07-21'
lifecycle: active
verification: verified
artifacts:
  - 'raw/040_IBM Watson on Jeopardy! - Historic AI Victory That Demonstrated Open-Domain Question Answering.ko.md'
  - 'raw/040_IBM Watson on Jeopardy! - Historic AI Victory That Demonstrated Open-Domain Question Answering.commentary.ko.md'
evidence:
  - source_id: ferrucci-et-al-2010-building-watson
    locator: 'AI Magazine 31(3), pp. 59–79의 DeepQA 원칙·question analysis·candidate generation·hypothesis scoring·final merging·confidence estimation'
    relation: supports
  - source_id: ferrucci-et-al-2013-watson-beyond-jeopardy
    locator: 'pp. 93–105의 수백 개 알고리즘·feature·학습 가중치·근거 링크와 영역 적응 설명'
    relation: supports
related:
  - source.040
  - concept.ibm-watson
  - concept.개방-영역-질의응답
---
# DeepQA

> [!note] 학습 안내
> **난이도:** 중급<br>
> **선수 지식:** 없음<br>
> **읽고 나면:** DeepQA가 여러 후보와 근거를 병렬로 결합해 답과 신뢰도를 정하는 흐름을 설명하고, 단일 신경망·범용 엔진과 구분할 수 있다.

## 1단계 — 먼저 잡을 핵심

DeepQA는 IBM Watson을 위해 개발된 병렬 증거 기반 질의응답 구조다. 질문을 하나의 형식 논리로 완전히 변환해 단일 추론기로 푸는 대신, 여러 해석에서 많은 후보 답을 만들고 서로 다른 근거 점수로 평가한 뒤 학습된 모형으로 순위와 신뢰도를 정한다.

이름의 `Deep`은 오늘날의 deep neural network와 같은 뜻이 아니다. 2010년 논문에서 깊이는 질문부터 후보·근거까지 여러 해석 경로를 충분히 탐색하고, 얕은 문자열 신호와 구문·의미·공간·시간 지식을 함께 적용한다는 설계 원칙을 가리킨다.

## 2단계 — 작동 원리

### 네 가지 원칙

- **대규모 병렬 처리**: 해석·검색·근거 평가 경로를 병렬 실행한다.
- **많은 전문가**: 서로 다른 오류 특성을 가진 알고리즘의 결과를 결합한다.
- **전 과정의 신뢰도**: 중간 해석과 최종 답의 불확실성을 점수로 전달한다.
- **얕고 깊은 지식의 통합**: 텍스트 일치부터 구문·의미·관계·시간·공간 분석까지 상황에 맞게 사용한다.

### 처리 흐름

```text
질문·category
  → 질문 분석과 여러 해석
  → 높은 재현율의 후보 생성
  → 초기 필터링
  → 후보별 근거 검색과 다차원 점수화
  → 같은 답의 근거 병합
  → 학습된 순위·신뢰도
  → 답변·보류와 게임 전략
```

후보 생성은 정답을 놓치지 않는 데 우선순위를 둔다. 정답이 후보군에 없으면 뒤의 정교한 점수화로 복구할 수 없다. 이후 단계는 질문이 요구하는 답 유형, 시간·공간, 문서와 구절의 정합성, 관계·구문·동의 표현 등 여러 신호로 오답을 줄인다.

## 3단계 — 기술과 근거

### 구현 규모가 뜻하는 것

구현은 100개가 넘는 기법과 50개가 넘는 점수 성분을 포함했다. 이것은 모듈 수 자체가 지능의 척도라는 뜻이 아니라, 개방 영역 질문의 오류 원인이 다양해 한 분석기만으로 안정적으로 풀기 어려웠다는 설계 판단을 보여준다.

### 구조 지식과 비정형 텍스트

DeepQA는 DBpedia·WordNet·YAGO 같은 구조 자료와 백과사전·사전·뉴스·문학 등 비정형 자료를 함께 사용했다. 구조 지식은 정확한 관계가 맞을 때 강하지만 2010년 논문에서 직접 지식 베이스 조회가 효과적인 clue는 2% 미만이었다. 질문의 언어 표현을 저장된 관계와 개방 영역 전체에서 안정적으로 대응시키기 어려웠기 때문이다.

따라서 DeepQA를 지식 그래프 추론기 하나로 축약할 수 없다. 문서 검색과 후보별 근거 수집이 큰 비중을 차지했고, 구조 자료는 여러 증거원 중 하나였다.

### 학습과 신뢰도

연구진은 분석기·검색기·지식 자원·점수 성분을 설계하고, 정답이 알려진 과거 clue로 어떤 점수 조합이 정답과 오답을 잘 구별하는지 학습했다. 이는 전 과정이 수작업 규칙이었다는 뜻도, 비지도 학습이 관계와 전략을 전부 스스로 발견했다는 뜻도 아니다.

최종 신뢰도는 답의 철학적 확실성이 아니라 관측한 점수 패턴 아래에서 그 후보가 맞을 조건부 가능성의 추정이다. 이를 답변 임계값과 베팅 전략에 연결함으로써 정답을 고르는 문제와 오답 위험을 감수할지를 정하는 문제를 분리했다.

## 검증과 한계

### 한계와 재사용

DeepQA의 구성요소는 영역별 자료와 증거 유형을 바꿔 재사용할 수 있지만, *Jeopardy!* 설정 그대로 의료·법률·대화에 옮길 수 있는 범용 엔진은 아니다. 새로운 영역에서는 답의 단위, 근거의 질, 최신성, 사용자 상호작용, 설명과 책임 기준이 달라진다.

현대 검색 증강 생성과는 외부 자료 검색·후보 근거 결합이라는 질문을 공유한다. 그러나 DeepQA는 명시적인 후보와 수작업·학습 점수 파이프라인이고, 생성형 LLM은 토큰 생성을 중심으로 한다. 문제의식의 유사성과 구현의 동일성을 구분해야 한다.

## 학습 확인

1. DeepQA의 이름에서 Deep은 오늘날의 심층 신경망과 어떻게 다른 뜻인가?
2. 질문 분석에서 후보 생성·근거 점수화·순위와 신뢰도까지 어떤 순서로 처리되는가?
3. Jeopardy용 DeepQA를 의료·법률·생성형 LLM과 같은 범용 엔진으로 볼 수 없는 이유는 무엇인가?

다음에는 [[IBM Watson]]에서 DeepQA가 실제 경기 시스템 안에서 작동한 조건을 보고, [[개방 영역 질의응답]]에서 이 구조가 다룬 과업의 폭을 살핀다.

## 출처

- David Ferrucci 외, [Building Watson: An Overview of the DeepQA Project](https://aaai.org/ai-magazine/the-ai-behind-watson-the-technical-article/), *AI Magazine* 31(3), 2010, pp. 59–79.
- David Ferrucci 외, [Watson: Beyond Jeopardy!](https://scalar.usc.edu/works/meet-my-friend-watson-1/media/Beyond%20Jeopardy.pdf), 2013, pp. 93–105.
- [[040_IBM Watson과 Jeopardy 질의응답]]
- 프로젝트 보존 자료: `raw/040_IBM Watson on Jeopardy! - Historic AI Victory That Demonstrated Open-Domain Question Answering.ko.md`, `raw/040_IBM Watson on Jeopardy! - Historic AI Victory That Demonstrated Open-Domain Question Answering.commentary.ko.md`.

## 관련 항목

- [[040_IBM Watson과 Jeopardy 질의응답]]
- [[IBM Watson]]
- [[개방 영역 질의응답]]
