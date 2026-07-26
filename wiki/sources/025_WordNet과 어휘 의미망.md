---
schema_version: 3
id: source.025
page_type: source
title: WordNet과 어휘 의미망
aliases:
  - 025_WordNet - A Semantic Network for Language Understanding
  - WordNet - A Semantic Network for Language Understanding
  - WordNet 어휘 의미망
tags:
  - type/source
  - domain/nlp
  - domain/linguistics
  - domain/cognitive-science
  - domain/computer-science
created: '2026-07-16'
updated: '2026-07-21'
editorial_status: active
review:
  evidence_coverage: verified
  content_mode: descriptive
artifacts:
  - raw/025_WordNet - A Semantic Network for Language Understanding.ko.md
  - raw/025_WordNet - A Semantic Network for Language Understanding.commentary.ko.md
evidence:
  - source_id: miller-et-al-1990-introduction-wordnet
    locator: journal pp. 235–244; Princeton 공식 묶음 PDF의 Introduction pp. 2–9
    relation: supports
  - source_id: miller-1990-nouns-wordnet
    locator: pp. 245–264; Princeton 묶음 PDF pp. 17–18의 25 unique beginners 설명
    relation: supports
  - source_id: miller-1993-wordnet-project
    locator: 'p. 409, 특히 WordNet 1.3 공개일·부사 추가·SemCor 설명'
    relation: supports
  - source_id: miller-1994-wordnet-project
    locator: 'p. 468, 특히 WordNet Distribution과 1994-02-09 규모 보고'
    relation: supports
  - source_id: princeton-wordnet-1995-release-1-5
    locator: Release Information; What’s New; Semantic Concordance; 공식 아카이브 날짜
    relation: supports
  - source_id: miller-1995-wordnet
    locator: pp. 39–41
    relation: contextualizes
  - source_id: fellbaum-1998-wordnet
    locator: Foreword pp. xvii–xxiii와 품사·응용별 장; WordNet 1.6
    relation: contextualizes
  - source_id: princeton-wordnet-3-0-reference
    locator: 'wninput(5WN) §§Description, Pointers; wngloss(7WN) §Database Organization; uniqbeg(7WN) §Description; wnstats(7WN) §§Number of words, synsets, and senses, Notes'
    relation: supports
  - source_id: banerjee-pedersen-2002-adapted-lesk
    locator: 'pp. 136–145, 특히 §§2–4의 WordNet 관계·글로스 확장'
    relation: contextualizes
  - source_id: voorhees-1994-wordnet-query-expansion
    locator: 'pp. 61–69, 특히 §§3–4의 자동·수동 질의 확장 결과'
    relation: contextualizes
  - source_id: faruqui-et-al-2015-retrofitting
    locator: 'pp. 1606–1615, 특히 §§1–2의 semantic lexicon을 이용한 vector 후처리'
    relation: contextualizes
  - source_id: baker-et-al-1998-framenet
    locator: 'pp. 86–90, FrameNet의 frame semantics와 lexicon 구축 목표'
    relation: contextualizes
  - source_id: palmer-et-al-2005-propbank
    locator: 'pp. 71–72, PropBank의 predicate-argument annotation 목표'
    relation: contextualizes
relations:
  - target: concept.framenet
    kind: related
  - target: concept.단어-의미-중의성-해소
    kind: related
  - target: concept.lesk-알고리즘
    kind: related
  - target: source.017
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
    - 'WordNet이 단어 형태를 synset으로 묶고 어휘 관계와 의미 관계를 연결하는 방식, 버전별 자원과 인간 기억 모형의 경계를 설명할 수 있다.'
  next:
    - target: concept.wordnet
      reason: 다음에는 WordNet에서 synset과 관계 유형을 개념 중심으로 정리한다.
    - target: entity.조지-밀러
      reason: 프로젝트의 연구 목표와 공동 작업 범위는 조지 밀러에서 이어 본다.
---
# WordNet과 어휘 의미망

> [!note] 학습 안내
> **난이도:** 입문<br>
> **선수 지식:** 없음<br>
> **읽고 나면:** WordNet이 단어 형태를 synset으로 묶고 어휘 관계와 의미 관계를 연결하는 방식, 버전별 자원과 인간 기억 모형의 경계를 설명할 수 있다.

## 1단계 — 먼저 잡을 핵심

### 이 문서의 범위

원문은 WordNet을 1995년에 공개된 하나의 혁명으로 제시하고, 인간의 의미 기억을 충실히 재현한 구조가 현대 지식 그래프와 임베딩, 언어 모델로 직접 이어졌다고 서술한다. 이 공개 문서는 [[WordNet]]을 **영어 단어의 형태와 어휘화된 의미를 synset과 명시적 관계로 조직한 전자 어휘 데이터베이스**로 한정한다. 프로젝트 시작, 논문 발표, 배포 버전과 단행본 출간을 분리하고, 설계 동기와 입증된 인간 기억 모형, 어휘 의미망과 사실 지식 그래프, 이산 그래프와 신경 분산 표상을 구별한다.

### 핵심 요약

WordNet의 기본 단위인 synset은 어떤 문맥에서 서로 바꾸어 쓸 수 있는 단어나 연어의 집합이다. 하나의 word form은 품사와 의미가 다르면 여러 synset에 들어갈 수 있다. synset은 정의와 선택적 예문으로 이루어진 글로스를 지니며, 관계가 기록된 경우 다른 word form 또는 synset을 가리키는 포인터를 가진다. 따라서 `bank`라는 문자열 하나를 금융 기관과 강둑이라는 서로 다른 의미로 분리할 수 있다.

WordNet은 단순히 “개념을 노드, 모든 관계를 간선으로 둔 그래프”라고만 설명하기보다 두 층을 나눠 읽어야 한다. **어휘 관계**는 특정 word form 사이에 성립하고, **의미 관계**는 synset이 나타내는 word meaning 사이에 성립한다. 반의어 관계는 대표적인 어휘 관계이고, 상위어·하위어와 부분·전체 관계는 주로 synset 사이의 의미 관계다. 이 구분을 놓치면 synset 안의 모든 단어가 다른 synset의 모든 단어와 반의 관계라는 식의 잘못된 추론이 생긴다.

### 핵심 문장

- WordNet은 영어 word form을 synset이라는 어휘화된 의미 단위로 묶고, 어휘 관계와 의미 관계를 명시적 포인터로 기록한다.
- 1995년은 중요한 배포·소개 시점이지만, 1985년에 시작해 여러 논문과 버전을 거친 프로젝트의 최초 탄생일이 아니다.
- 명사·동사·형용사·부사는 서로 다른 조직 원리를 가지며, 특히 부사는 보통 파생된 형용사와 연결된다.
- WordNet의 규모는 버전과 집계 단위에 따라 달라지므로 정확한 수치는 해당 판본과 함께 읽어야 한다.
- 인간 어휘 기억에서 영감을 받은 설계와 인간 기억을 그대로 재현했다는 주장은 다르다.
- WordNet은 WSD와 어휘 의미 계산의 중요한 자원이지만 지식 그래프·임베딩·언어 모델 전체의 직접 조상은 아니다.

## 2단계 — 작동 원리

### 어휘망을 읽는 흐름

먼저 한 단어 형태가 가질 수 있는 의미들을 구분하고, 같은 의미를 표현하는 형태들을 하나의 synset으로 묶는다. 그런 다음 단어 형태 사이의 어휘 관계와 synset 사이의 의미 관계를 포인터로 연결해 품사별 어휘망을 탐색하게 한다.

## 3단계 — 기술과 근거

### 1995 한 해가 아닌 형성 과정

| 시점 | 확인되는 단계 | 구분해야 할 점 |
| --- | --- | --- |
| 1985 | Princeton 연구진이 Brown Corpus의 어휘를 출발점으로 프로젝트를 시작했다. | 1995년보다 약 10년 앞선다. |
| 1990 | Miller·Beckwith·Fellbaum·Gross·Katherine J. Miller가 《International Journal of Lexicography》 특집에서 설계와 품사별 구조를 공개했다. | 완성된 단일 버전의 탄생일이 아니라 이미 진행 중인 프로젝트의 이론·구현 보고다. |
| 1992-12-09 | Miller의 1993년 HLT 보고가 WordNet 1.3의 공개일을 기록했다. 이 버전에는 부사 자료도 포함됐다. | “1995 최초 공개”와 양립하지 않는다. |
| 1993-08 | 1994년 HLT 보고는 WordNet 1.4가 앞선 8월에 배포됐다고 적었다. | 보고서 출판연도 1994와 배포연도 1993을 섞지 않는다. |
| 1995 봄 | Princeton의 1.5 release announcement와 플랫폼별 패키지가 공개됐다. 같은 해 Miller의 CACM 논문이 38권 11호 pp. 39–41에 실렸다. | 1.5 배포와 1995년 소개 논문은 중요한 확산 단계지만 프로젝트의 시작이나 최초 공개가 아니다. |
| 1998 | Fellbaum이 편집하고 Miller가 서문을 쓴 단행본 《WordNet: An Electronic Lexical Database》가 WordNet 1.6의 설계와 응용을 정리했다. | 단행본 출간과 최초 설계를 같은 사건으로 보지 않는다. |

1.5의 공식 아카이브는 3월 16일자 release announcement, 4월 7일자 PC 패키지, 5월 30일자 Mac 패키지를 남긴다. 따라서 특정 하루를 모든 플랫폼의 단일 출시일로 고정하기보다 **1995년 봄의 1.5 배포**라고 표현하는 편이 정확하다.

### synset과 두 종류의 관계

WordNet 3.0 문서는 source file의 구성 요소를 orthography로 표현한 word form과 synset으로 표현한 word meaning으로 나눈다. synset의 단어들은 모든 문장에서 완전히 같은 표현이 아니라 **적어도 어떤 문맥에서 대체 가능한 대략적 동의어**다. 같은 synset이 공유하는 정의와 선택적 예문은 어휘 항목 하나가 아니라 그 의미 묶음을 설명한다.

| 층 | 연결 대상 | 대표 관계 | 읽을 때의 주의점 |
| --- | --- | --- | --- |
| 어휘 관계 | 특정 word form ↔ 특정 word form | 반의어, 파생 관련형, pertainym, 분사 관계 | 포인터가 synset 전체의 모든 단어 쌍에 자동 확장되지 않는다. |
| 의미 관계 | synset ↔ synset | 상위어·하위어, instance, 부분어·전체어, 동사 함의·원인 | 어휘화된 의미의 구조이며 임의의 세계 사실 전체를 나타내지 않는다. |

동의성은 synset을 구성하지만 완전한 문체·빈도·지역·시대적 등가성을 보장하지 않는다. 반의어도 이항 논리의 부정 연산자가 아니다. `hot`이 아니라는 사실만으로 `cold`가 참이라고 결론낼 수 없으며, 중간 온도나 적용 불가능한 경우가 남는다. WordNet의 포인터는 해당 어휘 관계를 기록할 뿐 배중률을 부여하지 않는다.

### 품사별 조직

WordNet은 명사·동사·형용사·부사의 네 open class를 서로 같은 방식으로 정렬하지 않는다. 관사·전치사·대명사·접속사·particle 같은 closed-class 항목은 기본 범위 밖이다.

| 품사 | 중심 구조 | 대표 포인터와 범위 |
| --- | --- | --- |
| 명사 | 상위어·하위어 계층 | instance, member·substance·part의 meronymy/holonymy를 구분한다. |
| 동사 | 상위어·하위어 계층과 행동 방식 | troponymy는 더 구체적인 수행 방식을 나타내며, entailment와 cause 포인터도 있다. |
| 형용사 | head synset과 satellite synset의 cluster | 중심 반의어 쌍 주변에 `similar to` 관계가 놓인다. pertainym과 분사 형용사는 별도 구조를 쓴다. |
| 부사 | 비교적 작은 독립 synset과 파생 연결 | 대개 자신이 파생된 **형용사**를 가리키며, 반의어와 domain 포인터도 가능하다. |

raw는 부사가 수식하는 동사 synset에 주로 연결된다고 설명하지만, WordNet 3.0의 입력 형식과 glossary는 부사가 보통 파생 원형인 형용사를 가리킨다고 명시한다. 문장에서 어떤 동사를 수식할 수 있다는 통사 사실과 데이터베이스에 저장된 어휘 포인터를 같은 것으로 취급하지 않는다. 또한 품사별 subnet 사이의 연결은 일부 파생 관계 등에 한정되므로, 네 품사가 하나의 촘촘한 단일 taxonomy를 이룬다고 보기도 어렵다.

### 버전에 따라 달라지는 최상위 구조

1990년 명사 논문은 당시 명사 어휘를 25개의 `unique beginner`가 이끄는 여러 계층으로 설명했다. 반면 WordNet 3.0의 `uniqbeg` 문서는 모든 명사 synset이 `entity`라는 하나의 unique beginner 아래 조직된다고 명시한다. raw의 “처음부터 entity 하나가 모든 명사의 최상위였다”는 인상은 후대 버전의 구조를 초기 설계에 소급한 것이다.

이 차이는 WordNet을 고정된 철학적 존재론으로 읽기보다 버전이 있는 편집 자원으로 읽어야 함을 보여 준다. synset 구성, sense 번호, 포인터와 hierarchy는 버전 사이에서 바뀔 수 있으므로, 연구 결과를 재현할 때는 `WordNet`이라는 이름만이 아니라 버전과 sense mapping을 함께 밝혀야 한다.

### WordNet 3.0의 규모

공식 통계는 다음과 같다.

| 품사 | 품사 안에서 고유한 문자열 | synset | word-sense pair |
| --- | ---: | ---: | ---: |
| 명사 | 117,798 | 82,115 | 146,312 |
| 동사 | 11,529 | 13,767 | 25,047 |
| 형용사 | 21,479 | 18,156 | 30,002 |
| 부사 | 4,481 | 3,621 | 5,580 |
| 합계 | 155,287 | 117,659 | 206,941 |

`155,287`은 각 품사 안에서 고유한 문자열 수를 더한 값이라 같은 철자가 여러 품사에 있으면 중복된다. 품사 중복을 제거한 실제 문자열 수는 `147,278`이다. 이 수를 synset 수나 sense 수와 바꾸어 적으면 안 된다. 하나의 문자열이 여러 synset에 참여할 수 있으므로 word-sense pair가 더 많다.

- WordNet 3.0에는 117,659개 synset과 206,941개 word-sense pair가 있으며, 품사 중복을 제거한 문자열 수는 147,278개다.

### 언어 처리에서의 쓰임

WordNet은 [[단어 의미 중의성 해소]], 의미 유사도, 정보 검색, lexical chain, 선택 제약처럼 명시적인 어휘 의미 구조가 필요한 연구에서 자원으로 쓰였다. [[Lesk 알고리즘]]의 원래 1986년 구현은 일반 기계 판독형 사전을 사용했지만, 2002년 Adapted Lesk는 WordNet 관계를 따라 관련 synset의 글로스를 확장했다. 따라서 “Lesk가 처음부터 WordNet 위에서 개발됐다”는 서술과 “후대 Lesk 변형이 WordNet을 활용했다”는 사실을 구분한다.

어휘 자원이 있다는 사실만으로 번역·검색·질의응답 성능이 항상 좋아지는 것은 아니다. 적용 방법, 대상 언어와 domain, 미등록 어휘, sense granularity, 기준선과 평가 자료를 함께 확인해야 한다. WordNet은 영어의 lexicalized concept와 어휘 관계를 제공하지만, 파리가 프랑스의 수도라는 사실이나 특정 자동차 모델의 제조사 같은 일반 세계 지식을 포괄적으로 저장하는 사실 지식 그래프는 아니다.

### 인간 기억 모형이라는 주장

1990년 연구는 WordNet의 설계가 인간 lexical memory에 관한 심리언어학 이론에서 영감을 받았다고 명시한다. 이것은 프로젝트의 중요한 **설계 동기와 가설**이다. 그러나 사람이 실제로 WordNet과 동일한 synset 경계, 포인터 종류, hierarchy를 저장하고 탐색한다는 것이 입증됐다는 뜻은 아니다.

따라서 WordNet이 종래의 알파벳순 사전과 달리 관계 기반 계산을 가능하게 했다고 평가할 수는 있지만, “인간의 semantic memory를 이전 자원보다 더 충실하게 복제했다”고 비교 우위를 확정하려면 별도의 인지 실험 근거가 필요하다. raw의 spreading activation 설명도 WordNet 데이터 구조의 가능한 비유이지 데이터베이스가 인간 뇌의 활성 과정을 구현했다는 증거가 아니다.

### 이산 어휘망과 신경 표상의 경계

WordNet의 한 synset은 명시적인 이산 포인터를 통해 다른 synset과 연결된다. 신경망의 distributed representation은 학습된 연속 벡터의 여러 차원에 정보가 분산된 기술적 표상이다. WordNet에서 의미가 여러 관계를 통해 설명된다는 점을 일상적 의미에서 “분산됐다”고 부를 수는 있어도, 두 표상 형식이 같거나 신경 임베딩이 WordNet에서 직접 유도됐다고 말할 수는 없다.

같은 이유로 다음 계보를 분리한다.

- [[FrameNet]]은 frame semantics와 frame element를, PropBank는 말뭉치의 predicate–argument 역할을 중심으로 설계됐다. 모두 구조화된 언어 자원이라는 공통점만으로 WordNet의 직접 후손이 되지는 않는다.
- 일반 knowledge graph는 개체와 세계 사실을 폭넓게 표현할 수 있지만 WordNet은 주로 어휘화된 의미와 어휘 관계를 다룬다. 일부 시스템이 WordNet을 연결하거나 통합할 수 있다는 사실과 전체 계보가 WordNet에서 시작됐다는 주장은 다르다.
- word embedding과 contextual language model은 말뭉치에서 연속 표상을 학습한다. WordNet 관계를 후처리나 제약으로 주입한 연구가 있다는 사실은 Word2Vec·BERT·LLM 전체의 직접 기원을 입증하지 않는다.

## 검증과 한계

### 범위와 한계

- 영어의 명사·동사·형용사·부사를 중심으로 하므로 closed-class 어휘, 신조어, 전문어, 고유명사와 다른 언어의 coverage는 별도 자원이 필요하다.
- synset과 관계는 lexicographer의 분석으로 구축된다. 명시성과 검토 가능성은 장점이지만, 새 용법을 자동으로 즉시 반영하지는 않는다.
- 의미 목록의 granularity가 응용 목적과 다를 수 있다. 서로 가까운 sense를 과도하게 나누거나 필요한 차이를 합치면 WSD 평가와 사용성이 달라진다.
- graph path는 명시적인 관계를 계산하게 하지만 연속적인 유사도나 corpus 안의 실제 사용 빈도를 그 자체로 제공하지 않는다.
- 단어·고정 연어 수준의 항목만으로 자유로운 구와 문장의 compositional meaning을 자동 계산하지 않는다.
- sense 번호와 나열 순서는 안정적인 자연법칙이나 정확한 빈도 순위가 아니다. 버전과 semantic concordance 자료에 의존한다.

raw가 제시한 문화적 편향과 높은 수작업 품질은 가능한 평가 쟁점이지만, 구체적인 오류율이나 문화 간 비교 자료 없이 확정적 사실로 옮기지 않는다.

### 검증 정정

- WordNet 프로젝트는 1985년에 시작됐고, 1990년 논문들과 1992년 1.3, 1993년 1.4 배포가 1995년보다 앞선다. 1995년은 1.5와 CACM 소개 논문의 해이지 단일 탄생일이 아니다.
- 1998년 단행본은 당시 최신인 1.6의 설계와 응용을 정리했다. 프로젝트 시작·버전 배포·논문·단행본을 하나의 “release”로 합치지 않는다.
- 인간 lexical memory에서 영감을 받았다는 설계 동기를 인간 기억을 충실히 재현했다는 실증 결론으로 바꾸지 않는다.
- 반의어는 특정 word form 사이의 어휘 관계다. `not hot`에서 곧바로 `cold`를 추론할 수 없다.
- 부사 synset은 대개 파생된 형용사를 가리킨다. 수식 가능한 동사에 주로 연결된다는 raw의 설명은 데이터베이스 포인터와 맞지 않는다.
- 1990년의 25 noun unique beginners와 WordNet 3.0의 단일 최상위 `entity`를 버전 차이 없이 합치지 않는다.
- raw의 `happy`·`joyful`·`cheerful`·`glad` 묶음과 특정 자동차 모델 계층은 설명용 예시일 뿐 실제 WordNet synset·instance 관계로 검증되지 않았으므로 채택하지 않는다.
- WordNet은 lexicalized concept의 sense inventory와 관계망이지 일반 세계 사실을 포괄하는 knowledge graph가 아니다.
- 명시적 이산 그래프와 학습된 연속 distributed representation은 서로 다른 표상이다. 관계 기반이라는 공통점만으로 WordNet에서 embedding·BERT·LLM으로 이어지는 직접 계보를 만들지 않는다.
- [[FrameNet]]·PropBank·일반 knowledge graph도 각각 다른 이론과 표현 대상을 가지므로 WordNet의 직접 후손으로 단정하지 않는다.

## 학습 확인

1. WordNet의 word form, sense, synset은 서로 어떻게 구분되는가?
2. 어휘 관계와 의미 관계는 어떤 단위를 연결하며 품사별 어휘망을 어떻게 구성하는가?
3. WordNet을 인간 기억의 완전한 모형이나 임베딩·지식 그래프·언어 모델의 직접 조상으로 볼 수 없는 이유는 무엇인가?

다음에는 [[WordNet]]에서 synset과 관계 유형을 개념 중심으로 정리한다. 프로젝트의 연구 목표와 공동 작업 범위는 [[조지 밀러]]에서 이어 본다.

### 다음 문서

- [[concept.wordnet|WordNet]] — 다음에는 WordNet에서 synset과 관계 유형을 개념 중심으로 정리한다.
- [[entity.조지-밀러|조지 밀러]] — 프로젝트의 연구 목표와 공동 작업 범위는 조지 밀러에서 이어 본다.

## 출처
- George A. Miller·Richard Beckwith·Christiane Fellbaum·Derek Gross·Katherine J. Miller, [Introduction to WordNet: An On-line Lexical Database](https://doi.org/10.1093/ijl/3.4.235), 1990, pp. 235–244; Princeton 공식 묶음 PDF의 Introduction pp. 2–9.
- George A. Miller, [Nouns in WordNet: A Lexical Inheritance System](https://doi.org/10.1093/ijl/3.4.245), 1990, pp. 245–264, 특히 Princeton 묶음 PDF pp. 17–18.
- George A. Miller, [WORDNET: A Lexical Database for English](https://aclanthology.org/H93-1103/), 1993, p. 409.
- George A. Miller, [WordNet: A Lexical Database for English](https://aclanthology.org/H94-1111/), 1994, p. 468.
- Princeton University WordNet Project, [WordNet Version 1.5 Release Information](https://wordnetcode.princeton.edu/1.5/README.release), 1995, Release Information·What’s New·Semantic Concordance.
- George A. Miller, [WordNet: A Lexical Database for English](https://doi.org/10.1145/219717.219748), 《Communications of the ACM》 38(11), 1995, pp. 39–41.
- Christiane Fellbaum 편, [WordNet: An Electronic Lexical Database](https://mitpress.mit.edu/9780262561167/wordnet/), MIT Press, 1998, Foreword pp. xvii–xxiii 및 품사·응용별 장.
- Princeton University WordNet Project, [WordNet 3.0 Reference Manual](https://wordnet.princeton.edu/documentation), `wninput(5WN)`, `wngloss(7WN)`, `uniqbeg(7WN)`, `wnstats(7WN)`.
- Satanjeev Banerjee·Ted Pedersen, [An Adapted Lesk Algorithm for Word Sense Disambiguation Using WordNet](https://doi.org/10.1007/3-540-45715-1_11), 2002, pp. 136–145.
- Ellen M. Voorhees, [Query Expansion Using Lexical-Semantic Relations](https://doi.org/10.1007/978-1-4471-2099-5_7), 1994, pp. 61–69.
- Manaal Faruqui 외, [Retrofitting Word Vectors to Semantic Lexicons](https://aclanthology.org/N15-1184/), 2015, pp. 1606–1615.
- Collin F. Baker·Charles J. Fillmore·John B. Lowe, [The Berkeley FrameNet Project](https://aclanthology.org/P98-1013/), 1998, pp. 86–90.
- Martha Palmer·Daniel Gildea·Paul Kingsbury, [The Proposition Bank](https://aclanthology.org/J05-1004/), 2005, 특히 pp. 71–72.
- 프로젝트 번역·검토 출발 자료: [WordNet - A Semantic Network for Language Understanding](https://mbrenndoerfer.com/writing/history-wordnet-semantic-network)
- 프로젝트 보존 자료: `raw/025_WordNet - A Semantic Network for Language Understanding.ko.md`, `raw/025_WordNet - A Semantic Network for Language Understanding.commentary.ko.md`.

## 관련 항목

- [[concept.wordnet|WordNet]]
- [[entity.조지-밀러|조지 밀러]]
- [[concept.framenet|FrameNet]]
- [[concept.단어-의미-중의성-해소|단어 의미 중의성 해소]]
- [[concept.lesk-알고리즘|Lesk 알고리즘]]
- [[source.017|Lesk 알고리즘과 단어 의미 중의성 해소]]
- [[analysis.규칙-기반-ai에서-데이터-기반-학습으로|규칙 기반 AI에서 데이터 기반 학습으로]]
