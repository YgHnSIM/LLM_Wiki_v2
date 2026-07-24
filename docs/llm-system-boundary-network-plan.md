# LLM 시스템 경계 확장 실행 계획

이 문서는 `LLM을 만든 수학`과 `LLM과 컴퓨팅 능력의 공진화`가 이미 설명한 모델 내부와 컴퓨팅 계보를 보완한다. 목표는 LLM이 실제 시스템이 될 때 생기는 여섯 경계—에너지, 데이터, 메모리, 문자, 실행 권한, 실시간 멀티모달 상호작용—를 같은 비교 언어로 연결하는 것이다.

현재 실행 상태와 다음 행동의 단일 기준은 `docs/llm-system-boundary-network.yml`이다. 이 문서는 범위와 품질 기준을 설명하며, 대화 기록이나 작업자의 기억으로 진행 순서를 정하지 않는다.

## 1. 재개 가능한 실행 규칙

모든 완료 배치는 다음 배치를 가리키는 원장 갱신, 검증, commit, push를 하나의 경계로 삼는다.

1. 새 세션에서는 먼저 `git status --short --branch`, `npm run boundary:resume`, `npm run boundary:check`를 실행한다.
2. `boundary:resume`이 제시한 `current_batch` 외의 배치를 시작하지 않는다.
3. 중간 변경이 있으면 해당 배치의 `expected_paths` 안의 변경만 이어서 검증한다. 범위 밖 사용자 변경은 보존하고 staging하지 않는다.
4. `HEAD`가 `origin/main`보다 앞서면 다음 문서를 쓰지 않고 push만 재시도한다.
5. 원격이 앞서거나 branch가 diverged면 자동 병합하지 않는다. fetch 결과와 충돌 범위를 기록한 뒤 중단한다.
6. 배치가 완료되면 그 배치는 `complete`, 다음 배치는 `current_batch`와 `next_action`으로 기록한다. push가 확인되기 전에는 다음 배치를 시작하지 않는다.

세션 전환이나 문맥 압축으로 미커밋 작업이 사라진 경우에도 원격 원장은 마지막 완료 배치와 유일한 다음 배치를 보존한다. 따라서 부분 작업은 다시 시작할 수 있어도 순서를 건너뛰지 않는다.

## 2. 공통 경계 장부

각 우선순위 문서는 아래 일곱 항목을 실제 사례와 함께 채운다.

1. 입력·대상
2. 변환 경로
3. 시간·상태·자원
4. 결과 계약
5. 지표·평가 기준
6. 실패·복구 경계
7. 권한·책임·출처 추적

역사 계열 문서는 기존의 여섯 항목 측정 장부(작업, 규모, 결과 계약, 시스템 경계, 고정 조건, 지표)와 네 종류의 인과 표지(직접 영향, 가능 조건, 병행 맥락, 후대 유추)도 함께 사용한다.

## 3. 구현 순서

| 순서 | 배치 | 공개 결과 |
| --- | --- | --- |
| 0 | framework | 원장, 재개 검사기, 테스트, 명령, 작업 규칙 |
| 1 | energy owner | `LLM 추론 에너지 지표` |
| 2 | energy bridge | `전력에서 서비스 결과 계약까지 무엇을 세어야 하나` |
| 3 | data owner | `학습 데이터 생애주기와 출처 추적` |
| 4 | data bridge | `데이터의 양에서 권리와 책임까지` |
| 5 | memory bridge | 기존 `문맥은 저장소인가` 보강 |
| 6 | encoding owner | `문자 인코딩과 정규화` |
| 7 | authority bridge | `문자에서 실행 권한까지` |
| 8 | safe effects | 기존 `함수 호출과 도구 사용`, `LLM 에이전트` 보강 |
| 9 | realtime owner | `실시간 멀티모달 상호작용` |
| 10 | realtime bridge | `텍스트 모델에서 실시간 멀티모달 시스템까지` |
| 11 | integration | `LLM 시스템 경계 확장 지도`와 기존 허브 통합 |

## 4. 문서 책임

- 에너지 owner는 W/J, GPU·node·서비스 측정 경계, prefill·decode, idle·retry, `J/good-request`를 완전 설명한다. 탄소는 grid mix, 시간, 지역, 시설·내재 탄소 근거가 없으면 에너지와 혼동하지 않는다.
- 데이터 owner는 snapshot, 수집 조건, 동의·license 상태, 주석·번역 노동, 정제, sampling, 공개, 정정·철회, downstream lineage를 하나의 장부로 연결한다. 법률 결론 대신 관할·시점·문서화된 조건·unknown을 구분한다.
- 메모리 연결은 HBM·KV cache·RAG index·event log·parametric memory를 물리 위치, 수명, 갱신, provenance, 실패·복구 보장으로 비교한다.
- 문자 owner는 byte, UTF-8, Unicode code point, grapheme cluster, normalization, tokenizer를 구분한다. 권한 연결은 byte에서 JSON·schema·의미 검증·authorization까지의 관문을 분리한다.
- 안전한 외부 효과는 `proposed → structurally validated → semantically validated → authorized → confirmed → committed / failed / unknown` 상태 기계, idempotency, partial failure, compensation, postcondition, audit를 기존 owner에 보강한다.
- 실시간 멀티모달 owner는 architecture가 아니라 media clock, frame·chunk, buffer, turn detection, incremental output, A/V sync, interrupt·cancel, backpressure, full-duplex와 복구를 소유한다.

## 5. 품질과 Git 경계

- 신규 concept는 `verification: verified`가 되려면 핵심 주장을 직접 확인할 locator가 있어야 한다. 횡단 analysis는 기본 `verification: partial`로 시작한다.
- `raw/`, 정규 source 번호, `C:\Vault\CS_Wiki`, 기존 첨부 파일은 수정하거나 staging하지 않는다.
- CS_Wiki는 읽기와 맥락 링크에만 사용하고, LLM Wiki의 evidence 레지스트리에는 독립적인 1차 자료와 locator를 등록한다.
- 각 공개 배치는 `learning:audit`, `sync:index`, `boundary:check`, `history:check`, `math:check`, `learning:audit:check`, `verify`, `git diff --check`, desktop·390×844 시각 검수를 통과한다.
- 배치별 commit은 원장에 선언된 메시지를 정확히 사용하고 `main`에서 `origin/main`으로 push한다.
