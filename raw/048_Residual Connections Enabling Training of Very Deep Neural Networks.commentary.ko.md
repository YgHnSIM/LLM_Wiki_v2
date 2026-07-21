# 잔차 연결: 매우 깊은 신경망의 훈련을 가능하게 하다 — 해설

## 1. 한눈에 보기

ResNet의 핵심은 (H(x))를 직접 학습하는 대신 (F(x)=H(x)-x)를 학습하고 (H(x)=F(x)+x)로 복원하는 것이다. 깊은 plain network가 얕은 counterpart보다 **훈련 오차도 높아지는 degradation 문제**를 크게 완화했다. 원문은 이를 기울기 소실 하나로 환원하지만, ResNet 논문은 정규화된 초기화와 BatchNorm이 vanishing/exploding gradient를 상당히 다룬 뒤에도 남은 최적화 난점을 별도로 지적했다.

## 2. 핵심 요약

- 잔차 블록은 (y=F(x)+x)를 계산하고, 차원이 다를 때만 (W_sx) 투영이나 다른 맞춤 방식을 쓴다.
- 항등 shortcut에는 매개변수와 계산이 없으며, 추가 층이 필요 없으면 (F\approx0)으로 만들기 쉽다는 가설이 핵심이다.
- 깊은 plain network의 높은 훈련 오차는 과적합이 아니며, 원 논문도 이를 “degradation problem”이라 불렀다.
- ResNet이 모든 기울기 소실을 제거하거나 블록 Jacobian을 항상 1로 만드는 것은 아니다. 역전파에는 (I+J_F)가 나타난다.
- 152층 ResNet 앙상블의 ILSVRC 2015 test top-5 error 3.57%가 우승 결과다. 단일 모델 수치와 앙상블 수치를 섞지 않는다.
- Highway Networks는 2015년 앞서 게이트형 shortcut으로 수백 층 훈련을 보였다. ResNet의 무매개변수 identity shortcut과 구분한다.
- Transformer 원 논문은 post-LN `LayerNorm(x + Sublayer(x))`을 사용했지만 후대 LLM은 pre-LN 등 여러 배치를 쓴다.

## 3. 역사적 배경

깊이를 늘리기 위한 스킵 경로는 ResNet만의 고립된 발상이 아니었다. Highway Networks는 LSTM에서 영감을 받은 transform·carry gate로 수백 층 정보 흐름을 조절했다. ResNet 논문도 Highway Networks를 비교 대상으로 들며, 게이트가 없는 identity shortcut은 항상 열려 있고 추가 매개변수·계산이 없다는 차이를 강조했다.

ResNet은 2015년 arXiv에 공개됐고 2016년 CVPR 논문으로 출판됐다. “2015년 발명”과 “CVPR 2016 논문”을 시기별로 함께 기록한다.

## 4. 핵심 개념 해설

목표 사상을 (H(x))라 하면 잔차 함수는 (F(x)=H(x)-x)다. 블록은 이를 (F(x)+x)로 구현한다. 여러 identity block을 통과하는 단순화된 경우 전방향 표현은 이전 표현과 잔차들의 합이 된다.

역방향에서 한 블록의 국소 Jacobian은

\[
\frac{\partial y}{\partial x}=I+\frac{\partial F}{\partial x}
\]

이다. (I) 항이 직접 경로를 주지만 전체 기울기는 여러 (I+J_F)의 곱과 다른 분기를 함께 지난다. (J_F)가 특정 방향에서 (-I)에 가까우면 상쇄될 수 있고, 큰 값이면 폭주할 수도 있다. “기울기가 그대로 복사되므로 절대 사라지지 않는다”는 보장은 아니다.

## 5. 원문의 논리 구조

글은 깊은 CNN의 성과 뒤에 더 깊은 plain network가 나빠지는 역설을 제시하고, 이를 vanishing gradient와 항등 사상 학습 난점으로 설명한다. 이어 잔차 수식과 투영 shortcut, ResNet stage를 소개하고 ImageNet 우승과 Transformer·LLM 확산을 서술한다. 마지막에는 차원 맞춤, 메모리, shortcut 의존, 과적합·계산 한계를 들고 후속 변형을 연결한다.

## 6. 왜 중요한가

ResNet은 “더 많은 층이 표현력은 늘리지만 최적화가 그 이득을 찾지 못할 수 있다”는 문제를 구조적 reparameterization으로 다뤘다. 항등 함수가 좋은 기준점이라면 전체 (H)보다 수정량 (F)를 학습하는 편이 쉬울 수 있다. 이 패턴은 비전의 특정 convolution block을 넘어 깊은 계산을 **기존 표현 + 학습된 갱신**으로 보는 일반 설계가 됐다.

## 7. 현대 LLM과의 연결

Transformer block도 attention과 feed-forward 결과를 기존 residual stream에 더한다. 정보는 residual stream을 따라 흐르고 각 sublayer가 갱신을 보탠다. 그러나 CNN ResNet의 spatial convolution block과 Transformer의 token-wise attention/MLP는 연산·정규화·스케일이 다르다.

원 Transformer는 sublayer 뒤에 residual addition과 LayerNorm을 둔 post-LN이었다. 깊은 Transformer에서는 pre-LN, residual scaling, gated residual, parallel branch 등 변형이 쓰인다. 따라서 모든 현대 LLM이 원 ResNet block을 그대로 쌓는다고 말하지 않는다.

## 8. 한계와 비판적 관점

- ResNet 원 논문은 vanishing gradient를 degradation의 유일 원인으로 확정하지 않았다. BatchNorm이 있는 plain net도 높은 훈련 오차를 보였고 저자들은 해결이 향후 연구라고 했다.
- “20층을 넘으면 BatchNorm으로도 훈련 불가”는 틀리다. 논문은 34층 plain ImageNet과 56층 plain CIFAR를 훈련했으나 얕은 망보다 optimization error가 높았다고 보고했다.
- identity mapping이 항상 최적이라는 뜻이 아니다. 잔차 parameterization은 원하는 함수가 항등에 가까울 때 특히 유리하다는 가설이다.
- dimension-changing block은 projection shortcut을 쓸 수 있지만 CIFAR 실험에서는 channel 증가 때 zero-padding identity option도 사용했다. 모든 전환이 (1\times1) projection인 것은 아니다.
- 원 ResNet의 basic block은 `conv–BN–ReLU–conv–BN–add–ReLU`이고 bottleneck은 3개 convolution이다. 후속 pre-activation block과 섞지 않는다.
- skip 때문에 별도 입력 복사 하나가 필요할 수 있지만 activation memory 총량은 autodiff 저장·재계산 정책에 좌우된다. “전통 층보다 항상 특정 배수로 메모리가 늘어난다”는 일반 법칙은 아니다.
- 3.57%는 앙상블 결과다. 단일 152-layer 모델의 10-crop top-5 error는 논문 표에서 4.49%다.
- 깊이만으로 모든 향상이 설명되지는 않는다. bottleneck 설계, BatchNorm, 초기화, augmentation, optimizer와 ensemble 조건이 함께 작동했다.
- residual connection은 표현력·최적화를 돕지만 데이터 품질, 과적합, 계산량, 사실성, 지속학습을 자동 해결하지 않는다.

## 9. 용어 정리

- **잔차 함수**: 목표 사상 (H(x))에서 입력 (x)를 뺀 (F(x)=H(x)-x).
- **잔차 연결**: 변환 결과에 입력 또는 투영 입력을 더하는 연결.
- **Identity shortcut**: 매개변수 없이 (x)를 그대로 전달하는 경로.
- **Projection shortcut**: 차원을 맞추기 위해 (W_sx)를 적용하는 경로.
- **Degradation problem**: 깊이를 늘렸을 때 과적합이 아니라 훈련 오차까지 증가하는 현상.
- **Basic block**: 보통 두 3×3 convolution을 가진 초기 ResNet 블록.
- **Bottleneck block**: 1×1–3×3–1×1 convolution으로 계산량을 조절한 깊은 ResNet 블록.
- **Pre-activation**: normalization과 activation을 convolution 앞에 두어 addition 뒤 identity path를 더 직접적으로 만든 후속 구성.

## 10. 함께 보면 좋은 항목

- He et al., “Deep Residual Learning for Image Recognition” (2015 arXiv; CVPR 2016)
- Srivastava, Greff, Schmidhuber, “Highway Networks” (2015)
- He et al., “Identity Mappings in Deep Residual Networks” (ECCV 2016)
- Vaswani et al., “Attention Is All You Need” (2017)

## 11. 읽고 생각해볼 질문

1. 기울기 소실과 높은 훈련 오차를 보이는 degradation은 어떤 실험으로 구분할 수 있는가?
2. (I+J_F)가 기울기 전달을 돕는 조건과 방해하는 조건은 무엇인가?
3. 항등 shortcut, gated highway, dense concatenation은 정보와 매개변수를 어떻게 다르게 흐르게 하는가?
4. Transformer의 pre-LN·post-LN 선택은 residual stream의 안정성에 어떤 차이를 만드는가?

## 12. 짧은 결론

ResNet의 역사적 기여는 기울기 소실을 단독으로 “해결”한 것이 아니라, 깊은 plain network가 찾지 못하던 좋은 해를 identity shortcut과 residual parameterization으로 훨씬 쉽게 최적화하게 만든 데 있다. 이 구분은 비전에서 Transformer residual stream까지 이어지는 설계 원리를 과장 없이 이해하는 핵심이다.
