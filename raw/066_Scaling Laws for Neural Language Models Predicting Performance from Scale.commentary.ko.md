---
source_file: "065_Scaling Laws for Neural Language Models Predicting Performance from Scale.md"
translation_file: "065_Scaling Laws for Neural Language Models Predicting Performance from Scale.ko.md"
commentary_type: "해설"
source_stem: "065_Scaling Laws for Neural Language Models Predicting Performance from Scale"
order_prefix: "065"
topic: "신경 언어 모델 스케일링 법칙"
period: "2020"
tags:
  - LLM
  - NLP
  - AI-history
  - commentary
---

<!-- Obsidian note: frontmatter와 링크 대상을 확인한 학습용 해설입니다. -->

# 신경 언어 모델 스케일링 법칙 해설

## 1. 한눈에 보기

- 핵심 주제: decoder-only Transformer의 교차엔트로피 손실이 매개변수 수, 데이터 token 수, 최적화된 학습 compute와 어떤 경험적 power law를 이루는지 측정한 2020년 연구
- 등장 배경: 더 큰 언어 모델이 대체로 더 낮은 손실을 보였지만, 규모를 늘릴 때 어느 축에 자원을 배분해야 하는지 정량적으로 예측하기 어려웠다.
- 가장 중요한 아이디어: 다른 병목이 충분히 풀린 조건에서 손실을 각각 $N$, $D$, $C_{min}$의 거듭제곱 함수로 맞추고, 고정 compute 안의 모델 크기·batch·학습 step·처리 데이터 배분을 추정한다.
- 읽을 때의 핵심 경계: 이 논문이 직접 예측한 것은 WebText2 계열 자료의 token 교차엔트로피 손실이지, 모든 downstream 능력·사실성·안전성·지능이 아니다.

> 이 문서는 `065_Scaling Laws for Neural Language Models Predicting Performance from Scale.md`의 번역문을 이해하기 위한 해설입니다. 원문의 서사를 반복하기보다 Kaplan 등의 실제 실험 범위, 조건부 수식, 2022년 Chinchilla 연구가 수정한 지점을 중심으로 설명합니다.

## 2. 핵심 요약

Kaplan 등은 768개에서 15억 개까지의 비임베딩 매개변수, 2,200만에서 230억 token까지의 데이터, 여러 학습 compute 조건을 변화시키며 자기회귀 Transformer의 test cross-entropy를 측정했다. 다른 축이 병목이 아닐 때 손실은 모델 크기 $N$, 데이터 크기 $D$, 최적으로 배분한 compute $C_{min}$에 대해 매끄러운 power law로 근사됐다. 예를 들어 모델 크기 지수는 약 $0.076$이어서 $N$을 두 배로 늘리면 해당 조건의 손실은 약 $2^{-0.076}\approx0.95$배가 된다. 이는 일정한 양의 손실이 줄거나 모든 능력이 5% 좋아진다는 뜻이 아니다.

이 연구는 고정 compute 배분도 명시적으로 다뤘다. Kaplan fit은 compute가 늘 때 모델 크기를 대략 $C^{0.73}$, 처리 데이터량을 $C^{0.27}$로 키우며 큰 모델을 수렴 전에 멈추는 방식을 제안했다. 2022년 Hoffmann 등의 Chinchilla 연구는 같은 질문을 더 넓은 model–token 조합으로 다시 추정해 두 축을 각각 대략 $C^{0.5}$로 늘리는 결론을 냈다. 따라서 Chinchilla는 Kaplan 연구가 비워 둔 문제를 처음 푼 것이 아니라, 그 답을 실증적으로 크게 수정한 연구다.

## 3. 역사적 배경

GPT-2와 BERT가 보여 준 규모 효과 뒤에는 “큰 모델이 왜, 얼마나 좋아지는가”라는 계획 문제가 있었다. Kaplan 등의 공헌은 규모 확대가 항상 이롭다는 구호가 아니라, 여러 크기의 모델과 데이터 subset을 실제로 학습해 손실 곡선을 하나의 정량적 비교틀에 놓은 데 있다.

실험은 WebText를 확장한 WebText2, 50,257개 BPE 어휘, 대체로 1,024-token 문맥, decoder-only Transformer를 중심으로 했다. LSTM과 recurrent Transformer도 일부 비교했지만 수식의 주된 계수는 이 자료·tokenization·학습 절차에 맞춰진 값이다. 저자들 역시 정확한 scale 상수에는 보편적 의미가 없고, 어떤 결과가 언어 자료의 구조에 의존하는지 알지 못한다고 적었다.

## 4. 핵심 개념 해설

### 세 가지 규모 축

- $N$: 어휘·위치 embedding을 제외한 model parameter 수
- $D$: 학습 dataset의 token 수
- $C$: 대략 $6NBS$로 추정한 비임베딩 학습 FLOP. $B$는 batch token 수, $S$는 parameter update 수다.
- $C_{min}$: 특정 손실에 도달할 때 batch 비효율을 보정한 최소 compute 추정치

### 병목이 없는 조건

$L(N)$을 측정하려면 데이터와 compute가 충분해야 하고, $L(D)$를 측정하려면 모델 용량과 최적화가 병목이 아니어야 한다. 한 축을 고정한 채 다른 축만 계속 늘리면 손실은 같은 power law를 무한히 따르지 않고 수익 체감이나 overfitting 영역에 들어간다. 그러므로 세 개의 단변량 곡선을 아무 조건 없이 동시에 적용해서는 안 된다.

### power law와 수익 체감

$L\propto X^{-\alpha}$에서 $X$를 같은 비율로 늘릴 때 손실은 같은 비율만큼 곱해진다. 그러나 같은 절대량의 손실을 더 줄이는 데 필요한 자원은 계속 커진다. 원 논문도 power law가 규모 증가에 따른 diminishing returns를 뜻하며, 손실이 0이 되기 전에 곡선은 결국 평탄해져야 한다고 밝혔다.

## 5. 원문의 논리 구조

원문 설명 자료는 먼저 규모 확대 이전의 불확실성을 제시하고, 이어 Kaplan 연구의 power law와 resource allocation을 해결책으로 설명한다. 다음으로 GPT-3와 후대 모델에 끼친 영향, 한계, Chinchilla의 수정을 다룬다. 큰 흐름은 이해하기 쉽지만 몇 군데에서 원 논문의 측정 대상보다 넓은 ‘능력 예측’과 산업적 영향으로 점프한다.

원 논문의 실제 논리는 더 좁고 단계적이다. 먼저 모델 shape보다 비임베딩 parameter 수가 손실과 더 안정적으로 연결되는지 본다. 다음으로 $N$·$D$·학습 시간의 결합식을 맞추고 overfitting과 early stopping을 설명한다. 그 뒤 fixed compute에서 어떤 모델 크기와 학습 step이 손실을 최소화하는지 유도한다. 마지막 discussion과 caveat에서는 이 관계의 이론이 없고, 다른 domain과 실제 language task로의 일반화가 미확인임을 분명히 남긴다.

## 6. 왜 중요한가

첫째, 최고 성능 model 하나만 보고 비교하는 대신 여러 scale의 learning curve를 측정하는 연구 관행을 강화했다. 작은 pilot run에서 얻은 경향을 큰 run 계획에 활용할 수 있다는 가능성을 보여 주었다.

둘째, parameter 수·token 수·compute를 하나의 ‘규모’로 뭉개지 않았다. 같은 compute라도 지나치게 작은 모델을 오래 학습하거나 지나치게 큰 모델에 데이터가 부족하면 다른 결과가 나온다. 최적 배분은 목표 loss, hardware 병렬성, inference 비용, 데이터 가용성 같은 제약과 함께 읽어야 한다.

셋째, smooth loss scaling과 qualitative capability를 구분할 질문을 만들었다. 저자들은 매끄러운 평균 손실 변화가 특정 능력의 불연속적으로 보이는 변화를 가릴 수 있다고 제안했지만, 그 능력의 출현 시점과 안전성을 이 논문에서 직접 측정하지는 않았다.

## 7. 현대 LLM과의 연결

GPT-3 논문은 Kaplan 연구를 인용해 1억 2,500만에서 1,750억 parameter까지 여러 크기를 학습했고, validation loss의 power law가 두 자릿수 규모만큼 더 이어지는지를 검사했다. 이는 2020 scaling law가 실제 대규모 run 설계에 사용된 직접 사례다. 다만 “법칙이 정확히 1,750억이라는 숫자를 결정했다”거나 모든 GPT-3 downstream 결과를 미리 예측했다고 단정할 근거는 별도로 필요하다.

Chinchilla 연구는 compute-optimal allocation을 다시 측정해 Kaplan보다 훨씬 많은 token을 권했다. 같은 학습 compute라면 더 작은 70B 모델을 1.4T token으로 학습한 Chinchilla가 280B Gopher보다 강한 결과를 보였다. 이 차이는 scaling law가 자연 상수라기보다 모델·자료·schedule·fit 범위에 민감한 경험 모델임을 보여 준다.

이후 LLM 개발에서도 작은 scale의 loss curve, iso-compute 실험, data mixture와 token budget을 함께 비교하는 방식이 중요해졌다. 그러나 architecture 변경, data quality, context length, optimizer와 post-training이 달라지면 기존 지수를 그대로 복사할 수 없다.

## 8. 한계와 비판적 관점

- 설명 자료의 `768 thousand`는 원 논문과 다르다. 실험 범위의 최솟값은 768개의 비임베딩 parameter다.
- Kaplan 연구는 QA·reading comprehension 같은 downstream benchmark 성능이 loss에서 예측된다고 직접 실험하지 않았다. 다른 text distribution의 test loss가 WebText2 loss와 함께 개선되는지를 보았고, 실제 language task 전이는 후속 조사 과제로 남겼다.
- “architecture와 dataset에 무관한 근본 법칙”이라는 표현은 과장이다. 주된 fit은 특정 Transformer·WebText2·BPE·context와 optimizer 조건에서 얻었고 universality를 위한 이론도 없었다.
- fixed compute의 $N$–$D$ 균형을 다루지 않았다는 설명은 틀리다. 논문 §6과 appendix가 바로 그 문제를 분석했다.
- power law가 diminishing returns나 한계를 부정한다는 해석도 틀리다. 거듭제곱 지수가 작을수록 같은 추가 개선에 훨씬 더 큰 자원이 필요하다.
- GPT-3·PaLM·GPT-4의 구체적 크기와 성공이 이 법칙 하나에서 직접 결정됐다는 계보, 개별 조직의 광범위한 채택, 실패 run의 수백만 달러 비용은 각각 별도 근거가 필요하다.
- 낮은 token loss는 bias·사실성·안전성·controllability를 보장하지 않는다. 이 속성들은 별도의 dataset, protocol과 metric으로 평가해야 한다.

## 9. 용어 정리

| 용어 | 뜻 |
|---|---|
| scaling law | 관측한 규모 변수와 loss 사이를 근사하는 경험적 함수 관계 |
| power law | 한 양이 다른 양의 거듭제곱에 비례하는 관계 |
| cross-entropy loss | 정답 token에 model이 부여한 probability를 이용한 자기회귀 예측 손실 |
| non-embedding parameters | 어휘·위치 embedding을 제외해 센 model의 나머지 학습 parameter |
| compute-optimal | 주어진 학습 compute에서 목표 loss를 가장 낮추도록 model·data·step을 배분한 조건 |
| early stopping | 더 학습할 때 얻는 이득보다 compute나 overfitting 비용이 커지기 전에 학습을 멈추는 절차 |
| sample efficiency | 같은 성능 또는 loss에 도달하는 데 필요한 학습 example·token 수가 적은 정도 |
| extrapolation | 관측한 scale 범위 밖으로 fitted curve를 연장해 값을 추정하는 일 |

## 10. 함께 보면 좋은 항목

- [[035_Neural Probabilistic Language Model - Distributed Word Representations and Neural Language Modeling]]
- [[054_The Transformer Attention Is All You Need]]
- [[058_GPT-1 & GPT-2 Autoregressive Pretraining and Transfer Learning]]
- [[060_XLNet, RoBERTa, ALBERT Refining BERT with Permutation Modeling, Training Optimization, and Parameter Efficiency]]
- [[066_GPT-3 and In-Context Learning Emergent Capabilities from Scale]]
- [[077_Chinchilla Scaling Laws Compute-Optimal Training and Resource Allocation for Large Language Models]]

먼저 신경 언어 모델의 loss가 무엇인지 확인하고, Transformer와 GPT-2의 구조를 거친 뒤 GPT-3와 Chinchilla를 읽으면 ‘크게 만들기’와 ‘compute 안에서 제대로 학습하기’의 차이가 선명해진다.

## 11. 읽고 생각해볼 질문

1. $L(N)$을 측정할 때 데이터와 compute가 병목이면 순수한 parameter scaling law를 얻기 어려운 이유는 무엇인가?
2. parameter를 두 배로 늘릴 때 loss가 약 0.95배가 된다는 결과를 downstream 정확도 5%p 상승으로 바꿔 말할 수 없는 이유는 무엇인가?
3. Kaplan의 $N_{opt}\propto C^{0.73}$과 Chinchilla의 대략 $N_{opt}\propto C^{0.5}$가 다른 사실은 scaling law의 어떤 성격을 보여 주는가?
4. training compute가 같아도 inference 횟수가 많을 때 더 작은 compute-optimal model이 유리할 수 있는 이유는 무엇인가?

## 12. 짧은 결론

2020년 scaling law의 유산은 미래 능력을 보장하는 공식이 아니라, 언어 모델의 loss·parameter·data·compute를 같은 실험 좌표계에서 비교한 데 있다. Kaplan 등의 fit은 주어진 범위에서 놀랄 만큼 매끄러웠고 fixed compute 배분까지 제안했지만, downstream 능력과 보편 법칙을 입증하지는 않았다. Chinchilla가 최적 token 배분을 크게 수정한 사실은 scaling law를 영구적인 정답이 아니라 가정·측정 범위·자료를 명시해 계속 재추정해야 하는 경험 모델로 읽어야 함을 보여 준다.
