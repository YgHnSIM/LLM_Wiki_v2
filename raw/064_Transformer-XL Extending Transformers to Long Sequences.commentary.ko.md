---
source_file: "063_Transformer-XL Extending Transformers to Long Sequences.md"
translation_file: "063_Transformer-XL Extending Transformers to Long Sequences.ko.md"
commentary_type: "해설"
source_stem: "063_Transformer-XL Extending Transformers to Long Sequences"
order_prefix: "063"
topic: "Transformer-XL과 고정 길이 문맥 너머의 언어 모델링"
period: "2019년"
tags:
  - LLM
  - NLP
  - AI-history
  - commentary
---

<!-- Obsidian note: frontmatter와 링크 대상을 확인했으며, 원문의 과장·수식 손상은 8절에서 Transformer-XL 원 논문과 대조한다. -->

# Transformer-XL과 고정 길이 문맥 너머의 언어 모델링 해설

## 1. 한눈에 보기

- 핵심 주제: fixed-length segment 사이에 hidden-state memory를 재사용하면서 시간 순서를 relative positional attention으로 보존하는 causal Transformer language model
- 등장 배경: 긴 corpus를 독립 segment로 잘라 훈련할 때 segment boundary에서 forward context와 gradient가 모두 끊기고, evaluation에서는 긴 sliding context를 매번 다시 계산하던 문제
- 가장 중요한 아이디어: 이전 segment의 layer별 hidden sequence를 `stop-gradient` memory로 고정해 현재 segment의 key·value context에 붙이고, absolute index 대신 상대 거리로 attention score를 구성한다.
- 이후 LLM/NLP에 남긴 영향: Transformer의 “병렬 계산”을 current segment 내부와 segment 사이 순서로 나누어 보게 했고, context window·effective dependency·실제 사용 가능한 memory가 서로 다른 개념임을 드러냈다.

> 이 문서는 `063_Transformer-XL Extending Transformers to Long Sequences.md`의 번역문을 이해하기 위한 해설이다. 원문을 반복하기보다 Transformer-XL 원 논문이 실제로 제안·측정한 범위와 후대 long-context model로 확대한 서술의 경계를 정리한다.

## 2. 핵심 요약

Transformer-XL은 전체 긴 문서에 한 번에 dense attention하는 model이 아니다. 길이 $L$의 current segment를 처리할 때 이전 segment에서 계산한 hidden-state sequence를 길이 $M$의 memory로 재사용한다. memory는 current query의 key·value context가 되지만 `stop-gradient`로 고정되므로 forward 정보는 segment boundary를 넘고 backward gradient는 넘지 않는다. 같은 absolute index가 segment마다 반복되면 cached state와 current state의 시간 관계가 모호해지므로, 저자들은 content와 relative position을 네 항으로 분해한 attention score를 함께 제안했다. 이 조합은 fixed-segment context fragmentation을 줄이고 평가 시 과거 segment 재계산을 피했다. 원 논문의 직접 실험은 다섯 language-modeling dataset, ablation, Relative Effective Context Length(RECL), evaluation speed와 정성적 text generation이다. document classification·coreference·QA·code application이나 GPT-3·PaLM·LLaMA·Longformer의 직접 계보는 해당 논문의 실험 결과가 아니다.

- 무엇을 다루는가: segment-level recurrence, state reuse, stop-gradient memory, relative positional attention, long-context language-model evaluation
- 어떤 문제를 해결하려 했는가: 고정 segment가 만드는 dependency-length 상한과 context fragmentation, sliding-window evaluation의 중복 계산
- 어떤 방식이 새로웠는가: hidden-state sequence cache와 state reuse에 맞춘 relative positional attention formulation을 결합했다.
- 결과적으로 무엇을 바꾸었는가: current segment의 병렬 계산을 유지하면서 segment 순서에 recurrent dependency를 다시 도입하고, context 길이를 train segment length와 분리했다.

## 3. 역사적 배경

원 Transformer는 한 sequence 안에서 모든 위치를 직접 연결해 RNN보다 짧은 dependency path와 높은 훈련 병렬성을 제공했다. 그러나 language modeling corpus를 GPU에 맞는 짧은 segment로 나누면 다른 문제가 생겼다. 각 segment를 독립 example로 처리하는 vanilla baseline에서는 이전 segment의 정보가 forward·backward 어느 쪽으로도 전달되지 않았다. 첫 token은 사실상 거의 context 없이 예측되고, 의미 단위와 무관한 경계에서 문맥이 잘렸다.

evaluation에서 매 token마다 training segment 길이의 sliding window를 한 칸씩 옮기면 최대 context를 줄 수 있지만, 거의 같은 window를 계속 처음부터 계산해야 한다. Transformer-XL의 speedup은 이 비효율적인 비교 절차와 state reuse를 대조한 결과다.

- 이전 접근법: 독립 fixed-length segment 훈련, 한 token씩 이동하는 sliding-window evaluation, absolute positional encoding
- 당시의 한계: segment boundary의 context fragmentation과 긴 evaluation context의 반복 계산
- 이 주제가 필요했던 이유: 전체 history를 한꺼번에 처리하지 않고도 시간적 coherence와 더 긴 effective context를 얻을 방법이 필요했다.

## 4. 핵심 개념 해설

### 4.1 segment-level recurrence와 stop-gradient

연속 segment $\mathbf{s}_\tau$와 $\mathbf{s}_{\tau+1}$을 생각하자. 현재 layer $n$은 이전 segment의 **layer $n-1$ hidden sequence**를 memory로 고정하고, current segment의 layer $n-1$ state와 길이 방향으로 이어 붙인다.

$$
\widetilde{\mathbf h}_{\tau+1}^{,n-1}
=
\left[
\operatorname{SG}\!\left(\mathbf{h}_{\tau}^{,n-1}\right)
\circ
\mathbf{h}_{\tau+1}^{,n-1}
\right].
$$

current segment의 query는 현재 위치에서만 만들고, key와 value는 이 확장 context에서 만든다. `SG`는 stop-gradient다. 따라서 memory를 거쳐 예측에 정보는 전달되지만 이전 segment로 gradient가 역전파되지는 않는다. raw가 “이전 segment의 같은 layer $n$”을 바로 넣는다고 쓴 부분은 원 논문의 indexing과 다르다.

layer가 하나 올라갈 때마다 dependency path가 이전 segment 쪽으로 한 칸 더 이동하므로, 이론적 최대 dependency length는 layer 수 $N$과 segment length $L$에 대해 $O(NL)$로 늘어난다. 이는 항상 $2L$만 보는 구조도 아니고 전체 history를 무제한 보존한다는 뜻도 아니다. 실제 memory length $M$은 설정과 GPU memory에 제한된다.

### 4.2 relative positional attention의 네 항

cached segment와 current segment는 각자 1부터 $L$까지 같은 absolute index를 가질 수 있다. absolute position을 hidden state에 더한 채 재사용하면 model이 두 위치의 실제 시간 순서를 구분하기 어렵다. Transformer-XL은 query 위치 $i$와 key 위치 $j$의 score를 다음 네 역할로 분해한다.

1. content query와 content key의 상호작용
2. content query와 relative position $i-j$의 상호작용
3. global content bias $\mathbf{u}$와 content key의 상호작용
4. global position bias $\mathbf{v}$와 relative position의 상호작용

여기서 relative matrix $\mathbf{R}$ 자체는 raw가 말한 임의의 learned distance embedding이 아니라 sinusoidal encoding이고, content·position projection과 $\mathbf{u},\mathbf{v}$가 학습된다. 이 방식은 가까운 token에 반드시 단조롭게 큰 weight를 주는 규칙도 아니다. content와 position 항이 함께 attention을 결정한다.

### 4.3 context window, dependency와 RECL

세 길이를 구분해야 한다.

| 길이 | 뜻 | 자동으로 보장하지 않는 것 |
|---|---|---|
| segment length $L$ | 한 번에 query를 계산하는 current block 길이 | 과거 memory 전체 길이 |
| memory length $M$ | current segment가 key·value로 참조할 cached state 길이 | model이 그 모든 위치를 유용하게 쓰는 정도 |
| RECL | 더 긴 context가 특정 model group의 perplexity를 상대적으로 개선하는 최대 범위 | 고정 API context window나 모든 example의 dependency |

논문의 “RNN보다 80%, vanilla Transformer보다 450% 긴 dependency”는 Table 8의 RECL과 $r=0.1$ hard-example 조건에서 나온 상대 비교다. 제품의 maximum context window가 각각 그 비율로 늘었다는 뜻이 아니다.

## 5. 원문의 논리 구조

원문은 대략 다음 흐름으로 전개된다.

1. standard Transformer의 quadratic attention과 fixed segment를 긴 sequence의 문제로 제시한다.
2. 이전 segment hidden state를 cache하는 segment-level recurrence를 설명한다.
3. relative positional encoding으로 cached/current 위치 관계를 나타낸다고 설명한다.
4. language modeling 성능에서 출발해 document·generation·code application과 후대 model의 영향으로 범위를 넓힌다.
5. cache memory·계산량·고정 representation의 한계를 거쳐 modern long-context architecture의 유산으로 마무리한다.

이 흐름은 입문 설명에는 유용하지만, 원 논문이 직접 평가한 language modeling과 원문이 예시로 확장한 application·후대 계보를 분리해 읽어야 한다.

## 6. 왜 중요한가

Transformer-XL의 핵심은 단순히 “더 긴 Transformer”라는 model 이름이 아니다. parallelism, recurrence와 memory가 어느 축에서 동시에 존재할 수 있는지를 구체적으로 보여 준 데 있다. current segment 안의 token representation은 teacher forcing 아래 병렬 계산할 수 있지만, 다음 segment를 처리하려면 이전 segment cache가 먼저 있어야 한다. 생성 단계의 next-token sampling은 여전히 순차적이다.

특히 중요한 점:

- forward memory와 backward gradient가 같은 경계를 가져야 한다는 통념을 분리했다.
- context fragmentation을 해결하는 이득과 정말 긴 dependency를 이용하는 이득을 One Billion Word·WikiText-103 ablation으로 나누어 살폈다.
- evaluation state reuse가 중복 계산을 얼마나 줄이는지 조건이 있는 speed 수치로 제시했다.

## 7. 현대 LLM과의 연결

Transformer-XL의 정확한 현대적 연결은 “긴 context를 만들 때 무엇을 저장하고 다시 계산할 것인가”라는 문제 설정이다. 후대 model도 key/value cache, sliding or sparse attention, compressed memory, retrieval처럼 서로 다른 답을 쓴다. 그러나 mechanism과 계보는 각각 확인해야 한다.

- [[060_XLNet, RoBERTa, ALBERT Refining BERT with Permutation Modeling, Training Optimization, and Parameter Efficiency|XLNet]]: Transformer-XL의 recurrence·relative position backbone에 permutation objective와 two-stream attention을 결합했다. Transformer-XL 자체의 causal LM objective와 구분해야 한다.
- RoPE·ALiBi: relative relationship을 position interaction에 넣는다는 넓은 문제를 공유하지만 Transformer-XL의 four-term score와 같은 encoding은 아니다.
- Longformer·BigBird: 긴 sequence라는 목표를 공유하지만 local·global·random sparse attention으로 계산 graph를 바꾼 별도 방식이다.

GPT-3는 Transformer-XL relative encoding을 채택한 직접 사례로 제시할 수 없다. PaLM·LLaMA가 RoPE를 사용한다는 사실도 그 model 전체가 Transformer-XL에서 직접 파생됐다는 증거는 아니다.

## 8. 한계와 비판적 관점

- **모든 Transformer가 segment마다 과거를 잊는다**: 논문의 직접 비교 대상은 fixed-segment autoregressive LM training paradigm이다. 한 입력 window 안의 Transformer는 그 window의 허용된 전체 context를 사용한다.
- **원 sinusoidal encoding은 새 위치를 계산할 수 없어 반드시 retraining해야 한다**: 수학적으로 더 먼 position 값을 만들 수 있다. 원 논문의 직접 문제는 state reuse 때 같은 absolute index가 segment마다 반복돼 시간 관계가 모호해지는 점이다.
- **이전 같은 layer state를 재귀적으로 넣는다**: 실제 memory는 이전 segment의 layer $n-1$ hidden sequence이고 current layer $n$의 key·value context에 들어간다.
- **cache가 sequence 전체와 함께 무제한 증가한다**: $M$은 bounded hyperparameter이며 GPU memory가 허용하는 범위로 정한다.
- **relative distance embedding $\mathbf{R}_r$을 직접 학습한다**: $\mathbf{R}$은 sinusoidal이고 projection·global bias가 학습된다.
- **attention의 quadratic cost를 제거했다**: current $L$ query가 $M+L$ key에 attention하므로 memory를 늘리면 계산과 저장도 증가한다.
- **1,800배 빠른 Transformer training이다**: enwiki8에서 sliding-window vanilla baseline과 비교한 한 GPU per-token evaluation 최대 1,874배다.
- **긴 dependency가 필요한 과제에서만 이득이 있다**: 문장을 섞어 장기 dependency를 보존하지 않은 One Billion Word에서도 context fragmentation 완화로 개선됐다.
- **문서 분류·coreference·QA·code generation을 입증했다**: 원 논문은 이 application을 평가하지 않았다.
- **수천 token generation이 장문 coherence를 정량 입증했다**: WikiText-103의 제한된 qualitative sample이며 저자도 minor flaw를 인정했다.
- **GPT-3·PaLM·LLaMA·RoPE·Longformer·BigBird의 직접 계보다**: 각 후속 논문의 구조·인용 근거 없이 확정할 수 없다.

## 9. 용어 정리

| 용어 | 설명 |
|---|---|
| segment-level recurrence | 이전 segment의 hidden-state sequence를 current segment의 extra key/value context로 재사용하는 방식 |
| memory length $M$ | current segment가 참조하도록 보존한 과거 hidden-state 위치 수 |
| stop-gradient | forward 값은 사용하지만 해당 경로로 gradient를 역전파하지 않는 연산 |
| context fragmentation | corpus를 독립 segment로 잘라 경계에서 usable context가 끊기고 첫 위치의 문맥이 짧아지는 문제 |
| relative positional attention | absolute index 대신 query-key relative distance를 content와 함께 score에 넣는 방식 |
| RECL | 여러 model을 같은 short-context baseline에 맞춰 긴 context의 상대 perplexity 이득이 지속되는 길이를 비교한 지표 |
| state reuse | 이전 계산 결과를 cache해 evaluation에서 같은 context를 처음부터 다시 계산하지 않는 절차 |

## 10. 함께 보면 좋은 항목

- [[054_The Transformer Attention Is All You Need]]
- [[058_GPT-1 & GPT-2 Autoregressive Pretraining and Transfer Learning]]
- [[060_XLNet, RoBERTa, ALBERT Refining BERT with Permutation Modeling, Training Optimization, and Parameter Efficiency]]
- [[062_T5 and Text-to-Text Framework Unified NLP Through Text Transformations]]

## 11. 읽고 생각해볼 질문

1. Transformer-XL에서 forward 정보와 backward gradient는 각각 segment boundary를 넘는가?
2. segment마다 absolute position 1부터 다시 시작할 때 state reuse와 어떤 모호성이 생기는가?
3. `1,874× evaluation speedup`과 `450% longer RECL`을 일반적인 serving 속도·context window로 읽을 수 없는 이유는 무엇인가?
4. Transformer-XL recurrence, sliding/sparse attention과 retrieval memory는 긴 context 문제를 각각 어떤 자원으로 푸는가?

## 12. 짧은 결론

Transformer-XL은 Transformer에서 recurrence를 없앨 것인가 되살릴 것인가의 단순한 반전이 아니다. current segment 내부의 attention 병렬성을 유지하면서 이전 hidden sequence를 bounded, stop-gradient memory로 재사용해 fixed-segment context fragmentation을 줄인 설계다. relative positional attention은 이 state reuse가 시간 순서를 보존하게 한다. 이 정확한 범위에서 Transformer-XL은 long-context 연구의 중요한 전환점이지만, 무제한 context·linear attention·현대 모든 relative-position model의 직접 기원으로 확대해서는 안 된다.
