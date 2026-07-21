---
schema_version: 2
id: source.061
page_type: source
title: XLNet·RoBERTa·ALBERT의 BERT 개선 경로
aliases:
  - 061_XLNet, RoBERTa, ALBERT Refining BERT with Permutation Modeling, Training Optimization, and Parameter Efficiency
  - BERT 이후 세 가지 개선 경로
tags:
  - type/source
  - domain/ai
  - domain/nlp
  - domain/machine-learning
created: '2026-07-21'
updated: '2026-07-21'
lifecycle: active
verification: verified
artifacts:
  - 'raw/061_XLNet, RoBERTa, ALBERT Refining BERT with Permutation Modeling, Training Optimization, and Parameter Efficiency.ko.md'
  - 'raw/061_XLNet, RoBERTa, ALBERT Refining BERT with Permutation Modeling, Training Optimization, and Parameter Efficiency.commentary.ko.md'
evidence:
  - source_id: bert-2019
    locator: '§3.1과 Appendix A.2의 15%·80/10/10 MLM·NSP 표본화, §5.1과 Table 5의 사전 학습 objective ablation, Appendix C.2와 Table 8의 masking 방식 비교'
    relation: contextualizes
  - source_id: yang-et-al-2019-xlnet
    locator: '§§2.1–2.6과 Eqs. 2–8, Figures 1–2의 permutation objective·two-stream attention·Transformer-XL 결합, §3와 Tables 1–6의 비교·ablation'
    relation: supports
  - source_id: liu-et-al-2019-roberta
    locator: '§§3–4의 corpus·dynamic masking·NSP·input format·large batch 비교, §5와 Tables 4–5의 100K–500K 학습·benchmark 결과'
    relation: supports
  - source_id: lan-et-al-2020-albert
    locator: '§§3.1–3.2의 factorized embedding·cross-layer sharing·SOP, §§4.3–4.6와 Tables 1–5의 매개변수·처리량·공유·목표 비교'
    relation: supports
related:
  - concept.xlnet-roberta-albert
  - concept.bert
  - concept.마스크드-언어-모델링
  - concept.transformer-xl
  - source.058
  - source.060
---
# XLNet·RoBERTa·ALBERT의 BERT 개선 경로

> [!note] 학습 안내
> **난이도:** 심화<br>
> **선수 지식:** [[BERT]], [[마스크드 언어 모델링]]<br>
> **읽고 나면:** BERT 이후의 성능 향상을 사전 학습 목표·훈련 recipe·매개변수 구조라는 세 축으로 분리하고, parameter 수와 실제 계산 효율을 구분해 설명할 수 있다.

## 1단계 — 먼저 잡을 핵심

원문은 2019년 전후의 [[XLNet·RoBERTa·ALBERT]]를 BERT 개선 모델 세 가지로 묶는다. 비교축은 유용하다. XLNet은 예측 순서를, RoBERTa는 훈련 조건을, ALBERT는 매개변수 배치를 주로 바꿨다. 그러나 raw는 BERT의 masking, XLNet의 순열 조건화, RoBERTa의 step 수와 dynamic masking 효과, ALBERT의 성능·계산 효율을 여러 곳에서 과장하거나 잘못 설명한다. 공개 문서는 네 원 논문의 정의와 ablation으로 세 개선 경로를 다시 분리한다.

### 핵심 문장

- XLNet은 입력 token의 자연 순서가 아니라 결합확률의 **factorization order**를 표본 추출한다.
- RoBERTa는 BERT 구조를 유지하면서 data·batch·mask 재표집·NSP·입력 구성을 함께 재검토했다.
- ALBERT는 embedding factorization과 깊이 방향의 layer sharing으로 parameter 수를 줄였다.
- 적은 parameter는 저장·통신 memory의 이점이지 FLOPs나 latency가 같은 비율로 줄어든다는 뜻이 아니다.
- 세 모델의 benchmark 향상은 objective·data·compute·parameterization을 통제하지 않으면 하나의 원인으로 돌릴 수 없다.

## 2단계 — 작동 원리

### 같은 기준 모델에서 갈라진 세 질문

| 질문 | 모델 | 주로 바꾼 것 | 유지하거나 계승한 것 |
|---|---|---|---|
| `[MASK]` 없이 양쪽 문맥을 쓸 수 있는가? | XLNet | permutation language modeling, two-stream attention | [[Transformer-XL]]의 recurrence·상대 위치 표현 |
| BERT를 더 충분하고 일관되게 훈련하면 어디까지 가는가? | RoBERTa | corpus·batch·mask 일정·NSP·sequence 구성 | BERT encoder와 MLM |
| hidden size를 키워도 parameter 증가를 억제할 수 있는가? | ALBERT | factorized embedding, cross-layer sharing, SOP | BERT식 encoder와 MLM |

세 접근은 한 줄의 후속 버전이 아니다. RoBERTa와 ALBERT는 BERT encoder 계열이지만 XLNet은 Transformer-XL 위에 일반화된 자기회귀 목표와 two-stream attention을 결합한다. 따라서 “어느 모델이 BERT를 대체했는가”보다 “어느 병목을 어떤 비용으로 바꿨는가”를 묻는 편이 정확하다.

## 3단계 — 기술과 근거

### BERT 기준선에서 정확히 문제였던 것

BERT는 전체 token을 `[MASK]`로 바꾸지 않는다. WordPiece 위치의 15%만 예측 대상으로 고르고, 그중 80%는 `[MASK]`, 10%는 임의 token, 10%는 원 token을 입력한다. 따라서 raw의 “사전 학습에서 실제 단어를 전혀 보지 않았다”는 설명은 틀리다. 정확한 한계는 선택 위치 일부에서만 생기는 인공 token 불일치와, 같은 입력에서 여러 선택 token을 서로 직접 조건화하지 않고 병렬 예측하는 데 있다.

BERT의 NSP는 text span A 뒤에 실제로 이어지는 B와 corpus에서 무작위로 고른 B를 분류한다. BERT 원 ablation에서는 일부 과제에 도움이 됐지만, 주제가 다른 negative를 쉽게 구분하는 신호가 담화 관계 학습과 같은지는 후속 연구의 질문으로 남았다.

### XLNet: 입력 순서가 아니라 확률분해 순서를 바꾼다

sequence $x=(x_1,\ldots,x_T)$와 위치 순열의 집합 $Z_T$를 두면 XLNet의 핵심 목표는 다음처럼 쓸 수 있다.

$$
\max_\theta\;\mathbb{E}_{z\sim Z_T}
\left[\sum_{t=1}^{T}\log p_\theta
\left(x_{z_t}\mid x_{z_{<t}}\right)\right].
$$

$z$는 원문의 token 배치를 뒤섞는 순서가 아니라 어떤 위치를 먼저 조건으로 공개하고 예측할지를 정하는 순서다. 자연어 위치는 positional encoding에 그대로 남는다. 주어진 target은 factorization order에서 앞선 위치의 내용만 볼 수 있다. raw의 예처럼 첫 target이 나머지 모든 token 내용을 먼저 보는 것은 자기회귀 조건과 맞지 않는다.

XLNet은 target 위치를 알면서 target 내용은 보지 않도록 두 표현 흐름을 둔다.

| 흐름 | 접근 정보 | 역할 |
|---|---|---|
| content stream $h$ | 현재 위치까지 공개된 token 내용과 위치 | 문맥의 내용 표현을 갱신한다. |
| query stream $g$ | target 위치와 factorization상 앞선 내용, target 내용 제외 | 현재 target의 분포를 예측한다. |

fine-tuning에서는 query stream을 버리고 content stream을 사용한다. XLNet은 Transformer-XL의 segment recurrence와 상대 위치 encoding도 결합했다. 그러므로 성능을 permutation objective 하나의 효과로 읽지 않고 Table 6의 ablation처럼 objective와 Transformer-XL 구성의 기여를 나눠 봐야 한다.

XLNet은 유효한 자기회귀 factorization을 학습하지만 GPT처럼 표준 왼쪽→오른쪽 생성기로 폭넓게 검증됐다는 뜻은 아니다. 원 논문의 주 실험은 GLUE·RACE·SQuAD·문서 순위 같은 이해·선택·추출 과제였다.

### RoBERTa: 구조보다 훈련 조건을 다시 통제한다

RoBERTa는 BooksCorpus와 영어 Wikipedia에 CC-News·OpenWebText·Stories를 더해 160GB가 넘는 text를 사용했다. BERT의 약 16GB보다 훨씬 크다. byte-level BPE, 큰 batch, 긴 sequence 구성과 더 많은 총 학습 노출도 함께 사용했으므로 성능 차이를 dynamic masking 하나로 설명할 수 없다.

BERT의 data 생성 절차는 같은 sequence를 열 번 복제해 서로 다른 mask를 만들고 여러 epoch에서 반복 사용했다. RoBERTa는 sequence가 학습에 제시될 때 mask를 다시 표본 추출했다. 그러나 Table 1의 통제 비교는 dynamic 방식이 static 방식보다 **비슷하거나 약간 우수**한 수준이었다. “특정 mask 과적합을 막아 큰 향상을 만들었다”는 raw의 단일 인과는 근거보다 강하다.

NSP를 제거한 실험도 입력 segment 구성과 함께 읽어야 한다. 서로 다른 문서에서 짧은 segment를 모은 설정은 성능이 낮았고, 문서 경계를 존중한 긴 sequence에서 NSP 없이 MLM만 학습했을 때 BERT 계열 결과를 맞추거나 조금 높였다. 이는 NSP가 모든 조건에서 해롭다는 증명이 아니라 원래 objective와 data construction을 다시 점검한 결과다.

RoBERTa의 최종 대표 설정은 50만 step이었다. BERT의 100만 step보다 숫자는 작지만 batch가 256 sequence에서 약 8천 sequence로 커져 처리한 총 sequence가 훨씬 많았다. 따라서 “더 긴 훈련”을 raw step 수가 아니라 batch·token·data 노출량과 함께 정의해야 한다. 논문은 50만 step에서도 더 훈련하면 개선될 가능성을 남겼으므로 완전 수렴을 주장하지 않았다.

### ALBERT: parameter 수와 계산량을 분리한다

어휘 크기를 $V$, hidden size를 $H$라 하면 BERT의 token embedding parameter는 $O(VH)$다. ALBERT는 $H$보다 작은 embedding size $E$를 두고 hidden 공간으로 projection한다.

$$
O(VH)\quad\longrightarrow\quad O(VE+EH),\qquad E\ll H.
$$

또한 여러 깊이의 Transformer layer가 같은 attention·feedforward block parameter를 재사용한다. 이는 sequence 위치 사이의 공유가 아니라 **layer 사이 공유**다. parameter 저장량은 크게 줄지만 같은 block을 깊이만큼 반복 계산하므로 연산량도 같은 비율로 줄지는 않는다.

ALBERT의 sentence order prediction(SOP)은 같은 문서에서 이어지는 두 text segment를 가져와 절반은 순서를 바꾸고, 원래 순서인지 뒤집힌 순서인지 분류한다. 무작위 문서 negative를 포함한 NSP보다 topic 차이에 덜 의존하고 담화 일관성을 보게 하려는 목표였다.

| 비교 모델 | parameter | Table 2 평균 | 해석 |
|---|---:|---:|---|
| BERT-base | 108M | 82.3 | 대응 base 기준 |
| ALBERT-base | 12M | 80.1 | parameter는 크게 줄지만 같은 설정의 평균은 더 낮다. |
| BERT-large | 334M | 85.2 | 대응 large 기준 |
| ALBERT-large | 18M | 82.4 | raw의 ‘BERT-large보다 우수’ 주장과 달리 더 낮다. |

강한 최종 결과는 2억 3천5백만 parameter의 ALBERT-xxlarge에서 나왔다. 이 모델은 BERT-large보다 parameter가 적지만 data 순회 속도는 약 세 배 느렸다고 논문이 보고한다. parameter efficiency를 mobile latency나 전체 compute efficiency로 바로 바꾸어 말할 수 없는 이유다. Table 4의 공유 ablation에서도 all-shared 설정은 non-shared보다 평균이 낮아, 공유가 비용 없이 같은 capacity를 보존한다고 단정할 수 없다.

### benchmark는 단일 원인 실험이 아니다

세 모델은 발표 당시 [[GLUE와 SuperGLUE]], SQuAD, RACE 등에서 강한 결과를 냈다. 그러나 사용 data·모델 크기·학습량·architecture가 다르므로 leaderboard 순위를 곧 특정 아이디어 하나의 인과 효과로 읽지 않는다. objective의 효과는 같은 data와 backbone을 맞춘 ablation으로, training recipe는 총 token·batch·compute를 포함한 비교로, parameterization은 성능과 처리량을 함께 보고 판단해야 한다.

## 검증과 한계

### 검증 정정

- **BERT는 사전 학습 중 실제 단어를 전혀 보지 않는다**: 전체 위치의 15%만 target이고, 선택 위치도 80/10/10으로 처리한다.
- **XLNet은 token을 실제 순열로 섞는다**: 입력의 자연어 위치가 아니라 확률분해 순서만 표본 추출한다.
- **XLNet의 첫 target은 나머지 모든 위치를 본다**: factorization상 앞선 위치만 조건으로 사용할 수 있다.
- **two-stream attention이 fine-tuning에도 그대로 남는다**: fine-tuning에서는 query stream을 버리고 content stream을 쓴다.
- **RoBERTa는 BERT보다 더 많은 step으로 완전히 수렴했다**: 대표 설정은 500K 대 1M이지만 큰 batch로 더 많은 sequence를 처리했고, 추가 개선 가능성을 남겼다.
- **dynamic masking이 큰 향상의 단일 원인이다**: 통제 비교는 비슷하거나 소폭 우수했으며 전체 recipe가 함께 바뀌었다.
- **ALBERT는 위치마다 같은 parameter를 쓴다**: 공유 축은 sequence 위치가 아니라 네트워크 깊이의 layer다.
- **12M·18M ALBERT가 대응 BERT의 성능을 맞추거나 넘었다**: 같은 설정의 Table 2에서는 각각 더 낮고, 강한 결과는 235M xxlarge에서 나왔다.
- **parameter가 적으면 FLOPs·latency도 같은 폭으로 줄어든다**: 저장량과 반복 계산은 다른 비용이다.
- **세 모델은 정적 embedding을 만든다**: 모두 입력 문맥에 따라 달라지는 contextual representation을 만든다.
- **세 모델은 모두 BERT encoder-only 변형이다**: RoBERTa·ALBERT와 달리 XLNet은 Transformer-XL 기반의 generalized autoregressive 구조다.
- **mobile·production 채택과 T5·GPT-3 직접 영향이 입증됐다**: 세 원 논문만으로는 이 배포·계보를 확인할 수 없어 공개 문서의 결론에서 제외한다.

### 남는 비교 한계

XLNet·RoBERTa·ALBERT 논문은 서로 같은 corpus·tokenizer·training budget·모델 크기로 직접 대조한 단일 실험이 아니다. 각 논문의 최고 점수를 한 표에 놓아도 어느 설계가 같은 비용에서 우월한지는 알 수 없다. 또한 2019년 영어 NLU benchmark의 향상을 오늘날 생성·사실성·긴 문맥·도구 사용 능력으로 소급하지 않는다.

## 학습 확인

### 확인 질문

1. XLNet이 순열하는 대상은 입력 token 순서인가, 확률분해 순서인가?
2. RoBERTa의 개선을 dynamic masking 하나의 효과로 볼 수 없는 이유는 무엇인가?
3. ALBERT의 parameter 수 감소가 inference latency 감소와 같은 뜻이 아닌 이유는 무엇인가?

### 다음 문서

- [[언어 모델 전이 학습]] — 사전 학습 표현과 parameter가 후속 과제로 전달되는 여러 인터페이스를 비교한다.
- [[훈련 병렬성과 생성 순차성은 다른 축이다]] — 모델 구조·학습 계산·생성 순서를 서로 다른 효율 축으로 분리한다.

## 출처

- Jacob Devlin 외, [BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding](https://aclanthology.org/N19-1423/), 특히 §3.1과 Appendix A.2.
- Zhilin Yang 외, [XLNet: Generalized Autoregressive Pretraining for Language Understanding](https://proceedings.neurips.cc/paper_files/paper/2019/hash/dc6a7e655d7e5840e66733e9ee67cc69-Abstract.html), NeurIPS 2019, 특히 §§2–3.
- Yinhan Liu 외, [RoBERTa: A Robustly Optimized BERT Pretraining Approach](https://arxiv.org/abs/1907.11692), 2019, 특히 §§3–5.
- Zhenzhong Lan 외, [ALBERT: A Lite BERT for Self-supervised Learning of Language Representations](https://openreview.net/forum?id=H1eA7AEtvS), ICLR 2020, 특히 §§3–5.
- 프로젝트 번역·검토 출발 자료: [XLNet, RoBERTa, ALBERT: Refining BERT with Permutation Modeling, Training Optimization, and Parameter Efficiency](https://mbrenndoerfer.com/writing/xlnet-roberta-albert-bert-refinements)
- 프로젝트 보존 자료: `raw/061_XLNet, RoBERTa, ALBERT Refining BERT with Permutation Modeling, Training Optimization, and Parameter Efficiency.ko.md`, `raw/061_XLNet, RoBERTa, ALBERT Refining BERT with Permutation Modeling, Training Optimization, and Parameter Efficiency.commentary.ko.md`.

## 관련 항목

- [[XLNet·RoBERTa·ALBERT]]
- [[BERT]]
- [[마스크드 언어 모델링]]
- [[Transformer-XL]]
- [[058_BERT의 마스크드 양방향 사전 학습]]
- [[060_GLUE와 SuperGLUE의 집계 평가]]
