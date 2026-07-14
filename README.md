# LLM Wiki v2

초기 언어 모델, AI 평가, 기계 번역, 신경망 학습, 언어 구조, 대화형 AI의 역사를 연결해서 읽는 Markdown 기반 위키다. 공개 지식의 기준은 `wiki/` 문서와 locator가 있는 evidence이며, `raw/`는 수집 당시 상태를 보존한 불변 artifact다.

## 로컬 빌드

```powershell
npm install
npm run lint:wiki
npm run build
npx serve dist
```

`BASE_PATH`를 지정하면 GitHub Pages의 프로젝트 경로를 반영할 수 있다.

```powershell
$env:BASE_PATH='/LLM_Wiki_v2'
npm run build
```

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
- `wiki/meta/page.schema.json`: frontmatter 스키마 v2
- `wiki/meta/evidence.yml`: 외부 근거와 DOI·URL 레지스트리
- `wiki/meta/raw-artifacts.yml`: raw 역할·출처 상태·SHA-256 레지스트리
- `wiki/meta/tags.yml`: 허용 태그 사전
- `scripts/lint-wiki.mjs`: 스키마·근거·링크·raw 무결성 검사
- `scripts/build-site.mjs`: 정적 사이트 생성기
- `site/assets`: 사이트 스타일과 브라우저 스크립트

## 문서 상태

스키마 v2는 편집 수명주기 `lifecycle`과 사실 검증 상태 `verification`을 분리한다. 비메타 문서는 `evidence`에 근거 ID와 문헌 내 위치를 기록하며, `artifacts`에는 실제 `raw/` 파일 경로만 기록한다. 상세 규칙은 `AGENTS.md`를 따른다.
