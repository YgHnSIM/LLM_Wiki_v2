---
schema_version: 2
id: source.065
page_type: source
title: BERT 기반 passage 재순위화
aliases:
  - 065_BERT for Information Retrieval Transformer-Based Ranking and Semantic Search
  - Passage Re-ranking with BERT
  - BERT for Information Retrieval
tags:
  - type/source
  - domain/ai
  - domain/computer-science
  - domain/nlp
  - domain/machine-learning
created: '2026-07-21'
updated: '2026-07-21'
lifecycle: active
verification: verified
artifacts:
  - 'raw/065_BERT for Information Retrieval Transformer-Based Ranking and Semantic Search.ko.md'
  - 'raw/065_BERT for Information Retrieval Transformer-Based Ranking and Semantic Search.commentary.ko.md'
evidence:
  - source_id: bert-2019
    locator: '§3과 Figure 1의 문장쌍 결합 입력·[CLS] sequence classification·전체 미세조정, Appendix A.2의 최대 512 WordPiece 입력'
    relation: contextualizes
  - source_id: nogueira-cho-2019-bert-reranking
    locator: 'arXiv:1901.04085v5, §§2–3.3와 Eq. 1·Table 1의 BM25 top-1,000 후보·query 64/전체 512 token 제한·[CLS] pointwise relevance 분류·MS MARCO MRR@10·TREC-CAR MAP'
    relation: supports
  - source_id: macavaney-et-al-2019-cedr
    locator: 'SIGIR 2019, pp. 1101–1104, §§1–3와 Table 1·Figure 2의 contextual token similarity·joint [CLS]·긴 문서 처리·실행 비용'
    relation: supplements
  - source_id: google-search-2019-bert
    locator: '2019-10-25, “Applying BERT models to Search”·“Cracking your queries”의 ranking·featured snippets 적용과 미국 영어 검색 10건 중 1건이라는 공개 범위'
    relation: contextualizes
related:
  - source.073
  - concept.다중-벡터-검색
  - concept.교차-인코더-재순위화
  - concept.bert
  - concept.신경-정보-검색
  - concept.bm25
  - source.052
  - source.058
  - analysis.검색-근거-독해-답
---
# BERT 기반 passage 재순위화

> [!note] 학습 안내
> **난이도:** 중급<br>
> **선수 지식:** [[BERT]], [[신경 정보 검색]], [[BM25]]<br>
> **읽고 나면:** BERT가 검색 후보를 공동 부호화해 다시 정렬하는 방식과 first-stage retrieval·dual encoder·encoder–decoder cross-attention의 차이를 설명할 수 있다.

## 1단계 — 먼저 잡을 핵심

### 무엇이 실제로 바뀌었는가

2019년 Nogueira와 Cho의 대표 실험은 [[BERT]]를 전체 컬렉션 검색기로 쓰지 않았다. [[BM25]]가 먼저 상위 1,000개 passage를 가져오면, BERT가 질의와 후보 하나를 결합 입력으로 읽고 관련성 확률을 계산해 **후보 안의 순서만 다시 매겼다**. 이 [[교차 인코더 재순위화]]는 사전학습 문맥 표현을 검색 관련성 판단으로 전이한 간단하고 강한 방법이었다.

핵심 입력은 다음과 같다.

```text
[CLS] query [SEP] candidate passage [SEP]
```

질의 token과 passage token은 같은 encoder의 양방향 self-attention 안에서 서로 조건화된다. 검색 문헌에서 이를 cross-encoder 또는 교차 상호작용이라고 부르지만, Transformer encoder의 출력에 decoder가 attend하는 별도 **encoder–decoder cross-attention 층**을 뜻하지는 않는다.

### 핵심 문장

- 최종 점수는 attention weight가 아니라 마지막 `[CLS]` 은닉 벡터에 선형 분류층을 적용해 얻은 관련성 logit·확률이다.
- 대표 실험의 손실은 후보를 하나씩 관련·비관련으로 판정한 pointwise binary cross-entropy였다. pairwise·listwise loss는 가능한 후속 선택이지 이 실험의 방법이 아니다.
- 질의는 최대 64 token, 특수 token을 포함한 결합 입력은 최대 512 WordPiece token으로 잘렸다.
- reranker는 첫 단계가 놓친 문서를 되살릴 수 없다. candidate recall과 후보 안의 정렬 품질은 다른 실패 경계다.

## 2단계 — 작동 원리

### BM25 후보에서 BERT 순위까지

처리 흐름은 네 단계로 나눌 수 있다.

1. BM25가 전체 컬렉션에서 질의별 상위 1,000개 passage를 검색한다.
2. 각 후보를 질의와 결합해 `[CLS] q [SEP] d_i [SEP]`를 만든다.
3. BERT-large가 결합 sequence를 부호화하고 마지막 `[CLS]` 표현 $h_i$를 만든다.
4. 학습된 선형층과 softmax가 관련성 확률 $s_i$를 내며, 후보를 $s_i$의 내림차순으로 다시 정렬한다.

관련·비관련 후보 집합을 각각 $J_{pos}$, $J_{neg}$라고 하면 논문의 학습 손실은 다음 pointwise 형태다.

$$
L=-\sum_{j\in J_{pos}}\log s_j
  -\sum_{j\in J_{neg}}\log(1-s_j).
$$

한 질의의 후보를 동시에 비교하는 순위 손실이 아니라 각 쌍의 binary classification loss를 합한다. 평가 때는 후보별 확률을 서로 비교해 순서를 만든다. 분류 확률이라고 해도 서로 다른 질의 사이에서 자동으로 calibration된 신뢰도라는 뜻은 아니다.

### 정밀함과 재사용 비용

질의와 문서를 따로 부호화하는 dual encoder는 문서 vector를 미리 계산해 색인할 수 있다. 반면 BERT cross-encoder의 문서 표현은 함께 들어온 질의에 따라 달라진다. 후보별로 전체 encoder를 다시 실행하므로 token 수준의 세밀한 조건화를 얻는 대신 비용이 후보 수에 거의 비례한다.

이 trade-off 때문에 두 모델의 역할을 같은 것으로 비교하면 안 된다.

| 단계 | 대표 방식 | 가능한 일 | 직접 해결하지 못하는 일 |
|---|---|---|---|
| first-stage retrieval | BM25·독립 vector 검색 | 큰 컬렉션에서 후보 집합 생성 | 모든 후보의 깊은 공동 상호작용 |
| second-stage reranking | BERT cross-encoder | 제한된 후보 안의 세밀한 관련성 판정 | 후보 밖 문서 복구 |
| reader·generator | span 추출·답 생성 | 검색 근거에서 답 구성 | 앞 단계가 누락한 근거 보장 |

## 3단계 — 기술과 근거

### Nogueira와 Cho의 실험 범위

직접 평가는 MS MARCO passage ranking과 TREC-CAR 두 자료에서 이뤄졌다. MS MARCO의 개발·평가 MRR@10과 TREC-CAR의 MAP는 다음과 같다. 표의 값은 논문 표기를 0–1 범위로 바꿨다.

| 모델 | MS MARCO dev MRR@10 | MS MARCO eval MRR@10 | TREC-CAR MAP |
|---|---:|---:|---:|
| BM25, Lucene 미조정 | 0.167 | 0.165 | 0.123 |
| BM25, Anserini 조정 | — | — | 0.153 |
| 이전 MS MARCO 최고 IRNet | 0.278 | 0.281 | — |
| BERT-base | 0.347 | — | 0.310 |
| BERT-large | 0.365 | 0.358 | 0.335 |

평가 leaderboard의 0.281에서 0.358로 오른 차이가 논문 초록의 **MRR@10 27% 상대 개선**이다. 이는 당시 제공된 후보·자료·평가 조건의 결과이지 모든 검색 질의에서 BM25보다 27% 정확하다는 보편 수치가 아니다.

훈련은 BERT-large, batch 128, 100,000 step으로 약 1,280만 query–passage pair를 보았고 TPU v3-8에서 약 30시간 걸렸다고 보고됐다. 이 수치는 연구 설정의 재현 조건이며 현대 하드웨어 latency나 production 비용을 직접 나타내지 않는다.

### BERT 이전 interaction과 CEDR의 다른 경로

064 raw는 2016년 이후 neural IR이 dual encoder 중심이었다고 설명하지만, Nogueira와 Cho의 관련 연구에는 DRMM·KNRM·Co-PACRR·Duet 같은 interaction model도 이미 등장한다. BERT가 질의–문서 상호작용 자체를 처음 발명한 것이 아니다. 새로웠던 점은 대규모 사전학습 encoder를 간단한 랭킹 미세조정에 옮겨 강한 결과를 낸 데 있다.

같은 해 CEDR는 `[CLS]` 분류 점수만 쓰는 대신 BERT의 layer별 contextual token representation을 PACRR·KNRM·DRMM의 similarity matrix와 결합했다. Robust04와 WebTrack 조건에서 이 결합을 비교하고, 긴 문서를 BERT 입력에 맞춰 자르는 문제와 정적 GloVe보다 훨씬 느린 실행 비용도 분석했다. 따라서 2019년의 BERT IR은 하나의 고정 architecture가 아니라 공동 부호화·기존 interaction ranker 결합·passage aggregation을 함께 탐색한 연구 흐름이었다.

### Google 공지가 확인한 것과 공개하지 않은 것

Google은 2019년 10월 공식 글에서 BERT model을 Search의 ranking과 featured snippets에 적용했고, 당시 **미국의 영어 검색 10건 중 1건**을 더 잘 이해하는 데 도움을 준다고 밝혔다. 전치사와 문맥이 중요한 query 예와 Cloud TPU serving도 공개했다.

그러나 그 글은 후보 생성 방식, 후보 수, `[CLS]` 입력 형식, pointwise loss, Nogueira식 BM25→BERT 단계나 내부 offline metric을 공개하지 않았다. 학술 reranker와 Google Search의 제품 적용은 같은 BERT 계열이라는 사실까지만 직접 연결할 수 있다.

## 검증과 한계

### raw 설명의 검증 정정

- **2016년부터 dual encoder가 neural IR을 지배했다**: 독립 표현 모델과 DRMM·KNRM·PACRR·Duet 같은 interaction model이 공존했다.
- **BERT가 cross-attention을 검색에 도입했다**: 결합 query–passage의 self-attention이며 encoder–decoder의 별도 cross-attention과 다르다. 검색 상호작용 모델도 선행했다.
- **`[CLS]`가 곧 relevance score이고 attention weight가 관련 passage를 고른다**: `[CLS]` vector에 출력층을 적용해 점수를 만들며 attention weight는 최종 score가 아니다.
- **대표 학습은 pairwise·listwise ranking loss다**: Nogueira와 Cho는 pointwise binary cross-entropy를 썼다.
- **BERT가 수백만 문서를 직접 검색한다**: 직접 실험은 BM25 top-1,000 reranking이며 후보 밖 문서는 복구하지 못한다.
- **BERT는 문서를 자연 길이 그대로 읽는다**: 결합 입력은 최대 512 WordPiece token이고 긴 문서는 절단·passage 분할·집계가 필요하다.
- **100–1,000개 후보가 보편 표준이다**: 후보 깊이는 자료·목표 latency·모델마다 달라지는 설정이다.
- **Google의 10건 중 1건이 Nogueira식 cross-encoder 배포를 뜻한다**: 공식 공지는 ranking 적용 범위만 말하고 내부 architecture를 공개하지 않았다.
- **전자상거래·기업·학술·법률·추천에서 광범위한 production 효과가 입증됐다**: 이 초기 논문과 Google 공지만으로 각 분야 배포·효과를 확인할 수 없다.
- **ColBERT가 full cross-attention을 유지한 채 싸게 만들었다**: late interaction은 질의와 문서를 독립적으로 문맥화한 뒤 token vector를 비교하는 다른 계산 경계다.

### 남는 한계

cross-encoder는 후보마다 전체 model을 실행하므로 latency·memory·energy가 늘고, 첫 단계 recall의 상한을 넘지 못한다. truncation과 passage 분할은 긴 문서의 떨어진 근거를 갈라놓을 수 있다. pointwise relevance score는 training negative와 domain에 의존하며, attention visualization만으로 판단의 인과적 설명을 보장하지 않는다.

MS MARCO의 question-like query와 TREC-CAR passage 결과를 웹 문서·상품·법률·학술 검색 전체로 일반화할 수도 없다. 다른 domain에서는 문서 구조, relevance 기준, lexical exact match와 supervision이 달라지므로 후보 생성과 reranking을 같은 corpus·candidate set·metric에서 다시 평가해야 한다.

## 학습 확인

### 확인 질문

1. BERT reranker가 질의와 passage를 함께 읽는 방식은 encoder–decoder cross-attention과 어떻게 다른가?
2. `[CLS]` 표현, 분류 logit, attention weight는 각각 어떤 값인가?
3. BM25 후보 recall이 낮을 때 강한 cross-encoder도 문제를 해결할 수 없는 이유는 무엇인가?

### 다음 문서

- [[교차 인코더 재순위화]] — 공동 부호화의 계산 경계와 dual encoder 대비를 개념으로 정리한다.
- [[검색은 근거를 찾고 독해는 답을 찾는다]] — 후보 누락, 재순위 실패와 reader 실패를 단계별로 진단한다.

## 출처

- Rodrigo Nogueira·Kyunghyun Cho, [Passage Re-ranking with BERT](https://arxiv.org/abs/1901.04085), 2019, §§2–3.3, Eq. 1, Table 1.
- Jacob Devlin 외, [BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding](https://aclanthology.org/N19-1423/), NAACL 2019, §3과 Appendix A.2.
- Sean MacAvaney 외, [CEDR: Contextualized Embeddings for Document Ranking](https://arxiv.org/abs/1904.07094), SIGIR 2019, pp. 1101–1104.
- Pandu Nayak, [Understanding searches better than ever before](https://blog.google/products-and-platforms/products/search/search-language-understanding-bert/), Google, 2019-10-25.
- 프로젝트 번역·검토 출발 자료: [BERT for Information Retrieval: Transformer-Based Ranking and Semantic Search](https://mbrenndoerfer.com/writing/bert-information-retrieval-transformer-ranking-semantic-search)
- 프로젝트 보존 자료: `raw/065_BERT for Information Retrieval Transformer-Based Ranking and Semantic Search.ko.md`, `raw/065_BERT for Information Retrieval Transformer-Based Ranking and Semantic Search.commentary.ko.md`.

## 관련 항목

- [[교차 인코더 재순위화]]
- [[다중 벡터 검색]]
- [[073_ColBERT와 다중 벡터 검색]]
- [[BERT]]
- [[신경 정보 검색]]
- [[BM25]]
- [[052_신경 정보 검색과 의미 대응]]
- [[058_BERT의 마스크드 양방향 사전 학습]]
- [[검색은 근거를 찾고 독해는 답을 찾는다]]
