---
schema_version: 3
id: concept.flamingo
page_type: concept
title: Flamingo
aliases:
  - Flamingo VLM
  - Flamingo-80B
  - Flamingo 시각-언어 모델
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
  - raw/084_Flamingo Few-Shot Vision-Language Learning with Gated Cross-Attention.ko.md
  - raw/084_Flamingo Few-Shot Vision-Language Learning with Gated Cross-Attention.commentary.ko.md
evidence:
  - source_id: alayrac-et-al-2022-flamingo
    locator: 'NeurIPS 2022, §§2.1–2.5·3.1–3.3·5와 Figures 2–4·Tables 1–3; Supplementary §§A.1–A.3·B.1–B.3·D.1–D.2·E–F와 Figures 5–9·13·Tables 4–16의 model 구성·훈련 mixture·문맥 내 평가·절제·실패·위험·사용 제한'
    relation: supports
relations:
  - target: source.067
    kind: related
  - target: source.070
    kind: related
  - target: source.078
    kind: related
  - target: concept.transformer
    kind: related
  - target: concept.합성곱-신경망
    kind: related
  - target: analysis.사전-학습-지식은-과제에-어떻게-도착하는가
    kind: related
learning:
  difficulty:
    entry: intermediate
    target: intermediate
  prerequisites:
    - target: concept.clip
    - target: concept.문맥-내-학습
  assumed_knowledge: 없음
  outcomes:
    - 'Flamingo를 동결 백본·시각 token 병목·gated cross-attention·interleaved prompt의 결합으로 설명하고, 그 퓨샷 결과를 미세조정과 구분할 수 있다.'
  next:
    - target: source.084
      reason: 084Flamingo와 게이트 교차 어텐션 기반 퓨샷 시각-언어 학습 — 원문 서사를 model 수치·평가 protocol·실패 사례로 검증한다.
---
# Flamingo

> [!note] 학습 안내
> **난이도:** 중급<br>
> **선수 지식:** [[concept.clip|CLIP]], [[concept.문맥-내-학습|문맥 내 학습]]<br>
> **읽고 나면:** Flamingo를 동결 백본·시각 token 병목·gated cross-attention·interleaved prompt의 결합으로 설명하고, 그 퓨샷 결과를 미세조정과 구분할 수 있다.

## 1단계 — 먼저 잡을 핵심

### 한 문장 정의

**Flamingo**는 사전 학습한 시각 인코더와 인과적 언어 모델을 동결한 뒤, 학습 가능한 Perceiver Resampler와 gated cross-attention block으로 연결해 이미지·동영상·text가 번갈아 나오는 prompt에서 text를 생성하는 2022년 시각-언어 모델 계열이다.

### 네 구성요소를 분리한다

| 구성요소 | 역할 | Flamingo 훈련 중 상태 |
| --- | --- | --- |
| NFNet-F6 시각 인코더 | image·video frame을 시공간 특징으로 변환 | 동결 |
| Perceiver Resampler | 가변 길이 특징을 64개 시각 token으로 압축 | 학습 |
| 인과적 언어 모델 | text 문맥과 다음 token 생성 | 동결 |
| GATED XATTN-DENSE | text query가 시각 token을 읽고 잔차 stream에 반영 | 학습 |

가장 큰 variant는 동결된 70B Chinchilla 언어 모델, 동결된 435M 시각 인코더, 학습되는 10B gated block과 194M Resampler를 합쳐 약 80B다. 따라서 Flamingo를 “동결 model에 작은 시각 adapter만 붙인 구조”라고 줄이면 학습되는 연결부의 실제 규모를 숨긴다.

### 무엇이 새 인터페이스였는가

[[CLIP]]은 이미지와 text의 전역 embedding 유사도를 이용해 후보를 비교한다. Flamingo는 시각 token을 언어 model의 자기회귀 생성에 조건으로 넣어 open-ended caption·답을 만든다. [[문맥 내 학습]]의 demonstration도 text만이 아니라 `(image/video, question, answer)` 또는 `(image/video, caption)` 묶음으로 확장한다. Shared embedding, 조건부 생성, 퓨샷 prompt는 서로 다른 층의 설계다.

## 2단계 — 작동 원리

### Perceiver Resampler

시각 인코더의 출력 길이는 image 해상도와 video frame 수에 따라 달라진다. Resampler는 64개의 학습된 latent query가 이 특징을 cross-attention으로 읽게 해 고정 길이 $X\in\mathbb{R}^{64\times d}$로 바꾼다. Latent 자체도 key/value에 함께 넣는다. 이 병목은 뒤쪽 cross-attention의 비용을 고정된 크기로 제한하고 image와 video에 같은 interface를 제공한다.

고정 token 수는 계산 절약과 정보 보존의 절충이다. 64개 token이 원 image의 물체 수나 영역 분할을 뜻하지 않으며, 작은 text·정밀 위치·개수 같은 모든 정보를 보존한다고 보장하지 않는다.

### GATED XATTN-DENSE

Text hidden state $Y$가 query, 시각 token $X$가 key/value가 된다. 새 cross-attention과 FFN의 출력은 각각 $\tanh(\alpha)$를 곱해 residual에 더한다. Layer별 scalar $\alpha$는 0에서 시작하므로 초기에는 새 branch가 꺼지고 model 출력은 원래 동결 언어 model과 같다.

Gate가 입력 example마다 discrete routing을 선택하는 것은 아니다. Pretraining 중 학습되는 연속 scalar이며, few-shot inference에서는 weight가 고정된다. 최종 논문 Table 3의 절제 실험은 gate를 없앴을 때 전체 score가 70.7에서 66.5로 4.2점 낮아지고 학습 불안정이 나타났음을 보였지만, 과제별 과적합이 사라졌다는 증거는 아니다.

### Image-causal mask와 interleaved 문서

문서의 `<image>` 위치와 `<EOC>` 경계를 이용해 각 text token을 앞선 시각 입력에 연결한다. 기본 mask에서 token은 바로 앞의 가장 최근 image를 직접 cross-attend하고, 더 오래된 image는 언어 decoder의 causal 상태를 통해 간접적으로 전달된다. 미래 image는 볼 수 없다.

M3W web page는 이 순서를 실제 HTML DOM에서 복원한다. Pair 자료인 ALIGN·LTIP·VTP도 `<image>`와 `<EOC>` 형식으로 바꿔 함께 학습한다. 추론 prompt의 `demonstration → query` 배열이 훈련 자료의 interleaved 형식과 닮았다는 점이 멀티모달 ICL의 중요한 조건이다.

## 3단계 — 기술과 근거

### 크기와 학습 계산

| 이름 | 실제 total | 동결 LM | 학습 연결부 배치 |
| --- | ---: | ---: | --- |
| Flamingo-3B | 3.2B | 1.4B | 모든 LM block 앞 |
| Flamingo-9B | 9.3B | 7.1B | 매 4번째 LM block 앞 |
| Flamingo | 80B | 70B Chinchilla | 매 7번째 LM block 앞 |

모든 크기에서 435M NFNet-F6와 194M Resampler는 동일하다. 가장 큰 model은 TPU v4 1,536개에서 15일 동안 학습됐다. 동결 백본을 재사용한 효율성과 전체 훈련·추론 비용이 작다는 주장은 구분해야 한다.

### Training mixture

M3W는 약 4,300만 page에서 image 1억 8,500만 개와 text 182GB를 모았다. Pair 자료는 ALIGN image 18억 개, LTIP image 3억 1,200만 개, VTP video 2,700만 개다. 자료별 text 품질·모달리티가 달라 weighted negative log-likelihood의 gradient를 각각 계산해 누적했다. 최종 논문 Table 3에서 전체 mixture의 overall score는 70.7이었고, M3W를 빼면 53.4, image-text pair를 빼면 60.9, VTP를 빼면 67.3으로 낮아졌다.

### 평가 protocol

논문은 16개 image/video-language benchmark 전반을 평가하고 대부분의 과제에서 0·4·8·16·32-shot 결과를 보고했다. RareAct는 Table 1에 zero-shot만 있으며, ImageNet·Kinetics700은 Supplementary의 추가 분류 평가다. Open-ended 과제는 text를 생성하고, close-ended 과제는 후보의 log-likelihood를 순위화한다. Published few-shot 비교가 있는 아홉 과제는 4-shot부터 새 few-shot 최고 결과를 기록했고, 32-shot은 Figure 2와 §3.1 본문 기준 여섯 과제에서 fine-tuned 최고 결과를 넘었다.

연구진의 open-ended zero-shot은 downstream 예시 두 개에서 visual input만 뺀 text-only prompt를 사용한다. Close-ended zero-shot은 후보 completion의 likelihood를 비교하므로 이 text example을 넣지 않았다. 또 RICES는 frozen visual feature로 query와 비슷한 support image를 검색해 example을 고르고, prompt permutation을 ensemble할 수 있다. 그러므로 shot 수만으로 model의 순수 능력이나 예시 비용을 모두 표현할 수 없다.

## 검증과 한계

### 확인된 성과와 내부 불일치

확인된 핵심 성과는 하나의 weight set으로 생성·QA·분류를 prompt 형식에 따라 바꾸고, 많은 과제에서 기존 few-shot 접근보다 높은 점수를 낸 것이다. 그러나 Table 1 caption은 32-shot이 fine-tuned 최고 결과를 일곱 과제에서 넘었다고 쓰고 Figure 2·§3.1 본문·model card는 여섯이라고 쓴다. Caption의 일곱은 RareAct의 0-shot 60.8까지 묶은 것으로 보이지만 RareAct에는 fine-tuned 비교값이 없다. 확인 가능한 여섯 과제는 OKVQA·MSVDQA·Flickr30K·iVQA·STAR·NextQA다.

### 원 논문이 기록한 실패

- 생성 언어 model 목적은 같은 시각 encoder를 쓰는 대조 model보다 분류 성능이 낮았다.
- 언어 prior에 기대 image와 다른 답을 만들거나, 알 수 없는 질문에 근거 없이 추측했다.
- VisDial 32-shot prompt는 4,096–8,192 token으로 늘어나 2,048-token 학습 길이를 넘었고 16-shot보다 상대 성능이 약 30% 낮아졌다.
- In-context learning은 example 순서·형식에 민감하고, shot이 늘수록 inference 비용이 증가하며, 32개를 넘으면 성능이 빠르게 포화했다.
- 자연어 출력은 bounding box·optical flow 같은 구조화·연속 예측의 직접 interface가 아니다.

### 연구용 model의 경계

Supplementary E의 model card는 Flamingo가 연구 목적으로 개발됐고 별도 위험 분석 없이 특정 응용에 쓰지 말라고 명시한다. Web 자료의 bias·유해 표현·privacy 위험과 Chinchilla에서 물려받은 언어 model의 위험도 남는다. 제한적인 caption 공정성·toxicity 검사는 안전한 실제 배포를 인증하지 않는다.

Fine-tuning은 언어 model을 동결한 채 시각 backbone을 풀고 학습 가능 층을 갱신하며 해상도를 480으로 높인 별도 조건이다. VQAv2·VATEX·VizWiz·MSRVTTQA·HatefulMemes에서는 새 최고 결과를 냈지만 네 과제에서는 그러지 못했다. Prompt-only few-shot과 과제별 fine-tuning은 example 수뿐 아니라 weight·해상도·hyperparameter 비용이 다르다.

## 학습 확인

### 확인 질문

1. Perceiver Resampler와 gated cross-attention은 각각 시각 입력의 길이와 언어 model 연결 문제를 어떻게 나눠 푸는가?
2. 동결된 backbone과 약 10B의 새 gated block을 함께 기록해야 하는 이유는 무엇인가?
3. 32-shot fine-tuned SOTA 비교에서 논문의 caption·본문 불일치를 어떻게 판정할 수 있는가?

### 다음 문서

- [[source.084|Flamingo와 게이트 교차 어텐션 기반 퓨샷 시각-언어 학습]] — 084Flamingo와 게이트 교차 어텐션 기반 퓨샷 시각-언어 학습 — 원문 서사를 model 수치·평가 protocol·실패 사례로 검증한다.

## 출처

- [[084_Flamingo와 게이트 교차 어텐션 기반 퓨샷 시각-언어 학습]]
- Jean-Baptiste Alayrac 외, [*Flamingo: a Visual Language Model for Few-Shot Learning*](https://proceedings.neurips.cc/paper_files/paper/2022/hash/960a172bc7fbf0177ccccbb411a7d800-Abstract-Conference.html), NeurIPS 2022; §§2.1–2.5·3.1–3.3·5, Figures 2–4, Tables 1–3과 Supplementary §§A.1–A.3·B.1–B.3·D.1–D.2·E–F, Figures 5–9·13, Tables 4–16.
- Google DeepMind, [Tackling multiple tasks with a single visual language model](https://deepmind.google/blog/tackling-multiple-tasks-with-a-single-visual-language-model/), 2022.
- 프로젝트 보존 자료: `raw/084_Flamingo Few-Shot Vision-Language Learning with Gated Cross-Attention.ko.md`, `raw/084_Flamingo Few-Shot Vision-Language Learning with Gated Cross-Attention.commentary.ko.md`.

## 관련 항목

- [[source.084|Flamingo와 게이트 교차 어텐션 기반 퓨샷 시각-언어 학습]]
- [[concept.clip|CLIP]]
- [[concept.문맥-내-학습|문맥 내 학습]]
- [[source.067|GPT-3와 문맥 내 학습]]
- [[source.070|CLIP과 대조적 언어-이미지 사전 학습]]
- [[source.078|Chinchilla와 계산 최적 언어 모델 학습]]
- [[concept.transformer|Transformer]]
- [[concept.합성곱-신경망|합성곱 신경망]]
- [[analysis.사전-학습-지식은-과제에-어떻게-도착하는가|사전 학습 지식은 과제에 어떻게 도착하는가]]
