---
schema_version: 2
id: source.045
page_type: source
title: Sequence-to-Sequence 학습과 신경 기계 번역
aliases:
  - 045_Sequence-to-Sequence Neural Machine Translation End-to-End Learning Revolution
  - Sequence-to-Sequence Neural Machine Translation End-to-End Learning Revolution
tags:
  - type/source
  - domain/ai
  - domain/nlp
  - domain/machine-learning
created: '2026-07-18'
updated: '2026-07-21'
lifecycle: active
verification: verified
artifacts:
  - 'raw/045_Sequence-to-Sequence Neural Machine Translation End-to-End Learning Revolution.ko.md'
  - 'raw/045_Sequence-to-Sequence Neural Machine Translation End-to-End Learning Revolution.commentary.ko.md'
evidence:
  - source_id: kalchbrenner-blunsom-2013-recurrent-translation
    locator: 'EMNLP 2013, pp. 1700–1709, 특히 초록과 §§1–3의 정렬·구 단위 없는 recurrent continuous translation model'
    relation: contextualizes
  - source_id: sutskever-vinyals-le-2014-seq2seq
    locator: 'NeurIPS 2014, pp. 3104–3112, 특히 초록·§§1–3·5, Tables 1–3과 Figure 3'
    relation: supports
  - source_id: cho-et-al-2014-rnn-encoder-decoder
    locator: 'EMNLP 2014, pp. 1724–1734, 특히 §§2–3의 RNN Encoder–Decoder·GRU와 §4의 SMT 재순위화'
    relation: supports
  - source_id: bahdanau-cho-bengio-2015-attention
    locator: 'arXiv:1409.0473, 초록과 §§1–3·5–6의 고정 벡터 병목·soft alignment·길이별 평가'
    relation: contextualizes
  - source_id: wu-et-al-2016-gnmt
    locator: 'arXiv:1609.08144, 초록과 §§2–5의 8층 LSTM·attention·residual·WordPiece·평가'
    relation: contextualizes
related:
  - concept.sequence-to-sequence
  - concept.인코더-디코더
  - concept.자기회귀-생성
  - concept.신경망-기계-번역
  - source.034
---
# Sequence-to-Sequence 학습과 신경 기계 번역

> [!note] 학습 안내
> **난이도:** 중급<br>
> **선수 지식:** [[순환 신경망]]<br>
> **읽고 나면:** 초기 seq2seq 인코더-디코더의 조건부 생성 흐름을 설명하고, 2014년 실험·어텐션·GNMT와 현대 모델 계보의 범위를 구분할 수 있다.

## 1단계 — 먼저 잡을 핵심

045 raw는 2014년 [[Sequence-to-Sequence 학습|sequence-to-sequence(seq2seq)]]이 복잡한 구 기반 통계 번역 파이프라인을 두 신경망의 종단간 학습으로 대체했다고 설명한다. 핵심 구조와 뒤의 어텐션 전환은 잘 짚지만, 선행 연구·두 2014년 논문의 시스템 역할·훈련 병렬성·구글 제품 전환·현대 LLM 계보를 하나의 직선적 혁명 서사로 압축한다. 공개 문서는 **조건부 생성 인터페이스의 성립**과 **특정 시스템의 실제 실험 범위**를 나누어 검증한다.

### 핵심 문장

- seq2seq는 가변 길이 입력을 조건으로 가변 길이 출력을 생성하는 하나의 미분 가능한 학습 인터페이스를 정착시켰다.
- 2014년의 두 대표 논문은 구조적 통찰을 공유하지만 시스템 역할과 실험 목적이 같지 않다.
- teacher forcing은 정답 이력을 제공할 뿐 순환 신경망의 시간축 의존성을 제거하지 않는다.
- 고정 벡터 병목을 완화한 어텐션과 제품 규모의 GNMT는 초기 모델 뒤에 추가된 별도 기술 단계다.
- 현대 Transformer·LLM과의 연결은 번역·언어 모델·사전학습 계보가 합류하는 과정이지 하나의 직선적 후손 관계가 아니다.

## 2단계 — 작동 원리

### 입력에서 출력까지

인코더는 입력 시퀀스를 내부 상태로 바꾸고, 디코더는 그 상태와 앞서 나온 목표 토큰에 조건화해 다음 토큰을 차례로 생성한다. 종료 토큰이 나오면 멈추므로 입력과 출력의 길이는 같을 필요가 없다.

## 3단계 — 기술과 근거

### 2014년 이전과 두 논문의 서로 다른 역할

신경 번역은 2014년에 무에서 시작하지 않았다. Kalchbrenner·Blunsom의 2013년 recurrent continuous translation model은 명시적 정렬이나 구 단위 없이 문장 번역을 연속 공간에서 모델링했다. 2014년의 중요성은 LSTM·GRU 계열의 강한 순환 구조, 대규모 병렬 자료, 가변 길이 입출력을 다루는 일반 구조와 경쟁력 있는 실험을 결합한 데 있다.

Sutskever·Vinyals·Le는 한 4층 [[장단기 메모리|LSTM]]이 원문을 고정 차원 벡터로 읽고 다른 4층 LSTM이 번역을 생성하게 했다. 반면 Cho 등의 RNN Encoder–Decoder는 reset·update gate를 지닌 새 순환 유닛과 구 쌍 점수를 학습했지만, 대표 EMNLP 2014 실험에서는 그 점수를 기존 구 기반 SMT의 추가 특징으로 사용했다. 둘을 “독립적으로 같은 완전 종단간 번역기를 만들었다”고 합치지 않는다.

### 인코더-디코더와 조건부 확률

초기 [[인코더-디코더]]는 입력 (x)의 마지막 상태를 고정 벡터로 만들고, [[자기회귀 생성|디코더]]가 그 벡터와 이전 목표 토큰에 조건화해 다음 토큰을 생성했다.

$$
p(y\mid x)=\prod_{t=1}^{T}p(y_t\mid y_{<t},x)
$$

이 벡터는 번역 손실에 유용하도록 학습된 상태이지 문장의 완전하고 언어 독립적인 “의미” 사본이 아니다. 단어 정렬·재배열 특징을 명시적 모듈로 분리하지 않아도 되지만, 자료 선택·어휘·구조·최적화·탐색·평가에 관한 인간 설계가 사라지는 것도 아니다.

훈련 때 이전 정답 토큰을 입력하는 관행을 **teacher forcing**이라 부른다. 이는 정답 이력에서 다음 토큰의 최대 가능도를 학습하게 하지만, RNN 은닉 상태 (h_t)가 (h_{t-1})에 의존한다는 사실은 바꾸지 않는다. 그러므로 “teacher forcing 덕분에 RNN 디코더의 모든 목표 단어를 병렬 처리한다”는 raw의 설명은 틀리다. 이 수준의 위치 병렬성은 뒤의 Transformer가 순환을 제거하면서 가능해졌다.

### 2014년 LSTM 실험의 실제 수치

Sutskever 등의 WMT14 영어→프랑스어 실험은 1,200만 문장 쌍, 원문 3억 400만 단어와 번역문 3억 4,800만 단어를 사용했다. 원문 어휘는 16만, 목표 어휘는 8만으로 제한하고 나머지를 UNK로 처리했다. 입력 순서를 뒤집어 원문의 대응 단어와 초기 목표 단어 사이의 평균 의존 거리를 줄인 것이 중요한 훈련 장치였다.

직접 번역한 5개 LSTM 앙상블은 전체 시험 집합에서 BLEU 34.8, 논문이 비교한 구 기반 기준선은 33.3이었다. 기존 SMT가 만든 1000-best 후보를 LSTM으로 재순위화한 결과 36.5는 순수 신경망 번역이 아니라 혼합 경로다. 특정 영어-프랑스어·자료·토큰화·탐색 조건의 결과를 모든 언어쌍에서 즉시 우월했다는 결론으로 일반화하지 않는다.

논문은 원문 역순이 한 설정에서 test perplexity를 5.8에서 4.7로, BLEU를 25.9에서 30.6으로 개선했다고 보고했다. 선택된 자료에서 긴 문장에도 비교적 잘 일반화했다고 분석했으므로 초기 seq2seq가 길이에 따라 반드시 단조롭게 붕괴했다고 단정하지 않는다. 고정 벡터 병목이 실제 설계 제약이었다는 사실과 개별 실험의 길이 분석을 함께 보아야 한다.

### 고정 벡터에서 어텐션으로

Bahdanau·Cho·Bengio는 한 고정 벡터가 원문 전체의 부담을 진다는 가정을 문제 삼고, 디코더의 각 시점에서 인코더 위치별 상태를 가중 합하는 soft alignment를 제안했다. 논문은 2014년 9월 arXiv에 공개되고 ICLR 2015에 발표됐다. 따라서 “2015년에 갑자기 처음 등장했다”보다 공개와 학회 발표 시점을 구분한다.

어텐션은 현재 출력에 필요한 원문 위치에 직접 접근하게 해 병목을 완화했지만 모든 문장·언어에서 품질을 보편적으로 같은 폭만큼 높인다는 보장은 아니다. 가중치도 학습된 연속 신호이지 통계 번역의 이산 정렬과 동일하거나 모델 판단을 완전히 설명하는 표지가 아니다.

### GNMT와 제품 전환의 실제 구성

2016년 Google Neural Machine Translation(GNMT)은 초기 고정 벡터 seq2seq의 단순 배포판이 아니었다. 8층 LSTM 인코더·디코더, 첫 디코더 층과 마지막 인코더 층 사이 어텐션, 잔차 연결, WordPiece, 저정밀 계산, 길이 정규화와 coverage penalty를 포함한 훨씬 깊은 후속 시스템이었다.

논문은 영어↔프랑스어·스페인어와 영어↔중국어의 production phrase-based system을 비교했고, 고립된 단순 문장에 대한 인간 side-by-side 평가에서 평균 번역 오류가 약 60% 감소했다고 보고했다. 이 조건부 결과를 구글의 모든 언어·모든 문서에서 기존 시스템을 한꺼번에 폐기했다거나 2014년 모델 하나가 제품 성능을 곧바로 만들었다는 주장으로 확대하지 않는다.

## 검증과 한계

### 구 기반 SMT와 ‘종단간’의 경계

[[구 기반 통계적 기계 번역]]은 언어학자가 모든 구와 재배열을 손으로 작성한 규칙 시스템이 아니었다. 병렬 자료의 단어 정렬에서 일관된 문자열 구를 추출하고, 구 번역 확률·어휘 가중치·언어 모델·재배열/왜곡 특징을 로그선형 점수로 결합했다. 특징 선택과 시스템 결합에는 공학이 필요했지만 번역 대응과 점수 상당 부분은 데이터에서 추정했다.

seq2seq의 종단간성은 입력에서 목표 토큰 가능도까지 미분 가능한 하나의 목적을 둔다는 뜻이다. 그것이 전처리·어휘 제한·탐색·후처리·병렬 자료 구축까지 모두 자동 학습한다거나 언어 지식이 무의미하다는 뜻은 아니다. 특히 Cho 등의 2014년 결과처럼 신경 점수를 기존 SMT 안에 넣은 혼합 단계도 있었다.

### 어휘·탐색·훈련과 해석의 한계

- **제한 어휘**: 초기 단어 단위 모델의 UNK는 고유명·전문어에 큰 손실을 만들었다. 후속 복사 기법과 BPE·WordPiece는 별도 해결책이다.
- **순차 계산**: LSTM 인코더와 디코더는 훈련과 추론 모두 시간축 은닉 상태 계산이 순차적이다. 생성 때는 이전 출력까지 필요해 지연이 더 분명하다.
- **노출 조건 차이**: 정답 이전 토큰으로 학습하고 자기 예측으로 생성하면 오류가 누적될 수 있다. scheduled sampling은 한 대응이지 완전한 해결로 합의된 방법이 아니다.
- **탐색**: 매 단계 최댓값을 고르는 greedy decoding과 여러 후보를 유지하는 beam search는 다르다. 2014년 대표 실험은 beam search를 사용했다.
- **해석 가능성**: 신경 표현은 파라미터에 분산돼 추적이 어렵지만, 구 기반 SMT 역시 상호작용하는 수많은 특징과 탐색 오류를 언제나 쉽게 해석할 수 있었던 것은 아니다.

### 현대 모델 계보의 범위

RNN seq2seq → 어텐션 NMT → Transformer 인코더-디코더는 확인 가능한 번역 구조의 계보다. 그러나 자기회귀 언어 모델은 seq2seq보다 오래됐고, GPT의 디코더 전용 사전학습을 “seq2seq 디코더 절반의 직접 확대”로만 설명할 수 없다. BERT도 양방향 seq2seq 인코더의 단순 연장이 아니라 Transformer와 마스킹 사전학습을 결합한다.

Transformer가 NMT와 어텐션 연구에서 중요한 동기를 얻었다는 사실과 현대 LLM의 모든 핵심이 2014년 번역 연구에서 직접 나왔다는 주장을 구분한다. seq2seq의 지속적인 유산은 특정 게이트보다 **입력에 조건화해 가변 길이 출력을 학습하는 인터페이스**와 이를 하나의 손실로 훈련하는 설계에 있다.

### 검증 정정

- **2014년 전에는 가변 길이 신경 번역 해법이 없었다**: 2013년 recurrent continuous translation model 등 선행 연구가 있었다.
- **Sutskever와 Cho 팀이 같은 완전 종단간 번역기를 독립 발명**: Cho 등의 대표 실험은 신경 구 점수를 기존 SMT 특징으로 사용했다.
- **구 기반 SMT의 재배열은 언어학자의 손작성 규칙**: 번역·재배열 점수 상당 부분은 병렬 자료에서 추정됐다.
- **2014년 모델은 LSTM 또는 GRU·양방향 인코더를 같은 방식으로 사용**: Sutskever 모델은 4층 단방향 LSTM과 원문 역순을 사용했고, Cho 모델의 유닛·목적은 달랐다.
- **teacher forcing이면 RNN 목표 위치를 모두 병렬 훈련**: 정답 입력을 주어도 은닉 상태의 순환 의존은 남는다.
- **seq2seq는 매 추론 단계에서 보통 greedy argmax만 사용**: 대표 논문은 beam search를 사용했다.
- **고정 벡터는 문장의 완전한 의미 표현**: 번역 목표에 유용하도록 학습된 유한 상태다.
- **초기 seq2seq는 모든 긴 문장에서 급격히 붕괴**: 병목은 실재하지만 Sutskever 논문은 선택 자료에서 긴 문장 일반화도 보고했다.
- **2016년 구글이 2014년 고정 벡터 모델로 전체 번역기를 교체**: GNMT는 어텐션·잔차·WordPiece를 넣은 8층 후속 시스템이며 언어·평가 조건이 있다.
- **GPT 자기회귀와 BERT 양방향성은 seq2seq가 직접 발명**: 더 오래된 언어 모델과 별도 사전학습 계보가 합류했다.

## 학습 확인

1. 초기 seq2seq 인코더와 디코더는 입력 시퀀스를 가변 길이 출력으로 바꾸기 위해 각각 어떤 역할을 하는가?
2. 2014년 대표 두 논문은 공통 구조를 공유하면서도 번역 시스템 안에서 어떤 서로 다른 역할을 했는가?
3. seq2seq의 종단간 학습이 어휘·탐색·자료 구축과 현대 LLM의 모든 계보를 자동으로 설명하지 않는 이유는 무엇인가?

다음에는 [[Sequence-to-Sequence 학습]]에서 조건부 시퀀스 모형을 정리하고, [[인코더-디코더]]에서 두 구성요소의 역할과 어텐션 이후 변화를 살핀다.

## 출처

- Nal Kalchbrenner·Phil Blunsom, [Recurrent Continuous Translation Models](https://aclanthology.org/D13-1176/), EMNLP 2013, pp. 1700–1709.
- Ilya Sutskever·Oriol Vinyals·Quoc V. Le, [Sequence to Sequence Learning with Neural Networks](https://proceedings.neurips.cc/paper_files/paper/2014/hash/5a18e133cbf9f257297f410bb7eca942-Abstract.html), NeurIPS 2014, pp. 3104–3112.
- Kyunghyun Cho 외, [Learning Phrase Representations using RNN Encoder–Decoder for Statistical Machine Translation](https://aclanthology.org/D14-1179/), EMNLP 2014, pp. 1724–1734.
- Dzmitry Bahdanau·Kyunghyun Cho·Yoshua Bengio, [Neural Machine Translation by Jointly Learning to Align and Translate](https://arxiv.org/abs/1409.0473), 2014년 공개·ICLR 2015.
- Yonghui Wu 외, [Google's Neural Machine Translation System](https://arxiv.org/abs/1609.08144), 2016.
- 프로젝트 번역·검토 출발 자료: [Sequence-to-Sequence Neural Machine Translation End-to-End Learning Revolution](https://mbrenndoerfer.com/writing/sequence-to-sequence-neural-machine-translation)
- 프로젝트 보존 자료: `raw/045_Sequence-to-Sequence Neural Machine Translation End-to-End Learning Revolution.ko.md`, `raw/045_Sequence-to-Sequence Neural Machine Translation End-to-End Learning Revolution.commentary.ko.md`.

## 관련 항목

- [[Sequence-to-Sequence 학습]]
- [[인코더-디코더]]
- [[자기회귀 생성]]
- [[신경망 기계 번역]]
- [[034_구 기반 통계적 기계 번역과 최소 오류율 훈련]]
