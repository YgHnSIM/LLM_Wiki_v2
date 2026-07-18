# 층 정규화: 시퀀스 모델을 위한 특징별 정규화 — 해설

## 1. 한눈에 보기

Layer Normalization은 mini-batch의 같은 neuron을 가로지르는 BatchNorm과 달리, 한 사례의 한 층에 있는 summed inputs를 가로질러 평균·분산을 계산한다. RNN에서는 시점마다 hidden units를 정규화해 훈련·시험 계산이 같고 배치 크기에 의존하지 않는다. Transformer에서는 일반적으로 각 token의 hidden feature dimension이 정규화 축이다. 원문은 핵심을 잘 설명하지만 internal covariate shift, (gamma,eta)의 역복원, RMSNorm과 Transformer 배치를 과장하거나 혼동한다.

## 2. 핵심 요약

- BatchNorm은 neuron/feature별로 mini-batch 사례의 통계를 쓰고 LayerNorm은 사례별로 layer의 hidden units 통계를 쓴다.
- RNN에서 LayerNorm 통계는 각 time step마다 별도로 계산되며 gain·bias는 시간에 걸쳐 공유할 수 있다.
- 훈련과 시험에 같은 계산을 사용하고 running average가 필요 없다.
- (gamma,eta)는 특징별 affine freedom을 주지만 각 사례의 원래 평균·분산을 정확히 복원하는 일반 역함수가 아니다.
- 원 논문은 RNN·LSTM, attentive reader, skip-thought 등에서 수렴·성능을 평가했다. 모든 시퀀스 과제에 보편적으로 우월하다는 정리는 아니다.
- 원 Transformer는 `LayerNorm(x + Sublayer(x))`인 post-LN이었다. 현대 모델에는 pre-LN과 다른 변형이 많다.
- RMSNorm은 variance만 쓰는 것이 아니라 mean centering을 없애고 (\sqrt{d^{-1}\sum_i x_i^2})를 쓴다.

## 3. 역사적 배경

Ioffe·Szegedy의 2015년 BatchNorm은 mini-batch 통계로 각 neuron의 summed input을 정규화했다. Ba·Kiros·Hinton은 이 효과가 mini-batch 크기에 의존하고 RNN에 어떻게 적용할지 자명하지 않다고 보았다. LayerNorm 논문은 2016년 arXiv에 공개됐다.

BatchNorm의 원 동기인 “internal covariate shift 감소”는 후대에 유일한 설명으로 받아들여지지 않았다. Santurkar 등의 2018년 연구는 분포 안정성보다 loss·gradient의 smoothness를 중요한 효과로 제시했다. LayerNorm을 설명할 때도 internal covariate shift가 확정된 병인이고 정규화가 이를 해결했다는 문장을 사실처럼 고정하지 않는다.

## 4. 핵심 개념 해설

벡터 (h\in\mathbb R^d)에 대해

\[
\mu=\frac1d\sum_i h_i,\qquad
\sigma^2=\frac1d\sum_i(h_i-\mu)^2
\]

\[
\operatorname{LN}(h)=\gamma\odot
\frac{h-\mu}{\sqrt{ \sigma^2+\epsilon } }+\beta
\]

이다. 중요한 것은 “feature-wise”라는 표현만 아니라 **어떤 tensor axis를 feature 집합으로 정했는가**다. 표준 Transformer tensor `[batch, sequence, hidden]`에서는 보통 마지막 hidden 축을 각 token별로 정규화한다. 한 문장 전체 token과 hidden dimension을 한꺼번에 평균내지 않는다.

정규화 뒤 각 사례의 (mu,sigma) 정보는 사라진다. 고정된 (gamma,eta)는 모든 사례에 공통이므로 사례마다 다른 원래 평균·분산을 일반적으로 복원할 수 없다. affine parameter의 역할은 정규화된 특징별로 유용한 척도와 offset을 다시 학습하는 것이다.

## 5. 원문의 논리 구조

글은 BatchNorm의 RNN 적용 문제를 배치·길이·온라인 추론 관점에서 제시하고, 사례 내 특징 통계와 affine 변환을 해법으로 소개한다. 이어 RNN에서 Transformer·LLM으로 확산된 영향을 서술하고, regularization·축 선택·분포 이동·CNN 성능·계산 비용을 한계로 든다. 마지막에는 RMSNorm과 혼합 정규화로 후속 연구를 연결한다.

## 6. 왜 중요한가

LayerNorm은 정규화가 단일한 “표준 전처리”가 아니라 텐서의 어느 축에서 비교 기준을 만드는가라는 구조 설계임을 분명히 했다. 배치 동료가 바뀌어도 한 token 표현이 같은 방식으로 정규화되므로 variable batch와 autoregressive inference에 자연스럽다. 이 축 선택은 residual stream을 사용하는 Transformer에서 특히 중요한 안정화 구성 요소가 됐다.

## 7. 현대 LLM과의 연결

Transformer 원 논문의 각 하위층 출력은 `LayerNorm(x + Sublayer(x))`였다. 이를 post-LN이라 한다. 후대 pre-LN은 `x + Sublayer(LayerNorm(x))`처럼 normalization을 branch 안쪽에 두어 residual path를 더 직접적으로 만든다. 두 배치는 initialization gradient와 warmup 요구, 깊이 안정성에 차이가 있다.

“GPT·BERT·T5가 모두 같은 LayerNorm”도 정확하지 않다. 세대·구현에 따라 pre/post 위치, final normalization, bias 사용과 RMSNorm 계열 여부가 다르다. 모델별 구조 문헌을 확인해야 한다.

## 8. 한계와 비판적 관점

- variable-length sequence가 BatchNorm을 수학적으로 불가능하게 하는 것은 아니다. masking·time-step statistics·recurrent BatchNorm 같은 적응법이 있지만 복잡하고 배치 의존성이 남는다.
- LayerNorm이 각 입력을 “zero mean, unit variance 출력”으로 만든다는 문장은 affine (gamma,eta) 적용 전 standardized vector에만 정확하다.
- (epsilon) 위치와 variance estimator, 정규화 axes는 구현마다 확인해야 한다.
- BatchNorm의 batch noise가 항상 유익한 regularizer이고 LayerNorm은 항상 더 강한 dropout이 필요하다는 보편 결론은 아니다.
- standard CNN에서 BN이 흔하다는 경험을 모든 vision task로 일반화하지 않는다. GroupNorm, LayerNorm 기반 ConvNet과 Vision Transformer가 있다.
- LayerNorm은 batch composition에는 독립적이지만 한 사례의 다른 feature들이 서로의 평균·분산에 영향을 준다.
- 입력 distribution shift를 해결하지 않으며, normalization 자체가 사실성·일반화·안전성을 보장하지 않는다.
- RMSNorm의 분모는 variance가 아니라 uncentered second moment의 제곱근이다. 평균이 0일 때만 표준편차와 일치한다.
- LayerNorm이 “Transformer를 가능하게 한 단일 원인”은 아니다. attention, residual connection, initialization, optimizer, learning-rate schedule과 함께 작동한다.

## 9. 용어 정리

- **Layer Normalization**: 한 사례의 정해진 feature axes에서 평균·분산을 계산하는 정규화.
- **Batch Normalization**: 같은 feature의 mini-batch 사례들에서 통계를 계산하는 정규화.
- **정규화 축**: 평균·분산이나 RMS를 집계하는 tensor dimension 집합.
- **Gain (gamma)**: 정규화된 특징을 원소별로 재스케일하는 학습 parameter.
- **Bias (eta)**: 정규화된 특징에 원소별 offset을 더하는 학습 parameter.
- **Post-LN**: residual addition 뒤 LayerNorm을 두는 Transformer 배치.
- **Pre-LN**: sublayer 입력을 먼저 정규화하고 branch 결과를 residual에 더하는 배치.
- **RMSNorm**: mean centering 없이 root mean square로 scale만 정규화하는 변형.

## 10. 함께 보면 좋은 항목

- Ba, Kiros, Hinton, “Layer Normalization” (2016)
- Ioffe, Szegedy, “Batch Normalization” (2015)
- Vaswani et al., “Attention Is All You Need” (2017)
- Zhang, Sennrich, “Root Mean Square Layer Normalization” (NeurIPS 2019)
- Xiong et al., “On Layer Normalization in the Transformer Architecture” (2020)

## 11. 읽고 생각해볼 질문

1. `[batch, sequence, hidden]` 텐서에서 축 선택이 바뀌면 어떤 표본들이 서로의 통계에 영향을 주는가?
2. (gamma,eta)가 되돌릴 수 있는 정보와 정규화에서 영구히 사라지는 정보는 무엇인가?
3. post-LN과 pre-LN에서 residual path와 초기 gradient는 어떻게 달라지는가?
4. RMSNorm이 평균 중심화를 제거해도 잘 작동하는 조건은 무엇인가?

## 12. 짧은 결론

LayerNorm의 핵심은 “배치 정규화보다 좋은 정규화”라는 순위가 아니라, 한 사례의 feature 축을 통계 기준으로 삼아 RNN과 Transformer의 배치 독립적 계산에 맞춘 데 있다. 축, affine, residual과의 위치, RMSNorm 변형을 구분해야 현대 LLM에서의 실제 역할이 선명해진다.
