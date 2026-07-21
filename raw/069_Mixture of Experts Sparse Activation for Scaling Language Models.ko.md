# 전문가 혼합: 언어 모델 확장을 위한 희소 활성화

Source: https://mbrenndoerfer.com/writing/mixture-of-experts-sparse-activation

---

라우팅 메커니즘, 로드 밸런싱, 출현적 전문화를 비롯해 희소 활성화가 어떻게 실용적인 계산 비용을 유지하면서 모델을 수조 개 매개변수 규모로 확장할 수 있게 했는지를 다루는 전문가 혼합(Mixture of Experts, MoE) 아키텍처 종합 안내서다.

## 2021년: 전문가 혼합

2021년에 이르러 대규모 언어 모델 분야는 변곡점에 도달했다. 1,750억 개 매개변수를 가진 [GPT-3](/writing/gpt3-in-context-learning-emergent-capabilities-from-scale) 같은 모델은 전례 없는 능력을 보여주었지만, 신경망을 확장하는 방식의 근본적인 한계도 드러냈다. 이 거대한 밀집 모델은 순전파할 때마다 1,750억 개 매개변수를 모두 활성화해야 했으므로 학습과 추론 모두 계산 비용이 많이 들었다. Google과 다른 선도 기관의 연구자들은 이런 일률적인 활성화 패턴이 비효율적이라는 사실을 알아차렸다. 모든 입력에 모델의 전체 용량이 필요한 것은 아니었지만, 밀집 아키텍처에는 관련된 매개변수만 선택적으로 활성화할 방법이 없었다. 이 통찰은 [전문가 혼합](/writing/mixtral-8x7b-sparse-mixture-of-experts-architecture)(MoE) 아키텍처가 널리 채택되는 계기가 되었으며, 실용적인 계산 비용을 유지하면서 모델을 수조 개 매개변수 규모로 확장할 수 있게 하는 패러다임 전환으로 이어졌다.

전문가 혼합이라는 개념이 완전히 새로운 것은 아니었다. 1990년대의 연구에서도 게이팅 메커니즘으로 입력을 라우팅하는 여러 [전문가 네트워크](/writing/expert-networks-moe-architecture-ffn-implementation)를 탐구했다. 그러나 이러한 초기 접근법은 실용적인 문제, 특히 학습 안정성과 [로드 밸런싱](/writing/scaling-ai-agents-performance-cost-optimization) 문제를 해결하는 데 어려움을 겪었다. 2021년에는 여러 요인이 맞물리면서 MoE 아키텍처를 대규모로 구현할 수 있게 되었다. [Transformer](/writing/transformer-attention-is-all-you-need) 아키텍처는 전문가 네트워크를 위한 안정적인 토대를 제공했다. 분산 학습의 발전으로 많은 장치에 걸쳐 모델을 학습할 수 있게 되었다. 무엇보다 연구자들은 [MoE 모델](/writing/sparse-models-conditional-computation-efficiency)이 소수의 전문가만 사용하는 상태로 붕괴하는 흔한 실패를 막아 주는 로드 밸런싱과 라우팅 기법을 개발했다.

돌파구는 Google Brain과 Google Research의 연구자들이 2021년에 GShard와 [Switch Transformer](/writing/switch-transformer-top-1-routing-trillion-parameter-scaling) 모델로 새로운 MoE 아키텍처를 소개하면서 마련되었다. 이 모델들은 [MoE](/writing/mixtral-8x7b-sparse-mixture-of-experts-architecture) 아키텍처가 비슷한 계산 비용의 밀집 모델보다 더 나은 성능을 거두면서도, 밀집 아키텍처로는 실용적이지 않을 규모까지 확장될 수 있음을 보여주었다. 핵심 혁신은 [전문가 네트워크](/writing/expert-networks-moe-architecture-ffn-implementation)를 Transformer 계층으로 설계하고, 학습 중 작업을 여러 전문가에게 분배하는 법을 배우는 정교한 라우팅 메커니즘을 개발한 것이었다. 이 연구는 언어 모델 확장의 기본 아키텍처 패턴으로 MoE를 확립했다.

MoE 아키텍처의 중요성은 계산 효율성을 넘어섰다. 이 모델들은 서로 다른 전문가가 명시적인 감독 없이도 서로 다른 유형의 입력이나 과제를 자연스럽게 담당하는 출현적 전문화의 한 형태를 가능하게 했다. 전문가들은 서로 다른 도메인, 언어, 추론 패턴에 특화될 수 있었고, 하나의 모델 안에 모듈식 지능의 한 형태를 만들었다. 이러한 전문화 능력은 폭넓은 지식과 전문성을 모두 요구하는 응용 분야에서 가치가 있는 것으로 나타났으며, 언어 모델을 배포하고 사용하는 방식에 새로운 가능성을 열었다.

## 문제

2020년과 2021년 초에 걸쳐 언어 모델이 커지면서 연구자들은 근본적인 확장 문제에 부딪혔다. 순전파마다 모든 매개변수를 활성화하는 밀집 신경망 아키텍처는 모델 크기가 수천억 개 매개변수에 가까워질수록 점점 더 비효율적이 되었다. 2020년에 1,750억 개 매개변수로 공개된 [GPT-3](/writing/gpt3-in-context-learning-emergent-capabilities-from-scale)는 모델 전체 용량의 일부만 필요할 수 있는 간단한 과제에서도 1,750억 개 매개변수를 모두 활성화해야 했다. 이러한 일률적인 활성화 패턴 때문에 계산 비용은 모델 크기에 선형으로 비례해 증가했고, 일정 지점을 넘어 모델을 확장하기가 비용상 어려워졌다.

밀집 모델의 메모리 요구량도 감당하기 어려운 수준으로 커지고 있었다. 모든 매개변수를 메모리에 저장해야 했으며, 순전파할 때마다 모든 매개변수를 불러와 계산해야 했다. 수천억 개 매개변수로 이루어진 모델은 가중치만 저장하는 데도 상당한 하드웨어 자원이 필요했다. 이 모델들을 학습하려면 수백 또는 수천 대의 장치로 구성된 값비싼 GPU 클러스터가 필요했으므로, 대부분의 연구 기관에는 접근하기 어려웠다. 계산과 메모리 제약은 밀집 모델을 얼마나 크게 만들 수 있는지에 실질적인 상한을 만들고 있었다.

밀집 아키텍처는 모델이 커질수록 수익 체감 문제도 겪었다. 연구자들은 밀집 모델에 매개변수를 더 추가할 때 매개변수 하나당 얻는 개선 폭이 초기 확장 단계보다 줄어든다는 사실을 발견했다. 매개변수 하나가 모델 능력에 기여하는 정도가 작아지면서 확장 비용은 그 이점보다 더 빠르게 증가했다. 일정 지점을 넘으면 밀집 모델에 매개변수를 더 추가하는 것만으로는 의미 있는 개선을 얻지 못했으며, 모델 성능을 계속 높이려면 아키텍처 변화가 필요할 수 있음을 시사했다.

또 다른 근본적인 한계는 밀집 모델이 복잡도와 관계없이 모든 계산에 모델 전체 용량을 사용하며 모든 입력을 똑같이 취급한다는 점이었다. 기본적인 사실 회상만 필요한 간단한 질문도 정교한 분석이 필요한 복잡한 추론 과제와 마찬가지로 모든 매개변수를 활성화했다. 이러한 일률적 활성화는 필요하지 않은 과제에도 계산 자원을 소비하는 한편, 실용적으로 배포할 수 있는 전체 모델 크기를 제한하는 낭비였다. 입력의 특성에 따라 관련 매개변수만 선택적으로 활성화할 수 없다는 점은 밀집 아키텍처의 근본적인 비효율이었다.

초거대 밀집 모델의 학습 동역학도 문제를 일으켰다. 모델이 수천억 개 매개변수 규모로 커지면서 학습은 점점 불안정해지고 비용도 증가했다. 학습 중 기울기(gradient)와 옵티마이저 상태(optimizer state)를 저장하는 데 필요한 메모리가 모델 크기와 함께 늘어나, 효과적인 배치 크기(batch size)나 [학습률 스케줄](/writing/full-fine-tuning-hyperparameters-learning-rate-schedules)을 사용하기가 어려워졌다. 이러한 학습 문제는 밀집 아키텍처의 실용적인 확장성을 더욱 제한했고, 더 효율적으로 자원을 사용하면서 비슷하거나 더 나은 성능을 얻을 대안에 대한 압력을 키웠다.

## 해법

[전문가 혼합](/writing/mixtral-8x7b-sparse-mixture-of-experts-architecture) 아키텍처는 신경망 계산에 희소성을 도입해 이러한 한계를 해결했다. [MoE 모델](/writing/sparse-models-conditional-computation-efficiency)은 모든 입력에 모델의 모든 매개변수를 사용하는 대신, 모델을 각각 독립적으로 입력을 처리할 수 있는 완전한 신경망인 여러 [전문가 네트워크](/writing/expert-networks-moe-architecture-ffn-implementation)로 나눈다. 학습된 게이팅 또는 라우팅 메커니즘은 각 입력을 처리할 전문가를 선택하며, 일반적으로 많은 전문가 가운데 1~2개만 활성화한다. 이 희소 활성화 패턴을 사용하면 전체 매개변수 수가 매우 크더라도 활성 전문가만 계산하면 되므로 순전파 한 번의 계산 비용은 훨씬 작다.

2021년에 MoE 아키텍처를 대규모로 실현할 수 있게 한 핵심 혁신은 전문가 네트워크를 [Transformer](/writing/transformer-attention-is-all-you-need) 계층에 통합한 것이었다. Google Brain의 연구자들은 표준 밀집 피드포워드 계층을 여러 전문가 피드포워드 네트워크로 대체해, 전문가 네트워크를 Transformer 아키텍처 안의 피드포워드 계층으로 설계했다. 각 전문가는 완전한 2계층 피드포워드 네트워크였고, 라우팅 메커니즘이 token 또는 token 묶음마다 사용할 전문가를 선택했다. 이 설계는 Transformer 아키텍처에서 효과가 입증된 구조를 유지하면서 희소 활성화의 효율성 이점을 도입했다.

### 라우팅 메커니즘

라우팅 메커니즘은 각 입력을 어느 전문가가 처리할지 결정하는 핵심 구성 요소다. 2021년에 소개된 [MoE](/writing/mixtral-8x7b-sparse-mixture-of-experts-architecture) 아키텍처에서 라우팅은 일반적으로 token 수준에서 작동해, 시퀀스의 각 token 위치를 서로 다른 전문가에게 보낼 수 있었다. [게이팅 네트워크](/writing/moe-gating-networks-router-architecture-design)라고도 부르는 라우팅 네트워크는 token 표현을 입력으로 받아 사용 가능한 모든 전문가에 대한 확률분포를 만든다. 이 메커니즘은 각 전문가의 점수를 계산하고, [softmax](/writing/multinomial-logistic-regression-complete-guide-mathematical-foundations-python-implementation)를 적용해 확률을 만든 다음, 그 확률에 따라 top-k 전문가를 선택한다. 일반적으로 k=1 또는 k=2다.

라우팅의 수학적 정식화는 전문가 점수를 계산하는 데서 시작한다. token 표현 hhh가 주어지면 게이팅 네트워크는 각 전문가 iii의 점수를 다음과 같이 계산한다.

gi(h)=Wi⋅h+big\_i(h) = W\_i \cdot h + b\_igi​(h)=Wi​⋅h+bi​

여기서 WiW\_iWi​와 bib\_ibi​는 전문가 iii의 학습 매개변수다. 이어서 이 점수들을 [softmax 함수](/writing/linear-classifiers-neural-network-foundations)로 정규화해 확률분포를 만든다.

Pi(h)=exp⁡(gi(h))∑j=1Nexp⁡(gj(h))P\_i(h) = \frac{\exp(g\_i(h))}{\sum\_{j=1}^{N} \exp(g\_j(h))}Pi​(h)=∑j=1N​exp(gj​(h))exp(gi​(h))​

여기서 NNN은 전문가의 총수다. 라우팅 메커니즘은 확률이 가장 높은 top-k 전문가를 선택한다. 최종 출력은 구체적인 [MoE](/writing/mixtral-8x7b-sparse-mixture-of-experts-architecture) 변형에 따라 선택된 전문가들의 출력에 라우팅 확률을 가중해 결합하거나, 단순한 가중합으로 결합한다.

### 로드 밸런싱

MoE 아키텍처의 중대한 과제 가운데 하나는 학습 중 작업이 전문가들에게 고르게 분배되도록 보장하는 것이다. 한 전문가가 대부분의 입력을 받고 다른 전문가들이 유휴 상태로 남는다면, 모델은 사실상 더 작은 밀집 모델로 축소되어 효율성의 이점을 잃는다. 초기 [MoE 모델](/writing/sparse-models-conditional-computation-efficiency)은 라우팅 메커니즘이 늘 같은 소수의 전문가에게 입력을 보내는 법을 학습해 여러 전문가를 둔 목적이 무너지는 이러한 붕괴를 자주 겪었다.

2021년의 MoE 아키텍처는 [로드 밸런싱](/writing/scaling-ai-agents-performance-cost-optimization) 문제를 해결하기 위해 여러 기법을 도입했다. GShard 모델은 각 전문가에게 보낼 수 있는 token 수를 제한하는 [용량 제약](/writing/moe-load-balancing-expert-collapse-token-distribution)을 사용해 더 고른 분배를 강제했다. [Switch Transformer](/writing/switch-transformer-top-1-routing-trillion-parameter-scaling)는 불균등한 전문가 사용에 벌점을 주는 보조 [로드 밸런싱 손실](/writing/auxiliary-balancing-loss-mixture-of-experts-moe)을 도입했다. 이 손실 항은 예시 배치 전체에서 전문가 사용량의 [분산](/writing/descriptive-statistics-guide-python-data-analysis)을 측정해 주 학습 손실에 더했다. 그 결과 라우팅 메커니즘은 라우팅 결정의 품질을 유지하면서 작업을 더 고르게 분배하도록 유도되었다.

로드 밸런싱 목적은 일반적으로 전문가가 얼마나 고르게 사용되는지를 측정한다. 흔한 접근법 가운데 하나는 전문가 사용량의 변동계수를 계산해, 어떤 전문가는 다른 전문가보다 훨씬 많은 입력을 받는 경우에 벌점을 준다. 이 항을 학습 손실에 포함하면 모델은 모든 전문가가 대략 고르게 사용되도록 유지하면서 입력을 적합한 전문가에게 보내는 법을 배운다. 라우팅 품질과 로드 밸런싱 사이의 이러한 균형은 [MoE](/writing/mixtral-8x7b-sparse-mixture-of-experts-architecture) 아키텍처가 대규모로 효과를 내게 하는 데 결정적이었다.

### 전문가 아키텍처

2021년의 MoE 아키텍처에서 각 전문가는 일반적으로 [Transformer](/writing/transformer-attention-is-all-you-need) 아키텍처 안의 피드포워드 신경망으로 구현되었다. 표준 [Transformer 계층](/writing/transformer-block-assembly)은 다중 헤드 자기어텐션(self-attention) 메커니즘 뒤에 피드포워드 네트워크를 둔다. MoE 변형에서는 이 피드포워드 네트워크를 여러 전문가 피드포워드 네트워크와 라우팅 메커니즘으로 대체했다. 각 전문가는 같은 아키텍처를 가진 완전한 2계층 피드포워드 네트워크로, 일반적으로 입력 차원을 확장하고 비선형 활성화를 적용한 다음 원래 차원으로 다시 투영했다.

[전문가 네트워크](/writing/expert-networks-moe-architecture-ffn-implementation)는 같은 아키텍처로 시작했지만 학습 중에 서로 다른 전문성을 습득했다. 라우팅 메커니즘을 통해 서로 다른 전문가가 서로 다른 유형의 입력을 처리하면서 특화된 지식이나 패턴을 발전시켰다. 연구자들은 명시적인 감독 없이도 전문가들이 서로 다른 도메인, 언어, 추론 패턴에 자연스럽게 특화되는 현상을 관찰했다. 이러한 출현적 전문화는 [MoE](/writing/mixtral-8x7b-sparse-mixture-of-experts-architecture) 아키텍처에서 가장 흥미로운 측면 가운데 하나였으며, 라우팅 메커니즘이 하나의 모델 안에 모듈식 지능의 한 형태를 만들 수 있음을 보여주었다.

### 확장의 이점

모델 크기를 확장하면 MoE 아키텍처의 계산상 이점이 분명하게 드러났다. PPP개의 매개변수로 이루어진 밀집 모델은 순전파마다 PPP개 매개변수를 모두 사용해 계산해야 한다. 각각 EEE개 매개변수로 이루어진 전문가 NNN개를 둔 MoE 모델의 전체 매개변수 수는 N×EN \times EN×E지만, 순전파마다 활성화되는 매개변수는 k×Ek \times Ek×E개뿐이다. 여기서 kkk는 활성 전문가 수로, 일반적으로 1~2개다. 따라서 MoE 모델은 순전파당 계산 비용을 비슷하게 유지하면서 밀집 모델보다 훨씬 많은 전체 매개변수를 가질 수 있다.

예를 들어 1,750억 개 매개변수로 이루어진 밀집 모델은 입력마다 1,750억 개 매개변수를 모두 사용해 계산해야 한다. 각각 200억 개 매개변수로 이루어진 전문가 8개를 둔 MoE 모델은 총 1,600억 개 매개변수를 갖지만, 입력마다 200억~400억 개 매개변수만 사용해 계산한다. 활성 전문가가 한 개인지 두 개인지에 따라 계산량이 달라진다. 이러한 희소 활성화 패턴을 통해 연구자들은 학습과 추론의 계산 비용을 합리적인 수준으로 유지하면서, 밀집 아키텍처로는 실용적이지 않을 규모까지 모델을 확장할 수 있었다.

출현적 전문화

MoE 아키텍처의 주목할 만한 측면 가운데 하나는 명시적인 감독 없이도 전문가들이 학습 중에 자연스럽게 전문성을 발전시킨다는 점이다. 학습된 MoE 모델을 분석한 연구자들은 서로 다른 전문가가 서로 구별되는 패턴에 특화된다는 사실을 발견했다. 어떤 전문가는 과학 용어에, 다른 전문가는 대화 언어에, 또 다른 전문가는 특정 유형의 추론에 특화될 수 있었다. 이러한 출현적 모듈성은 MoE 아키텍처가 밀집 모델로는 불가능한 방식으로 지식을 조직하는 법을 배울 수 있음을 시사하며, 더 해석 가능하고 전문 응용 분야에 더 유용한 모델이 될 가능성을 보여준다.

## 응용과 영향

2021년에 소개된 [MoE](/writing/mixtral-8x7b-sparse-mixture-of-experts-architecture) 아키텍처, 특히 [Switch Transformer](/writing/switch-transformer-top-1-routing-trillion-parameter-scaling)와 GShard 모델은 비슷한 계산 비용의 밀집 모델보다 크게 향상된 성능을 보여주었다. 1조 6,000억 개가 넘는 매개변수 규모로 확장된 Google의 Switch Transformer는 [MoE 모델](/writing/sparse-models-conditional-computation-efficiency)이 밀집 모델보다 계산 단위당 더 나은 성능을 낼 수 있음을 보여주었다. 이 모델은 계층마다 128개 전문가를 사용했으며, 더 작은 밀집 모델과 비슷한 학습 시간이 들면서도 언어 모델링 과제의 [퍼플렉서티](/writing/perplexity-language-model-evaluation-metric)를 크게 개선했다. 이는 언어 모델을 확장하는 데 MoE 아키텍처가 실용적으로 타당함을 보여주었다.

MoE 아키텍처의 효율성 향상으로 중간 수준의 계산 자원을 가진 조직도 초거대 모델을 학습하고 배포할 수 있게 되었다. [GPT-3](/writing/gpt3-in-context-learning-emergent-capabilities-from-scale) 같은 밀집 모델에는 막대한 계산 인프라가 필요했지만, 능력이 비슷하거나 더 나은 MoE 모델은 더 효율적으로 학습할 수 있었다. 대규모 언어 모델에 대한 이러한 접근의 대중화는 여러 조직과 사용 사례에서 연구하고 배포할 새로운 가능성을 열었다. 이제 더 작은 연구 집단도 밀집 모델로는 불가능했을 아키텍처를 실험할 수 있었다.

MoE 모델은 폭넓은 지식과 전문성을 모두 요구하는 과제에서 특히 효과적이었다. 전문가들의 출현적 전문화 덕분에 하나의 모델이 다양한 입력을 효과적으로 처리할 수 있었다. 서로 다른 전문가는 서로 다른 도메인에 특화될 수 있었으므로, 모델은 일반 언어 과제와 전문 응용 분야 모두에서 뛰어난 성능을 낼 수 있었다. 이러한 능력은 [MoE 모델](/writing/sparse-models-conditional-computation-efficiency)을 과학 문헌부터 대화 텍스트와 코드에 이르기까지 다양한 콘텐츠 유형을 처리해야 하는 응용 분야에 유용하게 만들었다.

MoE 모델의 라우팅 메커니즘은 밀집 모델에는 없던 해석 가능성의 한 형태도 제공했다. 어떤 유형의 입력에서 어느 전문가가 활성화되는지를 살펴보면 연구자는 모델이 정보를 처리하는 방식에 관한 통찰을 얻을 수 있었다. 모든 매개변수가 항상 활성화되어 어떤 부분이 특정 예측에 기여했는지 파악하기 어려운 밀집 아키텍처보다, 이러한 해석 가능성은 모델 행동을 이해하고 문제를 더 효과적으로 디버깅하는 데 도움이 되었다.

2021년 MoE 모델의 성공적인 확장은 이후 대규모 언어 모델의 발전에 영향을 미쳤다. [Switch Transformer](/writing/switch-transformer-top-1-routing-trillion-parameter-scaling)와 GShard가 보여준 아키텍처 원리는 후대 모델에 채택되고 개선되었다. 모델 규모가 계속 커지면서 희소 활성화의 효율성 이점은 점점 더 중요해졌고, [MoE](/writing/mixtral-8x7b-sparse-mixture-of-experts-architecture) 아키텍처는 초거대 언어 모델을 학습하는 기본 접근법이 되었다.

## 한계

장점에도 불구하고 [MoE](/writing/mixtral-8x7b-sparse-mixture-of-experts-architecture) 아키텍처는 연구자들이 해결해야 할 몇 가지 새로운 과제를 불러왔다. 중요한 한계 가운데 하나는 [MoE 모델](/writing/sparse-models-conditional-computation-efficiency)이 밀집 모델보다 학습하기 복잡하다는 점이었다. 라우팅 메커니즘이라는 추가 구성 요소를 학습해야 했고, [로드 밸런싱](/writing/scaling-ai-agents-performance-cost-optimization) 목적 함수가 학습 과정을 더 복잡하게 만들었다. MoE 모델을 학습하려면 라우팅, 로드 밸런싱, [용량 제약](/writing/moe-load-balancing-expert-collapse-token-distribution)에 관련된 하이퍼파라미터(hyperparameter)를 세심하게 조정해야 했으므로, 밀집 모델보다 효과적으로 학습하기가 더 어려웠다.

MoE 모델의 [동적 라우팅](/writing/mixture-of-experts-at-scale-sparse-activation-dynamic-routing-efficient-scaling)도 학습 불안정을 일으킬 수 있었다. 라우팅 결정은 학습 매개변수에 의존했고, 모델이 학습됨에 따라 라우팅 패턴도 달라질 수 있었다. 이러한 동적 특성은 라우팅 패턴이 갑자기 바뀌어 학습이 불안정해지는 일관되지 않은 학습 동역학을 초래할 수 있었다. 연구자들은 보조 손실을 사용하고 용량 제약을 세심하게 설계하는 등 학습을 안정화하는 기법을 개발해야 했다.

MoE 모델의 메모리 요구 사항도 밀집 모델보다 복잡했다. MoE 모델은 희소 활성화로 계산 효율성을 높일 수 있었지만, 여전히 모든 전문가 매개변수를 메모리에 저장해야 했으며 전문가가 많으면 그 크기도 상당했다. 게다가 라우팅 메커니즘과 [로드 밸런싱](/writing/scaling-ai-agents-performance-cost-optimization) 계산이 일부 메모리 오버헤드를 더했다. 전문가가 수백 개인 초거대 [MoE 모델](/writing/sparse-models-conditional-computation-efficiency)은 여전히 상당한 메모리가 필요할 수 있었지만, 대체로 동등한 밀집 모델보다는 관리하기 쉬웠다.

라우팅 메커니즘 자체도 어느 정도 계산 오버헤드를 발생시켰다. 각 token의 [라우팅 점수](/writing/moe-gating-networks-router-architecture-design)를 계산하고 top-k 전문가를 선택하는 과정에는 밀집 모델에 없는 계산이 추가되었다. 이 오버헤드는 일반적으로 희소 활성화에서 얻는 절감량에 비하면 작았지만, 효율성 이점을 일부 줄였다. 모든 전문가의 라우팅 점수를 계산하는 비용이 눈에 띄게 커질 수 있기 때문에, 전문가가 많은 모델일수록 라우팅 오버헤드도 더 중요해졌다.

MoE 모델은 밀집 모델보다 예측 가능성이 낮을 수 있다는 한계도 있었다. 입력마다 서로 다른 전문가가 활성화되므로 추론 계산 비용은 어떤 전문가가 선택되느냐에 따라 달라질 수 있었다. 이러한 가변성 때문에 추론 시간을 예측하기가 더 어려워졌고, 일정한 지연 시간이 중요한 배포 환경에서는 문제가 복잡해질 수 있었다. 이와 달리 밀집 모델은 모든 입력에서 계산 비용이 일정했다.

## 유산과 전망

2021년에 소개된 [MoE](/writing/mixtral-8x7b-sparse-mixture-of-experts-architecture) 아키텍처는 대규모 언어 모델을 확장하는 기본 접근법으로 희소 활성화를 확립했다. [Switch Transformer](/writing/switch-transformer-top-1-routing-trillion-parameter-scaling)와 GShard의 성공은 아키텍처 혁신이 단순히 모델 크기를 늘리는 것만큼 중요할 수 있음을 보여주었고, 모델의 효율성과 능력을 향상할 새로운 방향을 열었다. 이 통찰은 후속 모델 개발에 영향을 미쳐, MoE 원리가 후대 모델에 채택되고 개선되었다.

[MoE 모델](/writing/sparse-models-conditional-computation-efficiency)에서 관찰된 출현적 전문화는 신경망이 지식을 조직하는 방식에 새로운 가능성을 제시했다. 전문가가 명시적인 감독 없이도 자연스럽게 전문성을 발전시키는 능력은 밀집 모델로는 불가능한 학습된 모듈성의 한 형태를 보여주었다. 이러한 능력은 여러 도메인에 걸친 전문 지식이 필요한 응용 분야에 유용한 것으로 나타났고, MoE 아키텍처는 [다국어](/writing/xlm-cross-lingual-language-model-multilingual-nlp) 모델, 멀티모달 시스템, 다양한 입력 유형을 다루는 응용 분야에서 특히 중요해졌다.

[MoE](/writing/mixtral-8x7b-sparse-mixture-of-experts-architecture) 아키텍처의 효율성 이점은 이후 모델 규모가 계속 커지면서 더욱 중요해졌다. 실용적인 계산 비용을 유지하면서 수조 개 매개변수로 이루어진 모델을 학습할 수 있는 능력은 밀집 아키텍처로는 실현할 수 없었을 새로운 능력을 가능하게 했다. MoE 원리를 통합한 Google의 [PaLM](/writing/palm-pathways-language-model-large-scale-training-reasoning) 같은 모델은 초거대 모델에서 희소 활성화 패턴의 지속적인 가치를 보여주게 된다.

[MoE 모델](/writing/sparse-models-conditional-computation-efficiency)을 위해 개발된 라우팅 메커니즘은 신경망 아키텍처의 다른 연구 분야에도 영향을 미쳤다. 학습된 라우팅과 희소 활성화의 원리는 조건부 계산과 동적 신경망 같은 다른 맥락에서도 탐구되었다. MoE 모델을 위해 개발된 [로드 밸런싱](/writing/scaling-ai-agents-performance-cost-optimization)과 용량 관리 기법은 분산 시스템과 [자원 할당](/writing/minimum-cost-flow-slotting-network-optimization-resource-allocation) 연구에도 정보를 제공했다.

MoE 아키텍처의 한계는 학습 안정성 개선, 라우팅 오버헤드 감소, 더 정교한 라우팅 메커니즘 개발을 위한 후속 연구를 촉진했다. 후대 연구는 대안적인 라우팅 전략, 더 나은 로드 밸런싱 기법, MoE 모델을 더 예측 가능하고 학습하기 쉽게 만드는 방법을 탐구했다. 이러한 개선은 [MoE](/writing/mixtral-8x7b-sparse-mixture-of-experts-architecture) 아키텍처를 더욱 실용적이고 효과적으로 만들었다.

MoE 아키텍처의 영향은 계산 효율성을 넘어섰다. 단순히 매개변수 수를 늘리는 대신 아키텍처 혁신을 통해 모델이 더 나은 성능을 거둘 수 있음을 보여줌으로써, MoE 아키텍처는 분야의 관심을 더 정교한 모델 설계로 옮기는 데 기여했다. 이러한 변화는 연구자들이 모델 개발에 접근하는 방식에 영향을 미쳐, 효율성과 능력을 더 높일 수 있는 대안 아키텍처 탐구를 장려했다. MoE 아키텍처가 보여준 원리는 실용적인 계산 요건을 유지하면서 언어 모델을 효과적으로 확장하는 방법을 이해하는 데 근본적인 요소가 되었다.
