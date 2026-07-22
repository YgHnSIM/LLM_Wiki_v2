---
schema_version: 2
id: concept.perplexity
page_type: concept
title: Perplexity
aliases:
  - 퍼플렉시티
  - PPL
tags:
  - type/concept
  - domain/ai
created: '2026-05-07'
updated: '2026-07-23'
lifecycle: active
verification: verified
artifacts:
  - >-
    raw/001_Shannon's N-gram Model - The Foundation of Statistical Language
    Processing..md
  - raw/019_Katz Back-off - Handling Sparse Data in Language Models.ko.md
  - raw/019_Katz Back-off - Handling Sparse Data in Language Models.commentary.ko.md
  - raw/066_Scaling Laws for Neural Language Models Predicting Performance from Scale.ko.md
  - raw/066_Scaling Laws for Neural Language Models Predicting Performance from Scale.commentary.ko.md
evidence:
  - source_id: shannon-1948
    locator: 'Part I, §§2–3 and §6'
    relation: supports
  - source_id: katz-1987
    locator: 'p. 401, Table I and the accompanying paragraph'
    relation: supports
  - source_id: chen-goodman-1998
    locator: '§1.1, cross-entropy and perplexity definitions'
    relation: supports
  - source_id: kaplan-et-al-2020-scaling-laws
    locator: '§§1.3·2·8, 특히 token 평균 cross-entropy 정의와 관련 언어 과제로의 전이를 남은 문제로 둔 논의'
    relation: supports
related:
  - source.001
  - source.019
  - source.066
  - concept.확률
  - concept.조건부-확률
  - concept.n-gram-모델
  - concept.데이터-희소성
  - concept.smoothing
  - concept.언어-모델-스케일링-법칙
  - analysis.n-gram에서-llm으로
  - entity.클로드-섀넌
---
# Perplexity

> [!note] 학습 안내
> **난이도:** 중급<br>
> **선수 지식:** [[확률]]의 0과 1 사이 값, [[조건부 확률]]의 문맥별 다음 토큰 확률<br>
> **읽고 나면:** 토큰별 조건부확률에서 평균 음의 로그확률과 perplexity를 끝까지 계산하고, 왜 로그·평균·지수화를 쓰는지와 어떤 조건에서만 값을 비교할 수 있는지 설명할 수 있다.

## 1단계 — 먼저 잡을 핵심

### 이 개념이 필요해진 문제

언어 모델은 평가 문장 안의 각 실제 토큰에 확률을 준다. 문장 전체 확률은 이 값들을 곱한 것이지만, 0과 1 사이의 수를 많이 곱하면 아주 작아져 읽고 비교하기 어렵다. 길이가 다른 문장은 항의 개수도 달라 단순 곱만으로는 공정하게 비교하기 어렵다.

[[Perplexity]]는 토큰마다 준 확률을 로그로 바꿔 더하고, 토큰 수로 평균 내고, 다시 지수화해 읽기 쉬운 한 수로 만든 지표다. 같은 평가 텍스트·토큰화·확률 정의 아래에서는 낮을수록 모델이 실제 토큰열에 더 높은 확률을 주었다는 뜻이다.

### 먼저 알아야 할 기초 개념

- **평가 토큰열**: 학습에 쓰지 않은 텍스트를 토큰 순서대로 나눈 결과다. 이 지표는 이 특정 평가열에 대한 모델 점수다.
- **토큰별 확률 $p_i$**: 위치 $i$의 실제 토큰 $w_i$에 모델이 준 조건부확률 $P(w_i\mid w_{<i})$다. $w_{<i}$는 $i$보다 앞선 토큰들을 뜻한다.
- **자연로그 $\ln$**: 양수의 곱을 합으로 바꾸는 함수다. 이 문서에서는 $\log$가 아니라 밑이 $e$인 $\ln$을 명시해 쓴다.
- **지수함수 $\exp$**: $\exp(x)=e^x$이며 자연로그의 역함수다. $\exp(\ln a)=a$가 성립한다.
- **음의 로그확률**: 확률이 작을수록 큰 벌점이 되게 $-\ln p_i$로 바꾼 값이다.

### 핵심 아이디어

perplexity는 확률 그 자체도, 정확도 백분율도 아니다. 평가열에서 실제로 나온 토큰이 모델에게 평균적으로 얼마나 “놀라운”지를 조건부확률로 요약한 값이다. $\operatorname{PPL}=4$는 동일한 평균 음의 로그확률을 내는 균등한 4개 후보와 비슷한 크기의 불확실성이라는 직관을 줄 수 있지만, 실제로 매 위치에 후보가 정확히 4개였다는 뜻은 아니다.

[[데이터 희소성]] 때문에 한 토큰의 확률이 0이 되면 $\ln 0$은 유한한 수가 아니어서 perplexity가 무한대로 발산한다. [[Smoothing|평활화]]은 미관측 조합에 작은 확률을 배분해 이 극단을 피하려는 이유 중 하나다.

## 2단계 — 작동 원리

### 가장 작은 구체적 예

평가열이 세 토큰이고, 모델이 실제 토큰에 준 조건부확률이 차례대로 $p_1=1/2$, $p_2=1/4$, $p_3=1/8$이라고 하자. 먼저 각 확률을 음의 자연로그로 바꾼다.

| 위치 $i$ | 실제 토큰 확률 $p_i$ | $-\ln p_i$ |
| --- | ---: | ---: |
| 1 | $1/2$ | $\ln 2\approx0.6931$ |
| 2 | $1/4$ | $\ln 4\approx1.3863$ |
| 3 | $1/8$ | $\ln 8\approx2.0794$ |

세 벌점의 평균은 다음과 같다.

$$
\frac{0.6931+1.3863+2.0794}{3}
=1.3863
=\ln4.
$$

마지막으로 지수화하면 perplexity를 얻는다.

$$
\operatorname{PPL}
=\exp(\ln4)
=4.
$$

이 예에서 확률이 작아질수록 해당 토큰의 벌점이 커지고, 평균 벌점이 커지면 perplexity도 커진다. 숫자는 계산을 위한 예이며 특정 모델의 실제 평가 결과가 아니다.

### 입력에서 출력까지

1. 고정한 평가 토큰열 $w_1,\ldots,w_N$을 준비한다.
2. 각 위치에서 모델이 실제 토큰에 준 조건부확률 $p_i=P(w_i\mid w_{<i})$를 기록한다.
3. 각 $p_i$에 $-\ln$을 적용해 낮은 확률을 큰 벌점으로 바꾼다.
4. $N$개 벌점을 더한 뒤 $N$으로 나눠 토큰 하나당 평균 벌점을 만든다.
5. $\exp$를 적용해 로그 공간의 평균을 원래의 양수 척도로 되돌린다.
6. 같은 단위와 평가 조건을 쓴 다른 모델의 값과만 비교한다.

### 곱에서 평균으로 읽기

세 토큰 예의 문장 확률은 $\frac12\times\frac14\times\frac18=\frac1{64}$다. 이를 일반화하면, 모든 $p_i>0$일 때 perplexity는 다음과 같이도 쓸 수 있다.

$$
\operatorname{PPL}(w_{1:N})
=\exp\left(-\frac1N\sum_{i=1}^{N}\ln p_i\right)
=\left(\prod_{i=1}^{N}p_i\right)^{-1/N}.
$$

오른쪽의 $\left(\prod_i p_i\right)^{1/N}$는 토큰별 확률의 기하평균이다. perplexity는 그 역수다. 즉 각 토큰에 꾸준히 높은 확률을 준 모델은 기하평균이 커져 perplexity가 작아진다.

## 3단계 — 기술과 근거

### 정식 용어와 기호

| 기호 | 현재 문서에서의 의미 | 종류 | 값의 범위 또는 구조 |
| --- | --- | --- | --- |
| $N$ | 평가 토큰의 수 | 양의 정수 | 평가열 길이 |
| $i$ | 현재 토큰 위치 | 정수 인덱스 | $1,\ldots,N$ |
| $w_i$ | 위치 $i$의 실제 평가 토큰 | 토큰 | 평가 어휘의 원소 |
| $w_{<i}$ | 위치 $i$보다 앞선 토큰열 | 토큰열 | 문맥 |
| $p_i$ | 실제 토큰 $w_i$의 조건부확률 | 스칼라 | $0\le p_i\le1$ |
| $-\ln p_i$ | 위치 $i$의 음의 로그확률 | 스칼라 | $p_i>0$이면 0 이상 |
| $\sum$ | 모든 토큰 위치의 벌점을 더하는 연산 | 합 | 인덱스 $i$를 없앰 |
| $\exp$ | 자연로그를 되돌리는 지수함수 | 함수 | 항상 양수 |
| $\operatorname{PPL}$ | 평가열의 perplexity | 스칼라 | 1 이상, 0 확률이면 무한대 |

### 핵심 수식: 평균 음의 로그확률의 지수

#### 수식이 답하려는 질문

이 수식은 “모델이 평가열의 실제 토큰들을 평균적으로 얼마나 낮은 확률로 보았는가?”를 길이에 맞춰 한 수로 요약한다.

$$
\operatorname{PPL}(w_{1:N})
=\exp\left(-\frac{1}{N}\sum_{i=1}^{N}
\ln P(w_i\mid w_{<i})\right).
$$

#### 가정과 요구 조건

각 위치의 실제 토큰에 모델이 조건부확률을 정의해야 하고, 유한한 perplexity를 얻으려면 모든 $p_i$가 0보다 커야 한다. 같은 문장의 서로 다른 토큰화, 다른 시험 집합, 다른 문맥 처리 규칙은 서로 다른 $p_i$들의 집합을 만들므로 같은 숫자로 직접 비교할 수 없다.

#### 한 항씩 만드는 과정

1. $P(w_i\mid w_{<i})$는 위치 $i$에서 실제 정답 토큰에 준 확률이다.
2. $\ln$은 조건부확률들의 곱을 합으로 바꾼다. $\ln\left(\prod_i p_i\right)=\sum_i\ln p_i$다.
3. 확률은 1 이하라 $\ln p_i\le0$이다. 앞의 마이너스 부호는 낮은 확률일수록 큰 양의 벌점이 되게 한다.
4. $1/N$을 곱해 합계를 토큰 하나당 평균으로 바꾼다. 그래서 같은 토큰 단위 안에서는 길이가 다른 평가열도 평균 예측 난이도를 비교할 수 있다.
5. $\exp$는 로그 공간의 평균을 양수 척도로 되돌린다. 자연로그와 역관계라 $\exp(\ln a)=a$다.

#### 왜 이 연산을 쓰는가

조건부확률을 곱하면 순서대로 실제 토큰열이 나올 확률을 표현할 수 있지만, 긴 열에서는 매우 작은 수가 된다. 로그는 이 곱을 덧셈으로 바꿔 수치 계산과 항별 기여 확인을 쉽게 한다. 평균은 토큰 수가 다른 열에서 단순 합이 길이에 따라 커지는 문제를 줄인다. 지수화는 평균 로그 벌점을 “역 기하평균 확률” 형태의 양수 척도로 바꾼다.

이 세 연산은 서로 다른 임의 장식이 아니다. 로그–합–평균–지수의 조합 때문에 perplexity는 토큰별 확률의 기하평균과 정확히 연결된다. 다만 `평균을 낼 토큰 단위`와 `어떤 확률을 평가할지`는 사람이 정하는 평가 설계다.

#### 필연적인 부분과 설계 선택

- **수학적 귀결:** 자연로그와 지수함수의 성질을 쓰면 위 식은 역 기하평균 식과 동치다.
- **정규화의 목적:** $N$으로 나누는 것은 길이에 따라 누적 벌점이 달라지는 것을 토큰당 평균으로 바꾸기 위한 선택이다.
- **평가 설계:** 토큰화, 어휘, 문장 시작·끝 처리, 시험 집합, 자연로그 또는 다른 로그 밑, 모델의 조건부확률 정의는 비교 조건의 일부다.
- **해석의 한계:** 낮은 perplexity는 그 평가 토큰열의 확률 예측이 좋았다는 뜻이지, 답변의 사실성·안전성·유용성·인간 선호를 자동으로 뜻하지 않는다.

#### 대안과 실패 조건

어떤 $p_j=0$이면 $\ln p_j=-\infty$이므로 평균 음의 로그확률은 $+\infty$, perplexity도 $+\infty$가 된다. [[Smoothing]]은 N-gram의 미관측 조합에 0이 아닌 확률을 주려는 방법이다. 신경 언어 모델도 일반적으로 softmax로 양의 분포를 만들지만, 수치적 언더플로·어휘 밖 입력·평가 전처리는 별도 점검해야 한다.

마스크드 언어 모델처럼 모든 위치를 왼쪽 문맥만으로 예측하지 않는 모델에는 일반 자기회귀 perplexity와 다른 pseudo-perplexity 또는 별도 평가 정의가 쓰일 수 있다. 이름이 같다고 서로 다른 확률 정의의 수치를 한 순위표에서 직접 비교하면 안 된다.

### 역사적 평가와 스케일링 손실의 연결

Katz의 1987년 논문은 약 75만 단어의 사무 서신 자료로 통계를 만들고 100문장을 시험한 제한된 비교에서 bigram perplexity 117, trigram perplexity 88을 보고했다. 비교법의 값은 각각 118·119와 89·91이었다. 이는 특정 말뭉치·어휘·차수·전처리 조건에서의 상대 비교이지 모든 언어 모델의 보편적 순위가 아니다.

[[066_신경 언어 모델의 스케일링 법칙|Kaplan 등의 2020년 스케일링 연구]]는 WebText2 계열 토큰의 평균 cross-entropy 손실을 다뤘다. 같은 토큰화와 자연로그 조건에서는 이 평균 손실을 지수화한 값이 perplexity다. 하지만 논문도 손실 감소가 관련 언어 과제 향상으로 어떻게 이어지는지는 후속 조사 문제로 남겼다. 매끄러운 loss·perplexity 곡선을 사실성, 안전성이나 특정 능력의 직접 측정으로 바꾸어 읽을 수는 없다.

## 검증과 한계

### 비교 조건과 흔한 오해

- perplexity는 확률도 정확도도 아니다. 평가열의 평균 음의 로그확률을 변환한 지표다.
- 낮은 값은 같은 평가 조건에서 실제 토큰에 더 높은 확률을 준다는 뜻이다. 다른 토큰화·어휘·시험 집합의 값은 직접 비교하지 않는다.
- $\operatorname{PPL}=4$는 실제 매 위치의 후보 수가 4개라는 뜻이 아니라, 균등한 선택 수에 비유한 해석이다.
- 0 확률은 “문장이 거짓”이라는 판정이 아니라, 특정 모델이 해당 조건부 조합에 부여한 값이다.
- 이 문서의 세 토큰 예는 계산용이다. Katz·Kaplan의 실험 조건이나 실제 모델 성능을 재현하지 않는다.

## 학습 확인

### 확인 질문과 답

1. 확률 $1/2$, $1/4$, $1/8$의 세 토큰 예에서 평균 음의 로그확률과 perplexity는 각각 얼마인가?

   **답:** 평균 음의 로그확률은 $\ln4\approx1.3863$이고, 지수화한 perplexity는 4다.

2. perplexity 식에서 로그와 평균을 쓰는 이유는 각각 무엇인가?

   **답:** 로그는 매우 작은 확률들의 곱을 더하기 쉬운 합으로 바꾸고, 평균은 토큰 수에 따른 누적 크기를 토큰당 값으로 정규화한다.

3. 토큰 하나의 확률이 0이면 왜 perplexity가 무한대가 되는가?

   **답:** $\ln0=-\infty$라서 음의 로그확률이 $+\infty$가 되고, 그 평균을 지수화한 값도 무한대로 발산하기 때문이다.

### 다음 문서

- [[Smoothing]] — 미관측 조합의 0 확률을 어떻게 정규화된 분포로 바꾸는지 본다.
- [[066_신경 언어 모델의 스케일링 법칙]] — token 평균 손실 곡선을 모델·데이터·계산 규모와 어떻게 연결했는지 읽는다.

## 출처

- [[001_섀넌의 N-gram 모델]]
- [[019_Katz 백오프와 희소 데이터 확률 추정]]
- [[066_신경 언어 모델의 스케일링 법칙]]
- Claude E. Shannon, [A Mathematical Theory of Communication](https://people.math.harvard.edu/~ctm/home/text/others/shannon/entropy/entropy.pdf), 1948, Part I §6.
- Slava M. Katz, [Estimation of Probabilities from Sparse Data for the Language Model Component of a Speech Recognizer](https://doi.org/10.1109/TASSP.1987.1165125), 1987, p. 401, Table I.
- Stanley F. Chen·Joshua Goodman, [An Empirical Study of Smoothing Techniques for Language Modeling](https://dash.harvard.edu/handle/1/25104739), 1998, §1.1.
- Jared Kaplan 외, [Scaling Laws for Neural Language Models](https://arxiv.org/abs/2001.08361), 2020, §§1.3·2·8.

## 관련 항목

- [[확률]]
- [[조건부 확률]]
- [[001_섀넌의 N-gram 모델]]
- [[N-gram 모델]]
- [[데이터 희소성]]
- [[Smoothing]]
- [[066_신경 언어 모델의 스케일링 법칙]]
- [[언어 모델 스케일링 법칙]]
- [[N-gram에서 LLM으로]]
- [[클로드 섀넌]]
- [[019_Katz 백오프와 희소 데이터 확률 추정]]
