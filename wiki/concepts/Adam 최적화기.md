---
schema_version: 2
id: concept.adam-최적화기
page_type: concept
title: Adam 최적화기
aliases:
  - Adam optimizer
  - Adaptive Moment Estimation
  - Adam
tags:
  - type/concept
  - domain/ai
  - domain/machine-learning
  - domain/mathematics
  - domain/optimization
created: '2026-07-18'
updated: '2026-07-24'
lifecycle: active
verification: verified
artifacts:
  - 'raw/044_GloVe and Adam Optimizer Global Word Embeddings and Adaptive Optimization.ko.md'
  - 'raw/044_GloVe and Adam Optimizer Global Word Embeddings and Adaptive Optimization.commentary.ko.md'
evidence:
  - source_id: kingma-ba-2015-adam
    locator: 'arXiv:1412.6980, Algorithm 1과 §§2–2.1의 갱신·편향 보정 및 §§4–6의 실험·범위'
    relation: supports
  - source_id: reddi-kale-kumar-2018-adam-convergence
    locator: 'ICLR 2018, §§1–4의 수렴 반례·AMSGrad'
    relation: contextualizes
  - source_id: wilson-et-al-2017-adaptive-methods
    locator: 'NeurIPS 2017, §§1–4의 adaptive method와 SGD의 해·일반화 차이'
    relation: contextualizes
  - source_id: loshchilov-hutter-2019-adamw
    locator: 'ICLR 2019, §§1–3과 Algorithm 2의 L2·weight decay 구분과 AdamW'
    relation: contextualizes
  - source_id: mit-ocw-6-012-lecture-6-2018
    locator: '§6.2의 분산 정의; Adam의 raw second moment와 분산을 구분하기 위한 맥락'
    relation: contextualizes
related:
  - source.044
  - concept.미분-편미분-그래디언트
  - concept.경사하강법
  - concept.역전파
  - concept.확률변수-확률분포-기대값-분산
---
# Adam 최적화기

> [!note] 학습 안내
> **난이도:** 심화<br>
> **선수 지식:** [[미분·편미분·그래디언트]], [[경사하강법]], [[역전파]], [[확률변수·확률분포·기대값·분산]]의 raw second moment와 분산 구분<br>
> **읽고 나면:** Adam이 확률적 gradient의 1차·2차 raw moment 이동 평균과 편향 보정으로 좌표별 갱신을 만드는 과정을 한 좌표 예로 계산하고, $v_t$·분산·AdamW·수렴의 범위를 구분할 수 있다.

## 1단계 — 먼저 잡을 핵심

Adam(Adaptive Moment Estimation)은 확률적 gradient의 1차·2차 raw moment 지수 이동 평균을 이용해 좌표별 갱신을 조절하는 1차 최적화 알고리즘이다. Kingma와 Ba가 2014년 12월 공개하고 ICLR 2015에 발표했다. 여기서 “확률적”은 mini-batch·data order·dropout 같은 학습 표본화 때문에 현재 $g_t$가 전체 자료의 정확한 gradient와 다를 수 있다는 뜻이다.

## 2단계 — 작동 원리

### 그래디언트에서 갱신까지

Adam은 현재 그래디언트를 이전 단계의 두 이동 평균에 반영한다. 한 평균은 최근 방향을 매끄럽게 하고 다른 평균은 좌표별 그래디언트 크기의 이력을 반영해 최종 갱신을 조절한다.

현재 gradient $g_t=\nabla_\theta J_t$는 $\theta$와 같은 shape이고, $m_t,v_t$도 그 각 좌표에 대응하는 같은 shape의 상태다. 따라서 Adam은 그래디언트가 어디서 계산됐는지를 바꾸지 않는다. 도함수·그래디언트의 국소 뜻은 [[미분·편미분·그래디언트]], 가장 단순한 음의 그래디언트 갱신은 [[경사하강법]]이 맡고, Adam은 그 뒤의 좌표별 update rule을 정한다.

### 무엇을 추정하는가

$m_t$는 최근 gradient의 지수 평균이고 $v_t$는 최근 squared gradient의 지수 평균이다. $v_t$를 Hessian, curvature, gradient variance 또는 noise의 직접 추정치라고 부르지 않는다. [[확률변수·확률분포·기대값·분산]]의 분산은 평균에서 뺀 제곱 편차의 기대값이지만, $v_t$는 평균을 빼지 않은 $g_t^2$를 시간 가중해 누적한다. Adam은 층의 의미를 알아서 최적 학습률을 배정하지 않고 관측된 좌표별 gradient 규모와 방향 이력으로 preconditioned update를 만든다.

## 3단계 — 기술과 근거

### 알고리즘

현재 그래디언트 $g_t$에 대해

$$
m_t=\beta_1m_{t-1}+(1-\beta_1)g_t,\qquad
v_t=\beta_2v_{t-1}+(1-\beta_2)g_t^2
$$

를 계산한다. 0 초기화 편향을

$$
\hat m_t=m_t/(1-\beta_1^t),\qquad
\hat v_t=v_t/(1-\beta_2^t)
$$

로 보정하고

$$
\theta_t=\theta_{t-1}-
\alpha\frac{\hat m_t}{\sqrt{\hat v_t}+\epsilon}
$$

로 갱신한다. $g_t^2$·나눗셈·제곱근은 좌표별 연산이다.

| 기호 | 현재 식에서의 의미 | 종류·shape | 값의 범위·출처 |
| --- | --- | --- | --- |
| $\theta_t$ | $t$번째 update 뒤 매개변수 | 임의 shape tensor | 학습할 모델 weight |
| $g_t$ | 현재 손실의 gradient | $\theta_t$와 같은 shape | 역전파 결과 |
| $m_t$ | 1차 raw moment 이동평균 | $\theta_t$와 같은 shape | optimizer state |
| $v_t$ | squared gradient의 2차 raw moment 이동평균 | $\theta_t$와 같은 shape, 성분별 음이 아님 | optimizer state |
| $\hat m_t,\hat v_t$ | 0 초기화 편향을 보정한 moment | $\theta_t$와 같은 shape | $m_t,v_t$에서 계산 |
| $\alpha$ | 기본 step 크기 | 양의 스칼라 | optimizer hyperparameter |
| $\beta_1,\beta_2$ | 이전 상태에 주는 decay | $[0,1)$ 스칼라 | optimizer hyperparameter |
| $\epsilon$ | 0으로 나눔·극단 scale을 완화하는 상수 | 양의 스칼라 | optimizer hyperparameter |

### 한 좌표의 첫 update

스칼라 parameter 하나에서 $m_0=v_0=0$, 현재 gradient $g_1=2$, $\beta_1=0.9$, $\beta_2=0.999$라고 하자. 우선 raw state는

$$
m_1=0.9\cdot0+0.1\cdot2=0.2,
\qquad
v_1=0.999\cdot0+0.001\cdot2^2=0.004
$$

이다. 0으로 시작한 첫 상태는 작게 치우치므로 편향 보정을 하면

$$
\hat m_1=\frac{0.2}{1-0.9}=2,
\qquad
\hat v_1=\frac{0.004}{1-0.999}=4.
$$

따라서 $\epsilon$을 무시해 읽으면 첫 parameter update는

$$
\theta_1=\theta_0-\alpha\frac{2}{\sqrt4+\epsilon}
\approx\theta_0-\alpha
$$

가 된다. 이 예는 첫 step에서 bias correction이 현재 gradient 크기를 복원하는 모습을 보인다. 여러 좌표·여러 step에서는 $m_t,v_t$가 과거 gradient의 서로 다른 감쇠 이력을 가지므로, Adam update를 언제나 단순 SGD와 같은 크기라고 일반화할 수 없다.

### 기본값의 지위

원 논문의 권장값은 $\alpha=0.001$, $\beta_1=0.9$, $\beta_2=0.999$, $\epsilon=10^{-8}$이다. 여러 과제에서 유용한 출발점이지만 모델·batch·정밀도·loss scale에 무관한 정답은 아니다. 대규모 모델은 warmup·학습률 decay·gradient clipping·weight decay와 함께 조정한다. $\epsilon$은 $v_t$가 작을 때 분모를 유한하게 만드는 공학적 장치이지, noisy gradient의 통계적 편향이나 잘못된 목적함수를 고치는 장치는 아니다.

### AdamW와 weight decay

손실에 L2 penalty를 더하면 그 gradient가 Adam의 좌표별 스케일링을 받는다. 직접 weight decay와 더 이상 표준 SGD에서처럼 동등하지 않다. AdamW는 loss gradient의 adaptive update와 매개변수 shrinkage를 분리한다. 원 Adam의 필수 일부가 아니라 2019년 정식 발표된 후속 변형이다.

### 역전파·메모리와의 구분

[[역전파]]는 손실의 그래디언트를 계산하고 [[Adam 최적화기]]는 그 그래디언트로 매개변수를 갱신한다. 매개변수마다 $m,v$ 두 상태를 저장하므로 단순 SGD보다 optimizer-state 메모리가 크다. 실제 총 메모리는 parameter·gradient·activation의 정밀도와 분산 저장에 따라 달라진다. [[Transformer]]가 attention·MLP·정규화를 연결하는 순전파 구조라면, Adam은 그 구조에서 얻은 모든 매개변수 gradient에 적용할 수 있는 update rule이지 Transformer 내부 연산의 일부는 아니다.

## 검증과 한계

### 수렴과 일반화

후속 연구는 간단한 convex 설정에서 Adam이 최적해로 수렴하지 않는 반례와 원래 증명의 문제를 제시했다. AMSGrad는 2차 모멘트의 장기 최대값을 보존해 이 문제를 완화한다. 다른 연구는 adaptive method와 SGD가 훈련 손실이 비슷해도 서로 다른 해·시험 성능을 낼 수 있음을 보였다. 어느 최적화기가 더 잘 일반화하는지는 구조·자료·규제·스케줄에 의존한다.

### 흔한 오해

- $v_t$가 크다는 것은 해당 좌표의 recent squared gradient가 컸다는 뜻이지, 목적함수의 정확한 curvature·데이터 분산·불확실성을 측정했다는 뜻이 아니다.
- bias correction은 0 초기화 때문에 생긴 초반 축소를 보정한다. nonstationary gradient, stale distributed update, mixed-precision overflow를 자동으로 보정하지 않는다.
- Adam의 빠른 훈련 손실 감소가 최적해 수렴·시험 일반화·안전한 학습률의 증거가 되지는 않는다.

## 학습 확인

1. Adam은 최근 gradient에서 어떤 두 종류의 이동 평균을 유지하는가?

   **답:** $m_t$는 gradient의 1차 raw moment, $v_t$는 squared gradient의 2차 raw moment 지수 이동평균이다.

2. $g_1=2$, $m_0=v_0=0$인 첫 step에서 편향 보정 뒤 $\hat m_1,\hat v_1$은 무엇인가?

   **답:** $\beta_1=0.9,\beta_2=0.999$이면 $\hat m_1=2,\hat v_1=4$다. 따라서 $\epsilon$을 무시하면 update 방향·크기는 $-\alpha$가 된다.

3. $v_t$와 gradient variance를 같은 말로 부를 수 없는 이유는 무엇인가?

   **답:** variance는 평균을 뺀 편차의 분포 평균이지만, $v_t$는 $g_t^2$를 시간 가중해 누적한 raw second moment state이기 때문이다.

### 다음 문서

- [[Transformer]] — Adam이 갱신할 gradient를 만드는 attention·MLP·residual·정규화 block을 본다.
- [[언어 모델 전이 학습]] — 사전학습과 과제 적응의 훈련 구성을 살핀다.

## 출처

- [[044_GloVe와 Adam의 서로 다른 2014년 전환]]
- Diederik P. Kingma·Jimmy Ba, [Adam: A Method for Stochastic Optimization](https://arxiv.org/abs/1412.6980), 2014년 12월 공개·ICLR 2015.
- Sashank J. Reddi·Satyen Kale·Sanjiv Kumar, [On the Convergence of Adam and Beyond](https://openreview.net/forum?id=ryQu7f-RZ), ICLR 2018.
- Ashia C. Wilson 외, [The Marginal Value of Adaptive Gradient Methods in Machine Learning](https://proceedings.neurips.cc/paper_files/paper/2017/hash/81b3833e2504647f9d794f7d7b9bf341-Abstract.html), NeurIPS 2017.
- Ilya Loshchilov·Frank Hutter, [Decoupled Weight Decay Regularization](https://openreview.net/forum?id=Bkg6RiCqY7), ICLR 2019.
- John Tsitsiklis·Patrick Jaillet, [Introduction to Probability: Lecture 6](https://ocw.mit.edu/courses/res-6-012-introduction-to-probability-spring-2018/resources/lecture-6-discrete-random-variables-part-ii/), 2018, §6.2.

## 관련 항목

- [[044_GloVe와 Adam의 서로 다른 2014년 전환]]
- [[미분·편미분·그래디언트]]
- [[경사하강법]]
- [[역전파]]
- [[확률변수·확률분포·기대값·분산]]
