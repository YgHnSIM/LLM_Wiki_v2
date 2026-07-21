---
schema_version: 2
id: concept.transformer-xl
page_type: concept
title: Transformer-XL
aliases:
  - Transformer XL
  - 트랜스포머-XL
  - segment-level recurrent Transformer
tags:
  - type/concept
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
    locator: 'pp. 2980–2986, 특히 §§3.2–3.3와 Figures 1–2의 state reuse·stop-gradient·layer shift·relative positional attention, §§4.2–4.5와 Tables 6–9의 ablation·RECL·평가 속도 조건'
    relation: supports
related:
  - source.064
  - concept.transformer
  - concept.자기회귀-생성
  - concept.xlnet-roberta-albert
  - analysis.훈련-병렬성과-생성-순차성은-다른-축이다
---
# Transformer-XL

> [!note] 학습 안내
> **난이도:** 중급<br>
> **선수 지식:** [[Transformer]], [[자기회귀 생성]]<br>
> **읽고 나면:** Transformer-XL의 세그먼트 수준 재귀와 상대 위치 attention을 설명하고, memory 범위·gradient 경계·dense 계산 비용을 구분할 수 있다.

## 1단계 — 먼저 잡을 핵심

Transformer-XL은 고정 길이 세그먼트로 언어 모델을 훈련하되 이전 세그먼트의 은닉 상태를 다음 세그먼트가 다시 읽게 만든 causal Transformer다. 이름의 `XL`은 extra long을 뜻한다. 핵심은 token을 한 번에 모두 넣는 것이 아니라 **과거 표현을 유한한 memory로 재사용**하는 데 있다.

이 설계는 세그먼트 경계에서 문맥이 끊기는 문제를 줄이고 평가 때 과거 구간을 반복 계산하지 않게 한다. 동시에 memory 길이, stop-gradient, 상대 위치 attention과 dense 계산이라는 조건을 가진다. 따라서 `무제한 context`나 `선형 attention`과 같은 뜻은 아니다.

## 2단계 — 작동 원리

### 입력–memory–출력

현재 세그먼트 길이를 $L$, 보존한 과거 상태 길이를 $M$이라고 하자. 각 층에서 query는 현재 $L$개 위치에서만 만들고, key·value는 과거 memory와 현재 상태를 이어 붙인 $M+L$개 위치에서 만든다. causal mask는 현재의 미래 token을 가리며, 과거 memory는 모두 읽을 수 있게 한다.

과거 상태에는 stop-gradient를 적용한다. 현재 세그먼트는 과거 표현을 순전파 문맥으로 읽지만 현재 loss의 gradient는 그 상태를 만든 이전 세그먼트 계산으로 돌아가지 않는다. 현재 상태는 다시 다음 세그먼트의 memory가 된다.

### 상대 위치 attention

세그먼트마다 절대 위치 번호를 다시 시작하면 과거와 현재의 같은 번호가 충돌한다. Transformer-XL은 query와 key의 상대 거리 $i-j$를 attention 점수에 넣는다. 고정 사인파 행렬 $R$과 학습 가능한 내용·위치 투영, 전역 편향 $u,v$를 조합해 다음 네 신호를 표현한다.

- 내용 query와 내용 key의 일치,
- 내용 query와 상대 위치의 일치,
- 전역 내용 편향,
- 전역 위치 편향.

상대 위치 표현만으로 recurrence가 생기는 것은 아니다. 상태 재사용은 과거 정보를 제공하고, 상대 위치 attention은 그 정보가 현재에서 얼마나 떨어졌는지 일관되게 알려 준다.

## 3단계 — 기술과 근거

### 세 가지 길이를 구분한다

| 길이 | 뜻 | 무엇이 정하는가 |
|---|---|---|
| $L$ | 한 번에 새로 계산하는 현재 세그먼트 | 훈련·평가 설정 |
| $M$ | 직접 key·value로 읽는 보존 memory | 미리 정한 상한과 장치 memory |
| 의존 경로 | 여러 세그먼트를 거쳐 표현이 간접 전달될 수 있는 범위 | 층 수와 recurrence의 layer shift |

논문은 층마다 이전 세그먼트의 $n-1$층 상태가 현재 세그먼트의 $n$층 계산으로 들어가므로 가능한 의존 길이가 층 수 $N$과 세그먼트 길이 $L$에 따라 $O(NL)$로 늘어난다고 설명한다. 이는 한 attention 연산이 직접 읽는 $M+L$ 위치와 같은 값이 아니다.

### 계산 비용과 속도

현재 $L$개 query가 $M+L$개 key를 보는 dense attention은 대략 $O(L(M+L))$의 score를 만든다. Transformer-XL은 긴 sliding window 전체를 매 token마다 다시 계산하던 평가 baseline에 비해 상태 재사용으로 큰 속도 이점을 냈다. 그러나 sparse attention처럼 score 쌍 자체를 구조적으로 줄이지는 않는다.

논문의 최대 1,874배는 한 GPU에서 attention 길이 3,800인 per-token 평가와 특정 vanilla Transformer 재계산 baseline 사이의 값이다. 이 수치는 훈련, batch 크기, hardware와 serving 방식이 달라져도 유지되는 상수가 아니다.

### 실험으로 확인된 범위

Transformer-XL은 다섯 word·character 언어 모델 자료에서 perplexity 또는 bpc를 평가했다. WikiText-103 18.3 perplexity와 enwik8 0.99 bpc가 대표 결과다. recurrence·위치 표현 ablation, RECL, 평가 속도와 정성적 장문 생성도 보고됐다.

RECL은 같은 parameter budget의 모델 집단에서 더 긴 문맥의 상대 이득을 측정한다. $r=0.1$ 조건의 두 비교 집단에서 80%와 450%라는 RNN·vanilla Transformer 대비 수치가 나왔다. 이 값은 memory 설정 $M$이나 최대 입력 token 수를 직접 나타내지 않는다.

## 검증과 한계

### 흔한 오해

- memory는 처리한 전체 token을 보존하지 않고 길이 $M$으로 잘린다.
- stop-gradient 때문에 순전파 문맥은 이어져도 세그먼트를 넘는 gradient 학습은 차단된다.
- 상대 위치 행렬 $R$은 고정 사인파다. `상대 위치의 모든 부분이 학습 임베딩이다`라는 설명은 맞지 않는다.
- 재사용은 중복 계산을 줄이지만 현재 query와 memory 사이의 dense attention은 남는다.
- 논문이 직접 검증한 과제는 언어 모델링이다. 문서 분류·QA·상호참조·코드 성능은 별도 근거가 필요하다.

### 설계의 trade-off와 계보 경계

memory를 늘리면 더 긴 과거를 직접 읽는 대신 계산량과 저장량이 증가한다. 캐시된 과거 상태 자체는 이후 문맥에 맞춰 다시 계산되거나 수정되지 않지만, 현재 query는 그 상태에 동적으로 가중해 읽는다. stop-gradient는 멀리 떨어진 과거 행동에 대한 credit assignment를 제한한다. 또한 정성적으로 긴 글을 생성했다는 사실은 장문 사실 일관성이나 이해 성능의 보증이 아니다.

[[XLNet·RoBERTa·ALBERT|XLNet]]은 Transformer-XL의 recurrence와 상대 위치 표현을 backbone에 사용했으므로 직접 연결된다. 반면 RoPE·Longformer·BigBird 등은 장문 문맥이나 상대 위치라는 문제를 공유해도 기법과 근거가 다르다. `후대 장문 모델이 모두 Transformer-XL에서 파생됐다`는 계보는 이 원 논문만으로 확정할 수 없다.

## 학습 확인

### 확인 질문

1. Transformer-XL의 memory는 token 자체가 아니라 무엇을 보존하는가?
2. stop-gradient와 상대 위치 attention은 각각 세그먼트 경계의 어떤 문제를 해결하는가?
3. 상태 재사용이 dense attention의 이차적 비용을 없애지 않는 이유는 무엇인가?

### 다음 문서

- [[064_Transformer-XL과 세그먼트 수준 재귀]] — 원 논문의 수식·ablation·RECL과 속도 수치의 조건을 확인한다.
- [[XLNet·RoBERTa·ALBERT]] — Transformer-XL backbone이 순열 언어 모델링과 결합되는 직접 후속 사용을 살핀다.

## 출처

- [[064_Transformer-XL과 세그먼트 수준 재귀]]
- Zihang Dai 외, [Transformer-XL: Attentive Language Models beyond a Fixed-Length Context](https://aclanthology.org/P19-1285/), ACL 2019, pp. 2978–2988. 특히 §§3.2–3.3, Figures 1–2, Tables 6–9.
- 프로젝트 보존 자료: `raw/063_Transformer-XL Extending Transformers to Long Sequences.ko.md`, `raw/063_Transformer-XL Extending Transformers to Long Sequences.commentary.ko.md`.

## 관련 항목

- [[064_Transformer-XL과 세그먼트 수준 재귀]]
- [[Transformer]]
- [[자기회귀 생성]]
- [[XLNet·RoBERTa·ALBERT]]
- [[훈련 병렬성과 생성 순차성은 다른 축이다]]
