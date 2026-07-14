---
schema_version: 2
id: analysis.eliza에서-llm으로
page_type: analysis
title: ELIZA에서 LLM으로
aliases:
  - ELIZA to LLM
  - ELIZA와 대규모 언어 모델
  - 대화형 AI의 이해 문제
tags:
  - type/analysis
  - domain/ai
  - domain/nlp
  - domain/conversational-ai
created: '2026-07-14'
updated: '2026-07-15'
lifecycle: active
verification: partial
artifacts:
  - raw/002_The Turing Test.md
  - raw/002_The Turing Test.commentary.md
  - raw/007_ELIZA - The First Conversational AI Program.ko.md
  - raw/007_ELIZA - The First Conversational AI Program.commentary.ko.md
evidence:
  - source_id: turing-1950
    locator: 'pp. 433–460, §§1–7'
    relation: supports
  - source_id: weizenbaum-1966
    locator: pp. 36–45
    relation: supports
  - source_id: mit-eliza-1965
    locator: ELIZA source and DOCTOR script records
    relation: supplements
related:
  - concept.eliza
  - concept.eliza-효과
  - concept.doctor-스크립트
  - concept.튜링-테스트
  - concept.행동-기반-지능-기준
  - concept.대규모-언어-모델
  - analysis.ai-시연과-실제-성능
---
# ELIZA에서 LLM으로

[[ELIZA]]와 현대 [[대규모 언어 모델]]은 모두 인간에게 자연스럽게 느껴지는 언어 상호작용을 만들지만, 그 작동 방식과 범위는 크게 다르다. 두 계보를 비교하면 유창성, 이해, 사용자 기대, 신뢰성을 별도로 평가해야 하는 이유가 선명해진다.

## 작동 방식의 차이

ELIZA는 대화 규칙을 실행하는 프레임워크였고 [[DOCTOR 스크립트]]는 그 위에서 치료사 역할을 구현했다. 어떤 키워드를 중요하게 볼지, 어떤 [[패턴 매칭]]과 응답 템플릿을 사용할지, 실패 시 어떤 [[대화 복구|fallback]]을 쓸지 설계자가 직접 정했다. 현대 LLM은 대규모 데이터에서 토큰 간 패턴과 표현을 학습해 훨씬 넓은 문맥에서 새 문장을 생성한다.

## 역할 설정의 연속성

작동 방식은 다르지만 대화 역할이 사용자 해석을 바꾼다는 점은 이어진다. [[DOCTOR 스크립트]]의 “심리치료사” 프레임은 모호한 응답을 공감과 절제로 보이게 했다. 현대 시스템에서도 역할과 지시가 응답의 어조와 사용자의 기대를 바꾼다. 따라서 모델 성능뿐 아니라 인터페이스가 어떤 능력을 암시하는지도 평가해야 한다.

## 유창성과 이해

ELIZA는 제한된 규칙만으로도 이해하는 듯 보일 수 있음을 보여주었다. LLM은 ELIZA보다 훨씬 복잡하므로 두 시스템을 기술적으로 동일시하면 안 된다. 그럼에도 자연스러운 출력만으로 이해·의식·신뢰 가능한 추론을 확정할 수 없다는 평가 문제는 남아 있다. ELIZA를 [[튜링 테스트]]의 최초 구현으로 보는 대신 후대의 비교 대상으로 다룬다.

## ELIZA 효과의 확장

[[ELIZA 효과]]는 시스템의 실제 능력보다 더 많은 이해와 공감을 사용자가 귀속할 때 발생한다. 현대 대화형 AI의 높은 유창성은 이 효과를 약화시키기보다 더 강하게 만들 수 있다. 특히 정서적 조언, 의료·법률·재정처럼 잘못된 신뢰의 비용이 큰 상황에서는 시스템의 한계와 인간 감독을 분명히 해야 한다.

## 평가 원칙

- 대화 자연스러움과 사실 정확성을 분리한다.
- 역할 연기와 실제 전문 능력을 구분한다.
- fallback이 실패를 숨기는지, 한계를 적절히 알리는지 확인한다.
- 단기적 인상뿐 아니라 긴 대화의 일관성과 실제 과업 성능을 평가한다.
- 사용자가 시스템을 어떻게 의인화하고 신뢰하는지 측정한다.

## 출처

- [[002_튜링 테스트]]
- [[007_ELIZA]]

## 관련 항목

- [[ELIZA]]
- [[ELIZA 효과]]
- [[DOCTOR 스크립트]]
- [[튜링 테스트]]
- [[행동주의적 지능 기준]]
- [[대규모 언어 모델]]
- [[AI 시연과 실제 성능]]
