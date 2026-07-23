---
schema_version: 2
id: concept.transformer-xl
page_type: concept
title: Transformer-XL
aliases:
  - Transformer XL
  - 트랜스포머-XL
  - segment-level recurrent Transformer
tags:
  - type/concept
  - domain/ai
  - domain/nlp
  - domain/machine-learning
created: '2026-07-21'
updated: '2026-07-23'
lifecycle: active
verification: verified
artifacts:
  - 'raw/064_Transformer-XL Extending Transformers to Long Sequences.ko.md'
  - 'raw/064_Transformer-XL Extending Transformers to Long Sequences.commentary.ko.md'
  - 'raw/088_FlashAttention IO-Aware Exact Attention for Long-Context Language Models.ko.md'
  - 'raw/088_FlashAttention IO-Aware Exact Attention for Long-Context Language Models.commentary.ko.md'
  - 'raw/098_Long Context Models Processing Million-Token Sequences in Language AI.ko.md'
  - 'raw/098_Long Context Models Processing Million-Token Sequences in Language AI.commentary.ko.md'
evidence:
  - source_id: dai-et-al-2019-transformer-xl
    locator: 'pp. 2980–2986, 특히 §§3.2–3.3와 Figures 1–2의 state reuse·stop-gradient·layer shift·relative positional attention, §§4.2–4.5와 Tables 6–9의 ablation·RECL·평가 속도 조건'
    relation: supports
  - source_id: dao-et-al-2022-flashattention
    locator: '§§2.2–3.2와 Algorithms 0–1의 동일 dense attention을 위한 HBM–SRAM 타일링·온라인 softmax·추가 메모리와 이차 산술량의 구분'
    relation: contextualizes
  - source_id: liu-et-al-2024-lwm
    locator: 'arXiv v1 §§2–3.2와 Figure 3·Table 1의 RingAttention+FlashAttention·RoPE scaling·Llama 2 7B(4K) 초기화 뒤 32K→128K→256K→512K→1M의 5-stage 확장; Transformer-XL recurrence와 다른 1M 경로'
    relation: contextualizes
related:
  - source.064
  - source.088
  - source.098
  - concept.transformer
  - concept.flashattention
  - concept.긴-문맥-언어-모델
  - concept.자기회귀-생성
  - concept.xlnet-roberta-albert
  - analysis.훈련-병렬성과-생성-순차성은-다른-축이다
---
# Transformer-XL

> [!note] 학습 안내
> **난이도:** 중급<br>
> **선수 지식:** [[Transformer]], [[자기회귀 생성]]<br>
> **읽고 나면:** Transformer-XL의 세그먼트 수준 재귀와 상대 위치 attention을 설명하고, memory 범위·gradient 경계·dense 계산 비용을 구분할 수 있다.

## 1단계 — 먼저 잡을 핵심

Transformer-XL은 고정 길이 세그먼트로 언어 모델을 훈련하되 이전 세그먼트의 은닉 상태를 다음 세그먼트가 다시 읽게 만든 causal Transformer다. 이름의 `XL`은 extra long을 뜻한다. 핵심은 token을 한 번에 모두 넣는 것이 아니라 **과거 표현을 유한한 memory로 재사용**하는 데 있다.

이 설계는 세그먼트 경계에서 문맥이 끊기는 문제를 줄이고 평가 때 과거 구간을 반복 계산하지 않게 한다. 동시에 memory 길이, stop-gradient, 상대 위치 attention과 dense 계산이라는 조건을 가진다. 따라서 `무제한 context`나 `선형 attention`과 같은 뜻은 아니다.

### 먼저 구분할 세 가지

- **token과 은닉 상태(hidden state)는 다르다.** token은 입력 기호이고, 은닉 상태는 그 token과 앞 문맥을 여러 층이 계산해 만든 실수 벡터다. Transformer-XL이 다음 segment로 넘기는 것은 원래 token이나 이미 완성된 key·value가 아니라, 이전 segment에서 만든 각 층의 은닉 상태 일부다.
- **memory와 현대 추론의 KV cache도 다르다.** 둘 다 과거 계산을 다시 쓰지만, 이 논문의 memory는 다음 segment가 같은 층의 key·value를 새로 만들기 위한 `n-1`층 상태다. 이 문서는 2019년 논문의 학습·평가 구조를 설명하며, 후대 serving 구현의 모든 cache 설계를 뜻하지 않는다.
- **문맥이 멀리 전해지는 것과 gradient가 멀리 흐르는 것은 다르다.** memory 값은 순전파에서 다음 segment로 전달된다. 하지만 stop-gradient 때문에 그 값을 만든 과거 계산으로는 현재 loss의 gradient가 돌아가지 않는다.

### 이 문서가 다루는 범위

여기서 `긴 문맥`은 세 가지 다른 길이를 함께 뜻하지 않는다. 현재 attention이 직접 읽는 memory 길이, 여러 층·segment를 거쳐 정보가 간접 전달될 수 있는 경로 길이, 실제 과제에서 모델이 유용하게 활용한 길이는 서로 다르다. 뒤의 수식과 실험 수치는 이 셋을 구분하는 데 사용한다.

## 2단계 — 작동 원리

### 가장 작은 설명용 예: 네 위치를 한 번에 읽기

다음은 원 논문의 성능 수치가 아니라, 순서만 손으로 따라가기 위한 **설명용 예**다. 한 층의 hidden dimension을 $d=2$, 현재 segment 길이를 $L=2$, 과거 memory 길이를 $M=2$로 둔다. 이전 segment가 남긴 두 상태와 현재 segment의 두 상태를 행으로 적으면 다음과 같다.

$$
m_\tau^{n-1}=
\begin{bmatrix}
0.4 & 0.1\\
0.1 & 0.6
\end{bmatrix}
\in\mathbb{R}^{2\times2},
\qquad
h_\tau^{n-1}=
\begin{bmatrix}
0.7 & 0.2\\
0.2 & 0.8
\end{bmatrix}
\in\mathbb{R}^{2\times2}
$$

각 행은 한 위치의 길이 2 벡터다. $\tau$는 지금 처리하는 segment, $n-1$은 아직 attention을 통과하기 전의 바로 아래 층을 뜻한다. 첫 행렬의 값은 과거에서 왔고 둘째 행렬의 값은 새 segment에서 왔다.

#### 1. memory를 연결한다

먼저 과거 memory에는 stop-gradient를 붙이고, 길이 축으로 이어 붙인다.

$$
\widetilde h_\tau^{n-1}
=\left[\operatorname{SG}(m_\tau^{n-1})\,\Vert\,h_\tau^{n-1}\right]
=
\begin{bmatrix}
0.4 & 0.1\\
0.1 & 0.6\\
0.7 & 0.2\\
0.2 & 0.8
\end{bmatrix}
\in\mathbb{R}^{4\times2}
$$

$\Vert$는 벡터 성분을 더한다는 뜻이 아니라 **행을 위아래로 이어 길이를 $M+L=4$로 늘리는 연결**이다. $\operatorname{SG}$는 순전파에서는 입력값을 그대로 내보내지만, 역전파에서는 그 입력에 대한 미분을 0으로 만드는 자동미분 연산이다.

$$
\operatorname{SG}(z)=z\quad\text{(순전파)},
\qquad
\frac{\partial\operatorname{SG}(z)}{\partial z}=0
\quad\text{(역전파)}
$$

따라서 위 숫자는 사라지지 않는다. 다만 지금 segment의 loss가 과거 segment의 파라미터 갱신까지 직접 바꾸지는 못한다.

#### 2. query·key·value를 만든다

계산을 단순화하려고 이 예에서만 $W_Q=W_K=W_V=I_2$라고 하자. $I_2$는 $(2\times2)$ 항등행렬이므로 벡터를 바꾸지 않는다. 실제 모델의 $W_Q,W_K,W_V$는 학습되는 행렬이며 일반적으로 항등행렬이 아니다. 여기서는 현재 두 행에서 query를, 네 행 모두에서 key·value를 만든다.

$$
Q=h_\tau^{n-1}I_2\in\mathbb{R}^{2\times2},
\qquad
K=V=\widetilde h_\tau^{n-1}I_2\in\mathbb{R}^{4\times2}
$$

#### 3. 점수를 확률과 출력으로 바꾼다

현재 segment의 두 번째 위치를 읽는 query $q=(0.2,0.8)$를 보자. 이 위치는 두 과거 위치와 현재의 앞 위치, 그리고 자기 위치를 읽을 수 있다고 가정한다. 네 key와의 내적 점수는 $s_j=q^\mathsf{T}k_j$다. 내적은 같은 feature끼리 곱해 더하므로, 이 query와 어느 key가 함께 클 때 점수가 커지는 간단한 관련도 점수다.

$$
s=(0.16,\;0.50,\;0.30,\;0.68)
$$

이 점수는 아직 확률이 아니다. 후보별 기여를 양수이고 합이 1인 가중치로 바꾸기 위해 [[소프트맥스]]를 적용한다. 분모는 이 query가 읽을 수 있는 모든 위치의 지수값을 더한다.

$$
\alpha_j=
\frac{\exp(s_j)}{\sum_{r=1}^{4}\exp(s_r)},
\qquad
\sum_{r=1}^{4}\exp(s_r)
\approx 6.145
$$

| 읽는 위치 $j$ | score $s_j$ | $\exp(s_j)$ | weight $\alpha_j$ | $\alpha_jv_j$ |
| --- | ---: | ---: | ---: | --- |
| 과거 1 | 0.16 | 1.174 | 0.191 | $(0.076,\;0.019)$ |
| 과거 2 | 0.50 | 1.649 | 0.268 | $(0.027,\;0.161)$ |
| 현재 1 | 0.30 | 1.350 | 0.220 | $(0.154,\;0.044)$ |
| 현재 2 | 0.68 | 1.974 | 0.321 | $(0.064,\;0.257)$ |

네 value 기여를 성분별로 더하면 attention 출력은 $a\approx(0.321,\;0.481)$이다. 즉 이 작은 예에서 현재 두 번째 위치의 새 표현은 한 과거 위치를 복사하는 것이 아니라, 네 위치의 정보를 서로 다른 비율로 섞은 결과다. 실제 Transformer-XL은 여기에 학습된 투영, 여러 head, 상대 위치 항, residual connection과 feed-forward network를 더한다.

### 입력–memory–출력

현재 세그먼트 길이를 $L$, 보존한 과거 상태 길이를 $M$이라고 하자. 각 층에서 query는 현재 $L$개 위치에서만 만들고, key·value는 과거 memory와 현재 상태를 이어 붙인 $M+L$개 위치에서 만든다. causal mask는 현재의 미래 token을 가리며, 과거 memory는 모두 읽을 수 있게 한다.

과거 상태에는 stop-gradient를 적용한다. 현재 세그먼트는 과거 표현을 순전파 문맥으로 읽지만 현재 loss의 gradient는 그 상태를 만든 이전 세그먼트 계산으로 돌아가지 않는다. 현재 상태는 다시 다음 세그먼트의 memory가 된다.

행을 위치, 열을 feature로 두는 표기로 계산 순서를 쓰면 다음과 같다. 이 문서의 $W_Q,W_{K,E},W_V$는 입력 차원 $d$를 head 차원 $d_k,d_v$로 바꾸는 학습 행렬이다. 원 논문은 같은 연산을 $h(W_q)^\mathsf{T}$처럼 전치 행렬을 오른쪽에 둬 적는다. 표기만 다르고, 아래처럼 row sequence에 오른쪽 행렬을 곱해 shape를 드러낸 표현과 같은 계산이다.

$$
\begin{aligned}
\widetilde H&=\left[\operatorname{SG}(H_{\mathrm{mem}})\,\Vert\,H\right]
&&\in\mathbb{R}^{(M+L)\times d},\\
Q&=HW_Q
&&\in\mathbb{R}^{L\times d_k},\\
K&=\widetilde H W_{K,E}
&&\in\mathbb{R}^{(M+L)\times d_k},\\
V&=\widetilde H W_V
&&\in\mathbb{R}^{(M+L)\times d_v}.
\end{aligned}
$$

| 기호 | 현재 의미 | 종류·shape | 어디서 오는가 |
| --- | --- | --- | --- |
| $H$ | 현재 segment의 아래 층 은닉 상태 | $L\times d$ 행렬 | 현재 입력을 아래 층이 계산 |
| $H_{\mathrm{mem}}$ | 잘라 보존한 과거 아래 층 상태 | $M\times d$ 행렬 | 이전 segment의 순전파 결과 |
| $\widetilde H$ | memory와 현재 상태를 연결한 확장 문맥 | $(M+L)\times d$ 행렬 | $H_{\mathrm{mem}}$과 $H$의 행 연결 |
| $W_Q,W_{K,E},W_V$ | query·내용 key·value 투영 | 각각 $d\times d_k$, $d\times d_k$, $d\times d_v$ | 학습되는 매개변수 |
| $Q,K,V$ | 질문·찾을 표지·가져올 내용 | 위 식의 세 행렬 | 투영 결과 |

여기서 행렬곱은 위치마다 같은 선형 변환을 동시에 적용한다. $Q$는 현재 $L$행만 가져야 새 token을 예측하는 위치만 질문을 만들 수 있다. 반대로 $K,V$는 $M+L$행이어야 과거 memory가 비교 대상과 가져올 정보에 모두 들어간다.

### 상대 위치 attention

세그먼트마다 절대 위치 번호를 다시 시작하면 과거와 현재의 같은 번호가 충돌한다. Transformer-XL은 query와 key의 상대 거리 $i-j$를 attention 점수에 넣는다. 고정 사인파 행렬 $R$과 학습 가능한 내용·위치 투영, 전역 편향 $u,v$를 조합해 다음 네 신호를 표현한다.

- 내용 query와 내용 key의 일치,
- 내용 query와 상대 위치의 일치,
- 전역 내용 편향,
- 전역 위치 편향.

상대 위치 표현만으로 recurrence가 생기는 것은 아니다. 상태 재사용은 과거 정보를 제공하고, 상대 위치 attention은 그 정보가 현재에서 얼마나 떨어졌는지 일관되게 알려 준다.

현재 segment의 query 위치를 $i\in\{1,\ldots,L\}$라 하고, memory 위치를 음수·0, 현재 위치를 양수로 다시 번호 매긴다고 하자. 그러면 key 위치 $j$는 $-M+1,\ldots,0,1,\ldots,L$ 범위에 있고 거리 $i-j$가 과거와 현재를 한 좌표계에서 비교하게 한다. causal mask는 $j>i$인 미래 현재 위치의 점수를 $-\infty$로 바꾼다. softmax에서 $\exp(-\infty)=0$이므로 가려진 위치는 가중치도 출력 기여도 받지 않는다.

## 3단계 — 기술과 근거

### 원 논문의 상태 재사용 수식

논문은 single-head 계산을 다음 순서로 적는다. 아래 식은 논문의 첨자 $\tau,n$을 유지한 표현이다. $m_\tau^{n-1}$은 최대 $M$행을 가진 memory이고, $h_\tau^{n-1}$은 길이 $L$의 현재 아래 층 상태다. 두 행렬은 열 수 $d$가 같아야 행으로 연결할 수 있다.

$$
\begin{aligned}
\widetilde h_\tau^{n-1}
&=\left[\operatorname{SG}(m_\tau^{n-1})\,\Vert\,h_\tau^{n-1}\right],\\
q_\tau^n
&=h_\tau^{n-1}(W_q^n)^\mathsf{T},\\
k_\tau^n
&=\widetilde h_\tau^{n-1}(W_{k,E}^n)^\mathsf{T},\\
v_\tau^n
&=\widetilde h_\tau^{n-1}(W_v^n)^\mathsf{T}.
\end{aligned}
$$

첫 줄은 **문맥을 준비**하고, 둘째 줄은 현재 위치만의 질문을, 셋째·넷째 줄은 확장 문맥의 비교 표지와 가져올 내용을 만든다. $\operatorname{SG}$를 생략하면 이론상 더 먼 과거까지 gradient가 이어질 수 있지만, 이전 segment의 계산 graph와 activation을 계속 보존해야 한다. 논문은 그 비용을 피하고 유한한 segment 단위 학습을 유지하기 위해 stop-gradient를 선택했다. 이것은 수학적으로 유일한 귀결이 아니라 memory·계산량과 장거리 credit assignment 사이의 공학적 trade-off다.

### 상대 위치 점수의 네 항

위에서 만든 query와 key에, 논문은 내용 key용 $W_{k,E}$와 위치 key용 $W_{k,R}$를 분리해 다음 점수 $A^n_{\tau,i,j}$를 만든다. $A$는 확률이 아닌 softmax **이전**의 실수 점수 행렬이며 shape는 $L\times(M+L)$다.

$$
\begin{aligned}
A^n_{\tau,i,j}
={}&\underbrace{(q^n_{\tau,i})^\mathsf{T}k^n_{\tau,j}}_{\text{(a) 내용↔내용}}\\
&+\underbrace{(q^n_{\tau,i})^\mathsf{T}W_{k,R}^nR_{i-j}}_{\text{(b) 내용 의존 위치}}\\
&+\underbrace{u^\mathsf{T}k^n_{\tau,j}}_{\text{(c) 전역 내용 편향}}\\
&+\underbrace{v^\mathsf{T}W_{k,R}^nR_{i-j}}_{\text{(d) 전역 위치 편향}}.
\end{aligned}
$$

| 항 | 계산하는 질문 | 왜 더하는가 |
| --- | --- | --- |
| (a) | “지금 query의 내용과 이 key의 내용이 맞는가?” | token·문맥 feature의 내용 유사성을 반영한다. |
| (b) | “지금 찾는 내용은 이 거리에서 어울리는가?” | 같은 거리라도 query 내용에 따라 선호가 달라지게 한다. |
| (c) | “어떤 key 내용은 query와 무관하게 기본적으로 더 눈에 띄는가?” | 모든 query 위치에 공통인 내용 편향을 둔다. |
| (d) | “어떤 상대 거리는 내용과 무관하게 기본적으로 더 선호되는가?” | 가까운 곳이나 특정 거리 같은 전역 위치 선호를 둔다. |

여기서 $q,k,u,v\in\mathbb{R}^{d_k}$는 head 차원의 열벡터로 읽을 수 있고, $R_{i-j}\in\mathbb{R}^{d}$는 거리 $i-j$의 고정 사인파 벡터다. $W_{k,R}\in\mathbb{R}^{d_k\times d}$가 위치 벡터를 key 공간으로 옮기므로 모든 항은 스칼라가 된다. 내적과 더하기를 쓰는 이유는 네 신호가 모두 같은 query–key 쌍의 **한 점수**에 기여하게 하기 위해서다. 더한 뒤에야 softmax가 후보들 사이의 상대 비율로 바꿀 수 있다.

### 네 항을 숫자로 읽는 설명용 예

실제 사인파 표 전체 대신, 이 예에서는 $d_k=d=2$, $W_{k,R}=I_2$, $q=(1,0)$, $u=(0.1,0)$, $v=(0,0.2)$라고 놓는다. 두 후보의 내용 key와 거리 벡터도 설명을 위해 작게 정한다. 이는 논문 실험값이나 특정 token의 실제 embedding이 아니다.

| 후보 | $k_j$ | $R_{i-j}$ | (a) $q^\mathsf{T}k_j$ | (b) $q^\mathsf{T}R_{i-j}$ | (c) $u^\mathsf{T}k_j$ | (d) $v^\mathsf{T}R_{i-j}$ | 합계 $A_{i,j}$ |
| --- | --- | --- | ---: | ---: | ---: | ---: | ---: |
| A | $(0.7,0.1)$ | $(0,1)$ | 0.70 | 0.00 | 0.07 | 0.20 | 0.97 |
| B | $(0.3,0.6)$ | $(1,0)$ | 0.30 | 1.00 | 0.03 | 0.00 | 1.33 |

내용만 보면 A의 0.70이 B의 0.30보다 크다. 그러나 이 예의 query는 B의 거리 벡터와 더 잘 맞아 (b)에서 1.00을 얻고, 최종 점수는 B가 더 커진다. 두 후보만 허용된다면 softmax 가중치는 $\operatorname{softmax}(0.97,1.33)\approx(0.411,0.589)$다. 이 계산은 상대 위치가 “내용을 무시하는 거리 벌점”이 아니라 내용 점수와 합쳐져 후보 순서를 바꿀 수 있는 신호임을 보여 준다.

네 항 형태는 상대 거리만 써야 한다는 수학적 필연이 아니다. 논문이 absolute position의 네 항을 재매개변수화해 선택한 구조다. Shaw 등의 상대 위치 방식처럼 (a)·(b)만 쓰는 대안도 있으며, 후대에는 회전 위치 표현처럼 다른 방식도 쓰인다. Transformer-XL 논문에서 $R$ 자체는 학습하지 않는 고정 사인파지만, $W_{k,E},W_{k,R},u,v$는 학습되는 매개변수다.

### 세 가지 길이를 구분한다

| 길이 | 뜻 | 무엇이 정하는가 |
|---|---|---|
| $L$ | 한 번에 새로 계산하는 현재 세그먼트 | 훈련·평가 설정 |
| $M$ | 직접 key·value로 읽는 보존 memory | 미리 정한 상한과 장치 memory |
| 의존 경로 | 여러 세그먼트를 거쳐 표현이 간접 전달될 수 있는 범위 | 층 수와 recurrence의 layer shift |

논문은 층마다 이전 세그먼트의 $n-1$층 상태가 현재 세그먼트의 $n$층 계산으로 들어가므로 가능한 의존 길이가 층 수 $N$과 세그먼트 길이 $L$에 따라 $O(NL)$로 늘어난다고 설명한다. 이는 한 attention 연산이 직접 읽는 $M+L$ 위치와 같은 값이 아니다.

### 계산 비용과 속도

현재 $L$개 query가 $M+L$개 key를 보면 score 행렬의 칸 수는 $L(M+L)$개다. 각 칸의 내용 내적에는 대략 $d_k$번의 곱·합이 필요하므로 score 계산의 산술량은 head 하나에서 대략 $O(L(M+L)d_k)$다. value 가중합에도 비슷한 크기의 연산이 든다. 따라서 $M$을 두 배로 늘리면 직접 읽는 과거는 늘지만, 현재 $L$이 고정일 때 score 행렬의 열 수도 그만큼 늘어난다.

논문이 상대 위치 항의 계산을 개선했다고 한 부분은 이 모든 query–key 쌍을 없앤다는 뜻이 아니다. 순진하게는 각 쌍마다 $W_{k,R}R_{i-j}$를 새로 만들 수 있다. 논문의 relative-shift 계산은 거리별 위치 투영을 재배열해 이 중복을 피한다. 그래도 masked softmax가 읽는 $L\times(M+L)$ 점수와 dense content attention은 남는다. Transformer-XL은 긴 sliding window 전체를 매 token마다 다시 계산하던 평가 baseline에 비해 상태 재사용으로 큰 속도 이점을 냈지만, sparse attention처럼 score 쌍 자체를 구조적으로 줄이지는 않는다.

논문의 최대 1,874배는 한 GPU에서 attention 길이 3,800인 per-token 평가와 특정 vanilla Transformer 재계산 baseline 사이의 값이다. 이 수치는 훈련, batch 크기, hardware와 serving 방식이 달라져도 유지되는 상수가 아니다.

### 긴 문맥 병목을 푸는 서로 다른 층위

Transformer-XL과 [[FlashAttention]]은 모두 더 긴 문맥을 실용적으로 다루지만 바꾸는 층위가 다르다. Transformer-XL은 이전 segment의 hidden state를 stop-gradient memory로 재사용하고 상대 위치 attention을 도입한 **model architecture**다. FlashAttention은 같은 dense softmax attention을 HBM–SRAM tile schedule과 backward 재계산으로 실행하는 **algorithm·kernel**이다.

둘을 함께 사용해도 현재 $L$개 query와 $M+L$개 key 사이 score 수는 대략 $L(M+L)$로 남는다. 지원되는 구현에 FlashAttention의 원리를 적용한다면 이 dense 연산의 $L(M+L)$ 중간 행렬 저장과 HBM 이동을 줄일 수 있지만, Transformer-XL의 memory 상한·stop-gradient·세그먼트 순차 의존을 바꾸지는 않는다고 추론할 수 있다. 반대로 Transformer-XL의 상태 재사용은 같은 창 안 attention kernel의 I/O 비용을 자동으로 최적화하지 않는다. 두 기법의 결합 자체는 두 원 논문의 직접 실험 결과가 아니다.

따라서 “긴 문맥”을 architecture가 제공하는 정보 경로, attention operator의 산술량, kernel의 중간 저장·대역폭, 모델이 실제 장거리 정보를 활용하는 품질로 나누어 읽는다.

2024년 [[098_백만 토큰 문맥 모델의 명목 길이와 유효 활용 경계|백만 토큰 문맥 사례]]인 LWM은 Transformer-XL의 recurrence를 단순 연장하지 않았다. Llama 2 7B(4K)에서 초기화한 뒤 RingAttention과 [[FlashAttention]]을 결합하고 RoPE scale을 조정해 32K·128K·256K·512K·1M의 다섯 학습 단계로 길이를 확장했다. 따라서 백만 토큰 지원을 Transformer-XL 계보 하나로 환원하지 않고, recurrent memory·분산 exact attention·kernel I/O·위치 표현·장문 학습을 별도 설계 축으로 구분한다.

### 실험으로 확인된 범위

Transformer-XL은 다섯 word·character 언어 모델 자료에서 perplexity 또는 bpc를 평가했다. WikiText-103 18.3 perplexity와 enwik8 0.99 bpc가 대표 결과다. recurrence·위치 표현 ablation, RECL, 평가 속도와 정성적 장문 생성도 보고됐다.

RECL은 같은 parameter budget의 모델 집단에서 더 긴 문맥의 상대 이득을 측정한다. $r=0.1$ 조건의 두 비교 집단에서 80%와 450%라는 RNN·vanilla Transformer 대비 수치가 나왔다. 이 값은 memory 설정 $M$이나 최대 입력 token 수를 직접 나타내지 않는다.

## 검증과 한계

### 흔한 오해

- memory는 처리한 전체 token을 보존하지 않고 길이 $M$으로 잘린다.
- stop-gradient 때문에 순전파 문맥은 이어져도 세그먼트를 넘는 gradient 학습은 차단된다.
- 상대 위치 행렬 $R$은 고정 사인파다. `상대 위치의 모든 부분이 학습 임베딩이다`라는 설명은 맞지 않는다.
- 재사용은 중복 계산을 줄이지만 현재 query와 memory 사이의 dense attention은 남는다.
- 논문이 직접 검증한 과제는 언어 모델링이다. 문서 분류·QA·상호참조·코드 성능은 별도 근거가 필요하다.

### 수식의 적용 조건과 수치 경계

softmax는 점수가 아주 크거나 작을 때 $\exp(s)$가 overflow·underflow할 수 있다. 그래서 구현은 보통 허용된 점수 중 최댓값 $c=\max_r s_r$를 먼저 빼고 계산한다.

$$
\operatorname{softmax}(s)_j
=\frac{\exp(s_j-c)}{\sum_r\exp(s_r-c)}
$$

분자와 분모에 같은 양수 $\exp(-c)$를 곱한 것이라 정확한 실수 연산에서는 원래 softmax와 값이 같다. 다만 mask로 모든 후보를 가려 버리면 분모가 0이 되어 확률을 만들 수 없으므로, causal language model의 각 query에는 적어도 자기 위치 또는 과거 위치 하나가 남아야 한다. 실제 구현은 $-\infty$를 저장 가능한 큰 음수로 근사할 수 있어, mask·dtype·길이 제한도 결과의 공학적 조건이 된다.

설명용 예의 $W=I$와 임의의 작은 벡터는 계산 흐름을 보이기 위한 선택이다. 실제 학습에서는 $W_Q,W_{K,E},W_{k,R},W_V,u,v$가 데이터와 손실에 맞춰 함께 바뀌며, 수식 하나만으로 그 값이나 장문 사실 일관성이 자동으로 보장되지는 않는다.

### 설계의 trade-off와 계보 경계

memory를 늘리면 더 긴 과거를 직접 읽는 대신 계산량과 저장량이 증가한다. 캐시된 과거 상태 자체는 이후 문맥에 맞춰 다시 계산되거나 수정되지 않지만, 현재 query는 그 상태에 동적으로 가중해 읽는다. stop-gradient는 멀리 떨어진 과거 행동에 대한 credit assignment를 제한한다. 또한 정성적으로 긴 글을 생성했다는 사실은 장문 사실 일관성이나 이해 성능의 보증이 아니다.

[[XLNet·RoBERTa·ALBERT|XLNet]]은 Transformer-XL의 recurrence와 상대 위치 표현을 backbone에 사용했으므로 직접 연결된다. 반면 RoPE·Longformer·BigBird 등은 장문 문맥이나 상대 위치라는 문제를 공유해도 기법과 근거가 다르다. `후대 장문 모델이 모두 Transformer-XL에서 파생됐다`는 계보는 이 원 논문만으로 확정할 수 없다.

## 학습 확인

### 확인 질문

1. $M=2,L=2$ 예에서 $\widetilde H$의 shape가 $4\times2$가 되는 이유와, stop-gradient가 값과 gradient에 각각 하는 일을 설명해 보자.
2. 상대 위치 점수의 (a)–(d) 네 항 중, 내용이 더 잘 맞는 후보보다 다른 거리에 있는 후보를 앞서게 만들 수 있는 항은 무엇이며 왜 그런가?
3. 상태 재사용이 긴 sliding-window 재계산은 줄여도 dense attention의 $L(M+L)$ score 칸을 없애지 않는 이유는 무엇인가?

### 다음 문서

- [[064_Transformer-XL과 세그먼트 수준 재귀]] — 원 논문의 수식·ablation·RECL과 속도 수치의 조건을 확인한다.
- [[XLNet·RoBERTa·ALBERT]] — Transformer-XL backbone이 순열 언어 모델링과 결합되는 직접 후속 사용을 살핀다.

## 출처

- [[064_Transformer-XL과 세그먼트 수준 재귀]]
- Zihang Dai 외, [Transformer-XL: Attentive Language Models beyond a Fixed-Length Context](https://aclanthology.org/P19-1285/), ACL 2019, pp. 2978–2988. 특히 §§3.2–3.3, Figures 1–2, Tables 6–9.
- 프로젝트 보존 자료: `raw/064_Transformer-XL Extending Transformers to Long Sequences.ko.md`, `raw/064_Transformer-XL Extending Transformers to Long Sequences.commentary.ko.md`.
- Tri Dao 외, [FlashAttention](https://proceedings.neurips.cc/paper_files/paper/2022/hash/67d57c32e20fd0a7a302cb81d36e40d5-Abstract.html), NeurIPS 2022, §§2.2–3.2와 Algorithms 0–1.
- [[088_FlashAttention과 IO 인지형 정확 어텐션]]
- [[098_백만 토큰 문맥 모델의 명목 길이와 유효 활용 경계]]
- Hao Liu 외, [World Model on Million-Length Video And Language With RingAttention](https://arxiv.org/abs/2402.08268v1), 2024, §§2–3.2, Figure 3과 Table 1.
- 프로젝트 보존 자료: `raw/098_Long Context Models Processing Million-Token Sequences in Language AI.ko.md`, `raw/098_Long Context Models Processing Million-Token Sequences in Language AI.commentary.ko.md`.

## 관련 항목

- [[064_Transformer-XL과 세그먼트 수준 재귀]]
- [[088_FlashAttention과 IO 인지형 정확 어텐션]]
- [[098_백만 토큰 문맥 모델의 명목 길이와 유효 활용 경계]]
- [[Transformer]]
- [[FlashAttention]]
- [[긴 문맥 언어 모델]]
- [[자기회귀 생성]]
- [[XLNet·RoBERTa·ALBERT]]
- [[훈련 병렬성과 생성 순차성은 다른 축이다]]
