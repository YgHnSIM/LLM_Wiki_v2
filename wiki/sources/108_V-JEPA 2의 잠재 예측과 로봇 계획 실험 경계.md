---
schema_version: 2
id: source.108
page_type: source
title: V-JEPA 2의 잠재 예측과 로봇 계획 실험 경계
aliases:
  - 108_V-JEPA 2 Vision-Based World Modeling for Embodied AI
  - V-JEPA 2 Vision-Based World Modeling for Embodied AI
  - V-JEPA 2
  - V-JEPA 2-AC
tags:
  - type/source
  - domain/ai
  - domain/computer-science
  - domain/computer-vision
  - domain/machine-learning
created: '2026-07-22'
updated: '2026-07-22'
lifecycle: active
verification: verified
artifacts:
  - 'raw/108_V-JEPA 2 Vision-Based World Modeling for Embodied AI.ko.md'
  - 'raw/108_V-JEPA 2 Vision-Based World Modeling for Embodied AI.commentary.ko.md'
evidence:
  - source_id: assran-et-al-2025-vjepa2
    locator: 'arXiv:2506.09985v1, Abstract·§§1–7·9·10.1–10.3·11.4와 Tables 1–12: V-JEPA 2의 마스크드 잠재 예측, VM22M·모델 규모, V-JEPA 2-AC 후학습·계획, 평가 protocol·결과·한계'
    relation: supports
  - source_id: meta-ai-2025-vjepa2-release
    locator: '2025-06-11 Takeaways·How V-JEPA 2 works·robot planning·New benchmarks·Next steps: 발표일, 두 단계 학습, 공개 artifact와 IntPhys 2·MVPBench·CausalVQA'
    relation: supports
  - source_id: meta-ai-2025-vjepa2-repository
    locator: 'Official README의 2025-06-25 release 기록, V-JEPA 2 Pre-training·V-JEPA 2-AC Post-training·Models·Evaluation Attentive Probes·License 절'
    relation: supports
  - source_id: meta-ai-2025-vjepa2-model-card
    locator: 'V-JEPA 2 ViT-g/16 384 model card의 Intended Uses·입력 sampling·checkpoint license와 config'
    relation: supplements
related:
  - source.070
  - source.093
  - source.105
  - concept.clip
  - concept.학습된-세계-모델
  - concept.멀티모달-대규모-언어-모델
  - concept.transformer
  - analysis.사전-학습-지식은-과제에-어떻게-도착하는가
  - analysis.평가-지표와-모델-유인
---
# V-JEPA 2의 잠재 예측과 로봇 계획 실험 경계

> [!note] 학습 안내
> **난이도:** 중급<br>
> **선수 지식:** [[Transformer]], [[CLIP]], [[멀티모달 대규모 언어 모델]]<br>
> **읽고 나면:** V-JEPA 2의 action-free 마스크드 잠재 예측, V-JEPA 2-AC의 action-conditioned 후학습과 image-goal 계획을 구분하고, video·VidQA·robot benchmark 수치를 protocol과 함께 해석하며 ‘물리 세계 이해’라는 표현의 실험 범위를 설명할 수 있다.

## 1단계 — 먼저 잡을 핵심

### 발표는 2025년 6월이고 웹글은 9월의 회고다

원 웹글은 Meta가 V-JEPA 2를 2025년 4월 공개했다고 쓰지만, 공식 발표와 arXiv v1 제출일은 **2025년 6월 11일**이다. 공식 GitHub README는 V-JEPA 2 release를 6월 25일로 기록한다. 원 웹글은 그보다 뒤인 2025년 9월 1일 게시된 회고이므로 발표일·구조·실험 결과를 1차 자료로 다시 고정해야 한다.

가장 중요한 구분은 ‘V-JEPA 2’라는 이름 아래 서로 다른 세 체계가 등장한다는 점이다. Action 없이 internet video의 가려진 부분을 잠재 표현 공간에서 예측한 **V-JEPA 2 사전학습 model**, robot action·end-effector state를 추가해 미래 표현을 예측하도록 후학습한 **V-JEPA 2-AC**, 그리고 V-JEPA 2 vision encoder를 language model과 정렬한 **video QA 체계**는 학습 data·목적·출력·검증 protocol이 다르다.

| 대상 | 학습 입력과 목적 | 공개 평가에서 하는 일 | 분리해야 할 경계 |
| --- | --- | --- | --- |
| V-JEPA 2 | 22M image·video sample, action 없음, 가린 video tubelet의 EMA teacher 표현을 L1로 예측 | Frozen encoder 위 probe로 action·object 분류와 1초 뒤 action anticipation | Robot action을 직접 조건으로 받지 않음 |
| V-JEPA 2-AC | Frozen V-JEPA 2 encoder + 62시간 미만 DROID video·action·end-effector state | Image goal을 향해 CEM 기반 model-predictive control | 별도 300M action-conditioned predictor와 robot data가 필요 |
| V-JEPA 2–LLM | Visual token을 projector로 Qwen2 또는 Llama 3.1 input에 연결하고 18M 또는 88.5M image·video-text pair로 정렬 | Open-language video question answering | Language 능력은 action-free V-JEPA 2 checkpoint 단독의 출력이 아님 |

### 핵심 문장

- V-JEPA 2 사전학습은 raw pixel의 다음 frame 생성이 아니라 **가려진 video patch의 잠재 표현 예측**이다. Action-conditioned 미래 rollout은 별도 V-JEPA 2-AC 후학습 단계다.
- 원 웹글이 말하는 ‘contrastive learning’과 정답·오답 future pair의 밀기·당기기는 공식 목적함수와 다르다. V-JEPA 2는 EMA teacher target과의 **L1 회귀**를 사용하며 negative pair를 요구하지 않는다.
- ‘Zero-shot robot planning’은 robot data가 0이라는 뜻이 아니다. V-JEPA 2-AC는 DROID의 23K trajectory, 62시간 미만 video·control signal로 학습했고, deployment한 두 lab의 robot·환경 data와 task-specific reward를 쓰지 않았다는 뜻이다.
- Robot 결과는 두 lab의 Franka arm, 고정 monocular RGB camera, reach·grasp·reach-with-object·pick-and-place와 object 두 종류, cell당 10회 trial이라는 범위 안에서 읽어야 한다.
- SSv2·EK100·VidQA·robot success rate는 각각 frozen probe, language alignment, closed-loop control이라는 서로 다른 평가다. 이를 하나의 ‘물리학·인과 이해 점수’로 합칠 수 없다.
- Autonomous vehicle·augmented reality·navigation의 안전·성능 개선은 이 연구에서 시험하지 않았다.

## 2단계 — 작동 원리

### Action-free 사전학습은 가려진 표현을 복원한다

Video clip $x$를 space-time tubelet으로 나누고 일부 위치 $M$을 가린다. Online encoder $E_\theta$는 보이는 token만 처리하고 predictor $P_\phi$는 mask token의 위치 정보를 받아 가려진 위치의 표현을 예측한다. Target은 별도 label이 아니라 online encoder weight의 exponential moving average로 갱신되는 teacher $E_{\bar\theta}$가 만든 표현이다.

$$
\mathcal{L}_{\text{V-JEPA 2}}
=\frac{1}{|M|}\sum_{i\in M}
\left\|
P_\phi(E_\theta(x_{\setminus M}),M)_i
-\operatorname{sg}(E_{\bar\theta}(x)_i)
\right\|_1
$$

$\operatorname{sg}$는 target 쪽 gradient를 막고, $\bar\theta$는 $\theta$의 EMA로 갱신된다. 이 objective는 pixel을 정확히 재구성하는 대신 teacher가 보존한 예측 가능한 표현에 맞춘다. 또한 negative sample을 분모에 두는 [[CLIP]]식 contrastive loss가 아니다. 원 웹글의 ‘맞는 future는 가깝게, 틀린 future는 멀게’라는 설명은 공식 objective를 바꾼다.

사전학습 mask는 반드시 ‘현재에서 미래만 가리기’가 아니다. Space-time multiblock mask로 clip 안의 tubelet을 버리고 그 표현을 복원한다. 그래서 사전학습 model이 action의 인과 효과를 직접 학습했다고 말할 수 없다. 논문도 이 경계를 명시하고 action-conditioned planning을 위해 다음 단계를 추가한다.

### ViT·3D-RoPE와 progressive resolution

Encoder와 predictor는 [[Transformer|Vision Transformer]]다. Input은 2-frame tubelet과 $16\times16$ spatial patch로 token화되고, 시간·높이·너비 축에 나눈 3D rotary position embedding을 사용한다. Encoder family는 ViT-L 300M, ViT-H 600M, ViT-g 1B parameter이고, 사전학습 predictor는 모든 규모에서 22M ViT-S로 고정된다.

Meta 발표문은 V-JEPA 2를 ‘1.2B parameter model’로 요약하지만 논문 표는 평가 backbone을 최대 1B encoder, 사전학습 predictor를 22M으로 나눠 보고한다. V-JEPA 2-AC에는 다시 별도의 300M predictor가 붙는다. 어느 component를 더한 수인지 밝히지 않은 채 1.2B·1B·300M을 같은 model 규모로 비교하면 안 된다.

훈련은 처음 16 frame·4 fps·256 crop에서 진행한 뒤 cooldown에서 64 frame과 256·384·512 crop으로 늘린다. 64 frame at 4 fps는 약 16초 context다. 논문이 말하는 ‘미래 예측’과 ‘16초’는 무제한 시간 horizon이나 continuous physical simulator를 뜻하지 않는다.

V-JEPA 2가 직접 pixel video를 생성하지 않는다는 점도 중요하다. 논문의 human-readable rollout figure는 DROID에서 별도로 MSE로 학습한 feed-forward frame decoder를 해석 도구로 적용한 결과다. 그 decoder는 V-JEPA 2 사전학습 objective나 robot planner의 필수 출력 head가 아니다.

### V-JEPA 2-AC는 action을 넣은 별도 predictor다

V-JEPA 2-AC는 V-JEPA 2 video encoder를 **동결**하고 그 위에 300M parameter, 24-layer, 16-head, hidden width 1024의 block-causal Transformer predictor를 학습한다. Input은 이전 video-frame 표현, 7차원 end-effector state와 control action이다. 여기서 7차원은 위치 3, orientation 3, gripper state 1이다.

Predictor는 teacher-forcing next-step loss와 짧은 autoregressive rollout loss를 함께 최적화한다. Planning 때는 후보 action sequence로 예상한 latent future와 goal image의 latent representation 사이 L1 거리를 energy로 삼는다.

$$
a_{t:t+H-1}^{*}
=\arg\min_{a_{t:t+H-1}}
\left\|
\widehat z_{t+H}(z_t,a_{t:t+H-1})-z_{\text{goal}}
\right\|_1
$$

이 최적화는 cross-entropy method(CEM)로 근사한다. 한 번에 계획한 sequence의 첫 action만 실행하고 새 camera frame을 받은 뒤 다시 계획하는 receding-horizon control이다. 따라서 [[학습된 세계 모델|‘world model’]]은 정적인 scene embedding만이 아니라 action에 따른 latent transition을 제공하지만, 이 능력은 V-JEPA 2-AC와 DROID 후학습에 속한다.

### Image goal은 자연어 명령도 자율 task 분해도 아니다

Reach·grasp·reach-with-object에는 사람이 준비한 goal image 하나를 준다. Pick-and-place에는 grasp, goal 근처, 최종 배치 상태를 나타내는 두 subgoal image와 최종 goal을 주고 4·10·4 time step 뒤에 고정 schedule로 전환한다. Model이 자연어 goal을 해석하거나 긴 task를 스스로 subgoal로 분해한 실험은 아니다.

## 3단계 — 기술과 근거

### VM22M은 image·video 22M sample의 혼합이다

| 자료 | Sample | 보고된 video 시간 | 훈련 sampling weight |
| --- | ---: | ---: | ---: |
| Something-Something v2 | 168K | 168시간 | 0.056 |
| Kinetics 400·600·700 | 733K | 614시간 | 0.188 |
| HowTo100M | 1.1M | 134K시간 | 0.318 |
| YT-Temporal-1B | 19M | 1.6M시간 | 0.188 |
| ImageNet | 1M image | 해당 없음 | 0.250 |

Meta 발표는 이를 ‘1M시간이 넘는 video와 1M image’로 요약하고, 논문은 혼합 전체를 VM22M이라고 부른다. Image는 같은 frame을 시간축으로 복제해 16-frame video처럼 처리한다. YT-Temporal-1B에는 retrieval 기반 curation을 적용했고 target validation video가 초기 pool에 들어가지 않도록 확인했다고 보고한다.

그러나 공개 dataset 이름과 sampling weight가 모든 원본 media의 영구 접근성·license·개인정보 상태를 자동으로 보장하지는 않는다. 또한 target distribution에 Kinetics 계열 weight가 강하게 반영됐으므로 광범위한 실제 환경의 균등 표본으로 간주할 수 없다.

### Video probe 결과는 frozen representation 평가다

최대 ViT-g/16 384 model의 대표 결과는 다음과 같다.

| 평가 | 수치 | Protocol 경계 |
| --- | ---: | --- |
| Something-Something v2 | 77.3 top-1 | Frozen encoder 위 4-layer attentive probe, 더 긴·고해상도 input |
| Diving48 | 90.2 top-1 | 같은 probe 계열의 동작 분류 |
| EPIC-KITCHENS-100 | 39.7 mean-class recall@5 | Frozen encoder·predictor 위 probe, 1초 뒤 verb+noun action anticipation |
| ImageNet | 85.1 top-1 | Frozen representation의 object classification |

이 수치는 사전학습 checkpoint가 유용한 motion·appearance feature를 담았다는 증거다. 그러나 학습된 probe가 있으므로 ‘완전한 zero-shot 분류’가 아니고, SSv2·Diving48 label을 모르는 상태에서 자유롭게 물리 법칙을 설명한 결과도 아니다. Paper 자체도 baseline encoder의 pretraining data가 달라 직접 비교가 완전히 통제되지 않았다고 적는다.

EK100은 45개 kitchen의 100시간 egocentric video, 97 verb·300 noun과 3,568개의 고정 action label로 구성된다. 39.7은 미래 frame 생성 정확도가 아니라 validation set의 **mean-class recall@5**다. 논문은 1초보다 먼 horizon에서 정확도가 감소하며, kitchen 밖·unseen action category로의 일반화를 알 수 없다고 명시한다.

### Video QA는 language model과 대규모 정렬 data를 더한 결과다

V-JEPA 2 encoder 단독에는 open-language answer decoder가 없다. Frozen encoder 비교는 Qwen2-7B-Instruct와 18M aligned sample을 공통으로 사용했다. 가장 큰 reported system은 ViT-g/16 384 encoder를 Llama 3.1 8B와 MLP projector로 잇고 88.5M image·video-text pair로 정렬했다.

그 system은 PerceptionTest 84.0, MVP paired accuracy 44.5, TempCompass 76.9, TemporalBench 36.7, TOMATO 40.3을 보고했다. PerceptionTest는 test SFT를 거쳤고, 나머지는 zero-shot이라는 조건도 다르다. TVBench 60.6과 MVBench 73.5에서는 비교 대상 PerceptionLM 8B보다 낮았다. 따라서 ‘언어 감독 없이 사전학습한 video encoder도 충분한 후속 정렬을 거치면 강한 VidQA component가 될 수 있다’가 적절한 결론이며, V-JEPA 2 자체가 language semantics를 이미 생성한다는 뜻은 아니다.

### Robot 결과의 분모와 환경을 붙인다

V-JEPA 2-AC 후학습은 DROID의 약 23K trajectory 가운데 4초 미만 clip을 버린 **62시간 미만** 자료를 사용했다. ‘Unlabeled’는 action이나 proprioception이 없다는 뜻이 아니라 task name·reward·성공 여부 label을 사용하지 않았다는 뜻이다. Deployment 조건은 다음과 같다.

- DROID에 나오지 않는 두 lab의 Franka Emika Panda arm과 RobotiQ gripper
- 고정됐지만 calibration하지 않은 low-resolution monocular RGB camera
- 같은 model weight·inference code, 비슷한 operational-space low-level controller
- Goal image 기반 closed-loop planning; task·object·시작 위치를 바꾼 cell당 10회 trial

논문 Table 2의 두 lab 평균 성공률은 다음과 같다.

| Method | Reach | Grasp cup | Grasp box | Reach w/ cup | Reach w/ box | Pick-place cup | Pick-place box |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Octo | 100% | 15% | 0% | 15% | 70% | 15% | 10% |
| V-JEPA 2-AC | 100% | 65% | 25% | 75% | 75% | 80% | 65% |

Cosmos와 직접 비교한 Lab 2 Table 3에서는 RTX 4090 한 장에서 Cosmos가 action당 4분, V-JEPA 2-AC가 16초를 썼다. 이때 CEM sample 수는 각각 80과 800이고 refinement 10회·horizon 1이다. V-JEPA 2-AC는 reach 100%, grasp cup 60%·box 20%, pick-and-place cup 80%·box 50%를 기록했다. 16초도 real-time control이라고 부르기 어렵고, sample 수·model objective가 다른 비교이므로 latent prediction이 모든 compute 조건에서 generative world model보다 항상 빠르다는 보편 결론은 아니다.

### 공개 artifact는 재현 범위를 넓히지만 같지는 않다

공식 repository는 pretraining·cooldown·V-JEPA 2-AC post-training code와 config, ViT-L 300M·ViT-H 600M·ViT-g 1B의 256·384 checkpoint, SSv2·Diving48·EK100 attentive probe, V-JEPA 2-AC checkpoint와 energy-landscape notebook을 제공한다. Repository 대부분은 MIT이고 세 utility file은 Apache 2.0이다. Hugging Face의 ViT-g/16 384 checkpoint model card는 Apache 2.0으로 표시되며, intended use를 video·image representation, classification·retrieval, VLM용 video encoder로 한정해 설명한다.

Meta 발표는 같은 날 IntPhys 2, Minimal Video Pairs(MVPBench), CausalVQA라는 물리 추론 benchmark도 공개했다. IntPhys 2의 물리 위반 탐지는 human이 거의 완벽한 반면 당시 video model은 chance 부근이라고 Meta가 보고했고, CausalVQA에서도 counterfactual·anticipation·planning 질문에 큰 human gap이 남았다고 밝혔다. 이 공개 결과는 V-JEPA 2의 강한 task 점수와 ‘물리 이해가 해결됐다’는 주장을 구분하게 한다.

## 검증과 한계

### 원 웹글의 주요 정정

- **Meta가 2025년 4월 V-JEPA 2를 공개했다:** 공식 발표와 arXiv v1은 2025-06-11이고, 공식 repository README는 release를 2025-06-25로 기록한다. 원 웹글은 2025-09-01의 후대 회고다.
- **V-JEPA 2는 현재 frame에서 미래 state를 직접 예측하도록 사전학습됐다:** Action-free 사전학습은 clip의 가려진 space-time tubelet 표현을 복원한다. Action-conditioned future rollout은 별도 V-JEPA 2-AC다.
- **Contrastive learning으로 맞는 future는 당기고 틀린 future는 민다:** 공식 objective는 EMA teacher target과의 L1 회귀다. Negative pair 기반 contrastive loss가 아니다.
- **V-JEPA 2 하나가 observation·action·language를 모두 처리한다:** Base pretraining, 300M AC predictor, LLM-aligned VidQA system을 분리해야 한다.
- **Video만 보고 명시적 물리·인과 법칙을 배웠다:** Probe·anticipation·robot planning 결과는 task 성능을 보여 주지만 명시적 법칙, intervention 기반 causal identification이나 counterfactual generalization을 직접 검증하지 않는다.
- **LLM은 구체적 장면의 물리 결과를 예측할 수 없고 V-JEPA 2는 할 수 있다:** 같은 input·output·parameter·data 조건에서 text-only LLM과 V-JEPA 2를 비교한 실험이 아니다. V-JEPA 2의 VidQA 결과에도 LLM과 88.5M aligned sample이 필요했다.
- **Robot이 navigation과 광범위한 manipulation을 해결했다:** 실험은 고정 camera의 tabletop Franka arm에서 reach·grasp·reach-with-object·pick-and-place를 다뤘고 locomotion·navigation은 다루지 않았다.
- **Zero-shot은 robot interaction data가 없다는 뜻이다:** 62시간 미만 DROID robot trajectory로 V-JEPA 2-AC를 후학습했다. Zero-shot 경계는 deployment lab·robot data와 task-specific training·reward가 없다는 것이다.
- **Autonomous vehicle의 예측·안전과 AR 정합을 개선했다:** 이 연구에는 vehicle·driving·AR benchmark나 field deployment가 없다. 가능한 application을 검증된 효과로 바꿀 수 없다.
- **Visual learning이 language learning만큼 강하고 text가 주지 못하는 능력을 증명했다:** 공정한 matched comparison이 없고, VidQA는 language alignment를 사용한다.
- **2025년 9월 시점에 후속 multimodal 연구 방향을 이미 바꾼 유산이 확립됐다:** 발표 뒤 약 세 달 만의 인과·영향 주장에는 citation·adoption evidence가 없다.

### 논문이 직접 밝힌 한계

- V-JEPA 2-AC는 camera calibration 없이 action coordinate를 추론하므로 camera 위치에 민감했고, 연구진이 잘 작동하는 위치를 수동으로 찾은 뒤 고정했다.
- Autoregressive rollout은 horizon이 길어질수록 오차가 누적되고, action sequence search space가 지수적으로 커진다.
- Pick-and-place는 긴 horizon을 model이 자율 처리한 것이 아니라 여러 image subgoal과 고정 전환 schedule을 사용했다.
- Goal은 image로만 지정하며 language goal은 future work다.
- EK100 anticipation은 1초 horizon, kitchen, 고정 label vocabulary에 한정되고 더 먼 horizon에서 성능이 낮아진다.
- V-JEPA 2 scaling은 최대 1B encoder까지 시험됐다. 더 큰 규모에서 개선이 지속되는지는 열린 문제다.

### ‘통계적이지 causal하지 않다’는 말도 평가가 필요하다

원 웹글은 model이 correlation만 배우고 진정한 causal mechanism은 모른다고 단정한다. 공식 연구가 intervention 기반 인과 식별을 입증하지 않았으므로 강한 causal-understanding 주장에 제동을 거는 방향은 타당하다. 다만 내부 표현이 ‘본질적으로 비인과적’이라는 반대 명제도 현재 실험만으로 증명된 것은 아니다. 정확한 기록은 **제시된 benchmark가 인과 mechanism의 충분조건을 시험하지 않았다**는 것이다.

### 공개성과 안전 평가의 남은 틈

Code·config·weight가 공개돼 proprietary model보다 재현 가능성이 높지만 VM22M 원본 media 전체를 repository가 snapshot으로 배포하지는 않는다. Training compute·hardware의 완전한 carbon accounting, dataset의 demographic·geographic coverage, privacy·copyright audit와 robot failure safety 분석도 paper·minimal model card에서 충분히 다루지 않는다. Tabletop manipulation의 성공률을 사람 주변의 general-purpose robot safety 인증으로 읽을 수 없다.

## 학습 확인

### 확인 질문

1. V-JEPA 2의 action-free masked latent prediction과 V-JEPA 2-AC의 action-conditioned future prediction은 input·loss·trainable component가 어떻게 다른가?
2. ‘Zero-shot robot planning’이 robot data 0을 뜻하지 않는 이유와 실제 zero-shot 경계는 무엇인가?
3. SSv2 77.3, EK100 39.7, VidQA 84.0과 robot pick-and-place 80%를 하나의 세계 이해 점수로 합칠 수 없는 이유는 무엇인가?

### 다음 문서

- [[학습된 세계 모델]] — 관측 표현, 행동 조건부 동역학, planner·control loop를 세 층으로 나누어 읽는다.
- [[105_통합 멀티모달 아키텍처의 공유 범위와 입출력 경계]] — encoder·token·objective·product interface를 구분해 ‘통합’ 주장을 읽는다.
- [[093_멀티모달 LLM과 시각-언어 연결 방식의 분화]] — visual encoder를 projector로 language model에 연결하는 V-JEPA 2 VidQA 경로를 기존 vision-language interface와 비교한다.
- [[070_CLIP과 대조적 언어-이미지 사전 학습]] — 실제 contrastive objective와 V-JEPA 2의 non-contrastive latent regression을 구분한다.
- [[사전 학습 지식은 과제에 어떻게 도착하는가]] — frozen probe, fine-tuning, projector alignment와 action-conditioned post-training이 표현을 downstream task로 옮기는 경로를 비교한다.
- [[자동 평가 지표는 무엇을 보상하는가]] — top-1, recall@5, paired accuracy와 robot success rate의 서로 다른 분모를 점검한다.

## 출처

- 원 웹글: Michael Brenndoerfer, [*V-JEPA 2: Vision-Based World Modeling for Embodied AI*](https://mbrenndoerfer.com/writing/v-jepa-2-vision-based-world-modeling-embodied-ai), 2025-09-01 게시, ‘2025: V-JEPA 2’부터 ‘Legacy and Looking Forward’까지.
- Mido Assran 외, [*V-JEPA 2: Self-Supervised Video Models Enable Understanding, Prediction and Planning*](https://arxiv.org/abs/2506.09985v1), arXiv:2506.09985v1, 2025-06-11, Abstract·§§1–7·9·10–11과 Tables 1–12.
- Meta AI, [*Introducing the V-JEPA 2 world model and new benchmarks for physical reasoning*](https://ai.meta.com/blog/v-jepa-2-world-model-benchmarks/), 2025-06-11, Takeaways·How V-JEPA 2 works·robot planning·New benchmarks·Next steps.
- Meta FAIR, [*facebookresearch/vjepa2*](https://github.com/facebookresearch/vjepa2), official code·config·checkpoint repository, README의 V-JEPA 2 Pre-training·V-JEPA 2-AC Post-training·Models·Evaluation Attentive Probes·License.
- Meta AI, [*V-JEPA 2 ViT-g/16 384 model card*](https://huggingface.co/facebook/vjepa2-vitg-fpc64-384), Intended Uses·model config·license.
- 프로젝트 보존 자료: `raw/108_V-JEPA 2 Vision-Based World Modeling for Embodied AI.ko.md`, `raw/108_V-JEPA 2 Vision-Based World Modeling for Embodied AI.commentary.ko.md`.

## 관련 항목

- [[학습된 세계 모델]]
- [[070_CLIP과 대조적 언어-이미지 사전 학습]]
- [[093_멀티모달 LLM과 시각-언어 연결 방식의 분화]]
- [[105_통합 멀티모달 아키텍처의 공유 범위와 입출력 경계]]
- [[CLIP]]
- [[멀티모달 대규모 언어 모델]]
- [[Transformer]]
- [[사전 학습 지식은 과제에 어떻게 도착하는가]]
- [[자동 평가 지표는 무엇을 보상하는가]]
