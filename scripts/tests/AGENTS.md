# scripts/tests 테스트 지침

## OVERVIEW

`tests/`는 Node 내장 test runner로 운영 계약을 검증하는 회귀 테스트 모음이다. 현재 26개 테스트 파일이 schema·wiki lint·source/raw·원장·그래프·사이트 경계를 나눠 검사한다.

## WHERE TO LOOK

- 문서 계약: `frontmatter-schema.test.mjs`, `wiki-lint.test.mjs`, `wiki-utils.test.mjs`
- source/raw: `source-numbering.test.mjs`, `source-workflow.test.mjs`, `raw-integrity.test.mjs`, `artifact-readers.test.mjs`
- 사이트/그래프: `atomic-directory.test.mjs`, `site-redirects.test.mjs`, `site-paths.test.mjs`, `knowledge-graph.test.mjs`, `relationship-explorer.test.mjs`
- 수학·학습·원장: `llm-math-*.test.mjs`, `math-network-status.test.mjs`, `foundational-learning-audit.test.mjs`, `llm-computing-history-status.test.mjs`, `llm-system-boundary-status.test.mjs`

## COMMANDS

- 전체: `npm test` 또는 `node --test scripts/tests/*.test.mjs`
- 단일 파일: `node --test scripts/tests/<name>.test.mjs`
- 사이트 계약 변경 뒤에는 `npm run build:site`, `npm run check:site`, 필요하면 `npm run test:browser`까지 실행한다.

## CONVENTIONS

- 파일 I/O와 subprocess가 필요한 테스트는 `os.tmpdir()` 아래 격리된 fixture를 만들고 종료 시 정리한다.
- raw 무결성 테스트는 임시 Git 저장소를 사용하며, 실제 `raw/`, `wiki/`, `dist/`를 변경하지 않는다.
- site fixture는 `LLM_DIST_DIR`로 별도 출력 경로를 지정한다. atomic build 실패 시 기존 출력이 보존되는지 확인한다.
- 원장 테스트는 virtual file map과 주입된 상태를 사용해 실제 원장을 임의로 변경하지 않는다.
- 브라우저 UI 상태 테스트와 Playwright 시나리오를 구분한다. `site/assets`의 selector·data attribute 계약은 browser test로 확인한다.

## ANTI-PATTERNS

- 실패 테스트를 삭제·완화하거나 실제 저장소 artifact를 fixture로 사용하지 않는다.
- 테스트가 통과했다는 이유로 lint, raw hash, site check, browser 계약을 생략하지 않는다.
