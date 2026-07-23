---
schema_version: 2
id: concept.표본추출-온도-top-k-top-p
page_type: concept
title: 표본추출·온도·top-k·top-p
aliases:
  - sampling and temperature
  - top-k sampling
  - nucleus sampling
  - top-p sampling
tags:
  - type/concept
  - domain/mathematics
  - domain/machine-learning
  - domain/nlp
created: '2026-07-24'
updated: '2026-07-24'
lifecycle: active
verification: verified
artifacts: []
evidence:
  - source_id: bengio-et-al-2003-nplm
    locator: 'JMLR 3, pp. 1141–1143, Eq. (1)의 다음 단어 조건부 확률과 정규화된 출력 분포'
    relation: contextualizes
  - source_id: holtzman-et-al-2020-neural-text-degeneration
    locator: '초록, §§2–4와 Figures 1–4의 likelihood decoding 비교, top-$k$와 dynamic nucleus(top-$p$) 후보 집합'
    relation: supports
related:
  - concept.확률
  - concept.소프트맥스
  - concept.자기회귀-생성
  - concept.대규모-언어-모델
---
# 표본추출·온도·top-k·top-p

> [!note] 학습 안내
> **난이도:** 중급<br>
> **선수 지식:** [[확률]]의 확률분포, [[소프트맥스]]의 로짓 정규화와 후보 축<br>
> **읽고 나면:** 온도 변환, top-$k$·top-$p$ 후보 절단, 그 뒤의 무작위 표본추출을 argmax와 구분하고, 같은 모델에서도 생성 규칙이 결과와 평가 조건을 바꾸는 이유를 설명할 수 있다.

## 1단계 — 먼저 잡을 핵심

### 모델의 분포와 생성 규칙은 다르다

자기회귀 모델은 문맥 $c$에서 다음 token 후보 $i\in\{1,\ldots,q\}$의 로짓 $z_i$를 만들고 softmax로 분포 $p$를 만든다.

$$
p_i=\frac{\exp(z_i)}{\sum_{j=1}^{q}\exp(z_j)}.
$$

이 분포를 만든 사실만으로 어떤 token을 출력할지는 정해지지 않는다. argmax는 가장 큰 $p_i$ 하나를 항상 택한다. sampling은 확률분포에서 난수를 한 번 뽑는다. 온도와 top-$k$·top-$p$는 sampling 전에 분포나 후보 집합을 바꾸는 decoding 규칙이다. 이들은 모델 weight를 다시 학습하거나, 모델의 factuality·안전성을 보장하는 장치가 아니다.

### 세 규칙의 역할

| 규칙 | 먼저 바꾸는 것 | 그 뒤 출력 |
| --- | --- | --- |
| 온도 $T$ | 모든 후보 로짓의 상대적 날카로움 | 변환한 분포에서 표본화 또는 argmax |
| top-$k$ | 확률이 큰 $k$개 후보만 남기는 지원집합 | 남은 확률을 재정규화해 표본화 |
| top-$p$ | 누적 확률이 임계값 $p$에 도달하는 최소 후보 집합 | 남은 확률을 재정규화해 표본화 |
| argmax | 분포를 표본화하지 않음 | 최댓값 후보 하나를 결정적으로 선택 |

여기서 top-$k$의 $k$는 생성 후보 수다. [[전문가 혼합]]의 top-$k$ routing처럼 expert 실행 경로를 고르는 $k$와는 목적·대상이 다르다.

## 2단계 — 작동 원리

### 가장 작은 온도 예

로짓이 $z=(0,1,2)$인 세 후보를 생각하자. 양의 온도 $T$는

$$
p_i^{(T)}=
\frac{\exp(z_i/T)}{\sum_{j=1}^{q}\exp(z_j/T)},
\qquad T>0
$$

로 정의한다. $T=1$이면 원래 softmax이고, $T=2$는 차이를 완만하게, $T=0.5$는 더 날카롭게 만든다.

| 온도 | 변환 뒤 확률 $(p_1,p_2,p_3)$ | 해석 |
| --- | --- | --- |
| $T=0.5$ | $(0.0159,0.1173,0.8668)$ | 최고 로짓에 더 집중 |
| $T=1$ | $(0.0900,0.2447,0.6652)$ | 원 분포 |
| $T=2$ | $(0.1863,0.3072,0.5065)$ | 후보들이 더 고르게 경쟁 |

$T\to0^+$일 때 가장 큰 로짓에 질량이 모이는 극한은 생각할 수 있지만, 식에 $T=0$을 대입할 수는 없다. 동률, finite precision, API가 허용하는 범위도 실제 구현이 정하는 경계다.

### top-$k$와 top-$p$를 손으로 재정규화하기

$T=1$의 확률을 큰 순서로 쓰면 후보 3은 $0.6652$, 후보 2는 $0.2447$, 후보 1은 $0.0900$이다. top-$k$에서 $k=2$이면 후보 3과 2만 남고

$$
\tilde p=(0,\;0.2689,\;0.7311)
$$

이 된다. 원래의 두 확률을 $0.2447+0.6652$로 나누어 합을 다시 1로 만든 값이다.

top-$p$에서 $p=0.8$이면 가장 큰 후보 하나의 누적 질량 $0.6652$는 부족하므로, 다음 후보까지 포함한다. 누적 질량은 약 $0.9099$이고 같은 두 후보 집합을 얻는다. 그러나 top-$p$는 확률이 얼마나 한쪽에 몰렸는지에 따라 후보 수가 바뀐다. $p$의 정의는 보통 정렬한 후보 중 누적 질량이 임계값을 넘는 **최소** 집합이므로, 동률·임계점 포함 규칙은 구현 문서에 밝혀야 한다.

### 표본화는 마지막 단계다

온도와 절단을 모두 적용한 뒤의 유효 분포를 $\tilde p$라 하자. 난수 $u\in[0,1)$를 뽑아 누적합 구간에 대응하는 token을 선택하면 $P(Y=i)=\tilde p_i$가 된다. 같은 seed·같은 kernel·같은 순서가 아니면 서로 다른 표본이 나올 수 있다. 반대로 argmax는 $\arg\max_i\tilde p_i$ 하나를 선택하므로 난수 표본화가 아니다.

## 3단계 — 기술과 근거

### 기호와 적용 축

| 기호 | 현재 식의 역할 | shape·범위 | 주의할 점 |
| --- | --- | --- | --- |
| $z$ | 다음 token 로짓 | 길이 $q$ 실수 벡터 | 현재 $(b,t)$의 어휘 축에서만 변환 |
| $q$ | 후보 token 수 | 양의 정수 | 보통 tokenizer 어휘 크기 |
| $T$ | 온도 | 양의 실수 | 0이나 음수는 위 식의 허용 범위 밖 |
| $k$ | top-$k$ 후보 수 | $1\le k\le q$ 정수 | candidate count이지 MoE expert 수가 아님 |
| $p$ | top-$p$ 누적 질량 임계값 | 보통 $0<p\le1$ | 표기 $p_i$와 구분해 문맥을 밝혀야 함 |
| $\tilde p$ | 재정규화 뒤 분포 | 합이 1인 길이 $q$ 벡터 | 제외 후보의 질량은 0 |

decoder 로짓 shape가 $(B,T,V)$이면 generation에서는 현재 위치의 $V$ 축에 각 batch 항목별로 온도·절단을 적용한다. 과거 모든 위치나 batch 전체를 한 확률분포처럼 함께 재정규화하면 모델이 정의한 조건부 분포가 바뀐다.

### decoding 목적과 평가를 섞지 않는다

[[자기회귀 생성]]이 맡는 질문은 “앞 token을 조건으로 다음 확률분포를 곱해 sequence를 생성하는가”이다. 여기서는 그 분포에서 **어떤 규칙으로 token을 선택하는가**를 맡는다. [[대규모 언어 모델]]의 다음-token 학습 손실과 decoding은 같은 로짓을 사용할 수 있지만, training objective와 inference policy는 별도 선택이다.

Holtzman 등은 likelihood를 가장 크게 만드는 decoding이 반복·퇴화된 텍스트를 만들 수 있는 사례를 분석하며, 고정 $k$보다 문맥별 분포의 꼬리에 맞춰 후보 수가 달라지는 nucleus sampling을 제안했다. 이는 특정 데이터·모델·사람 평가 조건의 실험 결과이지, top-$p$가 모든 프롬프트에서 가장 사실적·안전하다는 보장은 아니다.

### 필연적인 부분과 설계 선택

| 구분 | 현재 문맥에서의 의미 |
| --- | --- |
| 수학적 귀결 | $T>0$에서 $z/T$의 softmax는 합이 1인 분포이고, 절단 뒤 양의 질량을 재정규화하면 다시 분포가 된다. |
| decoding 선택 | $T,k,p$, seed, repetition penalty, beam 사용 여부와 최대 길이를 정한다. |
| 구현 선택 | 동률 순서, threshold 포함, 최소 후보 수, special token·mask 처리와 sampling kernel을 정한다. |
| 해결하지 않는 것 | 분포를 넓히거나 좁혀도 잘못 학습한 지식, prompt ambiguity, 독성·개인정보 위험을 판별하지 않는다. |

## 검증과 한계

- 낮은 온도와 작은 후보 집합은 출력 변동성을 줄일 수 있지만, 모델이 확신하는 오류도 더 일관되게 선택할 수 있다.
- 높은 온도는 다양한 후보를 허용하지만 문법·사실성·형식 제약을 보장하지 않는다.
- top-$p$의 실제 후보 수는 분포 모양, 동률과 threshold 관례에 따라 달라진다. API 이름만 같아도 세부 구현과 기본값이 다를 수 있다.
- 사람의 선호·안전·정확성 평가는 decoding parameter 외에 prompt, 모델, 도구 사용, post-processing과 평가 지침에 의존한다.

## 학습 확인

### 확인 질문과 답

1. $z=(0,1,2)$에서 $T=2$가 $T=1$보다 분포를 평평하게 만드는 이유는 무엇인가?

   **답:** 로짓 차이를 2로 나누어 지수비의 차이를 줄이므로, 가장 큰 후보의 질량 일부가 다른 후보로 옮겨 간다.

2. 예의 top-$k=2$ 뒤 두 남은 확률을 왜 다시 나누는가?

   **답:** 제외한 후보의 질량을 0으로 두면 남은 질량의 합이 1보다 작으므로, 표본을 뽑을 확률분포가 되도록 합을 1로 복원해야 한다.

3. argmax와 sampling의 결정적 차이는 무엇인가?

   **답:** argmax는 최대 확률 후보 하나를 항상 고르고, sampling은 유효 분포의 확률에 따라 난수로 후보를 뽑는다.

### 다음 문서

- [[자기회귀 생성]] — 조건부 확률분포가 sequence 전체의 생성으로 이어지는 방식을 본다.
- [[대규모 언어 모델]] — 다음-token 확률을 학습하는 목적과 실제 생성 단계를 구분해 본다.

## 출처

- Yoshua Bengio 외, [A Neural Probabilistic Language Model](https://www.jmlr.org/papers/v3/bengio03a.html), *JMLR* 3, 2003, pp. 1141–1143.
- Ari Holtzman 외, [The Curious Case of Neural Text Degeneration](https://arxiv.org/abs/1904.09751), ICLR 2020, §§2–4.

## 관련 항목

- [[확률]]
- [[소프트맥스]]
- [[자기회귀 생성]]
- [[대규모 언어 모델]]
