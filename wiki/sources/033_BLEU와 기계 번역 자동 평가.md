---
schema_version: 2
id: source.033
page_type: source
title: BLEU와 기계 번역 자동 평가
aliases:
  - 033_BLEU Metric - Automatic Evaluation for Machine Translation
  - BLEU Metric - Automatic Evaluation for Machine Translation
  - BLEU 지표와 기계 번역 평가
tags:
  - type/source
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
    locator: 'pp. 311–318, 특히 §§1–2의 목표, §§2.1–2.3의 modified precision·brevity penalty, §3의 BLEU 식, §§4–6의 실험·논의'
    relation: supports
  - source_id: callison-burch-et-al-2006-bleu
    locator: 'pp. 249–256, 특히 §§1–3의 사례 비교와 §4의 BLEU 사용 권고'
    relation: disputes
  - source_id: post-2018-sacrebleu
    locator: 'pp. 186–191, 특히 §§1–2의 재현성 문제, §3의 SacreBLEU, §4의 최대 1.8 BLEU 설정 차이'
    relation: supplements
related:
  - concept.bleu
  - concept.기계-번역
  - concept.통계적-기계-번역
  - concept.신경망-기계-번역
  - concept.n-gram-모델
  - concept.perplexity
  - source.001
  - source.022
---
# BLEU와 기계 번역 자동 평가

033 raw는 BLEU(Bilingual Evaluation Understudy)를 느린 인간 평가를 대신해 기계 번역 연구를 가속한 자동 지표로 설명한다. 공개 문서는 Papineni·Roukos·Ward·Zhu의 2002년 원 논문에서 실제 정의와 실험 범위를 복원한다. BLEU의 핵심은 후보 번역과 여러 참조 번역 사이의 **수정 n-gram 정밀도**, 짧은 출력에 대한 **brevity penalty**, 여러 차수 정밀도의 **가중 기하평균**, 그리고 **말뭉치 단위 집계**다.

BLEU는 빠른 시스템 비교를 가능하게 했지만, 인간 평가의 무조건적 대체물이나 번역 품질 자체는 아니다. 원 논문도 자동 지표를 인간 판단의 대리물로 제안했고 문장별 점수와 인간 판단이 크게 다를 수 있다고 밝혔다. 후속 연구는 참조 수·토큰화·대소문자·구현·시험 집합 같은 조건이 점수 해석과 재현성에 영향을 준다는 점을 구체화했다.

## 평가 문제와 설계 목표

기계 번역은 의미 보존, 유창성, 문법성, 문체, 용어와 담화 일관성처럼 한 숫자로 완전히 환원하기 어려운 여러 품질 차원을 가진다. 2002년 논문은 인간 평가보다 싸고 빠르며 언어에 덜 의존하고, 전문가 판단과 높은 상관을 보이는 자동 지표를 목표로 삼았다. 핵심 가정은 좋은 번역일수록 사람이 만든 하나 이상의 참조 번역과 더 많은 단어·구절을 공유한다는 것이다.

이 가정은 번역의 정답이 하나가 아니라는 문제를 여러 참조로 완화한다. 그러나 유효한 의역이 참조에 없으면 벌점을 받고, 참조와 단어가 겹쳐도 의미가 틀릴 수 있다. BLEU가 재는 것은 참조와의 표면 n-gram 일치이며 의미 동등성 전체가 아니다.

## 수정 n-gram 정밀도

단순 unigram 정밀도는 후보 번역의 각 단어가 참조에 한 번이라도 있으면 모두 맞았다고 셀 수 있어 반복을 악용할 수 있다. BLEU는 후보 안의 각 n-gram 출현 횟수를 **단일 참조들 가운데 가장 많이 나타난 횟수**로 잘라낸다. 후보 말뭉치의 문장 집합을 $C$, 참조 집합에서 얻은 최대 출현 횟수를 $\operatorname{Count}_{\mathrm{clip}}$이라 하면 차수 $n$의 수정 정밀도는 다음처럼 집계한다.

$$
p_n=
\frac{
\sum_{c\in C}\sum_{g\in \operatorname{ngram}_n(c)}
\operatorname{Count}_{\mathrm{clip}}(g)
}{
\sum_{c\in C}\sum_{g\in \operatorname{ngram}_n(c)}
\operatorname{Count}(g,c)
}
$$

여러 참조의 n-gram 횟수를 서로 더하는 것이 아니라, 후보 문장에 대응하는 참조 각각에서 센 값의 최댓값으로 clipping한다. 그런 다음 잘린 일치 수와 후보 n-gram 수를 말뭉치 전체에서 합산한다. 이 두 단계가 반복 단어로 점수를 부풀리는 일을 제한하면서 문장 단위 희소성을 줄인다.

## 여러 차수와 brevity penalty

unigram은 대체로 적절한 단어 선택을, 더 긴 n-gram은 국소 어순과 구절 일치를 추가로 요구한다. 원 논문의 기준 설정은 $N=4$와 균등 가중치 $w_n=1/N$을 사용했다. 수정 정밀도의 가중 기하평균만 사용하면 아주 짧은 후보가 맞는 단어만 남겨 높은 정밀도를 얻을 수 있으므로, 후보 말뭉치 길이 $c$가 유효 참조 길이 $r$보다 짧을 때 벌점을 준다.

$$
\operatorname{BP}=\begin{cases}
1, & c>r \\
\exp(1-r/c), & c\le r
\end{cases}
$$

$$
\operatorname{BLEU}
=\operatorname{BP}\cdot
\exp\!\left(\sum_{n=1}^{N}w_n\log p_n\right)
$$

유효 참조 길이는 각 후보 문장에 가장 가까운 참조 길이를 선택해 말뭉치 전체에서 합한다. 원래 BLEU는 말뭉치 단위 지표다. 한 문장에 4-gram 일치가 하나도 없으면 평활화하지 않은 문장 BLEU는 0이 되기 쉽고, 짧은 문장에서는 작은 수정이 크게 작용한다. 문장 단위 사용에는 별도 smoothing과 그 설정 보고가 필요하며 원 논문의 말뭉치 결과와 같은 값으로 취급할 수 없다.

BLEU는 보통 0–1 또는 0–100 척도로 표시된다. `BLEU 35`는 관행상 0.35를 100배 한 표기일 수 있지만 “35% 정확도”라는 뜻은 아니다. 점수 차이는 같은 시험 집합·참조·토큰화·대소문자 처리·구현 조건에서 비교해야 한다.

## 2002년 실험이 보여준 범위

원 논문은 중국어 뉴스 40개에서 뽑은 500문장을 사용했다. 각 문장에는 전문 번역가가 만든 영어 참조 네 개가 있었고, 비교 대상은 인간 번역 두 개와 기계 번역 시스템 세 개였다. 연구진은 단일언어·이중언어 인간 평가와 BLEU가 다섯 시스템의 순위를 비슷하게 매긴다고 보고했다.

시스템 수준에서 보고한 상관은 단일언어 평가 0.99, 이중언어 평가 0.96이었다. 그러나 데이터 점은 다섯 시스템뿐이고 같은 말뭉치의 한 언어쌍·한 장르·한 시대 시스템을 비교했다. 이 값만으로 모든 번역 방향, 문장 단위 판단, 서로 가까운 현대 시스템에서 동일한 상관을 보장할 수 없다.

참조 수가 점수에 미치는 영향도 원 논문 표에서 드러난다. 한 인간 번역의 BLEU는 참조 네 개를 사용할 때 0.3468, 두 개를 사용할 때 0.2571이었다. 점수는 시스템 출력만의 속성이 아니라 참조 집합과 평가 절차의 함수다.

## 점수의 재현성과 불확실성

Post는 2018년 같은 WMT 시험 집합에서도 토큰화·대소문자·참조 처리 같은 설정 조합이 최대 1.8 BLEU 차이를 만들 수 있음을 보였다. SacreBLEU는 사용자가 미리 토큰화하지 않은 출력과 표준 시험 자료를 받아 처리하고, 점수와 함께 버전·언어쌍·참조 수·대소문자·토크나이저 등의 signature를 기록해 비교 조건을 복원하도록 한다.

BLEU 계산이 결정적이라는 사실은 관측된 작은 차이가 통계적으로 확실하다는 뜻이 아니다. 시험 문장은 모집단의 표본이고, 문장 구성에 따라 시스템 차이가 달라질 수 있다. 원 논문도 시스템 쌍 사이 점수 차이에 t-통계를 계산했다. 오늘날의 비교에서도 재표집이나 적절한 유의성 검정, 효과 크기와 시험 조건을 함께 보고해야 한다.

## 무엇을 측정하지 못하는가

- **참조 밖의 정당한 의역**: 의미가 맞아도 참조와 어휘가 다르면 낮게 평가될 수 있다.
- **의미 오류와 사실성**: 높은 국소 n-gram 일치가 부정, 수치, 개체, 관계의 정확성을 보장하지 않는다.
- **긴 문맥과 담화**: 기본 4-gram은 문서 수준 일관성, 대명사 연결, 용어 지속성을 직접 측정하지 않는다.
- **오류의 위치와 심각도**: 점수 하나만으로 어떤 문장이 왜 틀렸는지 진단하기 어렵다.
- **교차 조건의 절대 품질**: 언어쌍·형태론·분절·참조 수·시험 집합이 다르면 점수 규모를 그대로 비교할 수 없다.

Callison-Burch·Osborne·Koehn은 2006년 사람 평가가 더 나은 번역으로 판단한 시스템이 BLEU에서 낮아지는 사례와, BLEU 개선이 인간 품질 개선으로 이어지지 않은 사례를 분석했다. 이 결과는 BLEU가 쓸모없다는 뜻이 아니라 **BLEU 상승이 인간 품질 향상의 필요조건도 충분조건도 아니라는 경고**다. 자동 점수는 인간 평가, 오류 분석, 과제별 기준과 함께 사용해야 한다.

## 학습 목표와의 관계

raw는 BLEU를 빠르고 미분 가능한 목표로 설명하지만 원래 BLEU는 미분 가능하지 않다. 토큰 선택, n-gram 계수, clipping, 참조 길이 선택과 brevity penalty는 이산 출력에 적용된다. 신경 기계 번역은 보통 정답 토큰의 교차 엔트로피나 로그가능도로 매개변수를 학습하고 BLEU를 개발·시험 집합의 외부 평가에 사용한다.

통계적 번역의 minimum error rate training이나 후대의 minimum risk·강화학습 계열은 후보 집합·기대 위험·표본 추정 등을 통해 BLEU 같은 비미분 지표를 간접 최적화할 수 있다. 이는 BLEU 식 자체가 매끄러운 미분 가능 손실이라는 뜻과 다르다. 034가 다루는 구 기반 번역과 MERT에서는 이 구분을 별도로 검증한다.

## 검증 정정

- **BLEU는 문장별 품질을 안정적으로 측정한다**: 원 논문은 말뭉치 단위 비교를 목표로 했고 문장 점수와 인간 판단의 차이를 직접 인정했다.
- **단순 단어 중복률**: BLEU는 최대 참조 횟수로 clip한 여러 차수의 n-gram 정밀도, 기하평균과 brevity penalty를 결합한다.
- **완전한 언어 독립성**: 핵심 식은 언어별 파서를 요구하지 않지만 토큰화·분절·형태론·참조 구성에 영향을 받는다.
- **결정적 점수이므로 모든 차이는 실제 개선**: 점수 계산의 결정성과 표본 불확실성은 별개이며 작은 차이는 검정과 효과 크기가 필요하다.
- **빠르고 미분 가능한 직접 학습 목적**: BLEU는 이산 계수 기반 비미분 지표다. 모델 학습 손실과 외부 평가 지표를 구분해야 한다.
- **높은 BLEU는 곧 좋은 번역**: 참조와의 표면 일치는 중요한 신호지만 의미·사실·담화·사용자 효용 전체를 보장하지 않는다.
- **BLEU가 신경 기계 번역과 LLM 발전을 직접 일으켰다**: 비교 가능한 자동 평가가 실험 순환을 도운 것은 맞지만, 모델 구조·자료·최적화의 발전을 단일 지표의 인과로 환원할 수 없다.

## 핵심 문장

- BLEU는 후보와 참조 사이의 clip된 n-gram 정밀도를 말뭉치 전체에서 집계하고 짧은 출력에 벌점을 준다.
- 원래 지표의 기본 분석 단위는 개별 문장이 아니라 시스템이 번역한 말뭉치다.
- 점수는 참조 수, 토큰화, 대소문자, 시험 집합과 구현 설정에 의존하므로 숫자와 평가 조건을 함께 보존해야 한다.
- BLEU는 표면 일치 기반 대리 지표이며 인간 품질 판단의 필요조건이나 충분조건이 아니다.
- 외부 평가 점수와 미분 가능한 학습 손실을 분리해서 이해해야 한다.

## 출처

- Kishore Papineni·Salim Roukos·Todd Ward·Wei-Jing Zhu, [Bleu: a Method for Automatic Evaluation of Machine Translation](https://aclanthology.org/P02-1040/), 2002, pp. 311–318.
- Chris Callison-Burch·Miles Osborne·Philipp Koehn, [Re-evaluating the Role of Bleu in Machine Translation Research](https://aclanthology.org/E06-1032/), 2006, pp. 249–256.
- Matt Post, [A Call for Clarity in Reporting BLEU Scores](https://aclanthology.org/W18-6319/), 2018, pp. 186–191.
- 프로젝트 보존 자료: `raw/033_BLEU Metric - Automatic Evaluation for Machine Translation.ko.md`, `raw/033_BLEU Metric - Automatic Evaluation for Machine Translation.commentary.ko.md`.

## 관련 항목

- [[BLEU]]
- [[기계 번역]]
- [[통계적 기계 번역]]
- [[신경망 기계 번역]]
- [[N-gram 모델]]
- [[Perplexity]]
- [[001_섀넌의 N-gram 모델]]
- [[022_IBM 통계적 기계 번역과 데이터 기반 전환]]
