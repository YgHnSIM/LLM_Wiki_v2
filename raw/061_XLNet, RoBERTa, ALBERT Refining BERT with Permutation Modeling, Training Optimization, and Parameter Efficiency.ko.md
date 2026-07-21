# XLNet, RoBERTa, ALBERT: 순열 모델링·훈련 최적화·매개변수 효율성으로 BERT를 개선하다

출처: https://mbrenndoerfer.com/writing/xlnet-roberta-albert-bert-refinements

---

XLNet·RoBERTa·ALBERT가 순열 언어 모델링, 최적화된 훈련 절차, 효율적인 아키텍처를 통해 BERT를 어떻게 개선했는지 살펴본다. 양방향 자기회귀 사전 학습, 동적 마스킹, 매개변수 공유라는 혁신이 Transformer 언어 모델을 어떻게 발전시켰는지 알아본다.

## 2019년: XLNet, RoBERTa, ALBERT

2018년 [BERT](/writing/bert-bidirectional-pretraining-revolutionizes-language-understanding)의 성공은 사전 학습된 양방향 encoder의 위력을 보여 주었다. 그러나 연구 속도가 워낙 빨랐던 탓에 BERT가 널리 채택되는 동안에도 이미 개선안이 개발되고 있었다. 2019년에는 BERT의 서로 다른 한계를 다루면서 사전 학습 Transformer가 달성할 수 있는 범위를 넓힌 세 가지 주요 개선 모델이 등장했다. 이 발전은 언어 모델의 사전 학습 목표, 훈련 절차, 아키텍처 효율성에 관한 이해가 성숙하고 있음을 보여 주었다.

Zhilin Yang·Zihang Dai·Yiming Yang·Jaime Carbonell·Ruslan Salakhutdinov·Quoc V. Le 등이 이끈 Carnegie Mellon University와 Google Brain 연구진의 XLNet은 순열 언어 모델링을 통해 BERT의 [마스크 언어 모델링](/writing/masked-language-modeling-bidirectional-understanding-bert) 한계를 극복하고자 근본적으로 다른 사전 학습 방식을 도입했다. Yinhan Liu·Myle Ott·Naman Goyal·Jingfei Du·Mandar Joshi·Danqi Chen·Omer Levy·Mike Lewis·Luke Zettlemoyer·Veselin Stoyanov 등이 이끈 Facebook AI Research의 [RoBERTa](/writing/roberta-robustly-optimized-bert-pretraining)는 [BERT](/writing/bert-bidirectional-pretraining-revolutionizes-language-understanding)의 아키텍처는 타당하지만 훈련 절차에는 상당한 개선 여지가 있음을 입증했다. Zhenzhong Lan·Mingda Chen·Sebastian Goodman·Kevin Gimpel·Piyush Sharma·Radu Soricut 등이 이끈 Google Research의 [ALBERT](/writing/albert-parameter-efficient-bert-factorized-embeddings)는 같은 계산 자원으로 더 큰 모델을 훈련할 수 있게 하는 아키텍처 혁신을 통해 BERT의 매개변수 효율성을 높이는 데 초점을 맞췄다.

세 모델은 사전 학습 언어 모델을 개선하는 서로 다른 철학을 대표했다. XLNet은 마스크 언어 모델링이 최적의 사전 학습 목표인지 의문을 제기하고, 인위적인 마스크 token 없이 양방향 문맥을 포착할 수 있는 [자기회귀](/writing/gpt1-gpt2-autoregressive-pretraining-transfer-learning) 방식을 제안했다. RoBERTa는 BERT의 아키텍처를 유지하면서 훈련의 모든 측면을 체계적으로 최적화해, 방법론적 개선만으로도 상당한 성능 향상을 얻을 수 있음을 보였다. ALBERT는 아키텍처 자체를 다시 설계했다. 성능을 유지하거나 높이면서 매개변수 수를 줄이는 방법을 찾아, 정해진 계산 예산 안에서 더 큰 모델을 훈련할 수 있게 했다.

세 모델의 의의는 각자의 기여를 넘어섰다. 이들을 함께 보면 사전 학습 [Transformer](/writing/transformer-attention-is-all-you-need) 패러다임에는 여전히 상당한 개선 여지가 있었고, 더 나은 언어 이해에 이르는 길도 하나뿐이 아니었다. XLNet은 사전 학습 목표가 매우 중요함을, [RoBERTa](/writing/roberta-robustly-optimized-bert-pretraining)는 훈련 방법론이 결정적임을, [ALBERT](/writing/albert-parameter-efficient-bert-factorized-embeddings)는 아키텍처 효율성이 새로운 역량을 열 수 있음을 보여 주었다. 이 통찰은 뒤이은 [T5](/writing/t5-text-to-text-framework-unified-nlp-through-text-transformations), [GPT-3](/writing/gpt3-in-context-learning-emergent-capabilities-from-scale), 수많은 Transformer 변형의 개발에 영향을 주었다.

## 문제

[BERT](/writing/bert-bidirectional-pretraining-revolutionizes-language-understanding)가 인상적인 성공을 거두었지만, 연구자들이 이를 널리 배치하고 동작을 자세히 분석하면서 몇 가지 한계가 드러났다. 한계는 크게 세 범주로 나뉘었다. [마스크 언어 모델링](/writing/masked-language-modeling-bidirectional-understanding-bert) 목표 자체의 문제, 최적이 아닌 훈련 절차, 모델 규모를 제약하는 비효율적인 매개변수 사용이었다.

### 마스크 언어 모델링의 한계

BERT의 마스크 언어 모델링은 효과적이었지만 최적의 표현 학습을 방해하는 인위적 요소도 도입했다. 사전 학습에서 모델은 실제 단어를 전혀 보지 않고 마스크 token만 보았다. 반면 미세조정에서는 실제 단어를 접했다. 이 차이는 사전 학습과 후속 과제 사이에 불일치(pretrain–finetune discrepancy)를 만들었고, 사전 학습 표현이 실제 단어 문맥으로 최적으로 전이되지 않을 가능성을 낳았다.

마스크 언어 모델링에는 독립성 가정의 문제도 있었다. BERT는 한 sequence에서 여러 token을 마스킹할 때 각 token을 서로 독립적으로 예측했지만, 같은 문맥에 있는 마스크 token들은 실제로 조건부 의존 관계에 있다. 예를 들어 “The capital of France is [[MASK](/writing/special-tokens-transformers-cls-sep-pad-mask)]”에서 마스크에 “Paris”를 예측하려면 지리 이야기를 하고 있음을 이해해야 한다. 그러나 [BERT](/writing/bert-bidirectional-pretraining-revolutionizes-language-understanding)는 마스크된 여러 token을 병렬로 예측하므로 동시에 가려진 token 사이 관계를 직접 활용할 수 없었다.

BERT는 양방향 문맥을 얻는 대신 생성 모델을 학습하지 못했다. 양방향 attention으로 훈련됐기 때문에 text를 자기회귀적으로 생성할 수 없었다. 이 한계는 text 요약이나 대화 시스템처럼 [자기회귀](/writing/gpt1-gpt2-autoregressive-pretraining-transfer-learning) 능력이 꼭 필요한 생성 과제에서 중요했다. 생성 능력이 없었으므로 BERT는 이해와 생성을 모두 수행하기보다 주로 이해 과제에 한정됐다.

### 최적이 아닌 훈련 절차

BERT의 원래 훈련 절차는 모델의 잠재력을 입증하기에는 충분했지만 여러 면에서 개선 여지가 있었다. 비교적 적은 step으로 훈련했고, 당시에는 컸던 dataset도 훨씬 더 확장할 수 있었다. 또한 여러 epoch에 걸쳐 같은 sequence에 같은 마스킹 pattern을 적용하는 정적 마스킹을 사용했다. 이 때문에 특정 마스킹 pattern에 [과적합](/writing/statistical-modeling-overfitting-underfitting-bias-variance-tradeoff)할 가능성이 있었다.

문장 수준 관계를 포착하려고 넣은 [다음 문장 예측](/writing/bert-pretraining-mlm-nsp-training-guide)(next sentence prediction, NSP) 과제의 효과도 일관되지 않았다. 일부 분석은 NSP가 지나치게 쉬워 제공하는 학습 신호가 제한적이라고 보았다. 두 문장이 연속하는지를 맞히는 [이진 분류](/writing/logistic-regression-complete-guide-mathematical-foundations-python-implementation)가 문장 관계를 배우는 가장 효과적인 방법이 아닐 수 있었다. NSP를 완전히 제거했을 때 오히려 성능이 좋아지는 실험도 있어, 이 과제의 가치에 의문이 제기됐다.

[BERT](/writing/bert-bidirectional-pretraining-revolutionizes-language-understanding)의 훈련 hyperparameter도 보수적으로 선택됐다. 안정성을 확보하려고 [학습률 schedule](/writing/stochastic-gradient-descent-neural-network-optimization), batch 크기와 기타 세부 값을 정했지만, 최대 성능을 내는 최적값은 아닐 수 있었다. 계산 자원이 늘고 [Transformer](/writing/transformer-attention-is-all-you-need) 훈련에 대한 이해가 깊어지면서 더 적극적인 훈련 방식이 가능해졌다.

### 매개변수 비효율성

BERT 아키텍처는 강력했지만 여러 면에서 매개변수를 비효율적으로 사용했다. 모델은 token·segment·position embedding을 각각 저장했고, embedding 매개변수 수는 [어휘 크기](/writing/tokenizer-training-guide-huggingface-custom-nlp)와 hidden dimension의 크기에 좌우됐다. 큰 모델에서 이 embedding 매개변수는 상당한 memory를 차지했지만 반드시 hidden dimension 전체 크기를 사용할 필요는 없었다.

Transformer layer가 매개변수 대부분을 차지했지만, 모든 layer에 서로 독립된 매개변수가 필요한지도 의문이었다. 아래쪽 layer가 깊이에 걸쳐 비슷한 변환을 학습한다면 매개변수 공유로 더 적은 매개변수에서 일반적인 pattern을 배울 수 있었다. 또한 [attention mechanism](/writing/attention-mechanism-intuition-soft-lookup-weights-context-vectors)과 feedforward network의 계산량은 각각 sequence 길이에 대해 제곱 및 선형으로 늘어나므로 긴 sequence는 계산 비용이 컸다.

이런 비효율성 때문에 더 큰 [BERT](/writing/bert-bidirectional-pretraining-revolutionizes-language-understanding)를 훈련하려면 모델 크기에 비례해 더 많은 계산 자원이 필요했다. 모델 크기를 두 배로 늘리면 계산 비용도 대략 두 배가 되어, 실제로 훈련 가능한 모델 규모가 제한됐다. 정해진 계산 예산에서는 더 복잡한 pattern을 포착할 수 있는 큰 아키텍처를 탐색하기 어려웠다.

## 해법

### XLNet: 순열 언어 모델링

XLNet은 마스킹 없이 양방향 문맥을 포착하는 일반화된 [자기회귀](/writing/gpt1-gpt2-autoregressive-pretraining-transfer-learning) 사전 학습을 도입해 [마스크 언어 모델링](/writing/masked-language-modeling-bidirectional-understanding-bert)의 한계를 다뤘다. 핵심 통찰은 입력 sequence의 가능한 모든 분해 순서(factorization order)를 고려하면 자기회귀 모델도 양방향으로 만들 수 있다는 것이었다.

#### 순열 언어 모델링

XLNet은 token을 마스킹하는 대신 순열 언어 모델링(permutation language modeling)을 사용했다. 길이가 $n$인 sequence에는 $n!$개의 가능한 순열 순서가 있다. XLNet은 훈련 중 순열 하나를 표본 추출하고 그 순서에 따라 token을 예측했다. 이 방식은 유효한 [확률 분포](/writing/probability-distributions-guide-data-science)를 정의하는 데 필요한 자기회귀 성질을 유지하면서도, 주어진 위치를 예측할 때 왼쪽과 오른쪽 문맥을 모두 볼 수 있게 했다.

예를 들어 “The capital of France is Paris”라는 sequence가 있고 위치를 1부터 매긴다고 하자. XLNet은 `[3, 1, 5, 2, 4]` 같은 순열 순서를 표본 추출할 수 있다. 모델은 먼저 위치 3을 예측하면서 위치 1·2·4·5를 보고, 다음으로 위치 1을 예측하면서 위치 2·4·5를 보며, 이어서 위치 5를 예측하면서 위치 1·2·4를 보는 식으로 진행한다. 훈련 중 여러 순열에 걸쳐 평균을 내면 모델은 양방향 문맥을 포착하는 표현을 학습한다.

순열 방식은 몇 가지 문제를 해결했다. 첫째, 모델이 마스크 placeholder가 아니라 실제 token으로 이뤄진 입력을 보므로 사전 학습과 미세조정 사이 불일치를 줄였다. 둘째, [자기회귀](/writing/gpt1-gpt2-autoregressive-pretraining-transfer-learning) 구조가 조건부 분포를 모델링하므로 token 사이 의존 관계를 자연스럽게 포착했다. 셋째, [BERT](/writing/bert-bidirectional-pretraining-revolutionizes-language-understanding)의 순수 양방향 방식과 달리 자기회귀적 성질을 유지하면서 양방향 문맥을 활용했다.

#### 두 흐름 self-attention

XLNet은 순열 언어 모델링을 구현하기 위해 두 흐름 [self-attention](/writing/transformer-attention-is-all-you-need)(two-stream self-attention)을 도입했다. query stream은 예측 대상 위치를 처리하고, content stream은 순열상 이미 관찰된 위치를 처리했다. 이 이중 흐름 아키텍처는 자기회귀 제약을 올바르게 지키면서도 BERT에 견줄 만한 계산 효율로 훈련할 수 있게 했다.

content stream은 내용 embedding과 위치 [embedding](/writing/long-term-knowledge-storage-and-retrieval)을 모두 사용해 token이 자신의 내용 및 위치 정보에 접근하게 했다. query stream은 위치 정보만 사용했다. 따라서 어떤 token을 예측할 때 모델이 그 token의 내용을 직접 보지 못했다. 이 구조는 자기회귀 제약을 강제하는 동시에 순열을 통해 양방향 문맥을 활용하게 했다.

#### 상대적 위치 encoding

XLNet은 [Transformer-XL](/writing/transformer-xl-long-sequences-segment-recurrence)에서 도입한 방식과 비슷한 상대적 위치 encoding도 사용했다. 절대 위치를 encoding하는 대신 query 위치와 key 위치 사이의 상대 거리를 encoding했다. 이 방식은 훈련 때보다 긴 sequence로 일반화하는 능력을 높이고 위치 관계를 더 잘 포착했다.

### RoBERTa: 최적화된 훈련

[RoBERTa](/writing/roberta-robustly-optimized-bert-pretraining)는 [BERT](/writing/bert-bidirectional-pretraining-revolutionizes-language-understanding)의 아키텍처를 유지하되 훈련 절차를 체계적으로 개선했다. 아키텍처를 바꾸지 않아도 더 나은 훈련 방법론으로 큰 성능 향상을 얻을 수 있음을 입증했다.

#### 훈련 data와 기간

RoBERTa는 BERT보다 훨씬 많은 훈련 data를 사용했다. BERT가 합계 약 16GB인 BooksCorpus와 영어 Wikipedia로 훈련한 데 비해, RoBERTa는 CommonCrawl News, web text, Stories 자료를 더해 약 160GB로 확장했다. 약 열 배 많은 훈련 data가 더 다양한 예를 제공해 일반화를 개선했다.

훈련 기간도 늘렸다. BERT는 100만 step 동안 훈련했지만 RoBERTa는 이를 크게 연장해 모델이 충분히 수렴하고 더 큰 dataset의 이점을 최대한 끌어낼 수 있게 했다. 더 많은 data와 더 긴 훈련을 결합해 더 풍부한 표현을 배울 수 있었다.

#### 동적 마스킹

RoBERTa는 BERT의 정적 마스킹을 동적 마스킹(dynamic masking)으로 바꿨다. 여러 epoch에서 같은 sequence에 같은 마스킹 pattern을 적용하는 대신, [RoBERTa](/writing/roberta-robustly-optimized-bert-pretraining)는 sequence를 처리할 때마다 새로운 마스킹 pattern을 만들었다. 이는 특정 pattern에 [과적합](/writing/statistical-modeling-overfitting-underfitting-bias-variance-tradeoff)하는 일을 막고 더 견고한 표현을 학습하도록 했다.

동적 마스킹은 구현하기 간단했지만 효과는 의미 있었다. 마스킹 pattern이 달라지면서 모델은 예측하기 어려운 다양한 문맥을 처리하는 법을 배웠고, 단어 관계가 여러 형태로 나타나는 실제 text의 변동성에 더 잘 대응할 수 있었다.

#### 다음 문장 예측 제거

RoBERTa는 [다음 문장 예측](/writing/bert-pretraining-mlm-nsp-training-guide) 과제를 완전히 제거했다. 실험 결과 NSP가 꼭 필요하지 않았고 성능을 해칠 수도 있었다. 대신 모델은 [마스크 언어 모델링](/writing/masked-language-modeling-bidirectional-understanding-bert)에 집중하고, 더 긴 연속 sequence와 더 많은 훈련 data를 통해 문장 수준 관계를 암묵적으로 학습했다.

NSP를 없애 훈련 절차가 단순해졌고, 모델은 마스크 언어 모델링을 통해 단어 및 sequence 수준 pattern을 배우는 데 더 집중할 수 있었다. 그 결과 고품질 표현을 학습하는 데 마스크 언어 모델링만으로도 충분할 수 있음이 확인됐다.

#### 최적화된 hyperparameter

[RoBERTa](/writing/roberta-robustly-optimized-bert-pretraining)는 더 큰 dataset과 훈련 설정에 맞춰 세심하게 조정한 hyperparameter를 사용했다. [학습률 schedule](/writing/stochastic-gradient-descent-neural-network-optimization), batch 크기와 기타 세부 값을 실험 결과에 따라 조정했다. 각 변경은 점진적이었지만 누적 효과는 성능 개선에 기여했다.

### ALBERT: 매개변수 효율성

[ALBERT](/writing/albert-parameter-efficient-bert-factorized-embeddings)는 [BERT](/writing/bert-bidirectional-pretraining-revolutionizes-language-understanding)의 아키텍처를 매개변수 효율적으로 다시 설계해, 고정된 계산 예산 안에서 더 큰 모델을 훈련할 수 있게 했다.

#### 분해된 embedding 매개변수화

ALBERT는 어휘 embedding 크기와 hidden dimension 크기를 분리했다. BERT에서는 둘이 같아 embedding 매개변수가 $V \times H$로 늘어났다. 여기서 $V$는 [어휘 크기](/writing/tokenizer-training-guide-huggingface-custom-nlp), $H$는 hidden dimension이다. ALBERT는 $H$보다 작은 중간 embedding dimension $E$를 도입해 $V \times E$ 크기의 [embedding](/writing/long-term-knowledge-storage-and-retrieval)을 만들고, 선형 변환으로 $H$ 차원에 projection했다.

이 분해는 embedding 매개변수 수를 $V \times H$에서 $V \times E + E \times H$로 줄였다. $H=768$, $E=128$ 같은 일반적인 값에서는 embedding 매개변수가 크게 줄었다. projection layer에는 $E \times H$개의 매개변수가 추가되지만 embedding 행렬을 줄여 얻는 절감량보다 훨씬 작았다.

#### layer 간 매개변수 공유

ALBERT는 각 [Transformer](/writing/transformer-attention-is-all-you-need) layer에 독립 매개변수를 두지 않고 layer 사이에서 매개변수를 공유했다. 따라서 모든 layer가 같은 변환을 반복 적용했고 매개변수 수가 크게 줄었다. 12-layer 모델이라면 layer별 구성 요소의 매개변수를 대략 12분의 1 수준으로 줄일 수 있었다.

매개변수 공유는 네트워크 깊이의 여러 위치에서 통하는 더 일반적인 변환을 학습하도록 모델을 제약했다. 얼핏 제한처럼 보이지만, 실험에서는 공유 모델이 훨씬 적은 매개변수로도 비공유 모델에 견줄 만한 성능을 낼 수 있었다. 같은 매개변수를 깊이에 따라 반복 적용하면서 서로 다른 추상화 수준의 정보를 암묵적으로 표현했다.

#### 문장 순서 예측

[ALBERT](/writing/albert-parameter-efficient-bert-factorized-embeddings)는 [다음 문장 예측](/writing/bert-pretraining-mlm-nsp-training-guide)을 문장 순서 예측(sentence order prediction, SOP)으로 바꿨다. 두 문장이 연속하는지를 맞히는 대신, 두 문장이 올바른 순서로 놓였는지 예측했다. 단순한 인접성보다 문장 수준의 일관성을 이해해야 했기 때문에 더 효과적인 과제였다.

SOP는 훈련 예의 절반에서 연속한 두 문장의 순서를 바꾸는 방식으로 작동했다. 모델은 문장이 자연스러운 순서인지 서로 뒤바뀌었는지 구분하는 법을 배웠다. 이 목표는 문장 수준 관계를 더 잘 포착했고 문장 이해가 필요한 후속 과제의 성능을 높였다.

#### 매개변수 효율성의 효과

이 아키텍처 혁신으로 ALBERT는 훨씬 큰 모델을 훈련할 수 있었다. [BERT](/writing/bert-bidirectional-pretraining-revolutionizes-language-understanding)-base는 1억 1천만, BERT-large는 3억 4천만 매개변수를 사용했지만, ALBERT-base는 1천2백만 매개변수로 비슷한 성능을 달성했고 ALBERT-large는 1천8백만 매개변수로 BERT-large보다 나은 성능을 달성했다. 극단적인 매개변수 효율성 덕분에 더 큰 [ALBERT](/writing/albert-parameter-efficient-bert-factorized-embeddings) 모델도 합리적인 계산 예산 안에서 훈련할 수 있었다.

## 응용과 영향

세 모델은 다양한 NLP 과제에 곧바로 적용됐고, 사용 사례에 따라 서로 다른 장점을 제공했다. XLNet의 양방향 [자기회귀](/writing/gpt1-gpt2-autoregressive-pretraining-transfer-learning) 방식은 이해와 생성이 모두 필요한 과제에서 특히 강점을 보였다. [RoBERTa](/writing/roberta-robustly-optimized-bert-pretraining)의 최적화된 훈련은 여러 후속 과제에서 강력한 기본 선택지가 됐다. [ALBERT](/writing/albert-parameter-efficient-bert-factorized-embeddings)의 효율성은 자원이 제한된 환경에서 배포할 수 있게 했다.

XLNet은 공개 당시 [GLUE](/writing/glue-superglue-standardized-evaluation-language-understanding), RACE, [SQuAD](/writing/squad-stanford-question-answering-dataset-reading-comprehension-benchmark)를 비롯한 여러 benchmark에서 최고 수준 성능을 보였다. 마스킹 artifact 없이 양방향 문맥을 포착하는 능력은 미묘한 이해가 필요한 과제에서 유용했다. 순열 언어 모델링은 사전 학습 목표에 관한 후속 연구에 영향을 주었지만, 구현과 계산의 복잡성 때문에 널리 채택되는 데에는 제약이 있었다.

RoBERTa는 후속 과제에 미세조정할 때 널리 쓰였고 새 연구의 강력한 baseline 역할도 했다. 단순한 아키텍처와 개선된 훈련 recipe를 결합해 접근성과 성능을 모두 확보했다. 여러 실용 시스템이 RoBERTa를 backbone으로 채택했고, 훈련 방법론의 개선은 후속 모델의 훈련 방식에 영향을 주었다.

ALBERT의 매개변수 효율성은 계산 제약이 있는 응용에 유용했다. 비슷한 크기의 [BERT](/writing/bert-bidirectional-pretraining-revolutionizes-language-understanding) 모델은 배치할 수 없는 mobile·edge 장치에서도 [ALBERT](/writing/albert-parameter-efficient-bert-factorized-embeddings)를 배치할 수 있었다. 특히 매개변수 공유와 분해 embedding이라는 아키텍처 혁신은 효율적인 Transformer 연구에 영향을 주었다. 매개변수 공유로 성능을 유지하면서 매개변수를 크게 줄일 수 있다는 통찰은 [모델 scaling](/writing/power-laws-deep-learning-neural-network-scaling)의 새로운 가능성을 열었다.

세 모델은 사전 학습 Transformer에 상당한 개선 여지가 있음을 함께 보여 주었다. XLNet은 사전 학습 목표를 근본적으로 다시 생각할 수 있음을, [RoBERTa](/writing/roberta-robustly-optimized-bert-pretraining)는 훈련 방법론의 개선이 큰 이득을 낼 수 있음을, ALBERT는 아키텍처 효율성으로 새로운 모델 구성을 탐색할 수 있음을 보였다. 이 교훈은 이해와 생성 과제를 text-to-text 형식으로 통합한 [T5](/writing/t5-text-to-text-framework-unified-nlp-through-text-transformations), 전례 없는 크기로 확장한 [GPT-3](/writing/gpt3-in-context-learning-emergent-capabilities-from-scale) 같은 후속 모델의 개발에 영향을 주었다.

연구에서는 특히 ALBERT의 효율성을 통해 적은 매개변수 memory로 여러 크기의 모델을 실험할 수 있었다. 매개변수 공유 기법은 특정 hardware 제약이나 응용에 맞춘 효율적인 Transformer 연구에도 영향을 주었다.

## 한계

각 모델은 개선점과 함께 기존 한계를 남겼고 새로운 과제도 만들었다. XLNet의 순열 언어 모델링은 이론적으로 정교하지만 [BERT](/writing/bert-bidirectional-pretraining-revolutionizes-language-understanding)보다 구현과 훈련이 복잡했다. 순열에 따른 attention mask와 두 흐름 attention을 관리해야 했고, 이 복잡성은 단순한 대안에 비해 채택을 제한했다.

[RoBERTa](/writing/roberta-robustly-optimized-bert-pretraining)의 개선은 주로 더 많은 data와 더 긴 훈련에서 왔으므로 상당한 계산 자원이 필요했다. 훈련 data가 약 열 배 늘어나 RoBERTa를 재현하려면 대규모 dataset과 상당한 compute가 필요했다. 방법론적 개선은 가치가 있었지만 모델의 역량을 근본적으로 바꾸거나 정적인 [embedding](/writing/long-term-knowledge-storage-and-retrieval) 같은 핵심 한계를 해결하지는 않았다.

[ALBERT](/writing/albert-parameter-efficient-bert-factorized-embeddings)의 매개변수 공유는 효율적이지만 표현 capacity를 제약할 수 있었다. 모든 layer가 같은 변환을 학습하면 계층적인 표현을 학습하는 능력이 제한될 수 있다. 일부 분석에서는 공유 제약 때문에 ALBERT가 수렴하는 데 더 많은 훈련이 필요할 수 있다고 보았고, 이는 효율성 이득의 일부를 상쇄한다.

세 모델 모두 [BERT](/writing/bert-bidirectional-pretraining-revolutionizes-language-understanding)의 한계, 곧 후대 모델만큼 유연하게 문맥에 따른 의미 변화를 포착하지 못하는 정적 embedding을 만든다는 한계를 남겼다. 또한 encoder-only 아키텍처를 유지해 text를 자연스럽게 생성하는 능력이 제한됐다. XLNet의 [자기회귀](/writing/gpt1-gpt2-autoregressive-pretraining-transfer-learning) 구조는 이론상 생성을 지원했지만 순열 mechanism 때문에 순수 자기회귀 모델보다 생성이 복잡했다.

또한 [Transformer](/writing/transformer-attention-is-all-you-need) 아키텍처 전반의 한계도 공유했다. [제곱 attention](/writing/quadratic-attention-bottleneck-transformers-long-sequences) 복잡성 때문에 매우 긴 sequence를 처리하기 어려웠다. [ALBERT](/writing/albert-parameter-efficient-bert-factorized-embeddings)가 매개변수 수를 줄였어도 훈련에는 상당한 계산 자원이 필요했다. 훈련 뒤 새로운 정보를 반영하려면 추가 학습이나 외부 retrieval 같은 별도 방법이 필요했다.

## 유산

XLNet·[RoBERTa](/writing/roberta-robustly-optimized-bert-pretraining)·[ALBERT](/writing/albert-parameter-efficient-bert-factorized-embeddings)는 2019년의 사전 학습 [Transformer](/writing/transformer-attention-is-all-you-need) 패러다임이 아직 성숙 단계에 이르지 않았음을 함께 보여 주었다. 서로 다른 접근은 개선 경로가 여러 가지이며, 목표·훈련·아키텍처를 각각 바꿔도 상당한 성과를 얻을 수 있음을 입증했다.

RoBERTa의 훈련 방법론은 Transformer 훈련의 표준 관행에 영향을 주었다. 더 많은 data, 충분한 훈련, 동적 마스킹, 세심한 hyperparameter 조정에 대한 강조가 후속 모델의 recipe에 반영됐다. 아키텍처를 바꾸지 않고도 훈련 방법론만으로 큰 개선을 얻을 수 있다는 통찰은 훈련 절차 자체를 더 체계적으로 조사하게 했다.

ALBERT의 매개변수 효율화 기법도 후속 연구에 영향을 주었다. 매개변수 공유, 분해 embedding, 효율성을 위한 아키텍처 재설계가 여러 후대 모델에 나타났다. [ALBERT](/writing/albert-parameter-efficient-bert-factorized-embeddings)가 보인 극단적인 효율성은 큰 모델이 언제나 필요한 것은 아니며, 세심한 아키텍처 설계로 더 적은 자원에서도 강한 성능을 얻을 수 있음을 보여 주었다.

XLNet의 순열 언어 모델링은 널리 채택되지는 않았지만 사전 학습 목표에 관한 사고에 영향을 주었다. [자기회귀](/writing/gpt1-gpt2-autoregressive-pretraining-transfer-learning) 모델도 순열을 통해 양방향 문맥을 활용할 수 있다는 통찰은 새로운 연구 방향을 열었다. 가능한 분해 순서를 폭넓게 이용한다는 발상은 복잡했지만, 사전 학습 목표를 근본적으로 재설계할 수 있음을 보였다.

세 모델은 체계적인 평가와 ablation 연구의 중요성도 부각했다. [RoBERTa](/writing/roberta-robustly-optimized-bert-pretraining)가 훈련 구성 요소를 세심하게 분석한 작업은 어떤 훈련 요소가 실제로 중요한지 분리해야 함을 보여 주었다. ALBERT의 아키텍처 실험은 체계적인 설계 선택으로 효율성을 얻을 수 있음을 입증했다. 이런 방법론적 기여는 후속 모델의 개발과 평가 방식에도 영향을 미쳤다.

특히 [ALBERT](/writing/albert-parameter-efficient-bert-factorized-embeddings)의 아키텍처 혁신은 자원이 제한된 환경에 적용됐다. 이 기법으로 만든 효율적인 [Transformer](/writing/transformer-attention-is-all-you-need)는 mobile 장치, edge computing, 특수 hardware에 배치할 수 있었다. 매개변수 공유와 factorization 발상은 특정 배치 조건을 겨냥한 여러 후대의 효율적 Transformer 변형에 나타났다.

세 모델이 남긴 집합적 영향은 사전 학습 Transformer가 여전히 빠르게 진화하고 있다는 사실을 보여 준 데 있다. [BERT](/writing/bert-bidirectional-pretraining-revolutionizes-language-understanding)가 패러다임의 실현 가능성을 입증했다면, XLNet·RoBERTa·ALBERT는 상당한 개선이 더 가능함을 보였다. 이는 Transformer 아키텍처, 훈련 방법, 효율성 기법에 관한 연구를 촉진했고, 뒤이어 수많은 Transformer 변형이 등장하는 토대가 됐다.

이 모델들은 이후에도 이어질 연구 pattern을 확립했다. [RoBERTa](/writing/roberta-robustly-optimized-bert-pretraining)가 강조한 훈련 방법론은 후속 모델에서도 계속 중요했다. ALBERT의 효율성 문제의식은 모델이 커질수록 더 중요해졌다. XLNet이 보여 준 사전 학습 목표 재설계는 여러 과제를 단일 아키텍처로 다루려 한 [T5](/writing/t5-text-to-text-framework-unified-nlp-through-text-transformations) 같은 통합 모델을 읽는 비교축을 제공했다. 세 모델의 교훈은 그다음 세대 언어 모델 개발에 함께 반영됐다.
