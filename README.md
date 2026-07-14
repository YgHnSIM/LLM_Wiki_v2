# LLM Wiki v2

초기 언어 모델, AI 평가, 기계 번역, 신경망 학습, 언어 구조, 대화형 AI의 역사를 연결해서 읽는 Markdown 기반 위키다. `wiki/`의 문서를 단일 원본으로 사용하며, 정적 사이트는 빌드 시 자동 생성된다.

## 로컬 빌드

```powershell
npm install
npm run build
npx serve dist
```

`BASE_PATH`를 지정하면 GitHub Pages의 프로젝트 경로를 반영할 수 있다.

```powershell
$env:BASE_PATH='/LLM_Wiki_v2'
npm run build
```

## GitHub Pages

`main` 브랜치에 푸시하면 `.github/workflows/pages.yml`이 `dist/`를 빌드해 GitHub Pages에 배포한다. 저장소의 **Settings → Pages → Build and deployment**에서 Source를 **GitHub Actions**로 선택해야 한다.

## 구조

- `wiki/sources`: 원문별 핵심 소스 노트
- `wiki/concepts`: 개념 노트
- `wiki/entities`: 인물·기관 노트
- `wiki/analyses`: 소스 간 연결 분석
- `scripts/build-site.mjs`: 정적 사이트 생성기
- `site/assets`: 사이트 스타일과 브라우저 스크립트
