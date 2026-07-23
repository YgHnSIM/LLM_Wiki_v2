---
schema_version: 2
id: source.061
page_type: source
title: XLNet·RoBERTa·ALBERT의 BERT 개선 경로
aliases:
  - 061_XLNet, RoBERTa, ALBERT Refining BERT with Permutation Modeling, Training Optimization, and Parameter Efficiency
  - BERT 이후 세 가지 개선 경로
tags:
  - type/source
  - domain/ai
  - domain/nlp
  - domain/machine-learning
created: '2026-07-21'
updated: '2026-07-23'
lifecycle: active
verification: verified
artifacts:
  - 'raw/061_XLNet, RoBERTa, ALBERT Refining BERT with Permutation Modeling, Training Optimization, and Parameter Efficiency.ko.md'
  - 'raw/061_XLNet, RoBERTa, ALBERT Refining BERT with Permutation Modeling, Training Optimization, and Parameter Efficiency.commentary.ko.md'
evidence:
  - source_id: bert-2019
    locator: '§3.1과 Appendix A.2의 15%·80/10/10 MLM·NSP 표본화, §5.1과 Table 5의 사전 학습 objective ablation, Appendix C.2와 Table 8의 masking 방식 비교'
    relation: contextualizes
  - source_id: yang-et-al-2019-xlnet
    locator: '§§2.1–2.6과 Eqs. 2–8, Figures 1–2의 permutation objective·two-stream attention·Transformer-XL 결합, §3와 Tables 1–6의 비교·ablation'
    relation: supports
  - source_id: liu-et-al-2019-roberta
    locator: '§§3–4의 corpus·dynamic masking·NSP·input format·large batch 비교, §5와 Tables 4–5의 100K–500K 학습·benchmark 결과'
    relation: supports
  - source_id: lan-et-al-2020-albert
    locator: '§§3.1–3.2의 factorized embedding·cross-layer sharing·SOP, §§4.3–4.6와 Tables 1–5의 매개변수·처리량·공유·목표 비교'
    relation: supports
related:
  - concept.xlnet-roberta-albert
  - concept.bert
  - concept.마스크드-언어-모델링
  - concept.transformer-xl
  - source.058
  - source.060
---
# XLNet·RoBERTa·ALBERT의 BERT 개선 경로

> [!note] 학습 안내
> **난이도:** 심화<br>
> **선수 지식:** [[BERT]], [[마스크드 언어 모델링]]<br>
> **읽고 나면:** BERT 이후의 성능 향상을 사전 학습 목표·훈련 recipe·매개변수 구조라는 세 축으로 분리하고, parameter 수와 실제 계산 효율을 구분해 설명할 수 있다.

## 1단계 — 먼저 잡을 핵심

원문은 2019년 전후의 [[XLNet·RoBERTa·ALBERT]]를 BERT 개선 모델 세 가지로 묶는다. 비교축은 유용하다. XLNet은 예측 순서를, RoBERTa는 훈련 조건을, ALBERT는 매개변수 배치를 주로 바꿨다. 그러나 raw는 BERT의 masking, XLNet의 순열 조건화, RoBERTa의 step 수와 dynamic masking 효과, ALBERT의 성능·계산 효율을 여러 곳에서 과장하거나 잘못 설명한다. 공개 문서는 네 원 논문의 정의와 ablation으로 세 개선 경로를 다시 분리한다.

### 핵심 문장

- XLNet은 입력 token의 자연 순서가 아니라 결합확률의 **factorization order**를 표본 추출한다.
- RoBERTa는 BERT 구조를 유지하면서 data·batch·mask 재표집·NSP·입력 구성을 함께 재검토했다.
- ALBERT는 embedding factorization과 깊이 방향의 layer sharing으로 parameter 수를 줄였다.
- 적은 parameter는 저장·통신 memory의 이점이지 FLOPs나 latency가 같은 비율로 줄어든다는 뜻이 아니다.
- 세 모델의 benchmark 향상은 objective·data·compute·parameterization을 통제하지 않으면 하나의 원인으로 돌릴 수 없다.

## 2단계 — 작동 원리

### 같은 기준 모델에서 갈라진 세 질문

| 질문 | 모델 | 주로 바꾼 것 | 유지하거나 계승한 것 |
|---|---|---|---|
| `[MASK]` 없이 양쪽 문맥을 쓸 수 있는가? | XLNet | permutation language modeling, two-stream attention | [[Transformer-XL]]의 recurrence·상대 위치 표현 |
| BERT를 더 충분하고 일관되게 훈련하면 어디까지 가는가? | RoBERTa | corpus·batch·mask 일정·NSP·sequence 구성 | BERT encoder와 MLM |
| hidden size를 키워도 parameter 증가를 억제할 수 있는가? | ALBERT | factorized embedding, cross-layer sharing, SOP | BERT식 encoder와 MLM |

세 접근은 한 줄의 후속 버전이 아니다. RoBERTa와 ALBERT는 BERT encoder 계열이지만 XLNet은 Transformer-XL 위에 일반화된 자기회귀 목표와 two-stream attention을 결합한다. 따라서 “어느 모델이 BERT를 대체했는가”보다 “어느 병목을 어떤 비용으로 바꿨는가”를 묻는 편이 정확하다.

## 3단계 — 기술과 근거

### BERT 기준선에서 정확히 문제였던 것

BERT는 전체 token을 `[MASK]`로 바꾸지 않는다. WordPiece 위치의 15%만 예측 대상으로 고르고, 그중 80%는 `[MASK]`, 10%는 임의 token, 10%는 원 token을 입력한다. 따라서 raw의 “사전 학습에서 실제 단어를 전혀 보지 않았다”는 설명은 틀리다. 정확한 한계는 선택 위치 일부에서만 생기는 인공 token 불일치와, 같은 입력에서 여러 선택 token을 서로 직접 조건화하지 않고 병렬 예측하는 데 있다.

BERT의 NSP는 text span A 뒤에 실제로 이어지는 B와 corpus에서 무작위로 고른 B를 분류한다. BERT 원 ablation에서는 일부 과제에 도움이 됐지만, 주제가 다른 negative를 쉽게 구분하는 신호가 담화 관계 학습과 같은지는 후속 연구의 질문으로 남았다.

#### 공통 기준식: MLM은 무엇을 최소화하는가

원래 token 열을 $x=(x_1,\ldots,x_T)$, 선택 위치를 바꾼 입력을 $x^{\mathrm{in}}$, 예측 대상으로 고른 위치 집합을 $M$이라고 쓰면 BERT와 RoBERTa가 쓰는 MLM 학습 신호는 다음처럼 정리할 수 있다.

$$
\mathcal{L}_{\mathrm{MLM}}(\theta;x,M)
=-\sum_{i\in M}\log p_\theta(x_i\mid x^{\mathrm{in}})
$$

| 기호 | 원 자료를 읽을 때의 뜻 |
|---|---|
| $x_i$ | 위치 $i$의 원래 정답 WordPiece 또는 subword token |
| $x^{\mathrm{in}}$ | target 위치를 `[MASK]`·무작위 token·원 token으로 처리해 모델에 넣은 열 |
| $M$ | 한 입력에서 예측 대상으로 선택한 위치들의 집합. BERT에서는 전체 위치의 약 15%다. |
| $p_\theta(x_i\mid x^{\mathrm{in}})$ | 변형된 전체 입력이 주어졌을 때 위치 $i$의 정답에 부여한 어휘 확률 |
| $\theta$ | 모델이 학습으로 조정하는 모든 가중치 |

합은 선택한 모든 위치의 벌점을 한 예시의 손실로 모으고, $\log$는 작은 확률들의 곱을 더하기로 바꾼다. 앞의 음수는 정답 확률을 크게 하는 목표를 손실 최소화로 바꾼다. 예를 들어 정답 확률이 $0.8$이면 $-\log(0.8)\approx0.223$, $0.2$이면 $-\log(0.2)\approx1.609$이므로 낮은 확률이 더 큰 벌점을 받는다. 이 숫자는 설명용 계산이며 논문의 측정값이 아니다.

80/10/10은 이 식에서 $M$을 고르는 확률이나 로그의 성질이 아니라, $x^{\mathrm{in}}$를 만드는 **입력 recipe** 다. 전체 위치를 기준으로 하면 기대상 `[MASK]`는 $0.15\times0.80=12\%$, 무작위 token과 원 token 유지는 각각 $1.5\%$다. XLNet은 이 목표의 조건화 방식을, RoBERTa는 이 recipe와 training budget을, ALBERT는 이 목표를 수행하는 parameter 저장 방식을 다르게 다룬다.

### XLNet: 입력 순서가 아니라 확률분해 순서를 바꾼다

sequence $x=(x_1,\ldots,x_T)$와 위치 순열의 집합 $Z_T$를 두면, XLNet은 한 순열 $z=(z_1,\ldots,z_T)$ 아래의 결합확률을 조건부확률의 곱으로 분해하고 그 순열들에 평균적으로 잘 맞도록 학습한다.

$$
p_\theta(x\mid z)
=\prod_{t=1}^{T}p_\theta(x_{z_t}\mid x_{z_{<t}}),
\qquad
\max_\theta\;\mathbb{E}_{z\sim Z_T}
\left[\sum_{t=1}^{T}\log p_\theta
\left(x_{z_t}\mid x_{z_{<t}}\right)\right]
$$

| 기호·연산 | 이 식에서의 뜻 |
|---|---|
| $z_t$ | 순열에서 $t$번째로 예측할 **원래 위치 번호**다. |
| $z_{<t}$ | 순열상 먼저 처리한 위치 $z_1,\ldots,z_{t-1}$다. |
| $x_{z_{<t}}$ | 그 위치들에 있던 token 내용이다. 물리적으로 왼쪽에 있는 token만 뜻하지 않는다. |
| $\prod$ | 순서별 조건부확률을 곱해 하나의 결합확률을 만든다. |
| $\sum\log$ | $\log\prod a_t=\sum\log a_t$를 이용해 같은 목표를 수치적으로 다루기 쉬운 더하기로 바꾼다. 구현은 보통 이 합의 음수를 최소화한다. |
| $\mathbb{E}_{z\sim Z_T}$ | 가능한 순열의 평균이다. $T!$개를 모두 계산하지 않고 학습 중 순열을 표본 추출해 추정한다. |

$z$는 원문의 token 배치를 뒤섞는 순서가 아니라 어떤 위치를 먼저 조건으로 공개하고 예측할지를 정하는 순서다. 자연어 위치와 positional encoding은 그대로 남고, attention mask만 factorization order에 맞춰 달라진다. 주어진 target은 그 순서에서 앞선 위치의 내용만 볼 수 있다. raw의 예처럼 첫 target이 나머지 모든 token 내용을 먼저 보는 것은 자기회귀 조건과 맞지 않는다.

예를 들어 $x=(x_1,x_2,x_3)=(\text{비},\text{가},\text{온다})$, $z=(2,1,3)$이면 다음 세 항이 생긴다.

$$
p_\theta(x\mid z)
=p_\theta(x_2)\,
p_\theta(x_1\mid x_2)\,
p_\theta(x_3\mid x_2,x_1)
$$

입력은 여전히 위치 1의 비, 위치 2의 가, 위치 3의 온다다. 첫 target은 다른 token **내용**이 없는 상태에서 위치 2를, 둘째는 $x_2$를 문맥으로, 셋째는 $x_2,x_1$을 문맥으로 예측한다. 다른 순열도 함께 표본화하므로 한 위치가 학습 전체에서는 물리적으로 오른쪽에 있던 token도 문맥으로 경험할 수 있다.

원 논문의 실제 학습은 위 전체 합을 매번 모두 예측하지 않는 **partial prediction**도 사용한다. cutting point $c$를 정해 순열 앞부분 $z_{\le c}$는 문맥으로 두고, 뒤쪽 target만 예측한다.

$$
\max_\theta\;
\mathbb{E}_{z\sim Z_T}
\left[
\sum_{t=c+1}^{T}
\log p_\theta(x_{z_t}\mid x_{z_{<t}})
\right]
$$

뒤쪽 target은 해당 순열에서 더 긴 문맥을 가지므로 최적화가 덜 어렵고, query stream을 만들 target 수가 줄어 memory와 속도에도 도움이 된다. 논문은 약 $1/K$의 token만 예측하도록 $T/(T-c)\approx K$를 두며, XLNet-Large에는 $K=6$을 썼다. 따라서 전체 목표는 개념을 설명하는 출발점이고, 실제 계산은 그 목표의 표본·부분 예측 근사까지 포함한다.

#### two-stream attention: 누설 방지와 문맥 전달을 동시에 만족하기

target 위치를 예측하려면 그 위치 정보는 알아야 하지만, $x_{z_t}$ 내용까지 보면 답을 베끼게 된다. 반면 그 token은 다음 target의 문맥에는 남아야 한다. XLNet은 layer $m$에서 content state $h$와 query state $g$를 따로 둬 이 충돌을 푼다.

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

| 흐름·기호 | 접근 정보와 역할 |
|---|---|
| $g_{z_t}^{(m)}\in\mathbb{R}^{d}$ | query stream의 $m$번째 layer 상태다. target 위치와 앞선 content state는 보지만 $x_{z_t}$ 내용은 보지 않아 예측 누설을 막는다. |
| $h_{z_t}^{(m)}\in\mathbb{R}^{d}$ | content stream 상태다. 현재 target 내용도 포함해 이후 target이 쓸 문맥을 만든다. |
| $Q$, $KV$ | query는 무엇을 찾을지, key·value는 공개된 어떤 상태를 참고할지 정한다. 같은 parameter $\theta$를 쓰되 보이는 상태 집합이 다르다. |
| $m$ | Transformer layer 번호다. 실제 구현에는 multi-head attention, residual connection, layer normalization, feed-forward도 더해진다. |

마지막 $g$는 후보 어휘마다 다른 확률을 내야 한다. 후보 집합을 $\mathcal V$, 후보 $v$의 embedding을 $e(v)$라고 하면 원 논문의 target-aware 분포는 다음과 같다.

$$
p_\theta(X_{z_t}=v\mid x_{z_{<t}})
=
\frac{\exp(e(v)^\top g_\theta(x_{z_{<t}},z_t))}
{\sum_{v'\in\mathcal V}\exp(e(v')^\top g_\theta(x_{z_{<t}},z_t))}
$$

내적 $e(v)^\top g$은 후보와 현재 위치·문맥의 궁합 점수(logit)를 만들고, $\exp$는 점수를 양수로, 분모는 후보 전체 합이 1이 되게 확률로 바꾼다. $z_t$가 식 안에 있으므로 같은 공개 문맥이어도 target 위치가 다르면 다른 분포를 낼 수 있다. 설명용으로 세 후보의 logit이 $(1.2,0.5,-1.7)$이면 지수값 합은 $3.3201+1.6487+0.1827=5.1515$이고 확률은 약 $(0.6445,0.3200,0.0355)$다. 둘째 후보가 정답이면 벌점은 $-\log(0.3200)\approx1.139$다. 실제 구현은 overflow를 막기 위해 모든 logit에서 최댓값을 빼는 stable softmax를 쓴다.

fine-tuning에서는 query stream을 버리고 content stream을 사용한다. XLNet은 Transformer-XL의 segment recurrence와 상대 위치 encoding도 결합했다. 그러므로 성능을 permutation objective 하나의 효과로 읽지 않고 Table 6의 ablation처럼 objective와 Transformer-XL 구성의 기여를 나눠 봐야 한다.

XLNet은 유효한 자기회귀 factorization을 학습하지만 GPT처럼 표준 왼쪽→오른쪽 생성기로 폭넓게 검증됐다는 뜻은 아니다. 원 논문의 주 실험은 GLUE·RACE·SQuAD·문서 순위 같은 이해·선택·추출 과제였다.

### RoBERTa: 구조보다 훈련 조건을 다시 통제한다

RoBERTa는 BERT-large와 같은 24-layer, hidden size 1024, 16-head MLM architecture를 출발점으로 두고 BooksCorpus와 영어 Wikipedia에 CC-News·OpenWebText·Stories를 더해 160GB text를 사용했다. BERT 기준 data는 약 16GB다. byte-level BPE, 큰 batch, 긴 sequence 구성과 더 많은 총 학습 노출도 함께 사용했으므로 성능 차이를 dynamic masking 하나로 설명할 수 없다.

#### dynamic masking은 무엇을 다시 뽑는가

BERT의 data 생성 절차는 같은 sequence를 열 번 복제해 서로 다른 mask를 만들고 여러 epoch에서 반복 사용했다. RoBERTa는 sequence가 학습에 제시될 때 mask를 다시 표본 추출했다. 설명을 위해 $r$번째 제시에서 위치 $i$가 prediction target인지 나타내는 변수를 $m_i^{(r)}$라고 하면, 독립적으로 15%를 고르는 단순 모형은

$$
m_i^{(r)}\sim\operatorname{Bernoulli}(0.15),
\qquad
P(m_i^{(r)}=1)=0.15
$$

로 쓸 수 있다. 같은 위치를 $r$번 독립적으로 제시한다면 적어도 한 번 target이 될 확률은 $1-(1-0.15)^r$다. 예를 들어 $r=10$이면 $1-0.85^{10}\approx0.803$이다. 이 계산은 재표집이 가능한 target 조합을 늘린다는 뜻일 뿐, 실제 학습 순서·token 상관·mask template 재사용을 모두 재현하는 실험 모형은 아니다.

RoBERTa 논문의 통제 비교에서 dynamic 방식은 static 방식보다 **비슷하거나 약간 우수**한 수준이었다. “특정 mask 과적합을 막아 큰 향상을 만들었다”는 raw의 단일 인과는 근거보다 강하다. 바뀐 것은 MLM의 $-\sum\log p$ 꼴이 아니라 $x^{\mathrm{in}}$를 만들 때의 표본 추출 일정이다.

NSP를 제거한 실험도 입력 segment 구성과 함께 읽어야 한다. 서로 다른 문서에서 짧은 segment를 모은 설정은 성능이 낮았고, 문서 경계를 존중한 긴 sequence에서 NSP 없이 MLM만 학습했을 때 BERT 계열 결과를 맞추거나 조금 높였다. 이는 NSP가 모든 조건에서 해롭다는 증명이 아니라 원래 objective와 data construction을 다시 점검한 결과다.

#### “더 오래”는 step 수가 아니라 어느 단위의 노출량인가

한 optimization step의 sequence 수를 $B$, step 수를 $S$라 하면 sequence 제시 횟수는

$$
N_{\mathrm{seq}}=S\times B
$$

로 셀 수 있다. 논문의 대표 행을 이 식에 넣으면 다음과 같다.

| 설정 | $S$ | $B$ | $N_{\mathrm{seq}}=S\times B$ |
|---|---:|---:|---:|
| BERT-large 기준 | $1{,}000{,}000$ | $256$ | $256{,}000{,}000$ |
| 최종 RoBERTa | $500{,}000$ | $8{,}000$ | $4{,}000{,}000{,}000$ |

따라서 같은 단위에서의 제시 횟수 비는

$$
\frac{4{,}000{,}000{,}000}{256{,}000{,}000}=15.625
$$

다. 500K step이 1M보다 작다는 사실만으로 더 짧게 훈련했다고 할 수 없는 이유다. 단, 이 계산은 고유 문서 수, 같은 token 수, 같은 compute를 뜻하지 않는다. $s$번째 step의 실제 batch를 $B_s$, 그 안의 $b$번째 sequence 실제 길이를 $\ell_{s,b}$, 최대 길이를 $T$라 하면 non-padding token 제시 수는

$$
N_{\mathrm{token}}
=\sum_{s=1}^{S}\sum_{b=1}^{B_s}\ell_{s,b}
\le T\sum_{s=1}^{S}B_s
$$

로 따로 세야 한다. 모든 step이 같은 $B$개 sequence를 쓸 때에만 상한이 $SBT$가 된다. padding·sequence 길이·data 재사용·hardware 병렬화·gradient accumulation이 다르면 $S\times B$가 같아도 token과 FLOPs는 다르다. 논문의 100K→300K→500K 표는 data 양·다양성과 훈련 시간을 누적해 바꾼 결과이며, 저자도 data size와 diversity가 함께 바뀐 한계를 명시했다. 500K 설정도 추가 학습으로 개선될 가능성을 남겼으므로 완전 수렴을 주장하지 않았다.

### ALBERT: parameter 수와 계산량을 분리한다

어휘 크기를 $V$, hidden size를 $H$라 하면 BERT의 token embedding table은 $W\in\mathbb{R}^{V\times H}$이고 $VH$개의 parameter를 저장한다. 한 token을 고르는 one-hot 행벡터 $o_i\in\{0,1\}^{1\times V}$를 쓰면 시작 표현은 $o_iW\in\mathbb{R}^{1\times H}$다. ALBERT는 $H$보다 작은 embedding size $E$를 두고 이 table을 두 행렬로 나눈다.

$$
o_i
\xrightarrow{\;A\;}
e_i=o_iA\in\mathbb{R}^{1\times E}
\xrightarrow{\;P\;}
h_i^{(0)}=e_iP\in\mathbb{R}^{1\times H},
\qquad
VH\quad\longrightarrow\quad VE+EH
$$

| 항 | 크기와 역할 |
|---|---|
| $A$ | $V\times E$ token table이다. 어휘가 커도 작은 $E$차원 코드만 저장한다. |
| $P$ | $E\times H$ projection이다. 작은 code를 Transformer가 처리하는 $H$차원 hidden 공간으로 보낸다. |
| $E\ll H$ | vocabulary 저장 비용과 hidden capacity를 분리하려는 설계 선택이다. 너무 작으면 information bottleneck이 될 수 있다. |

논문의 base 설정과 같은 $V=30{,}000$, $H=768$, $E=128$을 넣으면 token embedding 부분의 산술은 다음과 같다.

$$
\begin{aligned}
VH&=30{,}000\times768=23{,}040{,}000,\\
VE+EH&=30{,}000\times128+128\times768\\
&=3{,}840{,}000+98{,}304=3{,}938{,}304.
\end{aligned}
$$

즉 이 부분만 약 $5.85$배 작아지고 $19{,}101{,}696$개의 parameter를 덜 저장한다. 이는 전체 모델 절감률이 아니다. attention·feed-forward 등 다른 parameter가 남아 있으며, $A P$의 rank가 최대 $E$이므로 $E<H$는 임의의 $V\times H$ embedding table을 손실 없이 다시 쓰는 등식도 아니다.

또한 여러 깊이의 Transformer layer가 같은 attention·feed-forward block parameter를 재사용한다. 이는 sequence 위치 사이의 공유가 아니라 **layer 사이 공유**다. 길이 $T$ sequence의 layer 상태를 $Z^{(\ell)}\in\mathbb{R}^{T\times H}$, block을 $f$라고 쓰면 두 구조는 다음처럼 대비된다.

$$
\text{일반 BERT:}\quad
Z^{(\ell+1)}=f_{\phi^{(\ell)}}(Z^{(\ell)}),
\qquad
\text{all-shared ALBERT:}\quad
Z^{(\ell+1)}=f_{\phi_{\mathrm{shared}}}(Z^{(\ell)})
$$

일반 구조는 $L$개 layer에 대해 $L$개의 block parameter 묶음을 저장하고, all-sharing은 하나의 $\phi_{\mathrm{shared}}$만 저장한다. 하지만 두 경우 모두 block $f$를 $L$번 계산해 서로 다른 중간 상태를 만든다. 그래서 parameter 저장량은 크게 줄어도 FLOPs·latency가 같은 비율로 줄지는 않는다.

ALBERT의 sentence order prediction(SOP)은 같은 문서에서 이어지는 두 text segment를 가져와 원래 순서 $(A,B)$면 $y=1$, 뒤집힌 $(B,A)$면 $y=0$으로 둔다. 모델이 원래 순서일 확률을 $q=p_\theta(y=1\mid A,B)$라고 하면 이진 분류 손실은

$$
\mathcal{L}_{\mathrm{SOP}}
=-\left[y\log q+(1-y)\log(1-q)\right]
$$

로 쓸 수 있다. $y=1$이면 첫 항만 남아 $q$를 1로, $y=0$이면 둘째 항만 남아 $q$를 0으로 민다. 무작위 문서 negative를 포함한 NSP보다 topic 차이에 덜 의존하고 담화 일관성을 보게 하려는 목표다. 이것도 유일하게 필연적인 문장 관계 과제가 아니라 ALBERT가 택한 추가 학습 신호다.

| 비교 모델 | parameter | Table 2 평균 | 해석 |
|---|---:|---:|---|
| BERT-base | 108M | 82.3 | 대응 base 기준 |
| ALBERT-base | 12M | 80.1 | parameter는 크게 줄지만 같은 설정의 평균은 더 낮다. |
| BERT-large | 334M | 85.2 | 대응 large 기준 |
| ALBERT-large | 18M | 82.4 | raw의 ‘BERT-large보다 우수’ 주장과 달리 더 낮다. |

강한 최종 결과는 2억 3천5백만 parameter의 ALBERT-xxlarge에서 나왔다. 이 모델은 BERT-large보다 parameter가 적지만, 같은 TPU 수·훈련 조건에서 data throughput은 BERT-large보다 약 세 배 느렸다고 논문이 보고한다. parameter efficiency를 mobile latency나 전체 compute efficiency로 바로 바꾸어 말할 수 없는 이유다. Table 4의 공유 ablation에서도 all-shared 설정은 non-shared보다 평균이 낮아, 공유가 비용 없이 같은 capacity를 보존한다고 단정할 수 없다.

### benchmark는 단일 원인 실험이 아니다

세 모델은 발표 당시 [[GLUE와 SuperGLUE]], SQuAD, RACE 등에서 강한 결과를 냈다. 그러나 사용 data·모델 크기·학습량·architecture가 다르므로 leaderboard 순위를 곧 특정 아이디어 하나의 인과 효과로 읽지 않는다. objective의 효과는 같은 data와 backbone을 맞춘 ablation으로, training recipe는 총 token·batch·compute를 포함한 비교로, parameterization은 성능과 처리량을 함께 보고 판단해야 한다.

## 검증과 한계

### 검증 정정

- **BERT는 사전 학습 중 실제 단어를 전혀 보지 않는다**: 전체 위치의 15%만 target이고, 선택 위치도 80/10/10으로 처리한다.
- **XLNet은 token을 실제 순열로 섞는다**: 입력의 자연어 위치가 아니라 확률분해 순서만 표본 추출한다.
- **XLNet의 첫 target은 나머지 모든 위치를 본다**: factorization상 앞선 위치만 조건으로 사용할 수 있다.
- **XLNet은 매번 모든 위치의 순열 손실을 계산한다**: 원 논문은 순열 뒤쪽 일부 target만 예측하는 partial prediction으로 계산량과 최적화 난이도를 줄인다.
- **two-stream attention이 fine-tuning에도 그대로 남는다**: fine-tuning에서는 query stream을 버리고 content stream을 쓴다.
- **RoBERTa는 BERT보다 더 많은 step으로 완전히 수렴했다**: 대표 설정은 500K 대 1M이지만 큰 batch로 더 많은 sequence를 처리했고, 추가 개선 가능성을 남겼다.
- **dynamic masking이 큰 향상의 단일 원인이다**: 통제 비교는 비슷하거나 소폭 우수했으며 전체 recipe가 함께 바뀌었다.
- **$S\times B$가 같은 corpus·token·FLOPs를 뜻한다**: sequence 제시 횟수일 뿐 실제 길이·padding·재사용·병렬화가 빠진 근사 지표다.
- **ALBERT는 위치마다 같은 parameter를 쓴다**: 공유 축은 sequence 위치가 아니라 네트워크 깊이의 layer다.
- **12M·18M ALBERT가 대응 BERT의 성능을 맞추거나 넘었다**: 같은 설정의 Table 2에서는 각각 더 낮고, 강한 결과는 235M xxlarge에서 나왔다.
- **parameter가 적으면 FLOPs·latency도 같은 폭으로 줄어든다**: 저장량과 반복 계산은 다른 비용이다.
- **$VE+EH$가 전체 모델 parameter 수다**: 이는 token embedding 부분의 크기이며 attention·FFN 등 다른 block은 별도로 남는다.
- **세 모델은 정적 embedding을 만든다**: 모두 입력 문맥에 따라 달라지는 contextual representation을 만든다.
- **세 모델은 모두 BERT encoder-only 변형이다**: RoBERTa·ALBERT와 달리 XLNet은 Transformer-XL 기반의 generalized autoregressive 구조다.
- **mobile·production 채택과 T5·GPT-3 직접 영향이 입증됐다**: 세 원 논문만으로는 이 배포·계보를 확인할 수 없어 공개 문서의 결론에서 제외한다.

### 남는 비교 한계

XLNet·RoBERTa·ALBERT 논문은 서로 같은 corpus·tokenizer·training budget·모델 크기로 직접 대조한 단일 실험이 아니다. 각 논문의 최고 점수를 한 표에 놓아도 어느 설계가 같은 비용에서 우월한지는 알 수 없다. 또한 2019년 영어 NLU benchmark의 향상을 오늘날 생성·사실성·긴 문맥·도구 사용 능력으로 소급하지 않는다.

## 학습 확인

### 확인 질문

1. $z=(2,1,3)$일 때 XLNet의 세 조건부확률 항을 쓰고, 첫 target이 어떤 token 내용을 보지 못하는지 설명해 보라.
2. BERT의 $1{,}000{,}000\times256$과 RoBERTa의 $500{,}000\times8{,}000$을 계산한 뒤, 왜 이 비율을 token·FLOPs 비율로 읽으면 안 되는지 말해 보라.
3. $V=30{,}000$, $H=768$, $E=128$일 때 $VH$와 $VE+EH$를 직접 계산하고, 이 절감률이 전체 모델 절감률과 다른 이유를 설명해 보라.
4. SOP에서 $y=0$일 때 남는 손실 항은 무엇이며, 왜 원래 순서의 연속 segment를 뒤집는 negative가 NSP의 무작위 문서 negative와 다른가?

### 다음 문서

- [[언어 모델 전이 학습]] — 사전 학습 표현과 parameter가 후속 과제로 전달되는 여러 인터페이스를 비교한다.
- [[훈련 병렬성과 생성 순차성은 다른 축이다]] — 모델 구조·학습 계산·생성 순서를 서로 다른 효율 축으로 분리한다.

## 출처

- Jacob Devlin 외, [BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding](https://aclanthology.org/N19-1423/), 특히 §3.1과 Appendix A.2.
- Zhilin Yang 외, [XLNet: Generalized Autoregressive Pretraining for Language Understanding](https://proceedings.neurips.cc/paper_files/paper/2019/hash/dc6a7e655d7e5840e66733e9ee67cc69-Abstract.html), NeurIPS 2019, 특히 §§2–3.
- Yinhan Liu 외, [RoBERTa: A Robustly Optimized BERT Pretraining Approach](https://arxiv.org/abs/1907.11692), 2019, 특히 §§3–5.
- Zhenzhong Lan 외, [ALBERT: A Lite BERT for Self-supervised Learning of Language Representations](https://openreview.net/forum?id=H1eA7AEtvS), ICLR 2020, 특히 §§3–5.
- 프로젝트 번역·검토 출발 자료: [XLNet, RoBERTa, ALBERT: Refining BERT with Permutation Modeling, Training Optimization, and Parameter Efficiency](https://mbrenndoerfer.com/writing/xlnet-roberta-albert-bert-refinements)
- 프로젝트 보존 자료: `raw/061_XLNet, RoBERTa, ALBERT Refining BERT with Permutation Modeling, Training Optimization, and Parameter Efficiency.ko.md`, `raw/061_XLNet, RoBERTa, ALBERT Refining BERT with Permutation Modeling, Training Optimization, and Parameter Efficiency.commentary.ko.md`.

## 관련 항목

- [[XLNet·RoBERTa·ALBERT]]
- [[BERT]]
- [[마스크드 언어 모델링]]
- [[Transformer-XL]]
- [[058_BERT의 마스크드 양방향 사전 학습]]
- [[060_GLUE와 SuperGLUE의 집계 평가]]
