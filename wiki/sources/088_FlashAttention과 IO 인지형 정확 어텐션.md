---
schema_version: 2
id: source.088
page_type: source
title: FlashAttention과 I/O 인지형 정확 어텐션
aliases:
  - 088_FlashAttention IO-Aware Exact Attention for Long-Context Language Models
  - 'FlashAttention: Fast and Memory-Efficient Exact Attention with IO-Awareness'
  - FlashAttention 1
tags:
  - type/source
  - domain/ai
  - domain/computer-science
  - domain/machine-learning
  - domain/nlp
created: '2026-07-22'
updated: '2026-07-22'
lifecycle: active
verification: verified
artifacts:
  - 'raw/088_FlashAttention IO-Aware Exact Attention for Long-Context Language Models.ko.md'
  - 'raw/088_FlashAttention IO-Aware Exact Attention for Long-Context Language Models.commentary.ko.md'
evidence:
  - source_id: dao-et-al-2022-flashattention
    locator: '초록, §§2.2–3.3·4.1–4.3·5, Algorithms 0–1, Theorems 1–2, Propositions 3–4, Figures 1–3, Tables 1–6과 Appendices B.2·B.4·B.5·E.4–E.6의 HBM–SRAM 타일링·재계산·I/O 복잡도·실험 조건·이식성 한계'
    relation: supports
  - source_id: dao-2023-flashattention-2
    locator: '초록과 §§2–3의 non-matmul FLOPs 절감·sequence 병렬화·warp 작업 분배 및 FlashAttention-1 대비 범위'
    relation: contextualizes
  - source_id: shah-et-al-2024-flashattention-3
    locator: '초록과 §§2–3의 Hopper TMA·warp specialization·matmul–softmax 비동기 중첩·FP8 저정밀 경로'
    relation: contextualizes
related:
  - concept.flashattention
  - concept.transformer
  - concept.transformer-xl
  - concept.대규모-언어-모델
  - source.055
  - source.064
  - analysis.훈련-병렬성과-생성-순차성은-다른-축이다
---
# FlashAttention과 I/O 인지형 정확 어텐션

> [!note] 학습 안내
> **난이도:** 심화<br>
> **선수 지식:** [[Transformer]]의 scaled dot-product attention과 GPU 메모리 계층의 기본 개념<br>
> **읽고 나면:** FlashAttention이 같은 dense attention을 어떤 블록 순서로 계산하는지 설명하고, 추가 메모리·FLOPs·HBM 접근·wall-clock을 서로 다른 축으로 구분할 수 있다.

## 1단계 — 먼저 잡을 핵심

### 핵심 문장

**[[FlashAttention]]**은

$$
O=\operatorname{softmax}(QK^{\mathsf T})V
$$

라는 표준 dense attention의 수학적 정의를 바꾸지 않고, 큰 중간 행렬을 GPU의 고대역폭 메모리(HBM)에 저장하지 않도록 계산 순서를 다시 설계한 I/O 인지형 알고리즘이다. Query·key·value를 온칩 SRAM에 들어가는 블록으로 나누고, 행별 softmax 통계와 출력을 온라인으로 누적한다. 역방향에서는 전체 attention matrix를 보관하는 대신 필요한 블록을 재계산한다.

여기서 **exact**는 희소화·저랭크·kernel approximation 없이 같은 dense softmax attention 함수를 계산한다는 뜻이다. 부동소수점 덧셈 순서까지 같아 bitwise identical하다는 뜻은 아니다. 또한 attention 중간 상태의 추가 저장은 시퀀스 길이 $N$에 대해 $O(N)$으로 줄지만 산술량 $O(N^2d)$은 남는다.

### 역사적 위치

2022년 FlashAttention의 기여를 타일링 하나의 발명으로 쓰지 않는다. 타일링과 재계산은 알려진 기법이었고, 전체 attention matrix를 저장하지 않는 선행 접근도 있었다. Dao 등은 HBM–SRAM 이동을 알고리즘 분석에 넣고, 안정적인 블록별 softmax 누적·forward와 backward schedule·fused CUDA kernel·I/O 하한과 실제 Transformer 학습 평가를 결합했다.

따라서 이 연구는 새로운 Transformer architecture보다 **같은 operator를 다른 algorithm과 kernel로 실행한 시스템 연구**에 가깝다. 긴 문맥을 계산할 수 있는 자원 조건을 개선했지만, 모델이 먼 정보를 실제로 이해·검색·조합하는 능력까지 자동으로 보장하지 않는다.

## 2단계 — 작동 원리

### 표준 경로는 왜 HBM을 많이 오가는가

표준 구현은 대개 다음 세 연산을 별도 kernel로 수행한다.

1. $S=QK^{\mathsf T}$를 계산해 $N\times N$ score matrix를 HBM에 쓴다.
2. $P=\operatorname{softmax}(S)$를 계산해 probability matrix를 다시 HBM에 쓴다.
3. $O=PV$를 계산하려고 $P$와 $V$를 읽는다.

Mask와 dropout이 들어가면 중간 읽기·쓰기가 더 늘 수 있다. GPU의 행렬 곱셈 처리량이 높아도 큰 $S$와 $P$를 HBM에 물질화하면 데이터 이동을 기다리는 시간이 병목이 된다.

### 블록별 온라인 softmax

FlashAttention은 다음 순서로 전체 행렬 저장을 피한다.

1. SRAM 용량에 맞춰 $Q$, $K$, $V$를 블록으로 나눈다.
2. 한 key·value 블록과 query 블록을 SRAM에 올려 score tile을 계산한다.
3. 각 query 행에서 지금까지 본 score의 최댓값 $m$과 지수합 $\ell$을 갱신한다.
4. 최댓값이 바뀌면 이전 출력 누산값을 새 기준에 맞춰 재스케일한 뒤 현재 value 가중합을 더한다.
5. 각 key·value 블록을 반영한 부분 출력과 작은 행별 통계를 HBM에 갱신해 다음 바깥 반복에서 다시 읽고, score·probability tile은 저장하지 않는다. 마지막 반복 뒤의 출력이 최종값이다.

각 블록의 softmax를 독립적으로 계산해 이어 붙이는 방식이 아니다. 이전 블록과 새 블록의 최대값·정규화 합을 같은 기준으로 맞추므로 마지막에는 전체 행을 한 번에 softmax한 것과 같은 수학적 결과가 나온다.

### 역방향의 선택적 재계산

Backward는 forward 출력과 softmax 정규화 통계를 저장하고, gradient 계산에 필요한 $S$와 $P$ tile을 $Q$와 $K$로 다시 만든다. 이는 저장 공간을 줄이는 대신 산술 연산을 더 하는 교환이다. 논문은 attention backward를 명시적으로 유도했으며, 모델 전체의 임의 activation을 다루는 범용 gradient checkpointing 기능을 통합한 것으로 설명하지 않는다.

## 3단계 — 기술과 근거

### 네 가지 비용 장부

| 비교 축 | 표준 attention 구현 | FlashAttention-1 |
| --- | --- | --- |
| 수학적 operator | dense softmax attention | 동일한 dense softmax attention |
| 산술량 | $O(N^2d)$ | $O(N^2d)$, backward 재계산으로 실제 FLOPs는 더 많을 수 있음 |
| attention 중간 추가 저장 | $O(N^2)$ | $O(N)$ |
| 논문의 HBM 접근 모델 | $\Theta(Nd+N^2)$ | $\Theta(N^2d^2/M)$, $d\le M\le Nd$ |
| 근사 여부 | 정확 | 정확한 dense 경로; §3.3 block-sparse 확장은 별도 근사 |

$M$은 SRAM 크기다. $M$을 고정하면 FlashAttention의 HBM 접근 식도 $N$에 대해 이차이므로 “I/O 복잡도가 언제나 선형”이라고 쓰지 않는다. 선형으로 줄어드는 것은 저장하는 attention 중간 상태의 추가 공간이다. 이 결과도 단일 GPU와 논문이 가정한 메모리 계층·$M$ 범위 안의 분석이다.

### 더 많은 FLOPs로 더 짧아진 시간

논문 Figure 2는 A100, GPT-2 medium, sequence 1,024, head dimension 64, 16 heads, batch 64의 forward+backward를 비교한다.

| 경로 | 산술량 | HBM 읽기·쓰기량 | 시간 |
| --- | ---: | ---: | ---: |
| 표준 attention | 66.6 GFLOPs | 35.3GB | 35.1ms |
| FlashAttention | 75.2 GFLOPs | 4.4GB | 11.7ms |

FlashAttention은 재계산 때문에 약 13% 더 많은 FLOPs를 수행했지만 HBM 읽기·쓰기량을 약 8배 줄여 실행 시간을 약 3분의 1로 낮췄다. 이는 FLOPs·메모리 용량·메모리 대역폭·wall-clock이 같은 축이 아님을 직접 보여 준다. 이 표는 등록한 NeurIPS proceedings 최종본의 Figure 2 수치이며, arXiv 개정본의 다른 측정값과 섞지 않는다.

### kernel과 전체 모델 수치를 섞지 않는다

- Attention kernel은 Appendix E.5의 A100 실험에서 대체로 2~4배, RTX 3090에서 2.5~4.5배 빨랐다.
- BERT-large, sequence 512, 8×A100-80GB에서 목표 MLM 정확도 72%까지 Nvidia MLPerf는 $20.0\pm1.5$분, FlashAttention은 $17.4\pm1.4$분으로 약 15% 단축됐다.
- GPT-2 small 학습은 Hugging Face 9.5일, Megatron-LM 4.7일, FlashAttention 2.7일이었다. 최대 약 3배는 Hugging Face 대비이고 Megatron 대비는 약 1.7배다.
- A100 FP16 forward+backward 메모리는 sequence 1,024에서 PyTorch 1,184MB 대 FlashAttention 209MB, 2,048에서 4,416MB 대 418MB, 4,096에서 17,024MB 대 836MB였다. 절감 배수는 약 5.7배·10.6배·20.4배로 길이에 따라 달랐다.

따라서 원문의 “2~4배 속도, 5~10배 메모리”는 보편 상수가 아니다. Kernel microbenchmark와 end-to-end 훈련, 길이·dtype·GPU·baseline을 분리해야 한다.

### 긴 문맥 실험의 범위

GPT-2 small은 Megatron-LM의 1K 문맥 4.7일·perplexity 18.2와 비교해 FlashAttention 4K 문맥에서 3.6일·17.5를 기록했다. MIMIC 문서 분류는 512에서 52.8, 16K에서 57.1이었고 ECtHR은 512에서 72.2, 8K에서 80.7, 16K에서 79.2였다. 문맥을 늘리면 항상 단조롭게 좋아진다는 결과가 아니다.

LRA에서 exact FlashAttention의 Path-X 16K 결과는 61.4%였다. Path-256 64K의 63.1%는 §3.3의 approximate block-sparse 확장이다. Attention kernel 자체는 exact 경로로 64K까지 측정됐지만, 이를 64K exact 모델 품질 결과와 합치지 않는다.

### 2022년 v1과 후속 버전

이 문서는 FlashAttention-1을 다룬다. 별도 2023년 논문인 FlashAttention-2는 non-matmul FLOPs를 줄이고 single-head sequence 병렬화와 warp 작업 분배를 개선했다. 별도 2024년 논문인 FlashAttention-3는 Hopper의 Tensor Core·TMA 비동기성을 warp specialization과 matmul–softmax 중첩에 활용하고 FP8 경로를 더했다. 후속 논문의 속도와 hardware 지원을 2022년 v1 성과로 소급하지 않는다.

원 논문 각주는 구현 code의 공개 주소를 제공했다. 이는 연구 kernel을 재사용하고 검토할 수 있게 했다는 뜻이지, 모든 attention 변형과 모든 GPU·가속기를 동일하게 지원하는 범용 구현이 완성됐다는 뜻은 아니다.

## 검증과 한계

### 원 웹글의 검증 정정

- **Attention 메커니즘 자체의 메모리 복잡도가 본질적으로 $O(N^2)$이다:** Dense operator의 산술량은 $O(N^2d)$이고, $O(N^2)$ 활성 메모리는 표준 구현이 $S$와 $P$를 물질화하는 방식에서 생긴다. 같은 operator도 중간 저장 없이 계산할 수 있다.
- **Exact는 표준 attention과 결과가 완전히 동일하다:** 근사하지 않는다는 뜻이다. 부동소수점 연산 순서가 달라 작은 수치 오차가 생길 수 있으므로 bitwise 동일성을 주장하지 않는다.
- **타일링·온라인 softmax만으로 모든 혁신을 설명할 수 있다:** 타일링·재계산은 알려진 기법이었다. I/O schedule, 안정적인 누적, fused forward·backward, I/O 분석과 실험을 결합한 것이 핵심이다.
- **일반 gradient checkpointing을 통합했다:** Attention matrix를 저장하지 않고 backward에서 필요한 블록을 명시적으로 재계산한 selective recomputation이다.
- **Register blocking과 memory coalescing이 논문의 명시적 핵심 기법이다:** 일반 CUDA 최적화 표현이지만 2022년 논문이 핵심 기여로 직접 제시한 항목은 아니다.
- **표준 attention을 언제나 코드 한 줄로 대체할 수 있다:** 원 구현은 head dimension과 Turing·Ampere GPU 등 지원 조건이 있었고, 새로운 attention 변형마다 저수준 kernel 작업이 필요할 수 있다.
- **2~4배·5~10배는 모든 상황의 고정 개선이다:** Kernel·전체 모델과 길이·dtype·hardware·baseline에 따라 값이 크게 달라진다.
- **최대 16K가 exact FlashAttention의 절대 한계다:** Kernel benchmark는 더 길게 실행됐고, 모델 실험의 16K exact와 64K block-sparse 결과는 서로 다른 조건이다.
- **품질 절충이 전혀 없다:** 같은 dense model definition에는 근사가 없지만 추가 FLOPs·이차 계산·custom kernel 제약은 남는다. 더 긴 문맥의 품질 향상은 kernel 자체가 아니라 달라진 훈련 조건의 효과다.
- **책·장시간 대화·RAG와 여러 후속 시스템에 미친 직접 영향이 논문에서 입증됐다:** 2022년 논문의 실제 평가는 GPT-2·BERT·LRA·MIMIC·ECtHR 범위다. 후속 채택과 산업 영향에는 별도 근거가 필요하다.

### 남은 한계

Dense attention의 $O(N^2d)$ 계산량은 극장문에서 계속 병목이다. Attention 중간 상태가 선형이어도 모델의 다른 activation·parameter·optimizer state와 추론 KV cache는 남는다. 논문도 각 attention 변형마다 새 CUDA kernel이 필요하며 GPU architecture 사이 이식성이 제한될 수 있다고 적었다.

긴 sequence가 장치에 들어간다는 사실과 모델이 멀리 있는 증거를 안정적으로 활용한다는 사실도 분리한다. Position encoding, 훈련 길이 분포, data, objective와 평가 과제가 장문 능력을 함께 결정한다.

## 학습 확인

### 확인 질문

1. 표준 attention이 $S$와 $P$를 HBM에 물질화할 때 어떤 데이터 이동이 반복되는가?
2. 온라인 softmax가 이전 블록의 최댓값·지수합·출력을 새 최댓값 기준으로 재스케일해야 하는 이유는 무엇인가?
3. FlashAttention이 더 많은 FLOPs를 사용하면서도 더 빠르고 메모리 효율적일 수 있는 이유는 무엇인가?

### 다음 문서

- [[Transformer-XL]] — 세그먼트 상태 재사용이라는 architecture 변화와 같은 dense attention의 실행 schedule 최적화를 비교한다.
- [[훈련 병렬성과 생성 순차성은 다른 축이다]] — FLOPs·메모리·대역폭·wall-clock과 자기회귀 생성 의존성을 서로 다른 효율 축으로 이어서 본다.

## 출처

- Tri Dao·Daniel Y. Fu·Stefano Ermon·Atri Rudra·Christopher Ré, [FlashAttention: Fast and Memory-Efficient Exact Attention with IO-Awareness](https://proceedings.neurips.cc/paper_files/paper/2022/hash/67d57c32e20fd0a7a302cb81d36e40d5-Abstract.html), NeurIPS 2022, 특히 §§2.2–5, Algorithms 0–1, Theorems 1–2, Propositions 3–4, Figures 1–3, Tables 1–6과 Appendices B·E; [arXiv:2205.14135](https://arxiv.org/abs/2205.14135).
- Tri Dao, [FlashAttention-2: Faster Attention with Better Parallelism and Work Partitioning](https://arxiv.org/abs/2307.08691), 2023, 초록과 §§2–3.
- Jay Shah 외, [FlashAttention-3: Fast and Accurate Attention with Asynchrony and Low-precision](https://arxiv.org/abs/2407.08608), 2024, 초록과 §§2–3.
- 프로젝트 번역·검토 출발 자료: [FlashAttention: IO-Aware Exact Attention for Long-Context Language Models](https://mbrenndoerfer.com/writing/flashattention-io-aware-exact-attention-long-context-language-models).
- 프로젝트 보존 자료: `raw/088_FlashAttention IO-Aware Exact Attention for Long-Context Language Models.ko.md`, `raw/088_FlashAttention IO-Aware Exact Attention for Long-Context Language Models.commentary.ko.md`.

## 관련 항목

- [[FlashAttention]]
- [[Transformer]]
- [[Transformer-XL]]
- [[대규모 언어 모델]]
- [[055_Transformer와 자기어텐션 기반 시퀀스 모델링]]
- [[064_Transformer-XL과 세그먼트 수준 재귀]]
- [[훈련 병렬성과 생성 순차성은 다른 축이다]]
