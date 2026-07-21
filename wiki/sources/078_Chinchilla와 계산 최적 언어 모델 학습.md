---
schema_version: 2
id: source.078
page_type: source
title: Chinchilla와 계산 최적 언어 모델 학습
aliases:
  - 078_Chinchilla Scaling Laws Compute-Optimal Training and Resource Allocation for Large Language Models
  - Chinchilla Scaling Laws
  - Training Compute-Optimal Large Language Models
  - 계산 최적 언어 모델 훈련
tags:
  - type/source
  - domain/ai
  - domain/computer-science
  - domain/nlp
  - domain/machine-learning
created: '2026-07-21'
updated: '2026-07-22'
lifecycle: active
verification: verified
artifacts:
  - 'raw/078_Chinchilla Scaling Laws Compute-Optimal Training and Resource Allocation for Large Language Models.ko.md'
  - 'raw/078_Chinchilla Scaling Laws Compute-Optimal Training and Resource Allocation for Large Language Models.commentary.ko.md'
evidence:
  - source_id: hoffmann-et-al-2022-chinchilla
    locator: '초록, §§1·3.1–3.4·4–5, Eqs. 1–2, Tables 1–5와 Appendices A·C·D.2–D.4·E–F의 fixed-compute 최적화·세 추정법·Chinchilla–Gopher 비교·데이터와 FLOP 조건'
    relation: supports
  - source_id: touvron-et-al-2023-llama
    locator: '§1의 training-compute optimum과 inference budget 구분, Table 2의 6.7B·13.0B·32.5B·65.2B model과 1.0T·1.4T token 학습 조건, Figures 1–2의 추가 token 학습 추이'
    relation: contextualizes
related:
  - source.066
  - source.067
  - source.074
  - source.089
  - concept.언어-모델-스케일링-법칙
  - concept.llama-1
  - concept.대규모-언어-모델
  - concept.perplexity
  - concept.transformer
  - analysis.데이터-품질과-분포-다양성은-같은-축인가
  - analysis.총-매개변수와-활성-계산량은-같은-축인가
---
# Chinchilla와 계산 최적 언어 모델 학습

> [!note] 학습 안내
> **난이도:** 심화<br>
> **선수 지식:** [[언어 모델 스케일링 법칙]], [[Perplexity]], [[대규모 언어 모델]]<br>
> **읽고 나면:** 고정 훈련 compute에서 모델 크기와 token 수를 배분하는 세 추정법을 설명하고, 제곱근 scaling·20:1 근사·Chinchilla–Gopher 비교의 조건을 구분할 수 있다.

## 1단계 — 먼저 잡을 핵심

### 핵심 문장

Hoffmann 등은 2022년 **주어진 훈련 FLOP 예산에서 모델 매개변수 수 $N$과 학습 token 수 $D$를 어떻게 배분해야 최종 loss가 가장 낮아지는가**를 다시 측정했다. 세 경험적 추정법은 계산량이 늘 때 $N$과 $D$를 거의 같은 지수로 키워야 한다고 예측했다. Dense autoregressive Transformer의 $C\approx6ND$ 근사와 결합하면 두 규모는 각각 대략 $C^{1/2}$에 비례한다.

이 결과는 2020년 [[066_신경 언어 모델의 스케일링 법칙|Kaplan식 배분]]의 문제를 처음 발견한 것이 아니다. Kaplan 등도 fixed compute에서 모델–데이터 절충을 직접 다뤘지만, 계산량이 10배 늘 때 모델을 약 5.5배, token을 약 1.8배 늘리는 $N_{opt}\propto C^{0.73}$, $D_{opt}\propto C^{0.27}$을 제안했다. Chinchilla 연구의 핵심은 같은 질문을 다른 실험 설계로 재측정해 이를 약 0.5/0.5로 크게 수정한 데 있다.

### ‘과소 훈련’의 좁은 뜻

이 논문에서 대형 모델이 undertrained라는 말은 일부 parameter가 실제로 사용되지 않았다거나 잘못된 pattern을 학습했다는 기계적 진단이 아니다. 고정된 compute에서 관측·외삽한 loss-optimal frontier와 비교할 때 당시 모델이 **너무 크고 너무 적은 token으로 훈련됐다**는 자원 배분 판정이다.

그 판단을 시험하기 위해 연구진은 Gopher와 같은 사전 학습 FLOPs로 700억 parameter Chinchilla를 1조 4천억 token에 훈련했다. 2,800억 parameter·3천억 token의 Gopher보다 약 네 배 작고 token 노출량은 약 4.7배 많았다. Chinchilla는 여러 평가에서 더 강했고, 작은 checkpoint 덕분에 추론·미세조정·메모리 비용도 낮았다. **훈련 compute 자체를 줄인 비교는 아니다.**

## 2단계 — 작동 원리

### 고정 compute 최적화

논문의 문제는 다음과 같다.

$$
(N_\mathrm{opt},D_\mathrm{opt})
=\underset{N,D}{\arg\min}\;L(N,D)
\quad\text{subject to}\quad
\operatorname{FLOPs}(N,D)=C.
$$

$N$은 모델 크기, $D$는 학습 중 본 누적 token 수, $C$는 훈련 계산 예산이다. Dense decoder의 거친 연산 장부에서는 다음 근사를 쓴다.

$$
C\approx6ND.
$$

같은 $C$에서 $N$을 늘리면 처리할 수 있는 $D$가 줄고, $D$를 늘리면 사용할 수 있는 $N$이 줄어든다. 계산 최적점은 한 축을 최대화하는 값이 아니라 이 제약 위에서 loss가 가장 낮은 조합이다.

### 세 추정법은 같은 방향, 다른 지수를 냈다

| 접근 | 핵심 절차 | $N_\mathrm{opt}$ 지수 $a$ | $D_\mathrm{opt}$ 지수 $b$ |
| --- | --- | ---: | ---: |
| Training-curve envelope | 고정 model size를 여러 token horizon으로 훈련하고 FLOP별 최저 loss를 선택 | 0.50 | 0.50 |
| IsoFLOP profile | 아홉 compute budget마다 model size를 바꿔 loss valley를 적합 | 0.49 | 0.51 |
| Parametric loss fit | $\hat L(N,D)=E+A/N^\alpha+B/D^\beta$를 전체 final loss에 적합 | 0.46 | 0.54 |

세 방법의 값은 완전히 같지 않지만 모델과 token을 거의 같은 비율로 늘리는 데 모인다. 계산량을 두 배로 늘리면 두 축을 각각 대략 $\sqrt{2}$배 늘리는 방향이다. 둘을 각각 두 배로 늘리면 $C\approx6ND$에 따라 계산량은 약 네 배가 된다.

이는 “예산의 절반을 parameter에, 절반을 data에 쓴다”는 회계 문장이 아니다. 단위가 다른 $N$과 $D$가 compute에 대해 거의 같은 power-law exponent를 가졌다는 뜻이다.

### 20 tokens/parameter는 어떻게 나왔는가

Chinchilla의 실제 비율은 다음과 같다.

$$
\frac{1.4\text{T tokens}}{70\text{B parameters}}=20.
$$

Approach 1의 Supplemental Table A3도 여러 규모에서 대략 20대 초반 token/parameter를 투영했다. 따라서 20:1은 당시 dense Transformer·tokenizer·objective·data mixture·schedule에 조건화된 유용한 경험 근사다. 모든 architecture와 domain에 적용되는 자연 상수나 최소 data floor가 아니다.

원문의 “GPT-3 크기에는 정확히 3.5T tokens가 최적”이라는 값은 단순히 $175\text{B}\times20$을 계산한 것이다. Supplemental Tables A3–A4의 1,750억 model 투영은 접근별로 약 3.7T·4.3T·12.0T까지 벌어지고 본문은 4.2T 초과라고 요약한다. 안전한 결론은 당시 300B보다 훨씬 많은 **수조 token 규모**가 예측됐고, 높은 compute 외삽의 방법 의존성이 컸다는 것이다.

## 3단계 — 기술과 근거

### 실험 범위와 외삽

논문 초록은 400개가 넘는 모델을 7천만에서 160억 초과 parameter, 50억에서 5천억 token 범위에서 훈련했다고 요약한다. §1 본문은 7천만 미만에서 160억 초과, 50억에서 4천억 초과라고 썼다. Approach 1은 최대 약 100억, Approach 2는 최대 약 160억 model을 사용했다.

최종 700억 Chinchilla는 scaling fit의 model 범위보다 크다. 세 방법이 비슷한 방향을 예측한 점은 신뢰를 높이지만 high-compute frontier는 외삽이다. 세 지수의 차이, frontier curvature와 실제 대규모 검증점 수를 불확실성으로 남겨야 한다.

### Chinchilla와 Gopher의 장부

| 항목 | Gopher | Chinchilla |
| --- | ---: | ---: |
| Parameter | 280B | 70B |
| 학습 token | 300B | 1.4T |
| 사전 학습 compute | 약 $5.76\times10^{23}$ FLOPs | 약 $5.76\times10^{23}$ FLOPs |
| MMLU 평균 정확도 | Chinchilla보다 7%p 이상 낮음 | 67.5% |

논문은 Chinchilla가 Gopher뿐 아니라 GPT-3 175B, Jurassic-1 178B, MT-NLG 530B보다 폭넓은 downstream 평가에서 강했다고 보고했다. 그러나 서로 다른 공개 모델 사이의 비교는 training data·tokenizer·prompt·평가 protocol이 완전히 통제된 architecture ablation이 아니다.

Gopher와 Chinchilla도 $N$과 $D$만 달랐던 것은 아니다. 같은 MassiveText 계열과 대체로 같은 architecture·training setup을 썼지만 더 긴 훈련에 맞춰 data mixture를 조정했고, Adam 대신 AdamW를 사용했으며 tokenizer와 일부 recipe가 달랐다. 결과는 compute 배분 가설의 강한 실증이지만 downstream 차이 전체를 $N/D$ 비율 하나의 순수 인과 효과로 만들지 않는다.

### Token 노출량과 data mixture

$D$는 optimizer가 본 누적 token 수다. 고유 문서 수, 중복, 언어·domain coverage, 사실성, 독성, 권리 상태를 나타내지 않는다. MassiveText는 component별 sampling proportion과 epoch 수가 다른 mixture였고, 최종 Chinchilla에서는 일부 작은 component가 반복됐다.

Appendix C는 C4와 GitHub code에서도 1 epoch 미만 IsoFLOP 분석이 비슷한 지수를 보였다고 보고했다. 이는 MassiveText 한 자료의 우연일 가능성을 줄이지만 임의의 품질·언어·modality에서 20:1을 확정하지 않는다. “더 많은 token이 compute frontier에서 중요했다”와 “어떤 20N token도 동등하다”를 구분해야 한다.

### 학습 최적과 수명주기 최적

Chinchilla와 Gopher의 training FLOPs는 같았다. 더 작은 Chinchilla의 이점은 checkpoint memory와 반복 inference·fine-tuning 비용에서 커졌다. 실제 system의 최적점은 사전 학습 한 번의 loss뿐 아니라 요청량, latency, hardware memory, data availability와 wall-clock deadline에 따라 달라질 수 있다.

Sparse MoE에서는 total parameter와 token당 active compute가 다시 갈라진다. Dense model의 $C\approx6ND$에서 어떤 $N$을 쓸지 명시하지 않으면 expert weight 전체와 실제 활성 연산을 혼동한다. 이 비교는 [[총 매개변수와 활성 계산량은 같은 축인가]]에서 이어서 다룬다.

### LLaMA 1은 서로 다른 최적화 문제를 보여 준다

[[089_LLaMA 1과 제한적 공개 가중치 연구 배포|LLaMA 1]]은 Chinchilla의 fixed-training-compute 질문을 그대로 재현한 모델이 아니다. Touvron 등은 고정 학습 FLOP의 loss-optimal 모델이 배포 뒤 누적 inference 비용에서도 최적이라는 보장이 없다고 봤다. 실제 학습 장부는 6.7B·13.0B 모델에 1.0T token, 32.5B·65.2B 모델에 1.4T token을 사용해 각각 약 149·77·43·21.5 tokens/parameter였다.

따라서 가장 큰 65B만 Chinchilla의 약 20:1 근사에 가깝고 작은 모델은 훨씬 더 오래 학습했다. 이는 Chinchilla의 훈련-계산 최적 frontier를 폐기했다기보다 **초기 학습 비용과 반복 추론 비용의 비중을 다르게 놓은 목적 함수**로 이동한 사례다. LLaMA 논문은 이 네 비율을 보편 최적 법칙으로 새로 fit하지 않았고, 다른 데이터·tokenizer·recipe의 benchmark 우위를 token 비율 하나의 인과 효과로 분리하지도 않았다.

## 검증과 한계

### raw 설명의 검증 정정

- **$N$과 $D$가 $C^{1/3}$으로 증가한다:** 세 접근은 각각 0.50/0.50, 0.49/0.51, 0.46/0.54를 보고했다. 요약은 약 $C^{1/2}$이다.
- **`NNN`, `DDD`, `CCC`, `LLL`, `C=6NDC...`:** 페이지 추출 과정에서 중복된 표기다. 의도된 변수는 $N,D,C,L$이고 근사는 $C\approx6ND$다.
- **Kaplan은 model–data trade-off를 다루지 않았다:** Kaplan도 fixed-compute 배분을 직접 다뤘다. 차이는 0.73/0.27을 약 0.5/0.5로 재추정한 데 있다.
- **20:1은 정확한 보편 최적 비율이다:** Chinchilla와 한 projection의 조건부 근사다. 다른 fit과 높은 compute 투영도 차이가 난다.
- **GPT-3 규모의 정답은 3.5T다:** 단순 20배 계산이다. Supplemental의 세 접근은 약 3.7T·4.3T·12.0T를 투영해 단일 상수와 high-compute 외삽의 불확실성을 드러낸다.
- **과소 훈련 모델에서는 일부 parameter가 놀거나 허위 pattern을 배운다:** 논문이 직접 측정한 mechanism이 아니다. Fixed-compute loss frontier에 대한 판정이다.
- **400여 model은 같은 하나의 compute budget으로 훈련됐다:** 여러 compute budget·model size·token horizon과 세 분석법을 사용했다.
- **Chinchilla가 training cost도 줄였다:** Gopher와 같은 training FLOPs를 썼다. 추론·미세조정·memory 비용이 낮아졌다.
- **최적 구성은 더 매끄러운 학습 곡선으로 검증됐다:** 원 논문의 핵심 검증은 FLOP별 loss frontier와 downstream 결과다. 보편적인 곡선 매끄러움은 직접 결론이 아니다.
- **20:1은 여러 downstream task에서 안정적이었다:** Scaling law는 주로 pretraining loss에 적합했고 downstream 평가는 최종 Chinchilla 한 점을 중심으로 했다.
- **LLaMA가 20:1 계산 최적 원칙을 모든 규모에 그대로 따랐다:** LLaMA 1차 논문 §1과 Table 2를 조합하면 실제 비율은 6.7B·13.0B·32.5B·65.2B에서 약 149·77·43·21.5 tokens/parameter다. 작은 모델을 training-compute optimum을 지나 더 학습해 inference 비용을 줄이려는 다른 목적이었다.
- **업계 표준·민주화·edge 배포·환경 개선을 입증했다:** 후대 adoption·deployment·energy 자료가 필요한 별도 주장이다.
- **MassiveText의 품질이 균질하다고 가정했다:** 실제로 여러 component의 mixture였다. 품질과 mixture를 독립 변수로 loss 식에 넣지 않았다는 것이 정확한 한계다.
- **Computer vision·RL에도 같은 비율이 적용된다:** 체계적 frontier 추정 방법은 재사용할 수 있지만 20:1의 직접 일반화는 입증되지 않았다.

### 평가와 일반화의 한계

Scaling law의 직접 적합 대상은 평균 pretraining loss다. Reasoning, factuality, calibration, bias, toxicity와 safety의 최적점을 같은 식으로 예측하지 않는다. Chinchilla의 downstream 우위는 중요하지만 각 속성의 보편적 개선을 뜻하지 않는다.

많은 token을 볼수록 benchmark와 비슷하거나 중복된 자료를 접할 가능성도 커진다. 논문은 일부 language-modeling 비교에서 train/test leakage 가능성을 경고했다. Token 수 증가와 새로운 독립 정보의 증가를 동일시하지 않는다.

계수와 지수는 architecture, tokenizer, objective, optimizer, schedule, context length, data mixture와 FLOP 계산 방식에 영향을 받는다. 관측 범위를 벗어난 외삽에는 fit 불확실성과 실제 대규모 frontier run을 함께 제시해야 한다.

## 학습 확인

### 확인 질문

1. $C\approx6ND$에서 $N$과 $D$가 거의 같은 비율로 증가할 때 왜 각각 $C^{1/2}$에 가깝고 $C^{1/3}$이 아닌가?
2. Chinchilla와 Gopher의 사전 학습 FLOPs가 같은데도 Chinchilla의 추론·미세조정 비용이 낮은 이유는 무엇인가?
3. 20 tokens/parameter를 data quality·distribution과 무관한 보편 법칙으로 쓰면 어떤 조건이 사라지는가?

### 다음 문서

- [[066_신경 언어 모델의 스케일링 법칙]] — Kaplan 2020의 원래 power law와 0.73/0.27 배분을 먼저 확인한다.
- [[언어 모델 스케일링 법칙]] — 두 연구의 변수·지수·병목·외삽을 재사용 가능한 개념 장부로 정리한다.
- [[LLaMA 1]] — training compute 최적점과 반복 inference 비용을 나누고 작은 모델을 더 오래 학습한 사례를 본다.
- [[데이터 품질과 분포 다양성은 같은 축인가]] — 학습 token 수와 품질·혼합·sampling weight·반복 노출을 분리한다.

## 출처

- Jordan Hoffmann 외, [Training Compute-Optimal Large Language Models](https://arxiv.org/abs/2203.15556), arXiv:2203.15556, 2022-03-29; NeurIPS 2022, 특히 §§1·3.1–3.4·4–5, Tables 1–5와 Appendices A·C·D–F.
- [NeurIPS 2022 공식 논문 페이지](https://proceedings.neurips.cc/paper_files/paper/2022/hash/c1e2faff6f588870935f114ebe04a3e5-Abstract-Conference.html)와 [supplemental PDF](https://proceedings.neurips.cc/paper_files/paper/2022/file/c1e2faff6f588870935f114ebe04a3e5-Supplemental-Conference.pdf).
- [[066_신경 언어 모델의 스케일링 법칙]]
- [[089_LLaMA 1과 제한적 공개 가중치 연구 배포]]
- Hugo Touvron 외, [LLaMA: Open and Efficient Foundation Language Models](https://arxiv.org/abs/2302.13971), 2023, §1, Table 2, Figures 1–2.
- 프로젝트 번역·검토 출발 자료: [Chinchilla Scaling Laws: Compute-Optimal Training and Resource Allocation for Large Language Models](https://mbrenndoerfer.com/writing/chinchilla-scaling-laws-compute-optimal-training-resource-allocation)
- 프로젝트 보존 자료: `raw/078_Chinchilla Scaling Laws Compute-Optimal Training and Resource Allocation for Large Language Models.ko.md`, `raw/078_Chinchilla Scaling Laws Compute-Optimal Training and Resource Allocation for Large Language Models.commentary.ko.md`.

## 관련 항목

- [[066_신경 언어 모델의 스케일링 법칙]]
- [[067_GPT-3와 문맥 내 학습]]
- [[074_The Pile과 대규모 언어 모델 학습 말뭉치]]
- [[089_LLaMA 1과 제한적 공개 가중치 연구 배포]]
- [[언어 모델 스케일링 법칙]]
- [[LLaMA 1]]
- [[대규모 언어 모델]]
- [[Perplexity]]
- [[Transformer]]
- [[데이터 품질과 분포 다양성은 같은 축인가]]
- [[총 매개변수와 활성 계산량은 같은 축인가]]
