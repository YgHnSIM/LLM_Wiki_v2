---
schema_version: 2
id: source.001
page_type: source
title: 섀넌의 N-gram 모델
aliases:
  - Shannon's N-gram Model
  - Shannon N-gram
  - 1948 N-gram
tags:
  - type/source
  - domain/ai
  - domain/nlp
created: '2026-05-07'
updated: '2026-07-23'
lifecycle: active
verification: verified
artifacts:
  - >-
    raw/001_Shannon's N-gram Model - The Foundation of Statistical Language
    Processing..md
  - >-
    raw/001_Shannon's N-gram Model - The Foundation of Statistical Language
    Processing.commentary.md
evidence:
  - source_id: shannon-1948
    locator: 'Part I, §§2–3 and §6'
    relation: supports
  - source_id: katz-1987
    locator: pp. 400–401
    relation: supplements
  - source_id: chen-goodman-1998
    locator: chapters 2–4
    relation: supplements
related:
  - concept.확률
  - concept.n-gram-모델
  - concept.마르코프-가정
  - concept.조건부-확률
  - concept.데이터-희소성
  - concept.smoothing
  - concept.perplexity
  - entity.클로드-섀넌
  - entity.안드레이-마르코프
  - entity.슬라바-카츠
  - analysis.n-gram에서-llm으로
  - meta.overview
  - meta.index
---
# 섀넌의 N-gram 모델

> [!note] 학습 안내
> **난이도:** 입문<br>
> **선수 지식:** [[확률]]에서 여러 후보의 확률 합이 1이라는 뜻, [[조건부 확률]]에서 문맥이 주어졌을 때 확률을 다시 계산한다는 뜻<br>
> **읽고 나면:** 섀넌이 영어의 예측 가능성을 어떤 순서의 근사로 보였는지, 이 작업이 현대 n-gram과 어디까지 이어지는지 설명할 수 있다.

## 1단계 — 먼저 잡을 핵심

### 핵심 요약

[[클로드 섀넌]]의 1948년 논문 「A Mathematical Theory of Communication」은 **기호열의 불확실성과 예측 가능성을 확률로 측정하는 문제**를 다뤘다. 영어를 사례로 문자를 제멋대로 뽑을 때와 앞선 문자·단어를 참고해 뽑을 때 생성 결과가 어떻게 달라지는지 비교했다.

핵심 아이디어는 간단하다. “q” 다음에 “u”가 자주 오는 것처럼, 언어에는 다음 항목을 덜 불확실하게 만드는 반복 패턴이 있다. 앞선 항목을 조건으로 삼을수록 무작위 문자열이 실제 영어와 비슷해지는 모습을 통해 이 제약을 눈으로 확인할 수 있었다.

이 실험은 연속된 n개 언어 단위의 빈도로 다음 항목을 예측하는 후대 [[N-gram 모델]]의 선구적 문제 틀로 읽을 수 있다. 다만 섀넌이 오늘날의 n-gram 용어, 관측·미관측 확률을 조정하는 평활화(smoothing) 알고리즘, 평가 관행까지 한 논문에서 완성한 것은 아니다.

N-gram은 오랫동안 음성 인식·입력 예측·기계 번역의 실용적 구성 요소와 기준선으로 사용됐다. 제한된 문맥의 빈도만 사용하므로 계산과 해석은 쉽지만 장거리 구조와 의미를 직접 표현하지는 못한다.

### 먼저 알아야 할 기초 개념

- **확률분포:** 가능한 다음 문자나 단어마다 확률을 준 목록이며, 같은 문맥에서 그 값들의 합은 1이다.
- **조건부 확률 $P(w\mid h)$:** 문맥 $h$가 이미 주어졌을 때 다음 항목 $w$가 나올 확률이다. 세로막대는 “$h$가 주어졌을 때”라고 읽는다.
- **문맥:** 다음 항목을 예측할 때 참고하는 앞선 문자·단어다. digram은 앞의 한 단위, trigram은 앞의 두 단위를 문맥으로 쓴다.
- **역사적 범위:** 이 문서는 Shannon의 1948년 연구를 설명한다. 아래의 현대 빈도 식과 smoothing은 후대의 명시적 정식화이므로 원 논문에 그대로 있었던 표기나 알고리즘으로 읽지 않는다.

### 주요 인사이트

이 자료를 읽을 때는 세 층을 구분한다. 첫째, Shannon이 직접 실험한 확률적 연속 근사와 후대의 n-gram 용어를 나눈다. 둘째, 짧은 문맥의 계산 가능성과 장거리 정보 손실을 함께 본다. 셋째, n-gram과 대규모 언어 모델(Large Language Model, LLM)이 공유하는 예측 과업과 서로 다른 표현 방식을 구분한다.

### 핵심 문장

- Shannon은 자연어의 통계적 제약을 통신원 모델 안에서 다뤘고, 후대 n-gram 언어 모델이 발전할 수 있는 문제 틀을 제공했다.
- n-gram의 smoothing과 현대적 평가 체계는 Shannon의 원 논문과 구분해야 한다.
- LLM과 n-gram의 관계는 직접 계승보다 공통된 예측 과업을 중심으로 설명하는 편이 정확하다.

## 2단계 — 작동 원리

### 문제에서 근사 결과까지

1. **문제:** 통신원이 다음 기호를 얼마나 예측 가능하게 만드는지 수량화한다.
2. **출발점:** 문자들이 서로 무관하다고 보고 독립적으로 뽑는다.
3. **문맥 추가:** 앞선 한두 문자 또는 단어에 따라 다음 항목의 분포를 바꾼다.
4. **비교:** 독립 근사보다 digram·trigram·단어 수준 근사에서 영어다운 철자와 어구가 더 자주 나타나는지 살핀다.
5. **결과:** 언어의 통계적 제약을 조건부확률과 엔트로피의 문제로 다룰 수 있음을 보인다.

후대의 [[N-gram 모델]]은 이 직관을 명시적인 빈도표로 구현한다. 연속된 n개 언어 단위를 세고, 앞의 n-1개를 문맥으로 삼아 다음 항목의 [[조건부 확률]]을 추정한다. 전체 과거 대신 짧은 문맥을 쓰는 근사는 [[마르코프 가정]]으로 설명할 수 있다.

### 문맥을 늘릴 때 생기는 문제

n이 커질수록 더 구체적인 문맥을 구분하지만 가능한 조합 수가 급격히 늘어난다. 실제 말뭉치에서 보지 못한 조합이 많아지는 [[데이터 희소성]] 때문에 단순 빈도 추정은 쉽게 0 확률을 만든다. 후대의 [[Smoothing]], back-off, 보간법은 관측된 조합의 확률을 조정해 미관측 조합에도 확률을 배분했다.

## 3단계 — 기술과 근거

### 원 논문이 실제로 제시한 범위

Part I §§2–3은 이산 통신원과 엔트로피를 정의하고, §6은 영어의 문자·단어 통계를 이용한 여러 차수의 근사를 제시한다. 다음 항목의 불확실성을 줄이는 앞 문맥의 역할을 보여 주지만, 오늘날의 표준 n-gram 학습 파이프라인이나 대규모 말뭉치 성능 비교를 보고한 연구는 아니다.

후대 빈도 모델의 기본 추정은 문맥 $h$ 뒤에 항목 $w$가 나온 횟수를 같은 문맥의 전체 횟수로 나누는 형태다. $C(\cdot)$는 괄호 안 연속열이 말뭉치에 나타난 횟수를 뜻한다.

$$
P(w\mid h)=\frac{C(h,w)}{C(h)}
$$

#### 수식이 답하려는 질문

이 식은 “이미 문맥 $h$를 보았을 때 다음 항목 $w$에 얼마의 확률을 줄 것인가?”를 묻는다. $C(h,w)$는 그 특정 연결을 센 **분자**이고, $C(h)$는 같은 문맥 뒤에 어떤 항목이든 이어진 횟수를 센 **분모**다. 둘 모두 횟수이므로, 나눈 결과는 문맥 안에서의 비율이 된다.

#### 왜 분모가 필요한가

후보 어휘를 $V$라 하고 그 안의 임시 후보를 $v$라 쓰면, $C(h)=\sum_{v\in V}C(h,v)$다. 그러므로 $C(h)>0$일 때

$$
\sum_{v\in V}P(v\mid h)
=\sum_{v\in V}\frac{C(h,v)}{C(h)}
=1
$$

즉 분모는 단지 큰 수를 작게 만드는 장치가 아니라, 같은 문맥의 후보 확률을 하나의 확률분포로 정규화하는 전체 횟수다. 상대 빈도를 최대우도 추정으로 정당화하는 가정, 각 항의 숫자 예, 미분을 포함한 유도는 [[N-gram 모델]]에서 별도로 계산한다.

#### 적용 조건과 실패 지점

$C(h)>0$인 관측 문맥에서 $C(h,w)=0$이면 단순 최대우도 확률은 0이 된다. 문맥 자체도 보지 못해 $C(h)=0$이면 비율은 $0/0$이라 정의할 수 없다. Katz의 1987년 back-off는 저빈도 관측값을 할인하고 미관측 사건이나 이력에서 짧은 문맥으로 후퇴했다. Chen·Goodman의 1998년 연구는 관측·미관측 확률을 조정하는 여러 평활화(smoothing) 기법을 조건별로 비교했다. 두 연구는 Shannon의 논문을 보완하는 후대 근거이지 그의 원 업적에 포함되지 않는다.

### 평가와 현대 모델의 연결

[[Perplexity]]는 실제 토큰열에 부여한 평균 로그확률을 지수화한 지표이며 엔트로피와 수학적으로 연결된다. 그러나 오늘날의 표준 평가 관행은 후대 언어 모델 연구에서 정착했다.

현대 [[대규모 언어 모델]]도 문맥에서 다음 토큰 분포를 예측할 수 있다. 차이는 고정 길이 표면 빈도표 대신 학습된 벡터 표현과 깊은 신경망으로 더 긴 문맥을 처리한다는 데 있다. 공통된 예측 문제와 서로 다른 계산 구조를 함께 봐야 한다.

## 검증과 한계

- **확인된 사실:** Shannon은 영어를 확률적 통신원의 사례로 다루고 독립 문자·digram·trigram·단어 수준 근사를 제시했다.
- **프로젝트 해석:** 이 근사들을 후대 n-gram 언어 모델의 선구적 형태로 읽는다.
- **후대 발전:** 현대적 n-gram 용어, Katz back-off, Kneser–Ney, 체계적 smoothing 비교와 표준 perplexity 평가는 1948년 이후의 연구다.
- **흔한 과장:** 제한된 문맥의 빈도 모델이 의미나 장거리 구조를 직접 표현한다고 보지 않는다.
- **계보의 한계:** LLM과 n-gram은 조건부 예측 과업을 일부 공유하지만, LLM을 n-gram의 단순 확장이나 직접적인 단일 후손으로 단정하지 않는다.

## 학습 확인

1. 독립 문자 근사보다 digram·trigram 근사가 영어와 비슷해지는 이유는 무엇인가?
2. n을 키우면 문맥 정보와 데이터 희소성은 각각 어떻게 변하는가?
3. Shannon의 1948년 업적과 후대 smoothing 연구를 구분해야 하는 이유는 무엇인가?

다음에는 [[N-gram 모델]]에서 빈도 기반 계산을 익힌다. 큰 계보를 먼저 보고 싶다면 [[N-gram에서 LLM으로]]으로 분기한다.

## 출처

- Claude E. Shannon, [A Mathematical Theory of Communication](https://people.math.harvard.edu/~ctm/home/text/others/shannon/entropy/entropy.pdf), 1948, Part I §§2–3·§6.
- Slava M. Katz, [Estimation of Probabilities from Sparse Data for the Language Model Component of a Speech Recognizer](https://doi.org/10.1109/TASSP.1987.1165125), 1987, pp. 400–401.
- Stanley F. Chen·Joshua Goodman, [An Empirical Study of Smoothing Techniques for Language Modeling](https://dash.harvard.edu/handle/1/25104739), 1998, chapters 2–4.
- 프로젝트 번역·검토 출발 자료: [Shannon's N-gram Model - The Foundation of Statistical Language Processing](https://mbrenndoerfer.com/writing/history-shannon-ngram-language-model)
- 프로젝트 보존 자료: `raw/001_Shannon's N-gram Model - The Foundation of Statistical Language Processing..md`, `raw/001_Shannon's N-gram Model - The Foundation of Statistical Language Processing.commentary.md`.

## 관련 항목

- [[확률]]
- [[N-gram 모델]]
- [[마르코프 가정]]
- [[조건부 확률]]
- [[데이터 희소성]]
- [[Smoothing]]
- [[Perplexity]]
- [[클로드 섀넌]]
- [[안드레이 마르코프]]
- [[슬라바 카츠]]
- [[N-gram에서 LLM으로]]
- [[overview]]
- [[index]]
