---
schema_version: 2
id: source.089
page_type: source
title: LLaMA 1과 제한적 공개 가중치 연구 배포
aliases:
  - "089_LLaMA Meta's Open Foundation Models That Democratized Language AI Research"
  - 'LLaMA: Open and Efficient Foundation Language Models'
  - LLaMA 1 공개
  - LLaMA 1 gated release
tags:
  - type/source
  - domain/ai
  - domain/computer-science
  - domain/nlp
  - domain/machine-learning
  - domain/academia
created: '2026-07-22'
updated: '2026-07-22'
lifecycle: active
verification: verified
artifacts:
  - "raw/089_LLaMA Meta's Open Foundation Models That Democratized Language AI Research.ko.md"
  - "raw/089_LLaMA Meta's Open Foundation Models That Democratized Language AI Research.commentary.ko.md"
evidence:
  - source_id: touvron-et-al-2023-llama
    locator: '초록, §§1–6·8, Tables 1–15와 Figures 1–2의 추론 예산 중심 목표·data mixture·model/학습 조건·20개 benchmark·LLaMA-I·bias/toxicity/truthfulness·hardware와 carbon 추정'
    relation: supports
  - source_id: meta-ai-2023-introducing-llama
    locator: '2023-02-24 발표의 7B·13B·33B·65B 제품군, 1.0T/1.4T token, noncommercial research license, case-by-case 접근 대상과 safety 한계 설명'
    relation: supports
related:
  - concept.llama-1
  - source.078
  - source.082
  - source.083
  - source.072
  - concept.rmsnorm
  - concept.언어-모델-스케일링-법칙
  - concept.파운데이션-모델
  - analysis.공개-가중치와-재현-가능성은-같은-축인가
---
# LLaMA 1과 제한적 공개 가중치 연구 배포

> [!note] 학습 안내
> **난이도:** 중급<br>
> **선수 지식:** [[파운데이션 모델]], [[언어 모델 스케일링 법칙]], autoregressive Transformer의 기본 원리<br>
> **읽고 나면:** LLaMA 1의 추론 지향 장기 학습, model·data·구조·평가 조건과 최초 가중치 배포 범위를 설명하고, base LLaMA·LLaMA-I·후속 Llama 세대를 구분할 수 있다.

## 1단계 — 먼저 잡을 핵심

### 핵심 문장

2023년 2월의 **[[LLaMA 1]]**은 7B·13B·33B·65B 규모의 causal Transformer 제품군이다. 저자들은 주어진 training compute에서 loss를 최소화하는 model과, 배포 뒤 반복 inference에 더 작은 parameter footprint를 쓰는 model이 다를 수 있다고 보았다. 그래서 작은 model을 training-compute 최적점보다 많은 token으로 학습해 parameter 수가 작은 상태에서 목표 성능을 높이려 했다.

이 설계는 “모든 model을 Chinchilla의 약 20 token/parameter에 맞췄다”는 설명과 다르다. 65B는 그 비율에 가깝지만 7B·13B·33B는 각각 훨씬 많은 token을 보았다. 여기서 **overtraining**은 validation 성능을 망가뜨린 과적합이 아니라, training compute만을 기준으로 한 최적점보다 더 오래 학습했다는 좁은 뜻이다.

### 공개의 의미와 경계

LLaMA 1은 API 출력만 관찰하던 연구자에게 model weight를 직접 실행·검사·변형할 가능성을 넓혔다. 그러나 최초 배포는 누구나 자유롭게 받는 open-source release가 아니었다. Meta의 2023년 2월 24일 발표는 **비상업적 연구 용도 license**와 신청자별 승인을 명시했다. 학계, 정부·시민사회 소속 연구자와 산업 연구소 등이 대상이었지만 접근은 case-by-case였다.

따라서 역사적 의의는 “무제한 공개”보다 **경쟁력 있는 base model의 제한적 weight-level 연구 접근**에 있다. 이 범위는 [[082_BLOOM과 공개 접근 다국어 LLM]]의 artifact별 공개 조건, [[공개 가중치와 재현 가능성은 같은 축인가]]의 공개 층위 장부와 함께 읽어야 정확해진다.

## 2단계 — 작동 원리

### 추론 예산을 향한 model·token 배분

논문 Table 2의 실제 parameter 수와 학습 token을 나누면 작은 model일수록 parameter당 훨씬 많은 token을 사용했다.

| 공개명 | 논문상 parameter | 학습 token | 약식 token/parameter |
| --- | ---: | ---: | ---: |
| LLaMA-7B | 6.7B | 1.0T | 149 |
| LLaMA-13B | 13.0B | 1.0T | 77 |
| LLaMA-33B | 32.5B | 1.4T | 43 |
| LLaMA-65B | 65.2B | 1.4T | 21 |

[[078_Chinchilla와 계산 최적 언어 모델 학습]]은 고정 training compute 아래 model과 data의 배분을 추정했다. LLaMA 논문은 그 출발점을 인정하면서도 serving을 반복할 때는 작은 model의 inference 비용이 누적된다는 다른 목적함수를 제시했다. 저자들은 Chinchilla식 예로 10B·200B token을 들고, 자신들의 7B가 1T token을 사용한 뒤에도 개선됐다고 보고했다. 이는 Chinchilla를 단순 재현한 것이 아니라 **training 비용을 더 쓰고 반복 inference 비용을 낮추는 교환**이다.

### 일곱 data 원천과 tokenizer

1.4T-token 전체 mixture는 English Common Crawl 67%, C4 15%, GitHub 4.5%, Wikipedia 4.5%, Gutenberg·Books3 4.5%, ArXiv 2.5%, Stack Exchange 2%였다. Common Crawl과 C4만 합쳐 82%이므로 “균형 잡힌 20개 언어 model”로 부를 수 없다. 20개 Latin·Cyrillic script 언어라는 수치는 Wikipedia subset에 해당한다.

논문은 **공개적으로 접근 가능한 data만 사용했다**고 표현한다. 이것이 모든 원문이 public domain이거나 permissive license이고 자유롭게 재배포할 수 있다는 뜻은 아니다. 공개 접근성, 학습 사용 판단, 원문 재배포 권리는 별개다. Tokenizer는 SentencePiece 구현의 BPE를 사용하고, 숫자를 개별 digit으로 나누며 알 수 없는 UTF-8 문자는 byte로 분해한다.

### 선행 기법을 결합한 구조

LLaMA 1은 새로운 attention 계열을 발명한 model이 아니다. Causal Transformer에 다음 선택을 결합했다.

- 각 sublayer의 출력이 아니라 입력을 먼저 정규화하는 pre-normalization과 **[[RMSNorm]]**
- ReLU 대신 SwiGLU, 그리고 parameter 수를 맞추기 위한 feed-forward hidden dimension $8d/3$
- 절대 position embedding 대신 각 layer의 query·key에 적용하는 RoPE

학습은 AdamW($\beta_1=0.9$, $\beta_2=0.95$), cosine learning-rate schedule, weight decay 0.1, gradient clipping 1.0, 2,000 warmup step과 4M-token batch를 사용했다. RMSNorm·SwiGLU·RoPE는 모두 선행 연구의 기법이다. LLaMA의 기여는 이 요소의 발명이 아니라 일관된 조합, 장기 학습과 여러 규모의 실증에 가깝다.

별도의 학습 구현 최적화로는 attention weight를 저장하지 않고 causal mask가 가리는 score를 계산하지 않는 xFormers 기반 memory-efficient attention, 선택적 activation checkpointing, model·sequence parallelism과 통신–계산 overlap을 사용했다. 이는 model architecture의 수학적 정의와 구분한다.

## 3단계 — 기술과 근거

### Benchmark 주장은 조건부다

논문은 common-sense reasoning, closed-book QA, RACE, MATH·GSM8K, HumanEval·MBPP와 MMLU를 포함한 20개 능력 benchmark에서 과제별 zero-shot·few-shot 결과를 보고했다. Bias·toxicity·truthfulness를 다룬 네 가지 safety 평가는 별도 protocol이다. 능력 평가 범위에서 LLaMA-13B는 GPT-3 175B를 **대부분의 보고된 benchmark에서** 앞섰고, LLaMA-65B는 Chinchilla-70B·PaLM-540B와 경쟁 가능했다.

| 비교 장면 | 확인되는 결과 | 함께 붙여야 할 조건 |
| --- | --- | --- |
| Common-sense 8종, zero-shot | 65B는 Chinchilla보다 BoolQ를 제외한 보고 항목에서, PaLM-540B보다 BoolQ·WinoGrande를 제외한 항목에서 높음 | 일부 baseline 수치는 각 원 논문에서 가져옴 |
| NaturalQuestions·TriviaQA | 13B도 GPT-3·Chinchilla와 경쟁 가능한 결과 | Closed-book exact match, shot 수에 따라 값이 달라짐 |
| MMLU, 5-shot | LLaMA-65B 63.4 | Chinchilla-70B 67.5, PaLM-540B 69.3보다 낮음 |
| Training 중 추세 | 다수 과제는 token 증가와 함께 개선 | SIQA는 분산이 컸고 WinoGrande는 perplexity와 덜 일치 |

“65B가 더 큰 모든 model을 능가했다”거나 “13B가 모든 과제에서 GPT-3보다 우월했다”는 결론은 이 표들의 범위를 넘는다. Model·prompt·shot 수·scoring이 달랐고, 모든 baseline을 하나의 동일한 code path로 다시 실행한 비교도 아니었다.

### Base LLaMA와 LLaMA-I

주요 7B·13B·33B·65B checkpoint는 next-token prediction으로 사전학습한 **base model**이다. 대화 assistant도 아니고 RLHF를 거친 chat model도 아니다. 논문 §4는 별도의 단일 실험으로 65B에 instruction finetuning을 적용한 **LLaMA-I**를 보고했다. MMLU 5-shot은 base LLaMA-65B 63.4에서 LLaMA-I 68.9로 높아졌다.

이 결과는 instruction tuning의 가능성을 보여 주지만, 전체 LLaMA 1 family가 instruction-tuned였다는 뜻은 아니다. [[072_지시 미세조정과 FLAN의 제로샷 일반화]]과 비교하면 pretraining checkpoint와 post-training variant를 한 model의 성능처럼 합쳐서는 안 되는 이유가 선명해진다.

### Hardware와 carbon 장부

65B 최종 학습은 A100-80GB 2,048대에서 GPU당 약 380 token/s로 수행됐고 1.4T token에 약 21일이 걸렸다. Table 15의 동일 data-center 가정에서는 65B run을 1,022,362 GPU-hour, 449MWh, 173 tCO2eq로 추정했다. 전체 제품군 개발에는 2,048대 A100을 약 5개월 사용했다고 추정해 2,638MWh와 1,015 tCO2eq를 제시했다. 이 값은 PUE 1.1과 미국 평균 carbon intensity 0.385kg CO2e/kWh를 적용한 계산이지 실제 전력망의 측정값이 아니다.

접근성 사례로 논문이 직접 말한 것은 13B가 inference 때 **단일 V100**에서 실행된다는 점이다. V100은 data-center accelerator이며, 이 문장이 consumer PC에서 모든 model을 쉽게 fine-tune할 수 있다는 뜻은 아니다. 공개된 checkpoint를 실행하는 비용과 제품군을 처음부터 훈련하는 비용도 분리해야 한다.

## 검증과 한계

### 원 웹글의 검증 정정

- **LLaMA 1은 자유로운 open-source model이었다:** 공식 배포는 신청·승인을 거친 noncommercial research release였다. Code 공개, weight 접근과 license 권리는 다른 층이다.
- **상업 이용도 허용됐다:** 2023년 2월 발표는 비상업 연구 용도를 명시했다. 후속 세대의 조건을 LLaMA 1에 소급하지 않는다.
- **모든 규모가 Chinchilla의 약 20 token/parameter를 따랐다:** 7B·13B·33B는 약 149·77·43으로 더 오래 학습됐다.
- **LLaMA가 RMSNorm·SwiGLU·RoPE를 발명했다:** 모두 선행 기법이다. LLaMA는 이를 causal Transformer family에 결합했다.
- **Data 원천은 여섯 종류뿐이다:** 공식 Table 1에는 Stack Exchange 2%도 포함된다.
- **20개 언어를 균형 있게 학습했다:** 20개 언어라는 수치는 Wikipedia subset에 해당하며, 전체 mixture의 82%가 English Common Crawl·C4다.
- **일반적인 유해·부적절 콘텐츠를 safety filter로 제거했다:** 논문은 원천별 품질·언어·형식·중복 제거를 설명하지만, 전체 mixture에 적용한 포괄적 safety filter는 보고하지 않는다.
- **RMSNorm·SwiGLU·RoPE가 각각 성능과 효율 향상을 만들었다:** 논문에는 세 구성요소의 효과를 분리한 ablation이 없다. 결합된 recipe의 결과를 개별 요소의 인과 효과로 돌리지 않는다.
- **13B·65B가 더 큰 model을 언제나 능가했다:** 공식 표현은 각각 대부분의 보고 benchmark와 competitive이며 MMLU 같은 반례가 있다.
- **작은 model이라 일반 consumer hardware에서 쉽게 학습·미세조정할 수 있다:** 논문이 직접 제시한 근거는 13B의 single-V100 inference이고, training은 대규모 A100 cluster를 사용했다.

논문은 원천별 중복 제거와 일부 evaluation corpus의 overlap 확인을 보고하지만, 모든 benchmark를 포괄하는 단일 contamination audit이나 하나의 knowledge cutoff를 제시하지 않는다. 따라서 평가 결과를 학습 자료와 완전히 분리된 능력 측정으로 확대하지 않는다.

### Safety 평가는 mitigation이 아니다

논문은 RealToxicityPrompts, CrowS-Pairs, WinoGender와 TruthfulQA로 위해 가능성을 측정했다. 같은 family 안에서 65B의 RealToxicityPrompts 점수는 7B보다 높았고, WinoGender의 gotcha example은 직업과 성별의 고정관념을 따르는 오류를 드러냈다. LLaMA-65B의 TruthfulQA truthful score 0.57은 비교한 GPT-3 수치보다 높았지만 저자들은 정답률이 여전히 낮아 잘못된 답을 hallucinate할 가능성이 있다고 적었다.

이는 model의 위험을 공개한 평가이지 safety alignment나 filter를 내장했다는 증거가 아니다. Base checkpoint, 제한적인 LLaMA-I 실험과 별도 chat alignment를 구분해야 한다.

### LLaMA 1과 Llama 2의 경계

이 문서의 LLaMA는 2023년 2월의 첫 7B·13B·33B·65B 제품군이다. Meta 발표 페이지가 나중에 Llama 2가 별도 세대로 출시됐다고 안내하는 것처럼, **LLaMA-I도 Llama 2도 LLaMA 1 base family와 같은 artifact가 아니다.** 후속 Llama 2의 model 크기, chat variant, license와 safety 절차는 해당 세대의 별도 자료로 검증해야 하며 이 문서의 성과나 배포 조건에 소급하지 않는다.

## 학습 확인

### 확인 질문

1. LLaMA 1이 Chinchilla의 training-compute 최적점보다 작은 model을 오래 학습한 이유는 무엇인가?
2. “공개적으로 접근 가능한 data”와 “누구나 재배포할 수 있는 data”가 같은 말이 아닌 이유는 무엇인가?
3. Base LLaMA-65B의 MMLU 결과와 LLaMA-I 결과를 하나의 checkpoint 성능으로 합칠 수 없는 이유는 무엇인가?

### 다음 문서

- [[공개 가중치와 재현 가능성은 같은 축인가]] — weight 접근, license, data·code·log와 전체 재현을 별도 축으로 비교한다.
- [[083_PaLM과 Pathways 기반 대규모 언어 모델 확장]] — 더 큰 dense model의 training infrastructure와 LLaMA의 inference-oriented 선택을 대조한다.

## 출처

- Hugo Touvron 외, [*LLaMA: Open and Efficient Foundation Language Models*](https://arxiv.org/abs/2302.13971), 2023, 초록과 §§1–6·8, Tables 1–15, Figures 1–2.
- Meta AI, [Introducing LLaMA: A foundational, 65-billion-parameter large language model](https://ai.meta.com/blog/large-language-model-llama-meta-ai/), 2023-02-24.
- 프로젝트 번역·검토 출발 자료: [LLaMA: Meta's Open Foundation Models That Democratized Language AI Research](https://mbrenndoerfer.com/writing/llama-meta-open-foundation-models-democratized-language-ai-research).
- 프로젝트 보존 자료: `raw/089_LLaMA Meta's Open Foundation Models That Democratized Language AI Research.ko.md`, `raw/089_LLaMA Meta's Open Foundation Models That Democratized Language AI Research.commentary.ko.md`.

## 관련 항목

- [[LLaMA 1]]
- [[078_Chinchilla와 계산 최적 언어 모델 학습]]
- [[082_BLOOM과 공개 접근 다국어 LLM]]
- [[083_PaLM과 Pathways 기반 대규모 언어 모델 확장]]
- [[072_지시 미세조정과 FLAN의 제로샷 일반화]]
- [[RMSNorm]]
- [[언어 모델 스케일링 법칙]]
- [[파운데이션 모델]]
- [[공개 가중치와 재현 가능성은 같은 축인가]]
