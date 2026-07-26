---
schema_version: 3
id: concept.chatgpt-2022
page_type: concept
title: ChatGPT 연구 미리보기 (2022)
aliases:
  - ChatGPT research preview
  - 2022년 ChatGPT
  - ChatGPT 무료 연구 미리보기
tags:
  - type/concept
  - domain/ai
  - domain/nlp
  - domain/machine-learning
  - domain/conversational-ai
created: '2026-07-21'
updated: '2026-07-21'
editorial_status: active
review:
  evidence_coverage: verified
  content_mode: descriptive
artifacts:
  - raw/081_ChatGPT Conversational AI Becomes Mainstream.ko.md
  - raw/081_ChatGPT Conversational AI Becomes Mainstream.commentary.ko.md
evidence:
  - source_id: openai-2022-introducing-chatgpt
    locator: '도입부와 Methods·Limitations·Iterative deployment의 무료 research preview, dialogue format, SFT→응답 순위·reward model→PPO, GPT-3.5 series, 공개 한계와 사용자 피드백 절차'
    relation: supports
  - source_id: ouyang-et-al-2022-instructgpt
    locator: '초록과 §§3.1–3.6의 평가자 시연 SFT, 응답 순위·reward model, PPO/PPO-ptx 파이프라인과 §§5.1–5.5의 적용 범위·한계'
    relation: contextualizes
relations:
  - target: source.077
    kind: related
  - target: analysis.eliza에서-llm으로
    kind: related
learning:
  difficulty:
    entry: introductory
    target: introductory
  prerequisites:
    - target: concept.대규모-언어-모델
    - target: concept.rlhf
  assumed_knowledge: 없음
  outcomes:
    - '2022년 ChatGPT를 model 하나가 아니라 대화 interface·RLHF·공개 피드백을 묶은 연구 미리보기로 설명하고, 다중 턴 대화와 장기 memory를 구분할 수 있다.'
  next:
    - target: source.081
      reason: 081ChatGPT 연구 미리보기와 대화형 LLM 배포 — 공식 발표와 raw 서사를 대조해 공개된 학습 절차·한계와 교정 근거를 확인한다.
---
# ChatGPT 연구 미리보기 (2022)

> [!note] 학습 안내
> **난이도:** 입문<br>
> **선수 지식:** [[concept.대규모-언어-모델|대규모 언어 모델]], [[concept.rlhf|인간 피드백 강화학습]]<br>
> **읽고 나면:** 2022년 ChatGPT를 model 하나가 아니라 대화 interface·RLHF·공개 피드백을 묶은 연구 미리보기로 설명하고, 다중 턴 대화와 장기 memory를 구분할 수 있다.

## 1단계 — 먼저 잡을 핵심

### 한 문장 정의

ChatGPT 연구 미리보기(2022)는 GPT-3.5 series의 model을 대화 자료와 인간 선호로 미세조정하고, **무료 다중 턴 interface와 사용자 피드백 통로를 함께 공개한 반복적 배포 단계**다.

이 개념은 현재의 ChatGPT 제품군 전체를 가리키지 않는다. 2022년 11월 30일 공개 당시 model·interface·운영 목적과 알려진 한계를 묶어 부르는 역사적 범위다.

### 왜 중요한가

언어 model의 기술 능력만으로는 사람들이 실제 과업에서 어떻게 질문하고, 답을 고치고, 오류를 신고하는지 알기 어렵다. 연구 미리보기는 대화 interface를 통해 model 행동을 반복적으로 시험하게 하고, UI에서 문제 출력과 외부 filter 오류를 수집하는 배포 loop를 만들었다.

여기서 **대중화**는 확인 가능한 배포 형식의 변화다. 무료 research preview와 접근 가능한 다중 턴 UI를 통해 언어 model을 실제 사용자와의 반복 상호작용에 놓았다는 뜻이다. 사용자 수, 시장 투자, 교육·산업 변화의 규모나 인과는 이 개념의 정의에 포함하지 않는다.

### 무엇과 구분해야 하는가

- **ChatGPT와 InstructGPT:** RLHF 방법 계열을 공유하는 sibling model이지 동일 checkpoint가 아니다.
- **다중 턴 문맥과 persistent memory:** 현재 대화의 앞선 turn을 이어 쓰는 기능은 session·계정을 넘어 정보를 영구 저장하는 장기 기억과 다르다.
- **피드백 수집과 안전성 입증:** 실패 보고를 받는 통로는 위험을 찾는 장치이지 모든 harmful output과 bias가 제거됐다는 인증이 아니다.
- **역사적 연구 미리보기와 현재 제품:** 후대의 model, tool, 검색, multimodal 기능과 정책을 2022년 상태로 소급하지 않는다.

## 2단계 — 작동 원리

### 네 요소가 하나의 배포 loop를 이룬다

1. **기반 model:** 2022년 초 훈련을 마친 GPT-3.5 series의 한 model에서 시작한다.
2. **대화·선호 학습:** 인간이 양쪽 역할로 만든 대화 시연을 SFT하고, 여러 model 응답의 순위에서 reward model을 학습한 뒤 PPO로 정책을 미세조정한다.
3. **다중 턴 interface:** 사용자가 후속 질문, 보충 설명과 정정을 이어 입력할 수 있게 한다.
4. **공개 피드백:** 실제 사용에서 드러난 문제 출력과 content filter의 오탐·미탐을 UI로 받으며 다음 model·mitigation 갱신의 자료로 삼는다.

이 네 요소는 `model을 한 번 훈련하고 끝낸다`는 흐름과 다르다. 훈련된 정책을 제한된 공개 환경에 배포하고, 관측된 실패를 후속 개선에 반영하는 반복 구조다.

### SFT에서 reward model과 PPO로

첫 단계에서는 trainer가 사용자와 assistant 양쪽의 발화를 작성해 바람직한 대화 행동을 시연했다. InstructGPT 자료도 dialogue format으로 바꾸어 새 대화 dataset에 섞었다. 이는 model이 어떤 형식과 응답 행동을 이어야 하는지 supervised target으로 보여 준다.

둘째 단계에서는 실제 trainer–chatbot 대화의 model 메시지를 골라 대안 completion을 여러 개 만들고 trainer가 순위를 매겼다. Reward model은 이 상대 비교를 학습해 응답 품질의 proxy score를 출력한다. 셋째 단계의 PPO는 그 score를 높이도록 정책을 갱신하며, OpenAI는 이 과정을 여러 차례 반복했다고 밝혔다.

이 pipeline은 [[077_InstructGPT와 인간 선호 정렬|InstructGPT]]의 시연→응답 순위→reward model→PPO 흐름과 연결된다. 다만 ChatGPT는 대화 자료 수집 설정을 달리한 sibling model이므로 둘을 같은 model로 취급하지 않는다.

### 다중 턴 interface가 제공하는 것

대화 형식은 한 답으로 요청이 끝나지 않아도 되게 한다. 사용자는 follow-up question으로 조건을 추가하고, 잘못된 답을 지적하고, 모호했던 의도를 다시 표현할 수 있다. Model도 앞선 turn에 이어 답하고 잘못을 인정하거나 잘못된 전제에 이의를 제기하는 행동을 보일 수 있다.

이 기능은 persistent memory의 증거가 아니다. 2022년 발표는 dialogue 안의 후속 상호작용을 설명했지만, 별도 conversation이나 장기간에 걸친 사용자 정보를 보존·회상하는 체계를 공개하지 않았다.

## 3단계 — 기술과 근거

### 공식 발표가 공개한 model 정보의 상한

OpenAI는 ChatGPT가 GPT-3.5 series model에서 미세조정됐고, 그 series가 2022년 초 훈련을 마쳤다고 적었다. ChatGPT와 GPT-3.5가 Azure AI supercomputing infrastructure에서 훈련됐다는 사실도 공개했다.

발표는 초기 ChatGPT의 parameter count를 제시하지 않았다. GPT-3나 InstructGPT에 관한 175B 수치는 관련 model family의 선행 수치일 뿐 ChatGPT 자체의 규모로 확인되지 않는다.

### 연구 미리보기와 반복적 배포

OpenAI는 이 공개를 더 안전하고 유용한 system을 향한 iterative deployment의 최신 단계로 표현했다. GPT-3와 Codex 배포의 교훈이 당시 mitigation에 반영됐고, ChatGPT 공개에서 얻은 교훈을 더 유능한 후속 system에 가져가겠다는 접근이다.

접근 가능한 interface는 알려진 오류를 재확인하는 데만 쓰이지 않았다. 연구자가 아직 알지 못한 문제와 현실의 비적대적 조건에서 생기는 harmful output, 외부 filter의 false positive·false negative를 찾는 관측 장치였다. 그렇다고 실제 사용자 feedback이 대표성 있는 독립 평가나 장기 안전 연구를 대신하지는 않는다.

### 기능과 근거 범위를 함께 읽는다

| 구성 요소 | 직접 확인되는 역할 | 넘어서면 안 되는 해석 |
| --- | --- | --- |
| GPT-3.5 series 기반 | 초기 model 계열과 훈련 완료 시기 | 175B parameter count |
| Dialogue format | follow-up·정정·전제 반박·거절 행동 | 영구 memory, 완전한 사실 판정 |
| RLHF pipeline | 시연·순위·reward model·PPO 갱신 | 인간 가치 전체의 정렬 |
| Moderation API·외부 filter | 특정 unsafe content의 경고·차단 | harmful output·bias의 완전 제거 |
| UI feedback | 새 실패와 filter 오류 수집 | 사용자 만족도·사회 효과의 인과 증명 |

## 검증과 한계

### 공개 당시 알려진 실패

ChatGPT는 그럴듯하지만 틀리거나 무의미한 답을 쓸 수 있었다. RL 학습에 진실을 직접 알려 주는 source가 없고, 신중함을 늘리면 답할 수 있는 질문까지 거절할 수 있으며, human demonstrator의 지식과 model의 지식이 달라 supervised target도 어긋날 수 있다는 설명이 함께 제시됐다.

입력 표현을 조금 바꾸거나 같은 prompt를 다시 시도하면 답이 달라질 수 있었다. Model은 trainer가 길고 포괄적으로 보이는 답을 선호한 자료 bias와 reward overoptimization 때문에 장황하고 특정 문구를 반복하기도 했다. 모호한 질의에서는 clarifying question을 묻기보다 의도를 추측하는 경향도 있었다.

부적절한 요청을 거절하도록 학습했어도 harmful instruction에 답하거나 biased behavior를 보일 수 있었다. Moderation API를 이용한 경고·차단에도 false negative와 false positive가 모두 남았다.

### 흔한 오해

- **초기 ChatGPT는 175B였다:** 공식 발표는 parameter count를 공개하지 않았다.
- **ChatGPT는 InstructGPT의 새 이름이다:** 방법 계보는 가깝지만 공식 표현은 자료 수집 설정이 다른 sibling model이다.
- **대화가 이어지므로 사용자를 계속 기억했다:** 다중 턴 dialogue와 persistent memory는 별도 기능이다.
- **거절과 moderation이 있으므로 안전했다:** harmful response, bias와 filter 오탐·미탐이 발표 자체에 한계로 적혀 있다.
- **빠른 사용자 증가가 model의 정확성과 산업 효과를 입증했다:** 공식 발표는 사용자 수를 보고하지 않았고, 이용 규모는 정확도·안전·인과 효과의 측정치가 아니다.
- **대중화가 곧 산업 혁신의 원인이라는 뜻이다:** 이 개념은 무료 연구 미리보기와 접근 가능한 다중 턴 UI로의 배포 전환만 뜻한다.

### 적용 범위

이 문서는 2022년 발표 당시의 ChatGPT에 한정된다. 현재 같은 이름의 서비스가 쓰는 model, 도구, memory, 검색, 입력 modality와 운영 정책은 별도 시점의 근거로 확인해야 한다.

또한 공식 release 글은 개발자의 1차 기록이지만 독립 benchmark가 아니다. 선택된 sample과 수집 예정인 feedback만으로 일반 정확도, 위해율, 이용자 대표성이나 장기 사회 효과를 추정하지 않는다.

## 학습 확인

### 확인 질문

1. 2022년 ChatGPT 연구 미리보기를 구성한 네 요소는 무엇인가?
2. 대화 시연, 응답 순위와 PPO가 policy 학습에서 맡는 역할은 어떻게 다른가?
3. 다중 턴 interface와 persistent memory, feedback 수집과 안전성 입증을 각각 분리해야 하는 이유는 무엇인가?

### 다음 문서

- [[source.081|ChatGPT 연구 미리보기와 대화형 LLM 배포]] — 081ChatGPT 연구 미리보기와 대화형 LLM 배포 — 공식 발표와 raw 서사를 대조해 공개된 학습 절차·한계와 교정 근거를 확인한다.

## 출처

- [[081_ChatGPT 연구 미리보기와 대화형 LLM 배포]]
- OpenAI, [Introducing ChatGPT](https://openai.com/index/chatgpt/), 2022-11-30; 도입부, `Methods`, `Limitations`, `Iterative deployment`.
- Long Ouyang 외, [Training Language Models to Follow Instructions with Human Feedback](https://arxiv.org/abs/2203.02155), NeurIPS 2022; 초록과 §§3.1–3.6·5.1–5.5.
- 프로젝트 보존 자료: `raw/081_ChatGPT Conversational AI Becomes Mainstream.ko.md`, `raw/081_ChatGPT Conversational AI Becomes Mainstream.commentary.ko.md`.

## 관련 항목

- [[source.081|ChatGPT 연구 미리보기와 대화형 LLM 배포]]
- [[concept.대규모-언어-모델|대규모 언어 모델]]
- [[concept.rlhf|인간 피드백 강화학습]]
- [[source.077|InstructGPT와 인간 선호 정렬]]
- [[analysis.eliza에서-llm으로|ELIZA에서 LLM으로]]
