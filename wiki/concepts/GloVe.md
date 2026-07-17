---
schema_version: 2
id: concept.glove
page_type: concept
title: GloVe
aliases:
  - Global Vectors for Word Representation
  - 글로벌 벡터
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
  - 'raw/044_GloVe and Adam Optimizer Global Word Embeddings and Adaptive Optimization.ko.md'
  - 'raw/044_GloVe and Adam Optimizer Global Word Embeddings and Adaptive Optimization.commentary.ko.md'
evidence:
  - source_id: pennington-et-al-2014-glove
    locator: 'EMNLP 2014, pp. 1532–1543, 특히 §§2–3의 비율·목적 함수와 §§4–4.6의 평가'
    relation: supports
  - source_id: levy-goldberg-2014-sgns-pmi
    locator: 'NeurIPS 2014, §§2–4의 SGNS·shifted PMI와 행렬 분해 비교'
    relation: contextualizes
  - source_id: levy-goldberg-dagan-2015-distributional-similarity
    locator: 'TACL 3, pp. 211–225의 예측·계수 방법 설계 선택 통제 비교'
    relation: contextualizes
related:
  - source.044
  - concept.단어-임베딩
  - concept.word2vec
---
# GloVe

GloVe(Global Vectors for Word Representation)는 말뭉치 전체에 누적한 단어–문맥 동시출현 계수의 로그를 가중 저랭크 회귀로 근사해 정적 [[단어 임베딩]]을 학습하는 방법이다. Pennington·Socher·Manning이 2014년 발표했다.

## 입력 통계

$X_{ij}$는 문맥 단어 $j$가 중심 단어 $i$의 정해진 국소 창에 나타난 가중 횟수다. “전역”은 이 국소 사건을 말뭉치 전체에 합산한다는 뜻이며, 문서 전체의 어순·담화를 하나의 입력으로 처리한다는 뜻이 아니다. 학습에는 $X_{ij}>0$인 희소 항만 사용한다.

## 가중 log-bilinear 목적

$$
J=\sum_{i,j}f(X_{ij})
(\mathbf w_i^T\tilde{\mathbf w}_j+b_i+\tilde b_j-\log X_{ij})^2
$$

단어 벡터·문맥 벡터의 내적과 두 편향이 로그 동시출현을 근사한다. 가중 함수는 작은 계수의 영향을 낮추고 큰 계수에 상한을 둔다. 대표 설정은 $x_{max}=100$, $\alpha=3/4$였지만 말뭉치·과제 전반의 최적값으로 증명된 것은 아니다.

## 조건부확률 비율

논문은 두 중심 단어 $i,j$와 탐색 단어 $k$ 사이의 $P(k|i)/P(k|j)$가 $k$와의 선택적 연관을 드러낸다고 보았다. 이 비율의 로그가 벡터 차이와 탐색 벡터의 내적에 대응하도록 함수 형태를 제약해 목적을 유도했다. 원시 횟수의 단순 SVD나 PMI를 그대로 분해한 것과는 다르다.

## 두 벡터와 평가

중심 $\mathbf w$와 문맥 $\tilde{\mathbf w}$ 두 공간을 학습하고, 논문 평가는 대체로 둘을 합한 벡터를 사용했다. 특정 유추·유사도·NER 조건에서 강한 결과를 얻었지만 모든 NLP 과제와 자료에서 [[Word2Vec]]보다 우월하다고 일반화하지 않는다.

## Word2Vec과의 관계

[[Skip-gram]]은 국소 단어–문맥 쌍을 반복 표집해 예측 목적을 최적화하고 GloVe는 집계된 비영 계수에 가중 회귀를 수행한다. 그러나 SGNS도 shifted PMI 행렬 분해로 해석되므로 “Word2Vec은 국소 정보만, GloVe만 전역 통계”라는 구분은 과도하다. 문맥 정의·subsampling·가중·차원·평가 선택을 함께 비교해야 한다.

## 한계

- word type마다 고정 벡터 하나여서 다의성을 문맥별로 표현하지 못한다.
- 고정 어휘 밖 문자열을 구성하지 못하며 희귀어 계수도 불안정하다.
- 동시출현 공간은 유의어·반의어·주제 연관과 말뭉치 편향을 섞을 수 있다.
- 희소 행렬과 두 벡터·최적화 상태를 관리해야 하며 새 자료 추가 시 계수·어휘와 재최적화를 관리해야 한다.
- 입력 계수가 보인다는 사실이 저차원 벡터 각 차원의 고유한 의미 해석을 보장하지 않는다.

## 출처

- [[044_GloVe와 Adam의 서로 다른 2014년 전환]]
- Jeffrey Pennington·Richard Socher·Christopher D. Manning, [GloVe: Global Vectors for Word Representation](https://aclanthology.org/D14-1162/), EMNLP 2014, pp. 1532–1543.
- Omer Levy·Yoav Goldberg, [Neural Word Embedding as Implicit Matrix Factorization](https://proceedings.neurips.cc/paper_files/paper/2014/hash/b78666971ceae55a8e87efb7cbfd9ad4-Abstract.html), NeurIPS 2014.
- Omer Levy·Yoav Goldberg·Ido Dagan, [Improving Distributional Similarity with Lessons Learned from Word Embeddings](https://aclanthology.org/Q15-1016/), TACL 3, 2015.

## 관련 항목

- [[044_GloVe와 Adam의 서로 다른 2014년 전환]]
- [[단어 임베딩]]
- [[Word2Vec]]
