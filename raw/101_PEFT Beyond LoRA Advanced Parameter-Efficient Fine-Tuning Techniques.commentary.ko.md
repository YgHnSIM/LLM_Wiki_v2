---
source_file: "101_PEFT Beyond LoRA Advanced Parameter-Efficient Fine-Tuning Techniques.md"
translation_file: "101_PEFT Beyond LoRA Advanced Parameter-Efficient Fine-Tuning Techniques.ko.md"
commentary_type: "해설"
source_stem: "101_PEFT Beyond LoRA Advanced Parameter-Efficient Fine-Tuning Techniques"
order_prefix: "101"
topic: "LoRA 이후 PEFT의 다섯 설계 축"
period: "2021–2025"
tags:
  - LLM
  - NLP
  - AI-history
  - commentary
  - PEFT
  - LoRA
  - model-adaptation
---

# LoRA 이후 PEFT의 다섯 설계 축 해설

## 1. 한눈에 보기

- 핵심 주제: LoRA의 저순위 업데이트를 그대로 키우는 대신, **랭크 배분·가중치 매개변수화·기저 공유·랭크 스케일링·양자화 초기화**를 각각 바꾸는 PEFT 방법들
- 등장 배경: 큰 사전 학습 모델을 동결하고 작은 업데이트만 학습하는 LoRA가 널리 쓰이면서, 같은 trainable-parameter budget을 어디에 어떻게 쓸지가 별도 연구 문제가 된 시기
- 가장 중요한 아이디어: AdaLoRA, DoRA, VeRA, rsLoRA와 LoftQ는 하나의 직선적 후속 세대가 아니라 서로 다른 병목을 다루는 방법이다.
- 이후 LLM/NLP에 남긴 영향: “학습 매개변수가 몇 개인가”뿐 아니라 어느 행렬에 어떤 랭크와 기저를 배치하고, base weight를 어떤 표현으로 저장하며, 학습 뒤 무엇을 병합할 수 있는지를 함께 비교하게 했다.

> 이 문서는 **101_PEFT Beyond LoRA Advanced Parameter-Efficient Fine-Tuning Techniques.md**의 번역문을 이해하기 위한 해설입니다. 원 웹글은 2025년 9월에 공개됐고 여러 방법을 “2024년에 등장한 고급 PEFT”로 묶지만, AdaLoRA는 ICLR 2023이며 VeRA·LoftQ·rsLoRA도 2023년에 처음 공개됐습니다. 여기서는 2023–2024년의 실제 연표와 각 논문의 계산 경계를 복원해 읽습니다.

## 2. 핵심 요약

LoRA는 사전 학습 가중치 \(W_0\)를 동결하고 저순위 행렬 \(B,A\)만 학습해 \(\Delta W=BA\)를 더한다. 이 구조는 전체 미세 조정보다 trainable parameter와 optimizer state를 크게 줄이고, 학습이 끝난 뒤 업데이트를 base weight에 병합할 수 있다는 장점이 있다. 그러나 “저순위 업데이트”라는 큰 틀 안에도 적어도 네 가지 선택이 남는다. 어느 weight matrix를 대상으로 삼을지, rank를 층마다 어떻게 배분할지, low-rank factor 자체를 학습할지 공유할지, 그리고 update가 학습 중 안정적인 크기를 유지하도록 어떻게 scale할지다.

AdaLoRA는 고정된 총 budget 안에서 중요한 singular triplet에 rank를 재배분한다. DoRA는 사전 학습 weight 자체를 열별 magnitude와 unit direction으로 분해하고, magnitude는 직접 학습하며 direction 쪽에 LoRA update를 적용한다. VeRA는 모든 대상 층에서 한 쌍의 frozen random low-rank matrix를 공유하고 층별 두 scaling vector만 학습한다. rsLoRA는 rank가 커질 때 표준 \(\alpha/r\) scaling으로 gradient가 약해지는 문제를 \(\alpha/\sqrt r\)로 바꾼다. LoftQ는 양자화된 base와 low-rank residual이 원래 weight를 잘 근사하도록 미세 조정 전 초기화를 번갈아 최적화한다.

따라서 이 방법들의 관계는 “LoRA보다 더 고급인 하나의 기법”이 아니다.

- AdaLoRA: 제한된 rank budget을 **어디에 배치하는가**
- DoRA: weight를 **어떤 좌표계로 매개변수화하는가**
- VeRA: low-rank basis를 **어디까지 공유하는가**
- rsLoRA: rank 변화에 따라 update와 gradient를 **어떻게 scale하는가**
- LoftQ: 양자화 오차를 low-rank adapter가 다룰 수 있도록 **어떻게 초기화하는가**

실험 결과도 같은 model·dataset·rank·target module·precision 안에서 읽어야 한다. Trainable parameter가 줄었다고 전체 GPU memory·학습 시간·추론 지연이 같은 비율로 줄어드는 것은 아니며, 알고리즘 benchmark가 산업 배포·비용 절감·환경 효과를 직접 입증하지도 않는다.

## 3. 역사적 배경

2021년 공개되고 ICLR 2022에 실린 LoRA는 Transformer의 선택된 weight matrix에 작은 low-rank update를 붙이는 방법을 제시했다. 원 논문의 대표 설정은 attention의 query와 value projection을 대상으로 삼았고, 모든 layer·matrix를 반드시 같은 방식으로 갱신하도록 강제하지 않았다. 따라서 원 웹글의 “LoRA는 모든 층에 같은 용량을 준다”는 문장은 실무에서 여러 target module에 같은 rank를 반복 적용하는 흔한 구성으로 좁혀야 한다.

AdaLoRA는 2023년 2월 ICLR에 공개된 연구다. Georgia Tech·Princeton·Microsoft 연구진은 singular-value-decomposition형 update와 중요도 점수를 사용해 총 parameter budget을 구성 요소별로 재배분했다. 이는 2024년에 Microsoft가 단독으로 발표한 방법이 아니다.

VeRA와 LoftQ는 각각 2023년 10월 17일과 10월 12일 arXiv에 처음 공개됐고 ICLR 2024에 채택됐다. rsLoRA도 2023년 11월 28일 공개됐다. DoRA는 2024년 2월 14일 처음 공개돼 ICML 2024 oral 논문이 됐다. 그러므로 2024년은 이 모든 아이디어의 발명 연도라기보다 여러 LoRA 변형이 주요 학회와 도구 생태계에서 함께 가시화된 시기로 설명하는 편이 정확하다.

원 웹글은 2025년 9월 13일에 이 흐름을 회고했다. 회고문이 방법들을 하나의 시대적 묶음으로 설명하는 것은 유용하지만, 최초 공개일·학회 발표일·후대 확산을 구분하지 않으면 기술 계보와 인과를 잘못 읽게 된다.

## 4. 핵심 개념 해설

### AdaLoRA: 총 rank budget의 재배분

AdaLoRA는 update를 SVD형으로 매개변수화한다.

\[
\Delta W=P\Lambda Q
\]

\(\Lambda\)의 각 원소와 대응하는 \(P,Q\)의 열·행을 하나의 singular triplet으로 보고 중요도를 계산한다. 주 방법의 민감도는 단순 gradient magnitude가 아니라 \(\lvert w\nabla_w\mathcal{L}\rvert\)에 지수 이동 평균과 변동성 정보를 결합한 값이며, triplet 전체의 중요도를 집계한다. 높은 초기 budget에서 시작해 warm-up 뒤 cubic schedule로 총 budget을 최종 목표까지 줄인다. Mask된 triplet이 다시 선택될 수는 있지만 총 rank가 계속 자유롭게 증가하는 방식은 아니다.

반복해서 정확한 SVD를 계산하는 것도 아니다. SVD와 닮은 factorization을 직접 학습하고 orthogonality regularization으로 \(P,Q\)의 성질을 유도한다. DeBERTaV3-base GLUE 실험에서 AdaLoRA는 1.27M trainable parameter로 평균 89.31, LoRA는 1.33M으로 88.34를 보고했다. 이는 해당 task·model·budget에서 adaptive allocation이 이득을 보인 결과이지 모든 architecture의 층 중요도를 보편적으로 알아낸다는 보장은 아니다.

### DoRA: magnitude와 direction의 분리

DoRA가 분해하는 대상은 “update만”이 아니라 사전 학습 weight matrix 자체다. 열별 norm을 magnitude \(m\), 정규화한 행렬을 direction \(V/\lVert V\rVert_c\)로 나타내고 direction에 저순위 update를 붙인다.

\[
W'=m\frac{W_0+BA}{\lVert W_0+BA\rVert_c}
\]

Magnitude vector는 직접 학습하고 \(B,A\)가 direction 변화를 담당한다. DoRA 논문의 분석은 LoRA가 원래 direction만 바꾼다고 결론 내리지 않는다. 오히려 LoRA에서는 magnitude 변화와 direction 변화가 full fine-tuning과 다른 상관 패턴을 보였고, DoRA가 두 성분을 명시적으로 분리해 학습 동역학을 full fine-tuning에 더 가깝게 만들 수 있다는 가설을 제시했다.

LLaMA-7B의 8개 commonsense reasoning task에서 LoRA 평균은 74.7, 같은 비교표의 DoRA는 78.4였다. 그러나 법률·의료·과학 문헌에서 특별한 이득을 입증한 실험은 아니다. 학습 중 정규화와 계산 graph의 추가 비용은 있지만, 학습 뒤 weight를 병합할 수 있어 논문은 추가 inference latency가 없다고 명시한다.

### VeRA: 공유 random basis와 두 scaling vector

VeRA는 layer마다 \(B,A\) 전체를 학습하는 대신 동일 shape을 가진 층에서 frozen random matrix 한 쌍을 공유한다.

\[
\Delta W=\Lambda_b B\Lambda_d A
\]

\(B,A\)는 공유되고 동결되며, 각 layer는 두 trainable scaling vector \(b,d\)를 가진다. 한 벡터만 쓰는 원 웹글의 식은 불완전하다. 두 vector 중 하나를 제거하는 ablation에서도 성능이 크게 떨어졌으므로 행과 중간 rank 방향을 각각 scale한다는 구조가 중요하다.

RoBERTa-large GLUE 평균에서 VeRA 61K parameter와 LoRA 800K parameter가 모두 87.8을 기록했지만, RoBERTa-base에서는 VeRA 85.2와 LoRA 86.6으로 차이가 있었다. LLaMA-7B rank 64 비교에서 trainable parameter는 약 100배 줄었어도 학습 시간은 578분과 568분, GPU memory는 21.69GB와 23.42GB였다. Adapter parameter 수, activation·base weight memory와 wall-clock을 분리해야 하는 이유다.

### rsLoRA: rank에 따른 scaling

표준 LoRA는 흔히 update에 \(\alpha/r\)을 곱한다. rsLoRA 논문은 rank \(r\)가 커질 때 이 scaling 아래에서 gradient와 feature learning이 약해질 수 있음을 분석하고 \(\alpha/\sqrt r\)를 제안했다.

\[
\Delta W_\mathrm{rsLoRA}=\frac{\alpha}{\sqrt r}BA
\]

핵심은 adapter 초기화나 learning rate를 특별히 조정해 effective rank pruning을 막는 것이 아니다. 높은 rank에서 발생하는 gradient/learning collapse를 scaling 법칙으로 다루는 것이다.

### LoftQ: 양자화와 low-rank 초기화의 결합

LoftQ는 원래 weight \(W\)를 양자화 행렬 \(Q\)와 low-rank residual \(AB^\top\)이 함께 근사하도록 초기화한다.

\[
\min_{Q,A,B}\lVert W-Q-AB^\top\rVert_F
\]

Algorithm은 양자화와 residual의 truncated SVD를 번갈아 수행한다. 이것은 미세 조정 내내 quantized backbone과 adapter를 공동 학습한다는 뜻이 아니다. 초기화가 끝난 뒤 quantized backbone은 동결하고 low-rank factor만 fine-tune한다. QLoRA가 일반적으로 실패한다는 대체법이라기보다 낮은 bit 설정에서 quantization residual을 adapter의 시작점에 반영하는 방법이다.

## 5. 원문의 논리 구조

원문은 LoRA가 PEFT의 지배적 접근이 된 뒤 fixed rank, low-rank expressivity, rank selection, layer heterogeneity와 additive update라는 한계가 나타났다고 문제를 설정한다. 이어 AdaLoRA를 layer별 rank allocation, DoRA를 magnitude–direction decomposition, VeRA를 shared random matrix, rsLoRA와 LoftQ를 training dynamics와 quantization의 해법으로 배치한다.

응용 절에서는 연구, 산업 배포와 법률·의료·과학 영역을 연결하고, 한계 절에서는 추가 구현 복잡성·표현력 절충·높은 intrinsic rank를 열거한다. 마지막 절은 이 방법들이 효율 중심 설계와 PEFT method selection을 성숙시켰다고 평가한다.

이 구성의 장점은 “작은 adapter” 안에서도 여러 설계 자유도가 있음을 한눈에 보여 준다는 데 있다. 다만 다음 세 층이 섞여 있다.

1. 논문이 직접 제안하고 실험한 algorithm·benchmark
2. 여러 논문을 함께 읽을 때 가능한 설계 축 비교
3. 산업 도입·비용·환경 영향에 관한 후대 추정

공개 소스 노트를 읽을 때는 1차 논문에서 확인되는 첫째 층과, 비교를 통한 둘째 층, 별도 배포 증거가 필요한 셋째 층을 분리해야 한다.

## 6. 왜 중요한가

PEFT를 trainable parameter 수 하나로 비교하면 실제 비용과 재현 조건을 놓친다. 같은 parameter budget이라도 adapter가 붙는 layer, rank 분포, base precision, activation, optimizer와 추가 normalization에 따라 GPU memory와 시간은 달라진다. 반대로 trainable parameter를 크게 줄이는 VeRA 같은 방법도 frozen base weight와 activation을 그대로 보관해야 하므로 전체 footprint가 같은 비율로 줄지는 않는다.

이 연구군은 “적응 용량”을 더 정밀한 질문으로 바꾸었다.

- 총 rank budget이 같을 때 어느 layer와 singular direction에 배분할 것인가?
- 같은 low-rank parameter 수로 magnitude와 direction 가운데 무엇을 직접 학습할 것인가?
- Layer마다 독립 basis가 필요한가, frozen random basis를 공유해도 되는가?
- Rank가 달라져도 update와 gradient의 scale을 비교 가능하게 유지하는가?
- Quantized base와 adapter의 초기 오차 분담은 어떻게 정하는가?

이 질문들은 method 이름보다 실험 설계를 재사용하기 쉽다. 새 모델에 PEFT를 적용할 때도 target module, rank allocation, parameterization, scaling, quantization initialization을 각각 절제할 수 있기 때문이다.

## 7. 현대 LLM과의 연결

현대 LLM 적응에서는 instruction dataset과 adaptation parameterization을 구분해야 한다. 같은 instruction–response 자료도 full-parameter fine-tuning, LoRA, DoRA, VeRA 또는 QLoRA로 학습할 수 있다. Data가 무엇을 가르치는지와 gradient가 model의 어디를 바꾸는지는 서로 다른 축이다.

QLoRA와 LoftQ도 같은 말이 아니다. QLoRA는 frozen base를 NF4로 저장하고 계산할 때 higher precision으로 역양자화하며 LoRA adapter만 학습하는 전체 memory recipe다. LoftQ는 quantized backbone과 low-rank factor가 원래 weight를 잘 근사하도록 adapter의 시작점을 정하는 초기화 방법이다. 두 방법은 quantization과 low-rank adaptation을 결합하지만 해결 위치가 다르다.

Adapter 배포는 base model의 존재를 없애지 않는다. 작은 adapter 파일을 재현하려면 정확한 base checkpoint, tokenizer, target module, rank·scale, precision, code version과 license가 필요하다. DoRA처럼 최종 weight에 병합 가능한 방법은 inference graph를 단순화할 수 있지만, 여러 task adapter를 동적으로 교체하는 운영 방식에서는 병합 전 artifact 관리가 여전히 중요하다.

또한 benchmark의 우위를 곧바로 생성형 LLM 전체의 품질로 확대하면 안 된다. AdaLoRA의 DeBERTa·SQuAD 결과, VeRA의 GLUE·E2E·MT-Bench, DoRA의 commonsense·vision-language 결과는 각각 다른 architecture, data, metric과 evaluator를 쓴다. 실제 LLM 선택에는 task quality, peak memory, throughput, mergeability, multi-adapter storage와 engineering maturity를 함께 측정해야 한다.

## 8. 한계와 비판적 관점

### 연표와 최초성

AdaLoRA·VeRA·LoftQ·rsLoRA를 모두 2024년에 개발된 방법으로 쓰면 선행 공개를 지운다. 논문 최초 공개일, 학회 개최연도와 원 웹글의 회고 연도를 따로 기록해야 한다.

### LoRA의 “획일성” 범위

LoRA라는 방법 자체가 모든 layer에 같은 rank를 강제하지는 않는다. 다수의 target module에 하나의 rank를 적용하는 흔한 실험 설정이 uniform budget을 만들 뿐이다. 어떤 layer·matrix를 선택했는지 없이 “LoRA는 모든 층을 똑같이 취급한다”고 일반화하지 않는다.

### 성능과 표현력

특정 benchmark에서 LoRA보다 높은 점수를 얻었다는 사실은 모든 domain shift나 높은 intrinsic-rank task에서 우월함을 뜻하지 않는다. 원 LoRA 논문은 오히려 낮은 intrinsic dimension을 탐구했고, 이후 방법들의 실험도 제한된 model·task·budget 안에서 이뤄졌다. “저순위로는 지식을 크게 재구성할 수 없다”는 직관은 별도 비교 실험이 필요한 가설이다.

### 비용 장부

Trainable parameter, optimizer state, frozen base weight, activation, temporary buffer와 wall-clock을 한 숫자로 합치지 않는다. DoRA의 추가 training graph, VeRA의 frozen random basis, AdaLoRA의 importance tracking과 LoftQ의 초기화 반복은 각기 다른 overhead를 만든다. 반면 DoRA의 normalization이 추론 때 반드시 남는다는 원문 주장은 병합 가능한 weight라는 사실과 맞지 않는다.

### 배포와 사회적 영향

원 알고리즘 논문들은 기업 인프라 비용, 다중 고객 운영, 법률·의료·과학 배포, 에너지 소비나 탄소 배출을 조사하지 않았다. Adapter가 작고 GPU memory가 줄 수 있다는 기술 결과에서 비용·접근성·환경 지속 가능성으로 이동하려면 실제 hardware, runtime, 전력, 조직과 품질 보증 자료가 추가로 필요하다.

## 9. 용어 정리

- **PEFT(Parameter-Efficient Fine-Tuning)**: 사전 학습 model의 전부가 아니라 일부 parameter나 새로 추가한 작은 parameter 집합만 학습하는 적응 방법군
- **LoRA**: 동결된 weight에 low-rank factor의 곱을 더하는 PEFT 방법
- **Rank \(r\)**: Low-rank update가 사용할 수 있는 중간 차원의 크기. Parameter 수와 표현 용량을 함께 바꾼다.
- **Target module**: LoRA 계열 adapter를 붙이는 weight matrix. Query·value projection, 모든 linear layer 등 설정에 따라 범위가 다르다.
- **Rank budget**: 여러 layer와 matrix에 배치한 유효 rank의 총량
- **Singular triplet**: 하나의 singular value와 그에 대응하는 좌·우 방향 vector의 묶음
- **Magnitude–direction decomposition**: Weight vector의 norm과 정규화된 방향을 분리해 표현하는 방식
- **Random basis sharing**: 학습하지 않는 random low-rank matrix를 여러 layer가 공유하고 작은 scale만 layer별로 학습하는 방식
- **Rank scaling**: Rank가 바뀔 때 update와 gradient의 크기를 조절하는 계수
- **Quantized backbone**: 낮은 bit 표현으로 저장되고 보통 동결되는 base model weight
- **Adapter initialization**: Fine-tuning을 시작하기 전 low-rank factor의 초기값을 정하는 절차
- **Mergeability**: 학습된 update를 base weight에 합쳐 별도 adapter 연산 없이 추론할 수 있는 성질

## 10. 함께 보면 좋은 항목

- **091_QLoRA Efficient Fine-Tuning of Quantized Language Models.md**: NF4·double quantization·paged optimizer와 low-rank adapter가 training memory의 서로 다른 항목을 줄이는 과정을 설명한다.
- LoRA 원 논문: 저순위 update의 parameterization, target matrix와 merge 가능한 추론 경계를 확인한다.
- AdaLoRA 원 논문: SVD형 parameterization, 중요도 계산, cubic budget schedule과 task별 rank pattern을 확인한다.
- DoRA 원 논문: Weight decomposition 식, magnitude–direction 분석, training optimization과 merge 가능한 inference를 확인한다.
- VeRA 원 논문: 두 scaling vector와 random basis sharing, trainable parameter와 전체 memory·시간의 차이를 확인한다.
- rsLoRA 원 논문: \(\alpha/r\)과 \(\alpha/\sqrt r\) scaling이 high-rank gradient에 미치는 영향을 확인한다.
- LoftQ 원 논문: Quantization과 low-rank approximation을 번갈아 수행하는 초기화 algorithm을 확인한다.

## 11. 읽고 생각해볼 질문

1. Trainable parameter 수가 같은 두 PEFT 방법을 공정하게 비교하려면 target module, base precision, activation memory와 wall-clock 가운데 무엇을 함께 고정하거나 보고해야 할까?
2. AdaLoRA의 importance score가 실제 “layer의 의미적 중요도”가 아니라 현재 loss·data·optimization에 대한 민감도를 측정한다는 차이는 해석에 어떤 제한을 줄까?
3. VeRA처럼 random basis를 공유해도 성능이 유지되는 조건은 task update의 구조에 관해 무엇을 시사하며, 어느 결과가 그 추론을 반박할 수 있을까?
4. DoRA의 magnitude–direction 좌표계와 rsLoRA의 scaling은 서로 독립적으로 결합할 수 있는가? 결합 효과를 검증하려면 어떤 ablation이 필요한가?
5. Adapter가 작다는 사실이 실제 배포 비용·환경 영향·접근성 개선으로 이어졌는지 입증하려면 어떤 운영 자료가 추가로 필요한가?

## 12. 짧은 결론

LoRA 이후 PEFT의 핵심 변화는 더 복잡한 이름의 adapter가 등장했다는 데 있지 않다. 제한된 update를 **어디에 배분하고, 어떤 좌표와 basis로 표현하며, rank와 quantization에 맞춰 어떻게 안정화할지**가 독립적인 설계 문제로 분해됐다는 데 있다.

AdaLoRA, DoRA, VeRA, rsLoRA와 LoftQ는 각각 그 문제의 다른 축을 바꾼다. 따라서 어느 하나를 보편적 후계자로 고르기보다, 같은 base·data·target module·quality metric 아래에서 trainable parameter, 전체 memory, 시간, mergeability와 재현 artifact를 함께 비교해야 한다. 이 구분을 지키면 PEFT를 유행하는 방법 목록이 아니라 검증 가능한 model-adaptation 설계 공간으로 읽을 수 있다.
