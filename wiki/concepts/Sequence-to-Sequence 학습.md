---
schema_version: 2
id: concept.sequence-to-sequence
page_type: concept
title: Sequence-to-Sequence 학습
aliases: [Sequence-to-Sequence, seq2seq, 시퀀스-투-시퀀스]
tags:
  - type/concept
  - domain/ai
  - domain/nlp
  - domain/machine-learning
created: '2026-07-18'
updated: '2026-07-18'
lifecycle: active
verification: verified
artifacts:
  - 'raw/045_Sequence-to-Sequence Neural Machine Translation End-to-End Learning Revolution.ko.md'
  - 'raw/045_Sequence-to-Sequence Neural Machine Translation End-to-End Learning Revolution.commentary.ko.md'
evidence:
  - source_id: sutskever-vinyals-le-2014-seq2seq
    locator: '초록과 §§1–3, equations (1)–(2), Tables 1–3, pp. 3104–3110'
    relation: supports
  - source_id: cho-et-al-2014-rnn-encoder-decoder
    locator: '§§2–4, 특히 conditional probability 구조와 SMT 구 점수 실험, pp. 1724–1731'
    relation: contextualizes
  - source_id: bahdanau-cho-bengio-2015-attention
    locator: '초록과 §§1–3의 고정 길이 벡터 가정·soft alignment'
    relation: contextualizes
related:
  - source.045
  - concept.인코더-디코더
  - concept.자기회귀-생성
  - concept.신경망-기계-번역
---
# Sequence-to-Sequence 학습

[[Sequence-to-Sequence 학습]](seq2seq)은 입력 시퀀스에 조건화해 길이가 다를 수 있는 출력 시퀀스의 확률을 학습하는 틀이다. 2014년 [[신경망 기계 번역]] 연구에서 널리 알려졌지만 번역이라는 특정 과제나 LSTM이라는 특정 셀과 동일한 말은 아니다.

## 조건부 시퀀스 모형

목표 시퀀스 (y=(y_1,\ldots,y_T))의 확률은 연쇄 법칙으로 다음처럼 분해한다.

$$
p(y\mid x)=\prod_{t=1}^{T}p(y_t\mid y_{<t},x)
$$

초기 구현은 한 [[장단기 메모리|LSTM]]이 입력을 고정 차원 상태로 부호화하고 다른 LSTM이 그 상태를 받아 출력을 순차적으로 생성했다. 출력 길이는 종료 토큰을 생성할 때 결정되므로 입력과 같을 필요가 없다.

## 성과와 설계의 범위

Sutskever 등의 대표 실험은 4층 LSTM, 원문 순서 역전, 제한 어휘, beam search를 사용해 WMT14 영어→프랑스어에서 경쟁력 있는 BLEU를 기록했다. Cho 등의 RNN Encoder–Decoder는 새 게이트 유닛과 조건부 구 표현을 제안했지만 대표 실험에서는 기존 SMT에 신경 점수를 추가했다. “seq2seq”라는 공통 이름 아래 서로 다른 시스템 역할을 구분한다.

종단간 학습은 입력에서 목표 토큰 손실까지 매개변수를 공동 최적화한다는 뜻이다. 말뭉치 구축, 토큰화, 어휘, 구조, 탐색과 평가까지 인간의 선택이 없어진다는 뜻은 아니다.

## 고정 벡터 이후

초기 고정 벡터는 입력 전체에 대한 단일 접근점이었다. Bahdanau 등의 어텐션은 출력 시점마다 입력 위치별 상태의 가중 조합을 만들어 이 병목을 완화했다. 뒤의 Transformer 인코더-디코더도 seq2seq 조건부 생성 틀을 유지하지만 순환 상태 대신 self-attention과 위치 표현을 쓴다.

번역에서 Transformer로 이어지는 구조적 계보는 분명하지만, 자기회귀 언어 모델·GPT·BERT의 모든 발상을 seq2seq가 발명했다고 보지 않는다.

## 출처

- [[045_Sequence-to-Sequence 학습과 신경 기계 번역]]
- Ilya Sutskever·Oriol Vinyals·Quoc V. Le, [Sequence to Sequence Learning with Neural Networks](https://proceedings.neurips.cc/paper_files/paper/2014/hash/5a18e133cbf9f257297f410bb7eca942-Abstract.html), 2014.
- Kyunghyun Cho 외, [Learning Phrase Representations using RNN Encoder–Decoder](https://aclanthology.org/D14-1179/), 2014.
- Dzmitry Bahdanau·Kyunghyun Cho·Yoshua Bengio, [Neural Machine Translation by Jointly Learning to Align and Translate](https://arxiv.org/abs/1409.0473), 2014/2015.

## 관련 항목

- [[045_Sequence-to-Sequence 학습과 신경 기계 번역]]
- [[인코더-디코더]]
- [[자기회귀 생성]]
- [[신경망 기계 번역]]
