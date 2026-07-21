---
schema_version: 2
id: source.062
page_type: source
title: T5와 Text-to-Text 통합 프레임워크
aliases:
  - 062_T5 and Text-to-Text Framework Unified NLP Through Text Transformations
  - T5 and Text-to-Text Framework
  - Exploring the Limits of Transfer Learning with a Unified Text-to-Text Transformer
tags:
  - type/source
  - domain/ai
  - domain/nlp
  - domain/machine-learning
created: '2026-07-21'
updated: '2026-07-21'
lifecycle: active
verification: verified
artifacts:
  - 'raw/062_T5 and Text-to-Text Framework Unified NLP Through Text Transformations.ko.md'
  - 'raw/062_T5 and Text-to-Text Framework Unified NLP Through Text Transformations.commentary.ko.md'
evidence:
  - source_id: raffel-et-al-2020-t5
    locator: 'pp. 1–67, 특히 §§1–2.4와 Figures 1–2의 연구 목적·architecture·C4·task format·denoising, §§3.2–3.7와 Tables 2–15의 architecture·objective·data·transfer·scaling 비교와 최종 결과, §§4.1–4.2의 종합과 한계'
    relation: supports
related:
  - concept.t5
  - concept.마스크드-언어-모델링
  - concept.언어-모델-전이-학습
  - concept.인코더-디코더
  - concept.transformer
  - concept.glue-superglue
  - analysis.사전-학습-지식은-과제에-어떻게-도착하는가
---
# T5와 Text-to-Text 통합 프레임워크

> [!note] 학습 안내
> **난이도:** 중급<br>
> **선수 지식:** [[인코더-디코더]], [[마스크드 언어 모델링]]<br>
> **읽고 나면:** T5가 통합한 architecture·loss·text interface와 과제별로 남은 data·metric·fine-tuning을 구분할 수 있다.

## 1단계 — 먼저 잡을 핵심

### 통합의 정확한 범위

062 raw는 [[T5]]를 모든 NLP 과제를 하나로 통합한 획기적 모델로 설명한다. 원 논문의 주안점은 새 architecture 하나의 최초 발명보다 transfer learning의 선택지를 공통 조건에서 비교하는 데 있다. 분류·질의응답·요약·번역을 모두 `input text → output text`로 직렬화하면 같은 [[인코더-디코더]] Transformer, vocabulary와 token likelihood로 학습할 수 있다.

통합된 것은 **입출력 interface·architecture·학습 loss**다. GLUE accuracy·correlation, SQuAD exact match·F1, 요약 ROUGE와 번역 BLEU 같은 성공 기준은 여전히 과제마다 달랐다. 최종 대표 결과도 하나의 고정 weight가 모든 과제를 zero-shot으로 수행한 것이 아니라, 같은 pretrained checkpoint에서 대체로 과제별 fine-tuning을 거쳐 얻었다.

### 핵심 문장

- task prefix는 수행할 과제를 알리는 학습된 text 식별자이며, 보지 못한 과제를 자연어 지시만으로 해결하는 현대 instruction following과 같지 않다.
- 대표 사전 학습 목표는 token의 15%를 평균 길이 3의 span으로 묶어 sentinel로 바꾸고, decoder가 빠진 span만 복원하는 span corruption이다.
- C4는 2019년 4월 Common Crawl을 filtering한 약 750GB English web corpus이지, 사실성·대표성·편향 없음이 보장된 자료가 아니다.
- T5의 강한 최종 성능은 model scale, C4, multi-task pretraining과 과제별 supervised fine-tuning에 조건화된다.

## 2단계 — 작동 원리

### 서로 다른 과제를 text pair로 바꾼다

T5의 처리 흐름은 다음과 같다.

1. 과제 이름과 입력을 하나의 source sequence로 만든다. 예를 들어 번역에는 `translate English to German:`, 요약에는 `summarize:` prefix를 붙인다.
2. encoder가 prefix와 입력 전체를 양방향 self-attention으로 표현한다.
3. causal decoder가 encoder 표현에 cross-attention하며 target text를 왼쪽에서 오른쪽으로 생성한다.
4. 분류는 class ID 대신 `entailment` 같은 label string을, 질의응답은 answer text를 target으로 삼는다.
5. 같은 token-level maximum-likelihood loss를 쓰되 평가는 각 benchmark의 원 metric으로 수행한다.

| 과제 | source text 예 | target text | 남는 과제별 요소 |
|---|---|---|---|
| 분류 | `cola sentence: ...` | label string | label vocabulary·accuracy/Matthews correlation |
| 질의응답 | `question: ... context: ...` | answer text | answer annotation·EM/F1 |
| 요약 | `summarize: ...` | summary | reference summary·ROUGE |
| 번역 | `translate English to German: ...` | target sentence | language pair·BLEU |

text output은 과제별 head를 공통 decoder로 바꾸지만, label 의미와 dataset·metric까지 같게 만들지는 않는다.

### 사전 학습 뒤 과제에 적응한다

대표 설정은 C4의 비표지 text로 span corruption을 학습한 뒤 supervised task에 적응한다. 논문은 full fine-tuning, adapter 계열, 여러 multi-task mixture를 비교했다. 최종 recipe는 C4 denoising과 supervised task를 함께 섞은 multi-task pretraining 뒤 각 downstream task에 다시 개별 fine-tuning하는 방식이었다. 그러므로 `한 model family가 여러 과제를 지원한다`와 `한 checkpoint가 추가 학습 없이 모든 과제를 수행한다`를 구분해야 한다.

## 3단계 — 기술과 근거

### encoder–decoder와 비교 조건

T5 baseline은 bidirectional encoder, causal decoder와 encoder–decoder attention을 결합한다. 원 논문은 encoder–decoder 변형을 decoder-only language model·prefix LM과 공통 text-to-text 조건에서 비교했다. Encoder–decoder는 비교 language model보다 parameter가 약 두 배였지만 정한 sequence length에서 계산량은 비슷하도록 맞췄다. parameter 수, FLOPs, memory와 실제 latency는 같은 비용 지표가 아니다.

분류처럼 target이 짧은 과제에서도 decoder를 실행해야 하므로 전용 encoder head보다 inference step이 늘 수 있다. 반대로 번역·요약처럼 원래 variable-length target을 생성하는 과제에는 같은 interface가 자연스럽다. 형식 통합의 장점이 모든 과제에서의 계산 최적성을 자동 보장하지 않는다.

### sentinel span corruption

원 sequence에서 전체 token의 15%를 골라 평균 길이 3의 연속 span으로 묶는다. 각 span은 input에서 서로 다른 sentinel token으로 바뀐다. target에는 각 sentinel과 제거된 span이 원래 순서대로 들어가고 마지막 다음 sentinel이 복원 sequence의 끝을 표시한다.

- input: `Thank you <X> me to your party <Y>`
- target: `<X> for inviting <Y> last week <Z>`

raw의 예시는 target 첫 sentinel과 마지막 종결 sentinel을 빠뜨렸다. 논문은 여러 corruption variant의 차이가 대체로 작다고 보고했다. 제거된 부분만 생성하는 짧은 target은 계산 효율상 이점이 있으므로 span corruption이 token-level MLM보다 본질적으로 느리다고 단정할 수 없다.

### C4와 비교 실험

Colossal Clean Crawled Corpus(C4)는 2019년 4월 Common Crawl snapshot에서 English text를 추출하고 중복·짧은 행·금칙어 등의 규칙으로 filtering한 약 750GB corpus다. 이 자료는 규모 있는 공통 사전 학습 조건을 제공했지만, `clean`은 web의 사실 오류·편향·유해 내용이나 benchmark contamination이 제거됐다는 보증이 아니다.

논문은 architecture, denoising objective, pretraining corpus, unlabeled data 양, fine-tuning 방식, multi-task mixture와 model scale을 같은 task collection에서 비교했다. 이 체계적 ablation이 T5 연구의 핵심 공헌이다. 여러 실험 선택의 효과가 함께 들어간 최종 T5-11B 결과를 단일 원인의 증거로 읽어서는 안 된다.

### 최종 결과의 범위

T5-11B 최종 설정은 논문이 집계한 24개 과제 가운데 18개에서 당시 최고 결과를 기록했다. 강한 결과이지만 모든 과제를 이긴 것은 아니다. Table 14의 WMT English→German은 32.1 BLEU로 표에 제시된 prior best 33.8보다 낮았다. 번역 실험도 English→German·French·Romanian 방향에 한정돼 광범위한 다국어 model의 증거가 아니다.

T5는 SQuAD에서 question과 context를 입력받아 answer를 text로 생성했다. 그러나 이 논문은 별도의 abstractive QA 과제를 평가하지 않았으므로 생성 interface를 썼다는 사실만으로 자유로운 abstractive QA 능력이 입증되지는 않는다. 여러 benchmark의 수치를 하나의 `범용 언어 이해` 점수로 합칠 수도 없다.

## 검증과 한계

### 검증 정정

- **T5가 최초의 unified NLP framework를 발명했다**: 논문은 모든 문제를 QA·language modeling·span extraction으로 바꾼 선행 통합 접근을 명시하며, 목표를 transfer technique의 systematic comparison과 scale-up에 둔다.
- **평가까지 하나로 통합했다**: output likelihood는 공통이지만 benchmark metric은 과제별로 남았다.
- **하나의 multi-task checkpoint가 모든 최종 결과를 냈다**: 대표 final result는 multi-task pretraining 뒤 대부분 task별로 별도 fine-tuning한 결과다.
- **task prefix가 현대 zero-shot instruction following이다**: prefix는 supervised example에서 학습된 짧은 task identifier다.
- **span corruption은 MLM보다 느리고 명백히 우월하다**: 짧은 target은 속도상 이점이 있었고 denoising variant 간 차이는 작았다.
- **encoder–decoder는 계산량이 두 배다**: 비교에서 parameter 수는 약 두 배였지만 계산량은 비슷하게 맞췄다.
- **English→German에서 최고 성능이었다**: T5-11B 32.1 BLEU는 당시 표의 prior best 33.8보다 낮았다.
- **SQuAD 결과가 abstractive QA를 입증했다**: answer text를 생성했지만 이 논문은 별도의 abstractive QA 과제를 평가하지 않았다.
- **C4가 깨끗하고 중립적인 사실 corpus다**: filtering된 English web crawl일 뿐 그 속성은 보장되지 않는다.
- **GPT-3·PaLM·GPT-4와 BART가 T5에서 직접 나왔다**: T5 원 논문 하나로 확정할 수 없는 후대 계보다.

### 적용 범위와 남는 한계

T5-11B의 결과는 11B parameter와 큰 pretraining budget에 의존해 재현·serving 비용이 크다. text label의 표면형과 task prefix 선택도 학습 신호에 영향을 줄 수 있다. classification처럼 구조화된 작은 output에서는 생성 decoder가 항상 가장 효율적인 interface라는 보장이 없다.

모든 과제를 text로 표현할 수 있다는 형식적 가능성과 그 표현이 모든 과제에서 가장 정확하거나 경제적이라는 실증 명제는 다르다. 또한 T5의 직접 실험은 English 중심 C4와 제한된 번역 방향에 놓였으므로 다언어·다영역 일반화를 별도 근거 없이 확대할 수 없다.

## 학습 확인

### 확인 질문

1. T5가 공통화한 요소와 과제별로 남겨 둔 요소는 각각 무엇인가?
2. span corruption의 input·target에서 sentinel token은 어떤 두 역할을 하는가?
3. task prefix를 현대 zero-shot instruction과 동일시하면 어떤 supervision 차이가 사라지는가?

### 다음 문서

- [[T5]] — 공통 text-to-text interface, span corruption과 과제별 fine-tuning을 하나의 개념 지도로 다시 정리한다.

## 출처

- Colin Raffel 외, [Exploring the Limits of Transfer Learning with a Unified Text-to-Text Transformer](https://www.jmlr.org/papers/v21/20-074.html), *Journal of Machine Learning Research* 21(140), 2020, pp. 1–67.
- 프로젝트 번역·검토 출발 자료: [T5 and Text-to-Text Framework: Unified NLP Through Text Transformations](https://mbrenndoerfer.com/writing/t5-text-to-text-framework-unified-nlp-through-text-transformations)
- 프로젝트 보존 자료: `raw/062_T5 and Text-to-Text Framework Unified NLP Through Text Transformations.ko.md`, `raw/062_T5 and Text-to-Text Framework Unified NLP Through Text Transformations.commentary.ko.md`.

## 관련 항목

- [[T5]]
- [[마스크드 언어 모델링]]
- [[언어 모델 전이 학습]]
- [[인코더-디코더]]
- [[Transformer]]
- [[GLUE와 SuperGLUE]]
- [[사전 학습 지식은 과제에 어떻게 도착하는가]]
