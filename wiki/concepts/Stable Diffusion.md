---
schema_version: 3
id: concept.stable-diffusion
page_type: concept
title: Stable Diffusion
aliases:
  - Stable Diffusion v1
  - 스테이블 디퓨전
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
  - raw/086_Stable Diffusion Latent Diffusion Models for Accessible Text-to-Image Generation.ko.md
  - raw/086_Stable Diffusion Latent Diffusion Models for Accessible Text-to-Image Generation.commentary.ko.md
evidence:
  - source_id: rombach-et-al-2022-ldm
    locator: 'CVPR 2022, pp. 10684–10695, §§1·3.1–3.3·4.1–4.5·5와 Figures 1·3·6–7·Tables 1–7 및 Supplement §§D–G·Tables 8–18의 두 단계 잠재 확산·압축률 절충·교차 어텐션·계산·한계'
    relation: contextualizes
  - source_id: compvis-2022-stable-diffusion-v1-repository
    locator: 'README의 Stable Diffusion v1·Requirements·Text-to-Image with Stable Diffusion·Reference Sampling Script 절에 기록된 f=8 오토인코더, 860M U-Net·123M CLIP, 최소 10GB 기준, 512×512·50 PLMS steps·CFG 7.5, code·weights·면허와 배포 경고'
    relation: supports
  - source_id: compvis-2022-stable-diffusion-v1-model-card
    locator: 'Stable Diffusion v1-4 Model Card의 Model Details·Examples·Limitations and Bias·Safety Module·Training·Evaluation Results·Environmental Impact: H×W×3→H/8×W/8×4, 동결 CLIP token 조건, v1-1–v1-4 계보, 10% condition dropout, 256 A100·batch 2048, 4GB 미만 최적화 예, 자료·편향·중복 기억·손실 압축'
    relation: supports
  - source_id: stability-ai-2022-stable-diffusion-public-release
    locator: '2022-08-22 Stable Diffusion Public Release의 code·weights·model card 공개, CreativeML OpenRAIL-M, 조정 가능한 safety classifier, release build 6.9GB VRAM과 NVIDIA 권장 설명'
    relation: contextualizes
relations:
  - target: concept.dall-e-2
    kind: related
learning:
  difficulty:
    entry: intermediate
    target: intermediate
  prerequisites:
    - target: concept.잠재-확산-모델
    - target: concept.clip
  assumed_knowledge: 없음
  outcomes:
    - 'Stable Diffusion v1의 구성·체크포인트 계보·표본화·공개 범위를 설명하고, 이를 일반 잠재 확산 모델 연구나 제한 없는 오픈소스와 구분할 수 있다.'
  next:
    - target: source.086
      reason: 086잠재 확산 모델과 Stable Diffusion v1 공개 — LDM 논문과 공개 v1의 수치·근거·raw 검증 정정을 한 문서에서 대조한다.
    - target: analysis.훈련-병렬성과-생성-순차성은-다른-축이다
      reason: 훈련 병렬성과 생성 순차성은 다른 축이다 — 잠재 공간이 한 단계의 비용을 줄여도 확산 표본화의 순차 U-Net 호출이 남는 이유를 다른 생성 계열과 비교한다.
---
# Stable Diffusion

> [!note] 학습 안내
> **난이도:** 중급<br>
> **선수 지식:** [[concept.잠재-확산-모델|잠재 확산 모델]], [[concept.clip|CLIP]]<br>
> **읽고 나면:** Stable Diffusion v1의 구성·체크포인트 계보·표본화·공개 범위를 설명하고, 이를 일반 잠재 확산 모델 연구나 제한 없는 오픈소스와 구분할 수 있다.

## 1단계 — 먼저 잡을 핵심

### 한 문장 정의

**Stable Diffusion v1**은 다운샘플링 계수 8의 오토인코더가 만든 연속 잠재 공간에서 860M 매개변수 U-Net으로 확산을 수행하고, 동결된 [[CLIP]] ViT-L/14 텍스트 인코더의 토큰 표현을 교차 어텐션 조건으로 사용하는 2022년 텍스트-이미지 체크포인트 계열이다.

이 문서에서 Stable Diffusion은 후대의 모든 Stable Diffusion 제품군이 아니라 2022년에 공개된 v1-1부터 v1-4까지를 가리킨다. Stability AI는 2022년 8월 22일 코드·가중치·모델 카드를 공개했고, CompVis 저장소는 이를 Stability AI·Runway와의 협업 결과이자 기존 [[잠재 확산 모델]] 연구를 구체화한 배포물로 설명한다.

### 일반 LDM과 무엇이 다른가

Rombach 등의 CVPR 2022 논문은 비조건부 생성·텍스트-이미지·레이아웃-이미지·초해상도·인페인팅에 적용하는 **잠재 확산 모델(Latent Diffusion Model, LDM) 계열**을 연구했다. 논문의 텍스트-이미지 실험은 LAION-400M에서 학습한 1.45B 모델이며, BERT 토크나이저와 학습 가능한 Transformer 조건 인코더를 사용했다.

Stable Diffusion v1은 같은 원리를 특정 부품과 자료로 구현한 별도 계보이다. 공개 v1은 $f=8$ 오토인코더, 860M U-Net, 123M 규모의 동결 CLIP ViT-L/14 텍스트 인코더를 사용하고 LAION-2B(en) 계열 부분집합에서 단계적으로 학습됐다. 따라서 LDM 논문의 모든 모델·수치·과제를 Stable Diffusion v1의 사양으로 옮기지 않는다.

### 무엇이 공개됐는가

공식 저장소는 추론·이미지 수정 코드와 가중치 취득 경로를 제공했다. 사용자는 폐쇄형 서비스의 API만 호출하는 대신 체크포인트를 내려받아 로컬에서 실행하고 연구할 수 있었다. 이 배포 선택과 잠재 공간의 낮은 추론 부담이 함께 작용해 재사용 문턱을 낮췄다.

그러나 가중치는 금지 용도를 둔 **CreativeML OpenRAIL-M** 면허로 배포됐다. 코드와 가중치를 내려받을 수 있다는 사실은 확인되지만, 이를 제한 없는 퍼블릭 도메인이나 모든 정의에서의 오픈소스와 같은 뜻으로 쓰지 않는다. 공식 저장소도 v1 가중치를 추가 안전 장치 없이 제품·서비스에 사용하는 일을 권장하지 않고 연구 artifact로 다루라고 명시했다.

## 2단계 — 작동 원리

### 1. 이미지와 잠재 격자를 오토인코더가 잇는다

인코더 $E$는 $H\times W\times3$ RGB 이미지를 $(H/8)\times(W/8)\times4$ 잠재 표현으로 바꾼다. 512×512 입력은 64×64×4 잠재가 된다. 공간 위치는 64분의 1이지만 채널까지 포함한 스칼라 수는 48분의 1이다. 실제 메모리와 연산량은 U-Net 폭·어텐션·중간 활성과 표본화 단계에도 좌우되므로, 이 형태만으로 전체 계산이 정확히 64배 줄었다고 결론 내리지 않는다.

디코더 $D$는 잡음 제거가 끝난 잠재를 다시 픽셀 이미지로 복원한다. 이 오토인코더는 손실 압축이다. 최종 출력 크기가 512×512라는 사실은 글자·얇은 선·얼굴 세부처럼 인코딩에서 잃은 정보를 무손실로 되살린다는 뜻이 아니다.

### 2. 동결된 CLIP이 텍스트 조건을 만든다

프롬프트는 동결된 CLIP ViT-L/14 텍스트 인코더를 거쳐 토큰별 연속 표현이 된다. 하나의 풀링된 문장 벡터만 쓰는 대신 비풀링 토큰 출력을 U-Net의 여러 교차 어텐션 층에 넣는다. U-Net의 공간 특징이 질의가 되고 텍스트 토큰이 키와 값이 되어, 각 잡음 제거 단계가 프롬프트의 서로 다른 부분을 참조한다.

이는 생성 중인 이미지를 CLIP 이미지 인코더로 채점하고 유사도 기울기를 역전파하는 **CLIP gradient guidance**가 아니다. Stable Diffusion v1에서 CLIP은 텍스트 조건 인코더이고, 잠재 잡음 자체는 U-Net이 예측한다. [[DALL·E 2]]처럼 텍스트에서 CLIP 이미지 임베딩을 먼저 생성하는 prior도 없다.

### 3. 잠재 U-Net이 잡음을 반복 제거한다

훈련할 때는 이미지 잠재 $z_0$에 시간 단계 $t$의 가우스 잡음 $\epsilon$을 더해 $z_t$를 만들고, U-Net $\epsilon_\theta$가 그 잡음을 예측하도록 학습한다. 생성 때는 무작위 잠재 잡음에서 시작해 스케줄러가 U-Net 예측을 여러 차례 적용한다. 마지막 잠재만 디코더가 이미지로 바꾼다.

공식 reference script는 기본적으로 512×512 이미지, 50 PLMS 표본화 단계와 guidance scale 7.5를 사용했다. 잠재 공간은 각 U-Net 호출의 공간 비용을 줄이지만 호출 순서를 병렬 한 번으로 바꾸지는 않는다. 이 차이는 [[훈련 병렬성과 생성 순차성은 다른 축이다]]에서 확산 모델의 표본화 비용과 함께 비교한다.

### 4. 분류기 없는 유도로 프롬프트 강도를 조절한다

v1-3와 v1-4는 훈련 예제의 10%에서 텍스트 조건을 제거했다. 이 덕분에 같은 U-Net이 조건부 잡음 예측 $\epsilon_{\mathrm{cond}}$와 빈 조건의 예측 $\epsilon_{\mathrm{uncond}}$를 모두 제공한다. 추론에서는 두 예측의 차이를 척도 $s$만큼 확대한다.

$$
\epsilon_{\mathrm{cfg}}
=\epsilon_{\mathrm{uncond}}
+s\left(\epsilon_{\mathrm{cond}}-\epsilon_{\mathrm{uncond}}\right)
$$

이 방식을 **분류기 없는 유도(classifier-free guidance, CFG)**라고 한다. $s$를 높이면 프롬프트 조건을 강하게 따르는 경향이 있지만 다양성이 줄고 색·형태가 과장될 수 있다. 별도 이미지 분류기의 기울기를 쓰는 classifier guidance나 외부 CLIP gradient guidance와 구분해야 한다.

### 5. 안전 검사와 워터마크는 바깥 파이프라인에 놓인다

공식 reference script에는 생성 결과의 노골적 콘텐츠 가능성을 낮추는 safety checker와 기계 생성 이미지임을 식별하도록 돕는 보이지 않는 워터마크가 포함됐다. 모델 카드의 checker는 생성된 이미지와 미리 정한 NSFW 개념을 CLIP 표현 공간에서 비교한다.

이 모듈은 잠재 U-Net의 학습 목적이나 CFG 안에 들어 있는 보증이 아니다. 공개 글은 safety classifier의 매개변수를 조정할 수 있다고 설명했고, 공개 가중치는 다른 파이프라인에서도 실행할 수 있다. 그러므로 reference 구현의 기본 필터를 모델이 유해 이미지를 생성할 수 없다는 증거로 읽지 않는다.

## 3단계 — 기술과 근거

### v1-1부터 v1-4까지의 체크포인트 계보

Stable Diffusion v1은 서로 독립적으로 처음부터 학습한 네 모델이 아니다. 모델 카드가 기록한 재개(resume) 관계와 마지막 학습 구간은 다음과 같다.

| 체크포인트 | 시작점과 추가 학습 | 텍스트 조건 dropout |
| --- | --- | --- |
| v1-1 | LAION-2B(en)에서 256×256으로 237K steps, 이어 `laion-high-resolution`에서 512×512로 194K steps | 기록 없음 |
| v1-2 | v1-1에서 재개해 `laion-improved-aesthetics`에서 512×512로 515K steps | 기록 없음 |
| v1-3 | v1-2에서 재개해 같은 미학 필터 부분집합에서 512×512로 195K steps | 10% |
| v1-4 | **v1-2에서 재개**해 `laion-aesthetics v2 5+`에서 512×512로 225K steps | 10% |

v1-4는 v1-3의 다음 직렬 단계가 아니라 v1-2에서 갈라진 다른 후속 학습이다. 따라서 “v1-1→v1-2→v1-3→v1-4를 순서대로 모두 거쳤다”거나 “v1-4는 225K steps만으로 처음부터 만들어졌다”고 쓰면 계보를 왜곡한다.

v1-2의 미학 필터 부분집합은 원본 크기 512 이상, 추정 미학 점수 5 초과, 추정 워터마크 확률 0.5 미만 조건을 사용했다. 이 선별은 이미지 품질과 워터마크 가능성을 조절한 자료 구성이다. 성인 콘텐츠·사회 편향·저작권·중복을 포괄적으로 제거한 안전 정제와 같은 뜻은 아니다.

### U-Net·CLIP·오토인코더의 역할 장부

| 구성 요소 | v1의 사양 | 역할과 경계 |
| --- | --- | --- |
| 오토인코더 | $f=8$, 4채널 잠재 | 픽셀과 잠재 격자를 잇는 손실 압축·복원 |
| 잠재 U-Net | 약 860M 매개변수 | 시간·텍스트 조건을 받아 잠재 잡음을 예측 |
| CLIP ViT-L/14 텍스트 인코더 | 약 123M 매개변수, 동결 | 프롬프트의 비풀링 토큰 표현 제공 |
| 교차 어텐션 | U-Net 중간 층 | 시각 잠재 특징이 텍스트 토큰을 읽게 함 |
| CFG | 조건부·무조건부 U-Net 예측 결합 | 추론 시 프롬프트 조건의 강도 조절 |
| Safety checker·워터마크 | reference 파이프라인의 후처리 | 결과 필터링·표시 보조, 모델 내부 안전 보증 아님 |

CLIP을 사용한다는 사실만으로 v1이 CLIP 이미지 임베딩에서 이미지를 복원하는 것은 아니다. DALL·E 2 연구 모델은 prior가 텍스트 조건의 CLIP 이미지 임베딩을 만들고 diffusion decoder가 이를 이미지로 복원한다. Stable Diffusion v1은 오토인코더의 공간 잠재 격자에서 확산하고 CLIP **텍스트 토큰**을 조건으로 읽는다.

### 6.9GB·10GB·4GB 미만은 서로 다른 실행 조건이다

2022년 8월 Stability AI 공개 글은 릴리스 빌드의 최종 메모리 사용량을 약 6.9GB VRAM으로 제시하고 당시 NVIDIA GPU를 권장했다. 반면 CompVis 원 저장소의 reference 환경은 최소 10GB VRAM GPU를 요구했다. 이 둘만으로도 “공식 최소 사양”이 구현·환경에 따라 달랐음을 알 수 있다.

현재 v1-4 모델 카드의 Diffusers 예시는 float16과 attention slicing을 사용하면 4GB 미만 GPU RAM에서도 실행하도록 안내한다. 이는 후대 소프트웨어의 반정밀도·메모리 절약 경로다. 2022년 원 reference 구현의 10GB, 릴리스 빌드의 6.9GB, 최적화한 Diffusers 예의 4GB 미만을 하나의 보편 사양으로 합치지 않는다.

메모리만으로 접근성을 완전히 표현할 수도 없다. 해상도·batch·표본화 단계·정밀도·스케줄러·attention 구현은 실행 가능 여부와 속도·품질을 함께 바꾼다. 공식 50-step·512×512 예는 기준 구성이지 모든 사용 사례의 속도나 출력 품질을 보장하지 않는다.

### 추론 접근성과 전체 훈련 비용은 다른 주장이다

공개 가중치를 내려받아 추론하는 데 필요한 자원은 기초 체크포인트를 처음부터 학습하는 자원보다 훨씬 작았다. 이 차이가 개인 개발자와 연구자가 로컬에서 모델을 조사·재사용할 수 있는 범위를 넓혔다.

그러나 모델 카드는 v1 학습 하드웨어를 `32 × 8 A100`, 즉 256대 A100 구성으로 기록하고 batch 2048을 제시한다. 환경 영향 추정에는 A100 PCIe 40GB, 150,000 hours와 11,250 kg CO₂e가 사용됐다. 이 숫자의 보고 형식을 개별 학습 구간의 정확한 wall-clock 시간으로 다시 해석하지 않더라도, 전체 훈련이 소비자 GPU 규모가 아니었다는 경계는 분명하다.

따라서 Stable Diffusion이 넓힌 접근은 특히 **사전 학습 가중치의 추론·수정·미세조정·연구 재사용**이다. 잠재 확산이 픽셀 확산보다 효율적이라는 연구 결과나 로컬 실행 가능성을, 누구나 동일한 기초 모델을 처음부터 훈련할 수 있었다는 주장으로 바꾸지 않는다.

### 공개 코드·가중치와 면허를 함께 읽는다

공개 발표는 코드·가중치·모델 카드와 Diffusers notebook, 공개 시연을 연결했다. 가중치는 상업·비상업 이용을 폭넓게 허용하되 특정 불법·유해 사용을 금지하는 CreativeML OpenRAIL-M을 적용했다. 재배포나 서비스 제공 시에도 면허와 제한을 전달해야 한다는 조건이 있었다.

그러므로 Stable Diffusion v1은 폐쇄형 API보다 검사·변형 가능성이 큰 **공개 가중치·공개 코드 시스템**이었다고 말할 수 있다. 다만 “open”의 법적·정책적 정의를 생략한 채 제한 없는 오픈소스라고 부르면 배포 조건을 잃는다. 공개로 생긴 혁신 효과와 오용 위험 역시 동일한 배포 선택에서 함께 나온다.

## 검증과 한계

### 생성 능력의 직접 한계

v1-4 모델 카드는 완전한 사진 사실성, 읽을 수 있는 글자, 복잡한 구성 관계, 얼굴과 사람 생성에 실패할 수 있다고 기록한다. 예시로 든 `빨간 정육면체 위의 파란 구`처럼 물체·속성·공간 관계를 정확히 결속하는 문제는 교차 어텐션만으로 보장되지 않는다.

오토인코더의 손실 압축은 작은 글자·정확한 선·미세한 얼굴 특징의 상한이 될 수 있다. 잠재 확산도 U-Net을 여러 단계 순차 실행하므로 GAN처럼 한 번에 생성하는 방식보다 느릴 수 있다. 모델 크기가 비교적 작고 잠재 공간을 쓴다는 사실은 정확성·구성성·낮은 지연을 동시에 보장하지 않는다.

### 자료·언어·기억의 한계

Stable Diffusion v1은 주로 영어 설명으로 이루어진 LAION-2B(en) 계열 부분집합에서 학습됐다. 모델 카드는 비영어 프롬프트 성능이 더 낮고, 서구·백인 문화가 기본값처럼 나타날 수 있다고 명시한다. 이는 텍스트 인코더의 언어 범위와 이미지-텍스트 자료 분포가 함께 만든 한계다.

LAION-5B 계열 자료에는 성인 콘텐츠가 포함됐고, 추가 중복 제거를 수행하지 않았다. 모델 카드는 반복된 훈련 이미지에서 어느 정도 기억 현상이 관찰됐다고 기록한다. 미학 점수·해상도·워터마크 확률 필터를 사용했다는 사실은 동의·저작권·개인정보·사회 편향·중복 문제를 해결했다는 뜻이 아니다.

### Safety checker가 보장하지 않는 것

Diffusers의 safety checker는 생성 결과를 알려진 NSFW 개념과 비교하는 배포 모듈이다. 이는 훈련 자료에서 유해 패턴을 제거하지 않으며, U-Net 자체가 문제 이미지를 만들 수 없게 하지도 않는다. OpenRAIL-M의 금지 조항도 기술적으로 모든 개조와 오용을 막는 실행 장치는 아니다.

원 LDM 논문은 낮아진 생성 비용이 창작뿐 아니라 조작 이미지·허위정보·스팸과 비동의 딥페이크의 생산도 쉽게 만들 수 있다고 지적했다. 특히 여성에게 불균형한 피해가 생길 수 있고, 민감한 훈련 자료 노출과 데이터 편향도 남는 연구 문제로 제시했다. 효율·공개성·안전성을 하나의 성과로 합치지 않는다.

### 흔한 범위 오류

- **Stable Diffusion과 LDM은 완전히 같은 모델이다:** LDM은 여러 과제와 조건 인코더를 포괄하는 일반 모델 계열이고, Stable Diffusion v1은 특정 CLIP 텍스트 인코더·자료·체크포인트를 사용한 배포물이다.
- **v1-4는 v1-3 다음 단계다:** 둘 다 v1-2에서 재개한 서로 다른 후속 체크포인트다.
- **CLIP이 이미지를 생성하거나 매 단계 채점한다:** v1의 CLIP은 동결된 텍스트 조건 인코더다. 이미지 생성은 잠재 U-Net과 오토인코더가 담당한다.
- **6.9GB면 모든 환경에서 같은 속도로 실행된다:** 6.9GB는 공개 글의 릴리스 빌드 수치이고, 원 저장소는 10GB를 요구했으며 후대 Diffusers 최적화는 4GB 미만의 별도 경로를 제시한다.
- **소비자 GPU 추론이 가능하므로 전체 훈련도 저렴하다:** 공개 가중치 추론과 256대 A100을 기록한 기초 체크포인트 훈련은 자원 규모가 다르다.
- **공개됐으므로 제한 없는 오픈소스다:** 코드·가중치는 공개됐지만 가중치 면허에는 용도 제한이 있다.
- **안전 검사가 포함돼 유해 생성이 불가능하다:** checker는 생성 뒤 작동하는 조정 가능한 보조 장치이며 공개 가중치의 모든 실행 경로를 통제하지 않는다.

## 학습 확인

### 확인 질문

1. Stable Diffusion v1의 오토인코더, 잠재 U-Net과 동결 CLIP 텍스트 인코더는 각각 어떤 역할을 맡는가?
2. v1-1부터 v1-4의 계보에서 v1-3과 v1-4는 어느 체크포인트에서 갈라지며, CFG 학습을 위해 무엇이 추가됐는가?
3. 6.9GB·10GB·4GB 미만 실행 수치와 256대 A100 훈련 기록을 하나의 “접근성” 주장으로 합칠 수 없는 이유는 무엇인가?

### 다음 문서

- [[source.086|잠재 확산 모델과 Stable Diffusion v1 공개]] — 086잠재 확산 모델과 Stable Diffusion v1 공개 — LDM 논문과 공개 v1의 수치·근거·raw 검증 정정을 한 문서에서 대조한다.
- [[analysis.훈련-병렬성과-생성-순차성은-다른-축이다|훈련 병렬성과 생성 순차성은 다른 축이다]] — 잠재 공간이 한 단계의 비용을 줄여도 확산 표본화의 순차 U-Net 호출이 남는 이유를 다른 생성 계열과 비교한다.

## 출처

- [[086_잠재 확산 모델과 Stable Diffusion v1 공개]]
- Robin Rombach, Andreas Blattmann, Dominik Lorenz, Patrick Esser, Björn Ommer, [*High-Resolution Image Synthesis With Latent Diffusion Models*](https://openaccess.thecvf.com/content/CVPR2022/html/Rombach_High-Resolution_Image_Synthesis_With_Latent_Diffusion_Models_CVPR_2022_paper.html), CVPR 2022, pp. 10684–10695, §§1·3.1–3.3·4.1–4.5·5와 Figures 1·3·6–7·Tables 1–7, [Supplement](https://openaccess.thecvf.com/content/CVPR2022/supplemental/Rombach_High-Resolution_Image_Synthesis_CVPR_2022_supplemental.pdf) §§D–G·Tables 8–18.
- CompVis, [Stable Diffusion 공식 저장소](https://github.com/CompVis/stable-diffusion), 2022, README의 Stable Diffusion v1·Requirements·Text-to-Image with Stable Diffusion·Reference Sampling Script 절.
- Robin Rombach·Patrick Esser, [Stable Diffusion v1-4 Model Card](https://huggingface.co/CompVis/stable-diffusion-v1-4), 2022, Model Details·Examples·Limitations and Bias·Safety Module·Training·Evaluation Results·Environmental Impact.
- Stability AI, [Stable Diffusion Public Release](https://stability.ai/news-updates/stable-diffusion-public-release), 2022-08-22, code·weights·model card·CreativeML OpenRAIL-M·safety classifier·6.9GB VRAM 공개 설명.
- 프로젝트 보존 자료: `raw/086_Stable Diffusion Latent Diffusion Models for Accessible Text-to-Image Generation.ko.md`, `raw/086_Stable Diffusion Latent Diffusion Models for Accessible Text-to-Image Generation.commentary.ko.md`.

## 관련 항목

- [[source.086|잠재 확산 모델과 Stable Diffusion v1 공개]]
- [[analysis.훈련-병렬성과-생성-순차성은-다른-축이다|훈련 병렬성과 생성 순차성은 다른 축이다]]
- [[concept.잠재-확산-모델|잠재 확산 모델]]
- [[concept.clip|CLIP]]
- [[concept.dall-e-2|DALL·E 2]]
