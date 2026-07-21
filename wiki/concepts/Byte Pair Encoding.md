---
schema_version: 2
id: concept.byte-pair-encoding
page_type: concept
title: Byte Pair Encoding
aliases: [BPE, 바이트 페어 인코딩, 바이트 쌍 인코딩]
tags:
  - type/concept
  - domain/ai
  - domain/nlp
  - domain/computer-science
created: '2026-07-18'
updated: '2026-07-21'
lifecycle: active
verification: verified
artifacts:
  - 'raw/049_Subword Tokenization and FastText Character N-gram Embeddings for Robust Word Representations.ko.md'
  - 'raw/049_Subword Tokenization and FastText Character N-gram Embeddings for Robust Word Representations.commentary.ko.md'
evidence:
  - source_id: gage-1994-byte-pair-encoding
    locator: '초록과 §1의 빈번한 인접 byte pair를 미사용 byte로 치환하는 압축 알고리즘'
    relation: contextualizes
  - source_id: sennrich-haddow-birch-2016-subword-nmt
    locator: '§3.2와 Algorithm 1의 문자·문자열 pair merge, word boundary와 merge-count vocabulary'
    relation: supports
related:
  - source.049
---
# Byte Pair Encoding

> [!note] 학습 안내
> **난이도:** 입문<br>
> **선수 지식:** [[서브워드 토큰화]]<br>
> **읽고 나면:** BPE가 빈번한 symbol pair를 병합해 어휘 크기와 시퀀스 길이의 trade-off를 조절하는 방식을 설명할 수 있다.

## 1단계 — 먼저 잡을 핵심

[[Byte Pair Encoding]](BPE)은 빈번한 인접 symbol pair를 반복해서 하나의 새 symbol로 합치는 알고리즘이다. Philip Gage의 1994년 원형은 byte pair를 미사용 byte로 치환하는 압축법이었고, Sennrich·Haddow·Birch는 2016년 이를 문자·문자열 pair의 서브워드 토큰화에 적응했다.

## 2단계 — 작동 원리

### NMT 분절 절차

1. 단어를 문자와 word-end symbol의 열로 초기화한다.
2. 말뭉치 빈도로 가중해 인접 symbol pair 횟수를 센다.
3. 가장 빈번한 pair를 새 symbol로 병합한다.
4. 정해진 횟수만큼 반복하고 merge 순서를 저장한다.
5. 새 문자열에 학습한 merge를 순서대로 적용한다.

원 NMT 설정은 word boundary를 넘는 pair를 고려하지 않았다. 최종 어휘 크기는 초기 symbol 수와 merge 횟수로 정해진다. 현대의 byte-level 변형과 원 2016 word-boundary character BPE를 같은 세부 구현으로 취급하지 않는다.

## 3단계 — 기술과 근거

### trade-off

빈번한 문자열은 긴 token이 되어 sequence를 짧게 하고, 희귀 문자열은 작은 조각으로 남아 제한 어휘로 표현된다. merge를 늘리면 어휘·embedding 행렬은 커지고 sequence는 짧아지는 경향이 있다. 분절이 형태소와 일치하거나 최종 의미가 보장되지는 않는다.

기본 alphabet 또는 byte fallback이 모든 입력을 포괄하는지에 따라 OOV 가능성이 달라진다. BPE라는 이름만으로 임의 Unicode 문자열의 무손실 표현을 보장하지 않는다.

## 검증과 한계

1994년 byte 치환 압축과 2016년 NMT용 문자·문자열 병합은 같은 핵심 절차를 공유하지만 입력 단위와 목적이 다르다. 현대 byte-level 변형도 원 NMT 설정과 세부 구현이 같지 않으며, BPE 병합이 형태소나 의미 경계를 찾는다는 보장은 없다.

## 학습 확인

### 확인 질문

1. BPE는 각 반복에서 어떤 symbol pair를 선택하는가?
2. merge 횟수가 늘면 어휘 크기와 시퀀스 길이는 대체로 어떻게 달라지는가?
3. BPE라는 이름만으로 임의 문자열의 무손실 표현을 보장할 수 없는 이유는 무엇인가?

### 다음 문서

- [[FastText]] — 같은 희귀어 문제를 시퀀스 분절이 아니라 한 단어 벡터의 문자 특징 합성으로 다루는 방법과 비교한다.

## 출처

- [[049_FastText와 서브워드 표현의 두 경로]]
- Philip Gage, [A New Algorithm for Data Compression](https://www.derczynski.com/papers/archive/BPE_Gage.pdf), The C Users Journal 12(2), 1994, pp. 23–38.
- Rico Sennrich·Barry Haddow·Alexandra Birch, [Neural Machine Translation of Rare Words with Subword Units](https://aclanthology.org/P16-1162/), ACL 2016, §3.2.

## 관련 항목

- [[049_FastText와 서브워드 표현의 두 경로]]
