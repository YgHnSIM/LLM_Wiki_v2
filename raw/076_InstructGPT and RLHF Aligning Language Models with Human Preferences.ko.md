# InstructGPT와 RLHF: 인간 선호에 맞춘 언어 모델 정렬

Source: https://mbrenndoerfer.com/writing/instructgpt-rlhf-aligning-language-models-human-preferences

---



지도 미세조정, 보상 모델링, 강화학습 최적화로 이루어진 3단계 RLHF 훈련 과정과 대규모 언어 모델을 인간 선호에 맞추는 데 미친 근본적 영향을 포함해 OpenAI의 2022년 InstructGPT 연구를 다루는 종합 안내서다.

읽기 수준

전문 지식 수준을 선택하면 설명되는 용어의 수를 조절할 수 있다. 초보자에게는 더 많은 도구 설명을 제공하고, 전문가는 읽기 흐름을 유지하도록 설명을 줄인다. 밑줄 친 용어 위에 마우스를 올리면 즉시 정의를 볼 수 있다.

## 2022년: InstructGPT와 RLHF

2022년 초 OpenAI는 대규모 언어 모델을 [인간 선호](/writing/rlhf-foundations-reinforcement-learning-human-preferences)에 맞추고 실제로 배포하는 방식을 근본적으로 바꿀 연구를 발표했다. 「인간 피드백으로 지시를 따르도록 언어 모델 훈련하기」라는 논문으로 발표되고 InstructGPT라는 모델로 구현된 이 연구는 지도 미세조정, [보상 모델링](/writing/reward-modeling-rlhf-architecture-training), 강화학습을 결합한 3단계 훈련 과정을 도입해 사전 학습 모델보다 더 도움이 되고 정직하며 무해한 언어 모델을 만들었다. 이 연구는 모델이 인간 가치에 맞도록 학습하는 방식의 근본적 한계를 다루며, 언어 모델을 현실 세계에 실용적이고 안전하게 배포하는 데 결정적인 진전이었다.

InstructGPT는 대규모 언어 모델 진화의 중요한 시점에 개발됐다. [GPT-3](/writing/gpt3-in-context-learning-emergent-capabilities-from-scale) 같은 모델은 텍스트 생성과 퓨샷 학습에서 놀라운 능력을 보여 주었지만 인간이 실제로 원하는 것과 맞지 않는 출력을 자주 만들었다. 이 모델들은 유창하고 일관된 글을 쓸 수 있었지만 해로운 내용을 생성하거나, 도움이 되는 요청을 거절하거나, 기술적으로는 맞아도 쓸모없는 응답을 낼 수 있었다. 모델이 할 수 있는 일과 인간이 모델에게 원하는 일 사이의 간극은 실제 배포를 가로막는 중요한 병목이 됐다.

OpenAI 연구자 Long Ouyang, Jeff Wu, Xu Jiang, Diogo Almeida, Carroll Wainwright, Pamela Mishkin, Chong Zhang, Sandhini Agarwal, Katarina Slama, Alex Ray, John Schulman 등은 [정렬 문제](/writing/alignment-problem-hhh-framework-language-models)를 해결하기 위해 [인간 선호](/writing/rlhf-foundations-reinforcement-learning-human-preferences)를 명시적으로 최적화하는 훈련 과정을 개발했다. InstructGPT는 사전 학습에 쓰이는 다음 토큰 예측 목적에만 의존하지 않고, 인간 피드백 강화학습(RLHF)으로 사람이 실제로 선호하는 결과에 맞게 모델을 미세조정했다. 이 접근은 정렬을 열망의 목표에서 훈련을 통해 체계적으로 개선할 수 있는 명시적 최적화 대상으로 바꾸었다.

InstructGPT의 중요성은 당장의 기술적 성과를 넘어섰다. 이 연구는 대규모 언어 모델을 대규모로 인간 선호에 체계적으로 정렬할 수 있음을 보여 주었고, RLHF를 대화형 AI 시스템 훈련의 표준 기법으로 확립했다. InstructGPT에서 개발된 방법은 [ChatGPT](/writing/chatgpt-conversational-ai-becomes-mainstream), [GPT-4](/writing/gpt4-multimodal-language-models-reach-human-level-performance)를 비롯한 여러 후속 언어 모델의 토대가 됐다. 이 연구는 언어 모델 정렬이 훈련 자료를 거르거나 출력을 후처리하는 데 그치지 않고, 인간 피드백에 근거한 명시적 훈련 최적화를 필요로 함을 보여 주었다.

## 문제

방대한 텍스트 말뭉치에서 비지도 학습으로 훈련한 대규모 언어 모델은 sequence의 다음 token을 예측하도록 학습했지만, [인간 선호](/writing/rlhf-foundations-reinforcement-learning-human-preferences)에 따라 도움 되고 정직하며 무해하도록 훈련된 것은 아니었다. 이 모델들을 실제 응용에 배포하자 효과적인 현실 사용을 막는 몇 가지 중대한 한계가 나타났다. 이 한계를 이해하면 InstructGPT의 접근이 왜 필요했고 변혁적이었는지 알 수 있다.

다음 토큰 예측만으로 훈련한 모델은 유창하고 일관된 출력을 만들지만 인간의 의도나 선호와 반드시 일치하지는 않았다. 사용자가 간결한 답을 원할 때 사실은 맞지만 지나치게 장황하게 설명할 수 있었다. 특정 관점에서 글을 쓰라는 요청에 해로운 내용을 만들 수도 있었다. 정당한 과제는 거부하면서 안전 지침을 위반하는 요청은 기꺼이 수행할 수도 있었다. 훈련 목적이 출력의 도움·정확성·안전성에 따라 서로 다른 출력 유형을 구별하지 않았기 때문에 이런 불일치가 생겼다.

정렬 불일치는 여러 구체적인 방식으로 나타났다. 모델은 기술적으로 그럴듯하지만 쓸모없는 출력을 자주 만들었다. 예를 들어 코드를 작성하라고 하면 문법은 맞지만 실제 문제를 풀지 못하는 프로그램을 만들 수 있었다. 문서를 요약하라고 하면 관련 없는 세부 사항을 넣거나 핵심을 놓칠 수 있었다. 무엇이 ‘좋은’ 출력인지에 대한 모델의 이해는 도움이나 정확성에 관한 명시적 [인간 선호](/writing/rlhf-foundations-reinforcement-learning-human-preferences)가 아니라 훈련 자료의 통계적 패턴에서 나왔다.

안전 문제는 정렬 불일치의 또 다른 중요한 차원이었다. Web text로 훈련한 모델은 훈련 자료에 존재하는 편향·고정관념·해로운 내용을 재생산했다. 안전을 명시적으로 최적화하지 않으면 모델은 수행해야 할 요청과 거부해야 할 요청을 안정적으로 구분하지 못했다. 모델이 부적절하거나 편향되거나 잠재적으로 해로운 내용을 생성할 수 있어 배포에는 위험이 따랐다.

모델이 과제를 올바르게 수행할 수 있을 때조차 과제 수행 방식에 관한 인간 선호와 맞지 않는 경우가 많았다. 질문에 맞게 답하면서도 편한 표현이 선호되는 상황에서 지나치게 격식을 차릴 수 있었다. 짧은 답을 원할 때 너무 많은 세부를 제공하거나, 종합적인 설명이 필요할 때 너무 적게 답할 수도 있었다. 다음 토큰 예측 목적은 이런 선호를 포착하지 않았으므로 모델은 사람이 실제로 유용하다고 느끼는 방식에 맞춰 행동을 조정하도록 학습할 수 없었다.

전통적인 미세조정 접근은 이런 문제 일부를 다뤘지만 근본적인 한계가 있었다. 고품질 데이터셋의 지도 미세조정은 특정 과제의 성능을 개선할 수 있었지만, 원하는 출력으로 이루어진 데이터셋을 수작업으로 만들어야 했다. 가능한 모든 사용 사례를 포괄하는 데이터셋을 만드는 비용은 감당하기 어려우므로 이 접근은 잘 확장되지 않았다. 더구나 지도 미세조정은 문맥에 따라 달라지거나 명시적인 예시로 표현하기 어려운 미묘한 [인간 선호](/writing/rlhf-foundations-reinforcement-learning-human-preferences)를 쉽게 포함하지 못했다.

GPT-3 같은 모델의 [퓨샷 학습](/writing/gpt3-in-context-learning-emergent-capabilities-from-scale) 능력에도 정렬을 위한 한계가 있었다. 퓨샷 예시는 특정 상황에서 모델 행동을 이끌 수 있지만 인간 선호에 대한 모델의 근본적 정렬을 체계적으로 개선하지는 못했다. 상호작용마다 [효과적인 프롬프트](/writing/prompting-communicating-with-your-ai-agent)를 작성해야 했고, 모델 행동은 사용자 의도에 안정적으로 정렬되기보다 프롬프트 표현에 따라 달라졌다.

연구자들에게는 프롬프트 설계나 과제별 미세조정에 의존하지 않고 여러 문맥에서 인간 선호를 체계적으로 최적화할 방법이 필요했다. 도전은 사람의 피드백을 대규모로 학습하고, 도움·정확성·안전성에 관한 미묘한 선호를 모델의 핵심 행동에 포함하는 훈련 과정을 만드는 일이었다. InstructGPT가 개척한 3단계 [RLHF 과정](/writing/rlhf-pipeline-sft-reward-model-ppo-training)이 이 도전에 답했다.

## 해법

InstructGPT는 인간 피드백을 모델 최적화에 체계적으로 포함하는 3단계 훈련 과정으로 [정렬 문제](/writing/alignment-problem-hhh-framework-language-models)를 해결했다. 이 접근은 [인간 선호](/writing/rlhf-foundations-reinforcement-learning-human-preferences)를 이용한 선행 강화학습 연구를 토대로, 그 기법을 대규모 언어 모델에 맞게 조정했다. 세 단계는 함께 작동해 다음 토큰 예측만으로 훈련한 모델보다 인간 선호에 더 잘 맞는 모델을 만들었다.

### 1단계: 지도 미세조정

첫 단계에서는 인간 평가자가 작성한 고품질 프롬프트–응답 쌍 데이터셋을 수집했다. 평가자는 [GPT-3](/writing/gpt3-in-context-learning-emergent-capabilities-from-scale)에 [OpenAI API](/writing/using-a-language-model-in-code)를 통해 제출된 프롬프트를 받고, 원하는 행동을 보여 주는 이상적인 응답을 작성했다. 이를 통해 여러 요청 유형에서 도움이 되고 정확하며 적절한 형식의 출력이 어떤 모습인지 보여 주는 예시 데이터셋을 만들었다.

그다음 표준 언어 모델링 손실로 이 지도 데이터셋에 모델을 미세조정했다. 이 미세조정 단계는 사람이 유용하다고 생각하는 응답 유형을 인식하고 생성하도록 가르쳐, 지시 따르기 능력의 기준선을 세웠다. 모델은 질문에 직접 답하고, 명시적 형식 지시를 따르며, 어조와 세부 수준을 적절히 조정하는 패턴을 학습했다.

이 지도 미세조정 단계는 모델에 원하는 행동의 명시적 예시를 제공하므로 중요했다. 모델은 모호한 프롬프트에서 사용자가 원하는 것을 추론하기만 하는 대신, 유용하게 응답하는 방법을 명확한 시연으로 보았다. 이 데이터셋에 여러 프롬프트가 포함돼 모델은 특정 응답을 외우는 데 그치지 않고 새로운 프롬프트로 전이될 수 있는 도움 행동의 일반 패턴을 학습했다.

### 2단계: 보상 모델링

두 번째 단계에서는 인간이 주어진 모델 출력을 얼마나 선호할지 예측하는 별도의 [보상 모델](/writing/reward-modeling-rlhf-architecture-training)을 훈련했다. 이 보상 모델을 만들기 위해 같은 프롬프트에 대해 모델이 생성한 여러 출력을 인간 평가자에게 보여 주었다. 평가자는 도움·정확성·안전성 같은 기준으로 이 출력들의 순위를 최선에서 최악까지 매겼다. 이를 통해 가능한 여러 출력의 [쌍별 비교](/writing/human-preference-data-collection-rlhf-alignment) 자료, 곧 출력 사이의 [인간 선호](/writing/rlhf-foundations-reinforcement-learning-human-preferences)를 보여 주는 자료가 만들어졌다.

보상 모델은 이 인간 선호를 예측하도록 훈련돼, 사람이 출력을 얼마나 선호하는지에 따라 점수를 매기는 법을 학습했다. 이 모델은 지도 미세조정만으로 쉽게 포착할 수 없는 출력 품질의 미묘한 측면을 부호화했다. 간결하지만 불완전한 답보다 종합적인 설명이 더 선호된다거나, 기술적으로는 맞지만 부적절한 응답은 더 낮은 점수를 받아야 한다는 점을 알아볼 수 있었다.

절대 점수가 아니라 쌍별 비교로 보상 모델을 훈련한 것은 중요했다. 사람은 절대적 품질 점수를 부여하는 것보다 출력을 비교하는 일을 일반적으로 더 잘하며, 비교가 더 신뢰할 수 있고 덜 주관적이기 때문이다. [보상 모델](/writing/reward-modeling-rlhf-architecture-training)은 새로운 프롬프트와 출력으로 일반화할 수 있는 패턴을 학습해, 강화학습 중 모델이 생성할 응답에 점수를 매길 수 있었다.

### 3단계: 인간 피드백 강화학습

마지막 단계에서는 보상 모델을 이용한 강화학습으로 미세조정 모델의 출력을 최적화했다. 모델은 프롬프트에 대한 응답을 생성하고 보상 모델은 이 응답에 점수를 매겼다. 이어 높은 보상 점수를 받은 출력을 생성할 확률이 커지도록 모델 매개변수를 갱신했다. 보상 모델에 부호화된 [인간 선호](/writing/rlhf-foundations-reinforcement-learning-human-preferences)를 향해 모델 정렬을 반복적으로 개선하는 과정이었다.

강화학습 과정은 언어 모델 훈련에 맞게 조정된 [근접 정책 최적화](/writing/ppo-algorithm-proximal-policy-optimization-reinforcement-learning)(PPO) 알고리즘을 사용했다. PPO는 한 번의 갱신에서 모델 정책이 지나치게 크게 바뀌지 않게 해 훈련 안정성을 유지했다. 이 알고리즘은 새로운 응답 패턴의 탐색과 이미 알려진 고보상 행동의 활용 사이에서 균형을 잡아, 사람이 선호하는 출력을 향해 모델을 점진적으로 이동시켰다.

이 단계의 핵심 도전은 모델이 실제 도움을 개선하지 않고 ‘[보상 해킹](/writing/reward-hacking-rlhf-optimization-language-models)’, 곧 [보상 모델](/writing/reward-modeling-rlhf-architecture-training)의 허점을 이용해 높은 점수만 받는 일을 막는 것이었다. [KL 발산](/writing/kl-divergence-penalty-rlhf-training) 패널티 같은 기법은 미세조정 모델과 원래 [사전 학습 모델](/writing/transfer-learning-nlp-pre-training-fine-tuning)의 유사성을 유지해, 인간 선호를 최적화하면서도 원래 능력에서 너무 멀리 벗어나지 않도록 했다.

3단계 과정은 서로 상승 작용을 했다. 지도 미세조정은 도움 행동의 기준선을 세웠다. 보상 모델은 [인간 선호](/writing/rlhf-foundations-reinforcement-learning-human-preferences)를 인식하고 수치화하는 법을 학습했다. 강화학습은 이 선호를 최대화하는 출력을 만들도록 모델을 최적화했다. 세 단계가 함께 작동해 사람이 실제로 원하는 것에 체계적으로 더 잘 맞는 모델을 만들었다.

## 응용과 영향

InstructGPT는 [인간 선호](/writing/rlhf-foundations-reinforcement-learning-human-preferences)에 맞추는 데 [GPT-3](/writing/gpt3-in-context-learning-emergent-capabilities-from-scale)보다 상당한 개선을 보였다. 인간 평가자는 여러 과제에서 InstructGPT 출력을 일관되게 선호했고, 더 도움이 되고 정확하며 적절하다고 평가했다. 이 개선은 특정 과제 유형에 국한되지 않고 [질의응답](/writing/ibm-watson-jeopardy-open-domain-question-answering-nlp-information-retrieval), 요약, [코드 생성](/writing/codex-ai-assisted-code-generation-transformation-software-development), 창작 글쓰기 등 여러 응용에서 나타났다.

이 연구는 모델 능력을 희생하지 않고 RLHF가 정렬을 개선할 수 있음을 보여 주었다. InstructGPT 모델은 표준 언어 모델링 벤치마크에서 강한 성능을 유지하면서도 사람이 유의미하게 선호하는 출력을 만들었다. 이는 안전과 [선호 최적화](/writing/dpo-direct-preference-optimization-concept-llm-alignment)가 모델 성능을 낮출 수 있다는 우려에 답하며, 정렬 개선이 일반 능력을 대가로 하지 않았음을 보여 주었다.

InstructGPT에서 개발된 방법론은 곧 대화형 AI 시스템 훈련의 표준 접근이 됐다. 3단계 [RLHF 파이프라인](/writing/rlhf-pipeline-sft-reward-model-ppo-training)은 다른 연구 집단과 기업이 채택하는 틀이 됐고, 핵심 체계 위에 변형과 개선이 쌓였다. 이 기법은 여러 모델 규모와 아키텍처에 적용할 수 있음이 드러나 기반 모델과 함께 정렬 방법론도 확장될 수 있음을 보여 주었다.

실제 배포는 InstructGPT의 개선에서 즉시 혜택을 받았다. 정렬된 모델은 사용자 기대와 선호에 더 잘 맞아 사용자 대상 응용에 더 적합했다. 해로운 내용을 만들 가능성은 낮고, 부적절한 요청을 적절히 거절할 가능성은 높으며, 정확하고 유용한 응답을 더 잘 제공했다. 이런 개선은 사전 학습 모델만으로 가능했던 것보다 더 넓은 응용에서 언어 모델을 실용적으로 만들었다.

이 연구는 모델 평가를 생각하는 방식에도 영향을 주었다. InstructGPT 연구는 자동 지표나 [벤치마크](/writing/glue-superglue-standardized-evaluation-language-understanding) 성능에만 의존하지 않고, 정렬을 측정하는 직접 인간 평가의 가치를 보여 주었다. [인간 선호](/writing/human-preference-data-collection-rlhf-alignment) 평정은 전통적 지표를 보완하며 자동 측정이 포착하지 못하는 통찰을 제공하는 모델 평가의 표준 구성요소가 됐다.

InstructGPT를 위해 개발된 자료 수집과 주석 과정도 더 넓은 분야에 영향을 주었다. 고품질 지도 미세조정 데이터셋을 만들고 신뢰할 수 있는 인간 선호 자료를 수집하는 일은 정렬 모델 훈련의 핵심 요소로 인정받게 됐다. 이 연구에서 개발된 프롬프트 설계, 응답 작성, 선호 주석 기법은 이후의 언어 모델 정렬용 데이터셋 생성 연구에 정보를 제공했다.

InstructGPT의 성공은 [RLHF](/writing/rlhf-foundations-reinforcement-learning-human-preferences)를 대규모로 적용할 수 있음도 보여 주었다. 인간 피드백 수집, 보상 모델 훈련, 강화학습 실행에는 상당한 자원이 필요했지만 정렬 개선은 이 비용을 정당화했다. 이 검증은 인간 피드백 수집과 RLHF 기반 시설에 더 큰 투자를 가능하게 해 이후 더 유능한 정렬 모델을 위한 무대를 마련했다.

## 한계

성과에도 불구하고 InstructGPT 접근에는 몇 가지 중요한 한계가 있었다. 훈련 데이터셋을 만들고 선호 비교를 수집하려면 많은 인간 노동이 필요했다. 반복할 때마다 새 인간 주석이 필요하므로 [RLHF](/writing/rlhf-foundations-reinforcement-learning-human-preferences)를 확장하는 비용은 컸다. 피드백 수집에 드는 비용과 시간은 모델 개발의 병목을 만들고, 새로운 피드백으로 모델을 갱신할 수 있는 빈도를 제한했다.

인간 피드백의 품질과 일관성도 달라 안정적인 보상 모델 훈련을 어렵게 했다. 무엇이 ‘좋은’ 출력인지에 관해 평가자마다 선호나 기준이 달라 잡음이 섞인 훈련 신호가 생길 수 있었다. 여러 평가자의 판단을 집계하는 기법이 도움이 됐지만 인간 판단의 차이는 근본적인 도전으로 남았다. 이 차이는 모델이 경계 사례나 모호한 요청을 다루는 방식의 불일치로 이어질 수도 있었다.

[보상 모델](/writing/reward-modeling-rlhf-architecture-training)은 유한한 인간 비교 자료에서 학습했으므로 훈련 중 본 예시 분포 안에서만 인간 선호를 근사할 수 있었다. 훈련 자료와 매우 다른 프롬프트나 출력에 대해서는 보상 모델 예측이 [인간 선호](/writing/rlhf-foundations-reinforcement-learning-human-preferences)를 정확히 반영하지 못할 수 있었다. 이 한계 때문에 정렬된 모델도 새로운 문맥에서 정렬되지 않은 출력을 만들 수 있었다.

[RLHF 과정](/writing/rlhf-pipeline-sft-reward-model-ppo-training)은 목적 명세 문제도 완전히 해결하지 못했다. 사람의 선호는 서로 충돌하거나 시간에 따라 변할 수 있었다. 사용자 집단마다 출력 품질의 서로 다른 측면을 중시할 수 있어 모두를 만족하는 모델을 만들기는 어려웠다. 이 과정은 인간 선호의 집계값을 최적화했는데, 특정 문맥에서 개인 사용자의 선호와 맞지 않을 수 있었다.

RLHF 훈련의 계산 비용은 상당했다. 대규모 언어 모델에 강화학습을 실행하려면 상당한 계산 자원이 필요해 과정이 비싸고 오래 걸렸다. 이로 인해 모델 갱신 빈도가 제한됐고, 서로 다른 [보상 모델](/writing/reward-modeling-rlhf-architecture-training) 아키텍처나 훈련 절차를 실험하는 비용도 컸다.

또한 3단계 과정은 단계 사이에 의존성을 만들어 실패 양상으로 이어질 수 있었다. 지도 미세조정 데이터셋에 편향이나 한계가 있으면 후속 단계로 전파됐다. 보상 모델에 체계적 오류가 있으면 강화학습 중 증폭됐다. 각 단계는 신중히 실행해야 했고 앞 단계의 문제를 뒤 단계에서 고치기는 어려울 수 있었다.

이 접근은 모든 정렬 문제를 포괄적으로 다루지도 못했다. [RLHF](/writing/rlhf-foundations-reinforcement-learning-human-preferences)로 훈련한 모델도 여전히 편향된 출력을 만들고, 정보를 환각하고, 훈련 자료에 포착되지 않은 방식으로 실패할 수 있었다. RLHF가 정렬을 크게 개선했지만 [정렬 문제](/writing/alignment-problem-hhh-framework-language-models)를 완전히 해결하지는 못했으며 지속적인 연구와 개선의 여지를 남겼다.

## 유산과 전망

InstructGPT는 [RLHF](/writing/rlhf-foundations-reinforcement-learning-human-preferences)를 대규모 언어 모델을 인간 선호에 맞추는 표준 방법으로 확립해 오늘날에도 분야를 지배하는 패러다임을 만들었다. 3단계 훈련 과정은 사실상 모든 주요 후속 언어 모델 공개가 따를 틀이 됐고, 그 기초 체계 위에 변형과 개선이 쌓였다. 이 연구는 체계적인 정렬 최적화가 가능하고 실용적임을 보여 주며, 정렬을 연구 목표에서 모델 훈련 파이프라인의 표준 구성요소로 바꾸었다.

이 연구의 영향은 RLHF가 분야 전반에 널리 채택된 데서 드러난다. [ChatGPT](/writing/chatgpt-conversational-ai-becomes-mainstream), [GPT-4](/writing/gpt4-multimodal-language-models-reach-human-level-performance), Claude를 비롯한 여러 언어 모델은 모두 InstructGPT에서 개발된 RLHF 방법론의 변형을 사용한다. 이 기법은 너무나 표준적이어서 새 모델 공개에는 RLHF 훈련이 포함되리라 기대되고, 평가 벤치마크는 핵심 지표로 [인간 선호](/writing/human-preference-data-collection-rlhf-alignment) 정렬을 일상적으로 평가한다.

이 방법론은 연구자가 정렬을 더 넓게 생각하는 방식에도 영향을 주었다. InstructGPT는 정렬이 자료 선별이나 출력 후처리만의 문제가 아니라 인간 피드백에 근거한 명시적 훈련 최적화를 필요로 함을 보여 주었다. 이 통찰은 안전성과 선호 정렬에 대한 분야의 접근을 반응적 선별에서 선제적 최적화로 옮겼다.

InstructGPT를 위해 개발된 인간 피드백 수집 기법도 더 넓은 분야에 영향을 주었다. 고품질 지도 시연과 신뢰할 수 있는 선호 비교를 수집하는 방법이 중요한 연구 영역이 됐고, 개선된 방법은 더 효율적이고 확장 가능한 피드백 수집을 가능하게 했다. 이 기법은 정교해지고 확장돼 갈수록 더 잘 정렬된 모델 개발을 지원했다.

이 연구는 모델 능력 평가에서 인간 평가의 중요성도 강조했다. 자동 벤치마크가 계속 가치 있었지만 InstructGPT 연구는 직접 [인간 선호](/writing/human-preference-data-collection-rlhf-alignment) 평정이 자동 지표로는 포착할 수 없는 중요한 통찰을 제공함을 보여 주었다. 인간 피드백을 강조한 흐름은 지속됐고, 사람의 피드백은 모델 개발과 평가에서 중심 역할을 맡게 됐다.

오늘날의 언어 모델 훈련 파이프라인은 [RLHF](/writing/rlhf-foundations-reinforcement-learning-human-preferences)를 표준 구성요소로 일상적으로 통합한다. 이 기법은 멀티모달 모델, [코드 생성](/writing/codex-ai-assisted-code-generation-transformation-software-development) 시스템, 전문 영역 응용으로 확장돼 광범위한 적용 가능성을 보여 주었다. [보상 모델링](/writing/reward-modeling-rlhf-architecture-training), 강화학습 알고리즘, 피드백 수집 방법의 개선은 InstructGPT의 토대 위에 쌓였지만 핵심 3단계 구조는 정렬 접근의 중심으로 남아 있다.

이 연구는 RLHF만으로 완전히 해결할 수 없는 정렬 문제에 관한 후속 연구의 무대도 마련했다. 보상 모델의 일반화, 다양한 사용자 집단의 선호 집계, [보상 해킹](/writing/reward-hacking-rlhf-optimization-language-models) 방지 같은 문제는 계속 활발한 연구 영역이다. 이 도전들은 InstructGPT가 달성한 수준을 넘어 정렬을 개선할 기회다.

2022년 InstructGPT의 개발은 대규모 언어 모델을 실용적이고 인간 가치에 정렬되게 만드는 결정적인 이정표였다. 이 연구는 체계적인 [선호 최적화](/writing/dpo-direct-preference-optimization-concept-llm-alignment)가 가능하고 효과적임을 보여 주어, 안전하고 유용하게 배포할 수 있는 대화형 AI 시스템 개발을 가능하게 했다. 기법은 진화하고 개선됐지만 훈련 중 모델을 [인간 선호](/writing/rlhf-foundations-reinforcement-learning-human-preferences)에 명시적으로 최적화해야 한다는 근본 통찰은 현대 언어 AI 개발의 중심으로 남아 있다.

이 돌파구는 지도 학습, [보상 모델링](/writing/reward-modeling-rlhf-architecture-training), 강화학습을 결합해 인간의 필요에 더 잘 부응하는 AI 시스템을 만드는 힘을 보여 준다. 이 연구는 정렬이 극복할 수 없는 도전이 아니라 신중한 공학과 체계적 최적화로 다룰 수 있는 기술 문제임을 보여 주었다. 이 토대는 오늘날 인간이 AI 시스템과 상호작용하는 방식을 만들어 가는, 갈수록 더 유능하고 정렬된 언어 모델의 개발을 계속 지지한다.
