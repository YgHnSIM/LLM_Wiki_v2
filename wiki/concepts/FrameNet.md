---
schema_version: 3
id: concept.framenet
page_type: concept
title: FrameNet
aliases:
  - 프레임넷
  - Berkeley FrameNet
  - FrameNet lexical database
  - 프레임 의미론 자원
tags:
  - type/concept
  - domain/nlp
  - domain/linguistics
  - domain/computer-science
created: '2026-07-17'
updated: '2026-07-21'
editorial_status: active
review:
  evidence_coverage: verified
  content_mode: descriptive
artifacts:
  - raw/030_FrameNet - A Computational Resource for Frame Semantics.ko.md
  - raw/030_FrameNet - A Computational Resource for Frame Semantics.commentary.ko.md
evidence:
  - source_id: baker-et-al-1998-framenet
    locator: 'pp. 86–90, 특히 §§1–3의 frame-local FE, 데이터 구성과 수작업 주석 절차'
    relation: supports
  - source_id: johnson-et-al-2003-framenet-theory-practice
    locator: 'version 1.1, printed pp. 9–13의 공개 연혁과 FE·GF·PT 주석 구조'
    relation: supports
  - source_id: boas-et-al-2024-framenet-25
    locator: 'pp. 263–284, 특히 §§2–3, Tables 1–3과 1997–2023년 프로젝트 회고'
    relation: supports
  - source_id: berkeley-framenet-1-7
    locator: 'Release 1.7 XML: frame/Commerce_buy.xml; frame/Getting.xml; frRelation.xml (Using, ID 3)'
    relation: supports
  - source_id: gildea-jurafsky-2002-srl
    locator: 'pp. 245–288, FrameNet 주석을 이용한 FE 식별·분류 실험과 p. 285의 frame disambiguation 별도 요구'
    relation: supplements
  - source_id: palmer-et-al-2005-propbank
    locator: 'pp. 71–106, 특히 pp. 74–76의 Levin·VerbNet 계보, §5 pp. 88–90의 FrameNet 비교와 p. 95의 초기 SRL 모델 영향'
    relation: contextualizes
  - source_id: knight-et-al-2020-amr-3
    locator: LDC2020T02 §§Introduction–Data의 PropBank frames 기반 AMR 3.0 설명
    relation: contextualizes
relations:
  - target: source.030
    kind: related
  - target: concept.wordnet
    kind: related
  - target: concept.말뭉치-기반-학습
    kind: related
  - target: concept.통계적-자연어-처리
    kind: related
  - target: source.023
    kind: related
  - target: analysis.규칙-기반-ai에서-데이터-기반-학습으로
    kind: related
learning:
  difficulty:
    entry: introductory
    target: introductory
  prerequisites: []
  assumed_knowledge: 없음
  outcomes:
    - 'FrameNet의 네 기본 단위와 구축 절차를 설명하고, 자동 분석 모델 및 다른 의미 자원과 구분할 수 있다.'
  next:
    - target: concept.propbank
      reason: PropBank — 프레임별 의미역과 술어별 번호형 논항이 주석 단위를 어떻게 다르게 잡는지 비교한다.
    - target: concept.의미역-표지
      reason: 의미역 표지 — FrameNet 같은 주석 자원을 자동 예측 과제로 사용하는 방식을 이어서 본다.
---
# FrameNet

> [!note] 학습 안내
> **난이도:** 입문<br>
> **선수 지식:** 없음<br>
> **읽고 나면:** FrameNet의 네 기본 단위와 구축 절차를 설명하고, 자동 분석 모델 및 다른 의미 자원과 구분할 수 있다.

## 1단계 — 먼저 잡을 핵심

### 한 문장 정의

FrameNet은 프레임 의미론(frame semantics)을 바탕으로 영어의 **의미 프레임**, **어휘 단위**, **프레임 요소**, **말뭉치 예문과 결합가**를 연결한 어휘 의미 데이터베이스다. Charles J. Fillmore가 이끈 연구진이 1997년 ICSI Berkeley에서 프로젝트를 시작했고, 사람이 읽을 수 있는 사전 기술과 기계가 처리할 수 있는 구조화 자료를 함께 만드는 것을 목표로 했다.

FrameNet은 단어를 고립된 정의나 동의어 집합으로만 설명하지 않는다. 단어의 특정 의미가 어떤 사건·상태·관계·속성·실체의 배경 구조를 환기하는지, 그 구조에서 어떤 참여자와 속성이 구별되는지, 이들이 실제 문장에서 어떤 구문 형식으로 나타나는지를 함께 기록한다.

### 기본 단위

| 단위 | 뜻 | 주의할 점 |
| --- | --- | --- |
| 의미 프레임 | 함께 이해되는 참여자·속성을 가진 사건·상태·관계 등의 개념 구조 | 모든 프레임이 사건은 아니다. |
| 어휘 단위(LU) | 특정 품사와 의미의 단어·다단어 표현이 특정 프레임과 맺는 결합 | 같은 문자열의 다른 의미는 다른 LU가 될 수 있다. |
| 프레임 요소(FE) | 특정 프레임 안에서 정의되는 참여자·속성 역할 | 전역 Agent·Patient 목록과 동일하지 않다. |
| target | 주석 문장에서 프레임을 환기하는 LU의 실제 출현 | target과 FE가 채우는 구간을 구분한다. |
| 결합가 | FE가 phrase type과 grammatical function으로 실현되는 패턴 | 의미역 하나가 항상 같은 통사 위치에 오지 않는다. |

#### 프레임

프레임은 단어가 관점화하는 배경 구조다. `Commerce_buy`는 구매자의 관점에서 상거래를 나타내고, `Buyer`와 `Goods`를 중심 역할로 구별한다. 2024년 프로젝트 회고의 Table 1은 `buy.v`와 `purchase.v`를 LU 예시로 제시하며, R1.7 XML의 완전 목록에는 `purchase [act].n`·`buyer.n`·`purchaser.n`·`client.n`도 포함된다.

의미가 가깝다는 직관만으로 다른 동사·명사·형용사를 같은 프레임 LU라고 확정할 수는 없다. 실제 FrameNet 버전의 LU 항목과 용례를 확인해야 한다.

#### 프레임 요소

1998년 프로젝트 보고는 FE 이름이 특정 프레임의 개념 구조에 국소적이라고 설명했다. R1.7 `Commerce_buy`에서 `Buyer`·`Goods`는 Core이고 `Money`·`Seller`·`Place`·`Time` 등은 Peripheral이다. 이처럼 프레임의 의미를 직접 구성하는 핵심 FE와 시간·장소·방식처럼 더 넓게 덧붙을 수 있는 비핵심·주변 FE를 구별한다.

FE가 문장에 보이지 않는다고 해서 언제나 프레임과 무관한 것은 아니다. FrameNet은 어휘나 구문이 허용한 생략을 영 실현(null instantiation) 유형으로 기록할 수 있다. 데이터베이스의 역할 목록과 한 문장의 표면 실현은 다른 층이다.

#### 어휘 단위

LU는 단순한 표제어 문자열이 아니라 의미와 프레임의 연결이다. 다의어는 문맥에 따라 여러 프레임에 대응하는 여러 LU를 가질 수 있다. 반대로 서로 다른 단어나 품사가 같은 프레임을 환기할 수도 있다. 이런 구조는 동의어만 묶는 방식보다 어휘 의미와 사건 참여 구조를 함께 관찰하게 한다.

## 2단계 — 작동 원리

### 구축 절차

1998년 보고의 FrameNet 작업 흐름은 다음 네 단계로 정리된다.

1. 연구자가 프레임·FE·대상 LU와 조사할 통사 패턴을 준비한다.
2. British National Corpus 같은 말뭉치에서 LU의 용례를 추출하고 다양한 패턴을 표집한다.
3. 주석자가 문장 구간에 FE를 붙이고 대표 예·새 패턴·문제 사례를 표시한다.
4. 검토자가 주석을 바탕으로 LU 항목과 프레임 기술을 보완한다.

후대 작업 지침은 한 FE 실현을 의미 층인 **FE**, 문법 기능인 **GF**, 구 유형인 **PT**의 세 층으로 기술한다. 예를 들어 같은 FE가 능동문의 외부 명사구, 수동문의 전치사구 또는 허가된 영 실현으로 나타날 수 있다. 여러 주석 예문을 묶으면 LU별 결합가 표를 만들 수 있다.

이 절차는 데이터에서 프레임이 자동으로 귀납됐다는 뜻이 아니다. FrameNet은 사람이 수행하는 의미 분석을 말뭉치 증거로 제약하고, 검색·표집·주석 도구로 반복 가능한 편찬 과정에 넣은 자원이다. 사람이 만든 표현과 말뭉치에서 관찰한 실현을 결합한다는 점에서 [[규칙 기반 AI에서 데이터 기반 학습으로]]의 단순한 양자택일을 벗어나는 사례다.

### 프로젝트와 공개 연혁

- **1997**: ICSI Berkeley에서 프로젝트가 출범했다.
- **1998**: Baker·Fillmore·Lowe가 3년 사업 2년 차의 목표·초기 자료·도구를 보고했다. 당시 약 1만 주석 문장, 200개 미만 lemma와 약 12개 프레임이 있었다.
- **2001-05**: 약 2,000개 어휘 항목과 4만 주석 문장의 starter lexicon이 공개됐다.
- **2002 가을**: 공개판이 약 6,000개 어휘 항목과 13만 주석 문장으로 확대됐다.
- **2024 회고**: 연구진은 1997–2023년 작업으로 1,200개가 넘는 프레임, 1만 3천 개가 넘는 LU와 20만 건이 넘는 자연 문장 속 프레임 인스턴스를 수작업 주석했다고 집계했다.

따라서 “1998년 최초 대규모 릴리스”는 프로젝트 보고와 데이터 공개를 혼동한다. FrameNet은 버전과 편찬 시점이 있는 장기 자원이며, 정확한 규모를 인용할 때는 frame·LU·annotation set·고유 문장 같은 집계 단위도 밝혀야 한다.

### 프레임 관계

프레임 네트워크는 하나의 상속 taxonomy가 아니다. FrameNet은 다음과 같은 서로 다른 관계를 구분한다.

- `Inheritance`: 더 구체적인 프레임이 일반 프레임의 구조를 물려받는다.
- `Perspective_on`: 같은 복합 상황을 다른 관점에서 전경화한다.
- `Using`: 한 프레임이 다른 프레임의 일부 구조를 사용한다. 개별 frame 파일의 방향 표시는 `Uses`다.
- `Causative_of`, `Inchoative_of`: 원인 사건과 상태 변화의 관계를 나타낸다.
- `Precedes`, `Subframe`: 시간 순서와 복합 사건의 구성 단계를 나타낸다.
- `Metaphor`, `See_also`: 은유 대응과 편집상 참고 관계를 제공한다.

두 프레임이 의미상 가까워 보여도 관계 종류와 방향은 데이터베이스에서 확인해야 한다. `Commerce_buy`와 판매 관점처럼 한 상황을 다르게 보는 프레임은 단순 상하위 관계와 다를 수 있다.

### 자동 의미역 표지와의 관계

FrameNet 자체는 자동 의미 분석기가 아니다. 2002년 Gildea·Jurafsky 연구는 **target word와 올바른 frame이 주어진 상태에서** FrameNet 주석을 훈련 자료로 사용해 FE의 문장 구간을 찾고 역할을 분류하는 통계 모델을 실험했다. 논문은 frame disambiguation 모듈이 별도로 필요하다고 명시했다. 이처럼 FrameNet은 frame-semantic parsing과 의미역 표지의 감독·평가 자원이 될 수 있지만, 이 실험 하나가 전체 파이프라인을 자동화한 것은 아니다.

자원과 모델의 구분은 중요하다. FrameNet이 프레임 목록과 정답 주석을 제공해도 새로운 문장에서는 다음 문제가 남는다.

1. 어떤 표현이 target인지 찾는다.
2. 다의적인 target이 어느 프레임을 환기하는지 고른다.
3. FE를 채우는 문장 구간을 찾는다.
4. 각 구간에 맞는 FE 이름을 붙인다.

각 단계의 오류는 뒤 단계로 전달될 수 있고, 주석 범위 밖 어휘·장르·언어에서는 별도 자료와 적응이 필요하다.

## 3단계 — 기술과 근거

### WordNet·PropBank·AMR과의 구분

#### WordNet

[[WordNet]]은 word form과 synset을 동의·상하위·부분 관계 등으로 연결한다. FrameNet은 LU가 환기하는 프레임, 프레임별 FE와 통사 실현을 중심으로 한다. 두 자원은 보완하거나 mapping할 수 있지만, 어느 하나가 다른 하나의 새 버전은 아니다.

#### PropBank

[[PropBank]]는 [[023_Penn Treebank와 통계적 구문 분석|Penn Treebank]] 구문 나무에 동사 술어별 `Arg0`·`Arg1` 등의 논항 구조를 덧붙였다. FrameNet은 여러 LU를 공유 프레임으로 묶고 FE에 의미 이름을 붙인다. 두 자원은 [[의미역 표지]]라는 목표 일부를 공유하지만 역할 단위·품사 범위·편찬 방법이 다르다. Palmer 등의 2005년 논문은 PropBank 역할 설계를 주로 Levin·VerbNet 계보에 두고 FrameNet과의 상호 보완·mapping을 설명한다. 같은 논문에 기록된 FrameNet 기반 초기 SRL 모델의 방법론적 영향과 PropBank corpus 자체의 기원을 구분해야 한다. CoNLL-2004·2005 의미역 shared task도 FrameNet이 아니라 PropBank 기반 자료를 사용했다.

#### AMR

AMR은 사건과 참여자를 문장 전체의 그래프로 표현한다는 점에서 FrameNet과 비교할 수 있다. 그러나 AMR 3.0 공식 자료는 술어와 핵심 논항에 PropBank frames를 사용한다고 명시한다. 구조적 유사성이나 향후 연계 가능성을 FrameNet에서 AMR로 이어지는 직접 계보로 바꾸지 않는다.

### 신경 언어 모델과의 연결

BERT·GPT 계열이 FrameNet 주석 없이도 역할 정보를 어느 정도 예측할 수 있는지는 모델·과제·probe·데이터에 따라 실험해야 한다. 특정 분류 점수가 높다는 결과만으로 모델이 FrameNet의 이산 프레임 구조를 내부에 그대로 저장하거나 추론 과정에서 사용한다고 결론 내릴 수 없다.

현대 시스템에서 FrameNet은 다음과 같이 재사용할 수 있다.

- frame identification과 FE labeling의 미세조정·평가 자료
- 자유 형식 텍스트를 사건 유형과 역할 슬롯으로 구조화하는 schema
- 언어 모델 출력과 명시적 어휘 자원을 대조하는 해석·감사 기준
- 다른 어휘·구문·지식 자원과 연결한 하이브리드 분석

이는 FrameNet의 현재적 활용 가능성이지 Transformer·agent·RAG가 FrameNet에서 직접 발전했다는 역사적 증거는 아니다.

## 검증과 한계

### 한계

- 사람의 프레임 설계·LU 판정·주석과 지속적인 품질 관리가 필요해 확장이 느리다.
- 프레임별 작업 순서 때문에 어휘·의미 coverage가 불균일할 수 있다.
- 프레임 경계와 세분도, 핵심·비핵심 FE 판정에는 이론적·편집적 선택이 들어간다.
- 영어 말뭉치의 LU와 통사 실현을 다른 언어에 그대로 전이할 수 없다.
- 자원이 가능한 의미 구조를 제공해도 실제 문장의 target·frame·FE를 자동 판별하는 문제는 남는다.
- 버전마다 프레임·LU·주석 수가 달라지므로 재현 가능한 연구에는 릴리스와 집계 단위가 필요하다.

## 학습 확인

### 확인 질문

1. FrameNet의 프레임·프레임 요소·어휘 단위·말뭉치 주석은 어떻게 연결되는가?
2. 사람이 프레임을 설계하고 실제 예문을 주석하는 구축 절차는 어떤 산출물을 만드는가?
3. FrameNet을 자동 의미 분석기나 WordNet·PropBank·AMR의 다른 이름으로 볼 수 없는 이유는 무엇인가?

### 다음 문서

- [[concept.propbank|PropBank]] — 프레임별 의미역과 술어별 번호형 논항이 주석 단위를 어떻게 다르게 잡는지 비교한다.
- [[concept.의미역-표지|의미역 표지]] — FrameNet 같은 주석 자원을 자동 예측 과제로 사용하는 방식을 이어서 본다.

## 출처

- Collin F. Baker·Charles J. Fillmore·John B. Lowe, [The Berkeley FrameNet Project](https://aclanthology.org/P98-1013/), 1998, pp. 86–90.
- Christopher R. Johnson 외, [FrameNet: Theory and Practice](https://ids-pub.bsz-bw.de/frontdoor/index/index/docId/5416), version 1.1, ICSI, 2003, 특히 printed pp. 9–13.
- Hans C. Boas·Josef Ruppenhofer·Collin Baker, [FrameNet at 25](https://doi.org/10.1093/ijl/ecae009), 2024, pp. 263–284.
- Berkeley FrameNet Project, [Berkeley FrameNet Data Release 1.7](https://berkeleyfn.framenetbr.ufjf.br/framenet_data), 2016, `frame/Commerce_buy.xml`, `frame/Getting.xml`, `frRelation.xml`.
- Daniel Gildea·Daniel Jurafsky, [Automatic Labeling of Semantic Roles](https://aclanthology.org/J02-3001/), 2002, pp. 245–288.
- Martha Palmer·Daniel Gildea·Paul Kingsbury, [The Proposition Bank: An Annotated Corpus of Semantic Roles](https://aclanthology.org/J05-1004/), 2005, pp. 71–106.
- Kevin Knight 외, [Abstract Meaning Representation (AMR) Annotation Release 3.0](https://catalog.ldc.upenn.edu/LDC2020T02), LDC2020T02, 2020.
- [[030_FrameNet과 프레임 의미론]]
- 프로젝트 보존 자료: `raw/030_FrameNet - A Computational Resource for Frame Semantics.ko.md`, `raw/030_FrameNet - A Computational Resource for Frame Semantics.commentary.ko.md`.

## 관련 항목

- [[concept.propbank|PropBank]]
- [[concept.의미역-표지|의미역 표지]]
- [[source.030|FrameNet과 프레임 의미론]]
- [[concept.wordnet|WordNet]]
- [[concept.말뭉치-기반-학습|말뭉치 기반 학습]]
- [[concept.통계적-자연어-처리|통계적 자연어 처리]]
- [[source.023|Penn Treebank와 통계적 구문 분석]]
- [[analysis.규칙-기반-ai에서-데이터-기반-학습으로|규칙 기반 AI에서 데이터 기반 학습으로]]
