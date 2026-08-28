---
schema_version: 3
id: source.085
page_type: source
title: DALL·E 2와 CLIP 잠재 표현 기반 계층적 확산 생성
aliases:
  - 085_DALL·E 2 Diffusion-Based Text-to-Image Generation with CLIP Guidance
  - DALL·E 2 Diffusion-Based Text-to-Image Generation with CLIP Guidance
  - Hierarchical Text-Conditional Image Generation with CLIP Latents
tags:
  - type/source
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
    locator: 'arXiv:2204.06125v1, §§2.1–2.2·3.1–3.3·5.1–5.5·6·7, Figures 2–17, Tables 1–2, Appendix A–C와 Table 3의 unCLIP 구조·잠재 조작·평가·guidance 비교·한계·학습 조건'
    relation: supports
  - source_id: openai-2022-dalle2
    locator: 'DALL·E 2와 DALL·E 1의 caption matching·photorealism 선호도 비교, 4배 해상도와 제품 편집 기능 소개'
    relation: supplements
  - source_id: mishkin-et-al-2022-dalle2-preview
    locator: System Components·Restrictions·Probes and Evaluations·Deployment의 초기 research preview 기능·접근 통제·필터·편향·오용 위험
    relation: contextualizes
relations:
  - target: source.070
    kind: related
  - target: source.075
    kind: related
  - target: source.084
    kind: related
  - target: concept.자기회귀-생성
    kind: background
learning:
  difficulty:
    entry: intermediate
    target: intermediate
  prerequisites:
    - target: concept.clip
    - target: concept.dall-e-2021
  assumed_knowledge: 없음
  outcomes:
    - 'DALL·E 2 연구 모델인 unCLIP의 사전 모델·확산 디코더·업샘플러 흐름을 설명하고, CLIP 잠재 조건화와 CLIP gradient guidance, 논문 모델과 제품 기능을 구분할 수 있다.'
  next:
    - target: concept.dall-e-2
      reason: DALL·E 2 — unCLIP의 재사용 가능한 구조·평가·배포 경계를 개념 중심으로 정리한다.
    - target: concept.flamingo
      reason: Flamingo — 동결된 사전 학습 구성 요소를 생성기에 연결하되 이미지가 아니라 텍스트를 출력하는 반대 방향을 살펴본다.
---
# DALL·E 2와 CLIP 잠재 표현 기반 계층적 확산 생성

> [!note] 학습 안내
> **난이도:** 중급<br>
> **선수 지식:** [[concept.clip|CLIP]], [[concept.dall-e-2021|DALL·E (2021)]]<br>
> **읽고 나면:** DALL·E 2 연구 모델인 unCLIP의 사전 모델·확산 디코더·업샘플러 흐름을 설명하고, CLIP 잠재 조건화와 CLIP gradient guidance, 논문 모델과 제품 기능을 구분할 수 있다.

## 1단계 — 먼저 잡을 핵심

### 핵심 문장

2022년 DALL·E 2의 연구 모델인 **unCLIP**은 텍스트에서 픽셀을 한 번에 만드는 모델이 아니다. 동결된 [[CLIP]]이 만든 텍스트 표현을 바탕으로 사전 모델(prior)이 가능한 CLIP 이미지 임베딩을 생성하고, 확산 디코더가 그 임베딩을 조건으로 64×64 이미지를 만든 뒤 두 확산 업샘플러가 1,024×1,024까지 확대한다.

이 설계의 핵심은 CLIP을 매 잡음 제거 단계의 외부 채점기로 쓰는 데 있지 않다. 사전 모델과 기본 디코더는 **분류기 없는 유도**(classifier-free guidance)를 사용하며, CLIP은 텍스트와 이미지가 공유하는 잠재 좌표계와 생성 목표를 제공한다. 따라서 원 raw 제목과 본문의 “CLIP 유도 확산”을 고전적인 CLIP gradient guidance로 읽으면 실제 논문 구조가 달라진다.

### 무엇이 바뀌었는가

[[DALL·E (2021)]]는 dVAE의 이산 이미지 토큰을 텍스트 토큰 뒤에 놓고 하나의 Transformer가 순차적으로 예측했다. unCLIP은 텍스트→CLIP 이미지 임베딩→픽셀 이미지라는 계층을 두고, 의미·스타일을 압축한 중간 표현과 그 표현의 여러 시각적 실현을 분리했다. 같은 CLIP 이미지 임베딩을 확률적으로 다시 디코딩하거나 잠재 표현을 보간해 의미는 비슷하고 세부는 다른 변형을 만들 수 있다는 점도 이 구조에서 중요하다.

OpenAI가 2022년 4월 공개한 것은 곧바로 완전 공개된 가중치나 대중용 API가 아니라 제한된 **DALL·E 2 Preview**와 연구 논문이었다. 논문용 unCLIP과 실제 제품 모델은 규모가 비슷했지만, 제품판은 인페인팅과 원치 않는 암기를 줄이기 위한 구조 변경, 더 긴 학습과 별도의 미학·안전 필터 자료를 사용했다. 논문의 실험 결과와 제품의 기능·배포 결과를 같은 모델 사양으로 합치지 않는다.

## 2단계 — 작동 원리

### 1단계: CLIP이 비교 공간을 만든다

연구진은 ViT-H/16 이미지 인코더와 Transformer 텍스트 인코더를 약 6억 5천만 장의 이미지 규모 자료로 대조 학습했다. 이 CLIP은 이후 사전 모델과 디코더를 학습할 때 동결됐다. 생성 스택이 CLIP의 가중치를 계속 바꾸는 것이 아니라, 이미 학습된 이미지 임베딩 공간을 중간 인터페이스로 삼은 것이다.

한 캡션을 $y$, CLIP 이미지 임베딩을 $z_i$, 최종 이미지를 $x$라고 하면 전체 생성은 다음처럼 분해할 수 있다.

$$
p(x\mid y)=\int p(z_i\mid y)\,p(x\mid z_i,y)\,dz_i
$$

첫 항은 캡션에 어울릴 수 있는 시각 의미·스타일의 분포를, 둘째 항은 그 잠재 표현을 실제 픽셀로 구현하는 분포를 나타낸다.

### 2단계: 사전 모델이 이미지 임베딩을 생성한다

연구진은 자기회귀 사전과 확산 사전을 비교했다. 자기회귀 사전은 1,024차원 CLIP 이미지 임베딩을 PCA로 319차원까지 줄이고 각 차원을 1,024개 구간으로 양자화해 순차 예측했다. 확산 사전은 연속적인 1,024차원 이미지 임베딩을 직접 잡음 제거 대상으로 삼았다.

비슷한 10억 매개변수 규모에서 확산 사전이 더 적은 학습 계산으로 더 나은 결과를 냈다. 표본화 때는 이미지 임베딩 후보 두 개를 만들고 CLIP 텍스트 임베딩과의 내적이 높은 후보를 선택했다. 이는 최종 이미지의 중간 상태를 매번 CLIP으로 재채점하는 절차와 다르다.

### 3단계: 확산 디코더와 업샘플러가 이미지를 만든다

기본 디코더는 GLIDE 계열의 35억 매개변수 확산 모델이다. CLIP 이미지 임베딩을 시간 단계 임베딩에 더하고, 네 개의 추가 문맥 토큰으로 투영해 GLIDE 텍스트 인코더 출력 뒤에 붙인다. 디코더 학습에서는 CLIP 조건을 10%, 캡션을 50% 확률로 제거해 조건부·무조건 예측을 함께 학습하고, 생성 때 그 차이를 확대하는 분류기 없는 유도를 사용한다.

기본 디코더는 250회의 표본화 단계로 64×64 이미지를 만든다. 이어 7억 매개변수 업샘플러가 27 DDIM 단계로 256×256까지, 3억 매개변수 업샘플러가 15 DDIM 단계로 1,024×1,024까지 확대한다. 두 업샘플러는 attention·캡션 조건·guidance를 사용하지 않는다. “하나의 텍스트 조건 확산 모델이 처음부터 고해상도를 직접 생성한다”는 요약보다 이 계층을 구분해야 한다.

### 4단계: 변형과 편집의 범위를 나눈다

논문은 입력 이미지의 CLIP 임베딩과 DDIM inversion 잔차를 함께 사용해, 의미와 스타일을 유지하면서 자세·배경·질감이 달라지는 변형을 만들었다. 두 이미지 임베딩의 구면 보간과 CLIP 텍스트 임베딩 차이를 이용한 zero-shot `text diff` 조작도 시연했다.

인페인팅은 초기 Preview의 중요한 기능이지만 논문의 중심 변형 실험과 동일하지 않다. Appendix C는 제품 모델이 인페인팅을 지원하도록 구조를 수정했다고 밝힌다. 제품 페이지가 맥락을 고려한 편집을 소개한 사실과, 스타일·조명 보존을 체계적으로 정량 검증했다는 주장은 서로 다르다.

## 3단계 — 기술과 근거

### 구성 요소와 학습 장부

| 구성 요소 | 논문 모델 조건 | 역할 |
| --- | --- | --- |
| CLIP | ViT-H/16 이미지 인코더, 24층 텍스트 인코더, 약 6.5억 이미지 규모 | 텍스트·이미지 비교 공간 제공, 생성 스택 학습 중 동결 |
| 확산 사전 | 10억 매개변수, batch 4,096, 600,000 iterations | 텍스트 조건으로 연속 CLIP 이미지 임베딩 생성 |
| 64×64 디코더 | 35억 매개변수, batch 2,048, 800,000 iterations | CLIP 이미지 임베딩과 선택적 캡션을 이미지로 복원 |
| 64→256 업샘플러 | 7억 매개변수, batch 1,024, 100만 iterations | 저해상도 이미지를 256×256으로 확대 |
| 256→1024 업샘플러 | 3억 매개변수, batch 512, 100만 iterations | 최종 1,024×1,024 이미지 생성 |

사전·디코더·업샘플러는 약 2억 5천만 장의 DALL·E 자료만 사용했다. 더 잡음이 많은 CLIP 자료까지 생성 스택에 섞으면 초기 평가에서 표본 품질이 나빠졌다고 Appendix C가 기록한다. 논문은 구성 요소별 매개변수와 update를 공개했지만 GPU 수, 총 FLOPs, wall-clock과 이미지 한 장의 지연 시간은 보고하지 않았다.

### 사전 모델이 필요한 이유

작은 비교 모델에서 캡션의 CLIP 텍스트 임베딩만 받는 디코더의 FID는 9.16, 확산 사전을 포함한 전체 unCLIP은 7.99였다. CLIP 텍스트 임베딩을 이미지 임베딩 자리에 그대로 넣는 zero-shot 우회는 16.55로 더 나빴다. 사람 비교에서도 전체 unCLIP은 텍스트 임베딩 전용 디코더보다 사실성 57.0% ±3.1%, 캡션 유사성 53.1% ±3.1%의 선택을 받았다. 텍스트와 이미지 임베딩이 같은 공간에 놓여도 서로 완전히 교환 가능하지 않으며, 조건부 이미지 임베딩 분포를 학습하는 사전 모델이 필요하다는 근거다.

### 품질 하나가 아니라 절충을 평가한다

| GLIDE 대비 unCLIP 승리 확률 | 사실성 | 캡션 유사성 | 다양성 |
| --- | ---: | ---: | ---: |
| 자기회귀 사전 | 47.1% ±3.1% | 41.1% ±3.0% | 62.6% ±3.0% |
| 확산 사전 | 48.9% ±3.1% | 45.3% ±3.0% | 70.5% ±2.8% |

확산 사전 unCLIP은 GLIDE보다 훨씬 다양한 결과를 냈지만, 사실성과 캡션 일치에서는 GLIDE가 근소하게 우세했다. 따라서 “CLIP이 정확한 프롬프트 일치를 보장해 모든 품질 축을 높였다”는 설명은 표의 방향과 맞지 않는다.

MS-COCO 256×256 zero-shot FID는 확산 사전 unCLIP 10.39, 자기회귀 사전 10.63, GLIDE 12.24, DALL·E 1 약 28이었다. 저자들의 최고 성능 주장은 **zero-shot 모델 사이**의 결과다. 지도학습 방식인 Make-A-Scene의 7.55와 같은 열의 전체 최고 기록으로 읽지 않는다. 별도 제품 비교에서는 DALL·E 2가 DALL·E 1보다 캡션 일치에서 71.7%, 사실성에서 88.8% 선호됐고 해상도가 네 배 높았지만, 이는 GLIDE 비교나 실제 사진 판별 실험이 아니다.

## 검증과 한계

### raw 설명의 검증 정정

- **DALL·E 1은 픽셀을 래스터 순서로 생성했다:** 실제 단위는 원시 픽셀이 아니라 dVAE의 이산 이미지 토큰이다. 텍스트 토큰과 이미지 토큰을 하나의 흐름에서 자기회귀적으로 모델링했다.
- **CLIP이 잡음 제거 때마다 부분 이미지를 채점했다:** unCLIP은 사전 모델이 CLIP 이미지 임베딩을 먼저 생성하고 디코더가 그 임베딩에 조건화된다. 사전과 기본 디코더의 guidance도 외부 CLIP gradient가 아니라 분류기 없는 유도다.
- **확산이 자기회귀보다 전역 구도를 본질적으로 더 잘 이해한다:** 원 논문은 이 인과를 검증하지 않았다. unCLIP도 속성-객체 결속, 상대 크기와 복잡한 장면에서 실패했다.
- **인페인팅과 변형은 같은 논문 실험에서 자연스럽게 출현했다:** 변형·보간·text diff는 논문의 직접 실험이지만, 인페인팅은 제품 모델의 별도 구조 변경과 배포 기능으로 구분해야 한다.
- **세심한 자료 큐레이션과 안전 학습이 성공을 보장했다:** Appendix C는 논문·제품 자료의 대략적 규모와 제품판의 미학·안전 필터를 기록하지만, 큐레이션 하나의 효과나 일반적 안전성을 분리해 입증하지 않는다. 시스템 카드도 필터·접근 통제·모니터링을 위험 완화로 설명할 뿐 위험의 제거로 보지 않는다.
- **후속 이미지 생성의 단일 표준 구조가 됐다:** CLIP 잠재 조건화, 교차 어텐션, 픽셀 확산과 잠재 확산은 서로 다른 설계다. Stable Diffusion과 Midjourney의 직접 계보·내부 구조까지 DALL·E 2 논문 하나로 확정할 수 없다.

### 논문이 직접 확인한 실패

unCLIP은 GLIDE보다 객체와 속성을 정확히 묶는 능력이 약했고, 두 도형의 색을 섞거나 상대 크기를 잘못 만들었다. 일관된 글자 생성도 어려웠고 복잡한 장면의 세부가 약했다. 저자들은 CLIP 임베딩의 정보 압축과 64×64 기본 해상도 뒤 업샘플링하는 구조를 가능한 원인으로 보았다.

사실성이 높아질수록 기만적·유해한 콘텐츠를 만들 위험과 생성물을 실제 자료로 오인할 위험도 커진다. Preview 시스템 카드는 인터넷 자료의 성별·인종·문화적 편향, 작은 문구 차이에 따른 큰 결과 변화, 필터 우회와 인페인팅 악용 가능성을 기록했다. 제한된 접근, 프롬프트·업로드 필터, 자동·인간 모니터링은 완화책이지 편향과 오용이 해결됐다는 증거가 아니다.

### 측정 범위의 경계

사실성과 캡션 유사성의 사람 평가는 이미지 쌍을 비교했고, 다양성은 같은 캡션에서 만든 두 4×4 표본 격자를 비교했다. 다양성 평가는 MS-COCO validation caption 1,000개를 사용했다. 미학 평가는 GPT-3가 만든 512개 예술 caption의 표본 2,048개를 CLIP 선형 probe로 점수화한 대리 평가다. 마케팅·디자인·영화·게임·교육·과학에서의 효과, 인간 창작자의 대체·보완, 상업적 성공은 이 논문 실험으로 측정되지 않았다.

모델 가중치·전체 학습 자료·제품 모델의 정확한 하이퍼파라미터는 공개되지 않았다. 초기 Preview는 제한된 인터페이스와 영어 프롬프트 중심의 신뢰 사용자 연구였으므로, 2022년 4월 논문 공개를 즉시 대중화된 공개 모델이나 공개 API와 동일시하지 않는다.

## 학습 확인

### 확인 질문

1. unCLIP의 사전 모델, 64×64 확산 디코더와 두 업샘플러는 각각 무엇을 생성하는가?
2. CLIP 잠재 조건화와 CLIP gradient guidance, 분류기 없는 유도는 어떻게 다른가?
3. GLIDE 비교와 DALL·E 1 제품 비교를 같은 성능 수치로 합치면 안 되는 이유는 무엇인가?

### 다음 문서

- [[concept.dall-e-2|DALL·E 2]] — unCLIP의 재사용 가능한 구조·평가·배포 경계를 개념 중심으로 정리한다.
- [[concept.flamingo|Flamingo]] — 동결된 사전 학습 구성 요소를 생성기에 연결하되 이미지가 아니라 텍스트를 출력하는 반대 방향을 살펴본다.

## 출처

- Aditya Ramesh 외, [Hierarchical Text-Conditional Image Generation with CLIP Latents](https://arxiv.org/abs/2204.06125), arXiv:2204.06125v1, 특히 §§2.1–2.2·3.1–3.3·5.1–5.5·6·7, Figures 2–17, Tables 1–2, Appendix A–C와 Table 3.
- OpenAI, [DALL·E 2](https://openai.com/index/dall-e-2/), DALL·E 1과의 caption matching·photorealism 선호도 비교, 4배 해상도와 제품 편집 기능.
- Pamela Mishkin 외, [DALL·E 2 Preview — Risks and Limitations](https://github.com/openai/dalle-2-preview/blob/main/system-card.md), 2022-04-11, System Components·Restrictions·Probes and Evaluations·Deployment.
- 프로젝트 번역·검토 출발 자료: [DALL·E 2: Diffusion-Based Text-to-Image Generation with CLIP Guidance](https://mbrenndoerfer.com/writing/dalle2-diffusion-text-to-image-generation-clip-guidance).
- 프로젝트 보존 자료: `raw/085_DALL·E 2 Diffusion-Based Text-to-Image Generation with CLIP Guidance.ko.md`, `raw/085_DALL·E 2 Diffusion-Based Text-to-Image Generation with CLIP Guidance.commentary.ko.md`.

## 관련 항목

- [[concept.dall-e-2|DALL·E 2]]
- [[concept.flamingo|Flamingo]]
- [[concept.clip|CLIP]]
- [[concept.dall-e-2021|DALL·E (2021)]]
- [[source.070|CLIP과 대조적 언어-이미지 사전 학습]]
- [[source.075|DALL·E와 이산 이미지 토큰 생성]]
- [[source.084|Flamingo와 게이트 교차 어텐션 기반 퓨샷 시각-언어 학습]]
- [[concept.자기회귀-생성|자기회귀 생성]]
