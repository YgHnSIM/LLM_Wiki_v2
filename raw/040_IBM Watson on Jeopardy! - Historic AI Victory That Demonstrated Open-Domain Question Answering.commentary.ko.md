# Jeopardy!의 IBM Watson: 개방 영역 질의응답을 보여 준 역사적인 AI 승리 해설

## 1. 한눈에 보기

IBM Watson은 2011년 2월 방송된 Jeopardy! 특별 대결에서 Ken Jennings와 Brad Rutter를 이긴 질의응답 시스템이다. 핵심 소프트웨어인 DeepQA는 질문을 한 번에 하나의 규칙으로 푸는 대신, 여러 해석과 수백 개 답 후보를 만들고, 구조·비구조 자료에서 증거를 수집하고, 50개가 넘는 scorer의 값을 기계 학습으로 결합해 답의 순위와 신뢰도를 정했다. 실전 시스템은 인터넷에 연결되지 않았고, 시청각 문제는 범위에서 제외됐으며, 질문을 음성으로 듣지 않고 전자 텍스트로 받았다.

원문은 이 사건의 대중적 중요성과 다중 가설 구조를 잘 소개하지만 성취 범위를 여러 차례 넓힌다. 실제 대결은 사흘 동안 방송된 **두 게임 exhibition match**였고, 두 게임의 상금 결과는 질의응답 성능만이 아니라 버저·문제 선택·Daily Double·베팅 전략의 영향을 받았다. IBM 연구진도 소수 게임의 상금이 원시 QA 성능의 통계적으로 의미 있는 척도가 아니라고 명시했다.

## 2. 핵심 요약

- Watson은 하나의 “이해 알고리즘”이 아니라 자연어 처리·정보 검색·지식원·점수기·학습 결합기·게임 전략·인터페이스를 묶은 시스템이었다.
- DeepQA의 설계 원칙은 대규모 병렬성, 여러 전문가, 전 과정의 신뢰도 추정, 얕고 깊은 지식의 결합이었다.
- 2010년 논문은 100개가 넘는 기법, 수백 개 답 후보, 50개가 넘는 scorer, 2,500개가 넘는 compute core와 3–5초 latency를 설명한다.
- 실전 하드웨어는 IBM 기록상 10개 rack의 90대 서버, 2,880개 processor core였다.
- Watson은 경기 중 live web search를 쓰지 않고 미리 수집·색인한 text, database, taxonomy, ontology를 사용했다.
- 질문·category는 화면에 표시될 때 Watson에도 전자적으로 전송됐다. Watson은 음성을 듣거나 화면을 보지 않았다.
- 시청각 문제와 진행자의 별도 설명이 필요한 special-instruction 문제는 대결에서 제외됐다.
- 정답 후보 생성과 증거 점수화, 최종 ranking·confidence estimation은 서로 다른 단계였다. 후보 생성 단계에서 정답이 빠지면 후단 점수기로 복구할 수 없다.
- 두 게임은 3회에 걸쳐 방송됐고 최종 누적 점수는 Watson 77,147달러, Jennings 24,000달러, Rutter 21,600달러였다.
- 높은 confidence는 정답 보장이 아니라 조건부 위험 판단값이었다. Watson은 `US Cities` Final Jeopardy!에서 낮은 confidence로 Toronto라고 오답했다.
- `open-domain`은 모든 감각·대화·판단을 포함한다는 뜻이 아니라, 사실형 clue가 매우 넓은 주제에 걸친다는 뜻이었다.
- Jeopardy! 성공에서 의료·고객 지원·가상 비서·LLM 전체로 곧장 이어지는 직접 효과는 별도 채택·성능 근거가 필요하다.

## 3. 역사적 배경

개방 영역 질의응답은 Watson 이전에도 TREC QA, PIQUANT, OpenEphyra 같은 연구 흐름이 있었다. IBM 연구진은 PIQUANT를 Jeopardy!에 맞추려 한 초기 baseline이 충분한 정확도와 confidence estimation을 내지 못했다고 보고했다. 따라서 Watson이 질의응답 자체를 처음 만든 것은 아니며, 복잡한 clue·넓은 주제·정확한 confidence·수초의 응답·실제 게임 전략을 하나의 challenge problem으로 결합한 것이 중요했다.

DeepQA 프로젝트는 2007년 무렵 본격화됐고, 대표 설계 논문은 실제 TV 대결 전인 2010년에 출판됐다. 이 논문은 2,000개가 넘는 blind Jeopardy! question으로 precision–percent attempted curve를 평가하고 인간 우승자 분포와 비교했다. 2008년 말에는 약 70% precision at 70% attempted였지만 단일 CPU에서 질문당 약 2시간이 걸렸고, 병렬화 뒤 3–5초 범위로 줄였다.

실제 특별 대결은 2011년 2월 14–16일 세 편으로 방송됐지만 두 게임을 합산한 exhibition이었다. Watson은 두 챔피언을 이겼고 1등 상금 100만 달러를 받았다. 화면상 누적 점수와 상금은 구분해야 한다.

## 4. 핵심 개념 해설

### question analysis와 lexical answer type

DeepQA는 먼저 clue와 category를 분석해 무엇을 묻는지, 답의 표면 유형을 나타내는 lexical answer type(LAT)이 있는지, 말장난·정의·분해 가능한 subclue가 있는지 추정했다. shallow/deep parse, logical form, semantic role, coreference, relation, named entity 등 여러 분석기가 서로 다른 관점을 제공했다. 단일 분석 결과를 확정하지 않고 후속 증거가 어떤 해석을 더 지지하는지 비교했다.

### hypothesis generation과 recall

primary search는 정밀도보다 recall을 우선해 여러 text search engine, passage search, document title, triple store와 고정 목록에서 후보를 넓게 만들었다. 2010년 논문은 top 250 candidate 안에 정답을 포함하는 binary recall 약 85%를 목표로 했고 실제로 수백 개 후보를 생성했다고 설명한다. 정답이 이 단계에서 생성되지 않으면 뒤의 scorer가 아무리 좋아도 답할 수 없다.

### soft filtering과 evidence scoring

가벼운 scorer로 가능성이 낮은 후보를 줄인 뒤 남은 가설에 대해 추가 passage와 structured evidence를 찾았다. 50개가 넘는 scorer는 passage term overlap, logical form alignment, source reliability, taxonomy, 시간·지리 일관성, popularity, alias 등을 서로 다른 숫자·범주 feature로 만들었다. 어떤 scorer 하나도 전체를 지배하지 않았다는 점이 DeepQA 설계의 핵심이다.

### final merging, ranking, confidence

`Abraham Lincoln`과 `Honest Abe`처럼 표면형이 달라도 같은 답일 수 있으므로 후보를 합친 뒤, 학습된 model이 여러 feature를 결합해 최종 순위와 confidence를 계산했다. confidence는 각 component의 자의적 점수를 그대로 더한 값이 아니라 훈련 자료에서 정답 예측력에 맞춰 학습한 결합 결과였다. 높은 threshold는 덜 답하고 더 높은 precision을, 낮은 threshold는 더 많이 답하고 더 낮은 precision을 만들었다.

### QA와 game strategy

답과 confidence를 만드는 DeepQA와 버저 여부·clue 선택·Daily Double·Final Jeopardy! 베팅을 정하는 전략 모듈은 구분해야 한다. 최종 상금은 QA 정확도만의 함수가 아니다. 실제 게임 승리를 평가할 때는 답을 알았는지, 먼저 버저를 잡았는지, 얼마를 걸었는지가 함께 작용한다.

## 5. 원문의 논리 구조

원문은 좁은 데이터베이스 질의에서 개방 영역 질의응답으로의 전환을 문제로 제시하고, Jeopardy!의 말장난·문화 참조·시간 압박을 과제로 설명한다. 이어 Watson의 병렬 NLP pipeline, 다중 후보 생성, 증거 검색, confidence ranking, supervised·unsupervised learning을 해결책으로 제시한다. 다음에는 실시간 성능과 연구·대중·상업적 영향을 설명하고, 전문화·상식·최신성의 한계를 든 뒤 현대 언어 AI로 이어지는 유산을 정리한다.

이 흐름은 교육적으로 명료하지만 결과에서 능력으로, 능력에서 역사적 영향으로 빠르게 일반화한다. “대결에서 승리했다”는 사실은 정확하지만, “정교한 자연어 이해와 복잡한 추론을 보편적으로 입증했다”, “현대 질의응답의 표준 기법이 모두 Watson에서 왔다”, “실용 AI 전체의 발전을 이끌었다”는 주장은 별도 범위와 비교 근거가 필요하다.

## 6. 왜 중요했는가

첫째, 정확도만이 아니라 **precision–coverage trade-off와 confidence calibration**을 시스템의 중심 평가 축으로 만들었다. 오답에 벌점이 있고 버저 경쟁이 있는 환경에서는 답 후보 1위뿐 아니라 언제 답하지 않을지를 결정해야 했다.

둘째, 자연어 처리·검색·구조 지식·기계 학습의 여러 구성 요소를 end-to-end metric으로 빠르게 비교·통합하는 시스템 공학의 가치를 보여 주었다. 연구진이 강조한 공헌도 단일 알고리즘보다 새 component를 넣고 전체 성능을 측정할 수 있는 아키텍처였다.

셋째, 수백 개 가설과 증거 평가를 몇 초 안에 수행하도록 병렬화해 연구 pipeline을 실제 방송 게임의 latency 조건으로 옮겼다. 단일 CPU에서 질문당 약 2시간이 걸리던 계산을 수천 core로 3–5초까지 줄인 과정은 알고리즘과 배포 아키텍처를 함께 보아야 함을 보여 준다.

넷째, 두 명의 유명 챔피언과 공개 대결하면서 질의응답 기술의 상태를 대중에게 매우 선명하게 보여 주었다. 다만 시연의 대중적 효과와 과제 밖 능력의 과학적 입증은 같은 것이 아니다.

## 7. 현대 LLM과의 연결

Watson과 현대 LLM은 넓은 자연어 질문에 정확한 답을 내고 confidence와 근거를 다뤄야 한다는 문제를 공유한다. 오늘날 retrieval-augmented generation은 외부 문서를 검색해 생성 모델에 제공하고, tool-using agent는 검색·계산·database query를 조합한다. 이 점에서 DeepQA의 retrieval–candidate–evidence 구조는 비교할 가치가 있다.

그러나 기본 아키텍처는 다르다. Watson은 여러 명시적 parser·search engine·candidate generator·scorer와 학습된 ranker를 결합한 modular pipeline이었다. LLM은 대규모 token prediction으로 하나의 신경망 안에 표현과 생성을 함께 학습하고, 외부 검색을 쓰더라도 최종 답을 자유 형식으로 생성할 수 있다. Watson의 `question in, single answer out` factoid setting과 대화형 장문 생성은 같은 과제가 아니다.

또한 Watson의 confidence는 후보 정답 label에 맞춰 학습한 ranking·buzzing 값이었다. 현대 LLM이 출력하는 token probability나 자기보고 confidence와 직접 같은 양이 아니다. 두 값을 비교하려면 정답 사건, calibration 자료, abstention rule을 맞춰야 한다.

Watson이 현대 LLM의 직접 조상이라는 계보도 단순화다. 정보 검색·질의응답·학습 순위화·NLP component integration의 기존 전통을 종합한 시스템이었고, Transformer와 대규모 사전학습은 별도의 기술 계보를 가졌다. 공통 문제와 직접 영향을 구분해야 한다.

## 8. 한계와 비판적 관점

### 대결 범위

Watson이 다룬 `open-domain`은 주제가 넓은 factoid QA를 뜻했다. 시청각 clue와 진행자의 별도 설명이 필요한 문제는 IBM과 Jeopardy!가 합의해 제외했다. 대화, 주관적 판단, 장문 설명, 실시간 학습까지 포함한 범용 언어 이해가 아니었다.

### 입력과 인터페이스

Watson은 Alex Trebek의 음성을 듣거나 게임 보드를 보지 않았다. category와 clue가 표시될 때 같은 내용이 전자적으로 전달됐다. confidence가 충분하면 solenoid가 실제 buz저 버튼을 누르고 text-to-speech가 답했다. 진행자의 판정도 듣지 못해 점수와 게임 흐름으로 정오를 추정했다. 따라서 음성 인식·시각 이해는 승리에서 검증된 능력이 아니다.

### 실전 상금과 QA 성능

두 게임의 상금 합계는 승부의 공식 결과지만 통계적으로 충분한 QA 평가가 아니다. 문제 선택, 버저, Daily Double 위치, wager가 결과를 크게 바꾼다. 연구진은 blind question set의 precision–percent attempted curve를 별도로 보고했다.

### 지식과 웹

Watson은 경기 중 live web search를 사용하지 않았다. 백과사전·사전·뉴스·문학·DBpedia·WordNet·YAGO 등을 미리 수집·확장·색인했다. “뉴스 기사로 최신 정보를 얻었다”는 말은 corpus 준비 단계의 이야기이지 방송 중 새 기사를 읽었다는 뜻이 아니다.

### 원문의 잘못된 예시

KITT가 등장한 Knight Rider는 Smithsonian 기록상 1982–1986년 NBC에서 방영됐다. 원문의 “1960년대 TV show” 예시는 연대가 틀렸다. Library of Congress는 Moby-Dick; or, The Whale의 New York 판을 1851년으로 기록한다. 원문의 “1850 novel”도 틀렸다. 이 예시는 Watson이 실제 대결에서 푼 clue로 제시된 것도 아니므로 시스템 능력의 실증 자료로 사용하면 안 된다.

### 도메인 이전

Jeopardy!에 맞춘 DeepQA를 의료 같은 전문 영역에 옮기는 일은 corpus·taxonomy·question type·answer evidence·dialog·training을 다시 설계하는 연구 과제였다. 2013년 논문은 이를 완성된 일반화가 아니라 필요한 적응과 초기 단계로 설명했다. 시연 성공만으로 상업 영역의 정확성·안전성·효율을 보장하지 않는다.

## 9. 용어 정리

- **Watson**: IBM이 DeepQA를 Jeopardy! 참가 시스템으로 구현한 질의응답·게임 시스템.
- **DeepQA**: 여러 질문 해석·답 후보·증거 scorer를 병렬 실행하고 학습으로 결합하는 대규모 확률적 증거 기반 아키텍처.
- **open-domain QA**: 특정한 한 분야에 한정하지 않고 넓은 주제의 질문에 답하는 질의응답. 입력·출력·감각·최신성 범위는 시스템마다 다르다.
- **factoid question**: 사람·장소·날짜·작품명처럼 비교적 짧고 특정한 사실 답을 요구하는 질문.
- **lexical answer type(LAT)**: clue 안에서 기대 답의 종류를 나타내는 단어나 명사구.
- **hypothesis**: 후보 답을 원 질문에 넣어 맞는지 증거로 평가하는 단위.
- **primary search**: 높은 recall로 답 후보를 넓게 생성하는 첫 검색 단계.
- **soft filtering**: 계산 비용이 큰 증거 평가 전에 가벼운 점수로 후보를 줄이는 단계.
- **scorer**: passage·시간·지리·taxonomy·source reliability 등 한 증거 차원을 평가해 feature를 만드는 구성 요소.
- **confidence estimation**: 후보가 맞을 가능성을 훈련 자료에 맞춰 추정하는 과정. 정답의 논리적 보증이 아니다.
- **percent attempted**: 전체 질문 가운데 시스템이 confidence threshold를 넘어 답하기로 한 비율.
- **calibration**: 같은 confidence 수준의 예측이 실제로 그 비율만큼 맞는지 보는 성질.
- **UIMA/UIMA-AS**: 여러 text analytic component를 통합하고 비동기 병렬 실행하는 Watson의 소프트웨어 기반.

## 10. 함께 보면 좋은 항목

- **BASEBALL·LUNAR**: 제한된 database·domain에서 자연어 질의를 처리한 초기 시스템과 Watson의 과제 범위를 비교할 수 있다.
- **TREC question answering**: Watson 이전 open-domain factoid QA의 평가 전통과 baseline을 이해하는 배경이다.
- **정보 검색**: 문서·passage를 찾아 후보와 증거를 제공하는 DeepQA의 핵심 층이다.
- **WordNet·DBpedia·YAGO**: 비구조 텍스트와 함께 사용한 lexical·structured knowledge source다.
- **의미역 표지**: question과 evidence의 predicate-argument 구조를 비교하는 일부 scorer의 입력이었다.
- **지식 그래프**: triple store 질의는 후보 생성과 증거 평가에 쓰였지만 전체 clue를 단순 database lookup으로 푼 것은 아니다.
- **AI 시연과 실제 성능**: 공개 대결의 강한 시연 가치와 영역 밖 성능 보장을 구분하는 분석 틀이다.
- **대규모 언어 모델과 RAG**: modular candidate ranking과 generative retrieval integration의 공통 문제·구조 차이를 비교할 수 있다.

## 11. 읽고 생각해볼 질문

1. 두 게임의 상금 승리와 2,000개 blind clue의 precision–coverage curve는 각각 무엇을 측정하는가?
2. 답 후보를 수백 개 만드는 recall 중심 단계와 최종 confidence ranking 가운데 어느 쪽의 실패가 더 복구하기 어려운가?
3. 50개 넘는 scorer의 점수를 학습해 합친 confidence는 인간이 말하는 확신과 어떤 점에서 다른가?
4. 시청각 문제를 제외하고 clue를 전자 텍스트로 제공한 조건은 “인간과 같은 언어 이해”라는 해석을 어떻게 제한하는가?
5. 버저·베팅·문제 선택을 포함한 게임 승리와 순수 QA 성능을 공정하게 분리하려면 어떤 평가가 필요한가?
6. modular DeepQA와 end-to-end LLM의 오류를 진단할 때 어느 구조가 더 쉬우며, 그 대가로 어떤 유연성을 잃는가?
7. Jeopardy! corpus에서 학습한 confidence model을 의료·법률 같은 영역에 옮길 때 왜 다시 calibration해야 하는가?
8. 검색·지식 그래프·LLM을 결합한 현대 시스템에서 Watson의 “각 답과 증거 연결” 원칙을 어떻게 재사용할 수 있는가?

## 12. 짧은 결론

Watson의 가장 정확한 역사적 의미는 컴퓨터가 인간처럼 모든 언어를 이해했다는 선언이 아니다. 넓은 주제의 factoid clue를 대상으로 수백 개 후보와 여러 증거 분석을 병렬 실행하고, 학습된 confidence로 답하거나 기권하며, 실제 게임의 속도·버저·전략 조건까지 충족한 통합 시스템을 만든 데 있다. 대결은 강력한 공개 시연이었지만 시청각 입력·실시간 웹·대화·주관 판단은 범위 밖이었고, 두 게임의 상금 결과는 QA 정확도만의 척도가 아니다. 이 경계를 지킬 때 Watson은 과장 없이도 언어 AI 시스템 공학의 중요한 이정표로 남는다.
