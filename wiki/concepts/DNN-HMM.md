---
schema_version: 2
id: concept.dnn-hmm
page_type: concept
title: DNN-HMM
aliases:
  - CD-DNN-HMM
  - deep neural network HMM hybrid
  - 심층 신경망-HMM 혼합
tags:
  - type/concept
  - domain/ai
  - domain/machine-learning
  - domain/speech-processing
created: '2026-07-18'
updated: '2026-07-18'
lifecycle: active
verification: verified
artifacts:
  - 'raw/041_Deep Learning for Speech Recognition The 2012 Breakthrough.ko.md'
  - 'raw/041_Deep Learning for Speech Recognition The 2012 Breakthrough.commentary.ko.md'
evidence:
  - source_id: hinton-et-al-2012-dnn-acoustic-modeling
    locator: 'pp. 82–97의 DNN posterior·HMM likelihood 변환·사전학습·미세조정·네 연구팀 대규모 음성 실험'
    relation: supports
  - source_id: dahl-et-al-2012-context-dependent-dnn-hmm
    locator: 'pp. 30–42의 senone 출력·상태 사전확률·강제 정렬·CD-DNN-HMM 학습 및 business search 평가'
    relation: supports
  - source_id: seide-li-yu-2011-conversational-cd-dnn-hmm
    locator: 'pp. 437–440의 9,000개 이상 묶인 triphone 상태와 Switchboard·RT03S 평가'
    relation: supports
related:
  - source.041
  - concept.자동-음성-인식
  - concept.은닉-마르코프-모델
  - concept.단어-오류율
---
# DNN-HMM

DNN-HMM은 심층 신경망(deep neural network, DNN)을 [[은닉 마르코프 모델]] 디코더와 결합한 [[자동 음성 인식]] 혼합 구조다. DNN이 음향 프레임에서 HMM 상태의 사후확률을 추정하고, HMM은 상태 전이·발음 사전·언어 모델과 함께 단어열을 탐색한다.

## GMM을 교체한 음향 모델

전통적 GMM-HMM에서는 GMM이 각 상태의 음향 특징 가능도를 나타냈다. DNN-HMM은 GMM을 깊은 판별망으로 교체했다. 따라서 초기 심층 음성 인식을 “신경망이 HMM을 폐기했다”고 설명하면 구성요소의 역할을 잘못 짚는다.

DNN의 출력은 보통 senone이라 불리는 묶인 문맥 의존 triphone 상태였다. 훈련 라벨은 기존 시스템의 강제 정렬에서 얻었고, 결정 트리로 상태를 묶어 출력 수를 관리했다. 사후확률은 상태 사전확률로 나누어 디코더가 사용할 가능도 비례 점수로 바꿨다.

## 학습 절차

초기 시스템은 RBM을 이용한 층별 생성 사전학습으로 깊은 망을 초기화한 뒤, 교차 엔트로피와 역전파로 미세조정했다. 더 많은 라벨 자료와 나은 최적화가 가능해지면서 사전학습 없이도 강한 결과를 얻는 경우가 늘었다.

입력은 대개 여러 인접 프레임의 MFCC·filterbank 특징을 이어 붙인 고정 창이었다. 완전 연결 DNN 자체에는 지속적인 순환 상태가 없었으므로 장기 단어 문맥은 별도 언어 모델이 담당했다.

## 성능 해석

2011년 Seide 등의 설정에서는 300시간 이상 Switchboard 자료와 9,000개 이상 묶인 상태를 사용해 RT03S WER를 27.4%에서 18.5%로 낮췄다. Dahl 등의 business search 실험은 기준선에 따라 sentence error를 16.0%·23.2% 상대 감소시켰다.

이 수치는 DNN-HMM이 다양한 대규모 설정에서 강했음을 보여주지만 하나의 공통 시험 결과는 아니다. 자료, 상태 정의, 특징, 훈련량, 언어 모델과 GMM 기준선이 달랐다. 상대 오류 감소와 퍼센트포인트 차이도 구분해야 한다.

## 후속 구조와의 차이

ReLU·dropout을 대어휘 음성에 적용한 대표 실험은 2013년 후속 단계다. CTC·RNN-T·attention·Transformer 기반 ASR은 정렬과 출력 단위를 더 넓게 공동 학습한다. DNN-HMM은 이들보다 모듈식이며 발음 사전과 HMM 상태에 의존한다.

혼합 구조라는 이유로 덜 “심층적”이거나 실패한 과도기였다고 볼 수는 없다. 기존 강한 디코더를 유지하면서 음향 모델만 교체한 전략이 대규모 시스템에서 재현 가능한 개선을 빠르게 만들었다.

## 출처

- Geoffrey Hinton 외, [Deep Neural Networks for Acoustic Modeling in Speech Recognition](https://www.cs.toronto.edu/~hinton/absps/DNN-2012-proof.pdf), 2012, pp. 82–97.
- George E. Dahl 외, [Context-Dependent Pre-Trained Deep Neural Networks for Large-Vocabulary Speech Recognition](https://www.microsoft.com/en-us/research/publication/context-dependent-pre-trained-deep-neural-networks-for-large-vocabulary-speech-recognition/), 2012, pp. 30–42.
- Frank Seide·Gang Li·Dong Yu, [Conversational Speech Transcription Using Context-Dependent Deep Neural Networks](https://www.microsoft.com/en-us/research/wp-content/uploads/2016/02/CD-DNN-HMM-SWB-Interspeech2011-Pub.pdf), 2011, pp. 437–440.
- [[041_심층 신경망 음향 모델과 DNN-HMM 전환]]
- 프로젝트 보존 자료: `raw/041_Deep Learning for Speech Recognition The 2012 Breakthrough.ko.md`, `raw/041_Deep Learning for Speech Recognition The 2012 Breakthrough.commentary.ko.md`.

## 관련 항목

- [[041_심층 신경망 음향 모델과 DNN-HMM 전환]]
- [[자동 음성 인식]]
- [[은닉 마르코프 모델]]
- [[단어 오류율]]
