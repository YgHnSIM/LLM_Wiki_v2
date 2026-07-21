---
schema_version: 2
id: source.057
page_type: source
title: ELMo와 ULMFiT의 두 전이 학습 경로
aliases:
  - 057_ELMo and ULMFiT Transfer Learning for Natural Language Processing
  - Deep Contextualized Word Representations and ULMFiT
tags:
  - type/source
  - domain/ai
  - domain/nlp
  - domain/machine-learning
created: '2026-07-20'
updated: '2026-07-21'
lifecycle: active
verification: verified
artifacts:
  - 'raw/057_ELMo and ULMFiT Transfer Learning for Natural Language Processing.ko.md'
  - 'raw/057_ELMo and ULMFiT Transfer Learning for Natural Language Processing.commentary.ko.md'
evidence:
  - source_id: peters-et-al-2018-elmo
    locator: '초록과 §§1–3의 biLM 층별 표현·과제별 가중합, §4와 Table 1의 여섯 NLP 과제'
    relation: supports
  - source_id: howard-ruder-2018-ulmfit
    locator: '초록과 §§1–3의 세 단계 전이·판별적 미세조정·기울어진 삼각형 학습률·점진적 동결 해제, §§4–5의 여섯 분류 자료'
    relation: supports
related:
  - concept.언어-모델-전이-학습
  - concept.단어-임베딩
  - concept.장단기-메모리
  - concept.transformer
---
# ELMo와 ULMFiT의 두 전이 학습 경로

> [!note] 학습 안내
> **난이도:** 중급<br>
> **선수 지식:** [[단어 임베딩]], [[장단기 메모리]]<br>
> **읽고 나면:** ELMo의 고정 문맥 특징과 ULMFiT의 전체 모델 적응이 사전 학습 지식을 서로 다르게 전달하는 방식을 비교할 수 있다.

## 1단계 — 먼저 잡을 핵심

056 raw는 ELMo와 ULMFiT가 2018년에 자연어 처리 전이 학습을 확립했다고 설명한다. 두 연구를 함께 읽는 관점은 유용하지만 문맥화 표현과 전체 모델 미세조정, 원 논문의 과제 범위와 후대 Transformer 계보를 한 흐름으로 넓힌다. 공개 문서는 두 방법이 사전 학습 지식을 전달한 **서로 다른 인터페이스**를 복원한다.

### 핵심 문장

- ELMo는 고정된 biLM의 여러 층 문맥 표현을 과제별 가중합으로 제공했다.
- ULMFiT는 일반 LM, 목표 영역 LM, 분류기의 세 단계와 안정화 기법으로 모델 전체를 적응시켰다.
- 두 방법은 특징 추출과 전체 미세조정이라는 서로 다른 전이 인터페이스를 대표한다.
- BERT·GPT와는 공통 문제를 공유하지만 구조·목적함수·평가 범위를 구분해야 한다.

## 2단계 — 작동 원리

### 두 전이 경로를 읽는 순서

ELMo는 사전 학습 모델을 고정한 채 문맥 표현을 후속 과제에 공급한다. ULMFiT는 일반 언어 모델을 목표 영역과 분류 과제에 차례로 맞춘다. 따라서 두 연구는 같은 사전 학습 출발점에서 무엇을 고정하고 무엇을 갱신하는지를 비교해 읽어야 한다.

## 3단계 — 기술과 근거

### 공통 문제와 다른 해법

정적 [[단어 임베딩]]은 큰 말뭉치에서 배운 표현을 여러 과제에 재사용했지만 단어 유형마다 벡터 하나를 제공했다. 과제별 순환 신경망은 이 입력을 문맥화할 수 있어도 나머지 매개변수는 흔히 새로 학습했다. ELMo와 ULMFiT는 대규모 비표지 텍스트의 언어 모델 지식을 더 깊게 전달했지만 전달 방식은 달랐다.

| 연구 | 사전 학습 모델 | 후속 과제로 전달하는 것 | 대표 적응 방식 | 원 논문 평가 범위 |
|---|---|---|---|---|
| ELMo | 문자 CNN 입력과 2층 양방향 LSTM 언어 모델 | 입력층과 모든 biLM 층의 위치별 문맥 표현 | biLM은 고정하고 과제별 층 혼합 가중치·후속 모델 학습 | SQuAD·SNLI·SRL·coreference·NER·SST-5 |
| ULMFiT | WikiText-103의 3층 AWD-LSTM 언어 모델 | 사전 학습 모델의 매개변수와 언어 모델 능력 | 목표 영역 LM 적응 뒤 분류기와 모델을 단계적으로 미세조정 | IMDb·TREC-6·AG News·DBpedia·Yelp 이진·전체 별점 분류 |

따라서 ELMo는 주로 **고정 특징 추출**, ULMFiT는 **모델 전체 적응**의 사례다. 둘 다 사전 학습을 재사용한다는 공통점만으로 같은 알고리즘이 되지 않는다.

### ELMo의 문맥화 표현

ELMo의 양방향 언어 모델은 순방향과 역방향을 별도 LSTM으로 계산한다. 순방향은 왼쪽 문맥에서 다음 token을, 역방향은 오른쪽 문맥에서 반대 방향의 다음 token을 예측한다. 두 방향이 하나의 위치에서 미래와 과거를 동시에 조건으로 같은 token을 예측하는 masked LM은 아니다.

각 token $k$에 대해 입력 표현과 $L$개 biLM 층의 순·역방향 상태를 모은다. 후속 과제 $task$의 ELMo 표현은 개념적으로 다음처럼 쓸 수 있다.

$$
\operatorname{ELMo}^{task}_k
=\gamma^{task}\sum_{j=0}^{L}s^{task}_j\mathbf{h}^{LM}_{k,j},
\qquad \sum_j s^{task}_j=1.
$$

$s_j$는 과제별 softmax-normalized 층 가중치이고 $\gamma$는 전체 크기다. 한 최상위 층만 가져오는 것이 아니라 과제가 여러 내부 층을 섞게 한 점이 핵심이다. 원 논문 분석에서는 위층이 문맥 의존 의미에, 아래층이 품사 같은 구문 정보에 상대적으로 강한 경향을 보였다. 이를 각 층에 언어 기능이 완전히 분리돼 저장된다는 법칙으로 확대하지 않는다.

### ULMFiT의 세 단계 적응

ULMFiT는 텍스트 분류를 위해 다음 세 단계를 사용했다.

1. **일반 영역 LM 사전 학습**: WikiText-103에서 AWD-LSTM 언어 모델을 훈련한다.
2. **목표 영역 LM 미세조정**: 분류 자료의 비표지 텍스트에서 언어 모델 목적을 계속 학습해 어휘와 문체 분포에 적응한다.
3. **목표 과제 분류기 미세조정**: 마지막·최대·평균 hidden state를 잇는 concat pooling 분류기를 붙이고 표지 자료로 훈련한다.

안정적 적응을 위해 층별 학습률을 달리하는 판별적 미세조정, 짧게 상승하고 길게 하강하는 slanted triangular learning rate, 위층부터 한 층씩 푸는 gradual unfreezing을 결합했다. 이 장치들은 작은 과제 자료에서 과적합하거나 사전 학습 지식을 급격히 잊는 문제를 줄이려 했다.

논문은 여섯 텍스트 분류 자료에서 다수 데이터셋의 기존 최고 성능 대비 오류를 18–24% 줄였고, 표지 예시 100개로 처음부터 100배 많은 자료에서 학습한 모델과 맞먹는 조건도 보고했다. 이는 논문의 특정 실험 결과이며 모든 과제·언어·영역에서 같은 절감률을 보장하지 않는다.

### 성과의 범위

ELMo는 서로 다른 여섯 과제의 기존 강한 신경 모델에 표현을 추가해 모두 개선했다. 이 결과는 과제 전용 구조를 없앤 것이 아니라 기존 모델에 사전 학습 특징을 공급한 결과다. 질의응답·상호참조·개체명 인식의 성능 향상을 사람과 같은 중의성 해소나 담화 이해의 직접 증명으로 읽지 않는다.

ULMFiT의 ‘universal’은 같은 학습 절차와 구조를 다양한 텍스트 분류 자료에 적용할 수 있다는 주장이다. 원 논문이 질의응답·번역·요약·자유 생성 전부를 같은 분류 헤드로 검증한 것은 아니다. raw가 ULMFiT의 응용을 일반 자연어 처리 전체로 넓히는 대목은 후속 연구 가능성과 원 실험을 분리해야 한다.

### Transformer 전이 학습과의 관계

[[Transformer]]는 ELMo와 ULMFiT보다 먼저 2017년 번역 구조로 발표됐다. 따라서 두 연구가 Transformer 구조 자체를 낳았다는 계보는 성립하지 않는다. 2018년 BERT와 GPT는 Transformer에 서로 다른 사전 학습 목적과 과제 적응 방식을 결합했다.

BERT의 깊은 양방향 표현은 ELMo와 문맥화라는 문제를 공유하지만 두 독립 방향 LM의 사후 결합이 아니라 masked language modeling으로 같은 encoder의 좌우 문맥을 사용한다. GPT의 생성 사전 학습–미세조정은 ULMFiT와 모델 전체 적응을 공유하지만 자기회귀 Transformer와 과제별 입력 변환을 사용했다. 공통 문제와 설계 선택을 연결하되 직접 복제나 단일 직선 계보로 쓰지 않는다.

## 검증과 한계

### 검증 정정

- **ELMo는 하나의 깊은 LM이 좌우 문맥을 동시에 예측한다**: 순방향·역방향 LM의 대응 층 표현을 결합한다. BERT식 masked LM과 다르다.
- **ELMo는 기존 단어 임베딩을 완전히 교체했다**: 원 실험은 기존 token·문자 표현과 ELMo를 함께 쓰는 경우가 많았다.
- **ELMo의 하위 층은 구문, 상위 층은 담화라는 고정 분업이다**: 분석에서 나타난 상대적 경향이며 완전한 기능 분해가 아니다.
- **ULMFiT는 모든 NLP 출력 형식에 같은 절차로 입증됐다**: 원 실증은 여섯 텍스트 분류 데이터셋이다.
- **ULMFiT의 핵심은 세 기법뿐이다**: 일반 LM 사전 학습·목표 영역 LM 적응·분류기 적응, concat pooling과 BPT3C도 전체 절차에 포함된다.
- **ELMo와 ULMFiT가 Transformer를 만들었다**: Transformer는 2017년에 먼저 발표됐고, 후대 BERT·GPT가 전이 학습 원리를 다른 목적함수로 결합했다.
- **표지 자료 100개면 어떤 과제도 100배 자료와 같다**: ULMFiT 논문의 통제된 텍스트 분류 실험 결과다.
- **사전 학습은 언어 지식을 완전하게 보존·전달한다**: 영역 이동·언어 편중·파국적 망각과 후속 과제 오차가 남는다.

## 학습 확인

### 확인 질문

1. ELMo와 ULMFiT는 후속 과제에 각각 무엇을 전달하는가?
2. ULMFiT의 일반 언어 모델 사전 학습에서 분류기 적응까지의 세 단계는 어떤 순서인가?
3. 두 연구가 Transformer 구조 자체를 만들었다고 말할 수 없는 이유는 무엇인가?

### 다음 문서

- [[언어 모델 전이 학습]] — 특징 추출·전체 미세조정·영역 적응을 더 일반적인 전이 기준으로 묶는다.
- [[BERT]] — 고정 특징과 전체 적응의 논점을 Transformer encoder 사전 학습이 어떻게 다시 구성했는지 살핀다.

## 출처

- Matthew E. Peters 외, [Deep Contextualized Word Representations](https://aclanthology.org/N18-1202/), NAACL 2018, pp. 2227–2237.
- Jeremy Howard·Sebastian Ruder, [Universal Language Model Fine-tuning for Text Classification](https://aclanthology.org/P18-1031/), ACL 2018, pp. 328–339.
- 프로젝트 번역·검토 출발 자료: [ELMo and ULMFiT Transfer Learning for Natural Language Processing](https://mbrenndoerfer.com/writing/elmo-ulmfit-transfer-learning-natural-language-processing)
- 프로젝트 보존 자료: `raw/057_ELMo and ULMFiT Transfer Learning for Natural Language Processing.ko.md`, `raw/057_ELMo and ULMFiT Transfer Learning for Natural Language Processing.commentary.ko.md`.

## 관련 항목

- [[언어 모델 전이 학습]]
- [[단어 임베딩]]
- [[장단기 메모리]]
- [[Transformer]]
