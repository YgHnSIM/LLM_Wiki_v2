---
schema_version: 3
id: concept.dall-e-2
page_type: concept
title: DALL·E 2
aliases:
  - DALL-E 2
  - 달리 2
  - unCLIP
  - CLIP 잠재 확산 이미지 생성 모델
tags:
  - type/concept
  - domain/ai
  - domain/computer-science
  - domain/computer-vision
  - domain/machine-learning
  - domain/nlp
created: '2026-07-22'
updated: '2026-07-22'
editorial_status: active
review:
  evidence_coverage: verified
  content_mode: descriptive
artifacts:
  - raw/085_DALL·E 2 Diffusion-Based Text-to-Image Generation with CLIP Guidance.ko.md
  - raw/085_DALL·E 2 Diffusion-Based Text-to-Image Generation with CLIP Guidance.commentary.ko.md
evidence:
  - source_id: ramesh-et-al-2022-unclip
    locator: 'arXiv:2204.06125v1, §§2.1–2.2·3.1–3.3·5.1–5.5·6·7, Figures 2–17, Tables 1–2와 Appendix A–C·Table 3의 unCLIP 구조·prior 비교·평가·guidance 비교·이미지 조작·한계·제품 변경'
    relation: supports
  - source_id: openai-2022-dalle2
    locator: 'DALL·E 2 소개 페이지의 DALL·E 1 대비 caption matching·photorealism 선호도와 4배 해상도, 생성·편집·variation 제품 소개'
    relation: contextualizes
  - source_id: mishkin-et-al-2022-dalle2-preview
    locator: 'DALL·E 2 Preview system card의 model·system 범위, 초기 access control, prompt·image filter, monitoring, bias·deception·harmful content 위험과 제한'
    relation: supplements
relations:
  - target: concept.transformer
    kind: related
learning:
  difficulty:
    entry: intermediate
    target: intermediate
  prerequisites:
    - target: concept.clip
    - target: concept.dall-e-2021
  assumed_knowledge: 없음
  outcomes:
    - 'DALL·E 2 논문의 unCLIP을 text → CLIP image embedding → diffusion decoder로 설명하고, 이 학습된 조건부 생성을 CLIP gradient guidance·DALL·E 1·Preview 제품 기능과 구분할 수 있다.'
  next:
    - target: source.085
      reason: 085DALL·E 2와 CLIP 잠재 표현 기반 계층적 확산 생성 — unCLIP 논문의 구조·평가·한계와 제품 변경을 locator로 확인한다.
    - target: analysis.사전-학습-지식은-과제에-어떻게-도착하는가
      reason: 사전 학습 지식은 과제에 어떻게 도착하는가 — 동결된 표현과 학습된 연결부가 실제 생성 과제로 전달되는 방식을 비교한다.
---
# DALL·E 2

> [!note] 학습 안내
> **난이도:** 중급<br>
> **선수 지식:** [[concept.clip|CLIP]], [[concept.dall-e-2021|DALL·E (2021)]]<br>
> **읽고 나면:** DALL·E 2 논문의 unCLIP을 text → CLIP image embedding → diffusion decoder로 설명하고, 이 학습된 조건부 생성을 CLIP gradient guidance·DALL·E 1·Preview 제품 기능과 구분할 수 있다.

## 1단계 — 먼저 잡을 핵심

### 한 문장 정의

**DALL·E 2**는 문장을 바로 화소로 바꾸는 하나의 모델이 아니라, 동결된 [[CLIP]] 표현 공간에서 텍스트에 대응하는 image embedding을 생성하는 **prior**와 그 embedding을 이미지로 복원하는 **diffusion decoder 계층**을 결합한 2022년 텍스트-이미지 생성 시스템이다.

원 논문은 이 구조를 **unCLIP**이라 부른다. CLIP이 image에서 embedding을 만드는 방향을 거꾸로 풀어, 먼저 caption으로 CLIP image embedding을 예측하고 그 embedding에서 image를 생성하기 때문이다.

### 논문과 제품을 나눠 읽는다

논문의 unCLIP 실험 시스템과 사용자에게 공개된 DALL·E 2 Preview는 완전히 같은 실체가 아니다. 논문 부록에 따르면 제품 모델은 유사한 크기였지만 architecture·훈련 기간·미학과 안전을 위해 필터링한 자료가 달랐고, inpainting과 원치 않는 기억을 줄이는 변경도 추가됐다. 따라서 논문의 평가 수치를 모든 제품 기능의 효과로 읽지 않는다.

### DALL·E 1과 바뀐 단위

[[DALL·E (2021)]]은 dVAE가 만든 이산 image token을 caption token 뒤에 놓고 자기회귀적으로 생성했다. “색상 화소를 하나씩 그렸다”고 설명하면 32×32 격자의 이산 시각 코드와 원래 화소를 혼동한다. DALL·E 2는 이 image-token 시퀀스 대신 CLIP image embedding을 중간 의미 표현으로 삼고, 연속적 노이즈 제거 과정으로 image를 복원했다.

## 2단계 — 작동 원리

### 1. Caption에서 CLIP image embedding을 생성한다

동결된 CLIP text encoder가 caption embedding을 만든다. Prior는 caption과 그 text embedding에 조건화되어 같은 caption의 image에 대응할 CLIP image embedding $z_i$를 생성한다.

논문은 압축·양자화한 embedding을 순차적으로 예측하는 autoregressive prior와, 연속 embedding에 노이즈를 넣었다가 제거하는 diffusion prior를 비교했다. 유사한 모델 크기와 더 적은 계산에서 diffusion prior의 품질이 더 높았고, 최고 보고 설정에서도 diffusion prior가 더 나았다.

### 2. Decoder가 64×64 image를 복원한다

3.5B 매개변수의 base decoder는 GLIDE를 바탕으로 한 diffusion 모델이다. CLIP image embedding을 timestep embedding에 더하고, 네 개의 추가 context token으로 투영해 text encoder 출력에 붙인다. Caption 조건도 함께 사용하며 250번의 sampling step으로 64×64 image를 만든다.

훈련 때 CLIP embedding을 10%, caption을 50% 확률로 비워 조건부·비조건부 예측을 한 모델이 배우게 한다. 추론에서 두 예측의 차이를 키우는 **classifier-free guidance**가 조건을 더 강하게 반영한다.

이 설계는 매 denoising step에서 중간 image를 CLIP에 다시 넣고 text-image similarity gradient로 이끄는 **CLIP gradient guidance**가 아니다. CLIP은 사전 학습된 조건 표현을 제공하고, 확산 decoder 자체가 조건부·비조건부 점수를 산출한다.

### 3. 두 upsampler가 1024×1024로 키운다

700M 모델이 64×64에서 256×256으로, 300M 모델이 256×256에서 1024×1024로 해상도를 높인다. 각각 27번의 DDIM step과 15번의 step을 사용하며, 논문의 upsampler에는 attention·caption conditioning·guidance가 없다. 따라서 고해상도를 만들어 내는 단계와 caption의 핵심 구성을 정하는 단계를 나눠 봐야 한다.

### Variations·interpolation·editing의 위치

입력 이미지를 CLIP image embedding $z_i$와 DDIM inversion으로 얻은 residual latent $x_T$의 이중 표현으로 바꾼 뒤, $\eta>0$인 DDIM 표본화를 수행하면 의미와 style은 공유하지만 세부가 다른 variation이 나온다. 두 CLIP image embedding 사이를 spherical interpolation하거나 CLIP text embedding의 차이를 image embedding에 적용하는 조작도 논문에서 실험했다.

반면 영역을 지정해 바꾸는 inpainting은 제품 버전에 추가된 architecture 변경이다. 논문의 variation 실험과 Preview의 편집 interface를 같은 근거로 묶지 않는다.

## 3단계 — 기술과 근거

### 표현 학습과 생성 학습의 자료

논문의 CLIP은 CLIP dataset과 DALL·E dataset에서 균등 표본화한 약 6억 5천만 image로 훈련됐다. ViT-H/16 image encoder는 256×256 입력, width 1,280, 32 block을 사용했고 text encoder는 width 1,024, 24 block이었다.

이와 달리 prior·decoder·upsampler는 노이즈가 더 많은 CLIP dataset을 합치지 않고 약 2억 5천만 image의 DALL·E dataset만 사용했다. 전자는 넓은 의미 정렬을, 후자는 생성 품질을 위한 학습 조건이었으므로 “DALL·E 2가 6억 5천만 image로 전체 훈련됐다”고 줄이면 단계별 자료가 혼합된다.

### Prior가 필요했던 이유

작은 비교 모델에서 CLIP text embedding만 decoder에 직접 넣은 모델의 FID는 9.16이었고 prior를 포함한 unCLIP은 7.99였다. 또 모델이 예측한 image embedding 대신 CLIP text embedding을 zero-shot으로 decoder에 넣으면 FID가 16.55로 악화됐다. Caption과 image를 같은 공간에 놓는 것과, 생성기가 요구하는 image embedding 분포를 예측하는 것은 같은 문제가 아니었다.

사람 평가에서도 전체 unCLIP은 text-embedding decoder보다 photorealism 57.0%±3.1, caption similarity 53.1%±3.1의 선호를 받았다. 다만 이는 두 특정 구조 사이의 pairwise 비교이지 일반적 사실성이나 언어 이해를 보증하는 절대 점수가 아니다.

### GLIDE와의 비교는 품질과 다양성을 나눈다

MS-COCO zero-shot FID는 diffusion prior unCLIP이 10.39, autoregressive prior unCLIP이 10.63, GLIDE가 12.24였다. 낮은 FID로는 unCLIP이 앞섰지만, 사람의 직접 비교에서 diffusion-prior unCLIP이 GLIDE보다 좋은 쪽으로 선호된 비율은 photorealism 48.9%±3.1, caption similarity 45.3%±3.0이었다. 반면 diversity 선호는 70.5%±2.8이었다. DALL·E 2를 모든 품질 차원에서 일관되게 우월한 모델로 요약하지 않는 이유다.

### DALL·E 1 대비 제품 평가

OpenAI의 제품 소개 평가에서 DALL·E 2 이미지는 DALL·E 1보다 caption matching에서 71.7%, photorealism에서 88.8% 선호됐고 해상도는 4배 커졌다. 이 수치는 공개 제품과 이전 세대의 비교로는 의미가 있지만, 임의의 만든 image 생성 시스템과의 공통 benchmark가 아니며 “사진을 항상 올바르게 그린다”는 성능 보증도 아니다.

## 검증과 한계

### 구성·글자·세부 묘사의 실패

논문은 unCLIP이 GLIDE보다 객체에 속성을 올바르게 묶는 능력이 낮았다고 보고했다. 색과 객체, 상대적 크기를 섞었고 읽을 수 있는 글자를 안정적으로 만들지 못했다. Base decoder가 64×64에서 먼저 장면을 정하므로 복잡한 장면의 작은 세부도 빠질 수 있다.

CLIP embedding은 주제·style·전역 의미를 효과적으로 담지만, 문장의 모든 단어와 공간 관계를 손실 없이 보존하는 설계는 아니다. 그러므로 예시 이미지의 유창성을 정확한 object binding이나 상식 이해의 직접 증거로 놓지 않는다.

### 모델 공개와 Preview access의 차이

DALL·E 2 Preview는 선별된 사용자에게 제한적으로 제공된 system이었다. 모델 weight·code·훈련 자료가 공개된 것은 아니므로, web interface를 사용할 수 있었다는 사실을 재현 가능한 오픈소스 모델 공개로 표현하지 않는다. 논문도 완전한 학습 compute·hardware 조건을 보고하지 않았다.

### 안전 장치는 위험 제거 증명이 아니다

Preview system card는 접근 제한, prompt·이미지 filter, 사용 정책, 사람·자동 monitoring을 기록했다. 그럼에도 output은 훈련 자료의 편향과 stereotype을 재생산하고, 속임·유해·성적 content를 만들 수 있었다. 사실적 image가 더 그럴듯해질수록 생성물을 진짜 기록으로 오인할 위험도 커진다.

시스템 카드는 안전 필터와 접근 통제가 작동하더라도 성별·인종·문화에 따른 표현 격차와 작은 prompt 변화에 따른 큰 출력 차이가 남을 수 있다고 기록했다. Filter의 존재와 편향 없는 출력은 같은 뜻이 아니다.

### 시연과 영향 주장의 범위

이미지 생성·variation·editing 시연은 사람과 모델의 탐색적 협업 interface를 보여 준다. 하지만 원 논문은 전문 제작 현장의 생산성, 상업적 성공, 과학적 발견에 미친 효과를 통제 실험하지 않았다. 후대의 영향은 배포·사용 자료와 후속 모델의 직접 근거로 따로 평가해야 한다.

## 학습 확인

### 확인 질문

1. DALL·E 2의 prior와 diffusion decoder는 caption에서 image까지의 어떤 두 문제를 나눠 풀었는가?
2. UnCLIP의 classifier-free guidance가 매 step에 CLIP gradient를 사용하는 방식이 아닌 이유는 무엇인가?
3. 논문의 variation 실험, Preview의 inpainting·안전 시스템, DALL·E 1 대비 제품 선호도를 나눠 기록해야 하는 이유는 무엇인가?

### 다음 문서

- [[source.085|DALL·E 2와 CLIP 잠재 표현 기반 계층적 확산 생성]] — 085DALL·E 2와 CLIP 잠재 표현 기반 계층적 확산 생성 — unCLIP 논문의 구조·평가·한계와 제품 변경을 locator로 확인한다.
- [[analysis.사전-학습-지식은-과제에-어떻게-도착하는가|사전 학습 지식은 과제에 어떻게 도착하는가]] — 동결된 표현과 학습된 연결부가 실제 생성 과제로 전달되는 방식을 비교한다.

## 출처

- [[085_DALL·E 2와 CLIP 잠재 표현 기반 계층적 확산 생성]]
- Aditya Ramesh, Prafulla Dhariwal, Alex Nichol, Casey Chu, Mark Chen, [*Hierarchical Text-Conditional Image Generation with CLIP Latents*](https://arxiv.org/abs/2204.06125), 2022, §§2.1–2.2·3.1–3.3·5.1–5.5·6·7, Figures 2–17, Tables 1–2, Appendix A–C와 Table 3.
- OpenAI, [DALL·E 2](https://openai.com/index/dall-e-2/), 2022, model comparison·image generation·editing·variations·safety overview.
- Pamela Mishkin 외, [DALL·E 2 Preview — Risks and Limitations](https://github.com/openai/dalle-2-preview/blob/main/system-card.md), 2022, system card의 model·deployment scope·risk·mitigation.
- 프로젝트 보존 자료: `raw/085_DALL·E 2 Diffusion-Based Text-to-Image Generation with CLIP Guidance.ko.md`, `raw/085_DALL·E 2 Diffusion-Based Text-to-Image Generation with CLIP Guidance.commentary.ko.md`.

## 관련 항목

- [[source.085|DALL·E 2와 CLIP 잠재 표현 기반 계층적 확산 생성]]
- [[analysis.사전-학습-지식은-과제에-어떻게-도착하는가|사전 학습 지식은 과제에 어떻게 도착하는가]]
- [[concept.clip|CLIP]]
- [[concept.dall-e-2021|DALL·E (2021)]]
- [[concept.transformer|Transformer]]
