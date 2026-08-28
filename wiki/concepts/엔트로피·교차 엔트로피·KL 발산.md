---
schema_version: 3
id: concept.엔트로피-교차-엔트로피-kl-발산
page_type: concept
title: 엔트로피·교차 엔트로피·KL 발산
aliases:
  - entropy
  - cross-entropy
  - Kullback-Leibler divergence
  - KL divergence
tags:
  - type/concept
  - domain/mathematics
  - domain/ai
  - domain/machine-learning
created: '2026-07-23'
updated: '2026-07-23'
editorial_status: active
review:
  evidence_coverage: verified
  content_mode: descriptive
artifacts: []
evidence:
  - source_id: shannon-1948
    locator: 'Part I, §6의 entropy 정의와 로그 밑에 따른 단위'
    relation: supports
  - source_id: kullback-leibler-1951
    locator: pp. 79–82의 두 분포를 구별하는 information measure 정의와 성질
    relation: supports
  - source_id: chen-goodman-1998
    locator: §1.1의 cross-entropy와 perplexity 정의
    relation: supports
  - source_id: bengio-et-al-2003-nplm
    locator: 'JMLR 3, pp. 1141–1143의 다음 단어 확률과 log-likelihood 학습'
    relation: contextualizes
relations:
  - target: concept.소프트맥스
    kind: related
learning:
  difficulty:
    entry: intermediate
    target: intermediate
  prerequisites:
    - target: concept.확률
    - target: concept.지수와-로그
  assumed_knowledge: 없음
  outcomes:
    - '한 분포의 평균 정보량, 실제 분포와 모델 분포의 교차 엔트로피·KL 발산, one-hot 정답에서 NLL과의 관계를 작은 분포로 계산하고 구분할 수 있다.'
  next:
    - target: concept.로그-가능도
      reason: 로그가능도 — one-hot 교차 엔트로피가 실제 토큰의 음의 로그가능도와 어떻게 같은 식이 되는지 계산한다.
    - target: concept.perplexity
      reason: Perplexity — 토큰 평균 교차 엔트로피를 왜 다시 지수화해 평가 지표로 쓰는지 이어서 배운다.
---
# 엔트로피·교차 엔트로피·KL 발산

> [!note] 학습 안내
> **난이도:** 중급<br>
> **선수 지식:** [[concept.확률|확률]], [[concept.지수와-로그|지수와 로그]]<br>
> **읽고 나면:** 한 분포의 평균 정보량, 실제 분포와 모델 분포의 교차 엔트로피·KL 발산, one-hot 정답에서 NLL과의 관계를 작은 분포로 계산하고 구분할 수 있다.

## 1단계 — 먼저 잡을 핵심

### 한 분포의 불확실성과 두 분포의 어긋남은 다르다

어떤 토큰이 이미 매우 예측 가능하면 그것을 관측해도 새 정보가 적고, 여러 후보가 비슷하게 가능하면 관측 결과가 더 많은 정보를 준다. **엔트로피**(entropy)는 한 확률분포 안에서 이런 평균 정보량을 나타낸다.

학습에서는 실제 자료가 따르는 분포 $p$와 모델이 낸 분포 $q$를 함께 본다. **교차 엔트로피**(cross-entropy)는 $p$에서 나온 결과를 $q$로 부호화할 때의 평균 로그 벌점이고, **KL 발산**(Kullback–Leibler divergence)은 그 벌점이 $p$ 자신을 쓸 때보다 얼마나 더 큰지를 나타낸다. 셋은 같은 숫자의 다른 이름이 아니다.

### 먼저 알아야 할 기초 개념

유한한 후보 집합 $V$에서 $p=(p_i)_{i\in V}$와 $q=(q_i)_{i\in V}$는 각각 길이 $|V|$의 확률벡터다. 모든 성분은 0 이상이고 각 벡터의 합은 1이다. 이 문서는 $p_i>0$인 후보에서는 $q_i>0$이라고 가정한다. 그렇지 않으면 $\log q_i$가 정의되지 않아 교차 엔트로피와 KL 발산은 유한하지 않다.

로그의 밑이 2이면 정보량의 단위는 bit, 자연로그이면 nat다. 아래 설명용 계산은 bit를 보기 쉽게 $\log_2$로 쓰고, 신경망 손실에서 흔한 자연로그와의 차이는 양의 상수배뿐이라는 점을 뒤에서 설명한다.

### 핵심 아이디어

드문 결과 $i$가 일어났을 때의 정보량을 $I_p(i)=-\log p_i$로 두면, 엔트로피는 이 값을 $p$에 따라 평균 낸 $H(p)$다. 모델 $q$가 실제 결과에 확률을 덜 주면 $-\log q_i$가 커져 교차 엔트로피도 커진다.

## 2단계 — 작동 원리

### 가장 작은 구체적 예

세 후보의 실제 분포를 $p=(1/2,1/4,1/4)$라고 하자. 첫 후보가 나올 정보량은 $-\log_2(1/2)=1$ bit이고, 나머지 두 후보는 각각 2 bit다. 평균 정보량은 다음과 같다.

$$
H(p)
=-\sum_i p_i\log_2p_i
=\frac12\cdot1+\frac14\cdot2+\frac14\cdot2
=1.5\text{ bit}
$$

이제 모델 분포가 $q=(1/2,3/8,1/8)$이라고 하자. 실제 분포 $p$에서 나온 결과를 모델 $q$로 읽는 평균 벌점은 다음이다.

$$
H(p,q)
=-\frac12\log_2\frac12
-\frac14\log_2\frac38
-\frac14\log_2\frac18
\approx1.604\text{ bit}
$$

$q$가 $p$와 다르므로 $H(p,q)$는 $H(p)$보다 약 $0.104$ bit 크다. 그 차이가 $D_{\mathrm{KL}}(p\Vert q)$다.

### 입력에서 출력까지

1. 실제 결과가 따르는 기준 분포 $p$를 정한다.
2. 각 결과가 일어났을 때 필요한 정보량 $-\log p_i$를 계산한다.
3. $p_i$를 가중치로 평균 내어 엔트로피 $H(p)$를 얻는다.
4. 같은 결과를 모델 분포 $q$로 읽을 때는 $-\log q_i$를 평균 내어 교차 엔트로피 $H(p,q)$를 얻는다.
5. 두 평균의 차이로 $q$를 쓴 추가 벌점인 KL 발산을 얻는다.

### one-hot 정답에서는 NLL로 줄어든다

분류 또는 다음 토큰 학습의 한 예에서는 실제 분포를 정답 클래스 $y$에만 1을 둔 one-hot 분포 $p_i=\mathbf1[i=y]$로 볼 수 있다. 이때 엔트로피는 0이고 교차 엔트로피는 한 항만 남는다.

$$
H(p,q)
=-\sum_i\mathbf1[i=y]\log q_i
=-\log q_y
$$

따라서 한 정답에 대한 softmax 교차 엔트로피는 음의 로그가능도와 같은 식이다. 이는 one-hot 정답과 모델의 범주형 확률이라는 조건에서의 동일성이지, 모든 엔트로피·NLL 용어가 언제나 같은 뜻이라는 말은 아니다.

## 3단계 — 기술과 근거

### 정식 용어와 기호

| 기호 | 현재 문서에서의 의미 | 종류·shape | 값의 범위·출처 |
| --- | --- | --- | --- |
| $V$ | 유한한 후보 집합 | 집합, 크기 $q$ | 토큰 어휘 또는 분류 범주 |
| $i$ | 현재 후보를 세는 인덱스 | 정수 | $V$의 원소 |
| $p_i$ | 실제·관측 분포가 후보 $i$에 준 확률 | 스칼라 | $[0,1]$, $\sum_ip_i=1$ |
| $q_i$ | 모델 분포가 후보 $i$에 준 확률 | 스칼라 | $[0,1]$, $\sum_iq_i=1$ |
| $H(p)$ | $p$의 엔트로피 | 스칼라 | 로그 밑에 따른 bit 또는 nat |
| $H(p,q)$ | $p$를 기준으로 $q$를 쓴 교차 엔트로피 | 스칼라 | $p_i>0$이면 $q_i>0$ 필요 |
| $D_{\mathrm{KL}}(p\Vert q)$ | $p$에서 $q$로 바꿨을 때의 추가 평균 로그 벌점 | 스칼라 | 0 이상, 일반적으로 비대칭 |

### 세 수식과 그 관계

$$
H(p)=-\sum_{i\in V}p_i\log p_i,
$$

$$
H(p,q)=-\sum_{i\in V}p_i\log q_i,
$$

$$
D_{\mathrm{KL}}(p\Vert q)
=\sum_{i\in V}p_i\log\frac{p_i}{q_i}
$$

첫 식의 $p_i$는 실제 결과가 $i$일 비중이고, $-\log p_i$는 그 결과의 정보량이다. 둘째 식은 결과를 고르는 비중은 계속 $p_i$로 두되, 모델 $q$가 준 확률의 로그 벌점을 평균 낸다. 셋째 식은 두 로그의 차이를 평균 내어, $q$ 때문에 생긴 추가 벌점을 직접 쓴다.

로그의 나눗셈 규칙 $\log(p_i/q_i)=\log p_i-\log q_i$를 한 항씩 적용하면 다음 관계가 나온다.

$$
\begin{aligned}
D_{\mathrm{KL}}(p\Vert q)
&=\sum_i p_i\log p_i-\sum_i p_i\log q_i\\
&=-H(p)+H(p,q).
\end{aligned}
$$

따라서 $H(p,q)=H(p)+D_{\mathrm{KL}}(p\Vert q)$다. $H(p)$는 $q$를 바꿔도 변하지 않으므로, 고정한 실제 분포 아래 교차 엔트로피를 줄이는 것은 KL 발산을 줄이는 것과 같은 최적화 순서를 가진다.

### 왜 평균과 로그를 쓰는가

평균은 실제로 자주 나오는 결과가 더 큰 영향을 주게 한다. 드문 결과의 큰 벌점도 사라지지 않지만, $p_i$만큼 가중된다. 로그는 확률의 곱을 합으로 바꾸고, 낮은 확률에 큰 벌점을 준다. 이 해석은 prefix code 길이와 연결할 수 있지만, 이 문서의 식만으로 특정 코드가 실제로 최적이라는 역사적·공학적 주장을 하지는 않는다.

### 필연적인 부분과 설계 선택

| 구분 | 현재 문맥에서의 의미 |
| --- | --- |
| 정의 | 엔트로피·교차 엔트로피·KL은 위의 로그 평균 식으로 정의한다. |
| 수학적 귀결 | 공통 지원집합에서 $H(p,q)=H(p)+D_{\mathrm{KL}}(p\Vert q)$가 대수적으로 따른다. |
| 통계적 맥락 | 훈련 표본 평균은 목표 분포 아래 기대 교차 엔트로피의 추정량으로 사용된다. |
| 설계 선택 | one-hot 정답, 토큰 평균, 로그 밑과 label smoothing은 과제·구현에 따라 정한다. |
| 대안 | 정확도·순위 손실·보상 목적은 다른 오류 정의를 쓴다. |

### 성립 조건과 실패하는 경우

$p_i>0$인데 $q_i=0$이면 $\log(p_i/q_i)$와 $-\log q_i$가 유한하지 않아 KL과 교차 엔트로피는 $+\infty$가 된다. softmax는 유한한 로짓에서 양수 확률을 만들지만 수치적 underflow·마스킹·어휘 밖 처리의 실제 구현은 별도로 확인해야 한다.

KL 발산은 거리(metric)가 아니다. 일반적으로 $D_{\mathrm{KL}}(p\Vert q)\ne D_{\mathrm{KL}}(q\Vert p)$이고 삼각부등식을 만족할 필요가 없다. 또한 낮은 교차 엔트로피는 주어진 분포·평가 단위에서의 확률 예측을 뜻할 뿐, 출력의 사실성·안전성·선호를 보장하지 않는다.

## 검증과 한계

### 확인된 사실

Shannon은 확률분포의 평균 정보량을 로그 합으로 정의했고, Kullback과 Leibler는 두 분포를 구별하는 정보 측도를 제시했다. Chen과 Goodman은 언어 모델 평가에서 cross-entropy와 perplexity를 함께 정의했다. 위의 세 후보 계산은 이 자료들의 실험 결과가 아닌 편집부의 설명용 예다.

### 적용 범위와 흔한 오해

- 엔트로피가 크다고 문장이 길거나 내용이 더 중요하다는 뜻은 아니다. 정한 확률분포의 평균 정보량을 말한다.
- KL 발산이 0이면 해당 지원집합에서 분포가 일치하지만, 두 분포를 바꾼 방향의 KL도 같은 값이라는 뜻은 아니다.
- one-hot 교차 엔트로피와 NLL의 일치는 한 정답 범주와 그 모델 확률을 쓴 경우다. 분포형 label·다중 라벨·다른 목적은 따로 확인해야 한다.

## 학습 확인

### 확인 질문과 답

1. $p=(1/2,1/4,1/4)$의 엔트로피가 1.5 bit가 되는 계산을 재현하라.

   **답:** 정보량이 각각 1, 2, 2 bit이고 이를 확률 $1/2,1/4,1/4$로 가중 평균하면 $1.5$ bit다.

2. 교차 엔트로피와 KL 발산의 차이는 무엇인가?

   **답:** 교차 엔트로피는 실제 분포 $p$에서 나온 결과를 모델 $q$로 읽는 전체 평균 벌점이고, KL은 그 값에서 $p$ 자체의 엔트로피를 뺀 추가 벌점이다.

3. $p_i>0$인데 $q_i=0$이면 어떤 문제가 생기는가?

   **답:** $\log q_i$가 유한하지 않아 그 결과의 교차 엔트로피·KL 항이 무한대로 발산한다.

### 다음 문서

- [[concept.로그-가능도|로그가능도]] — one-hot 교차 엔트로피가 실제 토큰의 음의 로그가능도와 어떻게 같은 식이 되는지 계산한다.
- [[concept.perplexity|Perplexity]] — 토큰 평균 교차 엔트로피를 왜 다시 지수화해 평가 지표로 쓰는지 이어서 배운다.

## 출처

- Claude E. Shannon, [A Mathematical Theory of Communication](https://people.math.harvard.edu/~ctm/home/text/others/shannon/entropy/entropy.pdf), 1948, Part I §6.
- Solomon Kullback·Richard A. Leibler, [On Information and Sufficiency](https://projecteuclid.org/journals/annals-of-mathematical-statistics/volume-22/issue-1/On-Informationand-Sufficiency/10.1214/aoms/1177729694.full), 1951, pp. 79–82.
- Stanley F. Chen·Joshua Goodman, [An Empirical Study of Smoothing Techniques for Language Modeling](https://dash.harvard.edu/handle/1/25104739), 1998, §1.1.
- Yoshua Bengio 외, [A Neural Probabilistic Language Model](https://www.jmlr.org/papers/v3/bengio03a.html), 2003, pp. 1141–1143.

## 관련 항목

- [[concept.로그-가능도|로그가능도]]
- [[concept.perplexity|Perplexity]]
- [[concept.확률|확률]]
- [[concept.지수와-로그|지수와 로그]]
- [[concept.소프트맥스|소프트맥스]]
