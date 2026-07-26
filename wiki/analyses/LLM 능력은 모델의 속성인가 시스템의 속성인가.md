---
schema_version: 3
id: analysis.llm-capability-model-or-system
page_type: analysis
title: LLM 능력은 모델의 속성인가 시스템의 속성인가
aliases:
  - is LLM capability a model or system property
  - 모델 능력과 시스템 능력
  - LLM 컴퓨팅 공진화 종합편
tags:
  - type/analysis
  - domain/ai
  - domain/nlp
  - domain/machine-learning
  - domain/computer-science
created: '2026-07-24'
updated: '2026-07-25'
editorial_status: active
review:
  evidence_coverage: partial
  content_mode: synthesis
artifacts:
  - raw/055_The Transformer Attention Is All You Need.ko.md
  - raw/055_The Transformer Attention Is All You Need.commentary.ko.md
  - raw/066_Scaling Laws for Neural Language Models Predicting Performance from Scale.ko.md
  - raw/066_Scaling Laws for Neural Language Models Predicting Performance from Scale.commentary.ko.md
  - raw/088_FlashAttention IO-Aware Exact Attention for Long-Context Language Models.ko.md
  - raw/088_FlashAttention IO-Aware Exact Attention for Long-Context Language Models.commentary.ko.md
  - raw/091_QLoRA Efficient Fine-Tuning of Quantized Language Models.ko.md
  - raw/091_QLoRA Efficient Fine-Tuning of Quantized Language Models.commentary.ko.md
evidence:
  - source_id: turing-1936-computable-numbers
    locator: '§§1–6의 automatic machine, configuration과 computable sequence 정의'
    relation: contextualizes
  - source_id: shannon-1948
    locator: Part I §§2–6의 discrete source·entropy·channel capacity와 coding problem
    relation: contextualizes
  - source_id: krizhevsky-et-al-2012-imagenet-cnn
    locator: '초록, §§1–3.2·5–6의 model·data·두 GTX 580 훈련 구성과 test error'
    relation: contextualizes
  - source_id: vaswani-et-al-2017-attention
    locator: '§§1·3–5와 Tables 1–3의 계산 그래프 의존성, 8개 P100 훈련과 번역 평가'
    relation: supports
  - source_id: kaplan-et-al-2020-scaling-laws
    locator: §§1.1–1.2·2–6·8의 model·data·compute별 loss와 fixed-compute 배분
    relation: supports
  - source_id: dao-et-al-2022-flashattention
    locator: '§§2.2–3.3과 Figures 1–2의 같은 exact attention, HBM–SRAM I/O와 wall-clock'
    relation: supports
  - source_id: kwon-et-al-2023-vllm
    locator: '§§2–7과 Figures 1–19의 PagedAttention·KV memory, request rate·latency와 end-to-end serving'
    relation: supports
relations:
  - target: analysis.pre-machine-computing-capability
    kind: related
  - target: analysis.language-computation-mechanical-procedure
    kind: related
  - target: analysis.early-learning-scaling-limits
    kind: related
  - target: analysis.statistical-language-model-computing-infrastructure
    kind: related
  - target: analysis.matrix-acceleration-deep-learning
    kind: related
  - target: analysis.transformer-parallelism-and-sequentiality
    kind: related
  - target: analysis.scale-as-research-variable
    kind: related
  - target: analysis.when-data-movement-dominates
    kind: related
  - target: analysis.model-capability-to-service-capability
    kind: related
  - target: analysis.n-gram에서-llm으로
    kind: related
  - target: analysis.stored-program-to-learning-framework
    kind: related
  - target: analysis.silicon-scaling-to-accelerators
    kind: related
  - target: meta.llm-system-boundary-map
    kind: related
learning:
  difficulty:
    entry: introductory
    target: preprofessional
  prerequisites: []
  assumed_knowledge: 'model, checkpoint, runtime, service contract와 능력 지표를 작은 가상 비교부터 정의한다. 시대별 세부 근거는 LLM과 컴퓨팅 능력의 공진화의 아홉 본편에서 다시 찾을 수 있다.'
  outcomes:
    - 'model이 학습한 함수와 system이 실제 제공한 결과를 분리하면서도 둘을 경쟁 설명으로 만들지 않고, 새 LLM·accelerator·serving 주장을 일곱 능력층·여섯 항목 측정 장부·네 인과 표지로 감사할 수 있다.'
  next:
    - target: meta.llm-computing-coevolution
      reason: 학습 확인 뒤의 후속 문서 연결.
---
# LLM 능력은 모델의 속성인가 시스템의 속성인가

> [!note] 학습 안내
> **난이도:** 입문 → 준전문가<br>
> **선수 지식:** 없음 — model, checkpoint, runtime, service contract와 능력 지표를 작은 가상 비교부터 정의한다. 시대별 세부 근거는 LLM과 컴퓨팅 능력의 공진화의 아홉 본편에서 다시 찾을 수 있다.<br>
> **읽고 나면:** model이 학습한 함수와 system이 실제 제공한 결과를 분리하면서도 둘을 경쟁 설명으로 만들지 않고, 새 LLM·accelerator·serving 주장을 일곱 능력층·여섯 항목 측정 장부·네 인과 표지로 감사할 수 있다.

## 1단계 — 먼저 잡을 핵심

### 짧은 답: 모델 능력은 필요하지만 관찰된 능력 전체는 아니다

Checkpoint의 weight는 입력에 어떤 출력 분포를 줄지 결정하는 핵심 상태다. 다른 weight를 가진 model은 같은 prompt와 runtime에서도 다른 답을 낼 수 있다. 그러므로 능력을 전부 hardware나 service의 속성으로 돌리면 model이 학습한 표현과 행동을 지워 버린다.

그러나 사용자가 실제로 받는 결과는 weight만으로 정해지지 않는다. Tokenizer, context truncation, numerical precision, attention kernel, sampling rule, retrieval·tool, memory budget, scheduler, timeout과 failure policy가 실행 가능한 입력·출력의 범위를 바꾼다. 따라서 다음 세 문장을 나눠야 한다.

1. **Model 능력:** 고정된 checkpoint가 정해진 평가 조건에서 어떤 품질 분포를 내는가?
2. **실행 system 능력:** 그 model을 어떤 context·precision·latency·throughput·memory 조건에서 정확히 실행할 수 있는가?
3. **Service 능력:** 실제 요청 분포와 failure 아래에서 품질·지연·가용성 계약을 반복해 만족하는가?

결론은 “모델인가 시스템인가”의 양자택일이 아니다. **Model은 행동 함수의 핵심을 소유하고, system은 그 함수를 어떤 범위와 계약으로 실현할지 결정한다.**

### 능력 주장은 하나의 숫자가 아니라 조건 묶음이다

LLM 능력 주장을 다음 tuple로 적자.

$$
\mathcal C=(\text{task},\text{input},\theta,\text{runtime},\text{resources},\text{policy},\text{metric})
$$

- $\text{task}$: 번역, 다음 token 예측, code test 통과 같은 작업
- $\text{input}$: 평가 분포, prompt와 context
- $\theta$: model architecture와 학습된 weight
- $\text{runtime}$: operator, precision, kernel와 실행 순서
- $\text{resources}$: device·memory·network·time budget
- $\text{policy}$: batching, sampling, timeout, retry와 tool 사용 규칙
- $\text{metric}$: quality, latency, throughput, energy, availability 등 판정 기준

두 system의 $\mathcal C$가 다르면 “같은 모델”이나 “같은 GPU”라는 말만으로 능력을 직접 비교할 수 없다.

### 가장 작은 구체적 예: 같은 checkpoint, 다른 관찰 결과

다음은 원 논문의 실측값이 아니라 비교법을 익히기 위한 가상 예다. 같은 checkpoint와 같은 100개 문제를 두 system이 실행한다고 하자.

| 조건 | System A | System B |
| --- | ---: | ---: |
| Context limit | 8,000 token | 4,000 token |
| Precision | FP16 | 4-bit weight 양자화 |
| Timeout | 10초 | 2초 |
| Batch policy | 요청 1개씩 | 여러 요청을 동적 batch |
| 통과한 문제 | 82/100 | 78/100 |
| 시간 안에 완료 | 100/100 | 95/100 |
| 전체 요청 성공 | 82/100 | 74/100 |

System B의 raw throughput이 더 높다고 가정해도 긴 input을 잘라내거나 timeout을 넘긴 요청이 있으면 사용자 관점 성공률은 낮아질 수 있다. 반대로 A의 task score가 높아도 요청 폭주에서 지연 계약을 못 지키면 service 능력은 낮다.

이 표에서 model weight는 같으므로 82와 78의 차이를 “모델 지능” 차이라고 부를 수 없다. 그렇다고 system만 중요하다는 뜻도 아니다. 두 system 모두 해당 checkpoint가 학습하지 못한 지식과 추론을 hardware만으로 새로 만들 수는 없다.

## 2단계 — 작동 원리

### 아홉 시대를 하나의 병목 이동으로 읽는다

| 시대 | 기존 병목 | 대응 | 새로 실현된 능력 | 보장되지 않은 것·다음 병목 |
| --- | --- | --- | --- | --- |
| 기계 이전 | 반복 산술의 시간·오류 | 표·분업·독립 검산 | 계산 결과의 재사용·조직적 신뢰 | 표 제작 비용·적용 범위 |
| 형식 계산·stored program | 사람에게 묶인 절차 | 기호 규칙·machine·memory의 program | 절차의 기계적 실행·재프로그래밍 | 효율·유한 자원·문제 표현 |
| 초기 학습 | 규칙의 수작업 작성 | Perceptron·LMS의 parameter update | 자료에서 decision boundary 조정 | 비선형 표현·data·compute |
| 통계 언어 처리 | 언어 규칙의 취약성 | Corpus count·HMM·search | 확률 추정과 data-driven decoding | 희소성·table·CPU·network |
| GPU 딥러닝 | 큰 dense model의 학습 시간 | Batch tensor·CUDA·cuDNN·framework | 큰 CNN의 반복 가능한 훈련 | Device memory·kernel·통신 |
| Transformer | Recurrent 위치 의존 | Self-attention·position-wise FFN | 훈련 위치 병렬성과 짧은 path | $T^2$ attention·생성 순차성 |
| 규모화 | Model·data 선택의 경험칙 | Scaling law·distributed training | Compute budget을 설계 변수로 사용 | 통신·energy·data quality |
| Memory-aware 실행 | FLOP 처리량 중심 최적화 | Mixed precision·tiling·fusion·sparsity | 같은 수학의 더 높은 실현 효율 | 정확도·지원 shape·복잡한 runtime |
| 서비스 | Checkpoint benchmark 중심 | KV cache·batching·quantization·scheduler | 반복 요청의 latency·throughput 제공 | Tail·failure·access·cost |

각 행은 앞선 능력을 폐기하지 않고 그 위에 새 실행 조건을 더한다. 오늘의 LLM service에도 검산, formal procedure, probability, gradient, matrix kernel과 network scheduling이 동시에 들어 있다.

### 세 연결고리가 추가한 중간 층

아홉 시대만 순서대로 읽으면 장과 장 사이의 변환을 한 문장으로 압축하기 쉽다. 세 연결고리는 이 압축을 다음처럼 풀었다.

| 연결고리 | 종합편에 추가한 구분 | 막는 오해 |
| --- | --- | --- |
| [[N-gram에서 LLM으로]] | Sparse probability 재분배, 완전한 neural LM, 표현 학습, 조건부 생성과 Transformer training workload | N-gram 표가 커져 그대로 LLM이 됐다. |
| [[저장 프로그램에서 학습 프레임워크까지]] | Instruction, compiler, numeric primitive, reverse-mode AD, accelerator library와 graph runtime | 저장 프로그램이 곧 현대 framework였거나 고수준 tensor code만으로 실행이 설명된다. |
| [[집적도 증가에서 가속기까지 무엇이 더 필요했나]] | Component density, device scaling, power·memory wall, parallel programming과 domain specialization | Moore의 법칙이 GPU·TPU·LLM 성능을 직접 만들었다. |

이 보강으로 model–system 경계는 hardware와 model 사이의 한 선이 아니라, **표현할 workload, 번역할 software, 공급할 data, 실행할 silicon·memory, 측정할 결과 계약**이 연결되는 여러 interface가 된다.

### 병목은 사라지기보다 지배 항이 바뀐다

전체 시간에서 가장 큰 항을 줄이면 다음 항이 보이기 시작한다. 단순화한 training step 장부는

$$
T_{\text{step}}
\approx
T_{\text{input}}+
T_{\text{compute}}+
T_{\text{memory}}+
T_{\text{communication}}+
T_{\text{update}}
$$

이고 serving request는

$$
T_{\text{request}}
=
T_{\text{queue}}+
T_{\text{prefill}}+
\sum_{t=1}^{N_{\text{out}}}T_{\text{decode},t}+
T_{\text{post}}
$$

로 나눠 볼 수 있다. 실제로는 일부 단계가 겹치며 failure·retry가 추가되므로 두 식은 완전한 예측식이 아니라 누락 항을 찾는 장부다.

GPU가 $T_{\text{compute}}$를 줄이면 input, memory와 통신이 지배할 수 있다. Faster attention kernel이 prefill을 줄여도 token별 decode 의존과 queue가 남는다. 이 구조 때문에 “연산 성능 향상 = 사용자 능력의 같은 비율 향상”이 되지 않는다.

### 모델 구조와 hardware는 서로의 연구 공간을 바꾼다

영향은 한 방향이 아니다.

- 더 큰 memory·throughput은 연구자가 더 큰 batch·model·data를 시험하게 한다.
- Tensor-friendly architecture는 accelerator에서 더 높은 이용률을 얻을 수 있다.
- 널리 쓰이는 model shape는 cuDNN 같은 library와 compiler가 최적화할 kernel의 우선순위를 만든다.
- Faster training은 더 많은 ablation과 hyperparameter trial을 가능하게 해 model 선택 과정도 바꾼다.
- 더 큰 service traffic은 KV memory·batch scheduler·tail latency를 독립 연구 문제로 만든다.

이를 **공진화**라고 부르지만 생물학적 의미의 자동 선택이나 필연적 진보를 뜻하지 않는다. 설계자·조직·data·시장·전력·공개 정책의 선택이 경로를 바꾼다.

### 같은 output을 보존하는 최적화와 의미를 바꾸는 최적화를 구분한다

FlashAttention은 exact attention 결과를 유지하면서 memory I/O 순서를 바꾸는 것을 목표로 했다. 반면 quantization, pruning, shorter context, speculative rule과 sampling 변경은 허용 오차나 출력 분포 조건을 함께 명시해야 한다.

System 최적화를 세 종류로 나누면 비교가 쉬워진다.

1. **Semantics-preserving:** 같은 precision·허용 오차 안에서 같은 operator 결과를 더 효율적으로 계산
2. **Approximation:** 낮은 precision·압축으로 결과 차이를 허용하고 quality를 다시 측정
3. **Policy change:** Batch, queue, sampling, timeout처럼 어떤 요청을 언제 어떻게 처리할지 변경

세 종류 모두 유용하지만 “모델을 그대로 가속했다”는 한 문장으로 합치면 품질과 service contract 변화가 숨는다.

## 3단계 — 기술과 근거

### 계산 가능성에서 신뢰 가능한 서비스까지

Turing의 automatic machine은 무엇이 기계적으로 계산 가능한지를 형식화했지만 실제 hardware의 memory·속도를 보장하지 않았다. Shannon의 source·channel 이론은 message의 불확실성과 통신 한계를 정량화했지만 현대 neural language model의 architecture를 직접 제시하지 않았다.

2012년 AlexNet은 큰 CNN, ImageNet data, 학습 기법과 두 GPU 구현을 결합해 특정 image-classification 결과를 냈다. 2017년 Transformer는 recurrent state 의존을 제거하고 8개 P100에서 번역 model을 훈련했다. 이 둘은 accelerator가 model 아이디어의 단일 원인이 아니라, 특정 model·data·software를 실제 규모에서 실행할 수 있게 한 조건임을 보여 준다.

2020년 scaling-law 연구는 model size $N$, data $D$와 compute $C$를 loss와 연결해 규모를 실험 설계 변수로 만들었다. 그러나 power law는 관측 범위와 조건의 관계이며, 더 많은 compute가 모든 task·안전·service 품질을 자동 보장하지 않는다.

FlashAttention과 vLLM은 model weight를 바꾸지 않고도 실행 능력이 크게 달라질 수 있음을 보인다. 전자는 attention의 HBM I/O를 줄였고, 후자는 KV cache memory 관리와 scheduler를 바꿔 serving throughput을 개선했다. 이는 새 지식이 weight에 생겼다는 뜻이 아니라, 기존 함수를 더 긴 입력·더 많은 요청·더 낮은 지연에서 실현할 수 있게 된 것이다.

### 일곱 능력층은 서로 대체되지 않는다

| 능력층 | 대표 증거 | 잘못된 대리값 |
| --- | --- | --- |
| 계산 가능성 | Formal machine·algorithm이 유한 절차를 정의 | 실제 runtime·효율 |
| 알고리즘 복잡도 | $O(TS^2)$ HMM, $O(T^2d)$ dense attention | 특정 GPU wall-clock |
| 프로그래밍 가능성 | Stored program, CUDA·framework operator | 자동 성능·정확성 |
| 실현 성능 | 특정 hardware·software의 step time·throughput | 다른 model·device의 일반 속도 |
| 확장성 | Device 수·model·data 증가에 따른 유효 처리량 | 장치 수 자체 |
| 자원 효율 | 같은 품질·오차에서 time·memory·energy 절감 | 품질 조건 없는 FLOP 감소 |
| 신뢰 가능한 결과 | Quality·tail latency·availability 계약의 반복 충족 | 평균 benchmark 하나 |

어떤 system이 일곱 층 모두에서 우월할 필요는 없다. 한 model은 높은 task quality를 갖지만 비싼 memory 때문에 접근성이 낮을 수 있고, 작은 model은 품질이 조금 낮아도 on-device latency·privacy·availability에서 더 적합할 수 있다.

### 모델·학습·실행·서비스 경계를 명시한다

| 경계 | 소유하는 상태 | 대표 질문 |
| --- | --- | --- |
| Model | Architecture, tokenizer, checkpoint weight | 주어진 입력에서 어떤 distribution을 내는가? |
| 학습 system | Data pipeline, optimizer state, parallelism, checkpoint policy | 어떤 시간·자원으로 그 weight를 만들었는가? |
| 실행 runtime | Precision, kernel, compiler, memory placement | 같은 graph를 허용 오차 안에서 얼마나 효율적으로 실행하는가? |
| Service | Queue, batching, cache, routing, timeout, replica | 실제 요청에서 지연·처리량·가용성을 만족하는가? |
| 평가 체계 | Dataset, prompt, decoder, metric, aggregation | 무엇을 성공으로 세고 어떤 실패를 숨기는가? |

“Model X의 능력”이라고 말할 때도 최소한 tokenizer·checkpoint·decoder·evaluation이 필요하다. “System X가 빠르다”고 말할 때도 같은 model·quality·request distribution을 고정했는지 확인해야 한다.

### 여섯 항목 장부로 “2배 능력”을 다시 쓴다

가상의 발표가 “새 accelerator로 LLM 능력이 2배가 됐다”고 하자. 다음처럼 바꾸기 전에는 검증 가능한 주장이 아니다.

| 항목 | 필요한 기록 |
| --- | --- |
| 작업 | 2,048-token prompt의 prefill인지, 256-token decode인지, 전체 training인지 |
| 규모 | Parameter·active parameter, sequence·batch, device·request 수 |
| 결과 계약 | 같은 checkpoint·precision·output tolerance·task score인지 |
| 시스템 경계 | Kernel만인지 host·network·queue를 포함한 end-to-end인지 |
| 고정 조건 | Software version, memory, power cap, parallelism과 input distribution |
| 지표 | 2배 FLOP/s, token/s, request/s, latency 감소, time-to-quality 중 무엇인지 |

예를 들어 같은 quality에서 end-to-end request/s가 2배라면 **service throughput 능력**이 개선됐다고 말할 수 있다. 같은 시간에 더 큰 model을 훈련해 별도 평가가 좋아졌다면 hardware는 가능 조건이고, model 능력 변화는 새 checkpoint의 결과다. 둘은 모두 중요하지만 다른 주장이다.

### 인과를 네 종류로 감사한다

| 관계 | 종합편에서 허용하는 예 | 금지하는 축약 |
| --- | --- | --- |
| 직접 영향 | Transformer 논문은 recurrence의 sequential computation을 문제로 명시했다. | GPU가 Transformer를 발명했다. |
| 가능 조건 | AlexNet은 두 GTX 580, Transformer는 8개 P100에서 보고된 훈련을 실행했다. | 빠른 chip이 자동으로 더 좋은 model을 만든다. |
| 병행 맥락 | CUDA·deep-learning framework와 neural architecture 연구가 결합 가능한 stack을 형성했다. | 같은 시대였으므로 직접 계보라고 볼 수 없다. |
| 후대 유추 | 인간 계산 조직과 accelerator cluster를 분업·검산 축으로 비교한다. | 수학 표가 LLM parameter의 직접 조상이다. |

직접 영향은 원문 locator가 있어야 한다. 나머지 표지도 열등한 주장이 아니라 증거 범위를 정확히 표시하는 장치다.

### 이 종합편의 측정 장부

| 항목 | 기록 |
| --- | --- |
| 작업 | 계산표 제작, program 실행, model training·evaluation, prefill·decode와 service request |
| 규모 | 사람·표·instruction, corpus·state, parameter·token, device·request |
| 결과 계약 | 검산, 계산 동일성, loss·accuracy, 허용 수치 오차, latency·availability |
| 시스템 경계 | Algorithm, kernel, device, training cluster, runtime과 end-to-end service |
| 고정 조건 | 시대·자료·model·precision·software·hardware·policy와 평가 집합 |
| 지표 | Operation·FLOP·byte, wall-clock·time-to-quality, throughput·tail latency·energy·cost |

서로 다른 시대의 수치를 한 순위표로 만들기보다 같은 여섯 질문을 던진다. 이 방법은 “얼마나 빨라졌나”보다 “무엇을 같은 것으로 고정했을 때 어떤 능력층이 달라졌나”를 답하게 한다.

### 여섯 시스템 경계로 service 결과를 더 세밀하게 읽기

이 종합편의 model·학습 system·실행 runtime·service·평가 경계는 “능력” 주장을 감사하는 큰 지도다. 그러나 실제 service 결과를 기록할 때는 energy의 분모, training data의 lineage, memory의 수명, text가 action으로 넘어가는 권한, 외부 effect의 reconciliation, media의 turn·presentation처럼 더 좁은 책임이 남는다.

[[LLM 시스템 경계 확장 지도]]는 이 여섯 질문을 새 능력 점수나 model architecture로 만들지 않는다. 같은 checkpoint·runtime·service 비교가 어느 data·state·authority·media 계약을 가정하는지 찾아, 해당 owner와 bridge로 이동시키는 탐색 노드다. 따라서 일곱 능력층과 여섯 항목 측정 장부를 대체하지 않고, 비어 있는 system 경계를 드러낸다.

## 검증과 한계

이 종합은 아홉 편의 1차 자료를 하나의 분석 틀로 연결한 것이므로 `verification: partial`이다. 각 논문이 “공진화”라는 동일한 역사 이론을 주장한 것은 아니다. 직접 확인된 사실, 가능 조건과 이 문서의 후대 비교를 분리했다.

세 연결고리를 추가해도 다음 범위는 충분히 다루지 않는다.

- Semiconductor supply chain, fabrication yield·packaging, 자본·전력·냉각과 환경 비용
- Dataset 수집·정제·annotation 노동, 저작권·권리, 언어 대표성과 접근 권한
- Compiler·network·storage·database의 더 세밀한 계보
- Safety, 보안, privacy와 사회적 유용성을 하나의 능력 metric으로 정의하는 문제
- 비공개 system의 재현 불가능한 training·serving 조건

“관찰된 능력은 system 속성”이라는 결론을 model 품질이 중요하지 않다는 뜻으로 쓰면 안 된다. 반대로 benchmark가 높은 checkpoint를 실제 어떤 context·latency·failure 조건에서도 같은 능력을 보인다고 확대해서도 안 된다.

시대 간 수치는 hardware, precision, dataset와 metric이 다르므로 직접 환율이 없다. 이 문서는 역사적 최고 성능 순위가 아니라 비교 가능한 질문의 형식을 제공한다.

## 학습 확인

1. 같은 checkpoint를 FP16과 4-bit로 실행했을 때 task score·memory·latency가 달라졌다. Model, runtime, service 경계에서 각각 무엇이 고정되고 무엇이 바뀌었는지 적어라.
2. “GPU가 LLM을 만들었다”는 문장을 직접 영향·가능 조건·병행 맥락·후대 유추로 분해하고, 각 주장에 필요한 근거를 제시하라.
3. 최근의 “10배 빠른 AI” 주장 하나를 골라 작업·규모·결과 계약·시스템 경계·고정 조건·지표를 채운 뒤, 일곱 능력층 중 실제로 개선됐다고 말할 수 있는 층만 표시하라.

### 준전문가 전이 과제

서로 다른 두 본편을 고른다. 예를 들어 4장의 distributed N-gram과 9장의 LLM service를 비교한다.

1. 두 system의 stored state, online query, network message와 result contract를 각각 그린다.
2. 공통점은 후대 유추로, 문헌이 확인한 실제 연결은 직접 영향으로 따로 표시한다.
3. 여섯 항목 측정 장부를 두 번 채운다.
4. 한쪽 metric을 다른 쪽에 그대로 적용할 수 없는 이유를 세 가지 쓴다.
5. 새 bottleneck이 model 수학, runtime, service policy 중 어디에 속하는지 판정한다.

정답은 하나의 기술 이름이 아니라 경계와 근거가 일관된 비교다. 막히면 [[LLM과 컴퓨팅 능력의 공진화]]에서 해당 능력층의 대표 본편으로 돌아간다.

### 다음 문서

- [[meta.llm-computing-coevolution|LLM과 컴퓨팅 능력의 공진화]] — 학습 확인 뒤의 후속 문서 연결.

## 출처
- [[LLM과 컴퓨팅 능력의 공진화]] — 아홉 본편과 공통 능력층·측정 장부의 탐색 허브.
- Alan M. Turing, [On Computable Numbers, with an Application to the Entscheidungsproblem](https://www.cs.virginia.edu/~robins/Turing_Paper_1936.pdf), 1936, §§1–6.
- Claude E. Shannon, [A Mathematical Theory of Communication](https://people.math.harvard.edu/~ctm/home/text/others/shannon/entropy/entropy.pdf), 1948, Part I.
- [[021_합성곱 신경망과 특징 학습]] — AlexNet의 model·data·GPU·평가 조건을 확인한다.
- [[055_Transformer와 자기어텐션 기반 시퀀스 모델링]] — 훈련 의존성과 8개 P100 실행 조건을 확인한다.
- [[066_신경 언어 모델의 스케일링 법칙]] — Model·data·compute와 loss의 관측 관계를 검증한다.
- [[088_FlashAttention과 IO 인지형 정확 어텐션]] — 같은 exact attention에서 memory I/O를 바꾼 경계를 확인한다.
- Kwon 외, [Efficient Memory Management for Large Language Model Serving with PagedAttention](https://doi.org/10.1145/3600006.3613165), 2023, §§2–7.

## 관련 항목

- [[meta.llm-computing-coevolution|LLM과 컴퓨팅 능력의 공진화]]
- [[analysis.pre-machine-computing-capability|기계 이전의 계산은 어떻게 능력이 되었나]]
- [[analysis.language-computation-mechanical-procedure|언어와 계산을 기계적 절차로 만들다]]
- [[analysis.early-learning-scaling-limits|학습 규칙이 있어도 왜 규모화되지 못했나]]
- [[analysis.statistical-language-model-computing-infrastructure|확률적 언어 모델은 어떤 계산 인프라를 요구했나]]
- [[analysis.matrix-acceleration-deep-learning|행렬곱 가속은 딥러닝을 어떻게 현실화했나]]
- [[analysis.transformer-parallelism-and-sequentiality|Transformer는 무엇을 병렬화했고 무엇을 남겼나]]
- [[analysis.scale-as-research-variable|규모는 언제 연구 변수가 되었나]]
- [[analysis.when-data-movement-dominates|연산보다 데이터 이동이 비싸질 때]]
- [[analysis.model-capability-to-service-capability|모델 능력에서 서비스 능력으로]]
- [[analysis.n-gram에서-llm으로|N-gram에서 LLM으로]]
- [[analysis.stored-program-to-learning-framework|저장 프로그램에서 학습 프레임워크까지]]
- [[analysis.silicon-scaling-to-accelerators|집적도 증가에서 가속기까지 무엇이 더 필요했나]]
- [[meta.llm-system-boundary-map|LLM 시스템 경계 확장 지도]]
