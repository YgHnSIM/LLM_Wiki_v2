---
schema_version: 2
id: source.086
page_type: source
title: 잠재 확산 모델과 Stable Diffusion v1 공개
aliases:
  - 086_Stable Diffusion Latent Diffusion Models for Accessible Text-to-Image Generation
  - Stable Diffusion Latent Diffusion Models for Accessible Text-to-Image Generation
  - High-Resolution Image Synthesis With Latent Diffusion Models
tags:
  - type/source
  - domain/ai
  - domain/computer-science
  - domain/computer-vision
  - domain/machine-learning
  - domain/nlp
created: '2026-07-22'
updated: '2026-07-22'
lifecycle: active
verification: verified
artifacts:
  - 'raw/086_Stable Diffusion Latent Diffusion Models for Accessible Text-to-Image Generation.ko.md'
  - 'raw/086_Stable Diffusion Latent Diffusion Models for Accessible Text-to-Image Generation.commentary.ko.md'
evidence:
  - source_id: rombach-et-al-2022-ldm
    locator: 'CVPR 2022, pp. 10684–10695, §§1·3.1–3.3·4.1–4.5·5, Figures 1·3·6–7, Tables 1–3과 Supplement Tables 8·10·15 및 §§D.2.1·F–G의 두 단계 LDM·압축률 절충·교차 어텐션·과제별 평가·훈련 조건·한계'
    relation: supports
  - source_id: compvis-2022-stable-diffusion-v1-repository
    locator: 'README의 Stable Diffusion v1 절과 Text-to-Image reference sampling script: f=8 autoencoder, 860M U-Net, 고정 CLIP ViT-L/14, 최소 10GB 기준, 기본 512×512·50 PLMS step·CFG scale 7.5, safety checker·watermark'
    relation: supplements
  - source_id: compvis-2022-stable-diffusion-v1-model-card
    locator: 'Model Details·Limitations and Bias·Safety Module·Training·Evaluation Results·Environmental Impact: v1-1–v1-4 계보, H×W×3→H/8×W/8×4, CLIP token cross-attention, 10% condition dropout, 256 A100·batch 2048, 자료·평가·편향·손실 압축·중복 기억'
    relation: supports
  - source_id: stability-ai-2022-stable-diffusion-public-release
    locator: '2022-08-22 공개 발표의 code·weights·model card, CreativeML OpenRAIL-M, 조정 가능한 safety classifier와 release build 6.9GB VRAM 설명'
    relation: contextualizes
related:
  - concept.stable-diffusion
  - concept.잠재-확산-모델
  - concept.clip
  - concept.dall-e-2
  - source.085
  - analysis.사전-학습-지식은-과제에-어떻게-도착하는가
  - analysis.훈련-병렬성과-생성-순차성은-다른-축이다
---
# 잠재 확산 모델과 Stable Diffusion v1 공개

> [!note] 학습 안내
> **난이도:** 중급<br>
> **선수 지식:** [[CLIP]], [[DALL·E 2]], [[잠재 확산 모델]]<br>
> **읽고 나면:** CVPR 2022의 일반 [[잠재 확산 모델]] 연구와 2022년 8월 공개된 [[Stable Diffusion]] v1을 분리하고, 오토인코더·잠재 U-Net·CLIP 텍스트 조건·분류기 없는 유도의 역할과 계산·공개성·안전성 주장의 실제 범위를 설명할 수 있다.

## 1단계 — 먼저 잡을 핵심

### 핵심 문장

**잠재 확산 모델(Latent Diffusion Model, LDM)**은 고해상도 픽셀에서 잡음 제거 신경망을 반복 실행하는 대신, 사전 학습한 오토인코더가 만든 더 작은 2차원 잠재 공간에서 확산을 수행한다. [[Stable Diffusion]] v1은 이 일반 연구를 다운샘플링 계수 8의 오토인코더, 860M U-Net과 동결된 [[CLIP]] ViT-L/14 텍스트 인코더로 구체화해 코드와 가중치를 공개한 별도의 2022년 체크포인트 계열이다.

이 구분이 중요하다. 2021년 12월 공개되고 CVPR 2022에 실린 LDM 논문은 비조건부 생성·텍스트-이미지·레이아웃-이미지·초해상도·인페인팅을 비교한 **모델 계열의 연구**다. 2022년 8월 22일 공개된 Stable Diffusion v1은 그 설계를 바탕으로 LAION 계열 자료에서 새로 훈련한 **텍스트-이미지 배포물**이다. 논문 속 1.45B 텍스트 LDM의 하이퍼파라미터와 평가를 공개 v1-4 체크포인트의 사양으로 옮기면 안 된다.

### 무엇이 달라졌는가

LDM은 이미지 생성의 일을 두 단계로 나눴다. 첫 오토인코더가 사람이 지각하는 구조를 가능한 한 남기면서 픽셀의 중복과 고주파 세부를 압축하고, 둘째 확산 모델이 그 잠재 공간의 의미 있는 변이를 학습한다. 압축이 너무 약하면 계산 이점이 작고 너무 강하면 복원 세부를 잃는다. 원 논문은 같은 계산 예산의 비교에서 대체로 $f=4$와 $f=8$이 품질과 처리량 사이의 좋은 절충임을 보였다.

Stable Diffusion v1의 역사적 차이는 효율적인 구조와 배포 방식을 함께 놓은 데 있다. 사용자는 코드·모델 카드·체크포인트를 내려받아 로컬에서 추론하고 수정할 수 있었다. 그러나 CreativeML OpenRAIL-M은 금지 용도를 둔 사용 제한 면허였고, 기초 모델의 전체 훈련은 여전히 대규모 A100 자원을 사용했다. 따라서 **공개 가중치로 재사용 문턱이 낮아진 사실**과 **아무 제약 없이 누구나 같은 모델을 처음부터 훈련할 수 있다는 주장**을 구분해야 한다.

## 2단계 — 작동 원리

### 1단계: 오토인코더가 지각 압축을 맡는다

인코더 $E$는 이미지 $x$를 잠재 $z=E(x)$로 바꾸고, 디코더 $D$는 최종 잠재를 $\hat{x}=D(z)$로 복원한다. LDM 논문의 첫 단계는 지각 손실과 패치 판별기의 적대적 목적을 사용하고, 잠재에는 약한 KL 또는 벡터 양자화 정규화를 적용했다. Stable Diffusion v1은 이 가운데 KL 정규화 계열의 오토인코더를 사용한다.

v1에서 512×512×3 이미지는 64×64×4 잠재가 된다. 가로와 세로가 각각 8분의 1이므로 **공간 위치는 64분의 1**이지만, 채널까지 포함한 스칼라는 786,432개에서 16,384개로 줄어 **48분의 1**이다. 신경망의 실제 메모리와 FLOPs는 층 폭·어텐션·중간 활성에도 좌우되므로 이 숫자를 “연산이 정확히 64배 감소했다”로 바꾸지 않는다.

### 2단계: U-Net이 잠재 잡음을 예측한다

오토인코더를 먼저 학습한 뒤 고정하고, 깨끗한 잠재 $z_0$에 시간 $t$에 맞는 가우스 잡음 $\epsilon$을 섞어 $z_t$를 만든다. 시간 조건부 U-Net $\epsilon_\theta$는 잡음 잠재와 조건 $c$를 받아 더해진 잡음을 예측한다.

$$
z_t=\sqrt{\bar{\alpha}_t}z_0+\sqrt{1-\bar{\alpha}_t}\epsilon,
\qquad
\mathcal{L}=\mathbb{E}\left[\lVert\epsilon-\epsilon_\theta(z_t,t,c)\rVert_2^2\right]
$$

생성 때는 무작위 잠재 잡음에서 시작해 U-Net을 여러 차례 호출하고, 마지막 잠재만 디코더로 픽셀 이미지로 바꾼다. 잠재 공간은 각 호출의 공간 비용을 줄이지만 확산 표본화의 순차성 자체를 없애지는 않는다.

### 3단계: 텍스트 토큰이 교차 어텐션으로 들어간다

원 LDM은 조건 인코더 $\tau_\theta(y)$가 만든 토큰 표현을 U-Net의 교차 어텐션에 넣는 일반 인터페이스를 제시했다. U-Net의 평탄화된 중간 시각 특징이 질의 $Q$가 되고, 조건 토큰의 투영이 키 $K$와 값 $V$가 된다.

$$
\operatorname{Attention}(Q,K,V)=\operatorname{softmax}\left(\frac{QK^\top}{\sqrt d}\right)V
$$

Stable Diffusion v1에서는 동결된 CLIP ViT-L/14 텍스트 인코더의 **비풀링 토큰 출력**이 조건이 된다. 이는 [[DALL·E 2]]의 사전 모델이 CLIP 이미지 임베딩을 먼저 생성하고 확산 디코더가 그 임베딩을 복원하는 구조와 다르다. 또한 생성 중인 이미지를 CLIP 이미지 인코더로 매 단계 채점해 기울기를 되돌리는 CLIP gradient guidance도 아니다.

### 4단계: 분류기 없는 유도로 조건 강도를 조절한다

v1-3와 v1-4는 훈련 예제의 10%에서 텍스트 조건을 버려 같은 U-Net이 조건부·무조건부 잡음 예측을 모두 배우게 했다. 생성 때 두 예측의 차이를 확대한다.

$$
\epsilon_{\mathrm{cfg}}=\epsilon_{\mathrm{uncond}}+s\left(\epsilon_{\mathrm{cond}}-\epsilon_{\mathrm{uncond}}\right)
$$

공식 reference script의 기본값은 512×512, 50 PLMS 단계와 guidance scale 7.5였다. $s$를 높이면 프롬프트 조건을 강하게 따르는 경향이 있지만 다양성이 줄거나 형태·색이 과장될 수 있다. 이 절충은 별도 이미지 분류기를 학습하는 classifier guidance와도 구분한다.

## 3단계 — 기술과 근거

### LDM 논문과 Stable Diffusion v1의 장부

| 구분 | CVPR 2022 LDM 텍스트-이미지 실험 | Stable Diffusion v1-4 공개 체크포인트 |
| --- | --- | --- |
| 연구·배포 단위 | 여러 과제를 다루는 LDM 논문의 한 실험 | LDM을 구체화한 별도 v1 체크포인트 계열 |
| 첫 단계 | 사전 학습한 $f=8$ KL 오토인코더 | $f=8$, H×W×3→H/8×W/8×4 |
| 확산 U-Net | 1.45B | 860M |
| 텍스트 조건 | BERT tokenizer와 학습 가능한 unmasked Transformer | 동결 CLIP ViT-L/14, 123M |
| 자료 | LAION-400M | LAION-2B(en)과 고해상도·미학 필터 부분집합의 연속 훈련 |
| 보고된 훈련 | 390K iterations, batch 680, 단일 A100 | v1-4는 v1-2에서 재개해 225K steps, 512×512, 10% condition dropout; 전체 기록은 32×8 A100, batch 2048 |
| 배포 | 연구 코드·논문 모델 계열 | code·weights·model card, CreativeML OpenRAIL-M |

Stable Diffusion v1-4만 떼어 “225K 단계로 처음부터 학습했다”고 말해도 부정확하다. v1-4는 v1-2 체크포인트에서 재개됐고, v1-2는 다시 v1-1의 256×256·512×512 학습 뒤 이어졌다. 모델 카드의 225K는 이 계보 마지막 구간이다.

### 논문이 직접 비교한 계산 절충

원 논문은 같은 매개변수 규모·같은 500K iteration·단일 A100 조건에서 압축률을 바꾸어 비조건부 생성을 비교했다. $f=1$은 픽셀 공간에 가까워 느렸고, $f=16$·$32$는 압축으로 세부를 잃었다. $f=4$와 $f=8$이 처리량과 FID의 절충에서 가장 좋은 결과를 보인 구간이었다. 이는 특정 자료·모델·예산의 비교이지, 모든 LDM이 모든 픽셀 확산보다 일정 배수 빠르다는 보편 법칙이 아니다.

텍스트-이미지 Table 2에서 classifier-free guidance를 쓴 LDM-KL-8-G의 MS-COCO FID는 12.61이었다. 같은 표에는 unguided LDM-KL-8 23.35, DALL·E 약 27.50, CogView 27.10, Lafite 26.94가 실렸고 LDM-KL-8-G가 이 비교의 가장 낮은 FID를 기록했다. GLIDE 12.24는 DALL·E 2 논문의 별도 비교표 수치이므로 이 표에 넣지 않는다. 한 MS-COCO FID 비교를 모든 모델·품질 축의 우위로 확대하지 않으며, 논문의 strongest state-of-the-art 주장은 인페인팅과 클래스 조건 ImageNet 같은 과제에 묶어 읽어야 한다. 인페인팅 모델의 처리량과 초해상도 결과도 별도 과제 모델의 수치이므로 Stable Diffusion v1 텍스트 체크포인트의 기능·속도로 옮기지 않는다.

### 로컬 추론과 전체 훈련을 분리한다

2022년 8월 공개 글은 릴리스 빌드의 최종 메모리 사용량을 약 6.9GB VRAM으로 적었고, 원 CompVis 저장소의 reference 환경은 최소 10GB GPU를 요구했다. 현재 Diffusers 모델 카드에는 반정밀도와 메모리 최적화로 4GB 미만을 겨냥한 예도 있다. 이 수치들은 정밀도·구현·batch·해상도·샘플러가 다른 조건이므로 “Stable Diffusion은 6GB에서 항상 실행된다”는 하나의 사양으로 합치지 않는다.

반면 모델 카드가 기록한 훈련 하드웨어는 32×8 A100, batch 2048이다. 공개 가중치 덕분에 **추론·미세조정·연구 재사용**의 접근성이 넓어진 것과, **기초 체크포인트 전체 훈련**이 개인용 하드웨어로 가능해진 것은 서로 다른 주장이다.

## 검증과 한계

### raw 설명의 검증 정정

- **DALL·E 2와 Imagen은 매 단계 전체 고해상도 픽셀을 직접 처리했다:** DALL·E 2는 64×64 기본 확산 뒤 두 업샘플러를 사용했고 Imagen도 64×64 기본 모델과 초해상도 확산을 계층적으로 결합했다. 폐쇄형 서비스의 높은 자원 요구와 “항상 최종 해상도에서 직접 확산”은 같은 주장이 아니다.
- **512×512에서 64×64가 되므로 값과 계산이 64분의 1이다:** 공간 위치는 64분의 1이지만 v1의 4개 잠재 채널을 포함한 스칼라는 RGB 대비 48분의 1이다. 실제 계산량은 이 비율과 같지 않다.
- **VAE 디코더가 전체 품질을 보존하므로 압축은 드러나지 않는다:** 첫 단계는 손실 압축이며, 글자·선·얼굴·고정밀 픽셀 과제에서 정보 손실이 병목이 될 수 있다.
- **안전 제약이 모델 훈련에 포함돼 문제 출력을 막았다:** v1의 미학·watermark 필터 자료와 condition dropout은 확인되지만, reference pipeline의 NSFW checker와 invisible watermark는 생성 뒤 붙는 구성 요소다. 공개 글도 checker의 parameter를 조절할 수 있다고 밝혔다.
- **완전한 오픈소스로 아무 제한 없이 배포됐다:** code와 weights는 내려받을 수 있었지만 CreativeML OpenRAIL-M은 사용 제한을 포함한다. 공개 가중치·공개 코드·OSI식 open source·public domain을 같은 말로 쓰지 않는다.
- **예술·게임·마케팅·교육·상업을 혁신했다:** 그러한 채택 사례와 생태계 영향은 별도 역사 연구가 필요한 주장이다. LDM 논문과 v1 모델 카드는 각 분야의 생산성·노동·시장 효과를 통제 실험하지 않았다.

### 모델과 자료의 직접 한계

LDM은 잠재 공간에서도 U-Net을 순차적으로 여러 번 호출하므로 GAN보다 느릴 수 있다. 손실 오토인코더는 픽셀 정밀도가 중요한 과제에서 상한이 된다. Stable Diffusion v1 모델 카드는 완전한 사진 사실성, 읽을 수 있는 글자, `빨간 정육면체 위의 파란 구` 같은 조합 관계, 얼굴과 사람 생성에 실패할 수 있다고 기록한다.

v1은 주로 영어 설명 자료에서 학습돼 다른 언어에서 성능이 낮을 수 있다. LAION-5B 계열에는 성인 자료가 포함됐고 추가적인 데이터 중복 제거를 하지 않아, 중복 이미지에서 어느 정도 기억이 관찰됐다. 서구·백인 문화가 기본값처럼 나타나는 편향도 모델 카드에 명시됐다.

LDM 논문은 낮아진 생성 비용이 창작뿐 아니라 조작 자료·허위정보·스팸과 비동의 딥페이크의 생산도 쉽게 만들 수 있고, 여성에게 불균형한 피해를 줄 수 있다고 경고했다. 훈련 자료 추출 가능성의 범위도 당시 이미지 확산 모델에서 충분히 이해되지 않았다고 적었다. 생성 뒤 safety checker는 이러한 자료·면허·사회적 위험을 제거하지 않는다.

### 공개성과 영향의 측정 경계

코드·가중치·모델 카드를 함께 공개했고 reference implementation이 로컬 실행을 지원했다는 사실은 직접 확인할 수 있다. 그러나 “공개 때문에 후속 AI 정책이 바뀌었다”, “기술이 완전히 민주화됐다”, “모든 전문 분야의 생산성이 높아졌다”는 인과는 네 1차 자료만으로 입증되지 않는다. 접근성은 실행 자원·기술 지식·면허·안전·법률 비용을 함께 측정해야 한다.

## 학습 확인

### 확인 질문

1. CVPR 2022의 LDM 연구와 Stable Diffusion v1-4를 같은 모델 사양으로 읽으면 어떤 훈련·조건화 오류가 생기는가?
2. 512×512×3에서 64×64×4로 옮길 때 공간 위치 수와 스칼라 수의 감소율은 각각 얼마인가?
3. CLIP 텍스트 조건, 교차 어텐션, classifier-free guidance와 CLIP gradient guidance는 각각 어디에서 작동하는가?

### 다음 문서

- [[잠재 확산 모델]] — 두 단계 학습, 압축률 절충과 조건부 생성 인터페이스를 개념 중심으로 다시 본다.
- [[Stable Diffusion]] — 공개 v1의 구체적인 체크포인트 계보·추론·면허·한계를 정리한다.
- [[DALL·E 2]] — CLIP 이미지 잠재를 생성하는 prior와 픽셀 확산 계층을 대조한다.
- [[훈련 병렬성과 생성 순차성은 다른 축이다]] — 잠재 공간에서 호출 비용이 줄어도 반복 표본화가 남는 이유를 비교한다.

## 출처

- Robin Rombach 외, [High-Resolution Image Synthesis With Latent Diffusion Models](https://openaccess.thecvf.com/content/CVPR2022/html/Rombach_High-Resolution_Image_Synthesis_With_Latent_Diffusion_Models_CVPR_2022_paper.html), CVPR 2022, pp. 10684–10695, 특히 §§1·3.1–3.3·4.1–4.5·5, Figures 1·3·6–7, Tables 1–3과 [Supplement](https://openaccess.thecvf.com/content/CVPR2022/supplemental/Rombach_High-Resolution_Image_Synthesis_CVPR_2022_supplemental.pdf) Tables 8·10·15 및 §§D.2.1·F–G.
- CompVis, [Stable Diffusion 공식 저장소](https://github.com/CompVis/stable-diffusion), Stable Diffusion v1·reference sampling·image modification 절.
- Robin Rombach·Patrick Esser, [Stable Diffusion v1-4 Model Card](https://huggingface.co/CompVis/stable-diffusion-v1-4), Model Details·Limitations and Bias·Safety Module·Training·Evaluation Results·Environmental Impact.
- Stability AI, [Stable Diffusion Public Release](https://stability.ai/news-updates/stable-diffusion-public-release), 2022-08-22, 면허·safety classifier·6.9GB VRAM 공개 설명.
- 프로젝트 번역·검토 출발 자료: [Stable Diffusion: Latent Diffusion Models for Accessible Text-to-Image Generation](https://mbrenndoerfer.com/writing/stable-diffusion-latent-diffusion-text-to-image-generation).
- 프로젝트 보존 자료: `raw/086_Stable Diffusion Latent Diffusion Models for Accessible Text-to-Image Generation.ko.md`, `raw/086_Stable Diffusion Latent Diffusion Models for Accessible Text-to-Image Generation.commentary.ko.md`.

## 관련 항목

- [[잠재 확산 모델]]
- [[Stable Diffusion]]
- [[CLIP]]
- [[DALL·E 2]]
- [[085_DALL·E 2와 CLIP 잠재 표현 기반 계층적 확산 생성]]
- [[사전 학습 지식은 과제에 어떻게 도착하는가]]
- [[훈련 병렬성과 생성 순차성은 다른 축이다]]
