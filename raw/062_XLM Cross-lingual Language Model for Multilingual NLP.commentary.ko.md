---
source_file: "061_XLM Cross-lingual Language Model for Multilingual NLP.md"
translation_file: "061_XLM Cross-lingual Language Model for Multilingual NLP.ko.md"
commentary_type: "해설"
source_stem: "061_XLM Cross-lingual Language Model for Multilingual NLP"
order_prefix: "061"
topic: "XLM과 교차 언어 언어 모델 사전 학습"
period: "2019년"
tags:
  - LLM
  - NLP
  - AI-history
  - commentary
---

<!-- Obsidian note: frontmatter와 링크 대상을 검증했으며, 원문의 과장·연대 오류는 8절에서 원 논문과 대조한다. -->

# XLM과 교차 언어 언어 모델 사전 학습 해설

## 1. 한눈에 보기

- 핵심 주제: 단일 언어 text와 병렬 문장쌍으로 여러 언어의 표현을 공동 사전 학습하는 방법
- 등장 배경: BERT식 사전 학습의 전이 이점을 target 언어의 label이 부족한 교차 언어 과제로 확장하려는 문제
- 가장 중요한 아이디어: CLM·MLM과, 병렬 문장 양쪽을 함께 보고 masked token을 복원하는 TLM을 구분한다.
- 이후 LLM/NLP에 남긴 영향: multilingual pretraining을 objective·corpus·label transfer 조건으로 나눠 평가하는 기준을 제공했다.

> 이 문서는 `061_XLM Cross-lingual Language Model for Multilingual NLP.md`의 번역문을 이해하기 위한 해설이다. 원문을 반복하기보다 XLM 원 논문이 실제로 학습·평가한 범위와 zero-shot의 정확한 뜻을 정리한다.

## 2. 핵심 요약

XLM은 하나의 고정 모델 이름이라기보다 cross-lingual language model pretraining 방법군이다. 단일 언어 corpus만 쓰는 causal language modeling(CLM)과 masked language modeling(MLM), 병렬 문장쌍을 쓰는 translation language modeling(TLM)을 비교했다. TLM은 번역쌍을 이어 붙여 양쪽 token 일부를 가리고 두 언어 문맥 전체에서 복원한다. XNLI에서는 영어 label로만 fine-tune한 뒤 사전 학습에 포함된 다른 언어의 test set을 평가했다. 단일 언어 data만 사용한 MLM도 당시 강한 결과를 냈고, parallel data가 있는 MLM+TLM은 평균 정확도를 더 높였다. 논문은 XNLI 외에도 비지도·지도 기계 번역, Nepali 언어 모델, 교차 언어 단어 유사도를 평가했다. 따라서 XLM의 실증 범위는 “훈련에서 전혀 보지 않은 언어의 모든 과제”가 아니라, unlabeled multilingual pretraining 뒤 target-language task label 없이 전이하는 조건이다.

- 무엇을 다루는가: CLM, MLM, TLM, shared BPE, XNLI zero-shot transfer, 지도·비지도 MT
- 어떤 문제를 해결하려 했는가: target 언어 label과 병렬 data가 제한된 상황에서 언어 사이 표현을 전이하는 문제
- 어떤 방식이 새로웠는가: parallel sentence pair의 양쪽 문맥을 한 Transformer 입력에서 cross-attend하게 하는 TLM
- 결과적으로 무엇을 바꾸었는가: multilingual representation의 품질을 언어별 label 없이 공통 benchmark에서 비교하는 강한 기준을 세웠다.

## 3. 역사적 배경

다국어 word embedding과 multilingual sequence encoder 연구는 XLM보다 먼저 존재했다. XNLI benchmark도 2018년에 발표됐고, multilingual BERT는 XLM 원 논문에서 비교되는 동시대 baseline이다. XLM의 위치는 다국어 NLP를 처음 만든 데 있지 않다. 대규모 language model pretraining의 CLM·MLM을 여러 언어로 확장하고, parallel data를 사용할 수 있을 때 TLM이라는 explicit cross-lingual objective를 더한 데 있다.

- 이전 접근법: bilingual word embedding, multilingual machine translation encoder, multilingual BERT
- 당시의 한계: 언어별 label 부족, monolingual pretraining만으로 생기는 정렬의 불확실성, 언어쌍별 MT data 의존
- 이 주제가 필요했던 이유: 영어 task label로 학습한 classifier를 다른 언어에 얼마나 옮길 수 있는지 같은 protocol로 비교해야 했다.

## 4. 핵심 개념 해설

### 4.1 CLM·MLM·TLM은 무엇이 다른가

CLM은 각 위치에서 앞선 token만 보고 다음 token을 예측한다. MLM은 한 언어 문장의 일부 token을 가리고 양쪽 문맥에서 복원한다. TLM은 번역 관계인 두 문장을 한 입력으로 이어 붙이고 양쪽에서 token을 가린 뒤 두 언어의 전체 문맥을 사용한다. 논문의 MLM+TLM 설정은 먼저 CLM을 끝내고 TLM으로 넘어가는 순차 과정이 아니라 두 objective의 batch를 번갈아 학습한다.

### 4.2 zero-shot은 ‘언어를 처음 본다’는 뜻이 아니다

XNLI 실험에서 encoder는 15개 평가 언어의 unlabeled text로 사전 학습됐다. classifier fine-tuning에 쓰인 NLI label만 영어였다. 따라서 zero-shot은 target 언어의 labeled NLI example을 쓰지 않았다는 뜻이다. target 언어의 text 자체를 사전 학습에서 전혀 보지 않았다는 뜻이 아니다. 원문의 “영어·프랑스어·스페인어만 보고 Italian QA” 예시는 논문에 없고, Italian은 당시 XNLI 15개 언어에도 포함되지 않았다.

### 4.3 공유 subword와 정렬 신호

공유 BPE는 같은 alphabet의 문자열, 숫자, 고유명사 같은 lexical anchor를 공유할 수 있게 한다. 그러나 철자가 다른 `dog`·`chien`·`perro`가 공유 vocabulary만으로 자동으로 가까워지는 것은 아니다. shared parameters, multilingual corpus의 통계, TLM에서 번역문 양쪽을 직접 cross-attend하는 신호가 함께 표현 정렬을 만든다.

## 5. 원문의 논리 구조

원문은 언어별 모델과 pivot translation의 비용을 문제로 제시한다. 이어 shared Transformer·vocabulary·embedding을 공통 기반으로 설명하고 TLM을 핵심 해법으로 놓는다. 후반에는 zero-shot·저자원 언어·검색·질의응답·후속 모델·open source 영향을 넓게 서술한 뒤 parallel data·문자 체계·compute 한계를 정리한다.

1. 단일 언어 모델과 번역 중계 방식의 제약을 제시한다.
2. shared architecture와 BPE를 공통 표현의 기반으로 설명한다.
3. TLM이 병렬 문장 사이 cross-attention을 만드는 방식을 설명한다.
4. zero-shot·저자원·교차 언어 응용으로 효과를 확장한다.
5. 후속 다국어 모델과 장기적 영향을 평가한다.

## 6. 왜 중요한가

XLM은 “다국어 모델”을 언어 수 하나로 평가하지 않고 어떤 data와 objective가 언어 사이 정렬을 만드는지 비교했다. 특히 monolingual-only MLM과 parallel-data TLM을 함께 제시해 병렬 corpus가 없을 때와 있을 때의 두 경로를 분리했다. XNLI protocol은 representation pretraining과 task supervision이 어느 언어에서 주어졌는지도 명시하게 했다.

특히 중요한 점:

- target-language label이 없어도 multilingual unlabeled pretraining으로 task transfer가 가능함을 보였다.
- TLM의 추가 이득을 같은 XNLI 평균에서 MLM과 비교했다.
- classification만이 아니라 지도·비지도 MT, 저자원 LM, cross-lingual word similarity를 함께 평가했다.

## 7. 현대 LLM과의 연결

현대 multilingual LLM도 여러 언어의 corpus와 shared parameters를 사용하지만, XLM의 결과를 오늘날 모델 전체에 그대로 일반화할 수는 없다. language mixture, tokenizer allocation, model capacity, sampling temperature, parallel data 사용 여부에 따라 언어 간 positive transfer와 interference가 달라진다. XLM-R은 XLM 계열의 직접 후속 확장으로 별도 논문에서 연결할 수 있지만, mT5는 text-to-text 계열의 병렬 발전으로 보는 편이 정확하다.

- multilingual pretraining: 사전 학습 언어와 downstream label 언어를 구분해 보고한다.
- data mixture: 고자원 언어가 batch를 독점하지 않도록 language sampling을 설계한다.
- evaluation: 평균 점수뿐 아니라 언어별 격차와 script·형태·domain 차이를 본다.

## 8. 한계와 비판적 관점

원문은 XLM의 방향을 잘 설명하지만 다음 주장은 원 논문의 실험보다 넓다.

- 논문은 few-shot transfer를 평가하지 않았다.
- zero-shot은 target 언어를 사전 학습에서 전혀 보지 않았다는 뜻이 아니다. target-language task label을 쓰지 않았다는 뜻이다.
- XLM은 모든 objective를 차례로 거친 단일 모델이 아니다. CLM·MLM·MLM+TLM 설정을 비교한 방법군이다.
- TLM만이 성공의 유일한 원인은 아니다. XNLI 평균은 monolingual-only MLM 71.5, MLM+TLM 75.1이었다.
- 공유 vocabulary가 번역어를 자동으로 가까운 vector로 만든다는 `cat/chat`, `dog/chien/perro` 설명은 직접 근거가 없다.
- cross-lingual information retrieval과 QA는 이 논문에서 평가하지 않았다. 실증 과제는 XNLI, 지도·비지도 MT, Nepali LM, word similarity였다.
- 저자원 언어 일반의 포괄적 개선보다 Swahili·Urdu XNLI와 Nepali perplexity처럼 보고된 조건을 제시해야 한다.
- single deployment의 비용 절감은 측정 결과가 아니다. XNLI language model pretraining 자체는 64 Volta GPU를 사용했다.
- 비라틴 script·복잡한 형태론의 불리함은 가능한 mechanism이지만 이 논문이 직접 입증한 결과는 아니다.
- mBERT는 XLM의 후속 모델이 아니라 선행·동시대 baseline이다. XNLI도 XLM보다 먼저 발표됐다.
- data 품질이 architecture보다 중요하다는 결론, multimodal AI에 대한 영향, 모든 현대 multilingual model의 직접 계보는 별도 근거가 필요하다.

원 논문의 가장 단단한 수치는 XNLI에서 MLM 71.5, MLM+TLM 75.1 평균, 비지도 MT의 German→English 34.3 BLEU, 지도 Romanian→English 38.5 BLEU, Nepali perplexity 157.2에서 109.3으로의 변화다. 각 값은 해당 corpus·tokenizer·compute와 benchmark에 조건화된다.

## 9. 용어 정리

| 용어 | 설명 |
|---|---|
| cross-lingual transfer | 한 언어에서 얻은 표현이나 task supervision을 다른 언어의 출력에 재사용하는 것 |
| CLM | 앞선 token에 조건화해 다음 token을 예측하는 causal language modeling |
| MLM | 일부 token을 가리고 같은 언어의 양쪽 문맥에서 복원하는 masked language modeling |
| TLM | 병렬 문장쌍의 양쪽을 함께 보고 masked token을 복원하는 translation language modeling |
| zero-shot XNLI | 영어 NLI label로 fine-tune하고 target 언어 label 없이 다른 언어 test set을 평가하는 조건 |
| parallel corpus | 같은 내용을 서로 다른 언어로 정렬해 둔 문장·문서 자료 |
| language sampling | corpus 크기가 다른 언어가 training batch에 들어오는 비율을 조절하는 절차 |

## 10. 함께 보면 좋은 항목

- [[057_BERT Bidirectional Pretraining Revolutionizes Language Understanding]]
- [[049_Subword Tokenization and FastText Character N-gram Embeddings for Robust Word Representations]]
- [[045_Sequence-to-Sequence Neural Machine Translation End-to-End Learning Revolution]]
- [[059_GLUE and SuperGLUE Standardized Evaluation for Language Understanding]]

## 11. 읽고 생각해볼 질문

1. XLM의 zero-shot protocol에서 target 언어가 보이지 않는 단계는 pretraining인가, labeled fine-tuning인가?
2. TLM은 monolingual MLM에 어떤 정보 경로를 추가하는가?
3. shared BPE와 shared Transformer parameter는 각각 어떤 정렬 신호와 capacity 제약을 만드는가?
4. 여러 언어의 평균 성능이 올라도 저자원 언어의 격차가 남을 수 있는 이유는 무엇인가?

## 12. 짧은 결론

XLM의 핵심은 “한 모델이 모든 언어를 이해했다”는 선언이 아니라 교차 언어 전이를 학습 조건으로 분해한 데 있다. monolingual CLM·MLM과 parallel-data TLM, unlabeled target-language pretraining과 English-only task label을 구분하면 성과와 한계가 선명해진다. 이 구분은 오늘날 multilingual LLM을 평가할 때도 어떤 언어의 data·label·compute가 실제로 사용됐는지를 먼저 묻게 한다.
