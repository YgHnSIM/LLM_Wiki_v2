# GLUE와 SuperGLUE: 언어 이해를 위한 표준화 평가

출처: https://mbrenndoerfer.com/writing/glue-superglue-standardized-evaluation-language-understanding

---

2018년에 등장한 GLUE와 그 후속 SuperGLUE를 종합적으로 설명한다. 표준화 평가 틀이 언어 AI 연구의 모델 비교를 어떻게 바꾸었고, 일반 언어 이해 능력을 평가하는 도구로 어떤 역할을 했는지 살펴본다.

읽기 수준

전문성 수준을 선택하면 용어 설명의 양을 조절할 수 있다. 초급자는 더 많은 도구 설명을 보고, 전문가는 읽기 흐름을 유지하도록 더 적은 설명을 본다. 밑줄 친 용어에 마우스를 올리면 바로 정의를 확인할 수 있다.

## 2018년: GLUE와 SuperGLUE

2018년 뉴욕대학교·워싱턴대학교·DeepMind 연구진은 자연어 처리 공동체가 언어 이해 시스템을 평가하고 비교하는 방식을 크게 바꾼 GLUE(General Language Understanding Evaluation)를 발표했다. GLUE는 언어 AI 발전을 방해하던 문제, 곧 여러 과제와 영역에 걸쳐 시스템을 평가할 표준화된 종합 틀이 부족하다는 문제를 다뤘다.

2010년대 후반 Transformer와 BERT 같은 사전 학습 방법이 빠르게 발전했지만 평가는 조각나 있었다. 연구자는 감성 분석·질의응답·텍스트 함의 같은 개별 과제를 서로 다른 데이터셋·지표·보고 규칙으로 평가했다. 한 과제의 개선이 일반 언어 표현의 발전인지 그 자료에 맞춘 최적화인지 판단하기 어려웠다. 논문마다 전처리·추가 훈련 자료·평가 protocol이 달라 직접 비교도 쉽지 않았다.

GLUE는 서로 다른 자연어 이해 과제 아홉 개를 하나의 suite로 묶었다. 감성·문법 수용성·의미 유사도·paraphrase·자연어 추론을 포함하고, 공통 data format·평가 server·leaderboard를 제공했다. 같은 공개 split과 비공개 test 평가를 사용해 모델 사이 비교를 더 일관되게 만들었다.

의의는 편리한 평가 묶음을 넘어섰다. 한 과제만이 아니라 자료량·영역·입력 형식이 다른 여러 과제에서 전이되는 표현을 측정하게 했다. 이는 하나의 사전 학습 모델을 여러 후속 과제에 미세조정하는 연구 흐름과 잘 맞았다. GLUE는 이런 모델의 폭넓은 전이 성능을 한 표와 집계 점수로 보여 주는 공통 무대가 됐다.

2019년 SuperGLUE는 GLUE가 빠르게 포화하자 더 어려운 후속 suite로 등장했다. 더 어려운 과제, coreference와 QA를 포함한 다양한 형식, 모든 과제의 인간 기준선과 개선된 도구·사용 규칙을 제공했다. GLUE와 SuperGLUE는 자연어 이해 평가의 중요한 표준이 됐지만, 그 점수를 언어 이해 전체의 완전한 측정값으로 읽어서는 안 된다.

## 문제

GLUE 이전의 언어 이해 평가는 단편화돼 모델 간 의미 있는 비교를 방해했다. 연구진마다 다른 과제를 골랐고, 같은 과제도 다른 dataset·전처리·평가 split·보고 형식을 사용했다. 감성 분석 최고 성능 논문만으로 그 시스템의 질의응답이나 함의 판단 능력을 알 수 없었다.

첫째, 논문 사이 점수를 직접 비교하기 어려웠다. 한 연구는 감성 정확도를, 다른 연구는 별도 감성 자료의 F1을 보고할 수 있었다. 공통 자료와 protocol이 없으면 어느 시스템이 더 강한지 판단하기 어렵다.

둘째, 개별 과제 최적화가 일반화로 오인될 수 있었다. 감성 분석에 맞춘 모델은 높은 점수를 내도 자연어 추론에서 약할 수 있다. 한 자료의 표면 규칙을 잘 이용하는 것과 여러 과제로 옮길 수 있는 언어 표현을 학습하는 것은 다르다.

셋째, 평가 과제의 다양성이 부족했다. 분류·sequence labeling 일부에 집중하면 의미 유사도, 문장 관계, coreference, 상식 추론 같은 능력을 놓칠 수 있었다. 제한된 과제에서 강한 시스템이 언어 이해 전반에서 강하다고 판단하기 어려웠다.

결과 보고도 혼란을 키웠다. 같은 과제에 다른 metric, development와 test 결과의 혼합, 사용자 지정 split, 추가 자료와 ensemble의 차이가 있었다. 개선이 구조 때문인지 자료·전처리·training recipe 때문인지 분리하기 어려웠다.

사전 학습 언어 모델 연구에는 특히 큰 문제였다. 일반 표현의 전이를 보이려면 자료량과 domain이 다른 여러 과제를 일관된 방식으로 평가해야 했다. 연구진이 각 dataset 준비·평가 script를 따로 구현하면 시간과 오류가 늘고, 종합 평가가 어려워졌다.

또한 분야에는 하나의 공유 진척 좌표와 인간 비교가 부족했다. 어느 과제가 얼마나 남았는지, aggregate improvement가 실제로 어떤 하위 능력에서 왔는지 추적할 기반이 필요했다. 다만 인간 기준선 자체도 수집 방식과 annotator 집단에 의존하므로 절대 상한선은 아니다.

## 해법

GLUE는 과제 선택, 공통 protocol, 지표, 중앙 평가와 투명한 보고를 결합했다. 아홉 개 영어 문장·문장쌍 이해 과제를 묶어 단일 모델 계열이 자료 크기·domain·label format이 다른 조건에 얼마나 잘 적응하는지 보게 했다.

### 과제의 다양성과 범위

GLUE의 단일 문장 과제는 CoLA와 SST-2다. CoLA는 문법 수용성을 Matthews correlation coefficient로, SST-2는 영화 리뷰의 이진 감성을 accuracy로 평가한다.

유사도·paraphrase 과제는 MRPC·STS-B·QQP다. MRPC와 QQP는 문장쌍이 같은 의미인지 분류하고 accuracy와 F1을 사용한다. STS-B는 의미 유사도를 연속값으로 예측하며 Pearson·Spearman correlation을 쓴다.

추론 형식은 MNLI·QNLI·RTE·WNLI다. MNLI는 premise와 hypothesis의 entailment·contradiction·neutral을 여러 genre에서 분류한다. QNLI는 SQuAD의 질문–문장 쌍을 entailment식 이진 분류로 재구성한 과제다. RTE는 여러 textual entailment 자료를 묶고, WNLI는 Winograd Schema Challenge를 NLI 형식으로 바꿨다.

이 다양성은 한 task만 최적화한 모델의 한계를 드러낼 수 있었다. 하지만 GLUE는 각 과제마다 별도 모델을 학습하는 것을 허용했고 하나의 multi-task model이나 shared parameter를 강제하지 않았다. 일반 전이를 장려했지만 그것을 평가 protocol의 필수 조건으로 만들지는 않았다.

### 자연어 추론 이해하기

자연어 추론은 premise가 주어졌을 때 hypothesis가 따라오는지, 모순되는지, 둘 다 아닌지 분류한다. 의미·세계 지식·양화·부정 등이 관여할 수 있어 중요한 평가 과제다. 그러나 dataset의 단어·길이·annotation artifact를 이용해서도 일부 정답을 맞힐 수 있으므로 높은 정확도를 일반 논리 이해와 동일시하지 않는다.

### 표준화 평가 protocol

GLUE는 각 원 dataset의 train·development·test split을 모아 공통 format과 평가 server를 제공했다. 네 과제에는 비공개 test data가 있어 정답 label을 직접 볼 수 없었고 중앙 server가 제출을 채점했다. 다른 과제는 원 자료의 공개 test set을 사용했다.

metric은 과제 성격에 따라 달랐다. 분류 accuracy, MRPC·QQP의 F1, STS-B의 두 correlation, CoLA의 Matthews correlation 등을 사용했다. 이것은 모든 과제를 하나의 동일한 통계량으로 바꾼 것이 아니라 서로 다른 metric을 공통 leaderboard에 모은 것이다.

중앙 평가와 leaderboard는 비교를 개선했지만 완전한 동일 조건을 보장하지는 않았다. 추가 pretraining data, ensemble, 모델 크기·compute와 fine-tuning 방법이 제출마다 다를 수 있다. 표준 test와 metric은 공통이지만 training budget까지 통제한 실험은 아니다.

### 집계 점수와 순위

GLUE score는 과제별 metric을 모아 평균한 단일 숫자다. metric이 둘인 과제는 먼저 두 값을 평균하고, MNLI는 matched·mismatched 결과를 함께 반영한다. 과제 난이도나 중요도에 따라 별도 가중치를 주는 방식이 아니다.

이 집계는 빠른 순위 비교에 편리하지만 서로 다른 통계량을 같은 비중으로 더한다. 한 과제의 큰 향상이 다른 과제의 약점을 가릴 수 있고, 작은 dataset과 큰 dataset이 비슷한 weight를 갖는다. 따라서 aggregate와 per-task score를 함께 봐야 한다.

### 인간 기준선과 진척 추적

GLUE 원 발표 당시에는 ELMo 기반 baseline과 sentence representation model이 낮은 점수를 보여 충분한 headroom이 있었다. 2019년 별도 연구가 GLUE의 비전문가 인간 성능을 보수적으로 추정했고 aggregate 87.1을 보고했다. 같은 시기 XLNet-large가 88.4로 이를 넘어 GLUE 포화 논의가 커졌다.

이 비교는 모든 과제에서 인간을 넘었다는 뜻이 아니다. 당시 모델은 인간 추정치를 네 과제에서 넘었고 일부 과제와 진단 현상은 여전히 어려웠다. 인간 점수도 crowdsourcing 절차·설명·표본과 aggregation에 따라 달라진다.

GLUE의 expert-constructed diagnostic set은 NLI 형식 예시를 어휘 의미·predicate–argument·logic·world knowledge 현상으로 나눠 분석했다. 주 leaderboard 집계 점수와 별도이며, 모델이 어떤 현상에서 실패하는지 보는 보조 도구다.

### SuperGLUE: 기준 높이기

SuperGLUE는 2019년 여덟 과제를 묶었다. BoolQ, CommitmentBank(CB), Choice of Plausible Alternatives(COPA), Multi-Sentence Reading Comprehension(MultiRC), ReCoRD, Recognizing Textual Entailment(RTE), Words in Context(WiC), Winograd Schema Challenge(WSC)다.

GLUE의 문장·문장쌍 분류 형식에서 나아가 yes/no QA, multiple-choice causal reasoning, multi-sentence QA, span/entity 선택, coreference를 포함했다. 그러나 자유 형식의 open-ended text generation을 주요 과제로 추가한 것은 아니다.

일부 과제는 accuracy와 F1, exact match와 F1처럼 복수 metric을 사용했다. 모든 과제에 인간 성능 추정을 제공하고, 강한 BERT 기반 baseline과의 gap을 확인했다. 도구를 개선하고 leaderboard 제출·보고 규칙도 다듬었다.

## 응용과 영향

GLUE와 SuperGLUE는 자연어 처리 모델 비교의 공통 좌표를 제공했다. 같은 task suite와 test server를 사용하므로 다른 연구진의 모델을 이전보다 직접 비교하기 쉬워졌다. 점수 80이라는 숫자는 제출 시점·version·metric 조건이 같을 때 공통 의미를 가졌다.

사전 학습 언어 모델 평가에서 특히 중요했다. BERT는 GLUE 여러 과제의 큰 향상을 통해 양방향 사전 학습의 전이 효과를 보였다. 이후 RoBERTa·ALBERT·T5 등도 이 suite를 사용해 training recipe·model sharing·text-to-text 방식의 효과를 비교했다. 그렇다고 모든 주요 언어 모델이 반드시 두 benchmark를 사용한 것은 아니다.

leaderboard는 경쟁과 빠른 개선을 촉진했다. aggregate와 과제별 점수를 공개해 남은 약점을 볼 수 있었다. 반면 반복 제출과 benchmark-aware development는 suite 자체에 대한 과적합을 만들 수 있으므로 경쟁의 효과가 항상 ‘일반 이해’의 발전과 같지는 않다.

benchmark는 연구 질문도 바꿨다. 낮은 RTE·CoLA·WNLI 결과는 적은 자료·문법·coreference의 난점을 부각했고, SuperGLUE의 CB·COPA·MultiRC·ReCoRD·WSC는 상식·담화·coreference와 여러 문장 정보 통합에 관심을 모았다.

GLUE가 확산한 held-out test, 중앙 평가, 공통 script, per-task와 aggregate reporting은 후속 benchmark 설계에 영향을 주었다. 그러나 SQuAD는 2016년, ImageNet·COCO도 GLUE보다 먼저 존재했다. 이 선행 benchmark가 GLUE 원칙을 채택했다고 역방향 계보를 쓰지 않는다.

산업에서도 모델 연구 보고서와 library 예제에 GLUE가 쓰였지만, 회사의 실제 제품 품질이나 채택 결정을 GLUE score 하나로 측정한다는 보편 주장은 근거가 필요하다. 실제 deployment는 latency·비용·domain shift·안전·공정성·언어 coverage를 함께 평가해야 한다.

과제별 오차 분석은 전이 학습과 표현 연구에 도움을 줬다. 하지만 높은 상관이나 분류 정확도가 어떤 내부 언어 능력을 직접 증명하는지에는 별도 진단이 필요하다. benchmark는 관찰 가능한 출력 interface이지 마음속 ‘이해’를 직접 읽는 장치가 아니다.

## 한계

가장 근본적인 질문은 높은 GLUE·SuperGLUE 점수가 실제 언어 이해인지, dataset의 통계적 shortcut인지다. 모델은 label과 연결된 단어·길이·문장 패턴을 이용할 수 있다. test 점수가 높아도 새로운 domain·표현·인과 관계에 일반화하지 못할 수 있다.

dataset artifact도 있다. NLI의 hypothesis-only cue, paraphrase 자료의 lexical overlap, Winograd 재구성의 label 문제처럼 표면 신호가 task를 왜곡할 수 있다. WNLI는 특히 train·test 구성과 label issue 때문에 많은 시스템이 majority baseline을 넘기 어려웠고 결과 해석이 까다로웠다.

과제 선택은 언어 이해의 일부 관점을 반영한다. GLUE는 문장·문장쌍 분류 중심이고, SuperGLUE가 QA·coreference를 넓혔지만 장문 생성·대화·다중 문서 검색·도구 사용·다언어 상호작용은 거의 다루지 않는다.

aggregate score는 차이를 숨긴다. 각 task metric의 scale과 variance, dataset 크기·난이도가 다른데 단순 평균한다. 한 숫자로 순위를 만들면 특정 약점과 uncertainty가 가려질 수 있다.

인간 baseline도 고정 절대값이 아니다. 비전문 crowdworker와 전문가, 지침 이해, 예시 수, 합의 처리에 따라 달라진다. 기계가 한 aggregate 인간 추정치를 넘었다고 인간 언어 이해 전반을 넘었다고 말할 수 없다.

영어 중심이라는 제약도 크다. 다른 언어의 형태·문법·문화적 맥락과 cross-lingual transfer를 평가하지 않는다. 이후 XGLUE·XTREME 등 다언어 suite가 별도 필요를 다뤘다.

빠른 포화는 benchmark 수명을 줄였다. SuperGLUE가 더 어려운 과제를 제시했지만 결국 모델 개발이 특정 suite에 맞춰지면 새 자료와 evaluation이 필요해진다. benchmark 교체만 반복하면 장기 비교 가능성이 떨어질 수도 있다.

train·test 분포도 실제 사용 환경과 다르다. 정돈된 영어 문장과 고정 label space는 noisy input, 새 domain, adversarial use와 open-ended interaction을 충분히 반영하지 않는다.

사전 학습 corpus가 공개 benchmark test나 유사 예시를 포함할 가능성도 커졌다. data contamination은 zero-shot·few-shot 평가의 독립성을 약화한다. 비공개 test label만으로 pretraining text 노출까지 막을 수는 없다.

## 유산

GLUE와 SuperGLUE는 표준화된 종합 평가가 언어 AI 연구의 공공 인프라가 될 수 있음을 보여 주었다. 개별 과제 점수의 조각난 보고에서 여러 과제·공통 server·leaderboard·진단 분석을 결합한 suite로 이동시켰다.

BERT·RoBERTa·ALBERT·T5 같은 사전 학습 모델의 폭넓은 전이를 같은 좌표에서 비교하는 데 큰 역할을 했다. 다만 leaderboard 향상만으로 구조적 혁신의 원인을 분리할 수 없고 추가 자료·compute·ensemble·training recipe를 함께 봐야 한다.

후속 benchmark는 GLUE의 장점과 한계를 모두 계승했다. BIG-bench·MMLU·HELM과 domain·다언어 suite는 task coverage, scenario, calibration, 효율·공정성·견고성 같은 더 많은 축을 도입했다. 하나의 평균 점수보다 다차원 evaluation이 필요하다는 인식이 커졌다.

GLUE와 SuperGLUE는 foundation model의 일반성을 시험하는 초기 공통 장이었다. 여러 task에 같은 사전 학습 기반을 적응시켜 점수를 비교할 수 있었다. 그러나 ‘foundation’이라는 말은 모든 실제 사용에 대한 일반화를 보장하지 않는다.

어려운 과제의 실패는 연구 방향을 제시했다. 자연어 추론·coreference·상식·multi-sentence QA의 약점은 새 pretraining objective·multi-task learning·자료 구축을 촉진했다. 동시에 dataset artifact와 benchmark saturation은 점수 경쟁의 한계를 드러냈다.

오늘날에도 두 suite는 역사적 비교와 encoder model 회귀 시험에 유용하지만 최신 범용 LLM의 모든 능력을 판별하는 단독 기준은 아니다. generation·factuality·safety·multilinguality·long context·agentic action에는 별도 evaluation이 필요하다.

GLUE와 SuperGLUE의 핵심 유산은 특정 leaderboard 순위가 아니라 평가 조건을 공개하고 여러 과제를 함께 보며 aggregate와 세부 결과를 나누는 관행이다. 표준화는 비교 가능성을 높이지만 객관성을 자동 보장하지 않는다. benchmark가 무엇을 포함하고 무엇을 빠뜨렸는지 계속 검토해야 언어 AI의 진척을 과장 없이 측정할 수 있다.
