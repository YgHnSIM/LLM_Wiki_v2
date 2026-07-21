---
title: "기능 호출과 도구 사용의 실행 경계 해설"
source_file: "092_Function Calling and Tool Use Enabling Practical AI Agent Systems.md"
translation_file: "092_Function Calling and Tool Use Enabling Practical AI Agent Systems.ko.md"
commentary_type: "해설"
source_stem: "092_Function Calling and Tool Use Enabling Practical AI Agent Systems"
order_prefix: "092"
source_title: "Function Calling and Tool Use: Enabling Practical AI Agent Systems"
source_url: "https://mbrenndoerfer.com/writing/function-calling-tool-use-practical-ai-agents"
topic: "2023년 기능 호출 API, 도구 실행 경계와 구조화 출력의 한계"
period: "2021–2024"
tags:
  - LLM
  - NLP
  - AI-history
  - commentary
  - function-calling
  - tool-use
  - agents
---

# 기능 호출과 도구 사용의 실행 경계 해설

## 1. 한눈에 보기

- **핵심 주제:** 2023년 6월 13일 OpenAI는 `gpt-4-0613`, 같은 기능 개선을 포함한 `gpt-4-32k-0613`, 그리고 `gpt-3.5-turbo-0613`에 개발자가 제시한 함수 설명을 보고 함수 이름과 JSON 인수를 출력하는 기능을 공개했다.
- **정확한 실행 경계:** 모델은 함수 실행을 제안할 뿐이다. 애플리케이션이 인수를 검증하고 권한을 확인한 뒤 실제 코드나 API를 실행하며, 그 결과를 다시 모델에 전달한다.
- **스키마의 역할:** JSON Schema는 모델과 프로그램 사이의 인터페이스를 기술한다. 스키마가 있다고 해서 호출 선택, 인수의 의미, 권한, 외부 시스템의 결과까지 결정론적으로 올바른 것은 아니다.
- **연대상 주의점:** 기능 호출이라는 연구 아이디어가 2023년 6월에 처음 생긴 것은 아니다. WebGPT, MRKL, ReAct, PAL, Toolformer와 ChatGPT plugins가 앞서 언어 모델과 외부 도구의 결합을 탐구했다.
- **후대 기능과의 구분:** 2023년 6월의 기능 호출은 2024년 8월에 발표된 Structured Outputs의 `strict: true`와 같지 않다. 엄격한 스키마 일치는 후대에 추가됐다.
- **복수 함수와 병렬 호출:** 여러 함수 정의를 한 요청에 나열해 모델이 하나를 고르게 하는 기능과, 한 모델 응답에서 여러 호출을 함께 내보내는 parallel function calling은 다르다. 후자는 2023년 11월 GPT-4 Turbo 발표에서 별도 개선으로 소개됐다.
- **안전의 핵심:** 유효한 JSON도 위험한 행동을 요청할 수 있다. 검증, 최소 권한, 사용자 확인, 부작용 통제와 감사 기록은 모델 밖의 애플리케이션 책임이다.
- **증거의 한계:** 원문이 열거한 고객 서비스·전자상거래·데이터 분석 사례는 가능한 사용 예다. 이 글만으로 해당 산업이 “변혁됐다”, 광범위한 채택이 일어났다거나 생산 신뢰성이 확립됐다고 결론 내릴 수는 없다.

> 이 문서는 `092_Function Calling and Tool Use Enabling Practical AI Agent Systems.md`의 번역문을 이해하기 위한 해설이다. 원문의 기능 설명을 반복하기보다 2023년 API가 실제로 제공한 계약, 애플리케이션이 맡는 실행과 안전 책임, 선행 도구 사용 연구, 그리고 2024년 Structured Outputs와의 경계를 분명히 한다.

## 2. 핵심 요약

기능 호출(function calling)은 언어 모델 안에 임의의 프로그램 실행기를 넣는 기능이 아니다. 개발자가 함수의 이름·설명·매개변수를 스키마로 제공하면 모델이 대화 맥락을 보고 “어느 함수를 어떤 인수로 호출하면 좋겠다”는 구조화된 출력을 생성하는 인터페이스다. 2023년 6월 OpenAI 발표의 정확한 대상은 `gpt-4-0613`, 같은 개선을 포함한 `gpt-4-32k-0613`, 그리고 `gpt-3.5-turbo-0613`이었고, 당시 Chat Completions API의 `functions`와 `function_call` 매개변수로 함수 정의와 호출 방식을 전달했다.

이름 때문에 모델이 외부 시스템을 직접 조작한다고 오해하기 쉽지만, 실제 경계는 다음과 같다.

1. 개발자가 대화와 호출 가능한 함수 정의를 모델에 보낸다.
2. 모델이 자연어 답변 또는 함수 이름과 JSON 인수를 생성한다.
3. 애플리케이션이 출력의 구문·스키마·업무 규칙·권한을 검증한다.
4. 애플리케이션이 실행을 승인하거나 거부하고, 승인한 경우에만 실제 함수·API·데이터베이스 작업을 수행한다.
5. 애플리케이션이 성공·실패·데이터 등 도구 결과를 모델에 돌려준다.
6. 모델이 그 결과를 바탕으로 최종 답변이나 다음 호출 제안을 만든다.

따라서 모델은 **의도와 인수의 생성자**, 애플리케이션은 **정책 집행자와 실행자**, 외부 함수는 **실제 효과를 만드는 구성요소**다. 이 셋을 합쳐 “모델이 이메일을 보냈다”라고 쓰면 어떤 층에서 오류나 권한 침해가 발생했는지 보이지 않는다.

2023년 기능 호출은 자유 형식 텍스트를 정규식으로 해석하던 방식보다 프로그램 연결을 쉽게 만들었다. 그러나 당시 API 자료는 모델이 항상 유효한 JSON을 생성하지 않을 수 있고, 함수 스키마에 없는 매개변수를 지어낼 수 있으므로 실행 전에 인수를 검증하라고 경고했다. “함수 시그니처를 따르도록 미세조정했다”는 발표 문구는 신뢰성을 높였다는 설명이지 모든 출력에 대한 형식 보증이 아니었다.

스키마에 정확히 맞는 출력을 보장하려는 기능은 별도의 연혁을 가진다. 2023년 11월 JSON mode가 유효한 JSON 생성을 겨냥했고, 2024년 8월 Structured Outputs가 `strict: true`와 constrained decoding으로 제공된 JSON Schema에 맞추는 기능을 발표했다. 그때도 값 자체의 사실성이나 적절성은 보장하지 않았다. 예컨대 `send_email` 인수가 스키마에 완벽히 맞아도 수신자가 잘못됐거나, 사용자가 발송을 승인하지 않았거나, 본문에 허위 정보가 들어 있을 수 있다.

원문의 가장 유용한 통찰은 언어 모델과 기존 소프트웨어 사이에 명시적 인터페이스가 필요하다는 점이다. 다만 “변혁”, “혁명”, “생산 준비 완료”, “광범위한 채택” 같은 평가는 이 글의 사례 열거만으로 입증되지 않는다. 실제 영향을 판단하려면 배포 사례, 실패율, 지연 시간, 비용, 보안 사고, 사용자 확인률과 비교 기준이 필요하다.

| 원문의 표현 | 근거에 맞춘 설명 |
|---|---|
| 2023년 기능 호출이 모델을 외부 세계와 연결했다 | 모델이 호출 제안을 구조화해 내보내는 API가 추가됐다. 실제 연결·실행·권한은 애플리케이션이 구현한다. |
| 출력 형식이 결정론적이고 정확히 스키마 검증됐다 | 2023년 자료는 유효하지 않은 JSON과 환각한 매개변수를 경고했다. 엄격한 스키마 일치는 2024년 Structured Outputs의 별도 기능이다. |
| 모델이 여러 함수를 동시에 처리했다 | 2023년 6월에는 여러 정의 중 적절한 함수를 선택할 수 있었다. 한 응답의 복수 호출은 2023년 11월 parallel function calling 업데이트로 구분해야 한다. |
| 함수를 호출해 행동을 수행했다 | 모델은 함수 이름과 인수를 생성한다. 애플리케이션이 검증·승인·실행하고 결과를 돌려준다. |
| 실제 응용 분야가 변혁됐다 | 날씨 조회, 데이터베이스 질의, 이메일 발송 등은 가능한 사용 사례다. 분야별 변혁이나 채택 규모는 별도 실증 자료가 필요하다. |
| 구조화된 출력이 신뢰성을 해결했다 | 형식 오류를 줄일 수 있지만 잘못된 도구 선택, 의미상 틀린 값, 권한 위반, 외부 실패와 prompt injection은 남는다. |

## 3. 역사적 배경

기능 호출의 역사적 의미를 평가하려면 **도구 사용 연구**, **ChatGPT 제품 통합**, **개발자용 API 계약**을 나눠 봐야 한다. 2023년 6월 발표는 이 셋 가운데 마지막 항목을 널리 쓰기 쉬운 제품 인터페이스로 만든 사건이다. “언어 모델이 도구를 사용한다”는 아이디어 자체의 출발점은 아니다.

| 시점 | 1차 자료 | 핵심 내용 | 2023년 6월 기능 호출과의 관계 |
|---|---|---|---|
| 2021-12 | OpenAI WebGPT | GPT-3가 텍스트 기반 브라우저에서 검색·이동·인용 명령을 내리도록 학습 | 언어 모델이 외부 환경의 제한된 action space를 사용한 선행 사례 |
| 2022-05 | MRKL Systems | LLM router와 계산기·지식원·추론 모듈을 결합하는 modular neuro-symbolic architecture 제안 | 언어 이해와 결정론적 모듈을 분리하는 시스템 관점의 선행 연구 |
| 2022-10 / ICLR 2023 | ReAct | reasoning trace와 환경 action·observation을 번갈아 생성 | 계획·행동·관찰을 반복하는 agent loop의 대표적 선행 패턴 |
| 2022-11 | PAL | LLM이 프로그램을 만들고 Python interpreter가 계산을 수행 | 모델의 문제 분해와 외부 실행기의 정확한 계산을 분리 |
| 2023-02 | Toolformer | API를 언제·어떻게 호출할지 self-supervised 방식으로 학습 | 호출 시점·도구·인수 선택을 학습 문제로 다룬 직접적인 선행 연구 |
| 2023-03-23 | ChatGPT plugins alpha | ChatGPT에 최신 정보, 계산, 제3자 서비스용 도구를 연결 | OpenAI가 기능 호출 API 이전에 배포한 도구 생태계와 안전 실험 |
| 2023-06-13 | OpenAI function calling | `gpt-4-0613`, 같은 개선을 포함한 `gpt-4-32k-0613`, `gpt-3.5-turbo-0613`이 함수 이름과 JSON 인수를 출력 | 개발자가 자신의 함수 정의를 Chat Completions에 전달하는 범용 API 계약 |
| 2023-11-06 | GPT-4 Turbo·GPT-3.5 Turbo update | JSON mode와 한 메시지의 복수 함수 호출을 발표 | 유효한 JSON과 parallel function calling이 6월 기능과 별도 단계였음을 보여 줌 |
| 2024-08-06 | Structured Outputs | `strict: true`, model training과 constrained decoding으로 JSON Schema 일치 강화 | 2023년 기능 호출의 “더 신뢰할 수 있음”을 엄격한 형식 보증으로 확장 |

이 연표는 OpenAI의 2023년 발표를 축소하지 않는다. 연구 prototype이나 특정 환경의 action vocabulary와 달리, 개발자가 JSON Schema로 자신의 함수 목록을 기술하고 상용 API 응답에서 호출 제안을 받는 일관된 접점을 제공했다는 점은 분명한 제품 변화였다. 다만 “최초”나 “근본적 발명” 대신 **기존 도구 사용 흐름을 개발자 API로 표준화하고 접근성을 높인 사건**이라고 표현하는 편이 정확하다.

또한 [[080_Chain-of-Thought Prompting Unlocking Latent Reasoning in Language Models.ko|연쇄적 사고 프롬프팅]]과 도구 사용을 같은 기술로 취급하지 않아야 한다. Chain-of-thought는 중간 추론 문장을 생성하도록 유도하는 prompting 방법이다. 외부 API의 권한, 실행, 반환값을 정의하지 않는다. ReAct는 reasoning과 action을 한 궤적으로 엮었지만, 그것 역시 모든 API에서 보안과 형식이 자동으로 해결된다는 뜻은 아니었다.

원문은 [[081_ChatGPT Conversational AI Becomes Mainstream.ko|ChatGPT]] 이후 기능 호출이 “다음 질문”을 해결했다고 서술한다. 역사적 맥락으로는 이해할 수 있지만, ChatGPT가 기능 호출 전까지 순수 텍스트에만 갇혀 있었다고 단정하면 2023년 3월 plugins alpha를 빠뜨리게 된다. 6월 발표 자체도 plugins 경험을 안전 연구의 배경으로 언급했다.

## 4. 핵심 개념 해설

### 4.1 함수 스키마는 실행 코드가 아니라 인터페이스 설명이다

함수 정의에는 보통 이름, 사람이 읽을 설명, 그리고 JSON Schema 형태의 매개변수 정의가 들어간다. 예를 들어 날씨 함수는 `location`을 필수 문자열로, `unit`을 제한된 열거형으로 기술할 수 있다. 이 정보는 모델이 어떤 도구를 골라 어떤 모양의 인수를 만들지 판단하는 문맥이 된다.

그러나 스키마는 다음 항목을 스스로 구현하지 않는다.

- 함수 코드와 네트워크 요청
- 사용자의 인증 상태와 접근 권한
- `location`이 실제로 존재하는지 같은 의미 검증
- 결제·발송·삭제처럼 부작용이 있는 행동의 승인 절차
- timeout, rate limit, 재시도, idempotency와 rollback
- 도구 응답이 신뢰할 만한지에 대한 provenance 검사

즉 스키마는 **계약의 모양**이지 **계약의 올바른 이행**이 아니다. 모델은 스키마를 조건으로 토큰을 생성하고, 프로그램은 독립된 검증기와 정책으로 그 제안을 처리해야 한다.

### 4.2 “Function call”은 모델 경계에서는 호출 제안이다

API 객체 이름은 function call이지만, 모델 응답을 받은 시점에는 외부 함수가 아직 실행되지 않았다. 안전한 시스템에서는 이를 `proposed_tool_call`로 사고하는 편이 좋다.

| 단계 | 주체 | 입력 | 출력 또는 책임 |
|---|---|---|---|
| 도구 공개 | 개발자 애플리케이션 | 허용한 함수와 스키마 | 모델이 선택할 수 있는 후보 집합 |
| 호출 생성 | 언어 모델 | 사용자 메시지, 대화, 함수 설명 | 함수 이름과 JSON 인수 또는 자연어 답변 |
| 정책 판정 | 애플리케이션 | 모델이 만든 호출 제안 | allow/deny, 추가 인증, 사용자 확인, 인수 보정 요청 |
| 실제 실행 | 함수·서비스 | 검증되고 승인된 인수 | 데이터, 성공 상태, 오류 또는 부작용 |
| 관찰 전달 | 애플리케이션 | 도구 결과 | 모델이 읽을 tool/function message |
| 응답 합성 | 언어 모델 | 대화와 도구 결과 | 사용자용 설명 또는 다음 호출 제안 |

이 분리는 실패 분석에도 중요하다. 모델이 잘못된 함수를 골랐는지, 애플리케이션이 권한을 잘못 부여했는지, 외부 API가 오래된 값을 돌려줬는지, 모델이 올바른 결과를 잘못 설명했는지는 서로 다른 오류다.

### 4.3 형식 유효성, 스키마 일치, 의미 정확성은 세 층이다

구조화 출력의 “신뢰성”은 최소 세 가지로 나뉜다.

1. **JSON 구문 유효성:** 괄호·따옴표·쉼표가 올바르고 parser가 읽을 수 있는가?
2. **스키마 일치:** 필수 필드, type, enum, 중첩 구조가 개발자 정의와 맞는가?
3. **의미 정확성:** 값이 사용자 의도와 현실에 맞고, 해당 행동이 허용되는가?

2023년 6월 기능 호출은 자유 형식 텍스트보다 1·2번을 더 안정적으로 생성하도록 fine-tuning된 모델을 제공했다. 하지만 공식 API reference는 생성된 JSON이 언제나 유효하지 않을 수 있고 정의되지 않은 매개변수를 환각할 수 있으므로 검증하라고 명시했다. 2024년 Structured Outputs의 `strict: true`는 지원되는 JSON Schema 범위에서 2번을 강화했지만 3번까지 보장하지 않는다. OpenAI의 2024년 발표도 JSON 값 안의 수학적 단계처럼 내용 오류가 남을 수 있다고 밝혔다.

그러므로 다음 두 호출은 모두 형식상 완벽해도 실패할 수 있다.

```json
{"recipient":"wrong-person@example.com","body":"승인되지 않은 내용"}
```

```json
{"account_id":"존재하지만 현재 사용자가 볼 수 없는 계정","action":"delete"}
```

Schema validator는 문자열 type과 필수 필드를 확인할 뿐, 수신자 선택이나 권한을 판단하지 않는다.

### 4.4 여러 함수 정의와 병렬 도구 호출을 구분한다

2023년 6월 API는 한 요청에 여러 함수 정의를 제공하고 모델이 문맥에 맞는 함수를 선택하도록 할 수 있었다. 예를 들어 날씨·달력·이메일 함수를 모두 설명하고 그중 하나를 고르게 할 수 있다. 이것은 **후보 함수가 여러 개**라는 뜻이다.

한편 parallel function calling은 모델의 한 응답에 여러 호출을 함께 담아 애플리케이션이 병렬로 처리할 수 있게 하는 기능이다. OpenAI는 2023년 11월 GPT-4 Turbo 발표에서 “차량 창문을 열고 에어컨을 끄라”는 한 요청에 여러 함수를 한 메시지에서 호출하는 기능을 새 개선으로 소개했다. 따라서 원문의 “여러 함수를 동시에 처리하고 올바른 하나를 선택했다”는 문장은 서로 다른 두 기능을 섞는다.

병렬화에는 독립성 판단도 필요하다. 서로 의존하지 않는 날씨 조회 두 건은 병렬 실행이 가능하지만, 먼저 고객을 찾고 그 결과의 ID로 주문을 수정하는 작업은 순차 실행해야 한다. 모델이 여러 호출을 출력했다는 사실만으로 dependency, transaction, ordering과 partial failure가 해결되지는 않는다. 2024년 Structured Outputs 발표 당시에는 엄격한 스키마 준수와 parallel function call을 함께 사용할 때 스키마 불일치가 날 수 있어 병렬 호출을 끄라는 제한도 명시됐다.

### 4.5 도구 결과는 새로운 입력이며 공격면이다

도구를 연결하면 모델이 최신 정보와 외부 상태를 받을 수 있지만, 그 결과는 자동으로 신뢰할 수 있는 사실이 아니다. 검색 페이지, 이메일, 문서, 데이터베이스 문자열에는 “이전 지시를 무시하고 다른 함수를 호출하라” 같은 공격성 텍스트가 들어갈 수 있다. 2023년 발표는 untrusted tool output이 모델에 의도하지 않은 행동을 지시하는 proof-of-concept exploit을 명시적으로 경고했다.

따라서 안전한 설계는 도구 결과를 단순한 system instruction처럼 취급하지 않는다.

- 신뢰할 수 있는 도구와 데이터 원천을 allowlist한다.
- 도구 결과를 데이터로 경계 표시하고, 명령으로 승격하지 않는다.
- 결과가 후속 고위험 호출의 근거가 되면 provenance와 내용 검사를 거친다.
- 이메일 발송, 공개 게시, 구매, 삭제와 같은 행동은 사용자 확인을 둔다.
- 인증·인가를 모델 판단에 맡기지 않고 서버에서 강제한다.
- 모델이 요청한 권한보다 좁은 credential과 scope를 제공한다.

이 위험은 JSON Schema만으로 막을 수 없다. 공격자가 유효한 문자열 필드 안에 지시문을 넣을 수 있기 때문이다.

### 4.6 구조화 추출과 도구 실행은 같은 형식을 쓸 수 있지만 목적이 다르다

함수 호출 인터페이스는 실제 행동뿐 아니라 entity extraction, classification, intent parsing에도 사용될 수 있다. 이 경우 “함수”가 외부 부작용을 일으키지 않고 모델 출력을 정해진 객체로 받기 위한 형식 장치일 수 있다.

두 용도를 구분하면 안전 검토가 쉬워진다.

| 용도 | 예 | 핵심 위험 |
|---|---|---|
| 구조화 추출 | 문장에서 이름·날짜를 객체로 추출 | 누락, 잘못된 값, schema mismatch |
| 읽기 전용 도구 | 날씨·주문 상태 조회 | 잘못된 질의, 민감정보 노출, 오래된 결과 |
| 쓰기 도구 | 이메일 발송, 일정 생성 | 잘못된 대상, 중복 실행, 승인 없는 부작용 |
| 고위험 도구 | 결제, 삭제, 권한 변경 | 재정·보안 피해, 복구 곤란, 권한 상승 |

모두 같은 JSON 모양을 쓸 수 있어도 필요한 통제 수준은 다르다. “스키마를 따른다”는 이유로 쓰기 도구를 읽기 전용 도구처럼 다뤄서는 안 된다.

## 5. 원문의 논리 구조

원문은 대략 다음 흐름으로 전개된다.

1. 2023년 기능 호출을 실용적 AI agent의 전환점으로 규정한다.
2. 그전의 언어 모델은 텍스트만 생성해 실시간 정보 접근, 행동 수행과 구조화 데이터 추출에 한계가 있었다고 설명한다.
3. 개발자가 JSON Schema로 함수를 기술하고 모델이 함수 이름과 인수를 구조화해 내보내는 해결책을 제시한다.
4. 애플리케이션이 함수를 실행하고 결과를 모델에 돌려주는 반복 구조를 설명한다.
5. 고객 서비스, 소프트웨어 개발, 데이터 분석, 전자상거래, 여행과 연구 지원을 응용 분야로 열거한다.
6. 잘못된 함수·인수, 설명 품질 의존, 보안, 경직성, latency·cost, 전문 영역의 한계를 든다.
7. agent framework와 parallel function calling으로 이어진 장기 유산을 평가한다.

이 구조의 장점은 자연어 모델과 프로그램 API 사이의 연결 문제를 직관적으로 보여 준다는 데 있다. 특히 모델이 도구 결과를 다시 받아 답변을 만드는 순환을 포함해, 단순 structured extraction보다 넓은 agent loop를 소개한다.

하지만 핵심 주장을 세 층으로 나누지 않아 과장이 생긴다.

- **2023년 6월에 실제로 출시된 기능:** 특정 model snapshot과 Chat Completions 매개변수, 함수 선택과 JSON 인수 생성
- **후대에 추가된 기능:** 2023년 11월 JSON mode·parallel function calling, 2024년 8월 Structured Outputs의 엄격한 schema adherence
- **입증되지 않은 영향 평가:** 산업 변혁, 생산 준비 완료, 광범위한 adoption, agent framework 발전에 대한 단일 원인 서사

또한 “모델이 함수를 실행한다”는 표현과 “애플리케이션이 모델의 요청을 실행한다”는 표현이 오간다. 실행 주체를 후자로 고정해야 권한과 책임이 분명해진다. 스키마를 “결정론적이고 정확히 검증된 출력”으로 묘사한 부분도 2023년 API의 보장 범위를 넘는다.

원문이 제시하는 응용 시나리오는 설계 가능성을 보여 주는 예시로는 유용하다. 그러나 고객 서비스가 변혁됐거나 데이터 분석이 혁명적으로 바뀌었다는 표현은 deployment study가 아니다. 비교군, 사용 조직 수, 성공률, 실패 비용, 평가 기간이 제시되지 않았으므로 기술의 **가능성**과 역사적 **성과**를 분리해서 읽어야 한다.

## 6. 왜 중요한가

기능 호출의 가장 단단한 중요성은 언어 모델이 모든 일을 직접 수행하게 한 데 있지 않다. 확률적 자연어 생성과 결정론적 소프트웨어 인터페이스 사이에 **검사 가능한 중간 표현**을 둔 데 있다.

특히 중요한 점은 다음과 같다.

- **자연어와 API 사이의 접점:** 사용자의 표현을 함수 이름과 typed arguments로 변환해 기존 소프트웨어에 연결할 수 있다.
- **역할 분리:** 모델은 모호한 요청 해석에, 프로그램은 권한·검증·실행에 각각 강점을 쓸 수 있다.
- **관찰을 통한 갱신:** 모델이 외부 결과를 받아 최신 데이터에 근거한 후속 답변이나 다음 행동을 제안할 수 있다.
- **실패의 가시화:** 자유 형식 텍스트 안에 행동 명령을 숨기는 것보다 호출 객체, 결과, 오류를 별도 event로 기록하기 쉽다.
- **재사용 가능한 도구 추상화:** 같은 함수 정의를 여러 대화에서 반복 사용하고, tool selection과 argument quality를 평가할 수 있다.

이 의미를 “모델이 수동적인 텍스트 생성기에서 자율적 행위자로 변했다”는 이분법으로 표현하면 안 된다. 도구를 사용한 연구 시스템은 2023년 6월 이전에도 있었고, API를 받은 모델도 실행 권한·memory·planning·recovery를 자동으로 얻지 않는다. Function calling은 agent system의 중요한 **접속 규약**이지만 완성된 agent architecture는 아니다.

또한 구조화는 reliability를 하나의 이진 속성으로 만들지 않는다. Tool selection accuracy, argument schema pass rate, semantic validity, execution success, side-effect correctness, final-answer faithfulness를 따로 측정해야 한다. 한 지표가 좋아졌다고 전체 시스템이 trustworthy해지는 것은 아니다.

## 7. 현대 LLM과의 연결

### 7.1 Agent loop의 표준 구성요소

현대 agent system은 대체로 “모델 판단 → 도구 호출 제안 → 정책 검사 → 실행 → 관찰 반환 → 다음 판단”을 반복한다. 기능 호출은 이 반복에서 action과 observation을 표현하는 수단이다. [[104_Agentic AI Systems Autonomous Agents with Reasoning, Planning, and Tool Use|Agentic AI Systems]]이 다루는 planning, memory, task state, termination condition과 recovery는 이 인터페이스 위에 별도로 구현해야 한다.

도구 호출을 한 번 성공한 시스템과 장기 agent를 같다고 부르기도 어렵다. 여러 단계가 되면 이전 결과의 보존, dependency, budget, 반복 종료, partial failure, context truncation과 재실행 안전성이 새로운 문제로 생긴다.

### 7.2 RAG와 검색 도구의 차이

Retrieval-augmented generation(RAG)도 외부 정보를 모델 문맥에 넣지만, 일반적인 function calling은 검색 외에도 계산, 업무 API와 쓰기 동작을 포괄한다. 검색 결과를 받는 read-only workflow와 구매·삭제를 수행하는 write workflow는 위험이 다르다. 두 경우 모두 모델은 전달받은 결과의 사실성·최신성·권한을 독립적으로 보장하지 못한다.

### 7.3 Structured Outputs로 이어진 형식 계보

[[099_Structured Outputs Reliable Schema-Validated Data Extraction from Language Models|Structured Outputs]]는 2023년 기능 호출과 연결되지만 동일한 출시가 아니다. 연혁상 다음 세 층으로 나누는 편이 정확하다.

| 기능 | 공개 시점 | 보장하려 한 범위 |
|---|---|---|
| Function calling | 2023-06-13 | 함수 설명을 바탕으로 호출 여부·함수 이름·JSON 인수를 더 안정적으로 생성 |
| JSON mode | 2023-11-06 | 구문상 유효한 JSON 객체 생성 |
| Structured Outputs `strict: true` | 2024-08-06 | 지원되는 JSON Schema에 정확히 맞는 구조 생성 |

마지막 단계도 truthfulness, authorization과 execution success를 보장하지 않는다. “형식 보장”과 “행동 보장” 사이에는 여전히 애플리케이션 검증 계층이 필요하다.

### 7.4 평가와 observability

도구 사용 시스템은 최종 답변만 채점해서는 어디가 개선됐는지 알기 어렵다. 현대 평가에서는 다음 event를 분리해 기록할 가치가 있다.

- 올바른 도구를 선택했는가?
- 불필요한 호출을 피했는가?
- 인수가 JSON·schema·업무 규칙을 통과했는가?
- 권한과 사용자 의도를 충족했는가?
- 실행 결과를 빠뜨리거나 왜곡하지 않았는가?
- 실패했을 때 안전하게 중단하거나 복구했는가?
- 같은 쓰기 호출을 재시도해 중복 부작용을 만들지 않았는가?

이러한 trace가 있어야 model error, orchestration bug, tool outage와 policy failure를 분리할 수 있다. 스키마는 관찰 가능성을 돕지만 자동 평가 체계를 대신하지 않는다.

### 7.5 Chain-of-thought와 action selection

[[080_Chain-of-Thought Prompting Unlocking Latent Reasoning in Language Models.ko|연쇄적 사고 프롬프팅]]은 문제 분해를 돕는 한 방법이고, function calling은 외부 행동을 표현하는 한 방법이다. 둘을 결합할 수 있지만 동일하지 않다. 모델이 길게 추론한다고 올바른 권한을 갖는 것도 아니고, 함수 인수가 유효하다고 내부 추론이 정확한 것도 아니다. Production system에서는 공개 가능한 rationale, 내부 model reasoning, tool trace와 policy decision을 서로 다른 기록으로 관리할 필요가 있다.

## 8. 한계와 비판적 관점

### 8.1 1차 근거와 locator

| 근거 | 확인할 위치 | 뒷받침하는 내용 |
|---|---|---|
| [OpenAI, Function calling and other API updates](https://openai.com/index/function-calling-and-other-api-updates/) | Function calling; safety paragraphs, 2023-06-13 | `gpt-4-0613`·`gpt-4-32k-0613`·`gpt-3.5-turbo-0613`, `functions`·`function_call`, JSON arguments, untrusted tool-output exploit와 사용자 확인 권고 |
| [OpenAI Chat Completions API reference](https://platform.openai.com/docs/api-reference/chat/object) | `function_call.arguments`, `tool_calls[].function.arguments` | 모델이 유효하지 않은 JSON이나 스키마에 없는 매개변수를 생성할 수 있으므로 실행 전 검증해야 한다는 경고 |
| [OpenAI, New models and developer products announced at DevDay](https://openai.com/index/new-models-and-developer-products-announced-at-devday/) | Function calling updates; JSON mode, 2023-11-06 | 한 메시지의 복수 함수 호출과 JSON mode가 6월 이후 별도 업데이트였음을 확인 |
| [OpenAI, Introducing Structured Outputs in the API](https://openai.com/index/introducing-structured-outputs-in-the-api/) | How to use; Under the hood; Limitations, 2024-08-06 | `strict: true`, constrained decoding, schema 일치와 값 오류·parallel-call 제한의 구분 |
| [OpenAI, WebGPT](https://openai.com/index/webgpt/) | Overview, 2021-12-16 | GPT-3가 text browser command와 citation을 사용한 선행 도구 연구 |
| [Karpas et al., MRKL Systems](https://arxiv.org/abs/2205.00445) | Abstract and architecture, 2022-05 | LLM과 외부 지식·discrete reasoning module을 결합한 선행 시스템 관점 |
| [Yao et al., ReAct](https://arxiv.org/abs/2210.03629) | Abstract and §1, 2022-10 / ICLR 2023 | reasoning trace와 task-specific action·observation의 교대 |
| [Gao et al., PAL](https://arxiv.org/abs/2211.10435) | Abstract and method, 2022-11 | LLM이 program을 생성하고 interpreter가 solution step을 실행하는 역할 분리 |
| [Schick et al., Toolformer](https://arxiv.org/abs/2302.04761) | Abstract and §1–§2, 2023-02 | 언제 어떤 API를 어떤 인수로 호출하고 결과를 이용할지 self-supervised 학습 |
| [OpenAI, ChatGPT plugins](https://openai.com/index/chatgpt-plugins/) | Overview and safety, 2023-03-23 | 기능 호출 API보다 앞선 ChatGPT 도구 연결과 배포 안전 논의 |

### 8.2 2023년 기능 호출은 엄격한 스키마 보장이 아니었다

원문은 2023년 출력 형식을 “deterministic and schema-validated”라고 표현하고 함수 호출이 인터페이스와 정확히 일치한다고 서술한다. 이 주장은 후대 Structured Outputs를 소급한 것이다. 2023년 발표는 모델이 함수 signature를 따르는 JSON을 더 잘 생성하도록 fine-tuning됐다고 설명했지만, API reference는 유효하지 않은 JSON과 정의되지 않은 매개변수를 명시적으로 경고한다.

OpenAI가 2024년 Structured Outputs를 발표하면서 공개한 자사 complex-schema evaluation에서도 `gpt-4-0613`의 점수는 40% 미만이었다. 이 수치는 특정 회사 평가의 결과라 일반적인 모든 호출 실패율로 읽으면 안 되지만, 적어도 2023년 모델에 exact schema guarantee가 있었다는 해석과 양립하지 않는다. 엄격한 일치는 `strict: true`와 constrained decoding을 포함한 후대 기능으로 구분해야 한다.

### 8.3 모델은 실행하지 않으며 실행 권한도 갖지 않는다

기능 호출 응답은 실행 가능한 제안일 수 있지만 실행 그 자체는 아니다. 애플리케이션이 모델 출력을 곧바로 함수에 넘길 수도 있으나, 그것은 개발자가 검증 단계를 생략한 system design이지 모델의 고유 능력이 아니다.

따라서 다음 문장을 구분해야 한다.

- 모델이 `send_email`과 인수를 **생성했다**.
- 정책 계층이 해당 호출을 **승인했다**.
- 애플리케이션이 메일 서비스 credential로 함수를 **실행했다**.
- 메일 서비스가 발송 결과를 **반환했다**.
- 모델이 그 결과를 사용자에게 **설명했다**.

이 중 하나가 성공해도 나머지 성공은 보장되지 않는다. 책임 소재와 audit trail도 단계별로 남겨야 한다.

### 8.4 올바른 형식은 올바른 행동이 아니다

Schema adherence는 syntax와 shape를 다룬다. 다음 오류는 모두 schema를 통과할 수 있다.

- 사용자가 언급하지 않은 날짜를 그럴듯하게 추정
- 존재하지만 다른 조직에 속한 고객 ID 선택
- 섭씨 요청을 화씨 값으로 해석
- 이메일 수신자나 결제 금액을 잘못 추출
- 읽기 요청에 쓰기 함수를 선택
- 이미 성공한 주문을 timeout으로 오해해 중복 실행

이를 막으려면 enum과 type뿐 아니라 canonical ID lookup, referential integrity, 범위 제한, 정책 검사, human confirmation과 idempotency key가 필요하다. Structured Outputs 이후에도 이 원칙은 변하지 않는다.

### 8.5 Tool output prompt injection은 별도의 보안 문제다

도구 응답이 모델 context로 돌아오면 외부 데이터가 다음 행동 결정에 영향을 준다. 웹 페이지나 문서의 공격 문구가 모델에게 비밀을 보내거나 다른 도구를 호출하라고 유도할 수 있다. 2023년 발표가 이 위험을 이미 지적했다는 사실은 기능 호출이 처음부터 완성된 안전 경계를 제공하지 않았음을 보여 준다.

스키마는 tool input의 모양을 제한할 수 있지만 tool output 속 자연어가 지시인지 데이터인지 판별하지 못한다. Tool provenance, content sanitization, instruction hierarchy, output-to-action policy와 별도의 승인 단계가 필요하다. 특히 읽기 도구의 결과가 곧바로 쓰기 도구 호출로 이어질 때 trust boundary를 명시해야 한다.

### 8.6 “실시간 정보 접근”은 도구가 제공하는 조건부 능력이다

함수가 현재 날씨나 계정 상태를 반환하면 모델은 그 결과를 사용해 답할 수 있다. 그러나 모델 자체의 training cutoff가 사라진 것은 아니다. 어떤 도구를 호출할지 모르거나, 오래된 endpoint를 선택하거나, 최신 결과를 과거 지식으로 덮어쓰거나, 반환 시각과 단위를 잘못 설명할 수 있다.

실시간성은 최소한 data source freshness, request timestamp, cache policy, tool success와 final-answer grounding이 함께 충족될 때 성립한다. “Function calling이 모델의 실시간 정보 한계를 해결했다”보다 “애플리케이션이 최신 데이터를 제공할 수 있는 경로를 만들었다”가 정확하다.

### 8.7 여러 함수 중 선택과 병렬 실행은 다른 평가 문제다

후보가 많아질수록 잘못된 tool selection, 비슷한 함수명, 긴 schema context와 권한 과다 노출 문제가 생긴다. 병렬 호출에서는 dependency, execution order, partial failure와 result matching까지 추가된다. 한 함수의 argument accuracy를 측정한 결과로 수십 개 도구의 routing이나 병렬 workflow 신뢰성을 일반화할 수 없다.

좋은 평가는 single-call과 multi-call, read-only와 side-effecting, independent와 dependent tools를 나눠야 한다. 원문은 이 구분 없이 “복수 함수를 동시에 처리”한다고 서술해 2023년 6월 기능 범위를 넓힌다.

### 8.8 응용 사례는 영향의 증거가 아니다

원문은 고객 서비스, coding assistant, data analysis, e-commerce, 여행, personal assistant와 research assistant가 변혁되거나 혁명적으로 바뀌었다고 말한다. 그러나 특정 배포의 이름, 사용량, 비교 전후 지표, 오류율과 출처를 제시하지 않는다. 이는 **가능한 application catalogue**이지 **산업 영향 평가**가 아니다.

채택이나 변화를 입증하려면 적어도 다음 자료가 필요하다.

- 기간별 API 사용량과 실제 조직 수
- 기능 호출 전후 task completion·human escalation·error rate 비교
- 잘못된 호출과 보안 incident의 빈도·심각도
- latency, token·tool cost와 운영 인력 비용
- 분야별 사용자 연구와 독립 재현
- 다른 tool-use interface와의 비교

이 자료 없이 “function calling이 분야를 transformed/revolutionized했다”, “여러 provider가 표준으로 채택했다”거나 “production-ready reliability를 확립했다”는 문장은 역사적 사실보다 홍보적 평가에 가깝다.

### 8.9 Function calling은 agent의 필요조건일 수 있어도 충분조건은 아니다

실용적인 agent에는 tool interface 외에도 task decomposition, state, memory, stopping rule, retry budget, exception handling, permission model, monitoring과 recovery가 필요하다. 모델이 함수 이름과 인수를 낼 수 있다는 사실만으로 장기 계획을 안정적으로 수행하거나 안전하게 자율화되는 것은 아니다.

오히려 행동 권한이 생기면 텍스트 오류가 실제 부작용으로 바뀐다. Agent capability를 높이는 동시에 blast radius를 제한해야 한다. 최소 권한, read/write 분리, sandbox, dry run, 사용자 확인과 rollback 가능성을 architecture의 일부로 설계해야 한다.

### 8.10 지연 시간과 비용은 단순 round-trip 수보다 넓다

도구 workflow는 모델 호출, 외부 API, 결과 반환, 후속 모델 호출이 이어져 latency와 cost가 늘 수 있다. 여기에 schema token, retry, validation, timeout과 observability storage도 들어간다. 반대로 한 번의 정확한 조회가 긴 hallucinated dialogue를 줄일 수도 있으므로 항상 더 비싸다고 단정할 수는 없다.

비교할 때는 end-to-end task success당 비용, p50/p95 latency, 실패 후 재시도, 외부 API 비용과 human review까지 포함해야 한다. 원문의 “overhead” 지적은 타당하지만 측정 조건이 없어 규모를 판단할 수 없다.

## 9. 용어 정리

| 용어 | 설명 |
|---|---|
| Function calling | 개발자가 설명한 함수 가운데 모델이 호출할 함수 이름과 인수를 구조화해 생성하는 인터페이스 |
| Tool use | 언어 모델 기반 시스템이 검색, 계산기, database, code runtime, 업무 API 같은 외부 능력을 이용하는 더 넓은 개념 |
| Function schema | 함수 이름·설명·매개변수 type과 constraint를 기술한 인터페이스 정의. 실행 코드나 권한 정책은 아니다. |
| JSON Schema | JSON document의 구조와 type, required field, enum 등을 기술하는 표준 형식 |
| Tool call proposal | 모델이 생성한 함수 이름과 인수. 애플리케이션이 아직 승인·실행하지 않은 상태를 강조하는 표현 |
| Argument validation | 생성된 인수가 JSON, schema와 업무 규칙을 만족하는지 실행 전에 검사하는 과정 |
| Semantic validation | 값의 형식뿐 아니라 실제 entity, 범위, 사용자 의도와 domain rule에 맞는지 확인하는 과정 |
| Authorization | 인증된 사용자가 해당 resource와 action을 수행할 권한이 있는지 서버가 판정하는 절차 |
| Side effect | 이메일 발송, 결제, 삭제처럼 외부 상태를 바꾸는 실행 결과 |
| Tool result / observation | 애플리케이션이 함수를 실행한 뒤 모델에 돌려주는 데이터·오류·상태 |
| JSON mode | 2023년 11월 발표된 유효한 JSON 객체 생성 기능. 특정 schema 일치까지 보장하지 않는다. |
| Structured Outputs | 2024년 8월 발표된 schema-constrained output 기능. `strict: true`로 지원 schema의 구조 일치를 강화한다. |
| Parallel function calling | 한 모델 응답에서 여러 함수 호출을 생성해 함께 처리할 수 있게 하는 기능. 여러 후보 함수를 나열하는 것과 다르다. |
| Constrained decoding | 다음 token 후보를 schema상 유효한 범위로 제한해 구조 위반을 막는 decoding 방식 |
| Prompt injection | 외부 데이터 속 지시가 모델의 원래 지시와 정책을 교란해 의도하지 않은 행동을 유도하는 공격 |
| Least privilege | 각 도구에 과업 수행에 필요한 최소 권한과 범위만 부여하는 보안 원칙 |
| Idempotency | 같은 요청이 재실행돼도 중복 결제·발송 같은 추가 부작용을 만들지 않는 성질 |
| Agent loop | 모델의 판단, tool action, environment observation과 다음 판단이 반복되는 실행 구조 |
| ReAct | Reasoning trace와 task-specific action·observation을 번갈아 생성하는 선행 agent pattern |
| Toolformer | 모델이 API 호출의 시점·종류·인수와 결과 사용을 self-supervised 방식으로 학습하도록 한 연구 |

## 10. 함께 보면 좋은 항목

- [[080_Chain-of-Thought Prompting Unlocking Latent Reasoning in Language Models.ko|연쇄적 사고 프롬프팅]] — 중간 추론 생성과 외부 도구 실행 인터페이스가 어떻게 다른지 비교한다.
- [[081_ChatGPT Conversational AI Becomes Mainstream.ko|ChatGPT]] — 2022년 말 대화형 배포와 2023년 plugins·function calling으로 이어진 제품 맥락을 살펴본다.
- [[099_Structured Outputs Reliable Schema-Validated Data Extraction from Language Models|Structured Outputs]] — 2023년의 “더 신뢰할 수 있는 JSON”과 2024년 `strict: true`의 schema guarantee를 구분한다.
- [[104_Agentic AI Systems Autonomous Agents with Reasoning, Planning, and Tool Use|Agentic AI Systems]] — function calling 위에 필요한 planning, memory, orchestration과 safety control을 이어서 본다.

## 11. 읽고 생각해볼 질문

1. 모델이 함수 이름과 JSON 인수를 생성한 시점과 외부 행동이 실제로 수행된 시점을 구분해야 하는 이유는 무엇인가?
2. JSON 구문 유효성, schema 일치와 의미 정확성은 각각 어떤 실패를 막고 어떤 실패를 막지 못하는가?
3. 2023년 6월 기능 호출과 2024년 8월 Structured Outputs를 같은 기능으로 설명하면 어떤 역사적·기술적 오류가 생기는가?
4. 여러 함수 정의 중 하나를 선택하는 것과 한 응답에서 여러 함수를 병렬 호출하는 것은 architecture와 평가에서 어떻게 다른가?
5. 유효한 스키마를 통과한 이메일 발송 요청에도 사용자 확인과 권한 검사가 필요한 이유는 무엇인가?
6. Tool output에 prompt injection이 들어 있을 때 input schema validation만으로 방어할 수 없는 이유는 무엇인가?
7. Function calling이 real-time information을 “모델에 내장”한 것이 아니라 “애플리케이션 경로로 제공”했다는 구분은 어떤 운영 조건을 드러내는가?
8. WebGPT, MRKL, ReAct, PAL과 Toolformer를 함께 보면 2023년 6월 OpenAI 발표의 고유한 기여를 어떻게 더 정확히 표현할 수 있는가?
9. 고객 서비스나 데이터 분석이 “변혁됐다”는 주장을 검증하려면 어떤 deployment·failure·cost 지표가 필요한가?
10. Function calling만 있고 state, stopping rule, retry policy와 permission model이 없는 시스템을 agent라고 부를 때 무엇을 놓치게 되는가?

## 12. 짧은 결론

2023년 6월 OpenAI의 기능 호출은 `gpt-4-0613`, 같은 개선을 포함한 `gpt-4-32k-0613`, 그리고 `gpt-3.5-turbo-0613`이 개발자 정의 함수 가운데 적절한 이름과 JSON 인수를 생성하도록 한 중요한 API 변화였다. 그 가치는 언어 모델이 직접 세계를 조작하게 만든 데 있지 않고, 확률적 자연어 해석과 기존 소프트웨어 실행 사이에 검사 가능한 호출 객체를 둔 데 있다. 모델은 호출을 제안하고, 애플리케이션은 구문·스키마·의미·권한을 검증해 실행 여부를 결정하며, 도구 결과를 다시 모델에 전달한다. 이 경계를 흐리면 형식 신뢰성을 행동 안전으로 오해하게 된다.

역사적으로도 2023년 6월은 출발점 하나가 아니라 WebGPT, MRKL, ReAct, PAL, Toolformer와 ChatGPT plugins 뒤에 놓인 제품화 단계다. 당시 기능 호출은 유효하지 않은 JSON과 환각한 매개변수 가능성을 남겼고, 한 응답의 복수 호출은 2023년 11월, 엄격한 schema adherence는 2024년 8월에 별도 기능으로 추가됐다. Structured Outputs 이후에도 값의 사실성, 권한, 외부 실행 성공과 prompt injection은 해결되지 않는다. 따라서 function calling은 현대 agent system의 핵심 인터페이스지만, 그 자체가 결정론적 실행기·안전 경계·완성된 agent는 아니다. 원문의 다양한 응용 사례는 가능성을 보여 주지만 산업 변혁과 광범위한 adoption을 입증하지 않으며, 그런 평가는 실제 배포 지표와 실패 자료로 별도 검증해야 한다.
