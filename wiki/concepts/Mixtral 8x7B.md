---
schema_version: 3
id: concept.mixtral-8x7b
page_type: concept
title: Mixtral 8x7B
aliases:
  - Mixtral
  - Mixtral-8x7B
  - Mixtral 8×7B
  - Mixtral 8x7B Instruct
tags:
  - type/concept
  - domain/ai
  - domain/computer-science
  - domain/nlp
  - domain/machine-learning
created: '2026-07-21'
updated: '2026-07-22'
editorial_status: active
review:
  evidence_coverage: verified
  content_mode: descriptive
artifacts:
  - raw/103_Mixture of Experts at Scale Efficient Scaling Through Sparse Activation and Dynamic Routing.ko.md
  - raw/103_Mixture of Experts at Scale Efficient Scaling Through Sparse Activation and Dynamic Routing.commentary.ko.md
  - raw/097_Mixtral & Sparse MoE Production-Ready Efficient Language Models Through Sparse Mixture of Experts.ko.md
  - raw/097_Mixtral & Sparse MoE Production-Ready Efficient Language Models Through Sparse Mixture of Experts.commentary.ko.md
evidence:
  - source_id: jiang-et-al-2024-mixtral
    locator: 'arXiv submission history, 초록, §§1–6, Tables 1–3·5와 Figures 1·7–8의 2024-01-08 v1·architecture·rounded total/active parameters·32K context·SFT와 DPO·평가 조건·memory와 routing 분석'
    relation: supports
  - source_id: mistral-ai-2023-mixtral-release
    locator: '2023-12-11 공개일, Apache 2.0 공개 가중치, architecture·46.7B total·12.9B active와 공식 비교 주장'
    relation: supports
relations:
  - target: source.069
    kind: related
  - target: concept.대규모-언어-모델
    kind: related
learning:
  difficulty:
    entry: intermediate
    target: intermediate
  prerequisites:
    - target: concept.전문가-혼합
    - target: concept.transformer
  assumed_knowledge: 없음
  outcomes:
    - '8x7B라는 이름과 46.7B total·12.9B active parameters의 관계를 설명하고, 공개 가중치·평가·routing specialization 주장의 범위를 구분할 수 있다.'
  next:
    - target: source.097
      reason: 097Mixtral의 생산 배포 효율 주장과 증거 경계 — 공개 가중치·benchmark·추론 경로가 입증하는 범위와 실제 운영 검증에 더 필요한 측정을 구분한다.
    - target: source.103
      reason: GLaM에서 Mixtral까지의 희소 MoE 확장 — GLaM의 내부 통제 비교와 Mixtral 공개를 역사·증거 수준별로 연결한다.
---
# Mixtral 8x7B

> [!note] 학습 안내
> **난이도:** 중급<br>
> **선수 지식:** [[concept.전문가-혼합|전문가 혼합]], [[concept.transformer|Transformer]]<br>
> **읽고 나면:** 8x7B라는 이름과 46.7B total·12.9B active parameters의 관계를 설명하고, 공개 가중치·평가·routing specialization 주장의 범위를 구분할 수 있다.

## 1단계 — 먼저 잡을 핵심

### 이름은 매개변수 장부가 아니다

Mixtral 8x7B는 Mistral AI가 2023년 12월 11일 공개한 decoder-only sparse [[전문가 혼합|Mixture of Experts(MoE)]] 언어 모델이다. Mistral 7B 계열의 공유 Transformer 경로를 유지하면서 각 layer의 FFN을 8개 expert로 바꾸고, token마다 두 개를 선택한다.

[[097_Mixtral의 생산 배포 효율 주장과 증거 경계]]는 이 구조의 공개와 `production-ready` 주장을 분리한다. Apache 2.0 weight·vLLM 변경·배포 경로는 실행 가능성의 근거지만, 특정 workload의 비용·tail latency·가용성·안전 목표를 자동으로 입증하지 않는다.

`8x7B`를 56B dense model이나 token당 14B model이라는 정확한 산술식으로 읽으면 안 된다. Shared attention·embedding 등의 weight는 한 번만 존재한다. 공식 보고값은 다음과 같다.

- **Total parameters:** 46.7B, 논문에서는 47B로 반올림
- **Active parameters/token:** 12.9B, 논문에서는 13B로 반올림
- **Context length:** 32,768 tokens
- **Experts per layer:** 8개 중 top-2
- **공개 범위:** Base와 Instruct weight를 Apache 2.0으로 배포

### 핵심 문장

Mixtral은 더 큰 total parameter capacity를 제한된 active path로 사용하는 공개 가중치 사례다. Active count가 작다는 사실은 전체 weight memory·routing overhead·latency도 같은 비율로 작다는 뜻이 아니다. 또한 model 이름의 ‘expert’가 과학·코드·법률 같은 안정된 주제별 module을 뜻하지 않는다.

## 2단계 — 작동 원리

### Layer마다 두 FFN 출력을 결합한다

Mixtral은 32-layer Transformer이며 각 layer의 FFN 위치에 8개 expert를 둔다. Token의 현재 hidden state $x$에서 router가 logit을 계산하고 상위 두 expert만 남긴다.

$$
G(x)=\operatorname{softmax}(\operatorname{TopK}(xW_g,2)),
$$

$$
y(x)=\sum_{i=1}^{8}G(x)_iE_i(x)
$$

선택되지 않은 expert의 $G(x)_i$는 0이므로 해당 FFN 출력은 계산하지 않는다. 선택 expert는 token과 layer마다 달라질 수 있지만, top-$k$는 항상 2다. 어려운 입력에 expert 수를 자동으로 더 주는 구조가 아니다.

| 경로 | Token마다 실행되는가 | 비용에 미치는 영향 |
|---|---|---|
| Embedding·attention·normalization | 공유 경로로 실행 | Active count와 FLOPs에 계속 포함 |
| 8개 expert FFN | 선택된 2개만 실행 | Conditional capacity와 산술량을 분리 |
| Router | 모든 expert 점수를 계산 | 선택·dispatch overhead를 추가 |
| Expert weight 전체 | Token path에는 일부만 참여 | Serving memory와 분산 배치에는 전체가 필요 |

### Active parameter는 FLOPs·memory·latency와 같지 않다

Mixtral 논문은 active parameter가 inference arithmetic의 유용한 proxy라고 설명하지만, serving memory가 약 47B total에 비례한다고 별도로 명시한다. 여러 expert를 한 장치에서 실행하면 memory load가 늘고, expert parallelism은 token dispatch와 communication을 요구한다. 큰 batch에서는 여러 token의 expert 연산을 묶어 hardware 이용률을 높일 수 있지만, 작은 batch와 single-request latency에는 같은 이득이 보장되지 않는다.

따라서 공식 발표의 Llama 2 70B 대비 `6x faster inference`는 특정 release comparison이지 어느 hardware·batch에서도 성립하는 architecture 상수는 아니다.

## 3단계 — 기술과 근거

### 공개 가중치와 학습 공개 범위를 구분한다

Base와 Instruct checkpoint는 Apache 2.0으로 공개돼 academic·commercial reuse 장벽을 낮췄다. 이는 weight license에 관한 강한 공개 범위다. 논문은 pretraining data를 multilingual data로 설명하고, 2023년 공식 발표는 open Web에서 추출한 자료라고 밝혔다. 그러나 자세한 corpus mixture, 전체 training token, 완전한 recipe는 제공하지 않는다. 따라서 공개 가중치를 data·training pipeline까지 완전히 재현되는 ‘open source’와 자동으로 동일시하지 않는다.

Instruct model은 base checkpoint에 supervised fine-tuning을 하고 paired feedback data로 Direct Preference Optimization을 적용했다. Base의 pretraining 능력과 Instruct의 대화·선호 적응 결과를 같은 checkpoint 단계로 합치지 않는다.

### 평가는 대부분 우위이지 전 항목 우위가 아니다

Mixtral 연구진은 Llama 계열을 자체 pipeline으로 다시 평가했다. Table 2의 대표 결과는 다음과 같다.

| 평가 | Mixtral 8x7B | Llama 2 70B | 판정 |
|---|---:|---:|---|
| MMLU | 70.6 | 69.9 | Mixtral 높음 |
| HellaSwag | 84.4 | 85.4 | Llama 높음 |
| WinoGrande | 77.2 | 80.4 | Llama 높음 |
| HumanEval | 40.2 | 29.3 | Mixtral 높음 |
| MATH | 28.4 | 13.8 | Mixtral 높음 |
| TriviaQA | 71.5 | 73.0 | Llama 높음 |

논문은 code·mathematics·multilingual benchmark의 강한 결과를 보고했고 대부분의 metric에서 Llama 2 70B·GPT-3.5와 맞먹거나 앞섰다. Benchmark마다 shot·metric 조건이 다르고, MBPP·TriviaQA는 Llama 2 논문에 보고된 protocol과 차이가 있었으며 모든 항목에서 우세하지 않았다. 같은 data와 recipe의 dense counterpart가 없으므로 이 차이를 sparsity 하나의 인과 효과로 분리할 수 없다.

### Router는 뚜렷한 주제별 expert를 만들지 않았다

연구진은 The Pile validation subset에서 expert 선택을 분석했다. ArXiv·PubMed Abstracts·PhilPapers 같은 domain의 선택 분포는 매우 비슷했고, synthetic DM Mathematics만 작은 차이를 보였다. Figure 8은 Python indentation, 특정 token과 연속 token에서 반복 선택되는 구문·위치 locality를 보여 줬다.

이는 expert가 아무 역할도 학습하지 않았다는 뜻이 아니다. 다만 `expert 1=과학`, `expert 2=코드`처럼 사람이 붙인 domain module 해석을 지지하지 않는다. Router path는 실행 위치를 보여 줄 뿐 출력의 충실한 인과 설명도 아니다.

## 검증과 한계

### 자주 생기는 오해

- **Meta가 만들었다:** Mistral AI 모델이다.
- **2024년에 처음 공개됐다:** Weight 공개는 2023년 12월 11일, 논문 v1은 2024년 1월 8일이다.
- **8x7B이므로 56B model이다:** Shared weight 때문에 total은 46.7B다.
- **두 expert만 쓰므로 active는 정확히 14B다:** Shared path를 포함한 보고값은 12.9B다.
- **12.9B dense model과 비용이 같다:** 전체 46.7B memory, router·dispatch·memory bandwidth와 batch 조건이 남는다.
- **Expert가 domain별로 전문화됐다:** 논문 §5는 뚜렷한 topic pattern을 찾지 못했다.
- **Llama 2 70B보다 모든 benchmark에서 높다:** HellaSwag·WinoGrande·TriviaQA 등 낮은 항목이 있다.
- **Open source이므로 학습을 완전히 재현할 수 있다:** Apache 2.0 weight 공개와 training data·recipe 공개는 별개다.
- **공개와 benchmark만으로 production-ready가 입증됐다:** Model weight·runtime과 특정 hardware·traffic·SLO에서의 시스템 검증은 별개다.

### 남는 한계

논문은 강한 benchmark와 routing 관찰을 제공하지만 pretraining corpus와 전체 학습 계산을 자세히 공개하지 않았다. 비교 대상과 동일한 data·tokenizer·training budget의 dense ablation도 없다. Active parameter와 benchmark quality만으로 training cost, single-request latency, energy, factuality와 safety를 함께 판정할 수 없다.

본문의 topic·locality 비교는 layer 0·15·31에 집중했고 Appendix Figure 10은 모든 layer의 expert frequency를 제공한다. 다른 seed·checkpoint·data에서 같은 pattern이 재현되는지, expert 제거가 특정 기능을 선택적으로 손상하는지는 별도 실험이 필요하다.

## 학습 확인

### 확인 질문

1. `8x7B`와 46.7B total·12.9B active parameter가 서로 다른 이유는 무엇인가?
2. Active parameter가 적어도 serving memory와 latency가 같은 비율로 줄지 않는 이유는 무엇인가?
3. Mixtral의 routing 분석은 domain specialization 주장을 어떻게 제한하는가?

### 다음 문서

- [[source.097|Mixtral의 생산 배포 효율 주장과 증거 경계]] — 097Mixtral의 생산 배포 효율 주장과 증거 경계 — 공개 가중치·benchmark·추론 경로가 입증하는 범위와 실제 운영 검증에 더 필요한 측정을 구분한다.
- [[source.103|GLaM에서 Mixtral까지의 희소 MoE 확장]] — GLaM의 내부 통제 비교와 Mixtral 공개를 역사·증거 수준별로 연결한다.

## 출처

- Albert Q. Jiang 외, [Mixtral of Experts](https://arxiv.org/abs/2401.04088), arXiv:2401.04088, 2024, §§1–6과 Tables 1–5.
- Mistral AI, [Mixtral of experts](https://mistral.ai/news/mixtral-of-experts/), 2023-12-11.
- [[097_Mixtral의 생산 배포 효율 주장과 증거 경계]]
- [[GLaM에서 Mixtral까지의 희소 MoE 확장]]
- 프로젝트 보존 자료: `raw/097_Mixtral & Sparse MoE Production-Ready Efficient Language Models Through Sparse Mixture of Experts.ko.md`, `raw/097_Mixtral & Sparse MoE Production-Ready Efficient Language Models Through Sparse Mixture of Experts.commentary.ko.md`.
- 프로젝트 보존 자료: `raw/103_Mixture of Experts at Scale Efficient Scaling Through Sparse Activation and Dynamic Routing.ko.md`, `raw/103_Mixture of Experts at Scale Efficient Scaling Through Sparse Activation and Dynamic Routing.commentary.ko.md`.

## 관련 항목

- [[source.097|Mixtral의 생산 배포 효율 주장과 증거 경계]]
- [[source.103|GLaM에서 Mixtral까지의 희소 MoE 확장]]
- [[concept.전문가-혼합|전문가 혼합]]
- [[concept.transformer|Transformer]]
- [[source.069|전문가 혼합과 희소 활성 스케일링]]
- [[concept.대규모-언어-모델|대규모 언어 모델]]
