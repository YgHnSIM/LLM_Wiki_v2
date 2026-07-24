# LLM Wiki v2 — Schema & Operating Instructions

이 문서는 현재 프로젝트의 위키를 유지·검증·배포할 때 따르는 규칙이다. `wiki/`의 정리된 문서가 공개 지식베이스의 기준이며, `raw/`는 수정하지 않는 보존 자료다.

## 0. 프로젝트 정체성

LLM Wiki v2는 문서를 스키마에 맞춰 쌓는 저장소가 아니라, AI와 언어 기술의 역사를 한국어로 읽고 연결하며 새로운 질문을 발전시키는 지식베이스다. 소스의 전체 맥락을 이해하고, 핵심 통찰을 기존 지식과 엮고, 다시 읽을 가치가 있는 설명과 분석으로 남기는 것이 목적이다. 스키마·레지스트리·lint·사이트 빌드는 이 목적을 지키는 안전장치이지 작업의 최종 목적이 아니다.

### 0.1 편집 판단의 우선순위

1. **이해** — 소스를 처음부터 끝까지 읽고 저자가 실제로 다룬 문제, 방법, 증거와 한계를 먼저 파악한다.
2. **정확성** — 사실, 해석, 후대 평가와 직접 계보를 구분하고 1차 근거로 과장을 교정한다.
3. **연결성** — 새 정보가 기존 인물·개념·분석과 어떤 질문을 공유하고 어디서 충돌하는지 찾아 의미 있는 링크를 만든다.
4. **합성 가치** — 단순 요약을 넘는 재사용 가능한 통찰은 주제 중심 분석으로 보존한다. 모든 소스나 명사를 기계적으로 새 페이지로 만들지는 않는다.
5. **가독성** — 한국어를 기본으로 쓰고 필요한 원어를 병기하며, 중립적이고 명료한 문장으로 독자가 한 번에 이해할 수 있게 한다.
6. **형식 일관성** — 위 목적을 훼손하지 않도록 현재 스키마, 근거, 링크, Git 경계를 정확히 지킨다.

### 0.2 형식 규칙과 편집 책임

- 스키마와 검증을 통과하는 것은 필수지만, 체크리스트를 채운 것만으로 문서가 완성되지는 않는다.
- 새 소스를 처리할 때는 요약뿐 아니라 기존 주장과의 모순, 빠진 교차 참조, 오래된 설명, 후속 조사 질문을 함께 살핀다.
- 사용자의 관심사와 누적된 위키 맥락을 반영하되, 사용자의 선택에 따라 결과가 실질적으로 달라질 때만 작업을 멈추고 묻는다.
- 기계적으로 상호 링크를 늘리거나 페이지 수를 늘리지 않는다. 독자가 다음 질문으로 이동하는 데 실제로 도움이 되는 연결만 남긴다.
- 가치 있는 질의·비교·정정에서 나온 통찰은 근거를 갖춘 analysis 문서나 기존 문서의 보강으로 보존한다.
- 큰 변경은 먼저 범위와 의도를 알리고, 완료 뒤에는 형식 검사뿐 아니라 내용의 모순·중복·과장 여부도 검토한다.

## 1. 디렉터리 구조

```text
LLM_Wiki_v2/
├── AGENTS.md
├── raw/                         # 불변 보존 자료
├── wiki/
│   ├── index.md
│   ├── log.md
│   ├── overview.md
│   ├── sources/
│   ├── entities/
│   ├── concepts/
│   ├── analyses/
│   └── meta/
│       ├── page.schema.json     # frontmatter JSON Schema
│       ├── tags.yml             # 허용 태그 사전
│       ├── evidence.yml         # 외부 근거 레지스트리
│       ├── raw-artifacts.yml    # raw 역할·출처 상태·해시
│       ├── source-gaps.yml      # 공식 목차의 upstream 결손과 편집부 재구성 상태
│       └── red-links.yml        # 의도적으로 허용한 미작성 링크
├── scripts/
│   ├── lib/                     # 문서·링크·경로·빌드 공통 모듈
│   ├── tests/                   # Node.js 회귀 테스트
│   ├── lint-wiki.mjs
│   ├── build-site.mjs
│   └── check-site.mjs
└── site/
```

## 2. 위키 페이지 스키마 v2

모든 `wiki/**/*.md` 문서는 다음 필드를 가진다. 기계 판독 규격은 `wiki/meta/page.schema.json`이 기준이다.

```yaml
---
schema_version: 2
id: concept.madaline
page_type: concept
title: MADALINE
aliases: [many ADALINEs]
tags: [type/concept, domain/ai, domain/machine-learning]
created: 2026-07-14
updated: 2026-07-15
lifecycle: active
verification: verified
artifacts:
  - raw/006_1962_위드로-호프_MADALINE.md
evidence:
  - source_id: widrow-lehr-1990
    locator: pp. 1415–1419
    relation: supports
related:
  - concept.adaline
---
```

### 2.1 필드 의미

| 필드 | 규칙 |
| --- | --- |
| `schema_version` | 현재 값은 `2` |
| `id` | 페이지명과 분리된 영구 식별자, 전체 위키에서 유일해야 함 |
| `page_type` | `source`, `reference`, `entity`, `concept`, `analysis`, `meta` |
| `title` | 본문의 첫 H1과 정확히 일치 |
| `aliases` | 검색용 대체 이름. 다른 페이지의 `id` 역할을 대신하지 않음 |
| `tags` | `wiki/meta/tags.yml`에 등록된 값만 사용 |
| `created`, `updated` | `YYYY-MM-DD`, `created <= updated` |
| `lifecycle` | 편집 수명주기: `draft`, `active`, `archived` |
| `verification` | 근거 상태: `unverified`, `partial`, `verified`, `disputed` |
| `artifacts` | 프로젝트 안의 물리적 `raw/` 보존 파일 경로 |
| `evidence` | 주장 근거 ID, 문헌 내 위치, 관계 |
| `related` | 큐레이션된 방향성 관계의 대상 페이지 ID |

`status`와 `status/*` 태그는 사용하지 않는다. 편집 상태와 사실 검증 상태를 하나의 값으로 합치지 않는다.

### 2.2 폴더와 유형

- `wiki/sources/` → `source` 또는 `reference`
- `wiki/entities/` → `entity`
- `wiki/concepts/` → `concept`
- `wiki/analyses/` → `analysis`
- `wiki/index.md`, `wiki/log.md`, `wiki/overview.md` → `meta`

각 문서는 `type/<page_type>` 태그를 정확히 하나 가진다. 메타 문서는 `type/meta`를 사용한다.

### 2.3 수명주기와 검증 상태

- `lifecycle: active`는 문서가 읽을 수 있는 완성 상태라는 뜻이다.
- `verification: verified`는 현재 본문의 핵심 사실이 locator가 있는 근거로 확인됐다는 뜻이다.
- `partial`은 해석적 분석이 포함되거나 일부 주장만 검증됐다는 뜻이다.
- `disputed`는 신뢰할 만한 자료가 서로 충돌하거나 논쟁 자체가 문서의 핵심이라는 뜻이다.
- 비메타 문서의 `evidence`는 비어 있을 수 없다.
- `verified` 문서에는 해결되지 않은 사실 경고를 남길 수 없다.
- 파생 문서는 검토되지 않은 raw의 주장만으로 `verified`가 될 수 없다. 외부 근거나 검증된 소스 노트를 사용한다.

## 3. 근거와 보존 자료

### 3.1 `artifacts`와 `evidence` 분리

- `artifacts`는 어떤 파일을 보존·참고했는지 기록한다.
- `evidence`는 어떤 문헌의 어느 위치가 현재 주장을 지지·보완·맥락화·반박하는지 기록한다.
- raw 파일 자체가 존재한다는 사실은 그 내용이 정확하다는 뜻이 아니다.
- `source_id`는 `wiki/meta/evidence.yml`에 있어야 한다.
- `locator`에는 페이지, 절, 장, 표, 코드 기록처럼 주장을 재확인할 수 있는 위치를 적는다.
- `relation`은 `supports`, `supplements`, `contextualizes`, `disputes` 중 하나다.

### 3.2 raw 불변성과 정정

1. `raw/`의 수집 artifact는 수정하거나 삭제하지 않는다. 운영 설명서인 `raw/README.md`만 스키마 변경 때 갱신할 수 있다.
2. 각 raw Markdown은 `wiki/meta/raw-artifacts.yml`에 역할, 출처 상태, 원문 `source_url`, SHA-256 해시를 기록한다.
3. raw에 오류나 결손이 있으면 위키 본문에서 1차 자료로 교정하고, 필요하면 `검증 정정` 또는 `원문 상태` 절을 둔다.
4. raw를 “사실의 source of truth”라고 부르지 않는다. raw는 수집 당시 상태를 보존한 artifact다.
5. 원문·번역·해설을 서로 다른 `role`로 기록하고, 원문이 저장소에 없으면 명시한다.

### 3.3 출처 절

- `source`, `reference`, `entity`, `concept`, `analysis` 문서는 `## 출처`를 정확히 한 번 포함한다.
- `## 출처`에는 사람이 읽을 수 있는 문헌 제목·URL·locator 또는 검증된 소스 노트 링크를 적는다.
- `meta` 문서는 `## 출처`와 비어 있지 않은 `evidence` 요구에서 제외된다.
- `## 관련 항목`은 모든 Markdown 문서의 마지막 H2다.

### 3.4 인용과 요약

- 실제 인용은 원문, 번역, 저자·저작, 페이지 또는 절을 함께 기록한다.
- raw 해설의 문장을 원저자의 인용처럼 따옴표와 인용 블록으로 표시하지 않는다.
- 직접 인용이 아닌 문장은 `핵심 문장`, `요약`, `해석`으로 표시하고 따옴표를 사용하지 않는다.
- 논쟁적 인과는 “직접 이어졌다”보다 확인 가능한 영향, 공통 문제, 수학적 유사성의 범위를 구체적으로 쓴다.

### 3.5 단계별 학습 구조

- 학습 문서의 목표는 특정 연령을 위한 쉬운 요약이 아니라, 비전공자가 숨은 선수 지식 없이 문제의 배경에서 정식 표현과 근거까지 올라갈 수 있는 자립형 설명이다.
- 모든 비메타 문서는 H1 직후 `> [!note] 학습 안내`에서 난이도·선수 지식·읽고 나면 알게 될 것을 밝힌다.
- 본문 H2는 `1단계 — 먼저 잡을 핵심` → `2단계 — 작동 원리` → `3단계 — 기술과 근거` → `검증과 한계` → `학습 확인` → `출처` → 마지막 `관련 항목` 순서를 따른다.
- 문제의 배경과 필요한 기초 개념을 먼저 정의하고, 손으로 따라갈 수 있는 최소 예에서 일반 원리로 올라간 뒤 기술 세부·수식·실험 조건·locator를 제시한다. 링크가 현재 문서의 정의를 대신할 수 없으며, 기술 내용과 근거 조건을 단순화 과정에서 삭제하지 않는다.
- 핵심 수식은 계산 목적과 요구 조건, 모든 기호·인덱스·자료형·shape·값의 범위와 출처, 항과 연산의 역할, 단계별 유도, 숫자 예, 자연어 해석, 성립 가정, 필연적인 부분과 설계 선택, 대안과 실패 조건을 설명한다. “이렇게 쓸 수밖에 없다”는 표현은 밝힌 가정에서 유일하게 도출됨을 보였을 때만 쓴다.
- `학습 확인`에는 본문으로 답할 수 있는 질문 2–3개와 실제 다음 질문을 이어 받는 문서를 제시한다.
- source·concept·entity·analysis별 하위 구조, 문장·용어·수식 배치와 검수 규칙은 `docs/learning-structure-style-guide.md`를 따른다.
- 선수 지식 감사, 기초 개념 축, 문서별 작성 순서, 수식 해설 프로토콜, 유형별 적용, 품질 게이트와 완료 정의는 `docs/foundational-learning-workflow.md`를 따른다.
- meta 문서는 고정 H2 골격의 예외이며, 초보자 학습 경로·시대별·주제별 진입점·선수 관계를 중심으로 구성한다.

## 4. 링크와 관계

- 본문 링크는 Obsidian `[[페이지]]` 또는 `[[페이지|표시명]]` 형식을 사용한다.
- 본문 링크는 방향성을 가진다. 모든 링크에 상호 링크를 강제하지 않는다.
- frontmatter `related`도 큐레이션된 방향성 관계이며 자동 상호화하지 않는다.
- 사이트의 역링크가 반대 방향 탐색을 제공한다.
- 의도적인 미작성 링크만 `wiki/meta/red-links.yml`에 등록한다. 그 밖의 빨간 링크는 lint 오류다.
- 제목이나 alias가 겹쳐도 `id`는 겹칠 수 없다. 모호한 링크는 파일명 또는 명시적인 표시명을 사용한다.

## 5. 태그

- 허용 태그의 단일 기준은 `wiki/meta/tags.yml`이다.
- `type/*`는 구조를, `domain/*`는 주제를 나타낸다.
- 새 태그는 먼저 레지스트리에 설명과 함께 등록한다.
- 검증 상태나 편집 상태를 태그에 중복하지 않는다.

## 6. 핵심 워크플로

### 6.0 중단 작업 재개 (`하던 작업 계속 진행`)

새 세션에서 사용자가 정확히 `하던 작업 계속 진행`이라고 입력하면, 별도의 복구 체계를 만들지 않고 **외부 원문 목록에서 실제 원문이 있는 첫 미완료 공식 번호를 찾아 6.1–6.3의 기존 워크플로를 한 번에 하나씩 그대로 적용한다.** 현재 upstream 원문이 있는 공식 001–046·048–110과 편집부 재구성 047의 공개 처리가 모두 완료돼 다음 순차 입력은 없다.

모든 단계는 하나의 **공식 책 목차 장 번호**를 사용한다. `/lt NNN`, `source:* -- NNN`, 외부 원문·번역·raw 파일명, `raw-artifacts.yml`의 `order_prefix`, `wiki/sources/` 파일명, `source.NNN`, 위키 링크, 공개 URL과 ingest 커밋 번호가 모두 같아야 한다. 공식 047 Attention Mechanism은 upstream 원문이 없는 알려진 결손이다. 표준 `/lt`·`source:*` 번역 흐름에는 넣지 않으며, `source.047`과 raw는 1차 문헌을 토대로 위키가 새로 쓴 **편집부 재구성**임을 눈에 띄게 표시한다. 원문 결손과 재구성 공개 상태는 `wiki/meta/source-gaps.yml`에 함께 기록한다. 전체 규칙은 `docs/source-numbering.md`를 따른다.

1. `git status --short --branch`와 `npm run source:status -- NNN`으로 대상과 중단 지점을 확인한다.
2. 새 번호는 기존 번역본을 무시하고 `/lt NNN`부터 새로 번역한다. 이번 작업에서 이미 검증까지 마친 단계가 있다면 그 다음 단계부터 잇는다.
3. 번역·raw 복사 단계에서는 커밋·푸시하지 않는다. 공개 소스 처리와 전체 검증이 끝난 뒤에만 `main`에서 `ingest` 커밋 하나를 만들고 푸시한다. 브랜치는 만들거나 전환·병합하지 않는다.
4. 소스 수와 무관하게 새 자료와 기존 위키 사이에서 의미 있는 질문·긴장·계보·방법론 차이가 확인되면 6.3의 주제 중심 분석을 작성·검증·푸시한다. 일정 수를 채우기 위한 기계적 비교 문서는 만들지 않는다.
5. raw 불변성과 덮어쓰기 금지, 관련 없는 변경 보존, 첨부·임시 파일 staging 제외, 60초 이내 진행 알림, push 뒤 배포 확인 규칙을 그대로 지킨다. 브라우저를 열었다면 확인 직후 자신이 연 창·탭을 닫는다.

### 6.1 번역과 raw 보존

1. `/lt NNN`의 `NNN`을 공식 장 번호로 사용해 `C:\Vault\ObsidianVault\Assets\LLM_sources`의 단일 원문을 새로 번역하고 해설을 작성한다.
2. 번역과 해설은 `C:\Vault\ObsidianVault\LLM_ko`에 동일 stem의 `.ko.md`, `.commentary.ko.md` 쌍으로 저장하고 스킬 검사를 통과해야 한다.
3. 번역본에는 첫 Markdown 제목 바로 뒤에 `원본 출처: <원문 URL>`을 정확히 한 번 기록한다. 웹 페이지의 `읽기 수준`·툴팁 안내 같은 UI 문구는 번역 본문에 포함하지 않는다.
4. `npm run source:status -- NNN`으로 입력·출력·raw·공개 페이지 상태를 확인한다.
5. `npm run source:copy -- NNN`으로 검증된 쌍을 같은 공식 번호로 `raw/`에 복사하고 `raw-artifacts.yml`에 원문 `source_url`, 같은 `order_prefix`와 SHA-256을 등록한다.
6. raw 복사 단계에서는 커밋·푸시하지 않는다. 기존 raw와 내용이 다르면 덮어쓰지 않고 중단한다. 공개 후 외부 번역본의 출처 표기·UI 문구만 정리해 raw와 달라진 경우에는 raw와 레지스트리의 SHA-256 일치를 기준으로 보존 상태를 검증하고, 외부 작업본으로 raw를 다시 동기화하지 않는다.

공식 047은 이 절의 번역·복사 절차를 적용하지 않는 예외다. 외부 원문·외부 번역본을 만들지 않으며, `editorial-reconstruction`과 `editorial-commentary` 역할의 신규 raw를 등록한 뒤에는 다른 artifact와 같은 불변 규칙을 적용한다.

### 6.2 공개 소스 처리

1. raw artifact와 외부 원문 출처를 구분해 확인한다.
2. 외부 1차 자료를 evidence 레지스트리에 등록한다.
3. 같은 공식 장 번호로 `wiki/sources/` 파일명과 `source.NNN`을 정해 요약·검증 정정·핵심 문장·출처·관련 항목을 작성한다.
4. 관련 entity·concept·analysis를 갱신한다.
5. `index.md`, `overview.md`, `log.md`를 갱신한다. log에는 raw 보존과 공개 처리 결과를 하나의 ingest 기록으로 남긴다.
6. `npm run sync:index` 후 `npm run source:ready -- NNN`으로 단위 테스트, wiki lint, 사이트 빌드와 산출물 검사를 실행한다.
7. 현재 브랜치가 `main`이고 변경 범위가 해당 소스에 한정됐는지 확인한 뒤 같은 공식 장 번호를 쓴 `ingest: number_title`로 한 번만 커밋하고 `origin/main`에 푸시한다. 브랜치를 새로 만들지 않는다.

세부 절차와 실패 복구 규칙은 `docs/source-ingestion-workflow.md`를 따른다.

### 6.3 의미 기반 분석 주제 발굴

1. 새 소스를 공개 처리할 때마다 그 문서와 기존의 검증된 source·concept·entity·analysis 문서를 함께 살펴, 별도의 분석 문서로 발전시킬 가치가 있는 질문·긴장·계보·방법론 차이가 생겼는지 판단한다. 소스 수나 번호 구간은 분석 시점을 결정하지 않는다.
2. 분석은 자료를 정해진 수만큼 묶기 위한 정리가 아니다. 서로 다른 자료를 함께 읽을 때만 드러나는 설명, 기존 분석을 실질적으로 보강·정정하는 연결, 후속 탐구에 재사용할 수 있는 비교 관점이 있을 때 작성한다. `[[N-gram에서 LLM으로]]`, `[[AI 시연과 실제 성능]]`, `[[규칙 기반 AI에서 데이터 기반 학습으로]]` 같은 기존 분석의 범위 설정 방식을 참고한다.
3. 근거가 충분하지 않거나 기존 source·concept 문서의 보강으로 충분하면 새 분석 문서를 만들지 않는다. 반대로 근거가 탄탄한 주제가 확인되면 다음 정규 번호를 기다리지 않고 그 시점에 작성한다.
4. 가장 근거가 탄탄한 주제를 골라 `wiki/analyses/`의 ‘비교 읽기’ 코너에 주제 중심 제목의 분석 문서를 작성한다. 번호 범위 제목이나 신규 소스의 전부 포함을 강제하지 않으며, 선택한 논점에 실제로 필요한 신규·기존 자료만 사용한다.
5. 분석 문서는 `page_type: analysis`, `verification: partial`을 기본으로 하고, 관련 외부 evidence locator와 raw artifact를 연결한다. 확인된 사실, 비교를 통한 해석, 아직 입증되지 않은 계보를 분리하며 `## 출처`와 마지막 `## 관련 항목`에는 실제 사용한 자료만 적는다.
6. `index.md`, `overview.md`, `log.md`를 갱신하고 `npm run sync:index`와 `npm run verify`를 통과시킨다.
7. 현재 브랜치가 `main`인지 확인한 뒤 `content: short_analysis_topic`으로 별도 커밋해 `origin/main`에 푸시한다. 분석 문서가 원격에 반영된 뒤에 다음 소스 공개 처리를 계속한다.

### 6.4 참고 자료 보강

- 정규 번호 소스가 아니면 `page_type: reference`와 `type/reference`를 사용한다.
- 기존 주장 보강이 목적이면 새 개념을 불필요하게 만들지 않는다.
- 외부 근거는 evidence 레지스트리에, 물리 파일은 raw artifact 레지스트리에 각각 추가한다.

### 6.5 점검

`scripts/lint-wiki.mjs`는 다음을 실패 조건으로 검사한다.

- `wiki/meta/page.schema.json`에 대한 frontmatter 구조·타입·enum 검증
- 폴더·`page_type`·`type/*` 일치
- ID 중복, H1·title 불일치
- source 페이지·raw 경로·`order_prefix`의 공식 장 번호 불일치와 047 재구성을 번역으로 오표기한 경우
- 허용되지 않은 태그
- 존재하지 않거나 해시가 달라진 raw artifact
- 존재하지 않는 evidence ID, 빈 locator
- 비메타 문서의 `## 출처` 누락
- 빨간 링크와 색인 누락·중복·근거 수 불일치
- `## 관련 항목`의 위치
- 검증된 문서의 해결되지 않은 경고
- 출처 없는 인용문 형식

### 6.6 `LLM을 만든 수학` 문서망

사용자가 `$build-llm-math-network`, `LLM 수학 문서망 계속`, `LLM을 만든 수학 작업 계속`, 수식 계열·owner 감사나 해당 배치 구현을 요청하면 프로젝트 로컬 스킬 `.agents/skills/build-llm-math-network/SKILL.md`를 사용한다.

1. `docs/llm-math-network-plan.md`와 `docs/llm-math-network.yml`을 읽고 `npm run math:status`, `npm run math:check`로 현재 배치·owner·다음 행동을 확인한다.
2. 수식 계열의 완전한 설명은 concept owner 하나가 맡고, 소비 문서는 현재 기호·shape·역할·가정과 한계를 국소적으로 설명한다.
3. 선수 의존 경로 하나를 owner → 소비 문서 → 허브 순서로 완결한다. 새 page type·수학 폴더·기계적 상호 링크를 만들지 않는다.
4. 작업 전후에 원장의 batch stage, family coverage, next action과 blockers를 실제 상태에 맞게 갱신한다.
5. 정규 source 번호와 `raw/`를 건드리지 않으며, 공개 위키 변경은 `content:` 경계와 기존 검증 절차를 따른다.

사용자가 정확히 `하던 작업 계속 진행`이라고만 입력한 경우에는 이 절이 아니라 6.0의 정규 source 재개 규칙이 계속 우선한다.

### 6.7 `LLM과 컴퓨팅 능력의 공진화` 시리즈

사용자가 `LLM과 컴퓨팅 능력 발전사 계속`, `LLM과 컴퓨팅 능력의 공진화 계속`, 해당 시리즈의 본편·owner·원장 작업을 요청하면 `docs/llm-computing-history-plan.md`와 `docs/llm-computing-history.yml`을 사용한다.

1. `npm run history:status`와 `npm run history:check`로 `initiative.current_batch`, `next_action`, owner 의존성, 본편 상태를 확인한다.
2. LLM_Wiki를 정본으로 유지한다. `C:\Vault\CS_Wiki`는 읽기와 외부 맥락 링크에만 사용하며 수정하지 않는다.
3. 컴퓨팅 역사 주장은 CS_WIKI 문서가 아니라 LLM_Wiki의 evidence 레지스트리에 등록한 1차 자료와 locator로 뒷받침한다.
4. 각 본편은 일곱 능력층, 여섯 항목 측정 장부, 직접 영향·가능 조건·병행 맥락·후대 유추의 인과 구분을 적용한다.
5. 반복 설명은 owner concept 하나가 맡고 본편은 현재 시대의 조건과 실제 사용만 국소적으로 설명한다.
6. 배치 전후에 원장의 stage, `next_action`, blockers와 handoff를 실제 상태로 갱신한다. `raw/`와 정규 source 번호는 건드리지 않는다.
7. 관련 파일만 `content:` 커밋으로 `main`에 커밋하고 `origin/main`에 푸시한다. 공개 문서가 없는 계획·검사기 배치는 `docs:`를 사용한다.

사용자가 정확히 `하던 작업 계속 진행`이라고만 쓴 경우에는 이 절이 아니라 6.0의 정규 source 재개 규칙이 계속 우선한다.

### 6.8 `LLM 시스템 경계 확장`

사용자가 `LLM 시스템 경계 확장 계속`, `시스템 경계 확장 계속`, `boundary:resume`, 에너지·데이터 생애주기·메모리 보장·문자에서 실행 권한·안전한 외부 효과·실시간 멀티모달의 확장 원장 작업을 요청하면 `docs/llm-system-boundary-network-plan.md`와 `docs/llm-system-boundary-network.yml`을 사용한다.

1. 새 세션 또는 중단 뒤에는 `git status --short --branch`, `npm run boundary:resume`, `npm run boundary:check` 순서로 원격·작업 트리·원장의 유일한 `current_batch`를 확인한다.
2. `boundary:resume`이 제시한 배치만 수행한다. 예상 경로 밖의 기존 사용자 변경과 `.codex-remote-attachments/`는 보존하고 staging하지 않는다.
3. `HEAD`가 `origin/main`보다 앞서면 다음 배치를 시작하지 않고 push를 먼저 재시도한다. 원격이 앞서거나 branch가 diverged하면 자동 병합하지 않고 상태를 보고한다.
4. 각 track은 입력·대상, 변환 경로, 시간·상태·자원, 결과 계약, 지표·평가 기준, 실패·복구 경계, 권한·책임·출처 추적을 모두 설명한다.
5. 기존 수학·컴퓨팅 역사 원장의 완료 batch·owner·hub stage는 다시 열지 않는다. 최종 통합에서 handoff와 학습 감사 baseline만 갱신한다.
6. `raw/`, 정규 source 번호와 `C:\Vault\CS_Wiki`는 수정하지 않는다. CS_Wiki는 읽기와 외부 맥락 링크에만 사용하며, 주장 근거는 LLM_Wiki evidence 레지스트리에 등록한 원문과 locator로 뒷받침한다.
7. 각 공개 배치는 `npm run learning:audit`, `npm run sync:index`, `npm run boundary:check`, `npm run history:check`, `npm run math:check`, `npm run learning:audit:check`, `npm run verify`, `git diff --check`, desktop·390×844 시각 검수를 통과한 뒤 원장의 다음 batch를 기록하고, 선언된 `content:` 또는 `docs:` 메시지로 `main`에 커밋·푸시한다.

사용자가 정확히 `하던 작업 계속 진행`이라고만 쓴 경우에는 이 절이 아니라 6.0의 정규 source 재개 규칙이 계속 우선한다.

## 7. 특수 문서

### 7.1 index.md

- 모든 source·reference·entity·concept·analysis를 유형별로 한 번씩 나열한다.
- 항목에는 한 줄 설명과 근거 수를 표시한다.
- 생성·삭제·제목 변경 시 반드시 갱신한다.

### 7.2 overview.md

- 현재 범위, 문서 수, 검증 상태와 주요 진입점을 설명한다.
- 원문 결손과 이미 해결된 검증 문제를 현재 미해결 상태처럼 남기지 않는다.

### 7.3 log.md

- 최신 기록을 아래에 추가한다.
- 형식: `## [YYYY-MM-DD] 작업유형 | 제목`
- 작업유형: `ingest`, `reference`, `content`, `fix`, `schema`, `lint`, `site`, `docs`.
- 변경 문서, 검증 근거, 남은 제한을 기록한다.

## 8. 커밋 메시지

영어로 작성하며 다음 접두사를 사용한다.

- `ingest: number_title`
- `reference: short_title`
- `content: short_title`
- `fix: short_title`
- `schema: short_title`
- `lint: short_title`
- `site: short_title`
- `docs: short_title`

정규 번호 소스의 번역·raw 복사 단계에서는 커밋·푸시하지 않는다. 공개 소스 처리와 전체 검증을 마친 뒤 raw·레지스트리·wiki 변경을 하나의 `ingest` 커밋으로 묶어 `main`에 푸시하며, 모든 경로와 메시지에 같은 공식 장 번호를 쓴다.

## 9. 작업 원칙

1. 현재 프로젝트 폴더 안에서만 위키·스키마·사이트를 수정한다.
2. 원문 검증이 필요할 때 외부의 1차 자료를 읽을 수 있지만, 현재 프로젝트에 필요한 결과만 기록한다.
3. `raw/`는 수정하지 않는다.
4. 사실과 해석, 원문과 번역, 역사적 시기를 구분한다.
5. 큰 변경은 `log.md`에 기록하고 lint·사이트 빌드로 검증한다.
