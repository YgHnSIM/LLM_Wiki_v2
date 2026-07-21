# Flamingo: 게이트 교차 어텐션을 활용한 퓨샷 시각-언어 학습

원본 출처: https://mbrenndoerfer.com/writing/flamingo-few-shot-vision-language-learning-gated-cross-attention

---

과제별 미세 조정 없이도 여러 이미지-텍스트 과제에서 당시 최고 수준의 성능을 달성한 획기적인 퓨샷 시각-언어 모델, DeepMind의 Flamingo를 다루는 종합 안내서다. 게이트 교차 어텐션(gated cross-attention) 메커니즘과 멀티모달 환경의 퓨샷 학습, 그리고 Flamingo가 현대 AI 시스템에 끼친 영향을 살펴본다.

## 2022년: Flamingo

2022년에 공개된 DeepMind의 Flamingo는 과제별 미세 조정 없이도 여러 이미지-텍스트 과제에서 당시 최고 수준의 성능을 달성할 수 있음을 보여주며 퓨샷 시각-언어 학습의 돌파구를 마련했다. 이 모델은 혁신적인 게이트 [교차 어텐션](/writing/cross-attention-encoder-decoder-transformers) 메커니즘으로 시각 정보와 텍스트 정보를 효과적으로 결합해 멀티모달 AI 시스템의 새로운 기준을 세웠다. Flamingo의 성공은 다양한 이미지-텍스트 데이터를 이용한 대규모 사전학습이 강력한 [퓨샷 학습](/writing/gpt3-in-context-learning-emergent-capabilities-from-scale) 역량을 가능하게 할 수 있음을 보여주었다. 이는 이후 여러 [시각-언어](/writing/clip-contrastive-language-image-pretraining-multimodal) 모델의 발전에 영향을 주었고 멀티모달 AI 연구의 새로운 패러다임을 확립했다.

2022년 무렵 멀티모달 AI 분야는 상당한 진전을 이루고 있었다. CLIP은 시각 표현과 언어 표현을 정렬하는 대조 학습의 위력을 보여주었다. GPT-3는 텍스트 과제에서 뛰어난 퓨샷 학습 역량을 입증했다. 비전 트랜스포머(Vision Transformer)는 이미지 이해에 효과적임이 확인되었다. 그러나 이러한 발전을 하나의 시스템으로 결합해 다양한 시각-언어 과제를 퓨샷 방식으로 수행하는 일은 여전히 어려웠다. 기존 접근법은 대부분 과제별 미세 조정이 필요했기 때문에 유연성이 제한되었고, 새로운 응용 분야마다 방대한 레이블 데이터를 요구했다.

Flamingo는 더 유연하고 유능한 시각-언어 시스템을 만들려는 DeepMind의 연구에서 탄생했다. Jean-Baptiste Alayrac을 비롯한 연구진은 퓨샷 시각-언어 학습을 실현하려면 대규모 언어 모델이 보여준 [퓨샷 학습](/writing/gpt3-in-context-learning-emergent-capabilities-from-scale) 역량을 유지하면서 시각 정보와 텍스트 정보를 매끄럽게 통합할 수 있는 아키텍처가 핵심이라고 보았다. 이들이 제안한 접근법은 동결된 사전학습 비전 인코더와 언어 모델에 새로운 구성 요소를 결합해, 게이트 [교차 어텐션](/writing/cross-attention-encoder-decoder-transformers) 메커니즘을 통한 효과적인 [교차 모달](/writing/multimodal-integration-unified-architectures-cross-modal-ai-understanding) 상호작용을 가능하게 했다.

Flamingo가 등장한 시점은 특히 의미가 컸다. GPT-3의 문맥 내 학습(in-context learning)이 성공하면서 대규모 언어 모델은 경사도 기반 미세 조정 없이도 [퓨샷 프롬프팅](/writing/in-context-learning-llm-examples)을 통해 새로운 과제에 적응할 수 있음이 드러났다. 연구자들은 이 역량을 멀티모달 환경으로 확장하는 방법을 모색하고 있었다. 동시에 대규모 이미지-텍스트 데이터셋을 이용할 수 있게 되었고, 거대 모델 훈련에 필요한 계산 자원에 대한 접근성도 높아지고 있었다. Flamingo는 이러한 흐름이 교차하는 지점에서 시각과 언어를 아우르는 퓨샷 학습이 어떻게 작동할 수 있는지 보여주었다.

Flamingo의 폭넓은 의의는 기술적 성과에만 머물지 않았다. 이 모델은 언어 모델에서 강력함이 입증된 퓨샷 학습을 멀티모달 과제로도 효과적으로 확장할 수 있음을 보여주었다. 과제별 훈련 데이터를 수집하는 데 큰 비용이 들거나 수집 자체가 비현실적인 실제 응용에서는 이러한 역량이 매우 중요했다. Flamingo의 아키텍처와 훈련 방식은 이후의 [시각-언어](/writing/clip-contrastive-language-image-pretraining-multimodal) 모델에 영향을 주었으며, 방대한 과제별 훈련 없이 다양한 과제를 처리하는 시스템을 설계하는 방법을 제시했다.

## 문제

전통적으로 [시각-언어](/writing/clip-contrastive-language-image-pretraining-multimodal) 과제를 처리하려면 과제마다 별도의 모델을 훈련하거나, 범용 모델을 특정 응용 분야에 맞추기 위해 과제별 미세 조정을 수행해야 했다. 이 접근법은 자원을 많이 소모했고, 특정 과제에는 특화되었지만 새로운 과제나 도메인을 다룰 유연성이 부족한 모델을 낳는 경우가 많았다. 이미지 캡셔닝, 시각적 [질의응답](/writing/ibm-watson-jeopardy-open-domain-question-answering-nlp-information-retrieval), 이미지 분류를 연구하려면 일반적으로 과제별 레이블 데이터를 대량으로 수집하고, 과제마다 훈련 절차를 세심하게 조정하며, 응용 분야별로 별도 모델이나 미세 조정 버전을 관리해야 했다.

이러한 유연성 부족은 [퓨샷 학습](/writing/gpt3-in-context-learning-emergent-capabilities-from-scale) 환경에서 특히 문제가 되었다. 기존 시각-언어 모델은 예시가 몇 개뿐인 새로운 과제에 적응하는 데 어려움을 겪었고, 좋은 성능을 내려면 과제별 훈련 데이터가 대량으로 필요했다. 이미지 캡셔닝용으로 훈련된 모델을 시각적 질의응답에 적용하려면 광범위한 재훈련이 필요했다. 특정 시각 도메인용 시스템은 새로운 도메인으로 일반화하지 못하는 경우가 많았다. 이러한 한계 때문에 레이블 데이터가 부족하거나 요구 사항이 빠르게 바뀌는 응용 분야에 [시각-언어](/writing/clip-contrastive-language-image-pretraining-multimodal) 시스템을 배포하기가 어려웠다.

시각 정보와 텍스트 정보를 효과적으로 결합하는 일도 근본적인 과제였다. 기존 접근법은 대부분 시각 특징과 텍스트 특징을 단순히 이어 붙이거나 특정 응용 분야를 위해 설계한 과제별 아키텍처를 사용했다. 이런 접근법은 시각 양식과 텍스트 양식 사이의 풍부한 상호작용을 포착하기 어려웠기 때문에, 모델이 눈으로 본 내용과 텍스트로 묘사된 내용 사이의 복잡한 관계를 이해하는 데 한계가 있었다. 과제의 요구 사항에 따라 두 양식의 관련 부분에 유연하게 주의를 기울이는 아키텍처를 어떻게 설계할 것인지는 대부분 미해결 문제로 남아 있었다.

언어 모델의 [퓨샷 학습](/writing/gpt3-in-context-learning-emergent-capabilities-from-scale)과 시각-언어 과제 사이의 단절은 또 다른 문제를 낳았다. GPT-3를 비롯한 대규모 언어 모델은 프롬프트에 제공된 문맥 내 예시를 통해 새로운 과제에 적응하는 놀라운 퓨샷 학습 역량을 보여주었다. 이 역량을 [시각-언어](/writing/clip-contrastive-language-image-pretraining-multimodal) 과제로 확장하려면 비전 인코더를 단순히 추가하는 데서 그치지 않고, 시각 정보를 효과적으로 통합하면서 퓨샷 학습의 특성을 보존하는 아키텍처가 필요했다. 비전 구성 요소와 언어 구성 요소를 단순히 이어 붙이면 대규모 언어 모델을 유연하게 만드는 퓨샷 학습 역량이 흔히 훼손되었다.

새로운 과제나 도메인에 빠르게 적응해야 하는 응용 분야에서는 이 문제가 특히 심각했다. [콘텐츠 조정](/writing/content-safety-and-moderation-ai-agents) 시스템은 새로운 유형의 부적절한 콘텐츠를 이해해야 할 수 있다. 보조 기술 응용 프로그램은 서로 다른 유형의 시각 장면이나 사용자 요구에 적응해야 할 수 있다. 연구 도구는 시각 질의와 텍스트 질의의 새로운 조합을 처리해야 할 수 있다. 새로운 응용 분야마다 광범위한 레이블 데이터와 과제별 훈련을 요구하는 전통적 접근법으로는 이러한 요구를 효율적으로 충족할 수 없었다.

## 해결책

Flamingo는 과제별 미세 조정 없이도 여러 [시각-언어](/writing/clip-contrastive-language-image-pretraining-multimodal) 과제를 처리할 수 있는 단일 모델 아키텍처를 설계해 이러한 한계를 해결했다. 이 아키텍처의 핵심은 시각 양식과 텍스트 양식의 효과적인 상호작용을 가능하게 하면서 [퓨샷 학습](/writing/gpt3-in-context-learning-emergent-capabilities-from-scale) 역량을 보존하는 새로운 게이트 [교차 어텐션](/writing/cross-attention-encoder-decoder-transformers) 메커니즘이었다. 동결된 사전학습 비전 인코더와 언어 모델에 새로운 구성 요소를 결합하고, 시각 토큰과 텍스트 토큰을 교차 배치해 유연한 [교차 모달](/writing/multimodal-integration-unified-architectures-cross-modal-ai-understanding) 상호작용을 구현했다.

핵심 혁신인 게이트 교차 어텐션 메커니즘은 과제 요구 사항에 따라 시각 입력과 텍스트 입력의 서로 다른 부분에 선택적으로 주의를 기울일 수 있게 했다. 단순 결합이나 고정된 융합 방식과 달리, 게이트 메커니즘을 사용하면 모델이 퓨샷 학습 과정에서 과제별 어텐션 패턴을 학습할 수 있었다. 그 결과 광범위한 미세 조정 없이도 새로운 과제에 빠르게 적응할 수 있었다. 또한 게이트 메커니즘은 특정 과제에 [과적합](/writing/statistical-modeling-overfitting-underfitting-bias-variance-tradeoff)되는 것을 막아 모델의 일반화 역량을 향상하는 데 도움을 주었다.

이 아키텍처는 몇 가지 핵심 구성 요소로 이루어졌다. Flamingo는 동결된 비전 인코더로 이미지를 처리해 일련의 시각 토큰으로 변환했다. 동결된 언어 모델은 텍스트 입력을 처리하면서 [퓨샷 학습](/writing/gpt3-in-context-learning-emergent-capabilities-from-scale) 역량을 유지했다. 두 구성 요소 사이에는 시각 토큰을 압축하는 특별한 퍼시버 리샘플러(Perceiver Resampler) 모듈과 시각 토큰과 텍스트 토큰을 교차 배치하는 새로운 [트랜스포머](/writing/transformer-attention-is-all-you-need) 층이 삽입되었다. 이 트랜스포머 구성 요소의 게이트 [교차 어텐션](/writing/cross-attention-encoder-decoder-transformers) 층은 언어 토큰이 시각 토큰을 참조할 수 있게 하여, 모델이 언어 모델의 추론 과정에 시각 정보를 통합하도록 했다.

### 동결된 사전학습 구성 요소

Flamingo의 아키텍처는 동결된 사전학습 비전 인코더와 언어 모델을 전략적으로 사용하고, 교차 모달 상호작용에 필요한 곳에만 새로운 훈련 가능 구성 요소를 추가했다. 이 설계는 언어 모델의 퓨샷 학습 역량을 보존하면서도 효과적인 시각-언어 이해를 가능하게 했다. 모든 구성 요소를 처음부터 훈련하는 것보다 효율적이었으며, 동결된 구성 요소를 전략적으로 활용하면 강력한 멀티모달 역량을 구현할 수 있음을 보여주었다.

훈련 과정에서는 대규모 이미지-텍스트 데이터를 활용해 효과적인 [교차 모달](/writing/multimodal-integration-unified-architectures-cross-modal-ai-understanding) 상호작용을 학습했다. Flamingo는 이미지와 그에 대응하는 텍스트 설명을 섞어, 추론 때 퓨샷 예시가 제공되는 형식과 비슷하게 구성한 방대한 이미지-텍스트 시퀀스 데이터셋으로 훈련되었다. 모델은 이러한 시퀀스를 처리하면서 텍스트 설명을 생성하거나 이미지에 관한 질문에 답할 때 시각 정보의 어느 부분에 주의를 기울여야 하는지 학습했다. 이 훈련 방식 덕분에 모델은 퓨샷 예시를 바탕으로 서로 다른 과제의 요구 사항에 적응할 수 있는 유연한 어텐션 패턴을 개발할 수 있었다.

게이트 [교차 어텐션](/writing/cross-attention-encoder-decoder-transformers) 메커니즘은 [퓨샷 학습](/writing/gpt3-in-context-learning-emergent-capabilities-from-scale)에서 특히 중요했다. 새로운 과제의 예시를 몇 개 제공하면 모델은 시각 정보에 어떻게 주의를 기울일지를 안내하는 과제별 어텐션 패턴을 학습할 수 있었다. 예를 들어 시각적 [질의응답](/writing/ibm-watson-jeopardy-open-domain-question-answering-nlp-information-retrieval) 과제에서는 질문과 관련된 이미지의 특정 영역에 더 많이 주의를 기울이는 법을 학습할 수 있었다. 이미지 캡셔닝 과제에서는 시각 콘텐츠를 묘사하는 데 필요한 다른 어텐션 패턴을 학습할 수 있었다. 게이트 메커니즘은 이러한 유연성을 제공하면서 언어 모델의 퓨샷 학습 역량을 파괴할 수 있는 파국적 간섭(catastrophic interference)을 방지했다.

이 모델의 아키텍처는 단일 이미지와 다중 이미지 시나리오를 모두 유연하게 처리하도록 설계되었다. Flamingo는 텍스트 사이에 여러 이미지가 배치된 시퀀스를 처리할 수 있었기 때문에 시각적 스토리텔링, 다중 이미지 질의응답, 텍스트 질의에 따른 이미지 비교 같은 과제를 수행할 수 있었다. 이러한 유연성 덕분에 여러 이미지가 포함되거나 시각 콘텐츠 사이의 관계를 이해해야 하는 폭넓은 응용 분야에 활용할 수 있었다.

## 응용과 영향

Flamingo의 역량은 유연성과 퓨샷 적응이 필요한 [시각-언어](/writing/clip-contrastive-language-image-pretraining-multimodal) 응용 분야에 새로운 가능성을 열었다. 가장 인상적인 성과 가운데 하나는 다양한 벤치마크에서 [퓨샷 학습](/writing/gpt3-in-context-learning-emergent-capabilities-from-scale) 과제를 수행한 결과였다. Flamingo는 시각적 [질의응답](/writing/ibm-watson-jeopardy-open-domain-question-answering-nlp-information-retrieval), 이미지 캡셔닝, 이미지 분류 등의 과제에서 당시 최고 수준이거나 그에 견줄 만한 성능을 달성했다. 입력 프롬프트에서 과제별 예시를 몇 개만 보았는데도, 해당 과제에 맞게 미세 조정된 모델의 성능과 대등하거나 이를 넘어서는 경우가 많았다.

레이블이 붙은 훈련 데이터를 수집하기에 비용이 너무 많이 들거나 수집 자체가 비현실적인 응용 분야에서는 모델의 퓨샷 학습 역량이 특히 유용했다. 의료 영상 응용 프로그램은 새로운 유형의 질환이나 영상 촬영 양식에 적응해야 할 수 있다. 접근성 도구는 사용자 요구에 따라 다양한 시각 장면을 이해해야 할 수 있다. 연구용 응용 프로그램은 시각 질의와 텍스트 질의의 새로운 조합을 처리해야 할 수 있다. Flamingo는 예시 몇 개만으로 이러한 상황에 적응할 수 있었으므로, 원래라면 광범위한 데이터 수집과 모델 재훈련이 필요했을 응용 분야에서도 실용적으로 사용할 수 있었다.

### 실제 환경의 퓨샷 학습

Flamingo의 퓨샷 학습은 GPT-3가 텍스트 과제에서 퓨샷 예시를 사용한 방식과 유사하게 입력 프롬프트에 과제 예시를 제공하는 방식으로 작동했다. 모델은 경사도 기반 미세 조정 없이도 이러한 예시에서 과제별 패턴을 학습해 새로운 응용 분야에 빠르게 적응할 수 있었다. 이러한 역량은 레이블 데이터가 부족하거나 요구 사항이 빠르게 변하는 상황에서 특히 유용했다.

하나의 아키텍처로 여러 양식과 과제를 처리하는 모델의 역량은 과제마다 별도 모델을 훈련하는 것보다 효율적이고 실용적이었다. 실무자는 특화 모델을 여러 개 관리하는 대신 Flamingo 하나로 이미지 캡셔닝, 시각적 [질의응답](/writing/ibm-watson-jeopardy-open-domain-question-answering-nlp-information-retrieval), 시각 분류뿐 아니라 여러 이미지나 긴 시각-텍스트 시퀀스가 포함된 더 복잡한 과제까지 폭넓게 처리할 수 있었다. 이러한 통합 접근법은 여러 특화 시스템을 배포하는 데 따르는 계산 및 엔지니어링 부담을 줄였다.

Flamingo의 영향은 이후 [시각-언어](/writing/clip-contrastive-language-image-pretraining-multimodal) 모델의 발전으로 이어졌다. 특히 게이트 [교차 어텐션](/writing/cross-attention-encoder-decoder-transformers) 메커니즘과 동결된 사전학습 구성 요소를 사용하는 접근법을 비롯한 Flamingo의 아키텍처는 많은 후속 시스템에 영향을 주었다. 시각 토큰과 텍스트 토큰을 교차 배치하고 교차 어텐션으로 양식을 통합하는 발상은 멀티모달 AI 시스템의 일반적인 패턴이 되었다. Flamingo는 [퓨샷 학습](/writing/gpt3-in-context-learning-emergent-capabilities-from-scale)이 멀티모달 환경에서도 효과적으로 작동할 수 있음을 보여주었고, 이는 연구자들이 유연한 시각-언어 시스템의 설계에 접근하는 방식에 영향을 미쳤다.

이 모델의 성공은 대규모 멀티모달 훈련 데이터와 효과적인 [교차 모달](/writing/multimodal-integration-unified-architectures-cross-modal-ai-understanding) 상호작용 아키텍처의 중요성도 부각했다. 방대한 이미지-텍스트 데이터셋을 이용한 Flamingo의 훈련은 적절한 아키텍처와 결합된 규모 확장이 질적으로 새로운 역량을 가능하게 할 수 있음을 보여주었다. 다양한 시각 및 텍스트 콘텐츠에서 학습하는 모델의 역량은 여러 도메인과 과제로 일반화할 수 있게 했으며, 대규모 멀티모달 사전학습의 가치를 입증했다.

## 한계

Flamingo는 인상적인 역량을 보여주었지만 실용성을 제한하는 중요한 한계도 있었다. 대표적인 한계는 계산 자원 요구량이었다. Flamingo를 훈련하려면 막대한 계산 자원이 필요했고, 완성된 모델도 크기가 커서 배포 시 계산 비용이 많이 들었다. 이 모델은 [퓨샷 학습](/writing/gpt3-in-context-learning-emergent-capabilities-from-scale)을 지원해 광범위한 과제별 훈련을 피할 수 있었지만 초기 계산 비용은 높았다. 이는 소규모 조직이나 자원이 부족한 환경에 진입 장벽을 만들었다.

Flamingo의 퓨샷 학습 역량은 강력했지만, 매우 높은 정확도나 일관성이 필요한 응용 분야에서는 과제별 미세 조정만큼 늘 신뢰할 만하지는 않았다. Flamingo는 퓨샷 예시를 통해 새로운 과제에 적응할 수 있었으나, 제공된 예시의 품질과 관련성에 따라 성능이 달라지는 경우가 있었다. 이러한 변동성 때문에 안전이 중요한 응용 분야나 일관되고 정확한 성능이 필수적인 상황에는 적합성이 떨어졌다.

### 계산 자원 요구량

대규모 비전 인코더와 언어 모델을 결합한 Flamingo의 아키텍처는 훈련과 추론 모두에 상당한 계산 자원을 요구했다. 모델의 크기와 복잡성은 특히 실시간 성능이 필요하거나 자원이 제한된 장치에 배포해야 하는 응용 분야에서 접근성을 제약했다. 이러한 한계는 실제 응용에서 누가 이런 모델을 훈련하고 배포하고 사용할 수 있는지에도 영향을 주었다.

또 다른 한계는 모델이 퓨샷 예시의 품질과 다양성에 의존한다는 점이었다. 모델 성능은 과제를 명확히 보여주는 적절한 예시를 제공하는지에 달려 있었다. 잘못 선택하거나 혼란스럽게 구성한 예시는 성능 저하로 이어질 수 있었다. 예시 품질에 대한 이러한 의존성 때문에 사용자는 효과적인 퓨샷 프롬프트를 구성하는 방법을 어느 정도 이해해야 했으며, 이는 비전문가에게 진입 장벽이 되었다.

이 모델은 세밀한 시각 정보와 공간 관계를 이해하는 데도 한계가 있었다. Flamingo는 높은 수준의 시각 이해 과제를 효과적으로 처리할 수 있었지만 정밀한 공간 추론, 정확한 물체 수 세기, 매우 세밀한 시각 정보 이해에는 때때로 어려움을 겪었다. 정확한 위치 파악이나 상세한 시각 분석이 필요한 과제는 이 모델에 까다로울 수 있었고, 이 때문에 일부 도메인에는 적용하기 어려웠다.

Flamingo의 아키텍처는 유연했지만 기본적으로 시각 정보와 텍스트 정보를 특정 패턴으로 교차 배치하는 데 맞춰 설계되었다. 양식 간에 매우 다른 상호작용 패턴이 필요하거나 특정 응용 분야를 위한 특수 아키텍처가 요구되는 과제는 Flamingo의 프레임워크에 잘 맞지 않을 수 있었다. 이 모델의 설계 절충은 과제별 최적화보다 유연성과 [퓨샷 학습](/writing/gpt3-in-context-learning-emergent-capabilities-from-scale)을 우선했으므로, 특수 아키텍처가 유리한 응용 분야에서는 성능이 제한될 수 있었다.

## 유산과 미래

Flamingo의 영향은 당장의 응용 분야를 훨씬 넘어 멀티모달 AI 시스템의 [퓨샷 학습](/writing/gpt3-in-context-learning-emergent-capabilities-from-scale)에 새로운 패러다임을 확립했다. 이 모델은 대규모 언어 모델에서 강력함이 입증된 퓨샷 학습을 적절한 아키텍처를 통해 [시각-언어](/writing/clip-contrastive-language-image-pretraining-multimodal) 과제로도 효과적으로 확장할 수 있음을 보여주었다. 이 통찰은 광범위한 과제별 훈련 없이 새로운 과제에 적응하는 시스템의 설계 방법을 제시하며 이후 많은 시각-언어 모델의 발전에 영향을 미쳤다.

Flamingo가 남긴 가장 지속적인 영향 가운데 하나는 게이트 [교차 어텐션](/writing/cross-attention-encoder-decoder-transformers)과 시각·텍스트 요소를 교차 배치하는 멀티모달 아키텍처를 시각-언어 시스템의 표준적 접근법으로 확립했다는 점이다. 특히 동결된 사전학습 구성 요소와 훈련 가능한 교차 어텐션 층을 결합한 이 모델의 아키텍처는 많은 후속 멀티모달 시스템의 본보기가 되었다. 연구자들은 이 접근법을 다양한 응용 분야에 맞게 변형하고 확장하면서 특정 도메인과 과제, 계산 자원 제약에 최적화한 변형 모델을 개발했다.

이 모델의 퓨샷 학습 성공은 연구자들이 멀티모달 모델의 설계와 훈련에 접근하는 방식에도 영향을 주었다. Flamingo는 동결된 사전학습 구성 요소를 전략적으로 활용하면 [퓨샷 학습](/writing/gpt3-in-context-learning-emergent-capabilities-from-scale) 같은 가치 있는 역량을 보존하면서 새로운 멀티모달 이해 역량도 구현할 수 있음을 보여주었다. 이 원리는 사전학습 비전 모델과 언어 모델을 결합한 후속 시스템의 발전에 영향을 미쳤고, 효과적인 멀티모달 AI를 구현하기 위해 모든 구성 요소를 처음부터 훈련할 필요는 없음을 입증했다.

Flamingo가 멀티모달 환경에서 퓨샷 학습을 입증한 일은 실용적인 배포 전략에도 영향을 주었다. 이 모델은 광범위한 재훈련 없이 문맥 내 예시를 통해 새로운 과제와 도메인에 적응하도록 시스템을 설계할 수 있음을 보여주었다. 이러한 역량은 실무자가 [시각-언어](/writing/clip-contrastive-language-image-pretraining-multimodal) 시스템의 배포에 접근하는 방식에 영향을 미쳤고, 변화하는 요구 사항에 맞춰 발전할 수 있는 더 유연하고 적응력 높은 응용 프로그램을 가능하게 했다.

앞으로 Flamingo의 영향은 더욱 유능한 멀티모달 [파운데이션 모델](/writing/foundation-models-report-defining-new-paradigm-ai)의 발전에서 확인할 수 있다. [GPT](/writing/gpt1-gpt2-autoregressive-pretraining-transfer-learning)-4V를 비롯한 대규모 멀티모달 모델은 Flamingo가 개척한 발상을 토대로 더 복잡한 과제와 더 긴 문맥으로 역량을 확장했다. Flamingo가 보여준 [퓨샷 학습](/writing/gpt3-in-context-learning-emergent-capabilities-from-scale) 패러다임은 현대 멀티모달 시스템에 기대되는 표준 역량이 되었으며, 새로운 과제와 도메인에 유연하게 적응할 수 있게 했다.

Flamingo의 아키텍처와 훈련 방식은 효율적인 멀티모달 학습 연구에도 계속 영향을 미치고 있다. 동결된 사전학습 구성 요소를 활용한 Flamingo는 효과적인 멀티모달 이해를 달성하기 위해 모든 구성 요소를 훈련 가능 상태로 둘 필요는 없음을 보여주었다. 이 통찰은 매개변수 효율적 멀티모달 학습에 관한 후속 연구와, 최소한의 추가 훈련만으로 사전학습 모델을 효과적으로 결합하는 시스템의 개발에 영향을 주었다.

Flamingo의 한계 역시 후속 연구의 방향을 제시했다. 이 모델의 계산 자원 요구량은 더 효율적인 멀티모달 시스템 아키텍처와 훈련 방법을 연구하는 계기가 되었다. 퓨샷 학습 성능의 변동성은 더 신뢰할 수 있는 퓨샷 학습 기법과 퓨샷 예시를 선택하고 제시하는 더 나은 방법에 관한 연구를 촉진했다. 세밀한 시각 이해 능력의 한계는 이러한 간극을 보완할 수 있는 접근법으로 이어졌다.

Flamingo는 [시각-언어](/writing/clip-contrastive-language-image-pretraining-multimodal) 모델과 멀티모달 인공지능의 역사에서 중요한 이정표다. 다양한 이미지-텍스트 데이터를 이용한 대규모 사전학습에 적절한 아키텍처를 결합하면 강력한 [퓨샷 학습](/writing/gpt3-in-context-learning-emergent-capabilities-from-scale) 역량을 구현할 수 있음을 보여주었다. 게이트 [교차 어텐션](/writing/cross-attention-encoder-decoder-transformers) 메커니즘, 멀티모달 환경의 퓨샷 학습, 동결된 사전학습 구성 요소의 전략적 활용을 비롯한 이 모델의 혁신은 시각-언어 모델의 새로운 기준을 세웠다. Flamingo의 영향은 [파운데이션 모델](/writing/foundation-models-report-defining-new-paradigm-ai)부터 특화된 시각-언어 시스템까지 현대 멀티모달 AI 전반에서 확인할 수 있으며, AI 시스템이 퓨샷 학습을 통해 다양한 과제와 도메인에 유연하게 적응할 수 있는 방법을 보여주었다.
