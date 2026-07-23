---
schema_version: 2
id: source.059
page_type: source
title: GPT-1과 GPT-2의 전이 방식 변화
aliases:
  - 059_GPT-1 & GPT-2 Autoregressive Pretraining and Transfer Learning
  - Improving Language Understanding by Generative Pre-Training
  - Language Models are Unsupervised Multitask Learners
tags:
  - type/source
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
evidence:
  - source_id: gpt-2018
    locator: '초록과 §§1–3의 자기회귀 사전 학습·과제별 입력 변환·지도 미세조정, §§4–5와 Tables 2–7의 12개 과제·ablation·zero-shot 분석'
    relation: supports
  - source_id: radford-et-al-2019-gpt2
    locator: '초록과 §§1–3의 WebText·byte-level BPE·1.5B 구조, §§3–4와 Tables 2–8의 zero-shot language modeling·CBT·LAMBADA·Winograd·QA·번역·요약'
    relation: supports
  - source_id: openai-2019-gpt2-release
    locator: '2019-02-14 original post와 2019-05 interim update의 117M·345M staged release, zero-shot·sample failure·policy 설명'
    relation: contextualizes
  - source_id: openai-2019-gpt2-1-5b-release
    locator: '2019-11-05 final model release의 1.5B 모델 weights·code 공개와 staged release 결말'
    relation: contextualizes
related:
  - concept.gpt-1-gpt-2
  - concept.로그-가능도
  - concept.자기회귀-생성
  - concept.언어-모델-전이-학습
  - concept.bert
  - source.058
---
# GPT-1과 GPT-2의 전이 방식 변화

> [!note] 학습 안내
> **난이도:** 기초 → 중급<br>
> **선수 지식:** 없음 — token 열, 조건부확률, [[로그가능도]]와 가중치 갱신의 차이를 이 문서에서 실제 원 논문 설정으로 다시 만든다.<br>
> **읽고 나면:** GPT-1의 $L_1,L_2,L_3$가 무엇을 최대화했는지와 GPT-2가 zero-shot에서 무엇을 고정하고 무엇을 채점했는지를 원 논문의 자료·모델·평가 조건과 함께 설명할 수 있다.

## 1단계 — 먼저 잡을 핵심

### 핵심 문장

원문은 GPT-1과 GPT-2가 자기회귀 사전 학습과 전이 학습으로 현대 생성 LLM의 토대를 만들었다고 설명한다. 큰 방향은 맞지만, 두 모델의 적응 방식과 zero-shot 성능의 강도를 한 서사로 합치면 중요한 차이가 사라진다.

- GPT-1은 causal Transformer를 다음-token 예측으로 사전 학습한 뒤, 표지된 과제 자료로 전체 가중치를 fine-tuning했다.
- GPT-2는 더 큰 causal 언어 모델을 가중치 갱신 없이 과제별 text cue, decoding, 후보 확률 채점으로 평가했다.
- GPT-2가 과제 형식의 text를 만들었다는 관찰과, 지도 최고 성능·사실성·현대 지시 따르기를 달성했다는 주장은 다르다.
- 1.5B GPT-2 weights의 초기 보류는 영구 비공개가 아니라 2019년 11월에 마무리된 staged release였다.

### 원자료가 제기한 문제

GPT-1 논문은 비표지 text에서 먼저 일반 언어 표현을 학습하면 작은 지도 자료로 여러 NLP 과제에 전이할 수 있는지 물었다. 당시 과제마다 자료·입력 형식·출력 head를 별도로 만들던 문제에 대한 답이었다.

GPT-2 논문은 질문을 바꿨다. 비표지 text만의 다음-token 예측을 크게 확장하면, 번역·요약·질의응답·다지선다처럼 서로 다른 과제 형식이 자연 발생 text 안에 이미 들어 있을 수 있으며, 별도의 fine-tuning 없이 꺼내 쓸 수 있는가를 시험했다. 이는 그 가설을 여러 benchmark에서 측정한 실험이지, 자연어 과제의 일반 해법이 완성됐다는 선언이 아니다.

### 원문 상태와 읽는 범위

프로젝트의 raw 번역·해설은 수집 당시의 설명을 보존한 artifact다. 아래 공개 문서는 GPT-1·GPT-2 원 논문과 OpenAI의 당시 공개 기록을 기준으로, raw의 서술 중 정확한 조건을 더한다. raw 파일은 수정하지 않는다.

이 문서는 GPT라는 이름 전체의 연대기가 아니라, **사전 학습한 자기회귀 확률모형을 과제에 연결하는 두 인터페이스**를 다룬다. GPT-3의 one-shot·few-shot 비교, instruction tuning, RLHF는 여기서 직접 실험한 대상이 아니다.

## 2단계 — 작동 원리

### 공통 기반: 앞 문맥에서 다음 token의 확률을 만든다

토큰 열을 $x=(x_1,\ldots,x_T)$라고 하자. $x_t$는 $t$번째 실제 token, $x_{<t}$는 그보다 앞선 token들, $\theta$는 학습 가중치 전체다. GPT-1과 GPT-2는 모두 다음 확률을 높이도록 학습한 causal 언어 모델이다.

\[
p_\theta(x_{1:T})
=
\prod_{t=1}^{T}
p_\theta(x_t\mid x_{<t})
\]

각 인수는 “앞 문맥이 주어졌을 때, 실제 다음 token $x_t$가 나올 확률”이다. 전체 열이 나올 확률은 token 순서대로 조건을 붙인 확률의 곱이 된다. 이 곱은 token들이 독립이라는 가정이 아니라, 결합확률을 조건부확률로 나누는 연쇄 법칙이다. causal Transformer는 현재 위치가 미래 token을 볼 수 없게 해 이 방향을 구현한다.

확률을 많이 곱하면 값이 매우 작아지므로 실제 학습은 로그가능도를 쓴다. 로그는 곱을 합으로 바꾼다.

\[
\ell_\theta(x_{1:T})
=
\sum_{t=1}^{T}
\log p_\theta(x_t\mid x_{<t})
\]

$\ell_\theta$는 이 한 text 열의 로그가능도다. 확률이 높을수록 각 로그 항은 0에 가까워져 합이 커진다. 논문은 이 값을 최대화하는 방식으로 적었고, 현대 코드에서는 $-\ell_\theta$를 손실로 최소화하는 경우가 많다. 확률과 가능도의 방향, 로그·음수·평균이 필요한 이유는 [[로그가능도]]에서 동전 예와 함께 더 자세히 다룬다.

훈련에는 정답 열 전체가 있으므로 여러 위치의 정답 확률을 병렬로 계산할 수 있다. 실제 생성에는 미래 정답이 없으므로, 방금 낸 token을 다음 조건에 넣으며 순차적으로 진행한다. 훈련 계산의 병렬성과 생성 지연을 혼동하지 않는다.

### GPT-1: 사전 학습 뒤 label로 가중치를 바꾼다

GPT-1은 먼저 긴 비표지 text에서 위의 다음-token 목적을 학습한다. 이후에는 자연어 추론·유사도·분류·질의응답의 구조화된 입력을 하나의 token 열로 바꾸고, 정답 class의 확률을 높이도록 model 전체를 미세조정한다.

입력 형식은 과제마다 달랐다.

| 과제 | 한 token 열로 바꾼 입력 | 출력이 뜻하는 것 |
| --- | --- | --- |
| 단일 문장 분류 | 시작 표지, 문장, 추출 위치 | 마지막 표현에서 class |
| 텍스트 함의 | 시작 표지, 전제, 구분 표지, 가설, 추출 위치 | entailment 관계 class |
| 문장 유사도 | 두 문장 순서를 둘 다 구성해 표현을 합침 | 연속 또는 범주 점수 |
| 다지선다 QA·상식 | 문맥, 질문, 후보 답을 후보별 열로 구성 | 후보 중 정답 class |

구분 표지와 추출 위치는 보통 사람이 읽는 뜻의 단어가 아니라 모델이 열의 역할과 경계를 구별하게 하는 special token이다. 이 설계가 있어야 Transformer가 같은 causal stack으로도 전제와 가설, 질문과 후보의 구성을 구별할 수 있다.

GPT-1의 전이는 “사전 학습 checkpoint에 과제 text를 넣으면 끝”이 아니다. label, 입력 transformation, task-specific output layer, 전체 가중치 update가 모두 들어간 지도 전이다.

### GPT-2: 가중치는 고정하고 입력과 채점 규칙을 바꾼다

GPT-2의 zero-shot 평가는 평가할 때 model parameter나 architecture를 바꾸지 않았다. 대신 과제 자체를 language model이 이어 쓸 text로 적었다.

- language modeling에서는 실제 다음 token들에 준 확률을 perplexity나 bits per byte로 평가했다.
- LAMBADA·CBT·Winograd에서는 정답 token 또는 후보의 언어 모델 확률을 비교했다.
- 번역은 언어쌍 예의 형식을 cue로 만들고 greedy decoding으로 이어 썼다.
- 요약은 article 뒤에 TL;DR 표지를 두고 top-k sampling으로 continuation을 만들었다.
- CoQA 같은 질의응답·독해는 문서·질문·이전 답 형식을 주고 답 text를 생성하거나 후보를 평가했다.

따라서 zero-shot은 입력이 빈 상태라는 뜻도, 학습 text에 비슷한 형식이 전혀 없었다는 뜻도 아니다. 해당 benchmark의 표지 training set으로 모델 가중치를 갱신하지 않았다는 평가 조건이다. prompt, 후보 길이, suffix 점수, greedy·sampling 선택도 결과의 일부다.

## 3단계 — 기술과 근거

### GPT-1의 세 목적: 무엇을 최대화했는가

GPT-1 원 논문은 비표지 token 열 $U=(u_1,\ldots,u_N)$에 대해 사전 학습 목적을 다음처럼 썼다.

#### 수식이 답하려는 질문

사람이 label을 붙이지 않은 text에서, 모델이 앞 문맥을 보고 실제 다음 token에 높은 확률을 주게 하려면 어떤 값을 키워야 할까?

원 논문의 긴 조건부확률을 현재 위치의 정답 확률 $q_i$로 줄여 쓰겠다. 원 표기는 $q_i=P(u_i\mid u_{i-k},\ldots,u_{i-1};\Theta)$다. 즉 $q_i$는 앞의 최대 $k$개 token과 가중치 $\Theta$가 주어졌을 때 실제 $u_i$에 준 확률이다.

\[
L_1(U)
=
\sum_i
\log q_i
\]

| 기호 | 의미 | 종류와 출처 |
| --- | --- | --- |
| $U$ | 사전 학습 text의 token 열 | 길이 $N$인 관측 자료 |
| $u_i$ | $i$번째 실제 다음 token | 어휘의 한 항목 |
| $u_{i-k},\ldots,u_{i-1}$ | 바로 앞의 최대 $k$개 문맥 | 관측된 token 열 |
| $k$ | 한 계산에서 사용할 문맥 창 | 설계가 정한 양의 정수 |
| $\Theta$ | GPT-1의 모든 학습 가중치 | update되는 실수 매개변수 묶음 |
| $q_i$ | 실제 $u_i$에 준 조건부확률 | 0과 1 사이의 스칼라 |
| $L_1$ | token 로그확률의 합 | 최대화하는 로그가능도 |

합은 모든 token 위치의 기여를 모으기 위해 쓰고, 로그는 확률들의 곱을 합으로 바꾸기 위해 쓴다. 원 논문의 $L_1$은 최소화 손실이 아니라 최대화 목적이다. 코드에서 음의 로그가능도 $J_{\mathrm{LM}}=-L_1$를 최소화하면 같은 방향으로 가중치가 바뀐다.

GPT-1은 약 117M 매개변수, 12층 causal Transformer, 512-token context를 사용했다. Toronto BookCorpus의 7천 권이 넘는 미출간 책 text로 사전 학습했다. 512은 한 번에 모델에 주는 최대 문맥 길이이며, 책 전체의 과거가 모든 위치에서 직접 보였다는 뜻은 아니다.

후속 지도 자료 $\mathcal C$의 입력·label 쌍을 $(x,y)$로 쓰면, class 목적은 다음처럼 정답 class 확률의 로그를 더한다.

\[
L_2(\mathcal C)
=
\sum_{(x,y)\in\mathcal C}
\log P_\Theta(y\mid x)
\]

사전 학습 목적을 보조 항으로 남긴 결합 목적은 다음이다.

\[
L_3(\mathcal C)
=
L_2(\mathcal C)
+
\lambda L_1(\mathcal C)
\]

$L_2$는 지도 label에 맞는 class를 고르게 하는 조건부 로그가능도다. $L_1(\mathcal C)$는 미세조정 입력 열에서도 다음-token 예측을 계속 하게 하는 보조 로그가능도다. $\lambda\ge0$는 두 항의 상대 비중을 정하는 hyperparameter이며 GPT-1의 보고된 설정은 $\lambda=0.5$다.

평균으로 나눈 설명용 값 $L_2=-0.40$, $L_1=-0.80$, $\lambda=0.5$를 넣으면 다음과 같다.

\[
L_3
=
-0.40+0.5\times(-0.80)
=
-0.80
\]

이 값은 최대화한다. 더 높은 정답 확률은 로그 항을 덜 음수로 만들어 $L_3$을 올린다. $L_3$은 가중치 크기에 직접 벌점을 주는 고전적 규제가 아니라, 미세조정 중에도 language-modeling을 수행하게 하는 보조 목적이다. 지도 목적만 쓰기, 본체를 고정하기, 다른 규제를 쓰기는 가능한 대안이며, 이 결합식이 모든 과제에서 유일한 선택은 아니다.

논문은 12개 데이터셋 중 9개에서 당시 최고 결과를 유의하게 개선했다고 보고했다. 이 수치는 BookCorpus·117M 구조·input transformation·fine-tuning recipe와 당시 benchmark 조합의 결과다. GPT-1의 zero-shot 분석은 네 언어 현상을 설명적으로 살핀 부차적 분석이며, 논문의 주 성과는 label을 쓴 전이였다.

### GPT-2의 자료와 구조: 규모만 하나 바뀐 것이 아니다

GPT-2 논문 Table 2의 네 모델은 다음과 같다.

| 모델 | 층 | hidden size | 논문 매개변수 표기 |
| --- | ---: | ---: | ---: |
| small | 12 | 768 | 117M |
| medium | 24 | 1024 | 345M |
| large | 36 | 1280 | 762M |
| XL | 48 | 1600 | 1542M |

WebText의 초기판은 Reddit 게시물에서 karma 3 이상을 받은 외부 link를 출발점으로 4,500만 link를 수집하고, deduplication과 heuristic 뒤 약 8백만 문서·40GB text로 만든 자료다. Reddit 전체 글이나 인터넷 전체를 무작위로 수집한 표본이 아니다. Wikipedia는 특정 평가와의 중복을 줄이려 제거했지만, 웹 출처·영어 중심성·선별 기준의 편향이 사라졌다는 뜻은 아니다.

GPT-2는 50,257개 어휘의 byte-level BPE와 1024-token context를 사용했다. byte-level BPE는 모든 text를 byte 수준에서 되돌릴 수 있게 token 조각으로 만드는 방법이지 tokenization을 하지 않는다는 뜻은 아니다. 각 sub-block 입력 쪽의 layer normalization과 마지막 추가 layer normalization도 GPT-1과 달랐다. 따라서 네 모델의 결과 차이를 parameter 수만 바꾼 한 변인의 실험으로 읽을 수 없다.

논문의 117M·345M·762M·1542M 표기와 공개 단계의 124M·355M·774M·1.5B 표기는 매개변수 집계·반올림 방식의 차이다. 이를 별도 모델 계열이나 추가 실험으로 세면 안 된다.

### GPT-2 후보 채점: text를 확률 점수로 읽는 법

문맥 $h$ 뒤의 후보 $a=(a_1,\ldots,a_m)$에 대해, $j$번째 후보 token의 확률을 $r_j$라고 줄여 쓰자.

\[
r_j
=
p_\theta(a_j\mid h,a_{<j})
\]

후보 전체의 로그 점수와 선택은 다음처럼 쓸 수 있다.

\[
S(a;h)
=
\sum_{j=1}^{m}
\log r_j,
\qquad
\hat a
=
\underset{a\in\mathcal A}{\operatorname{argmax}}
S(a;h)
\]

$h$는 질문·앞 문장처럼 고정한 문맥, $\mathcal A$는 비교할 후보 집합, $m$은 현재 후보의 token 수다. $S$는 확률이 아니라 로그확률을 더한 점수이고, $\hat a$는 점수값이 아니라 가장 큰 점수의 후보다. 로그 합을 쓰는 이유는 후보 token 확률의 곱을 작은 수로 직접 계산하지 않기 위해서다.

길이가 같은 설명용 후보 A와 B가 있다고 하자.

| 후보 | token 확률 | 확률의 곱 | 로그 점수 |
| --- | --- | ---: | ---: |
| A | $0.50,0.40$ | $0.20$ | 약 $-1.609$ |
| B | $0.30,0.90$ | $0.27$ | 약 $-1.309$ |

$-1.309>-1.609$이므로 이 규칙은 B를 고른다. 첫 token만 보면 A가 더 높아도, 후보 전체의 확률은 B가 더 크다. 이 값은 원 GPT-2 output이 아니라 로그 점수 계산을 보여 주는 편집부 예다.

GPT-2의 CBT에서는 후보 하나의 확률만 보지 않고, 그 후보 뒤의 문장 나머지까지 조건화한 확률을 사용했다. 후보가 올바르면 뒤 text도 더 자연스럽게 이어져야 한다는 benchmark별 채점 설계다. 서로 길이가 다른 후보를 단순 합으로 비교하면 긴 후보가 불리할 수 있어 평균 로그 점수 같은 정규화를 고려할 수 있지만, 이것은 GPT-2 원 논문의 모든 benchmark에 공통으로 적용된 단일 공식이 아니다.

### 결과, 한계와 규모 해석

GPT-2는 language modeling의 8개 데이터셋 중 7개에서 강한 결과를 보고했고, LAMBADA·CBT·Winograd에서도 의미 있는 결과를 냈다. 하지만 CoQA 독해·질의응답은 지도 BERT 계열보다 크게 낮았고, CNN/Daily Mail 요약은 형식이 요약처럼 보여도 세부 오류가 있어 실용적이라고 보기 어려웠다. 번역은 일부 trivial baseline을 넘기기 시작했지만 지도 최고 수준과는 거리가 있었다.

따라서 “GPT-2가 translation·summarization·QA를 zero-shot으로 수행했다”는 것은 해당 text 형식을 어느 정도 생성하거나 채점했다는 뜻이다. 모든 과제의 지도 최고 성능, 사실 검증, 일반 지시 따르기와 같은 뜻이 아니다. benchmark별 metric·prompt·decoding·후보 규칙과 절대 성능을 함께 읽어야 한다.

네 크기에서 여러 점수가 대체로 좋아진 경향은 규모 확대가 중요하다는 증거다. 그러나 WebText, context 길이, BPE, layer normalization, 계산량도 함께 바뀌었다. 네 점의 관측만으로 불연속적 창발이 규모 하나의 원인임을 증명할 수는 없다. WebText 안의 자연 발생 task format을 배웠을 수 있다는 논문의 가설도, 처음 보는 task를 순수하게 발명해 해결했다는 증명은 아니다.

### 단계적 공개와 BERT의 다른 축

2019년 2월 OpenAI는 1.5B GPT-2 weights를 즉시 공개하지 않고 작은 117M 모델과 sampling code를 공개했다. 5월 345M, 8월 774M을 공개했고, 11월 5일에는 1.5B weights와 code를 공개했다. 이 staged release는 synthetic text의 오용, 탐지, 공개 규범을 함께 검토하려는 실험이었다. 초기 보류만 기록해 1.5B가 끝내 비공개였다고 쓰면 안 된다.

[[BERT]]의 masked language model encoder는 입력 각 위치에서 좌우 문맥을 함께 보고 분류·span·token 표현에 맞는다. GPT의 causal language model은 미래 token을 보지 않아 다음-token 생성 확률과 직접 연결된다. 어느 한쪽이 모든 과제에 보편적으로 우월한 것이 아니라, 입력 표현과 출력 생성의 조건이 다르다.

GPT-1과 BERT는 사전 학습 뒤 전체 fine-tuning을 한다는 인터페이스를 공유하지만, 사전 학습 목적과 attention graph가 다르다. GPT-2는 여기에 가중치를 바꾸지 않고 input cue로 과제를 표현하는 zero-shot 경로를 시험했다.

## 검증과 한계

### 검증 정정

- **GPT가 NLP 전이 학습을 단독 발명했다**: ELMo·ULMFiT 등 동시기와 더 이른 언어 모델 전이 연구가 있었다.
- **GPT-1은 과제별 구조·자료가 전혀 필요 없었다**: 표지 자료, 입력 변환, 출력층과 전체 fine-tuning을 사용했다.
- **GPT-1은 모든 12개 과제에서 최고 성능이었다**: 12개 중 9개에서 유의한 최고 성능 개선을 보고했다.
- **GPT-2는 GPT-1을 단순히 10배 키웠다**: 자료·context·tokenization·normalization도 함께 바뀌었다.
- **WebText는 인터넷 전체를 무차별 수집했다**: Reddit의 일정 karma 이상 외부 link에서 만든 약 8백만 문서 집합이다.
- **GPT-2 zero-shot은 번역·요약·QA를 지도 최고 수준으로 해결했다**: 과제별 성능 차이가 컸고 다수 결과는 지도 모델보다 낮았다.
- **GPT-2가 현대 few-shot prompting을 이미 확립했다**: 주로 zero-shot cue와 task별 scoring을 사용했고 체계적 one-shot·few-shot 평가는 GPT-3의 주제다.
- **규모가 불연속적 창발의 유일 원인임을 증명했다**: 자료·계산·context·구조 변경이 함께 있었고 과제별 곡선도 다르다.
- **1.5B 모델은 안전 우려로 끝내 비공개였다**: staged release는 2019년 11월에 완료됐다.
- **next-token 로그가능도는 사실 검증과 명시적 추론을 학습한다**: 자연스러운 연속을 예측하는 목적이며 사실성·추론은 별도 평가가 필요하다.

### 적용 범위와 실패 조건

- GPT-2의 zero-shot은 해당 평가에서 parameter update가 없었다는 뜻이다. 사전 학습 data에 유사 text·format·평가 항목이 없었다는 보증은 아니다.
- 후보의 로그 점수는 후보 집합, 길이, suffix 포함 여부와 tokenization에 따라 달라진다. 한 과제의 score 규칙을 다른 benchmark에 그대로 옮기면 안 된다.
- 다음-token 학습은 실제 다음 token을 정답으로 본다. 높은 확률은 그 문맥에서 자연스러운 continuation의 모델 내 선호이지, 현실의 참·거짓이나 안전한 행동의 확률 보증이 아니다.
- raw artifact는 수정하지 않는다. 수치·조건의 보강과 정정은 원 1차 논문과 공개 기록을 근거로 한 공개 문서에만 둔다.

## 학습 확인

### 확인 질문

1. GPT-1의 $L_1$, $L_2$, $L_3$은 각각 무엇을 최대화하며, 왜 $L_3$에 $\lambda$가 필요한가?
2. GPT-2의 후보 A와 B가 같은 길이일 때 token 확률의 곱을 로그 합으로 바꾸어 비교하는 이유는 무엇인가?
3. GPT-2가 zero-shot으로 어떤 출력을 만들었다는 사실만으로, 사전 학습 자료와의 독립성·지도 최고 성능·사실성을 말할 수 없는 이유는 무엇인가?

### 다음 문서

- [[GPT-1과 GPT-2]] — 두 모델의 목적함수, candidate scoring, perplexity와 후속 GPT-3 비교를 개념별 수식으로 더 자세히 따라간다.
- [[로그가능도]] — 사전 관측 확률이 관측 뒤의 가능도로 바뀌는 방향, NLL·Bayes·조건부 연쇄의 근거를 기초 계산으로 다시 본다.

## 출처

- Alec Radford 외, [Improving Language Understanding by Generative Pre-Training](https://cdn.openai.com/research-covers/language-unsupervised/language_understanding_paper.pdf), 2018, 특히 §§1–3, Tables 1–3, §§4–5와 Tables 2–7.
- Alec Radford 외, [Language Models are Unsupervised Multitask Learners](https://cdn.openai.com/better-language-models/language_models_are_unsupervised_multitask_learners.pdf), 2019, 특히 §§1–4, Tables 2–8.
- OpenAI, [Better Language Models and Their Implications](https://openai.com/index/better-language-models/), 2019 original post와 interim updates.
- OpenAI, [GPT-2: 1.5B release](https://openai.com/index/gpt-2-1-5b-release/), 2019-11-05.
- 프로젝트 번역·검토 출발 자료: [GPT-1 & GPT-2 Autoregressive Pretraining and Transfer Learning](https://mbrenndoerfer.com/writing/gpt1-gpt2-autoregressive-pretraining-transfer-learning)
- 프로젝트 보존 자료: raw/059_GPT-1 & GPT-2 Autoregressive Pretraining and Transfer Learning.ko.md, raw/059_GPT-1 & GPT-2 Autoregressive Pretraining and Transfer Learning.commentary.ko.md.

## 관련 항목

- [[GPT-1과 GPT-2]]
- [[로그가능도]]
- [[자기회귀 생성]]
- [[언어 모델 전이 학습]]
- [[BERT]]
- [[058_BERT의 마스크드 양방향 사전 학습]]
