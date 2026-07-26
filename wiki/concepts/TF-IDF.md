---
schema_version: 3
id: concept.tf-idf
page_type: concept
title: TF-IDF
aliases:
  - Term Frequency-Inverse Document Frequency
  - 용어 빈도-역문서 빈도
  - TFIDF
tags:
  - type/concept
  - domain/computer-science
  - domain/nlp
  - domain/machine-learning
created: '2026-07-16'
updated: '2026-07-21'
editorial_status: active
review:
  evidence_coverage: verified
  content_mode: descriptive
artifacts:
  - raw/010_Vector Space Model & TF-IDF Foundation of Modern Information Retrieval & Semantic Search.ko.md
  - raw/010_Vector Space Model & TF-IDF Foundation of Modern Information Retrieval & Semantic Search.commentary.ko.md
  - raw/024_BM25 The Probabilistic Ranking Revolution in Information Retrieval.ko.md
  - raw/024_BM25 The Probabilistic Ranking Revolution in Information Retrieval.commentary.ko.md
evidence:
  - source_id: sparck-jones-1972
    locator: pp. 11–21
    relation: supports
  - source_id: salton-wong-yang-1975
    locator: pp. 613–620
    relation: contextualizes
  - source_id: salton-buckley-1988
    locator: pp. 513–523
    relation: supports
  - source_id: robertson-zaragoza-2009-bm25
    locator: '§§3.1–3.4, pp. 347–360'
    relation: contextualizes
relations:
  - target: entity.제라드-솔턴
    kind: related
  - target: entity.캐런-스파크-존스
    kind: related
  - target: concept.코사인-유사도
    kind: related
  - target: concept.특징-공학
    kind: related
  - target: concept.bm25
    kind: related
learning:
  difficulty:
    entry: intermediate
    target: intermediate
  prerequisites:
    - target: concept.벡터-공간-모델
  assumed_knowledge: 없음
  outcomes:
    - 문서 안 빈도와 문서 집합의 희귀도를 결합해 용어 가중치를 계산하고 구현 변형·BM25와의 차이를 설명할 수 있다.
  next:
    - target: source.010
      reason: 다음에는 010벡터 공간 모델과 TF-IDF에서 역사적 형성과 검색 실험을 본다.
    - target: source.024
      reason: 후대의 포화·길이 보정은 024BM25와 확률적 정보 검색으로 이어 간다.
---
# TF-IDF

> [!note] 학습 안내
> **난이도:** 중급<br>
> **선수 지식:** [[concept.벡터-공간-모델|벡터 공간 모델]]<br>
> **읽고 나면:** 문서 안 빈도와 문서 집합의 희귀도를 결합해 용어 가중치를 계산하고 구현 변형·BM25와의 차이를 설명할 수 있다.

## 1단계 — 먼저 잡을 핵심

### 핵심 정의

[[TF-IDF]](Term Frequency-Inverse Document Frequency)는 한 문서 안에서 자주 나오는 용어를 강조하는 용어 빈도(TF)와, 문서 집합 전체에서 흔한 용어를 약화하는 역문서 빈도(IDF)를 결합한 용어 가중 방식이다.

## 2단계 — 작동 원리

### 기본 원리

대표적인 형태는 다음과 같다.

$$
\operatorname{idf}(t)=\log\frac{N}{\operatorname{df}(t)}
$$

$$
\operatorname{tfidf}(t,d)=\operatorname{tf}(t,d)\operatorname{idf}(t)
$$

$N$은 전체 문서 수, $\operatorname{df}(t)$는 용어 $t$를 포함하는 문서 수다. 특정 문서에 자주 나오면서 전체 문서 집합에서는 드문 용어가 높은 값을 얻는다. 모든 문서에 등장하는 용어는 기본 식에서 IDF가 0이 된다.

실제 구현은 TF에 원시 빈도나 로그 빈도를 쓰고, IDF에 평활화를 더하거나 벡터 길이를 별도로 정규화한다. 따라서 TF-IDF라는 이름만으로 정확한 수치가 정해지지는 않으며 사용한 변형을 함께 밝혀야 한다.

## 3단계 — 기술과 근거

### 역사와 한계

[[캐런 스파크 존스]]의 1972년 논문은 용어 특이성을 문서 집합 빈도로 해석하고 드문 용어의 일치를 더 크게 평가하는 원리를 실험했다. [[제라드 솔턴]] 연구진은 이를 포함한 국소·전역 가중과 정규화 방식을 [[벡터 공간 모델]]과 SMART 계열 실험에서 발전시켰다.

TF-IDF는 용어의 구별력을 추정할 뿐 문맥적 의미를 직접 학습하지 않는다. 동의어, 다의어, 어순을 자체적으로 처리하지 못하며, 같은 문서라도 비교 대상 말뭉치가 달라지면 IDF가 바뀐다. 이런 성격 때문에 설명 가능한 희소 검색과 [[특징 공학]]에는 유용하지만 일반 언어 이해와 동일시할 수 없다.

### BM25와의 관계

[[BM25]]도 문서 집합에서 드문 질의어를 크게 가중한다는 점에서 TF-IDF와 직관을 공유한다. 다만 BM25는 확률적 관련성 프레임워크에서 나온 순위 함수로, 문서 안 용어 빈도의 포화와 평균 문서 길이에 대한 보정을 명시적으로 결합한다 [[024_BM25와 확률적 정보 검색]].

그러므로 BM25를 단 하나의 고정된 “TF-IDF 공식”에 대한 교체로만 설명하면 두 계보를 모두 단순화한다. TF-IDF 자체가 로그 TF, 여러 IDF 정의, 문서 벡터 정규화를 조합하는 가중치 계열이며, BM25의 의의는 같은 희소 용어 직관을 다른 확률적 모형과 포화·길이 보정 구조 안에서 발전시켰다는 데 있다.

## 검증과 한계

### 구현과 해석의 경계

TF와 IDF에는 여러 정의와 평활화·정규화 조합이 있으므로 같은 이름의 구현도 수치가 다를 수 있다. 높은 가중치는 특정 말뭉치에서 그 용어가 문서를 구별하는 데 유용하다는 뜻이며, 문맥적 의미나 사실적 중요도를 직접 학습했다는 뜻은 아니다.

역문서 빈도 원리와 벡터 공간 검색의 발전에는 여러 연구자의 기여가 있다. TF-IDF 전체를 한 사람의 한 해 단독 발명으로 단순화하거나 BM25를 동일 공식의 이름 변경으로 처리하지 않는다.

## 학습 확인

1. TF와 IDF는 용어 가중치에서 각각 어떤 빈도를 반영하는가?
2. 특정 문서에 자주 나오고 전체 문서에서는 드문 용어가 높은 값을 얻는 이유는 무엇인가?
3. TF-IDF 값이 구현마다 달라질 수 있고 BM25와 동일하지 않은 이유는 무엇인가?

다음에는 [[010_벡터 공간 모델과 TF-IDF]]에서 역사적 형성과 검색 실험을 본다. 후대의 포화·길이 보정은 [[024_BM25와 확률적 정보 검색]]으로 이어 간다.

### 다음 문서

- [[source.010|벡터 공간 모델과 TF-IDF]] — 다음에는 010벡터 공간 모델과 TF-IDF에서 역사적 형성과 검색 실험을 본다.
- [[source.024|BM25와 확률적 정보 검색]] — 후대의 포화·길이 보정은 024BM25와 확률적 정보 검색으로 이어 간다.

## 출처
- [[010_벡터 공간 모델과 TF-IDF]]
- Karen Spärck Jones, [A Statistical Interpretation of Term Specificity and Its Application in Retrieval](https://doi.org/10.1108/eb026526), 1972, pp. 11–21.
- Gerard Salton, Anita Wong, Chung-Shu Yang, [A Vector Space Model for Automatic Indexing](https://doi.org/10.1145/361219.361220), 1975, pp. 613–620.
- Gerard Salton, Christopher Buckley, [Term-Weighting Approaches in Automatic Text Retrieval](https://doi.org/10.1016/0306-4573(88)90021-0), 1988, pp. 513–523.
- Stephen Robertson·Hugo Zaragoza, [The Probabilistic Relevance Framework: BM25 and Beyond](https://doi.org/10.1561/1500000019), 2009, §§3.1–3.4, pp. 347–360.
- [[024_BM25와 확률적 정보 검색]]

## 관련 항목

- [[source.010|벡터 공간 모델과 TF-IDF]]
- [[source.024|BM25와 확률적 정보 검색]]
- [[concept.벡터-공간-모델|벡터 공간 모델]]
- [[entity.제라드-솔턴|제라드 솔턴]]
- [[entity.캐런-스파크-존스|캐런 스파크 존스]]
- [[concept.코사인-유사도|코사인 유사도]]
- [[concept.특징-공학|특징 공학]]
- [[concept.bm25|BM25]]
