---
schema_version: 2
id: concept.eliza
page_type: concept
title: ELIZA
aliases:
  - 엘리자
  - Eliza conversational program
tags:
  - type/concept
  - domain/ai
  - domain/nlp
  - domain/conversational-ai
created: '2026-07-14'
updated: '2026-07-15'
lifecycle: active
verification: verified
artifacts:
  - raw/007_ELIZA - The First Conversational AI Program.ko.md
  - raw/007_ELIZA - The First Conversational AI Program.commentary.ko.md
evidence:
  - source_id: weizenbaum-1966
    locator: pp. 36–45
    relation: supports
  - source_id: mit-eliza-1965
    locator: ELIZA source and DOCTOR script records
    relation: supplements
related:
  - entity.조지프-바이젠바움
  - concept.doctor-스크립트
  - concept.패턴-매칭
  - concept.템플릿-기반-응답-생성
  - concept.대화-복구
  - concept.eliza-효과
  - analysis.eliza에서-llm으로
---
# ELIZA

[[ELIZA]]는 [[조지프 바이젠바움]]이 1964~1966년 개발하고 1966년 논문으로 발표한 초기 자연어 대화 프레임워크다. 프로그램은 여러 대화 스크립트를 실행할 수 있었고, [[DOCTOR 스크립트]]는 그중 가장 유명한 사례다. ELIZA를 [[튜링 테스트]]를 구현하려고 만든 최초 프로그램으로 단정할 근거는 없다.

## 작동 방식

ELIZA는 문장의 의미나 세계 지식을 일반적으로 모델링하지 않고, 스크립트에 정의된 키워드와 분해 규칙을 우선순위에 따라 선택했다. 재조립 규칙에 사용자 표현을 넣고 대명사를 변환해 응답했으며, 처리하기 어려운 입력에는 저장한 키워드나 내용에 덜 의존하는 규칙을 사용했다.

## DOCTOR

가장 유명한 [[DOCTOR 스크립트]]는 [[로저스식 심리치료]]를 모사했다. 반사와 개방형 질문이 중심인 대화 역할은 ELIZA가 실질적 조언이나 의미 분석을 하지 못한다는 사실을 눈에 띄지 않게 만들었다.

## 역사적 의미

ELIZA의 중요성은 인간과 같은 이해를 구현했다는 데 있지 않다. 제한된 표면 기법도 역할 설정과 사용자 기대를 이용하면 강한 이해의 인상을 만들 수 있음을 보여주었다. 이 문제는 [[ELIZA 효과]]와 현대 [[대규모 언어 모델]] 평가로 이어진다.

## 출처

- [[007_ELIZA]]
- Joseph Weizenbaum, [ELIZA](https://doi.org/10.1145/365153.365168), 1966, pp. 36–45.
- MIT Libraries, [ELIZA source code and DOCTOR script records](https://dome.mit.edu/handle/1721.3/201699?show=full), 1965.

## 관련 항목

- [[조지프 바이젠바움]]
- [[DOCTOR 스크립트]]
- [[패턴 매칭]]
- [[템플릿 기반 응답 생성]]
- [[대화 복구]]
- [[ELIZA 효과]]
- [[ELIZA에서 LLM으로]]
