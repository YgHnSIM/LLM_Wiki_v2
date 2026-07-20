---
source_file: "060_GLUE and SuperGLUE Standardized Evaluation for Language Understanding.md"
translation_file: "060_GLUE and SuperGLUE Standardized Evaluation for Language Understanding.ko.md"
commentary_type: "해설"
source_stem: "060_GLUE and SuperGLUE Standardized Evaluation for Language Understanding"
order_prefix: "060"
topic: "GLUE와 SuperGLUE의 표준화 언어 이해 평가"
period: "2018–2019년"
tags:
  - LLM
  - NLP
  - AI-history
  - commentary
---

# GLUE와 SuperGLUE의 표준화 언어 이해 평가 해설

## 1. 한눈에 보기

- 핵심 주제: 여러 영어 NLU dataset을 공통 format·metric·test server·leaderboard로 묶은 평가 suite
- 등장 배경: 논문마다 다른 task·split·metric 때문에 사전 학습 모델의 폭넓은 전이를 비교하기 어려웠던 문제
- 가장 중요한 아이디어: aggregate score와 per-task·diagnostic 결과를 함께 공개해 공통 진척 좌표를 만든다.
- 이후 LLM/NLP에 남긴 영향: multi-task benchmark와 중앙 평가가 모델 보고의 표준 인프라가 됐다.

> 이 문서는 `060_GLUE and SuperGLUE Standardized Evaluation for Language Understanding.md`의 번역문을 이해하기 위한 해설이다. 표준화가 보장하는 것과 보장하지 않는 것을 구분한다.

## 2. 핵심 요약

GLUE는 기존 영어 dataset 아홉 개, expert diagnostic set, 평가 server와 leaderboard를 묶었다. CoLA·SST-2, MRPC·STS-B·QQP, MNLI·QNLI·RTE·WNLI를 각기 다른 metric으로 채점하고 과제별 점수를 단순 평균해 GLUE score를 만든다. 하나의 multi-task model을 강제하지 않는다. 2019년 비전문가 인간 추정치 87.1을 XLNet-large 88.4가 넘자 headroom이 줄었고, SuperGLUE가 BoolQ·CB·COPA·MultiRC·ReCoRD·RTE·WiC·WSC 여덟 과제와 모든 task의 인간 baseline을 제시했다.

- 무엇을 다루는가: task suite, 지표·집계, private test, human baseline, saturation
- 어떤 문제를 해결하려 했는가: 파편화된 개별 과제 평가와 논문 간 비교 불가능성
- 어떤 방식이 새로웠는가: 여러 기존 dataset의 공통 interface와 중앙 leaderboard·diagnostic analysis
- 결과적으로 무엇이 바뀌었는가: 사전 학습 모델의 broad transfer를 같은 표에서 비교하는 관행이 정착했다.

## 3. 역사적 배경

SQuAD·MNLI·SST 등 개별 benchmark는 이미 있었지만 서로 다른 형식과 metric을 썼다. ELMo·GPT·BERT처럼 하나의 사전 학습 기반을 여러 과제에 적용하는 연구가 등장하면서 일관된 suite가 특히 필요해졌다. GLUE는 새 task를 처음부터 만든 것이 아니라 기존 자료를 선별·재구성하고 공통 평가 infrastructure를 제공했다. SuperGLUE는 1년 만의 빠른 포화에 대응했다.

- 이전 접근법: 개별 dataset별 평가와 paper별 custom preprocessing
- 당시의 한계: broad transfer 비교, private test 보존, aggregate progress tracking
- 이 주제가 필요했던 이유: 한 task의 점수와 여러 domain·자료량에 걸친 재사용 가능성을 구분하기 위해서였다.

## 4. 핵심 개념 해설

### 4.1 GLUE의 아홉 과제

두 single-sentence, 세 similarity/paraphrase, 네 inference-format task다. QNLI는 open-ended QA가 아니라 SQuAD 질문–문장을 이진 entailment로 바꾼 과제다. WNLI는 Winograd 자료의 NLI 재구성 때문에 label artifact가 심했다.

### 4.2 서로 다른 metric의 평균

CoLA MCC, STS-B Pearson·Spearman, MRPC·QQP accuracy·F1, 나머지 accuracy를 사용한다. 두 metric이 있으면 먼저 평균하고 task score를 평균한다. 난이도·중요도·dataset 크기 가중은 없다. aggregate는 편리한 순위값이지 공통 확률이나 동일한 measurement scale이 아니다.

### 4.3 private test와 공정성

네 과제의 private test label을 server가 채점해 직접 test tuning을 줄인다. 그러나 pretraining corpus contamination, repeated leaderboard development, extra data·compute·ensemble 차이는 남는다.

### 4.4 SuperGLUE의 확장

여덟 task에 boolean QA, embedded-clause commitment, causal choice, multi-sentence QA, reading comprehension span/entity, entailment, word-in-context와 Winograd coreference를 포함한다. open-ended generation benchmark로 바뀐 것은 아니다.

## 5. 원문의 논리 구조

원문은 개별 과제 평가의 fragmentation을 문제로 제시한다. GLUE의 아홉 task·공통 protocol·aggregate score·human baseline을 해법으로 설명하고, 빠른 포화에 대응한 SuperGLUE를 잇는다. 후반에는 model 비교·leaderboard 경쟁·연구 방향·산업 영향을 평가하고, shortcut·task coverage·aggregate masking·human estimate·English 편중·saturation·domain shift를 한계로 든다.

1. 표준화 이전 비교의 불일치를 제시한다.
2. GLUE의 task와 metric·server를 설명한다.
3. aggregate와 human comparison을 진척 좌표로 놓는다.
4. SuperGLUE의 더 어려운 task·형식·기준선을 설명한다.
5. benchmark score와 일반 이해 사이의 경계를 검토한다.

## 6. 왜 중요한가

GLUE는 모델 개발의 공통 언어를 만들었다. BERT의 여러 과제 개선을 단일 cherry-picked task가 아니라 한 suite에서 볼 수 있었고, model architecture·pretraining recipe·fine-tuning 방법의 폭넓은 영향을 비교하기 쉬워졌다. SuperGLUE는 benchmark도 모델 발전에 따라 다시 설계해야 한다는 사실을 빠르게 보여 주었다.

핵심적으로 중요한 점:

- 공통 split·metric·test server로 비교 가능성을 높였다.
- aggregate와 per-task·diagnostic 결과를 함께 제공했다.
- benchmark saturation 자체를 측정하고 더 어려운 후속 suite를 만들었다.

## 7. 현대 LLM과의 연결

현대 LLM evaluation도 여러 task를 suite로 묶고 평균 점수를 보고한다. GLUE의 경험은 평균이 무엇을 숨기는지, public leaderboard가 어떻게 development target이 되는지, human baseline이 설정에 의존하는지 보여 준다. MMLU·BIG-bench·HELM 같은 후속 suite를 읽을 때도 task coverage, contamination, prompt·scoring, model access 조건을 확인해야 한다.

decoder LLM의 few-shot·generation 평가에는 GLUE식 fine-tuning leaderboard만으로 충분하지 않다. 대화·사실성·안전·long context·tool use·비용·latency 등 별도 scenario가 필요하다.

## 8. 한계와 비판적 관점

- 측정 한계: 아홉 또는 여덟 dataset이 ‘일반 언어 이해’ 전체를 대표하지 않는다.
- 집계 한계: 서로 다른 metric과 dataset을 동일 비중으로 평균한다.
- 자료 한계: annotation artifact·shortcut·English 중심·distribution shift가 남는다.
- 경쟁 한계: private label도 repeated submission과 benchmark-aware model development를 막지 못한다.
- 인간 비교 한계: crowdworker baseline은 지침·표본·합의 방식에 따라 달라지는 추정치다.

원문의 “난이도와 중요도로 가중”, “생성 과제를 포함”, “GLUE가 SQuAD·ImageNet·COCO의 평가 원칙에 영향을 주었다”는 서술은 원 논문·연대와 맞지 않는다. SQuAD와 시각 benchmark는 GLUE보다 먼저 존재했다.

## 9. 용어 정리

| 용어 | 설명 |
|---|---|
| benchmark suite | 여러 dataset·metric·protocol을 하나의 평가 묶음으로 제공하는 틀 |
| aggregate score | 과제별 결과를 정해진 방식으로 합친 단일 수치 |
| diagnostic set | 주 순위와 별도로 특정 언어 현상의 오류를 분석하는 자료 |
| private test | 정답 label을 공개하지 않고 server가 제출 prediction을 채점하는 test set |
| saturation | 모델 점수가 상한·인간 추정치 근처에 모여 구분력이 줄어드는 상태 |
| contamination | 평가 자료 또는 매우 유사한 text가 사전 학습 자료에 포함되는 문제 |

## 10. 함께 보면 좋은 글

- [[058_BERT Bidirectional Pretraining Revolutionizes Language Understanding]]
- [[051_SQuAD The Stanford Question Answering Dataset and Reading Comprehension Benchmark]]
- [[033_BLEU Metric Automatic Evaluation for Machine Translation]]

## 11. 읽고 생각해볼 질문

1. dataset 크기와 metric이 다른 task를 단순 평균하면 어떤 모델 선택 유인이 생기는가?
2. private test label은 어떤 종류의 과적합을 막고 어떤 종류는 막지 못하는가?
3. 인간 aggregate를 넘었다는 사실과 모든 과제에서 인간을 넘었다는 주장은 어떻게 다른가?
4. 최신 생성형 LLM을 평가하려면 GLUE에 없던 어떤 축을 추가해야 하는가?

## 12. 짧은 결론

GLUE와 SuperGLUE는 언어 이해를 완전하게 정의한 시험이 아니라 여러 영어 NLU 과제를 공통 protocol과 leaderboard로 묶은 평가 infrastructure다. 이 표준화는 사전 학습 모델의 폭넓은 전이를 비교하게 했지만 단순 평균, artifact, English 편중, saturation과 contamination을 남겼다. 핵심 유산은 한 순위표가 아니라 평가 범위와 조건을 공개하고 aggregate와 세부 실패를 함께 읽는 관행이다.
