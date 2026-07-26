# LLM을 만든 수학 문서망 — 실행 계획

이 문서는 `LLM을 만든 수학` 허브와 연결된 수학 concept 문서망을 여러 세션에 걸쳐 일관되게 설계·구현·검증하기 위한 조정층이다. 변하는 실행 상태와 수식 계열 소유권은 `docs/llm-math-network.yml`이 맡는다.

## 0. 규칙 우선순위

이 계획은 기존 규칙을 반복하거나 대체하지 않는다. 충돌하면 다음 순서로 원문을 따른다.

1. `AGENTS.md` — 스키마, 근거, raw, 링크, Git 경계
2. `docs/foundational-learning-workflow.md` — 선수 지식 감사, 수식 해설 프로토콜, 품질 게이트
3. `docs/learning-structure-style-guide.md` — 고정 H2, 문장과 수식 배치
4. `docs/foundational-learning-audit.md` — 현재 위키에서 기계적으로 생성한 가변 기준선
5. `docs/llm-math-network.yml` — 이 문서망의 현재 배치, 다음 행동과 수식 계열별 owner

`docs/llm-math-network.yml`의 수치는 특정 날짜의 스냅샷이다. 현재 수치는 `npm run learning:audit:check`와 감사 보고서를 기준으로 다시 확인한다.

## 1. 고정 결정

- 허브는 `wiki/analyses/LLM을 만든 수학.md`에 두고 `page_type: analysis`, `id: analysis.llm을-만든-수학`, `review.evidence_coverage: partial`, `review.content_mode: synthesis`를 기본으로 한다.
- 기준 수학 설명은 기존 또는 신규 `wiki/concepts/` 문서가 맡는다.
- 새 `math` page type이나 `wiki/mathematics/` 폴더를 만들지 않는다.
- 수학 문서군을 실제로 공개하기 전에 `wiki/meta/tags.yml`에 `domain/mathematics`를 설명과 함께 등록한다.
- 이 작업은 정규 source ingest가 아니다. 공식 번호와 `raw/`를 건드리지 않고 의미 있는 의존 경로별 `content:` 변경으로 다룬다.
- 허브는 owner 문서가 준비된 뒤 공개한다. 공개되지 않은 필수 문서를 채우기 위한 빨간 링크를 로드맵 대신 사용하지 않는다.
- 수식 블록마다 페이지를 만들지 않는다. 독립 학습 질문과 반복 재사용 가치가 있는 수식 계열만 concept로 분리한다.

## 2. 재사용 산출물

| 산출물 | 역할 |
| --- | --- |
| `docs/llm-math-network-plan.md` | 범위, 결정, 구현·검증·handoff 절차 |
| `docs/llm-math-network.yml` | 현재 배치, 다음 행동, blockers, 수식 계열과 단일 owner |
| `scripts/math-network-status.mjs` | 원장 구조와 owner 경로를 검사하고 재개 상태를 출력 |
| `.agents/skills/build-llm-math-network/` | 다른 Codex 세션에서 같은 절차를 호출하는 프로젝트 로컬 스킬 |
| `docs/foundational-learning-audit.md` | 전체 문서군의 수식·선수 지식 기준선 |

현재 상태는 다음 명령으로 확인한다.

```powershell
npm run math:status
npm run math:check
```

## 3. v1 목표와 문서 구조

v1의 완료 목표는 독자가 작은 다음-token 예측을 다음 순서로 직접 계산하고 각 수학의 역할을 설명하는 것이다.

```text
token ID
→ embedding vector
→ linear transform과 attention
→ logit
→ softmax probability
→ negative log-likelihood
→ gradient와 backpropagation
→ 한 번의 SGD update
```

허브는 링크 색인이 아니라 이 계산을 작은 숫자로 끝까지 수행하는 analysis다. 완전한 유도는 각 owner concept가 맡고, 허브는 현재 단계의 기호·입력·출력과 사용 이유를 다시 설명한다.

잔차 연결은 v1 경로에서 shape가 같은 항등 경로의 의미를 보여 준다. 정규화·수치 안정성·Adam은 이 계산을 깊고 크게 반복할 수 있게 하는 후속 안정성 배치로 연결한다. 저랭크 근사, 활성화 함수, 비용 모델, 표본추출과 강화학습 목적은 그 뒤의 확장 배치로 둔다.

## 4. 수식 계열과 단일 owner

`docs/llm-math-network.yml`의 각 `families[]` 항목은 다음 계약을 가진다.

- `id`: 세션과 문서 제목이 바뀌어도 유지하는 작업 식별자
- `coverage`: `established`, `planned`, `needs_upgrade`, `ready`, `deferred`
- `owner.path`, `owner.id`: 완전한 정의·유도·예·한계를 맡는 concept
- `prerequisites`: 현재 계열을 이해하기 전에 필요한 다른 family ID
- `downstream`: 현재 수학을 실제로 소비하는 대표 문서
- `notes`: owner의 책임과 아직 남은 경계

`initiative.hub`는 허브의 `path`, 영구 `id`, 현재 `stage`와 이를 구현하는 `batch` ID를 함께 가진다. `hub.batch`는 실제 batch ID를 가리키며 두 `stage`는 항상 같아야 한다. 허브 배치가 `complete`이면 허브 파일이 존재하고 frontmatter의 `id`와 `page_type: analysis`가 원장과 일치해야 한다.

`baseline`의 네 집계는 `baseline.source`의 현재 기초 학습 감사와 일치해야 한다. `initiative.current_batch`는 한 번에 하나만 실행하며, `in_progress` batch가 있으면 반드시 이 ID와 같아야 한다. 완료한 이정표 뒤에는 `current_batch: null`을 허용한다. 아직 `planned` batch가 남은 채 일시 중단했다면 null의 이유를 `blockers`에 기록한다.

한 계열은 원칙적으로 owner 하나만 가진다. source·analysis·다른 concept는 링크만 남기지 않고 다음 국소 설명을 유지한다.

1. 현재 문서에서 식이 답하는 질문
2. 이 문서에서 새로 쓰는 기호와 shape
3. 입력과 출력의 해석
4. 현재 주장에 필요한 가정과 한계
5. 완전한 유도 owner로 가는 링크

`coverage: established`는 현재 재사용할 수 있는 기반이 있다는 뜻이지 수식 해설 계약 전체를 영구적으로 통과했다는 뜻은 아니다. 모든 게이트를 통과한 뒤에만 `ready`로 바꾼다.

## 5. 배치 계획

실행 순서와 포함 family의 단일 기준은 `docs/llm-math-network.yml`이다.

| 배치 | 목적 | 종료 조건 |
| --- | --- | --- |
| 선형대수 기초 | 벡터·행렬·텐서와 shape, 내적·행렬곱·선형변환을 만들고 임베딩·어텐션에 연결 | 두 owner가 수식 게이트를 통과하고 주요 소비 문서의 국소 설명·링크가 정합함 |
| 확률·정보 기초 | 지수·로그와 엔트로피 계열을 기존 확률·로그가능도·softmax에 연결 | next-token 확률과 NLL의 모든 기호·연산·정보량 해석이 owner 경로로 해소됨 |
| 미분·최적화 기초 | 미분·그래디언트, 연쇄 법칙·계산 그래프를 만들고 경사하강법·역전파를 보강 | scalar 손계산과 관련 시 유한차분으로 gradient를 재현함 |
| 허브 공개 | v1 계산을 한 흐름으로 합성하고 overview·index·log에 진입점을 둠 | 필수 owner 링크가 모두 해소되고 작은 예를 token부터 한 번의 update까지 재현함 |
| 통계·안정성 | 기대값·분산, LayerNorm·RMSNorm, log-sum-exp와 Adam을 연결 | 정규화 축·수치 범위·moment 추정의 서로 다른 역할을 구분함 |
| 확장 | SVD·저랭크, 활성화, 비용, sampling, RL 목적을 가치가 생길 때 추가 | 문서 할당량이 아니라 독립 질문·재사용 가치·근거 게이트를 통과함 |

한 배치는 정해진 문서 수가 아니라 하나의 선수 의존 경로가 완결되는 범위다. 배치가 너무 크면 family를 줄이되, 기초 owner와 소비 문서를 서로 다른 미완성 배치로 장기간 분리하지 않는다.

로드맵에서 한 family를 배치하려면 각 prerequisite가 이미 `established`·`ready`여서 재사용 가능하거나, 같은 또는 더 이른 non-deferred 배치에 포함돼 있어야 한다. 그러나 `initiative.current_batch`를 실제로 시작할 때는 prerequisite가 `established`·`ready`이거나 현재 배치 안에 함께 있어야 한다. 더 이른 배치에 예약됐다는 사실만으로는 충분하지 않으며, 그 작업을 마쳐 `ready`로 바뀐 뒤 다음 배치로 넘어간다. `established`는 선수로 사용할 최소 기반만 뜻하며 현재 배치에서 G1–G7 전체를 통과했다는 뜻은 아니다.

## 6. 새 세션에서 재개하는 절차

1. `git status --short --branch`로 branch와 기존 사용자 변경을 확인한다.
2. `AGENTS.md`, 이 계획과 `docs/llm-math-network.yml`을 읽는다.
3. `npm run math:status`와 `npm run math:check`를 실행한다.
4. `initiative.current_batch`, `initiative.next_action`, `initiative.blockers`를 확인한다.
5. 현재 family의 owner, prerequisites, downstream 문서를 처음부터 끝까지 읽는다.
6. frontmatter evidence와 실제 locator, 사용한 raw artifact를 구분해 확인한다.
7. 마지막으로 통과한 게이트 다음 단계부터 재개한다. 이미 완료된 배치를 다시 작성하지 않는다.

`current_batch: null`이고 blocker가 없으면 현재 이정표가 끝난 상태다. 가치가 아직 확인되지 않은 deferred 확장을 자동으로 활성화하지 않는다. blocker가 있으면 원장에 적힌 해소 조건부터 확인한다.

사용자가 정확히 `하던 작업 계속 진행`이라고만 쓴 경우에는 `AGENTS.md` 6.0의 정규 source 재개 규칙이 우선한다. 수학 문서망은 `$build-llm-math-network`, `LLM 수학 문서망 계속`, `LLM을 만든 수학 작업 계속`처럼 대상을 명시했을 때 이 절차로 재개한다.

## 7. 배치 구현 절차

### 7.1 감사

1. 현재 문서군에서 같은 수식의 출현과 표기 차이를 찾는다.
2. 각 출현을 핵심식, 보조식, 평가식, 경험적 관계로 구분한다.
3. 숨은 선수 지식을 `필수·국소`, `필수·독립`, `선택·심화`로 나눈다.
4. 기존 owner가 충분한지, 보강할지, 새 concept가 필요한지 판정한다.
5. 선수 family 순환과 중복 owner를 제거한다.

### 7.2 설계

1. owner가 답할 독립 질문과 범위를 한 문장으로 고정한다.
2. 가장 작은 숫자 예와 일반 수식의 대응을 먼저 설계한다.
3. 수학적 형성부터 LLM 사용까지 필요한 evidence와 locator를 확보한다.
4. owner를 먼저 완성하고 downstream 문서의 국소 설명·링크를 이어서 갱신한다.
5. 허브에는 현재 완료된 경로만 반영한다.

### 7.3 작성

본문 구조와 수식 설명은 `docs/foundational-learning-workflow.md` 4장·6장과 `docs/learning-structure-style-guide.md`를 그대로 따른다. 추가로 각 핵심 수식에 다음 판정을 명시한다.

- 정의
- 수학적 귀결
- 통계적 가정 아래의 귀결
- 요구 성질을 만족하는 선택
- 계산 가능한 근사
- 속도·메모리·수치 안정성을 위한 공학적 선택
- 역사적으로 정착한 관례

“이렇게 쓸 수밖에 없다”는 표현은 밝힌 가정에서 유일하게 도출했을 때만 사용한다.

### 7.4 통합

1. 선수 문서는 `학습 안내`에서 최대 2개만 연결하고 국소 설명을 유지한다.
2. 다음 문서는 실제로 남은 질문을 받는 최대 2개로 제한한다.
3. `relations`는 핵심 관계만 두고 본문 링크와 기계적으로 상호화하지 않는다.
4. 새 페이지·제목·근거 수에 맞춰 index·overview·log를 갱신한다.
5. 태그는 검색·분류용이며 그래프 edge는 본문 링크와 `relations`가 만든다는 점을 유지한다.

## 8. 수학의 기원과 계보 게이트

역사 설명은 다음 네 층을 분리한다.

| 층 | 확인할 질문 |
| --- | --- |
| 수학 자체의 형성 | 개념·정의·정리가 언제 어떤 문제에서 형성됐는가? |
| 통계·수치계산 | 추정·최적화·계산 절차로 어떻게 사용됐는가? |
| 기계학습 도입 | 어떤 모델·목적·알고리즘에서 실제로 채택됐는가? |
| 언어 모델·Transformer | 현재 식에서 어떤 역할을 맡고 무엇이 달라졌는가? |

각 층의 역사·최초·영향 주장은 `evidence.yml`의 source와 재확인 가능한 locator를 가진다. 다음 경계를 지킨다.

- 수학적 유도는 역사적 영향의 증거가 아니다.
- 수식의 유사성만으로 직접 계보·단독 발명을 주장하지 않는다.
- 편집부가 만든 유도와 숫자 예는 출발 가정과 사용한 규칙을 밝히고 실험 결과와 구분한다.
- 원 논문 표기와 위키 표기가 다르면 대응표를 둔다.
- 계보 한 층이 확인되지 않으면 추정으로 채우지 않고 미확인 경계로 남긴다.

## 9. 품질 게이트

| 게이트 | 통과 조건 |
| --- | --- |
| G1 선수 관계 | 미정의 필수 용어와 순환 prerequisite가 없음 |
| G2 owner | 계열당 owner 하나, downstream의 국소 설명 책임이 충족됨 |
| G3 수식 | 질문·기호·shape·항·연산 이유·유도·숫자 예·대안·실패 조건이 준비됨 |
| G4 근거·계보 | 사실·설명용 예·해석·미확인 계보와 네 계보 층이 분리됨 |
| G5 위키 통합 | evidence·artifacts·learning·relations와 index·overview·log가 정합하고 red link가 없음 |
| G6 계산·사이트 | 손계산, shape, 확률 합, 관련 시 유한차분, KaTeX·390px 렌더를 확인함 |
| G7 저장소 | 모든 자동 검사와 원문 diff 검토를 통과함 |

자동 검사는 다음 순서로 수행한다.

```powershell
npm run math:check
npm run learning:audit
npm run learning:audit:check
npm run sync:index
npm run lint:wiki
npm run build:site
npm run check:site
npm run test
npm run verify
```

`learning:audit`와 `sync:index`가 파일을 갱신하므로 실행 전 기존 사용자 변경과 대상 범위를 확인한다.

## 10. 세션 종료와 handoff

작업을 마치거나 중단하기 전에 `docs/llm-math-network.yml`을 실제 상태에 맞게 갱신한다.

- 완료한 family의 `coverage`
- batch의 `stage`
- 다음에 시작할 `initiative.current_batch`
- 한 문장으로 실행 가능한 `initiative.next_action`
- 사용자 선택이나 외부 근거가 필요한 `initiative.blockers`
- owner·prerequisites·downstream 변경
- `initiative.handoff.updated`와 기준 commit
- 마지막으로 완료한 gate와 실행한 검증 명령·결과
- 공개 문서에 반영되지 않은 범위와 다음 세션이 알아야 할 notes

`next_action`은 “계속 조사”처럼 쓰지 않는다. 다음 세션이 바로 실행할 수 있도록 파일, family ID와 첫 명령을 포함한다.

`npm run math:status`는 위 handoff를 사람용 요약으로 출력하고, `npm run math:status -- --json`은 같은 내용을 기계 판독 가능한 JSON으로 출력한다. handoff는 선택 필드지만 한번 기록한 뒤에는 세션 종료 때마다 실제 상태와 일치시킨다.

공개 wiki 내용 또는 AGENTS 규칙·프로젝트 전체 검증 흐름에 영향을 주는 재사용 인프라가 바뀌면 `wiki/log.md`에 해당 변경과 검증 결과를 기록한다. 세션 대화, 임시 판단이나 저장되지 않은 내부 계획은 공개 log에 누적하지 않는다.

세션 handoff에는 최소한 다음을 남긴다.

```text
기준 commit과 branch
active batch와 family ID
완료한 게이트
변경 파일과 변경 이유
사용하거나 새로 등록한 evidence와 locator
손계산·shape·gradient 확인 결과
자동 검사 결과
남은 blocker
다음 세션의 첫 행동
```

## 11. 완료 정의

### 수식 계열 완료

- owner와 선수 관계가 확정됐다.
- 문제에서 최소 예, 일반 수식과 실제 사용으로 이어지는 설명이 끊기지 않는다.
- 모든 기호·shape·항·연산·가정·대안·실패 조건을 설명했다.
- 수학적 필연성과 설계 선택, 역사적 관례를 구분했다.
- 우선 downstream 문서가 owner를 재사용하면서 국소 설명을 유지한다.
- 수동·자동 검증을 통과한 뒤 `coverage: ready`로 기록했다.

### 배치 완료

- 포함 family가 `ready` 또는 근거 있는 `deferred` 상태다.
- 선수 순환과 중복 owner가 없다.
- G1–G7과 관련 수동 렌더 검사를 통과했다.
- 원장과 공개 문서의 실제 상태가 일치한다.

### v1 완료

- 독자가 허브의 작은 예에서 token ID부터 한 번의 parameter update까지 재현한다.
- 각 단계가 정의, 귀결, 근사, 공학적 선택 중 무엇인지 설명한다.
- 모든 필수 owner 링크가 해소되고 다음 학습 경로가 순환하지 않는다.

문서망 전체는 확장형이다. 영구적인 “전체 완료” 대신 v1, 안정성 확장, 고급 수학 확장 같은 이정표를 사용한다.

## 12. 재사용 호출 예

- `$build-llm-math-network로 현재 상태를 확인하고 다음 배치를 계획해 줘.`
- `$build-llm-math-network로 linear-algebra-foundations 배치를 구현해 줘.`
- `LLM 수학 문서망 계속 진행. 수식 owner와 근거를 확인한 뒤 다음 행동부터 이어가 줘.`
- `LLM을 만든 수학의 수식 소유권만 감사하고 수정 없이 보고해 줘.`
- `경사하강법 owner가 G1–G7을 통과하는지 검토해 줘.`
