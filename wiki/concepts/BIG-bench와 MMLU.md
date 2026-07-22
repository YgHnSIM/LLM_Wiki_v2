---
schema_version: 2
id: concept.big-bench-mmlu
page_type: concept
title: BIG-bench와 MMLU
aliases:
  - BIG-bench
  - Beyond the Imitation Game benchmark
  - MMLU
  - Massive Multitask Language Understanding
  - BIG-Bench Lite
  - BBL
tags:
  - type/concept
  - domain/ai
  - domain/computer-science
  - domain/machine-learning
  - domain/nlp
created: '2026-07-22'
updated: '2026-07-22'
lifecycle: active
verification: verified
artifacts:
  - 'raw/095_BIG-bench and MMLU Comprehensive Evaluation Benchmarks for Large Language Models.ko.md'
  - 'raw/095_BIG-bench and MMLU Comprehensive Evaluation Benchmarks for Large Language Models.commentary.ko.md'
evidence:
  - source_id: hendrycks-et-al-2021-mmlu
    locator: '초록과 §§1·3–5, Table 1, Appendices A–B의 57개 과목·문항 분할·객관식 확률 scoring·5-shot·사람 기준·교정·형식·오염'
    relation: supports
  - source_id: big-bench-authors-2023
    locator: '초록과 §§1–3·6, Figures 1·4–15, Appendices B·E의 204개 과제·BBL 24개·JSON/programmatic API·preferred metric 정규화·사람 기준·prompt·규모·오염'
    relation: supports
  - source_id: chowdhery-et-al-2022-palm
    locator: '§§6.1–6.2·6.8, Figures 3–7과 Tables 6·32·41의 MMLU 5-shot·BIG-bench 공통 58개와 150개 text task·BBL·discontinuity 조건'
    relation: contextualizes
  - source_id: openai-2023-gpt4-technical-report
    locator: '§4 Table 2와 Appendix D Table 11의 MMLU 5-shot 86.4%, 선택지 prompt·번역 평가·오염 표본 검사 및 BIG-bench 결과 미보고 경계'
    relation: contextualizes
  - source_id: liang-et-al-2023-helm
    locator: '§§1.1–1.2·3–8·10–11의 scenario·adaptation·metric 다차원 장부와 prompt·오염·비용·타당성 한계'
    relation: contextualizes
related:
  - source.095
  - source.079
  - source.083
  - concept.glue-superglue
  - concept.helm
  - analysis.평가-지표와-모델-유인
  - analysis.손실-곡선과-능력-곡선-사이
  - concept.palm
---
# BIG-bench와 MMLU

> [!note] 학습 안내
> **난이도:** 중급<br>
> **선수 지식:** benchmark의 accuracy·few-shot·평균 개념, [[GLUE와 SuperGLUE]]<br>
> **읽고 나면:** BIG-bench 전체·BIG-Bench Lite·MMLU를 구분하고, model 점수를 재현하는 데 필요한 task subset·prompt·shot·metric·집계·오염 장부와 단일 평균의 한계를 설명할 수 있다.

## 1단계 — 먼저 잡을 핵심

### 한 문장 정의

**MMLU(Massive Multitask Language Understanding)**는 57개 학술·전문 과목의 영어 사지선다 문항으로 zero/few-shot 지식 적용을 재는 benchmark이고, **BIG-bench(Beyond the Imitation Game benchmark)**는 204개 이상의 이질적인 JSON·programmatic language task를 과제별 metric으로 실행하고 정규화해 비교하는 협업 benchmark다.

둘은 모두 [[GLUE와 SuperGLUE]]보다 과목과 task 형식의 폭을 넓혔지만, 하나의 ‘종합 지능 시험’으로 합칠 수 없다. MMLU는 같은 객관식 형식을 여러 과목에 반복한다. BIG-bench는 과제 형식과 metric 자체가 다양하다.

### 세 이름부터 분리한다

| 이름 | 논문 기준 범위 | 점수의 기본 단위 | 주 용도 |
| --- | --- | --- | --- |
| MMLU | 57개 과목, 영어 사지선다 | 선택지 `A/B/C/D` 정확도 | 학술·전문 과목별 지식 적용과 blind spot |
| BIG-bench | 204개 이상의 JSON·programmatic task | task author가 정한 preferred metric | 이질적 능력·취약성과 규모별 행동 탐색 |
| BIG-Bench Lite | 전체에서 고른 24개 JSON task | 같은 task별 metric과 정규화 | 비용을 줄인 반복 비교 |

`BIG-bench`, `BBL`, 특정 model 논문이 공통으로 실행한 58개, programmatic을 제외한 150개 text task는 서로 다른 평가 집합이다. 모두 같은 label을 썼더라도 task list가 다르면 점수의 모집단이 다르다.

### 점수는 model 혼자 만드는 속성이 아니다

Benchmark 결과를 다음 함수로 생각하면 비교 오류가 줄어든다.

$$
\text{score}
=f(\text{model checkpoint},\text{task version},\text{prompt},
\text{shots},\text{decoding},\text{metric},\text{aggregation},\text{data boundary}).
$$

Model 이름과 숫자만 적으면 나머지 입력이 사라진다. 특히 base와 instruction-tuned model, zero-shot과 5-shot, direct answer와 CoT, 전체와 경량 subset, task macro와 example-weighted average는 같은 실험이 아니다.

## 2단계 — 작동 원리

### MMLU: 과목별 시연에서 선택지 token을 고른다

원 논문은 각 subject에 5개의 고정 개발 예시를 두었다. GPT-3 few-shot prompt는 과목 이름을 알리는 instruction, 최대 5개의 question–answer demonstration, 새 문항과 `Answer:`를 이어 붙였다. Model의 `A`·`B`·`C`·`D` token 확률 가운데 최대를 선택했다.

$$
\hat y=\arg\max_{c\in\{A,B,C,D\}}p_\theta(c\mid I_s,D_s,x).
$$

$I_s$는 과목 instruction, $D_s$는 고정 few-shot 예시다. 이 정의는 설명을 생성하는 능력이나 정답 근거의 충실성을 채점하지 않는다. 같은 정답이어도 추론이 틀렸을 수 있고, 지식이 있어도 answer token format을 놓치면 오답이 된다.

논문은 총 15,908개 문항이라고 서술했지만 명시한 분할은 dev $57\times5=285$, validation 1,540, test 14,079로 합이 15,904다. 이 4개 차이는 숫자를 임의로 고쳐 맞추기보다 논문 기술과 실제 data release·evaluation harness의 version을 확인해야 한다는 사례다.

### BIG-bench: 과제별 metric을 공통 척도에 놓는다

JSON task는 input–target 예시와 표준 metric을 선언한다. Programmatic task는 Python이 model을 여러 차례 호출하고 custom 평가를 할 수 있다. 약 80%와 20%라는 구성은 task 수 비율이며 compute·example 수 비율과 같지 않다.

Task $t$의 preferred raw metric $m_t$, 저·고 기준 $l_t,h_t$가 있으면 aggregate용 점수는 다음과 같다.

$$
s_t=100\frac{m_t-l_t}{h_t-l_t}.
$$

저 기준보다 못하면 0 미만, 고 기준을 넘으면 100 초과도 가능하다. 전체 aggregate는 $s_t$의 task 평균이다. 이 변환은 exact match, multiple-choice grade, ROUGE 같은 서로 다른 metric을 같은 축에 표시하지만, 각 task의 구성 타당성이나 low/high 선택을 같게 만들지는 않는다.

### BIG-Bench Lite: 비용을 줄이는 대신 범위를 선택한다

전체 BIG-bench는 programmatic task와 여러 차례 호출 때문에 비싸고 adapter 구현도 어렵다. 핵심 기여자들은 keyword coverage, code·비영어·bias task 등을 고려해 JSON task 24개를 골랐다. 이 선택은 명시적이지만, ‘대표성’은 통계적 무작위 표집이 아니라 큐레이션 판단이다.

따라서 BBL의 빠른 회귀 검사는 유용하지만 전체 204개 task의 coverage를 주장할 수 없다. 새 model이 BBL 평균을 높였을 때도 24개 task별 결과와 shot·decoding을 함께 본다.

### 사람 기준도 protocol이다

MMLU의 비전문 AMT 참여자 34.5%는 전문가 기준이 아니다. 약 89.8% `expert-level`은 한 전문가 집단이 57개 test를 실제로 푼 값이 아니라 원 시험의 95백분위와 자료가 없을 때 저자의 추정을 합친 수치다.

BIG-bench rater는 인터넷 검색을 포함한 모든 자원을 쓸 수 있었고 task별 mean과 max가 보고됐다. 동시에 전문성 차이, task subsampling, 개발 중 format 변경이 있었다. Model이 이 값을 넘거나 못 넘었다는 문장은 model과 사람이 받은 도구·시간·task subset을 병기해야 한다.

## 3단계 — 기술과 근거

### 연도와 원 benchmark 결과

| 사건 | 확인된 조건과 결과 |
| --- | --- |
| MMLU arXiv v1, 2020-09-07 | 57개 subject; GPT-3 175B 5-shot 43.9%, zero-shot 약 37.7%; random 25% |
| MMLU ICLR 2021 | 논문 version의 정식 학회 발표; 별도 2023 발명이 아님 |
| BIG-bench arXiv v1, 2022-06-09 | 최종 논문 기준 204 tasks, 450 authors, 132 institutions |
| BIG-bench TMLR 2023 | 최종 저널 게재; living repository의 task 수는 후대에 달라질 수 있음 |

MMLU 원 논문의 `average weighted accuracy`는 문항 수 영향을 받는 전체 classification accuracy다. 원 논문은 별도의 majority-class baseline을 제시하지 않았다. 후대 leaderboard가 subject별 accuracy를 평균하거나 다른 prompt를 사용하면 원 수치와 표면상 같은 `MMLU`라도 집계가 달라질 수 있다.

### MMLU는 비단조적인 지식 지도를 보여 줬다

GPT-3 175B의 5-shot은 humanities 40.8, social science 50.4, STEM 36.7, other 48.8이었다. 10개 최저 과목 가운데 9개가 계산 중심 STEM이었고, college medicine 47.4·college mathematics 35.0이 elementary mathematics 29.9보다 높았다.

이 결과는 학교 단계가 올라갈수록 model 점수가 단조롭게 낮아지거나 STEM이 언제나 강하다는 단순 서사를 반박한다. Training text coverage, 절차 계산, 문항 표현과 선택지 구조가 subject label보다 더 직접적으로 작용할 수 있다.

### BIG-bench 평균은 task coverage 차이를 숨길 수 있다

Figure 1에서 사람 기준이 있는 panel은 BIG-G 171개와 GPT 146개 task를, JSON 비교는 BIG-G 161개와 GPT 156개를 사용했다. 전체 JSON 비교의 기본은 1-shot이었다. 같은 figure 안에서도 model별 평가 집합이 완전히 같지 않다.

당시 strongest model의 aggregate normalized preferred metric은 20 미만이었다. 이는 ‘204개 task에서 20% 정확도’가 아니다. 0이 poor, 100이 task author의 high 기준인 이질적 metric의 평균이다. Task별 성공률과 aggregate의 의미를 분리해야 한다.

### 급격한 score와 급격한 능력은 같은 주장이 아니다

BIG-bench 최종 논문은 약 5%의 task에서 breakthrough score를 보고했지만 exact match·top-1 choice처럼 임계값이 있는 metric과 task 표현에 민감하다고 분석했다. Emoji movie task는 exact string에서 급격해 보였으나 multiple-choice나 target likelihood에서 더 부드러운 진행이 보였다. Cause/effect task도 표현 형식에 따라 규모 곡선이 달라졌다.

[[손실 곡선과 능력 곡선 사이]]에서 다루듯 model이 가진 내부 기능, 특정 prompt에서 유도된 행동, metric이 가시화한 score를 세 층으로 나눈다. 부분 신호가 부드럽다고 최종 성공의 점프가 무의미한 것도 아니고, 한 점프가 내부의 보편적 상전이를 증명하는 것도 아니다.

### 후대 수치는 평가 protocol의 변화를 포함한다

[[PaLM]] 540B는 MMLU test 5-shot에서 69.3%였고, 공통 58개 BIG-bench task의 5-shot에서 prior SOTA를 44개에서 넘었다. 150개 text task 평균은 average human보다 높았지만 개별 task의 35%에서는 human 평균이 더 높았고, BBL 24개에서 best human을 넘은 task는 3개였다.

GPT-4 technical report의 base GPT-4 MMLU 86.4%도 5-shot이다. 표의 U-PaLM 70.7과 Flan-PaLM 75.2는 서로 다른 model·training protocol이다. GPT-4 보고서는 BIG-bench 일부가 training data에 포함된 것을 확인해 BIG-bench 결과를 보고하지 않았다. 빈칸을 성공으로 채우지 않는다.

## 검증과 한계

### 구성 타당성

57과목과 204 task는 범위를 넓히지만 ‘일반 이해’나 ‘전문 능력’의 완전한 표본이 아니다. MMLU 객관식은 설명·질문 되묻기·도구 사용·최신 정보·오류 복구를 보지 않는다. BIG-bench도 text API 바깥의 multimodal·physical interaction coverage에 명시적 공백이 있었다.

Task 이름은 능력의 실체가 아니다. `professional law`의 정답률은 실제 의뢰인 맥락·관할·인용·책임 있는 조언을, `social reasoning` metric은 모든 문화의 상호작용을 대표하지 않는다. Benchmark와 배포 과제 사이의 예측 타당성은 별도 연구가 필요하다.

### Prompt·shot·scoring 민감성

시연 예시를 몇 개 어떤 순서로 두는지, 선택지를 question에 붙이는지, 답 token의 probability를 쓸지 생성 exact match를 쓸지가 점수를 바꾼다. MMLU 원 논문에서는 UnifiedQA prompt 끝의 `</s>`를 빼면 accuracy가 수%p 낮아졌다. BIG-bench는 선택지를 query에 포함했을 때 오히려 낮아지는 모델도 보고했다.

그러므로 leaderboard 수치 차이가 작을수록 동일 harness·prompt·decoding과 반복 표본이 필요하다. 서로 다른 논문 표의 최고값만 모은 비교는 model 차이와 protocol 차이를 분리하지 못한다.

### 오염과 benchmark 수명

MMLU는 공개 온라인 문제를 수집했고 후대에는 test 자체가 널리 복제됐다. 원 논문의 entropy·accuracy 기반 exact question–answer 분석이나 GPT-4의 substring 표본 검사는 특정 오염 신호를 찾는 절차이지 paraphrase·해설·정답표 노출을 모두 배제하는 증명이 아니다.

BIG-bench는 canary string과 `training_on_test_set` task를 제공했다. 원 논문 model 가운데 PaLM을 제외한 training data는 repository보다 먼저 수집돼 직접 task leakage가 불가능했지만, 인터넷 원자료의 간접 leakage는 가능했다. Repository 공개 뒤 학습한 model에는 같은 시간 경계를 재사용할 수 없다.

### 집계와 평균의 사각지대

MMLU 전체 accuracy는 문항이 많은 subject의 영향을 더 받고, subject macro는 작은·큰 과목에 같은 weight를 준다. BIG-bench normalized average는 task별 low/high와 preferred metric 선택을 전제로 모든 task에 같은 weight를 준다. 어느 쪽도 유일하게 옳은 평균은 아니다.

종합 점수와 함께 최소한 task/subject별 결과, 표본 수, 분산·confidence interval, random·human 기준, 최저 성능, 언어·문화·위험 영역을 보고한다. 평균 상승과 가장 취약한 영역의 개선은 별개의 주장이다.

### 널리 쓰임과 산업 표준은 다르다

MMLU와 BIG-bench가 여러 주요 model 논문에 채택된 것은 확인할 수 있다. 그러나 `모든 major release`, `산업 표준`, `실제 제품 품질의 객관적 지표`는 별도의 채택 자료·표준 기관·예측 타당성 없이 단정할 수 없다. Leaderboard 가시성과 배포 적합성을 분리한다.

### 확인된 사실·해석·미해결 전망

- **확인된 사실:** MMLU는 57개 객관식 subject, BIG-bench는 최종 논문 기준 204개 이질적 task와 BBL 24개를 공개하고 zero/few-shot model을 비교했다.
- **근거 있는 해석:** 과목·task coverage를 넓히면 한두 개 NLP dataset보다 model의 불균형과 prompt·metric 취약성을 더 많이 발견할 수 있다.
- **미해결 전망:** 단일 aggregate가 일반 지능·전문 직무·안전한 배포를 예측하는지, 공개 benchmark가 장기간 오염 없이 유지되는지는 두 원 논문으로 입증되지 않았다.

## 학습 확인

### 확인 질문

1. MMLU와 BIG-bench는 task 형식, model output, metric과 aggregate를 각각 어떻게 정의하는가?
2. BBL 24개·공통 58개·150개 text task·전체 204개를 구분하지 않으면 PaLM이나 다른 model의 결과를 어떻게 잘못 비교하게 되는가?
3. Prompt·shot·scoring·contamination·human baseline 가운데 하나라도 빠진 benchmark 수치가 재현과 배포 판단에 부족한 이유는 무엇인가?

### 다음 문서

- [[095_BIG-bench와 MMLU의 평가 범위·집계 경계]] — 원 웹글과 1차 논문의 chronology·수치·과장 교정을 확인한다.
- [[HELM]] — scenario·adaptation·metric을 한 평균 대신 다차원 장부로 남기는 평가를 이어서 본다.
- [[자동 평가 지표는 무엇을 보상하는가]] — score 식과 평균이 model 선택의 유인으로 바뀌는 과정을 본다.
- [[손실 곡선과 능력 곡선 사이]] — scale에 따른 loss·task behavior·불연속 score를 구분한다.

## 출처

- [[095_BIG-bench와 MMLU의 평가 범위·집계 경계]]
- Dan Hendrycks 외, [*Measuring Massive Multitask Language Understanding*](https://arxiv.org/abs/2009.03300), arXiv:2009.03300v1, 2020-09-07; ICLR 2021, §§1·3–5와 Appendices A–B.
- BIG-bench authors, [*Beyond the Imitation Game: Quantifying and Extrapolating the Capabilities of Language Models*](https://arxiv.org/abs/2206.04615), arXiv:2206.04615v1, 2022-06-09; TMLR 2023, §§1–3·6와 Appendices B·E.
- Aakanksha Chowdhery 외, [*PaLM: Scaling Language Modeling with Pathways*](https://research.google/pubs/palm-scaling-language-modeling-with-pathways/), 2022, §§6.1–6.2·6.8, Figures 3–7, Tables 6·32·41.
- OpenAI, [*GPT-4 Technical Report*](https://arxiv.org/abs/2303.08774), 2023, §4 Table 2와 Appendix D Table 11.
- [[079_HELM과 다차원 언어 모델 평가]]
- 프로젝트 보존 자료: `raw/095_BIG-bench and MMLU Comprehensive Evaluation Benchmarks for Large Language Models.ko.md`, `raw/095_BIG-bench and MMLU Comprehensive Evaluation Benchmarks for Large Language Models.commentary.ko.md`.

## 관련 항목

- [[095_BIG-bench와 MMLU의 평가 범위·집계 경계]]
- [[GLUE와 SuperGLUE]]
- [[HELM]]
- [[079_HELM과 다차원 언어 모델 평가]]
- [[PaLM]]
- [[083_PaLM과 Pathways 기반 대규모 언어 모델 확장]]
- [[자동 평가 지표는 무엇을 보상하는가]]
- [[손실 곡선과 능력 곡선 사이]]
