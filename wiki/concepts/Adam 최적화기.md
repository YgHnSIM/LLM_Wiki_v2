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
  - domain/optimization
created: '2026-07-18'
updated: '2026-07-18'
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
related:
  - source.044
  - concept.경사하강법
  - concept.역전파
---
# Adam 최적화기

Adam(Adaptive Moment Estimation)은 확률적 그래디언트의 1차·2차 raw moment 지수 이동 평균을 이용해 좌표별 갱신을 조절하는 1차 최적화 알고리즘이다. Kingma와 Ba가 2014년 12월 공개하고 ICLR 2015에 발표했다.

## 알고리즘

현재 그래디언트 $g_t$에 대해

$$
m_t=\beta_1m_{t-1}+(1-\beta_1)g_t,qquad
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

## 무엇을 추정하는가

$m_t$는 최근 gradient의 지수 평균이고 $v_t$는 최근 squared gradient의 지수 평균이다. $v_t$를 Hessian, curvature, gradient variance 또는 noise의 직접 추정치라고 부르지 않는다. Adam은 층의 의미를 알아서 최적 학습률을 배정하지 않고 관측된 좌표별 gradient 규모와 방향 이력으로 preconditioned update를 만든다.

## 기본값의 지위

원 논문의 권장값은 $\alpha=0.001$, $\beta_1=0.9$, $\beta_2=0.999$, $\epsilon=10^{-8}$이다. 여러 과제에서 유용한 출발점이지만 모델·batch·정밀도·loss scale에 무관한 정답은 아니다. 대규모 모델은 warmup·학습률 decay·gradient clipping·weight decay와 함께 조정한다.

## 수렴과 일반화

후속 연구는 간단한 convex 설정에서 Adam이 최적해로 수렴하지 않는 반례와 원래 증명의 문제를 제시했다. AMSGrad는 2차 모멘트의 장기 최대값을 보존해 이 문제를 완화한다. 다른 연구는 adaptive method와 SGD가 훈련 손실이 비슷해도 서로 다른 해·시험 성능을 낼 수 있음을 보였다. 어느 최적화기가 더 잘 일반화하는지는 구조·자료·규제·스케줄에 의존한다.

## AdamW와 weight decay

손실에 L2 penalty를 더하면 그 gradient가 Adam의 좌표별 스케일링을 받는다. 직접 weight decay와 더 이상 표준 SGD에서처럼 동등하지 않다. AdamW는 loss gradient의 adaptive update와 매개변수 shrinkage를 분리한다. 원 Adam의 필수 일부가 아니라 2019년 정식 발표된 후속 변형이다.

## 역전파·메모리와의 구분

[[역전파]]는 손실의 그래디언트를 계산하고 [[Adam 최적화기]]는 그 그래디언트로 매개변수를 갱신한다. 매개변수마다 $m,v$ 두 상태를 저장하므로 단순 SGD보다 optimizer-state 메모리가 크다. 실제 총 메모리는 parameter·gradient·activation의 정밀도와 분산 저장에 따라 달라진다.

## 출처

- [[044_GloVe와 Adam의 서로 다른 2014년 전환]]
- Diederik P. Kingma·Jimmy Ba, [Adam: A Method for Stochastic Optimization](https://arxiv.org/abs/1412.6980), 2014년 12월 공개·ICLR 2015.
- Sashank J. Reddi·Satyen Kale·Sanjiv Kumar, [On the Convergence of Adam and Beyond](https://openreview.net/forum?id=ryQu7f-RZ), ICLR 2018.
- Ashia C. Wilson 외, [The Marginal Value of Adaptive Gradient Methods in Machine Learning](https://proceedings.neurips.cc/paper_files/paper/2017/hash/81b3833e2504647f9d794f7d7b9bf341-Abstract.html), NeurIPS 2017.
- Ilya Loshchilov·Frank Hutter, [Decoupled Weight Decay Regularization](https://openreview.net/forum?id=Bkg6RiCqY7), ICLR 2019.

## 관련 항목

- [[044_GloVe와 Adam의 서로 다른 2014년 전환]]
- [[경사하강법]]
- [[역전파]]
