---
schema_version: 2
id: source.038
page_type: source
title: PropBank와 의미역 표지
aliases:
  - 038_PropBank - Semantic Role Labeling and Proposition Bank
  - PropBank와 SRL
  - 명제 은행과 의미역 표지
tags:
  - type/source
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
    locator: 'pp. 71–106, 특히 pp. 71–78의 목표·역할 체계, pp. 81–88의 주석 절차, pp. 88–90의 FrameNet 비교, pp. 95–101의 SRL 실험'
    relation: supports
  - source_id: gildea-jurafsky-2002-srl
    locator: 'pp. 245–288, 특히 초록·§§1–5의 FrameNet 기반 선행 자동 의미역 표지와 pp. 284–285의 과제 경계'
    relation: contextualizes
  - source_id: carreras-marquez-2004-conll-srl
    locator: 'pp. 89–97, 특히 §§1–3의 PropBank 기반 부분 구문 SRL 과제와 평가'
    relation: supports
  - source_id: carreras-marquez-2005-conll-srl
    locator: 'pp. 152–164, 특히 §§1–3의 완전 구문·영역 밖 평가와 Penn Treebank·PropBank 자료 구성'
    relation: supports
related:
  - concept.propbank
  - concept.의미역-표지
  - source.023
  - concept.framenet
  - source.030
  - concept.말뭉치-기반-학습
---
# PropBank와 의미역 표지

038 raw는 PropBank를 2005년에 시작된 최초의 대규모 의미 주석 자원으로 소개하고, 번호형 논항을 보편 의미역처럼 설명하며 정보 추출·질의응답·기계 번역·AMR·신경 언어 모델까지 하나의 영향사로 연결한다. 이 공개 문서는 **2005년 대표 논문과 더 이른 프로젝트 단계**, **술어별 역할과 전역 역할의 차이**, **주석 자원과 자동 [[의미역 표지]] 과제**, **직접 확인된 후속 제도와 가능한 응용**을 분리한다.

[[PropBank]]의 핵심 성과는 문장 의미 전체를 완성한 것이 아니다. [[023_Penn Treebank와 통계적 구문 분석|Penn Treebank]] 구문 트리의 모든 동사 용례에 술어 감각과 논항 역할을 덧붙여, 구문 교체와 사건 참여자 구조를 대규모 감독 학습·통계 분석의 대상으로 만든 데 있다. 원 논문은 이 표현을 공지시·양화와 여러 고차 현상을 다루지 않는 **얕지만 넓은** 의미층이라고 규정했다.

## 프로젝트와 공개 연대

2005년은 PropBank의 시작이 아니라 대표 저널 논문의 출판 시점이다.

| 시기 | 확인되는 사건 | 구분할 점 |
| --- | --- | --- |
| 2001 | Palmer·Rosenzweig·Cotton이 Penn Treebank의 predicate-argument analysis를 발표했다. | 프로젝트의 선행 공개 기록이다. |
| 2002-06 | 금융 하위 말뭉치의 완전 주석 사전 판정판이 공개됐다. | 최종 판정판과 다르다. |
| 2004-03 | 완전 주석·판정 말뭉치가 완성됐다. | 2005년 논문보다 앞선 완료 시점이다. |
| 2005-03 | Palmer·Gildea·Kingsbury의 대표 논문이 출판됐다. | 설계·주석·통계·자동 표지 실험을 종합한 문헌이다. |

논문이 보고한 Wall Street Journal 자료에는 3,342개 동사 프레임과 4,500개가 조금 넘는 frameset이 있었다. 다의 동사의 roleset 선택에 대한 주석자 일치도는 94%였다. 이 수치는 당시 대상 말뭉치 안의 동사 용례와 프레임 파일에 관한 것이지 영어의 모든 술어나 현대 PropBank 전체 규모가 아니다.

## 역할집합과 번호형 논항

PropBank는 보편 의미역 목록을 먼저 정하지 않는다. 보편 집합을 정의하기 어렵다는 이유로 동사별 역할을 설정하고 번호를 0부터 붙였다.

- `Arg0`: 대체로 원형적 행위자(proto-agent)의 성질을 보인다.
- `Arg1`: 대체로 원형적 피행위자·주제(proto-patient/theme)의 성질을 보인다.
- `Arg2`–`Arg5`: 동사와 roleset마다 뜻이 달라진다.
- `ArgA`: 유발된 의지적 이동에서 행위를 일으킨 참여자에 제한적으로 사용됐다.
- `ArgM-*`: 시간·장소·방식·원인·방향·부정·양태처럼 여러 동사에 공통인 수식 역할이다.

`edge.01`에서 Arg2는 이동량, Arg3는 출발점, Arg4는 도착점, Arg5는 방향이다. 그러나 `accept.01`에서 Arg2는 받아들이는 출처이고 Arg3는 속성이다. 원 논문은 Arg2 이상의 번호에 동사 전체를 가로지르는 일관된 일반화를 할 수 없다고 명시한다. raw처럼 Arg2를 수령자·도구, Arg3를 출발점, Arg4를 도착점으로 고정하면 예시에서 우연히 나타난 패턴을 스키마 전체의 뜻으로 바꾸게 된다.

한 동사의 특정 의미에 대응하는 역할 묶음이 **roleset**이다. 논항 정의와 그 의미에서 허용되는 구문 실현을 묶은 것이 **frameset**, 한 동사의 frameset 모음이 **frames file**이다. `decline.01`의 점진적 감소와 `decline.02`의 거절처럼 논항 수와 의미가 충분히 다르면 다른 roleset으로 나눈다. 반면 능동·수동, 타동·자동 교체처럼 뜻을 유지하는 구문 차이는 같은 roleset 안에서 논항 일부가 다른 위치 또는 생략된 형태로 나타날 수 있다.

## Penn Treebank 위의 주석층

주석자는 기존 Penn Treebank 구문 분석을 고치지 않고 트리 노드에 역할을 붙였다. 번호형 논항이 전치사구라면 일관성을 위해 PP 전체를 표시했고, 흔적(trace)에 역할을 붙이면 공색인된 선행사도 연결했다. 통제 구문처럼 하나의 Penn Treebank 절 노드가 서로 다른 의미 참여자를 포함할 때는 하위 NP·VP에 별도 역할을 붙일 수 있었다. 하나의 역할이 여러 노드에 분산되는 것도 허용했다.

따라서 PropBank는 주어를 Arg0, 목적어를 Arg1로 기계적으로 치환한 자원이 아니다. 수동을 제외한 2005년 분석에서 Arg0의 96.9%가 주어였지만, 주어 중 Arg0는 79.0%였다. 구문 위치는 강한 예측 특징이지만 의미역 자체와 동일하지 않다.

## FrameNet과 무엇을 다르게 묶는가

[[FrameNet]]과 PropBank는 말뭉치에 의미역을 붙이고 구문 실현을 기록한다는 목표를 공유하지만 일반화 단위가 다르다.

| 질문 | FrameNet | PropBank |
| --- | --- | --- |
| 무엇을 먼저 정하는가 | 여러 LU가 공유하는 의미 frame과 frame element | 한 동사의 roleset과 번호형 논항 |
| 어떤 문장을 고르는가 | 프레임 요소의 다양한 실현을 보여 주는 용례를 주로 표집 | Penn Treebank의 복잡하고 예상 밖인 절도 포함해 모든 동사 용례를 주석 |
| 역할이 술어를 건너 유지되는가 | 같은 frame에서 `Buyer`, `Seller`, `Goods`를 유지 | buy와 sell의 문법적으로 높은 참여자가 각각 Arg0가 될 수 있음 |
| 구문 구조에 어떻게 연결하는가 | 텍스트 구간과 GF·PT를 별도 기록 | Penn Treebank 노드에 직접 역할을 부착 |
| 초기 품사 범위 | 동사·명사·형용사 등 | 2005년 논문 시점에는 동사 중심 |

FrameNet의 buy와 sell은 같은 거래 참여자를 같은 이름으로 유지하지만, PropBank의 `buy.01` Arg0는 구매자이고 `sell.01` Arg0는 판매자다. PropBank는 두 문장의 행위자성·구문 교체를 비교하기 쉽지만, 동일 상거래 사건에서 누가 상품과 돈을 주고받는지 통합하려면 추가 매핑이 필요하다. 그러므로 두 자원을 단순히 “FrameNet은 깊이, PropBank는 폭”으로만 대비하지 않는다.

## 자동 의미역 표지와 CoNLL

[[의미역 표지]]는 주석 자원 자체가 아니라 새 문장에서 술어의 논항 경계를 찾고 역할을 부여하는 예측 과제다. Gildea·Jurafsky의 2002년 연구는 약 5만 개 FrameNet 주석 문장으로 이미 자동 의미역 표지를 실험했다. PropBank가 SRL을 처음 발명했다기보다 Penn Treebank 기반의 넓은 감독 자료와 CoNLL 공유 과제를 통해 PropBank식 SRL을 대표 벤치마크로 정착시켰다고 설명하는 편이 정확하다.

CoNLL-2004는 PropBank 자료에서 술어를 주고 부분 구문 분석과 청크 정보를 이용해 역할을 예측하게 했다. CoNLL-2005는 완전 구문 분석을 포함한 입력 표현을 제공하고 Wall Street Journal 학습·시험과 Brown Corpus 영역 밖 시험을 함께 사용했다. 이 차이는 SRL 점수가 역할 분류기 하나뿐 아니라 논항 경계, 구문 분석 품질, 영역 이동에 의존함을 드러낸다.

## 응용과 후대 연결의 범위

술어-논항 구조는 정보 추출, 질의응답, 기계 번역에서 사건 참여자를 보존하는 중간 표현이 될 수 있다. 2005년 논문도 이 응용을 동기로 제시했다. 그러나 동기를 언급했다는 사실과 각 분야에서 성능 향상을 실증했다는 사실은 다르다. 실제 효과를 말하려면 해당 시스템·자료·평가의 1차 문헌이 더 필요하다.

OntoNotes는 PropBank식 술어·논항 주석을 다른 구문·의미·담화 층과 결합했고, NomBank는 명사 술어로 범위를 넓혔다. 영어 AMR은 많은 술어 감각과 핵심 역할에 PropBank frames를 사용하지만 문장 전체 그래프에는 공지시·개체명·양상·부정 등 추가 구조가 들어간다. AMR을 PropBank와 동일한 자원이나 단순 후속 버전으로 보지 않는다.

신경망이나 LLM 표현에서 PropBank 역할을 예측할 수 있다는 탐침 결과가 있더라도, 이는 모델이 명시적 roleset을 저장하거나 생성 과정에서 참여자 관계를 안정적으로 사용한다는 증거와 다르다. 정보의 복원 가능성과 인과적 사용을 분리해서 평가해야 한다.

## 범위와 한계

- 초기 PropBank는 Wall Street Journal과 영어 동사 술어에 강하게 묶였다.
- 번호형 논항은 여러 이론 사이의 실용적 공통 표기지만 사람이 읽을 때 frames file을 확인해야 한다.
- roleset 구분, 논항 경계, ArgM 유형에는 주석자의 판단이 개입한다.
- 명시되지 않은 사건 참여자, 공지시, 양화, 사실성, 담화 관계를 완전하게 표현하지 않는다.
- gold 구문 트리에 붙인 주석으로 학습해도 실제 입력에서는 자동 구문 분석 오류가 SRL로 전파된다.
- 다언어 PropBank는 공통 형식을 재사용하지만 언어별 구문·형태론·생략 현상에 맞는 프레임과 지침이 필요하다.

## 검증 정정

- **2005년에 프로젝트 출범**: 2001년 선행 발표와 2002년 사전 판정 공개가 있었고 완전 주석·판정 말뭉치는 2004년 3월 완료됐다. 2005년은 대표 논문 출판 시점이다.
- **최초의 대규모 의미 주석 자원**: FrameNet과 다른 선행 자원이 있었다. PropBank의 독자성은 주요 구문 트리뱅크의 모든 동사 용례에 얕은 술어-논항 층을 덧붙인 범위로 한정한다.
- **Arg2–Arg4의 보편 의미**: 원 논문은 Arg2 이상의 번호에 동사 전체를 가로지르는 일반화를 할 수 없다고 명시한다.
- **FrameNet은 제한된 어휘, PropBank는 광범위한 어휘**: coverage만이 아니라 의미 프레임 중심 표집과 전체 트리뱅크 절 주석, 역할 일반화 단위, 구문 트리 의존성이 다르다.
- **2005년에 1백만 단어 이상을 이미 의미 주석**: 원 논문의 확인 가능한 규모는 대상 WSJ의 동사 프레임·roleset과 완전 주석 완료 기록이다. 후대 릴리스 규모를 2005년 상태로 소급하지 않는다.
- **언어 독립적 역할 표현**: 번호 체계는 매핑에 편리하지만 초기 주석과 프레임은 영어 Penn Treebank에 기반한다.
- **신경 언어 모델이 의미역을 암묵적으로 학습**: 특정 모델·탐침·자료 없이 일반 사실이나 명시적 구조 사용으로 확정하지 않는다.

## 핵심 문장

- PropBank는 Penn Treebank 구문 나무 위에 동사별 roleset과 번호형 논항을 붙인 얕은 술어-논항 주석 자원이다.
- Arg0·Arg1에는 원형적 행위자·피행위자 경향이 있지만 Arg2 이상의 뜻은 roleset별 정의다.
- 2005년은 프로젝트 출범이 아니라 2002년 공개·2004년 완료 뒤 대표 논문이 출판된 시점이다.
- FrameNet은 공유 의미 프레임의 역할을, PropBank는 각 술어의 구문·논항 교체를 서로 다르게 일반화한다.
- PropBank 자원과 새 문장의 역할을 예측하는 의미역 표지 모델을 구분해야 한다.

## 출처

- Martha Palmer·Daniel Gildea·Paul Kingsbury, [The Proposition Bank: An Annotated Corpus of Semantic Roles](https://aclanthology.org/J05-1004/), 2005, pp. 71–106.
- Daniel Gildea·Daniel Jurafsky, [Automatic Labeling of Semantic Roles](https://aclanthology.org/J02-3001/), 2002, pp. 245–288.
- Xavier Carreras·Lluís Màrquez, [Introduction to the CoNLL-2004 Shared Task: Semantic Role Labeling](https://aclanthology.org/W04-2412/), 2004, pp. 89–97.
- Xavier Carreras·Lluís Màrquez, [Introduction to the CoNLL-2005 Shared Task: Semantic Role Labeling](https://aclanthology.org/W05-0620/), 2005, pp. 152–164.
- 프로젝트 번역·검토 출발 자료: [PropBank - Semantic Role Labeling and Proposition Bank](https://mbrenndoerfer.com/writing/history-propbank-semantic-role-labeling)
- 프로젝트 보존 자료: `raw/038_PropBank - Semantic Role Labeling and Proposition Bank.ko.md`, `raw/038_PropBank - Semantic Role Labeling and Proposition Bank.commentary.ko.md`.

## 관련 항목

- [[PropBank]]
- [[의미역 표지]]
- [[023_Penn Treebank와 통계적 구문 분석]]
- [[FrameNet]]
- [[030_FrameNet과 프레임 의미론]]
- [[말뭉치 기반 학습]]
