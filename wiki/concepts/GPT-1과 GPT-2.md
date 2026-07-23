---
schema_version: 2
id: concept.gpt-1-gpt-2
page_type: concept
title: GPT-1과 GPT-2
aliases:
  - GPT-1
  - GPT-2
  - Generative Pre-trained Transformer
  - 생성 사전 학습 Transformer
tags:
  - type/concept
  - domain/ai
  - domain/nlp
  - domain/machine-learning
created: '2026-07-20'
updated: '2026-07-23'
lifecycle: active
verification: verified
artifacts:
  - 'raw/059_GPT-1 & GPT-2 Autoregressive Pretraining and Transfer Learning.ko.md'
  - 'raw/059_GPT-1 & GPT-2 Autoregressive Pretraining and Transfer Learning.commentary.ko.md'
  - 'raw/067_GPT-3 and In-Context Learning Emergent Capabilities from Scale.ko.md'
  - 'raw/067_GPT-3 and In-Context Learning Emergent Capabilities from Scale.commentary.ko.md'
evidence:
  - source_id: gpt-2018
    locator: '§§1–3의 117M causal Transformer·BookCorpus·두 단계 학습·input transformations와 §§4–5의 12개 과제 결과'
    relation: supports
  - source_id: radford-et-al-2019-gpt2
    locator: '§§1–3의 WebText·모델 네 크기·byte-level BPE·zero-shot 설정과 §§3–4의 과제별 결과·한계'
    relation: supports
  - source_id: openai-2019-gpt2-release
    locator: '2019년 original post·interim updates의 117M·345M 공개와 zero-shot·release policy 설명'
    relation: contextualizes
  - source_id: openai-2019-gpt2-1-5b-release
    locator: '2019-11-05 final model release의 1.5B 모델 weights·code 공개와 staged release 결말'
    relation: contextualizes
  - source_id: brown-et-al-2020-gpt3
    locator: '§§1–3, 특히 §2와 Tables 2.1–2.2의 8개 모델·300B token 학습, zero/one/few-shot 정의와 task별 결과'
    relation: supplements
related:
  - source.059
  - source.067
  - concept.자기회귀-생성
  - concept.언어-모델-전이-학습
  - concept.로그-가능도
  - concept.문맥-내-학습
  - concept.bert
  - concept.transformer
---
# GPT-1과 GPT-2

> [!note] 학습 안내
> **난이도:** 기초 → 중급<br>
> **선수 지식:** 없음 — 토큰, 조건부 확률, 학습과 평가의 차이를 이 문서에서 먼저 만든다.<br>
> **읽고 나면:** GPT-1의 지도 미세조정과 GPT-2의 zero-shot 확률 채점이 같은 다음-token 모델을 어떻게 다르게 쓰는지, 수식과 작은 계산으로 설명할 수 있다.

## 1단계 — 먼저 잡을 핵심

### 한 문장 정의

GPT(Generative Pre-trained Transformer)는 앞선 텍스트를 보고 다음 조각을 예측하는 causal Transformer를 먼저 많은 비표지 텍스트로 학습한 뒤, 다른 언어 과제에 쓰는 방법과 모델 계열이다. GPT-1은 그 모델을 **표지된 과제 자료로 다시 학습**하는 길을, GPT-2는 가중치를 바꾸지 않고 **입력 문구와 확률 비교만으로 평가**하는 zero-shot 길을 대표적으로 시험했다.

### 왜 이 구분이 필요했는가

2018년 무렵의 자연어 처리 과제는 대체로 과제마다 다른 입력 형식과 마지막 분류기를 만들고, 사람이 붙인 label로 처음부터 학습했다. 하지만 label은 비싸고, 번역·분류·질의응답처럼 과제가 바뀔 때마다 배운 표현을 버리기 쉽다. GPT-1은 먼저 책 텍스트에서 언어 자체의 규칙을 배운 뒤 적은 과제 label로 조정할 수 있는지 물었다.

GPT-2는 질문을 한 단계 바꿨다. 다음-token 예측만 깊게 배운 모델에게 질문·후보·요약 표지를 텍스트로 적으면, **새로운 가중치 학습 없이도** 과제 형식에 맞는 이어쓰기를 만들거나 정답 후보의 확률을 비교할 수 있는가를 시험했다. 이것은 오늘날의 대화형 지시 따르기와 같지 않다. 원 GPT-2는 과제별 cue, 생성 규칙, 후보 점수 규칙을 사람이 설계해 평가했다.

### 먼저 알아야 할 기초 개념

- **[[로그가능도]]**: 이미 본 정답 열을 고정하고, 그 열에 높은 확률을 주는 가중치 $\theta$를 비교하는 값이다. 확률과 가능도의 방향, 로그와 음의 부호가 필요한 이유는 이 독립 문서에서 계산으로 확인한다.
- **토큰(token)**: 모델이 읽고 내는 텍스트 조각이다. 사람에게 한 단어처럼 보여도 tokenizer에 따라 여러 토큰일 수 있다. 아래의 짧은 문장 예시는 계산을 위한 사람이 읽기 쉬운 표기다.
- **토큰 열(sequence)**: 순서가 있는 토큰 목록이다. $x=(x_1,\ldots,x_T)$에서 $x_t$는 $t$번째 토큰이고, $T$는 전체 토큰 수다.
- **조건부 확률**: $p_\theta(x_t\mid x_{<t})$의 세로 막대 $\mid$는 “앞 토큰들이 주어졌을 때”를 뜻한다. $x_{<t}$는 $t$보다 앞의 모든 토큰이다. $\theta$는 학습으로 바뀌는 모델 가중치 전체다.
- **가중치 갱신**: 정답과 예측을 비교해 $\theta$를 바꾸는 일이다. GPT-1의 fine-tuning에는 이것이 있다. GPT-2의 원 zero-shot 평가는 평가할 때 이를 하지 않는다.
- **점수와 확률**: 모델 내부의 실수 점수는 음수도 될 수 있고 합이 1일 필요도 없다. 확률은 0과 1 사이이고, 같은 자리의 모든 후보 확률을 더하면 1이다. 후보를 고를 때 점수 자체, 정규화한 확률, 여러 자리 확률의 곱은 같은 말이 아니다.

### 두 모델이 바꾼 곳

| 질문 | GPT-1의 답 | GPT-2의 답 |
| --- | --- | --- |
| 사전 학습 뒤 무엇을 바꾸는가? | 과제 입력·출력층을 만들고 전체 가중치를 label로 갱신한다. | 가중치는 고정하고, 입력 cue와 후보 채점·생성 방식을 바꾼다. |
| 과제 label이 필요한가? | 미세조정에는 필요하다. | 평가 시에는 과제별 training label을 쓰지 않는다. |
| 대표 출력 | class 또는 후보별 class 점수 | 이어 쓴 텍스트 또는 후보 열의 언어 모델 확률 |
| 주된 주장 | 사전 학습 표현이 지도 과제 전이에 도움을 준다. | 큰 언어 모델이 여러 과제 형식을 zero-shot으로 어느 정도 수행할 수 있다. |

‘GPT-2가 fine-tuning을 쓸 수 없게 만들었다’는 뜻은 아니다. 논문은 zero-shot 가능성을 분리해 측정했고, 더 높은 과제 성능을 위한 fine-tuning의 여지도 명시했다.

## 2단계 — 작동 원리

### 가장 작은 구체적 예

사람이 읽기 쉽게 토큰 열을 ‘오늘 / 비가 / 온다’라고 적어 보자. 첫 두 조각이 주어졌을 때 모델은 다음 위치의 후보마다 확률을 낸다.

| 앞 문맥 | 다음 후보 | 설명용 확률 |
| --- | --- | ---: |
| 오늘 / 비가 | 온다 | 0.60 |
| 오늘 / 비가 | 그립다 | 0.30 |
| 오늘 / 비가 | 42 | 0.10 |

세 확률의 합은 $0.60+0.30+0.10=1.00$이다. 모델은 ‘문장의 참뜻’을 이 표처럼 별도로 저장하는 것이 아니라, 학습된 가중치 $\theta$로 현재 문맥에서 후보들의 상대적 가능성을 계산한다. 가장 큰 확률을 고르면 ‘온다’가 나오지만, 실제 생성은 무조건 가장 큰 후보만 고르는 방식, 무작위 표본을 뽑는 방식 등 여러 decoding 선택을 할 수 있다.

### 다음-token 학습에서 전체 문장 확률까지

토큰 열 하나가 나올 확률은 앞에서 뒤로 이어지는 조건부 확률의 곱으로 쓴다.

\[
p_\theta(x)
=
\prod_{t=1}^{T}
p_\theta(x_t\mid x_{<t}).
\]

이 식은 “첫 토큰이 나오고, 그 앞부분이 주어진 둘째 토큰이 나오고, 계속해서 마지막 토큰이 나온다”는 확률의 곱셈 규칙이다. causal이라는 말은 바로 이 방향을 뜻한다. $t$번째 위치는 미래 토큰 $x_{>t}$를 보지 않고 앞부분 $x_{<t}$만 조건으로 쓴다.

훈련 때는 정답 문장 전체가 이미 있으므로 각 위치의 정답 확률을 한 번에 계산할 수 있다. 실제 생성 때는 아직 다음 정답을 모르므로, 방금 낸 토큰을 다음 조건에 넣으며 한 자리씩 진행한다. 훈련이 병렬 계산 가능하다는 사실과 긴 문장 생성이 순차적이라는 사실은 모순이 아니다.

### 같은 확률 모델을 쓰는 두 전이 경로

GPT-1에서는 ‘이 문장은 긍정인가?’ 같은 label 과제를 입력 열로 만들고 정답 class 확률을 높이도록 가중치를 다시 배운다. 예를 들어 전제와 가설 사이에 구분 토큰을 넣고 관계 class를 맞히게 할 수 있다. label이 알려 주는 직접적인 정답 신호가 모델 전체에 전달된다.

GPT-2의 zero-shot에서는 같은 과제를 “질문: … 답:”처럼 텍스트 속 빈자리로 만든다. 모델이 내는 이어쓰기 또는 미리 준비한 후보 중 어느 쪽의 이어질 확률이 큰지를 사용한다. 이 문장의 prompt는 작동 원리를 보이기 위한 편집부 예이며, GPT-2 논문의 모든 benchmark가 이 한 문구를 쓴 것은 아니다.

### 후보 채점과 자유 생성은 다른 일

후보가 이미 세 개 주어진 다지선다 문제라면, 모델은 후보 A·B·C를 각각 뒤에 붙여 어느 열이 더 그럴듯한지 비교할 수 있다. 이때 출력 공간은 준비된 후보 집합으로 제한된다. 반면 요약처럼 정답 문장이 미리 주어지지 않으면 후보를 하나씩 생성해야 한다. 앞의 작은 선택이 뒤 문맥을 바꾸므로, 생성은 후보 채점보다 오류가 누적되기 쉽다.

## 3단계 — 기술과 근거

### GPT-1의 사전 학습 목적: 텍스트에서 무엇을 배우게 하는가

GPT-1 원 논문은 비표지 토큰 열 $U=(u_1,\ldots,u_N)$에 대해 다음의 로그가능도(log-likelihood)를 **최대화**했다.

#### 수식이 답하려는 질문

“앞의 최대 $k$개 토큰을 보았을 때, 실제 다음 토큰 $u_i$에 높은 확률을 주도록 가중치 $\Theta$를 어떻게 정할까?”가 이 식의 질문이다. 모든 다음-token 정답은 텍스트 안에 이미 있으므로 별도의 사람이 붙인 class label은 필요 없다.

긴 조건부확률을 한 자리의 정답 확률 $q_i$로 줄여 쓰겠다. 원 논문 표기는 $q_i=P(u_i\mid u_{i-k},\ldots,u_{i-1};\Theta)$다. 즉 $q_i$는 앞의 최대 $k$개 token과 가중치 $\Theta$가 주어졌을 때 실제 $u_i$가 나올 확률이다.

\[
L_1(U)
=
\sum_i
\log q_i.
\]

| 기호 | 현재 문서에서의 의미 | 종류·범위 | 어디서 오는가 |
| --- | --- | --- | --- |
| $U$ | 사전 학습용 토큰 열 전체 | 길이 $N$인 관측 텍스트 | BookCorpus 같은 비표지 자료 |
| $u_i$ | $i$번째 실제 정답 토큰 | 어휘의 한 항목 | 관측 텍스트 |
| $u_{i-k},\ldots,u_{i-1}$ | 현재 위치 앞의 최대 $k$개 문맥 토큰 | 길이 최대 $k$의 열 | 관측 텍스트 |
| $k$ | 모델이 한 번에 볼 수 있게 정한 문맥 창 | 양의 정수 hyperparameter | 설계 선택 |
| $\Theta$ | GPT-1의 모든 학습 가중치 | 실수 매개변수 묶음 | 학습으로 갱신 |
| $q_i$ | 실제 $u_i$에 준 조건부확률 | 0과 1 사이의 스칼라 | $P(\cdot)$가 $\Theta$와 문맥에서 계산 |
| $L_1$ | 정답 확률들의 로그 합 | 0 이하의 실수 | 최대화할 목적값 |

각 확률을 곱하면 문장 전체 확률이 되지만, 많은 0과 1 사이 수를 곱하면 컴퓨터에서는 매우 작은 수가 된다. 로그는 곱을 합으로 바꾸므로, 긴 열의 기여를 자리별로 더할 수 있다. 확률이 1에 가까우면 로그는 0에 가깝고, 정답 확률이 작으면 로그는 큰 음수가 된다. 따라서 $L_1$을 크게, 즉 덜 음수가 되게 만드는 것은 모든 정답 token에 큰 확률을 주게 한다.

세 자리의 정답 확률을 설명용으로 $0.8$, $0.5$, $0.25$라고 하자. 전체 확률은 다음처럼 작아진다.

\[
0.8\times0.5\times0.25=0.1.
\]

로그를 적용하면 같은 비교를 합으로 할 수 있다.

\[
\log(0.8)+\log(0.5)+\log(0.25)
\approx-0.223-0.693-1.386
=-2.302.
\]

원 논문의 $L_1$은 이 값을 **최대화**한다. 오늘날 구현에서 흔히 보는 음의 로그가능도 손실은 $J_{\mathrm{LM}}=-L_1$처럼 부호를 바꿔 **최소화**한다. 둘은 목표가 반대가 아니라, 같은 선호를 최대화 문제와 최소화 문제로 다르게 적은 것이다. 확률을 반올림해 정확히 0으로 만들면 $\log 0$이 정의되지 않으므로 실제 구현은 확률을 먼저 0으로 만들지 않고 수치적으로 안정된 log-softmax를 쓴다.

GPT-1의 보고된 설정은 12층 causal Transformer, 약 117M 매개변수, 512-token 문맥 창과 BookCorpus의 7천 권이 넘는 미출간 책을 사용했다. 512은 $k$의 가능한 최대 길이이지, 모든 문장이 정확히 512 token이라는 뜻은 아니다. 더 긴 text는 이 창 안에서 잘라 보므로 창 밖의 과거는 현재 계산에 직접 들어오지 않는다.

### GPT-1의 지도 미세조정: class 확률을 더하는 이유

사전 학습만으로는 ‘긍정’, ‘모순’, ‘정답 후보 2번’ 같은 과제 label이 무엇인지 정해져 있지 않다. GPT-1은 과제 입력을 하나의 토큰 열로 바꾸고 마지막 위치의 Transformer 표현 $\mathbf h_m$에 작은 출력층을 붙였다.

\[
\mathbf z
=
\mathbf h_m W_y,
\qquad
P_\Theta(y=c\mid x)
=
\frac{\exp(z_c)}
{\sum_{r=1}^{C}\exp(z_r)}.
\]

여기서 $x=(x^1,\ldots,x^m)$은 과제 입력의 $m$개 토큰이고, $\mathbf h_m\in\mathbb{R}^{1\times d}$는 마지막 위치의 길이 $d$ 표현이다. $W_y\in\mathbb{R}^{d\times C}$는 $d$차원 표현을 $C$개 class 점수로 바꾸는 학습 행렬이다. $\mathbf z\in\mathbb{R}^{1\times C}$의 $z_c$는 class $c$의 logit, 즉 아직 확률이 아닌 실수 점수다.

지수 함수는 모든 점수를 양수로 바꾸고, 분모는 $C$개 후보의 양수 합이다. 그래서 $P_\Theta(y=c\mid x)$는 0과 1 사이가 되고 모든 class 확률의 합은 1이 된다. 분모의 $r$은 현재 확인하는 class $c$가 아니라 가능한 모든 class를 훑는 인덱스다. class 수가 셋이고 logit이 $[0,1,2]$라면 확률은 대략 $[0.090,0.245,0.665]$다. 가장 큰 logit 2가 세 번째 class에 가장 큰 확률을 준다.

논문은 과제 구조를 버리지 않았다. 한 문장 분류는 문장 뒤에 추출 위치를, 함의는 전제와 가설 사이에 delimiter를, 유사도는 두 문장 순서를 모두, 다지선다 질의응답은 문맥·질문·후보 답을 한 열로 만들었다. 따라서 GPT-1의 전이는 ‘문장을 넣으면 자동으로 모든 과제를 안다’가 아니라, **과제의 구조를 토큰 열과 class 출력으로 설계한 뒤 label로 적응하는 과정**이다.

지도 자료 $\mathcal C$의 목적은 다음처럼 쓴다.

\[
L_2(\mathcal C)
=
\sum_{(x,y)\in\mathcal C}
\log P_\Theta(y\mid x).
\]

$\mathcal C$는 입력 $x$와 정답 label $y$ 쌍의 모음이다. 합은 그 모음의 각 예에 걸친다. 이 식도 $L_1$처럼 최대화한다. 정답 class의 확률이 1에 가까울수록 해당 항은 0에 가까워지고, 틀린 class에 확률을 몰아주면 큰 음수가 된다.

### GPT-1의 결합 목적: 왜 $L_2$에 $L_1$을 더하는가

원 논문은 미세조정 중에도 언어 모델 목적을 보조 항으로 남겼다.

#### 수식이 답하려는 질문

작은 label 자료에 맞추면서도 사전 학습 때 배운 다음-token 예측을 갑자기 잊지 않게 하려면, 두 목적의 영향을 어떻게 함께 줄까?

\[
L_3(\mathcal C)
=
L_2(\mathcal C)
+
\lambda L_1(\mathcal C).
\]

$L_2(\mathcal C)$는 class 정답을 맞히는 지도 로그가능도다. $L_1(\mathcal C)$는 같은 미세조정 입력 열에서 다음-token 예측을 계속 잘하게 하는 보조 로그가능도다. $\lambda\ge0$는 두 항의 상대 비중을 정하는 hyperparameter다. $\lambda=0$이면 지도 목적만 남고, $\lambda$가 커질수록 언어 모델 목적의 영향이 커진다. GPT-1의 보고된 설정은 $\lambda=0.5$를 사용했다.

한 mini-batch의 항을 비교하기 좋게 평균으로 나눈 설명용 값이 $L_2=-0.40$, $L_1=-0.80$, $\lambda=0.5$라고 하자.

\[
L_3
=
-0.40
+
0.5\times(-0.80)
=
-0.80.
\]

이 값도 최대화한다. 코드에서 최소화 형태로 쓰면 $J=-L_3=0.80$이다. 더 높은 정답 확률은 각 로그 항을 덜 음수로 만들어 $L_3$을 올리고 $J$를 내린다. 더하기는 두 요구가 한 update에 모두 영향을 주게 하고, $\lambda$를 곱하는 것은 label 예 한 단위와 token 예 여러 단위의 규모를 조절하기 위해서다.

이 결합은 수학적으로 유일한 선택이 아니다. 지도 목적만 쓰거나, 본체를 얼리고 출력층만 학습하거나, 가중치 변화 자체를 벌하는 규제를 둘 수도 있다. GPT-1 논문에서 $L_1$은 매개변수 크기에 직접 벌점을 주는 고전적 regularizer라기보다, 언어 모델링을 계속 수행하게 하는 **보조 목적**이다. 저자들은 이 항이 최적화를 빠르게 하고 성능을 높였다고 보고했지만, 모든 데이터 크기·과제에서 같은 비중이 최선이라는 증명은 아니다.

GPT-1은 자연어 추론, 질의응답, 의미 유사도, 분류를 포함한 12개 데이터셋 중 9개에서 당시 최고 결과를 유의하게 개선했다고 보고했다. 이 결과는 BookCorpus, 117M 구조, input transformation, 미세조정 recipe와 당시 benchmark의 조합에 대한 결과이며, 오늘날 모든 언어·과제의 우위를 뜻하지 않는다.

### GPT-2의 확대: 모델 크기 하나만 바뀐 것이 아니다

GPT-2는 GPT-1의 causal 다음-token 목적을 유지하면서 모델, 자료, 문맥 창과 일부 구현 세부를 함께 확대했다.

| 논문 Table 2 모델 | 층 | hidden size | 논문 매개변수 표기 |
| --- | ---: | ---: | ---: |
| small | 12 | 768 | 117M |
| medium | 24 | 1024 | 345M |
| large | 36 | 1280 | 762M |
| XL | 48 | 1600 | 1542M |

논문은 WebText의 약 8백만 문서와 40GB text를 사용했다. 이 자료는 Reddit 게시물에서 karma 3 이상을 받은 **외부 link**를 출발점으로 4,500만 link를 수집하고, 중복 제거와 heuristic을 거쳐 만든 초기 corpus다. Reddit 전체 글이나 인터넷 전체를 무작위로 긁은 표본과 같지 않으며, Wikipedia는 평가 오염을 줄이기 위해 제거했다.

GPT-2는 50,257개 어휘의 byte-level BPE를 사용했다. byte-level은 여러 문자와 드문 문자열을 byte 단위에서 되돌릴 수 있게 다루는 tokenization 방식이지, token으로 나누지 않는다는 뜻이 아니다. 문맥 창은 512에서 1024 token으로 늘었고, 각 sub-block 입력 쪽의 layer normalization과 마지막 추가 layer normalization 같은 구조 세부도 바뀌었다. 그러므로 성능 차이를 매개변수 수 하나의 순수 효과로 읽을 수 없다.

공개 단계에서 보이는 124M·355M·774M·1.5B라는 표기는 논문의 117M·345M·762M·1542M과 반올림·구현의 매개변수 집계가 다르게 표현된 것이다. 이것을 별도의 다섯 번째 모델 실험으로 세면 안 된다.

### GPT-2 zero-shot 채점: 후보 열의 확률을 비교하는 법

후보 집합을 $\mathcal A$라고 하자. 문맥 $h$ 뒤에 후보 $a=(a_1,\ldots,a_m)$를 붙일 때, $j$번째 후보 토큰의 확률을 짧게 $r_j$라고 쓰면 다음과 같다.

\[
r_j
=
p_\theta(a_j\mid h,a_{<j}).
\]

후보 전체의 확률은 $\prod_j r_j$이고, 비교하기 편한 로그 점수는 다음처럼 쓴다.

\[
S(a;h)
=
\sum_{j=1}^{m}
\log r_j,
\qquad
\hat a
=
\underset{a\in\mathcal A}{\operatorname{argmax}}
\ S(a;h).
\]

#### 수식이 답하려는 질문

“가중치를 고치지 않은 언어 모델이 이미 주어진 후보 중 무엇을 더 자연스럽게 이어진다고 보는가?”가 이 식의 질문이다. $h$는 질문이나 앞 문장 같은 고정 문맥, $a_j$는 후보의 $j$번째 token, $a_{<j}$는 그보다 앞선 후보 token들이다. $m$은 후보 길이이고, $S$는 확률이 아니라 여러 로그확률을 더한 실수 점수다. $\hat a$는 가장 큰 점수의 **값**이 아니라 그 점수를 가진 후보를 가리킨다.

합은 후보의 모든 자리가 맞을 확률을 누적하기 위해 쓰고, 로그는 확률의 곱을 합으로 바꿔 아주 작은 수의 곱셈을 피한다. argmax는 가장 그럴듯한 후보 하나를 선택한다. GPT-2 논문의 CBT 평가에서는 후보만 따로 보지 않고 그 후보 뒤의 문장 나머지까지 조건부 확률로 평가했다. 후보가 문맥을 더 자연스럽게 만들면 뒤 문장도 더 높은 확률을 받아야 한다는 과제별 설계다.

두 토큰 길이가 같은 설명용 후보 A와 B를 비교해 보자.

| 후보 | 첫 token 정답 확률 | 둘째 token 정답 확률 | 확률의 곱 | 로그 점수 |
| --- | ---: | ---: | ---: | ---: |
| A | 0.50 | 0.40 | $0.50\times0.40=0.20$ | $\log 0.50+\log 0.40\approx-1.609$ |
| B | 0.30 | 0.90 | $0.30\times0.90=0.27$ | $\log 0.30+\log 0.90\approx-1.309$ |

$-1.309$가 $-1.609$보다 크므로 이 규칙은 B를 고른다. 첫 token만 보면 A가 커 보이지만, 후보 전체를 곱하면 B가 더 그럴듯하다. 이 숫자는 GPT-2의 실제 출력이 아니라 식을 손으로 따라가기 위한 편집부 예다.

길이가 서로 다른 후보를 단순히 곱하면, 1보다 작은 확률을 더 많이 곱하는 긴 후보가 불리할 수 있다. 그런 비교에는 평균 로그 점수

\[
\bar S(a;h)
=
\frac{1}{m}S(a;h)
\]

같은 길이 정규화를 고려할 수 있다. $m$으로 나누는 것은 후보 하나당 평균적으로 얼마나 높은 확률을 받았는지 보려는 선택이다. 그러나 이는 모든 GPT-2 benchmark에 하나의 공통 규칙으로 적용된 원 논문 공식이 아니다. 과제별 후보 길이, suffix 처리, decoding과 metric이 달랐으므로 정확한 평가 절차를 따로 확인해야 한다.

### 확률 품질을 읽는 다른 방법: perplexity

언어 모델링 평가에서는 정답 token 확률의 평균 음의 로그를 다시 지수로 바꾼 perplexity를 자주 쓴다. $q_t=p_\theta(x_t\mid x_{<t})$라고 줄여 쓰면 다음과 같다.

\[
\operatorname{PPL}
=
\exp\left(
-\frac{1}{T}
\sum_{t=1}^{T}
\log q_t
\right).
\]

$T$는 평가 token 수, $q_t$는 $t$번째 실제 token에 준 확률이다. 먼저 $-\log q_t$로 낮은 정답 확률을 큰 벌점으로 바꾸고, $T$로 나누어 긴 문장이 무조건 불리해지지 않게 평균을 낸다. 마지막 지수는 로그 단위였던 평균을 원래의 양수 스케일로 되돌린다.

예를 들어 평균 음의 로그가 $\log 2\approx0.693$이면 $PPL=\exp(0.693)\approx2$다. 이는 매 자리에서 균등한 두 후보를 고르는 것과 비슷한 불확실성이라는 직관을 줄 뿐, 실제로 후보가 정확히 둘이라는 뜻은 아니다. tokenization, 평가 corpus, byte 단위인지 token 단위인지가 다르면 perplexity 숫자를 직접 비교할 수 없다. GPT-2는 corpus와 평가에 따라 perplexity와 bits per byte를 구분해 보고했다.

### 결과와 후속 비교를 읽는 법

GPT-2는 language modeling의 8개 데이터셋 중 7개에서 강한 결과를 보고했고, LAMBADA·CBT·Winograd에서도 의미 있는 결과를 냈다. 그러나 요약은 형태가 그럴듯해도 세부 오류가 있었고 실용적이라고 보기 어려웠다. 질의응답·독해·번역도 일부 단순 기준선을 넘기기 시작했지만 당시의 지도 최고 성능과는 거리가 있었다.

zero-shot은 해당 benchmark의 label된 training set으로 모델 매개변수나 구조를 바꾸지 않았다는 평가 조건이다. WebText에 유사한 과제 형식이나 평가 text가 전혀 없었다는 보증은 아니다. 따라서 “zero-shot으로 답을 냈다”는 사실, “사전 학습 자료와 완전히 독립적이었다”는 주장, “전문 지도 시스템보다 좋았다”는 주장을 분리해야 한다.

[[067_GPT-3와 문맥 내 학습|GPT-3]]는 GPT-2의 cue 기반 zero-shot을 one-shot·few-shot demonstration까지 체계적으로 비교했다. GPT-3 논문의 여덟 모델은 300B token을 처리했고, 가장 큰 175B 모델은 GPT-2의 1.5B보다 약 $175/1.5\approx117$배 크다. 이때 자주 인용되는 ‘10배’는 GPT-2와의 직접 비교가 아니라 당시 이전의 가장 큰 비희소 언어 모델과의 비교다. GPT-3도 입력 안의 예시를 쓰되 평가 시 가중치를 갱신하지 않았으며, 그것이 GPT-2의 원 zero-shot 설정과 완전히 같은 것은 아니다.

## 검증과 한계

### 확인된 사실

GPT-1의 핵심은 causal 언어 모델 사전 학습 뒤 input transformation과 전체 fine-tuning을 결합한 전이 실험이다. GPT-2의 핵심은 더 큰 causal 언어 모델에서 task별 가중치 갱신 없이 text continuation·후보 확률로 여러 평가를 해 본 실험이다. 두 모델 모두 이후 LLM 발전의 중요한 선행 사례지만, 같은 적응 인터페이스를 쓴 하나의 모델로 합치면 안 된다.

GPT-2의 full 1.5B weights는 2019년 2월에 즉시 공개되지 않았다. 117M 규모의 초기 공개 뒤 345M, 774M을 단계적으로 공개했고, OpenAI는 2019년 11월 1.5B model weights와 code를 공개하며 staged release의 최종 단계를 마쳤다. 이는 synthetic text의 오용·탐지·공개 규범을 함께 살피려는 공개 실험이었다.

### 수식과 성능의 경계

위의 작은 확률, class logit, 후보 점수는 수식의 역할을 보이는 편집부 예다. 원 논문의 hidden state, 실제 model probability, 학습 log나 benchmark 수치를 재현하지 않는다. $L_1$, $L_2$, $L_3$은 GPT-1 논문에서 최대화한 로그가능도이고, 일반적인 “loss”라는 말만으로 부호를 지우면 최적화 방향을 반대로 이해할 수 있다.

다음-token 확률이 높다는 것은 그 문맥에서 자주 이어질 법한 text를 모델이 선호한다는 뜻이다. 이는 사실 검증, 출처 추적, 인과 추론, 공정성 또는 안전성을 직접 최적화하지 않는다. 유창한 continuation과 참인 답을 같은 성질로 취급할 수 없다.

### 적용 범위와 흔한 오해

- GPT-1이 NLP 전이를 단독 발명한 것은 아니다. ELMo·ULMFiT 등 동시기·선행 언어 모델 전이 연구가 있었다.
- GPT-1이 모든 과제를 label 없이 풀었다는 뜻은 아니다. label, 입력 변환, 출력층과 전체 미세조정을 썼다.
- GPT-2가 ‘다음 단어 하나’만 봤다는 뜻은 아니다. 최대 1024 token의 앞 문맥에서 각 다음 token을 예측했다. 다만 미래 token은 볼 수 없다.
- GPT-2가 자연어 지시를 보편적으로 따르는 assistant였다는 뜻은 아니다. 원 평가의 cue·후보 채점·greedy 또는 top-k decoding은 과제별로 정해졌다.
- 규모가 커진 네 결과만으로 불연속적 창발이 증명되지는 않는다. 자료, context 길이, tokenization과 구현 세부도 함께 바뀌었다.
- zero-shot 결과는 contamination이 없다는 증명도, 모든 downstream task에서 지도 최고 성능이라는 증명도 아니다.

## 학습 확인

### 확인 질문

1. GPT-1과 GPT-2는 같은 다음-token 확률 모델을 각각 어느 지점에서 다르게 과제에 적응시켰는가?
2. 정답 확률이 $0.8$, $0.5$, $0.25$일 때 로그가능도와 음의 로그 손실은 각각 어떤 부호와 대략 어떤 값이 되는가?
3. 길이가 다른 후보에서 단순 로그 점수와 평균 로그 점수가 다른 판단을 낼 수 있는 이유는 무엇이며, GPT-2 논문 전체에 하나의 정규화 공식을 마음대로 적용하면 안 되는 이유는 무엇인가?

### 다음 문서

- [[059_GPT-1과 GPT-2의 전이 방식 변화]] — 원 GPT-1·GPT-2 논문의 데이터, 입력 변환, benchmark별 채점 조건과 raw의 서술을 대조한다.
- [[자기회귀 생성]] — 다음-token 확률이 실제 생성에서 어떻게 한 token씩 조건을 바꾸는지 더 자세히 살핀다.

## 출처

- [[059_GPT-1과 GPT-2의 전이 방식 변화]]
- Alec Radford 외, [Improving Language Understanding by Generative Pre-Training](https://cdn.openai.com/research-covers/language-unsupervised/language_understanding_paper.pdf), 2018, 특히 §§1–3, Tables 1–3.
- Alec Radford 외, [Language Models are Unsupervised Multitask Learners](https://cdn.openai.com/better-language-models/language_models_are_unsupervised_multitask_learners.pdf), 2019, 특히 §§1–4, Tables 2–8.
- OpenAI, [Better Language Models and Their Implications](https://openai.com/index/better-language-models/), 2019 original post와 interim updates.
- OpenAI, [GPT-2: 1.5B release](https://openai.com/index/gpt-2-1-5b-release/), 2019-11-05.
- [[067_GPT-3와 문맥 내 학습]]
- Tom B. Brown 외, [Language Models are Few-Shot Learners](https://arxiv.org/abs/2005.14065), NeurIPS 2020, §§1–3.

## 관련 항목

- [[059_GPT-1과 GPT-2의 전이 방식 변화]]
- [[067_GPT-3와 문맥 내 학습]]
- [[자기회귀 생성]]
- [[언어 모델 전이 학습]]
- [[로그가능도]]
- [[문맥 내 학습]]
- [[BERT]]
- [[Transformer]]
