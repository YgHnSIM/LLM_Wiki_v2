---
schema_version: 2
id: source.003
page_type: source
title: Georgetown-IBM 기계 번역 시연
aliases:
  - Georgetown-IBM Machine Translation Demonstration
  - Georgetown-IBM Machine
  - 조지타운-IBM 기계 번역 시연
tags:
  - type/source
  - domain/ai
  - domain/nlp
created: '2026-05-08'
updated: '2026-07-21'
lifecycle: active
verification: verified
artifacts:
  - raw/003_Georgetown-IBM Machine.md
  - raw/003_Georgetown-IBM Machine.commentary.md
evidence:
  - source_id: macdonald-1963
    locator: pp. 1–4
    relation: supports
related:
  - concept.기계-번역
  - concept.규칙-기반-기계-번역
  - concept.지식-공학-병목
  - concept.신경망-기계-번역
  - analysis.ai-시연과-실제-성능
  - concept.대규모-언어-모델
  - analysis.튜링-테스트와-llm-평가
  - meta.overview
  - meta.index
---
# Georgetown-IBM 기계 번역 시연

## 핵심 요약

1954년 1월 7일 [[Georgetown University]]와 [[IBM]]은 IBM 701로 러시아어 문장을 영어로 바꾸는 초기 공개 시연을 열었다. 기계 번역의 가능성을 널리 알린 사건이지만, 일반 목적 번역기가 완성됐음을 보여준 시험은 아니었다. “최초의 성공적인 기계 번역”보다는 “널리 알려진 초기 공개 시연”이라고 표현하는 편이 안전하다.

Georgetown의 후대 보고서에 따르면 시연은 화학 분야에서 고른 문장, 약 250개 러시아어 어휘, 6개의 통사 연산을 사용했다. 프로젝트 raw가 설명하는 수천 개 사전 항목은 이 기록과 맞지 않는다. 시스템은 모든 러시아어 형태와 일반 통사를 분석한 것이 아니라, 제한된 어휘와 정해진 연산으로 선별된 입력을 처리했다.

이 방식은 [[규칙 기반 기계 번역]]의 초기 형태였다. 사전 정보와 문법 표지를 이용해 영어 대응어와 어순을 결정했지만, 광범위한 어휘, 모호성, 관용 표현, 도메인 변화에 대한 일반화는 검증하지 않았다. 따라서 60개 문장의 성공과 실제 문서 번역 능력을 분리해 평가해야 한다.

시연은 연구비와 대중의 관심을 끌어 [[기계 번역]] 연구를 확대하는 데 기여했다. 동시에 통제된 데모가 시스템의 적용 범위보다 큰 기대를 만드는 [[AI 시연과 실제 성능]] 문제의 초기 사례이기도 하다.

## 검증 정정

- 프로젝트 raw의 “수천 개 사전 항목” 설명을 채택하지 않는다. 1차 보고서의 규모는 약 250개 어휘와 6개 통사 연산이다.
- 시스템이 일반적인 러시아어 통사 구조를 분석했다는 표현을 사용하지 않는다.
- 선별된 화학 문장에 맞춘 제한적 시연이라는 조건을 모든 성능 설명에 포함한다.

## 주요 인사이트

- 시연은 기계 번역의 가능성을 공개적으로 보여줬지만 일반 번역 성능을 입증하지 않았다.
- 작은 어휘와 제한된 문법 연산은 성공 조건인 동시에 확장성의 한계였다.
- 수작업 사전과 규칙의 증가는 후대 [[지식 공학 병목]] 문제와 연결된다.
- 역사적 영향과 기술적 적용 범위를 별도로 평가해야 한다.

## 핵심 문장

- Georgetown-IBM 시연은 엄선된 입력에 대한 제한적 성공이었으며, 일반 목적 번역기의 완성을 뜻하지 않았다.
- 약 250개 어휘와 6개 통사 연산이라는 규모가 시연의 성취와 한계를 함께 설명한다.
- 이 사건은 초기 AI 데모가 연구를 촉진하면서도 과도한 기대를 만들 수 있음을 보여준다.

## 출처

- R. Ross Macdonald, [The Georgetown-IBM Experiment Demonstrated in January 1954](https://aclanthology.org/www.mt-archive.info/50/Georgetown-1963-Macdonald.pdf), Georgetown University, 1963, pp. 1–4.
- [IBM History: Machine-aided translation](https://www.ibm.com/history/machine-aided-translation), 시연 일자·장소·장비 확인.
- 프로젝트 번역·검토 출발 자료: [Georgetown-IBM Machine](https://mbrenndoerfer.com/writing/georgetown-ibm-machine-translation-demonstration)
- 프로젝트 보존 자료: `raw/003_Georgetown-IBM Machine.md`, `raw/003_Georgetown-IBM Machine.commentary.md`.

## 관련 항목

- [[기계 번역]]
- [[규칙 기반 기계 번역]]
- [[지식 공학 병목]]
- [[신경망 기계 번역]]
- [[AI 시연과 실제 성능]]
- [[대규모 언어 모델]]
- [[튜링 테스트와 LLM 평가]]
- [[overview]]
- [[index]]
