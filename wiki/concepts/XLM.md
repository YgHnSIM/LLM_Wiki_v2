---
schema_version: 3
id: concept.xlm
page_type: concept
title: XLM
aliases:
  - Cross-lingual Language Model
  - Cross-lingual Language Models
  - 교차 언어 모델
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
  - raw/062_XLM Cross-lingual Language Model for Multilingual NLP.ko.md
  - raw/062_XLM Cross-lingual Language Model for Multilingual NLP.commentary.ko.md
  - raw/110_Specialized LLMs for Low-Resource Languages Complete Guide to AI Equity and Global Accessibility.ko.md
  - raw/110_Specialized LLMs for Low-Resource Languages Complete Guide to AI Equity and Global Accessibility.commentary.ko.md
evidence:
  - source_id: conneau-lample-2019-xlm
    locator: '§§3.1–3.5와 Figure 1의 language sampling·shared BPE·CLM/MLM/TLM, §§4–5와 Tables 1–5의 전이 protocol·평가 결과'
    relation: supports
  - source_id: joshi-et-al-2020-linguistic-diversity
    locator: pp. 6282–6293의 언어별 자원 분포와 언어 불가지론적 방법의 평가 경계
    relation: contextualizes
relations:
  - target: source.110
    kind: related
  - target: concept.언어-모델-전이-학습
    kind: related
  - target: concept.신경망-기계-번역
    kind: related
  - target: concept.저자원-언어
    kind: related
  - target: analysis.언어-수와-언어-형평성은-같은-축인가
    kind: related
learning:
  difficulty:
    entry: foundation
    target: intermediate
  prerequisites:
    - target: concept.마스크드-언어-모델링
    - target: concept.byte-pair-encoding
  assumed_knowledge: 문장이 token 조각으로 나뉜다는 사실 . 확률식은 이 문서에서 처음부터 설명한다.
  outcomes:
    - 'XLM의 CLM·MLM·TLM이 각각 무엇을 맞히는지, shared BPE·언어 표지·병렬 문장이 왜 서로 다른 신호인지, target-language label 없는 zero-shot 전이가 무엇을 뜻하는지 설명할 수 있다.'
  next:
    - target: source.062
      reason: 062XLM과 교차 언어 사전 학습 — 이 개념을 원 논문의 data·실험 조건·검증 정정과 함께 읽는다.
    - target: analysis.같은-병렬-문장은-무엇을-학습시키는가
      reason: 같은 병렬 문장은 무엇을 학습시키는가 — 같은 병렬 문장쌍이 SMT·NMT·TLM에서 서로 다른 loss를 만드는 이유를 비교한다.
---
# XLM

> [!note] 학습 안내
> **난이도:** 기초 → 중급<br>
> **선수 지식:** [[concept.마스크드-언어-모델링|마스크드 언어 모델링]], [[concept.byte-pair-encoding|Byte Pair Encoding]]<br>
> **읽고 나면:** XLM의 CLM·MLM·TLM이 각각 무엇을 맞히는지, shared BPE·언어 표지·병렬 문장이 왜 서로 다른 신호인지, target-language label 없는 zero-shot 전이가 무엇을 뜻하는지 설명할 수 있다.

## 1단계 — 먼저 잡을 핵심

XLM(Cross-lingual Language Model)은 여러 언어를 **같은 Transformer와 같은 subword vocabulary**에 넣어 사전 학습한 방법군이다. 목표는 영어에서 배운 과제 지식을 한국어·프랑스어·스와힐리어 같은 다른 언어 입력에도 옮길 수 있는 표현을 만드는 것이다. 여기서 “같은 모델”은 언어가 같다는 뜻이 아니라, 언어별로 따로 만든 모델 대신 하나의 parameter 집합을 함께 업데이트한다는 뜻이다.

이 문서를 읽을 때는 자료를 세 칸으로 분리해 두면 혼동이 줄어든다.

| 단계 | 모델에 주는 것 | 이 단계에 없는 것 |
|---|---|---|
| 사전 학습 | 여러 언어의 label 없는 문장 | 과제의 정답 label |
| 영어 fine-tuning | 영어 문장과 영어 과제 label | 다른 언어의 과제 label |
| target 언어 평가 | target 언어 문장 | target 언어 label로 하는 parameter 업데이트 |

따라서 XLM의 XNLI “zero-shot”은 **target 언어를 한 번도 보지 않았다**는 뜻이 아니다. target 언어의 비표지 text는 사전 학습에서 읽었고, test label은 마지막 채점에만 쓴다. 보지 않은 것은 target-language **과제 감독 신호**다.

XLM이 비교한 세 학습 목표는 다음과 같다.

| 목표 | 문장에서 가르치는 일 | 병렬 번역문 필요 여부 |
|---|---|---|
| CLM | 앞부분을 보고 다음 token 맞히기 | 필요 없음 |
| MLM | 가린 token을 좌우 문맥으로 복원하기 | 필요 없음 |
| TLM | 번역 쌍 양쪽의 가린 token을 두 문장 문맥으로 복원하기 | 필요 |

TLM은 번역문 전체를 왼쪽에서 오른쪽으로 출력하는 번역기가 아니다. 병렬 문장쌍을 **추가 문맥**으로 쓰는 MLM의 확장이다. 이 차이가 “병렬 data를 쓴다”는 같은 말 속에서 번역 학습과 XLM을 구분한다.

## 2단계 — 작동 원리

### 한 token을 세 가지 정보의 합으로 입력한다

문장 안의 $t$번째 token을 모델에 넣는 벡터는 간단히 다음처럼 쓸 수 있다.

$$
e_t
=E_{\mathrm{tok}}[v_t]
+E_{\mathrm{pos}}[r_t]
+E_{\mathrm{lang}}[\ell_t]
$$

- $v_t$는 $t$번째 token의 vocabulary 번호다. $E_{\mathrm{tok}}$에서 그 번호의 행 하나를 꺼낸다.
- $r_t$는 문장 안 위치다. 같은 token이라도 앞·뒤 위치가 다르면 문장에서 하는 일이 달라질 수 있으므로 $E_{\mathrm{pos}}$를 더한다.
- $\ell_t$는 이 token이 어느 언어 문장에 속하는지 나타내는 번호다. XLM은 shared vocabulary를 쓰기 때문에 $E_{\mathrm{lang}}$로 언어 구분도 제공한다.
- 세 표는 각각 $E_{\mathrm{tok}}\in\mathbb{R}^{|V|\times d}$, $E_{\mathrm{pos}}\in\mathbb{R}^{L\times d}$, $E_{\mathrm{lang}}\in\mathbb{R}^{N\times d}$처럼 생각할 수 있다. 꺼낸 세 행은 모두 길이 $d$인 벡터이므로 원소별 덧셈이 가능하고, 결과 $e_t\in\mathbb{R}^{d}$도 Transformer에 넣을 수 있다.

여기서 “공유”는 token 표와 Transformer의 parameter가 모든 언어에서 같은 물리적 행렬이라는 뜻이다. 숫자·고유명·같은 문자권의 subword처럼 표면형이 겹치는 token은 같은 항목을 직접 재사용할 수 있다. 하지만 ‘dog’와 ‘chien’의 뜻을 자동으로 같게 만들지는 않는다. 의미 대응은 여러 문맥에서 함께 학습하고, TLM에서는 번역문 문맥까지 이용하면서 생기는 통계적 결과다.

TLM에서 번역문 쪽 position을 다시 0부터 시작한 것도 같은 이유로 읽어야 한다. 두 문장이 이어 붙여졌더라도 대응할 법한 위치가 지나치게 멀어 보이지 않게 하는 보조 신호다. 이것은 “이 단어와 저 단어가 정확히 짝”이라는 단어 정렬 label은 아니다.

### 작은 언어가 BPE 어휘에서 사라지지 않게 문장을 다시 뽑는다

언어 $i$의 문장 수를 $n_i$라 하고, 전체 문장 중 비율을 $p_i$라 하자.

$$
p_i=\frac{n_i}{\sum_j n_j},
\qquad
q_i=\frac{p_i^{\alpha}}{\sum_j p_j^{\alpha}}
$$

- $p_i$는 원자료의 비율이다. 큰 Wikipedia를 가진 언어는 보통 이 값도 크다.
- $\alpha$는 큰 언어의 비중을 얼마나 평탄하게 만들지 정하는 지수다.
- $q_i$는 실제로 문장을 뽑을 확률이다. 분모는 모든 $q_i$의 합이 1이 되게 하는 정규화 항이다.

예를 들어 A 언어 문장이 100개, B 언어 문장이 25개면 $p_A=0.8$, $p_B=0.2$다. BPE 어휘를 만들 때 논문처럼 $\alpha=0.5$를 쓰면

$$
q_A=\frac{\sqrt{0.8}}{\sqrt{0.8}+\sqrt{0.2}}
=\frac{0.894}{0.894+0.447}
\approx0.667,
\qquad
q_B\approx0.333
$$

B의 원자료 비중은 20%였지만 BPE 학습 표본에서는 약 33%가 된다. $\alpha=1$이면 원자료 비율을 그대로 쓰고, $0<\alpha<1$이면 작은 corpus의 비중을 올리며, 양의 비율만 있을 때 $\alpha=0$이면 모든 언어를 같은 확률로 만든다. XLM은 **BPE 어휘를 만들 때** $\alpha=0.5$, CLM·MLM 학습 batch 언어를 뽑을 때는 $\alpha=0.7$을 사용했다. 숫자가 둘인 것은 같은 설정을 두 번 적은 오류가 아니라, 서로 다른 두 샘플링 단계이기 때문이다.

이 계산이 corpus·번역문·평가 label을 새로 만들지는 않는다. 단지 이미 가진 문장을 어느 언어에서 얼마나 자주 보게 할지를 바꾼다.

### 세 objective는 같은 “확률을 높이고 손실을 낮추기”를 다른 위치에 적용한다

학습의 공통 뼈대는 정답 token의 확률을 크게 만드는 것이다.

$$
\mathcal{L}
=-\sum_{i\in M}\log p_\theta(x_i\mid\text{context}_i)
$$

- $x_i$는 원래 문장의 $i$번째 정답 token이다.
- $M$은 이번에 loss를 낼 위치들의 집합이다. CLM에서는 대개 예측할 모든 다음 위치, MLM·TLM에서는 가린 위치가 된다.
- $p_\theta(\cdot)$는 현재 parameter $\theta$를 가진 모델의 확률 분포다. 정답에 준 확률은 0과 1 사이여야 한다.
- $\log$는 곱으로 이어지는 문장 확률을 합으로 바꾸기 위해 쓴다. $-\log\prod_i p_i=-\sum_i\log p_i$이므로 긴 문장의 여러 예측을 더할 수 있다.
- 앞의 음수는 “확률을 크게” 하는 목표를, optimizer가 최소화하는 “loss를 작게” 하는 문제로 바꾼다.

숫자로 보면 정답 확률이 $0.8$일 때 $-\ln(0.8)\approx0.223$이고, $0.2$일 때는 $-\ln(0.2)\approx1.609$다. 틀릴 가능성이 큰 두 번째 예측에 훨씬 큰 벌점이 간다. 실제 구현은 보통 batch와 target 수로 합을 나누어 scale을 안정시키지만, 위 합은 각 항이 왜 더해지는지를 보여 주는 형태다.

### CLM: 미래를 숨기고 다음 token을 맞힌다

문장을 $x=(x_1,\ldots,x_T)$라고 하면 causal language modeling은 다음과 같다.

$$
\mathcal{L}_{\mathrm{CLM}}(x)
=-\sum_{t=1}^{T}
\log p_\theta(x_t\mid x_{<t},\ell)
$$

- $x_{<t}=(x_1,\ldots,x_{t-1})$는 현재 위치보다 왼쪽의 token들이다.
- $\ell$은 언어 정보를 입력에 넣는다는 점을 드러낸 표기다. 실제 입력에서는 앞 절의 language embedding이 이 역할을 한다.
- causal attention mask는 $x_t$가 자기 자신이나 미래 $x_{>t}$를 보지 못하게 한다. 정답을 미리 보면 다음 token 예측 문제가 사라지므로 이 제한이 필요하다.

의미 단위로만 쓴 작은 예에서 $x=(\text{오늘},\text{비},\text{온다})$라면 마지막 항은 $-\log p_\theta(\text{온다}\mid\text{오늘},\text{비},\ell)$다. 모델이 이 확률을 0.6으로 냈다면 이 항의 loss는 $-\ln(0.6)\approx0.511$이다. 실제 BPE token 경계는 이 단어 경계와 다를 수 있지만, “왼쪽만 조건으로 삼는다”는 계산은 같다.

### MLM: 정답 위치를 가리고 양쪽 문맥으로 복원한다

MLM에서는 원문 $x$에서 선택한 위치 $M$을 손상시켜 입력 $x^{\mathrm{in}}$을 만든다.

$$
x^{\mathrm{in}}=\operatorname{corrupt}(x,M),
\qquad
\mathcal{L}_{\mathrm{MLM}}(x)
=-\sum_{i\in M}
\log p_\theta(x_i\mid x^{\mathrm{in}},\ell)
$$

$x^{\mathrm{in}}$은 모델이 실제로 읽는 입력이고, $x_i$는 숨겨 둔 원래 정답이다. 입력의 가린 자리와 loss의 정답을 분리해서 써야 모델이 자기 입력의 [MASK]를 답으로 외운다고 오해하지 않는다.

XLM은 BPE token의 15%를 무작위로 골랐다. 그 선택된 token 중 80%는 [MASK]로, 10%는 무작위 token으로 바꾸고, 10%는 입력에는 그대로 두되 복원 loss의 대상에는 남겼다. token이 100개인 긴 stream을 평균적으로 보면 약 15개를 고르고, 그중 약 12개·1.5개·1.5개가 각 경우에 해당한다. 한 문장마다 정확히 정수가 되는 규칙은 아니라는 점도 중요하다.

예를 들어 $x=(\text{오늘},\text{비},\text{온다})$에서 가운데만 골라 $x^{\mathrm{in}}=(\text{오늘},\text{[MASK]},\text{온다})$가 되었다고 하자. 정답은 여전히 ‘비’이고, 모델이 $p_\theta(\text{비}\mid x^{\mathrm{in}},\ell)=0.7$을 주면 loss는 $-\ln(0.7)\approx0.357$이다. CLM과 달리 오른쪽의 ‘온다’도 복원 문맥에 쓸 수 있다.

### TLM: 번역문도 같은 빈칸 문제의 문맥으로 쓴다

같은 뜻의 두 문장을 $x=(x_1,\ldots,x_m)$, $y=(y_1,\ldots,y_n)$라고 하자. 설명을 위해 영어 ‘The sky is blue’와 프랑스어 ‘Le ciel est bleu’를 단어 단위로 적을 수 있지만, 실제 학습 단위는 BPE subword일 수 있다. 두 문장을 이어 붙인 입력을 $z=[x;y]$로 쓰고, 각 언어에서 고른 mask 위치를 $M_x$, $M_y$라고 하자.

$$
z^{\mathrm{in}}
=\operatorname{corrupt}(z,M_x\cup M_y),
$$

$$
\mathcal{L}_{\mathrm{TLM}}(x,y)
=
-\sum_{i\in M_x}\log p_\theta(x_i\mid z^{\mathrm{in}})
-\sum_{j\in M_y}\log p_\theta(y_j\mid z^{\mathrm{in}})
$$

첫 합은 $x$ 언어에서 가린 token의 벌점, 둘째 합은 $y$ 언어에서 가린 token의 벌점이다. 두 합을 더하는 이유는 어느 쪽 문장이 source이고 어느 쪽이 target이라는 고정 역할 없이 **양쪽 빈칸**을 모두 맞히게 하기 때문이다. 예를 들어 영어 ‘blue’가 가려졌을 때 영어 주변 문맥뿐 아니라 가리지 않은 프랑스어 ‘bleu’도 attention으로 읽을 수 있다. 반대로 프랑스어 쪽을 가렸을 때도 영어가 문맥이 된다.

이것이 교차 언어 정렬 신호가 되는 이유는 한 언어만 보고 빈칸을 잘 맞히기 어려운 경우, 다른 언어 표현을 읽는 쪽으로 parameter가 반복해서 조정되기 때문이다. 그러나 TLM loss에는 “$x_i$는 정확히 $y_j$와 대응한다”는 단어쌍 label이 들어 있지 않다. 어떤 attention weight가 높았다고 해서 그것만으로 사람의 번역 정렬 정답이 증명되는 것도 아니다.

### TLM과 번역 생성은 예측 경계가 다르다

지도 신경 기계 번역의 전형적인 목적은 source $x$가 주어졌을 때 target $y$ 전체를 순서대로 생성하는 것이다.

$$
\mathcal{L}_{\mathrm{NMT}}(x,y)
=-\sum_{t=1}^{n}
\log p_\theta(y_t\mid y_{<t},x)
$$

NMT의 $y_{<t}$는 이미 생성한 target 앞부분이고, $y_t$는 이번에 반드시 출력해야 하는 다음 target token이다. 그래서 decoder에는 미래 target을 못 보게 하는 causal mask가 필요하다. 반면 TLM은 양쪽 문장을 encoder 문맥으로 읽고 선택된 빈칸만 복원한다. TLM의 $x$와 $y$는 차례로 생성해야 할 source·target이 아니라 서로 돕는 관측 문맥이다. 병렬 자료를 쓴다는 공통점만으로 두 loss를 서로 바꾸어 쓸 수 없는 이유다.

### MLM과 TLM은 “둘 중 하나의 batch”를 번갈아 학습한다

XLM의 MLM+TLM 설정은 monolingual MLM batch와 parallel TLM batch를 교대로 사용했다. 이를 일반화해 한 batch가 MLM일 확률을 $r$이라고 쓰면, 장기 평균의 학습 신호는 다음처럼 생각할 수 있다.

$$
\mathbb{E}[\mathcal{L}_{\mathrm{batch}}]
=r\,\mathbb{E}[\mathcal{L}_{\mathrm{MLM}}]
+(1-r)\,\mathbb{E}[\mathcal{L}_{\mathrm{TLM}}]
$$

이 식의 $r$은 교대 schedule을 읽기 위한 일반 표기이며, 논문이 특정한 한 숫자 $r$을 보고했다는 뜻은 아니다. 핵심은 한 batch에서 두 loss를 반드시 같은 비율로 계산한다는 뜻이 아니라, monolingual data와 parallel data가 서로 다른 batch로 optimizer에 들어간다는 점이다.

## 3단계 — 기술과 근거

### 영어 label을 다른 언어에 적용하는 계산

XNLI fine-tuning을 단순화하면, 문장쌍 $s$를 encoder가 벡터 $h_\theta(s)\in\mathbb{R}^{d}$로 바꾸고, 선형 분류기가 class 점수를 만든다.

$$
a=Wh_\theta(s)+b,
\qquad
p(c\mid s)=\operatorname{softmax}(a)_c
$$

- $W\in\mathbb{R}^{C\times d}$와 $b\in\mathbb{R}^{C}$는 $C$개 class를 위한 분류기 parameter다.
- $a\in\mathbb{R}^{C}$는 class별 점수, $\operatorname{softmax}(a)_c$는 $c$번째 class의 확률이다.
- 영어 labeled example $(s_k^{\mathrm{en}},y_k^{\mathrm{en}})$에는 $-\log p(y_k^{\mathrm{en}}\mid s_k^{\mathrm{en}})$를 더해 encoder와 분류기를 함께 fine-tune한다.

그 뒤 target 언어 문장 $s^{\mathrm{target}}$에는 같은 $\theta,W,b$를 그대로 적용한다. target test label은 예측 정확도를 계산할 때만 비교하고 gradient에는 넣지 않는다. 전이가 잘 되려면 사전 학습된 shared encoder가 서로 다른 언어의 비슷한 의미를 분류기가 알아볼 수 있는 가까운 표현으로 바꾸어야 한다. 그 조건은 학습의 목표이지 자동 보장은 아니다.

### 숫자는 먼저 무엇을 뺀 값인지 확인한다

원 논문의 XNLI 15개 언어 평균은 MLM 71.5, MLM+TLM 75.1 accuracy였다.

$$
75.1\%-71.5\%=3.6\%\text{p}
$$

이것은 3.6 **퍼센트포인트** 상승이다. 71.5를 기준으로 한 상대 변화율과는 다른 단위다. 또 MLM+TLM은 TLM objective만 더한 것이 아니라 parallel data도 함께 쓴 설정이다. 따라서 이 비교는 그 논문·data·학습 recipe 안에서 추가 병렬 TLM 설정의 효과를 보여 주며, TLM만의 순수하고 보편적인 인과 효과를 모든 언어·과제에 확정하지는 않는다.

대표 결과를 한 줄 점수표로 합치면 서로 다른 질문이 섞인다. XNLI는 영어 label 전이의 accuracy, German→English 34.3 BLEU는 비지도 MT의 번역 품질, Romanian→English 38.5 BLEU는 지도 MT 조건의 품질, Nepali perplexity 157.2→109.3은 특정 언어 조합의 다음-token 예측 불확실성이다. 지표·언어쌍·훈련 자료가 달라서 이 숫자들을 하나의 “다국어 능력” 순위로 평균낼 수는 없다.

### 공유 어휘와 shared parameter가 하는 일의 경계

shared BPE는 숫자·고유명·같은 문자권의 조각처럼 언어 사이 anchor가 있는 경우 유용한 출발점이다. 작은 언어를 더 자주 샘플링하면 그 언어 token이 BPE에서 글자 단위로만 쪼개지는 위험도 줄일 수 있다. 하지만 다음은 별개의 문제다.

- BPE는 token을 나누고 표를 공유하는 방법이지, 번역 사전이나 의미론 자체가 아니다.
- language embedding은 “어느 언어인지”를 알려 주지만 언어 간 정답 대응을 직접 가르치지 않는다.
- TLM은 병렬 문장이 있어야 하며, 원 논문의 TLM pair는 한쪽이 영어인 자료였다.
- shared encoder 하나가 모든 언어에서 같은 accuracy, 같은 비용, 같은 문화적 적합성을 보장하지 않는다.

## 검증과 한계

### 해석 경계

- XLM은 하나의 고정 objective가 아니라 CLM·MLM·MLM+TLM을 비교한 교차 언어 사전 학습 연구다.
- CLM·MLM은 monolingual data만으로 가능하지만, TLM은 병렬 문장쌍을 요구한다.
- TLM은 번역 decoder를 훈련하는 loss가 아니라 양방향 masked-token 복원 loss다.
- XNLI zero-shot은 target 언어의 비표지 text까지 배제한 실험이 아니라 target-language NLI label 없이 fine-tune한 전이다.
- sampling 평탄화는 관측 빈도를 바꾸는 계산이다. 없는 corpus·label·native evaluation, 혹은 언어별 형평성을 만들어 내지는 않는다.
- 후속 multilingual model을 모두 XLM의 직접 계보로 묶거나, XLM의 평균 상승을 모든 저자원 언어의 품질·비용·형평성 해결로 읽으려면 별도 근거가 필요하다.

### 확인된 범위와 남는 질문

원 논문은 XNLI, 지도·비지도 MT, Nepali 저자원 language modeling, cross-lingual word similarity를 평가했다. few-shot, cross-lingual QA, 정보검색, 모든 언어의 실제 배포 비용은 이 논문의 직접 평가 범위가 아니다. 특히 언어 수가 많아질수록 shared capacity 안에서 positive transfer와 간섭이 어떻게 갈리는지, 병렬 자료가 없는 언어에서 어떤 신호가 남는지는 문장 수나 BPE 하나의 숫자로 답할 수 없다.

## 학습 확인

### 확인 질문

1. $q_i=p_i^\alpha/\sum_jp_j^\alpha$에서 $\alpha<1$이면 작은 corpus 언어의 batch 비중이 왜 커지는가?
2. 위에서 쓴 TLM loss의 두 합은 각각 어느 언어의 어떤 token에 loss를 주며, NMT loss와 왜 다른가?
3. XNLI zero-shot에서 target 언어의 text·task label·test label은 각각 어느 단계에서 쓰이는가?

### 다음 문서

- [[source.062|XLM과 교차 언어 사전 학습]] — 062XLM과 교차 언어 사전 학습 — 이 개념을 원 논문의 data·실험 조건·검증 정정과 함께 읽는다.
- [[analysis.같은-병렬-문장은-무엇을-학습시키는가|같은 병렬 문장은 무엇을 학습시키는가]] — 같은 병렬 문장쌍이 SMT·NMT·TLM에서 서로 다른 loss를 만드는 이유를 비교한다.

## 출처

- [[062_XLM과 교차 언어 사전 학습]]
- Alexis Conneau·Guillaume Lample, [Cross-lingual Language Model Pretraining](https://proceedings.neurips.cc/paper_files/paper/2019/hash/c04c19c2c2474dbf5f7ac4372c5b9af1-Abstract.html), NeurIPS 2019, 특히 §§3–5.
- Pratik Joshi 외, [The State and Fate of Linguistic Diversity and Inclusion in the NLP World](https://aclanthology.org/2020.acl-main.560/), ACL 2020, pp. 6282–6293.
- [[110_저자원 언어 LLM의 성능 격차와 전이·평가 경계]]

## 관련 항목

- [[source.062|XLM과 교차 언어 사전 학습]]
- [[analysis.같은-병렬-문장은-무엇을-학습시키는가|같은 병렬 문장은 무엇을 학습시키는가]]
- [[concept.마스크드-언어-모델링|마스크드 언어 모델링]]
- [[concept.byte-pair-encoding|Byte Pair Encoding]]
- [[source.110|저자원 언어 LLM의 성능 격차와 전이·평가 경계]]
- [[concept.언어-모델-전이-학습|언어 모델 전이 학습]]
- [[concept.신경망-기계-번역|신경망 기계 번역]]
- [[concept.저자원-언어|저자원 언어]]
- [[analysis.언어-수와-언어-형평성은-같은-축인가|언어 수와 언어 형평성은 같은 축인가]]
