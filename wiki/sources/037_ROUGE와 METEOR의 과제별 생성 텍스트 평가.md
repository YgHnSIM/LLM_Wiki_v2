---
schema_version: 2
id: source.037
page_type: source
title: ROUGE와 METEOR의 과제별 생성 텍스트 평가
aliases:
  - 037_ROUGE and METEOR Task-Specific and Semantically-Aware Evaluation Metrics
  - ROUGE and METEOR Task-Specific and Semantically-Aware Evaluation Metrics
  - ROUGE와 METEOR 평가 지표
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
  - 'raw/037_ROUGE and METEOR Task-Specific and Semantically-Aware Evaluation Metrics.ko.md'
  - 'raw/037_ROUGE and METEOR Task-Specific and Semantically-Aware Evaluation Metrics.commentary.ko.md'
evidence:
  - source_id: lin-2004-rouge
    locator: 'pp. 74–81, 특히 §§2–5의 ROUGE-N·L·W·S/SU 정의와 §6의 DUC 2001–2003 인간 coverage 상관 평가'
    relation: supports
  - source_id: lavie-sagae-jayaraman-2004-recall
    locator: 'pp. 134–143의 unigram precision·recall 가중 실험, stemming 비교와 TIDES 2003 시스템 수준 인간 상관'
    relation: contextualizes
  - source_id: banerjee-lavie-2005-meteor
    locator: 'pp. 65–72, 특히 §2의 exact·stem·WordNet 정렬, recall 가중 Fmean·chunk 벌점과 §3의 TIDES 2003 문장별 상관·모듈 절제 실험'
    relation: supports
related:
  - concept.rouge
  - concept.meteor
  - concept.bleu
  - concept.wordnet
  - source.033
---
# ROUGE와 METEOR의 과제별 생성 텍스트 평가

037 raw는 2004년에 [[ROUGE]]와 [[METEOR]]가 함께 등장해 [[BLEU]]의 정밀도 중심·문자열 일치 중심 평가를 과제 특화 재현율과 의미 지식으로 보완했다고 설명한다. 공개 문서는 **2004년 ROUGE 논문**, **2004년 번역 평가 recall·stemming 선행 연구**, **2005년 정식 METEOR 논문**을 분리하고 각 지표의 실제 계산과 인간 평가 상관 범위를 복원한다.

핵심 통찰은 하나의 지표가 모든 생성 과제의 품질을 재지 않는다는 것이다. 그러나 ROUGE가 “중요 정보”를 원문에서 직접 알아보거나 METEOR가 문맥 의미를 이해하는 것도 아니다. 두 지표 모두 후보와 사람이 만든 참조 사이의 관측 가능한 대응을 세며, 참조 구성·전처리·길이·언어 자원과 집계 단위에 조건부다.

## 연표: 하나의 2004년 사건이 아니다

| 시점 | 확인되는 문헌 | 직접 기여 |
| --- | --- | --- |
| 2004년 7월 | Chin-Yew Lin, *ROUGE: A Package for Automatic Evaluation of Summaries* | ROUGE-N·L·W·S/SU를 정의하고 DUC 2001–2003 요약에서 인간 content coverage와의 상관을 평가했다. |
| 2004년 9–10월 | Lavie·Sagae·Jayaraman, *The Significance of Recall in Automatic Metrics for MT Evaluation* | 번역에서도 unigram recall에 큰 비중을 둔 조화평균과 stemming이 인간 판단 상관에 주는 효과를 분석했다. |
| 2005년 6월 | Banerjee·Lavie, *METEOR* | exact·Porter stem·WordNet synonym 정렬, recall 가중 $F_{mean}$과 chunk 단편화 벌점을 갖춘 METEOR를 정식 기술하고 문장별 평가를 보고했다. |

2005년 논문은 2004년 선행 연구에서 이미 METEOR를 비교했다고 회고한다. 따라서 METEOR의 연구 시작을 2004년으로 말할 수는 있지만, raw처럼 완성된 2005년 모듈과 식을 모두 2004년의 단일 발표로 묶지 않는다.

## BLEU에서 달라진 평가 질문

BLEU의 중심 통계는 후보 n-gram 가운데 참조와 겹친 비율인 수정 정밀도다. 너무 짧은 후보는 brevity penalty로 제어한다. 이는 원문에 없는 사실을 직접 판정하는 “환각 검사”가 아니다. 참조와 많이 겹치는지를 보는 대리 지표이며, 참조와 같은 단어를 쓰면서도 원 의미를 틀릴 수 있다.

ROUGE-N은 분모를 참조 쪽에 두어 “참조에 있는 표현 가운데 후보가 얼마나 포착했는가”를 묻는다. METEOR는 후보와 참조를 단어 단위로 일대일 정렬해 precision과 recall을 함께 계산하고, 형태·동의어 일치와 어순 단편화를 추가한다. 이 차이는 다음처럼 정리할 수 있다.

| 지표 | 직접 비교 단위 | 대표 정규화·결합 | 우선하는 관측 |
| --- | --- | --- | --- |
| BLEU | 1–4-gram | 후보 측 수정 정밀도, 기하평균, 길이 벌점 | 참조에 없는 후보 n-gram 억제와 국소 구절 일치 |
| ROUGE-N | $N$-gram | 참조 측 재현율 | 참조 요약 표현의 포괄 |
| ROUGE-L/S | LCS 또는 skip-bigram | recall·precision의 F-measure | 순서를 보존한 더 유연한 일치 |
| METEOR 2005 | 정렬된 unigram | recall 가중 조화평균과 chunk 벌점 | 어휘·형태·동의어 대응과 재배열 정도 |

## ROUGE-N: 참조 쪽 n-gram 재현율

참조 요약 집합의 n-gram을 $g$, 참조 출현 수를 $Count(g)$, 후보와 겹치는 제한된 횟수를 $Count_{match}(g)$라 하면 다음처럼 계산한다.

$$
\operatorname{ROUGE\text{-}N}
=\frac{
\sum_{S\in References}\sum_{g\in S}Count_{match}(g)
}{
\sum_{S\in References}\sum_{g\in S}Count(g)
}
$$

분모가 참조 쪽이므로 recall 관련 지표다. 하지만 참조 요약에 들어간 표현을 중요한 정보의 대리물로 삼을 뿐, 원 문서의 사실이나 중요도를 직접 추론하지 않는다. 사람이 만든 참조가 빠뜨린 핵심 내용이나 다른 표현의 정당한 추상 요약은 충분히 보상하지 못할 수 있다.

recall만 높이려면 후보를 길게 만들 수 있으므로 DUC처럼 출력 길이를 고정하거나 precision·F1을 함께 보고해야 한다. “BLEU는 번역의 정밀도, ROUGE는 요약의 재현율”은 좋은 첫 구분이지만 현대 ROUGE 보고 관행 전체를 설명하지는 않는다.

## ROUGE-L·W·S·SU

ROUGE는 단일 점수가 아니라 여러 중첩 단위를 제공한 패키지다.

- **ROUGE-L**: 두 단어열의 최장 공통 부분수열(LCS)을 사용한다. 일치 단어가 연속하지 않아도 순서는 같아야 한다. 원 논문은 LCS recall과 precision을 결합한 F-measure로 정의했다.
- **ROUGE-W**: 같은 길이의 LCS라도 길게 연속한 일치를 더 높게 평가하도록 weighted LCS를 사용한다.
- **ROUGE-S**: 순서를 유지하지만 사이에 단어가 있어도 되는 skip-bigram을 센다. 최대 skip 거리를 제한하지 않으면 기능어의 우연한 대응이 늘 수 있다.
- **ROUGE-SU**: skip-bigram이 하나도 없을 때 모든 점수가 0이 되는 문제를 줄이려고 unigram을 함께 센다.

따라서 ROUGE-L이 “참조 길이로만 정규화한 recall”이라는 raw 설명은 불완전하다. ROUGE-L·S는 정밀도와 재현율을 모두 정의하며, 지표 변형과 구현 설정을 점수 이름에 함께 밝혀야 한다.

## ROUGE의 DUC 평가

Lin은 DUC 2001–2003의 단일·다중 문서 요약 자료를 사용했다. 과제에는 약 10, 50, 100, 200, 400단어처럼 서로 다른 길이 조건이 있었고, 인간은 수동 요약 단위와 후보의 content coverage를 평가했다. 연구는 시스템 평균 ROUGE와 인간 coverage 사이 Pearson·Spearman·Kendall 상관을 계산하고 bootstrap으로 95% 신뢰구간을 추정했다.

원 논문의 결론은 한 ROUGE 변형이 언제나 최선이라는 것이 아니다.

- 100단어 단일 문서 요약에서는 ROUGE-2, L, W와 S가 잘 작동했고 여러 참조가 조금 개선했다.
- 10단어의 매우 짧은 요약에서는 ROUGE-1, L, W, SU4와 SU9가 강했다.
- 다중 문서 요약에서는 높은 0.9대 상관이 드물었고, 불용어를 제외한 ROUGE-1·2·S·SU 일부가 비교적 잘 작동했다.
- 100단어 다중 문서 자료에서는 ROUGE-L과 W가 잘 작동하지 않은 조건도 있었다.
- 다중 문서 과제의 시스템 표본은 약 30개여서 상관 추정이 단일 문서 과제보다 불안정할 수 있다고 저자가 지적했다.

요약 길이, 참조 수, stemming과 불용어 처리는 점수와 인간 상관을 바꾼다. ROUGE 숫자만 남기지 않고 변형·길이 제한·토큰화·stemming·참조 집계 방식을 보존해야 한다.

## 2004년 recall·stemming 선행 연구

Lavie·Sagae·Jayaraman은 TIDES 2003 번역 평가에서 unigram precision과 recall, 균형 F1, recall에 더 큰 비중을 둔 조화평균을 BLEU·NIST와 비교했다. 시스템 수준에서 recall과 recall 가중 조합이 인간 판단과 더 높은 상관을 보였고, 후보·참조를 stemming한 비교도 상관을 높였다.

이 연구는 번역 품질에서 누락을 반영하는 recall의 중요성을 보였지만, WordNet synonym과 2005년 chunk 벌점을 완성해 평가한 논문은 아니다. 당시 논문은 synonym을 향후 덜 엄격한 일치 방식으로 시험할 계획이라고 적었다.

## METEOR의 단계별 unigram 정렬

2005년 METEOR는 후보 번역과 참조 번역 사이에 각 단어가 최대 하나에만 대응하는 일대일 unigram 정렬을 만든다. 기본 단계는 다음 우선순위를 가진다.

1. **exact**: 표면형이 같은 단어를 연결한다.
2. **Porter stem**: 아직 연결되지 않은 단어 중 Porter stem이 같은 항목을 연결한다.
3. **WordNet synonymy**: 아직 연결되지 않은 단어 중 가능한 sense 하나라도 같은 synset에 속하는 항목을 연결한다.

각 단계는 최대 수의 대응을 선택하고, 같은 크기의 정렬이 여러 개면 crossing이 가장 적은 정렬을 고른다. 앞 단계에서 연결한 단어는 뒤 단계가 다시 연결하지 않으므로 단계 순서가 우선순위다.

WordNet synonymy는 문맥 의미를 판별하지 않는다. 두 단어의 가능한 여러 sense 중 하나가 같은 synset이면 연결하는 “poor-man’s synonymy detection”이라고 원 논문 스스로 표현했다. 다의어의 실제 문맥 의미가 다르거나 WordNet에 없는 도메인 표현·언어에서는 잘못 대응하거나 놓칠 수 있다.

## METEOR 점수와 chunk 벌점

후보 길이를 $|h|$, 참조 길이를 $|r|$, 정렬된 unigram 수를 $m$이라 하면 다음과 같다.

$$
P=\frac{m}{|h|},\qquad
R=\frac{m}{|r|}
$$

2005년의 조화평균은 recall 쪽에 큰 비중을 둔다.

$$
F_{mean}=\frac{10PR}{R+9P}
$$

정렬된 단어를 후보와 참조에서 모두 연속하고 순서가 같은 최소 묶음으로 나눈 수를 $ch$라 하면 다음 벌점을 사용했다.

$$
Penalty=0.5\left(\frac{ch}{m}\right)^3
$$

$$
METEOR=(1-Penalty)F_{mean}
$$

일치 단어가 한 덩어리면 벌점이 작고 모두 흩어져 있으면 최대 약 0.5에 가까워진다. 이는 유창성·문법을 직접 분석하는 것이 아니라 대응 단어의 어순 단편화를 근사한다. 여러 참조가 있으면 각각 독립적으로 점수를 내고 가장 높은 참조 점수를 선택하며, 시스템 점수는 시험 집합의 충분통계를 모아 계산한다.

## METEOR의 TIDES 2003 평가

2005년 논문은 아랍어→영어 664문장과 중국어→영어 920문장을 사용했다. 각 문장에는 영어 참조 네 개가 있었고, 아랍어 시스템 6개와 중국어 시스템 7개의 각 번역을 두 평가자가 adequacy와 fluency 1–5점으로 평가했다.

중국어 자료의 7개 시스템 점에서 METEOR와 인간 시스템 평균의 Pearson 상관은 0.964로 BLEU 0.817보다 높았다. 그러나 일곱 점의 시스템 수준 상관을 보편적인 크기로 일반화할 수 없다. 논문의 주된 문장별 상관은 시스템마다 계산한 값을 언어별로 평균해 아랍어 0.347, 중국어 0.331이었다. 인간 점수를 정규화하면 각각 0.403과 0.365로 달라져 인간 문장 평가 자체의 잡음도 드러났다.

모듈 절제 실험에서 exact만 쓴 상관은 아랍어 0.312·중국어 0.293, Porter stem을 추가하면 0.329·0.318, WordNet synonym까지 추가하면 0.347·0.331이었다. 해당 자료에서 각 구성 요소가 작은 개선을 보였지만, 다른 언어쌍·시대·시스템에도 같은 크기를 보장하지 않는다.

## 평가 지표가 시스템에 주는 유인

정밀도·재현율·어순 벌점은 중립적인 관측이 아니라 서로 다른 출력을 보상한다. ROUGE recall만 강조하면 참조 표현을 많이 포함하는 긴 요약이 유리하고, METEOR의 synonym 대응은 WordNet이 아는 어휘 변형을 보상하며, chunk 벌점은 같은 단어를 더 연속적인 순서로 놓도록 한다.

지표를 개발 집합 최적화 목표로 쓰면 이 유인이 모델 선택과 출력 형식에 직접 작용한다. 따라서 지표 상승이 과제의 실제 효용과 일치하는지 인간 평가·오류 분석·강건성 시험으로 확인해야 한다. 자동 점수는 목적의 완전한 정의가 아니라 측정 가능한 일부 품질의 대리물이다.

## 검증 정정

- **ROUGE와 완성된 METEOR가 모두 2004년에 발표**: ROUGE와 recall 선행 연구는 2004년, 정식 METEOR 논문은 2005년이다.
- **BLEU 정밀도가 원문 밖 환각을 직접 측정**: BLEU는 후보와 참조의 n-gram을 비교하며 원문 entailment나 사실성을 직접 검사하지 않는다.
- **ROUGE는 중요한 원문 정보를 직접 발견**: 인간 참조에 포함된 표현을 중요 정보의 대리물로 삼는다.
- **ROUGE는 하나의 recall 식**: N·L·W·S·SU 지표군이고 L·S 계열은 precision·recall의 F-measure도 사용한다.
- **ROUGE-L은 참조 길이로만 정규화한 LCS**: 원 논문은 LCS recall과 precision을 결합한 식과 summary-level union LCS를 정의한다.
- **METEOR가 문맥 의미를 이해**: 2005년 WordNet 모듈은 sense disambiguation 없이 가능한 synset 중 하나가 겹치면 대응한다.
- **fragmentation penalty가 유창성을 측정**: 일치 단어 청크의 분산을 근사할 뿐 문법성·자연스러움 전체를 판정하지 않는다.
- **인간 판단과 거의 완벽한 상관**: 높은 시스템 수준 상관은 7개 중국어 시스템의 집계이며, 문장별 평균 상관은 0.331·0.347이었다.
- **한 지표가 인간 평가를 대체**: 두 논문 모두 제한된 자료에서 상관을 평가했으며 지표가 전체 품질 차원을 포괄한다고 증명하지 않았다.
- **현대 의미 지표·LLM 평가의 직접 단일 기원**: 과제 특화·유연한 대응이라는 비교 가능한 원리는 있지만 문맥 임베딩·학습된 평가자·사실성 검사는 별도 문헌과 검증이 필요하다.

## 핵심 문장

- ROUGE-N은 후보가 참조의 n-gram을 얼마나 포착했는지 재현율 관점으로 계산한다.
- ROUGE는 여러 중첩 단위를 가진 지표군이며 과제 길이·참조 수·전처리에 따라 인간 상관이 달라졌다.
- METEOR 2005는 exact·stem·WordNet synonym의 우선 정렬과 recall 가중 Fmean·chunk 벌점을 결합했다.
- WordNet 대응은 문맥 의미 판별이 아니고 chunk 벌점은 유창성 전체가 아니라 어순 단편화의 근사다.
- 자동 지표의 유효성은 언어쌍·자료·시스템·집계 단위와 인간 평가 절차에 조건부다.

## 출처

- Chin-Yew Lin, [ROUGE: A Package for Automatic Evaluation of Summaries](https://aclanthology.org/W04-1013/), 2004, pp. 74–81.
- Alon Lavie·Kenji Sagae·Shyamsundar Jayaraman, [The Significance of Recall in Automatic Metrics for MT Evaluation](https://aclanthology.org/2004.amta-papers.16/), 2004, pp. 134–143.
- Satanjeev Banerjee·Alon Lavie, [METEOR: An Automatic Metric for MT Evaluation with Improved Correlation with Human Judgments](https://aclanthology.org/W05-0909/), 2005, pp. 65–72.
- [[033_BLEU와 기계 번역 자동 평가]]
- 프로젝트 보존 자료: `raw/037_ROUGE and METEOR Task-Specific and Semantically-Aware Evaluation Metrics.ko.md`, `raw/037_ROUGE and METEOR Task-Specific and Semantically-Aware Evaluation Metrics.commentary.ko.md`.

## 관련 항목

- [[ROUGE]]
- [[METEOR]]
- [[BLEU]]
- [[033_BLEU와 기계 번역 자동 평가]]
- [[WordNet]]
