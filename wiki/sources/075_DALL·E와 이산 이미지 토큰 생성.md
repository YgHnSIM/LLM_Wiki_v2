---
schema_version: 2
id: source.075
page_type: source
title: DALL·E와 이산 이미지 토큰 생성
aliases:
  - 075_DALL·E Text-to-Image Generation with Transformer Architectures
  - DALL·E Text-to-Image Generation with Transformer Architectures
tags:
  - type/source
  - domain/ai
  - domain/computer-science
  - domain/computer-vision
  - domain/machine-learning
  - domain/nlp
created: '2026-07-21'
updated: '2026-07-21'
lifecycle: active
verification: verified
artifacts:
  - 'raw/075_DALL·E Text-to-Image Generation with Transformer Architectures.ko.md'
  - 'raw/075_DALL·E Text-to-Image Generation with Transformer Architectures.commentary.ko.md'
evidence:
  - source_id: ramesh-et-al-2021-dalle
    locator: 'PMLR 139, pp. 8821–8831의 §§1–4·Figures 1–9와 Appendix §§A–C·F–G·Figures 10–14·Listings 1–2의 dVAE·joint token stream·희소 attention·학습·재순위화·평가·중복 분석'
    relation: supports
  - source_id: openai-2021-dalle
    locator: 'Overview, Capabilities의 Drawing multiple objects·Zero-shot visual reasoning, Summary of approach and prior work와 footnote A의 발표 범위·예시·후보 재순위화·사회 영향 경계'
    relation: contextualizes
  - source_id: openai-2021-dalle-dvae
    locator: 'README와 model_card.md의 Model Details·Model Use·Training Data·Performance and Limitations에 기록된 dVAE 공개 범위와 복원 한계'
    relation: supplements
related:
  - concept.dall-e-2021
  - concept.transformer
  - concept.자기회귀-생성
  - concept.clip
---
# DALL·E와 이산 이미지 토큰 생성

> [!note] 학습 안내
> **난이도:** 중급<br>
> **선수 지식:** [[Transformer]], [[자기회귀 생성]]<br>
> **읽고 나면:** 2021년 DALL·E가 이미지를 이산 토큰으로 압축해 텍스트와 함께 자기회귀 모델링한 두 단계 구조를 설명하고, 생성기·대조 재순위화·제로샷 평가가 각각 보장하는 범위를 구분할 수 있다.

## 1단계 — 먼저 잡을 핵심

### 핵심 문장

2021년 [[DALL·E (2021)|DALL·E]]는 256×256 이미지를 1,024개의 이산 코드로 압축한 뒤, 최대 256개의 텍스트 토큰과 이어 붙여 120억 매개변수 희소 [[Transformer]]가 하나의 자기회귀 시퀀스로 학습한 텍스트-이미지 생성 시스템이다. 별도 텍스트 인코더가 의미를 완성해 이미지 디코더에 넘기는 구조가 아니라, 고정된 이산 변분 오토인코더(discrete variational autoencoder, dVAE)와 디코더 전용 Transformer를 잇는 두 단계 설계다.

이 시스템의 결과는 생성기 하나만의 출력으로 읽지 않는다. 논문의 대표 비교는 한 문구에서 512개 후보를 만든 뒤, [[CLIP]]과 같은 계열의 별도 대조 모델로 문구 적합도를 계산해 가장 높은 후보를 골랐다. 따라서 모델의 확률 분포, 표본 수와 후보 선택기가 함께 최종 품질을 만든다.

### 역사적 위치와 범위

OpenAI는 2021년 1월 5일 연구 소개와 시연을 발표했고, 원 논문 초판은 2월 24일 제출된 뒤 ICML 2021에 실렸다. 전체 120억 매개변수 생성 Transformer가 공개 제품이나 공개 가중치로 배포된 것은 아니며, 공개 저장소는 dVAE 부분을 제공했다.

텍스트 조건 이미지 생성은 DALL·E 이전에도 순환 생성 모델과 GAN 계열에서 연구됐다. 이 문서가 복원하는 좁은 전환은 분야의 무조건적인 최초가 아니라, 대규모 인터넷 이미지-텍스트 쌍·이산 시각 표현·희소 Transformer를 단일 토큰 흐름으로 결합한 초기의 대표적 대규모 사례다.

## 2단계 — 작동 원리

### 1단계: 이미지를 1,024개 코드로 압축한다

dVAE는 256×256 RGB 이미지를 32×32 격자로 바꾼다. 격자의 각 위치는 8,192개 범주 가운데 하나를 고르므로 한 이미지에는 1,024개 이미지 토큰이 생긴다. 8,192는 한 이미지의 토큰 수가 아니라 각 위치가 선택할 수 있는 어휘 크기다.

이 압축은 픽셀 값을 그대로 펼칠 때보다 Transformer 문맥 길이를 192분의 1로 줄인다. 계산을 가능하게 하는 대신 털·가는 선·글자처럼 고주파 세부가 흐려지거나 왜곡될 수 있으며, 이 손실은 공개 dVAE 모델 카드와 원 논문의 복원 예시에도 기록돼 있다.

### 2단계: 텍스트와 이미지를 하나의 흐름으로 예측한다

Caption은 소문자 [[서브워드 토큰화|BPE]]로 최대 256개 토큰이 되고, 그 뒤에 1,024개 이미지 토큰이 온다. 64층 디코더 전용 희소 Transformer는 최대 1,280개 토큰을 처리한다. 텍스트 구간에는 인과 마스크를, 이미지 구간에는 행·열·국소 합성곱 모양의 희소 attention을 사용하며, 각 이미지 위치는 모든 텍스트 토큰을 참고할 수 있다.

학습은 텍스트와 이미지 양쪽의 다음 토큰 손실을 계산한다. 각 손실을 정규화한 뒤 텍스트에 1/8, 이미지에 7/8을 가중하므로 목적함수는 다음처럼 요약할 수 있다.

$$
\mathcal{L}=\frac{1}{8}\mathcal{L}_{\text{text}}+\frac{7}{8}\mathcal{L}_{\text{image}}.
$$

따라서 DALL·E를 “텍스트를 읽은 뒤 다음 이미지 토큰만 예측하는 모델”이라고 쓰면 텍스트 토큰까지 함께 모델링한 목적의 일부가 빠진다.

### 3단계: 여러 후보를 만들고 별도 점수로 고른다

추론 때는 문구를 조건으로 이미지 토큰을 순차 표본화하고 dVAE가 이를 픽셀 이미지로 복원한다. 논문의 대표 비교에서는 후보 512개를 만든 뒤 별도의 대조 모델이 문구와 이미지의 일치 점수를 매겨 최상위 하나를 골랐다. OpenAI 시연은 같은 후보군에서 상위 32개를 제시했다.

이 대조 모델은 생성 Transformer의 학습 목적이나 이미지 디코더가 아니다. 생성과 정렬·검색용 표현이 서로 다른 역할을 맡는 파이프라인이며, 후보 수가 늘면 더 좋은 표본을 찾을 기회와 계산 비용이 함께 커진다.

## 3단계 — 기술과 근거

### 자료와 훈련 장부

연구진은 인터넷에서 모은 이미지-텍스트 쌍 2억 5천만 개를 사용했다. Conceptual Captions, Wikipedia 이미지-텍스트 쌍과 필터링한 YFCC100M이 포함됐지만, 전체 목록·권리·동의·인구학적 구성을 공개하지 않았다. Stage 2 학습에는 16GB V100 GPU 1,024개, 전체 batch size 1,024와 430,000 update가 사용됐다.

이미지에는 random square crop과 resize를 적용했고, caption에는 10% BPE dropout을 썼다. 이 조작이 특정 문구·스타일·관계의 조합 일반화를 직접 만들었다는 분리 실험은 없다. 관찰된 행동과 설계 요소 하나의 인과를 같은 주장으로 만들지 않는다.

### MS-COCO와 CUB 결과를 함께 읽는다

| 평가 | 직접 보고된 결과 | 읽을 때의 조건 |
| --- | --- | --- |
| MS-COCO 사람 비교 | DF-GAN보다 사실적이라는 다수표 90.0%, caption에 더 잘 맞는다는 다수표 93.3% | 작업자 5명의 다수결, 512개 후보 대조 재순위화가 포함된 비교 |
| MS-COCO FID | 당시 최고 선행 결과와 2점 이내 | 생성·참조 이미지에 blur radius 1을 적용한 조건에서는 선행 방법보다 FID가 약 6점 낮았음 |
| CUB FID | 선행 최고 방법보다 거의 40점 나쁨 | 인터넷 범용 자료에서 전문 조류 분포로 이동한 zero-shot 평가 |

MS-COCO에서는 강한 결과를 보였지만 CUB에서는 큰 격차로 뒤졌다. 그러므로 제한된 평가에서의 성공을 모든 이미지 영역의 견고한 일반화로 확장할 수 없다.

### 중복과 조합 행동

훈련 자료에는 MS-COCO validation 이미지의 약 21%, CUB 이미지의 약 12%와 겹치는 이미지가 있었고 평가 caption은 포함하지 않았다고 보고됐다. 검출된 중복을 제거한 뒤 지표의 유의한 변화는 없었지만, 이는 모든 의미·구도·개념 노출이 없었다는 증명은 아니다.

논문은 accordion으로 만든 tapir, sweater를 입은 hedgehog, 여러 대상의 색·위치 지정 같은 예시를 제시했다. 동시에 변수 결속(variable binding)이 일관되지 않고, 대상을 늘리거나 같은 뜻의 문구를 다르게 쓰면 결과가 불안정해진다고 밝혔다. 저자들이 관찰한 제한적인 조합 행동과 일반적인 구성적 이해를 구분한다.

## 검증과 한계

### raw 설명의 검증 정정

- **DALL·E는 최초로 텍스트와 이미지를 연결했다:** 선행 텍스트 조건 생성 연구가 있었다. DALL·E의 차별점은 대규모 자료와 이산 이미지 토큰을 단일 희소 Transformer 흐름으로 결합한 규모와 설계다.
- **텍스트 인코더 뒤의 이미지 디코더 구조다:** Stage 2는 텍스트 256개와 이미지 1,024개를 잇는 디코더 전용 joint stream이다. dVAE encoder·decoder와 이 Transformer의 역할을 섞지 않는다.
- **“초밥으로 만든 고양이”가 학습 자료에 없었다:** 이 문구는 원 논문의 대표 예시가 아니며 비공개 2억 5천만 쌍 전체에서 부재했음을 확인할 수 없다. Zero-shot은 평가 자료에 맞춘 별도 미세조정이 없었다는 protocol이다.
- **Attention이 구성적 이해를 만들었다:** 일부 조합 결과는 관찰됐지만 attention 하나의 인과나 인간과 같은 이해·창의성을 검증한 실험은 없다. 원 논문은 변수 결속 실패와 표현 변화에 대한 불안정성도 함께 보고했다.
- **곧바로 창작 제품과 직업에 적용됐다:** 2021년 전체 생성 모델은 공개 제품이 아니었다. 당시 글의 마케팅·교육·디자인 활용은 사용자 연구로 입증된 효과가 아니라 잠재 응용이다.
- **후속 이미지 모델의 공통 아키텍처가 됐다:** DALL·E 1 논문만으로 DALL·E 2·Stable Diffusion·Midjourney의 생성 구조와 직접 계보를 확정할 수 없다. FID와 IS도 DALL·E가 만든 지표가 아니라 선행 이미지 생성 평가 지표다.

### 확인된 한계와 미측정 위험

dVAE 압축은 세부와 문자를 잃을 수 있고, 이미지 토큰의 순차 표본화와 512개 후보 재순위화는 큰 계산 비용을 요구한다. 전문 분포 CUB의 열세, 불안정한 변수 결속과 문구 민감도도 원 연구가 직접 확인한 한계다.

논문은 전체 훈련 자료의 구성과 권리 상태를 공개하지 않았고 체계적인 편향 감사도 제공하지 않았다. 인터넷 자료의 편향·동의·소유권은 중요한 위험이지만, 측정하지 않은 위험을 이미 실험으로 확인된 결과처럼 쓰지 않는다. 생성된 새 조합도 인간과 같은 의도나 창의성의 존재를 판정하지 않는다.

## 학습 확인

### 확인 질문

1. DALL·E의 8,192개 이미지 어휘와 한 이미지의 1,024개 토큰은 어떻게 다른가?
2. dVAE 압축, 단일 자기회귀 흐름과 대조 재순위화는 각각 생성 파이프라인에서 어떤 역할을 맡는가?
3. MS-COCO의 강한 결과만으로 모든 전문 영역의 일반화나 인간과 같은 구성적 이해를 결론 낼 수 없는 이유는 무엇인가?

### 다음 문서

- [[DALL·E (2021)]] — 첫 시스템의 구조·학습·선택 단계를 재사용 가능한 모델 개념으로 정리한다.
- [[CLIP]] — 생성기가 아닌 대조 임베딩 모델이 후보 점수화와 제로샷 분류에서 맡는 역할을 구분한다.

## 출처

- Aditya Ramesh 외, [Zero-Shot Text-to-Image Generation](https://proceedings.mlr.press/v139/ramesh21a.html), ICML 2021, PMLR 139:8821–8831, 특히 §§1–4, Figures 1–9와 Appendix §§A–C·F–G, Figures 10–14, Listings 1–2.
- Aditya Ramesh 외, [arXiv 본문·부록 통합본](https://arxiv.org/abs/2102.12092), Appendix §§A–C·F–G, Figures 10–14와 Listings 1–2의 재검증 경로.
- OpenAI, [DALL·E: Creating images from text](https://openai.com/index/dall-e/), 2021-01-05, 특히 Overview, Drawing multiple objects, Zero-shot visual reasoning, Summary of approach and prior work와 footnote A.
- OpenAI, [DALL·E dVAE repository and model card](https://github.com/openai/DALL-E), README와 `model_card.md`의 Model Details·Model Use·Training Data·Performance and Limitations.
- 프로젝트 번역·검토 출발 자료: [DALL·E: Text-to-Image Generation with Transformer Architectures](https://mbrenndoerfer.com/writing/dalle-text-to-image-generation-transformer), 2025-06-29.
- 프로젝트 보존 자료: `raw/075_DALL·E Text-to-Image Generation with Transformer Architectures.ko.md`, `raw/075_DALL·E Text-to-Image Generation with Transformer Architectures.commentary.ko.md`.

## 관련 항목

- [[DALL·E (2021)]]
- [[Transformer]]
- [[자기회귀 생성]]
- [[CLIP]]
