---
schema_version: 2
id: concept.n-gram-모델
page_type: concept
title: N-gram 모델
aliases:
  - n-gram
  - N-gram language model
  - 엔그램 모델
tags:
  - type/concept
  - domain/ai
created: '2026-05-07'
updated: '2026-07-21'
lifecycle: active
verification: verified
artifacts:
  - >-
    raw/001_Shannon's N-gram Model - The Foundation of Statistical Language
    Processing..md
  - raw/019_Katz Back-off - Handling Sparse Data in Language Models.ko.md
  - raw/019_Katz Back-off - Handling Sparse Data in Language Models.commentary.ko.md
  - raw/035_Neural Probabilistic Language Model - Distributed Word Representations and Neural Language Modeling.ko.md
  - raw/035_Neural Probabilistic Language Model - Distributed Word Representations and Neural Language Modeling.commentary.ko.md
evidence:
  - source_id: shannon-1948
    locator: 'Part I, §§2–3 and §6'
    relation: supports
  - source_id: katz-1987
    locator: 'p. 400; pp. 400–401, eqs. (13)–(23)'
    relation: supports
  - source_id: chen-goodman-1998
    locator: '§§1.1 and 2.2–2.4'
    relation: supplements
  - source_id: bengio-et-al-2003-nplm
    locator: 'JMLR 3, pp. 1138–1141과 1147–1149의 n-gram 한계·기준선 비교'
    relation: contextualizes
related:
  - source.001
  - source.019
  - source.035
  - concept.신경-확률-언어-모형
  - concept.단어-임베딩
  - concept.마르코프-가정
  - concept.조건부-확률
  - concept.데이터-희소성
  - concept.smoothing
  - concept.perplexity
  - analysis.n-gram에서-llm으로
---
# N-gram 모델

> [!note] 학습 안내
> **난이도:** 입문<br>
> **선수 지식:** 확률을 “여러 후보에 가능성을 나누는 값”으로 이해하면 충분하다.<br>
> **읽고 나면:** n-gram이 무엇을 세고, 그 빈도로 다음 항목을 어떻게 예측하며, 왜 보지 못한 조합에서 막히는지 설명할 수 있다.

## 1단계 — 먼저 잡을 핵심

[[N-gram 모델]]은 **서로 이웃한 n개의 언어 단위가 말뭉치(corpus)에 몇 번 나타났는지 세어 다음 항목의 확률을 추정하는 언어 모델**이다. 단위는 단어·문자·음절·토큰이 될 수 있다. 단어 기준으로 unigram은 한 단어, bigram은 두 단어, trigram은 세 단어의 연속을 뜻한다.

쉬운 예로 “peanut” 다음에 “butter”가 자주 등장한 학습 자료를 생각할 수 있다. 모델은 문법 규칙을 직접 입력받지 않아도 이 빈도 차이만으로 “peanut” 뒤에는 “butter”가 다른 많은 단어보다 자연스럽다고 판단한다. 이는 실제 사용 빈도와 공기(co-occurrence) 패턴을 계산 가능한 예측으로 바꾼 결과다 [[001_섀넌의 N-gram 모델]].

이 단순한 방식은 초기 자연어 처리 시스템에서 실용적으로 쓰였고, 복잡한 모델과 비교하기 쉬운 기준선(baseline)을 제공했다.

## 2단계 — 작동 원리

### 작동 방식

1. **문제:** 문장의 앞부분이 주어졌을 때 다음 단어나 문자를 고른다.
2. **아이디어:** 전체 과거를 모두 저장하는 대신 바로 앞의 n-1개 항목만 문맥으로 삼는다.
3. **처리:** 학습 말뭉치에서 그 문맥과 다음 항목이 함께 나온 횟수를 센다.
4. **결과:** 같은 문맥 뒤에 자주 나타난 항목에 더 높은 확률을 준다.

trigram 모델이라면 앞의 두 단어를 보고 다음 단어 분포를 만든다. 이때 사용하는 핵심 수학은 [[조건부 확률]]이다. 전체 과거 대신 제한된 최근 문맥만 사용한다는 근사는 [[마르코프 가정]]으로 설명할 수 있다.

### 보지 못한 조합을 만났을 때

단순 빈도만 사용하면 이미 관측한 문맥 뒤에서 한 번도 보지 못한 다음 항목에 확률 0을 준다. 문장 전체 확률은 여러 조건부확률을 곱하므로, 한 조합의 0이 문장 전체를 0으로 만들 수 있다. 문맥 자체를 한 번도 보지 못했다면 빈도 비율의 분모도 0이므로 추정값이 정의되지 않는다.

[[Smoothing|평활화(smoothing)]]는 관측된 조합의 확률 일부를 미관측 조합에 나눠 이 문제를 완화한다. [[019_Katz 백오프와 희소 데이터 확률 추정|Katz back-off]]는 관측된 저빈도 n-gram의 확률을 할인하고, 관측 횟수가 0일 때만 더 짧은 문맥으로 후퇴한다. 문맥을 더 짧게 바꾸는 것이지 제한된 문맥이라는 모델의 전제를 없애는 것은 아니다.

## 3단계 — 기술과 근거

### 빈도에서 조건부확률로

단어 trigram의 최대우도 추정은 다음처럼 쓸 수 있다.

$$
P(w_t\mid w_{t-2},w_{t-1})
=\frac{C(w_{t-2},w_{t-1},w_t)}{C(w_{t-2},w_{t-1})}.
$$

$w_t$는 위치 $t$의 단어이고 $w_{t-2},w_{t-1}$은 바로 앞의 두 단어다. $C(\cdot)$는 해당 연속열이 말뭉치에 나온 횟수다. 문장 확률은 연쇄 법칙에 마르코프 근사를 적용해 이 조건부확률들을 곱한다. 어휘 크기가 $V$라면 가능한 길이 n의 조합은 최대 $V^n$개이므로, n을 키울수록 [[데이터 희소성]]과 저장 비용이 빠르게 커진다.

### 강점

- 구조가 단순해 구현하기 쉽고, 빈도표라서 결과를 추적하고 디버깅하기 쉽다.
- 사람이 문법 규칙을 작성하지 않아도 실제 사용 패턴을 학습한다.
- 자동완성·음성 인식·기계 번역·문법 검사 같은 초기 NLP 시스템에서 실용적이었다.
- 계산 근거를 사람이 확인할 수 있어 기준선으로 유용하다.

### 역사적 위치

Shannon의 1948년 논문은 문자·단어 연속 근사와 조건부확률을 통신원 모델 안에서 다뤘다. 현대 n-gram 용어와 체계적인 [[Smoothing]]은 후대에 정립됐다. [[035_신경 확률 언어 모형과 분산 단어 표현]]은 같은 다음 단어 조건부확률을 고정 빈도표 대신 [[단어 임베딩]]과 공유 다층 퍼셉트론(MLP)으로 계산한 2003년 전환을 보여 준다.

## 검증과 한계

### 한계

- 문맥 창 밖의 장거리 의존성을 직접 포착하기 어렵다.
- “car”와 “automobile”처럼 의미적으로 가까운 단어도 별개의 표면 토큰으로 취급한다.
- 가능한 조합 수가 n에 따라 지수적으로 증가해 [[데이터 희소성]]이 심해진다.
- 큰 모델은 많은 n-gram 빈도표를 저장해야 하므로 저장 비용이 커질 수 있다.

### 역사적 귀속과 흔한 오해

- **사실:** Shannon은 여러 차수의 문자·단어 연속 근사로 영어의 통계적 제약을 보였다.
- **후대 해석:** 이 실험을 n-gram 언어 모델의 선구적 문제 설정으로 읽을 수 있다.
- **귀속하면 안 되는 것:** 현대 용어, Katz back-off, Kneser–Ney, 표준 perplexity 평가를 모두 Shannon의 1948년 업적으로 돌릴 수는 없다.
- **흔한 오해:** smoothing은 희소성을 완화하지만 장거리 문맥과 의미 표현 문제까지 해결하지 않는다.
- **LLM과의 관계:** 현대 [[대규모 언어 모델]]과 조건부 예측 과업은 공유하지만, 고정 빈도표를 그대로 크게 만든 기술은 아니다.

## 학습 확인

1. trigram 모델이 다음 단어를 예측할 때 직접 참고하는 단어는 몇 개인가?
2. 관측되지 않은 n-gram의 확률이 0이면 문장 확률에 어떤 문제가 생기는가?
3. n-gram과 신경 언어 모델은 같은 문제를 어떤 서로 다른 표현으로 푸는가?

다음에는 [[019_Katz 백오프와 희소 데이터 확률 추정]]에서 미관측 조합의 확률을 실제로 재분배하는 방법을 읽는다. 큰 흐름이 궁금하면 [[N-gram에서 LLM으로]]으로 분기한다.

## 출처

- [[001_섀넌의 N-gram 모델]]
- [[019_Katz 백오프와 희소 데이터 확률 추정]]
- [[035_신경 확률 언어 모형과 분산 단어 표현]]
- Claude E. Shannon, [A Mathematical Theory of Communication](https://people.math.harvard.edu/~ctm/home/text/others/shannon/entropy/entropy.pdf), 1948, Part I §§2–3·§6.
- Slava M. Katz, [Estimation of Probabilities from Sparse Data for the Language Model Component of a Speech Recognizer](https://doi.org/10.1109/TASSP.1987.1165125), 1987, pp. 400–401.
- Stanley F. Chen·Joshua Goodman, [An Empirical Study of Smoothing Techniques for Language Modeling](https://dash.harvard.edu/handle/1/25104739), 1998, §§1.1·2.2–2.4.

## 관련 항목

- [[001_섀넌의 N-gram 모델]]
- [[019_Katz 백오프와 희소 데이터 확률 추정]]
- [[035_신경 확률 언어 모형과 분산 단어 표현]]
- [[신경 확률 언어 모형]]
- [[단어 임베딩]]
- [[마르코프 가정]]
- [[조건부 확률]]
- [[데이터 희소성]]
- [[Smoothing]]
- [[Perplexity]]
- [[N-gram에서 LLM으로]]
