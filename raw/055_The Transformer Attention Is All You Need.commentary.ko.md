# Transformer: Attention Is All You Need 해설

## 1. 한눈에 보기

Transformer는 2017년 번역을 위해 제안된 6층 encoder–decoder 구조다. 순환·합성곱 대신 scaled dot-product attention, multi-head attention, 위치별 feed-forward network, sinusoidal positional encoding, residual connection과 Post-LayerNorm을 결합했다. 핵심 장점은 훈련 시 시퀀스 위치의 표현을 병렬 계산하고 두 위치 사이 계산 경로를 한 층으로 줄인 것이다. 다만 표준 어텐션은 길이에 대해 제곱 비용이 들며, 디코더의 자기회귀 생성은 여전히 토큰별 순차 계산이다.

## 2. 핵심 요약

- 원 논문은 WMT 2014 영어→독일어에서 Transformer-big BLEU 28.4, 영어→프랑스어에서 41.8을 보고했다.
- base 모델은 8개 P100 GPU에서 12시간, big 모델은 3.5일 훈련했다고 보고했다. 모든 RNN 대비 보편적인 ‘주→일’ 속도 개선을 입증한 것은 아니다.
- base 구조는 encoder 6층·decoder 6층, $d_{model}=512$, 8 heads, head당 $d_k=d_v=64$, feed-forward 차원 2048이다.
- self-attention은 $O(n^2d)$ 연산과 $O(1)$ 순차 경로를 갖는다. RNN의 $O(nd^2)$·$O(n)$ 순차 경로와 trade-off이며, $n<d$ 조건에서 연산량 장점이 선명하다.
- sinusoidal positional encoding은 긴 길이 외삽 가능성을 기대해 선택했지만, 훈련 범위를 넘는 장문 일반화를 논문이 보장하거나 충분히 평가한 것은 아니다.
- attention weight는 내부 가중 패턴을 보여 주지만 곧바로 충실한 인과 설명이 되지는 않는다.
- BERT·GPT와 초대형 언어 모델은 Transformer의 후속 변형이지만 사전학습 목표·자료·분산 학습·하드웨어라는 별도 발전이 필요했다.

## 3. 역사적 배경

Transformer 이전 신경 번역은 RNN/LSTM encoder–decoder와 Bahdanau식 attention, GNMT의 깊은 residual LSTM·WordPiece·대규모 실행으로 발전했다. attention은 먼저 decoder가 encoder의 위치별 상태에 접근하게 해 고정 벡터 병목을 줄였다. Transformer는 그 attention을 보조 연결에서 encoder와 decoder 내부의 주 표현 연산으로 확장했다.

순환을 제거한 시퀀스 모델이 Transformer 하나뿐이었던 것도 아니다. ByteNet·ConvS2S 같은 팽창·인과 합성곱 번역 구조와 WaveNet·PixelCNN 계열이 병렬 훈련과 짧은 경로를 탐색했다. 원 논문은 이런 선행과 self-attention 모델을 직접 비교한다. 따라서 ‘attention 하나가 아무 선행 없이 RNN을 대체했다’고 쓰지 않는다.

## 4. 핵심 개념 해설

scaled dot-product attention은 다음과 같다.

$$
\operatorname{Attention}(Q,K,V)=
\operatorname{softmax}\left(\frac{QK^{\mathsf T}\,}{\sqrt{d_k}\,}+M\right)V.
$$

$M$은 decoder self-attention에서 미래 위치 점수를 막는 causal mask다. encoder self-attention에는 보통 padding 외 미래 mask가 없고, encoder–decoder attention에서는 decoder 표현이 query, encoder 출력이 key와 value가 된다.

multi-head attention은 단일 512차원 어텐션을 그대로 8번 복제하는 것이 아니다. base 모델에서는 각 head가 64차원 query·key·value 투영을 사용하고, 8개 출력을 이어 512차원으로 다시 투영한다. 서로 다른 부분공간에서 관계를 학습할 수 있지만 각 head가 반드시 ‘문법·의미·장거리’ 역할 하나씩을 안정적으로 맡는다고 보장하지 않는다.

원 구조는 각 sublayer에 $\operatorname{LayerNorm}(x+\operatorname{Sublayer}(x))$를 적용한 Post-LN이다. 오늘날 흔한 Pre-LN과 구분한다. 위치별 feed-forward는 모든 token에 같은 두 층 MLP를 독립 적용한다. 어텐션은 token 사이 정보를 섞고, MLP는 각 위치의 channel 표현을 변환한다.

## 5. 원문의 논리 구조

원문은 LSTM의 순차 훈련·장거리 의존성·메모리 문제를 제시한 뒤 self-attention, Q/K/V, multi-head, positional encoding, encoder–decoder 블록을 해법으로 설명한다. 이어 번역 성능·범용 과제·BERT/GPT·전이 학습의 영향을 확장하고, 제곱 비용·위치 표현·자원 요구를 한계로 든다. 마지막에는 오늘날 거의 모든 주요 언어 모델의 기반이라는 유산을 강조한다.

설명은 구조 입문으로 유용하지만 2017년 논문 결과와 2018년 이후 후속 성과를 한 흐름에 섞는다. ‘더 긴 문서 이해’, ‘attention interpretability’, ‘수천억 매개변수와 emergent capability’는 원 논문이 직접 실험한 결론이 아니다. 공개 문서에서는 원 번역 실험, 후속 구조 채택, 현대 제품 주장을 시간과 근거별로 분리해야 한다.

## 6. 왜 중요한가

Transformer는 훈련에서 위치별 hidden state의 순환 의존을 없애 현대 가속기의 행렬 연산을 효과적으로 활용하게 했다. 모든 위치 쌍 사이 경로가 한 attention layer로 줄어 장거리 관계에 대한 gradient path도 짧아졌다. 번역 품질과 제한된 훈련 비용을 한 구조에서 보여 준 것이 중요하다.

동시에 token 간 상호작용 연산과 위치별 비선형 변환을 분리한 블록은 encoder-only, decoder-only, multimodal 변형에 재사용하기 쉬웠다. 이후 대규모 사전학습은 이 계산 블록에 masked language modeling·causal language modeling 같은 목표와 대규모 자료를 결합했다.

## 7. 현대 LLM과의 연결

GPT는 Transformer decoder의 masked self-attention을 사용하지만 번역용 cross-attention을 제거하고 단일 token stream의 다음 토큰을 예측한다. BERT는 encoder stack에 masked language modeling과 next sentence prediction을 결합했다. 둘은 원 구조의 부분을 재사용했지만 사전학습 목표와 응용 인터페이스가 다르다.

훈련 위치 병렬성은 대규모 모델의 필요조건 중 하나였지만 충분조건은 아니다. tokenizer, optimizer와 schedule, mixed precision, tensor/data/pipeline parallelism, 대규모 말뭉치, 하드웨어와 시스템 소프트웨어가 함께 필요했다. ‘Transformer가 수천억 매개변수를 자동으로 가능하게 했다’는 단일 원인 설명을 피한다.

표준 decoder-only LLM도 생성 시 앞선 token을 필요로 한다. causal mask는 훈련 중 미래 누설을 막으면서 모든 정답 위치를 병렬 계산하게 하지만, 추론에서 미래 token을 미리 알게 해 주지 않는다. WaveNet과 Transformer를 함께 읽으면 구조적 훈련 병렬성과 자기회귀 출력의 순차성이 별개 축이라는 점이 분명해진다.

## 8. 한계와 비판적 관점

- **보편적 계산 효율**: self-attention은 $O(n^2d)$다. 원 논문도 $n<d$일 때 recurrent layer보다 빠르다고 조건을 붙였다.
- **장거리 의존성 해결**: 경로 길이는 짧지만 표현 학습과 최적화가 모든 먼 관계를 정확히 포착한다는 보장은 아니다.
- **RNN 메모리 설명**: RNN hidden vector의 차원 자체가 길이에 따라 커지는 것은 아니다. BPTT가 시점별 activation을 저장해 메모리가 늘어난다.
- **위치 외삽**: sinusoidal encoding은 외삽 가능성을 동기로 삼았지만 훨씬 긴 길이에서 성능을 보장하지 않는다.
- **attention=설명**: 시각화 가능한 가중치와 예측에 대한 충실한 인과 설명은 다르다. 가중치 교란에도 예측이 유지되거나 다른 가중치가 비슷한 출력을 낼 수 있다.
- **LayerNorm 이유**: 원 Transformer는 Post-LN을 사용했다. internal covariate shift 감소 하나로 LayerNorm의 효과를 확정하지 않는다.
- **생성 병렬화**: encoder와 teacher-forced decoder 훈련은 위치 병렬화가 가능하지만 autoregressive decoding은 순차적이다.
- **현대 모델 일반화**: GPT-4·Claude·Gemini의 상세 구조를 공개된 2017 논문만으로 ‘같은 Transformer’라고 확정할 수 없다. 공개 범위에서 Transformer 계열이라고 표현한다.

## 9. 용어 정리

- **self-attention**: 한 시퀀스 안에서 query·key·value로 위치 간 정보를 결합하는 연산.
- **cross-attention**: 한 시퀀스의 query가 다른 시퀀스의 key·value를 참고하는 연산.
- **scaled dot-product attention**: query–key 내적을 $\sqrt{d_k}$로 나눈 뒤 softmax와 value 가중합을 계산하는 방식.
- **multi-head attention**: 서로 다른 저차원 투영의 attention을 병렬 계산해 연결하는 구조.
- **causal mask**: 현재 위치가 미래 token을 보지 못하도록 attention score를 차단하는 마스크.
- **positional encoding**: 순환이 없는 모델에 위치·순서 정보를 주는 벡터.
- **position-wise feed-forward network**: 각 token 위치에 독립적으로 동일한 MLP를 적용하는 하위층.
- **Post-LN**: residual addition 뒤 LayerNorm을 적용하는 원 Transformer 배치.
- **sequential operations**: 병렬화할 수 없이 앞 단계 결과를 기다려야 하는 계산 단계 수.

## 10. 함께 보면 좋은 항목

- [[045_Sequence-to-Sequence 학습과 신경 기계 번역]]: 번역 조건부 생성 인터페이스와 recurrent attention의 선행.
- [[053_GNMT와 제품 규모 신경 번역]]: Transformer 직전의 깊은 attention LSTM 제품 시스템.
- [[054_WaveNet과 표본 단위 신경 오디오 생성]]: 팽창 인과 합성곱의 훈련 병렬성과 표본별 생성 순차성.
- [[자기회귀 생성]]: causal decoder 훈련과 생성의 조건 차이.
- [[잔차 경로와 정규화는 어디에 놓이는가]]: Post-LN과 Pre-LN의 구조적 차이.
- [[신경망 기계 번역]]: SMT·RNN seq2seq·attention·Transformer의 번역 계보.

## 11. 읽고 생각해볼 질문

1. 순차 연산 수가 $O(1)$이라는 사실과 전체 연산량이 $O(n^2d)$라는 사실은 왜 모순이 아닌가?
2. causal mask가 훈련 위치를 병렬 계산하게 하면서도 생성은 왜 순차적인가?
3. 모든 위치 사이 경로가 짧다는 사실만으로 장거리 관계를 잘 학습한다고 결론 낼 수 없는 이유는 무엇인가?
4. attention weight를 설명으로 사용하려면 단순 시각화 외에 어떤 충실성 검증이 필요한가?
5. Transformer에서 무엇이 2017년 원 구조의 핵심이고, 무엇이 대규모 사전학습 시대에 추가된 별도 발전인가?

## 12. 짧은 결론

Transformer는 순환 상태 갱신을 self-attention으로 바꾸어 번역 품질과 훈련 병렬성을 함께 보여 준 2017년의 전환이었다. 그러나 제곱 비용, 위치 외삽, 자기회귀 생성의 순차성, attention 해석의 한계가 남는다. 현대 LLM과의 연결은 강하지만, 원 번역 구조만이 아니라 사전학습 목표·자료·최적화·분산 시스템이 합류한 후속 역사로 읽어야 한다.
