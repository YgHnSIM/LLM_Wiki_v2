---
schema_version: 2
id: concept.shrdlu
page_type: concept
title: SHRDLU
aliases:
  - Winograd SHRDLU
  - 슈르들루
tags:
  - type/concept
  - domain/ai
  - domain/nlp
  - domain/conversational-ai
created: '2026-07-16'
updated: '2026-07-16'
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
related:
  - source.009
  - entity.테리-위노그래드
  - entity.mit
  - concept.블록-세계
  - concept.마이크로월드
  - concept.파싱
  - concept.지식-공학-병목
---
# SHRDLU

[[SHRDLU]]는 [[테리 위노그래드]]가 1968~1970년 [[MIT]]에서 개발한 자연어 이해 프로그램이다. 사용자는 영어로 시뮬레이션된 [[블록 세계]]의 물체를 옮기라고 지시하거나 세계 상태를 질문할 수 있었다.

## 통합 구조

시스템은 문장의 통사 구조만 분석하지 않았다. 의미와 담화 문맥을 이용해 지시 대상을 찾고, 물체의 속성·위치·지지 관계를 기록한 세계 모델을 조회하며, 문제 해결기가 실행 가능한 행동 순서를 구성했다. 모호성을 해소하지 못하면 확인 질문을 했고, 과거 행동과 계획을 바탕으로 답을 설명할 수 있었다.

## 한계

이 능력은 어휘, 사물, 관계, 가능한 행동이 미리 정해진 [[마이크로월드]] 안에서 성립했다. 새 영역을 다루려면 문법·절차·세계 지식을 다시 설계해야 했으므로 [[지식 공학 병목]]을 피하지 못했다. 따라서 SHRDLU는 일반 언어 이해의 완성품보다 언어·지식·행동을 통합했을 때 얻는 성과와 폐쇄 세계의 한계를 함께 보여준 시스템이다.

## 출처

- [[009_SHRDLU]]
- Terry Winograd, [Procedures as a Representation for Data in a Computer Program for Understanding Natural Language](https://hdl.handle.net/1721.1/7095), 1971, 특히 pp. 1–39.
- Terry Winograd, [Understanding Natural Language](https://doi.org/10.1016/0010-0285(72)90002-3), 1972, pp. 1–191.

## 관련 항목

- [[009_SHRDLU]]
- [[테리 위노그래드]]
- [[MIT]]
- [[블록 세계]]
- [[마이크로월드]]
- [[파싱]]
- [[지식 공학 병목]]
