---
schema_version: 2
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
updated: '2026-07-20'
lifecycle: active
verification: verified
artifacts:
  - 'raw/058_BERT Bidirectional Pretraining Revolutionizes Language Understanding.ko.md'
  - 'raw/058_BERT Bidirectional Pretraining Revolutionizes Language Understanding.commentary.ko.md'
evidence:
  - source_id: devlin-et-al-2019-bert
    locator: '§§1–3의 encoder·MLM·NSP·fine-tuning, §4와 Tables 1–5의 GLUE·SQuAD·SWAG·ablation, Appendix A의 학습 절차'
    relation: supports
  - source_id: liu-et-al-2019-roberta
    locator: '§§1–4의 BERT 학습 조건 재평가와 NSP 제거·동적 masking·자료·batch·학습량 비교'
    relation: contextualizes
related:
  - source.058
  - concept.마스크드-언어-모델링
  - concept.언어-모델-전이-학습
  - concept.transformer
---
# BERT

[[BERT]](Bidirectional Encoder Representations from Transformers)는 causal mask가 없는 [[Transformer]] encoder를 [[마스크드 언어 모델링]]과 NSP로 사전 학습하고, 후속 과제에서 작은 출력층을 추가해 전체 모델을 미세조정하는 언어 표현 모델이다.

## 구조

BERT는 Transformer 원 논문의 encoder stack을 사용한다. 입력 각 위치는 같은 층에서 좌우 token 모두에 attention할 수 있다. token·segment·position embedding을 더하고, 문장·문장쌍 앞에 `[CLS]`, 경계에 `[SEP]`를 둔다.

| 모델 | 층 | hidden size | attention heads | 매개변수 |
|---|---:|---:|---:|---:|
| BERT-base | 12 | 768 | 12 | 약 110M |
| BERT-large | 24 | 1024 | 16 | 약 340M |

최대 입력은 512 WordPiece token이었다. BERT가 순환 계산을 제거했어도 self-attention의 sequence 길이 제곱 비용은 남는다.

## 사전 학습 목표

MLM은 선택 token을 좌우 문맥에서 복원한다. NSP는 두 text span이 원문에서 이어지는지 분류한다. 전체 손실은 두 평균 log-likelihood 손실의 합이다.

사전 학습 자료는 BooksCorpus 약 8억 단어와 영어 Wikipedia 약 25억 단어였다. BERT-base와 large는 각각 16·64 TPU chip에서 논문 보고 기준 4일 동안 훈련됐다. 이 계산량은 현재 모델과의 절대 비교보다 당시 재현 비용을 보여 주는 역사적 수치다.

## 후속 과제 적응

BERT는 과제 전용 깊은 구조 대신 출력 인터페이스를 바꿨다.

- sequence 분류·회귀: `[CLS]` 표현
- token labeling: 각 token 표현
- 추출형 질의응답: 시작·끝 token 점수
- 선택형 문장쌍: 후보별 `[CLS]` 점수

각 경우 기반 BERT도 함께 갱신한다. 이를 ELMo식 고정 특징 사용과 구분한다.

## ‘양방향’의 정확한 뜻

BERT의 한 위치 표현은 모든 encoder 층에서 왼쪽과 오른쪽 입력에 공동 조건화된다. ELMo는 독립 순·역방향 LSTM의 표현을 연결한다. GPT형 decoder는 위치 $i$가 보통 $i$보다 앞선 token에만 접근한다. 셋 모두 문맥 표현을 만들지만 attention graph와 학습 목적이 다르다.

양방향 조건화는 사람과 같은 이해의 정의가 아니다. BERT가 벤치마크 관계를 높은 정확도로 예측한다는 것과 논리·사실·의도를 일반적으로 이해한다는 것은 별도 주장이다.

## NSP의 후속 평가

BERT 원 ablation은 NSP가 일부 문장쌍·질의응답 결과에 도움을 준다고 보고했다. RoBERTa는 NSP를 제거하고 더 많은 자료와 긴 학습, 큰 batch, 동적 masking을 사용해 더 강한 결과를 냈다. 후대 모델 다수가 NSP를 쓰지 않지만, 그 사실을 BERT 성과가 MLM 하나에서만 왔다는 완전한 인과 분해로 읽지 않는다.

## 한계

- 표준 BERT는 causal text generator가 아니다.
- 512 token보다 긴 문서는 자르기·계층화 등 별도 처리가 필요하다.
- 사전 학습과 미세조정의 계산·메모리 비용이 크다.
- 영어 중심 자료의 편향과 영역 coverage가 전이된다.
- fine-tuning은 작은 자료와 random seed에서 불안정할 수 있다.
- GLUE·SQuAD 점수는 일반 추론·사실성·공정성을 보장하지 않는다.

## 출처

- [[058_BERT의 마스크드 양방향 사전 학습]]
- Jacob Devlin 외, [BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding](https://aclanthology.org/N19-1423/), NAACL 2019.
- Yinhan Liu 외, [RoBERTa: A Robustly Optimized BERT Pretraining Approach](https://arxiv.org/abs/1907.11692), 2019.

## 관련 항목

- [[058_BERT의 마스크드 양방향 사전 학습]]
- [[마스크드 언어 모델링]]
- [[언어 모델 전이 학습]]
- [[Transformer]]
