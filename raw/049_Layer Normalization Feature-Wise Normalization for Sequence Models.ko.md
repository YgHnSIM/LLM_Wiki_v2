# 층 정규화: 시퀀스 모델을 위한 특징별 정규화

출처: https://mbrenndoerfer.com/writing/layer-normalization-neural-network-training

---

각 예시의 특징에 걸쳐 통계를 계산하는 층 정규화를 소개한다. 2016년의 이 기법이 RNN에서 배치 정규화의 제약을 어떻게 보완했고 Transformer의 기본 구성 요소가 됐는지 설명한다.

## 2016년: 층 정규화

2016년까지 Batch Normalization은 깊은 신경망 훈련의 표준 기법이 됐다. 원문은 이 기법이 internal covariate shift와 기울기 흐름 문제를 해결해 더 깊은 네트워크를 안정적으로 훈련하게 했다고 설명한다. 그러나 배치 통계에 의존하기 때문에 가변 길이 시퀀스, 작은 배치, 온라인 학습의 RNN에 적용할 때 어려움이 있었다.

토론토대의 지미 레이 바, 제이미 라이언 키로스, 제프리 힌턴은 배치 의존성 없이 활성화를 정규화하는 방법을 찾았다. 샘플 사이가 아니라 한 사례 안의 특징들에 걸쳐 통계를 계산하는 관점 전환이었다.

층 정규화는 한 층 입력의 특징 차원에서 평균과 분산을 계산한다. 배치 크기와 구성에 의존하지 않아 길이가 다른 시퀀스와 작은 배치, 배치 크기 1의 추론에 잘 맞는다. 이후 RNN과 Transformer의 선호 정규화 방식이 됐다. 2017년 Transformer는 여러 지점에 LayerNorm을 사용했고, 정규화 전략이 구조 특성에 맞아야 함을 보여 주었다.

## 문제

BatchNorm은 각 특징을 배치의 여러 샘플에 걸쳐 정규화한다. 같은 공간 크기와 특징 맵을 가진 이미지 배치에는 잘 맞지만, 시퀀스는 길이가 크게 다르고 padding·truncation이 배치 통계에 영향을 줄 수 있다.

긴 시퀀스 모델은 메모리 때문에 작은 배치를 쓰기도 한다. 표본이 적으면 평균과 분산 추정이 noisy해져 정규화가 불안정할 수 있다. 온라인 학습과 실시간 추론에서는 한 사례씩 처리하는 경우가 많아 훈련 중 running statistics와 추론 분포의 차이도 문제가 될 수 있다.

RNN에는 시간축도 있다. 각 시점에서 배치 방향 통계를 계산하면 시퀀스 길이와 배치 구성에 따라 통계가 달라지고 시간 동역학과 상호작용한다. 기계 번역·언어 모델·attention 기반 시퀀스 모델에는 배치 구성에서 독립적인 안정적 정규화가 필요했다.

## 해법

LayerNorm은 배치가 아니라 각 사례의 특징들에서 통계를 계산한다. 차원 (d)인 층 입력 벡터 (h)의 평균과 분산은 다음과 같다.

\[
\mu=\frac1d\sum_{i=1}^{d}h_i
\]

\[
\sigma^2=\frac1d\sum_{i=1}^{d}(h_i-\mu)^2
\]

정규화된 값은

\[
\hat h=\frac{h-\mu}{\sqrt{\sigma^2+\epsilon}}
\]

이고 학습 가능한 scale (gamma)와 shift (eta)를 적용한다.

\[
y=\gamma\odot\hat h+\beta
\]

(gamma,eta)는 특징 차원과 같은 크기이며 각 특징의 적절한 척도와 위치를 학습하게 한다.

논문에서 “layer”는 한 훈련 사례의 한 층에 있는 summed inputs 전체를 뜻한다. 완전연결층에서는 모든 hidden unit, 합성곱층에서는 한 사례의 feature map과 공간 위치 전체, 순환층에서는 각 시점의 hidden unit들에서 통계를 계산한다고 원문은 설명한다.

배치 축이 필요 없으므로 배치 크기 1에서도 쓸 수 있고 가변 길이 시퀀스를 사례별로 다룬다. 같은 입력이면 배치 동료와 무관하게 같은 통계를 얻으며, 훈련과 추론에 같은 계산을 사용해 running average나 별도 inference mode가 필요 없다.

## 응용과 영향

LayerNorm은 언어 모델·기계 번역용 LSTM과 GRU에 먼저 적용됐다. recurrent connection과 input-to-hidden 변환 등에 사용해 수렴과 hidden-state 동역학을 안정화했다.

가장 큰 영향은 Transformer에서 나타났다. 2017년 원 Transformer는 multi-head self-attention과 position-wise feed-forward 하위층의 출력에 residual connection을 더한 뒤 LayerNorm을 적용했다. 가변 길이 시퀀스와 padding으로 배치를 구성해도 각 표현의 정규화가 배치 구성에 의존하지 않았다.

GPT, BERT, T5 등 현대 언어 모델은 다양한 위치와 형태로 LayerNorm 계열을 사용한다. 대규모 훈련에서 작은 불안정성이 오랜 step 동안 누적될 수 있어 정규화의 안정성이 중요했다. 그래프 신경망, Vision Transformer, 생성 모델과 강화학습에도 쓰였다. 그래프 크기나 경험 배치가 달라지는 환경에서도 배치 통계 독립성이 유용했다.

## 한계

LayerNorm은 BatchNorm의 batch-statistics noise에서 오는 암묵적 정규화 효과가 없다. 원문은 그래서 dropout이나 weight decay 같은 명시적 정규화가 더 필요할 수 있다고 설명한다.

한 사례의 모든 특징을 함께 정규화하는 것이 항상 적절한 것은 아니다. 매우 넓은 층이나 의미·척도가 다른 특징을 한데 묶으면 최적이 아닐 수 있어 일부 차원만 정규화하는 변형이 제안됐다.

LayerNorm은 훈련과 배포 사이 외부 입력 분포 변화까지 해결하지 않는다. (gamma,eta)가 적응성을 주지만 큰 distribution shift에는 재훈련·미세조정이 필요할 수 있다.

전통 합성곱망에서는 BatchNorm이 보통 더 선호된다. 이미지의 공간 구조와 안정적인 배치 통계가 유리할 수 있기 때문이다. Vision Transformer는 LayerNorm을 성공적으로 사용하지만 표준 CNN에서 BatchNorm을 완전히 대체한 것은 아니다.

LayerNorm은 사례마다 평균과 분산을 계산한다. 실제 성능 차이는 보통 작지만 매우 높은 처리량의 추론에서는 이 연산이 병목이 될 수 있다.

## 유산과 전망

LayerNorm은 시퀀스와 Transformer에서 가장 널리 쓰이는 정규화 기법이 됐다. 정규화 축을 구조와 데이터에 맞춰야 한다는 원칙을 보여 주었다.

Transformer의 중심 구성 요소가 되면서 현대 언어 AI의 대규모 훈련에 기초가 됐다. 원문은 수십억·수조 매개변수 훈련에서 작은 불안정성을 막는 핵심 역할을 했다고 평가한다.

후속 변형인 RMSNorm은 평균 중심화를 없애고 root mean square로 scale만 정규화한다. 일부 최신 모델이 이를 채택했고, 정규화의 어떤 부분이 필수인지 탐색하게 했다. 학습 가능한 정규화 전략과 부분 차원 정규화도 연구됐다.

어떤 구조는 BatchNorm과 LayerNorm을 서로 다른 부분에 함께 쓴다. 신뢰할 수 있는 배치 통계가 있는 곳에는 BatchNorm, 배치 독립성이 필요한 곳에는 LayerNorm을 두는 식이다.

앞으로도 정규화가 attention, residual connection, activation과 어떻게 상호작용하는지는 중요한 연구 주제다. LayerNorm은 단순한 축 선택이 구조별 훈련 가능성을 크게 바꿀 수 있음을 보여 주었고, 계속 변형되면서 새로운 구조에 적용되고 있다.
