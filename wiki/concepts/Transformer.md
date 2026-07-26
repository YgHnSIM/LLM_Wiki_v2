---
schema_version: 3
id: concept.transformer
page_type: concept
title: Transformer
aliases:
  - 트랜스포머
  - Transformer architecture
  - self-attention Transformer
tags:
  - type/concept
  - domain/ai
  - domain/nlp
  - domain/machine-learning
created: '2026-07-19'
updated: '2026-07-24'
editorial_status: active
review:
  evidence_coverage: verified
  content_mode: descriptive
artifacts:
  - raw/055_The Transformer Attention Is All You Need.ko.md
  - raw/055_The Transformer Attention Is All You Need.commentary.ko.md
  - raw/064_Transformer-XL Extending Transformers to Long Sequences.ko.md
  - raw/064_Transformer-XL Extending Transformers to Long Sequences.commentary.ko.md
  - raw/069_Mixture of Experts Sparse Activation for Scaling Language Models.ko.md
  - raw/069_Mixture of Experts Sparse Activation for Scaling Language Models.commentary.ko.md
  - raw/087_Whisper Large-Scale Multilingual Speech Recognition with Transformer Architecture.ko.md
  - raw/087_Whisper Large-Scale Multilingual Speech Recognition with Transformer Architecture.commentary.ko.md
  - raw/088_FlashAttention IO-Aware Exact Attention for Long-Context Language Models.ko.md
  - raw/088_FlashAttention IO-Aware Exact Attention for Long-Context Language Models.commentary.ko.md
evidence:
  - source_id: vaswani-et-al-2017-attention
    locator: 'pp. 5998–6008, 특히 §§3–5, Figure 1, Tables 1–3의 encoder–decoder·attention·위치 인코딩·복잡도·번역 평가'
    relation: supports
  - source_id: dai-et-al-2019-transformer-xl
    locator: 'pp. 2978–2988, 특히 §§3.1–3.3과 Figures 1–2의 stop-gradient segment recurrence·relative positional attention, §4.5와 Table 9의 evaluation-speed 조건'
    relation: supplements
  - source_id: gpt-2018
    locator: §2와 Figure 1의 Transformer decoder 기반 generative pre-training·task-aware input transformation
    relation: contextualizes
  - source_id: bert-2019
    locator: §3.1과 Figure 1의 bidirectional Transformer encoder와 masked language model 사전학습
    relation: contextualizes
  - source_id: jain-wallace-2019-attention-explanation
    locator: 'NAACL 2019, pp. 3543–3556의 attention weight·gradient importance 상관과 adversarial attention 실험'
    relation: disputes
  - source_id: wiegreffe-pinter-2019-attention-explanation
    locator: 'EMNLP-IJCNLP 2019, pp. 11–20의 설명 정의 비판과 네 가지 진단·검증 제안'
    relation: contextualizes
  - source_id: lepikhin-et-al-2021-gshard
    locator: 'ICLR 2021, §§2.1–2.2와 Figure 3의 일부 position-wise FFN을 top-2 expert FFN으로 교체한 Transformer MoE'
    relation: supplements
  - source_id: fedus-et-al-2022-switch-transformer
    locator: 'JMLR 23(120), §§2–3과 Figures 1–2의 공유 attention·희소 Switch FFN·top-1 token routing'
    relation: supplements
  - source_id: radford-et-al-2022-whisper
    locator: §§2.2–2.4와 Figure 1의 log-Mel·합성곱 stem·Transformer encoder–decoder·교차 어텐션·다중 과제 token 구성
    relation: supplements
  - source_id: dao-et-al-2022-flashattention
    locator: '§§2.2–3.2, Algorithms 0–1, Theorems 1–2와 Figure 2의 dense attention 산술량·중간 저장·HBM 접근·타일링·backward 재계산'
    relation: supplements
relations:
  - target: source.064
    kind: related
  - target: source.069
    kind: related
  - target: source.087
    kind: related
  - target: source.088
    kind: related
  - target: concept.벡터-행렬-텐서와-shape
    kind: related
  - target: concept.내적-행렬곱과-선형변환
    kind: related
  - target: concept.소프트맥스
    kind: related
  - target: concept.활성화-함수
    kind: related
  - target: concept.계산-복잡도와-비용-모델
    kind: related
  - target: concept.다층-퍼셉트론
    kind: related
  - target: concept.미분-편미분-그래디언트
    kind: related
  - target: concept.연쇄-법칙과-계산-그래프
    kind: related
  - target: concept.역전파
    kind: related
  - target: concept.whisper
    kind: related
  - target: concept.flashattention
    kind: related
  - target: concept.신경망-기계-번역
    kind: related
  - target: concept.layer-normalization
    kind: related
  - target: concept.transformer-xl
    kind: related
  - target: concept.전문가-혼합
    kind: related
learning:
  difficulty:
    entry: intermediate
    target: intermediate
  prerequisites:
    - target: concept.어텐션-메커니즘
    - target: concept.잔차-연결
  assumed_knowledge: 의 Q K V와 softmax 의 shortcut과 shape 조건
  outcomes:
    - 'Transformer 한 block에서 위치 표현·어텐션·MLP·잔차·정규화·출력 softmax가 맡는 역할을 계산 순서와 수식으로 설명하고, 병렬 훈련과 순차 생성이 함께 성립하는 이유를 구분할 수 있다.'
  next:
    - target: source.055
      reason: 055Transformer와 자기어텐션 기반 시퀀스 모델링 — 원 2017년 논문의 번역 실험·복잡도 표·후속 계보를 원자료의 범위에서 다시 확인한다.
    - target: concept.자기회귀-생성
      reason: 자기회귀 생성 — causal decoder가 확률을 한 token씩 곱해 문장을 만드는 이유와 생성 전략을 이어서 살핀다.
---
# Transformer

> [!note] 학습 안내
> **난이도:** 중급<br>
> **선수 지식:** [[concept.어텐션-메커니즘|어텐션 메커니즘]], [[concept.잔차-연결|잔차 연결]]<br>
> **읽고 나면:** Transformer 한 block에서 위치 표현·어텐션·MLP·잔차·정규화·출력 softmax가 맡는 역할을 계산 순서와 수식으로 설명하고, 병렬 훈련과 순차 생성이 함께 성립하는 이유를 구분할 수 있다.

## 1단계 — 먼저 잡을 핵심

### Transformer가 바꾼 문제

2017년 Transformer는 기계 번역의 encoder–decoder 구조를 유지하면서, 시퀀스 안 위치를 시간 순서대로 갱신하는 순환 신경망과 합성곱을 핵심 상호작용에서 빼고 [[어텐션 메커니즘|self-attention]]으로 바꿨다. 각 위치가 다른 위치를 직접 참고할 수 있어, 훈련 때 한 시퀀스의 많은 위치를 행렬 연산으로 함께 처리할 수 있었다.

그러나 Transformer는 attention 행렬 하나가 아니다. 토큰을 벡터로 바꾸는 embedding, 순서를 알려 주는 위치 표현, 위치마다 적용하는 MLP, residual connection, LayerNorm, decoder 출력의 softmax와 학습 절차가 함께 있는 구조다. 원 논문은 6층 encoder와 6층 decoder를 가진 번역 모델을 제시했다. 오늘날의 모든 LLM이 원 모델과 같은 입출력 구조라는 뜻은 아니다.

### 먼저 알아야 할 기초 개념

- **embedding**: 토큰을 $d_{\mathrm{model}}$개의 실수로 된 벡터로 바꾸는 학습 표현이다.
- **위치 표현(positional encoding)**: self-attention만으로는 토큰 순서를 알 수 없으므로 embedding에 더하는 위치 신호다.
- **self-attention**: 같은 시퀀스의 위치들이 Q·K·V를 통해 서로의 정보를 가중 합하는 연산이다.
- **위치별 MLP(feed-forward network, FFN)**: 서로 다른 위치 사이를 섞지 않고, 각 위치 벡터에 같은 두 층 신경망을 독립적으로 적용하는 연산이다.
- **residual connection과 LayerNorm**: 이전 표현을 보존·보정하고 수치 분포를 조절하는 block 연결 방식이다.

Transformer를 이해할 때 “어텐션이 모든 것을 한다”와 “병렬이므로 항상 싸다”를 함께 피해야 한다. attention은 위치 사이 정보를 섞고, MLP는 각 위치 안의 feature를 변환하며, residual·정규화는 깊은 block을 연결한다. 모든 위치 쌍을 보는 dense attention은 길이에 따라 제곱 비용도 낸다.

이 문서의 $n\times d_{\mathrm{model}}$ 표에서 행은 token 위치, 열은 feature다. 축·shape와 잔차 덧셈 조건은 [[벡터·행렬·텐서와 shape]], $XW_Q$·$QK^{\mathsf T}$·출력 투영이 만드는 가중합은 [[내적·행렬곱과 선형변환]]에서 완전하게 설명한다. 여기서는 이 연산들이 Transformer block 안에서 어떤 순서와 정보 흐름을 이루는지에 집중한다.

### 한 block의 핵심 흐름

입력 토큰열이 길이 $n$이고 각 표현 차원이 $d_{\mathrm{model}}$이면, 한 encoder block은 대략 다음 순서다.

$$
\begin{aligned}
&\text{token}
\rightarrow\text{embedding}+\text{position}\\
&\rightarrow\text{multi-head self-attention}
\rightarrow\text{residual + LayerNorm}\\
&\rightarrow\text{position-wise MLP}
\rightarrow\text{residual + LayerNorm}.
\end{aligned}
$$

원 2017년 Transformer는 각 sublayer의 결과를 먼저 입력에 더하고 그 뒤 LayerNorm을 적용하는 Post-LN이었다. decoder에는 masked self-attention과 encoder 출력에 접근하는 cross-attention sublayer가 하나 더 있다.

## 2단계 — 작동 원리

### 가장 작은 구조 예

길이 $n=3$, 모델 차원 $d_{\mathrm{model}}=4$인 설명용 encoder 입력 행렬을 생각해 보자. 세 행은 세 토큰 위치, 네 열은 각 위치의 feature다.

$$
X\in\mathbb R^{3\times4}
$$

각 행에 위치 표현을 더한 뒤, 한 head가 $d_k=d_v=2$를 쓴다면 학습 행렬로 다음을 만든다.

$$
\begin{aligned}
Q&=XW_Q\in\mathbb R^{3\times2},\\
K&=XW_K\in\mathbb R^{3\times2},\\
V&=XW_V\in\mathbb R^{3\times2}.
\end{aligned}
$$

$QK^{\mathsf T}$의 shape는 $3\times3$이다. 즉 각 행은 한 토큰 위치가 세 후보 위치에 준 점수, 각 열은 한 후보 위치가 세 query에서 받은 점수다. 행별 softmax를 거쳐 $A\in\mathbb R^{3\times3}$를 만들고 $AV$를 계산하면, 각 위치는 길이 2인 새 value 조합을 얻는다.

이 예에서 모든 위치가 한꺼번에 계산된다는 것은 $3\times3$ 점수 행렬을 한 번에 만들 수 있다는 뜻이다. 세 위치가 같은 정보를 보거나 같은 가중치를 갖는다는 뜻은 아니다. 각 행은 다른 query의 독립적인 후보 비율이다.

### decoder의 미래 차단

번역이나 다음 토큰 생성의 decoder는 위치 1이 위치 2·3의 정답을 보지 못해야 한다. 길이 3의 causal mask는 개념적으로 다음과 같다.

$$
M=
\begin{bmatrix}
0 & -\infty & -\infty\\
0 & 0 & -\infty\\
0 & 0 & 0
\end{bmatrix}
$$

이를 attention score에 더한 뒤 softmax를 적용하면 첫 행은 첫 위치만, 둘째 행은 첫·둘째 위치만, 셋째 행은 세 위치 모두를 볼 수 있다. $-\infty$는 softmax 뒤 가중치 0을 뜻하는 수학적 표기다. 실제 구현은 충분히 작은 유한값을 쓰는 경우가 많다.

훈련에서는 정답 목표열을 한 칸 옮겨 decoder 입력으로 주고 이 mask를 적용하므로 여러 위치의 손실을 병렬 계산할 수 있다. 하지만 추론에서는 다음 token을 실제로 생성해야 그 token이 다음 위치의 조건이 된다. 따라서 표준 자기회귀 decoder의 출력 생성은 여전히 순차적이다.

### attention과 MLP가 나누어 하는 일

한 attention sublayer는 각 위치가 **다른 위치에서** 어떤 정보를 읽을지를 정한다. 그 뒤 위치별 MLP는 이미 섞인 한 위치의 벡터 안에서 feature를 비선형으로 바꾼다. MLP의 가중치는 모든 위치에서 같지만, 각 위치의 입력값이 다르므로 출력은 달라진다.

이 구분은 “Transformer가 어텐션만 쓴다”는 오해를 막는다. 원 모델의 encoder와 decoder는 attention 외에도 각 층마다 위치별 두 층 MLP를 갖고, decoder 끝에는 선형 변환과 softmax로 다음 토큰 확률을 만든다.

## 3단계 — 기술과 근거

### 정식 용어와 shape

| 기호 | 현재 문서에서의 의미 | shape 또는 범위 | 역할 |
| --- | --- | --- | --- |
| $B$ | 한 번에 처리하는 시퀀스 수 | 양의 정수 | batch 축 |
| $T$ | padding을 포함한 현재 시퀀스 길이 | 양의 정수 | batched tensor의 token 축 |
| $n$ | 한 시퀀스의 토큰 수 | 양의 정수 | attention 행렬의 행·열 수 |
| $d_{\mathrm{model}}$ | block을 지나는 표현의 공통 차원 | 원 base 모델에서는 512 | residual addition이 가능하게 하는 폭 |
| $h$ | attention head 수 | 원 base 모델에서는 8 | 병렬 투영 공간 수 |
| $d_k,d_v$ | head 하나의 key·value 차원 | 원 base 모델에서는 각각 64 | 점수·value 표현의 폭 |
| $X$ | 위치 표현을 더한 입력 | $n\times d_{\mathrm{model}}$ | 현재 층의 입력 |
| $Q,K,V$ | query·key·value 행렬 | $n\times d_k$, $n\times d_k$, $n\times d_v$ | 관련성 점수와 가중 합 |
| $A$ | query별 후보 가중치 | $n\times n$ | 각 행의 합이 1 |
| $W_Q,W_K,W_V$ | 역할별 투영 행렬 | $d_{\mathrm{model}}\times d_k$ 또는 $d_{\mathrm{model}}\times d_v$ | 학습되는 매개변수 |
| $M$ | attention mask | $n\times n$ | 금지된 연결을 softmax 전에 차단 |

원 base 모델은 $d_{\mathrm{model}}=512$, $h=8$, $d_k=d_v=64$, FFN 내부 차원 $d_{\mathrm{ff}}=2048$을 썼다. $8\times64=512$이므로 각 head 출력을 이어 붙인 뒤 다시 512차원으로 투영할 수 있다.

### batch를 포함한 한 block의 shape 추적

앞의 $n\times d_{\mathrm{model}}$ 표기는 한 시퀀스만 본 것이다. 실제 구현에 가까운 설명용 설정을

$$
(B,T,D,H,D_h,D_{\mathrm{ff}},|\mathcal V|)
=(2,4,8,2,4,16,10)
$$

으로 두자. 여기서 $D=d_{\mathrm{model}}=H D_h$다. library마다 head 축 순서가 $(B,H,T,D_h)$ 또는 $(B,T,H,D_h)$일 수 있지만, 전치·reshape 전후에 어떤 축인지 명시하면 같은 계산이다. 이 문서는 score의 마지막 두 축을 query·key로 읽기 쉬운 $(B,H,T,D_h)$ 관례를 쓴다.

| 단계 | 연산 | 출력 shape | 보존·변경되는 축 |
| --- | --- | --- | --- |
| token ID | 입력 | $(2,4)$ | batch·token |
| embedding | lookup | $(2,4,8)$ | feature $D$ 추가 |
| packed QKV | $XW_{QKV}+b$ | $(2,4,24)$ | 마지막 축을 $3D$로 투영 |
| head 분할 | reshape·transpose | $(2,2,4,4)$ | $D\to(H,D_h)$ |
| score | $QK^{\mathsf T}/\sqrt{D_h}+M$ | $(2,2,4,4)$ | 마지막 두 축은 query $T$·key $T$ |
| 가중합 | $\operatorname{softmax}_{key}(\text{score})V$ | $(2,2,4,4)$ | head별 value 폭 $D_h$ |
| head 결합 | transpose·concat | $(2,4,8)$ | $(H,D_h)\to D$ |
| 출력 투영 | $\operatorname{Concat}(\text{head})W^O$ | $(2,4,8)$ | residual 폭 복원 |
| 첫 residual·norm | add, LayerNorm | $(2,4,8)$ | 두 항 shape 일치, 마지막 $D$만 정규화 |
| FFN 확장 | $XW_1+b_1$ | $(2,4,16)$ | $D\to D_{\mathrm{ff}}$ |
| activation | ReLU·GELU 등 | $(2,4,16)$ | 성분별 적용, shape 보존 |
| FFN 축소 | $HW_2+b_2$ | $(2,4,8)$ | $D_{\mathrm{ff}}\to D$ |
| 둘째 residual·norm | add, LayerNorm | $(2,4,8)$ | block 출력 |
| 어휘 투영 | $XW_{\mathrm{out}}+b$ | $(2,4,10)$ | $D\to|\mathcal V|$ |

LayerNorm의 평균·분산은 각 $(b,t)$마다 마지막 $D$축만 줄이므로, 축을 유지해 저장하면 통계 shape는 $(2,4,1)$이다. FFN activation은 $(B,T,D_{\mathrm{ff}})$의 각 성분에 독립 적용되고, 출력 softmax는 $(B,T,|\mathcal V|)$의 마지막 **어휘 후보 축**을 정규화한다. 둘 다 마지막 축을 다룬다는 이유로 같은 연산은 아니다.

역전파에서 매개변수 gradient는 원 매개변수와 같은 shape다. 예를 들어 $W_{QKV}\in\mathbb R^{8\times24}$이면 $\partial J/\partial W_{QKV}$도 $8\times24$, $W_1\in\mathbb R^{8\times16}$이면 $\partial J/\partial W_1$도 $8\times16$, $W_{\mathrm{out}}\in\mathbb R^{8\times10}$이면 그 gradient도 $8\times10$이다. activation gradient와 residual branch gradient는 대응하는 중간 tensor shape를 보존한다.

이 표는 `npm run math:shapes`로 실행할 수 있다. 이 검사는 head 분할 가능성, residual shape, LayerNorm 통계 축, 매개변수와 gradient shape, $T$를 두 배로 할 때 attention score 원소 수가 네 배가 되는지를 회귀 테스트로 확인한다. shape 검사가 값·mask 의미·수치 안정성까지 자동 검증하는 것은 아니다.

### 핵심 수식: scaled dot-product attention

#### 수식이 답하려는 질문

각 위치가 후보 위치들에서 정보를 읽을 때, 어떤 후보의 value를 얼마나 섞을지를 정한다. decoder에서는 mask도 더해 미래 위치를 후보에서 제외한다.

$$
Q=XW_Q,\qquad K=XW_K,\qquad V=XW_V,
$$

$$
A=\operatorname{softmax}_{\mathrm{row}}
\left(\frac{QK^{\mathsf T}}{\sqrt{d_k}}+M\right),\qquad
O=AV
$$

encoder self-attention에서는 $M$이 없거나 padding만 가린다. decoder masked self-attention에서는 causal mask를 더한다. encoder–decoder attention에서는 decoder 표현으로 $Q$를, encoder 출력으로 $K,V$를 만든다.

#### 한 항씩 만드는 과정

1. $XW_Q$, $XW_K$, $XW_V$는 같은 입력 표현을 세 가지 학습 공간으로 바꾼다. $X$의 $n$개 행은 유지되고, 열 차원만 각각 $d_k$ 또는 $d_v$가 된다.
2. $QK^{\mathsf T}$의 $(i,j)$ 원소는 위치 $i$의 query와 위치 $j$의 key 내적이다. 그래서 결과 shape가 $n\times n$이며 모든 위치 쌍을 점수화한다.
3. $\sqrt{d_k}$로 나누면 큰 차원의 내적이 softmax를 지나치게 포화시키는 경향을 줄인다. 이는 각 성분이 평균 0·분산 1이면 내적 분산이 $d_k$가 된다는 원 논문의 직관에 따른 scaling이다.
4. $M$의 금지된 위치에는 $-\infty$를 더한다. softmax의 지수항이 0이 되어 해당 가중치는 0이 된다.
5. 행별 softmax로 각 query가 후보들에 주는 가중치 합을 1로 만든다. $A$는 다음 토큰 확률 분포가 아니라, 현재 표현을 만들기 위해 value를 섞는 내부 가중치다.
6. $AV$는 각 행의 가중치로 $V$의 행들을 합친다. 출력 $O$의 shape는 $n\times d_v$다.

자세한 두 후보 수치 계산은 [[어텐션 메커니즘]]에 있다. 이 문서에서 중요한 추가 사실은 같은 식이 encoder·decoder·cross-attention에서 $Q,K,V,M$의 출처만 달리해 세 역할을 한다는 점이다.

### multi-head: 여러 투영 공간을 합치는 이유

한 head만 쓰면 한 query의 모든 후보 관계를 하나의 가중치 분포와 하나의 value 공간에 담아야 한다. 원 논문은 query 입력 $X_Q$와 key/value 입력 $X_{KV}$에 head마다 다른 선형 투영을 적용하고 결과를 연결한 뒤 다시 투영했다.

$$
\begin{aligned}
\operatorname{head}_r
&=\operatorname{Attention}(X_QW_r^Q,\\
&\qquad X_{KV}W_r^K,\\
&\qquad X_{KV}W_r^V),\\
\operatorname{MultiHead}(X_Q,X_{KV})
&=\operatorname{Concat}(\operatorname{head}_1,\ldots,\operatorname{head}_h)\\
&\qquad W^O.
\end{aligned}
$$

$X_Q,X_{KV}$는 self-attention에서는 같은 이전 층 출력이고, cross-attention에서는 각각 decoder와 encoder 출력이다. $\operatorname{Concat}$은 head별 $d_v$차원 출력을 열 방향으로 이어 $h d_v$차원으로 만든다. $W^O\in\mathbb R^{h d_v\times d_{\mathrm{model}}}$는 이를 다시 residual stream의 공통 폭으로 돌린다. 원 논문은 head 하나의 차원을 줄여, full-width single head와 비슷한 계산량으로 여러 표현 부분공간을 쓰려 했다.

여러 head가 다른 관계를 포착할 **기회**를 준다는 것과, 특정 head가 항상 사람이 해석할 수 있는 문법·의미 역할 하나를 맡는다는 것은 다르다.

### 위치별 MLP: 위치 사이가 아니라 feature를 바꾸는 단계

원 논문의 FFN은 각 위치에 독립·동일하게 적용하는 두 선형 변환과 ReLU였다.

$$
\operatorname{FFN}(x)
=\max(0,xW_1+b_1)W_2+b_2
$$

한 위치 표현 $x$가 길이 $d_{\mathrm{model}}$인 행벡터라면 $W_1$은 $d_{\mathrm{model}}\times d_{\mathrm{ff}}$, $b_1$은 길이 $d_{\mathrm{ff}}$, $W_2$는 $d_{\mathrm{ff}}\times d_{\mathrm{model}}$, $b_2$는 길이 $d_{\mathrm{model}}$이다. 원 base 모델은 $512\rightarrow2048\rightarrow512$를 사용했다.

첫 선형 변환은 feature를 넓은 내부 공간으로 옮기고, ReLU는 음수를 0으로 만들어 비선형성을 넣으며, 둘째 선형 변환은 다시 residual stream 차원으로 돌린다. ReLU가 없다면 두 선형 변환과 bias의 합성은 하나의 선형 변환으로 합칠 수 있어 두 층을 쓴 목적이 줄어든다. FFN은 위치 사이 정보를 섞지 않는다. 그 역할은 앞선 attention이 맡는다.

여기서 ReLU는 각 $(b,t)$ 위치의 $d_{\mathrm{ff}}$ feature에 성분별로 적용되며 softmax처럼 위치나 후보 축을 정규화하지 않는다. affine 합성이 왜 줄어드는지와 ReLU·GELU의 gradient·포화 경계는 [[활성화 함수]]에서, 이 문서에서는 FFN이 token 간 정보 혼합이 아닌 위치 안의 비선형 변환이라는 역할만 다룬다.

훈련 때 최종 token 손실 $J$는 FFN의 $W_1,b_1,W_2,b_2$뿐 아니라 attention 투영과 embedding에도 의존한다. [[역전파]]는 순전파에서 저장한 각 위치·head의 중간값을 사용해 $J$의 편미분을 역순으로 누적한다. 같은 residual stream이 shortcut과 sublayer 두 경로로 쓰이면 그 기울기 기여도 더한다. 이 계산은 [[연쇄 법칙과 계산 그래프]]의 규칙을 block의 실제 shape에 적용한 것이며, 기울기를 얻은 뒤의 갱신은 별도의 optimizer가 맡는다.

### residual과 LayerNorm: block을 연결하는 규칙

원 Transformer의 각 sublayer는 Post-LN으로 연결됐다.

$$
y=\operatorname{LayerNorm}\bigl(x+\operatorname{Sublayer}(x)\bigr)
$$

$x$와 $\operatorname{Sublayer}(x)$의 마지막 차원이 모두 $d_{\mathrm{model}}$이어야 성분별 덧셈이 가능하다. shortcut은 기존 표현을 직접 전달하고, sublayer는 그 위에 학습된 갱신을 더한다. 그 뒤 LayerNorm은 한 위치 표현의 feature 통계를 사용해 정규화한다.

현대 모델에는 $\operatorname{LayerNorm}$을 sublayer 앞에 놓는 Pre-LN도 많다. 잔차 덧셈을 공유해도 정규화가 identity 경로에 놓이는 위치와 초기 gradient 조건이 달라진다. 원 2017년 Post-LN 식을 현대 기본형으로 바꾸어 읽지 않는다.

### 순서와 출력 확률

순환·합성곱을 핵심 시퀀스 상호작용에서 빼면, token embedding만으로는 같은 토큰이 어느 위치인지 구분할 수 없다. 원 논문은 embedding과 같은 $d_{\mathrm{model}}$ 차원의 사인·코사인 위치 인코딩을 더했다.

$$
\begin{aligned}
\operatorname{PE}(pos,2i)
&=\sin\left(\frac{pos}{10000^{2i/d_{\mathrm{model}}}}\right),\\
\operatorname{PE}(pos,2i+1)
&=\cos\left(\frac{pos}{10000^{2i/d_{\mathrm{model}}}}\right).
\end{aligned}
$$

$pos$는 토큰 위치, $i$는 차원 쌍의 번호다. 짝수·홀수 feature에 서로 다른 주파수의 사인과 코사인을 넣어 각 위치에 패턴을 준다. 원 논문은 고정 사인파가 상대 오프셋을 선형 변환으로 표현하기 쉬울 수 있고 훈련 길이보다 긴 길이로 외삽할 가능성이 있다는 이유로 이를 선택했다. 이는 외삽 성능 보장이 아니다. 논문은 학습 위치 임베딩도 base와 거의 같은 결과였다고 보고했다.

decoder의 마지막 위치 표현 $h_t$는 선형 변환으로 어휘별 logit $z_t$를 만들고, softmax로 다음 토큰 조건부확률을 만든다.

$$
z_t=h_tW_{\mathrm{out}}+b_{\mathrm{out}},\qquad
P(w_t\mid w_{<t},\text{source})
=\operatorname{softmax}(z_t)_{w_t}
$$

$W_{\mathrm{out}}$의 열은 어휘 후보, $z_t$의 각 성분은 정규화 전 점수다. softmax가 후보 전체를 합 1인 분포로 바꾸므로 학습은 실제 정답 토큰에 높은 확률을 주도록 이 매개변수를 조정할 수 있다. 원 논문은 입력·출력 embedding과 pre-softmax 선형 변환이 같은 가중치 행렬을 공유하도록 했다.

### 병렬성·경로 길이·제곱 비용

원 논문의 층별 비교는 총 계산량뿐 아니라 순차 연산 수와 최대 경로 길이를 함께 봤다.

| 층 | 층별 계산량 | 순차 연산 수 | 최대 경로 길이 |
| --- | --- | ---: | ---: |
| self-attention | $O(n^2d)$ | $O(1)$ | $O(1)$ |
| recurrent | $O(nd^2)$ | $O(n)$ | $O(n)$ |
| kernel 폭 $k$ convolution | $O(knd^2)$ | $O(1)$ | $O(\log_k n)$ 또는 $O(n/k)$ |

따라서 시퀀스 길이 $n$이 표현 차원 $d$보다 작을 때 self-attention의 계산 장점이 특히 분명하고, 먼 두 위치 사이 신호 경로도 짧다. 반대로 $n$이 매우 커지면 모든 위치 쌍의 점수와 표준 구현이 물질화하는 $n\times n$ 중간 행렬이 병목이 된다. “병렬화 가능”은 총연산량·중간 저장·메모리 대역폭이 항상 작다는 뜻이 아니다.

이 표의 $O(n^2d)$는 층별 산술 성장률이다. 특정 batch·dtype·hardware에서의 FLOPs, peak memory, HBM 이동, device 간 통신과 wall-clock을 어떻게 따로 세는지는 [[계산 복잡도와 비용 모델]]에서 정리한다.

### 원 구조 이후의 변형과 시스템

[[069_전문가 혼합과 희소 활성 스케일링]]의 GShard와 Switch Transformer는 보통 self-attention 전체를 여러 expert로 바꾸지 않았다. 일부 위치별 FFN sublayer를 여러 expert FFN과 token router로 바꾸고, GShard는 top-2, Switch는 top-1 expert만 실행했다. attention·embedding·normalization 같은 공유 경로는 계속 계산된다. 그러므로 [[전문가 혼합]]을 Transformer 전체가 여러 독립 모델로 갈라지는 ensemble로 이해하지 않는다.

[[FlashAttention]]은 attention 식이나 위치별 정보 접근 범위를 바꾸지 않고 score·probability matrix를 HBM에 저장하지 않도록 계산 순서를 바꾼다. Query·key·value를 SRAM tile로 처리하고 온라인 softmax로 행별 통계와 출력을 누적하며, backward에서는 필요한 attention block을 재계산한다. NeurIPS proceedings 최종본 Figure 2의 A100 forward+backward 예에서는 재계산 때문에 66.6보다 많은 75.2 GFLOPs를 사용했지만 HBM 읽기·쓰기량은 35.3GB에서 4.4GB, 시간은 35.1ms에서 11.7ms로 줄었다. FLOPs가 더 많아도 메모리 이동이 줄면 더 빨라질 수 있다는 사례다.

[[Transformer-XL]]은 고정 길이 segment를 독립 처리할 때 생기는 context fragmentation을 줄이기 위해 이전 segment의 각 layer hidden state를 길이 $M$의 memory로 보존한다. 현재 segment의 query는 현재 hidden state뿐 아니라 stop-gradient가 적용된 이전 segment memory에도 attend한다. 현재 segment 안 위치들은 병렬 계산할 수 있지만, 다음 segment의 forward 계산은 이전 memory가 준비된 뒤 시작된다. 더 긴 문맥을 재사용한다는 사실이 attention의 길이 비용을 없애지는 않는다.

### 번역 실험의 실제 범위와 후속 계보

최종 NeurIPS 논문의 Transformer-big은 WMT 2014 영어→독일어에서 BLEU 28.4, 영어→프랑스어에서 BLEU 41.0을 보고했다. base 모델은 8개 NVIDIA P100 GPU에서 12시간, big 모델은 3.5일 훈련됐다. 이는 당시 비교 시스템보다 품질과 보고된 훈련 비용이 좋았다는 근거지만, 모든 길이·과제·하드웨어에서 RNN보다 항상 빠르다는 보편 법칙은 아니다.

GPT는 masked self-attention decoder 계열을 단일 token stream의 다음 token 사전학습에 사용했고, BERT는 encoder 계열을 masked language modeling에 사용했다. 두 모델은 Transformer block을 직접 재사용하지만 원 번역 모델의 encoder–decoder와 같은 입출력 구조나 학습 목적은 아니다.

대규모 언어 모델의 성립에는 이 block 외에도 서브워드 토큰화, 대규모 사전학습 자료, optimizer·schedule, 저정밀 계산, 데이터·텐서·파이프라인 병렬화와 하드웨어가 필요했다. Transformer가 확장의 중요한 구조적 조건이었다는 사실과 현대 능력의 단일 원인이었다는 주장을 구분한다.

[[Whisper]]는 원 번역 Transformer의 encoder–decoder 역할 분리를 오디오→텍스트에 적용한다. Encoder는 30초 log-Mel spectrogram을 합성곱 stem 뒤에서 문맥화하고, 자기회귀 decoder는 음향 표현에 cross-attention해 언어·과제·timestamp와 text token을 생성한다. 입력 단위가 text embedding이 아니어도 Transformer block을 사용할 수 있음을 보여 주지만, 80채널 음향 특징·30초 창·BPE·long-form decoding rule까지 Transformer가 자동으로 결정했다는 뜻은 아니다. 논문은 새 attention 구조의 우월성을 검증하려 한 것이 아니라 이미 검증된 구조를 고정하고 68만 시간 규모의 약한 감독 자료가 만드는 zero-shot 견고성을 연구했다.

## 검증과 한계

### attention weight는 설명인가

attention matrix는 어느 value가 현재 표현에 얼마나 섞였는지를 보여 주므로 분석할 수 있는 내부 신호다. 그러나 그 가중치가 예측에 대한 충실한 인과 설명과 자동으로 같아지지는 않는다. Jain·Wallace는 여러 NLP 모델에서 attention과 gradient 기반 중요도의 상관이 낮고 다른 attention 분포가 비슷한 예측을 만들 수 있음을 보였다.

Wiegreffe·Pinter는 ‘설명’의 정의와 모델 전체를 고려해야 한다고 반론하고, uniform baseline·seed variance·frozen attention·adversarial training 같은 진단을 제안했다. 따라서 attention은 절대 설명이 아니라고 닫기보다, 단순 시각화를 넘어 충실성·안정성·개입 효과를 검증해야 하는 논쟁적 도구로 기록한다.

### 흔한 오해와 경계

- Transformer는 attention만으로 구성되지 않는다. embedding·위치 표현·MLP·residual·LayerNorm·출력 softmax와 학습 설계가 함께 필요하다.
- self-attention의 위치 병렬성은 자기회귀 생성 전체의 병렬성을 뜻하지 않는다.
- causal mask는 미래 누설을 막지만, 위치 순서를 부여하는 장치는 아니다.
- 고정 사인파 위치 인코딩은 훈련 길이를 넘는 일반화를 보장하지 않는다.
- attention weight는 내부 정보 혼합 비율이지 자동으로 정답 정렬이나 인과 설명은 아니다.
- dense attention의 $O(n^2d)$ 산술량과 실제 HBM 이동·wall-clock 시간은 같은 지표가 아니다.
- 원 2017년 번역 성과를 현대 LLM의 크기·사실성·안전성·추론 능력의 직접 증거로 읽을 수는 없다.

## 학습 확인

### 마스터리 연습

#### 완전 풀이 확인

`batch를 포함한 한 block의 shape 추적` 표를 가리고 $(B,T,D,H,D_h,D_{\mathrm{ff}},|\mathcal V|)=(2,4,8,2,4,16,10)$의 모든 shape를 다시 적어라. 각 단계에서 token·head·feature·candidate 중 어느 축을 바꾸거나 줄이는지도 표시한다.

#### 부분 완성

다음 빈칸을 채워라.

$$
X:(2,4,8)
\xrightarrow{W_{QKV}:(8,24)}
\square
\xrightarrow{\text{split heads}}
\square
$$

$$
\text{scores}:\square,
\quad
\text{concat}:\square,
\quad
XW_1:\square,
\quad
\text{logits}:\square
$$

#### 새 수치 전이

새 설정을

$$
(B,T,D,H,D_h,D_{\mathrm{ff}},|\mathcal V|)
=(3,5,12,3,4,48,32000)
$$

으로 둔다. QKV packed, head별 Q·K·V, attention score, head 결합, FFN 중간값, block 출력, logits의 shape를 계산하라. score 원소 수와 logit 원소 수도 구하고, 두 tensor가 각각 어느 축 때문에 커지는지 설명한다.

#### 오류 진단

다음 구현 설명에서 오류를 찾아 고쳐라.

1. $D=10,H=3$을 그대로 reshape해 각 head 폭을 $10/3$으로 둔다.
2. attention score를 $(B,T,H,T)$로 만들고 마지막 축이 head라고 설명한다.
3. head 출력을 concat한 $(B,T,D)$에 $W^O$를 곱한 뒤 $(B,T,D/2)$를 residual 입력에 broadcasting으로 더한다.
4. LayerNorm은 $(B,T,D)$ 전체에서 평균 하나를 계산하고, FFN은 $T$축을 $D_{\mathrm{ff}}$로 바꾼다.

### 해설과 채점 기준

1. **부분 완성:** packed QKV는 $(2,4,24)$, head 분할 뒤 각 Q·K·V는 $(2,2,4,4)$다. score는 $(2,2,4,4)$, concat은 $(2,4,8)$, FFN 중간값은 $(2,4,16)$, logits는 $(2,4,10)$이다.
2. **새 수치 전이:** packed QKV $(3,5,36)$, head별 Q·K·V $(3,3,5,4)$, score $(3,3,5,5)$, concat과 block 출력 $(3,5,12)$, FFN 중간값 $(3,5,48)$, logits $(3,5,32000)$이다. score 원소 수는 $3\cdot3\cdot5\cdot5=225$, logit 원소 수는 $3\cdot5\cdot32000=480000$이다. 전자는 query·key 위치 쌍, 후자는 token별 어휘 후보 때문에 커진다.
3. **오류 진단:** head 분할은 $D$가 $H$로 나뉘어야 한다. $(B,H,T,T)$ 관례에서는 둘째 축이 head이고 마지막 두 축이 query·key다. residual 출력 폭은 입력과 같은 $D$로 투영해야 한다. LayerNorm은 각 $(b,t)$의 $D$만 줄이고 FFN은 $B,T$를 보존한 채 마지막 feature 폭만 바꾼다.

각 문제는 0–3점이다. 모든 축·shape·원소 수를 맞히면 3점, 핵심은 맞고 산술 오류 하나가 있으면 2점, shape만 맞고 축 의미를 설명하지 못하면 1점, head 분할·residual·정규화 축을 잘못 두면 0점이다. 총 7점 이상이면서 **head·query/key·residual·LayerNorm 축 오류가 없어야** 통과다. 미달이면 `batch를 포함한 한 block의 shape 추적`을 다시 읽고 $(B,T,D,H,D_{\mathrm{ff}},|\mathcal V|)=(1,6,16,4,64,100)$로 재시도한다.

### 다음 문서

- [[source.055|Transformer와 자기어텐션 기반 시퀀스 모델링]] — 055Transformer와 자기어텐션 기반 시퀀스 모델링 — 원 2017년 논문의 번역 실험·복잡도 표·후속 계보를 원자료의 범위에서 다시 확인한다.
- [[concept.자기회귀-생성|자기회귀 생성]] — causal decoder가 확률을 한 token씩 곱해 문장을 만드는 이유와 생성 전략을 이어서 살핀다.

## 출처

- [[055_Transformer와 자기어텐션 기반 시퀀스 모델링]]
- [[064_Transformer-XL과 세그먼트 수준 재귀]]
- [[069_전문가 혼합과 희소 활성 스케일링]]
- Ashish Vaswani 외, [Attention Is All You Need](https://proceedings.neurips.cc/paper/7181-attention-is-all-you-need.pdf), NeurIPS 2017, pp. 5998–6008.
- Zihang Dai 외, [Transformer-XL: Attentive Language Models beyond a Fixed-Length Context](https://aclanthology.org/P19-1285/), ACL 2019, pp. 2978–2988.
- Alec Radford 외, [Improving Language Understanding by Generative Pre-Training](https://cdn.openai.com/research-covers/language-unsupervised/language_understanding_paper.pdf), 2018, §2.
- Jacob Devlin 외, [BERT](https://aclanthology.org/N19-1423/), NAACL 2019, §3.1.
- Sarthak Jain·Byron C. Wallace, [Attention is not Explanation](https://aclanthology.org/N19-1357/), NAACL 2019, pp. 3543–3556.
- Sarah Wiegreffe·Yuval Pinter, [Attention is not not Explanation](https://aclanthology.org/D19-1002/), EMNLP-IJCNLP 2019, pp. 11–20.
- Dmitry Lepikhin 외, [GShard](https://openreview.net/forum?id=qrwe7XHTmYb), ICLR 2021, §§2.1–2.2.
- William Fedus·Barret Zoph·Noam Shazeer, [Switch Transformers](https://www.jmlr.org/papers/v23/21-0998.html), JMLR 23(120), 2022, §§2–3.
- Alec Radford 외, [Robust Speech Recognition via Large-Scale Weak Supervision](https://arxiv.org/abs/2212.04356), 2022, §§2.2–2.4와 Figure 1.
- [[087_Whisper와 대규모 약한 감독 음성 인식]]
- Tri Dao 외, [FlashAttention](https://proceedings.neurips.cc/paper_files/paper/2022/hash/67d57c32e20fd0a7a302cb81d36e40d5-Abstract.html), NeurIPS 2022, §§2.2–3.2, Algorithms 0–1, Theorems 1–2와 Figure 2.
- [[088_FlashAttention과 IO 인지형 정확 어텐션]]

## 관련 항목

- [[source.055|Transformer와 자기어텐션 기반 시퀀스 모델링]]
- [[concept.자기회귀-생성|자기회귀 생성]]
- [[concept.어텐션-메커니즘|어텐션 메커니즘]]
- [[concept.잔차-연결|잔차 연결]]
- [[source.064|Transformer-XL과 세그먼트 수준 재귀]]
- [[source.069|전문가 혼합과 희소 활성 스케일링]]
- [[source.087|Whisper와 대규모 약한 감독 음성 인식]]
- [[source.088|FlashAttention과 I/O 인지형 정확 어텐션]]
- [[concept.벡터-행렬-텐서와-shape|벡터·행렬·텐서와 shape]]
- [[concept.내적-행렬곱과-선형변환|내적·행렬곱과 선형변환]]
- [[concept.소프트맥스|소프트맥스]]
- [[concept.활성화-함수|활성화 함수]]
- [[concept.계산-복잡도와-비용-모델|계산 복잡도와 비용 모델]]
- [[concept.다층-퍼셉트론|다층 퍼셉트론]]
- [[concept.미분-편미분-그래디언트|미분·편미분·그래디언트]]
- [[concept.연쇄-법칙과-계산-그래프|연쇄 법칙과 계산 그래프]]
- [[concept.역전파|역전파]]
- [[concept.whisper|Whisper]]
- [[concept.flashattention|FlashAttention]]
- [[concept.신경망-기계-번역|신경망 기계 번역]]
- [[concept.layer-normalization|Layer Normalization]]
- [[concept.transformer-xl|Transformer-XL]]
- [[concept.전문가-혼합|전문가 혼합]]
