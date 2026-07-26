---
schema_version: 3
id: source.063
page_type: source
title: T5와 Text-to-Text 통합 프레임워크
aliases:
  - 063_T5 and Text-to-Text Framework Unified NLP Through Text Transformations
  - T5 and Text-to-Text Framework
  - Exploring the Limits of Transfer Learning with a Unified Text-to-Text Transformer
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
  - raw/063_T5 and Text-to-Text Framework Unified NLP Through Text Transformations.ko.md
  - raw/063_T5 and Text-to-Text Framework Unified NLP Through Text Transformations.commentary.ko.md
evidence:
  - source_id: raffel-et-al-2020-t5
    locator: 'pp. 1–67, 특히 §§1–2.4와 Figures 1–2의 연구 목적·architecture·C4·task format·denoising, §§3.2–3.7와 Tables 2–15의 architecture·objective·data·transfer·scaling 비교와 최종 결과, §§4.1–4.2의 종합과 한계'
    relation: supports
relations:
  - target: concept.마스크드-언어-모델링
    kind: related
  - target: concept.언어-모델-전이-학습
    kind: related
  - target: concept.인코더-디코더
    kind: related
  - target: concept.transformer
    kind: related
  - target: concept.glue-superglue
    kind: related
learning:
  difficulty:
    entry: foundation
    target: intermediate
  prerequisites: []
  assumed_knowledge: '토큰 열, 확률, encoder와 decoder를 이 문서의 실제 설정으로부터 차례로 설명한다.'
  outcomes:
    - '원 T5 논문이 text-to-text를 어디까지 통일했는지, 15% span corruption 손실과 최종 결과를 어떤 조건에서 읽어야 하는지 설명할 수 있다.'
  next:
    - target: concept.t5
      reason: 'T5 — 이 소스의 maximum likelihood, cross-attention, span corruption을 개념·수식·작은 계산으로 다시 따라간다.'
    - target: analysis.사전-학습-지식은-과제에-어떻게-도착하는가
      reason: 사전 학습 지식은 과제에 어떻게 도착하는가 — T5의 전이 recipe를 다른 사전 학습 모델의 pretrain–adapt 경로와 비교한다.
---
# T5와 Text-to-Text 통합 프레임워크

> [!note] 학습 안내
> **난이도:** 기초 → 중급<br>
> **선수 지식:** 없음 — 토큰 열, 확률, encoder와 decoder를 이 문서의 실제 설정으로부터 차례로 설명한다.<br>
> **읽고 나면:** 원 T5 논문이 text-to-text를 어디까지 통일했는지, 15% span corruption 손실과 최종 결과를 어떤 조건에서 읽어야 하는지 설명할 수 있다.

## 1단계 — 먼저 잡을 핵심

### 핵심 문장

Colin Raffel 외의 2020년 T5 논문은 NLP transfer learning의 여러 선택지를 **같은 text-to-text 문제 형식**에서 비교했다. 번역, 요약, 질의응답, 분류를 모두 입력 텍스트에서 목표 텍스트를 생성하는 과제로 바꾸면 같은 encoder–decoder, 어휘, token-level maximum likelihood를 사용할 수 있다.

이 논문의 중심 공헌은 ‘새 block 하나가 이전 모델을 대체했다’는 주장보다 architecture, denoising objective, pretraining data, transfer 방식, multi-task mixture, model scale을 한 비교 틀에서 바꿔 본 데 있다. 따라서 T5의 수치를 읽을 때는 모든 선택을 합친 recipe의 결과와 한 선택만 바꾼 ablation을 구분해야 한다.

### 통합의 범위

논문의 Figure 1은 서로 다른 NLP 과제를 모두 텍스트 입력과 텍스트 목표로 적어 같은 모델·손실·훈련 hyperparameter를 적용하는 그림이다. 예를 들어 분류도 class 번호를 고르는 전용 head 대신 label 문자열을 생성한다. 모델이 label 집합 밖의 문자열을 내면 그 과제의 정답으로는 틀린 출력이다.

통합되지 않은 것도 있다. GLUE의 accuracy·상관계수, SQuAD의 exact match·F1, 요약의 ROUGE, 번역의 BLEU는 같은 숫자가 아니다. 데이터의 annotation 방식, 과제 prefix, decoding 조건, 최종 fine-tuning도 과제마다 남는다. ‘text-to-text’는 성공 기준을 하나로 합친다는 말이 아니다.

### 원자료를 읽을 때의 두 정정

프로젝트의 raw 번역·해설은 보존 자료다. 다음 내용은 원 JMLR 논문을 기준으로 확인한 정정이다.

- span corruption의 target은 빠진 구간 앞에 **같은 sentinel**을 붙이고, 모든 구간 뒤에는 다음 sentinel 하나를 더 둔다. raw의 짧은 예시는 target 첫 sentinel과 마지막 종결 sentinel을 빠뜨렸다.
- 대표 최종 결과는 하나의 고정 weight가 처음 보는 모든 과제를 zero-shot으로 해결한 결과가 아니다. 논문은 multi-task pretraining 뒤 각 downstream task를 다시 개별 fine-tuning하는 recipe를 사용했다.

## 2단계 — 작동 원리

### 서로 다른 과제를 한 쌍의 텍스트로 만든다

아래의 표는 사람이 보는 과제 이름은 달라도 T5가 받는 형식은 입력 열과 정답 열이라는 점을 보인다.

| 과제 | source text의 구성 | target text | 채점에서 남는 차이 |
| --- | --- | --- | --- |
| 번역 | 번역 방향 표지 + 원문 | 번역문 | 언어쌍, BLEU |
| 요약 | 요약 표지 + 문서 | 요약문 | 참고 요약, ROUGE |
| 질의응답 | 질문 + 문맥 | 답 문자열 | 답 annotation, EM/F1 |
| 분류 | 과제 표지 + 문장 | label 문자열 | 허용 label, accuracy 등 |

입력 토큰을 $s=(s_1,\ldots,s_m)$, 목표 토큰을 $y=(y_1,\ldots,y_n)$이라고 하자. $m$과 $n$은 과제·문장마다 달라질 수 있다. 분류 label도 tokenizer 관점에서는 길이 $n$인 목표 열이다.

encoder가 입력 전체를 읽어 만든 표현을 $H$라고 하면 다음과 같다.

\[
H=\operatorname{Enc}_\theta(s)
\]

$y_{<t}$는 $t$보다 앞선 목표 토큰들이다. $\theta$는 학습되는 가중치 전체다. 현재 정답 자리의 확률을 $q_t=p_\theta(y_t\mid y_{<t},H)$라고 줄여 부르겠다. encoder는 앞뒤 입력 문맥을 함께 볼 수 있고, causal decoder는 목표의 앞부분과 $H$를 보고 다음 자리 하나를 예측한다. 그러므로 같은 수식 안에서도 입력 역할과 목표 역할은 대칭이 아니다.

### teacher forcing과 실제 생성의 갈림길

훈련에서는 $y_{<t}$ 자리에 데이터가 제공한 정답 앞부분을 넣는다. 이를 teacher forcing이라고 한다. 정답 문자열이 세 토큰이라면 모델은 첫 자리, ‘진짜 첫 정답이 주어진’ 둘째 자리, ‘진짜 첫째·둘째 정답이 주어진’ 셋째 자리를 학습한다.

실제 생성에서는 아직 정답이 없으므로 앞선 위치에 모델이 스스로 낸 토큰을 넣는다. 이 차이 때문에 훈련 손실이 작아도 생성 중 초반 오류가 뒤의 조건을 바꿀 수 있다. text-to-text는 모든 과제를 같은 형태의 생성 손실로 적는 장점이지만, 자기회귀 생성의 이 경계를 제거하지 않는다.

### 사전 학습에서 과제 적응까지

대표 흐름은 다음과 같다.

1. C4의 비표지 텍스트를 span corruption으로 교란한다.
2. encoder–decoder가 빠진 span을 생성하도록 사전 학습한다.
3. 여러 supervised task를 섞는 multi-task pretraining 설정을 적용한다.
4. 최종 평가 전에는 각 downstream task의 label이 붙은 예로 다시 개별 fine-tuning한다.
5. 생성한 텍스트를 해당 benchmark의 원래 metric으로 채점한다.

따라서 공통 output interface, 공통 사전 학습 checkpoint, 공통 최종 checkpoint는 같은 말이 아니다. 논문은 이들 사이의 full fine-tuning, adapter 계열, 여러 mixture를 비교했다.

## 3단계 — 기술과 근거

### 왜 token 확률의 곱과 음의 로그를 쓰는가

정답 열 전체가 맞을 확률은 순서대로 조건을 붙이는 확률의 곱으로 쓸 수 있다.

\[
p_\theta(y\mid s)
=\prod_{t=1}^{n}
q_t
\]

각 인수는 한 위치의 정답 확률이다. 곱셈을 쓰는 이유는 앞 토큰이 주어진 조건에서 다음 토큰이 맞는 사건을 계속 이어 붙이기 때문이다. 하지만 $0$과 $1$ 사이의 작은 확률을 많이 곱하면 값이 매우 작아진다. 로그는 곱을 합으로 바꾸므로, 그 값을 안정적으로 더해 학습할 수 있다.

\[
\mathcal{L}_{\mathrm{T5}}
=-\sum_{t=1}^{n}
\log q_t
\]

합의 인덱스 $t$는 목표 열의 자리, $q_t$는 그 자리의 정답 확률이다. 음수는 ‘확률을 크게’라는 목표를 ‘손실을 작게’라는 최적화 문제로 바꾼다. $\log q_t$는 $q_t=1$일 때 0이고, $q_t$가 0에 가까울수록 매우 작은 음수가 된다. 그래서 음의 로그는 정답에 낮은 확률을 준 위치를 크게 벌한다.

두 정답 토큰에 확률 $0.9$, $0.2$를 주었다는 설명용 예에서는 다음과 같다.

\[
-\log(0.9)-\log(0.2)
\approx0.105+1.609
=1.714
\]

둘째 토큰 하나가 불확실한 것이 손실 대부분을 만든다. 평균 손실은 $1.714/2=0.857$이다. 이 숫자는 논문의 실제 확률이나 성능 수치가 아니라 로그 손실의 역할을 보이는 편집부 계산이다. 확률을 반올림해 정확히 0으로 만들면 로그가 정의되지 않으므로, 구현은 수치적으로 안정된 log-softmax를 이용한다.

### decoder가 확률 분포를 만드는 과정

decoder의 현재 상태를 $\mathbf h_t\in\mathbb{R}^{d}$, 어휘 집합을 $V$라고 하자. 마지막 선형 변환은 $|V|$개의 logit을 만든다.

\[
\mathbf z_t=W\mathbf h_t+\mathbf b,
\qquad
W\in\mathbb{R}^{|V|\times d},
\qquad
\mathbf b\in\mathbb{R}^{|V|}
\]

$\mathbf h_t$는 길이 $d$의 상태 벡터이고, $W$의 각 행은 후보 토큰 하나에 대응한다. 그래서 $\mathbf z_t$는 후보 수만큼의 실수 점수다. 현재 문맥을 고정한 후보 $v$의 확률을 $p_t(v)$로 줄여 쓰면, 점수는 softmax로 양수이고 합이 1인 분포가 된다.

\[
p_t(v)
=\frac{\exp(z_{t,v})}
{\sum_{u\in V}\exp(z_{t,u})}
\]

$v$는 지금 확인할 후보 하나, $u$는 분모에서 훑는 모든 후보다. 지수 함수는 음수 logit도 양수로 만들고, 분모는 그 전체를 정규화한다. 이 정규화가 있어야 다른 어휘 크기나 다른 시점의 점수도 ‘정답에 얼마나 큰 확률을 주었는가’로 비교할 수 있다.

### 15% span corruption을 길이로 따라가기

원 논문의 대표 denoising objective는 token의 15%를 골라 연속 span으로 묶는다. 각 span은 input에서 한 개의 고유 sentinel로 바뀌고, target에는 sentinel과 그 span의 원 토큰이 같은 순서로 들어간다.

| 원 토큰 열의 뜻 | 교란된 encoder 입력 | decoder target |
| --- | --- | --- |
| Thank you for inviting me to your party last week | Thank you 〈S₀〉 me to your party 〈S₁〉 | 〈S₀〉 for inviting 〈S₁〉 last week 〈S₂〉 |

sentinel은 일반 단어를 가리는 기호가 아니라, 어느 빈 구간의 복원 조각인지를 잇는 주소다. 마지막 〈S₂〉는 마지막 span 뒤의 끝 경계다. 모든 span에 서로 다른 sentinel을 쓰므로, decoder가 복원한 조각의 순서와 빈자리를 함께 알 수 있다.

원 토큰 수를 $L$, 손상 비율을 $r$, 제거한 토큰 수를 $K$, span 수를 $J$, 평균 span 길이를 $\bar{\ell}$로 두면 다음 관계가 성립한다.

\[
K=rL,
\qquad
\bar{\ell}=\frac{K}{J}
\]

$K=rL$은 전체에서 몇 token을 숨길지 정한다. $\bar{\ell}=K/J$는 숨긴 token을 몇 개의 연속 덩어리로 나누었는지의 평균이다. 논문의 설명에서 $L=500$, $r=0.15$이면 $K=75$이고, $J=25$이면 $\bar{\ell}=75/25=3$이다.

시작·끝 같은 별도 special token을 제외하면 두 열의 길이는 대략 다음과 같이 셀 수 있다.

\[
\begin{aligned}
L_{\mathrm{input}}&\approx L-K+J,\\
L_{\mathrm{target}}&\approx K+J+1.
\end{aligned}
\]

입력은 $K$개의 원 토큰을 지우고 $J$개의 sentinel을 넣으므로 첫 식이 된다. target은 제거한 $K$개 토큰, 각 span 앞의 $J$개 sentinel, 마지막 종결 sentinel을 가지므로 둘째 식이 된다. 따라서 500-token 예에서는 입력 약 450개, target 약 101개다.

이 짧은 target이 원 논문에서 span corruption을 택한 공학적 이유 중 하나다. decoder는 target을 순서대로 생성하므로, 빠진 부분만 출력하면 전체 원문을 재생성하는 objective보다 순차 생성 단계를 줄일 수 있다. 단, 실제 wall-clock time은 encoder 계산, attention, batch 구성, hardware와 함께 결정되므로 450과 101만으로 정확한 속도 향상을 선언할 수는 없다.

### 같은 손실에 들어가는 교란 목표

교란 입력을 $\mathbf x^{\mathrm{corrupt}}$, sentinel을 포함한 복원 target을 $y^{\mathrm{span}}$이라고 쓰면 사전 학습 손실은 다음이다. $r_t$는 교란 입력과 앞선 교란 정답이 주어졌을 때 $y^{\mathrm{span}}_t$가 나올 확률이다.

\[
\mathcal{L}_{\mathrm{span}}(\theta)
=-\sum_{t=1}^{n'}
\log r_t
\]

$n'$은 교란 target의 길이다. $r_t$의 조건에는 $y^{\mathrm{span}}_{<t}$와 $\operatorname{Enc}_\theta(\mathbf x^{\mathrm{corrupt}})$가 들어간다. 이 식은 앞의 supervised task 손실과 구조가 같다. 정답이 분류 label·번역문인지, 빠진 span인지가 달라질 뿐, decoder는 언제나 이전 정답과 encoder 문맥을 보고 다음 정답 token 확률을 높인다. 그래서 T5의 통일은 단순한 문자열 모양이 아니라 학습 목적의 통일이기도 하다.

### C4와 비교 설계

C4(Colossal Clean Crawled Corpus)는 2019년 4월 Common Crawl snapshot에서 English text를 추출해 중복, 너무 짧은 행, 금칙어 등 규칙으로 filtering한 약 750GB corpus다. 이 corpus는 여러 variant를 비교할 공통 비표지 자료를 제공했다.

그러나 ‘clean’은 가치 판단 없는 사실 보증이 아니다. filtering 규칙은 어떤 페이지를 남기고 버릴지 결정하며, web의 편향·오류·유해성·대표성 부족·benchmark contamination을 완전히 없앤다는 뜻이 아니다. C4로 사전 학습한 높은 benchmark 점수를 곧바로 신뢰성이나 언어 형평성의 증거로 읽을 수 없다.

논문은 encoder–decoder, decoder-only language model, prefix LM을 같은 text-to-text 설정에서 비교했다. encoder–decoder는 비교 language model보다 parameter가 약 두 배였지만, 정한 sequence length에서 계산량을 비슷하게 맞췄다. parameter 수, FLOPs, memory, latency는 서로 대체 가능한 단일 비용 척도가 아니다.

### multi-task와 최종 결과를 분리해 읽기

여러 과제를 섞는 일반적인 평균 손실은 다음처럼 쓸 수 있다. $\ell_j$는 $j$번째 과제 데이터 $D_j$에서 계산한 평균 T5 손실이다.

\[
\mathcal{L}_{\mathrm{mix}}(\theta)
=\sum_{j=1}^{J}w_j\ell_j
\]

$D_j$는 $j$번째 과제의 예 분포이고, $w_j$는 그 과제의 비중이다. $w_j\ge0$와 $\sum_jw_j=1$은 가중치가 음수가 아니고 전체 비중이 한 단위가 되게 한다. $\ell_j$는 $D_j$에서 뽑은 $(s,y)$ 예의 $\mathcal{L}_{\mathrm{T5}}$를 평균 낸 값이며, 확률 표기에서는 $\mathbb{E}_{(s,y)\sim D_j}[\mathcal{L}_{\mathrm{T5}}]$와 같다. 이 식은 논문의 모든 sampler 설정을 재현한 코드는 아니며, 서로 다른 크기의 과제를 섞을 때 왜 비중 선택이 필요한지 보이는 공통 표기다.

논문은 multi-task training, pretraining 뒤 fine-tuning, multi-task pretraining 뒤 fine-tuning을 비교했다. 최종 model은 마지막 방식을 사용했다. 따라서 T5-11B의 결과를 ‘다과제 학습만’ 또는 ‘text prefix만’의 효과라고 말할 수 없다.

최종 설정은 24개 과제 중 18개에서 당시 최고 결과를 냈다.

\[
\frac{18}{24}=0.75
\]

이 75%는 논문 표에 포함된 과제 수의 비율일 뿐, 모든 NLP 과제·언어·배포 조건에서의 범용 점수가 아니다. 특히 Table 14에서 WMT English→German은 32.1 BLEU였고 표에 제시된 prior best 33.8보다 낮았다. 번역도 English→German·French·Romanian 방향에 한정되어 있었다.

## 검증과 한계

### 확인된 사실과 비교 해석

확인된 사실은 T5가 모든 과제를 text-to-text로 적고, C4 span corruption과 supervised transfer를 비교했으며, 최종 recipe에 task별 fine-tuning이 들어간다는 점이다. 논문의 강점은 많은 선택을 한 공통 framework에서 비교했다는 데 있다.

‘이 framework가 모든 NLP에서 가장 좋은 output 형식이다’는 더 강한 해석이다. 분류처럼 짧은 답에서는 decoder의 순차 생성이 전용 encoder head보다 비효율적일 수 있다. 반대로 번역·요약처럼 가변 길이 문자열이 필요한 과제에서는 같은 생성 경로가 자연스럽다. 어느 쪽이 좋은지는 데이터, metric, 계산 예산과 오류 비용을 함께 비교해야 한다.

### 원문 상태와 적용 경계

- raw artifact는 수정하지 않는다. sentinel 표기 결손은 위의 원논문 대조로 설명했으며, 보존 자료 자체를 고치지 않았다.
- task prefix는 학습된 과제 식별자다. 이를 원 FLAN의 held-out-task instruction generalization이나 현대 assistant의 zero-shot 능력과 같게 부르면 supervision 조건이 사라진다.
- T5가 SQuAD answer를 텍스트로 생성했어도, 이 논문은 독립적인 abstractive QA 과제를 평가하지 않았다.
- span 길이·확률·손실의 숫자 예는 식을 읽기 위한 편집부 예다. 논문의 hidden state, attention map, 훈련 log를 재현하지 않는다.
- 18/24 결과는 model 크기, C4, objective, mixture, fine-tuning과 benchmark 세트가 함께 만든 비교다. 한 항만의 보편적 인과로 일반화할 수 없다.

## 학습 확인

### 확인 질문

1. 원 T5 논문이 하나로 통일한 요소와, benchmark마다 그대로 남은 요소는 무엇인가?
2. $K=75$, $J=25$일 때 입력과 target 길이에 각각 sentinel이 어떻게 반영되는가?
3. multi-task pretraining 뒤 개별 fine-tuning했다는 사실이 T5의 대표 결과 해석을 어떻게 제한하는가?

### 다음 문서

- [[concept.t5|T5]] — 이 소스의 maximum likelihood, cross-attention, span corruption을 개념·수식·작은 계산으로 다시 따라간다.
- [[analysis.사전-학습-지식은-과제에-어떻게-도착하는가|사전 학습 지식은 과제에 어떻게 도착하는가]] — T5의 전이 recipe를 다른 사전 학습 모델의 pretrain–adapt 경로와 비교한다.

## 출처

- Colin Raffel 외, [Exploring the Limits of Transfer Learning with a Unified Text-to-Text Transformer](https://www.jmlr.org/papers/v21/20-074.html), *Journal of Machine Learning Research* 21(140), 2020, pp. 1–67, 특히 §§1–2.4, §§3.2–3.7, Tables 2–15, §§4.1–4.2.
- 프로젝트 번역·검토 출발 자료: [T5 and Text-to-Text Framework: Unified NLP Through Text Transformations](https://mbrenndoerfer.com/writing/t5-text-to-text-framework-unified-nlp-through-text-transformations)
- 프로젝트 보존 자료: raw/063_T5 and Text-to-Text Framework Unified NLP Through Text Transformations.ko.md, raw/063_T5 and Text-to-Text Framework Unified NLP Through Text Transformations.commentary.ko.md.

## 관련 항목

- [[concept.t5|T5]]
- [[analysis.사전-학습-지식은-과제에-어떻게-도착하는가|사전 학습 지식은 과제에 어떻게 도착하는가]]
- [[concept.마스크드-언어-모델링|마스크드 언어 모델링]]
- [[concept.언어-모델-전이-학습|언어 모델 전이 학습]]
- [[concept.인코더-디코더|인코더-디코더]]
- [[concept.transformer|Transformer]]
- [[concept.glue-superglue|GLUE와 SuperGLUE]]
