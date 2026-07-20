---
schema_version: 2
id: source.043
page_type: source
title: Word2Vec와 효율적 정적 단어 임베딩
aliases:
  - 043_Word2Vec Dense Word Embeddings and Neural Language Representations
  - Word2Vec Dense Word Embeddings and Neural Language Representations
tags:
  - type/source
  - domain/ai
  - domain/nlp
  - domain/machine-learning
created: '2026-07-18'
updated: '2026-07-21'
lifecycle: active
verification: verified
artifacts:
  - 'raw/043_Word2Vec Dense Word Embeddings and Neural Language Representations.ko.md'
  - 'raw/043_Word2Vec Dense Word Embeddings and Neural Language Representations.commentary.ko.md'
evidence:
  - source_id: mikolov-et-al-2013-word-representations
    locator: 'arXiv:1301.3781, 초록과 §§1–4, 특히 §2의 계산 복잡도, §3의 CBOW·Skip-gram, §4의 구문·의미 유추 평가'
    relation: supports
  - source_id: mikolov-yih-zweig-2013-linguistic-regularities
    locator: 'NAACL-HLT 2013, pp. 746–751, 특히 §§1–3의 관계별 벡터 차이와 §§5–7의 통사·의미 관계 평가'
    relation: supports
  - source_id: mikolov-et-al-2013-negative-sampling
    locator: 'NeurIPS 2013, pp. 3111–3119, 특히 §§2.1–2.3의 계층적 softmax·negative sampling·빈출어 subsampling과 §4의 phrase 평가'
    relation: supports
  - source_id: levy-goldberg-2014-sgns-pmi
    locator: 'NeurIPS 2014, pp. 2177–2185, 특히 §§2–3의 SGNS 목적과 shifted PMI 행렬 분해, §4의 SVD 비교'
    relation: contextualizes
  - source_id: levy-goldberg-dagan-2015-distributional-similarity
    locator: 'TACL 3, pp. 211–225, 특히 §§2–3의 문맥·가중·하이퍼파라미터와 §§4–6의 유사도·유추 비교'
    relation: contextualizes
related:
  - concept.word2vec
  - concept.cbow
  - concept.skip-gram
  - concept.단어-임베딩
  - concept.신경-확률-언어-모형
  - concept.잠재-의미-분석
  - concept.말뭉치-기반-학습
  - concept.통계적-자연어-처리
  - source.035
  - source.031
  - analysis.n-gram에서-llm으로
---
# Word2Vec와 효율적 정적 단어 임베딩

043 raw는 2013년 [[Word2Vec]]이 처음으로 단어의 의미를 수치에 담고, 얕은 신경망이 인간처럼 언어를 이해하게 했다고 설명한다. 공개 문서는 Mikolov 등의 세 논문과 후속 분석을 기준으로 **밀집 표현의 선행 역사**, [[CBOW]]·[[Skip-gram]]의 실제 예측 구조, 계층적 softmax와 부정 샘플링의 도입 시기, 벡터 유추 평가의 범위를 복원한다.

Word2Vec의 핵심 기여는 [[단어 임베딩]] 자체의 발명이 아니다. Bengio 등의 2003년 [[신경 확률 언어 모형]]과 그 이전 분포 의미론도 연속 단어 표현을 다뤘다. 2013년의 변화는 복잡한 신경 언어 모형보다 훨씬 단순한 국소 문맥 예측 과제와 효율적 출력 계산을 결합해, 수십억 단어에서 고품질 정적 벡터를 빠르게 학습하고 배포한 데 있다.

## 한 모델이 아니라 방법군

“Word2Vec”은 흔히 하나의 3층 신경망으로 설명되지만, 2013년 연구는 여러 선택의 조합이다.

| 입력과 예측 방향 | 출력·학습 방식 | 후속 개선 |
| --- | --- | --- |
| CBOW: 여러 문맥에서 중심 단어 예측 | 계층적 softmax | 빈출어 subsampling |
| Skip-gram: 중심 단어에서 여러 문맥 예측 | 계층적 softmax 또는 negative sampling | phrase 탐지·학습 |

첫 arXiv 논문은 CBOW와 Skip-gram을 소개하고, 계산량을 은닉층 크기·어휘 크기·문맥 길이의 함수로 비교했다. 16억 단어 자료에서도 하루 안에 표현을 학습할 수 있다고 보고했지만, 이 결과는 당시의 특정 모델·하드웨어·어휘·차원 설정에 대한 것이다. “모든 대규모 임베딩을 보통 컴퓨터에서 몇 시간 안에 훈련한다”는 보편적 보장은 아니다.

## CBOW: 문맥을 모아 중심 단어 예측

[[CBOW]]는 창 안의 문맥 단어 벡터를 합하거나 평균해 가운데 단어를 예측한다. 예를 들어 `the cat sat on the mat`에서 중심이 `sat`이고 창이 좌우 두 칸이면 `the`, `cat`, `on`, `the`가 입력이 된다. “bag”이라는 이름처럼 이 집계만으로는 문맥 단어의 내부 순서를 구분하지 않는다.

원 논문의 투사층에는 dense matrix multiplication이 없고, 여러 입력 벡터를 공유 투사층에서 평균한다. 이전 feed-forward NPLM에서 비선형 은닉층 계산을 제거한 단순화가 속도의 중요한 원인이다. CBOW가 언제나 Skip-gram보다 빠르거나 정확하다는 보편 명제보다 말뭉치 빈도, 구현, 출력 목적과 평가에 따른 차이를 기록해야 한다.

## Skip-gram: 중심 단어에서 문맥 쌍 만들기

[[Skip-gram]]은 중심 단어로 일정 창 안의 각 문맥 단어를 예측한다. 중심 `sat`에서 `the`, `cat`, `on`, `the`로 가는 별도 학습 쌍을 만드는 식이다. 실제 구현은 창의 최대 크기 안에서 거리를 무작위로 줄일 수 있으므로, 매번 모든 이웃을 동일하게 사용한다고 단정하지 않는다.

한 희귀 단어 출현이 여러 중심–문맥 쌍을 만들기 때문에 초기 논문은 Skip-gram이 드문 단어의 표현에 유리하다고 보고했다. 그러나 관측 자체가 매우 적으면 벡터 추정은 여전히 불안정하다. 훈련 어휘 밖 단어에는 벡터가 없고, 형태를 조합해 처음 보는 단어를 만드는 능력은 후대 FastText 같은 subword 방법의 별도 기여다.

## 계층적 softmax와 부정 샘플링

raw는 부정 샘플링을 Word2Vec 최초 논문의 결정적 혁신처럼 묶지만 연대를 나눠야 한다. 2013년 1월 논문은 이진 Huffman tree의 경로로 단어 확률을 계산하는 **계층적 softmax**를 주요 구조에 사용했다. **Negative sampling**은 같은 해 후속 NeurIPS 논문에서 빈출어 subsampling·phrase 표현과 함께 제안되었다.

부정 샘플링 Skip-gram(SGNS)의 한 양성 단어–문맥 쌍 $(w,c)$에 대한 목적은 다음처럼 쓸 수 있다.

$$
\log\sigma(\mathbf w\cdot\mathbf c)
+\sum_{i=1}^{k}\log\sigma(-\mathbf w\cdot\mathbf c_i)
$$

$c_i$는 잡음 분포에서 뽑은 음성 문맥이다. 원 후속 논문은 경험적 unigram 빈도의 $3/4$제곱에 비례하는 분포가 여러 평가에서 더 좋았다고 보고했다. 예시 하나마다 전체 어휘를 정규화하지 않고 $k$개 음성 표본만 처리하므로 학습 쌍당 주 비용은 어휘 전체가 아니라 $k$와 벡터 차원에 좌우된다.

이 목적에는 단어 벡터와 문맥 벡터라는 두 행렬이 있다. 관측된 `cat–sat`의 점곱을 높이고 표본으로 뽑힌 음성 쌍의 점곱을 낮추는 것이지, 모든 미관측 단어 쌍을 직접 멀리 보내거나 `cat`과 `sat`의 최종 단어 벡터끼리 반드시 가까워지도록 하는 단순 대칭 목적은 아니다.

## 예측 기반과 계수 기반의 경계

raw는 거대한 동시출현 행렬을 사실상 쓸 수 없는 과거 방법으로 두고 Word2Vec을 완전히 다른 해법으로 제시한다. 그러나 희소 행렬은 0을 저장하지 않고 PMI 같은 가중치와 절단 SVD를 사용할 수 있다. [[잠재 의미 분석]]은 이미 1980년대 말 희소 용어–문서 행렬에서 저차원 표현을 만들었다.

Levy와 Goldberg는 SGNS가 단어–문맥 행렬의 **이동된 PMI**를 암묵적으로 분해한다는 것을 보였다.

$$
\mathbf w\cdot\mathbf c\approx PMI(w,c)-\log k
$$

이 결과는 Word2Vec의 확률적 gradient 학습과 전통적 동시출현 계수 사이의 연결을 보여 준다. 후속 비교에서는 문맥 정의, 음성 표본, 빈출어 subsampling, PMI 가중, 벡터 정규화 같은 설계 선택을 맞추면 예측·계수 방법의 성능 차이가 크게 줄었다. 알고리즘 이름만으로 유사도·유추 성능을 설명할 수 없다.

## 벡터 유추가 실제로 보여 준 것

Mikolov·Yih·Zweig의 NAACL 논문은 연속 공간에서 관계별 벡터 차이를 관찰했다. 통사 유추 자료에서 RNN word vector가 거의 40%를 맞혔고, SemEval-2012 관계 유사도 과제에서 비교 시스템보다 높은 결과를 보고했다. 같은 해 Word2Vec 논문은 더 큰 자료와 단순 구조에서 의미·통사 유추 정확도를 평가했다.

유명한 계산은 다음 형태다.

$$
\operatorname*{argmax}_{x\notin\{a,b,c\}}
\cos(\mathbf x,\mathbf b-\mathbf a+\mathbf c)
$$

`king−man+woman≈queen`은 이 검색에서 가까운 이웃이 나오는 대표 사례다. 등식처럼 항상 성립하거나 각 차원에 “왕권”·“성별”이 독립 저장되었다는 뜻은 아니다. 결과는 말뭉치, 어휘 cutoff, 빈도, 차원, 문맥 창, 정규화, 검색식과 후보 제외 규칙에 민감하다. 일부 관계의 선형 규칙성은 유용한 진단이지만 인간과 같은 개념 이해·사실 추론·조합 의미의 증거로 확대하지 않는다.

## 정적 단어 표현의 범위

Word2Vec의 최종 단어 벡터는 **word type당 하나인 정적 표현**이다. `bank`가 금융기관·강둑·비행기의 선회를 뜻해도 한 점에 여러 문맥의 통계가 섞인다. 국소 창은 가까운 분포 패턴을 포착하지만 문장 구조, 장거리 의존성, 담화와 문서 전체의 의미를 직접 계산하지 않는다.

가까운 벡터는 유의어뿐 아니라 반의어, 주제상 관련된 단어, 기능적으로 함께 쓰이는 단어일 수 있다. 말뭉치에 있는 사회적 편향과 시기·분야별 사용 차이도 공간에 들어간다. 벡터 유사성을 “참인 지식”이나 감정 극성·품사·개체 유형을 자동으로 완벽하게 분리한 표현과 동일시하지 않는다.

새 단어 문제도 남는다. 기존 어휘와 같은 토큰은 추가 말뭉치로 계속 학습할 수 있는 구현이 있으므로 “Word2Vec은 점진 갱신이 원리적으로 불가능하다”는 raw의 단정은 틀리다. 다만 새 어휘 항목을 추가하면 초기화·어휘 관리·기존 공간의 이동 문제가 생기고, 처음 보는 문자열을 구성적으로 표현하는 기능은 기본 Word2Vec에 없다.

## 실제 영향과 현대 모델의 경계

Word2Vec 벡터는 분류·개체명 인식·검색·추천 등 여러 과제의 입력 특징이나 초기값으로 널리 사용되었다. 하지만 특정 과제의 성능 향상은 벡터 결합법, 지도 자료, 말뭉치와 기준선에 따라 별도 검증해야 한다. “몇 달 안에 거의 모든 NLP 과제를 크게 개선했다”, “검색 엔진과 번역 시스템이 직접 채택했다”는 제품·성능 서사는 이 세 핵심 논문만으로 입증되지 않는다.

현대 Transformer도 이산 token ID를 연속 lookup vector로 바꾸지만, 이후 self-attention과 깊은 비선형 층에서 위치마다 문맥 의존 hidden state를 계산한다. 기본 Word2Vec은 보통 단어 단위 고정 어휘·국소 창·정적 최종 벡터를 사용한다. 분포 자료에서 표현을 사전 학습하고 재사용하는 관행의 확산에는 크게 기여했지만, BERT·GPT의 모델 전체 사전학습–미세조정, subword tokenization, contextual representation을 Word2Vec의 직접 확대판으로 기록하지 않는다.

## 검증 정정

- **Word2Vec이 단어 임베딩을 발명**: 분포 의미론·LSA·신경 언어 모형의 선행 표현이 있었다. 2013년의 핵심은 단순 구조와 대규모 효율이다.
- **2013년 한 논문이 CBOW·Skip-gram·negative sampling을 동시에 제안**: 첫 논문과 후속 NeurIPS 논문을 구분한다.
- **훈련이 인간처럼 읽고 단어의 참된 의미를 이해**: 국소 동시출현을 예측해 분포적 연관을 학습한다.
- **SGNS가 양성 단어 벡터를 직접 가깝게, 모든 음성 단어를 멀게 함**: 중심·문맥 두 벡터 집합의 관측·표본 점곱을 최적화한다.
- **동시출현 행렬은 제곱 크기 때문에 비실용적**: 희소 저장·가중·저랭크 분해가 가능하며 SGNS도 shifted PMI와 연결된다.
- **벡터 산술은 보편적이고 구조적 의미 이해를 입증**: 특정 관계·자료·평가 설정에 민감한 최근접 이웃 결과다.
- **negative sampling 비용이 매 예시마다 어휘 크기에 비례**: 소수 음성 표본을 사용해 전체 어휘 정규화를 피한다.
- **Word2Vec은 새 데이터로 점진 학습할 수 없음**: 구현상 추가 학습은 가능하지만 새 어휘와 공간 안정성은 별도 문제다.
- **희귀어·OOV·형태론 문제를 해결**: 희귀어는 여전히 자료가 부족하고 기본 모형은 처음 보는 word type을 구성하지 못한다.
- **GloVe·FastText·ELMo·BERT·GPT가 하나의 직접 계보**: 공통 문제와 후속 비교는 가능하지만 각 방법은 별도 목적·구조·문헌을 가진다.

## 핵심 문장

- Word2Vec은 CBOW·Skip-gram과 여러 출력·sampling 선택을 묶은 효율적 정적 단어 표현 방법군이다.
- 최초 논문은 계층적 softmax를 사용했고 negative sampling·빈출어 subsampling은 같은 해 후속 논문에서 도입되었다.
- SGNS는 관측·표본 단어–문맥 점곱을 학습하며 shifted PMI 행렬의 암묵적 분해로 해석할 수 있다.
- 벡터 유추는 일부 언어 관계의 기하적 규칙성을 측정하지만 인간과 같은 의미 이해를 보장하지 않는다.
- 역사적 중요성은 밀집 단어 벡터를 대규모로 빠르게 학습하고 재사용하는 관행을 확산한 데 있다.

## 출처

- Tomas Mikolov·Kai Chen·Greg Corrado·Jeffrey Dean, [Efficient Estimation of Word Representations in Vector Space](https://arxiv.org/abs/1301.3781), 2013, §§1–4.
- Tomas Mikolov·Wen-tau Yih·Geoffrey Zweig, [Linguistic Regularities in Continuous Space Word Representations](https://aclanthology.org/N13-1090/), NAACL-HLT 2013, pp. 746–751.
- Tomas Mikolov·Ilya Sutskever·Kai Chen·Greg Corrado·Jeffrey Dean, [Distributed Representations of Words and Phrases and their Compositionality](https://proceedings.neurips.cc/paper_files/paper/2013/hash/9aa42b31882ec039965f3c4923ce901b-Abstract.html), NeurIPS 2013, pp. 3111–3119.
- Omer Levy·Yoav Goldberg, [Neural Word Embedding as Implicit Matrix Factorization](https://proceedings.neurips.cc/paper_files/paper/2014/hash/b78666971ceae55a8e87efb7cbfd9ad4-Abstract.html), NeurIPS 2014, pp. 2177–2185.
- Omer Levy·Yoav Goldberg·Ido Dagan, [Improving Distributional Similarity with Lessons Learned from Word Embeddings](https://aclanthology.org/Q15-1016/), TACL 3, 2015, pp. 211–225.
- 프로젝트 번역·검토 출발 자료: [Word2Vec Dense Word Embeddings and Neural Language Representations](https://mbrenndoerfer.com/writing/word2vec-neural-word-embeddings)
- 프로젝트 보존 자료: `raw/043_Word2Vec Dense Word Embeddings and Neural Language Representations.ko.md`, `raw/043_Word2Vec Dense Word Embeddings and Neural Language Representations.commentary.ko.md`.

## 관련 항목

- [[Word2Vec]]
- [[CBOW]]
- [[Skip-gram]]
- [[단어 임베딩]]
- [[신경 확률 언어 모형]]
- [[잠재 의미 분석]]
- [[말뭉치 기반 학습]]
- [[통계적 자연어 처리]]
- [[035_신경 확률 언어 모형과 분산 단어 표현]]
- [[031_잠재 의미 분석과 확률적 잠재 의미 색인]]
- [[N-gram에서 LLM으로]]
