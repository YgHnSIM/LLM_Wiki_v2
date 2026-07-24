---
schema_version: 2
id: analysis.llm-수학-종합-실습
page_type: analysis
title: LLM 수학 종합 실습
aliases:
  - LLM math capstone
  - token에서 gradient까지 종합 문제
tags:
  - type/analysis
  - domain/ai
  - domain/nlp
  - domain/machine-learning
  - domain/mathematics
created: '2026-07-24'
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
    relation: contextualizes
  - source_id: vaswani-et-al-2017-attention
    locator: 'pp. 5998–6002, 특히 §§3.1–3.3의 scaled dot-product attention·residual·position-wise FFN'
    relation: contextualizes
  - source_id: rumelhart-hinton-williams-1986-pdp
    locator: 'pp. 322–328의 합성된 오차 함수에 대한 가중치 변화율과 일반화 델타 규칙'
    relation: contextualizes
related:
  - analysis.llm을-만든-수학
  - concept.단어-임베딩
  - concept.어텐션-메커니즘
  - concept.잔차-연결
  - concept.layer-normalization
  - concept.활성화-함수
  - concept.소프트맥스
  - concept.로그-가능도
  - concept.역전파
  - concept.경사하강법
  - concept.transformer
---
# LLM 수학 종합 실습

> [!note] 학습 안내
> **난이도:** 중급 → 준전문가 입문<br>
> **선수 지식:** [[LLM을 만든 수학]]의 다섯 단계와 각 owner의 마스터리 연습 통과<br>
> **읽고 나면:** 처음 보는 숫자에서 token ID→attention→residual→LayerNorm→FFN→softmax NLL→전체 출력 gradient를 독립 계산하고, 틀린 축·shape·부호를 해당 선수 개념으로 역추적할 수 있다.

## 1단계 — 먼저 잡을 핵심

### 이 실습의 목적

설명을 읽고 “이해한 것 같다”는 느낌과 새 문제를 혼자 푸는 능력은 다르다. 이 문서는 [[LLM을 만든 수학]]의 숫자를 외웠는지 묻지 않고, 새 숫자 하나를 처음부터 끝까지 연결할 수 있는지 확인한다. 실제 LLM 전체를 손으로 계산하는 시험이 아니라, 큰 모델에서도 변하지 않는 다음 불변 조건을 점검하는 실습이다.

1. token ID와 연속 벡터를 구분한다.
2. attention softmax의 key 축과 출력 softmax의 vocabulary 축을 구분한다.
3. residual 두 항과 각 gradient의 shape를 맞춘다.
4. LayerNorm의 feature 축과 FFN의 position-wise 성질을 구분한다.
5. NLL gradient와 optimizer update를 구분한다.
6. 분기된 계산 그래프의 gradient 기여를 더한다.

### 도움을 줄이는 순서

첫 시도에서는 `마스터리 연습`의 문제와 빈 답안만 보고 45–60분 안에 푼다. 둘째 시도에서는 계산기를 써도 되지만 해설은 열지 않는다. 셋째 시도에서만 해설과 실행 출력을 비교한다. 답을 읽은 직후 같은 숫자를 베끼지 말고 `새 수치 전이`를 풀어야 통과다.

치명적 오류는 확률 축, causal mask, residual shape, LayerNorm 축, target 위치, gradient 부호, 분기 합산을 잘못 두는 것이다. 산술 실수 하나보다 이런 구조 오류가 더 큰 감점인 이유는 큰 tensor에서 같은 오류가 조용히 잘못된 학습으로 이어질 수 있기 때문이다.

## 2단계 — 작동 원리

### 주어진 모형과 계산 지도

어휘의 ID 순서를 다음처럼 고정한다.

| ID | token |
| ---: | --- |
| 0 | 온다 |
| 1 | 오늘 |
| 2 | 비가 |

문맥은 `오늘, 비가`, 즉 ID $(1,2)$이고 실제 다음 token은 ID 0 `온다`다. 임베딩 표는

$$
E=
\begin{bmatrix}
0&0\\
1&0\\
0&1
\end{bmatrix}
$$

이다. attention에서는 $Q=K=0$, $V=X$로 두고 causal mask를 적용한다. 따라서 허용된 key의 score는 모두 같고, 각 query는 볼 수 있는 value에 균등한 가중치를 준다.

attention 뒤에는 $R=X+O$를 계산한다. 각 token row에 $\epsilon=0$, $\gamma=(1,1)$, $\beta=(0,0)$인 LayerNorm을 적용한다. 이 실습의 두 row는 분산이 양수라 $\epsilon=0$으로도 손계산이 정의되지만, 실제 구현에서 $\epsilon>0$을 생략해도 된다는 뜻은 아니다.

마지막 token의 정규화 표현을 $n$이라 하자. position-wise FFN은

$$
f=\operatorname{ReLU}(nW_1)W_2,
\qquad
s=n+f,
\qquad
W_1=W_2=I_2
$$

이다. 마지막 출력층은

$$
W_{\mathrm{out}}=
\begin{bmatrix}
0&0&0\\
\ln2&\frac{\ln2}{2}&0
\end{bmatrix},
\qquad
b=(0,0,0)
$$

를 사용한다. 따라서 계산 지도는 다음과 같다.

$$
\text{IDs}
\to X
\to A,O
\to R
\to n
\to f,s
\to z,p,J
\to g_z
\to \nabla W_{\mathrm{out}},\nabla b,\nabla s
$$

### 계산 전에 써야 하는 shape 장부

| 값 | shape | 축의 의미 |
| --- | --- | --- |
| IDs | $(2)$ | token |
| $X,A,O,R$ | $X,O,R:(2,2)$, $A:(2,2)$ | token×feature, query×key |
| $n,f,s$ | $(2)$ | 마지막 token의 feature |
| $W_{\mathrm{out}}$ | $(2,3)$ | feature×vocabulary |
| $z,p,g_z,b$ | $(3)$ | vocabulary 후보 |
| $\nabla W_{\mathrm{out}}$ | $(2,3)$ | 원 weight와 같은 저장 좌표 |

shape 장부를 먼저 쓰면 $A$의 두 축과 $W_{\mathrm{out}}$의 feature·candidate 축을 바꾸는 오류를 줄일 수 있다. 값이 맞더라도 축 이름을 쓰지 못하면 다른 batch·head 설정으로 전이하기 어렵다.

## 3단계 — 기술과 근거

### 실행 검증과 수동 풀이의 경계

`npm run math:capstone`은 위 숫자의 전체 순전파, 출력층 역전파, FFN residual 분기 합, 출력층 SGD 한 걸음을 JSON으로 출력한다. 회귀 테스트는 다음 불변 조건을 검사한다.

- causal attention의 각 query row 합이 1이고 미래 가중치가 0이다.
- residual, LayerNorm, FFN의 수치와 shape가 답안과 같다.
- logit $(\ln4,\ln2,0)$이 확률 $(4/7,2/7,1/7)$을 만든다.
- 출력 weight의 해석적 gradient가 모든 좌표의 중심 차분과 일치한다.
- FFN residual의 직접·비선형 branch gradient를 합한다.
- 작은 SGD 한 걸음 뒤 이 한 예의 NLL이 감소한다.

코드와 답이 일치해도 그 코드가 실제 Transformer 학습 전체를 재현한다는 뜻은 아니다. 이 실습은 한 head, 두 feature, 한 위치의 손실만 사용하고 LayerNorm보다 앞선 전체 역전파는 계산하지 않는다. 실행 검산은 산술과 구현의 국소 일치를 확인하는 장치이고, 식의 의미와 가정은 학습자가 설명해야 한다.

### owner 경로와 오류의 위치

| 막힌 단계 | 먼저 돌아갈 owner | 다시 확인할 질문 |
| --- | --- | --- |
| ID→$X$ | [[단어 임베딩]] | ID는 크기인가, 행 선택자인가? |
| $QK^{\mathsf T}$·mask·$A$ | [[어텐션 메커니즘]] | 어느 축의 후보가 합 1인가? |
| $X+O$·$n+f$ | [[잔차 연결]] | 두 항의 좌표와 shape가 같은가? |
| 평균·분산 | [[확률변수·확률분포·기대값·분산]], [[Layer Normalization]] | 어떤 축·대상을 평균내는가? |
| ReLU·FFN | [[활성화 함수]], [[Transformer]] | token을 섞는가, feature만 바꾸는가? |
| $z\to p\to J$ | [[소프트맥스]], [[로그가능도]] | logit·확률·손실을 구분했는가? |
| $g_z$·외적·분기 합 | [[연쇄 법칙과 계산 그래프]], [[역전파]] | 경로를 곱하고 분기 기여를 더했는가? |
| gradient→update | [[경사하강법]] | gradient와 실제 parameter 변화의 부호가 다른가? |

## 검증과 한계

### 이 실습이 보장하지 않는 것

- 손계산 통과는 실제 framework의 tensor layout, padding mask, mixed precision, distributed reduction을 자동으로 다룰 수 있다는 자격증이 아니다.
- 한 예의 출력층 loss 감소는 batch 평균·검증 성능·일반화·사실성·안전성 개선을 보장하지 않는다.
- $\epsilon=0$, 항등 투영·FFN, 3-token 어휘는 정수와 간단한 분수로 답을 만들기 위한 편집부 선택이다.
- LayerNorm보다 앞선 전체 gradient와 attention의 $W_Q,W_K,W_V$ gradient는 범위 밖이다. 그 누락을 “gradient가 없다”로 해석하지 않는다.
- attention weight는 value 혼합 비율이지 예측의 충실한 인과 설명이 아니다.

## 학습 확인

### 마스터리 연습

#### 완전 풀이 확인

해설을 가리고 다음을 순서대로 계산하라.

1. ID $(1,2)$에서 $X$를 lookup한다.
2. causal uniform attention의 $A$, $O=AX$, $R=X+O$를 구한다.
3. $R$의 두 row를 각각 LayerNorm하고 마지막 row $n$을 고른다.
4. $f=\operatorname{ReLU}(n)$과 $s=n+f$를 구한다.
5. $z=sW_{\mathrm{out}}+b$, $p=\operatorname{softmax}(z)$, target `온다`의 $J=-\ln p_0$를 구한다.
6. $g_z=p-e_0$, $\partial J/\partial W_{\mathrm{out}}=s^{\mathsf T}g_z$, $\partial J/\partial b=g_z$, $\partial J/\partial s=g_zW_{\mathrm{out}}^{\mathsf T}$를 구한다.
7. FFN residual의 직접 경로와 ReLU 경로가 $n$으로 보내는 gradient를 따로 구해 더한다.
8. $\eta=0.1$로 출력층 $W_{\mathrm{out}},b$를 한 번 갱신했을 때 target logit·확률·손실의 방향을 먼저 예측하고 실행 결과로 확인한다.

#### 부분 완성

다음 빈칸을 계산 과정과 함께 채워라.

$$
X=\square,
\qquad
A=\square,
\qquad
O=\square,
\qquad
R=\square
$$

$$
n=\square,
\qquad
f=\square,
\qquad
s=\square
$$

$$
z=\square,
\qquad
p=\square,
\qquad
J=\square
$$

$$
g_z=\square,
\qquad
\frac{\partial J}{\partial W_{\mathrm{out}}}=\square,
\qquad
\frac{\partial J}{\partial s}=\square
$$

#### 새 수치 전이

순전파 logit은 그대로 두고 target만 ID 1 `오늘`로 바꾼다. 새 NLL과 $g_z$를 구하고, SGD가 세 bias를 각각 어느 방향으로 움직이는지 적어라. target이 바뀌어도 $g_z$의 성분 합이 0인지 검산한다.

이어 실제 shape 설정

$$
(B,T,D,H,D_h,D_{\mathrm{ff}},|\mathcal V|)
=(2,6,16,4,4,64,100)
$$

에서 head별 Q·K·V, score, concat, FFN activation, logits와 LayerNorm 통계의 shape를 적는다. 손계산 toy의 어느 축이 새로 복제됐는지도 설명한다.

#### 오류 진단

다음 풀이의 오류를 각각 owner와 연결해 고쳐라.

1. token ID 2를 ID 1보다 “두 배 큰 의미”로 해석했다.
2. causal mask를 softmax 뒤에 곱하고 row를 다시 정규화하지 않았다.
3. LayerNorm 평균을 $R$의 네 성분 전체에서 하나만 구했다.
4. ReLU가 두 token row를 섞어 새 sequence 표현을 만든다고 설명했다.
5. 오답 후보의 gradient를 모두 0으로 두었다.
6. $\partial J/\partial s$를 shortcut에만 보내고 FFN branch 기여를 버렸다.
7. 역전파가 끝나는 즉시 학습률 없이 parameter가 gradient 값으로 바뀐다고 썼다.

### 해설과 채점 기준

lookup과 attention 결과는

$$
X=
\begin{bmatrix}
1&0\\
0&1
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
1&0\\
1/2&1/2
\end{bmatrix},
\qquad
R=
\begin{bmatrix}
2&0\\
1/2&3/2
\end{bmatrix}
$$

이다. 두 row의 평균은 모두 1이고 분산은 각각 1과 $1/4$이므로 LayerNorm 출력은 $(1,-1)$과 $(-1,1)$이다. 마지막 row에서

$$
n=(-1,1),
\qquad
f=(0,1),
\qquad
s=(-1,2)
$$

를 얻는다. 출력은

$$
z=(\ln4,\ln2,0),
\qquad
p=\left(\frac47,\frac27,\frac17\right),
\qquad
J=\ln\frac74\approx0.559616
$$

이다. target one-hot이 $e_0=(1,0,0)$이므로

$$
g_z=
\left(-\frac37,\frac27,\frac17\right)
$$

이고 전체 출력 gradient는

$$
\frac{\partial J}{\partial W_{\mathrm{out}}}
=
\begin{bmatrix}
3/7&-2/7&-1/7\\
-6/7&4/7&2/7
\end{bmatrix},
\qquad
\frac{\partial J}{\partial b}=g_z
$$

$$
\frac{\partial J}{\partial s}
=
\left(0,-\frac{2\ln2}{7}\right)
$$

이다. FFN residual의 직접 경로가 같은 $\partial J/\partial s$를 보내고, ReLU branch는 첫 성분을 막고 둘째 성분을 다시 보내므로

$$
\frac{\partial J}{\partial n}
=
\left(0,-\frac{4\ln2}{7}\right)
$$

가 된다. 출력층을 $\eta=0.1$로 갱신하면 target 확률은 약 $0.665268$로 커지고 NLL은 약 $0.407566$으로 줄어든다.

target을 ID 1로 바꾼 새 수치 전이의 답은

$$
J_{\mathrm{new\ target}}=\ln\frac72,
\qquad
g_z=\left(\frac47,-\frac57,\frac17\right)
$$

이다. SGD는 target bias $b_1$을 올리고 나머지 $b_0,b_2$를 내린다. 세 gradient 합은 0이다. 실제 shape 전이의 답은 Q·K·V $(2,4,6,4)$, score $(2,4,6,6)$, concat $(2,6,16)$, FFN activation $(2,6,64)$, logits $(2,6,100)$, LayerNorm 통계 $(2,6,1)$이다.

| 평가 항목 | 2점 | 1점 | 0점 |
| --- | --- | --- | --- |
| lookup·shape 장부 | ID·행 선택·모든 축을 구분 | 값 또는 축 하나 누락 | ID를 연속 크기로 해석 |
| attention·mask | causal 후보와 row 합 1을 검산 | 산술 오류 하나 | 미래 누출·잘못된 축 |
| residual·LayerNorm | 두 residual과 token별 feature 통계를 계산 | 값 하나 오류 | broadcasting·전체축 평균 |
| FFN·activation | position-wise 순전파와 ReLU mask를 설명 | 순전파만 맞음 | token 혼합으로 설명 |
| logit·확률·NLL | 세 종류와 target 위치를 구분 | 산술 오류 하나 | logit을 확률로 읽음 |
| 출력 gradient | $g_z,dW,db,ds$와 shape를 계산 | 한 gradient 누락 | target만 gradient가 있다고 판단 |
| 분기 합산 | 직접·FFN branch 기여를 따로 구해 합산 | 최종값만 맞음 | 한 경로 누락 |
| update·검산 | 부호 예측, SGD, 손실 감소를 구분 | 방향만 맞음 | gradient와 update 혼동 |
| 새 target 전이 | 새 NLL·gradient·합 0을 계산 | 산술 오류 하나 | 원 target 답을 반복 |
| 실제 shape 전이 | head·query/key·FFN·vocab 축을 모두 기록 | shape 하나 누락 | head·feature·candidate 혼동 |

총 20점 중 17점 이상이고, **causal mask·확률 축·residual shape·LayerNorm 축·target 위치·gradient 부호·분기 합산 오류가 하나도 없어야** 통과다. 미달이면 위 `owner 경로와 오류의 위치` 표에서 0점을 받은 행의 owner 마스터리 연습을 다시 풀고, 이 문서의 같은 답을 외우지 말고 새 target·실제 shape 전이부터 재시도한다.

### 다음 문서

- [[LLM을 만든 수학]] — 전체 개념 지도로 돌아가 각 owner와 실제 LLM의 생략 조건을 다시 연결한다.
- [[대규모 언어 모델]] — 이 손계산이 생략한 자료·규모·시스템·평가 조건으로 범위를 넓힌다.

## 출처

- [[035_신경 확률 언어 모형과 분산 단어 표현]]
- [[018_역전파와 다층 신경망 학습]]
- [[055_Transformer와 자기어텐션 기반 시퀀스 모델링]]
- Yoshua Bengio·Réjean Ducharme·Pascal Vincent·Christian Jauvin, [A Neural Probabilistic Language Model](https://www.jmlr.org/papers/v3/bengio03a.html), 2003, pp. 1141–1143.
- Ashish Vaswani 외, [Attention Is All You Need](https://proceedings.neurips.cc/paper/7181-attention-is-all-you-need.pdf), 2017, §§3.1–3.3.
- David E. Rumelhart·Geoffrey E. Hinton·Ronald J. Williams, [Learning Internal Representations by Error Propagation](https://doi.org/10.7551/mitpress/5236.003.0012), 1986, pp. 322–328.

## 관련 항목

- [[LLM을 만든 수학]]
- [[단어 임베딩]]
- [[어텐션 메커니즘]]
- [[잔차 연결]]
- [[Layer Normalization]]
- [[활성화 함수]]
- [[Transformer]]
- [[소프트맥스]]
- [[로그가능도]]
- [[역전파]]
- [[경사하강법]]
