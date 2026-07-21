---
source_file: "076_InstructGPT and RLHF Aligning Language Models with Human Preferences.md"
translation_file: "076_InstructGPT and RLHF Aligning Language Models with Human Preferences.ko.md"
commentary_type: "해설"
source_stem: "076_InstructGPT and RLHF Aligning Language Models with Human Preferences"
order_prefix: "076"
topic: "InstructGPT와 인간 피드백 기반 언어 모델 사후 훈련"
period: "2017–2025"
tags:
  - InstructGPT
  - RLHF
  - alignment
  - AI-history
  - commentary
---

# InstructGPT와 인간 피드백 기반 언어 모델 사후 훈련 해설

## 1. 한눈에 보기

- 핵심 주제: 평가자의 시연으로 지도 미세조정(SFT)하고, 여러 응답의 순위로 보상 모델을 학습한 뒤, 그 보상을 PPO로 최적화한 InstructGPT의 3단계 과정
- 등장 배경: GPT-3의 다음 token 예측 능력과 사용자가 실제 지시에서 원하는 응답 사이의 간극이 뚜렷해진 시기
- 가장 중요한 아이디어: 모델 규모를 키우는 것과 별개로, **사전 학습된 능력이 어떤 행동으로 드러날지를 인간 feedback으로 사후 훈련할 수 있다**는 실증
- 반드시 기억할 제한: 학습된 것은 보편적인 ‘인간 가치’가 아니라 특정 평가자·연구자 지침·영어 중심 API Playground 고객 prompt 분포에서 관찰한 선호다. 논문은 완전한 안전이나 정렬 문제의 해결을 입증하지 않았다.

> 이 문서는 2025년에 공개된 회고 글 `076_InstructGPT and RLHF Aligning Language Models with Human Preferences.md`의 번역문을 이해하기 위한 해설입니다. 번역문은 원문의 역사 서술과 강한 평가를 보존하지만, 해설은 Ouyang 등 2022년 논문이 직접 보인 결과, 선행 RLHF 계보, 2025년 저자의 후대 평가를 분리합니다.

## 2. 핵심 요약

Long Ouyang 등은 2022년 *Training Language Models to Follow Instructions with Human Feedback*에서 GPT-3 계열의 1.3B·6B·175B model을 대상으로 InstructGPT를 훈련하고 평가했다. 출발점은 단순하다. 다음 token 예측으로 사전 학습한 model이 언어의 많은 pattern을 익혀도, 사용자의 지시를 따르고 유용한 형식으로 답하는 일이 training objective에 직접 들어 있지는 않다. 더 큰 model이 항상 더 적절한 응답을 내는 것도 아니다.

연구진은 이 간극을 세 단계로 다뤘다. 먼저 평가자가 prompt에 모범 응답을 써서 지도 미세조정 model을 만들었다. 다음으로 같은 prompt에 대한 4–9개 model 응답을 평가자가 순위화했고, 이 순위를 동률을 제외한 모든 쌍의 비교로 바꾸어 scalar 보상을 예측하는 reward model을 훈련했다. 마지막으로 SFT policy가 내는 응답의 reward를 높이도록 PPO를 적용했다. 논문에서 보통 InstructGPT라 부르는 PPO-ptx variant는 SFT policy와의 token별 KL penalty에 더해 사전 학습 자료의 gradient를 섞어 일부 학술 과제 성능 하락을 줄였다.

핵심 결과는 model size와 선호되는 행동이 같은 축이 아님을 보여 준다. 1.3B InstructGPT 응답이 175B GPT-3보다 평가자에게 선호됐고, 175B InstructGPT는 같은 크기 GPT-3보다 85±3%, few-shot prompt를 준 GPT-3보다 71±4%의 비교에서 선호됐다. Closed-domain task의 hallucination은 41%에서 21%로 줄었고 TruthfulQA의 truthful-and-informative 비율도 개선됐다.

그러나 이 수치를 “인간 가치 정렬”이나 “안전한 배포”로 확대하면 안 된다. 독성 감소는 정중한 지시 조건에서 약 25%였고 prompt가 없으면 이점이 사라졌으며, 편향 benchmark에서는 유의한 개선이 없었다. 무엇보다 공식 model card와 논문은 해로운 지시도 대체로 따르는 것을 가장 큰 한계로 꼽았다. Vanilla PPO에는 일부 public NLP task의 성능 하락도 있었고, PPO-ptx가 대부분 완화했지만 DROP·SQuADv2·번역 등에서는 GPT-3보다 뒤졌다.

## 3. 역사적 배경

InstructGPT가 인간 선호 기반 강화학습이나 3단계 RLHF를 처음 발명한 것은 아니다. 2017년 Christiano 등은 사람이 trajectory segment를 비교하면 reward predictor가 이를 학습하고 policy가 그 reward를 최적화하는 틀을 Atari와 simulated robotics에서 보였다. Ziegler 등은 2019년 이 접근을 GPT-2 기반 자연어 생성에 적용했고, Stiennon 등은 2020년 요약 응답의 비교, reward model, PPO policy라는 언어 model pipeline을 실증했다.

InstructGPT의 기여는 이 계보를 광범위한 실제 지시 분포에 확장한 데 있다. 연구진은 평가자가 만든 prompt와 초기 InstructGPT model을 API Playground에서 사용한 고객 prompt를 모았다. Production API 고객 자료를 그대로 가져온 것이 아니며, 고객에게 반복 고지하고 개인 식별 정보 filter와 중복 제거를 적용했다. 이 자료로 demonstration, ranking, PPO prompt를 분리해 GPT-3 세 크기에 적용하고, 실제 고객 분포에서 human evaluation을 수행했다.

비슷한 시기의 FLAN·T0도 자연어 지시를 이용했지만 질문이 달랐다. FLAN은 여러 공개 NLP task를 지시 형식으로 미세조정해 보지 않은 task category로 zero-shot generalization하는지를 물었다. InstructGPT는 사용자의 open-ended API prompt에 어떤 응답이 더 적절한지를 평가자의 시연과 선호 순위로 학습했다. 둘 다 instruction tuning의 역사에 속하지만, 다과제 지도 학습과 learned reward를 통한 preference optimization을 같은 방법으로 합치지 않는다.

OpenAI는 2022년 1월 27일 InstructGPT 관련 공개 글을 냈고, 논문 arXiv 초판은 3월 4일 제출됐으며 NeurIPS 2022 Main Track에 실렸다. 당시 API에 배포한 model은 논문 checkpoint 그 자체가 아니라 같은 human-feedback data를 조금 다른 절차로 훈련한 갱신판이었다. 따라서 논문의 benchmark 수치를 당시 API 기본 model의 정확한 제품 수치로 옮겨 쓰지 않는다.

## 4. 핵심 개념 해설

### 4.1 HHH는 목표 틀이지 세 성질의 완전한 측정이 아니다

논문은 alignment를 helpful, honest, harmless라는 HHH 목표로 설명한다. Helpful은 사용자의 지시와 암묵적 의도를 따르는 것, honest는 사실을 꾸미지 않고 자신의 불확실성을 적절히 다루는 것, harmless는 사람과 환경에 위해를 주지 않는 것을 가리킨다. 그러나 연구가 세 속성을 완전하게 직접 측정한 것은 아니다.

Honesty 자체를 관측할 수 없으므로 TruthfulQA와 closed-domain hallucination 같은 proxy를 사용했다. Harmlessness도 toxicity와 bias benchmark, 위험한 prompt에 대한 qualitative test 일부로 평가했다. Proxy가 좋아졌다는 결과는 측정하지 않은 위해까지 줄었다는 뜻이 아니다. HHH를 model이 획득한 세 개의 인증된 성질이 아니라, 어떤 행동을 바라는지 조직하는 평가 틀로 읽어야 한다.

### 4.2 시연 자료와 지도 미세조정

첫 단계에서 평가자는 prompt를 읽고 원하는 response를 직접 작성했다. SFT model은 이 demonstration pair에 대한 다음 token likelihood를 높이도록 GPT-3를 미세조정한 것이다. Training split은 12,725개 prompt였고, 약 11,295개는 평가자 작성 prompt, 1,430개는 고객 prompt였다.

SFT는 단순한 예열 단계가 아니다. 논문에서도 SFT만으로 GPT-3보다 평가자 선호가 크게 나아졌고, PPO policy와 KL 기준의 출발점이 됐다. 원문처럼 “지도 미세조정은 확장되지 않고 미묘한 선호를 담지 못한다”고 절대화하면 InstructGPT 자체에서 맡은 역할을 놓친다. 정확한 한계는 모든 가능한 상황에 대한 이상적 응답을 직접 쓰기 어렵고, 비교 판단으로 표현하기 쉬운 품질 차이를 demonstration만으로 충분히 덮기 어렵다는 데 있다.

### 4.3 순위 자료에서 scalar reward model로

둘째 단계에서 평가자는 하나의 prompt에 대해 model이 만든 4–9개 completion을 한 화면에서 최선부터 최악까지 순위화했다. 연구진은 이 전체 순위에서 동률을 제외한 가능한 모든 pairwise comparison을 만들고, 선호된 응답에 더 높은 scalar score를 주도록 reward model을 학습했다. 곧 원자료는 단순한 독립 쌍 선택이 아니라 여러 응답의 순위였고, loss를 계산할 때 쌍으로 변환했다.

RM training split은 33,207개 prompt로, 6,623개 평가자 작성 prompt와 26,584개 고객 prompt로 구성됐다. 최종 PPO 실험에는 6B reward model 하나를 공통으로 썼다. 175B RM은 training instability와 계산 비용 때문에 채택하지 않았다. Reward model은 사람의 마음이나 보편 윤리를 읽는 장치가 아니라, 관측된 prompt·response·ranking 안에서 해당 평가자의 선택을 예측하는 통계 model이다.

### 4.4 PPO, KL penalty와 PPO-ptx

셋째 단계에서는 SFT policy가 고객 prompt에 응답하고, reward model이 scalar reward를 부여하며, PPO가 기대 reward를 높이도록 policy를 갱신했다. PPO training에는 31,144개의 고유한 고객 prompt와 약 256,000 episode가 사용됐다. 이때 model이 reward model의 허점을 이용하거나 자연스러운 언어 분포에서 지나치게 벗어나지 않도록 SFT policy와의 token별 KL divergence에 penalty를 줬다.

원문은 KL 기준을 “원래 사전 학습 model”이라고 쓰지만 논문의 기준 policy는 SFT model이다. 또 논문에서 별도 표시가 없을 때 InstructGPT는 보통 PPO-ptx를 뜻한다. PPO-ptx는 reward objective에 GPT-3 pretraining distribution의 gradient를 섞어 public NLP task의 regression을 완화한다. KL penalty와 pretraining mix는 서로 다른 장치이며, 둘 다 reward hacking이나 능력 저하가 사라진다는 보장은 아니다.

### 4.5 누구의 선호를 학습했는가

연구에는 screening을 통과한 약 40명의 contractor가 참여했다. 자료의 96% 이상이 영어였고 평가자는 주로 영어권 또는 미국·동남아에 기반했다. 비용 때문에 대부분의 비교에는 한 명의 labeler만 붙었다. Researcher가 작성한 labeler instruction도 무엇을 ‘좋은 응답’으로 볼지 결정했다.

그러므로 “인간이 실제로 원하는 것”은 너무 넓은 표현이다. 더 정확한 말은 **이 연구의 지침 아래 특정 평가자들이 영어 중심 Playground 고객 prompt에 대해 더 낫다고 판단한 응답**이다. Held-out labeler 집단에서도 RM preference prediction이 69.6±0.9%로 어느 정도 일반화됐지만, training labeler 집단의 72.4±0.4%보다 낮았다. 이 간극은 선호 주체가 바뀌면 learned reward도 달라질 수 있음을 보여 준다.

## 5. 원문의 논리 구조

원문은 다음 순서로 범위를 넓힌다.

1. GPT-3의 능력과 실제 사용자 의도 사이의 간극을 문제로 제시한다.
2. 도움·정직·무해라는 목표와 next-token prediction의 불일치를 설명한다.
3. 지도 미세조정, reward modeling, PPO의 3단계 해법을 소개한다.
4. 인간 선호 평가, 일반 능력 유지, 대화형 AI 훈련 방식의 변화를 성과로 제시한다.
5. 인간 노동·평가자 편향·RM 일반화·계산 비용·reward hacking을 한계로 든다.
6. ChatGPT·GPT-4·Claude와 현대 LLM 전반의 표준 방법으로 이어졌다는 후대 유산을 주장한다.

1–3번은 논문의 문제 설정과 Figure 2의 pipeline을 대체로 반영하지만 중요한 세부가 단순화됐다. Prompt 출처, 4–9개 응답 순위, SFT 기준 KL, PPO-ptx의 pretraining mix가 빠졌고, 기존 연구를 따른 pipeline을 InstructGPT가 개척했다고 표현했다. “비교가 절대 점수보다 본질적으로 쉽다”거나 PPO가 탐색과 활용을 균형 잡았다는 설명도 논문이 직접 비교 실험으로 보인 결과는 아니다.

4번에는 실제 결과와 확대 해석이 섞였다. 다양한 API prompt 분포에서 선호 우위가 나타난 것은 맞지만, code generation과 비영어 사용은 정량적으로 추적하지 않은 qualitative probe였다. Alignment가 capability loss 없이 달성됐다는 말도 PPO regression과 PPO-ptx의 불완전한 회복을 지운다. 부적절한 요청을 적절히 거절했다는 원문의 문장은 오히려 논문과 model card가 꼽은 가장 큰 한계와 충돌한다.

5번의 대표성·reward proxy·분포 이동 우려는 타당하다. 반면 RLHF 계산이 너무 커서 갱신 빈도를 제한했다는 서술은 이 연구가 측정한 결과가 아니다. 저자들은 175B SFT 약 4.9 PF-days, PPO-ptx 약 60 PF-days를 GPT-3 pretraining 약 3,640 PF-days와 비교해 추가 계산량이 상대적으로 작다고 평가했다. Human annotation의 비용과 compute의 상대 비용을 구분한다.

6번은 2025년 회고 저자의 산업사 평가다. 원 논문은 자신보다 뒤에 나온 ChatGPT·GPT-4·Claude의 training recipe를 입증할 수 없다. 개별 system이 공개한 공식 자료가 있어야 직접 계보를 말할 수 있으며, DPO·RLAIF 같은 변형과 대안도 모두 InstructGPT와 동일한 3단계 PPO pipeline으로 부르지 않는다.

## 6. 왜 중요한가

첫째, InstructGPT는 model capability와 사용자에게 선호되는 behavior를 분리해 보게 했다. 1.3B InstructGPT가 175B GPT-3보다 선호된 결과는 작은 model이 모든 지식·추론 과제에서 더 유능하다는 뜻이 아니다. 더 큰 base model의 잠재 능력과 지시를 이해하기 쉬운 형식으로 수행하는 post-training behavior가 다른 축임을 보여 준다.

둘째, 실제 사용 분포를 training과 evaluation에 연결했다. RM 자료에서 generation이 45.6%, brainstorming이 11.2%였고, open·closed QA와 classification을 합친 비중은 약 18%였다. 하나의 academic benchmark가 아니라 여러 open-ended request에서 상대적 품질을 판단하도록 설계한 점이 이전의 좁은 language task preference 연구와 다르다.

셋째, 사람의 판단을 loss function으로 옮기는 전체 경로를 드러냈다. Labeler가 직접 model parameter를 조정하지 않아도 demonstration과 ranking이 SFT loss와 reward model을 거쳐 policy update에 영향을 준다. 동시에 researcher instruction, labeler selection, prompt distribution, RM architecture가 최적화 대상을 함께 만든다는 사실도 분명해졌다.

넷째, human evaluation이 자동 benchmark와 다른 질문에 답할 수 있음을 보였다. 사용자 prompt에 대한 두 응답 중 어느 쪽이 더 유용한지는 perplexity나 정답 일치율 하나로 재기 어렵다. 그러나 preference win rate도 truthfulness·harmlessness·보편 능력의 단일 점수가 아니며, 평가자의 기준과 표본 분포를 함께 기록해야 한다.

## 7. 현대 LLM과의 연결

InstructGPT는 오늘날 post-training을 설명할 때 중요한 공개 기준점이다. Base model을 만든 뒤 instruction demonstration으로 행동 형식을 잡고, 사람 또는 model의 preference data로 후보 응답을 비교하며, 그 signal을 policy에 반영한다는 큰 문제 구조가 널리 연구됐다. 다만 현대 system이 모두 SFT→RM→PPO의 동일한 순서를 쓰는 것은 아니다.

Direct Preference Optimization은 별도 scalar reward model과 online PPO loop 없이 preference pair에서 reference policy 대비 선호 확률을 직접 최적화한다. RLAIF는 일부 feedback source를 인간 평가자 대신 AI system으로 바꾼다. Rejection sampling, reward-weighted training, process supervision과 constitutional methods도 서로 다른 위치에서 개입한다. 이들은 “InstructGPT와 같은 RLHF”라는 한 문장보다 **누가 선호 signal을 만들고, 어떤 objective가 어느 policy를 갱신하는가**로 비교해야 한다.

ChatGPT가 human-feedback training 계보를 공개적으로 설명한 사례처럼 직접 자료가 있는 system은 제한적으로 연결할 수 있다. 그러나 GPT-4·Claude를 포함한 모든 주요 model이 InstructGPT의 방법을 그대로 썼다거나, model release가 반드시 RLHF를 포함한다고 일반화할 수는 없다. 비공개 training detail과 서로 다른 preference optimization 방법이 많기 때문이다.

또한 instruction following은 safety와 동의어가 아니다. Model이 지시를 더 정확히 수행하면 유용한 작업도 쉬워지지만 악의적인 요청의 실행 가능성도 커질 수 있다. 그래서 modern alignment는 preference optimization 외에도 data governance, red teaming, refusal training, capability evaluation, tool permission, monitoring과 deployment policy를 함께 다룬다.

## 8. 한계와 비판적 관점

- **선호의 대표성:** 약 40명의 contractor, researcher instruction, 영어 중심 Playground 고객 prompt는 인류 전체의 가치나 모든 deployment context를 대표하지 않는다.
- **평가자 한 명의 비교:** 비용 때문에 대부분의 comparison에 한 명만 참여했다. 다수결로 안정된 보편 선호를 직접 측정한 자료가 아니다.
- **Reward model은 proxy:** RM은 관측한 ranking을 예측한다. Truth, usefulness와 harmlessness 자체를 측정하지 않으며 새로운 prompt distribution에서 오차가 커질 수 있다.
- **순위에서 scalar로의 압축:** 여러 기준과 문맥을 하나의 reward 값으로 줄이면 서로 충돌하는 이유와 소수 선호가 사라질 수 있다.
- **Reward overoptimization:** Policy가 learned proxy를 직접 최대화하면 사람이 원한 품질보다 RM의 허점을 이용할 수 있다. KL penalty는 이동을 제한하지만 문제를 해결했다는 보장은 아니다.
- **조건부 독성 개선:** 정중한 prompt에서는 toxicity가 약 25% 줄었지만 no-prompt 조건에서는 우위가 사라졌고, toxic instruction에서는 GPT-3보다 더 toxic할 수 있었다.
- **편향 미개선:** Winogender와 CrowS-Pairs에서는 유의한 bias improvement가 확인되지 않았다.
- **유해 지시 추종:** 공식 model card가 꼽은 가장 큰 한계는 model이 해로운 instruction도 대체로 따른다는 점이다. Reliable refusal는 이 연구의 달성 결과가 아니다.
- **능력 저하:** Vanilla PPO는 일부 public NLP task에서 alignment tax를 보였다. PPO-ptx가 대부분 완화했지만 모든 regression을 없애지 못했고, pretraining mix가 바람직하지 않은 base behavior를 되살릴 수도 있다.
- **정성 사례의 확대:** Code와 non-English example은 제한적이며 정량 추적하지 않았다. 이를 여러 domain의 일반 성능 향상으로 확대하지 않는다.
- **제품과 논문 checkpoint:** 당시 API 배포판은 논문 model과 훈련 절차가 조금 달랐다. 논문 결과를 제품 동작의 정확한 수치로 간주하지 않는다.
- **후대 영향의 인과:** 후속 model training, 투자와 평가 관행이 이 논문 때문에 바뀌었다는 주장은 시간 순서만으로 입증되지 않는다. 개별 공식 자료와 adoption record가 필요하다.
- **안전 만능 해법이 아님:** Preference optimization은 broader safety ecosystem의 한 요소다. 정렬 문제를 해결 가능한 단일 engineering objective로 환원하지 않는다.

## 9. 용어 정리

- **InstructGPT:** GPT-3 계열 model을 평가자 demonstration과 preference ranking, PPO로 사후 훈련한 Ouyang 등 2022년의 model family
- **인간 피드백 강화학습(RLHF):** 사람이 제공한 비교·평가에서 reward signal을 학습하고 그 signal로 policy를 최적화하는 접근의 넓은 계열
- **지도 미세조정(SFT):** Prompt와 평가자가 작성한 demonstration response의 likelihood를 높이도록 pretrained model을 미세조정하는 단계
- **보상 모델(RM):** Prompt와 response를 받아 관측된 인간 선호를 예측하는 scalar score를 출력하는 model
- **응답 순위(response ranking):** 하나의 prompt에 대한 여러 completion을 최선부터 최악까지 배열한 annotation
- **쌍별 비교(pairwise comparison):** 두 response 중 어느 쪽이 선호되는지를 나타내는 training relation. InstructGPT에서는 4–9개 전체 순위에서 동률을 제외한 모든 pair를 만들었다.
- **근접 정책 최적화(PPO):** Reward를 높이되 policy update를 제약하며 반복적으로 model parameter를 갱신하는 reinforcement learning algorithm
- **KL penalty:** 현재 policy가 reference policy에서 지나치게 멀어지지 않도록 log-probability 차이에 비용을 주는 항. 이 논문의 reference는 SFT policy다.
- **PPO-ptx:** PPO objective에 pretraining data의 next-token gradient를 섞어 public NLP task regression을 줄인 variant
- **정렬 비용(alignment tax):** Preference optimization 뒤 일부 기존 capability benchmark 성능이 낮아지는 현상
- **HHH:** Helpful·honest·harmless라는 목표 묶음. 각 성질이 완전히 측정되거나 달성됐다는 인증명이 아니다.

## 10. 함께 보면 좋은 항목

- [InstructGPT 원 논문](https://arxiv.org/abs/2203.02155): Figure 2, §§3–5와 부록에서 data, 3단계 pipeline, 평가와 한계를 확인할 수 있는 1차 자료
- [NeurIPS 2022 논문 페이지](https://proceedings.neurips.cc/paper_files/paper/2022/hash/b1efde53be364a73914f58805a001731-Abstract.html): 정식 학회 발표 정보와 PDF
- [OpenAI의 2022년 공개 글](https://openai.com/index/instruction-following/): API 배포 맥락과 논문 model·배포판의 차이를 설명한 공식 자료
- [공식 InstructGPT model card](https://github.com/openai/following-instructions-human-feedback/blob/main/model-card.md): 알려진 실패 유형과 유해 지시 추종 한계
- [[055_RLHF Foundations Learning from Human Preferences in Reinforcement Learning.ko|RLHF 토대와 인간 선호 기반 보상 학습]]: Christiano 2017에서 Ziegler 2019·Stiennon 2020으로 이어지는 선행 계보
- [인간 피드백 강화학습](https://yghnsim.github.io/LLM_Wiki_v2/concepts/인간-피드백-강화학습/): 선호 비교, reward model, policy optimization과 대표성 문제
- [[071_Instruction Tuning Adapting Language Models to Follow Explicit Instructions.ko|지시 미세조정과 FLAN의 제로샷 일반화]]: 다과제 instruction tuning과 사용자 preference alignment의 차이
- [[066_GPT-3 and In-Context Learning Emergent Capabilities from Scale.ko|GPT-3와 문맥 내 학습]]: Base GPT-3의 zero·one·few-shot 조건과 평가 범위
- [자동 평가 지표는 무엇을 보상하는가](https://yghnsim.github.io/LLM_Wiki_v2/analyses/자동-평가-지표는-무엇을-보상하는가/): 고정 metric과 learned reward가 각각 어떤 proxy를 최적화하는지 비교할 분석
- [사전 학습 지식은 과제에 어떻게 도착하는가](https://yghnsim.github.io/LLM_Wiki_v2/analyses/사전-학습-지식은-과제에-어떻게-도착하는가/): Prompt, SFT와 preference optimization이 사전 학습 능력을 task behavior로 바꾸는 서로 다른 경로

## 11. 읽고 생각해볼 질문

1. Reward model이 특정 평가자의 ranking을 잘 예측하는 것과 보편적인 인간 가치를 최대화하는 것은 왜 다른가?
2. 1.3B InstructGPT가 175B GPT-3보다 선호된 결과는 지식·추론 capability와 지시를 따르는 behavior의 차이를 어떻게 보여 주는가?
3. SFT policy를 KL reference로 삼으면 reward overoptimization을 늦출 수 있지만, SFT model의 어떤 한계도 함께 보존될 수 있는가?
4. 여러 기준의 response ranking을 scalar reward 하나로 압축할 때 어떤 갈등과 소수 선호가 보이지 않게 되는가?
5. Instruction following이 좋아질수록 유용성과 misuse 가능성이 함께 커질 수 있는 이유는 무엇인가?
6. 현대 model이 InstructGPT의 직접 후계라고 주장하려면 공개된 training description에서 어떤 단계와 signal을 확인해야 하는가?

## 12. 짧은 결론

InstructGPT의 역사적 의미는 3단계 RLHF를 처음 발명했다는 데 있지 않다. 선행 선호 학습 연구를 광범위한 API 지시 분포와 GPT-3 세 크기에 적용해, 더 큰 사전 학습 model을 만드는 것과 사용자가 선호하는 행동으로 사후 훈련하는 것이 서로 다른 축임을 선명하게 보인 데 있다. Evaluation demonstration, response ranking, learned reward와 policy optimization이 연결되면서 현대 post-training의 중요한 공개 기준점이 만들어졌다.

동시에 이 연구는 preference alignment의 핵심 난점도 드러냈다. Reward model은 보편적 가치가 아니라 특정 사람·지침·prompt 분포의 판단을 근사하며, policy는 바로 그 proxy를 직접 최적화한다. 조건부 truthfulness·toxicity 개선은 유해 지시의 reliable refusal나 편향 제거, 완전한 capability preservation을 뜻하지 않았다. InstructGPT를 정확히 읽는 일은 ‘인간 feedback을 쓰면 안전해진다’는 성공담이 아니라, 누구의 선호를 어떤 측정과 objective로 바꾸는지를 추적하는 일이다.
