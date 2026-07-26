---
schema_version: 3
id: source.073
page_type: source
title: ColBERT와 다중 벡터 검색
aliases:
  - 073_Multi-Vector Retrievers Fine-Grained Token-Level Matching for Neural Information Retrieval
  - Multi-Vector Retrievers Fine-Grained Token-Level Matching for Neural Information Retrieval
  - Multi-Vector Retrievers
  - ColBERT late interaction
tags:
  - type/source
  - domain/ai
  - domain/computer-science
  - domain/nlp
  - domain/machine-learning
created: '2026-07-21'
updated: '2026-07-21'
editorial_status: active
review:
  evidence_coverage: verified
  content_mode: descriptive
artifacts:
  - raw/073_Multi-Vector Retrievers Fine-Grained Token-Level Matching for Neural Information Retrieval.ko.md
  - raw/073_Multi-Vector Retrievers Fine-Grained Token-Level Matching for Neural Information Retrieval.commentary.ko.md
evidence:
  - source_id: khattab-zaharia-2020-colbert
    locator: 'SIGIR 2020, §§3.2–3.6·4.2–4.5, Eqs. 1–3와 Tables 1–4의 독립 BERT 부호화·MaxSim·FAISS 후보 검색·MS MARCO/TREC CAR 평가·색인 비용'
    relation: supports
  - source_id: khattab-et-al-2021-colbert-qa
    locator: 'TACL 9, pp. 929–944, §§2–5·Table 1·각주 4의 ColBERT-QA supervision·single-vector 재순위화와 full-corpus retrieval·Natural Questions/TriviaQA/SQuAD 평가'
    relation: supplements
  - source_id: khattab-et-al-2021-baleen
    locator: 'NeurIPS 2021, §§1–5와 Tables 2–5의 focused late interaction·condensed retrieval·HotPotQA와 HoVer 다중 홉 평가'
    relation: supplements
  - source_id: santhanam-et-al-2022-colbertv2
    locator: 'NAACL 2022, §§3.1–3.3·5.3과 Appendix B의 residual compression·denoised supervision·6–10배 색인 축소와 압축 결과'
    relation: supplements
relations:
  - target: source.065
    kind: related
  - target: source.068
    kind: related
  - target: concept.교차-인코더-재순위화
    kind: related
  - target: concept.검색-증강-생성
    kind: related
  - target: concept.다중-홉-검색
    kind: related
learning:
  difficulty:
    entry: intermediate
    target: intermediate
  prerequisites:
    - target: concept.신경-정보-검색
    - target: concept.bert
  assumed_knowledge: 없음
  outcomes:
    - '2025년 회고 원문과 SIGIR 2020 ColBERT의 직접 결과를 구분하고, 후기 상호작용의 품질·색인·지연 장부와 2021년 후속 응용 범위를 설명할 수 있다.'
  next:
    - target: concept.다중-벡터-검색
      reason: 다중 벡터 검색 — 후기 상호작용을 단일 벡터·교차 인코더와 비교하는 재사용 가능한 개념 장부다.
    - target: analysis.검색-근거-독해-답
      reason: 검색은 근거를 찾고 독해는 답을 찾는다 — 검색 후보·재순위화·reader·generator의 오류가 어떻게 분리되는지 이어서 살핀다.
---
# ColBERT와 다중 벡터 검색

> [!note] 학습 안내
> **난이도:** 중급<br>
> **선수 지식:** [[concept.신경-정보-검색|신경 정보 검색]], [[concept.bert|BERT]]<br>
> **읽고 나면:** 2025년 회고 원문과 SIGIR 2020 ColBERT의 직접 결과를 구분하고, 후기 상호작용의 품질·색인·지연 장부와 2021년 후속 응용 범위를 설명할 수 있다.

## 1단계 — 먼저 잡을 핵심

### 핵심 문장

ColBERT는 질의와 문서를 각각 문맥화된 벡터 **집합**으로 독립 부호화하고, 각 질의 벡터가 가장 가까운 문서 벡터를 고르는 MaxSim 값을 합한다. 문서 표현을 미리 계산하면서도 단일 벡터보다 세밀한 대응을 점수에 남기는 이 구조를 후기 상호작용(late interaction)이라 부른다.

프로젝트의 원문은 Michael Brenndoerfer가 2025년 공개한 회고 글이다. 원문은 다중 벡터 검색을 2021년의 발전으로 놓고 ColBERT의 아이디어·응용·영향을 설명한다. 그러나 원 ColBERT는 Stanford의 Omar Khattab과 Matei Zaharia가 2020년 4월 공개하고 SIGIR 2020에 발표한 연구다. 2021년에는 ColBERT-QA와 Baleen이라는 별도 후속 시스템이 개방형·다중 홉 검색으로 적용 범위를 넓혔다.

### 이 문서가 바로잡는 경계

원문은 다중 벡터 검색을 희소 검색의 lexical precision과 밀집 검색의 semantic matching을 결합한 hybrid로 묘사한다. 그러나 ColBERT의 MaxSim은 BM25 점수와 dense score를 합친 것이 아니라 문맥화된 dense token vector 사이의 부드러운 유사도다. 특정 문자열, Boolean 필수 조건, phrase 순서나 인접성을 보장하지 않는다.

또한 원문은 원 ColBERT의 실험 범위를 장문·개체 검색·사실 검증·대화형 검색·설명 가능성까지 넓힌다. SIGIR 2020 실험은 영어 MS MARCO passage와 TREC CAR에 한정됐다. OpenQA와 claim verification은 2021년 후속 시스템의 별도 근거로만 연결한다.

## 2단계 — 작동 원리

### 독립 부호화 뒤에 상호작용한다

질의 $q$와 문서 $d$의 표현은 다음과 같다.

$$
E_q=f_Q(q)\in\mathbb{R}^{N_q\times m},\qquad
E_d=f_D(d)\in\mathbb{R}^{N_d\times m}
$$

문서 행렬 $E_d$는 질의가 오기 전에 계산해 색인할 수 있다. 질의가 들어오면 다음 점수를 계산한다.

$$
S(q,d)=\sum_{i=1}^{N_q}\max_{j=1}^{N_d}
E_{q,i}E_{d,j}^{\mathsf T}
$$

각 벡터는 L2 정규화돼 내적이 코사인 유사도와 같다. 각 질의 embedding은 가장 높은 유사도의 문서 embedding 하나를 선택한다. 여러 질의 embedding이 같은 문서 embedding을 고를 수 있고 위치·순서는 직접 보존하지 않는다.

### ‘토큰마다 벡터 하나’라는 설명의 제한

문맥화된 token 수준 표현이 핵심이지만 벡터 수가 원문 token 수와 항상 같지는 않다. MS MARCO 설정의 질의는 짧으면 `[MASK]`로 채우고 길면 잘라 $N_q=32$로 고정했으며, 차원은 $m=128$이었다. 문서에서는 punctuation embedding을 제거했다. 질의·문서 encoder는 BERT weight를 공유하고 `[Q]`·`[D]` marker로 역할을 구분했다.

MaxSim에는 별도 학습 parameter가 없다. 전체 encoder는 $(q,d^+,d^-)$ triple에서 positive passage의 점수를 높이는 pairwise softmax cross-entropy로 미세조정했다. 이 결과는 BERT 표현만이 아니라 positive·negative 구성과 ranking supervision의 산물이다.

### 전체 문서를 완전 비교하지 않는다

End-to-end 검색은 각 질의 벡터로 FAISS IVFPQ 후보를 찾고, 벡터별 후보 문서 ID를 합친 다음, 이 제한된 후보에 정확한 MaxSim을 다시 계산한다. 첫 ANN 단계가 relevant passage를 빠뜨리면 최종 MaxSim도 복구할 수 없다.

완전 MaxSim 한 번의 계산은 $O(N_qN_dm)$이다. 원문의 10-token 질의와 1,000-token 문서 예시가 10,000개 pair score를 만든다는 산술은 맞다. 그러나 $N_q$가 고정되면 문서 길이 $N_d$에 대해 **선형**이며, “문서 길이에 대해 제곱”이라는 원문 설명은 틀렸다.

## 3단계 — 기술과 근거

### 원 ColBERT의 연도·저자·평가 위치

원 논문 *ColBERT: Efficient and Effective Passage Search via Contextualized Late Interaction over BERT*는 arXiv v1이 2020-04-27이고 SIGIR 2020 pp. 39–48에 실렸다. 저자 Omar Khattab과 Matei Zaharia는 둘 다 Stanford University 소속이었다. 원문의 Carnegie Mellon University·University of Waterloo 귀속은 사실 오류다.

교차 인코더보다 나중에 나온 구조라는 점도 중요하다. BERT 기반 passage 재순위화는 2019년에 이미 질의와 후보를 한 sequence로 공동 부호화했다. ColBERT의 기여는 cross-encoder를 낳은 것이 아니라, 풍부한 상호작용과 문서 표현 사전 계산 사이에 새로운 경계를 만든 것이다.

### MS MARCO top-1,000 재순위화

SIGIR 2020 Table 1은 다음 결과를 보고했다.

| 모델 | Dev MRR@10 | Eval MRR@10 | 질의 지연 | FLOPs/query |
| --- | ---: | ---: | ---: | ---: |
| 저자 재학습 BERT-base | 36.0 | — | 10,700ms | 97T |
| BERT-large | 36.5 | 35.9 | 32,900ms | 340T |
| ColBERT | 34.9 | 34.9 | 61ms | 7B |

ColBERT의 정확도가 BERT-large를 넘지는 않았다. 직접 지지되는 결론은 당시 조건에서 BERT 계열과 경쟁적인 재순위화 품질을 훨씬 낮은 질의당 연산과 지연으로 얻었다는 것이다. 지연 배수는 하드웨어·batch·구현에 묶인다.

### 880만 passage end-to-end 검색

Table 2의 MS MARCO 검색 결과는 다음과 같다.

| 모델 | Dev MRR@10 | Local eval | 지연 | R@50 | R@200 | R@1000 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Anserini BM25 | 18.7 | 19.5 | 62ms | 59.2 | 73.8 | 85.7 |
| docTTTTTquery | 27.7 | 28.4 | 87ms | 75.6 | 86.9 | 94.7 |
| ColBERT end-to-end | 36.0 | 36.7 | 458ms | 82.9 | 92.3 | 96.8 |

ColBERT는 이 protocol에서 더 높은 MRR과 recall을 보였지만 BM25보다 질의 지연이 길었다. 품질·속도·색인 크기 가운데 한 축만으로 우월성을 정의하지 않는다. TREC CAR의 BM25+ColBERT MAP 31.3은 BM25+BERT-base 31.0보다 높고 BM25+BERT-large 33.5보다 낮았다.

### 색인 크기와 압축

원 논문의 128차원 float32 cosine 색인은 286GiB, MRR@10은 34.9였다. 24차원 float16은 27GiB로 줄었지만 MRR@10은 33.9였다. End-to-end L2 색인은 154GiB였다. 문서 부호화는 4개 Titan V로 약 3시간이 걸렸다.

ColBERTv2는 residual compression과 denoised supervision으로 후기 상호작용 색인을 6–10배 줄였다고 보고했다. 2-bit 압축이 일부 조건에서 품질을 거의 유지한 결과도 있으므로 “압축은 반드시 품질을 떨어뜨린다”는 원문의 일반화는 성립하지 않는다. 다만 더 강한 distillation·hard-negative mining은 원형보다 복잡한 학습 recipe를 요구한다.

### 2021년 후속 적용

ColBERT-QA는 2020년 공개되고 2021년 TACL에 게재되면서 Natural Questions·TriviaQA·SQuAD의 개방 영역 검색을 평가했다. Table 1의 직접 비교에서 ColBERT-QA1과 single-vector ablation은 같은 BM25 positive·negative supervision을 사용했고, reader가 개입하지 않는 Success@20에서 ColBERT-QA1이 더 높았다. 다만 각주 4에 따르면 single-vector는 BM25 top-1,000을 재순위화하고 ColBERT-QA는 전체 corpus를 검색했으며, QA2·QA3은 supervision도 추가로 달랐다. 따라서 표 전체의 차이를 다중 벡터 구조 하나의 인과 효과로 환원하지 않는다.

Baleen은 2021년 NeurIPS에서 focused late interaction과 condensed retrieval을 사용해 HotPotQA 두 홉 질의응답과 HoVer 다중 홉 claim verification을 평가했다. 원문이 말하는 사실 검증 응용은 이 별도 시스템의 범위로 한정해야 한다. 원 ColBERT가 2020년에 모든 다중 문서 reasoning을 직접 검증한 것은 아니다.

## 검증과 한계

### raw 설명의 검증 정정

- **ColBERT는 2021년의 발전이다:** 원 논문은 SIGIR 2020이다. 2021년에는 ColBERT-QA·Baleen 후속작이 나왔다.
- **CMU와 Waterloo 연구자가 만들었다:** Khattab과 Zaharia는 당시 Stanford 소속이었다.
- **희소 검색의 exact match와 밀집 검색의 의미를 하나의 hybrid score로 합쳤다:** ColBERT는 dense contextual multi-vector MaxSim이다. BM25와 결합할 수 있지만 점수 함수 자체가 희소·밀집 합은 아니다.
- **각 질의 term이 정확한 문서 term을 찾는다:** 각 질의 embedding이 가장 가까운 문서 embedding을 찾는다. 정확한 문자열·phrase·위치 제약은 없다.
- **단일 벡터에서는 모든 term이 똑같이 기여한다:** attention과 learned pooling은 정보를 비균등하게 압축할 수 있다. 다만 최종 점수를 token별 항으로 명시적으로 분해하지 않는다.
- **문서 길이에 따라 계산이 제곱으로 증가한다:** $O(N_qN_dm)$이며 고정 질의 길이에서는 문서 길이에 선형이다.
- **긴 문서의 흩어진 근거를 검증했다:** 원 실험은 passage retrieval이다. 장문 전체와 여러 passage의 증거 결합은 직접 평가하지 않았다.
- **개체 검색·기술 문서·대화형 검색·typo 견고성을 직접 보였다:** SIGIR 2020의 직접 평가는 MS MARCO·TREC CAR다.
- **Token alignment가 설명 가능성을 보장한다:** 어느 벡터 쌍이 점수에 기여했는지는 볼 수 있지만, 이것이 충실한 인과 설명이라는 실험은 없다.
- **ColBERT가 cross-encoder 재순위화에 영향을 주었다:** BERT cross-encoder는 2019년에 선행했다. 시간 방향이 거꾸로다.
- **다중 벡터 검색은 실제 시스템의 표준이 됐다:** 공식 논문들은 특정 model과 benchmark를 평가한다. 광범위한 production 채택은 별도 조사 없이는 확정하지 않는다.

### 평가·운영 한계

원 ColBERT는 영어 passage 검색 두 자료에 한정됐다. MS MARCO는 한 질의당 알려진 positive가 적어 unlabelled relevant passage가 negative처럼 취급될 수 있다. 다른 언어·도메인·정확 문자열 질의로 자동 일반화하지 않는다.

ANN 후보 생성은 근사적이며 색인은 single-vector보다 크다. 질의 BERT 실행, 벡터별 ANN, 후보 MaxSim 재순위화가 모두 latency에 들어간다. 품질 비교에서는 supervision·negative·후보 집합·차원·정밀도·hardware를 함께 기록한다.

ColBERT-QA·Baleen·ColBERTv2는 원형의 후속 계보지만 각각 weak supervision, multi-hop pipeline, compression·distillation을 추가했다. 서로 다른 결과를 하나의 고정된 “다중 벡터 효과”로 합치지 않는다.

## 학습 확인

### 확인 질문

1. ColBERT가 문서 표현을 사전 계산하면서도 단일 벡터보다 세밀한 질의–문서 대응을 남기는 방법은 무엇인가?
2. MaxSim이 token 수준으로 작동해도 exact match와 phrase 순서를 보장하지 않는 이유는 무엇인가?
3. SIGIR 2020 ColBERT와 2021년 ColBERT-QA·Baleen의 실험 범위를 왜 나누어 기록해야 하는가?

### 다음 문서

- [[concept.다중-벡터-검색|다중 벡터 검색]] — 후기 상호작용을 단일 벡터·교차 인코더와 비교하는 재사용 가능한 개념 장부다.
- [[analysis.검색-근거-독해-답|검색은 근거를 찾고 독해는 답을 찾는다]] — 검색 후보·재순위화·reader·generator의 오류가 어떻게 분리되는지 이어서 살핀다.

## 출처

- Omar Khattab·Matei Zaharia, [ColBERT: Efficient and Effective Passage Search via Contextualized Late Interaction over BERT](https://arxiv.org/abs/2004.12832), SIGIR 2020, pp. 39–48, 특히 §§3.2–3.6·4.2–4.5와 Tables 1–4.
- Omar Khattab·Christopher Potts·Matei Zaharia, [Relevance-guided Supervision for OpenQA with ColBERT](https://aclanthology.org/2021.tacl-1.55/), TACL 9, 2021, pp. 929–944.
- Omar Khattab·Christopher Potts·Matei Zaharia, [Baleen: Robust Multi-Hop Reasoning at Scale via Condensed Retrieval](https://proceedings.neurips.cc/paper/2021/hash/e8b1cbd05f6e6a358a81dee52493dd06-Abstract.html), NeurIPS 2021.
- Keshav Santhanam 외, [ColBERTv2: Effective and Efficient Retrieval via Lightweight Late Interaction](https://aclanthology.org/2022.naacl-main.272/), NAACL 2022, pp. 3715–3734.
- 프로젝트 번역·검토 출발 자료: [Multi-Vector Retrievers: Fine-Grained Token-Level Matching for Neural Information Retrieval](https://mbrenndoerfer.com/writing/multi-vector-retrievers-fine-grained-token-level-matching-for-neural-information-retrieval)
- 프로젝트 보존 자료: `raw/073_Multi-Vector Retrievers Fine-Grained Token-Level Matching for Neural Information Retrieval.ko.md`, `raw/073_Multi-Vector Retrievers Fine-Grained Token-Level Matching for Neural Information Retrieval.commentary.ko.md`.

## 관련 항목

- [[concept.다중-벡터-검색|다중 벡터 검색]]
- [[analysis.검색-근거-독해-답|검색은 근거를 찾고 독해는 답을 찾는다]]
- [[concept.신경-정보-검색|신경 정보 검색]]
- [[concept.bert|BERT]]
- [[source.065|BERT 기반 passage 재순위화]]
- [[source.068|DPR과 검색 증강 생성]]
- [[concept.교차-인코더-재순위화|교차 인코더 재순위화]]
- [[concept.검색-증강-생성|검색 증강 생성]]
- [[concept.다중-홉-검색|다중 홉 검색]]
