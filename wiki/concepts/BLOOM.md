---
schema_version: 2
id: concept.bloom
page_type: concept
title: BLOOM
aliases:
  - BigScience Large Open-science Open-access Multilingual Language Model
  - BLOOM-176B
  - BigScience BLOOM
tags:
  - type/concept
  - domain/ai
  - domain/computer-science
  - domain/nlp
  - domain/machine-learning
  - domain/academia
created: '2026-07-21'
updated: '2026-07-22'
lifecycle: active
verification: verified
artifacts:
  - 'raw/082_BLOOM Open-Access Multilingual Language Model and the Democratization of AI Research.ko.md'
  - 'raw/082_BLOOM Open-Access Multilingual Language Model and the Democratization of AI Research.commentary.ko.md'
  - 'raw/110_Specialized LLMs for Low-Resource Languages Complete Guide to AI Equity and Global Accessibility.ko.md'
  - 'raw/110_Specialized LLMs for Low-Resource Languages Complete Guide to AI Equity and Global Accessibility.commentary.ko.md'
evidence:
  - source_id: bigscience-workshop-2022-bloom
    locator: '초록, §§2.2·3.1–3.5·4.2–4.9·5와 Tables 1·3의 model 정의, ROOTS, 구조·tokenizer·학습량, 평가 범위'
    relation: supports
  - source_id: bigscience-2022-bloom-model-card
    locator: 'Basics, Technical Specifications, Training Data, Speeds/Sizes/Times, Intended Use, Risks and Limitations의 공개 artifact·구조·resource·용도·위험'
    relation: supports
  - source_id: laurencon-et-al-2023-roots
    locator: '초록과 §§1–5, Appendix A의 498개 dataset·1.6TB·59개 언어 범주·부분 gated release·governance와 대표성 한계'
    relation: supplements
  - source_id: bigscience-2022-bloom-rail
    locator: 'Preamble, §I.2·6, §§II–III와 Attachment A의 model·data·code 역할 구분과 이용·재배포 제한'
    relation: supports
  - source_id: akiki-et-al-2022-bigscience-case-study
    locator: '§3과 Figure 1의 등록·직접 기여·지리 정보별 참여자 집계와 협업 한계'
    relation: contextualizes
  - source_id: meta-2022-opt-175b-release
    locator: '2022-05-03 OPT-175B 연구용 공개 발표로 확인하는 동시대 공개 model의 선행 사례'
    relation: contextualizes
  - source_id: joshi-et-al-2020-linguistic-diversity
    locator: 'pp. 6282–6293의 언어별 자원 등급·연구 및 자원 분포와 화자 수의 비동일성'
    relation: contextualizes
  - source_id: blasi-et-al-2022-systematic-inequalities
    locator: 'pp. 5486–5505의 세계 언어별 MT·NLU·QA·TTS 등 기술 효용 격차와 사회·학술 요인 분석'
    relation: contextualizes
related:
  - source.082
  - source.110
  - source.062
  - source.074
  - source.076
  - source.079
  - concept.대규모-언어-모델
  - concept.말뭉치-기반-학습
  - concept.transformer
  - concept.저자원-언어
  - analysis.데이터-품질과-분포-다양성은-같은-축인가
  - analysis.언어-수와-언어-형평성은-같은-축인가
---
# BLOOM

> [!note] 학습 안내
> **난이도:** 중급<br>
> **선수 지식:** [[Transformer]], [[대규모 언어 모델]], [[서브워드 토큰화]]<br>
> **읽고 나면:** BLOOM을 176B decoder-only model, ROOTS, 공공 compute, 공개 artifact와 RAIL 조건의 결합으로 설명하고, 다국어·개방·민주화에 관한 서로 다른 평가 질문을 세울 수 있다.

## 1단계 — 먼저 잡을 핵심

### 한 문장 정의

**BLOOM**은 BigScience가 2022년에 공개한 176,247,271,424개 매개변수의 decoder-only Transformer로, 46개 자연어와 13개 programming language를 담은 ROOTS에서 학습되고 model weight·code·개발 문서가 서로 다른 조건으로 공개된 다국어 대규모 언어 model이다.

### 이름이 가리키는 범위

BLOOM은 *BigScience Large Open-science Open-access Multilingual Language Model*의 약자다. 이 이름의 `open-access`는 checkpoint를 내려받아 조사·실행·변형할 통로가 있다는 뜻이지 모든 artifact가 하나의 무제한 license 아래 있다는 뜻은 아니다. Weight는 BigScience RAIL v1.0, code는 Apache 2.0, ROOTS의 text는 원천별 권리와 gated release 조건을 따른다.

이 문서는 **base BLOOM**을 다룬다. Multitask prompt 자료로 추가 미세조정한 **BLOOMZ**는 같은 architecture를 쓰지만 별도 학습 단계를 거친 model이다. BLOOMZ의 instruction-following·zero-shot 결과를 base BLOOM의 사전학습 능력으로 소급하지 않는다.

### 왜 중요한가

BLOOM은 model 하나에 그치지 않고 dataset sourcing, tokenizer, 분산 학습, evaluation, model card, license와 협업 과정을 함께 연구 artifact로 만들었다. 이 결합은 외부 연구자가 폐쇄형 API를 호출하는 데서 그치지 않고 checkpoint를 직접 분석하고 새로운 평가·미세조정을 수행할 가능성을 넓혔다.

그러나 역사적 가치는 “접근 문제를 해결했다”보다 **접근의 여러 층을 분리해서 측정하게 했다**는 데 있다. Download 가능성, 실행 가능성, 재학습 가능성, dataset 권리, 협업 참여와 의사 결정 권한은 서로 대체되지 않는다.

## 2단계 — 작동 원리

### Architecture

BLOOM은 causal language modeling objective로 다음 token을 예측한다. 최종 model의 주요 규격은 다음과 같다.

| 항목 | BLOOM-176B |
| --- | ---: |
| 정확한 매개변수 | 176,247,271,424 |
| Transformer layer | 70 |
| Attention head | 112 |
| Hidden dimension | 14,336 |
| 학습 sequence length | 2,048 token |
| Vocabulary | 250,680 |

Position 정보에는 **ALiBi**를 쓴다. Key와 query가 멀수록 attention score에 거리 기반 선형 penalty를 적용해 순서를 표현한다. 또한 embedding layer 바로 뒤에 LayerNorm을 추가했다. 초기 104B 실험에서 training stability를 높였기 때문에 채택했지만, 연구진은 작은 model의 zero-shot 일반화에는 불리한 관측도 있었다고 밝혔다.

### Tokenizer와 다국어 입력

Tokenizer는 byte-level BPE다. 모든 byte를 기초 단위로 삼아 unknown token 없이 문자열을 표현하고, 언어 사이에서 subword vocabulary를 공유한다. 영어 중심의 축약형 분할이나 숫자 분할을 피했고 normalization을 적용하지 않았다.

큰 공통 vocabulary는 일부 저자원 언어의 과도한 분할을 줄이는 설계 선택이지만, 언어별 효율을 같게 만들지는 않는다. 같은 문장도 언어에 따라 token 수가 달라지고, ROOTS에서 차지하는 자료량과 장르도 다르다. Tokenizer 설계, data 비중, downstream performance는 각각 측정해야 한다.

### ROOTS와 학습 노출량

ROOTS는 498개 구성 dataset, 약 1.61TB의 text로 이뤄졌다. 46개 자연어와 13개 programming language라는 범주는 **training corpus의 구성**을 말한다. Model card의 350B unique token과 논문의 약 341B corpus token은 집계 방식이 다르며, 최종 model은 반복 data 25B를 추가해 총 366B token을 처리했다.

각 언어의 비중은 균등하지 않다. 따라서 “BLOOM이 46개 언어를 지원한다”보다 “46개 자연어가 training data에 포함됐다”고 먼저 말하는 편이 정확하다. 실제 지원 수준은 언어·과제·prompt별 evaluation으로 확인해야 한다.

46개 자연어가 목록에 들어 있다는 사실은 corpus **coverage**를 말한다. 언어별 byte·token 비중, tokenizer fertility, prompt·과제별 점수, weight를 실행할 compute, data·평가·governance에 대한 공동체의 권한은 별도 장부다. 그러므로 언어 수와 checkpoint 공개만으로 [[저자원 언어]]의 형평성이 달성됐다고 판정할 수 없다.

### Jean Zay에서의 분산 학습

최종 training은 Jean Zay의 48개 node, A100 80GB GPU 384개에서 약 3.5개월 진행됐고 1,082,990 GPU-hours를 소비했다. Megatron-DeepSpeed가 data parallelism, tensor parallelism, pipeline parallelism과 ZeRO optimizer state sharding을 결합했다.

이 인프라는 model을 여러 장치에 나누어 학습할 수 있게 했지만 compute 자체를 대중에게 분배한 것은 아니다. BLOOM의 공개성은 공공 HPC allocation에 의존했다는 조건과 함께 이해해야 한다.

## 3단계 — 기술과 근거

### 공개 접근의 네 층

1. **문서 접근:** 논문, model card, training log와 개발 기록을 읽을 수 있다.
2. **공개 가중치:** 완성 checkpoint를 받아 내부 분석, inference, 허용된 fine-tuning을 할 수 있다.
3. **오픈 소스 code:** 학습·실행 도구가 Apache 2.0으로 제공된다.
4. **Training data 접근:** ROOTS의 큰 초기 subset과 data card가 gated·source별 조건으로 공개됐다. 전체 underlying text가 단일 자유 license로 제공됐다는 뜻은 아니다.

이 네 층을 분리하면 `open access`, `open weights`, `open source`가 서로 다른 권리·재현 가능성을 준다는 점이 보인다. 특히 RAIL은 Data를 license 대상에서 제외하고, Model과 파생물에는 Attachment A의 use restriction과 재배포 고지 의무를 둔다.

### 협업은 산출물의 일부였다

BigScience는 30개 working group을 두고 data, architecture, engineering, evaluation, ethics·law와 broader impacts를 병행했다. 공식 사후 연구는 1,200명 넘는 등록자 가운데 공개 artifact에 직접 기여한 사실을 추적할 수 있는 365명과, 거주지가 확인된 308명·38개국을 별도로 집계했다.

이는 `등록`, `직접 기여`, `지리 대표성`을 같은 숫자로 말하면 안 된다는 사례다. 참여자가 많고 여러 분야를 포함했다는 사실은 확인되지만, 모든 지역의 동등한 대표성, 보상, 발언권까지 자동으로 따라오지 않는다.

### 성능 주장의 범위

BLOOM 논문은 zero-shot·one-shot prompt, translation, summarization, code generation과 bias probe를 평가했다. 결과는 language, task와 prompt에 따라 달랐으며 영어 SuperGLUE에서 OPT와 일관된 우열이 없었다. Model card는 일부 관점의 과대·과소대표, stereotype, personal information, hateful·discriminatory language와 factual error 위험을 명시한다.

그러므로 BLOOM을 `다국어 최첨단 model`이라고 blanket하게 부르기보다 다음을 함께 기록해야 한다.

- Base BLOOM인지 BLOOMZ인지
- Language와 corpus 비중
- Zero-shot인지 one-shot인지
- Prompt와 metric
- 필요한 checkpoint·inference resource
- Model card가 밝힌 out-of-scope use와 위험

### 공개가 낮춘 장벽과 남긴 장벽

공개 weight는 독립적인 probing, fine-tuning, pruning·quantization, bias·privacy audit와 재현 가능한 비교의 장벽을 낮춘다. API 제공자가 허용한 입출력만 볼 때보다 연구 질문의 범위가 넓다.

하지만 bf16 weight만 약 329GB이고 full training checkpoint는 약 2.3TB였다. 대규모 inference와 fine-tuning에는 GPU memory, storage, 전력과 전문 인력이 필요하다. 법적 접근이 계산 접근을 보장하지 않으므로, 민주화 평가는 다운로드 가능 여부만 세면 끝나지 않는다.

## 검증과 한계

### 흔한 오해

- **BLOOM은 최초의 공개 175B급 model이다:** OPT-175B의 2022년 5월 공개가 BLOOM의 7월 공개보다 앞선다. BLOOM의 구별점은 최초가 아니라 다국어 corpus·협업·artifact와 책임 있는 공개의 구체적 조합이다.
- **46개 언어를 포함했으므로 모두 잘 지원한다:** Training data에 포함된 사실과 downstream 품질은 다르다. 언어별 자료량과 결과가 불균등하다.
- **다국어 corpus가 영어 중심 bias를 제거했다:** Model card 자체가 관점 불균형, stereotype과 차별적 출력의 위험을 밝힌다.
- **BLOOM 전체가 오픈 소스다:** Code, weight, data의 license와 access 조건이 다르다.
- **ROOTS 1.6TB가 모두 자유롭게 배포됐다:** 논문은 gated인 큰 초기 subset과 source별 release·governance를 설명한다.
- **BLOOM과 BLOOMZ는 같은 model 성능이다:** BLOOMZ는 별도 multitask prompted fine-tuning을 거친 파생 model이다.
- **공개 weight가 연구 자원 격차를 없앴다:** 매우 큰 checkpoint와 inference·fine-tuning 비용이 남는다.

### 알려진 model 위험

Model card는 사실처럼 보이는 오류, 무관하거나 반복적인 출력, hateful·abusive·violent language, discriminatory content, personal information과 사람 같은 특성의 과도한 귀속을 예상 위험으로 적었다. High-stakes decision과 반드시 맞아야 하는 factual generation·summary도 out of scope로 분류했다.

RAIL의 금지 용도는 이러한 위험을 이용 조건에 반영하려는 시도다. License가 존재한다는 사실은 위험 제거 또는 실제 집행 효과를 증명하지 않는다. 반대로 model card에 위험을 기록했다는 사실도 해당 위험의 빈도와 집단별 영향을 완전하게 측정했다는 뜻이 아니다.

### 민주화는 별도 평가 질문이다

BLOOM의 1차 자료가 직접 지지하는 것은 checkpoint와 code·문서에 대한 접근 확대, 공공 compute를 이용한 국제 협업, 다국어 corpus 구축이다. 이것을 연구 참여와 benefit의 공평한 분배까지 완료됐다는 결론으로 넓힐 수 없다.

민주화를 평가하려면 누가 weight를 다운로드했는지뿐 아니라 누가 실행할 수 있었는지, 어떤 언어 공동체가 data·평가·governance 결정에 참여했는지, use restriction과 compute 비용이 누구에게 어떤 장벽이 됐는지를 따로 조사해야 한다.

## 학습 확인

### 확인 질문

1. BLOOM의 architecture에서 ALiBi와 embedding LayerNorm은 각각 어떤 역할을 하는가?
2. 공개 weight, Apache 2.0 code와 ROOTS data access는 왜 하나의 `오픈 소스` 범주로 합칠 수 없는가?
3. 언어 수와 공개 artifact 수만으로 민주화가 완료됐다고 판단할 수 없는 이유는 무엇인가?

### 다음 문서

- [[082_BLOOM과 공개 접근 다국어 LLM]] — raw 서사와 1차 자료를 대조한 기술·역사 정정을 확인한다.
- [[074_The Pile과 대규모 언어 모델 학습 말뭉치]] — 큰 corpus의 구성, 가중 분포, license와 공개 범위를 비교한다.

## 출처

- [[082_BLOOM과 공개 접근 다국어 LLM]]
- BigScience Workshop, [BLOOM: A 176B-Parameter Open-Access Multilingual Language Model](https://arxiv.org/abs/2211.05100), 2022; 초록, §§2.2·3.1–3.5·4.2–4.9·5, Tables 1·3.
- BigScience, [BLOOM Model Card](https://huggingface.co/bigscience/bloom), 2022; `Basics`, `Technical Specifications`, `Training Data`, `Speeds, Sizes, Times`, `Intended Use`, `Risks and Limitations`.
- Hugo Laurençon 외, [The BigScience ROOTS Corpus: A 1.6TB Composite Multilingual Dataset](https://arxiv.org/abs/2303.03915), NeurIPS Datasets and Benchmarks 2022 / arXiv 2023; 초록, §§1–5, Appendix A.
- BigScience, [BigScience RAIL License v1.0](https://huggingface.co/spaces/bigscience/license/raw/main/BLOOMLICENSE.txt), 2022; Preamble, §I.2·6, §§II–III, Attachment A.
- Christopher Akiki 외, [BigScience: A Case Study in the Social Construction of a Multilingual Large Language Model](https://arxiv.org/abs/2212.04960), 2022; §3, Figure 1.
- Meta AI, [Democratizing access to large-scale language models with OPT-175B](https://ai.meta.com/blog/democratizing-access-to-large-scale-language-models-with-opt-175b/), 2022-05-03.
- Pratik Joshi 외, [The State and Fate of Linguistic Diversity and Inclusion in the NLP World](https://aclanthology.org/2020.acl-main.560/), ACL 2020, pp. 6282–6293.
- Damián Blasi·Antonios Anastasopoulos·Graham Neubig, [Systematic Inequalities in Language Technology Performance across the World’s Languages](https://aclanthology.org/2022.acl-long.376/), ACL 2022, pp. 5486–5505.
- [[110_저자원 언어 LLM의 성능 격차와 전이·평가 경계]]
- 프로젝트 보존 자료: `raw/082_BLOOM Open-Access Multilingual Language Model and the Democratization of AI Research.ko.md`, `raw/082_BLOOM Open-Access Multilingual Language Model and the Democratization of AI Research.commentary.ko.md`.

## 관련 항목

- [[082_BLOOM과 공개 접근 다국어 LLM]]
- [[062_XLM과 교차 언어 사전 학습]]
- [[074_The Pile과 대규모 언어 모델 학습 말뭉치]]
- [[076_파운데이션 모델 보고서와 AI 생태계]]
- [[079_HELM과 다차원 언어 모델 평가]]
- [[대규모 언어 모델]]
- [[말뭉치 기반 학습]]
- [[Transformer]]
- [[데이터 품질과 분포 다양성은 같은 축인가]]
- [[저자원 언어]]
- [[110_저자원 언어 LLM의 성능 격차와 전이·평가 경계]]
- [[언어 수와 언어 형평성은 같은 축인가]]
