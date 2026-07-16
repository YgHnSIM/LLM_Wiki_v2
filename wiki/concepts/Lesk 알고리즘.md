---
schema_version: 2
id: concept.lesk-알고리즘
page_type: concept
title: Lesk 알고리즘
aliases:
  - Lesk algorithm
  - 레스크 알고리즘
tags:
  - type/concept
  - domain/nlp
  - domain/ai
  - domain/computer-science
created: '2026-07-16'
updated: '2026-07-16'
lifecycle: active
verification: verified
artifacts:
  - 'raw/017_Lesk Algorithm Word Sense Disambiguation & the Birth of Context-Based NLP.ko.md'
  - 'raw/017_Lesk Algorithm Word Sense Disambiguation & the Birth of Context-Based NLP.commentary.ko.md'
evidence:
  - source_id: lesk-1986
    locator: 'pp. 24–26, 특히 p. 24의 절차와 p. 26의 한계·개선안'
    relation: supports
  - source_id: banerjee-pedersen-2002-adapted-lesk
    locator: 'pp. 136–145, 특히 §§2–4와 §7'
    relation: supplements
  - source_id: banerjee-pedersen-2003-extended-gloss-overlaps
    locator: 'pp. 805–810, 특히 §3'
    relation: supplements
  - source_id: oele-van-noord-2018-embedding-wsd
    locator: 'pp. 259–265, 특히 초록과 §1'
    relation: contextualizes
  - source_id: huang-et-al-2019-glossbert
    locator: 'pp. 3509–3514, 특히 §2와 §3'
    relation: contextualizes
related:
  - source.017
  - entity.마이클-레스크
  - concept.단어-의미-중의성-해소
  - concept.통계적-자연어-처리
---
# Lesk 알고리즘

[[Lesk 알고리즘]]은 [[마이클 레스크]]가 1986년 발표한 사전 기반 [[단어 의미 중의성 해소]] 절차다. 한 문맥에 함께 나타나는 단어들은 관련된 의미로 쓰일 가능성이 높고, 관련된 의미의 사전 뜻풀이에는 같은 어휘가 나타날 가능성이 높다는 가정을 사용한다.

## 실제 구현

1986년 프로그램은 문맥의 각 단어를 한 번씩 처리했다. 현재 단어의 각 후보 의미 글로스를 주변 단어들 각각의 모든 후보 의미 글로스와 비교하고 공통 어휘 점수를 합산한 뒤, 현재 단어에서 점수가 가장 큰 의미를 골랐다. 앞서 고른 의미를 이용해 다른 단어를 다시 평가하지 않았으며 모든 단어의 후보 의미 조합을 전역적으로 열거하지도 않았다.

논문은 기본 문맥 폭을 열 단어로 설명한다. 실제 점수는 동일한 어휘의 중첩에 근거하며 의미적 유사도나 학습된 벡터를 사용하지 않는다. 논문 출력은 일부 형태 정규화를 암시하지만 전처리 명세와 점근 복잡도·실행 시간을 제시하지 않는다.

## 단순화 레스크와의 차이

후대에 널리 쓰인 단순화 레스크는 하나의 목표 단어에 집중한다. 목표 단어의 각 후보 글로스를 주변의 표면 문맥과 직접 비교해 가장 많이 겹치는 의미를 고른다. 1986년 구현은 주변 단어들의 후보 의미 글로스까지 비교했다는 점에서 비교 대상과 처리 비용이 다르다.

## 후속 변형

2002년 `Adapted Lesk`는 WordNet의 의미 관계를 따라 관련 글로스를 추가하고 긴 연속 중첩에 더 큰 점수를 주었다. 2003년 `Extended Gloss Overlaps`는 관련 synset 글로스를 이용한 의미 관련도 척도와 WSD 적용을 별도로 제시했다.

2018년 Oele·van Noord는 Lesk에서 영감을 받은 지식 기반 방법으로 정확 중첩 대신 단어·의미 임베딩을 사용했다. 2019년 GlossBERT는 문맥–글로스 쌍을 BERT로 분류하는 지도 학습 방법이다. 이들은 글로스와 문맥의 적합도를 비교한다는 제한된 공통점이 있지만 원 알고리즘과 동일하지 않으며 현대 언어 모델 전체의 직접 계보도 아니다.

## 한계

짧은 글로스와 문맥에서는 중첩이 없거나 동점인 경우가 생긴다. 결과는 사전의 의미 분할, 정의 길이, 어휘 선택에 의존한다. 동의어·상식·담화·화용 정보는 같은 문자열이 우연히 글로스에 함께 나타나지 않는 한 점수에 직접 반영되지 않는다.

## 출처

- [[017_Lesk 알고리즘과 단어 의미 중의성 해소]]
- Michael E. Lesk, [Automatic Sense Disambiguation Using Machine Readable Dictionaries](https://doi.org/10.1145/318723.318728), 1986, pp. 24–26.
- Satanjeev Banerjee·Ted Pedersen, [An Adapted Lesk Algorithm](https://doi.org/10.1007/3-540-45715-1_11), 2002, pp. 136–145.
- Satanjeev Banerjee·Ted Pedersen, [Extended Gloss Overlaps](https://www.ijcai.org/Proceedings/03/Papers/116.pdf), 2003, pp. 805–810.
- Dieke Oele·Gertjan van Noord, [Simple Embedding-Based Word Sense Disambiguation](https://aclanthology.org/2018.gwc-1.30/), 2018, pp. 259–265.
- Luyao Huang 외, [GlossBERT](https://aclanthology.org/D19-1355/), 2019, pp. 3509–3514.

## 관련 항목

- [[017_Lesk 알고리즘과 단어 의미 중의성 해소]]
- [[마이클 레스크]]
- [[단어 의미 중의성 해소]]
- [[통계적 자연어 처리]]
