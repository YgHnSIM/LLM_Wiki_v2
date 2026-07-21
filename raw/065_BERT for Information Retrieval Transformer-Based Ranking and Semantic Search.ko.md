# 정보 검색을 위한 BERT: 트랜스포머 기반 랭킹과 의미 검색

출처: https://mbrenndoerfer.com/writing/bert-information-retrieval-transformer-ranking-semantic-search

---



2019년 정보 검색에 BERT를 적용한 방식을 종합적으로 설명하는 안내서다. 트랜스포머 아키텍처가 교차 어텐션 메커니즘, 세밀한 질의-문서 매칭, 문맥 이해를 통해 검색 및 랭킹 시스템을 어떻게 혁신하고 키워드 매칭을 넘어 관련성을 개선했는지 알아본다.

## 2019년: 정보 검색을 위한 BERT

2019년은 2018년에 자연어 이해에 혁신을 일으킨 트랜스포머의 양방향 인코더 표현인 [BERT](/writing/bert-bidirectional-pretraining-revolutionizes-language-understanding)를 검색 및 랭킹 시스템 개선에 적용하면서 정보 검색이 크게 전환된 해였다. [신경망 정보 검색](/writing/neural-information-retrieval-semantic-search)은 이미 학습된 의미 표현의 위력을 입증했지만, BERT의 심층 문맥 이해는 훨씬 더 정교한 질의-문서 매칭의 가능성을 열었다. 과제는 [질의응답](/writing/ibm-watson-jeopardy-open-domain-question-answering-nlp-information-retrieval)과 분류 같은 이해 과제를 위해 설계된 BERT 아키텍처를 정보 검색의 고유한 요구 사항, 즉 질의를 빠르게 처리하고 수백만 개의 문서를 순위화하며 세밀한 수준에서 관련성을 이해하는 일에 맞게 조정하는 것이었다.

정보 검색에 BERT를 적용하려는 움직임은 Microsoft Research, Google, 여러 대학 등의 연구자들이 주도했다. 이들은 BERT의 양방향 [어텐션 메커니즘](/writing/attention-mechanism-intuition-soft-lookup-weights-context-vectors)과 심층 문맥 표현이 신경망 검색에서 지배적이었던 [이중 인코더](/writing/dense-retrieval-semantic-search-bi-encoders) 접근법보다 질의-문서 관계를 더 효과적으로 포착할 수 있다고 보았다. 이 연구자들은 근본적인 긴장 관계에 직면했다. [BERT](/writing/bert-bidirectional-pretraining-revolutionizes-language-understanding)의 강점은 [교차 어텐션](/writing/cross-attention-encoder-decoder-transformers)을 통해 질의와 문서 텍스트를 공동으로 처리하는 능력에 있었고, 덕분에 질의 용어와 문서 내용 사이의 세밀한 상호작용을 모델링할 수 있었다. 그러나 이 강점에는 상당한 계산 비용이 따랐다. 질의-문서 쌍을 공동으로 인코딩하려면 각 쌍을 따로 처리해야 했기 때문에 대규모 문서 컬렉션을 대상으로 한 실시간 검색에는 비현실적이었다.

정보 검색을 위한 BERT의 의의는 당장의 성능 향상을 넘어섰다. 검색에 BERT를 적용함으로써 [트랜스포머](/writing/transformer-attention-is-all-you-need) 아키텍처를 랭킹 과제에 효과적으로 맞출 수 있음이 입증되었고, 더 정교한 신경망 랭킹 모델로 가는 길이 열렸다. 또한 관련성을 이해하는 데 문맥 인식 표현이 중요하다는 사실도 부각되었다. 같은 단어라도 질의와 문서 양쪽에서 문맥에 따라 서로 다른 의미를 가질 수 있음을 보여준 것이다. 이러한 문맥 이해는 단순한 키워드 매칭보다 뉘앙스 파악이 중요한 모호한 질의, 전문 용어, 복잡한 정보 요구에 특히 유용했다.

정보 검색을 위한 [BERT](/writing/bert-bidirectional-pretraining-revolutionizes-language-understanding)의 발전은 검색 시스템에서 효과성과 효율성 사이의 균형을 맞춰야 하는 지속적인 과제도 드러냈다. BERT 기반 랭킹 모델은 관련성 벤치마크에서 당시 최고 수준의 결과를 달성했지만, 계산 요구량 때문에 실제 배포에는 한계가 있었다. 정확도와 효율성 사이의 이러한 긴장은 효율적인 트랜스포머 아키텍처, 모델 압축, [하이브리드 검색](/writing/hybrid-retrieval-combining-sparse-dense-methods-effective-information-retrieval) 전략의 혁신을 이끌었다. 하이브리드 검색 전략은 BERT의 효과성과 [이중 인코더](/writing/dense-retrieval-semantic-search-bi-encoders) 접근법의 효율성을 결합했다. 따라서 정보 검색에서 BERT가 걸어온 역사는 단순히 성능이 향상된 이야기가 아니라, 정교한 모델을 현실 세계의 검색 애플리케이션에서 어떻게 실용화할 수 있었는지에 관한 이야기이기도 하다.

## 문제

기존 [신경망 정보 검색](/writing/neural-information-retrieval-semantic-search) 시스템은 질의와 문서 사이의 미묘한 관계를 이해하는 능력에 근본적인 한계가 있었다. 2016년에 지배적인 접근법으로 부상한 [이중 인코더](/writing/dense-retrieval-semantic-search-bi-encoders) 아키텍처는 질의와 문서의 표현을 각각 학습한 다음 [벡터 유사도](/writing/vector-similarity-search-metrics-ann-faiss)를 사용해 비교했다. 이 접근법은 계산 효율이 높고 실시간 검색을 가능하게 했지만, 질의와 문서 내용 사이의 세밀한 상호작용을 포착하는 데 본질적인 한계가 있었다. 사용자가 "affordable luxury hotels(가격이 합리적인 고급 호텔)"을 검색할 때, 이중 인코더는 "affordable"과 "luxury"가 어떻게 상호작용하는지 이해하기 어려울 수 있었다. 그 결과 두 용어가 서로 양립할 수 없는 방식으로 포함된 문서의 순위를 높이거나, 두 단어의 결합에서 생기는 미묘한 의미를 놓칠 가능성이 있었다.

학습된 [임베딩](/writing/long-term-knowledge-storage-and-retrieval)과 실제 관련성 사이의 의미 격차도 중대한 과제였다. 이중 인코더 모델은 질의와 문서를 하나의 공유 임베딩 공간에 사상하고, 그 공간에서의 유사도가 관련성을 나타내도록 학습했다. 그러나 이 접근법은 모든 관련 질의-문서 관계를 고정 차원의 공간에서 하나의 유사도 점수로 포착할 수 있다고 가정했다. 실제로 관련성은 다면적이다. 문서는 질의에 직접 답하거나, 맥락을 제공하거나, 대안적 관점을 제시하거나, 연관 정보를 포함하기 때문에 관련될 수 있다. 하나의 임베딩으로는 관련성의 서로 다른 차원을 모두 포착하기 어려울 수 있으며, 질의와 문서가 복잡한 관계나 부정 표현, 조건부 관련성의 이해를 요구할 때는 특히 그러했다.

이중 인코더의 계산 효율성은 제한적인 상호작용 모델링을 대가로 얻은 것이었다. 질의와 문서를 별도로 인코딩하기 때문에 이 시스템은 특정 질의 용어가 문서의 특정 구절과 어떻게 상호작용하는지를 직접 모델링할 수 없었다. 예를 들어 질의가 "약물 X의 부작용은 무엇인가"라고 물을 때, [이중 인코더](/writing/dense-retrieval-semantic-search-bi-encoders)는 "부작용"과 "약물 X"를 모두 언급한 문서를 검색할 수 있지만, 두 표현이 서로 무관한 맥락에 등장한다는 중요한 사실을 놓칠 수 있었다. 시스템은 질의 용어가 문서의 어디에, 어떤 방식으로 나타나는지에 주의를 기울일 수 없었고, 따라서 정확한 랭킹에 결정적일 수 있는 국소적 관련성 신호를 이해하는 능력이 제한되었다.

어휘와 문맥의 불일치 문제는 신경망 접근법을 사용해도 여전히 까다로웠다. 이중 인코더는 일부 의미 관계를 학습할 수 있었지만, 학습 데이터에 드물게 등장하는 희귀 용어, 도메인 특화 용어, 새로 등장한 어휘를 처리하는 데 자주 어려움을 겪었다. 문서가 전문 용어를 사용하고 질의는 같은 내용을 일상어로 표현하거나 그 반대인 경우, 이중 인코더는 둘 사이의 연결을 찾지 못할 수 있었다. 다양한 텍스트 말뭉치에서 광범위하게 사전 학습된 [BERT](/writing/bert-bidirectional-pretraining-revolutionizes-language-understanding)는 훨씬 넓은 범위의 어휘와 문맥을 이해할 잠재력이 있었지만, 이 이해를 검색 과제에 적용하려면 신중한 아키텍처 선택이 필요했다.

질의 길이와 문서 길이의 차이도 추가적인 과제를 낳았다. 이중 인코더는 일반적으로 질의와 문서를 고정 크기 벡터로 인코딩하도록 학습하므로, 가변 길이 텍스트를 고정된 표현으로 압축하기 위한 정교한 풀링 전략이 필요했다. 매우 긴 문서는 풀링 과정에서 중요한 정보가 유실될 수 있었고, 시스템이 가장 관련성 높은 구절에 집중하기 어려울 수 있었다. 한편 짧은 질의는 효과적인 임베딩을 만들기에 신호가 부족할 수 있었으며, 특히 중의적인 용어가 포함되어 문맥으로 의미를 분명히 해야 할 때 그러했다. 완전한 어텐션으로 가변 길이 시퀀스를 처리하는 BERT의 능력은 이러한 한계를 해결할 가능성이 있었지만, 이를 효율적인 검색에 적용하려면 혁신적인 접근법이 필요했다.

새로운 콘텐츠와 질의에 대한 콜드 스타트 문제도 [이중 인코더](/writing/dense-retrieval-semantic-search-bi-encoders) 접근법에 남아 있었다. 신경망 검색 모델은 과거의 관련성 데이터로부터 학습했기 때문에 상호작용 이력이 거의 없는 새 문서나 새롭게 부상하는 주제의 질의를 처리하는 데 어려움을 겪을 수 있었다. 사전 학습된 [임베딩](/writing/long-term-knowledge-storage-and-retrieval)이 일반적인 의미 지식을 제공해 도움을 주기는 했지만, 미세 조정 과정에는 여전히 과제별 관련성 데이터가 필요했다. 학습 데이터의 패턴과 일치하지 않는 새로운 콘텐츠나 질의는 낮은 순위를 받을 수 있었고, 이로 인해 빠르게 변하는 정보 요구에 신경망 검색 시스템이 적응하는 능력이 제한되었다.

## 해결책

정보 검색을 위한 [BERT](/writing/bert-bidirectional-pretraining-revolutionizes-language-understanding)는 더 정교한 질의-문서 매칭에 [트랜스포머](/writing/transformer-attention-is-all-you-need) 아키텍처를 활용하는 몇 가지 핵심 혁신으로 이러한 한계를 해결했다. 근본적인 통찰은 BERT의 양방향 [어텐션 메커니즘](/writing/attention-mechanism-intuition-soft-lookup-weights-context-vectors)과 심층 문맥 표현이 이중 인코더가 놓치는 질의와 문서 사이의 세밀한 상호작용을 포착할 수 있다는 것이었다. BERT 기반 검색 접근법은 질의와 문서를 별도로 인코딩하는 대신 질의-문서 쌍을 공동으로 처리할 수 있었고, 그 결과 특정 질의 용어가 특정 문서 구절과 어떻게 관련되는지 모델이 주의를 기울일 수 있었다.

### 교차 어텐션 아키텍처

BERT 기반 검색의 핵심 혁신은 인코딩 중에 질의와 문서가 직접 상호작용하도록 하는 [교차 어텐션](/writing/cross-attention-encoder-decoder-transformers) 메커니즘이었다. BERT 기반 랭킹 모델은 질의와 문서를 서로 독립적인 [임베딩](/writing/long-term-knowledge-storage-and-retrieval)으로 각각 인코딩하는 대신, 질의와 문서 텍스트를 특수 구분 토큰과 함께 이어 붙인 다음 결합된 시퀀스를 [BERT](/writing/bert-bidirectional-pretraining-revolutionizes-language-understanding)의 트랜스포머 층으로 처리했다. 이 공동 인코딩은 양방향 어텐션을 가능하게 했다. 즉 질의 토큰이 문서 토큰에 주의를 기울이고 그 반대도 가능해져, 모델은 어떤 문서 구절이 질의의 어느 측면과 가장 관련 있는지 식별할 수 있었다.

BERT 기반 검색의 입력 형식은 일반적으로 질의와 문서를 특수 토큰으로 이어 붙인 `[CLS] query text [SEP] document text [SEP]` 패턴을 따랐다. `[CLS]` 토큰의 최종 표현을 관련성 점수 산출에 사용할 수도 있었고, 모델이 [어텐션 가중치](/writing/attention-mechanism-intuition-soft-lookup-weights-context-vectors)를 이용해 관련 구절을 식별할 수도 있었다. 이 형식 덕분에 BERT는 "affordable luxury hotels"가 경제성과 품질 사이에서 균형을 이루는 호텔을 뜻하며, 경제성과 고급스러움을 서로 무관한 맥락에서 따로 언급한 문서를 뜻하지 않는다는 점을 이해할 수 있었다. [교차 어텐션](/writing/cross-attention-encoder-decoder-transformers)은 이중 인코더가 만드는 거친 유사도 점수를 훨씬 넘어서는 세밀한 매칭을 가능하게 했다.

세밀한 매칭을 위한 교차 어텐션

BERT 기반 검색의 교차 어텐션 메커니즘은 질의-문서 관계를 모델링하는 방식을 근본적으로 바꾸었다. 고정된 임베딩을 비교하는 이중 인코더와 달리, 교차 어텐션에서는 각 질의 토큰이 모든 문서 토큰에 주의를 기울이고 그 반대도 가능했다. 이는 질의에 "affordable luxury"가 포함되었을 때, 모델이 두 용어가 양립 가능한 맥락에서 함께 등장하는 문서 구절을 찾아내는 한편, 두 용어가 따로 나타나거나 서로 모순되는 방식으로 나타난 구절은 무시할 수 있음을 의미했다. 이러한 세밀한 상호작용 모델링 덕분에 BERT는 이전 접근법보다 훨씬 정교한 수준에서 관련성을 이해할 수 있었다.

### 사전 학습의 이점

대규모 텍스트 말뭉치에서 광범위하게 사전 학습된 [BERT](/writing/bert-bidirectional-pretraining-revolutionizes-language-understanding)는 검색 데이터만으로 처음부터 학습한 모델보다 결정적인 이점이 있었다. 사전 학습된 BERT 모델은 구문, 의미, 텍스트의 일반적인 패턴을 이해하며 이미 풍부한 언어 표현을 학습한 상태였다. 검색 과제에 미세 조정하면 BERT는 이 일반 지식을 활용하여 관련성 레이블만으로 표현을 학습한 모델보다 질의와 문서를 더 효과적으로 이해할 수 있었다. 이는 검색 학습 데이터에 드물게 등장할 수 있는 희귀 용어, 도메인 특화 용어, 복잡한 언어 구문을 처리할 때 특히 유용했다.

사전 학습은 BERT가 문맥 의존적인 의미를 이해하는 데도 도움이 되었다. 같은 단어라도 문맥에 따라 다른 뜻을 가질 수 있으며, BERT의 양방향 어텐션은 주변 단어를 토대로 그 의미를 판별할 수 있게 했다. 질의가 "river bank(강둑)"와 "financial bank(금융 은행)"라는 문맥에서 "bank"를 물을 때, BERT는 문맥 단서를 사용해 의도한 의미를 파악하고 관련 문서와 연결할 수 있었다. 이러한 문맥 이해는 더 정적인 표현을 학습하는 경우가 많아 다의성과 문맥 의존적 의미를 처리하기 어려울 수 있는 이중 인코더에 비해 상당한 이점이었다.

### 재순위화 아키텍처

정보 검색을 위한 [BERT](/writing/bert-bidirectional-pretraining-revolutionizes-language-understanding)의 가장 실용적인 응용 중 하나는 재순위화 시나리오였다. 이 시나리오에서 BERT는 초기 단계가 검색한 후보 문서의 품질을 향상할 수 있었다. 이 2단계 접근법은 [BM25](/writing/bm25-probabilistic-ranking-information-retrieval)나 [이중 인코더](/writing/dense-retrieval-semantic-search-bi-encoders)처럼 빠른 1단계 검색기를 사용해 수백만 개의 문서를 일반적으로 100~1,000개의 작은 후보 집합으로 줄임으로써 BERT의 계산 한계에 대응했다. 그런 다음 BERT는 훨씬 작아진 집합을 재순위화하면서 정교한 [교차 어텐션](/writing/cross-attention-encoder-decoder-transformers)을 적용해 후보 중 가장 관련성 높은 문서를 식별할 수 있었다.

이 재순위화 아키텍처는 효율성과 효과성 사이에서 효과적인 균형을 제공했다. 첫 단계는 규모 문제를 처리하여 문서를 관리 가능한 후보 집합으로 빠르게 걸러냈다. 두 번째 단계는 후보에 BERT의 정교한 이해 능력을 적용해 최종 랭킹의 품질을 높였다. 수백 개 문서에 BERT를 실행하는 계산 비용은 수백만 개 문서에 실행하는 비용보다 훨씬 감당하기 쉬웠으므로, 이 하이브리드 접근법은 현실 세계의 검색 시스템에서 실용적이었다. 이 패턴은 빠른 검색 시스템과 더 정교하지만 계산 비용이 큰 재순위화 모델을 결합하는 여러 상용 검색 엔진의 표준이 되었다.

### 랭킹을 위한 학습

정보 검색을 위해 [BERT](/writing/bert-bidirectional-pretraining-revolutionizes-language-understanding)를 학습하려면 표준 [BERT 미세 조정](/writing/bert-finetuning-classification-ner-qa) 절차를 랭킹 과제에 맞게 조정해야 했다. 검색 시스템에는 분류나 [시퀀스 레이블링](/writing/history-crf-conditional-random-fields) 목적 함수 대신, 모델이 비관련 문서보다 관련 문서에 더 높은 점수를 부여하도록 유도하는 랭킹 목적 함수가 필요했다. 이는 일반적으로 쌍별(pairwise) 또는 목록별(listwise) 랭킹 손실을 사용하여 모델이 관련 질의-문서 쌍과 비관련 쌍을 구별하도록 학습하는 방식이었다.

BERT 기반 검색의 학습 데이터는 관련성 판정이 레이블로 붙은 질의-문서 쌍으로 이루어졌다. 이러한 레이블은 클릭 로그, 전문가 판정, 그 밖에 질의에 대한 문서의 관련성을 나타내는 출처에서 얻을 수 있었다. 학습 중 BERT는 관련 쌍에는 더 높은 관련성 점수를, 비관련 쌍에는 더 낮은 점수를 내도록 학습했다. [교차 어텐션](/writing/cross-attention-encoder-decoder-transformers) 메커니즘은 중요한 질의-문서 상호작용에 집중하도록 학습했고, 심층 [트랜스포머](/writing/transformer-attention-is-all-you-need) 층은 이러한 상호작용을 종합적인 관련성 판단으로 결합하는 법을 학습했다.

### 길이 변화 처리

[BERT](/writing/bert-bidirectional-pretraining-revolutionizes-language-understanding) 기반 검색은 완전한 어텐션으로 가변 길이 시퀀스를 처리하는 능력을 통해 질의와 문서의 길이 차이에 대응했다. 모든 내용을 고정 크기 벡터로 압축하는 이중 인코더와 달리, BERT는 질의와 문서를 원래 길이대로 처리하면서 모든 토큰에 주의를 기울이고 어느 부분이 가장 관련성 높은지 학습할 수 있었다. 긴 문서의 경우 BERT는 [어텐션 가중치](/writing/attention-mechanism-intuition-soft-lookup-weights-context-vectors)를 통해 가장 관련성 높은 구절을 식별하여 질의에 가장 중요한 부분에 효과적으로 집중할 수 있었다.

문서가 일반적으로 512토큰인 BERT의 최대 시퀀스 길이를 넘으면, 시스템은 문서를 서로 겹치는 구절로 나누어 각 구절을 BERT로 처리하는 구절 단위 검색 같은 전략을 개발했다. 그런 다음 모델이 각 구절의 순위를 독립적으로 매기고, 가장 높은 순위를 받은 구절로 해당 구절이 속한 문서를 대표할 수 있었다. 또는 슬라이딩 윈도나 계층적 접근법을 사용해 긴 문서의 서로 다른 부분을 따로 처리한 뒤 결과를 결합할 수도 있었다.

## 응용과 영향

정보 검색을 위한 [BERT](/writing/bert-bidirectional-pretraining-revolutionizes-language-understanding)의 즉각적인 응용은 웹 검색 엔진에서 가장 뚜렷하게 나타났다. 주요 검색 제공업체들이 검색 품질을 높이기 위해 BERT 기반 랭킹 모델을 도입하기 시작했기 때문이다. Google은 2019년에 영어 검색 "10건 중 1건"을 처리하는 데 BERT를 사용하겠다고 발표했는데, 이는 [트랜스포머](/writing/transformer-attention-is-all-you-need) 기반 랭킹의 중요한 배포 사례였다. 이 시스템들은 주로 재순위화에 BERT를 사용했다. 초기 검색 단계에서 후보 문서를 찾고, BERT가 질의 의도와 문서 관련성을 더 잘 이해하여 순위를 정교하게 다듬는 방식이었다. 사용자는 특히 키워드 매칭을 넘어 문맥, 뉘앙스, 의도에 대한 이해가 필요한 복잡한 질의에서 더 나은 결과를 경험하기 시작했다.

전자상거래 검색 시스템은 상품 탐색과 관련성을 개선하기 위해 BERT 기반 검색을 도입했다. 사용자가 자신의 요구를 자연어 질의로 설명하면, BERT는 의미적 의도를 이해하고 상품 설명에 다른 용어가 쓰였더라도 그 요구를 충족하는 상품과 연결할 수 있었다. "durable laptop for video editing under $1500(1,500달러 미만의 내구성 좋은 영상 편집용 노트북)"과 같은 질의는 여러 제약 조건을 이해하고 이를 제품 사양과 연결해야 했으며, [BERT](/writing/bert-bidirectional-pretraining-revolutionizes-language-understanding)의 [교차 어텐션](/writing/cross-attention-encoder-decoder-transformers) 메커니즘은 이를 이전 접근법보다 더 효과적으로 처리했다. 사용자가 관련 상품을 더 빠르고 정확하게 찾을 수 있게 되면서 쇼핑 경험도 개선되었다.

기업 검색과 [지식 베이스](/writing/wikidata-collaborative-knowledge-base-language-ai) 시스템도 BERT 기반 검색의 혜택을 크게 받았다. 내부 지식 관리 시스템에는 직원이 검색해야 하는 기술 문서, FAQ, 조직 지식이 흔히 들어 있었다. BERT는 서로 다른 용어가 사용되더라도 문맥을 이해하고 질의를 관련 콘텐츠와 연결할 수 있어 내부 지식의 검색 가능성을 높였다. 직원들은 자연어로 질문하고 전통적인 키워드 검색보다 관련 문서, 절차, 과거 정보를 더 효과적으로 찾을 수 있었다.

학술 검색 엔진과 디지털 도서관은 연구 논문과 학술 콘텐츠의 발견을 개선하기 위해 정보 검색에 BERT를 도입했다. 연구자들은 연구 관심사나 개념에 관한 자연어 질문으로 검색할 수 있었고, [BERT](/writing/bert-bidirectional-pretraining-revolutionizes-language-understanding)는 정확히 일치하는 용어가 아니라 의미 이해를 바탕으로 질의를 관련 논문과 연결할 수 있었다. 이는 관련 논문이 서로 다른 어휘를 쓰는 여러 분야에 걸쳐 있을 수 있는 학제 간 연구에 특히 유용했다. BERT는 연구자들이 분야 간 연결을 발견하고 전통적인 검색 방식으로는 놓쳤을 논문을 찾는 데 도움을 주었다.

[질의응답](/writing/ibm-watson-jeopardy-open-domain-question-answering-nlp-information-retrieval) 시스템은 대규모 문서 컬렉션에서 사용자 질문에 답할 수 있는 관련 구절을 찾기 위해 BERT 기반 검색을 통합했다. BERT의 [교차 어텐션](/writing/cross-attention-encoder-decoder-transformers) 메커니즘은 질문의 답을 담고 있는 문서 속 특정 구절을 식별할 수 있어 이 응용에 특히 적합했다. 시스템은 초기 단계에서 문서를 검색한 다음 BERT를 사용해 그 문서 안에서 가장 관련성 높은 구절을 찾을 수 있었고, 문서 수준 검색을 넘어 더 정밀한 질의응답이 가능해졌다.

법률 및 전문 분야 검색 시스템은 질의와의 의미적 유사성을 바탕으로 관련 판례, 법령, 전문 문서를 찾는 데 BERT가 유용하다는 점을 발견했다. 법률 질의에는 복잡한 법 개념을 이해하고 이를 관련 판례법이나 규정과 연결해야 하는 경우가 많았으며, [BERT](/writing/bert-bidirectional-pretraining-revolutionizes-language-understanding)의 문맥 이해는 이를 키워드 기반 방식보다 더 효과적으로 처리할 수 있었다. 정확한 표현과 미묘한 차이가 중요한 법률 검색에서는 문맥과 뉘앙스를 이해하는 능력이 특히 중요했다.

정보 검색에서 BERT의 영향은 검색 엔진을 넘어 추천 시스템과 콘텐츠 발견 플랫폼으로 확장되었다. 뉴스 추천 시스템은 기사 내용과 사용자 선호를 모두 의미적으로 이해하여 사용자 관심사에 맞는 기사를 찾는 데 BERT 기반 검색을 사용할 수 있었다. 콘텐츠 플랫폼은 정교한 의미 매칭을 바탕으로 관련 콘텐츠를 추천하여 개인화와 사용자 참여를 개선할 수 있었다.

BERT 기반 검색의 상업적 성공은 [트랜스포머](/writing/transformer-attention-is-all-you-need) 기반 랭킹 연구에 대한 투자 확대로 이어졌다. 주요 기술 기업들은 검색용 BERT의 개선, 더 효율적인 아키텍처 개발, 대규모 문서 컬렉션을 처리하기 위한 시스템 확장에 초점을 둔 연구팀을 세웠다. 이러한 투자는 신경망 랭킹의 혁신을 가속하여 모델 품질, 학습 효율성, 추론 속도의 빠른 향상으로 이어졌다.

## 한계

상당한 발전에도 불구하고 정보 검색을 위한 [BERT](/writing/bert-bidirectional-pretraining-revolutionizes-language-understanding)에는 더 효율적인 접근법을 완전히 대체하지 못하게 하는 몇 가지 중요한 한계가 있었다. BERT 기반 검색의 계산 비용은 [이중 인코더](/writing/dense-retrieval-semantic-search-bi-encoders) 방식보다 훨씬 높아, 웹 검색에 필요한 전체 규모로 배포하기가 어려웠다. 각 질의-문서 쌍을 BERT로 처리하려면 상당한 계산이 필요했고, 수백만 개의 문서에 순위를 매겨야 하는 검색 시스템에서는 이 비용이 지나치게 클 수 있었다. 재순위화 아키텍처는 BERT를 더 작은 후보 집합에만 적용해 이 문제에 대응했지만, 근본적인 효율성 과제는 여전히 남았다.

BERT 기반 검색의 지연 시간도 중대한 한계였다. 재순위화를 사용하더라도 수백 개 문서에 BERT를 실행하면 눈에 띄는 지연이 생길 수 있었으며, 특히 층이 많은 대형 BERT 모델을 사용할 때 그러했다. 1초 미만의 응답 시간이 기대되는 실시간 검색 애플리케이션에서는 이러한 지연이 사용자 경험에 영향을 줄 수 있었다. 모델 증류, 양자화, 특수 하드웨어 같은 최적화가 문제 완화에 도움을 주었지만, 정확도와 속도 사이의 근본적인 절충 관계는 남아 있었다.

확장성 문제는 [BERT](/writing/bert-bidirectional-pretraining-revolutionizes-language-understanding)의 계산 요구량 때문에 수백만 개 문서를 처리하기가 비현실적인 1단계 검색에서 특히 심각했다. BERT는 작은 후보 집합을 재순위화하는 데 뛰어났지만, 초기 검색 단계는 일반적으로 여전히 [BM25](/writing/bm25-probabilistic-ranking-information-retrieval)나 이중 인코더처럼 더 효율적인 방식에 의존했다. 이는 BERT의 정교한 이해 능력이 초기 필터를 통과한 문서에만 적용되어, 1단계에서 검색하지 못한 관련성 높은 문서를 놓칠 수 있음을 뜻했다. 이러한 한계는 1단계 검색에 사용할 수 있는 더 효율적인 [트랜스포머](/writing/transformer-attention-is-all-you-need) 아키텍처 연구를 촉진했다.

효과적인 BERT 기반 검색에는 상당한 양의 학습 데이터가 필요했다. 검색 과제에 BERT를 미세 조정하려면 레이블이 붙은 질의-문서 관련성 데이터가 대량으로 필요했으며, 이를 수집하고 유지하는 데 많은 비용이 들었다. 일부 시스템은 클릭 로그나 그 밖의 암묵적 피드백을 활용할 수 있었지만, 고품질 학습 데이터에는 흔히 전문가 판정이나 신중하게 선별된 관련성 레이블이 필요했다. 대규모 관련성 데이터에 접근할 수 없는 조직은 효과적인 [BERT](/writing/bert-bidirectional-pretraining-revolutionizes-language-understanding) 기반 검색 모델을 학습하기 어려웠고, 이는 도입 장벽이 되었다.

BERT 기반 검색 시스템은 해석 가능성이 제한되어 문서가 높은 순위에 오른 이유를 이해하거나 랭킹 문제를 디버깅하기 어려웠다. [어텐션 가중치](/writing/attention-mechanism-intuition-soft-lookup-weights-context-vectors)가 모델이 질의와 문서의 어느 부분에 집중했는지 일부 통찰을 제공할 수는 있었지만, 심층 트랜스포머 아키텍처 때문에 특정 특징이나 상호작용이 관련성 점수에 어떻게 기여했는지 추적하기는 어려웠다. 이러한 불투명성 때문에 랭킹 문제를 식별하고 수정하거나, 모델 실패를 이해하거나, 사용자에게 결과를 설명하기가 어려웠다.

BERT를 사용해도 매우 긴 문서를 처리하는 일은 여전히 어려웠다. BERT는 최대 512토큰의 시퀀스를 처리할 수 있었지만, 많은 문서는 그보다 훨씬 길어 중요한 정보를 잃을 수 있는 문서 분할이나 잘라내기 전략이 필요했다. 어텐션 메커니즘은 BERT가 관련 구절에 집중하도록 도왔지만, 문서에서 가장 관련성 높은 내용이 여러 구절에 걸쳐 나뉘거나 처리 범위 밖에 있으면 시스템이 이를 놓칠 수 있었다. 이 한계는 연구 논문, 기술 문서, 법률 문서 같은 장문 콘텐츠에서 특히 문제가 되었다.

도메인 적응 문제로 인해 일반 웹 검색 데이터에 미세 조정된 [BERT](/writing/bert-bidirectional-pretraining-revolutionizes-language-understanding) 모델은 용어, 문체, 관련성 기준이 서로 다른 전문 도메인에서 좋은 성능을 내지 못할 수 있었다. 특정 도메인에 BERT를 미세 조정하려면 도메인 특화 학습 데이터가 필요했지만, 전문 분야에서는 이러한 데이터가 부족할 수 있었다. 이 때문에 의학, 법률, 전문 기술 분야 등에 BERT 기반 검색을 적용하려면 도메인 특화 학습 데이터 수집과 모델 적응에 투자해야 했다.

## 유산과 미래 전망

정보 검색을 위한 [BERT](/writing/bert-bidirectional-pretraining-revolutionizes-language-understanding)는 정교한 신경망 아키텍처가 검색 품질을 크게 높일 수 있음을 입증하며 [트랜스포머](/writing/transformer-attention-is-all-you-need) 아키텍처를 당시 최고 수준 랭킹 모델의 토대로 확립했다. BERT가 도입한 [교차 어텐션](/writing/cross-attention-encoder-decoder-transformers) 메커니즘은 세밀한 질의-문서 상호작용이 관련성 이해를 어떻게 개선할 수 있는지 보여주며 고급 랭킹 모델의 표준 구성 요소가 되었다. 검색 과제에서 BERT가 거둔 성공은 트랜스포머 기반 랭킹에 관한 후속 연구를 촉진했고, 검색에 최적화된 특화 아키텍처의 개발로 이어졌다.

BERT 기반 검색에서 등장한 재순위화 아키텍처 패턴, 즉 효율적인 1단계 검색과 정교한 2단계 재순위화를 결합하는 방식은 상용 검색 시스템의 표준이 되었다. 이 2단계 접근법은 정교한 모델의 효과성과 현실 세계 애플리케이션의 효율성 요구 사이에서 균형을 맞추어, 고급 신경망 랭킹 모델을 배포하는 실용적인 틀을 제공했다. 이 패턴은 여러 검색 시스템의 설계에 영향을 미쳤으며, 서로 다른 검색 방법을 결합한 하이브리드 접근법으로 품질과 속도를 모두 최적화했다.

정보 검색에 [BERT](/writing/bert-bidirectional-pretraining-revolutionizes-language-understanding)를 적용한 사례는 검색 시스템에서 전이 학습이 지닌 가치도 보여주었다. 사전 학습된 언어 모델을 검색 과제에 미세 조정하여 활용할 수 있다는 사실은 일반적인 언어 지식이 검색 애플리케이션에 상당한 도움을 줄 수 있음을 입증했다. 이러한 통찰은 더 나은 검색 표현을 학습하도록 대규모 질의-문서 쌍으로 학습한 모델처럼, 검색 과제에 특화된 사전 학습 모델의 개발에 영향을 미쳤다.

BERT 기반 검색의 한계는 1단계 검색에 사용할 수 있는 더 효율적인 [트랜스포머](/writing/transformer-attention-is-all-you-need) 아키텍처에 관한 연구를 촉진했다. 이는 [ColBERT](/writing/multi-vector-retrievers-fine-grained-token-level-matching-for-neural-information-retrieval) 같은 모델의 개발로 이어졌다. ColBERT는 지연 상호작용(late interaction)을 사용해 효율적인 검색을 가능하게 하면서도 [교차 어텐션](/writing/cross-attention-encoder-decoder-transformers)의 이점을 유지했으며, 그 밖에도 효과성과 효율성의 균형을 맞춘 여러 아키텍처가 개발되었다. 이러한 발전은 BERT에서 얻은 통찰을 더 실용적인 검색 시스템을 만드는 데 어떻게 적용할 수 있는지 보여주었다.

BERT를 희소 검색 방식이나 하이브리드 접근법 같은 다른 검색 기법과 통합하는 일은 중요한 연구 분야가 되었다. [BERT](/writing/bert-bidirectional-pretraining-revolutionizes-language-understanding)의 의미 이해 능력을 전통적인 키워드 기반 방식이나 효율적인 신경망 검색기와 결합하면 서로 다른 접근법의 강점을 활용하는 시스템을 만들 수 있었다. 이러한 혼합은 정교한 모델이 기존 방식을 대체하기보다 보완하여 더 견고하고 효과적인 검색 시스템을 만들 수 있음을 보여주었다.

앞으로를 내다보면, 정보 검색을 위한 BERT는 트랜스포머 기반 랭킹이 계속 발전할 수 있는 토대를 마련했다. 더 효율적인 [트랜스포머](/writing/transformer-attention-is-all-you-need) 아키텍처, 더 나은 학습 절차, 다른 검색 방식과의 통합 개선은 BERT가 놓은 기반 위에서 발전했다. 검색 과제에서 BERT가 성공한 사례는 검색 증강 생성 시스템의 발전에도 영향을 주었다. 이러한 시스템에서는 BERT 같은 정교한 검색 모델이 언어 모델로 하여금 지식 베이스의 관련 정보에 접근하고 그 정보를 근거로 출력을 생성하도록 도왔다.

정보 검색에 미친 BERT의 영향은 지금도 트랜스포머 아키텍처를 랭킹에 사용하는 현대 검색 시스템으로 이어지고 있다. 이 시스템들은 모델 압축, 효율적인 아키텍처, [하이브리드 검색](/writing/hybrid-retrieval-combining-sparse-dense-methods-effective-information-retrieval) 전략을 통해 효율성 문제에 대응한다. 세밀한 상호작용 모델링, 문맥 이해, 전이 학습을 비롯하여 [BERT](/writing/bert-bidirectional-pretraining-revolutionizes-language-understanding) 기반 검색이 확립한 원칙은 현대 검색 시스템이 콘텐츠를 이해하고 순위화하는 방식의 핵심으로 남아 있으며, 이 발전이 정보 검색 분야에 끼친 지속적인 영향력을 보여준다.
