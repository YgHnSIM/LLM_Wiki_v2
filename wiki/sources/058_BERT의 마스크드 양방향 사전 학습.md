---
schema_version: 2
id: source.058
page_type: source
title: BERT의 마스크드 양방향 사전 학습
aliases:
  - 057_BERT Bidirectional Pretraining Revolutionizes Language Understanding
  - BERT Pre-training of Deep Bidirectional Transformers
tags:
  - type/source
  - domain/ai
  - domain/nlp
  - domain/machine-learning
created: '2026-07-20'
updated: '2026-07-21'
lifecycle: active
verification: verified
artifacts:
  - 'raw/057_BERT Bidirectional Pretraining Revolutionizes Language Understanding.ko.md'
  - 'raw/057_BERT Bidirectional Pretraining Revolutionizes Language Understanding.commentary.ko.md'
evidence:
  - source_id: bert-2019
    locator: '초록과 §§1–3의 feature/fine-tuning 대비·MLM·NSP·입력 표현, §4와 Tables 1–5의 열한 과제·ablation, Appendix A의 15%·80/10/10 masking'
    relation: supports
  - source_id: liu-et-al-2019-roberta
    locator: '초록과 §§1–4의 BERT replication·더 긴 학습·큰 batch·추가 자료·동적 masking·NSP 제거 비교'
    relation: contextualizes
related:
  - concept.bert
  - concept.마스크드-언어-모델링
  - concept.언어-모델-전이-학습
  - concept.transformer
  - source.057
---
# BERT의 마스크드 양방향 사전 학습

> [!note] 학습 안내
> **난이도:** 중급<br>
> **선수 지식:** [[Transformer]], [[언어 모델 전이 학습]]<br>
> **읽고 나면:** BERT의 양방향성이 MLM과 encoder attention에서 어떻게 만들어지며 후속 과제에 어떤 방식으로 전이되는지 설명할 수 있다.

## 1단계 — 먼저 잡을 핵심

057 raw는 BERT가 양방향 사전 학습으로 언어 이해를 혁명적으로 바꿨다고 설명한다. 핵심 방향은 맞지만 ‘양방향’을 사람과 같은 이해로 넓히고, ELMo·GPT와의 구조 차이, MLM의 실제 예측 단위, NSP 후속 평가, 원 논문의 벤치마크 범위와 현대 생성 모델 계보를 압축한다. 공개 문서는 [[BERT]]의 구조·목적함수·전이 인터페이스를 1차 논문 범위에서 복원한다.

### 핵심 문장

- BERT의 양방향성은 causal mask가 없는 Transformer encoder와 masked-token 복원 목적의 결합에서 나온다.
- MLM은 token 15%를 선택하고 80/10/10 방식으로 교란해 원 token을 예측한다.
- BERT는 작은 출력층을 추가하되 기반 encoder 전체를 과제 손실로 미세조정했다.
- NSP·벤치마크 점수·후대 생성 모델 계보는 각각 실험 조건과 구조 차이를 명시해야 한다.

## 2단계 — 작동 원리

### 사전 학습에서 후속 과제까지

BERT는 입력 일부를 가린 뒤 좌우 문맥으로 원 token을 복원하도록 encoder를 사전 학습한다. 후속 과제에서는 입력 형식에 맞는 작은 출력층을 붙이고 기반 encoder까지 함께 갱신한다. 이 흐름은 양방향 문맥 표현을 분류·span·token 단위 출력에 전달한다.

## 3단계 — 기술과 근거

### feature 기반과 fine-tuning 기반 사이

BERT 논문은 당시 사전 학습 표현의 적용 방식을 두 갈래로 정리했다. ELMo는 사전 학습 biLM을 고정하고 내부 표현을 과제별 구조에 특징으로 추가했다. OpenAI GPT는 왼쪽에서 오른쪽으로만 attention하는 Transformer를 사전 학습한 뒤 전체 매개변수를 미세조정했다.

BERT는 GPT처럼 최소한의 출력층만 새로 두고 전체 모델을 미세조정하되, [[마스크드 언어 모델링]]으로 모든 encoder 층이 좌우 문맥에 공동 조건화되도록 했다. 따라서 BERT의 새로움은 ‘사전 학습’이나 ‘Transformer’를 처음 만든 데 있지 않고, 깊은 양방향 encoder 사전 학습과 단순한 과제 적응을 결합한 데 있다.

### MLM이 만드는 양방향 조건

표준 왼쪽→오른쪽 언어 모델은 $p(x_i\mid x_{<i})$를 학습한다. BERT는 입력 위치 일부 $M$을 선택하고 교란된 sequence $\tilde{x}$에서 원 token을 예측한다.

$$
\mathcal{L}_{\mathrm{MLM}}
=-\sum_{i\in M}\log p_\theta(x_i\mid \tilde{x}).
$$

encoder에는 causal mask가 없으므로 선택 위치의 예측은 왼쪽과 오른쪽 입력 모두를 사용할 수 있다. 이 의미에서 ‘양방향’이다. 모든 token을 차례로 생성하는 확률 분해가 아니며, 선택되지 않은 85% 위치를 정답으로 채점하지 않는다.

WordPiece token의 15%를 예측 대상으로 뽑는다. 그중 80%는 `[MASK]`, 10%는 임의 token, 10%는 원 token을 입력한다. 세 경우 모두 선택 위치의 원래 vocabulary ID를 예측한다. 미세조정 입력에 나타나지 않는 `[MASK]`에만 의존하는 문제를 줄이려는 장치지만 사전 학습–사용 불일치를 완전히 없애지는 않는다.

### 입력 표현과 NSP

BERT 입력은 token embedding, segment embedding, position embedding의 합이다. sequence 앞에는 `[CLS]`, 문장 끝과 문장 쌍 경계에는 `[SEP]`를 둔다. 문장 쌍 과제는 하나의 sequence로 이어 encoder에 넣는다.

NSP에서는 두 text span A·B를 뽑아 절반은 원문에서 실제 이어지는 B, 절반은 corpus의 무작위 B로 만든다. `[CLS]` 표현에서 `IsNext`와 `NotNext`를 분류한다. 논문이 ‘sentence’라고 부른 span은 실제 한 문장보다 길거나 짧을 수 있다.

원 논문의 ablation은 NSP를 제거하면 QNLI·MNLI·SQuAD 일부 결과가 낮아졌다고 보고했다. 반면 RoBERTa는 NSP를 빼고 더 많은 자료, 더 큰 batch, 더 긴 학습, 긴 sequence, 동적 masking을 결합해 더 강한 결과를 냈다. 이는 NSP가 필수라는 주장을 약화하지만 여러 조건이 함께 바뀌었으므로 모든 설정에서 무용하다는 단일 요인 증명은 아니다.

### 두 크기와 사전 학습 자료

BERT-base는 12층, hidden size 768, 12 attention head, 약 1억 1천만 매개변수였다. BERT-large는 24층, hidden size 1024, 16 head, 약 3억 4천만 매개변수였다. BooksCorpus 약 8억 단어와 영어 Wikipedia 약 25억 단어를 사용했다.

최대 sequence 길이는 512 token이었다. 계산을 줄이려고 학습 step의 90%는 길이 128, 나머지 10%는 512로 수행했다. raw의 ‘모든 token 병렬 처리’는 recurrent dependency가 없다는 뜻이지 self-attention의 $O(n^2)$ 계산·메모리가 사라진다는 뜻이 아니다.

### 과제별 최소 출력층

- GLUE 분류·회귀: `[CLS]` 최종 표현에 선형 출력층을 둔다.
- SQuAD: 각 token의 최종 표현에서 답 시작·끝 점수를 계산한다.
- token tagging: 각 위치 표현에 label 분류층을 둔다.
- SWAG: 네 후보 문장쌍을 각각 부호화하고 점수를 비교한다.

출력층만 학습한 것이 아니라 과제 손실로 BERT 전체 매개변수를 함께 미세조정했다. BERT-large는 GLUE 80.5, MultiNLI 86.7%, SQuAD 1.1 Test F1 93.2, SQuAD 2.0 Test F1 83.1을 보고했다. 이 수치는 2018–2019년 데이터·평가·ensemble/단일 모델 설정에 묶이며 현재 일반 능력 점수가 아니다.

### 생성과 이해의 다른 인터페이스

BERT의 encoder는 입력 전체가 주어졌을 때 각 위치 표현을 계산한다. 다음 token을 한 개씩 생성하는 causal 확률 분해가 없으므로 표준 BERT만으로 자연스러운 왼쪽→오른쪽 생성을 수행하지 않는다. MLM을 반복 적용해 text를 채울 수는 있지만 GPT식 자기회귀 decoding과 같은 모델이 아니다.

‘이해 과제’라는 이름도 평가 인터페이스를 뜻한다. GLUE 분류, SQuAD span extraction과 SWAG 후보 선택에서 높은 점수를 얻었다는 사실은 명시적 기호 추론·수학·사실성·분포 밖 견고성을 모두 해결했다는 뜻이 아니다.

## 검증과 한계

### 검증 정정

- **BERT가 Transformer를 발명했다**: 2017년 encoder–decoder 번역 구조의 encoder를 사전 학습 표현에 사용했다.
- **ELMo는 양방향 문맥을 쓰지 못했다**: 순·역방향 LSTM 특징을 결합했지만 모든 층의 공동 양방향 조건화는 아니었다.
- **MLM은 입력 token 15%만 모델에 보여 준다**: 전체 sequence를 입력하고 선택 위치만 교란·예측한다.
- **선택 token은 모두 `[MASK]`다**: 80% `[MASK]`, 10% 임의 token, 10% 원 token이다.
- **NSP는 두 실제 문장이 이어지는 의미 관계를 깊게 추론한다**: 원 과제는 실제 다음 span과 무작위 span의 이진 분류다.
- **RoBERTa가 NSP가 언제나 해롭다고 증명했다**: NSP 제거와 자료·학습량·batch·masking 변경을 함께 사용했다.
- **열한 과제 최고 성능은 보편적 언어 이해를 증명한다**: 정해진 벤치마크의 분류·span·후보 선택 결과다.
- **모든 현대 생성 LLM은 BERT식 양방향 attention을 사용한다**: decoder-only 모델은 보통 causal attention과 다음 token 예측을 사용한다.
- **BERT는 자연스러운 범용 text generator다**: 원 구조와 학습 목적은 입력 표현·복원·후속 이해 과제에 맞춰졌다.
- **사전 학습 checkpoint는 편향과 영역 차이를 해결한다**: 영어 BooksCorpus·Wikipedia의 coverage와 편향이 후속 과제로 전이될 수 있다.

## 학습 확인

### 확인 질문

1. BERT의 ‘양방향’은 어떤 attention 구조와 사전 학습 목적의 결합을 뜻하는가?
2. MLM 대상 token을 고르는 일부터 후속 과제 전체 미세조정까지 어떤 흐름으로 이어지는가?
3. BERT의 벤치마크 성능이 사람과 같은 일반 이해를 보장하지 않는 이유는 무엇인가?

### 다음 문서

- [[BERT]] — 구조·사전 학습 목표·과제 적응을 개념 단위로 다시 정리한다.
- [[마스크드 언어 모델링]] — 15% 선택과 80/10/10 교란이 만드는 학습 신호와 불일치를 자세히 살핀다.

## 출처

- Jacob Devlin 외, [BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding](https://aclanthology.org/N19-1423/), NAACL 2019, pp. 4171–4186.
- Yinhan Liu 외, [RoBERTa: A Robustly Optimized BERT Pretraining Approach](https://arxiv.org/abs/1907.11692), 2019.
- 프로젝트 번역·검토 출발 자료: [BERT Bidirectional Pretraining Revolutionizes Language Understanding](https://mbrenndoerfer.com/writing/bert-bidirectional-pretraining-revolutionizes-language-understanding)
- 프로젝트 보존 자료: `raw/057_BERT Bidirectional Pretraining Revolutionizes Language Understanding.ko.md`, `raw/057_BERT Bidirectional Pretraining Revolutionizes Language Understanding.commentary.ko.md`.

## 관련 항목

- [[BERT]]
- [[마스크드 언어 모델링]]
- [[언어 모델 전이 학습]]
- [[Transformer]]
- [[057_ELMo와 ULMFiT의 두 전이 학습 경로]]
