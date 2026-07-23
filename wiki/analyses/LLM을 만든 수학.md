---
schema_version: 2
id: analysis.llm을-만든-수학
page_type: analysis
title: LLM을 만든 수학
aliases:
  - LLM을 위한 수학 경로
  - LLM math pathway
  - token에서 SGD update까지
tags:
  - type/analysis
  - domain/ai
  - domain/nlp
  - domain/machine-learning
  - domain/mathematics
created: '2026-07-23'
updated: '2026-07-24'
lifecycle: active
verification: partial
artifacts:
  - 'raw/035_Neural Probabilistic Language Model - Distributed Word Representations and Neural Language Modeling.ko.md'
  - 'raw/035_Neural Probabilistic Language Model - Distributed Word Representations and Neural Language Modeling.commentary.ko.md'
  - raw/018_Backpropagation - Training Deep Neural Networks.ko.md
  - raw/018_Backpropagation - Training Deep Neural Networks.commentary.ko.md
  - 'raw/055_The Transformer Attention Is All You Need.ko.md'
  - 'raw/055_The Transformer Attention Is All You Need.commentary.ko.md'
evidence:
  - source_id: bengio-et-al-2003-nplm
    locator: 'JMLR 3, pp. 1141–1143의 distributed word feature·softmax 다음 단어 확률·penalized log-likelihood 학습'
    relation: supports
  - source_id: vaswani-et-al-2017-attention
    locator: 'pp. 5998–6002, 특히 §3.1–3.2의 residual connection과 scaled dot-product attention'
    relation: supports
  - source_id: rumelhart-hinton-williams-1986-pdp
    locator: 'pp. 322–328의 합성된 오차 함수에 대한 가중치 변화율과 일반화 델타 규칙'
    relation: supports
  - source_id: widrow-hoff-1960
    locator: 'Adaptive Switching Circuits의 제곱오차 적응 갱신'
    relation: contextualizes
related:
  - concept.단어-임베딩
  - concept.어텐션-메커니즘
  - concept.잔차-연결
  - concept.소프트맥스
  - concept.수치-안정성과-log-sum-exp
  - concept.조건부-확률
  - concept.로그-가능도
  - concept.역전파
  - concept.경사하강법
  - concept.확률변수-확률분포-기대값-분산
  - concept.adam-최적화기
  - concept.transformer
  - concept.대규모-언어-모델
  - source.035
  - source.018
  - source.055
---
# LLM을 만든 수학

> [!note] 학습 안내
> **난이도:** 기초 → 심화<br>
> **선수 지식:** 없음 — token ID, 벡터, 확률, 손실과 gradient를 이 작은 계산 안에서 차례로 정의한다.<br>
> **읽고 나면:** 두 token의 문맥이 attention과 residual을 거쳐 다음 token 확률이 되고, 그 확률의 NLL에서 출력 bias 하나를 한 번 SGD 갱신하는 전 과정을 손으로 재현할 수 있다.

## 1단계 — 먼저 잡을 핵심

### 이 허브가 답하는 질문

대규모 언어 모델(LLM)은 이미 읽은 token 열을 입력으로 받아 다음 token 후보 전체의 조건부확률을 만든다. 학습에서는 실제 다음 token에 준 확률이 커지도록 손실을 줄이고, 생성에서는 학습된 가중치를 고정한 채 그 분포에서 다음 token을 고른다.

이 허브는 그 흐름을 한 번에 보이기 위해 **4개 token과 2차원 벡터**만 쓰는 계산을 만든다. 실제 LLM은 수만 개 이상 후보, 많은 층·head, batch, 정규화·optimizer state와 분산 실행을 쓴다. 아래 숫자는 어느 공개 모델의 activation이나 학습 기록이 아니라, 각 수학이 어느 입력을 받아 무엇을 내는지 보이는 편집부 예다.

### 이번 계산의 입력·출력과 의도적 단순화

| 항목 | 이 예에서의 값 | shape 또는 범위 | 역할과 한계 |
| --- | --- | --- | --- |
| 어휘 $V$ | <BOS>, 오늘, 비가, 온다의 4개 token | $|V|=4$ | 실제 어휘의 축소판이며, 후보의 언어적 자연스러움을 평가하지 않는다. |
| 문맥 | 오늘, 비가 | 길이 $n=2$ | 이 문맥 뒤의 실제 다음 token을 온다로 둔다. |
| 임베딩 폭 | $d=d_k=d_v=2$ | 양의 정수 | 계산을 손으로 하기 위한 선택이다. |
| attention | 한 causal self-attention head | $Q,K,V\in\mathbb R^{2\times2}$ | $W_Q,W_K,W_V$를 항등행렬로 고정해 attention의 흐름만 보인다. |
| 잔차 경로 | $R=X+O$ | $2\times2$ | LayerNorm·FFN은 생략한다. 실제 Transformer block 전체와 같지 않다. |
| 학습 대상 | 출력 bias의 온다 좌표 $b_3$ 하나 | 스칼라 | 한 update를 끝까지 계산하기 위한 제한이다. 실제 학습은 모든 가중치의 gradient를 함께 계산한다. |

그래서 이 문서는 “Transformer 하나면 LLM이 된다”거나 1960년·1986년·2003년·2017년의 연구가 단선적으로 서로를 발명했다고 주장하지 않는다. 여기서 연결하는 것은 현재 LLM 훈련에서 함께 작동하는 계산 경로다. 각 단계의 완전한 정의·유도·한계는 아래 owner 문서가 맡는다.

## 2단계 — 작동 원리

### 1. token ID에서 문맥 행렬까지

어휘 표의 행 번호를 token ID로 정하고, 임베딩 행렬 $E\in\mathbb R^{4\times2}$를 다음처럼 둔다.

$$
\begin{array}{c|c|c}
\text{ID} & \text{token} & E_{\text{ID}}\\
\hline
0 & \text{<BOS>} & (0,0)\\
1 & \text{오늘} & (1,0)\\
2 & \text{비가} & (0,1)\\
3 & \text{온다} & (0.5,0.5)
\end{array}
$$

현재 문맥 ID가 $(1,2)$이므로 lookup은 두 행을 순서대로 모아

$$
X=
\begin{bmatrix}
1&0\\
0&1
\end{bmatrix}
\in\mathbb R^{2\times2}
$$

를 만든다. 행은 token 위치, 열은 feature다. 오늘과 비가의 ID가 벡터의 값과 같은 뜻은 아니다. ID는 행을 고르는 이산 표지이고, 벡터는 학습되는 연속 표현이다. lookup의 정의와 희귀어·정적 표현의 한계는 [[단어 임베딩]]에서 다룬다.

### 2. causal attention으로 현재 위치의 문맥을 섞기

설명용으로 $W_Q=W_K=W_V=I_2$를 둔다. 따라서 $Q=K=V=X$다. 첫 위치가 미래 둘째 위치를 보지 못하도록 causal mask $M$을 더하면

$$
S=\frac{QK^{\mathsf T}}{\sqrt{2}}+M,
\qquad
M=
\begin{bmatrix}
0&-\infty\\
0&0
\end{bmatrix}.
$$

둘째 위치의 score 행은 $(0,1/\sqrt2)\approx(0,0.7071)$이다. 행별 softmax를 적용한 attention 가중치와 value 가중합은

$$
A=
\begin{bmatrix}
1&0\\
0.330238&0.669762
\end{bmatrix},
\qquad
O=AV=
\begin{bmatrix}
1&0\\
0.330238&0.669762
\end{bmatrix}.
$$

즉 둘째 위치는 현재 value와 첫 위치 value를 $0.669762:0.330238$ 비율로 섞는다. $A$의 각 행은 token 확률이 아니라 현재 위치가 value를 섞는 내부 분포다. $-\infty$는 softmax 뒤 0이 될 금지 위치를 나타내는 표기이며, 실제 구현은 충분히 작은 유한값을 쓰기도 한다. score·mask·행별 정규화·가중합의 전체 유도는 [[어텐션 메커니즘]]을 따른다.

### 3. residual을 거쳐 다음 token logit 만들기

attention 출력과 같은 shape의 입력을 더해

$$
R=X+O=
\begin{bmatrix}
2&0\\
0.330238&1.669762
\end{bmatrix}
$$

를 만든다. 둘째 행 $r=(0.330238,1.669762)$이 문맥 뒤 다음 token을 예측할 현재 표현이다. 두 항의 마지막 차원이 모두 2여서만 성분별 덧셈이 가능하다. shortcut은 attention이 아직 유용한 변환을 만들지 못했을 때도 입력 표현의 직접 경로를 남기지만, 좋은 최적화·일반화를 보장하지는 않는다. 이 shape 조건과 항등 경로의 범위는 [[잔차 연결]]에서 확인한다.

출력 투영을

$$
W_{\mathrm{out}}=
\begin{bmatrix}
0&1&0&-1\\
0&0&1&2
\end{bmatrix}
\in\mathbb R^{2\times4},
\qquad b=0\in\mathbb R^4
$$

로 고정하자. $r$을 행벡터로 쓰면

$$
z=rW_{\mathrm{out}}+b
\approx(0,\ 0.330238,\ 1.669762,\ 3.009285).
$$

$z\in\mathbb R^4$의 네 성분은 ID 0–3 후보의 logit이다. 행벡터 $r\in\mathbb R^{1\times2}$와 $W_{\mathrm{out}}\in\mathbb R^{2\times4}$를 곱해 $1\times4$가 되므로 후보 축이 4개로 바뀐다. 이 투영은 학습되는 실제 모델 가중치의 축소판이며, 고정한 숫자가 단어 의미를 발견했다는 뜻은 아니다.

### 4. logit을 조건부확률과 NLL로 바꾸기

후보 전체에 softmax를 적용하면

$$
p_i=
\frac{\exp(z_i)}{\sum_{j=0}^{3}\exp(z_j)}
\approx
(0.035746,\ 0.049734,\ 0.189844,\ 0.724676).
$$

네 값의 합은 반올림 전 1이다. 실제 다음 token을 ID 3 온다로 두면 이 예의 조건부확률은

$$
p_\theta(\text{온다}\mid\text{오늘, 비가})
=p_3
\approx0.724676.
$$

조건부확률은 문맥이라는 정보를 받은 뒤 후보 축을 다시 정규화한 값이지, 문맥이 다음 token을 인과적으로 결정했다는 주장이 아니다. $p_3$를 높이려는 한 위치의 음의 로그가능도는

$$
J=-\ln p_3\approx0.322030.
$$

로그는 확률의 곱을 합으로 바꾸고, 마이너스 부호는 낮은 정답 확률을 큰 양의 벌점으로 바꾼다. 긴 문장에서는 이 $J$를 여러 위치·예에 평균낸다. 확률의 조건화는 [[조건부 확률]], logit의 정규화는 [[소프트맥스]], 가능도와 NLL의 구분은 [[로그가능도]]에서 완전하게 다룬다.

### 5. 한 출력 bias를 역전파하고 SGD로 갱신하기

이 작은 예에서는 $W_{\mathrm{out}}$와 앞선 모든 값은 고정하고 ID 3의 output bias $b_3$만 학습한다고 하자. softmax NLL의 이 좌표 gradient는

$$
\frac{\partial J}{\partial b_3}
=
\frac{\partial J}{\partial z_3}
=p_3-1
\approx-0.275324.
$$

첫 등식은 $b_3$가 $z_3$에 1을 더한다는 사실, 둘째 등식은 target one-hot과 softmax의 차이에서 나온다. $b_3$를 조금 키우면 정답 온다의 logit이 커지고 현재 손실은 작아지므로 gradient가 음수다. 이 단일 좌표의 중심 차분도

$$
\frac{J(b_3+0.001)-J(b_3-0.001)}{0.002}
\approx-0.275324
$$

로 해석적 gradient와 일치한다.

학습률 $\eta=0.1$인 SGD 한 걸음은

$$
b_{3,\mathrm{new}}
=0-0.1(-0.275324)
=0.027532.
$$

새 bias만 다시 넣으면 $p_{3,\mathrm{new}}\approx0.730136$, $J_{\mathrm{new}}\approx0.314525$다. 이 예에서는 NLL이 $0.322030$에서 줄었지만, 모든 step·모든 데이터에서 손실이 줄거나 전역 최적해에 간다는 보장은 아니다. 실제 학습은 [[역전파]]로 $E,W_Q,W_K,W_V,W_{\mathrm{out}}$ 등 모든 매개변수의 gradient를 계산하고, [[경사하강법]] 또는 Adam 같은 optimizer가 함께 갱신한다.

## 3단계 — 기술과 근거

### owner가 맡는 완전한 설명과 이 허브의 국소 책임

| 현재 단계 | 완전한 owner | 이 허브에서 확인한 국소 책임 |
| --- | --- | --- |
| ID→벡터 lookup | [[단어 임베딩]] | ID 1·2가 $E$의 행을 골라 $X\in\mathbb R^{2\times2}$를 만든다. |
| score→가중합 | [[어텐션 메커니즘]] | causal mask, $2\times2$ score, 행별 softmax와 $O=AV$를 계산한다. |
| shortcut 덧셈 | [[잔차 연결]] | $X,O$의 shape가 같아서 $R=X+O$가 가능하다. |
| logit→분포 | [[소프트맥스]] | 4개 logit을 양수이고 합이 1인 후보 분포로 바꾼다. |
| 문맥과 손실 | [[조건부 확률]], [[로그가능도]] | $p_\theta(w_t\mid w_{<t})$와 $-\ln p_\theta$의 목적을 구분한다. |
| gradient→update | [[역전파]], [[경사하강법]] | $\partial J/\partial b_3$를 계산하고 $\eta$를 곱해 한 좌표를 갱신한다. |
| finite-precision logit | [[수치 안정성과 log-sum-exp]] | 이 toy의 작은 logit에는 보이지 않는 max shift·log-softmax·mask row의 수치 경계를 맡는다. |
| 실제 batch·optimizer | [[확률변수·확률분포·기대값·분산]], [[Adam 최적화기]] | 평균·분산의 대상과 Adam state를 구분한다. toy는 한 예·한 SGD update만 계산한다. |

2003년 Bengio 등은 분산 word feature, 다음 단어 확률을 위한 softmax와 penalized log-likelihood 학습을 함께 제시했다. 2017년 Vaswani 등은 scaled dot-product attention과 residual connection을 Transformer의 sublayer에 배치했다. Rumelhart·Hinton·Williams의 1986년 설명은 합성된 오차 함수에서 가중치 변화율을 계산하는 신경망 학습의 중요한 근거다. 이 문서의 toy 계산은 이 자료들의 실제 차원·실험·훈련 조건을 복제하지 않는다.

### 수학적 귀결과 설계 선택

조건부확률의 후보 축은 합이 1이어야 하고, softmax는 유한 logit에서 양수 확률을 만든다. target의 NLL을 $b_3$로 미분하면 $p_3-1$이 나오는 것은 위에서 정한 softmax·NLL의 수학적 귀결이다. 반면 어휘를 4개로 줄인 일, 임베딩 폭을 2로 고른 일, 항등 $Q,K,V$ 투영, LayerNorm·FFN 생략, 출력 bias 하나만 학습한 일, $\eta=0.1$은 모두 설명을 위한 설계 선택이다.

수학의 형성, 수치·자동미분, 기계학습 도입, 현대 LLM 사용은 다른 층이다. 이 문서는 각 층의 현재 역할을 연결하지만, 식이 닮았다는 이유만으로 단일 발명자·직접 영향·현대 능력의 단일 원인을 주장하지 않는다.

## 검증과 한계

### 이 계산이 보장하지 않는 것

- attention의 내부 가중치 $A$는 value를 섞는 비율이지 사람의 설명이나 인과적 중요도의 자동 증거가 아니다.
- $p_3\approx0.725$는 이 toy 모델이 둔 조건부확률일 뿐, 실제 세계에서 문장이 참일 확률이나 모델의 보정된 신뢰도는 아니다.
- 한 bias의 NLL이 줄었다고 전체 자료의 평균 손실·일반화·사실성·안전성도 좋아진다는 결론은 나오지 않는다.
- 실제 Transformer의 multi-head 투영, 위치 표현, FFN, LayerNorm, batch 평균, Adam state, mixed precision과 분산 실행은 생략했다. 그 요소는 같은 계산 흐름에 추가 조건·shape·수치 문제를 만든다. 특히 [[수치 안정성과 log-sum-exp]]의 max shift와 [[확률변수·확률분포·기대값·분산]]의 표본 통계는 이 작은 수에서 생략한 구현·학습 경계다.

## 학습 확인

1. token ID와 임베딩 벡터는 각각 무엇이며, 왜 같은 값으로 취급할 수 없는가?

   **답:** ID는 임베딩 표의 행을 고르는 이산 표지이고, 벡터는 그 행에 저장된 연속 수치 표현이다. 이 예에서 ID $(1,2)$가 $X$의 두 행을 골랐다.

2. 둘째 attention 행의 $(0.330238,0.669762)$는 다음 token 확률과 어떻게 다른가?

   **답:** 이는 현재 위치가 두 value를 섞는 내부 비율이다. 다음 token 후보 4개의 확률은 출력 logit에 softmax를 적용한 $p$가 담당한다.

3. $b_3$의 gradient가 음수인데 SGD 식에는 왜 마이너스 부호가 있는가?

   **답:** $b_3\leftarrow b_3-\eta(-0.275324)$이므로 $b_3$는 커진다. 정답 token logit과 확률이 높아져 이 예의 NLL은 작아진다.

### 다음 문서

- [[수치 안정성과 log-sum-exp]] — softmax·NLL을 finite precision에서 계산할 때의 max shift·mask·blockwise 누적을 이어서 본다.
- [[Adam 최적화기]] — toy SGD 한 번과 달리, 실제 확률적 gradient의 이동평균으로 좌표별 update를 만드는 방법을 본다.
- [[대규모 언어 모델]] — toy 계산을 넘어 자료·구조·계산·평가가 함께 바꾸는 실제 LLM 범위를 이어서 본다.

## 출처

- [[035_신경 확률 언어 모형과 분산 단어 표현]]
- [[018_역전파와 다층 신경망 학습]]
- [[055_Transformer와 자기어텐션 기반 시퀀스 모델링]]
- Yoshua Bengio·Réjean Ducharme·Pascal Vincent·Christian Jauvin, [A Neural Probabilistic Language Model](https://www.jmlr.org/papers/v3/bengio03a.html), 2003, pp. 1141–1143.
- Ashish Vaswani 외, [Attention Is All You Need](https://proceedings.neurips.cc/paper/7181-attention-is-all-you-need.pdf), 2017, §3.1–3.2.
- David E. Rumelhart·Geoffrey E. Hinton·Ronald J. Williams, [Learning Internal Representations by Error Propagation](https://doi.org/10.7551/mitpress/5236.003.0012), 1986, pp. 322–328.
- Bernard Widrow·Marcian E. Hoff, [Adaptive Switching Circuits](https://isl.stanford.edu/~widrow/papers/c1960adaptiveswitching.pdf), 1960.

## 관련 항목

- [[단어 임베딩]]
- [[어텐션 메커니즘]]
- [[잔차 연결]]
- [[소프트맥스]]
- [[수치 안정성과 log-sum-exp]]
- [[조건부 확률]]
- [[로그가능도]]
- [[역전파]]
- [[경사하강법]]
- [[확률변수·확률분포·기대값·분산]]
- [[Adam 최적화기]]
- [[Transformer]]
- [[대규모 언어 모델]]
- [[035_신경 확률 언어 모형과 분산 단어 표현]]
- [[018_역전파와 다층 신경망 학습]]
- [[055_Transformer와 자기어텐션 기반 시퀀스 모델링]]
