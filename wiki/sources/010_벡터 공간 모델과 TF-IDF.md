---
schema_version: 2
id: source.010
page_type: source
title: 벡터 공간 모델과 TF-IDF
aliases:
  - 010_Vector Space Model & TF-IDF
  - Vector Space Model and TF-IDF
  - 현대 정보 검색과 의미 검색의 토대
tags:
  - type/source
  - domain/computer-science
  - domain/nlp
  - domain/machine-learning
created: '2026-07-16'
updated: '2026-07-21'
lifecycle: active
verification: verified
artifacts:
  - raw/010_Vector Space Model & TF-IDF Foundation of Modern Information Retrieval & Semantic Search.ko.md
  - raw/010_Vector Space Model & TF-IDF Foundation of Modern Information Retrieval & Semantic Search.commentary.ko.md
evidence:
  - source_id: salton-1968
    locator: chapter 4, document vectors and similarity methods
    relation: contextualizes
  - source_id: sparck-jones-1972
    locator: pp. 11–21
    relation: supports
  - source_id: salton-wong-yang-1975
    locator: pp. 613–620
    relation: supports
  - source_id: salton-buckley-1988
    locator: pp. 513–523
    relation: supplements
related:
  - entity.제라드-솔턴
  - entity.캐런-스파크-존스
  - concept.벡터-공간-모델
  - concept.tf-idf
  - concept.코사인-유사도
  - concept.특징-공학
  - concept.대규모-언어-모델
---
# 벡터 공간 모델과 TF-IDF

> [!note] 학습 안내
> **난이도:** 중급<br>
> **선수 지식:** 벡터의 성분과 로그의 기본 개념<br>
> **읽고 나면:** 문서와 질의를 용어 벡터로 만들고 TF-IDF와 코사인 유사도로 순위를 정하는 과정 및 그 점수가 의미 이해와 다른 이유를 설명할 수 있다.

## 1단계 — 먼저 잡을 핵심

### 핵심 요약

[[벡터 공간 모델]]은 문서와 질의를 같은 용어 공간의 벡터로 표현하고 유사도에 따라 문서에 순위를 매긴다. 정확히 일치하는 문서만 반환하는 불리언 검색과 달리, 가중 용어가 일부만 겹치는 문서에도 연속적인 관련성 점수를 줄 수 있다. [[TF-IDF]]는 문서 안에서 자주 나타나는 용어의 가중치를 높이되 문서 집합 전체에서 흔한 용어의 가중치를 낮추며, [[코사인 유사도]]는 벡터의 방향을 비교해 문서 길이의 직접적인 영향을 줄인다.

### 쉬운 예시

`고양이 사료`라는 질의를 찾는다고 하자. 여러 문서에 거의 다 나오는 흔한 단어보다 소수 문서에 집중된 `고양이`와 `사료`가 더 큰 구별력을 얻고, 두 용어의 가중치가 비슷한 방향을 이루는 문서가 앞쪽에 놓인다.

### 핵심 문장

- 벡터 공간 모델은 문서와 질의를 비교 가능한 수치 공간에 놓아 관련성의 정도를 계산하게 했다.
- TF-IDF는 문서 안의 빈도와 문서 집합 전체의 희소성을 결합하는 용어 가중 원리다.
- 이 방법의 성과는 일반 의미 이해가 아니라 해석 가능한 자동 색인과 순위 검색에 있다.
- 현대 밀집 검색은 표현을 학습하지만, 질의와 문서를 벡터 공간에서 비교한다는 문제 설정을 공유한다.

## 2단계 — 작동 원리

### 표현과 계산

어휘가 $m$개 용어로 이루어졌다면 문서 $d$는 다음 벡터로 나타낼 수 있다.

$$
\vec d=(w_{1,d},w_{2,d},\ldots,w_{m,d})
$$

고전적 용어 벡터에서 $w_{i,d}$는 용어 $i$가 문서 $d$에서 갖는 가중치다. 한 문서에는 전체 어휘 중 일부만 등장하므로 대부분의 성분이 0인 희소 벡터가 된다. 질의도 같은 공간에 놓으면 문서와 직접 비교할 수 있다.

TF-IDF의 대표적 형태는 다음과 같다.

$$
\operatorname{tfidf}(t,d)=\operatorname{tf}(t,d)\log\frac{N}{\operatorname{df}(t)}
$$

$N$은 전체 문서 수이고 $\operatorname{df}(t)$는 용어 $t$가 등장한 문서 수다. 실제 시스템은 원시 빈도, 로그 빈도, 평활화, 문서 길이 정규화 등 서로 다른 변형을 쓴다. 그러므로 TF-IDF는 하나의 고정된 구현보다 국소 빈도와 전역 희소성을 결합하는 가중 방식의 계열로 이해하는 편이 정확하다.

문서와 질의 벡터의 코사인 유사도는 다음처럼 계산한다.

$$
\cos(\theta)=\frac{\vec q\cdot\vec d}{\lVert\vec q\rVert\lVert\vec d\rVert}
$$

TF-IDF처럼 성분이 음수가 아닌 벡터에서는 값이 보통 0과 1 사이에 있다. 값이 높다는 것은 가중된 어휘 분포가 비슷하다는 뜻이지, 시스템이 문장의 의미를 일반적으로 이해한다는 뜻은 아니다.

### 입력에서 순위까지

1. 문서 집합에서 사용할 어휘를 정하고 각 문서를 같은 차원의 벡터로 놓는다.
2. 문서 안의 용어 빈도와 문서 집합 전체의 문서 빈도를 결합해 가중치를 만든다.
3. 질의를 같은 공간의 벡터로 바꾸고 각 문서와 코사인 유사도를 계산한다.
4. 점수가 높은 문서부터 정렬하되, 점수는 가중 어휘 중첩을 나타낸다는 범위 안에서 해석한다.

## 3단계 — 기술과 근거

### 역사적 형성

이 역사는 한 번의 1968년 발명으로 압축할 수 없다. [[제라드 솔턴]]의 1968년 저서는 자동 정보 조직과 SMART 연구를 체계화했다. [[캐런 스파크 존스]]는 1972년에 문서 집합 빈도에 따라 용어 특이성을 가중하는 통계적 원리를 제시했다. 오늘날 고전으로 인용되는 솔턴·Anita Wong·Chung-Shu Yang의 벡터 공간 모델 논문은 1975년에 출판됐다.

### 검색에서의 성과와 한계

벡터 표현은 부분 일치와 관련성 순위화를 자연스럽게 만들었다. SMART 연구에서는 여러 용어 가중 방식, 문서 정규화, 질의 수정과 관련성 피드백을 시험 컬렉션에서 비교했다. 이 실험 중심 전통은 검색 모델을 고정 규칙이 아니라 측정하고 개선할 대상으로 만들었다. TF-IDF 벡터는 이후 문서 군집화·분류의 [[특징 공학|특징]]으로도 널리 사용됐다.

희소 용어 벡터에는 명확한 한계가 있다.

- `car`와 `automobile`처럼 뜻은 비슷하지만 표면 용어가 겹치지 않으면 유사도가 낮을 수 있다.
- `bank`처럼 한 단어가 여러 뜻을 가지면 서로 다른 주제의 문서가 불필요하게 가까워질 수 있다.
- 단어 주머니 표현은 어순과 통사 관계를 대부분 버린다.
- IDF는 특정 문서 집합에 의존하므로 말뭉치가 바뀌면 같은 용어의 가중치도 달라진다.

현대 밀집 검색은 신경망이 학습한 임베딩으로 어휘 불일치를 줄이려 한다. 그러나 희귀 고유명사나 정확한 코드처럼 표면 일치가 중요한 질의에서는 희소 검색이 여전히 강하다. 그래서 실제 검색 증강 생성과 검색 시스템은 희소·밀집 신호를 함께 사용하기도 한다.

## 검증과 한계

### 검증 정정

#### 확인된 사실과 연대

- raw는 벡터 공간 모델과 TF-IDF가 솔턴 연구진에 의해 1968년에 함께 정식화됐다고 서술한다. 1968년 솔턴 저서, 1972년 스파크 존스 논문, 1975년 벡터 공간 모델 논문을 구분해야 한다.
- raw의 “1971년 SMART가 인간 색인가와 맞먹었다”는 문장은 비교 대상·시험 컬렉션·평가지표의 locator가 없어 일반적 사실로 채택하지 않았다.
- raw의 코사인 유사도 범위 `-1`에서 `1`은 일반 벡터에는 맞지만, 음수가 없는 표준 TF-IDF 벡터의 실용 범위는 `0`에서 `1`이다.

#### 합성 해석의 경계

- 서로 다른 용어를 쓰는 문서도 자동으로 비슷한 방향을 갖는다는 설명은 과장이다. 고전적 TF-IDF는 동의어 지식이나 질의 확장이 없으면 어휘가 겹치지 않는 문서를 직접 연결하지 못한다.
- TF-IDF가 기계에 “첫 진정한 의미 판별 능력”을 주었다는 표현은 가중 어휘 중첩에 따른 관련성 순위화로 한정했다.

#### 후대 평가와 계보

- 단어 임베딩·트랜스포머 어텐션을 TF-IDF의 직접 계승으로 단정하지 않는다. 벡터와 가중치를 사용한다는 넓은 구조적 공통점은 있지만 표현의 학습 방식과 계산 목적은 다르다.

### 적용 범위와 남은 한계

TF-IDF와 코사인 유사도는 주어진 문서 집합의 가중 어휘 분포를 비교한다. 동의어, 다의어, 어순, 통사 관계를 별도 표현 없이 해결하지 못하며, 말뭉치가 바뀌면 IDF도 다시 계산해야 한다.

## 학습 확인

### 확인 질문

1. TF-IDF는 한 문서 안의 빈도와 문서 집합 전체의 빈도를 어떻게 함께 사용한다?
2. 문서와 질의가 순위 점수로 이어지는 네 단계는 무엇인가?
3. 코사인 유사도가 높아도 일반적인 의미 이해를 보장하지 않는 이유는 무엇인가?

### 다음 문서

- [[벡터 공간 모델]] — 문서와 질의를 같은 좌표계에 두는 표현 원리를 더 자세히 본다.
- [[BM25]] — 계수 기반 가중치에서 빈도 포화와 길이 보정을 포함한 확률적 검색 점수로 진행한다.

## 출처

- Gerard Salton, [Automatic Information Organization and Retrieval](https://books.google.com/books?id=G6whAAAAMAAJ), 1968, chapter 4.
- Karen Spärck Jones, [A Statistical Interpretation of Term Specificity and Its Application in Retrieval](https://doi.org/10.1108/eb026526), 1972, pp. 11–21.
- Gerard Salton, Anita Wong, Chung-Shu Yang, [A Vector Space Model for Automatic Indexing](https://doi.org/10.1145/361219.361220), 1975, pp. 613–620.
- Gerard Salton, Christopher Buckley, [Term-Weighting Approaches in Automatic Text Retrieval](https://doi.org/10.1016/0306-4573(88)90021-0), 1988, pp. 513–523.
- 프로젝트 번역·검토 출발 자료: [Vector Space Model & TF-IDF Foundation of Modern Information Retrieval & Semantic Search](https://mbrenndoerfer.com/writing/vector-space-model-tfidf-information-retrieval-semantic-search-history)
- 프로젝트 보존 자료: `raw/010_Vector Space Model & TF-IDF Foundation of Modern Information Retrieval & Semantic Search.ko.md`, `raw/010_Vector Space Model & TF-IDF Foundation of Modern Information Retrieval & Semantic Search.commentary.ko.md`.

## 관련 항목

- [[제라드 솔턴]]
- [[캐런 스파크 존스]]
- [[벡터 공간 모델]]
- [[TF-IDF]]
- [[코사인 유사도]]
- [[특징 공학]]
- [[대규모 언어 모델]]
