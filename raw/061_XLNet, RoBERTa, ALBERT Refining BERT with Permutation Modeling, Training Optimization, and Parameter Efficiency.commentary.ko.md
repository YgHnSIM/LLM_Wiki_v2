---
source_file: "060_XLNet, RoBERTa, ALBERT Refining BERT with Permutation Modeling, Training Optimization, and Parameter Efficiency.md"
translation_file: "060_XLNet, RoBERTa, ALBERT Refining BERT with Permutation Modeling, Training Optimization, and Parameter Efficiency.ko.md"
commentary_type: "해설"
source_stem: "060_XLNet, RoBERTa, ALBERT Refining BERT with Permutation Modeling, Training Optimization, and Parameter Efficiency"
order_prefix: "060"
topic: "XLNet·RoBERTa·ALBERT의 BERT 개선 경로"
period: "2019–2020년"
tags:
  - LLM
  - NLP
  - AI-history
  - commentary
---

<!-- Obsidian note: frontmatter와 링크 대상을 검증했으며, 원문의 사실 오류는 8절에서 원 논문과 대조한다. -->

# XLNet·RoBERTa·ALBERT의 BERT 개선 경로 해설

## 1. 한눈에 보기

- 핵심 주제: BERT 이후의 개선을 사전 학습 목표·훈련 recipe·매개변수 구조라는 세 축으로 비교한다.
- 등장 배경: BERT의 MLM–fine-tuning 불일치, 훈련 설정의 미탐색 영역, 큰 hidden size와 layer 수에 따른 매개변수 증가가 드러난 시기다.
- 가장 중요한 아이디어: XLNet은 factorization order, RoBERTa는 통제된 훈련 ablation, ALBERT는 embedding factorization과 layer sharing을 바꿨다.
- 이후 LLM/NLP에 남긴 영향: “새 아키텍처”만이 아니라 objective·data·batch·parameterization을 분리해 비교하는 관점이 굳어졌다.

> 이 문서는 `060_XLNet, RoBERTa, ALBERT Refining BERT with Permutation Modeling, Training Optimization, and Parameter Efficiency.md`의 번역문을 이해하기 위한 해설이다. 원문을 반복하기보다 세 연구의 비교축과 원문에서 바로잡아 읽어야 할 대목을 정리한다.

## 2. 핵심 요약

XLNet은 token의 자연스러운 입력 순서를 섞지 않고, 확률분해 순서만 표본 추출해 여러 방향의 문맥을 학습한다. 예측 대상의 내용을 숨기기 위해 query stream과 content stream을 분리하고 Transformer-XL의 상대 위치 표현과 recurrence를 결합했다. RoBERTa는 BERT 구조를 유지하면서 data·batch·학습량·mask 생성·NSP·입력 sequence 구성을 체계적으로 다시 실험했다. 그 결과 BERT 계열 성능 차이의 상당 부분이 architecture가 아니라 training recipe에서 올 수 있음을 보였다. ALBERT는 어휘 embedding을 작은 차원으로 분해한 뒤 hidden dimension으로 projection하고, 여러 layer에서 같은 block 매개변수를 공유했다. 또한 문장 인접성보다 담화 일관성을 겨냥한 sentence order prediction을 사용했다. 세 모델은 하나의 직선 계보라기보다 서로 다른 병목을 겨냥한 동시대 비교 실험으로 읽는 편이 정확하다.

- 무엇을 다루는가: permutation LM, two-stream attention, dynamic masking, NSP 제거, factorized embedding, cross-layer sharing, SOP
- 어떤 문제를 해결하려 했는가: BERT objective의 불일치, 미최적화된 훈련 조건, 매개변수 memory 증가
- 어떤 방식이 새로웠는가: 목표·recipe·parameterization을 각각 분리해 바꾸고 ablation으로 효과를 비교했다.
- 결과적으로 무엇을 바꾸었는가: 사전 학습 모델을 평가할 때 구조뿐 아니라 data와 계산량, parameter count와 FLOPs를 따로 보게 했다.

## 3. 역사적 배경

2018년 BERT는 양쪽 문맥을 사용하는 encoder 사전 학습과 간단한 task-specific fine-tuning의 효과를 보였다. 곧이어 연구 관심은 BERT의 성공을 재현하는 데서 어떤 구성 요소가 꼭 필요하고 어디에 개선 여지가 있는지를 밝히는 쪽으로 옮겨 갔다. 2019년 XLNet과 RoBERTa, 2019년 공개되어 ICLR 2020에 발표된 ALBERT는 이 질문에 서로 다른 답을 제시했다.

- 이전 접근법: BERT의 masked language modeling과 next sentence prediction, layer별 독립 매개변수
- 당시의 한계: `[MASK]` 입력 불일치, 여러 masked target의 독립 예측, data·batch·sequence 구성에 대한 불충분한 탐색, embedding과 layer 매개변수 증가
- 이 주제가 필요했던 이유: benchmark 향상이 새로운 구조에서 왔는지, 더 많은 data·compute나 더 나은 훈련 recipe에서 왔는지 구분해야 했다.

## 4. 핵심 개념 해설

### 4.1 XLNet의 permutation language modeling

XLNet이 순열하는 것은 문장 안 token의 물리적 순서가 아니라 결합확률을 조건부 확률의 곱으로 나누는 순서다. 자연어 위치는 그대로 보존된다. 특정 순열에서 target은 그 순열상 앞선 token의 내용에만 조건화되며, 여러 factorization order를 표본 추출함으로써 같은 위치가 왼쪽과 오른쪽 문맥을 모두 활용할 기회를 얻는다.

target 위치는 알아야 하지만 target 내용은 보면 안 된다. content stream은 이미 공개된 token의 내용과 위치를 처리하고, query stream은 target 위치 정보만 이용한다. fine-tuning에서는 query stream을 버리고 content stream을 사용한다. 이 구분 없이 “단어 순서를 무작위로 섞어 예측한다”고 이해하면 XLNet의 핵심을 놓친다.

### 4.2 RoBERTa의 통제된 training recipe

RoBERTa의 핵심은 단순히 “BERT를 오래 훈련했다”가 아니다. 원 논문은 static 대 dynamic masking, NSP 유무와 segment 구성, batch 크기, data 규모를 차례로 비교한다. 최종 모델은 BERT보다 step 수가 적은 50만 step이지만 batch가 훨씬 커서 더 많은 sequence를 처리했다. dynamic masking의 이득은 과제별로 혼재했고 논문 표현도 “비슷하거나 약간 우수”에 가깝다. 따라서 각 변경의 효과와 더 많은 data·compute의 효과를 한 덩어리로 읽지 않아야 한다.

### 4.3 ALBERT의 factorization과 sharing

BERT의 어휘 embedding은 대략 $O(VH)$만큼 늘어난다. ALBERT는 작은 embedding 차원 $E$를 두어 이를 $O(VE+EH)$로 분해한다. 이어 여러 Transformer layer가 같은 attention·feedforward block 매개변수를 재사용한다. 이로써 parameter count와 저장 memory는 크게 줄지만 같은 깊이만큼 block을 반복 계산하므로 FLOPs와 latency까지 같은 비율로 줄지는 않는다.

ALBERT의 SOP는 연속한 두 segment의 순서를 절반의 예에서 뒤집고 원래 순서인지 맞히게 한다. BERT NSP의 negative가 주제 자체가 다른 문장인 경우가 많아 topic 구분으로 풀릴 수 있다는 비판에 대응해, 같은 문서 안 문장의 담화 순서를 보게 한 것이다.

## 5. 원문의 논리 구조

원문은 BERT의 한계를 objective·training·parameter 세 범주로 나눈다. 이어 XLNet·RoBERTa·ALBERT를 각 범주의 대표 해법으로 대응시키고, benchmark와 응용상의 영향을 서술한다. 마지막에는 계산 비용·표현 capacity·긴 문맥·생성의 한계를 묶고 후속 Transformer 연구에 남긴 유산을 평가한다.

1. BERT 이후 개선이 필요했던 세 병목을 제시한다.
2. XLNet의 factorization order와 two-stream attention을 설명한다.
3. RoBERTa의 data·mask·NSP·hyperparameter 실험을 설명한다.
4. ALBERT의 embedding factorization·layer sharing·SOP를 설명한다.
5. 세 접근의 응용·한계·후속 의미를 비교한다.

## 6. 왜 중요한가

이 세 연구를 함께 읽으면 “더 좋은 모델”이라는 한 축을 세 개의 독립적인 설계 질문으로 분해할 수 있다. 같은 benchmark 점수 향상도 목표 함수의 변화, 더 많은 data와 compute, 매개변수 재사용에서 각각 올 수 있다. 이 구분은 모델 크기만 보고 효율성을 판단하거나, 훈련 예산 차이를 architecture의 우수성으로 오인하는 일을 줄여 준다.

특히 중요한 점:

- XLNet은 bidirectional context와 autoregressive factorization을 양자택일로만 볼 필요가 없음을 보였다.
- RoBERTa는 강한 baseline을 충분히 훈련하고 ablation하는 일이 새 구조 제안만큼 중요함을 보였다.
- ALBERT는 parameter count, activation memory, training FLOPs, inference latency가 서로 다른 효율성 지표임을 드러냈다.

## 7. 현대 LLM과의 연결

현대 LLM에서도 objective·recipe·efficiency라는 세 축은 그대로 남아 있다. causal LM·span corruption·denoising 같은 objective를 비교할 때는 target 조건화가 무엇인지 봐야 한다. data mixture, batch, token 수, optimizer와 schedule을 공개하지 않으면 architecture만 공정하게 비교할 수 없다. parameter sharing·factorization·low-rank 기법을 평가할 때도 저장 용량과 실제 처리량을 구분해야 한다.

- 사전 학습 목표: XLNet은 “어떤 정보를 보고 어떤 token을 예측하는가”가 representation 성질을 바꾼다는 사례다.
- scaling recipe: RoBERTa는 step 수보다 총 token·batch·data 다양성과 통제된 비교가 중요하다는 선례다.
- 모델 효율화: ALBERT는 적은 parameter가 곧 적은 연산이나 빠른 inference를 뜻하지 않는다는 비교 기준을 제공한다.

## 8. 한계와 비판적 관점

원문은 세 연구를 이해하기 좋은 비교 틀로 묶었지만, 원 논문과 대조하면 다음 대목은 그대로 사실로 받아들여서는 안 된다.

- BERT는 사전 학습 중 “실제 단어를 전혀 보지 않는” 모델이 아니다. 예측 대상으로 뽑은 15% 가운데 80%만 `[MASK]`로 바꾸고, 10%는 임의 token, 10%는 원 token을 유지한다.
- XLNet은 입력 token을 순열로 재배열하지 않는다. 또한 원문의 `[3, 1, 5, 2, 4]` 예시는 여섯 단어 문장과 길이가 맞지 않고, 첫 target이 나머지 모든 token 내용을 본다는 설명도 자기회귀 조건화와 맞지 않는다.
- RoBERTa의 최종 50만 step은 BERT의 100만 step보다 적다. 큰 batch로 처리한 총 sequence가 많다는 뜻이며, 논문은 완전 수렴을 주장하지 않는다.
- dynamic masking은 static masking보다 압도적으로 낫지 않았다. 원 논문 표에서는 비슷하거나 약간 우수했고, BERT도 하나의 mask만 영구 반복한 것이 아니라 미리 만든 열 개 pattern을 순환했다.
- ALBERT-base 12M과 ALBERT-large 18M이 같은 조건에서 각각 BERT-base와 BERT-large의 성능을 맞추거나 넘었다는 원문 서술은 틀리다. 해당 비교 표에서는 더 낮았고, BERT-large를 넘은 것은 ALBERT-xxlarge 235M이었다.
- 세 모델은 정적 embedding을 출력하지 않는다. 모두 입력 문맥에 따라 달라지는 contextual representation을 만든다. RoBERTa·ALBERT는 encoder 계열이지만 XLNet까지 같은 encoder-only 구조로 묶기도 어렵다.
- ALBERT의 적은 parameter는 저장 memory 이점은 주지만 mobile·edge에서 더 빠르게 동작한다는 직접 증거는 아니다. 원 논문은 ALBERT-xxlarge의 처리 속도가 BERT-large보다 느릴 수 있음을 보고한다.

역사적 영향도 신중히 써야 한다. production 채택이나 T5·GPT-3에 대한 직접 영향은 후속 문헌의 명시적 인용과 설계 설명이 있어야 입증된다. 이 자료만으로는 동시대에 제시된 세 개선 축과 benchmark 결과까지가 가장 단단한 결론이다.

## 9. 용어 정리

| 용어 | 설명 |
|---|---|
| factorization order | 결합확률을 조건부 확률의 곱으로 전개할 때 token을 예측하는 순서 |
| permutation LM | 여러 factorization order를 표본 추출해 양쪽 문맥을 학습하는 XLNet의 objective |
| two-stream attention | target 내용 누출을 막기 위해 query와 content 표현을 나누는 attention |
| dynamic masking | sequence를 제시할 때마다 다른 MLM target·치환 pattern을 만드는 방식 |
| factorized embedding | 작은 $E$ 차원 어휘 embedding을 $H$ 차원 hidden state로 projection하는 구조 |
| cross-layer sharing | 여러 깊이의 Transformer block에서 같은 매개변수를 반복 사용하는 방식 |
| sentence order prediction | 같은 문서의 두 segment가 원래 순서인지 뒤집혔는지 맞히는 ALBERT objective |

## 10. 함께 보면 좋은 항목

- [[057_BERT Bidirectional Pretraining Revolutionizes Language Understanding]]
- [[058_GPT-1 & GPT-2 Autoregressive Pretraining and Transfer Learning]]
- [[059_GLUE and SuperGLUE Standardized Evaluation for Language Understanding]]
- [[063_Transformer-XL Extending Transformers to Long Sequences]]

## 11. 읽고 생각해볼 질문

1. XLNet은 입력 순서를 그대로 두면서 어떻게 오른쪽 문맥을 조건으로 사용할 수 있는가?
2. RoBERTa와 BERT를 공정하게 비교하려면 architecture 외에 어떤 훈련 예산을 맞춰야 하는가?
3. ALBERT의 parameter 수가 줄어도 FLOPs와 latency가 같은 비율로 줄지 않는 이유는 무엇인가?
4. benchmark 향상을 objective·data·compute·parameterization의 기여로 분해하려면 어떤 ablation이 필요한가?

## 12. 짧은 결론

XLNet·RoBERTa·ALBERT는 BERT 이후의 발전을 하나의 “더 큰 모델” 이야기로 환원할 수 없게 했다. XLNet은 조건화 순서를, RoBERTa는 훈련 통제를, ALBERT는 매개변수 배치를 다시 물었다. 세 모델을 함께 읽을 때 가장 재사용하기 좋은 교훈은 점수보다 비교 설계다. 무엇을 바꿨고, 무엇을 고정했으며, parameter·data·compute 가운데 어느 비용으로 성능을 얻었는지를 분리해야 한다.
