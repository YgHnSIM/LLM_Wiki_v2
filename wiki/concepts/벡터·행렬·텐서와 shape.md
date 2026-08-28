---
schema_version: 3
id: concept.벡터-행렬-텐서와-shape
page_type: concept
title: 벡터·행렬·텐서와 shape
aliases:
  - vector matrix tensor shape
  - 텐서 shape
  - 차원과 축
tags:
  - type/concept
  - domain/mathematics
  - domain/machine-learning
  - domain/ai
created: '2026-07-23'
updated: '2026-07-24'
editorial_status: active
review:
  evidence_coverage: verified
  content_mode: descriptive
artifacts:
  - raw/035_Neural Probabilistic Language Model - Distributed Word Representations and Neural Language Modeling.ko.md
  - raw/055_The Transformer Attention Is All You Need.ko.md
evidence:
  - source_id: bengio-et-al-2003-nplm
    locator: 'JMLR 3, §§2–3의 vocabulary matrix C와 문맥 단어 표현 결합'
    relation: supports
  - source_id: vaswani-et-al-2017-attention
    locator: '§§3.1–3.2의 d_model 폭, Q·K·V 투영과 attention 입력·출력 차원'
    relation: supports
relations:
  - target: concept.어텐션-메커니즘
    kind: related
  - target: concept.잔차-연결
    kind: related
  - target: concept.transformer
    kind: related
learning:
  difficulty:
    entry: introductory
    target: introductory
  prerequisites: []
  assumed_knowledge: '수를 묶는 방식, 축과 shape를 이 문서에서 정의한다.'
  outcomes:
    - 'LLM 문서의 벡터·행렬·텐서 표기를 축과 shape로 읽고, 성분별 연산·브로드캐스팅이 가능한 조건을 직접 확인할 수 있다.'
  next:
    - target: concept.내적-행렬곱과-선형변환
      reason: 내적·행렬곱과 선형변환 — shape가 맞는 배열에서 내적·행렬곱으로 feature를 결합하고 공간을 바꾸는 방법을 계산한다.
    - target: concept.단어-임베딩
      reason: 단어 임베딩 — token ID가 이 문서의 feature 축을 가진 조밀한 벡터로 조회되는 실제 모델 단계를 본다.
---
# 벡터·행렬·텐서와 shape

> [!note] 학습 안내
> **난이도:** 입문<br>
> **선수 지식:** 없음 — 수를 묶는 방식, 축과 shape를 이 문서에서 정의한다.<br>
> **읽고 나면:** LLM 문서의 벡터·행렬·텐서 표기를 축과 shape로 읽고, 성분별 연산·브로드캐스팅이 가능한 조건을 직접 확인할 수 있다.

## 1단계 — 먼저 잡을 핵심

### 왜 숫자의 묶는 방식이 중요한가

언어 모델은 token 하나, 문장 하나, 여러 문장 묶음처럼 서로 다른 단위를 숫자로 다룬다. 숫자를 단순히 길게 나열하면 어느 숫자가 어느 token·문장·특징에 속하는지 알 수 없다. **shape**는 배열의 각 축(axis)이 얼마나 길고 무엇을 세는지를 적는 약속이다.

예를 들어 길이 4인 한 token 표현은 `(4,)`이고, token 3개의 표현을 행으로 쌓으면 `(3, 4)`다. 앞 축 3은 token 위치, 뒤 축 4는 각 위치의 feature를 뜻한다. 이 두 축을 바꾸면 같은 12개 숫자라도 다른 대상을 뜻한다.

### 스칼라·벡터·행렬·텐서

- **스칼라**(scalar)는 값 하나다. 학습률 $\eta$나 손실 $\mathcal L$처럼 shape를 적으면 `()`인 값으로 볼 수 있다.
- **벡터**(vector)는 한 축을 따라 놓인 숫자 묶음이다. 길이 $d$인 표현 $x$의 shape는 `(d,)` 또는 행·열 관례를 밝혔을 때 $(1\times d)$, $(d\times1)$이다.
- **행렬**(matrix)은 두 축을 가진 표다. token 수 $T$, feature 수 $d$인 표현 표 $X$는 보통 $X\in\mathbb R^{T\times d}$로 쓴다.
- **텐서**(tensor)는 축이 셋 이상인 배열을 가리키는 실무 용어다. batch $B$개의 길이 $T$ 시퀀스 표현은 흔히 $X\in\mathbb R^{B\times T\times d}$다.

텐서의 축 수와 행렬의 **rank**는 같은 말이 아니다. 여기서 텐서의 차수(order)는 축 개수이고, 행렬 rank는 독립인 행 또는 열 방향의 수를 뜻한다. 저순위 근사처럼 rank가 중요해지는 문제는 이후 심화 경로의 별도 질문이며, 이 문서는 배열을 읽는 규약을 맡는다.

### 이 문서의 범위

이 문서는 자료의 종류, 축, 인덱스, shape, 성분별 연산과 브로드캐스팅을 설명한다. 대응 성분을 곱해 더하는 내적, 축을 줄여 새 좌표를 만드는 행렬곱, 학습되는 가중치와 bias의 역할은 [[내적·행렬곱과 선형변환]]에서 완전하게 다룬다.

## 2단계 — 작동 원리

### 가장 작은 구체적 예

두 token을 세 feature로 표현한 설명용 행렬을 보자. 행은 token 위치 $t$, 열은 feature 번호 $j$다.

$$
X=
\begin{bmatrix}
1 & 2 & -1\\
0 & 3 & 4
\end{bmatrix}
\in\mathbb R^{2\times3}
$$

따라서 $X_{1,2}=2$는 첫째 token의 둘째 feature이고, $X_{2,3}=4$는 둘째 token의 셋째 feature다. 여기서는 사람이 읽기 쉽게 인덱스를 1부터 썼다. 실제 프로그램이 0부터 세는지는 별도 구현 관례이며, 수학식의 인덱스 범위와 혼동하지 않는다.

같은 위치마다 길이 3인 위치 신호 $p=(0.1,-0.2,0.3)$를 더하면 다음과 같다. 이 숫자는 설명용이며 실제 위치 인코딩 값이 아니다.

$$
Y=X+p
=
\begin{bmatrix}
1.1 & 1.8 & -0.7\\
0.1 & 2.8 & 4.3
\end{bmatrix}
$$

$X$의 shape는 $(2,3)$, $p$의 shape는 $(3,)$이고, 결과 $Y$의 shape는 다시 $(2,3)$다. $p$의 세 성분을 두 행에 각각 복사해 더한 것이 아니라, 뒤 축이 맞을 때 그 축을 따라 같은 값을 적용하라는 **브로드캐스팅(broadcasting)** 규칙으로 해석한 것이다.

### shape를 따라 읽는 순서

1. 먼저 각 축의 이름을 붙인다. 위 $X$는 `(token, feature)`이고, 실제 batch까지 넣으면 `(batch, token, feature)`가 된다.
2. 그다음 인덱스가 가리키는 축을 확인한다. $X_{t,j}$에서 $t$는 token 위치, $j$는 feature다.
3. 연산 전 두 shape를 비교한다. 성분별 덧셈은 대응할 축이 같거나, 한쪽 축 길이가 1이라 브로드캐스팅 규칙으로 늘릴 수 있어야 한다.
4. 연산 뒤 남는 축을 적는다. 덧셈은 축을 없애지 않으므로 $(2,3)+(3,)\to(2,3)$다.

이 절차는 단순한 형식 검사가 아니다. Transformer에서 token마다 같은 폭 $d_{\mathrm{model}}$을 유지하는 이유, 잔차 연결에서 왜 두 항의 마지막 축이 같아야 하는지, attention score가 왜 token 축 둘을 갖는지를 추적하는 방법이다.

### 예에서 일반 원리로

batch $B$개가 각각 길이 $T$인 시퀀스를 담을 때 입력은 보통 $X\in\mathbb R^{B\times T\times d}$다. 그러나 실제 문장은 길이가 달라 한 직사각형 배열에 그대로 쌓을 수 없다. 짧은 문장을 padding으로 채우고 mask로 그 채운 자리를 계산에서 제외하거나, 길이별로 묶어 처리한다. padding token을 실제 언어 정보처럼 섞지 않는 것은 shape만이 아니라 mask의 의미까지 확인해야 하는 문제다.

수학의 좌표와 배열 표기는 오래된 일반 도구이며, 그것만으로 LLM이 직접 도출된 것은 아니다. 수치 계산에서는 축을 가진 배열로 자료를 저장하고, 신경 언어 모형은 어휘 행렬의 행을 단어 표현으로 사용했으며, Transformer는 시퀀스와 feature 축을 보존한 채 $Q,K,V$를 만든다. 이 문서는 그 네 층을 잇는 표기 규약만 설명하고, 역사적 단일 계보를 주장하지 않는다.

## 3단계 — 기술과 근거

### 축·인덱스·shape를 정식으로 쓰는 법

batch 시퀀스 표현을 다음처럼 쓴다.

$$
X\in\mathbb R^{B\times T\times d},\qquad
X_{b,t,j}\in\mathbb R
$$

| 기호 | 현재 문서에서의 의미 | 종류·shape | 값의 출처 |
| --- | --- | --- | --- |
| $B$ | 한 번에 처리하는 시퀀스 수 | 양의 정수 | batch 설계 |
| $T$ | padding 뒤 공통으로 둔 최대 token 길이 | 양의 정수 | 입력 묶음·truncation 규칙 |
| $d$ | token 표현의 feature 수 | 양의 정수 | 모델 폭 설계 |
| $X$ | batch의 token 표현 | $B\times T\times d$ 실수 텐서 | embedding 또는 이전 층 출력 |
| $X_{b,t,j}$ | $b$번째 시퀀스의 $t$번째 token, $j$번째 feature | 실수 스칼라 | $X$에서 선택 |
| $p$ | 각 위치에 더할 feature별 신호 | $d$ 또는 $T\times d$ | 위치 표현 설계 |

`$X\in\mathbb R^{B\times T\times d}$`는 모든 원소가 실수라는 자료형과 축 길이를 함께 말한다. 이것은 값이 확률이라는 뜻도, 각 feature 하나가 사람 언어의 독립 의미라는 뜻도 아니다. 실수 배열을 어떤 연산에 넣을지와 학습 목표가 뒤에서 그 역할을 정한다.

### 핵심 식: 성분별 덧셈과 브로드캐스팅

#### 수식이 답하려는 질문

모든 token 위치에 같은 feature 폭의 신호를 더하고 싶을 때, 어떤 값끼리 더해지며 결과 shape는 무엇인가? $P\in\mathbb R^{T\times d}$가 위치마다 다른 신호를 담으면 다음 식을 쓴다.

$$
Y=X+P,\qquad
Y_{b,t,j}=X_{b,t,j}+P_{t,j}
$$

#### 가정과 기호·shape

$X$는 $B\times T\times d$, $P$는 $T\times d$다. $P$에는 batch 축이 없으므로, 각 $b$에 같은 $P_{t,j}$를 적용한다는 규칙을 선택했다. 결과 $Y$는 $B\times T\times d$다. $P$가 `(T, d)`가 아니라 `(d,)`이면 위치마다 같은 feature offset만 더하고, `(T,)`이면 마지막 feature 축과 맞지 않아 이 식의 의미가 달라진다.

#### 한 항씩 만드는 과정

1. $X_{b,t,j}$는 특정 batch·위치·feature의 기존 값이다.
2. $P_{t,j}$는 같은 위치·feature에 주는 추가 신호다.
3. 두 값은 모두 스칼라이므로 더할 수 있다.
4. $b$가 식 오른쪽의 $P$에 없다는 사실은 $P$가 batch마다 새로 계산되지 않고 공유됨을 뜻한다.
5. 남는 인덱스 $b,t,j$가 모두 결과에 남으므로 결과 shape는 $B\times T\times d$다.

덧셈 자체는 정의된 성분별 연산이다. 어느 신호를 더할지, batch에서 공유할지, feature 폭을 얼마로 할지는 모델 설계 선택이다. 원 Transformer가 token embedding과 같은 폭의 위치 인코딩을 더한 것은 이 shape 조건을 만족하게 한 한 선택이다.

### LLM에서 shape가 보장하는 것과 보장하지 않는 것

Bengio 등의 신경 확률 언어 모형은 어휘 행렬 $C$의 행을 단어 feature로 사용했고, Transformer는 각 위치 표현에 서로 다른 투영을 적용해 attention을 계산했다. 두 사례는 행·열과 feature 폭을 명시해야 어떤 값을 선택하거나 변환하는지 재현할 수 있음을 보여 준다.

그러나 shape가 맞는다고 계산의 의미까지 맞는 것은 아니다. `(batch, token, feature)`를 `(batch, feature, token)`으로 잘못 읽어도 어떤 라이브러리는 연산을 허용할 수 있다. mask를 token 축이 아니라 feature 축에 적용하거나, 길이 1 축을 의도하지 않게 방송하면 오류 없이 다른 모델을 계산할 수 있다.

## 검증과 한계

### 확인된 사실

신경 언어 모형의 어휘 행렬과 Transformer의 $Q,K,V$ 표현은 행렬·시퀀스·feature 차원을 가진 수치 표현을 사용한다. Transformer의 잔차 덧셈도 두 항의 공통 $d_{\mathrm{model}}$ 폭을 요구한다. 이는 논문에 나온 구조적 사실이며, 이 문서의 작은 배열은 이를 설명하기 위해 만든 계산 예다.

### 성립 조건과 실패하는 경우

- 성분별 덧셈은 대응 축이 같거나 명시한 브로드캐스팅 규칙으로 정렬될 때만 정의한다.
- batch를 따라 값이 달라져야 하는 신호를 `(T,d)`로 두면 모든 batch에 잘못 공유된다.
- padding된 위치를 실제 token처럼 attention·손실에 넣으면 shape는 맞아도 의미가 틀린다.
- 고정 길이 텐서는 가변 길이 입력을 표현하는 한 방법일 뿐이다. ragged representation, packing, block-sparse layout처럼 다른 저장·계산 선택도 가능하다.

### 흔한 오해

텐서의 축 수가 많다고 더 "고차원적인 의미"가 자동으로 생기는 것은 아니다. 또 `shape`는 메모리에 실제로 어떻게 배치됐는지, 계산량·수치 안정성·학습 가능성까지 단독으로 설명하지 않는다. 이 문서는 연산 가능한 자료형을 확인하는 출발점이다.

## 학습 확인

### 마스터리 연습

#### 완전 풀이 확인

본문의 $X\in\mathbb R^{2\times3}$와 $p\in\mathbb R^3$를 다시 계산하고, 각 축을 `(token, feature)`로 소리 내어 읽는다. $X_{2,3}$과 $Y_{1,2}$가 어느 값을 가리키는지도 확인한다.

#### 부분 완성

batch 2개, token 2개, feature 3개를 담은 $X\in\mathbb R^{2\times2\times3}$가 있다. 위치별 신호 $P\in\mathbb R^{2\times3}$를 모든 batch에 공유해 $Y=X+P$를 만든다. 다음을 채워라.

$$
X_{b,t,j}+P_{t,j}=Y_{\square,\square,\square},
\qquad
\operatorname{shape}(Y)=\square
$$

$P$에 없는 축과 덧셈 뒤 남는 축을 각각 적는다.

#### 새 수치 전이

$$
X=
\begin{bmatrix}
1&2&3\\
4&5&6
\end{bmatrix},
\qquad
p=(10,20,30)
$$

에서 $X+p$를 계산한다. 이어 $p$를 열벡터 $(3,1)$로 바꾸어 같은 기호 $X+p$를 쓰면 왜 같은 연산이 아니며 일반적으로 허용되지 않는지 설명한다.

#### 오류 진단

shape가 $(B,T,D)=(4,5,8)$인 hidden state에서 token mask의 shape를 `(8,)`로 만들고 마지막 축에 적용한 구현이 있다. 이 mask가 feature를 가리는 이유와, token 위치를 가리려면 최소한 어느 두 축 $(B,T)$에 대응해야 하는지 고쳐 쓴다.

### 해설과 채점 기준

1. **부분 완성:** $Y_{b,t,j}=X_{b,t,j}+P_{t,j}$이고 shape는 $(2,2,3)$이다. $P$에는 batch 축 $b$가 없으므로 두 batch에 공유되고, $b,t,j$가 모두 남는다.
2. **새 수치 전이:** 결과는 $\begin{bmatrix}11&22&33\\14&25&36\end{bmatrix}$다. $(3,)$은 마지막 feature 축과 대응하지만 $(3,1)$은 두 축 배열이라 $(2,3)$과 끝축 정렬이 맞지 않는다.
3. **오류 진단:** `(8,)`은 feature 축 $D$에 대응한다. token mask는 보통 $(B,T)=(4,5)$에서 유효 위치를 표시하고, attention이나 손실의 요구 shape에 맞춰 길이 1 축을 명시적으로 추가한다.

각 문제는 0–3점이다. 축 이름·shape·값을 모두 맞히면 3점, 산술 실수만 있으면 2점, shape만 맞히면 1점이다. 총 7점 이상이면서 **token 축과 feature 축을 바꾸는 오류가 없어야** 통과다. 미달이면 `shape를 따라 읽는 순서`를 복습한 뒤 $(B,T,D)=(2,3,4)$와 $P\in\mathbb R^{3\times4}$로 재시도한다.

### 다음 문서

- [[concept.내적-행렬곱과-선형변환|내적·행렬곱과 선형변환]] — shape가 맞는 배열에서 내적·행렬곱으로 feature를 결합하고 공간을 바꾸는 방법을 계산한다.
- [[concept.단어-임베딩|단어 임베딩]] — token ID가 이 문서의 feature 축을 가진 조밀한 벡터로 조회되는 실제 모델 단계를 본다.

## 출처

- [[035_신경 확률 언어 모형과 분산 단어 표현]]
- [[055_Transformer와 자기어텐션 기반 시퀀스 모델링]]
- Yoshua Bengio·Réjean Ducharme·Pascal Vincent·Christian Jauvin, [A Neural Probabilistic Language Model](https://www.jmlr.org/papers/v3/bengio03a.html), JMLR 3, 2003, §§2–3.
- Ashish Vaswani 외, [Attention Is All You Need](https://proceedings.neurips.cc/paper/7181-attention-is-all-you-need.pdf), NeurIPS 2017, §§3.1–3.2.

## 관련 항목

- [[concept.내적-행렬곱과-선형변환|내적·행렬곱과 선형변환]]
- [[concept.단어-임베딩|단어 임베딩]]
- [[concept.어텐션-메커니즘|어텐션 메커니즘]]
- [[concept.잔차-연결|잔차 연결]]
- [[concept.transformer|Transformer]]
