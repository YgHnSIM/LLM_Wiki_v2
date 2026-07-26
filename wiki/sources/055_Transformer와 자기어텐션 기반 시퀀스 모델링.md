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
updated: '2026-07-23'
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
  - concept.어텐션-메커니즘
  - concept.소프트맥스
  - concept.잔차-연결
  - concept.신경망-기계-번역
  - concept.자기회귀-생성
  - source.047
  - source.054
---
# Transformer와 자기어텐션 기반 시퀀스 모델링

> [!note] 학습 안내
> **난이도:** 중급<br>
> **선수 지식:** [[어텐션 메커니즘]]의 Q·K·V와 mask, [[잔차 연결]]의 residual block<br>
> **읽고 나면:** 2017년 원 논문이 순환을 무엇으로 바꿨는지, scaled dot-product attention을 어떤 shape로 계산했는지, 훈련 병렬성·제곱 비용·생성 순차성이 왜 동시에 성립하는지 원자료 범위에서 설명할 수 있다.

## 1단계 — 먼저 잡을 핵심

### 원자료가 제기한 문제

2017년 「Attention Is All You Need」은 기계 번역의 encoder–decoder 구조에서 순환과 합성곱을 핵심 시퀀스 상호작용으로 사용하지 않고, stacked self-attention과 위치별 fully connected layer만으로 입력·출력 표현을 계산할 수 있는가를 물었다. 당시 RNN 계열은 위치 $t$의 상태가 $t-1$ 상태에 의존해 한 시퀀스 안의 훈련 계산을 순차적으로 진행해야 했다.

논문은 Transformer가 각 위치 쌍을 self-attention으로 직접 연결해 더 많은 위치 병렬성을 얻고, 두 번역 과제에서 품질과 보고된 훈련 비용을 경쟁 시스템과 비교했다. 이는 현대 LLM 전체의 성능을 실험한 논문이 아니라, 6층 encoder–decoder 번역 모델의 구조·복잡도·실험 결과를 다룬 2017년 연구다.

### 핵심 문장

- Transformer는 순환 상태 갱신을 self-attention과 위치별 MLP로 바꾼 6층 encoder–decoder 번역 구조로 출발했다.
- 훈련의 위치 병렬성·두 위치 사이 짧은 경로와 길이 제곱 attention 비용은 동시에 성립한다.
- causal mask는 미래 누설을 막지만 자기회귀 생성의 token별 순차성을 제거하지 않는다.
- attention 시각화는 내부 가중 패턴이며, 예측 원인에 대한 설명으로 쓰려면 별도 충실성 검증이 필요하다.
- BERT·GPT·현대 LLM은 Transformer의 강한 후속 계보지만 원 번역 실험의 직접 결과와는 구분한다.

### 먼저 알아야 할 기초 개념

- **encoder**는 입력 token열을 위치별 연속 표현으로 바꾸고, **decoder**는 이 표현을 조건으로 출력 token을 한 개씩 생성한다.
- **self-attention**은 같은 시퀀스 안 위치들이 value를 가중 합하는 연산이다.
- **mask**는 decoder 위치가 미래 정답을 보지 못하게 softmax 전 점수를 막는 행렬이다.
- **position-wise FFN**은 위치 사이를 섞지 않고 각 위치 벡터에 같은 두 층 MLP를 적용한다.
- **teacher forcing**은 훈련 때 정답 이전 token을 decoder 입력으로 제공하는 방식이다. 그래서 훈련 병렬성과 실제 생성의 순차성을 구분해야 한다.

## 2단계 — 작동 원리

### 순환을 없앤다는 뜻

원 논문의 ‘attention only’는 encoder와 decoder의 핵심 시퀀스 상호작용에서 recurrence와 convolution을 제거했다는 뜻이다. 전체 모델이 attention 행렬 하나로만 구성됐다는 뜻은 아니다. token embedding, sinusoidal positional encoding, 위치별 두 층 FFN, residual connection, LayerNorm, 출력 softmax, dropout과 학습 schedule이 함께 있었다.

입력에서는 token embedding에 위치 신호를 더한다. self-attention이 위치 사이 정보를 섞고, 위치별 FFN이 각 위치의 feature를 비선형으로 변환한다. 각 sublayer는 residual connection과 LayerNorm으로 연결되고, decoder self-attention은 mask로 미래 위치를 가린다.

### 세 위치를 행렬로 계산하는 예

길이 $n=3$, 한 head의 key·value 차원이 $d_k=d_v=2$라고 하자. 세 위치의 입력을 행으로 모아 $X\in\mathbb R^{3\times d_{\mathrm{model}}}$라 쓰면, 학습 행렬로 다음을 만든다.

$$
\begin{aligned}
Q&=XW_Q\in\mathbb R^{3\times2},\\
K&=XW_K\in\mathbb R^{3\times2},\\
V&=XW_V\in\mathbb R^{3\times2}.
\end{aligned}
$$

$QK^{\mathsf T}$는 $3\times3$ 행렬이다. 그 $(i,j)$ 원소는 위치 $i$ query와 위치 $j$ key의 내적 점수다. 행별 softmax 후의 가중치 행렬도 $3\times3$이고, 이를 $V$와 곱하면 각 위치의 새 2차원 표현을 동시에 얻는다. 행렬로 계산한다는 말은 모든 위치 쌍의 점수·가중 합을 한 연산 묶음으로 만들 수 있다는 뜻이지, 모든 위치가 같은 가중치를 쓴다는 뜻은 아니다.

### 훈련 병렬성과 생성 순차성

정답 목표열이 있는 훈련에서는 decoder 입력 전체를 한 칸 이동해 주고 causal mask 아래 모든 위치의 손실을 병렬 계산할 수 있다. 그러나 추론에서는 다음 token을 생성해야 그 token을 조건으로 다음 위치를 계산할 수 있다. 표준 decoder의 [[자기회귀 생성]]은 순차적이다.

이 구분은 [[054_WaveNet과 표본 단위 신경 오디오 생성|WaveNet]]과도 공통된다. WaveNet의 인과 합성곱과 Transformer의 masked self-attention은 구조가 다르지만, 정답 이력이 있는 훈련은 병렬화하고 자기 표본을 되먹이는 생성은 순차적으로 수행한다.

## 3단계 — 기술과 근거

### 원 구조의 세부 사양

base 모델은 encoder 6층과 decoder 6층, $d_{\mathrm{model}}=512$, 8개 attention head, head당 $d_k=d_v=64$, FFN 내부 차원 2048을 사용했다. decoder에는 masked self-attention, encoder–decoder attention, FFN의 세 sublayer가 있었다. 원 구조는 $\operatorname{LayerNorm}(x+\operatorname{Sublayer}(x))$인 Post-LN이다.

encoder self-attention에서는 Q·K·V가 모두 encoder의 이전 층에서 온다. decoder self-attention에서는 Q·K·V가 모두 decoder의 이전 층에서 오지만, future position의 score를 mask한다. encoder–decoder attention에서는 decoder 표현이 Q, encoder 출력이 K와 V가 된다. 같은 attention 식이 세 역할을 하되 입력 출처와 mask 조건이 다르다.

### 핵심 수식: 한 head의 정보 읽기

#### 수식이 답하려는 질문

한 위치가 모든 후보 위치의 value를 어떤 비율로 섞을지 정한다. 비율은 현재 query와 후보 key의 호환성에서 나오며, decoder의 금지된 미래 위치는 그 비율에서 제외한다.

$$
\operatorname{Attention}(Q,K,V)
=\operatorname{softmax}_{\mathrm{row}}
\left(\frac{QK^{\mathsf T}}{\sqrt{d_k}}+M\right)V
$$

원 논문의 식 (1)은 mask를 별도 항으로 적지 않았고, §3.2.3에서 decoder의 불법 연결 score를 softmax 입력에서 $-\infty$로 설정한다고 설명한다. 위 식의 $M$은 그 설명을 한 줄로 나타낸 표기다.

| 항 | shape | 현재 계산에서의 역할 |
| --- | --- | --- |
| $Q$ | $n_q\times d_k$ | 현재 위치들이 찾는 정보 |
| $K$ | $n_k\times d_k$ | 후보의 주소·호환성 표현 |
| $V$ | $n_k\times d_v$ | 실제로 섞을 후보 내용 |
| $QK^{\mathsf T}$ | $n_q\times n_k$ | 모든 query–key 내적 점수 |
| $M$ | $n_q\times n_k$ | 허용되지 않은 연결에 매우 작은 점수 |
| softmax 결과 | $n_q\times n_k$ | 각 query 행의 후보 비율 합이 1 |
| 출력 | $n_q\times d_v$ | value 가중 합 |

$QK^{\mathsf T}$의 한 행은 query 하나가 모든 key에 준 점수다. $\sqrt{d_k}$로 나누는 것은 큰 차원의 내적이 softmax를 포화시켜 기울기가 매우 작아지는 경향을 줄이기 위한 선택이다. 원 논문은 query·key 성분이 독립이고 평균 0·분산 1이면 내적 분산이 $d_k$라는 직관을 제시했다. softmax는 점수를 양수이고 합 1인 가중치로 바꾸며, 마지막 행렬곱은 그 비율로 $V$의 행을 섞는다.

attention 가중치는 내부 value 혼합 비율이다. 어휘 후보의 다음 token 확률도, 인간이 정한 단어 정렬의 정답도, 최종 예측의 충분한 원인도 자동으로 뜻하지 않는다. 두 후보의 모든 중간 수치 계산은 [[어텐션 메커니즘]]에서 확인할 수 있다.

### multi-head, FFN, 위치 표현

multi-head attention은 $d_{\mathrm{model}}$차원 Q·K·V 하나를 그대로 복제하는 것이 아니다. 각 head가 서로 다른 학습 투영으로 $d_k=d_v=64$ 차원 표현을 만들고, 8개 head 출력을 이어 다시 512차원으로 투영한다. 원 논문은 이 방식이 서로 다른 표현 부분공간과 위치에서 정보에 함께 attend할 수 있게 한다고 설명했다. 각 head가 문법·의미·장거리 역할 하나를 안정적으로 맡는다는 보장은 없다.

위치별 FFN은 각 token에 독립·동일하게 적용하는 두 선형 변환과 ReLU다.

$$
\operatorname{FFN}(x)=\max(0,xW_1+b_1)W_2+b_2
$$

attention이 token 사이 정보를 섞는다면 FFN은 한 위치 안의 channel 표현을 바꾼다. ReLU가 없다면 두 선형 변환은 하나의 선형 변환으로 합쳐질 수 있으므로, 중간 비선형성은 두 층 구조가 더 풍부한 변환을 하게 하는 핵심이다.

순환·합성곱이 없으므로 순서는 별도 위치 신호로 넣어야 한다. 원 논문은 다음 고정 사인·코사인 인코딩을 사용했다.

$$
\begin{aligned}
\operatorname{PE}(pos,2i)
&=\sin\left(\frac{pos}{10000^{2i/d_{\mathrm{model}}}}\right),\\
\operatorname{PE}(pos,2i+1)
&=\cos\left(\frac{pos}{10000^{2i/d_{\mathrm{model}}}}\right).
\end{aligned}
$$

$pos$는 위치, $i$는 feature 차원 쌍의 번호다. 원 논문은 $pos+k$의 표현을 $pos$의 선형 함수로 만들 가능성과 훈련 길이보다 긴 입력으로의 외삽 가능성을 동기로 들었다. 실제 장문 성능을 보장한 것은 아니며, 학습된 위치 임베딩도 base와 거의 같은 결과를 보였다고 Table 3에 기록했다.

### 병렬 계산과 전체 비용

원 논문의 Table 1은 층별 연산량뿐 아니라 순차 연산 수와 최대 경로 길이를 비교했다.

| 층 | 층별 계산량 | 순차 연산 수 | 최대 경로 길이 |
| --- | --- | ---: | ---: |
| self-attention | $O(n^2d)$ | $O(1)$ | $O(1)$ |
| recurrent | $O(nd^2)$ | $O(n)$ | $O(n)$ |
| kernel 폭 $k$ convolution | $O(knd^2)$ | $O(1)$ | $O(\log_k n)$ 또는 $O(n/k)$ |

self-attention은 모든 위치의 표현을 행렬 연산으로 병렬 계산하고 먼 위치 사이 경로를 한 층으로 줄인다. 하지만 모든 위치 쌍을 계산하므로 길이 $n$에 대해 제곱 비용이 든다. 원 논문도 $n<d$일 때 recurrent layer보다 빠르다고 조건을 붙였다. RNN의 hidden vector 차원 자체가 길이에 따라 커지는 것도 아니다. BPTT에서 각 시점 activation을 저장해야 해 메모리가 증가한다.

### 번역 평가의 실제 수치

최종 NeurIPS 논문의 Transformer-big은 WMT 2014 영어→독일어에서 BLEU 28.4, 영어→프랑스어에서 BLEU 41.0을 보고했다. base 모델은 8개 P100 GPU에서 12시간, big 모델은 같은 수의 GPU에서 3.5일 훈련됐다. 이는 당시 비교한 recurrent·convolutional 시스템보다 좋은 품질과 낮은 보고 훈련 비용의 근거지만, 자료 전처리·batch·parameter 수·hardware와 구현이 다른 연구의 wall-clock을 모두 일반 비교로 바꾸지는 않는다.

### 번역 구조에서 사전학습 모델로

원 Transformer는 번역 encoder–decoder다. 2018년 GPT는 decoder 계열과 causal language modeling을, BERT는 encoder 계열과 masked language modeling을 결합했다. encoder 전용·decoder 전용 모델은 원 구조의 일부를 재사용하지만 cross-attention을 포함한 번역 입출력 전체와 같지 않다.

대규모 사전학습과 현대 LLM으로 이어지면서 자료 규모, tokenizer, optimizer·schedule, low precision, 분산 학습, 가속기와 서빙 시스템이 더해졌다. 2017년 원 논문이 수천억 매개변수·문맥 내 학습·현대 제품 능력을 직접 실험하거나 예측한 것으로 소급하지 않는다.

### attention은 해석 가능한가

attention weight를 시각화하면 모델 안에서 어떤 value가 현재 표현에 크게 섞였는지 볼 수 있다. 그러나 곧바로 예측 원인의 충실한 설명이 되는 것은 아니다. Jain·Wallace는 attention과 gradient 기반 중요도 사이 낮은 상관, 매우 다른 attention 분포가 비슷한 예측을 내는 사례를 보고했다.

Wiegreffe·Pinter는 설명의 정의와 모델 전체 맥락을 고려해야 한다고 반론하고 더 엄격한 진단을 제안했다. 따라서 ‘attention은 설명이다’와 ‘attention은 절대 설명이 아니다’ 중 하나를 무조건 채택하지 않는다. 설명으로 사용하려면 안정성·충실성·개입 효과를 별도로 검증한다.

## 검증과 한계

### 원문 상태와 수치 정정

보존된 raw 자료는 2017년 Transformer를 현대 LLM까지 이어지는 큰 이야기로 소개하는 2차 해설이다. 원 논문의 직접 근거와 후대의 구조 채택·제품·능력 주장을 같은 실험 결과처럼 읽지 않는다.

기존 위키 일부에 적힌 영어→프랑스어 BLEU 41.8은 최종 NeurIPS 논문의 abstract와 Table 2와 맞지 않는다. 1차 논문이 보고한 Transformer-big 단일 모델 값은 41.0이므로 이 문서는 41.0을 사용한다. 영어→독일어 28.4, base 12시간과 big 3.5일이라는 수치도 같은 논문의 정해진 WMT 2014·8 P100 조건에서만 읽는다.

### 적용 범위와 흔한 오해

- Transformer는 attention만으로 구성되지 않는다. embedding·위치 표현·FFN·residual·LayerNorm·softmax와 학습 설계가 함께 있다.
- self-attention은 모든 길이에서 보편적으로 더 효율적이지 않다. $O(n^2d)$이며 원 논문도 $n<d$ 조건을 명시했다.
- 모든 위치가 항상 서로 볼 수 있는 것은 아니다. decoder self-attention은 causal mask로 미래 위치를 차단한다.
- 사인파 위치 인코딩은 임의 길이에 일반화한다는 보장이 아니라 설계 동기다.
- 훈련 병렬화가 생성도 병렬화한다는 뜻은 아니다. 표준 자기회귀 decoder 추론은 앞선 실제 출력에 의존한다.
- attention weight는 분석 신호가 될 수 있지만, 충실한 인과 설명 여부는 별도 검증이 필요한 논쟁이다.
- Transformer 하나가 대규모 LLM을 가능하게 했다고 단일 원인으로 말할 수 없다. 사전학습 목표·자료·최적화·분산 시스템·하드웨어가 함께 필요했다.

## 학습 확인

### 확인 질문과 답

1. $QK^{\mathsf T}$와 마지막의 value 행렬곱은 각각 무엇을 계산하는가?

   **답:** 앞의 행렬곱은 모든 query–key 쌍의 관련성 점수를 만들고, softmax 뒤의 행렬곱은 그 후보 비율로 value를 섞어 각 query의 새 표현을 만든다.

2. self-attention의 순차 연산 수 $O(1)$과 계산량 $O(n^2d)$는 왜 모순이 아닌가?

   **답:** 위치 쌍을 동시에 행렬 계산할 수 있어 앞 위치를 기다리는 단계는 적지만, 그때 계산해야 하는 위치 쌍 자체는 $n^2$개이기 때문이다.

3. 원 번역 논문의 BLEU 결과가 현대 LLM 전체의 성능을 보장하지 않는 이유는 무엇인가?

   **답:** 원 논문은 특정 WMT 번역 자료·모델 크기·훈련 조건을 평가했다. 후대 LLM에는 다른 사전학습 목표·자료·시스템·입출력 구조가 추가됐다.

### 다음 문서

- [[Transformer]] — 원 논문의 요소를 한 block의 입력·shape·mask·MLP·잔차·출력 확률 흐름으로 다시 조립한다.
- [[자기회귀 생성]] — causal mask 아래의 확률 분해가 실제 decoding에서 왜 순차적으로 남는지 계산 관점에서 이어서 살핀다.

## 출처

- Ashish Vaswani 외, [Attention Is All You Need](https://proceedings.neurips.cc/paper/7181-attention-is-all-you-need.pdf), NeurIPS 2017, pp. 5998–6008, 특히 §§3–6과 Tables 1–3.
- Alec Radford 외, [Improving Language Understanding by Generative Pre-Training](https://cdn.openai.com/research-covers/language-unsupervised/language_understanding_paper.pdf), 2018, §2.
- Jacob Devlin 외, [BERT](https://aclanthology.org/N19-1423/), NAACL 2019, §3.1과 Figure 1.
- Sarthak Jain·Byron C. Wallace, [Attention is not Explanation](https://aclanthology.org/N19-1357/), NAACL 2019, pp. 3543–3556.
- Sarah Wiegreffe·Yuval Pinter, [Attention is not not Explanation](https://aclanthology.org/D19-1002/), EMNLP-IJCNLP 2019, pp. 11–20.
- 프로젝트 번역·검토 출발 자료: [The Transformer Attention Is All You Need](https://mbrenndoerfer.com/writing/transformer-attention-is-all-you-need)
- 프로젝트 보존 자료: raw/055_The Transformer Attention Is All You Need.ko.md, raw/055_The Transformer Attention Is All You Need.commentary.ko.md.

## 관련 항목

- [[Transformer]]
- [[어텐션 메커니즘]]
- [[소프트맥스]]
- [[잔차 연결]]
- [[047_어텐션 메커니즘과 동적 정렬]]
- [[신경망 기계 번역]]
- [[자기회귀 생성]]
- [[054_WaveNet과 표본 단위 신경 오디오 생성]]
