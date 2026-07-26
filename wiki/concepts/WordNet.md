---
schema_version: 3
id: concept.wordnet
page_type: concept
title: WordNet
aliases:
  - 워드넷
  - Princeton WordNet
  - English WordNet
  - 어휘 의미망
tags:
  - type/concept
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
    locator: 'p. 409, WordNet 1.3 공개와 당시 구성'
    relation: contextualizes
  - source_id: miller-1994-wordnet-project
    locator: 'p. 468, WordNet 1.4 배포와 당시 규모'
    relation: contextualizes
  - source_id: fellbaum-1998-wordnet
    locator: Foreword pp. xvii–xxiii와 품사·응용별 장; WordNet 1.6
    relation: contextualizes
  - source_id: princeton-wordnet-3-0-reference
    locator: 'wninput(5WN) §§Description, Pointers; wngloss(7WN) §Database Organization; uniqbeg(7WN) §Description; wnstats(7WN) §§Number of words, synsets, and senses, Notes'
    relation: supports
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
  - target: source.025
    kind: related
  - target: concept.framenet
    kind: related
  - target: entity.조지-밀러
    kind: related
  - target: source.017
    kind: related
learning:
  difficulty:
    entry: introductory
    target: introductory
  prerequisites: []
  assumed_knowledge: 없음
  outcomes:
    - 'WordNet의 word form·sense·synset과 어휘·의미 관계를 구분하고, 품사별 구조와 자원의 한계를 설명할 수 있다.'
  next:
    - target: concept.단어-의미-중의성-해소
      reason: 다음에는 단어 의미 중의성 해소에서 한 단어 형태의 여러 synset 가운데 문맥에 맞는 의미를 고르는 문제를 살핀다.
    - target: concept.lesk-알고리즘
      reason: WordNet의 관계를 실제 중의성 해소에 쓰는 절차는 Lesk 알고리즘에서 이어 본다.
---
# WordNet

> [!note] 학습 안내
> **난이도:** 입문<br>
> **선수 지식:** 없음<br>
> **읽고 나면:** WordNet의 word form·sense·synset과 어휘·의미 관계를 구분하고, 품사별 구조와 자원의 한계를 설명할 수 있다.

## 1단계 — 먼저 잡을 핵심

### 핵심 정의

WordNet은 영어 명사·동사·형용사·부사의 word form을 **synset**이라는 어휘화된 의미 단위로 묶고, word form과 synset 사이의 관계를 명시적 포인터로 기록한 전자 어휘 데이터베이스다. Princeton에서 [[조지 밀러]]와 여러 언어학자·심리학자·lexicographer가 1985년부터 구축했으며, 1990년 논문군과 여러 공개 버전을 거쳐 발전했다.

## 2단계 — 작동 원리

### word form, sense, synset

WordNet은 철자로 관찰되는 **word form**과 그 form이 특정 품사·문맥에서 나타내는 **word meaning**을 구분한다. word meaning은 하나 이상의 대략적 동의어로 이루어진 synset으로 표현된다. synset 구성원은 모든 문장에서 완전히 같은 말이 아니라 적어도 어떤 문맥에서 서로 바꾸어 쓸 수 있는 단어나 연어다.

같은 word form이 여러 synset에 속하면 여러 sense를 가진다. 반대로 여러 word form이 한 synset에 속하면 하나의 lexicalized concept를 함께 표현한다. synset은 정의와 선택적 예문으로 이루어진 글로스를 공유하며, 관계가 기록된 경우 다른 word form 또는 synset으로 향하는 포인터를 가진다. 이 구조는 사전의 번호 매긴 뜻을 계산 가능한 식별자와 관계로 바꾸지만, synset 경계가 언어의 유일하고 영원한 의미 분할이라는 뜻은 아니다.

### 어휘 관계와 의미 관계

WordNet 3.0의 source format은 관계를 다음 두 층으로 나눈다.

| 종류 | 연결 대상 | 대표 예 | 의미 |
| --- | --- | --- | --- |
| lexical relation | 특정 word form ↔ 특정 word form | antonymy, pertainym, participle, derivationally related form | 포인터가 가리킨 개별 단어 형태 사이의 관계다. |
| semantic relation | synset ↔ synset | hypernymy·hyponymy, instance, meronymy·holonymy, verb entailment·cause | source와 target synset이 나타내는 의미 사이의 관계다. |

특히 antonymy는 일반적으로 lexical relation이다. 한 synset의 어느 단어가 다른 synset의 특정 단어와 반의 관계라고 해서 두 synset의 모든 단어 쌍이 반의어가 되지는 않는다. 또한 `hot`의 부정이 자동으로 `cold`가 되는 것도 아니다. 반의 포인터는 어휘적 대립을 나타낼 뿐 중간값을 없애는 논리 부정이 아니다.

synonymy도 절대적인 표현 동등성이 아니다. 같은 synset 안의 단어는 register, 시대, 지역, 빈도가 다를 수 있다. 따라서 검색 확장이나 생성에서 synset 구성원을 문맥 없이 기계적으로 치환하면 부자연스럽거나 의미가 달라질 수 있다.

### 품사별 구조

네 품사는 하나의 공통 taxonomy에 모두 들어가지 않고 품사별 subnet과 관계 집합을 가진다.

| 품사 | 조직 원리 | 주요 관계 |
| --- | --- | --- |
| 명사 | synset의 상위어·하위어 hierarchy | instance, member·substance·part meronymy/holonymy |
| 동사 | 상위·하위 관계와 action의 더 구체적인 manner | troponymy, entailment, cause, verb group |
| 형용사 | antonymous head synset을 중심으로 한 cluster와 satellite synset | antonymy, similar-to, attribute, pertainym, participle |
| 부사 | 독립 synset과 파생 관계 | 대개 derived-from-adjective, antonymy, domain |

부사가 실제 문장에서 동사를 수식한다는 사실과 WordNet에 저장되는 포인터는 다르다. WordNet 3.0에서 부사 synset은 보통 자신이 파생된 **형용사**를 가리킨다. 형용사도 모두 반의어 바퀴 구조를 따르지 않는다. relational adjective인 pertainym과 participial adjective에는 별도 연결이 있다.

명사와 동사는 hypernymy·hyponymy hierarchy를 갖지만 동일한 존재론은 아니다. 동사의 troponymy는 어떤 행동을 더 특정한 방식으로 수행하는 관계를 표현한다. 품사 사이의 연결은 파생 관계 등에 한정되며, 네 subnet이 모든 항목에서 촘촘하게 교차 연결된다고 가정하지 않는다.

## 3단계 — 기술과 근거

### 버전이 있는 편집 자원

WordNet은 한 번 완성된 고정 hierarchy가 아니다. 1990년 명사 논문은 당시 25개의 noun `unique beginner`가 여러 hierarchy를 이끈다고 설명했다. WordNet 3.0에서는 모든 noun synset이 하나의 `entity` unique beginner 아래 조직된다. 초기 논문의 구조와 후대 문서의 구조가 다르므로, 역사적 설명에서 버전을 생략하면 모순처럼 보이는 진술을 합치게 된다.

공개 이력에서도 1995년을 단일 탄생일로 삼지 않는다. 프로젝트는 1985년에 시작됐고, 1992년 12월 9일에는 1.3이, 1993년 8월에는 1.4가 배포됐다. 1995년 봄에는 1.5가 배포되고 Miller의 CACM 소개 논문이 나왔으며, 1998년 단행본은 당시 최신인 1.6을 다뤘다. 논문 출판, release announcement와 플랫폼 패키지 날짜를 서로 다른 사건으로 기록한다.

### WordNet 3.0 통계

| 품사 | 품사 안 고유 문자열 | synset | word-sense pair |
| --- | ---: | ---: | ---: |
| 명사 | 117,798 | 82,115 | 146,312 |
| 동사 | 11,529 | 13,767 | 25,047 |
| 형용사 | 21,479 | 18,156 | 30,002 |
| 부사 | 4,481 | 3,621 | 5,580 |
| 합계 | 155,287 | 117,659 | 206,941 |

문자열 합계 `155,287`은 품사별 고유 문자열을 더한 값이라 품사를 넘는 중복을 포함한다. 전체에서 중복을 제거한 문자열은 `147,278`개다. synset 수와 word-sense pair 수도 서로 다른 지표다. 통계나 sense key를 사용할 때 버전을 함께 기록해야 한다.

### 계산 자원으로서의 쓰임

WordNet은 relation traversal, taxonomy path, gloss와 sense inventory가 필요한 연구에 쓰인다. 대표적인 용도는 다음과 같다.

- [[단어 의미 중의성 해소]]에서 후보 sense와 정답 inventory를 정의한다.
- synset path나 information content를 이용해 의미 유사도·관련도를 계산한다.
- 정보 검색에서 동의어·상위어를 이용한 질의 확장 후보를 제공한다.
- lexical chain, selectional preference와 어휘 의미 분석에 명시적 관계를 제공한다.

[[Lesk 알고리즘]]의 1986년 원형은 WordNet 이전의 일반 기계 판독형 사전을 썼다. 2002년 Adapted Lesk가 WordNet 관계를 따라 관련 synset의 글로스를 포함했다. WordNet이 WSD 자원으로 중요하다는 사실과 Lesk가 처음부터 WordNet 알고리즘이었다는 주장은 다르다.

## 검증과 한계

### 나타내는 것과 나타내지 않는 것

WordNet의 핵심 대상은 **lexicalized concept와 lexical semantics**다. 일반 knowledge graph처럼 특정 인물·장소·사건에 관한 사실을 포괄적으로 기술하지 않으며, 자유로운 구와 문장의 compositional meaning도 synset 조합만으로 자동 계산하지 않는다. 고유명사·신조어·전문어·closed-class word와 언어별 coverage에도 공백이 있다.

수작업 분석은 사람이 relation의 종류와 경로를 읽고 검사할 수 있게 하지만, 언어 변화에 자동으로 맞춰지지는 않는다. sense granularity가 응용과 맞지 않을 수 있고, 그래프의 이산 경로는 corpus에서 관측한 연속 유사도나 실제 사용 빈도와 같지 않다. sense 번호와 나열 순서도 보편적인 빈도 법칙으로 해석하면 안 된다.

### 인간 기억·임베딩·지식 그래프와의 관계

WordNet 설계는 인간 lexical memory에 관한 심리언어학 이론에서 영감을 받았다. 이는 관계 기반으로 어휘를 조직하려는 이론적 동기이지, 인간이 WordNet과 같은 synset·포인터 구조를 실제로 저장한다는 실증 결론이 아니다.

WordNet의 명시적 이산 graph와 neural network의 distributed representation도 다른 표상이다. word embedding은 corpus에서 연속 vector를 학습한다. WordNet 관계를 embedding의 후처리나 학습 제약에 이용할 수 있지만, 관계를 활용했다는 사실만으로 Word2Vec·BERT·LLM이 WordNet에서 직접 발전했다고 볼 수 없다.

[[FrameNet]], PropBank, 일반 knowledge graph 역시 구조화된 언어·지식 자원이라는 넓은 공통점은 있으나 표현 단위와 이론적 목적이 다르다. 실제 통합·링크가 확인되는 경우와 역사적 직접 계보를 구분해야 한다.

## 학습 확인

1. WordNet에서 word form, sense, synset은 각각 무엇이며 어떤 단위로 구분되는가?
2. 어휘 관계와 의미 관계는 무엇을 연결하고 명사·동사·형용사·부사의 구조를 어떻게 다르게 만드는가?
3. WordNet을 인간 기억의 완전한 모형이나 임베딩·지식 그래프와 같은 표현으로 볼 수 없는 이유는 무엇인가?

다음에는 [[단어 의미 중의성 해소]]에서 한 단어 형태의 여러 synset 가운데 문맥에 맞는 의미를 고르는 문제를 살핀다. WordNet의 관계를 실제 중의성 해소에 쓰는 절차는 [[Lesk 알고리즘]]에서 이어 본다.

### 다음 문서

- [[concept.단어-의미-중의성-해소|단어 의미 중의성 해소]] — 다음에는 단어 의미 중의성 해소에서 한 단어 형태의 여러 synset 가운데 문맥에 맞는 의미를 고르는 문제를 살핀다.
- [[concept.lesk-알고리즘|Lesk 알고리즘]] — WordNet의 관계를 실제 중의성 해소에 쓰는 절차는 Lesk 알고리즘에서 이어 본다.

## 출처
- [[025_WordNet과 어휘 의미망]]
- George A. Miller·Richard Beckwith·Christiane Fellbaum·Derek Gross·Katherine J. Miller, [Introduction to WordNet: An On-line Lexical Database](https://doi.org/10.1093/ijl/3.4.235), 1990, pp. 235–244; Princeton 공식 묶음 PDF의 Introduction pp. 2–9.
- George A. Miller, [Nouns in WordNet: A Lexical Inheritance System](https://doi.org/10.1093/ijl/3.4.245), 1990, pp. 245–264, 특히 Princeton 묶음 PDF pp. 17–18.
- George A. Miller, [WORDNET: A Lexical Database for English](https://aclanthology.org/H93-1103/), 1993, p. 409.
- George A. Miller, [WordNet: A Lexical Database for English](https://aclanthology.org/H94-1111/), 1994, p. 468.
- Christiane Fellbaum 편, [WordNet: An Electronic Lexical Database](https://mitpress.mit.edu/9780262561167/wordnet/), MIT Press, 1998, Foreword pp. xvii–xxiii 및 품사·응용별 장.
- Princeton University WordNet Project, [WordNet 3.0 Reference Manual](https://wordnet.princeton.edu/documentation), `wninput(5WN)`, `wngloss(7WN)`, `uniqbeg(7WN)`, `wnstats(7WN)`.
- Manaal Faruqui 외, [Retrofitting Word Vectors to Semantic Lexicons](https://aclanthology.org/N15-1184/), 2015, pp. 1606–1615.
- Collin F. Baker·Charles J. Fillmore·John B. Lowe, [The Berkeley FrameNet Project](https://aclanthology.org/P98-1013/), 1998, pp. 86–90.
- Martha Palmer·Daniel Gildea·Paul Kingsbury, [The Proposition Bank](https://aclanthology.org/J05-1004/), 2005, 특히 pp. 71–72.

## 관련 항목

- [[concept.단어-의미-중의성-해소|단어 의미 중의성 해소]]
- [[concept.lesk-알고리즘|Lesk 알고리즘]]
- [[source.025|WordNet과 어휘 의미망]]
- [[concept.framenet|FrameNet]]
- [[entity.조지-밀러|조지 밀러]]
- [[source.017|Lesk 알고리즘과 단어 의미 중의성 해소]]
