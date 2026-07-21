# Chinchilla 스케일링 법칙: 대규모 언어 모델의 계산 최적 훈련과 자원 배분

Source: https://mbrenndoerfer.com/writing/chinchilla-scaling-laws-compute-optimal-training-resource-allocation

---



2022년에 소개된 Chinchilla 스케일링 법칙을 종합적으로 설명한다. 계산 최적 훈련이 모델 크기와 훈련 데이터의 균형을 맞추는 방식, 매개변수당 토큰 20:1 비율, 그리고 이전 모델의 과소 훈련 문제를 드러내 언어 모델 개발을 바꾼 과정을 살펴본다.

읽기 수준

설명되는 용어의 수를 조절하려면 자신의 전문성 수준을 선택하라. 초급자에게는 더 많은 도구 설명이 표시되고, 전문가는 읽기 흐름을 유지하도록 더 적은 설명을 보게 된다. 밑줄 친 용어 위에 마우스를 올리면 즉시 정의를 확인할 수 있다.

## 2022년: Chinchilla 스케일링 법칙

2022년 Jordan Hoffmann이 이끈 DeepMind 연구팀은 대규모 언어 모델을 어떻게 훈련해야 하는지에 관한 당시의 지배적 가정을 근본적으로 뒤흔든 결과를 발표했다. 1,750억 개 매개변수를 지닌 [GPT-3](/writing/gpt3-in-context-learning-emergent-capabilities-from-scale)의 성공으로 강화된 통념은 더 큰 모델을 더 많은 데이터로 훈련하면 필연적으로 더 좋은 성능을 낸다는 것이었다. Hoffmann과 동료들은 이 가정에 결함이 있음을 발견했다. 대부분의 대규모 언어 모델은 실제로 과소 훈련됐으며, 받은 훈련 데이터의 양에 비해 매개변수가 지나치게 많았다. 이 발견은 연구자와 조직이 모델 개발에 접근하는 방식을 바꾸었고, 고정된 계산 예산 안에서 모델 매개변수와 훈련 데이터의 균형을 세심하게 맞춰야 최적 성능을 얻을 수 있음을 보여 주었다.

[Chinchilla 스케일링 법칙](/writing/chinchilla-scaling-laws-compute-optimal-llm-training)은 고정된 계산 예산을 모델 크기와 훈련 데이터 사이에 어떻게 배분해야 성능을 극대화할 수 있는지 묻는 계산 최적 훈련의 체계적 연구에서 나왔다. “[Chinchilla](/writing/compute-optimal-training-chinchilla-scaling-llm)”라는 이름은 연구진이 조사 과정에서 훈련한 700억 매개변수 모델을 가리킨다. 이 모델은 [GPT-3](/writing/gpt3-in-context-learning-emergent-capabilities-from-scale)의 1,750억 매개변수보다 의도적으로 작았지만 훨씬 더 많은 데이터로 훈련됐다. 핵심 통찰은 주어진 계산 예산에서 모델 크기를 줄이고 훈련 데이터를 늘리면 그 반대보다 성능을 높일 수 있다는 것이었다. 이 반직관적 발견은 대규모 언어 모델 개발을 지배하던 “클수록 좋다”는 철학을 뒤집었다.

Chinchilla 스케일링 법칙의 중요성은 즉각적인 성능 개선을 넘어 기계 학습의 [자원 배분](/writing/minimum-cost-flow-slotting-network-optimization-resource-allocation)에 관한 근본적 질문까지 확장됐다. 특히 Kaplan과 동료들이 2020년에 제안한 이전 [스케일링 법칙](/writing/scaling-laws-neural-language-models-power-law-predictions)은 규모가 커질 때 모델 성능이 어떻게 개선되는지에 초점을 맞췄지만 모델 크기와 훈련 데이터 사이의 절충을 명시적으로 다루지 않았다. Chinchilla 연구가 제시한 대략 [매개변수당 20토큰](/writing/chinchilla-scaling-laws-compute-optimal-llm-training)이라는 최적 균형은 대규모 [Transformer](/writing/transformer-attention-is-all-you-need) 모델에 관한 것이었다. 이는 매개변수 700억 개의 모델을 계산 최적으로 만들려면 약 1조 4천억 토큰으로 훈련해야 한다는 뜻이다. 이 비율은 [GPT-3](/writing/gpt3-in-context-learning-emergent-capabilities-from-scale) 같은 모델이 인상적인 능력에도 불구하고 효과적으로 활용할 수 있는 양보다 훨씬 적은 데이터로 훈련됐음을 드러냈다.

[Chinchilla](/writing/compute-optimal-training-chinchilla-scaling-llm) 결과가 가져온 실무적 함의는 즉각적이고 컸다. 새 모델을 훈련하는 조직은 더 작고 데이터를 효율적으로 사용하는 모델로 더 좋은 성능을 얻어 훈련 비용과 추론 비용을 모두 줄일 수 있었다. Chinchilla 모델 자체가 이를 보여 주었다. GPT-3보다 작지만 여러 평가 과제에서 GPT-3의 성능에 맞먹거나 이를 넘어섰고, 추론에는 더 적은 계산이 필요했다. 이러한 효율성 이점은 계산 자원이 제한된 조직에 Chinchilla 스케일링 법칙을 특히 가치 있게 만들었으며, 훈련 예산을 전략적으로 배분하면 절대적인 규모의 한계를 보완할 수 있음을 보여 주었다.

Chinchilla 연구는 기계 학습에서 체계적인 실증 연구가 중요하다는 사실도 드러냈다. 연구진은 매개변수 수와 훈련 데이터 크기가 다른 여러 모델을 훈련하고 성능을 측정함으로써 최적 구성을 예측하는 [스케일링 법칙](/writing/scaling-laws-neural-language-models-power-law-predictions)을 도출할 수 있었다. 이 실증적 접근은 이전에 [모델 스케일링](/writing/power-laws-deep-learning-neural-network-scaling) 결정을 이끌던 더 휴리스틱한 접근과 대조됐다. [Chinchilla 논문](/writing/chinchilla-scaling-laws-compute-optimal-llm-training)이 확립한 방법론은 이후 스케일링 법칙 연구의 본보기가 되었고, 엄밀한 실험으로 효과적인 언어 모델 훈련에 관한 반직관적이지만 강력한 통찰을 얻을 수 있음을 보여 주었다.

## 문제

대규모 언어 모델 개발 분야에는 충분히 다뤄지지 않은 근본 질문이 있었다. 고정된 계산 예산이 주어졌을 때 모델 크기와 훈련 데이터 사이에 자원을 어떻게 배분해야 하는가? [Chinchilla](/writing/compute-optimal-training-chinchilla-scaling-llm) 연구 이전의 지배적 접근은 흔히 훈련 데이터를 희생하면서 모델 크기를 늘리는 것이었다. [GPT-3](/writing/gpt3-in-context-learning-emergent-capabilities-from-scale)는 이 철학의 대표 사례였다. 매개변수 1,750억 개에 약 3,000억 토큰으로 훈련돼 [매개변수당 토큰](/writing/chinchilla-scaling-laws-compute-optimal-llm-training) 비율이 약 1.7이었다. 이 접근은 더 큰 모델이 필연적으로 더 좋은 성능을 내며, 규모의 이점이 훈련 데이터 감소에서 오는 손실보다 클 것이라는 가정을 반영했다.

연구자들이 모델 크기, 훈련 데이터, 성능의 관계를 체계적으로 조사하면서 과소 훈련 문제가 드러났다. GPT-3 같은 모델은 인상적이었지만 훈련 데이터에 비해 매개변수가 훨씬 많아 잠재력을 충분히 발휘하지 못했다. 신경망의 각 매개변수는 훈련돼야 하고, 효과적인 훈련에는 모델이 의미 있는 패턴을 학습할 만큼 충분한 데이터가 필요하다. 훈련 데이터에 비해 매개변수가 지나치게 많으면 일부 매개변수는 충분히 활용되지 못하거나 잘 일반화되지 않는 허위 패턴을 학습했다. 이런 과소 훈련은 온전히 실현할 수 없는 모델 용량에 계산 자원을 낭비한다는 뜻이었다.

Kaplan과 동료들이 2020년에 제안한 [스케일링 법칙](/writing/scaling-laws-neural-language-models-power-law-predictions)은 규모에 따라 성능이 어떻게 좋아지는지에 관한 귀중한 통찰을 제공했지만, 주로 모델 크기나 훈련 데이터를 각각 늘릴 때 성능이 개선되는 방식에 초점을 맞췄다. 이 법칙은 모델 크기나 훈련 데이터를 두 배로 늘리면 예측 가능한 개선이 나타난다고 보였지만 두 요소의 균형을 어떻게 잡아야 하는지는 다루지 않았다. 이 법칙을 따르는 연구자는 자연스럽게 더 큰 모델을 선호할 수 있었다. 더 큰 모델이 더 많은 패턴을 배울 수 있다는 관계가 단순해 보였기 때문이다. 하지만 이 직관은 그런 패턴을 학습하려면 충분한 훈련 데이터가 필요하며 최적 균형이 단순히 더 큰 모델을 선호하지 않을 수도 있다는 사실을 놓쳤다.

계산 예산 제약은 이전 연구가 충분히 탐구하지 않은 제로섬 절충을 만들었다. 부동소수점 연산 수(FLOPs)로 측정하는 훈련 계산량은 모델 크기와 훈련 데이터 양 모두에 좌우된다. 매개변수가 더 많은 모델은 순방향 계산 한 번에 더 많은 계산이 필요하고, 더 많은 데이터로 훈련하면 순방향 계산 횟수가 늘어난다. 고정된 계산 예산에서는 모델 크기를 늘리면 훈련 데이터를 줄여야 하고 그 반대도 마찬가지다. 더 큰 모델의 이점이 더 적은 훈련 데이터의 비용보다 큰지, 아니면 그 반대인지가 문제였다. 체계적인 조사 없이는 이 절충이 제대로 이해되지 않아 최적이 아닌 [자원 배분](/writing/minimum-cost-flow-slotting-network-optimization-resource-allocation)으로 이어졌다.

당시의 평가 방법론도 이 문제에 기여했다. 모델을 비교할 때 연구자들은 대개 같은 데이터셋으로 훈련한 서로 다른 크기의 모델을 비교했고, 이는 자연스럽게 더 큰 모델에 유리했다. 같은 데이터로 훈련하면 더 큰 모델이 실제로 더 좋은 성능을 내므로 이 평가 방식은 “클수록 좋다”는 가정을 강화했다. 그러나 이 비교는 다른 가능성을 고려하지 않았다. 더 작은 모델을 더 많은 데이터로 훈련하면 더 큰 모델에 맞먹거나 이를 넘어설 수 있지 않을까? 평가 틀 자체가 분야를 더 큰 모델 쪽으로 편향시켜 과소 훈련 문제를 알아보기 어렵게 했다.

과소 훈련의 실무적 결과는 최적 이하의 성능을 넘어 비효율적인 자원 사용으로 이어졌다. 거대한 계산 자원을 대형 모델 훈련에 투자하는 조직은 계산량 단위당 얻을 수 있는 최선의 성능을 달성하지 못했다. 이런 비효율은 더 긴 훈련 시간, 더 높은 계산 비용, 추론에 더 많은 자원이 필요한 모델이라는 실제 비용을 만들었다. 특히 학술 기관과 소규모 기업처럼 계산 예산이 제한된 조직에는 이러한 비효율이 경쟁력 있는 모델을 훈련하는 장벽이 됐다. 이 분야에는 계산 자원을 최적으로 배분하는 방법을 이해할 체계적인 접근이 필요했다.

## 해법

[Chinchilla](/writing/compute-optimal-training-chinchilla-scaling-llm) 연구진은 매개변수 수와 훈련 데이터 크기를 달리한 여러 모델을 체계적으로 훈련해 계산 최적 구성을 찾는 실증 연구로 과소 훈련 문제를 다뤘다. 이 방법론은 7천만 개에서 165억 개까지 크기가 다른 언어 모델 400개 이상을 훈련하고, 같은 계산 예산을 유지하면서 매개변수 수와 훈련 데이터 양을 체계적으로 바꾸는 것이었다. 서로 다른 구성의 성능을 측정함으로써 연구진은 모델 크기와 훈련 데이터 사이의 최적 균형을 찾을 수 있었다.

### 계산 최적 훈련 공식

이 체계적 조사에서 나온 핵심 발견은 최적 모델 크기, 훈련 데이터, 계산 예산 사이의 정밀한 관계였다. [Chinchilla 스케일링 법칙](/writing/chinchilla-scaling-laws-compute-optimal-llm-training)은 계산 최적 훈련에서 모델 매개변수 수와 훈련 데이터 양이 계산 예산에 비례해 함께 증가해야 한다고 설명했다. 구체적으로 연구는 최적 구성에서 매개변수와 훈련 토큰이 모두 훈련 계산량의 세제곱근에 비례해 증가한다고 보았다. 이는 계산 예산을 두 배로 늘리면 모델 크기와 훈련 데이터도 함께 늘리되 둘 사이의 비율을 대략 일정하게 유지해야 한다는 뜻이었다.

발견된 최적 비율은 매개변수당 약 20토큰이었다. 이는 계산 최적 성능을 얻으려면 모델의 매개변수 하나마다 약 20토큰으로 훈련해야 한다는 뜻이다. 이 비율은 이전 관행에서 극적인 전환이었다. [GPT-3](/writing/gpt3-in-context-learning-emergent-capabilities-from-scale)는 매개변수당 약 1.7토큰이었지만 GPT-3 크기의 계산 최적 모델에는 약 3조 5천억 토큰, 즉 GPT-3가 실제 사용한 양의 10배가 넘는 토큰이 필요했을 것이다. 이 발견은 이전 모델이 얼마나 과소 훈련됐는지, 최적 [자원 배분](/writing/minimum-cost-flow-slotting-network-optimization-resource-allocation)으로 개선할 여지가 얼마나 큰지를 드러냈다.

20:1 토큰 대 매개변수 비율의 이해

매개변수당 20토큰이라는 비율은 모델 용량과 훈련 데이터의 충분성 사이의 균형을 나타낸다. 신경망의 각 매개변수는 훈련 데이터에서 의미 있는 패턴을 학습해야 한다. 매개변수당 토큰이 너무 적으면 모델에 효과적으로 활용할 수 없는 여분 용량이 생겨 과소 훈련으로 이어진다. 매개변수당 토큰이 너무 많다고 반드시 해로운 것은 아니지만, 같은 성능을 더 큰 모델로 얻을 수 있다면 비효율적인 배분일 수 있다. 20:1 비율은 모델 용량을 충분히 활용하면서도 더 큰 모델이 더 잘 처리할 수 있는 과도한 데이터에 압도되지 않는 최적 지점을 가리킨다.

### Chinchilla 모델

이 [스케일링 법칙](/writing/scaling-laws-neural-language-models-power-law-predictions)의 실무적 가치를 보여 주기 위해 연구진은 [Chinchilla](/writing/compute-optimal-training-chinchilla-scaling-llm)라는 모델을 훈련했다. 이 모델은 매개변수 700억 개를 갖고 1조 4천억 토큰으로 훈련돼 최적 20:1 비율을 달성했다. [GPT-3](/writing/gpt3-in-context-learning-emergent-capabilities-from-scale)의 1,750억 매개변수보다 훨씬 작지만 Chinchilla는 다양한 평가 과제에서 GPT-3에 맞먹거나 그 이상의 성능을 냈다. 이 시연은 스케일링 법칙이 이론에 그치지 않으며, 계산 자원을 더 효과적으로 사용하면서 경쟁력 있는 성능을 내는 효율적인 모델을 훈련하는 데 활용할 수 있음을 입증했다.

Chinchilla 모델의 성공은 스케일링 법칙을 검증하고 실무적 유용성을 보여 주었다. 연구진은 계산 최적 구성을 따라 GPT-3의 절반보다 작은 모델을 훨씬 더 많은 데이터로 훈련해 GPT-3 수준의 성능을 달성했다. 이 효율성에는 여러 이점이 있었다. 더 작은 모델은 저장과 추론에 더 적은 메모리를 요구했고, 추론이 더 빨랐으며, 계산 비용도 낮았다. Chinchilla는 최적의 [자원 배분](/writing/minimum-cost-flow-slotting-network-optimization-resource-allocation)으로 계산량 단위당 더 좋은 성능을 얻을 수 있어 계산 자원이 제한된 조직도 고급 언어 모델에 더 쉽게 접근할 수 있음을 보여 주었다.

### 스케일링 법칙 방법론

[Chinchilla 스케일링 법칙](/writing/chinchilla-scaling-laws-compute-optimal-llm-training)을 도출한 방법은 폭넓은 모델 크기와 데이터 양을 조합해 훈련한 뒤 성능을 예측하는 수학 함수를 적합하는 것이었다. 연구진은 MassiveText 데이터셋으로 모델을 훈련하면서 모델 크기를 7천만에서 165억 매개변수까지, 훈련 데이터를 50억에서 4천억 토큰까지 체계적으로 바꿨다. 보류 평가 집합의 손실을 측정해 주어진 계산 예산에서 어느 구성이 가장 좋은 성능을 내는지 판단할 수 있었다.

[스케일링 법칙](/writing/scaling-laws-neural-language-models-power-law-predictions)의 수학적 정식화는 모델 크기 $N$, 훈련 데이터 $D$, 훈련 계산량 $C$, 결과 손실 $L$ 사이의 관계를 포착했다. 핵심 통찰은 계산 최적 훈련에서 $C\approx6ND$일 때 $N$과 $D$의 최적값이 모두 $C^{1/3}$에 비례해 증가한다는 것이었다. 이 세제곱 관계는 계산 예산을 모델 크기와 훈련 데이터에 대략 똑같이 나눠 계산 최적 훈련을 정의하는 일정한 비율을 유지해야 한다는 뜻이었다. 이 정식화는 어떤 계산 예산에서도 최적 구성을 예측할 수 있게 해 모델 개발에 실용적인 지침을 제공했다.

### 훈련 효율성에 관한 통찰

[Chinchilla](/writing/compute-optimal-training-chinchilla-scaling-llm) 연구는 최적 비율 외에도 훈련 효율성에 관한 중요한 통찰을 드러냈다. 연구진은 계산 최적 구성으로 훈련한 모델이 최종 성능만 더 좋은 것이 아니라 훈련 과정에서도 그 성능에 더 효율적으로 도달했다고 밝혔다. 최적 비율을 따른 모델은 더 매끄러운 학습 곡선과 더 일관된 개선을 보였고, 용량과 데이터의 균형이 더 효과적인 학습을 가능하게 함을 시사했다. 이 효율성 이점은 [스케일링 법칙](/writing/scaling-laws-neural-language-models-power-law-predictions)의 가치를 최종 성능을 넘어 전체 훈련 과정으로 확장했다.

연구는 최적 비율이 모델 크기와 평가 과제가 달라져도 비교적 안정적이라고도 보였다. 약간의 차이는 있었지만 20:1 비율은 폭넓은 구성에서 신뢰할 수 있는 지침을 제공했다. 이러한 안정성은 스케일링 법칙을 널리 적용할 수 있게 했고, 연구자와 조직이 광범위한 실험 없이도 모델 개발의 실무 지침으로 쓸 수 있게 했다. 발견의 견고성은 실무 가치를 높이고 폭넓은 채택을 보장했다.

## 응용과 영향

[Chinchilla 스케일링 법칙](/writing/chinchilla-scaling-laws-compute-optimal-llm-training)의 즉각적인 영향은 기계 학습 공동체 전반에서 나타났다. 연구자와 조직은 계산 최적 구성에 따라 모델을 다시 훈련하기 시작했다. 2022년 이후 공개된 여러 주요 언어 모델은 Chinchilla 스케일링 법칙을 명시적으로 따르며 더 작은 모델을 더 많은 데이터로 훈련해 경쟁력 있거나 더 좋은 성능을 달성했다. 이 모델들은 [스케일링 법칙](/writing/scaling-laws-neural-language-models-power-law-predictions)이 이론적 지침에 그치지 않고 현실의 모델 성능과 효율을 개선할 수 있는 실용 도구임을 보여 주었다.

Chinchilla 스케일링 법칙은 Meta가 2023년에 공개한 [LLaMA](/writing/llama-meta-open-foundation-models-democratized-language-ai-research) 같은 모델의 개발에 영향을 주었다. LLaMA 모델은 70억에서 650억 매개변수까지 크기를 달리하며 계산 최적 원칙에 따라 명시적으로 설계됐고, 각각 비슷한 크기의 이전 모델보다 훨씬 많은 데이터로 훈련됐다. LLaMA-7B는 [GPT-3](/writing/gpt3-in-context-learning-emergent-capabilities-from-scale)보다 훨씬 작지만 여러 벤치마크에서 경쟁력 있는 성능을 냈고, [Chinchilla 스케일링 법칙](/writing/chinchilla-scaling-laws-compute-optimal-llm-training)을 따르는 실무적 가치를 보여 주었다. LLaMA와 비슷한 모델의 성공은 [Chinchilla](/writing/compute-optimal-training-chinchilla-scaling-llm)의 발견을 검증하고 계산 최적 훈련 전략의 더 넓은 채택을 장려했다.

계산 예산이 제한된 조직은 거대 모델에 필요한 막대한 계산 자원 없이 경쟁력 있는 성능을 얻을 방법을 제공한다는 점에서 Chinchilla 스케일링 법칙을 특히 유용하게 여겼다. 학술 기관, 스타트업, 소규모 기업은 최적 비율을 따라 계산량 단위당 성능을 극대화함으로써 효과적인 모델을 훈련할 수 있었다. 이러한 민주화 효과는 고급 언어 모델링의 접근성을 높여 더 다양한 조직이 언어 모델 개발과 연구에 참여할 수 있게 했다.

Chinchilla 스케일링 법칙을 따를 때의 추론 효율성 이점은 언어 모델이 실제 제품에 들어가면서 특히 중요해졌다. 경쟁력 있는 성능을 내는 더 작은 모델은 배포에 더 적은 메모리가 필요하고, 더 빠른 추론이 가능하며, 운영 비용도 낮았다. 실시간 응답이나 엣지 장치 배포가 필요한 응용에서는 이러한 효율성 이점이 결정적이었다. [Chinchilla 스케일링 법칙](/writing/chinchilla-scaling-laws-compute-optimal-llm-training)은 모델 개발자가 모델 크기와 훈련 데이터의 적절한 균형을 선택해 훈련 효율뿐 아니라 추론 효율까지 최적화할 수 있음을 보여 주었다.

Chinchilla 논문이 확립한 연구 방법론은 최적 훈련 구성을 체계적으로 조사하는 본보기가 되어 이후 스케일링 법칙 연구에 영향을 주었다. 연구자들은 유사한 방법론을 언어 모델 훈련의 다른 요소에 적용해 [최적 학습률](/writing/full-fine-tuning-hyperparameters-learning-rate-schedules), 배치 크기와 다른 하이퍼파라미터를 조사하기 시작했다. [Chinchilla](/writing/compute-optimal-training-chinchilla-scaling-llm) 연구가 보여 준 실증적·데이터 중심 접근은 훈련 효율성 문제를 연구하는 표준이 되었고, 언어 모델을 효과적으로 훈련하는 방법을 더 체계적으로 이해하게 했다.

Chinchilla 스케일링 법칙은 조직이 계산 [자원 배분](/writing/minimum-cost-flow-slotting-network-optimization-resource-allocation)을 계획하는 방식에도 영향을 주었다. 조직은 단지 더 큰 모델을 훈련하려고 계산 자원을 더 확보하는 대신 계산 최적 비율을 따라 기존 자원을 최적화할 수 있었다. 계산 비용이 여전히 높고 대규모 훈련의 환경 문제에 대한 우려가 커지면서 이런 전략적 자원 배분은 특히 중요해졌다. [스케일링 법칙](/writing/scaling-laws-neural-language-models-power-law-predictions)은 성능 목표와 실무 제약 사이의 균형을 잡아 책임 있고 효율적으로 자원을 사용하는 틀을 제공했다.

## 한계

중요한 기여에도 불구하고 [Chinchilla 스케일링 법칙](/writing/chinchilla-scaling-laws-compute-optimal-llm-training)에는 실무 적용에 영향을 주는 중요한 한계가 있었다. 주요 난점 가운데 하나는 대량의 고품질 훈련 데이터가 필요하다는 점이었다. [20:1 비율](/writing/compute-optimal-training-chinchilla-scaling-llm)을 따르면 매개변수 700억 개 모델에 1조 4천억 훈련 토큰이 필요하며, 이는 많은 조직이 접근하거나 선별할 수 있는 양보다 훨씬 많았다. 이처럼 큰 데이터셋을 수집하고 정제하고 준비하는 데 상당한 자원과 기반 시설이 필요해 [스케일링 법칙](/writing/scaling-laws-neural-language-models-power-law-predictions)을 실제로 적용하는 장벽이 생겼다.

스케일링 법칙의 초기 정식화가 충분히 다루지 않은 핵심 요소로 훈련 데이터의 품질과 다양성이 떠올랐다. Chinchilla 연구는 훈련 데이터의 품질이 비교적 균질하다고 가정했지만 실제로 데이터의 품질과 관련성은 크게 달랐다. 품질이 낮거나 관련 없는 데이터는 최적 비율의 이점을 약화할 수 있었고, 신중하게 선별한 고품질 데이터는 조금 다른 비율에서도 효과적인 훈련을 가능하게 할 수 있었다. 스케일링 법칙은 양에 관한 지침은 제공하지만 품질에 관한 지침은 주지 않았으므로 조직은 [데이터 품질](/writing/data-quality-outliers-measurement-error-missing-data) 요건을 별도로 정해야 했다.

[Chinchilla 스케일링 법칙](/writing/chinchilla-scaling-laws-compute-optimal-llm-training)에 따른 모델 훈련의 계산 요구량은 다른 대안보다 효율적이지만 여전히 막대했다. 계산 최적 모델도, 특히 큰 모델이라면 거대한 계산 자원이 필요했다. 대규모 계산 기반 시설에 접근할 수 없는 조직은 [스케일링 법칙](/writing/scaling-laws-neural-language-models-power-law-predictions)의 이점을 이해해도 완전히 따르기 어려웠다. 효율성 향상은 상당한 계산 자원의 필요를 없애지 않고 그 자원을 더 잘 사용할 뿐이었다.

스케일링 법칙은 주로 텍스트 데이터로 훈련한 [Transformer](/writing/transformer-attention-is-all-you-need) 기반 언어 모델에서 도출됐으므로 다른 아키텍처(architecture)나 데이터 모달리티(modality)에 적용할 수 있을지는 불확실했다. 다른 attention mechanism이나 훈련 목표(objective)를 사용하는 등 아키텍처가 다른 모델에는 다른 최적 비율이 적용될 수 있다. Multimodal 데이터나 특수 domain으로 훈련하는 모델에도 다른 구성이 필요할 수 있다. Chinchilla 스케일링 법칙이 도출된 특정 맥락을 넘어 일반화되는지는 추가 연구가 필요했다.

스케일링 법칙을 검증한 평가 방법론은 언어 모델링 손실(loss)과 [후속 과제](/writing/transfer-learning-nlp-pre-training-fine-tuning) 성능에 초점을 맞췄지만 실제로 중요한 모델 품질의 모든 측면을 충분히 포착하지는 못했다. 추론 능력, 사실 정확성, 편향, 안전 같은 요소는 스케일링 법칙의 정식화에서 명시적으로 고려되지 않았다. [스케일링 법칙](/writing/scaling-laws-neural-language-models-power-law-predictions)에 따라 최적 성능을 낸 모델에도 이런 차원의 한계가 있을 수 있고, 계산 효율만 최적화하는 것은 원하는 모든 모델 특성과 일치하지 않을 수 있다.

고정된 계산 예산이라는 가정은 이론 분석에 유용하지만 언제나 실무 제약과 일치하지는 않았다. 조직에는 훈련 시간, 사용할 수 있는 하드웨어, 데이터 저장 공간 또는 계산 최적 구성을 실현하기 어렵게 만드는 다른 제약이 있을 수 있다. 스케일링 법칙은 한 종류의 최적화를 안내하지만 조직이 모델을 훈련할 때 마주하는 모든 실무 제약을 다룰 수는 없었다.

## 유산과 전망

[Chinchilla 스케일링 법칙](/writing/chinchilla-scaling-laws-compute-optimal-llm-training)은 계산 최적 훈련을 대규모 언어 모델 개발의 근본 원칙으로 확립하고, 단순히 모델 크기를 키우던 분야의 초점을 모델 용량과 훈련 데이터의 전략적 균형으로 옮겼다. 이러한 관점의 전환은 이후 모델 개발에 영향을 주었고, 2022년 뒤 공개된 많은 주요 언어 모델이 명시적으로든 암묵적으로든 [Chinchilla](/writing/compute-optimal-training-chinchilla-scaling-llm) 원칙을 따랐다. [스케일링 법칙](/writing/scaling-laws-neural-language-models-power-law-predictions)은 훈련 효율과 [자원 배분](/writing/minimum-cost-flow-slotting-network-optimization-resource-allocation)을 이해하는 표준 참조점이 되어 분야가 모델 개발에 접근하는 방식을 근본적으로 바꿨다.

Chinchilla 연구가 확립한 방법론은 훈련 효율을 실증적으로 조사하는 본보기가 되어 이후 연구에 영향을 주었다. 연구자들은 유사한 체계적 접근을 적용해 최적 [학습률 일정](/writing/full-fine-tuning-hyperparameters-learning-rate-schedules), 배치 크기, 아키텍처 선택 같은 훈련 최적화의 다른 요소를 조사하기 시작했다. Chinchilla가 보여 준 데이터 중심의 실증적 접근은 효율성 문제 연구의 표준이 되었고, 효과적인 모델 훈련에 관한 더 체계적이고 엄밀한 이해로 이어졌다.

[Chinchilla 스케일링 법칙](/writing/chinchilla-scaling-laws-compute-optimal-llm-training)은 기계 학습 시스템 설계에서 절충 관계를 이해하는 일이 중요함도 강조했다. 더 큰 모델이 언제나 낫다고 가정하는 대신 최적 성능에는 여러 요소와 상호작용을 세심하게 고려해야 함을 보여 주었다. 이러한 시스템 사고 접근은 연구자와 실무자가 모델 개발을 바라보는 방식에 영향을 주어 성능, 효율, 비용, 실무 제약을 더 총체적으로 고려하게 했다.

앞으로도 Chinchilla 스케일링 법칙은 언어 모델 개발에 영향을 주겠지만, 분야는 그 한계를 인식하고 확장과 대안을 탐구하기 시작했다. 이후 연구는 아키텍처, 훈련 목표, [평가 기준](/writing/setting-goals-and-success-criteria-ai-agent-evaluation)에 따라 최적 비율이 어떻게 달라질 수 있는지 조사했다. 스케일링 법칙 연구의 지속적인 발전은 [Chinchilla](/writing/compute-optimal-training-chinchilla-scaling-llm)가 마련한 토대 위에서 그 한계를 다루고 적용 범위를 넓혀 간다.

[Chinchilla 스케일링 법칙](/writing/chinchilla-scaling-laws-compute-optimal-llm-training)의 바탕 원리인 효율적 [자원 배분](/writing/minimum-cost-flow-slotting-network-optimization-resource-allocation)과 체계적 최적화는 언어 모델링을 넘어 다른 기계 학습 영역으로 확장된다. 모델 용량과 훈련 데이터의 균형을 이해하는 일은 컴퓨터 비전(computer vision), 강화 학습(reinforcement learning)과 비슷한 절충이 있는 다른 영역에도 적용된다. 최적 구성을 찾기 위해 체계적으로 실증 연구를 수행하는 일반 접근은 기계 학습 전반에 널리 적용할 수 있다.

Chinchilla 연구는 책임 있고 효율적인 AI 개발에 관한 더 넓은 논의에도 기여했다. 대규모 모델 훈련의 계산·환경 비용을 우려하는 목소리가 커지면서 Chinchilla가 확립한 효율성 원칙은 지속 가능한 AI 논의의 일부가 됐다. [스케일링 법칙](/writing/scaling-laws-neural-language-models-power-law-predictions)은 더 좋은 성능에 언제나 더 많은 절대 자원이 필요한 것은 아니며 더 나은 자원 배분이 중요하다고 보여 주어 책임 있는 개발의 틀을 제공했다.

Chinchilla 스케일링 법칙의 유산은 현대 언어 모델을 개발하고 평가하고 배포하는 방식까지 이어진다. 효율성과 최적 [자원 배분](/writing/minimum-cost-flow-slotting-network-optimization-resource-allocation)에 대한 강조는 계속해서 모델 설계 결정, 훈련 전략, 배포 고려 사항에 영향을 준다. 새로운 아키텍처, 훈련 방법, 평가 접근이 등장해도 용량과 데이터의 균형에 관한 [Chinchilla](/writing/compute-optimal-training-chinchilla-scaling-llm)의 근본 통찰은 여전히 중요하다. 이 스케일링 법칙은 모델 개발을 계속 안내하는 훈련 효율성 이해의 원칙적 토대를 마련했다.
