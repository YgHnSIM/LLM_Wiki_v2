---
schema_version: 2
id: concept.bleu
page_type: concept
title: BLEU
aliases:
  - Bilingual Evaluation Understudy
  - BLEU 점수
  - BLEU metric
tags:
  - type/concept
  - domain/ai
  - domain/nlp
  - domain/machine-learning
  - domain/linguistics
created: '2026-07-18'
updated: '2026-07-18'
lifecycle: active
verification: verified
artifacts:
  - 'raw/033_BLEU Metric - Automatic Evaluation for Machine Translation.ko.md'
  - 'raw/033_BLEU Metric - Automatic Evaluation for Machine Translation.commentary.ko.md'
evidence:
  - source_id: papineni-et-al-2002-bleu
    locator: 'pp. 311–318, 특히 §§2–3의 modified precision·brevity penalty·BLEU 정의와 §§4–6의 평가 범위'
    relation: supports
  - source_id: callison-burch-et-al-2006-bleu
    locator: 'pp. 249–256, 특히 §§2–4의 인간 판단과 불일치 사례 및 사용 권고'
    relation: disputes
  - source_id: post-2018-sacrebleu
    locator: 'pp. 186–191, 특히 §§2–4의 점수 설정·signature·재현성 분석'
    relation: supplements
related:
  - source.033
  - concept.기계-번역
  - concept.통계적-기계-번역
  - concept.신경망-기계-번역
  - concept.n-gram-모델
  - concept.perplexity
  - source.001
  - source.022
---
# BLEU

BLEU(Bilingual Evaluation Understudy)는 기계 번역 후보와 하나 이상의 인간 참조 번역 사이의 n-gram 일치를 집계하는 자동 평가 지표다. 2002년 Papineni·Roukos·Ward·Zhu가 인간 평가보다 빠른 말뭉치 수준 시스템 비교를 위해 제안했다.

BLEU는 의미 정확성의 직접 측정값이나 “번역 정확도 백분율”이 아니다. 같은 시험 집합·참조·전처리 조건에서 시스템을 상대 비교하는 표면 일치 기반 대리 지표다.

## 정의

후보 말뭉치에서 차수 $n$의 각 n-gram 횟수를 대응하는 개별 참조들 가운데 최대 횟수로 clip하고, 잘린 일치 수를 후보 n-gram 총수로 나누어 수정 정밀도 $p_n$을 구한다. 여러 차수의 $p_n$은 가중 기하평균으로 결합한다.

$$
\operatorname{BLEU}
=\operatorname{BP}\cdot
\exp\!\left(\sum_{n=1}^{N}w_n\log p_n\right)
$$

원 논문의 기본 설정은 $N=4$, $w_n=1/4$이다. 후보 말뭉치 길이 $c$가 각 문장에 가장 가까운 참조 길이의 합 $r$보다 짧으면 다음 brevity penalty가 적용된다.

$$
\operatorname{BP}=\begin{cases}
1, & c>r \\
\exp(1-r/c), & c\le r
\end{cases}
$$

수정 정밀도는 후보가 같은 단어를 참조보다 많이 반복해 점수를 부풀리는 일을 제한하고, brevity penalty는 맞는 단어만 남긴 지나치게 짧은 출력을 억제한다.

## 해석 단위

원래 BLEU는 말뭉치 전체의 n-gram 일치 수와 후보 수를 먼저 합산하는 corpus-level 지표다. 짧은 한 문장에서는 특정 차수의 일치가 0이 되어 전체 점수가 0이 되기 쉽다. 문장 BLEU를 쓰려면 smoothing 방식을 명시해야 하며, 서로 다른 smoothing의 값을 직접 비교하지 않는다.

점수는 0–1 또는 0–100으로 표현할 수 있다. `35 BLEU`는 흔히 0.35를 100배 한 표기이며 35%의 문장이나 단어가 정확하다는 뜻이 아니다. 차이의 의미는 언어쌍, 시험 집합, 참조 수, 토큰화, 대소문자 처리와 구현 설정에 종속된다.

## 장점

- 사람 평가보다 빠르고 결정적으로 계산해 반복 실험에 사용할 수 있다.
- 여러 참조를 허용하고 unigram부터 더 긴 국소 구절 일치를 함께 반영한다.
- 동일한 평가 조건에서는 여러 시스템의 상대 비교와 회귀 확인에 유용하다.
- 원 출력과 설정 signature를 함께 보존하는 SacreBLEU 같은 절차는 결과 재현성을 높인다.

## 한계

- 참조에 없는 정당한 의역과 형태 변이를 벌할 수 있다.
- n-gram 일치가 의미 보존, 사실성, 부정·수치·개체의 정확성을 보장하지 않는다.
- 기본 4-gram은 긴 문맥, 문서 담화, 사용자 효용을 직접 평가하지 않는다.
- 문장 수준에서 불안정하며 오류의 위치와 원인을 설명하지 않는다.
- BLEU 개선은 인간이 판단한 품질 개선의 필요조건도 충분조건도 아니다.
- 결정적 계산과 표본 차이에 대한 통계적 확실성은 별개다.

## 학습 손실과의 구분

BLEU는 토큰 선택, n-gram 계수와 clipping에 의존하는 비미분 지표다. [[신경망 기계 번역]]의 표준 토큰 교차 엔트로피 학습과 동일하지 않다. 후보 집합을 탐색하는 MERT, 기대 위험이나 정책 그래디언트를 사용하는 방법은 BLEU를 간접 최적화할 수 있지만 BLEU 식 자체를 미분 가능한 손실로 바꾸는 것은 아니다.

## 다른 지표와의 관계

[[Perplexity]]는 모델이 실제 토큰열에 부여한 조건부 확률의 평균을 평가하는 반면, BLEU는 생성된 번역과 참조의 표면 n-gram 일치를 평가한다. 같은 모델에서 perplexity가 낮아져도 디코딩된 번역의 BLEU가 반드시 같은 비율로 오르지 않는다. 두 지표는 측정 대상과 정규화 단위가 다르다.

BLEU의 어휘 일치 한계를 보완하려고 stemming·동의어·정렬을 쓰는 METEOR, 요약의 회수율을 강조하는 ROUGE, 문맥 임베딩을 이용하는 후대 지표 등이 제안됐다. 이들은 서로 다른 오류와 품질 차원을 보므로 하나의 숫자로 대체 관계를 단정하지 않는다.

## 출처

- [[033_BLEU와 기계 번역 자동 평가]]
- Kishore Papineni·Salim Roukos·Todd Ward·Wei-Jing Zhu, [Bleu: a Method for Automatic Evaluation of Machine Translation](https://aclanthology.org/P02-1040/), 2002, pp. 311–318.
- Chris Callison-Burch·Miles Osborne·Philipp Koehn, [Re-evaluating the Role of Bleu in Machine Translation Research](https://aclanthology.org/E06-1032/), 2006, pp. 249–256.
- Matt Post, [A Call for Clarity in Reporting BLEU Scores](https://aclanthology.org/W18-6319/), 2018, pp. 186–191.

## 관련 항목

- [[033_BLEU와 기계 번역 자동 평가]]
- [[기계 번역]]
- [[통계적 기계 번역]]
- [[신경망 기계 번역]]
- [[N-gram 모델]]
- [[Perplexity]]
- [[001_섀넌의 N-gram 모델]]
- [[022_IBM 통계적 기계 번역과 데이터 기반 전환]]
