---
schema_version: 3
id: source.040
page_type: source
title: IBM Watson과 Jeopardy 질의응답
aliases:
  - 040_IBM Watson on Jeopardy
  - IBM Watson on Jeopardy Historic AI Victory
  - Watson Jeopardy 개방 영역 질의응답
tags:
  - type/source
  - domain/ai
  - domain/computer-science
  - domain/nlp
  - domain/machine-learning
created: '2026-07-18'
updated: '2026-07-21'
editorial_status: active
review:
  evidence_coverage: verified
  content_mode: descriptive
artifacts:
  - raw/040_IBM Watson on Jeopardy! - Historic AI Victory That Demonstrated Open-Domain Question Answering.ko.md
  - raw/040_IBM Watson on Jeopardy! - Historic AI Victory That Demonstrated Open-Domain Question Answering.commentary.ko.md
evidence:
  - source_id: ferrucci-et-al-2010-building-watson
    locator: 'AI Magazine 31(3), pp. 59–79의 DeepQA 원칙·처리 단계·자료·후보 생성·근거 점수화·성능·확장 실험'
    relation: supports
  - source_id: lewis-2012-watson-jeopardy-interface
    locator: 'Jeopardy 인터페이스의 전자식 clue·category 입력, 솔레노이드 buzzer, 음성 합성, 점수·경기 흐름 관찰'
    relation: supports
  - source_id: ferrucci-et-al-2013-watson-beyond-jeopardy
    locator: 'Artificial Intelligence 199–200, pp. 93–105의 question-in/single-answer-out 범위와 의료 영역 전환에 필요한 변경'
    relation: contextualizes
  - source_id: ibm-watson-jeopardy-history
    locator: '2011-02-14–16 방송 형식·최종 점수·Toronto 오답·90 servers·2,880 processor cores·인터넷 미접속 설명'
    relation: supports
  - source_id: smithsonian-knight-rider-lunch-box
    locator: Knight Rider가 NBC에서 1982–1986년 방송됐다는 소장품 설명
    relation: disputes
  - source_id: library-of-congress-moby-dick-1851
    locator: 'Harper & Brothers가 1851년 출판한 Moby-Dick; or, The Whale 서지 정보'
    relation: disputes
relations:
  - target: concept.ibm-watson
    kind: related
  - target: entity.ibm
    kind: related
learning:
  difficulty:
    entry: intermediate
    target: intermediate
  prerequisites: []
  assumed_knowledge: 없음
  outcomes:
    - 'Watson의 실제 경기 조건과 DeepQA의 후보 생성·근거 점수화 흐름을 설명하고, 공개 시연이 보장하지 않은 능력을 구분할 수 있다.'
  next:
    - target: concept.deepqa
      reason: '다음에는 DeepQA에서 병렬 후보·근거 결합 구조를 자세히 보고, 개방 영역 질의응답에서 과업의 범위와 평가 축을 넓혀 본다.'
    - target: concept.개방-영역-질의응답
      reason: '다음에는 DeepQA에서 병렬 후보·근거 결합 구조를 자세히 보고, 개방 영역 질의응답에서 과업의 범위와 평가 축을 넓혀 본다.'
---
# IBM Watson과 Jeopardy 질의응답

> [!note] 학습 안내
> **난이도:** 중급<br>
> **선수 지식:** 없음<br>
> **읽고 나면:** Watson의 실제 경기 조건과 DeepQA의 후보 생성·근거 점수화 흐름을 설명하고, 공개 시연이 보장하지 않은 능력을 구분할 수 있다.

## 1단계 — 먼저 잡을 핵심

원문은 [[IBM Watson]]이 2011년 *Jeopardy!*에서 인간 챔피언을 이긴 사건을 개방 영역 질의응답의 역사적 승리로 소개한다. 이 공개 문서는 **방송된 경기와 사전 연구 평가**, **전자식 텍스트 입력과 인간의 청각·시각**, **[[DeepQA]]의 후보 생성·근거 점수화와 일반적인** ‘**이해**’, **질의응답 정확도와 buzzer·베팅을 포함한 게임 승리**를 분리한다.

Watson의 성과는 실제였다. 방대한 비정형·구조 자료에서 후보 답을 만들고 서로 다른 분석기의 근거를 학습된 점수로 결합해, 말장난과 암시가 많은 퀴즈 단서에 수초 안에 답했다. 그러나 시스템은 생방송 인터넷 검색이나 음성·영상 이해를 수행하지 않았고, *Jeopardy!*에 맞춘 입력 인터페이스와 경기 전략을 사용했다. 이 경계를 명시해야 성과를 축소하지 않으면서도 범용 언어 이해의 증명으로 확대하지 않을 수 있다.

### 핵심 문장

- Watson의 *Jeopardy!* 우승은 넓은 주제의 텍스트 단서에 빠르게 답한 대규모 공개 시연이지만 음성·영상·실시간 웹·장기 대화를 평가하지 않았다.
- DeepQA는 하나의 범용 추론기가 아니라 질문 분석, 높은 재현율의 후보 생성, 다중 근거 점수화, 학습된 순위화와 신뢰도 추정을 병렬로 결합한 구조다.
- 경기 상금은 답의 정확성뿐 아니라 buzzer, clue 선택, 베팅과 위험 관리가 만든 결과이므로 사전 blind-clue 평가와 구분해야 한다.
- 신뢰도는 확실성 선언이 아니라 과거 평가 자료에 비춘 조건부 오류 위험의 추정이며, 답변·보류·베팅 행동을 조절하는 데 사용됐다.
- Watson과 현대 LLM은 외부 지식·후보 선택·불확실성이라는 질문을 공유하지만 계산 구조와 출력 단위가 달라 직접 계보로 합치면 안 된다.

## 2단계 — 작동 원리

### DeepQA의 설계 원칙

[[DeepQA]]는 하나의 규칙이나 단일 신경망이 아니라 다수의 분석·검색·점수화 방법을 병렬로 실행하는 소프트웨어 구조다. 2010년 기술 논문은 다음 네 원칙을 강조했다.

1. **대규모 병렬 처리** — 여러 해석·검색·점수 계산을 동시에 실행한다.
2. **많은 전문가의 결합** — 서로 다른 강점과 오류를 가진 알고리즘을 함께 사용한다.
3. **전 과정의 신뢰도 추정** — 중간 결과와 최종 답에 확률적 점수를 부여한다.
4. **얕은 지식과 깊은 지식의 통합** — 문자열·통계 신호부터 구문·의미·시간·공간·분류 지식까지 필요한 만큼 결합한다.

### 질문 분석과 후보 답 생성

처리는 먼저 clue의 통사·의미 구조, 질문 초점, 요구하는 답 유형, 핵심 관계와 단서를 분석하는 것에서 시작했다. 얕은 구문 분석과 깊은 구문 분석, 논리 형식, 의미역, 공지시, 명명 개체, 관계 탐지가 함께 사용될 수 있었다.

그다음 여러 검색 경로에서 후보를 넓게 모아 정답을 후보군 안에 포함시키는 데 우선순위를 둔다. 이 단계에서 정답 후보를 놓치면 뒤의 점수화 단계가 복구할 수 없다.

### 근거 검색·점수화·최종 순위

초기 후보는 가벼운 점수로 일부 걸러진 뒤 더 비싼 분석을 받았다. 시스템은 후보가 clue의 시간·장소·인물 유형·문법 관계·동의 표현·출처 문맥과 얼마나 잘 맞는지 여러 관점에서 계산했다. 같은 답을 지지하는 서로 다른 경로의 근거도 합쳤다.

최종 답 병합과 순위화는 학습된 통계 모형으로 수행됐다. 신뢰도는 “시스템이 진실을 안다”는 자기 인식이 아니라, 해당 점수 패턴이 과거 검증 자료에서 정답일 조건부 가능성을 추정한 값이다. 신뢰도가 충분히 높을 때만 buzzer를 누르고, 게임 상태에 따라 답하거나 보류하는 위험을 조절했다.

이 구조를 “비지도 학습이 스스로 모든 관계를 발견했다”고 요약하면 부정확하다. 연구진이 질문 분석기·검색기·지식 자원·점수 성분을 설계했고, 정답이 알려진 과거 clue로 점수 결합과 신뢰도 추정을 학습했다. 수작업 구성요소와 통계 학습이 결합된 시스템이었다.

## 3단계 — 기술과 근거

### 후보 생성과 점수 구성의 규모

그다음 시스템은 정답일 가능성이 있는 후보를 넓게 모았다. 문서 검색, 구절 검색, 구조 지식 조회, 제목·앵커·동의 표현 같은 여러 경로가 후보를 제안했다. 목표는 이 단계에서 하나를 확정하는 것이 아니라 정답을 후보군 안에 포함시키는 **재현율**이었다. 기술 논문은 수백 개 후보를 만들고, 상위 약 250개 후보 안에 정답이 들어가는 비율을 약 85% 수준으로 끌어올리는 목표를 설명한다. 정답 후보를 만들지 못하면 뒤의 점수화 단계가 복구할 수 없다.

구조 지식 베이스는 유용했지만 직접 조회만으로 해결되는 clue는 2%보다 적었다. 개방 영역에서 질문 표현과 저장된 관계를 정확히 대응시키기 어려웠기 때문이다. Watson은 DBpedia·WordNet·YAGO 같은 구조 자료도 사용했지만 대다수 질문에서는 비정형 텍스트 검색과 여러 근거의 결합이 필요했다.

논문은 전체 시스템에 100개가 넘는 기법과 50개가 넘는 점수 성분이 사용됐다고 설명한다. “여러 방법을 썼다”는 말은 모든 질문에서 모든 방법이 같은 비중으로 작동했다는 뜻이 아니다. 질문과 후보에 따라 이용 가능한 근거가 달랐고, 학습기는 과거 자료에서 어떤 점수 조합이 정답을 잘 구별하는지 추정했다.

### 경기의 실제 형식과 결과

2011년 2월 14일부터 16일까지 방송된 행사는 Watson, Ken Jennings, Brad Rutter가 겨룬 두 게임짜리 특별 경기였다. 방송은 세 회차에 걸쳐 진행됐다. 최종 누적 점수는 Watson 77,147달러, Jennings 24,000달러, Rutter 21,600달러였다.

이 결과를 단순한 “3일 토너먼트”라고 부르면 게임 단위와 방송 회차가 섞인다. 또한 Watson의 상금에는 답의 정확성뿐 아니라 clue 선택, Daily Double 탐색, 베팅, buzzer 선점과 오답 감점이 함께 반영됐다. 우승은 공개 시연의 분명한 성과지만 순수 질의응답 정확도 하나의 측정값은 아니다.

### Watson이 보고 들은 것

Watson은 무대 화면을 사람처럼 보거나 진행자의 음성을 듣지 않았다. category와 clue가 화면에 나타나는 시점에 전자 텍스트로 전달됐다. 오디오·비디오 자체를 해석해야 하는 단서와 진행자가 별도 지시를 주는 단서는 연구 과업에서 제외됐다.

답할 준비가 되면 시스템은 솔레노이드 장치로 실제 buzzer를 눌렀고, 선택한 답은 음성 합성으로 말했다. 진행자가 정답 또는 오답을 말하는 소리를 직접 인식하지도 않았다. 점수와 경기 상태의 변화를 받아 판정 결과를 추론했다. 따라서 이 시연은 음성 인식·컴퓨터 비전·로봇 조작을 한꺼번에 해결한 사례가 아니라 텍스트 단서 질의응답과 물리적 경기 인터페이스를 결합한 사례다.

### 자료와 인터넷의 경계

Watson은 백과사전, 사전, 뉴스, 문학, 참조 자료와 구조 지식 베이스를 로컬 corpus로 구축해 사용했다. 개발 단계의 corpus 확장에는 웹 검색이 활용됐지만, 실제 경기 중에는 인터넷에 접속하지 않았다. 따라서 “인터넷 없이 답했다”는 설명은 **경기 시점의 실행 조건**에 맞고, 시스템 구축 과정 전체가 웹 자료와 무관했다는 뜻은 아니다.

이 구분은 검색 증강 시스템을 평가할 때도 중요하다. 어떤 자료를 미리 수집·색인했는지, 시험 중 외부 검색이 허용되는지, 자료의 작성 시점이 언제인지가 서로 다른 조건이기 때문이다.

### 속도와 하드웨어

초기 구현은 한 CPU에서 질문 하나에 약 두 시간이 걸렸다. 연구진은 병렬화를 통해 90대 서버, 2,880개 프로세서 코어 규모에서 보통 3–5초 안에 답 후보를 처리하도록 했다. 2010년 논문은 2,500개가 넘는 코어로 확장했을 때 이런 응답 시간이 가능해졌다고 보고한다.

빠른 응답은 알고리즘만의 효과가 아니다. 병렬 소프트웨어 구조, 메모리에 올린 색인과 자료, 서버 간 분배, 후보별 계산량 조절이 함께 필요했다. 오늘날의 단일 모델 매개변수 수와 Watson의 코어 수를 직접 비교해 “더 큰 모델”의 계보로 읽는 것은 단위가 다르다.

### 사전 평가와 방송 경기의 차이

2010년 연구진은 2,000개가 넘는 blind clue로 질의응답 성능을 측정했고, Watson이 약 70%의 문제를 시도할 때 약 85%의 정밀도를 보이는 수준을 보고했다. 같은 논문에서 인간 우승자 집단은 대략 85–95% 정밀도와 40–50% clue 획득 범위에 놓였다. Ken Jennings의 역사 자료는 약 62% 획득과 92% 정밀도로 제시됐다.

이 수치와 방송 최종 점수는 같은 측정값이 아니다. 사전 평가는 정답률·답변률·응답 시간을 통제해 비교하지만 실제 경기는 세 참가자의 buzzer 경쟁, clue 선택, 베팅과 우연에 영향을 받는다. 기술 논문도 소수 경기의 상금 결과만으로 원시 질의응답 능력을 통계적으로 판단하기 어렵다고 구분했다.

## 검증과 한계

### Toronto 오답이 보여 준 것

첫 게임 Final Jeopardy의 category는 “U.S. Cities”였고 정답은 Chicago였지만 Watson은 Toronto라고 답했다. 화면에는 낮은 신뢰도가 함께 표시됐고 베팅액도 작았다. 이 실패는 시스템이 도시라는 답 유형과 여러 단서를 처리했어도 category 제약과 후보 근거를 완전히 결합하지 못할 수 있음을 보여준다.

낮은 신뢰도는 실패를 없애지 않지만 위험 관리에는 도움을 준다. 공개 시스템에서 중요한 것은 최고 점수 하나뿐 아니라 오답 가능성을 얼마나 잘 추정하고, 그 추정에 따라 보류·검토·베팅 같은 행동을 조절하는지다.

### 개방 영역 질의응답의 범위

Watson의 과업은 특정 데이터베이스 하나의 고정된 관계만 묻는 LUNAR 같은 제한 영역 질의응답보다 주제 범위가 넓었다. 역사·과학·문학·대중문화 등 여러 영역의 clue를 처리했고, 정답 유형과 표현 방식도 다양했다. 이 의미에서 [[개방 영역 질의응답]]의 중요한 대규모 시연이었다.

그렇다고 “개방 영역”이 모든 언어 능력과 동일한 것은 아니다. *Jeopardy!*는 짧은 clue에서 단일한 짧은 답을 고르는 형식이었고, 장기 대화·설명 생성·행동 계획·문서 작성·시청각 이해·실시간 최신 정보 검색은 평가하지 않았다. 2013년 회고 논문은 당시 구조를 `question in, single answer out`으로 요약하고 설명을 제공하지 않았다고 명시한다. 의료처럼 다른 영역으로 옮길 때에는 자료·용어·증거·상호작용·의사결정 기준을 크게 바꿔야 했다.

### 현대 LLM과 같은 점과 다른 점

Watson과 현대 [[대규모 언어 모델]]은 모두 많은 자료에서 언어적 패턴을 이용하고, 여러 후보 가운데 더 그럴듯한 출력을 선택하며, 개방 영역 질문에 답할 수 있다. 그러나 기본 구조는 다르다.

| 항목 | Watson DeepQA | 현대 생성형 LLM의 전형적 구성 |
| --- | --- | --- |
| 핵심 계산 | 명시적 후보 생성·검색·수십 개 근거 점수·순위화 | 토큰 조건부 분포를 학습한 신경망 생성 |
| 지식 사용 | 로컬 문서 corpus와 구조 지식 베이스를 명시적으로 검색 | 매개변수 지식, 필요하면 별도 검색·도구 결합 |
| 출력 | 짧은 단일 답과 신뢰도 | 문장·문서·대화 등 가변 길이 텍스트 |
| 설명 가능성 | 후보별 근거 점수와 출처 경로가 있으나 당시 게임 출력은 설명하지 않음 | 자연어 설명을 만들 수 있지만 그것이 실제 계산 근거라는 보장은 없음 |
| 평가 | clue 정확도·답변률·시간·게임 전략 | 과제별 정확도, 생성 품질, 사실성, 안전성 등 |

후대의 검색 증강 생성이나 도구 사용형 언어 모델과 문제의식이 만나는 지점은 있지만, Watson이 Transformer·BERT·GPT를 직접 낳았다고 말할 근거는 아니다. 공통 질문은 **외부 자료를 어떻게 찾고, 서로 충돌하는 근거를 어떻게 결합하며, 불확실성을 행동으로 어떻게 바꾸는가**다.

### 원문 예시의 검증 정정

- raw는 *Knight Rider*를 1960년대 TV 프로그램의 말하는 자동차 사례처럼 적지만, Smithsonian 설명에 따르면 NBC 방영 기간은 1982–1986년이다.
- raw는 *Moby-Dick*을 1850년 소설로 적지만, Library of Congress 서지 정보의 미국판 출판 연도는 1851년이다.
- “세 날의 토너먼트”는 방송 회차와 게임 구조를 섞는다. 두 게임짜리 특별 경기가 세 회차로 방송됐다.
- Watson은 진행자의 음성을 인식하거나 화면을 읽지 않았다. 텍스트 입력과 경기 상태가 전자적으로 전달됐다.
- 실제 경기 중에는 인터넷을 사용하지 않았지만 개발 단계의 corpus 확장에 웹이 쓰였다.
- 단일 구조 지식 조회가 핵심 정답 경로였다는 설명은 과장이다. 기술 논문에서 구조 데이터 직접 조회가 효과적인 clue는 2% 미만이었다.
- *Jeopardy!* 우승을 범용 언어 이해 또는 일반 지능의 증명으로 확대하지 않는다. 짧은 텍스트 단서와 단일 답, 정해진 게임 규칙이라는 과업 경계가 있었다.

## 학습 확인

1. Watson의 *Jeopardy!* 우승은 어떤 입력과 출력 조건에서 이루어진 시연이었는가?
2. DeepQA는 질문을 받은 뒤 후보 생성에서 최종 답과 신뢰도 결정까지 어떤 순서로 처리했는가?
3. 방송 경기의 상금과 사전 평가 수치만으로 Watson의 범용 언어 능력을 판단할 수 없는 이유는 무엇인가?

다음에는 [[DeepQA]]에서 병렬 후보·근거 결합 구조를 자세히 보고, [[개방 영역 질의응답]]에서 과업의 범위와 평가 축을 넓혀 본다.

### 다음 문서

- [[concept.deepqa|DeepQA]] — 다음에는 DeepQA에서 병렬 후보·근거 결합 구조를 자세히 보고, 개방 영역 질의응답에서 과업의 범위와 평가 축을 넓혀 본다.
- [[concept.개방-영역-질의응답|개방 영역 질의응답]] — 다음에는 DeepQA에서 병렬 후보·근거 결합 구조를 자세히 보고, 개방 영역 질의응답에서 과업의 범위와 평가 축을 넓혀 본다.

## 출처
- David Ferrucci 외, [Building Watson: An Overview of the DeepQA Project](https://aaai.org/ai-magazine/the-ai-behind-watson-the-technical-article/), *AI Magazine* 31(3), 2010, pp. 59–79.
- B. L. Lewis, [In the Game: The Interface between Watson and Jeopardy!](https://research.ibm.com/publications/in-the-game-the-interface-between-watson-and-jeopardy), 2012.
- David Ferrucci 외, [Watson: Beyond Jeopardy!](https://scalar.usc.edu/works/meet-my-friend-watson-1/media/Beyond%20Jeopardy.pdf), *Artificial Intelligence* 199–200, 2013, pp. 93–105.
- IBM, [Watson on Jeopardy!](https://www.ibm.com/history/watson-jeopardy), 경기 형식·점수·하드웨어·Toronto 오답 절.
- Smithsonian National Museum of American History, [Knight Rider lunch box](https://www.si.edu/object/knight-rider-lunch-box%3Anmah_1054222), 1982–1986년 방송 설명.
- Library of Congress, [America Reads: 1750 to 1899](https://www.loc.gov/exhibits/america-reads/1750-to-1899.html), *Moby-Dick; or, The Whale*, 1851.
- 프로젝트 번역·검토 출발 자료: [IBM Watson on Jeopardy! - Historic AI Victory That Demonstrated Open-Domain Question Answering](https://mbrenndoerfer.com/writing/ibm-watson-jeopardy-open-domain-question-answering-nlp-information-retrieval)
- 프로젝트 보존 자료: `raw/040_IBM Watson on Jeopardy! - Historic AI Victory That Demonstrated Open-Domain Question Answering.ko.md`, `raw/040_IBM Watson on Jeopardy! - Historic AI Victory That Demonstrated Open-Domain Question Answering.commentary.ko.md`.

## 관련 항목

- [[concept.deepqa|DeepQA]]
- [[concept.개방-영역-질의응답|개방 영역 질의응답]]
- [[concept.ibm-watson|IBM Watson]]
- [[entity.ibm|IBM]]
