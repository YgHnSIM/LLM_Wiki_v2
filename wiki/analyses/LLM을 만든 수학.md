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
  - concept.특이값-분해와-저랭크-근사
  - concept.활성화-함수
  - concept.계산-복잡도와-비용-모델
  - concept.표본추출-온도-top-k-top-p
  - concept.rlhf
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

### 먼저 계산 이야기를 한 문장으로 읽기

문맥 `오늘, 비가`를 받으면, 모델은 두 token을 각각 두 숫자로 바꾸고, `비가` 위치가 `오늘`과 자기 자신을 얼마나 참고할지 정한다. 그렇게 만든 문맥 표현을 네 다음 token 후보의 **점수**로 바꾼 뒤, 점수를 합이 1인 **확률**로 바꾼다. 학습 중에는 정답 `온다`의 확률이 아직 충분하지 않았다는 오차를 이용해, 이번 예에서는 bias 하나만 아주 조금 올린다.

아래 다섯 단계는 같은 이야기를 더 정확한 기호와 계산으로 다시 쓰는 것이다.

```text
오늘, 비가
→ 두 token 벡터 X
→ 문맥을 섞은 벡터 O
→ 원래 입력을 더한 표현 R
→ 네 후보 점수 z
→ 네 후보 확률 p
→ 정답 확률의 오차 J
→ bias b₃ 한 번 갱신
```

### 이번 계산의 입력·출력과 의도적 단순화

| 항목 | 이 예에서의 값 | shape 또는 범위 | 역할과 한계 |
| --- | --- | --- | --- |
| 어휘 $\mathcal V$ | `<BOS>`, 오늘, 비가, 온다의 4개 token | $\lvert\mathcal V\rvert=4$ | 실제 어휘의 축소판이며, 후보의 언어적 자연스러움을 평가하지 않는다. |
| 문맥 | 오늘, 비가 | 길이 $n=2$ | 이 문맥 뒤의 실제 다음 token을 온다로 둔다. |
| 임베딩 폭 | $d=d_k=d_v=2$ | 양의 정수 | 계산을 손으로 하기 위한 선택이다. |
| attention | 한 causal self-attention head | $Q,K,V\in\mathbb R^{2\times2}$ | 여기서 $V$는 어휘 $\mathcal V$와 다른 value 행렬이다. $W_Q,W_K,W_V$를 항등행렬로 고정해 attention의 흐름만 보인다. |
| 잔차 경로 | $R=X+O$ | $2\times2$ | LayerNorm·FFN은 생략한다. 실제 Transformer block 전체와 같지 않다. |
| 출력 | 다음 token 분포 $p$ | $p\in[0,1]^4$, $\sum_{i=0}^{3}p_i=1$ | 이 예에서는 온다 좌표 $p_3$를 정답 확률로 사용한다. |
| 학습 대상 | 출력 bias의 온다 좌표 $b_3$ 하나 | 스칼라 | 한 update를 끝까지 계산하기 위한 제한이다. 실제 학습은 모든 가중치의 gradient를 함께 계산한다. |

### 표를 읽는 세 질문

1. **무엇이 후보인가?** 어휘 $\mathcal V$는 후보 token을 모은 **집합**이다. $\lvert\mathcal V\rvert=4$는 이 예에서 후보가 네 개라는 뜻이다.
2. **무엇을 이미 아는가?** 문맥 `오늘, 비가` 두 token이 입력이다. 이 문맥이 주어진 뒤에 다음 후보들의 확률을 비교한다.
3. **무엇을 내는가?** 출력 $p$는 네 후보에 하나씩 확률을 준 벡터다. 네 값의 합은 1이고, 그중 $p_3$은 ID 3인 `온다`에 준 확률이다.

글자 모양이 비슷해도 $\mathcal V$와 $V$는 다른 대상이다. $\mathcal V$는 token들의 집합이고, attention 행의 $V$는 각 token 표현에서 만든 value **행렬**이다. 따라서 같은 기호를 보았을 때는 먼저 글꼴과 표의 `shape 또는 범위` 칸을 확인한다.

### 행·열벡터와 축을 읽는 공통 약속

이 허브의 token 표현은 **한 token이 한 행**인 행벡터 관례를 쓴다. 따라서 $X$는 `(token, feature)`, 출력 가중치는 `(input feature, candidate)`, $z=rW_{\mathrm{out}}$은 `(1,d)(d,\lvert\mathcal V\rvert)\to(1,\lvert\mathcal V\rvert)`로 읽는다.

다른 owner가 one-hot이나 gradient를 열벡터로 쓰더라도 계산 자체가 충돌하는 것은 아니다. 행벡터 $r$과 열벡터 $h=r^{\mathsf T}$는 다음처럼 전치하면 같은 선형변환을 나타낸다.

$$
z=rW
\quad\Longleftrightarrow\quad
z^{\mathsf T}=W^{\mathsf T}h
$$

한 식 안에서 행·열 관례를 섞지 않고, 전치할 때 곱의 순서와 모든 shape를 함께 바꾸는 것이 규칙이다.

| 축 | 이 허브의 뜻 | 뒤 배치의 실제 모델 표기 |
| --- | --- | --- |
| $T$ 또는 $n$ | token 위치 수 | batch가 붙으면 두 번째 축 |
| $D$ 또는 $d$ | 위치마다 가진 feature 수 | head를 나누기 전 hidden 폭 |
| $\lvert\mathcal V\rvert$ | 다음 token 후보 수 | 출력 logit의 마지막 축 |
| attention의 마지막 축 | 한 query가 비교할 key 위치 | 이 축에서 softmax |

### 시작 진단: 출력단을 읽을 준비가 되었는가

계산을 시작하기 전에 답을 보지 않고 다음 네 문항에 답한다.

1. $z=(-2,0,3)$은 합이 1이 아니어도 되는 logit인가, 이미 확률분포인가?
2. 같은 정답에 $0.75$를 준 경우와 $0.25$를 준 경우 중 어느 쪽의 $-\ln p_y$가 더 큰가?
3. 어떤 매개변수의 gradient가 음수이고 학습률이 양수라면 기본 SGD에서 그 매개변수는 커지는가, 작아지는가?
4. 역전파가 gradient를 계산하는 일과 optimizer가 매개변수를 갱신하는 일은 같은 단계인가?

1번이 막히면 [[소프트맥스]], 2번이 막히면 [[로그가능도]], 3·4번이 막히면 [[경사하강법]]을 먼저 읽는다. 답은 이 문서의 `해설과 채점 기준`에서 확인하되, 네 문항을 모두 맞혀도 attention과 전체 역전파를 이미 이해했다는 뜻은 아니다.

그래서 이 문서는 “Transformer 하나면 LLM이 된다”거나 1960년·1986년·2003년·2017년의 연구가 단선적으로 서로를 발명했다고 주장하지 않는다. 여기서 연결하는 것은 현재 LLM 훈련에서 함께 작동하는 계산 경로다. 각 단계의 완전한 정의·유도·한계는 아래 owner 문서가 맡는다.

## 2단계 — 작동 원리

### 1. token ID에서 문맥 행렬까지

**입력:** `오늘`, `비가`의 ID 1, 2다. **질문:** 각 token에 저장된 두 숫자는 무엇인가? **출력:** 두 token 벡터를 세로로 쌓은 $X$다. 이 단계는 아직 문맥을 해석하거나 두 token을 섞지 않는다. 표에서 행을 **찾아 복사하는 lookup**만 한다.

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

여기서는 ID 1이 첫째 행 $(1,0)$을, ID 2가 둘째 행 $(0,1)$을 고른다. 따라서 $X$의 첫째 행은 `오늘`, 둘째 행은 `비가`를 나타낸다. $X$의 $2\times2$는 “token이 두 개이고, 각 token을 두 수로 적었다”는 뜻이다.

### 2. causal attention으로 현재 위치의 문맥을 섞기

**입력:** 두 행을 가진 $X$다. **질문:** `비가` 위치가 다음 token을 예측할 때 `오늘`과 `비가`를 각각 얼마나 참고할까? **출력:** 두 비율과, 그 비율로 섞은 새 벡터 $O$다. 이 예에서는 둘째 위치만 다음 token 예측에 쓰므로, 둘째 행을 중심으로 읽으면 된다.

설명용으로 $W_Q=W_K=W_V=I_2$를 둔다. 따라서 $Q=K=V=X$다. 첫 위치가 미래 둘째 위치를 보지 못하도록 causal mask $M$을 더하면

$$
S=\frac{QK^{\mathsf T}}{\sqrt{2}}+M,
\qquad
M=
\begin{bmatrix}
0&-\infty\\
0&0
\end{bmatrix}
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
\end{bmatrix}
$$

즉 둘째 위치는 현재 value와 첫 위치 value를 $0.669762:0.330238$ 비율로 섞는다. $A$의 각 행은 token 확률이 아니라 현재 위치가 value를 섞는 내부 분포다. $-\infty$는 softmax 뒤 0이 될 금지 위치를 나타내는 표기이며, 실제 구현은 충분히 작은 유한값을 쓰기도 한다. score·mask·행별 정규화·가중합의 전체 유도는 [[어텐션 메커니즘]]을 따른다.

둘째 행만 말로 쓰면 “`비가`는 자기 정보를 약 67%, `오늘` 정보를 약 33% 반영한다”는 뜻이다. 이 비율은 아직 `온다`가 나올 확률이 아니다. **어떤 입력을 섞을지**를 정하는 내부 비율이고, 다음 token 확률은 4단계에서 따로 만든다.

### 3. residual을 거쳐 다음 token logit 만들기

**입력:** 원래 `비가` 벡터 $(0,1)$와 attention이 만든 둘째 행 $(0.330238,0.669762)$이다. **질문:** 새 문맥 정보만 쓰지 않고 원래 token 정보도 어떻게 남길까? **출력:** 둘을 더한 문맥 표현 $r=(0.330238,1.669762)$이다.

attention 출력과 같은 shape의 입력을 더해

$$
R=X+O=
\begin{bmatrix}
2&0\\
0.330238&1.669762
\end{bmatrix}
$$

를 만든다. 둘째 행 $r=(0.330238,1.669762)$이 문맥 뒤 다음 token을 예측할 현재 표현이다. 두 항의 마지막 차원이 모두 2여서만 성분별 덧셈이 가능하다. shortcut은 attention이 아직 유용한 변환을 만들지 못했을 때도 입력 표현의 직접 경로를 남기지만, 좋은 최적화·일반화를 보장하지는 않는다. 이 shape 조건과 항등 경로의 범위는 [[잔차 연결]]에서 확인한다.

이제 **입력 두 수를 후보 네 개의 점수로 바꾸는** 차례다. $W_{\mathrm{out}}$는 두 수를 받아 후보마다 하나의 점수를 내는 표다. 점수는 “얼마나 선호하는가”를 나타내는 비교용 수일 뿐, 아직 0과 1 사이의 확률은 아니다.

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
\approx(0,\ 0.330238,\ 1.669762,\ 3.009285)
$$

$z\in\mathbb R^4$의 네 성분은 ID 0–3 후보의 logit이다. 행벡터 $r\in\mathbb R^{1\times2}$와 $W_{\mathrm{out}}\in\mathbb R^{2\times4}$를 곱해 $1\times4$가 되므로 후보 축이 4개로 바뀐다. 이 투영은 학습되는 실제 모델 가중치의 축소판이며, 고정한 숫자가 단어 의미를 발견했다는 뜻은 아니다.

| 후보 | logit 점수 | 이 단계에서 읽는 법 |
| --- | ---: | --- |
| `<BOS>` | $0$ | 문장의 시작 표지라 다음 token으로는 낮게 점수화했다. |
| 오늘 | $0.330238$ | 후보 중 하나의 비교 점수다. |
| 비가 | $1.669762$ | 후보 중 하나의 비교 점수다. |
| 온다 | $3.009285$ | 네 점수 중 가장 크지만, 아직 확률 $3.009285$라는 뜻은 아니다. |

### 4. logit을 조건부확률과 NLL로 바꾸기

**입력:** 네 후보의 logit $z$다. **질문:** 서로 독립적인 네 점수가 아니라, 합쳐서 1이 되는 “다음 token 후보의 비중”으로 어떻게 바꿀까? **출력:** 네 확률이 든 $p$와, 정답 `온다`에 준 확률 $p_3$다.

후보 전체에 softmax를 적용하면

$$
p_i=
\frac{\exp(z_i)}{\sum_{j=0}^{3}\exp(z_j)}
\approx
(0.035746,\ 0.049734,\ 0.189844,\ 0.724676)
$$

네 값의 합은 반올림 전 1이다. 실제 다음 token을 ID 3 온다로 두면 이 예의 조건부확률은

$$
p_\theta(\text{온다}\mid\text{오늘, 비가})
=p_3
\approx0.724676
$$

따라서 logit $3.009285$가 확률 $0.724676$으로 바뀐다. softmax는 네 점수를 함께 비교해 모두 양수로 만들고, 합이 1이 되게 다시 나눈다. 그래서 `온다`의 점수가 가장 크면 확률도 가장 크지만, 점수 자체를 퍼센트나 확률로 읽을 수는 없다.

학습은 이어서 “정답 `온다`에 72.5%를 주었는데, 이 확률을 더 높이려면 얼마나 벌점을 줄까?”를 묻는다. 이 한 위치의 벌점이 $J$다.

조건부확률은 문맥이라는 정보를 받은 뒤 후보 축을 다시 정규화한 값이지, 문맥이 다음 token을 인과적으로 결정했다는 주장이 아니다. $p_3$를 높이려는 한 위치의 음의 로그가능도는

$$
J=-\ln p_3\approx0.322030
$$

로그는 확률의 곱을 합으로 바꾸고, 마이너스 부호는 낮은 정답 확률을 큰 양의 벌점으로 바꾼다. 긴 문장에서는 이 $J$를 여러 위치·예에 평균낸다. 확률의 조건화는 [[조건부 확률]], logit의 정규화는 [[소프트맥스]], 가능도와 NLL의 구분은 [[로그가능도]]에서 완전하게 다룬다.

### 5. 한 출력 bias를 역전파하고 SGD로 갱신하기

**입력:** 정답 `온다`에 준 현재 확률 $p_3\approx0.724676$과 정답 표지 1이다. **질문:** 이 확률을 높이려면 $b_3$를 어느 방향으로 얼마나 움직여야 할까? **출력:** gradient $-0.275324$와, 한 걸음 뒤의 새 bias $0.027532$다.

| 비교하는 값 | 현재 값 | 정답 또는 목표 | 차이 |
| --- | ---: | ---: | ---: |
| `온다`의 확률 | $0.724676$ | $1$ | $p_3-1=-0.275324$ |

정답 표지 1보다 현재 확률이 $0.275324$만큼 낮으므로, 이 좌표의 gradient는 음수다. SGD는 gradient를 **빼므로**, 음수를 빼는 이번 update는 $b_3$를 올린다. 즉 이 식은 “정답 `온다` 점수를 조금 더 높이라”는 방향을 숫자로 적은 것이다.

이 작은 예에서는 $W_{\mathrm{out}}$와 앞선 모든 값은 고정하고 ID 3의 output bias $b_3$만 학습한다고 하자. softmax NLL의 이 좌표 gradient는

$$
\frac{\partial J}{\partial b_3}
=
\frac{\partial J}{\partial z_3}
=p_3-1
\approx-0.275324
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
=0.027532
$$

새 bias만 다시 넣으면 $p_{3,\mathrm{new}}\approx0.730136$, $J_{\mathrm{new}}\approx0.314525$다. 이 예에서는 NLL이 $0.322030$에서 줄었지만, 모든 step·모든 데이터에서 손실이 줄거나 전역 최적해에 간다는 보장은 아니다. 실제 학습은 [[역전파]]로 $E,W_Q,W_K,W_V,W_{\mathrm{out}}$ 등 모든 매개변수의 gradient를 계산하고, [[경사하강법]] 또는 Adam 같은 optimizer가 함께 갱신한다.

이 단계를 한 문장으로 요약하면, “정답 확률이 목표보다 낮으니 그 정답의 점수를 올리는 방향으로 bias를 움직였다”이다. 실제 모델은 한 bias 하나가 아니라 훨씬 많은 매개변수를 여러 예의 평균 gradient로 함께 갱신한다.

## 3단계 — 기술과 근거

### owner가 맡는 완전한 설명과 이 허브의 국소 책임

| 현재 단계 | 완전한 owner | 이 허브에서 확인한 국소 책임 |
| --- | --- | --- |
| ID→벡터 lookup | [[단어 임베딩]] | ID 1·2가 $E$의 행을 골라 $X\in\mathbb R^{2\times2}$를 만든다. |
| score→가중합 | [[어텐션 메커니즘]] | causal mask, $2\times2$ score, 행별 softmax와 $O=AV$를 계산한다. |
| shortcut 덧셈 | [[잔차 연결]] | $X,O$의 shape가 같아서 $R=X+O$가 가능하다. |
| logit→분포 | [[소프트맥스]] | 4개 logit을 양수이고 합이 1인 후보 분포로 바꾼다. |
| 문맥과 손실 | [[조건부 확률]], [[로그가능도]] | $p_\theta(w_t\mid w_{<t})$와 $-\ln p_\theta$의 목적을 구분한다. |
| gradient→update | [[미분·편미분·그래디언트]], [[연쇄 법칙과 계산 그래프]], [[역전파]], [[경사하강법]] | 2단계에서는 $\partial J/\partial b_3$ 한 좌표를 갱신하고, 아래에서는 같은 upstream gradient를 $W_{\mathrm{out}}$과 $r$까지 전달한다. |
| finite-precision logit | [[수치 안정성과 log-sum-exp]] | 이 toy의 작은 logit에는 보이지 않는 max shift·log-softmax·mask row의 수치 경계를 맡는다. |
| 실제 batch·optimizer | [[확률변수·확률분포·기대값·분산]], [[Adam 최적화기]] | 평균·분산의 대상과 Adam state를 구분한다. toy는 한 예·한 SGD update만 계산한다. |
| 저랭크 표현·적응 | [[특이값 분해와 저랭크 근사]] | 행렬 복원에서의 절단 SVD와 task loss로 학습하는 LoRA update를 구분한다. |
| position-wise 비선형성 | [[활성화 함수]] | affine 층 사이의 ReLU·GELU가 feature를 어떻게 바꾸며 무엇을 보장하지 않는지 맡는다. |
| 실행 비용 | [[계산 복잡도와 비용 모델]] | 점근 산술량, FLOPs, memory, I/O, 통신과 wall-clock을 한 값으로 합치지 않는다. |
| 다음 token 선택 | [[표본추출·온도·top-k·top-p]] | softmax 확률에서 temperature·candidate truncation·sampling과 argmax를 구분한다. |
| 선호 기반 후훈련 | [[인간 피드백 강화학습]] | 비교 라벨·reward model·reference KL·policy optimizer의 서로 다른 역할을 구분한다. |

### 한 좌표에서 전체 출력층 gradient로 넓히기

앞의 bias 하나 갱신은 역전파의 가장 작은 조각만 떼어 본 것이다. 이제 같은 순전파 값을 그대로 두고 출력층 전체에 전달되는 gradient를 계산하자. 여기서는 표현을 행벡터로 놓았으므로

$$
r\in\mathbb R^{1\times2},
\qquad
W_{\mathrm{out}}\in\mathbb R^{2\times4},
\qquad
b,z,g_z\in\mathbb R^{1\times4}
$$

이고 $z=rW_{\mathrm{out}}+b$다. 정답 one-hot을 $e_3=(0,0,0,1)$이라 쓰면 softmax NLL이 출력층으로 보내는 upstream gradient는

$$
g_z=\frac{\partial J}{\partial z}
=p-e_3
\approx
(0.035746,\ 0.049734,\ 0.189844,\ -0.275324)
$$

이다. 네 성분의 합이 0인지 확인하면 softmax 후보 축과 target 위치를 빠르게 점검할 수 있다. 이 $g_z$를 선형층의 세 입력으로 전달하면

$$
\frac{\partial J}{\partial b}=g_z,
\qquad
\frac{\partial J}{\partial W_{\mathrm{out}}}
=r^{\mathsf T}g_z,
\qquad
\frac{\partial J}{\partial r}
=g_zW_{\mathrm{out}}^{\mathsf T}
$$

가 된다. 현재 숫자를 넣으면

$$
\frac{\partial J}{\partial W_{\mathrm{out}}}
\approx
\begin{bmatrix}
0.011805&0.016424&0.062694&-0.090922\\
0.059687&0.083043&0.316994&-0.459725
\end{bmatrix},
\qquad
\frac{\partial J}{\partial r}
\approx
(0.325057,\ -0.360803)
$$

이다. $r^{\mathsf T}g_z$의 shape는 $2\times4$라 $W_{\mathrm{out}}$과 정확히 같다. $g_zW_{\mathrm{out}}^{\mathsf T}$의 shape는 $1\times2$라 앞선 표현 $r$과 같다. 이 두 검사는 전치를 외운 결과가 아니라, 각 저장 좌표가 어느 gradient를 받아야 하는지 차원으로 확인한 것이다.

이 계산은 `scripts/llm-math-toy.mjs`에서 같은 정밀도의 순전파·역전파로 실행할 수 있다. 예를 들어 $W_{\mathrm{out}}$의 둘째 행·넷째 열에 대한 해석적 gradient $-0.459725$는 중심 차분과 오차 $10^{-9}$ 이내에서 맞고, 출력층 전체를 작은 SGD 한 걸음 갱신하면 이 예의 NLL이 감소한다. 수치 미분 일치는 구현한 국소 도함수의 강한 점검이지만, 학습 전체의 정확성이나 일반화를 증명하지는 않는다.

한 단계 더 앞에서는 $r=X_2+O_2$였으므로 $\partial J/\partial r$은 덧셈 노드에서 직접 $X_2$ 경로와 $O_2$ 경로로 각각 전달된다. 다만 $O_2$도 $X$에서 계산됐기 때문에 최종 $\partial J/\partial X$는 shortcut 기여와 attention 경로 기여를 **더해야** 한다. 잔차 연결이 있다고 해서 전체 입력 gradient가 단순히 $\partial J/\partial r$ 하나와 같아지는 것은 아니다. 이 경로 곱과 분기 합은 [[연쇄 법칙과 계산 그래프]], 실제 매개변수별 누적은 [[역전파]]의 책임이다.

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

### 개념 확인

1. token ID와 임베딩 벡터는 각각 무엇이며, 왜 같은 값으로 취급할 수 없는가?

   **답:** ID는 임베딩 표의 행을 고르는 이산 표지이고, 벡터는 그 행에 저장된 연속 수치 표현이다. 이 예에서 ID $(1,2)$가 $X$의 두 행을 골랐다.

2. 둘째 attention 행의 $(0.330238,0.669762)$는 다음 token 확률과 어떻게 다른가?

   **답:** 이는 현재 위치가 두 value를 섞는 내부 비율이다. 다음 token 후보 4개의 확률은 출력 logit에 softmax를 적용한 $p$가 담당한다.

3. $b_3$의 gradient가 음수인데 SGD 식에는 왜 마이너스 부호가 있는가?

   **답:** $b_3\leftarrow b_3-\eta(-0.275324)$이므로 $b_3$는 커진다. 정답 token logit과 확률이 높아져 이 예의 NLL은 작아진다.

### 마스터리 연습

#### 완전 풀이 확인

본문의 4·5단계를 가리고 $z\to p\to J\to\partial J/\partial b_3\to b_{3,\mathrm{new}}$를 다시 계산한다. 각 줄에서 입력이 logit, 확률, 손실, gradient, update 중 무엇인지 표시한다.

#### 부분 완성

네 후보의 새 로짓과 정답을 다음처럼 둔다.

$$
z=(0,\ln2,\ln3,\ln4),
\qquad y=2
$$

인덱스는 0부터 세므로 정답은 셋째 후보다. 다음 빈칸을 채운다.

$$
\exp(z)=\square,
\qquad
p=\square,
\qquad
J=-\ln p_y=\square
$$

#### 새 수치 전이

one-hot target을 $e_y=(0,0,1,0)$이라 쓰고, 모든 출력 bias를 함께 학습한다고 하자. 다음을 계산한다.

$$
g_z=p-e_y,
\qquad
b_{\mathrm{new}}=0-0.1g_z
$$

새 bias를 로짓에 더한 뒤 정답 확률과 NLL이 어느 방향으로 변하는지 검산한다. 계산기는 마지막 지수·로그 검산에만 사용하고, 먼저 부호와 합을 예측한다.

#### 오류 진단

다음 세 설명에서 오류를 찾아 고쳐라.

1. “정답 후보만 gradient를 가지므로 오답 logit은 그대로다.”
2. “logit 네 개에 각각 sigmoid를 적용하면 다음 token 확률의 합은 자동으로 1이다.”
3. “한 예의 NLL이 한 번 줄었으므로 전체 데이터의 일반화 성능도 좋아졌다.”

#### 표현·attention 부분 완성

새 설명용 임베딩 표와 문맥 ID를 다음처럼 둔다.

$$
E=
\begin{bmatrix}
0&0\\
1&1\\
1&-1\\
-1&1
\end{bmatrix},
\qquad
\text{IDs}=(2,1)
$$

lookup한 $X\in\mathbb R^{2\times2}$를 적는다. 이어 $Q=K=0$, $V=X$이고 causal mask가 있다고 하자. 허용된 score가 모두 0일 때 attention 가중치 $A$, 출력 $O=AV$, 잔차 결과 $R=X+O$를 계산한다.

#### 표현·attention 새 수치 전이

앞 문제의 token 순서를 IDs $(1,2)$로 바꿔 같은 계산을 다시 한다. 첫 위치의 출력이 왜 순서 교환 전과 단순히 같을 수 없는지, causal mask가 허용하는 value 집합으로 설명한다.

#### mask·잔차 오류 진단

다음 두 오류를 고쳐라.

1. $A$를 key별 열 방향으로 정규화해 각 query 행의 합이 1이 아니게 됐다.
2. $X$의 shape가 $(2,2)$인데 branch 출력 $O$를 $(2,1)$로 만든 뒤 broadcasting으로 $R=X+O$를 계산했다.

#### 전체 출력층 gradient 전이

본문의 $r$, $W_{\mathrm{out}}$, $p$, target $y=3$을 그대로 사용하되 `한 좌표에서 전체 출력층 gradient로 넓히기`의 답을 가리고 다음을 수행하라.

1. $g_z=p-e_3$를 구하고 성분 합을 검산한다.
2. $\partial J/\partial W_{\mathrm{out}}$, $\partial J/\partial b$, $\partial J/\partial r$을 계산하고 원래 변수와 shape가 같은지 표시한다.
3. 둘째 행·넷째 열의 가중치를 $\epsilon=10^{-4}$만큼 양쪽으로 움직인 중심 차분과 해석적 gradient를 비교한다.
4. 잔차 $r=X_2+O_2$에서 직접 경로와 attention 경로가 최종 $X$ gradient에 어떻게 합쳐지는지 말로 설명한다.

### 해설과 채점 기준

시작 진단의 답은 차례로 **logit**, $0.25$인 경우, **커진다**, **서로 다른 단계다**이다.

부분 완성에서는 $\exp(z)=(1,2,3,4)$, 합은 10, $p=(0.1,0.2,0.3,0.4)$다. 정답 NLL은 $-\ln0.3\approx1.203973$이다.

모든 출력 bias의 gradient와 update는 다음과 같다.

$$
g_z=(0.1,0.2,-0.7,0.4),
\qquad
b_{\mathrm{new}}=(-0.01,-0.02,0.07,-0.04)
$$

gradient의 네 성분 합은 0이다. 새 bias를 더하면 정답 확률은 약 $0.321395$로 커지고 NLL은 약 $1.135085$로 줄어든다. 이는 이 한 예와 이 작은 step에서의 검산이지 전체 학습 보장이 아니다.

오류 진단의 핵심은 세 가지다. softmax NLL에서는 모든 후보가 $p_i-\mathbf1[i=y]$의 gradient를 가진다. 서로 배타적인 다음 token 후보는 후보 축 softmax로 합 1을 만들며 독립 sigmoid는 그 합을 보장하지 않는다. 마지막으로 훈련 예 하나의 손실 감소는 평균 훈련 손실·검증 손실·일반화를 대신하지 않는다.

표현·attention 부분 완성의 답은 다음과 같다.

$$
X=
\begin{bmatrix}
1&-1\\
1&1
\end{bmatrix},
\qquad
A=
\begin{bmatrix}
1&0\\
1/2&1/2
\end{bmatrix}
$$

$$
O=
\begin{bmatrix}
1&-1\\
1&0
\end{bmatrix},
\qquad
R=
\begin{bmatrix}
2&-2\\
2&1
\end{bmatrix}
$$

순서를 $(1,2)$로 바꾸면 $X'=\begin{bmatrix}1&1\\1&-1\end{bmatrix}$, $O'=\begin{bmatrix}1&1\\1&0\end{bmatrix}$, $R'=\begin{bmatrix}2&2\\2&-1\end{bmatrix}$다. causal mask 아래 첫 행의 후보 집합은 언제나 첫 위치 하나뿐이므로, token 순서를 바꾸면 첫 출력도 그 새 value로 바뀐다. attention은 행별 key 축에서 정규화해야 하며, residual의 두 항은 같은 `(token, feature)` shape에서 같은 feature끼리 더해야 한다.

전체 출력층 문제의 답은 본문의 $g_z$, $2\times4$ 가중치 gradient, $1\times4$ bias gradient, $1\times2$ 표현 gradient와 같다. $W_{\mathrm{out}}[1,3]$의 중심 차분은 약 $-0.459725$로 해석값과 일치한다. 잔차 덧셈은 upstream gradient를 두 branch에 보내고, attention branch가 다시 $X$에 의존하므로 최종 $X$ gradient는 shortcut과 attention 경로의 기여 합이다.

| 평가 항목 | 2점 | 1점 | 0점 |
| --- | --- | --- | --- |
| 종류·shape 구분 | logit·확률·손실·gradient·update를 모두 구분 | 한 쌍을 혼동 | 여러 종류를 같은 값으로 취급 |
| 확률·손실 계산 | 새 수치와 합 1, NLL을 정확히 검산 | 산술 오류 하나 | 잘못된 축 또는 logit을 확률로 읽음 |
| gradient·update | 네 성분과 부호, 합 0을 설명 | 정답 성분만 맞음 | gradient와 update를 혼동 |
| 한계 판정 | 한 예의 감소와 일반화를 구분 | 결론만 말함 | 일반화가 보장된다고 주장 |
| 표현·shape | ID lookup과 token·feature 축을 정확히 기록 | 값 또는 축 하나만 맞음 | ID를 연속 크기로 취급 |
| attention·residual | mask, 행별 합 1, 가중합과 같은-shape 덧셈을 모두 검산 | 산술 오류 하나 | 미래 누출·열 정규화·잘못된 broadcasting |
| 전체 역전파 | $g_z$, 세 gradient shape, 유한차분과 분기 합을 모두 검산 | 값·shape·경로 중 하나 누락 | 전치를 뒤집거나 shortcut 경로만 계산 |

총 14점 중 12점 이상이고, **확률 축·causal mask·shape·target 위치·gradient 부호·분기 합산 오류가 하나도 없어야** 현재 순전파와 출력단을 통과한다. 미달이면 각 오류에 대응하는 [[단어 임베딩]], [[어텐션 메커니즘]], [[잔차 연결]], [[미분·편미분·그래디언트]], [[연쇄 법칙과 계산 그래프]], [[역전파]], [[소프트맥스]], [[로그가능도]], [[경사하강법]]의 마스터리 연습을 풀고 새 ID 순서와 $z=(\ln4,\ln3,\ln2,0)$, $y=1$로 재시도한다.

### 다음 문서

- [[수치 안정성과 log-sum-exp]] — softmax·NLL을 finite precision에서 계산할 때의 max shift·mask·blockwise 누적을 이어서 본다.
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
- [[특이값 분해와 저랭크 근사]]
- [[활성화 함수]]
- [[계산 복잡도와 비용 모델]]
- [[표본추출·온도·top-k·top-p]]
- [[인간 피드백 강화학습]]
- [[Transformer]]
- [[대규모 언어 모델]]
- [[035_신경 확률 언어 모형과 분산 단어 표현]]
- [[018_역전파와 다층 신경망 학습]]
- [[055_Transformer와 자기어텐션 기반 시퀀스 모델링]]
