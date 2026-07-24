---
schema_version: 2
id: analysis.transformer-parallelism-and-sequentiality
page_type: analysis
title: Transformer는 무엇을 병렬화했고 무엇을 남겼나
aliases:
  - Transformer parallelism and sequentiality
  - Transformer와 가속기 시대
  - 훈련 병렬성과 생성 순차성의 역사
tags:
  - type/analysis
  - domain/ai
  - domain/nlp
  - domain/machine-learning
  - domain/computer-science
created: '2026-07-24'
updated: '2026-07-24'
lifecycle: active
verification: partial
artifacts:
  - 'raw/045_Sequence-to-Sequence Neural Machine Translation End-to-End Learning Revolution.ko.md'
  - 'raw/045_Sequence-to-Sequence Neural Machine Translation End-to-End Learning Revolution.commentary.ko.md'
  - 'raw/055_The Transformer Attention Is All You Need.ko.md'
  - 'raw/055_The Transformer Attention Is All You Need.commentary.ko.md'
  - 'raw/088_FlashAttention IO-Aware Exact Attention for Long-Context Language Models.ko.md'
  - 'raw/088_FlashAttention IO-Aware Exact Attention for Long-Context Language Models.commentary.ko.md'
evidence:
  - source_id: sutskever-vinyals-le-2014-seq2seq
    locator: '§§2–3와 Figure 1의 recurrent encoder–decoder, 정답 목표열을 사용한 훈련과 left-to-right beam search'
    relation: contextualizes
  - source_id: vaswani-et-al-2017-attention
    locator: '§§1·3–5와 Tables 1–3의 sequential operations, self-attention·FFN 구조, WMT 2014 품질과 8개 P100 훈련 시간'
    relation: supports
  - source_id: nickolls-et-al-2008-cuda
    locator: '§§1–4의 GPU throughput 동기와 CUDA thread·block·grid·shared-memory 실행 모델'
    relation: contextualizes
  - source_id: dao-et-al-2022-flashattention
    locator: '§§2.2–3.3와 Figure 2의 dense attention FLOPs, HBM–SRAM I/O, 재계산과 wall-clock 분리'
    relation: supplements
related:
  - source.045
  - source.055
  - source.088
  - concept.transformer
  - concept.accelerator-matrix-compute
  - concept.memory-hierarchy-data-movement
  - analysis.훈련-병렬성과-생성-순차성은-다른-축이다
---
# Transformer는 무엇을 병렬화했고 무엇을 남겼나

> [!note] 학습 안내
> **난이도:** 입문–중급<br>
> **선수 지식:** [[Transformer]], [[가속기와 행렬 계산]] — attention 식을 몰라도 위치 의존성과 실행 장부부터 읽을 수 있다.<br>
> **읽고 나면:** 2017년 Transformer가 RNN보다 어떤 훈련 의존성을 줄였는지, 왜 생성은 여전히 token별로 순차적인지, P100 GPU의 가능 조건과 memory 이동이라는 후속 병목을 직접 영향과 병행 맥락으로 구분해 설명할 수 있다.

## 1단계 — 먼저 잡을 핵심

### “Transformer는 병렬적이다”에는 단계가 빠져 있다

Transformer의 핵심 전환은 모든 계산을 한꺼번에 끝냈다는 것이 아니다. 정답 입력 sequence 전체를 이미 알고 있는 훈련에서는, RNN처럼 위치 $t$의 hidden state를 만들기 위해 $t-1$의 hidden state 계산이 끝나기를 기다리지 않고 여러 위치의 표현을 큰 행렬 연산으로 함께 계산할 수 있었다.

반면 자기회귀 생성에서는 첫 token을 실제로 뽑아야 그 값을 조건으로 두 번째 token의 분포를 계산할 수 있다. 표현을 계산하는 neural network가 행렬 병렬성을 가져도, 출력 확률의 분해

$$
p(y_{1:T}\mid x)=\prod_{t=1}^{T}p(y_t\mid y_{<t},x)
$$

가 실제 이전 출력을 요구하면 sampling 단계는 순차적이다. 훈련의 위치 병렬성, 한 step 안의 device 병렬성, 여러 요청을 묶는 batch 처리량, 한 응답의 token latency는 서로 다른 질문이다.

### 두 발전 레일이 만난 지점

| 언어 모델 레일 | 컴퓨팅 능력 레일 | 만난 결과와 남은 제약 |
| --- | --- | --- |
| RNN encoder–decoder가 sequence를 recurrent state로 압축 | GPU가 큰 tensor 연산을 높은 throughput으로 실행 | 위치별 state 의존 때문에 한 sequence 안의 훈련 경로는 길었다. |
| Attention이 source 위치를 매 output step에서 직접 참조 | Matrix library와 accelerator가 batched 곱셈을 실행 | Encoder–decoder RNN의 recurrent state 의존은 남았다. |
| Transformer가 recurrence 대신 self-attention·position-wise FFN을 사용 | 8개 P100에서 큰 projection·attention·FFN을 실행 | 훈련 위치 병렬성은 커졌지만 dense attention 중간값과 생성 순차성이 남았다. |
| FlashAttention이 같은 dense attention의 실행 순서를 재구성 | A100의 HBM–SRAM 계층과 fused CUDA kernel을 이용 | Memory traffic은 줄지만 자기회귀 확률 분해와 이차 산술량은 그대로다. |

이 표는 “GPU → Transformer → FlashAttention”이라는 단일 직선 계보가 아니다. 모델 구조, 프로그래밍 도구, 장치와 memory algorithm이 서로 다른 병목에서 맞물린 역사다.

## 2단계 — 작동 원리

### RNN의 표현 의존성

RNN은 보통

$$
h_t=f(h_{t-1},x_t)
$$

처럼 이전 hidden state를 현재 state의 입력으로 사용한다. 정답 sequence $x_{1:T}$를 모두 알고 있어도 $h_2$는 $h_1$, $h_3$는 $h_2$가 계산돼야 한다. 여러 sequence를 batch로 묶거나 한 step의 matrix 연산을 병렬화할 수는 있지만, 한 sequence의 state chain 자체는 길이 $T$인 의존 경로를 갖는다.

2014년 seq2seq도 encoder와 decoder에서 LSTM state를 순서대로 갱신했다. Attention은 source의 여러 위치를 선택적으로 참조하게 했지만 초기 attention 기반 번역 model도 recurrent decoder를 유지했다. 따라서 “attention이 등장한 순간 recurrence가 사라졌다”는 설명은 맞지 않는다.

### Transformer의 훈련 위치 병렬성

Transformer에서는 한 층의 입력 $X\in\mathbb R^{T\times d}$에서

$$
Q=XW_Q,\qquad K=XW_K,\qquad V=XW_V
$$

를 모든 위치에 대해 행렬곱으로 계산한다. Causal decoder도 정답 목표열을 한 칸 이동한 입력으로 모두 알고 있는 훈련에서는 mask를 적용해 미래 위치를 보지 않게 하면서 여러 query 위치의 손실을 한 번에 계산할 수 있다.

이 변화는 **계산 가능성**을 새로 만든 것이 아니라 **실현 성능과 확장성**을 바꿨다. 같은 sequence 관계를 더 짧은 위치 간 계산 경로와 큰 tensor 연산으로 표현해 accelerator의 병렬 실행 단위에 매핑하기 쉬워졌다. 그러나 모든 위치 쌍의 score는 $T^2$개이므로 긴 sequence에서는 산술량과 중간값이 빠르게 커진다.

### 실제 생성은 이전 표본을 기다린다

훈련 때는 정답 $y_{<t}$가 이미 있지만 생성 때는 model이 뽑은 $\hat y_t$가 다음 step의 입력이 된다.

1. Prompt의 모든 token을 처리하는 **prefill**은 여러 위치를 함께 계산할 수 있다.
2. 첫 다음-token 분포에서 $\hat y_1$을 선택한다.
3. $\hat y_1$을 KV cache에 더하고 $\hat y_2$의 분포를 계산한다.
4. 종료 조건까지 step을 반복한다.

한 decode step 안의 head·layer·matrix 연산과 여러 요청의 batch는 병렬화할 수 있다. 그러나 표준 자기회귀 분해에서 한 응답의 미래 실제 token을 미리 확정할 수는 없다. 이 구분은 [[훈련 병렬성과 생성 순차성은 다른 축이다]]가 모델 계열 전반에서 맡고, 현재 문서는 2014–2022년의 컴퓨팅 조건과 역사적 연결에 집중한다.

### 연산기가 빨라지면 memory가 새 병목으로 보인다

Projection과 FFN처럼 재사용이 높은 큰 행렬곱은 accelerator 처리량을 활용하기 쉽다. 반면 attention은 $T\times T$ score와 probability 중간값을 만들고 kernel 사이에서 HBM에 쓰고 읽을 수 있다. 연산 처리량이 커질수록 이 데이터 이동 시간이 상대적으로 두드러진다.

FlashAttention은 self-attention 식을 바꾸지 않고 tile·online softmax·재계산으로 HBM traffic을 줄였다. 이는 Transformer가 2017년에 “불완전했다”는 후대 판정이 아니라, 모델 구조가 널리 쓰이며 실제 실행에서 memory 병목이 중요해진 뒤 나온 별도의 algorithm·kernel 대응이다.

## 3단계 — 기술과 근거

### 2017년 보고를 측정 장부로 복원한다

Transformer 원 논문의 대표 훈련 수치는 다음 조건에서만 읽는다.

| 항목 | 원 논문 조건 |
| --- | --- |
| 작업 | WMT 2014 영어→독일어·영어→프랑스어 번역 훈련 |
| 규모 | encoder 6층·decoder 6층, base 또는 big, 8개 P100 GPU |
| 결과 계약 | 논문 전처리와 평가에서의 BLEU·학습 목적 |
| 시스템 경계 | 해당 구현의 전체 모델 훈련 |
| 고정 조건 | 논문이 정한 batch, optimizer, precision, hardware와 model 구성 |
| 지표 | base 12시간, big 3.5일, big의 BLEU 28.4·41.0 |

이 결과는 당시 논문이 비교한 recurrent·convolutional model보다 좋은 품질과 낮은 보고 훈련 비용을 뒷받침한다. 현대 decoder-only LLM, 다른 token 수와 GPU의 학습 시간으로 자동 환산할 수는 없다.

### Table 1의 sequential operations를 정확히 읽는다

원 논문 Table 1은 layer type별 complexity, sequential operations와 maximum path length를 비교했다. Self-attention의 sequential operations가 $O(1)$이라는 표기는 한 layer 안에서 위치를 순서대로 갱신할 필요가 없다는 뜻이다. 다음을 뜻하지 않는다.

- Layer 1의 결과 없이 Layer 2를 계산할 수 있다는 뜻
- Backward와 optimizer step이 사라진다는 뜻
- Device kernel이 실제로 한 clock에 끝난다는 뜻
- Autoregressive sampling의 모든 token을 동시에 뽑는다는 뜻

표의 점근 표기와 8개 P100 wall-clock은 서로 다른 증거다. 전자는 계산 그래프의 의존 구조, 후자는 특정 구현·장치의 측정이다.

### 능력층별로 무엇이 바뀌었나

| 능력층 | Transformer 전환 | 남은 병목 |
| --- | --- | --- |
| 계산 가능성 | RNN도 Transformer도 sequence 변환을 계산할 수 있다. | 새 계산 가능성의 발명으로 설명하지 않는다. |
| 알고리즘 복잡도 | 위치 간 path는 짧아졌지만 dense attention은 $O(T^2d)$ 항을 가진다. | 긴 sequence 산술량과 중간값 |
| 프로그래밍 가능성 | Tensor framework와 accelerator kernel로 큰 행렬 연산을 구성한다. | 지원 연산·compiler·kernel 품질 |
| 실현 성능 | 훈련 위치를 묶어 P100에서 실행했다. | Memory traffic, utilization, communication |
| 확장성 | 더 큰 batch·model·device로 나눌 여지가 커졌다. | 동기화와 model·data partition |
| 자원 효율 | 당시 번역 품질 대비 보고 훈련 비용이 낮았다. | 다른 품질·자료·hardware 비교의 환산 |
| 신뢰 가능한 결과 | BLEU와 정해진 평가로 품질을 확인했다. | 일반 언어 능력·서비스 지연 보장은 아님 |

### 인과를 네 종류로 감사한다

| 관계 | 이 장에서 허용하는 주장 | 근거 경계 |
| --- | --- | --- |
| 직접 영향 | 원 논문은 recurrence의 sequential computation 제약을 문제로 들고 self-attention을 제안했다. | 논문 §§1·4와 Table 1 |
| 가능 조건 | 8개 P100과 tensor 연산 stack이 보고된 훈련을 실제로 수행했다. | 논문 §5.2 |
| 병행 맥락 | CUDA식 GPU 프로그래밍은 큰 병렬 kernel을 일반 계산에 쓰는 역사적 기반이었다. | CUDA 논문이 Transformer 설계를 직접 지시했다는 증거는 없음 |
| 후대 유추 | FlashAttention은 Transformer attention의 memory 병목을 2022년 장치에서 재구성했다. | 2022년 결과를 2017년 설계 동기로 소급하지 않음 |

### CS_WIKI와 함께 읽기

[CS_WIKI의 「병렬 컴퓨팅은 시간을 줄이는가 문제를 키우는가」](https://yghnsim.github.io/CS_Wiki/analyses/%EB%B3%91%EB%A0%AC-%EC%BB%B4%ED%93%A8%ED%8C%85%EC%9D%80-%EC%8B%9C%EA%B0%84%EC%9D%84-%EC%A4%84%EC%9D%B4%EB%8A%94%EA%B0%80-%EB%AC%B8%EC%A0%9C%EB%A5%BC-%ED%82%A4%EC%9A%B0%EB%8A%94%EA%B0%80/)는 고정 문제의 지연과 고정 시간 안의 문제 규모를 구분한다. 이 문서는 그 구분을 Transformer의 위치 계산·model 규모·번역 품질에 적용한다.

## 검증과 한계

“Transformer가 GPU에 맞았다”는 문장은 가능 조건까지만 말한다. 원 논문은 recurrence의 순차 계산을 직접 문제로 삼았고 P100에서 실험했지만, GPU architecture가 self-attention 아이디어의 직접 원인이라고 입증하지 않았다. 반대로 model 수학만 보고 hardware와 software를 지워도 실제 12시간·3.5일이라는 결과를 설명할 수 없다.

본편은 원 Transformer와 후대 FlashAttention을 연결하지만, 다음은 다루지 않는다.

- 수천 accelerator에 model을 나누는 data·tensor·pipeline parallelism
- 낮은 정밀도와 optimizer state가 memory에 미치는 영향
- KV cache, batching과 실제 서비스의 token latency
- 데이터 규모와 compute-optimal 배분

이 문제들은 후속 본편 **규모는 언제 연구 변수가 되었나**, **연산보다 데이터 이동이 비싸질 때**, **모델 능력에서 서비스 능력으로**에서 각각 이어진다.

## 학습 확인

1. Transformer decoder 훈련에서 여러 위치를 함께 계산할 수 있지만 실제 생성에서는 다음 token을 기다려야 하는 이유를 정답 이력과 실제 출력으로 구분하라.
2. 원 논문 Table 1의 $O(1)$ sequential operations가 “한 layer가 즉시 끝난다”는 뜻이 아닌 이유는 무엇인가?
3. 새 model이 “Transformer보다 2배 병렬적”이라고 주장한다. 표현 의존성, device kernel, device 수, 처리량, 한 응답 지연 가운데 무엇을 측정했는지 여섯 항목 측정 장부로 다시 쓰라.

다음 본편 **규모는 언제 연구 변수가 되었나**에서는 위치 병렬성이 model·data·device 규모를 키우는 조건과 만나면서, FLOP budget이 연구 설계 변수로 바뀐 과정을 본다.

## 출처

- [[045_Sequence-to-Sequence 학습과 신경 기계 번역]] — recurrent encoder–decoder의 학습·생성 경로를 검증한 소스.
- [[055_Transformer와 자기어텐션 기반 시퀀스 모델링]] — 원 구조, Table 1, WMT 품질과 8개 P100 훈련 조건을 검증한 소스.
- John Nickolls 외, [Scalable Parallel Programming with CUDA](https://doi.org/10.1145/1365490.1365500), §§1–4.
- [[088_FlashAttention과 IO 인지형 정확 어텐션]] — 같은 dense attention에서 HBM I/O를 줄인 후속 실행 알고리즘.
- [CS_WIKI의 병렬 컴퓨팅 분석](https://yghnsim.github.io/CS_Wiki/analyses/%EB%B3%91%EB%A0%AC-%EC%BB%B4%ED%93%A8%ED%8C%85%EC%9D%80-%EC%8B%9C%EA%B0%84%EC%9D%84-%EC%A4%84%EC%9D%B4%EB%8A%94%EA%B0%80-%EB%AC%B8%EC%A0%9C%EB%A5%BC-%ED%82%A4%EC%9A%B0%EB%8A%94%EA%B0%80/) — 고정 문제·고정 시간 병렬성의 컴퓨터사 맥락.

## 관련 항목

- [[045_Sequence-to-Sequence 학습과 신경 기계 번역]] — recurrent encoder–decoder의 순차 의존을 확인한다.
- [[055_Transformer와 자기어텐션 기반 시퀀스 모델링]] — 원 논문의 구조·복잡도·훈련 조건을 읽는다.
- [[088_FlashAttention과 IO 인지형 정확 어텐션]] — 후속 memory-aware 실행 전환을 본다.
- [[Transformer]] — 원 구조와 attention·FFN의 계산을 배운다.
- [[가속기와 행렬 계산]] — 같은 tensor 수학이 장치에서 실행되는 층을 구분한다.
- [[메모리 계층과 데이터 이동]] — 높은 연산 처리량 뒤에 드러난 I/O 병목을 설명한다.
- [[훈련 병렬성과 생성 순차성은 다른 축이다]] — 여러 model 계열의 표현 계산과 sampling 의존성을 비교한다.
