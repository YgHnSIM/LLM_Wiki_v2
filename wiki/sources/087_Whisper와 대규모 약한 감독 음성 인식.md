---
schema_version: 2
id: source.087
page_type: source
title: Whisper와 대규모 약한 감독 음성 인식
aliases:
  - 087_Whisper Large-Scale Multilingual Speech Recognition with Transformer Architecture
  - Whisper Large-Scale Multilingual Speech Recognition with Transformer Architecture
  - Robust Speech Recognition via Large-Scale Weak Supervision
tags:
  - type/source
  - domain/ai
  - domain/computer-science
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
    locator: 'arXiv:2212.04356, §§2.1–2.4·3.1–3.9·4.2–4.5·6, Figure 1, Tables 1–7과 Appendices A·C·F의 68만 시간 자료 구축·모델·멀티태스크 형식·zero-shot 평가·text normalizer·장문 디코딩·한계'
    relation: supports
  - source_id: openai-2022-whisper-release
    locator: '2022-09-21 Introducing Whisper의 68만 시간 학습·30초 log-Mel encoder-decoder Transformer·다국어 전사·X→English 번역·models and inference code 공개 및 LibriSpeech·zero-shot robustness 범위'
    relation: contextualizes
  - source_id: openai-2024-whisper-model-card
    locator: '2024-09-30 고정 스냅샷의 Model Details·Evaluated Use·Training Data·Performance and Limitations·Broader Implications에 기록된 후대 모델 계열·과제 범위·언어 불균형·환각·반복·고위험 사용 경계'
    relation: supports
  - source_id: openai-2022-whisper-repository
    locator: 'README의 Approach·Available models and languages·Python usage 및 License의 30초 이동 창 추론·공개 model family·MIT code and weights'
    relation: supplements
related:
  - concept.whisper
  - concept.자동-음성-인식
  - concept.단어-오류율
  - concept.transformer
  - concept.인코더-디코더
  - concept.음성-활동-감지
  - source.041
---
# Whisper와 대규모 약한 감독 음성 인식

> [!note] 학습 안내
> **난이도:** 중급<br>
> **선수 지식:** [[Transformer]], [[인코더-디코더]]<br>
> **읽고 나면:** Whisper가 웹의 오디오-전사 쌍과 멀티태스크 토큰으로 전사·영어 번역·언어 식별을 통합한 방식을 설명하고, 제로샷(zero-shot)·다국어·사람 수준·공개성 주장의 실제 범위를 구분할 수 있다.

## 1단계 — 먼저 잡을 핵심

### 핵심 문장

**[[Whisper]]**는 웹에서 수집한 약 68만 시간의 오디오-전사 쌍으로 표준 [[인코더-디코더]] [[Transformer]] 계열을 약한 감독으로 사전 학습한 [[자동 음성 인식]] 시스템이다. 음성을 같은 언어의 글로 옮기는 전사, 비영어 음성을 영어로 바꾸는 음성 번역, 발화 언어 식별, 무음과 타임스탬프 예측을 하나의 자기회귀 토큰 인터페이스로 표현했다.

Whisper의 핵심 연구 질문은 새 음성 아키텍처를 발명하는 일이 아니었다. 연구진은 이미 검증된 Transformer를 의도적으로 사용해 **자료의 규모·다양성과 약한 감독이 별도 벤치마크 미세조정 없이 어느 정도 견고성을 만드는가**를 살폈다. 논문에서 제로샷은 각 평가 데이터셋의 훈련 분할(train split)을 사용하거나 그 데이터셋에 미세조정하지 않았다는 뜻이다. 모델이 사전에 어떤 웹 오디오도 보지 않았거나, 학습하지 않은 모든 언어·과제를 처리한다는 뜻은 아니다.

### 역사적 위치

[[041_심층 신경망 음향 모델과 DNN-HMM 전환]]의 초기 DNN-HMM은 기존 파이프라인에서 GMM 음향 모델을 깊은 신경망으로 교체하고 HMM·발음 사전·언어 모델·디코더를 유지했다. Whisper는 30초 오디오 특징을 받아 텍스트 토큰을 직접 생성하는 sequence-to-sequence 구조로 여러 단계를 한 모델 형식 안에 넣었다. 그러나 16kHz 재표본화와 log-Mel 특징, 장문 디코딩 휴리스틱이 남으므로 “파형부터 무제한 길이 전사까지 아무 전처리·후처리 없이 한 번에 해결했다”고 쓰지 않는다.

2022년 9월 공개의 직접적인 의미는 다섯 규모의 원 모델 계열과 추론 코드를 사용할 수 있게 했다는 데 있다. 논문은 다양한 영어 자료에서 강한 제로샷 견고성과 X→English 번역 결과를 보였다. 반면 특정 LibriSpeech 최고 성능, 모든 언어에서의 일관된 성능, 보편적인 사람 수준 정확도를 달성했다고 보고하지는 않았다.

## 2단계 — 작동 원리

### 1단계: 오디오를 고정 길이 특징으로 바꾼다

오디오는 16,000Hz로 재표본화하고 30초 구간으로 나눈다. 각 구간에서 25ms 창과 10ms 이동 간격(stride)으로 80채널 log-magnitude Mel spectrogram을 계산한다. 두 개의 1차원 합성곱층과 GELU가 시간축 특징을 처리하고, 두 번째 합성곱은 stride 2로 길이를 줄인다. 여기에 사인파 위치 임베딩을 더한 뒤 Transformer 인코더가 음향 문맥 표현을 만든다.

이 입력은 원시 파형이 아니다. 사람이 정한 Mel 주파수 축과 시간 창을 사용한 음향 특징이다. 다만 [[041_심층 신경망 음향 모델과 DNN-HMM 전환|초기 DNN-HMM]]처럼 HMM 상태와 프레임을 강제 정렬하고 발음 사전으로 단어를 조합하는 대신, 디코더가 인코더 표현에 교차 어텐션하며 텍스트 토큰을 자기회귀적으로 예측한다.

### 2단계: 특수 토큰이 과제와 출력 형식을 지정한다

디코딩은 `<|startoftranscript|>` 뒤에 언어 토큰을 예측하는 것으로 시작한다. 음성이 없으면 `<|nospeech|>`를 출력하도록 학습한다. 이어 `<|transcribe|>` 또는 `<|translate|>`가 같은 언어 전사와 영어 번역을 구분하고, 타임스탬프 사용 여부와 텍스트·종료 토큰이 뒤따른다. 타임스탬프는 20ms 단위로 양자화해 자막 텍스트 사이에 끼워 넣는다.

이 형식은 언어 식별, 전사, X→English 번역, 시간 정렬과 무음 예측을 한 다음 토큰 예측 문제로 통합한다. 무음 구간을 학습에 일부 포함해 [[음성 활동 감지]]에 해당하는 신호도 배웠다. 그러나 2024-09-30 모델 카드 스냅샷이 말하듯 일반 목적 VAD·화자 분리·화자 분류가 다양한 조건에서 별도로 검증된 것은 아니다.

### 3단계: 30초보다 긴 오디오는 창을 옮겨 가며 푼다

모델은 30초보다 긴 오디오를 한 번에 받지 못한다. 장문 전사는 예측한 타임스탬프로 다음 창의 시작 위치를 정하고, 이전 창의 전사 일부를 문맥으로 넣으며 30초 창을 연속 처리한다. 한 창의 타임스탬프나 전사가 틀리면 다음 창의 정렬과 문맥에도 오류가 전파될 수 있다.

논문의 장문 결과는 단순 탐욕 디코딩(greedy decoding)만의 성능이 아니다. 5-beam 탐색, 낮은 평균 로그확률이나 높은 반복 압축률에서 온도를 올리는 대체 전략(fallback), 무음 확률과 로그확률을 함께 쓰는 판정, 이전 텍스트 조건, 초기 타임스탬프 제약을 조합했다. 이 휴리스틱은 실패를 줄였지만 제거하지는 않았으며, 2024-09-30 모델 카드 스냅샷도 기본 상태에서 실시간 전사를 지원한다고 말하지 않는다.

## 3단계 — 기술과 근거

### 웹 오디오-전사 쌍은 어떻게 만들어졌는가

원 논문의 Figure 11은 약 68만 시간의 자료 장부를 다음처럼 나눈다. 아래는 그림에 표시된 정확한 시간이며, 2024-09-30 모델 카드 스냅샷은 X→English 부분을 약 12만 6천 시간으로 반올림한다.

| 오디오 언어와 목표 | 약한 감독 시간 | 학습 과제 |
| --- | ---: | --- |
| 영어 오디오 → 영어 전사 | 438,218시간 | 영어 ASR |
| 비영어 오디오 → 같은 언어 전사 | 117,113시간 | 다국어 ASR |
| 비영어 오디오 → 영어 전사 | 125,739시간 | X→English 음성 번역 |
| 합계 | 681,070시간 | 다국어·다중 과제 학습 |

연구진은 기존 ASR로 오디오를 새로 자동 전사한 뒤 그 결과를 정제한 것이 아니다. 인터넷에 이미 전사와 짝지어진 오디오를 수집했다. 그중 기존 ASR이 만든 듯한 대문자·소문자·문장 부호 패턴을 탐지해 **기계 생성 전사를 제거**하는 휴리스틱을 적용했다. 오디오 언어 식별기와 전사 언어 식별 결과가 다르면 일반 ASR 쌍에서 제외했고, 전사가 영어인 경우에만 X→English 번역 사례로 돌렸다.

또한 전사 텍스트의 퍼지 중복 제거, 30초 구간과 해당 전사의 정렬, 초기 모델의 자료원별 오류율과 규모를 이용한 수동 검사, 품질이 낮거나 부분 정렬된 자료원 제거를 수행했다. TED-LIUM 3처럼 중복 위험이 높다고 본 평가 자료와는 전사 수준 중복 제거를 했다. 그러므로 “거의 정제하지 않은 웹 데이터의 양만 늘렸다”는 설명도 정확하지 않다. 감독은 금표준보다 약했지만 상당한 필터링과 선별이 있었다.

### 2022년 최초 모델 계열

원 논문 Table 1의 기본 계열은 다섯 규모다. `tiny`부터 `medium`까지는 영어 전용과 다국어 체크포인트가 각각 있었고, `large`는 다국어 모델만 있었다. 따라서 최초 공개물은 다섯 규모, 총 아홉 체크포인트로 읽는다.

| 규모 | 인코더·디코더 층 수 | 폭 | 어텐션 헤드 | 매개변수 |
| --- | ---: | ---: | ---: | ---: |
| tiny | 4 | 384 | 6 | 39M |
| base | 6 | 512 | 8 | 74M |
| small | 12 | 768 | 12 | 244M |
| medium | 24 | 1024 | 16 | 769M |
| large | 32 | 1280 | 20 | 1,550M |

2024-09-30 모델 카드 스냅샷에는 후대 `large-v2`, `large-v3`, `turbo`가 추가돼 모델 수와 사양이 달라졌다. 이를 2022년 9월 최초 공개 사양으로 소급하지 않는다. 반대로 2022년 12월 제출된 논문의 각주에는 원 공개 뒤 Large V2를 2.5배 더 많은 epoch와 추가 정규화로 훈련했으며, 별도 표시가 없으면 보고 결과를 이 개선 모델로 갱신했다고 적혀 있다. 최초 체크포인트의 공개 역사와 논문 표의 최신 평가 결과도 같은 장부로 합치지 않는다.

### 제로샷 결과는 비교 조건과 함께 읽는다

Whisper의 제로샷은 평가 데이터셋의 훈련 분할을 사용하지 않았다는 뜻이다. [[단어 오류율]](word error rate, WER)은 전사 형식 차이에도 민감하므로 논문은 광범위한 텍스트 정규화기(text normalizer)를 적용한 결과를 주로 비교했다.

| 주장 축 | 논문이 직접 보인 결과 | 읽을 때의 경계 |
| --- | --- | --- |
| 영어 정제 음성 벤치마크 | 최상위 제로샷 Whisper의 LibriSpeech test-clean WER 2.5 | 당시 최고 1.4보다 높고, 논문도 대략 2019년 중반 최고 수준이라고 평가 |
| 영어 분포 밖 견고성 | LibriSpeech 성능이 비슷한 지도 모델보다 12개 다른 자료에서 평균 상대 오류 55.2% 감소 | normalizer 적용 WER이며, 모든 상용 시스템보다 항상 우수하다는 뜻이 아님 |
| 다국어 ASR | MLS WER 7.3으로 비교 모델보다 낮았지만 VoxPopuli WER 13.6으로 Maestro 8.1·mSLAM 9.1·XLS-R 10.6보다 높음 | 언어·자료마다 순위가 달라 하나의 다국어 최고 성능으로 합칠 수 없음 |
| 음성 번역 | CoVoST2 X→English 제로샷 평균 29.1 BLEU | 전체·중저자원 묶음에서는 강했지만 고자원 언어 평균에서는 직접 지도 모델보다 낮음 |
| 사람 전사 비교 | Kincaid46의 영어 녹음 25개에서 전문 전사 서비스에 근접 | 한 컴퓨터 보조 서비스는 Whisper보다 1.15%포인트 낮은 WER, 순수 사람 서비스도 소폭 우수 |

언어 수 역시 자료 포함·토큰 지원·평가·강한 성능을 나누어 읽는다. 논문은 68만 시간 중 11만 7천 시간이 영어 이외 96개 언어를 포괄한다고 적지만, 다국어 ASR 분석에서는 실제 음성 인식 학습 자료가 있는 75개 언어를 언급한다. 2024-09-30 모델 카드 스냅샷은 비영어 자료가 98개 언어를 나타낸다고 적으면서도 강한 ASR 결과는 약 10개 언어라고 제한한다. “90개가 넘는 언어를 모두 같은 품질로 지원한다”는 결론은 어느 수치에서도 나오지 않는다.

### 공개 범위

OpenAI의 2022년 9월 발표와 논문은 **모델과 추론 코드(models and inference code)**를 공개한다고 명시했다. 공식 저장소는 전사·번역·언어 식별과 디코딩을 실행하는 코드와 모델 가중치를 MIT License로 제공한다. 이 공개물은 전체 68만 시간 데이터셋이나 이를 재구성하는 수집 파이프라인, 기초 모델 훈련 코드를 포함한 완전한 재현 패키지가 아니다.

따라서 모델을 로컬에서 실행·변형하고 후속 응용을 만드는 문턱이 낮아졌다는 사실과, 원 훈련을 누구나 같은 자료로 재현할 수 있다는 주장을 구분한다. 공개 뒤 연구·응용이 확산했다는 후대 영향은 별도 채택 자료가 필요하며, 원 논문과 발표만으로 모든 접근성·산업 효과의 인과를 입증하지 않는다.

## 검증과 한계

### 원 웹글의 검증 정정

- **학습 오디오는 기존 음성 인식 시스템으로 자동 전사한 뒤 정제했다:** 논문은 인터넷에서 이미 전사와 짝지어진 오디오를 수집했다고 설명한다. 기존 ASR 산출물로 보이는 기계 생성 전사는 품질을 높일 감독으로 사용한 것이 아니라 탐지해 제거하려 한 대상이었다.
- **음성을 다른 언어들로 번역할 수 있다:** 2022년 학습·평가의 음성 번역 방향은 X→English다. 같은 모델 형식이 전사와 번역을 구분하지만 임의의 언어 쌍을 양방향 번역한 것은 아니다.
- **모델 가중치와 학습 코드를 공개했다:** 공식 표현은 모델과 추론 코드다. 저장소는 MIT로 공개된 실행·추론 코드와 가중치를 제공하지만 전체 학습 코드·자료 수집 파이프라인·훈련 데이터셋은 제공하지 않는다.
- **단일 모델 하나가 90개가 넘는 언어와 모든 과제를 같은 품질로 처리했다:** 2022년에는 다섯 규모와 영어 전용·다국어 변형이 있었다. 자료에 언어가 포함됐다는 사실과 강한 ASR 성능은 다르며, 성능은 언어별 학습량과 문자 체계·tokenizer·자료 품질에 크게 좌우됐다.
- **음성 인식 과제에서 전반적인 최고 성능을 달성했다:** LibriSpeech clean에서는 당시 최고 모델보다 낮았고, VoxPopuli 다국어 ASR과 Fleurs 언어 식별에서도 지도 기준선보다 낮았다. 직접 최고 성능을 보고한 대표 범위는 CoVoST2 X→English 제로샷과 일부 견고성 비교다.
- **사람 수준 음성 인식을 달성했다:** 사람 비교는 Kincaid46 영어 녹음 25개와 특정 전문 전사 서비스에 한정된다. Whisper가 사람보다 낫다고 보고한 결과가 아니며, 모든 언어·억양·소음·도메인에 대한 보편 결론도 아니다.
- **단순 아키텍처와 데이터 양만으로 품질을 만들었다:** 표준 Transformer를 사용한 것은 맞지만, 언어 일치 검사·기계 전사 탐지·중복 제거·구간 정렬·자료원 수동 검사와 장문 디코딩 휴리스틱이 결과에 함께 관여했다.
- **오픈 소스 공개가 후속 음성 기술과 멀티모달 AI를 직접 바꾸었다:** 공개물의 존재와 면허는 확인할 수 있으나 구체적인 채택 규모·후속 모델 계보·산업 효과에는 별도 근거가 필요하다.

### 30초 창과 생성형 디코더의 실패

Whisper는 30초 창 밖의 오디오를 직접 보지 못한다. 장문 처리에서는 한 창의 잘못된 전사·타임스탬프·이전 문맥이 다음 창에 영향을 줄 수 있다. 빔 탐색, 온도 대체 전략, 이전 텍스트 조건과 초기 타임스탬프 제약은 평균 오류를 낮추지만 자료별 효과가 고르지 않았고, 논문도 이를 잡음 많은 예측을 위한 임시 보완책으로 표현했다.

sequence-to-sequence 디코더는 비슷한 소리를 잘못 듣는 지각 오류뿐 아니라 반복 루프, 구간 첫머리나 끝부분 누락, 화자 이름의 그럴듯한 추측, 실제 오디오와 무관한 전사 전체를 생성하는 환각을 일으킬 수 있다. 모델 카드는 이런 반복과 환각이 저자원·발견 가능성이 낮은 언어에서 더 심할 수 있다고 경고한다. 낮은 평균 WER가 개별 전사의 충실성을 보장하지 않으므로 중요한 기록에는 원 오디오 대조가 필요하다.

### 언어·억양·용도의 불균형

논문은 언어별 학습 시간과 Fleurs 제로샷 WER 사이에 강한 상관이 있음을 보고했다. 영어 중심 웹 수집 때문에 대부분 언어의 학습량은 1,000시간보다 적었고, 히브리어·텔루구어·중국어·한국어처럼 영어권 자료의 주류와 문자·언어 거리가 큰 언어는 예측 추세보다 나쁜 이상치가 되기도 했다. 저자들은 언어 거리, 바이트 수준 BPE 토크나이저(byte-level BPE tokenizer)의 부적합, 자료 품질을 가능한 원인으로 제시했지만 하나로 확정하지 않았다.

모델 카드는 언어뿐 아니라 같은 언어 안의 억양·방언과 성별·인종·연령 등 인구집단에 따라 WER가 달라질 수 있다고 적는다. 동의 없이 녹음한 사람을 전사하거나, 모델 출력으로 사람의 속성을 주관적으로 분류하거나, 정확성 오류가 의사결정에 직접 영향을 주는 고위험 영역에 쓰지 말라고 권고한다. 대규모 자동 전사가 감시 역량을 확대할 수 있다는 이중 용도 위험도 공개성의 반대편에 놓인다.

### 텍스트 정규화기와 지표 경계

[[단어 오류율]]은 의미가 같은 표기의 차이도 오류로 센다. 논문은 축약형, 숫자·화폐 표현, 문장 부호 등 비의미적 차이를 줄이기 위해 평가 전에 광범위한 텍스트 정규화기를 적용했고, 일부 데이터셋에서는 정규화 뒤 WER가 최대 50%까지 낮아졌다고 보고했다. 이 차이는 모델이 오디오를 새로 더 잘 들었다는 뜻이 아니라 비교 문자열이 바뀐 결과다.

저자들은 정규화 규칙을 Whisper의 전사 스타일에 반복적으로 맞추는 과정이 과적합 위험을 낳을 수 있다고 직접 경고했다. 따라서 WER 수치를 비교할 때는 데이터셋, 체크포인트, 디코딩 설정뿐 아니라 같은 normalizer를 사용했는지도 기록해야 한다. 전사 정확도는 발화 의미 이해, 화자 분리, 개인정보 보호, 지연 시간과 별개의 평가 축이다.

## 학습 확인

### 확인 질문

1. Whisper의 약한 감독 자료는 기존 ASR이 새로 만든 전사를 학습한 것과 어떻게 다르며, 기계 생성 전사는 실제로 어떻게 다뤘는가?
2. 30초 log-Mel 입력에서 전사·X→English 번역·무음·타임스탬프 출력까지 특수 토큰과 인코더-디코더가 어떤 순서로 작동하는가?
3. 제로샷, 90개 이상 언어, 사람 수준, 공개 코드라는 표현을 각각 어떤 평가·자료·배포 경계 안에서 읽어야 하는가?

### 다음 문서

- [[자동 음성 인식]] — Whisper가 단순화한 전통적 파이프라인과 전사 과업의 전체 평가 축을 다시 본다.
- [[단어 오류율]] — 텍스트 정규화가 결과를 크게 바꿀 수 있는 이유와 상대 오류 감소를 읽는 법을 익힌다.

## 출처

- Alec Radford 외, [Robust Speech Recognition via Large-Scale Weak Supervision](https://arxiv.org/abs/2212.04356), arXiv:2212.04356, 2022, 특히 §§2.1–2.4·3.1–3.9·4.2–4.5·6, Figures 1–10, Tables 1–7과 Appendices A·C·F; [OpenAI 공식 PDF](https://cdn.openai.com/papers/whisper.pdf).
- OpenAI, [Introducing Whisper](https://openai.com/index/whisper/), 2022-09-21, 자료 규모·30초 입력·아키텍처·zero-shot 비교·공개 범위.
- OpenAI, [Whisper Model Card — 2024-09-30 고정 스냅샷](https://github.com/openai/whisper/blob/25e5c364e0a21ddefee46adb674c591f1ba610ba/model-card.md), Model Details·Evaluated Use·Training Data·Performance and Limitations·Broader Implications.
- OpenAI, [Whisper 공식 저장소 — 2022-09-21 고정 스냅샷](https://github.com/openai/whisper/tree/45fc3d43c19e9185b16666c01234ac14e7accfd7), Approach·Available models and languages·Python usage·License.
- 프로젝트 번역·검토 출발 자료: [Whisper: Large-Scale Multilingual Speech Recognition with Transformer Architecture](https://mbrenndoerfer.com/writing/whisper-large-scale-multilingual-speech-recognition-with-transformer-architecture).
- 프로젝트 보존 자료: `raw/087_Whisper Large-Scale Multilingual Speech Recognition with Transformer Architecture.ko.md`, `raw/087_Whisper Large-Scale Multilingual Speech Recognition with Transformer Architecture.commentary.ko.md`.

## 관련 항목

- [[Whisper]]
- [[자동 음성 인식]]
- [[단어 오류율]]
- [[Transformer]]
- [[인코더-디코더]]
- [[음성 활동 감지]]
- [[041_심층 신경망 음향 모델과 DNN-HMM 전환]]
