---
source_file: "102_Mixture of Experts at Scale Efficient Scaling Through Sparse Activation and Dynamic Routing.md"
translation_file: "102_Mixture of Experts at Scale Efficient Scaling Through Sparse Activation and Dynamic Routing.ko.md"
commentary_type: "해설"
source_stem: "102_Mixture of Experts at Scale Efficient Scaling Through Sparse Activation and Dynamic Routing"
order_prefix: "102"
topic: "대규모 Mixture of Experts의 희소 활성화와 동적 라우팅"
period: "2024"
tags:
  - LLM
  - NLP
  - AI-history
  - commentary
---

# 대규모 Mixture of Experts의 희소 활성화와 동적 라우팅 해설

## 1. 한눈에 보기

- 핵심 주제: Mixture of Experts(MoE)가 전체 매개변수와 토큰당 활성 계산량을 분리해 언어 모델의 용량을 늘리는 방법
- 등장 배경: dense Transformer의 모델 용량을 키울수록 훈련·추론 계산, 가중치 저장, 장치 간 통신과 서비스 비용이 커지던 상황
- 가장 중요한 아이디어: Transformer의 일부 feed-forward network(FFN)를 여러 expert로 바꾸고, router가 각 토큰마다 소수의 expert만 선택해 계산한다.
- 이후 LLM/NLP에 남긴 영향: “매개변수가 몇 개인가?”라는 질문을 총 매개변수, 활성 매개변수, 실제 FLOPs, 메모리와 통신 비용으로 나누어 보게 했다.

> 이 문서는 `102_Mixture of Experts at Scale Efficient Scaling Through Sparse Activation and Dynamic Routing.md`의 번역문을 이해하기 위한 해설입니다. 원문의 핵심 직관을 보존하되, MoE의 역사·구조·비용에 관한 과장과 오류를 1차 연구 결과에 맞춰 구분합니다.

## 2. 핵심 요약

Mixture of Experts는 모든 입력에 같은 매개변수를 쓰는 dense 모델과 달리, 입력에 따라 서로 다른 매개변수 부분집합을 선택하는 조건부 계산(conditional computation) 구조다. 현대 Transformer MoE에서는 보통 attention block 전체를 여러 벌 복제하지 않고, 일부 층의 FFN을 여러 expert FFN으로 교체한다. Router는 각 토큰의 은닉 상태에서 expert 점수를 계산하고 top-k expert를 골라, 선택된 출력만 가중 결합한다. 따라서 총 매개변수는 크게 늘리면서도 토큰당 활성 매개변수와 행렬곱의 양은 훨씬 작게 유지할 수 있다. 하지만 모든 expert 가중치를 저장해야 하므로 메모리가 총 매개변수에 비례하고, 토큰을 expert가 있는 장치로 보내고 돌려받는 all-to-all 통신 비용도 생긴다. Load balancing은 특정 expert로 토큰이 몰려 장치가 과부하되거나 다른 expert가 충분히 학습되지 않는 문제를 완화하지만, 품질에 가장 좋은 routing과 균등한 하드웨어 사용 사이에 절충을 만든다. 2024년은 MoE가 처음 발명된 해가 아니라 Mixtral과 DeepSeek 계열 같은 공개·대규모 모델을 통해 실용적 채택이 두드러진 시기다. 따라서 MoE의 장점은 단순히 “매개변수당 성능이 좋다”는 말보다, **비슷한 활성 계산 예산에서 더 큰 조건부 용량을 제공할 수 있다**는 표현이 정확하다.

- 무엇을 다루는가: Token-level routing, sparse expert activation, load balancing, expert parallelism과 대규모 MoE의 비용 구조
- 어떤 문제를 해결하려 했는가: 모델 용량을 늘릴 때 모든 매개변수를 매 토큰마다 계산하는 dense 구조의 비용 증가
- 어떤 방식이 새로웠는가: 2024년에 새로 발명된 방식이라기보다, 이전의 sparse MoE를 공개 모델·효율적 분산 시스템·새 routing 전략과 결합해 대규모 서비스에 적용했다.
- 결과적으로 무엇을 바꾸었는가: 모델 규모를 하나의 parameter count로 비교하던 관행에서 total parameters와 active parameters 및 시스템 비용을 분리하는 관점으로 이동하게 했다.

## 3. 역사적 배경

Mixture of Experts라는 발상은 2024년보다 훨씬 오래됐다. 1990년대 초기 연구는 서로 다른 expert와 입력별 결합 가중치를 학습하는 모듈형 구조를 탐구했다. 2017년 Shazeer 등은 학습 가능한 sparse gate가 수많은 feed-forward expert 중 일부만 선택하는 층을 대규모 언어 모델과 기계 번역에 적용해, 조건부 계산을 현대 가속기에서 실현할 수 있음을 보였다.

Transformer 시대에는 분산 학습이 핵심 과제가 되었다. GShard는 2020년에 sparsely gated MoE와 자동 sharding을 결합해 600B를 넘는 다국어 번역 모델을 2,048개 TPU v3에서 훈련했다. Switch Transformer는 top-1 routing, expert capacity와 보조 load-balancing loss를 사용해 routing을 단순화하고 trillion-parameter 규모를 보였다. GLaM은 2021년 말 1.2T 총 매개변수 모델에서 일부 expert만 활성화해 compute-equivalent dense model과 비교하는 경험 결과를 제시했다. 따라서 sparse activation, trillion-parameter MoE와 load balancing의 핵심 돌파구는 이미 2017–2021년에 형성되어 있었다.

2024년에 중요했던 변화는 **가시성과 실용 채택**이다. Mistral AI의 Mixtral 8x7B 논문은 각 층에 8개 FFN expert를 두고 토큰마다 2개를 선택하는 공개 모델을 제시했다. 논문이 보고한 모델은 약 47B의 총 매개변수에 토큰당 약 13B를 활성화했다. 이는 원문이 말하는 ‘Meta의 Mixtral’이 아니라 Mistral AI의 모델이다. 2024년 말 DeepSeek-V3는 671B 총 매개변수 중 토큰당 37B를 활성화하고 auxiliary-loss-free load balancing 전략을 제시해 routing 연구가 계속 변하고 있음을 보여 주었다.

이 계보에서 local 102 원문은 [[068_Mixture of Experts Sparse Activation for Scaling Language Models]]이 다룬 2021년 전후의 기본 원리를 다시 설명하면서, 2024년 공개 모델과 인프라로 시선을 옮긴 후속 개설문으로 읽는 편이 맞다. 두 글을 서로 다른 발명 사건으로 분리하기보다, 앞선 연구의 알고리즘이 이후 공개 모델과 시스템에서 어떻게 채택·변형됐는지를 비교해야 중복을 피할 수 있다.

- 이전 접근법: 모든 토큰이 같은 FFN과 attention 가중치를 통과하는 dense Transformer
- 당시의 한계: 용량을 늘리면 토큰당 계산과 가중치·optimizer state 저장량이 함께 증가하고, 초대형 모델의 분산 학습과 서비스가 비싸졌다.
- 이 주제가 필요했던 이유: 총 모델 용량을 늘리되 모든 매개변수를 매번 활성화하지 않는 별도의 scaling axis가 필요했다.

## 4. 핵심 개념 해설

### 4.1 MoE는 보통 ‘여러 완전한 모델’이 아니라 sparse FFN 층이다

원문은 각 expert를 입력을 독립적으로 처리할 수 있는 완전한 neural network처럼 묘사한다. 현대 Transformer MoE에서 이는 오해를 부른다. 보통 embedding, self-attention, normalization과 출력 층은 모든 토큰이 공유하고, Transformer block의 dense FFN 자리에 여러 FFN expert를 둔다. 토큰은 층마다 선택된 expert FFN을 통과한 뒤 다시 공통 residual stream으로 돌아온다.

표준 FFN을 $F(h_t)$라고 할 때 MoE FFN은 개념적으로 다음처럼 쓸 수 있다.

$$
s_t = W_r h_t, \qquad p_t = \operatorname{softmax}(s_t),
$$

$$
S_t = \operatorname{TopK}(p_t, k), \qquad
y_t = \sum_{i \in S_t} \tilde p_{t,i} E_i(h_t).
$$

$h_t$는 한 층에 들어온 토큰 $t$의 은닉 상태, $W_r$은 router의 학습 매개변수, $E_i$는 $i$번째 expert FFN, $S_t$는 선택된 expert 집합이다. $\tilde p_{t,i}$는 선택된 expert 사이에서 쓰는 결합 가중치다. Top-1이면 한 expert, top-2이면 두 expert를 계산한다. 같은 문장 안에서도 토큰마다, 그리고 같은 토큰도 층마다 다른 expert 조합을 선택할 수 있다.

이 구조는 모델 전체를 domain별로 복제해 하나를 고르는 ensemble과 다르다. Attention과 residual stream이 expert 경로 사이에서 정보를 계속 공유하므로, 한 expert만 떼어 내 완전한 언어 모델처럼 사용할 수 있는 것도 아니다.

### 4.2 Total parameters, active parameters와 FLOPs

MoE를 이해할 때는 최소 네 개의 비용 장부를 분리해야 한다.

1. **총 매개변수(total parameters):** 모든 expert와 공유 층을 합한 가중치 수. 저장 공간과 checkpoint 크기에 직접 관계한다.
2. **활성 매개변수(active parameters):** 한 토큰의 forward pass에서 실제로 사용되는 공유 가중치와 선택된 expert 가중치. 토큰당 주된 행렬곱 규모를 설명한다.
3. **FLOPs:** Attention, FFN, router, 결합 연산을 포함한 실제 부동소수점 연산량. 활성 매개변수와 관련 있지만 같은 값은 아니다.
4. **통신·메모리 비용:** Expert가 여러 장치에 분산될 때 토큰을 보내고 결과를 회수하는 네트워크 traffic, 모든 expert 가중치의 저장, cache와 batch 형성에 드는 비용이다.

Expert 수를 $N$에서 $2N$으로 늘리고 top-k의 $k$를 고정하면 expert 부분의 총 매개변수는 늘지만 토큰당 expert 행렬곱은 대체로 유지할 수 있다. 그러나 공유 attention과 embedding은 항상 활성화되므로 “8개 중 2개를 쓰니 정확히 전체의 1/4만 계산한다”는 산술은 맞지 않는다. Mixtral 8x7B가 이름만 보면 56B 총·14B 활성처럼 보이지만 실제 보고치는 공유 부분과 구조를 포함해 약 47B 총·13B 활성이다.

원문의 “dense 모델은 매개변수 수가 두 배면 계산량이 대략 네 배”라는 설명도 일반 법칙이 아니다. 고정된 token 수와 architecture shape에서 dense Transformer의 주된 FFN 계산은 활성 가중치 수에 대체로 선형으로 증가한다. 표준 self-attention의 특정 항이 sequence length에 대해 제곱으로 증가하는 것과 parameter count를 혼동하면 안 된다. 폭·깊이·문맥 길이를 함께 바꾸는 실제 scaling에서는 관계가 복잡하지만, parameter count 자체에 대한 보편적인 제곱 법칙은 없다.

### 4.3 Router, top-k 선택과 load balancing

Router가 예측한 가장 높은 점수만 따르면 훈련 초기에 우연히 선호된 몇 expert로 토큰이 몰릴 수 있다. 붐비는 expert가 한 batch에서 처리할 수 있는 capacity를 넘으면 일부 token을 건너뛰거나 다른 expert로 보내야 하고, 한산한 expert는 학습 신호를 충분히 받지 못한다. 이를 expert collapse 또는 load imbalance 문제라고 부른다.

Switch 계열의 대표적 보조 손실은 expert별 실제 token 비율 $f_i$와 평균 router probability $P_i$를 사용해 다음 형태로 균형을 유도한다.

$$
L_{\text{balance}\!} \propto N \sum_{i=1}^{N} f_i P_i.
$$

주 학습 손실에 작은 계수로 더하면 모든 expert에 token과 확률 질량을 분산하도록 router를 압박한다. Expert capacity는 흔히 batch token 수를 expert 수로 나눈 평균에 capacity factor를 곱해 정한다. 이 한계를 크게 잡으면 overflow는 줄지만 빈 buffer와 계산 낭비가 늘고, 작게 잡으면 token dropping이나 재라우팅이 늘 수 있다.

균형은 목적 그 자체가 아니다. 모든 expert를 정확히 같은 비율로 쓰게 강제하면 특정 token에 가장 적합한 expert 선택을 방해할 수 있다. 2024년 DeepSeek-V3의 auxiliary-loss-free 방식처럼, 별도 보조 손실이 모델 품질을 왜곡할 가능성을 줄이면서 장치 부하를 조절하려는 연구가 이어지는 이유다.

### 4.4 Expert parallelism과 all-to-all 통신

대규모 MoE에서는 expert를 여러 GPU/TPU에 나눠 저장한다. 한 장치에서 만들어진 token representations는 router 결과에 따라 해당 expert를 보유한 다른 장치로 전송되고, expert 계산 뒤 원래 sequence 위치로 다시 모인다. 이 과정은 대략 다음 순서다.

1. 각 token의 top-k expert를 계산한다.
2. Expert ID별로 token을 묶고 capacity에 맞게 정렬한다.
3. All-to-all 통신으로 token을 expert 장치에 보낸다.
4. 각 expert가 자신의 token batch에 dense FFN을 수행한다.
5. 결과를 다시 all-to-all로 돌려보내 원래 token 순서로 결합한다.

이 구조는 행렬곱 FLOPs를 줄여도 wall-clock latency가 자동으로 같은 비율로 줄지 않는 이유다. 작은 batch에서는 expert별 token 묶음이 작아 가속기 사용률이 낮아지고, 장치 간 bandwidth가 병목이 될 수 있다. 반대로 batch가 충분히 크고 네트워크 topology와 expert placement를 잘 설계하면 큰 dense 행렬곱의 효율을 유지하면서 희소 계산의 이점을 얻을 수 있다.

### 4.5 Expert specialization은 관찰해야 할 결과이지 전제 조건이 아니다

원문은 과학, 법률, code, 대화 expert가 명확히 자연 발생하는 것처럼 설명한다. 실제로 token·언어·구문·위치에 따른 routing 편향이나 일부 해석 가능한 패턴이 관찰되기도 한다. 그러나 top-k router에 ‘과학 expert’라는 label을 주는 것은 아니며, load balancing은 topic별 순수 분리를 오히려 제한할 수 있다. 한 expert의 역할은 층마다 다르고, 여러 의미가 섞이며, 같은 domain token도 문맥에 따라 다른 expert로 갈 수 있다.

따라서 specialization은 MoE가 작동하기 위한 필수 설명이 아니다. Sparse MoE의 확실한 구조적 사실은 서로 다른 token이 서로 다른 FFN parameter subset을 사용한다는 것이다. 그것이 사람이 이해하기 쉬운 domain modularity로 정렬되는지, 혹은 hidden-state geometry와 자주 등장하는 token pattern을 나눈 것인지는 별도의 분석으로 검증해야 한다.

## 5. 원문의 논리 구조

원문은 대략 다음 흐름으로 전개됩니다.

1. Dense 모델의 계산·메모리 비용이 한계에 이르렀고 2024년 MoE 채택이 설계 전환을 만들었다고 문제를 제기한다.
2. Gating network가 입력마다 1–2개의 expert를 골라 총 용량과 활성 계산량을 분리한다는 핵심 아이디어를 소개한다.
3. Top-k routing, load-balancing loss, capacity constraint와 sparse distributed implementation을 기술적 해법으로 제시한다.
4. Switch Transformer와 Mixtral을 사례로 들어 성능·서비스 효율·전문 영역 처리와 접근성 확대의 효과를 주장한다.
5. Routing 불안정, expert imbalance, 총 가중치 저장, 평가와 데이터 다양성 문제를 한계로 든다.
6. MoE가 이후 언어·비전·멀티모달 모델과 AI infrastructure에 남긴 유산을 전망한다.

이 서술은 sparse activation의 직관과 시스템 과제를 폭넓게 소개하지만 세 층의 주장을 구분해야 한다.

- **확인된 구조:** Token별 top-k expert routing, sparse FFN activation, load balancing과 expert parallelism은 MoE 설계의 핵심이다.
- **사례에 조건화된 경험 결과:** 특정 MoE가 compute-equivalent dense model보다 좋은 성능을 냈다는 결과는 model, data, training budget과 benchmark 조건 안에서 유효하다.
- **추가 근거가 필요한 해석:** Clean domain specialization, 중간 규모 조직의 대형 모델 training 민주화, 환경 효과와 모든 후속 모델에 대한 직접 영향은 architecture만으로 입증되지 않는다.

## 6. 왜 중요한가

첫째, MoE는 **모델 용량과 토큰당 계산량을 서로 다른 scaling axis로 만들었다.** Dense 모델에서는 가중치를 늘리면 대부분의 가중치를 매 token에 사용하지만, sparse MoE에서는 expert 수를 늘려 조건부 용량을 확장하면서 top-k를 고정할 수 있다. Switch Transformer가 “FLOPs per example을 크게 늘리지 않고 parameter count를 늘리는 축”을 강조한 이유가 여기에 있다.

둘째, architecture와 distributed system을 함께 설계해야 한다는 점을 보여 주었다. 좋은 routing 식만 있어도 all-to-all 통신, expert placement, capacity, batch size와 fault handling이 나쁘면 실제 속도 이점이 사라진다. MoE의 성능은 neural architecture만의 속성이 아니라 compiler·network·parallelism이 합쳐진 system property다.

셋째, parameter count 중심의 모델 비교를 교정했다. 671B MoE와 671B dense model은 token당 계산과 서비스 비용이 전혀 다르고, 반대로 active 37B라는 숫자만으로 37B dense model과 같은 memory·latency라고 단정할 수도 없다. Total, active, FLOPs, memory, communication을 함께 공개해야 모델 규모를 의미 있게 비교할 수 있다.

특히 중요한 점:

- 같은 활성 계산량 안에서 더 많은 조건부 parameter capacity를 제공할 가능성을 열었다.
- Routing과 load balancing을 학습 문제이자 분산 resource allocation 문제로 결합했다.
- ‘희소 FLOPs’와 ‘저렴한 실제 서비스’가 같은 명제가 아님을 드러내 hardware-aware 평가를 중요하게 만들었다.

## 7. 현대 LLM과의 연결

- **Scaling laws와 계산 장부:** [[065_Scaling Laws for Neural Language Models Predicting Performance from Scale]]과 [[077_Chinchilla Scaling Laws Compute-Optimal Training and Resource Allocation for Large Language Models]]은 dense model에서 parameter, token, training FLOPs의 배분을 다룬다. MoE에서는 여기에 total parameter, active parameter, expert routing과 communication 축이 추가되므로 dense scaling 식의 $N$에 어떤 parameter를 넣는지 명시해야 한다.
- **Mixtral 계열:** Mixtral 8x7B는 8개 FFN expert 중 token당 2개를 고르는 구조를 공개해 MoE가 연구용 trillion-parameter 실험에만 머물지 않고 실제 사용 가능한 공개 checkpoint에도 적용될 수 있음을 보였다. 다만 Mistral AI 모델이며, 8×7B라는 이름을 총 56B·활성 14B의 정확한 회계로 읽지 않는다.
- **DeepSeek 계열:** DeepSeek-V3는 671B total/37B active MoE, auxiliary-loss-free balancing과 세분화된 expert 설계를 제시했다. [[105_DeepSeek R1 Architectural Innovation in Reasoning Models]]의 reasoning model은 DeepSeek-V3 계열 base 위의 post-training을 사용하므로, reasoning 성능을 해석할 때 pretraining architecture와 reinforcement-learning/post-training 효과를 분리해야 한다.
- **Instruction tuning과 PEFT:** Sparse expert를 post-train할 때 모든 expert가 같은 빈도로 token과 gradient를 받지 않는다. [[100_PEFT Beyond LoRA Advanced Parameter-Efficient Fine-Tuning Techniques]]과 연결하면 어느 공유 층·router·expert에 adapter를 붙일지, rare expert가 충분히 업데이트되는지라는 새 설계 문제가 생긴다.
- **Serving과 batching:** Autoregressive decoding은 step마다 token 수가 적어 expert별 batch가 작아지기 쉽다. Continuous batching, expert-aware scheduling, quantization, caching과 high-bandwidth interconnect가 MoE의 이론적 sparse compute를 실제 latency·throughput 이점으로 바꾸는 핵심이다.
- **Multimodal·agent system:** Router는 token의 hidden state를 기준으로 계산 경로를 고른다는 점에서 조건부 module 선택의 한 사례다. 그러나 외부 tool을 고르는 agent router나 modality encoder를 고르는 시스템과 수학적으로 같은 문제라고 단정할 수는 없다. 학습 목표, failure cost와 action semantics가 다르기 때문이다.

## 8. 한계와 비판적 관점

### 원문 검증 정정

| 원문의 주장 | 판정 | 더 정확한 설명 |
|---|---|---|
| Dense model은 parameter를 두 배로 하면 계산량이 대략 네 배다. | 부정확 | 고정 token·architecture 조건에서 주된 dense FFN 계산은 활성 가중치 수에 대체로 선형이다. 제곱 복잡도는 표준 attention의 sequence length 축과 혼동하면 안 된다. |
| 2024년에 MoE scaling의 돌파구가 처음 생겼다. | 시대 구분 필요 | Sparse-gated MoE는 2017년, GShard는 2020년, Switch/GLaM은 2021년 전후에 대규모 조건부 계산을 이미 보였다. 2024년은 공개·실용 채택이 두드러진 시기다. |
| Mixtral은 Meta의 모델이다. | 오류 | Mixtral 8x7B는 Mistral AI가 개발했다. Meta의 Llama 계열과 비교됐지만 같은 조직의 모델이 아니다. |
| 각 expert는 입력을 독립 처리하는 완전한 model이다. | 오해 소지 | Transformer MoE expert는 보통 일부 layer의 FFN block이다. Attention, residual stream, embedding과 출력 층은 공유한다. |
| 간단한 입력은 적은 capacity, 복잡한 입력은 많은 capacity를 쓴다. | 일반화 불가 | 고정 top-k router는 token 내용에 따라 **다른** expert를 고르지만 보통 token당 expert 수 $k$는 같다. 난이도에 따라 계산량을 자동 조절한다는 뜻은 아니다. |
| Expert가 과학·법률·code 등으로 자연스럽게 명확히 전문화한다. | 가능성이나 미입증 일반화 | 일부 routing pattern은 해석 가능하지만 clean domain expert가 보장되지 않는다. Layer, token, dataset과 balancing objective별 실증이 필요하다. |
| MoE는 큰 모델 접근을 민주화한다. | 조건부 해석 | 공개 checkpoint와 낮은 active FLOPs는 접근성을 높일 수 있지만 total weights의 memory와 특수 분산 infrastructure는 여전히 높은 진입 장벽이다. |

- 기술적 한계: Router error, expert collapse, capacity overflow, token dropping, training instability와 all-to-all 병목이 생길 수 있다. Sparse arithmetic가 hardware utilization까지 자동으로 보장하지 않는다.
- 이론적 한계: 어느 expert가 어떤 기능을 갖는지, routing이 왜 일반화를 개선하거나 악화하는지, total capacity와 active compute가 scaling law에서 어떻게 상호작용하는지에 대한 통일된 설명은 제한적이다.
- 실용적 한계: 전체 expert weights를 저장·전송해야 하므로 checkpoint, memory와 model loading 비용은 크다. Low-batch decoding에서는 expert별 matrix가 작아지고 communication latency가 두드러질 수 있다.
- 오늘날 관점에서 다시 봐야 할 점: Active parameter count만 공개하는 것도, total parameter count만 공개하는 것도 불충분하다. Training tokens, FLOPs, expert count, top-k, shared layers, capacity policy, routing loss, hardware와 measured throughput을 함께 봐야 한다.

추가로 고려할 한계는 다음과 같다.

1. **Routing의 비연속성:** Top-k 경계 근처의 작은 score 변화가 선택 expert를 바꿀 수 있어 학습과 입력 변화에 민감한 경로 전환이 생긴다.
2. **부하와 품질의 충돌:** 균등 사용을 강제하는 보조 손실은 hardware 효율을 높이지만 token에 가장 적합한 expert 선택을 방해할 수 있다.
3. **Rare expert 학습:** 일부 expert가 적은 token만 받으면 gradient 추정이 불안정하고 downstream fine-tuning에서 충분히 적응하지 못할 수 있다.
4. **Failure concentration:** 한 expert 또는 그 장치가 실패하면 그 expert로 routing되는 여러 token과 요청에 집중적으로 영향을 줄 수 있다.
5. **평가의 누락:** 평균 benchmark 점수는 expert별 utilization, route entropy, capacity overflow, tail latency와 domain별 routing 실패를 숨길 수 있다.
6. **에너지 주장:** FLOPs 감소가 곧바로 총 에너지·탄소 감소를 뜻하지 않는다. Memory, communication, idle hardware, datacenter 전력원과 utilization을 포함한 실측이 필요하다.
7. **접근성의 양면성:** 더 낮은 active compute로 강한 공개 모델을 실행할 수 있어도, total checkpoint를 적재할 memory가 부족하면 단일 소비자 장치에서는 오히려 dense 모델보다 다루기 어려울 수 있다.

## 9. 용어 정리

| 용어 | 설명 |
|---|---|
| Mixture of Experts(MoE) | 입력에 따라 여러 expert 중 일부만 선택해 계산하는 조건부 neural architecture |
| Dense model | 모든 token이 각 layer의 같은 parameter set 전체를 사용하는 모델 |
| Expert | Transformer MoE에서 보통 표준 FFN을 대신하는 개별 feed-forward subnetwork |
| Router 또는 gating network | Token hidden state에서 expert score를 계산하고 선택 경로를 정하는 작은 학습 모듈 |
| Top-k routing | 점수가 가장 높은 $k$개 expert만 token 처리에 사용하는 선택 방식 |
| Sparse activation | 전체 parameter 중 일부만 한 forward pass에 활성화하는 계산 방식 |
| Total parameters | 공유 층과 모든 expert를 합친 전체 가중치 수 |
| Active parameters | 특정 token의 forward pass에서 실제 계산에 참여하는 공유·expert 가중치 수 |
| Conditional computation | 입력에 따라 실행할 parameter나 module을 달리하는 계산 패러다임 |
| Load balancing | Token이 소수 expert에 몰리지 않도록 expert 사용량을 조절하는 기법 |
| Auxiliary balancing loss | 주 과제 손실에 더해 expert 사용 분포를 균등하게 유도하는 보조 목적 함수 |
| Expert capacity | 한 batch에서 각 expert가 처리할 수 있도록 할당한 최대 token 수 |
| Capacity factor | 평균 token/expert보다 얼마나 넉넉한 buffer를 둘지 정하는 배율 |
| Expert collapse | Router가 소수 expert만 반복 선택해 다른 expert가 충분히 학습·사용되지 않는 현상 |
| Token dropping | Expert capacity를 넘은 token의 expert 계산을 건너뛰는 일부 MoE 구현의 처리 방식 |
| Expert parallelism | 서로 다른 expert weights와 계산을 여러 장치에 분산하는 병렬화 방식 |
| All-to-all communication | Router 결과에 따라 token을 expert 장치로 보내고 출력을 다시 모으는 집단 통신 |
| Expert specialization | 특정 expert가 일부 token·언어·pattern에 더 자주 사용되는 현상. 사람이 이해할 domain 전문성을 자동 보장하지 않는다. |

## 10. 함께 보면 좋은 항목

- [[068_Mixture of Experts Sparse Activation for Scaling Language Models]] — 2017–2021년 sparse-gated MoE, GShard와 Switch Transformer의 기본 계보를 먼저 읽는다.
- [[065_Scaling Laws for Neural Language Models Predicting Performance from Scale]] — Dense scaling에서 parameter·data·compute가 어떤 장부로 연결되는지 확인한다.
- [[077_Chinchilla Scaling Laws Compute-Optimal Training and Resource Allocation for Large Language Models]] — Training FLOPs를 parameter와 token에 배분하는 문제와 MoE의 total/active parameter 구분을 대조한다.
- [[100_PEFT Beyond LoRA Advanced Parameter-Efficient Fine-Tuning Techniques]] — Sparse expert와 shared layer를 적은 trainable parameter로 후속 조정할 때의 새 선택지를 연결한다.
- [[105_DeepSeek R1 Architectural Innovation in Reasoning Models]] — DeepSeek-V3 기반 MoE pretraining architecture와 R1의 reasoning post-training을 분리해 읽는다.

1차 자료로 구조와 수치를 확인하려면 다음 문헌이 유용하다.

- [Shazeer et al., *Outrageously Large Neural Networks* (2017)](https://arxiv.org/abs/1701.06538)
- [Lepikhin et al., *GShard* (2020)](https://arxiv.org/abs/2006.16668)
- [Fedus et al., *Switch Transformers* (JMLR 2022)](https://www.jmlr.org/papers/v23/21-0998.html)
- [Du et al., *GLaM* (2021)](https://arxiv.org/abs/2112.06905)
- [Jiang et al., *Mixtral of Experts* (2024)](https://arxiv.org/abs/2401.04088)
- [DeepSeek-AI, *DeepSeek-V3 Technical Report* (2024)](https://arxiv.org/abs/2412.19437)

## 11. 읽고 생각해볼 질문

1. MoE가 total parameter를 크게 늘리면서 token당 expert FLOPs를 제한할 수 있는 이유는 무엇인가?
2. Mixtral 8x7B에서 8개 중 2개 expert를 쓴다는 사실만으로 전체 계산이 정확히 1/4이라고 말할 수 없는 이유는 무엇인가?
3. Dense Transformer의 parameter count와 self-attention의 sequence-length 제곱 복잡도를 어떻게 구분해야 하는가?
4. Load-balancing loss가 hardware utilization에는 도움이 되면서 model quality에는 방해가 될 수 있는 이유는 무엇인가?
5. Top-k가 고정된 router를 ‘어려운 token에 더 많은 계산을 배분하는 장치’라고 부르면 어떤 점이 틀리는가?
6. 한 expert가 특정 domain token에 자주 선택된다는 사실만으로 domain 지식을 독점한다고 결론 내릴 수 없는 이유는 무엇인가?
7. MoE와 dense model을 공정하게 비교하려면 total parameters, active parameters 외에 어떤 training·serving 측정치를 함께 보고해야 하는가?
8. Autoregressive serving의 작은 token batch에서 all-to-all 통신과 expert utilization 문제가 더 커질 수 있는 이유는 무엇인가?
9. DeepSeek-R1의 성능을 MoE architecture의 효과와 reasoning post-training의 효과로 분리하려면 어떤 대조 실험이 필요한가?

## 12. 짧은 결론

대규모 MoE의 핵심은 거대한 모델을 여러 완전한 작은 모델로 나눈다는 데 있지 않다. 공유 Transformer 경로 안에서 FFN parameter를 expert로 확장하고, 각 token에 소수 expert만 선택함으로써 **총 조건부 용량과 활성 계산량을 분리**하는 데 있다. 2017년 sparse-gated layer, 2020년 GShard, 2021년 전후의 Switch Transformer와 GLaM이 이 원리를 대규모로 확립했고, 2024년 Mixtral과 DeepSeek 계열은 공개 모델과 실제 시스템에서 그 채택과 변형을 선명하게 만들었다.

그러나 sparse FLOPs만으로 효율을 판정할 수는 없다. 모든 expert를 저장하는 memory, token을 장치 사이로 옮기는 communication, load balance와 품질의 절충, 작은 batch의 낮은 utilization 및 routing 실패를 함께 측정해야 한다. 또한 expert specialization과 접근성 확대는 가능한 결과이지 architecture가 자동으로 보장하는 사실이 아니다. MoE를 정확히 이해한다는 것은 큰 total parameter 숫자에 감탄하는 일이 아니라, **어떤 parameter가 token마다 활성화되고 그 선택을 실제 hardware가 어떤 비용으로 실행하는지** 끝까지 추적하는 일이다.
