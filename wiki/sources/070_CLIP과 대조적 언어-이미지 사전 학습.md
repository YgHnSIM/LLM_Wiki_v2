---
schema_version: 2
id: source.070
page_type: source
title: CLIP과 대조적 언어-이미지 사전 학습
aliases:
  - 070_CLIP Contrastive Language-Image Pre-training for Multimodal Understanding
  - CLIP Contrastive Language-Image Pre-training for Multimodal Understanding
tags:
  - type/source
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
  - 'raw/070_CLIP Contrastive Language-Image Pre-training for Multimodal Understanding.ko.md'
  - 'raw/070_CLIP Contrastive Language-Image Pre-training for Multimodal Understanding.commentary.ko.md'
evidence:
  - source_id: radford-et-al-2021-clip
    locator: 'ICML 2021, §§2.1–2.5·3.1–3.4·4–6, Figures 1–5와 Table 1; Supplementary §§A–B·D–E·I, Figures 13–14와 Tables 2·4·8–10·18–20'
    relation: supports
  - source_id: ramesh-et-al-2021-dalle
    locator: '§2.6과 Figures 3·6·9(c)의 DALL·E 생성 후보 512개에 대한 별도 대조 모델 재순위화와 sample-pool 효과'
    relation: supplements
  - source_id: ramesh-et-al-2022-unclip
    locator: 'arXiv:2204.06125, §§2.1–2.2·3.1–3.3·5.1–5.5·6와 Figures 2–10의 동결 CLIP, text-to-image embedding prior, diffusion decoder 조건화, classifier-free guidance와 CLIP gradient guidance의 구분'
    relation: supplements
related:
  - concept.clip
  - source.075
  - source.085
  - concept.dall-e-2021
  - concept.dall-e-2
  - concept.transformer
  - concept.합성곱-신경망
  - analysis.사전-학습-지식은-과제에-어떻게-도착하는가
---
# CLIP과 대조적 언어-이미지 사전 학습

> [!note] 학습 안내
> **난이도:** 중급<br>
> **선수 지식:** [[Transformer]], [[합성곱 신경망]]<br>
> **읽고 나면:** CLIP의 이중 인코더와 대칭 대조 손실, 자연어 프롬프트로 제로샷 분류기를 만드는 절차를 설명하고, 이를 일반적인 멀티모달 이해나 생성 능력과 구분할 수 있다.

## 1단계 — 먼저 잡을 핵심

### 핵심 문장

[[CLIP|CLIP(Contrastive Language-Image Pre-training)]]은 이미지 인코더와 텍스트 인코더를 함께 학습해, 서로 짝인 이미지와 텍스트를 같은 임베딩 공간에서 가깝게 놓는 모델이다. 고정된 분류 label을 직접 예측하는 대신 4억 개의 이미지-텍스트 쌍에서 어떤 이미지와 텍스트가 실제 짝인지 구분하도록 사전 학습했다.

추론할 때는 과제의 class 이름이나 설명을 텍스트 인코더에 넣어 class별 벡터를 만든다. 새 이미지의 벡터와 가장 가까운 class 텍스트를 고르면, 해당 데이터셋의 학습 예제로 CLIP을 다시 훈련하지 않고도 분류할 수 있다. 이때 자연어는 모든 시각 과제를 푸는 자유 형식 명령이 아니라 **후보 class와 그 의미를 지정하는 분류기 인터페이스**로 작동한다.

### 역사적 위치와 이 문서의 범위

Radford 등은 2021년 논문에서 자연어로 시각 표현을 학습하는 발상 자체가 새롭지 않다고 명시했다. CLIP의 좁고 중요한 기여는 이 발상을 인터넷 규모 데이터, 효율적인 대조 목적, 여러 크기의 [[합성곱 신경망|ResNet]]·Vision Transformer 이미지 인코더와 결합하고, 30개가 넘는 기존 컴퓨터 비전 자료에서 전이 성능을 체계적으로 측정한 데 있다.

이 문서에서 “시각-언어 정렬”은 이미지와 텍스트를 비교할 수 있는 임베딩을 학습했다는 뜻이다. 원 논문은 이미지 생성, 자유 형식 시각 질의응답, 대화형 추론 또는 모달리티 사이의 token-level 융합을 구현하지 않았다. 따라서 shared embedding의 유용성과 일반적인 멀티모달 이해를 같은 주장으로 취급하지 않는다.

## 2단계 — 작동 원리

### 이미지와 텍스트를 따로 인코딩한다

학습 배치에는 서로 짝인 이미지와 텍스트가 $N$쌍 들어간다. 이미지 인코더는 이미지 $I_i$를, [[Transformer]] 텍스트 인코더는 텍스트 $T_j$를 각각 특징 벡터로 바꾼다. 두 특징은 별도의 선형 투영을 거친 뒤 길이가 1이 되도록 정규화되어 이미지 임베딩 $u_i$와 텍스트 임베딩 $v_j$가 된다.

CLIP은 모든 $N\times N$ 조합의 점수 행렬을 만든다. 학습되는 logit scale을 $\exp(t)$라고 하면 점수는 다음처럼 쓸 수 있다.

$$
s_{ij}=\exp(t)u_i^{\mathsf T}v_j
$$

$u_i$와 $v_j$가 정규화되어 있으므로 내적은 cosine similarity다. 대각선 $s_{ii}$는 실제로 관측된 짝이고, 같은 배치의 나머지 $N^2-N$개 조합은 이 학습 단계에서 짝이 아닌 후보가 된다.

### 양방향 분류 문제로 학습한다

손실은 한 방향만 맞히지 않는다. 각 이미지에서 올바른 텍스트를 찾는 cross entropy와 각 텍스트에서 올바른 이미지를 찾는 cross entropy를 평균한다.

$$
\mathcal{L}_{\text{CLIP}}
=\frac{1}{2}\left[
\operatorname{CE}_{\text{image}\rightarrow\text{text}}(S)
+\operatorname{CE}_{\text{text}\rightarrow\text{image}}(S)
\right]
$$

이 **대칭 대조 손실(symmetric contrastive loss)**은 실제 짝의 점수를 두 방향 모두에서 높이도록 한다. 다만 배치 안의 다른 텍스트가 해당 이미지와 의미상 전혀 관련 없다는 사실까지 보장하지는 않는다. 이들은 수집 데이터의 관측된 짝이 아니라는 이유로 학습상 음성 후보가 된다.

### 텍스트 임베딩이 제로샷 분류기 가중치가 된다

추론에서는 각 class label을 `A photo of a {label}.` 같은 문장에 넣고 텍스트 임베딩을 계산한다. 여러 문맥 template을 쓰면 class마다 그 임베딩을 평균한 뒤 다시 정규화할 수 있다. 이미지 임베딩과 class 텍스트 임베딩들의 유사도에 softmax를 적용하면 후보 class에 대한 분포를 얻는다.

이 과정에는 해당 데이터셋의 label이 필요하고, 후보 집합도 미리 정해야 한다. “제로샷”은 그 데이터셋의 학습 이미지로 CLIP의 weight나 별도 분류기를 학습하지 않았다는 뜻이다. class 개념이 4억 쌍의 사전 학습 자료에 한 번도 등장하지 않았다는 뜻은 아니다.

## 3단계 — 기술과 근거

### WIT 4억 쌍은 어떻게 구성됐는가

연구진은 공개적으로 접근 가능한 여러 인터넷 출처에서 이미지-텍스트 쌍 4억 개를 수집하고 이를 WebImageText(WIT)라고 불렀다. 시각 개념의 범위를 넓히기 위해 텍스트가 약 50만 개 검색 질의 가운데 하나를 포함하는 쌍을 찾았고, 결과를 대략적으로 class balance하기 위해 질의당 최대 2만 쌍을 포함했다.

50만 질의는 영어 Wikipedia에서 100회 이상 등장한 단어를 바탕으로, pointwise mutual information이 높은 bigram, 일정 검색량을 넘은 Wikipedia 문서명과 아직 들어 있지 않은 WordNet synset을 더해 구성했다. 이는 “사람들이 촬영하는 거의 모든 것”을 완전히 포괄했다는 증거가 아니다. 논문은 4억 쌍의 전체 원문 목록이나 인구학적·지리적 분포를 공개하지 않았고, 인터넷 자료의 편향과 오류가 모델에 반영될 수 있음을 별도로 논의했다.

### 이미지 인코더는 ResNet과 ViT를 모두 사용했다

CLIP은 Vision Transformer 하나로만 학습한 모델이 아니다. 연구진은 다음 여덟 개 기본 이미지 인코더 계열을 사전 학습했다.

| 계열 | 학습한 이미지 인코더 |
|---|---|
| 수정된 ResNet | RN50, RN101, RN50x4, RN50x16, RN50x64 |
| Vision Transformer | ViT-B/32, ViT-B/16, ViT-L/14 |

ResNet 계열에는 ResNetD 계열 변경, antialiased blur pooling과 attention pooling을 적용했다. ViT 계열에는 patch embedding과 position embedding을 더한 뒤, Transformer에 넣기 전에 layer normalization을 적용하고 초기화 방식도 조정했다. 텍스트 쪽에는 별도의 Transformer를 사용했으며, 기본형은 12개 layer, width 512, attention head 8개였다. 이 구조는 두 모달리티를 마지막까지 함께 읽는 cross-encoder가 아니라, 각 모달리티를 독립적으로 인코딩한 뒤 투영 공간에서 비교하는 dual encoder다.

### 학습 규모와 계산 자원

부록 Table 18의 공통 hyperparameter는 batch size 32,768과 32 epochs다. ViT-L/14는 기본 224-pixel 학습 뒤 336-pixel 해상도에서 한 epoch를 추가로 학습한 `ViT-L/14@336px` 변형이 가장 좋은 성능을 냈고, 논문의 별도 언급이 없는 “CLIP” 결과는 이 변형을 가리킨다.

가장 큰 ResNet인 RN50x64는 V100 GPU 592개에서 18일, 가장 큰 기본 Vision Transformer인 ViT-L/14는 V100 GPU 256개에서 12일 동안 학습했다. 4억 쌍을 이용한 사전 학습이 과제별 label 비용을 줄였다는 사실과, 모델 자체를 재현하는 데 드는 계산 비용이 낮다는 주장은 별개다.

### 프롬프트와 앙상블은 평가 결과의 일부다

ImageNet에서 class 이름만 인코딩하는 대신 `A photo of a {label}.`를 사용하자 정확도가 1.3 percentage points 높아졌다. 다시 80개 문맥 prompt의 텍스트 임베딩을 ensemble하자 단일 기본 prompt보다 3.5 points가 추가로 높아졌다. 두 조치를 합친 향상은 class 이름만 쓴 기준보다 거의 5 points였다.

따라서 CLIP의 제로샷 점수는 고정된 모델 weight만의 값이 아니다. class 이름의 다의성을 줄이는 문맥, 과제를 설명하는 template과 여러 template의 결합 방식이 함께 만든 결과다. 자연어가 유연한 인터페이스인 동시에 측정 조건이라는 뜻이다.

### 제로샷과 퓨샷 비교를 정확히 읽는다

가장 좋은 CLIP의 ImageNet zero-shot top-1 정확도는 76.2%였다. 이는 ImageNet의 128만 학습 예제를 사용한 **원래 ResNet-50의 76.2%**와 같은 수준이지, 당시의 모든 fully supervised 모델이나 전체 최고 성능과 같은 수준이라는 뜻은 아니다.

27개 데이터셋 비교에서 zero-shot CLIP은 canonical ResNet-50 특징 위에 각 데이터셋의 label로 학습한 logistic regression보다 16개에서 높은 점수를 냈다. 반대로 EuroSAT, PatchCamelyon, CLEVRCounts와 GTSRB 같은 전문적·추상적·계수 과제에서는 크게 낮았다. 비교 기준은 “모든 지도 학습 모델”이 아니라 고정된 ResNet-50 특징의 선형 분류기다.

class당 예제가 적어도 16개 있는 20개 데이터셋의 평균에서는 zero-shot CLIP이 **같은 CLIP 특징 공간에 학습한 4-shot logistic regression**과 비슷했다. 이는 데이터셋별 결과가 아니다. 부록의 개별 분석에서는 Flowers102와 EuroSAT가 1-shot보다도 낮은 반면, ImageNet에서는 같은 특징 공간의 16-shot과 비슷해 과제별 편차가 컸다.

## 검증과 한계

### raw 설명의 검증 정정

- **CLIP은 일반적인 멀티모달 이해를 구현했다:** 원 논문이 직접 보여 준 것은 이미지-텍스트 임베딩 정렬, 자연어로 구성한 zero-shot classifier와 linear probe 평가다. 자유 형식 질의응답, 장면의 모든 관계에 대한 추론이나 인간 수준의 이해를 측정하지 않았다.
- **이미지 인코더는 Vision Transformer였다:** 연구진은 수정된 ResNet 다섯 개와 ViT 세 개를 모두 학습했다. 가장 좋은 보고 모델이 ViT-L/14@336px였다는 사실을 전체 모델 계열의 단일 아키텍처와 혼동하면 안 된다.
- **제로샷은 학습 중 보지 못한 개념을 인식한다는 뜻이다:** 논문은 주로 unseen dataset과 task로의 전이라는 더 넓은 의미로 zero-shot을 사용했다. WIT에 class 이름·설명·유사 이미지가 없었다는 조건을 보장하지 않는다.
- **CLIP 자체가 VQA와 이미지 생성을 수행했다:** CLIP은 후보 이미지와 텍스트의 유사도를 계산하는 dual encoder다. 원 논문은 VQA를 “여기서 연구한 것보다 복잡한 공동 과제”의 관련 연구로 분류했으며, CLIP에 텍스트나 이미지를 생성하는 decoder를 두지 않았다.
- **CLIP이 DALL·E 계열에서 늘 같은 역할을 했다:** [[075_DALL·E와 이산 이미지 토큰 생성]]의 DALL·E 1에서는 별도 대조 모델이 자기회귀 생성 후보 512개를 재순위화했다. 반면 [[085_DALL·E 2와 CLIP 잠재 표현 기반 계층적 확산 생성]]의 unCLIP에서는 동결된 CLIP의 텍스트 표현을 바탕으로 prior가 CLIP 이미지 임베딩을 생성하고, 확산 decoder가 그 임베딩을 조건으로 이미지를 복원한다. 이때 guidance는 중간 이미지를 CLIP gradient로 매번 채점하는 방식이 아니라 classifier-free guidance다. 재순위기와 생성 조건 표현을 같은 역할로 합치지 않는다.
- **Stable Diffusion이 CLIP에서 직접 이어졌다:** 텍스트 encoder 사용과 모델 전체의 직접 계보는 같은 주장이다. 이 관계는 Stable Diffusion·Latent Diffusion의 1차 설계 자료 없이는 이 소스만으로 확정하지 않는다.
- **GPT-4V는 CLIP의 발상을 확장한 직접 후속이다:** 공개된 CLIP 논문은 후대 GPT-4 계열의 내부 학습 구성이나 직접 영향 관계를 증명할 수 없다. 비슷한 시각-언어 문제를 다룬다는 사실을 아키텍처 계보로 바꾸지 않는다.

### 평가가 보장하지 않는 것

대규모 인터넷 사전 학습은 평가 자료와의 우연한 중복 가능성을 만든다. 논문은 35개 데이터셋에서 중복을 조사해 9개에서는 검출된 중복이 없고, 중복률 중앙값은 2.2%, 평균은 3.2%라고 보고했다. 중복 제거에 따른 전체 정확도 변화는 대부분 0.1 point 이하였다. 이 분석은 검출된 near-duplicate의 평균 효과를 다루며, WIT가 특정 개념이나 언어 표현을 보지 않았다는 사실을 입증하지 않는다.

Zero-shot CLIP은 27개 데이터셋의 평균이나 ImageNet 한 자료에서 강한 결과를 냈지만 모든 과제에 안정적이지 않았다. 원 논문은 개발 중 validation set을 반복해서 조회했고, 주 분석의 27개 자료가 CLIP의 능력과 어느 정도 함께 조정된 임의적 모음이라는 한계도 밝혔다. 복잡한 과제를 자연어 class 설명만으로 지정하기 어렵고, CLIP은 퓨샷 학습을 직접 최적화하지 않았다.

### 데이터 편향과 사용 위험

분류 결과는 후보 label의 구성과 표현에 크게 의존한다. 원 논문의 FairFace probe에서는 인종 label과 `criminal`, `animal` 같은 유해 label을 함께 넣었을 때 0–20세 이미지의 32.3%가 유해 범주로 분류됐고, 후보에 `child`를 추가하자 8.7%로 낮아졌다. 이 변화는 prompt와 label 설계가 편향을 없애기보다 출력의 형태를 바꿀 수 있음을 보여 준다.

논문은 celebrity identification 실험과 함께 사생활·감시 위험도 제기했다. 과제별 학습 없이 새 classifier를 만들기 쉽다는 장점은 해로운 범주도 쉽게 만들 수 있다는 뜻이다. 따라서 응용에서는 평균 정확도만이 아니라 label 설계, 집단별 오류, 후보 집합 변화에 대한 민감도와 사용 맥락을 따로 평가해야 한다.

### 기존 분석과의 연결 범위

CLIP은 class 설명을 텍스트 임베딩으로 바꾸어 사전 학습 지식을 downstream 판정 경계로 옮긴 사례다. 이 비교 관점은 기존 [[사전 학습 지식은 과제에 어떻게 도착하는가]]가 다루는 전이 경로 안에서 설명할 수 있다. 이 소스 하나만으로 후대 멀티모달 모델의 계보를 새 분석으로 확정하지 않으며, 직접 연결을 주장하려면 각 후속 모델의 1차 자료가 더 필요하다.

## 학습 확인

### 확인 질문

1. CLIP의 dual encoder가 $N\times N$ 이미지-텍스트 점수에서 대칭 대조 손실을 계산하는 이유는 무엇인가?
2. Class 이름, prompt template과 prompt ensemble은 어떻게 zero-shot linear classifier를 구성하는가?
3. ImageNet 76.2%와 27개 중 16개 우위가 일반적인 멀티모달 이해나 unseen concept 인식을 보장하지 않는 이유는 무엇인가?

### 다음 문서

- [[CLIP]] — dual encoder, 대조 손실과 zero-shot classifier를 재사용 가능한 모델 개념으로 정리한다.
- [[085_DALL·E 2와 CLIP 잠재 표현 기반 계층적 확산 생성]] — 동결된 CLIP 표현이 prior와 확산 decoder를 잇는 생성 조건으로 바뀌는 구조를 확인한다.
- [[사전 학습 지식은 과제에 어떻게 도착하는가]] — 자연어로 만든 class vector를 미세조정·선형 탐침과 비교해 사전 학습 지식의 전달 경로를 살핀다.

## 출처

- Alec Radford 외, [Learning Transferable Visual Models From Natural Language Supervision](https://proceedings.mlr.press/v139/radford21a.html), ICML 2021, 특히 §§2.1–2.5·3.1–3.4·4–6, Figures 1–5와 Table 1.
- Alec Radford 외, [Supplementary Material](https://proceedings.mlr.press/v139/radford21a/radford21a-supp.pdf), 특히 §§A–B·D–E·I, Figures 13–14와 Tables 2·4·8–10·18–20.
- [[075_DALL·E와 이산 이미지 토큰 생성]]
- Aditya Ramesh 외, [Zero-Shot Text-to-Image Generation](https://proceedings.mlr.press/v139/ramesh21a.html), ICML 2021, §2.6과 Figures 3·6·9(c).
- [[085_DALL·E 2와 CLIP 잠재 표현 기반 계층적 확산 생성]]
- Aditya Ramesh 외, [Hierarchical Text-Conditional Image Generation with CLIP Latents](https://arxiv.org/abs/2204.06125), 2022, 특히 §§2.1–2.2·3.1–3.3·5.1–5.5·6와 Figures 2–10.
- 프로젝트 번역·검토 출발 자료: [CLIP: Contrastive Language-Image Pre-training for Multimodal Understanding](https://mbrenndoerfer.com/writing/clip-contrastive-language-image-pretraining-multimodal).
- 프로젝트 보존 자료: `raw/070_CLIP Contrastive Language-Image Pre-training for Multimodal Understanding.ko.md`, `raw/070_CLIP Contrastive Language-Image Pre-training for Multimodal Understanding.commentary.ko.md`.

## 관련 항목

- [[CLIP]]
- [[075_DALL·E와 이산 이미지 토큰 생성]]
- [[085_DALL·E 2와 CLIP 잠재 표현 기반 계층적 확산 생성]]
- [[DALL·E (2021)]]
- [[DALL·E 2]]
- [[Transformer]]
- [[합성곱 신경망]]
- [[사전 학습 지식은 과제에 어떻게 도착하는가]]
