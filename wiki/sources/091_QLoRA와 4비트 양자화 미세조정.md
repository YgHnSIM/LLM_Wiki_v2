---
schema_version: 2
id: source.091
page_type: source
title: QLoRA와 4비트 양자화 미세조정
aliases:
  - 091_QLoRA Efficient Fine-Tuning of Quantized Language Models
  - QLoRA Efficient Finetuning of Quantized LLMs
  - 2023년 QLoRA
tags:
  - type/source
  - domain/ai
  - domain/computer-science
  - domain/machine-learning
  - domain/nlp
  - domain/optimization
created: '2026-07-22'
updated: '2026-07-22'
lifecycle: active
verification: verified
artifacts:
  - 'raw/091_QLoRA Efficient Fine-Tuning of Quantized Language Models.ko.md'
  - 'raw/091_QLoRA Efficient Fine-Tuning of Quantized Language Models.commentary.ko.md'
evidence:
  - source_id: dettmers-et-al-2023-qlora
    locator: '초록과 §§1–4의 4-bit frozen base·NF4·double quantization·paged optimizer·all-linear LoRA, §§5–6과 Tables 3–7의 MMLU·Guanaco·자동/인간 평가, §§7–8과 Appendices A–D·I–J의 비교 한계·recipe·정규성·memory 조건'
    relation: supports
  - source_id: dettmers-et-al-2023-qlora-repository
    locator: 'README의 Overview·Quantization·Paged Optimizer·Guanaco Finetuning·Known Issues·License 절과 초기 4-bit 학습/추론 구현 경계'
    relation: supports
  - source_id: hu-et-al-2022-lora
    locator: '초록과 §§1–4의 frozen pretrained weight, 저순위 update parameterization과 trainable parameter·memory 절감'
    relation: contextualizes
  - source_id: brown-et-al-2020-gpt3
    locator: '§2.1과 Table 2.1의 GPT-3 175B 규모: 원 웹글의 GPT-3.5·175B 혼동 교정'
    relation: contextualizes
  - source_id: stanford-crfm-2023-alpaca
    locator: '2023-03-13 공개 기록과 52K instruction data·LLaMA 7B full fine-tuning 설명'
    relation: contextualizes
  - source_id: lmsys-2023-vicuna
    locator: '2023-03-30 공개 기록과 ShareGPT data·8대 A100에서의 full fine-tuning·초기 80-prompt 평가 범위'
    relation: contextualizes
related:
  - source.089
  - source.090
  - source.072
  - concept.qlora
  - concept.llama-1
  - concept.지시-미세조정
  - concept.언어-모델-전이-학습
  - analysis.사전-학습-지식은-과제에-어떻게-도착하는가
  - analysis.공개-가중치와-재현-가능성은-같은-축인가
---
# QLoRA와 4비트 양자화 미세조정

> [!note] 학습 안내
> **난이도:** 중급<br>
> **선수 지식:** [[LLaMA 1]], [[언어 모델 전이 학습]], [[지시 미세조정]]<br>
> **읽고 나면:** QLoRA에서 4비트로 저장되는 것과 16비트로 계산되는 것, 동결되는 것과 학습되는 것을 구분하고, 24GB·48GB hardware 및 MMLU·Guanaco 결과의 정확한 범위를 설명할 수 있다.

## 1단계 — 먼저 잡을 핵심

### 핵심 문장

**QLoRA(Quantized Low-Rank Adaptation)**는 사전 학습 model의 가중치를 4-bit NormalFloat(NF4)로 저장해 동결하고, 사용할 때 BF16으로 역양자화하면서 별도의 LoRA adapter만 학습하는 parameter-efficient fine-tuning 방법이다. 2023년 Dettmers 등은 NF4, quantization constant를 다시 압축하는 double quantization, 순간 memory peak를 넘기는 paged optimizer를 결합해 LLaMA 65B를 단일 48GB GPU에서 미세조정했다.

이 결과를 “65B의 4-bit parameter를 소비자 GPU에서 직접 갱신했다”고 읽으면 핵심이 뒤집힌다. QLoRA에는 서로 다른 네 장부가 있다.

| 장부 | QLoRA에서 실제 상태 |
| --- | --- |
| Base weight 저장 | NF4 blockwise quantization |
| Matrix multiplication | Weight를 BF16으로 역양자화한 뒤 16-bit 계산 |
| 학습 대상 | BF16 계열 LoRA adapter; base weight는 동결 |
| Hardware 결과 | 33B는 단일 24GB consumer GPU, 65B는 단일 48GB professional GPU |

따라서 QLoRA가 줄인 중심 병목은 **동결 base weight의 저장 memory**다. Adapter parameter와 optimizer state도 작아지지만 activation, sequence length, batch, gradient checkpointing, CPU–GPU paging과 실행 시간은 사라지지 않는다.

### 논문이 실제로 입증한 것

- Full 16-bit fine-tuning으로 LLaMA 65B를 학습하려면 780GB를 넘는 memory가 필요하다는 추정과 달리 QLoRA는 48GB 미만의 단일 GPU memory envelope에 들어갔다.
- 7B–65B에서 NF4+double-quantization QLoRA와 BF16 LoRA의 5-shot MMLU 평균은 각각 53.1과 53.0이었다.
- 33B는 단일 24GB consumer GPU에서 12시간 미만, 65B는 단일 48GB professional GPU에서 약 24시간에 OASST1 recipe로 미세조정됐다.
- Guanaco 65B의 “ChatGPT 성능 99.3%”는 80개 Vicuna prompt에 대한 GPT-4 judge의 상대 점수다. 범용 능력, 사람 선호나 통계적 동등성 99.3%가 아니다.

## 2단계 — 작동 원리

### 동결된 4비트 경로와 학습되는 저순위 경로

LoRA는 pretrained matrix $W$를 직접 갱신하지 않고 update를 낮은 rank의 두 행렬로 parameterize한다.

$$
\Delta W = \frac{\alpha}{r}BA,
\qquad
y = \widehat{W}x + \frac{\alpha}{r}BAx
$$

$A\in\mathbb{R}^{r\times d_{in}}$, $B\in\mathbb{R}^{d_{out}\times r}$이고 $r$은 원래 차원보다 작다. QLoRA의 $\widehat{W}$는 packed 4-bit code로 바로 곱해지는 수학적 실수 행렬이 아니라, NF4 code와 scale에서 **계산 dtype인 BF16으로 역양자화한 값**이다. Gradient는 이 계산 graph를 지나 $A$와 $B$로 흐르지만 동결된 base $W$에는 update를 적용하지 않는다.

QLoRA 논문은 attention의 query·value projection에만 adapter를 붙인 조건보다 Transformer block의 모든 linear layer에 LoRA를 붙인 조건이 강한 baseline을 맞추는 데 중요했다고 보고했다. 전체 hyperparameter grid의 rank 8–256에서는 all-linear 조건의 차이가 작았지만, 특정 LLaMA 7B·Alpaca ablation을 모든 model과 task의 보편 법칙으로 만들 수는 없다.

### NF4는 조건부로 최적이다

NF4는 zero-centered normal distribution의 quantile을 사용해 16개 대표값의 probability mass를 비슷하게 배정한다. 따라서 가중치가 대체로 정규분포를 따른다는 가정 아래 uniform 4-bit보다 분포에 맞는 codebook을 제공한다. “모든 layer와 모든 분포에서 최적”이라는 뜻은 아니다.

실제 구현은 flattened weight를 64개 값의 block으로 나누고 block마다 scale을 둔다. 이 blockwise 처리로 layer와 outlier의 scale 차이를 국소화하지만 scale metadata가 늘어난다. Double quantization은 첫 단계 scale을 다시 FP8, block size 256으로 양자화해 이 부담을 줄인다.

$$
\frac{32}{64}=0.500\ \text{bit/parameter}
\quad\longrightarrow\quad
\frac{8}{64}+\frac{32}{64\times256}\approx0.127\ \text{bit/parameter}
$$

절감량은 평균 0.373 bit/parameter, 65B에서 약 3GB다. 이는 model weight metadata의 절감이며 activation·adapter·optimizer·allocator를 포함한 전체 training memory가 같은 비율로 감소한다는 뜻이 아니다.

### Paged optimizer는 평균 압축이 아니라 peak 대응이다

Paged optimizer는 NVIDIA unified memory를 사용해 optimizer state page를 GPU memory가 부족할 때 CPU RAM으로 내보내고 필요할 때 다시 가져온다. Gradient checkpointing과 긴 sequence mini-batch가 만드는 순간 peak에서 out-of-memory를 피하기 위한 장치다.

Paging에는 host–device transfer가 따르며, 논문은 모든 설정의 hard timing을 폭넓게 측정하지 못했다고 적었다. 65B·batch 16 조건에서 regular optimizer와 같은 속도를 관측한 한 사례를 모든 batch·interconnect·paging 빈도에서 비용이 없다는 보장으로 확대하지 않는다.

### Memory 숫자에는 조건을 붙인다

Appendix J의 Figure 8은 batch size 1, sequence length 512, gradient checkpointing 조건에서 7B·13B·33B·65B QLoRA training footprint를 각각 약 6.9GB·11.3GB·24.7GB·45.0GB로 추정한다. Attention memory는 이 추정에서 제외됐고, 더 긴 sequence와 큰 batch에서는 activation이 크게 늘 수 있다. 4-bit weight payload만 계산하면 7B가 약 3.5GB이지만, scale·adapter·optimizer·activation과 runtime buffer를 더한 실제 training footprint는 그보다 크다.

## 3단계 — 기술과 근거

### Quantization 실험과 비교 범위

논문의 Table 3은 LLaMA 7B·13B·33B·65B와 Alpaca·FLAN v2 data 조건을 합친 5-shot MMLU 평균을 다음처럼 보고한다.

| Base weight 조건 | 평균 MMLU |
| --- | ---: |
| BF16 LoRA | 53.0 |
| FP4 + double quantization LoRA | 52.2 |
| NF4 + double quantization LoRA | 53.1 |

이 표는 NF4 QLoRA가 해당 설정에서 BF16 **LoRA** 평균을 맞췄다는 근거다. Full-parameter 16-bit fine-tuning과의 통제 비교는 3B 이하 model에 한정됐고, LLaMA 7B–65B의 직접 비교 대상은 BF16 LoRA였다. 논문 §7은 자원 제약 때문에 특히 33B·65B에서 full 16-bit fine-tuning과 동등한지를 확립하지 못했다고 명시한다. 초록의 넓은 “full 16-bit fine-tuning performance” 표현은 이 비교 설계와 함께 읽어야 한다.

### Guanaco는 QLoRA 하나의 효과가 아니다

Guanaco는 OASST1 conversation tree에서 각 level의 top response를 골라 만든 9,846개 example로 LLaMA 7B·13B·33B·65B를 지도 미세조정한 family다. Full conversation의 token cross-entropy를 사용했고 RLHF는 사용하지 않았다. 결과에는 다음 요소가 함께 들어 있다.

1. LLaMA base의 scale과 pretrained representation
2. OASST1의 conversation과 top-response selection
3. QLoRA의 memory-efficient parameterization과 hyperparameter
4. Vicuna·OpenAssistant prompt, GPT-4 또는 사람 judge와 scoring protocol

Guanaco 65B의 99.3%는 80개 Vicuna prompt에서 ChatGPT의 GPT-4-judged absolute score를 100으로 놓은 양방향 평균이다. 95% confidence interval은 약 ±4.4 percentage points였고, answer order가 점수를 바꾸어 두 순서를 평균했다. Human과 GPT-4의 system rank 및 example-level agreement도 완전하지 않았다. 이 수치 하나로 범용 동등성이나 사람 선호 parity를 판정하지 않는다.

MMLU에서는 OASST1 Guanaco가 scale별로 항상 최고가 아니었다. 예를 들어 65B의 5-shot MMLU는 OASST1 62.2, untuned LLaMA 63.4, FLAN v2 tuning 63.9였다. Chat 평가에 적합한 작은 data와 지식 benchmark에 적합한 data가 같지 않다는 뜻이다. 논문이 말한 data quality는 목표 평가에 대한 **적합성**과 함께 읽는다.

### 2023년 chronology와 artifact 경계

Stanford Alpaca는 2023년 3월 13일, Vicuna는 3월 30일 공개됐다. QLoRA v1은 5월 23일 제출됐다. Alpaca와 Vicuna는 QLoRA로 만들어진 선행 성공 사례가 아니라 QLoRA 논문이 data·training convention·평가 비교에 사용한 앞선 project다.

QLoRA code의 MIT license도 Guanaco를 독립 model weight로 바꾸지 않는다. Adapter를 실행하려면 당시 신청 승인형 비상업 연구 조건이 붙은 [[LLaMA 1]] base에 접근해야 했다. Code license, adapter artifact, base weight license와 training data 조건을 따로 기록해야 한다.

## 검증과 한계

### 원 웹글의 검증 정정

- **GPT-3.5는 175B parameter다:** 175B는 GPT-3 논문의 최대 model 수치다. 원 웹글은 GPT-3.5 이름과 GPT-3 link·규모를 합쳤다.
- **13B는 weight만 50GB를 넘는다:** FP32 weight라면 약 52GB지만 BF16/FP16 weight는 약 26GB다. Full training memory는 gradient·optimizer·activation 때문에 훨씬 크므로 precision과 전체 memory를 구분한다.
- **LLaMA 7B 미세조정에는 언제나 여러 high-end GPU가 필요했다:** Full-parameter fine-tuning, LoRA, precision, batch·sequence와 offloading에 따라 달라진다. 특정 training regime 없이 hardware 수를 보편화할 수 없다.
- **QLoRA가 4-bit base를 직접 학습한다:** Base는 동결되고 NF4는 storage format이다. 계산할 때 BF16으로 역양자화하며 LoRA adapter만 갱신한다.
- **65B가 consumer GPU 한 대에서 fine-tune됐다:** 65B 사례는 단일 48GB professional GPU다. 논문이 consumer GPU라고 명시한 것은 24GB의 33B 사례다.
- **7B training memory는 약 4GB다:** 4-bit raw payload의 근사와 전체 footprint가 섞였다. Scale, adapter, optimizer, activation과 buffer를 포함해야 한다.
- **Alpaca와 Vicuna가 QLoRA를 입증했다:** 두 project가 QLoRA보다 먼저 공개됐다. QLoRA가 이들을 비교 자료로 사용했다.
- **적절한 LoRA rank 선택이 성공의 핵심이었다:** 원 실험에서는 query·value만 덮는 설정보다 all-linear layer coverage가 더 중요했고, 그 조건의 rank 8–256 grid에서는 뚜렷한 차이가 없었다. 다른 model·task에서 rank가 중요할 가능성과 원 결과를 구분한다.
- **의료·저자원 언어·code·창작에서 즉각 채택되고 비용이 수천 달러에서 수백 달러로 줄었다:** 논문은 이런 영역별 adoption이나 정확한 dollar bill을 측정하지 않았다.
- **Memory 절감이 환경 지속 가능성을 입증했다:** Training energy·power draw와 carbon emission은 직접 측정하지 않았다. Appendix B에는 사용 주체와 3.5배 batch-1 NF4 inference 효율을 가정한 72% energy 절감 추정이 있지만, 이를 fine-tuning carbon 개선으로 일반화할 수 없다. BF16 compute·재계산·paging·runtime과 전력 구성이 별도 변수다.

### 구현과 일반화의 경계

Official repository의 초기 known issues에는 당시 4-bit inference가 느릴 수 있다는 점, LoRA trainer resume 미지원과 fp16 compute 불안정성이 포함됐다. 이는 2023년 snapshot의 구현 경계이며 현재 library version에 그대로 적용하거나 반대로 지워서는 안 된다. NF4·compute dtype·target module·batch와 kernel option이 같지 않으면 `4-bit LoRA`라는 이름만으로 paper recipe가 재현되지 않는다.

QLoRA는 memory-efficient adaptation 방법이지 안전 정렬 방법이 아니다. Guanaco가 OASST1에서 SFT됐다는 사실은 truthfulness·harmlessness·multilingual 품질을 보장하지 않는다. Fine-tuning 접근 확대가 beneficial adaptation과 misuse에 미치는 순효과도 별도 threat model과 deployment evidence가 필요하다.

### 확인되는 영향과 아직 남는 질문

확인되는 변화는 큰 공개 base model의 여러 dataset·adapter 설정을 단일 device memory budget에서 반복 비교할 수 있게 됐다는 것이다. 논문은 1,000개가 넘는 fine-tuned model 실험을 수행했다. 이는 저자들의 experiment 수이지 독립 조직 1,000곳의 adoption 지표는 아니다.

후대 생태계 확산, 비용 분포, 작은 조직의 참여 변화와 환경 효과를 확인하려면 model card·repository history·hardware invoice·energy measurement·사용자 조사 같은 별도 자료가 필요하다. QLoRA가 VRAM이라는 큰 장벽을 낮춘 사실은 강하지만 접근의 모든 법적·경제적·기술적 층을 해결했다고 말하지 않는다.

## 학습 확인

### 확인 질문

1. QLoRA에서 NF4 storage, BF16 compute와 trainable LoRA adapter는 각각 어떤 역할을 하는가?
2. 65B의 48GB 결과를 “consumer hardware”로 일반화할 수 없는 이유와 memory 숫자에 붙여야 할 조건은 무엇인가?
3. Guanaco의 99.3%를 QLoRA algorithm 하나의 범용 성능으로 해석할 수 없는 이유는 무엇인가?

### 다음 문서

- [[QLoRA]] — Algorithm의 구성요소와 memory 장부를 재사용 가능한 개념으로 정리한다.
- [[사전 학습 지식은 과제에 어떻게 도착하는가]] — 전체 가중치 갱신, prompt-only adaptation과 frozen base·adapter 경로를 비교한다.
- [[공개 가중치와 재현 가능성은 같은 축인가]] — Base weight·adapter·code의 서로 다른 license와 실행 가능성을 공개 장부에 놓는다.

## 출처

- Michael Brenndoerfer, [QLoRA: Efficient Fine-Tuning of Quantized Language Models](https://mbrenndoerfer.com/writing/qlora-efficient-finetuning-quantized-language-models), 프로젝트 수집 원 웹글.
- Tim Dettmers 외, [QLoRA: Efficient Finetuning of Quantized LLMs](https://proceedings.neurips.cc/paper_files/paper/2023/file/1feb87871436031bdc0f2beaa62a049b-Paper-Conference.pdf), NeurIPS 2023, §§1–8, Appendices A·D·J.
- Tim Dettmers 외, [QLoRA official repository](https://github.com/artidoro/qlora), README의 Overview·Quantization·Paged Optimizer·Guanaco Finetuning·Known Issues·License.
- Edward J. Hu 외, [LoRA: Low-Rank Adaptation of Large Language Models](https://openreview.net/forum?id=nZeVKeeFYf9), ICLR 2022, §§1–4.
- Stanford CRFM, [Alpaca: A Strong, Replicable Instruction-Following Model](https://crfm.stanford.edu/2023/03/13/alpaca.html), 2023-03-13.
- LMSYS Org, [Vicuna: An Open-Source Chatbot Impressing GPT-4 with 90% ChatGPT Quality](https://lmsys.org/blog/2023-03-30-vicuna/), 2023-03-30.
- Tom B. Brown 외, [Language Models are Few-Shot Learners](https://arxiv.org/abs/2005.14165), NeurIPS 2020, §2.1과 Table 2.1.
- 프로젝트 보존 자료: `raw/091_QLoRA Efficient Fine-Tuning of Quantized Language Models.ko.md`, `raw/091_QLoRA Efficient Fine-Tuning of Quantized Language Models.commentary.ko.md`.

## 관련 항목

- [[QLoRA]]
- [[089_LLaMA 1과 제한적 공개 가중치 연구 배포]]
- [[090_공개 가중치 LLM 파동과 서로 다른 공개 범위]]
- [[072_지시 미세조정과 FLAN의 제로샷 일반화]]
- [[LLaMA 1]]
- [[지시 미세조정]]
- [[언어 모델 전이 학습]]
- [[사전 학습 지식은 과제에 어떻게 도착하는가]]
- [[공개 가중치와 재현 가능성은 같은 축인가]]
