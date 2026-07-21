---
source_file: "088_FlashAttention IO-Aware Exact Attention for Long-Context Language Models.md"
translation_file: "088_FlashAttention IO-Aware Exact Attention for Long-Context Language Models.ko.md"
commentary_type: "해설"
source_stem: "088_FlashAttention IO-Aware Exact Attention for Long-Context Language Models"
order_prefix: "088"
topic: "FlashAttention과 I/O 인지형 정확 어텐션"
period: "2022"
tags:
  - LLM
  - NLP
  - AI-history
  - commentary
  - transformer
  - efficient-attention
  - gpu
---

# FlashAttention과 I/O 인지형 정확 어텐션 해설

## 1. 한눈에 보기

- 핵심 주제: 표준 dense softmax attention의 수학적 정의는 유지하면서, GPU의 고대역폭 메모리(HBM)와 온칩 SRAM 사이 데이터 이동을 줄이는 계산 순서
- 등장 배경: 표준 구현은 \(N \times N\) score와 probability 행렬을 HBM에 물질화해, 행렬 곱셈 자체보다 메모리 읽기·쓰기가 병목이 되기 쉬웠다.
- 가장 중요한 아이디어: query·key·value를 SRAM에 들어가는 타일로 나누고, 행별 최댓값·지수합·출력 누산값을 재스케일하며 온라인 softmax를 계산한다.
- 이후 LLM/NLP에 남긴 영향: 모델 아키텍처와 점근적 FLOPs가 같아도 I/O schedule과 kernel fusion을 바꾸면 실제 속도·메모리가 크게 달라질 수 있다는 점을 대표적으로 보여 주었다.

> 이 문서는 `088_FlashAttention IO-Aware Exact Attention for Long-Context Language Models.md`의 번역문을 이해하기 위한 해설입니다. 원문의 설명을 반복하기보다 2022년 NeurIPS 논문을 기준으로 exact의 의미, 메모리와 계산 복잡도, 실제 측정 조건, block-sparse 확장과 후속 버전의 경계를 바로잡습니다.

## 2. 핵심 요약

FlashAttention은 새로운 어텐션 함수가 아니라 기존의 \(O=\operatorname{softmax}(QK^\mathsf{T})V\)를 GPU 메모리 계층에 맞는 순서로 실행하는 알고리즘이다. 표준 구현은 score 행렬 \(S\)와 probability 행렬 \(P\)를 HBM에 쓰고 다시 읽는다. FlashAttention은 query·key·value 블록을 빠른 SRAM으로 가져와 행별 softmax 통계와 출력 누산값을 온라인으로 갱신하고, 완성된 출력만 HBM에 기록한다. 역방향에서는 전체 어텐션 행렬을 저장하지 않고 저장해 둔 출력과 정규화 통계로 score와 probability를 블록별 재계산한다. 그 결과 어텐션 중간 상태의 추가 메모리는 시퀀스 길이에 대해 선형이 되지만, dense attention의 산술 연산량 \(O(N^2d)\)은 그대로다. 오히려 재계산으로 FLOPs가 늘 수 있는데도 HBM 왕복이 크게 줄어 실제 실행은 빨라질 수 있다.

논문이 말하는 **exact**는 희소화·저랭크 근사 없이 같은 dense softmax attention을 계산한다는 뜻이다. 부동소수점 연산 순서까지 같아 bitwise identical하다는 뜻은 아니다. 성능 수치도 조건을 붙여 읽어야 한다. attention kernel은 A100에서 대체로 2~4배 빨랐지만, BERT-large 전체 학습 시간 개선은 15%였고 GPT-2 전체 학습의 최대 3배 수치는 느린 Hugging Face 기준선과 비교한 결과다. 메모리 절감도 길이와 dtype, baseline에 따라 달라지며 논문의 측정에서는 5.7배부터 약 20.4배까지 나타났다. 따라서 FlashAttention의 의의는 하나의 고정 배수가 아니라 **산술량과 데이터 이동량을 서로 다른 효율 축으로 다룬 것**에 있다.

- 무엇을 다루는가: 단일 GPU 메모리 계층에서 정확한 dense attention의 I/O를 줄이는 forward·backward 알고리즘과 CUDA kernel
- 어떤 문제를 해결하려 했는가: \(N^2\) 중간 행렬의 HBM 물질화와 반복적인 읽기·쓰기가 만드는 메모리 용량·대역폭 병목
- 어떤 방식이 새로웠는가: 타일링, 온라인 softmax, kernel fusion, 역방향 선택적 재계산을 I/O 복잡도 분석과 함께 결합
- 결과적으로 무엇을 바꾸었는가: 더 긴 정확 어텐션을 같은 장치에서 실행하고, 더 많은 FLOPs를 쓰더라도 더 짧은 wall-clock을 얻을 수 있음을 보였다.

## 3. 역사적 배경

Transformer의 scaled dot-product attention은 query와 key의 모든 쌍을 비교한다. 계산량은 본래 \(O(N^2d)\)이고, 순진한 구현은 \(N \times N\) 중간 행렬도 저장한다. 긴 문맥을 다루려던 선행 연구는 sparse pattern, low-rank projection, kernel approximation처럼 attention operator 자체를 바꾸는 경우가 많았다. 이런 방법은 계산량을 줄일 수 있지만 원래 dense softmax attention과 다른 근사 모델이 된다.

반대로 타일링과 재계산은 고성능 컴퓨팅에서 이미 알려진 기법이었고, 전체 attention matrix를 저장하지 않는 메모리 효율적 계산도 선행 연구가 있었다. 2022년 FlashAttention의 기여는 타일링 하나를 처음 발명한 데 있지 않다. 논문은 GPU의 HBM–SRAM 계층을 대상으로 정확한 blockwise softmax 누적, forward·backward schedule, fused CUDA kernel, I/O 복잡도와 하한 분석, 실제 Transformer 학습 평가를 하나로 결합했다.

- 이전 접근법: PyTorch 같은 프레임워크에서 matmul, mask·softmax·dropout, matmul을 별도 kernel로 호출하거나, operator를 근사·희소화해 \(N^2\) 비용을 줄이는 방식
- 당시의 한계: 별도 kernel 사이에서 큰 중간 행렬을 HBM에 쓰고 읽으면 GPU의 높은 산술 처리량을 충분히 활용하지 못했다.
- 이 주제가 필요했던 이유: 모델 구조를 바꾸지 않고도 attention의 메모리 병목을 줄여 기존 checkpoint와 품질 정의를 유지할 실행 경로가 필요했다.

공식 서지와 알고리즘은 Tri Dao 외, [*FlashAttention: Fast and Memory-Efficient Exact Attention with IO-Awareness*](https://arxiv.org/abs/2205.14135), NeurIPS 2022에 근거한다. 번역 원문의 제목은 공식 논문 제목을 요약해 바꾼 것이므로 둘을 같은 정식 서명으로 혼동하지 않는다.

## 4. 핵심 개념 해설

### 4.1 표준 구현의 병목은 어디에 있는가

표준 dense attention을 다음 세 단계로 쓰자.

\[
S=QK^\mathsf{T},\qquad P=\operatorname{softmax}(S),\qquad O=PV
\]

수학식만 보면 큰 행렬 곱셈 두 번이 핵심처럼 보인다. 그러나 일반적인 구현은 \(S\)와 \(P\)를 HBM에 기록하고 다음 kernel이 다시 읽는다. 논문의 Algorithm 0과 §2.2는 이 표준 경로의 HBM 접근을 \(\Theta(Nd+N^2)\)로 센다. FlashAttention은 산술식을 바꾸지 않고 중간 행렬이 HBM을 왕복하는 횟수를 줄인다.

8,000 × 8,000 행렬은 6,400만 원소다. 한 행렬만 보아도 FP32이면 약 256MB, FP16·BF16이면 약 128MB다. 실제 학습에서는 batch와 head 수가 곱해지고 score와 probability, gradient 관련 상태까지 고려해야 하므로 부담이 더 커진다. 따라서 원문의 “250MB 이상”은 **FP32 단일 행렬**이라는 조건에서만 직접 읽을 수 있다.

### 4.2 온라인 softmax는 블록 결과를 어떻게 합치는가

softmax는 한 행의 모든 score를 알아야 정규화할 수 있어 보인다. FlashAttention은 각 query 행에 대해 지금까지 본 score의 최댓값 \(m\), 지수합 \(\ell\), value 가중합을 유지한다. 새 key block을 처리할 때 새 최댓값을 구하고, 이전 누산값을 \(\exp(m_{old}-m_{new})\)로 재스케일한 뒤 새 block의 지수합과 value 기여를 더한다. 마지막 block까지 처리하면 전체 행을 한꺼번에 softmax한 것과 같은 수학적 출력을 얻는다.

이 방법은 overflow를 피하기 위한 max subtraction도 블록 사이에서 일관되게 유지한다. 핵심은 각 block의 softmax를 독립적으로 계산해 단순히 이어 붙이는 것이 아니다. 이전 block과 새 block의 정규화 기준을 계속 맞추므로 전체 행의 하나의 확률분포가 된다.

### 4.3 타일링과 kernel fusion

FlashAttention은 SRAM 용량 \(M\)에 맞춰 query·key·value를 block으로 나눈다. 논문의 Algorithm 1은 key·value block을 SRAM에 불러오고 query block과 곱해 score tile을 만든 뒤, mask·softmax·선택적 dropout과 value 가중합을 같은 kernel 안에서 진행한다. score와 probability tile은 SRAM에서 사용한 뒤 버리고, 행별 통계와 완성 중인 출력만 갱신한다.

여기서 **I/O 인지형**이라는 말은 단순히 GPU 코드를 사용했다는 뜻이 아니다. 어떤 값을 HBM에 보관하고 어떤 값을 SRAM에서 재사용하며, block 크기를 메모리 용량에 어떻게 맞추는지가 알고리즘 설계의 일부라는 뜻이다. 원문의 register blocking·memory coalescing 표현은 일반적인 CUDA 최적화 설명으로는 그럴듯하지만 2022년 논문이 핵심 기여로 직접 명시한 항목은 아니다.

### 4.4 역방향은 저장 대신 재계산을 택한다

일반적인 자동 미분은 forward의 큰 중간 상태를 backward까지 저장한다. FlashAttention은 출력 \(O\)와 각 행의 softmax 정규화 통계를 저장하고, backward에서 필요한 \(S\)와 \(P\) tile을 \(Q\)와 \(K\)로 다시 계산한다. 이 selective recomputation은 attention matrix 저장을 피하지만 산술 연산은 더 한다.

이를 모델 전체에 적용하는 범용 gradient checkpointing과 같다고 쓰면 부정확하다. 논문은 attention backward를 직접 유도하고, 필요한 attention 중간 상태만 선택적으로 재계산한다. 원문 번역에는 “gradient checkpointing을 통합했다”는 표현을 보존했지만, 공식 구현의 핵심은 별도 범용 기능이 아니라 이 명시적 backward schedule이다.

### 4.5 메모리, FLOPs, I/O 복잡도는 다른 축이다

FlashAttention의 추가 저장 공간은 시퀀스 길이에 대해 \(O(N)\)이지만 dense attention의 FLOPs는 \(O(N^2d)\)다. 이는 모델 전체 활성 메모리나 autoregressive inference의 KV cache가 모두 선형으로 해결됐다는 뜻이 아니다.

논문의 I/O 모델에서 표준 attention은 \(\Theta(Nd+N^2)\)번 HBM 접근을 하고, FlashAttention은 \(d\le M\le Nd\) 조건에서 \(\Theta(N^2d^2/M)\)번 접근한다. SRAM 크기 \(M\)이 커질수록 재사용이 늘어나는 식이다. \(M\)을 고정하면 이 식도 \(N\)에 대해 이차이므로 “I/O 복잡도 자체가 언제나 선형”이라고 요약하면 안 된다. 선형이 되는 것은 저장하는 attention 중간 상태의 추가 공간이다.

### 4.6 실제 수치는 어떤 조건에서 나왔는가

논문 Figure 2의 GPT-2 medium 예가 차이를 가장 선명하게 보여 준다. A100, 시퀀스 1,024, head dimension 64, 16 heads, batch 64의 forward+backward에서 표준 경로는 66.6 GFLOPs와 40.3GB HBM 접근으로 41.7ms가 걸렸다. FlashAttention은 재계산 때문에 75.2 GFLOPs로 연산이 늘었지만 HBM 접근은 4.4GB, 시간은 7.3ms였다. **더 많은 계산을 하고도 데이터 이동이 줄어 더 빨라진 것**이다.

다른 수치도 기준선을 붙여 읽어야 한다.

- attention kernel: A100에서 대체로 2~4배, RTX 3090에서 2.5~4.5배 속도 향상
- BERT-large, sequence 512, 8×A100-80GB: 같은 목표 MLM 정확도까지 Nvidia MLPerf 20.0±1.5분, FlashAttention 17.4±1.4분으로 약 15% 단축
- GPT-2 small: Hugging Face 9.5일, Megatron-LM 4.7일, FlashAttention 2.7일. 최대 약 3배는 Hugging Face 대비이고 Megatron 대비는 약 1.7배다.
- 메모리, A100 FP16 forward+backward: sequence 1,024에서 PyTorch 1,184MB 대 FlashAttention 209MB, 2,048에서 4,416MB 대 418MB, 4,096에서 17,024MB 대 836MB

따라서 “2~4배 속도, 5~10배 메모리”는 모든 모델·길이·GPU의 고정 배수가 아니다. 논문 조건에서는 메모리 절감이 20배를 넘는 길이도 있었고, 전체 학습 속도 개선은 kernel 수치보다 작을 수 있었다.

### 4.7 exact, block-sparse, 후속 버전을 분리한다

2022년 FlashAttention-1의 중심은 정확한 dense attention이다. 같은 논문 §3.3은 nonzero block 비율 \(s\)만 계산하는 block-sparse 확장도 제시하는데, 이는 attention pattern을 제한하는 근사 모델이다. LRA의 Path-X 16K 결과 61.4%는 exact FlashAttention이고, Path-256 64K 결과 63.1%는 block-sparse 변형이다. 64K 모델 성과를 모두 exact dense 결과로 옮기면 안 된다.

후속 버전도 v1에 소급하지 않는다.

- FlashAttention-2(2023): non-matmul FLOPs 감소, sequence dimension 병렬화, warp 간 작업 분배 개선
- FlashAttention-3(2024): Hopper의 TMA·WGMMA, 비동기 실행과 warp specialization, FP8 경로

현재 공식 저장소는 v2 중심 구현과 v3 이후 beta를 함께 담는 계속 변하는 코드베이스다. 현재 README의 요구사항과 속도를 2022년 v1 사양으로 인용하지 않는다.

## 5. 원문의 논리 구조

원문은 다음 흐름으로 전개된다.

1. 긴 시퀀스에서 표준 attention의 \(N^2\) 중간 행렬과 메모리 이동을 문제로 제시한다.
2. 타일링·온라인 softmax·재계산으로 전체 attention matrix를 저장하지 않는 해법을 설명한다.
3. 사용자 정의 CUDA kernel과 자동 미분 호환성을 통해 기존 Transformer에 적용할 수 있다고 주장한다.
4. 2~4배 속도와 5~10배 메모리 절감, 16K 학습을 대표 성과로 제시한다.
5. 이차 FLOPs·CUDA 이식성·구현 복잡성을 한계로 남긴다.
6. 긴 문맥 모델과 후속 효율화 연구에 미친 영향을 폭넓게 평가한다.

이 흐름을 읽을 때는 operator, algorithm, kernel, model experiment를 분리해야 한다. FlashAttention은 dense attention operator를 바꾸지 않고 algorithm과 kernel을 바꾼다. 긴 문맥에서 perplexity나 분류 정확도가 개선된 결과는 kernel 자체가 품질을 높인 것이 아니라, 절약한 자원으로 더 긴 문맥의 같은 모델을 학습한 효과다.

## 6. 왜 중요한가

FlashAttention은 현대 딥러닝의 병목을 FLOPs 하나로 설명할 수 없음을 명확히 보여 주었다.

- **아키텍처를 바꾸지 않았다.** 같은 dense softmax attention을 계산하므로 근사·희소 attention과 비교 축이 다르다.
- **재계산을 비용이 아니라 교환 수단으로 썼다.** FLOPs를 더 쓰고 HBM 접근을 줄이는 편이 GPU에서는 더 빠를 수 있다.
- **메모리 계층을 알고리즘 분석에 넣었다.** SRAM 크기와 HBM 접근 횟수를 명시해 하드웨어 조건을 복잡도 논의에 포함했다.
- **forward와 backward를 함께 설계했다.** inference용 메모리 절약만이 아니라 Transformer 학습 전체의 attention 병목을 겨냥했다.
- **실제 모델에서 검증했다.** GPT-2, BERT, 장문 문서 분류, LRA에서 kernel microbenchmark와 end-to-end 효과를 분리해 보고했다.

이 사례는 “더 좋은 모델”과 “같은 모델을 더 잘 실행하는 알고리즘”을 구분하게 한다. 학습 가능한 문맥 길이를 늘리는 일이 모델 능력의 가능 조건을 만들 수는 있지만, 긴 문맥 정보를 실제로 이해하고 추론하는 능력까지 자동으로 보장하지는 않는다.

## 7. 현대 LLM과의 연결

- **긴 문맥 비용의 분해**: dense attention의 FLOPs, attention 중간 상태 메모리, HBM 대역폭, autoregressive KV cache는 서로 다른 축이다. FlashAttention은 주로 첫 세 축 가운데 중간 저장과 HBM 이동을 줄인다.
- **훈련과 추론의 차이**: 학습에서는 backward 재계산과 활성 메모리가 중요하다. 한 token씩 생성하는 추론에서는 KV cache 크기와 작은 query 길이, decoding kernel 특성이 별도 병목이 된다.
- **정확한 operator와 근사 operator의 선택**: FlashAttention은 같은 attention 정의를 유지한다. sliding window, block-sparse, low-rank 방식은 연산 그래프와 정보 접근 범위를 바꾸므로 품질·속도 절충이 다르다.
- **하드웨어–소프트웨어 공동 설계**: 실제 처리량은 논문 속 점근식뿐 아니라 dtype, head dimension, sequence length, GPU 세대, kernel fusion과 compiler 지원에 좌우된다.
- **문맥 창과 문맥 활용 능력**: 16K나 64K를 실행할 수 있다는 사실과, 모델이 그 거리의 증거를 안정적으로 검색·조합한다는 사실은 별도의 평가 문제다.

FlashAttention을 “attention의 \(N^2\) 문제를 해결했다”고만 부르면 계산량이 그대로라는 핵심이 사라진다. 더 정확한 설명은 **\(N^2\) dense attention의 중간 저장과 HBM 왕복을 줄인 I/O 인지형 정확 계산 알고리즘**이다.

## 8. 한계와 비판적 관점

### 8.1 알고리즘과 구현의 한계

- 산술 한계: dense attention의 \(O(N^2d)\) 계산량은 유지되므로 극장문에서는 FLOPs가 여전히 병목이다.
- 메모리 한계: attention 중간 상태의 추가 저장은 선형이지만 모델의 다른 activation, parameter, optimizer state, inference KV cache는 남는다.
- 하드웨어 한계: 2022년 kernel은 당시 NVIDIA Turing·Ampere와 제한된 head dimension을 중심으로 구현됐다. 다른 GPU·가속기로 옮기려면 새 최적화가 필요하다.
- 유지보수 한계: 새로운 mask, bias, attention 변형마다 kernel을 새로 작성하거나 수정해야 할 수 있다.
- 수치 한계: 수학적으로 같은 operator를 계산하지만 부동소수점 연산 순서가 달라 reference와 작은 오차가 생길 수 있다.
- 능력 한계: 더 긴 sequence를 계산할 수 있다는 사실만으로 장거리 추론·검색·기억 품질이 보장되지 않는다.

### 8.2 흔한 오해 바로잡기

| 오해 | 공식 자료에 가까운 설명 |
|---|---|
| FlashAttention이 attention 계산량을 선형으로 만들었다. | 추가 중간 저장은 \(O(N)\)이지만 dense FLOPs는 \(O(N^2d)\)다. |
| exact는 표준 구현과 bitwise 동일하다는 뜻이다. | 근사하지 않고 같은 수학적 softmax attention을 계산한다는 뜻이며, 부동소수점 오차 범위는 구현별로 다를 수 있다. |
| 타일링 하나가 전부 새로운 발명이었다. | 타일링과 재계산은 알려진 기법이었고, 기여는 I/O schedule·온라인 softmax·backward·fusion·분석·실증의 결합이다. |
| 2~4배는 모든 Transformer의 전체 학습 속도다. | 주로 attention kernel 수치다. 전체 BERT 학습은 약 15%, GPT-2는 기준 구현에 따라 약 1.7~3배였다. |
| 메모리는 항상 5~10배 줄어든다. | 길이·dtype·baseline에 따라 달라지며 논문 측정은 약 5.7~20.4배 범위를 보였다. |
| 64K 모델 결과는 exact FlashAttention이다. | 논문의 64K Path-256 모델은 approximate block-sparse 확장이고 exact Path-X 모델 결과는 16K다. |
| gradient checkpointing을 범용 기능으로 통합했다. | attention backward에서 필요한 score·probability block만 선택적으로 재계산하는 명시적 알고리즘이다. |
| 긴 문맥을 실행하면 책 전체를 이해한다. | 계산 가능한 길이와 정보를 실제로 찾고 조합하는 능력은 별도 문제다. |
| FlashAttention-2·3의 속도도 2022년 성과다. | v2는 2023년, v3는 2024년의 별도 알고리즘·하드웨어 최적화다. |

### 8.3 오늘날 관점에서 다시 볼 점

원문은 FlashAttention이 책, 장시간 대화, RAG와 여러 후속 시스템을 가능하게 했다고 폭넓게 서술한다. 2022년 논문이 직접 평가한 범위는 GPT-2 4K, MIMIC 16K, ECtHR 8K·16K, LRA Path-X 16K와 block-sparse Path-256 64K다. 구체적인 후속 채택과 산업 영향에는 별도 근거가 필요하다.

또한 현재 GitHub 저장소의 v2·v3 구현, 새 GPU 지원과 adoption 목록은 원 논문 이후의 상태다. 역사적 v1을 설명할 때는 NeurIPS 2022 논문을 기준으로 삼고, 현재 사용법을 설명할 때는 날짜나 commit을 고정한 저장소 자료를 따로 인용하는 편이 안전하다.

## 9. 용어 정리

| 용어 | 설명 |
|---|---|
| I/O 인지형 | 산술 연산뿐 아니라 메모리 계층 사이의 데이터 읽기·쓰기를 알고리즘 설계에 포함하는 관점 |
| HBM | GPU의 용량은 크지만 온칩 SRAM보다 느린 고대역폭 메모리 |
| SRAM | GPU chip 안의 작고 빠른 메모리. FlashAttention tile의 임시 계산에 사용 |
| 타일링 | 큰 행렬을 빠른 메모리에 들어가는 작은 block으로 나눠 계산하는 기법 |
| 온라인 softmax | 행 전체를 저장하지 않고 block별 최댓값과 지수합을 재스케일해 전체 softmax를 누적하는 기법 |
| exact attention | 희소화나 저랭크 근사 없이 원래 dense softmax attention과 같은 수학적 함수를 계산하는 방식 |
| kernel fusion | matmul·mask·softmax·dropout·value 가중합 같은 단계를 한 GPU kernel 안에서 이어 실행하는 방식 |
| 재계산 | forward 중간값 저장을 줄이기 위해 backward에서 필요한 값을 다시 계산하는 교환 전략 |
| HBM access complexity | GPU의 느린 메모리에서 데이터를 읽고 쓰는 횟수를 세는 복잡도 |
| arithmetic complexity | 곱셈·덧셈 같은 산술 연산 수를 세는 복잡도 |
| block-sparse attention | 정해진 block 일부만 계산해 비용을 줄이지만 dense attention과 다른 근사 pattern을 사용하는 방식 |
| head dimension | 한 attention head에서 query·key·value vector가 갖는 차원 \(d\) |

## 10. 함께 보면 좋은 항목

- [[055_The Transformer Attention Is All You Need.ko|Transformer: Attention Is All You Need]]: FlashAttention이 그대로 계산하는 scaled dot-product attention의 수학적 정의
- [[064_Transformer-XL Extending Transformers to Long Sequences.ko|Transformer-XL과 긴 시퀀스]]: segment 재사용이라는 아키텍처 변화와 한 dense window의 실행 최적화를 비교하는 자료
- [[078_Chinchilla Scaling Laws Compute-Optimal Training and Resource Allocation for Large Language Models.ko|Chinchilla 계산 최적 스케일링]]: FLOPs 예산과 실제 하드웨어 효율이 서로 다른 분석 축임을 비교하는 자료
- [[083_PaLM Pathways Language Model - Large-Scale Training, Reasoning, and Multilingual Capabilities.ko|PaLM과 대규모 분산 학습]]: 모델 규모뿐 아니라 accelerator 활용률과 통신·메모리 병목이 전체 학습 시간을 좌우하는 사례

## 11. 읽고 생각해볼 질문

1. FlashAttention은 왜 FLOPs를 더 쓰면서도 표준 attention보다 빨라질 수 있는가?
2. 온라인 softmax에서 이전 block의 출력과 정규화 합을 새 최댓값 기준으로 다시 스케일해야 하는 이유는 무엇인가?
3. “추가 메모리 \(O(N)\)”과 “계산량 \(O(N^2d)\)”은 동시에 어떻게 참일 수 있는가?
4. attention kernel의 2~4배 속도와 전체 모델 학습의 15% 개선을 같은 수치로 일반화하면 무엇을 놓치는가?
5. exact FlashAttention과 block-sparse FlashAttention은 모델이 접근하는 정보 범위에서 어떻게 다른가?
6. 긴 sequence를 GPU에 넣을 수 있다는 사실과 모델이 긴 문맥을 효과적으로 활용한다는 사실을 어떤 평가로 분리할 수 있는가?

## 12. 짧은 결론

FlashAttention의 핵심은 attention 식을 새로 만든 데 있지 않다. 같은 dense softmax attention을 HBM에 큰 중간 행렬로 저장하지 않도록 타일링하고, 온라인 softmax와 backward 재계산으로 I/O를 줄였다는 데 있다. 이 때문에 산술량이 늘어도 실제 시간은 줄고, attention 중간 상태의 메모리는 선형이 될 수 있었다. 동시에 계산량은 여전히 이차이고, 수치 결과는 bitwise 동일하지 않을 수 있으며, custom CUDA kernel의 이식성과 유지보수 비용도 남는다. 따라서 FlashAttention의 가장 오래 남는 교훈은 “효율은 FLOPs 하나가 아니라 연산량·저장 공간·메모리 이동·하드웨어 실행의 결합”이라는 점이다.

공식 근거는 Tri Dao 외, [*FlashAttention: Fast and Memory-Efficient Exact Attention with IO-Awareness*](https://arxiv.org/abs/2205.14135), [NeurIPS 2022 공식 논문 페이지](https://proceedings.neurips.cc/paper_files/paper/2022/hash/67d57c32e20fd0a7a302cb81d36e40d5-Abstract.html), [공식 FlashAttention 저장소](https://github.com/Dao-AILab/flash-attention)다.
