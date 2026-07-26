---
schema_version: 3
id: concept.qlora
page_type: concept
title: QLoRA
aliases:
  - Quantized Low-Rank Adaptation
  - Quantized LoRA
  - 양자화 저순위 적응
  - 양자화 LoRA
tags:
  - type/concept
  - domain/ai
  - domain/computer-science
  - domain/machine-learning
  - domain/nlp
  - domain/optimization
created: '2026-07-22'
updated: '2026-07-22'
editorial_status: active
review:
  evidence_coverage: verified
  content_mode: descriptive
artifacts:
  - raw/091_QLoRA Efficient Fine-Tuning of Quantized Language Models.ko.md
  - raw/091_QLoRA Efficient Fine-Tuning of Quantized Language Models.commentary.ko.md
  - raw/101_PEFT Beyond LoRA Advanced Parameter-Efficient Fine-Tuning Techniques.ko.md
  - raw/101_PEFT Beyond LoRA Advanced Parameter-Efficient Fine-Tuning Techniques.commentary.ko.md
evidence:
  - source_id: dettmers-et-al-2023-qlora
    locator: '초록과 §§2–4의 frozen 4-bit base·BF16 compute·NF4·double quantization·paged optimizer·all-linear LoRA, Tables 3–4와 Appendices A·C·I·J의 rank·정규성·품질·memory 조건'
    relation: supports
  - source_id: dettmers-et-al-2023-qlora-repository
    locator: 'README의 4-bit NormalFloat·bfloat16 compute·paged optimizer 설정, Guanaco 학습 예와 Known Issues·License'
    relation: supports
  - source_id: hu-et-al-2022-lora
    locator: '초록과 §§1–4의 pretrained weight 동결, 저순위 update와 trainable parameter·optimizer memory 절감'
    relation: contextualizes
  - source_id: li-et-al-2024-loftq
    locator: 'ICLR 2024, §§2.3·3.1–3.3, Eqs. 4–9와 Algorithm 1의 alternating quantization·저순위 초기화 및 이후 frozen backbone 경계'
    relation: contextualizes
relations:
  - target: source.089
    kind: related
  - target: concept.지시-미세조정
    kind: related
learning:
  difficulty:
    entry: intermediate
    target: intermediate
  prerequisites:
    - target: concept.언어-모델-전이-학습
    - target: concept.llama-1
  assumed_knowledge: 없음
  outcomes:
    - 'QLoRA를 일반 4-bit inference·full fine-tuning·LoRA-only training과 구분하고, NF4·double quantization·paged optimizer가 각각 어느 memory 항목을 줄이는지 설명할 수 있다.'
  next:
    - target: source.091
      reason: 091QLoRA와 4비트 양자화 미세조정 — 원 논문의 hardware·MMLU·Guanaco 평가와 원 웹글의 정정을 확인한다.
    - target: source.101
      reason: '101LoRA 이후 PEFT 변형의 설계 축과 연표 — LoftQ와 QLoRA의 결합 단계, AdaLoRA·DoRA·VeRA·rsLoRA의 서로 다른 설계 축을 비교한다.'
---
# QLoRA

> [!note] 학습 안내
> **난이도:** 중급<br>
> **선수 지식:** [[concept.언어-모델-전이-학습|언어 모델 전이 학습]], [[concept.llama-1|LLaMA 1]]<br>
> **읽고 나면:** QLoRA를 일반 4-bit inference·full fine-tuning·LoRA-only training과 구분하고, NF4·double quantization·paged optimizer가 각각 어느 memory 항목을 줄이는지 설명할 수 있다.

## 1단계 — 먼저 잡을 핵심

### 한 문장 정의

**QLoRA(Quantized Low-Rank Adaptation)**는 pretrained base weight를 4-bit로 양자화해 **저장하고 동결**한 뒤, 계산할 때 higher precision으로 역양자화하면서 low-rank adapter만 학습하는 parameter-efficient fine-tuning 방법이다.

이 정의에는 세 가지 분리가 들어 있다.

1. **저장과 계산:** Base weight는 NF4로 저장하지만 matrix multiplication은 대표적으로 BF16에서 한다.
2. **동결과 학습:** Base weight는 update하지 않고 LoRA의 작은 행렬만 gradient로 갱신한다.
3. **평균 memory와 peak:** NF4·double quantization은 weight와 metadata를 줄이고, paged optimizer는 순간적인 optimizer-state peak를 CPU RAM으로 넘긴다.

따라서 QLoRA는 “모든 계산을 4-bit로 하는 학습”, “4-bit base parameter의 quantization-aware training”, “단순한 4-bit inference”와 다르다. 목표는 큰 base model의 adaptation을 더 작은 device memory에 맞추는 것이다.

### 네 memory 항목을 구분한다

| 항목 | QLoRA가 다루는 방식 | 남는 조건 |
| --- | --- | --- |
| Base weight | NF4 blockwise storage | Scale metadata와 dequantization buffer |
| Trainable weight | LoRA 저순위 행렬만 학습 | Rank·target layer·optimizer 상태 |
| Activation | Gradient checkpointing과 재계산 | Batch·sequence가 커지면 증가 |
| 순간 optimizer peak | UVM paged optimizer | CPU RAM·interconnect·page 이동 비용 |

Weight payload가 4배 가까이 작아졌다는 사실만으로 전체 training memory와 wall-clock이 같은 비율로 줄었다고 결론 내리지 않는다.

## 2단계 — 작동 원리

### LoRA 경로를 base와 나란히 둔다

Pretrained linear layer의 weight를 $W\in\mathbb{R}^{d_{out}\times d_{in}}$라고 하자. LoRA는 전체 $W$를 갱신하지 않고 rank $r$의 update를 학습한다.

$$
\Delta W = \frac{\alpha}{r}BA,
\qquad
A\in\mathbb{R}^{r\times d_{in}},
\quad
B\in\mathbb{R}^{d_{out}\times r}
$$

QLoRA의 forward는 개념적으로 다음과 같다.

$$
y=\operatorname{dequant}(W_{NF4},c)x+\frac{\alpha}{r}BAx,
$$

여기서 $c$는 block scale이다. 첫 항의 base weight는 저장 중에는 packed 4-bit code지만 사용할 때 BF16 같은 compute dtype으로 복원된다. Backward graph는 base가 만든 activation을 통과하되 $W_{NF4}$는 frozen이고 $A,B$만 update한다.

이 구조는 두 절감을 결합한다. LoRA가 gradient·optimizer를 가져야 할 trainable parameter 수를 줄이고, quantization이 훨씬 큰 frozen base weight의 저장량을 줄인다. LoRA만 쓰면 base의 BF16/FP16 memory가 남고, weight quantization만 쓰면 task adaptation parameter가 생기지 않는다.

### NF4와 blockwise scaling

NF4는 zero-centered normal distribution의 quantile로 16개 code level을 정한다. 가중치가 이 분포에 가깝다는 조건에서 각 bin의 기대 probability mass를 비슷하게 배정하므로 uniform 4-bit보다 적합한 표현을 제공한다.

Model 전체를 하나의 scale로 양자화하면 outlier 하나가 resolution을 크게 해칠 수 있다. QLoRA 구현은 weight를 64개씩 block으로 나누고 block마다 scale을 둔다. Local scale은 오차를 줄이지만 parameter 64개마다 FP32 constant 하나를 추가해 0.5 bit/parameter의 metadata를 만든다.

### Double quantization

Double quantization은 weight code를 한 번 더 양자화하는 것이 아니라 첫 단계의 **scale constant**를 다시 압축한다. 논문 설정은 scale을 평균 중심화한 뒤 FP8, block size 256으로 양자화한다.

$$
0.500-\left(\frac{8}{64}+\frac{32}{64\times256}\right)
\approx0.373\ \text{bit/parameter}
$$

65B model에서는 약 3GB 절감이다. 이 수치는 quantization metadata 장부의 값이며 activation과 adapter까지 포함한 total memory 감소율이 아니다.

### Paged optimizer

Paged optimizer는 NVIDIA unified virtual memory를 사용해 memory pressure가 생길 때 optimizer state page를 CPU RAM으로 evict하고 다시 가져온다. 긴 sequence mini-batch와 gradient checkpointing이 만드는 peak를 흡수해 OOM을 피한다. 이것은 compression보다 virtual-memory trade-off에 가깝고, page 이동이 잦으면 transfer overhead가 생길 수 있다.

## 3단계 — 기술과 근거

### 정확한 2023년 recipe

[[091_QLoRA와 4비트 양자화 미세조정]]의 원 논문 recipe는 다음 결합으로 이해해야 한다.

- Base weight: 4-bit NF4, block size 64
- Quantization constant: double quantization, FP8과 두 번째 block size 256
- Compute: BF16으로 역양자화한 linear algebra
- Adapter: 모든 linear Transformer block layer에 LoRA 적용
- Memory peak: paged optimizer와 gradient checkpointing
- Base: 동결된 LLaMA·T5 family, adapter만 update

Option 하나만 같다고 paper-level QLoRA가 재현되는 것은 아니다. 특히 compute dtype, target module, batch·sequence, checkpointing과 kernel version이 memory·stability·quality를 바꾼다.

### All-linear coverage와 rank

QLoRA 논문의 LLaMA 7B Alpaca ablation에서는 query·value projection만 대상으로 한 LoRA보다 attention과 feed-forward를 포함한 모든 linear Transformer block에 adapter를 붙이는 것이 strong baseline을 맞추는 데 중요했다. 전체 hyperparameter grid의 all-linear 조건에서 rank 8·16·32·64·128·256의 차이는 작았다.

이는 rank가 언제나 무관하다는 뜻이 아니다. Model architecture, dataset, target module, rank 범위와 metric이 고정된 실험 결과다. 새로운 task에서는 layer coverage와 rank를 각각 절제해야 한다.

### QLoRA와 LoftQ는 결합 단계가 다르다

[[101_LoRA 이후 PEFT 변형의 설계 축과 연표]]가 다루는 LoftQ도 quantization과 low-rank adaptation을 결합하지만 QLoRA와 같은 recipe는 아니다. QLoRA는 frozen base를 NF4로 저장하고 사용할 때 BF16으로 역양자화하면서 all-linear LoRA adapter를 학습한다. LoftQ는 fine-tuning을 시작하기 전에 quantized matrix와 low-rank residual이 원 weight를 잘 근사하도록 quantization과 truncated SVD를 번갈아 수행해 adapter를 초기화한다.

초기화가 끝나면 LoftQ도 quantized backbone을 동결하고 low-rank factor만 학습한다. 따라서 QLoRA는 **학습 중 base 저장·계산·optimizer의 memory 경계**, LoftQ는 **quantization error를 adapter의 시작점에 나누는 경계**를 주로 바꾼다고 구분할 수 있다.

### 품질 주장의 범위

LLaMA 7B–65B와 두 instruction dataset을 합친 5-shot MMLU 평균에서 BF16 LoRA는 53.0, FP4+double-quantization LoRA는 52.2, NF4+double-quantization QLoRA는 53.1이었다. 이는 NF4 조건이 해당 BF16 LoRA 평균을 보존했다는 근거다.

반면 LLaMA 7B–65B에서 full-parameter 16-bit fine-tuning과 직접 동등함을 보인 것은 아니다. 통제된 full fine-tuning comparison은 3B 이하 model에 한정됐고 이 scale들의 직접 비교 대상은 BF16 LoRA였다. `QLoRA가 full fine-tuning 성능을 보존한다`는 문장에는 model scale·dataset·baseline 범위를 붙여야 한다.

### Hardware 주장의 범위

논문은 33B를 단일 24GB consumer GPU에서 12시간 미만, 65B를 단일 48GB professional GPU에서 약 24시간에 OASST1로 학습했다. Appendix J·Figure 8의 batch 1·sequence 512·gradient-checkpointing 조건 추정치는 7B 약 6.9GB, 13B 11.3GB, 33B 24.7GB, 65B 45.0GB이며 attention memory는 제외됐다.

이 수치는 특정 recipe와 footprint다. Sequence, batch, activation, CPU RAM과 allocator가 바뀌면 peak와 시간도 달라진다. 특히 “65B를 consumer GPU에서 학습”이나 “7B 전체 training memory가 4GB”라는 요약은 근거 범위를 넘는다.

## 검증과 한계

### 흔한 오해

- **4-bit parameter를 직접 미세조정한다:** Frozen base는 update하지 않는다. 4-bit는 storage이고 adapter는 higher precision에서 학습된다.
- **모든 연산이 4-bit다:** Base를 BF16으로 역양자화해 matrix multiplication을 수행한다.
- **Weight가 4배 작아지면 전체 memory도 4배 작다:** Activation·adapter·optimizer·scale·buffer가 남는다.
- **NF4는 어떤 tensor에도 최적이다:** Zero-centered normal distribution과 blockwise scaling이라는 조건이 붙는다.
- **Double quantization은 weight를 두 번 손상시킨다:** 두 번째 대상은 첫 단계 scale constant다.
- **Paged optimizer는 항상 더 빠르다:** Peak OOM을 피하는 대신 CPU–GPU transfer trade-off가 있다.
- **LoRA rank만 충분하면 품질이 복원된다:** 원 실험에서는 target layer coverage가 중요했고 rank 효과는 제한된 범위에서만 작았다.
- **65B가 24GB consumer GPU에 들어간다:** 24GB는 33B, 48GB professional GPU가 65B 사례다.
- **QLoRA는 alignment 방법이다:** QLoRA는 parameterization과 memory 방법이다. Objective와 behavior는 SFT·preference data·loss가 정한다.
- **Adapter를 MIT로 배포하면 base license와 무관하다:** Adapter를 결합할 base weight의 access·license와 training data 조건이 남는다.

### Training과 inference는 다른 경로다

QLoRA는 training memory를 줄이기 위해 설계됐다. Inference에서는 adapter merge, 4-bit matrix-multiplication kernel, KV cache, batch throughput과 latency가 별도 병목이다. Official repository의 초기 snapshot은 당시 4-bit inference가 느릴 수 있다고 기록했다. Training memory 절감이 inference speed-up을 자동 보장하지 않는다.

### 접근성과 환경 효과는 별도 측정 대상이다

VRAM 문턱이 낮아진 것은 논문이 직접 보인 결과다. 그러나 hardware 구매비·cloud bill·CPU RAM·전기·engineering labor, base access와 data rights까지 모두 해결된 것은 아니다. Training energy와 carbon은 직접 측정되지 않았다. Appendix B의 batch-1 NF4 inference 효율과 사용 주체 비율을 가정한 72% energy 절감 추정도 fine-tuning carbon 측정이 아니다. Memory efficiency에서 경제적 민주화나 환경 지속 가능성으로 이동하려면 사용·비용·전력 자료가 더 필요하다.

## 학습 확인

### 확인 질문

1. QLoRA에서 base weight가 NF4로 저장돼도 계산을 BF16으로 한다는 것은 무엇을 뜻하는가?
2. NF4, double quantization과 paged optimizer는 각각 weight value, metadata, peak memory 가운데 무엇을 다루는가?
3. BF16 LoRA와 비슷한 MMLU 평균을 33B·65B full-parameter fine-tuning parity로 확대할 수 없는 이유는 무엇인가?

### 다음 문서

- [[source.091|QLoRA와 4비트 양자화 미세조정]] — 091QLoRA와 4비트 양자화 미세조정 — 원 논문의 hardware·MMLU·Guanaco 평가와 원 웹글의 정정을 확인한다.
- [[source.101|LoRA 이후 PEFT 변형의 설계 축과 연표]] — 101LoRA 이후 PEFT 변형의 설계 축과 연표 — LoftQ와 QLoRA의 결합 단계, AdaLoRA·DoRA·VeRA·rsLoRA의 서로 다른 설계 축을 비교한다.

## 출처

- Tim Dettmers 외, [QLoRA: Efficient Finetuning of Quantized LLMs](https://proceedings.neurips.cc/paper_files/paper/2023/file/1feb87871436031bdc0f2beaa62a049b-Paper-Conference.pdf), NeurIPS 2023, §§2–4·7–8과 Appendices A·J.
- Tim Dettmers 외, [QLoRA official repository](https://github.com/artidoro/qlora), README의 Quantization·Paged Optimizer·Guanaco Finetuning·Known Issues.
- Edward J. Hu 외, [LoRA: Low-Rank Adaptation of Large Language Models](https://openreview.net/forum?id=nZeVKeeFYf9), ICLR 2022, §§1–4.
- 프로젝트 보존 자료: `raw/091_QLoRA Efficient Fine-Tuning of Quantized Language Models.ko.md`, `raw/091_QLoRA Efficient Fine-Tuning of Quantized Language Models.commentary.ko.md`.

## 관련 항목

- [[source.091|QLoRA와 4비트 양자화 미세조정]]
- [[source.101|LoRA 이후 PEFT 변형의 설계 축과 연표]]
- [[concept.언어-모델-전이-학습|언어 모델 전이 학습]]
- [[concept.llama-1|LLaMA 1]]
- [[source.089|LLaMA 1과 제한적 공개 가중치 연구 배포]]
- [[concept.지시-미세조정|지시 미세조정]]
