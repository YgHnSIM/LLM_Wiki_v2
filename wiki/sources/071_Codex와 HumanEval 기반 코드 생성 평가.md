---
schema_version: 3
id: source.071
page_type: source
title: Codex와 HumanEval 기반 코드 생성 평가
aliases:
  - 071_Codex AI-Assisted Code Generation and the Transformation of Software Development
  - Evaluating Large Language Models Trained on Code
  - OpenAI Codex 2021
tags:
  - type/source
  - domain/ai
  - domain/computer-science
  - domain/human-computer-interaction
  - domain/machine-learning
  - domain/nlp
created: '2026-07-21'
updated: '2026-07-21'
editorial_status: active
review:
  evidence_coverage: verified
  content_mode: descriptive
artifacts:
  - raw/071_Codex AI-Assisted Code Generation and the Transformation of Software Development.ko.md
  - raw/071_Codex AI-Assisted Code Generation and the Transformation of Software Development.commentary.ko.md
evidence:
  - source_id: chen-et-al-2021-codex
    locator: '초록, §§1–7, Figures 1·4–8과 Tables 1–3, Appendices A·C–H의 HumanEval·pass@k·코드 미세조정·Codex-S·한계·위험 분석'
    relation: supports
  - source_id: openai-2021-codex
    locator: '2021-08-10 발표의 자연어-코드 인터페이스, API 공개와 GitHub Copilot용 production model 설명'
    relation: supplements
  - source_id: github-2021-copilot-preview
    locator: '2021-06-29 technical preview 발표의 Codex 기반, 편집기 문맥과 지원 언어에 관한 제품 설명'
    relation: contextualizes
relations:
  - target: concept.언어-모델-전이-학습
    kind: related
  - target: analysis.사전-학습-지식은-과제에-어떻게-도착하는가
    kind: related
learning:
  difficulty:
    entry: intermediate
    target: intermediate
  prerequisites:
    - target: source.067
    - target: concept.자기회귀-생성
  assumed_knowledge: 없음
  outcomes:
    - '2021년 연구용 Codex의 코드 특화 학습과 HumanEval·pass@k 평가를 설명하고, 연구 모델·GitHub Copilot용 production version·현행 동명 제품을 구분할 수 있다.'
  next:
    - target: concept.openai-codex-2021
      reason: 'OpenAI Codex (2021) — 코드 영역 계속학습, 함수 생성과 연구 모델의 경계를 재사용 가능한 개념으로 정리한다.'
    - target: analysis.평가-지표와-모델-유인
      reason: 자동 평가 지표는 무엇을 보상하는가 — 참조 문자열 중첩과 unit-test 기능 정확성이 서로 다른 출력을 보상하는 이유를 비교한다.
---
# Codex와 HumanEval 기반 코드 생성 평가

> [!note] 학습 안내
> **난이도:** 중급<br>
> **선수 지식:** [[source.067|GPT-3와 문맥 내 학습]], [[concept.자기회귀-생성|자기회귀 생성]]<br>
> **읽고 나면:** 2021년 연구용 Codex의 코드 특화 학습과 HumanEval·pass@k 평가를 설명하고, 연구 모델·GitHub Copilot용 production version·현행 동명 제품을 구분할 수 있다.

## 1단계 — 먼저 잡을 핵심

### 핵심 문장

Chen 등은 2021년에 [[067_GPT-3와 문맥 내 학습|GPT 계열 언어 모델]]을 공개 GitHub의 Python 코드로 계속 학습한 **Codex** 모델군을 보고했다. 가장 큰 연구 모델은 12B 매개변수였으며, 자연어 docstring과 함수 signature를 입력받아 독립 Python 함수의 body를 [[자기회귀 생성|자기회귀적으로 생성]]했다.

연구의 핵심은 코드가 그럴듯하게 보이는지를 평가하는 데 있지 않았다. 연구진은 164개 문제와 unit test로 구성한 HumanEval을 만들고, 생성 코드가 test를 통과하는지로 기능 정확성(functional correctness)을 측정했다. 한 문제에서 여러 표본을 만들 때 적어도 하나가 통과할 확률을 나타내는 pass@$k$도 함께 제안했다.

### 역사적 위치와 이 문서의 범위

[[067_GPT-3와 문맥 내 학습]]은 코드 생성 benchmark를 직접 평가하지 않았다. Codex 연구는 일반 텍스트 중심 GPT 계열을 코드 분포에 계속 학습하고, 자연어 명세에서 실행 가능한 함수로 이어지는 범위를 별도 자료와 지표로 측정했다. 이는 [[언어 모델 전이 학습|사전 학습 지식의 영역 적응]]과 실행 기반 평가를 함께 볼 수 있는 사례다.

다만 이 논문이 직접 연구한 주 과제는 **docstring에서 독립 Python 함수를 합성하는 것**이다. 전체 저장소 이해, 여러 파일에 걸친 수정, 장기적인 개발 생산성, 코드 리뷰 품질이나 조직의 업무 변화는 직접 측정하지 않았다. 이 문서는 좁지만 재현 가능한 연구 결과와 제품 발표 및 후대의 확대된 서사를 구분한다.

## 2단계 — 작동 원리

### 일반 언어 모델을 코드 분포에 계속 학습한다

Codex는 GPT 계열의 왼쪽에서 오른쪽으로 다음 token을 예측하는 목적을 유지한다. 달라진 것은 학습 분포다. 연구진은 대규모 Python 파일을 같은 자기회귀 목적으로 계속 학습해, 주석·docstring·identifier와 코드 token 사이의 통계적 관계를 매개변수에 반영했다.

논문은 GPT-3 초기값에서 시작한 모델과 scratch에서 학습한 모델도 비교했다. GPT-3 초기화는 수렴을 빠르게 했지만 최종 성능 개선은 관찰되지 않았다. 따라서 Codex의 결과를 GPT-3가 이미 가진 일반 추론 능력을 그대로 코드에 옮긴 결과로만 설명할 수 없다. 코드 자료, 학습량, tokenizer와 평가 절차가 함께 바뀌었다.

### Docstring에서 함수 body를 표본 추출한다

HumanEval prompt에는 함수 header, signature와 자연어 docstring이 들어간다. 모델은 이 prefix 뒤에 올 Python token을 차례로 표본 추출한다. 새 함수나 class가 시작되는 문자열 등을 만나면 생성을 멈추고, 완성된 후보를 격리된 실행 환경에서 unit test에 대입한다.

한 번만 생성하면 모델의 가장 흔한 실패가 그대로 결과가 된다. 여러 번 생성하면 서로 다른 후보 가운데 맞는 구현이 하나 이상 나올 가능성이 커진다. 이때 sampling temperature를 높이면 개별 후보의 안정성은 낮아질 수 있지만 후보 집합의 다양성은 커질 수 있다. 논문은 pass@1과 pass@100에 유리한 temperature가 같지 않음을 보였다.

### 생성, 선택과 검증은 서로 다른 단계다

여러 후보를 만들었다고 자동으로 사용 가능한 답 하나를 얻는 것은 아니다. Unit test를 모두 알고 있으면 통과 후보를 고를 수 있지만, 실제 autocomplete에서는 완전한 test가 없거나 사용자에게 후보 하나만 보여 줘야 할 수 있다.

연구진은 여러 후보 가운데 평균 token log-probability가 가장 높은 하나를 고르는 방법도 시험했다. 이 방법은 무작위 선택보다 나았지만, unit test로 정답을 아는 oracle 선택에는 미치지 못했다. **생성 가능성, 정답 후보의 존재와 배포 시 선택 가능성은 서로 다른 측정값**이다.

### 연구 모델과 제품을 구분한다

논문은 초기에 연구한 Codex 모델의 후손이 GitHub Copilot과 OpenAI API의 Codex model을 구동한다고 설명하면서도, Copilot에는 **별도의 production version**이 쓰인다고 명시했다. GitHub의 2021년 technical preview는 편집 중인 코드 문맥에서 줄이나 함수 제안을 제공하고 Python·JavaScript·TypeScript·Ruby·Go에서 특히 잘 작동한다고 제품 범위를 설명했다.

이 제품 설명을 논문의 12B Python 연구 checkpoint와 동일한 구조·자료·성능으로 옮길 수는 없다. 현행 동명 Codex 제품도 2021년 연구 모델군과 같은 대상으로 간주하지 않는다. 이름이 같아도 모델, 도구 interface와 실행 권한의 근거는 시기별 1차 자료로 따로 확인해야 한다.

## 3단계 — 기술과 근거

### Python 자료와 학습 조건

연구진은 2020년 5월 시점의 공개 GitHub software repository 5,400만 개에서 1MB 미만의 중복 제거된 Python 파일 179GB를 모았다. 자동 생성으로 보이는 파일, 평균 줄 길이가 100자를 넘거나 최대 줄 길이가 1,000자를 넘는 파일, 영숫자 비율이 낮은 파일을 제거해 최종 159GB를 사용했다.

연구 모델은 12M부터 12B까지 여러 규모로 만들고 최대 1,000억 token을 학습했다. Context window는 4,096 token이었다. GPT-3 tokenizer에 여러 길이의 공백 run을 나타내는 token을 더하자 코드를 약 30% 적은 token으로 표현할 수 있었다. 이 변경은 Python의 들여쓰기를 더 효율적으로 나타내지만 프로그램 구조를 명시적 추상 구문 트리로 분석한다는 뜻은 아니다.

“공개 repository”는 “모두 제한 없는 허가로 재사용 가능한 코드”와 동의어가 아니다. 논문은 정확한 training set을 공개하지 않았고, 생성물이 training data와 비슷해질 때의 저작권·license 문제를 broader impact의 쟁점으로 남겼다.

### HumanEval은 무엇을 측정했는가

HumanEval은 연구진이 직접 작성한 164개 Python programming problem으로 구성됐다. 각 문제에는 function signature, docstring, 기준 구현과 여러 unit test가 있으며 문제당 test는 평균 7.7개였다. 과제는 언어 해석, algorithm과 간단한 수학을 포함했고 일부는 쉬운 coding interview 문제와 비슷했다.

문제를 직접 작성한 이유는 GitHub 규모의 학습 자료에 기존 programming problem과 해답이 들어 있을 가능성을 줄이기 위해서였다. 그러나 handwritten이라는 사실만으로 학습 자료와 의미상 유사한 문제나 구현 관용구가 전혀 없었다고 보장하지는 않는다.

Unit test는 참조 코드와 문자열이 같은지를 묻지 않는다. 서로 다른 algorithm이나 표현을 써도 관측한 입력에서 같은 결과를 내면 통과할 수 있다. 반대로 test가 다루지 않은 입력, 성능, 보안, 외부 상태나 유지보수성은 통과 여부만으로 확인되지 않는다.

### pass@k의 의미와 추정식

문제 하나에서 $n$개 후보를 생성하고 그중 $c$개가 unit test를 통과했다고 하자. 그 후보 가운데 복원 없이 $k$개를 고를 때 하나 이상이 맞을 확률의 불편 추정량은 다음과 같다.

$$
\operatorname{pass@}k
=1-\frac{\binom{n-c}{k}}{\binom{n}{k}}
$$

$n-c<k$이면 실패 후보만 $k$개 고를 수 없으므로 값은 1이다. 이 지표는 표본 집합 안에 정답이 있는지를 측정한다. 사용자가 정답 후보를 알아볼 수 있는지, test 없이 하나를 골라야 하는지나 생성 비용이 허용되는지는 별도 조건이다.

논문의 Table 1은 Codex-12B에 다음 값을 보고했다.

| 모델 | pass@1 | pass@10 | pass@100 |
|---|---:|---:|---:|
| Codex-12B | 28.81% | 46.81% | 72.31% |

초록은 100 samples per problem에서 70.2%를 해결했다고 별도로 적는다. Table 1의 72.31%와 초록의 70.2%는 같은 숫자로 평균하거나 한쪽을 다른 쪽의 오기로 고치지 않는다. 논문 안의 locator와 평가 집계가 달리 보고한 값이므로 **초록 70.2%, Table 1 Codex-12B pass@100 72.31%**로 위치를 붙여 보존한다.

### Codex-S의 세 수치는 같은 pass@k 열이 아니다

연구진은 올바르게 구현된 독립 함수 자료로 Codex를 추가 지도 미세조정해 Codex-S를 만들었다. Figure 1의 37.7%, 44.5%, 77.5%는 차례대로 pass@1·pass@10·pass@100을 나열한 값이 아니라 **서로 다른 생성·선택 조건**이다.

| Codex-S 조건 | HumanEval 해결률 | 선택에 사용한 정보 |
|---|---:|---|
| 문제당 한 표본 생성 | 37.7% | 첫 표본 자체 |
| 문제당 100개를 생성하고 평균 log-probability가 가장 높은 하나를 선택 | 44.5% | 모델 확률, unit-test 정답 정보 없음 |
| 문제당 100개를 생성하고 unit test를 통과하는 표본을 선택 | 77.5% | test를 아는 oracle 선택 |

77.5%는 모델이 한 번에 그 비율만큼 맞혔다는 뜻도, 실제 IDE가 100개를 항상 실행해 정답을 돌려준다는 뜻도 아니다. 44.5%와 77.5%의 차이는 좋은 후보를 **만드는 능력**과 정답을 **식별하는 절차** 사이의 간격을 보여 준다.

### 문자열 중첩과 기능 정확성은 다르게 움직였다

연구진은 Codex-12B가 만든 HumanEval 후보를 참조 구현과 BLEU로도 비교했다. 일부 문제에서 unit test를 통과한 후보와 실패한 후보의 BLEU 분포가 크게 겹쳤고, 기능적으로 틀린 코드가 더 높은 BLEU를 받는 경우도 있었다.

이 결과는 BLEU가 모든 코드 평가에 무용하다는 보편 결론이 아니다. HumanEval의 독립 함수 합성에서는 참조와의 token 중첩보다 실행 결과가 핵심 목표였고, 따라서 [[자동 평가 지표는 무엇을 보상하는가|평가 지표가 보상하는 대상]]을 과제와 맞춰야 한다는 근거다.

### 논문이 직접 확인한 추가 범위

연구는 APPS의 full-program 문제, 코드에서 docstring을 생성하는 역방향 과제와 명세 복잡도에 따른 실패도 살폈다. 긴 연산 사슬을 요구하거나 연산을 올바른 변수에 결합해야 하는 synthetic task에서는 명세가 길어질수록 성능이 저하됐다. 이는 짧은 함수 성공을 복잡한 software architecture 이해로 확대하지 않아야 할 근거다.

논문의 안전·경제 절은 실제 대규모 생산성 실험 결과가 아니라 잠재 영향과 위험에 대한 분석이다. 연구진은 insecure code, 유해한 주석, 사용자 의도와 어긋난 출력, malware 개발에 대한 영향을 검토했으며, 당시 모델이 malware 개발의 진입 장벽을 실질적으로 낮춘다는 결론은 내리지 않았다.

## 검증과 한계

### raw 설명의 검증 정정

- **Codex는 2021년 8월에 처음 등장했다:** OpenAI의 공개 발표는 8월 10일이지만 연구 논문 초판은 7월 7일 제출됐고 GitHub Copilot technical preview는 6월 29일 발표됐다. 논문·제품 preview·API 발표의 날짜를 하나의 최초 시점으로 합치지 않는다.
- **Codex는 175B GPT-3를 코드로 미세조정한 단일 모델이다:** 논문이 평가한 Codex 계열은 12M–12B다. GPT-3 초기값은 수렴을 빠르게 했지만 scratch 대비 최종 성능 향상은 관찰되지 않았다.
- **연구 모델은 여러 programming language를 폭넓게 학습·평가했다:** 논문의 공개 training 구성과 주 평가는 Python에 집중됐다. Copilot production version의 다언어 제품 설명은 연구 checkpoint의 동일한 실험 결과가 아니다.
- **Codex가 코드 이해·설명·수정·언어 간 번역과 test 생성을 모두 입증했다:** 주 benchmark는 docstring에서 독립 Python 함수 생성이다. 일부 APPS·docstring generation 실험을 전체 software development 능력으로 확대하지 않는다.
- **Syntactically plausible한 출력은 code semantics를 이해했다는 증거다:** HumanEval의 unit-test 통과는 관측한 함수 동작의 근거다. 모든 입력의 의미적 동등성이나 시스템 수준 이해를 보장하지 않는다.
- **Copilot 통합이 생산성 향상, 오류 감소와 빠른 onboarding을 입증했다:** 2021년 논문과 발표는 제품 interface와 가능성을 제시했지만 이러한 조직·사용자 효과를 통제 실험으로 측정하지 않았다.
- **Codex가 수학·법률·과학 특화 모델로 이어지는 원리를 확립했다:** 영역 특화라는 비교 관점은 가능하지만, 다른 분야 모델의 직접 영향 계보는 각각의 1차 자료가 필요하다.

### 기능 평가가 보장하지 않는 것

HumanEval은 짧은 독립 함수와 제한된 unit test에 집중한다. 실제 software engineering에는 repository 구조, dependency, build 환경, 상태 변화, 비기능 요구사항과 여러 사람의 검토가 들어간다. Pass@k가 높아져도 이 조건들이 자동으로 충족되지는 않는다.

또한 pass@k는 sampling budget과 temperature에 민감하다. 679M 모델의 분석에서는 pass@1에 $T=0.2$, pass@100에 $T=0.8$이 유리했다. 서로 다른 $k$의 최고값은 모델 하나의 고정된 decoding 조건을 비교한 것이 아닐 수 있으므로, 표본 수·temperature·선택 규칙을 점수와 함께 기록해야 한다.

### 코드 실행과 신뢰의 경계

생성 코드는 문법적으로 맞아 보여도 논리 오류나 취약점을 포함할 수 있다. 논문은 평가 코드를 sandbox에서 실행했고, production 사용에서는 qualified operator가 결과를 검토해야 한다고 경고했다. Unit test가 있다는 사실도 test 자체의 누락이나 악성 동작을 제거하지 않는다.

Training data에는 보안상 좋지 않은 관행, 편향된 주석과 여러 license의 코드가 섞일 수 있다. 모델 출력이 training example을 어느 정도 재현하는지, attribution과 license 의무가 어떻게 적용되는지는 논문이 해결한 문제가 아니다. 공개 접근 가능성과 법적·윤리적으로 제한 없는 재사용을 동일시하지 않는다.

### 세 가지 Codex를 섞지 않는다

이 문서의 **연구 Codex**는 Chen 등이 구조와 HumanEval 결과를 보고한 초기 모델군이다. **2021년 production Codex**는 GitHub Copilot과 OpenAI API에 쓰인 별도 후속 버전이며 공개 논문만으로 상세 구조를 알 수 없다. **현행 동명 Codex**도 별도 근거가 필요한 후대 제품이므로 2021년 pass@k를 현재 제품 성능으로 인용할 수 없다.

따라서 “Codex”를 쓸 때에는 연도, 연구 checkpoint인지 제품인지, 단일 completion인지 도구를 포함한 system인지 밝히는 편이 안전하다. 이 구분은 초기 연구 성과를 축소하는 것이 아니라 서로 다른 증거가 답하는 질문을 정확히 보존한다.

## 학습 확인

### 확인 질문

1. Codex의 코드 계속학습은 GPT-3식 문맥 내 학습과 무엇이 다른가?
2. Codex-S의 37.7%, 44.5%, 77.5%를 같은 pass@1·10·100 열로 읽으면 안 되는 이유는 무엇인가?
3. HumanEval pass@k가 높아도 실제 software engineering 생산성과 안전성을 보장하지 않는 이유는 무엇인가?

### 다음 문서

- [[concept.openai-codex-2021|OpenAI Codex (2021)]] — 코드 영역 계속학습, 함수 생성과 연구 모델의 경계를 재사용 가능한 개념으로 정리한다.
- [[analysis.평가-지표와-모델-유인|자동 평가 지표는 무엇을 보상하는가]] — 참조 문자열 중첩과 unit-test 기능 정확성이 서로 다른 출력을 보상하는 이유를 비교한다.

## 출처

- Mark Chen 외, [Evaluating Large Language Models Trained on Code](https://arxiv.org/abs/2107.03374), 2021, 특히 초록, §§1–7, Figures 1·4–8, Tables 1–3과 Appendices A·C–H.
- Wojciech Zaremba·Greg Brockman, [OpenAI Codex](https://openai.com/index/openai-codex/), 2021-08-10, 자연어-코드 demo·API 공개와 Copilot용 production model 설명.
- Nat Friedman, [Introducing GitHub Copilot: your AI pair programmer](https://github.blog/news-insights/product-news/introducing-github-copilot-ai-pair-programmer/), 2021-06-29, technical preview의 Codex 기반·편집기 문맥·지원 언어 설명.
- 프로젝트 번역·검토 출발 자료: [Codex: AI-Assisted Code Generation and the Transformation of Software Development](https://mbrenndoerfer.com/writing/codex-ai-assisted-code-generation-transformation-software-development).
- 프로젝트 보존 자료: `raw/071_Codex AI-Assisted Code Generation and the Transformation of Software Development.ko.md`, `raw/071_Codex AI-Assisted Code Generation and the Transformation of Software Development.commentary.ko.md`.

## 관련 항목

- [[concept.openai-codex-2021|OpenAI Codex (2021)]]
- [[analysis.평가-지표와-모델-유인|자동 평가 지표는 무엇을 보상하는가]]
- [[source.067|GPT-3와 문맥 내 학습]]
- [[concept.자기회귀-생성|자기회귀 생성]]
- [[concept.언어-모델-전이-학습|언어 모델 전이 학습]]
- [[analysis.사전-학습-지식은-과제에-어떻게-도착하는가|사전 학습 지식은 과제에 어떻게 도착하는가]]
