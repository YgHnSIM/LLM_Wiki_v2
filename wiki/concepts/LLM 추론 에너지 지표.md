---
schema_version: 3
id: concept.llm-inference-energy-metrics
page_type: concept
title: LLM 추론 에너지 지표
aliases:
  - LLM inference energy metrics
  - joules per token
  - joules per good request
tags:
  - type/concept
  - domain/ai
  - domain/nlp
  - domain/machine-learning
  - domain/computer-science
created: '2026-07-25'
updated: '2026-07-25'
editorial_status: active
review:
  evidence_coverage: verified
  content_mode: descriptive
artifacts: []
evidence:
  - source_id: barroso-holzle-2007-energy-proportional
    locator: 'pp. 33–37, 특히 Abstract와 Figures 1–4의 부분 부하·idle 전력·energy proportionality 설계 목표'
    relation: contextualizes
  - source_id: jouppi-et-al-2017-tpu
    locator: 'pp. 1–12의 datacenter inference workload, latency 제약, throughput·performance/W 측정 조건과 TPU·CPU·GPU 비교'
    relation: supports
  - source_id: mlcommons-2025-mlperf-inference-v5-1
    locator: 'v5.1 README의 MLPerf Inference benchmark 범위, Llama 2·Llama 3.1·Mixtral workload와 power submission의 SPEC PTD 1.11.1 조건'
    relation: supports
  - source_id: niu-et-al-2026-tokenpowerbench
    locator: 'Abstract와 pp. 32582–32590의 GPU·node·system 측정 경계, request별 prefill/decode energy 귀속, context·batch·parallelism·quantization 비교'
    relation: supports
  - source_id: dean-barroso-2013-tail-at-scale
    locator: 'pp. 74–80의 utilization, tail latency, 여유 용량과 service-level 결과 계약'
    relation: contextualizes
relations:
  - target: concept.memory-hierarchy-data-movement
    kind: related
  - target: concept.계산-복잡도와-비용-모델
    kind: related
  - target: analysis.model-capability-to-service-capability
    kind: related
  - target: analysis.when-data-movement-dominates
    kind: related
learning:
  difficulty:
    entry: introductory
    target: intermediate
  prerequisites:
    - target: concept.llm-inference-serving
  assumed_knowledge: — 요청이 queue prefill decode 종료를 거치며 TTFT TPOT 실패율이 따로 측정된다는 사실을 알고 시작한다.
  outcomes:
    - '전력과 에너지, GPU·node·서비스 경계, token·request·성공한 요청의 분모를 구분하고 “더 적은 J/token”이 언제 더 좋은 LLM 서비스 결과를 뜻하지 않는지 설명할 수 있다.'
  next:
    - target: analysis.power-to-service-outcomes
      reason: 학습 경로의 다음 질문으로 이어진다.
---
# LLM 추론 에너지 지표

> [!note] 학습 안내
> **난이도:** 입문 → 중급<br>
> **선수 지식:** [[concept.llm-inference-serving|언어 모델 추론 서빙]]<br>
> **읽고 나면:** 전력과 에너지, GPU·node·서비스 경계, token·request·성공한 요청의 분모를 구분하고 “더 적은 J/token”이 언제 더 좋은 LLM 서비스 결과를 뜻하지 않는지 설명할 수 있다.

## 1단계 — 먼저 잡을 핵심

### 전력계의 숫자 하나로 서비스 효율을 말할 수 없다

**전력(power)**은 어떤 순간에 쓰는 에너지의 속도이고 단위는 watt(W)이다. **에너지(energy)**는 정한 시간 구간에 실제로 쓴 양이고 단위는 joule(J)이다.

$$
E=\int_{t_0}^{t_1}P(t)\,dt
$$

여기서 $P(t)$는 시간 $t$의 전력, $E$는 선택한 구간에 누적된 에너지다. 전력이 일정하다면 $E=P\Delta t$로 단순화할 수 있다. 예를 들어 350 W 장치가 2초 동안 그 전력을 유지했다면 그 구간은 700 J다. 이 계산은 **그 장치와 그 2초**만 센다. Host CPU, network, 냉각, 비어 있는 replica와 실패한 재시도까지 셌는지는 아직 말해 주지 않는다.

LLM 추론에서 “에너지 효율”을 비교하려면 최소 네 질문을 고정해야 한다.

1. 무엇을 쟀는가: GPU, node, rack, facility, 또는 사용자 요청 전체인가?
2. 어느 시간을 쟀는가: queue, prefill, decode, output 전송, idle, warmup 중 어디까지인가?
3. 무엇으로 나누는가: input token, output token, request, 성공한 요청 중 무엇인가?
4. 무엇을 같은 결과로 보는가: model·tokenizer·quality·deadline·안전 정책·traffic이 같은가?

답이 다르면 같은 `J/token` 표기라도 같은 실험이 아니다.

### 성공한 출력만 세면 실패 비용이 사라질 수 있다

한 서비스가 request 두 개를 최종적으로 성공시켰다고 하자. 첫 요청은 80 J로 성공했고, 둘째 요청은 첫 시도에서 100 J를 쓰고 timeout된 뒤 90 J retry로 성공했다. 모든 attempt를 포함한 성공 요청당 에너지는

$$
E_{\mathrm{good}}=\frac{80+100+90}{2}=135\ \mathrm{J/good\ request}
$$

이다. 마지막 성공 attempt만 남기면 $(80+90)/2=85$ J로 보이지만, 사용자가 실제로 얻은 두 결과를 위해 서비스가 쓴 100 J를 감춘다. 반대로 모든 실패를 무조건 분자에 넣을지도 운영 목적에 따라 밝혀야 한다. 실험 실패, warmup, 다른 tenant의 작업까지 넣는다면 그 경계도 공개해야 한다.

## 2단계 — 작동 원리

### token, request, 좋은 request는 서로 다른 분모다

| 지표 | 분자 | 분모 | 유용한 질문 | 빠지는 조건 |
| --- | --- | --- | --- | --- |
| J/input token | 정한 측정 구간의 J | prompt token 수 | 긴 입력을 처리할 때의 비용은? | output 길이·decode·성공 여부 |
| J/output token | 정한 측정 구간의 J | 생성 token 수 | 반복 decode의 비용은? | prompt prefill·중단·품질 |
| J/request | 정한 요청의 J | 접수 또는 완료 request 수 | 요청 하나의 평균 비용은? | request 길이 분포·deadline |
| J/good request | 정한 attempt들의 J | quality와 deadline을 만족한 완료 요청 수 | 사용자가 실제로 받은 목표 결과의 비용은? | quality oracle·retry·idle 포함 여부 |

`J/token`은 token 정의도 필요하다. 같은 문장을 다른 tokenizer가 다른 수의 token으로 쪼갤 수 있고, input과 output token은 prefill·decode라는 다른 계산 경로를 지난다. 따라서 “token당” 수치만으로 어느 서비스가 더 효율적인지 결론 내리지 않는다.

### prefill과 decode는 같은 시간 축이 아니다

Prompt 전체가 이미 도착한 **prefill**은 여러 위치의 계산을 병렬화할 수 있다. 새 token 하나를 확정한 뒤 다음 token의 조건이 완성되는 **decode**는 자기회귀 loop를 반복한다. 긴 prompt, 긴 output, batch 구성, KV cache, model 병렬화가 두 구간에 다른 비율로 작용한다.

그래서 한 request의 에너지를 다음처럼 기록할 수 있다.

$$
E_{\mathrm{attempt}}=E_{\mathrm{queue}}+E_{\mathrm{prefill}}+E_{\mathrm{decode}}+E_{\mathrm{post}}
$$

이 식은 네 항이 항상 독립적으로 전력계에서 분리된다는 뜻이 아니다. Scheduler, 다른 request와 공유한 batch, GPU idle, host 작업은 어느 항에 배분할지 설계 선택을 요구한다. TokenPowerBench처럼 phase-aligned attribution을 제공하는 도구도 그 배분 규칙과 장치 경계를 함께 읽어야 한다.

### 장치 경계와 서비스 경계가 다르다

| 측정 경계 | 포함할 수 있는 것 | 답할 수 있는 질문 | 단독으로 답하지 못하는 질문 |
| --- | --- | --- | --- |
| GPU | GPU rail 또는 accelerator board | kernel·model 실행의 장치 에너지는? | host·network·idle replica를 포함한 서비스 비용은? |
| node | accelerator, CPU, memory, local storage | 한 server의 request 처리 비용은? | rack·facility overhead와 multi-node traffic은? |
| cluster/service | replica, network, queue, retry, 일부 idle | traffic과 SLO 아래 서비스가 쓰는 비용은? | facility 전력·냉각·내재 탄소까지의 총 영향은? |
| facility | IT load와 시설 계측 | 특정 시설의 운영 에너지는? | 지역·시간별 전력망 탄소와 제조 단계 영향은? |

Barroso와 Hölzle의 energy-proportional computing은 부분 부하가 흔한 server에서 idle 전력이 중요한 설계 문제임을 보여 준다. 이것은 LLM service가 언제나 facility 수준으로 측정돼야 한다는 명령이 아니다. 다만 낮은 device J/token이 여유 replica·traffic burst·SLO 때문에 낮은 service J/good request를 보장하지 않는 이유를 설명한다.

## 3단계 — 기술과 근거

### 일곱 경계 장부

| 항목 | 이 owner에서 기록할 내용 |
| --- | --- |
| 입력·대상 | model revision, tokenizer, prompt·output 길이 분포, traffic과 요청 종류 |
| 변환 경로 | queue → prefill → decode → post-processing → 전송·종료 |
| 시간·상태·자원 | warmup, measurement window, batch, KV cache, replica, GPU·host·network 경계 |
| 결과 계약 | 같은 출력 품질·안전 정책과 deadline을 만족한 결과인지 |
| 지표·평가 기준 | W, J, J/token, J/request, J/good request, TTFT·TPOT·p95·p99 |
| 실패·복구 경계 | timeout, rejection, retry, cancellation, unknown outcome과 분자·분모 처리 |
| 권한·책임·출처 추적 | 전력계·runtime·model·benchmark version, 배분 규칙, 측정자와 재현 가능한 설정 |

이 표는 “가장 좋은 단일 지표”를 제안하지 않는다. 비교할 질문에 맞는 분자·분모·경계를 드러내는 최소 장부다.

### MLPerf와 LLM 전력 연구를 읽는 법

MLPerf Inference v5.1은 deployment scenario에서 model을 얼마나 빠르게 실행하는지 측정하는 benchmark suite이며, power submission에는 별도 계측 조건을 둔다. Llama 2·Llama 3.1·Mixtral처럼 workload마다 model, dataset, scenario가 정해진다는 사실은 결과를 재현하려면 “모델명”보다 더 많은 조건이 필요함을 보여 준다.

TokenPowerBench는 GPU·node·system 측정 경계를 분리하고 request의 prefill·decode 단계에 에너지를 귀속하는 방식을 제시한다. 이는 LLM 특화 질문을 더 잘 묻는 방법이지, 특정 hardware·runtime·traffic에서 나온 J/token을 모든 운영 환경의 상수로 만드는 근거는 아니다.

### 에너지와 탄소는 같은 단어가 아니다

운영 에너지에 탄소 계수를 곱하려면 적어도 전력망의 지역과 시간, 구매·재생에너지 회계 방식, facility 경계가 필요하다. 제조·운송·폐기까지 포함하는 내재 탄소에는 또 다른 lifecycle 자료가 필요하다. 이 문서는 그러한 자료 없이 J를 CO₂e로 바꾸지 않는다.

### 소비 문서에서의 국소 질문

[[언어 모델 추론 서빙]]은 prefill, decode, KV cache, batching, TTFT와 tail latency를 설명한다. 이 owner는 그 문서가 “빠름”을 설명할 때 에너지의 분자·분모·장치 경계도 함께 적도록 돕는다. 완전한 serving scheduler 설명은 소비 문서에 남기고, 반복되는 에너지 회계는 여기서 한 번만 완결한다.

## 검증과 한계

- **직접 영향:** MLPerf와 TokenPowerBench는 정한 benchmark·software·hardware 조건에서 성능 또는 전력 계측 방법을 공개한다. 각 결과는 그 조건을 벗어난 보편 상수가 아니다.
- **가능 조건:** GPU·memory·runtime·scheduler·전력계가 있어야 phase별 또는 node별 에너지 장부를 만들 수 있다. 이 조건들이 낮은 서비스 비용을 자동으로 보장하지는 않는다.
- **병행 맥락:** energy-proportional computing과 tail-latency 연구는 LLM 이전 server 문제를 제공한다. 이 연구들이 LLM serving 구현을 직접 낳았다고 쓰지 않는다.
- **후대 유추:** `J/good request`는 분자·분모 공개를 가르치는 서비스 회계 예시다. 모든 benchmark가 채택한 표준 단위나 유일한 지속가능성 지표는 아니다.

전력은 sampling interval, sensor 위치, power cap, warmup, temperature, background process에 민감하다. GPU board power가 node wall power와 같지 않을 수 있고, multi-tenant batch에서 shared energy를 request별로 나누는 규칙도 하나가 아니다. 따라서 수치 자체와 함께 측정 경계·기간·배분 규칙을 공개해야 한다.

## 학습 확인

1. 같은 model과 tokenizer에서 output token당 J가 낮아졌지만 p99 deadline 실패가 늘었다. 왜 J/good request가 함께 필요할 수 있는가?
2. GPU energy만 측정한 결과와 node energy를 측정한 결과가 달라질 수 있는 구성요소를 세 가지 적어라.
3. prefill과 decode를 하나의 평균 J/token으로만 보고할 때 숨겨질 수 있는 workload 차이를 설명하라.

다음 배치의 **전력에서 서비스 결과 계약까지 무엇을 세어야 하나**는 이 장부를 quality·traffic·SLO와 함께 읽는다.

### 다음 문서

- [[analysis.power-to-service-outcomes|전력에서 서비스 결과 계약까지 무엇을 세어야 하나]] — 학습 경로의 다음 질문으로 이어진다.

## 출처
- Luiz André Barroso·Urs Hölzle, [The Case for Energy-Proportional Computing](https://research.google/pubs/the-case-for-energy-proportional-computing/), *IEEE Computer* 40, 2007, pp. 33–37.
- Norman P. Jouppi 외, [In-Datacenter Performance Analysis of a Tensor Processing Unit](https://research.google/pubs/in-datacenter-performance-analysis-of-a-tensor-processing-unit/), ISCA 2017, pp. 1–12.
- [MLPerf Inference Benchmark Suite v5.1](https://github.com/mlcommons/inference/tree/v5.1), README의 workload·scenario·power submission 조건.
- Chenxu Niu 외, [TokenPowerBench: Benchmarking the Power Consumption of LLM Inference](https://ojs.aaai.org/index.php/AAAI/article/view/40535), AAAI 2026, pp. 32582–32590.
- Jeffrey Dean·Luiz André Barroso, [The Tail at Scale](https://research.google/pubs/the-tail-at-scale/), *Communications of the ACM* 56(2), 2013, pp. 74–80.

## 관련 항목

- [[analysis.power-to-service-outcomes|전력에서 서비스 결과 계약까지 무엇을 세어야 하나]]
- [[concept.llm-inference-serving|언어 모델 추론 서빙]]
- [[concept.memory-hierarchy-data-movement|메모리 계층과 데이터 이동]]
- [[concept.계산-복잡도와-비용-모델|계산 복잡도와 비용 모델]]
- [[analysis.model-capability-to-service-capability|모델 능력에서 서비스 능력으로]]
- [[analysis.when-data-movement-dominates|연산보다 데이터 이동이 비싸질 때]]
