---
schema_version: 2
id: source.072
page_type: source
title: 지시 미세조정과 FLAN의 제로샷 일반화
aliases:
  - 072_Instruction Tuning Adapting Language Models to Follow Explicit Instructions
  - Instruction Tuning Adapting Language Models to Follow Explicit Instructions
  - FLAN instruction tuning
tags:
  - type/source
  - domain/ai
  - domain/computer-science
  - domain/nlp
  - domain/machine-learning
created: '2026-07-21'
updated: '2026-07-21'
lifecycle: active
verification: verified
artifacts:
  - 'raw/072_Instruction Tuning Adapting Language Models to Follow Explicit Instructions.ko.md'
  - 'raw/072_Instruction Tuning Adapting Language Models to Follow Explicit Instructions.commentary.ko.md'
evidence:
  - source_id: wei-et-al-2022-flan
    locator: '초록, §§1–4와 Figures 1–10의 정의·62개 데이터셋·12개 과제 군집·군집 보류·LaMDA-PT 학습·GPT-3 비교·과제 수·규모·지시 절제, §6·Appendix C와 FAQ의 한계'
    relation: supports
  - source_id: google-research-2021-flan
    locator: 'Instruction Tuning, Evaluating the Model, Results와 Conclusion의 2021년 공개 설명·군집 보류 평가·20/25 비교·선행 연구 범위'
    relation: contextualizes
  - source_id: mishra-et-al-2022-natural-instructions
    locator: '초록, §§1·3–6과 Tables 1–5의 61개 과제·193k instance·사람 작성 상세 지시·seen/unseen task 분할·지시 요소 절제; arXiv v1 2021-04-18'
    relation: contextualizes
  - source_id: wang-et-al-2023-self-instruct
    locator: '초록, §§2.1–2.3·3.1·8, Figure 2와 Table 1의 175개 seed 기반 instruction·instance 생성·분류·filtering, 52,445개 instruction·82,439개 instance; arXiv v1 2022-12-20·ACL 2023'
    relation: contextualizes
  - source_id: ouyang-et-al-2022-instructgpt
    locator: '§§1·3.1–3.2와 Figure 2의 사람 시연 SFT·선호 순위·보상 모델·PPO 단계 및 FLAN/T0와 실제 사용자 지시 정렬의 차이'
    relation: contextualizes
related:
  - concept.지시-미세조정
  - source.063
  - source.067
  - concept.t5
  - concept.문맥-내-학습
  - concept.언어-모델-전이-학습
  - concept.rlhf
  - analysis.사전-학습-지식은-과제에-어떻게-도착하는가
  - analysis.손실-곡선과-능력-곡선-사이
---
# 지시 미세조정과 FLAN의 제로샷 일반화

> [!note] 학습 안내
> **난이도:** 중급<br>
> **선수 지식:** [[T5]], [[문맥 내 학습]]<br>
> **읽고 나면:** 지시 미세조정이 과제 정보를 가중치와 입력에 나누어 두는 방식을 설명하고, FLAN의 62개 데이터셋·군집 보류 평가·규모별 결과와 원문의 후대 서사를 구분할 수 있다.

## 1단계 — 먼저 잡을 핵심

### 자연어 지시를 추론 요령에서 학습 자료로 옮긴다

[[지시 미세조정]]은 여러 지도 과제를 `자연어 지시 + 입력 → 목표 출력` 형식으로 바꾸어 사전 학습 모델을 함께 미세조정하는 방법이다. [[문맥 내 학습]]처럼 현재 과제를 text로 지정하지만, 차이는 **앞선 학습 단계에서 여러 과제의 감독 신호로 가중치를 갱신한다**는 데 있다. 평가할 과제의 demonstration이 없어도, 다른 과제의 정답 예시는 이미 매개변수에 반영돼 있다.

Wei 등이 2021년 9월 처음 공개하고 ICLR 2022에 발표한 FLAN은 이 질문을 큰 규모에서 시험했다. 연구진은 137B decoder-only LaMDA-PT를 TensorFlow Datasets의 **62개 데이터셋·12개 과제 군집**으로 미세조정했다. 데이터셋마다 자연어 템플릿 10개를 수작업했고, 평가할 군집 전체는 학습에서 제외했다.

### 핵심 문장

- 원 FLAN은 T5가 아니라 137B LaMDA-PT의 **전체 모델 가중치**를 미세조정한 결과다.
- 25개 평가 결과는 하나의 고정된 만능 checkpoint가 모두 낸 값이 아니다. 평가할 과제 군집마다 그 군집을 뺀 별도 checkpoint를 학습했다.
- best-dev template 조건에서 FLAN은 25개 중 20개 데이터셋에서 zero-shot GPT-3를 앞섰다. 이 결과는 prompt 표현 선택과 평가 조건을 포함한다.
- 422M·2B·8B 모델에서는 보류 과제 성능이 오히려 낮아졌고, 68B·137B에서 이득이 나타났다. 지시 미세조정의 이득을 모든 규모의 법칙으로 일반화할 수 없다.
- FLAN은 지시 따르기, 사실성, 안전성과 인간 선호 정렬을 하나로 해결한 연구가 아니다. 사람 선호를 쓰는 [[인간 피드백 강화학습]]은 별도 자료와 최적화 단계를 갖는다.

### 2021년을 단일 발명의 해로 쓰지 않는다

원문은 Google 연구진이 지시 튜닝을 주로 개척했다고 서술한다. 그러나 FLAN 연구진도 QA 기반 과제 통합과 instruction-following 선행 연구를 명시했다. Mishra 등의 Natural Instructions는 2021년 4월 이미 61개 과제·193k instance의 사람이 작성한 지시를 사용해 seen task에서 unseen task로의 일반화를 시험했다. 두 연구의 지시 길이·예시 포함·모델·분할은 같지 않지만, FLAN을 아무 선례 없는 유일한 기원으로 부를 수 없다는 점은 분명하다.

FLAN의 역사적 공헌은 최초성보다 **큰 모델, 여러 짧은 지시 템플릿, 과제 군집 보류와 절제 실험을 하나의 측정 틀로 묶어 instruction tuning이라는 경로를 널리 정착시킨 것**에 있다.

## 2단계 — 작동 원리

### 데이터셋을 지시–입력–출력으로 직렬화한다

FLAN의 학습·평가 흐름은 다음과 같다.

1. 분류·질의응답·번역·요약 등 62개 데이터셋을 12개 과제 군집으로 분류한다.
2. 각 데이터셋에 자연어 템플릿 10개를 수작업한다. 최대 3개는 입력과 출력을 뒤집은 변형이다.
3. 학습 example마다 템플릿 하나를 무작위로 골라 지시와 입력을 만들고, 정답 label이나 text를 target으로 둔다.
4. 평가할 과제 군집 전체를 mixture에서 제외하고 나머지 군집으로 checkpoint를 학습한다.
5. 보류 군집의 현재 문제에는 demonstration 없이 지시만 주어 zero-shot 성능을 측정한다.

지시를 $I$, 입력을 $x$, 출력 token sequence를 $y=(y_1,\ldots,y_T)$라고 하면 지도 목표는 다음 조건부 생성 가능도를 높이는 것이다.

$$
p_\theta(y\mid I,x)=\prod_{t=1}^{T}p_\theta(y_t\mid I,x,y_{<t})
$$

raw의 `III`, `xxx`, `yyy`와 세 번 겹친 확률식은 웹 수식 렌더링 흔적이다. 세 확률을 곱하는 새 목적이 아니라 하나의 $p(y\mid I,x)$를 뜻한다.

### 분류와 생성을 같은 decoder로 처리한다

자유 생성은 target text를 그대로 생성한다. 분류에서는 허용 출력 후보를 `OPTIONS` suffix로 입력 끝에 나열한 뒤, 모델이 원하는 선택지를 text로 출력하게 한다. 이는 자연어 지시만으로 label 의미를 전부 알아낸 설정이 아니다. 후보 집합, label wording과 template도 과제 명세의 일부다.

| 적응 방식 | 감독 신호가 들어가는 때 | 현재 과제를 지정하는 곳 | 과제별 가중치 갱신 |
|---|---|---|---|
| T5 대표 최종 recipe | 사전 학습 뒤 각 downstream task | 지도학습 입력에 함께 넣은 과제별 고정 text prefix | 있음 |
| GPT-3 문맥 내 학습 | 현재 추론 문맥 | 지시·demonstration | 없음 |
| FLAN 지시 미세조정 | 여러 다른 과제의 공동 미세조정 | 현재 지시·입력·출력 후보 | 앞선 지시 미세조정에서 있음 |
| InstructGPT RLHF | 사람 시연 SFT 뒤 선호 순위·보상 최적화 | 사용자 prompt | 있음, 여러 단계 |

### 군집 보류가 ‘보지 않은 과제’를 정의한다

같은 dataset의 test split만 보류하면 학습 중에 같은 과제 형식과 label schema를 이미 볼 수 있다. FLAN은 예를 들어 NLI를 평가할 때 모든 NLI dataset을 지시 미세조정에서 제외했다. 이 설계는 dataset-level zero-shot보다 강한 **task-type holdout**을 제공한다.

다만 평가 군집이 $c$개라면 $c$개의 서로 다른 checkpoint가 필요하다. 또한 LaMDA-PT의 web pretraining에 평가 example이 들어갔을 가능성은 남는다. 군집 경계도 연구자의 분류 판단에 의존한다.

## 3단계 — 기술과 근거

### 137B LaMDA-PT를 전체 미세조정했다

기반 모델 LaMDA-PT는 137B parameter의 dense left-to-right decoder-only Transformer다. web 문서·대화·Wikipedia 등을 2.49T BPE token으로 사전 학습했고, 약 10%만 non-English였다. FLAN은 dataset당 최대 30k example을 사용하고 30k gradient step, batch 8,192 token, Adafactor, learning rate $3\times10^{-5}$, input 1,024·target 256 token으로 전체 모델을 미세조정했다. TPU v3 128 core에서 약 60시간이 걸렸다.

별도 architecture를 크게 추가하지 않았다는 사실은 일부 parameter만 갱신했다는 뜻이 아니다. raw의 ‘비교적 적은 추가 매개변수’와 ‘기존 능력 위에 skill layer를 더했다’는 설명은 이 실험의 학습 범위를 잘못 전달한다.

### 결과는 template와 비교 조건을 포함한다

연구진은 데이터셋마다 여러 template의 평균과 dev set에서 고른 최상 template를 따로 보고했다. **best-dev template** 조건에서 zero-shot FLAN은 zero-shot GPT-3보다 25개 중 20개 데이터셋에서 높았고, GPT-3 few-shot보다 10개 데이터셋에서 높았다. 초록은 그중 ANLI·RTE·BoolQ·AI2-ARC·OpenbookQA·StoryCloze의 큰 차이를 강조한다.

이 비교에는 서로 다른 사전 학습 model family, prompt와 context length가 함께 들어간다. 20/25를 자연스러운 임의 사용자 표현에 대한 불변 성능이나 실제 제품 만족도로 바꿔 읽을 수 없다.

### 과제 다양성·규모·지시를 따로 바꿔 보았다

| 절제 | 직접 결과 | 안전한 해석 |
|---|---|---|
| 지시 미세조정 군집 1→7개 | 세 보류 군집 평균 49.9→63.5 | 이 순서의 mixture에서는 다양성이 도움; 어느 군집이 어느 과제에 기여했는지는 식별 불가 |
| 모델 422M·2B·8B·68B·137B | 8B 이하는 보류 성능 악화, 68B·137B는 개선 | 특정 model family·분할의 부호 반전; 보편적 임계 규모나 내부 상전이의 증거는 아님 |
| 자연어 지시 제거·dataset 이름 대체 | 지시 55.2, 무지시 37.3, dataset 이름 46.6/47.0 | 다과제 학습량만이 아니라 instruction text가 이 설정의 zero-shot 결과에 기여 |
| 학습·추론에 few-shot exemplar 형식 적용 | 모든 평가 군집에서 zero-shot FLAN보다 개선 | 별도 few-shot-format 지시 미세조정과 보류 과제의 문맥 내 예시를 결합 가능 |

이 규모 절제는 같은 기반 model family 안에서 instruction-tuning 개입 전후를 비교한다는 장점이 있다. 그러나 다섯 관측점과 한 cluster split만으로 일반적인 ‘지시 능력 창발점’을 확정하지 않는다.

§4.4의 few-shot 조건은 zero-shot checkpoint에 추론 예시만 붙인 비교가 아니다. 학습 과제에서도 최대 16개 exemplar를 넣은 형식으로 모델을 미세조정했고, 보류 과제의 exemplar만 inference에서 처음 제공했다. 따라서 개선을 inference-time 예시 하나의 효과로 귀속하지 않는다.

### 직접 실험하지 않은 실용 서사를 분리한다

FLAN 논문은 짧은 benchmark 지시, 과제별 accuracy·F1·exact match·BLEU 등을 사용했다. 실제 사용자의 장기 대화, 만족도, latency, 운영 비용, 사실성, 유해 출력과 배포 생산성을 통합 평가하지 않았다. 연구진도 한 문장가량의 짧은 지시, 주관적인 군집 분류, 잠재적 pretraining 중복, 137B serving 비용과 bias 전파를 한계로 적었다. FAQ에는 두 번째 단어 반환과 덴마크어 응답 같은 단순 사례의 실패, 1,024-token 문맥과 English 중심 학습도 나온다.

후대 ChatGPT·GPT-4·Claude·multimodal system과의 개념적 연결은 있을 수 있지만, FLAN checkpoint·data가 직접 이어졌거나 모두 동일한 학습 pipeline을 썼다는 증거는 아니다.

## 검증과 한계

### 검증 정정

- **Google이 지시 튜닝을 처음 발명했다**: FLAN 자체가 선행 instruction·QA formulation 연구를 인정하며, Natural Instructions의 최초 preprint도 FLAN보다 앞선다.
- **하나의 모델이 수백 과제를 익혔다**: 원 FLAN은 62개 dataset·12개 군집이다. ‘수백’은 이 실험의 수치가 아니다.
- **한 checkpoint가 25개 zero-shot 결과를 모두 냈다**: 각 평가 군집을 뺀 별도 checkpoint를 만들었다.
- **zero-shot이므로 표지 자료를 쓰지 않았다**: 현재 보류 과제의 demonstration은 없지만 다른 과제의 지도 example로 전체 모델을 미세조정했다.
- **FLAN은 T5 기반이다**: 원 2021 FLAN은 decoder-only LaMDA-PT다. 원 [[T5]]의 encoder–decoder checkpoint를 사용하지 않았다.
- **적은 추가 parameter만 학습했다**: architecture를 거의 바꾸지 않았지만 전체 model을 30k step 미세조정했다.
- **prompt 표현에 견고해 prompt engineering이 사라졌다**: 수작업 template의 평균과 best-dev 결과가 달랐고, 특정 template 선택은 여전히 성능 조건이다.
- **QA 학습이 요약을 향상한 구체 인과가 입증됐다**: cluster 수 절제는 평균 이득을 보였지만 어느 cluster가 어느 보류 과제에 기여했는지 식별하지 못했다.
- **모든 규모에서 일반 능력을 보존한다**: 8B 이하 조건에서는 보류 과제 성능이 악화됐다.
- **지시 따르기가 곧 안전 정렬이다**: FLAN은 정답 target의 supervised mixture다. InstructGPT의 사람 시연·선호 순위·reward model·PPO와 같지 않다.
- **2021년에 정식 논문으로 발표됐다**: arXiv 최초 공개는 2021년 9월이고 정식 발표는 ICLR 2022다.

### 남는 한계

FLAN의 강한 결론은 137B LaMDA-PT, 62개 dataset, 짧은 English 중심 template와 정한 task-cluster split에 조건화된다. 모델 내부가 지시 의미나 과제 동등성을 사람처럼 표상했다는 인과는 식별하지 않는다. 여러 metric의 개선도 하나의 공통 ‘지시 따르기 점수’가 아니다.

raw의 Self-Instruct·ChatGPT·GPT-4·Claude·multimodal 확장은 후대 자료가 필요한 계보이다. Self-Instruct는 2022년 arXiv·2023년 ACL 연구이고, 지시·instance 생성 뒤 filtering을 거친다. 상용 모델의 세부 자료와 단계는 공개 범위가 서로 다르므로 모두 같은 FLAN식 절차라고 단정하지 않는다.

## 학습 확인

### 확인 질문

1. FLAN zero-shot과 GPT-3 문맥 내 zero-shot은 과제 정보가 가중치에 들어가는 시점에서 어떻게 다른가?
2. 25개 결과가 하나의 checkpoint에서 나오지 않았다는 사실이 ‘범용 모델’ 해석을 어떻게 제한하는가?
3. 8B 이하와 68B 이상에서 개입 효과의 부호가 달랐다는 결과를 보편적 창발 임계점으로 부를 수 없는 이유는 무엇인가?

### 다음 문서

- [[지시 미세조정]] — FLAN의 한 실험을 넘어 task-specific fine-tuning·문맥 내 학습·RLHF와의 경계를 개념으로 정리한다.
- [[손실 곡선과 능력 곡선 사이]] — 규모별 점수 부호 반전과 능력 임계점 주장을 metric·표본·개입 조건으로 다시 읽는다.

## 출처

- Jason Wei 외, [Finetuned Language Models Are Zero-Shot Learners](https://openreview.net/forum?id=gEZrGCozdqR), ICLR 2022, 초록과 §§1–6, Figures 1–10, Appendices C·D 및 FAQ.
- Maarten Bosma·Jason Wei, [Introducing FLAN: More generalizable Language Models with Instruction Fine-Tuning](https://research.google/blog/introducing-flan-more-generalizable-language-models-with-instruction-fine-tuning/), Google Research, 2021-10-06.
- Swaroop Mishra 외, [Cross-Task Generalization via Natural Language Crowdsourcing Instructions](https://aclanthology.org/2022.acl-long.244/), ACL 2022, pp. 3470–3487; arXiv v1 2021-04-18.
- Yizhong Wang 외, [Self-Instruct: Aligning Language Models with Self-Generated Instructions](https://aclanthology.org/2023.acl-long.754/), ACL 2023, §§2–3·8; arXiv v1 2022-12-20.
- Long Ouyang 외, [Training language models to follow instructions with human feedback](https://arxiv.org/abs/2203.02155), 2022, §§1·3.1–3.2.
- 프로젝트 번역·검토 출발 자료: [Instruction Tuning: Adapting Language Models to Follow Explicit Instructions](https://mbrenndoerfer.com/writing/instruction-tuning-adapting-language-models-to-follow-explicit-instructions)
- 프로젝트 보존 자료: `raw/072_Instruction Tuning Adapting Language Models to Follow Explicit Instructions.ko.md`, `raw/072_Instruction Tuning Adapting Language Models to Follow Explicit Instructions.commentary.ko.md`.

## 관련 항목

- [[지시 미세조정]]
- [[063_T5와 Text-to-Text 통합 프레임워크]]
- [[067_GPT-3와 문맥 내 학습]]
- [[T5]]
- [[문맥 내 학습]]
- [[언어 모델 전이 학습]]
- [[인간 피드백 강화학습]]
- [[사전 학습 지식은 과제에 어떻게 도착하는가]]
- [[손실 곡선과 능력 곡선 사이]]
