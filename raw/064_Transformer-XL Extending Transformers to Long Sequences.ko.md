# Transformer-XL: 긴 시퀀스로 Transformer 확장하기

출처: https://mbrenndoerfer.com/writing/transformer-xl-long-sequences-segment-recurrence

---

세그먼트 수준 순환(segment-level recurrence)과 상대 위치 인코딩(relative positional encoding)을 통해 Transformer가 더 긴 시퀀스를 처리할 수 있게 한 아키텍처 혁신, Transformer-XL을 종합적으로 설명한다. 이 모델이 효율성을 유지하면서 문맥 길이를 어떻게 확장했고 현대 언어 모델에 어떤 영향을 미쳤는지 살펴본다.

## 2019년: Transformer-XL

2019년에 이르러 [Transformer](/writing/transformer-attention-is-all-you-need) 아키텍처는 자연어 처리를 혁신했으며, [BERT](/writing/bert-bidirectional-pretraining-revolutionizes-language-understanding)와 [GPT](/writing/gpt1-gpt2-autoregressive-pretraining-transfer-learning) 같은 모델이 다양한 과제에서 뛰어난 성능을 달성할 수 있게 했다. 그러나 연구자들은 근본적인 한계에 직면하고 있었다. 표준 Transformer는 긴 시퀀스를 처리하는 데 어려움을 겪었다. 이 아키텍처의 [어텐션 메커니즘](/writing/attention-mechanism-intuition-soft-lookup-weights-context-vectors)은 시퀀스 길이에 대해 이차 계산 복잡도를 지녔고, 원래 Transformer 설계에 사용된 고정 위치 인코딩은 훈련 중에 본 것보다 긴 시퀀스를 처리할 때 문제를 일으켰다. 문서 모델링, 장문 텍스트 생성, 긴 구절 전체의 문맥 이해처럼 장거리 의존성을 파악해야 하는 과제에서 표준 Transformer는 계산 비용이 많이 들거나 근본적으로 제약됐다.

Zihang Dai, Zhilin Yang, Yiming Yang, Jaime Carbonell, Quoc Le, Ruslan Salakhutdinov가 이끈 Google Brain과 Carnegie Mellon University의 연구자들은 고정 길이 문맥 창에 국한되는 Transformer의 특성이 여러 실용적 상황에 적용하는 데 중대한 장벽이라는 점을 인식했다. 문제는 계산 효율성만이 아니었지만, 계산 효율성도 중요했다. 더 깊은 문제는 표준 Transformer가 각 세그먼트를 독립적으로 처리하면서 이전 세그먼트의 모든 문맥을 잃는다는 점이었다. 긴 문서를 만나면 문서를 고정 길이 세그먼트로 나누고 각 세그먼트를 따로 처리했으며, 앞서 나온 내용을 기억하지 못했다. 이러한 아키텍처 제약 때문에 모델은 긴 문맥 전반에서 일관성을 유지하고 내용을 이해할 수 없었다.

2019년에 소개된 [Transformer-XL](/writing/recurrent-memory-transformer-xl-segment-recurrence)은 세그먼트 수준 순환과 상대 위치 인코딩이라는 두 가지 핵심 혁신으로 이러한 한계를 해결했다. 이 모델은 이전 세그먼트의 정보가 세그먼트 경계를 넘어 유지되게 하는 순환 메커니즘을 도입해, 세그먼트 길이보다 훨씬 긴 시퀀스에서도 문맥을 유지할 수 있게 했다. 이와 동시에 아키텍처는 절대 위치 인코딩을 상대 위치 인코딩으로 교체해, 모델이 훈련 중에 본 것보다 긴 시퀀스로 일반화할 수 있게 했다. 이러한 혁신 덕분에 Transformer-XL은 계산 효율성을 유지하면서 표준 Transformer보다 최대 몇 배 더 긴 시퀀스를 처리할 수 있었다.

Transformer-XL의 영향은 시퀀스 길이 처리 능력의 즉각적인 향상을 훨씬 넘어섰다. 이 모델은 적절한 아키텍처 변경을 갖추면 Transformer가 장거리 의존성을 효과적으로 모델링할 수 있음을 보여 주었다. 특히 [상대 위치 인코딩](/writing/relative-position-encoding-transformers) 방식은 이후 수많은 [Transformer](/writing/transformer-attention-is-all-you-need) 변형에 영향을 미쳤다. 더 긴 어텐션 창을 사용하는 [GPT-3](/writing/gpt3-in-context-learning-emergent-capabilities-from-scale)부터 [PaLM](/writing/palm-pathways-language-model-large-scale-training-reasoning), [LLaMA](/writing/llama-meta-open-foundation-models-democratized-language-ai-research) 같은 모델에 이르기까지, 긴 문맥을 처리하는 현대 언어 모델은 [Transformer-XL](/writing/recurrent-memory-transformer-xl-segment-recurrence)이 도입한 아이디어를 토대로 한다. 효율성을 유지하면서 문맥 길이를 확장하는 이 아키텍처의 접근법은 현대 장문 문맥 언어 모델의 토대가 되었다.

## 문제

2017년에 소개된 [Transformer](/writing/transformer-attention-is-all-you-need) 아키텍처는 순환 층을 자기 어텐션 메커니즘으로 대체해 [시퀀스 모델링](/writing/rnn-architecture-recurrent-neural-networks-guide)을 혁신했다. 이러한 변화는 병렬 처리를 가능하게 했고 여러 자연어 처리 과제에서 매우 효과적인 것으로 입증됐다. 그러나 긴 시퀀스를 다룰 때 이 아키텍처에는 내재적인 한계가 있었다. 연구자들이 문서 수준 이해, 장문 텍스트 생성, 긴 구절 전반의 일관성 유지처럼 확장된 문맥의 이해가 필요한 과제에 Transformer를 적용하려 하면서 이러한 한계는 점점 더 문제가 되었다.

가장 직접적인 문제는 계산 복잡도였다. Transformer의 자기 어텐션 메커니즘은 시퀀스의 모든 위치 쌍 사이에서 어텐션 점수를 계산해야 한다. 길이가 $n$인 시퀀스에서는 $n\times n$ 어텐션 행렬을 계산해야 하므로 시퀀스 길이에 대한 계산 복잡도는 이차인 $O(n^2)$이 된다. 훈련 중에는 어텐션 행렬을 저장해야 하므로 메모리 요구량도 이차로 증가한다. 시퀀스가 수백 토큰보다 길어지면 이 계산 비용은 감당하기 어려워진다. 초기 [Transformer](/writing/transformer-attention-is-all-you-need) 모델 가운데 [BERT](/writing/bert-bidirectional-pretraining-revolutionizes-language-understanding) 같은 모델은 512토큰 길이로 제한됐으며, 1024토큰으로 늘리는 데에도 상당한 계산 자원이 필요했다.

계산상의 제약을 넘어, 아키텍처에는 문맥 처리 방식과 관련된 더 근본적인 한계가 있었다. 표준 Transformer는 각 훈련 예시를 고정 길이 세그먼트로 처리한다. 긴 문서나 시퀀스를 다룰 때 모델은 입력을 일반적으로 512토큰이나 1024토큰인 고정 길이의 개별 세그먼트로 나눴다. 각 세그먼트는 독립적으로 처리됐으며 세그먼트 사이에는 어떤 정보도 흐르지 않았다. 따라서 세그먼트 시작 부분의 토큰은 이전 세그먼트의 문맥에 접근할 수 없었고, 세그먼트 끝부분의 토큰은 이후 세그먼트의 처리에 영향을 줄 수 없었다.

이러한 세그먼트 분할 접근법은 몇 가지 문제를 만들었다. 첫째, 모델은 세그먼트 경계를 가로지르는 모든 장거리 의존성을 잃었다. 문서 앞부분에 중요한 정보가 나타나고 훨씬 뒤에서 다시 언급되더라도 모델은 이 참조 관계를 연결할 수 없었다. 둘째, 모델은 세그먼트 사이에서 일관성을 유지할 수 없었다. 텍스트를 생성하거나 긴 문서를 처리할 때 세그먼트 경계마다 모델의 이해가 초기화되어 불일치와 문맥 손실이 생겼다. 셋째, 고정 세그먼트 길이는 문장이나 문단 같은 자연스러운 언어 단위와 맞지 않는 인위적인 경계를 만들어, 일관된 의미 단위를 중간에서 나눌 수 있었다.

표준 Transformer에 사용된 [위치 인코딩](/writing/sinusoidal-position-encoding-transformers-word-order) 방식은 추가적인 문제를 일으켰다. 원래 [Transformer](/writing/transformer-attention-is-all-you-need) 아키텍처는 토큰 [임베딩](/writing/long-term-knowledge-storage-and-retrieval)에 더하는 고정 사인파 위치 인코딩을 사용했다. 이 인코딩은 각 토큰이 시퀀스의 어디에 나타나는지를 가리키는 절대 위치 정보를 제공했다. 그러나 위치 인코딩이 고정된 최대 시퀀스 길이에 맞춰 미리 정의됐기 때문에 모델은 훈련 중에 본 것보다 긴 시퀀스로 자연스럽게 확장할 수 없었다. 길이 512의 시퀀스로 훈련한 모델에 길이 1024의 시퀀스를 제시하면, 훈련 중에 접하지 못한 위치 인코딩을 만나므로 어려움을 겪었다.

이 한계 때문에 문맥 길이를 확장하려면 새로운 위치 인코딩으로 모델을 다시 훈련해야 했고, 여기에는 많은 계산 비용과 시간이 들었다. 더 긴 시퀀스를 다루려는 연구자는 어려운 선택을 해야 했다. 더 긴 시퀀스로 처음부터 훈련하는 계산 비용을 감수하거나, 고정 시퀀스 길이의 제약 안에서 작업해야 했다. 유연한 문맥 길이가 필요하거나 본질적으로 긴 시퀀스를 다루는 응용 분야에는 어느 쪽도 이상적인 선택이 아니었다.

또 다른 문제는 [어텐션 메커니즘](/writing/attention-mechanism-intuition-soft-lookup-weights-context-vectors)이 강력하기는 하지만 시퀀스에서 서로 가까운 위치와 멀리 떨어진 위치를 자연스럽게 구분하지 못한다는 점이었다. 모델은 어텐션 가중치를 통해 상대 위치를 암묵적으로 학습했지만 위치 관계를 처리하는 명시적인 메커니즘은 없었다. 이 때문에 모델은 국소 의존성과 장거리 의존성을 이해하고, 위치 관계를 서로 다른 길이의 시퀀스로 일반화하는 데 더 큰 어려움을 겪었다.

제한된 문맥 길이와 세그먼트 독립성의 문제는 언어 모델링 과제에서 특히 뚜렷하게 나타났다. 긴 문서로 언어 모델을 훈련할 때 모델은 각 세그먼트를 독립적으로 보았다. 문서 시작 부분에 나타난 단어는 문서 끝부분에 가까운 단어를 모델이 예측하는 방식에 아무런 영향을 주지 못했으며, 두 단어의 관련성이 강해도 마찬가지였다. 이러한 한계는 언어 모델링뿐 아니라 문서 분류에서 장문 [질의응답](/writing/ibm-watson-jeopardy-open-domain-question-answering-nlp-information-retrieval)에 이르기까지 긴 시퀀스 전반에서 문맥을 유지해야 하는 모든 과제에 영향을 미쳤다.

연구자들은 이러한 한계가 Transformer를 여러 실용적 상황에 적용하는 일을 가로막고 있음을 인식했다. 현실의 응용 분야에는 수백 토큰을 훨씬 넘는 문서, 대화, 문맥이 흔히 등장한다. 학술 논문, 법률 문서, 코드베이스, 긴 대화는 모두 수천 또는 수만 토큰에 걸친 관계를 이해해야 한다. 이 분야에는 계산 효율성을 유지하면서 Transformer가 더 긴 시퀀스를 처리하고, 고정 길이 분할이 만드는 인위적인 경계를 피할 수 있게 하는 아키텍처 혁신이 필요했다.

## 해결책

[Transformer-XL](/writing/recurrent-memory-transformer-xl-segment-recurrence)은 서로 보완하는 두 가지 혁신, 세그먼트 수준 순환과 상대 위치 인코딩으로 이러한 근본적 한계를 해결했다. 이 두 메커니즘은 세그먼트 경계를 넘어 문맥을 유지하는 동시에 훈련 중에 본 것보다 긴 시퀀스로 자연스럽게 확장할 수 있게 했다. 이 아키텍처는 고정 길이 세그먼트를 처리할 때의 계산 효율성을 유지하면서 훨씬 긴 유효 문맥의 이점을 얻었다.

첫 번째 핵심 혁신은 세그먼트 수준 순환이었다. Transformer-XL은 각 세그먼트를 완전히 독립적으로 처리하는 대신 이전 세그먼트의 [은닉 상태](/writing/rnn-architecture-recurrent-neural-networks-guide)를 유지하고 현재 세그먼트를 처리할 때 사용한다. 훈련 중 모델은 세그먼트를 순차적으로 처리한다. 각 세그먼트에서는 표준 [Transformer](/writing/transformer-attention-is-all-you-need)와 마찬가지로 은닉 상태를 계산하지만, 이전 세그먼트의 은닉 상태도 함께 포함한다. 이로써 정보가 세그먼트 경계를 넘어 흐르는 순환 연결이 만들어지고, 모델의 기억이 세그먼트 길이 너머로 효과적으로 확장된다.

[세그먼트 수준 순환](/writing/recurrent-memory-transformer-xl-segment-recurrence)의 수학적 표현은 다음과 같다. 위치 $\tau$에 있는 길이 $L$의 세그먼트를 $\mathbf{s}_\tau=[x_{\tau,1},\ldots,x_{\tau,L}]$라 하고, 세그먼트 $\tau$의 $n$번째 층 은닉 상태 시퀀스를 $\mathbf{h}_\tau^n$이라 하자. 표준 Transformer의 각 층은 같은 세그먼트의 이전 층 은닉 상태인 $\mathbf{h}_\tau^{n-1}$만으로 $\mathbf{h}_\tau^n$을 계산한다. Transformer-XL은 현재 세그먼트의 이전 층인 $\mathbf{h}_\tau^{n-1}$과 이전 세그먼트의 같은 층인 $\mathbf{h}_{\tau-1}^n$을 모두 사용해 $\mathbf{h}_\tau^n$을 계산한다.

[어텐션 메커니즘](/writing/attention-mechanism-intuition-soft-lookup-weights-context-vectors)은 이전 세그먼트 정보를 포함하도록 변경된다. 현재 세그먼트의 각 위치에서 모델은 현재 세그먼트의 모든 위치와 캐시에 저장된 이전 세그먼트의 모든 위치에 어텐션할 수 있다. 즉 현재 세그먼트 길이가 $L$이고 이전 세그먼트 하나를 캐시하면 각 위치는 최대 $2L$개 위치에 어텐션할 수 있으며, 길이 $L$의 세그먼트를 처리하는 계산 비용을 유지하면서 문맥 길이를 사실상 두 배로 늘린다. 이전 세그먼트의 캐시된 은닉 상태는 한 번 계산된 뒤 여러 순전파에서 재사용되므로 이 접근법은 계산 효율적이다.

두 번째 핵심 혁신은 상대 위치 인코딩의 도입이었다. [Transformer-XL](/writing/recurrent-memory-transformer-xl-segment-recurrence)은 시퀀스의 절대 위치를 인코딩하는 대신 위치 사이의 상대 거리를 인코딩한다. 이러한 변화에는 몇 가지 중요한 이점이 있다. 첫째, 모델이 훈련 중에 본 것보다 긴 시퀀스로 일반화할 수 있다. 상대 위치는 절대 위치가 아니라 거리를 기반으로 하므로 길이 512의 시퀀스로 훈련한 모델은 토큰 사이의 상대 거리가 계속 의미 있는 한 길이 1024 이상의 시퀀스를 자연스럽게 처리할 수 있다.

[상대 위치 인코딩](/writing/relative-position-encoding-transformers)은 [어텐션 메커니즘](/writing/attention-mechanism-intuition-soft-lookup-weights-context-vectors) 자체에 통합된다. 표준 Transformer에서 query 위치 $i$와 key 위치 $j$ 사이의 어텐션 점수는 $\operatorname{score}_{i,j}=\mathbf{q}_i^\top\mathbf{k}_j$로 계산되며, query와 key에는 절대 위치 정보가 포함된다. Transformer-XL에서는 [상대 위치](/writing/sinusoidal-position-encoding-transformers-word-order) 정보를 명시적으로 포함하도록 어텐션 점수를 변경한다. 계산은 더 복잡해지지만, 고정 절대 위치 인코딩에 의존하는 대신 상대 위치가 어텐션에 어떤 영향을 미쳐야 하는지 모델이 학습할 수 있게 된다.

상대 위치 인코딩 방식은 상대 거리를 인코딩하는 학습 가능한 [임베딩](/writing/long-term-knowledge-storage-and-retrieval)을 사용한다. 위치 $i$와 $j$ 사이의 상대 거리를 $r$이라 하면($r=j-i$), 모델은 이 거리가 어텐션에 어떤 영향을 미쳐야 하는지를 포착하는 임베딩 $\mathbf{R}_r$을 학습한다. 이 임베딩은 key 벡터, 즉 어떤 정보를 이용할 수 있는지와 query-key 상호작용, 즉 위치가 서로 어떤 관계인지를 모두 변경하는 데 사용된다. 정확한 표현에서는 내용 기반 어텐션 항과 위치 편향 항 모두에 [상대 위치 임베딩](/writing/t5-architecture-text-to-text-transformer)을 기반으로 한 항을 더한다.

이 설계는 [어텐션 메커니즘](/writing/attention-mechanism-intuition-soft-lookup-weights-context-vectors)이 상대적인 의미에서 위치를 인식하게 한다. 모델은 가까운 토큰, 즉 $|r|$이 작은 토큰이 멀리 떨어진 토큰, 즉 $|r|$이 큰 토큰보다 일반적으로 더 강한 어텐션 가중치를 가져야 한다고 학습하지만, 내용 유사성이 거리보다 더 중요할 때는 이 패턴의 예외도 학습할 수 있다. 상대 인코딩 방식은 절대 위치가 아니라 위치 사이의 관계에 초점을 맞추므로 다양한 길이의 시퀀스를 처리할 만큼 유연하다.

[세그먼트 수준 순환](/writing/recurrent-memory-transformer-xl-segment-recurrence)과 상대 위치 인코딩의 결합은 긴 시퀀스를 처리하는 강력한 아키텍처를 만든다. 훈련 중 모델은 문서를 세그먼트로 처리하지만 정보는 순환 연결을 통해 세그먼트 사이를 흐른다. 추론 중에는 이전 세그먼트의 은닉 상태 캐시를 유지해 임의 길이의 시퀀스를 처리할 수 있다. 이 캐시는 시퀀스가 길어질수록 커지므로 모델은 처리 가능한 크기의 세그먼트를 계속 사용하면서도 매우 긴 시퀀스 전반의 문맥을 유지할 수 있다.

이 아키텍처에는 효율성을 높이는 몇 가지 구현 세부 사항도 포함된다. 이전 세그먼트의 은닉 상태를 캐시하고 재사용해 중복 계산을 피한다. 새 세그먼트를 처리할 때 모델은 현재 세그먼트와 캐시된 이전 세그먼트에 대해서만 어텐션을 계산하므로 계산 비용을 관리 가능한 수준으로 유지한다. 캐싱 메커니즘 덕분에 모델은 세그먼트 길이의 배수에 해당하는 [문맥 창](/writing/co-occurrence-matrices-distributional-semantics-nlp)을 사실상 가질 수 있으며, 그 배수는 이전 세그먼트를 몇 개 캐시하는지에 따라 결정된다.

[Transformer-XL](/writing/recurrent-memory-transformer-xl-segment-recurrence)은 이러한 아키텍처 변경이 계산 효율성을 유지하면서 긴 시퀀스 과제의 성능을 크게 향상할 수 있음을 보여 주었다. 모델은 언어 모델링 벤치마크, 특히 장거리 의존성이 있는 데이터셋에서 더 나은 [퍼플렉서티](/writing/perplexity-language-model-evaluation-metric) 점수를 달성했다. 더 중요한 점은 세심한 아키텍처 설계를 통해 Transformer를 더 긴 문맥으로 확장할 수 있음을 보여 주어 장문 문맥 모델링의 후속 혁신을 위한 길을 열었다는 것이다.

## 응용과 영향

[Transformer-XL](/writing/recurrent-memory-transformer-xl-segment-recurrence)은 언어 모델링 벤치마크에서 즉각적인 성공을 거두었으며, 장거리 의존성을 포함한 데이터셋에서 더 뛰어난 성능을 보여 주었다. 모델은 WikiText-103과 One Billion Word 데이터셋을 비롯한 여러 표준 언어 모델링 벤치마크에서 새로운 최고 수준의 결과를 세웠다. 이러한 향상은 긴 문맥 전반에서 일관성을 유지해야 하는 과제에서 특히 두드러졌으며, 세그먼트 수준 순환 메커니즘은 표준 Transformer보다 상당한 이점을 제공했다.

더 긴 시퀀스를 처리하는 이 아키텍처의 능력은 몇 가지 구체적인 응용 분야에서 가치가 있었다. 문서 수준 이해 과제에서 Transformer-XL은 짧은 세그먼트에 제한되지 않고 문서 전체에 걸쳐 문맥을 유지할 수 있었다. 이러한 능력은 국소 패턴만이 아니라 문서 전체 문맥을 이해할 때 정확도가 향상되는 문서 분류 같은 과제에서 중요했다. 또한 대명사나 참조 대상이 여러 문장에 걸쳐 멀리 떨어져 나타날 수 있는 상호참조 해결 같은 과제도 더 잘 처리할 수 있었다.

텍스트 생성 과제에서는 [Transformer-XL](/writing/recurrent-memory-transformer-xl-segment-recurrence)의 [확장된 문맥](/writing/long-context-models-processing-million-token-sequences-language-ai)이 더 일관된 장문 생성을 가능하게 했다. 언어 모델은 시퀀스 앞부분의 정보에 접근할 수 있었으므로 더 긴 생성 구절 전반에서 일관성을 유지할 수 있었다. 이러한 향상은 창작 글쓰기, 기술 문서 또는 긴 출력 전반에서 일관성을 유지하고 반복을 피하는 일이 중요한 모든 생성 과제에서 특히 두드러졌다.

이 아키텍처는 코드 모델링과 생성에도 응용됐다. 프로그래밍 언어에는 파일 앞부분에 정의된 함수를 훨씬 뒤에서 호출하거나 클래스 정의가 여러 줄에 걸쳐 이어지는 것과 같은 장거리 의존성이 흔히 존재한다. 더 긴 시퀀스 전반에서 문맥을 유지하는 Transformer-XL의 능력은 고정 길이 문맥 창을 사용하는 표준 Transformer보다 코드 이해와 생성 과제에 더 적합하게 만들었다.

이러한 직접적인 응용보다 더 중요할 수 있는 것은 Transformer-XL이 후속 아키텍처 개발에 미친 영향이었다. [상대 위치 인코딩](/writing/relative-position-encoding-transformers) 방식은 특히 영향력 있는 혁신으로 입증됐다. 절대 위치 인코딩이 제약이 된다는 점을 인식하면서 이후 수많은 [Transformer](/writing/transformer-attention-is-all-you-need) 변형은 상대 위치 방식이나 변경된 [위치 인코딩](/writing/sinusoidal-position-encoding-transformers-word-order) 방식을 채택했다. 위치 정보를 더 유연하게 통합할 수 있다는 아이디어는 후대 아키텍처의 공통 주제가 되었다.

[세그먼트 수준 순환](/writing/recurrent-memory-transformer-xl-segment-recurrence) 메커니즘은 Transformer-XL 설계에 특유한 것이었지만, Transformer가 아키텍처 변경을 통해 더 긴 문맥을 유지할 수 있다는 일반 원리를 보여 주었다. 이 원리는 다른 장문 문맥 Transformer 변형의 개발에 영향을 미쳤다. 일부 후속 모델은 각 위치가 이전 위치의 고정 창에 어텐션할 수 있게 하여 어텐션 패턴을 통해 일종의 순환을 효과적으로 구현하는 [슬라이딩 윈도 어텐션](/writing/sliding-window-attention)을 사용했다. 다른 모델은 이전 세그먼트의 요약을 저장하는 메모리 메커니즘을 사용해 장문 문맥 모델링에 계층적으로 접근했다.

Transformer-XL의 성공은 효율적인 장문 문맥 모델링의 중요성도 부각했다. 언어 모델의 크기가 커지고 더 다양한 과제에 적용되면서 더 긴 시퀀스를 처리하는 능력의 가치는 점점 높아졌다. 이 아키텍처는 효율성을 유지하면서도 문맥을 확장할 수 있음을 보여 주어 연구 우선순위에 영향을 미쳤으며, 훨씬 더 긴 시퀀스로 확장할 수 있는 장문 문맥 Transformer 연구를 촉진했다.

[상대 위치 인코딩](/writing/relative-position-encoding-transformers)은 특히 지속적인 영향을 미쳤다. [GPT-3](/writing/gpt3-in-context-learning-emergent-capabilities-from-scale), [PaLM](/writing/palm-pathways-language-model-large-scale-training-reasoning), [LLaMA](/writing/llama-meta-open-foundation-models-democratized-language-ai-research) 같은 현대 언어 모델은 상대 위치 인코딩의 변형이나, 절대 위치가 아니라 상대 위치를 인코딩하는 [Rotary Position Embedding](/writing/rotary-position-embedding-rope-transformers)(RoPE) 같은 관련 방식을 사용한다. 상대 위치 관계가 절대 위치보다 일반화하기 쉽다는 통찰은 [Transformer](/writing/transformer-attention-is-all-you-need) 설계의 표준 관행이 되었다.

이 아키텍처는 특정 시퀀스 길이 요구 사항에 맞게 Transformer를 조정하는 방식을 이해하는 데에도 기여했다. 응용 분야마다 최적의 문맥 길이가 다르며, [Transformer-XL](/writing/recurrent-memory-transformer-xl-segment-recurrence)은 아키텍처 변경을 통해 완전히 다시 훈련하지 않고도 문맥을 유연하게 확장할 수 있음을 보여 주었다. 이러한 유연성은 짧은 대화부터 긴 문서에 이르기까지 서로 다른 문맥 요구 사항을 지닌 다양한 과제에 언어 모델이 적용되면서 중요해졌다.

## 한계

[Transformer-XL](/writing/recurrent-memory-transformer-xl-segment-recurrence)은 표준 Transformer의 중요한 한계를 해결했지만 몇 가지 제약을 새로 도입했고 일부 근본적인 문제의 영향도 계속 받았다. 세그먼트 수준 순환 메커니즘은 효과적이지만 이전 세그먼트의 캐시된 은닉 상태를 유지해야 한다. 이러한 캐싱은 특히 매우 긴 시퀀스를 처리하거나 여러 세그먼트의 캐시를 유지할 때 메모리 요구량을 늘린다. 메모리 비용은 캐시된 세그먼트 수에 따라 선형으로 증가하므로 극도로 긴 시퀀스에서는 제약이 될 수 있다.

세그먼트 수준 순환이 제공하는 계산 효율성의 이득은 실제로 존재하지만 무제한은 아니다. 각 세그먼트를 처리하는 비용은 관리 가능한 수준으로 유지되지만 캐시된 세그먼트에 대한 어텐션 계산에는 여전히 연산이 필요하다. 많은 세그먼트를 캐시하면 [어텐션 메커니즘](/writing/attention-mechanism-intuition-soft-lookup-weights-context-vectors)은 현재 세그먼트의 모든 위치와 캐시된 모든 세그먼트의 위치에 대한 점수를 계산해야 하므로 계산 시간이 늘어난다. 따라서 Transformer-XL은 표준 Transformer보다 효율적으로 문맥 길이를 확장하지만, 시퀀스를 얼마나 길게 효율적으로 처리할 수 있는지에는 여전히 실질적인 한계가 있다.

[상대 위치 인코딩](/writing/relative-position-encoding-transformers) 방식은 절대 인코딩보다 유연하지만 여전히 한계가 있다. 모델은 상대 거리를 위한 [임베딩](/writing/long-term-knowledge-storage-and-retrieval)을 학습해야 하며, 훈련 데이터에 특정 상대 거리의 예시가 없다면 이를 제대로 처리하지 못할 수 있다. 훈련 중에 자주 보지 못한 매우 긴 상대 거리는 잘 표현되지 않을 수 있다. 또한 상대 인코딩 방식은 위치 관계가 주로 거리에 따라 결정된다고 가정하는데, 모든 유형의 시퀀스나 과제에서 항상 그런 것은 아닐 수 있다.

이 아키텍처의 설계는 시퀀스를 자연스럽게 세그먼트로 나눌 수 있다고 가정하지만, 일부 유형의 데이터에는 명확한 세그먼트 경계가 없을 수 있다. 이 경우 분할 전략이 중요해지며 세심한 설계가 필요할 수 있다. 시퀀스를 세그먼트로 나누는 방식에 따라 모델의 성능이 민감하게 달라질 수 있으므로, 새로운 영역이나 과제에 이 아키텍처를 적용할 때 추가로 고려해야 한다.

[Transformer-XL](/writing/recurrent-memory-transformer-xl-segment-recurrence)의 개선은 장거리 의존성이 있는 과제에서 가장 두드러지지만 많은 과제에는 이러한 의존성이 필요하지 않다. 국소 문맥만으로 충분한 과제라면 세그먼트 수준 순환의 추가적인 복잡성과 계산 비용이 그 부담을 정당화할 만한 이점을 제공하지 않을 수 있다. 이 아키텍처는 좋은 성능을 내는 데 실제로 장거리 문맥이 필요할 때 가장 가치가 있다.

이 모델은 매우 긴 시퀀스에 대한 어텐션과 관련된 근본적인 문제에 여전히 직면한다. 세그먼트 수준 순환이 유효 문맥 길이를 확장하지만 어텐션 계산의 이차 규모 증가는 계속 우려된다. 효율적인 세그먼트 처리를 사용해도 수만 토큰 길이의 시퀀스를 처리하려면 상당한 계산 자원이 필요하다. 이 아키텍처는 표준 Transformer보다 효율성을 높이지만 긴 시퀀스 처리의 근본적인 계산 문제를 없애지는 못한다.

또 다른 한계는 이전 세그먼트에서 캐시된 은닉 상태가 처리 과정의 한 고정 시점에 있는 정보를 나타낸다는 점이다. 모델은 새 세그먼트를 처리하면서 이전 세그먼트의 해석 방식을 바꿀 정보를 발견할 수 있지만, 캐시된 상태는 갱신되지 않는다. 따라서 이전 세그먼트에 대한 모델의 이해는 정적으로 남으며, 이후 문맥을 바탕으로 해석을 수정하는 능력이 제한될 수 있다. 일부 후속 아키텍처는 캐시된 표현을 갱신할 수 있는 메커니즘으로 이 문제를 해결했다.

[상대 위치 인코딩](/writing/relative-position-encoding-transformers) 방식은 절대 인코딩보다 유연하지만 위치 사이의 관계 방식에 대한 가정을 여전히 내포한다. 학습 가능한 [상대 위치 임베딩](/writing/t5-architecture-text-to-text-transformer)은 훈련 데이터의 패턴을 포착하지만, 이 패턴이 모든 유형의 시퀀스나 영역에 완벽하게 일반화되지 않을 수 있다. 구조가 특이하거나 위치 관계에 관한 가정에서 벗어난 시퀀스는 상대 인코딩 접근법에서 그만큼 큰 이점을 얻지 못할 수 있다.

## 유산과 전망

[Transformer-XL](/writing/recurrent-memory-transformer-xl-segment-recurrence)의 혁신은 [Transformer](/writing/transformer-attention-is-all-you-need) 아키텍처 개발에 지속적인 영향을 미쳤다. 특히 [상대 위치 인코딩](/writing/relative-position-encoding-transformers) 방식은 여러 현대 언어 모델의 표준 구성 요소가 되었다. 절대 위치 대신 상대 위치를 인코딩하면 일반화가 개선된다는 통찰은 널리 채택됐다. [GPT-3](/writing/gpt3-in-context-learning-emergent-capabilities-from-scale), [PaLM](/writing/palm-pathways-language-model-large-scale-training-reasoning), [LLaMA](/writing/llama-meta-open-foundation-models-democratized-language-ai-research) 같은 현대 모델은 [Rotary Position Embedding](/writing/rotary-position-embedding-rope-transformers)(RoPE)을 비롯해 절대 위치 관계 대신 상대 위치 관계를 인코딩하는 여러 상대 위치 인코딩 변형과 관련 방식을 사용한다.

세그먼트 수준 순환 메커니즘은 아키텍처를 완전히 다시 설계하지 않고도 아키텍처 변경을 통해 Transformer가 더 긴 문맥을 유지할 수 있음을 보여 주었다. 이 원리는 장문 문맥 Transformer에 관한 후속 연구에 영향을 미쳤다. 이후 많은 아키텍처가 문맥을 확장하는 데 다른 메커니즘을 사용하지만, 계산 효율성을 유지하면서 더 긴 문맥을 지원한다는 Transformer-XL의 목표를 공유한다.

언어 모델링 과제에서 이 아키텍처가 거둔 성공은 자연어 처리에서 장문 문맥 모델링이 중요하다는 점을 부각했다. 언어 모델의 규모와 능력이 커질수록 더 긴 시퀀스를 처리하는 능력은 점점 더 중요해졌다. 긴 문서 분석부터 긴 대화의 일관성 유지에 이르기까지 여러 실용적 응용에는 수천 또는 수만 토큰에 걸친 문맥을 이해하는 능력이 필요하다. [Transformer-XL](/writing/recurrent-memory-transformer-xl-segment-recurrence)은 장문 문맥 모델링을 중요한 연구 방향으로 확립하는 데 기여했다.

이 아키텍처는 특정한 요구 사항에 Transformer를 맞추는 방법을 이해하는 데에도 기여했다. 응용 분야마다 최적의 문맥 길이와 계산 제약이 다르며, Transformer-XL은 아키텍처 변경을 통해 문맥을 유연하게 확장할 수 있음을 보여 주었다. 이러한 적응성은 각각 고유한 문맥 길이 요구 사항을 지닌 더욱 다양한 과제에 Transformer가 적용되면서 중요해졌다.

후속 연구는 Transformer-XL의 아이디어를 토대로 일부 한계를 해결했다. [Longformer](/writing/attention-complexity-quadratic-scaling-memory-efficient-transformers) 같은 모델은 문맥을 확장하기 위해 [슬라이딩 윈도 어텐션](/writing/sliding-window-attention)을 사용하며 효율적인 장거리 어텐션의 한 형태를 구현한다. [BigBird](/writing/bigbird-sparse-attention-random-connections-long-documents) 같은 모델에서 사용되는 희소 어텐션 메커니즘은 계산량을 줄이면서 장거리 연결을 유지하는 어텐션 패턴을 만든다. 이러한 접근법은 문맥 길이를 확장한다는 Transformer-XL의 목표를 공유하지만 서로 다른 메커니즘을 사용한다.

[상대 위치 인코딩](/writing/relative-position-encoding-transformers) 혁신은 특히 큰 영향을 미쳤다. 연구자들은 [RoPE](/writing/rotary-position-embedding-rope-transformers)의 [회전 임베딩](/writing/llama-components-rmsnorm-swiglu-rope)부터 상대 거리에 따른 학습된 선형 편향을 사용하는 Attention with Linear Biases([ALiBi](/writing/alibi-attention-linear-biases-position-encoding))까지 이 주제의 여러 변형을 탐구했다. 이러한 발전은 상대 위치 인코딩의 핵심 통찰이 이 분야 전반에서 널리 인정되고 변형됐음을 보여 준다.

앞으로도 장문 문맥 모델링의 문제는 활발한 연구 영역으로 남아 있다. 모델이 더욱 긴 시퀀스를 처리하도록 확장될수록 효율성은 점점 더 중요해진다. [희소 어텐션](/writing/attention-complexity-quadratic-scaling-memory-efficient-transformers) 패턴부터 긴 문맥을 요약하는 계층적 아키텍처까지, 매우 긴 시퀀스를 효율적으로 처리할 수 있는 어텐션 메커니즘 연구가 계속되고 있다. 이 영역에 대한 [Transformer-XL](/writing/recurrent-memory-transformer-xl-segment-recurrence)의 기여는 현재 진행 중인 연구에도 계속 영향을 미친다.

더 긴 문맥으로 Transformer를 확장할 수 있음을 보여 준 이 아키텍처는 언어 모델을 평가하고 적용하는 방식에도 영향을 미쳤다. [벤치마크](/writing/glue-superglue-standardized-evaluation-language-understanding) 데이터셋과 과제에는 긴 시퀀스의 이해가 필요한 실용적 응용이 많다는 점을 반영해 점점 더 긴 문맥이 포함되고 있다. 장문 문맥 능력에 대한 이 분야의 관심이 커진 데에는 Transformer-XL이 그러한 능력을 달성할 수 있음을 보여 준 것도 일부 영향을 미쳤다.

2019년 Transformer-XL의 등장은 [Transformer](/writing/transformer-attention-is-all-you-need) 아키텍처의 진화에서 중요한 순간이었다. 고정 문맥 길이와 세그먼트 독립성이라는 근본적인 한계를 해결함으로써, 이 아키텍처는 장거리 이해가 필요한 과제에 Transformer를 적용할 새로운 가능성을 열었다. 특히 [상대 위치 인코딩](/writing/relative-position-encoding-transformers)을 비롯해 이 아키텍처가 도입한 혁신은 현대 언어 모델의 표준 구성 요소가 되었다. 후속 아키텍처가 이러한 아이디어를 토대로 발전시키고 확장했지만, Transformer에서 더 긴 문맥을 가능하게 한 [Transformer-XL](/writing/recurrent-memory-transformer-xl-segment-recurrence)의 기여는 이 분야에 지속적인 영향을 미쳤다.
