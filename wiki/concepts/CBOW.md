---
schema_version: 2
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
updated: '2026-07-18'
lifecycle: active
verification: verified
artifacts:
  - 'raw/043_Word2Vec Dense Word Embeddings and Neural Language Representations.ko.md'
  - 'raw/043_Word2Vec Dense Word Embeddings and Neural Language Representations.commentary.ko.md'
evidence:
  - source_id: mikolov-et-al-2013-word-representations
    locator: 'arXiv:1301.3781, §3과 Fig. 1의 continuous bag-of-words 구조·계산량'
    relation: supports
  - source_id: levy-goldberg-dagan-2015-distributional-similarity
    locator: 'TACL 3, pp. 211–225, §2의 CBOW·Skip-gram을 포함한 분포 모형 구분과 §§4–6의 설정별 평가'
    relation: contextualizes
related:
  - source.043
  - concept.word2vec
  - concept.skip-gram
  - concept.단어-임베딩
  - concept.말뭉치-기반-학습
---
# CBOW

CBOW(Continuous Bag of Words)는 [[Word2Vec]]의 두 대표 구조 중 하나로, 주변 문맥 단어들의 표현을 모아 중심 단어를 예측한다. `the cat sat on the mat`에서 `sat`을 중심으로 좌우 두 칸을 쓰면 `the`, `cat`, `on`, `the`가 입력이 된다.

## 계산

문맥 위치 집합을 $C_t$라 할 때 투사 표현은 단순화해 다음처럼 쓸 수 있다.

$$
\mathbf h_t=\frac{1}{|C_t|}\sum_{j\in C_t}\mathbf v_{w_j}
$$

그 뒤 hierarchical softmax나 negative sampling 같은 출력 방식으로 중심 단어 $w_t$를 맞힌다. 여러 입력 벡터를 합·평균하므로 단어별 완전 연결 은닉층보다 계산이 작지만, 이 집계 자체는 문맥 내부 어순을 보존하지 않는다.

## 해석 범위

비슷한 주변 단어로 예측되는 중심 단어는 비슷한 벡터를 얻을 수 있다. 그러나 이 목적은 사전적 의미·품사·감정을 따로 표지하지 않는다. 평균된 국소 문맥에서 예측에 유용한 분포 특성을 학습하며, 유의성과 주제 연관·빈도 효과가 함께 나타날 수 있다.

## Skip-gram과의 차이

[[Skip-gram]]이 중심 단어 하나에서 여러 문맥 쌍을 만드는 반면 CBOW는 여러 문맥을 한 번에 집계해 중심 단어 한 개를 예측한다. 초기 연구는 CBOW가 빠르고 Skip-gram이 희귀어에 더 유리하다고 보고했지만, 실제 차이는 구현·자료·창·음성 표본·평가에 좌우된다.

## 출처

- [[043_Word2Vec와 효율적 정적 단어 임베딩]]
- Tomas Mikolov·Kai Chen·Greg Corrado·Jeffrey Dean, [Efficient Estimation of Word Representations in Vector Space](https://arxiv.org/abs/1301.3781), 2013, §3과 Fig. 1.
- Omer Levy·Yoav Goldberg·Ido Dagan, [Improving Distributional Similarity with Lessons Learned from Word Embeddings](https://aclanthology.org/Q15-1016/), TACL 3, 2015, pp. 211–225.

## 관련 항목

- [[043_Word2Vec와 효율적 정적 단어 임베딩]]
- [[Word2Vec]]
- [[Skip-gram]]
- [[단어 임베딩]]
- [[말뭉치 기반 학습]]
