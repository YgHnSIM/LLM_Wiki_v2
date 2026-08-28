---
schema_version: 3
id: source.064
page_type: source
title: Transformer-XL과 세그먼트 수준 재귀
aliases:
  - 064_Transformer-XL Extending Transformers to Long Sequences
  - 'Transformer-XL: Attentive Language Models beyond a Fixed-Length Context'
  - Transformer-XL 논문
tags:
  - type/source
  - domain/ai
  - domain/nlp
  - domain/machine-learning
created: '2026-07-21'
updated: '2026-07-23'
editorial_status: active
review:
  evidence_coverage: verified
  content_mode: descriptive
artifacts:
  - raw/064_Transformer-XL Extending Transformers to Long Sequences.ko.md
  - raw/064_Transformer-XL Extending Transformers to Long Sequences.commentary.ko.md
evidence:
  - source_id: dai-et-al-2019-transformer-xl
    locator: 'pp. 2978–2988, 특히 §§3.1–3.3와 Figures 1–2의 fixed-segment baseline·stop-gradient state reuse·relative positional attention, §§4.1–4.5와 Tables 1–9의 language-model results·ablation·RECL·evaluation-speed 조건'
    relation: supports
relations:
  - target: concept.xlnet-roberta-albert
    kind: related
learning:
  difficulty:
    entry: advanced
    target: advanced
  prerequisites:
    - target: concept.transformer
    - target: concept.자기회귀-생성
  assumed_knowledge: 없음
  outcomes:
    - 'Transformer-XL의 상태 재사용과 상대 위치 attention이 고정 세그먼트 경계를 넘는 방식, 그리고 그 효과를 보장하는 정확한 실험 조건을 설명할 수 있다.'
  next:
    - target: concept.transformer-xl
      reason: Transformer-XL — recurrence·상대 위치·계산 비용을 재사용 가능한 개념 지도로 정리한다.
    - target: analysis.훈련-병렬성과-생성-순차성은-다른-축이다
      reason: '훈련 병렬성과 생성 순차성은 다른 축이다 — 순전파 memory 재사용, gradient 경계와 자기회귀 생성의 순차성을 서로 다른 축에서 비교한다.'
---
# Transformer-XL과 세그먼트 수준 재귀

> [!note] 학습 안내
> **난이도:** 심화<br>
> **선수 지식:** [[concept.transformer|Transformer]], [[concept.자기회귀-생성|자기회귀 생성]]<br>
> **읽고 나면:** Transformer-XL의 상태 재사용과 상대 위치 attention이 고정 세그먼트 경계를 넘는 방식, 그리고 그 효과를 보장하는 정확한 실험 조건을 설명할 수 있다.

## 1단계 — 먼저 잡을 핵심

### 고정 세그먼트가 만든 두 문제

2019년 [[Transformer-XL]] 논문은 긴 언어 모델 입력을 서로 독립인 고정 길이 조각으로 훈련할 때 생기는 두 문제를 겨냥했다. 첫째, 이전 조각의 정보가 다음 조각으로 흐르지 않아 학습 가능한 의존 범위가 세그먼트 길이에 묶인다. 둘째, 새 조각의 첫 token은 바로 앞 문맥 없이 예측해야 한다. 저자들은 이를 **문맥 단편화**(context fragmentation)라고 불렀다.

핵심 해법은 이전 세그먼트의 은닉 상태를 다음 세그먼트의 key·value용 memory로 재사용하는 **세그먼트 수준 재귀**(segment-level recurrence)다. 재사용 상태의 시간 순서를 구분하기 위해 attention 점수에는 절대 위치 대신 상대 거리를 넣는다. 이 결합은 세그먼트를 없애는 방식이 아니라, 제한된 길이로 계산하면서 과거 표현을 다음 계산에 넘기는 방식이다.

### 이 논문을 읽기 위한 국소 기초

언어 모델은 token열 $x=(x_1,\ldots,x_T)$의 결합확률을 다음 token 조건부확률의 곱으로 쓴다.

$$
P(x)=\prod_{t=1}^{T}P(x_t\mid x_{<t})
$$

$x_{<t}$는 $t$보다 앞선 모든 token, $P(x_t\mid x_{<t})$는 그 문맥에서 다음 token $x_t$가 나올 확률이다. Transformer는 이 조건부확률을 만들기 위해 각 위치를 벡터로 바꾸고 [[어텐션 메커니즘|attention]]으로 과거 위치를 가중합한다. 하지만 실제 GPU memory 안에서 긴 문서를 한 번에 처리하기 어렵기 때문에, 당시 vanilla Transformer 언어 모델은 길이 $L$의 segment로 잘라 독립적으로 학습했다.

이때 **hidden state**는 token 그 자체가 아니라 아래 층까지의 계산이 만든 길이 $d$ 실수 벡터다. Transformer-XL은 이 벡터 일부를 다음 segment에 넘긴다. `memory`라는 이름 때문에 원문 전체나 무제한 token을 저장한다고 오해하기 쉽지만, 논문의 memory는 최대 길이 $M$으로 잘린 과거 hidden state다.

### 핵심 문장

- memory는 GPU가 허용하는 범위에서 정한 길이 $M$의 과거 은닉 상태다. 처리한 전체 기록을 무제한으로 계속 쌓는 캐시가 아니다.
- 과거 상태에는 stop-gradient가 적용된다. 정보는 순전파로 경계를 넘지만 새 세그먼트의 손실이 과거 세그먼트까지 역전파되지는 않는다.
- 원 논문의 상대 위치 행렬 $R$은 학습 임베딩이 아니라 고정 사인파 인코딩이다. 학습되는 것은 내용·위치 투영과 전역 편향 $u,v$다.
- 현재 길이 $L$의 query가 $M+L$개의 key를 보는 dense attention은 남는다. 상태 재사용은 긴 문맥의 중복 재계산을 줄이지만 attention 자체를 희소화하거나 선형화하지 않는다.

## 2단계 — 작동 원리

### 상태를 다음 세그먼트로 넘기는 흐름

길이 $L$인 현재 세그먼트를 처리할 때 각 층은 다음 순서를 따른다.

1. 직전 세그먼트에서 만든 같은 층의 입력 상태, 즉 $n-1$층 상태 일부를 길이 $M$의 memory로 보존한다.
2. 이 memory에 stop-gradient를 적용하고 현재 세그먼트의 $n-1$층 상태와 이어 붙인다.
3. query는 현재 세그먼트에서만 만들고, key와 value는 `memory + 현재 상태`에서 만든다.
4. causal mask 아래 attention과 feed-forward network를 계산해 현재 세그먼트의 새 상태와 다음 token 확률을 얻는다.
5. 현재 상태를 다음 세그먼트가 사용할 memory로 넘긴다.

이를 개략적으로 쓰면 다음과 같다. $m_{\tau}^{n-1}$은 세그먼트 $\tau$에서 보존한 memory 행렬, $h_{\tau}^{n-1}$은 현재 입력 상태 행렬, `SG`는 stop-gradient다. $M$은 memory의 **행 수 상한**, $m$은 그 memory의 **값**이므로 둘을 같은 기호처럼 읽지 않는다.

$$
\widetilde h_{\tau}^{n-1}
=\left[\operatorname{SG}\!\left(m_{\tau}^{n-1}\right)\,\Vert\,h_{\tau}^{n-1}\right]
$$

$\Vert$는 성분별 곱이나 덧셈이 아니라 **길이 축 연결**(concatenation)이다. 따라서 $m_{\tau}^{n-1}\in\mathbb{R}^{M\times d}$, $h_{\tau}^{n-1}\in\mathbb{R}^{L\times d}$이면 $\widetilde h_{\tau}^{n-1}\in\mathbb{R}^{(M+L)\times d}$가 된다. stop-gradient는 순전파 값은 유지하고 역전파 경로만 끊는다.

$$
\operatorname{SG}(z)=z\quad\text{(순전파)},
\qquad
\frac{\partial\operatorname{SG}(z)}{\partial z}=0
\quad\text{(역전파)}
$$

논문 표기를 행렬의 shape와 함께 쓰면 query는 현재 $L$행에서만, key·value는 확장 문맥 $M+L$행에서 만든다.

$$
\begin{aligned}
q_\tau^n&=h_\tau^{n-1}(W_q^n)^\mathsf{T}
&&\in\mathbb{R}^{L\times d_k},\\
k_\tau^n&=\widetilde h_\tau^{n-1}(W_{k,E}^n)^\mathsf{T}
&&\in\mathbb{R}^{(M+L)\times d_k},\\
v_\tau^n&=\widetilde h_\tau^{n-1}(W_v^n)^\mathsf{T}
&&\in\mathbb{R}^{(M+L)\times d_v}.
\end{aligned}
$$

| 기호 | 역할 | 종류·shape | 값의 출처 |
| --- | --- | --- | --- |
| $h_\tau^{n-1}$ | 현재 segment의 아래 층 상태 | $L\times d$ 행렬 | 현재 token열을 아래 층이 계산 |
| $m_\tau^{n-1}$ | 보존한 과거 아래 층 상태 | $M\times d$ 행렬 | 앞 segment의 순전파 결과 |
| $W_q^n,W_{k,E}^n,W_v^n$ | query·내용 key·value용 선형 투영 | 입력 $d$를 $d_k$ 또는 $d_v$로 바꾸는 학습 행렬 | 학습되는 매개변수 |
| $q,k,v$ | 질문·비교 표지·가져올 내용 | 위 식의 결과 행렬 | 투영 결과 |

왜 query만 현재 상태에서 만드나? 지금 segment의 각 위치가 “무엇을 더 읽어야 하는가”를 묻기 때문이다. 왜 key·value는 과거까지 포함하나? 그래야 그 질문의 후보와 가져올 정보에 과거가 실제로 들어가기 때문이다. 행렬곱은 위치마다 같은 학습된 선형 변환을 한 번에 적용해, 이 두 역할을 분리한다.

### 설명용 작은 계산

설명용으로 $M=L=d=2$이고, 과거 상태가 $[(0.4,0.1),(0.1,0.6)]$, 현재 상태가 $[(0.7,0.2),(0.2,0.8)]$라고 하자. stop-gradient는 과거 두 벡터의 숫자를 바꾸지 않으므로 연결 뒤에는 네 행이 생긴다. $W_q=W_{k,E}=W_v=I_2$로 단순화하면 두 번째 현재 query $q=(0.2,0.8)$와 네 key의 내적은 $(0.16,0.50,0.30,0.68)$이다.

이 네 값은 확률이 아니라 점수다. 허용된 위치만 남긴 뒤 softmax를 적용하면 $\exp(s_j)$를 전체 합으로 나눈 가중치가 나오고, 그 가중치로 네 value를 더한다. 이 예에서 가중치는 대략 $(0.191,0.268,0.220,0.321)$, 출력은 $(0.321,0.481)$이다. 가장 큰 점수 하나를 복사한 값이 아니라 과거와 현재 정보를 비율대로 섞은 벡터다. 이 숫자는 설명을 위한 것이며 논문의 학습 결과나 실제 parameter 값이 아니다.

따라서 세그먼트 사이 연결은 RNN의 같은 층 상태 갱신과 다르다. 한 경계를 지날 때 의존성이 한 층 아래로 이동하는 **layer shift**가 생기며, $N$층과 길이 $L$ 조건에서 가능한 의존 경로는 대략 $O(NL)$까지 늘어난다. 이는 $M$개의 token을 한 번에 직접 보는 attention 범위와 구분해야 한다.

### 상대 거리로 재사용 상태를 구분한다

각 세그먼트에 같은 절대 위치 `1…L`을 다시 붙이면 과거의 1번 위치와 현재의 1번 위치를 구분하기 어렵다. Transformer-XL은 query 위치 $i$와 key 위치 $j$의 상대 거리 $i-j$를 attention 점수에 넣어 이 충돌을 피한다.

점수는 네 의미 항으로 분해된다.

1. 현재 query와 key 내용의 일치,
2. 현재 query 내용과 상대 위치의 일치,
3. query 위치와 무관한 전역 내용 편향,
4. query 위치와 무관한 전역 위치 편향.

이때 상대 위치 행렬 $R$은 고정 사인파이고, 내용 key와 위치 key에는 서로 다른 투영을 쓴다. 상대 위치를 attention에 넣는 아이디어 자체는 앞선 연구에도 있었으며, 이 논문의 공헌은 상태 재사용과 맞물리는 네 항의 재매개변수화다.

현재 query를 $i\in\{1,\ldots,L\}$, memory를 포함한 key 위치를 $j\in\{-M+1,\ldots,0,1,\ldots,L\}$로 번호 매기면 $i-j$가 두 위치의 상대 거리다. 미래 현재 위치 $j>i$는 causal mask로 가려진다. mask된 score는 $-\infty$처럼 취급해 softmax 뒤 가중치를 0으로 만든다. 과거 memory는 $j\le0$이므로 현재 query가 모두 읽을 수 있다.

## 3단계 — 기술과 근거

### 원 논문의 상대 위치 점수식

논문은 attention 이전 점수 $A^n_{\tau,i,j}$를 다음 네 항의 합으로 쓴다. single-head 표기이며, softmax와 value 가중합은 이 점수 다음에 온다.

$$
\begin{aligned}
A^n_{\tau,i,j}
={}&\underbrace{(q^n_{\tau,i})^\mathsf{T}k^n_{\tau,j}}_{\text{(a) 내용↔내용}}\\
&+\underbrace{(q^n_{\tau,i})^\mathsf{T}W_{k,R}^nR_{i-j}}_{\text{(b) 내용 의존 위치}}\\
&+\underbrace{u^\mathsf{T}k^n_{\tau,j}}_{\text{(c) 전역 내용 편향}}\\
&+\underbrace{v^\mathsf{T}W_{k,R}^nR_{i-j}}_{\text{(d) 전역 위치 편향}}.
\end{aligned}
$$

| 항 | 각 기호의 역할 | 왜 이 항이 필요한가 |
| --- | --- | --- |
| (a) | $q_i,k_j\in\mathbb{R}^{d_k}$의 내적 | 지금 위치가 찾는 내용과 후보 위치의 내용이 맞는 정도를 준다. |
| (b) | 위치 벡터 $R_{i-j}\in\mathbb{R}^{d}$를 $W_{k,R}\in\mathbb{R}^{d_k\times d}$로 key 공간에 투영 | query 내용에 따라 선호하는 거리가 달라지게 한다. |
| (c) | 학습되는 $u\in\mathbb{R}^{d_k}$와 내용 key의 내적 | query 위치와 무관한 전역 내용 선호를 준다. |
| (d) | 학습되는 $v\in\mathbb{R}^{d_k}$와 위치 key의 내적 | query 내용과 무관한 전역 거리 선호를 준다. |

네 항은 모두 스칼라이므로 더할 수 있다. 합을 먼저 만든 뒤 masked softmax를 취하는 이유는, 한 후보의 내용·거리·전역 편향을 하나의 비교 점수로 모은 다음 후보들 사이에서 비율을 정해야 하기 때문이다. 논문 표기는 이 네 항 구성에 초점을 둔다. $R$은 고정 사인파이고 $W_{k,E},W_{k,R},u,v$는 학습된다.

간단한 설명용 수치로 $q=(1,0)$, $u=(0.1,0)$, $v=(0,0.2)$, $W_{k,R}=I_2$를 두고 후보 A의 $(k,R)$를 $((0.7,0.1),(0,1))$, 후보 B의 $(k,R)$를 $((0.3,0.6),(1,0))$로 놓자. A의 네 항 합은 $0.70+0+0.07+0.20=0.97$, B는 $0.30+1.00+0.03+0=1.33$이다. 내용 항만 보면 A가 크지만, B의 상대 거리 신호가 더해져 B가 앞선다. 두 후보만 허용하면 softmax는 약 $(0.411,0.589)$가 된다. 이는 상대 위치가 단순히 멀수록 깎는 벌점이 아니라 내용과 결합해 후보 순서를 바꿀 수 있는 신호임을 보여 준다.

이 네 항은 “상대 위치를 쓰면 반드시 이렇게 된다”는 수학적 유일해가 아니다. 절대 위치 attention의 항을 상대 거리 중심으로 재매개변수화한 논문의 설계다. Shaw 등의 방식처럼 일부 항만 쓰는 대안도 있으므로, 이 식을 모든 후대 상대 위치 방법의 정의로 일반화하지 않는다.

### memory 길이와 계산 비용

논문은 훈련에서 대체로 memory 길이 $M$을 세그먼트 길이와 같게 두고, 평가에서는 더 길게 늘렸다. WikiText-103의 대표 설정은 훈련 attention 길이 384, 평가 길이 1600이었다. 현재 attention이 직접 읽는 과거 범위는 장치 memory와 정해 둔 $M$에 제한되지만, layer shift를 거쳐 표현에 간접 전달되는 의존 경로는 이 직접 범위를 넘을 수 있다.

길이 $L$인 현재 query가 $M+L$개의 key·value를 보면 score 행렬은 $L(M+L)$칸이다. 각 칸의 내적은 head 차원 $d_k$만큼의 곱·합을 쓰므로, score의 산술량은 head 하나에서 대략 $O(L(M+L)d_k)$다. value 가중합도 같은 쌍 수를 다시 사용한다. $L(M+L)$은 score **개수**이고, $d_k$를 포함한 식은 그 score를 실제로 계산하는 산술량이라는 점을 구분해야 한다.

논문이 상대 위치 항의 계산을 개선했다고 말하는 부분은 모든 $(i,j)$ 쌍에 위치 투영을 반복하는 순진한 구현을 고친 것이다. 거리별 $W_{k,R}R_{i-j}$를 재배열해 중복을 줄여도, masked softmax가 읽는 $L\times(M+L)$ 점수와 content attention 행렬은 남는다. 전체 dense attention이 선형 시간이 됐다는 뜻은 아니다.

### 다섯 언어 모델 자료의 결과

직접 실험은 WikiText-103, enwik8, text8, One Billion Word, Penn Treebank의 word·character 수준 언어 모델링에 한정됐다. 보고된 대표 결과는 WikiText-103 18.3 perplexity, One Billion Word 21.8 perplexity, Penn Treebank 54.5 perplexity, enwik8 0.99 bpc, text8 1.08 bpc다.

perplexity는 평균적으로 다음 token 후보가 얼마나 넓게 퍼져 있는지를 나타내는 언어 모델 지표로, 같은 자료·token화·평가 조건에서는 낮을수록 좋다. bpc(bits per character)는 문자 하나를 예측하는 데 드는 평균 정보량으로, 역시 같은 설정 안에서는 낮을수록 좋다. 둘은 단위와 자료 수준이 달라 숫자를 서로 직접 비교할 수 없다.

One Billion Word는 문장이 섞여 있어 장거리 문서 의존성을 요구하지 않는다. 그 자료에서도 recurrence를 제거하면 perplexity가 25.2에서 27.1로 나빠진 ablation은 문맥 단편화 완화가 짧은 sequence에도 도움을 줄 수 있음을 보인다. 반면 이 논문은 문서 분류·상호참조 해결·질의응답·코드 생성 성능을 직접 평가하지 않았다.

### RECL과 평가 속도의 조건

상대 유효 문맥 길이(Relative Effective Context Length, RECL)는 더 긴 문맥이 짧은 문맥의 최선 모델보다 일정한 상대 이득을 내는 지점을 **같은 parameter budget의 모델 집단 안에서** 비교한 지표다. Table 8의 $r=0.1$ 조건에서 151M Transformer-XL은 900, QRNN은 500, LSTM은 400 word를 기록했다. 128M 비교 집단에서는 Transformer-XL 700, vanilla Transformer 128이었다. 이 조건에서 나온 80%와 450%가 각각 RNN과 vanilla Transformer 대비 수치다. 이는 모델의 고정 입력창이 정확히 그 비율로 커졌다는 뜻이 아니다.

최대 1,874배 속도 향상도 Table 9의 특정 평가 절차에 붙는다. 한 GPU에서 attention 길이 3,800일 때, 매 token마다 긴 sliding segment를 처음부터 다시 계산한 vanilla Transformer baseline과 상태를 재사용한 Transformer-XL의 **per-token 평가 시간**을 비교한 값이다. 훈련 속도나 일반적인 batch serving의 보편적 가속률로 확대할 수 없다.

## 검증과 한계

### raw 설명의 검증 정정

- **캐시는 시퀀스 전체와 함께 계속 커진다**: 실제 memory는 미리 정한 길이 $M$으로 잘라 보존하며 GPU memory가 상한을 정한다.
- **같은 층의 과거 상태를 통해 gradient가 이어진다**: 과거 $n-1$층 상태는 stop-gradient된 채 현재 $n$층의 key·value 문맥으로 들어간다. 순전파 정보와 역전파 경계를 구분해야 한다.
- **상대 위치 임베딩 $R$을 학습한다**: 원 논문의 $R$은 매개변수가 없는 사인파 행렬이다. 투영 행렬과 전역 내용·위치 편향은 학습된다.
- **장문 attention의 이차 비용을 해결했다**: memory 재사용은 sliding-window 재계산을 줄이지만 현재 query와 memory를 잇는 dense attention 비용은 남는다.
- **1,874배 빠르다**: 한 GPU·per-token 평가·긴 sliding-window baseline이라는 조건부 수치다.
- **의존 길이가 80%·450% 길다**: Table 8의 RECL, $r=0.1$, 두 parameter-matched 집단에서 계산된 비교이지 context-window 비율이 아니다.
- **문서 이해·분류·상호참조·질의응답·코드에서 성능을 입증했다**: 직접 실험은 다섯 언어 모델 자료, ablation, RECL, 평가 속도와 정성적 생성이다.
- **상대 위치를 최초로 발명했고 GPT-3·PaLM·LLaMA·RoPE·Longformer·BigBird로 직접 이어졌다**: 논문은 Shaw와 Huang 등의 선행 상대 위치 연구를 인용한다. 후대 방법은 목표 일부를 공유할 수 있지만 이 원 논문만으로 직접 계보를 확정할 수 없다.

### 수식의 성립·수치 조건

masked softmax는 각 query가 읽을 수 있는 후보를 적어도 하나 가져야 한다. 모든 score를 가리면 분모가 0이 되어 확률을 만들 수 없다. 또한 $\exp(s)$는 큰 양수 score에서 overflow할 수 있으므로 실제 계산은 보통 허용 score의 최댓값 $c$를 빼서 한다.

$$
\operatorname{softmax}(s)_j
=\frac{\exp(s_j-c)}{\sum_r\exp(s_r-c)},
\qquad c=\max_r s_r
$$

이는 분자·분모에 같은 $\exp(-c)$를 곱한 것이라 정확한 실수 연산에서는 원래 비율을 바꾸지 않는다. $-\infty$ mask도 실제 부동소수점 구현에서는 큰 음수로 근사될 수 있다. 따라서 논문의 수식은 memory·상대 거리의 구조를 정의하지만, dtype·mask 값·hardware memory까지 자동으로 해결하는 완전한 구현 명세는 아니다.

### 적용 범위와 남는 한계

stop-gradient는 memory를 저렴하게 재사용하게 하지만 과거 세그먼트에 대한 장거리 credit assignment를 차단한다. 캐시된 과거 표현은 뒤에서 새 사실을 읽어도 다시 계산되거나 수정되지 않는다. 또한 더 큰 $M$은 더 넓은 직접 문맥을 주는 대신 attention 시간과 activation memory를 늘린다.

WikiText-103에서 수천 token의 글을 생성한 결과는 저자들이 사소한 결함이 있는 `relatively coherent` 표본이라고 평가한 정성 근거다. 장문 사실 일관성이나 downstream 문서 이해를 정량적으로 보증하지 않는다. [[XLNet·RoBERTa·ALBERT|XLNet]]이 Transformer-XL backbone을 사용했다는 직접 연결과, 서로 다른 장문 architecture가 모두 Transformer-XL에서 파생됐다는 넓은 계보 주장을 구분해야 한다.

## 학습 확인

### 확인 질문

1. $m_\tau^{n-1}\in\mathbb{R}^{M\times d}$와 $h_\tau^{n-1}\in\mathbb{R}^{L\times d}$를 연결하면 왜 $(M+L)\times d$가 되며, stop-gradient는 숫자와 gradient에 각각 무엇을 하는가?
2. 상대 위치 점수의 (a)–(d) 네 항 중 후보의 내용이 아니라 거리 때문에 순서가 바뀔 수 있게 하는 항은 무엇인가?
3. RECL 450%와 평가 속도 1,874배를 보편적인 context-window·serving 수치로 읽을 수 없고, $L(M+L)$ score 수가 여전히 남는 이유는 무엇인가?

### 다음 문서

- [[concept.transformer-xl|Transformer-XL]] — recurrence·상대 위치·계산 비용을 재사용 가능한 개념 지도로 정리한다.
- [[analysis.훈련-병렬성과-생성-순차성은-다른-축이다|훈련 병렬성과 생성 순차성은 다른 축이다]] — 순전파 memory 재사용, gradient 경계와 자기회귀 생성의 순차성을 서로 다른 축에서 비교한다.

## 출처

- Zihang Dai 외, [Transformer-XL: Attentive Language Models beyond a Fixed-Length Context](https://aclanthology.org/P19-1285/), ACL 2019, pp. 2978–2988. 특히 §§3.1–3.3, Figures 1–2, Tables 1–9.
- 프로젝트 번역·검토 출발 자료: [Transformer-XL: Extending Transformers to Long Sequences](https://mbrenndoerfer.com/writing/transformer-xl-long-sequences-segment-recurrence)
- 프로젝트 보존 자료: `raw/064_Transformer-XL Extending Transformers to Long Sequences.ko.md`, `raw/064_Transformer-XL Extending Transformers to Long Sequences.commentary.ko.md`.

## 관련 항목

- [[concept.transformer-xl|Transformer-XL]]
- [[analysis.훈련-병렬성과-생성-순차성은-다른-축이다|훈련 병렬성과 생성 순차성은 다른 축이다]]
- [[concept.transformer|Transformer]]
- [[concept.자기회귀-생성|자기회귀 생성]]
- [[concept.xlnet-roberta-albert|XLNet·RoBERTa·ALBERT]]
