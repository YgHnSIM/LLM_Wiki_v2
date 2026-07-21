---
schema_version: 2
id: concept.dall-e-2021
page_type: concept
title: DALL·E (2021)
aliases:
  - DALL·E
  - DALL-E
  - DALL·E 1
  - DALL-E 1
  - 달리
  - 이산 이미지 토큰 생성 모델
tags:
  - type/concept
  - domain/ai
  - domain/computer-science
  - domain/computer-vision
  - domain/machine-learning
  - domain/nlp
created: '2026-07-21'
updated: '2026-07-22'
lifecycle: active
verification: verified
artifacts:
  - 'raw/075_DALL·E Text-to-Image Generation with Transformer Architectures.ko.md'
  - 'raw/075_DALL·E Text-to-Image Generation with Transformer Architectures.commentary.ko.md'
evidence:
  - source_id: ramesh-et-al-2021-dalle
    locator: 'PMLR 139, pp. 8821–8831의 §§1–3·Figures 1–9와 Appendix §§A–C·F–G·Figures 10–14·Listings 1–2의 두 단계 모델·joint token stream·재순위화·zero-shot 평가·실패 조건'
    relation: supports
  - source_id: openai-2021-dalle
    locator: 'Overview, Capabilities와 Summary of approach and prior work의 공개 시연·예시·대조 재순위화·사회 영향 경계'
    relation: contextualizes
  - source_id: openai-2021-dalle-dvae
    locator: 'README와 model_card.md의 Model Details·Model Use·Training Data·Performance and Limitations에 기록된 공개 범위와 dVAE 복원 한계'
    relation: supplements
  - source_id: ramesh-et-al-2022-unclip
    locator: 'arXiv:2204.06125v1, §§2.1–2.2·5.1·6–7과 Appendix C·Table 3의 동결 CLIP 인코더·prior·64×64 확산 디코더·업샘플러·classifier-free guidance, CLIP gradient guidance 대비 및 DALL·E 1 차이'
    relation: supplements
related:
  - source.075
  - source.085
  - concept.dall-e-2
  - concept.transformer
  - concept.자기회귀-생성
  - concept.clip
---
# DALL·E (2021)

> [!note] 학습 안내
> **난이도:** 중급<br>
> **선수 지식:** [[Transformer]], [[자기회귀 생성]]<br>
> **읽고 나면:** DALL·E 1의 이미지 이산화·텍스트-이미지 공동 자기회귀 모델링·후보 재순위화 흐름을 설명하고, 이를 CLIP이나 후속 diffusion 모델과 같은 구조로 오해하지 않을 수 있다.

## 1단계 — 먼저 잡을 핵심

### 한 문장 정의

DALL·E는 2021년 OpenAI가 발표한 120억 매개변수 텍스트-이미지 생성 시스템으로, dVAE가 이미지를 이산 토큰으로 압축하고 디코더 전용 희소 [[Transformer]]가 텍스트 토큰 뒤의 이미지 토큰을 포함한 공동 분포를 자기회귀적으로 학습한다.

여기서 DALL·E는 이름이 같은 후속 제품군 전체가 아니라 원 논문의 첫 모델을 가리킨다. 핵심은 자연어를 완전한 의미 표현으로 바꾸는 별도 텍스트 인코더가 아니라, 텍스트와 이미지 코드를 최대 1,280개 토큰의 한 흐름에 놓은 설계다.

### 먼저 구분할 역할

dVAE는 이미지를 압축하고 복원하며, Transformer는 텍스트와 이미지 토큰의 확률을 모델링한다. 별도의 대조 모델은 여러 생성 후보와 문구의 일치도를 점수화한다. 이 세 역할을 합쳐 “DALL·E 하나의 이해 능력”이라고 부르면 표현·생성·선택의 경계가 사라진다.

## 2단계 — 작동 원리

### 이미지 토큰 만들기

256×256 RGB 이미지는 32×32 격자의 1,024개 범주형 위치로 압축된다. 각 위치가 선택하는 시각 어휘의 범주는 8,192개다. 압축 덕분에 픽셀 channel을 그대로 시퀀스로 다룰 때보다 문맥은 192분의 1로 줄지만, 글자·가는 선·질감 같은 고주파 정보가 손실될 수 있다.

### 공동 토큰 흐름 학습하기

Caption은 최대 256개 BPE 텍스트 토큰이 되고 그 뒤에 1,024개 이미지 토큰이 붙는다. 64층 희소 Transformer는 텍스트와 이미지 양쪽을 다음 토큰 방식으로 예측하며, 정규화한 손실의 가중치는 텍스트 1/8과 이미지 7/8이다.

이미지 토큰은 모든 텍스트 토큰을 볼 수 있고 앞선 이미지 토큰에 조건화된다. 훈련 때 정답 이미지 토큰을 알면 여러 위치의 손실을 함께 계산할 수 있지만, 생성 때는 실제로 뽑은 이미지 토큰을 다음 조건에 넣어야 하므로 순차 표본화가 필요하다.

### 후보 생성과 선택 분리하기

논문의 대표 비교는 문구마다 512개 후보를 표본화하고 CLIP 계열 대조 모델로 재순위화했다. 대조 모델은 DALL·E의 이미지 decoder가 아니며 생성 Transformer의 학습 손실에도 포함되지 않는다. 후보 수와 선택 규칙은 최종 표본 품질과 계산 비용을 함께 바꾸는 별도 추론 조건이다.

## 3단계 — 기술과 근거

### 희소 attention과 계산 규모

Transformer는 텍스트에 causal mask를, 이미지에는 행·열·국소 합성곱 패턴의 희소 attention을 사용한다. 2억 5천만 이미지-텍스트 쌍으로 학습했고, Stage 2에는 16GB V100 GPU 1,024개와 430,000 update가 사용됐다. 120억 매개변수만으로 결과를 설명하면 자료·희소 계산·표본 탐색 비용이 빠진다.

### zero-shot의 의미

원 논문의 zero-shot은 MS-COCO caption에 맞춰 모델을 별도 미세조정하지 않았다는 평가 protocol이다. 해당 개념·문구·유사 이미지가 인터넷 훈련 자료에 전혀 없었다는 뜻은 아니다. 실제로 MS-COCO validation 이미지의 약 21%, CUB 이미지의 약 12%와 겹치는 이미지가 발견됐고, 겹침 제거 전후 지표에는 유의한 차이가 없었다고 보고됐다.

### 성공과 실패를 함께 읽기

MS-COCO 사람 비교에서는 DF-GAN보다 사실적이라는 다수표 90.0%, caption과 더 잘 맞는다는 다수표 93.3%를 받았다. 반면 전문 조류 자료 CUB에서는 선행 최고 방법보다 FID가 거의 40점 나빴다. 여러 객체의 속성 결속과 같은 뜻의 다른 문구에도 결과가 불안정했으므로, 일부 조합 표본을 일반적인 구성적 이해로 확대하지 않는다.

## 검증과 한계

### 구조와 공개 범위에 관한 흔한 오해

DALL·E 1은 GPT-3 가중치에 이미지 decoder를 붙인 제품이 아니다. GPT-3식 디코더 전용 확률 모델링과 규모 확장의 영향을 공유하지만, dVAE와 별도의 64층 joint Transformer를 새로 학습했다. 2021년 공개 저장소도 전체 12B 생성 모델이 아니라 dVAE 부분을 제공했다.

CLIP은 이미지와 텍스트를 비교하는 이중 인코더이며 DALL·E는 이미지 토큰을 생성하는 모델이다. DALL·E 파이프라인이 CLIP 계열 점수를 사용했다는 사실은 두 모델의 학습 목적이나 architecture가 같다는 뜻이 아니다.

### 능력·자료·후대 계보의 경계

새 조합을 그린다는 행동은 인간과 같은 의도·이해·창의성을 입증하지 않는다. 전체 훈련 자료의 출처·권리·동의·편향 구성도 공개되지 않았고 원 논문은 체계적인 편향 감사를 수행하지 않았다.

공식 085 논문으로 직접 비교할 수 있는 후속 모델은 [[DALL·E 2]]의 연구 구조인 unCLIP이다. DALL·E 1은 dVAE의 이산 이미지 토큰을 텍스트 토큰과 함께 자기회귀적으로 예측하지만, unCLIP은 동결된 CLIP 텍스트·이미지 인코더를 공유 좌표계로 사용한다. Prior가 텍스트 조건의 CLIP 이미지 임베딩을 생성하고, 64×64 확산 디코더와 두 업샘플러가 이를 1,024×1,024 이미지로 복원한다. Prior와 기본 디코더가 사용하는 조건 강화는 매 단계의 외부 CLIP gradient guidance가 아니라 classifier-free guidance다. 이 차이는 DALL·E 1이 모든 후속 diffusion 모델의 공통 설계도였다는 주장을 지지하지 않는다.

## 학습 확인

### 확인 질문

1. DALL·E에서 dVAE, 희소 Transformer와 대조 재순위화 모델은 각각 무엇을 하는가?
2. 텍스트 256개와 이미지 1,024개의 공동 흐름은 일반적인 텍스트 encoder–이미지 decoder 설명과 어떻게 다른가?
3. Zero-shot MS-COCO 결과와 일부 조합 예시가 훈련 중 미노출이나 일반적 이해를 보장하지 않는 이유는 무엇인가?

### 다음 문서

- [[075_DALL·E와 이산 이미지 토큰 생성]] — 원 논문의 수치·평가·중복 분석과 raw 설명의 검증 정정을 locator로 확인한다.
- [[085_DALL·E 2와 CLIP 잠재 표현 기반 계층적 확산 생성]] — 후속 unCLIP의 동결 CLIP·prior·계층적 확산 경로를 원 논문 수치와 함께 확인한다.
- [[DALL·E 2]] — DALL·E 1과 달라진 중간 표현·생성 방식·guidance를 개념 중심으로 비교한다.
- [[CLIP]] — 생성 후보를 점수화하는 대조 표현 모델과 이미지 생성기의 역할 차이를 이어서 본다.

## 출처

- [[075_DALL·E와 이산 이미지 토큰 생성]]
- Aditya Ramesh 외, [Zero-Shot Text-to-Image Generation](https://proceedings.mlr.press/v139/ramesh21a.html), ICML 2021, PMLR 139:8821–8831, §§1–3, Figures 1–9와 Appendix §§A–C·F–G, Figures 10–14, Listings 1–2.
- Aditya Ramesh 외, [arXiv 본문·부록 통합본](https://arxiv.org/abs/2102.12092), Appendix §§A–C·F–G, Figures 10–14와 Listings 1–2.
- OpenAI, [DALL·E: Creating images from text](https://openai.com/index/dall-e/), 2021-01-05, Overview, Capabilities와 Summary of approach and prior work.
- OpenAI, [DALL·E dVAE repository and model card](https://github.com/openai/DALL-E), README와 `model_card.md`.
- 공식 085 검증 노트: [[085_DALL·E 2와 CLIP 잠재 표현 기반 계층적 확산 생성]]; 구조 요약: [[DALL·E 2]].
- Aditya Ramesh 외, [Hierarchical Text-Conditional Image Generation with CLIP Latents](https://arxiv.org/abs/2204.06125), 2022, §§2.1–2.2·5.1·6–7과 Appendix C·Table 3.
- 프로젝트 보존 자료: `raw/075_DALL·E Text-to-Image Generation with Transformer Architectures.ko.md`, `raw/075_DALL·E Text-to-Image Generation with Transformer Architectures.commentary.ko.md`.

## 관련 항목

- [[075_DALL·E와 이산 이미지 토큰 생성]]
- [[085_DALL·E 2와 CLIP 잠재 표현 기반 계층적 확산 생성]]
- [[DALL·E 2]]
- [[Transformer]]
- [[자기회귀 생성]]
- [[CLIP]]
