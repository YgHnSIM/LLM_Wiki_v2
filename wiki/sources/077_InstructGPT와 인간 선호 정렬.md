---
schema_version: 3
id: source.077
page_type: source
title: InstructGPT와 인간 선호 정렬
aliases:
  - InstructGPT and RLHF Aligning Language Models with Human Preferences
  - Training Language Models to Follow Instructions with Human Feedback
  - InstructGPT와 RLHF
tags:
  - type/source
  - domain/ai
  - domain/computer-science
  - domain/nlp
  - domain/machine-learning
created: '2026-07-21'
updated: '2026-07-21'
editorial_status: active
review:
  evidence_coverage: verified
  content_mode: descriptive
artifacts:
  - raw/077_InstructGPT and RLHF Aligning Language Models with Human Preferences.ko.md
  - raw/077_InstructGPT and RLHF Aligning Language Models with Human Preferences.commentary.ko.md
evidence:
  - source_id: ouyang-et-al-2022-instructgpt
    locator: '초록, §§3.1–3.6와 Figure 2·Table 6의 SFT·4–9개 응답 순위·reward model·SFT 기준 KL·PPO/PPO-ptx, §§4.1–4.4와 Figures 3–7·9의 인간 선호·TruthfulQA·toxicity·bias·단순 오류, §§5.1–5.5와 Appendices A–C·E의 자료·평가자 대표성·계산량·성능 회귀·오용 한계'
    relation: supports
relations:
  - target: source.056
    kind: related
  - target: source.067
    kind: related
  - target: source.072
    kind: related
  - target: concept.지시-미세조정
    kind: related
  - target: analysis.사전-학습-지식은-과제에-어떻게-도착하는가
    kind: related
learning:
  difficulty:
    entry: intermediate
    target: intermediate
  prerequisites:
    - target: concept.대규모-언어-모델
  assumed_knowledge: 없음
  outcomes:
    - 'InstructGPT의 시연 SFT→응답 순위 보상 모델→PPO-ptx 흐름을 설명하고, 평가자 선호 우위와 보편적 가치·능력·안전성 주장을 구분할 수 있다.'
  next:
    - target: concept.rlhf
      reason: 인간 피드백 강화학습 — InstructGPT 한 사례를 2017년 행동 비교부터 후속 선호 최적화까지의 개념적 계보로 넓힌다.
    - target: analysis.평가-지표와-모델-유인
      reason: 자동 평가 지표는 무엇을 보상하는가 — 고정 metric과 학습된 보상 모델을 최적화할 때 proxy의 사각지대가 어떻게 모델의 유인이 되는지 비교한다.
---
# InstructGPT와 인간 선호 정렬

> [!note] 학습 안내
> **난이도:** 중급<br>
> **선수 지식:** [[concept.대규모-언어-모델|대규모 언어 모델]]<br>
> **읽고 나면:** InstructGPT의 시연 SFT→응답 순위 보상 모델→PPO-ptx 흐름을 설명하고, 평가자 선호 우위와 보편적 가치·능력·안전성 주장을 구분할 수 있다.

## 1단계 — 먼저 잡을 핵심

### 규모를 키우는 일과 행동을 맞추는 일은 다른 축이다

Ouyang 등은 2022년 GPT-3 계열 모델에 평가자 시연과 응답 순위를 이용한 [[인간 피드백 강화학습]](Reinforcement Learning from Human Feedback, RLHF)을 적용했다. 이름은 InstructGPT다. 연구 질문은 사전 학습 모델의 지식을 늘리는 것보다, 이미 가진 능력이 사용자의 지시에서 **더 도움이 되는 행동으로 드러나게 할 수 있는가**였다.

핵심 결과는 1.3B InstructGPT 응답이 같은 평가 절차에서 175B GPT-3보다 선호됐다는 것이다. 이는 1.3B 모델이 모든 지식·추론 과제에서 더 유능하다는 뜻이 아니다. 모델 크기와 사용자에게 선호되는 응답 형식·행동이 같은 축이 아님을 보여 준다.

### 핵심 문장

- InstructGPT는 평가자 시연으로 지도 미세조정(Supervised Fine-Tuning, SFT)하고, 4–9개 응답 순위에서 보상 모델을 학습한 뒤, 그 보상을 PPO로 최적화했다.
- PPO의 토큰별 KL 패널티는 원 사전 학습 GPT-3가 아니라 **SFT 기준 정책**에서의 이탈을 벌했다.
- 논문에서 보통 InstructGPT라 부른 PPO-ptx는 KL 패널티와 별도로 사전 학습 자료의 기울기를 섞어 일부 공개 NLP 과제의 성능 회귀를 줄였다.
- 인간 선호는 보편적 가치가 아니라 약 40명의 계약 평가자, 연구자 지침과 96% 이상 영어인 API Playground 고객 프롬프트 분포에 조건화됐다.
- 해로운 지시를 안정적으로 거절하지 못한 것이 가장 큰 한계였다. 정중한 지시에서 독성이 줄어도 완전한 안전성이나 무해성을 뜻하지 않는다.

### 2022년의 역사적 위치

InstructGPT가 세 단계 RLHF를 처음 발명한 것은 아니다. [[056_RLHF 토대와 인간 선호 기반 보상 학습]]이 다루듯 Christiano 등은 2017년 행동 구간 비교에서 보상을 학습했고, Ziegler 등은 2019년 언어 모델 출력에 이를 적용했으며, Stiennon 등은 2020년 요약 응답 비교·보상 모델·PPO 정책을 실증했다.

InstructGPT의 공헌은 이 계보를 광범위한 실제 지시 분포와 GPT-3의 1.3B·6B·175B 세 규모에 적용하고, 사람의 선호·진실성 proxy·독성·편향·공개 NLP 과제를 함께 평가한 데 있다. OpenAI 공개 글은 2022년 1월 27일 나왔고, 논문 arXiv 초판은 3월 4일 제출됐으며 NeurIPS 2022에 발표됐다.

## 2단계 — 작동 원리

### 자료는 한 종류가 아니라 세 역할로 나뉜다

연구진은 평가자가 직접 만든 프롬프트와, 초기 InstructGPT 모델을 API Playground에서 사용한 고객 프롬프트를 모았다. Production API 고객 자료를 그대로 쓴 것은 아니다. 고객에게 학습 사용을 고지했고, 학습 split의 모든 프롬프트에는 개인 식별 정보 필터를 적용했다. 공통 접두사 중복 제거와 사용자·조직 단위 분할도 사용했다.

같은 프롬프트를 세 단계에서 동일하게 재사용한 것도 아니다.

| 단계 | 입력 자료 | 사람이 제공한 신호 | 모델이 학습한 것 |
|---|---|---|---|
| SFT | 평가자 작성·고객 프롬프트 | 평가자가 쓴 모범 응답 | 지시–응답 조건부 생성 |
| 보상 모델 | 평가자 작성·고객 프롬프트 | 4–9개 후보 응답의 전체 순위 | 상대 선호를 예측하는 스칼라 점수 |
| PPO | 고객 프롬프트 | 고정된 보상 모델의 점수 | 보상을 높이는 정책 |

### 1단계 — 평가자 시연으로 SFT 정책을 만든다

평가자는 프롬프트에 대해 원하는 행동을 보여 주는 응답을 직접 작성했다. 사전 학습 GPT-3는 이 시연의 다음 토큰 가능도를 높이도록 미세조정됐다. 이 SFT 정책은 그 자체로 GPT-3보다 인간 선호를 개선한 기준선이면서, 보상 모델용 후보를 만들고 PPO를 초기화하며 KL 이탈을 재는 기준이 됐다.

지도 미세조정은 RLHF 전에 잠깐 거치는 형식 단계가 아니다. 모든 상황의 이상적인 응답을 직접 쓰기 어렵다는 coverage 한계가 있지만, 사람이 어떤 지시 수행을 원하는지 양의 예시로 보여 주는 독립적인 학습 신호다.

### 2단계 — 순위를 쌍 비교로 바꾸어 보상 모델을 학습한다

평가자는 하나의 프롬프트에 대한 4–9개 후보 응답을 최선부터 최악까지 순위화했다. 연구진은 동률인 응답 쌍을 제외하고 순위에서 가능한 쌍 비교를 만들었다. 보상 모델 $r_\phi(x,y)$는 프롬프트 $x$와 응답 $y$를 받아, 선호된 응답에 더 높은 스칼라 점수를 주도록 학습됐다.

이 점수는 인간 가치의 절대량이 아니다. 특정 지침 아래 관측한 상대 순위를 예측하는 proxy다. 최종 실험은 6B 보상 모델 하나를 세 크기의 PPO 정책에 공통으로 사용했다. 175B 보상 모델은 불안정성과 계산 비용 때문에 채택하지 않았다.

### 3단계 — 보상, KL 제약과 사전 학습 혼합을 함께 쓴다

PPO 정책 $\pi_\theta$는 프롬프트에 응답하고 보상 모델의 점수를 높이는 방향으로 갱신됐다. 목적의 핵심은 다음 세 항으로 나눠 읽을 수 있다.

1. 현재 응답의 보상 모델 점수를 높인다.
2. 현재 정책과 SFT 기준 정책의 토큰별 로그확률 차이에 KL 패널티를 주어 지나친 이동을 제한한다.
3. PPO-ptx에서는 사전 학습 자료의 다음 토큰 예측 기울기를 섞어 공개 NLP 과제의 회귀를 완화한다.

KL 제약은 SFT 행동 가까이에 정책을 묶고, 사전 학습 혼합은 일부 기존 능력을 보존한다. 두 장치는 역할이 다르며 보상 모델의 오류를 없애거나 실제 인간 의도와의 일치를 보장하지 않는다.

### 평가는 보상 모델 밖의 사람 판단으로 돌아간다

정책이 높은 학습 보상을 받았다는 사실만으로 성공을 판정하지 않았다. 보류한 고객 프롬프트에서 평가자가 두 응답을 비교했고, TruthfulQA·closed-domain hallucination·독성·편향과 공개 NLP 과제도 따로 측정했다. 학습된 proxy와 독립 인간 평가, 과제별 지표가 서로 다른 실패를 볼 수 있게 한 설계다.

## 3단계 — 기술과 근거

### 학습 자료와 평가자 범위

Table 6의 학습 프롬프트 수는 다음과 같다. 보상 모델의 33,207은 쌍 비교 개수가 아니라 순위를 받은 프롬프트 개수다.

| 단계 | 학습 프롬프트 | 평가자 작성 | 고객 작성 |
|---|---:|---:|---:|
| SFT | 12,725 | 11,295 | 1,430 |
| 보상 모델 | 33,207 | 6,623 | 26,584 |
| PPO | 31,144 | 0 | 31,144 |

약 40명의 Upwork·Scale AI 계약 평가자가 선별 과정을 거쳐 참여했다. 자료의 96% 이상은 영어였다. 비용 때문에 대부분의 비교는 평가자 한 명이 표지했다. 따라서 여러 평가자의 합의로 보편적 인간 선호를 측정한 대규모 대표 표본이라고 부를 수 없다.

보상 모델의 선호 예측 정확도는 학습 평가자 집단에서 72.4±0.4%, 보류 평가자 집단에서 69.6±0.9%였다. 보류 집단 결과는 같은 평가 절차 안의 일정한 일반화를 보여 주지만, 더 넓은 문화·사용자 집단의 대표성을 입증하지 않는다.

### 모델·학습 조건

정책은 모두 GPT-3 구조의 1.3B·6B·175B 세 크기였다. PPO는 약 31,000개의 고유한 프롬프트에서 256,000 episode를 사용했다. 독립 SFT 기준선은 16 epoch를 학습했지만, PPO 초기화용 SFT checkpoint는 부록 C.3의 별도 2 epoch·10% 사전 학습 혼합 설정이었다. 두 checkpoint를 같은 훈련물로 단순화하지 않는다.

저자들이 보고한 175B SFT 계산량은 약 4.9 PF-days, PPO-ptx는 약 60 PF-days였고 GPT-3 사전 학습의 약 3,640 PF-days보다 작았다. 인간 표지 비용과 운영 복잡성은 남지만, 이 논문은 RLHF 계산량이 사전 학습보다 커 갱신을 막았다고 실증하지 않았다.

### 인간 선호와 진실성 결과

| 비교·측정 | 결과 | 읽을 때의 경계 |
|---|---:|---|
| 175B InstructGPT vs 175B GPT-3 | 85±3% 선호 | 보류 API 프롬프트와 평가 지침에 조건부 |
| 175B InstructGPT vs few-shot GPT-3 | 71±4% 선호 | 서로 다른 사후 훈련·프롬프트 조건의 행동 비교 |
| 1.3B InstructGPT vs 175B GPT-3 | InstructGPT 선호 | 일반 지식·추론 능력 전체의 우위가 아님 |
| Closed-domain hallucination | 21% vs GPT-3 41% | 지정된 closed-domain 평가의 오류율 |
| TruthfulQA truthful+informative | GPT-3의 약 2배 | 정직성 전체가 아니라 한 proxy benchmark |

주요 선호 결과는 open-ended generation과 brainstorming 비중이 큰 API 사용 분포에서 나왔다. 코드와 비영어 응답은 소수의 정성 예시로 조사했으며 정량 성능을 체계적으로 추적하지 않았다. 이를 코드 생성·여러 언어·모든 응용의 일관된 향상으로 확대하지 않는다.

### 독성·편향·능력 회귀는 서로 다른 결과다

정중한 지시 조건에서 InstructGPT의 독성 출력은 GPT-3보다 약 25% 적었다. 그러나 프롬프트가 없는 조건에서는 우위가 사라졌고, 독성을 요구하는 지시에서는 더 독성 있는 출력을 만들 수 있었다. Winogender와 CrowS-Pairs에서는 유의한 편향 개선이 없었다.

순수 PPO는 일부 공개 NLP 과제에서 성능 회귀를 보였다. PPO-ptx가 이를 대부분 완화했지만 DROP·SQuADv2·번역 등에서는 GPT-3보다 낮은 결과가 남았다. 따라서 “정렬은 능력을 전혀 희생하지 않았다”는 문장은 논문의 과제별 결과를 지운다.

### HHH는 목표 묶음이고 평가는 proxy 묶음이다

논문은 도움됨(helpful), 정직함(honest), 무해함(harmless)을 목표로 제시했다. 그러나 정직함 자체를 직접 관측할 수 없어 TruthfulQA와 hallucination을 사용했고, 무해함 전체 대신 독성·편향 등 일부 proxy를 측정했다. 각 지표의 개선을 HHH 세 속성의 완전한 달성으로 합치지 않는다.

## 검증과 한계

### 원문 상태

Raw 번역은 2025년 회고 글의 서술과 `/writing/...` 탐색 링크를 충실히 보존한다. 이 링크들은 같은 사이트의 후대 해설이며 InstructGPT 논문의 1차 근거가 아니다. 공개 위키는 Ouyang 등 2022년 논문과 공식 자료를 기준으로 수치·절차·한계를 교정한다.

당시 API에 배포된 InstructGPT는 논문 checkpoint 그대로가 아니라 같은 human-feedback data를 조금 다른 절차로 훈련한 갱신판이었다. 논문 수치를 당시 제품 모델의 정확한 성능으로 옮기지 않는다.

### 검증 정정

- **InstructGPT가 세 단계 RLHF를 개척했다:** 논문 §3.1은 Ziegler 2019와 Stiennon 2020의 방법을 따른다고 명시한다. 기여는 광범위한 실제 지시 분포와 세 GPT-3 규모의 적용·평가에 있다.
- **인간 가치에 정렬했다:** 약 40명 평가자, 연구자 지침과 영어 중심 고객 프롬프트 분포의 상대 선호를 학습했다.
- **SFT 자료는 모두 GPT-3 API 고객 프롬프트였다:** SFT 학습 프롬프트 대부분은 평가자가 작성했고, 고객 자료도 초기 InstructGPT를 쓴 Playground 분포였다.
- **쌍 비교를 직접 독립 수집했다:** 4–9개 응답의 전체 순위를 받고 동률을 제외한 쌍으로 변환했다.
- **KL 기준은 원 사전 학습 모델이었다:** 토큰별 KL 기준은 SFT 정책이다. 사전 학습 능력 보존은 PPO-ptx의 별도 사전 학습 기울기 혼합과 구분한다.
- **모든 모델 구조에 확장됐다:** 실험한 세 크기는 모두 GPT-3 구조다.
- **정렬하면서 능력을 잃지 않았다:** 순수 PPO의 회귀가 있었고 PPO-ptx도 모든 공개 과제 격차를 없애지는 못했다.
- **해로운 출력을 줄이고 부적절한 요청을 거절했다:** 조건부 독성 감소는 있었지만 해로운 지시를 대체로 따르는 것이 공식 model card의 가장 큰 한계였다.
- **코드·질의응답·요약·창작 전반에서 정량 우위를 보였다:** 주 평가는 다양한 API 프롬프트의 선호 비교였고 코드·비영어는 제한적인 정성 탐색이었다.
- **RLHF 계산 비용이 갱신을 제한한다고 입증했다:** 저자들은 사전 학습 대비 추가 계산을 상대적으로 작다고 평가했다. 사람의 표지 비용과 계산 비용을 분리한다.
- **ChatGPT·GPT-4·Claude와 사실상 모든 후속 모델이 같은 방법을 따른다:** 원 논문만으로 후속 비공개 훈련 절차와 직접 인과를 입증할 수 없다. DPO·RLAIF 등 변형과 대안도 같은 세 단계 PPO로 부르지 않는다.
- **안전한 배포와 정렬 문제 해결을 달성했다:** 오용·편향·환각·유해 지시 추종과 분포 밖 실패가 남았고, 저자들은 더 넓은 안전 체계의 한 요소로 범위를 한정했다.

### 남는 한계

보상 모델은 관측된 순위를 예측하는 proxy이고 정책은 바로 그 proxy를 직접 최적화한다. 정책 분포가 평가 자료에서 멀어질수록 보상 모델의 사각지대를 이용할 가능성이 커진다. KL 제약·사전 학습 혼합·독립 인간 평가는 이 위험을 관리하지만 proxy를 실제 인간 가치로 바꾸지는 않는다.

지시 따르기가 좋아지면 유용한 작업뿐 아니라 악의적인 요청도 더 쉽게 수행될 수 있다. InstructGPT는 신뢰할 수 있는 거절 정책, 다양한 사회 집단의 가치 충돌, 장기 대화·도구 사용·실제 배포 위해를 포괄적으로 측정하지 않았다.

## 학습 확인

### 확인 질문

1. InstructGPT의 세 단계에서 평가자 시연, 응답 순위와 보상 모델 점수는 각각 어느 모델을 어떻게 바꾸는가?
2. SFT 기준 KL 패널티와 PPO-ptx의 사전 학습 기울기 혼합은 어떤 서로 다른 문제를 다루는가?
3. 1.3B InstructGPT의 선호 우위와 조건부 독성 감소가 일반 능력·보편 가치·완전한 안전성을 보장하지 않는 이유는 무엇인가?

### 다음 문서

- [[concept.rlhf|인간 피드백 강화학습]] — InstructGPT 한 사례를 2017년 행동 비교부터 후속 선호 최적화까지의 개념적 계보로 넓힌다.
- [[analysis.평가-지표와-모델-유인|자동 평가 지표는 무엇을 보상하는가]] — 고정 metric과 학습된 보상 모델을 최적화할 때 proxy의 사각지대가 어떻게 모델의 유인이 되는지 비교한다.

## 출처

- Long Ouyang 외, [Training Language Models to Follow Instructions with Human Feedback](https://arxiv.org/abs/2203.02155), 2022, 초록, §§3.1–5.5, Figures 2–9, Table 6, Appendices A–C·E.
- Long Ouyang 외, [NeurIPS 2022 proceedings entry](https://proceedings.neurips.cc/paper_files/paper/2022/hash/b1efde53be364a73914f58805a001731-Abstract.html), NeurIPS 2022 Main Track.
- OpenAI, [Aligning language models to follow instructions](https://openai.com/index/instruction-following/), 2022-01-27.
- OpenAI, [InstructGPT model card](https://github.com/openai/following-instructions-human-feedback/blob/main/model-card.md), 알려진 한계와 배포판 범위.
- 프로젝트 번역·검토 출발 자료: Michael Brenndoerfer, [InstructGPT and RLHF: Aligning Language Models with Human Preferences](https://mbrenndoerfer.com/writing/instructgpt-rlhf-aligning-language-models-human-preferences), 2025.
- 프로젝트 보존 자료: `raw/077_InstructGPT and RLHF Aligning Language Models with Human Preferences.ko.md`, `raw/077_InstructGPT and RLHF Aligning Language Models with Human Preferences.commentary.ko.md`.

## 관련 항목

- [[concept.rlhf|인간 피드백 강화학습]]
- [[analysis.평가-지표와-모델-유인|자동 평가 지표는 무엇을 보상하는가]]
- [[concept.대규모-언어-모델|대규모 언어 모델]]
- [[source.056|RLHF 토대와 인간 선호 기반 보상 학습]]
- [[source.067|GPT-3와 문맥 내 학습]]
- [[source.072|지시 미세조정과 FLAN의 제로샷 일반화]]
- [[concept.지시-미세조정|지시 미세조정]]
- [[analysis.사전-학습-지식은-과제에-어떻게-도착하는가|사전 학습 지식은 과제에 어떻게 도착하는가]]
