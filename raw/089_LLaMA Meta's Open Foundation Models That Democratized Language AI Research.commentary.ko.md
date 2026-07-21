---
title: "LLaMA 1의 공개 연구 접근과 추론 지향 스케일링 해설"
source_file: "089_LLaMA Meta's Open Foundation Models That Democratized Language AI Research.md"
translation_file: "089_LLaMA Meta's Open Foundation Models That Democratized Language AI Research.ko.md"
commentary_type: "해설"
source_stem: "089_LLaMA Meta's Open Foundation Models That Democratized Language AI Research"
order_prefix: "089"
source_title: "LLaMA: Meta's Open Foundation Models That Democratized Language AI Research"
source_url: "https://mbrenndoerfer.com/writing/llama-meta-open-foundation-models-democratized-language-ai-research"
topic: "LLaMA 1의 공개 연구 접근과 추론 지향 스케일링"
period: "2023"
tags:
  - LLM
  - NLP
  - AI-history
  - commentary
  - LLaMA
---

# LLaMA 1의 공개 연구 접근과 추론 지향 스케일링 해설

## 1. 한눈에 보기

- **핵심 주제:** 2023년 LLaMA 1은 7B·13B·33B·65B 규모의 base foundation model을 연구자에게 제한적으로 공개하고, 작은 모델을 더 많은 token으로 학습하는 추론 지향 설계를 보여 주었다.
- **등장 배경:** GPT-3, Chinchilla, PaLM처럼 강력한 모델의 weight와 내부 구조에 직접 접근하기 어려워 독립적인 재현·미세조정·안전성 연구가 제한돼 있었다.
- **가장 중요한 아이디어:** 고정된 학습 계산량만 최적화하지 않고, 같은 목표 성능에서 반복적으로 드는 inference 비용까지 고려해 더 작은 모델을 계산 최적점보다 오래 학습했다.
- **역사적 의미:** 높은 성능의 weight에 대한 연구 접근 범위를 넓혔지만, 최초 배포는 application-gated이고 noncommercial research license였으므로 무제한 open source나 상업 이용 허용으로 부르면 안 된다.
- **읽을 때의 핵심 구분:** LLaMA가 새로 발명한 구성 요소와 기존 연구에서 채택한 구성 요소, base LLaMA와 실험용 LLaMA-I, LLaMA 1과 Llama 2를 분리해야 한다.

> 이 문서는 `089_LLaMA Meta's Open Foundation Models That Democratized Language AI Research.md`의 번역문을 이해하기 위한 해설이다. 원문의 역사적 평가를 그대로 반복하지 않고, Touvron 외의 2023년 논문과 Meta의 2023년 2월 24일 발표를 기준으로 수치·배포 조건·비교 범위를 교정한다.

## 2. 핵심 요약

LLaMA 1의 직접적인 연구 기여는 단순히 “GPT-3보다 작은 모델”을 만든 데 있지 않다. 저자들은 Chinchilla scaling law에서 출발했지만, 고정된 **training compute** 아래의 최적점과 배포 후 누적되는 **inference compute**의 최적점이 다르다고 보았다. 그래서 7B·13B 모델을 1조 token, 33B·65B 모델을 1.4조 token으로 학습했다. 특히 7B는 parameter당 약 149 token으로, 흔히 인용되는 Chinchilla의 약 20 token/parameter보다 훨씬 오래 학습했다.

모델 구조는 새로운 Transformer 계열을 발명한 것이 아니라, causal Transformer에 기존의 pre-normalization, RMSNorm, SwiGLU, RoPE를 조합한 것이다. 학습 데이터는 공개적으로 접근 가능한 자료만 사용한다는 원칙 아래 Common Crawl, C4, GitHub, Wikipedia, Gutenberg·Books3, ArXiv, Stack Exchange를 섞었다. 논문은 20개 benchmark의 zero-shot·few-shot 평가에서 LLaMA-13B가 GPT-3 175B를 “대부분의 benchmark에서” 앞섰고, LLaMA-65B가 Chinchilla-70B·PaLM-540B와 경쟁 가능하다고 보고했다. 이는 모든 과제에서 일관되게 우월했다는 뜻은 아니다.

최초 배포도 정확히 구분해야 한다. Meta는 model weight를 신청자에게 case-by-case로 제공했고, **비상업적 연구 목적의 license**를 적용했다. 따라서 LLaMA 1 weight는 일반적인 open-source license나 상업 이용 가능 배포물이 아니었다. 상업 이용을 허용한 것은 2023년 7월의 별도 세대인 Llama 2이며, 그 조건을 LLaMA 1에 소급할 수 없다.

| 원문에서 주의할 표현 | 공식 자료에 가까운 설명 |
|---|---|
| “open-source model” | 연구 접근이 확대된 gated weight release였다. 최초 license는 noncommercial research 용도였다. |
| “각 모델이 compute-optimal ratio를 따랐다” | 65B는 약 21.5 token/parameter로 Chinchilla 기준에 가깝지만, 작은 모델은 inference 효율을 위해 훨씬 더 오래 학습했다. |
| “LLaMA의 architectural innovations” | RMSNorm·SwiGLU·RoPE는 선행 연구에서 도입된 기법이며, LLaMA의 기여는 검증된 요소의 효과적인 조합과 규모 있는 실증에 가깝다. |
| “13B·65B가 더 큰 모델을 능가했다” | 13B는 GPT-3를 **대부분의 보고된 benchmark에서**, 65B는 Chinchilla·PaLM과 **경쟁 가능한 수준으로** 비교됐다. |
| “consumer hardware에서 쉽게 실행” | 논문이 직접 말한 것은 13B의 single V100 inference다. V100은 data-center GPU이며 full-precision memory와 fine-tuning 비용은 별도 문제다. |

## 3. 역사적 배경

2020년 GPT-3는 scale을 늘리면 zero-shot·few-shot 능력이 강해질 수 있음을 보여 주었지만, 175B weight를 독립 연구자가 직접 조사하거나 수정하기는 어려웠다. 2022년 Chinchilla는 같은 training compute 예산이라면 parameter만 키우는 대신 model과 token 수를 함께 늘려야 한다고 주장했다. 같은 해 PaLM은 540B 규모와 대규모 분산 학습의 성과를 제시했다. 이 흐름에서 model capability는 빠르게 높아졌지만, 강한 model의 weight와 training detail에 대한 접근은 소수 조직에 집중돼 있었다.

LLaMA 논문은 여기서 목적 함수를 한 번 더 바꾸었다. Chinchilla가 “주어진 **학습 계산량**으로 loss를 최소화하려면 model과 data를 어떻게 배분할까”를 물었다면, LLaMA는 “목표 성능에 도달한 뒤 반복적으로 service할 때 어떤 model이 더 싼가”를 함께 물었다. 큰 model을 짧게 학습하는 편이 training 단계에서는 저렴할 수 있어도, 작은 model을 오래 학습해 같은 품질에 도달하면 매 inference 요청의 비용은 작아질 수 있다.

이 선택은 연구 접근의 현실과도 연결됐다. 논문은 LLaMA-13B가 inference에서 single V100 GPU에 올라간다고 강조했다. 이는 175B급 model보다 실험 문턱을 크게 낮췄지만 “누구나 아무 consumer PC에서 실행 가능”하다는 뜻은 아니다. model weight를 받는 법적 접근, GPU memory, runtime, fine-tuning memory는 서로 다른 장벽이다.

- **이전 접근:** parameter scale 확대와 제한된 API 접근
- **새 질문:** training-optimal model과 inference-efficient model은 같은가
- **LLaMA의 답:** 더 작은 model을 훨씬 많은 token으로 학습하고, 연구자에게 weight 접근을 제공한다
- **남은 긴장:** 접근 확대와 gated/noncommercial license, 높은 사전학습 비용과 낮아진 inference 비용 사이의 차이

## 4. 핵심 개념 해설

### 4.1 Chinchilla의 재현이 아니라 추론 지향 overtraining이다

논문 Table 2의 실제 parameter 수와 token 수를 나누면 다음과 같다.

| 명칭 | 실제 parameter 수 | 학습 token | token/parameter |
|---|---:|---:|---:|
| LLaMA-7B | 6.7B | 1.0T | 약 149 |
| LLaMA-13B | 13.0B | 1.0T | 약 77 |
| LLaMA-33B | 32.5B | 1.4T | 약 43 |
| LLaMA-65B | 65.2B | 1.4T | 약 21.5 |

Chinchilla 논문에서 흔히 요약되는 기준은 약 20 token/parameter다. 이 기준만 보면 65B는 근접하지만 7B·13B·33B는 훨씬 많은 token을 보았다. LLaMA 저자들은 이를 실수나 과적합으로 설명하지 않았다. Chinchilla의 계산 최적점이 inference budget을 고려하지 않는다고 지적하고, 작은 model의 성능이 1T token 이후에도 계속 좋아진다는 관찰을 근거로 더 오래 학습했다. 여기서 **overtraining**은 일반화 성능을 망쳤다는 뜻이 아니라, training-compute optimum을 지나서도 inference 효율을 위해 추가 계산을 선투자했다는 뜻이다.

### 4.2 데이터 혼합은 일곱 출처로 구성됐다

원문은 Stack Exchange를 빠뜨리지만 공식 논문 Table 1의 혼합은 다음과 같다.

| 데이터 출처 | 표본 비율 | 공식 설명에서 주의할 점 |
|---|---:|---|
| English Common Crawl | 67.0% | 2017~2020년 다섯 dump를 CCNet으로 정제한 영어 web data |
| C4 | 15.0% | Common Crawl의 별도 정제본이며 heuristic 품질 filter 사용 |
| GitHub | 4.5% | BigQuery 공개 자료 중 Apache·BSD·MIT license project만 선택 |
| Wikipedia | 4.5% | 2022년 6~8월 dump, Latin·Cyrillic script를 쓰는 20개 언어 |
| Gutenberg + Books3 | 4.5% | 두 book corpus를 합친 항목이며 book level 중복 제거 적용 |
| ArXiv | 2.5% | LaTeX source에서 앞부분·참고문헌·comment 등을 정리 |
| Stack Exchange | 2.0% | 가장 큰 28개 site의 Q&A를 사용하고 answer를 score 순으로 정렬 |

“공개적으로 접근 가능한 data만 사용했다”는 논문의 표현은 “모든 문서가 public domain이거나 permissive open license다”와 같은 말이 아니다. 공개 접근 가능성, 학습에 사용할 수 있다는 판단, 원문을 재배포할 수 있는 권리는 구분해야 한다. 또한 20개 언어라는 설명은 Wikipedia 부분에 해당한다. 전체 혼합의 대부분은 English Common Crawl과 C4이므로 LLaMA 1을 균형 잡힌 20개 언어 model로 해석해서는 안 된다.

### 4.3 구조의 핵심은 선행 기법의 조합이다

LLaMA는 decoder-only causal Transformer 계열이다. 논문은 original Transformer와 다른 지점을 설명하면서 각 선택의 선행 계보를 직접 적었다.

- **Pre-normalization:** GPT-3 계열의 선택을 따르되, normalization 함수로 Zhang과 Sennrich가 제안한 RMSNorm을 사용했다.
- **SwiGLU:** Shazeer가 제안한 gated activation이며, PaLM에서 사용된 설계를 참고했다. LLaMA가 SwiGLU 자체를 발명한 것은 아니다.
- **RoPE:** Su 외가 제안한 rotary positional embedding을 사용했고, 논문은 GPT-Neo 계열의 채택을 참고점으로 표기했다.
- **Efficient attention:** xFormers 구현을 사용했으며 Rabe와 Staats의 memory-efficient attention, Dao 외의 backward 구현에서 영향을 받았다.
- **Training stack:** AdamW, cosine learning-rate schedule, gradient clipping, model·sequence parallelism, communication overlap을 조합했다.

따라서 LLaMA의 architecture contribution을 설명할 때는 “RMSNorm·SwiGLU·RoPE를 발명했다”보다 “이미 검증된 구성 요소를 대규모 base model family에 일관되게 결합하고, 많은 token 학습과 함께 성능을 입증했다”고 쓰는 편이 정확하다.

### 4.4 공개 연구 접근과 open source는 같은 말이 아니다

2023년 2월 24일 Meta 발표는 LLaMA를 **noncommercial license focused on research use cases**로 공개한다고 명시했다. 접근 대상도 academic researcher, 정부·시민사회·학계 소속 연구자, 전 세계 industry research laboratory 등에 대해 case-by-case로 승인하는 방식이었다. 이는 API만 제공하는 closed model보다 weight-level 연구 가능성을 크게 넓혔지만, 다운로드·수정·재배포·상업 이용을 누구에게나 허용하는 open-source release는 아니었다.

세 층위를 나눠야 한다.

1. **논문 공개:** 누구나 방법과 결과를 읽을 수 있다.
2. **code 공개:** 일부 training·inference code를 공개할 수 있다.
3. **weight license와 접근:** LLaMA 1은 신청·승인과 비상업 연구 조건이 붙었다.

weight가 비공식 경로로 유출돼 널리 복제됐더라도 license 조건이 자동으로 바뀌는 것은 아니다. 역사적 영향은 실제 유통과 공식 배포 정책을 따로 기록해야 한다.

### 4.5 base LLaMA와 LLaMA-I를 분리해야 한다

LLaMA 7B·13B·33B·65B의 중심 결과는 next-token prediction으로 사전학습한 **base model**이다. 이 family는 대화용 assistant가 아니며 RLHF나 chat safety alignment를 거친 model도 아니다. 논문 §4는 별도의 짧은 실험으로 65B model에 instruction finetuning을 적용한 **LLaMA-I**를 소개한다. MMLU 5-shot 점수는 base LLaMA-65B 63.4에서 LLaMA-I 68.9로 올랐지만, 저자들은 instruction tuning이 논문의 중심이 아니며 단 한 번의 실험만 수행했다고 밝혔다.

따라서 base LLaMA의 benchmark 결과, LLaMA-I의 instruction-following 결과, 뒤이어 community가 만든 Alpaca 같은 derivative, Llama 2-Chat의 alignment 결과를 한 model의 성능처럼 합치면 안 된다.

## 5. 원문의 논리 구조

원문은 대략 다음 순서로 전개된다.

1. GPT-3·PaLM 같은 proprietary model에 대한 접근 제한을 문제로 제시한다.
2. Chinchilla scaling law를 근거로 작은 model에 더 많은 data를 배분하는 전략을 설명한다.
3. RMSNorm·SwiGLU·RoPE를 LLaMA의 architecture innovation으로 묶어 소개한다.
4. 연구자가 weight를 받아 fine-tuning과 내부 분석을 할 수 있게 된 release strategy를 설명한다.
5. 학계·startup·open model community·safety 연구에 미친 파급을 서술한다.
6. license, instruction following, bias, hardware, multilingual 한계를 검토한다.
7. LLaMA가 이후 open LLM ecosystem의 토대가 됐다고 평가한다.

이 흐름은 접근성의 중요성을 잘 드러내지만, 원인과 후대 영향을 넓게 단정하는 경향이 있다. 공식 논문과 발표가 직접 뒷받침하는 범위는 2023년 2월의 model 설계·학습 data·benchmark·safety evaluation·배포 정책이다. Alpaca, LoRA 기반 fine-tuning 확산, MPT·Falcon·Mistral과의 관계처럼 발표 이후 일어난 사건은 각각 별도 자료로 검증해야 한다.

또한 원문의 문제–해결 구도는 세 가지 최적화를 한데 묶는다. **training compute 최적화**, **inference cost 최적화**, **연구 접근 정책**은 서로 다른 축이다. LLaMA는 첫 번째의 엄격한 최적점을 따르기보다 두 번째를 위해 추가 학습했고, 세 번째에서는 완전 공개가 아니라 gated access를 선택했다.

## 6. 왜 중요한가

LLaMA 1은 “model이 작다”와 “model이 약하다”를 같은 말로 취급하던 관성을 흔들었다. 중요한 것은 parameter 수 하나가 아니라, 어떤 data를 얼마나 보았고 목표가 training cost인지 serving cost인지였다.

특히 중요한 점은 다음과 같다.

- **추론 예산을 scaling 논의의 전면에 놓았다.** 작은 model을 오래 학습하면 선행 training cost는 늘어도 반복 inference 비용을 낮출 수 있다는 trade-off를 명시했다.
- **공개 data만으로 경쟁력 있는 base model을 학습할 수 있음을 보였다.** proprietary·비공개 corpus가 필수라는 가정을 약화했지만, 공개 접근 data와 open-license data를 동일시하지는 않았다.
- **weight-level research의 범위를 넓혔다.** 내부 representation 분석, custom evaluation, fine-tuning처럼 API만으로 어려운 연구가 가능해졌다. 다만 이 접근은 신청 승인 대상에 한정됐다.
- **선행 architecture choice의 표준 조합을 정착시켰다.** RMSNorm·SwiGLU·RoPE는 LLaMA보다 앞서 존재했지만, LLaMA의 성능과 후속 채택으로 현대 decoder-only LLM의 익숙한 조합이 됐다.
- **비교 문장의 조건을 보여 주었다.** 13B가 175B를 “대부분의 특정 benchmark에서” 앞서는 결과는 parameter 효율의 강한 증거지만, 모든 실제 사용 능력의 우월성을 뜻하지 않는다.

연구 민주화라는 평가는 가치 판단을 포함한다. LLaMA 1은 접근 범위를 실질적으로 넓혔지만, license와 신청 절차로 접근자를 선별했다. 따라서 “완전한 민주화”보다 “강한 base model weight에 대한 연구 접근을 크게 확장한 전환점”이라고 표현하는 편이 역사적으로 균형 잡혀 있다.

## 7. 현대 LLM과의 연결

### 7.1 모델 크기보다 총생애 비용을 본다

LLaMA가 제기한 training–inference trade-off는 오늘날에도 유효하다. 같은 목표 품질이라면 작은 model의 긴 pretraining이 초기 비용은 더 들 수 있지만, 많은 사용자에게 반복 service하거나 edge에 배포할 때는 총비용이 낮을 수 있다. 다만 context length, batch size, quantization, KV cache, hardware utilization까지 포함해야 실제 serving cost를 비교할 수 있다.

### 7.2 base model과 assistant model 사이에는 post-training이 있다

현대 사용자가 “LLM”에서 기대하는 대화, 지시 준수, 거절 행동, preference alignment는 base pretraining만으로 생기지 않는다. LLaMA-I의 짧은 실험은 instruction tuning 효과를 보여 주지만, LLaMA 1 family 전체가 instruction-tuned였다는 뜻은 아니다. 이후의 supervised fine-tuning, preference optimization, RLHF, safety tuning은 별도의 data와 목표 함수를 갖는 post-training 단계다.

### 7.3 LLaMA 1과 Llama 2는 다른 배포 사건이다

- **LLaMA 1, 2023년 2월:** 7B·13B·33B·65B base model, 1.0T 또는 1.4T token, 연구 신청 기반 noncommercial release
- **Llama 2, 2023년 7월:** 7B·13B·70B pretrained model과 chat fine-tuned variant, 별도 community license 아래 research와 commercial use 허용

Llama 2의 commercial license, chat alignment와 safety 개선을 LLaMA 1의 특징으로 소급해서는 안 된다. 반대로 LLaMA 1의 gated research-only 조건을 이후 모든 Llama 세대의 조건으로 일반화해서도 안 된다.

### 7.4 생태계 영향은 직접 계보와 간접 영향을 구분한다

LLaMA weight를 직접 fine-tune한 Alpaca류 model은 기술적 파생 관계를 입증하기 쉽다. 그러나 MPT, Falcon, Mistral을 모두 “LLaMA 위에 만들어진 model”이라고 쓰려면 각 model의 architecture·weight·training code에 대한 별도 근거가 필요하다. 같은 시기에 open-weight movement를 강화했거나 RMSNorm·RoPE 같은 선택을 공유한다는 사실만으로 직접 계보가 성립하지 않는다. LLaMA의 광범위한 생태계 영향은 타당한 해석일 수 있지만, 개별 model의 직접 파생 관계와는 구분해야 한다.

## 8. 한계와 비판적 관점

### 8.1 benchmark 주장의 실제 범위

논문은 총 20개 benchmark에서 zero-shot·few-shot 결과를 보고했다. 범위는 common-sense reasoning 8종, Natural Questions·TriviaQA closed-book QA, RACE reading comprehension, MATH·GSM8K, HumanEval·MBPP code generation, MMLU를 포함한다. 하지만 모든 비교 model을 같은 code와 prompt로 다시 실행한 완전 통제 실험은 아니었다. Table 3 등은 다른 논문에서 보고된 수치를 함께 사용했고, task마다 zero-shot·few-shot 조건과 scoring 방식이 달랐다.

- **LLaMA-13B 대 GPT-3 175B:** common-sense, QA, RACE, MMLU 등 보고된 비교의 다수에서 13B가 앞섰다. “모든 benchmark와 실제 application에서 우월”하다는 주장은 아니다.
- **LLaMA-65B 대 Chinchilla-70B·PaLM-540B:** common-sense 표에서는 대체로 강했지만, MMLU 평균은 LLaMA 63.4, Chinchilla 67.5, PaLM-540B 69.3으로 뒤졌다. 논문 초록의 표현도 “competitive”이지 “universally superior”가 아니다.
- **수학·code 결과:** prompt, sample 수, majority voting, task-specific finetuning 여부가 다르면 같은 숫자를 직접 비교하기 어렵다.

### 8.2 safety evaluation은 mitigation이 아니다

논문은 RealToxicityPrompts, CrowS-Pairs, WinoGender, TruthfulQA로 toxicity·stereotype·gender bias·misinformation 위험을 조사했다. 이는 당시 open foundation model 논문에서 중요한 공개였지만, safety filter나 alignment를 model에 내장했다는 뜻은 아니다.

- RealToxicityPrompts에서는 model 크기가 커질수록 toxicity가 증가하는 경향이 나타났고, 65B의 “respectful” prompt 점수가 오히려 높게 측정됐다.
- CrowS-Pairs 평균만 보면 GPT-3·OPT보다 약간 낮은 bias score였지만 religion·age·gender 등 범주별 문제는 남았다.
- WinoGender의 gotcha case는 직업의 성별 고정관념을 활용하는 오류를 드러냈다.
- TruthfulQA에서 LLaMA-65B가 GPT-3보다 높았어도 정답률은 충분히 낮아 hallucination 위험이 계속됐다.
- 저자들 스스로 이 benchmark들이 model 위험을 완전히 이해하기에 충분하지 않다고 명시했다.

### 8.3 “consumer hardware”라는 표현에는 조건이 필요하다

논문이 직접 제시한 접근성 사례는 LLaMA-13B의 single V100 inference다. V100은 consumer GPU가 아니라 data-center accelerator다. 13B weight만 FP16·BF16으로 약 26GB이고 runtime state와 KV cache가 추가되므로 32GB급 장치와 최적화된 inference가 전제된다. 7B도 FP16 weight만 약 13~14GB여서 모든 일반 PC에 맞는 것은 아니다. 65B는 FP16 weight만 약 130GB이므로 여러 GPU나 강한 quantization이 필요하다.

후속 quantization과 community runtime이 소비자 장비 접근성을 크게 높였지만, 그것은 2023년 논문의 base release 사양과 별도 발전이다. 또한 inference에 올라간다는 사실과 full fine-tuning이 가능하다는 사실은 다르다. optimizer state와 gradient·activation을 저장하는 full training은 훨씬 많은 memory를 요구한다.

### 8.4 사전학습 자체는 여전히 거대했다

작은 parameter 수는 저렴한 사전학습을 뜻하지 않는다. 논문은 65B 최종 학습이 2,048대 A100-80GB에서 약 21일 걸렸다고 보고했고, 전체 model 개발에는 같은 수의 GPU를 약 5개월 사용한 것으로 추정했다. model family를 만드는 비용과 공개된 checkpoint를 inference·fine-tuning하는 비용을 구분해야 “민주화”의 범위를 정확히 평가할 수 있다.

### 8.5 원문의 주요 오해 바로잡기

| 오해 | 교정 |
|---|---|
| LLaMA 1은 자유로운 open-source model이었다. | application-gated weight release였고 license는 noncommercial research 용도였다. |
| LLaMA 1은 commercial use도 허용했다. | commercial use 허용은 별도 세대인 Llama 2 발표의 특징이다. |
| 모든 model이 Chinchilla의 약 20 token/parameter를 따랐다. | 7B·13B·33B는 각각 약 149·77·43으로 훨씬 오래 학습했다. |
| data mixture는 Common Crawl·C4·GitHub·Wikipedia·Books·ArXiv뿐이다. | Stack Exchange가 2% 포함됐다. |
| RMSNorm·SwiGLU·RoPE는 LLaMA가 발명했다. | 모두 선행 연구의 기법이며 LLaMA는 이를 조합해 규모 있게 검증했다. |
| 13B가 GPT-3보다 모든 면에서 낫다. | 논문이 비교한 benchmark의 다수에서 앞섰다는 조건부 결과다. |
| 65B가 Chinchilla와 PaLM을 항상 이겼다. | 일부 표에서는 앞섰지만 MMLU 등에서는 뒤졌고, 공식 표현은 competitive다. |
| LLaMA 1은 바로 쓸 수 있는 chat assistant였다. | 주 release는 base model이며 LLaMA-I는 제한적인 별도 instruction-tuning 실험이다. |
| 작은 model은 보통 consumer GPU에서 쉽게 fine-tuning할 수 있었다. | single V100 inference가 공식 근거이며 full fine-tuning은 훨씬 큰 memory를 요구한다. |
| MPT·Falcon·Mistral은 모두 LLaMA의 직접 후속 model이다. | 광범위한 영향과 직접 architecture·weight 계보는 별도 근거로 입증해야 한다. |

## 9. 용어 정리

| 용어 | 설명 |
|---|---|
| Foundation model | 대규모 비표지 data로 사전학습한 뒤 여러 downstream task에 적응할 수 있는 범용 기반 model |
| Base model | next-token prediction 등 pretraining objective로 학습됐지만 대화·지시·preference에 맞춘 post-training은 거치지 않은 model |
| Training-compute optimum | 정해진 학습 계산량 안에서 model size와 token 수를 배분해 loss를 최소화하는 지점 |
| Inference-oriented overtraining | training-compute optimum보다 더 많은 token을 작은 model에 투자해 이후 inference 비용을 낮추려는 선택 |
| Token/parameter ratio | 학습 token 수를 parameter 수로 나눈 값. model이 capacity 대비 data를 얼마나 많이 보았는지 보는 한 지표 |
| Gated release | 신청·심사·승인 같은 절차를 통과한 대상에게만 artifact 접근을 제공하는 방식 |
| Noncommercial research license | 연구 목적 이용은 허용하지만 상업 이용에는 허가를 주지 않는 license 조건 |
| Open source | 통상 source·수정·재배포·사용 분야에 대한 폭넓은 권리를 보장하는 license를 뜻하며 단순 weight 접근과 같지 않음 |
| Pre-normalization | Transformer sublayer의 출력이 아니라 입력을 먼저 normalization하는 배치 방식 |
| RMSNorm | 평균 중심화를 생략하고 root mean square로 scale을 정규화하는 기법 |
| SwiGLU | Swish 계열 activation과 gate를 결합한 feed-forward activation |
| RoPE | query·key vector의 회전으로 position 정보를 반영하는 rotary positional embedding |
| LLaMA-I | LLaMA 논문에서 간단한 instruction finetuning을 적용해 평가한 65B 실험 model |
| Weight-level access | API 출력만 쓰는 대신 model parameter를 직접 실행·검사·변형할 수 있는 접근 |

## 10. 함께 보면 좋은 항목

- [[055_The Transformer Attention Is All You Need.ko|Transformer: Attention Is All You Need]]: LLaMA가 기반으로 삼은 causal self-attention 구조의 출발점
- [[067_GPT-3 and In-Context Learning Emergent Capabilities from Scale.ko|GPT-3와 in-context learning]]: LLaMA-13B의 대표 비교 대상과 parameter 중심 scaling의 역사적 배경
- [[078_Chinchilla Scaling Laws Compute-Optimal Training and Resource Allocation for Large Language Models.ko|Chinchilla scaling law]]: training-compute optimum과 LLaMA의 inference-oriented overtraining을 구분하는 기준
- [[083_PaLM Pathways Language Model - Large-Scale Training, Reasoning, and Multilingual Capabilities.ko|PaLM]]: LLaMA-65B의 비교 대상이자 SwiGLU 채택의 직접 참고 사례
- [[072_Instruction Tuning Adapting Language Models to Follow Explicit Instructions.ko|Instruction tuning]]: base LLaMA와 LLaMA-I·후속 chat model 사이의 post-training 차이를 이해하는 자료

## 11. 읽고 생각해볼 질문

1. Chinchilla의 약 20 token/parameter가 training-compute optimum이라면, LLaMA-7B를 약 149 token/parameter까지 학습한 선택은 어떤 조건에서 합리적인가?
2. model weight를 연구자에게 제공하는 것과 open-source license로 누구에게나 배포하는 것은 연구 재현성과 이용 권리에서 어떻게 다른가?
3. LLaMA-13B가 GPT-3 175B를 “대부분의 benchmark에서” 앞섰다는 결론을 실제 application 성능으로 일반화하려면 어떤 추가 평가가 필요한가?
4. RMSNorm·SwiGLU·RoPE를 LLaMA의 “혁신”이라고 부를 때, 발명·채택·통합·실증 가운데 어느 수준의 기여를 뜻하는지 어떻게 밝혀야 하는가?
5. single V100 inference라는 결과와 consumer hardware 접근성, quantized inference, full fine-tuning 가능성을 어떤 지표로 따로 평가할 수 있는가?
6. LLaMA가 open LLM ecosystem에 미친 간접 영향과 특정 model이 LLaMA에서 직접 파생됐다는 기술적 계보를 어떤 근거로 구분할 수 있는가?

## 12. 짧은 결론

LLaMA 1의 가장 오래 남는 기여는 “모든 것을 자유롭게 공개한 최초의 open-source LLM”이 아니라, **강한 base model을 더 작은 inference footprint로 만들고 weight-level 연구 접근을 크게 넓힌 사건**에 있다. 저자들은 Chinchilla의 scaling law에서 출발했지만, 작은 model을 training-compute optimum보다 오래 학습해 반복 inference의 경제성을 우선했다. RMSNorm·SwiGLU·RoPE는 새 발명이 아니라 선행 기법의 조합이었고, 13B·65B의 비교 우위도 보고된 zero-shot·few-shot benchmark 범위 안에서 읽어야 한다. 최초 배포는 신청 기반 noncommercial research license였으며, commercial use와 chat-tuned model을 포함한 Llama 2는 별도 세대다. 이 조건을 정확히 붙일 때 LLaMA는 과장 없이도 충분히 중요한 전환점으로 남는다.

공식 근거는 Hugo Touvron 외, [*LLaMA: Open and Efficient Foundation Language Models*](https://arxiv.org/abs/2302.13971), Meta의 2023년 2월 24일 [LLaMA 발표](https://ai.meta.com/blog/large-language-model-llama-meta-ai/)다. LLaMA 1과 후속 세대의 배포 조건을 구분할 때는 Meta의 2023년 7월 18일 [Llama 2 발표](https://ai.meta.com/blog/llama-2/)를 함께 확인한다.
