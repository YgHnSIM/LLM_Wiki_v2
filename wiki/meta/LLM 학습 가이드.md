---
schema_version: 3
id: meta.learning-guide
page_type: meta
title: LLM 학습 가이드
aliases:
  - LLM Wiki 학습 가이드
  - LLM learning guide
  - LLM 준전문가 학습 경로
tags:
  - type/meta
created: '2026-07-25'
updated: '2026-07-25'
editorial_status: active
review:
  evidence_coverage: not-applicable
  content_mode: descriptive
artifacts: []
evidence: []
relations:
  - target: analysis.llm을-만든-수학
    kind: related
  - target: meta.llm-computing-coevolution
    kind: related
  - target: meta.llm-system-boundary-map
    kind: related
  - target: analysis.llm-capability-model-or-system
    kind: related
---
# LLM 학습 가이드

> [!note] 사용 방법
> **대상:** LLM을 처음 체계적으로 배우는 독자부터 기존 지식을 검증하며 넓히려는 독자까지.<br>
> **이 가이드가 하는 일:** 짧은 진단으로 출발점을 제안하고, 읽기·산출물·통과 기준·복귀 경로를 한 단위로 묶는다.<br>
> **완료의 뜻:** 문서를 방문한 것이 아니라, 새 사례를 설명·계산·감사하는 산출물을 만들고 기준을 확인한 상태다.

이 위키에는 개념, 원문 노트, 비교 읽기, 수학·역사·시스템 허브가 많다. 그래서 처음에는 “무엇을 먼저 읽어야 하는가”보다 “읽은 뒤 무엇을 할 수 있어야 하는가”를 먼저 정한다. 이 가이드는 링크 모음이 아니라 다음의 반복이다.

```text
현재 혼동 진단 → 필요한 최소 읽기 → 직접 해보는 산출물
→ 통과 기준 확인 → 틀렸을 때 owner로 복귀 → 새 사례에 적용
```

모든 길은 열려 있다. 진단 결과나 진행률은 다음 문서를 막지 않으며, 이 페이지는 로그인·서버 전송·개인정보 수집을 하지 않는다. 브라우저의 저장 기능을 쓸 수 있으면 선택한 경로와 스스로 확인한 완료 단위만 이 기기 안에 저장한다. 저장 기능이 없거나 JavaScript를 끈 경우에도 아래의 수동 진단표·경로표·학습 기록 카드를 그대로 사용할 수 있다.

## 이 과정을 마치면 할 수 있는 일

이 가이드에서 말하는 **준전문가**는 특정 모델을 외우는 사람이 아니다. 처음 보는 LLM 주장도 다음 네 관점으로 읽고, 어디까지 말할 수 있는지 판정하는 사람이다.

1. token에서 확률·손실·gradient·갱신으로 이어지는 계산을 입력·shape·가정과 함께 설명한다.
2. 문헌이 확인한 사실, 위키의 비교 해석, 직접 증거가 없는 계보를 구분하고 locator를 찾아 되짚는다.
3. model·checkpoint·runtime·service와 외부 효과의 승인·실행·확정 상태를 같은 결과로 섞지 않는다.
4. 연구·제품·데모 주장을 지표의 분모, 비교 조건, 실패·복구 경계까지 포함해 한 페이지로 감사한다.

이것은 “모든 LLM 내부를 안다”거나 “제품 성능을 예측한다”는 뜻이 아니다. 공개 근거와 현재 조건 밖에서는 어떤 결론이 남는지 표시하는 능력이 목표다.

## 3분 출발 진단

아래 여덟 문항은 시험이나 선발이 아니다. 각 축에서 막힐 가능성이 높은 지점을 보여 주고, 그 지점을 설명하는 owner로 돌아갈 길을 제안한다. 답을 고른 뒤 **진단 결과 보기**를 누른다. 결과가 보이지 않으면 바로 다음의 `수동 채점표`에서 정답과 복귀 경로를 확인한다.

<section data-learning-guide class="learning-guide-tools" aria-label="진단과 진행 기록">
<form data-learning-diagnostic novalidate>
  <fieldset data-learning-goal>
    <legend>이번에 가장 먼저 깊게 다루고 싶은 축은 무엇인가?</legend>
    <label><input type="radio" name="learning-goal" value="undecided" data-learning-goal checked> 아직 모르겠다 — 공통 코어 뒤에 비교하고 고르기</label>
    <label><input type="radio" name="learning-goal" value="math" data-learning-goal> 수학·모델 계산</label>
    <label><input type="radio" name="learning-goal" value="history" data-learning-goal> 역사·근거 읽기</label>
    <label><input type="radio" name="learning-goal" value="systems" data-learning-goal> 시스템·평가</label>
  </fieldset>

  <fieldset data-learning-question="core-1">
    <legend>1. 기본적인 LLM이 현재 문맥 뒤에 직접 만드는 것은 무엇인가?</legend>
    <label><input type="radio" name="core-1" value="single-factual-answer" data-learning-answer="single-factual-answer"> 하나의 사실 답을 바로 확정한다.</label>
    <label><input type="radio" name="core-1" value="next-token-distribution" data-learning-answer="next-token-distribution"> 후보 token에 대한 다음 token 분포를 계산하고, 그 뒤 선택 규칙이 출력을 정한다.</label>
    <label><input type="radio" name="core-1" value="committed-tool-effect" data-learning-answer="committed-tool-effect"> 외부 도구의 확정된 효과를 바로 만든다.</label>
  </fieldset>

  <fieldset data-learning-question="core-2">
    <legend>2. “이 모델은 문제를 풀었다”는 문장을 처음 검토할 때 가장 먼저 분리할 것은 무엇인가?</legend>
    <label><input type="radio" name="core-2" value="model-size-only" data-learning-answer="model-size-only"> 모델 이름과 파라미터 수만 확인한다.</label>
    <label><input type="radio" name="core-2" value="demo-is-general" data-learning-answer="demo-is-general"> 데모 화면이 있으면 같은 조건의 모든 과제에서 성공했다고 본다.</label>
    <label><input type="radio" name="core-2" value="separate-claim-conditions" data-learning-answer="separate-claim-conditions"> 입력·조건·평가 단위·출력·보장하지 않는 것을 분리한다.</label>
  </fieldset>

  <fieldset data-learning-question="math-1">
    <legend>3. 행렬곱과 attention 계산에서 shape를 기록하는 가장 직접적인 이유는 무엇인가?</legend>
    <label><input type="radio" name="math-1" value="shape-preserves-axis-meaning" data-learning-answer="shape-preserves-axis-meaning"> 어떤 축이 합쳐지고 남는지와 연산이 정의되는지 확인하기 위해서다.</label>
    <label><input type="radio" name="math-1" value="shape-improves-accuracy" data-learning-answer="shape-improves-accuracy"> 큰 모델의 정확도를 자동으로 높이기 위해서다.</label>
    <label><input type="radio" name="math-1" value="shape-removes-decimals" data-learning-answer="shape-removes-decimals"> 숫자를 소수점 없이 적기 위해서다.</label>
  </fieldset>

  <fieldset data-learning-question="math-2">
    <legend>4. 정답 token의 확률이 너무 낮을 때, NLL을 줄이는 한 SGD update의 설명으로 맞는 것은 무엇인가?</legend>
    <label><input type="radio" name="math-2" value="set-target-to-one" data-learning-answer="set-target-to-one"> target logit만 무조건 1로 고정하면 된다.</label>
    <label><input type="radio" name="math-2" value="gradient-update-direction" data-learning-answer="gradient-update-direction"> 손실을 미분해 매개변수별 변화율을 구하고, 학습률과 부호를 포함해 갱신한다.</label>
    <label><input type="radio" name="math-2" value="probability-sum-ends-learning" data-learning-answer="probability-sum-ends-learning"> 확률의 합이 1이면 학습은 끝난다.</label>
  </fieldset>

  <fieldset data-learning-question="history-1">
    <legend>5. 성능·연대·직접 영향 주장을 다시 확인 가능하게 만드는 최소 표기는 무엇인가?</legend>
    <label><input type="radio" name="history-1" value="similar-math" data-learning-answer="similar-math"> 비슷한 수식 하나를 적는다.</label>
    <label><input type="radio" name="history-1" value="locator" data-learning-answer="locator"> 원자료의 논문·절·표·쪽 같은 locator를 적는다.</label>
    <label><input type="radio" name="history-1" value="later-famous" data-learning-answer="later-famous"> 뒤 연구가 더 유명하다고 적는다.</label>
  </fieldset>

  <fieldset data-learning-question="history-2">
    <legend>6. 성능 수치를 다른 연구와 비교하기 전에 반드시 맞춰 읽어야 하는 것은 무엇인가?</legend>
    <label><input type="radio" name="history-2" value="pretty-symbols" data-learning-answer="pretty-symbols"> 수식 기호의 모양만 맞춘다.</label>
    <label><input type="radio" name="history-2" value="guarantees-all-claims" data-learning-answer="guarantees-all-claims"> 발표 연도만 맞춘다.</label>
    <label><input type="radio" name="history-2" value="comparison-conditions" data-learning-answer="comparison-conditions"> 자료·과업·분모·평가 기준·비교 조건을 맞춰 읽는다.</label>
  </fieldset>

  <fieldset data-learning-question="systems-1">
    <legend>7. schema를 통과한 JSON 출력 뒤에 queue·retry·timeout·authorization을 책임지는 층은 무엇인가?</legend>
    <label><input type="radio" name="systems-1" value="runtime" data-learning-answer="runtime"> runtime·service 계약 층이다.</label>
    <label><input type="radio" name="systems-1" value="json-slower" data-learning-answer="json-slower"> JSON 문법 자체다.</label>
    <label><input type="radio" name="systems-1" value="schema-no-tokens" data-learning-answer="schema-no-tokens"> token vocabulary만의 문제다.</label>
  </fieldset>

  <fieldset data-learning-question="systems-2">
    <legend>8. 외부 write 요청 뒤 응답이 사라져 상태가 unknown일 때 가장 먼저 필요한 경계는 무엇인가?</legend>
    <label><input type="radio" name="systems-2" value="model-name-equals-latency" data-learning-answer="model-name-equals-latency"> 같은 요청을 즉시 무제한 재시도한다.</label>
    <label><input type="radio" name="systems-2" value="failure-recovery" data-learning-answer="failure-recovery"> 권위 있는 상태 조회·postcondition·reconciliation과 사람 escalation을 포함한 실패·복구 계약을 확인한다.</label>
    <label><input type="radio" name="systems-2" value="more-gpu-always-faster" data-learning-answer="more-gpu-always-faster"> GPU 수를 늘린 뒤 결과를 성공으로 간주한다.</label>
  </fieldset>

  <button type="submit" data-learning-diagnostic-submit>진단 결과 보기</button>
</form>

<div data-learning-diagnostic-result role="status" aria-live="polite" aria-atomic="true" tabindex="-1"></div>

<label for="learning-primary-track">진단 뒤 주 전공 바꾸기</label>
<select id="learning-primary-track" data-learning-primary-track>
  <option value="undecided">아직 선택하지 않음</option>
  <option value="math">수학·모델 계산</option>
  <option value="history">역사·근거 읽기</option>
  <option value="systems">시스템·평가</option>
</select>

### 수동 채점표와 복귀 경로

JavaScript 없이 읽거나 결과를 다시 확인하려면 다음 표를 쓴다. 각 축의 두 문항 중 0점이면 해당 owner의 첫 단위부터, 1점이면 산출물을 먼저 해 본 뒤 막힌 절로, 2점이면 설명 읽기를 줄인 **도전 모드**로 들어간다. 2점은 공통 코어 면제가 아니라, 새 사례 산출물로 이해를 증명할 기회다.

| 축 | 정답 | 자주 생기는 혼동 | 0점일 때 돌아갈 owner와 재시도 |
| --- | --- | --- | --- |
| 공통 | 1-b, 2-c | 점수=확률, 데모=일반 능력 | [[대규모 언어 모델]]의 입력·출력·한계와 C1 카드 작성 |
| 수학 | 3-a, 4-b | 축을 숨긴 행렬 연산, 확률 합=학습 완료 | [[LLM을 만든 수학]]의 shape 전이와 M1 새 숫자 계산 |
| 역사·근거 | 5-b, 6-c | 수학적 유사성=영향, 수치만 복사 | [[N-gram에서 LLM으로]]의 근거·계보 구분과 H1 locator 찾기 |
| 시스템·평가 | 7-a, 8-b | 형식 준수=권한·확정, 단일 latency=서비스 품질 | [[LLM 시스템 경계 확장 지도]]의 결과 계약과 S1 장부 작성 |

목표를 아직 고르지 못했다면 C1–C3을 끝낸 뒤 아래의 M1·H1·S1을 각각 한 번씩 20분만 시도한다. 가장 덜 답답하고 가장 더 파고 싶은 축을 주 전공으로 고르면 된다.

## 학습 경로를 고르는 법

공통 코어 C1–C3은 누구나 밟는다. 그 다음에는 수학, 역사·근거, 시스템·평가 중 하나를 **주 전공**으로 선택해 세 단위를 완결한다. 나머지 두 축은 교차 과제 하나씩으로 최소 연결을 만든다. 마지막 Z1은 세 관점을 한 주장에 동시에 적용한다.

```text
C1 → C2 → C3
             ├→ M1 → M2 → M3 ─┐
             ├→ H1 → H2 → H3 ─┼→ Z1
             └→ S1 → S2 → S3 ─┘

주 전공이 아닌 두 축은 XM·XH·XS 중 해당 두 교차 과제로 연결한다.
```

필수 완료 단위는 언제나 아홉 개다: C1–C3 세 개, 주 전공 세 개, 다른 두 축의 교차 과제 두 개, Z1 하나. 전공을 바꾸어도 이미 완료한 단위는 지우지 않는다. 바뀌는 것은 “현재 전공에서 필수인 아홉 단위”와 진행률뿐이다.

<div data-learning-progress aria-live="polite" aria-atomic="true"></div>
</section>

### 각 단위를 완료로 표시하는 기준

아래 버튼은 결과를 제출하거나 자동 채점하지 않는다. 산출물을 실제로 만들고 통과 기준을 확인한 뒤에만 스스로 완료로 표시한다. 버튼이 작동하지 않는 환경에서는 끝부분의 `학습 기록 카드`를 복사해 자신의 노트에 표시한다.

## 공통 코어 — 같은 언어로 읽기

### C1 — 계산의 공통 언어

<label class="learning-guide-module-toggle"><input type="checkbox" data-learning-module="C1"> C1을 완료로 표시</label>

**질문:** LLM은 무엇을 입력으로 받아 무엇을 계산하고, 무엇을 보장하지 않는가?

- **최소 읽기:** [[대규모 언어 모델]]의 1·2단계와 [[LLM을 만든 수학]]의 `계산 이야기`·첫 shape 지도.
- **할 일:** 한 문장짜리 prompt를 골라 `입력 / 중간 변환 / 출력 / 보장하지 않는 것` 네 칸 카드를 만든다. token ID와 보이는 글자, 점수와 확률, 출력과 사실을 각각 같은 것으로 쓰지 않는다.
- **통과:** 네 칸에 각각 한 문장 이상이 있고, “확률이 높다”와 “사실이다”가 다른 판단임을 적는다.
- **막히면:** [[대규모 언어 모델]]의 최소 예로 돌아가 token·어휘·다음 token 분포를 말로 먼저 설명한 뒤 카드를 다시 쓴다.

### C2 — 모델과 시스템

<label class="learning-guide-module-toggle"><input type="checkbox" data-learning-module="C2"> C2를 완료로 표시</label>

**질문:** 같은 모델이 왜 서로 다른 서비스 결과를 낼 수 있고, 서비스 결과를 왜 모델 하나의 능력으로 부르면 안 되는가?

- **최소 읽기:** [[LLM 능력은 모델의 속성인가 시스템의 속성인가]]의 능력층·측정 장부와 [[LLM 시스템 경계 확장 지도]]의 공통 일곱 칸.
- **할 일:** “이 모델은 고객 문의를 정확히 처리한다”를 `model / checkpoint / runtime / service / 사람 또는 외부 효과` 조건으로 다시 쓴다. 각 줄에 관측해야 할 입력·결과·실패를 하나씩 붙인다.
- **통과:** 적어도 세 층을 구분하고, model 출력·tool 제안·승인·committed effect 중 둘 이상을 같은 성공으로 섞지 않는다.
- **막히면:** [[LLM 능력은 모델의 속성인가 시스템의 속성인가]]의 “측정 장부”에서 한 주장에 필요한 분모·조건을 다시 찾아 쓴다.

### C3 — 근거와 연결

<label class="learning-guide-module-toggle"><input type="checkbox" data-learning-module="C3"> C3을 완료로 표시</label>

**질문:** “A가 B를 만들었다”는 매력적인 문장을 사실·해석·미확인 계보로 어떻게 나누는가?

- **최소 읽기:** [[N-gram에서 LLM으로]]의 사실·비교 해석·계보 경계, [[LLM과 컴퓨팅 능력의 공진화]]의 인과 구분 안내.
- **할 일:** 위키에서 역사 또는 성능 주장 하나를 고르고, (a) locator가 있는 확인 사실 한 문장, (b) 비교를 통한 해석 한 문장, (c) 지금은 직접 증명할 수 없는 계보 한 문장으로 분해한다.
- **통과:** 사실 문장에는 source와 위치를 적고, 해석에는 “따라서” 대신 근거 범위를 드러내는 표현을 쓴다. 미확인 계보는 빈칸으로 숨기지 않고 “확인할 기록이 더 필요하다”고 표시한다.
- **막히면:** [[N-gram에서 LLM으로]]의 출처를 열어 수치나 인용 한 개의 locator를 직접 찾아 본다.

## 주 전공 A — 수학·모델 계산

이 길은 수식을 많이 외우는 길이 아니라, 같은 계산을 새 token·새 shape·새 target에서도 재현하고 오류를 진단하는 길이다. M1–M3은 수학을 주 전공으로 골랐을 때 모두 필수다.

### M1 — shape 장부와 표현 변환

<label class="learning-guide-module-toggle"><input type="checkbox" data-learning-module="M1"> M1을 완료로 표시</label>

**질문:** ID, embedding, query/key/value, attention output은 어떤 축을 보존·결합·제거하는가?

- **최소 읽기:** [[벡터·행렬·텐서와 shape]]와 [[LLM을 만든 수학]]의 shape 전이.
- **할 일:** 본문과 다른 `B=1, T=3, D=2` 예를 정해 각 중간값의 shape와 축 이름을 표로 쓴다. 한 attention score가 어느 query 위치와 key 위치를 비교하는지도 표시한다.
- **통과:** 행렬곱 전에 안쪽 차원이 맞는지, softmax가 어느 축에서 후보를 정규화하는지, causal mask가 어느 미래 위치를 막는지 설명한다.
- **막히면:** [[내적·행렬곱과 선형변환]]의 최소 행렬곱으로 돌아가 한 행·한 열이 만드는 값을 손으로 계산한다.

### M2 — 확률·손실·gradient의 새 수치 전이

<label class="learning-guide-module-toggle"><input type="checkbox" data-learning-module="M2"> M2를 완료로 표시</label>

**질문:** 정답 token의 낮은 확률은 어떻게 한 scalar loss와 매개변수별 갱신 방향이 되는가?

- **최소 읽기:** [[소프트맥스]], [[로그가능도]], [[역전파]], [[LLM을 만든 수학]]의 출력층 gradient.
- **할 일:** 본문 예와 다른 네 개 logit과 target을 골라 softmax, NLL, `p-y`, bias update를 끝까지 계산한다. 반올림 시점과 학습률도 쓴다.
- **통과:** logit·확률·NLL·gradient·update를 각각 다른 값으로 표기하고, target 좌표의 gradient 부호와 update 방향을 말로 설명한다.
- **막히면:** [[소프트맥스]]의 분모가 모든 후보를 합치는 이유를 새 숫자로 다시 계산하고, 그 뒤 NLL 한 항만 계산한다.

### M3 — 독립 계산과 오류 진단

<label class="learning-guide-module-toggle"><input type="checkbox" data-learning-module="M3"> M3을 완료로 표시</label>

**질문:** 부분별로 알던 계산을 하나의 toy LLM 흐름으로 끝까지 연결하고, 그 풀이가 우연히 맞은 것이 아님을 어떻게 확인하는가?

- **최소 읽기:** [[LLM 수학 종합 실습]]과 연결된 owner의 오류별 복귀 안내.
- **할 일:** 해설을 보기 전에 종합 실습을 풀고, 필요하면 `npm run math:capstone`으로 수치 검산을 한다. 틀린 경우에는 답을 복사하지 말고 지정된 새 target·shape로 전이 문제를 다시 푼다.
- **통과:** 20점 중 17점 이상이고 치명적 오류가 0개다. 치명적 오류는 확률 축, causal mask, shape, gradient 부호, 분기 합산, head 분할의 오류다.
- **막히면:** 틀린 행 하나에만 대응하는 owner로 돌아간다. 전체 풀이를 처음부터 반복하지 말고 그 owner의 새 수치 문제로 복귀한다.

## 주 전공 B — 역사·근거 읽기

이 길은 연표 암기가 아니라, 한 시기의 계산 조건·실현 성능·확장성·효율·신뢰성 중 무엇이 움직였는지와 어떤 기록이 그것을 지지하는지를 읽는 길이다. H1–H3은 역사·근거를 주 전공으로 골랐을 때 모두 필수다.

### H1 — 한 시대의 병목을 지도에 놓기

<label class="learning-guide-module-toggle"><input type="checkbox" data-learning-module="H1"> H1을 완료로 표시</label>

**질문:** 어떤 기술이 “더 좋아졌다”는 말은 무엇이 가능해졌고 무엇이 아직 병목인지를 실제로 말해 주는가?

- **최소 읽기:** [[LLM과 컴퓨팅 능력의 공진화]]에서 관심 시대의 본편 하나와 [[LLM 능력은 모델의 속성인가 시스템의 속성인가]]의 여섯 항목 측정 장부.
- **할 일:** 한 시대를 골라 `표현 / 계산 가능성 / 실현 성능 / 확장성 / 효율 / 신뢰성` 여섯 칸에 그 시대의 변화와 남은 병목을 한 줄씩 적는다.
- **통과:** “더 빨라졌다”를 적어도 두 개의 측정 가능한 변화로 나누고, model·hardware·software·평가 중 어느 층의 근거인지 표시한다.
- **막히면:** [[LLM과 컴퓨팅 능력의 공진화]]의 해당 본편에서 한 수치와 한 제한을 locator까지 찾아 같은 칸에 기록한다.

### H2 — 연결고리를 네 종류로 판정하기

<label class="learning-guide-module-toggle"><input type="checkbox" data-learning-module="H2"> H2를 완료로 표시</label>

**질문:** 두 기술이 같은 역사 안에 있어도 어떤 관계는 직접 영향이고, 어떤 관계는 가능 조건·병행 맥락·후대 유추인가?

- **최소 읽기:** [[LLM과 컴퓨팅 능력의 공진화]]의 세 횡단 연결고리 중 하나와 [[N-gram에서 LLM으로]].
- **할 일:** 연결 두 개를 골라 `직접 영향 / 가능 조건 / 병행 맥락 / 후대 유추` 중 하나씩 판정하고, 판정 근거와 반대 판정이 왜 과장인지 쓴다.
- **통과:** 수학적 유사성만으로 직접 영향을 쓰지 않으며, 적어도 한 판정에 citation·저자 진술·문서화된 채택 또는 그 부재를 표시한다.
- **막히면:** [[N-gram에서 LLM으로]]의 `검증과 한계`에서 역사적 계보와 설명상 연결을 나눈 문장을 찾아 모방한다.

### H3 — 주장과 locator를 감사하기

<label class="learning-guide-module-toggle"><input type="checkbox" data-learning-module="H3"> H3을 완료로 표시</label>

**질문:** 흥미로운 성능·연대·영향 주장을 원자료의 조건으로 되돌리는 최소 감사는 무엇인가?

- **최소 읽기:** [[AI 시연과 실제 성능]] 또는 [[튜링 테스트와 LLM 평가]] 중 하나와 그 문서의 `## 출처`.
- **할 일:** 주장 하나를 골라 `말한 것 / 자료·과업 / 분모 / 비교 대상 / locator / 말하지 않은 것`의 여섯 줄 감사 기록을 만든다.
- **통과:** 정확도·성능·사용자 반응·공개 효과를 한 숫자로 합치지 않으며, locator가 없는 사실 주장은 “확인 필요”로 남긴다.
- **막히면:** 표나 절 하나만 골라, 그 표의 행·열·평가 조건을 그대로 옮기고 일반화 문장을 지운다.

## 주 전공 C — 시스템·평가

이 길은 model output의 안팎에 있는 상태·시간·자원·권한·책임을 분리한다. S1–S3은 시스템·평가를 주 전공으로 골랐을 때 모두 필수다.

### S1 — 일곱 칸 결과 장부

<label class="learning-guide-module-toggle"><input type="checkbox" data-learning-module="S1"> S1을 완료로 표시</label>

**질문:** 입력 하나가 서비스 결과가 될 때, 무엇을 모델 계산으로 보고 무엇을 runtime·업무 계약으로 남겨야 하는가?

- **최소 읽기:** [[LLM 시스템 경계 확장 지도]]의 공통 일곱 칸과 [[LLM 능력은 모델의 속성인가 시스템의 속성인가]]의 장부.
- **할 일:** 실제 또는 가상의 “주문 취소 도구를 호출하는 챗봇”을 골라 `입력·대상 / 변환 경로 / 시간·상태·자원 / 결과 계약 / 지표 / 실패·복구 / 권한·책임·출처` 장부를 채운다.
- **통과:** model이 만든 제안, schema 통과, authorization, provider 응답, committed effect, unknown 상태 중 적어도 다섯 개를 분리한다.
- **막히면:** [[함수 호출과 도구 사용]]의 proposed·confirmed·committed·failed·unknown 구분으로 한 write action만 다시 쓴다.

### S2 — 측정의 분모와 계약

<label class="learning-guide-module-toggle"><input type="checkbox" data-learning-module="S2"> S2를 완료로 표시</label>

**질문:** “더 빠르고 효율적인 LLM 서비스”라는 말은 어떤 workload와 완료 시점을 빠뜨리면 빈 문장이 되는가?

- **최소 읽기:** [[LLM 추론 에너지 지표]]와 [[전력에서 서비스 결과 계약까지 무엇을 세어야 하나]].
- **할 일:** 서비스 주장 하나를 `workload / prefill / decode / queue·retry / 품질 / deadline / 결과 시점 / 에너지 또는 비용`으로 다시 표기한다.
- **통과:** token당 J나 단일 latency를 보편 효율로 쓰지 않으며, 첫 token·최종 token·사용자 presentation·업무 완료 중 어느 사건을 측정했는지 밝힌다.
- **막히면:** [[전력에서 서비스 결과 계약까지 무엇을 세어야 하나]]의 비교표에서 다른 분모 두 개가 왜 바꿔 쓸 수 없는지 한 문장으로 적는다.

### S3 — 실패·복구·책임 경계

<label class="learning-guide-module-toggle"><input type="checkbox" data-learning-module="S3"> S3을 완료로 표시</label>

**질문:** 성공 응답이 사라지거나 외부 효과가 불확실할 때 왜 blind retry가 복구 전략이 아닌가?

- **최소 읽기:** [[함수 호출과 도구 사용]], [[LLM 에이전트]], [[문자에서 실행 권한까지]] 중 현재 사례에 가까운 owner.
- **할 일:** 한 외부 write 사례에 대해 timeout 이후 가능한 상태와 reconciliation·postcondition·사람 escalation 조건을 적는다.
- **통과:** failed와 unknown을 구분하고, compensation을 과거 효과를 지우는 rollback이라고 쓰지 않는다. 누가 어떤 근거로 재시도·승인·중단하는지도 밝힌다.
- **막히면:** 실제 tool 대신 “승인 요청 초안”처럼 안전한 제안 상태만 남기고, 무엇이 아직 실행되지 않았는지 표시한다.

## 교차 과제 — 다른 두 관점을 잃지 않기

주 전공을 깊게 파더라도 다른 두 축을 전혀 모르면 종합 감사에서 쉽게 과장한다. 아래에서 **주 전공이 아닌 두 과제**를 완료한다. 예를 들어 수학 전공이면 XH와 XS, 역사 전공이면 XM과 XS, 시스템 전공이면 XM과 XH를 한다.

### XM — 수학 흐름을 한 문장 주장에 연결하기

<label class="learning-guide-module-toggle"><input type="checkbox" data-learning-module="XM"> XM을 완료로 표시</label>

- **할 일:** “이 모델은 다음 token을 생성한다”는 문장을 골라 input ID → representation → score → probability → sampled/selected output을 여섯 화살표로 그린다.
- **통과:** score와 probability, probability와 sampled output을 구분하고, 한 화살표에 필요한 shape 또는 후보 집합을 하나 이상 쓴다.
- **막히면:** [[LLM을 만든 수학]]의 계산 이야기에 같은 여섯 화살표를 대조한다.

### XH — 사실·해석·계보를 한 주장에 연결하기

<label class="learning-guide-module-toggle"><input type="checkbox" data-learning-module="XH"> XH를 완료로 표시</label>

- **할 일:** 제품 또는 논문 주장 하나에 `확인 사실`, `비교 해석`, `확인하지 못한 계보` 세 라벨을 붙이고, 사실 하나에는 locator를 적는다.
- **통과:** “영향을 받았다”, “혁명이다”, “최초다” 같은 문장이 자료에서 직접 확인되지 않으면 해당 라벨을 내리거나 조건부 표현으로 고친다.
- **막히면:** [[N-gram에서 LLM으로]]의 출처·한계 절에서 같은 구분을 찾아 재작성한다.

### XS — 결과 계약을 한 주장에 연결하기

<label class="learning-guide-module-toggle"><input type="checkbox" data-learning-module="XS"> XS를 완료로 표시</label>

- **할 일:** “이 에이전트는 업무를 자동화한다”는 문장을 input·model output·tool proposal·authorization·effect·recovery 여섯 칸으로 나눈다.
- **통과:** schema-valid output을 committed effect로 쓰지 않고, effect가 unknown일 때 확인할 권위 있는 상태와 사람에게 넘길 조건을 적는다.
- **막히면:** [[LLM 시스템 경계 확장 지도]]에서 문자·실행 권한 또는 외부 효과 track 하나를 골라 같은 칸을 채운다.

## Z1 — 한 페이지 LLM 주장 감사

<label class="learning-guide-module-toggle"><input type="checkbox" data-learning-module="Z1"> Z1을 완료로 표시</label>

**목표:** 실제 논문, 제품 페이지, 데모 발표 또는 위키의 기존 주장 하나를 세 관점으로 감사한다. 새 사실을 만들거나 제품을 시험할 필요는 없다. 공개된 근거가 없으면 그 부재 자체를 결과로 남긴다.

### 작성 양식

1. **주장과 범위:** 무엇이 무엇을 한다는 주장인가? 입력·대상·출력·사용 맥락은 무엇인가?
2. **계산 또는 모델 층:** token·representation·확률·학습·추론 중 어떤 설명이 실제로 필요한가? score, probability, selected output을 섞지 않았는가?
3. **근거와 인과:** 사실마다 source·locator가 있는가? 비교 해석과 직접 영향·가능 조건·병행 맥락·후대 유추를 구분했는가?
4. **시스템과 측정:** model, runtime, service, 사람·외부 효과 중 무엇을 측정했는가? 분모·workload·quality·deadline·완료 시점은 무엇인가?
5. **한계와 복구:** 어디에서 실패하거나 unknown이 되는가? 재시도, reconciliation, escalation 또는 추가 근거가 필요한 조건은 무엇인가?

### 20점 rubric

| 항목 | 0점 | 2점 | 4점 |
| --- | --- | --- | --- |
| 계산·개념 정확성 | score·확률·출력을 섞거나 핵심 입력을 빠뜨림 | 핵심 흐름은 있으나 shape·후보·가정이 불명확 | 입력→변환→출력과 가정·한계를 정확히 구분 |
| 근거와 인과 규율 | 사실에 근거가 없거나 유사성을 직접 계보로 씀 | 근거는 있으나 locator·인과 라벨이 일부 빠짐 | 사실·해석·인과 유형과 locator를 일관되게 표시 |
| 모델·시스템 경계 | model 결과를 service·외부 효과와 같게 씀 | 층을 나눴으나 권한·상태 또는 책임이 빠짐 | model·runtime·service·외부 효과의 상태와 책임을 분리 |
| 지표·분모·비교 조건 | “좋다/빠르다”만 있고 측정 단위가 없음 | 지표는 있으나 workload·baseline·완료 시점이 부족 | 분모·비교 조건·품질·완료 사건을 함께 명시 |
| 한계·실패·새 사례 전이 | 보장하지 않는 것과 실패가 없음 | 한계는 있으나 복구·확인 방법이 없음 | 실패·unknown·복구·추가 근거와 새 사례 적용을 제시 |

**통과선:** 20점 중 17점 이상이며 아래 치명적 오류가 0개여야 한다.

- logit·점수·확률을 같은 값으로 썼다.
- model output과 service 또는 committed external effect를 같은 성공으로 썼다.
- 수학적 유사성이나 시간 순서만으로 직접 계보를 주장했다.
- 사실 주장에 다시 확인할 locator가 없다.
- 제안·검증된 출력, authorization, 실행, 확정된 외부 효과를 같은 상태로 썼다.

통과하지 못했을 때는 점수를 올리기 위해 문장을 길게 쓰지 않는다. 가장 낮은 rubric 행 하나를 고르고 해당 owner의 새 사례 과제로 돌아간 뒤, 같은 주장을 다시 감사한다.

## 학습 기록 카드

이 카드는 브라우저 저장과 독립적이다. 아래를 자신의 노트에 복사해 날짜·주 전공·산출물 위치·막힌 지점을 기록한다. 완료 표시 자체가 통과를 뜻하지 않도록, 각 줄에 산출물과 기준을 함께 적는다.

```text
LLM Wiki 학습 기록
주 전공: 수학 / 역사·근거 / 시스템·평가 / 아직 선택하지 않음
마지막 진단: 공통 __/2, 수학 __/2, 역사·근거 __/2, 시스템·평가 __/2

[ ] C1  입력·변환·출력·비보장 카드: ____________________
[ ] C2  model/runtime/service 재작성: ____________________
[ ] C3  사실·해석·계보 분해와 locator: ____________________

주 전공 단위
[ ] M1 / H1 / S1: ________________________________________
[ ] M2 / H2 / S2: ________________________________________
[ ] M3 / H3 / S3: ________________________________________

교차 과제
[ ] XM / XH / XS 중 첫 번째: ______________________________
[ ] XM / XH / XS 중 두 번째: ______________________________

[ ] Z1  주장 감사서: ______________________________________
Z1 점수: __ / 20     치명적 오류: 0 / 1 이상
다음 복귀 owner와 이유: __________________________________
```

<button type="button" data-learning-reset>이 브라우저의 학습 가이드 기록 초기화</button>

초기화는 이 가이드의 브라우저 내 기록만 지우며, 위키 문서·다른 사이트 저장값·복사해 둔 학습 기록은 바꾸지 않는다. 버튼이 작동하지 않으면 브라우저 저장 기능이 꺼져 있거나 JavaScript가 꺼진 상태일 수 있다. 이 경우에는 위의 기록 카드를 새로 복사해 사용한다.

## 다음에 무엇을 읽을까

- 계산을 새 사례에서 끝까지 재현하고 싶다면 [[LLM을 만든 수학]]에서 시작해 M1–M3으로 간다.
- 언어 모델과 컴퓨팅 조건이 함께 어떻게 바뀌었는지 읽고 싶다면 [[LLM과 컴퓨팅 능력의 공진화]]에서 관심 시대를 골라 H1–H3으로 간다.
- model 밖의 데이터·에너지·메모리·권한·외부 효과·실시간 경계를 다루고 싶다면 [[LLM 시스템 경계 확장 지도]]에서 S1–S3에 맞는 owner를 고른다.
- 이미 세 축의 연결을 읽었다면 [[LLM 능력은 모델의 속성인가 시스템의 속성인가]]을 Z1의 비교 기준으로 사용한다.

## 관련 항목

- [[LLM을 만든 수학]]
- [[LLM과 컴퓨팅 능력의 공진화]]
- [[LLM 시스템 경계 확장 지도]]
- [[LLM 능력은 모델의 속성인가 시스템의 속성인가]]
