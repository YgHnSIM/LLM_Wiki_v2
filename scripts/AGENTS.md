# scripts 작업 지침

## OVERVIEW

`scripts/`는 위키 문서·raw·원장·정적 사이트를 연결하는 Node.js ESM CLI 계층이다. 최상위 `.mjs`는 대체로 import 시점에 실행되므로, 파일을 읽는 것만으로도 CLI 부작용이 생길 수 있다.

## WHERE TO LOOK

| 목적 | 위치 |
| --- | --- |
| 위키 lint | `lint-wiki.mjs`, `lib/frontmatter-schema.mjs`, `lib/registry-schema.mjs`, `lib/wiki-lint.mjs` |
| 사이트 생성·검사 | `build-site.mjs`, `check-site.mjs`, `serve-site.mjs`, `lib/atomic-directory.mjs` |
| source/raw workflow | `source-workflow.mjs`, `lib/source-numbering.mjs`, `lib/raw-integrity.mjs`, `check-raw-immutability.mjs` |
| 문서·경로 공통 기반 | `lib/wiki-utils.mjs`, `lib/project-paths.mjs`, `lib/site-paths.mjs` |
| initiative 원장 | `math-network-status.mjs`, `llm-computing-history-status.mjs`, `llm-system-boundary-status.mjs` |
| 회귀 테스트 | `tests/`, 브라우저 테스트는 `browser-tests/` |

## COMMANDS

- 읽기·검증 중심: `npm test`, `npm run lint:wiki`, `npm run raw:check`, `npm run learning:audit:check`, `npm run math:check`, `npm run history:check`, `npm run boundary:check`, `npm run check:site`.
- 파일을 쓰는 명령: `sync:index`, `build`, `build:site`, `learning:audit`, `catalog:sync`, `evidence:baseline`, `translation:normalize`, `page:v3:normalize`.
- `source:copy`는 누락 raw와 registry만 추가하고 기존 artifact를 덮어쓰지 않는다. 자동 commit/push는 수행하지 않는다.
- `source:ready`는 검사와 `npm run verify`를 실행하지만 staging·commit·push하지 않는다. 공식 047은 일반 번역 workflow가 아니다.
- 사이트 빌드는 `dist/`를 원자적으로 재생성한다. 실패 시 기존 출력 보존 계약을 `atomic-directory.test.mjs`로 확인한다.

## CONVENTIONS

- 경로는 `lib/project-paths.mjs`의 상수를 사용한다. `dist` 대체 경로는 `LLM_DIST_DIR`의 안전성 검사를 통과해야 한다.
- 공통 함수 변경은 대응 `scripts/tests/` 테스트와 `npm run lint:wiki`/`npm run check:site` 영향 범위를 함께 확인한다.
- `sync:index`는 읽기 검사가 아니라 `wiki/index.md`와 학습 audit를 갱신하는 쓰기 단계다.
- 원장 status 스크립트는 단순 출력기가 아니라 stage, owner, dependency, blocker, handoff 계약을 집행하는 정책 코드다.

## ANTI-PATTERNS

- `raw/` 파일을 직접 수정·삭제·덮어쓰지 않는다. 오류는 `wiki/`와 evidence locator로 정정한다.
- CLI에서 Git commit, stage, push를 자동화하지 않는다.
- generated `dist/`, Playwright 결과, 임시 fixture를 소스처럼 커밋하지 않는다.
- 검증 실패를 무시하거나 테스트를 약화해 통과시키지 않는다.
