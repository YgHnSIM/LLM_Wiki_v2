---
schema_version: 2
id: source.084
page_type: source
title: Flamingo와 게이트 교차 어텐션 기반 퓨샷 시각-언어 학습
aliases:
  - 084_Flamingo Few-Shot Vision-Language Learning with Gated Cross-Attention
  - 'Flamingo: a Visual Language Model for Few-Shot Learning'
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
  - 'raw/084_Flamingo Few-Shot Vision-Language Learning with Gated Cross-Attention.ko.md'
  - 'raw/084_Flamingo Few-Shot Vision-Language Learning with Gated Cross-Attention.commentary.ko.md'
evidence:
  - source_id: alayrac-et-al-2022-flamingo
    locator: 'NeurIPS 2022, §§2.1–2.5·3.1–3.3·5와 Figures 2–4·Tables 1–3; Supplementary §§A.1–A.3·B.1–B.3·D.1–D.2·E–F와 Figures 5–9·13·Tables 4–16의 model 구성·훈련 mixture·문맥 내 평가·절제·실패·위험·자료·model card'
    relation: supports
related:
  - concept.flamingo
  - source.067
  - source.070
  - source.078
  - concept.문맥-내-학습
  - concept.clip
  - concept.transformer
  - concept.합성곱-신경망
  - analysis.사전-학습-지식은-과제에-어떻게-도착하는가
---
# Flamingo와 게이트 교차 어텐션 기반 퓨샷 시각-언어 학습

> [!note] 학습 안내
> **난이도:** 중급<br>
> **선수 지식:** [[CLIP]], [[문맥 내 학습]], [[Transformer]]<br>
> **읽고 나면:** Flamingo가 동결된 시각·언어 백본을 어떻게 연결하고 멀티모달 문맥 내 학습을 평가했는지 설명하며, 게이트의 훈련 역할과 추론 시 퓨샷 적응을 구분할 수 있다.

## 1단계 — 먼저 잡을 핵심

### 핵심 문장

Alayrac 등은 2022년에 이미지·동영상과 텍스트를 한 프롬프트에 번갈아 넣고 텍스트를 생성하는 **[[Flamingo]]** 시각-언어 모델 계열을 발표했다. 연구진은 사전 학습한 NFNet-F6 시각 인코더와 인과적 언어 모델을 동결하고, 그 사이의 Perceiver Resampler와 `GATED XATTN-DENSE` 블록을 새로 학습했다. 가장 큰 약 80B 모델은 70B [[078_Chinchilla와 계산 최적 언어 모델 학습|Chinchilla]] 언어 모델을 기반으로 한다.

핵심은 이미지를 일반 텍스트 token처럼 단순히 이어 붙인 것이 아니다. 시각 인코더의 가변 길이 특징을 Resampler가 이미지·동영상마다 **64개 시각 token**으로 압축하고, 텍스트 은닉 상태가 이 token을 교차 어텐션으로 읽는다. 새 잔차 branch에는 0으로 초기화한 `tanh` gate가 있어 학습 시작점의 출력이 원래 언어 모델과 같도록 한다.

### 퓨샷 때 무엇이 바뀌는가

Flamingo 훈련이 끝난 뒤 과제 예시를 prompt에 넣을 때는 model weight를 갱신하지 않는다. 예시 이미지·질문·답 또는 이미지·caption이 현재 forward pass의 조건이 되어 다음 text 분포를 바꾼다. 따라서 raw 자료의 “gate가 퓨샷 학습 중 과제별 attention pattern을 학습한다”는 표현은 매개변수 학습으로 읽으면 틀린다. Gate·Resampler·교차 어텐션은 대규모 사전 학습 단계에서 최적화되고, 추론 시 demonstration은 고정된 weight의 activation과 조건부 likelihood를 바꾼다.

### CLIP과 같은 시각-언어 문제를 다른 출력으로 푼다

[[070_CLIP과 대조적 언어-이미지 사전 학습|CLIP]]은 이미지와 문장을 독립 부호화한 뒤 전역 embedding 유사도를 비교한다. 이 인터페이스는 후보 class·검색에는 효율적이지만 자유 형식 답을 생성하지 않는다. Flamingo는 대조적으로 시각 token을 자기회귀 언어 모델의 생성 과정에 조건으로 공급해 captioning·질의응답·대화·후보 scoring을 하나의 text 출력 인터페이스로 다뤘다. 두 모델은 시각과 언어를 연결하지만, shared embedding과 조건부 생성은 같은 구조가 아니다.

## 2단계 — 작동 원리

### 시각 특징을 64개 token으로 다시 표집한다

동결된 NFNet-F6는 이미지의 2차원 특징 격자를 만든다. 동영상은 1 FPS로 frame을 뽑아 각각 부호화한 뒤 시간 위치 embedding을 더하고 공간·시간 축을 펼친다. 학습된 잠재 query $X$가 펼친 특징 $X_f$를 읽는 Resampler 한 층은 다음처럼 요약할 수 있다.

$$
X \leftarrow X + \operatorname{Attention}(Q=X,\;K=V=[X_f;X]),
$$

$$
X \leftarrow X + \operatorname{FFN}(X).
$$

이 출력을 여러 층에 걸쳐 갱신하면 입력 해상도나 frame 수와 무관한 64개 시각 token을 얻는다. 고정 병목은 긴 영상의 교차 어텐션 비용을 제어하지만, 입력의 모든 세부를 손실 없이 보존한다는 보장은 아니다.

### 0-init gate로 동결 언어 모델에 시각 branch를 붙인다

언어 은닉 상태를 $Y$, 시각 token을 $X$라 하면 새 block은 다음 두 잔차 branch를 계산한다.

$$
Y' = Y + \tanh(\alpha_{x})\operatorname{CrossAttn}(Q=Y,K=V=X),
$$

$$
Y'' = Y' + \tanh(\alpha_{f})\operatorname{FFN}(Y').
$$

$\alpha_x$와 $\alpha_f$는 층마다 있는 학습 가능한 scalar이며 0으로 초기화된다. 처음에는 $\tanh(0)=0$이므로 새 branch가 건너뛰어지고, 학습되면서 시각 신호가 잔차 stream에 들어온다. 이 설계는 기존 언어 모델의 weight를 바꾸지 않으면서도 새 연결부에 충분한 표현력을 준다. 최종 논문 Table 3의 절제 실험에서는 0-init `tanh` gate를 빼면 전체 score가 70.7에서 66.5로 4.2점 낮아지고 학습 불안정이 나타났다.

### 가장 최근 이미지에 직접 주의를 준다

Interleaved 문서에는 `<image>`와 `<EOC>` marker가 들어간다. 각 text token의 교차 어텐션은 기본적으로 **그 token 앞의 가장 최근 이미지**에 해당하는 시각 token만 직접 본다. 더 앞선 이미지의 정보는 이미 이를 읽은 언어 상태가 causal self-attention을 통해 이어 줄 수 있다. 이 mask는 미래 이미지를 미리 보는 것을 막고, 훈련 때 최대 5개 이미지만 썼어도 추론 때 더 많은 이미지로 일반화하기 쉬운 구조를 만든다.

### 네 종류의 web 자료를 함께 최적화한다

훈련 mixture는 서로 다른 자료 형식을 결합했다.

| 자료 | 논문이 보고한 규모 | 역할 |
| --- | ---: | --- |
| M3W | 약 4,300만 web page, 이미지 1억 8,500만 개, text 182GB | 실제 문서 순서의 interleaved image–text |
| ALIGN | image–alt-text 18억 쌍 | 넓지만 noisy한 paired image–text |
| LTIP | 긴 설명이 붙은 image 3억 1,200만 개 | 더 풍부한 image description |
| VTP | 평균 약 22초인 video 2,700만 개 | video–text pair |

각 자료에서 시각 입력에 조건화한 text의 negative log-likelihood를 계산하고, M3W·ALIGN·LTIP·VTP에 각각 1.0·0.2·0.2·0.03의 가중치 $\lambda_m$를 곱한 gradient를 모두 누적한 뒤 한 번 갱신했다. Raw 자료가 말하는 “대규모 이미지-텍스트 data”에는 단일한 corpus가 아니라 interleaved·paired image·paired video라는 서로 다른 구조와 mixture weight가 들어 있다.

## 3단계 — 기술과 근거

### 세 model 규모와 학습되는 부분

최종 논문의 Supplementary Table 5는 rounded 이름과 실제 구성요소를 다음처럼 나눈다.

| 모델 | 동결 언어 | 동결 시각 | 학습 gated block | 학습 Resampler | 총계 |
| --- | ---: | ---: | ---: | ---: | ---: |
| Flamingo-3B | 1.4B | 435M | 1.2B, 매 LM block 전 | 194M | 3.2B |
| Flamingo-9B | 7.1B | 435M | 1.6B, 매 4번째 전 | 194M | 9.3B |
| Flamingo | 70B | 435M | 10B, 매 7번째 전 | 194M | 80B |

따라서 “동결된 model을 사용했다”는 말은 Flamingo 전체가 소규모 adapter였다는 뜻이 아니다. 80B variant에는 약 10B의 gated block과 194M Resampler가 새로 학습됐다. 논문은 80B model을 TPU v4 chip 1,536개에서 15일 동안 훈련했다고 보고한다.

### 16개 과제를 하나의 weight로 평가했다

본문 Table 1의 평가는 image captioning, visual question answering, OCR question answering, visual dialogue, meme classification, video captioning과 temporal·causal QA를 포함한 16개 benchmark를 사용했다. ImageNet·Kinetics700 분류는 Supplementary Tables 6–7의 추가 평가이므로 이 16개와 구분한다. Open-ended 과제는 beam size 3으로 `<EOC>`까지 text를 생성했고, close-ended 과제는 각 후보 completion의 log-likelihood를 비교했다. Few-shot prompt는 support example 뒤에 query를 놓으며, 예시 선택은 무작위 또는 RICES 검색을 쓸 수 있다.

다섯 개발 과제(COCO·OKVQA·VQAv2·MSVDQA·VATEX)는 설계 결정에 사용했고, 나머지 11개는 최종 few-shot 일반화 추정에만 사용했다. Figure 2에서 published few-shot 비교가 있는 아홉 과제는 4-shot부터 새 few-shot 최고 결과를 기록했다. 전체 16개에는 zero-shot benchmark인 RareAct처럼 4-shot 행이 없는 조건도 있으므로 “4개 예시로 16개 모두를 이겼다”고 합치지 않는다.

32-shot에서는 Figure 2와 §3.1 본문 기준으로 여섯 과제에서 task-specific fine-tuned 최고 결과를 넘었다. 다만 Table 1 caption은 RareAct의 0-shot 결과까지 묶어 일곱 과제라고 쓴 것으로 보이지만 RareAct에는 fine-tuned 비교값이 없다. 이 위키는 본문·Figure 2·model card가 반복하는 **여섯 과제**를 따른다.

### Open-ended ‘제로샷’도 text-only 예시 두 개를 썼다

연구진은 benchmark별 prompt tuning에 숨은 label 비용이 들어간다고 비판했다. Open-ended 과제의 zero-shot 조건에서는 downstream 예시 두 개에서 이미지·동영상만 제거하고 기대 출력 text와 형식은 남긴 prompt를 사용했다. 따라서 이 조건은 support **visual input 0개**이지 task 형식과 text example을 전혀 제공하지 않은 조건은 아니다. 반면 close-ended 과제는 후보 completion의 likelihood를 비교하므로 text-only example을 넣지 않았다. Shot 수를 비교할 때는 visual demonstration, text format, 후보 scoring과 support selection을 함께 기록해야 한다.

### Fine-tuning은 다른 weight·해상도 조건이다

본문 §3.2와 Table 2의 fine-tuning은 언어 모델은 계속 동결하지만 시각 backbone은 동결을 풀고, Flamingo의 학습 가능 층을 갱신하며 입력 해상도도 320에서 480으로 높였다. 과제별 learning rate·step·batch·augmentation을 탐색한 이 조건은 prompt example만 바꾼 32-shot과 직접 같은 adaptation 비용이 아니다.

Fine-tuned Flamingo는 VQAv2, VATEX, VizWiz, MSRVTTQA와 HatefulMemes 다섯 과제에서 새 최고 결과를 보고했지만, COCO·VisDial·YouCook2·TextVQA에서는 당시 최고 결과에 못 미쳤다. 이는 few-shot과 fine-tuning 가운데 하나가 모든 과제에서 우월하다는 결론보다, 적응 방식·자료량·metric에 따라 경계가 달라진다는 사실을 보여 준다.

### 절제 실험은 구조 하나보다 조합을 지지한다

4-shot dev benchmark 절제에서 전체 mixture의 overall score는 70.7이었다. M3W를 제거하면 53.4, image-text pair를 제거하면 60.9, VTP를 제거하면 67.3으로 낮아졌다. Perceiver Resampler는 같은 budget의 vanilla Transformer나 MLP보다 좋은 score와 throughput을 보였고, 0-init gate도 안정성과 최종 score에 기여했다. 이는 강한 결과가 gate 하나의 독립 효과라기보다 interleaved data, paired data, Resampler, frozen backbone과 gated cross-attention의 결합에서 나왔음을 보여 준다.

## 검증과 한계

### raw 설명의 검증 정정

- **Gate가 퓨샷 예시마다 과제별 attention pattern을 학습한다:** 추론 시 gradient update는 없다. Gate와 새 block은 사전 학습에서 학습되고, demonstration은 고정 weight의 현재 activation을 조건화한다.
- **Gate는 과제 과적합을 막는다:** 논문이 직접 보인 것은 0-init gate가 초기 동결 LM 출력을 보존하고, 제거 시 overall score가 70.7에서 66.5로 4.2점 감소하며 학습 불안정이 나타났다는 사실이다. 과제별 과적합 방지 효과를 직접 측정하지 않았다.
- **시각 token과 text token을 같은 Transformer sequence에 교차 배치한다:** 문서 순서는 interleaved지만, Resampler의 시각 token은 별도 key/value memory로 남고 새 cross-attention layer가 이를 읽는다. 일반 언어 token으로 바꿔 self-attention sequence에 단순 삽입한 구조가 아니다.
- **여러 전문 model을 모두 능가했다:** Published few-shot 비교가 있는 아홉 과제에서는 4-shot부터 새 few-shot 최고 결과를 냈지만, 32-shot이 fine-tuned SOTA를 넘은 것은 Figure 2·본문 기준 여섯 과제다. 모든 과제·metric의 최고 model을 이긴 것은 아니다.
- **의료 영상·안전·접근성 분야에 곧바로 쓸 수 있었다:** raw의 응용은 가능성 예시다. Supplementary E의 model card는 연구용 model이며 별도 위험 분석 없이 특정 응용에 사용하지 말라고 명시한다.
- **GPT-4V 같은 후대 model이 Flamingo를 직접 확장했다:** 공개되지 않은 후대 system의 내부 구조나 직접 계보는 Flamingo 논문만으로 입증할 수 없다.

### 논문이 직접 기록한 실패 양상

Flamingo의 생성 목적은 open-ended 출력을 가능하게 하지만, 분류에서는 같은 frozen vision encoder의 대조 model보다 낮았다. Figure 13은 image와 어긋난 언어 prior 기반 hallucination과 입력만으로 답할 수 없는 질문에 대한 근거 없는 추측을 보여 준다. 또한 2,048-token 길이로 학습된 언어 모델에 VisDial 32-shot prompt가 4,096–8,192 token까지 늘어나자 16-shot 대비 상대 성능이 약 30% 하락했다.

문맥 내 학습은 example 수에 따라 inference 비용이 늘고, example 순서·형식에 민감하며 32개를 넘으면 성능이 빨리 포화했다. Bounding box·optical flow 같은 구조화·연속 출력도 자연어 interface가 바로 처리하도록 설계되지 않았다. 이 한계들은 “한 architecture가 모든 시각 과제를 처리한다”는 확대를 막는다.

### Data와 위험 평가의 범위

ALIGN·LTIP에서는 사전에 평가 대상으로 정한 ImageNet·COCO·OK-VQA·VQAv2·Flickr30K·VisDial과 유사한 image를 제거했다. 뒤에 추가한 VizWiz·HatefulMemes·TextVQA와, 수집 출처가 평가 video와 다르다고 본 VTP에는 같은 제거를 적용하지 않았다. M3W도 page 전체의 interleaved 문맥을 보존하기 위해 사전 제거하지 않았고, 사후 검사에서 1억 8,500만 image 가운데 benchmark 유사 후보 1,314개와 exact duplicate 125개를 확인했다. 제한된 중복 수는 영향이 작을 가능성을 보여 줄 뿐 모든 contamination을 배제하지 않는다.

연구진의 성별·피부색 caption과 toxicity 조사는 예비 분석이었다. Chinchilla에서 물려받은 사회적 bias·유해 언어·privacy risk도 남고, safe-for-work 이미지에서 명확한 독성을 관찰하지 못했다는 경험이 공격적 prompt나 실제 배포 안전성을 보장하지 않는다.

가장 큰 model은 비용 때문에 한 번만 훈련돼 error bar가 없다. 따라서 model 규모별 차이를 반복 실험의 분산과 분리하기 어렵다.

## 학습 확인

### 확인 질문

1. Perceiver Resampler의 64개 token 병목과 gated cross-attention은 각각 어떤 계산 문제를 해결하는가?
2. 0-init `tanh` gate를 사전 학습 중의 안정화 장치와 추론 시 과제별 학습 장치로 혼동하면 왜 안 되는가?
3. Flamingo의 4-shot·32-shot·zero-shot 결과를 비교할 때 visual example 수 외에 어떤 prompt·scoring 조건을 함께 기록해야 하는가?

### 다음 문서

- [[Flamingo]] — model family의 구성요소·자료·평가와 한계를 개념 단위로 다시 정리한다.
- [[070_CLIP과 대조적 언어-이미지 사전 학습]] — shared embedding을 이용한 후보 비교와 Flamingo의 조건부 text 생성을 구분한다.
- [[문맥 내 학습]] — weight update 없이 demonstration이 현재 출력 분포를 바꾸는 평가 조건을 살핀다.

## 출처

- Jean-Baptiste Alayrac 외, [*Flamingo: a Visual Language Model for Few-Shot Learning*](https://proceedings.neurips.cc/paper_files/paper/2022/hash/960a172bc7fbf0177ccccbb411a7d800-Abstract-Conference.html), NeurIPS 2022; §§2.1–2.5·3.1–3.3·5, Figures 2–4, Tables 1–3과 Supplementary §§A.1–A.3·B.1–B.3·D.1–D.2·E–F, Figures 5–9·13, Tables 4–16.
- Google DeepMind, [Tackling multiple tasks with a single visual language model](https://deepmind.google/blog/tackling-multiple-tasks-with-a-single-visual-language-model/), 2022; 공식 소개의 16개 과제·4-shot 설명과 연구용 공개 맥락.
- 프로젝트 번역·검토 출발 자료: [Flamingo: Few-Shot Vision-Language Learning with Gated Cross-Attention](https://mbrenndoerfer.com/writing/flamingo-few-shot-vision-language-learning-gated-cross-attention).
- 프로젝트 보존 자료: `raw/084_Flamingo Few-Shot Vision-Language Learning with Gated Cross-Attention.ko.md`, `raw/084_Flamingo Few-Shot Vision-Language Learning with Gated Cross-Attention.commentary.ko.md`.

## 관련 항목

- [[Flamingo]]
- [[067_GPT-3와 문맥 내 학습]]
- [[070_CLIP과 대조적 언어-이미지 사전 학습]]
- [[078_Chinchilla와 계산 최적 언어 모델 학습]]
- [[문맥 내 학습]]
- [[CLIP]]
- [[Transformer]]
- [[합성곱 신경망]]
- [[사전 학습 지식은 과제에 어떻게 도착하는가]]
