---
schema_version: 2
id: concept.the-pile
page_type: concept
title: The Pile
aliases:
  - Pile dataset
  - EleutherAI The Pile
  - 더 파일
tags:
  - type/concept
  - domain/ai
  - domain/computer-science
  - domain/nlp
  - domain/machine-learning
created: '2026-07-21'
updated: '2026-07-21'
lifecycle: active
verification: verified
artifacts:
  - 'raw/074_The Pile Open-Source Training Dataset for Large Language Models.ko.md'
  - 'raw/074_The Pile Open-Source Training Dataset for Large Language Models.commentary.ko.md'
evidence:
  - source_id: gao-et-al-2020-pile
    locator: '초록, §§1–7, Tables 1·3–5와 Appendices C–D의 구성요소·가중치·BPB benchmark·40GB 비교·deduplication·language·bias·consent'
    relation: supports
  - source_id: biderman-et-al-2022-pile-datasheet
    locator: '초록과 PDF pp. 1·8–17의 component provenance·211,043,181 documents·processing·배포·저작권·PII·동의 문답'
    relation: supports
related:
  - source.074
  - source.063
  - source.066
  - source.067
  - concept.말뭉치-기반-학습
  - concept.언어-모델-스케일링-법칙
  - concept.대규모-언어-모델
  - concept.perplexity
  - analysis.데이터-품질과-분포-다양성은-같은-축인가
---
# The Pile

> [!note] 학습 안내
> **난이도:** 중급<br>
> **선수 지식:** [[말뭉치 기반 학습]], [[Perplexity]]<br>
> **읽고 나면:** The Pile의 component·epoch·effective size 장부를 읽고, deduplication·decontamination·data governance를 서로 다른 절차로 설명할 수 있다.

## 1단계 — 먼저 잡을 핵심

### 정의

The Pile은 EleutherAI가 대규모 언어 모델 학습과 교차 영역 평가를 위해 만든 영어 중심 텍스트 말뭉치다. 22개 component를 합쳐 825.18 GiB raw data를 구성했고, 품질·크기에 대한 큐레이터의 판단에 따라 component별 1–3 epochs를 배정해 약 1,254.20 GiB의 effective mixture를 만들었다.

이 이름을 하나의 균일한 파일이나 전부 같은 license의 자료로 이해하면 안 된다. Pile-CC·도서·논문·code·법률·forum·subtitle·email은 수집 경로, 처리, 문서 길이, 권리와 대표성이 다르다.

### 핵심 장부

| 항목 | 값·범위 | 읽을 때의 주의 |
|---|---|---|
| Raw size | 825.18 GiB | Token 수나 실제 반복 노출량이 아님 |
| Components | 22개 | 품질·domain·rights가 균일하지 않음 |
| §1의 신규·확장 LM datasets | 14개 | 새 출처 12개와 OWT2·BookCorpus2 확장판이며, Pile-CC는 별도 소개 |
| Effective size | 1,254.20 GiB | Epoch upsampling을 반영한 근사 노출량 |
| Documents | 211,043,181 unweighted | 개별 내용·PII·품질을 전수 검증했다는 뜻이 아님 |
| 주 언어 | English-focused | 비영어 자료가 완전히 배제되거나 세계 언어를 대표하지 않음 |

## 2단계 — 작동 원리

### Raw component를 가중 학습 분포로 바꾼다

Component $i$의 raw size를 $B_i$, 한 Pile epoch에서의 반복 횟수를 $e_i$라 하면 effective-size 장부는 다음과 같다.

$$
B_i^{\mathrm{effective}}\approx B_i e_i.
$$

Wikipedia는 $e_i=3$, PubMed Central·OpenWebText2·arXiv는 $e_i=2$, Books3·FreeLaw는 $e_i=1.5$다. 작은 고품질 자료를 반복하면 raw 크기보다 학습 비중이 커진다. 이 선택은 단순한 저장 최적화가 아니라 모델이 어떤 분포를 더 자주 보는지 정하는 modeling decision이다.

### 세 가지 ‘겹침 제거’를 구분한다

1. **Component deduplication:** Pile-CC와 OpenWebText2 내부의 비슷한 문서를 MinHashLSH로 줄였다.
2. **Split leakage control:** Validation·test를 떼고 held-out data와 verbatim인 training 요소를 제거했다.
3. **Benchmark decontamination:** 1.3B 비교 실험에서는 WikiText·LAMBADA 등 평가 세트와 13-gram이 겹치는 training instance를 제거했다.

첫째가 Pile 전체에 적용되지 않았으므로 component 사이 또는 다른 component 내부의 중복이 남을 수 있다. 둘째도 논문이 split 사이 동일 문서 가능성을 경고했다. 셋째는 비교 실험용 40GB 표본 처리이며 배포본 전체에 대한 보증이 아니다.

### 학습 말뭉치와 benchmark를 함께 제공한다

The Pile은 validation·test component에서 모델의 교차 영역 language-modeling loss를 측정하도록 설계됐다. Tokenizer가 다른 모델을 비교하기 위해 bits per UTF-8 encoded byte(BPB)를 제안했다.

$$
\mathrm{BPB}=\frac{L_T}{L_B}\frac{\ell}{\ln 2},
$$

여기서 $L_T$는 token 길이, $L_B$는 UTF-8 byte 길이, $\ell$은 평균 negative log-likelihood다. BPB는 tokenization 차이를 줄이지만, 서로 다른 문서 entropy·training exposure·평가 오염·model compute까지 없애지는 않는다.

## 3단계 — 기술과 근거

### Controlled comparison이 분리한 것과 남긴 것

Gao 등은 같은 1.3B architecture와 약 40GB data 조건에서 Pile·CC-100 English·Raw Common Crawl을 비교했다. Pile model은 Pile validation/test BPB와 WikiText perplexity에서 가장 낮았고, 모든 Pile component에서 두 비교 model보다 낮은 BPB를 보였다.

이 결과는 domain mixture가 다른 Common Crawl baseline보다 해당 protocol의 cross-domain fit을 개선할 수 있다는 근거다. 그러나 component selection·filtering·epoch weight를 함께 바꿨으므로 어느 한 component나 ‘품질’이라는 추상 속성의 독립 효과를 식별하지 않는다. LAMBADA perplexity는 CC-100이 더 낮았고 accuracy는 50.1 대 49.7로 가까웠다. 한 metric의 우위를 보편적 이해 능력으로 바꾸지 않는다.

### 공개성과 권리를 한 축으로 합치지 않는다

공개 construction code, component statistics와 downloadable mixture는 provenance를 조사하고 동일 자료를 재사용할 가능성을 높였다. 반면 원문 document에는 서로 다른 copyright·license·terms-of-service·author consent 상태가 남는다.

2022 datasheet는 dataset distribution에 MIT License를 기재하지만 Books3를 비롯한 저작권 자료도 명시한다. 이 두 문장을 함께 읽어야 한다. Project-level license와 underlying content rights는 같은 층위가 아니며, 논문의 fair-use 논의는 저자의 입장이지 개별 사용자의 법률 자문이 아니다.

### 문서화가 제공하는 것

원 논문은 topic distribution, profanity proxy, gender·religion·race co-occurrence와 author consent를 component별로 조사했다. 목적은 문제가 없음을 인증하는 것이 아니라 prospective user가 선택할 정보를 주는 것이었다. Datasheet도 scale 때문에 PII나 개별 문서의 진위를 전수 검증하기 어렵다고 기록한다.

따라서 데이터 거버넌스는 다음 질문을 계속 남긴다.

- 어떤 source에서 어떤 수집·변환을 거쳤는가?
- Raw size와 sampling weight가 목표 사용 분포를 어떻게 바꾸는가?
- 중복·평가 leakage·민감 정보와 삭제 요청을 어떻게 다루는가?
- 공개 접근과 재사용 권리를 어떤 근거로 구분하는가?

## 검증과 한계

### 자주 생기는 오해

- **825GB와 825.18 GiB는 정확히 같다:** GB와 GiB는 단위가 다르고 원 논문의 정밀값은 825.18 GiB다.
- **1,254.20 GiB를 별도 저장한다:** Component epoch 가중치를 반영한 effective-size 장부다.
- **22개 component를 균등하게 한 번씩 사용한다:** Raw 크기와 1–3 epoch weight가 다르다.
- **모든 문서를 deduplicate했다:** Pile-wide deduplication은 하지 않았다.
- **40GB는 The Pile 전체 학습량이다:** 세 dataset에서 약 40GB씩 사용한 1.3B 통제 학습 비교의 training subsample이다.
- **BPB가 낮으면 사실성·공정성·안전성이 높다:** 평균 압축·예측 metric이며 별도 속성은 측정하지 않는다.
- **MIT License가 모든 underlying text의 권리를 통일한다:** Datasheet 자체가 copyrighted component와 consent 차이를 기록한다.
- **공개 data면 model 학습을 누구나 쉽게 재현한다:** Storage·tokenizer·ordering·compute·optimizer·seed와 implementation이 남는다.
- **다양한 출처는 세계의 균형 잡힌 표본이다:** English-focused collection과 curator의 availability·quality 판단을 반영한다.

### 남는 조사 범위

원 Pile은 component-level transparency의 강한 사례지만 Pile-wide deduplication, 완전한 PII 검사, 권리 통일과 component causal ablation을 제공하지 않았다. 후속 사용에서는 원 배포 당시 문서뿐 아니라 현재 host·component availability, 관할법과 project-specific risk를 다시 확인해야 한다.

## 학습 확인

### 확인 질문

1. Raw size와 effective size를 함께 기록해야 model의 실제 data mixture를 더 잘 이해할 수 있는 이유는 무엇인가?
2. Deduplication, split leakage control과 benchmark decontamination은 각각 어떤 겹침을 줄이는가?
3. Dataset code·mixture가 공개됐다는 사실과 모든 source text를 자유롭게 재사용할 수 있다는 주장이 다른 이유는 무엇인가?

### 다음 문서

- [[074_The Pile과 대규모 언어 모델 학습 말뭉치]] — 원문 서사의 영향·법적 명확성·성능 과장을 1차 자료와 대조한다.
- [[데이터 품질과 분포 다양성은 같은 축인가]] — 필터·domain coverage·epoch weight와 평가 분포를 비교한다.

## 출처

- Leo Gao 외, [The Pile: An 800GB Dataset of Diverse Text for Language Modeling](https://arxiv.org/abs/2101.00027), 2020, §§1–7, Tables 1·3–5와 Appendices C–D.
- Stella Biderman·Kieran Bicheno·Leo Gao, [Datasheet for the Pile](https://arxiv.org/abs/2201.07311), 2022, PDF pp. 1·8–17.
- [[074_The Pile과 대규모 언어 모델 학습 말뭉치]]
- 프로젝트 보존 자료: `raw/074_The Pile Open-Source Training Dataset for Large Language Models.ko.md`, `raw/074_The Pile Open-Source Training Dataset for Large Language Models.commentary.ko.md`.

## 관련 항목

- [[074_The Pile과 대규모 언어 모델 학습 말뭉치]]
- [[말뭉치 기반 학습]]
- [[언어 모델 스케일링 법칙]]
- [[대규모 언어 모델]]
- [[Perplexity]]
- [[063_T5와 Text-to-Text 통합 프레임워크]]
- [[066_신경 언어 모델의 스케일링 법칙]]
- [[067_GPT-3와 문맥 내 학습]]
- [[데이터 품질과 분포 다양성은 같은 축인가]]
