---
schema_version: 2
id: source.053
page_type: source
title: WaveNet과 표본 단위 신경 오디오 생성
aliases:
  - 053_WaveNet - Neural Audio Generation Revolution
  - WaveNet - Neural Audio Generation Revolution
tags:
  - type/source
  - domain/ai
  - domain/machine-learning
  - domain/speech-processing
created: '2026-07-19'
updated: '2026-07-19'
lifecycle: active
verification: verified
artifacts:
  - 'raw/053_WaveNet - Neural Audio Generation Revolution.ko.md'
  - 'raw/053_WaveNet - Neural Audio Generation Revolution.commentary.ko.md'
evidence:
  - source_id: van-den-oord-et-al-2016-wavenet
    locator: '초록과 §§2–5, Figures 2–5와 Table 1의 자기회귀 파형 분포·팽창 인과 합성곱·조건화·MOS 평가'
    relation: supports
  - source_id: deepmind-2017-wavenet-assistant
    locator: '2017-10-04 공지의 원형 연구 모델과 후속 생산 모델 속도·Assistant 배포 범위'
    relation: supplements
related:
  - concept.wavenet
  - concept.자기회귀-생성
  - concept.합성곱-신경망
  - concept.잔차-연결
---
# WaveNet과 표본 단위 신경 오디오 생성

053 raw는 2016년 [[WaveNet]]을 원시 파형 생성의 혁명으로 설명한다. 직접 파형·팽창 인과 합성곱·자기회귀 생성의 중요성은 잘 짚지만, 자연 음성과의 실제 평가 격차, 외부 언어 특징 조건화, 2016년 연구 원형과 2017년 제품 배포를 섞는다. 공개 문서는 모델의 확률 단위와 제품 전환의 시점을 나누어 검증한다.

## 원시 파형을 확률분포로 만들기

WaveNet은 오디오 표본열의 결합확률을 앞선 모든 표본에 조건화된 다음 표본 확률의 곱으로 분해했다.

$$
p(x)=\prod_{t=1}^{T}p(x_t\mid x_1,\ldots,x_{t-1}).
$$

원 논문은 16비트 PCM 진폭을 μ-law로 압축해 8비트 256개 값으로 양자화하고, 다음 표본을 categorical softmax로 예측했다. ‘raw waveform을 직접 생성한다’는 표현은 보코더가 복원할 스펙트럼 특징 대신 최종 파형 표본을 모델링한다는 뜻이다. 연속값 확률밀도를 그대로 출력했다는 뜻은 아니다.

## 팽창 인과 합성곱의 역할

인과 합성곱은 현재 표본을 예측할 때 미래 표본을 보지 않게 한다. 팽창률을 1, 2, 4, 8처럼 늘리면 작은 커널도 깊이에 따라 넓은 수용 영역을 갖는다. WaveNet은 gated activation과 residual·skip connection을 더해 깊은 시퀀스 모델을 훈련했다.

이 구조는 표준 RNN처럼 시점별 은닉 상태를 반드시 순서대로 갱신하지 않는다. 정답 파형 전체가 있는 훈련에서는 여러 위치의 합성곱을 병렬 계산할 수 있다. 그러나 생성은 방금 뽑은 표본이 다음 조건이 되므로 여전히 한 표본씩 순차적이다. 구조의 병렬 훈련 가능성과 [[자기회귀 생성]]의 순차 추론을 구분한다.

팽창은 수용 영역을 수천 표본으로 키웠지만 원형의 직접 문맥은 16kHz에서 수백 밀리초 규모였다. 국소 음향과 중간 범위 운율을 포착하는 것과 수초 전 사건이나 문장·음악 전체 구조를 직접 모델링하는 것은 같은 주장이 아니다.

## 조건화와 ‘종단간’의 경계

무조건 모델은 음성 같은 옹알이나 음악 조각을 생성했다. TTS 실험에서는 입력 문자를 그대로 넣지 않고 음소·음절·단어 수준의 언어·음성 특징을 시간축에 맞춰 국소 조건으로 제공했다. 화자 ID는 전역 조건으로 넣어 한 모델이 여러 목소리를 구분하게 했다.

따라서 WaveNet은 매개변수형 보코더 대신 파형을 직접 생성했지만, 텍스트 분석·발음·언어 특징 추출까지 없앤 완전한 단일 text-to-waveform 모델은 아니었다. “종단간”이라는 말은 무엇을 입력·출력 경계로 잡았는지 명시해야 한다.

## MOS 결과가 말하는 것

100개 시험 문장에 대한 500회 이상의 청취 평정에서 미국 영어 MOS는 WaveNet 4.21, 연결형 3.86, 매개변수형 3.67, 자연 음성 4.55였다. 만다린은 WaveNet 4.08, 연결형 3.47, 매개변수형 3.79, 자연 음성 4.21이었다.

WaveNet은 당시 강한 두 기준선을 유의하게 앞섰고 사람 음성과의 MOS 격차를 50% 이상 줄였다. 그러나 자연 음성과 같은 점수는 아니었다. ‘거의 구별 불가능’이라는 표현을 보편적 판별 결과로 사용하지 않고, 정해진 문장·언어·청취 평가의 평균 자연스러움으로 한정한다.

## 2016년 연구와 2017년 제품 배포

2016년 원형은 1초에 약 16,000개 표본을 차례로 만들어야 해 실제 저지연 서비스에 너무 느렸다. 가상 비서·접근성·클라우드 API가 즉시 원형 WaveNet으로 전환됐다는 raw의 시간 압축을 교정한다.

Google DeepMind는 2017년 10월 미국 영어와 일본어 Google Assistant 음성에 업데이트된 WaveNet을 배포했다고 공지했다. 이 후속 생산 모델은 원형보다 1,000배 이상 빠르고 1초 음성을 약 50밀리초에 만들 수 있다고 보고됐다. 뒤의 Parallel WaveNet 논문은 autoregressive teacher에서 병렬 student로 확률분포를 distill하는 방법을 공개했다.

## 영향과 비계보

WaveNet은 neural vocoder, WaveRNN, flow·diffusion 기반 파형 생성과 신경 코덱 오디오 모델이 품질·속도·표현 해상도를 다시 설계하게 한 중요한 기준점이다. 팽창 인과 합성곱도 시간 합성곱 네트워크와 다양한 시퀀스 모델에 널리 쓰였다.

하지만 모든 현대 생성 오디오가 원시 파형을 직접 생성하지는 않는다. 스펙트로그램, latent, codec token을 생성한 뒤 별도 디코더로 파형을 만드는 구조도 많다. WaveNet이 연속 양식의 신경 생성을 가능하게 했다는 사실과 이미지·비디오 생성이 WaveNet에서 직접 나왔다는 계보는 구분한다.

원문이 MERT와 WaveNet을 ‘최종 결과 직접 최적화’로 묶은 부분도 부정확하다. MERT는 BLEU 같은 번역 지표를 직접 최적화하고, 원 WaveNet은 다음 양자화 표본의 로그가능도를 최대화했다. WaveNet이 MOS나 인간 지각 품질을 직접 목적함수로 학습한 것은 아니다.

## 검증 정정

- **기존 음성 합성은 1980년대 이후 거의 변하지 않았다**: 연결 선택·통계적 매개변수 모델·신경 음향 모델 등 누적 발전이 있었고, WaveNet은 그 위의 파형 생성 전환이다.
- **팽창 합성곱이 수초 전 문맥을 직접 본다**: 대표 원형의 수용 영역은 수천 표본, 16kHz에서 수백 밀리초 규모다.
- **WaveNet은 연속 진폭을 그대로 출력했다**: μ-law로 양자화한 256개 값의 categorical distribution을 사용했다.
- **텍스트에서 파형까지 완전히 단일 단계로 학습했다**: TTS는 외부 언어·음성 특징에 조건화했다.
- **사람 음성과 거의 구별할 수 없었다**: 기준선보다 높았지만 영어 4.21 대 4.55, 만다린 4.08 대 4.21의 MOS 격차가 남았다.
- **2016년 즉시 Assistant에 배포됐다**: 원형은 너무 느렸고, 1,000배 이상 고속화된 후속 모델의 미국 영어·일본어 배포 공지는 2017년이다.
- **WaveNet은 지각 품질을 직접 최적화해 MERT와 같다**: 다음 표본 로그가능도와 번역 지표 직접 최적화는 목적과 절차가 다르다.

## 핵심 문장

- WaveNet은 양자화한 원시 오디오 표본의 다음 값 분포를 자기회귀적으로 학습했다.
- 팽창 인과 합성곱은 훈련 위치 병렬성을 제공하지만 생성 표본의 순차 의존성을 없애지 않는다.
- TTS는 언어·음성 특징에 조건화됐으므로 직접 파형 출력과 완전한 text-to-waveform 종단간 학습을 구분해야 한다.
- 자연스러움은 당시 기준선을 크게 앞섰지만 사람 음성과 같지 않았고, 제품 배포에는 별도 고속화가 필요했다.

## 출처

- Aaron van den Oord 외, [WaveNet: A Generative Model for Raw Audio](https://arxiv.org/abs/1609.03499), 2016, 특히 §§2–5, Figures 2–5와 Table 1.
- Aaron van den Oord·Tom Walters, [WaveNet launches in the Google Assistant](https://deepmind.google/blog/wavenet-launches-in-the-google-assistant/), Google DeepMind, 2017-10-04.
- 프로젝트 보존 자료: `raw/053_WaveNet - Neural Audio Generation Revolution.ko.md`, `raw/053_WaveNet - Neural Audio Generation Revolution.commentary.ko.md`.

## 관련 항목

- [[WaveNet]]
- [[자기회귀 생성]]
- [[합성곱 신경망]]
- [[잔차 연결]]
