---
schema_version: 2
id: concept.whisper
page_type: concept
title: Whisper
aliases:
  - OpenAI Whisper
  - Whisper ASR
  - 위스퍼
tags:
  - type/concept
  - domain/ai
  - domain/machine-learning
  - domain/nlp
  - domain/speech-processing
created: '2026-07-22'
updated: '2026-07-22'
lifecycle: active
verification: verified
artifacts:
  - 'raw/087_Whisper Large-Scale Multilingual Speech Recognition with Transformer Architecture.ko.md'
  - 'raw/087_Whisper Large-Scale Multilingual Speech Recognition with Transformer Architecture.commentary.ko.md'
evidence:
  - source_id: radford-et-al-2022-whisper
    locator: '초록, §§1–4.5, Figure 1, Tables 1–7의 자료 구성·모델·다중 과제 형식·zero-shot 평가·장문 디코딩'
    relation: supports
  - source_id: openai-2022-whisper-release
    locator: '2022-09-21 발표문의 학습 규모·30초 log-Mel encoder–decoder 흐름·특수 토큰·zero-shot 견고성·공개 범위'
    relation: contextualizes
  - source_id: openai-2024-whisper-model-card
    locator: '2024-09-30 고정 스냅샷의 Model Details, Training Data, Performance and Limitations, Model Use에 기록된 후대 모델 계열·과제 범위·언어별 성능·환각·위험 용도'
    relation: supplements
  - source_id: openai-2022-whisper-repository
    locator: 'README의 Approach·Available models and languages·Python usage와 License의 원 model family·30초 이동 창 추론·MIT code and weights'
    relation: supplements
related:
  - source.087
  - source.041
  - concept.자동-음성-인식
  - concept.단어-오류율
  - concept.transformer
  - concept.인코더-디코더
  - concept.음성-활동-감지
---
# Whisper

> [!note] 학습 안내
> **난이도:** 중급<br>
> **선수 지식:** [[자동 음성 인식]], [[인코더-디코더]]<br>
> **읽고 나면:** Whisper가 음성을 토큰열로 바꾸는 흐름을 설명하고, zero-shot 견고성의 근거와 환각·언어 불균형·공개 범위의 한계를 구분할 수 있다.

## 1단계 — 먼저 잡을 핵심

### 한 문장 정의

[[Whisper]]는 OpenAI가 2022년에 공개한 다국어 [[자동 음성 인식]]·X→English 음성 번역용 [[Transformer]] encoder–decoder 모델 계열이다. 30초 음향 표현을 조건으로 언어, 과제, 시간과 텍스트를 하나의 자기회귀 토큰(token) 열로 생성한다.

### 무엇이 중요했는가

Whisper의 핵심은 음성용 새 블록을 발명한 데 있지 않다. 검증된 [[인코더-디코더]] 구조를 68만 시간의 다국어·다중 과제 웹 음성 자료로 함께 학습해, 평가 데이터셋별 미세조정 없이 여러 영역에 적용한 데 있다. 특정 정제 벤치마크의 최고점보다 억양·잡음·전문 용어와 자료 분포 변화에 대한 제로샷(zero-shot) 견고성을 전면에 놓았다.

### 이 문서의 범위

여기서 Whisper는 2022년 논문과 최초 공개 계열을 가리킨다. `translate`는 임의 목표 언어 번역이 아니라 비영어 음성을 영어 텍스트로 옮기는 X→English 과제다. 언어 식별과 무음 판정 token을 출력할 수 있지만, 기본 모델이 화자 분리나 모든 음성 이해 과제를 완성했다는 뜻도 아니다.

## 2단계 — 작동 원리

### 입력에서 encoder 표현까지

Whisper는 다음 흐름으로 30초 음성을 텍스트 생성 조건으로 바꾼다.

1. 입력 음성을 16 kHz로 다시 표본화하고 30초 구간으로 나눈다.
2. 25 ms 창과 10 ms 간격으로 80채널 로그 멜 스펙트로그램(log-magnitude Mel spectrogram)을 계산한다.
3. 폭 3의 합성곱 두 층과 GELU를 통과시킨다. 두 번째 합성곱은 stride 2로 시간축을 줄인다.
4. 사인 위치 표현을 더하고 Transformer encoder가 음향 위치 사이 문맥을 계산한다.
5. 자기회귀(autoregressive) Transformer decoder가 encoder 출력과 앞서 생성한 token을 조건으로 다음 token을 예측한다.

decoder는 학습된 위치 임베딩과 byte-level BPE 어휘를 사용한다. 이 구조는 전통적인 발음 사전·별도 언어 모델·여러 분리 출력기를 줄이지만, 음향 전처리와 순차 디코딩 자체를 없애지는 않는다.

### 특수 token으로 과제를 지정한다

같은 음성도 원언어 전사, 영어 번역, 시간 정렬처럼 여러 출력으로 읽을 수 있다. Whisper는 별도 모델을 고르는 대신 decoder token으로 과제와 출력 형식을 나타낸다.

| token 역할 | 의미 |
| --- | --- |
| 시작 token | 전사 시퀀스의 시작을 알린다. |
| 언어 token | 입력에서 감지했거나 사용자가 지정한 발화 언어를 나타낸다. |
| `transcribe` / `translate` | 원언어 전사와 X→English 번역을 구분한다. |
| 시간 / `notimestamps` | 20 ms 단위 시간 경계를 생성할지 정한다. |
| `nospeech` | 구간에 음성이 없다고 판정한다. |
| 종료 token | 현재 출력의 끝을 나타낸다. |

`nospeech` token은 [[음성 활동 감지]]의 일부 기능을 한 decoder 안에 넣은 것이다. 이것만으로 서로 다른 화자를 구분하는 speaker diarization까지 수행한다고 해석하지 않는다.

### 짧은 예시

한국어 음성에 “회의는 세 시에 시작합니다”라는 발화가 있다고 하자. `transcribe` 조건에서는 decoder가 한국어 token 열을 생성한다. `translate` 조건에서는 영어 문장을 생성한다. 시간 출력을 켜면 각 구간의 시작·끝 token이 텍스트와 번갈아 나타난다. 30초보다 긴 파일은 한 번에 처리하지 않고, 예측 시간과 앞 구간 문맥을 사용해 다음 30초 창으로 이동한다.

## 3단계 — 기술과 근거

### 68만 시간 약한 감독 자료

논문은 인터넷에 이미 음성과 전사문(transcript)이 짝지어진 자료를 모았다. Figure 11의 전체 681,070시간은 영어 음성 인식 438,218시간, 96개 다른 언어의 음성 인식 117,113시간, X→English 음성 번역 125,739시간으로 나뉜다.

이는 기존 ASR로 68만 시간을 새로 자동 전사했다는 뜻이 아니다. 연구진은 오히려 기계 생성 transcript를 탐지해 제거하고, 음성 언어와 문자 언어가 맞는지 검사했다. 중복 transcript와 저품질·오정렬 출처도 필터링했다. 라벨은 있지만 사람이 같은 규약으로 모두 검수하지 않았으므로 약한 감독(weak supervision)이라고 부른다.

### 2022년 원 모델 계열

논문의 원 계열은 encoder와 decoder의 층 수·폭을 함께 늘렸다.

| 모델 | 각 인코더·디코더 stack의 층 | 폭 | attention head | 매개변수 |
| --- | ---: | ---: | ---: | ---: |
| Tiny | 4 | 384 | 6 | 39M |
| Base | 6 | 512 | 8 | 74M |
| Small | 12 | 768 | 12 | 244M |
| Medium | 24 | 1,024 | 16 | 769M |
| Large | 32 | 1,280 | 20 | 1.55B |

모델 규모가 커질수록 다국어 인식·번역·언어 식별의 평균 성능은 대체로 향상됐지만, 영어 인식에서는 수익 감소가 나타났다. 큰 모델이 모든 언어와 녹음 조건에서 같은 폭으로 개선된다는 보장은 없다.

논문의 주요 결과는 2022년 9월 최초 공개 뒤 2.5배 더 많은 epoch와 추가 정규화를 사용한 Large V2로 갱신됐다. 최초 공개 checkpoint의 사양과 12월 논문에 실린 개선 모델의 평가를 같은 버전으로 합치지 않는다.

### zero-shot과 분포 밖 견고성

Whisper 논문에서 zero-shot은 평가 데이터셋의 훈련 분할로 별도 미세조정하지 않았다는 뜻이다. 사전 학습 중 그 언어나 비슷한 웹 자료를 전혀 보지 않았다는 뜻은 아니다.

깨끗한 LibriSpeech 조건에서 Whisper는 당시의 전문화된 최고 모델을 이기지 못했다. 반면 LibriSpeech 성능이 비슷한 wav2vec 2.0 기준선과 다른 12개 영어 데이터셋을 비교했을 때 평균 상대 오류 감소 55.2%를 보고했다. 이는 “항상 최고 정확도”보다 학습 분포가 달라졌을 때 성능이 덜 무너졌다는 근거다.

다국어 결과는 더 불균일했다. MLS에서는 강했지만 VoxPopuli에서는 여러 선행 모델보다 뒤졌다. Fleurs 분석에서는 언어별 학습 자료량과 WER 사이의 log-log 상관이 컸고, 자료량이 16배 늘 때 WER가 절반이 되는 추정 관계를 보고했다. 언어 목록의 크기를 각 언어의 실질적 품질과 같게 읽어서는 안 된다.

### text normalization은 평가 조건이다

[[단어 오류율]](word error rate, WER)은 표기만 달라도 오류로 센다. Whisper처럼 평가 데이터셋 고유의 전사 규약을 보지 않은 모델은 축약형, 숫자, 문장 부호와 띄어쓰기 때문에 더 큰 불이익을 받을 수 있다. 논문은 예측문과 참조문에 텍스트 정규화기(text normalizer)를 적용한 뒤 WER를 비교했다.

일부 데이터셋에서는 정규화 뒤 WER가 최대 50% 낮아졌다. 저자들은 이 normalizer가 Whisper의 출력 습관에 맞춰졌을 위험도 직접 경고했다. 따라서 WER 수치는 정규화 규칙·자료·언어와 함께 읽어야 하며, 원시 WER와 정규화 WER를 섞어 비교하지 않는다.

### 장문 전사는 모델과 디코딩 절차의 결합이다

Whisper의 기본 음향 문맥은 30초다. 긴 파일은 timestamp가 가리키는 위치로 창을 이동하고, 다음 전략으로 반복·누락·정렬 드리프트를 줄였다.

- beam 5개로 탐색하고, 낮은 평균 log probability나 높은 gzip 압축률이 반복 실패를 가리키면 temperature를 0에서 1까지 올려 다시 디코딩한다.
- 낮은 temperature에서 앞 창의 전사문을 다음 창의 문맥으로 제공한다.
- `nospeech` 확률과 평균 log probability를 함께 사용해 무음을 판정한다.
- 첫 timestamp를 0–1초로 제한해 창 앞부분을 건너뛰는 실패를 줄인다.

이 휴리스틱은 공개 추론 절차의 중요한 부분이다. 모델 가중치만 비교하거나 한 번의 greedy decoding 결과만으로 논문의 장문 성능을 재현했다고 볼 수 없다.

### 2012년 DNN-HMM 전환과 무엇이 다른가

[[041_심층 신경망 음향 모델과 DNN-HMM 전환]]은 깊은 신경망이 GMM 음향 모델을 교체하면서도 HMM 상태, 발음 사전, 언어 모델과 decoder를 유지한 전환이었다. Whisper는 음향 encoder와 autoregressive text decoder를 대규모로 함께 학습하고, 언어·과제·시간 정보를 token 출력으로 통합했다. 두 연구는 모두 음향 변이를 더 잘 모델링하려 했지만, 신경망이 담당하는 파이프라인의 범위가 다르다.

## 검증과 한계

### 확인된 사실

- 2022년 공식 논문과 발표문은 30초 구간, 16 kHz 입력, 80채널 log-Mel 특징, Transformer encoder–decoder와 다중 과제 token 형식을 명시한다.
- 원 모델 계열은 Tiny 39M에서 Large 1.55B까지였으며, 대상 데이터셋 미세조정 없는 평가를 zero-shot으로 정의했다.
- 공식 발표는 모델과 **추론 코드** 공개를 명시했다.

### 흔한 오해와 경계

- 68만 시간 자료는 전부 사람이 정밀 검수한 corpus도, 기존 ASR로 새로 만든 자동 transcript도 아니다.
- `translate`는 임의 언어 쌍이 아니라 X→English 음성 번역이다.
- 언어 token이 존재한다는 사실은 각 언어에서 같은 정확도를 보장하지 않는다.
- `nospeech`·timestamp token은 기본 모델이 화자 분리와 모든 음성 분석 과제를 해결했다는 근거가 아니다.
- zero-shot은 평가 데이터셋별 미세조정이 없다는 뜻이지, 학습 중 관련 언어와 영역을 본 적이 없다는 뜻이 아니다.

### 실패 조건과 공개 범위

Whisper는 약한 감독 자료에서 언어 패턴도 함께 배웠기 때문에 음성에 없는 그럴듯한 문장을 생성할 수 있다. 2024-09-30 모델 카드 스냅샷은 이를 환각(hallucination)으로 기록한다. 긴 음성에서는 반복·창 정렬 오류가 누적될 수 있고, 낮은 자원 언어·억양·방언·화자 집단에는 더 높은 오류가 나타날 수 있다. 원 모델은 저지연 스트리밍(streaming) 전용 구조도 아니다.

2022년 공개 범위는 모델 가중치와 추론 코드였다. 68만 시간 학습 자료와 완전한 학습 파이프라인이 공개됐다는 뜻은 아니다. 의료·법률·채용처럼 잘못된 transcript가 큰 피해를 만드는 환경에서는 해당 언어·도메인·화자 집단으로 별도 평가하고 사람의 검토를 둬야 한다.

## 학습 확인

### 확인 질문

1. Whisper는 30초 음성을 어떤 표현과 신경망 단계를 거쳐 text token으로 바꾸는가?
2. 언어·과제·시간·무음 token은 하나의 decoder가 여러 음성 처리 과제를 수행하도록 어떻게 조건을 지정하는가?
3. zero-shot 견고성 결과가 모든 언어의 동일한 품질이나 모든 벤치마크의 최고 성능을 보장하지 않는 이유는 무엇인가?

### 다음 문서

- [[087_Whisper와 대규모 약한 감독 음성 인식]] — 모델 구조와 함께 68만 시간 자료 구축, 평가 결과, 원자료 정정의 전체 근거를 읽는다.
- [[단어 오류율]] — Whisper의 견고성 주장을 좌우하는 치환·삭제·삽입과 text normalization의 측정 경계를 계산한다.

## 출처

- Alec Radford 외, [Robust Speech Recognition via Large-Scale Weak Supervision](https://arxiv.org/abs/2212.04356), 2022, 초록, §§1–4.5, Figure 1, Tables 1–7.
- OpenAI, [Introducing Whisper](https://openai.com/index/whisper/), 2022-09-21, 학습 규모·구조·zero-shot 견고성·공개 범위.
- OpenAI, [Model Card: Whisper — 2024-09-30 고정 스냅샷](https://github.com/openai/whisper/blob/25e5c364e0a21ddefee46adb674c591f1ba610ba/model-card.md), Model Details, Training Data, Performance and Limitations, Model Use.
- OpenAI, [Whisper 공식 저장소 — 2022-09-21 고정 스냅샷](https://github.com/openai/whisper/tree/45fc3d43c19e9185b16666c01234ac14e7accfd7), Approach·Available models and languages·Python usage·License.
- [[087_Whisper와 대규모 약한 감독 음성 인식]]
- 프로젝트 보존 자료: `raw/087_Whisper Large-Scale Multilingual Speech Recognition with Transformer Architecture.ko.md`, `raw/087_Whisper Large-Scale Multilingual Speech Recognition with Transformer Architecture.commentary.ko.md`.

## 관련 항목

- [[087_Whisper와 대규모 약한 감독 음성 인식]]
- [[041_심층 신경망 음향 모델과 DNN-HMM 전환]]
- [[자동 음성 인식]]
- [[단어 오류율]]
- [[Transformer]]
- [[인코더-디코더]]
- [[음성 활동 감지]]
