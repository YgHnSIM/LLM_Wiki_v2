---
schema_version: 2
id: analysis.eliza에서-llm으로
page_type: analysis
title: ELIZA에서 LLM으로
aliases:
  - ELIZA to LLM
  - ELIZA와 대규모 언어 모델
  - 대화형 AI의 이해 문제
tags:
  - type/analysis
  - domain/ai
  - domain/nlp
  - domain/conversational-ai
created: '2026-07-14'
updated: '2026-07-21'
lifecycle: active
verification: partial
artifacts:
  - raw/002_The Turing Test.md
  - raw/002_The Turing Test.commentary.md
  - raw/007_ELIZA - The First Conversational AI Program.ko.md
  - raw/007_ELIZA - The First Conversational AI Program.commentary.ko.md
  - raw/009_SHRDLU - Understanding Language Through Action.ko.md
  - raw/009_SHRDLU - Understanding Language Through Action.commentary.ko.md
  - 'raw/081_ChatGPT Conversational AI Becomes Mainstream.ko.md'
  - 'raw/081_ChatGPT Conversational AI Becomes Mainstream.commentary.ko.md'
evidence:
  - source_id: turing-1950
    locator: 'pp. 433–460, §§1–7'
    relation: supports
  - source_id: weizenbaum-1966
    locator: pp. 36–45
    relation: supports
  - source_id: mit-eliza-1965
    locator: ELIZA source and DOCTOR script records
    relation: supplements
  - source_id: winograd-1971
    locator: chapters 1–3, especially pp. 1–39
    relation: supports
  - source_id: winograd-1980
    locator: pp. 212–218
    relation: contextualizes
  - source_id: openai-2022-introducing-chatgpt
    locator: '도입부와 Methods·Limitations·Iterative deployment의 dialogue format, 대화 시연 SFT→응답 순위·reward model→PPO, 공개 한계와 사용자 피드백 절차'
    relation: supports
related:
  - concept.eliza
  - concept.eliza-효과
  - concept.doctor-스크립트
  - concept.튜링-테스트
  - concept.행동-기반-지능-기준
  - concept.대규모-언어-모델
  - concept.chatgpt-2022
  - concept.shrdlu
  - concept.블록-세계
  - concept.마이크로월드
  - source.081
  - analysis.ai-시연과-실제-성능
---
# ELIZA에서 LLM으로

> [!note] 학습 안내
> **난이도:** 입문<br>
> **선수 지식:** [[ELIZA]], [[대규모 언어 모델]], [[ChatGPT 연구 미리보기 (2022)]]<br>
> **읽고 나면:** ELIZA와 2022년 ChatGPT를 작동 방식·역할 인터페이스·사용자 귀속·신뢰성의 층위로 비교하고, 닮은 사용 경험을 직접 기술 계보로 오해하지 않을 수 있다.

## 1단계 — 먼저 잡을 핵심

### 비교 질문과 잠정 결론

[[ELIZA]]와 현대 [[대규모 언어 모델]]은 모두 인간에게 자연스럽게 느껴지는 언어 상호작용을 만들지만, 그 작동 방식과 범위는 크게 다르다. 특히 [[ChatGPT 연구 미리보기 (2022)]]는 언어 모델 하나가 아니라 대화형 RLHF, 다중 턴 인터페이스와 사용자 피드백 통로를 묶어 공개했다. 이 역사적 비교는 직접 계보를 주장하지 않는다. 서로 다른 기술이 비슷한 대화 표면에서 어떻게 능력과 신뢰를 과대 귀속하게 만드는지 묻는다.

## 2단계 — 작동 원리

### 작동 방식의 차이

ELIZA는 대화 규칙을 실행하는 프레임워크였고 [[DOCTOR 스크립트]]는 그 위에서 치료사 역할을 구현했다. 어떤 키워드를 중요하게 볼지, 어떤 [[패턴 매칭]]과 응답 템플릿을 사용할지, 실패 시 어떤 [[대화 복구|fallback]]을 쓸지 설계자가 직접 정했다. 현대 LLM은 대규모 데이터에서 토큰 간 패턴과 표현을 학습해 훨씬 넓은 문맥에서 새 문장을 생성한다.

[[SHRDLU]]는 이 둘 사이의 단순한 중간 단계가 아니라 다른 설계 축을 보여준다. [[블록 세계]]의 구조화된 상태에 언어를 연결하고, 통사·의미·추론·계획을 통합했다. 자연어의 범위는 좁았지만 출력의 자연스러움만이 아니라 명령 실행과 상태 질의로 해석을 시험할 수 있었다.

### 역할 설정의 연속성

작동 방식은 다르지만, 대화 역할이 사용자 해석을 바꾼다는 평가 문제는 이어진다. [[DOCTOR 스크립트]]의 “심리치료사” 프레임은 모호한 응답을 공감과 절제로 보이게 했다. 2022년 ChatGPT의 범용 assistant 역할과 채팅 인터페이스는 사용자가 후속 질문을 하고 모델의 앞선 답을 지적·수정하도록 했으며, 그 결과 한 번의 completion보다 협력적인 상대처럼 보이게 했다. 이 유사성은 역할과 인터페이스가 사용자 귀속을 조직한다는 뜻이지, ELIZA가 ChatGPT의 기술적 선조이거나 두 시스템의 능력이 같다는 뜻은 아니다.

### 2022년 ChatGPT가 결합한 네 층

공식 발표에서 확인되는 [[ChatGPT 연구 미리보기 (2022)|2022년 ChatGPT]]는 GPT-3.5 계열 모델, 인간이 양쪽 대화 역할을 시연한 SFT와 응답 순위·reward model·PPO의 대화형 [[인간 피드백 강화학습|RLHF]], 다중 턴 채팅 UI, 문제 출력과 필터 오류를 받는 공개 피드백 통로를 결합했다. ELIZA에서는 규칙·스크립트·역할 프레임이 비교적 뚜렷이 분리됐다면, ChatGPT에서는 모델 정책과 정렬 자료, 인터페이스와 배포 운영이 함께 사용 경험을 만든다.

다중 턴은 같은 대화 안에서 앞선 발화를 문맥으로 이어 쓰는 기능이다. 세션이나 계정을 넘어 사용자 정보를 보존하는 persistent memory와는 다르며, 2022년 발표는 후자를 공개한 근거가 아니다. 따라서 대화가 이어진다는 관찰만으로 시스템이 사용자를 장기적으로 기억하거나 안정된 인격을 지녔다고 귀속해서는 안 된다.

## 3단계 — 기술과 근거

### ELIZA 효과의 확장

[[ELIZA 효과]]는 시스템의 실제 능력보다 더 많은 이해와 공감을 사용자가 귀속할 때 발생한다. 현대 대화형 AI의 높은 유창성, 범용 assistant 역할과 후속 대화 UI는 이 효과를 약화시키기보다 더 강하게 만들 수 있다. 사용자가 오류를 지적했을 때 모델이 사과하고 답을 고치는 행동도 유용하지만, 그 장면만으로 모델이 오류의 원인을 이해했거나 다음에도 신뢰성 있게 수정한다고 결론 내릴 수는 없다. 특히 정서적 조언, 의료·법률·재정처럼 잘못된 신뢰의 비용이 큰 상황에서는 시스템의 한계와 인간 감독을 분명히 해야 한다.

### 평가 원칙

- 대화 자연스러움과 사실 정확성을 분리한다.
- 역할 연기와 실제 전문 능력을 구분한다.
- fallback이 실패를 숨기는지, 한계를 적절히 알리는지 확인한다.
- 단기적 인상뿐 아니라 긴 대화의 일관성과 실제 과업 성능을 평가한다.
- 같은 대화의 문맥 유지와 대화 밖의 persistent memory를 구분한다.
- 공개된 선택 예시와 반복·대표 표본에서 측정한 신뢰성 지표를 구분한다.
- 사용자가 시스템을 어떻게 의인화하고 신뢰하는지 측정한다.

## 검증과 한계

### 확인된 사실

ELIZA의 규칙·스크립트 구조와 SHRDLU의 폐쇄된 세계 연결은 각 시스템의 1차 자료로 확인된다. OpenAI의 2022년 발표는 ChatGPT의 dialogue format, 대화 시연 SFT에서 응답 순위·reward model과 PPO로 이어지는 학습, 다중 턴 상호작용, 무료 연구 미리보기와 사용자 피드백 절차를 확인한다. 이 자료들은 세 시스템의 기술적 동일성이나 직접 계보를 뒷받침하지 않으며, 여기서는 대화 출력과 평가에서 반복되는 문제를 비교한다.

### 유창성과 이해

ELIZA는 제한된 규칙만으로도 이해하는 듯 보일 수 있음을 보여주었다. LLM은 ELIZA보다 훨씬 복잡하므로 두 시스템을 기술적으로 동일시하면 안 된다. 2022년 ChatGPT 발표 역시 그럴듯한 오답, 표현 민감성, 장황함, 모호한 의도에 대한 추측과 유해·편향 응답을 한계로 명시했다. 공식 글에 실린 선택된 대화와 공개적으로 관찰된 몇 가지 행동은 가능성을 보여 주지만, 대표 조건에서의 정확도나 반복 신뢰성을 입증하는 독립 평가가 아니다. 그럼에도 자연스러운 출력만으로 이해·의식·신뢰 가능한 추론을 확정할 수 없다는 평가 문제는 남아 있다. ELIZA를 [[튜링 테스트]]의 최초 구현으로 보는 대신 후대의 비교 대상으로 다룬다.

SHRDLU 역시 폐쇄된 [[마이크로월드]] 안에서 기능적 이해를 보여줬지만, 그 성공을 열린 세계의 일반 이해로 확대할 수는 없었다. 세 시스템을 비교할 때는 규칙·학습 여부만 아니라 세계 상태와의 연결, 행동 검증, 영역 확장 비용을 함께 봐야 한다.

### 비교를 통한 해석

자연스러운 문장, 역할 프레임, 기능적 과업 성공은 서로 다른 평가 층위다. ChatGPT 사례에서는 여기에 모델 정책, 대화형 RLHF, 다중 턴 UI와 배포 피드백도 분리해 보아야 한다. 모델이 낸 문장과 인터페이스가 제공한 상호작용을 한 덩어리의 “이해”로 해석하면, 실제 능력과 사용자가 귀속한 능력의 경계가 흐려진다. 이 구분을 현대 대화형 AI에 적용하는 것은 여러 자료를 함께 읽은 합성 해석이다.

### 아직 입증되지 않은 계보

ELIZA나 SHRDLU가 ChatGPT를 포함한 현대 LLM으로 직접 이어졌다는 단선적 계보는 이 문서의 근거가 입증하지 않는다. 역할 인터페이스와 사용자 귀속이라는 공통 질문이 반복된다는 사실은 코드·학습법·조직의 직접 영향 관계와 다르다. 비교가 보여주는 것은 공통 질문과 설계 차이다.

## 학습 확인

### 확인 질문

1. DOCTOR의 치료사 역할과 2022년 ChatGPT의 assistant·채팅 인터페이스는 각각 사용자 귀속을 어떻게 바꾸는가?
2. ChatGPT의 모델, 대화형 RLHF, 다중 턴 UI와 피드백 배포를 분리해야 하는 이유는 무엇인가?
3. 다중 턴과 persistent memory, 선택된 공개 행동과 반복 신뢰성을 각각 구분해야 하는 이유는 무엇인가?

### 다음 문서

- [[AI 시연과 실제 성능]] — 대화의 인상을 넘어 서로 다른 AI 시연을 같은 평가 층위에서 비교한다.
- [[081_ChatGPT 연구 미리보기와 대화형 LLM 배포]] — 2022년 발표가 확인한 학습·인터페이스·배포 구조와 한계를 직접 확인한다.
- [[ChatGPT 연구 미리보기 (2022)]] — 모델 하나가 아니라 대화형 RLHF·UI·피드백을 결합한 역사적 배포 체계로 읽는다.

## 출처

- [[002_튜링 테스트]]
- [[007_ELIZA]]
- [[009_SHRDLU]]
- [[081_ChatGPT 연구 미리보기와 대화형 LLM 배포]]
- OpenAI, [Introducing ChatGPT](https://openai.com/index/chatgpt/), 2022-11-30; 도입부, `Methods`, `Limitations`, `Iterative deployment`.

## 관련 항목

- [[ELIZA]]
- [[ELIZA 효과]]
- [[DOCTOR 스크립트]]
- [[튜링 테스트]]
- [[행동주의적 지능 기준]]
- [[대규모 언어 모델]]
- [[ChatGPT 연구 미리보기 (2022)]]
- [[081_ChatGPT 연구 미리보기와 대화형 LLM 배포]]
- [[SHRDLU]]
- [[블록 세계]]
- [[마이크로월드]]
- [[AI 시연과 실제 성능]]
