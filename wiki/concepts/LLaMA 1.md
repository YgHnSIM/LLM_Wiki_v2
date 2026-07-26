---
schema_version: 3
id: concept.llama-1
page_type: concept
title: LLaMA 1
aliases:
  - LLaMA
  - Large Language Model Meta AI
  - Llama 1
  - LLaMA-65B
tags:
  - type/concept
  - domain/ai
  - domain/computer-science
  - domain/nlp
  - domain/machine-learning
created: '2026-07-22'
updated: '2026-07-22'
editorial_status: active
review:
  evidence_coverage: verified
  content_mode: descriptive
artifacts:
  - raw/089_LLaMA Meta's Open Foundation Models That Democratized Language AI Research.ko.md
  - raw/089_LLaMA Meta's Open Foundation Models That Democratized Language AI Research.commentary.ko.md
evidence:
  - source_id: touvron-et-al-2023-llama
    locator: '초록, §§1–6·8, Tables 1–15와 Figures 1–2의 7B–65B family, inference-oriented 장기 학습, data·architecture·optimizer, benchmark·LLaMA-I·safety·hardware와 carbon 조건'
    relation: supports
  - source_id: meta-ai-2023-introducing-llama
    locator: '2023-02-24 발표의 model 규모·token 수·연구 목적, noncommercial license와 case-by-case weight 접근, 알려진 bias·toxicity·hallucination 위험'
    relation: supports
relations:
  - target: source.078
    kind: related
  - target: source.082
    kind: related
  - target: source.083
    kind: related
  - target: source.072
    kind: related
  - target: concept.rmsnorm
    kind: related
learning:
  difficulty:
    entry: intermediate
    target: intermediate
  prerequisites:
    - target: concept.파운데이션-모델
    - target: concept.언어-모델-스케일링-법칙
  assumed_knowledge: causal language modeling
  outcomes:
    - 'LLaMA 1을 model family·학습 목표·배포 artifact로 나눠 정의하고, base model과 LLaMA-I·후속 Llama 세대를 혼동하지 않을 수 있다.'
  next:
    - target: source.089
      reason: 089LLaMA 1과 제한적 공개 가중치 연구 배포 — 공식 논문과 발표에 근거한 benchmark·license·safety·carbon 수치를 확인한다.
    - target: analysis.공개-가중치와-재현-가능성은-같은-축인가
      reason: 공개 가중치와 재현 가능성은 같은 축인가 — LLaMA의 gated weight access를 더 넓은 공개·재현 장부에 놓는다.
---
# LLaMA 1

> [!note] 학습 안내
> **난이도:** 중급<br>
> **선수 지식:** [[concept.파운데이션-모델|파운데이션 모델]], [[concept.언어-모델-스케일링-법칙|언어 모델 스케일링 법칙]]<br>
> **읽고 나면:** LLaMA 1을 model family·학습 목표·배포 artifact로 나눠 정의하고, base model과 LLaMA-I·후속 Llama 세대를 혼동하지 않을 수 있다.

## 1단계 — 먼저 잡을 핵심

### 한 문장 정의

**LLaMA 1**은 Meta AI가 2023년 2월 발표한 7B·13B·33B·65B 규모의 autoregressive [[파운데이션 모델]] 제품군으로, 작은 model을 많은 token으로 오래 학습해 반복 inference에서 더 작은 parameter footprint를 목표로 하고 가중치를 제한적인 연구 배포로 제공한 사례다.

### 네 경계를 함께 기억한다

1. **크기:** 실제 parameter는 6.7B·13.0B·32.5B·65.2B였다.
2. **학습:** 7B·13B는 1.0T, 33B·65B는 1.4T token을 보았다.
3. **성격:** 주요 checkpoint는 next-token prediction으로 사전학습한 base model이다.
4. **공개:** 최초 weight 배포는 신청·승인과 비상업 연구 조건이 붙었다.

이 네 항목 가운데 하나만 떼어 “작은 open-source chat model”이라고 부르면 model과 배포 역사를 동시에 왜곡한다.

## 2단계 — 작동 원리

### Training compute와 inference compute를 분리한다

고정된 training compute만 보면 더 큰 model을 더 적은 token으로 학습해 loss를 최소화하는 선택이 유리할 수 있다. 그러나 같은 model을 수없이 serving하면 매번 읽고 계산하는 parameter 수가 누적 비용의 한 축이 된다. LLaMA 1은 후자를 중시해 작은 model을 training-compute 최적점보다 오래 학습했다. 논문은 이 선택의 모든 배포 비용을 직접 측정한 것이 아니라 parameter 수를 inference budget의 핵심 대용치로 삼았다.

예를 들어 6.7B model은 1T token, 즉 parameter당 약 149 token을 보았다. 65.2B model의 약 21 token/parameter와 크게 다르다. 따라서 LLaMA 1을 “모든 크기가 같은 compute-optimal ratio를 따른 family”로 설명하지 않는다. [[078_Chinchilla와 계산 최적 언어 모델 학습]]이 묻는 고정 training budget과 LLaMA가 더한 반복 serving budget은 서로 다른 목적함수다.

### Model을 만드는 세 층

- **Data:** Common Crawl·C4가 82%이고 GitHub·Wikipedia·Gutenberg/Books3·ArXiv·Stack Exchange가 나머지를 이룬다. 20개 언어는 Wikipedia subset에 한정된다.
- **Architecture:** Causal Transformer에 pre-norm [[RMSNorm]], SwiGLU와 $8d/3$ feed-forward width, RoPE를 결합한다.
- **Training system:** Memory-efficient causal attention, selective activation 저장, model·sequence parallelism과 communication overlap을 사용한다.

RMSNorm·SwiGLU·RoPE를 LLaMA가 발명한 것으로 쓰지 않는다. 선행 요소의 조합과 inference budget을 겨냥한 장기 학습이 이 family의 구별점이다.

### Base model에서 adaptation으로

Base LLaMA는 prompt 다음 token의 분포를 예측하도록 사전학습됐다. 논문은 65B에 소량의 instruction data를 적용한 별도 실험 **LLaMA-I**를 만들었고 MMLU 5-shot을 63.4에서 68.9로 높였다. 그러나 이것은 한 번의 제한적 실험이며 전체 제품군이 instruction-tuned assistant였다는 뜻이 아니다.

## 3단계 — 기술과 근거

### 제품군 장부

| Model | Dimension | Head | Layer | Token | 약식 token/parameter |
| --- | ---: | ---: | ---: | ---: | ---: |
| 7B | 4,096 | 32 | 32 | 1.0T | 149 |
| 13B | 5,120 | 40 | 40 | 1.0T | 77 |
| 33B | 6,656 | 52 | 60 | 1.4T | 43 |
| 65B | 8,192 | 64 | 80 | 1.4T | 21 |

모두 4M-token batch를 사용했다. AdamW, cosine learning-rate decay, 2,000-step warmup, weight decay 0.1과 gradient clipping 1.0이 공통 훈련 구성이다.

### 성능을 읽는 법

LLaMA-13B가 GPT-3 175B를 “대부분의 benchmark에서” 앞섰다는 초록의 문장은 논문이 보고한 zero-shot·few-shot 범위에 한정된다. LLaMA-65B도 Chinchilla-70B와 PaLM-540B에 **competitive**하다고 표현됐다. MMLU 5-shot에서는 63.4로 Chinchilla 67.5와 PaLM-540B 69.3보다 낮았다.

이 family는 parameter 수 하나만으로 성능을 예측할 수 없음을 보여 주지만, 더 작은 model의 보편적 우월성을 입증하지는 않는다. Data mixture, token 수, prompt·shot 조건과 metric을 함께 기록해야 한다.

### 공개와 재현 장부

논문은 공개 data만 사용했고 model을 연구 공동체에 release한다고 썼다. Meta 발표가 밝힌 실제 weight 접근은 더 좁았다. 신청자별 승인과 noncommercial research license가 적용됐다. 따라서 다음을 구분한다.

| 층 | LLaMA 1에서 확인되는 범위 |
| --- | --- |
| 논문·model card | 구조·학습·평가와 알려진 위험 공개 |
| Code | 논문·공식 발표만으로 전체 data preparation·pretraining pipeline 공개가 확인되지는 않음 |
| Weight | 승인받은 연구 대상에게 제한 제공 |
| Data | 원천·mixture와 처리 설명, 완전한 학습 corpus 재배포와는 다름 |
| Full reproduction | 2,048대 A100을 사용한 규모여서 weight 접근만으로 보장되지 않음 |

이 사례는 [[082_BLOOM과 공개 접근 다국어 LLM]]과 함께 읽을 때 “open”이라는 한 단어가 논문·code·weight·data·license·compute를 대신할 수 없음을 보여 준다.

## 검증과 한계

### 능력과 안전의 경계

주요 benchmark는 base model의 제한된 zero-shot·few-shot 행동을 측정했다. Safety 절에서는 toxicity, stereotype, gender bias와 truthfulness 위험을 드러냈지만 이를 완화하는 alignment를 수행한 것은 아니다. 65B가 TruthfulQA에서 비교한 GPT-3보다 높았어도 truthful score는 0.57에 그쳤고, 저자들은 잘못된 답을 생성할 가능성을 명시했다.

### 접근성과 자원 비용의 경계

13B single-V100 inference는 강한 model의 실험 문턱을 낮춘 사례지만 V100은 consumer GPU가 아니다. 65B 최종 run은 2,048대 A100-80GB에서 약 21일이 걸렸다. 논문의 가정 아래 전체 개발 carbon 추정은 1,015 tCO2eq였다. 작은 inference footprint와 저렴한 pretraining을 같은 말로 쓰지 않는다.

### 이름과 세대를 섞지 않는다

- **LLaMA 1:** 2023년 2월 base family와 제한적 weight release
- **LLaMA-I:** 그 논문 안의 65B instruction-finetuning 단일 실험
- **Llama 2:** Meta 발표 페이지가 후속 별도 세대로 안내하는 release

후속 세대의 model 크기, chat alignment, license와 safety 결과를 LLaMA 1의 속성으로 소급하지 않는다. 반대로 LLaMA 1의 gated noncommercial 조건을 모든 후속 Llama release에 일반화하지도 않는다.

## 학습 확인

### 확인 질문

1. LLaMA-7B의 약 149 token/parameter와 LLaMA-65B의 약 21은 어떤 목표 차이를 드러내는가?
2. Base LLaMA와 LLaMA-I의 MMLU 수치를 같은 checkpoint의 성능처럼 합치면 왜 안 되는가?
3. Weight를 연구자에게 제공해도 full reproduction이 자동으로 가능해지지 않는 이유는 무엇인가?

### 다음 문서

- [[source.089|LLaMA 1과 제한적 공개 가중치 연구 배포]] — 089LLaMA 1과 제한적 공개 가중치 연구 배포 — 공식 논문과 발표에 근거한 benchmark·license·safety·carbon 수치를 확인한다.
- [[analysis.공개-가중치와-재현-가능성은-같은-축인가|공개 가중치와 재현 가능성은 같은 축인가]] — LLaMA의 gated weight access를 더 넓은 공개·재현 장부에 놓는다.

## 출처

- Hugo Touvron 외, [*LLaMA: Open and Efficient Foundation Language Models*](https://arxiv.org/abs/2302.13971), 2023, 초록과 §§1–6·8, Tables 1–15, Figures 1–2.
- Meta AI, [Introducing LLaMA: A foundational, 65-billion-parameter large language model](https://ai.meta.com/blog/large-language-model-llama-meta-ai/), 2023-02-24.
- [[089_LLaMA 1과 제한적 공개 가중치 연구 배포]]
- 프로젝트 보존 자료: `raw/089_LLaMA Meta's Open Foundation Models That Democratized Language AI Research.ko.md`, `raw/089_LLaMA Meta's Open Foundation Models That Democratized Language AI Research.commentary.ko.md`.

## 관련 항목

- [[source.089|LLaMA 1과 제한적 공개 가중치 연구 배포]]
- [[analysis.공개-가중치와-재현-가능성은-같은-축인가|공개 가중치와 재현 가능성은 같은 축인가]]
- [[concept.파운데이션-모델|파운데이션 모델]]
- [[concept.언어-모델-스케일링-법칙|언어 모델 스케일링 법칙]]
- [[source.078|Chinchilla와 계산 최적 언어 모델 학습]]
- [[source.082|BLOOM과 공개 접근 다국어 LLM]]
- [[source.083|PaLM과 Pathways 기반 대규모 언어 모델 확장]]
- [[source.072|지시 미세조정과 FLAN의 제로샷 일반화]]
- [[concept.rmsnorm|RMSNorm]]
