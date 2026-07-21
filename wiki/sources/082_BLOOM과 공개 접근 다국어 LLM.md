---
schema_version: 2
id: source.082
page_type: source
title: BLOOM과 공개 접근 다국어 LLM
aliases:
  - 082_BLOOM Open-Access Multilingual Language Model and the Democratization of AI Research
  - BLOOM Open-Access Multilingual Language Model
  - BLOOM과 AI 연구 민주화
tags:
  - type/source
  - domain/ai
  - domain/computer-science
  - domain/nlp
  - domain/machine-learning
  - domain/academia
created: '2026-07-21'
updated: '2026-07-21'
lifecycle: active
verification: verified
artifacts:
  - 'raw/082_BLOOM Open-Access Multilingual Language Model and the Democratization of AI Research.ko.md'
  - 'raw/082_BLOOM Open-Access Multilingual Language Model and the Democratization of AI Research.commentary.ko.md'
evidence:
  - source_id: bigscience-workshop-2022-bloom
    locator: '초록, §§2.2·3.1–3.5·4.2–4.9·5와 Tables 1·3–4의 협업 범위, ROOTS, 구조·tokenizer·계산·학습량, 평가와 한계'
    relation: supports
  - source_id: bigscience-2022-bloom-model-card
    locator: 'Basics, Technical Specifications, Training Data, Speeds/Sizes/Times, Intended Use, Risks and Limitations의 출시일·정확한 매개변수·구조·350B token 표기·checkpoint 크기·용도·위험'
    relation: supplements
  - source_id: laurencon-et-al-2023-roots
    locator: '초록과 §§1–5, Appendix A의 1.6TB·498개 구성 dataset·gated large initial subset·출처별 release·governance·대표성 한계'
    relation: supports
  - source_id: bigscience-2022-bloom-rail
    locator: 'Preamble, §I.2·6, §§II–III와 Attachment A의 model·data·complementary material 구분, 재배포 조건과 use-based restrictions'
    relation: supports
  - source_id: akiki-et-al-2022-bigscience-case-study
    locator: '§3과 Figure 1의 1,200명 초과 등록자, 추적 가능한 직접 기여자 365명, 거주지 확인 308명·38개국이라는 서로 다른 집계 범위'
    relation: supports
  - source_id: meta-2022-opt-175b-release
    locator: '2022-05-03 발표의 OPT-175B와 code·logbook·연구용 접근 공개 설명'
    relation: disputes
related:
  - concept.bloom
  - source.062
  - source.074
  - source.076
  - source.079
  - concept.대규모-언어-모델
  - concept.말뭉치-기반-학습
  - analysis.데이터-품질과-분포-다양성은-같은-축인가
---
# BLOOM과 공개 접근 다국어 LLM

> [!note] 학습 안내
> **난이도:** 중급<br>
> **선수 지식:** [[대규모 언어 모델]], [[말뭉치 기반 학습]], [[062_XLM과 교차 언어 사전 학습]]<br>
> **읽고 나면:** BLOOM의 구조·학습 자료·공개 범위를 수치와 라이선스로 설명하고, 공개 접근·공개 가중치·오픈 소스·민주화를 서로 다른 주장으로 구분할 수 있다.

## 1단계 — 먼저 잡을 핵심

### 핵심 문장

BigScience는 2022년 7월 **176,247,271,424개 매개변수**를 가진 디코더 전용 Transformer BLOOM의 가중치와 개발 자료를 공개했다. BLOOM은 46개 자연어와 13개 프로그래밍 언어를 포함한 ROOTS 말뭉치로 학습됐고, 프랑스 공공 슈퍼컴퓨터 Jean Zay에서 국제 협업으로 개발됐다.

역사적 의미는 단순한 모델 크기 기록보다 공개 범위를 여러 층으로 넓힌 데 있다. 연구자는 checkpoint를 내려받아 폐쇄형 API보다 더 직접적으로 모델을 조사할 수 있었고, 논문·model card·훈련 기록·데이터 문서·code가 함께 제공됐다. 그러나 model 가중치는 이용 제한이 있는 BigScience RAIL License v1.0, code는 Apache 2.0, ROOTS 구성 자료는 각 원천의 권리와 release 조건을 따른다. 따라서 이 사례 전체를 조건 없는 **오픈 소스**라고 한 단어로 묶으면 실제 권한 구조가 사라진다.

### 왜 중요했는가

당시 초거대 언어 model은 학습 계산과 운영 비용 때문에 소수의 자원 풍부한 조직에 집중됐다. 가중치를 공개하지 않고 API만 제공하면 외부 연구자는 내부 표현, fine-tuning, 재현성, 언어별 실패를 조사하는 데 제약을 받는다. BLOOM은 공공 계산 자원과 여러 작업반의 협업으로 1,000억 매개변수급 model을 기업 밖에서 만들고, 그 산출물을 외부 연구의 대상으로 제공한 사례다.

동시에 BLOOM 자체가 접근 격차를 없앴다는 뜻은 아니다. Model card가 기록한 bf16 가중치만 약 329GB이고 optimizer 상태를 포함한 전체 checkpoint는 약 2.3TB였다. 가중치를 받을 법적·기술적 통로가 생긴 것과 이를 실행·미세조정할 GPU, 저장 공간, 전력, 전문 인력을 얻는 것은 별도 문제다. 이 문서에서 **민주화**는 완성된 결과가 아니라 어떤 장벽을 낮췄고 어떤 장벽이 남았는지 평가해야 하는 주장이다.

### 이 문서의 범위

이 문서는 BLOOM 논문과 model card, ROOTS 논문, RAIL 원문, BigScience 협업 연구를 이용해 raw의 기술·역사 서사를 검증한다. 후속 model과 정책에 영향을 주었다는 포괄적 인과는 직접 추적 근거가 없으므로 핵심 사실로 채택하지 않는다. 성능도 특정 benchmark와 prompt 조건으로 한정하며 모든 언어·과제의 최첨단이라는 표현을 사용하지 않는다.

## 2단계 — 작동 원리

### 디코더 전용 Transformer

BLOOM은 앞선 token을 조건으로 다음 token의 확률을 예측하는 자기회귀 **decoder-only Transformer**다. 최종 176B model은 70개 layer, 112개 attention head, 14,336차원 hidden state를 사용했고 학습 sequence 길이는 2,048 token이었다. 정확한 매개변수 수는 반올림한 176B가 아니라 176,247,271,424개이며, 이 중 약 36억 개가 embedding 매개변수다.

기본 GPT형 구조에는 두 가지 중요한 변경이 들어갔다.

1. **ALiBi 위치 정보:** 위치 vector를 embedding에 더하는 대신 key와 query의 거리에 따라 attention score에 선형 bias를 준다.
2. **Embedding LayerNorm:** 첫 embedding layer 직후 layer normalization을 추가해 대규모 학습의 안정성을 높였다. 논문은 작은 규모의 실험에서 zero-shot 일반화에 불리한 면도 관찰했다고 기록하므로, 이를 무조건적인 성능 향상 장치로 부르면 안 된다.

Tokenizer는 250,680개 vocabulary를 가진 byte-level BPE다. Byte에서 시작하므로 알 수 없는 token을 피하고 언어 사이에서 vocabulary를 공유할 수 있지만, 공통 tokenizer 하나가 언어별 token 효율과 성능을 같게 만든다는 뜻은 아니다.

### ROOTS에서 학습 token까지

ROOTS는 498개 Hugging Face dataset을 합친 약 1.61TB 말뭉치다. 자연어 46개와 programming language 13개를 포함하지만, 언어별 자료량은 크게 다르다. 예를 들어 model card의 분포표에서 일부 Niger-Congo 언어의 비중은 극히 작다. **언어가 목록에 있음**, **충분한 자료가 있음**, **그 언어에서 잘 작동함**은 서로 다른 검증 단계다.

Token 수는 문헌의 측정 범위를 붙여 읽어야 한다.

- Model card는 전처리한 약 1.6TB를 **350B unique token**으로 적는다.
- 최종 논문은 ROOTS가 약 **341B token**이라고 보고한다.
- 176B model의 실제 학습 노출량은 scaling law 수정에 대응해 반복 자료 25B token을 더한 **366B token**이다.

350B와 341B는 corpus 판본·집계 표현이 다른 보고값이며, 366B는 고유 corpus 크기가 아니라 model이 학습 중 처리한 총 token 수다. 이 셋을 하나의 고정 수치로 합치면 반복 학습 여부가 사라진다.

### 공공 계산 자원과 분산 학습

BLOOM은 GENCI가 소유하고 IDRIS가 운영하는 Jean Zay에서 약 3.5개월 동안 학습됐다. 최종 학습에는 48개 node의 NVIDIA A100 80GB GPU 384개가 쓰였고, 논문은 1,082,990 GPU-hours를 보고한다. Megatron-DeepSpeed가 data·tensor·pipeline parallelism과 ZeRO를 결합해 model·activation·optimizer state를 여러 장치에 나눴다.

이 사실은 기업 밖 협업이 초거대 model을 실제로 훈련할 수 있음을 보여 주지만, 계산 자원이 분산됐다는 뜻은 아니다. 단일한 국가급 HPC allocation이 없었다면 같은 실험은 어려웠다. 공개 협업과 중앙집중된 계산 기반이 함께 존재한 사례로 읽어야 한다.

## 3단계 — 기술과 근거

### 공개 범위는 artifact마다 다르다

| 층 | 실제로 공개된 것 | 적용 조건 | 과장하면 생기는 오류 |
| --- | --- | --- | --- |
| 논문·문서 | 구조, 학습·평가, 협업·위험 기록 | 문서별 배포 조건 | 문서 공개를 완전 재현으로 간주 |
| Model 가중치 | BLOOM checkpoint와 중간 checkpoint 일부 | BigScience RAIL v1.0의 이용·재배포 제한 | 조건 없는 public domain 또는 오픈 소스라고 부름 |
| Code | BLOOM 학습·실행 code와 도구 | 논문이 Apache 2.0이라고 명시 | code license를 weight와 data에 확대 |
| ROOTS | 큰 초기 subset, 처리 도구, 구성별 data card | gated access·윤리 헌장 동의·원천별 license와 governance | 1.61TB의 모든 원문이 단일 자유 license로 배포됐다고 주장 |

RAIL 원문은 `Data`가 해당 license의 대상이 아니라고 명시한다. Model과 파생물은 무료 이용·재배포가 가능하지만 Attachment A의 use-based restriction을 따라야 하고, 재배포자는 후속 이용자에게 같은 제한을 전달해야 한다. 반면 complementary material과 code의 권리는 별도다. 따라서 **open access**, **open weights**, **open-source code**를 구분하는 것이 정확하다.

### 협업 규모도 집계 기준이 필요하다

BigScience 공식 협업 연구는 1,200명 넘게 communication channel에 등록했다고 보고한다. 그중 공개 artifact에 직접 기여한 사실을 추적할 수 있었던 사람은 365명이었고, 거주지를 확인한 308명이 38개국에 분포했다. `등록자`, `추적 가능한 직접 기여자`, `지리 정보가 있는 기여자`는 다른 모집단이다.

따라서 raw의 “70여 개국 출신 1,000명 이상이 개발했다”는 문장은 공식 집계와 맞지 않는다. 더 정확한 설명은 **1,200명 초과 등록, 365명 추적 가능한 직접 기여, 지리 정보가 있는 308명·38개국**이다. 이 큰 규모는 협업 범위를 보여 주지만 참여 시간, 의사 결정 권한, 보상과 자원의 균등 분배를 입증하지는 않는다.

### 성능은 model·조건·언어별로 읽는다

BLOOM 논문은 여러 benchmark에서 경쟁력 있는 결과를 보고했지만 모든 과제에서 일관되게 앞섰다고 말하지 않는다. 영어 SuperGLUE 비교에서는 zero-shot에서 대체로 OPT보다 뒤지고 one-shot에서 일부 과제를 앞서거나 맞췄으며, model family 전체에는 일관된 차이가 없었다. 번역에서는 prompt와 언어쌍에 따라 결과가 크게 달랐고, 논문은 훈련에 포함된 저자원 언어의 품질에 의문을 제기했다.

다중 과제 prompt 미세조정 뒤 더 강한 결과를 낸 model은 **BLOOMZ**다. BLOOM의 사전학습 결과와 BLOOMZ의 별도 13B-token multitask finetuning 결과를 섞으면 공개 base model의 능력을 과대평가하게 된다. [[079_HELM과 다차원 언어 모델 평가|HELM]]의 관점처럼 model 이름만 아니라 checkpoint, prompt, shot 수, 언어, metric을 함께 기록해야 한다.

### “그 규모에서 최초”가 아닌 이유

Meta는 2022년 5월 3일 이미 OPT-175B와 code·training logbook을 연구 공동체에 공유한다고 발표했다. BLOOM model card의 출시일은 2022년 7월 11일로 기록돼 있다. 접근 대상과 license가 같지는 않지만, **BLOOM이 이 규모에서 처음 공개된 LLM**이라는 단정은 시간 순서상 성립하지 않는다.

BLOOM의 구별점은 최초라는 순위보다 다국어 ROOTS, 공공 계산 자원, 국제 작업반, downloadable checkpoint, model card·RAIL을 한 개발 과정에 묶었다는 데 있다. 이 구체적 조합은 1차 자료로 확인할 수 있다.

## 검증과 한계

### raw 설명의 검증 정정

- **BLOOM은 그 규모에서 처음 공개된 model이다:** OPT-175B가 2022년 5월 먼저 공개됐고 BLOOM은 7월 공개됐다. 두 공개의 대상·조건이 달랐다는 점은 비교하되, 최초라는 표현은 쓰지 않는다.
- **70여 개국 연구자 1,000명 이상이 개발했다:** 공식 사후 집계는 1,200명 초과 등록, 365명 추적 가능한 직접 기여, 거주지가 확인된 308명·38개국이다.
- **46개 언어를 지원하고 편향을 해소했다:** 정확한 범주는 46개 자연어와 13개 programming language다. 포함량이 극도로 불균형하고 model card도 관점 과대·과소대표, stereotype, 차별적 출력 위험을 명시한다.
- **학습 data·weight·code가 모두 자유롭게 공개됐다:** weight는 RAIL, code는 Apache 2.0, data는 RAIL에서 명시적으로 제외된다. ROOTS 논문은 전체가 아니라 gated인 큰 초기 subset 공개와 source별 release 전략을 설명한다.
- **BLOOM은 모든 언어와 과제에서 최첨단이었다:** 원 논문은 경쟁력 있는 결과와 조건별 차이를 보고한다. 별도 multitask fine-tuning model BLOOMZ의 결과도 base BLOOM과 구분해야 한다.
- **BLOOM이 AI 연구를 민주화했다:** 외부 감사·변형 가능성을 넓힌 것은 확인할 수 있지만 실행 계산, 저장, 전문성, 참여 권한의 격차는 남았다. 공개는 민주화의 한 조건이지 완료 판정이 아니다.
- **후속 다국어 연구와 정책에 직접 영향을 주었다:** 현재 사용한 1차 자료는 BLOOM의 개발·공개를 입증하지만 광범위한 후속 인과를 추적하지 않는다. 구체적 후속 문헌이 명시적으로 계보를 밝힐 때 별도로 검증해야 한다.

### 다국어성의 한계

말뭉치의 언어 수는 포괄성을 측정하는 시작점일 뿐이다. 언어별 byte·token 양, 자료 장르, 저작권·동의, tokenizer fertility, 평가 자료의 품질과 실제 model 행동이 모두 다를 수 있다. ROOTS는 native speaker가 정제 기준에 참여하고 구성 data를 문서화하려 했지만, Common Crawl 사용과 privacy·consent의 긴장도 자체 한계로 기록했다.

Model card는 BLOOM이 일부 관점을 과대대표하고 다른 관점을 과소대표할 수 있으며 stereotype, 개인 정보, 혐오·차별 언어와 사실처럼 보이는 오답을 생성할 수 있다고 명시한다. 여러 언어를 포함한 설계와 bias 제거는 같은 주장이 아니다.

### 공개와 재현의 한계

Checkpoint와 code가 있어도 정확한 재학습에는 ROOTS의 release 가능한 범위, 대규모 compute, 분산 학습 전문성과 당시 software·hardware 조건이 필요하다. 공개 자료는 폐쇄형 API보다 재현과 감사를 크게 돕지만, 모든 사람이 최종 model을 처음부터 다시 만들 수 있다는 뜻은 아니다.

RAIL의 use restriction은 공개와 책임을 결합하려는 규범적 선택이다. 이것이 실제 오용을 얼마나 막는지는 license 본문만으로 측정할 수 없다. 반대로 이용 제한이 존재한다는 이유만으로 checkpoint 접근과 독립 조사 가능성까지 무효가 되는 것도 아니다. 두 효과는 별도 증거로 평가해야 한다.

## 학습 확인

### 확인 질문

1. BLOOM의 341B·350B·366B token 수치는 각각 무엇을 측정하며 왜 같지 않은가?
2. BLOOM의 model weight, code, ROOTS data는 각각 어떤 공개·license 조건을 가지는가?
3. 46개 자연어가 훈련 자료에 들어갔다는 사실만으로 동일한 언어별 성능이나 bias 제거를 결론 낼 수 없는 이유는 무엇인가?

### 다음 문서

- [[BLOOM]] — 공개 접근·구조·말뭉치·협업·잔여 장벽을 재사용 가능한 model 개념으로 정리한다.
- [[데이터 품질과 분포 다양성은 같은 축인가]] — 언어 수와 실제 자료 품질·분포·평가를 분리해서 읽는다.

## 출처

- BigScience Workshop, [BLOOM: A 176B-Parameter Open-Access Multilingual Language Model](https://arxiv.org/abs/2211.05100), 2022; 초록, §§2.2·3.1–3.5·4.2–4.9·5, Tables 1·3–4.
- BigScience, [BLOOM Model Card](https://huggingface.co/bigscience/bloom), 2022; `Basics`, `Technical Specifications`, `Training Data`, `Speeds, Sizes, Times`, `Intended Use`, `Risks and Limitations`.
- Hugo Laurençon 외, [The BigScience ROOTS Corpus: A 1.6TB Composite Multilingual Dataset](https://arxiv.org/abs/2303.03915), NeurIPS Datasets and Benchmarks 2022 / arXiv 2023; 초록, §§1–5, Appendix A.
- BigScience, [BigScience RAIL License v1.0](https://huggingface.co/spaces/bigscience/license/raw/main/BLOOMLICENSE.txt), 2022; Preamble, §I.2·6, §§II–III, Attachment A.
- Christopher Akiki 외, [BigScience: A Case Study in the Social Construction of a Multilingual Large Language Model](https://arxiv.org/abs/2212.04960), 2022; §3, Figure 1.
- Meta AI, [Democratizing access to large-scale language models with OPT-175B](https://ai.meta.com/blog/democratizing-access-to-large-scale-language-models-with-opt-175b/), 2022-05-03.
- 프로젝트 번역·검토 출발 자료: [BLOOM: Open-Access Multilingual Language Model and the Democratization of AI Research](https://mbrenndoerfer.com/writing/bloom-open-access-multilingual-language-model-democratization-ai-research)
- 프로젝트 보존 자료: `raw/082_BLOOM Open-Access Multilingual Language Model and the Democratization of AI Research.ko.md`, `raw/082_BLOOM Open-Access Multilingual Language Model and the Democratization of AI Research.commentary.ko.md`.

## 관련 항목

- [[BLOOM]]
- [[062_XLM과 교차 언어 사전 학습]]
- [[074_The Pile과 대규모 언어 모델 학습 말뭉치]]
- [[076_파운데이션 모델 보고서와 AI 생태계]]
- [[079_HELM과 다차원 언어 모델 평가]]
- [[대규모 언어 모델]]
- [[말뭉치 기반 학습]]
- [[데이터 품질과 분포 다양성은 같은 축인가]]
