---
schema_version: 2
id: source.044
page_type: source
title: GloVe와 Adam의 서로 다른 2014년 전환
aliases:
  - 044_GloVe and Adam Optimizer Global Word Embeddings and Adaptive Optimization
  - GloVe and Adam Optimizer Global Word Embeddings and Adaptive Optimization
tags:
  - type/source
  - domain/ai
  - domain/nlp
  - domain/machine-learning
  - domain/optimization
created: '2026-07-18'
updated: '2026-07-18'
lifecycle: active
verification: verified
artifacts:
  - 'raw/044_GloVe and Adam Optimizer Global Word Embeddings and Adaptive Optimization.ko.md'
  - 'raw/044_GloVe and Adam Optimizer Global Word Embeddings and Adaptive Optimization.commentary.ko.md'
evidence:
  - source_id: pennington-et-al-2014-glove
    locator: 'EMNLP 2014, pp. 1532–1543, 특히 §§2–3의 동시출현 비율 유도·가중 목적, §§4–4.6의 자료·유추·유사도·NER 평가'
    relation: supports
  - source_id: kingma-ba-2015-adam
    locator: 'arXiv:1412.6980, Algorithm 1과 §§2–2.1의 모멘트·편향 보정, §§4–6의 실험·관련 방법·결론'
    relation: supports
  - source_id: reddi-kale-kumar-2018-adam-convergence
    locator: 'ICLR 2018, §§1–3의 Adam 수렴 반례·기존 증명 문제와 §§4–6의 AMSGrad·실험'
    relation: contextualizes
  - source_id: wilson-et-al-2017-adaptive-methods
    locator: 'NeurIPS 2017, 초록과 §§1–4의 adaptive method·SGD 해 차이와 일반화 실험'
    relation: contextualizes
  - source_id: loshchilov-hutter-2019-adamw
    locator: 'ICLR 2019, §§1–2의 L2 regularization·weight decay 비동일성, Algorithm 2와 §§3–4의 AdamW 평가'
    relation: contextualizes
related:
  - concept.glove
  - concept.adam-최적화기
  - concept.단어-임베딩
  - source.043
---
# GloVe와 Adam의 서로 다른 2014년 전환

044 raw는 [[GloVe]]와 [[Adam 최적화기]]를 “숲과 나무를 함께 보게 한” 2014년의 한 쌍의 혁신으로 묶는다. 그러나 둘은 공동 연구도, 같은 문제에 대한 경쟁 해법도 아니다. GloVe는 말뭉치의 단어–문맥 동시출현 계수에서 정적 [[단어 임베딩]]을 학습하고, Adam은 확률적 목적의 그래디언트로 매개변수를 갱신한다. 공개 문서는 **공통 연대와 직접 기술 계보를 분리**해 두 논문을 각각 검증한다.

GloVe는 2014년 10월 EMNLP에 발표되었다. Adam은 2014년 12월 arXiv 공개 뒤 ICLR 2015 논문이 되었다. Diederik Kingma는 University of Amsterdam, Jimmy Ba는 University of Toronto 소속으로 기재됐으므로 둘을 “Amsterdam 한 팀”으로 부르지 않는다.

## GloVe의 ‘전역’은 무엇인가

GloVe의 입력 $X_{ij}$는 문맥 단어 $j$가 중심 단어 $i$의 **국소 창**에 나타난 횟수를 말뭉치 전체에 누적한 값이다. 논문 실험은 창 안 거리가 $d$이면 $1/d$ 가중치를 주었다. “global”은 문서나 말뭉치 전체를 한 번에 신경망 입력으로 읽거나 장거리 담화를 모델링한다는 뜻이 아니다. 국소 사건을 corpus-wide 단어–단어 통계로 집계한다는 뜻이다.

따라서 [[Word2Vec]]과의 대비도 절대적이지 않다. [[Skip-gram]]은 개별 국소 쌍을 확률적으로 반복 학습하고 GloVe는 같은 종류의 쌍을 집계한 비영 계수를 회귀한다. SGNS가 shifted PMI 행렬을 암묵적으로 분해한다는 후속 결과는 두 계열이 모두 전역 동시출현 분포를 서로 다른 목적·가중으로 사용함을 보여 준다.

## 동시출현 비율에서 목적 함수로

논문은 `ice`·`steam` 대신 `ice`·`steam`과 `solid`·`gas`의 조건부확률 비율을 예로 들었다. 탐색 단어 $k$가 `ice`와 관련되고 `steam`과 무관하면 $P_{ik}/P_{jk}$가 크고, 반대면 작으며, 둘과 모두 관련되거나 모두 무관하면 1에 가까워진다. 이 비율 정보를 벡터 차이에 담도록 함수 형태를 제약해 log-bilinear 회귀를 얻는다.

$$
J=\sum_{i,j=1}^{V}f(X_{ij})
(\mathbf w_i^T\tilde{\mathbf w}_j+b_i+\tilde b_j-\log X_{ij})^2
$$

학습은 $X_{ij}>0$인 항만 합산한다. 어휘가 5만이면 25억 개 dense 항을 모두 메모리에 저장하고 0까지 계산하는 방식이 아니다. 희소 동시출현 목록을 순회하므로 비용은 비영 항 수와 벡터 차원에 좌우된다.

대표 가중 함수는 다음과 같다.

$$
f(x)=
\begin{cases}
(x/x_{max})^\alpha & x<x_{max}\\
1 & x\ge x_{max}
\end{cases}
$$

논문은 $x_{max}=100$, $\alpha=3/4$를 모든 실험에 사용했다. 이는 아주 작은 계수를 낮게 가중하고 큰 계수의 영향에는 상한을 두지만, “중간 빈도만 의미 있고 고빈도 기능어는 제거한다”는 규칙은 아니다. $x\ge100$인 모든 항의 가중치가 1이며, 원시 빈도 효과 일부는 편향항과 로그 변환이 흡수한다.

## 두 벡터 공간과 평가

GloVe에는 중심 단어 벡터 $\mathbf w_i$와 문맥 벡터 $\tilde{\mathbf w}_i$가 있다. 말뭉치의 단어–단어 행렬이 대칭적이어서 두 역할은 교환 가능하지만 무작위 초기화 때문에 서로 다른 해를 얻는다. 논문은 평가에서 둘의 합 $\mathbf w_i+\tilde{\mathbf w}_i$를 사용하면 대체로 조금 나아진다고 보고했다. 합이 유일한 이론적 최종 벡터이거나 개별 차원이 직접 해석된다는 뜻은 아니다.

Wikipedia 2010 10억 token, Gigaword 5 43억 token과 두 Common Crawl 자료를 사용했고, 60억 token 조합에서 40만 어휘를 학습했다. 대표 Wikipedia+Gigaword 300차원 모형은 Google 유추 자료에서 총 71.7%, 420억 token Common Crawl 모형은 75.0%를 기록했다. 비교 Word2Vec 수치는 재학습·공개 모형, 자료량과 어휘가 서로 달랐으므로 “GloVe가 모든 과제에서 Word2Vec보다 우월”하다는 보편 결론은 아니다.

WordSim-353 등 유사도와 CoNLL-2003 개체명 인식 결과도 보고했지만, GloVe 한 벡터만으로 NER를 수행한 것이 아니다. 이전 신경 NER 구조의 여러 특징 중 사전학습 벡터를 바꿔 평균 F1을 비교했다. 희귀 개체·번역·검색·감성 분석의 일반적인 향상과 산업 채택은 이 원 논문에서 모두 실험되지 않았다.

## Adam의 실제 갱신

Adam은 목적 함수의 확률적 그래디언트 $g_t$에 대해 1차 raw moment와 2차 raw moment의 지수 이동 평균을 좌표별로 유지한다.

$$
m_t=\beta_1m_{t-1}+(1-\beta_1)g_t
$$

$$
v_t=\beta_2v_{t-1}+(1-\beta_2)g_t^2
$$

$v_t$는 원소별 제곱의 평균이지 그래디언트 분산, 잡음이나 안정성을 직접 추정하는 완전한 통계량이 아니다. $m_0=v_0=0$으로 시작해 초기에 0 쪽으로 치우치므로 다음 보정을 적용한다.

$$
\hat m_t=\frac{m_t}{1-\beta_1^t},\qquad
\hat v_t=\frac{v_t}{1-\beta_2^t}
$$

갱신은 다음과 같다.

$$
\theta_t=\theta_{t-1}-
\alpha\frac{\hat m_t}{\sqrt{\hat v_t}+\epsilon}
$$

원 논문의 권장 기본값은 $\alpha=0.001$, $\beta_1=0.9$, $\beta_2=0.999$, $\epsilon=10^{-8}$이다. 편향 보정은 0 초기화에서 오는 기대값의 축소를 줄이지만 모든 비정상·상관 그래디언트에서 “정확한 모멘트”를 보장하지 않는다. 작은 $1-\beta^t$만 보고 초기 수치 폭주를 예측하는 raw의 설명도 분자 $m_t,v_t$와 함께 이루어지는 보정을 무시한다.

## SGD와 적응형 스케일의 정확한 차이

기본 SGD가 모든 매개변수를 “고정된 같은 양”만큼 바꾸는 것은 아니다. 같은 scalar learning rate를 쓰더라도 좌표별 gradient가 다르므로 갱신량도 다르다. Adam의 차이는 최근 gradient 크기의 좌표별 이력으로 그 갱신을 다시 나누고 1차 이동 평균으로 방향을 매끄럽게 만드는 데 있다.

“초기 층에는 작은 학습률, 후기 층에는 큰 학습률이 필요하므로 Adam이 자동으로 층별 정답을 찾는다”는 raw의 비유는 원 알고리즘의 보장이 아니다. Adam은 매개변수의 의미나 층 역할을 알지 못하고 관측된 그래디언트 좌표 통계만 사용한다. 그래디언트가 일정한 양의 값이면 $m/\sqrt v$의 크기는 대략 1이 되므로, 큰 그래디언트를 반드시 더 작은 절대 갱신으로 바꾼다는 단순 설명도 정확하지 않다.

## 기본값과 실험의 범위

Kingma와 Ba는 logistic regression, 다층망, convolutional network, variational autoencoder에서 SGD·AdaGrad·RMSProp류와 비교했다. 잡음이 있거나 희소한 그래디언트에 적합하고 하이퍼파라미터 조정이 비교적 적다고 주장했지만, 모든 구조에서 훈련 시간을 절반으로 줄이거나 실패를 없앴다는 결과는 없다.

기본값은 좋은 출발점일 수 있지만 batch size, loss scale, 모델 폭·깊이, warmup·decay schedule과 정규화에 따라 학습률과 모멘트 설정을 바꿔야 한다. 동일한 optimizer 이름을 쓴다고 구조·데이터 차이와 최적화 조정이 사라지거나 논문 결과가 자동으로 재현되는 것도 아니다.

## 후속 수렴·일반화·weight decay 정정

Reddi·Kale·Kumar는 간단한 convex online optimization에서 Adam이 최적해로 수렴하지 않는 반례를 제시하고 원 논문 증명의 문제를 지적했다. exponential second moment가 특정 과거 gradient의 영향을 너무 빨리 잊어 유효 학습률이 잘못 증가할 수 있다고 분석하고 AMSGrad를 제안했다. 따라서 원 논문의 regret bound를 Adam의 보편 수렴 보장으로 사용하지 않는다.

Wilson 등은 일부 과매개변수 모형과 영상 과제에서 adaptive method가 SGD와 다른 해를 찾고 시험 일반화가 더 나쁠 수 있음을 보였다. 이는 모든 과제에서 SGD가 더 낫다는 정리가 아니라 optimizer가 훈련 속도뿐 아니라 implicit bias와 최종 해를 바꿀 수 있다는 증거다.

Adam 원 논문에는 weight decay가 핵심 구성으로 들어 있지 않다. 흔한 구현에서 손실에 L2 항을 더하는 방식은 adaptive preconditioning 때문에 표준 SGD의 직접 weight shrinkage와 동일하지 않다. Loshchilov·Hutter의 AdamW는 손실 gradient의 Adam 갱신과 매개변수 감쇠를 분리했다. “Adam이 weight decay를 잘못 구현했고 AdamW가 오류를 고쳤다”보다 규제의 두 정의와 결합 방식을 구분하는 설명이 정확하다.

## 상태 메모리와 현대 대규모 학습

Adam은 매개변수마다 $m$과 $v$ 두 상태를 저장한다. 두 상태를 FP32로 두면 10억 매개변수에서 8GB가 추가된다는 계산은 맞지만, 총 훈련 메모리는 매개변수 정밀도·gradient·master weights·분산 shard와 activation에 따라 달라진다. 단순 SGD 대비 “전체 메모리가 정확히 세 배”라고 고정하지 않는다.

현대 Transformer·언어 모델 훈련에서 AdamW 계열이 널리 사용되는 것은 중요한 직접 연결이다. 다만 warmup, 학습률 감쇠, gradient clipping, mixed precision, batch 구성과 분산 optimizer state가 함께 필요하다. GloVe가 Adam으로 훈련되었거나 두 연구가 결합해 2014년의 신경 언어 처리를 가능하게 했다는 증거는 없다. GloVe 논문은 AdaGrad를 사용했다.

## 검증 정정

- **GloVe가 문서·말뭉치 전체를 한 번에 읽어 장거리 패턴을 학습**: 국소 창의 단어–문맥 사건을 말뭉치 전체 계수로 집계한다.
- **5만 어휘면 25억 dense 항을 모두 저장·계산**: 0이 아닌 희소 행렬 항만 학습한다.
- **Word2Vec은 국소, GloVe만 전역 통계를 사용**: SGNS도 국소 쌍의 전체 분포를 학습하며 shifted PMI와 연결된다.
- **GloVe가 희귀어 의미를 제한된 출현에서도 명확히 해결**: 낮은 계수는 가중치가 작고 관측이 적으면 추정도 불안정하다.
- **GloVe가 모든 분류·NER·번역·검색에서 Word2Vec보다 우월**: 원 논문은 특정 intrinsic 평가와 한 NER 구조에서 조건별 결과를 보고했다.
- **GloVe 행렬이 임베딩 각 차원의 완전한 해석을 제공**: 목적 통계는 보이지만 저차원 해는 회전·초기화에 따라 비식별적이다.
- **SGD는 모든 매개변수를 같은 고정량으로 갱신**: 같은 scalar learning rate를 써도 gradient가 달라 갱신량이 다르다.
- **Adam의 $v_t$가 gradient 잡음·안정성의 분산**: 원소별 제곱의 지수평균인 2차 raw moment다.
- **편향 보정 분모가 작아 초기 폭주**: 작은 분자와 함께 0 초기화 편향을 보정하는 식이며 그 설명만으로 불안정을 결론내릴 수 없다.
- **기본값이면 조정 없이 항상 빠르고 안정적으로 수렴**: 후속 수렴 반례와 과제별 일반화 차이가 있으며 실제 학습률 schedule 조정이 필요하다.
- **Adam이 훈련 시간을 보편적으로 절반으로 줄임**: 원 논문의 제한된 비교에서 그런 일반 수치를 보고하지 않았다.
- **Adam이 weight decay를 내장했으나 잘못 처리**: 원 Adam과 L2 penalty, decoupled AdamW를 구분한다.
- **GloVe와 Adam이 결합해 현대 LLM을 직접 가능하게 함**: 같은 해의 독립 연구이며 GloVe는 AdaGrad로 학습했다.

## 핵심 문장

- GloVe의 전역 통계는 국소 창에서 얻은 동시출현을 말뭉치 전체에 집계한 희소 계수다.
- GloVe는 비영 로그 동시출현을 가중 내적·편향으로 근사하며 Word2Vec과 목적·가중·집계 단위가 다르다.
- Adam은 gradient의 1차·2차 raw moment 지수평균을 편향 보정해 좌표별 갱신을 스케일한다.
- Adam 기본값은 유용한 시작점이지만 수렴·속도·일반화·재현성을 보장하지 않는다.
- GloVe와 Adam은 2014년이라는 연대를 공유하지만 서로를 낳은 단일 기술 전환이 아니다.

## 출처

- Jeffrey Pennington·Richard Socher·Christopher D. Manning, [GloVe: Global Vectors for Word Representation](https://aclanthology.org/D14-1162/), EMNLP 2014, pp. 1532–1543.
- Diederik P. Kingma·Jimmy Ba, [Adam: A Method for Stochastic Optimization](https://arxiv.org/abs/1412.6980), 2014년 12월 공개·ICLR 2015, Algorithm 1과 §§2–6.
- Sashank J. Reddi·Satyen Kale·Sanjiv Kumar, [On the Convergence of Adam and Beyond](https://openreview.net/forum?id=ryQu7f-RZ), ICLR 2018.
- Ashia C. Wilson 외, [The Marginal Value of Adaptive Gradient Methods in Machine Learning](https://proceedings.neurips.cc/paper_files/paper/2017/hash/81b3833e2504647f9d794f7d7b9bf341-Abstract.html), NeurIPS 2017.
- Ilya Loshchilov·Frank Hutter, [Decoupled Weight Decay Regularization](https://openreview.net/forum?id=Bkg6RiCqY7), ICLR 2019.
- 프로젝트 보존 자료: `raw/044_GloVe and Adam Optimizer Global Word Embeddings and Adaptive Optimization.ko.md`, `raw/044_GloVe and Adam Optimizer Global Word Embeddings and Adaptive Optimization.commentary.ko.md`.

## 관련 항목

- [[GloVe]]
- [[Adam 최적화기]]
- [[단어 임베딩]]
- [[043_Word2Vec와 효율적 정적 단어 임베딩]]
