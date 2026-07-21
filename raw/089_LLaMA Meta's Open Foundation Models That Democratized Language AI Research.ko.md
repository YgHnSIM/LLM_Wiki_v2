# LLaMA: 언어 AI 연구를 대중화한 Meta의 개방형 기반 모델

원본 출처: https://mbrenndoerfer.com/writing/llama-meta-open-foundation-models-democratized-language-ai-research

Meta가 개발한 효율적인 오픈 소스 언어 모델 LLaMA를 종합적으로 살펴본다. LLaMA가 기반 모델에 대한 접근을 어떻게 대중화했는지, 컴퓨트 최적 훈련을 어떻게 구현했는지, RMSNorm·SwiGLU·RoPE 같은 아키텍처 혁신을 통해 언어 모델 연구 지형을 어떻게 바꾸었는지 알아본다.

## 2023년: LLaMA

2023년 2월, 위고 투브롱(Hugo Touvron)이 이끈 Meta의 Fundamental AI Research(FAIR) 팀은 대규모 언어 모델 Meta AI([LLaMA](/writing/llama-architecture-design-training-efficiency))를 공개했다. LLaMA는 대규모 언어 모델 연구·개발의 지형을 근본적으로 바꾼 기반 언어 모델 제품군이었다. 당시 [GPT-3](/writing/gpt3-in-context-learning-emergent-capabilities-from-scale)와 [PaLM](/writing/palm-pathways-language-model-large-scale-training-reasoning) 같은 최첨단 언어 모델은 독점 시스템으로 남아 있어 대다수 연구자가 접근할 수 없었다. 반면 LLaMA는 독점 시스템과 경쟁할 수 있는 고품질의 효율적인 모델에 대한 개방형 접근을 제공했다. 이 공개로 첨단 언어 모델 역량에 대한 접근이 대중화되었고, 학술 기관·독립 연구자·소규모 조직도 훨씬 더 큰 독점 시스템과 맞먹거나 이를 능가하는 모델을 실험하고 미세 조정하며 그 위에 새로운 시스템을 구축할 수 있게 되었다.

LLaMA의 의의는 단순히 모델 가중치에 대한 개방형 접근을 제공하는 데 그치지 않았다. LLaMA 모델은 [컴퓨트 최적](/writing/chinchilla-scaling-laws-compute-optimal-training-resource-allocation) 원칙에 따라 설계되었다. [친칠라 스케일링 법칙](/writing/chinchilla-scaling-laws-compute-optimal-llm-training)이 확립한 이 원칙은 더 작은 모델을 더 많은 데이터로 훈련하면 더 큰 모델과 경쟁할 만한 성능을 낼 수 있음을 보여 주었다. LLaMA는 매개변수 70억·130억·330억·650억 개의 네 가지 크기로 제공되었으며, 각 모델은 효율을 극대화하도록 방대한 양의 고품질 데이터로 세심하게 훈련되었다. [LLaMA](/writing/llama-architecture-design-training-efficiency)-65B는 GPT-3의 1,750억 개보다 매개변수가 적었지만, 여러 벤치마크에서 [GPT-3](/writing/gpt3-in-context-learning-emergent-capabilities-from-scale)의 성능과 맞먹거나 이를 능가했다. 이는 세심한 아키텍처 설계와 최적의 훈련 데이터 배분으로 더 적은 매개변수에서도 더 뛰어난 결과를 얻을 수 있음을 입증했다.

LLaMA의 아키텍처 혁신도 효율성과 효과를 크게 높였다. 이 모델은 [트랜스포머](/writing/transformer-attention-is-all-you-need) 아키텍처를 사용하되 몇 가지 핵심 요소를 변경했다. 표준 LayerNorm 대신 [RMSNorm](/writing/rmsnorm-efficient-normalization-modern-llms) 방식으로 [레이어 정규화](/writing/layer-normalization-neural-network-training)를 수행했고, [SwiGLU 활성화 함수](/writing/gated-linear-units-swiglu-transformer-ffn)를 [ReLU](/writing/activation-functions-neural-networks-complete-guide) 대신 사용했으며, 절대 위치 [임베딩](/writing/long-term-knowledge-storage-and-retrieval) 대신 회전 위치 임베딩([RoPE](/writing/rotary-position-embedding-rope-transformers))을 사용했다. 이러한 선택은 임의로 이루어진 것이 아니었다. 각각은 앞선 연구에서 훈련 안정성, 모델 성능 또는 추론 효율을 향상하는 것으로 확인된 기법이었다. LLaMA는 검증된 이 기법들을 결합해 훈련 안정성과 추론 효율을 유지하면서 매개변수당 성능을 극대화하는 설계를 구현했다.

LLaMA의 공개 전략에는 개방형 과학과 연구 대중화에 대한 Meta의 의지가 반영되었다. 제한적으로 투명한 API 인터페이스로만 접근할 수 있던 독점 모델과 달리, [LLaMA](/writing/llama-architecture-design-training-efficiency)의 가중치는 사례별 심사를 거쳐 연구자에게 제공되었고 적절한 안전장치 아래 연구 및 상업적 이용을 허용하는 명확한 라이선스가 적용되었다. 이 방식 덕분에 연구자들은 블랙박스 API로는 불가능했던 방식으로 모델의 내부 표현을 연구하고, 특정 과제에 맞게 미세 조정하며, 역량과 한계를 파악할 수 있었다. LLaMA의 개방성은 혁신의 물결을 촉발했다. 연구자들은 접근 가능한 이 [기반 모델](/writing/foundation-models-report-defining-new-paradigm-ai)을 활용해 애플리케이션을 만들고, 안전성 연구를 수행하며, 새로운 기법을 개발하기 시작했다.

LLaMA가 공개된 시점도 특히 중요했다. 2023년 초에는 대규모 언어 모델의 역량이 분명해졌지만 접근은 여전히 엄격히 제한된 중대한 분기점에 이르렀다. 대다수 연구자는 상업용 API를 통해서만 모델과 상호작용할 수 있었고, 이 때문에 수행할 수 있는 연구와 실험의 종류가 제한되었다. LLaMA는 이러한 장벽을 허물었다. 고품질 대안을 제공해 더 넓은 연구 공동체가 언어 모델 개발, 안전성 연구, 애플리케이션 구축에 참여할 수 있게 했다. 이 대중화는 해당 분야에 지속적인 영향을 미쳤다. 오픈 소스 언어 모델 개발의 혁신 속도를 높였고, 2023년 내내 그리고 그 이후에 등장한 [개방형 LLM](/writing/open-llm-wave-proliferation-high-quality-open-source-language-models) 생태계의 기반을 마련했다.

## 문제

2023년 초 대규모 언어 모델 연구의 지형에는 혁신의 범위와 속도를 제한하는 근본적인 접근성 문제가 있었다. [GPT-3](/writing/gpt3-in-context-learning-emergent-capabilities-from-scale), [PaLM](/writing/palm-pathways-language-model-large-scale-training-reasoning) 같은 최첨단 모델과 그 밖의 독점 시스템은 개발사가 제공하는 API 인터페이스를 통해서만 접근할 수 있었다. 이 API들은 다양한 애플리케이션과 활용 사례를 가능하게 했지만, 모델을 연구·수정·미세 조정하거나 그 위에 새로운 시스템을 구축하려는 연구자와 개발자에게는 상당한 제약을 안겼다. API 접근의 블랙박스 특성 때문에 연구자는 내부 모델 표현을 조사하거나 아키텍처 변경을 실험할 수 없었고, 상세한 안전성 분석을 수행하거나 외부 서비스에 의존하지 않고 특수 영역에 맞춰 모델을 미세 조정할 수도 없었다.

학계 연구자들은 이러한 환경에서 특히 큰 어려움을 겪었다. 언어 모델 연구를 수행하려면 사용량 제한과 제약이 붙은 비싼 API 접근권을 확보하거나, 대다수 학술 기관이 감당할 수 없는 컴퓨팅 자원을 들여 모델을 처음부터 훈련해야 했다. 독점 시스템이 할 수 있는 일과 연구자가 실제로 연구하거나 구축할 수 있는 일 사이의 격차는 막대했다. 그 결과 이 분야의 혁신 대부분이 자원이 풍부한 몇몇 조직에 집중되었다. 이러한 집중은 더 폭넓은 언어 모델 개발 참여에서 나올 수 있는 관점, 활용 사례, 안전성 연구의 다양성을 제한했다.

독점 모델은 인상적이었지만 반드시 최적의 효율을 염두에 두고 설계된 것은 아니었다. 2020년에 공개된 [GPT-3](/writing/gpt3-in-context-learning-emergent-capabilities-from-scale)는 매개변수 1,750억 개를 약 3,000억 토큰으로 훈련했으므로, 매개변수당 [토큰 수](/writing/chinchilla-scaling-laws-compute-optimal-llm-training)는 약 1.7개였다. 그러나 2022년에 발표된 연구, 특히 친칠라 스케일링 법칙은 이 접근이 최적이 아님을 보여 주었다. 훨씬 적은 매개변수를 지닌 모델도 매개변수당 약 20개 토큰이라는 [컴퓨트 최적](/writing/chinchilla-scaling-laws-compute-optimal-training-resource-allocation) 비율에 따라 훨씬 더 많은 데이터로 훈련하면 경쟁 모델과 맞먹거나 더 뛰어난 성능을 낼 수 있었다. 이러한 비효율성은 독점 모델이 접근하기 어려울 뿐 아니라 컴퓨팅 자원 사용 면에서도 최적이 아닐 수 있음을 뜻했다.

기존 모델의 아키텍처는 효과적이었지만 개선의 여지가 있었다. 표준 [트랜스포머](/writing/transformer-attention-is-all-you-need) 아키텍처는 [LayerNorm](/writing/layer-normalization-neural-network-training), [ReLU](/writing/activation-functions-neural-networks-complete-guide) 활성화 함수, 절대 위치 [임베딩](/writing/long-term-knowledge-storage-and-retrieval)을 사용했다. 이들 모두에 대해 대안적 접근이 훈련 안정성이나 모델 성능, 또는 둘 다를 높일 수 있다는 연구가 나와 있었다. 그러나 이러한 개선책을 구현하려면 모델 가중치에 접근하고 아키텍처를 변경할 수 있어야 했으며, 독점 모델은 이를 허용하지 않았다. 아키텍처 개선을 탐구하려는 연구자는 실제 운영 시스템의 규모를 반영하지 못하는 훨씬 작은 모델로 연구하거나, 대규모 모델에 대한 API 기반 접근의 한계를 받아들여야 했다.

접근성 문제는 언어 모델의 평가와 벤치마킹에도 악영향을 미쳤다. 연구자들은 API 인터페이스가 허용하는 범위를 넘어 독점 모델에 맞춤형 평가를 실행할 수 없었고, 그 결과 수행할 수 있는 분석의 종류가 제한되었다. 모델 내부, 훈련 데이터 구성, 세부적인 성능 특성에 관한 질문은 여전히 불투명했다. 이 때문에 모델이 어떻게 작동하고 한계가 무엇이며 어떻게 개선할 수 있는지 이해하기 어려웠다. 언어 모델의 역량과 행동에 대한 이해를 발전시키려면 철저히 조사·평가·수정할 수 있는 모델이 연구 공동체에 필요했다.

독점 모델의 비용 구조는 수많은 잠재적 애플리케이션에 장벽을 만들었다. API 접근은 많은 활용 사례를 가능하게 했지만, 광범위한 미세 조정이나 맞춤형 추론 구성 또는 오프라인 배포가 필요한 애플리케이션은 외부 API에 의존할 수 없었다. 특정 지연 시간 요건, 개인정보 보호 제약, 비용 조건 아래 언어 모델을 운영 환경에 배포하려는 조직에는 API 기반 접근이 충분하지 않았다. 외부 서비스에 의존하지 않고 독립적으로 배포하며, 특정 영역에 맞게 미세 조정하고, 특정 활용 사례에 최적화할 수 있는 개방형 모델이 필요했다.

마지막으로 안전·윤리 연구 공동체는 특히 큰 어려움에 직면했다. 모델의 편향, 실패 양상, 안전 속성을 이해하려면 모델 내부에 깊이 접근하고 광범위하게 시험할 수 있어야 했다. 독점 모델의 블랙박스 특성은 수행할 수 있는 안전성 연구의 종류를 제한했고, 잠재적 피해를 식별하고 해결하기 어렵게 했다. 더 포괄적인 안전 분석과 더 나은 안전 기법의 개발을 가능하게 하려면 연구자가 철저히 연구할 수 있는 개방형 모델이 필요했다.

## 해결책

Meta의 FAIR 팀은 [LLaMA](/writing/llama-architecture-design-training-efficiency)를 설계하고 공개함으로써 이러한 문제에 대응했다. LLaMA는 최적의 훈련 전략과 검증된 아키텍처 혁신을 결합한, 효율적으로 설계되고 공개적으로 접근 가능한 언어 모델 제품군이었다. 해결책은 여러 요소를 조율하는 방식으로 구성되었다. [컴퓨트 최적 훈련](/writing/chinchilla-scaling-laws-compute-optimal-llm-training) 원칙을 따르고, 효율적인 아키텍처 개선을 구현하며, 고품질 훈련 데이터를 선별하고, 적절한 안전장치를 유지하면서 더 폭넓은 연구 접근을 가능하게 하는 개방형 공개 전략을 수립했다.

### 컴퓨트 최적 훈련

LLaMA 설계의 토대는 매개변수당 약 20개 토큰으로 모델을 훈련하면 주어진 컴퓨팅 예산에서 최적의 성능을 얻을 수 있음을 보여 준 친칠라 스케일링 법칙을 적용하는 데 있었다. LLaMA 팀은 단순히 모델 크기만 키우는 대신, 효율을 극대화하도록 모델 매개변수와 훈련 데이터의 균형을 세심하게 조정했다. 가장 작은 LLaMA-7B는 1조 토큰으로, 가장 큰 LLaMA-65B는 1조 4,000억 토큰으로 훈련되었다. 이 접근으로 각 모델은 [컴퓨트 최적](/writing/chinchilla-scaling-laws-compute-optimal-training-resource-allocation) 원칙을 따르면서도 [GPT-3](/writing/gpt3-in-context-learning-emergent-capabilities-from-scale) 같은 모델보다 적은 매개변수로 경쟁력 있는 성능을 달성했다.

[LLaMA](/writing/llama-architecture-design-training-efficiency)의 훈련 데이터는 Common Crawl, C4, GitHub, Wikipedia, 도서, arXiv 논문 등 여러 고품질 출처에서 세심하게 선별되었다. 데이터 전처리 파이프라인은 저품질 콘텐츠 제거, 문서 중복 제거, 부적절한 자료 식별 및 필터링 같은 여러 품질 필터를 적용했다. 이러한 선별 과정은 다양한 과제에서 강력한 성능을 내는 데 필요한 폭넓고 질 좋은 텍스트를 모델에 제공했다. 최적의 데이터 대 매개변수 비율과 결합된 [데이터 품질](/writing/data-quality-outliers-measurement-error-missing-data) 강조 덕분에 LLaMA 모델은 크기에 비해 뛰어난 성능을 달성할 수 있었다.

컴퓨트 최적 훈련 이해하기

컴퓨트 최적 훈련은 고정된 컴퓨팅 예산 안에서 모델 용량과 훈련 데이터의 균형을 맞춘다. 친칠라 스케일링 법칙은 모델 크기를 극대화하는 대신 더 작은 모델을 더 많은 데이터로 훈련하면 더 나은 성능을 얻을 수 있음을 보여 주었다. LLaMA의 경우 매개변수 650억 개짜리 모델을 1조 4,000억 토큰으로 훈련함으로써, 매개변수 1,750억 개짜리 모델을 3,000억 토큰으로 훈련했을 때와 맞먹거나 더 뛰어난 성능을 낼 수 있었다. 이러한 효율 덕분에 LLaMA는 훈련과 추론 모두에 필요한 컴퓨팅 자원을 줄이면서도 경쟁력 있는 성능을 달성했다.

### 아키텍처 혁신

[LLaMA](/writing/llama-architecture-design-training-efficiency)는 훈련 효율과 모델 성능을 모두 높이는 몇 가지 아키텍처 개선을 도입했다. 첫 번째 혁신은 표준 LayerNorm 대신 [RMSNorm](/writing/rmsnorm-efficient-normalization-modern-llms)(Root Mean Square [Layer Normalization](/writing/layer-normalization-neural-network-training))을 사용한 것이다. RMSNorm은 평균 중심화 단계를 제거하고 제곱 평균 제곱근만 계산해 [정규화](/writing/normalization-feature-scaling-min-max-machine-learning-guide) 연산을 단순화했다. 이 단순화는 훈련 안정성을 유지하면서 계산 부담을 줄여 더 효율적인 훈련과 추론을 가능하게 했다.

두 번째 핵심 변화는 피드포워드 네트워크에 [SwiGLU 활성화 함수](/writing/gated-linear-units-swiglu-transformer-ffn)를 채택한 것이다. [Swish 활성화 함수](/writing/ffn-activation-functions)와 Gated Linear Unit을 결합한 SwiGLU는 기존 연구에서 표준 [ReLU](/writing/activation-functions-neural-networks-complete-guide) 활성화 함수보다 모델 성능을 높이는 것으로 나타났다. 그러나 SwiGLU에는 게이팅 메커니즘이 포함되므로 ReLU보다 더 많은 매개변수가 필요하다. LLaMA는 매개변수 효율을 유지하기 위해, 모델 차원을 $d$라고 할 때 SwiGLU 층의 차원을 다수의 [트랜스포머](/writing/transformer-attention-is-all-you-need) 아키텍처에서 쓰는 표준 $4d$ 대신 $8d/3$으로 설정했다. 이 조정은 SwiGLU의 성능 이점을 유지하면서 추가 매개변수를 상쇄했다.

세 번째 아키텍처 혁신은 절대 위치 임베딩 대신 회전 위치 [임베딩](/writing/long-term-knowledge-storage-and-retrieval)([RoPE](/writing/rotary-position-embedding-rope-transformers))을 사용한 것이다. RoPE는 [상대 위치](/writing/sinusoidal-position-encoding-transformers-word-order) 관계를 자연스럽게 포함하는 방식으로 쿼리와 키 벡터를 회전시켜 위치 정보를 부호화한다. 이 접근은 장거리 의존성이 필요한 과제에서 모델 성능을 높이고, 훈련 문맥 길이보다 긴 시퀀스에도 더 잘 일반화하는 것으로 알려졌다. [LLaMA](/writing/llama-architecture-design-training-efficiency)는 RoPE를 통해 계산 효율을 유지하면서 위치 정보를 더 효과적으로 처리할 수 있었다.

### 훈련 효율

[컴퓨트 최적 훈련](/writing/chinchilla-scaling-laws-compute-optimal-llm-training)과 아키텍처 개선을 결합한 덕분에 LLaMA는 뛰어난 훈련 효율을 달성했다. 모델은 [AdamW](/writing/adamw-optimizer-decoupled-weight-decay) 최적화, 코사인 학습률 스케줄링, [그래디언트 클리핑](/writing/gradient-clipping-deep-learning) 등 표준 트랜스포머 훈련 기법을 사용해 훈련되었다. 효율적인 아키텍처는 반복당 계산 비용을 낮췄고, 최적의 데이터 대 매개변수 비율은 훈련 컴퓨트를 효과적으로 사용하도록 했다. 이러한 효율 덕분에 여러 크기의 모델을 훈련할 수 있었고, 서로 다른 활용 사례와 컴퓨팅 제약에 맞는 모델 제품군을 공개할 수 있었다.

훈련 인프라는 Meta의 컴퓨팅 자원을 활용했지만, 모델 자체는 이보다 더 평범한 하드웨어에서도 효율적으로 미세 조정하고 배포할 수 있었다. LLaMA 제품군의 소형 모델, 특히 LLaMA-7B와 LLaMA-13B는 고급 GPU 한 대에서 실행할 수 있어 컴퓨팅 자원이 제한된 연구자와 조직도 접근할 수 있었다. 이러한 접근성은 더 많은 이가 언어 모델 연구·개발에 참여하게 한다는 프로젝트의 핵심 목표였다.

### 개방형 공개 전략

[LLaMA](/writing/llama-architecture-design-training-efficiency)의 공개 전략은 개방형 연구라는 목표와 책임 있는 배포에 대한 고려 사이에서 균형을 추구했다. 모델 가중치는 신청 절차를 거쳐 연구자에게 제공되었으며, 일정한 조건 아래 연구 및 상업적 이용을 허용하는 라이선스가 적용되었다. 이 방식은 책임 있는 사용을 위한 일정한 감독을 유지하면서도 연구자가 모델 가중치에 직접 접근해 자체 평가를 수행하고, 특정 애플리케이션에 맞게 미세 조정하며, 모델 내부를 연구할 수 있게 했다.

LLaMA의 개방성은 즉각적이고 광범위한 연구 활동을 가능하게 했다. 연구자는 외부 API에 의존하지 않고 모델 가중치를 내려받고, 아키텍처를 자세히 살피고, 맞춤형 평가를 실행하며, 애플리케이션을 구축할 수 있었다. 이러한 접근은 연구 지형을 바꾸었고, 독점 모델로는 불가능했을 연구를 가능하게 했다. 연구자들은 모델 표현을 조사하고, 안전성 분석을 수행하고, 미세 조정 기법을 개발하며, 모델 변경이나 맞춤형 추론 구성이 필요한 애플리케이션을 탐구할 수 있었다.

## 활용과 영향

[LLaMA](/writing/llama-architecture-design-training-efficiency)의 공개는 언어 모델 연구·개발 공동체에 즉각적이고 광범위한 영향을 미쳤다. 공개 후 불과 몇 주 만에 연구자들은 LLaMA 모델을 토대로 한 연구, 애플리케이션, 개선 결과를 발표하기 시작했다. 이는 고품질 [기반 모델](/writing/foundation-models-report-defining-new-paradigm-ai)에 대한 개방형 접근이 얼마나 큰 변화를 일으킬 수 있는지 보여 주었다. LLaMA의 개방성은 이전에는 불가능했던 연구를 가능하게 했고, 효율성과 성능은 폭넓은 애플리케이션에 실제로 활용할 수 있는 수준이었다.

학술 연구 기관은 LLaMA의 접근성에서 특히 큰 가치를 발견했다. 이제 연구자들은 내부 표현 연구, 훈련 동역학 분석, 새로운 아키텍처 기법 개발처럼 모델 가중치에 직접 접근해야 하는 실험을 수행할 수 있었다. 특수 데이터셋으로 모델을 미세 조정할 수 있게 되면서, API 기반 접근으로는 비용이 지나치게 많이 들거나 불가능했던 영역 특화 연구도 가능해졌다. 대학과 연구소는 [LLaMA](/writing/llama-architecture-design-training-efficiency) 모델을 활용해 자체 애플리케이션을 구축하고 안전성 연구를 수행하기 시작했으며, 연구 관점과 활용 사례의 다양성도 넓어졌다.

스타트업과 오픈 소스 공동체는 LLaMA를 빠르게 받아들여, 접근 가능한 모델 가중치를 활용한 애플리케이션·도구·개선책을 만들었다. 개발자들은 독점 모델로는 만들기 어렵거나 불가능했을 미세 조정 프레임워크, 추론 최적화, 애플리케이션별 적응 기법을 개발했다. LLaMA-7B를 명령 따르기 데이터로 미세 조정한 Alpaca 같은 프로젝트는 적당한 컴퓨팅 자원으로도 고품질 [명령 조정](/writing/instruction-following-llm-tuning-fundamentals) 모델을 만들 수 있음을 보여 주었고, 첨단 언어 모델 역량에 대한 접근을 한층 더 대중화했다.

LLaMA 모델의 효율성은 비용, 지연 시간, 개인정보 보호가 중요한 배포 시나리오에서 특히 유용했다. 조직은 자체 인프라에 LLaMA 모델을 배포해 [API 비용](/writing/managing-reducing-ai-agent-costs-optimization-strategies)을 피하고 데이터와 추론을 완전히 통제할 수 있었다. 에지 배포나 에어갭 환경처럼 오프라인 작동이 필요한 애플리케이션도 [LLaMA](/writing/llama-architecture-design-training-efficiency) 모델로 구현할 수 있게 되었다. LLaMA 제품군의 소형 모델은 소비자용 하드웨어에서도 실행할 수 있었으므로, 이전에는 자원이 풍부한 조직에만 가능했던 개인용 활용과 실험도 가능해졌다.

LLaMA의 공개는 안전·윤리 연구도 촉진했다. 모델 가중치에 직접 접근해 광범위한 평가를 수행할 수 있게 되면서, 연구자들은 독점 모델에서 가능했던 것보다 모델의 편향, 실패 양상, 안전 속성을 더 철저히 조사할 수 있었다. 이러한 연구는 모델의 한계를 더 잘 이해하고 향상된 안전 기법을 개발하는 데 기여했다. LLaMA의 개방성 덕분에 안전 문제를 식별하고 해결하는 일을 모델 개발자에게만 맡기지 않고 연구 공동체가 협력할 수 있게 되었다.

그 영향은 더 넓은 오픈 소스 언어 모델 생태계로 확장되었다. LLaMA는 개방형 모델도 독점 시스템과 경쟁할 만한 성능을 달성할 수 있음을 보여 주었고, 다른 조직에도 개방형 모델을 개발하고 공개할 동기를 부여했다. 2023년 내내 [MPT](/writing/modern-portfolio-theory-mean-variance-optimization), Falcon, [Mistral](/writing/mistral-architecture-sliding-window-attention) 등을 비롯한 개방형 언어 모델의 물결이 일어났다. 이들은 각각 [LLaMA](/writing/llama-architecture-design-training-efficiency)가 마련한 토대 위에서 발전했다. 이러한 생태계의 성장은 혁신을 가속했고, 연구자와 개발자에게 서로 다른 활용 사례와 요구에 맞는 다양한 선택지를 제공했다.

LLaMA를 중심으로 형성된 미세 조정 생태계는 특정 과제와 영역에 모델을 빠르게 적응할 수 있게 했다. LoRA 같은 매개변수 효율적 미세 조정 기법은 최소한의 컴퓨팅 자원으로 LLaMA 모델을 적응할 수 있게 해 여러 영역의 특화 애플리케이션을 가능하게 했다. 연구자와 개발자는 코딩 과제, 수학적 추론, [다국어](/writing/xlm-cross-lingual-language-model-multilingual-nlp) 애플리케이션을 비롯한 수많은 특수 활용 사례에 맞게 LLaMA 모델을 미세 조정했고, 개방형 접근이 제공하는 범용성을 입증했다.

## 한계

[LLaMA](/writing/llama-architecture-design-training-efficiency)는 큰 기여를 했지만 적용과 사용에 영향을 주는 중요한 한계도 있었다. 주된 문제 가운데 하나는 라이선스와 접근 모델이었다. 독점 시스템보다 개방적이기는 했지만 여전히 신청 절차를 거쳐야 했고 사용 제한도 포함되어 있었다. 최초 공개 때는 연구자가 접근을 신청해야 했으며, 라이선스에는 특정 유형의 상업적 이용을 제한하는 조건이 들어 있었다. 이 접근은 개방성과 책임 사이에서 균형을 추구했지만 완전히 제한 없는 접근과 이용을 가로막는 장벽이 되었다.

모델 자체도 역량과 훈련 데이터 측면에서 한계가 있었다. LLaMA 모델은 여러 벤치마크에서 강력한 성능을 달성했지만, 기본 상태에서는 [명령 조정](/writing/instruction-following-llm-tuning-fundamentals)이 되어 있지 않았고 [인간 선호](/writing/rlhf-foundations-reinforcement-learning-human-preferences)에 정렬되지도 않았다. 따라서 기본 LLaMA 모델을 대화나 명령 따르기 애플리케이션에 유용하게 쓰려면 추가 미세 조정이나 프롬프팅 기법이 필요했다. 명령 따르기 역량이 필요한 사용자는 모델을 직접 미세 조정하거나 공동체가 개발한 미세 조정 버전에 의존해야 했고, 이는 복잡성과 컴퓨팅 요구량을 더했다.

[LLaMA](/writing/llama-architecture-design-training-efficiency)의 훈련 데이터는 세심하게 선별되었지만 인터넷 규모 텍스트 말뭉치에 존재하는 편향과 한계를 반영했다. 모델은 유해 콘텐츠를 재현하고 사회적 편향을 반영하거나 부정확한 정보를 생성할 수 있었다. 이는 모든 대규모 언어 모델에 공통된 문제였지만, 독점 API 서비스가 일반적으로 포함하는 안전 필터와 [콘텐츠 조정](/writing/content-safety-and-moderation-ai-agents) 없이 배포할 수 있는 개방형 모델에서는 특히 중요했다. LLaMA 모델을 배포하는 사용자는 자체 안전 조치와 콘텐츠 필터링을 구현해야 했다.

컴퓨팅 요구량은 독점 모델보다 적었지만 여전히 많은 잠재적 사용자에게 장벽이었다. 가장 작은 LLaMA-7B 모델조차 효율적으로 실행하려면 상당한 GPU 메모리가 필요했고, 미세 조정에는 추가 컴퓨팅 자원이 들었다. 모델을 처음부터 훈련하는 것보다는 접근하기 쉬웠지만, LLaMA 모델을 배포하고 미세 조정하려면 여전히 상당한 하드웨어 자원이 필요했으므로 일부 연구자와 조직은 접근하기 어려웠다.

[LLaMA](/writing/llama-architecture-design-training-efficiency) 모델의 평가와 벤치마킹에서는 특정 종류의 과제에 대한 성능 한계가 드러났다. 여러 벤치마크에서는 경쟁력 있는 성능을 보였지만, 특히 광범위한 지식이나 복잡한 추론 또는 전문 영역이 필요한 일부 과제에서는 가장 큰 독점 모델의 성능에 미치지 못했다. 모델의 지식은 기준 날짜가 있는 훈련 데이터에 한정되었고, 외부 정보에 접근하거나 실시간으로 업데이트할 수도 없었다.

LLaMA의 [다국어](/writing/xlm-cross-lingual-language-model-multilingual-nlp) 역량은 다국어 과제를 위해 명시적으로 설계된 모델보다 제한적이었다. 훈련 데이터에 여러 언어의 콘텐츠가 포함되었지만 모델은 주로 영어에 최적화되어 있었고, 많은 비영어권 언어에서 더 약한 성능을 보였다. 이 한계는 LLaMA 모델을 전 세계적으로 적용하는 데 영향을 주었으며, 여러 다국어 활용 사례에는 추가 미세 조정이나 특화 모델이 필요했다.

내장된 안전 메커니즘이 없었기 때문에 LLaMA 모델을 배포할 때는 안전과 [콘텐츠 조정](/writing/content-safety-and-moderation-ai-agents)을 신중히 고려해야 했다. 콘텐츠 필터와 안전 조치가 포함된 독점 API 서비스와 달리, [LLaMA](/writing/llama-architecture-design-training-efficiency) 모델은 유해하거나 편향되고 부적절한 콘텐츠를 포함해 프롬프트로 요구받은 모든 콘텐츠를 생성했다. 이 때문에 안전에 대한 책임이 사용자에게 넘어갔고, 사용자는 적절한 안전장치를 구현해야 했다. 그러나 많은 사용자는 이를 효과적으로 수행할 준비가 되어 있지 않았다.

## 유산과 전망

[LLaMA](/writing/llama-architecture-design-training-efficiency)는 고품질 [기반 모델](/writing/foundation-models-report-defining-new-paradigm-ai)에 대한 개방형 접근을 언어 모델 개발의 기본 원칙으로 자리 잡게 했다. 그 결과 독점 시스템이 지배하던 분야는 활기찬 오픈 소스 생태계가 공존하는 지형으로 바뀌었다. LLaMA의 성공은 개방형 모델도 경쟁력 있는 성능을 달성하는 동시에 API 기반 접근으로는 불가능했던 연구·혁신·애플리케이션 개발을 가능하게 할 수 있음을 보여 주었다. 이러한 변화는 연구·개발 공동체 전반에서 언어 모델을 개발하고 공개하며 사용하는 방식에 지속적인 영향을 미쳤다.

LLaMA의 아키텍처 혁신은 후속 모델 개발에 영향을 미쳤고, 이후 수많은 모델이 비슷한 기법을 채택했다. [RMSNorm](/writing/rmsnorm-efficient-normalization-modern-llms), [SwiGLU](/writing/gated-linear-units-swiglu-transformer-ffn) 활성화 함수, [RoPE](/writing/rotary-position-embedding-rope-transformers) 위치 [임베딩](/writing/long-term-knowledge-storage-and-retrieval)은 많은 [트랜스포머](/writing/transformer-attention-is-all-you-need) 아키텍처의 표준 구성 요소가 되었으며, 이는 이러한 개선책의 가치를 보여 준다. LLaMA가 강조한 효율과 최적의 [자원 배분](/writing/minimum-cost-flow-slotting-network-optimization-resource-allocation)은 모델 개발의 지도 원칙으로 자리 잡았다. 연구자들은 원시 성능뿐 아니라 계산 효율과 실제 배포 가능성까지 고려하게 되었다.

[LLaMA](/writing/llama-architecture-design-training-efficiency)가 촉진한 오픈 소스 언어 모델 생태계는 계속 성장하고 발전했다. 훈련과 안전 조치를 개선한 LLaMA 2를 비롯한 후속 모델과 다른 조직의 모델들이 LLaMA가 마련한 토대 위에서 발전했다. 생태계에서는 더 나은 미세 조정 기법, 평가 방법, 안전 접근법이 개발되었으며, 이 모든 발전은 LLaMA가 선도한 개방형 접근 덕분에 가능했다. 이러한 생태계의 성장은 혁신을 가속하고 연구 공동체에 갈수록 유능하고 접근하기 쉬운 모델을 제공했다.

LLaMA의 개방형 접근으로 가능해진 연구는 언어 모델의 역량·한계·행동을 이해하는 데 진전을 가져왔다. 연구자는 이전에는 불가능했던 수준의 접근권으로 모델 내부를 연구하고, 상세한 안전성 분석을 수행하며, 새로운 기법을 개발할 수 있었다. 이 연구는 언어 모델이 어떻게 작동하고 무엇을 할 수 있으며 무엇을 할 수 없는지, 그리고 어떻게 역량과 안전성을 높일 수 있는지에 대한 해당 분야의 이해를 개선했다. LLaMA의 개방성은 모델에 대한 깊은 접근이 필요한 질문을 다루는 협력 연구를 가능하게 했다.

앞으로도 [LLaMA](/writing/llama-architecture-design-training-efficiency)가 확립한 원칙은 언어 모델 개발의 길잡이로 남을 것이다. 효율, 개방형 접근, 실용적 배포 가능성에 대한 강조는 분야가 발전하는 가운데도 여전히 중요하다. 새로운 모델은 LLaMA의 아키텍처 혁신을 계속 계승하면서 [다국어](/writing/xlm-cross-lingual-language-model-multilingual-nlp) 역량 개선, 안전 조치 강화, 명령 따르기 역량 확대 같은 방식으로 LLaMA의 한계를 해결하고 있다. LLaMA가 만드는 데 기여한 오픈 소스 생태계는 언어 모델 연구·개발의 핵심 요소가 되었다.

LLaMA의 영향은 언어 모델링을 넘어 개방형 과학, 연구 대중화, 책임 있는 AI 시스템 개발에 관한 더 폭넓은 질문으로 이어진다. LLaMA는 개방형 모델도 경쟁력 있는 성능을 달성하면서 더 많은 연구 참여를 가능하게 할 수 있음을 보여 주었고, 다른 AI 시스템을 개발하고 공개하는 방식에도 영향을 미쳤다. LLaMA가 추구한 개방성과 책임 사이의 균형은 갈수록 유능해지는 AI 시스템을 어떻게 개발하고 배포할지 고민하는 오늘날에도 중요한 문제로 남아 있다.

[LLaMA](/writing/llama-architecture-design-training-efficiency)의 유산에는 모델 자체뿐 아니라 그 주변에서 생겨난 연구·도구·애플리케이션 생태계도 포함된다. 이 생태계는 [기반 모델](/writing/foundation-models-report-defining-new-paradigm-ai)에 대한 개방형 접근의 가치를 보여 주었고, 개방형 모델을 개발·공개·사용하는 방식의 전형을 확립했다. 언어 모델의 역량이 계속 발전하는 가운데, LLaMA가 보여 준 효율성·접근성·책임 있는 공개의 원칙은 이 분야의 지속적인 발전을 떠받치는 기반으로 남아 있다.
