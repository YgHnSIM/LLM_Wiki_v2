---
schema_version: 2
id: analysis.ai-시연과-실제-성능
page_type: analysis
title: AI 시연과 실제 성능
aliases:
  - AI demos and real-world performance
  - 데모와 실제 성능
  - 통제된 AI 시연
tags:
  - type/analysis
  - domain/ai
created: '2026-05-08'
updated: '2026-07-21'
lifecycle: active
verification: partial
artifacts:
  - raw/003_Georgetown-IBM Machine.md
  - raw/003_Georgetown-IBM Machine.commentary.md
  - raw/002_The Turing Test.md
  - raw/006_1962_위드로-호프_MADALINE.md
  - raw/006_1962_위드로-호프_MADALINE_해설.md
  - raw/007_ELIZA - The First Conversational AI Program.ko.md
  - raw/007_ELIZA - The First Conversational AI Program.commentary.ko.md
  - raw/009_SHRDLU - Understanding Language Through Action.ko.md
  - raw/009_SHRDLU - Understanding Language Through Action.commentary.ko.md
  - 'raw/040_IBM Watson on Jeopardy! - Historic AI Victory That Demonstrated Open-Domain Question Answering.ko.md'
  - 'raw/040_IBM Watson on Jeopardy! - Historic AI Victory That Demonstrated Open-Domain Question Answering.commentary.ko.md'
evidence:
  - source_id: macdonald-1963
    locator: pp. 1–4
    relation: supports
  - source_id: turing-1950
    locator: 'pp. 433–460, §§1–7'
    relation: supports
  - source_id: widrow-lehr-1990
    locator: pp. 1415–1433
    relation: supports
  - source_id: weizenbaum-1966
    locator: pp. 36–45
    relation: supports
  - source_id: winograd-1971
    locator: chapters 1–3, especially pp. 1–39
    relation: supports
  - source_id: winograd-1980
    locator: pp. 212–218
    relation: contextualizes
  - source_id: ferrucci-et-al-2010-building-watson
    locator: 'AI Magazine 31(3), pp. 59–79의 Jeopardy 과업 정의·blind clue 평가·DeepQA 구조·소수 경기와 원시 QA 성능의 구분'
    relation: supports
  - source_id: lewis-2012-watson-jeopardy-interface
    locator: '전자 텍스트 clue 입력·솔레노이드 buzzer·음성 합성·경기 상태 인터페이스 설명'
    relation: supports
  - source_id: ferrucci-et-al-2013-watson-beyond-jeopardy
    locator: 'pp. 93–105의 Jeopardy용 단일 답 출력과 의료 영역 전환에 필요한 자료·증거·상호작용 변경'
    relation: contextualizes
  - source_id: ibm-watson-jeopardy-history
    locator: '2011년 두 게임 특별 경기·최종 점수·Toronto 오답·하드웨어·인터넷 조건 기록'
    relation: contextualizes
related:
  - concept.기계-번역
  - concept.규칙-기반-기계-번역
  - concept.튜링-테스트
  - analysis.튜링-테스트와-llm-평가
  - concept.madaline
  - concept.적응-필터
  - analysis.퍼셉트론에서-madaline으로
  - concept.eliza
  - concept.eliza-효과
  - analysis.eliza에서-llm으로
  - concept.shrdlu
  - concept.마이크로월드
  - source.040
  - concept.ibm-watson
  - concept.deepqa
  - concept.개방-영역-질의응답
  - concept.대규모-언어-모델
---
# AI 시연과 실제 성능

> [!note] 학습 안내
> **난이도:** 중급<br>
> **선수 지식:** [[ELIZA에서 LLM으로]], [[040_IBM Watson과 Jeopardy 질의응답]]<br>
> **읽고 나면:** 공개 AI 시연을 인터페이스·과업 경계·측정·공개 효과로 나누어 실제 성능의 범위를 판정할 수 있다.

## 1단계 — 먼저 잡을 핵심

### 비교 질문과 잠정 결론

[[AI 시연과 실제 성능]]의 핵심 쟁점은 통제된 조건에서 성공한 AI 시스템을 실제 환경에서도 같은 수준으로 작동한다고 해석할 수 있는가에 있다. [[003_Georgetown-IBM 기계 번역 시연]]부터 [[040_IBM Watson과 Jeopardy 질의응답]]까지 공개 시연은 실제 기술적 성과와 잘 설계된 무대 조건을 동시에 가진다. 중요한 것은 시연을 가짜로 치부하거나 일반 지능의 증명으로 확대하는 양극단이 아니라, **무엇을 입력받았고, 어떤 조건에서 측정됐으며, 관객이 본 결과가 어느 능력을 대표하는지**를 분리하는 일이다.

## 2단계 — 작동 원리

### 비교 논리

먼저 기계가 실제로 받은 입력과 낸 출력을 확인한다. 이어 과업에서 제외된 조건과 반복 평가의 지표를 찾고, 마지막으로 공개 장면이 측정값보다 넓은 능력을 암시했는지 구분한다.

## 3단계 — 기술과 근거

### Georgetown-IBM 사례

1954년 Georgetown-IBM 시연은 러시아어 문장 60개를 영어로 자동 번역하며 기계 번역의 가능성을 대중적으로 각인시켰다. 그러나 문장들은 미리 선별되고 테스트되었으며, 시스템이 처리하기 어려운 복잡한 구문과 모호성은 상당 부분 배제되었다. 따라서 이 시연은 가능성의 증명이었지만, 일반 문서 번역 능력의 엄격한 평가는 아니었다.

### 튜링 테스트와의 연결

[[튜링 테스트]] 역시 제한된 상호작용 조건에서 기계가 인간처럼 보일 수 있는지를 묻는다. 이 기준은 언어 행동의 중요성을 선명하게 보여주지만, 실제 AI 시스템의 신뢰성, 안전성, 과업 수행 능력을 모두 설명하지는 않는다. Georgetown-IBM 시연과 튜링 테스트는 모두 "보이는 성능"과 "일반화 가능한 능력"을 구분해야 한다는 문제를 남긴다.

### MADALINE과 적응 필터의 구분

[[006_위드로-호프의 MADALINE]]은 하드웨어로 구현한 초기 다요소 신경망과 학습 규칙을 보여준다. 초기 응용에는 패턴·음성 인식, 기상 예측, 적응 제어가 포함됐다. 연구진은 이후 [[LMS 알고리즘]]을 [[적응 필터]]에 적용하는 방향으로 이동했고, 잡음 제거·적응 등화·에코 제거는 이 후속 계보에서 발전했다. 이를 MADALINE이나 [[음성 활동 감지]]의 직접 배치 사례로 합쳐 쓰지 않는 것이 평가 범위를 정확히 하는 방법이다.

### ELIZA와 대화의 인상

[[007_ELIZA]]는 시연 효과가 대화 역할과 사용자 해석에서도 발생할 수 있음을 보여준다. [[DOCTOR 스크립트]]의 치료사 역할은 모호한 템플릿과 되묻기를 공감과 통찰처럼 보이게 했다. 따라서 대화형 AI는 사용자가 느끼는 자연스러움뿐 아니라 시스템이 실제로 무엇을 이해하고, 어떤 실패를 숨기며, 어떤 위험한 신뢰를 유발하는지도 평가해야 한다.

### SHRDLU와 마이크로월드

[[009_SHRDLU]]는 ELIZA보다 풍부한 통사 분석·세계 모델·추론·계획을 결합했다. 모호한 지시를 되묻고 복합 명령을 실행한 대화는 실제 기능을 반영한다. 다만 이 기능은 어휘·사물·관계가 닫힌 [[마이크로월드]]에서 작동했다. [[블록 세계]]의 통제 조건은 구성 요소를 통합해 시험하기에 유용했지만, 열린 현실에서 같은 범위를 보장하지 않는다.

### Watson과 공개 게임

[[IBM Watson]]은 역사·과학·문학·대중문화의 *Jeopardy!* clue를 수초 안에 처리해 [[개방 영역 질의응답]]의 범위를 크게 넓혔다. 2011년 특별 경기에서 Ken Jennings·Brad Rutter를 이긴 결과는 [[DeepQA]]의 후보 생성·근거 점수화·신뢰도와 대규모 병렬화가 실제 경기 속도에서 통합될 수 있음을 보여줬다.

동시에 무대가 보여 준 것과 기술 논문이 측정한 것을 분리해야 한다.

- **입력 조건**: Watson은 진행자의 음성을 듣거나 무대 화면을 보지 않고 category와 clue를 전자 텍스트로 받았다. 오디오·비디오 단서와 특별 진행 지시는 제외됐다.
- **지식 조건**: 개발 중 corpus 확장에는 웹이 쓰였지만 경기 중에는 인터넷에 접속하지 않고 로컬 자료를 검색했다.
- **과업 평가**: 2010년 연구는 2,000개가 넘는 blind clue에서 답변률과 정밀도·응답 시간을 측정했다. 이 평가는 방송 몇 경기의 승패보다 원시 질의응답 능력을 더 직접 측정한다.
- **게임 결과**: 최종 상금에는 정답뿐 아니라 buzzer, clue 선택, Daily Double·Final Jeopardy 베팅과 위험 관리가 포함됐다.
- **전이 범위**: 당시 시스템은 짧은 질문에서 단일 답을 내는 구조였다. 2013년 회고는 의료 영역으로 옮기려면 자료·증거·상호작용과 의사결정 기준을 크게 바꿔야 한다고 설명했다.

Watson은 선별된 60문장만 처리한 Georgetown 시연이나 닫힌 블록 세계의 SHRDLU보다 훨씬 넓은 공개 과업이었다. 그렇더라도 전자 텍스트·미리 구축한 corpus·짧은 단일 답·명시적 게임 규칙이라는 경계는 남았다. “더 열린 과업”과 “경계가 없는 지능”은 같은 뜻이 아니다.

### 시연을 비교하는 네 층

공개 시연은 하나의 성공 장면 안에 서로 다른 평가 층을 겹쳐 보이게 한다.

| 층 | 묻는 질문 | Georgetown·ELIZA·SHRDLU·Watson에서 확인할 것 |
| --- | --- | --- |
| 인터페이스 | 시스템이 실제로 무엇을 입력받고 무엇을 출력했는가? | 선별 문장, 텍스트 대화, 블록 명령, 전자 clue와 buzzer |
| 과업 경계 | 어떤 어휘·자료·규칙·감각 양식이 포함되거나 제외됐는가? | 약 250개 어휘, DOCTOR 역할, 블록 세계, 로컬 corpus와 A/V 제외 |
| 측정 | 성공을 어떤 표본과 지표로 계산했는가? | 60문장 시연, 대화 인상, 기능 예제, blind clue 정밀도·답변률·시간 |
| 공개 효과 | 관객이 본 승리·유창성·행동이 무엇을 더 넓게 암시했는가? | 자동 번역 기대, 공감의 인상, 언어 이해의 인상, 게임 우승과 일반 지능 |

이 네 층을 나누면 시연 조건이 있었다는 이유로 실제 공학 성과를 지우지 않으면서, 공개 장면이 측정하지 않은 능력까지 일반화하는 오류도 피할 수 있다. 특히 인터페이스가 인간에게 보이는 환경을 기계가 직접 지각한 것처럼 만들 때에는 입력 경로를 별도로 확인해야 한다.

### 현대 LLM 평가로의 확장

현대 [[대규모 언어 모델]]도 인상적인 데모, 선별된 벤치마크, 실제 제품 사용 사이에서 성능 차이를 보일 수 있다. 대화 UI가 검색·코드 실행·메모리·안전 필터를 감추면 사용자는 단일 모델의 능력과 전체 제품의 능력을 혼동할 수 있다. 반대로 도구를 포함한 시스템 성능을 오직 기반 모델 점수만으로 설명해도 실제 사용 조건을 놓친다.

따라서 평가에는 대표성 있는 테스트 세트, 실패 사례 분석, 장기 사용 조건, 도메인별 정확성, 인간 검토 절차와 함께 다음 기록이 필요하다.

- 입력이 원문 그대로인지 전처리·검색·사람의 선별을 거쳤는지
- 모델·검색기·도구·인터페이스 중 어느 구성요소가 결과를 만들었는지
- 정답률 외에 답변률·calibration·지연 시간·비용·안전 실패를 어떻게 측정했는지
- 시연 중 허용한 자료와 실제 배치에서 접근할 수 있는 자료가 같은지
- 한 번의 성공과 반복 실행의 분포, 평균 성능과 최악 사례를 구분했는지

## 검증과 한계

### 확인된 사실

각 사례에서 확인되는 입력 경로, 과업 조건, 반복 평가와 공개 결과는 개별 1차 자료와 기술 기록에 근거한다. Georgetown의 선별 문장, SHRDLU의 닫힌 세계, Watson의 전자 clue와 로컬 자료 조건은 서로 다른 경계다.

### 해석

좋은 시연은 연구와 투자를 촉발하고 여러 구성요소가 함께 작동함을 증명할 수 있지만, 그 자체로 시스템의 일반 능력을 증명하지는 않는다. 좁은 조건은 결함만이 아니라 복잡한 가설을 시험하기 위한 실험 설계일 수 있다. 문제는 그 조건을 숨기거나, 조건 안의 성공을 조건 밖의 능력으로 바꿔 말할 때 생긴다.

AI 역사에서 반복되는 교훈은 세 가지다. 첫째, 공개 장면보다 먼저 시스템이 실제로 받은 입력을 확인한다. 둘째, 시연 결과와 별도의 반복 가능한 평가를 찾는다. 셋째, 새 영역으로의 전이는 자료·인터페이스·오류 비용이 달라지는 별도 주장으로 취급한다. 이 원칙은 1954년 기계 번역, ELIZA의 대화 인상, SHRDLU의 블록 세계, Watson의 게임 우승과 현대 LLM 제품을 같은 잣대로 평탄화하지 않으면서도 비교할 수 있게 한다.

### 비교를 통한 해석

인터페이스·과업 경계·측정·공개 효과의 네 층은 여러 사례를 함께 읽기 위한 합성 틀이다. 이 틀은 좁은 조건의 성공을 지우지 않으면서 조건 밖의 능력으로 확대하는 해석을 막는다.

### 아직 입증되지 않은 계보

초기 공개 시연들이 현대 LLM으로 직접 이어졌거나, 어느 한 시연의 성공이 경계 없는 일반 지능을 입증했다는 계보는 이 자료로 확인되지 않는다.

## 학습 확인

### 확인 질문

1. 공개 AI 시연을 평가할 때 분리해야 하는 네 층은 무엇인가?
2. Watson의 경기 우승과 원시 질의응답 성능 평가는 왜 같은 측정이 아닌가?
3. 통제 조건을 발견했다고 해서 시연의 공학적 성과까지 부정하면 안 되는 이유는 무엇인가?

### 다음 문서

- [[튜링 테스트와 LLM 평가]] — 시연의 조건 분석을 인간 유사성·신뢰성·이해의 평가 층위로 확장한다.

## 출처

- [[003_Georgetown-IBM 기계 번역 시연]]
- [[002_튜링 테스트]]
- [[006_위드로-호프의 MADALINE]]
- [[007_ELIZA]]
- [[009_SHRDLU]]
- Bernard Widrow·Michael A. Lehr, [30 Years of Adaptive Neural Networks](https://isl.stanford.edu/people/widrow/papers/j199030years.pdf), 1990, pp. 1415–1416.
- Terry Winograd, [What Does It Mean to Understand Language?](https://doi.org/10.1207/s15516709cog0403_1), 1980, pp. 212–218.
- David Ferrucci 외, [Building Watson: An Overview of the DeepQA Project](https://aaai.org/ai-magazine/the-ai-behind-watson-the-technical-article/), 2010, pp. 59–79.
- B. L. Lewis, [In the Game: The Interface between Watson and Jeopardy!](https://research.ibm.com/publications/in-the-game-the-interface-between-watson-and-jeopardy), 2012.
- David Ferrucci 외, [Watson: Beyond Jeopardy!](https://scalar.usc.edu/works/meet-my-friend-watson-1/media/Beyond%20Jeopardy.pdf), 2013, pp. 93–105.
- IBM, [Watson on Jeopardy!](https://www.ibm.com/history/watson-jeopardy), 경기 형식·점수·하드웨어·인터넷 조건 절.
- [[040_IBM Watson과 Jeopardy 질의응답]]

## 관련 항목

- [[기계 번역]]
- [[규칙 기반 기계 번역]]
- [[튜링 테스트]]
- [[튜링 테스트와 LLM 평가]]
- [[MADALINE]]
- [[적응 필터]]
- [[퍼셉트론에서 MADALINE으로]]
- [[ELIZA]]
- [[ELIZA 효과]]
- [[ELIZA에서 LLM으로]]
- [[SHRDLU]]
- [[마이크로월드]]
- [[040_IBM Watson과 Jeopardy 질의응답]]
- [[IBM Watson]]
- [[DeepQA]]
- [[개방 영역 질의응답]]
- [[대규모 언어 모델]]
