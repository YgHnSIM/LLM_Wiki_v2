---
schema_version: 2
id: concept.wavenet
page_type: concept
title: WaveNet
aliases:
  - 웨이브넷
  - WaveNet architecture
tags:
  - type/concept
  - domain/ai
  - domain/machine-learning
  - domain/speech-processing
created: '2026-07-19'
updated: '2026-07-21'
lifecycle: active
verification: verified
artifacts:
  - 'raw/054_WaveNet - Neural Audio Generation Revolution.ko.md'
  - 'raw/054_WaveNet - Neural Audio Generation Revolution.commentary.ko.md'
evidence:
  - source_id: van-den-oord-et-al-2016-wavenet
    locator: '초록과 §§2–5, Figures 2–5와 Table 1의 자기회귀 파형 분포·팽창 인과 합성곱·조건화·MOS 평가'
    relation: supports
  - source_id: deepmind-2017-wavenet-assistant
    locator: '2017-10-04 공지의 원형 연구 모델과 1,000배 이상 빠른 후속 생산 모델, 미국 영어·일본어 Assistant 배포 구분'
    relation: supplements
related:
  - source.054
  - concept.자기회귀-생성
  - concept.합성곱-신경망
  - concept.잔차-연결
---
# WaveNet

> [!note] 학습 안내
> **난이도:** 중급<br>
> **선수 지식:** [[합성곱 신경망]]<br>
> **읽고 나면:** WaveNet의 표본별 자기회귀 분포, 팽창 인과 합성곱, 조건화와 순차 생성의 관계를 설명할 수 있다.

## 1단계 — 먼저 잡을 핵심

[[WaveNet]]은 앞선 오디오 표본에 조건화해 다음 표본의 확률분포를 예측하는 2016년의 자기회귀 원시 파형 생성 모델이다. 팽창 인과 합성곱으로 미래 표본을 보지 않으면서 수천 시점의 수용 영역을 만들고, 음성 합성에서 당시 연결형·매개변수형 기준선보다 높은 자연스러움 평가를 얻었다.

## 2단계 — 작동 원리

### 처리 흐름

앞선 표본열과 선택적 언어·화자 조건을 인과 합성곱에 넣어 다음 양자화 값의 분포를 만든다. 한 표본을 선택하면 그것을 다음 예측의 조건에 추가하며, 이 순서를 파형 길이만큼 반복한다.

## 3단계 — 기술과 근거

### 표본별 확률모형

오디오 파형을 $x_1,\ldots,x_T$라 하면 WaveNet은 결합분포를 다음처럼 분해한다.

$$
p(x)=\prod_{t=1}^{T}p(x_t\mid x_{<t}).
$$

원 모델은 연속 진폭을 그대로 회귀하지 않았다. 16비트 PCM을 μ-law companding으로 8비트 256개 값에 양자화하고, 다음 값의 categorical distribution을 softmax로 예측했다. 최종 산출물이 원시 파형이라는 의미의 ‘직접 생성’과 확률 출력이 이산 양자화 값이었다는 사실을 함께 기록한다.

### 팽창 인과 합성곱

인과 합성곱은 시점 $t$의 예측이 $t$ 이후 표본을 보지 않게 한다. 팽창 합성곱은 필터가 보는 입력 사이의 간격을 1, 2, 4, 8처럼 늘린다. 커널 폭을 작게 유지하면서도 층을 쌓을수록 수용 영역이 빠르게 커진다.

원 논문의 대표 구성은 팽창률 1부터 512까지의 10개 층을 여러 번 반복하고 gated activation, [[잔차 연결]]과 skip connection을 사용했다. 수천 표본의 문맥은 16kHz에서 대략 수백 밀리초이므로, 팽창만으로 문장·음악 전체의 수초 또는 수분 구조를 직접 포착했다고 확대하지 않는다.

### 조건부 음성 합성

무조건 WaveNet은 말소리 같은 옹알이와 음악 조각을 생성할 수 있다. 텍스트 음성 변환에서는 텍스트에서 추출한 음소·음절·단어 수준의 언어·음성 특징을 시간에 맞춰 국소 조건으로 넣었다. 화자 ID 같은 전체 발화 정보는 전역 조건으로 제공할 수 있다.

따라서 WaveNet은 중간 보코더 대신 파형을 직접 생성했지만, 2016년 실험이 문자 텍스트부터 파형까지 모든 단계를 하나의 모델로 학습한 완전한 text-to-waveform 시스템은 아니다. 외부 언어 특징의 품질과 정렬이 발음·운율에 영향을 줬다.

### 훈련 병렬성과 생성 순차성

훈련 때는 정답 파형 전체가 있으므로 각 위치의 이전 표본을 입력으로 구성하고 합성곱 위치를 병렬 계산할 수 있다. 생성 때는 $x_t$를 실제로 뽑은 뒤에야 $x_{t+1}$을 계산할 수 있다. 원형은 초당 약 16,000회의 순차 예측이 필요해 연구 품질을 제품 지연으로 옮기기 어려웠다.

2017년 Google DeepMind가 Assistant의 미국 영어·일본어 음성에 배포했다고 발표한 시스템은 2016년 원형 그대로가 아니다. 후속 생산 모델은 1,000배 이상 빠른 생성을 보고했고, 뒤의 Parallel WaveNet 연구는 probability density distillation으로 이 속도 문제를 다뤘다. 발표와 제품 배포 시점을 구분한다.

## 검증과 한계

### 평가의 실제 범위

500회가 넘는 평정과 100개 시험 문장의 MOS에서 미국 영어는 WaveNet 4.21, 연결형 3.86, 매개변수형 3.67, 자연 음성 4.55였다. 만다린은 각각 4.08, 3.47, 3.79, 4.21이었다. 당시 강한 합성 기준선을 유의하게 앞섰지만 자연 음성과 같은 점수는 아니었다.

DeepMind가 말한 ‘사람과의 격차를 50% 이상 축소’는 기준 시스템에서 자연 음성까지 남은 MOS 차이를 기준으로 계산한 표현이다. 사람 음성과 거의 구별할 수 없다는 보편적 결론이나, 모든 화자·언어·문장에 대한 동일 품질을 뜻하지 않는다.

### 유산과 경계

WaveNet은 [[합성곱 신경망]]을 이미지 분류가 아닌 시퀀스 생성에 적용하고, 원시 파형을 최대 가능도 자기회귀 모델로 다룰 수 있음을 보였다. 후속 neural vocoder·WaveRNN·flow·diffusion·오디오 토큰 모델은 직접 파형 품질과 생성 속도 사이의 긴장을 서로 다른 표현과 목적함수로 해결했다.

원문이 WaveNet을 MERT와 연결한 설명은 채택하지 않는다. [[최소 오류율 훈련]]은 번역 자동 지표를 직접 최적화하지만, 원 WaveNet은 다음 양자화 표본의 로그가능도를 최대화했다. ‘최종 품질을 중시한다’는 일반적 유사성만으로 직접 방법론 계보를 만들 수 없다.

## 학습 확인

### 확인 질문

1. 원 WaveNet은 다음 오디오 표본을 어떤 분포로 표현했는가?
2. 팽창 인과 합성곱은 미래를 보지 않으면서 수용 영역을 어떻게 넓히는가?
3. 훈련 위치의 병렬 계산이 실제 생성의 순차 의존성을 없애지 못하는 이유는 무엇인가?

### 다음 문서

- [[자기회귀 생성]] — 이전 출력이 다음 출력의 조건이 되는 일반 원리와 순차 추론 비용을 확장해 본다.

## 출처

- [[054_WaveNet과 표본 단위 신경 오디오 생성]]
- Aaron van den Oord 외, [WaveNet: A Generative Model for Raw Audio](https://arxiv.org/abs/1609.03499), 2016, §§2–5와 Table 1.
- Aaron van den Oord·Tom Walters, [WaveNet launches in the Google Assistant](https://deepmind.google/blog/wavenet-launches-in-the-google-assistant/), Google DeepMind, 2017-10-04.

## 관련 항목

- [[054_WaveNet과 표본 단위 신경 오디오 생성]]
- [[자기회귀 생성]]
- [[합성곱 신경망]]
- [[잔차 연결]]
