---
schema_version: 2
id: source.101
page_type: source
title: LoRA 이후 PEFT 변형의 설계 축과 연표
aliases:
  - PEFT Beyond LoRA
  - AdaLoRA DoRA VeRA rsLoRA LoftQ
  - 고급 매개변수 효율적 미세조정
tags:
  - type/source
  - domain/ai
  - domain/computer-science
  - domain/machine-learning
  - domain/nlp
  - domain/optimization
created: '2026-07-22'
updated: '2026-07-22'
lifecycle: active
verification: verified
artifacts:
  - 'raw/101_PEFT Beyond LoRA Advanced Parameter-Efficient Fine-Tuning Techniques.ko.md'
  - 'raw/101_PEFT Beyond LoRA Advanced Parameter-Efficient Fine-Tuning Techniques.commentary.ko.md'
evidence:
  - source_id: hu-et-al-2022-lora
    locator: '초록과 §§1–4·7, Eqs. 3–4와 Tables 1–7의 동결 base·저순위 update·target matrix·rank 및 추론 병합'
    relation: contextualizes
  - source_id: zhang-et-al-2023-adalora
    locator: 'ICLR 2023, §§1·3.1–3.3, Eqs. 3–13, Algorithm 1, Tables 1–4와 Appendices F–H의 SVD형 triplet·중요도·budget schedule'
    relation: supports
  - source_id: liu-et-al-2024-dora
    locator: 'PMLR 235, §§3.2·4.1–4.3·5·7, Eqs. 2–5, Figures 2–3, Tables 1–4와 Appendix Tables 7·15의 magnitude–direction 분해·성능·overhead·병합'
    relation: supports
  - source_id: kopiczko-et-al-2024-vera
    locator: 'ICLR 2024, Figure 1, §§3.1–3.3·4.1–4.4·5, Eq. 2, Tables 1–7과 Appendix Table 12의 공유 random matrix·두 scaling vector·품질·비용'
    relation: supports
  - source_id: kalajdzievski-2023-rslora
    locator: 'arXiv:2312.03732v1, §§3–4, Theorem 3.2, Figures 2–3과 Appendix B의 rank별 gradient 분석과 alpha/sqrt(r) scaling'
    relation: supports
  - source_id: li-et-al-2024-loftq
    locator: 'ICLR 2024, §§2.3·3.1–3.3·4, Eqs. 4–9, Algorithm 1과 Tables 1–5의 alternating quantization·저순위 초기화·미세조정 경계'
    relation: supports
  - source_id: dettmers-et-al-2023-qlora
    locator: '초록과 §§2–4의 frozen 4-bit base·NF4·LoRA update 및 QLoRA의 양자화·미세조정 경계'
    relation: contextualizes
related:
  - source.091
  - concept.저순위-적응
  - concept.qlora
  - concept.언어-모델-전이-학습
  - concept.지시-미세조정
  - analysis.사전-학습-지식은-과제에-어떻게-도착하는가
---
# LoRA 이후 PEFT 변형의 설계 축과 연표

> [!note] 학습 안내
> **난이도:** 중급<br>
> **선수 지식:** [[언어 모델 전이 학습]], [[QLoRA]]<br>
> **읽고 나면:** AdaLoRA·DoRA·VeRA·rsLoRA·LoftQ가 LoRA의 같은 한계를 순서대로 해결한 단일 계보가 아니라, rank 배분·weight 매개변수화·basis 공유·scaling·양자화 초기화라는 서로 다른 축을 바꾼다는 점을 설명할 수 있다.

## 1단계 — 먼저 잡을 핵심

### 2024년의 한 발명보다 2023–2024년의 설계 분화

Michael Brenndoerfer의 원 웹글은 AdaLoRA, DoRA, VeRA, rsLoRA와 LoftQ를 “2024년에 등장한 고급 PEFT”로 묶는다. 실제 연표는 다르다. arXiv v1 기준 AdaLoRA는 2023년 3월, LoftQ·VeRA는 2023년 10월, rsLoRA는 2023년 11월에 공개됐다. AdaLoRA는 ICLR 2023, LoftQ·VeRA는 ICLR 2024에 실렸고, DoRA는 2024년 2월 공개 뒤 ICML 2024에 실렸다. 2025년 9월의 원 웹글은 이 여러 시점을 하나의 2024년 회고로 압축했다.

이 자료의 재사용 가능한 통찰은 최초성보다 **LoRA의 어느 설계 선택을 바꾸었는가**에 있다.

| 방법 | 바꾼 설계 축 | 그대로 남는 경계 |
| --- | --- | --- |
| AdaLoRA | 총 rank budget을 singular triplet 사이에 재배분 | 동결 base 옆의 저순위 update |
| DoRA | Weight를 magnitude와 direction으로 분해 | Direction update에는 LoRA factor 사용 |
| VeRA | 동결 random factor matrix 한 쌍을 같은 shape의 layer 사이에 공유 | Layer별 두 scaling vector는 학습 |
| rsLoRA | Rank에 따른 update scaling을 `α/√r`로 변경 | Target module과 low-rank factor 선택 |
| LoftQ | Quantization residual을 반영해 adapter를 초기화 | Fine-tuning에서는 quantized base 동결 |

### LoRA를 먼저 정확히 한정한다

[[저순위 적응]]은 사전 학습 weight $W_0$를 동결하고 작은 factor $B,A$를 학습해 다음처럼 update한다.

$$
W'=W_0+\frac{\alpha}{r}BA
$$

LoRA 자체가 모든 layer에 같은 rank를 쓰도록 수학적으로 강제하지는 않는다. 원 논문도 선택한 weight matrix 부분집합에 적용했고 대표 실험에서는 attention query·value projection을 주로 갱신했다. 여러 target module에 하나의 rank를 반복 적용하는 흔한 설정이 uniform allocation을 만들며, AdaLoRA는 이 수동 선택이 불가능했다는 문제가 아니라 같은 총 budget을 자동으로 재배분하는 문제를 다뤘다.

## 2단계 — 작동 원리

### AdaLoRA: 감소하는 총 budget 안의 동적 재선택

AdaLoRA는 $\Delta W=P\Lambda Q$라는 SVD형 parameterization을 학습한다. 하나의 singular value와 대응하는 좌·우 vector를 triplet으로 묶고, 각 parameter의 $\lvert w\nabla_w\mathcal L\rvert$ 민감도에 지수 이동 평균과 변동성 정보를 결합해 중요도를 계산한다. 높은 초기 budget에서 시작해 warm-up 뒤 cubic schedule로 총 budget을 최종 목표까지 줄이고, 중요도가 낮은 singular value를 mask한다.

이는 학습 내내 실제 SVD를 반복하는 절차가 아니다. $P,Q$를 직접 학습하고 orthogonality regularization을 더하는 SVD형 factorization이다. Mask된 성분이 다시 선택될 수는 있지만 총 rank를 필요에 따라 계속 늘리는 방식도 아니다.

### DoRA: 사전 학습 weight의 magnitude와 direction

DoRA가 분해하는 것은 update만이 아니라 weight matrix 자체다. 열별 magnitude vector $m$을 직접 학습하고, 정규화한 direction에 LoRA update를 적용한다.

$$
W'=m\frac{W_0+BA}{\lVert W_0+BA\rVert_c}
$$

원 웹글은 LoRA가 주로 direction만 바꾼다고 설명하지만 DoRA 논문의 분석은 다르다. LoRA에서는 magnitude와 direction 변화가 함께 움직이며 full fine-tuning과 다른 상관 패턴을 보였다. DoRA는 이를 direction-only update와 별도 magnitude 학습으로 재매개변수화한다. 학습 중 normalization과 graph overhead는 있지만 최종 weight에 병합할 수 있으므로 논문은 추가 inference latency가 없다고 명시한다.

### VeRA: 한 쌍의 random factor matrix와 layer별 두 scale

VeRA의 정확한 update는 scaling vector 하나가 아니라 두 개를 포함한다.

$$
W'=W_0+\Lambda_b B\Lambda_d A
$$

$A,B$는 동결된 random matrix로 동일 shape의 layer 사이에 공유되고, 각 layer는 $b,d$ 두 vector를 학습한다. 이 구조는 layer별 LoRA factor 전체를 저장하는 것보다 trainable parameter를 크게 줄이지만 frozen base, activation과 실제 matrix 연산을 없애지 않는다.

### rsLoRA와 LoftQ: scaling과 초기화는 다른 문제다

rsLoRA는 초기화·learning rate 조정으로 “유효 rank 붕괴”를 막는 방법이 아니다. 표준 $\alpha/r$ scaling에서 rank가 커질수록 gradient와 feature learning이 약해지는 문제를 분석하고 $\alpha/\sqrt r$ scaling을 제안한다.

LoftQ는 quantized backbone과 adapter를 미세조정 내내 공동 학습하는 방법도 아니다. 미세조정 전에 다음 오차를 줄이도록 quantization과 truncated SVD residual 근사를 번갈아 수행한다.

$$
\min_{Q,A,B}\lVert W-Q-AB^\top\rVert_F
$$

초기화 뒤에는 $Q$를 동결하고 $A,B$만 학습한다. [[QLoRA]]가 training memory 전반을 줄이는 recipe라면 LoftQ는 quantization error를 low-rank adapter의 시작점에 어떻게 나눌지 다루는 초기화다.

## 3단계 — 기술과 근거

### 실제 공개 연표

| 방법 | arXiv v1 공개일·학회 | 확인되는 핵심 |
| --- | --- | --- |
| LoRA | 2021-06-17 · ICLR 2022 | 동결 base와 저순위 additive update |
| AdaLoRA | 2023-03-18 · ICLR 2023 | SVD형 triplet 중요도와 budget schedule |
| LoftQ | 2023-10-12 · ICLR 2024 | 양자화와 low-rank 초기화의 alternating optimization |
| VeRA | 2023-10-17 · ICLR 2024 | 동결 random factor matrix 한 쌍의 공유와 layer별 두 scaling vector |
| rsLoRA | 2023-11-28 · 학회 표기 없음 | `α/√r` rank stabilization |
| DoRA | 2024-02-14 · ICML 2024 | Magnitude–direction weight decomposition |

따라서 “2024년 내내 모두 새로 개발됐다”는 원문의 연표를 유지하지 않는다. 학회연도와 최초 공개일도 구분한다.

### 성능 숫자가 말하는 범위

AdaLoRA의 DeBERTaV3-base GLUE Table 1에서 1.27M parameter의 평균은 89.31이고 1.33M LoRA는 88.34였다. SQuAD v2의 0.08% budget에서는 EM/F1 85.6/88.7 대 LoRA 84.7/87.5였다. 이는 해당 encoder·task·budget에서 allocation 이득을 보인 결과다.

DoRA의 LLaMA-7B 8개 commonsense reasoning task 평균은 78.4, 비교한 LoRA는 74.7이었다. 원 논문이 평가한 것은 commonsense, visual instruction, image/video-text와 제한적 image personalization이지 법률·의료·과학 domain deployment가 아니다.

VeRA v2의 GLUE Table 2에서 RoBERTa-large는 VeRA 61K와 LoRA 800K가 모두 87.8이었지만 RoBERTa-base는 VeRA 43K가 85.2, LoRA 300K가 86.6이었다. 이 수치는 분류 head를 제외한 trainable parameter이며, VeRA가 base에서는 LoRA보다 낮고 large에서는 같은 평균을 낸 조건부 결과다.

LLaMA 계열 instruction tuning의 Table 4는 서로 다른 rank 설정(LoRA 64, VeRA 1024)에서 LLaMA-7B 기준 159.9M 대 1.6M trainable parameter와 MT-Bench 5.03 대 4.77을 보고했다. 반면 Appendix Table 12는 **두 방법을 같은 rank 64로 맞춘 별도 비용 실험**이다. 여기서는 VeRA와 LoRA의 학습 시간이 578분 대 568분, GPU memory가 21.69GB 대 23.42GB였다. 따라서 Table 4의 “약 100배 적은 trainable parameter”와 Table 12의 시간·memory 수치를 하나의 동일 설정으로 합치거나, parameter 절감률을 전체 시간·memory 절감률로 바꿀 수 없다.

### 네 비용 장부

| 장부 | 무엇을 센 것인가 | 자동으로 따라오지 않는 결과 |
| --- | --- | --- |
| Trainable parameter | Gradient·optimizer state가 필요한 update 수 | Base checkpoint 저장량·activation memory·forward compute 감소 |
| Adapter storage | Task별 추가 artifact 크기 | 학습 중 peak VRAM·wall-clock 감소 |
| Training compute·time | Forward·backward와 추가 계산 | Inference latency 감소 |
| Inference graph | 병합 여부와 실행 kernel | Training memory 감소 |

Method를 비교할 때는 base checkpoint, target module, rank budget, precision, batch·sequence, optimizer와 hardware를 함께 기록해야 한다.

## 검증과 한계

### 원 웹글의 주요 정정

- AdaLoRA는 Microsoft 단독의 2024년 발표가 아니라 Georgia Tech·Princeton·Microsoft 연구진의 ICLR 2023 연구다.
- AdaLoRA의 중요도는 단순 gradient magnitude가 아니며, 총 budget은 높은 값에서 목표값으로 감소한다.
- DoRA는 update만 분해하지 않고 pretrained weight를 열별 magnitude와 direction으로 분해한다.
- DoRA는 학습 뒤 병합할 수 있으므로 normalization이 반드시 inference overhead로 남지 않는다.
- VeRA에는 layer별 scaling vector $b,d$ 두 개가 있으며, “언제나 LoRA와 같은 성능”을 보이지 않았다.
- rsLoRA의 핵심은 초기화·learning rate가 아니라 $\alpha/\sqrt r$ scaling이다.
- LoftQ의 alternating optimization은 fine-tuning 전 초기화이며 이후 quantized backbone은 동결된다.

### 입증되지 않은 영향

원 알고리즘 논문은 기업의 즉각적 채택, 인프라 비용 절감, 다중 고객 운영, 법률·의료·과학 배포, 에너지 사용이나 탄소 배출을 조사하지 않았다. 가능한 사용 사례와 관찰된 배포를 구분한다. Adapter가 작다는 사실에서 경제적 접근성이나 환경 지속 가능성으로 이동하려면 hardware·runtime·전력·조직·품질 자료가 더 필요하다.

### PEFT가 정하지 않는 것

이 방법들은 training data, task objective, instruction 품질, safety alignment와 factuality를 스스로 정하지 않는다. 같은 adapter parameterization도 다른 자료와 loss를 쓰면 다른 행동을 학습한다. 높은 intrinsic rank가 필요한 모든 과제가 실패한다거나 full fine-tuning이 언제나 더 낫다는 보편적 경계도 이 논문군에서 확정되지 않았다.

## 학습 확인

### 확인 질문

1. AdaLoRA의 rank allocation, rsLoRA의 rank scaling과 VeRA의 basis sharing은 각각 어떤 서로 다른 설계 결정을 바꾸는가?
2. DoRA의 training overhead가 추가 inference latency를 반드시 뜻하지 않는 이유는 무엇인가?
3. LoftQ와 QLoRA는 quantization과 low-rank adaptation을 어느 단계에서 결합하는가?

### 다음 문서

- [[저순위 적응]] — 다섯 변형을 method 이름보다 allocation·parameterization·sharing·scaling·initialization 축으로 비교한다.
- [[QLoRA]] — Quantized frozen base, compute dtype와 adapter update의 memory 장부를 확인한다.
- [[사전 학습 지식은 과제에 어떻게 도착하는가]] — 같은 task supervision이 full weight, adapter와 입력 context 가운데 어디를 바꾸는지 비교한다.

## 출처

- Michael Brenndoerfer, [PEFT Beyond LoRA: Advanced Parameter-Efficient Fine-Tuning Techniques](https://mbrenndoerfer.com/writing/peft-beyond-lora-advanced-parameter-efficient-finetuning-techniques), 2025년 공개 원 웹글.
- Edward J. Hu 외, [LoRA: Low-Rank Adaptation of Large Language Models](https://openreview.net/forum?id=nZeVKeeFYf9), ICLR 2022, §§1–4·7.
- Qingru Zhang 외, [Adaptive Budget Allocation for Parameter-Efficient Fine-Tuning](https://openreview.net/forum?id=lq62uWRJjiY), ICLR 2023, §§3.1–3.3와 Algorithm 1.
- Shih-Yang Liu 외, [DoRA: Weight-Decomposed Low-Rank Adaptation](https://proceedings.mlr.press/v235/liu24bn.html), ICML 2024, §§3.2·4–5와 Appendix.
- Dawid J. Kopiczko 외, [VeRA: Vector-based Random Matrix Adaptation](https://openreview.net/forum?id=NjNfLdxr3A), ICLR 2024, §§3–5와 Appendix.
- Damjan Kalajdzievski, [A Rank Stabilization Scaling Factor for Fine-Tuning with LoRA](https://arxiv.org/abs/2312.03732), 2023, §§3–4와 Appendix B.
- Yixiao Li 외, [LoftQ: LoRA-Fine-Tuning-aware Quantization for Large Language Models](https://openreview.net/forum?id=LzPWWPAdY4), ICLR 2024, §§3–4.
- Tim Dettmers 외, [QLoRA: Efficient Finetuning of Quantized LLMs](https://proceedings.neurips.cc/paper_files/paper/2023/hash/1feb87871436031bdc0f2beaa62a049b-Abstract-Conference.html), NeurIPS 2023, §§2–4.
- 프로젝트 보존 자료: **raw/101_PEFT Beyond LoRA Advanced Parameter-Efficient Fine-Tuning Techniques.ko.md**, **raw/101_PEFT Beyond LoRA Advanced Parameter-Efficient Fine-Tuning Techniques.commentary.ko.md**.

## 관련 항목

- [[저순위 적응]]
- [[QLoRA]]
- [[091_QLoRA와 4비트 양자화 미세조정]]
- [[언어 모델 전이 학습]]
- [[지시 미세조정]]
- [[사전 학습 지식은 과제에 어떻게 도착하는가]]
