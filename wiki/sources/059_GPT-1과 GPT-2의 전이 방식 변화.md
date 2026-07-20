---
schema_version: 2
id: source.059
page_type: source
title: GPT-1과 GPT-2의 전이 방식 변화
aliases:
  - 059_GPT-1 & GPT-2 Autoregressive Pretraining and Transfer Learning
  - Improving Language Understanding by Generative Pre-Training
  - Language Models are Unsupervised Multitask Learners
tags:
  - type/source
  - domain/ai
  - domain/nlp
  - domain/machine-learning
created: '2026-07-20'
updated: '2026-07-20'
lifecycle: active
verification: verified
artifacts:
  - 'raw/059_GPT-1 & GPT-2 Autoregressive Pretraining and Transfer Learning.ko.md'
  - 'raw/059_GPT-1 & GPT-2 Autoregressive Pretraining and Transfer Learning.commentary.ko.md'
evidence:
  - source_id: gpt-2018
    locator: '초록과 §§1–3의 자기회귀 사전 학습·과제별 입력 변환·지도 미세조정, §§4–5와 Tables 2–7의 12개 과제·ablation·zero-shot 분석'
    relation: supports
  - source_id: radford-et-al-2019-gpt2
    locator: '초록과 §§1–3의 WebText·byte-level BPE·1.5B 구조, §§3–4와 Tables 2–8의 zero-shot language modeling·CBT·LAMBADA·Winograd·QA·번역·요약'
    relation: supports
  - source_id: openai-2019-gpt2-release
    locator: '2019-02-14 original post와 2019-05 interim update의 117M·345M staged release, zero-shot·sample failure·policy 설명'
    relation: contextualizes
related:
  - concept.gpt-1-gpt-2
  - concept.자기회귀-생성
  - concept.언어-모델-전이-학습
  - concept.bert
  - source.058
---
# GPT-1과 GPT-2의 전이 방식 변화

059 raw는 GPT-1과 GPT-2가 자기회귀 사전 학습과 전이 학습으로 현대 생성 LLM의 토대를 만들었다고 설명한다. 큰 방향은 맞지만 두 모델의 적응 방식, zero-shot 성능의 강도, 구조 세부, ‘창발’의 후대 용어와 단계적 공개의 결말을 한 서사로 합친다. 공개 문서는 [[GPT-1과 GPT-2]]를 **지도 미세조정에서 입력 조건화로 이동한 두 실험**으로 구분한다.

## 공통 기반: causal Transformer

두 모델은 sequence 확률을 다음과 같이 분해한다.

$$
p(x)=\prod_{i=1}^{n}p(x_i\mid x_{<i}).
$$

causal self-attention은 위치 $i$가 앞 위치에만 접근하게 한다. 정답 sequence가 있는 훈련에서는 여러 위치의 next-token loss를 한 번에 계산할 수 있지만, 실제 [[자기회귀 생성]]은 방금 뽑은 token을 다음 조건으로 쓰므로 순차적이다.

흔히 decoder-only Transformer라고 부르지만 GPT-1은 원 Transformer decoder의 encoder–decoder attention을 제거한 causal self-attention stack이다. ‘decoder’라는 이름만으로 번역 encoder의 출력을 받는 구조라고 오해하지 않는다.

## GPT-1: 사전 학습 뒤 지도 미세조정

GPT-1은 약 117M 매개변수, 12층 Transformer와 context 512를 사용했다. Toronto BookCorpus의 7천 권이 넘는 미출간 책에서 언어 모델 목적으로 사전 학습했다. 긴 연속 text가 대화·서사의 먼 의존성을 제공한다는 이유였다.

후속 과제에서는 구조화된 입력을 하나의 token sequence로 바꿨다.

| 과제 | 입력 변환 | 출력 |
|---|---|---|
| 분류 | start–text–extract | 마지막 위치의 class |
| 함의 | start–premise–delimiter–hypothesis–extract | 관계 class |
| 유사도 | 두 문장 순서를 모두 구성해 표현 합산 | 연속/범주 점수 |
| 다지선다 QA | context와 각 answer 후보를 각각 연결 | 후보별 점수 |

지도 목적 $L_2$와 보조 언어 모델 목적 $L_1$을 결합해 전체 모델을 미세조정했다. 입력 형식과 선형 출력층은 과제에 맞췄으므로 ‘아무 과제별 변경도 없었다’고 쓰지 않는다.

자연어 추론·질의응답·의미 유사도·분류의 12개 데이터셋 가운데 9개에서 당시 최고 결과를 유의하게 개선했다. zero-shot 분석도 네 언어 현상을 살폈지만 논문의 주 성과는 표지 자료를 사용한 fine-tuning이었다.

## GPT-2: 언어 모델링 안의 과제

GPT-2는 모델·자료·context를 함께 확대했다.

| 모델 | 층 | hidden size | 매개변수 |
|---|---:|---:|---:|
| GPT-2 small | 12 | 768 | 117M |
| medium | 24 | 1024 | 345M |
| large | 36 | 1280 | 762M/후속 공개 명칭 774M |
| XL | 48 | 1600 | 1542M |

WebText는 Reddit post에서 karma 3 이상을 받은 외부 link를 출발점으로 만든 약 8백만 문서, 40GB text였다. Reddit 자체 text 전체나 무차별 인터넷 crawl과 같지 않다. `reddit.com`과 Wikipedia 문서를 제거하려 했지만 웹 편향·중복·영어 중심 coverage는 남았다.

GPT-2는 byte-level BPE, 1024 token context, pre-normalization에 가까운 layer normalization 배치와 마지막 layer norm을 사용했다. GPT-1 대비 결과를 매개변수 하나만의 효과로 볼 수 없는 이유다.

## zero-shot은 하나의 점수가 아니다

GPT-2 논문은 과제별 fine-tuning 없이 여러 평가를 text continuation으로 바꿨다.

- language modeling: 각 corpus에서 perplexity·bits per byte를 직접 평가했다.
- LAMBADA·CBT·Winograd: 정답 token/후보의 language model probability를 사용했다.
- 번역: 언어쌍 형식을 cue로 주고 greedy decoding했다.
- 요약: article 뒤에 `TL;DR:`를 붙여 continuation을 만들었다.
- 질의응답·독해: 질문 형식과 조건 text에서 답을 생성하거나 평가했다.

일부 language modeling·LAMBADA·CBT·Winograd 결과는 당시 강한 기록을 냈다. 반면 French→English 번역은 일부 기준선을 넘었지만 English→French는 매우 약했고, CNN/Daily Mail 요약은 지도 모델보다 낮았으며 반복·새 사실 문제가 있었다. Natural Questions exact match와 CoQA F1도 지도 시스템보다 훨씬 낮았다.

따라서 ‘번역·요약·질의응답을 zero-shot으로 수행했다’는 것은 해당 출력 형식을 어느 정도 만들었다는 뜻이지 모두 최고 수준으로 해결했다는 뜻이 아니다. 자연어 task description과 여러 demonstration을 일반적으로 따르는 GPT-3 이후 in-context learning도 GPT-2 원 실험에 그대로 소급하지 않는다.

## 규모와 ‘창발’의 범위

GPT-2는 네 model size에서 language modeling과 여러 과제 점수가 대체로 개선되는 경향을 보였다. 이것은 규모 확대의 중요성을 뒷받침했다. 그러나 raw처럼 ‘예상하지 못한 질적 능력이 규모에서 갑자기 출현했다’고 확정하려면 불연속성, 평가 metric, 자료 노출과 모델 크기 효과를 분리해야 한다.

WebText 안에 자연 발생 번역쌍·QA·요약 형식이 있을 수 있다는 것이 논문의 가설이었다. 특정 평가 자료가 사전 학습에 없었더라도 과제 형식 자체를 유사 text에서 학습했을 가능성이 있다. 이를 task를 순수하게 처음 발명해 해결한 것으로 표현하지 않는다.

## 단계적 공개의 실제 경과

2019년 2월 OpenAI는 1.5B 모델의 오용 가능성을 이유로 full weights를 즉시 공개하지 않고 117M 모델과 sampling code를 먼저 공개했다. 5월 345M, 8월 774M을 공개했고, 11월에는 1.5B weights와 code를 공개했다.

이 과정은 synthetic text 오용·탐지·공개 규범 논의를 촉발한 staged release 실험이었다. 초기 보류만 기록해 ‘GPT-2는 공개되지 않았다’고 현재 시제로 남기지 않는다. 실제 위험 감소 효과와 공개 정책의 최적성은 별도 연구 문제다.

## BERT와 다른 축

[[BERT]]의 MLM encoder는 입력 각 위치의 좌우 문맥을 함께 사용해 분류·span·token 표현에 맞는다. GPT의 causal LM은 뒤 token을 보지 않아 next-token 생성 분해와 직접 연결된다. 어느 쪽이 보편적으로 우월한 것이 아니라 입력 표현과 출력 생성의 요구가 다르다.

GPT-1과 BERT는 전체 fine-tuning 인터페이스를 공유하지만 사전 학습 목적과 attention graph가 다르다. GPT-2는 여기에 매개변수를 바꾸지 않고 입력 cue로 과제를 표현하는 경로를 시험했다.

## 검증 정정

- **GPT가 NLP 전이 학습을 단독 발명했다**: ELMo·ULMFiT 등 동시기와 더 이른 언어 모델 전이 연구가 있었다.
- **GPT-1은 과제별 구조·자료가 전혀 필요 없었다**: 표지 자료, 입력 변환과 출력층을 사용했다.
- **GPT-1은 모든 12개 과제에서 최고 성능이었다**: 12개 중 9개에서 유의한 최고 성능 개선을 보고했다.
- **GPT-2는 GPT-1을 단순히 10배 키웠다**: WebText·context·byte-level BPE·layer norm·초기화도 바뀌었다.
- **WebText는 인터넷 전체를 무차별 수집했다**: Reddit의 일정 karma 이상 외부 link에서 만든 약 8백만 문서 집합이다.
- **GPT-2 zero-shot은 번역·요약·QA를 지도 최고 수준으로 해결했다**: 과제별 성능 차이가 크고 다수 결과는 지도 모델보다 낮았다.
- **GPT-2가 현대 few-shot prompting을 이미 확립했다**: 주로 zero-shot cue와 task별 scoring을 사용했고 체계적 few-shot 평가는 GPT-3의 주제다.
- **규모가 불연속적 창발의 유일 원인임을 증명했다**: 자료·계산·context·구조 변경이 함께 있었고 과제별 곡선도 다르다.
- **1.5B 모델은 안전 우려로 끝내 비공개였다**: 2019년 11월 단계적 공개가 완료됐다.
- **next-token 예측은 사실 검증과 명시적 추론을 학습한다**: 자연스러운 연속을 예측하는 목적이며 사실성·추론은 별도 평가가 필요하다.

## 핵심 문장

- GPT-1은 causal Transformer 사전 학습 뒤 표지 과제의 전체 fine-tuning을 실증했다.
- GPT-2는 모델·자료·context를 확대하고 과제별 가중치 갱신 없이 text cue로 여러 수행을 평가했다.
- zero-shot 가능성의 관찰과 지도 최고 성능 달성은 다른 주장이다.
- 초기 full-model 보류는 staged release였고 2019년 안에 1.5B 모델이 공개됐다.

## 출처

- Alec Radford 외, [Improving Language Understanding by Generative Pre-Training](https://cdn.openai.com/research-covers/language-unsupervised/language_understanding_paper.pdf), 2018.
- Alec Radford 외, [Language Models are Unsupervised Multitask Learners](https://cdn.openai.com/better-language-models/language_models_are_unsupervised_multitask_learners.pdf), 2019.
- OpenAI, [Better Language Models and Their Implications](https://openai.com/index/better-language-models/), 2019 original post와 interim updates.
- 프로젝트 보존 자료: `raw/059_GPT-1 & GPT-2 Autoregressive Pretraining and Transfer Learning.ko.md`, `raw/059_GPT-1 & GPT-2 Autoregressive Pretraining and Transfer Learning.commentary.ko.md`.

## 관련 항목

- [[GPT-1과 GPT-2]]
- [[자기회귀 생성]]
- [[언어 모델 전이 학습]]
- [[BERT]]
- [[058_BERT의 마스크드 양방향 사전 학습]]
