---
schema_version: 3
id: source.095
page_type: source
title: BIG-bench와 MMLU의 평가 범위·집계 경계
aliases:
  - 095_BIG-bench and MMLU Comprehensive Evaluation Benchmarks for Large Language Models
  - 'BIG-bench and MMLU: Comprehensive Evaluation Benchmarks for Large Language Models'
  - BIG-bench와 MMLU
tags:
  - type/source
  - domain/ai
  - domain/computer-science
  - domain/machine-learning
  - domain/nlp
created: '2026-07-22'
updated: '2026-07-22'
editorial_status: active
review:
  evidence_coverage: verified
  content_mode: descriptive
artifacts:
  - raw/095_BIG-bench and MMLU Comprehensive Evaluation Benchmarks for Large Language Models.ko.md
  - raw/095_BIG-bench and MMLU Comprehensive Evaluation Benchmarks for Large Language Models.commentary.ko.md
evidence:
  - source_id: hendrycks-et-al-2021-mmlu
    locator: 'arXiv v1 2020-09-07, 초록과 §§1·3–5, Table 1, Appendices A–B의 57개 과목·15,908문항·5-shot prompt·GPT-3/UnifiedQA·사람 기준·교정·형식·오염 분석'
    relation: supports
  - source_id: big-bench-authors-2023
    locator: 'arXiv v1 2022-06-09 및 TMLR 2023, 초록과 §§1–3·6, Figures 1·4–15와 Appendices B·E의 204개 과제·BBL·API·정규화·사람 기준·규모 곡선·취약성·오염 경계'
    relation: supports
  - source_id: wang-et-al-2019-superglue
    locator: '초록과 §§1–3·5의 GLUE 포화에 대한 더 어려운 8개 과제 묶음, 이전 종합 benchmark와의 연속·차이'
    relation: contextualizes
  - source_id: chowdhery-et-al-2022-palm
    locator: '§§6.1–6.2·6.8, Figures 3–7과 Tables 6·32·41의 MMLU 5-shot, BIG-bench 공통 58개·150개 text 과제·사람 평균·checkpoint token 조건'
    relation: contextualizes
  - source_id: openai-2023-gpt4-technical-report
    locator: '§§2·4와 Table 2 및 Appendices B·D의 MMLU 5-shot 86.4%, 번역 MMLU, 시험·benchmark 오염 검사와 공개되지 않은 model 세부'
    relation: contextualizes
  - source_id: liang-et-al-2023-helm
    locator: §§1.1–1.2·3–8·10–11의 시나리오×적응×메트릭 설계와 정확도 밖 보정·강건성·공정성·독성·효율성 및 오염·prompt·비용 한계
    relation: contextualizes
relations:
  - target: concept.big-bench-mmlu
    kind: related
  - target: source.079
    kind: related
  - target: source.083
    kind: related
learning:
  difficulty:
    entry: intermediate
    target: intermediate
  prerequisites:
    - target: concept.glue-superglue
    - target: concept.helm
  assumed_knowledge: 없음
  outcomes:
    - 'MMLU의 57개 객관식 과목과 BIG-bench의 204개 이질적 과제를 구분하고, few-shot·prompt·task metric·정규화·평균·사람 기준·오염 조건이 빠진 단일 점수를 일반 능력이나 배포 적합성으로 확대하면 안 되는 이유를 설명할 수 있다.'
  next:
    - target: analysis.평가-지표와-모델-유인
      reason: 자동 평가 지표는 무엇을 보상하는가 — task metric과 aggregate가 model 선택·최적화의 유인이 되는 방식을 살핀다.
    - target: analysis.손실-곡선과-능력-곡선-사이
      reason: 손실 곡선과 능력 곡선 사이 — BIG-bench의 급격한 score와 더 부드러운 likelihood·부분 과제 곡선을 구분한다.
---
# BIG-bench와 MMLU의 평가 범위·집계 경계

> [!note] 학습 안내
> **난이도:** 중급<br>
> **선수 지식:** [[concept.glue-superglue|GLUE와 SuperGLUE]], [[concept.helm|HELM]]<br>
> **읽고 나면:** MMLU의 57개 객관식 과목과 BIG-bench의 204개 이질적 과제를 구분하고, few-shot·prompt·task metric·정규화·평균·사람 기준·오염 조건이 빠진 단일 점수를 일반 능력이나 배포 적합성으로 확대하면 안 되는 이유를 설명할 수 있다.

## 1단계 — 먼저 잡을 핵심

### 둘 다 2023년에 등장한 benchmark가 아니다

공식 095 raw는 2023년을 BIG-bench와 MMLU가 등장한 분수령처럼 서술한다. 그러나 1차 자료의 시간표는 다르다.

| 대상 | 최초 공개와 정식 게재 | 무엇을 고정했는가 |
| --- | --- | --- |
| MMLU | arXiv v1 2020-09-07, ICLR 2021 | 영어 객관식 57개 과목, 과목별 5개 few-shot 개발 예시, 검증 1,540개와 시험 14,079개 |
| BIG-bench | arXiv v1 2022-06-09, TMLR 2023 | 204개 이상의 JSON·programmatic 과제, 과제별 preferred metric과 low/high, 사람 평가와 규모별 model 실행 |
| BIG-Bench Lite | BIG-bench 논문에 함께 공개 | 전체 가운데 JSON 과제 24개를 고른 저비용 부분집합 |

2023년에는 GPT-4 같은 model 보고서가 MMLU를 널리 인용하고 BIG-bench 논문이 TMLR에 게재되면서 두 이름의 가시성이 커졌다. 이 후대 채택을 benchmark의 발명 시점과 합치지 않는다.

### 같은 ‘종합 평가’라도 측정 장치는 다르다

[[BIG-bench와 MMLU]]는 모두 좁은 단일 NLP 과제보다 평가 범위를 넓혔지만 서로 교환 가능한 시험이 아니다.

| 경계 | MMLU | BIG-bench |
| --- | --- | --- |
| 기본 단위 | 네 선택지 객관식 문항 | JSON 또는 Python programmatic 과제 |
| 범위 | 57개 학술·전문 과목 | 언어·추론·수학·code·사회 편향 등 204개 이상의 이질적 과제 |
| 원 논문의 적응 | zero-shot와 최대 5개 고정 시연 | 주로 zero/few-shot, model·과제별 shot 조건 |
| 원 논문의 점수 | 모든 시험 예시의 분류 정확도와 과목·상위 범주별 결과 | 과제 저자가 고른 preferred metric을 low–high로 정규화한 뒤 과제 평균 |
| 경량판 | 별도 57개 과목 전체 | 24개 JSON 과제의 BIG-Bench Lite |
| 대표 사각지대 | 선택지·영어 시험 형식, 과목 불균형, 공개 문항·prompt·집계 | 과제·metric 이질성, 비용, task 버전, prompt 취약성, coverage와 문화·언어 공백 |

MMLU 평균은 선택지를 잘 고르는 능력을, BIG-bench 평균은 서로 다른 preferred metric을 정규화해 합친 결과를 요약한다. 둘 중 어느 것도 설명의 질, 장기 대화, 도구 사용, 실제 전문 책임이나 안전한 배포를 자동으로 측정하지 않는다.

### 핵심 문장

- MMLU 논문은 총 15,908개라고 서술하면서 과목별 5-shot 개발 285개, 검증 1,540개, 시험 14,079개를 제시했다. 명시된 분할의 합은 15,904개라 4개 차이가 있으므로 data version과 실제 분모를 함께 확인해야 한다.
- MMLU 원 논문의 GPT-3 175B few-shot 정확도는 43.9%였고, 13B 이하 세 GPT-3형은 약 25%의 무작위 기준에 머물렀다.
- BIG-bench 논문은 450명의 저자와 132개 기관이 기여한 204개 과제를 보고했으며, 약 80%는 JSON, 약 20%는 programmatic 과제였다.
- BIG-bench의 aggregate는 서로 다른 raw metric을 task별 low/high로 0–100에 맞춘 `normalized preferred metric`의 과제 평균이다. 점수가 0 미만이나 100 초과일 수도 있다.
- BIG-bench에서 갑자기 뛰는 정확도·exact match도 더 부드러운 likelihood나 부분 과제로 측정하면 연속적으로 개선되는 사례가 있었다. 급격한 점수만으로 내부 능력의 상전이를 확정하지 않는다.
- 높은 benchmark 점수는 model snapshot, prompt, shot 수, scoring, contamination audit와 task별 분포가 함께 만든 결과다.

## 2단계 — 작동 원리

### MMLU는 과목별 고정 예시와 선택 확률을 쓴다

MMLU는 STEM·인문학·사회과학·기타의 네 상위 범주 아래 57개 과목을 둔다. 난이도는 초등 수학부터 고교·대학 과목, 전문 법률·의학·심리까지 이어진다. 연구진은 온라인에서 자유롭게 접근 가능한 연습 문제와 교재 부속 문제를 수집했다. ‘실제 시험에서 왔다’는 사실은 출처 형식을 설명할 뿐, 57개를 합친 새 instrument가 모든 전문 수행을 이미 타당화했다는 뜻은 아니다.

원 논문의 GPT-3 few-shot 실행은 과목마다 고정한 최대 5개 예시를 prompt 앞에 넣고, 새 문항의 `A`·`B`·`C`·`D` token 확률 가운데 가장 높은 선택지를 예측으로 삼았다.

$$
\hat y
=\arg\max_{c\in\{A,B,C,D\}}
p_\theta(c\mid \text{subject instruction},D_{\mathrm{dev}},x)
$$

따라서 ‘MMLU 70’ 같은 숫자에는 model만 아니라 prompt 문구, 시연 수와 선택, answer token 처리, 과목별 또는 문항별 집계가 들어간다. 원 논문은 모든 예시와 과제의 분류 정확도를 보고했고, 후대 구현은 과목별 accuracy의 macro average 등 다른 집계를 쓸 수 있으므로 evaluation harness를 함께 적어야 한다.

### BIG-bench는 과제 API와 preferred metric을 묶는다

BIG-bench의 JSON 과제는 입력과 target 예시를 선언하고, text 생성이나 선택지 conditional log probability를 표준 metric으로 평가한다. Programmatic 과제는 Python 코드가 model을 여러 번 호출하고 custom metric을 계산할 수 있다. 다양성은 넓어지지만 같은 API 호출 횟수와 같은 채점식으로 통제된 단일 시험은 아니다.

각 과제 저자는 preferred metric $m_t$, 낮은 기준 $l_t$, 높은 기준 $h_t$를 지정했다. Aggregate plot은 다음 정규화 점수를 과제별로 평균했다.

$$
s_t=100\frac{m_t-l_t}{h_t-l_t},
\qquad
S=\frac{1}{|T|}\sum_{t\in T}s_t
$$

이 식은 서로 다른 단위를 한 그래프에 올릴 수 있게 하지만, low/high의 의미와 task weight를 자연법칙으로 만들지 않는다. `S`가 같아도 어떤 과제에서 성공했는지는 전혀 다를 수 있다.

### BIG-Bench Lite는 전체 benchmark의 동의어가 아니다

전체 실행의 계산 비용과 programmatic adapter 부담을 줄이기 위해 핵심 기여자들은 keyword coverage, code·비영어·편향 과제 포함 등을 기준으로 JSON 과제 24개를 골랐다. BBL은 빠른 비교를 위한 curated subset이지 204개 전체의 무손실 압축이 아니다. PaLM·후대 model의 BBL 점수, 공통 58개 과제 점수와 전체 BIG-bench aggregate를 같은 열에서 비교하지 않는다.

### 비교 가능한 점수에는 실행 장부가 필요하다

최소한 다음 묶음을 점수와 함께 남긴다.

1. Benchmark와 snapshot/version: MMLU 원본인지 변형판인지, BIG-bench 전체·BBL·공통 task subset인지
2. Model과 checkpoint: base·instruction-tuned·RLHF, 공개 API snapshot과 decoding
3. Adaptation: zero/one/few-shot 수, demonstration 선택·순서, CoT·self-consistency·검색·도구 사용
4. Scoring: exact match·choice probability·preferred metric, low/high, macro/micro/task weighting
5. Data boundary: test 공개 시점, canary·n-gram overlap·training cutoff, 직접·간접 leakage
6. 분산과 하위 결과: task별 표본 수, confidence interval, 과목·언어·위험 영역별 결과

## 3단계 — 기술과 근거

### MMLU 원 논문의 수치는 ‘전문가 수준’과 거리가 있었다

네 선택지 무작위 기준은 25.0%다. GPT-3의 2.7B·6.7B·13B few-shot형은 25.9%·24.9%·26.0%였고 175B형이 43.9%로 올라갔다. 다른 QA 자료에 fine-tune한 UnifiedQA 11B는 MMLU에 추가 fine-tuning하지 않은 transfer 조건에서 48.9%였다. 크기만 아니라 사전 학습 자료·QA fine-tuning·prompt 조건이 점수에 들어간다는 결과다. 원 논문은 별도의 majority-class baseline을 보고하지 않았으므로 25% random baseline과 임의의 majority 수치를 합치지 않는다.

비전문 Mechanical Turk 참여자의 aggregate는 34.5%였다. 연구진이 시험별 95백분위와 정보가 없을 때의 추정을 합쳐 만든 expert-level 추정은 약 89.8%다. 이는 같은 사람이 57개 전 분야를 닫힌 책으로 푼 관측값이 아니며, 두 인간 기준도 서로 다른 모집단과 산출 방식이다.

원 GPT-3 결과에서 계산 중심 STEM 과제는 오히려 약했다. 하위 10개 과목 가운데 9개가 수학·계산을 강조한 STEM이었다. Raw의 “model이 대체로 STEM에서 더 높았다”는 일반화는 이 2020년 실험과 맞지 않으며 model·prompt·시대별로 다시 측정해야 한다.

### BIG-bench는 평균 개선과 취약성을 함께 보였다

논문의 GPT와 BIG-G 계열은 규모와 shot 수가 늘 때 평균 normalized preferred metric이 개선됐지만, 당시 가장 강한 model도 aggregate 20 미만이었고 사람이 도구와 인터넷 검색을 사용할 수 있었던 expert rater 기준보다 낮았다. Figure 1의 전체 JSON 비교는 1-shot이며, BIG-G가 사람 기준이 있는 171개·GPT가 146개 과제에서 실행된 panel과 BIG-G 161개·GPT 156개 JSON 과제 panel도 범위가 다르다. Rater는 task를 부분 표집했고 내용과 format도 개발 중 바뀌었으므로 ‘인간 성능’과 ‘BIG-bench 점수’ 모두 고정된 단일 분모가 아니다.

일부 task의 exact match·accuracy는 특정 규모에서 갑자기 올랐다. 그러나 저자들은 정답 log probability, 더 세분한 하위 기능 또는 multiple-choice 재구성에서는 진행이 부드러운 사례를 보였다. 반대로 부드러운 보조 metric이 최종 과제 성공을 보장하는 것도 아니었다. 이 결과는 [[손실 곡선과 능력 곡선 사이]]에서 구분하듯 metric·task specification과 내부 능력 변화의 관계를 조사하게 할 뿐, 단일 점프를 곧바로 일반 추론의 출현으로 확정하게 하지는 않는다.

### 2022–2023년 후속 model 수치는 조건을 바꿨다

[[083_PaLM과 Pathways 기반 대규모 언어 모델 확장|PaLM]] 540B는 공통 58개 BIG-bench 과제의 5-shot에서 prior SOTA를 44개 과제에서 넘고 그 집합의 평균 human score보다 높았다. 전체 150개 text task에서는 평균 human score가 더 높은 과제가 35%였으며, 8B·540B와 62B의 checkpoint token 수도 같지 않았다.

GPT-4 technical report의 MMLU 86.4%는 5-shot 조건이다. 이는 2020년 GPT-3 43.9%와 큰 차이를 보이지만, model·training data·instruction alignment·prompt와 공개 시점이 모두 달라진 비교다. 57개 객관식 평균이 높아졌다고 전문 판단의 설명·사실 검증·안전 책임까지 같은 비율로 해결됐다고 말할 수 없다.

### 오염 방지는 절차이지 완전한 증명이 아니다

BIG-bench는 task 파일에 canary GUID를 넣어 web crawl에서 거를 수 있게 했고, 논문에 보고된 PaLM 이외 model의 training data는 repository 생성보다 앞서 직접 leakage가 불가능하다고 설명했다. 동시에 task가 인터넷 text를 사용하므로 간접 leakage는 가능하다고 밝혔다. 후대 model은 공개 repository 이후 자료를 학습할 수 있으므로 같은 보장을 물려받지 않는다.

MMLU 원 논문도 exact question–answer memorization 가능성을 별도로 분석했다. 그러나 문항이 공개 온라인 출처에서 수집됐고 benchmark 자체도 공개된 뒤에는 exact match 한 가지로 paraphrase·풀이·정답표 노출을 모두 배제할 수 없다. 공개 benchmark의 재현성과 미래 model의 독립 test라는 목표는 긴장 관계에 있다.

## 검증과 한계

### raw 설명의 검증 정정

- **2023년이 BIG-bench·MMLU의 등장점이다:** MMLU는 2020년 공개·2021년 ICLR, BIG-bench는 2022년 공개·2023년 TMLR이다. 2023년은 후대 채택이 두드러진 시기다.
- **BIG-bench는 ‘수백 개 과제를 한 점수’로 일관되게 평가했다:** 204개 과제는 서로 다른 preferred metric과 JSON/programmatic API를 썼다. Aggregate는 task별 low/high 정규화 뒤의 평균이다.
- **MMLU 시험은 이미 검증됐으므로 실제 전문 활용을 예측한다:** 개별 문항의 출처와 57과목 aggregate의 배포 타당성은 다르다. 객관식 선택은 설명·도구 사용·책임 있는 의사결정을 측정하지 않는다.
- **MMLU는 model이 STEM에서 인문·사회보다 대체로 강함을 보였다:** 원 GPT-3 실험에서는 계산 중심 STEM이 약했고, 10개 최저 과목 중 9개가 STEM이었다.
- **BIG-bench의 다양성은 좁은 최적화를 막았다:** 범위는 넓어졌지만 공개 task·metric·leaderboard 자체를 반복 최적화할 수 있고, aggregate가 약한 task를 가릴 수 있다.
- **두 benchmark가 general-purpose reasoning engine임을 입증했다:** 특정 text input과 metric에서의 행동을 측정했다. 내적 추론 과정, 장기 일반화나 모든 환경의 능력을 직접 관측하지 않았다.
- **MMLU는 모든 주요 release에 반드시 보고되는 산업 표준이다:** 널리 사용된 사례는 확인되지만 `모든` release·조직을 포괄하는 표준 의무나 독립 기관의 채택률은 원문이 제시하지 않는다.
- **높은 점수는 학술·법률·의료 활용 능력을 증명한다:** 해당 분야 문항의 정답 선택과 실제 업무의 최신 정보·설명·도구·상호작용·오류 비용·규제는 별도 평가다.
- **BIG-bench가 다언어·문화 편향을 해결했다:** 비영어·저자원·편향 과제를 포함했지만 coverage 공백과 낮은 저자원 언어 성능을 논문 자체가 보고했다.

### 과제·실행·집계·사용의 네 경계

1. **과제 구성:** 어떤 능력을 문항과 target으로 조작화했는지, 문화·언어·난이도·표본 수가 누구를 대표하는지 본다.
2. **실행 protocol:** Model·checkpoint·prompt·shot·decoding·도구와 scoring harness를 고정한다. Prompt format만 바뀌어도 결과가 달라질 수 있다.
3. **집계:** 문항·과목·task 평균, low/high 정규화와 weight가 약점을 어떻게 가리는지 task-level 결과와 함께 본다.
4. **사용 타당성:** Benchmark 정답률이 실제 사용자의 목표·오류 비용·시간·사실성·안전과 연결되는지 별도 evidence로 확인한다.

### 범위 확대는 평가 완결이 아니다

MMLU는 좁은 언어 task에서 학술·전문 과목으로, BIG-bench는 고정 객관식에서 다양한 task API로 범위를 넓혔다. [[HELM]]은 다시 시나리오·적응·여러 메트릭과 효율·공정성·독성 등을 병렬 장부로 분리했다. 이 흐름은 한 benchmark가 앞 것을 완전히 대체한 발전 단계가 아니라 서로 다른 관측 공백을 드러낸 역사다.

따라서 새 benchmark의 가치는 “더 포괄적이므로 객관적”이라는 수사보다, 과제·실행·점수·누락을 재검토할 수 있는 구체적인 장부에 있다. Model이 benchmark를 넘어서는 속도가 빨라질수록 비공개·동적·adversarial evaluation, 사람 연구와 배포 incident 같은 다른 관측을 함께 써야 한다.

## 학습 확인

### 확인 질문

1. MMLU 원 논문의 5-shot accuracy와 BIG-bench의 normalized preferred metric 평균은 분모·task weight·metric에서 어떻게 다른가?
2. BIG-Bench Lite 24개, 공통 58개, 전체 204개 이상과 PaLM의 150개 text task 결과를 같은 benchmark 점수로 합치면 어떤 정보가 사라지는가?
3. Benchmark 점수가 높아져도 일반 추론·전문 배포·안전을 별도로 검증해야 하는 이유를 contamination·prompt·집계·사용 타당성의 네 경계로 설명할 수 있는가?

### 다음 문서

- [[analysis.평가-지표와-모델-유인|자동 평가 지표는 무엇을 보상하는가]] — task metric과 aggregate가 model 선택·최적화의 유인이 되는 방식을 살핀다.
- [[analysis.손실-곡선과-능력-곡선-사이|손실 곡선과 능력 곡선 사이]] — BIG-bench의 급격한 score와 더 부드러운 likelihood·부분 과제 곡선을 구분한다.

## 출처

- 원문: Michael Brenndoerfer, [*BIG-bench and MMLU: Comprehensive Evaluation Benchmarks for Large Language Models*](https://mbrenndoerfer.com/writing/big-bench-mmlu-comprehensive-evaluation-benchmarks-large-language-models).
- Dan Hendrycks 외, [*Measuring Massive Multitask Language Understanding*](https://arxiv.org/abs/2009.03300), arXiv:2009.03300v1, 2020-09-07; ICLR 2021, 초록과 §§1·3–5, Table 1, Appendices A–B.
- BIG-bench authors, [*Beyond the Imitation Game: Quantifying and Extrapolating the Capabilities of Language Models*](https://arxiv.org/abs/2206.04615), arXiv:2206.04615v1, 2022-06-09; TMLR 2023, 초록과 §§1–3·6, Figures 1·4–15, Appendices B·E.
- Aakanksha Chowdhery 외, [*PaLM: Scaling Language Modeling with Pathways*](https://research.google/pubs/palm-scaling-language-modeling-with-pathways/), 2022, §§6.1–6.2·6.8, Figures 3–7, Tables 6·32·41.
- OpenAI, [*GPT-4 Technical Report*](https://arxiv.org/abs/2303.08774), 2023, §§2·4, Table 2, Appendices B·D.
- [[079_HELM과 다차원 언어 모델 평가]]
- 프로젝트 보존 자료: `raw/095_BIG-bench and MMLU Comprehensive Evaluation Benchmarks for Large Language Models.ko.md`, `raw/095_BIG-bench and MMLU Comprehensive Evaluation Benchmarks for Large Language Models.commentary.ko.md`.

## 관련 항목

- [[analysis.평가-지표와-모델-유인|자동 평가 지표는 무엇을 보상하는가]]
- [[analysis.손실-곡선과-능력-곡선-사이|손실 곡선과 능력 곡선 사이]]
- [[concept.glue-superglue|GLUE와 SuperGLUE]]
- [[concept.helm|HELM]]
- [[concept.big-bench-mmlu|BIG-bench와 MMLU]]
- [[source.079|HELM과 다차원 언어 모델 평가]]
- [[source.083|PaLM과 Pathways 기반 대규모 언어 모델 확장]]
