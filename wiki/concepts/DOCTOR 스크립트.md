---
schema_version: 2
id: concept.doctor-스크립트
page_type: concept
title: DOCTOR 스크립트
aliases:
  - DOCTOR
  - ELIZA DOCTOR
  - 닥터 스크립트
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
  - concept.eliza
  - entity.칼-로저스
  - concept.로저스식-심리치료
  - concept.패턴-매칭
  - concept.템플릿-기반-응답-생성
  - concept.eliza-효과
---
# DOCTOR 스크립트

[[DOCTOR 스크립트]]는 [[ELIZA]]가 [[로저스식 심리치료]]를 모사하도록 만든 대표적인 대화 규칙 모음이다. ELIZA 자체가 여러 영역의 스크립트를 사용할 수 있는 틀이었다면, DOCTOR는 심리치료라는 특정 역할에 맞춘 키워드·우선순위·응답 템플릿의 집합이었다.

## 설계의 적합성

로저스식 치료는 진단이나 구체적 조언보다 반사, 개방형 질문, 최소 응답을 강조한다. 이 특성은 의미 이해와 세계 지식이 없는 ELIZA의 제약과 잘 맞았다. 모호한 답변은 전문적 절제로, 되묻기는 적극적 경청으로 해석될 수 있었다.

## 한계

DOCTOR의 치료적 인상은 심리 상태를 실제로 이해하거나 안전한 치료 판단을 내린 결과가 아니다. 사용자가 프로그램에 공감과 전문성을 과도하게 귀속하면 [[ELIZA 효과]]가 발생할 수 있다.

## 출처

- [[007_ELIZA]]

## 관련 항목

- [[ELIZA]]
- [[칼 로저스]]
- [[로저스식 심리치료]]
- [[패턴 매칭]]
- [[템플릿 기반 응답 생성]]
- [[ELIZA 효과]]
