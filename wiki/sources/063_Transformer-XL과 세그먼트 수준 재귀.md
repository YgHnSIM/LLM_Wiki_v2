---
schema_version: 2
id: source.063
page_type: source
title: Transformer-XL과 세그먼트 수준 재귀
aliases:
  - 063_Transformer-XL Extending Transformers to Long Sequences
  - 'Transformer-XL: Attentive Language Models beyond a Fixed-Length Context'
  - Transformer-XL 논문
tags:
  - type/source
  - domain/ai
  - domain/nlp
  - domain/machine-learning
created: '2026-07-21'
updated: '2026-07-21'
lifecycle: active
verification: verified
artifacts:
  - 'raw/063_Transformer-XL Extending Transformers to Long Sequences.ko.md'
  - 'raw/063_Transformer-XL Extending Transformers to Long Sequences.commentary.ko.md'
evidence:
  - source_id: dai-et-al-2019-transformer-xl
    locator: 'pp. 2978–2988, 특히 §§3.1–3.3와 Figures 1–2의 fixed-segment baseline·stop-gradient state reuse·relative positional attention, §§4.1–4.5와 Tables 1–9의 language-model results·ablation·RECL·evaluation-speed 조건'
    relation: supports
related:
  - concept.transformer-xl
  - concept.transformer
  - concept.자기회귀-생성
  - concept.xlnet-roberta-albert
  - analysis.훈련-병렬성과-생성-순차성은-다른-축이다
---
# Transformer-XL과 세그먼트 수준 재귀

> [!note] 학습 안내
> **난이도:** 심화<br>
> **선수 지식:** [[Transformer]], [[자기회귀 생성]]<br>
> **읽고 나면:** Transformer-XL의 상태 재사용과 상대 위치 attention이 고정 세그먼트 경계를 넘는 방식, 그리고 그 효과를 보장하는 정확한 실험 조건을 설명할 수 있다.

## 1단계 — 먼저 잡을 핵심

### 고정 세그먼트가 만든 두 문제

2019년 [[Transformer-XL]] 논문은 긴 언어 모델 입력을 서로 독립인 고정 길이 조각으로 훈련할 때 생기는 두 문제를 겨냥했다. 첫째, 이전 조각의 정보가 다음 조각으로 흐르지 않아 학습 가능한 의존 범위가 세그먼트 길이에 묶인다. 둘째, 새 조각의 첫 token은 바로 앞 문맥 없이 예측해야 한다. 저자들은 이를 **문맥 단편화(context fragmentation)**라고 불렀다.

핵심 해법은 이전 세그먼트의 은닉 상태를 다음 세그먼트의 key·value용 memory로 재사용하는 **세그먼트 수준 재귀(segment-level recurrence)**다. 재사용 상태의 시간 순서를 구분하기 위해 attention 점수에는 절대 위치 대신 상대 거리를 넣는다. 이 결합은 세그먼트를 없애는 방식이 아니라, 제한된 길이로 계산하면서 과거 표현을 다음 계산에 넘기는 방식이다.

### 핵심 문장

- memory는 GPU가 허용하는 범위에서 정한 길이 $M$의 과거 은닉 상태다. 처리한 전체 기록을 무제한으로 계속 쌓는 캐시가 아니다.
- 과거 상태에는 stop-gradient가 적용된다. 정보는 순전파로 경계를 넘지만 새 세그먼트의 손실이 과거 세그먼트까지 역전파되지는 않는다.
- 원 논문의 상대 위치 행렬 $R$은 학습 임베딩이 아니라 고정 사인파 인코딩이다. 학습되는 것은 내용·위치 투영과 전역 편향 $u,v$다.
- 현재 길이 $L$의 query가 $M+L$개의 key를 보는 dense attention은 남는다. 상태 재사용은 긴 문맥의 중복 재계산을 줄이지만 attention 자체를 희소화하거나 선형화하지 않는다.

## 2단계 — 작동 원리

### 상태를 다음 세그먼트로 넘기는 흐름

길이 $L$인 현재 세그먼트를 처리할 때 각 층은 다음 순서를 따른다.

1. 직전 세그먼트에서 만든 같은 층의 입력 상태, 즉 $n-1$층 상태 일부를 길이 $M$의 memory로 보존한다.
2. 이 memory에 stop-gradient를 적용하고 현재 세그먼트의 $n-1$층 상태와 이어 붙인다.
3. query는 현재 세그먼트에서만 만들고, key와 value는 `memory + 현재 상태`에서 만든다.
4. causal mask 아래 attention과 feed-forward network를 계산해 현재 세그먼트의 새 상태와 다음 token 확률을 얻는다.
5. 현재 상태를 다음 세그먼트가 사용할 memory로 넘긴다.

이를 개략적으로 쓰면 다음과 같다. $m_{\tau}^{n-1}$은 세그먼트 $\tau$에서 보존한 memory, $h_{\tau}^{n-1}$은 현재 입력 상태, `SG`는 stop-gradient다.

$$
\widetilde h_{\tau}^{n-1}
=\left[\operatorname{SG}\!\left(m_{\tau}^{n-1}\right)\,\circ\,h_{\tau}^{n-1}\right].
$$

따라서 세그먼트 사이 연결은 RNN의 같은 층 상태 갱신과 다르다. 한 경계를 지날 때 의존성이 한 층 아래로 이동하는 **layer shift**가 생기며, $N$층과 길이 $L$ 조건에서 가능한 의존 경로는 대략 $O(NL)$까지 늘어난다. 이는 $M$개의 token을 한 번에 직접 보는 attention 범위와 구분해야 한다.

### 상대 거리로 재사용 상태를 구분한다

각 세그먼트에 같은 절대 위치 `1…L`을 다시 붙이면 과거의 1번 위치와 현재의 1번 위치를 구분하기 어렵다. Transformer-XL은 query 위치 $i$와 key 위치 $j$의 상대 거리 $i-j$를 attention 점수에 넣어 이 충돌을 피한다.

점수는 네 의미 항으로 분해된다.

1. 현재 query와 key 내용의 일치,
2. 현재 query 내용과 상대 위치의 일치,
3. query 위치와 무관한 전역 내용 편향,
4. query 위치와 무관한 전역 위치 편향.

이때 상대 위치 행렬 $R$은 고정 사인파이고, 내용 key와 위치 key에는 서로 다른 투영을 쓴다. 상대 위치를 attention에 넣는 아이디어 자체는 앞선 연구에도 있었으며, 이 논문의 공헌은 상태 재사용과 맞물리는 네 항의 재매개변수화다.

## 3단계 — 기술과 근거

### memory 길이와 계산 비용

논문은 훈련에서 대체로 memory 길이 $M$을 세그먼트 길이와 같게 두고, 평가에서는 더 길게 늘렸다. WikiText-103의 대표 설정은 훈련 attention 길이 384, 평가 길이 1600이었다. 현재 attention이 직접 읽는 과거 범위는 장치 memory와 정해 둔 $M$에 제한되지만, layer shift를 거쳐 표현에 간접 전달되는 의존 경로는 이 직접 범위를 넘을 수 있다.

길이 $L$인 현재 query가 $M+L$개의 key·value를 보는 dense attention의 점수 계산은 층마다 대략 $O(L(M+L))$이다. 논문이 상대 위치 항의 계산을 선형화했다고 말하는 부분은 모든 $(i,j)$ 쌍에 위치 투영을 반복하는 순진한 구현을 고친 것이다. 전체 content attention 행렬이 선형 시간이 됐다는 뜻은 아니다.

### 다섯 언어 모델 자료의 결과

직접 실험은 WikiText-103, enwik8, text8, One Billion Word, Penn Treebank의 word·character 수준 언어 모델링에 한정됐다. 보고된 대표 결과는 WikiText-103 18.3 perplexity, One Billion Word 21.8 perplexity, Penn Treebank 54.5 perplexity, enwik8 0.99 bpc, text8 1.08 bpc다.

One Billion Word는 문장이 섞여 있어 장거리 문서 의존성을 요구하지 않는다. 그 자료에서도 recurrence를 제거하면 perplexity가 25.2에서 27.1로 나빠진 ablation은 문맥 단편화 완화가 짧은 sequence에도 도움을 줄 수 있음을 보인다. 반면 이 논문은 문서 분류·상호참조 해결·질의응답·코드 생성 성능을 직접 평가하지 않았다.

### RECL과 평가 속도의 조건

상대 유효 문맥 길이(Relative Effective Context Length, RECL)는 더 긴 문맥이 짧은 문맥의 최선 모델보다 일정한 상대 이득을 내는 지점을 **같은 parameter budget의 모델 집단 안에서** 비교한 지표다. Table 8의 $r=0.1$ 조건에서 151M Transformer-XL은 900, QRNN은 500, LSTM은 400 word를 기록했다. 128M 비교 집단에서는 Transformer-XL 700, vanilla Transformer 128이었다. 이 조건에서 나온 80%와 450%가 각각 RNN과 vanilla Transformer 대비 수치다. 이는 모델의 고정 입력창이 정확히 그 비율로 커졌다는 뜻이 아니다.

최대 1,874배 속도 향상도 Table 9의 특정 평가 절차에 붙는다. 한 GPU에서 attention 길이 3,800일 때, 매 token마다 긴 sliding segment를 처음부터 다시 계산한 vanilla Transformer baseline과 상태를 재사용한 Transformer-XL의 **per-token 평가 시간**을 비교한 값이다. 훈련 속도나 일반적인 batch serving의 보편적 가속률로 확대할 수 없다.

## 검증과 한계

### raw 설명의 검증 정정

- **캐시는 시퀀스 전체와 함께 계속 커진다**: 실제 memory는 미리 정한 길이 $M$으로 잘라 보존하며 GPU memory가 상한을 정한다.
- **같은 층의 과거 상태를 통해 gradient가 이어진다**: 과거 $n-1$층 상태는 stop-gradient된 채 현재 $n$층의 key·value 문맥으로 들어간다. 순전파 정보와 역전파 경계를 구분해야 한다.
- **상대 위치 임베딩 $R$을 학습한다**: 원 논문의 $R$은 매개변수가 없는 사인파 행렬이다. 투영 행렬과 전역 내용·위치 편향은 학습된다.
- **장문 attention의 이차 비용을 해결했다**: memory 재사용은 sliding-window 재계산을 줄이지만 현재 query와 memory를 잇는 dense attention 비용은 남는다.
- **1,874배 빠르다**: 한 GPU·per-token 평가·긴 sliding-window baseline이라는 조건부 수치다.
- **의존 길이가 80%·450% 길다**: Table 8의 RECL, $r=0.1$, 두 parameter-matched 집단에서 계산된 비교이지 context-window 비율이 아니다.
- **문서 이해·분류·상호참조·질의응답·코드에서 성능을 입증했다**: 직접 실험은 다섯 언어 모델 자료, ablation, RECL, 평가 속도와 정성적 생성이다.
- **상대 위치를 최초로 발명했고 GPT-3·PaLM·LLaMA·RoPE·Longformer·BigBird로 직접 이어졌다**: 논문은 Shaw와 Huang 등의 선행 상대 위치 연구를 인용한다. 후대 방법은 목표 일부를 공유할 수 있지만 이 원 논문만으로 직접 계보를 확정할 수 없다.

### 적용 범위와 남는 한계

stop-gradient는 memory를 저렴하게 재사용하게 하지만 과거 세그먼트에 대한 장거리 credit assignment를 차단한다. 캐시된 과거 표현은 뒤에서 새 사실을 읽어도 다시 계산되거나 수정되지 않는다. 또한 더 큰 $M$은 더 넓은 직접 문맥을 주는 대신 attention 시간과 activation memory를 늘린다.

WikiText-103에서 수천 token의 글을 생성한 결과는 저자들이 사소한 결함이 있는 `relatively coherent` 표본이라고 평가한 정성 근거다. 장문 사실 일관성이나 downstream 문서 이해를 정량적으로 보증하지 않는다. [[XLNet·RoBERTa·ALBERT|XLNet]]이 Transformer-XL backbone을 사용했다는 직접 연결과, 서로 다른 장문 architecture가 모두 Transformer-XL에서 파생됐다는 넓은 계보 주장을 구분해야 한다.

## 학습 확인

### 확인 질문

1. Transformer-XL의 memory는 무엇을 보존하며, 왜 무제한 기록과 다른가?
2. query·key·value와 stop-gradient는 세그먼트 경계에서 각각 어떤 역할을 하는가?
3. RECL 450%와 평가 속도 1,874배를 보편적인 context-window·serving 수치로 읽을 수 없는 이유는 무엇인가?

### 다음 문서

- [[Transformer-XL]] — recurrence·상대 위치·계산 비용을 재사용 가능한 개념 지도로 정리한다.
- [[훈련 병렬성과 생성 순차성은 다른 축이다]] — 순전파 memory 재사용, gradient 경계와 자기회귀 생성의 순차성을 서로 다른 축에서 비교한다.

## 출처

- Zihang Dai 외, [Transformer-XL: Attentive Language Models beyond a Fixed-Length Context](https://aclanthology.org/P19-1285/), ACL 2019, pp. 2978–2988. 특히 §§3.1–3.3, Figures 1–2, Tables 1–9.
- 프로젝트 번역·검토 출발 자료: [Transformer-XL: Extending Transformers to Long Sequences](https://mbrenndoerfer.com/writing/transformer-xl-long-sequences-segment-recurrence)
- 프로젝트 보존 자료: `raw/063_Transformer-XL Extending Transformers to Long Sequences.ko.md`, `raw/063_Transformer-XL Extending Transformers to Long Sequences.commentary.ko.md`.

## 관련 항목

- [[Transformer-XL]]
- [[Transformer]]
- [[자기회귀 생성]]
- [[XLNet·RoBERTa·ALBERT]]
- [[훈련 병렬성과 생성 순차성은 다른 축이다]]
