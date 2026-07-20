---
schema_version: 2
id: source.017
page_type: source
title: Lesk 알고리즘과 단어 의미 중의성 해소
aliases:
  - 'Lesk Algorithm Word Sense Disambiguation & the Birth of Context-Based NLP'
  - 레스크 알고리즘과 문맥 기반 중의성 해소
tags:
  - type/source
  - domain/nlp
  - domain/ai
  - domain/computer-science
created: '2026-07-16'
updated: '2026-07-21'
lifecycle: active
verification: verified
artifacts:
  - 'raw/017_Lesk Algorithm Word Sense Disambiguation & the Birth of Context-Based NLP.ko.md'
  - 'raw/017_Lesk Algorithm Word Sense Disambiguation & the Birth of Context-Based NLP.commentary.ko.md'
evidence:
  - source_id: lesk-1986
    locator: 'pp. 24–26, 특히 p. 24의 절차·예시와 p. 26의 실험·논의'
    relation: supports
  - source_id: banerjee-pedersen-2002-adapted-lesk
    locator: 'pp. 136–145, 특히 §§2–4와 §7'
    relation: supplements
  - source_id: banerjee-pedersen-2003-extended-gloss-overlaps
    locator: 'pp. 805–810, 특히 §3과 §§5–6'
    relation: supplements
  - source_id: raganato-et-al-2017-wsd
    locator: 'pp. 99–110, 특히 §§2.1–2.2, §4와 §5'
    relation: contextualizes
  - source_id: oele-van-noord-2018-embedding-wsd
    locator: 'pp. 259–265, 특히 초록, §1과 §8'
    relation: contextualizes
  - source_id: huang-et-al-2019-glossbert
    locator: 'pp. 3509–3514, 특히 §2, Table 1, §3과 Tables 2–3'
    relation: contextualizes
related:
  - entity.마이클-레스크
  - concept.lesk-알고리즘
  - concept.단어-의미-중의성-해소
  - concept.wordnet
  - concept.통계적-자연어-처리
  - analysis.규칙-기반-ai에서-데이터-기반-학습으로
---
# Lesk 알고리즘과 단어 의미 중의성 해소

## 핵심 요약

[[마이클 레스크]]의 1986년 논문은 기계 판독형 사전의 뜻풀이(gloss)에 나타나는 공통 어휘를 이용해 [[단어 의미 중의성 해소]]를 수행하는 [[Lesk 알고리즘]]을 제시했다. 현재 단어의 후보 의미마다 그 뜻풀이를 주변 단어들의 모든 후보 의미 뜻풀이와 비교하고, 어휘 중첩 점수가 가장 큰 의미를 선택하는 결정론적 지식 기반 방법이다.

논문에 구현된 절차는 각 단어를 한 번씩 처리하며, 앞서 선택한 의미로 다른 단어를 다시 평가하지 않는다. 문장 전체의 모든 의미 조합을 전역적으로 열거하는 알고리즘도 아니다. 논문은 점근 복잡도나 실행 시간을 보고하지 않았으므로, 이를 단순 선형 알고리즘이나 전역 지수 탐색이라고 단정하지 않는다.

이 작업은 문맥을 계산에 이용한 초기의 영향력 있는 사전 기반 WSD 연구지만 문맥 기반 NLP의 탄생이나 현대 언어 모델 전체의 직접 조상으로 보지 않는다. 논문 p. 26 자체가 기본 발상을 1950년대 Margaret Masterman과 1960년대 Lawrence Urdang의 선행 제안에 연결한다.

## 서지와 연구 환경

공개 논문 「Automatic Sense Disambiguation Using Machine Readable Dictionaries: How to Tell a Pine Cone from an Ice Cream Cone」은 1986년 토론토에서 열린 SIGDOC 학술대회 논문집 pp. 24–26에 실렸다. DOI는 `10.1145/318723.318728`이다. raw의 1983년 개발 귀속을 확인할 1차 근거는 없으므로 공개 문서는 출판·제시가 확인되는 1986년을 기준으로 삼는다.

논문 p. 24에 적힌 저자 소속은 뉴저지주 모리스타운의 Bell Communications Research다. 이를 Bell Laboratories의 Murray Hill 연구로 기록하지 않는다. 제목에는 `ice cream cone`이 들어가지만 논문 본문에서 계산 과정을 보여 주는 대표 예시는 `pine cone`이다.

## 1986년 구현 절차

논문이 설명한 기본 문맥 폭은 열 단어다. 프로그램은 문맥의 각 단어를 차례로 한 번 처리한다. 현재 단어의 후보 의미 하나에 대해 그 뜻풀이와 주변 단어 각각의 모든 후보 의미 뜻풀이를 비교하고, 공통 어휘 수를 합산한다. 이 점수가 가장 큰 현재 단어의 의미를 선택한 뒤 다음 단어로 넘어간다.

이미 결정한 의미만 남겨 후속 단어를 재평가하는 `settling`은 p. 26에서 미래 개선안으로 언급될 뿐 실제 구현에 쓰이지 않았다. 따라서 구현된 절차는 다음 두 방법과 구분된다.

1. 모든 단어의 후보 의미 조합을 한꺼번에 열거하고 전체 점수를 최대화하는 전역 탐색
2. 목표 단어의 후보 글로스를 주변의 표면 문맥 단어와 직접 비교하는 후대의 단순화 레스크

원 논문은 뜻풀이에 실제로 함께 나타나는 어휘를 증거로 쓴다. 의미상 가까운 단어라는 이유만으로 점수를 주는 벡터 유사도 방법은 아니다. 출력 예시에는 `burned`와 `burning`을 `burn`으로 맞춘 듯한 형태 정규화가 보이지만, 토큰화·불용어 제거·어간 처리의 정식 명세는 제시하지 않는다.

## 예시와 오류 사례

p. 24의 `pine cone` 예에서는 `pine`의 상록수 의미와 `cone`의 열매 의미 뜻풀이에 나타나는 `evergreen`과 `tree`가 중첩 증거가 된다. 논문은 `coal ash`, `Time flies`, `Fruit flies`, `hawk`, `mole`, 《Moby-Dick》의 `reef`도 다룬다. p. 26은 배에서 쓰이는 `galley`를 난로 의미와 잘못 연결한 사례를 제시한다.

raw의 `bank`, `interest`, 낚시 문장은 알고리즘을 설명하기 위해 새로 구성한 튜토리얼 예시이며 1986년 논문의 실험 예시로 인용하지 않는다. 정확한 어휘 중첩이 없는 `water`와 `river`를 의미적 이웃으로 처리하는 설명도 원 구현이 아니라 후대의 관계·벡터 확장에 가까운 해설이다.

## 사전과 간이 평가

Lesk는 Oxford Advanced Learner’s Dictionary of Current English, Webster’s Seventh New Collegiate Dictionary, Collins English Dictionary를 비교했다. Oxford English Dictionary는 실제 비교 실험에 사용한 이 세 기계 판독형 사전에 포함되지 않는다. 논문은 사전마다 의미 분할과 뜻풀이 어휘가 달라 결과도 자원에 의존한다고 지적한다.

p. 26의 평가는 저자가 매우 짧은 실험이라고 규정한 소규모 점검이다. 《Pride and Prejudice》의 짧은 표본과 Associated Press 뉴스 기사 하나에서 약 50–70%가 맞았다고 보고하지만, 상세한 표본 크기·정답 주석 절차·기준선·신뢰구간은 제공하지 않는다. 이를 대규모 벤치마크 결과나 일반 성능 보증으로 확대하지 않는다.

## Adapted Lesk와 Extended Gloss Overlaps

Banerjee와 Pedersen의 2002년 「An Adapted Lesk Algorithm for Word Sense Disambiguation Using WordNet」은 [[WordNet]]의 관계를 따라 관련 개념의 글로스를 비교에 포함하고, 연속해서 겹치는 구절이 길수록 더 큰 점수를 주는 변형이다. 이 논문의 정식 명칭은 `Adapted Lesk`다.

같은 저자들의 2003년 「Extended Gloss Overlaps as a Measure of Semantic Relatedness」는 관련 synset의 글로스 중첩을 확장해 의미 관련도를 계산하고 이를 WSD에 적용한 별도 논문이다. `Adapted Lesk`와 `Extended Gloss Overlaps`를 하나의 2002년 논문명으로 합치지 않는다.

## 평가 체계와 신경 방법

Raganato·Camacho-Collados·Navigli의 2017년 연구는 다섯 Senseval·SemEval all-words 데이터셋을 WordNet 3.0과 공통 전처리 형식으로 통일해 지식 기반·지도·신경 WSD 방법을 비교했다. 그 결과는 특정 데이터·의미 목록·학습 자원 아래의 비교이며 모든 언어와 영역에 대한 보편 순위를 뜻하지 않는다.

Oele와 van Noord의 2018년 방법은 Lesk에서 영감을 받았다고 명시하고, 정확한 단어 중첩 대신 단어·의미 임베딩으로 글로스와 문맥의 유사도를 계산했다. Huang 외의 2019년 GlossBERT는 문맥–글로스 쌍을 구성하고 사전 학습 BERT를 지도 미세조정해 후보 의미를 분류했다. 이 두 연구는 Lesk와 비교 가능한 문맥–정의 적합도 문제를 다루지만, Word2Vec·BERT·Transformer·LLM 전체가 Lesk에서 직접 발전했다는 역사적 계보를 입증하지 않는다.

## 검증 정정

- 공개 논문의 연도는 1986년이며 1983년 개발을 뒷받침하는 근거는 확인되지 않았다.
- 논문 소속은 Bell Communications Research, Morristown이며 Bell Laboratories, Murray Hill로 적지 않는다.
- 실제 구현은 현재 단어의 후보 글로스를 주변 단어들의 모든 후보 글로스와 비교하며, 문장 전체의 의미 조합을 전역 탐색하지 않는다.
- 논문은 점근 복잡도와 처리 시간을 보고하지 않았으므로 선형 확장이나 1980년대 하드웨어의 특정 처리량을 사실로 채택하지 않는다.
- 실제 비교 사전은 Oxford Advanced Learner’s, Webster’s Seventh New Collegiate, Collins이며 OED가 아니다.
- 50–70%는 두 텍스트에 대한 매우 짧은 실험 보고로, 대규모 평가 결과가 아니다.
- `pine cone`은 본문의 계산 예시지만 `ice cream cone`은 제목에만 등장한다.
- raw의 `bank`·`interest`·낚시 문장은 원 논문의 사례가 아니다.
- 2002년은 `Adapted Lesk`, 2003년은 `Extended Gloss Overlaps` 연구다.
- Lesk는 지식 기반 WSD 방법이며 통계 학습이나 현대 언어 모델 전체의 직접 조상으로 일반화하지 않는다.

## 핵심 문장

- Lesk 알고리즘은 기계 판독형 사전의 글로스 사이에서 정확한 어휘 중첩을 찾는 1986년 지식 기반 WSD 방법이다.
- 구현된 프로그램은 각 단어를 한 번 처리했으며 이전 결정으로 다른 단어를 다시 평가하거나 전역 의미 조합을 열거하지 않았다.
- 소규모 50–70% 보고는 예비 점검이지 표준 벤치마크가 아니다.
- Adapted Lesk, Extended Gloss Overlaps, 임베딩 WSD, GlossBERT는 서로 다른 후속 방법이다.
- 문맥을 이용한다는 공통점만으로 Lesk와 현대 LLM 사이의 직접 계보를 주장할 수 없다.

## 출처

- Michael E. Lesk, [Automatic Sense Disambiguation Using Machine Readable Dictionaries](https://doi.org/10.1145/318723.318728), 1986, pp. 24–26.
- Satanjeev Banerjee·Ted Pedersen, [An Adapted Lesk Algorithm for Word Sense Disambiguation Using WordNet](https://doi.org/10.1007/3-540-45715-1_11), 2002, pp. 136–145.
- Satanjeev Banerjee·Ted Pedersen, [Extended Gloss Overlaps as a Measure of Semantic Relatedness](https://www.ijcai.org/Proceedings/03/Papers/116.pdf), 2003, pp. 805–810.
- Alessandro Raganato·Jose Camacho-Collados·Roberto Navigli, [Word Sense Disambiguation: A Unified Evaluation Framework and Empirical Comparison](https://aclanthology.org/E17-1010/), 2017, pp. 99–110.
- Dieke Oele·Gertjan van Noord, [Simple Embedding-Based Word Sense Disambiguation](https://aclanthology.org/2018.gwc-1.30/), 2018, pp. 259–265.
- Luyao Huang 외, [GlossBERT](https://aclanthology.org/D19-1355/), 2019, pp. 3509–3514.
- 프로젝트 번역·검토 출발 자료: [Lesk Algorithm Word Sense Disambiguation & the Birth of Context-Based NLP](https://mbrenndoerfer.com/writing/lesk-algorithm-word-sense-disambiguation-nlp-history)
- 프로젝트 보존 자료: `raw/017_Lesk Algorithm Word Sense Disambiguation & the Birth of Context-Based NLP.ko.md`, `raw/017_Lesk Algorithm Word Sense Disambiguation & the Birth of Context-Based NLP.commentary.ko.md`.

## 관련 항목

- [[마이클 레스크]]
- [[Lesk 알고리즘]]
- [[단어 의미 중의성 해소]]
- [[통계적 자연어 처리]]
- [[규칙 기반 AI에서 데이터 기반 학습으로]]
- [[WordNet]]
