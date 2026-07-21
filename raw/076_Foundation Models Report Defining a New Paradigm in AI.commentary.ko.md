---
source_file: "075_Foundation Models Report Defining a New Paradigm in AI.md"
translation_file: "075_Foundation Models Report Defining a New Paradigm in AI.ko.md"
commentary_type: "해설"
source_stem: "075_Foundation Models Report Defining a New Paradigm in AI"
order_prefix: "075"
topic: "파운데이션 모델 보고서와 AI 시스템의 기반 계층"
period: "2021–2025"
tags:
  - foundation-models
  - AI-governance
  - AI-history
  - commentary
---

# 파운데이션 모델 보고서와 AI 시스템의 기반 계층 해설

## 1. 한눈에 보기

- 핵심 주제: 광범위한 데이터로 대규모 훈련한 뒤 여러 하위 과제에 적응시키는 모델을 ‘파운데이션 모델’이라는 하나의 연구 대상으로 묶은 2021년 Stanford 보고서
- 등장 배경: BERT·GPT-3·CLIP처럼 하나의 사전 학습 모델을 여러 응용의 출발점으로 재사용하는 흐름이 NLP를 넘어 확산되던 시기
- 가장 중요한 아이디어: 개별 모델의 크기보다 **한 모델의 성질과 결함이 여러 적응 모델·응용으로 전파되는 기반 구조**를 함께 분석해야 한다는 것
- 반드시 기억할 제한: 보고서는 새 모델의 성능을 입증한 실험 논문이 아니라, 막 형성되던 패러다임을 정의하고 연구 질문을 조직한 2021년의 학제적 보고서다. 2025년 회고 글의 후대 영향 평가는 보고서 자체의 결과가 아니다.

> 이 문서는 2025년에 발행된 회고 글 `075_Foundation Models Report Defining a New Paradigm in AI.md`의 번역문을 이해하기 위한 해설입니다. 번역문은 원문의 주장과 시간 혼합을 보존하지만, 해설은 이를 Bommasani 등 2021년 보고서가 직접 말한 내용, 당시의 전망, 2025년 저자의 후대 평가로 나누어 읽습니다.

## 2. 핵심 요약

Rishi Bommasani 등은 2021년 8월 *On the Opportunities and Risks of Foundation Models*를 공개했다. 보고서가 말하는 파운데이션 모델은 대체로 자기지도 학습을 이용해 광범위한 데이터로 대규모 훈련되고, 미세조정 같은 적응을 거쳐 다양한 하위 과제에 쓰일 수 있는 모델이다. ‘foundation’은 모델이 여러 응용의 기반이 된다는 중심성과, 그 자체만으로 완성된 사용자 시스템은 아니라는 불완전성을 함께 강조한다.

보고서의 역사적 기여는 Transformer나 사전 학습을 발명한 데 있지 않다. 저자들도 기반 기술은 기존의 심층 신경망·자기지도 학습·전이 학습이라고 명시했다. 새 용어는 BERT·GPT-3·CLIP 등 서로 다른 모델을 **훈련 단계와 적응 단계가 분리되고, 하나의 기반이 많은 응용에 재사용되는 사회기술적 생태계**라는 관점에서 함께 조사하기 위해 제안됐다.

이 관점을 요약하는 두 단어가 ‘창발(emergence)’과 ‘동질화(homogenization)’다. 창발은 행동이 사람이 과제별 규칙으로 직접 설계한 것이 아니라 학습 과정에서 암묵적으로 형성돼 예상하기 어렵다는 뜻이다. 동질화는 여러 응용이 소수의 공통 모델·방법에 의존하는 현상이다. 재사용은 개선 비용을 나눌 강한 지렛대가 되지만, 기반 모델의 결함과 권력 집중도 많은 하위 시스템으로 퍼뜨릴 수 있다.

따라서 원문의 다음 확대는 그대로 받아들이지 않는다.

- ‘다양한 과제에 적응 가능’은 모든 모델이 프롬프트만으로 강한 퓨샷 성능을 낸다는 뜻이 아니다.
- ‘광범위한 데이터’는 반드시 여러 언어·영역·양식을 모두 포함한다는 뜻이 아니다.
- 보고서의 능력·응용 장은 이미 입증된 보편적 능력 목록이 아니라 당시 증거와 향후 연구 문제를 함께 정리한 것이다.
- 접근 장벽을 낮출 가능성과 개발 권력의 집중은 함께 제시됐다. 보고서가 AI 접근의 민주화를 달성했다고 측정한 것은 아니다.
- GPT-4는 2023년에 공개됐으므로 2021년 보고서의 사례가 될 수 없다. 번역문에 등장하는 GPT-4는 2025년 회고 저자가 정의를 소급 적용한 사례다.
- 연구 투자·정렬 연구·규제 틀에 보고서가 직접 인과적으로 영향을 주었다는 문장에는 별도의 후대 자료가 필요하다.

## 3. 역사적 배경

파운데이션 모델 이전에도 한 과제에서 학습한 표현을 다른 과제에 옮기는 전이 학습, 표지 없이 입력 자체에서 학습 신호를 만드는 자기지도 학습, 대규모 말뭉치로 사전 학습한 언어 모델은 존재했다. ELMo는 고정된 문맥 표현을 특징으로 제공했고, GPT-1과 BERT는 사전 학습 모델 전체를 하위 과제에 미세조정했다. GPT-2는 과제를 자연어 조건으로 표현하는 방향을 밀었으며, T5는 여러 NLP 과제를 text-to-text 형식으로 통합했다. GPT-3는 가중치를 바꾸지 않고 prompt의 지시와 예시로 여러 과제를 평가했다.

2021년의 변화는 한 가지 새 알고리즘보다 규모와 재사용 범위에 있었다. 같은 계열의 모델이 언어·이미지·코드 등에서 많은 응용의 공통 출발점이 되면서, 개별 benchmark score만으로는 설명하기 어려운 문제가 생겼다. 어떤 데이터와 계산 자원이 기반을 만드는가, 누가 기반을 소유하는가, 결함을 어느 계층에서 고쳐야 하는가, 하위 응용의 위해에 누가 책임지는가 같은 질문이다.

Stanford Human-Centered AI 산하의 연구진은 2021년 8월 16일 arXiv에 보고서 초판을 제출했고, 같은 달 23–24일 Foundation Models Workshop을 열었다. Percy Liang과 Rishi Bommasani가 공동 주도한 114명 저자의 보고서는 한 연구실의 단일 실험보다 훨씬 넓은 공동 작업이었다. 26개 절에서 언어·비전·로보틱스·추론·인간 상호작용, 의료·법·교육, 모델 구조·학습·데이터·시스템·보안·평가·이론·해석 가능성, 불평등·오용·환경·법·경제·규모의 윤리를 한 틀에 넣었다.

중요한 시간 경계가 있다. 원문은 2025년 7월 29일에 공개된 후대 회고다. “오늘날 표준 어휘가 됐다”, “정책과 연구 의제에 깊은 영향을 주었다”, GPT-4도 정의에 속한다는 말은 2021년 문서의 동시대 기록이 아니다. 2021년 보고서는 오히려 패러다임이 이제 막 시작됐고, 모델의 작동·실패·능력에 대한 이해가 부족하다고 강조했다.

## 4. 핵심 개념 해설

### 4.1 파운데이션 모델은 크기 이름이 아니라 역할 이름이다

파운데이션 모델은 대규모 언어 모델과 동의어가 아니다. 대규모 언어 모델은 주로 텍스트 자료·언어 모델링 목적·규모를 강조한다. 파운데이션 모델은 어떤 모델이 여러 하위 응용의 기반으로 적응·재사용되는 **기능과 위치**를 강조한다. 그러므로 언어 모델이 아닌 image·speech·protein·robotics model도 조건을 만족하면 포함될 수 있고, 모든 큰 모델이 자동으로 여러 응용의 기반이 되는 것도 아니다. 원문의 따옴표 속 정의는 보고서 문구를 줄인 요약이므로, 정확한 직접 인용처럼 취급하지 않는다.

또한 ‘foundation’은 ‘AI의 근본 원리’를 뜻하는 ‘foundational’과 다르다. 연구진은 파운데이션 모델 하나가 전체 AI 시스템이 아니며, 사용자에게 보이는 결과는 적응 데이터·하위 모델·검색기·도구·인터페이스·운영 정책과 함께 만들어진다고 설명했다. 기반 모델의 score와 완성된 제품의 성능을 동일시하지 않는다.

### 4.2 훈련과 적응을 두 계층으로 본다

파운데이션 모델 체제에는 적어도 두 단계가 있다.

1. **훈련:** 광범위한 원자료와 큰 계산 예산으로 일반적으로 재사용 가능한 model을 만든다.
2. **적응:** 특정 과제·영역·사용 조건에 맞게 fine-tuning, prompting 또는 다른 기법을 적용한다.

원문은 이를 “과제별 훈련이 거의 없어도 좋은 성능”으로 좁혀 반복하지만, 원 보고서의 정의는 적응 비용이나 방식 하나를 고정하지 않는다. BERT처럼 전체 미세조정을 쓰는 model도, GPT-3처럼 prompt로 평가한 model도 포함될 수 있다. 핵심은 사전 훈련 결과가 여러 하위 과제로 이전된다는 관계다.

이 분리는 이론과 책임에도 문제를 만든다. 훈련 data distribution과 실제 적응 task distribution이 다를 수 있고, 기반 모델 제공자와 응용 개발자도 다를 수 있다. 한 응용의 실패를 기반 모델 하나의 속성으로만 돌리거나, 반대로 기반 계층의 공통 결함을 하위 개발자 문제로만 돌리면 원인을 놓친다.

### 4.3 창발은 ‘갑작스러운 능력’만을 뜻하지 않는다

보고서의 창발은 system behavior가 과제별로 명시적으로 구성되지 않고 학습 data·objective·scale에서 암묵적으로 유도된다는 넓은 뜻이다. 흥미로운 능력뿐 아니라 예상하지 못한 실패와 오용 가능성도 포함한다. 2022년 이후 일부 연구가 사용한 ‘작은 model에는 없다가 큰 model에서 불연속적으로 나타나는 benchmark ability’라는 더 좁은 정의를 2021년 보고서에 그대로 소급하면 안 된다.

원문은 대규모 model이 “명시적으로 훈련받지 않은 능력”을 드러내고 “복잡한 추론”을 한다고 강하게 서술한다. 그러나 어느 model·task·metric·prompt·scale에서 어떤 행동을 관찰했는지를 고정하지 않으면 검증 가능한 창발 주장이 되지 않는다. 보고서가 강조한 핵심도 바로 모델이 무엇을 할 수 있고 언제 실패하는지 아직 명확히 이해하지 못한다는 점이다.

### 4.4 동질화는 재사용의 이익과 단일 실패점을 함께 만든다

동질화는 같은 architecture·training recipe·pretrained model이 많은 응용에 반복 사용되는 현상이다. 좋은 점은 기반 모델의 robustness나 efficiency를 한 번 개선해 여러 응용이 그 이익을 공유할 수 있다는 것이다. 나쁜 점은 bias·security vulnerability·data omission 같은 결함도 여러 적응 model에 상속될 수 있다는 것이다.

여기서 ‘민주화’는 자동 결과가 아니다. 이미 훈련된 model을 적응시키는 비용은 처음부터 훈련하는 것보다 낮을 수 있지만, model access·API price·license·hardware·expertise·data governance가 새로운 문턱이 된다. 기반을 만들 수 있는 조직이 소수라면 하위 참여가 늘어도 핵심 설계 권력은 더 집중될 수 있다. 보고서는 이 양면성을 기회와 위험으로 함께 제시했다.

### 4.5 모델, 적응 모델, 응용을 구분한다

보고서는 파운데이션 모델을 사용자에게 직접 영향을 주는 완성품보다 ‘중간 자산(intermediary asset)’으로 본다. 같은 기반에서 나온 여러 적응 모델은 공통 표현이나 결함을 공유할 수 있지만, 실제 harm은 domain·사용자·decision context에 따라 달라진다.

예를 들어 기반 language model의 stereotype은 intrinsic bias를 조사할 단서가 될 수 있다. 그러나 채용·교육·의료 응용에서 누구에게 어떤 손해가 생겼는지는 별도의 extrinsic harm 평가가 필요하다. 기반 모델 benchmark, 적응 task 성능, 실제 deployment outcome을 한 수치로 합치지 않는 것이 이 틀의 실용적 의미다.

## 5. 원문의 논리 구조

원문은 다음 순서로 주장을 확장한다.

1. GPT-3·BERT·비전 Transformer의 등장을 공통 틀이 필요해진 배경으로 제시한다.
2. 용어와 정책 언어의 분절을 문제로 설정한다.
3. ‘광범위한 데이터로 대규모 훈련되고 여러 과제에 적응’이라는 정의를 소개한다.
4. 기술·사회·윤리의 다차원 분석 틀을 요약한다.
5. 퓨샷 학습·지식·새 응용·접근 확대를 기회로 열거한다.
6. 편향·불투명성·권력 집중·오용·환경 비용을 위험으로 열거한다.
7. 연구 투자와 방법론, 정책·거버넌스, 공적 담론에 미친 후대 영향으로 범위를 넓힌다.
8. 정의의 넓음·새 위험·대안 연구 위축·일반적인 정책 권고를 한계로 제시한다.
9. 보고서를 최근 AI 역사에서 가장 영향력 있는 문서 중 하나로 평가한다.

1–4번은 2021년 보고서의 문제 설정과 직접 대응한다. 다만 원 보고서의 실제 큰 구조는 **Capabilities → Applications → Technology → Society**이며, 원문의 ‘기술·사회·윤리’ 3분류는 후대 저자의 재구성이다. 5–6번은 원 보고서가 다룬 범위와 겹치지만, ‘가능성·우려·연구 질문’을 ‘이미 달성한 성능·결과’로 바꾸는 문장이 섞여 있다. 7번과 9번은 2025년 저자의 영향 평가이며, 영향 경로를 입증하려면 citation·정책 문서·투자 기록 같은 별도 evidence가 필요하다.

특히 원문이 보고서의 각 장을 한 model family의 보편 성질처럼 요약한 부분을 주의한다. 원 보고서가 language·vision·robotics·healthcare·law·education을 한 목차에 놓았다는 사실은, 당시 model이 그 모든 영역에서 강한 성능을 보였다는 증거가 아니다. 종합 보고서의 **조사 범위**와 model의 **입증된 능력 범위**를 구분한다.

## 6. 왜 중요한가

첫째, 이 보고서는 model 단위 평가를 supply chain과 ecosystem 단위 평가로 넓혔다. Pretraining data와 compute를 제공하는 계층, model provider, adaptation developer, domain institution, affected user를 분리하면 성능과 위해가 어디서 생기고 어떻게 전파되는지 더 정확히 물을 수 있다.

둘째, 재사용의 규모가 책임의 규모도 바꾼다는 점을 선명하게 만들었다. 과제별 model 하나의 오류는 한 응용에 머물 수 있지만, 공통 기반의 오류는 많은 적응 system에서 상관된 실패를 낳을 수 있다. 반대로 기반 계층의 결함을 고치면 하위 시스템 여러 개가 함께 개선될 가능성도 있다.

셋째, 기술과 사회를 별도 부록으로 나누지 않았다. Training data selection, compute concentration, evaluation design, release strategy는 동시에 기술 선택이자 권력·책임 배분이다. 보고서가 스스로 파운데이션 모델을 ‘근본적으로 사회기술적인’ 대상으로 본 이유다.

넷째, 새 이름은 연구 의제를 보이게 만들었지만 범주화 자체도 검토 대상으로 남겼다. ‘파운데이션’이라는 이름은 중심성을 설명하는 동시에 특정 model regime을 불가피하거나 중립적인 기반처럼 보이게 할 위험이 있다. 보고서 공개 뒤 Stanford가 모은 비평도 embodiment·교육의 동질화·역사 지우기·대안 연구 위축 같은 문제를 제기했다.

## 7. 현대 LLM과의 연결

현대 LLM은 파운데이션 모델의 대표 사례지만, 동일한 층위는 아니다. LLM은 model artifact의 modality와 objective를 말하고, foundation model은 downstream ecosystem에서 맡는 역할을 말한다. Chat system은 다시 base LLM, instruction tuning, preference alignment, retrieval, tools, safety filter와 product interface가 결합된 별도 system이다.

이 층위를 나누면 원문이 섞은 여러 주장을 교정할 수 있다.

- GPT-3의 in-context learning은 foundation model adaptation의 한 방식이지, 모든 파운데이션 모델의 필수 능력이 아니다.
- BERT의 supervised fine-tuning도 정의에 맞는 adaptation이다. ‘과제별 훈련이 거의 없다’는 조건은 필수가 아니다.
- CLIP은 image–text contrastive representation을 여러 task에 옮길 수 있어 foundation model 사례가 되지만 autoregressive LLM은 아니다.
- GPT-4는 2021년 보고서에 등장하지 않는다. 다만 후대 관점에서 여러 downstream use의 기반이 된 multimodal model인지 별도로 논의할 수 있다.
- Open-weight model과 API-only model은 모두 foundation 역할을 할 수 있지만, adaptation 권한·감사 가능성·책임 구조는 크게 다르다.

Instruction tuning, parameter-efficient tuning, retrieval-augmented generation과 tool use가 보편화되면서 ‘적응’의 단위도 복잡해졌다. 가중치를 갱신하지 않는 prompt, adapter를 학습하는 방법, external index를 연결하는 방법, agent workflow를 설계하는 방법은 모두 기반 위에 응용을 만드는 다른 개입이다. 따라서 성능 개선을 “기반 모델이 더 똑똑해졌다”로만 설명하지 않고 어느 계층이 바뀌었는지 기록해야 한다.

## 8. 한계와 비판적 관점

- **넓은 정의:** Broad data·scale·adaptability는 경계값이 없다. 어느 정도의 data breadth, compute와 downstream range가 필요한지 판정하기 어려워 범주가 후대 model에 유연하게 소급될 수 있다.
- **새로움의 범위:** 보고서도 deep learning·self-supervision·transfer learning 자체는 오래된 기술이라고 인정한다. 역사적 새로움은 알고리즘 발명보다 규모·범위·생태계의 결합에 있다.
- **실험 논문이 아님:** 보고서의 기회·위험 목록은 하나의 통제 실험에서 나온 효과 크기가 아니다. 각 주장은 개별 인용문헌과 응용 조건으로 내려가 검증해야 한다.
- **능력의 일반화:** GPT-3의 일부 prompt 결과나 BERT benchmark 성능을 모든 foundation model의 broad reasoning·knowledge·robustness로 확대하지 않는다.
- **‘이해’ 표현:** 학습 data에서 많은 pattern과 fact를 재현한다는 결과와 역사·과학·문화의 의미를 인간처럼 이해한다는 철학적 주장은 다르다. 보고서도 이해의 가능성과 한계를 논쟁적인 문제로 남겼다.
- **접근과 권력:** Pretrained model reuse는 일부 adaptation 비용을 낮추지만, training compute·data·release decision이 소수 조직에 집중되는 문제를 해소하지 않는다.
- **위험 전파:** 기반 결함이 downstream으로 이어질 수 있어도 실제 harm은 adaptation data, domain rule, interface와 deployment context에 좌우된다. 모든 하위 실패를 base model 하나로 환원하지 않는다.
- **창발의 측정:** 예상 밖 행동이라는 넓은 개념과 특정 benchmark curve의 불연속 판정을 구분한다. 후자는 task·metric·prompt·sample·scale 관측을 명시해야 한다.
- **후대 영향 인과:** 연구 funding, alignment, policy와 public discourse가 보고서 때문에 바뀌었다는 서술은 시간적 선후만으로 입증되지 않는다. 직접 citation과 제도 기록이 필요하다.
- **정책 권고의 추상성:** 거버넌스 문제를 보이게 한 것과 실행 가능한 규정의 대상·의무·집행 수단을 정한 것은 다르다.
- **환경 범위의 오독:** 원문은 2021년 분석이 추론의 환경 영향을 충분히 포착하지 못했다고 쓰지만, 보고서 §5.3은 훈련뿐 아니라 추론 비용과 반복 사용을 통한 훈련 비용 상각까지 이미 논의했다. 측정이 충분했다는 뜻은 아니지만, 추론 환경비용을 빠뜨렸다는 평가는 맞지 않는다.
- **시점 혼입:** GPT-4, agent system과 2025년 현재의 표준 용어화는 2021년 보고서 이후의 전개다.
- **범주가 만드는 경로 의존성:** 공통 이름은 협업을 돕지만 연구 관심·자금·정책을 특정 대규모 model paradigm에 집중시켜 다른 접근을 덜 보이게 할 수 있다.

## 9. 용어 정리

- **파운데이션 모델(foundation model):** 광범위한 data로 대규모 훈련되고 여러 downstream task에 적응할 수 있어, 많은 응용의 기반 역할을 하는 model
- **광범위한 데이터(broad data):** 좁은 단일 task의 표지 dataset을 넘어선 넓은 training corpus. 반드시 모든 언어·domain·modality를 포함한다는 뜻은 아니다.
- **적응(adaptation):** Pretrained model을 특정 task·domain·사용 조건에 맞추는 과정. Fine-tuning, prompting 등 여러 방식이 가능하다.
- **하위 과제(downstream task):** 사전 학습 뒤 model을 실제로 적용하거나 평가하는 구체적인 과제
- **창발(emergence):** System behavior가 과제별 규칙으로 직접 설계되지 않고 학습에서 암묵적으로 형성되는 현상. 특정 score의 불연속 증가라는 후대의 좁은 정의와 구분한다.
- **동질화(homogenization):** 여러 AI system이 소수의 공통 model·architecture·method에 의존하는 현상
- **중간 자산(intermediary asset):** 사용자에게 직접 영향을 주는 완성 응용이 아니라, 여러 응용이 적응해 사용하는 기반 계층의 model
- **내재적 편향(intrinsic bias):** Base model 내부에서 harm 가능성을 예고하는 표현·행동 특성
- **외재적 위해(extrinsic harm):** 구체적인 application과 사회적 context에서 실제 사람에게 나타나는 불이익
- **단일 실패점(single point of failure):** 공통 기반의 결함이 여러 downstream system에 동시에 영향을 줄 수 있는 구조
- **사회기술적 체계(sociotechnical system):** Model architecture뿐 아니라 data·사람·기관·규칙·경제적 권력과 deployment가 함께 결과를 만드는 체계

## 10. 함께 보면 좋은 항목

- [CRFM 원 보고서](https://crfm.stanford.edu/assets/report.pdf): 정의, 창발·동질화, 능력·응용·기술·사회 장을 직접 확인하는 1차 자료
- [arXiv 2108.07258](https://arxiv.org/abs/2108.07258): 제출일, 저자 목록, 초록과 version 기록
- [CRFM 공개 뒤의 성찰](https://crfm.stanford.edu/2021/10/18/reflections.html): 용어의 의도, LLM과의 관계, 중앙집중·접근 문제에 대한 연구진의 후속 설명
- [언어 모델 전이 학습](/writing/language-model-transfer-learning): 고정 특징·전체 미세조정·입력 조건화로 adaptation 방법이 변한 과정
- [GPT-3와 문맥 내 학습](/writing/gpt3-in-context-learning-emergent-capabilities-from-scale): GPT-3의 zero·one·few-shot 조건과 실제 과제별 성능 범위
- [CLIP](/writing/clip-contrastive-language-image-pretraining-multimodal): LLM이 아니면서 여러 image task의 기반 표현으로 적응되는 사례
- [사전 학습 지식은 과제에 어떻게 도착하는가](/writing/how-pretrained-knowledge-reaches-tasks): 기반 표현이 feature·fine-tuning·prompt·instruction tuning으로 downstream task에 전달되는 방식
- [손실 곡선과 능력 곡선 사이](/writing/between-loss-curves-and-capability-curves): 2021년의 넓은 창발 개념과 후대 benchmark 능력 논쟁을 구분하는 측정 틀

## 11. 읽고 생각해볼 질문

1. 파운데이션 모델을 ‘매우 큰 언어 모델’로만 정의하면 CLIP 같은 사례와 downstream ecosystem의 어떤 문제가 사라지는가?
2. BERT의 전체 미세조정과 GPT-3의 in-context prompting이 모두 adaptation일 수 있는 이유는 무엇인가?
3. 하나의 기반 model을 여러 응용에 재사용할 때 개선의 지렛대와 단일 실패점은 어떻게 동시에 커지는가?
4. Base model의 intrinsic bias와 실제 application의 extrinsic harm을 구분해야 책임 경로를 더 정확히 찾을 수 있는 이유는 무엇인가?
5. 2021년 보고서의 emergence와 후대의 불연속 benchmark ability를 같은 뜻으로 읽으면 어떤 증거 조건을 놓치는가?
6. 2025년 회고 글이 말한 연구·정책 영향의 인과를 검증하려면 보고서 본문 외에 어떤 자료가 필요한가?

## 12. 짧은 결론

2021년 파운데이션 모델 보고서의 핵심은 큰 model에 새 이름을 붙인 데만 있지 않다. Broad data로 훈련한 하나의 model을 여러 task에 적응시키는 구조가 확산되면, 능력·결함·비용·권력이 기반 계층에서 많은 응용으로 전파된다. 보고서는 이 구조를 창발과 동질화라는 양면적 개념으로 묶고 기술, 응용과 사회적 결과를 같은 연구 의제로 올렸다.

동시에 이 문서는 새 model의 보편 능력을 실험으로 증명한 논문도, 후대 정책·산업 효과를 측정한 영향 평가도 아니다. 정확히 읽으려면 2021년의 정의와 전망, 개별 model의 실증 결과, 2025년 회고 저자의 평가를 분리해야 한다. 그 구분을 유지할 때 ‘파운데이션’은 과장된 지능의 별명이 아니라 AI system의 공통 기반과 책임 전파를 분석하는 유용한 도구가 된다.
