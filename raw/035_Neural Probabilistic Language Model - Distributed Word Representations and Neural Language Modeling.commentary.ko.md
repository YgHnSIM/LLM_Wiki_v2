---
source_file: "035_Neural Probabilistic Language Model - Distributed Word Representations and Neural Language Modeling.md"
translation_file: "035_Neural Probabilistic Language Model - Distributed Word Representations and Neural Language Modeling.ko.md"
commentary_type: "해설"
source_stem: "035_Neural Probabilistic Language Model - Distributed Word Representations and Neural Language Modeling"
order_prefix: "035"
topic: "신경 확률 언어 모형과 분산 단어 표현"
period: "1980년대~2010년대"
tags:
  - LLM
  - NLP
  - AI-history
  - commentary
---

# 신경 확률 언어 모형과 분산 단어 표현 해설

## 1. 한눈에 보기

- 핵심 주제: Bengio·Ducharme·Vincent·Jauvin의 2003년 모형은 앞선 고정 길이 단어들의 벡터를 이어 붙여 feed-forward 신경망으로 다음 단어 분포를 예측하고, lookup table과 확률 함수를 공동 학습했다.
- 등장 배경: n-gram의 정확한 문맥 표는 어휘와 차수가 커질수록 희소해졌다. 기존 smoothing·back-off는 강력했지만 서로 비슷한 단어가 다른 문맥에서 제공하는 증거를 공유하기 어려웠다.
- 가장 중요한 아이디어: 단어마다 $m$차원 벡터 $C(w)$를 두고, 이 벡터 공간에서 가까운 단어로 이루어진 문장은 관측 문장 근처의 확률도 함께 높아지도록 부드러운 함수를 학습한다.
- 이후 LLM/NLP에 남긴 영향: 학습된 입력 임베딩과 다음 토큰 확률을 하나의 가능도 목적에서 함께 최적화하는 설계는 현대 언어 모형의 핵심 구성 요소다. 다만 2003년 모형은 고정 창·단일 word type 벡터·전체 어휘 softmax를 쓰는 얕은 MLP다.

> 이 문서는 `035_Neural Probabilistic Language Model - Distributed Word Representations and Neural Language Modeling.md`의 번역문을 이해하기 위한 해설입니다. 원문의 후대 계보와 능력 서술을 2003년 JMLR 논문의 실제 구조·자료·실험과 분리합니다.

## 2. 핵심 요약

논문은 언어열의 결합확률을 다음 단어 조건부확률들의 곱으로 분해하고, 각 조건부확률을 고정된 $n-1$개 앞 단어의 학습 벡터로 계산했다. 어휘 크기 $|V|$보다 훨씬 작은 $m=30,60,100$차원 행렬 $C\in\mathbb R^{|V|\times m}$에서 문맥 단어 행을 찾고 이어 붙인 $x$를 tanh 은닉층과 softmax 출력에 넣는다. $C$와 신경망 가중치는 weight decay가 있는 평균 로그가능도를 stochastic gradient ascent와 역전파로 함께 최적화했다. 매개변수 수와 계산은 문맥 차수에 선형으로 늘지만, 출력층은 모든 어휘 점수를 계산해 비용의 대부분을 차지했다.

Brown corpus는 118만 단어 가운데 80만 학습·20만 검증·181,041 시험 단어를 사용하고 빈도 3 이하를 특수 기호로 합쳐 어휘 16,383개를 만들었다. AP News는 약 1,399만 학습·96만 검증·96만 시험 단어와 어휘 17,964개를 사용했다. Brown에서 신경 모형은 validation 기준 최선 n-gram보다 시험 perplexity가 논문 계산상 약 24% 낮았고, AP News에서는 8% 낮았다. trigram과 확률을 절반씩 섞으면 더 낮아져 두 모형의 오류가 상보적임을 보였다. 이것이 논문의 직접 성능 증거다.

원 논문은 학습된 벡터의 의미 구조, downstream 전이 학습, word analogy, 품사·NER·감성 성능을 실험하지 않았다. 오히려 표현 해석·활용을 미래 연구로 적었다. 한 단어에 점 하나만 주므로 polysemy도 한계라고 명시했다. 실험의 OOV는 희귀 단어·고유명사 특수 기호로 처리했고 새 단어 벡터 초기화는 §5의 제안된 확장이지 주 결과가 아니다.

- 무엇을 다루는가: 분산 word feature, 고정 문맥 MLP, softmax 조건부확률, 공동 가능도 학습, 병렬 출력 계산과 perplexity 비교를 다룬다.
- 어떤 문제를 해결하려 했는가: 관측되지 않은 단어열에도 비슷한 단어·문맥에서 확률 질량을 공유해 차원의 저주를 완화하려 했다.
- 어떤 방식이 새로웠는가: 단어 feature와 확률 함수를 한 언어 모델링 목적에서 동시에 학습하고 큰 어휘 신경망이 실제로 강한 smoothed n-gram을 능가할 수 있음을 두 말뭉치에서 보였다.
- 결과적으로 무엇을 바꾸었는가: 언어 모형이 고정 확률표만 고르는 대신 예측에 유용한 표현 자체를 학습하는 설계가 실용 연구 방향으로 자리 잡았다.

## 3. 역사적 배경

분산 표현은 2003년에 처음 발명되지 않았다. Hinton·McClelland·Rumelhart 계열의 1980년대 parallel distributed processing, 언어열을 학습한 Elman의 1990년 simple recurrent network, Miikkulainen·Xu와 다른 neural language model, word class·distributional clustering이 선행 배경이었다. Bengio 등도 §1.2에서 이 선행 연구를 논의했다.

반대로 n-gram이 “통계라서 의미 관계를 전혀 다루지 못한 낡은 방식”이라는 대조도 과하다. class-based n-gram, deleted interpolation, Kneser–Ney back-off, cache·trigger·LSA 언어 모형은 희소성과 더 긴 통계를 서로 다른 방식으로 다뤘다. 2003년 논문은 이 가운데 modified Kneser–Ney와 class-based back-off를 강한 기준선으로 직접 비교했다.

[[001_Shannon's N-gram Model - The Foundation of Statistical Language Processing]]와 [[019_Katz Back-off - Handling Sparse Data in Language Models]]은 정확 문맥 계수와 back-off 확률 재분배를 보여준다. Bengio 모형의 역사적 변화는 확률 언어 모델링을 버린 것이 아니라 조건부확률 추정기를 희소 표에서 연속 벡터의 매끄러운 신경 함수로 바꾼 것이다.

- 이전 접근법: smoothed·back-off n-gram, word class, neural distributed representation과 recurrent sequence learning이 있었다.
- 당시의 한계: 정확 단어 조합별 통계는 비슷한 단어 사이에서 증거를 부드럽게 공유하기 어렵고 고차 문맥은 대부분 관측되지 않았다.
- 새 전환점: 수백만 매개변수의 word-feature MLP를 실제 대규모 말뭉치에 병렬 학습해 강한 perplexity 기준선을 개선했다.

## 4. 핵심 개념 해설

### 결합확률의 자기회귀 분해

언어열 $w_1,\dots,w_T$의 결합확률은 다음처럼 조건부확률의 곱으로 쓴다.

$$
\hat P(w_{1:T})=\prod_{t=1}^{T}
\hat P(w_t\mid w_{t-1},\dots,w_{t-n+1})
$$

이는 n-gram과 같은 확률 분해다. 차이는 조건부확률을 정확 문자열별 빈도표가 아니라 공유 임베딩과 MLP가 계산한다는 데 있다. 원 모형은 $n-1$개보다 먼 단어를 보지 않으므로 RNN·Transformer처럼 가변 전체 문맥을 사용하지 않는다.

### lookup table $C$

$C\in\mathbb R^{|V|\times m}$의 $i$번째 행이 단어 $i$의 feature vector다. one-hot 벡터를 실제로 큰 희소 행렬로 만들 필요 없이 색인으로 행을 고르는 lookup이다. 문맥 단어들의 벡터를 순서대로 이어 붙여

$$
x=(C(w_{t-1}),C(w_{t-2}),\dots,C(w_{t-n+1}))
$$

를 만든다. 같은 단어는 모든 문맥에서 같은 한 행을 사용한다. 위치는 concatenate 순서로 구분되지만 다의어별 벡터는 없다.

### MLP와 softmax

원 논문의 대표식은 다음과 같다.

$$
y=b+Wx+U\tanh(d+Hx)
$$

$$
\hat P(w_t=i\mid x)=\frac{e^{y_i} }{\sum_{j\in V}e^{y_j} }
$$

$W$는 입력에서 출력으로 가는 선택적 direct connection, $H$는 입력–은닉, $U$는 은닉–출력 가중치다. direct path와 tanh path를 함께 둘 수 있다. softmax는 양수이고 합이 1인 어휘 분포를 만든다.

### 공동 학습

평균 penalized log-likelihood

$$
L(\theta)=\frac1T\sum_t\log
\hat P(w_t\mid w_{t-1:t-n+1};\theta)+R(\theta)
$$

를 stochastic gradient ascent로 높인다. 역전파된 오차는 $H,U,W$뿐 아니라 문맥에 사용된 $C(w)$ 행도 바꾼다. 의미 label을 직접 주지 않아도 같은 예측 역할에 놓인 단어들이 비슷한 방향으로 움직일 수 있다. 그러나 모든 가까움이 사람이 해석하는 의미 유사성이라는 보장은 없다. 통사·빈도·형태와 과제 특성이 함께 섞인다.

### 차원의 저주를 완화하는 방식

정확한 길이 $n$ 문자열별 매개변수는 $|V|^n$에 비례할 수 있지만, 신경 모형은 단어별 $m$차원 행과 공유 신경 가중치를 사용한다. 원 논문은 매개변수가 어휘 크기와 차수에 선형으로 증가한다고 설명했다. 관측 문장의 단어를 가까운 벡터로 조금 바꾼 이웃 문장도 매끄러운 함수 때문에 비슷한 확률을 얻는다.

이것이 조합 공간 전체를 계산하지 않아도 일반화하는 원리다. 그러나 softmax 출력의 $|V|$개 점수와 정규화는 여전히 매 예시마다 비쌌고, 어휘 관련 행렬이 매개변수의 대부분을 차지했다.

### perplexity

[[Perplexity]]는 관측 토큰의 평균 음의 로그확률을 지수화한다. 값이 낮다는 것은 같은 자료·어휘 처리에서 실제 다음 단어에 더 높은 확률을 줬다는 뜻이다. 임베딩의 의미 품질, downstream 전이, 사실성과 생성 유용성을 직접 측정하지 않는다.

## 5. 원문의 논리 구조

원문은 먼저 이산 n-gram이 단어 유사성을 공유하지 못한다는 문제를 제시하고, 조밀 벡터와 신경 확률 함수를 해결책으로 놓는다. 이어 lookup–concatenation–hidden–softmax 구조와 공동 역전파를 설명한다. 후반에는 의미 유사성, 전이 학습, word2vec·GloVe·Transformer·LLM, scaling law까지 하나의 유산으로 확장하고 전체 어휘 softmax·고정 창·OOV를 남은 한계로 정리한다.

이 흐름을 읽을 때 직접 증거와 후대 해석을 나눈다. JMLR 논문이 직접 보인 것은 두 말뭉치의 perplexity와 계산 가능성이다. 임베딩의 시각화·analogy·downstream 재사용은 실험하지 않았고 미래 연구로 남겼다. word2vec·GloVe·BERT·GPT로의 연결은 공유 설계 원리와 후대 영향에 관한 해석이지 그 논문의 실험 결과가 아니다.

1. 문제 설정: $|V|^n$ 조합과 희소성, 짧은 n-gram 문맥의 한계를 제시한다.
2. 표현 해법: word feature vector와 매끄러운 확률 함수를 공동 학습한다.
3. 구현: 전체 어휘 softmax의 큰 계산을 출력 단위별 병렬화한다.
4. 비교: Brown·AP News에서 강한 modified Kneser–Ney·class n-gram과 perplexity를 비교한다.
5. 확장: energy model, OOV 초기화, 계층 출력·importance sampling·RNN과 표현 해석을 미래 과제로 제안한다.

## 6. 왜 중요했는가

이 논문은 분산 표현이라는 오래된 아이디어를 **정규화된 다음 단어 확률**, **대규모 말뭉치**, **강한 n-gram 기준선**, **실제 병렬 학습** 안에서 결합했다. 단순히 벡터가 흥미롭다는 시연이 아니라 낮은 perplexity로 표현 공유의 실용 가치를 보였다.

Brown 실험에서 최선 validation n-gram과 비교한 MLP의 시험 perplexity 차이는 논문 서술상 약 24%였고, AP News에서는 8%였다. Brown에서 2단어보다 4단어 문맥을 쓴 신경 모형이 더 좋아졌지만 n-gram은 고차에서 이득을 보지 못했다. hidden unit이 있는 모형이 없는 모형보다 좋았고, 신경 확률과 interpolated trigram을 0.5씩 섞으면 항상 개선됐다. 이는 신경 모형이 n-gram의 모든 정보를 흡수한 것이 아니라 서로 다른 오류를 냈음을 뜻한다.

계산 자체도 결과의 일부였다. AP News의 한 설정은 40개 CPU에서 5 epoch에 약 3주가 걸렸고 저자들은 validation overfitting 징후도 보기 전에 실행을 마쳤다. “더 적은 자료와 계산으로 n-gram을 쉽게 대체했다”가 아니라, 큰 연속 모형의 이득을 얻는 대신 계산 병목을 새로 받아들인 전환이었다.

## 7. 현대 LLM과의 연결

현대 Transformer LLM도 토큰 ID를 임베딩 행렬의 조밀 벡터로 바꾸고, 문맥 표현에서 어휘 logits를 계산해 softmax·교차 엔트로피로 다음 토큰을 학습한다. 이 수준에서 Bengio 모형의 세 단계—representation lookup, shared nonlinear probability function, joint likelihood training—는 직접적인 설계 연속성을 가진다.

구조 차이는 크다. 2003년 모형은 고정된 네댓 단어의 벡터를 위치별로 concatenate하고 한 tanh 층을 사용했다. Transformer는 위치 표현과 self-attention으로 많은 토큰의 문맥을 층별로 섞어 각 토큰의 표현을 문맥마다 다르게 만든다. Bengio의 $C(w)$는 word type당 하나의 정적 벡터지만 LLM의 중간 hidden state는 같은 토큰도 문장마다 달라진다.

원 논문은 recurrent·time-delay network로 창을 늘리는 방안을 미래 연구로 제안했다. 이것이 RNN·LSTM·Transformer의 구체 구조를 예견하거나 직접 발생시켰다는 뜻은 아니다. [[026_Recurrent Neural Networks - Modeling Sequences and Temporal Dependencies]]와 [[028_Long Short-Term Memory - Solving the Vanishing Gradient Problem]]은 순환 구조의 별도 선행 계보를 보여준다.

word2vec과 GloVe도 조밀 word type 벡터를 학습하지만 각각 단순화된 예측 목적과 전역 동시출현 행렬을 사용한다. Bengio MLP의 전체 어휘 정규화 언어 모형을 그대로 구현한 것이 아니다. 공유 원리는 분산 표현이고 직접 알고리즘 계보와 목적은 구분해야 한다.

## 8. 한계와 비판적 관점

raw의 `hot dog` 설명은 문제를 잘못 겨냥한다. n-gram은 단어의 매 출현을 문맥과 무관하게 보지 않고 앞 단어 조합에 따라 확률을 다르게 준다. Bengio 모형도 `dog`에 문맥별 벡터를 주지 않고 단 하나의 $C(\text{dog})$를 사용했다. 비선형 문맥 함수는 `hot` 다음의 `dog` 확률을 다르게 만들 수 있지만 food sense와 animal sense를 임베딩에서 분리하지 않는다. 원 논문은 polysemous word당 여러 점이 필요하다고 명시했다.

one-hot 벡터도 n-gram 모형이 반드시 실제로 저장한 표현은 아니다. 빈도표는 문자열·색인으로 구현할 수 있고, one-hot은 임베딩 lookup과 비교하기 위한 수학적 설명이다. 차원의 저주는 one-hot 차원 하나보다 가능한 단어 조합과 표본 부족에 관한 문제다.

OOV 개선 주장도 주 결과와 다르다. Brown은 빈도 3 이하를 하나의 기호로 합쳤고 AP News도 희귀어와 고유명사를 특수 기호로 바꿨다. §5.1은 새 단어의 벡터를 현재 문맥에서 예상되는 단어 벡터의 가중 평균으로 초기화하는 확장을 제안했지만 본 실험에서 평가하지 않았다. 기본 모형은 subword가 없는 고정 어휘다.

전이 학습 서술은 더 후대의 역사다. 2003년 논문은 POS·NER·감성에 임베딩을 넣어 성능을 보고하지 않았다. learned representation을 해석하고 사용할 방법 자체를 future work로 적었다. 따라서 BERT/GPT의 pretraining–fine-tuning을 이 논문이 이미 시연했다고 쓰지 않는다.

- 표현 한계: word type당 한 벡터여서 다의성과 문맥 의미를 분리하지 못한다.
- 문맥 한계: 고정 길이 왼쪽 창만 보며 문단·장거리 의존은 미래 연구였다.
- 계산 한계: 전체 어휘 softmax와 출력 행렬이 비용·매개변수 대부분을 차지한다.
- 실험 한계: perplexity 두 말뭉치 결과가 임베딩 의미성·downstream 전이·생성 품질을 모두 입증하지 않는다.
- 역사 한계: 분산 표현의 최초 발명, word2vec·GloVe·Transformer·LLM의 단일 직접 기원으로 보지 않는다.

## 9. 용어 정리

- **신경 확률 언어 모형(NPLM)**: 신경망이 문맥에서 다음 단어의 정규화 확률을 계산하는 언어 모형.
- **분산 표현(distributed representation)**: 하나의 항목을 여러 연속 특징의 패턴으로 나타내고 특징을 항목 사이에서 공유하는 표현.
- **단어 임베딩**: 단어 ID를 낮은 차원의 학습 벡터로 대응시키는 행렬의 행.
- **lookup table**: 단어 색인으로 임베딩 행렬의 대응 행을 가져오는 연산과 자료 구조.
- **정적 임베딩**: 같은 word type에 문맥과 무관하게 같은 벡터를 주는 표현.
- **고정 문맥 창**: 다음 단어를 예측할 때 미리 정한 수의 앞 단어만 입력으로 쓰는 범위.
- **softmax**: 모든 어휘 logit을 양수이고 합이 1인 조건부확률로 정규화하는 함수.
- **penalized log-likelihood**: 실제 다음 단어 로그확률에 weight decay 같은 규제를 결합한 학습 목적.
- **perplexity**: 같은 토큰화·자료에서 실제 다음 토큰에 준 평균 확률 품질을 나타내는 지표로 낮을수록 좋다.
- **차원의 저주**: 변수·어휘 조합 수가 커질 때 가능한 공간이 표본보다 훨씬 빨리 증가해 추정이 희소해지는 문제.

## 10. 함께 보면 좋은 항목

- [[001_Shannon's N-gram Model - The Foundation of Statistical Language Processing]] — 조건부 다음 단어 확률이라는 공통 문제 설정의 출발점을 본다.
- [[019_Katz Back-off - Handling Sparse Data in Language Models]] — 정확 문맥 표가 희소할 때 할인·back-off로 확률을 재배분하는 대안을 비교한다.
- [[018_Backpropagation - Training Multi-Layer Neural Networks]] — 임베딩과 MLP 가중치를 공동 학습하는 gradient 계산의 기반이다.
- [[026_Recurrent Neural Networks - Modeling Sequences and Temporal Dependencies]] — 고정 concatenate 창 대신 공유 상태로 가변 길이 문맥을 처리하는 별도 계보다.
- [[028_Long Short-Term Memory - Solving the Vanishing Gradient Problem]] — 순환 문맥에서 장거리 gradient를 개선한 다음 연결점이다.
- [[031_Latent Semantic Analysis & Probabilistic Latent Semantic Indexing Dimensionality Reduction and Topic Modeling]] — 문서–단어 행렬의 저차원 의미 구조와 예측 임베딩을 구분할 수 있다.

## 11. 읽고 생각해볼 질문

1. n-gram smoothing과 임베딩 기반 일반화는 관측되지 않은 문맥에 어떤 서로 다른 방식으로 확률을 나누는가?
2. 같은 단어에 하나의 벡터만 주면서 문맥 함수만 비선형으로 만드는 모형은 다의성을 어디까지 처리할 수 있는가?
3. 신경 모형과 trigram을 섞었을 때 더 좋아졌다는 결과는 두 모형이 배우는 통계에 대해 무엇을 말하는가?
4. perplexity가 낮아도 임베딩이 사람이 원하는 의미 축을 갖거나 downstream 과제에서 좋아진다고 단정할 수 없는 이유는 무엇인가?
5. 전체 어휘 softmax의 정확한 정규화와 계산 효율 사이의 절충은 현대의 sampled softmax·hierarchical softmax·subword vocabulary에서 어떻게 바뀌었는가?

## 12. 짧은 결론

2003년 신경 확률 언어 모형의 핵심은 “단어 의미를 처음 벡터화했다”는 단일 발명이 아니라, 학습 단어 feature와 정규화된 다음 단어 확률을 하나의 대규모 가능도 학습에 결합하고 강한 n-gram보다 낮은 perplexity를 보인 데 있다. 이 설계는 현대 LLM의 임베딩–문맥 함수–softmax 공동 학습과 분명히 이어지지만, 원 모형은 정적 word type 벡터, 고정 짧은 창과 비싼 전체 어휘 출력을 사용했다. downstream 전이, contextual embedding, subword와 scaling law는 후속 발전으로 구분해야 한다.
