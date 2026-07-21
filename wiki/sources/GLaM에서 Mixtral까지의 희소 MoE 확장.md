---
schema_version: 2
id: reference.glam-mixtral-moe
page_type: reference
title: GLaM에서 Mixtral까지의 희소 MoE 확장
aliases:
  - 072_GLaM에서 Mixtral까지의 희소 MoE 확장
  - Mixture of Experts at Scale Efficient Scaling Through Sparse Activation and Dynamic Routing
  - 대규모 MoE와 Mixtral
tags:
  - type/reference
  - domain/ai
  - domain/computer-science
  - domain/nlp
  - domain/machine-learning
created: '2026-07-21'
updated: '2026-07-21'
lifecycle: active
verification: verified
artifacts:
  - 'raw/072_Mixture of Experts at Scale Efficient Scaling Through Sparse Activation and Dynamic Routing.ko.md'
  - 'raw/072_Mixture of Experts at Scale Efficient Scaling Through Sparse Activation and Dynamic Routing.commentary.ko.md'
evidence:
  - source_id: shazeer-et-al-2017-sparsely-gated-moe
    locator: 'ICLR 2017, §§1.2–2.1·4–5와 Appendix E의 noisy top-k routing·load balancing·제한적 expert specialization 사례'
    relation: contextualizes
  - source_id: lepikhin-et-al-2021-gshard
    locator: 'ICLR 2021, §§2.1–2.2·4–5와 Figures 1–3의 top-2 Transformer MoE·expert capacity·SPMD sharding·600B 실험'
    relation: contextualizes
  - source_id: fedus-et-al-2022-switch-transformer
    locator: 'JMLR 23(120), §§2–3·5.4–5.6·8과 Tables 1·9의 top-1 routing·2,048-expert Switch-C·time-to-quality·전이·분산 비용'
    relation: contextualizes
  - source_id: kaplan-et-al-2020-scaling-laws
    locator: '§§1.1–1.3와 Appendix C의 dense Transformer 비임베딩 매개변수 N·token D·training compute C≈6ND 근사'
    relation: disputes
  - source_id: du-et-al-2022-glam
    locator: '초록, §§1·4–6·8–9, Tables 1·4와 Figures 1–4의 decoder-only top-2 MoE·1.2T total·96.6B active·동일 자료 dense–MoE family·GPT-3 교차 모델 비교·resource limitation'
    relation: supports
  - source_id: jiang-et-al-2024-mixtral
    locator: 'arXiv submission history, 초록, §§1–6, Tables 1–3·5와 Figures 1·7–8의 2024-01-08 v1·8-expert top-2·47B total·13B active·32K context·SFT와 DPO·평가·memory와 hardware 조건·routing 분석'
    relation: supports
  - source_id: mistral-ai-2023-mixtral-release
    locator: '2023-12-11 공개일, Pushing the frontier of open models with sparse architectures, Performance와 Apache 2.0 공개 가중치 설명'
    relation: supports
related:
  - source.069
  - concept.전문가-혼합
  - concept.mixtral-8x7b
  - concept.transformer
  - concept.대규모-언어-모델
  - concept.언어-모델-스케일링-법칙
  - analysis.총-매개변수와-활성-계산량은-같은-축인가
---
# GLaM에서 Mixtral까지의 희소 MoE 확장

> [!note] 학습 안내
> **난이도:** 심화<br>
> **선수 지식:** [[069_전문가 혼합과 희소 활성 스케일링]], [[전문가 혼합]], [[Transformer]]<br>
> **읽고 나면:** GLaM과 Mixtral의 total·active parameter를 구분하고, 2024년 단일 돌파 서사·주제별 expert·고정 배수 속도 주장을 실험 조건에 맞게 평가할 수 있다.

## 1단계 — 먼저 잡을 핵심

### 2024년 발명이 아니라 공개 가중치 단계로의 이동이다

번호 정정 전 072로 수집된 raw의 출발 자료는 2025년에 게시된 웹 해설이며, MoE 대규모 확장을 2024년의 전환으로 묶는다. 그러나 [[069_전문가 혼합과 희소 활성 스케일링]]에서 확인했듯 학습되는 gate는 1991년, 수천 expert의 희소 layer는 2017년, GShard와 Switch Transformer의 수천억·수조 매개변수 Transformer는 2020–2021년에 이미 공개됐다.

그 다음 전환은 한 해의 발명보다 두 사례로 읽는 편이 정확하다.

1. **GLaM:** ICML 2022 논문은 decoder-only 언어 모델 안에 top-2 MoE를 넣고 1.2T total·96.6B active parameters까지 확장했다.
2. **[[Mixtral 8x7B]]:** Mistral AI가 2023년 12월 11일 Apache 2.0 공개 가중치와 46.7B total·12.9B active parameters를 발표했고, 2024년 1월 논문은 이를 47B·13B로 반올림해 구조·평가·routing 분석을 보고했다.

2024년은 수조 매개변수 MoE가 처음 가능해진 때가 아니다. Mixtral이 decoder-only sparse MoE를 공개 가중치 생태계와 실제 serving 논의에 널리 드러낸 시기로 한정해야 한다.

### 핵심 문장

- Transformer MoE의 expert는 보통 완전한 독립 언어 모델이 아니라 **FFN sublayer**다. Attention·embedding·normalization 같은 공유 경로는 계속 계산된다.
- Top-$k$는 어려운 token에 expert를 더 많이 주는 가변 예산이 아니다. GLaM과 Mixtral은 token마다 어느 두 expert를 쓸지는 바꾸지만 $k=2$는 고정한다.
- Dense model의 계산이 parameter 수에 본질적으로 제곱 비례한다는 raw 설명은 틀렸다. 고정 token 수에서 대표 training 근사는 $C\approx6ND$이므로 $N$만 두 배면 약 두 배다.
- Active parameter는 산술량을 설명하는 한 축이다. 전체 weight memory, token dispatch, routing overhead, batch와 hardware 이용률까지 같은 비율로 줄지는 않는다.
- Expert가 과학·법률·코드 같은 안정된 주제 module로 나뉜다는 보편 증거는 없다. Mixtral의 직접 분석은 오히려 뚜렷한 topic routing을 찾지 못했다.

## 2단계 — 작동 원리

### 공유 Transformer 경로와 선택 FFN을 나눈다

Token 표현 $x$에 대해 router가 expert별 logit을 만들고 상위 두 개만 남긴다고 하자. 선택 집합 $T_2(x)$의 출력은 다음처럼 쓸 수 있다.

$$
y(x)=\sum_{i\in T_2(x)}
\operatorname{softmax}(W_rx)_iE_i(x).
$$

$E_i$는 GLaM과 Mixtral에서 FFN expert다. 같은 sequence 안에서도 token마다, 같은 token도 layer마다 expert 선택이 달라질 수 있다. 그러나 shared attention과 그 밖의 dense block은 계속 실행되므로 `2/64` 또는 `2/8`을 전체 모델의 활성 비율로 바로 사용하지 않는다.

| 모델 | 구조 | expert 선택 | total parameters | active parameters/token |
|---|---|---:|---:|---:|
| GLaM 64B/64E | decoder-only, 격층 MoE | 64개 중 2개 | 1.2T | 96.6B |
| Mixtral 8x7B | decoder-only, 모든 layer의 FFN을 MoE로 교체 | 8개 중 2개 | 46.7B | 12.9B |

Mixtral의 `8x7B`는 56B를 모두 실행한다는 뜻도, 14B만 저장한다는 뜻도 아니다. Shared weight가 한 번만 존재하므로 total은 46.7B이고, shared path와 선택된 두 FFN을 합친 active count는 12.9B다.

### 계산·메모리·통신을 별도 장부에 적는다

| 장부 | 직접 답하는 질문 | Sparse MoE에서 남는 조건 |
|---|---|---|
| total parameters | checkpoint 전체 weight는 몇 개인가? | 모든 expert의 저장·분산이 필요함 |
| active parameters·FLOPs | 한 token에서 어떤 행렬곱을 실행하는가? | shared layer·router도 계속 실행됨 |
| memory·bandwidth | Weight와 activation을 어디에 두고 얼마나 옮기는가? | 전체 sparse weight와 expert memory load가 필요함 |
| communication | Token을 어느 장치로 보내고 되돌리는가? | expert parallelism의 all-to-all이 병목이 될 수 있음 |
| wall-clock·latency | 실제 batch와 hardware에서 얼마나 빠른가? | routing balance·batch·kernel·interconnect에 의존함 |

원문의 “8개 중 2개이므로 네 배 작은 dense model과 같은 비용”은 expert FFN만 놓은 직관이다. Mixtral 논문도 active count가 inference compute와 관련 있지만, serving memory는 47B total에 비례하고 routing·memory-load overhead가 있으며 큰 batch에서 arithmetic intensity를 확보하기 더 좋다고 구분한다.

### Dense parameter와 sequence length의 제곱을 혼동하지 않는다

Dense Transformer의 대표적인 학습 계산 근사는 다음과 같다.

$$
C\approx6ND,
$$

여기서 $N$은 비임베딩 매개변수, $D$는 처리 token이다. $D$를 고정하고 $N$만 두 배로 하면 약 두 배다. Model과 token을 함께 두 배로 키우면 약 네 배가 될 수 있지만, 이는 두 축을 동시에 바꾼 결과다. Attention의 $O(L^2)$는 sequence length $L$에 대한 관계다. Raw는 이 서로 다른 제곱 관계를 parameter 수 하나의 법칙으로 잘못 합쳤다.

## 3단계 — 기술과 근거

### GLaM은 내부 통제와 외부 비교를 모두 제공한다

GLaM은 dense와 MoE decoder-only family를 같은 자료와 학습 hyperparameter로 훈련했다. Table 4는 8.7B dense와 143B total·9.8B active MoE, 137B dense와 1.2T total·96.6B active MoE를 같은 active-parameter 규모 부근에 놓는다. 이는 larger conditional capacity를 제한된 per-token path와 비교한 강한 내부 근거다.

가장 큰 GLaM은 MoE layer마다 64개 FFN expert 중 두 개를 선택하고, 1,024개 Cloud TPU v4 chip에서 학습됐다. 논문 스스로 수조 규모 sparse model도 극도로 비싸고 hyperparameter 탐색 여지가 적다고 기록한다. 따라서 이를 중간 규모 조직의 학습 장벽이 사라졌다는 증거로 쓸 수 없다.

GPT-3와의 Table 1 비교에서는 GLaM이 29개 과제 평균에서 zero-shot 62.7 대 56.9, one-shot 65.5 대 61.6, few-shot 68.1 대 65.2였고, 보고된 inference는 token당 180 대 350 GFLOPs, training energy는 456 대 1,287 MWh였다. 그러나 두 모델은 data·hardware·software·training recipe가 달라 이 교차 모델 수치에서 MoE 구조만의 인과 효과를 분리할 수 없다. GLaM 논문 자체도 sparse architecture와 efficient model-parallel implementation을 함께 든다. 평균 우위를 모든 과제의 승리로도 바꾸지 않는다.

### Mixtral은 공개 배포의 강한 사례지만 sparsity 단독 절제는 아니다

Mixtral 8x7B는 32개 layer, context length 32,768, layer마다 8개 FFN expert와 top-2 router를 사용한다. Base와 Instruct weight는 Apache 2.0으로 공개됐다. Instruct version은 base model과 달리 supervised fine-tuning 뒤 Direct Preference Optimization을 적용했다.

논문 Table 2에서 Mixtral은 MMLU·ARC·NaturalQuestions·HumanEval·MBPP·MATH·GSM8K 등 여러 지표에서 Llama 2 70B보다 높았지만, HellaSwag 84.4 대 85.4, WinoGrande 77.2 대 80.4, TriviaQA 71.5 대 73.0처럼 낮은 항목도 있었다. Table 3에서도 WinoGrande와 MT-Bench는 비교 모델보다 낮았다. 논문의 안전한 표현은 **대부분의 metric에서 맞먹거나 앞섰다**는 것이다.

이 비교에는 같은 training recipe로 학습한 dense counterpart가 없다. Data, context, tokenizer, architecture와 evaluation pipeline이 함께 다르므로 성능 차이를 top-2 sparsity나 expert specialization 하나에 귀속하지 않는다. 공개 weight와 Apache license도 자세한 pretraining corpus·완전한 학습 recipe까지 모두 공개됐다는 뜻은 아니다.

### Routing 분석은 주제 expert 가정을 지지하지 않았다

Mixtral 연구진은 The Pile validation subset의 arXiv, PubMed Abstracts, PhilPapers, GitHub, Wikipedia 등을 사용해 layer 0·15·31의 expert 선택 비율을 비교했다. 예상과 달리 뚜렷한 topic별 배정은 없었고, 합성 자료인 DM Mathematics만 작은 차이를 보였다.

대신 특정 token 조각, 들여쓰기와 연속 token이 같은 expert로 가는 구문·시간적 locality가 관찰됐다. 이 결과는 router가 구조를 전혀 학습하지 않았다는 뜻도, 각 expert가 특정 domain을 소유한다는 뜻도 아니다. 선택 분포와 기능 인과를 확인하려면 seed·data 재현, expert ablation과 shared layer의 기여를 별도로 시험해야 한다.

## 검증과 한계

### raw 설명의 검증 정정

- **2024년에 MoE의 대규모 확장이 성공했다:** GShard 600B, Switch 1.571T와 GLaM 1.2T는 모두 더 앞서 공개됐다. 2023–2024년 Mixtral은 공개 가중치 단계의 가시성을 높였다.
- **Meta의 Mixtral:** Mixtral은 Mistral AI가 만들었다. Meta의 Llama와 기관을 혼동한 서술이다.
- **Dense parameter를 두 배로 하면 compute가 네 배다:** Token 수를 고정하면 대표 근사는 약 두 배다. Parameter와 token 또는 sequence length 축을 함께 바꾼 경우와 구분한다.
- **Dense scaling은 어느 지점부터 의미 있는 개선이 멈췄다:** Dense scaling 연구는 관측 구간의 완만한 loss 개선과 diminishing return을 함께 보고했다. 급격한 무효화 지점은 입증되지 않았다.
- **Expert는 완전한 신경망이고 쉬운 입력은 적게, 어려운 입력은 많이 쓴다:** 대표 Transformer MoE expert는 FFN이며 top-$k$는 고정이다.
- **Expert 수는 보통 8–128개다:** 보편 범위가 아니다. Switch-C는 2,048 experts를 사용했다.
- **MoE는 expert를 memory에서 동적으로 load·unload한다:** 일반 구조는 weight를 장치에 저장·shard하고 token을 dispatch한다. Offloading은 별도 serving 기법이다.
- **Mixtral은 더 큰 dense model보다 모든 평가에서 우세했다:** 자체 표에도 낮은 지표가 있으며, 비교 모델·prompt·shot과 pipeline 조건이 붙는다.
- **Expert가 과학·법률·코드로 자연스럽게 분업했다:** Mixtral의 직접 routing 분석은 뚜렷한 topic pattern을 찾지 못했다.
- **Active parameter가 네 배 작으면 실제 비용도 네 배 작다:** 전체 memory, communication, router, batch와 hardware utilization을 빠뜨린다.
- **MoE가 중간 자원 조직에 대형 모델을 대중화했다:** 공개 weight는 접근 장벽을 낮추지만 total memory와 multi-device serving 비용은 남는다.

### 비교 증거의 층위를 지킨다

GLaM family 안의 dense–MoE 비교는 data와 hyperparameter를 공유해 architecture 질문에 비교적 가깝다. GLaM–GPT-3과 Mixtral–Llama 2/GPT-3.5 비교는 서로 다른 model·data·system을 나란히 놓은 외부 비교다. 후자는 실제 성능 위치를 설명하지만 MoE 하나의 인과 효과를 식별하지 않는다.

Mixtral의 2023년 공식 발표가 제시한 “Llama 2 70B보다 6배 빠른 inference”도 특정 구현의 release claim이다. 논문이 밝힌 memory와 batch 조건 때문에 hardware·batch·latency 정의를 생략한 고정 배수로 재사용하지 않는다.

## 학습 확인

### 확인 질문

1. GLaM 1.2T와 Mixtral 46.7B의 total parameter를 dense model 크기와 바로 비교할 수 없는 이유는 무엇인가?
2. Mixtral의 12.9B active parameter가 12.9B dense model과 같은 memory·latency를 보장하지 않는 이유는 무엇인가?
3. Mixtral routing 분석은 ‘expert specialization’에 대해 무엇을 보여 주고 무엇을 보여 주지 않는가?

### 다음 문서

- [[Mixtral 8x7B]] — 이름·구조·공개 범위·평가와 routing 분석을 model 단위로 정리한다.
- [[총 매개변수와 활성 계산량은 같은 축인가]] — Dense와 sparse model을 total·active parameter, FLOPs, memory, communication과 quality의 장부로 비교한다.

## 출처

- [[069_전문가 혼합과 희소 활성 스케일링]]
- Nan Du 외, [GLaM: Efficient Scaling of Language Models with Mixture-of-Experts](https://proceedings.mlr.press/v162/du22c.html), ICML 2022, 특히 §§4–6·8–9와 Tables 1·4.
- Albert Q. Jiang 외, [Mixtral of Experts](https://arxiv.org/abs/2401.04088), arXiv:2401.04088, 2024, 특히 §§1–6와 Tables 1–3·5.
- Mistral AI, [Mixtral of experts](https://mistral.ai/news/mixtral-of-experts/), 2023-12-11.
- Jared Kaplan 외, [Scaling Laws for Neural Language Models](https://arxiv.org/abs/2001.08361), 2020, 특히 Appendix C의 dense compute 근사.
- 프로젝트 번역·검토 출발 자료: [Mixture of Experts at Scale: Efficient Scaling Through Sparse Activation and Dynamic Routing](https://mbrenndoerfer.com/writing/mixture-of-experts-at-scale-sparse-activation-dynamic-routing-efficient-scaling)
- 프로젝트 보존 자료: `raw/072_Mixture of Experts at Scale Efficient Scaling Through Sparse Activation and Dynamic Routing.ko.md`, `raw/072_Mixture of Experts at Scale Efficient Scaling Through Sparse Activation and Dynamic Routing.commentary.ko.md`.

## 관련 항목

- [[069_전문가 혼합과 희소 활성 스케일링]]
- [[전문가 혼합]]
- [[Mixtral 8x7B]]
- [[Transformer]]
- [[대규모 언어 모델]]
- [[언어 모델 스케일링 법칙]]
- [[총 매개변수와 활성 계산량은 같은 축인가]]
