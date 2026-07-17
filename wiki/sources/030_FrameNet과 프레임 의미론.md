---
schema_version: 2
id: source.030
page_type: source
title: FrameNet과 프레임 의미론
aliases:
  - 030_FrameNet - A Computational Resource for Frame Semantics
  - FrameNet - A Computational Resource for Frame Semantics
  - 프레임넷과 프레임 의미론
tags:
  - type/source
  - domain/nlp
  - domain/linguistics
  - domain/computer-science
created: '2026-07-17'
updated: '2026-07-18'
lifecycle: active
verification: verified
artifacts:
  - 'raw/030_FrameNet - A Computational Resource for Frame Semantics.ko.md'
  - 'raw/030_FrameNet - A Computational Resource for Frame Semantics.commentary.ko.md'
evidence:
  - source_id: baker-et-al-1998-framenet
    locator: 'pp. 86–90, 특히 초록·§§1–3과 p. 90 결론의 당시 프로젝트 상태·규모'
    relation: supports
  - source_id: johnson-et-al-2003-framenet-theory-practice
    locator: 'version 1.1, printed pp. 9–13, 특히 p. 9의 2001·2002 공개 연혁과 pp. 10–13의 주석 층·절차'
    relation: supports
  - source_id: boas-et-al-2024-framenet-25
    locator: 'pp. 263–284, 특히 §§2–3, Tables 1–3과 pp. 280–282의 범위·회고'
    relation: supports
  - source_id: berkeley-framenet-1-7
    locator: 'Release 1.7 XML: frame/Commerce_buy.xml; frame/Getting.xml; frRelation.xml (Using, ID 3)'
    relation: supports
  - source_id: gildea-jurafsky-2002-srl
    locator: 'pp. 245–288, 특히 초록·§§1–5의 FE 식별·분류 과제와 p. 285의 frame disambiguation 별도 요구'
    relation: supports
  - source_id: palmer-et-al-2005-propbank
    locator: 'pp. 71–106, 특히 §§1–3의 Penn Treebank 기반 구조, pp. 88–90 §5의 FrameNet 비교와 p. 95의 초기 SRL 모델 영향'
    relation: contextualizes
  - source_id: carreras-marquez-2004-conll-srl
    locator: 'pp. 89–97, 특히 §1의 FrameNet·PropBank 구분과 CoNLL-2004 PropBank 자료 명시'
    relation: supports
  - source_id: carreras-marquez-2005-conll-srl
    locator: 'pp. 152–164, 특히 §3.1의 Penn Treebank·PropBank 학습·개발·시험 자료'
    relation: supports
  - source_id: knight-et-al-2020-amr-3
    locator: 'LDC2020T02 §§Introduction–Data, 특히 PropBank frames와 59,255문장 구성 설명'
    relation: contextualizes
related:
  - concept.framenet
  - concept.propbank
  - concept.의미역-표지
  - concept.wordnet
  - concept.말뭉치-기반-학습
  - concept.통계적-자연어-처리
  - source.011
  - source.023
  - source.025
  - analysis.규칙-기반-ai에서-데이터-기반-학습으로
---
# FrameNet과 프레임 의미론

030 raw는 [[FrameNet]]을 1998년에 처음 공개된 대규모 계산 자원으로 제시하고, 의미역 표지·정보 추출·질의응답·기계 번역에서 지식 그래프·AMR·BERT·GPT까지 이어지는 혁명적 계보를 서술한다. 이 공개 문서는 **1997년 프로젝트 출범**, **1998년 진행 중 프로젝트 보고**, **사람이 설계하고 말뭉치로 뒷받침한 어휘 의미 데이터베이스**, **문헌으로 확인되는 직접 사용**을 분리한다.

FrameNet의 핵심 성과는 단어 뜻을 동의어 관계만으로 나타내지 않고, 단어의 특정 의미가 환기하는 상황과 그 상황의 참여자·속성을 프레임과 프레임 요소로 기술한 데 있다. 그러나 데이터베이스 자체가 문장을 자동으로 이해하거나 모든 의미역을 완성하는 시스템은 아니다. 프레임 설계와 말뭉치 주석은 사람이 수행했고, 새로운 문장의 프레임과 역할을 찾으려면 별도의 자동 분석 모델이 필요하다.

## 1997년 출범과 1998년 보고

2024년 프로젝트 회고는 Charles J. Fillmore가 International Computer Science Institute에서 1997년에 FrameNet을 출범시켰고, 첫 NSF 지원 기간이 1997년 3월부터 2000년 2월까지였다고 기록한다. 1998년 Baker·Fillmore·Lowe 논문도 FrameNet을 3년 계획의 **2년 차** 프로젝트라고 명시한다.

따라서 1998년을 곧바로 “완성된 대규모 데이터베이스의 첫 공개 릴리스”라고 부르면 논문 발표와 데이터 릴리스를 섞게 된다. 1998년 논문은 결과 데이터베이스가 무엇을 **포함할 것인지** 미래형으로 설명하고, 일부 도구를 `in development`나 `prototype`으로 표시했다. 당시 결론에 보고된 실적은 약 200개 미만 lemma, 약 1만 개 주석 문장, 약 12개 프레임과 47개 프레임 요소였다.

2003년 ICSI 작업 보고서가 기록한 실제 공개 연혁은 이보다 늦다. `starter lexicon`은 2001년 5월 약 2,000개 어휘 항목과 4만 개 주석 문장으로 공개됐고, 2002년 가을 공개판은 약 6,000개 어휘 항목과 13만 개 주석 문장으로 늘었다. 그러므로 **1997년 출범 → 1998년 초기 프로젝트 보고 → 2001년 첫 starter lexicon 공개 → 2002년 확대 공개**를 구분해야 한다.

| 시기 | 확인되는 사건 | 해석의 경계 |
| --- | --- | --- |
| 1960년대 후반 | Fillmore가 Case Grammar에서 논항의 의미 역할과 통사 실현 문제를 다뤘다. | FrameNet 데이터베이스가 이미 존재한 시기가 아니다. |
| 1970–1980년대 | 제한된 보편 격 목록에서 단어별 배경 지식 구조를 다루는 프레임 의미론으로 이론이 발전했다. | 한 논문이나 한 해의 단일 발명으로 압축하지 않는다. |
| 1997 | ICSI Berkeley에서 FrameNet 프로젝트가 출범하고 첫 NSF 지원이 시작됐다. | 프로젝트 시작과 공개 데이터 릴리스는 다른 사건이다. |
| 1998 | Baker·Fillmore·Lowe가 목표, BNC 기반 주석, 데이터 구조와 초기 규모를 보고했다. | 논문은 프로젝트가 진행 중이며 여러 도구가 개발 단계라고 썼다. |
| 2001–2002 | 2001년 5월 starter lexicon과 2002년 가을 확대판이 공개됐다. | 1998년 논문 발표를 데이터 릴리스로 소급하지 않는다. |
| 2002 | Gildea·Jurafsky가 FrameNet 주석을 이용한 자동 의미역 표지 모델과 실험을 보고했다. | target과 올바른 frame이 주어진 FE 식별·분류 실험이었다. |
| 2004–2005 | CoNLL 의미역 표지 shared task가 PropBank 기반 자료를 사용했다. | FrameNet 기반 초기 SRL 연구의 영향과 shared task의 실제 gold annotation을 구분한다. |
| 2024 | 프로젝트 구성원이 1997–2023년의 이론·워크플로·자료를 회고했다. | 회고 시점의 집계와 1998년 초기 규모를 섞지 않는다. |

## FrameNet이 표현하는 네 층

### 의미 프레임

의미 프레임은 함께 이해해야 하는 참여자와 속성을 가진 사건·상태·속성·관계·실체의 개념 구조다. 프레임은 사건에만 한정되지 않는다. 2024년 회고의 예에는 `Commerce_buy`라는 사건 프레임뿐 아니라 `Awareness` 상태, `Legality` 속성, `Leadership` 관계와 `Money` 실체 프레임도 포함된다.

### 프레임 요소

프레임 요소(frame element, FE)는 해당 프레임 안에서 구별되는 참여자·속성이다. 1998년 논문은 FE 이름이 보편적인 Agent·Patient 목록이 아니라 **특정 개념 프레임에 국소적**이라고 설명했다. 같은 이름처럼 보여도 프레임 정의와 관계 안에서 뜻을 읽어야 한다.

핵심 FE는 프레임을 정의하는 데 중심적인 역할이고, 비핵심·주변 FE는 시간·장소·방식처럼 더 일반적으로 덧붙을 수 있다. 모든 문장에 모든 FE가 표면적으로 나타나는 것은 아니다. 후대 FrameNet은 특정 어휘나 구문이 허용하는 영 실현(null instantiation)도 별도로 기록한다.

### 어휘 단위

어휘 단위(lexical unit, LU)는 철자 문자열 전체가 아니라 **특정 프레임을 환기하는 단어 또는 다단어 표현의 특정 의미**다. 같은 단어가 문맥에 따라 다른 프레임을 환기하면 서로 다른 LU로 취급할 수 있다. 품사도 LU 식별의 일부이므로 `buy.v`와 명사 용법은 자동으로 같은 항목이 아니다.

### 말뭉치 주석과 결합가

주석자는 실제 말뭉치 문장에서 target LU를 고르고, 어떤 구가 어느 FE를 실현하는지 표시한다. FrameNet은 여기에 phrase type과 grammatical function 층도 더해 의미 역할이 명사구·전치사구·주어·목적어 등으로 어떻게 실현되는지 기록한다. 여러 문장의 주석을 모으면 한 LU의 FE 조합과 통사 실현을 요약한 결합가(valence) 패턴을 만들 수 있다.

이 작업은 흔히 “말뭉치 기반”이라고 불리지만, 말뭉치에서 프레임 구조가 자동 발견됐다는 뜻은 아니다. 1998년 논문은 프로젝트의 중심을 **사람이 의미 지식을 기계 판독형으로 부호화하는 일**이라고 명시한다. 말뭉치는 언어학자의 직관을 제약하고 용례 증거를 제공하며, 주석 도구는 예문 추출·표시·검토를 돕는다.

## `Commerce_buy` 예시의 교정

030 raw는 `buy`, `purchase`, `acquire`, `obtain`, `get`, `buyer`, `buyable`이 모두 `Commerce_buy`를 환기한다고 서술한다. 2024년 회고의 Table 1은 `buy.v`와 `purchase.v`를 **예시**로 들 뿐 완전 목록을 제시하지 않는다. 완전한 버전 자료인 R1.7 XML에서 이 프레임의 LU는 `buy.v`, `purchase.v`, `purchase [act].n`, `buyer.n`, `purchaser.n`, `client.n`이다. 따라서 raw의 `buyer`는 실제 항목에 대응하지만, `acquire.v`·`obtain.v`·`get.v`는 `Getting`에 등록돼 있고 `buyable.a`는 R1.7에 없다.

R1.7에서 `Buyer`와 `Goods`는 Core FE다. `Money`·`Seller`뿐 아니라 `Means`·`Rate`·`Unit`·`Place`·`Purpose`·`Time`·`Manner`도 실제 Peripheral FE이며, `Explanation`·`Recipient`·`Period_of_iterations`·`Imposed_purpose`는 Extra-Thematic FE다. 그러므로 raw의 `Place`와 `Time` 자체가 틀린 것은 아니지만, 이를 핵심 FE와 같은 수준에서 “필수”라고 설명하면 coreness와 실제 표면 실현을 혼동한다.

| 항목 | raw의 단순화 | 근거로 확인되는 범위 |
| --- | --- | --- |
| LU | 상거래와 가까운 여러 단어·품사를 한 프레임에 묶는다. | R1.7에는 6개 LU가 있으며 raw의 `buyer`는 포함되지만 `acquire.v`·`obtain.v`·`get.v`·`buyable.a`는 포함되지 않는다. |
| FE | Buyer·Seller·Goods·Money·Place·Time을 모두 필수 구성 요소처럼 다룬다. | Buyer·Goods는 Core이고 Money·Seller·Place·Time 등은 실제 FE이되 Peripheral이다. |
| 다의성 | 같은 문자열에 프레임 목록만 붙이면 해결되는 것처럼 보인다. | 실제 문맥에서 어느 LU·프레임인지 판별하는 자동화 과제는 별도로 남는다. |
| 생략 | 표면에 없는 FE를 단순한 미완성 주석으로 본다. | FrameNet은 허가된 영 실현 유형도 주석 체계 안에서 구분한다. |

## 프레임 관계의 유형과 실제 연결 확인

030 raw도 상속·하위 프레임·선행 관계를 서로 다른 유형으로 소개한다. 2024년 회고는 이를 더 분명히 하며 `Inheritance`, `Perspective_on`, `Using`, `Causative_of`, `Inchoative_of`, `Precedes`, `Subframe`, `Metaphor`, `See_also`의 아홉 관계 유형을 구분한다. R1.7 `frRelation.xml`의 정식 관계 유형명은 `Using`이고, 개별 frame 파일에서는 방향을 나타내는 `Uses`로 표시된다. 상속은 자식 프레임이 부모 프레임의 구조를 물려받는 한 종류일 뿐이다.

030 raw의 `Commerce_sell`이 일반 `Commerce_transaction`을 상속한다는 예처럼, 의미상 가까워 보인다는 이유만으로 관계 종류를 정하면 안 된다. 실제 데이터베이스가 어느 버전에서 어떤 방향과 관계 이름을 기록했는지 확인해야 한다. 프레임 네트워크는 단순 taxonomy도, 임의의 세계 사실을 저장하는 일반 [[WordNet|어휘 의미망]]이나 지식 그래프도 아니다.

## 의미역 표지에서 확인되는 직접 사용

Gildea·Jurafsky의 2002년 연구는 FrameNet의 주석 문장과 프레임별 FE를 이용해 의미역을 자동으로 붙이는 통계 모델을 학습했다. 다만 실험에는 **target word와 올바른 frame이 주어졌고**, 모델은 FE의 문장 구간을 찾고 역할을 분류했다. 논문은 frame disambiguation을 별도 모듈로 남겼다. 이 사례는 FrameNet이 자동 의미 분석의 감독 자료가 될 수 있음을 직접 보여 주지만 전체 frame-semantic parsing 파이프라인을 해결한 것은 아니다. 동시에 두 층을 구분해야 한다.

1. FrameNet은 프레임·LU·FE 정의와 사람이 붙인 말뭉치 주석을 제공한다.
2. 의미역 표지 또는 frame-semantic parsing 시스템은 그 자료에서 패턴을 학습해 새 문장을 예측한다.

FrameNet의 공개가 [[의미역 표지]] 연구에 중요한 자원을 제공했다는 평가는 가능하지만, 의미역 표지 전체가 1998년에 시작됐거나 FrameNet 한 자원에서만 발전했다고 쓰면 과장이다. [[023_Penn Treebank와 통계적 구문 분석|Penn Treebank]] 위에 구축된 [[PropBank]]도 다른 역할 체계와 더 넓은 동사 coverage를 제공했다.

## PropBank·CoNLL과의 구분

[[PropBank]]는 미리 존재한 Penn Treebank 구문 나무에 동사 술어별 논항 구조를 덧붙였다. 역할은 술어의 frameset 안에서 `Arg0`, `Arg1`처럼 번호로 표시되며, 같은 번호의 구체적 뜻은 술어·roleset 정의를 확인해야 한다. 반면 FrameNet은 여러 품사의 LU를 공유 의미 프레임 아래 묶고, `Buyer`, `Goods`처럼 프레임별 이름을 가진 FE를 사용한다.

030 raw는 PropBank가 FrameNet 접근에서 “직접 영감을 받았다”고 서술한다. Palmer 등의 2005년 논문은 두 자원이 의미역 주석이라는 목표를 공유하지만 방법은 상당히 다르며, PropBank의 역할 체계가 주로 VerbNet class에 의존한다고 설명한다. 같은 논문은 Gildea·Jurafsky의 FrameNet 기반 초기 자동 의미역 표지 모델과 특징이 PropBank 실험에 영향을 준 사실도 기록한다. **자동 SRL 방법론의 확인되는 영향**과 **PropBank 말뭉치·역할 체계가 FrameNet에서 직접 파생됐다는 계보**를 구분해야 한다.

030 raw는 CoNLL-2004와 CoNLL-2005가 “FrameNet에서 영감을 받은 주석”을 사용했다고 서술한다. 그러나 2004 shared task 설명은 당시 대표 영어 의미역 말뭉치로 FrameNet과 PropBank를 구분한 뒤, 과제는 **PropBank corpus에 집중한다**고 명시했다. 2005 설명도 학습·개발·시험 자료가 Penn Treebank와 PropBank에서 파생됐다고 적었다. FrameNet 기반 초기 SRL 연구가 넓은 과제 형성에 준 영향과 shared task가 실제로 사용한 PropBank gold annotation을 같은 것으로 부르지 않는다.

## WordNet·AMR·LLM과의 관계

### WordNet

[[WordNet]]은 word form의 의미를 synset으로 묶고 동의·상하위·부분 관계 같은 어휘·의미 관계를 기록한다. FrameNet은 한 LU가 환기하는 배경 상황, FE와 통사 실현을 기록한다. 두 자원은 결합할 수 있지만 표현 단위와 목표가 다르며, FrameNet을 WordNet의 직접 후속 버전이라고 볼 수 없다.

### AMR

AMR과 FrameNet은 문장을 단어 목록보다 구조적인 의미로 나타내려 한다는 공통점이 있다. 그러나 LDC의 AMR 3.0 공식 카탈로그는 AMR이 **PropBank frames**, 비핵심 의미역, 문장 내 공지시, 개체명·양상·부정 등을 사용한다고 명시한다. 이 근거만으로 AMR을 FrameNet의 직접 후손이라고 하거나 AMR annotator가 FrameNet frame을 표준 술어 목록으로 사용한다고 쓸 수 없다.

### BERT와 GPT

030 raw는 BERT와 GPT가 명시적 학습 없이 프레임과 의미역을 암묵적으로 학습한다는 연구 결과를 일반 사실처럼 제시하지만, 특정 논문·모델 버전·probe·평가 자료를 제시하지 않는다. 언어 모델에서 역할 정보가 어느 정도 복원된다는 개별 실험이 있더라도, 그것은 모델이 FrameNet 데이터 구조를 내부에서 그대로 실행하거나 FrameNet에서 직접 발전했다는 증거가 아니다.

FrameNet은 언어 모델을 평가하거나 구조화된 감독을 더하는 자원으로 사용할 수 있다. 다만 이때도 **어떤 FrameNet 버전**, **어떤 frame identification·argument identification·role classification 과제**, **어떤 기준선과 지표**를 사용했는지 밝혀야 한다. “프레임 같은 패턴”이라는 표현만으로 직접 계보를 만들지 않는다.

## 응용 서술의 범위

프레임 구조는 정보 추출·질의응답·기계 번역에서 유용한 중간 표현이 될 수 있다. 예를 들어 질문이 특정 프레임의 어느 FE를 요구하는지 분석하거나, 사건 참여자를 구조화하거나, 언어 사이에서 역할 대응을 유지하려는 연구가 가능하다. 그러나 030 raw는 구체적인 시스템·데이터셋·성능 비교 없이 이 분야들을 FrameNet이 “혁명적으로 바꿨다”고 묶는다.

이 공개 문서는 직접 확인된 2002년 의미역 표지 사용을 핵심 사례로 남기고, 다른 분야는 개별 1차 연구가 확인될 때 확장한다. 어떤 자원이 응용에 사용됐다는 사실, 그 자원이 성능을 높였다는 실험 결과, 분야 전체의 발전을 일으켰다는 역사적 인과는 서로 다른 주장이다.

## 범위와 한계

- 프레임·FE 정의, LU 선택과 예문 주석에는 훈련된 사람의 판단과 지속적인 편집이 필요하다.
- 프레임 단위로 작업하는 방식은 관련 단어의 패턴을 함께 볼 수 있지만, 어휘 전체 coverage가 고르게 완성된다는 보장은 없다.
- 프레임의 세분도와 서로 겹치는 프레임의 경계는 자동으로 주어지지 않는 편집·이론 문제다.
- 영어 말뭉치에서 만든 LU와 통사 실현 패턴을 다른 언어에 그대로 복사할 수 없다. 여러 언어의 FrameNet은 공통 개념과 언어별 lexicalization·구문을 함께 조정한다.
- 데이터베이스가 가능한 프레임과 결합가를 제공해도 실제 문장의 다의성 해소, frame identification과 FE span·role 예측은 별도 계산 문제다.
- 2024년 회고는 1997–2023년 작업으로 1,200개가 넘는 프레임, 1만 개가 넘는 프레임별 FE, 1만 3천 개가 넘는 LU와 20만 건이 넘는 자연 문장 속 프레임 인스턴스가 수작업 주석됐다고 집계했다. 이는 1998년 초기 규모나 매 시점의 최신 릴리스 수치와 구분해야 한다.

## 검증 정정

- **1998년 최초 대규모 공개 릴리스**: 1997년에 프로젝트가 출범했고 1998년 논문은 2년 차의 목표·워크플로·초기 자료를 보고했다. 작업 보고서가 기록한 첫 starter lexicon 공개는 2001년 5월이다.
- **말뭉치 기반과 자동 귀납의 구분**: raw도 수작업 annotation을 설명한다. 말뭉치가 분석을 제약한다는 사실은 프레임·FE·LU가 사람의 설계·검토 없이 자동 발견됐다는 뜻이 아니다.
- **`Commerce_buy`의 LU와 FE 목록**: 회고의 예시 표를 완전 목록으로 읽지 않고 R1.7 XML을 대조했다. raw의 `buyer`·`Place`·`Time`은 실제 항목과 대응하지만, 일부 LU는 다른 프레임에 속하고 Buyer·Goods와 주변 FE의 coreness도 구분해야 한다.
- **가상 관계 예시와 실제 데이터베이스 관계**: raw도 여러 관계 유형을 구분하지만 `Commerce_sell`의 상속 예시는 특정 버전의 실제 관계와 방향을 확인해야 한다.
- **FrameNet-inspired 계보와 CoNLL 자료**: FrameNet 기반 초기 SRL 연구의 영향은 확인되지만 CoNLL-2004·2005 shared task의 gold annotation은 Penn Treebank·PropBank 기반이다.
- **PropBank가 FrameNet에서 직접 영감을 받았다는 계보**: Palmer 등의 2005년 논문은 PropBank의 역할 설계를 Levin·VerbNet 계보에 놓고 FrameNet과 상당히 다른 방법·상호 보완적 mapping을 설명한다. 이 논문에서 확인되는 Gildea·Jurafsky 모델의 방법론적 영향과 PropBank 말뭉치·역할 체계의 기원을 같은 주장으로 합치지 않는다.
- **AMR annotator가 FrameNet을 표준 frame 목록으로 사용**: AMR 3.0 공식 자료는 PropBank frames를 명시한다.
- **FrameNet이 IE·QA·MT·지식 그래프를 일괄 혁신**: 과제별 직접 사용과 비교 실험을 확인해야 하며, 분야 전체의 단일 인과는 입증되지 않았다.
- **BERT·GPT가 FrameNet 구조를 암묵적으로 구현**: 특정 probe와 평가가 없는 일반 주장으로는 내부 메커니즘이나 직접 계보를 확정할 수 없다.

## 핵심 문장

- FrameNet은 프레임 의미론을 프레임·어휘 단위·프레임 요소·말뭉치 예문과 결합가로 구현한 사람이 읽고 기계가 처리할 수 있는 어휘 의미 데이터베이스다.
- 1998년 논문은 완성된 대규모 자원의 최초 릴리스가 아니라 1997년에 출범한 프로젝트의 초기 목표·워크플로·규모를 보고했다.
- 프레임 요소는 전역 Agent·Patient 목록이 아니라 프레임에 국소적인 역할이며, 의미와 통사 실현을 서로 다른 주석 층으로 기록한다.
- Gildea·Jurafsky의 2002년 연구는 FrameNet 주석의 자동 의미역 표지 사용을 직접 보여 주지만, CoNLL-2004·2005 과제는 PropBank 기반이었다.
- WordNet·PropBank·AMR·언어 모델과 공유하는 문제나 실제 연계는 설명할 수 있지만, 그것을 하나의 직선적 기술 계보로 바꾸면 안 된다.

## 출처

- Collin F. Baker·Charles J. Fillmore·John B. Lowe, [The Berkeley FrameNet Project](https://aclanthology.org/P98-1013/), 1998, pp. 86–90.
- Christopher R. Johnson 외, [FrameNet: Theory and Practice](https://ids-pub.bsz-bw.de/frontdoor/index/index/docId/5416), version 1.1, ICSI, 2003, 특히 printed pp. 9–13.
- Hans C. Boas·Josef Ruppenhofer·Collin Baker, [FrameNet at 25](https://doi.org/10.1093/ijl/ecae009), 2024, pp. 263–284.
- Berkeley FrameNet Project, [Berkeley FrameNet Data Release 1.7](https://berkeleyfn.framenetbr.ufjf.br/framenet_data), 2016, `frame/Commerce_buy.xml`, `frame/Getting.xml`, `frRelation.xml`.
- Daniel Gildea·Daniel Jurafsky, [Automatic Labeling of Semantic Roles](https://aclanthology.org/J02-3001/), 2002, pp. 245–288.
- Martha Palmer·Daniel Gildea·Paul Kingsbury, [The Proposition Bank: An Annotated Corpus of Semantic Roles](https://aclanthology.org/J05-1004/), 2005, pp. 71–106.
- Xavier Carreras·Lluís Màrquez, [Introduction to the CoNLL-2004 Shared Task: Semantic Role Labeling](https://aclanthology.org/W04-2412/), 2004, pp. 89–97.
- Xavier Carreras·Lluís Màrquez, [Introduction to the CoNLL-2005 Shared Task: Semantic Role Labeling](https://aclanthology.org/W05-0620/), 2005, pp. 152–164.
- Kevin Knight 외, [Abstract Meaning Representation (AMR) Annotation Release 3.0](https://catalog.ldc.upenn.edu/LDC2020T02), LDC2020T02, 2020.
- 프로젝트 보존 자료: `raw/030_FrameNet - A Computational Resource for Frame Semantics.ko.md`, `raw/030_FrameNet - A Computational Resource for Frame Semantics.commentary.ko.md`.

## 관련 항목

- [[FrameNet]]
- [[PropBank]]
- [[의미역 표지]]
- [[WordNet]]
- [[025_WordNet과 어휘 의미망]]
- [[말뭉치 기반 학습]]
- [[통계적 자연어 처리]]
- [[023_Penn Treebank와 통계적 구문 분석]]
- [[011_개념 의존]]
- [[규칙 기반 AI에서 데이터 기반 학습으로]]
