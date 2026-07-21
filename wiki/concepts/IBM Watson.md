---
schema_version: 2
id: concept.ibm-watson
page_type: concept
title: IBM Watson
aliases:
  - Watson Jeopardy system
  - 왓슨
  - Jeopardy Watson
tags:
  - type/concept
  - domain/ai
  - domain/computer-science
  - domain/nlp
  - domain/machine-learning
created: '2026-07-18'
updated: '2026-07-21'
lifecycle: active
verification: verified
artifacts:
  - 'raw/040_IBM Watson on Jeopardy! - Historic AI Victory That Demonstrated Open-Domain Question Answering.ko.md'
  - 'raw/040_IBM Watson on Jeopardy! - Historic AI Victory That Demonstrated Open-Domain Question Answering.commentary.ko.md'
evidence:
  - source_id: ferrucci-et-al-2010-building-watson
    locator: 'AI Magazine 31(3), pp. 59–79의 Watson 목표·DeepQA 구조·blind clue 성능·하드웨어 확장'
    relation: supports
  - source_id: lewis-2012-watson-jeopardy-interface
    locator: '전자 텍스트 입력·솔레노이드 buzzer·음성 합성·경기 상태 인터페이스 설명'
    relation: supports
  - source_id: ferrucci-et-al-2013-watson-beyond-jeopardy
    locator: 'pp. 93–105의 Jeopardy용 question-in/single-answer-out 구조와 후속 영역 적응 범위'
    relation: contextualizes
  - source_id: ibm-watson-jeopardy-history
    locator: '2011년 경기 결과·Toronto 오답·90대 서버·2,880개 코어·인터넷 미접속 설명'
    relation: supports
related:
  - source.040
  - concept.deepqa
  - concept.개방-영역-질의응답
  - entity.ibm
---
# IBM Watson

> [!note] 학습 안내
> **난이도:** 입문<br>
> **선수 지식:** 없음<br>
> **읽고 나면:** Watson이 어떤 입력과 자료로 답을 만들고 경기에서 행동했는지 설명하며, 우승 결과와 범용 언어 능력을 구분할 수 있다.

## 1단계 — 먼저 잡을 핵심

IBM Watson은 IBM Research가 *Jeopardy!*의 자연어 clue에 답하도록 만든 질의응답 시스템이다. [[DeepQA]] 구조로 문서를 검색해 후보 답을 만들고, 여러 분석기가 찾은 근거를 점수화해 최종 답과 신뢰도를 정했다. 2011년 Ken Jennings·Brad Rutter와 겨룬 두 게임 특별 경기에서 누적 77,147달러로 우승했다.

## 2단계 — 작동 원리

### 시스템의 경계

Watson은 무대의 소리와 영상을 사람처럼 인식하지 않았다. category와 clue를 전자 텍스트로 받고, 답할 준비가 되면 솔레노이드로 buzzer를 눌렀으며 음성 합성으로 답했다. 진행자의 판정도 음성으로 듣지 않고 점수와 경기 흐름의 변화를 이용했다. 오디오·비디오 단서와 특별 진행 지시는 과업에서 제외됐다.

실제 경기 중 인터넷에 접속하지 않았고 미리 구축한 로컬 corpus와 구조 지식 자원을 사용했다. 개발 단계에서 웹은 corpus 확장에 쓰였다. 따라서 Watson을 “인터넷 검색만 한 시스템”으로 보는 설명과 “웹 자료와 전혀 무관한 시스템”이라는 설명이 모두 지나치다.

## 3단계 — 기술과 근거

### 성능과 계산 자원

2010년 기술 논문은 2,000개가 넘는 blind clue에서 Watson이 약 70%의 문제를 시도할 때 약 85% 정밀도에 도달한 수준을 보고했다. 초기에는 질문 하나에 약 두 시간이 걸렸지만 대규모 병렬화 뒤 2,500개가 넘는 코어에서 3–5초 응답이 가능해졌다. 무대 시스템은 90대 서버와 2,880개 프로세서 코어 규모였다.

방송의 최종 상금은 원시 질의응답 정확도가 아니다. buzzer 경쟁, clue 선택, Daily Double·Final Jeopardy 베팅과 오답 위험이 함께 작용했다. Toronto 오답에서 낮은 신뢰도에 따라 작은 금액을 건 것은 정확도 추정과 게임 행동이 분리되어 있음을 보여준다.

### 역사적 의미

Watson은 역사·과학·문학·대중문화처럼 주제가 넓고 표현이 복잡한 clue에 수초 안에 답한 대표적인 [[개방 영역 질의응답]] 시연이다. 여러 검색기·분석기·지식 자원을 하나의 신뢰도와 행동으로 통합할 수 있음을 대중 앞에서 보였다.

그러나 *Jeopardy!* 형식은 짧은 텍스트 질문에서 짧은 단일 답을 고르는 과업이었다. 장기 대화, 시청각 이해, 실시간 최신 정보, 설명 생성, 의료 의사결정까지 해결한 것은 아니다. 2013년 회고는 당시 Watson을 `question in, single answer out`으로 설명하고, 의료 영역으로 전환하려면 자료·증거·상호작용과 의사결정 과정을 크게 바꿔야 한다고 밝혔다.

## 검증과 한계

### 현대 언어 모델과의 구분

Watson은 명시적으로 후보를 생성하고 로컬 자료에서 근거를 찾은 뒤 수십 개 점수로 순위를 매겼다. 현대 [[대규모 언어 모델]]은 보통 토큰 분포를 학습한 하나의 신경망으로 가변 길이 텍스트를 생성하며, 검색은 선택적 외부 구성요소다. 검색·근거 결합·불확실성이라는 질문을 공유하지만 같은 구조나 단일 직접 계보는 아니다.

## 학습 확인

1. IBM Watson은 Jeopardy clue를 어떤 형태로 받아 어떤 구조로 답을 골랐는가?
2. 질의응답 점수와 buzzer·베팅을 포함한 경기 결과는 왜 같은 측정값이 아닌가?
3. Watson과 현대 대규모 언어 모델을 같은 구조로 볼 수 없는 이유는 무엇인가?

다음에는 [[개방 영역 질의응답]]에서 Watson이 보여 준 과업의 범위를 정리하고, [[AI 시연과 실제 성능]]에서 공개 시연과 일반 성능을 구분하는 법을 비교한다.

## 출처

- David Ferrucci 외, [Building Watson: An Overview of the DeepQA Project](https://aaai.org/ai-magazine/the-ai-behind-watson-the-technical-article/), *AI Magazine* 31(3), 2010, pp. 59–79.
- B. L. Lewis, [In the Game: The Interface between Watson and Jeopardy!](https://research.ibm.com/publications/in-the-game-the-interface-between-watson-and-jeopardy), 2012.
- David Ferrucci 외, [Watson: Beyond Jeopardy!](https://scalar.usc.edu/works/meet-my-friend-watson-1/media/Beyond%20Jeopardy.pdf), 2013, pp. 93–105.
- IBM, [Watson on Jeopardy!](https://www.ibm.com/history/watson-jeopardy), 경기 결과·하드웨어·인터넷 조건 절.
- [[040_IBM Watson과 Jeopardy 질의응답]]
- 프로젝트 보존 자료: `raw/040_IBM Watson on Jeopardy! - Historic AI Victory That Demonstrated Open-Domain Question Answering.ko.md`, `raw/040_IBM Watson on Jeopardy! - Historic AI Victory That Demonstrated Open-Domain Question Answering.commentary.ko.md`.

## 관련 항목

- [[040_IBM Watson과 Jeopardy 질의응답]]
- [[DeepQA]]
- [[개방 영역 질의응답]]
- [[IBM]]
