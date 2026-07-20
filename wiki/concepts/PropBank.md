---
schema_version: 2
id: concept.propbank
page_type: concept
title: PropBank
aliases:
  - Proposition Bank
  - 프롭뱅크
  - 명제 은행
tags:
  - type/concept
  - domain/nlp
  - domain/linguistics
  - domain/machine-learning
created: '2026-07-18'
updated: '2026-07-21'
lifecycle: active
verification: verified
artifacts:
  - 'raw/038_PropBank - Semantic Role Labeling and Proposition Bank.ko.md'
  - 'raw/038_PropBank - Semantic Role Labeling and Proposition Bank.commentary.ko.md'
evidence:
  - source_id: palmer-et-al-2005-propbank
    locator: 'pp. 71–106, 특히 §§1–4의 역할집합·Arg0–Arg5·ArgM·Penn Treebank 노드 주석과 §5의 FrameNet 비교'
    relation: supports
  - source_id: carreras-marquez-2004-conll-srl
    locator: 'pp. 89–97의 PropBank 기반 SRL 자료와 부분 구문 입력'
    relation: contextualizes
  - source_id: carreras-marquez-2005-conll-srl
    locator: 'pp. 152–164의 Penn Treebank·PropBank 학습·시험과 Brown 영역 밖 평가'
    relation: contextualizes
related:
  - source.038
  - concept.의미역-표지
  - source.023
  - concept.framenet
  - source.030
---
# PropBank

> [!note] 학습 안내
> **난이도:** 중급<br>
> **선수 지식:** [[023_Penn Treebank와 통계적 구문 분석]], [[FrameNet]]<br>
> **읽고 나면:** PropBank의 roleset·번호형 논항과 Penn Treebank 결합 방식을 설명하고 FrameNet 및 자동 SRL과 구분할 수 있다.

## 1단계 — 먼저 잡을 핵심

PropBank(Proposition Bank)는 [[023_Penn Treebank와 통계적 구문 분석|Penn Treebank]] 같은 구문 주석 말뭉치에 술어 감각과 논항 역할을 덧붙인 얕은 의미 주석 자원이다. 2005년 대표 논문은 대상 Penn Treebank의 모든 동사 용례를 주석해 구문 교체와 술어-논항 관계를 통계적으로 연구하고 [[의미역 표지]] 시스템을 학습하려는 실용적 목표를 제시했다.

## 2단계 — 작동 원리

### 역할 체계

한 술어의 특정 의미와 논항 정의 묶음이 **roleset**이다. roleset에는 `accept.01`, `decline.02`처럼 식별자가 붙고, 관련 구문 실현·예문과 함께 frameset을 이룬다. 한 동사의 frameset 모음이 frames file이다.

| 표지 | 일반적 해석 | 반드시 지킬 경계 |
| --- | --- | --- |
| `Arg0` | 대체로 proto-agent | 모든 술어에서 단순 Agent와 같지는 않다. |
| `Arg1` | 대체로 proto-patient 또는 Theme | 모든 술어에 반드시 있거나 같은 의미는 아니다. |
| `Arg2`–`Arg5` | 추가 핵심 논항 | 뜻은 roleset별로 확인한다. |
| `ArgA` | 유발된 의지적 이동의 외부 원인자 | 제한된 동사에 쓰인 특수 표지다. |
| `ArgM-*` | 시간·장소·방식·원인·방향·부정·양태 등 | 판본별 하위 표지 이름과 지침을 확인한다. |

`edge.01`에서 Arg3·Arg4가 출발점·도착점이라고 해서 다른 모든 동사에서도 같은 번호가 같은 뜻인 것은 아니다. 2005년 논문은 높은 번호의 논항에 동사 전체를 가로지르는 일관된 일반화를 할 수 없다고 명시한다.

### 구문 주석과의 결합

의미역은 기존 Penn Treebank 노드에 붙는다. 주석자는 트리를 고치지 않지만 하나의 역할을 여러 노드에 표시할 수 있고, 흔적과 공색인된 선행사를 연결하며, 통제 구문에서는 하나의 절 아래 NP와 VP를 서로 다른 역할로 나눌 수 있다. 이 설계는 gold 구문 구조를 활용하는 장점과 동시에 자동 구문 분석 오류에 의존하는 한계를 만든다.

구문 위치와 역할은 강하게 연관되지만 동일하지 않다. 2005년 논문의 수동 제외 통계에서 Arg0의 대부분은 주어였으나 모든 주어가 Arg0는 아니었다. 능동·수동·타동·자동 교체에서 같은 참여자의 구문 위치가 달라도 roleset 안의 역할을 유지하는 것이 이 주석층의 핵심 가치다.

### FrameNet과의 차이

[[FrameNet]]은 여러 어휘 단위를 공유 의미 프레임으로 묶고 `Buyer`, `Seller`, `Goods`처럼 프레임에 국소적인 이름을 쓴다. PropBank는 한 술어의 논항 구조를 번호로 정의한다. buy의 Arg0는 구매자이고 sell의 Arg0는 판매자이므로, 같은 거래 사건의 참여자를 술어를 건너 같은 번호로 유지하지 않는다.

두 자원은 깊이와 폭만 다른 것이 아니다. FrameNet은 프레임 요소의 다양한 실현을 보여 주는 용례를 표집했고, 초기 PropBank는 Penn Treebank의 모든 동사 용례를 복잡도와 관계없이 주석하려 했다. 공유 프레임 의미와 술어별 구문 교체 가운데 무엇을 우선해 일반화하는지가 다르다.

## 3단계 — 기술과 근거

### 확인된 연대와 규모

2005년 논문 출판을 프로젝트 시작으로 부르지 않는다. 논문은 2002년 6월 사전 판정 공개와 2004년 3월 완전 주석·판정 완료를 기록한다. 당시의 3,342개 동사 프레임과 4,500개가 조금 넘는 frameset도 현대 전체 자원의 규모로 소급하지 않는다.

## 검증과 한계

### 범위와 해석

PropBank는 문장 의미 전체가 아니다. 공지시, 양화, 사실성, 담화 관계 같은 현상을 포괄하지 않고, 초기 자원은 영어 Wall Street Journal과 동사 술어에 중심을 두었다. NomBank·OntoNotes·다언어 PropBank와 AMR의 PropBank frame 사용은 이 기반을 확장하거나 다른 주석층과 결합한 후속 작업이다.

## 학습 확인

### 확인 질문

1. PropBank의 roleset, frameset과 Arg0–Arg5·ArgM 표지는 어떤 단위로 정의되는가?
2. Penn Treebank 구문 노드와 trace에 역할을 붙이는 방식은 구문 교체를 어떻게 비교하게 하는가?
3. 높은 번호 논항의 의미, 2005년 규모와 PropBank의 의미 표현 범위를 일반화하면 안 되는 이유는 무엇인가?

### 다음 문서

- [[의미역 표지]] — 주석 자원에서 새 문장의 논항 경계와 역할을 예측하는 과제로 이동한다.

## 출처

- Martha Palmer·Daniel Gildea·Paul Kingsbury, [The Proposition Bank: An Annotated Corpus of Semantic Roles](https://aclanthology.org/J05-1004/), 2005, pp. 71–106.
- Xavier Carreras·Lluís Màrquez, [Introduction to the CoNLL-2004 Shared Task: Semantic Role Labeling](https://aclanthology.org/W04-2412/), 2004, pp. 89–97.
- Xavier Carreras·Lluís Màrquez, [Introduction to the CoNLL-2005 Shared Task: Semantic Role Labeling](https://aclanthology.org/W05-0620/), 2005, pp. 152–164.
- [[038_PropBank와 의미역 표지]]
- 프로젝트 보존 자료: `raw/038_PropBank - Semantic Role Labeling and Proposition Bank.ko.md`, `raw/038_PropBank - Semantic Role Labeling and Proposition Bank.commentary.ko.md`.

## 관련 항목

- [[038_PropBank와 의미역 표지]]
- [[의미역 표지]]
- [[023_Penn Treebank와 통계적 구문 분석]]
- [[FrameNet]]
- [[030_FrameNet과 프레임 의미론]]
