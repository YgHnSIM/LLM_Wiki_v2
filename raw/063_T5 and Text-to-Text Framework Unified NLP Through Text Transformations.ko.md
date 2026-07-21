# T5와 Text-to-Text 프레임워크: 텍스트 변환으로 통합한 NLP

출처: https://mbrenndoerfer.com/writing/t5-text-to-text-framework-unified-nlp-through-text-transformations

---

Google이 2019년에 발표한 T5(Text-to-Text Transfer Transformer)를 종합적으로 설명한다. text-to-text 프레임워크가 다양한 NLP 과제를 어떻게 통합했는지, span corruption 사전 학습을 사용하는 encoder-decoder architecture, multi-task learning을 위한 task prefix, 그리고 현대 언어 모델과 instruction tuning에 남긴 지속적인 영향을 살펴본다.

## 2019년: T5와 Text-to-Text 프레임워크

Google Research가 2019년에 [Text-to-Text Transfer Transformer](/writing/t5-architecture-text-to-text-transformer)(T5)를 발표한 일은 연구자들이 자연어 처리 과제에 접근하는 방식의 paradigm shift를 나타냈다. T5는 NLP 문제마다 특화된 architecture와 training procedure를 개발하는 대신, 번역과 요약부터 [질의응답](/writing/ibm-watson-jeopardy-open-domain-question-answering-nlp-information-retrieval), 분류에 이르는 모든 과제를 [text-to-text](/writing/t5-task-formatting-text-to-text-nlp) 변환으로 다시 구성하면 하나의 통합 framework로 처리할 수 있음을 보여 주었다. 이 통합은 model development, training pipeline, evaluation을 단순화하면서 수많은 benchmark에서 state-of-the-art 성능을 달성했고, 사전 학습 언어 모델을 다양한 NLP 과제에 적용하는 새로운 표준을 확립했다.

2019년 무렵 자연어 처리 분야는 점점 더 분절되고 있었다. [BERT](/writing/bert-bidirectional-pretraining-revolutionizes-language-understanding)는 이해 과제에서 bidirectional pretraining의 힘을 보여 주었고, [GPT](/writing/gpt1-gpt2-autoregressive-pretraining-transfer-learning) 계열은 [autoregressive generation](/writing/autoregressive-generation-gpt-text-generation)의 효과를 입증했다. 한편 번역, 요약, 질의응답을 비롯한 여러 과제를 위한 전용 architecture가 개발되고 있었다. 과제마다 별도 접근이 필요한 듯했다. 분류 과제에는 task-specific head를 붙인 encoder-only model이 필요했고, 생성 과제에는 decoder-only architecture가, sequence-to-sequence 과제에는 완전한 [encoder-decoder](/writing/sequence-to-sequence-neural-machine-translation) 구조가 필요했다. 이런 분절 때문에 과제 사이에서 지식을 활용하기 어려웠고, 응용마다 서로 다른 model과 training pipeline을 유지해야 했다.

Colin Raffel과 Google Research 연구자들이 이끈 [T5](/writing/t5-architecture-text-to-text-transformer) 팀은 이런 분절이 불필요하다고 보았다. 이들은 근본적인 단순화를 제안했다. 모든 NLP 과제를 text를 입력받아 text를 출력하는 문제로 구성하면 어떨까? 번역은 `translate English to German: [sentence]`, 요약은 `summarize: [article]`, 분류도 text 입력에서 class label을 생성하는 과제로 바꿀 수 있었다. 이 [text-to-text](/writing/t5-task-formatting-text-to-text-nlp) framework는 하나의 model architecture로 모든 과제를 처리하게 해 개발을 단순화하고, 서로 다른 NLP application 사이의 transfer learning을 개선할 수 있었다.

이 구상을 구현하려면 architecture를 세심하게 고르고 새로운 pretraining objective를 설계해야 했다. T5는 variable-length input을 처리하고 variable-length output을 생성할 수 있는 [encoder-decoder Transformer](/writing/encoder-decoder-architecture-cross-attention-transformers)를 사용했으므로 이해 과제와 생성 과제에 모두 자연스럽게 맞았다. 연구진은 [span corruption](/writing/span-corruption-t5-pretraining-objective)이라는 새로운 pretraining objective를 개발했다. 연속된 text span을 가리고 이를 복원하도록 학습하는 방식으로, [BERT](/writing/bert-bidirectional-pretraining-revolutionizes-language-understanding)의 [masked language modeling](/writing/masked-language-modeling-bidirectional-understanding-bert)보다 생성 과제에 더 잘 맞는 유연한 대안을 제공했다. model은 다양한 language pattern과 지식을 제공하는 방대한 web text dataset인 Colossal Clean Crawled Corpus(C4)에서 훈련됐다.

[T5](/writing/t5-architecture-text-to-text-transformer)의 성공은 text-to-text framework가 unified NLP를 위한 강력한 접근임을 입증했다. 하나의 model이 task-specific modification 없이 번역, 요약, [질의응답](/writing/ibm-watson-jeopardy-open-domain-question-answering-nlp-information-retrieval), sentiment analysis 등 여러 과제에서 강한 성능을 낼 수 있음을 보여 주었다. 이 통합은 연구와 실무 모두에 깊은 영향을 주었다. model deployment와 새 과제 실험을 단순화했고, language understanding과 generation을 같은 문제의 두 측면으로 다루는 방식의 힘을 보여 주었다.

## 문제

자연어 처리가 task-specific approach로 분절된 상황은 2019년 무렵 발전을 막는 중요한 장애물이 됐다. 연구자들은 과제 유형마다 서로 다른 architecture를 개발했고, 각각 별도의 training procedure, optimization strategy, [evaluation metric](/writing/history-rouge-meteor-evaluation-metrics)이 필요했다. sentiment analysis 같은 classification task에는 일반적으로 task-specific classification head를 붙인 [BERT](/writing/bert-bidirectional-pretraining-revolutionizes-language-understanding) 계열 encoder-only model을 사용했다. 번역 같은 generation task에는 [encoder-decoder](/writing/sequence-to-sequence-neural-machine-translation) architecture가 필요했고, language modeling task에는 [GPT](/writing/gpt1-gpt2-autoregressive-pretraining-transfer-learning) 같은 decoder-only model이 쓰였다. 이런 전문화는 한 유형의 과제에서 얻은 통찰을 다른 유형에 적용하기 어려운 silo를 만들었다.

문제는 architecture 선택을 넘어섰다. 과제마다 input·output format, loss function, evaluation procedure가 달랐다. sentiment analysis용 model을 translation에 맞추려면 상당한 architecture 변경이 필요했고, [질의응답](/writing/ibm-watson-jeopardy-open-domain-question-answering-nlp-information-retrieval)에 최적화한 model을 summarization에 쓰려면 처음부터 다시 훈련해야 했다. 결국 연구자와 실무자는 과제마다 최적화된 여러 model을 유지해야 했고, 많은 계산 자원과 engineering effort가 들었다.

여러 NLP 과제를 처리해야 하는 system을 배포하는 복잡성을 생각해 보자. 일반적인 application에는 sentiment analysis, [named entity recognition](/writing/named-entity-recognition-ner-tutorial), translation, summarization이 모두 필요할 수 있다. 분절된 접근에서는 네 개 model을 별도로 훈련하고 유지해야 하며, 각 model마다 preprocessing requirement, inference pipeline, monitoring system이 달랐다. 특화 model 여러 개를 실행하는 계산 비용은 감당하기 어려울 수 있었고, 서로 다른 architecture를 관리하는 복잡성 때문에 과제 전체의 성능을 최적화하기도 어려웠다.

이런 분절은 transfer learning을 효과적으로 활용하는 일도 어렵게 했다. [BERT](/writing/bert-bidirectional-pretraining-revolutionizes-language-understanding)와 [GPT](/writing/gpt1-gpt2-autoregressive-pretraining-transfer-learning) 같은 pretrained model은 대규모 pretraining에서 얻은 지식이 downstream task의 성능을 높일 수 있음을 보여 주었지만, 각 과제에 맞게 조심스럽게 적응해야 했다. 새 classification task에 BERT를 fine-tune하려면 task-specific head를 붙이고 pretrained layer와 새 head의 learning rate를 세심하게 조절해야 했다. GPT를 새 generation task에 맞추려면 다른 prompt engineering이나 fine-tuning strategy가 필요했다. 하나의 [pretrained model](/writing/transfer-learning-nlp-pre-training-fine-tuning)이 최소한의 변경으로 다양한 과제를 처리하게 하는 통합 접근은 없었다.

분절된 체계에서는 서로 다른 과제의 model을 평가하고 비교하기도 어려웠다. classification task는 accuracy나 F1을, translation은 [BLEU](/writing/history-bleu-metric-evaluation)를, summarization은 [ROUGE](/writing/history-rouge-meteor-evaluation-metrics)를, [질의응답](/writing/ibm-watson-jeopardy-open-domain-question-answering-nlp-information-retrieval)은 exact match나 F1을 사용했다. 이 metric들은 개별 과제에서는 의미가 있었지만, 통합 framework가 없었기 때문에 한 과제의 진전이 다른 과제의 진전과 어떤 관계인지, 한 과제 유형에서 뛰어난 model이 그 능력을 다른 과제로 전이할 수 있는지 파악하기 어려웠다.

개념적으로 비슷한 NLP 과제가 서로 다르게 다뤄진다는 점도 문제를 키웠다. translation과 summarization은 모두 input text를 받아 output text를 생성하지만 서로 다른 architecture와 training procedure로 접근했다. question answering은 text question에서 text answer를 생성하는 문제로 구성할 수 있어 chatbot response generation과 비슷했지만, 근본적으로 다른 문제처럼 취급됐다. 이런 개념적 유사성은 통합 접근이 가능함을 시사했지만, 당시 분야에는 이를 구현할 framework가 없었다.

## 해법

[T5](/writing/t5-architecture-text-to-text-transformer)는 모든 NLP 과제를 source text에서 target text를 생성하는 형태로 다시 구성하는 통합 [text-to-text](/writing/t5-task-formatting-text-to-text-nlp) framework를 도입해 이 문제들을 다뤘다. 이 단순하면서도 강력한 통찰 덕분에 하나의 [encoder-decoder architecture](/writing/encoder-decoder-architecture-cross-attention-transformers)를 변경 없이 모든 과제에 사용할 수 있었다. framework는 `translate English to German:`이라는 translation prefix, `summarize:`라는 summarization prefix, CoLA 문법성 과제의 `cola sentence:` 같은 task-specific prefix를 input text 앞에 붙였다. model은 이 prefix를 해석하고 각 과제에 맞는 output format을 생성하도록 학습했다.

T5의 encoder-decoder architecture는 원래 [Transformer](/writing/transformer-attention-is-all-you-need) 설계를 바탕으로 하되 중요한 개선을 더했다. encoder와 decoder는 모두 self-attention과 feed-forward layer를 포함한 Transformer block으로 구성됐다. encoder는 task prefix를 포함한 input text를 처리해 의미와 문맥을 포착하는 representation을 만들었다. decoder는 이 representation과 자신의 self-attention, [cross-attention](/writing/cross-attention-encoder-decoder-transformers)을 이용해 target text를 한 단어씩 생성했다. 이 architecture는 variable-length input과 output에 자연스럽게 맞았으므로 understanding task와 generation task를 모두 유연하게 다룰 수 있었다.

과제 prefix

text-to-text framework는 task prefix로 input text에 수행할 연산을 표시한다. 예를 들어 `translate English to German: The house is small.`이라는 input은 `Das Haus ist klein.`을 output으로 낸다. 마찬가지로 `summarize: [long article]`은 더 짧은 summary를 만든다. model은 training 중에 각 prefix가 서로 다른 transformation을 지시한다는 사실을 학습하므로 하나의 architecture와 parameter set으로 여러 과제를 처리할 수 있다.

training process에는 understanding과 generation 모두에 잘 맞도록 설계된 [span corruption](/writing/span-corruption-t5-pretraining-objective)이라는 새로운 pretraining objective를 사용했다. 개별 token을 가리는 [BERT](/writing/bert-bidirectional-pretraining-revolutionizes-language-understanding)의 [masked language modeling](/writing/masked-language-modeling-bidirectional-understanding-bert)과 달리, span corruption은 서로 이어진 token span을 input text에서 가렸다. model은 이 span을 output에서 복원하도록 학습해 문맥을 이해하고 text를 생성하는 능력을 함께 익혔다. 이 objective는 BERT를 효과적으로 만든 bidirectional understanding의 장점을 유지하면서 masked language modeling보다 generation task에 더 적합했다.

span corruption은 token span을 무작위로 골라 [mask](/writing/special-tokens-transformers-cls-sep-pad-mask)하고, model이 placeholder로 인식하도록 학습할 sentinel token으로 바꾸는 방식이다. input에는 sentinel token이 들어간 masked text가 있고, target에는 원래 span들이 각각 대응하는 sentinel token을 앞에 붙인 채 순서대로 들어간다. 예를 들어 원문이 `Thank you for inviting me to your party last week`이고 `for inviting`과 `last week`를 각각 sentinel `<X>`, `<Y>`로 가렸다면 input은 `Thank you <X> me to your party <Y>`가 되고 target은 `for inviting <Y> last week`가 된다. model은 이 과정을 통해 문맥을 이해하고 일관된 text를 생성하도록 학습했다.

model은 Common Crawl web data를 filtering·cleaning해 만든 Colossal Clean Crawled Corpus(C4)에서 pretrain됐다. C4에는 700GB가 넘는 고품질 text data가 들어 있어 다양한 language pattern, factual knowledge, linguistic structure를 제공했다. 이 대규모 pretraining 덕분에 [T5](/writing/t5-architecture-text-to-text-transformer)는 여러 과제에서 활용할 수 있는 폭넓은 언어 지식을 얻었다. pretraining에는 [teacher forcing](/writing/teacher-forcing-seq2seq-training-exposure-bias-scheduled-sampling)을 사용했다. training 중 새 token을 생성할 때 model에 올바른 이전 token을 주어 학습을 더 안정적이고 효율적으로 만드는 방식이다.

pretraining 뒤에는 적절한 prefix가 붙은 task-specific training example을 제공해 T5를 특정 과제에 fine-tune할 수 있었다. fine-tuning 과정은 간단했다. 과제 example을 prefix가 포함된 형식으로 바꾸고 model이 target output을 생성하도록 훈련했다. architecture를 변경하거나 전용 head를 붙여야 했던 이전 방식과 달리, T5 fine-tuning은 [text-to-text](/writing/t5-task-formatting-text-to-text-nlp) 형식의 example로 model을 훈련하기만 하면 됐다. 따라서 새 과제에 쉽게 적응하고, 같은 과제의 여러 formulation을 실험하며, 여러 과제를 multi-task learning scenario로 결합할 수 있었다.

text-to-text framework는 evaluation도 단순화했다. 모든 과제가 text output을 내므로 많은 과제에 같은 metric을 적용할 수 있었다. translation, summarization, generation task는 생성 text와 reference text의 overlap을 측정하는 [ROUGE](/writing/history-rouge-meteor-evaluation-metrics) 같은 metric으로 함께 평가할 수 있었다. classification도 text generation으로 바꾸면 text matching으로 평가할 수 있었지만, 필요할 때는 accuracy 같은 전통 metric을 계속 사용했다. 이런 통합 덕분에 과제 사이 성능을 더 쉽게 비교하고 한 영역의 개선이 다른 영역에 어떻게 전이될 수 있는지 이해할 수 있었다.

## 응용과 영향

[T5 framework](/writing/t5-architecture-text-to-text-transformer)는 classification·[질의응답](/writing/ibm-watson-jeopardy-open-domain-question-answering-nlp-information-retrieval) 같은 전통적인 understanding task부터 translation·summarization 같은 generation task까지 매우 다양한 NLP 과제에서 뛰어난 versatility를 보여 주었다. T5는 자연어 이해 과제 모음인 [GLUE](/writing/glue-superglue-standardized-evaluation-language-understanding)에서 state-of-the-art 성능을 달성해, 전통적으로 classification 문제로 취급한 과제에서도 [text-to-text](/writing/t5-task-formatting-text-to-text-nlp) 접근이 잘 작동함을 보여 주었다. 더 어려운 benchmark인 SuperGLUE에서도 강한 결과를 거두어 unified framework가 generality를 얻는 대신 성능을 희생하지 않았음을 입증했다.

translation task는 특히 인상적인 결과를 보였다. T5는 WMT English-to-German translation에서 state-of-the-art 성능을 달성했고, 해당 언어쌍에 맞게 세심하게 최적화한 특화 번역 model과 경쟁할 만한 결과를 냈다. model은 [multilingual](/writing/xlm-cross-lingual-language-model-multilingual-nlp) translation에서도 좋은 성능을 보이며 하나의 통합 model로 여러 언어쌍을 처리했다. 이는 과거에 domain expertise가 필수로 여겨진 과제에서도 text-to-text framework가 특화 architecture에 필적할 수 있음을 보여 주었다.

summarization도 [T5](/writing/t5-architecture-text-to-text-transformer)가 뛰어난 영역이었다. model은 abstractive summarization task에서 강한 성능을 내며 긴 문서의 핵심 정보를 포착한 간결한 summary를 생성했다. [encoder-decoder architecture](/writing/encoder-decoder-architecture-cross-attention-transformers)는 encoder에서 긴 input document를 처리하고 decoder에서 더 짧은 summary를 생성할 수 있으므로 이 과제에 자연스럽게 맞았다. variable-length input과 output을 다루는 능력 덕분에 fixed input size를 가진 model보다 summarization에 특히 효과적이었다.

[질의응답](/writing/ibm-watson-jeopardy-open-domain-question-answering-nlp-information-retrieval)도 unified framework의 이점을 얻었다. T5는 [SQuAD](/writing/squad-stanford-question-answering-dataset-reading-comprehension-benchmark) 같은 dataset에 fine-tune할 수 있었다. `question: [question] context: [context]`라는 task prefix가 model에 answer 생성을 지시했다. model은 context에서 관련 정보를 찾아 일관된 answer로 구성하는 법을 학습했다. 이 접근은 answer가 context의 span인 extractive question answering과 answer를 다시 표현할 수 있는 abstractive question answering 모두에서 잘 작동했다.

[text-to-text](/writing/t5-task-formatting-text-to-text-nlp) framework는 여러 task formulation을 실험하기도 특히 쉽게 만들었다. 연구자는 서로 다른 prefix와 output format을 시험하고, 같은 underlying task를 여러 방식으로 구성할 수 있었다. 예를 들어 sentiment analysis를 `positive` 또는 `negative` 생성으로 만들 수도 있고, `The sentiment is positive`라는 문장을 생성하게 할 수도 있으며, 더 긴 설명을 생성하는 과제로 만들 수도 있었다. 이런 유연성은 task formulation이 성능에 미치는 영향을 연구하고 과제를 model에 제시하는 최적의 방식을 찾기 쉽게 했다.

unified framework에서는 multi-task learning도 더 간단해졌다. 모든 과제가 같은 input-output format을 사용하므로 task를 가리키는 prefix만 달리해 여러 과제를 하나의 training dataset에 합칠 수 있었다. model은 모든 과제를 동시에 수행하도록 학습하고, shared representation과 regularization effect를 통해 개별 과제의 성능도 높일 수 있었다. 이 방식은 과제별 model이나 training procedure를 유지하지 않고도 여러 NLP 과제를 처리하는 model을 훈련할 수 있게 했다.

[T5](/writing/t5-architecture-text-to-text-transformer)의 영향은 성능 개선을 넘어섰다. unified framework는 NLP system을 실제로 배포하는 일도 단순화했다. 조직은 여러 특화 model을 유지하는 대신 여러 과제에 fine-tune된 하나의 T5 model을 사용해 계산 요구를 줄이고 infrastructure를 단순화할 수 있었다. 일관된 input-output format 덕분에 단일 interface로 여러 NLP 과제를 처리하는 pipeline과 system도 쉽게 구축할 수 있었다.

T5의 성공은 후속 model 설계에도 영향을 주었다. [text-to-text](/writing/t5-task-formatting-text-to-text-nlp) framework는 unified NLP model의 표준 접근이 됐고, 많은 후속 system이 T5의 통찰을 토대로 개발됐다. 과제를 세심하게 formulation해 하나의 model에 통합할 수 있다는 발상은 널리 받아들여졌고, 더 범용적인 언어 model을 만들려는 [instruction-tuned](/writing/instruction-following-llm-tuning-fundamentals) model과 다른 접근에도 영향을 주었다.

## 한계

상당한 성과에도 [T5](/writing/t5-architecture-text-to-text-transformer)에는 후속 연구 방향을 만든 중요한 한계가 있었다. 근본적인 한계 하나는 계산 비용이었다. [encoder-decoder architecture](/writing/encoder-decoder-architecture-cross-attention-transformers)는 classification처럼 encoder-only model로 더 효율적으로 처리할 수 있는 과제에서도 encoder와 decoder를 모두 실행해야 했다. encoder는 input을 처리하고 decoder는 output을 생성하므로, generation task의 decoder-only model이나 understanding task의 encoder-only model보다 대략 두 배의 계산 자원이 필요했다.

[span corruption](/writing/span-corruption-t5-pretraining-objective) pretraining objective는 효과적이었지만 한계도 있었다. 이 objective는 pretraining 중 전체 span을 생성해야 하므로 개별 token만 예측하는 [masked language modeling](/writing/masked-language-modeling-bidirectional-understanding-bert)보다 느릴 수 있었다. 따라서 pretraining 계산 비용이 더 컸다. 또한 span corruption이 모든 downstream task에 최적인 것은 아닐 수 있었다. 개별 token 이해나 세밀한 linguistic analysis가 필요한 과제는 masked language modeling 같은 token-level objective에서 더 큰 이점을 얻을 수도 있었다.

[text-to-text](/writing/t5-task-formatting-text-to-text-nlp) framework는 우아했지만 단점도 있었다. classification task를 text generation으로 바꾸면 direct classification보다 효율이 떨어질 수 있었다. class 수가 적은 과제에서도 class probability를 바로 출력하는 대신 text를 생성하고 가능한 class와 matching해야 했다. 그 결과 순수 classification task에서는 specialized classification model보다 inference가 느리고 덜 정확할 수 있었다.

task prefix에 의존한다는 점도 문제를 만들었다. model은 training 중 각 prefix가 의미하는 바를 배워야 했고, 그러려면 해당 prefix를 사용한 example을 접해야 했다. 새 과제나 training data가 적은 과제에서는 낯선 prefix를 잘 이해하지 못할 수 있어 zero-shot이나 few-shot capability가 제한될 수 있었다. fine-tuning으로 이 문제를 다룰 수 있지만 task-specific training data가 필요하므로 unified framework의 이점 일부가 줄어들었다.

model size와 training data requirement도 한계였다. state-of-the-art 성능을 내려면 매우 큰 model을 방대한 dataset에서 훈련해야 했다. 최고 결과를 낸 [T5](/writing/t5-architecture-text-to-text-transformer)-11B는 training과 inference 모두에 막대한 계산 자원이 필요했다. 이 때문에 최고 성능 model에 접근하기 어려웠고, 작은 조직이나 연구자가 결과를 재현하거나 후속 연구를 수행하기도 힘들었다.

C4 dataset은 크고 다양했지만 한계도 있었다. web crawl data로 만들었으므로 web content에 존재하는 bias와 한계를 반영했다. 특정 언어·방언·domain을 충분히 대표하지 못했을 수 있으며, 이 때문에 해당 영역에서 model 역량이 제한될 수 있었다. web data에는 misinformation, biased content, problematic material도 있을 수 있고 model이 이를 학습해 ethical concern을 만들 수 있었다.

[text-to-text](/writing/t5-task-formatting-text-to-text-nlp) framework는 모든 과제에 최적이 아닐 수 있었다. 일부 과제에는 specialized architecture가 더 효과적으로 활용할 수 있는 고유한 구조가 있었다. parsing이나 [knowledge graph](/writing/history-freebase-knowledge-graph) construction 같은 [structured output](/writing/constrained-decoding-structured-llm-output) 과제는 구조를 명시적으로 model하는 architecture에서 이점을 얻을 수 있었다. text-to-text framework는 유연성을 얻는 대신 task-specific inductive bias를 넣기 어려웠다.

evaluation challenge도 남았다. unified framework가 evaluation 일부를 단순화했지만, 여전히 많은 과제에는 쉽게 통합할 수 없는 task-specific metric이 필요했다. translation은 [BLEU](/writing/history-bleu-metric-evaluation), summarization은 [ROUGE](/writing/history-rouge-meteor-evaluation-metrics), [질의응답](/writing/ibm-watson-jeopardy-open-domain-question-answering-nlp-information-retrieval)은 F1이나 exact match를 사용했다. 이 metric들은 서로 다른 성능 측면을 측정하고 직접 비교할 수 없으므로, 전체 진전을 평가하거나 과제 사이 trade-off를 이해하기 어려웠다.

## 유산과 미래

[T5](/writing/t5-architecture-text-to-text-transformer)와 [text-to-text](/writing/t5-task-formatting-text-to-text-nlp) framework의 등장은 자연어 처리 system 발전에 깊고 지속적인 영향을 남겼다. 세심한 task formulation으로 여러 NLP 과제를 통합할 수 있다는 생각은 분야의 기본 원리가 되어 후속 model과 system 설계에 영향을 주었다. T5의 성공은 단순화와 통합이 generality와 effectiveness 사이의 trade-off를 강요하는 대신 성능과 실용성을 함께 높일 수 있음을 보여 주었다.

text-to-text framework는 [instruction-tuned](/writing/instruction-following-llm-tuning-fundamentals) model과 폭넓은 역량의 대규모 언어 model 개발에 직접 영향을 주었다. [GPT-3](/writing/gpt3-in-context-learning-emergent-capabilities-from-scale), [PaLM](/writing/palm-pathways-language-model-large-scale-training-reasoning), 뒤의 [GPT-4](/writing/gpt4-multimodal-language-models-reach-human-level-performance) 같은 model은 적절한 prompting과 task formulation으로 하나의 model이 여러 NLP 과제를 처리할 수 있다는 통찰을 토대로 했다. 이 model들은 [encoder-decoder](/writing/sequence-to-sequence-neural-machine-translation)가 아니라 decoder-only architecture를 사용했지만, task instruction이나 prompt가 한 model에 여러 과제를 수행하게 한다는 핵심 발상을 받아들였다. [T5](/writing/t5-architecture-text-to-text-transformer)가 task prefix로 개척한 natural-language task specification 개념은 현대 언어 model 사용 방식의 중심이 됐다.

T5에서 도입한 [span corruption](/writing/span-corruption-t5-pretraining-objective) objective도 후속 pretraining approach에 영향을 주었다. 많은 model이 계속 [masked language modeling](/writing/masked-language-modeling-bidirectional-understanding-bert)이나 [autoregressive](/writing/gpt1-gpt2-autoregressive-pretraining-transfer-learning) objective를 사용했지만, span-level reconstruction 발상은 다른 맥락에서도 활용됐다. generation task에서 span corruption이 효과적이라는 사실은 understanding과 generation을 함께 고려한 objective가 한 측면에만 집중한 objective보다 효과적일 수 있음을 보여 주었다.

T5 unified framework의 실용적 영향은 NLP system을 배포하고 사용하는 방식으로 확장됐다. 한 model로 여러 과제를 처리하면 infrastructure가 단순해지고 계산 비용이 줄며 기존 system에 새 capability를 쉽게 추가할 수 있었다. 조직은 use case와 관련된 여러 과제에 T5 하나를 fine-tune할 수 있었으므로, 과제마다 model을 별도로 유지할 필요가 없었다. 이런 통합은 실제 application에서 NLP를 더 접근 가능하고 실용적으로 만들었다.

[T5](/writing/t5-architecture-text-to-text-transformer)를 위해 만든 C4 dataset도 research community의 자원으로 지속적인 영향을 남겼다. 이 dataset은 대규모 language model pretraining의 표준 [benchmark](/writing/glue-superglue-standardized-evaluation-language-understanding)가 됐고, web crawl에서 깨끗한 고품질 training data를 만드는 기법은 후속 dataset 구축 방식에 영향을 주었다. C4를 만들 때 data quality와 세심한 filtering을 강조한 일은 model performance에서 [data quality](/writing/data-quality-outliers-measurement-error-missing-data)가 중요하다는 점을 부각했다.

T5의 [encoder-decoder architecture](/writing/encoder-decoder-architecture-cross-attention-transformers)도 후속 model design에 영향을 주었다. [GPT](/writing/gpt1-gpt2-autoregressive-pretraining-transfer-learning) 같은 decoder-only model이 여러 application에서 우세해졌지만, translation, summarization, [질의응답](/writing/ibm-watson-jeopardy-open-domain-question-answering-nlp-information-retrieval)처럼 input context를 명시적으로 이해해 output을 생성해야 하는 과제에서는 [encoder-decoder](/writing/sequence-to-sequence-neural-machine-translation) architecture가 계속 중요했다. T5의 encoder-decoder refinement는 [BART](/writing/bart-architecture-encoder-decoder-transformers) 같은 model과 다른 sequence-to-sequence system의 발전에 기여했다.

[T5](/writing/t5-architecture-text-to-text-transformer)가 도입한 experimental methodology와 comprehensive evaluation도 언어 model 평가 방식의 새로운 기준을 세웠다. 여러 benchmark를 아우른 체계적인 비교, architecture choice와 training objective를 조사한 ablation study, 성능 개선 요인을 세심하게 분석한 방식은 language model을 철저히 평가하는 template을 제공했다. 이런 방법론적 rigor는 후속 model 개발과 평가에도 영향을 주었다.

현대 언어 model은 T5의 통찰을 이어받으면서 한계도 다룬다. [instruction-tuned](/writing/instruction-following-llm-tuning-fundamentals) model은 짧은 prefix보다 자연스러운 language instruction을 사용해 task specification을 쉽게 하고 zero-shot capability를 높인다. model들은 understanding과 generation을 모두 처리할 수 있는 decoder-only architecture나 특정 과제에 더 계산 효율적인 architecture도 탐구했다. 통합과 효율 사이의 균형은 여전히 활발한 연구 주제다.

[text-to-text](/writing/t5-task-formatting-text-to-text-nlp) framework는 NLP 과제의 근본적 성격을 연구자가 바라보는 방식에도 영향을 주었다. [T5](/writing/t5-architecture-text-to-text-transformer)의 성공은 understanding task와 generation task의 차이가 이전 생각만큼 근본적이지 않을 수 있으며, 적절한 text transformation을 학습한 model이 둘을 모두 효과적으로 다룰 수 있음을 시사했다. 이런 개념적 전환은 NLP capability 사이 경계를 흐리는 범용 언어 model 개발에 영향을 주었다.

T5의 유산은 실제 application에도 이어졌다. 오늘날 많은 production NLP system은 unified text-to-text approach를 사용해 base model 하나를 use case와 관련된 여러 과제에 fine-tune한다. 개발자와 조직은 과제마다 다른 접근을 익히는 대신 하나의 model architecture와 training procedure를 사용할 수 있어 system에 NLP capability를 더 쉽게 추가할 수 있다. 이런 접근성은 여러 산업과 application에서 고급 NLP capability의 확산에 기여했다.

2019년 T5의 등장은 자연어 처리 발전의 중요한 이정표였다. 통합과 단순화가 연구와 실무를 함께 개선할 수 있음을 보여 주었다. [text-to-text](/writing/t5-task-formatting-text-to-text-nlp) framework는 연구자와 실무자가 NLP 과제에 접근하는 방식을 근본적으로 바꾸었고, 오늘날까지 분야에 영향을 주는 pattern을 확립했다. T5의 성공은 language understanding과 generation을 통합된 문제로 다루는 힘을 입증했으며, 현대 language model, evaluation practice, deployment strategy 전반에서 그 영향을 확인할 수 있다.
