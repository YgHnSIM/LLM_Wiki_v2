---
schema_version: 3
id: concept.skip-gram
page_type: concept
title: Skip-gram
aliases:
  - Skip-Gram
  - continuous skip-gram
  - 스킵그램
tags:
  - type/concept
  - domain/ai
  - domain/nlp
  - domain/machine-learning
created: '2026-07-18'
updated: '2026-07-21'
editorial_status: active
review:
  evidence_coverage: verified
  content_mode: descriptive
artifacts:
  - raw/043_Word2Vec Dense Word Embeddings and Neural Language Representations.ko.md
  - raw/043_Word2Vec Dense Word Embeddings and Neural Language Representations.commentary.ko.md
evidence:
  - source_id: mikolov-et-al-2013-word-representations
    locator: 'arXiv:1301.3781, §3과 Fig. 1의 continuous Skip-gram 구조, §4의 구문·의미 유추 평가'
    relation: supports
  - source_id: mikolov-et-al-2013-negative-sampling
    locator: 'NeurIPS 2013, §§2.1–2.3의 Skip-gram 출력·negative sampling·subsampling'
    relation: supports
  - source_id: levy-goldberg-2014-sgns-pmi
    locator: 'NeurIPS 2014, §§2–3의 SGNS 목적과 shifted PMI 해석'
    relation: contextualizes
relations:
  - target: source.043
    kind: related
  - target: concept.word2vec
    kind: related
  - target: concept.cbow
    kind: related
  - target: concept.말뭉치-기반-학습
    kind: related
learning:
  difficulty:
    entry: intermediate
    target: intermediate
  prerequisites:
    - target: concept.단어-임베딩
  assumed_knowledge: 없음
  outcomes:
    - 'Skip-gram이 중심 단어에서 여러 문맥 학습 쌍을 만드는 흐름을 설명하고, 출력 방식·분포 통계·정적 어휘의 한계를 구분할 수 있다.'
  next:
    - target: concept.glove
      reason: '다음에는 GloVe에서 동시출현 계수 회귀와의 차이를 보고, FastText에서 문자 n-gram으로 희귀어·OOV 표현을 확장하는 방식을 살핀다.'
    - target: concept.fasttext
      reason: '다음에는 GloVe에서 동시출현 계수 회귀와의 차이를 보고, FastText에서 문자 n-gram으로 희귀어·OOV 표현을 확장하는 방식을 살핀다.'
---
# Skip-gram

> [!note] 학습 안내
> **난이도:** 중급<br>
> **선수 지식:** [[concept.단어-임베딩|단어 임베딩]]<br>
> **읽고 나면:** Skip-gram이 중심 단어에서 여러 문맥 학습 쌍을 만드는 흐름을 설명하고, 출력 방식·분포 통계·정적 어휘의 한계를 구분할 수 있다.

## 1단계 — 먼저 잡을 핵심

Skip-gram은 중심 단어 하나로 주변 문맥 단어들을 예측하는 [[Word2Vec]] 구조다. 문맥 창 안의 위치마다 중심–문맥 쌍을 만들므로, `sat`의 한 출현에서 `sat→cat`, `sat→on` 같은 여러 학습 사건이 생긴다.

## 2단계 — 작동 원리

### 중심 단어에서 문맥 쌍까지

Skip-gram은 중심 단어 하나를 입력으로 삼고 문맥 창 안의 각 주변 단어를 별도 예측 대상으로 만든다. 한 번의 중심 단어 출현이 여러 중심–문맥 학습 사건으로 바뀐다.

## 3단계 — 기술과 근거

### 학습 쌍

말뭉치 $w_1,\dots,w_T$와 최대 창 $m$에서 기본 목적은 다음처럼 나타낼 수 있다.

$$
\frac{1}{T}\sum_{t=1}^{T}
\sum_{-m\le j\le m,\,j\ne0}
\log p(w_{t+j}\mid w_t)
$$

실제 구현은 문장 경계·최소 빈도·빈출어 subsampling을 적용하고 각 중심에서 사용할 창 크기를 무작위로 줄일 수 있다. 따라서 “항상 좌우 정확히 $m$개를 동일 가중으로 예측한다”는 것은 단순화다.

### 출력 방식

초기 연구는 Huffman tree를 따라 출력 단어를 고르는 hierarchical softmax를 사용했다. 후속 SGNS는 관측 쌍과 잡음 분포에서 뽑은 소수 음성 쌍의 이진 분류로 전체 어휘 정규화를 피했다. 두 방식은 같은 Skip-gram 입력 방향을 공유하지만 학습 목적이 동일하지 않다.

### 분포적 의미

비슷한 문맥 단어를 예측해야 하는 중심 단어들은 비슷한 표현을 얻을 수 있다. SGNS 점곱은 shifted PMI 행렬의 저랭크 분해로 해석할 수 있으므로, 이 결과는 동시출현 통계와 연결된다. 벡터 거리는 사전적 유의성만이 아니라 주제·통사·빈도·말뭉치 편향도 반영한다.

## 검증과 한계

### 한계

희귀 단어 한 번에서 여러 쌍을 얻어도 관측 수가 적다는 근본 한계는 남는다. 기본 Skip-gram은 word type당 하나의 정적 벡터를 학습하며 OOV·다의성·어순·장거리 문맥을 직접 해결하지 않는다.

## 학습 확인

1. Skip-gram은 중심 단어와 문맥 단어 가운데 무엇을 입력과 예측 대상으로 삼는가?
2. 문맥 창의 한 중심 단어 출현에서 여러 학습 쌍은 어떻게 만들어지는가?
3. 여러 쌍과 부정 샘플링을 사용해도 OOV·다의성·장거리 문맥 문제가 남는 이유는 무엇인가?

다음에는 [[GloVe]]에서 동시출현 계수 회귀와의 차이를 보고, [[FastText]]에서 문자 n-gram으로 희귀어·OOV 표현을 확장하는 방식을 살핀다.

### 다음 문서

- [[concept.glove|GloVe]] — 다음에는 GloVe에서 동시출현 계수 회귀와의 차이를 보고, FastText에서 문자 n-gram으로 희귀어·OOV 표현을 확장하는 방식을 살핀다.
- [[concept.fasttext|FastText]] — 다음에는 GloVe에서 동시출현 계수 회귀와의 차이를 보고, FastText에서 문자 n-gram으로 희귀어·OOV 표현을 확장하는 방식을 살핀다.

## 출처
- [[043_Word2Vec와 효율적 정적 단어 임베딩]]
- Tomas Mikolov 외, [Efficient Estimation of Word Representations in Vector Space](https://arxiv.org/abs/1301.3781), 2013, §§3–4.
- Tomas Mikolov 외, [Distributed Representations of Words and Phrases and their Compositionality](https://proceedings.neurips.cc/paper_files/paper/2013/hash/9aa42b31882ec039965f3c4923ce901b-Abstract.html), NeurIPS 2013, §§2–3.
- Omer Levy·Yoav Goldberg, [Neural Word Embedding as Implicit Matrix Factorization](https://proceedings.neurips.cc/paper_files/paper/2014/hash/b78666971ceae55a8e87efb7cbfd9ad4-Abstract.html), NeurIPS 2014, §§2–3.

## 관련 항목

- [[concept.glove|GloVe]]
- [[concept.fasttext|FastText]]
- [[concept.단어-임베딩|단어 임베딩]]
- [[source.043|Word2Vec와 효율적 정적 단어 임베딩]]
- [[concept.word2vec|Word2Vec]]
- [[concept.cbow|CBOW]]
- [[concept.말뭉치-기반-학습|말뭉치 기반 학습]]
