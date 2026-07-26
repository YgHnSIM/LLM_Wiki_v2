---
schema_version: 3
id: concept.cbow
page_type: concept
title: CBOW
aliases:
  - Continuous Bag of Words
  - 연속 단어 주머니
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
    locator: 'arXiv:1301.3781, §3과 Fig. 1의 continuous bag-of-words 구조·계산량'
    relation: supports
  - source_id: levy-goldberg-dagan-2015-distributional-similarity
    locator: 'TACL 3, pp. 211–225, §2의 CBOW·Skip-gram을 포함한 분포 모형 구분과 §§4–6의 설정별 평가'
    relation: contextualizes
relations:
  - target: source.043
    kind: related
  - target: concept.word2vec
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
    - 'CBOW가 주변 문맥 벡터를 모아 중심 단어를 예측하는 흐름을 설명하고, Skip-gram과의 방향 차이 및 정적 표현의 한계를 구분할 수 있다.'
  next:
    - target: concept.skip-gram
      reason: '다음에는 Skip-gram에서 반대 방향의 학습 쌍을 보고, GloVe에서 예측 대신 말뭉치 전체 동시출현을 회귀하는 방식을 비교한다.'
    - target: concept.glove
      reason: '다음에는 Skip-gram에서 반대 방향의 학습 쌍을 보고, GloVe에서 예측 대신 말뭉치 전체 동시출현을 회귀하는 방식을 비교한다.'
---
# CBOW

> [!note] 학습 안내
> **난이도:** 중급<br>
> **선수 지식:** [[concept.단어-임베딩|단어 임베딩]]<br>
> **읽고 나면:** CBOW가 주변 문맥 벡터를 모아 중심 단어를 예측하는 흐름을 설명하고, Skip-gram과의 방향 차이 및 정적 표현의 한계를 구분할 수 있다.

## 1단계 — 먼저 잡을 핵심

CBOW(Continuous Bag of Words)는 [[Word2Vec]]의 두 대표 구조 중 하나로, 주변 문맥 단어들의 표현을 모아 중심 단어를 예측한다. `the cat sat on the mat`에서 `sat`을 중심으로 좌우 두 칸을 쓰면 `the`, `cat`, `on`, `the`가 입력이 된다.

## 2단계 — 작동 원리

### 문맥에서 중심 단어까지

CBOW는 중심 단어 주변의 여러 문맥 단어를 입력으로 모아 하나의 표현을 만들고, 그 표현으로 빠진 중심 단어를 예측한다. 한 번의 학습 사건에서 여러 문맥을 함께 쓰므로 문맥 내부의 어순은 집계 과정에서 사라진다.

## 3단계 — 기술과 근거

### 계산

문맥 위치 집합을 $C_t$라 할 때 투사 표현은 단순화해 다음처럼 쓸 수 있다.

$$
\mathbf h_t=\frac{1}{|C_t|}\sum_{j\in C_t}\mathbf v_{w_j}
$$

그 뒤 hierarchical softmax나 negative sampling 같은 출력 방식으로 중심 단어 $w_t$를 맞힌다. 여러 입력 벡터를 합·평균하므로 단어별 완전 연결 은닉층보다 계산이 작지만, 이 집계 자체는 문맥 내부 어순을 보존하지 않는다.

### Skip-gram과의 차이

[[Skip-gram]]이 중심 단어 하나에서 여러 문맥 쌍을 만드는 반면 CBOW는 여러 문맥을 한 번에 집계해 중심 단어 한 개를 예측한다. 초기 연구는 CBOW가 빠르고 Skip-gram이 희귀어에 더 유리하다고 보고했지만, 실제 차이는 구현·자료·창·음성 표본·평가에 좌우된다.

## 검증과 한계

### 해석 범위

비슷한 주변 단어로 예측되는 중심 단어는 비슷한 벡터를 얻을 수 있다. 그러나 이 목적은 사전적 의미·품사·감정을 따로 표지하지 않는다. 평균된 국소 문맥에서 예측에 유용한 분포 특성을 학습하며, 유의성과 주제 연관·빈도 효과가 함께 나타날 수 있다.

## 학습 확인

1. CBOW는 문맥 단어와 중심 단어 가운데 무엇을 입력과 예측 대상으로 삼는가?
2. 여러 문맥 벡터를 하나의 투사 표현으로 만든 뒤 중심 단어를 맞히는 계산은 어떤 순서로 이루어지는가?
3. CBOW 벡터가 사전적 의미나 문맥 어순을 완전하게 나타낸다고 볼 수 없는 이유는 무엇인가?

다음에는 [[Skip-gram]]에서 반대 방향의 학습 쌍을 보고, [[GloVe]]에서 예측 대신 말뭉치 전체 동시출현을 회귀하는 방식을 비교한다.

### 다음 문서

- [[concept.skip-gram|Skip-gram]] — 다음에는 Skip-gram에서 반대 방향의 학습 쌍을 보고, GloVe에서 예측 대신 말뭉치 전체 동시출현을 회귀하는 방식을 비교한다.
- [[concept.glove|GloVe]] — 다음에는 Skip-gram에서 반대 방향의 학습 쌍을 보고, GloVe에서 예측 대신 말뭉치 전체 동시출현을 회귀하는 방식을 비교한다.

## 출처
- [[043_Word2Vec와 효율적 정적 단어 임베딩]]
- Tomas Mikolov·Kai Chen·Greg Corrado·Jeffrey Dean, [Efficient Estimation of Word Representations in Vector Space](https://arxiv.org/abs/1301.3781), 2013, §3과 Fig. 1.
- Omer Levy·Yoav Goldberg·Ido Dagan, [Improving Distributional Similarity with Lessons Learned from Word Embeddings](https://aclanthology.org/Q15-1016/), TACL 3, 2015, pp. 211–225.

## 관련 항목

- [[concept.skip-gram|Skip-gram]]
- [[concept.glove|GloVe]]
- [[concept.단어-임베딩|단어 임베딩]]
- [[source.043|Word2Vec와 효율적 정적 단어 임베딩]]
- [[concept.word2vec|Word2Vec]]
- [[concept.말뭉치-기반-학습|말뭉치 기반 학습]]
