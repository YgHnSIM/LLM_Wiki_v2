---
source_file: "059_GPT-1 & GPT-2 Autoregressive Pretraining and Transfer Learning.md"
translation_file: "059_GPT-1 & GPT-2 Autoregressive Pretraining and Transfer Learning.ko.md"
commentary_type: "해설"
source_stem: "059_GPT-1 & GPT-2 Autoregressive Pretraining and Transfer Learning"
order_prefix: "059"
topic: "GPT-1과 GPT-2의 자기회귀 사전 학습"
period: "2018–2019년"
tags:
  - LLM
  - NLP
  - AI-history
  - commentary
---

# GPT-1과 GPT-2의 자기회귀 사전 학습 해설

## 1. 한눈에 보기

- 핵심 주제: causal Transformer의 다음 token 예측을 지도 미세조정과 zero-shot task continuation으로 전이한 두 단계
- 등장 배경: 과제별 구조·표지 자료를 반복해서 만드는 자연어 처리 개발 방식
- 가장 중요한 아이디어: 하나의 자기회귀 언어 모델 목적을 큰 비표지 text에 학습하고, 과제 입력을 token sequence로 표현한다.
- 이후 LLM/NLP에 남긴 영향: 생성형 사전 학습·전체 미세조정·cue 기반 zero-shot 평가와 규모 확대 경로를 연결했다.

> 이 문서는 `059_GPT-1 & GPT-2 Autoregressive Pretraining and Transfer Learning.md`의 번역문을 이해하기 위한 해설이다. GPT-1의 지도 전이와 GPT-2의 zero-shot 평가를 같은 성과로 합치지 않는다.

## 2. 핵심 요약

GPT-1은 BookCorpus에서 12층 causal Transformer를 다음 token 예측으로 사전 학습하고, 구조화된 과제 입력을 하나의 sequence로 바꿔 12개 데이터셋에 지도 미세조정했다. 9개에서 당시 최고 결과를 유의하게 개선했다. GPT-2는 같은 계열을 최대 48층·1.5B 매개변수, 1024 token context와 WebText 약 8백만 문서로 키웠다. 별도 task fine-tuning 없이 cue와 evaluation protocol만으로 language modeling·LAMBADA·CBT·Winograd 및 제한된 번역·요약·QA를 시험했다. 규모 확대는 수행을 넓혔지만 다수 zero-shot 과제는 지도 최고 성능과 거리가 컸다.

- 무엇을 다루는가: GPT-1의 두 단계 전이와 GPT-2의 규모·zero-shot 실험
- 어떤 문제를 해결하려 했는가: 과제마다 모델 구조와 표지 학습을 처음부터 반복하는 비용
- 어떤 방식이 새로웠는가: causal LM을 공통 기반으로 삼고 구조화된 과제를 text sequence로 변환
- 결과적으로 무엇이 바뀌었는가: 생성 언어 모델을 여러 과제의 기반으로 보는 연구 경로가 확립됐다.

## 3. 역사적 배경

Transformer는 2017년 번역 encoder–decoder로 발표됐다. ELMo는 고정 biLM 특징, ULMFiT는 LSTM LM 미세조정, BERT는 MLM encoder 전체 미세조정을 보여 주었다. GPT-1은 causal Transformer의 생성 사전 학습과 지도 미세조정을 결합했고, GPT-2는 fine-tuning 대신 사전 학습 text continuation만으로 여러 task 형식을 시험했다.

- 이전 접근법: 정적 단어 표현, 과제별 구조, LSTM LM 전이, 번역용 Transformer
- 당시의 한계: 문장·문서 표현 전이, 통일된 과제 입력, 생성과 이해의 공통 기반
- 이 주제가 필요했던 이유: 비표지 text의 공통 통계를 여러 표지 과제 또는 cue 기반 수행에 재사용하기 위해서였다.

## 4. 핵심 개념 해설

### 4.1 causal 자기회귀 목적

sequence joint probability를 앞 token 조건부 확률의 곱으로 분해한다. causal mask는 위치 $i$가 미래 token을 보지 못하게 한다. 훈련에서는 정답 sequence를 한꺼번에 알고 여러 위치 손실을 병렬 계산할 수 있지만 생성에서는 방금 뽑은 token을 다음 입력으로 사용한다.

### 4.2 GPT-1의 지도 전이

자연어 추론·유사도·분류·다지선다 QA를 start·delimiter·extract token으로 하나의 연속 sequence로 바꾼다. 마지막 위치 표현에 선형층을 두고 지도 loss와 보조 LM loss를 결합해 전체 모델을 미세조정한다. ‘과제 전용 구조 없음’은 입력 변환과 출력층까지 없다는 뜻이 아니다.

### 4.3 GPT-2의 zero-shot

매개변수를 갱신하지 않고 `TL;DR:` 같은 cue와 task별 decoding·scoring을 사용한다. 이는 모델이 임의 자연어 지시를 안정적으로 따르는 현대 instruction-tuned assistant와 다르다. 수행 가능성을 보였지만 QA·요약·번역의 절대 성능은 혼재했다.

### 4.4 규모와 자료의 결합

GPT-1→GPT-2에서는 매개변수뿐 아니라 WebText 자료량·장르, context 길이, byte-level BPE, normalization과 initialization도 바뀌었다. 결과 향상을 ‘매개변수 수만의 창발’로 인과 귀속하지 않는다.

## 5. 원문의 논리 구조

원문은 과제별 구조와 표지 자료의 중복을 문제로 제시한다. GPT-1의 causal Transformer·다음 token 목적·BookCorpus·과제 입력 변환·지도 미세조정을 첫 해법으로 설명하고, GPT-2의 1.5B·WebText·zero-shot 수행을 규모 확장으로 잇는다. 후반에는 전이 학습·생성·안전 공개에 미친 영향을 평가하고, 단방향 문맥·환각·zero-shot 불안정·계산·추론·편향을 한계로 든다.

1. 과제별 자연어 처리의 반복 비용을 제시한다.
2. GPT-1의 사전 학습–지도 미세조정 절차를 설명한다.
3. GPT-2가 규모와 자료를 늘려 fine-tuning 없는 task 수행을 시험한 방식을 설명한다.
4. 생성·전이·공개 정책의 영향을 평가한다.
5. 현대 GPT 계보와 원 논문 범위를 구분한다.

## 6. 왜 중요한가

GPT-1은 다음 token 예측이 생성뿐 아니라 분류·추론·QA 표현의 초기값이 될 수 있음을 보였다. GPT-2는 과제를 별도 출력 헤드가 아니라 text continuation 형식으로 표현할 가능성을 시험했다. 둘을 연결하면 현대 생성 LLM의 핵심 변화가 단순히 모델 크기 증가가 아니라 **과제 적응이 가중치 갱신에서 입력 문맥으로 일부 이동한 과정**임을 볼 수 있다.

핵심적으로 중요한 점:

- causal language modeling을 일반 사전 학습 목적으로 사용했다.
- 과제 구조를 token sequence와 delimiter로 통일했다.
- 지도 fine-tuning과 zero-shot continuation을 서로 다른 전이 단계로 보여 주었다.

## 7. 현대 LLM과의 연결

현대 decoder-only LLM은 causal next-token pretraining과 autoregressive decoding을 크게 이어받았다. 그러나 instruction tuning, RLHF, tool use, retrieval와 system prompt는 GPT-1·2 원 모델에 없던 후속 요소다. GPT-2가 task cue에 반응했다는 사실을 오늘날 assistant alignment가 이미 완성됐다는 증거로 읽지 않는다.

GPT-3의 few-shot in-context learning은 GPT-2의 zero-shot 실험을 더 체계적으로 확장했다. GPT-1의 전체 미세조정과 GPT-2의 입력 조건화 사이 대비는 오늘날 fine-tuning·prompting·retrieval·tool use를 어디에 배치할지 이해하는 출발점이다.

## 8. 한계와 비판적 관점

- 기술적 한계: causal context, token별 순차 생성, 큰 계산·메모리 비용
- 평가 한계: GPT-2의 일부 language modeling 기록과 낮은 QA·요약·번역 성능을 모두 ‘zero-shot 능력’ 한 말로 묶을 수 없다.
- 사실성 한계: next-token likelihood는 출처 확인이나 참·거짓 판별 목적이 아니다.
- 자료 한계: BookCorpus·WebText의 영어·웹 편향, 저작권·대표성·유해 text 문제가 남는다.
- 역사적 한계: GPT-2의 초기 1.5B 보류는 2019년 단계적 공개로 끝났으며 영구 비공개로 기록하면 안 된다.

원문의 ‘emergent capabilities’와 ‘general language understanding’은 후대 개념을 초기 결과에 소급할 수 있다. 모델 크기별 연속적인 개선인지 질적 도약인지, 어떤 평가가 실제 task 능력을 측정했는지 분리해야 한다.

## 9. 용어 정리

| 용어 | 설명 |
|---|---|
| causal LM | 현재 token을 앞선 token에만 조건화해 다음 token을 예측하는 언어 모델 |
| 지도 미세조정 | 표지 과제 loss로 사전 학습 매개변수를 계속 갱신하는 적응 |
| zero-shot | 해당 과제의 표지 예시로 가중치를 학습하지 않고 평가하는 설정 |
| WebText | Reddit 외부 링크를 바탕으로 수집한 GPT-2의 약 8백만 웹 문서 corpus |
| byte-level BPE | byte를 기본 symbol로 삼고 자주 나타나는 연속을 merge하는 tokenizer 계열 |
| staged release | 모델 크기별로 시간을 두고 공개 범위를 넓히는 방식 |

## 10. 함께 보면 좋은 글

- [[058_BERT Bidirectional Pretraining Revolutionizes Language Understanding]]
- [[057_ELMo and ULMFiT Transfer Learning for Natural Language Processing]]
- [[055_The Transformer Attention Is All You Need]]

## 11. 읽고 생각해볼 질문

1. GPT-1의 입력 변환은 과제 전용 구조를 얼마나 제거하고 얼마나 text 형식으로 옮겼는가?
2. GPT-2의 zero-shot 결과 가운데 언어 모델링과 QA·요약은 왜 같은 강도로 평가하면 안 되는가?
3. 매개변수·자료·context·tokenizer가 함께 변할 때 규모의 인과 효과를 어떻게 분리할 수 있는가?
4. causal 생성과 BERT식 양방향 표현은 어떤 응용에서 서로 다른 장단점을 만드는가?

## 12. 짧은 결론

GPT-1은 causal Transformer를 비표지 text에서 사전 학습하고 표지 과제에 전체 미세조정하는 경로를 입증했다. GPT-2는 모델·자료·context를 키우고 매개변수 갱신 없이 task cue만으로 수행을 시험했다. 두 모델의 차이는 현대 생성 LLM이 가중치 기반 전이에서 문맥 기반 적응으로 이동한 초기 과정을 보여 주지만, 당시 zero-shot 결과의 제한과 후대 instruction·alignment 단계를 함께 구분해야 한다.
