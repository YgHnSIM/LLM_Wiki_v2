---
schema_version: 2
id: source.106
page_type: source
title: DeepSeek-R1의 강화학습 파이프라인과 증류 경계
aliases:
  - 106_DeepSeek R1 Architectural Innovation in Reasoning Models
  - DeepSeek R1 Architectural Innovation in Reasoning Models
  - DeepSeek-R1
  - 2025년 DeepSeek R1
tags:
  - type/source
  - domain/ai
  - domain/computer-science
  - domain/machine-learning
  - domain/nlp
  - domain/optimization
created: '2026-07-22'
updated: '2026-07-22'
lifecycle: active
verification: verified
artifacts:
  - 'raw/106_DeepSeek R1 Architectural Innovation in Reasoning Models.ko.md'
  - 'raw/106_DeepSeek R1 Architectural Innovation in Reasoning Models.commentary.ko.md'
evidence:
  - source_id: deepseek-ai-2025-r1
    locator: 'arXiv:2501.12948v1, §§1.1–5와 Tables 1–6의 R1-Zero·R1 학습 단계, GRPO·보상, 증류, 평가 조건과 한계'
    relation: supports
  - source_id: deepseek-ai-2025-r1-release
    locator: '2025-01-20 DeepSeek-R1 Release의 공개일, Technical Highlights, License Update와 API Access 절'
    relation: supports
  - source_id: deepseek-ai-2025-r1-repository
    locator: 'Official README §§2–7의 Model Summary·Model Downloads·Evaluation Results·Usage Recommendations·License와 저장소 공개 파일 범위'
    relation: supports
  - source_id: deepseek-ai-2024-v3
    locator: 'arXiv:2412.19437v1, Abstract·§§2.1–2.2의 671B/37B MoE, MLA·DeepSeekMoE 상속, auxiliary-loss-free load balancing과 MTP 경계'
    relation: contextualizes
  - source_id: shao-et-al-2024-deepseekmath
    locator: 'arXiv:2402.03300v3, §§4.1.1–4.1.3과 Eqs. 1–4의 PPO 대비 GRPO 목적함수, group-relative advantage, clipped ratio와 직접 KL'
    relation: contextualizes
related:
  - source.056
  - source.069
  - source.080
  - source.103
  - concept.rlhf
  - concept.전문가-혼합
  - concept.사고-연쇄-프롬프팅
  - concept.grpo
  - analysis.평가-지표와-모델-유인
  - analysis.사전-학습-지식은-과제에-어떻게-도착하는가
---
# DeepSeek-R1의 강화학습 파이프라인과 증류 경계

> [!note] 학습 안내
> **난이도:** 중급<br>
> **선수 지식:** [[전문가 혼합]], [[인간 피드백 강화학습]]<br>
> **읽고 나면:** DeepSeek-R1의 기여를 새 추론 architecture가 아니라 DeepSeek-V3-Base 위의 강화학습·다단계 후학습·증류로 설명하고, R1-Zero·정식 R1·증류 model의 성능과 공개 범위를 구분할 수 있다.

## 1단계 — 먼저 잡을 핵심

### R1의 중심은 새 architecture가 아니라 후학습이다

원 웹글은 DeepSeek-R1이 더 작은 규모, 개선된 attention·memory, 전용 추론 module과 curriculum learning으로 대형 model의 성능을 따라잡았다고 설명한다. 그러나 DeepSeek 공식 자료에 따르면 R1과 R1-Zero는 모두 **DeepSeek-V3-Base를 출발점으로 삼은 671B 총 parameter·37B 활성 parameter의 [[전문가 혼합|Mixture-of-Experts, MoE]] model**이다. R1 논문은 전용 추론 module이나 새로운 attention block을 제시하지 않는다.

R1의 핵심 질문은 architecture를 새로 만들었는가가 아니다. 이미 사전 학습된 대형 base model에 어떤 보상을 주면 긴 풀이, 자기 검토, 대안 탐색 같은 행동이 나타나는가, 그리고 그 행동을 작은 dense model로 얼마나 옮길 수 있는가가 핵심이다. R1-Zero는 지도 미세 조정(supervised fine-tuning, SFT) cold start 없이 base model에 강화학습(reinforcement learning, RL)을 적용했고, 정식 R1은 가독성과 일반 능력을 위해 두 번의 SFT와 두 번의 RL을 결합했다.

공식 출시는 2025년 1월 20일이고 arXiv 논문 v1은 1월 22일 제출됐다. 책 목차의 사건 표지는 2025지만 원 웹글은 2025년 9월 7일 게시된 회고문이다. 따라서 글의 architecture·효율·영향 주장을 1월의 공식 논문·release·weight 공개 범위와 따로 검증해야 한다.

### 핵심 문장

- R1-Zero의 ‘순수 RL’은 사전 학습부터 감독 자료가 없었다는 뜻이 아니다. DeepSeek-V3-Base의 **후학습을 SFT seed 없이 시작했다**는 뜻이다.
- 정식 R1은 cold-start SFT → reasoning RL → rejection sampling 기반 SFT → 모든 scenario의 RL이라는 네 단계로 구성된다.
- [[그룹 상대 정책 최적화|Group Relative Policy Optimization, GRPO]]는 별도 critic을 두지 않고 한 질문에서 뽑은 응답 group의 상대 점수로 advantage를 정규화한다.
- R1-Zero의 주된 RL 보상은 정답과 출력 형식이다. 정식 R1은 언어 일관성, 마지막 단계에서는 helpfulness·harmlessness 신호까지 추가한다.
- 완성형 R1은 작은 model이 아니다. 더 작은 model의 성과는 R1 학습 파이프라인에서 큐레이션한 약 800K sample로 Qwen·Llama 계열을 SFT한 **증류 checkpoint**의 결과다.
- MLA·DeepSeekMoE는 R1이 새로 고안한 구조가 아니라 DeepSeek-V3가 V2에서 이어받은 기반이다.
- Benchmark 우위는 metric별로 엇갈린다. Math·algorithmic coding의 강한 결과를 factual QA·software engineering·일반 추론 전체의 우위로 확대하지 않는다.

### 네 대상을 먼저 분리한다

| 대상 | 출발점 | 핵심 후학습 | 규모·공개 경계 |
| --- | --- | --- | --- |
| DeepSeek-V3-Base | 14.8T token으로 사전 학습한 MoE base | R1 계열의 공통 출발점 | 총 671B, token당 활성 37B |
| DeepSeek-R1-Zero | DeepSeek-V3-Base | SFT cold start 없이 reasoning RL | 총 671B·활성 37B; 강한 추론과 함께 가독성·언어 혼합 문제 |
| DeepSeek-R1 | DeepSeek-V3-Base | 두 SFT와 두 RL의 네 단계 | 총 671B·활성 37B; reasoning과 일반 응답·안전 선호를 함께 조정 |
| R1-Distill 6종 | Qwen2.5·Llama 3 계열 dense model | R1 학습 파이프라인에서 큐레이션한 약 800K sample로 SFT, 공개 실험에는 RL 없음 | 1.5B·7B·8B·14B·32B·70B checkpoint |

이 표에서 37B는 한 token의 forward pass에 활성화되는 parameter 수다. 전체 checkpoint의 지식 용량과 저장·배포 비용을 37B dense model과 같다고 볼 수 없으며, 671B total parameter를 지운 채 ‘작은 model’이라고 부를 수도 없다.

## 2단계 — 작동 원리

### R1-Zero는 결과를 채점하고 응답 group 안에서 비교한다

하나의 질문 $q$에 대해 이전 policy가 $G$개의 응답 $o_1,\ldots,o_G$를 생성한다고 하자. 각 응답은 정답·형식 규칙으로 reward $r_i$를 받는다. GRPO는 같은 group 안의 평균과 표준편차로 다음 advantage를 계산한다.

$$
A_i=\frac{r_i-\operatorname{mean}(r_1,\ldots,r_G)}
{\operatorname{std}(r_1,\ldots,r_G)}.
$$

절대 점수를 예측하는 별도 critic model 대신 같은 질문의 후보보다 상대적으로 나은 응답에 양의 advantage를 준다. Policy update에는 PPO 계열의 clipped ratio와 reference policy에서 너무 멀어지지 않게 하는 KL penalty가 들어간다. 이 선택은 critic이 policy와 비슷한 크기여야 할 때 드는 비용을 줄이지만, 671B base model의 대규모 RL 자체를 저비용으로 만든다는 뜻은 아니다.

R1-Zero의 accuracy reward는 수학의 boxed answer처럼 규칙으로 확인할 수 있는 결과와 code test case의 통과 여부를 사용한다. Format reward는 풀이를 `<think>`와 `</think>` 사이에 두도록 요구한다. 연구진은 large-scale RL에서 neural process·outcome reward model이 reward hacking을 일으킬 수 있고 재학습 비용도 든다는 이유로 이 단계에서 쓰지 않았다.

### 정식 R1은 네 단계를 거친다

1. **Cold-start SFT:** 사람이 읽기 쉬운 긴 [[사고 연쇄 프롬프팅|chain-of-thought, CoT]] sample 수천 건을 구성해 DeepSeek-V3-Base를 미세 조정한다. Few-shot long CoT, model 생성·검토, R1-Zero 출력 정리와 인간 후처리를 함께 사용했다.
2. **Reasoning-oriented RL:** 수학·code·science·logic처럼 답을 비교적 명확히 판정할 수 있는 과제에 R1-Zero와 같은 large-scale RL을 적용한다. Accuracy reward에 목표 언어가 CoT에서 차지하는 비율인 language-consistency reward를 더한다.
3. **Rejection sampling과 두 번째 SFT:** 수렴한 RL checkpoint에서 여러 trajectory를 생성해 맞는 응답만 남긴다. 약 600K reasoning sample과 writing·factual QA·self-cognition·translation 등 약 200K non-reasoning sample을 합쳐 약 800K로 DeepSeek-V3-Base를 두 epoch 미세 조정한다.
4. **모든 scenario의 RL:** Math·code·logic에는 rule-based reward를 유지하고, 일반 응답에는 reward model을 사용한다. Helpfulness는 최종 summary만, harmlessness는 reasoning process와 summary 전체를 평가한다.

이 흐름은 난이도를 일정에 따라 올리는 curriculum learning으로 보고되지 않았다. 서로 다른 목적의 SFT와 RL을 순차적으로 연결한 **multi-stage post-training**이다. 또한 3단계의 rejection sampling에는 일부 추가 sample을 판정하기 위해 DeepSeek-V3를 generative reward model로 사용하므로, ‘R1 전체가 neural reward model을 전혀 쓰지 않았다’고 일반화해서도 안 된다.

### 증류는 architecture가 아니라 출력 자료를 옮긴다

연구진은 R1 학습 파이프라인에서 큐레이션한 약 800K sample로 Qwen2.5-Math-1.5B·7B, Qwen2.5-14B·32B, Llama-3.1-8B, Llama-3.3-70B-Instruct를 SFT했다. 이 공개 증류 실험은 R1의 671B MoE block이나 MLA를 작은 model에 이식하지 않는다. 큰 teacher의 reasoning trajectory와 함께 선별된 일반 과제 답변 분포를 각 dense base model의 parameter에 학습한다.

같은 Qwen-32B 계열에서 10K step이 넘는 직접 RL을 수행한 R1-Zero-Qwen-32B보다 R1-Distill-Qwen-32B가 Table 6의 모든 보고 지표에서 높았다. 논문이 보이는 효율 경계는 ‘R1 자체가 작다’가 아니라 **강한 대형 teacher가 찾은 행동을 작은 model에 증류하는 편이 작은 base에서 다시 대규모 RL로 발견하는 것보다 효과적이었다**는 데 있다.

## 3단계 — 기술과 근거

### GRPO의 목적함수와 reward 경계를 읽는다

응답 $o_i$의 $t$번째 token에서 새 정책과 rollout 정책의 확률비를 $\rho_{i,t}=\pi_\theta(o_{i,t}\mid q,o_{i,<t})/\pi_{\theta_{old}}(o_{i,t}\mid q,o_{i,<t})$라고 하자. Completion-level advantage $A_i$를 token마다 공유할 때 R1 논문의 GRPO 목적은 다음처럼 쓸 수 있다.

$$
J_{\mathrm{GRPO}}(\theta)=
\mathbb{E}\left[
\frac{1}{G}\sum_{i=1}^{G}
\frac{1}{|o_i|}\sum_{t=1}^{|o_i|}\left(
\min\!\left(\rho_{i,t}A_i,\operatorname{clip}(\rho_{i,t},1-\epsilon,1+\epsilon)A_i\right)
-\beta D_{\mathrm{KL},i,t}
\right)
\right].
$$

$\epsilon$은 한 번의 update가 너무 커지지 않게 하는 clipping 범위이고, $\beta$는 reference policy에서 벗어나는 정도에 부여하는 penalty의 세기다. Group-relative advantage는 응답 group 안의 순위를 학습 신호로 바꾸지만, completion reward 하나를 모든 token에 공유하므로 어느 단계가 성공을 만들었는지는 식별하지 않는다. 모든 후보의 reward가 같아 표준편차가 0이면 구현의 수치 안정화 장치는 오류만 막을 뿐 비교 신호를 만들지 못한다. 정답과 형식을 만족하는 우회 전략도 높은 reward를 받을 수 있으므로 [[자동 평가 지표는 무엇을 보상하는가|평가 지표와 model 유인]]을 함께 봐야 한다.

| 단계 | 주된 reward·선별 신호 | 직접 보장하지 않는 것 |
| --- | --- | --- |
| R1-Zero RL | 정답 규칙·code test, `<think>` 형식 | 중간 풀이의 모든 단계가 타당함, 자연스러운 문체 |
| R1 reasoning RL | Accuracy + language consistency | 다국어 전반의 품질, general capability |
| Rejection sampling | Rule check, 일부 DeepSeek-V3 판정, correct response 보존 | 미공개 judge의 완전한 신뢰성, 표본 편향 제거 |
| Final all-scenario RL | Reasoning rule reward + helpfulness·harmlessness reward model | 모든 상황의 안전, factuality, tool use와 structured output |

GRPO 자체도 R1에서 처음 제시된 알고리즘이 아니다. DeepSeekMath가 2024년에 critic을 생략하고 group score로 advantage를 추정하는 방법을 먼저 기술했고, R1은 이를 671B V3-Base의 reasoning RL에 적용했다.

### Architecture와 후학습의 경계를 지킨다

DeepSeek-V3는 Transformer framework 안에서 Multi-head Latent Attention(MLA)과 DeepSeekMoE를 사용한다. MLA의 핵심은 key·value를 low-rank latent vector로 공동 압축해 inference의 KV cache를 줄이는 것이다. 이는 memory **사용량**을 줄이는 attention 설계이지, 장기 reasoning state를 저장·조회하는 별도 memory module이 아니다.

DeepSeekMoE는 fine-grained routed expert와 shared expert를 사용하며, V3는 auxiliary-loss-free load balancing과 multi-token prediction(MTP) objective를 더했다. 그러나 MLA와 DeepSeekMoE는 V3가 V2에서 이어받았고, R1 논문은 이 architecture를 reasoning 전용 block으로 바꾸었다고 보고하지 않는다. 원 웹글이 주장한 improved attention·specialized reasoning module·memory mechanism을 R1의 고유 발명으로 기록하면 V2·V3 architecture와 R1 post-training을 혼동하게 된다.

| 원 웹글의 표현 | 1차 자료에서 확인되는 대응물 | 올바른 범위 |
| --- | --- | --- |
| Improved attention | V3-Base의 MLA | KV-cache·activation memory 효율; R1 고유 발명 아님 |
| Improved memory mechanism | MLA의 compressed KV cache | 외부·persistent reasoning memory가 아님 |
| Specialized reasoning module | 확인되는 별도 module 없음 | V3-Base 전체 policy를 RL·SFT로 후학습 |
| Curriculum learning | 확인되는 난이도 curriculum 없음 | 두 SFT·두 RL의 multi-stage pipeline |
| Specialized loss | GRPO objective와 단계별 reward | 전용 논리 일관성 loss가 아님 |
| Modest model scale | R1은 671B total·37B active | 작은 model 성과는 1.5B–70B distill checkpoint에 한정 |

### 성능은 sampling 조건과 비교 상대를 붙여 읽는다

R1 평가는 model 출력을 최대 32,768 token으로 제한했다. Sampling이 필요한 benchmark에는 temperature 0.6, top-$p$ 0.95를 사용하고 test set 크기에 따라 보통 질문당 4–64개 응답으로 pass@1을 추정했다. AIME 2024의 consensus는 64개 응답의 majority vote인 cons@64다. OpenAI-o1-1217은 중국 본토에서 API 접근이 어려워 DeepSeek이 직접 같은 harness로 실행하지 않고 OpenAI 공식 보고 수치를 가져왔다.

| Benchmark | Metric | DeepSeek-R1 | OpenAI-o1-1217 | 해석 경계 |
| --- | --- | ---: | ---: | --- |
| AIME 2024 | pass@1 | 79.8 | 79.2 | R1이 근소하게 높음 |
| MATH-500 | pass@1 | 97.3 | 96.4 | R1이 근소하게 높음 |
| LiveCodeBench | pass@1-CoT | 65.9 | 63.4 | Algorithmic coding에서 R1이 높음 |
| SWE-bench Verified | resolved | 49.2 | 48.9 | 사실상 비슷한 수준 |
| GPQA Diamond | pass@1 | 71.5 | 75.7 | o1-1217이 높음 |
| MMLU | pass@1 | 90.8 | 91.8 | o1-1217이 높음 |
| Codeforces | rating | 2029 | 2061 | o1-1217이 높음 |
| Aider-Polyglot | accuracy | 53.3 | 61.7 | Engineering coding에서 o1-1217이 높음 |
| SimpleQA | correct | 30.1 | 47.0 | Factual QA에서 o1-1217이 크게 높음 |

따라서 ‘OpenAI-o1과 동등하다’는 말은 math·code·reasoning의 일부 보고 과제를 묶은 요약이다. 모든 benchmark나 사용 scenario에서 같다는 뜻이 아니다. Open-ended 평가에서 AlpacaEval 2.0은 length-controlled win rate를 사용했고 Arena-Hard는 GPT-4-1106을 judge로 사용했다. 이 자동 judge 조건과, 마지막 all-scenario RL에서 helpfulness reward가 최종 summary만 평가한 조건은 서로 분리해 기록해야 한다.

### 작은 model의 결과는 distillation row에서 확인한다

R1-Distill-Qwen-32B는 o1-mini와 비교해 AIME 72.6 대 63.6, MATH-500 94.3 대 90.0, GPQA Diamond 62.1 대 60.0, LiveCodeBench 57.2 대 53.8로 높았다. 반면 Codeforces rating은 1691 대 1820으로 낮았다. R1-Distill-Qwen-14B는 논문 v1 Table 5의 보고 지표에서 QwQ-32B-Preview를 모두 앞섰다.

이 결과는 distillation의 유용성을 지지하지만 o1 계열의 parameter 수는 공개되지 않았으므로 ‘훨씬 큰 model을 더 작은 R1이 이겼다’는 parameter 비교를 만들 수 없다. 또한 benchmark 결과만으로 edge·mobile latency, memory footprint, energy와 production reliability를 입증하지 않는다.

### 공개는 weight 접근과 재현 가능성을 분리한다

DeepSeek은 R1-Zero, R1과 여섯 distill checkpoint를 공개했고, release 당일 web·API에서 `deepseek-reasoner`를 제공했다. 공식 README는 code repository와 model weight를 MIT License로 배포하며 상업 이용·수정·파생·다른 LLM의 distillation을 허용한다고 설명한다. 다만 Qwen 기반 distill은 원 base의 Apache 2.0, Llama 기반 distill은 각 Llama 3.1·3.3 license 조건도 확인해야 한다.

Weight 공개가 전체 연구의 재현을 뜻하지는 않는다. 공식 R1 저장소 루트에는 README·paper PDF·license·figure가 있고, 약 800K curated dataset과 R1 post-training 구현·완전한 compute budget은 제공되지 않는다. V3 보고서의 pretraining GPU-hour 수치를 R1 후학습 비용으로 옮겨 적어도 안 된다.

## 검증과 한계

### 원 웹글의 주요 정정

- **R1은 hardware constraint 때문에 parameter 수를 제한한 작은 model이다:** 공식 R1은 총 671B·활성 37B의 대형 MoE다. Hardware 제약이 parameter 수를 제한했다는 설명도 공식 자료에 없다.
- **Architecture innovation이 massive scale을 대신했다:** R1은 massive V3-Base를 사용한다. 새로 검증된 중심은 architecture 교체가 아니라 large-scale RL과 multi-stage post-training이다.
- **R1이 improved attention을 개발했다:** MLA는 V2에서 도입돼 V3-Base에 상속된 구조다. R1의 reasoning 향상을 MLA 변화로 분리한 ablation도 제시되지 않았다.
- **Specialized reasoning module과 memory mechanism을 넣었다:** 공식 paper에는 별도 추론 module이나 persistent memory가 없다. MLA의 KV-cache 압축을 semantic memory와 혼동하지 않는다.
- **Curriculum learning으로 과제 난도를 점차 올렸다:** 보고된 것은 네 단계 후학습이며 난이도 순 curriculum이 아니다.
- **Specialized loss가 논리 일관성을 직접 최적화했다:** GRPO objective와 accuracy·format·language-consistency reward가 확인된다. 중간 reasoning의 논리적 진실성을 직접 채점하는 loss는 보고되지 않았다.
- **R1이 더 적은 parameter와 modest compute로 대형 model을 이겼다:** 완성형 R1은 작지 않고 post-training 총 compute도 공개되지 않았다. Economical하다는 직접 결과는 작은 base에서 RL을 재수행하기보다 R1 output을 증류한 실험에 한정된다.
- **R1은 edge·mobile 배포에 적합하다:** 기기별 memory·latency·energy 평가가 없다. 1.5B distill checkpoint가 존재한다는 사실과 실제 edge 적합성은 다른 주장이다.
- **R1의 attention·memory·module이 vision과 multimodal model로 확산됐다:** R1 공식 paper·repository는 text 기반 reasoning 결과를 다루며 이 계보를 제시하지 않는다. 후속 vision·multimodal 1차 자료가 없으면 삭제한다.
- **많은 후속 model이 R1 architecture를 계승했다:** R1 고유 architecture라는 전제가 틀렸다. 후속 영향은 각 연구가 GRPO·reasoning data·distillation을 직접 계승했다고 밝힌 자료로 따로 검증해야 한다.
- **Benchmark에서 더 큰 model을 전반적으로 능가했다:** R1과 o1-1217의 결과는 metric마다 엇갈리고, closed model의 parameter 수는 공개되지 않았다.
- **완전한 open source라 누구나 같은 model을 훈련할 수 있다:** Weight·paper·API·license 공개는 강하지만 training data와 post-training code가 없어 결과 전체의 재현과는 차이가 있다.

### 공식 자료가 밝힌 실제 한계

정식 R1은 function calling, multi-turn interaction, complex role-playing과 JSON output에서 DeepSeek-V3보다 부족하다고 보고됐다. 중국어·영어에 맞춘 최적화 때문에 다른 언어 query에서 영어 reasoning·response가 섞일 수 있고, few-shot prompt가 성능을 일관되게 낮추는 prompt sensitivity도 있다.

Software engineering task는 평가 시간이 길어 large-scale RL을 충분히 적용하지 못했다. 그 결과 SWE-bench Verified에서는 V3 대비 개선이 제한됐고 Aider에서는 o1-1217보다 낮았다. R1-Zero는 poor readability와 language mixing이 문제였으며, 공식 사용 권고도 반복·비일관 출력을 줄이기 위해 temperature 0.5–0.7과 여러 번의 평가 평균을 권한다. 일부 query에서는 model이 `<think>` pattern을 건너뛰어 성능이 저하될 수 있다.

Safety RL은 C-SimpleQA에서 일부 query의 answer refusal을 늘려 점수를 낮췄다. 이는 harmlessness reward를 더하면 모든 평가가 동시에 좋아진다는 단순한 서사를 반박한다. 작은 Qwen-32B에 직접 large-scale RL을 적용한 실험도 막대한 compute를 요구하면서 distillation보다 낮았으므로, scale과 strong teacher의 역할은 사라지지 않는다.

### 확인할 수 없는 영향과 적용 범위

원 웹글의 democratization 주장은 weight와 여섯 distill model의 공개라는 좁은 범위에서는 의미가 있다. 그러나 671B 본체를 제한된 자원에서 훈련·serving할 수 있다는 뜻으로 확대할 수 없다. 실제 접근성은 사용할 checkpoint, quantization, hardware, context length, latency와 품질 목표를 함께 측정해야 한다.

이 문서는 2025년 1월 공개된 R1 v1의 학습·평가·공개 경계를 다룬다. 이후 checkpoint update, 후속 reasoning model이나 vision·multimodal adaptation의 계보를 자동으로 R1 v1의 성과에 포함하지 않는다. 특히 ‘후속 model 다수에 영향’은 인용 수나 유사한 용어만으로 확인하지 않고 각 후속 1차 자료의 명시적 방법 계승을 요구한다.

## 학습 확인

### 확인 질문

1. DeepSeek-R1의 핵심 기여를 새 architecture보다 후학습 파이프라인으로 설명해야 하는 이유는 무엇인가?
2. R1-Zero와 정식 R1의 학습 신호·단계·출력 품질은 어떻게 다른가?
3. Distill model의 강한 benchmark 결과가 R1 본체의 작은 규모나 edge·mobile 적합성을 증명하지 않는 이유는 무엇인가?

### 다음 문서

- [[그룹 상대 정책 최적화]] — 같은 질문의 응답 group에서 advantage를 만드는 GRPO 목적함수와 PPO 계열 clipping을 개념 단위로 살핀다.
- [[자동 평가 지표는 무엇을 보상하는가]] — 정답·형식·judge reward가 model 행동을 어떻게 바꾸며 무엇을 놓칠 수 있는지 비교한다.

## 출처

- 원 웹글: Michael Brenndoerfer, [*DeepSeek R1: Architectural Innovation in Reasoning Models*](https://mbrenndoerfer.com/writing/deepseek-r1-architectural-innovation-reasoning-models), 2025-09-07 게시, ‘2025: DeepSeek R1’부터 ‘Legacy and Looking Forward’까지.
- DeepSeek-AI, [*DeepSeek-R1 Release*](https://api-docs.deepseek.com/news/news250120/), 2025-01-20, Technical Highlights·License Update·API Access.
- DeepSeek-AI, [*DeepSeek-R1: Incentivizing Reasoning Capability in LLMs via Reinforcement Learning*](https://arxiv.org/abs/2501.12948v1), arXiv:2501.12948v1, 2025-01-22, §§1.1–5와 Tables 1–6.
- DeepSeek-AI, [*DeepSeek-R1 official repository and model releases*](https://github.com/deepseek-ai/DeepSeek-R1), README §§2–7과 repository file listing.
- DeepSeek-AI, [*DeepSeek-V3 Technical Report*](https://arxiv.org/abs/2412.19437v1), arXiv:2412.19437v1, 2024, Abstract·§§2.1–2.2.
- Zhihong Shao 외, [*DeepSeekMath: Pushing the Limits of Mathematical Reasoning in Open Language Models*](https://arxiv.org/abs/2402.03300v3), arXiv:2402.03300v3, 2024, §§4.1.1–4.1.3과 Eqs. 1–4.
- 프로젝트 보존 자료: `raw/106_DeepSeek R1 Architectural Innovation in Reasoning Models.ko.md`, `raw/106_DeepSeek R1 Architectural Innovation in Reasoning Models.commentary.ko.md`.

## 관련 항목

- [[056_RLHF 토대와 인간 선호 기반 보상 학습]]
- [[069_전문가 혼합과 희소 활성 스케일링]]
- [[080_사고 연쇄 프롬프팅과 추론 행동 유도]]
- [[103_GLaM에서 Mixtral까지의 희소 MoE 확장]]
- [[인간 피드백 강화학습]]
- [[전문가 혼합]]
- [[사고 연쇄 프롬프팅]]
- [[그룹 상대 정책 최적화]]
- [[자동 평가 지표는 무엇을 보상하는가]]
- [[사전 학습 지식은 과제에 어떻게 도착하는가]]
