---
schema_version: 2
id: concept.layer-normalization
page_type: concept
title: Layer Normalization
aliases: [LayerNorm, 층 정규화, 레이어 정규화]
tags:
  - type/concept
  - domain/ai
  - domain/nlp
  - domain/machine-learning
  - domain/optimization
  - domain/mathematics
created: '2026-07-18'
updated: '2026-07-24'
lifecycle: active
verification: verified
artifacts:
  - 'raw/049_Layer Normalization Feature-Wise Normalization for Sequence Models.ko.md'
  - 'raw/049_Layer Normalization Feature-Wise Normalization for Sequence Models.commentary.ko.md'
evidence:
  - source_id: ba-kiros-hinton-2016-layer-normalization
    locator: '초록과 §§2–3의 layer mean·variance·gain/bias와 recurrent formulation, §§4–5의 실험'
    relation: supports
  - source_id: vaswani-et-al-2017-attention
    locator: '§3.1의 post-LN Add & Norm'
    relation: contextualizes
  - source_id: xiong-et-al-2020-transformer-layernorm
    locator: '초록과 §§2–4의 Post-LN·Pre-LN 정의와 초기 gradient 분석'
    relation: supplements
  - source_id: mit-ocw-6-012-lecture-6-2018
    locator: '§6.2의 평균으로부터의 제곱 편차로 정의한 분산'
    relation: contextualizes
related:
  - source.049
  - concept.확률변수-확률분포-기대값-분산
  - concept.batch-normalization
  - concept.rmsnorm
  - concept.잔차-연결
  - concept.transformer
---
# Layer Normalization

> [!note] 학습 안내
> **난이도:** 중급<br>
> **선수 지식:** [[벡터·행렬·텐서와 shape]], [[확률변수·확률분포·기대값·분산]]의 평균·분산 구분<br>
> **읽고 나면:** LayerNorm이 한 사례의 feature 축에서 평균·분산을 계산하는 정확한 shape, $\epsilon$·$\gamma$·$\beta$의 역할, 그리고 Post-LN·Pre-LN의 잔차 경로 차이를 숫자 예와 함께 설명할 수 있다.

## 1단계 — 먼저 잡을 핵심

[[Layer Normalization]]은 한 사례의 정해진 feature 축에서 평균·분산을 계산해 활성화를 표준화하고, feature별 학습 매개변수 gain $\gamma$와 bias $\beta$를 적용하는 정규화다. mini-batch의 다른 사례를 통계에 쓰지 않으므로, dropout처럼 별도 모드가 달라지는 층을 제외하면 훈련과 추론에서 같은 통계 계산을 쓴다.

핵심은 “한 layer 전체”가 아니라 **한 사례 안에서 정한 축**이다. 보통 Transformer hidden state의 shape가 $(B,T,D)$이면, batch $b$와 위치 $t$를 고정하고 마지막 hidden 축 $D$만 평균낸다. 서로 다른 token, 문장, batch 사례는 그 평균·분산에 섞이지 않는다.

### 확률분산과 같은 기호를 쓰지만 다른 대상

이 문서의 평균과 분산은 현재 벡터의 $D$개 feature 값을 산술적으로 요약한 값이다. feature index를 균등하게 뽑는 확률변수로 해석할 수도 있지만, LayerNorm 정의에 그런 확률모형은 필요하지 않다. [[확률변수·확률분포·기대값·분산]]이 맡는 기대값·분산의 분포 해석과, 현재 tensor 축에서 즉시 계산하는 정규화 통계를 구분한다.

## 2단계 — 작동 원리

### 가장 작은 구체적 예

한 token의 hidden vector를 $h=(2,4,6)\in\mathbb R^3$으로 두고, $\epsilon$은 설명을 위해 0으로 놓자. feature 평균과 분산은

$$
\mu=\frac{2+4+6}{3}=4,
\qquad
\sigma^2=\frac{(2-4)^2+(4-4)^2+(6-4)^2}{3}=\frac83
$$

이다. 표준편차는 $\sqrt{8/3}\approx1.633$이므로 표준화한 벡터는 대략

$$
\tilde h=\frac{h-\mu}{\sqrt{\sigma^2}}
\approx(-1.225,0,1.225)
$$

가 된다. 이제 $\gamma=(1,0.5,2)$, $\beta=(0,1,-1)$이면 최종 출력은 feature별 곱과 덧셈으로

$$
y=\gamma\odot\tilde h+\beta
\approx(-1.225,1,1.449)
$$

가 된다. $\gamma,\beta$는 세 feature와 같은 길이 $D=3$의 벡터다. 평균과 분산을 하나씩 공유해 표준화했어도, 각 feature가 최종적으로 같은 scale·offset을 가져야 한다는 제약은 없다.

### 입력에서 출력까지

1. 현재 사례의 feature 축 $D$를 정한다. $(B,T,D)$에서는 보통 하나의 $(b,t,:)$ 벡터가 한 사례다.
2. 그 $D$개 값의 평균 $\mu$와 분산 $\sigma^2$를 구한다.
3. $\sigma^2+\epsilon$의 제곱근으로 평균을 뺀 값을 나눈다.
4. 같은 shape의 학습 가능한 $\gamma$를 곱하고 $\beta$를 더한다.
5. 다음 sublayer 또는 residual 덧셈에 길이 $D$의 출력 벡터를 넘긴다.

## 3단계 — 기술과 근거

### 정의, shape, 기호

$h\in\mathbb R^D$인 한 사례의 feature 벡터에 대해

$$
\mu(h)=\frac1D\sum_{j=1}^{D}h_j,
\qquad
\sigma^2(h)=\frac1D\sum_{j=1}^{D}\bigl(h_j-\mu(h)\bigr)^2,
$$

$$
\operatorname{LN}(h)_i
=\gamma_i\frac{h_i-\mu(h)}{\sqrt{\sigma^2(h)+\epsilon}}
+\beta_i
\qquad(i=1,\ldots,D).
$$

| 기호 | 현재 식에서의 의미 | 종류·shape | 값의 범위·출처 |
| --- | --- | --- | --- |
| $h$ | 정규화 전 한 사례의 hidden state | 실수 벡터, $(D)$ | sublayer 또는 embedding 출력 |
| $D$ | 정규화할 feature 수 | 양의 정수 | hidden dimension·정규화 축 |
| $h_i$ | $i$번째 feature | 실수 스칼라 | $h$의 성분 |
| $\mu(h)$ | feature 축 산술 평균 | 실수 스칼라 | 현재 $D$개 feature에서 계산 |
| $\sigma^2(h)$ | feature 축 분산 | 음이 아닌 실수 스칼라 | 현재 $D$개 feature에서 계산 |
| $\epsilon$ | 0으로 나눔과 극단적 scale을 완화하는 상수 | 0보다 큰 스칼라 | 구현 hyperparameter |
| $\gamma,\beta$ | feature별 scale·offset | 실수 벡터, 각각 $(D)$ | 학습 매개변수 |
| $y$ | LayerNorm 출력 | 실수 벡터, $(D)$ | 다음 연산의 입력 |

$\epsilon$은 variance에 더하므로 단위는 $h$의 제곱과 맞아야 한다. 구현은 종종 작은 무차원 수로 초기화된 tensor scale을 전제로 하지만, “아무 작은 수나” 넣어도 같은 역할을 한다는 뜻은 아니다. $\gamma=1,\beta=0$이면 affine 뒤 출력도 feature 축 평균 0·분산 1에 가까워진다. 일반 $\gamma,\beta$에서는 더 이상 그 성질을 기대하지 않는다.

### Transformer에서의 위치

원 2017년 [[Transformer]]의 각 sublayer는 다음 Post-LN 형태였다.

$$
y=\operatorname{LN}\bigl(x+\operatorname{Sublayer}(x)\bigr).
$$

$x$와 $\operatorname{Sublayer}(x)$가 마지막 축에서 같은 $D$를 가져야 residual 덧셈이 가능하다. Pre-LN 변형은 보통

$$
y=x+\operatorname{Sublayer}(\operatorname{LN}(x))
$$

처럼 정규화를 sublayer 입력에 둔다. 두 구조 모두 feature 축 LayerNorm을 쓰지만, identity residual path를 정규화가 통과하는지와 초기 gradient 조건이 다르다. Post-LN의 원 논문 결과를 Pre-LN의 보편적 안정성 증거로 바꾸어 읽지 않는다.

### RMSNorm과 BatchNorm과의 경계

[[RMSNorm]]은 평균을 빼지 않고 $D^{-1}\sum_i h_i^2$의 제곱근으로 scale만 조정한다. 따라서 RMSNorm의 제곱은 중심화하지 않은 2차 moment이고, LayerNorm의 $\sigma^2$와는 $\mu(h)=0$일 때만 같다. [[Batch Normalization]]은 보통 mini-batch 사례 축에서 통계를 공유하므로 training/inference 통계 처리도 다르다. 이름에 normalization이 들어간다는 이유만으로 이 세 계산의 축이나 통계적 뜻을 바꾸어 섞지 않는다.

### RNN과 Transformer

원 논문은 RNN·LSTM에서 time step별 hidden units의 통계를 사용했고, 여러 시퀀스 과제에서 수렴을 평가했다. Transformer 원 구조는 residual addition 뒤 LayerNorm을 둔 Post-LN이었다. 이 역사적 사용 사례는 LayerNorm이 모든 architecture·정밀도·batch size에서 자동으로 학습을 안정화한다는 보장은 아니다.

## 검증과 한계

### 적용 범위와 흔한 오해

- LayerNorm이 batch 사례 사이 통계를 쓰지 않는다는 사실과 feature 사이의 의존성을 없앤다는 주장은 다르다. 같은 feature 축의 모든 값이 $\mu,\sigma^2$에 함께 들어간다.
- 정규화 축은 구현의 `normalized_shape`와 tensor layout으로 확인해야 한다. 한 문장 전체·모든 head·모든 batch를 하나의 평균으로 묶는 것이 기본 정의가 아니다.
- $D=1$이면 평균을 뺀 값이 0이라 입력 크기 정보가 사라진다. $\epsilon$은 division boundary를 다룰 뿐 의미 있는 feature 분산을 만들어 내지 않는다.
- LayerNorm은 외부 분포 이동·과적합·사실성·보정 오류를 해결하는 기법이 아니며, 대규모 학습의 안정성을 단독으로 보장하지 않는다.

## 학습 확인

### 확인 질문과 답

1. shape가 $(B,T,D)$인 Transformer hidden state에서 일반적인 LayerNorm은 평균·분산을 어느 축에서 계산하는가?

   **답:** 보통 각 $(b,t,:)$를 고정하고 마지막 feature 축 $D$에서 계산한다. batch와 token 위치를 함께 평균내지 않는다.

2. $\gamma,\beta$를 적용하기 전 표준화한 feature 벡터의 평균·분산은 무엇인가?

   **답:** $\epsilon$을 무시하고 분산이 양수라면 feature 축 평균은 0, 분산은 1이다. 일반 $\gamma,\beta$ 뒤 출력에는 이 성질이 남지 않을 수 있다.

3. Post-LN과 Pre-LN은 residual 덧셈과 정규화의 순서가 어떻게 다른가?

   **답:** Post-LN은 $x+\operatorname{Sublayer}(x)$를 정규화하고, Pre-LN은 정규화한 $x$를 sublayer에 넣은 뒤 원래 $x$와 더한다.

### 다음 문서

- [[RMSNorm]] — mean centering을 제거하고 RMS만으로 scale을 조정하는 변형을 비교한다.
- [[Transformer]] — LayerNorm 위치가 residual·attention·MLP와 결합되는 block을 본다.

## 출처

- [[049_층 정규화와 시퀀스 모델의 배치 독립성]]
- Jimmy Lei Ba·Jamie Ryan Kiros·Geoffrey E. Hinton, [Layer Normalization](https://arxiv.org/abs/1607.06450), 2016.
- Ashish Vaswani 외, [Attention Is All You Need](https://proceedings.neurips.cc/paper_files/paper/2017/hash/3f5ee243547dee91fbd053c1c4a845aa-Abstract.html), 2017.
- Ruibin Xiong 외, [On Layer Normalization in the Transformer Architecture](https://arxiv.org/abs/2002.04745), 2020.
- John Tsitsiklis·Patrick Jaillet, [Introduction to Probability: Lecture 6](https://ocw.mit.edu/courses/res-6-012-introduction-to-probability-spring-2018/resources/lecture-6-discrete-random-variables-part-ii/), 2018, §6.2.

## 관련 항목

- [[049_층 정규화와 시퀀스 모델의 배치 독립성]]
- [[확률변수·확률분포·기대값·분산]]
- [[Batch Normalization]]
- [[RMSNorm]]
- [[잔차 연결]]
- [[Transformer]]
