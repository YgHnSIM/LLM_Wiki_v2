---
schema_version: 2
id: concept.openai-codex-2021
page_type: concept
title: 'OpenAI Codex (2021)'
aliases:
  - Codex-12B
  - Codex-S
  - 2021 Codex code model
  - OpenAI Codex 2021 code model
tags:
  - type/concept
  - domain/ai
  - domain/computer-science
  - domain/human-computer-interaction
  - domain/machine-learning
  - domain/nlp
created: '2026-07-21'
updated: '2026-07-21'
lifecycle: active
verification: verified
artifacts:
  - 'raw/071_Codex AI-Assisted Code Generation and the Transformation of Software Development.ko.md'
  - 'raw/071_Codex AI-Assisted Code Generation and the Transformation of Software Development.commentary.ko.md'
evidence:
  - source_id: chen-et-al-2021-codex
    locator: '초록과 §1·Figure 1의 연구 모델–production version 구분, §§2.1–2.3·Equation 1·Figure 3의 HumanEval·pass@k·sandbox, §§3.1–3.3·Figures 4–8·Table 1의 Python 자료·미세조정·Codex-12B 평가, §4·Figures 9–10의 Codex-S, §§6–8과 Appendices A·F–G의 한계·위험·선행 연구'
    relation: supports
  - source_id: openai-2021-codex
    locator: '2021-08-10 발표의 GPT-3 descendant·공개 source code 학습·지원 언어·14KB Python context·API와 GitHub Copilot 제품 설명 및 페이지 상단의 2023년 구형 model 폐기·2025년 동명 agent 안내'
    relation: supplements
  - source_id: github-2021-copilot-preview
    locator: '2021-06-29 technical preview 발표의 OpenAI Codex 기반·편집기 문맥·줄과 함수 제안·Python·JavaScript·TypeScript·Ruby·Go 제품 범위'
    relation: contextualizes
related:
  - source.071
  - source.067
  - concept.언어-모델-전이-학습
  - concept.자기회귀-생성
  - analysis.평가-지표와-모델-유인
  - analysis.사전-학습-지식은-과제에-어떻게-도착하는가
---
# OpenAI Codex (2021)

> [!note] 학습 안내
> **난이도:** 중급<br>
> **선수 지식:** [[언어 모델 전이 학습]], [[자기회귀 생성]]<br>
> **읽고 나면:** 2021년 연구 Codex 모델군의 코드 영역 미세조정과 HumanEval 평가를 설명하고, Codex-12B·Codex-S·Copilot용 production version·현행 동명 제품을 구분할 수 있다.

## 1단계 — 먼저 잡을 핵심

### 한 문장 정의

OpenAI Codex (2021)는 GPT 계열 자기회귀 언어 모델을 공개 GitHub 코드 분포에 계속 학습해, 자연어 docstring과 함수 signature 뒤의 Python 구현을 생성하도록 만든 연구 모델군이다. 2021년 논문은 최대 12B 매개변수의 **Codex-12B**, 독립 함수 과제에 추가 지도 미세조정한 **Codex-S**, 그리고 실행 가능한 후보를 평가하는 HumanEval과 pass@$k$를 함께 보고했다.

### 먼저 구분할 세 대상

이 문서의 **연구 Codex 모델군**은 Chen 등이 학습 자료와 HumanEval 결과를 공개한 초기 모델이다. 논문은 그 후손이 GitHub Copilot과 OpenAI API를 구동한다고 설명하면서도, Copilot에는 별도의 production version이 쓰였다고 명시했다. 따라서 연구용 Codex-12B의 Python 결과를 2021년 Copilot 제품 모델의 구조나 다언어 성능으로 옮길 수 없다.

OpenAI의 같은 공식 페이지는 2021년 API model이 2023년 3월 폐기됐고, 2025년 4월 Codex CLI와 5월 cloud-based software engineering agent에 이름을 다시 사용했다고 안내한다. 이 후대 에이전트형 개발 제품은 이 문서의 대상이 아니다. 같은 이름은 같은 checkpoint·학습 자료·도구 권한·평가 결과를 뜻하지 않으므로, 연도와 연구 모델·제품 모델·도구 포함 system 가운데 무엇을 가리키는지 함께 적어야 한다.

### 왜 중요한가

2021년 연구는 일반 텍스트 중심 GPT 계열을 코드 분포에 적응시키는 경로와, 생성된 프로그램을 참조 문자열이 아니라 실행 결과로 평가하는 경로를 한 사례에서 보여 준다. 동시에 높은 pass@$k$가 단일 completion의 신뢰성이나 실제 software engineering 생산성과 같은 값이 아니라는 평가 경계도 드러낸다.

## 2단계 — 작동 원리

### 코드 영역 미세조정

Codex-12B까지의 연구 모델은 [[자기회귀 생성|다음 token 예측]] 목적을 유지하면서 학습 분포를 Python 코드로 옮겼다. Prompt에는 함수 header·signature·docstring이 놓이고, 모델은 그 뒤에 올 함수 body를 왼쪽에서 오른쪽으로 생성한다. 코드 전용 정적 분석기나 추상 구문 트리를 실행하는 구조가 아니라, 주석·이름·들여쓰기·코드 token의 조건부 분포를 신경망 매개변수로 학습한 생성 모델이다.

연구진은 GPT-3 계열의 초기값을 사용했지만, 코드 자료가 매우 컸기 때문에 scratch 학습보다 최종 성능이 높아지는 효과는 관찰하지 못했다. GPT 초기값은 수렴을 빠르게 했다. 따라서 2021년 연구 Codex의 성능을 GPT-3의 추론 능력이 그대로 이전된 결과로만 설명하지 않고, 코드 자료·학습량·tokenizer 변경을 함께 본다.

### Codex-S의 추가 단계

일반 GitHub Python에는 함수뿐 아니라 class·설정·script·자료 파일이 섞여 있다. 연구진은 HumanEval과 더 비슷한 분포로 적응시키기 위해, 올바르게 구현된 독립 함수와 문제 설명을 별도로 구성하고 Codex 계열을 한 번 더 지도 미세조정했다. 이 두 번째 단계의 모델군이 Codex-S다.

Codex-S는 새로운 architecture가 아니라 **코드 영역 계속학습 뒤 과제 분포에 더 가까운 감독 자료를 추가한 단계**다. 논문은 programming contest·interview 자료 약 10,000개와 CI 실행 추적으로 얻은 함수 문제 약 40,000개를 설명한다. 이 구성은 짧은 독립 함수 합성에 맞춘 것이며, 전체 repository 수정 능력을 직접 학습하거나 검증한 절차는 아니다.

### 생성·실행·선택

1. 함수 signature와 자연어 docstring을 prompt로 만든다.
2. Temperature와 nucleus sampling을 사용해 하나 이상의 Python 후보를 생성한다.
3. 생성 후보를 sandbox에서 실행하고 HumanEval의 unit test 통과 여부를 기록한다.
4. 후보가 여러 개이면 적어도 하나가 통과하는지 계산하거나, 실제 배포처럼 하나만 반환해야 할 때는 별도의 ranking 규칙을 사용한다.

후보 집합에 정답이 존재하는 것과 test 없이 정답 하나를 골라내는 것은 다른 문제다. Pass@$k$는 전자에 가깝고, 평균 token log-probability로 하나를 고르는 실험은 후자의 제한된 근사다.

## 3단계 — 기술과 근거

### Python 자료·모델·tokenizer

연구진은 2020년 5월의 공개 GitHub software repository 5,400만 개에서 1MB 미만의 중복 제거된 Python 파일 179GB를 모았다. 자동 생성 가능성, 과도하게 긴 줄과 낮은 영숫자 비율을 기준으로 걸러 최종 159GB를 사용했다. 연구 모델은 12M에서 12B 매개변수까지 만들었고 최대 1,000억 token을 학습했다.

GPT-3 tokenizer에 여러 길이의 연속 공백을 나타내는 token을 추가하자 코드를 약 30% 적은 token으로 표현할 수 있었다. 이는 들여쓰기를 더 효율적으로 부호화하는 변경이지 Python 문법과 의미를 항상 올바르게 분석한다는 보장은 아니다.

### HumanEval과 pass@k

HumanEval은 사람이 새로 작성한 독립 Python 함수 문제 164개로 구성됐다. 각 문제에는 function signature·docstring·기준 구현과 여러 unit test가 있고, 문제당 test는 평균 7.7개였다. Handwritten 구성은 GitHub에 이미 공개된 문제와 해답을 그대로 재사용할 위험을 낮추지만, 의미상 비슷한 관용구까지 학습 자료에서 완전히 배제했다는 증명은 아니다.

문제 하나에서 $n$개 후보를 만들고 $c$개가 test를 통과했을 때, 논문은 다음 불편 추정량을 문제 전체에 평균했다.

$$
\operatorname{pass@}k
=\mathbb{E}_{\text{problems}}
\left[
1-\frac{\binom{n-c}{k}}{\binom{n}{k}}
\right]
$$

논문의 주 평가는 문제마다 $n=200$개를 생성하고 $k\leq100$을 계산했다. $k$가 커질수록 다양한 후보가 유리해지므로, Codex 계열 분석은 pass@1에 temperature 0.2, pass@100에 0.8을 사용했다. 서로 다른 $k$의 최고값은 고정 decoding 조건에서 나온 단일 정확도 곡선이 아니다.

Table 1의 Codex-12B 결과는 pass@1 28.81%, pass@10 46.81%, pass@100 72.31%다. 이 가운데 72.31%는 100개 후보를 만들 수 있고, test를 아는 oracle이 그중 통과 후보의 존재를 판별한다는 평가다. 모델의 첫 출력 하나가 72.31% 맞았다는 뜻이 아니다.

논문 초록은 같은 100 samples per problem을 70.2%로 별도 요약하지만, v1과 v2 모두 이 값과 Table 1의 72.31% 차이를 설명하지 않는다. 재현 조건을 적을 때에는 **Table 1의 Codex-12B pass@100 72.31%**를 모델·temperature·불편 추정식과 함께 쓰고, 초록의 70.2%를 같은 값으로 섞거나 임의로 오기라고 판정하지 않는다.

### Codex-S 수치를 읽는 법

Figure 1은 temperature 0.8에서 Codex-S-12B의 서로 다른 생성·선택 조건을 비교한다.

| 조건 | HumanEval 해결률 | test 정답 정보 |
| --- | ---: | --- |
| 한 표본 생성 | 37.7% | 사용하지 않음 |
| 100개 중 평균 log-probability가 가장 높은 하나 선택 | 44.5% | 사용하지 않음 |
| 100개 중 unit test를 통과하는 표본 선택 | 77.5% | oracle이 사용 |

37.7%·44.5%·77.5%는 pass@1·pass@10·pass@100을 차례로 적은 표가 아니다. 특히 77.5%는 추가 지도 미세조정한 Codex-S-12B의 test-oracle 조건이며, Table 1의 기본 Codex-12B pass@100 72.31%와 모델도 다르다. §4.5에서 Codex-S의 pass@100 최적 temperature를 1로 계산한 분석도 Figure 1의 고정 temperature 0.8 선택 실험과 구분한다.

### 문자열 중첩에서 실행 평가로

기능 정확성(functional correctness)은 생성 코드가 정해진 unit test를 통과하는지를 본다. 참조 구현과 token 배열이 달라도 같은 관측 동작을 보이면 통과할 수 있다. 실제로 Codex-12B 후보에서는 맞은 코드와 틀린 코드의 BLEU 분포가 크게 겹쳐, 참조 문자열 중첩과 실행 성공이 같은 순서로 움직이지 않았다.

그러나 unit test 통과도 완전한 의미 동등성이 아니다. Test가 포함하지 않은 입력, 계산 효율, 보안, 외부 상태, dependency, 유지보수성과 전체 system 통합은 HumanEval 점수만으로 확인되지 않는다.

### 연구 발표와 제품 연표

GitHub는 2021년 6월 29일 Copilot technical preview를 발표하며 OpenAI Codex 기반의 줄·함수 제안을 설명했다. Codex 논문 초판은 7월 7일 제출됐고, OpenAI는 8월 10일 Codex API private beta를 발표했다. 따라서 “8월에 연구 모델이 먼저 소개되고 그 뒤 Copilot에 통합됐다”는 순서는 맞지 않는다.

OpenAI의 8월 제품 발표는 GPT-3 descendant, 공개 source code 수십억 줄, Python이 가장 강하지만 12개가 넘는 언어 지원, Python 기준 14KB context를 설명했다. 반면 논문의 공개 학습 구성과 주 평가는 Python 연구 모델에 집중한다. 제품 발표의 다언어 범위와 연구용 12B checkpoint의 HumanEval 수치를 한 모델의 검증 결과처럼 결합하지 않는다.

## 검증과 한계

### 확인된 범위

2021년 논문으로 직접 확인되는 핵심은 코드 영역 미세조정, 독립 Python 함수 생성, HumanEval의 실행 평가와 Codex-S의 추가 감독학습이다. 논문은 긴 연산 사슬과 여러 변수에 연산을 올바르게 결합하는 명세에서 성능이 빠르게 낮아지고, 문법 오류·정의되지 않은 심벌·범위를 벗어난 호출이 생길 수 있다고 보고했다.

APPS의 full-program 문제에서는 HumanEval보다 훨씬 낮은 결과가 나왔다. 그러므로 짧은 함수 benchmark의 성공을 여러 파일·build 환경·장기 상태를 포함하는 software architecture 이해로 확대하지 않는다.

### 평가와 안전 경계

생성 코드는 신뢰할 수 없는 프로그램이다. 연구진은 gVisor와 network firewall을 포함한 sandbox에서 평가했고, 배포 환경에서는 자격을 갖춘 사람이 실행 전 결과를 검토해야 한다고 경고했다. Unit test 통과는 악성 동작, 취약한 API 사용과 숨은 논리 오류가 없다는 보증이 아니다.

학습 자료에는 취약한 관행·편향된 주석·비밀정보와 여러 license의 코드가 포함될 수 있다. 논문의 동일 문자열 분석과 법적 논의는 제한된 예비 분석이며, 공개 접근 가능한 코드가 제한 없는 재사용 허가를 뜻하거나 저작권·license 문제가 해결됐다는 판정이 아니다.

### 이름과 영향의 경계

2021년 Copilot 발표는 편집기 문맥에서 코드 제안을 제공하는 제품 interface를 확인하지만, 생산성 향상·오류 감소·교육 효과를 통제 실험으로 입증하지는 않았다. 이 효과를 쓰려면 후대 사용자 연구의 과제·표본·측정 조건을 별도 근거로 붙여야 한다.

프로그램 합성, code language model과 autocomplete는 2021년 연구보다 앞서 존재했다. 역사적 의미는 최초 발명보다 대형 GPT 계열의 코드 특화, 실행 기반 benchmark와 대중적 편집기 제품을 같은 시기에 가시화했다는 데 둔다. 수학·법률·과학 특화 모델이 2021년 연구 Codex에서 직접 파생됐다는 계보 역시 각 분야의 1차 자료 없이는 확정하지 않는다.

## 학습 확인

### 확인 질문

1. 연구용 Codex-12B의 코드 영역 미세조정과 Codex-S의 추가 지도 미세조정은 자료 분포에서 어떻게 다른가?
2. Codex-12B의 pass@100 72.31%와 Codex-S-12B의 77.5%는 모델·표본 생성·선택 조건에서 어떻게 다른가?
3. HumanEval unit test를 통과해도 실제 repository 수정의 정확성·보안·생산성이 보장되지 않는 이유는 무엇인가?

### 다음 문서

- [[071_Codex와 HumanEval 기반 코드 생성 평가]] — 연구 결과와 raw 서사의 정정, 제품 연표를 1차 근거 locator에 따라 확인한다.
- [[자동 평가 지표는 무엇을 보상하는가]] — 문자열 중첩과 실행 기반 pass@$k$가 각각 어떤 출력을 보상하는지 비교한다.

## 출처

- [[071_Codex와 HumanEval 기반 코드 생성 평가]]
- Mark Chen 외, [Evaluating Large Language Models Trained on Code](https://arxiv.org/abs/2107.03374), 2021, 특히 초록, §§1–4·6–8, Equation 1, Figures 1·3–10, Table 1과 Appendices A·F–G.
- Wojciech Zaremba·Greg Brockman, [OpenAI Codex](https://openai.com/index/openai-codex/), 2021-08-10, GPT-3 descendant·학습 자료·지원 언어·context·API·Copilot 제품 설명과 페이지 상단의 2023년 구형 model 폐기·2025년 동명 agent 안내.
- Nat Friedman, [Introducing GitHub Copilot: your AI pair programmer](https://github.blog/news-insights/product-news/introducing-github-copilot-ai-pair-programmer/), 2021-06-29, technical preview의 Codex 기반·편집기 문맥·지원 언어 설명.
- 프로젝트 보존 자료: `raw/071_Codex AI-Assisted Code Generation and the Transformation of Software Development.ko.md`, `raw/071_Codex AI-Assisted Code Generation and the Transformation of Software Development.commentary.ko.md`.

## 관련 항목

- [[071_Codex와 HumanEval 기반 코드 생성 평가]]
- [[067_GPT-3와 문맥 내 학습]]
- [[언어 모델 전이 학습]]
- [[자기회귀 생성]]
- [[자동 평가 지표는 무엇을 보상하는가]]
- [[사전 학습 지식은 과제에 어떻게 도착하는가]]
