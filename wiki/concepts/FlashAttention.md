---
schema_version: 2
id: concept.flashattention
page_type: concept
title: FlashAttention
aliases:
  - 플래시어텐션
  - Flash Attention
  - IO-aware exact attention
tags:
  - type/concept
  - domain/ai
  - domain/computer-science
  - domain/machine-learning
  - domain/nlp
created: '2026-07-22'
updated: '2026-07-24'
lifecycle: active
verification: verified
artifacts:
  - 'raw/088_FlashAttention IO-Aware Exact Attention for Long-Context Language Models.ko.md'
  - 'raw/088_FlashAttention IO-Aware Exact Attention for Long-Context Language Models.commentary.ko.md'
  - 'raw/098_Long Context Models Processing Million-Token Sequences in Language AI.ko.md'
  - 'raw/098_Long Context Models Processing Million-Token Sequences in Language AI.commentary.ko.md'
evidence:
  - source_id: dao-et-al-2022-flashattention
    locator: '§§2.2–3.3과 Algorithms 0–1의 online softmax·타일링·재계산, Theorems 1–2와 Proposition 3의 공간·I/O 복잡도, §§4–5와 Tables 1–6의 성능·한계'
    relation: supports
  - source_id: dao-2023-flashattention-2
    locator: '초록과 §§2–3의 non-matmul FLOPs 절감·sequence 병렬화·warp 작업 분배'
    relation: contextualizes
  - source_id: shah-et-al-2024-flashattention-3
    locator: '초록과 §§2–3의 Hopper 비동기 실행·warp specialization·matmul–softmax 중첩·FP8 경로'
    relation: contextualizes
  - source_id: liu-et-al-2024-lwm
    locator: 'arXiv v1 §§2–3.2와 Figure 3·Table 1의 RingAttention과 FlashAttention 결합, RoPE scaling, Llama 2 7B(4K) 초기화 뒤 32K→128K→256K→512K→1M의 5-stage 확장'
    relation: contextualizes
related:
  - source.088
  - source.098
  - source.055
  - source.064
  - concept.transformer
  - concept.transformer-xl
  - concept.수치-안정성과-log-sum-exp
  - concept.긴-문맥-언어-모델
  - concept.대규모-언어-모델
  - concept.계산-복잡도와-비용-모델
  - analysis.훈련-병렬성과-생성-순차성은-다른-축이다
---
# FlashAttention

> [!note] 학습 안내
> **난이도:** 심화<br>
> **선수 지식:** [[Transformer]]의 query·key·value와 softmax attention, [[수치 안정성과 log-sum-exp]]의 max shift<br>
> **읽고 나면:** FlashAttention의 온라인 softmax·타일링·재계산을 설명하고, exact·선형 추가 메모리·이차 계산량이라는 세 표현을 동시에 정확히 사용할 수 있다.

## 1단계 — 먼저 잡을 핵심

### 한 문장 정의

[[FlashAttention]]은 표준 dense softmax attention을 근사하지 않은 채, query·key·value를 GPU의 빠른 온칩 메모리에 맞는 타일로 처리해 HBM 읽기·쓰기와 $N^2$ 중간 저장을 줄이는 알고리즘이다.

### 무엇이 달라지고 무엇이 그대로인가

모델이 계산하는 함수는 그대로다.

$$
\operatorname{Attention}(Q,K,V)
=\operatorname{softmax}(QK^{\mathsf T})V
$$

달라지는 것은 이 식을 실행하는 순서다. 전체 score·probability matrix를 HBM에 보관하지 않고 작은 tile을 계산하면서 softmax 통계와 value 가중합을 누적한다. 이 때문에 기존 dense checkpoint의 attention 정의를 유지할 수 있지만, 산술량까지 선형으로 바뀌지는 않는다.

## 2단계 — 작동 원리

### 온라인 누적의 세 상태

한 query 행을 여러 key block에 걸쳐 처리할 때 다음 상태를 유지한다.

- $m$: 지금까지 본 score의 최댓값
- $\ell$: 최댓값을 뺀 지수값의 누적 합
- $O$: 정규화 중인 value 가중합

새 block의 최댓값이 더 크면 이전 $\ell$과 $O$를 새 최댓값 기준으로 줄여 다시 스케일한다. 이어 새 block의 지수합과 value 기여를 더한다. 이 재스케일이 있어야 여러 block이 하나의 전체 softmax 분포가 된다.

두 score block $A,B$의 최댓값과 이동한 지수합을 $(m_A,\ell_A)$, $(m_B,\ell_B)$로 저장했다고 하자. $m=\max(m_A,m_B)$로 옮기면 전체 지수합은

$$
\ell=
\exp(m_A-m)\ell_A+
\exp(m_B-m)\ell_B
$$

가 된다. 각 block의 이전 합을 새 최댓값 기준으로 다시 줄여야 한다는 점이 핵심이다. 이 문서는 그 상태를 attention tile의 output 누적에 쓰는 알고리즘을 설명한다. 항등식·log-sum-exp·mask와 dtype의 수치 경계는 [[수치 안정성과 log-sum-exp]]가 owner다.

### SRAM tile의 처리 흐름

1. Key·value tile과 query tile을 SRAM에 올린다.
2. 작은 score tile을 계산하고 mask·softmax를 적용한다.
3. 행별 $m$, $\ell$, $O$를 갱신한다.
4. Score·probability tile은 HBM에 쓰지 않고 버린다.
5. 각 key·value tile을 반영한 부분 출력과 $m$, $\ell$을 HBM에 갱신해 다음 바깥 반복에서 다시 읽는다. Score·probability tile은 저장하지 않으며 마지막 반복 뒤의 출력이 최종값이다.

Backward에서는 저장한 출력과 정규화 통계를 사용해 필요한 score·probability tile을 다시 계산한다. 저장을 줄이는 대신 FLOPs를 더 쓰는 선택이다.

## 3단계 — 기술과 근거

### 복잡도의 정확한 해석

| 항목 | FlashAttention-1의 경계 |
| --- | --- |
| 수학적 함수 | 표준 dense softmax attention과 동일 |
| 산술 복잡도 | $O(N^2d)$ 유지 |
| attention 중간 추가 메모리 | $O(N)$ |
| HBM 접근 | 논문의 SRAM 모델에서 $\Theta(N^2d^2/M)$ |
| 수치 동일성 | 같은 수학적 함수, bitwise 동일 보장 아님 |
| 근사 확장 | §3.3 block-sparse 경로는 별도 근사 |

메모리 선형화는 모델 전체를 뜻하지 않는다. Parameter, 다른 layer activation, optimizer state와 autoregressive inference의 KV cache는 별도 장부다. 또한 $M$이 고정되면 HBM 접근 식도 시퀀스 길이에 대해 이차다.

이 표의 산술량·추가 메모리·I/O는 서로 다른 비용 축이다. $O(\cdot)$, FLOPs, memory capacity, bandwidth와 wall-clock을 비교하는 공통 기준은 [[계산 복잡도와 비용 모델]]에서 다루고, 여기서는 FlashAttention kernel의 정확한 경계만 다룬다.

### 왜 재계산이 빨라질 수 있는가

NeurIPS proceedings 최종본 Figure 2에서 A100으로 forward+backward를 수행한 예를 보면 FlashAttention은 표준 경로보다 FLOPs가 66.6에서 75.2 GFLOPs로 늘었다. 그러나 HBM 읽기·쓰기량은 35.3GB에서 4.4GB로 줄고 시간은 35.1ms에서 11.7ms로 짧아졌다. GPU가 산술보다 메모리 대역폭에 막힌 구간에서는 비싼 저장·읽기를 더 저렴한 재계산으로 바꾸는 편이 유리할 수 있다. ArXiv 개정본의 다른 Figure 2 측정값과 합치지 않는다.

### 속도 수치는 범위를 붙여 읽는다

Attention kernel의 2~4배 향상과 전체 model 학습의 향상은 다르다. BERT-large의 end-to-end 개선은 약 15%였고, GPT-2 small의 2.7일은 Hugging Face 9.5일 대비 약 3배, Megatron-LM 4.7일 대비 약 1.7배였다. 메모리 절감도 sequence 1,024·2,048·4,096에서 약 5.7배·10.6배·20.4배로 달랐다.

### 긴 문맥과 후속 버전의 경계

2022년 논문에서 exact Path-X 모델은 16K였고 64K Path-256은 approximate block-sparse 확장이었다. 별도 2023년 논문의 FlashAttention-2는 non-matmul FLOPs·single-head sequence 병렬화·warp 작업 분배를 개선했고, 별도 2024년 논문의 FlashAttention-3는 Hopper의 비동기 Tensor Core·TMA, warp specialization, matmul–softmax 중첩과 FP8 경로를 추가했다. 현재 구현의 성능과 지원 범위를 v1에 소급하지 않는다.

2024년 [[098_백만 토큰 문맥 모델의 명목 길이와 유효 활용 경계|LWM 사례]]는 FlashAttention을 RingAttention의 분산 sequence parallelism과 결합해 1M 문맥 모델을 훈련했다. 이는 FlashAttention 단독이 백만 토큰 창을 만든 사례가 아니다. 분산 장치, RoPE scaling, Llama 2 7B(4K) 초기화 뒤 32K→128K→256K→512K→1M으로 늘린 다섯 학습 단계와 장문 자료가 함께 필요했고, attention의 dense pairwise 산술량은 남았다.

## 검증과 한계

### 확인된 사실

- FlashAttention-1은 dense attention operator가 아니라 실행 algorithm과 CUDA kernel을 바꾼다.
- $N^2$ 중간 저장을 피하지만 $O(N^2d)$ 연산은 남는다.
- Exact는 근사하지 않는다는 뜻이며 floating-point bitwise 동일성을 뜻하지 않는다.
- Forward와 backward 모두 tile schedule을 사용하고 backward는 attention 중간값을 선택적으로 재계산한다.

### 적용 경계

원 구현은 특정 NVIDIA GPU 세대와 head dimension을 중심으로 작성됐다. 새 mask·bias·attention 변형이나 다른 accelerator에는 별도 kernel engineering이 필요할 수 있다. 긴 sequence를 실행할 수 있어도 위치 표현·훈련 길이·자료·과제에 따라 실제 장거리 활용 능력은 달라진다.

FlashAttention은 자기회귀 생성의 token-by-token 의존성도 없애지 않는다. 한 attention 호출의 I/O를 줄이는 일과 다음 token이 나오기 전에 이전 token을 기다려야 하는 확률적 의존성은 서로 다른 문제다.

## 학습 확인

### 확인 질문

1. FlashAttention의 exact는 어떤 것은 같고 어떤 것은 같다고 보장하지 않는가?
2. 추가 메모리가 $O(N)$이어도 계산량이 $O(N^2d)$로 남는 이유는 무엇인가?
3. Figure 2에서 FLOPs가 늘었는데 실행 시간이 줄어든 이유는 무엇인가?

### 다음 문서

- [[088_FlashAttention과 IO 인지형 정확 어텐션]] — 논문의 I/O 정리와 실제 BERT·GPT-2·장문 실험, 원문 정정을 함께 확인한다.
- [[훈련 병렬성과 생성 순차성은 다른 축이다]] — 메모리 이동과 자기회귀 생성 의존성을 포함한 여러 효율 축을 비교한다.
- [[수치 안정성과 log-sum-exp]] — online softmax가 공유하는 max shift·block 재스케일의 수치적 근거를 본다.

## 출처

- Tri Dao 외, [FlashAttention: Fast and Memory-Efficient Exact Attention with IO-Awareness](https://proceedings.neurips.cc/paper_files/paper/2022/hash/67d57c32e20fd0a7a302cb81d36e40d5-Abstract.html), NeurIPS 2022, §§2.2–5, Algorithms 0–1, Theorems 1–2, Propositions 3–4, Figures 1–3, Tables 1–6과 Appendices B·E.
- Tri Dao, [FlashAttention-2: Faster Attention with Better Parallelism and Work Partitioning](https://arxiv.org/abs/2307.08691), 2023, 초록과 §§2–3.
- Jay Shah 외, [FlashAttention-3: Fast and Accurate Attention with Asynchrony and Low-precision](https://arxiv.org/abs/2407.08608), 2024, 초록과 §§2–3.
- [[088_FlashAttention과 IO 인지형 정확 어텐션]]
- [[098_백만 토큰 문맥 모델의 명목 길이와 유효 활용 경계]]
- Hao Liu 외, [World Model on Million-Length Video And Language With RingAttention](https://arxiv.org/abs/2402.08268v1), 2024, §§2–3.2, Figure 3과 Table 1.
- 프로젝트 보존 자료: `raw/088_FlashAttention IO-Aware Exact Attention for Long-Context Language Models.ko.md`, `raw/088_FlashAttention IO-Aware Exact Attention for Long-Context Language Models.commentary.ko.md`.
- 프로젝트 보존 자료: `raw/098_Long Context Models Processing Million-Token Sequences in Language AI.ko.md`, `raw/098_Long Context Models Processing Million-Token Sequences in Language AI.commentary.ko.md`.

## 관련 항목

- [[088_FlashAttention과 IO 인지형 정확 어텐션]]
- [[098_백만 토큰 문맥 모델의 명목 길이와 유효 활용 경계]]
- [[055_Transformer와 자기어텐션 기반 시퀀스 모델링]]
- [[064_Transformer-XL과 세그먼트 수준 재귀]]
- [[Transformer]]
- [[Transformer-XL]]
- [[수치 안정성과 log-sum-exp]]
- [[긴 문맥 언어 모델]]
- [[대규모 언어 모델]]
- [[계산 복잡도와 비용 모델]]
- [[훈련 병렬성과 생성 순차성은 다른 축이다]]
