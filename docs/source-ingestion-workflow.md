# 번역부터 공개 소스 처리까지

정규 번호 소스 하나를 외부 영어 원문에서 한국어 번역·해설, immutable raw artifact, 검증된 공개 위키 문서로 옮기는 표준 절차다. 아래 예시는 `010`을 사용한다.

## 단계와 Git 경계

```text
/lt 010
  → 번역·해설 쌍 검증
  → source:copy (raw + SHA-256, Git 작업 없음)
  → 1차 자료 검증과 공개 위키 작성
  → source:ready (전체 검사, Git 작업 없음)
  → 변경 범위 검토
  → main에서 ingest 커밋 1회 + push 1회
  → 완성 소스가 열 편째라면 분석 주제 탐색·선정·작성·검증
  → main에서 content 커밋 1회 + push 1회
```

원칙은 단순하다. raw 복사만 끝난 상태에서는 커밋하거나 푸시하지 않는다. 공개 `source.NNN`과 파생 문서, 색인·개요·로그, 외부 evidence까지 완성되고 전체 검증을 통과한 뒤에만 한 번 커밋한다.

## 1. 번역 대상 선택

Codex에 다음 명령을 입력한다.

```text
/lt 010
```

`translate-llm-sources` 워크플로가 숫자 접두사의 원문을 찾아 다음 파일을 새로 만든다.

- `C:\Vault\ObsidianVault\LLM_ko\<source-stem>.ko.md`
- `C:\Vault\ObsidianVault\LLM_ko\<source-stem>.commentary.ko.md`

번역은 원문에 충실한 초벌과 자연스러운 한국어 다듬기를 분리한다. 해설은 12개 필수 절을 갖추고, 원문 결손·과장·연대 문제와 현대적 연결을 번역 본문과 분리해 기록한다. 기존 출력은 사용자가 명시적으로 재생성을 지시하지 않는 한 덮어쓰지 않는다.

## 2. 상태 확인

프로젝트 루트에서 실행한다.

```powershell
npm run source:status -- 010
```

이 명령은 읽기 전용이다. 다음 상태를 보여준다.

- 선택된 외부 원문 파일
- 번역·해설 쌍의 존재 여부
- 프로젝트 `raw/` 복사 여부
- `wiki/sources/`의 `source.010` 존재 여부
- 이미 존재하는 raw·레지스트리 항목과 번역 출력의 일치 여부

## 3. raw 복사와 등록

```powershell
npm run source:copy -- 010
```

명령은 다음 작업만 수행한다.

1. 번역·해설 파일의 존재, UTF-8 텍스트, H1, frontmatter, 코드 펜스, mojibake, 해설 placeholder를 검사한다.
2. 두 파일을 같은 이름으로 `raw/`에 복사한다.
3. SHA-256을 계산해 `wiki/meta/raw-artifacts.yml`에 `translation`, `commentary` 역할로 등록한다.
4. 복사본과 레지스트리를 다시 읽어 해시를 확인한다.

이 명령은 Git을 호출하지 않는다. 파일이 이미 있고 바이트가 같으면 반복 실행해도 변경하지 않는다. 기존 raw와 내용이 다르면 불변 규칙에 따라 덮어쓰지 않고 실패한다.

이 단계가 끝나도 커밋·푸시하지 않는다. raw 파일과 레지스트리 변경은 다음 공개 소스 처리 단계까지 작업 트리에 남겨 둔다.

## 4. 외부 근거 검증

raw는 수집 상태를 보존한 artifact이며 사실의 기준이 아니다. 다음 순서로 외부 근거를 확보한다.

1. 저자의 원 논문·기술 보고서·공식 코드 아카이브 같은 1차 자료를 우선한다.
2. 개발 시기, 발표 시기, 후대 명칭과 평가를 분리한다.
3. 주장마다 재확인 가능한 페이지·절·표·코드 위치를 정한다.
4. `wiki/meta/evidence.yml`에 고유 `source_id`, 서지정보, DOI·URL을 등록한다.
5. raw 오류나 결손은 공개 문서의 `검증 정정` 또는 `원문 상태`에 기록하고 raw 자체는 수정하지 않는다.

## 5. 공개 위키 작성

최소 산출물은 `wiki/sources/<NNN_제목>.md`이며 frontmatter ID는 `source.NNN`이다.

소스 페이지에는 다음을 포함한다.

- 핵심 요약과 역사·기술 범위
- raw의 오류·결손·과장에 대한 검증 정정
- 직접 인용이 아닌 검증된 핵심 문장
- 사람이 읽을 수 있는 외부 출처와 locator
- 마지막 H2인 `## 관련 항목`

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

- 번역·해설과 raw 복사본의 바이트가 일치함
- 두 raw artifact의 레지스트리 필드와 SHA-256이 일치함
- `source.010` 공개 페이지가 존재함
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

브랜치를 새로 만들거나 병합하지 않는다. raw 복사 커밋과 공개 처리 커밋을 나누지 않는다.

## 8. 열 편마다 분석 주제 발굴

마지막 분석 주제 발굴 이후 공개 처리와 `origin/main` 푸시까지 끝난 정규 번호 소스가 열 편이 되면 다음 소스의 raw 복사·공개 처리보다 분석 주제 탐색을 먼저 수행한다. 접두사가 비어 있는 번호는 새 자료를 만들지 않고 건너뛰므로, 번호 구간의 길이가 아니라 실제 완성된 소스 문서 수를 센다.

새로 완성된 열 개의 소스 문서를 출발점으로 삼되, 기존의 검증된 source·concept·entity·analysis 문서도 함께 읽는다. 목표는 열 편을 빠짐없이 한 표에 넣는 것이 아니라 다음과 같은 분석 가치가 있는 주제를 찾는 것이다.

- 서로 다른 시기의 기술이 같은 문제를 어떤 표현과 계산으로 다뤘는가
- 수작업 규칙·구조·특징과 데이터에서 학습한 값의 경계가 어떻게 달라졌는가
- 시연, 제한된 실험, 제품 배치, 철학적 논증처럼 증거 종류가 어떻게 다른가
- 후대의 직접 계보로 오해되기 쉬운 구조적 유사성과 실제 영향 관계를 어떻게 구분할 것인가
- 기존 분석에 빠진 반례·정정·연결이 무엇인가

후보 가운데 외부 근거와 기존 위키 연결이 가장 탄탄한 주제 하나를 선택한다. `[[N-gram에서 LLM으로]]`, `[[AI 시연과 실제 성능]]`, `[[규칙 기반 AI에서 데이터 기반 학습으로]]`처럼 질문과 범위를 먼저 정하고, `wiki/analyses/<주제>.md`에 작성해 사이트의 ‘비교 읽기’ 코너에 넣는다. 파일명과 제목에 숫자 범위를 강제하지 않으며, 새 열 편 전부를 비교 대상으로 삼지 않는다. 해당 논점을 설명하는 데 필요한 신규·기존 자료만 포함한다.

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
- raw 파일이 이미 있으나 해시가 다름: 자동 덮어쓰기를 금지하고 원인을 조사한다.
- 레지스트리에는 있으나 raw 파일이 없음: 번역 출력에서 재생성하지 말고 Git의 보존본을 복구한다.
- evidence locator가 없음: `verified`로 올리지 않고 근거 위치를 먼저 확보한다.
- `source:ready` 실패: 오류를 수정하고 전체 검사를 다시 실행한다. 실패 상태에서는 커밋·푸시하지 않는다.
