---
schema_version: 2
id: source.055
page_type: source
title: Transformer와 자기어텐션 기반 시퀀스 모델링
aliases:
  - 055_The Transformer Attention Is All You Need
  - The Transformer Attention Is All You Need
  - Attention Is All You Need
tags:
  - type/source
  - domain/ai
  - domain/nlp
  - domain/machine-learning
created: '2026-07-19'
updated: '2026-07-21'
lifecycle: active
verification: verified
artifacts:
  - 'raw/055_The Transformer Attention Is All You Need.ko.md'
  - 'raw/055_The Transformer Attention Is All You Need.commentary.ko.md'
evidence:
  - source_id: vaswani-et-al-2017-attention
    locator: 'pp. 5998–6008, 특히 §§3–5, Figure 1과 Tables 1–3의 구조·복잡도·번역 성능·훈련 비용'
    relation: supports
  - source_id: gpt-2018
    locator: '§2와 Figure 1의 Transformer decoder 기반 generative pre-training'
    relation: contextualizes
  - source_id: bert-2019
    locator: '§3.1과 Figure 1의 bidirectional Transformer encoder와 masked language model'
    relation: contextualizes
  - source_id: jain-wallace-2019-attention-explanation
    locator: 'NAACL 2019, pp. 3543–3556의 attention explanation 충실성 실험'
    relation: disputes
  - source_id: wiegreffe-pinter-2019-attention-explanation
    locator: 'EMNLP-IJCNLP 2019, pp. 11–20의 설명 정의 비판과 대안 진단'
    relation: contextualizes
related:
  - concept.transformer
  - concept.신경망-기계-번역
  - concept.자기회귀-생성
  - source.054
---
# Transformer와 자기어텐션 기반 시퀀스 모델링

> [!note] 학습 안내
> **난이도:** 중급<br>
> **선수 지식:** [[054_WaveNet과 표본 단위 신경 오디오 생성|WaveNet]]의 인과적 생성과 병렬 훈련 구분<br>
> **읽고 나면:** Transformer가 순환을 어떤 계산으로 바꿨으며 병렬성·제곱 비용·생성 순차성이 왜 함께 성립하는지 설명할 수 있다.

## 1단계 — 먼저 잡을 핵심

원문은 2017년 [[Transformer]]의 self-attention·multi-head·위치 인코딩을 설명하고 현대 LLM까지의 영향을 서술한다. 구조 입문은 유용하지만 원 번역 실험, 2018년 이후 사전학습, 2020년대 대규모 시스템의 성과를 하나의 직접 결과처럼 합친다. 공개 문서는 원 논문이 실제로 비교한 복잡도·BLEU·훈련 비용과 후속 계보를 나누어 검증한다.

### 핵심 문장

- Transformer는 순환 상태 갱신을 self-attention으로 대체한 6층 encoder–decoder 번역 구조로 출발했다.
- 훈련의 위치 병렬성·두 위치 사이 짧은 경로와 길이 제곱 attention 비용은 동시에 성립한다.
- causal mask는 미래 누설을 막지만 자기회귀 생성의 토큰별 순차성을 제거하지 않는다.
- attention 시각화는 내부 가중 패턴이며, 예측 원인에 대한 설명으로 쓰려면 별도 충실성 검증이 필요하다.
- BERT·GPT·현대 LLM은 Transformer의 강한 후속 계보지만 원 번역 실험의 직접 결과와는 구분한다.

## 2단계 — 작동 원리

### 순환을 없앤다는 뜻

원 논문의 ‘attention only’는 encoder와 decoder의 핵심 시퀀스 상호작용에서 recurrence와 convolution을 제거했다는 뜻이다. 전체 모델이 attention 행렬 하나로만 구성됐다는 뜻은 아니다. token embedding, sinusoidal positional encoding, 위치별 두 층 feed-forward network, residual connection, LayerNorm, softmax 출력과 학습 schedule이 함께 있었다.

입력에서는 token embedding에 위치 신호를 더한다. attention이 위치 사이 정보를 섞고 위치별 feed-forward network가 각 위치의 표현을 변환한다. 각 sublayer는 residual connection과 LayerNorm으로 연결되며, decoder의 mask가 미래 위치를 가린다.

## 3단계 — 기술과 근거

### 원 구조의 세부 사양

base 모델은 encoder 6층과 decoder 6층, $d_{model}=512$, 8개 attention head, head당 $d_k=d_v=64$, feed-forward 차원 2048을 사용했다. decoder에는 masked self-attention, encoder–decoder attention, feed-forward의 세 sublayer가 있었다. 원 구조는 $\operatorname{LayerNorm}(x+\operatorname{Sublayer}(x))$인 Post-LN이다.

### self-attention과 Q·K·V

입력 $X$에서 학습 투영으로 $Q=XW_Q$, $K=XW_K$, $V=XW_V$를 만들고 다음을 계산한다.

$$
\operatorname{Attention}(Q,K,V)
=\operatorname{softmax}\left(\frac{QK^{\mathsf T}}{\sqrt{d_k}}\right)V.
$$

$\sqrt{d_k}$ scaling은 큰 차원에서 내적 분산이 커져 softmax가 포화되는 현상을 줄인다. softmax 결과는 위치별 value를 결합하는 가중치다. 이 가중치가 단어 의미의 확정적 확률이나 인간이 부여한 정렬 정답은 아니다.

multi-head attention은 서로 다른 저차원 투영으로 이 연산을 여러 번 수행해 출력을 연결한다. 여러 관계를 학습할 용량을 제공하지만 각 head가 문법·의미·장거리 역할을 하나씩 안정적으로 맡는다고 보장하지 않는다.

### 순서와 mask

순환·합성곱이 없으므로 token 순서는 별도 위치 신호로 제공해야 한다. 원 논문은 학습 위치 임베딩과 사인·코사인 인코딩이 거의 같은 결과를 보였고, 더 긴 길이로 외삽할 가능성을 이유로 고정 사인파를 선택했다. 이는 설계 동기이지 훈련 범위를 넘는 장문 성능 보장이 아니다.

encoder self-attention은 모든 입력 위치를 보고, decoder self-attention은 causal mask로 미래 목표 위치를 막는다. encoder–decoder attention에서는 decoder가 query를, encoder 출력이 key·value를 제공한다. ‘모든 위치를 동시에 본다’는 문구를 encoder의 양방향 문맥과 decoder의 마스킹 문맥에 똑같이 적용하지 않는다.

### 병렬 계산과 전체 비용

원 논문의 Table 1은 층별 연산량뿐 아니라 순차 연산 수와 최대 경로 길이를 비교했다.

| 층 | 층별 계산량 | 순차 연산 수 | 최대 경로 길이 |
| --- | --- | --- | --- |
| self-attention | $O(n^2d)$ | $O(1)$ | $O(1)$ |
| recurrent | $O(nd^2)$ | $O(n)$ | $O(n)$ |
| kernel 폭 $k$ convolution | $O(knd^2)$ | $O(1)$ | $O(\log_k n)$ 또는 $O(n/k)$ |

그러므로 self-attention은 모든 위치의 표현을 행렬 연산으로 병렬 계산하고 먼 위치 사이 경로를 한 층으로 줄인다. 하지만 모든 위치 쌍을 계산하므로 길이 $n$에 대해 제곱 비용이 든다. 원 논문도 $n<d$일 때 recurrent layer보다 빠르다고 조건을 붙였다. 병렬화 가능성과 총 계산량의 보편적 우위를 같은 말로 쓰지 않는다.

RNN의 hidden vector 자체가 시퀀스 길이에 따라 커지는 것도 아니다. BPTT에서 각 시점의 activation을 저장해야 해 메모리가 증가한다. Transformer는 순환 activation 의존을 제거하지만 attention matrix가 $n^2$로 커지는 다른 병목을 갖는다.

### 번역 평가의 실제 수치

최종 NeurIPS 논문의 Transformer-big은 WMT 2014 영어→독일어에서 BLEU 28.4, 영어→프랑스어에서 41.8을 보고했다. base 모델은 8개 P100 GPU에서 12시간, big은 같은 수의 GPU에서 3.5일 훈련됐다. 당시 비교한 recurrent·convolutional 시스템보다 좋은 품질과 낮은 보고 훈련 비용은 중요한 성과다.

그러나 이 수치를 ‘같은 하드웨어에서 모든 LSTM 훈련이 몇 주에서 며칠로 줄었다’는 보편적 비교로 확대하지 않는다. 자료 전처리, batch, parameter 수, hardware와 구현이 다른 연구의 wall-clock 시간을 단순 비교할 수 없다. 원 증거는 정해진 두 번역 과제와 논문이 보고한 계산 조건에 한정된다.

### 훈련 병렬성과 생성 순차성

정답 목표열이 있는 훈련에서는 decoder 입력 전체를 한 칸 이동해 주고 causal mask 아래 모든 위치의 손실을 병렬 계산할 수 있다. 하지만 추론에서는 다음 token을 생성해야 그 token을 조건으로 다음 위치를 계산할 수 있다. 표준 decoder의 [[자기회귀 생성]]은 순차적이다.

이 구분은 [[054_WaveNet과 표본 단위 신경 오디오 생성|WaveNet]]과도 공통된다. WaveNet의 인과 합성곱과 Transformer의 masked self-attention은 구조가 다르지만, 정답 이력이 있는 훈련은 병렬화하고 자기 표본을 되먹이는 생성은 순차적으로 수행한다. Transformer가 ‘시퀀스를 병렬 처리한다’는 문장을 생성 단계 전체에 적용하지 않는다.

### attention은 해석 가능한가

attention weight를 시각화하면 모델 안에서 어느 value가 현재 표현에 크게 섞였는지 볼 수 있다. 그러나 곧바로 예측 원인의 충실한 설명이 되는 것은 아니다. Jain·Wallace는 attention과 gradient 기반 중요도 사이 낮은 상관, 매우 다른 attention 분포가 비슷한 예측을 내는 사례를 보고했다.

Wiegreffe·Pinter는 설명의 정의와 모델 전체 맥락을 고려해야 한다고 반론하고 더 엄격한 진단을 제안했다. 따라서 ‘attention은 설명이다’와 ‘attention은 절대 설명이 아니다’ 중 하나를 무조건 채택하지 않는다. 설명으로 사용하려면 안정성·충실성·개입 효과를 별도로 검증한다.

### 번역 구조에서 사전학습 모델로

원 Transformer는 번역 encoder–decoder다. 2018년 GPT는 decoder 계열과 causal language modeling을, BERT는 encoder 계열과 masked language modeling을 결합했다. 인코더 전용·디코더 전용 모델은 원 구조의 일부를 재사용하지만 cross-attention을 포함한 번역 입출력 전체와 같지 않다.

대규모 사전학습과 현대 LLM에는 별도 발전이 더해졌다. 자료 규모, tokenizer, optimizer·schedule, low precision, 분산 학습, 가속기와 서빙 시스템이 함께 확장을 가능하게 했다. 원 2017년 논문이 수천억 매개변수·문맥 내 학습·추론 능력을 직접 실험하거나 예측한 것으로 소급하지 않는다.

## 검증과 한계

### 검증 정정

- **Transformer는 attention만으로 구성됐다**: embedding·위치 인코딩·MLP·residual·LayerNorm·softmax와 schedule이 함께 있다.
- **LSTM hidden state 크기가 길이에 따라 증가한다**: state 차원은 고정이고 BPTT activation 저장량이 길이에 따라 늘어난다.
- **self-attention은 모든 길이에서 더 효율적이다**: $O(n^2d)$이며 원 논문도 $n<d$ 조건을 명시했다.
- **모든 위치를 항상 서로 볼 수 있다**: decoder self-attention은 미래 위치를 causal mask로 차단한다.
- **사인파 위치 인코딩은 임의 길이에 일반화한다**: 외삽 가능성은 선택 동기였고 장문 성능 보장이 아니다.
- **attention weight가 모델 설명을 제공한다**: 분석 신호는 되지만 충실한 인과 설명 여부는 별도 검증이 필요한 논쟁이다.
- **훈련 병렬화가 생성도 병렬화한다**: 표준 자기회귀 decoder 추론은 앞선 실제 출력에 의존한다.
- **Transformer 하나가 대규모 LLM을 가능하게 했다**: 중요한 구조적 조건이지만 사전학습 목표·자료·최적화·분산 시스템·하드웨어가 함께 필요하다.

## 학습 확인

### 확인 질문

1. Transformer가 순환을 없앴다는 말은 모델의 어떤 상호작용을 바꿨다는 뜻인가?
2. self-attention의 위치 병렬성과 길이 제곱 비용은 어떻게 동시에 성립하는가?
3. 원 번역 논문의 결과가 현대 LLM 전체의 성능을 직접 보장하지 않는 이유는 무엇인가?

### 다음 문서

- [[Transformer]] — 원 논문의 구조를 개념별로 다시 묶어 encoder·decoder·attention 블록을 정리한다.
- [[자기회귀 생성]] — 병렬 훈련 뒤에도 실제 생성이 토큰별 순차 과정으로 남는 이유를 이어서 살핀다.

## 출처

- Ashish Vaswani 외, [Attention Is All You Need](https://proceedings.neurips.cc/paper_files/paper/2017/hash/3f5ee243547dee91fbd053c1c4a845aa-Abstract.html), NeurIPS 2017, pp. 5998–6008.
- Alec Radford 외, [Improving Language Understanding by Generative Pre-Training](https://cdn.openai.com/research-covers/language-unsupervised/language_understanding_paper.pdf), 2018, §2.
- Jacob Devlin 외, [BERT](https://aclanthology.org/N19-1423/), NAACL 2019, §3.1과 Figure 1.
- Sarthak Jain·Byron C. Wallace, [Attention is not Explanation](https://aclanthology.org/N19-1357/), NAACL 2019, pp. 3543–3556.
- Sarah Wiegreffe·Yuval Pinter, [Attention is not not Explanation](https://aclanthology.org/D19-1002/), EMNLP-IJCNLP 2019, pp. 11–20.
- 프로젝트 번역·검토 출발 자료: [The Transformer Attention Is All You Need](https://mbrenndoerfer.com/writing/transformer-attention-is-all-you-need)
- 프로젝트 보존 자료: `raw/055_The Transformer Attention Is All You Need.ko.md`, `raw/055_The Transformer Attention Is All You Need.commentary.ko.md`.

## 관련 항목

- [[Transformer]]
- [[신경망 기계 번역]]
- [[자기회귀 생성]]
- [[054_WaveNet과 표본 단위 신경 오디오 생성]]
