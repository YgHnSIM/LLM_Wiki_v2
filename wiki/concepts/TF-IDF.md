---
schema_version: 2
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
updated: '2026-07-16'
lifecycle: active
verification: verified
artifacts:
  - raw/010_Vector Space Model & TF-IDF Foundation of Modern Information Retrieval & Semantic Search.ko.md
  - raw/010_Vector Space Model & TF-IDF Foundation of Modern Information Retrieval & Semantic Search.commentary.ko.md
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
related:
  - source.010
  - entity.제라드-솔턴
  - entity.캐런-스파크-존스
  - concept.벡터-공간-모델
  - concept.코사인-유사도
  - concept.특징-공학
---
# TF-IDF

[[TF-IDF]](Term Frequency-Inverse Document Frequency)는 한 문서 안에서 자주 나오는 용어를 강조하는 용어 빈도(TF)와, 문서 집합 전체에서 흔한 용어를 약화하는 역문서 빈도(IDF)를 결합한 용어 가중 방식이다.

## 기본 원리

대표적인 형태는 다음과 같다.

$$
\operatorname{idf}(t)=\log\frac{N}{\operatorname{df}(t)}
$$

$$
\operatorname{tfidf}(t,d)=\operatorname{tf}(t,d)\operatorname{idf}(t)
$$

$N$은 전체 문서 수, $\operatorname{df}(t)$는 용어 $t$를 포함하는 문서 수다. 특정 문서에 자주 나오면서 전체 문서 집합에서는 드문 용어가 높은 값을 얻는다. 모든 문서에 등장하는 용어는 기본 식에서 IDF가 0이 된다.

실제 구현은 TF에 원시 빈도나 로그 빈도를 쓰고, IDF에 평활화를 더하거나 벡터 길이를 별도로 정규화한다. 따라서 TF-IDF라는 이름만으로 정확한 수치가 정해지지는 않으며 사용한 변형을 함께 밝혀야 한다.

## 역사와 한계

[[캐런 스파크 존스]]의 1972년 논문은 용어 특이성을 문서 집합 빈도로 해석하고 드문 용어의 일치를 더 크게 평가하는 원리를 실험했다. [[제라드 솔턴]] 연구진은 이를 포함한 국소·전역 가중과 정규화 방식을 [[벡터 공간 모델]]과 SMART 계열 실험에서 발전시켰다.

TF-IDF는 용어의 구별력을 추정할 뿐 문맥적 의미를 직접 학습하지 않는다. 동의어, 다의어, 어순을 자체적으로 처리하지 못하며, 같은 문서라도 비교 대상 말뭉치가 달라지면 IDF가 바뀐다. 이런 성격 때문에 설명 가능한 희소 검색과 [[특징 공학]]에는 유용하지만 일반 언어 이해와 동일시할 수 없다.

## 출처

- [[010_벡터 공간 모델과 TF-IDF]]
- Karen Spärck Jones, [A Statistical Interpretation of Term Specificity and Its Application in Retrieval](https://doi.org/10.1108/eb026526), 1972, pp. 11–21.
- Gerard Salton, Anita Wong, Chung-Shu Yang, [A Vector Space Model for Automatic Indexing](https://doi.org/10.1145/361219.361220), 1975, pp. 613–620.
- Gerard Salton, Christopher Buckley, [Term-Weighting Approaches in Automatic Text Retrieval](https://doi.org/10.1016/0306-4573(88)90021-0), 1988, pp. 513–523.

## 관련 항목

- [[010_벡터 공간 모델과 TF-IDF]]
- [[제라드 솔턴]]
- [[캐런 스파크 존스]]
- [[벡터 공간 모델]]
- [[코사인 유사도]]
- [[특징 공학]]
