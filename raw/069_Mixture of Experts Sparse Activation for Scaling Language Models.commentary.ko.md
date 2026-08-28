---
source_file: "068_Mixture of Experts Sparse Activation for Scaling Language Models.md"
translation_file: "068_Mixture of Experts Sparse Activation for Scaling Language Models.ko.md"
commentary_type: "해설"
source_stem: "068_Mixture of Experts Sparse Activation for Scaling Language Models"
order_prefix: "068"
topic: "Mixture of Experts와 희소 활성화"
period: "1991–2021년"
tags:
  - LLM
  - NLP
  - AI-history
  - commentary
---

<!-- Obsidian note: keep frontmatter valid, replace placeholders, and use wikilinks only for confirmed or intentionally planned notes. -->

# Mixture of Experts와 희소 활성화 해설

## 1. 한눈에 보기

- 핵심 주제: 여러 expert 가운데 일부만 입력별·token별로 선택해, 한 번의 계산에 참여하는 매개변수를 제한하면서 전체 모델 용량을 늘리는 Mixture of Experts(MoE)
- 등장 배경: dense model은 용량을 키울수록 모든 layer의 계산·메모리·분산 비용도 함께 커지므로, 전체 매개변수 수와 token당 연산량을 분리할 conditional computation이 필요했다.
- 가장 중요한 아이디어: router가 token 표현으로 expert 점수를 만들고 top-k expert만 활성화하며, 보조 손실과 expert capacity로 routing 쏠림과 장치 과부하를 관리한다.
- 이후 LLM/NLP에 남긴 영향: 2017년 sparsely-gated MoE, 2020년 GShard, 2021년 Switch Transformer를 거치며 Transformer의 FFN을 희소 expert 집합으로 바꾸는 설계가 대규모 언어 모델의 중요한 확장 축이 되었다.

> 이 문서는 `068_Mixture of Experts Sparse Activation for Scaling Language Models.md`의 번역문을 이해하기 위한 해설입니다. 원문을 반복하기보다 개념적 배경, 역사적 의미, 현대적 연결점을 정리합니다.

## 2. 핵심 요약

Mixture of Experts는 2021년에 갑자기 등장한 기술이 아니라, 1991년 여러 expert network와 gating network가 입력 공간을 나누어 학습한 연구로 거슬러 올라간다. 2017년 Shazeer 등의 sparsely-gated MoE는 noisy top-k gate로 수천 개 FFN 가운데 소수만 계산하는 layer를 LSTM 언어 모델과 번역 모델에 넣어 최대 137B 매개변수까지 실험했다. 2020년 GShard는 Transformer의 일부 FFN을 top-2 MoE로 교체하고 expert를 여러 TPU에 자동 분할해 600B가 넘는 다국어 번역 모델을 학습했다. 2021년 공개된 Switch Transformer는 한 token을 expert 하나에만 보내는 top-1 routing으로 통신과 구현을 단순화했고, 가장 큰 구성은 1.6T 매개변수와 2,048 experts를 사용했다. 이 계보의 핵심은 전체 매개변수를 모두 계산하지 않는 **조건부 활성화**이지, 모델 weight 자체를 잘라 내는 pruning이나 모든 연산을 희소 행렬로 바꾸는 것이 아니다. 또 total parameters가 커져도 모든 expert weight를 저장·분산해야 하고 token 이동을 위한 all-to-all 통신이 필요하므로, FLOPs 절감과 메모리·지연 시간·학습 난이도 절감은 같은 말이 아니다. 일부 연구에서 expert별 언어 패턴이 관찰됐지만, 그것만으로 expert가 안정된 분야 지식이나 추론 모듈을 자동 획득한다고 일반화할 수 없다.

- 무엇을 다루는가: MoE의 역사, sparse activation, token routing, load balancing, Transformer FFN expert화
- 어떤 문제를 해결하려 했는가: token당 연산을 비례해 늘리지 않고 모델의 조건부 용량을 확장하는 문제
- 어떤 방식이 새로웠는가: 2017년 noisy top-k layer, GShard의 top-2 MoE·자동 sharding, Switch의 top-1 routing과 안정화 기법
- 결과적으로 무엇을 바꾸었는가: 매개변수 수·활성 매개변수·FLOPs·메모리·통신을 분리해 모델 규모를 논의하게 만들었다.

## 3. 역사적 배경

[Jacobs·Jordan·Nowlan·Hinton의 1991년 연구](https://www.cs.toronto.edu/~hinton/absps/jacobs.pdf)는 여러 작은 network와 gating network를 함께 학습해 vowel discrimination 사례를 하위 문제로 나눴다. 이 원형은 입력 사례별로 expert의 출력을 부드럽게 섞는 supervised modular learning이었다. Transformer도, token-level sparse routing도, trillion-parameter model도 아니었다. 따라서 현대 sparse Transformer MoE와 문제의식은 이어지지만 구조와 규모를 같은 것으로 볼 수 없다.

[Shazeer 등의 2017년 연구](https://arxiv.org/abs/1701.06538)는 MoE를 전체 모델의 최상위 ensemble이 아니라 deep network 안에 삽입하는 범용 layer로 만들었다. noisy top-k gating, expert importance·load 보조 손실, data parallelism과 expert model parallelism의 결합을 사용했고, LSTM 사이에서 위치마다 다른 expert 조합을 선택했다. 언어 모델과 기계번역에서 137B 매개변수까지 보고했으나, 이는 Transformer 기반 2021년 LLM이 아니라 LSTM·GNMT 계열 실험이었다.

[GShard](https://arxiv.org/abs/2006.16668)는 2020년 6월 preprint로 공개되고 ICLR 2021에 실린 연구다. 논문의 공헌은 top-2 MoE Transformer뿐 아니라 XLA용 sharding annotation과 SPMD compiler extension이었다. 100개 언어에서 영어로 번역하는 600B 초과 모델을 2,048 TPU v3 cores에서 4일 동안 학습했으므로, ‘적당한 자원으로 거대 모델을 민주화했다’기보다 거대한 accelerator cluster에서 conditional computation과 자동 분할이 작동함을 보인 사례다. [Switch Transformer](https://www.jmlr.org/papers/v23/21-0998.html)는 2021년 preprint, 2022년 JMLR 논문으로, T5 계열 encoder-decoder에서 top-1 expert routing을 시험했다.

- 이전 접근법: 작은 expert들을 gating network로 혼합하거나, 2017년 LSTM·번역 모델 안에 sparsely-gated FFN layer를 삽입했다.
- 당시의 한계: expert batch가 작아지는 문제, 장치 간 통신, routing 쏠림, 고정 크기 buffer의 overflow, low-precision 불안정성이 있었다.
- 이 주제가 필요했던 이유: dense scaling의 이득을 유지하면서도 total capacity 증가와 token당 계산 증가를 반드시 같은 비율로 묶지 않는 방법이 필요했다.

## 4. 핵심 개념 해설

### 4.1 total parameters와 sparse activation

Transformer MoE는 보통 self-attention을 그대로 두고 일부 dense feed-forward network(FFN)를 여러 개의 expert FFN으로 교체한다. 각 expert는 구조는 같지만 별도 weight를 가진다. token $x$가 선택된 expert 집합 $T(x)$만 통과한다면 layer 출력은 다음처럼 쓸 수 있다.

$$
y(x)=\sum_{i\in T(x)}p_i(x)E_i(x)
$$

$E_i$는 expert $i$의 FFN이고 $p_i$는 router가 준 gate weight다. expert 수를 늘리면 **전체 매개변수**(total parameters)는 크게 늘지만, top-1 또는 top-2처럼 $|T(x)|$를 작게 유지하면 한 token에서 계산되는 expert FFN 수는 거의 고정된다. 그러나 embedding, attention, layer normalization 같은 shared parameters는 여전히 모든 token에 활성화된다. 따라서 단순히 `expert 수 × expert 크기`를 active compute라고 계산하거나, total parameter가 같은 dense model과 메모리·통신까지 같다고 보는 것은 잘못이다.

여기서 희소성은 weight 값 대부분이 0이라는 뜻이 아니다. 각 expert 내부의 행렬은 dense하게 계산되지만, **어떤 expert block을 실행할지**가 입력에 따라 희소하게 선택된다. 이 때문에 MoE는 unstructured pruning과 달리 dense matrix multiplication hardware를 활용할 수 있는 반면, 선택된 token을 expert가 있는 장치로 보내고 다시 모으는 통신이 필요하다.

### 4.2 gating과 token routing

현대 Transformer MoE의 router는 token representation에 선형 변환을 적용하고 expert별 logit을 softmax로 정규화한다.

$$
p_i(x)=\frac{\exp((W_r x)_i)}{\sum_{j=1}^{N}\exp((W_r x)_j)}
$$

그다음 확률이 높은 top-k expert를 선택한다. 2017년 sparsely-gated MoE는 탐색과 균형을 돕기 위해 noise를 넣은 top-k gate를 사용했고, GShard는 token을 최대 두 expert에 보내는 top-2 변형을 썼다. Switch는 $k=1$로 단순화해 한 token을 가장 높은 확률의 expert 하나에만 보내되, expert 출력에는 해당 gate probability를 곱했다. top-1은 router 계산, expert capacity, 장치 간 통신을 줄였지만 모든 MoE가 top-1이어야 한다는 보편 결론은 아니다.

Routing은 ‘질문 전체가 하나의 전문가에게 간다’고만 이해하면 안 된다. GShard와 Switch에서는 같은 sequence 안의 token들이 서로 다른 expert로 갈 수 있고, MoE layer마다 선택도 달라진다. 또한 expert 선택은 명시적인 직업·학문 분야 label로 감독되지 않는다. router는 language-model 또는 seq2seq loss와 보조 균형 손실에서 유용한 분할을 학습한다.

### 4.3 load balancing, capacity, specialization

Router가 이미 조금 잘하는 expert에 token을 더 보내면 그 expert가 더 자주 학습되고 다시 선택되는 양의 되먹임이 생길 수 있다. 이른바 expert collapse는 품질 문제이면서 분산 시스템의 병목이다. Switch의 보조 손실은 batch에서 expert $i$로 실제 dispatch된 token 비율 $f_i$와 router probability mass의 평균 $P_i$를 사용한다.

$$
L_{balance}=\alpha N\sum_{i=1}^{N}f_iP_i
$$

이 목적은 두 분포가 대략 $1/N$에 가까워지도록 유도한다. 원문의 ‘expert 사용량 분산을 직접 벌점으로 준다’는 설명은 2017년 importance loss의 한 형태에는 가까우나 Switch의 실제 식은 위와 같은 scaled dot product다. Load balancing은 장치의 일을 고르게 하는 제약이지, expert가 의미론적으로 다른 역할을 맡도록 보장하는 objective가 아니다.

각 expert는 정적 tensor shape 때문에 한 batch에서 받을 수 있는 token 수, 즉 expert capacity를 가진다. Switch에서는 대략 `(batch token 수 / expert 수) × capacity factor`로 정하고, overflow token은 해당 expert 계산을 건너뛴 채 residual path로 다음 layer에 전달했다. Capacity factor를 높이면 drop은 줄지만 빈 slot 계산과 메모리·통신이 늘어난다. 2017년 번역 실험의 Table 9는 2,048 experts 가운데 몇 개가 특정 주변 어휘·구문에 높은 gate를 보인 예를 제시했다. 이는 제한된 token-context specialization의 증거이지, 각 expert가 과학·대화·추론 같은 완전한 domain module이 됐다는 증거는 아니다.

## 5. 원문의 논리 구조

원문은 대략 다음 흐름으로 전개됩니다.

1. GPT-3 같은 dense model은 모든 입력에 전체 매개변수를 쓰므로 규모 확장이 비효율적이라고 문제를 제기한다.
2. 여러 expert 중 소수만 고르는 sparse activation으로 total capacity와 token당 계산을 분리한다고 설명한다.
3. softmax router, top-k selection, load balancing loss, expert capacity, Transformer FFN expert 구조를 소개한다.
4. GShard와 Switch Transformer의 대규모 실험을 일반적인 성능·효율·specialization의 증거로 확장한다.
5. 메모리·routing 불안정·latency 한계를 짚고 후대 대형 언어 모델의 핵심 설계로 이어졌다고 결론짓는다.

이 흐름의 중심 원리는 유효하지만 연대와 증거 범위를 다시 나눠 읽어야 한다. GShard는 2020년 공개된 자동 sharding 연구이고 Switch는 2021년 top-1 routing 연구다. 1991년 MoE, 2017년 sparse-gated LSTM layer, 2020년 top-2 Transformer, 2021년 top-1 Switch는 하나의 순간에 나온 동일 구조가 아니다. 또한 원 논문의 번역·language modeling 결과는 법률·의료·코드·복합 추론 전반의 expert specialization을 직접 검증하지 않았다.

## 6. 왜 중요한가

MoE가 만든 가장 중요한 분석 틀은 모델 규모를 하나의 숫자로 보지 않게 한 것이다. dense model에서는 total parameters와 active parameters가 거의 함께 움직이지만, sparse MoE에서는 전체 expert weight 수, token당 선택되는 expert 수, shared dense 부분, FLOPs, 장치별 memory, all-to-all communication을 따로 계산해야 한다. ‘1.6T model’은 그 1.6T weight가 token마다 모두 계산된다는 뜻도 아니고, 저장할 필요가 없다는 뜻도 아니다.

GShard는 Transformer의 일부 FFN을 top-2 MoE로 바꾸고 expert dimension을 장치에 분할하는 방법을 compiler support와 함께 제시했다. Switch는 top-1 routing, selective precision, initialization·dropout 조정, capacity와 보조 손실을 결합했다. Switch 논문은 T5-Base·T5-Large 기반 sparse model에서 같은 자원으로 최대 7배의 pretraining speed 증가를, 큰 구성에서 T5-XXL 대비 4배 speedup을 보고했다. 이는 해당 architecture·hardware·dataset·quality target에서의 결과이며, 모든 dense baseline이나 모든 inference workload에 그대로 적용되는 상수는 아니다.

특히 중요한 점:

- total capacity를 늘리면서 token당 expert 계산량을 제한하는 조건부 계산을 대규모 Transformer에서 실증했다.
- routing 품질만이 아니라 expert capacity·load balancing·sharding·communication이 모델 품질을 결정하는 공동 설계 문제임을 드러냈다.
- parameter count만으로 효율과 능력을 비교할 수 없고 active parameters·FLOPs·memory·latency·quality를 함께 보고해야 한다는 기준을 남겼다.

## 7. 현대 LLM과의 연결

후대 LLM에서는 여러 expert FFN 중 token당 일부를 활성화하는 구조가 계속 사용됐다. 하지만 ‘MoE’라는 이름 아래에서도 expert 수, shared expert 유무, top-k, router objective, capacity 처리, expert parallelism, training corpus가 다르므로 Switch의 결과를 그대로 옮길 수 없다. 특히 modern decoder-only causal LM과 원 Switch의 T5형 encoder-decoder·span-corruption pretraining은 구조와 학습 과제가 다르다.

- sparse decoder LLM: 후대 Mixtral 같은 모델은 decoder Transformer의 MoE FFN을 사용하지만, expert 수와 top-k·공개 평가 범위가 Switch와 다르다.
- scaling law와 compute allocation: MoE는 dense scaling이 ‘더 이상 개선되지 않아서’ 나온 해결책이라기보다, 주어진 active compute에서 더 많은 conditional capacity를 시험하는 별도 축이다. Dense 모델의 loss scaling은 계속 관찰됐으며 데이터·compute 배분도 함께 고려해야 한다.
- distributed systems: expert parallelism은 parameter를 장치에 나눌 수 있게 하지만 token dispatch의 all-to-all communication, 전체 checkpoint 저장, serving batch와 latency 관리가 필요하다. MoE 효율은 architecture만이 아니라 cluster topology와 runtime에 의존한다.

원문은 PaLM이 MoE 원리를 채택했다고 서술하지만, 2022년 PaLM 540B는 논문 자체가 **densely activated Transformer**라고 명시한다. Pathways를 이용한 대규모 분산 학습과 sparse expert routing은 같은 개념이 아니다. 반대로 후대 sparse MoE 모델이 존재한다는 사실도 모든 최신 LLM이 MoE라는 뜻은 아니다.

## 8. 한계와 비판적 관점

MoE는 active FLOPs를 줄일 수 있어도 총 expert weight를 저장해야 한다. Training에서는 optimizer state와 gradient, serving에서는 여러 expert shard와 통신 경로가 필요하다. 작은 연구 조직이 trillion-parameter model을 쉽게 훈련·배포할 수 있게 됐다는 원문의 ‘democratization’ 서사는 GShard의 2,048 TPU v3 core 실험이나 Switch의 대규모 TPU 실험으로 입증되지 않는다.

- 기술적 한계: router 쏠림, capacity overflow와 token drop, all-to-all communication, 작은 expert batch, low-precision 불안정, fine-tuning 민감성이 생긴다. Switch의 가장 큰 sparse model은 upstream perplexity 개선이 SuperGLUE fine-tuning으로 항상 같은 비율로 이어지지 않았다.
- 이론적 한계: load-balancing loss는 고른 사용량을 장려할 뿐 올바른 semantic partition이나 causal modularity를 보장하지 않는다. Routing probability도 expert가 주장을 ‘이해한 정도’나 calibrated confidence가 아니다.
- 실용적 한계: top-k가 고정되고 expert 구조가 같으면 token당 산술량은 대체로 고정되지만, 어느 장치의 expert로 token이 몰리는지에 따라 utilization·communication·tail latency가 달라진다. 원문의 ‘입력마다 선택 expert가 달라 연산량이 달라진다’는 설명은 이 차이를 혼동한다.
- 오늘날 관점에서 다시 봐야 할 점: GShard의 600B와 Switch의 1.6T는 total parameter 수다. largest Switch-C는 128이 아니라 2,048 experts를 사용했다. 반대로 128-expert 구성도 논문 안에 존재하므로 숫자는 model configuration과 함께 써야 한다.

Expert specialization도 제한적으로 읽어야 한다. 2017년 논문은 한 번역 모델의 training batch에서 몇 expert의 높은-score context를 표로 보였다. 이 관찰은 routing이 무작위가 아니고 일부 syntactic·semantic 패턴을 포착할 수 있음을 시사하지만, 안정된 domain ownership, reasoning skill 분리, 더 높은 interpretability를 체계적으로 입증하지 않는다. Expert ID를 보는 것만으로 특정 출력의 원인이나 안전성을 설명할 수도 없다.

원문은 dense scaling이 어느 지점부터 ‘의미 있는 개선’을 주지 못했다고 단정하지만, 당시 scaling-law 문헌은 loss가 model size·data·compute와 매끄러운 power law 관계를 보인다고 보고했다. MoE의 동기는 dense model의 개선 중단이 아니라, 같은 active computation 아래에서 parameter capacity를 더 크게 만드는 trade-off 탐색으로 서술하는 편이 정확하다.

## 9. 용어 정리

| 용어 | 설명 |
|---|---|
| Mixture of Experts (MoE) | 여러 expert network와 입력별 결합 weight를 정하는 gate/router로 구성된 모듈 또는 모델군 |
| conditional computation | 입력에 따라 network 일부만 실행하는 계산 방식 |
| sparse activation | weight를 삭제하는 대신 선택된 expert block만 활성화하는 구조적 희소성 |
| expert | Transformer MoE에서는 보통 별도 매개변수를 가진 FFN. 완전한 독립 모델이나 사람 의미의 전문가는 아니다. |
| router 또는 gate | token 표현에서 expert별 score·probability를 만들고 top-k 선택을 수행하는 작은 학습 모듈 |
| top-k routing | 확률이 높은 $k$개 expert만 계산하는 방식. GShard는 최대 2개, Switch는 1개를 선택했다. |
| load-balancing loss | 특정 expert로 routing이 몰리는 것을 줄이기 위해 primary task loss에 더하는 보조 목적 |
| expert capacity | 한 expert가 한 batch 또는 token group에서 처리할 수 있는 최대 token 수 |
| expert parallelism | expert weight를 여러 장치에 나누고 token을 선택된 expert 장치로 교환하는 분산 방식 |

## 10. 함께 보면 좋은 항목

- [[054_The Transformer Attention Is All You Need]]
- [[065_Scaling Laws for Neural Language Models Predicting Performance from Scale]]
- [[066_GPT-3 and In-Context Learning Emergent Capabilities from Scale]]
- [[077_Chinchilla Scaling Laws Compute-Optimal Training and Resource Allocation for Large Language Models]]
- [[082_PaLM Pathways Language Model - Large-Scale Training, Reasoning, and Multilingual Capabilities]]
- [[096_Mixtral & Sparse MoE Production-Ready Efficient Language Models Through Sparse Mixture of Experts]]
- [[102_Mixture of Experts at Scale Efficient Scaling Through Sparse Activation and Dynamic Routing]]

이 항목들은 실제 원문 폴더에 존재한다. Transformer FFN의 출발점, dense scaling과 compute-optimal 관점, GPT-3의 dense 규모, PaLM의 dense Pathways 학습, 후대 sparse MoE의 구조와 운영 범위를 서로 비교하는 데 유용하다.

## 11. 읽고 생각해볼 질문

1. MoE에서 total parameters가 크게 늘어도 token당 FLOPs가 같은 비율로 늘지 않는 이유는 무엇이며, 여전히 늘어나는 비용은 무엇인가?
2. GShard의 top-2 routing과 Switch의 top-1 routing은 출력 결합·capacity·통신에서 어떻게 다른가?
3. load-balancing loss가 expert usage를 고르게 해도 semantic specialization을 보장하지 않는 이유는 무엇인가?
4. expert별 자주 선택되는 token pattern을 관찰하는 것과 claim-level interpretability를 확보하는 것은 왜 다른가?

## 12. 짧은 결론

Mixture of Experts의 역사는 1991년 gating 기반 modular learning, 2017년 sparsely-gated layer, 2020년 GShard top-2 Transformer와 automatic sharding, 2021년 Switch의 top-1 routing으로 이어진다. 이 계보가 남긴 핵심은 모든 weight를 매 token에 계산하지 않고도 conditional capacity를 키울 수 있다는 점이다. 동시에 MoE는 공짜 확장이 아니다. 전체 weight의 저장, expert 간 통신, load balancing, overflow, 안정적 미세 조정이 새로운 비용으로 생긴다. 따라서 MoE를 평가할 때는 trillion이라는 total parameter 수나 ‘전문가’라는 이름보다 active parameters, FLOPs, memory, communication, routing evidence와 실제 downstream quality를 함께 읽어야 한다.
