---
schema_version: 3
id: concept.xlnet-roberta-albert
page_type: concept
title: XLNet·RoBERTa·ALBERT
aliases:
  - XLNet
  - RoBERTa
  - ALBERT
  - BERT 개선 모델
tags:
  - type/concept
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
  - 'raw/061_XLNet, RoBERTa, ALBERT Refining BERT with Permutation Modeling, Training Optimization, and Parameter Efficiency.ko.md'
  - 'raw/061_XLNet, RoBERTa, ALBERT Refining BERT with Permutation Modeling, Training Optimization, and Parameter Efficiency.commentary.ko.md'
evidence:
  - source_id: bert-2019
    locator: §3.1과 Appendix A.2의 MLM 15%·80/10/10 표본화와 NSP 구성
    relation: contextualizes
  - source_id: yang-et-al-2019-xlnet
    locator: §§2.1–2.6의 generalized autoregressive objective·two-stream attention·Transformer-XL 결합과 §3의 ablation
    relation: supports
  - source_id: liu-et-al-2019-roberta
    locator: §§3–5의 data·masking·NSP·batch·training duration 통제 비교와 최종 결과
    relation: supports
  - source_id: lan-et-al-2020-albert
    locator: §§3–5와 Tables 1–5의 factorization·layer sharing·SOP·parameter/compute 비교
    relation: supports
relations:
  - target: source.061
    kind: related
  - target: concept.transformer
    kind: related
  - target: concept.transformer-xl
    kind: related
learning:
  difficulty:
    entry: intermediate
    target: intermediate
  prerequisites:
    - target: concept.bert
    - target: concept.마스크드-언어-모델링
  assumed_knowledge: 없음
  outcomes:
    - 세 모델을 하나의 후속 버전 계보로 보지 않고 objective·training recipe·parameterization의 세 비교축으로 설명할 수 있다.
  next:
    - target: concept.glue-superglue
      reason: GLUE와 SuperGLUE — 서로 다른 모델의 전이 성능을 집계 점수로 비교할 때 숨는 조건을 살핀다.
    - target: analysis.사전-학습-지식은-과제에-어떻게-도착하는가
      reason: 사전 학습 지식은 과제에 어떻게 도착하는가 — 사전 학습 결과가 특징·미세조정·prompting을 통해 후속 과제로 전달되는 방식을 비교한다.
---
# XLNet·RoBERTa·ALBERT

> [!note] 학습 안내
> **난이도:** 중급<br>
> **선수 지식:** [[concept.bert|BERT]], [[concept.마스크드-언어-모델링|마스크드 언어 모델링]]<br>
> **읽고 나면:** 세 모델을 하나의 후속 버전 계보로 보지 않고 objective·training recipe·parameterization의 세 비교축으로 설명할 수 있다.

## 1단계 — 먼저 잡을 핵심

XLNet·RoBERTa·ALBERT는 2019년 전후에 [[BERT]]의 서로 다른 병목을 겨냥한 세 연구다. XLNet은 `[MASK]` 없는 **사전 학습 목표(objective)** 를, RoBERTa는 BERT를 실제로 얼마나·어떻게 학습시켰는지인 **훈련 recipe** 를, ALBERT는 같은 기능을 담는 매개변수의 수와 **배치(parameterization)** 를 중심에 놓았다. 이름을 한 묶음으로 쓰더라도 같은 architecture 계열의 순차 버전이라는 뜻은 아니다.

| 바꾼 층 | 먼저 물어야 할 질문 | 대표 모델 |
|---|---|---|
| 목표 | 모델은 어느 token을 어떤 문맥에서 맞혀야 하는가? | XLNet |
| recipe | 같은 목표·구조라도 data, batch, mask, 학습 횟수를 어떻게 정하는가? | RoBERTa |
| 매개변수화 | 같은 차원의 표현을 만들 때 어떤 행렬을 저장·공유하는가? | ALBERT |

이 셋을 구분하면 “점수가 더 높다”를 하나의 아이디어 효과라고 성급히 읽지 않게 된다. 목표를 비교할 때에는 backbone과 data를, recipe를 비교할 때에는 총 token·compute를, 매개변수화를 비교할 때에는 저장량과 반복 계산을 함께 맞춰야 한다.

## 2단계 — 작동 원리

### 세 token 문장을 세 방식으로 읽는 최소 예

원문 token sequence를 $x=(x_1,x_2,x_3)=(\text{비},\text{가},\text{온다})$라고 하자. 아래는 실제 논문의 성능 수치가 아니라 세 설계를 구별하기 위한 설명용 최소 예다.

| 접근 | 입력·예측에서 일어나는 일 | 바꾸려는 병목 |
|---|---|---|
| BERT의 MLM | 가운데 위치를 고르면 입력 일부를 `[MASK]` 등으로 바꾼 뒤 원래 $x_2=\text{가}$를 맞힌다. 여러 선택 위치의 손실을 병렬로 더한다. | 양쪽 문맥을 쓰되 학습 입력에 인공 표식이 생긴다. |
| XLNet | 자연어 위치 1–2–3은 그대로 두고, 예를 들어 $z=(2,1,3)$이라는 **예측 순서**를 뽑는다. $x_2$를 먼저, $x_1$을 $x_2$ 뒤에, $x_3$을 $x_2,x_1$ 뒤에 예측한다. | `[MASK]` 없이 한 위치가 물리적으로 왼쪽·오른쪽 어느 쪽의 token도 문맥으로 경험하게 한다. |
| RoBERTa | MLM은 유지하되 같은 문장이 다시 들어올 때 mask를 다시 뽑고, 더 큰 corpus·batch·학습량과 다른 sequence 구성을 조합한다. | 약한 기준 recipe 때문에 실제 성능이 낮게 측정됐을 가능성을 점검한다. |
| ALBERT | MLM을 수행하는 표현의 차원은 유지하되, token table을 작은 차원으로 저장한 뒤 투영하고 layer block의 가중치를 깊이 사이에서 재사용한다. | vocabulary와 깊이가 커질수록 저장해야 할 가중치가 급증한다. |

XLNet의 $z=(2,1,3)$은 입력을 `가 비 온다`로 재배열한다는 뜻이 아니다. token은 원래 위치 1·2·3과 그 위치 정보를 유지한다. 단지 attention mask가 “이번 예측에서는 위치 2의 내용을 먼저 공개한다”라고 정한다. 따라서 첫 target $x_2$는 다른 token **내용**을 보지 못하고, 두 번째 target $x_1$은 $x_2$의 내용만, 세 번째 target $x_3$은 $x_2,x_1$의 내용을 본다. 여러 $z$를 표본으로 뽑으므로 한 위치가 학습 전체에서는 물리적 양쪽의 문맥을 만날 수 있다.

### 병목을 먼저 고르고 바꾸는 축을 제한한다

1. **XLNet:** target을 예측하는 factorization order를 바꿔 여러 방향의 문맥을 경험하게 한다.
2. **RoBERTa:** BERT encoder와 MLM을 유지하고 data·batch·mask·NSP·sequence 구성을 다시 실험한다.
3. **ALBERT:** 작은 vocabulary embedding을 hidden space로 projection하고 같은 block parameter를 여러 layer에서 재사용한다.

## 3단계 — 기술과 근거

### 세 설계의 최소 비교

| 모델 | 핵심 변경 | 얻으려 한 것 | 함께 봐야 할 비용·조건 |
|---|---|---|---|
| XLNet | permutation factorization, two-stream attention | `[MASK]` 없이 양방향 문맥을 활용하는 자기회귀 사전 학습 | Transformer-XL 구성, objective 구현 복잡성, 이해 과제 중심 평가 |
| RoBERTa | 추가 corpus, 큰 batch, dynamic masking, NSP 제거 | 같은 BERT 계열의 충분한 훈련과 강한 baseline | 더 많은 data·총 sequence·compute, 여러 변경의 누적 효과 |
| ALBERT | $O(VH)\to O(VE+EH)$ embedding, cross-layer sharing, SOP | 적은 parameter로 큰 hidden 구조 탐색 | 반복 계산량, 공유에 따른 capacity 변화, xxlarge의 처리 속도 |

### 출발점: MLM 손실은 무엇을 더하고 왜 음수를 붙이는가

BERT와 RoBERTa가 공유하는 MLM의 핵심은 “가려진 위치의 원래 token에 높은 확률을 주게 하자”이다. 원래 sequence를 $x$, 입력에서 일부를 바꾼 sequence를 $x^{\mathrm{in}}$, 예측 대상으로 선택한 위치 집합을 $M$이라 하면 한 예시의 손실을 다음처럼 쓸 수 있다.

$$
\mathcal{L}_{\mathrm{MLM}}(\theta;x,M)
=-\sum_{i\in M}\log p_\theta(x_i\mid x^{\mathrm{in}})
$$

| 기호 | 뜻 | 종류·값의 범위 |
|---|---|---|
| $x=(x_1,\ldots,x_T)$ | 바꾸기 전의 정답 token sequence | 길이 $T$의 token 열 |
| $x^{\mathrm{in}}$ | 선택 위치를 `[MASK]`·무작위 token·원 token으로 처리한 모델 입력 | 길이 $T$의 token 열 |
| $M$ | 예측 대상으로 뽑힌 위치들의 집합 | BERT에서는 전체 위치의 약 15% |
| $i$ | $M$ 안의 한 위치 | 정수 인덱스 |
| $p_\theta(x_i\mid x^{\mathrm{in}})$ | 입력 $x^{\mathrm{in}}$가 주어졌을 때 정답 $x_i$에 준 확률 | 0보다 크고 1 이하인 스칼라 |
| $\theta$ | embedding, attention, feed-forward 등에 들어 있는 학습 가중치 | 학습되는 매개변수 전체 |

합 $\sum_{i\in M}$은 한 문장에서 고른 모든 target 위치의 오류를 하나의 학습 신호로 모은다. $\log$는 확률의 곱을 합으로 바꾸고 아주 작은 확률을 다루기 쉽게 만든다. 확률이 1에 가까우면 $\log p$는 0에 가까우며, 확률이 0에 가까우면 매우 큰 음수가 된다. 앞의 음수는 “정답 확률을 크게 하는 것”을 일반적인 **손실 최소화** 문제로 바꾼다. 즉 $-\log p$는 정답에 낮은 확률을 줄수록 큰 벌점이다.

BERT의 80/10/10 처리는 $M$의 각 위치를 입력에서 어떻게 보이게 할지 정한 설계 선택이다. 전체 위치를 기준으로 기대 비율은 `[MASK]`가 $0.15\times0.80=0.12$, 무작위 token이 $0.15\times0.10=0.015$, 원 token을 유지하는 경우가 $0.015$다. 이 비율은 확률 분포의 정의가 아니라 학습 입력과 실제 사용 입력의 차이를 완화하려고 택한 recipe다. RoBERTa는 이 손실의 모양을 새로 만들기보다 이 recipe 전체를 재검토했다.

### XLNet: 곱으로 쓴 결합확률을 로그 합으로 학습한다

XLNet은 문장 안 단어 위치를 섞지 않는다. 길이 $T$인 위치의 모든 순열 집합을 $Z_T$라고 하고, 그중 하나를 $z=(z_1,\ldots,z_T)$라고 하자. 이 순서 아래의 결합확률은 조건부확률의 곱으로 쓸 수 있다.

$$
p_\theta(x\mid z)
=\prod_{t=1}^{T}p_\theta\left(x_{z_t}\mid x_{z_{<t}}\right),
\qquad
\max_\theta\;
\mathbb{E}_{z\sim Z_T}
\left[\sum_{t=1}^{T}\log p_\theta
\left(x_{z_t}\mid x_{z_{<t}}\right)\right]
$$

| 기호·연산 | 현재 식에서의 의미 |
|---|---|
| $z_t$ | 순열 $z$에서 $t$번째로 예측할 **원래 위치 번호**다. 예를 들어 $z=(2,1,3)$이면 $z_1=2$다. |
| $z_{<t}$ | $z_1,\ldots,z_{t-1}$, 즉 factorization상 이미 공개된 위치들의 열이다. |
| $x_{z_{<t}}$ | 앞선 위치들에 실제로 있던 token 내용이다. 물리적으로 앞에 있는 token만 뜻하지 않는다. |
| $\prod$ | 각 단계의 조건부확률을 곱해 한 순서의 결합확률을 만든다. |
| $\sum\log$ | $\log\prod_t a_t=\sum_t\log a_t$라는 로그 법칙으로 같은 목표를 더하기 형태로 바꾼 것이다. 실제 구현에서는 보통 이 값의 음수를 최소화한다. |
| $\mathbb{E}_{z\sim Z_T}$ | 가능한 순열 전부의 평균이라는 뜻이다. $T!$개를 매번 모두 계산하기에는 너무 비싸므로 학습에서는 순열을 표본 추출해 평균을 추정한다. |
| $\max_\theta$ | 가중치 $\theta$를 바꿔 정답 token의 로그확률 합을 크게 한다. |

앞의 최소 예 $z=(2,1,3)$에 대입하면 다음과 같다.

$$
p_\theta(x\mid z)
=p_\theta(x_2)\,
p_\theta(x_1\mid x_2)\,
p_\theta(x_3\mid x_2,x_1)
$$

첫 항은 이미 공개된 token 내용이 없으므로 $x_2$ 자체의 분포를, 둘째·셋째 항은 순열상 앞선 내용에 조건부인 분포를 뜻한다. 이 예는 각 target이 항상 양방향 문맥을 모두 본다는 뜻이 아니다. **순열을 바꾸어 반복 학습하기 때문에** 같은 물리적 오른쪽 token도 어떤 target에는 먼저 공개된 문맥이 될 수 있다는 뜻이다.

### XLNet의 실제 구현: 모든 target을 매번 예측하지 않는다

앞의 전체 목적은 순열 언어 모델링을 가장 투명하게 보여 주는 식이다. 원 논문은 순열 때문에 생기는 최적화 난이도와 query stream의 계산량을 줄이려고 cutting point $c$ 뒤의 target만 예측하는 partial prediction도 사용한다.

$$
\max_\theta\;
\mathbb{E}_{z\sim Z_T}
\left[
\sum_{t=c+1}^{T}
\log p_\theta(x_{z_t}\mid x_{z_{<t}})
\right]
$$

$z_{\le c}$는 예측하지 않고 문맥으로 제공되는 앞부분, $z_{>c}$는 실제 target인 뒷부분이다. 뒤쪽 target일수록 해당 순열에서 이미 공개된 문맥이 길다. 논문은 대략 $1/K$의 token을 예측하도록 $T/(T-c)\approx K$를 두고, XLNet-Large에는 $K=6$을 사용했다. 이는 모든 항을 더하는 정의를 부정하는 것이 아니라, 그 기대값을 계산 가능한 방식으로 근사하는 공학적 선택이다.

### XLNet의 two-stream은 왜 두 표현을 따로 두는가

target 위치 $z_t$를 예측하려면 “어느 빈칸을 맞히는가”라는 위치 정보는 필요하지만 target token $x_{z_t}$의 내용까지 보면 답을 그대로 베끼게 된다. 반대로 다음 순서의 target을 예측할 때에는 방금 처리한 $x_{z_t}$의 내용이 문맥으로 필요하다. 한 개의 표준 self-attention 상태로는 이 두 요구를 동시에 만족시키기 어렵다.

XLNet은 layer $m$에서 두 상태를 다음처럼 갱신한다. 아래 식은 attention의 핵심 mask만 남긴 축약 표기이며, 실제 block에는 multi-head attention, residual connection, layer normalization, feed-forward도 포함된다.

$$
\begin{aligned}
g_{z_t}^{(m)}
&\leftarrow
\operatorname{Attention}\!\left(
Q=g_{z_t}^{(m-1)},
KV=h_{z_{<t}}^{(m-1)};\theta
\right),\\
h_{z_t}^{(m)}
&\leftarrow
\operatorname{Attention}\!\left(
Q=h_{z_t}^{(m-1)},
KV=h_{z_{\le t}}^{(m-1)};\theta
\right).
\end{aligned}
$$

| 항 | 뜻과 shape 예시 |
|---|---|
| $m=1,\ldots,M$ | Transformer layer 번호다. 대문자 $M$은 전체 layer 수이며 MLM의 target 집합 $M$과는 문맥이 다르므로 혼동하지 않는다. |
| $g_{z_t}^{(m)}\in\mathbb{R}^{1\times d}$ | query stream의 target 표현이다. target 위치와 앞선 문맥은 알지만 $x_{z_t}$ 내용은 못 본다. |
| $h_{z_t}^{(m)}\in\mathbb{R}^{1\times d}$ | content stream의 표현이다. target 내용까지 포함해 이후 target에 전달할 문맥을 만든다. |
| $h_{z_{<t}}^{(m-1)}\in\mathbb{R}^{(t-1)\times d}$ | 앞서 공개된 $t-1$개 content 상태를 세로로 쌓은 key·value 후보다. |
| $h_{z_{\le t}}^{(m-1)}\in\mathbb{R}^{t\times d}$ | 앞선 상태와 현재 target의 content 상태를 함께 쌓은 후보다. |
| $Q$, $KV$ | query는 “무엇을 찾을지”, key·value는 “어떤 공개 정보를 참고할지”를 뜻한다. 같은 $\theta$를 쓰되 mask가 다르다. |

첫 줄에서 $g$가 자기 token 내용을 못 보는 것이 누설 방지 장치다. 둘째 줄에서 $h$가 자기 내용을 볼 수 있는 것은 그 내용을 다음 target의 문맥으로 보존해야 하기 때문이다. fine-tuning에서는 정답 token을 가릴 일이 없으므로 query stream을 버리고 content stream만 일반 Transformer처럼 사용한다.

마지막 query 표현은 target 위치마다 다른 어휘 분포를 만들어야 한다. 후보 어휘를 $\mathcal{V}$, 후보 $v$의 학습 embedding을 $e(v)\in\mathbb{R}^{d}$라고 하면 원 논문의 target-aware softmax는 다음과 같다.

$$
p_\theta(X_{z_t}=v\mid x_{z_{<t}})
=
\frac{
\exp\!\left(e(v)^\top g_\theta(x_{z_{<t}},z_t)\right)
}{
\sum_{v'\in\mathcal{V}}
\exp\!\left(e(v')^\top g_\theta(x_{z_{<t}},z_t)\right)
}
$$

여기서 대문자 $X_{z_t}$는 아직 정해지지 않은 확률변수, 소문자 $x_{z_t}$는 실제 정답 token이다. 내적 $e(v)^\top g$은 후보 $v$와 현재 위치·문맥 표현의 궁합 점수(logit)를 만든다. 지수함수 $\exp$는 점수를 양수로 만들고, 분모는 모든 후보의 양수 점수를 더해 확률 합이 1이 되도록 정규화한다. $z_t$가 식 안에 있으므로 같은 앞선 내용이라도 예측할 위치가 다르면 다른 분포를 낼 수 있다.

#### 설명용 softmax 계산

차원 $d=2$이고 $g=(1.2,0.5)$, 세 후보의 embedding이 $e(\text{비})=(1,0)$, $e(\text{가})=(0,1)$, $e(\text{온다})=(-1,-1)$라고 하자. 이는 원 논문의 학습값이 아닌 손계산용 값이다.

| 후보 $v$ | 점수 $s_v=e(v)^\top g$ | $\exp(s_v)$ | 정규화 뒤 확률 |
|---|---:|---:|---:|
| 비 | $1(1.2)+0(0.5)=1.2$ | $3.3201$ | $3.3201/5.1515\approx0.6445$ |
| 가 | $0(1.2)+1(0.5)=0.5$ | $1.6487$ | $1.6487/5.1515\approx0.3200$ |
| 온다 | $-1(1.2)-1(0.5)=-1.7$ | $0.1827$ | $0.1827/5.1515\approx0.0355$ |

분모 $5.1515$는 세 지수값의 합이며, 반올림 전 확률의 합은 1이다. 실제 정답이 `가`라면 이 target의 음의 로그손실은 $-\log(0.3200)\approx1.139$다. 정답 확률을 1에 가깝게 만들수록 이 값은 0으로 내려간다. 실제 구현에서는 매우 큰 logit의 $\exp$가 overflow하지 않도록 모든 logit에서 최댓값 $s_{\max}$를 빼서

$$
\frac{\exp(s_v-s_{\max})}
{\sum_{v'}\exp(s_{v'}-s_{\max})}
$$

로 계산한다. 분자·분모에 같은 양수 $\exp(-s_{\max})$를 곱한 것이라 확률은 바뀌지 않는다.

### Transformer-XL과 XLNet을 구분하기

[[Transformer-XL]]은 segment-level recurrence와 상대 위치 attention으로 고정 길이 segment 경계를 넘어 문맥을 재사용하는 자기회귀 언어 모델 구조다. XLNet은 이 backbone을 사용하면서 generalized autoregressive objective와 target 누설을 막는 two-stream attention을 추가한 사전 학습 방법이다. 따라서 Transformer-XL 자체가 permutation objective를 쓰는 것은 아니며, XLNet을 Transformer-XL의 단순한 이름 변경으로 볼 수도 없다.

### RoBERTa에서 ‘더 오래’의 뜻: step 수가 아니라 노출량

한 optimization step에 넣는 sequence 수를 $B$, step 수를 $S$라고 하면 모델에 제시한 sequence의 횟수는 우선 다음처럼 셀 수 있다.

$$
N_{\mathrm{seq}}=S\times B
$$

RoBERTa 논문의 비교 표에서 BERT 기준선은 $S=1{,}000{,}000$, $B=256$이므로 $256{,}000{,}000$회다. 최종 RoBERTa 설정은 $S=500{,}000$, $B=8{,}000$이므로 $4{,}000{,}000{,}000$회다.

$$
\frac{4{,}000{,}000{,}000}{256{,}000{,}000}
=15.625
$$

따라서 500K가 1M보다 작다는 사실만으로 더 짧은 훈련이라고 말할 수 없다. 다만 $N_{\mathrm{seq}}$는 **고유 문장 수**도, 정확한 token 수나 FLOPs도 아니다. step마다 실제 batch가 $B_s$, 그 안의 $b$번째 sequence 실제 길이가 $\ell_{s,b}$, 최대 길이가 $T$라 하면 actual non-padding token 수는

$$
N_{\mathrm{token}}
=\sum_{s=1}^{S}\sum_{b=1}^{B_s}\ell_{s,b}
\le T\sum_{s=1}^{S}B_s
$$

모든 step이 같은 $B$개 sequence를 쓸 때에만 이 상한이 $SBT$가 된다. 문장 길이·padding·special token·gradient accumulation·corpus 재사용이 다르면 같은 $S\times B$라도 token 노출과 비용은 달라진다.

dynamic masking은 “새 손실함수”가 아니라 target 위치를 다시 표본화하는 recipe다. 설명을 위해 $r$번째 제시에서 위치 $i$가 target으로 뽑혔는지를 $m_i^{(r)}$라고 하면, 독립 표본화라는 단순 모형에서는

$$
m_i^{(r)}\sim\operatorname{Bernoulli}(0.15),
\qquad
P(m_i^{(r)}=1)=0.15
$$

어떤 위치가 target으로 선택되면 BERT의 원 recipe는 80%를 `[MASK]`, 10%를 무작위 token, 10%를 원 token으로 입력한다. 같은 위치를 $r$번 독립적으로 제시한다고 단순화할 때 적어도 한 번 target이 될 확률은 $1-0.85^r$이고, $r=10$이면 약 $0.803$이다. 이 계산은 mask를 다시 뽑으면 가능한 관측 조합이 늘어난다는 뜻일 뿐, dynamic masking 하나가 benchmark 향상을 만들었다는 인과 증명은 아니다. 실제 논문의 통제 비교도 static과 dynamic의 차이를 비슷하거나 소폭 우수한 정도로 보고한다.

RoBERTa는 NSP를 없앴지만 sequence 구성도 함께 바꾸었다. 그러므로 “NSP만 삭제했다”나 “batch만 키웠다”처럼 한 항만 남겨서는 논문의 비교를 재현할 수 없다. data 양·다양성, byte-level BPE, 긴 text block, batch, step, masking을 누적해 바꾼 recipe라는 점이 핵심이다.

### ALBERT에서 ‘가볍다’의 뜻: 저장하는 행렬과 반복하는 계산은 다르다

어휘 크기를 $V$, hidden size를 $H$라고 하자. BERT식 token table은 $W\in\mathbb{R}^{V\times H}$ 하나다. 한 token의 one-hot 행벡터 $o_i\in\{0,1\}^{1\times V}$에 대해 시작 표현은 $o_iW\in\mathbb{R}^{1\times H}$이고, 이 table만 $VH$개의 parameter를 저장한다.

ALBERT는 이를 작은 embedding table $A\in\mathbb{R}^{V\times E}$와 projection $P\in\mathbb{R}^{E\times H}$로 나눈다.

$$
o_i
\xrightarrow{\;A\;}
e_i=o_iA\in\mathbb{R}^{1\times E}
\xrightarrow{\;P\;}
h_i^{(0)}=e_iP\in\mathbb{R}^{1\times H},
\qquad
VH\;\longrightarrow\;VE+EH
$$

| 항 | 왜 필요한가 |
|---|---|
| $V\times E$ table $A$ | 어휘의 각 token을 작은 $E$차원 코드로 저장한다. $V$가 매우 크므로 여기서 절감 효과가 크다. |
| $E\times H$ projection $P$ | 작은 코드를 Transformer가 쓰는 $H$차원 hidden 공간으로 바꾼다. |
| $E\ll H$ | 큰 문맥 표현 차원 $H$와 어휘 table의 저장 차원을 분리하려는 공학적 선택이다. 수학적으로 반드시 작아야 하는 값은 아니며, 너무 작으면 정보 병목이 될 수 있다. |

논문의 base 설정과 같은 $V=30{,}000$, $H=768$, $E=128$을 설명용 산술에 넣으면 다음과 같다.

$$
\begin{aligned}
VH&=30{,}000\times768=23{,}040{,}000,\\
VE+EH&=30{,}000\times128+128\times768\\
&=3{,}840{,}000+98{,}304=3{,}938{,}304.
\end{aligned}
$$

따라서 이 **token embedding 부분만** 약 $23{,}040{,}000/3{,}938{,}304\approx5.85$배 작아지고 $19{,}101{,}696$개의 parameter를 덜 저장한다. 전체 모델의 절감률은 attention·feed-forward·position embedding 등 다른 행렬도 있으므로 이 비율과 같지 않다. 또한 $A P$의 rank는 최대 $E$이므로, $E<H$인 factorization은 모든 $V\times H$ table을 똑같이 표현할 수 있는 단순한 재배열이 아니라 capacity를 제한하는 설계 선택이기도 하다.

cross-layer sharing도 행렬을 적게 **저장**하는 방법이다. 길이 $T$ sequence의 한 layer 상태를 $Z^{(\ell)}\in\mathbb{R}^{T\times H}$, Transformer block을 $f$라고 하자.

$$
\text{일반 BERT:}\quad
Z^{(\ell+1)}=f_{\phi^{(\ell)}}(Z^{(\ell)}),
\qquad \ell=0,\ldots,L-1,
$$

$$
\text{ALBERT의 all-sharing:}\quad
Z^{(\ell+1)}=f_{\phi_{\mathrm{shared}}}(Z^{(\ell)}),
\qquad \ell=0,\ldots,L-1
$$

일반 구조는 block parameter $P_{\mathrm{block}}$을 layer마다 $L P_{\mathrm{block}}$개 저장하지만, all-sharing은 $\phi_{\mathrm{shared}}$ 하나만 저장한다. 그러나 둘 다 $f$를 $L$번 적용해 서로 다른 $Z^{(0)},Z^{(1)},\ldots$를 만든다. 그래서 parameter가 줄어도 깊이 방향의 attention·feed-forward FLOPs와 latency가 같은 비율로 사라지지 않는다. 공유는 필연적 수식 변형이 아니라 memory·통신 비용과 capacity 사이의 trade-off다.

ALBERT의 SOP는 연속된 두 segment $(A,B)$를 원래 순서면 $y=1$, 순서를 바꾼 $(B,A)$이면 $y=0$으로 둔다. 모델이 원래 순서일 확률을 $q=p_\theta(y=1\mid A,B)$라고 하면 보통의 이진 손실은

$$
\mathcal{L}_{\mathrm{SOP}}
=-
\left[y\log q+(1-y)\log(1-q)\right]
$$

로 쓸 수 있다. $y=1$이면 첫 항만 남아 $q$를 1로 밀고, $y=0$이면 둘째 항만 남아 $q$를 0으로 민다. NSP의 무작위 다른 문서 negative와 달리 같은 연속 segment를 뒤집으므로 topic 차이보다 순서·담화 일관성을 보게 하려는 설계다. 이 역시 가능한 유일한 문장 관계 과제가 아니라 ALBERT가 고른 학습 신호다.

### 공통점과 구조적 차이

세 모델 모두 self-supervised pretraining 뒤 후속 과제에 적응하며 입력 문맥에 따른 contextual representation을 만든다. RoBERTa와 ALBERT는 [[BERT]] encoder 계열이다. XLNet은 Transformer-XL의 recurrence·상대 위치 표현과 generalized autoregressive objective를 결합하므로 동일한 encoder-only 변형으로 분류하지 않는다.

## 검증과 한계

### 비교할 때 흔한 오류

- permutation language modeling을 입력 token shuffle로 설명하지 않는다.
- XLNet의 $\mathbb{E}_{z\sim Z_T}$를 모든 $T!$개 순열을 실제로 매 step 계산한다는 뜻으로 읽지 않는다.
- XLNet query stream이 target 내용을 못 보는 것과 content stream이 그 내용을 보관하는 이유를 뒤바꾸지 않는다.
- RoBERTa의 향상을 dynamic masking 하나의 효과로 돌리지 않는다.
- $S\times B$를 고유 문서 수·정확한 token 수·동일 FLOPs의 증거로 바꾸어 말하지 않는다.
- ALBERT의 parameter 효율을 mobile 속도나 전체 계산 효율과 동일시하지 않는다.
- $VE+EH$ 절감률을 모델 전체 절감률로, factorization을 손실 없는 행렬 분해로 단정하지 않는다.
- 서로 다른 data·tokenizer·compute·모델 크기의 최고 benchmark 점수를 직접 인과 비교하지 않는다.
- 세 원 논문이 입증하지 않은 production 채택이나 후대 모델의 직접 계보를 덧붙이지 않는다.

softmax 분모는 항상 양수지만, 정답 확률이 계산상 0이 되면 $-\log p$가 정의되지 않는다. 실제 구현이 logit에서 최댓값을 빼고 log-softmax를 쓰는 이유다. $E$를 너무 작게 잡거나 모든 layer를 공유했을 때 생기는 표현 capacity 손실도 수식만으로 미리 사라지지 않으며, 논문처럼 ablation과 후속 과제 평가로 확인해야 한다.

세 모델의 공통 가치는 특정 하나가 최종 승자라는 데 있지 않다. 강한 baseline을 만들려면 objective·data·training·parameter·compute를 구분하고, 바꾼 축의 효과를 ablation으로 확인해야 한다는 비교 방법을 제공한다.

## 학습 확인

### 확인 질문

1. $z=(2,1,3)$일 때 XLNet의 세 조건부확률 항을 순서대로 써 보고, 입력 token을 실제로 섞지 않는 이유를 설명해 보라.
2. 위 softmax 예에서 정답이 `온다`라면 음의 로그손실은 `가`가 정답일 때보다 큰가? 확률과 로그의 관계로 답하라.
3. RoBERTa의 $500{,}000\times8{,}000$과 BERT의 $1{,}000{,}000\times256$을 계산한 뒤, 그 비율만으로 token·FLOPs가 같다고 할 수 없는 이유를 말해 보라.
4. $V=30{,}000$, $H=768$, $E=128$에서 $VH$와 $VE+EH$를 직접 계산하고, layer sharing이 왜 그 계산과 별개의 비용 축인지 설명해 보라.

### 다음 문서

- [[concept.glue-superglue|GLUE와 SuperGLUE]] — 서로 다른 모델의 전이 성능을 집계 점수로 비교할 때 숨는 조건을 살핀다.
- [[analysis.사전-학습-지식은-과제에-어떻게-도착하는가|사전 학습 지식은 과제에 어떻게 도착하는가]] — 사전 학습 결과가 특징·미세조정·prompting을 통해 후속 과제로 전달되는 방식을 비교한다.

## 출처

- [[061_XLNet·RoBERTa·ALBERT의 BERT 개선 경로]]
- Zhilin Yang 외, [XLNet: Generalized Autoregressive Pretraining for Language Understanding](https://proceedings.neurips.cc/paper_files/paper/2019/hash/dc6a7e655d7e5840e66733e9ee67cc69-Abstract.html), NeurIPS 2019, 특히 §§2–3.
- Yinhan Liu 외, [RoBERTa: A Robustly Optimized BERT Pretraining Approach](https://arxiv.org/abs/1907.11692), 2019, 특히 §§3–5.
- Zhenzhong Lan 외, [ALBERT: A Lite BERT for Self-supervised Learning of Language Representations](https://openreview.net/forum?id=H1eA7AEtvS), ICLR 2020, 특히 §§3–5.

## 관련 항목

- [[concept.glue-superglue|GLUE와 SuperGLUE]]
- [[analysis.사전-학습-지식은-과제에-어떻게-도착하는가|사전 학습 지식은 과제에 어떻게 도착하는가]]
- [[concept.bert|BERT]]
- [[concept.마스크드-언어-모델링|마스크드 언어 모델링]]
- [[source.061|XLNet·RoBERTa·ALBERT의 BERT 개선 경로]]
- [[concept.transformer|Transformer]]
- [[concept.transformer-xl|Transformer-XL]]
