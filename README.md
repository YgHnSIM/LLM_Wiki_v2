# LLM Wiki v2

초기 언어 모델, AI 평가, 기계 번역, 신경망 학습, 언어 구조, 대화형 AI의 역사를 연결해서 읽는 Markdown 기반 위키다. 공개 지식의 기준은 `wiki/` 문서와 locator가 있는 evidence이며, `raw/`는 수집 당시 상태를 보존한 불변 artifact다.

프로젝트의 목적·구조·작동 방식·기술 용어를 학습자료 형식으로 설명한 [상세 해설서](readmeplus.md)도 제공한다.

## 로컬 빌드

Node.js 22 이상이 필요하다. lockfile과 동일한 의존성을 설치한 뒤 테스트, 위키 lint, 사이트 빌드, 산출물 검사를 한 번에 실행한다.

```powershell
npm ci
npm run verify
npx serve dist
```

`BASE_PATH`를 지정하면 GitHub Pages의 프로젝트 경로를 반영할 수 있다.

```powershell
$env:BASE_PATH='/LLM_Wiki_v2'
npm run build
```

개별 단계는 `npm test`, `npm run lint:wiki`, `npm run build:site`, `npm run check:site`로 실행할 수 있다. `npm run check`는 오래된 `dist/`를 검사하지 않도록 전체 `verify` 파이프라인을 다시 실행한다.

## 번역부터 소스 처리까지

정규 번호 소스는 번역·해설 생성, raw 보존, 공개 위키 검증을 분리한다. 예를 들어 `010`은 다음 순서로 처리한다.

```powershell
# Codex 명령: /lt 010
npm run source:status -- 010
npm run source:copy -- 010

# 외부 1차 자료로 wiki/sources·entities·concepts·analyses를 작성한 뒤
npm run sync:index
npm run source:ready -- 010
```

`source:copy`는 번역 쌍을 검사하고 `raw/`와 SHA-256 레지스트리만 갱신한다. 이 단계에서는 커밋·푸시하지 않는다. `source:ready`도 전체 검증만 수행하며 Git을 변경하지 않는다. 공개 소스 처리가 끝난 뒤 변경 범위를 검토해 `main`에서 한 번만 커밋·푸시한다. 자세한 절차와 실패 복구 규칙은 [소스 수집 워크플로](docs/source-ingestion-workflow.md)에 있다.

명령의 세 자리 값은 [공식 책 목차 번호](docs/source-numbering.md)다. 외부 원문·번역·raw 파일명, `order_prefix`, 공개 `source.NNN`, 위키 파일·URL·커밋이 모두 같은 번호를 쓴다. 공식 047은 upstream 원문이 없어 `wiki/meta/source-gaps.yml`에 결손으로 기록하며 다른 문서에 재사용하지 않는다.

## 사이트 기능

- 헤더 자동완성과 `/search/` 전체 검색에서 제목·별칭·본문을 찾고, 문서 유형·검증 상태·태그·정렬 조건으로 좁힐 수 있다.
- 문서 상세 화면은 요약, 접이식 목차, 본문, 근거 장부, 관련 읽기, 역링크 순서로 구성한다.
- 목록 화면은 텍스트·검증 상태 필터와 제목·갱신일·연결 수 정렬을 제공한다.
- 헤더의 **본문 글꼴**에서 기본 글꼴, 리디바탕, D2Coding을 선택할 수 있다. 선택값은 브라우저에 저장되며 긴 글 본문과 설명 문장에 적용된다.

웹폰트는 `site/assets/fonts/`에 자체 호스팅한다. D2Coding 1.3.2와 RIDIBatang 1.0.1은 SIL Open Font License 1.1을 따르며, 출처와 저작권 표시는 `site/assets/fonts/NOTICE.md`에 기록한다.

## GitHub Pages

`main` 브랜치에 푸시하면 `.github/workflows/pages.yml`이 `dist/`를 빌드해 GitHub Pages에 배포한다. 저장소의 **Settings → Pages → Build and deployment**에서 Source를 **GitHub Actions**로 선택해야 한다.

## 구조

- `wiki/sources`: 원문별 검증·정정 소스 노트
- `wiki/concepts`: 개념 노트
- `wiki/entities`: 인물·기관 노트
- `wiki/analyses`: 소스 간 연결 분석
- `wiki/meta/page.schema.json`: frontmatter 스키마 v3 (ID 네임스페이스·학습 경로·검토 메타데이터)
- `wiki/meta/schemas`: evidence·raw·source catalog·redirect 레지스트리 JSON Schema
- `wiki/meta/evidence.yml`: 외부 근거와 DOI·URL 레지스트리
- `wiki/meta/raw-artifacts.yml`: raw 역할·출처 상태·SHA-256 레지스트리
- `wiki/meta/source-catalog.yml`: 공개 source/reference 페이지와 공식 번호의 단일 색인
- `wiki/meta/evidence-scope-baseline.yml`: 근거 locator 변경을 감시하는 baseline
- `wiki/meta/tags.yml`: 허용 태그 사전
- `scripts/lint-wiki.mjs`: JSON Schema와 근거·링크·raw 무결성 검사
- `scripts/source-workflow.mjs`: 번역 상태·raw 복사·공개 소스 처리 준비 상태 검사
- `scripts/build-site.mjs`: 임시 디렉터리에서 완성한 뒤 `dist/`를 교체하는 정적 사이트 생성기
- `scripts/lib`: 문서 로딩, 위키 링크, 출력 경로, 원자적 빌드 공통 모듈
- `scripts/tests`: Node.js 내장 테스트 러너 기반 회귀 테스트
- `site/assets`: 사이트 스타일과 브라우저 스크립트

## 문서 상태

스키마 v3는 영구 ID 네임스페이스, `editorial_status`, `review`, `learning`, 방향성 `relations`를 분리한다. 기존 `lifecycle`·`verification` 값은 마이그레이션 도구가 의미를 보존해 `editorial_status`·`review`로 옮겼다. 비메타 문서는 `evidence`에 근거 ID와 문헌 내 위치를 기록하며, `artifacts`에는 실제 `raw/` 파일 경로만 기록한다. 상세 규칙은 `AGENTS.md`를 따른다.
