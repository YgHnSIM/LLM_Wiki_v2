---
schema_version: 2
id: meta.llm-computing-coevolution
page_type: meta
title: LLM과 컴퓨팅 능력의 공진화
aliases:
  - LLM and computing capability coevolution
  - 언어 모델과 컴퓨터 발전사
  - LLM 컴퓨팅 역사 읽기 지도
tags:
  - type/meta
created: '2026-07-24'
updated: '2026-07-25'
lifecycle: active
verification: verified
artifacts: []
evidence: []
related:
  - analysis.pre-machine-computing-capability
  - analysis.language-computation-mechanical-procedure
  - analysis.early-learning-scaling-limits
  - analysis.statistical-language-model-computing-infrastructure
  - analysis.matrix-acceleration-deep-learning
  - analysis.transformer-parallelism-and-sequentiality
  - analysis.scale-as-research-variable
  - analysis.when-data-movement-dominates
  - analysis.model-capability-to-service-capability
  - analysis.llm-capability-model-or-system
  - analysis.n-gram에서-llm으로
---
# LLM과 컴퓨팅 능력의 공진화

> [!note] 읽기 안내
> 이 허브는 “컴퓨터가 빨라져서 LLM이 생겼다”는 한 줄 설명을 해체한다. 입문자는 아홉 본편을 시대순으로 읽고, 준전문가는 같은 사건을 계산 가능성·복잡도·프로그래밍·실현 성능·확장성·효율·신뢰성의 일곱 능력층과 여섯 항목 측정 장부로 다시 비교한다.

## 이 시리즈가 답하는 질문

언어 기술의 역사는 model 아이디어만의 역사도, processor 속도만의 역사도 아니다. 어떤 수학적 절차가 알려져 있어도 data를 읽고 parameter를 저장하며 허용 시간 안에 학습할 수 없으면 큰 실험이 되지 못한다. 반대로 빠른 machine이 있어도 무엇을 계산하고 어떤 결과를 맞다고 할지 정한 model·loss·평가가 없으면 언어 능력이 생기지 않는다.

이 시리즈는 모든 이정표를 다음 반복 구조로 읽는다.

```text
기존 병목
  → 모델·알고리즘·시스템의 대응
  → 새로 실현된 능력
  → 아직 보장되지 않은 것
  → 다음 병목
```

핵심은 “A가 B를 낳았다”는 직선 계보가 아니라, 서로 다른 층의 조건이 언제 실제 system 안에서 결합했는지 확인하는 것이다.

## 가장 짧은 읽기 경로

시간이 30분이라면 다음 네 편만 읽는다.

1. [[기계 이전의 계산은 어떻게 능력이 되었나]] — 장치 이전에도 표·분업·검산이 계산 능력을 만들었다.
2. [[행렬곱 가속은 딥러닝을 어떻게 현실화했나]] — GPU 한 대가 아니라 CUDA·kernel·framework 실행 스택이 바뀌었다.
3. [[Transformer는 무엇을 병렬화했고 무엇을 남겼나]] — 훈련 위치 병렬성과 생성 순차성은 다른 축이다.
4. [[LLM 능력은 모델의 속성인가 시스템의 속성인가]] — 아홉 시대를 같은 능력·측정 장부로 비교한다.

시간이 3시간이라면 아홉 본편에서 `학습 안내` → `1단계` → `검증과 한계` → `학습 확인` 순서로 읽는다. 완전 경로에서는 각 편의 `2단계` 계산과 `3단계` 1차 근거를 확인하고, 마지막 종합편의 전이 과제를 푼다.

본편 4–6 사이에서 “빈도표가 어떻게 학습 표현과 Transformer workload로 바뀌었는가”가 궁금하면 횡단 연결 [[N-gram에서 LLM으로]]을 끼워 읽는다.

## 시대순 본편 아홉 편

| 순서 | 본편 | 기존 병목에서 새 병목으로 |
| ---: | --- | --- |
| 1 | [[기계 이전의 계산은 어떻게 능력이 되었나]] | 느리고 오류가 잦은 반복 계산 → 표 제작·분업·검산의 조직 비용 |
| 2 | [[언어와 계산을 기계적 절차로 만들다]] | 사람의 암묵적 절차 → 형식 규칙·stored program의 표현과 효율 문제 |
| 3 | [[학습 규칙이 있어도 왜 규모화되지 못했나]] | 고정 규칙 작성 → 학습 가능한 weight와 data·표현·credit assignment 병목 |
| 4 | [[확률적 언어 모델은 어떤 계산 인프라를 요구했나]] | 직관적 언어 규칙 → corpus count·sparse table·dynamic programming·network lookup |
| 5 | [[행렬곱 가속은 딥러닝을 어떻게 현실화했나]] | 작은 neural experiment → GPU memory·kernel·framework·time-to-quality |
| 6 | [[Transformer는 무엇을 병렬화했고 무엇을 남겼나]] | recurrent 위치 의존 → attention의 이차 memory와 자기회귀 생성 순차성 |
| 7 | [[규모는 언제 연구 변수가 되었나]] | architecture 선택 중심 → model·data·compute 배분과 분산 통신 |
| 8 | [[연산보다 데이터 이동이 비싸질 때]] | FLOP 처리량 중심 → memory traffic·precision·활성 sparsity |
| 9 | [[모델 능력에서 서비스 능력으로]] | checkpoint 품질 중심 → 지연·처리량·energy·가용성·실행 접근 |

각 행의 오른쪽은 앞선 문제가 완전히 해결됐다는 뜻이 아니다. 한 병목을 줄이면 이전에 작게 보이던 비용이 전체 시간·품질을 지배하기 시작한다.

## 두 발전 레일을 함께 읽는 법

### 언어 모델 레일

언어를 규칙, count, probability, vector, differentiable network와 autoregressive distribution으로 표현하는 방법이 바뀐다. 이 레일에서는 “무엇을 학습하고 무엇을 출력하는가”가 핵심이다.

### 컴퓨팅 능력 레일

인간 계산 조직, formal machine, stored program, corpus infrastructure, CPU cluster, GPU, accelerator memory, distributed collective와 serving scheduler가 실행 범위를 바꾼다. 이 레일에서는 “어떤 자원과 interface로 얼마나 반복 가능하게 실행하는가”가 핵심이다.

### 두 레일이 만나는 지점

두 레일은 같은 속도로 나아가지 않는다. 역전파는 GPU 딥러닝 붐보다 먼저 있었고, GPU도 Transformer를 위해 처음 만들어진 장치가 아니다. 그러나 큰 tensor model이 ImageNet data·GPU kernel·framework와 결합했을 때 이전과 다른 규모의 실험이 가능해졌다. Transformer의 위치 병렬성은 accelerator의 큰 행렬 연산과 잘 맞았고, 규모화가 진행되자 통신·memory·서비스 scheduling이 다음 연구 대상이 됐다.

이때 사용할 인과 표지는 네 가지다.

- **직접 영향:** 원문이 앞선 기술을 실제 설계 근거로 밝힌다.
- **가능 조건:** 실행에 필요하거나 실제 사용됐지만 아이디어의 직접 원인인지는 확인되지 않는다.
- **병행 맥락:** 같은 시기·병목을 공유하지만 직접 연결 근거가 없다.
- **후대 유추:** 오늘의 비교 틀이며 당시 행위자의 설명이 아니다.

## 일곱 능력층 지도

“컴퓨터 능력”을 하나의 속도로 부르면 중요한 차이가 사라진다.

| 능력층 | 묻는 질문 | 대표 본편 |
| --- | --- | --- |
| 계산 가능성 | 문제를 유한한 기계적 절차로 표현할 수 있는가? | 1·2장 |
| 알고리즘 복잡도 | 입력이 커질 때 time·space가 어떻게 자라는가? | 2·4·6장 |
| 프로그래밍 가능성 | 절차를 재사용 가능한 program·operator로 실행할 수 있는가? | 2·3·5장 |
| 실현 성능 | 특정 장치·software에서 실제 작업을 얼마나 빨리 끝내는가? | 3–6·8·9장 |
| 확장성 | Data·model·device를 늘릴 때 유효 처리 능력도 늘어나는가? | 3–9장 |
| 자원 효율 | 같은 품질을 더 적은 memory·energy·time·비용으로 얻는가? | 5·7–9장 |
| 신뢰 가능한 결과 | 품질·수치·지연·가용성 계약을 반복해서 만족하는가? | 1·3·7·9장 |

예를 들어 Turing machine이 계산 가능성을 형식화했다는 사실은 실제 computer가 무한 memory를 갖거나 빠르게 실행된다는 뜻이 아니다. GPU의 peak 연산률이 높다는 사실도 특정 model이 같은 accuracy에 더 빨리 도달하거나 서비스의 99th-percentile latency를 만족한다는 뜻이 아니다.

## 여섯 항목 측정 장부

성능 주장을 만나면 먼저 다음 여섯 칸을 채운다.

| 항목 | 확인 질문 |
| --- | --- |
| 작업 | Training, evaluation, prefill, decode, retrieval 가운데 무엇인가? |
| 규모 | Model·data·sequence·batch·device·request 수는 얼마인가? |
| 결과 계약 | Loss·accuracy·같은 수학적 출력·허용 오차·지연 목표 중 무엇을 만족하는가? |
| 시스템 경계 | 단일 연산, kernel, accelerator, host, cluster, end-to-end service 중 어디까지 재는가? |
| 고정 조건 | Hardware·precision·software·parallelism·quality 중 무엇을 같게 뒀는가? |
| 지표 | FLOPs·byte·throughput·latency·time-to-quality·energy·비용 중 무엇인가? |

“10배 빠르다”는 말에 작업과 시스템 경계가 없으면 아직 비교가 아니다. Kernel 10배 가속이 input·communication을 포함한 training step 10배나 같은 quality까지의 전체 훈련 10배를 보장하지 않는다.

## 주제별 교차 경로

### 수학과 실행의 경계를 보고 싶다면

[[내적·행렬곱과 선형변환]] → [[가속기와 행렬 계산]] → [[행렬곱 가속은 딥러닝을 어떻게 현실화했나]] → [[Transformer는 무엇을 병렬화했고 무엇을 남겼나]]

### 규모와 비용을 보고 싶다면

[[계산 복잡도와 비용 모델]] → [[확률적 언어 모델은 어떤 계산 인프라를 요구했나]] → [[분산 학습과 집단 통신]] → [[규모는 언제 연구 변수가 되었나]] → [[연산보다 데이터 이동이 비싸질 때]]

### 실제 서비스 능력을 보고 싶다면

[[훈련 병렬성과 생성 순차성은 다른 축이다]] → [[수치 형식·혼합 정밀도·양자화]] → [[언어 모델 추론 서빙]] → [[모델 능력에서 서비스 능력으로]]

### 기술사 인과를 점검하고 싶다면

아홉 본편의 `인과를 네 종류로 감사한다`와 `검증과 한계`만 연속해서 읽는다. 직접 영향의 locator가 있는지, 가능 조건을 발명의 원인으로 과장하지 않았는지 확인한다.

## 이 허브 다음에 할 일

[[LLM 능력은 모델의 속성인가 시스템의 속성인가]]에서 같은 checkpoint도 runtime·precision·context·scheduler·service contract에 따라 관찰되는 능력이 달라지는 이유를 정리한다. 그 문서의 마지막 전이 과제에서는 새로운 “더 큰 모델” 또는 “더 빠른 accelerator” 주장을 이 허브의 일곱 능력층과 여섯 항목 장부로 직접 감사한다.

## 관련 항목

- [[기계 이전의 계산은 어떻게 능력이 되었나]]
- [[언어와 계산을 기계적 절차로 만들다]]
- [[학습 규칙이 있어도 왜 규모화되지 못했나]]
- [[확률적 언어 모델은 어떤 계산 인프라를 요구했나]]
- [[행렬곱 가속은 딥러닝을 어떻게 현실화했나]]
- [[Transformer는 무엇을 병렬화했고 무엇을 남겼나]]
- [[규모는 언제 연구 변수가 되었나]]
- [[연산보다 데이터 이동이 비싸질 때]]
- [[모델 능력에서 서비스 능력으로]]
- [[LLM 능력은 모델의 속성인가 시스템의 속성인가]]
- [[N-gram에서 LLM으로]]
