---
schema_version: 2
id: concept.transformer
page_type: concept
title: Transformer
aliases:
  - 트랜스포머
  - Transformer architecture
  - self-attention Transformer
tags:
  - type/concept
  - domain/ai
  - domain/nlp
  - domain/machine-learning
created: '2026-07-19'
updated: '2026-07-21'
lifecycle: active
verification: verified
artifacts:
  - 'raw/054_The Transformer Attention Is All You Need.ko.md'
  - 'raw/054_The Transformer Attention Is All You Need.commentary.ko.md'
  - 'raw/063_Transformer-XL Extending Transformers to Long Sequences.ko.md'
  - 'raw/063_Transformer-XL Extending Transformers to Long Sequences.commentary.ko.md'
  - 'raw/068_Mixture of Experts Sparse Activation for Scaling Language Models.ko.md'
  - 'raw/068_Mixture of Experts Sparse Activation for Scaling Language Models.commentary.ko.md'
evidence:
  - source_id: vaswani-et-al-2017-attention
    locator: 'pp. 5998–6008, 특히 §§3–5, Figure 1, Tables 1–3의 encoder–decoder·attention·위치 인코딩·복잡도·번역 평가'
    relation: supports
  - source_id: dai-et-al-2019-transformer-xl
    locator: 'pp. 2978–2988, 특히 §§3.1–3.3과 Figures 1–2의 stop-gradient segment recurrence·relative positional attention, §4.5와 Table 9의 evaluation-speed 조건'
    relation: supplements
  - source_id: gpt-2018
    locator: '§2와 Figure 1의 Transformer decoder 기반 generative pre-training·task-aware input transformation'
    relation: contextualizes
  - source_id: bert-2019
    locator: '§3.1과 Figure 1의 bidirectional Transformer encoder와 masked language model 사전학습'
    relation: contextualizes
  - source_id: jain-wallace-2019-attention-explanation
    locator: 'NAACL 2019, pp. 3543–3556의 attention weight·gradient importance 상관과 adversarial attention 실험'
    relation: disputes
  - source_id: wiegreffe-pinter-2019-attention-explanation
    locator: 'EMNLP-IJCNLP 2019, pp. 11–20의 설명 정의 비판과 네 가지 진단·검증 제안'
    relation: contextualizes
  - source_id: lepikhin-et-al-2021-gshard
    locator: 'ICLR 2021, §§2.1–2.2와 Figure 3의 일부 position-wise FFN을 top-2 expert FFN으로 교체한 Transformer MoE'
    relation: supplements
  - source_id: fedus-et-al-2022-switch-transformer
    locator: 'JMLR 23(120), §§2–3과 Figures 1–2의 공유 attention·희소 Switch FFN·top-1 token routing'
    relation: supplements
related:
  - source.054
  - source.063
  - source.068
  - concept.신경망-기계-번역
  - concept.자기회귀-생성
  - concept.잔차-연결
  - concept.layer-normalization
  - concept.transformer-xl
  - concept.전문가-혼합
---
# Transformer

> [!note] 학습 안내
> **난이도:** 중급<br>
> **선수 지식:** [[신경망 기계 번역]], [[잔차 연결]]<br>
> **읽고 나면:** Transformer 블록에서 attention·위치 표현·MLP·정규화가 맡는 역할과 병렬성의 조건을 설명할 수 있다.

## 1단계 — 먼저 잡을 핵심

[[Transformer]]는 순환 상태 갱신과 시간 합성곱 대신 attention을 핵심 시퀀스 상호작용으로 사용하는 신경망 구조다. 2017년 「Attention Is All You Need」는 6층 encoder–decoder 번역 모델에서 scaled dot-product attention, multi-head attention, 위치 인코딩, 위치별 feed-forward network, 잔차 연결과 Layer Normalization을 하나의 블록으로 결합했다.

## 2단계 — 작동 원리

### 입력에서 출력 표현까지

입력 token에 위치 정보를 더한 뒤 attention으로 위치 사이 정보를 섞는다. 이어 같은 feed-forward network를 각 위치에 적용하고, sublayer마다 residual connection과 Layer Normalization으로 표현을 이어 간다. 번역 decoder는 미래 token을 가리면서 encoder 출력도 별도의 attention으로 참고한다.

## 3단계 — 기술과 근거

### 세 종류의 attention

scaled dot-product attention은 query와 key의 내적을 $\sqrt{d_k}$로 나눠 softmax한 뒤 value를 가중합한다.

$$
\operatorname{Attention}(Q,K,V)=
\operatorname{softmax}\left(\frac{QK^{\mathsf T}}{\sqrt{d_k}}\right)V.
$$

원 encoder–decoder에는 같은 식이 세 역할로 쓰인다.

- **encoder self-attention**: 입력 위치들이 같은 입력의 다른 위치를 참고한다.
- **masked decoder self-attention**: 목표 위치가 미래 목표 토큰을 보지 못하도록 causal mask를 적용한다.
- **encoder–decoder attention**: decoder가 query를 만들고 encoder 출력이 key와 value가 돼 원문의 관련 위치를 참고한다.

self-attention이 모든 위치의 정보를 한 번에 섞는다는 말은 순서가 사라진다는 뜻이 아니다. token embedding에 위치 인코딩을 더하고, decoder에는 미래 누설을 막는 mask를 둔다.

### multi-head와 위치별 MLP

base 모델은 $d_{model}=512$를 8개 head의 64차원 query·key·value 투영으로 나눠 attention을 병렬 계산했다. head 출력을 이어 붙이고 다시 512차원으로 투영한다. 여러 표현 부분공간에서 관계를 학습할 기회를 주지만, 각 head가 문법·의미 같은 해석 가능한 역할 하나씩을 안정적으로 맡는다는 보장은 없다.

각 층의 feed-forward network는 모든 token에 같은 두 층 MLP를 독립 적용한다. base 모델에서는 512차원을 2048차원으로 넓혀 ReLU를 적용한 뒤 다시 512차원으로 줄였다. attention이 위치 사이 정보를 섞고 MLP가 각 위치의 channel 표현을 변환한다.

### 희소 MoE는 attention이 아니라 일부 FFN을 바꾼다

[[068_전문가 혼합과 희소 활성 스케일링]]의 GShard와 Switch Transformer는 보통 self-attention을 여러 expert로 대체하지 않았다. 일부 위치별 FFN sublayer를 여러 expert FFN과 token router로 바꾸고, GShard는 top-2, Switch는 top-1 expert만 실행했다. Attention·embedding·normalization 같은 공유 경로는 계속 계산된다.

따라서 [[전문가 혼합]]을 Transformer 전체가 여러 독립 모델로 갈라지는 ensemble로 이해하지 않는다. 희소화되는 경로, 공유되는 경로와 layer별 routing을 구분해야 total parameters와 token당 active compute를 비교할 수 있다.

### 위치 인코딩

원 논문은 학습 위치 임베딩과 고정 사인·코사인 인코딩이 비슷한 결과를 보였다고 보고하고, 더 긴 길이로 외삽할 가능성을 이유로 사인파 방식을 선택했다. $pos+k$의 인코딩을 $pos$ 인코딩의 선형 변환으로 표현할 수 있다는 구조적 성질은 상대 오프셋 학습에 도움을 줄 수 있다.

그러나 이는 훈련 때보다 훨씬 긴 시퀀스에서 정확도가 유지된다는 보장이 아니다. 위치 표현, attention 패턴, 훈련 길이 분포와 과제 난도가 함께 장문 일반화를 결정한다. 현대 모델의 learned absolute position, relative bias, rotary encoding도 원 사인파 방식과 구분한다.

### 원 블록은 Post-LN이었다

각 sublayer 출력은 다음처럼 구성됐다.

$$
y=\operatorname{LayerNorm}(x+\operatorname{Sublayer}(x)).
$$

즉 residual addition 뒤 [[Layer Normalization]]을 적용한 Post-LN이다. 오늘날 많은 대규모 모델이 사용하는 Pre-LN은 LayerNorm을 sublayer 입력 앞으로 옮긴 후속 변형이다. [[잔차 연결]]이 있다는 공통점과 정규화 위치가 만드는 최적화 경로 차이를 함께 본다.

### 병렬성·경로 길이·제곱 비용

원 논문의 층별 비교에서 self-attention은 $O(n^2d)$ 연산, $O(1)$ 순차 연산, 최대 경로 길이 $O(1)$을 갖는다. recurrent layer는 $O(nd^2)$ 연산, $O(n)$ 순차 연산과 경로 길이를 갖는다. 따라서 시퀀스 길이 $n$이 표현 차원 $d$보다 작을 때 self-attention의 계산 장점이 특히 분명하고, 먼 두 위치 사이 정보 경로도 짧다.

반대로 $n$이 매우 커지면 모든 위치 쌍의 점수와 $n\times n$ 행렬이 병목이 된다. ‘병렬화 가능’은 총연산량이 항상 작다는 뜻이 아니다. FlashAttention은 정확한 attention의 메모리 이동을 개선하고, sparse·linear attention은 다른 구조적 trade-off를 택하는 후속 연구다.

### 세그먼트 내부 병렬성과 세그먼트 사이 상태 재사용

[[Transformer-XL]]은 고정 길이 segment를 독립 처리할 때 생기는 context fragmentation을 줄이기 위해 이전 segment의 각 layer hidden state를 길이 $M$의 memory로 보존한다. 현재 segment의 query는 현재 hidden state뿐 아니라 stop-gradient가 적용된 이전 segment memory에도 attend한다. 따라서 현재 segment 안 위치들은 attention으로 병렬 계산할 수 있지만, 다음 segment의 forward 계산은 이전 segment memory가 준비된 뒤 시작된다.

이 recurrence는 RNN식 token-by-token state update와 다르고, gradient가 이전 segment로 이어지는 full backpropagation through time도 아니다. 또한 길이 $L$의 query가 memory와 현재 segment를 합친 $M+L$개의 key·value를 보는 dense attention이므로, 더 긴 문맥을 재사용한다는 사실이 attention의 길이 비용을 없애지는 않는다.

### 번역 실험의 실제 범위

원 논문의 Transformer-big은 WMT 2014 영어→독일어에서 BLEU 28.4, 영어→프랑스어에서 41.8을 보고했다. base 모델은 8개 NVIDIA P100 GPU에서 12시간, big 모델은 3.5일 훈련됐다. 이는 당시 비교 시스템보다 품질·훈련 비용이 좋았다는 근거지만, 모든 길이·과제·하드웨어에서 RNN보다 항상 빠르다는 보편 법칙은 아니다.

원 encoder–decoder는 번역을 위한 조건부 생성 모델이다. encoder 표현은 병렬 계산할 수 있고, 정답 목표열을 아는 훈련에서는 decoder 위치도 causal mask 아래 병렬 계산할 수 있다. 하지만 [[자기회귀 생성]]에서는 이전에 실제로 생성한 token이 다음 조건이므로 출력은 순차적이다.

### BERT·GPT와의 후속 연결

GPT는 masked self-attention decoder 계열을 단일 token stream의 다음 token 사전학습에 사용했고, BERT는 encoder 계열을 masked language modeling에 사용했다. 둘은 Transformer 블록을 직접 재사용하지만 원 번역 모델의 encoder–decoder와 같은 입출력 구조나 학습 목적은 아니다.

대규모 언어 모델의 성립에는 이 블록 외에도 서브워드 토큰화, 대규모 사전학습 자료, optimizer·schedule, 저정밀 계산, 데이터·텐서·파이프라인 병렬화와 하드웨어가 필요했다. Transformer가 확장의 중요한 구조적 조건이었다는 사실과 현대 능력의 단일 원인이었다는 주장을 구분한다.

## 검증과 한계

### attention weight는 설명인가

attention matrix는 어느 value가 현재 표현에 얼마나 섞였는지를 보여 주므로 분석할 수 있는 내부 신호다. 그러나 그 가중치가 예측에 대한 충실한 인과 설명과 자동으로 같아지지는 않는다. Jain·Wallace는 여러 NLP 모델에서 attention과 gradient 기반 중요도의 상관이 낮고 다른 attention 분포가 비슷한 예측을 만들 수 있음을 보였다.

Wiegreffe·Pinter는 ‘설명’의 정의와 모델 전체를 고려해야 한다고 반론하고, uniform baseline·seed variance·frozen attention·adversarial training 같은 진단을 제안했다. 따라서 attention은 절대 설명이 아니라고 닫기보다, 단순 시각화를 넘어 충실성·안정성·개입 효과를 검증해야 하는 논쟁적 도구로 기록한다.

## 학습 확인

### 확인 질문

1. Transformer 블록에서 attention과 위치별 MLP는 각각 어떤 정보를 변환하는가?
2. encoder와 decoder에서 같은 attention 식이 맡는 세 역할은 어떻게 다른가?
3. 위치 병렬성이 총계산량의 보편적 우위나 attention weight의 인과 설명을 보장하지 않는 이유는 무엇인가?

### 다음 문서

- [[BERT]] — Transformer encoder를 양방향 사전 학습 표현으로 사용하는 경로를 살핀다.
- [[GPT-1과 GPT-2]] — causal Transformer가 다음 token 사전 학습과 생성에 쓰이는 경로를 비교한다.

## 출처

- [[054_Transformer와 자기어텐션 기반 시퀀스 모델링]]
- [[063_Transformer-XL과 세그먼트 수준 재귀]]
- [[068_전문가 혼합과 희소 활성 스케일링]]
- Ashish Vaswani 외, [Attention Is All You Need](https://proceedings.neurips.cc/paper_files/paper/2017/hash/3f5ee243547dee91fbd053c1c4a845aa-Abstract.html), NeurIPS 2017, pp. 5998–6008.
- Zihang Dai 외, [Transformer-XL: Attentive Language Models beyond a Fixed-Length Context](https://aclanthology.org/P19-1285/), ACL 2019, pp. 2978–2988.
- Alec Radford 외, [Improving Language Understanding by Generative Pre-Training](https://cdn.openai.com/research-covers/language-unsupervised/language_understanding_paper.pdf), 2018, §2.
- Jacob Devlin 외, [BERT](https://aclanthology.org/N19-1423/), NAACL 2019, §3.1.
- Sarthak Jain·Byron C. Wallace, [Attention is not Explanation](https://aclanthology.org/N19-1357/), NAACL 2019, pp. 3543–3556.
- Sarah Wiegreffe·Yuval Pinter, [Attention is not not Explanation](https://aclanthology.org/D19-1002/), EMNLP-IJCNLP 2019, pp. 11–20.
- Dmitry Lepikhin 외, [GShard](https://openreview.net/forum?id=qrwe7XHTmYb), ICLR 2021, §§2.1–2.2.
- William Fedus·Barret Zoph·Noam Shazeer, [Switch Transformers](https://www.jmlr.org/papers/v23/21-0998.html), *JMLR* 23(120), 2022, §§2–3.

## 관련 항목

- [[054_Transformer와 자기어텐션 기반 시퀀스 모델링]]
- [[063_Transformer-XL과 세그먼트 수준 재귀]]
- [[068_전문가 혼합과 희소 활성 스케일링]]
- [[신경망 기계 번역]]
- [[자기회귀 생성]]
- [[잔차 연결]]
- [[Layer Normalization]]
- [[Transformer-XL]]
- [[전문가 혼합]]
