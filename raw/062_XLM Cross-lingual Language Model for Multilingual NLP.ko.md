# XLM: 다국어 NLP를 위한 교차 언어 언어 모델

출처: https://mbrenndoerfer.com/writing/xlm-cross-lingual-language-model-multilingual-nlp

---

Facebook AI Research가 2019년에 발표한 XLM(Cross-lingual Language Model)을 종합적으로 설명한다. 번역 언어 모델링을 이용한 교차 언어 사전 학습이 언어 사이 zero-shot 전이를 어떻게 가능하게 하고 다국어 자연어 처리의 새로운 기준을 세웠는지 살펴본다.

## 2019년: XLM

2019년 Facebook AI Research는 XLM(Cross-lingual Language Model)을 발표했다. XLM은 번역 언어 모델링을 이용한 교차 언어 사전 학습으로 언어 사이에 강한 zero-shot·few-shot 전이를 실현할 수 있음을 보여 준 다국어 자연어 처리의 획기적인 모델이었다. 서로 다른 언어 사이의 의미 유사성을 포착하는 교차 언어 표현을 학습하는 능력은 [다국어 AI](/writing/specialized-llms-low-resource-languages-ai-equity-global-accessibility) 응용에 새로운 가능성을 열었고, 뒤이은 여러 다국어 언어 모델 개발에 영향을 주었다. XLM의 성공은 신경 언어 모델 하나가 여러 언어의 text를 동시에 이해하고 생성하도록 훈련할 수 있음을 보여 주었다. 이는 다국어 NLP의 새로운 기준을 세우고 단일 모델로 여러 언어를 처리하는 후속 시스템 개발에 영향을 주었다.

XLM은 분야가 단일 언어 모델에서 다국어 시스템으로 전환하던 중요한 시기에 등장했다. [BERT](/writing/bert-bidirectional-pretraining-revolutionizes-language-understanding)와 [GPT](/writing/gpt1-gpt2-autoregressive-pretraining-transfer-learning) 같은 모델은 대규모 단일 언어 corpus에서 훈련했을 때 놀라운 역량을 보였지만, 이를 여러 언어로 확장하려면 새로운 접근이 필요했다. XLM은 교차 언어 사전 학습이 이 간극을 메울 수 있음을 보였다. 언어 사이에서 지식을 활용하고 저자원 언어의 성능을 크게 높일 수 있었다.

## 문제

전통적인 다국어 자연어 처리 방식은 언어마다 별도 모델을 훈련하거나 중간 번역 단계를 거치는 번역 기반 접근에 의존했다. 이 방식은 자원을 많이 소비했고 언어에 따라 성능이 일관되지 않은 경우가 많았다. 특히 훈련 data가 부족한 [저자원 언어](/writing/specialized-llms-low-resource-languages-ai-equity-global-accessibility)에서 문제가 컸다. 언어별로 별도 모델을 훈련하면 한 언어에서 배운 지식을 다른 언어로 옮길 수 없었으므로 각 언어쌍마다 상당한 계산 자원과 data가 필요했다.

통계적 번역 기반 접근에는 다른 한계도 있었다. 흔히 영어를 pivot 언어로 삼는 중간 번역 단계가 필요해 오류와 비효율이 생겼다. 예를 들어 스페인어 질문을 먼저 영어로 번역해 처리한 뒤 다시 스페인어로 번역하면, 각 번역 단계에서 오류가 유입될 수 있었다. 이 접근은 교차 언어 의미 관계를 포착하는 데 어려움을 겪었고 새 언어마다 상당한 적응 작업이 필요했다.

[BERT](/writing/bert-bidirectional-pretraining-revolutionizes-language-understanding) 같은 단일 언어 모델은 놀라운 성공을 거뒀지만 특정 언어에 한정됐다. 영어로 훈련한 BERT는 재훈련 없이는 프랑스어나 스페인어를 이해할 수 없었고, 학습된 표현도 서로 다른 언어의 단어 사이 관계를 포착하지 못했다. 이 한계 때문에 언어마다 모델을 처음부터 다시 훈련해야 했고, 계산 자원이 낭비되며 언어 사이 지식 전이가 막혔다.

훈련 data가 제한된 [저자원 언어](/writing/specialized-llms-low-resource-languages-ai-equity-global-accessibility)는 문제가 더 심각했다. 영어 같은 고자원 언어에는 정교한 언어 모델을 만들 수 있을 만큼 data가 풍부했다. 반면 저자원 언어에는 그 일부에 불과한 data만 있어 효과적인 언어 모델을 훈련하기 어렵거나 불가능할 수 있었다. 고자원 언어의 지식을 저자원 언어로 옮길 수 없으면 언어별 역량 격차는 계속 커질 수밖에 없었다.

여러 언어에서 동시에 작동하고 언어 사이 지식을 공유하면서 대규모 사전 학습의 성능 이점도 유지할 해법이 필요했다. 이를 위해서는 교차 언어 표현을 명시적으로 장려하는 새로운 훈련 목표와 다국어 data를 효과적으로 처리하는 새로운 아키텍처가 필요했다.

## 해법

XLM은 여러 언어의 text를 포함한 다국어 data로 단일 모델 아키텍처를 훈련해 이 한계를 다뤘다. 모든 언어가 어휘와 embedding 공간을 공유하게 함으로써 서로 다른 언어의 단어·구 사이 의미 유사성을 포착하는 표현을 학습했다. 핵심 혁신은 번역 언어 모델링(translation language modeling, TLM)이었다. 한 언어의 문맥이 주어졌을 때 다른 언어의 단어를 예측하도록 훈련해 교차 언어 표현의 학습을 장려했다.

### 공유 다국어 아키텍처

모델 아키텍처는 [Transformer](/writing/transformer-attention-is-all-you-need)를 기반으로 했고 모든 언어에서 같은 매개변수를 공유했다. 언어마다 별도 매개변수를 둔 단일 언어 모델과 달리, XLM은 모든 언어에 같은 Transformer layer를 사용했다. 이는 언어 경계를 넘어 통하는 표현을 학습하도록 모델을 강제했다. 공유 아키텍처는 언어 사이의 공통점을 찾아 보편적인 언어 pattern을 포착하는 추상 표현을 배우게 했다.

공유 어휘에는 여러 언어에 공통으로 나타나는 subword token과 특정 언어에만 고유한 단어용 token이 함께 들어갔다. 모든 언어의 corpus를 연결한 뒤 [Byte Pair Encoding](/writing/subword-tokenization-fasttext-character-ngram-embeddings-robust-word-representations)(BPE)을 적용했다. 그 결과 자주 나오는 subword 단위를 언어 사이에서 공유하는 통합 어휘가 만들어졌다. 이 공유 어휘 덕분에 철자가 다른 영어 “cat”과 프랑스어 “chat”이 비슷한 개념을 가리킨다는 사실을 모델이 알아볼 수 있었다.

### 공유 embedding 공간

공유 embedding 공간은 XLM의 교차 언어 능력에 결정적이었다. 서로 다른 언어의 단어를 같은 vector 공간에 mapping하면 의미가 비슷한 단어가 embedding 공간에서도 가까워지도록 학습할 수 있었다. 예를 들어 영어 “dog”, 프랑스어 “chien”, 스페인어 “perro”는 모두 embedding 공간의 비슷한 영역에 mapping됐다. 공유 표현이 보편적인 의미 관계를 포착하므로 한 언어에서 배운 지식을 다른 언어로 옮길 수 있었다.

### 번역 언어 모델링

XLM의 핵심 혁신은 교차 언어 학습을 명시적으로 장려하는 훈련 목표인 번역 언어 모델링(TLM)이었다. XLM은 [BERT](/writing/bert-bidirectional-pretraining-revolutionizes-language-understanding)에서 사용한 표준 [마스크드 언어 모델링](/writing/masked-language-modeling-bidirectional-understanding-bert)에 더해, 같은 내용을 여러 언어로 제공하는 병렬 text data를 사용했다. 두 언어의 문맥을 함께 이용해 한 언어의 단어를 예측하도록 훈련함으로써 교차 언어 대응 관계를 학습하도록 했다.

예를 들어 “The cat sat on the mat”(영어)와 “Le chat s'est assis sur le tapis”(프랑스어)라는 병렬 문장쌍이 있다고 하자. 모델은 양쪽 언어의 문맥을 모두 본 상태에서 프랑스어 문장의 “chat”을 예측할 수 있다. 이 목표는 “cat”과 “chat”이 관련돼 있음을 명시적으로 가르쳐 의미 유사성을 포착하는 교차 언어 표현의 학습을 장려했다.

XLM의 훈련 과정에는 몇 가지 핵심 요소가 있었다. 먼저 여러 언어의 대규모 단일 언어 text로 모델을 훈련해 각 언어의 다음 단어를 예측하게 하는 [인과 언어 모델링](/writing/causal-language-modeling-foundation-generative-ai)을 사용했다. 다음으로 병렬 text data에 번역 언어 모델링을 적용해 다른 언어의 문맥이 주어졌을 때 단어를 예측하게 했다. 이 교차 언어 훈련은 언어 사이 의미 유사성을 포착하는 표현을 배우도록 장려했다.

### 교차 언어 전이 mechanism

XLM 아키텍처는 여러 [교차 언어 전이](/writing/mt5-multilingual-t5-cross-lingual-transfer) mechanism을 가능하게 했다. 공유 매개변수를 사용하므로 고자원 언어에서 배운 개선점이 [저자원 언어](/writing/specialized-llms-low-resource-languages-ai-equity-global-accessibility)에도 도움이 될 수 있었다. 모델이 영어의 문법 pattern을 인식하는 법을 배우면 구조가 비슷한 다른 언어로 이 pattern을 전이할 수 있었다. 공유 embedding 공간은 서로 다른 언어의 비슷한 개념을 mapping해 의미 수준의 지식 전이를 가능하게 했다.

또한 각 token이 어느 언어에 속하는지 표시하는 언어 [embedding](/writing/long-term-knowledge-storage-and-retrieval)을 사용했다. 이로써 교차 언어 표현을 유지하면서도 언어별 pattern을 학습할 수 있었다. 언어 embedding은 해당 언어에 따라 모델의 동작을 조절했고, 공유 [Transformer](/writing/transformer-attention-is-all-you-need) layer는 지식이 언어 사이에서 전이되도록 했다.

## 응용과 영향

XLM의 성공은 다국어 NLP에서 교차 언어 사전 학습이 주는 몇 가지 핵심 이점을 보여 주었다. 첫째, 교차 언어 표현을 학습한 모델은 훈련 중 한 번도 보지 않은 언어에서 과제를 수행하는 zero-shot 전이를 할 수 있었다. 영어·프랑스어·스페인어로 훈련한 모델이 이탈리아어 훈련 data를 본 적이 없어도, 관련 언어에서 배운 공유 표현을 활용해 이탈리아어 [질의응답](/writing/ibm-watson-jeopardy-open-domain-question-answering-nlp-information-retrieval)을 수행할 수 있었다.

둘째, 공유 표현을 통해 고자원 언어의 지식을 활용할 수 있으므로 [저자원 언어](/writing/specialized-llms-low-resource-languages-ai-equity-global-accessibility)의 성능이 이전 방식보다 크게 좋아졌다. 훈련 예시가 수천 개뿐인 언어도 고자원 언어에서 얻은 수백만 개 예시의 이점을 활용해 성능을 크게 높일 수 있었다. 이는 사용 인구가 적거나 digital text 자원이 제한된 언어에서 특히 중요했다.

셋째, 단일 아키텍처로 여러 언어를 처리하므로 언어별 모델을 따로 훈련하는 것보다 훨씬 효율적이고 실용적이었다. 수십 개 언어별 모델을 유지하는 대신 XLM 하나로 모든 언어를 처리해 계산 요구량을 줄이고 배치를 단순화할 수 있었다.

### 교차 언어 과제

XLM의 교차 언어 능력은 언어 사이 의미 관계를 이해해야 하는 과제에서 특히 인상적이었다. 한 언어의 질의로 다른 언어의 관련 문서를 찾는 교차 언어 정보 검색을 수행할 수 있었다. 영어 검색 질의가 프랑스어·스페인어 문서에 영어 질의 단어가 하나도 없더라도 공유 embedding 공간의 의미 유사성으로 관련 문서를 찾을 수 있었다.

XLM은 한 언어의 질문에 다른 언어의 정보를 이용해 답하는 교차 언어 [질의응답](/writing/ibm-watson-jeopardy-open-domain-question-answering-nlp-information-retrieval)도 수행할 수 있었다. 프랑스어 질문에 영어 Wikipedia article을 이용해 답함으로써 사용자는 언어 장벽과 관계없이 정보에 접근할 수 있었다. 이 능력은 언어 경계를 매끄럽게 넘나드는 다국어 응용과 서비스의 새로운 가능성을 열었다.

### 후속 모델에 미친 영향

XLM의 성공은 뒤이은 여러 다국어 언어 모델 개발에 영향을 주었고 교차 언어 NLP의 새로운 기준을 세웠다. XLM의 아키텍처와 훈련 방식은 mBERT(multilingual [BERT](/writing/bert-bidirectional-pretraining-revolutionizes-language-understanding)), XLM-R(XLM-[RoBERTa](/writing/xlnet-roberta-albert-bert-refinements))와 그 밖의 여러 다국어 언어 모델 project에 template이 됐다. XLM의 성능 benchmark는 새 다국어 시스템의 표준 [평가 지표](/writing/history-rouge-meteor-evaluation-metrics)가 되어 교차 언어 성능의 명확한 목표를 세웠다.

이 연구는 단일 모델로 여러 언어를 처리하는 교차 언어 AI 시스템 개발에도 영향을 주었다. 공유 아키텍처, 통합 어휘, 교차 언어 훈련 목표라는 원리는 다국어 시스템을 만드는 표준 접근이 됐다. [mT5](/writing/mt5-multilingual-t5-cross-lingual-transfer), mBERT, 다국어 [GPT](/writing/gpt1-gpt2-autoregressive-pretraining-transfer-learning) 같은 현대 다국어 모델은 모두 XLM이 세운 토대 위에 구축됐다.

### 공개 release의 영향

모델을 open source로 공개해 전 세계 연구자와 개발자가 이용할 수 있었고, 빠른 채택과 후속 개발이 가능했다. model weight와 training code가 제공되면서 다른 연구자들은 이 작업을 바탕으로 특정 언어쌍이나 과제에 맞춘 변형을 개발할 수 있었다. 이런 개방적 접근은 대규모 계산 자원이 없는 연구자도 다국어 언어 모델을 실험할 수 있게 해 다국어 NLP와 관련 분야의 연구·개발을 가속했다.

XLM은 교차 언어 언어 모델에서 다양하고 품질 높은 다국어 훈련 data가 중요하다는 점도 보여 주었다. 모델의 성공은 견고한 교차 언어 성능을 얻는 데 정교한 아키텍처보다 훈련 data의 품질과 다양성이 더 중요함을 보여 주었다. 이 통찰은 후속 다국어 언어 모델 개발에 영향을 주었고 data 수집·정제의 새로운 기준을 세웠다.

## 한계

XLM은 상당한 기여를 했지만 후속 연구 방향을 결정한 몇 가지 한계도 있었다. 언어쌍에 따라 성능 차이가 컸고, 유형론적으로 비슷하거나 훈련 data가 풍부한 언어에서 더 강했다. 훈련 data의 언어와 매우 다르거나 corpus에서 충분히 대표되지 않은 언어는 [교차 언어 전이](/writing/mt5-multilingual-t5-cross-lingual-transfer)가 약했다.

번역 언어 모델링이 병렬 text data에 의존한다는 점도 한계였다. 병렬 data는 강한 교차 언어 학습을 가능하게 하지만 모든 언어쌍에 존재하지 않으며, 병렬 corpus를 만드는 일은 비싸고 시간이 많이 든다. 병렬 data가 없는 언어쌍은 번역 언어 모델링 목표의 이점을 얻을 수 없어 모델 적용 범위가 기존 번역 자원이 있는 언어쌍으로 제한됐다.

공유 어휘 방식은 관련 언어에는 효과적이지만 문자 체계나 형태 구조가 매우 다른 언어에서는 때때로 어려움을 겪었다. 비라틴 문자나 복잡한 형태론을 가진 언어는 공유 subword 어휘의 이점을 충분히 얻지 못할 수 있어 교차 언어 전이의 효과가 제한됐다.

[저자원 언어](/writing/specialized-llms-low-resource-languages-ai-equity-global-accessibility)의 성능은 단일 언어 접근보다 좋아졌지만 여전히 고자원 언어보다 낮았다. [교차 언어 전이](/writing/mt5-multilingual-t5-cross-lingual-transfer)가 도움이 됐어도 풍부한 훈련 data가 있는 언어와 data가 제한된 언어 사이의 격차를 완전히 없애지는 못했다. 이 한계는 각 언어에 충분한 훈련 data를 확보하는 일이 계속 중요함을 보여 주었다.

다국어 모델의 훈련 계산 요구량도 상당했다. 여러 언어로 훈련하려면 단일 언어 모델보다 훨씬 많은 data를 처리해야 해 훈련 시간과 계산 비용이 늘어났다. 병렬 text data가 필요하다는 점도 data 준비를 복잡하게 했고 다국어 corpus의 정렬과 전처리가 필요했다.

## 유산

XLM은 교차 언어 사전 학습을 다국어 언어 모델 구축의 핵심 접근으로 확립했다. 신경 언어 모델 하나가 여러 언어의 text를 동시에 이해하고 생성하도록 학습할 수 있음을 보였다. 교차 언어 사전 학습, 번역 언어 모델링, 공유 다국어 표현이라는 혁신은 다국어 NLP의 새로운 기준을 세웠고 오늘날까지 분야에 영향을 주고 있다.

XLM의 영향은 다국어 NLP를 넘어 연구자가 언어 모델 훈련에 접근하는 방식 전반으로 확장됐다. 단일 모델이 여러 언어와 과제를 처리하는 능력은 다른 multimodal AI 시스템의 개발에도 영향을 주었다. 하나의 아키텍처로 여러 관련 과제를 처리하는 발상은 현대 AI 시스템의 표준 접근이 되어 더 효율적인 훈련과 배치를 가능하게 했다. 이 원리는 여러 modality와 과제를 처리하는 많은 후속 시스템 개발에 영향을 주었다.

XLM의 성공은 다국어 언어 모델을 위한 견고한 평가 방법론의 중요성도 부각했다. 다양한 test set의 성능은 여러 언어와 과제를 포괄하는 종합 평가의 가치를 보여 주었다. 이 통찰은 다른 다국어 언어 모델의 평가 framework 개발에 영향을 주었고 교차 언어 시스템 benchmark의 새로운 기준을 세웠다.

### 현대 다국어 모델

현대 다국어 모델은 XLM의 한계를 다루면서 그 토대 위에 구축됐다. XLM-[RoBERTa](/writing/xlnet-roberta-albert-bert-refinements)는 더 큰 훈련 corpus와 더 견고한 사전 학습 목표로 XLM을 개선했다. [mT5](/writing/mt5-multilingual-t5-cross-lingual-transfer)는 [text-to-text](/writing/t5-text-to-text-framework-unified-nlp-through-text-transformations) framework를 여러 언어로 확장해 언어별로 다양한 NLP 과제를 통합해 모델링했다. 이 발전은 다국어 언어 모델의 역량과 접근성을 높였지만, 모두 XLM이 확립한 교차 언어 사전 학습 패러다임 위에 세워졌다.

공유 아키텍처와 교차 언어 전이의 원리는 현대 언어 모델 구축의 핵심이 됐다. 오늘날의 대규모 언어 모델은 일반적으로 다국어 data로 동시에 훈련되며 교차 언어 이해와 생성이 가능하다. XLM이 개척한 경로 덕분에 다국어 능력은 선택 사항이 아니라 표준 기능으로 여겨진다.

### 장기적 영향

XLM은 자연어 처리 분야에 깊고 지속적인 영향을 남겼다. 교차 언어 사전 학습이 가능할 뿐 아니라 실용적인 다국어 시스템을 만드는 데 꼭 필요하다는 사실을 입증했다. 이 연구는 수많은 후속 project에 영향을 주었고 오늘날에도 다국어 NLP 연구를 이끄는 pattern을 확립했다.

언어 AI 시스템이 계속 발전하는 지금도 XLM의 유산은 현대 언어 모델의 표준이 된 다국어 능력에서 확인된다. 신경 언어 모델이 언어 경계를 넘어 여러 언어의 의미 관계를 포착하는 보편 표현을 학습할 수 있음을 보여 주었다. 이는 사용 언어나 정보가 기록된 언어와 관계없이 모든 사용자를 지원하는 진정한 [다국어 AI](/writing/specialized-llms-low-resource-languages-ai-equity-global-accessibility)를 향한 중요한 진전이었다.

XLM은 다국어 자연어 처리와 인공지능의 역사에서 중요한 이정표다. 신경 언어 모델 하나가 여러 언어의 text를 이해하고 생성하도록 훈련할 수 있음을 보였고, 다국어 NLP의 새로운 기준을 세운 혁신으로 후속 다국어 언어 모델 개발에 영향을 주었다. 이 연구는 단일 모델이 여러 언어를 처리하는 교차 언어 AI 시스템의 잠재력을 입증했고, 국제적 응용과 교차 언어 연구의 새로운 가능성을 열어 오늘날까지 분야의 방향을 만들고 있다.
