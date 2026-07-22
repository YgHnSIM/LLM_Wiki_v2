# 번역부터 공개 소스 처리까지

정규 번호 소스 하나를 외부 영어 원문에서 한국어 번역·해설, immutable raw artifact, 검증된 공개 위키 문서로 옮기는 표준 절차다. 아래 예시는 `010`을 사용한다.

## 단계와 Git 경계

```text
/lt 010
  → 번역·해설 쌍 검증
  → source:copy (raw + 원문 source_url + SHA-256, Git 작업 없음)
  → 1차 자료 검증과 공개 위키 작성
  → source:ready (전체 검사, Git 작업 없음)
  → 변경 범위 검토
  → main에서 ingest 커밋 1회 + push 1회
  → 의미 있는 교차 문서 질문이 확인되면 분석 주제 탐색·선정·작성·검증
  → 분석을 작성한 경우 main에서 content 커밋 1회 + push 1회
```

원칙은 단순하다. raw 복사만 끝난 상태에서는 커밋하거나 푸시하지 않는다. 공개 `source.NNN`과 파생 문서, 색인·개요·로그, 외부 evidence까지 완성되고 전체 검증을 통과한 뒤에만 한 번 커밋한다.

## 하나의 공식 번호

명령행의 `NNN`은 **공식 책 목차 장 번호**다. 외부 원문·번역·raw 파일명, `raw-artifacts.yml`의 `order_prefix`, 공개 `source.NNN`, `wiki/sources/` 파일명, 위키 링크, 사이트 URL과 ingest 커밋이 모두 같은 번호를 사용한다. 예를 들어 `source:ready -- 080`은 `080` Chain-of-Thought 원문·번역·raw와 공개 `source.080`을 검사한다.

공식 047은 upstream 원문이 없는 결손 장이며 표준 번역 흐름의 예외다. 외부 원문·번역본 없이 1차 문헌 기반 `editorial-reconstruction`·`editorial-commentary` raw와 `source.047`을 공개했고, `wiki/meta/source-gaps.yml`에 원문 결손과 재구성 상태를 함께 기록한다. `/lt 047`과 `source:* -- 047`은 적용하지 않는다. 근거·예외·미래 처리 규칙은 [소스 번호 체계](source-numbering.md)를 따른다.

## 중단 뒤 재개

새 세션에서 `하던 작업 계속 진행`이라고 입력하면 외부 원문 목록에서 실제 원문이 있는 첫 미완료 **공식 번호**를 찾고 이 문서의 기존 절차를 한 번에 하나씩 그대로 적용한다. 현재 upstream 원문 109개와 공식 047 편집부 재구성까지 공개를 마쳐 다음 순차 입력은 없다. 새 upstream 장이 생기면 먼저 `git status --short --branch`와 `npm run source:status -- NNN`으로 상태를 확인하고, 기존 번역본을 무시한 채 `/lt NNN`부터 다시 시작한다. 완료된 단계를 중복하지 않으며 별도 브랜치·상태 파일·재개 명령은 만들지 않는다.

## 1. 번역 대상 선택

Codex에 다음 명령을 입력한다.

```text
/lt 010
```

`translate-llm-sources` 워크플로가 숫자 접두사의 원문을 찾아 다음 파일을 새로 만든다.

- `C:\Vault\ObsidianVault\LLM_ko\<source-stem>.ko.md`
- `C:\Vault\ObsidianVault\LLM_ko\<source-stem>.commentary.ko.md`

번역은 원문에 충실한 초벌과 자연스러운 한국어 다듬기를 분리한다. 해설은 12개 필수 절을 갖추고, 원문 결손·과장·연대 문제와 현대적 연결을 번역 본문과 분리해 기록한다. 새 번호를 시작할 때는 기존 출력을 참고하거나 재사용하지 않고 새로 번역한다. 같은 작업 중 이번에 새로 만들고 검증한 쌍만 중단 지점부터 이어서 사용할 수 있다.

번역본에는 첫 Markdown 제목 바로 뒤에 `원본 출처: <원문 URL>`을 정확히 한 번 둔다. 원문 웹 페이지의 `읽기 수준`, 툴팁 표시 방식 같은 UI 안내는 번역하지 않는다. 등록이 끝난 전체 외부 번역 작업본은 다음 읽기 전용 명령으로 이 규칙과 레지스트리 URL의 일치를 점검할 수 있다.

```powershell
npm run translation:normalize:check
```

기존 작업본을 일괄 정비할 때만 `npm run translation:normalize -- --backup-dir <비어 있는 별도 경로>`를 사용한다. 이 명령은 모든 대상 번역본을 먼저 백업하고 검증된 표현만 바꾼다. 해설과 프로젝트 `raw/`는 수정하지 않는다.

## 2. 상태 확인

프로젝트 루트에서 실행한다.

```powershell
npm run source:status -- 010
```

이 명령은 읽기 전용이다. 다음 상태를 보여준다.

- 선택된 외부 원문 파일
- 번역·해설 쌍의 존재 여부
- 프로젝트 `raw/` 복사 여부
- 같은 공식 번호를 쓴 `wiki/sources/`의 `source.010` 존재 여부
- 이미 존재하는 raw와 레지스트리의 불변성 일치 여부, 외부 번역 출력과 raw 사이의 공개 후 표현 차이

## 3. raw 복사와 등록

```powershell
npm run source:copy -- 010
```

명령은 다음 작업만 수행한다.

1. 번역·해설 파일의 존재, UTF-8 텍스트, H1, frontmatter, 코드 펜스, mojibake, 해설 placeholder를 검사한다.
2. 두 파일을 같은 이름으로 `raw/`에 복사한다.
3. 원문 Markdown의 `Source:` 또는 `출처:` URL과 SHA-256을 `wiki/meta/raw-artifacts.yml`에 `translation`, `commentary` 역할로 등록한다.
4. 복사본과 레지스트리를 다시 읽어 해시를 확인한다.

이 명령은 Git을 호출하지 않는다. 파일이 이미 있고 바이트가 같으면 반복 실행해도 변경하지 않는다. 기존 raw와 내용이 다르면 불변 규칙에 따라 덮어쓰지 않고 실패한다.

이 단계가 끝나도 커밋·푸시하지 않는다. raw 파일과 레지스트리 변경은 다음 공개 소스 처리 단계까지 작업 트리에 남겨 둔다.

### 공개 후 표현 전용 편집과 raw 보존 경계

ingest가 끝난 뒤 외부 `LLM_ko` 번역·해설은 출처 표기 통일, UI 안내문 제거, 문장 다듬기처럼 사실 내용과 provenance를 바꾸지 않는 **표현 전용(presentation-only)** 편집을 받을 수 있다. 이때 프로젝트 `raw/`는 수집 당시 바이트를 보존하므로 외부 출력과 다시 동기화하거나 덮어쓰지 않는다.

- `source:status`와 `source:ready`는 raw 파일의 실제 SHA-256이 `raw-artifacts.yml`의 등록 SHA-256과 같고, `path`·`role`·`order_prefix`·`source_url` 등 레지스트리 문맥이 현재 공식 번호와 일치하면 외부 출력과 raw의 바이트 차이를 비치명적 보존 경고로만 표시한다.
- 이 경고가 있어도 `source:ready`는 공개 페이지·브랜치·전체 `npm run verify` 검사를 계속한다.
- `source:copy`는 재수집 명령이 아니다. 기존 raw와 현재 외부 출력이 다르면 경고 상태와 무관하게 immutable artifact 덮어쓰기를 거부한다.
- raw와 레지스트리의 SHA-256이 다르거나, 최종 검사에서 필요한 raw 또는 레지스트리 항목이 없으면 계속 치명적 오류로 처리한다.

## 4. 외부 근거 검증

raw는 수집 상태를 보존한 artifact이며 사실의 기준이 아니다. 다음 순서로 외부 근거를 확보한다.

1. 저자의 원 논문·기술 보고서·공식 코드 아카이브 같은 1차 자료를 우선한다.
2. 개발 시기, 발표 시기, 후대 명칭과 평가를 분리한다.
3. 주장마다 재확인 가능한 페이지·절·표·코드 위치를 정한다.
4. `wiki/meta/evidence.yml`에 고유 `source_id`, 서지정보, DOI·URL을 등록한다.
5. raw 오류나 결손은 공개 문서의 `검증 정정` 또는 `원문 상태`에 기록하고 raw 자체는 수정하지 않는다.

## 5. 공개 위키 작성

최소 산출물은 공식 장 번호를 쓴 `wiki/sources/<NNN_제목>.md`이며 frontmatter ID도 `source.NNN`이다. 연결한 raw artifact 경로와 레지스트리 `order_prefix`도 같은 `NNN`이어야 한다.

소스 페이지에는 다음을 포함한다.

- H1 직후 난이도·선수 지식·학습 목표를 밝히는 `학습 안내` callout
- 원자료가 다룬 문제와 필요한 기초 개념을 먼저 정의하고, 최소 예에서 작동 원리와 기술·근거로 깊어지는 3단계 본문
- 링크에 정의를 맡기지 않는 국소 선수 지식 설명과 실제 의존 관계를 따르는 다음 문서
- 핵심 수식의 모든 기호·shape·항·연산·단계별 계산, 사용 이유, 성립 가정, 필연적인 부분과 설계 선택, 대안과 실패 조건
- raw의 오류·결손·과장과 사실·해석·후대 평가를 구분하는 `검증과 한계`
- 본문으로 답할 수 있는 학습 확인 질문 2–3개와 다음 읽을 문서
- 사람이 읽을 수 있는 외부 출처와 locator
- 마지막 H2인 `## 관련 항목`

공개 문서를 쓰기 전에 전문용어·수학·역사 배경과 핵심 수식의 선수 지식을 감사한다. 여러 문서가 반복해서 의존하는 기초 개념이 부족하면 기존 concept를 먼저 보강하고, 독립적인 학습 질문과 근거가 있을 때만 새 concept를 만든다.

정확한 H2 순서와 유형별 하위 구조는 `docs/learning-structure-style-guide.md`를 따르고, 선수 지식 감사부터 수식 해설·품질 게이트까지의 전체 절차는 `docs/foundational-learning-workflow.md`를 따른다. 원문 기사 URL은 `## 출처`에서 “프로젝트 번역·검토 출발 자료”로 표시하고, 사실 검증에 쓰는 논문·공식 문서와 역할을 분리한다.

필요한 경우에만 entity·concept·analysis를 새로 만들거나 갱신한다. 새 문서를 만들기 전에 기존 페이지로 주장을 보강할 수 있는지 확인한다.

마지막으로 다음 메타 문서를 갱신한다.

- `wiki/index.md`: 모든 공개 페이지를 한 번씩 나열하고 근거 수 동기화
- `wiki/overview.md`: 소스·문서·근거·raw artifact 수와 현재 범위 갱신
- `wiki/log.md`: raw 보존과 공개 소스 처리, 검증 근거, 남은 제한을 하나의 ingest 기록으로 추가

## 6. 최종 검사

```powershell
npm run sync:index
npm run source:ready -- 010
```

`source:ready`는 다음 조건을 요구한다.

- 두 raw artifact의 실제 SHA-256이 레지스트리에 등록된 SHA-256과 일치함
- 두 raw artifact의 원문 `source_url`, `path`, `role`, 공식 `order_prefix`와 나머지 레지스트리 문맥이 일치함
- 외부 번역·해설이 공개 후 표현 전용 편집으로 raw와 달라졌다면 비치명적 보존 경고를 표시하고 검사를 계속함
- 같은 공식 번호의 `source.010` 공개 페이지가 존재함
- 현재 브랜치가 `main`임
- `npm run verify` 전체 통과

이 명령도 stage·commit·push를 수행하지 않는다.

## 7. 한 번만 커밋·푸시

먼저 작업 트리를 검토한다.

```powershell
git status --short --branch
git diff --check
git diff --stat
```

사용자 첨부 파일이나 다른 작업자의 변경을 제외하고 이번 소스에 해당하는 raw·레지스트리·wiki 파일만 명시적으로 stage한다. staged diff를 다시 확인한 뒤 실행한다.

```powershell
git commit -m "ingest: 010_short_title"
git push origin main
```

브랜치를 새로 만들거나 병합하지 않는다. raw 복사 커밋과 공개 처리 커밋을 나누지 않는다. 커밋 메시지에도 원문·raw·source와 같은 공식 장 번호를 쓴다.

## 8. 의미 기반 분석 주제 발굴

정규 번호 소스를 공개 처리할 때마다 새 문서와 기존의 검증된 source·concept·entity·analysis 문서를 함께 읽고, 별도의 비교 읽기 문서로 발전시킬 만한 질문이 생겼는지 판단한다. 분석 시점은 마지막 분석 이후의 소스 수나 번호 구간으로 정하지 않는다. 근거가 충분한 연결이 확인되면 다음 번호를 기다리지 않고 작성하고, 기존 문서 보강으로 충분하거나 비교 자체가 새 통찰을 만들지 못하면 새 분석 문서를 만들지 않는다.

목표는 일정 수의 소스를 빠짐없이 한 표에 넣는 것이 아니라 다음과 같은 분석 가치가 있는 주제를 찾는 것이다.

- 서로 다른 시기의 기술이 같은 문제를 어떤 표현과 계산으로 다뤘는가
- 수작업 규칙·구조·특징과 데이터에서 학습한 값의 경계가 어떻게 달라졌는가
- 시연, 제한된 실험, 제품 배치, 철학적 논증처럼 증거 종류가 어떻게 다른가
- 후대의 직접 계보로 오해되기 쉬운 구조적 유사성과 실제 영향 관계를 어떻게 구분할 것인가
- 기존 분석에 빠진 반례·정정·연결이 무엇인가

후보 가운데 외부 근거와 기존 위키 연결이 가장 탄탄한 주제 하나를 선택한다. `[[N-gram에서 LLM으로]]`, `[[AI 시연과 실제 성능]]`, `[[규칙 기반 AI에서 데이터 기반 학습으로]]`처럼 질문과 범위를 먼저 정하고, `wiki/analyses/<주제>.md`에 작성해 사이트의 ‘비교 읽기’ 코너에 넣는다. 파일명과 제목에 숫자 범위를 강제하지 않으며, 해당 논점을 설명하는 데 필요한 신규·기존 자료만 포함한다.

분석 문서는 `page_type: analysis`, `verification: partial`을 기본으로 한다. 실제 사용한 source note, 외부 evidence locator와 raw artifact를 연결하고, raw의 과장이나 오류를 새로운 사실로 재사용하지 않는다. 확인된 사실과 비교를 통한 해석을 분리하고, 직접 입증되지 않은 계보는 한계로 명시한다.

`wiki/index.md`, `wiki/overview.md`, `wiki/log.md`를 갱신한 뒤 실행한다.

```powershell
npm run sync:index
npm run verify
```

검증이 끝나면 분석 문서와 메타 변경만 명시적으로 stage하고 다음 형식으로 별도 커밋·푸시한다.

```powershell
git commit -m "content: short_analysis_topic"
git push origin main
```

분석 문서가 원격 `main`에 반영된 것을 확인한 다음에만 다음 번호의 raw 복사와 공개 소스 처리를 계속한다.

## 실패 복구

- 번역 쌍이 없거나 비어 있음: `/lt NNN`을 완료하고 쌍 검사를 다시 실행한다.
- 기존 번역을 새로 만들 필요가 있음: 사용자가 명시적으로 재생성을 지시한 경우에만 외부 `LLM_ko` 출력을 덮어쓴다.
- `source:copy`에서 기존 raw와 외부 출력 해시가 다름: 자동 덮어쓰기를 금지한다. 공개 후 표현 전용 편집이라면 raw를 그대로 보존하고 `status`·`ready`의 비치명적 경고를 받아들인다.
- raw 실제 해시와 레지스트리 SHA-256이 다름: immutable artifact 또는 레지스트리 손상이므로 Git 보존본과 이력을 확인해 복구한다.
- 레지스트리에는 있으나 raw 파일이 없음: 번역 출력에서 재생성하지 말고 Git의 보존본을 복구한다.
- evidence locator가 없음: `verified`로 올리지 않고 근거 위치를 먼저 확보한다.
- `source:ready` 실패: 오류를 수정하고 전체 검사를 다시 실행한다. 실패 상태에서는 커밋·푸시하지 않는다.
