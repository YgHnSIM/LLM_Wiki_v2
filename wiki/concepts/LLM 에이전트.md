---
schema_version: 3
id: concept.llm-에이전트
page_type: concept
title: LLM 에이전트
aliases:
  - LLM Agent
  - Language Agent
  - Agentic AI
  - 에이전트형 AI 시스템
tags:
  - type/concept
  - domain/ai
  - domain/computer-science
  - domain/conversational-ai
  - domain/machine-learning
  - domain/nlp
created: '2026-07-22'
updated: '2026-07-25'
editorial_status: active
review:
  evidence_coverage: verified
  content_mode: descriptive
artifacts:
  - 'raw/104_Agentic AI Systems Autonomous Agents with Reasoning, Planning, and Tool Use.ko.md'
  - 'raw/104_Agentic AI Systems Autonomous Agents with Reasoning, Planning, and Tool Use.commentary.ko.md'
  - raw/109_AI Co-Scientist Systems Autonomous Research and Scientific Discovery.ko.md
  - raw/109_AI Co-Scientist Systems Autonomous Research and Scientific Discovery.commentary.ko.md
evidence:
  - source_id: wei-et-al-2022-chain-of-thought
    locator: '초록과 §§1–4, Figures 1–6의 intermediate reasoning text·few-shot prompting과 과제별 성능 범위'
    relation: contextualizes
  - source_id: yao-et-al-2023-react
    locator: 초록과 §§1–4·Figure 1의 reasoning–action–observation loop 및 QA·interactive environment 실험
    relation: supports
  - source_id: schick-et-al-2023-toolformer
    locator: 초록과 §§1–3의 self-supervised API-call 학습과 tool 선택·argument·결과 통합
    relation: contextualizes
  - source_id: openai-2023-function-calling-api-update
    locator: 'Function calling 절의 함수 이름·JSON argument 생성, external application 실행과 tool-output injection 경고'
    relation: contextualizes
  - source_id: shinn-et-al-2023-reflexion
    locator: 초록과 §§2–5·Figures 2–4·Tables 1–3의 verbal feedback·episodic memory·retry 및 parameter update를 하지 않는 설정
    relation: supports
  - source_id: park-et-al-2023-generative-agents
    locator: '초록과 §§3–5의 observation memory·reflection·planning, 25-agent sandbox와 human believability evaluation'
    relation: contextualizes
  - source_id: zhou-et-al-2024-webarena
    locator: '초록과 §§3–6·Table 4의 실제형 website task, end-to-end success와 human·GPT-4 agent 격차'
    relation: supports
  - source_id: jimenez-et-al-2024-swebench
    locator: 초록과 §§2–5·Tables 3–5의 repository-level issue·test 기반 patch 평가와 model별 해결률
    relation: contextualizes
  - source_id: xie-et-al-2024-osworld
    locator: 초록과 §§3–5·Table 5의 실제 web·desktop task와 human 72.36%·최고 model 12.24% success rate
    relation: supports
  - source_id: ruan-et-al-2024-toolemu
    locator: '초록과 §§3–5의 LM-emulated tool sandbox, 고위험 case와 helpfulness·safety evaluator'
    relation: supports
  - source_id: gottweis-et-al-2025-ai-co-scientist
    locator: 'arXiv:2502.18864v1의 §§1·3.1–3.5·4와 Figure 2: scientist-in-the-loop 범위, Supervisor·전문 에이전트·context feedback, 전문가 후보 선택과 인간 wet-lab 실행 경계'
    relation: supplements
  - source_id: rfc-9110-http-semantics
    locator: §9.2.2의 idempotent method 범위와 §15.3.3의 accepted response와 완료 처리의 구분
    relation: contextualizes
  - source_id: google-aip-155-request-identification
    locator: Guidance와 Stale success responses의 request ID·중복 제거·재시도·감사 및 유한 보존 조건
    relation: supplements
  - source_id: google-aip-194-automatic-retry
    locator: Guidance와 Generally non-retryable codes의 side effect·transaction·UNKNOWN 자동 재시도 경계
    relation: supplements
  - source_id: google-aip-151-long-running-operations
    locator: Guidance와 Errors의 operation status·partial failure·terminal response/error 구분
    relation: contextualizes
  - source_id: garcia-molina-salem-1987-sagas
    locator: Abstract의 부분 실행·compensating transaction 경계
    relation: contextualizes
  - source_id: nist-sp800-53r5-audit-controls
    locator: 'AU-3, AU-5, AU-12의 action·주체·시각·결과·상관 기록과 logging failure 대응'
    relation: supplements
relations:
  - target: source.104
    kind: related
  - target: source.109
    kind: related
  - target: source.092
    kind: related
  - target: source.080
    kind: related
  - target: source.071
    kind: related
  - target: concept.사고-연쇄-프롬프팅
    kind: related
  - target: concept.구조화-출력
    kind: related
  - target: concept.openai-codex-2021
    kind: related
  - target: analysis.text-to-execution-authority
    kind: related
  - target: analysis.model-capability-to-service-capability
    kind: related
  - target: analysis.ai-시연과-실제-성능
    kind: related
learning:
  difficulty:
    entry: intermediate
    target: intermediate
  prerequisites:
    - target: concept.대규모-언어-모델
    - target: concept.함수-호출과-도구-사용
  assumed_knowledge: 없음
  outcomes:
    - 'LLM agent의 목표–상태–행동–관찰 loop를 설명하고, model의 제안과 runtime 실행·reconciliation, 외부 memory와 weight learning, sandbox와 authorization, component 평가와 end-to-end 평가를 분리해 설계할 수 있다.'
  next:
    - target: analysis.평가-지표와-모델-유인
      reason: '자동 평가 지표는 무엇을 보상하는가 — 조건부 component와 전체 요청 분모, 비용·side effect가 model 선택 유인에 미치는 영향을 비교한다.'
---
# LLM 에이전트

> [!note] 학습 안내
> **난이도:** 중급<br>
> **선수 지식:** [[concept.대규모-언어-모델|대규모 언어 모델]], [[concept.함수-호출과-도구-사용|함수 호출과 도구 사용]]<br>
> **읽고 나면:** LLM agent의 목표–상태–행동–관찰 loop를 설명하고, model의 제안과 runtime 실행·reconciliation, 외부 memory와 weight learning, sandbox와 authorization, component 평가와 end-to-end 평가를 분리해 설계할 수 있다.

## 1단계 — 먼저 잡을 핵심

### 한 문장 정의

**LLM 에이전트**(LLM agent)는 언어 모델이 목표와 현재 state에서 다음 action 후보를 생성하고, 외부 orchestrator가 policy에 따라 이를 검증·실행해 얻은 observation을 다시 state에 넣는 반복 system이다.

에이전트는 model 하나의 속성이 아니다.

$$
\text{LLM agent}
=
\text{model}
+\text{orchestrator}
+\text{tools/environment}
+\text{state/memory}
+\text{identity/policy}
+\text{evaluation/monitoring}
$$

이 합성 경계를 보존하면 “모델이 계획했다”, “에이전트가 실행했다”, “시스템이 학습했다”라는 문장에서 실제 주체와 보장 범위를 찾을 수 있다.

### 에이전트성을 판단하는 여섯 질문

| 질문 | 작은 위임의 예 | 큰 위임의 예 |
| --- | --- | --- |
| Goal | 매 turn 사람이 요청 | 장기 목표를 state에 유지 |
| Horizon | 한 번의 call | 여러 시간·episode의 loop |
| Action space | Read-only 검색 | 외부 write·전송·결제·code 실행 |
| Decision scope | Tool을 사람이 선택 | Tool·순서·retry를 system이 선택 |
| State | 현재 prompt만 사용 | 외부 memory·artifact·checkpoint 유지 |
| Oversight | 매 action 확인 | 위험 등급별 확인·예산 내 자동 실행 |

자율성은 위 표의 오른쪽으로 갈수록 커질 수 있지만 하나의 점수로 자동 환산되지는 않는다. Read-only 장기 조사와 한 번의 고액 송금은 horizon과 부작용 위험이 서로 다르다. “Autonomous”라는 label보다 위임 범위를 구체적으로 기술한다.

### 세 등식을 거부한다

$$
\text{reasoning text}
\ne
\text{검증된 plan},
$$

$$
\text{tool-call proposal}
\ne
\text{authorized execution},
$$

$$
\text{memory를 다시 읽음}
\ne
\text{weight가 학습됨}
$$

첫 구분은 그럴듯한 설명과 실제 dependency·precondition을, 둘째는 model과 application의 신뢰 경계를, 셋째는 inference-time state update와 optimizer-based learning을 분리한다.

## 2단계 — 작동 원리

### 상태 기계로 보는 한 episode

Agent runtime은 보통 다음 상태를 반복한다.

1. **Observe:** 사용자 요청, 이전 tool result, environment state를 읽는다.
2. **Propose:** Model이 답·plan·tool call·중단 후보를 생성한다.
3. **Validate:** Parser·schema와 domain rule로 후보를 형식·의미 차례로 검사한다.
4. **Authorize:** Identity·resource·action·risk policy에 따라 허가·거절을 결정한다.
5. **Confirm:** policy가 confirmation을 요구하면 정확한 action·parameter·resource version·만료 시각을 preview로 제시하고 confirmation을 묶는다. 불필요한 risk tier라면 면제 결정과 근거를 기록한다. action·resource·parameter·version이 바뀌면 confirmation 또는 면제를 다시 평가한다.
6. **Execute attempt:** action ID와 해당 interface의 idempotency key·contract를 붙여 sandbox·timeout·budget 조건에서 tool을 시도한다.
7. **Reconcile:** write action의 응답·상태 조회·event를 대조해 committed·failed·unknown을 판정하고, partial effect는 failed 또는 unknown의 증거·잔여 효과로 기록한다. unknown이면 새 후보를 생성하기 전에 상태 조회·사람 escalation·계약상 허용된 같은 ID 재시도를 선택한다.
8. **Update:** committed·failed의 확인된 outcome 또는 `unknown`이라는 미확정 상태, action ID·관측 근거·pending reconciliation, 남은 효과, cost와 policy decision을 durable state·memory·trace에 기록한다. unknown 효과를 성공·실패 사실처럼 memory에 쓰지 않는다.
9. **Evaluate:** Goal postcondition, 위험, budget과 종료 조건을 검사한다.

이를 단순화하면 다음과 같다.

$$
\hat a_t=M_\theta(g,s_t,\mathcal T_t),
\quad
a_t=\Pi(\hat a_t,i_t,P_t),
\quad
o_{t+1}=E(a_t),
\quad
s_{t+1}=U(s_t,o_{t+1})
$$

Model $M_\theta$는 action proposal $\hat a_t$를 낸다. Policy gate $\Pi$가 실행할 $a_t$를 결정하고 executor $E$가 environment를 바꾼다. State updater $U$가 observation을 저장한다. Maximum step·time·cost와 stop condition은 model prompt가 아니라 orchestrator가 강제해야 한다.

이 식의 $E(a_t)$는 “성공이 확인된 결과”라는 뜻이 아니다. executor가 응답을 잃거나 일부 service만 바꿨다면 orchestrator는 action ID·idempotency record·권위 있는 상태 조회를 묶어 outcome을 따로 판정해야 한다. model이 같은 tool call을 다시 생성해도, 같은 논리적 intent를 재시도할지·기다릴지·중단할지는 runtime의 상태 기계가 정한다.

### Plan은 text보다 강한 계약이다

Planning을 세 표현으로 나눌 수 있다.

| 표현 | 포함할 수 있는 것 | 검증 방법 |
| --- | --- | --- |
| Reasoning text | 문제 풀이·근거처럼 보이는 token | 과제 정답·일관성·민감 정보 노출 검사 |
| Plan object | Step·dependency·precondition·resource·risk | Schema·graph·policy·simulation 검사 |
| Execution trace | 실제 call·observation·error·state change | Log·postcondition·side effect audit |

Chain-of-thought prompting은 일부 과제에서 중간 text와 정답 성능을 개선했다. ReAct는 이를 action·observation과 교대했다. 그렇다고 text가 충실한 내부 추론 보고서이거나 계획의 실행 가능성을 증명하는 것은 아니다. Plan은 dependency와 precondition으로, 결과는 trace와 postcondition으로 확인한다.

긴 plan을 처음에 고정하는 방법만 있는 것도 아니다. 매 observation 뒤 다음 action을 다시 고르는 receding-horizon loop, subgoal별로 replan하는 방식, 사람 승인을 경계로 plan을 나누는 방식이 있다. 어느 전략이든 환경 변화와 실패를 감지하는 state가 필요하다.

### Tool은 capability이자 attack surface다

[[함수 호출과 도구 사용]]은 model이 tool 이름과 argument를 구조화해 제안하도록 돕는다. 그러나 외부 상태를 바꾸는 주체는 runtime이다. 한 call은 다음 관문을 통과해야 한다.

| 관문 | 대표 질문 |
| --- | --- |
| Parse·schema | 허용된 구조와 자료형인가? |
| Semantic validation | 실제 존재하는 ID·날짜·단위이며 업무 규칙에 맞는가? |
| Identity | 요청 주체와 credential은 누구의 것인가? |
| Authorization | 이 주체가 이 resource에 이 action을 할 수 있는가? |
| Confirmation | policy가 요구하면 사용자가 확인했거나, 요구하지 않음·waiver 결정과 근거가 기록됐는가? |
| Execution | Timeout·중복·부분 실패를 안전하게 다루는가? |
| Outcome reconciliation | 응답 유실 뒤에도 action ID와 권위 있는 상태로 committed·failed·unknown을 구분했는가? |
| Postcondition | 의도한 상태 변화가 계약된 범위에서 확인됐는가? |
| Grounding | Agent의 후속 답이 실제 result와 일치하는가? |

Tool output도 신뢰할 수 없는 입력이다. Web page·email·document 속 text가 더 높은 권한의 instruction처럼 처리되면 간접 prompt injection이 된다. Data provenance를 표시하고, untrusted content를 읽는 action과 write action 사이에 policy gate를 둔다.

특히 write action이 unknown이면 agent가 같은 문장을 다시 생성해도 새 call을 바로 보내지 않는다. action·resource·parameter가 바뀌었다면 authorization과 필요한 confirmation 또는 waiver 결정을 다시 평가하고, 바뀌지 않았다면 operation record·상태 조회·event를 대조한다. partial effect를 발견하면 plan text가 아니라 관측된 trace를 바탕으로 멈춤·compensation 제안·사람 escalation 중 하나를 선택한다. compensation은 새 action이므로 자동으로 실행·승인·성공했다고 가정하지 않는다.

### Memory의 네 층

‘Memory’라는 이름 아래 서로 다른 update를 합치지 않는다.

1. **Context memory:** 최근 message와 tool result를 prompt에 유지한다. Context window를 벗어나면 요약·삭제가 필요하다.
2. **External episodic memory:** 사건·실패·feedback을 database·log·vector store에 저장해 다음 episode에 검색한다.
3. **Artifact·skill memory:** File·code·plan template·실행 가능한 procedure를 versioned artifact로 보존한다.
4. **Parametric memory:** Training·fine-tuning·reinforcement learning으로 model weight를 갱신한다.

Generative Agents는 observation memory를 reflection·planning에 재사용했다. Reflexion은 verbal feedback을 episodic memory에 저장했으며 weight는 바꾸지 않았다. 이 방식도 행동을 개선할 수 있지만 잘못된 기억, retrieval 오류, privacy·retention과 prompt injection을 새로 만든다. Parameter update에는 또 다른 data governance·regression·rollback 문제가 있다.

### Feedback은 네 가지가 다르다

- **Environment feedback:** Tool의 success·error·observation을 다음 step에 넣는다.
- **Evaluator feedback:** Test·critic·human이 결과를 채점하고 retry prompt를 만든다.
- **Memory update:** Feedback text나 summary를 외부 store에 기록한다.
- **Learning update:** Loss와 optimizer로 weight 또는 trainable adapter를 바꾼다.

첫 세 항목은 inference loop 안에서 fixed model을 사용할 수 있다. “실패 뒤 다른 행동을 했다”는 관찰만으로 네 번째가 일어났다고 결론 내리지 않는다.

### 과학 에이전트에서도 제안·선택·실행 주체를 다시 나눈다

[[109_AI 공동 과학자의 가설 생성과 자율 연구 경계]]의 Google AI co-scientist는 과학자가 정한 목표 안에서 Supervisor가 Generation·Reflection·Ranking·Proximity·Evolution·Meta-review 에이전트를 비동기 작업으로 배치하고, 가설을 생성·비판·Elo 순위화·개선했다. Meta-review가 반복 피드백을 다음 cycle의 prompt 문맥에 넣는 것은 **context feedback**이지 model weight를 갱신하는 optimizer-based learning이 아니다.

보고된 실행 경계는 다음과 같다.

$$
\text{과학자의 목표·제약}
\rightarrow \text{agent 가설 tournament}
\rightarrow \text{실험 protocol 제안}
\rightarrow \text{전문가 후보 선택}
\rightarrow \text{인간 연구자의 wet-lab}
\rightarrow \text{결과 검증}
$$

AML 세포주와 간 오가노이드 실험은 협력 연구자가 수행했고, cf-PICI의 wet-lab 발견은 AI가 질문을 받기 전에 이미 끝나 있었다. 따라서 protocol 생성은 action proposal, 전문가의 승인·선택은 decision gate, 장비에서 이뤄진 물리 실험과 관찰은 별도 executor·trace로 기록해야 한다. `scientist-in-the-loop`라는 이름만으로 안전성과 과학적 타당성이 생기는 것도 아니다. 어느 단계에서 어떤 전문가가 무엇을 승인하고 검증했는지를 밝혀야 한다.

## 3단계 — 기술과 근거

### 선행 연구가 보여 준 서로 다른 조합

ReAct는 reasoning trace와 environment action을 interleave해 QA와 interactive task에서 평가했다. 이 연구는 LLM agent loop의 대표 골격을 보여 주지만 action space와 wrapper가 미리 정해진 실험이다.

Toolformer는 GPT-J 6.7B의 training data에 calculator·QA·search·translation·calendar API call을 self-supervised하게 삽입하고 filtering했다. Tool use를 prompt orchestration뿐 아니라 language-model training 문제로도 다룰 수 있음을 보였다. 모든 API·권한·long-horizon plan을 해결한 것은 아니다.

Reflexion은 evaluator가 만든 verbal feedback과 self-reflection을 episodic memory에 넣어 다음 trial에 활용했다. 논문이 ‘verbal reinforcement learning’이라 부른 과정은 gradient·weight update를 쓰지 않는다. Generative Agents는 25개 software agent가 사는 sandbox에서 observation·reflection·planning architecture를 구현하고 인간 평가로 행동의 believability를 측정했다. Believability는 외부 업무의 사실성·효율·안전과 같은 metric이 아니다.

OpenAI의 2023년 Function Calling은 model이 함수 이름과 JSON argument를 생성하고 application이 이를 실행하는 interface를 공개했다. 발표 자체도 신뢰하지 않은 tool output의 injection과 실제 영향이 있는 행동의 사용자 확인을 경고했다. 구조화된 call이 model–runtime 접점을 개선해도 실행 권한을 model에 넘긴 것은 아니다.

### 장기 과제에서 직렬 관문이 누적된다

한 episode가 $n$개 step으로 구성되고 각 step이 앞선 성공을 조건으로 성공할 확률을 $p_t$라 하면, 매우 단순화한 end-to-end 성공은 다음처럼 보인다.

$$
P(\text{episode success})
=
\prod_{t=1}^{n} P(S_t\mid S_{<t})
$$

Step 성공이 독립이라는 뜻이 아니다. 오히려 앞선 observation 오류가 뒤의 상태와 action 분포를 바꾸므로 조건부 확률을 기록해야 한다. 개별 tool call이 95% 정확해도 긴 episode에서 오류가 누적될 수 있고, retry가 성공률을 높이는 대신 cost·latency·중복 side effect를 늘릴 수 있다.

WebArena의 원 설정에서 최고 GPT-4 기반 agent는 14.41%, 인간은 78.24% end-to-end success를 보였다. OSWorld에서는 최고 model 12.24%, 인간 72.36%였다. 이 결과는 특정 model·prompt·environment snapshot의 baseline이지만, single-turn 언어 성능이 장기 environment control로 자동 이전되지 않는다는 근거다.

SWE-bench는 real GitHub issue와 repository test를 연결해 patch가 실제로 문제를 해결했는지 측정했다. 원 논문의 2,294개 task에서 최고 Claude 2 해결률은 1.96%였다. 이 설정은 후대 interactive coding agent 전체가 아니라 초기 repository-level patch generation 평가다. 그래도 자연어 plan·code 생성과 executable postcondition을 분리해야 함을 보여 준다.

### Sandbox는 피해 범위를 줄이는 한 관문이다

Sandbox는 filesystem·network·process·credential 접근을 격리해 잘못된 action의 blast radius를 줄인다. 하지만 다음을 자동 보장하지 않는다.

- 사용자의 goal 자체가 정당한가?
- Agent에게 제공한 credential의 scope가 최소인가?
- 허가된 API call이 개인정보나 영업 비밀을 노출하지 않는가?
- 외부 content가 간접 instruction을 심지 않았는가?
- Sandbox 밖의 service에서 발생한 결제·발송을 되돌릴 수 있는가?

ToolEmu는 36개 고위험 toolkit과 144개 test case를 LM-emulated sandbox에서 평가했다. 논문은 시험한 가장 안전한 LLM agent에도 자동 evaluator 기준 23.9% failure rate가 남았다고 보고했다. 이는 실제 사고율이 아니라 해당 emulator·scenario·evaluator의 결과다. Sandbox와 safety evaluation이 필요하다는 근거이지 둘만으로 안전이 증명됐다는 근거가 아니다.

### Agent 평가 장부

| 층 | 대표 metric | 놓치기 쉬운 것 |
| --- | --- | --- |
| Model proposal | Tool selection·argument accuracy·plan constraint | 실제 실행·권한 |
| Runtime gate | Allow·deny precision, confirmation coverage | Model의 숨은 잘못된 의도 |
| Execution·outcome | Success·timeout·retry·duplicate, committed·failed·unknown 비율과 failed/unknown 안의 partial-effect rate | Goal 달성 여부와 잔여 외부 효과 |
| Recovery | Reconciliation 시간·postcondition 확인률·compensation 성공·residual effect | 보상이 원래 상태를 완전히 되돌렸는지 |
| Trajectory | Step count·loop·recovery·policy violation·action ID 연결률 | 최종 결과의 품질 |
| End-to-end | Goal postcondition·task success | 위험한 경로·과도한 비용 |
| Safety·security | Unauthorized side effect·data leak·injection success·audit completeness | 희귀한 미표집 공격 |
| Operations | Latency·token·tool cost·reproducibility | 사용자 효용 전체 |

Component metric은 실패 위치를 진단하고 end-to-end metric은 실제 요청의 결과를 보여 준다. 전체 요청을 분모로 한 성공률과 앞 관문을 통과한 case만의 조건부 성공률을 함께 보고한다. 위험한 write action은 성공률이 높더라도 unauthorized action이 한 번이라도 발생했는지, unknown outcome이 얼마나 오래 남는지, partial effect가 어떤 compensation 또는 사람 결정으로 끝났는지를 별도 기록한다.

Offline에서는 duplicate 같은 ID, 같은 ID의 다른 payload, confirmation 만료, lost response, partial two-step effect, retry budget 소진과 prompt injection 뒤 write 거절 fixture를 고정해 model regression을 비교할 수 있다. Staging에서는 sandboxed executor와 postcondition oracle을 사용한다. Production에서는 versioned model·prompt·tool·policy, identity, 승인, action·trace ID, state change와 outcome을 audit하되 민감 data를 최소 보존한다.

## 검증과 한계

### 흔한 오해

- **LLM 자체가 agent다:** LLM은 action proposal component일 수 있다. Loop·state·tool·policy·executor는 system이 제공한다.
- **Agent는 2024년에 발명됐다:** LLM 기반 ReAct는 2022년 공개됐고 Toolformer·Reflexion·Generative Agents는 2023년이다. 비LLM agent 연구는 더 오래됐다.
- **Chain-of-thought가 정확한 planning module이다:** Reasoning text는 plan의 dependency·precondition·실행 가능성을 자동 보장하지 않는다.
- **함수 호출이면 외부 action이 일어났다:** Model은 call data를 제안하며 application이 검증·권한 확인·실행한다.
- **Persistent memory는 model이 경험에서 배운다는 뜻이다:** 외부 state 검색과 weight learning은 다르다.
- **Feedback loop는 reinforcement learning이다:** Error를 prompt에 다시 넣는 retry와 optimizer update를 구분한다.
- **Sandbox가 있으면 안전하다:** 격리는 피해 범위를 줄이지만 goal·identity·권한·data flow·외부 부작용은 별도 통제다.
- **Human-in-the-loop면 안전하다:** 확인 요청이 너무 많거나 맥락이 부족하면 사용자가 기계적으로 승인할 수 있다. 위험에 맞는 정보와 빈도로 설계한다.
- **Timeout은 action이 실패했다는 뜻이다:** 응답 유실 뒤에는 unknown을 기록하고 reconciliation한 뒤에만 다음 plan을 정한다.
- **Compensation은 agent의 자동 되돌리기 주문이다:** compensation도 domain별 새 action이며, 별도 authorization·confirmation·실패·잔여 효과가 있다.
- **더 많은 tool과 더 긴 horizon은 항상 더 유능하다:** Capability와 함께 선택 혼동·비용·오류 누적·attack surface도 늘어난다.
- **한 성공 demo가 자율성을 입증한다:** 성공 case 선택, 숨은 사람 개입, environment 고정과 retry budget을 공개해야 반복 가능성을 판단할 수 있다.

### 용어와 책임 경계

‘Agentic workflow’는 고정된 application state machine에 model이 일부 field만 채우는 system부터, model이 다음 tool·순서·종료를 반복 선택하는 system까지 넓게 쓰인다. 어떤 구성이 agent인지 명칭으로 판정하기보다 의사결정권과 side effect를 표로 공개한다.

‘Planning’, ‘reasoning’, ‘reflection’, ‘learning’, ‘memory’도 구현을 적지 않으면 검증할 수 없다. Natural-language plan인지 executable graph인지, self-critique인지 외부 test인지, vector store인지 weight update인지 명시한다.

System 실패의 책임을 model에만 돌리거나 모두 model provider에 넘길 수 없다. Tool을 등록한 developer, credential과 policy를 배치한 operator, 승인 UI, external service와 model이 각각 다른 실패를 만든다. Trace에는 이 경계를 재구성할 정보를 남긴다.

### 현재 근거의 한계

ReAct·Toolformer·Reflexion·Generative Agents는 연구용 action space와 metric을 사용했다. 각 논문의 향상을 임의의 production environment나 safety-critical domain에 일반화하지 않는다. WebArena·OSWorld·SWE-bench의 수치는 당시 model과 harness의 결과이며 후대 leaderboard와 직접 비교하려면 task version·environment·tool access를 맞춰야 한다.

ToolEmu의 tool result와 safety judgment에는 언어 모델 proxy가 들어간다. 실제 service의 authentication·rate limit·UI·network failure와 사람 피해를 완전히 재현하지 않는다. 반대로 benchmark가 포착하지 못한 실패가 없다는 뜻도 아니다.

LLM agent 연구에는 capability와 safety가 빠르게 변하는 model·framework·environment version에 의존한다는 문제가 있다. “Agent가 성공했다”는 문장에는 model snapshot, prompt·policy, tool catalog, credential scope, task set, retry·cost budget과 평가 시점을 함께 기록해야 한다.

## 학습 확인

### 확인 질문

1. Reasoning text가 곧 action이 아니도록 설계해야 하는 이유는 무엇인가?
2. 쓰기 action이 timeout 뒤 `unknown`이면, 왜 새 action을 바로 생성하지 않고 reconciliation을 먼저 하는가?
3. Component-level metric과 end-to-end metric을 함께 보되, 외부 효과까지 장부에 넣어야 하는 이유는 무엇인가?

### 다음 문서

- [[analysis.평가-지표와-모델-유인|자동 평가 지표는 무엇을 보상하는가]] — 조건부 component와 전체 요청 분모, 비용·side effect가 model 선택 유인에 미치는 영향을 비교한다.

## 출처

- [[104_LLM 에이전트의 추론-행동 루프와 자율성 경계]]
- [[109_AI 공동 과학자의 가설 생성과 자율 연구 경계]]
- Jason Wei 외, [Chain-of-Thought Prompting Elicits Reasoning in Large Language Models](https://papers.neurips.cc/paper_files/paper/2022/hash/9d5609613524ecf4f15af0f7b31abca4-Abstract-Conference.html), NeurIPS 2022, §§1–4.
- Shunyu Yao 외, [ReAct: Synergizing Reasoning and Acting in Language Models](https://openreview.net/forum?id=WE_vluYUL-X), ICLR 2023, §§1–4와 Figure 1.
- Timo Schick 외, [Toolformer: Language Models Can Teach Themselves to Use Tools](https://proceedings.neurips.cc/paper_files/paper/2023/hash/d842425e4bf79ba039352da0f658a906-Abstract-Conference.html), NeurIPS 2023, §§1–3.
- OpenAI, [Function calling and other API updates](https://openai.com/index/function-calling-and-other-api-updates/), 2023-06-13, Function calling·safety 절.
- Noah Shinn·Federico Cassano·Ashwin Gopinath·Karthik Narasimhan·Shunyu Yao, [Reflexion: Language Agents with Verbal Reinforcement Learning](https://papers.neurips.cc/paper_files/paper/2023/hash/1b44b878bb782e6954cd888628510e90-Abstract-Conference.html), NeurIPS 2023, §§1–4.
- Joon Sung Park 외, [Generative Agents: Interactive Simulacra of Human Behavior](https://doi.org/10.1145/3586183.3606763), UIST 2023, §§3–5.
- Shuyan Zhou 외, [WebArena: A Realistic Web Environment for Building Autonomous Agents](https://proceedings.iclr.cc/paper_files/paper/2024/hash/4410c0711e9154a7a2d26f9b3816d1ef-Abstract-Conference.html), ICLR 2024, §§3–5.
- Carlos E. Jimenez 외, [SWE-bench: Can Language Models Resolve Real-World GitHub Issues?](https://proceedings.iclr.cc/paper_files/paper/2024/hash/edac78c3e300629acfe6cbe9ca88fb84-Abstract-Conference.html), ICLR 2024, §§2–5.
- Tianbao Xie 외, [OSWorld: Benchmarking Multimodal Agents for Open-Ended Tasks in Real Computer Environments](https://papers.nips.cc/paper_files/paper/2024/hash/5d413e48f84dc61244b6be550f1cd8f5-Abstract-Datasets_and_Benchmarks_Track.html), NeurIPS 2024, §§3–5.
- Yangjun Ruan 외, [ToolEmu: Identifying the Risks of LM Agents with an LM-Emulated Sandbox](https://proceedings.iclr.cc/paper_files/paper/2024/hash/7274ed909a312d4d869cc328ad1c5f04-Abstract-Conference.html), ICLR 2024, §§3–5.
- Juraj Gottweis 외, [*Towards an AI co-scientist*](https://arxiv.org/pdf/2502.18864v1), arXiv:2502.18864v1, 2025, §§1·3.1–3.5·4와 Figure 2.
- Roy T. Fielding·Mark Nottingham·Julian Reschke, [RFC 9110: HTTP Semantics](https://www.rfc-editor.org/rfc/rfc9110), 2022, §§9.2.2·15.3.3.
- Google, [AIP-155: Request identification](https://google.aip.dev/155), 2019, Guidance와 Stale success responses.
- Google, [AIP-194: Automatic retry configuration](https://google.aip.dev/194), 2019, Guidance와 Retryable·Generally non-retryable codes.
- Google, [AIP-151: Long-running operations](https://google.aip.dev/151), 2019, Guidance와 Errors.
- Hector Garcia-Molina·Kenneth Salem, [Sagas](https://www.cs.princeton.edu/research/techreps/598), 1987, Abstract.
- Joint Task Force, [NIST SP 800-53 Rev. 5](https://doi.org/10.6028/NIST.SP.800-53r5), 2020, AU-3·AU-5·AU-12.
- 프로젝트 보존 자료: `raw/104_Agentic AI Systems Autonomous Agents with Reasoning, Planning, and Tool Use.ko.md`, `raw/104_Agentic AI Systems Autonomous Agents with Reasoning, Planning, and Tool Use.commentary.ko.md`.
- 프로젝트 보존 자료: `raw/109_AI Co-Scientist Systems Autonomous Research and Scientific Discovery.ko.md`, `raw/109_AI Co-Scientist Systems Autonomous Research and Scientific Discovery.commentary.ko.md`.

## 관련 항목

- [[analysis.평가-지표와-모델-유인|자동 평가 지표는 무엇을 보상하는가]]
- [[concept.대규모-언어-모델|대규모 언어 모델]]
- [[concept.함수-호출과-도구-사용|함수 호출과 도구 사용]]
- [[source.104|LLM 에이전트의 추론-행동 루프와 자율성 경계]]
- [[source.109|AI 공동 과학자의 가설 생성과 자율 연구 경계]]
- [[source.092|함수 호출과 도구 사용의 모델-실행 경계]]
- [[source.080|사고 연쇄 프롬프팅과 추론 행동 유도]]
- [[source.071|Codex와 HumanEval 기반 코드 생성 평가]]
- [[concept.사고-연쇄-프롬프팅|사고 연쇄 프롬프팅]]
- [[concept.구조화-출력|구조화 출력]]
- [[concept.openai-codex-2021|OpenAI Codex (2021)]]
- [[analysis.text-to-execution-authority|문자에서 실행 권한까지]]
- [[analysis.model-capability-to-service-capability|모델 능력에서 서비스 능력으로]]
- [[analysis.ai-시연과-실제-성능|AI 시연과 실제 성능]]
