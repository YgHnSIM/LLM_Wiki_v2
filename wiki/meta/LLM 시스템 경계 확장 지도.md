---
schema_version: 2
id: meta.llm-system-boundary-map
page_type: meta
title: LLM 시스템 경계 확장 지도
aliases:
  - LLM system boundary map
  - LLM system boundaries
  - 모델 밖의 LLM 시스템 지도
tags:
  - type/meta
created: '2026-07-25'
updated: '2026-07-25'
lifecycle: active
verification: verified
artifacts: []
evidence: []
related:
  - concept.llm-inference-energy-metrics
  - analysis.power-to-service-outcomes
  - concept.training-data-lifecycle-provenance
  - analysis.data-scale-to-rights
  - analysis.문맥은-저장소인가-상태-재사용-검색-에이전트-메모리
  - concept.text-encoding-normalization
  - analysis.text-to-execution-authority
  - concept.함수-호출과-도구-사용
  - concept.llm-에이전트
  - concept.realtime-multimodal-interaction
  - analysis.text-to-realtime-multimodal-systems
  - analysis.llm-capability-model-or-system
  - analysis.llm을-만든-수학
  - meta.llm-computing-coevolution
---
# LLM 시스템 경계 확장 지도

> [!note] 읽기 안내
> 이 지도는 여섯 시스템 경계의 정의·수식·사례를 다시 가르치지 않는다. 대신 “지금 내 질문은 어느 문서의 책임인가?”를 고르게 한다. 입문자는 한 행의 owner와 bridge만 읽고, 준전문가는 같은 문제를 일곱 칸 장부로 다시 기록한다.

## 이 지도가 답하는 질문

LLM이 token을 만들었다는 사실만으로는 좋은 system 결과를 설명할 수 없다. 그 전에 어떤 data·text·media가 들어왔는지, 어떤 상태가 남았는지, 어느 자원이 쓰였는지, 누가 실행을 허가했는지, 사용자가 실제로 무엇을 들었거나 보았는지, 실패 뒤 무엇을 다시 확인해야 하는지가 남는다.

이 지도에서 **시스템 경계**는 model 안과 밖을 가르는 한 줄이 아니다. 어떤 질문의 입력·상태·결과·책임을 어디까지 포함해 기록할지 정하는 약속이다. 여섯 경계는 모든 LLM이 반드시 같은 순서로 지나는 기술 pipeline도, 서로를 대체하는 성숙도 단계도 아니다. 각각 다른 실무·학습 질문을 같은 점검 언어로 읽게 하는 탐색 경로다.

## 가장 짧은 읽기 경로

처음에는 여섯 경계를 모두 읽지 않아도 된다. 다음 중 지금 막힌 질문 하나를 고른다.

| 질문 | 먼저 읽을 경로 | 여기서 멈춰도 알 수 있는 것 |
| --- | --- | --- |
| “좋은 답 하나에 든 에너지를 무엇으로 나눠 세야 하나?” | [[LLM 추론 에너지 지표]] → [[전력에서 서비스 결과 계약까지 무엇을 세어야 하나]] | J, quality, deadline, traffic과 retry를 같은 분모로 섞지 않는 법 |
| “학습 data의 기록이 있으면 권리·동의 문제도 끝난 것 아닌가?” | [[학습 데이터 생애주기와 출처 추적]] → [[데이터의 양에서 권리와 책임까지]] | provenance 기록과 법적·윤리적 판정이 다른 이유 |
| “긴 문맥과 memory는 결국 같은 저장소 아닌가?” | [[문맥은 저장소인가 — 상태 재사용·검색·에이전트 메모리]] | KV cache, RAG index, event log, parameter checkpoint의 수명·갱신·복구 차이 |
| “text가 schema를 통과했으면 실행해도 되지 않나?” | [[문자 인코딩과 정규화]] → [[문자에서 실행 권한까지]] → [[함수 호출과 도구 사용]] | 표현·형식·의미·인증·인가·외부 효과가 다른 관문인 이유 |
| “음성 답이 빠르면 model도 실시간인가?” | [[실시간 멀티모달 상호작용]] → [[텍스트 모델에서 실시간 멀티모달 시스템까지]] | token 생성, turn, presentation, cancel이 다른 완료 상태인 이유 |

한 시간이 있다면 한 경로의 owner에서 용어를 잡고 bridge에서 다른 경계와 비교한 뒤, 이 지도로 돌아와 일곱 칸 장부를 채운다. 세 시간 이상이면 아래 여섯 경계를 한 행씩 읽되, 화살표를 기술적·역사적 인과가 아니라 **권장 읽기 순서**로만 해석한다.

## 여섯 경계의 한눈 지도

| 경계 | 첫 질문 | owner와 bridge | 이 경계가 대신 답하지 않는 것 |
| --- | --- | --- | --- |
| 에너지·서비스 결과 | 같은 답을 만들 때 어떤 energy와 retry를 어떤 유효 결과로 나눌까? | [[LLM 추론 에너지 지표]] → [[전력에서 서비스 결과 계약까지 무엇을 세어야 하나]] | model 품질, 탄소의 보편 환산, 모든 service의 동일한 SLO |
| data 생애주기·권리 | 이 data는 어디서 왔고 어떤 변환·release·training run을 거쳤나? | [[학습 데이터 생애주기와 출처 추적]] → [[데이터의 양에서 권리와 책임까지]] | 모든 권리·동의·보상·관할의 최종 판단 |
| memory·상태 | 어떤 state가 어디에 얼마나 남고, 누가 갱신·복구를 책임지나? | [[문맥은 저장소인가 — 상태 재사용·검색·에이전트 메모리]] | 물리 memory의 byte 비용, 모든 답의 사실성, 접근 권한 |
| 문자·실행 권한 | 입력을 읽고 구조·의미·identity·permission을 어디서 확인하나? | [[문자 인코딩과 정규화]] → [[문자에서 실행 권한까지]] | executor의 성공, 외부 effect의 완료·복구 |
| 안전한 외부 효과 | model 제안은 언제 실행 시도와 committed effect가 되나? | [[함수 호출과 도구 사용]] → [[LLM 에이전트]] | 모든 domain의 business postcondition, 사람이 이미 받은 효과의 rollback |
| 실시간 멀티모달 상호작용 | media가 어느 turn에 속하고 언제 presentation됐으며, 끼어들면 무엇을 멈추나? | [[실시간 멀티모달 상호작용]] → [[텍스트 모델에서 실시간 멀티모달 시스템까지]] | model 내부 modality architecture, 모든 환경의 UX 우열 |

각 행의 마지막 열은 “이 문서가 부족하다”는 뜻이 아니다. 반복 설명과 근거 범위를 한 owner에 모아, 다른 문서가 그 답을 몰래 가정하지 않게 하는 경계다.

## 일곱 칸 장부로 owner를 고르는 법

같은 단어가 다른 경계에서 다른 상태를 가리키면 비교가 무너진다. 새 주장·실험·product 설계를 읽을 때 아래 일곱 칸부터 채운다.

| 장부 칸 | 먼저 적을 질문 | 자주 생기는 혼동 |
| --- | --- | --- |
| 입력·대상 | 어떤 data, text, action object, media track 또는 사용자가 대상인가? | byte·token·audio frame·conversation turn을 같은 단위로 부른다 |
| 변환 경로 | 누가 무엇을 어떤 표현으로 바꾸는가? | data provenance, parsing, model inference, tool execution을 한 화살표로 합친다 |
| 시간·상태·자원 | 어떤 clock·수명·queue·memory·energy가 관여하는가? | KV cache, RAG index, event log, media clock을 같은 memory라고 부른다 |
| 결과 계약 | 언제 무엇을 성공·완료·유효 결과로 세는가? | token 생성, schema 통과, authorization, committed effect, media presentation을 같은 완료로 본다 |
| 지표·평가 기준 | 분자·분모·window·oracle은 무엇인가? | WER·MOS·task score·J/request·latency를 한 품질 점수로 합친다 |
| 실패·복구 경계 | 늦음·중단·unknown·손실 뒤 어떤 상태를 재확인하는가? | retry, cancel, reconnect, compensation이 자동 rollback이라고 가정한다 |
| 권한·책임·출처 추적 | 누가 허가·변경·감사하며 어떤 기록이 근거인가? | runtime log가 training data provenance를, provenance가 권리 판정을 자동으로 대체한다고 본다 |

이 표는 여섯 경계를 직렬화하지 않는다. 예를 들어 data 생애주기는 training 전후의 긴 시간에 걸치고, 실시간 media는 한 대화 turn 안에서 움직이며, 외부 effect는 authorization 뒤에도 독립된 recovery를 요구할 수 있다.

## 한 요청을 지도 위에 놓기

가상의 system이 사용자의 음성 질문을 듣고, 저장된 문서를 참고해 답을 읽어 주며, 사용자가 원할 때만 외부 action을 제안한다고 하자. 이 문장은 product의 실제 내부 구조를 말하는 것이 아니라, 질문을 어디에 배치할지 연습하는 예다.

1. microphone에서 들어온 audio의 clock·turn·playout은 실시간 멀티모달 경계에서 묻는다.
2. audio를 text나 다른 model 입력으로 바꾸는 표현·평가의 차이는 [[텍스트 모델에서 실시간 멀티모달 시스템까지]]와 연결해 읽는다.
3. text의 byte·normalization·schema·현재 state·authorization은 문자·실행 권한 경계에서 따로 확인한다.
4. 참고 문서·KV cache·대화 log·parameter가 각각 어느 수명과 provenance를 갖는지는 memory 경계에서 묻는다.
5. model이 다음 token 확률을 어떻게 만들고 gradient로 weight를 어떻게 바꾸는지는 [[LLM을 만든 수학]]의 내부 계산으로 돌아간다.
6. request를 실제로 서빙할 때의 queue·prefill·decode, energy와 유효 결과의 분모는 에너지·서비스 결과 경계에서 따로 기록한다.
7. 외부 action을 제안했다면 model output, authorization, execution attempt, committed·failed·unknown을 안전한 외부 효과 경계에서 분리한다.

이 예의 어느 한 칸도 다른 칸의 성공을 자동으로 증명하지 않는다. 낮은 WER은 action authorization이 아니고, 빠른 token은 speaker presentation이 아니며, provenance log는 권리·동의의 완결된 판단이 아니다.

## 세 허브와 책임을 나누는 법

| 허브 | 먼저 답하는 질문 | 이 지도와 만나는 지점 |
| --- | --- | --- |
| [[LLM을 만든 수학]] | token ID·tensor·attention·loss·gradient가 model 내부에서 어떻게 연결되는가? | 그 계산이 어떤 data·runtime·권한·media 계약 안에서 실제 결과가 되는지는 이 지도의 owner로 넘긴다 |
| [[LLM과 컴퓨팅 능력의 공진화]] | model·algorithm·software·hardware·service 조건이 역사적으로 어떤 병목을 바꿨는가? | 오늘의 여섯 경계는 그 실행 조건을 현재 system의 input·state·result 책임으로 읽는 길이다 |
| [[LLM 능력은 모델의 속성인가 시스템의 속성인가]] | 관찰된 능력 주장을 model·runtime·service 조건으로 어떻게 감사하는가? | 여섯 경계는 service 결과 계약을 data·memory·authority·media까지 더 세밀하게 분해한다 |

따라서 수학 허브의 식을 system 전체의 안전성 식으로 확대하지 않고, 역사 허브의 가능 조건을 단일 직접 계보로 바꾸지 않으며, 종합편의 능력 장부를 하나의 product score로 단순화하지 않는다.

## 이 지도 다음에 할 일

새 LLM 또는 product 주장을 하나 고른 뒤 다음 순서로 읽는다.

1. 주장에 들어 있는 입력, 결과, 지표, 실패 단어에 밑줄을 긋는다.
2. 여섯 행 중 가장 먼저 확인할 owner 하나와 bridge 하나를 고른다.
3. 일곱 칸 장부에서 비어 있는 칸을 적고, 그 빈칸을 model 성능이나 marketing 용어로 메우지 않는다.
4. model 내부 계산이 궁금하면 [[LLM을 만든 수학]]으로, 역사적 가능 조건이 궁금하면 [[LLM과 컴퓨팅 능력의 공진화]]로, 전체 능력 주장의 범위가 궁금하면 [[LLM 능력은 모델의 속성인가 시스템의 속성인가]]로 돌아간다.

여섯 트랙의 공개 문서와 이 탐색 지도는 완료된 milestone이다. 다음 보강은 새 1차 근거, 실제 학습자 오답, 재현 가능한 운영 trace가 생겨 기존 owner의 설명만으로 남는 공백이 확인될 때 정한다.

## 관련 항목

- [[LLM 추론 에너지 지표]] — energy 측정의 분자·분모와 경계를 정한다.
- [[전력에서 서비스 결과 계약까지 무엇을 세어야 하나]] — energy를 유효 서비스 결과와 연결한다.
- [[학습 데이터 생애주기와 출처 추적]] — data snapshot·변환·release·training run의 lineage를 기록한다.
- [[데이터의 양에서 권리와 책임까지]] — 규모와 권리·동의·책임을 같은 숫자로 섞지 않는다.
- [[문맥은 저장소인가 — 상태 재사용·검색·에이전트 메모리]] — 물리·의미 state의 수명과 복구를 비교한다.
- [[문자 인코딩과 정규화]] — byte·Unicode·normalization·tokenizer의 입력 계약을 구분한다.
- [[문자에서 실행 권한까지]] — parse·schema·meaning·identity·authorization을 분리한다.
- [[함수 호출과 도구 사용]] — 외부 effect의 제안·실행 시도·확정·unknown을 다룬다.
- [[LLM 에이전트]] — 여러 step의 plan·memory·중단 조건에 결과 상태가 전파되는 방식을 다룬다.
- [[실시간 멀티모달 상호작용]] — media clock·turn·buffer·presentation의 runtime 계약을 다룬다.
- [[텍스트 모델에서 실시간 멀티모달 시스템까지]] — text token, audio 표현, 사용자 경험의 측정 장부를 연결한다.
- [[LLM 능력은 모델의 속성인가 시스템의 속성인가]] — model·runtime·service 능력 주장을 종합한다.
- [[LLM을 만든 수학]] — model 내부의 token·tensor·loss·gradient 계산을 완결한다.
- [[LLM과 컴퓨팅 능력의 공진화]] — 실행 조건이 형성된 역사적 병목과 능력층을 탐색한다.
