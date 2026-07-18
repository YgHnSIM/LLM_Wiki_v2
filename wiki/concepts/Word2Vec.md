---
schema_version: 2
id: concept.word2vec
page_type: concept
title: Word2Vec
aliases:
  - word2vec
  - 워드투벡
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
  - 'raw/050_Subword Tokenization and FastText Character N-gram Embeddings for Robust Word Representations.ko.md'
  - 'raw/050_Subword Tokenization and FastText Character N-gram Embeddings for Robust Word Representations.commentary.ko.md'
evidence:
  - source_id: mikolov-et-al-2013-word-representations
    locator: 'arXiv:1301.3781, §§1–4의 계산 목표·CBOW·Skip-gram·유추 평가'
    relation: supports
  - source_id: mikolov-et-al-2013-negative-sampling
    locator: 'NeurIPS 2013, §§2–4의 hierarchical softmax·negative sampling·subsampling·phrase 표현'
    relation: supports
  - source_id: levy-goldberg-2014-sgns-pmi
    locator: 'NeurIPS 2014, §§2–4의 SGNS 목적과 shifted PMI 분해'
    relation: contextualizes
  - source_id: bojanowski-et-al-2017-fasttext
    locator: 'TACL 5, §§3.1–3.2의 Skip-gram 입력을 character n-gram 합으로 바꾼 확장'
    relation: supplements
related:
  - source.043
  - concept.cbow
  - concept.skip-gram
  - concept.단어-임베딩
  - concept.신경-확률-언어-모형
  - concept.잠재-의미-분석
  - concept.말뭉치-기반-학습
  - source.035
  - source.031
---
# Word2Vec

Word2Vec은 대규모 말뭉치의 국소 문맥 예측으로 정적 [[단어 임베딩]]을 효율적으로 학습하는 모델·도구군이다. 2013년 Mikolov 등의 연구가 [[CBOW]]와 [[Skip-gram]]을 제시했고, 계층적 softmax 또는 후속 부정 샘플링을 결합했다.

## 구성 선택

Word2Vec을 하나의 고정된 3층 신경망과 동일시하지 않는다.

- **예측 방향**: CBOW는 문맥→중심 단어, Skip-gram은 중심 단어→문맥이다.
- **출력 계산**: 초기 논문의 hierarchical softmax와 후속 negative sampling은 목적과 정규화가 다르다.
- **자료 처리**: 최대 문맥 창, 빈출어 subsampling, 최소 빈도 cutoff와 phrase 탐지가 학습 쌍을 바꾼다.
- **산출물**: 보통 word type마다 하나의 고정 벡터를 downstream 유사도·특징으로 사용한다.

## SGNS 목적

Skip-gram with negative sampling은 관측된 중심–문맥 쌍의 점곱을 높이고 잡음 분포에서 뽑은 $k$개 문맥과의 점곱을 낮춘다.

$$
\log\sigma(\mathbf w\cdot\mathbf c)
+\sum_{i=1}^{k}\log\sigma(-\mathbf w\cdot\mathbf c_i)
$$

중심 단어와 문맥에는 서로 다른 벡터 행렬이 있다. 학습 뒤에는 흔히 중심 단어 행렬만 사용하지만, 목적 자체는 최종 단어 벡터 사이의 모든 쌍별 거리를 직접 지정하지 않는다.

## 분포 통계와의 관계

Levy와 Goldberg는 충분한 차원에서 최적화된 SGNS 점곱이 대략 $PMI(w,c)-\log k$에 해당함을 보였다. 즉 Word2Vec은 동시출현 계수와 완전히 단절된 “의미 발견 신경망”이 아니라 단어–문맥 연관 통계를 확률적 gradient로 저차원에 압축하는 방법으로 해석할 수 있다.

## 유추와 유사도

`king−man+woman` 벡터에 가까운 단어를 찾는 3CosAdd형 평가는 관계별 차이가 공간에서 얼마나 일정한지 측정한다. 일부 의미·통사 관계에서 높은 결과를 냈지만 말뭉치·빈도·하이퍼파라미터·검색 규칙에 민감하다. 유추 성공을 문장 이해, 사실 추론 또는 인간의 개념 구조 전체와 동일시하지 않는다.

## FastText 확장

FastText는 Skip-gram with negative sampling의 중심–문맥 목적을 유지하고 중심 단어 입력 벡터를 문자 n-gram 벡터의 합으로 바꿨다. 이는 Word2Vec이 스스로 제공한 OOV 기능이 아니라 2017년 출판된 후속 매개변수화이며, 문자 조각을 여러 token position으로 만드는 BPE와도 다르다.

## 한계

- word type당 하나의 벡터여서 다의성을 문맥별로 분리하지 못한다.
- 기본 고정 어휘는 OOV를 구성할 수 없고 희귀어 추정은 불안정하다.
- 국소 창과 bag/쌍 예측은 긴 통사·담화 구조를 직접 나타내지 않는다.
- 유사도에는 유의성뿐 아니라 주제 연관, 반의 관계, 빈도와 말뭉치 편향이 섞인다.
- 추가 자료로 기존 벡터를 계속 훈련할 수는 있지만 새 어휘·공간 안정성·재현성은 별도 관리가 필요하다.

## 출처

- [[043_Word2Vec와 효율적 정적 단어 임베딩]]
- Tomas Mikolov 외, [Efficient Estimation of Word Representations in Vector Space](https://arxiv.org/abs/1301.3781), 2013, §§1–4.
- Tomas Mikolov 외, [Distributed Representations of Words and Phrases and their Compositionality](https://proceedings.neurips.cc/paper_files/paper/2013/hash/9aa42b31882ec039965f3c4923ce901b-Abstract.html), NeurIPS 2013, §§2–4.
- Omer Levy·Yoav Goldberg, [Neural Word Embedding as Implicit Matrix Factorization](https://proceedings.neurips.cc/paper_files/paper/2014/hash/b78666971ceae55a8e87efb7cbfd9ad4-Abstract.html), NeurIPS 2014, §§2–4.
- Piotr Bojanowski·Edouard Grave·Armand Joulin·Tomas Mikolov, [Enriching Word Vectors with Subword Information](https://aclanthology.org/Q17-1010/), TACL 5, 2017, §§3.1–3.2.

## 관련 항목

- [[043_Word2Vec와 효율적 정적 단어 임베딩]]
- [[CBOW]]
- [[Skip-gram]]
- [[단어 임베딩]]
- [[신경 확률 언어 모형]]
- [[잠재 의미 분석]]
- [[말뭉치 기반 학습]]
- [[035_신경 확률 언어 모형과 분산 단어 표현]]
- [[031_잠재 의미 분석과 확률적 잠재 의미 색인]]
