---
schema_version: 2
id: analysis.규칙-기반-ai에서-데이터-기반-학습으로
page_type: analysis
title: 규칙 기반 AI에서 데이터 기반 학습으로
aliases:
  - rules to data-driven learning
  - 규칙에서 학습으로
  - 데이터 기반 AI 전환
tags:
  - type/analysis
  - domain/ai
created: '2026-05-14'
updated: '2026-07-16'
lifecycle: active
verification: partial
artifacts:
  - raw/003_Georgetown-IBM Machine.md
  - raw/004_The Perceptron.md
  - raw/004_The Perceptron.commentary.md
  - raw/005_Chomsky's Syntactic Structures.md
  - raw/006_1962_위드로-호프_MADALINE.md
  - raw/006_1962_위드로-호프_MADALINE_해설.md
  - raw/007_ELIZA - The First Conversational AI Program.ko.md
  - raw/007_ELIZA - The First Conversational AI Program.commentary.ko.md
  - raw/012_From Symbolic Rules to Statistical Learning - The Paradigm Shift in NLP.ko.md
  - raw/012_From Symbolic Rules to Statistical Learning - The Paradigm Shift in NLP.commentary.ko.md
  - raw/013_Hidden Markov Models - Statistical Speech Recognition.ko.md
  - raw/013_Hidden Markov Models - Statistical Speech Recognition.commentary.ko.md
  - raw/014_Augmented Transition Networks - Procedural Parsing Formalism for Natural Language.ko.md
  - raw/014_Augmented Transition Networks - Procedural Parsing Formalism for Natural Language.commentary.ko.md
  - raw/015_Montague Semantics - The Formal Foundation of Compositional Language Understanding.ko.md
  - raw/015_Montague Semantics - The Formal Foundation of Compositional Language Understanding.commentary.ko.md
  - raw/017_Lesk Algorithm Word Sense Disambiguation & the Birth of Context-Based NLP.ko.md
  - raw/017_Lesk Algorithm Word Sense Disambiguation & the Birth of Context-Based NLP.commentary.ko.md
  - raw/020_Time Delay Neural Networks - Processing Sequential Data with Temporal Convolutions.ko.md
  - raw/020_Time Delay Neural Networks - Processing Sequential Data with Temporal Convolutions.commentary.ko.md
  - raw/021_Convolutional Neural Networks - Revolutionizing Feature Learning.ko.md
  - raw/021_Convolutional Neural Networks - Revolutionizing Feature Learning.commentary.ko.md
  - raw/022_IBM Statistical Machine Translation - From Rules to Data.ko.md
  - raw/022_IBM Statistical Machine Translation - From Rules to Data.commentary.ko.md
evidence:
  - source_id: macdonald-1963
    locator: pp. 1–4
    relation: supports
  - source_id: rosenblatt-1958
    locator: pp. 386–408
    relation: supports
  - source_id: chomsky-1957
    locator: chapters 2–10
    relation: supports
  - source_id: widrow-lehr-1990
    locator: pp. 1415–1433
    relation: supports
  - source_id: weizenbaum-1966
    locator: pp. 36–45
    relation: supports
  - source_id: gpt-2018
    locator: §§2–3
    relation: contextualizes
  - source_id: bert-2019
    locator: §3
    relation: contextualizes
  - source_id: jelinek-1976
    locator: pp. 532–556
    relation: supports
  - source_id: church-1988
    locator: pp. 136–143
    relation: supports
  - source_id: brown-et-al-1988
    locator: pp. 71–76
    relation: contextualizes
  - source_id: brown-et-al-1990
    locator: pp. 79–85
    relation: supports
  - source_id: brown-lai-mercer-1991-sentence-alignment
    locator: pp. 169–176
    relation: supports
  - source_id: brown-et-al-1993-smt-parameter-estimation
    locator: pp. 263–311
    relation: supports
  - source_id: church-mercer-1993
    locator: pp. 1–3 and 15–16
    relation: supports
  - source_id: brill-1992
    locator: pp. 152, 154–155
    relation: contextualizes
  - source_id: baum-petrie-1966
    locator: pp. 1554–1563
    relation: contextualizes
  - source_id: baker-1975-dragon
    locator: pp. 24–29
    relation: supports
  - source_id: jelinek-bahl-mercer-1975
    locator: pp. 250–256
    relation: supports
  - source_id: woods-1970-atn
    locator: pp. 591–606
    relation: contextualizes
  - source_id: montague-1970-efl
    locator: collected ed., pp. 201–205 and 217–221
    relation: contextualizes
  - source_id: montague-1973-ptq
    locator: collected ed., pp. 247–270
    relation: contextualizes
  - source_id: lesk-1986
    locator: pp. 24–26
    relation: contextualizes
  - source_id: waibel-et-al-1989-tdnn
    locator: 'pp. 328–334, especially §§II–IV and Table I'
    relation: supports
  - source_id: lecun-et-al-1989-zip-code
    locator: pp. 541–547
    relation: supports
  - source_id: lecun-et-al-1998-document-recognition
    locator: pp. 2278–2284 and 2316–2317
    relation: contextualizes
related:
  - source.022
  - concept.통계적-기계-번역
  - source.020
  - source.021
  - concept.시간-지연-신경망
  - concept.합성곱-신경망
  - source.015
  - concept.몬태규-의미론
  - concept.합성성
  - source.013
  - concept.은닉-마르코프-모델
  - concept.baum-welch-알고리즘
  - concept.규칙-기반-기계-번역
  - concept.지식-공학-병목
  - concept.퍼셉트론
  - concept.지도-학습
  - concept.adaline
  - concept.madaline
  - concept.특징-공학
  - concept.eliza
  - concept.패턴-매칭
  - concept.템플릿-기반-응답-생성
  - concept.통사-구조
  - concept.대규모-언어-모델
  - source.012
  - concept.통계적-자연어-처리
  - concept.말뭉치-기반-학습
  - source.014
  - concept.증강-전이망
  - source.017
  - concept.lesk-알고리즘
  - concept.단어-의미-중의성-해소
---
# 규칙 기반 AI에서 데이터 기반 학습으로

[[규칙 기반 AI에서 데이터 기반 학습으로]]의 전환은 AI 시스템을 사람이 직접 규칙으로 작성하는 방식에서, 데이터로부터 매개변수와 패턴을 학습하는 방식으로 무게가 옮겨 간 흐름을 가리킨다. [[003_Georgetown-IBM 기계 번역 시연]]과 [[004_퍼셉트론]]은 이 전환의 두 축을 보여 주고, [[012_상징 규칙에서 통계 학습으로]], [[013_은닉 마르코프 모델과 통계적 음성 인식]], [[014_증강 전이망과 절차적 자연어 파싱]], [[015_몬태규 의미론과 합성적 자연언어 해석]]은 자연어·음성 처리 내부의 과제별 시간표와 서로 다른 명시적 구조를 보완한다.

## 규칙 기반 접근의 장점과 병목

Georgetown-IBM 시연은 사전 조회와 통사 규칙을 결합해 번역을 계산 절차로 만들었다. 이 방식은 제한된 문장과 좁은 영역에서는 설명 가능하고 구현 가능했지만, 언어쌍, 전문 영역, 관용 표현, 복잡한 구문이 늘어날수록 사람이 규칙과 사전을 계속 추가해야 했다. 이 문제가 [[지식 공학 병목]]이다.

[[005_촘스키의 통사 구조]]는 규칙 기반 접근의 이론적 매력을 보여준다. 언어가 실제로 위계적 [[통사 구조]]와 [[재귀]]를 가진다면, 문법 규칙과 [[파싱]]으로 언어를 분석하려는 시도는 단순한 수작업 편의가 아니라 언어의 구조를 모델링하려는 시도였다.

## 퍼셉트론의 전환

[[퍼셉트론]]은 다른 방향을 제안했다. 사람이 분류 규칙을 직접 쓰는 대신, 라벨이 붙은 예시를 제공하고 시스템이 가중치를 조정하게 했다. 이는 AI가 특정 규칙을 실행하는 기계에서, 경험을 통해 성능을 개선하는 학습 시스템으로 바뀔 수 있음을 보여주었다.

## 한계가 만든 다음 단계

퍼셉트론은 [[선형 분리 가능성|선형 분리 가능]]한 문제만 표현했다. [[XOR 문제]]는 단층 모델이 비선형 경계를 표현하지 못한다는 간단한 사례다. Minsky와 Papert의 분석, 계산 자원, 다층 학습법의 부재, 연구비와 기대 변화가 함께 이후의 연구 흐름에 영향을 주었으므로 XOR 하나를 신경망 침체의 원인으로 만들지 않는다.

## MADALINE의 혼합 전략

[[006_위드로-호프의 MADALINE]]은 규칙과 학습이 공존하는 과도기적 해법을 보여준다. 여러 [[ADALINE]]은 [[LMS 알고리즘]]으로 데이터에서 가중치를 학습하지만, 입력 [[특징 공학]]과 최종 논리 게이트는 엔지니어가 설계한다. 이는 데이터 기반 학습으로의 전환이 한 번에 완성된 것이 아니라, 학습 가능한 부분을 점차 넓혀온 과정임을 보여준다.

## ELIZA의 규칙 기반 대화

[[007_ELIZA]]의 [[ELIZA]]는 사람이 키워드 우선순위, [[패턴 매칭]] 규칙, 응답 템플릿, 대명사 변환을 직접 작성한 시스템이다. 제한된 역할 안에서는 매우 설득력 있게 작동했지만, 새로운 영역으로 확장하려면 별도의 스크립트와 규칙이 필요했다. 이는 규칙 기반 접근의 통제 가능성과 [[지식 공학 병목]]을 동시에 보여준다.

## ATN의 절차적 문법 공학

[[증강 전이망]]은 규칙 기반 접근을 단순한 문자열 치환보다 훨씬 풍부하게 만든 사례다. 설계자는 재귀 호출, 레지스터, 자질 검사, 구조 구축 동작을 사용해 통사 분석과 후속 의미 처리를 연결할 수 있었다. LUNAR는 이 절차적 파서를 월 지질학의 의미 해석과 데이터베이스 검색에 결합했다.

이 유연성은 동시에 문법 공학 비용을 만들었다. 상태·호·검사·동작을 사람이 작성하고 디버깅해야 하며, 임의 절차를 허용할수록 문법의 형식적 검증과 실행 시간 경계가 어려워진다. 다만 이 병목을 “ATN은 언제나 지수 시간이라 실패했다”로 단순화하지 않는다. 우즈는 비증강 RTN과 제한된 ATN에 Earley식 $O(n^3)$ 파싱을 적용할 수 있음을 논의했다.

## 몬태규 의미론의 명시적 조합

[[몬태규 의미론]]은 절차적 파서와 다른 방식의 규칙 기반 정밀성을 보여 준다. 문법 규칙마다 유형이 있는 의미 연산을 대응시키고, 복합 표현의 논리 번역을 부분들의 번역으로부터 계산한다. 이 [[합성성]]은 통사 도출과 의미 해석의 인터페이스를 명시적으로 검사할 수 있게 하지만, 기본 어휘 의미·문법 단편·가능한 작용역·문맥 해소 규칙을 연구자가 정해야 한다.

이 접근도 “명시적 규칙은 실패하고 신경망이 모두 대체했다”는 단선적 서사로 정리하지 않는다. Rosetta는 몬태규 문법을 명시적으로 채택했고, Core Language Engine은 Montague(1973)를 선구적 연구로 인용하면서 QLF·LF의 합성 규칙을 설명했다. 반대로 등록된 근거는 Transformer가 유형이 있는 논리 번역 규칙을 구현하거나 어텐션이 몬태규 문법에서 직접 파생됐음을 뒷받침하지 않는다.

## NLP 통계적 전환의 실제 시간표

NLP에서는 규칙과 학습이 한 번에 교체되지 않았다. 섀넌의 1948년 통계 언어 연구와 1964년 Brown Corpus가 앞섰고, Jelinek는 1976년에 연속 음성 인식의 확률 모델과 가설 탐색을 보고했다. 텍스트 처리에서는 Church의 1988년 확률적 품사 태거와 IBM 연구진의 1990년 통계 기계 번역이 구체적인 이정표다. Church와 Mercer가 1993년 이 흐름을 “1950년대식 경험적·통계적 방법의 부활”로 설명했으므로, 1980년대를 단일한 발명 시점으로 잡지 않는다.

[[022_IBM 통계적 기계 번역과 데이터 기반 전환]]의 연표도 이 점을 구체화한다. IBM의 [[통계적 기계 번역]]은 1988년 연구 구상, 1990년 프랑스어→영어 예비 실험, 1991년 병렬 문장 정렬, 1993년 Models 1–5의 정식화로 전개됐다. 이를 1991년 한 번의 발명으로 합치면 서로 다른 논문의 기여와 실험 범위를 잃는다.

이 시간표에는 수작업 규칙과 학습된 통계 모델만으로 나뉘지 않는 별도·중간 계열도 있다. [[017_Lesk 알고리즘과 단어 의미 중의성 해소]]의 [[Lesk 알고리즘]]은 1986년 기계 판독형 사전을 사용해 [[단어 의미 중의성 해소]]를 수행했다. 후보 의미의 정의와 문맥 단어들의 정의 사이에서 정확히 일치하는 어휘를 세어 최대 중첩을 고르는 결정론적 지식 기반 절차였으며, 자료에서 매개변수나 확률을 학습한 통계 모델은 아니었다.

따라서 Lesk를 규칙 기반 NLP에서 현대 통계·신경 NLP로 곧장 이어지는 직접 조상으로 놓지 않는다. 이 사례는 사람이 편찬한 사전 자원을 새로운 계산 절차로 재활용하는 계열이 규칙 작성과 통계 학습 사이에 병존했음을 보여 준다.

[[은닉 마르코프 모델]]의 수학적 기반도 Baum·Petrie의 1966년 연구와 1970년 재추정 논문으로 거슬러 올라간다. 1975년 DRAGON과 IBM 통계 디코더, 1976년 Jelinek의 종합은 이 기반이 음성 인식에 적용된 별도 단계다. HMM을 1970년대에 발명된 단일 음성 기술로 묶지 않는다.

[[통계적 자연어 처리]]는 구조를 없앤 것이 아니다. HMM 태거는 품사를 상태로 사용하고, 확률 문법은 형식 문법의 규칙에 가중치를 둔다. Brill의 1992년 태거는 주석 [[말뭉치 기반 학습|말뭉치]]에서 사람이 읽을 수 있는 변환 규칙을 학습했다. 이 사례들은 상징 표현·수작업 설계·통계 추정이 하나의 시스템 안에 공존할 수 있음을 보여 준다.

IBM 번역 모형도 “규칙을 데이터로 완전히 대체한” 예외가 아니다. 연구진은 Hansard를 문장쌍으로 정렬·필터링하고, 언어 모델과 번역 모델의 분해, 정렬·생성도·왜곡의 구조, 디코더와 탐색 절차를 설계했다. EM은 관측되지 않은 정렬 하나를 정답으로 고정하는 대신 가능한 정렬의 기대 통계를 계산했고, 복잡한 모델에서는 그 합을 근사했다. 데이터 기반 전환은 인간 설계를 없애기보다 설계 대상의 경계를 옮긴 과정이다.

## HMM 음성 인식의 혼합 설계

1975년 Jelinek·Bahl·Mercer의 연속 음성 디코더는 통계 언어 모델뿐 아니라 음소 사전과 통계적 음운 규칙, 음성 정합 알고리즘, 단어 수준 탐색 제어를 함께 사용했다. Baker의 DRAGON도 여러 지식원을 마르코프 과정의 확률 함수로 표현했다. [[Baum–Welch 알고리즘]]처럼 매개변수를 데이터에서 재추정하는 절차가 도입됐어도 상태 구조·발음 단위·특징·탐색을 사람이 설계하는 일은 남았다.

따라서 음성 인식의 변화는 “손으로 쓴 모든 규칙”에서 “데이터만 넣는 자동 시스템”으로의 완전 교체가 아니다. 명시적 지식과 확률 추정의 경계가 이동하고 학습 가능한 구성 요소가 늘어난 과정이다.

## TDNN의 국소 시간 특징 학습

[[020_시간 지연 신경망과 음소 인식]]의 [[시간 지연 신경망]]은 지연된 국소 입력과 시간축 공유 가중치를 결합해 음소 분류에 유용한 내부 특징을 역전파로 학습했다. 이는 사람이 위치별 검출기를 따로 설계하는 부담을 줄인 중요한 변화였다. 그러나 입력은 16개 정규화 멜 스케일 스펙트럼 계수와 수동으로 표시한 음소 경계에서 만든 고정 15프레임 토큰이었고, 네트워크도 화자마다 따로 학습됐다.

비교 HMM 역시 전이·관측 확률을 데이터에서 학습했으며, 저자들은 두 시스템의 입력 표현이 달라 모델링 전략과 전처리 표현의 기여를 분리할 수 없다고 한정했다. 따라서 TDNN은 학습 가능한 국소 시간 특징의 범위를 넓힌 사례이지, HMM과 특징 공학을 즉시 전면 대체한 원시 음성 종단 간 시스템은 아니다. 시간 위치별 계산은 병렬화할 수 있는 순방향 합성곱이므로 순환 상태나 Transformer 자기어텐션의 직접 기원으로도 합치지 않는다.

## CNN의 구조적 귀납 편향과 특징 학습

[[021_합성곱 신경망과 특징 학습]]의 [[합성곱 신경망]]은 영상의 모든 위치에 별도 규칙을 작성하는 대신 국소 연결과 공유 가중치를 구조로 정하고, 필터 값과 계층적 조합을 데이터에서 학습했다. LeCun 등의 1989년 우편번호 인식기는 특징 추출기와 분류기를 역전파로 공동 훈련했고, 1998년 LeNet-5는 합성곱·subsampling 계층을 이용한 문서 인식 시스템을 상세히 제시했다.

이는 ‘규칙에서 데이터로’의 전환이 인간 설계를 제거한 사건이 아니라 설계 경계를 이동시킨 과정임을 다시 보여 준다. 숫자 분할·크기 정규화·입력 부호화, 국소성·가중치 공유·계층 깊이, 손실과 평가 기준은 사람이 정했다. 네트워크는 그 구조 안에서 유용한 내부 표현을 학습했다. 따라서 CNN의 성과를 특징 공학의 완전 폐기나 데이터만으로 구조까지 자동 결정한 사례로 기술하지 않는다.

## 현대 LLM으로의 연결

현대 [[대규모 언어 모델]]은 대규모 텍스트에서 표현과 패턴을 학습하며 많은 수작업 언어 규칙을 대체한다. 퍼셉트론과는 학습 목표와 구조가 다르지만 학습 가능한 매개변수를 사용한다는 넓은 신경망 계보를 공유한다. 데이터 선택, 토큰화, 평가 기준, 안전 정책, 도구 사용 규칙과 지식 갱신은 여전히 사람이 설계한다.

## 해석

AI 역사는 규칙 기반 접근이 단순히 실패하고 데이터 기반 학습이 승리한 이야기가 아니다. 규칙 기반 시스템은 명시성과 통제 가능성을 제공했고, 학습 기반 시스템은 확장성과 적응성을 제공했다. 현대 AI의 실용적 과제는 두 흐름을 결합해, 데이터에서 학습하되 필요한 곳에서는 구조와 검증 절차를 명시적으로 부여하는 데 있다.

## 출처

- [[003_Georgetown-IBM 기계 번역 시연]]
- [[004_퍼셉트론]]
- [[005_촘스키의 통사 구조]]
- [[006_위드로-호프의 MADALINE]]
- [[007_ELIZA]]
- [[012_상징 규칙에서 통계 학습으로]]
- [[013_은닉 마르코프 모델과 통계적 음성 인식]]
- [[014_증강 전이망과 절차적 자연어 파싱]]
- [[015_몬태규 의미론과 합성적 자연언어 해석]]
- [[017_Lesk 알고리즘과 단어 의미 중의성 해소]]
- [[020_시간 지연 신경망과 음소 인식]]
- [[021_합성곱 신경망과 특징 학습]]
- [[022_IBM 통계적 기계 번역과 데이터 기반 전환]]
- Michael Lesk, [Automatic Sense Disambiguation Using Machine Readable Dictionaries: How to Tell a Pine Cone from an Ice Cream Cone](https://doi.org/10.1145/318723.318728), 1986, pp. 24–26.
- Leonard E. Baum·Ted Petrie, [Statistical Inference for Probabilistic Functions of Finite State Markov Chains](https://doi.org/10.1214/aoms/1177699147), 1966, pp. 1554–1563.
- James K. Baker, [The DRAGON System—An Overview](https://research.ibm.com/publications/the-dragon-system-an-overview), 1975, pp. 24–29.
- Frederick Jelinek·Lalit R. Bahl·Robert L. Mercer, [Design of a Linguistic Statistical Decoder for the Recognition of Continuous Speech](https://research.ibm.com/publications/design-of-a-linguistic-statistical-decoder-for-the-recognition-of-continuous-speech), 1975, pp. 250–256.
- Frederick Jelinek, [Continuous Speech Recognition by Statistical Methods](https://research.ibm.com/publications/continuous-speech-recognition-by-statistical-methods), 1976, pp. 532–556.
- William A. Woods, [Transition Network Grammars for Natural Language Analysis](https://doi.org/10.1145/355598.362773), 1970, pp. 591–606.
- Richard Montague, [English as a Formal Language](https://lo2.org/pdf/math/montague.formal_philosophy.pdf), 1970, collected edition pp. 201–205, 217–221.
- Richard Montague, [The Proper Treatment of Quantification in Ordinary English](https://lo2.org/pdf/math/montague.formal_philosophy.pdf), 1973, collected edition pp. 247–270.
- Kenneth Ward Church, [A Stochastic Parts Program and Noun Phrase Parser for Unrestricted Text](https://aclanthology.org/A88-1019/), 1988, pp. 136–143.
- Peter F. Brown 외, [A Statistical Approach to Language Translation](https://aclanthology.org/C88-1016/), 1988, pp. 71–76.
- Peter F. Brown 외, [A Statistical Approach to Machine Translation](https://aclanthology.org/J90-2002/), 1990, pp. 79–85.
- Peter F. Brown·Jennifer C. Lai·Robert L. Mercer, [Aligning Sentences in Parallel Corpora](https://aclanthology.org/P91-1022/), 1991, pp. 169–176.
- Peter F. Brown 외, [The Mathematics of Statistical Machine Translation: Parameter Estimation](https://aclanthology.org/J93-2003/), 1993, pp. 263–311.
- Eric Brill, [A Simple Rule-Based Part of Speech Tagger](https://aclanthology.org/A92-1021/), 1992, pp. 152–155.
- Kenneth W. Church·Robert L. Mercer, [Introduction to the Special Issue on Computational Linguistics Using Large Corpora](https://aclanthology.org/J93-1001/), 1993, pp. 1–3, 15–16.
- Alexander Waibel 외, [Phoneme Recognition Using Time-Delay Neural Networks](https://doi.org/10.1109/29.21701), 1989, pp. 328–334.
- Yann LeCun 외, [Backpropagation Applied to Handwritten Zip Code Recognition](https://doi.org/10.1162/neco.1989.1.4.541), 1989, pp. 541–547.
- Yann LeCun 외, [Gradient-Based Learning Applied to Document Recognition](https://doi.org/10.1109/5.726791), 1998, pp. 2278–2284, 2316–2317.

## 관련 항목

- [[022_IBM 통계적 기계 번역과 데이터 기반 전환]]
- [[통계적 기계 번역]]
- [[규칙 기반 기계 번역]]
- [[013_은닉 마르코프 모델과 통계적 음성 인식]]
- [[은닉 마르코프 모델]]
- [[Baum–Welch 알고리즘]]
- [[지식 공학 병목]]
- [[퍼셉트론]]
- [[지도 학습]]
- [[ADALINE]]
- [[MADALINE]]
- [[특징 공학]]
- [[ELIZA]]
- [[패턴 매칭]]
- [[템플릿 기반 응답 생성]]
- [[통사 구조]]
- [[대규모 언어 모델]]
- [[012_상징 규칙에서 통계 학습으로]]
- [[통계적 자연어 처리]]
- [[말뭉치 기반 학습]]
- [[014_증강 전이망과 절차적 자연어 파싱]]
- [[증강 전이망]]
- [[015_몬태규 의미론과 합성적 자연언어 해석]]
- [[몬태규 의미론]]
- [[합성성]]
- [[017_Lesk 알고리즘과 단어 의미 중의성 해소]]
- [[Lesk 알고리즘]]
- [[단어 의미 중의성 해소]]
- [[시간 지연 신경망]]
- [[020_시간 지연 신경망과 음소 인식]]
- [[021_합성곱 신경망과 특징 학습]]
- [[합성곱 신경망]]
