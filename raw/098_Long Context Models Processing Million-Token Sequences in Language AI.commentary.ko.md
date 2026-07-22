---
source_file: "098_Long Context Models Processing Million-Token Sequences in Language AI.md"
translation_file: "098_Long Context Models Processing Million-Token Sequences in Language AI.ko.md"
commentary_type: "해설"
source_stem: "098_Long Context Models Processing Million-Token Sequences in Language AI"
order_prefix: "098"
topic: "긴 문맥 모델과 100만 토큰 활용의 경계"
period: "2023–2024"
tags:
  - LLM
  - NLP
  - AI-history
  - commentary
  - long-context
  - efficient-attention
  - retrieval
---

# 긴 문맥 모델과 100만 토큰 활용의 경계 해설

## 1. 한눈에 보기

- 핵심 주제: 언어 모델이 한 번에 받을 수 있는 입력을 10만~100만 토큰 이상으로 확장한 흐름과, 그 길이를 실제로 활용하는 능력 사이의 차이
- 등장 배경: 2023년 10만~20만 토큰급 상용 문맥 창이 등장한 뒤 2024년 LWM과 Gemini 1.5가 100만 토큰급 공개 연구·제품 프리뷰를 구체화한 시기
- 가장 중요한 아이디어: 명목 문맥 길이, 어텐션 계산 가능성, 정보 검색 성공률, 여러 증거를 결합하는 추론 능력은 서로 다른 축이다.
- 이후 LLM/NLP에 남긴 영향: 긴 문서를 덜 쪼개고 더 많은 원자료를 함께 제시할 수 있게 했지만, 긴 문맥이 검색·요약·캐시·RAG를 자동으로 대체하지는 않는다는 평가 기준을 만들었다.

> 이 문서는 `098_Long Context Models Processing Million-Token Sequences in Language AI.md`의 번역문을 이해하기 위한 해설입니다. 원문을 반복하기보다 2024년의 실제 사례, 구현별 차이, 명목 문맥 길이와 유효 활용 능력의 경계, 원문의 검증 정정을 정리합니다.

## 2. 핵심 요약

긴 문맥 언어 모델이 2024년에 처음 등장한 것은 아니다. Claude 100K·Claude 2.1 200K·GPT-4 Turbo 128K처럼 2023년에 이미 10만 토큰급 상용 문맥 창이 공개됐고, 2024년에는 100만 토큰급이 공개 연구 모델과 제한적 상용 프리뷰로 전면화됐다. UC Berkeley의 LWM은 Llama 2 7B를 바탕으로 Blockwise RingAttention과 FlashAttention, RoPE 스케일 조정, 32K에서 1M까지의 점진적 학습을 구체적으로 공개했다. Google의 Gemini 1.5 Pro는 처음에는 표준 128K와 일부 고객 대상 1M private preview로 발표됐으며, 기술 보고서가 공개한 구조는 sparse MoE Transformer와 여러 시스템 수준 변경이라는 범위에 머문다. 따라서 원문이 희소·슬라이딩 윈도·선형 어텐션, 계층적 메모리, 재귀 검색을 모든 100만 토큰 모델의 공통 조리법처럼 묶은 것은 실제 구현을 지나치게 일반화한 설명이다. 또한 단일 needle 검색의 높은 정확도는 책 전체 이해나 여러 증거의 결합 추론과 같지 않다. Gemini 보고서의 100-needle 평가는 100만 토큰에서 소폭의 recall 감소만 보였지만, LWM은 더 어려운 multi-needle 조건에서 성능 저하를 보고했다. RULER도 모델이 표방한 최대 길이와 실제로 안정적으로 활용하는 길이가 다를 수 있음을 확인했다. 긴 문맥의 가치는 분명하지만, 입력 수용·검색·추론·비용을 따로 측정해야 한다.

- 무엇을 다루는가: 100만 토큰급 문맥 창의 역사적 등장, 계산 기법, 정보 활용 평가, 실제 응용의 조건
- 어떤 문제를 해결하려 했는가: 긴 문서와 여러 자료를 작은 구간으로 자를 때 생기는 관계 손실과 반복 검색·요약 비용
- 어떤 방식이 새로웠는가: 모델마다 다른 정확 어텐션 분산, I/O 최적화, 위치 표현 조정, 장문 데이터와 점진 학습, 또는 비공개 시스템 최적화를 결합한 점
- 결과적으로 무엇을 바꾸었는가: 최대 입력 길이를 제품 사양으로만 보지 않고 유효 검색 길이·추론 품질·지연 시간·입력 비용과 함께 평가해야 한다는 기준을 강화했다.

## 3. 역사적 배경

Transformer의 self-attention은 한 구간 안에서 모든 위치를 직접 연결하지만, 표준 dense attention의 산술량은 길이 $N$에 대해 $O(N^2d)$로 증가한다. 초기 Transformer는 짧은 고정 구간을 사용했고, Transformer-XL은 이전 세그먼트의 은닉 상태를 제한된 메모리로 재사용해 한 번의 거대한 창과 다른 방식으로 장거리 의존성을 늘렸다. Longformer 같은 희소 패턴은 일부 국소·전역 연결만 계산해 길이에 대한 비용을 낮췄고, FlashAttention은 dense softmax attention 자체를 바꾸지 않은 채 큰 중간 행렬의 HBM 저장과 데이터 이동을 줄였다.

제품 문맥 창도 단계적으로 늘었다. 2023년 Claude 100K, GPT-4 Turbo 128K, Claude 2.1 200K가 공개됐기 때문에 2024년을 ‘긴 문맥의 발명 연도’라고 부르기는 어렵다. 2024년의 변화는 100만 토큰 규모가 재현 가능한 공개 연구 모델 LWM과 Gemini 1.5의 상용 프리뷰라는 두 경로에서 가시화됐다는 데 있다. 두 사례의 내부 구조는 같지 않다. LWM은 구현과 학습 단계를 논문에 적었지만 Gemini 보고서는 구체적인 긴 문맥 어텐션·위치·메모리 조합을 공개하지 않았다.

- 이전 접근법: 짧은 고정 창, 구간 분할과 요약, Transformer-XL의 세그먼트 재귀, sparse/local attention, 외부 검색을 사용하는 RAG
- 당시의 한계: 구간 경계의 관계 손실, dense attention의 계산·메모리 이동, 긴 위치로의 일반화, 긴 입력에서 관련 증거를 놓치는 문제
- 이 주제가 필요했던 이유: 원자료를 더 넓게 함께 보면서도 계산 비용과 검색 실패를 통제할 모델·시스템·평가가 필요했다.

## 4. 핵심 개념 해설

### 4.1 명목 문맥 창과 유효 문맥 길이

명목 문맥 창은 API나 모델이 받아들이도록 허용한 최대 토큰 수다. 이 값은 그 범위의 모든 정보를 같은 품질로 찾고 조합한다는 보증이 아니다. 긴 입력을 오류 없이 수용하는 능력, 특정 문장을 찾아내는 retrieval, 여러 위치의 증거를 묶는 reasoning, 그 근거에 충실한 답을 생성하는 능력은 따로 측정해야 한다.

단일 needle-in-a-haystack 평가는 긴 잡음 속에 삽입한 눈에 띄는 문자열 하나를 회수하는 과제다. Gemini 1.5 보고서는 단일 needle 과제에서 100만 토큰까지 99.7%를 넘는 recall을 보고했다. 100개의 needle을 한 번에 회수하는 조건에서도 100만 토큰으로 갈수록 recall은 소폭만 감소했다. LWM도 단일 needle에는 강했지만 여러 needle과 더 어려운 조건에서 성능 저하를 보고했다. RULER는 단일 needle만으로는 긴 문맥의 실효성을 충분히 판별하기 어렵다고 보고, 여러 검색·집계·추적 과제를 함께 평가했다.

### 4.2 계산 가능한 길이와 어텐션 방식

긴 문맥을 가능하게 하는 방법은 하나가 아니다. FlashAttention은 정확한 dense attention을 타일링하고 온라인 softmax로 계산해 attention 행렬의 중간 저장과 HBM 왕복을 줄인다. 추가 저장 공간과 I/O 병목을 크게 낮추지만 dense 산술량 $O(N^2d)$을 선형으로 바꾸지는 않는다. RingAttention은 각 장치에 query 블록을 고정하고 key·value 블록을 장치 사이의 링으로 순환시켜 장치별 메모리 한계를 넓히는 정확 어텐션 분산 기법이며, 총 산술량 자체를 없애는 sparse attention은 아니다.

반면 sliding-window나 block-sparse attention은 연결 패턴을 제한해 계산량을 줄이는 대신 먼 토큰 사이의 직접 연결 범위를 바꾼다. Transformer-XL은 이전 세그먼트의 제한된 은닉 상태를 재사용하고, RAG는 모델 바깥에서 선택한 구간만 입력한다. 압축 메모리를 쓰는 Infini-attention 같은 연구도 있지만, 이를 Gemini나 모든 긴 문맥 모델의 내부 구조로 소급해서는 안 된다. ‘100만 토큰 모델’은 하나의 아키텍처 이름이 아니라 서로 다른 시스템 설계가 도달한 입력 규모를 가리킨다.

### 4.3 위치 외삽, 학습 길이, 검색을 분리한다

RoPE나 ALiBi 같은 위치 표현은 긴 위치를 다루는 설계의 일부일 뿐, 학습 길이를 훨씬 넘어 자동으로 100만 토큰을 이해하게 만드는 장치가 아니다. ALiBi 논문의 대표 외삽은 1,024토큰 학습 뒤 2,048토큰 평가였고, RoPE 계열을 크게 확장한 연구들은 위치 스케일 조정과 추가 장문 학습을 함께 사용했다. LWM도 RoPE 파라미터를 조정하고 실제 학습 길이를 32K, 128K, 256K, 512K, 1M으로 늘렸다.

외부 검색도 별도 축이다. 긴 문맥은 후보 자료를 넓게 넣은 뒤 모델이 내부 어텐션으로 찾게 하고, RAG는 검색기가 먼저 후보를 좁힌다. 전자는 입력 비용과 내부 검색 실패가 남고, 후자는 검색 단계에서 필요한 증거를 누락할 수 있다. 실제 시스템은 둘을 배타적으로 택하기보다 검색으로 자료를 줄이고, 충분히 긴 창에서 여러 회수 결과를 함께 읽고, 캐시로 반복 입력 비용을 낮추는 방식으로 결합할 수 있다.

## 5. 원문의 논리 구조

원문은 대략 다음 흐름으로 전개됩니다.

1. 2024년 100만 토큰급 모델을 고정 문맥 창의 한계를 넘은 전환점으로 제시한다.
2. 표준 attention의 이차 비용과 긴 문서를 분할할 때 생기는 정보 손실을 문제로 든다.
3. 효율적 attention, 계층적 메모리, 재귀 검색, 위치 표현, 장문 학습을 하나의 해결 묶음으로 설명한다.
4. 법률·코드·연구·대화·금융·의료 등에서 긴 문맥이 열 수 있는 응용을 열거한다.
5. 계산 비용, 검색 실패, 지연 시간, 자료 품질을 한계로 제시하고 긴 문맥을 현대 LLM의 표준 방향으로 평가한다.

이 흐름은 긴 문맥의 문제 공간을 넓게 보여 주지만, 서로 다른 연구의 기법을 한 모델군의 공통 구조처럼 합치고 잠재 응용을 이미 입증된 성과처럼 서술하는 경향이 있다. 번역문은 이 구조를 보존하되, 사실 판단에서는 모델별 공개 근거와 평가 조건을 다시 분리해야 한다.

## 6. 왜 중요한가

긴 문맥의 진전은 단순히 사양표의 숫자를 키운 사건이 아니다. 더 많은 원자료를 한 요청에 포함할 수 있어 구간 분할 단계에서 잃던 상호 참조를 보존할 가능성이 커졌고, 모델·분산 시스템·GPU kernel·평가 설계를 한꺼번에 다뤄야 하는 연구 문제를 만들었다. 동시에 100만 토큰 입력이 모든 정보를 동일하게 이해한다는 직관을 반박하는 평가도 발전시켰다.

특히 중요한 점:

- 2024년은 긴 문맥의 최초 등장보다 100만 토큰급 공개 연구와 상용 프리뷰가 구체화된 시점으로 보는 편이 정확하다.
- 같은 최대 길이라도 정확 dense attention의 I/O 최적화·분산, 희소 연결, 재귀 메모리, 외부 검색처럼 계산·정보 접근 방식이 다를 수 있다.
- 최대 입력 길이와 실제 정보 활용 길이를 분리함으로써 단일 검색 성공, 다중 증거 결합, 전체 문서 이해를 서로 다른 평가 과제로 보게 했다.
- 긴 문맥은 구간 분할의 필요를 줄일 수 있지만 입력 비용, prefill 지연, KV cache, 잡음, 접근 제어와 개인정보 문제를 새로 크게 만든다.

## 7. 현대 LLM과의 연결

- [[088_FlashAttention IO-Aware Exact Attention for Long-Context Language Models]]: dense attention의 수학적 정의를 유지한 채 I/O와 중간 저장을 줄이는 방법을 보여 준다.
- [[064_Transformer-XL Extending Transformers to Long Sequences]]: 제한된 세그먼트 메모리 재사용과 한 번의 거대한 입력 창이 서로 다른 장거리 처리 방식임을 비교할 수 있다.
- [[068_Dense Passage Retrieval and Retrieval-Augmented Generation Integrating Knowledge with Language Models]]: 외부 검색으로 먼저 문맥을 선택하는 RAG와 긴 문맥 내부 검색의 실패 지점을 비교할 수 있다.
- [[100_Hybrid Retrieval Combining Sparse and Dense Methods for Effective Information Retrieval]]: 긴 입력에 무엇을 넣을지 정하는 검색 단계에서 희소·밀집 신호를 함께 쓰는 후속 흐름을 살필 수 있다.

현대 시스템에서는 긴 문맥과 RAG, context caching, 요약, 권한 필터링을 함께 사용한다. 긴 창은 검색 결과 여러 개를 동시에 읽고 교차 비교하는 공간을 늘리지만, 검색기가 잘못 고른 자료나 긴 입력 안의 악의적 지시를 자동으로 제거하지 않는다. 반대로 RAG는 비용을 줄일 수 있지만 검색 전에 버린 증거를 모델이 복구할 수 없다. 따라서 ‘모두 넣기’와 ‘먼저 고르기’의 오류를 따로 측정해야 한다.

## 8. 한계와 비판적 관점

- 역사적 한계: 긴 문맥은 2024년에 처음 등장하지 않았다. 정확한 표현은 2024년에 100만 토큰급 공개 연구 모델과 상용 프리뷰가 전면화됐다는 것이다.
- 구조적 한계: Gemini 1.5 보고서는 sparse MoE와 광범위한 시스템 변경을 공개했지만, 원문이 열거한 RoPE·ALiBi·sliding window·계층적 메모리·재귀 검색을 Gemini의 구현으로 확인해 주지 않는다.
- 계산 한계: FlashAttention은 exact dense attention의 I/O와 저장을 줄이지만 이차 산술량을 없애지 않는다. 백만 토큰은 하드웨어 수, 병렬화, 정밀도, batch와 latency 목표에 따라 비용이 크게 달라진다.
- 위치 일반화 한계: 위치 인코딩 하나만 바꿔 학습 범위를 무제한 외삽할 수 없다. 위치 스케일, 장문 데이터, 추가 학습과 안정성 평가가 함께 필요하다.
- 평가 한계: 단일 needle 회수는 전체 책 이해나 여러 문서의 관계 추론을 증명하지 않는다. 복수 needle, 집계, 순서 추적, 모순 판별, 인용 정확도를 함께 평가해야 한다.
- 응용 증거 한계: 법률 계약 전체, 코드베이스 전체, 의료 기록 전체의 정확한 분석은 가능한 사용 시나리오이지 원문만으로 검증된 배포 성과가 아니다.
- 시스템 한계: 긴 입력은 prefill 시간·입력 요금·KV cache·메모리·데이터 노출 범위를 늘린다. 캐시·검색·분할·요약은 여전히 비용과 위험을 관리하는 수단이다.
- 원문 정정: 원문은 긴 문맥의 맨 앞이나 맨 뒤 정보가 가운데보다 덜 활용된다고 썼다. 그러나 [Lost in the Middle](https://aclanthology.org/2024.tacl-1.9/)은 일반적으로 관련 정보가 시작이나 끝에 있을 때 성능이 높고 가운데에 있을 때 낮아지는 primacy·recency 패턴을 보고했다. 다만 이 결과도 모든 모델과 과제에 예외 없이 적용되는 법칙은 아니다.

핵심 1차 근거는 [LWM](https://arxiv.org/html/2402.08268), [Gemini 1.5 기술 보고서](https://storage.googleapis.com/deepmind-media/gemini/gemini_v1_5_report.pdf), [Gemini 1.5 발표](https://blog.google/innovation-and-ai/products/google-gemini-next-generation-model-february-2024/), [RULER](https://arxiv.org/abs/2404.06654)다.

## 9. 용어 정리

| 용어 | 설명 |
|---|---|
| 문맥 창(context window) | 모델이 한 요청에서 입력과 출력으로 다루도록 허용된 토큰 범위 |
| 명목 문맥 길이 | API·모델 사양이 허용한다고 표시한 최대 길이 |
| 유효 문맥 길이 | 특정 과제와 정확도 기준에서 정보를 안정적으로 찾고 사용하는 실제 길이 |
| prefill | 생성 전에 입력 토큰 전체를 처리하고 내부 상태와 KV cache를 만드는 단계 |
| KV cache | autoregressive 생성 때 이전 key·value를 재사용하기 위해 저장하는 상태 |
| needle-in-a-haystack | 긴 잡음 문맥 속에 삽입한 특정 정보 하나를 회수하는 합성 평가 |
| multi-needle | 여러 위치의 정보를 모두 회수하거나 구분해야 하는 더 어려운 평가 |
| exact attention | 희소화·근사 없이 dense softmax attention과 같은 수학적 함수를 계산하는 방식 |
| sparse attention | 일부 위치 쌍만 연결해 계산량을 줄이는 대신 정보 접근 패턴을 제한하는 방식 |
| position extrapolation | 학습 때 본 위치 범위보다 긴 위치에서 위치 표현과 attention이 작동하도록 확장하는 것 |
| RingAttention | 각 장치에 query 블록을 두고 key·value 블록을 링을 따라 순환시키며 원래 어텐션을 블록 단위로 계산하는 분산 방식 |
| RAG | 외부 검색기가 관련 구간을 먼저 고르고 그 결과를 생성 모델의 문맥으로 제공하는 구조 |

## 10. 함께 보면 좋은 항목

- [[064_Transformer-XL Extending Transformers to Long Sequences]]
- [[068_Dense Passage Retrieval and Retrieval-Augmented Generation Integrating Knowledge with Language Models]]
- [[088_FlashAttention IO-Aware Exact Attention for Long-Context Language Models]]
- [[100_Hybrid Retrieval Combining Sparse and Dense Methods for Effective Information Retrieval]]

관련 항목은 원문 폴더에 실제로 존재하는 가까운 자료만 연결했다.

## 11. 읽고 생각해볼 질문

1. 모델이 100만 토큰을 입력으로 받는다는 사실과 그 안의 여러 증거를 정확히 결합한다는 사실은 왜 다른가?
2. FlashAttention과 RingAttention은 dense attention의 계산·메모리 문제 가운데 각각 무엇을 줄이고 무엇을 그대로 남기는가?
3. LWM의 공개된 구현을 Gemini 1.5의 비공개 내부 구조에 그대로 적용해 설명하면 어떤 오류가 생기는가?
4. 단일 needle, multi-needle, 문서 전체 추론은 어떤 순서로 더 강한 능력을 요구하는가?
5. 긴 문맥과 RAG를 함께 쓸 때 검색 전 누락과 문맥 안 활용 실패를 어떻게 따로 측정할 수 있는가?

## 12. 짧은 결론

긴 문맥 모델의 역사적 의미는 100만이라는 숫자 하나에 있지 않다. 2024년 LWM은 정확 어텐션의 분산·I/O 최적화와 위치 조정·점진 학습을 공개 모델로 보여 줬고, Gemini 1.5는 100만 토큰급 문맥을 상용 프리뷰의 전면에 놓았다. 그러나 제품이 허용한 길이, 모델이 특정 정보를 찾는 길이, 여러 증거를 조합하는 길이, 감당할 수 있는 비용은 서로 다르다. 원문의 광범위한 응용 가능성을 현실적인 설계 원리로 바꾸려면 모델별 실제 구조를 확인하고, 단일 검색을 넘어 복합 추론과 근거 충실성까지 평가하며, 긴 문맥·검색·캐시·분할을 상호 보완적으로 사용해야 한다.
