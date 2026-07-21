---
title: "2023년 오픈 LLM 물결과 공개성의 층위 해설"
source_file: "090_Open LLM Wave The Proliferation of High-Quality Open-Source Language Models.md"
translation_file: "090_Open LLM Wave The Proliferation of High-Quality Open-Source Language Models.ko.md"
commentary_type: "해설"
source_stem: "090_Open LLM Wave The Proliferation of High-Quality Open-Source Language Models"
order_prefix: "090"
source_title: "Open LLM Wave: The Proliferation of High-Quality Open-Source Language Models"
source_url: "https://mbrenndoerfer.com/writing/open-llm-wave-proliferation-high-quality-open-source-language-models"
topic: "2023년 오픈 LLM 물결과 공개성·효율·평가의 층위"
period: "2023"
tags:
  - LLM
  - NLP
  - AI-history
  - commentary
  - open-weights
  - model-release
---

# 2023년 오픈 LLM 물결과 공개성의 층위 해설

## 1. 한눈에 보기

- **핵심 주제:** 2023년에는 MPT, Falcon, Llama 2, Mistral 7B 같은 서로 다른 model family가 연이어 공개되면서, API만 쓰는 방식 외에 weight를 내려받아 실행·미세조정·검사하는 경로가 빠르게 늘었다.
- **등장 배경:** 2022년 [[082_BLOOM Open-Access Multilingual Language Model and the Democratization of AI Research.ko|BLOOM]]이 대규모 공개 접근의 선례를 만들고, 2023년 2월 [[089_LLaMA Meta's Open Foundation Models That Democratized Language AI Research.ko|LLaMA 1]]이 경쟁력 있는 작은 base model의 weight-level 연구 접근을 넓혔다.
- **가장 중요한 구분:** `open source`, `open weight`, `open access`, `commercially usable`은 같은 말이 아니다. Model마다 code·weight·training data·license·사용 제한·재현 자료의 공개 범위가 달랐다.
- **기술적으로 볼 것:** Parameter 수만이 아니라 학습 token, data mixture와 filtering, attention 방식, context 조건, KV cache, quantization, hardware와 evaluation protocol을 함께 비교해야 한다.
- **역사적으로 볼 것:** 2023년의 연속 공개는 분명한 배포 지형의 변화였지만, 여러 조직이 하나의 계획 아래 “협력해 해결한” 사건이나 LLaMA에서 모든 후속 model로 이어지는 단일 계보로 단정할 근거는 부족하다.
- **검증의 중심:** MPT·Falcon·Mistral의 base와 instruct/chat variant를 분리하고, release 시점의 model card·license·paper commit을 기준으로 주장과 수치를 확인해야 한다.

> 이 문서는 `090_Open LLM Wave The Proliferation of High-Quality Open-Source Language Models.md`의 번역문을 이해하기 위한 해설이다. 원문의 문제–해결 서사를 그대로 반복하지 않고, 확인된 2023년 배포 사실, 그 사실에서 가능한 해석, 후대에 별도 입증해야 할 영향 평가를 나누어 읽는다.

## 2. 핵심 요약

2023년의 변화는 “처음으로 공개 LLM이 등장했다”는 사건이 아니었다. GPT-J·GPT-NeoX·OPT와 BLOOM 같은 선행 공개가 이미 있었고, BLOOM은 model weight뿐 아니라 국제 협업, ROOTS data governance, training 자원과 책임 있는 license를 함께 문서화했다. 2023년에는 여기에 LLaMA 1, MPT, Falcon, Llama 2, Mistral 7B 등이 더해지며 **서로 다른 크기·구조·license를 가진 선택지의 밀도**가 높아졌다.

원문의 가장 유용한 관찰은 model weight를 직접 보유할 때 API-only system과 다른 연구·배포가 가능하다는 점이다. Local inference, parameter-efficient fine-tuning, quantization, custom evaluation과 내부 activation 분석은 weight 접근이 있어야 가능한 경우가 많다. 그러나 “가능해졌다”와 “누구나 쉽게 수행했다”는 다르다. 7B model도 dtype·context·batch에 따라 상당한 memory가 필요하고, 30B·40B model은 일반적인 단일 consumer GPU를 넘어설 수 있다. Pretraining 비용은 inference나 adapter tuning 비용보다 훨씬 크다.

기술적 변화도 모두 2023년 model이 새로 발명한 것은 아니다. MPT가 채택한 ALiBi는 2021년 연구, Mistral 7B가 사용한 grouped-query attention(GQA)은 2023년 5월 논문, sliding/windowed attention은 그보다 앞선 sparse-attention 계보에 놓인다. 2023년 model의 기여는 이 기법들을 특정 규모·data·kernel·license 조합으로 구현하고 실제 checkpoint로 배포했다는 데 가깝다.

성능 비교는 더욱 조심해야 한다. Mistral 7B 공식 논문은 자신들이 평가한 benchmark에서 Llama 2 13B를 앞섰다고 보고하지만, 이것이 모든 과제·언어·prompt·generation setting에서의 우월성을 뜻하지 않는다. Falcon과 MPT의 발표 당시 leaderboard 순위도 evaluation harness, model revision, prompt formatting과 contamination 가능성에 따라 바뀔 수 있다. “proprietary system과 동급”이라는 문장은 비교 대상 version과 metric을 적지 않으면 검증할 수 없다.

마지막으로 공개성은 model family 전체에 한 번에 부여되는 속성이 아니다. MPT-30B base는 Apache-2.0이지만 공식 model card에서 Instruct와 Chat variant의 license는 각각 다르게 표시됐다. LLaMA 1은 신청·승인 기반의 noncommercial research release였고, Llama 2는 별도 시점·별도 license의 후속 세대다. Falcon의 license도 release history를 고정한 자료로 확인해야 한다. 따라서 2023년을 가장 정확히 요약하는 표현은 **“고품질 공개 가중치 model과 permissive checkpoint가 빠르게 다양해진 해”**이지, 모든 구성요소가 동일한 의미로 open source가 된 해라는 문장이 아니다.

| 원문 표현 | 검증 가능한 형태로 바꾼 설명 |
|---|---|
| “open-source model wave” | Code·weight·data·license를 따로 표시한 공개 가중치 model의 연속 배포 |
| “LLaMA가 wave를 시작했다” | 시간상 중요한 촉매 후보이지만 BLOOM·OPT 등 선행 사례와 각 조직의 독립 개발을 함께 검토해야 하는 역사적 해석 |
| “architectural innovations” | ALiBi·GQA·sliding-window attention 같은 선행 기법을 특정 model에 채택·조합한 사례 |
| “smaller model이 larger proprietary system을 능가했다” | 이름·revision·benchmark·shot·prompt·metric이 명시된 비교에서만 성립하는 조건부 결과 |
| “training data까지 투명했다” | Data source와 mixture를 설명한 경우가 많았지만 exact corpus, 모든 document, filtering code와 재배포 권리까지 공개됐는지는 model별로 다름 |
| “democratized access” | 독립 실행·변형의 문턱을 일부 낮췄다는 해석이며 hardware·전문성·license·data 격차가 사라졌다는 뜻은 아님 |

## 3. 역사적 배경

2023년 공개 model 생태계는 갑자기 생긴 것이 아니라 세 흐름이 겹친 결과로 보는 편이 낫다.

첫째, 2020~2022년 GPT-3와 PaLM은 큰 dense Transformer의 성능을 보여 주었지만 일반 연구자가 weight를 내려받아 독립적으로 조사하는 경로는 제한됐다. 반대편에서는 GPT-Neo·GPT-J·GPT-NeoX, OPT, BLOOM 같은 공개 또는 제한 공개 checkpoint가 등장했다. 특히 BLOOM은 176B 규모를 공개 접근으로 배포하면서 “큰 model의 weight를 공개할 수 있는가”뿐 아니라 누가 data와 license를 결정하는가를 연구 문제로 만들었다.

둘째, Chinchilla와 LLaMA 1은 parameter 수 하나보다 **model–token–inference budget의 배분**이 중요하다는 관점을 강화했다. LLaMA 1의 7B·13B checkpoint는 많은 token 학습으로 parameter footprint에 비해 높은 benchmark 성능을 보였다. 다만 LLaMA 1의 최초 weight 배포는 신청 기반 noncommercial research license였으므로, 이를 곧바로 자유로운 상업용 open-source release로 기억하면 안 된다.

셋째, 2023년에는 inference와 fine-tuning 도구가 checkpoint 공개와 결합했다. Hugging Face Transformers, Accelerate, PEFT, bitsandbytes, llama.cpp, vLLM류의 도구는 서로 다른 시점과 공동체에서 발전했지만, 공개 weight가 많아질수록 quantization·adapter tuning·serving을 시험할 대상도 늘었다. 반대로 model 공개만으로 도구 생태계가 자동으로 생긴 것은 아니며, 어느 project가 어느 도구의 성장을 직접 촉발했는지는 download·commit·citation 같은 별도 자료가 필요하다.

### 2023년의 최소 연표

| 시점 | 확인 가능한 사건 | 과장하지 말아야 할 점 |
|---|---|---|
| 2월 | Meta가 LLaMA 1 paper와 7B–65B 연구용 weight 접근을 발표 | Gated noncommercial release였으며 unrestricted open source가 아님 |
| 5월 | MosaicML이 MPT-7B family를 공개 | Base·Instruct·Chat의 data와 license를 따로 확인해야 함 |
| 5~6월 | TII가 Falcon-7B·40B와 RefinedWeb 관련 자료를 공개 | 현재 model card의 Apache-2.0 표기와 최초 release 당시 license history를 구분해야 함 |
| 6월 | MosaicML이 MPT-30B family를 공개 | Base Apache-2.0을 모든 derivative의 license로 일반화할 수 없음 |
| 7월 | Meta가 Llama 2를 별도 세대로 공개 | LLaMA 1의 배포 조건·model 수치와 섞지 않음 |
| 9월 | Mistral AI가 Mistral 7B base·Instruct를 공개 | Base benchmark와 Instruct/chat benchmark, moderation 유무를 구분함 |
| 12월 | Mistral AI가 Mixtral 8x7B 공개를 발표 | Dense Mistral 7B와 sparse MoE Mixtral의 total/active parameter를 구분함 |

이 연표는 시간 순서를 보여 줄 뿐 직접 인과를 증명하지 않는다. MPT·Falcon·Mistral이 LLaMA weight를 기술적 기반으로 삼았는지, LLaMA 발표 때문에 개발을 시작했는지는 각 조직의 논문·발표·개발 기록으로 따로 입증해야 한다. 같은 시기와 비슷한 설계 선택만으로 직접 계보를 만들지 않는다.

## 4. 핵심 개념 해설

### 4.1 공개성은 여섯 축의 벡터다

“열려 있다”는 말 앞에는 무엇이, 누구에게, 어떤 행위를 허용하는지를 붙여야 한다.

| 축 | 확인할 질문 |
|---|---|
| 논문·보고서 | Architecture, data mixture, optimizer와 evaluation 조건을 재검토할 만큼 자세한가? |
| Code | Training·inference·evaluation code 가운데 무엇이 어느 revision으로 공개됐는가? |
| Weight | Base와 post-trained checkpoint를 누구나 받을 수 있는가, 신청이 필요한가? |
| Data | Dataset 이름만 공개했는가, exact corpus·snapshot·filtering code·hash까지 재현 가능한가? |
| License | Commercial use·modification·redistribution·use restriction·derivative 의무가 무엇인가? |
| Compute·log | Hardware, token 수, failed run과 checkpoint가 공개돼 실제 재현 가능성을 평가할 수 있는가? |

OSI식 software open source, weight 공개, paper 공개와 web에서 접근 가능한 training text는 서로 대체되지 않는다. Apache-2.0처럼 permissive한 license가 weight에 붙어도 training data의 제3자 권리까지 바꾸지는 않는다. 반대로 use restriction이 있는 RAIL류 license는 weight를 받을 수 있어도 전통적인 unrestricted software license와 다른 조건을 둔다. 이 때문에 [[공개 가중치와 재현 가능성은 같은 축인가]]의 핵심 규칙인 “목적어와 동사를 적는다”가 2023년 model 비교에 그대로 적용된다.

### 4.2 ALiBi는 학습된 위치 embedding이 아니다

ALiBi(Attention with Linear Biases)는 token embedding에 position vector를 더하지 않고, query–key attention score에 거리와 비례하는 penalty를 더한다. Head별 slope는 원 논문이 정한 방식으로 설정되며, 원문의 “learned linear biases”라는 표현처럼 일반적인 학습 parameter로 이해하면 안 된다.

MPT는 ALiBi를 채택해 context-length extrapolation을 강조했다. 그러나 base MPT의 training context, 별도 장문 fine-tuning을 거친 StoryWriter variant, 실제로 긴 입력에서 유지되는 task 품질을 분리해야 한다. “길이가 긴 text를 입력할 수 있다”, “먼 token이 계산 graph에 들어온다”, “먼 증거를 정확히 활용한다”는 서로 다른 성질이다. ALiBi의 원 논문이 보고한 1,024→2,048 extrapolation과 MPT variant의 수만 token demonstration도 같은 실험이 아니다.

### 4.3 GQA와 sliding-window attention은 다른 비용을 줄인다

Grouped-query attention(GQA)은 여러 query head가 더 적은 수의 key/value head를 공유한다. Autoregressive generation에서 KV cache의 크기와 memory bandwidth 부담을 줄이는 것이 주된 목적이다. Query head 수를 줄이는 방식이 아니며, 모든 attention 계산을 선형으로 만드는 것도 아니다.

Sliding-window attention(SWA)은 각 token이 가까운 과거의 고정 window 안에서만 직접 attention하도록 제한한다. Window 크기를 $W$, sequence 길이를 $N$이라 하면 한 layer의 attention 비용은 dense $O(N^2)$보다 $O(NW)$에 가까워진다. Layer가 쌓이면 정보의 이론적 receptive field가 넓어질 수 있지만, 모든 과거 token과 한 layer에서 직접 비교하는 global attention과 같지는 않다.

Mistral 7B는 GQA와 4,096-token sliding window를 결합했다. 공식 발표는 8,192-token inference에서 rotating buffer가 KV cache memory를 줄인 사례와 16K sequence에서 특정 kernel의 속도 측정을 제시한다. 이것을 곧바로 “32K 이상에서 모든 장문 과제를 정확히 해결한다”로 바꾸면 안 된다. Context capacity, kernel benchmark와 long-context task quality는 별도로 평가해야 한다.

### 4.4 Data curation은 quantity의 반대말이 아니다

Falcon의 RefinedWeb 연구는 Common Crawl을 filtering·deduplication해 web data만으로도 강한 model을 만들 수 있는지 조사했다. 논문은 5T token을 얻었고 그중 600B-token extract와 1.3B·7.5B 실험 model을 공개했다고 보고한다. Falcon-40B model card는 curated corpora로 보강한 RefinedWeb 1T token 학습을 적는다.

따라서 “Falcon은 quality를 선택해 quantity를 포기했다”는 구도는 부정확하다. 이 연구는 **아주 큰 raw web pool을 적극적으로 정제하면서도 대규모 token을 유지한 사례**다. 또한 filtering pipeline이 만든 품질은 benchmark 결과로 간접 평가된 operational definition이지, 모든 domain의 사실성·대표성·저작권·안전성을 보장하는 단일 품질 점수가 아니다.

MPT data에 대해서도 model family 전체를 하나로 묶지 않는다. MPT-7B와 MPT-30B base, Instruct, Chat은 pretraining·fine-tuning dataset과 license가 다를 수 있다. 원문의 “code, mathematical text, web content를 세심하게 구성했다”는 문장은 각 model card의 dataset 목록과 sampling ratio로 확인하기 전에는 일반론으로 남겨야 한다.

### 4.5 Model family와 benchmark row를 맞춘다

Base model은 next-token prediction checkpoint이고, Instruct·Chat model은 별도 data와 objective를 거친 post-trained variant다. Base의 perplexity·zero-shot score와 Chat variant의 MT-Bench·human preference를 같은 row에 놓으면 무엇이 성능을 만든 것인지 알 수 없다.

비교할 때 최소한 다음 항목을 맞춘다.

1. 정확한 repository와 revision
2. Base·Instruct·Chat 중 어느 checkpoint인지
3. Parameter 수와 dense/MoE 여부
4. Context length, dtype와 quantization
5. Benchmark dataset·split·shot 수·prompt template
6. Generation parameter와 scoring rule
7. Evaluation harness version과 contamination 점검

Mistral 7B paper의 “Llama 2 13B보다 모든 evaluated benchmark에서 높다”는 주장은 위 조건을 붙인 공식 paper의 실험 결과다. 여기서 `evaluated`를 지우고 “더 큰 proprietary model보다 전반적으로 우월하다”로 확장하면 비교 대상과 범위를 잃는다. Parameter efficiency의 좋은 사례와 범용 system superiority는 같은 주장이 아니다.

## 5. 원문의 논리 구조

원문은 대략 다음 흐름으로 전개된다.

1. 2023년을 proprietary API 중심 지형이 open-source model 생태계로 전환된 해로 규정한다.
2. API 비용·rate limit·black-box·lock-in·privacy·customization을 핵심 문제로 제시한다.
3. LLaMA 이후 MPT·Falcon·Mistral이 “coordinated effort”로 경쟁 가능한 대안을 만들었다고 설명한다.
4. ALiBi·GQA·sliding-window attention과 data curation을 작은 model의 효율을 만든 혁신으로 묶는다.
5. Local deployment, privacy, 비용 절감, fine-tuning, safety 연구와 tooling 성장을 영향으로 제시한다.
6. 성능 격차·compute·safety·license·빠른 변화의 부담을 한계로 인정한다.
7. 이 물결이 open model을 현대 AI 생태계의 영구적 축으로 만들었다고 후대 평가한다.

이 구조는 독자가 2023년의 여러 사건을 한눈에 파악하게 해 주지만, **문제–해결 서사가 서로 다른 증거 수준을 평평하게 만든다.** Model release date와 license는 문서로 확인할 수 있는 사실이다. “경쟁이 innovation을 가속했다”는 인과 해석에는 release cadence, code contribution, citation과 developer adoption 자료가 더 필요하다. “Healthcare·finance·government에서 privacy deployment가 가능해졌다”는 기술적 가능성은 실제 조직의 도입·효과와 다르다. “정책 논의에 영향을 주었다”는 후대 평가는 구체적인 policy text와 인용 관계가 있어야 한다.

또한 여러 조직의 공개를 “coordinated effort”라고 부르는 것은 공동 조직·계획의 근거가 없으면 피해야 한다. 더 안전한 서술은 **동시기 여러 조직이 서로 다른 목표와 license로 독립적인 checkpoint를 연이어 공개했고, 그 결과 사용자가 비교할 선택지가 늘었다**는 것이다.

원문의 hyperlink에도 검수가 필요하다. `MPT` 링크가 언어 model이 아니라 Modern Portfolio Theory 페이지로 연결되는 등 표면적으로 확인 가능한 routing 오류가 있다. History note는 내용뿐 아니라 링크 target도 근거 경로이므로, 공개 전 모든 외부 링크의 실제 제목·domain·redirect를 점검해야 한다.

## 6. 왜 중요한가

2023년의 가장 확실한 변화는 최고 성능의 단일 우승자가 등장한 것이 아니라 **비교 가능한 artifact가 늘었다**는 점이다. 사용자는 API provider가 허용한 prompt와 output만 보는 대신 weight를 고정하고 동일한 evaluation을 반복하거나, quantization·adapter·kernel을 바꿔 비용–품질 trade-off를 직접 측정할 수 있었다. 이 변화는 model 연구와 systems 연구를 연결했다.

특히 중요한 점은 다음과 같다.

- **배포 선택지의 다원화:** Apache-2.0 base checkpoint, use restriction이 있는 model, gated research weight 등 서로 다른 정책을 실제 사례로 비교할 수 있게 됐다.
- **효율 장부의 세분화:** Parameter 수 외에 training token, KV cache, context algorithm, memory bandwidth, quantization과 serving throughput이 중요한 비교 축으로 떠올랐다.
- **Base와 post-training의 분리:** 같은 base에서 instruct·chat variant가 빠르게 만들어지면서 pretraining capability, instruction following과 safety alignment가 서로 다른 단계라는 사실이 눈에 보이게 됐다.
- **독립 평가의 확대:** 동일 checkpoint를 여러 evaluator가 실행할 수 있어 provider가 선택한 benchmark 밖의 언어·편향·domain 평가가 가능해졌다.
- **공개 정책 자체의 연구 대상화:** BLOOM, LLaMA 1, MPT, Falcon, Mistral은 “무엇을 공개했는가”가 model architecture만큼 중요한 비교 대상임을 보여 주었다.

이 중요성을 “민주화가 완료됐다”는 문장으로 축약하지 않는다. Weight download 가능성은 access의 한 층일 뿐이다. Pretraining cluster, 고품질 data, legal review, safety expertise, inference hardware와 운영 인력의 격차는 남는다. 오히려 2023년은 공개성의 이점과 자원 집중이 **동시에 존재할 수 있음**을 더 선명하게 만든 시기다.

## 7. 현대 LLM과의 연결

### 7.1 Local model stack은 여러 층의 결합이다

오늘날 local deployment는 checkpoint 하나가 아니라 tokenizer, inference runtime, quantization format, kernel, hardware driver와 serving API가 함께 맞아야 한다. 2023년 공개 weight 증가는 이 stack을 시험할 공통 대상을 제공했다. 하지만 특정 model release가 llama.cpp·vLLM·PEFT 같은 각 project를 “만들었다”고 쓰려면 별도의 project history가 필요하다.

### 7.2 Quantization은 공개성을 hardware 접근으로 번역한다

FP16 기준 7B weight만 약 14GB이고 KV cache와 activation·runtime overhead가 더해진다. 4-bit quantization은 weight memory를 크게 줄일 수 있지만 품질, kernel 지원과 throughput trade-off가 생긴다. 따라서 “consumer hardware에서 실행”이라는 표현에는 model revision, bit-width, context, batch, GPU/CPU와 token/s를 붙여야 한다.

### 7.3 GQA·SWA·FlashAttention은 서로 다른 병목을 겨냥한다

GQA는 KV head 수와 cache 부담, SWA는 직접 attention 범위, [[088_FlashAttention IO-Aware Exact Attention for Long-Context Language Models.ko|FlashAttention]]은 같은 dense attention을 실행할 때 HBM 이동과 중간 저장을 줄인다. 셋을 “attention을 효율화한다”는 한 문장으로 묶을 수는 있지만, 계산 복잡도·memory capacity·bandwidth·long-range information path가 서로 다르다.

### 7.4 공개 weight와 reproducibility는 다른 축이다

Weight가 있으면 output 재실행과 fine-tuning은 쉬워질 수 있다. 그러나 exact pretraining reproduction에는 corpus snapshot, order, tokenizer, optimizer, schedule, distributed code, random seed, hardware와 failed-run 기록이 필요하다. [[공개 가중치와 재현 가능성은 같은 축인가]]가 다루는 핵심은 바로 이 비대칭이다.

### 7.5 Base model과 assistant system을 구분한다

MPT·Falcon·Mistral의 base checkpoint는 그대로는 human-facing assistant가 아니다. Instruct/chat variant도 training data와 safety mechanism이 서로 다르다. Mistral 7B 발표는 Instruct demo에 moderation mechanism이 없다고 직접 경고했다. 현대적인 assistant 품질은 base pretraining뿐 아니라 SFT, preference optimization, system prompt, retrieval, moderation과 tool layer의 합성 결과다.

### 7.6 Mixtral은 같은 wave 안의 다른 scaling 축이다

2023년 말 Mixtral 8x7B는 dense Mistral 7B와 달리 sparse mixture-of-experts를 사용했다. Total parameter와 token당 active parameter를 나누는 이 구조는 “작은 dense model의 효율”과 다른 scaling 경로다. [[103_Mixture of Experts at Scale Efficient Scaling Through Sparse Activation and Dynamic Routing.ko|희소 MoE 확장]]과 연결하면 open-weight wave 안에서도 parameter·compute 장부가 하나가 아니었음을 볼 수 있다.

## 8. 한계와 비판적 관점

### 8.1 1차 근거로 확인할 model별 쟁점

| 대상 | 우선 확인할 1차 자료 | 확인할 주장 |
|---|---|---|
| BLOOM | [BLOOM paper](https://arxiv.org/abs/2211.05100), official model card, BigScience RAIL license | 176B/176.2B 표기, ROOTS와 실제 training token, code·weight·data별 공개 범위, use restriction, 언어별 평가 |
| LLaMA 1 | [LLaMA paper](https://arxiv.org/abs/2302.13971), [Meta 2023-02-24 발표](https://ai.meta.com/blog/large-language-model-llama-meta-ai/) | 7B–65B와 1.0T/1.4T token, gated noncommercial release, base와 LLaMA-I, single-V100 inference의 조건 |
| MPT-7B | [MosaicML official model card](https://huggingface.co/mosaicml/mpt-7b)와 release-date revision | 1T token mixture, base/StoryWriter/Instruct/Chat별 data·context·license, ALiBi extrapolation과 hardware demonstration |
| MPT-30B | [MPT-30B official model card](https://huggingface.co/mosaicml/mpt-30b)와 2023-06-22 revision | Base Apache-2.0, Instruct CC-BY-SA-3.0, Chat CC-BY-NC-SA-4.0 표기의 역사적 revision, 8K context와 benchmark 조건 |
| Falcon | [Falcon-40B official model card](https://huggingface.co/tiiuae/falcon-40b), [RefinedWeb paper](https://arxiv.org/abs/2306.01116), release-date license commit | 1T training token, RefinedWeb+curated corpora, 600B dataset extract와 전체 5T pool 구분, MQA/FlashAttention, 최초 license에서 Apache-2.0으로의 변경 시점 |
| Mistral 7B | [official paper](https://arxiv.org/abs/2310.06825), [2023-09-27 발표](https://mistral.ai/news/announcing-mistral-7b) | 7.3B, GQA·4,096 SWA, rotating buffer, evaluated benchmark 범위, base와 Instruct, Apache-2.0, moderation 부재 |

Model card와 repository `main`은 수정될 수 있다. 2023년 당시 상태를 말할 때는 current page만 보지 말고 tag·commit hash·release announcement를 고정해야 한다. 특히 license history는 현재 badge 하나로 과거 전체를 덮어쓰면 안 된다.

### 8.2 원문의 주요 오해 바로잡기

| 원문의 주장 또는 암시 | 비판적 판정 |
|---|---|
| 2023년 전에는 field가 closed proprietary system에 지배됐고 open ecosystem이 없었다 | GPT-J·GPT-NeoX·OPT·BLOOM 등 선행 공개가 있었으므로 “선택지가 급증했다”가 더 정확하다. |
| LLaMA가 competitive model을 openly release했다 | 성능 paper와 연구 접근 확대는 맞지만 최초 weight는 gated noncommercial이었다. |
| 여러 조직이 coordinated effort로 문제를 해결했다 | 공동 계획의 1차 근거가 없으면 병렬적·연속적 release로 써야 한다. |
| MPT link가 해당 language model을 가리킨다 | 원문의 URL은 Modern Portfolio Theory로 연결되는 명백한 routing 오류다. |
| ALiBi는 learned linear bias다 | 원 방법은 거리에 비례하는 head별 bias를 attention score에 적용하며 일반적인 학습 position embedding이 아니다. |
| MPT family는 모두 Apache-2.0으로 unrestricted commercial use가 가능했다 | Base와 파생 variant의 license가 다르므로 checkpoint별 확인이 필요하다. |
| Falcon은 data quality를 위해 quantity를 줄였다 | 5T web pool·1T model training처럼 규모도 컸다. Filtering 효과와 quantity 감소는 같은 주장이 아니다. |
| Mistral 7B가 much larger proprietary system을 능가했다 | 공식 비교는 특정 open model과 evaluated benchmark 중심이다. Proprietary system과의 범용 우위로 넓힐 수 없다. |
| Mistral SWA가 32K 이상 global context를 보장했다 | Window·stacked receptive field·cache capacity와 실제 long-context retrieval 품질을 분리해야 한다. |
| Open model은 full weight, training procedure와 흔히 training data까지 제공했다 | 공개 범위가 model마다 다르고 exact data·order·logs가 없는 경우가 많다. |
| BLOOM은 state of the art보다 뒤처져 실용성이 낮았다 | 과제·언어·shot·hardware별 결과가 다르며 176B 배포 비용과 model quality는 별도 축이다. |
| 공개 model이 healthcare·finance·government privacy deployment를 가능하게 했다 | On-premise 가능성은 합리적이지만 실제 도입·안전·규제 준수 성과에는 사례별 근거가 필요하다. |
| Open wave가 innovation·policy·안전 연구를 가속했다 | 설득력 있는 후대 해석이나, 인과 크기를 말하려면 citation·commit·adoption·policy 자료가 필요하다. |

### 8.3 성능 격차를 하나의 순위로 만들 수 없다

Open LLM leaderboard는 공통 harness의 장점이 있지만 model 제출자 선택, benchmark overfitting, contamination과 prompt sensitivity에 취약할 수 있다. Proprietary API는 silent version update 때문에 재현이 어렵고, 공개 checkpoint도 tokenizer·generation code·quantization이 달라지면 결과가 변한다. “Open이 proprietary를 따라잡았다”는 문장은 적어도 model version, date, benchmark와 confidence interval을 요구한다.

### 8.4 공개와 안전의 긴장은 단순한 찬반이 아니다

Weight 공개는 bias·memorization·mechanistic behavior를 독립적으로 연구하게 한다. 동시에 provider-side moderation을 우회한 배포도 가능하게 한다. 어느 효과가 더 큰지는 threat model, model capability, access 조건, monitoring과 downstream safeguards에 따라 달라진다. “Open은 안전하다”와 “Open은 위험하다” 모두 증거 없이 일반화하면 안 된다.

### 8.5 법률·data 권리는 model license만으로 끝나지 않는다

Apache-2.0 badge는 weight와 code에 적용된 grant를 설명할 수 있지만 training corpus의 저작권, 개인정보, database right와 generated output의 권리를 자동 해결하지 않는다. Fine-tuned model은 base license뿐 아니라 instruction dataset의 terms도 영향을 받을 수 있다. 상업 사용 가능성을 적을 때는 “법적 위험이 없다”가 아니라 “해당 artifact의 명시된 license가 commercial use를 금지하지 않는다” 정도로 한정한다.

### 8.6 ‘민주화’는 측정 지표가 필요하다

Download 수, fine-tune 수, 학계·지역별 사용자 분포, 필요한 GPU-hour, language coverage, accessibility와 조직 집중도를 측정하지 않으면 민주화는 가치 평가에 머문다. 2023년 공개 weight가 실험 문턱을 낮춘 것은 충분히 설명할 수 있지만, 혜택이 누구에게 얼마나 분배됐는지는 별도 연구 질문이다.

## 9. 용어 정리

| 용어 | 설명 |
|---|---|
| Open source | 통상 source를 사용·수정·재배포할 권리를 license로 보장하는 범주. Weight 공개와 자동으로 같지 않다. |
| Open weight | Model parameter를 내려받아 직접 실행할 수 있는 공개. Code·data·상업 사용 권리까지 뜻하지 않는다. |
| Open access | 접근 문턱을 낮춘 넓은 표현. 신청·용도 제한이 있는 공개도 포함할 수 있어 조건을 함께 적어야 한다. |
| Permissive license | Apache-2.0처럼 비교적 넓은 사용·수정·재배포를 허용하는 license. 제3자 data 권리를 대신하지 않는다. |
| Gated release | 신청·심사·승인을 거친 사람이나 조직에만 artifact 접근을 주는 방식 |
| Base model | 대규모 next-token pretraining을 마친 checkpoint. 일반적으로 assistant용 instruction·safety tuning 전 단계다. |
| Instruct/Chat model | Instruction data, preference data나 대화 data로 post-training한 variant. Base와 별도 평가·license가 필요하다. |
| ALiBi | Attention score에 token 거리와 비례하는 선형 penalty를 더하는 position 방법 |
| GQA | 여러 query head가 더 적은 수의 key/value head를 공유해 decoder inference의 KV cache 부담을 줄이는 attention |
| Sliding-window attention | 각 token이 고정된 주변 window에 직접 attention하도록 제한해 길이에 따른 계산을 줄이는 sparse attention |
| RefinedWeb | Common Crawl을 filtering·deduplication해 만든 TII의 web corpus와 그 공개 extract에 쓰인 이름 |
| Evaluation harness | 여러 model을 같은 dataset·prompt·scoring code로 평가하려는 실행 framework |
| Context capacity | 구현이 받아들일 수 있는 token 길이. 먼 정보를 실제로 활용하는 effective context와 다를 수 있다. |
| Democratization | 접근과 참여의 분포가 넓어졌다는 규범적·경험적 주장. 측정 대상과 지표를 명시해야 한다. |

## 10. 함께 보면 좋은 항목

- [[082_BLOOM Open-Access Multilingual Language Model and the Democratization of AI Research.ko|BLOOM과 공개 접근 다국어 LLM]] — 2023년 이전의 대규모 공개 weight, ROOTS data governance와 RAIL license를 비교한다.
- [[089_LLaMA Meta's Open Foundation Models That Democratized Language AI Research.ko|LLaMA 1의 공개 연구 접근]] — 2023년 2월 gated noncommercial release와 inference-oriented 장기 학습을 분리해 본다.
- [[공개 가중치와 재현 가능성은 같은 축인가]] — 논문·code·weight·data·license·compute 공개를 여섯 축으로 비교한다.
- [[078_Chinchilla Scaling Laws Compute-Optimal Training and Resource Allocation for Large Language Models.ko|Chinchilla scaling law]] — 작은 model을 더 많은 token으로 학습한다는 설명의 training-compute 조건을 확인한다.
- [[088_FlashAttention IO-Aware Exact Attention for Long-Context Language Models.ko|FlashAttention]] — GQA·SWA와 다른 HBM I/O 최적화 축을 이해한다.
- [[103_Mixture of Experts at Scale Efficient Scaling Through Sparse Activation and Dynamic Routing.ko|희소 MoE 확장]] — 2023년 말 Mixtral에서 total parameter와 active compute가 갈라지는 경로를 본다.
- [[055_The Transformer Attention Is All You Need.ko|Transformer]] — MPT·Falcon·Mistral이 공유하는 기본 operator와 각 변형의 위치를 확인한다.

## 11. 읽고 생각해볼 질문

1. Weight를 누구나 내려받을 수 있지만 exact training data와 log가 없다면, 어떤 실험은 재현할 수 있고 어떤 실험은 재현할 수 없는가?
2. Apache-2.0 base model에서 noncommercial data로 Chat variant를 만들었다면 “family가 상업 사용 가능하다”는 문장은 왜 부정확한가?
3. ALiBi·GQA·SWA·FlashAttention은 각각 position, KV cache, attention sparsity, HBM I/O 가운데 어느 병목을 바꾸는가?
4. Mistral 7B가 특정 benchmark에서 Llama 2 13B를 앞선 사실로부터 어떤 결론까지는 말할 수 있고, 어떤 결론부터는 추가 평가가 필요한가?
5. 공개 weight가 local privacy를 가능하게 한다는 기술적 사실과 healthcare 현장에서 안전하게 도입됐다는 경험적 주장은 어떤 근거가 서로 다른가?
6. 2023년 open model release가 tooling 혁신을 “가속했다”는 인과를 검증하려면 어떤 timeline·commit·download·citation 자료가 필요한가?
7. Model 공개의 혜택이 실제로 넓게 분배됐는지 측정하려면 parameter 수나 download 수 외에 어떤 지표가 필요한가?

## 12. 짧은 결론

2023년 오픈 LLM 물결의 핵심은 모든 model이 완전한 open source가 됐다는 데 있지 않다. BLOOM이 앞서 제기한 협업·data governance·책임 있는 공개의 질문 위에 LLaMA 1의 제한적 weight access, MPT와 Falcon의 서로 다른 model·license 조합, Mistral 7B의 permissive base release와 효율 설계가 연이어 놓이면서 사용자가 비교할 artifact와 배포 경로가 크게 늘었다. ALiBi·GQA·sliding-window attention은 대부분 선행 아이디어였고, 2023년의 기여는 이를 data·kernel·checkpoint·license와 결합해 실제 선택지로 만든 데 있다. 성능, 공개성, 재현 가능성, local 실행 비용과 safety는 각각 다른 축이다. 이 축을 model revision별로 분리하고, 확인된 release 사실과 생태계 영향에 대한 후대 해석을 구분할 때 2023년은 과장 없이도 중요한 전환점으로 남는다.
