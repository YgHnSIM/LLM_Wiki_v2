---
schema_version: 2
id: concept.gpt-1-gpt-2
page_type: concept
title: GPT-1과 GPT-2
aliases:
  - GPT-1
  - GPT-2
  - Generative Pre-trained Transformer
  - 생성 사전 학습 Transformer
tags:
  - type/concept
  - domain/ai
  - domain/nlp
  - domain/machine-learning
created: '2026-07-20'
updated: '2026-07-21'
lifecycle: active
verification: verified
artifacts:
  - 'raw/058_GPT-1 & GPT-2 Autoregressive Pretraining and Transfer Learning.ko.md'
  - 'raw/058_GPT-1 & GPT-2 Autoregressive Pretraining and Transfer Learning.commentary.ko.md'
  - 'raw/066_GPT-3 and In-Context Learning Emergent Capabilities from Scale.ko.md'
  - 'raw/066_GPT-3 and In-Context Learning Emergent Capabilities from Scale.commentary.ko.md'
evidence:
  - source_id: gpt-2018
    locator: '§§1–3의 117M causal Transformer·BookCorpus·두 단계 학습·input transformations와 §§4–5의 12개 과제 결과'
    relation: supports
  - source_id: radford-et-al-2019-gpt2
    locator: '§§1–3의 WebText·모델 네 크기·byte-level BPE·zero-shot 설정과 §§3–4의 과제별 결과·한계'
    relation: supports
  - source_id: openai-2019-gpt2-release
    locator: '2019년 original post·interim updates의 117M·345M 공개와 zero-shot·release policy 설명'
    relation: contextualizes
  - source_id: brown-et-al-2020-gpt3
    locator: '§§1–3, 특히 §2와 Tables 2.1–2.2의 8개 모델·300B token 학습, zero/one/few-shot 정의와 task별 결과'
    relation: supplements
related:
  - source.058
  - source.066
  - concept.자기회귀-생성
  - concept.언어-모델-전이-학습
  - concept.문맥-내-학습
  - concept.bert
  - concept.transformer
---
# GPT-1과 GPT-2

> [!note] 학습 안내
> **난이도:** 중급<br>
> **선수 지식:** [[Transformer]], [[언어 모델 전이 학습]]<br>
> **읽고 나면:** GPT-1의 지도 미세조정과 GPT-2의 zero-shot 조건화가 causal 사전 학습을 서로 다르게 활용하는 방식을 비교할 수 있다.

## 1단계 — 먼저 잡을 핵심

[[GPT-1과 GPT-2]]는 causal [[Transformer]]를 다음 token 예측으로 사전 학습해 여러 자연어 처리 과제에 적용한 초기 Generative Pre-trained Transformer 모델이다. GPT-1은 지도 미세조정, GPT-2는 규모 확대와 zero-shot text continuation에 초점을 맞췄다.

## 2단계 — 작동 원리

### 사전 학습 뒤 과제를 제시하는 두 방식

두 모델은 앞선 token을 조건으로 다음 token을 예측하도록 먼저 학습한다. GPT-1은 후속 과제를 token sequence와 출력층으로 바꾼 뒤 표지 자료로 전체 모델을 갱신한다. GPT-2는 모델을 갱신하지 않고 cue와 decoding·scoring으로 과제를 continuation 안에 표현한다.

## 3단계 — 기술과 근거

### GPT-1

GPT-1은 12층·약 117M 매개변수·512 token context를 사용했다. BookCorpus에서 자기회귀 언어 모델을 사전 학습한 뒤 자연어 추론·질의응답·유사도·분류의 구조를 delimiter가 있는 token sequence로 바꿔 전체 모델을 미세조정했다.

사전 학습과 지도 미세조정의 목적은 다음처럼 결합됐다.

$$
L_3(\mathcal{C})=L_2(\mathcal{C})+\lambda L_1(\mathcal{C}).
$$

$L_2$는 과제 라벨 목적, $L_1$은 보조 언어 모델 목적이다. 후자는 미세조정 중 일반 표현을 유지하는 regularizer 역할을 했다. 12개 평가 중 9개에서 당시 최고 결과를 유의하게 개선했다.

### GPT-2

GPT-2는 117M·345M·762/774M·1542M 네 크기를 평가했다. 가장 큰 모델은 48층, hidden size 1600, context 1024였다. WebText 약 8백만 문서와 byte-level BPE를 사용했다.

논문의 목표는 fine-tuning보다 language modeling 안에 자연 발생한 task를 zero-shot으로 꺼낼 수 있는지 시험하는 것이었다. task별 cue와 scoring을 사용했지만 모델 가중치는 바꾸지 않았다.

### 전이 인터페이스의 차이

| 모델 | 과제 적응 위치 | 표지 과제 학습 | 대표 출력 |
|---|---|---|---|
| GPT-1 | 입력 delimiter·출력층·전체 가중치 | 있음 | class·후보 점수 |
| GPT-2 | 입력 cue와 decoding/scoring | 없음 | text continuation·후보 probability |

GPT-2가 GPT-1의 지도 fine-tuning을 폐기했다고 일반화할 수는 없다. GPT-2 논문은 zero-shot 가능성을 연구했고 fine-tuning이 후속 과제 성능을 더 높일 것으로 예상했다.

### zero-shot 결과 읽기

language modeling·LAMBADA·CBT·Winograd에서는 강한 결과가 있었다. 반면 translation·summarization·QA·reading comprehension은 task 형식의 출력을 만들었지만 지도 최고 결과와 큰 차이가 났다. 각 평가의 metric·cue·decoding과 절대 성능을 함께 기록해야 한다.

‘zero-shot’은 해당 과제의 표지 training set으로 매개변수를 갱신하지 않았다는 설정이다. 사전 학습 corpus에 유사한 문서나 task 형식이 없었다는 보장은 아니며, 오늘날의 instruction following이나 few-shot prompting과 동일하지 않다.

### GPT-3로 이어진 다음 경계

[[066_GPT-3와 문맥 내 학습]]은 GPT-2의 cue 기반 zero-shot을 instruction과 demonstration을 함께 넣는 [[문맥 내 학습]]으로 확장해 체계적으로 비교했다. 125M부터 175B까지 여덟 모델은 모두 300B token을 처리했고, zero-shot·one-shot·few-shot 어느 조건에서도 가중치를 갱신하지 않았다. 175B는 GPT-2의 1.5B보다 약 117배 크다. Brown 등이 말한 ‘10배’는 GPT-2가 아니라 당시 이전의 가장 큰 비희소 언어 모델과의 비교다.

이 연결은 GPT-3가 GPT-2의 모든 한계를 규모 하나로 해결했다는 뜻이 아니다. Brown 등의 과제별 결과는 크게 달랐고, few-shot도 보통 입력 문맥에 10–100개의 표지 예시를 요구했다. GPT-2의 cue, GPT-3의 demonstration, 후대 instruction tuning을 서로 다른 과제 적응 조건으로 구분해야 한다.

## 검증과 한계

### 생성의 강점과 한계

causal LM은 앞 문맥에서 다음 token을 뽑는 자연스러운 생성 인터페이스를 제공한다. 동시에 현재 위치의 표현은 오른쪽 입력을 보지 못한다. 사실 검증 목적도 없으므로 유창하지만 틀린 continuation을 만들 수 있다.

표준 sampling은 token별 순차 과정이다. 훈련 때 여러 정답 위치를 병렬 계산할 수 있다는 것과 긴 출력의 generation latency를 혼동하지 않는다.

### 공개와 안전

GPT-2 full 1.5B weights는 2019년 2월 즉시 공개되지 않았다. 117M→345M→774M→1.5B 순으로 단계적으로 공개됐다. 이는 합성 text 오용과 탐지 연구를 고려한 공개 실험이었고, 2019년 11월 full release로 끝났다.

## 학습 확인

### 확인 질문

1. GPT-1과 GPT-2가 공유하는 사전 학습 구조와 목적은 무엇인가?
2. GPT-1의 지도 미세조정과 GPT-2의 cue 기반 zero-shot 평가는 가중치 갱신에서 어떻게 다른가?
3. GPT-2가 과제 형식의 출력을 만들었다는 사실이 지도 최고 성능이나 사실성을 보장하지 않는 이유는 무엇인가?

### 다음 문서

- [[대규모 언어 모델]] — 초기 causal Transformer의 규모·자료·학습 경로가 후대 모델에서 어떻게 확장됐는지 살핀다.
- [[문맥 내 학습]] — 가중치를 바꾸지 않고 instruction·demonstration으로 출력 분포를 조건화하는 경계를 살핀다.

## 출처

- [[058_GPT-1과 GPT-2의 전이 방식 변화]]
- Alec Radford 외, [Improving Language Understanding by Generative Pre-Training](https://cdn.openai.com/research-covers/language-unsupervised/language_understanding_paper.pdf), 2018.
- Alec Radford 외, [Language Models are Unsupervised Multitask Learners](https://cdn.openai.com/better-language-models/language_models_are_unsupervised_multitask_learners.pdf), 2019.
- OpenAI, [Better Language Models and Their Implications](https://openai.com/index/better-language-models/), 2019.
- [[066_GPT-3와 문맥 내 학습]]
- Tom B. Brown 외, [Language Models are Few-Shot Learners](https://arxiv.org/abs/2005.14165), NeurIPS 2020, §§1–3.

## 관련 항목

- [[058_GPT-1과 GPT-2의 전이 방식 변화]]
- [[066_GPT-3와 문맥 내 학습]]
- [[자기회귀 생성]]
- [[언어 모델 전이 학습]]
- [[문맥 내 학습]]
- [[BERT]]
- [[Transformer]]
