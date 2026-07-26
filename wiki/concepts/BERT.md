---
schema_version: 3
id: concept.bert
page_type: concept
title: BERT
aliases:
  - Bidirectional Encoder Representations from Transformers
  - 버트
tags:
  - type/concept
  - domain/ai
  - domain/nlp
  - domain/machine-learning
created: '2026-07-20'
updated: '2026-07-21'
editorial_status: active
review:
  evidence_coverage: verified
  content_mode: descriptive
artifacts:
  - raw/058_BERT Bidirectional Pretraining Revolutionizes Language Understanding.ko.md
  - raw/058_BERT Bidirectional Pretraining Revolutionizes Language Understanding.commentary.ko.md
  - raw/065_BERT for Information Retrieval Transformer-Based Ranking and Semantic Search.ko.md
  - raw/065_BERT for Information Retrieval Transformer-Based Ranking and Semantic Search.commentary.ko.md
evidence:
  - source_id: bert-2019
    locator: '§§1–3의 encoder·MLM·NSP·fine-tuning, §4와 Tables 1–5의 GLUE·SQuAD·SWAG·ablation, Appendix A의 학습 절차'
    relation: supports
  - source_id: liu-et-al-2019-roberta
    locator: §§1–4의 BERT 학습 조건 재평가와 NSP 제거·동적 masking·자료·batch·학습량 비교
    relation: contextualizes
  - source_id: nogueira-cho-2019-bert-reranking
    locator: '§2와 Eq. 1의 query–passage 결합 입력·[CLS] 이진 분류·pointwise cross-entropy·BM25 상위 1,000개 재순위화, §3과 Table 1의 MS MARCO·TREC-CAR 평가'
    relation: supplements
relations:
  - target: source.058
    kind: related
  - target: source.065
    kind: related
  - target: concept.마스크드-언어-모델링
    kind: related
  - target: concept.언어-모델-전이-학습
    kind: related
  - target: concept.교차-인코더-재순위화
    kind: related
learning:
  difficulty:
    entry: intermediate
    target: intermediate
  prerequisites:
    - target: concept.transformer
  assumed_knowledge: 없음
  outcomes:
    - BERT가 masked-token 사전 학습과 전체 encoder 미세조정을 연결하는 방식과 표준 생성 모델과의 차이를 설명할 수 있다.
  next:
    - target: concept.glue-superglue
      reason: GLUE와 SuperGLUE — BERT의 전이 성능이 집계 평가에서 어떻게 비교됐는지 살핀다.
    - target: concept.추출형-질의응답
      reason: 추출형 질의응답 — BERT가 span 시작·끝 점수로 적응한 대표 출력 형식을 자세히 본다.
---
# BERT

> [!note] 학습 안내
> **난이도:** 중급<br>
> **선수 지식:** [[concept.transformer|Transformer]]<br>
> **읽고 나면:** BERT가 masked-token 사전 학습과 전체 encoder 미세조정을 연결하는 방식과 표준 생성 모델과의 차이를 설명할 수 있다.

## 1단계 — 먼저 잡을 핵심

[[BERT]](Bidirectional Encoder Representations from Transformers)는 causal mask가 없는 [[Transformer]] encoder를 [[마스크드 언어 모델링]]과 NSP로 사전 학습하고, 후속 과제에서 작은 출력층을 추가해 전체 모델을 미세조정하는 언어 표현 모델이다.

## 2단계 — 작동 원리

### 입력 복원에서 과제 출력까지

BERT는 문장이나 문장쌍의 일부 token을 교란하고 좌우 문맥으로 원 token을 복원하도록 encoder를 학습한다. 후속 과제에서는 sequence·token·span·후보 점수에 맞는 출력층을 붙인다. 과제 손실은 새 출력층뿐 아니라 기반 BERT의 매개변수도 함께 갱신한다.

## 3단계 — 기술과 근거

### 구조

BERT는 Transformer 원 논문의 encoder stack을 사용한다. 입력 각 위치는 같은 층에서 좌우 token 모두에 attention할 수 있다. token·segment·position embedding을 더하고, 문장·문장쌍 앞에 `[CLS]`, 경계에 `[SEP]`를 둔다.

| 모델 | 층 | hidden size | attention heads | 매개변수 |
|---|---:|---:|---:|---:|
| BERT-base | 12 | 768 | 12 | 약 110M |
| BERT-large | 24 | 1024 | 16 | 약 340M |

최대 입력 길이는 512 WordPiece token이었다. BERT가 순환 계산을 제거했어도 self-attention의 sequence 길이 제곱 비용은 남는다.

### 사전 학습 목표

MLM은 선택 token을 좌우 문맥에서 복원한다. NSP는 두 text span이 원문에서 이어지는지 분류한다. 전체 손실은 두 평균 log-likelihood 손실의 합이다.

사전 학습 자료는 BooksCorpus 약 8억 단어와 영어 Wikipedia 약 25억 단어였다. BERT-base와 large는 각각 16·64 TPU chip에서 논문 보고 기준 4일 동안 훈련됐다. 이 계산량은 현재 모델과의 절대 비교보다 당시 재현 비용을 보여 주는 역사적 수치다.

### 후속 과제 적응

BERT는 과제 전용 깊은 구조 대신 출력 인터페이스를 바꿨다.

- sequence 분류·회귀: `[CLS]` 표현
- token labeling: 각 token 표현
- 추출형 질의응답: 시작·끝 token 점수
- 선택형 문장쌍: 후보별 `[CLS]` 점수

각 경우 기반 BERT도 함께 갱신한다. 이를 ELMo식 고정 특징 사용과 구분한다.

### 질의–passage 점수화

[[065_BERT 기반 passage 재순위화]]에서 확인되는 BERT의 검색 적용은 질의와 후보 passage를 `[CLS] query [SEP] passage [SEP]`로 묶는다. 결합 시퀀스가 같은 encoder의 양방향 self-attention을 통과하므로 질의 token과 passage token은 층마다 서로 조건화된다. 이를 검색 문헌에서 교차 상호작용이라고 부를 수 있지만, Transformer encoder–decoder 사이의 별도 cross-attention 층과는 구분해야 한다.

최종 관련성 점수는 attention weight를 직접 읽은 값이 아니다. 마지막 `[CLS]` 은닉 표현에 학습된 분류층을 적용해 관련성 logit과 확률을 만들고, 후보별 확률로 순서를 다시 매긴다. 이 [[교차 인코더 재순위화]]는 token 수준 공동 상호작용을 직접 모델링할 수 있지만 질의마다 각 후보 쌍을 다시 인코딩해야 하므로, 문서 표현을 한 번 계산해 전체 질의에 재사용하는 dual encoder보다 후보별 계산이 비싸다. Nogueira와 Cho의 실험이 BERT를 전체 컬렉션의 첫 단계 검색기가 아니라 BM25 상위 1,000개 후보의 재순위화에 사용한 이유도 이 비용 경계에 있다.

### ‘양방향’의 정확한 뜻

BERT의 한 위치 표현은 모든 encoder 층에서 왼쪽과 오른쪽 입력에 공동 조건화된다. ELMo는 독립 순·역방향 LSTM의 표현을 연결한다. GPT형 decoder는 위치 $i$가 보통 $i$보다 앞선 token에만 접근한다. 셋 모두 문맥 표현을 만들지만 attention graph와 학습 목적이 다르다.

양방향 조건화는 사람과 같은 이해의 정의가 아니다. BERT가 벤치마크 관계를 높은 정확도로 예측한다는 것과 논리·사실·의도를 일반적으로 이해한다는 것은 별도 주장이다.

### NSP의 후속 평가

BERT 원 ablation은 NSP가 일부 문장쌍·질의응답 결과에 도움을 준다고 보고했다. RoBERTa는 NSP를 제거하고 더 많은 자료와 긴 학습, 큰 batch, 동적 masking을 사용해 더 강한 결과를 냈다. 후대 모델 다수가 NSP를 쓰지 않지만, 그 사실을 BERT 성과가 MLM 하나에서만 왔다는 완전한 인과 분해로 읽지 않는다.

## 검증과 한계

### 한계

- 표준 BERT는 causal text generator가 아니다.
- 512 token보다 긴 문서는 자르기·계층화 등 별도 처리가 필요하다.
- 사전 학습과 미세조정의 계산·메모리 비용이 크다.
- 영어 중심 자료의 편향과 영역 coverage가 전이된다.
- fine-tuning은 작은 자료와 random seed에서 불안정할 수 있다.
- GLUE·SQuAD 점수는 일반 추론·사실성·공정성을 보장하지 않는다.

## 학습 확인

### 확인 질문

1. BERT는 어떤 Transformer 부분과 사전 학습 목표를 결합한 모델인가?
2. masked-token 복원에서 후속 과제 전체 미세조정까지 어떤 흐름으로 이어지는가?
3. BERT의 양방향 조건화와 높은 benchmark 점수가 범용 text 생성이나 일반 이해를 자동 보장하지 않는 이유는 무엇인가?

### 다음 문서

- [[concept.glue-superglue|GLUE와 SuperGLUE]] — BERT의 전이 성능이 집계 평가에서 어떻게 비교됐는지 살핀다.
- [[concept.추출형-질의응답|추출형 질의응답]] — BERT가 span 시작·끝 점수로 적응한 대표 출력 형식을 자세히 본다.

## 출처

- [[058_BERT의 마스크드 양방향 사전 학습]]
- [[065_BERT 기반 passage 재순위화]]
- Jacob Devlin 외, [BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding](https://aclanthology.org/N19-1423/), NAACL 2019.
- Yinhan Liu 외, [RoBERTa: A Robustly Optimized BERT Pretraining Approach](https://arxiv.org/abs/1907.11692), 2019.
- Rodrigo Nogueira·Kyunghyun Cho, [Passage Re-ranking with BERT](https://arxiv.org/abs/1901.04085), 2019.

## 관련 항목

- [[concept.glue-superglue|GLUE와 SuperGLUE]]
- [[concept.추출형-질의응답|추출형 질의응답]]
- [[concept.transformer|Transformer]]
- [[source.058|BERT의 마스크드 양방향 사전 학습]]
- [[source.065|BERT 기반 passage 재순위화]]
- [[concept.마스크드-언어-모델링|마스크드 언어 모델링]]
- [[concept.언어-모델-전이-학습|언어 모델 전이 학습]]
- [[concept.교차-인코더-재순위화|교차 인코더 재순위화]]
