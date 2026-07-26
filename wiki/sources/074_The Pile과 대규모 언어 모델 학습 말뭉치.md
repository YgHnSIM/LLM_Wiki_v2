---
schema_version: 2
id: source.074
page_type: source
title: The Pile과 대규모 언어 모델 학습 말뭉치
aliases:
  - 074_The Pile Open-Source Training Dataset for Large Language Models
  - The Pile Open-Source Training Dataset for Large Language Models
  - The Pile 학습 데이터셋
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
  - 'raw/074_The Pile Open-Source Training Dataset for Large Language Models.ko.md'
  - 'raw/074_The Pile Open-Source Training Dataset for Large Language Models.commentary.ko.md'
evidence:
  - source_id: gao-et-al-2020-pile
    locator: 'arXiv submission history, 초록, §§1–7, Tables 1·3–5와 Appendices C–D의 2020-12-31 v1·22개 구성요소·825.18/1,254.20 GiB·가중 혼합·1.3B/40GB 비교·중복 제거·언어·편향·동의·법적 한계'
    relation: supports
  - source_id: biderman-et-al-2022-pile-datasheet
    locator: '초록과 PDF pp. 1·8–17의 22개 출처·211,043,181 documents·구성요소별 처리·Pile-CC/OpenWebText2 중복 제거·배포·저작권·PII·동의 문답'
    relation: supplements
related:
  - source.063
  - source.066
  - source.067
  - concept.the-pile
  - concept.말뭉치-기반-학습
  - concept.언어-모델-스케일링-법칙
  - concept.대규모-언어-모델
  - concept.perplexity
  - analysis.데이터-품질과-분포-다양성은-같은-축인가
---
# The Pile과 대규모 언어 모델 학습 말뭉치

> [!note] 학습 안내
> **난이도:** 중급<br>
> **선수 지식:** [[말뭉치 기반 학습]], [[Perplexity]]<br>
> **읽고 나면:** The Pile의 원시 크기와 가중 학습 분포를 구분하고, 중복 제거·평가 오염 제거·공개 배포·권리 상태에 관한 과장을 1차 자료로 교정할 수 있다.

## 1단계 — 먼저 잡을 핵심

### 한 개의 균일한 데이터셋이 아니라 22개 출처의 가중 혼합이다

Gao 등은 2020년 12월 31일 [[The Pile]] 논문 v1을 공개했고, 후속 datasheet는 데이터셋의 최초 배포일을 2021년 1월 1일로 기록했다. The Pile은 대규모 언어 모델의 학습과 교차 영역 평가를 위해 22개 영어 중심 텍스트 구성요소를 결합한 말뭉치다. 논문 §1은 새 출처에서 구축한 12개와 OpenWebText2·BookCorpus2 확장판을 합쳐 14개 신규·확장 언어 모델링 데이터셋으로 묶고, Pile-CC는 필터링한 Common Crawl의 새 부분집합으로 별도 소개했다.

숫자는 하나가 아니라 두 장부로 읽어야 한다.

| 장부 | 논문 Table 1의 값 | 뜻 |
|---|---:|---|
| Raw size | 825.18 GiB | Up/down-sampling 전 22개 구성요소의 합계 |
| Effective size | 1,254.20 GiB | 구성요소별 epoch 가중치를 반영한 한 Pile epoch의 근사 노출량 |

Wikipedia는 raw 6.38 GiB지만 세 번 노출되어 effective 19.13 GiB가 되고, PubMed Central과 arXiv는 두 번 노출된다. 따라서 저장 크기, token 수와 실제 학습 표본 비중은 같은 값이 아니다.

### 핵심 문장

- The Pile의 다양성은 22개 출처가 자동으로 균형을 이룬다는 뜻이 아니다. 출처 선택과 epoch 가중치가 학습 분포를 설계한다.
- 논문은 memory 제약 때문에 **Pile 전체 중복 제거를 하지 않았다**. 문서 수준 MinHashLSH는 Pile-CC와 OpenWebText2에 적용했다.
- 평가 자료와 13-gram이 겹치는 예시를 제거한 40GB 비교 실험은 benchmark decontamination이다. 말뭉치 전체가 중복·오염 없이 정제됐다는 뜻이 아니다.
- 공개된 구성 코드와 데이터 접근성은 강한 투명성이다. 그러나 project-level 배포 license가 모든 원문 저작권·이용 조건·저자 동의를 하나로 통일하지는 않는다.
- 같은 말뭉치는 데이터라는 변수를 줄여 주지만 tokenizer·model·compute·optimizer·seed·평가가 다르면 자동으로 공정한 비교가 되지 않는다.

## 2단계 — 작동 원리

### 구성요소마다 수집·처리·노출 비율이 다르다

Table 1의 상위·대표 구성요소를 보면 raw 크기와 학습 비중의 차이를 알 수 있다.

| 구성요소 | Raw size | Epochs | Effective size | 주된 성격 |
|---|---:|---:|---:|---|
| Pile-CC | 227.12 GiB | 1.0 | 227.12 GiB | 필터링한 Common Crawl 웹 문서 |
| Books3 | 100.96 GiB | 1.5 | 151.44 GiB | 장문 도서 |
| GitHub | 95.16 GiB | 1.0 | 95.16 GiB | 공개 저장소의 텍스트·코드 파일 표본 |
| PubMed Central | 90.27 GiB | 2.0 | 180.55 GiB | 생의학 full text |
| OpenWebText2 | 62.77 GiB | 2.0 | 125.54 GiB | Reddit link 기반 웹 문서 |
| arXiv | 56.21 GiB | 2.0 | 112.42 GiB | 2020년 7월까지의 변환 가능한 TeX source |
| Wikipedia (en) | 6.38 GiB | 3.0 | 19.13 GiB | 영어 Wikipedia |

구성요소 $i$의 raw byte를 $B_i$, 반복 횟수를 $e_i$라 하면 Table 1의 effective byte는 대략 다음 장부다.

$$
B_i^{\mathrm{effective}}\approx B_i e_i
$$

실제 문서 sampling은 문서 수와 원하는 epoch 수를 이용하므로, byte 표와 정확히 같은 확률식은 아니다. Tokenizer도 byte를 서로 다른 token 수로 바꾼다. 그래서 `825 GiB`를 곧바로 고정 token budget으로 환산하지 않는다.

### 중복 제거·분할·평가 오염 제거를 분리한다

| 절차 | The Pile에서 한 일 | 남는 한계 |
|---|---|---|
| 구성요소 내부 deduplication | Pile-CC·OpenWebText2에 MinHashLSH 적용; 논문은 각각 약 26%·28% duplicate rate 보고 | Memory 제약으로 Pile-wide deduplication은 하지 않음 |
| Train/validation/test split | Validation·test를 각각 0.1% 무작위 표집하고 training에서 held-out와 verbatim인 요소 제거 | 논문은 split 사이 같은 문서가 남을 수 있다고 경고 |
| 비교 실험 decontamination | Pile·CC-100·Raw CC에서 평가 자료와 겹치는 13-gram을 제거 | 이 실험용 처리이지 전체 배포 말뭉치의 보편적 무오염 보증이 아님 |
| 문서화 | 출처별 처리·topic·profanity·co-occurrence·동의 상태를 조사 | 위험을 기록한 것이 제거·완화·법적 확정을 뜻하지 않음 |

The Pile은 validation과 test를 교차 영역 benchmark로도 제안했다. Tokenizer가 다른 모델을 비교하기 위해 주요 metric으로 bits per UTF-8 encoded byte(BPB)를 사용했다. 이 metric도 평균 next-token 압축 성능을 나타낼 뿐 사실성·안전성·저작권 적합성을 측정하지 않는다.

## 3단계 — 기술과 근거

### 40GB 통제 비교가 보여 준 범위

연구진은 같은 1.3B decoder-only architecture를 The Pile, CC-100 English와 Raw Common Crawl에 각각 학습했다. Dataset 크기 효과를 줄이기 위해 세 자료를 평가 세트와 13-gram 기준으로 decontaminate하고 약 40GB로 downsample했다. Table 3의 결과는 다음과 같다.

| 학습 자료 | Pile val BPB | Pile test BPB | WikiText PPL | LAMBADA PPL | LAMBADA accuracy |
|---|---:|---:|---:|---:|---:|
| The Pile | 0.9281 | 0.9433 | 5.59 | 12.78 | 50.1 |
| CC-100 (en) | 1.3143 | 1.3293 | 8.27 | 11.78 | 49.7 |
| Raw CC | 1.1180 | 1.1275 | 11.75 | 19.84 | 43.8 |

Pile model은 Pile의 모든 구성요소에서 두 Common Crawl 비교보다 낮은 BPB를 보였고 WikiText도 가장 낮았다. 그러나 LAMBADA perplexity는 CC-100보다 높았고 accuracy 차이는 0.4 point였다. 따라서 안전한 결론은 **이 고정된 1.3B·40GB protocol에서 교차 영역 적합성이 개선됐다**는 것이다. 더 큰 모든 모델·과제에서 우세하거나 다양성 하나가 원인이라는 보편 결론은 아니다.

구성요소별 기여도도 이 실험만으로 식별되지 않는다. 22개 mixture와 처리 절차를 함께 바꿨고, 각 component를 하나씩 제거하는 ablation은 하지 않았다. Code 비중이 code 능력, 과학 자료가 과학 추론을 직접 만들었다는 raw 설명은 후속 model·ablation 근거가 필요한 가설이다.

### 문서화와 정제는 다른 개입이다

논문은 일반 목적 말뭉치에서 우려되는 내용을 모두 없애기보다 조사하고 문서화해 사용자가 판단하도록 하는 입장을 택했다. Profanity와 gender·religion·race co-occurrence는 proxy 분석이었고, 편향이 없다는 검사가 아니었다. 자료는 영어에 초점을 맞췄지만 일부 multilingual component와 비영어 문장을 명시적으로 완전히 제거하지도 않았다. 영어 중심과 세계 언어·문화의 대표성은 별개다.

Author consent와 공개 자료 재사용도 구성요소마다 달랐다. 논문 §6.5의 Table 5는 공개 접근성(public availability), host terms-of-service 준수와 저자 동의(authorial consent)를 분리했고, 일부 구성요소에는 공백이 있음을 기록했다. 이 가운데 5개 구성요소에는 ToS 준수와 저자 동의 양쪽 모두 확인 표시가 없었다. 2022 datasheet는 The Pile이 MIT License로 배포됐다고 적는 동시에 Books3를 비롯한 여러 구성요소에 저작권 자료가 있음을 명시한다. 이는 저자들의 배포·fair-use 입장을 기록한 1차 문서이지, 모든 관할·사용 목적에 대한 법률 보증이 아니다.

Datasheet는 2억 1,104만 3,181개 unweighted document를 보고했지만, 규모 때문에 모든 문서가 주장한 내용인지 또는 PII를 포함하는지 전수 확인하기 어렵다고 밝혔다. 공개·문서화·대규모라는 세 속성은 개별 문서의 품질·안전·권리 확인을 대신하지 않는다.

## 검증과 한계

### 출발 자료와 1차 근거

이번 ingest의 출발 자료는 2025년 7월 23일에 게시된 역사 회고 글이며, The Pile 발표 당시의 1차 문헌이 아니다. 저장소에는 그 영문 원문을 복제하지 않고 새 한국어 번역과 해설만 artifact로 보존했다. 아래의 날짜·규모·실험·권리 주장은 2020년 원 논문과 2022년 datasheet에 다시 대조했으므로, 회고 글의 설명과 당시 연구진이 공개한 근거를 구분해 읽는다.

### raw 설명의 검증 정정

- **연혁을 2021년 항목으로만 묶는다:** 논문 v1은 2020-12-31, datasheet가 기록한 dataset release는 2021-01-01이다. 연구 발표와 배포를 구분한다.
- **고품질 데이터가 가장 큰 유일한 장벽이었다:** 데이터 준비는 중요한 장벽이었지만 대형 model compute·engineering·평가 비용도 남았다.
- **동료 심사 자료 중심이라는 표현을 22개 전체의 품질 보증으로 읽는다:** 웹·코드·토론·subtitle·preprint·email 등 성격과 자동 처리 수준이 크게 다르다.
- **전체 데이터에 중복 제거를 적용했다:** Pile-wide deduplication은 하지 않았고 Pile-CC·OpenWebText2에만 문서 수준 처리를 적용했다.
- **법적 준수를 보장하고 연구자는 안심하고 사용할 수 있다:** 구성요소별 저작권·license·terms·동의가 다르며 논문도 국가별 법과 법률 자문 한계를 적었다.
- **825GB는 GPT-3 규모 model을 학습하기에 충분하다:** Byte·token·가중 반복·model size·compute·optimizer가 달라 저장 크기만으로 충분성이나 동등 성능을 판정할 수 없다.
- **같은 dataset이면 architecture를 공정하게 비교할 수 있다:** 데이터 축 하나를 통제할 뿐 tokenizer·training budget·implementation·평가도 맞춰야 한다.
- **The Pile model은 모든 benchmark에서 개선됐다:** Table 3의 LAMBADA perplexity는 CC-100보다 높았고 accuracy 차이는 작았다.
- **각 component가 특정 능력에 기여함을 입증했다:** 전체 mixture 비교는 했지만 component별 causal ablation은 하지 않았다.
- **다양한 출처가 견고한 이해를 만든다는 설명을 bias·대표성 해결의 증거로 읽는다:** 영어 중심이며 공개·수집 가능한 자료와 curator의 가중 판단을 반영한다. 원 논문 비교도 다양성의 독립 효과를 분리하지 않았다.
- **GPT-Neo·GPT-J의 성공과 독점 system 경쟁력을 이 논문이 직접 평가했다:** 원 논문의 model 비교는 1.3B 실험이다. 후속 model의 영향은 각각의 1차 자료가 필요하다.
- **공개 데이터가 전체 LLM 개발을 대중화했다:** 데이터 접근 장벽을 낮춘 것은 확인되지만 compute·storage·권리·운영 장벽까지 제거됐다는 사회적 인과는 측정하지 않았다.

### 현재 자료로 말할 수 있는 범위

원 논문은 component table, processing code, controlled comparison과 위험 문서화를 함께 공개했다는 점에서 강한 1차 자료다. 그러나 품질을 하나의 scalar로 정의하지 않았고, 전체 component의 인과 기여·장기적인 산업 영향·법적 적합성을 실험으로 확정하지 않았다. 공개 source 문서는 이 경계를 유지해 `verification: verified`로 두되, 가치 판단과 후대 영향은 검증된 사실처럼 쓰지 않는다.

## 학습 확인

### 확인 질문

1. 825.18 GiB raw size와 1,254.20 GiB effective size가 다른 이유는 무엇인가?
2. Pile-CC·OpenWebText2 deduplication과 40GB 비교의 benchmark decontamination은 어떤 문제를 각각 다루는가?
3. Datasheet의 MIT 배포 표기만으로 모든 구성요소의 저작권·동의 문제를 끝낼 수 없는 이유는 무엇인가?

### 다음 문서

- [[The Pile]] — 22개 component·가중 혼합·분할·평가·권리 장부를 재사용 가능한 dataset 개념으로 정리한다.
- [[데이터 품질과 분포 다양성은 같은 축인가]] — 품질 필터·영역 coverage·sampling weight·평가 분포를 네 축으로 비교한다.

## 출처

- Leo Gao 외, [The Pile: An 800GB Dataset of Diverse Text for Language Modeling](https://arxiv.org/abs/2101.00027), 2020, §§1–7, Tables 1·3–5와 Appendices C–D.
- Stella Biderman·Kieran Bicheno·Leo Gao, [Datasheet for the Pile](https://arxiv.org/abs/2201.07311), 2022, 특히 PDF pp. 1·8–17.
- [[066_신경 언어 모델의 스케일링 법칙]]
- [[067_GPT-3와 문맥 내 학습]]
- 프로젝트 번역·검토 출발 자료: [The Pile: Open-Source Training Dataset for Large Language Models](https://mbrenndoerfer.com/writing/the-pile-open-source-training-dataset-large-language-models)
- 프로젝트 보존 자료: `raw/074_The Pile Open-Source Training Dataset for Large Language Models.ko.md`, `raw/074_The Pile Open-Source Training Dataset for Large Language Models.commentary.ko.md`.

## 관련 항목

- [[The Pile]]
- [[말뭉치 기반 학습]]
- [[언어 모델 스케일링 법칙]]
- [[대규모 언어 모델]]
- [[Perplexity]]
- [[063_T5와 Text-to-Text 통합 프레임워크]]
- [[066_신경 언어 모델의 스케일링 법칙]]
- [[067_GPT-3와 문맥 내 학습]]
- [[데이터 품질과 분포 다양성은 같은 축인가]]
