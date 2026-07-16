# LLM Wiki v2 — Schema & Operating Instructions

이 문서는 현재 프로젝트의 위키를 유지·검증·배포할 때 따르는 규칙이다. `wiki/`의 정리된 문서가 공개 지식베이스의 기준이며, `raw/`는 수정하지 않는 보존 자료다.

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
2. 각 raw Markdown은 `wiki/meta/raw-artifacts.yml`에 역할, 출처 상태, SHA-256 해시를 기록한다.
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

### 6.1 번역과 raw 보존

1. `/lt NNN`으로 `C:\Vault\ObsidianVault\Assets\LLM_sources`의 단일 원문을 새로 번역하고 해설을 작성한다.
2. 번역과 해설은 `C:\Vault\ObsidianVault\LLM_ko`에 동일 stem의 `.ko.md`, `.commentary.ko.md` 쌍으로 저장하고 스킬 검사를 통과해야 한다.
3. `npm run source:status -- NNN`으로 입력·출력·raw·공개 페이지 상태를 확인한다.
4. `npm run source:copy -- NNN`으로 검증된 쌍을 `raw/`에 복사하고 `raw-artifacts.yml`에 SHA-256을 등록한다.
5. raw 복사 단계에서는 커밋·푸시하지 않는다. 기존 raw와 내용이 다르면 덮어쓰지 않고 중단한다.

### 6.2 공개 소스 처리

1. raw artifact와 외부 원문 출처를 구분해 확인한다.
2. 외부 1차 자료를 evidence 레지스트리에 등록한다.
3. `wiki/sources/`에 요약·검증 정정·핵심 문장·출처·관련 항목을 작성한다.
4. 관련 entity·concept·analysis를 갱신한다.
5. `index.md`, `overview.md`, `log.md`를 갱신한다. log에는 raw 보존과 공개 처리 결과를 하나의 ingest 기록으로 남긴다.
6. `npm run sync:index` 후 `npm run source:ready -- NNN`으로 단위 테스트, wiki lint, 사이트 빌드와 산출물 검사를 실행한다.
7. 현재 브랜치가 `main`이고 변경 범위가 해당 소스에 한정됐는지 확인한 뒤 `ingest: number_title`로 한 번만 커밋하고 `origin/main`에 푸시한다. 브랜치를 새로 만들지 않는다.

세부 절차와 실패 복구 규칙은 `docs/source-ingestion-workflow.md`를 따른다.

### 6.3 열 개 단위 비교 읽기

1. 마지막 비교 읽기 이후 `main`에 공개 처리·푸시까지 끝난 정규 번호 소스를 순서대로 센다. 숫자 접두사가 비어 있으면 자료를 만들지 않고 건너뛰며, 실제로 완성된 소스 열 개를 기준으로 한다.
2. 열 번째 소스가 푸시되면 다음 소스의 raw 복사·공개 처리보다 먼저 `wiki/analyses/`에 `<첫 번호>–<마지막 번호> 비교 읽기: <주제>` 문서를 작성한다.
3. 비교 읽기는 정확히 그 열 편의 검증된 공개 소스를 사용해 문제, 표현 단위, 사람이 설계한 부분, 데이터에서 학습·추정한 부분, 직접 증거와 한계를 나란히 비교한다. 후대 기술로 이어지는 단선적 인과는 만들지 않는다.
4. 문서는 `page_type: analysis`, `verification: partial`을 기본으로 하며, 외부 evidence locator와 각 소스의 raw artifact를 연결한다. `## 출처`와 마지막 `## 관련 항목`에는 비교 대상 열 편을 빠짐없이 적는다.
5. `index.md`, `overview.md`, `log.md`를 갱신하고 `npm run sync:index`와 `npm run verify`를 통과시킨다.
6. 현재 브랜치가 `main`인지 확인한 뒤 `content: first_last_comparative_reading`으로 별도 커밋해 `origin/main`에 푸시한다. 이 비교 읽기가 원격에 반영된 뒤에만 다음 소스 공개 처리를 계속한다.

### 6.4 참고 자료 보강

- 정규 번호 소스가 아니면 `page_type: reference`와 `type/reference`를 사용한다.
- 기존 주장 보강이 목적이면 새 개념을 불필요하게 만들지 않는다.
- 외부 근거는 evidence 레지스트리에, 물리 파일은 raw artifact 레지스트리에 각각 추가한다.

### 6.5 점검

`scripts/lint-wiki.mjs`는 다음을 실패 조건으로 검사한다.

- `wiki/meta/page.schema.json`에 대한 frontmatter 구조·타입·enum 검증
- 폴더·`page_type`·`type/*` 일치
- ID 중복, H1·title 불일치
- 허용되지 않은 태그
- 존재하지 않거나 해시가 달라진 raw artifact
- 존재하지 않는 evidence ID, 빈 locator
- 비메타 문서의 `## 출처` 누락
- 빨간 링크와 색인 누락·중복·근거 수 불일치
- `## 관련 항목`의 위치
- 검증된 문서의 해결되지 않은 경고
- 출처 없는 인용문 형식

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

정규 번호 소스의 번역·raw 복사 단계에서는 커밋·푸시하지 않는다. 공개 소스 처리와 전체 검증을 마친 뒤 raw·레지스트리·wiki 변경을 하나의 `ingest` 커밋으로 묶어 `main`에 푸시한다.

## 9. 작업 원칙

1. 현재 프로젝트 폴더 안에서만 위키·스키마·사이트를 수정한다.
2. 원문 검증이 필요할 때 외부의 1차 자료를 읽을 수 있지만, 현재 프로젝트에 필요한 결과만 기록한다.
3. `raw/`는 수정하지 않는다.
4. 사실과 해석, 원문과 번역, 역사적 시기를 구분한다.
5. 큰 변경은 `log.md`에 기록하고 lint·사이트 빌드로 검증한다.
