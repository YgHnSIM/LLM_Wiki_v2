---
schema_version: 3
id: source.094
page_type: source
title: 헌법적 AI와 자기비평·AI 피드백 정렬
aliases:
  - 094_Constitutional AI Principle-Based Alignment Through Self-Critique
  - 'Constitutional AI: Harmlessness from AI Feedback'
  - Constitutional AI와 RLAIF
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
  - raw/094_Constitutional AI Principle-Based Alignment Through Self-Critique.ko.md
  - raw/094_Constitutional AI Principle-Based Alignment Through Self-Critique.commentary.ko.md
evidence:
  - source_id: bai-et-al-2022-constitutional-ai
    locator: 'Abstract, §§1–4·6과 Figures 1–9·Appendices B–C·E의 2022년 공개 시점, 438개 HHH 비교, SL-CAI·RL-CAI 자료·절차·원칙·Elo 평가·비평·Goodharting·한계'
    relation: supports
  - source_id: anthropic-2023-claudes-constitution
    locator: '2023-05-09, Context·What is Constitutional AI?·What’s in the Constitution?·The Principles in Full의 Claude 적용, 논문 대비 갱신 원칙과 UDHR 등 출처'
    relation: contextualizes
  - source_id: anthropic-cip-2023-collective-cai
    locator: '2023-10-17, Designing a Public Input Process·Training and Evaluating a Model·Lessons Learned의 약 1,000명·1,127개 진술·38,252표, Public/Standard model과 참여·편집 한계'
    relation: contextualizes
relations:
  - target: concept.헌법적-ai
    kind: related
  - target: source.056
    kind: related
learning:
  difficulty:
    entry: intermediate
    target: intermediate
  prerequisites:
    - target: concept.rlhf
    - target: source.077
  assumed_knowledge: 없음
  outcomes:
    - '2022년 논문의 SL-CAI와 RL-CAI를 구분하고, AI가 만든 유해성 선호와 사람이 만든 유용성 선호가 어떻게 합쳐졌는지 설명하며, 명시적 원칙의 가독성을 모델 내부의 도덕 추론이나 완전한 해석 가능성과 구별할 수 있다.'
  next:
    - target: analysis.평가-지표와-모델-유인
      reason: 자동 평가 지표는 무엇을 보상하는가 — 학습된 평가자 점수가 정책의 보상이 될 때 proxy와 Goodharting 위험을 넓게 살핀다.
---
# 헌법적 AI와 자기비평·AI 피드백 정렬

> [!note] 학습 안내
> **난이도:** 중급<br>
> **선수 지식:** [[concept.rlhf|인간 피드백 강화학습]], [[source.077|InstructGPT와 인간 선호 정렬]]<br>
> **읽고 나면:** 2022년 논문의 SL-CAI와 RL-CAI를 구분하고, AI가 만든 유해성 선호와 사람이 만든 유용성 선호가 어떻게 합쳐졌는지 설명하며, 명시적 원칙의 가독성을 모델 내부의 도덕 추론이나 완전한 해석 가능성과 구별할 수 있다.

## 1단계 — 먼저 잡을 핵심

### 출발점은 2023년 제품이 아니라 2022년 연구였다

Bai 등은 *Constitutional AI: Harmlessness from AI Feedback*을 2022년 12월 15일 공개했다. 이 연구가 다룬 문제는 사람에게 **유해성 비교 레이블**을 직접 받지 않고도, 유해한 요청에 상투적으로 침묵하지 않으면서 비교적 무해하게 응답하는 대화형 비서를 훈련할 수 있는가였다. 따라서 헌법적 AI를 2023년에 처음 등장한 방법이라고 부르면 논문과 제품 공개 시점을 섞게 된다.

여기서 [[헌법적 AI]](Constitutional AI, CAI)는 하나의 고정된 윤리 규칙집이나 단일 최적화 알고리즘이 아니다. 자연어 원칙을 응답 비평·수정과 후보 비교에 사용해 합성 학습 자료와 선호 신호를 만드는 방법 계열이다. 2022년 논문은 이를 **지도학습 단계**(SL-CAI)와 **강화학습 단계**(RL-CAI)로 나눴다. RL-CAI에서 AI가 생성한 선호 레이블로 보상 모델을 학습하고 정책을 최적화하는 부분이 AI 피드백 기반 강화학습(Reinforcement Learning from AI Feedback, RLAIF)이다.

### 방법, 연구용 헌법과 Claude 헌법을 나눈다

| 공개 시점 | 확인되는 대상 | 원칙과 적용 범위 |
| --- | --- | --- |
| 2022-12-15 | Bai 등의 CAI 논문 | SL 비평·수정용 16개와 RL 후보 비교용 16개의 별도 원칙을 사용했다. 저자들은 연구 목적으로 다소 임의적으로 고른 원칙이라고 밝혔다. |
| 2023-05-09 | Anthropic의 *Claude’s Constitution* | Claude가 논문의 원칙에서 갱신한 별도 집합을 사용한다고 설명하고, 세계인권선언(UDHR)·신뢰와 안전 실무·Sparrow 원칙·비서구적 관점을 출처로 제시했다. |
| 2023-10-17 | Anthropic·Collective Intelligence Project의 집단 헌법 실험 | 약 1,000명의 미국 참여자가 낸 1,127개 진술과 38,252표를 바탕으로 Public constitution model을 시험했다. 참여자 선별·중재·중복 제거·문구 변환에는 연구진의 판단이 남았다. |

그러므로 “헌법적 AI라는 방법”, “2022년 연구의 16+16개 원칙”, “2023년 시점의 Claude용 갱신 헌법”과 “대중 의견을 활용한 후속 실험”은 같은 문서도 아니고 같은 model checkpoint도 아니다. 특히 UDHR 기반 원칙을 2022년 논문의 헌법으로 소급하면 안 된다.

### 핵심 문장

- SL-CAI는 `초기 응답 → 원칙에 따른 비평 → 수정`을 네 차례 반복해 만든 응답으로 지도 미세조정한다.
- RL-CAI는 SL-CAI의 후보 두 개를 원칙으로 비교한 AI 유해성 선호를 만들고, 기존 사람 유용성 선호와 함께 선호 모델을 학습한 뒤 그 점수를 보상으로 사용한다.
- “사람 레이블 없음”은 유해성 레이블에 한정된다. 출발점인 helpful RLHF 정책, 사람 유용성 선호, 사람이 쓴 일부 프롬프트·원칙·예시와 군중 작업자 평가는 남아 있었다.
- 자연어 헌법은 목표를 읽고 수정하기 쉽게 하지만, 모델 내부 계산이 해석되거나 출력 비평이 실제 의사결정의 인과를 충실히 설명한다는 뜻은 아니다.
- 논문의 결과는 당시 model 계열·레드팀 대화 분포·평가 지침 아래의 유용성·유해성·회피성 비교다. 모든 가치 갈등과 새로운 공격 환경에서의 정렬을 입증하지 않는다.

## 2단계 — 작동 원리

### SL-CAI는 비평을 학습 자료로 바꾼다

SL-CAI의 자료 생성 흐름은 다음과 같다.

1. 사람 피드백으로 이미 학습된 helpful RLHF 정책에 레드팀 프롬프트를 주고 초기 응답을 샘플링한다.
2. 비평용 16개 원칙 가운데 하나를 무작위로 뽑아 응답의 구체적인 문제를 지적하게 한다.
3. 모델이 그 원칙과 비평을 참고해 응답을 다시 쓰게 한다.
4. 다른 원칙을 다시 뽑아 비평과 수정을 이어 가며, 각 프롬프트에서 총 네 개의 비평–수정 쌍을 만든다.
5. 네 수정 단계의 응답과 유용성 유지용 응답을 모아 별도의 사전 학습 model을 한 epoch 지도 미세조정한다.

논문은 사람이 쓴 레드팀 프롬프트 42,496개와 model이 생성한 140,335개, 합계 182,831개를 사용했다. 각 프롬프트에서 비평–수정 쌍을 네 번 샘플링했다. 유용성을 유지하기 위해 사람이 쓴 유용성 프롬프트 135,296개에도 helpful RLHF 정책이 프롬프트마다 두 응답을 생성했다. 합성 유해성 자료만 학습한 것이 아니라 사람 프롬프트와 기존 RLHF 정책의 응답을 함께 사용한 셈이다.

비평은 최종 사용자의 요청마다 실행해야 하는 배포 시점 필터가 아니다. 이 논문의 주된 쓰임은 더 무해한 지도 미세조정 자료를 만드는 것이었다. 저자들은 큰 model에서는 비평을 거쳐 수정한 경우와 비평 없이 바로 수정한 경우의 유해성 점수 차이가 작았고, 52B model의 비평도 종종 부정확하거나 과장됐다고 기록했다. 비평 문장의 설득력보다 수정 뒤 행동과 독립 평가를 봐야 한다.

### RL-CAI는 AI 비교를 별도 보상 모델에 압축한다

RL-CAI의 흐름은 다음처럼 구분할 수 있다.

$$
(x,y_A,y_B,c)
\xrightarrow{\text{feedback model}}
p(A\succ B\mid x,c)
\xrightarrow{\text{preference model}}
r_\phi(x,y)
\xrightarrow{\text{RL}}
\pi_\theta
$$

$x$는 프롬프트, $y_A,y_B$는 SL-CAI가 만든 두 후보 응답, $c$는 RL 후보 비교용 16개 원칙 중 무작위로 고른 하나다. Feedback model은 어느 응답이 원칙에 더 잘 맞는지 객관식으로 판정하고, 두 선택지에 부여한 정규화 확률을 소프트 유해성 선호 레이블로 저장한다. 이 AI 유해성 레이블을 사람의 유용성 선호 레이블과 섞어 preference model $r_\phi$를 학습한 뒤, SL-CAI에서 시작한 정책 $\pi_\theta$가 그 대리 점수를 높이도록 강화학습한다.

기본 실험은 사전 학습 model을 feedback model로 썼고, 연쇄적 사고(CoT) 변형에서는 helpful RLHF model을 사용했다. CoT가 만든 선택 확률이 0이나 1에 지나치게 가까워지자 연구진은 40–60% 범위로 제한했을 때 학습이 더 안정적이라고 보고했다. 이는 AI의 판정 확률도 자동으로 잘 보정된 진실 신호가 아니라는 증거다.

통제 실험의 RL run은 SL-CAI에 사용한 사람·model 생성 프롬프트에 더해 model이 생성한 레드팀 프롬프트 491,142개와 유용성 프롬프트 474,300개를 추가로 사용했다. AI 레이블은 빠르게 늘릴 수 있지만, labeler model과 정책이 비슷한 편향을 공유하면 오류도 같은 규모로 복제될 수 있다.

### 인간 신호는 사라지지 않고 위치가 바뀌었다

| 파이프라인 위치 | 사람에게서 온 신호 | AI가 확장한 부분 |
| --- | --- | --- |
| 출발 정책 | Helpful RLHF 정책의 사람 선호 학습 | 레드팀 응답과 유용성 응답 생성 |
| SL 자료 | 42,496개 레드팀 프롬프트, 135,296개 유용성 프롬프트, 원칙·소수 예시 | 140,335개 레드팀 프롬프트, 네 차례 비평·수정 |
| RL 선호 | 사람의 유용성 비교 레이블과 원칙·예시 | 원칙에 조건화된 유해성 후보 비교 |
| 최종 평가 | 군중 작업자의 유용성·유해성 선호 | Model별 후보 생성과 학습 snapshot 반복 |

따라서 CAI는 [[인간 피드백 강화학습]]의 단순한 반대말이 아니다. [[077_InstructGPT와 인간 선호 정렬|InstructGPT]]가 사람의 순위를 보상 모델로 압축했다면, RL-CAI는 **유해성 순위의 생성자**를 원칙에 조건화된 model로 바꾸되 사람 유용성 레이블과 RLHF 출발 정책을 유지한 혼합 파이프라인이다.

## 3단계 — 기술과 근거

### 자료와 평가의 분모를 분리한다

| 역할 | 정확한 규모 | 무엇을 세는가 |
| --- | ---: | --- |
| HHH 판별 평가 | 기존 221개 + 새로 작성한 217개 = 438개 | 두 응답 가운데 더 helpful·honest·harmless한 쪽을 고르는 이진 비교 |
| SL 레드팀 입력 | 사람이 작성한 42,496개 + model 생성 140,335개 = 182,831개 | 초기 응답과 네 단계 비평·수정을 만드는 프롬프트 |
| SL 유용성 입력 | 사람이 작성한 135,296개 | Helpful RLHF model이 프롬프트마다 두 응답을 생성 |
| RL 추가 입력 | model 생성 레드팀 491,142개·유용성 474,300개 | SL 자료에 더해 모든 통제 RL run이 공유한 추가 프롬프트 |
| Model A/B 평가 | 유용성 10,274개·유해성 8,135개 | Figures 2–3의 24개 학습 snapshot에 대한 군중 작업자 비교 |

438개 HHH 항목은 feedback model이 후보의 상대적 유해성을 판별할 잠재력을 본 소규모 진단이다. 반면 10,274개와 8,135개는 정책 snapshot의 Elo를 계산한 별도 A/B 비교다. 학습 프롬프트 수, AI가 만든 선호 레이블 수, 사람의 최종 평가 수를 하나의 “annotation 규모”로 합치지 않는다.

### 결과는 평가 지침과 model 계열에 조건화됐다

논문은 SL-CAI가 사전 학습 model보다 유용성과 무해성 양쪽에서 나아졌지만, 비교한 RL model들보다는 유용성이 낮았다고 보고했다. RL-CAI는 해당 군중 작업자 평가에서 RLHF와 SL-CAI보다 높은 무해성 Elo를 보였고, 유해한 요청에도 이유를 설명하며 대화를 이어 가는 비회피적 경향을 보였다. 이는 원칙에 조건화한 합성 피드백이 실제 정책 행동을 바꿀 수 있음을 보여 주는 핵심 결과다.

그러나 작업자는 두 응답이 비슷하게 무해하면 더 사려 깊고 덜 회피적인 쪽을 선호하도록 지시받았다. 이전 RLHF 연구와 평가 지침·작업자 공급원도 달랐다. Elo 차이는 model 학습법만의 순수한 효과가 아니라 프롬프트 분포, sampling, 평가 규칙과 함께 읽어야 한다. 실험한 대화 model은 최대 52B였으며, 인간 훈련자보다 더 강한 시스템을 실제로 감독한 시험은 아니었다.

### 16+16개 원칙은 하나의 보편 윤리 목록이 아니었다

SL-CAI의 비평·수정에는 16개, RL-CAI의 후보 비교에는 별도의 16개 원칙이 쓰였다. 저자들은 이 원칙들을 연구 목적으로 다소 임의적으로 골랐다고 밝혔다. 원칙 수를 늘려도 preference-model 유해성 점수가 뚜렷하게 좋아지지는 않았고, 연구진은 주로 수정 응답의 다양성과 RL 탐색에 도움이 될 가능성을 제시했다.

2023년 공개 Claude 헌법의 UDHR·신뢰와 안전 실무·Sparrow·비서구적 관점 원칙은 후속 갱신판이다. 그 공개는 목표의 출처와 문구를 읽고 비판할 가능성을 넓혔지만, Claude의 실제 응답이 각 원칙을 얼마나 지키는지나 2022년 논문의 어느 checkpoint에서 직접 이어졌는지를 입증하지 않는다.

### 읽을 수 있는 목표와 내부 해석 가능성은 다르다

헌법적 AI가 높인 투명성은 최소 두 층에 있다. 첫째, 개발자가 선언한 행동 목표를 자연어 원칙으로 읽고 수정할 수 있다. 둘째, 어떤 원칙이 특정 비평·수정·선호 레이블을 생성했는지 data lineage를 기록할 수 있다. 그러나 생성된 비평이나 거절 설명이 model 내부의 실제 인과를 충실히 보고하는지는 별도 해석 가능성 문제다.

이 구분은 [[자동 평가 지표는 무엇을 보상하는가]]의 proxy 문제와도 이어진다. Preference model은 원칙 자체가 아니라 feedback model이 만든 비교를 일반화하며, 정책은 그 예측 점수를 직접 최적화한다. 연구진은 RL-CAI를 지나치게 학습했을 때 유해한 질문에 과도하게 가혹해지거나 여러 상황에서 비슷한 위로 문구를 되풀이하는 Goodharting을 관찰했다. 명시적 원칙도 보상 모델의 사각지대와 분포 이동을 없애지는 않는다.

## 검증과 한계

### raw 설명의 검증 정정

- **헌법적 AI는 2023년에 도입됐다:** 핵심 논문은 2022년 12월 공개됐다. 2023년은 Claude의 갱신 헌법과 후속 참여 실험이 공개된 시기다.
- **외부 인간 감독을 내면화된 윤리 추론으로 바꾼 패러다임 전환이다:** 논문은 유해성 레이블 생성 위치를 사람에서 원칙에 조건화된 model로 옮겼다. Model 내부에 윤리적 이해가 형성됐다는 인과적 증거는 제시하지 않았다.
- **RLAIF는 인간 선호와 RLHF를 대체한다:** 유해성 비교는 AI가 만들었지만 helpful RLHF 출발 정책, 사람 유용성 선호, 사람이 작성한 프롬프트·원칙·예시와 최종 평가는 남았다.
- **자기비평은 모든 응답을 배포 중에 계속 검사한다:** 2022년 논문에서 비평·수정의 주된 역할은 지도 미세조정 자료 생성이다. 같은 네 단계 loop를 매 추론 때 실행해야 하는 구조가 아니다.
- **Model이 원칙을 인용하면 행동 이유가 해석된다:** 목표와 data trace가 읽기 쉬워지는 것과 내부 계산의 인과적 해석은 다르다. 부정확하거나 과장된 비평도 관찰됐다.
- **헌법은 처음부터 인권 문서와 전문 윤리 강령을 종합했다:** 2022년 연구는 별도의 16+16개 임의 원칙을 사용했다. UDHR 등 출처를 명시한 것은 2023년 Claude의 갱신 헌법이다.
- **사람 annotation 비용 병목과 인간을 능가한 model 감독 문제를 해결했다:** 논문은 유해성 레이블을 자동 생성할 가능성을 보였지만, 완전한 비용 비교나 인간보다 강한 system에 대한 감독 실험을 하지 않았다. 이는 동기와 연구 방향이지 완료된 결과가 아니다.
- **Claude가 논문 checkpoint의 성능을 그대로 입증했다:** 2023년 공식 글은 Claude가 CAI와 갱신 원칙을 사용한다고 밝혔지만, 제품 model을 논문의 52B snapshot 가운데 하나로 식별하지 않는다.
- **헌법 설계가 민주화됐고 산업 표준이 됐다:** 2023년 집단 헌법 연구는 약 1,000명의 미국 참여자를 대상으로 한 예비 실험이다. 참가자 선별, 21개 seed 문장, CIP의 중재, 중복 제거·결합과 CAI 형식으로의 번역에 연구진 판단이 개입했다. 세계 대표성이나 산업 표준화를 입증하지 않는다.

### 비평·보상·강건성·가치의 네 경계

1. **비평의 충실성:** 52B model의 비평도 종종 부정확하거나 과장됐다. 수정 후 평균 행동이 나아지는 것과 비평이 실제 오류 원인을 찾아냈다는 것은 다른 주장이다.
2. **대리 보상의 Goodharting:** Preference model은 AI 비교를 압축한 proxy다. RL을 과도하게 진행하면 가혹한 반응·상투적인 문구처럼 점수에 유리하지만 사람이 원한 행동과 다른 패턴이 생겼다.
3. **분포 밖 강건성:** 논문은 정해진 레드팀 대화와 당시 model 계열을 평가했다. 새로운 언어, 장기 대화, tool 사용, jailbreak와 적대적 분포에서 같은 효과가 유지되는지는 입증하지 않았다.
4. **가치 선택과 충돌:** 유용성·무해성·정직성, 사생활·표현, 개인·집단 원칙은 충돌할 수 있다. 자연어 문구는 누가 원칙을 고르고 우선순위를 정할지라는 정치적·제도적 판단을 없애지 않는다.

### 후속 공개는 가능성과 통제 지점을 함께 드러냈다

2023년 Collective CAI 실험은 대중 의견이 실제 constitution과 model 학습으로 이어질 수 있음을 시험했다. 동시에 약 1,000명의 미국 표본, AI에 익숙한 참가자 screening, 1,127개 진술·38,252표, 일방 중재와 275개 유효 진술의 중복 제거·결합, 최종 CAI 문구 변환이라는 여러 관문을 공개했다. 참여가 늘어도 누구의 의견이 들어오고 누가 최종 문구를 편집하는지 감사해야 한다.

Public constitution model과 Anthropic-written Standard constitution model은 시험한 MMLU·GSM8K와 사람 유용성·유해성 평가에서 유의한 차이가 없었고, BBQ의 아홉 사회 차원에서는 Public model의 편향 점수가 더 낮았다. 연구진 자신도 평가 묶음이 작고 명확한 차이는 제한적이었다고 적었다. 이는 “대중이 model 가치를 민주적으로 결정했다”는 완성된 제도보다, 원칙 작성과 학습 사이에 어떤 기술적·편집적 선택이 생기는지 보여 준 예비 실험으로 읽어야 한다.

## 학습 확인

### 확인 질문

1. SL-CAI의 네 차례 비평·수정과 RL-CAI의 후보 비교·preference model·RL은 각각 어떤 자료와 model을 바꾸는가?
2. “유해성에 대한 사람 레이블 없음”이라는 설명이 정확히 적용되는 단계는 어디이며, 사람 유용성 선호와 helpful RLHF 정책은 왜 남아 있는가?
3. 공개 헌법의 목표 가독성, 생성된 비평의 추적 가능성과 model 내부 의사결정의 인과적 해석 가능성은 어떻게 다른가?

### 다음 문서

- [[analysis.평가-지표와-모델-유인|자동 평가 지표는 무엇을 보상하는가]] — 학습된 평가자 점수가 정책의 보상이 될 때 proxy와 Goodharting 위험을 넓게 살핀다.

## 출처

- Yuntao Bai 외, [Constitutional AI: Harmlessness from AI Feedback](https://arxiv.org/abs/2212.08073), 2022-12-15, Abstract, §§1–4·6, Figures 1–9, Appendices B–C·E.
- Anthropic, [Claude’s Constitution](https://www.anthropic.com/news/claudes-constitution), 2023-05-09, Context, What is Constitutional AI?, What’s in the Constitution?, The Principles in Full.
- Anthropic·Collective Intelligence Project, [Collective Constitutional AI: Aligning a Language Model with Public Input](https://www.anthropic.com/news/collective-constitutional-ai-aligning-a-language-model-with-public-input), 2023-10-17, Designing a Public Input Process, Training and Evaluating a Model, Lessons Learned.
- 프로젝트 번역·검토 출발 자료: Michael Brenndoerfer, [Constitutional AI: Principle-Based Alignment Through Self-Critique](https://mbrenndoerfer.com/writing/constitutional-ai-principle-based-alignment-through-self-critique), 2025.
- 프로젝트 보존 자료: `raw/094_Constitutional AI Principle-Based Alignment Through Self-Critique.ko.md`, `raw/094_Constitutional AI Principle-Based Alignment Through Self-Critique.commentary.ko.md`.

## 관련 항목

- [[analysis.평가-지표와-모델-유인|자동 평가 지표는 무엇을 보상하는가]]
- [[concept.rlhf|인간 피드백 강화학습]]
- [[source.077|InstructGPT와 인간 선호 정렬]]
- [[concept.헌법적-ai|헌법적 AI]]
- [[source.056|RLHF 토대와 인간 선호 기반 보상 학습]]
