---
source_file: "058_BERT Bidirectional Pretraining Revolutionizes Language Understanding.md"
translation_file: "058_BERT Bidirectional Pretraining Revolutionizes Language Understanding.ko.md"
commentary_type: "해설"
source_stem: "058_BERT Bidirectional Pretraining Revolutionizes Language Understanding"
order_prefix: "058"
topic: "BERT의 양방향 사전 학습과 미세조정"
period: "2018년"
tags:
  - LLM
  - NLP
  - AI-history
  - commentary
---

# BERT의 양방향 사전 학습과 미세조정 해설

## 1. 한눈에 보기

- 핵심 주제: Transformer encoder를 MLM과 NSP로 사전 학습하고 작은 출력층을 붙여 전체 모델을 미세조정하는 방법
- 등장 배경: 한 방향 언어 모델의 위치별 문맥 제약과 특징 기반 전이의 과제별 구조 부담
- 가장 중요한 아이디어: 입력 token 일부를 예측 대상으로 가려 좌우 문맥을 함께 쓰는 학습 신호를 만든다.
- 이후 LLM/NLP에 남긴 영향: encoder형 사전 학습 모델과 공통 checkpoint–과제별 미세조정 관행을 확립했다.

> 이 문서는 `058_BERT Bidirectional Pretraining Revolutionizes Language Understanding.md`의 번역문을 이해하기 위한 해설이다. ‘양방향 이해’라는 표어를 구조·목적함수·평가 범위로 나누어 읽는다.

## 2. 핵심 요약

BERT는 Transformer encoder에 causal mask를 두지 않고 입력 전체의 self-attention을 허용한다. 그러나 입력을 볼 수 있다는 사실만으로 사전 학습 목표가 성립하지는 않는다. BERT는 token의 15%를 예측 대상으로 골라 80% `[MASK]`, 10% 임의 token, 10% 원 token으로 제시하고 원래 token을 맞히는 MLM을 사용했다. 문장 쌍에는 실제 다음 문장과 무작위 문장을 구분하는 NSP를 더했다. BooksCorpus와 영어 Wikipedia에서 사전 학습한 뒤 GLUE·SQuAD·SWAG 등 열한 과제에 작은 헤드를 붙여 모든 매개변수를 미세조정했다.

- 무엇을 다루는가: BERT의 입력 표현, MLM·NSP, encoder와 후속 미세조정
- 어떤 문제를 해결하려 했는가: 앞이나 뒤 한쪽만 조건으로 삼는 사전 학습 표현의 제약
- 어떤 방식이 새로웠는가: 깊은 Transformer의 모든 층에서 좌우 문맥을 함께 쓰는 masked-token 복원
- 결과적으로 무엇이 바뀌었는가: 같은 기반 모델을 여러 이해 과제에 최소한의 출력층 변경으로 적용하는 관행이 표준화됐다.

## 3. 역사적 배경

Transformer는 2017년 번역 encoder–decoder로 먼저 발표됐다. ELMo는 순방향·역방향 LSTM의 내부 층을 과제 특징으로 결합했고, ULMFiT는 자기회귀 LSTM 언어 모델을 영역·분류 과제에 단계적으로 미세조정했다. BERT는 Transformer encoder 전체를 MLM으로 사전 학습하고 후속 과제에서 전체 매개변수를 갱신했다. 따라서 ‘양방향’은 ELMo와 공통 표어지만 학습 조건은 다르고, ‘미세조정’은 ULMFiT와 공통 인터페이스지만 구조와 목적은 다르다.

- 이전 접근법: 정적 임베딩, 한 방향 LM, ELMo 특징 추출, 생성 LM 미세조정
- 당시의 한계: 좌우 문맥 공동 조건화, 과제별 구조 재설계, 깊은 표현의 전이
- 이 주제가 필요했던 이유: 분류·추론·질의응답에서 전체 입력 관계를 공통 encoder로 학습하기 위해서였다.

## 4. 핵심 개념 해설

### 4.1 MLM의 예측 단위

각 sequence에서 WordPiece token의 15%를 선택한다. 선택 token만 MLM 손실의 대상이며, 80/10/10 입력 교란은 `[MASK]`가 미세조정 때 나타나지 않는 차이를 줄인다. 나머지 85% token을 그대로 복사하는 autoencoder 목적이 아니다.

### 4.2 양방향 Transformer encoder

encoder self-attention은 현재 층의 각 위치가 입력 sequence의 모든 위치에 접근하게 한다. MLM 대상 위치는 원 token이 가려졌으므로 주변 좌우 정보에서 예측해야 한다. 이는 ELMo처럼 순·역방향 LM을 별도로 훈련해 표현을 잇는 것과 다르다.

### 4.3 NSP와 문장 쌍 입력

`[CLS] A [SEP] B [SEP]` 형식과 segment embedding을 사용한다. B가 A의 실제 다음 문장인지 무작위 문장인지 분류한다. 후속 연구가 NSP를 제거한 결과를 냈지만, 자료·학습량·masking도 함께 바뀌었으므로 NSP의 보편적 무용성을 한 실험으로 확정하지 않는다.

### 4.4 미세조정

분류는 `[CLS]`, token labeling은 각 위치, SQuAD는 시작·끝 위치에 과제별 출력층을 둔다. 사전 학습 encoder를 고정 특징으로만 쓰는 것이 아니라 작은 학습률로 전체 매개변수를 공동 갱신한다.

## 5. 원문의 논리 구조

원문은 한 방향 언어 모델과 ELMo 특징 기반 표현의 제약을 문제로 둔다. 이어 causal mask가 없는 Transformer encoder, MLM의 15%·80/10/10 규칙, NSP와 `[CLS]`·`[SEP]`, 과제별 단순 헤드를 해법으로 설명한다. 후반에는 열한 과제 성과와 연구·산업 확산을 영향으로, 계산량·512 token·생성 부적합·추론·편향·NSP 논쟁을 한계로 든다. 마지막에는 encoder 변형과 현대 LLM 전체에 미친 유산을 넓게 평가한다.

1. 한 방향 사전 학습의 문맥 제약을 제시한다.
2. MLM이 양쪽 문맥을 학습 신호로 만드는 방식을 설명한다.
3. NSP와 통일된 입력·출력 인터페이스를 더한다.
4. GLUE·SQuAD·SWAG 성과와 미세조정 패러다임을 평가한다.
5. 후속 변형과 생성 모델 계보에서 범위를 점검한다.

## 6. 왜 중요한가

BERT는 강한 과제 전용 구조보다 사전 학습 방식과 공통 기반 모델이 더 큰 성능 차이를 만들 수 있음을 보여 주었다. 연구자는 같은 checkpoint에 작은 출력층을 붙여 분류·token tagging·span prediction을 다룰 수 있었다. 또한 문맥화 표현, 사전 학습 목적, 후속 적응을 하나의 재현 가능한 인터페이스로 묶었다.

핵심적으로 중요한 점:

- 양방향 문맥을 masked-token 복원이라는 구체적 목적함수로 구현했다.
- 입력 형식과 과제별 출력 헤드를 표준화했다.
- 기반 모델 전체 미세조정을 여러 벤치마크에서 같은 절차로 검증했다.

## 7. 현대 LLM과의 연결

encoder형 검색·분류·reranking 모델은 여전히 BERT 계열의 MLM 사전 학습과 양방향 입력 표현을 널리 사용한다. 생성형 decoder LLM은 보통 causal next-token 목적을 사용하므로 BERT의 내부 양방향 attention을 그대로 갖지 않는다. prompt를 끝까지 읽은 뒤 답한다는 사용자 경험과, prompt 내부 token 표현이 오른쪽 token에 접근할 수 있는지는 다른 문제다.

현대 instruction tuning·RLHF는 사전 학습 뒤 추가 적응이라는 넓은 틀을 공유하지만 BERT 원 논문의 두 단계와 동일하지 않다. BERT는 지시 시연·선호 보상·자유 생성 decoding을 실험하지 않았다.

## 8. 한계와 비판적 관점

- 기술적 한계: 512 token 입력, self-attention의 계산·메모리, 큰 사전 학습 비용
- 목적함수 한계: `[MASK]` 불일치와 독립적으로 선택된 masked token 예측, 자연스러운 자기회귀 생성 부재
- 평가 한계: GLUE·SQuAD 성능은 특정 자료 분포의 분류·span 예측이며 일반 추론의 완전한 증거가 아니다.
- 사회적 한계: 영어 BooksCorpus·Wikipedia의 편향과 coverage가 후속 과제에 전이된다.

원문의 “virtually any NLP task”와 “true bidirectional understanding”은 구조적 장점과 사람 수준 이해를 섞을 위험이 있다. BERT가 열한 과제에서 강했다는 사실과 모든 언어·영역·생성 과제에 보편적으로 적합하다는 주장은 다르다.

## 9. 용어 정리

| 용어 | 설명 |
|---|---|
| MLM | 선택한 입력 token을 교란하고 좌우 문맥에서 원 token을 예측하는 목적 |
| NSP | 문장 B가 문장 A 뒤에 실제 이어졌는지 분류하는 BERT의 보조 목적 |
| WordPiece | 입력 문자열을 subword token sequence로 바꾸는 BERT tokenizer 방식 |
| `[CLS]` | sequence·문장 쌍 분류에 사용한 입력 맨 앞 특수 token |
| `[SEP]` | 문장 끝과 문장 쌍 경계를 표시하는 특수 token |
| 미세조정 | 사전 학습 checkpoint를 과제 손실로 계속 갱신하는 적응 절차 |

## 10. 함께 보면 좋은 글

- [[057_ELMo and ULMFiT Transfer Learning for Natural Language Processing]]
- [[055_The Transformer Attention Is All You Need]]
- [[051_SQuAD The Stanford Question Answering Dataset and Reading Comprehension Benchmark]]

## 11. 읽고 생각해볼 질문

1. MLM에서 선택 token을 모두 `[MASK]`로 바꾸지 않은 이유는 무엇인가?
2. ELMo와 BERT의 ‘양방향’은 학습 그래프에서 어떻게 다른가?
3. NSP 제거 실험에서 함께 바뀐 조건을 통제하지 않으면 어떤 인과 오류가 생기는가?
4. 양방향 encoder가 생성 모델보다 유리하거나 불리한 실제 과제는 무엇인가?

## 12. 짧은 결론

BERT는 Transformer encoder, MLM·NSP, 통일된 입력 형식과 전체 모델 미세조정을 결합해 2018년 자연어 이해 사전 학습의 기준을 바꿨다. 핵심은 막연한 ‘문맥 이해’가 아니라 가려진 token을 좌우 문맥에서 복원하는 목적과 여러 과제에 같은 checkpoint를 적응시키는 인터페이스다. 이 범위를 지켜야 BERT의 역사적 영향과 생성형 LLM과의 차이를 함께 볼 수 있다.
