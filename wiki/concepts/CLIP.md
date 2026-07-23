---
schema_version: 2
id: concept.clip
page_type: concept
title: CLIP
aliases:
  - Contrastive Language-Image Pre-training
  - 대조적 언어-이미지 사전학습
  - CLIP 이중 인코더
tags:
  - type/concept
  - domain/ai
  - domain/computer-science
  - domain/computer-vision
  - domain/nlp
  - domain/machine-learning
created: '2026-07-21'
updated: '2026-07-22'
lifecycle: active
verification: verified
artifacts:
  - 'raw/070_CLIP Contrastive Language-Image Pre-training for Multimodal Understanding.ko.md'
  - 'raw/070_CLIP Contrastive Language-Image Pre-training for Multimodal Understanding.commentary.ko.md'
  - 'raw/075_DALL·E Text-to-Image Generation with Transformer Architectures.ko.md'
  - 'raw/075_DALL·E Text-to-Image Generation with Transformer Architectures.commentary.ko.md'
  - 'raw/084_Flamingo Few-Shot Vision-Language Learning with Gated Cross-Attention.ko.md'
  - 'raw/084_Flamingo Few-Shot Vision-Language Learning with Gated Cross-Attention.commentary.ko.md'
  - 'raw/085_DALL·E 2 Diffusion-Based Text-to-Image Generation with CLIP Guidance.ko.md'
  - 'raw/085_DALL·E 2 Diffusion-Based Text-to-Image Generation with CLIP Guidance.commentary.ko.md'
evidence:
  - source_id: radford-et-al-2021-clip
    locator: 'PMLR 139, pp. 8748–8763의 §§2.1–2.5·Figures 1–3, §§3–6·Figures 4–7과 supplement §§A–B·D–E·I, Tables 2·4·8–10·18–20의 WIT·dual encoder·대칭 대조 손실·zero-shot classifier·prompt ensemble·dataset·overlap·bias·학습 및 평가 조건'
    relation: supports
  - source_id: ramesh-et-al-2021-dalle
    locator: '§2.6과 Figures 3·6·9(c)의 별도 대조 모델을 이용한 512개 생성 후보 재순위화와 sample-pool 크기별 FID·IS 변화'
    relation: supplements
  - source_id: alayrac-et-al-2022-flamingo
    locator: 'NeurIPS 2022, §§1·2.1–2.5·5와 Figures 2–4의 대조 시각 encoder 재사용, 조건부 생성 구조와 분류 성능 trade-off; Supplementary §§B.1.3·B.2.1과 Tables 7·11'
    relation: contextualizes
  - source_id: ramesh-et-al-2022-unclip
    locator: 'arXiv:2204.06125, §§2.1–2.2·3.1–3.3·5.1–5.5·6와 Figures 2–10의 동결 CLIP, text-to-image embedding prior, diffusion decoder 조건화, classifier-free guidance와 CLIP gradient guidance의 구분'
    relation: contextualizes
related:
  - source.070
  - source.075
  - source.084
  - source.085
  - concept.dall-e-2021
  - concept.dall-e-2
  - concept.flamingo
  - concept.엔트로피-교차-엔트로피-kl-발산
  - concept.transformer
  - concept.합성곱-신경망
  - analysis.사전-학습-지식은-과제에-어떻게-도착하는가
---
# CLIP

> [!note] 학습 안내
> **난이도:** 중급<br>
> **선수 지식:** [[Transformer]], [[합성곱 신경망]]<br>
> **읽고 나면:** CLIP의 이중 인코더·대칭 대조 손실·자연어 제로샷 분류 흐름을 설명하고, 공유 임베딩과 교차 어텐션 융합·생성·일반 멀티모달 이해를 구분할 수 있다.

## 1단계 — 먼저 잡을 핵심

### 한 문장 정의

CLIP(Contrastive Language-Image Pre-training)은 이미지 인코더와 텍스트 인코더를 함께 학습해, 대응하는 이미지와 문장의 정규화된 표현이 같은 임베딩 공간에서 높은 유사도를 갖게 하는 이중 인코더(dual encoder) 모델이다.

학습 뒤에는 클래스 이름을 자연어 문장으로 바꾸어 텍스트 표현을 만들고, 입력 이미지와 가장 가까운 표현을 고를 수 있다. 이 방식은 대상 데이터셋의 예제로 새 분류기 가중치를 학습하지 않고도 시각 분류를 지정하는 자연어 기반 제로샷 인터페이스를 제공한다.

### 먼저 구분할 범위

CLIP이 만드는 공유 임베딩 공간(shared embedding space)은 이미지와 문장을 비교하는 좌표계다. 이미지 token과 text token이 교차 어텐션으로 서로를 읽는 융합 표현이 아니며, 높은 코사인 유사도만으로 구성 관계·공간 추론·인과를 일반적으로 이해한다고 결론 내릴 수 없다.

CLIP은 이미지와 텍스트를 직접 생성하지 않는다. 시각 질문 답변(VQA), 캡션 생성, 텍스트-이미지 생성에는 CLIP 표현을 읽거나 조건으로 쓰는 별도의 생성기·decoder·융합 구조가 필요하다.

## 2단계 — 작동 원리

### 입력과 두 인코더

학습 입력은 짝지어진 이미지 $I_i$와 텍스트 $T_i$다. 이미지 인코더 $f_\theta$와 텍스트 인코더 $g_\phi$가 각각 특징을 만들고, 서로 다른 크기의 특징을 학습 가능한 선형 투영으로 공통 차원에 옮긴 뒤 L2 정규화한다.

$$
v_i=\operatorname{normalize}(W_I f_\theta(I_i)),\qquad
t_i=\operatorname{normalize}(W_T g_\phi(T_i))
$$

정규화된 두 벡터의 내적은 코사인 유사도와 같다. 따라서 $v_i^\top t_j$는 이미지 $i$와 텍스트 $j$가 얼마나 잘 대응하는지 나타내는 학습 점수이며, 확률·사실성·사람의 이해 정도와 같은 값은 아니다.

### 대칭 대조 손실과 배치 내 음성

한 배치에 실제 이미지-텍스트 쌍이 $N$개 있으면 $N\times N$ 유사도 행렬을 만든다. 대각선의 $N$개가 관측된 정답 쌍이고 나머지 $N^2-N$개는 배치 내 음성(in-batch negatives)으로 쓰인다.

$$
s_{ij}=\exp(t)\,v_i^\top t_j,
$$

여기서 $t$는 logit의 척도를 조절하도록 log-parameterization으로 직접 학습되는 logit-scale parameter다. CLIP은 각 이미지가 정답 텍스트를 고르는 행 방향 교차 엔트로피와 각 텍스트가 정답 이미지를 고르는 열 방향 교차 엔트로피를 평균한다.

이 문서에서는 두 방향 대조 목적의 입력 축과 정답 쌍을 설명한다. one-hot 정답에서 교차 엔트로피가 음의 로그확률이 되는 이유, 분포형 label과 KL의 구분은 [[엔트로피·교차 엔트로피·KL 발산]]에서 완전하게 다룬다.

$$
\mathcal{L}_{\mathrm{CLIP}}
=\frac{1}{2}\left[
\operatorname{CE}_{\mathrm{image\to text}}(S)
+
\operatorname{CE}_{\mathrm{text\to image}}(S)
\right]
$$

배치가 크면 한 예시는 한 번의 update에서 많은 오답 후보와 비교된다. 그러나 의미가 비슷한 다른 이미지·문장도 우연히 음성으로 들어갈 수 있으므로, 이 손실은 모든 의미 관계를 완전하게 부호화하기보다 관측된 쌍을 상대적으로 식별하도록 학습한다.

### 자연어 제로샷 분류기

추론할 때는 각 클래스 이름 $c_k$를 “a photo of a {label}.” 같은 prompt template에 넣고 텍스트 인코더로 표현한다. 입력 이미지 표현과 모든 클래스 표현의 유사도를 계산한 뒤 가장 높은 클래스를 고르면, 텍스트 표현들이 선형 분류기의 weight처럼 작동한다.

한 단어짜리 클래스 이름은 다의성과 사전학습 문장 분포의 차이 때문에 불안정할 수 있다. CLIP 연구진은 과제 맥락을 넣은 여러 prompt로 클래스별 텍스트 표현을 만들고 임베딩 공간에서 평균하는 prompt ensemble을 사용했다. ImageNet에서는 80개 context prompt의 ensemble이 단일 기본 prompt보다 3.5 percentage points를 더했고, context 없는 클래스 이름과 비교한 prompt engineering·ensemble의 합산 개선은 약 5 points였다.

## 3단계 — 기술과 근거

### 이미지와 텍스트 인코더 변형

CLIP은 이미지 인코더를 하나의 ViT로 고정하지 않았다. 연구진은 수정한 ResNet-50·ResNet-101·RN50x4·RN50x16·RN50x64 다섯 개와 ViT-B/32·ViT-B/16·ViT-L/14 세 개를 사전학습했다. ResNet 계열에는 ResNet-D stem, anti-aliased blur pooling, attention pooling을 적용했고, ViT 계열에는 patch·position embedding 뒤 layer normalization을 추가했다.

텍스트 인코더는 기본 설정에서 12층·폭 512·8 attention heads의 [[Transformer]]다. 소문자 byte-pair encoding(BPE), [SOS]·[EOS] 경계, masked self-attention을 사용하고 마지막 [EOS] 위치의 표현을 layer normalization과 선형 투영에 통과시킨다. GPT-2의 architecture modification을 참고했지만, CLIP의 텍스트 인코더 자체가 문장을 생성하는 GPT-2 언어 모델이라는 뜻은 아니다.

### WIT와 학습 조건

WebImageText(WIT)는 공개 인터넷 출처에서 모은 4억 개 이미지-텍스트 쌍이다. 연구진은 50만 개 query를 구성하고 query마다 최대 2만 쌍을 포함해 결과를 대략적으로 class-balance했다. 따라서 WIT를 인터넷의 모든 이미지와 설명을 무차별적으로 담은 완전한 표본으로 볼 수 없으며, query 선택과 웹 분포의 편향이 남는다.

공통 학습 설정은 batch size 32,768, 32 epochs였다. 각 배치는 정답 $N$쌍과 $N^2-N$개의 비교 후보를 제공하므로 batch size는 대조 목적의 음성 수와 직접 연결된다.

가장 큰 ResNet인 RN50x64는 592대 V100에서 18일, 가장 큰 ViT-L/14는 256대 V100에서 12일 학습했다. 대표 결과의 ViT-L/14@336px는 ViT-L/14를 336-pixel 입력으로 한 epoch 더 학습한 모델이다. 그러므로 256대 V100과 18일을 같은 설정으로 묶으면 두 model variant의 조건을 혼동한다.

### 제로샷과 표현 평가

논문은 30개가 넘는 기존 컴퓨터 비전 데이터셋을 사용했고, 핵심 zero-shot 비교는 27개 suite에서 수행했다. 과제에는 일반·세밀 객체 분류, OCR, 동작 인식, 지리 위치, 위성 영상, 합성 장면 계수와 거리 추정이 포함된다.

ViT-L/14@336px의 ImageNet zero-shot top-1 accuracy는 76.2%로, ImageNet의 128만 training examples를 직접 사용한 원래 ResNet-50과 같았다. 이 결과는 과제별 ImageNet label로 CLIP을 학습하지 않았다는 뜻이며, 당시 모든 지도학습 모델의 최고 성능과 같았다는 뜻은 아니다.

27개 suite에서는 zero-shot CLIP이 고정 ResNet-50 특징 위에 학습한 지도 logistic regression보다 16개 데이터셋에서 높았다. 반면 fully supervised linear probe와 zero-shot의 차이는 데이터셋마다 컸고, zero-shot 성능이 같은 CLIP 특징의 4-shot logistic regression과 맞먹었다는 결과는 20개 데이터셋의 평균 비교다.

### DALL·E에서는 생성기가 아니라 후보 재순위기다

[[075_DALL·E와 이산 이미지 토큰 생성]]의 DALL·E 1은 텍스트와 이미지 토큰의 자기회귀 Transformer로 후보를 생성했다. 그 뒤 CLIP과 같은 대조 학습 절차의 별도 모델이 caption과 후보 이미지의 일치 점수를 계산해 512개 가운데 상위 표본을 골랐다.

따라서 대조 임베딩은 생성기의 decoder나 학습 backbone이 아니다. [[DALL·E (2021)]]의 최종 표본 품질에는 생성 분포·표본 수·재순위 점수가 함께 작용하며, CLIP 계열 점수를 사용했다는 사실만으로 CLIP 자체에 이미지 생성 능력이 생기지는 않는다.

### DALL·E 2에서는 잠재 표현이 생성 조건이 된다

[[DALL·E 2]]의 연구 모델 unCLIP은 ViT-H/16 이미지 인코더와 텍스트 인코더로 이루어진 CLIP을 먼저 학습한 뒤 동결한다. Prior는 caption과 CLIP 텍스트 임베딩을 조건으로 가능한 CLIP 이미지 임베딩을 생성하고, 확산 decoder는 그 이미지 임베딩을 timestep 표현과 추가 문맥 token으로 받아 64×64 이미지를 복원한다. 두 upsampler가 이를 1,024×1,024까지 확대한다.

이 구조에서 CLIP은 DALL·E 1처럼 완성된 후보를 끝에서 재순위화하는 별도 판정기만도 아니고, [[Flamingo]]처럼 언어 모델의 각 층에 cross-attention으로 시각 token을 주입하는 연결부도 아니다. 텍스트와 이미지 사이의 동결된 잠재 좌표계가 prior와 생성 decoder를 잇는 조건 interface가 된다.

Prior와 기본 decoder는 조건을 일부 비운 예측과 조건부 예측의 차이를 확대하는 **classifier-free guidance**를 사용한다. 매 잡음 제거 단계에서 부분 이미지를 CLIP에 넣고 text-image similarity의 gradient로 표본을 움직이는 **CLIP gradient guidance**와 구분해야 한다. CLIP 표현을 생성 조건으로 사용했다는 사실이 CLIP 자체를 확산 decoder로 바꾸지는 않는다.

### Flamingo에서는 대조 시각 encoder가 생성 model의 입력이 된다

[[Flamingo]]는 CLIP weight를 그대로 사용하지 않았지만, ALIGN·LTIP 쌍에 대조 목적을 적용해 사전 학습한 NFNet-F6 시각 encoder를 동결해 사용했다. 이 전역·공간 특징을 Perceiver Resampler가 64개 시각 token으로 압축하고, 별도 gated cross-attention이 동결 언어 model의 생성 과정에 공급한다. 즉 대조 학습된 시각 표현이 끝점의 similarity classifier가 아니라 조건부 text 생성의 입력 자산으로 재사용된다.

이 확장은 CLIP의 dual encoder가 자체적으로 VQA·captioning 능력을 가졌다는 뜻이 아니다. Flamingo는 약 10B의 새 gated block, 194M Resampler, interleaved·paired multimodal 자료와 자기회귀 목적을 추가했다. Flamingo 논문도 분류에서는 생성형 언어 목적이 대조 model보다 낮은 성능을 보였다고 기록하므로, 자유 형식 생성과 효율적인 closed-set 비교는 서로 다른 목적·interface의 trade-off로 읽어야 한다.

## 검증과 한계

### ‘제로샷’이 보장하는 것

CLIP 논문은 제로샷을 전통적인 unseen object category보다 넓게, unseen dataset으로의 전이로 사용했다. 이는 대상 데이터셋의 training examples로 과제별 parameter를 갱신하지 않았다는 protocol 설명이다.

WIT에 해당 class concept, 비슷한 이미지, label 문구가 없었다는 뜻은 아니다. 연구진은 35개 평가 자료에 대해 중복을 분석했지만, 검출된 중복이 작았다는 결과가 모든 의미적 노출이나 unseen concept를 보장하지는 않는다. Prompt와 후보 클래스 목록도 사람이 제공한 과제 명세다.

### 공유 임베딩이 보장하지 않는 것

CLIP의 두 인코더는 최종 전역 표현에서 만나며 token-level cross-attention으로 융합되지 않는다. 따라서 similarity retrieval과 closed-set classification에 유용한 정렬이 자유형 VQA, 세밀한 공간 관계 추론, caption generation이나 image generation을 CLIP 단독으로 수행하게 하지는 않는다.

원 논문은 합성 장면의 물체 수 세기, 위성 영상 분류, 림프절 종양 탐지, 교통 표지 인식과 최근접 차량 거리 추정에서 약한 zero-shot 결과를 보고했다. Fine-grained classification도 Stanford Cars·Food101처럼 강한 경우와 Flowers102·FGVC Aircraft처럼 약한 경우가 갈렸으므로, ‘세밀한 분류에 항상 약하다’거나 ‘자연어 조합을 일반적으로 이해한다’고 단정할 수 없다.

### 데이터·prompt·배포 경계

인터넷 데이터의 문화·인구·지역 편향은 표현과 분류기에 들어갈 수 있다. 논문은 모욕적 class 후보를 포함한 얼굴 분류에서 연령·성별·인종에 따른 disparate errors를 보고했고, task-specific training 없이 얼굴 식별을 만들 수 있다는 점에서 privacy와 surveillance 위험도 지적했다.

Prompt wording과 후보 클래스 설계는 정확도와 편향을 함께 바꾼다. 연구진도 main analysis의 27개 데이터셋이 CLIP 능력에 어느 정도 맞춰 선택됐고 개발 중 validation set을 반복 확인했다고 밝혔다. 의료·안전·감시처럼 오류 비용이 큰 배포에서는 zero-shot 점수만으로 충분하지 않으며, 대상 분포·label 설계·집단별 오류·task-specific baseline을 따로 검증해야 한다.

## 학습 확인

### 확인 질문

1. CLIP의 이미지·텍스트 이중 인코더와 정규화된 선형 투영은 어떤 비교 공간을 만드는가?
2. $N$개 정답 쌍이 있는 배치에서 대칭 대조 손실은 어떤 두 방향의 분류 문제를 풀며, 배치 내 음성은 어디서 생기는가?
3. CLIP의 zero-shot 평가가 unseen concept, 교차 어텐션 융합, VQA·생성 능력을 보장하지 않는 이유는 무엇인가?

### 다음 문서

- [[070_CLIP과 대조적 언어-이미지 사전 학습]] — WIT 구성, architecture, 27개 평가와 원 raw 설명의 검증 정정을 1차 근거 locator로 확인한다.
- [[085_DALL·E 2와 CLIP 잠재 표현 기반 계층적 확산 생성]] — 동결된 CLIP 잠재 좌표계가 prior와 확산 decoder의 생성 조건으로 쓰이는 방식을 확인한다.
- [[사전 학습 지식은 과제에 어떻게 도착하는가]] — CLIP의 class prompt를 feature extraction·fine-tuning·in-context prompting과 비교해 과제 명세가 놓이는 위치를 확장한다.

## 출처

- [[070_CLIP과 대조적 언어-이미지 사전 학습]]
- [[075_DALL·E와 이산 이미지 토큰 생성]]
- [[084_Flamingo와 게이트 교차 어텐션 기반 퓨샷 시각-언어 학습]]
- [[085_DALL·E 2와 CLIP 잠재 표현 기반 계층적 확산 생성]]
- Alec Radford 외, [Learning Transferable Visual Models From Natural Language Supervision](https://proceedings.mlr.press/v139/radford21a.html), ICML 2021, PMLR 139:8748–8763, 특히 §§2.1–2.5, Figures 1–3, §§3–6, Figures 4–7과 supplementary §§A–B·D–E·I, Tables 2·4·8–10·18–20.
- Aditya Ramesh 외, [Zero-Shot Text-to-Image Generation](https://proceedings.mlr.press/v139/ramesh21a.html), ICML 2021, §2.6과 Figures 3·6·9(c).
- Jean-Baptiste Alayrac 외, [*Flamingo: a Visual Language Model for Few-Shot Learning*](https://proceedings.neurips.cc/paper_files/paper/2022/hash/960a172bc7fbf0177ccccbb411a7d800-Abstract-Conference.html), NeurIPS 2022, §§1·2.1–2.5·5와 Supplementary §§B.1.3·B.2.1.
- Aditya Ramesh 외, [*Hierarchical Text-Conditional Image Generation with CLIP Latents*](https://arxiv.org/abs/2204.06125), 2022, §§2.1–2.2·3.1–3.3·5.1–5.5·6와 Figures 2–10.
- 프로젝트 보존 자료: `raw/070_CLIP Contrastive Language-Image Pre-training for Multimodal Understanding.ko.md`, `raw/070_CLIP Contrastive Language-Image Pre-training for Multimodal Understanding.commentary.ko.md`.
- 추가 보존 자료: `raw/075_DALL·E Text-to-Image Generation with Transformer Architectures.ko.md`, `raw/075_DALL·E Text-to-Image Generation with Transformer Architectures.commentary.ko.md`.
- 추가 보존 자료: `raw/085_DALL·E 2 Diffusion-Based Text-to-Image Generation with CLIP Guidance.ko.md`, `raw/085_DALL·E 2 Diffusion-Based Text-to-Image Generation with CLIP Guidance.commentary.ko.md`.

## 관련 항목

- [[엔트로피·교차 엔트로피·KL 발산]]
- [[070_CLIP과 대조적 언어-이미지 사전 학습]]
- [[075_DALL·E와 이산 이미지 토큰 생성]]
- [[084_Flamingo와 게이트 교차 어텐션 기반 퓨샷 시각-언어 학습]]
- [[085_DALL·E 2와 CLIP 잠재 표현 기반 계층적 확산 생성]]
- [[DALL·E (2021)]]
- [[DALL·E 2]]
- [[Flamingo]]
- [[Transformer]]
- [[합성곱 신경망]]
- [[사전 학습 지식은 과제에 어떻게 도착하는가]]
