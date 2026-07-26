---
schema_version: 3
id: concept.수치-안정성과-log-sum-exp
page_type: concept
title: 수치 안정성과 log-sum-exp
aliases:
  - numerical stability and log-sum-exp
  - LogSumExp
  - LSE
  - stable softmax
tags:
  - type/concept
  - domain/mathematics
  - domain/ai
  - domain/machine-learning
created: '2026-07-24'
updated: '2026-07-24'
editorial_status: active
review:
  evidence_coverage: verified
  content_mode: descriptive
artifacts: []
evidence:
  - source_id: blanchard-higham-higham-2021-logsumexp-softmax
    locator: '§§1–4, 특히 shifted log-sum-exp·softmax 식과 rounding-error 분석·Algorithm 4.1'
    relation: supports
  - source_id: dao-et-al-2022-flashattention
    locator: '§§2.2–3.1과 Algorithms 0–1의 online softmax 상태 $m,\ell$와 block 재스케일'
    relation: supports
  - source_id: bengio-et-al-2003-nplm
    locator: 'JMLR 3, pp. 1141–1143, Eq. (1)의 exponentiated output과 확률 정규화'
    relation: contextualizes
relations: []
learning:
  difficulty:
    entry: intermediate
    target: intermediate
  prerequisites:
    - target: concept.지수와-로그
    - target: concept.소프트맥스
  assumed_knowledge: 의 $\exp$ $\log$ 의 후보 축 정규화
  outcomes:
    - 'log-sum-exp와 stable softmax를 최댓값 이동으로 계산하고, 실수 수학에서 같은 식이라는 사실과 부동소수점에서 필요한 공학적 선택이라는 사실을 구분하며, FlashAttention의 online softmax 상태가 왜 필요한지 설명할 수 있다.'
  next:
    - target: concept.flashattention
      reason: FlashAttention — blockwise online softmax를 SRAM tile·I/O·backward 재계산과 함께 적용하는 알고리즘을 본다.
---
# 수치 안정성과 log-sum-exp

> [!note] 학습 안내
> **난이도:** 중급<br>
> **선수 지식:** [[concept.지수와-로그|지수와 로그]], [[concept.소프트맥스|소프트맥스]]<br>
> **읽고 나면:** log-sum-exp와 stable softmax를 최댓값 이동으로 계산하고, 실수 수학에서 같은 식이라는 사실과 부동소수점에서 필요한 공학적 선택이라는 사실을 구분하며, FlashAttention의 online softmax 상태가 왜 필요한지 설명할 수 있다.

## 1단계 — 먼저 잡을 핵심

### 같은 수식도 컴퓨터에서는 다른 경로가 필요하다

실수 수학에서 $\exp(1000)$은 양의 유한한 수다. 하지만 제한된 범위의 부동소수점 형식에서는 그 값을 저장하지 못해 overflow가 날 수 있다. 반대로 아주 작은 지수값은 0으로 반올림되는 underflow가 날 수 있다. 따라서 수학적으로는 올바른 softmax 식도 계산 순서에 따라 `inf`, `0`, `NaN`을 만들 수 있다.

**log-sum-exp**는 로짓 벡터 $z$의 지수값 합에 로그를 취한 함수다.

$$
\operatorname{LSE}(z)=\log\sum_{j=1}^{q}\exp(z_j),
\qquad z\in\mathbb R^q
$$

여기서 $q$는 후보 수이고 $z_j$는 $j$번째 로짓이다. LSE는 [[소프트맥스]]의 분모와 음의 로그가능도에 들어간다. 수치 안정성의 목표는 수학적 함수를 다른 근사로 바꾸는 것이 아니라, 같은 함수를 현재 dtype의 표현 범위에서 최대한 믿을 수 있게 계산하는 것이다.

### 최댓값을 빼는 핵심

벡터의 최댓값 $m=\max_jz_j$를 모든 성분에서 빼면 가장 큰 지수는 $\exp(0)=1$이 된다. 실수 수학에서는 다음 항등식이 정확히 성립한다.

$$
\operatorname{LSE}(z)
=m+\log\sum_{j=1}^{q}\exp(z_j-m)
$$

마찬가지로 stable softmax는

$$
p_i=
\frac{\exp(z_i-m)}{\sum_{j=1}^{q}\exp(z_j-m)}
$$

로 계산해도 원래 softmax와 같다. $m$을 뺀 것은 모델의 상대 점수나 확률을 바꾸는 보정이 아니라, 분자·분모에 있던 공통 인자 $\exp(-m)$를 계산 전에 약분한 것이다.

## 2단계 — 작동 원리

### 가장 작은 구체적 예

세 로짓을 $z=(1000,999,997)$로 두자. 직접 $\exp(1000)+\exp(999)+\exp(997)$를 만들려 하면 흔한 부동소수점 형식의 범위를 넘어설 수 있다. 먼저 $m=1000$을 빼면

$$
z-m=(0,-1,-3)
$$

이고, 지수합은 안전한 크기의 수가 된다.

$$
s=\exp(0)+\exp(-1)+\exp(-3)
\approx1+0.367879+0.049787
=1.417667
$$

따라서

$$
\operatorname{LSE}(z)
=1000+\log(1.417667)
\approx1000.349012,
$$

$$
\operatorname{softmax}(z)
\approx(0.705385,\;0.259496,\;0.035119)
$$

모든 확률은 양수이고 반올림 전 합은 1이다. 중요한 점은 $1000$을 빼서 첫 번째 후보의 확률을 높인 것이 아니라, 세 후보에서 **같은 상수**를 빼어 계산을 가능하게 했다는 것이다.

### 항등식이 되는 과정

$m$이 유한한 실수일 때 지수 법칙으로

$$
\sum_j\exp(z_j)
=\exp(m)\sum_j\exp(z_j-m)
$$

가 된다. 양변에 로그를 취하면 $\log\exp(m)=m$이므로 위 LSE 식을 얻는다. softmax도 같은 전개를 분자와 분모에 적용한다.

$$
\frac{\exp(z_i)}{\sum_j\exp(z_j)}
=\frac{\exp(m)\exp(z_i-m)}
{\exp(m)\sum_j\exp(z_j-m)}
$$

$\exp(m)>0$이므로 공통 인자를 약분할 수 있다. 이 증명은 실수 연산의 항등식이다. 실제 부동소수점 결과가 bitwise로 같다는 보장은 없지만, 큰 양수의 overflow를 피하고 harmful underflow 가능성을 줄이는 이유가 된다.

## 3단계 — 기술과 근거

### log-softmax와 손실을 바로 계산하기

정답 인덱스가 $y$일 때 $\log p_y$를 먼저 $p_y$로 만들고 다시 로그로 계산할 필요가 없다.

$$
\log p_i
=(z_i-m)-\log\sum_j\exp(z_j-m),
$$

$$
-\log p_y
=-(z_y-m)+\log\sum_j\exp(z_j-m)
$$

두 식의 모든 $z_j-m$은 0 이하이므로 최대 지수값은 1이다. $m$은 후보 축마다 따로 계산해야 한다. 예를 들어 shape가 $(B,T,V)$인 decoder 로짓에서는 batch $B$, 위치 $T$, 어휘 $V$ 중 **어휘 축 $V$**를 따라 각 $(b,t)$마다 $m_{b,t}=\max_vz_{b,t,v}$를 구한다. batch 전체 또는 문장 전체의 단일 최댓값을 빼면 확률 축의 정의가 달라진다.

| 기호 | 현재 식에서의 의미 | 종류·shape | 값의 범위·출처 |
| --- | --- | --- | --- |
| $z$ | 정규화 전 로짓 | 길이 $q$ 실수 벡터 | 모델 출력 |
| $q$ | 현재 softmax 후보 수 | 양의 정수 | 어휘·head 위치 등 설계 |
| $m$ | 현재 후보 축의 최댓값 | 실수 스칼라 | $\max_j z_j$ |
| $s$ | 이동한 지수값의 합 | 양의 실수 스칼라 | $\sum_j\exp(z_j-m)$ |
| $\operatorname{LSE}(z)$ | 지수합의 로그 | 실수 스칼라 | $m+\log s$ |
| $p_i$ | 후보 $i$의 softmax 확률 | $(0,1)$의 스칼라 | 이동한 분자·분모의 비 |
| $i,j$ | 현재 후보와 합을 위한 인덱스 | $\{1,\ldots,q\}$ | 후보 축 |

### block을 합치는 online softmax

긴 후보 축을 한 번에 메모리에 올리지 못하면 두 block의 상태를 합칠 수 있다. block $A,B$마다

$$
m_A=\max_{j\in A}z_j,
\quad
\ell_A=\sum_{j\in A}\exp(z_j-m_A)
$$

와 같은 상태를 저장하고 $m=\max(m_A,m_B)$로 둔다. 전체 합을 새 기준에 맞춰 합치면

$$
\ell
=\exp(m_A-m)\ell_A+\exp(m_B-m)\ell_B
$$

그러면 전체 LSE는 $m+\log\ell$이다. 새 최댓값이 생기면 이전 block의 합도 새 기준으로 재스케일해야 한다. [[FlashAttention]]은 이 원리를 query 행과 key/value tile에 적용해, 전체 attention probability matrix를 저장하지 않고도 동일한 softmax 정의를 누적한다. 여기서 owner는 안정적인 합치기 식까지이고, GPU tile schedule·I/O 복잡도·backward 재계산은 FlashAttention 문서가 맡는다.

### 필요한 안정화와 해결하지 못하는 문제

| 상황 | 안정적 계산의 역할 | 남는 경계 |
| --- | --- | --- |
| 큰 양의 로짓 | max shift로 $\exp$ overflow를 피한다 | 입력 자체가 `inf`·`NaN`이면 별도 처리 필요 |
| 매우 작은 상대 로짓 | 최댓값 기준의 작은 지수로 계산한다 | dtype에서 0으로 underflow하면 수학적으로 양수인 작은 질량이 사라질 수 있음 |
| 모든 위치가 mask됨 | 구현이 유효한 row인지 검사해야 한다 | $\max(-\infty,\ldots,-\infty)$와 $-\infty-(-\infty)$는 정의된 확률분포가 아님 |
| 확률의 로그 | log-softmax를 직접 계산해 0을 만든 뒤 로그를 취하지 않는다 | 정답 후보가 지원집합에서 제외된 모델의 의미 문제는 해결하지 않음 |
| 반올림 | 안정한 순서가 오차를 줄인다 | 정확한 실수값 또는 하드웨어 간 bitwise 동일성을 보장하지 않음 |

### 필연적인 부분과 설계 선택

| 구분 | 현재 문맥에서의 의미 |
| --- | --- |
| 수학적 귀결 | 같은 상수의 이동은 실수 산술에서 LSE와 softmax 값을 바꾸지 않는다. |
| 구현 선택 | 보통 $m=\max z$를 택해 이동한 최댓값을 0으로 둔다. |
| 구현 선택 | 후보 축, dtype, accumulation precision, mask 표현과 fuse 여부를 정한다. |
| 대안 | pairwise reduction, compensated summation, blockwise online accumulation은 규모·하드웨어에 따라 오차와 I/O를 다르게 맞춘다. |
| 해결하지 않는 것 | 안정한 softmax는 잘못된 확률모형, 보정 오류, 긴 문맥의 의미 손실을 고치지 않는다. |

## 검증과 한계

### 적용 범위

- $m=\max z$ 이동은 실수에서 정확한 항등식이지만, finite precision에서는 overflow와 underflow 위험을 **줄이는** 방법이다. 모든 극단 입력에서 무오류를 보장하는 선언이 아니다.
- max shift 뒤에도 서로 매우 가까운 수의 합, 낮은 정밀도 누적, 긴 reduction 순서에서 반올림 오차가 남는다.
- `epsilon`을 더하는 안정화는 분모 0이나 제곱근 경계를 다루는 다른 식에서 쓰일 수 있지만, softmax의 mask semantics나 잘못된 row를 자동으로 정의하지 않는다.
- FlashAttention의 online 상태는 수학적 softmax를 보존하는 실행 방법이다. 그것이 attention의 $O(N^2d)$ 산술 비용이나 모든 모델의 메모리 문제를 없앤다는 뜻은 아니다.

## 학습 확인

### 확인 질문과 답

1. $z=(1000,999,997)$에서 max shift 뒤 지수에 넣는 세 수는 무엇인가?

   **답:** $m=1000$이므로 $(0,-1,-3)$이다. 가장 큰 지수값이 1이 되어 overflow 위험을 줄인다.

2. 같은 $m$을 모든 로짓에서 빼도 softmax가 바뀌지 않는 이유는 무엇인가?

   **답:** 모든 분자와 분모에 공통 양수 인자 $\exp(-m)$가 생겨 약분되기 때문이다.

3. 모든 attention 위치가 mask된 row를 max shift만으로 처리할 수 없는 이유는 무엇인가?

   **답:** 유한한 후보가 없어 최대값과 분모가 정상 확률분포를 정의하지 않으므로, 구현이 유효 row 여부와 출력 규칙을 별도로 정해야 한다.

### 다음 문서

- [[concept.flashattention|FlashAttention]] — blockwise online softmax를 SRAM tile·I/O·backward 재계산과 함께 적용하는 알고리즘을 본다.

## 출처

- Pierre Blanchard·Desmond J. Higham·Nicholas J. Higham, [Accurately Computing the Log-Sum-Exp and Softmax Functions](https://academic.oup.com/imajna/article/41/4/2311/5893596), *IMA Journal of Numerical Analysis* 41(4), 2021, §§1–4와 Algorithm 4.1.
- Tri Dao 외, [FlashAttention: Fast and Memory-Efficient Exact Attention with IO-Awareness](https://proceedings.neurips.cc/paper_files/paper/2022/hash/67d57c32e20fd0a7a302cb81d36e40d5-Abstract.html), 2022, §§2.2–3.1과 Algorithms 0–1.
- Yoshua Bengio 외, [A Neural Probabilistic Language Model](https://www.jmlr.org/papers/v3/bengio03a.html), 2003, pp. 1141–1143.

## 관련 항목

- [[concept.flashattention|FlashAttention]]
- [[concept.지수와-로그|지수와 로그]]
- [[concept.소프트맥스|소프트맥스]]
