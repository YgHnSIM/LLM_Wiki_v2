---
schema_version: 2
id: concept.gpt-4
page_type: concept
title: GPT-4
aliases:
  - Generative Pre-trained Transformer 4
  - GPT-4V
  - GPT-4 with vision
tags:
  - type/concept
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
  - 'raw/096_GPT-4 Multimodal Language Models Reach Human-Level Performance.ko.md'
  - 'raw/096_GPT-4 Multimodal Language Models Reach Human-Level Performance.commentary.ko.md'
evidence:
  - source_id: openai-2023-gpt4-technical-report
    locator: 'Abstract·§§1–2·4–6, Tables 1–3, Figures 4·6–8와 Appendices A·C–D·G의 multimodal interface, 시험·MMLU·오염·scaling 예측·안전과 비공개 구조'
    relation: supports
  - source_id: openai-2023-gpt4-research
    locator: '2023-03-14의 text ChatGPT·API 공개, image research preview·limited alpha, 8K/32K context, 제품 능력·한계·안전 발표'
    relation: supports
  - source_id: openai-2023-gpt4v-system-card
    locator: 'pp. 1–13과 §§2.1–2.4의 2022년 훈련·2023년 early access, 시각 평가·pilot·의료·근거 없는 추론·multimodal 위험'
    relation: supports
  - source_id: openai-2023-chatgpt-vision-rollout
    locator: '2023-09-25의 Plus·Enterprise image 입력 단계적 rollout과 OCR·고위험 사용 경계'
    relation: supports
  - source_id: openai-2023-devday-developer-products
    locator: '2023-11-06, New modalities in the API 절의 GPT-4 Turbo with vision과 gpt-4-vision-preview 공개'
    relation: supports
  - source_id: katz-et-al-2024-gpt4-bar-exam
    locator: 'Abstract·Methods·Results의 simulated UBE protocol과 MBE·MEE·MPT 점수·합격선'
    relation: contextualizes
  - source_id: martinez-2024-gpt4-bar-exam
    locator: 'Abstract·§§2–5와 Tables 1–5의 UBE percentile 재산정·MBE 복제·essay scoring 비판'
    relation: disputes
  - source_id: openai-2024-gpt4o-release
    locator: '2024-05-13 Model capabilities·Model availability의 GPT-4o 별도 공표, 단일 신경망 end-to-end claim과 단계적 rollout'
    relation: contextualizes
related:
  - source.096
  - source.107
  - source.067
  - source.077
  - source.081
  - source.093
  - source.095
  - concept.rlhf
  - concept.멀티모달-대규모-언어-모델
  - concept.big-bench-mmlu
  - analysis.평가-지표와-모델-유인
---
# GPT-4

> [!note] 학습 안내
> **난이도:** 중급<br>
> **선수 지식:** [[067_GPT-3와 문맥 내 학습|GPT-3]], [[인간 피드백 강화학습]], [[멀티모달 대규모 언어 모델]]<br>
> **읽고 나면:** GPT-4의 공개된 입출력·훈련 개요와 비공개 architecture를 구분하고, base·post-training·GPT-4V·제품 snapshot 및 benchmark·실무·안전 주장을 서로 다른 층으로 설명할 수 있다.

## 1단계 — 먼저 잡을 핵심

### 한 문장 정의

**GPT-4(Generative Pre-trained Transformer 4)**는 OpenAI가 2023년 공개한 Transformer-style 대규모 model 계열로, text 또는 interleaved image·text 입력을 조건으로 text를 생성하며 base pretraining 뒤 post-training과 제품 수준 안전·배포 계층을 거친다.

이 정의가 말하지 않는 것도 중요하다. 공개 자료는 parameter 수, dense·[[전문가 혼합|MoE]] 여부, 구체적 vision encoder·bridge, hardware·training compute와 dataset 구성을 밝히지 않았다. `GPT-4V`는 image-input 기능을 강조한 이름이지 공개된 별도 architecture 명세가 아니다.

### 네 층을 분리한다

| 층 | 확인 가능한 내용 | 섞으면 생기는 오류 |
| --- | --- | --- |
| Base model | next-token pretraining, 일부 benchmark·scaling 결과 | 대화 거부·말투를 base 고유 속성으로 봄 |
| Post-training | supervised 조정, RLHF·안전 보상 | 모든 지식·시험 능력이 RLHF에서 생겼다고 봄 |
| Multimodal interface | image+text 입력→text 출력 | 특정 vision encoder나 image 생성 기능을 추정 |
| Product system | ChatGPT/API snapshot, system prompt·policy·monitoring·access | 한 시점 제품 결과를 영구적인 model 성능으로 봄 |

`GPT-4`라는 같은 이름도 날짜·snapshot·input capability와 제품에 따라 다른 조건을 가리킨다. 평가에는 최소한 text/vision, base/post-trained, model snapshot과 prompt를 함께 적는다.

### 공개 chronology

- 2022년: GPT-4V system card 기준 훈련 완료
- 2023-03-14: 기술 보고서와 GPT-4 발표; ChatGPT Plus·API waitlist에서 text 입력 공개
- 2023년 3월 이후: image 입력 limited alpha와 Be My Eyes 등 early-access pilot
- 2023-09-25: Plus·Enterprise 대상 GPT-4V의 단계적 image rollout 발표
- 2023-11-06: 개발자용 `gpt-4-vision-preview` 발표

보고, 제한 접근, 일반 사용자 rollout과 API preview를 같은 ‘출시’로 합치지 않는다.

## 2단계 — 작동 원리

### 공개된 사전 학습과 post-training

Base model은 public·licensed source를 포함한 web-scale corpus에서 다음 token을 예측하도록 훈련됐다.

$$
\mathcal L_{\mathrm{NTP}}
=-\sum_t \log p_\theta(x_t\mid x_{<t},c),
$$

여기서 $c$는 text-only 또는 image representation과 text를 포함하는 조건을 뜻할 수 있다. 다만 image를 $c$로 바꾸는 encoder·bridge의 구체 계산은 비공개다.

Post-training은 사용자의 지시와 정책에 맞는 응답을 선호하도록 행동을 조정했다. GPT-4 보고서는 RLHF와 추가 safety reward signal, red-team feedback, model-assisted rule evaluation을 설명한다. 이 단계는 base knowledge를 전면 새로 만드는 과정도, 모든 사실 오류와 유해 행동을 제거하는 보증도 아니다.

### Multimodal은 입력·출력 signature로 읽는다

공식 GPT-4 interface는 interspersed image와 text를 입력받아 natural language·code 같은 text를 출력했다.

$$
(I_1,T_1,I_2,T_2,\ldots)\longrightarrow T_{\mathrm{out}}
$$

이는 image를 생성하는 decoder나 특정 fusion architecture를 뜻하지 않는다. [[멀티모달 대규모 언어 모델]]은 같은 signature를 continuous prefix, cross-attention memory, query bottleneck과 projected visual token 등 서로 다른 구조로 구현할 수 있다. GPT-4 내부 구조는 그 표의 ‘비공개’ 칸에 남긴다.

### 능력은 protocol에 조건화된다

GPT-4의 시험·benchmark 점수는 다음 변수의 함수다.

$$
S=f(M,V,P,K,D,G,C),
$$

여기서 $M$은 snapshot, $V$는 exam·dataset version, $P$는 prompt, $K$는 shot 수, $D$는 decoding, $G$는 grader·scoring, $C$는 contamination 조건이다. UBE·LSAT·MMLU의 숫자를 model 이름만으로 비교하면 protocol 차이가 지워진다.

## 3단계 — 기술과 근거

### 일부 시험에서 큰 향상, 전체 과제에서는 큰 편차

GPT-4 technical report는 UBE 298점·약 90백분위, LSAT 약 88백분위, SAT·GRE 일부의 높은 결과를 보고했다. 동시에 GRE Writing 약 54백분위, 일부 AP English 8–44백분위, AMC 10 6–12백분위와 Codeforces 5백분위 미만도 보고했다. ‘인간 수준’은 model 전체에 붙는 이진 속성보다 어떤 시험·집단·protocol에서 인간 score 범위에 들어갔는지 밝히는 문장이어야 한다.

MMLU의 base GPT-4 5-shot 86.4%는 57개 객관식 과목에서 큰 향상을 보였지만 설명·최신 정보·도구·직업 책임을 직접 채점하지 않는다. BIG-bench는 training contamination 발견 때문에 결과를 생략했다. [[BIG-bench와 MMLU]]가 설명하듯 benchmark 결과와 data boundary를 함께 본다.

### UBE의 점수와 percentile은 다른 통계다

Katz 등의 simulated UBE 연구는 GPT-4가 약 297점을 얻어 여러 관할의 합격선을 넘는다고 보고했다. 그러나 약 90백분위는 NCBE의 공식 전국 percentile이 아니다. Martínez의 재평가는 비교 분포를 바꾸면 약 68백분위(7월 전체), 약 62백분위(첫 응시자), 약 45–48백분위(합격자)로 달라짐을 보였다. Essay 영역은 합격자 집단에서 약 15백분위였고 공식 rubric·grader training·blind calibration이 없었던 점도 지적했다.

따라서 ‘합격했다’, ‘90백분위였다’, ‘현업 변호사 수준이다’를 각각 검증한다. 첫째는 비교적 견고하고, 둘째는 모집단에 민감하며, 셋째는 시험이 측정하지 않은 외삽이다.

### Scaling 예측과 공개 범위

OpenAI는 훨씬 적은 compute의 run으로 GPT-4 internal code loss를 예측하고 HumanEval 일부에서 scaling 예측을 보였다. 그러나 미래의 모든 reasoning·vision·safety 능력을 사전 예측한 것은 아니다. Model architecture·총 compute·dataset construction이 비공개여서 외부 연구자가 같은 training run을 재현할 수도 없다.

### 안전은 다층 평가다

GPT-4는 특정 OpenAI 내부 평가에서 GPT-3.5보다 금지 요청 응답 82% 감소, 민감 요청 policy 준수 29% 증가와 factuality·toxicity 개선을 보였다. 이 비교는 당시 policy·prompt set·classifier·snapshot에 조건화된다.

남은 한계도 함께 보고됐다.

- 사실 hallucination과 단순 reasoning 오류
- 높은 confidence의 오답과 post-training 뒤 calibration 저하
- 안전한 요청의 과잉 거절과 jailbreak
- red-team 참여자의 언어·지역·교육·산업 편향
- model 능력 상승이 여는 cyber·bio·사회적 위험 표면

GPT-4V는 여기에 OCR·공간·색·순서·의료 image 오류와 visual prompt injection, 사람·장소에 대한 근거 없는 추론을 더했다.

## 검증과 한계

### 확인된 것과 비공개인 것

| 구분 | 내용 |
| --- | --- |
| 확인 | Transformer-style next-token pretraining, public·licensed data, RLHF, image+text→text interface, 일부 시험·안전 평가 |
| 비공개 | parameter 수, dense/MoE, vision encoder·bridge, hardware·총 compute, dataset composition·세부 filtering |
| 외삽 금지 | 특정 architecture가 성능을 만들었다는 인과, benchmark percentile=실무 능력, 내부 안전 개선=범용 안전 인증 |

### Snapshot과 제품이 바뀐다

초기 API는 `gpt-4-0314` 같은 snapshot pinning, 8,192-token context와 제한된 32,768-token version을 제공했다. 이후 같은 제품명 아래 context·tool·vision·policy가 달라질 수 있다. 2023년 결과를 후대 GPT-4 Turbo나 다른 provider model의 사양으로 소급하지 않는다.

GPT-4o도 GPT-4의 이름만 바꾼 2023년 snapshot으로 소급하지 않는다. OpenAI는 2024년 5월 13일 GPT-4o를 text·vision·audio를 한 신경망에서 end-to-end로 학습한 별도 omni model로 공표했다. 따라서 GPT-4·GPT-4V의 2023년 시험·vision rollout·안전 결과와 GPT-4o의 latency·audio·System Card 결과는 서로 자동 상속되지 않으며, 각각 model family·snapshot·modality·제품 날짜를 붙여 인용한다.

### 시각 능력은 고위험 사용 승인이 아니다

GPT-4V system card는 의료 image 해석의 불안정성과 image 순서·작은 문자·수학 기호·비로마자 OCR 문제를 기록했다. 당시 version은 의료 기능이나 진단·치료·전문가 판단의 대체에 적합하지 않았다. 접근성 pilot의 유용성과 독립된 사람 확인 경로가 함께 존재한 이유다.

### 영향과 계보의 한계

GPT-4 공개가 멀티모달 제품·시험 평가·AI 안전 논의를 넓힌 사실과, 내부 architecture가 후속 모든 model의 직접 표준이 됐다는 주장은 다르다. 상세 구조가 공개되지 않았으므로 GPT-4 Turbo·Claude 3·다른 MLLM이 GPT-4의 내부 기술을 직접 계승했다는 계보는 기능 경쟁만으로 세우지 않는다.

## 학습 확인

### 확인 질문

1. Base GPT-4, RLHF model, GPT-4V와 ChatGPT/API 제품을 같은 층으로 보면 어떤 평가 오류가 생기는가?
2. UBE 298점이 비교 분포에 따라 여러 percentile로 바뀌는 이유는 무엇인가?
3. Image+text→text interface에서 특정 vision encoder·bridge를 역추론하면 안 되는 이유는 무엇인가?

### 다음 문서

- [[096_GPT-4의 멀티모달 공개·시험 성능·안전 경계]] — 원 웹글의 주장과 1차 자료·후속 재평가를 대조한다.
- [[107_GPT-4o의 단일 신경망 공표와 실시간 멀티모달 배포 경계]] — GPT-4와 구분되는 2024년 omni model 공표와 audio·rollout 평가 경계를 살핀다.
- [[멀티모달 대규모 언어 모델]] — 공개 model의 여러 bridge와 입출력 signature를 비교한다.
- [[BIG-bench와 MMLU]] — benchmark 집계·prompt·오염의 평가 경계를 살핀다.
- [[인간 피드백 강화학습]] — base 능력과 post-training 행동을 구분한다.

## 출처

- [[096_GPT-4의 멀티모달 공개·시험 성능·안전 경계]]
- [[107_GPT-4o의 단일 신경망 공표와 실시간 멀티모달 배포 경계]]
- OpenAI, [*GPT-4 Technical Report*](https://cdn.openai.com/papers/gpt-4.pdf), 2023, Abstract·§§1–2·4–6와 Appendices A·C–D·G.
- OpenAI, [*GPT-4*](https://openai.com/index/gpt-4-research/), 2023-03-14.
- OpenAI, [*GPT-4V(ision) System Card*](https://cdn.openai.com/papers/GPTV_System_Card.pdf), 2023, pp. 1–13과 §§2.1–2.4.
- OpenAI, [*ChatGPT can now see, hear, and speak*](https://openai.com/index/chatgpt-can-now-see-hear-and-speak/), 2023-09-25.
- OpenAI, [*New models and developer products announced at DevDay*](https://openai.com/index/new-models-and-developer-products-announced-at-devday/), 2023-11-06, “New modalities in the API”.
- OpenAI, [*Hello GPT-4o*](https://openai.com/index/hello-gpt-4o/), 2024-05-13, Model capabilities·Model availability.
- Daniel Martin Katz 외, [*GPT-4 Passes the Bar Exam*](https://doi.org/10.1098/rsta.2023.0254), *Philosophical Transactions of the Royal Society A* 382, 2024.
- Eric H. Martinez, [*Re-evaluating GPT-4’s Bar Exam Performance*](https://doi.org/10.1007/s10506-024-09396-9), *Artificial Intelligence and Law* 32, 2024.
- 프로젝트 보존 자료: `raw/096_GPT-4 Multimodal Language Models Reach Human-Level Performance.ko.md`, `raw/096_GPT-4 Multimodal Language Models Reach Human-Level Performance.commentary.ko.md`.

## 관련 항목

- [[096_GPT-4의 멀티모달 공개·시험 성능·안전 경계]]
- [[107_GPT-4o의 단일 신경망 공표와 실시간 멀티모달 배포 경계]]
- [[067_GPT-3와 문맥 내 학습|GPT-3]]
- [[077_InstructGPT와 인간 선호 정렬]]
- [[081_ChatGPT 연구 미리보기와 대화형 LLM 배포]]
- [[093_멀티모달 LLM과 시각-언어 연결 방식의 분화]]
- [[095_BIG-bench와 MMLU의 평가 범위·집계 경계]]
- [[인간 피드백 강화학습]]
- [[멀티모달 대규모 언어 모델]]
- [[BIG-bench와 MMLU]]
- [[자동 평가 지표는 무엇을 보상하는가]]
